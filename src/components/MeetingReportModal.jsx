import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, ChevronLeft, Copy, Check, Sparkles, RefreshCw } from 'lucide-react';
import { getReportSections } from '../utils/reportQuestions';
import { generateMalayalamReport } from '../utils/malayalamReport';
import './MeetingReportModal.css';

/**
 * Optional "Generate Meeting Report" flow.
 *
 * Self-contained: it only READS the meeting/halqa data it is handed and calls
 * `onPersist` (best-effort) once a report has been generated. It never mutates
 * the tracker's own form state.
 */
const MeetingReportModal = ({
    halqa,
    meeting,
    weekNumber,
    agendaStatus,
    customAgendas,
    initialAnswers,
    onPersist,
    onClose
}) => {
    const [step, setStep] = useState('questions'); // 'questions' | 'preview'
    const [answers, setAnswers] = useState(() => ({ ...(initialAnswers || {}) }));
    const [reportText, setReportText] = useState('');
    const [copied, setCopied] = useState(false);
    const textareaRef = useRef(null);

    const sections = useMemo(
        () => getReportSections(weekNumber, agendaStatus, customAgendas),
        [weekNumber, agendaStatus, customAgendas]
    );

    const attendanceCount = useMemo(
        () => Object.values((meeting && meeting.attendance) || {}).filter(Boolean).length,
        [meeting]
    );

    const conductedLabels = useMemo(() => {
        const custom = (customAgendas || [])
            .filter(item => agendaStatus && agendaStatus[item.id])
            .map(item => item.label);
        return custom;
    }, [customAgendas, agendaStatus]);

    useEffect(() => {
        if (copied) {
            const timer = setTimeout(() => setCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [copied]);

    const setAnswer = (id, value) => {
        setAnswers(prev => ({ ...prev, [id]: value }));
    };

    const buildReport = () => generateMalayalamReport({
        halqa,
        meeting,
        weekNumber,
        agendaStatus,
        customAgendas,
        answers
    });

    const handleGenerate = () => {
        const text = buildReport();
        setReportText(text);
        setStep('preview');
        if (onPersist) onPersist(answers);
    };

    const handleRegenerate = () => {
        setReportText(buildReport());
    };

    const handleCopy = async () => {
        const text = reportText;
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else if (textareaRef.current) {
                // Fallback for non-secure contexts / older browsers
                textareaRef.current.select();
                document.execCommand('copy');
                textareaRef.current.setSelectionRange(0, 0);
                textareaRef.current.blur();
            }
            setCopied(true);
        } catch (err) {
            console.error('Copy failed', err);
            alert('Could not copy automatically. Please select the text and copy manually.');
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                className="mrm-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="mrm-panel"
                    initial={{ opacity: 0, y: 24, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 24, scale: 0.98 }}
                    transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="mrm-head">
                        <div className="mrm-head-text">
                            <h2>
                                <FileText size={18} />
                                {step === 'questions' ? 'Generate Meeting Report' : 'Meeting Report'}
                            </h2>
                            <p className="mrm-sub">{halqa?.name}</p>
                        </div>
                        <button className="mrm-close" onClick={onClose} title="Close">
                            <X size={18} />
                        </button>
                    </div>

                    {step === 'questions' && (
                        <>
                            <div className="mrm-body">
                                <div className="mrm-known">
                                    <span className="mrm-known-title">Taken from the tracker</span>
                                    <div className="mrm-chips">
                                        <span className="mrm-chip">{meeting?.week_start_date}</span>
                                        <span className="mrm-chip">
                                            Attendance: {attendanceCount}/{halqa?.members?.length || 0}
                                        </span>
                                        {conductedLabels.map(label => (
                                            <span className="mrm-chip" key={label}>{label}</span>
                                        ))}
                                    </div>
                                    <p className="mrm-hint">
                                        Only the details missing from the tracker are asked below, based on
                                        the Halqa category and the agenda items marked as conducted.
                                        Every question is optional &mdash; anything you leave blank is left
                                        out of the report.
                                    </p>
                                </div>

                                {sections.map(section => (
                                    <div className="mrm-section" key={section.id}>
                                        <h3 className="mrm-section-title">{section.title}</h3>
                                        {section.questions.map(question => (
                                            <div className="mrm-field" key={question.id}>
                                                <label htmlFor={`mrm-${question.id}`}>{question.label}</label>
                                                {question.multiline ? (
                                                    <textarea
                                                        id={`mrm-${question.id}`}
                                                        rows={3}
                                                        placeholder={question.placeholder}
                                                        value={answers[question.id] || ''}
                                                        onChange={(e) => setAnswer(question.id, e.target.value)}
                                                    />
                                                ) : (
                                                    <input
                                                        id={`mrm-${question.id}`}
                                                        type="text"
                                                        placeholder={question.placeholder}
                                                        value={answers[question.id] || ''}
                                                        onChange={(e) => setAnswer(question.id, e.target.value)}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>

                            <div className="mrm-foot">
                                <button className="mrm-btn-ghost" onClick={onClose}>Cancel</button>
                                <button className="mrm-btn-primary" onClick={handleGenerate}>
                                    <Sparkles size={16} /> Generate Report
                                </button>
                            </div>
                        </>
                    )}

                    {step === 'preview' && (
                        <>
                            <div className="mrm-body">
                                <p className="mrm-hint mrm-hint-top">
                                    Review and edit the report if needed, then copy it.
                                </p>
                                <textarea
                                    ref={textareaRef}
                                    className="mrm-report"
                                    value={reportText}
                                    onChange={(e) => setReportText(e.target.value)}
                                    spellCheck={false}
                                />
                            </div>

                            <div className="mrm-foot">
                                <button className="mrm-btn-ghost" onClick={() => setStep('questions')}>
                                    <ChevronLeft size={16} /> Back to questions
                                </button>
                                <div className="mrm-foot-right">
                                    <button className="mrm-btn-ghost" onClick={handleRegenerate} title="Rebuild from answers">
                                        <RefreshCw size={16} /> Regenerate
                                    </button>
                                    <button className="mrm-btn-primary" onClick={handleCopy}>
                                        {copied ? <Check size={16} /> : <Copy size={16} />}
                                        {copied ? 'Copied' : 'Copy Report'}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default MeetingReportModal;
