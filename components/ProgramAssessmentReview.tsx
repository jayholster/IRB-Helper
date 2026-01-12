
import React, { useState, useRef } from 'react';
import type { AssessmentPlanInput, AssessmentPlanReview, FileData, SectionFeedback } from '../types';
import { reviewAssessmentPlan, parseAssessmentDocument } from '../services/geminiService';
import { OPAIR_HANDBOOK_URL } from '../constants';

type Mode = 'intro' | 'wizard' | 'uploading' | 'review';

const ScoreGauge: React.FC<{ score: number; size?: 'sm' | 'lg' }> = ({ score, size = 'sm' }) => {
    const radius = size === 'lg' ? 40 : 18;
    const stroke = size === 'lg' ? 8 : 4;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    const color = score >= 80 ? '#10B981' : score >= 60 ? '#F59E0B' : '#EF4444';

    return (
        <div className={`relative flex items-center justify-center ${size === 'lg' ? 'w-24 h-24' : 'w-12 h-12'}`}>
            <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
                <circle
                    stroke="#E5E7EB"
                    strokeWidth={stroke}
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                <circle
                    stroke={color}
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset }}
                    strokeLinecap="round"
                    fill="transparent"
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
            </svg>
            <span className={`absolute font-bold text-slate-800 ${size === 'lg' ? 'text-2xl' : 'text-xs'}`}>
                {Math.round(score)}
            </span>
        </div>
    );
};

