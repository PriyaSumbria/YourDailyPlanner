
import React, { useState } from 'react';
import { Task } from '../types';

interface SetupFormProps {
  onGenerate: (input: string, start: string, end: string, carryOver: Task[], date: string) => void;
  initialStart?: string;
  initialEnd?: string;
  initialDate?: string;
  carryOverTasks?: Task[];
  onRemoveCarryOver?: (id: string) => void;
}

const SetupForm: React.FC<SetupFormProps> = ({ 
  onGenerate, 
  initialStart = '08:00', 
  initialEnd = '22:00',
  initialDate = new Date().toISOString().split('T')[0],
  carryOverTasks = [],
  onRemoveCarryOver
}) => {
  const [input, setInput] = useState('');
  const [startTime, setStartTime] = useState(initialStart);
  const [endTime, setEndTime] = useState(initialEnd);
  const [targetDate, setTargetDate] = useState(initialDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() || carryOverTasks.length > 0) {
      onGenerate(input, startTime, endTime, carryOverTasks, targetDate);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-6 md:p-8 border border-slate-100">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Design Your Day</h2>
        <p className="text-slate-500">Tell Gemini about your goals. Select the date and set your day start/end alarms.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {carryOverTasks.length > 0 && (
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <h4 className="text-xs font-black text-amber-800 uppercase tracking-widest mb-3">Tasks from Yesterday</h4>
            <div className="flex flex-wrap gap-2">
              {carryOverTasks.map(task => (
                <div key={task.id} className="flex items-center gap-1.5 bg-white border border-amber-200 px-3 py-1.5 rounded-lg shadow-sm">
                  <span className="text-sm font-bold text-amber-900">{task.title}</span>
                  <button 
                    type="button"
                    onClick={() => onRemoveCarryOver?.(task.id)}
                    className="p-0.5 text-amber-400 hover:text-amber-600 rounded transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Schedule Date</label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-700 bg-[#404040] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-white mb-2"
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-semibold text-slate-700 mb-2">What's new on your mind today?</label>
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-40 p-4 rounded-xl border border-slate-700 bg-[#404040] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none text-white placeholder-slate-400"
              placeholder="E.g. Also need to attend the town hall and buy groceries."
              required={carryOverTasks.length === 0}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Day Start Alarm</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-700 bg-[#404040] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Day End Alarm</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-700 bg-[#404040] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!input.trim() && carryOverTasks.length === 0}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center justify-center space-x-2 active:scale-[0.98]"
        >
          <span>Generate Schedule & Set Alarms</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.3 1.047a1 1 0 01.897.95V4.41c.927-.36 1.926-.55 2.953-.55 1.307 0 2.546.307 3.645.852a1 1 0 11-.89 1.795 7.001 7.001 0 00-11.71 5.488 1 1 0 01-1.99.102 9.001 9.001 0 0115.557-5.076 1 1 0 01-.11 1.41l-1.414 1.414a1 1 0 01-1.414 0L15.3 8.354l-1.414 1.414a1 1 0 01-1.414 0L11.058 8.354 9.644 9.768a1 1 0 01-1.414 0L6.816 8.354 5.402 9.768a1 1 0 11-1.414-1.414l1.414-1.414L4 5.526V1.997a1 1 0 01.897-.95 9.001 9.001 0 016.403 0z" clipRule="evenodd" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default SetupForm;
