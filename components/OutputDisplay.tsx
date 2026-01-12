
import React, { useState, useEffect, useRef } from 'react';
import type { GeneratedContent, AssignmentIdea, RefinementSuggestion, GeneratedArtifact, AlignmentEvaluation } from '../types';
import { OPAIR_RUBRIC_URL } from '../constants';
import { refineArtifactSection } from '../services/geminiService';

interface OutputDisplayProps {
  content: GeneratedContent | null;
  isLoading: boolean;
  loadingText?: string;
  onRefine: (feedback: string) => void;
  onGenerateArtifact: (type: 'handout' | 'rubric' | 'diagram') => void;
  onPublish: (idea: AssignmentIdea) => void;
  generatedArtifact: GeneratedArtifact | null;
  isArtifactLoading: boolean;
  onCloseArtifact: () => void;
  onEvaluate: (idea: AssignmentIdea) => void;
  onCloseEvaluation: () => void;
  isEvaluating: boolean;
  evaluationResult: AlignmentEvaluation | null;
}

interface Block {
    id: string;
    content: string;
}

const LoadingSkeleton: React.FC<{ text?: string }> = ({ text }) => (
  <div className="space-y-12 animate-pulse mt-8">
     <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="relative w-20 h-20 mb-6">
             <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-100 rounded-full"></div>
             <div className="absolute top-0 left-0 w-full h-full border-4 border-[#1E407C] rounded-full animate-spin border-t-transparent"></div>
        </div>
        <span className="font-semibold text-[#1E407C] text-lg tracking-wide">{text || 'Consulting the AI...'}</span>
    </div>
    
    <div className="border border-slate-200 bg-white rounded-[2rem] p-10 space-y-6 h-96 shadow-sm">
        <div className="h-10 bg-slate-100 rounded-lg w-3/4 mb-8"></div>
        <div className="space-y-4">
            <div className="h-4 bg-slate-100 rounded w-full"></div>
            <div className="h-4 bg-slate-100 rounded w-11/12"></div>
            <div className="h-4 bg-slate-100 rounded w-10/12"></div>
            <div className="h-4 bg-slate-100 rounded w-full"></div>
        </div>
    </div>
  </div>
);

const InitialState: React.FC = () => (
  <div className="text-center text-slate-400 py-32 flex flex-col items-center justify-center h-full">
    <div className="bg-white w-24 h-24 rounded-full shadow-sm flex items-center justify-center mb-8 border border-slate-100">
      <svg className="h-10 w-10 text-[#1E407C] opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    </div>
    <h3 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">Assignment Designer</h3>
    <p className="text-base max-w-sm mx-auto leading-relaxed text-slate-500">
        Configure your learning objectives on the left to generate a tailored pedagogical blueprint.
    </p>
  </div>
);

