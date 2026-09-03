// Malayalam Halqa meeting report generator.
//
// Turns the tracker's existing meeting data + the optional descriptive answers
// into a natural, narrative Malayalam report — never a Q&A dump or a bullet
// list. Anything the user left blank is simply omitted; nothing is invented.

import { CATEGORY_AGENDA_ID, customAgendaQuestionId } from './reportQuestions';

export const HALQA_MEETING_NAMES_ML = {
    1: 'തസ്കിയ ഹൽഖ',
    2: 'പ്രസ്ഥാന ഹൽഖ',
    3: 'പൊതു ഹൽഖ',
    4: 'തഹ്‌രീകി ഹൽഖ',
    5: 'സർഗ ഹൽഖ'
};

const MONTHS_ML = [
    'ജനുവരി', 'ഫെബ്രുവരി', 'മാർച്ച്', 'ഏപ്രിൽ', 'മെയ്', 'ജൂൺ',
    'ജൂലൈ', 'ഓഗസ്റ്റ്', 'സെപ്റ്റംബർ', 'ഒക്ടോബർ', 'നവംബർ', 'ഡിസംബർ'
];

/* ------------------------------------------------------------------ */
/* Text helpers                                                        */
/* ------------------------------------------------------------------ */

const clean = (value) => String(value ?? '').replace(/\r/g, '').trim();

// Light-touch tidy-up: collapse runs of spaces and stray duplicate punctuation.
// Never alters the meaning of what the user typed.
const tidy = (value) =>
    clean(value)
        .replace(/[ \t]+/g, ' ')
        .replace(/\s+([,.;:])/g, '$1')
        .replace(/([,.;:]){2,}/g, '$1');

const stripTrailing = (value) => tidy(value).replace(/[.।;,\s]+$/, '').trim();

const asSentence = (value) => {
    const text = tidy(value);
    if (!text) return '';
    return /[.।!?]$/.test(text) ? text : `${text}.`;
};

// Split a free-text answer into the individual points the user meant.
const splitPoints = (value) =>
    clean(value)
        .split(/\n+/)
        .map(line => line.replace(/^\s*(?:[-*•●]|\d+[.)])\s*/, '').trim())
        .filter(Boolean);

// Malayalam finite-verb endings: text ending this way is already a complete
// statement, so it must not be embedded inside an "... എന്നിവ" construction.
const FINITE_VERB_END = /(ിച്ചു|ച്ചു|ന്നു|ത്തു|ട്ടു|ായി|ുണ്ട്|ില്ല|ണം)$/;

const isPhraseLike = (text) => {
    const core = stripTrailing(text);
    return core.length <= 70 && !/[.।!?]/.test(core) && !FINITE_VERB_END.test(core);
};

/**
 * Decide how an answer should be woven into the narrative.
 *  - 'phrase' : short label(s) that can be embedded inside a sentence
 *  - 'prose'  : the user already wrote sentences; keep them as they are
 */
const readAnswer = (value) => {
    const points = splitPoints(value);
    if (points.length === 0) return null;

    if (points.every(isPhraseLike)) {
        return { mode: 'phrase', value: points.map(stripTrailing).join(', ') };
    }
    return { mode: 'prose', value: points.map(asSentence).join(' ') };
};

const nameOf = (value) => {
    const first = splitPoints(value)[0];
    return first ? stripTrailing(first) : '';
};

/**
 * Build one sentence from an answer.
 * @param {string} value      raw answer
 * @param {function} phraseTpl  (embeddedList) => sentence
 * @param {function} proseTpl   (sentences)    => sentence(s)
 */
const say = (value, phraseTpl, proseTpl) => {
    const parsed = readAnswer(value);
    if (!parsed) return null;
    return parsed.mode === 'phrase' ? phraseTpl(parsed.value) : proseTpl(parsed.value);
};

const paragraph = (...sentences) => sentences.filter(Boolean).join(' ').trim();

/* ------------------------------------------------------------------ */
/* Date helpers                                                        */
/* ------------------------------------------------------------------ */