const SectionCard: React.FC<{
    title: string;
    feedback?: SectionFeedback;
    originalText: string;
    onApplyRewrite: (newText: string) => void;
}> = ({ title, feedback, originalText, onApplyRewrite }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Guard against missing feedback data from the AI
    if (!feedback) {
        return (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm opacity-60 cursor-not-allowed">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                        <span className="text-xl font-bold text-slate-300">?</span>
                    </div>
                    <div>
                        <h4 className="text-lg font-bold text-slate-400">{title}</h4>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 uppercase tracking-wide">
                            Not Analyzed
                        </span>
                    </div>
                </div>
            </div>
        );
    }

    // Calculate a 0-100 score for the gauge from the 0-10 score
    const gaugeScore = (feedback.score || 0) * 10; 

    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden">
            <div 
                className="p-6 cursor-pointer flex items-center justify-between"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-4">
                    <ScoreGauge score={gaugeScore} size="sm" />
                    <div>
                        <h4 className="text-lg font-bold text-slate-800">{title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                                feedback.status === 'Strong' ? 'bg-green-100 text-green-700' :
                                feedback.status === 'Adequate' ? 'bg-amber-100 text-amber-700' :
                                'bg-red-100 text-red-700'
                            }`}>
                                {feedback.status}
                            </span>
                            {!isExpanded && feedback.rewriteSuggestion && (
                                <span className="text-xs text-blue-600 font-medium flex items-center animate-pulse">
                                    <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    Rewrite available
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                    <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>

            {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-6 animate-fadeIn">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Strengths & Weaknesses */}
                        <div className="space-y-4">
                            {feedback.strengths && feedback.strengths.length > 0 && (
                                <div>
                                    <h5 className="text-xs font-bold text-green-700 uppercase tracking-widest mb-2 flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                                        What Works
                                    </h5>
                                    <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                                        {feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                            )}
                            
                            {feedback.weaknesses && feedback.weaknesses.length > 0 && (
                                <div>
                                    <h5 className="text-xs font-bold text-amber-700 uppercase tracking-widest mb-2 flex items-center">
                                        <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                                        Needs Attention
                                    </h5>
                                    <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                                        {feedback.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {/* Rewrite Suggestion */}
                        <div>
                            {feedback.rewriteSuggestion ? (
                                <div className="bg-white border border-blue-100 rounded-xl p-5 shadow-sm">
                                    <div className="flex justify-between items-center mb-3">
                                        <h5 className="text-xs font-bold text-blue-700 uppercase tracking-widest">Suggested Revision</h5>
                                        <button 
                                            onClick={() => {
                                                onApplyRewrite(feedback.rewriteSuggestion!);
                                                setIsExpanded(false);
                                            }}
                                            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-bold transition-colors shadow-sm flex items-center"
                                        >
                                            Apply Fix
                                            <svg className="w-3 h-3 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                                        </button>
                                    </div>
                                    <p className="text-sm text-slate-700 leading-relaxed italic border-l-2 border-blue-200 pl-3 mb-4">
                                        "{feedback.rewriteSuggestion}"
                                    </p>
                                    <p className="text-[10px] text-slate-400">
                                        <span className="font-bold text-slate-500">Rationale: </span>
                                        {feedback.rationale}
                                    </p>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400 text-sm italic bg-slate-100/50 rounded-xl border border-dashed border-slate-200 p-6">
                                    No revisions needed. Excellent work!
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const ProgramAssessmentReview: React.FC = () => {
    const [mode, setMode] = useState<Mode>('intro');
    const [wizardStep, setWizardStep] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [input, setInput] = useState<AssessmentPlanInput>({
        programName: '',
        learningObjective: '',
        curriculumAnchor: '',
        assessmentMethod: '',
        performanceTarget: '',
        findings: '',
        actionPlan: '',
        assessmentImpact: '',
        nextYearPlan: ''
    });

    const [review, setReview] = useState<AssessmentPlanReview | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // --- Actions ---

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setIsLoading(true);
            setMode('uploading');
            setError(null);
            
            try {
                const reader = new FileReader();
                reader.onloadend = async () => {
                    const base64OrText = reader.result as string;
                    let fileData: FileData;
                    
                    if (file.type === 'application/pdf') {
                        fileData = { mimeType: 'application/pdf', data: base64OrText.split(',')[1] };
                    } else {
                        fileData = { mimeType: 'text/plain', data: base64OrText };
                    }

                    // 1. Parse Document
                    const parsedData = await parseAssessmentDocument(fileData);
                    setInput(parsedData);
                    
                    // 2. Immediately Review
                    const result = await reviewAssessmentPlan(parsedData);
                    setReview(result);
                    setMode('review');
                    setIsLoading(false);
                };

                if (file.type === 'application/pdf') {
                    reader.readAsDataURL(file);
                } else {
                    reader.readAsText(file);
                }
            } catch (err) {
                console.error(err);
                setError("Failed to read document. Please try again.");
                setMode('intro');
                setIsLoading(false);
            }
        }
    };

    const handleReviewFromWizard = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await reviewAssessmentPlan(input);
            setReview(result);
            setMode('review');
        } catch (e) {
            setError("Failed to generate review. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleApplyRewrite = (section: keyof AssessmentPlanInput, newText: string) => {
        setInput(prev => ({ ...prev, [section]: newText }));
    };

    const handleExport = () => {
        const reportText = `
PENN STATE PROGRAM ASSESSMENT REPORT
------------------------------------
Program: ${input.programName}

[PART 1: THE PLAN]
PLO: ${input.learningObjective}
Curriculum Anchor: ${input.curriculumAnchor}
Assessment Method: ${input.assessmentMethod}
Performance Target: ${input.performanceTarget}

[PART 2: RESULTS]
Findings: ${input.findings}

[PART 3: CLOSING THE LOOP]
Action Plan: ${input.actionPlan}
Impact of Prior Changes: ${input.assessmentImpact}

[PART 4: FUTURE]
Next Year's Plan: ${input.nextYearPlan}
        `.trim();

        const blob = new Blob([reportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${input.programName.replace(/\s+/g, '_')}_Assessment_Report.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // --- Views ---

    if (mode === 'intro') {
        return (
            <div className="max-w-4xl mx-auto animate-fadeIn py-10">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-[#1E407C] mb-4">Assessment Report Reviewer</h2>
                    <p className="text-slate-500 max-w-xl mx-auto">
                        Get immediate feedback on your Nuventive assessment report draft based on OPAIR guidelines.
                        Choose how you want to start.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Option 1: Upload */}
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                             <svg className="w-10 h-10 text-[#1E407C]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Upload Draft</h3>
                        <p className="text-slate-500 mb-8 text-sm leading-relaxed">
                            Upload a PDF or Text file of your existing report or proposal. AI will parse it and provide feedback instantly.
                        </p>
                        <button className="mt-auto px-6 py-3 bg-[#1E407C] text-white rounded-xl font-bold text-sm hover:bg-[#153060] transition-colors w-full shadow-md">
                            Select File
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept=".pdf,.txt" 
                            onChange={handleFileUpload}
                        />
                    </div>

                    {/* Option 2: Wizard */}
                    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group cursor-pointer" onClick={() => { setMode('wizard'); setWizardStep(0); }}>
                        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-green-100 transition-colors">
                             <svg className="w-10 h-10 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Use Guided Form</h3>
                        <p className="text-slate-500 mb-8 text-sm leading-relaxed">
                            Fill out the report one section at a time. The wizard will guide you through the required Nuventive fields.
                        </p>
                        <button className="mt-auto px-6 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold text-sm hover:border-[#1E407C] hover:text-[#1E407C] transition-colors w-full">
                            Start Wizard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (mode === 'uploading') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] animate-fadeIn">
                 <div className="w-20 h-20 mb-6 relative">
                     <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-100 rounded-full"></div>
                     <div className="absolute top-0 left-0 w-full h-full border-4 border-[#1E407C] rounded-full animate-spin border-t-transparent"></div>
                 </div>
                 <h3 className="text-xl font-bold text-slate-800 mb-2">Analyzing Document...</h3>
                 <p className="text-slate-500">Extracting assessment data and checking against guidelines.</p>
            </div>
        );
    }

    if (mode === 'wizard') {
        const steps = [
            { title: "Program Info", fields: ['programName', 'learningObjective'] },
            { title: "Methodology", fields: ['curriculumAnchor', 'assessmentMethod', 'performanceTarget'] },
            { title: "Results", fields: ['findings'] },
            { title: "Closing the Loop", fields: ['actionPlan', 'assessmentImpact'] },
            { title: "Future", fields: ['nextYearPlan'] }
        ];

        return (
            <div className="max-w-2xl mx-auto animate-fadeIn py-8">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                        <span>Step {wizardStep + 1} of {steps.length}</span>
                        <span>{steps[wizardStep].title}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-[#1E407C] transition-all duration-500" 
                            style={{ width: `${((wizardStep + 1) / steps.length) * 100}%` }}
                        ></div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm mb-8">
                    {wizardStep === 0 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Program Name</label>
                                <input 
                                    type="text" 
                                    value={input.programName}
                                    onChange={e => setInput({...input, programName: e.target.value})}
                                    placeholder="e.g. BS in Cybersecurity"
                                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-[#1E407C]/20 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Assessed PLO</label>
                                <textarea 
                                    value={input.learningObjective}
                                    onChange={e => setInput({...input, learningObjective: e.target.value})}
                                    placeholder="Copy the full text of the PLO being assessed..."
                                    className="w-full p-3 h-32 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-[#1E407C]/20 outline-none resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {wizardStep === 1 && (
                        <div className="space-y-6 animate-fadeIn">
                             <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Curriculum Anchor</label>
                                <input 
                                    type="text" 
                                    value={input.curriculumAnchor}
                                    onChange={e => setInput({...input, curriculumAnchor: e.target.value})}
                                    placeholder="Where was evidence collected? (Course/Assignment)"
                                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-[#1E407C]/20 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Assessment Method</label>
                                <textarea 
                                    value={input.assessmentMethod}
                                    onChange={e => setInput({...input, assessmentMethod: e.target.value})}
                                    placeholder="Describe the Artifact, Tool (Rubric?), and Raters..."
                                    className="w-full p-3 h-24 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-[#1E407C]/20 outline-none resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Performance Target</label>
                                <input 
                                    type="text" 
                                    value={input.performanceTarget}
                                    onChange={e => setInput({...input, performanceTarget: e.target.value})}
                                    placeholder="e.g. 80% of students will score Proficient..."
                                    className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-[#1E407C]/20 outline-none"
                                />
                            </div>
                        </div>
                    )}

                    {wizardStep === 2 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Findings & Interpretation</label>
                                <p className="text-xs text-slate-500 mb-3">Include Sample Size (N), Data (% met), and Interpretation (Meaning).</p>
                                <textarea 
                                    value={input.findings}
                                    onChange={e => setInput({...input, findings: e.target.value})}
                                    placeholder="Enter your results..."
                                    className="w-full p-3 h-48 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-[#1E407C]/20 outline-none resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {wizardStep === 3 && (
                        <div className="space-y-6 animate-fadeIn">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Action Plan</label>
                                <textarea 
                                    value={input.actionPlan}
                                    onChange={e => setInput({...input, actionPlan: e.target.value})}
                                    placeholder="What will you change or maintain based on these results?"
                                    className="w-full p-3 h-32 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-[#1E407C]/20 outline-none resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Impact of Prior Changes</label>
                                <textarea 
                                    value={input.assessmentImpact}
                                    onChange={e => setInput({...input, assessmentImpact: e.target.value})}
                                    placeholder="Did last year's action plan improve student learning?"
                                    className="w-full p-3 h-24 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-[#1E407C]/20 outline-none resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {wizardStep === 4 && (
                        <div className="space-y-6 animate-fadeIn">
                             <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Next Year's Plan</label>
                                <textarea 
                                    value={input.nextYearPlan}
                                    onChange={e => setInput({...input, nextYearPlan: e.target.value})}
                                    placeholder="Which PLO will be assessed next? How?"
                                    className="w-full p-3 h-40 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-[#1E407C]/20 outline-none resize-none"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-between items-center">
                    <button 
                        onClick={() => wizardStep > 0 ? setWizardStep(c => c - 1) : setMode('intro')}
                        className="text-slate-500 font-bold hover:text-slate-800 transition-colors"
                    >
                        Back
                    </button>

                    {wizardStep < 4 ? (
                        <button 
                            onClick={() => setWizardStep(c => c + 1)}
                            className="bg-[#1E407C] text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-[#153060] transition-colors"
                        >
                            Next Step
                        </button>
                    ) : (
                        <button 
                            onClick={handleReviewFromWizard}
                            disabled={isLoading}
                            className="bg-[#1E407C] text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-[#153060] transition-colors flex items-center"
                        >
                            {isLoading ? 'Analyzing...' : 'Generate Review'}
                        </button>
                    )}
                </div>
            </div>
        );
    }

    if (mode === 'review' && review) {
        return (
            <div className="flex flex-col lg:flex-row gap-8 animate-fadeIn pt-6">
                {/* Left Column: Dashboard */}
                <div className="lg:w-2/3 space-y-8">
                     
                     {/* Executive Summary Card */}
                     <div className="bg-[#1E407C] text-white rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                        
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div>
                                <h2 className="text-2xl font-bold mb-1">Assessment Report Audit</h2>
                                <p className="text-blue-200 text-sm">{input.programName}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 flex flex-col items-center min-w-[100px]">
                                <span className="text-3xl font-extrabold">{review.overallScore}</span>
                                <span className="text-[10px] uppercase tracking-widest opacity-80">Score</span>
                            </div>
                        </div>

                        <div className="relative z-10 bg-black/20 rounded-xl p-5 backdrop-blur-sm border border-white/10">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-2">Executive Summary</h3>
                            <p className="text-sm leading-relaxed opacity-95">
                                {review.executiveSummary}
                            </p>
                        </div>
                     </div>

                    {/* Detailed Sections */}
                    <div className="space-y-4">
                        <SectionCard 
                            title="1. Assessment Plan" 
                            feedback={review.sections?.plan}
                            originalText={input.assessmentMethod} // Simplified for UI, in reality would combine fields
                            onApplyRewrite={(text) => handleApplyRewrite('assessmentMethod', text)}
                        />
                        <SectionCard 
                            title="2. Results & Findings" 
                            feedback={review.sections?.results}
                            originalText={input.findings}
                            onApplyRewrite={(text) => handleApplyRewrite('findings', text)}
                        />
                        <SectionCard 
                            title="3. Closing the Loop" 
                            feedback={review.sections?.closingLoop}
                            originalText={input.actionPlan}
                            onApplyRewrite={(text) => handleApplyRewrite('actionPlan', text)}
                        />
                        <SectionCard 
                            title="4. Future Plans" 
                            feedback={review.sections?.future}
                            originalText={input.nextYearPlan}
                            onApplyRewrite={(text) => handleApplyRewrite('nextYearPlan', text)}
                        />
                    </div>
                </div>

                {/* Right Column: Actions */}
                <div className="lg:w-1/3 space-y-6">
                     <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm sticky top-24">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-[#1E407C]">Actions</h3>
                            <button onClick={() => setMode('intro')} className="text-xs font-bold text-slate-400 hover:text-slate-600">Start Over</button>
                        </div>
                        
                        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                            Review the sections on the left. Expand cards to see specific feedback and apply AI-suggested rewrites directly to your draft.
                        </p>
                        
                        <div className="space-y-3">
                            <button 
                                onClick={() => { setMode('wizard'); setWizardStep(0); }}
                                className="w-full bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 font-bold py-3.5 rounded-xl flex items-center justify-center transition-colors text-sm"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                Edit Full Draft manually
                            </button>
                            
                            <button 
                                onClick={handleExport}
                                className="w-full bg-green-600 text-white hover:bg-green-700 font-bold py-3.5 rounded-xl flex items-center justify-center transition-colors shadow-md text-sm"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Export Final Report
                            </button>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Resources</h4>
                            <a href={OPAIR_HANDBOOK_URL} target="_blank" rel="noreferrer" className="flex items-center text-sm text-[#1E407C] hover:underline">
                                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                OPAIR Handbook
                            </a>
                        </div>
                     </div>
                </div>
            </div>
        );
    }

    return null;
};

export default ProgramAssessmentReview;
