
import React, { useRef } from 'react';
import type { CourseLevel, ClassSize } from '../types';
import { PRIVACY_DISCLAIMER } from '../constants';

interface CourseInputProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  level: CourseLevel;
  onLevelChange: (val: CourseLevel) => void;
  size: ClassSize;
  onSizeChange: (val: ClassSize) => void;
  onFileUpload: (file: File | null) => void;
  fileName: string | null;
}

const CourseInput: React.FC<CourseInputProps> = ({ 
  value, 
  onChange,
  level,
  onLevelChange,
  size,
  onSizeChange,
  onFileUpload,
  fileName
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Course Level</label>
          <div className="relative">
             <select 
                value={level}
                onChange={(e) => onLevelChange(e.target.value as CourseLevel)}
                className="w-full p-4 bg-slate-50 border-none rounded-xl text-base text-slate-900 focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none font-medium cursor-pointer hover:bg-slate-100 transition-colors shadow-sm"
              >
                <option value="100 (Introductory)">100 (Introductory)</option>
                <option value="200 (Intermediate)">200 (Intermediate)</option>
                <option value="300 (Advanced)">300 (Advanced)</option>
                <option value="400 (Senior/Capstone)">400 (Senior/Capstone)</option>
                <option value="Graduate">Graduate</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Class Size</label>
          <input 
             type="text"
             value={size}
             onChange={(e) => onSizeChange(e.target.value)}
             placeholder="e.g. 25, 300, Online..."
             className="w-full p-4 bg-slate-50 border-none rounded-xl text-base text-slate-900 focus:ring-2 focus:ring-blue-500/20 outline-none font-medium placeholder-slate-400 hover:bg-slate-100 transition-colors shadow-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
          Upload Context (Syllabus or Assignment)
        </label>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`px-5 py-3 rounded-xl text-sm font-bold transition-all flex items-center shadow-sm ${
                fileName 
                ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            {fileName ? 'Replace File' : 'Choose PDF or Text File'}
          </button>
          
          {fileName && (
             <div className="flex items-center bg-white border border-slate-200 rounded-lg px-4 py-2 shadow-sm">
                 <span className="text-sm text-slate-600 truncate max-w-[180px] mr-3 font-medium">
                    {fileName}
                 </span>
                 <button onClick={() => onFileUpload(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                 </button>
             </div>
          )}
        </div>
        <p className="mt-2 text-[10px] text-slate-400 leading-tight max-w-lg">
           Supported formats: .pdf, .txt. For Word docs, please export to PDF first. <br/>
           {PRIVACY_DISCLAIMER}
        </p>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".pdf,.txt" 
          className="hidden" 
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Context / Description</label>
        <textarea
          value={value}
          onChange={onChange}
          placeholder="Describe your course, OR paste the text of an existing assignment you want to refine or map to rubrics..."
          className="w-full h-40 p-5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 resize-none text-base text-slate-900 placeholder-slate-400 hover:bg-slate-100 shadow-sm leading-relaxed"
        />
      </div>
    </div>
  );
};

export default CourseInput;
