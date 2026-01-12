
import React from 'react';
import type { StudyFacts } from '../types';

interface StudyFactsSidebarProps {
  facts: StudyFacts;
  readinessScore: number; // 0 to 100
}

const StudyFactsSidebar: React.FC<StudyFactsSidebarProps> = ({ facts, readinessScore }) => {
  return (
    <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white sticky top-24 overflow-hidden flex flex-col h-[calc(100vh-8rem)] min-h-[600px]">
      
      {/* Header: Readiness Score */}
      <div className="pt-8 px-8 pb-6 bg-white z-10 border-b border-slate-50">
        <h2 className="text-xl font-bold text-[#1d1d1f] mb-4">Study Facts Card</h2>
        
        <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Readiness Score</span>
            <span className={`text-sm font-bold ${readinessScore === 100 ? 'text-green-600' : 'text-[#1E407C]'}`}>{readinessScore}%</span>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
                className={`h-full transition-all duration-700 ease-out ${readinessScore === 100 ? 'bg-green-500' : 'bg-[#1E407C]'}`} 
                style={{ width: `${readinessScore}%` }}
            ></div>
        </div>
      </div>

      {/* Facts List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-6">
        {facts.title ? (
            <div className="group">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Title</label>
                <p className="text-sm font-semibold text-slate-800 leading-snug">{facts.title}</p>
            </div>
        ) : (
            <p className="text-sm text-slate-400 italic">Start answering questions to build your study profile.</p>
        )}

        {facts.population && (
            <div className="group animate-fadeIn">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Population</label>
                <p className="text-sm text-slate-700">{facts.population} (N={facts.sampleSize || '?'})</p>
            </div>
        )}

        {facts.recruitmentMethod && facts.recruitmentMethod.length > 0 && (
            <div className="group animate-fadeIn">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Recruitment</label>
                <div className="flex flex-wrap gap-1">
                    {facts.recruitmentMethod.map(m => (
                        <span key={m} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md">{m}</span>
                    ))}
                </div>
            </div>
        )}

        {facts.procedures && facts.procedures.length > 0 && (
            <div className="group animate-fadeIn">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Procedures</label>
                <ul className="list-disc list-inside text-sm text-slate-700">
                    {facts.procedures.map(p => <li key={p}>{p}</li>)}
                </ul>
            </div>
        )}

        {facts.dataCollection && (
            <div className="group animate-fadeIn">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Data Privacy</label>
                <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                    facts.dataCollection === 'Anonymous' ? 'bg-green-100 text-green-700' : 
                    facts.dataCollection === 'Identifiable' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>
                    {facts.dataCollection}
                </span>
            </div>
        )}
      </div>
      
      <div className="p-4 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 text-center">
          Canonical Truth Source
      </div>
    </div>
  );
};

export default StudyFactsSidebar;
