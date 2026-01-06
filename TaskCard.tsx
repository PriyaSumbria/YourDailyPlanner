
import React, { useState, useEffect, useRef } from 'react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onStatusUpdate: (id: string, status: Task['status']) => void;
  onEdit: (task: Task) => void;
  onReorder: (draggedId: string, droppedOnId: string) => void;
  isCurrent: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onStatusUpdate, onEdit, onReorder, isCurrent }) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const prevStatusRef = useRef<Task['status']>(task.status);

  useEffect(() => {
    if (prevStatusRef.current !== 'Completed' && task.status === 'Completed') {
      setShowAnimation(true);
      const timer = setTimeout(() => setShowAnimation(false), 3800);
      return () => clearTimeout(timer);
    }
    prevStatusRef.current = task.status;
  }, [task.status]);

  const categoryColors = {
    Work: 'bg-blue-100 text-blue-700 border-blue-200',
    Personal: 'bg-purple-100 text-purple-700 border-purple-200',
    Health: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Leisure: 'bg-amber-100 text-amber-700 border-amber-200',
    Other: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const priorityColors = {
    High: 'text-rose-600 bg-rose-50 border-rose-100',
    Medium: 'text-amber-600 bg-amber-50 border-amber-100',
    Low: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  };

  const statusIcons = {
    Pending: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    'In-Progress': (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    Completed: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    Missed: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', task.id);
    setIsDragging(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const draggedId = e.dataTransfer.getData('text/plain');
    if (draggedId !== task.id) {
      onReorder(draggedId, task.id);
    }
  };

  return (
    <div 
      draggable 
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative group transition-all rounded-2xl border cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-40 scale-95' : 'opacity-100'} ${isCurrent ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-100/50' : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-lg hover:shadow-slate-200/40'} p-4 overflow-hidden`}
    >
      
      {/* Completion Animation Overlay */}
      {showAnimation && (
        <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex items-center justify-center animate-out fade-out fill-mode-forwards delay-[3400ms] duration-300">
          <div className="relative w-24 h-24 flex items-center justify-center">
            
            {/* Brain Component */}
            <div className="absolute top-0 animate-brain-move">
               <svg viewBox="0 0 24 24" className="w-10 h-10 text-indigo-500 fill-current drop-shadow-md animate-brain-pulse">
                <path d="M12 2c-4.42 0-8 3.58-8 8 0 1.66.89 3.13 2.22 4.14-.14.28-.22.58-.22.86 0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2 0-.28-.08-.58-.22-.86C19.11 13.13 20 11.66 20 10c0-4.42-3.58-8-8-8zM11 15.5h-1c-.55 0-1-.45-1-1s.45-1 1-1h1v2zm0-3h-1c-.55 0-1-.45-1-1s.45-1 1-1h1v2zm4 3h-1v-2h1c.55 0 1 .45 1 1s-.45 1-1 1zm0-3h-1v-2h1c.55 0 1 .45 1 1s-.45 1-1 1z" />
               </svg>
            </div>

            {/* Glass Component */}
            <div className="absolute bottom-2 w-10 h-14 border-2 border-slate-300 rounded-b-lg border-t-0 overflow-hidden bg-slate-50/50">
              <div className="absolute bottom-0 w-full bg-indigo-500/80 animate-liquid-flow shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                <div className="absolute top-0 left-0 w-[200%] h-2 bg-indigo-400/50 -translate-y-1 animate-wave" />
              </div>
            </div>

            <p className="absolute -bottom-1 text-[10px] font-black text-indigo-600 uppercase tracking-widest animate-pulse">Fueling Focus</p>
          </div>
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        {/* Drag Handle */}
        <div className="pt-2 text-slate-300 group-hover:text-slate-400 transition-colors hidden sm:block">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
           </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${categoryColors[task.category]}`}>
              {task.category}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityColors[task.priority]}`}>
              {task.priority} Priority
            </span>
            {task.reminderMinutes && task.reminderMinutes > 0 && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-100" title={`Reminder set for ${task.reminderMinutes} mins before`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {task.reminderMinutes}m Reminder
              </span>
            )}
            {task.status !== 'Pending' && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                task.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                task.status === 'In-Progress' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                'bg-rose-50 text-rose-700 border-rose-100'
              }`}>
                {task.status === 'Completed' ? 'Done' : task.status}
              </span>
            )}
          </div>
          
          <h3 className={`text-lg font-bold truncate ${task.status === 'Completed' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
            {task.title}
          </h3>
          
          <div className="flex items-center space-x-3 mt-2 text-sm font-medium text-slate-500">
             <div className="flex items-center space-x-1.5">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
               </svg>
               <span className="tabular-nums">{task.startTime} - {task.endTime}</span>
             </div>
             {isCurrent && (
               <span className="flex items-center space-x-1 text-indigo-600 font-bold">
                 <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                 </span>
                 <span>Now</span>
               </span>
             )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit(task); }}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              title="Edit Task"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>

          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => onStatusUpdate(task.id, task.status === 'Completed' ? 'Pending' : 'Completed')}
              className={`p-2 rounded-xl transition-all ${
                task.status === 'Completed' 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600'
              }`}
              title={task.status === 'Completed' ? "Mark as Not Done" : "Mark as Done"}
            >
              {statusIcons.Completed}
            </button>
            <button 
              onClick={() => onStatusUpdate(task.id, task.status === 'In-Progress' ? 'Pending' : 'In-Progress')}
              className={`p-2 rounded-xl transition-all ${
                task.status === 'In-Progress' 
                  ? 'bg-indigo-100 text-indigo-700' 
                  : 'bg-slate-100 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600'
              }`}
              title="In Progress"
            >
              {statusIcons['In-Progress']}
            </button>
            <button 
              onClick={() => onStatusUpdate(task.id, task.status === 'Missed' ? 'Pending' : 'Missed')}
              className={`p-2 rounded-xl transition-all ${
                task.status === 'Missed' 
                  ? 'bg-rose-100 text-rose-700' 
                  : 'bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-600'
              }`}
              title="Not Completed"
            >
              {statusIcons.Missed}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes liquid-flow {
          0% { height: 0%; }
          30% { height: 90%; }
          45% { height: 90%; }
          80% { height: 0%; }
          100% { height: 0%; }
        }
        @keyframes wave {
          from { transform: translateX(-50%) translateY(-2px); }
          to { transform: translateX(0%) translateY(-2px); }
        }
        @keyframes brain-move {
          0% { transform: translateY(-40px); opacity: 0; }
          25% { transform: translateY(5px); opacity: 1; }
          40% { transform: translateY(5px); }
          80% { transform: translateY(5px) scale(1.1); }
          100% { transform: translateY(5px) scale(1); }
        }
        @keyframes brain-pulse {
          0%, 100% { filter: drop-shadow(0 0 2px rgba(99,102,241,0.2)); }
          50% { filter: drop-shadow(0 0 10px rgba(99,102,241,0.6)); }
        }
        .animate-liquid-flow {
          animation: liquid-flow 3.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .animate-wave {
          animation: wave 1s linear infinite;
        }
        .animate-brain-move {
          animation: brain-move 3.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-brain-pulse {
          animation: brain-pulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default TaskCard;