const formatWeekMalayalam = (weekStartDate) => {
    if (!weekStartDate) return '';
    const start = new Date(weekStartDate);
    if (Number.isNaN(start.getTime())) return '';

    const day = start.getDate();
    const month = start.getMonth();
    const year = start.getFullYear();

    // The tracker's custom weeks run 1-7, 8-14, 15-21, 22-28, 29-end.
    let endDay;
    if (day <= 7) endDay = 7;
    else if (day <= 14) endDay = 14;
    else if (day <= 21) endDay = 21;
    else if (day <= 28) endDay = 28;
    else endDay = new Date(year, month + 1, 0).getDate();

    return `${year} ${MONTHS_ML[month]} ${day} - ${endDay}`;
};

/* ------------------------------------------------------------------ */
/* Report generation                                                   */
/* ------------------------------------------------------------------ */

const conducted = (agendaStatus, id) => !!(agendaStatus && agendaStatus[id]);

const buildQuranParagraph = (a, agendaStatus) => {
    if (!conducted(agendaStatus, 'quran')) return '';

    const by = nameOf(a.quran_by);
    const opening = by
        ? `${by} നയിച്ച ഖുർആൻ ക്ലാസോടുകൂടിയാണ് യോഗം ആരംഭിച്ചത്.`
        : 'ഖുർആൻ ക്ലാസോടുകൂടിയാണ് യോഗം ആരംഭിച്ചത്.';

    const portion = say(
        a.quran_portion,
        v => `${v} ആയിരുന്നു ക്ലാസിൽ പഠനവിധേയമാക്കിയത്.`,
        v => `ക്ലാസിൽ പഠനവിധേയമാക്കിയ ഭാഗം ഇപ്രകാരമായിരുന്നു. ${v}`
    );

    const topic = say(
        a.quran_topic,
        v => `${v} എന്ന വിഷയമാണ് ക്ലാസിൽ പ്രധാനമായും വിശദീകരിക്കപ്പെട്ടത്.`,
        v => `ക്ലാസിൽ പ്രധാനമായും വിശദീകരിക്കപ്പെട്ടത് ഇവയാണ്. ${v}`
    );

    return paragraph(opening, portion, topic);
};

const buildOpeningParagraph = (a, ctx) => {
    const chair = nameOf(a.chairperson);

    const opening = chair
        ? `${chair} അധ്യക്ഷത വഹിച്ച ${ctx.categoryMl} യോഗം ചേർന്നു.`
        : `${ctx.categoryMl} യോഗം ചേർന്നു.`;

    let attendance = null;
    if (ctx.totalMembers > 0 && ctx.presentCount > 0) {
        attendance = `ആകെ ${ctx.totalMembers} അംഗങ്ങളിൽ ${ctx.presentCount} പേർ യോഗത്തിൽ പങ്കെടുത്തു.`;
    }

    return paragraph(opening, attendance);
};

const buildAamugamParagraph = (a, agendaStatus) => {
    if (!conducted(agendaStatus, 'aamugam')) return '';

    const points = say(
        a.aamugam_points,
        v => `തുടർന്ന് നടന്ന ആമുഖ പ്രഭാഷണത്തിൽ ${v} എന്നീ കാര്യങ്ങൾ ഊന്നിപ്പറഞ്ഞു.`,
        v => `തുടർന്ന് ആമുഖ പ്രഭാഷണം നടന്നു. ${v}`
    );

    return points || 'തുടർന്ന് ആമുഖ പ്രഭാഷണം നടന്നു.';
};

const buildReportParagraph = (a, agendaStatus) => {
    if (!conducted(agendaStatus, 'report')) return '';

    const by = nameOf(a.report_by);
    const presented = by
        ? `${by} കഴിഞ്ഞ യോഗത്തിന്റെ റിപ്പോർട്ട് അവതരിപ്പിച്ചു.`
        : 'അതിനുശേഷം കഴിഞ്ഞ യോഗത്തിന്റെ റിപ്പോർട്ട് അവതരിപ്പിക്കപ്പെട്ടു.';

    const additions = say(
        a.report_additions,
        v => `റിപ്പോർട്ടിനോട് ചേർത്ത് ${v} എന്നീ കാര്യങ്ങൾ കൂടി ഉന്നയിക്കപ്പെട്ടു.`,
        v => `റിപ്പോർട്ടിന്മേൽ നടന്ന ചർച്ചയിൽ താഴെ പറയുന്ന കാര്യങ്ങൾ കൂടി ഉന്നയിക്കപ്പെട്ടു. ${v}`
    );

    return paragraph(presented, additions);
};

