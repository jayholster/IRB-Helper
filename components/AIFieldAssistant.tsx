
import React, { useState } from 'react';
import { refineFieldContent } from '../services/geminiService';

interface AIFieldAssistantProps {
  fieldId: string;
  fieldLabel: string;
  currentValue: string;
  onUpdate: (value: string) => void;
  context: string; // Title or basic study info to help generation
}

const AIFieldAssistant: React.FC<AIFieldAssistantProps> = ({ 
  fieldId, 
  fieldLabel, 
  currentValue, 
  onUpdate,
  context 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'refine' | 'explain'>('refine');
  const [explanation, setExplanation] = useState<string | null>(null);

  const handleAction = async (action: 'improve' | 'expand' | 'fix_grammar' | 'generate_from_scratch') => {
    setIsLoading(true);
    try {
      const result = await refineFieldContent(fieldLabel, currentValue, action, context);
      onUpdate(result);
      setIsOpen(false);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExplain = async () => {
    setIsLoading(true);
    setActiveTab('explain');
    try {
      const result = await refineFieldContent(fieldLabel, "", 'explain', context);
      setExplanation(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative inline-block ml-2 align-middle">
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`p-1 rounded-full transition-all border ${
            isOpen ? 'bg-[#1E407C] text-white border-[#1E407C]' : 'bg-white text-indigo-600 border-indigo-200 hover:border-indigo-400'
        }`}
        title="AI Assistant"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
      </button>

      {isOpen && (
        <div className="absolute left-full top-0 ml-2 z-50 w-72 bg-white rounded-xl shadow-xl border border-slate-200 animate-fadeIn overflow-hidden">
          <div className="flex border-b border-slate-100">
             <button 
                onClick={() => setActiveTab('refine')}
                className={`flex-1 py-2 text-xs font-bold ${activeTab === 'refine' ? 'bg-slate-50 text-[#1E407C]' : 'text-slate-500 hover:bg-slate-50'}`}
             >
                Refine
             </button>
             <button 
                onClick={() => { setActiveTab('explain'); if(!explanation) handleExplain(); }}
                className={`flex-1 py-2 text-xs font-bold ${activeTab === 'explain' ? 'bg-slate-50 text-[#1E407C]' : 'text-slate-500 hover:bg-slate-50'}`}
             >
                Explain
             </button>
          </div>

          <div className="p-3">
             {isLoading ? (
                 <div className="flex justify-center py-4">
                     <div className="w-6 h-6 border-2 border-slate-200 border-t-[#1E407C] rounded-full animate-spin"></div>
                 </div>
             ) : activeTab === 'refine' ? (
                 <div className="space-y-1">
                    <button 
                        onClick={() => handleAction('improve')}
                        className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center"
                    >
                        <span className="mr-2">✨</span> Improve Tone & Clarity
                    </button>
                    <button 
                        onClick={() => handleAction('expand')}
                        className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-blue-50 rounded-lg transition-colors flex items-center"
                    >
                        <span className="mr-2">📝</span> Expand / Add Detail
                    </button>
                    <button 
                         onClick={() => handleAction('generate_from_scratch')}
                         className="w-full text-left px-3 py-2 text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors flex items-center font-semibold"
                    >
                        <span className="mr-2">🚀</span> Draft for Me
                    </button>
                 </div>
             ) : (
                 <div className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2 rounded-lg">
                    {explanation || "Loading definition..."}
                 </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIFieldAssistant;
