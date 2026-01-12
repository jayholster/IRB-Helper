
import React, { useState, useRef, useEffect } from 'react';
import type { ResearchDocType, ResearchDocumentResult, FileData, StudyFacts } from '../types';
import { generateResearchDocument } from '../services/geminiService';

interface ResearchDocBuilderProps {
  onBack: () => void;
  studyFacts?: StudyFacts;
}

const DOC_TYPES: { id: ResearchDocType; title: string; desc: string; icon: React.ReactNode }[] = [
  { 
    id: 'informed_consent', 
    title: 'Informed Consent Form', 
    desc: 'HRP-590 compliant consent forms for adults or parents.',
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
  },
  { 
    id: 'survey', 
    title: 'Survey Instrument', 
    desc: 'Draft survey questions with logic and instructions.',
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
  },
  { 
    id: 'interview_guide', 
    title: 'Interview Guide', 
    desc: 'Semi-structured scripts for qualitative research.',
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
  },
  { 
    id: 'recruitment_email', 
    title: 'Recruitment Materials', 
    desc: 'Emails, scripts, or flyers to invite participants.',
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
  },
  { 
    id: 'debriefing', 
    title: 'Debriefing Statement', 
    desc: 'For studies involving deception or needing closure.',
    icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  },
];

const ResearchDocBuilder: React.FC<ResearchDocBuilderProps> = ({ onBack, studyFacts }) => {
  const [selectedType, setSelectedType] = useState<ResearchDocType | null>(null);
  
  // Generic state
  const [context, setContext] = useState('');
  const [audience, setAudience] = useState('');
  
  // Specific Consent Form State
  const [consentInputs, setConsentInputs] = useState({
      title: '',
      purpose: '',
      procedures: '',
      risks: '',
      benefits: '',
      duration: '',
      payment: ''
  });

  // Pre-fill fields from studyFacts if available
  useEffect(() => {
    if (!studyFacts) return;

    if (selectedType === 'informed_consent') {
         // Only pre-fill if empty to avoid overwriting user edits on re-selection
         setConsentInputs(prev => ({
             ...prev,
             title: prev.title || studyFacts.protocolTitle || '',
             purpose: prev.purpose || studyFacts.objectives || studyFacts.studyRationale || '',
             procedures: prev.procedures || studyFacts.proceduresNarrative || studyFacts.studyDesign || '',
             risks: prev.risks || studyFacts.risks || '',
             benefits: prev.benefits || studyFacts.benefitsSubjects || '',
             duration: prev.duration || studyFacts.duration || '',
             payment: prev.payment || studyFacts.compensation || ''
         }));
    } else if (studyFacts.protocolTitle || studyFacts.objectives) {
         // For generic types, provide a summary if context is empty
         if (!context) {
             const recruitmentStr = Array.isArray(studyFacts.recruitmentMethods) 
                ? studyFacts.recruitmentMethods.join(', ') 
                : studyFacts.recruitmentMethods;

             const summary = `
Study Title: ${studyFacts.protocolTitle}
Objectives: ${studyFacts.objectives}
Population: ${studyFacts.inclusionCriteria}
Recruitment Methods: ${recruitmentStr}
Incentives: ${studyFacts.compensation}
             `.trim();
             setContext(summary);
         }
    }
  }, [selectedType, studyFacts]);

  const [fileData, setFileData] = useState<FileData | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<ResearchDocumentResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      try {
        const data = await readFile(file);
        setFileData(data);
      } catch (err) {
        console.error("File Read Error", err);
        alert("Failed to read file.");
      }
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
    let finalContext = context;
    let hasEnoughInfo = !!context || !!fileData;

    // Assemble context for Consent Form if selected
    if (selectedType === 'informed_consent') {
        finalContext = `
            Study Title: ${consentInputs.title}
            Purpose: ${consentInputs.purpose}
            What will subjects do (Procedures): ${consentInputs.procedures}
            Time Commitment: ${consentInputs.duration}
            Risks: ${consentInputs.risks}
            Benefits: ${consentInputs.benefits}
            Compensation: ${consentInputs.payment}
            ${context ? `Additional Notes: ${context}` : ''}
        `;
        hasEnoughInfo = !!consentInputs.purpose && !!consentInputs.procedures;
    }

    if (!selectedType || !audience || !hasEnoughInfo) return;
    
    setIsGenerating(true);
    try {
      const doc = await generateResearchDocument(selectedType, finalContext, audience, fileData);
      setResult(doc);
    } catch (e) {
      console.error(e);
      alert('Failed to generate document. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToWord = () => {
    if (!result) return;
    
    const preHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${result.title}</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 12pt; margin: 1in; }
        h1 { font-size: 16pt; font-weight: bold; text-align: center; margin-bottom: 24px; }
        h2 { font-size: 14pt; font-weight: bold; margin-top: 24px; margin-bottom: 12px; }
        h3 { font-size: 12pt; font-weight: bold; margin-top: 18px; margin-bottom: 10px; }
        p { margin-bottom: 12px; line-height: 1.5; text-align: justify; }
        ul, ol { margin-bottom: 12px; }
        li { margin-bottom: 6px; }
        .notes-section { border-top: 1px solid #ccc; margin-top: 40px; padding-top: 20px; color: #555; font-style: italic; font-family: Arial, sans-serif; font-size: 10pt; }
      </style>
    </head><body>`;
    
    const postHtml = `
      <div class="notes-section">
        <h3>Methodologist's Notes</h3>
        <p>${result.mentorNotes}</p>
        <p><strong>Compliance Checks:</strong> ${result.complianceChecks.join('; ')}</p>
      </div>
      </body></html>`;
      
    const html = preHtml + result.content + postHtml;

    const blob = new Blob(['\ufeff', html], {
        type: 'application/msword'
    });
    
    const url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(html);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${result.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (result) {
    return (
      <div className="max-w-5xl mx-auto py-8 animate-fadeIn">
         {/* Result View */}
         <div className="flex justify-between items-center mb-6 no-print">
            <button onClick={() => setResult(null)} className="text-slate-500 font-bold hover:text-slate-800 text-sm flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                Back to Config
            </button>
            <div className="flex gap-3">
                <button 
                  onClick={() => window.print()}
                  className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm flex items-center"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    Print PDF
                </button>
                <button 
                  onClick={exportToWord}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors shadow-sm flex items-center"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Download Word Doc
                </button>
            </div>
         </div>

         <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
                {/* Paper Simulation */}
                <div className="bg-white rounded-sm shadow-lg mx-auto p-[1in] min-h-[11in] text-black font-serif border border-slate-200 print:shadow-none print:border-none print:p-0">
                    <h1 className="text-2xl font-bold text-black mb-6 border-b border-black/10 pb-4 text-center">{result.title}</h1>
                    <div 
                        className="prose prose-slate max-w-none text-sm leading-relaxed text-justify"
                        style={{ fontFamily: '"Times New Roman", Times, serif', fontSize: '12pt' }}
                        dangerouslySetInnerHTML={{ __html: result.content }}
                    />
                </div>
            </div>

            <div className="space-y-6 print:hidden">
                <div className="bg-teal-50 border border-teal-100 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-teal-900 uppercase tracking-widest mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        Methodologist's Notes
                    </h3>
                    <p className="text-sm text-teal-800 leading-relaxed italic">
                        "{result.mentorNotes}"
                    </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-6">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Compliance Checks</h3>
                    <ul className="space-y-2">
                        {result.complianceChecks.map((check, i) => (
                            <li key={i} className="flex items-start text-sm text-slate-600">
                                <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                {check}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
         </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[600px] animate-fadeIn text-center">
            <div className="w-20 h-20 border-4 border-slate-100 border-t-teal-600 rounded-full animate-spin mb-8"></div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Drafting your document...</h3>
            <p className="text-slate-500 max-w-md mx-auto">Checking HRP guidelines, adjusting reading level, and ensuring methodological rigor.</p>
        </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-start mb-10">
         <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Research Document Builder</h2>
            <p className="text-slate-500">Draft robust, IRB-ready study materials with your AI research assistant.</p>
         </div>
         <button onClick={onBack} className="text-slate-500 font-bold hover:text-slate-800 text-sm">
             Back to Dashboard
         </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Type Selection */}
          <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">1. Select Document Type</label>
              <div className="grid gap-3">
                  {DOC_TYPES.map(doc => (
                      <button
                        key={doc.id}
                        onClick={() => { setSelectedType(doc.id); setContext(''); }}
                        className={`p-4 rounded-xl border text-left transition-all flex items-start group ${
                            selectedType === doc.id
                            ? 'bg-teal-50 border-teal-500 ring-1 ring-teal-500'
                            : 'bg-white border-slate-200 hover:border-teal-300 hover:shadow-sm'
                        }`}
                      >
                          <div className={`p-2 rounded-lg mr-4 flex-shrink-0 ${
                              selectedType === doc.id ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-500 group-hover:bg-teal-50 group-hover:text-teal-600'
                          }`}>
                              {doc.icon}
                          </div>
                          <div>
                              <h3 className={`font-bold text-base mb-1 ${selectedType === doc.id ? 'text-teal-900' : 'text-slate-900'}`}>{doc.title}</h3>
                              <p className="text-sm text-slate-500">{doc.desc}</p>
                          </div>
                      </button>
                  ))}
              </div>
          </div>

          {/* Right: Inputs */}
          <div className={`space-y-8 transition-opacity duration-500 ${selectedType ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
              
              {/* Dynamic Context Fields */}
              {selectedType === 'informed_consent' ? (
                  <div className="space-y-4 animate-fadeIn">
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">2. Consent Details</label>
                      <input 
                        className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" 
                        placeholder="Study Title" 
                        value={consentInputs.title} 
                        onChange={e => setConsentInputs({...consentInputs, title: e.target.value})} 
                      />
                      <textarea 
                        className="w-full h-24 p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none resize-none" 
                        placeholder="Purpose of the Study (Why are you doing this?)" 
                        value={consentInputs.purpose} 
                        onChange={e => setConsentInputs({...consentInputs, purpose: e.target.value})} 
                      />
                      <textarea 
                        className="w-full h-32 p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none resize-none" 
                        placeholder="What will subjects do? (Step-by-step procedures)" 
                        value={consentInputs.procedures} 
                        onChange={e => setConsentInputs({...consentInputs, procedures: e.target.value})} 
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input 
                            className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" 
                            placeholder="Risks (e.g. Confidentiality)" 
                            value={consentInputs.risks} 
                            onChange={e => setConsentInputs({...consentInputs, risks: e.target.value})} 
                        />
                         <input 
                            className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" 
                            placeholder="Benefits (Direct or Society)" 
                            value={consentInputs.benefits} 
                            onChange={e => setConsentInputs({...consentInputs, benefits: e.target.value})} 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <input 
                            className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" 
                            placeholder="Duration (e.g. 1 hour)" 
                            value={consentInputs.duration} 
                            onChange={e => setConsentInputs({...consentInputs, duration: e.target.value})} 
                        />
                         <input 
                            className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none" 
                            placeholder="Payment/Incentives" 
                            value={consentInputs.payment} 
                            onChange={e => setConsentInputs({...consentInputs, payment: e.target.value})} 
                        />
                      </div>
                  </div>
              ) : (
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">2. Research Context</label>
                    <textarea 
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        placeholder="Briefly describe your study topic, goals, and specific needs for this document. You can also attach a PDF grant/protocol below to provide full context."
                        className="w-full h-40 p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none resize-none transition-all mb-3"
                    />
                    
                    {/* File Upload UI */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs font-bold bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 px-3 py-2 rounded-lg flex items-center transition-colors"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                            Attach Context (PDF/TXT)
                        </button>
                        
                        {fileName && (
                            <div className="flex items-center bg-teal-50 text-teal-800 px-3 py-1.5 rounded-lg text-xs font-bold animate-fadeIn">
                                <span className="truncate max-w-[150px]">{fileName}</span>
                                <button 
                                    onClick={() => { setFileName(null); setFileData(null); }}
                                    className="ml-2 hover:text-teal-900"
                                >
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        )}
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.txt" onChange={handleFileUpload} />
                </div>
              )}

              <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">3. Target Audience</label>
                  <input 
                    type="text"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    placeholder="e.g. Undergraduate students, Adults 65+, General Public..."
                    className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                  />
              </div>

              <button 
                onClick={handleGenerate}
                disabled={!selectedType || !audience || (selectedType !== 'informed_consent' && !context && !fileData) || (selectedType === 'informed_consent' && (!consentInputs.purpose || !consentInputs.procedures))}
                className="w-full bg-teal-600 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-teal-700 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                  Generate Draft
              </button>
          </div>
      </div>
    </div>
  );
};

export default ResearchDocBuilder;