const buildCategoryParagraph = (a, weekNumber, agendaStatus) => {
    const agendaId = CATEGORY_AGENDA_ID[weekNumber];
    if (!agendaId || !conducted(agendaStatus, agendaId)) return '';

    if (weekNumber === 1) {
        const by = nameOf(a.thazkiya_by);
        const opening = by
            ? `പിന്നീട് ${by} നയിച്ച തസ്കിയ ക്ലാസ് നടന്നു.`
            : 'പിന്നീട് തസ്കിയ ക്ലാസ് നടന്നു.';
        const topic = say(
            a.thazkiya_topic,
            v => `${v} എന്നതായിരുന്നു ക്ലാസിന്റെ വിഷയം.`,
            v => `ക്ലാസിൽ ചർച്ച ചെയ്ത കാര്യങ്ങൾ ഇവയാണ്. ${v}`
        );
        return paragraph(opening, topic);
    }

    if (weekNumber === 2) {
        const by = nameOf(a.prasthanam_by);
        const opening = by
            ? `പിന്നീട് ${by} നയിച്ച പ്രസ്ഥാന പഠന ക്ലാസ് നടന്നു.`
            : 'പിന്നീട് പ്രസ്ഥാന പഠന ക്ലാസ് നടന്നു.';
        const topic = say(
            a.prasthanam_topic,
            v => `${v} എന്നതായിരുന്നു ക്ലാസിന്റെ വിഷയം.`,
            v => `ക്ലാസിന്റെ വിഷയം ഇപ്രകാരമായിരുന്നു. ${v}`
        );
        const points = say(
            a.prasthanam_points,
            v => `${v} എന്നീ കാര്യങ്ങൾ ക്ലാസിൽ പ്രധാനമായും ചർച്ച ചെയ്യപ്പെട്ടു.`,
            v => `ക്ലാസിൽ പ്രധാനമായും ചർച്ച ചെയ്യപ്പെട്ട കാര്യങ്ങൾ ഇവയാണ്. ${v}`
        );
        return paragraph(opening, topic, points);
    }

    if (weekNumber === 3) {
        const by = nameOf(a.pothu_by);
        const opening = by
            ? `പിന്നീട് ${by} നയിച്ച പൊതു ക്ലാസ് നടന്നു.`
            : 'പിന്നീട് പൊതു ക്ലാസ് നടന്നു.';
        const topic = say(
            a.pothu_topic,
            v => `${v} എന്നതായിരുന്നു ക്ലാസിന്റെ വിഷയം.`,
            v => `ക്ലാസിന്റെ വിഷയം ഇപ്രകാരമായിരുന്നു. ${v}`
        );
        const points = say(
            a.pothu_points,
            v => `${v} എന്നീ കാര്യങ്ങൾ ക്ലാസിൽ പ്രധാനമായും ചർച്ച ചെയ്യപ്പെട്ടു.`,
            v => `ക്ലാസിൽ പ്രധാനമായും ചർച്ച ചെയ്യപ്പെട്ട കാര്യങ്ങൾ ഇവയാണ്. ${v}`
        );
        return paragraph(opening, topic, points);
    }

    if (weekNumber === 4) {
        const opening = 'പിന്നീട് വിവിധ വിഭാഗങ്ങളുടെയും ഡിപ്പാർട്ട്മെന്റുകളുടെയും പ്രവർത്തന വിലയിരുത്തൽ നടന്നു.';
        const updates = say(
            a.wing_updates,
            v => `${v} എന്നീ വിഭാഗങ്ങളുടെ പ്രവർത്തന വിവരങ്ങൾ യോഗത്തിൽ അവതരിപ്പിക്കപ്പെട്ടു.`,
            v => `വിഭാഗങ്ങൾ അവതരിപ്പിച്ച പ്രവർത്തന വിവരങ്ങൾ ഇപ്രകാരമാണ്. ${v}`
        );
        const programmes = say(
            a.wing_programmes,
            v => `${v} എന്നീ പരിപാടികളെക്കുറിച്ചും പ്രവർത്തനങ്ങളെക്കുറിച്ചും യോഗം ചർച്ച ചെയ്തു.`,
            v => `പരിപാടികളെയും പ്രവർത്തനങ്ങളെയും സംബന്ധിച്ച് നടന്ന ചർച്ച ഇപ്രകാരമാണ്. ${v}`
        );
        const decisions = say(
            a.wing_decisions,
            v => `${v} എന്നീ തീരുമാനങ്ങൾ യോഗം കൈക്കൊണ്ടു.`,
            v => `യോഗം കൈക്കൊണ്ട തീരുമാനങ്ങൾ ഇവയാണ്. ${v}`
        );
        return paragraph(opening, updates, programmes, decisions);
    }

    if (weekNumber === 5) {
        const opening = 'പിന്നീട് സർഗ പരിപാടികളെ സംബന്ധിച്ചുള്ള ചർച്ച നടന്നു.';
        const programmes = say(
            a.sargga_programmes,
            v => `${v} എന്നീ സർഗ പരിപാടികളാണ് പ്രധാനമായും ചർച്ചയ്ക്ക് വിധേയമായത്.`,
            v => `ചർച്ചയ്ക്ക് വിധേയമായ സർഗ പരിപാടികൾ ഇവയാണ്. ${v}`
        );
        const updates = say(
            a.sargga_updates,
            v => `${v} എന്നീ പരിപാടികളുടെ പുരോഗതി യോഗത്തിൽ അവതരിപ്പിക്കപ്പെട്ടു.`,
            v => `പരിപാടികളുടെ പുരോഗതി സംബന്ധിച്ച വിവരങ്ങൾ ഇപ്രകാരമാണ്. ${v}`
        );
        const decisions = say(
            a.sargga_decisions,
            v => `${v} എന്നീ തീരുമാനങ്ങൾ യോഗം കൈക്കൊണ്ടു.`,
            v => `യോഗം കൈക്കൊണ്ട തീരുമാനങ്ങൾ ഇവയാണ്. ${v}`
        );
        return paragraph(opening, programmes, updates, decisions);
    }

    return '';
};

