import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { getWeekDisplay } from '../utils/dateUtils';
import './WeekSelector.css';

const WeekSelector = ({ currentWeekStart, onPrev, onNext, onToday, onDateSelect }) => {
    const handleDateChange = (e) => {
        if (e.target.value) {
            onDateSelect(new Date(e.target.value));
        }
    };

    return (
        <div className="week-selector">
            <button onClick={onPrev} className="week-nav-btn">
                <ChevronLeft size={20} />
            </button>

            <div className="week-display" style={{ cursor: 'pointer' }}>
                <Calendar size={18} className="text-secondary" />
                <span>{getWeekDisplay(currentWeekStart)}</span>

                {/* Hidden Date Input Overlay */}
                <input
                    type="date"
                    onChange={handleDateChange}
                    style={{
                        opacity: 0,
                        position: 'absolute',
                        inset: 0, // Shorthand for top/right/bottom/left: 0
                        width: '100%',
                        height: '100%',
                        cursor: 'pointer',
                        zIndex: 10
                    }}
                />
            </div>

            <button onClick={onNext} className="week-nav-btn">
                <ChevronRight size={20} />
            </button>

            <button onClick={onToday} className="btn-today">
                Today
            </button>
        </div>
    );
};

export default WeekSelector;
