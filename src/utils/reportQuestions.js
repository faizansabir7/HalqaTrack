// Meeting Report — conditional question definitions
//
// This module is a pure, standalone helper for the OPTIONAL "Generate Meeting
// Report" feature. It does not touch or alter any existing tracker behaviour.
//
// Questions are resolved from data the tracker ALREADY holds:
//   - the Halqa category  (custom_agenda_week / date-derived week number)
//   - the agenda items marked as conducted (meeting.agenda_status)
//   - user-added custom agendas (meeting.custom_agendas)
// Anything already stored (halqa name, date, category, attendance, programmes)
// is never asked again.

// Agenda item that drives each category-specific section, per week number.
export const CATEGORY_AGENDA_ID = {
    1: 'thazkiya',
    2: 'prasthanam',
    3: 'pothu',
    4: 'wing_eval',
    5: 'sargga'
};

const q = (id, label, opts = {}) => ({
    id,
    label,
    placeholder: opts.placeholder || '',
    multiline: opts.multiline !== false // default: multiline
});

// Sections that are common to every Halqa category, each gated by the
// corresponding agenda item being marked as conducted.
const COMMON_SECTIONS = [
    {
        id: 'meeting',
        title: 'Meeting',
        requires: null, // always shown
        questions: [
            q('chairperson', 'Who was the Adhyakshan / chairperson?', {
                placeholder: 'Name of the chairperson',
                multiline: false
            })
        ]
    },
    {
        id: 'quran',
        title: "Qur'an / Hadees Class",
        requires: 'quran',
        questions: [
            q('quran_by', "Who conducted the Qur'an class?", {
                placeholder: 'Name',
                multiline: false
            }),
            q('quran_portion', 'Which Surah and Ayah were covered?', {
                placeholder: 'e.g. Surah Jumu\'ah, Ayah 1-5',
                multiline: false
            }),
            q('quran_topic', 'What was the main topic discussed in the class?', {
                placeholder: 'Main topic / theme'
            })
        ]
    },
    {
        id: 'aamugam',
        title: 'Aamugam (Introductory Speech)',
        requires: 'aamugam',
        questions: [
            q('aamugam_points', 'What were the main points covered in the speech?', {
                placeholder: 'One point per line, or write freely'
            })
        ]
    },
    {
        id: 'report',
        title: 'Report',
        requires: 'report',
        questions: [
            q('report_by', 'Who presented the report?', {
                placeholder: 'Name',
                multiline: false
            }),
            q('report_additions', 'Any additions or important points to be included?', {
                placeholder: 'Additions raised on the report'
            })
        ]
    }
];

// Category-specific sections. Key = week number (Halqa category).
const CATEGORY_SECTIONS = {
    1: [
        {
            id: 'thazkiya',
            title: 'Thazkiya Session',
            requires: 'thazkiya',
            questions: [
                q('thazkiya_by', 'Who conducted the Thazkiya class?', {
                    placeholder: 'Name',
                    multiline: false
                }),
                q('thazkiya_topic', 'What topic was covered?', {
                    placeholder: 'Topic',
                    multiline: false
                })
            ]
        },
        {
            id: 'target_eval',
            title: 'Meekhathi Mansooba Target Evaluation',
            requires: 'target_eval',
            questions: [
                q('target_eval_notes', 'What was evaluated / discussed in the target evaluation?', {
                    placeholder: 'Targets reviewed, progress, gaps'
                })
            ]
        }
    ],
    2: [
        {
            id: 'prasthanam',
            title: 'Prasthanam Padana Session',
            requires: 'prasthanam',
            questions: [
                q('prasthanam_by', 'Who conducted the Prasthana topic class?', {
                    placeholder: 'Name',
                    multiline: false
                }),
                q('prasthanam_topic', 'What topic was covered?', {
                    placeholder: 'Topic',
                    multiline: false
                }),
                q('prasthanam_points', 'What important points were discussed?', {
                    placeholder: 'One point per line, or write freely'
                })
            ]
        }
    ],
    3: [
        {
            id: 'pothu',
            title: 'Pothu Class',
            requires: 'pothu',
            questions: [
                q('pothu_by', 'Who conducted the Pothu class?', {
                    placeholder: 'Name',
                    multiline: false
                }),
                q('pothu_topic', 'What topic was covered?', {
                    placeholder: 'Topic',
                    multiline: false
                }),
                q('pothu_points', 'What were the main points discussed?', {
                    placeholder: 'One point per line, or write freely'
                })
            ]
        }
    ],
    4: [
        {
            id: 'wing_eval',
            title: 'Evaluation of Wings / Departments',
            requires: 'wing_eval',
            questions: [
                q('wing_updates', 'What departmental updates were presented?', {
                    placeholder: 'Updates from each wing / department'
                }),
                q('wing_programmes', 'What programmes or activities were discussed?', {
                    placeholder: 'Programmes / activities'
                }),
                q('wing_decisions', 'What important decisions or follow-up actions were taken?', {
                    placeholder: 'Decisions and follow-ups'
                })
            ]
        }
    ],
    5: [
        {
            id: 'sargga',
            title: 'Sargga Paripadikal',
            requires: 'sargga',
            questions: [
                q('sargga_programmes', 'What Sargga programmes or activities were discussed?', {
                    placeholder: 'Programmes / activities'
                }),
                q('sargga_updates', 'What programme updates were presented?', {
                    placeholder: 'Updates'
                }),
                q('sargga_decisions', 'What decisions or follow-up actions were taken?', {
                    placeholder: 'Decisions and follow-ups'
                })
            ]
        }
    ]
};