const buildTargetEvalParagraph = (a, weekNumber, agendaStatus) => {
    if (weekNumber !== 1 || !conducted(agendaStatus, 'target_eval')) return '';

    const notes = say(
        a.target_eval_notes,
        v => `മീഖാത്തി മൻസൂബ ടാർഗറ്റ് വിലയിരുത്തലിൽ ${v} എന്നിവ പരിശോധിക്കപ്പെട്ടു.`,
        v => `ഇതിനുശേഷം മീഖാത്തി മൻസൂബ ടാർഗറ്റ് വിലയിരുത്തൽ നടന്നു. ${v}`
    );

    return notes || 'ഇതിനുശേഷം മീഖാത്തി മൻസൂബ ടാർഗറ്റ് വിലയിരുത്തൽ നടന്നു.';
};

const buildCustomAgendaParagraph = (a, agendaStatus, customAgendas) => {
    const sentences = (customAgendas || [])
        .filter(item => conducted(agendaStatus, item.id))
        .map(item => {
            const label = stripTrailing(item.label);
            const answer = say(
                a[customAgendaQuestionId(item.id)],
                v => `${label} എന്ന വിഷയത്തിൽ നടന്ന ചർച്ചയിൽ ${v} എന്നിവ ഉയർന്നുവന്നു.`,
                v => `${label} എന്ന വിഷയവും യോഗം ചർച്ച ചെയ്തു. ${v}`
            );
            return answer || `${label} എന്ന വിഷയവും യോഗം ചർച്ച ചെയ്തു.`;
        });

    return paragraph(...sentences);
};

