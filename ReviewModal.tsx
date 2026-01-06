
import React, { useState } from 'react';
import { DayReview, Task } from '../types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  review: DayReview | null;
  isLoading: boolean;
  tasks: Task[];
  onPlanTomorrow: (carryOverTasks: Task[], userNotes?: string) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, review, isLoading, tasks, onPlanTomorrow }) => {
  const incompleteTasks = tasks.filter(t => t.status !== 'Completed');
  const [selectedCarryOverIds, setSelectedCarryOverIds] = useState<Set<string>>(
    new Set(incompleteTasks.map(t => t.id))
  );
  const [userThoughts, setUserThoughts] = useState('');

  if (!isOpen) return null;

  const toggleCarryOver = (id: string) => {
    const next = new Set(selectedCarryOverIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedCarryOverIds(next);
  };

  const handlePlanTomorrow = () => {
    const carryOver = tasks.filter(t => selectedCarryOverIds.has(t.id));
    onPlanTomorrow(carryOver, userThoughts);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-[#f8faff] rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-[#5e54ff]">
          <h3 className="text-xl font-bold text-white flex items-center gap-3">
            <div className="bg-white/20 p-1 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            Daily Insight Report
          </h3>
          <button onClick={onClose} className="p-2 text-white/80 hover:text-white rounded-full transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#5e54ff] border-t-transparent"></div>
              <p className="text-slate-500 font-medium">Gemini is reflecting on your progress...</p>
            </div>
          ) : review ? (
            <>
              {/* Productivity Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-slate-50 flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Productivity Score</h4>
                  <p className="text-6xl font-black text-[#1e293b] leading-none">{review.productivityScore}%</p>
                </div>
                <div className="w-24 h-24 sm:w-32 sm:h-32 relative flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" stroke="#f1f5f9" strokeWidth="12" fill="transparent" />
                    <circle 
                      cx="50" cy="50" r="42" 
                      stroke="#5e54ff" strokeWidth="12" 
                      fill="transparent" 
                      strokeDasharray="263.89" 
                      strokeDashoffset={263.89 - (263.89 * review.productivityScore) / 100} 
                      className="transition-all duration-1000 ease-out"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-black text-[#5e54ff] uppercase tracking-widest">Active</span>
                </div>
              </div>

              {/* The Verdict */}
              <div className="space-y-3">
                <h4 className="text-lg font-bold text-[#1e293b]">The Verdict</h4>
                <div className="bg-white p-6 rounded-2xl shadow-sm border-l-[6px] border-[#d1d5ff]">
                   <p className="text-slate-600 leading-relaxed italic text-sm">
                    "{review.summary}"
                   </p>
                </div>
              </div>

              {/* Wins and Friction Grid */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="font-black text-[#10b981] text-xs uppercase tracking-widest">Wins</h5>
                  <div className="space-y-2">
                    {review.accomplishments.map((acc, i) => (
                      <div key={i} className="text-xs text-slate-600 bg-[#f0fdf4] p-4 rounded-xl border border-[#dcfce7] shadow-sm font-medium">
                        {acc}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h5 className="font-black text-[#ef4444] text-xs uppercase tracking-widest">Friction</h5>
                  <div className="space-y-2">
                    {review.missedOpportunities.map((miss, i) => (
                      <div key={i} className="text-xs text-slate-600 bg-[#fef2f2] p-4 rounded-xl border border-[#fee2e2] shadow-sm font-medium">
                        {miss}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* User Thoughts Section */}
              <div className="space-y-3 pt-2">
                <h4 className="text-lg font-bold text-[#1e293b]">Personal Reflections</h4>
                <textarea
                  value={userThoughts}
                  onChange={(e) => setUserThoughts(e.target.value)}
                  placeholder="How do you feel about today? Any specific thoughts or reviews for that day?"
                  className="w-full h-32 p-4 rounded-2xl bg-white border border-slate-200 focus:ring-2 focus:ring-[#5e54ff] outline-none text-sm text-slate-700 resize-none shadow-sm transition-all"
                />
              </div>

              {/* Carry Over Section */}
              {incompleteTasks.length > 0 && (
                <div className="pt-4 space-y-4">
                  <h4 className="text-lg font-bold text-[#1e293b] flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-amber-500 rounded-full"></span>
                    Carry Over to Tomorrow?
                  </h4>
                  <div className="grid gap-2">
                    {incompleteTasks.map(task => (
                      <label 
                        key={task.id} 
                        className={`flex items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                          selectedCarryOverIds.has(task.id) 
                            ? 'bg-amber-50 border-amber-200 text-amber-900 shadow-sm' 
                            : 'bg-white border-slate-100 text-slate-400'
                        }`}
                      >
                        <input 
                          type="checkbox" 
                          checked={selectedCarryOverIds.has(task.id)}
                          onChange={() => toggleCarryOver(task.id)}
                          className="w-5 h-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-bold">{task.title}</p>
                          <p className="text-[10px] uppercase font-bold opacity-60">{task.category} • {task.status}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-slate-400 py-10">No review data available.</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-white flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-4 text-slate-600 font-black uppercase tracking-widest text-xs hover:bg-slate-50 rounded-2xl border border-slate-200 transition-all"
          >
            Just Close
          </button>
          <button
            onClick={handlePlanTomorrow}
            className="flex-[2] py-4 bg-gradient-to-r from-[#5e54ff] to-[#8077ff] text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:shadow-xl hover:shadow-[#5e54ff33] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            Plan Tomorrow
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
