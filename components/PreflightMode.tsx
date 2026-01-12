
import React, { useState, useEffect } from 'react';
import type { StudyFacts, GeneratedProtocol } from '../types';
import { PREFLIGHT_QUESTIONS, LOADING_MESSAGES } from '../constants';
import { generateProtocolContent } from '../services/geminiService';
import ProtocolViewer from './ProtocolViewer';

interface PreflightModeProps {
  facts: StudyFacts;
  setFacts: React.Dispatch<React.SetStateAction<StudyFacts>>;
  setReadinessScore: (score: number) => void;
}

const PreflightMode: React.FC<PreflightModeProps> = ({ facts, setFacts, setReadinessScore }) => {
  const [step, setStep] = useState<'questions' | 'review'>('questions');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [protocol, setProtocol] = useState<GeneratedProtocol | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  const currentQ = PREFLIGHT_QUESTIONS[currentQIndex];

  // Cycle loading messages
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isLoading) {
        interval = setInterval(() => {
            setLoadingMsgIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
        }, 4000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleAnswer = (value: any) => {
    const updatedFacts = { ...facts, [currentQ.id]: value };
    setFacts(updatedFacts);
    
    // Update Score
    const answeredCount = Object.values(updatedFacts).filter(v => 
        Array.isArray(v) ? v.length > 0 : !!v
    ).length;
    const totalQuestions = PREFLIGHT_QUESTIONS.length;
    setReadinessScore(Math.round((answeredCount / totalQuestions) * 50)); // First 50% is answering
  };

  const nextQuestion = () => {
    if (currentQIndex < PREFLIGHT_QUESTIONS.length - 1) {
      setCurrentQIndex(c => c + 1);
    } else {
      handleAnalyze();
    }
  };

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setStep('review'); // Move to review immediately while loading
    
    try {
        const result = await generateProtocolContent(facts);
        setProtocol(result);
        setReadinessScore(100);
    } catch (e) {
        console.error(e);
        setError("The AI analysis timed out or encountered an error. This sometimes happens during high traffic or with complex protocols.");
    } finally {
        setIsLoading(false);
    }
  };

  // --- Views ---

  if (step === 'questions') {
    return (
      <div className="max-w-2xl mx-auto py-12 animate-fadeIn">
        <div className="mb-8">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Question {currentQIndex + 1} of {PREFLIGHT_QUESTIONS.length}</span>
            <h2 className="text-3xl font-bold text-slate-900 mt-2">{currentQ.text}</h2>
            {currentQ.subText && <p className="text-slate-500 mt-2">{currentQ.subText}</p>}
        </div>

        <div className="mb-12">
            {currentQ.type === 'text' && (
                <input 
                    type="text" 
                    className="w-full text-xl p-4 border-b-2 border-slate-200 focus:border-[#1E407C] outline-none bg-transparent transition-colors placeholder-slate-300"
                    placeholder={currentQ.placeholder}
                    value={facts[currentQ.id] as string || ''}
                    onChange={(e) => handleAnswer(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && nextQuestion()}
                />
            )}

            {currentQ.type === 'select' && currentQ.options && (
                <div className="grid gap-3">
                    {currentQ.options.map(opt => (
                        <button
                            key={opt}
                            onClick={() => { handleAnswer(opt); setTimeout(nextQuestion, 200); }}
                            className={`p-4 text-left rounded-xl border transition-all ${
                                facts[currentQ.id] === opt 
                                ? 'bg-[#1E407C] text-white border-[#1E407C] shadow-md' 
                                : 'bg-white border-slate-200 hover:border-[#1E407C] text-slate-700'
                            }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            )}

            {currentQ.type === 'multi-select' && currentQ.options && (
                <div className="grid gap-3">
                    {currentQ.options.map(opt => {
                        const currentArr = (facts[currentQ.id] as string[]) || [];
                        const isSelected = currentArr.includes(opt);
                        return (
                            <button
                                key={opt}
                                onClick={() => {
                                    const newArr = isSelected 
                                        ? currentArr.filter(i => i !== opt)
                                        : [...currentArr, opt];
                                    handleAnswer(newArr);
                                }}
                                className={`p-4 text-left rounded-xl border transition-all flex justify-between items-center ${
                                    isSelected
                                    ? 'bg-blue-50 border-blue-500 text-blue-900' 
                                    : 'bg-white border-slate-200 hover:border-slate-400 text-slate-700'
                                }`}
                            >
                                {opt}
                                {isSelected && <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>

        <div className="flex justify-between items-center">
            <button 
                onClick={() => setCurrentQIndex(c => Math.max(0, c - 1))}
                disabled={currentQIndex === 0}
                className="text-slate-400 hover:text-slate-600 font-bold disabled:opacity-30"
            >
                Back
            </button>
            <button 
                onClick={nextQuestion}
                className="bg-[#1E407C] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-[#153060] transition-transform active:scale-95"
            >
                {currentQIndex === PREFLIGHT_QUESTIONS.length - 1 ? 'Analyze Protocol' : 'Next Question'}
            </button>
        </div>
      </div>
    );
  }

  // --- Review / Result View ---

  if (step === 'review') {
      if (isLoading) {
          return (
              <div className="flex flex-col items-center justify-center h-full py-20 animate-fadeIn">
                  <div className="w-16 h-16 border-4 border-slate-200 border-t-[#1E407C] rounded-full animate-spin mb-6"></div>
                  <h3 className="text-xl font-bold text-slate-800 transition-all duration-500 min-h-[1.75rem]">
                    {LOADING_MESSAGES[loadingMsgIndex]}
                  </h3>
                  <p className="text-slate-500 mt-2 max-w-sm text-center">
                    This deep analysis may take 30-60 seconds. <br/> We are generating HRP-591 specific language for you.
                  </p>
              </div>
          );
      }

      if (error) {
          return (
              <div className="flex flex-col items-center justify-center h-full py-20 animate-fadeIn">
                   <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                   </div>
                   <h3 className="text-xl font-bold text-slate-800 mb-2">Analysis Failed</h3>
                   <p className="text-slate-500 mb-8 max-w-md text-center">{error}</p>
                   <button 
                        onClick={handleAnalyze}
                        className="bg-[#1E407C] text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-[#153060] transition-colors"
                   >
                        Try Again
                   </button>
              </div>
          );
      }

      if (!protocol) return null;

      // Use the dedicated Protocol Viewer Component
      return <ProtocolViewer protocol={protocol} />;
  }

  return null;
};

export default PreflightMode;