const buildDiscussionParagraph = (a, agendaStatus) => {
    if (!conducted(agendaStatus, 'discussion')) return '';

    const points = say(
        a.discussion_points,
        v => `തുടർന്ന് നടന്ന പൊതു ചർച്ചയിൽ ${v} എന്നീ വിഷയങ്ങൾ ഉയർന്നുവന്നു.`,
        v => `തുടർന്ന് പൊതു ചർച്ച നടന്നു. ${v}`
    );
    const decisions = say(
        a.decisions,
        v => `${v} എന്നീ തീരുമാനങ്ങൾ യോഗം കൈക്കൊണ്ടു.`,
        v => `യോഗം കൈക്കൊണ്ട തീരുമാനങ്ങൾ ഇവയാണ്. ${v}`
    );
    const updates = say(
        a.programme_updates,
        v => `വരാനിരിക്കുന്ന പരിപാടികളുമായി ബന്ധപ്പെട്ട് ${v} എന്നിവ യോഗത്തിൽ അവതരിപ്പിക്കപ്പെട്ടു.`,
        v => `വരാനിരിക്കുന്ന പരിപാടികളെ സംബന്ധിച്ച വിവരങ്ങൾ ഇപ്രകാരമാണ്. ${v}`
    );

    const body = paragraph(points || 'തുടർന്ന് പൊതു ചർച്ച നടന്നു.', decisions, updates);
    return body;
};

const buildClosingParagraph = (a, agendaStatus) => {
    if (!conducted(agendaStatus, 'ulbodanam')) return '';

    const by = nameOf(a.ulbodanam_by);
    const points = say(
        a.ulbodanam_points,
        v => `${v} എന്നീ കാര്യങ്ങൾ ഉദ്ബോധനത്തിൽ ഓർമ്മപ്പെടുത്തി.`,
        v => `ഉദ്ബോധനത്തിൽ ഓർമ്മപ്പെടുത്തിയ കാര്യങ്ങൾ ഇവയാണ്. ${v}`
    );

    if (!points) {
        return by
            ? `${by} നിർവഹിച്ച ഉദ്ബോധനത്തോടും പ്രാർഥനയോടും കൂടി യോഗം സമാപിച്ചു.`
            : 'ഉദ്ബോധനത്തോടും പ്രാർഥനയോടും കൂടി യോഗം സമാപിച്ചു.';
    }

    const opening = by
        ? `അവസാനം ${by} ഉദ്ബോധനം നിർവഹിച്ചു.`
        : 'അവസാനം ഉദ്ബോധനം നടന്നു.';

    return paragraph(opening, points, 'പ്രാർഥനയോടെ യോഗം സമാപിച്ചു.');
};

/**
 * Generate the full Malayalam meeting report.
 *
 * @param {object} params
 * @param {object} params.halqa      halqa row (name, members)
 * @param {object} params.meeting    meeting row (week_start_date, attendance, ...)
 * @param {number} params.weekNumber resolved Halqa category (1-5)
 * @param {object} params.agendaStatus
 * @param {Array}  params.customAgendas
 * @param {object} params.answers    { questionId: text }
 * @returns {string} report text ready to copy
 */
export const generateMalayalamReport = ({
    halqa,
    meeting,
    weekNumber,
    agendaStatus,
    customAgendas,
    answers
}) => {
    const a = answers || {};
    const week = HALQA_MEETING_NAMES_ML[weekNumber] ? weekNumber : 1;

    const attendance = (meeting && meeting.attendance) || {};
    const ctx = {
        agendaStatus,
        categoryMl: HALQA_MEETING_NAMES_ML[week],
        totalMembers: halqa && Array.isArray(halqa.members) ? halqa.members.length : 0,
        presentCount: Object.values(attendance).filter(Boolean).length
    };

    const headerLines = [
        halqa && halqa.name ? halqa.name : '',
        HALQA_MEETING_NAMES_ML[week],
        formatWeekMalayalam(meeting && meeting.week_start_date)
    ].filter(Boolean);

    const body = [
        buildOpeningParagraph(a, ctx),
        buildQuranParagraph(a, agendaStatus),
        buildAamugamParagraph(a, agendaStatus),
        buildReportParagraph(a, agendaStatus),
        buildCategoryParagraph(a, week, agendaStatus),
        buildTargetEvalParagraph(a, week, agendaStatus),
        buildCustomAgendaParagraph(a, agendaStatus, customAgendas),
        buildDiscussionParagraph(a, agendaStatus),
        buildClosingParagraph(a, agendaStatus)
    ].filter(Boolean);

    return [headerLines.join('\n'), '', body.join('\n\n')]
        .join('\n')
        .replace(/\n{4,}/g, '\n\n\n')
        .trim();
};