const IdeaCard: React.FC<{ 
    idea: AssignmentIdea; 
    onPublish: () => void;
    onEvaluate: () => void;
    onCloseEvaluation: () => void;
    onRefine: (feedback: string) => void;
    isEvaluating: boolean;
    evaluationResult: AlignmentEvaluation | null;
}> = ({ idea, onPublish, onEvaluate, onCloseEvaluation, onRefine, isEvaluating, evaluationResult }) => {
    const steps = Array.isArray(idea.implementationSteps) ? idea.implementationSteps : [];

    const handleAutoImprove = () => {
        if (!evaluationResult) return;
        const prompt = `Based on a quality assurance review, the assignment "${idea.title}" has the following weaknesses: ${evaluationResult.weaknesses.join('; ')}. 
        Suggestion: ${evaluationResult.suggestion}. 
        Please refine the assignment (description, steps, and criteria) to address these gaps and improve alignment with the learning objectives.`;
        onRefine(prompt);
    };

    return (
        <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm transition-all duration-300 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1E407C] to-blue-400"></div>
            
            <div className="p-8 sm:p-10">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 gap-4">
                    <h3 className="text-2xl md:text-3xl font-extrabold text-[#1E407C] leading-tight tracking-tight max-w-2xl">
                        {idea.title}
                    </h3>
                    <div className="flex gap-2">
                         <button 
                            onClick={onEvaluate}
                            disabled={isEvaluating}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold px-4 py-2 rounded-full flex items-center transition-colors shadow-sm whitespace-nowrap"
                        >
                            {isEvaluating ? (
                                <svg className="animate-spin h-3 w-3 mr-2" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            ) : (
                                <svg className="w-3 h-3 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            )}
                            Check Alignment
                        </button>
                        <button 
                            onClick={onPublish}
                            className="bg-green-600 hover:bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-full flex items-center transition-colors shadow-sm whitespace-nowrap"
                            title="Publish to Penn State Commons"
                        >
                            Share
                            <svg className="w-3 h-3 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                        </button>
                    </div>
                </div>

                <p className="text-slate-700 mb-8 leading-7 text-base md:text-lg font-normal max-w-3xl">
                    {idea.description}
                </p>
                
                {/* Evaluation Result Panel */}
                {evaluationResult && (
                    <div className="mb-8 bg-[#F5F5F7] rounded-xl p-6 border border-slate-200 animate-fadeIn relative">
                        <button 
                            onClick={onCloseEvaluation}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-200 rounded-lg transition-colors"
                            title="Dismiss Report"
                        >
                             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>

                        <div className="flex items-center justify-between mb-4 pr-8">
                             <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide flex items-center">
                                Gen Ed Alignment Report
                             </h4>
                             <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                                 evaluationResult.rating === 'Strong' ? 'bg-green-100 text-green-700' :
                                 evaluationResult.rating === 'Moderate' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                             }`}>
                                 {evaluationResult.score}% - {evaluationResult.rating} Match
                             </div>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h5 className="text-xs font-semibold text-green-700 mb-2 flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                                    Strengths
                                </h5>
                                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                    {evaluationResult.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h5 className="text-xs font-semibold text-amber-700 mb-2 flex items-center">
                                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                    Gaps
                                </h5>
                                <ul className="list-disc list-inside text-sm text-slate-600 space-y-1">
                                    {evaluationResult.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                                </ul>
                            </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-slate-200">
                             <p className="text-sm text-slate-700 italic mb-4">
                                 <span className="font-semibold text-slate-900 not-italic">Suggestion: </span>
                                 {evaluationResult.suggestion}
                             </p>
                             
                             <button 
                                onClick={handleAutoImprove}
                                className="w-full bg-[#1E407C] hover:bg-[#153060] text-white text-sm font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center shadow-md"
                             >
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                Regenerate with Updates
                             </button>
                        </div>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                     <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                         <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Pedagogical Goal</h4>
                         <p className="text-sm font-semibold text-slate-800">{idea.connectionToObjectives}</p>
                     </div>
                     <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                         <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Assessment Strategy</h4>
                         <p className="text-sm font-semibold text-slate-800">{idea.assessmentStrategy}</p>
                     </div>
                </div>

                <div className="mb-2">
                    <h4 className="font-bold text-slate-900 mb-4 flex items-center text-sm uppercase tracking-widest">
                        <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full flex items-center justify-center mr-2 text-xs">1</span>
                        Key Steps
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {steps.map((step, i) => (
                            <div key={i} className="flex items-start text-sm text-slate-600 bg-white border border-slate-100 p-3 rounded-lg">
                                <span className="font-bold text-slate-300 mr-2">{i+1}.</span>
                                {step}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const RefinementCard: React.FC<{ suggestion: RefinementSuggestion }> = ({ suggestion }) => {
  const [showRationale, setShowRationale] = useState(false);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group flex flex-col h-full">
      <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-slate-800 text-base leading-snug group-hover:text-[#1E407C] transition-colors pr-4">{suggestion.suggestion}</h3>
          <button 
            onClick={() => setShowRationale(!showRationale)}
            className="text-slate-300 hover:text-[#1E407C] transition-colors p-1"
          >
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </button>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-50">
          <div className="bg-red-50/50 p-3 rounded-xl border border-red-50">
             <span className="block text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2">Instead of:</span>
             <p className="text-xs text-slate-600 leading-relaxed italic">"{suggestion.currentApproachContext}"</p>
          </div>
      </div>
      
      {showRationale && (
          <div className="mt-4 pt-4 border-t border-slate-100 animate-fadeIn">
              <p className="text-xs text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-900 block mb-1">Rationale: </span>
                  {suggestion.assessmentStrategy}
              </p>
          </div>
      )}
    </div>
  );
};

const MaterialGenerator: React.FC<{
  onGenerate: (type: 'handout' | 'rubric' | 'diagram') => void;
  isLoading: boolean;
}> = ({ onGenerate, isLoading }) => {
  const [selectedType, setSelectedType] = useState<'handout' | 'rubric' | 'diagram'>('rubric');

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 mt-8">
      <div className="flex items-center">
         <div className="p-3 bg-slate-800 rounded-xl mr-4 border border-slate-700">
            <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
         </div>
         <div>
            <h3 className="text-base font-bold text-white">Generate Resources</h3>
            <p className="text-xs text-slate-400">Create downloadable content</p>
         </div>
      </div>
      
      <div className="flex w-full md:w-auto gap-2">
           <div className="relative flex-grow md:flex-grow-0 md:min-w-[180px]">
             <select 
               value={selectedType}
               onChange={(e) => setSelectedType(e.target.value as any)}
               className="w-full appearance-none bg-slate-800 border border-slate-700 text-white py-2.5 px-4 pr-8 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
             >
               <option value="rubric">Rubric (Grid)</option>
               <option value="handout">Handout (PDF Style)</option>
               <option value="diagram">Student Visual Guide</option>
             </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
               <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
             </div>
           </div>
        
        <button
          onClick={() => onGenerate(selectedType)}
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2.5 px-5 rounded-lg transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center whitespace-nowrap min-w-[100px]"
        >
           {isLoading ? (
               <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
           ) : (
               'Generate'
           )}
        </button>
      </div>
    </div>
  );
};

const SectionBlock: React.FC<{ 
    block: Block; 
    onUpdate: (id: string, newContent: string) => void;
}> = ({ block, onUpdate }) => {
    const [isAiOpen, setIsAiOpen] = useState(false);
    const [aiInstruction, setAiInstruction] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [content, setContent] = useState(block.content);
    const contentRef = useRef<HTMLDivElement>(null);

    // Sync if block prop changes externally
    useEffect(() => {
        setContent(block.content);
    }, [block.content]);

    const handleCopy = async () => {
        try {
            const blob = new Blob([content], { type: 'text/html' });
            const textBlob = new Blob([contentRef.current?.innerText || ''], { type: 'text/plain' });
            const data = [new ClipboardItem({ 
                'text/html': blob,
                'text/plain': textBlob 
            })];
            await navigator.clipboard.write(data);
            
            // Visual feedback
            const btn = document.getElementById(`copy-btn-${block.id}`);
            if (btn) {
                const original = btn.innerHTML;
                btn.innerHTML = `<svg class="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`;
                setTimeout(() => btn.innerHTML = original, 2000);
            }
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const handleAiSubmit = async () => {
        if (!aiInstruction.trim()) return;
        setIsLoading(true);
        try {
            const refined = await refineArtifactSection(content, aiInstruction);
            setContent(refined);
            onUpdate(block.id, refined);
            setIsAiOpen(false);
            setAiInstruction('');
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-6 overflow-hidden hover:border-blue-200 transition-colors group relative">
            {/* Header/Toolbar */}
            <div className="bg-slate-50 border-b border-slate-100 px-4 py-2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity absolute top-0 left-0 right-0 z-10 h-10">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Section Editor</div>
                <div className="flex space-x-2">
                    <button 
                        onClick={() => setIsAiOpen(!isAiOpen)}
                        className={`p-1.5 rounded hover:bg-white text-slate-400 hover:text-blue-600 transition-colors ${isAiOpen ? 'text-blue-600 bg-white shadow-sm' : ''}`}
                        title="AI Assist"
                    >
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </button>
                    <button 
                        id={`copy-btn-${block.id}`}
                        onClick={handleCopy}
                        className="p-1.5 rounded hover:bg-white text-slate-400 hover:text-green-600 transition-colors"
                        title="Copy to Clipboard"
                    >
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                    </button>
                </div>
            </div>

            {/* AI Panel */}
            {isAiOpen && (
                <div className="bg-blue-50/50 p-4 border-b border-blue-100 animate-fadeIn mt-10">
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={aiInstruction}
                            onChange={(e) => setAiInstruction(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAiSubmit()}
                            placeholder="How should AI change this section? (e.g., 'Make it stricter', 'Add a step')"
                            className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 outline-none"
                            autoFocus
                        />
                        <button 
                            onClick={handleAiSubmit}
                            disabled={isLoading}
                            className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {isLoading ? '...' : 'Apply'}
                        </button>
                    </div>
                </div>
            )}

            {/* Editable Content */}
            <div 
                ref={contentRef}
                className={`p-8 outline-none ${isAiOpen ? '' : 'mt-4'} typography-block`}
                contentEditable
                suppressContentEditableWarning
                onBlur={(e) => {
                    const newHtml = e.currentTarget.innerHTML;
                    if (newHtml !== content) {
                        setContent(newHtml);
                        onUpdate(block.id, newHtml);
                    }
                }}
                dangerouslySetInnerHTML={{ __html: content }}
            />
        </div>
    );
};

const OutputDisplay: React.FC<OutputDisplayProps> = ({ 
  content, 
  isLoading, 
  loadingText, 
  onRefine,
  onGenerateArtifact,
  onPublish,
  generatedArtifact,
  isArtifactLoading,
  onCloseArtifact,
  onEvaluate,
  onCloseEvaluation,
  isEvaluating,
  evaluationResult
}) => {
  const [refineInput, setRefineInput] = useState('');
  const [blocks, setBlocks] = useState<Block[]>([]);

  // Parse HTML into blocks when artifact loads
  useEffect(() => {
    if (generatedArtifact) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(generatedArtifact.content, 'text/html');
        const bodyChildren = Array.from(doc.body.children);

        const newBlocks: Block[] = [];
        let currentBlockContent = '';
        let currentId = 0;

        // Simple heuristic: H1 and H2 start new blocks.
        // H1 is usually the main title, H2 are sections.
        bodyChildren.forEach((child) => {
            const tagName = child.tagName.toLowerCase();
            if (tagName === 'h1' || tagName === 'h2') {
                if (currentBlockContent.trim()) {
                    newBlocks.push({ id: `block-${currentId++}`, content: currentBlockContent });
                    currentBlockContent = '';
                }
            }
            currentBlockContent += child.outerHTML;
        });
        
        // Push the last accumulated block
        if (currentBlockContent.trim()) {
             newBlocks.push({ id: `block-${currentId++}`, content: currentBlockContent });
        }
        
        // If parser failed to find structure (e.g. no H tags), just put everything in one block
        if (newBlocks.length === 0 && generatedArtifact.content.trim()) {
            newBlocks.push({ id: 'block-0', content: generatedArtifact.content });
        }

        setBlocks(newBlocks);
    }
  }, [generatedArtifact]);

  const handleBlockUpdate = (id: string, newContent: string) => {
      setBlocks(prev => prev.map(b => b.id === id ? { ...b, content: newContent } : b));
  };

  if (isLoading) return <LoadingSkeleton text={loadingText} />;
  if (!content) return <InitialState />;

  return (
    <div className="h-full flex flex-col pb-20">
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-10">
        
        {/* Main Assignment Section */}
        <section className="animate-fadeIn">
            <div className="flex items-center justify-between mb-6">
                 <h2 className="text-xl font-bold text-slate-800 tracking-tight">Assignment Concept</h2>
                 <a href={OPAIR_RUBRIC_URL} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-[#1E407C] hover:underline flex items-center bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
                    OPAIR Standards
                    <svg className="w-3 h-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                 </a>
            </div>
            
            {content.newAssignmentIdeas.map((idea, idx) => (
              <IdeaCard 
                key={idx} 
                idea={idea} 
                onPublish={() => onPublish(idea)} 
                onEvaluate={() => onEvaluate(idea)}
                onCloseEvaluation={onCloseEvaluation}
                onRefine={onRefine}
                isEvaluating={isEvaluating}
                evaluationResult={evaluationResult}
              />
            ))}

            <MaterialGenerator onGenerate={onGenerateArtifact} isLoading={isArtifactLoading} />
        </section>
        
        {/* Refinement Section - Compact */}
        {content.refinementSuggestions.length > 0 && (
            <section className="animate-fadeIn">
                <div className="flex items-center mb-4 border-t border-slate-100 pt-8">
                    <div className="bg-amber-100 p-1.5 rounded-lg mr-3">
                         <svg className="w-4 h-4 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </div>
                    <h2 className="text-base font-bold text-slate-800 tracking-tight">Pedagogical Enhancements</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    {content.refinementSuggestions.map((s, idx) => (
                        <RefinementCard key={idx} suggestion={s} />
                    ))}
                </div>
            </section>
        )}

        {/* AI Chat Input */}
        <section className="relative mt-4">
           <input 
              type="text" 
              value={refineInput}
              onChange={(e) => setRefineInput(e.target.value)}
              placeholder="E.g. 'Make this a group project' or 'Simplify for 100-level'..."
              className="w-full bg-white border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 rounded-xl px-5 py-4 text-slate-700 placeholder-slate-400 text-sm shadow-sm pr-12 transition-all"
              onKeyDown={(e) => {
                  if (e.key === 'Enter' && refineInput.trim()) {
                      onRefine(refineInput);
                      setRefineInput('');
                  }
              }}
           />
           <button 
              onClick={() => {
                  if (refineInput.trim()) {
                      onRefine(refineInput);
                      setRefineInput('');
                  }
              }}
              className="absolute right-2 top-2 bottom-2 w-10 bg-slate-100 hover:bg-[#1E407C] hover:text-white rounded-lg text-slate-400 transition-colors flex items-center justify-center"
           >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
           </button>
        </section>
      </div>

      {/* Artifact Modal / Block Editor */}
      {generatedArtifact && (
          <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-[#f0f0f4] rounded-xl shadow-2xl w-full max-w-5xl h-[95vh] flex flex-col overflow-hidden animate-fadeIn border border-white/10 relative">
                  
                  {/* Header */}
                  <div className="px-6 py-4 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm z-20">
                      <div className="flex items-center">
                          <div className="mr-3 p-2 bg-slate-100 rounded-lg">
                              {generatedArtifact.type === 'diagram' ? (
                                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              ) : (
                                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                              )}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-800">{generatedArtifact.title}</h3>
                            <span className="text-xs text-slate-500">
                                {generatedArtifact.type === 'diagram' ? 'Visual Guide' : 'Block Editor'}
                            </span>
                          </div>
                      </div>
                      <button onClick={onCloseArtifact} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-700">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                  </div>
                  
                  {/* Editor Area */}
                  <div className="flex-1 overflow-auto bg-[#f5f5f7] p-8 custom-scrollbar">
                      <div className="max-w-3xl mx-auto">
                            {/* Hint */}
                            <div className="mb-6 flex items-center justify-between text-xs text-slate-400 px-2">
                            <span>Sections are split automatically for easy editing.</span>
                            <span>Hover over a section to access AI tools.</span>
                            </div>

                            {blocks.map((block) => (
                                <SectionBlock 
                                key={block.id} 
                                block={block} 
                                onUpdate={handleBlockUpdate} 
                                />
                            ))}
                            
                            {/* Specific styles for the editor content */}
                            <style>{`
                            .typography-block h1 { font-family: 'Helvetica Neue', sans-serif; font-size: 24px; font-weight: 800; color: #1a202c; margin-bottom: 16px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
                            .typography-block h2 { font-family: 'Helvetica Neue', sans-serif; font-size: 18px; font-weight: 700; color: #2d3748; margin-bottom: 12px; margin-top: 0; }
                            .typography-block p { font-family: 'Georgia', serif; font-size: 16px; line-height: 1.6; color: #4a5568; margin-bottom: 16px; }
                            .typography-block ul, .typography-block ol { margin-bottom: 16px; padding-left: 24px; }
                            .typography-block li { margin-bottom: 6px; font-family: 'Georgia', serif; font-size: 16px; color: #4a5568; }
                            .typography-block table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
                            .typography-block th, .typography-block td { border: 1px solid #cbd5e0; padding: 10px; text-align: left; }
                            .typography-block th { background-color: #f7fafc; font-weight: 600; }
                            `}</style>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default OutputDisplay;