// Sections that close out the meeting, shown after the category-specific ones.
const CLOSING_SECTIONS = [
    {
        id: 'discussion',
        title: 'Discussion',
        requires: 'discussion',
        questions: [
            q('discussion_points', 'What were the main discussions in the Halqa?', {
                placeholder: 'One point per line, or write freely'
            }),
            q('decisions', 'What decisions were taken?', {
                placeholder: 'Decisions taken by the meeting'
            }),
            q('programme_updates', 'What programme updates were discussed?', {
                placeholder: 'Upcoming programmes, dates, responsibilities'
            })
        ]
    },
    {
        id: 'ulbodanam',
        title: 'Ulbodanam & Dua',
        requires: 'ulbodanam',
        questions: [
            q('ulbodanam_by', 'Who gave the Udbodhanam?', {
                placeholder: 'Name',
                multiline: false
            }),
            q('ulbodanam_points', 'What were the main points covered in the Udbodhanam?', {
                placeholder: 'One point per line, or write freely'
            })
        ]
    }
];

export const customAgendaQuestionId = (agendaId) => `custom__${agendaId}`;

const isConducted = (agendaStatus, agendaId) => !!(agendaStatus && agendaStatus[agendaId]);

/**
 * Build the list of sections/questions to show for a given meeting.
 *
 * @param {number} weekNumber      Halqa category (1-5)
 * @param {object} agendaStatus    meeting.agenda_status map
 * @param {Array}  customAgendas   meeting.custom_agendas array
 * @returns {Array} sections, each { id, title, questions: [...] }
 */
export const getReportSections = (weekNumber, agendaStatus, customAgendas = []) => {
    const week = CATEGORY_SECTIONS[weekNumber] ? weekNumber : 1;

    const defs = [
        ...COMMON_SECTIONS,
        ...CATEGORY_SECTIONS[week],
        ...CLOSING_SECTIONS
    ];

    const sections = defs
        .filter(s => s.requires === null || isConducted(agendaStatus, s.requires))
        .map(s => ({ id: s.id, title: s.title, questions: s.questions }));

    // One free-text question per custom agenda the user actually marked as done.
    const customQuestions = (customAgendas || [])
        .filter(item => isConducted(agendaStatus, item.id))
        .map(item => q(customAgendaQuestionId(item.id), `What was discussed under "${item.label}"?`, {
            placeholder: 'Details to include in the report'
        }));

    if (customQuestions.length > 0) {
        // Insert additional agenda items just before the closing Discussion block.
        const closingIndex = sections.findIndex(s => s.id === 'discussion');
        const customSection = {
            id: 'custom_agendas',
            title: 'Additional Agenda Items',
            questions: customQuestions
        };
        if (closingIndex === -1) {
            sections.push(customSection);
        } else {
            sections.splice(closingIndex, 0, customSection);
        }
    }

    return sections;
};

/** Flat list of every question id that is currently relevant. */
export const getRelevantQuestionIds = (sections) =>
    sections.reduce((acc, s) => acc.concat(s.questions.map(item => item.id)), []);
