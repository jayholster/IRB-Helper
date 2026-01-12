
import React from 'react';
import type { AssessmentType, AssignmentDuration } from '../types';

interface AssessmentParamsProps {
  selectedTypes: AssessmentType[];
  onToggleType: (val: AssessmentType) => void;
  duration: AssignmentDuration;
  onDurationChange: (val: AssignmentDuration) => void;
}

const TYPES: AssessmentType[] = [
  'Written', 'Oral/Presentation', 'Multimedia/Creative', 
  'Group Collaboration', 'Exam/Quiz', 'Open to Anything'
];

const DURATIONS: AssignmentDuration[] = [
  'In-Class Activity (15-50 mins)',
  'Short Assignment (Homework / 1 Week)',
  'Major Project / Paper (2-4 Weeks)',
  'Semester-Long Capstone'
];

const AssessmentParams: React.FC<AssessmentParamsProps> = ({ 
  selectedTypes, 
  onToggleType, 
  duration, 
  onDurationChange 
}) => {
  return (
    <div className="space-y-8">
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
          Preferred Formats (Select one or more)
        </label>
        <div className="grid grid-cols-2 gap-3">
          {TYPES.map((t) => {
            const isSelected = selectedTypes.includes(t);
            return (
              <button
                key={t}
                onClick={() => onToggleType(t)}
                className={`px-4 py-4 text-sm font-semibold rounded-xl border transition-all duration-200 text-left flex items-center shadow-sm ${
                  isSelected
                    ? 'bg-blue-50 border-blue-500 text-blue-800 ring-1 ring-blue-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className={`w-5 h-5 mr-3 rounded border flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'
                }`}>
                    {isSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                </div>
                <span className="truncate">{t}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
          Scope & Duration
        </label>
        <div className="space-y-3">
           {DURATIONS.map((d) => (
             <label key={d} className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all duration-200 shadow-sm ${
                duration === d 
                  ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500/20 z-10 relative' 
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
             }`}>
                <div className="relative flex items-center justify-center w-5 h-5 mr-4">
                    <input 
                    type="radio" 
                    name="duration" 
                    value={d} 
                    checked={duration === d} 
                    onChange={() => onDurationChange(d)}
                    className="appearance-none w-5 h-5 border border-slate-300 rounded-full checked:border-blue-600 checked:bg-blue-600 focus:ring-0 transition-colors"
                    />
                    {duration === d && <div className="absolute w-2 h-2 bg-white rounded-full pointer-events-none"></div>}
                </div>
                <span className={`text-base font-medium ${duration === d ? 'text-blue-900' : 'text-slate-700'}`}>
                  {d}
                </span>
             </label>
           ))}
        </div>
      </div>
    </div>
  );
};

export default AssessmentParams;
