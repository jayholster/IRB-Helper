
import React, { useEffect, useState } from 'react';
import type { SharedAssignment } from '../types';
import { getRepository } from '../services/repositoryService';

interface RepositoryGalleryProps {
  onBack: () => void;
  onAdopt: (assignment: SharedAssignment) => void;
}

const RepositoryGallery: React.FC<RepositoryGalleryProps> = ({ onBack, onAdopt }) => {
  const [items, setItems] = useState<SharedAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRepo();
  }, []);

  const loadRepo = async () => {
    setLoading(true);
    const data = await getRepository();
    setItems(data);
    setLoading(false);
  };

  return (
    <div className="animate-fadeIn min-h-screen pb-20">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
         <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Assignment Commons</h2>
            <p className="text-slate-500 mt-2">Browse and adapt peer-reviewed assignments from across the university.</p>
         </div>
         <button 
           onClick={onBack}
           className="self-start md:self-auto px-6 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-sm flex items-center"
         >
           <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" /></svg>
           Back to Designer
         </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[1,2,3,4,5,6].map(i => (
             <div key={i} className="h-64 bg-white rounded-2xl border border-slate-100 shadow-sm animate-pulse"></div>
           ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
           {items.map((item) => (
             <div key={item.id} className="bg-white border border-slate-200 rounded-3xl p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 group flex flex-col relative overflow-hidden">
                {item.author.includes('You') && (
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-green-500"></div>
                )}
                
                <div className="mb-6 flex-1">
                    <div className="flex justify-between items-start mb-4">
                        <span className="inline-block px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest rounded-full">
                            {item.level.split(' ')[0]} Level
                        </span>
                        <div className="flex items-center space-x-2">
                             {item.tags.slice(0, 1).map((tag, idx) => (
                                 <span key={idx} className="text-[10px] text-slate-400 font-medium border border-slate-100 px-2 py-0.5 rounded-full">{tag}</span>
                             ))}
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[#1E407C] transition-colors leading-tight">
                        {item.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3">
                        {item.description}
                    </p>
                </div>

                <div className="border-t border-slate-100 pt-5 flex items-center justify-between mt-auto">
                    <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mr-3 ${item.author.includes('You') ? 'bg-green-100 text-green-700' : 'bg-[#1E407C] text-white'}`}>
                            {item.author.charAt(0)}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-900">{item.author}</p>
                            <p className="text-[10px] text-slate-400">{item.date}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => onAdopt(item)}
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-900 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold flex items-center"
                        title="Load this idea into the designer to refine or generate materials"
                    >
                        Remix
                        <svg className="w-3.5 h-3.5 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};

export default RepositoryGallery;
