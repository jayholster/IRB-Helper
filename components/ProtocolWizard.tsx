
import React, { useState, useRef, useEffect } from 'react';
import type { StudyFacts, GeneratedProtocol, FileData, AppMode } from '../types';
import { WIZARD_STEPS, LOADING_MESSAGES } from '../constants';
import { extractFromDocument, extractSpecificScope, generateProtocolContent } from '../services/geminiService';
import ProtocolViewer from './ProtocolViewer';
import AIFieldAssistant from './AIFieldAssistant';
import HRP591DocumentRenderer from './HRP591DocumentRenderer';

interface ProtocolWizardProps {
  facts: StudyFacts;
  setFacts: React.Dispatch<React.SetStateAction<StudyFacts>>;
  onNavigate?: (mode: AppMode) => void;
}

const ProtocolWizard: React.FC<ProtocolWizardProps> = ({ facts, setFacts, onNavigate }) => {
  const [step, setStep] = useState<number>(-1); // -1 = Upload/Start, 0..N = Wizard Steps, 99 = Generating, 100 = Done
  const [showLiveDoc, setShowLiveDoc] = useState(false);
  
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [protocol, setProtocol] = useState<GeneratedProtocol | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckingDraft, setIsCheckingDraft] = useState(false);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cycle loading messages
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (step === 99 || isProcessing) {
        interval = setInterval(() => {
            setLoadingMsgIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
        }, 3500);
    }
    return () => clearInterval(interval);
  }, [step, isProcessing]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsProcessing(true);
      setError(null);
      
      try {
        const data = await readFile(file);
        setFileData(data); // Store for later "Check Draft" calls
        const extracted = await extractFromDocument(data);
        // Merge extracted facts.
        setFacts(prev => ({ ...prev, ...extracted }));
        setStep(0); // Move to first step of wizard so user can review extracted data
      } catch (err: any) {
        console.error("Extraction Failed", err);
        setError("Could not parse file. The document might be too large or malformed.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleCheckDraft = async () => {
      if (!fileData) return;
      setIsCheckingDraft(true);
      const currentFields = WIZARD_STEPS[step].fields.map(f => f.id as string);
      
      try {
          const updates = await extractSpecificScope(fileData, currentFields);
          setFacts(prev => ({ ...prev, ...updates }));
      } catch (e) {
          console.error("Check Draft Failed", e);
      } finally {
          setIsCheckingDraft(false);
      }
  };

  const readFile = (file: File): Promise<FileData> => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          if (file.type === 'application/pdf') {
              reader.readAsDataURL(file);
              reader.onload = () => resolve({ mimeType: 'application/pdf', data: (reader.result as string).split(',')[1] });
              reader.onerror = (e) => reject(e);
          } else {
              reader.readAsText(file);
              reader.onload = () => resolve({ mimeType: 'text/plain', data: reader.result as string });
              reader.onerror = (e) => reject(e);
          }
      });
  };

  const handleGenerate = async () => {
      setStep(99);
      setError(null);
      try {
          const proto = await generateProtocolContent(facts);
          setProtocol(proto);
          setStep(100);
      } catch (e) {
          console.error(e);
          setError("Generation failed. Please try again.");
          setStep(WIZARD_STEPS.length - 1);
      }
  };

  const updateFact = (id: string, value: any) => {
      setFacts(prev => ({ ...prev, [id]: value }));
  };

  // -- Views --

  if (showLiveDoc) {
      return <HRP591DocumentRenderer facts={facts} onClose={() => setShowLiveDoc(false)} />;
  }

  if (step === -1) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[600px] animate-fadeIn">
            {isProcessing ? (
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-slate-200 border-t-[#1E407C] rounded-full animate-spin mx-auto mb-6"></div>
                    <h3 className="text-xl font-bold text-slate-800">Reading Document...</h3>
                    <p className="text-slate-500 mt-2">Extracting and Inferring study details...</p>
                </div>
            ) : (
                <div className="bg-white p-12 rounded-[2.5rem] shadow-sm border border-slate-200 max-w-2xl w-full text-center">
                    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-[#1E407C]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">HRP-591 Protocol Builder</h2>
                    <p className="text-slate-500 mb-10 leading-relaxed max-w-lg mx-auto">
                        Do you have an existing grant proposal, draft, or notes? 
                        We can extract the details to jumpstart the process.
                    </p>
                    
                    <div className="flex flex-col gap-4 max-w-xs mx-auto">
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-[#1E407C] text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-[#153060] transition-all active:scale-95"
                        >
                            Upload Document
                        </button>
                        <button 
                            onClick={() => setStep(0)}
                            className="text-slate-500 font-bold hover:text-[#1E407C] py-2 transition-colors"
                        >
                            Start from Scratch
                        </button>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.txt" onChange={handleFileUpload} />
                    {error && <p className="text-red-500 mt-4 text-sm">{error}</p>}
                </div>
            )}
        </div>
      );
  }

  if (step === 99) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[600px] animate-fadeIn text-center">
              <div className="w-20 h-20 border-4 border-slate-100 border-t-[#1E407C] rounded-full animate-spin mb-8"></div>
              <h3 className="text-2xl font-bold text-slate-900 transition-all duration-500 min-h-[2rem]">
                 {LOADING_MESSAGES[loadingMsgIndex]}
              </h3>
              <p className="text-slate-500 mt-4 max-w-md mx-auto leading-relaxed">
                 The AI is reviewing your inputs against the HRP-591 requirements and drafting compliant language for all 22 sections.
              </p>
          </div>
      );
  }

  if (step === 100 && protocol) {
      return (
          <div className="relative">
              <ProtocolViewer protocol={protocol} />
              <div className="fixed bottom-8 right-8 z-50 animate-fadeIn flex flex-col gap-4">
                   <button
                     onClick={() => setShowLiveDoc(true)}
                     className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold py-3 px-6 rounded-full shadow-xl flex items-center transform transition-transform hover:scale-105"
                   >
                       <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                       View Form (PDF)
                   </button>
                   {onNavigate && (
                       <button
                         onClick={() => onNavigate('research-tools')}
                         className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 px-8 rounded-full shadow-2xl flex items-center transform transition-transform hover:scale-105"
                       >
                           Draft Research Documents
                           <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                       </button>
                   )}
              </div>
          </div>
      );
  }

  // Wizard Step
  const currentConfig = WIZARD_STEPS[step];
  const isLastStep = step === WIZARD_STEPS.length - 1;
  
  return (
      <div className="max-w-3xl mx-auto py-10 animate-fadeIn relative">
          
          {/* Progress */}
          <div className="mb-10">
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                  <span>Step {step + 1} of {WIZARD_STEPS.length}</span>
                  <span>{currentConfig.title}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                      className="h-full bg-[#1E407C] transition-all duration-500" 
                      style={{ width: `${((step + 1) / WIZARD_STEPS.length) * 100}%` }}
                  ></div>
              </div>
          </div>

          <div className="bg-white rounded-[2rem] p-10 border border-slate-200 shadow-sm mb-8 relative">
              {fileData && (
                  <button 
                    onClick={handleCheckDraft}
                    disabled={isCheckingDraft}
                    className="absolute top-10 right-10 flex items-center text-xs font-bold text-[#1E407C] bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 border border-blue-100"
                  >
                    {isCheckingDraft ? (
                        <>
                            <svg className="animate-spin h-3 w-3 mr-2" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Checking...
                        </>
                    ) : (
                        <>
                            <svg className="w-3 h-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                            Check Draft for Answers
                        </>
                    )}
                  </button>
              )}

              <div className="mb-8">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">{currentConfig.title}</h2>
                  <p className="text-slate-500">{currentConfig.description}</p>
              </div>

              <div className="space-y-8">
                  {currentConfig.fields.map(field => (
                      <div key={field.id} className="group">
                          <div className="flex items-center mb-2">
                            <label className="block text-sm font-bold text-slate-800">
                                {field.label}
                            </label>
                            {(field.type === 'text' || field.type === 'textarea') && (
                                <AIFieldAssistant 
                                    fieldId={field.id}
                                    fieldLabel={field.label}
                                    currentValue={facts[field.id]}
                                    onUpdate={(val) => updateFact(field.id as string, val)}
                                    context={`Study Title: ${facts.protocolTitle || 'Untitled'}.`}
                                />
                            )}
                          </div>
                          
                          {field.helperText && <p className="text-xs text-slate-400 mb-3">{field.helperText}</p>}
                          
                          {field.type === 'text' && (
                              <input 
                                  type="text" 
                                  value={facts[field.id] || ''}
                                  onChange={(e) => updateFact(field.id as string, e.target.value)}
                                  placeholder={field.placeholder}
                                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1E407C]/20 focus:border-[#1E407C] outline-none transition-all"
                              />
                          )}

                          {field.type === 'textarea' && (
                              <textarea 
                                  value={facts[field.id] || ''}
                                  onChange={(e) => updateFact(field.id as string, e.target.value)}
                                  placeholder={field.placeholder}
                                  className="w-full p-4 h-32 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1E407C]/20 focus:border-[#1E407C] outline-none transition-all resize-none"
                              />
                          )}

                          {field.type === 'select' && field.options && (
                              <div className="grid gap-2">
                                  {field.options.map(opt => (
                                      <button
                                          key={opt}
                                          onClick={() => updateFact(field.id as string, opt)}
                                          className={`p-3 text-left rounded-lg border transition-all ${
                                              facts[field.id] === opt 
                                              ? 'bg-[#1E407C] text-white border-[#1E407C]' 
                                              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                                          }`}
                                      >
                                          <div className="font-medium">{opt}</div>
                                          {field.optionHelp && field.optionHelp[opt] && (
                                              <div className={`text-xs mt-1 ${facts[field.id] === opt ? 'text-blue-100' : 'text-slate-400'}`}>
                                                  {field.optionHelp[opt]}
                                              </div>
                                          )}
                                      </button>
                                  ))}
                              </div>
                          )}

                          {field.type === 'boolean-toggle' && field.options && (
                              <div className="flex gap-4">
                                  {field.options.map((opt, i) => {
                                      // Mapping 'No' to false, 'Yes' to true assumption
                                      const val = i === 1; 
                                      const isSelected = facts[field.id] === val;
                                      return (
                                          <button
                                              key={opt}
                                              onClick={() => updateFact(field.id as string, val)}
                                              className={`flex-1 p-3 text-center rounded-lg border transition-all font-bold ${
                                                  isSelected
                                                  ? 'bg-[#1E407C] text-white border-[#1E407C]' 
                                                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                                              }`}
                                          >
                                              {opt}
                                          </button>
                                      );
                                  })}
                              </div>
                          )}

                          {(field.type === 'multi-select' || field.type === 'checkbox-group') && field.options && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {field.options.map(opt => {
                                      const currentArr = (facts[field.id] as string[]) || [];
                                      const isSelected = currentArr.includes(opt);
                                      return (
                                          <button
                                              key={opt}
                                              onClick={() => {
                                                  const newArr = isSelected 
                                                      ? currentArr.filter(i => i !== opt)
                                                      : [...currentArr, opt];
                                                  updateFact(field.id as string, newArr);
                                              }}
                                              className={`p-3 text-left rounded-lg border transition-all flex items-start ${
                                                  isSelected
                                                  ? 'bg-blue-50 border-blue-500 text-blue-900' 
                                                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                                              }`}
                                          >
                                              <div className={`w-5 h-5 rounded border mr-3 flex items-center justify-center flex-shrink-0 mt-0.5 ${isSelected ? 'bg-blue-500 border-blue-500' : 'bg-white border-slate-300'}`}>
                                                  {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
                                              </div>
                                              <div>
                                                  <span className="text-sm leading-snug font-medium block">{opt}</span>
                                                  {field.optionHelp && field.optionHelp[opt] && (
                                                      <span className="text-xs text-slate-400 font-normal mt-1 block leading-tight">
                                                          {field.optionHelp[opt]}
                                                      </span>
                                                  )}
                                              </div>
                                          </button>
                                      );
                                  })}
                              </div>
                          )}
                      </div>
                  ))}
              </div>
          </div>

          <div className="flex justify-between items-center">
              <button 
                  onClick={() => setStep(s => s - 1)}
                  className="text-slate-400 font-bold hover:text-slate-600 px-4 py-2"
              >
                  Back
              </button>
              
              <div className="flex gap-4">
                  {isLastStep && (
                       <button
                         onClick={() => setShowLiveDoc(true)}
                         className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold py-3 px-6 rounded-xl shadow-sm flex items-center"
                       >
                           <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                           Preview Form
                       </button>
                  )}
                  
                  <button 
                      onClick={() => isLastStep ? handleGenerate() : setStep(s => s + 1)}
                      className="bg-[#1E407C] text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-[#153060] transition-transform active:scale-95"
                  >
                      {isLastStep ? 'Generate Protocol' : 'Next Step'}
                  </button>
              </div>
          </div>
      </div>
  );
};

export default ProtocolWizard;
