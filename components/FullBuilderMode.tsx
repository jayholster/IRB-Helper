
import React, { useRef, useState, useEffect } from 'react';
import type { StudyFacts, GeneratedProtocol, FileData } from '../types';
import { extractFromDocument, generateProtocolContent } from '../services/geminiService';
import { LOADING_MESSAGES } from '../constants';
import ProtocolViewer from './ProtocolViewer';

interface FullBuilderModeProps {
  setFacts: (facts: StudyFacts) => void;
  setReadinessScore: (score: number) => void;
}

const FullBuilderMode: React.FC<FullBuilderModeProps> = ({ setFacts, setReadinessScore }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [protocol, setProtocol] = useState<GeneratedProtocol | null>(null);
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Cycle loading messages
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isProcessing) {
        interval = setInterval(() => {
            setLoadingMsgIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
        }, 4000);
    }
    return () => clearInterval(interval);
  }, [isProcessing]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = async (file: File) => {
      setIsProcessing(true);
      setError(null);
      setStatus('Reading document...');
      
      try {
        const fileData = await readFile(file);
        
        // Step 1: Extract
        setStatus('Extracting Study Facts...');
        try {
            const extractedFacts = await extractFromDocument(fileData);
            setFacts(extractedFacts);
            setReadinessScore(80);

            // Step 2: Generate with Copilot
            setStatus('Drafting HRP-591 Protocol...');
            const proto = await generateProtocolContent(extractedFacts);
            
            // AI might return updated/normalized facts
            if (proto.study_facts) {
                setFacts(proto.study_facts);
            }
            
            setProtocol(proto);
            setReadinessScore(100);
        } catch (innerError) {
            console.error("AI Processing Error:", innerError);
            throw new Error("The AI could not process this document. Please ensure it is a clear text-based PDF or TXT file.");
        } 
      } catch (err: any) {
        console.error("File Processing Error:", err);
        setError(err.message || "Failed to process document.");
      } finally {
        setIsProcessing(false);
      }
  };

  const readFile = (file: File): Promise<FileData> => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader();
          
          if (file.type === 'application/pdf') {
              reader.readAsDataURL(file);
              reader.onload = () => {
                  const result = reader.result as string;
                  const base64 = result.split(',')[1];
                  resolve({ mimeType: 'application/pdf', data: base64 });
              };
              reader.onerror = (e) => reject(e);
          } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
              reader.readAsText(file);
              reader.onload = () => {
                  const text = reader.result as string;
                  resolve({ mimeType: 'text/plain', data: text });
              };
              reader.onerror = (e) => reject(e);
          } else {
              reject(new Error("Unsupported file type. Please upload a PDF or TXT file."));
          }
      });
  }

  if (isProcessing) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[400px] animate-fadeIn">
              <div className="w-20 h-20 border-4 border-slate-100 border-t-[#1E407C] rounded-full animate-spin mb-6"></div>
              <h3 className="text-xl font-bold text-slate-800 transition-all duration-500 min-h-[1.75rem]">
                 {status === 'Drafting HRP-591 Protocol...' ? LOADING_MESSAGES[loadingMsgIndex] : status}
              </h3>
              <p className="text-slate-500 mt-2 max-w-sm text-center">
                 {status === 'Drafting HRP-591 Protocol...' 
                    ? "Deep analysis in progress. We are checking compliance and generating 17+ sections." 
                    : "Please wait while we process your file."}
              </p>
          </div>
      );
  }

  if (error) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] animate-fadeIn text-center">
             <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
             </div>
             <h3 className="text-xl font-bold text-slate-800 mb-2">Process Failed</h3>
             <p className="text-slate-500 mb-8 max-w-md">{error}</p>
             <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#1E407C] text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-[#153060] transition-colors"
             >
                Try Another File
             </button>
             <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.txt" onChange={handleFileUpload} />
        </div>
      );
  }

  if (protocol) {
      return <ProtocolViewer protocol={protocol} />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] animate-fadeIn text-center">
        <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-slate-200 max-w-xl w-full">
            <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Upload Existing Material</h2>
            <p className="text-slate-500 mb-8 leading-relaxed">
                Drop a grant proposal, draft survey, or research notes. <br/>
                LionIRB will extract the study facts and draft the full protocol for you.
            </p>
            
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-purple-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-purple-700 transition-transform active:scale-95 w-full"
            >
                Select Document
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.txt" onChange={handleFileUpload} />
        </div>
    </div>
  );
};

export default FullBuilderMode;
