import { createClient } from '@supabase/supabase-js';
import { AREAS, MOCK_HALQAS } from './data/mockData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// In-Memory Mock Database State
// We pre-seed it with the mock data so the UI is populated immediately.
const db = {
    areas: [...AREAS.map(a => ({ ...a, id: a.id || crypto.randomUUID() }))],
    // Transform mock halqas properties to match DB schema (camelCase -> snake_case if needed, but here we kept them simple mostly)
    // Actually our Schema uses snake_case: area_id, meeting_day
    // Our mock data uses camelCase: areaId, meetingDay
    // We need to transform them for the Mock DB to behave like the Real DB!
    halqas: MOCK_HALQAS.map(h => ({
        id: h.id || crypto.randomUUID(),
        area_id: h.areaId,
        name: h.name,
        meeting_day: h.meetingDay,
        members: h.members
    })),
    meetings: []
};

const createMockClient = () => {
    console.warn('Supabase credentials missing. Using In-Memory Mock Database.');

    return {
        from: (table) => {
            let queryData = db[table] || [];
            let error = null;
            let singleResult = false;
            let updatesToApply = null;

            const chain = {
                select: (columns = '*') => {
                    return chain;
                },
                eq: (column, value) => {
                    // Filter based on column equality
                    queryData = queryData.filter(row => row[column] === value);
                    return chain;
                },
                insert: (rows) => {
                    const newRows = rows.map(r => ({ ...r, id: r.id || crypto.randomUUID() }));
                    // If creating halqas, we might need to be careful about snake_case?
                    // The app sends what it sends.
                    db[table].push(...newRows);
                    queryData = newRows;
                    return chain;
                },
                update: (updates) => {
                    updatesToApply = updates;
                    return chain;
                },
                single: () => {
                    singleResult = true;
                    return chain;
                },
                then: (resolve) => {
                    // Simulate Async Delay
                    setTimeout(() => {
                        if (updatesToApply) {
                            // Update rows in the MAIN db that match the 'eq' filter (which narrowed down queryData)
                            // queryData contains references to the objects in db[table].
                            // So modifying queryData rows modifies the DB.
                            queryData.forEach(row => {
                                Object.assign(row, updatesToApply);
                            });
                            // Return the updated data
                        }

                        const data = singleResult ? (queryData[0] || null) : queryData;

                        // If single expect one but got none, SB returns error usually? 
                        // Or null data.
                        resolve({ data, error });
                    }, 50);
                }
            };

            // Should also support await directly
            chain.then = (resolve, reject) => {
                setTimeout(() => {
                    if (updatesToApply) {
                        queryData.forEach(row => {
                            Object.assign(row, updatesToApply);
                        });
                    }
                    const data = singleResult ? (queryData[0] || null) : queryData;
                    resolve({ data, error });
                }, 50);
            };

            return chain;
        }
    };
};

// Use real client if keys exist, otherwise mock
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createMockClient();
