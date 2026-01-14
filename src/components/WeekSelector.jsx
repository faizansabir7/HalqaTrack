import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { getWeekDisplay } from '../utils/dateUtils';
import './WeekSelector.css';

const WeekSelector = ({ currentWeekStart, onPrev, onNext, onToday }) => {
    return (
        <div className="week-selector">
            <button onClick={onPrev} className="week-nav-btn">
                <ChevronLeft size={20} />
            </button>

            <div className="week-display">
                <Calendar size={18} className="text-secondary" />
                <span>{getWeekDisplay(currentWeekStart)}</span>
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
