
import React, { useState } from 'react';
import type { LearningObjective } from '../types';

interface ObjectiveSelectorProps {
  objectives: LearningObjective[];
  selectedObjectives: LearningObjective[];
  onToggle: (objective: LearningObjective) => void;
  useCustom: boolean;
  setUseCustom: (val: boolean) => void;
  customText: string;
  setCustomText: (val: string) => void;
}

const ObjectiveSelector: React.FC<ObjectiveSelectorProps> = ({ 
  objectives, 
  selectedObjectives, 
  onToggle,
  useCustom,
  setUseCustom,
  customText,
  setCustomText
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleDescription = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setExpandedIds(newSet);
  };

  return (
    <div className="space-y-4">
        {/* Toggle Mode */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button
                onClick={() => setUseCustom(false)}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${!useCustom ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Penn State Gen Ed
            </button>
            <button
                onClick={() => setUseCustom(true)}
                className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${useCustom ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Program Objectives
            </button>
        </div>

      {!useCustom ? (
          <div className="space-y-4">
            {objectives.map(objective => {
                const isSelected = selectedObjectives.some(o => o.id === objective.id);
                const isExpanded = expandedIds.has(objective.id);
                
                return (
                <div
                    key={objective.id}
                    onClick={() => onToggle(objective)}
                    className={`relative rounded-xl cursor-pointer transition-all duration-200 group border shadow-sm ${
                    isSelected
                        ? 'bg-blue-50/50 border-blue-200'
                        : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                >
                    <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center">
                        <div
                        className={`w-6 h-6 mr-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-all ${
                            isSelected ? 'bg-blue-600 border-blue-600 scale-110' : 'border-slate-300 bg-white group-hover:border-blue-400'
                        }`}
                        >
                        {isSelected && (
                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                            </svg>
                        )}
                        </div>
                        <span className={`font-semibold text-base ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                        {objective.title}
                        </span>
                    </div>
                    
                    <button 
                        onClick={(e) => toggleDescription(e, objective.id)}
                        className="p-2 rounded-full hover:bg-slate-200/50 text-slate-400 hover:text-blue-600 transition-colors focus:outline-none"
                        title="View Definition"
                    >
                        <svg 
                        className={`w-5 h-5 transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7 7" />
                        </svg>
                    </button>
                    </div>

                    {isExpanded && (
                    <div className="px-5 pb-5 pt-0 animate-fadeIn">
                        <div className={`text-sm leading-relaxed p-4 rounded-lg ${isSelected ? 'bg-blue-100/50 text-blue-900' : 'bg-slate-100 text-slate-600'}`}>
                        {objective.description}
                        </div>
                    </div>
                    )}
                </div>
                );
            })}
        </div>
      ) : (
          <div className="animate-fadeIn">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                  Custom Program Learning Objectives (PLOs)
              </label>
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Paste your specific Program Learning Objectives here..."
                className="w-full h-80 p-5 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 resize-none text-base text-slate-900 placeholder-slate-400 leading-relaxed shadow-sm"
              />
              <p className="mt-3 text-sm text-slate-500">
                  The AI will design assignments and rubrics specifically aligned to these custom objectives instead of the standard Gen Ed categories.
              </p>
          </div>
      )}
    </div>
  );
};

export default ObjectiveSelector;
