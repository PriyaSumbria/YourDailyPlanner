
import React, { useMemo } from 'react';
import { DayStats, Task } from '../types';

interface DashboardProps {
  currentTasks: Task[];
  history: DayStats[];
  onBack: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ currentTasks, history, onBack }) => {
  // Current Day Stats
  const dailyStats = useMemo(() => {
    const total = currentTasks.length;
    // Fix: ensure dailyStats has a date property for type compatibility in monthlyStats
    const today = new Date().toISOString().split('T')[0];
    
    if (total === 0) return { 
      date: today,
      completed: 0, 
      pending: 0, 
      missed: 0, 
      total: 0, 
      percentages: { completed: 0, pending: 0, missed: 0 } 
    };
    
    const completed = currentTasks.filter(t => t.status === 'Completed').length;
    const missed = currentTasks.filter(t => t.status === 'Missed').length;
    const pending = total - completed - missed;
    
    return {
      date: today,
      completed, pending, missed, total,
      percentages: {
        completed: (completed / total) * 100,
        pending: (pending / total) * 100,
        missed: (missed / total) * 100
      }
    };
  }, [currentTasks]);

  // Monthly Data
  const monthlyStats = useMemo(() => {
    // Fix: extract today's date once for cleaner logic
    const today = new Date().toISOString().split('T')[0];
    const last30Days = [...Array(30)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    return last30Days.map(date => {
      const entry = history.find(h => h.date === date);
      if (entry) return entry;
      // If it's today and not in history yet, use current tasks
      // dailyStats now includes the 'date' property, fixing TypeScript errors
      if (date === today) return dailyStats;
      return { date, completed: 0, pending: 0, missed: 0, total: 0 };
    });
  }, [history, dailyStats]);

  const avgCompletion = useMemo(() => {
    const recordsWithTasks = monthlyStats.filter(s => s.total > 0);
    if (recordsWithTasks.length === 0) return 0;
    const sum = recordsWithTasks.reduce((acc, curr) => acc + (curr.completed / curr.total), 0);
    return Math.round((sum / recordsWithTasks.length) * 100);
  }, [monthlyStats]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Planner
        </button>
        <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Insights Dashboard</h2>
      </div>

      {/* Daily Progress Card */}
      <section className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
          Today's Momentum
        </h3>

        <div className="space-y-8">
          {/* Animated Stacked Bar */}
          <div className="h-10 w-full bg-slate-100 rounded-2xl overflow-hidden flex shadow-inner border border-slate-50">
            <div 
              style={{ width: `${dailyStats.percentages.completed}%` }}
              className="h-full bg-emerald-500 transition-all duration-1000 ease-out relative group"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div 
              style={{ width: `${dailyStats.percentages.pending}%` }}
              className="h-full bg-indigo-400 transition-all duration-1000 ease-out delay-100"
            />
            <div 
              style={{ width: `${dailyStats.percentages.missed}%` }}
              className="h-full bg-rose-400 transition-all duration-1000 ease-out delay-200"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
              <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">Completed</p>
              <p className="text-3xl font-black text-emerald-900">{dailyStats.completed}</p>
            </div>
            <div className="text-center p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
              <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-1">Pending</p>
              <p className="text-3xl font-black text-indigo-900">{dailyStats.pending}</p>
            </div>
            <div className="text-center p-4 rounded-2xl bg-rose-50 border border-rose-100">
              <p className="text-xs font-black text-rose-600 uppercase tracking-widest mb-1">Missed</p>
              <p className="text-3xl font-black text-rose-900">{dailyStats.missed}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Monthly Chart */}
      <section className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-emerald-500 rounded-full"></span>
            Monthly Consistency
          </h3>
          <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-black">
            AVG: {avgCompletion}% SCORE
          </div>
        </div>

        <div className="h-64 flex items-end justify-between gap-1 sm:gap-2 px-2">
          {monthlyStats.map((day, i) => {
            const completionRate = day.total > 0 ? (day.completed / day.total) * 100 : 0;
            return (
              <div 
                key={day.date} 
                className="flex-1 group relative flex flex-col items-center justify-end h-full"
              >
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                   <div className="bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded-md whitespace-nowrap shadow-xl">
                      {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}: {Math.round(completionRate)}%
                   </div>
                   <div className="w-2 h-2 bg-slate-800 rotate-45 mx-auto -mt-1" />
                </div>

                <div 
                  style={{ height: `${Math.max(completionRate, 4)}%` }}
                  className={`w-full rounded-t-sm sm:rounded-t-md transition-all duration-700 ease-out delay-[${i * 20}ms] ${
                    completionRate > 70 ? 'bg-emerald-500' : 
                    completionRate > 40 ? 'bg-amber-400' : 
                    day.total > 0 ? 'bg-rose-400' : 'bg-slate-100'
                  } group-hover:brightness-110`}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
          <span>30 Days Ago</span>
          <span>Today</span>
        </div>
      </section>

      <div className="p-6 bg-indigo-600 rounded-3xl text-white shadow-xl shadow-indigo-200">
        <h4 className="font-bold mb-2">Did you know?</h4>
        <p className="text-indigo-100 text-sm leading-relaxed">
          Users who complete at least 3 tasks early in the morning are 40% more likely to reach their daily goals. Keep the momentum going!
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
