
import React, { useState } from 'react';
import ProtocolWizard from './components/ProtocolWizard';
import ResearchDocBuilder from './components/ResearchDocBuilder';
import type { AppMode, StudyFacts } from './types';
import { DEFAULT_STUDY_FACTS } from './constants';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('home');
  const [studyFacts, setStudyFacts] = useState<StudyFacts>(DEFAULT_STUDY_FACTS);

  return (
    <div className="min-h-screen font-sans text-[#1d1d1f] bg-[#F5F5F7]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div 
            className="flex items-center cursor-pointer" 
            onClick={() => setMode('home')}
          >
            <img 
              src="https://brand.psu.edu/images/backgrounds/horizontal-mark-registered-symbol.png" 
              alt="Penn State Logo" 
              className="h-10 w-auto object-contain mr-6"
            />
            <div className="hidden sm:block pl-6 border-l border-slate-200 h-8 flex flex-col justify-center">
              <h1 className="text-base font-bold tracking-tight text-slate-900 leading-none">LionIRB Assist</h1>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest mt-0.5">Research Confidence Engine</span>
            </div>
          </div>
          
          {mode !== 'home' && (
              <button 
                onClick={() => setMode('home')}
                className="text-sm font-bold text-slate-500 hover:text-[#1E407C] transition-colors"
              >
                  Back to Home
              </button>
          )}
        </div>
      </header>
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-12">
          {mode === 'home' && (
              <div className="max-w-5xl mx-auto py-12 animate-fadeIn">
                  <div className="text-center mb-16">
                      <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">How can we help your research today?</h2>
                      <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                          Select a tool below to get started. Our AI-powered assistants are trained on Penn State HRP guidelines.
                      </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                      {/* Protocol Card */}
                      <button 
                        onClick={() => setMode('wizard')}
                        className="bg-white rounded-[2.5rem] p-10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-slate-200 text-left group relative overflow-hidden"
                      >
                          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                              <svg className="w-40 h-40 text-[#1E407C]" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          </div>
                          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#1E407C] group-hover:text-white transition-colors text-[#1E407C]">
                              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                          </div>
                          <h3 className="text-2xl font-bold text-slate-900 mb-3">HRP-591 Protocol Builder</h3>
                          <p className="text-slate-500 leading-relaxed mb-6">
                              Generate the full 22-section HRP-591 protocol document. Extracts data from your grants/notes and ensures compliance.
                          </p>
                          <span className="text-[#1E407C] font-bold text-sm flex items-center group-hover:underline">
                              Start Protocol Wizard 
                              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                          </span>
                      </button>

                      {/* Documents Card */}
                      <button 
                        onClick={() => setMode('research-tools')}
                        className="bg-white rounded-[2.5rem] p-10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all border border-slate-200 text-left group relative overflow-hidden"
                      >
                          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                              <svg className="w-40 h-40 text-teal-600" fill="currentColor" viewBox="0 0 24 24"><path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                          </div>
                          <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-teal-600 group-hover:text-white transition-colors text-teal-600">
                              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                          </div>
                          <h3 className="text-2xl font-bold text-slate-900 mb-3">Research Document Builder</h3>
                          <p className="text-slate-500 leading-relaxed mb-6">
                              Draft Informed Consent forms, Survey Instruments, Interview Guides, and Recruitment Materials with PhD-level mentorship.
                          </p>
                          <span className="text-teal-600 font-bold text-sm flex items-center group-hover:underline">
                              Open Research Toolkit
                              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                          </span>
                      </button>
                  </div>
              </div>
          )}

          {mode === 'wizard' && (
             <ProtocolWizard 
               facts={studyFacts} 
               setFacts={setStudyFacts}
               onNavigate={(newMode) => setMode(newMode)}
             />
          )}
          
          {mode === 'research-tools' && (
             <ResearchDocBuilder 
               onBack={() => setMode('home')} 
               studyFacts={studyFacts}
             />
          )}
      </main>

      <footer className="text-center py-12 text-sm text-slate-400 bg-white border-t border-slate-100">
        <p>LionIRB Assist &copy; {new Date().getFullYear()} Penn State University. Designed to reduce protocol anxiety.</p>
      </footer>
    </div>
  );
};

export default App;
