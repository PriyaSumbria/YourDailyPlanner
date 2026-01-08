

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Task, AppView, DayReview, DayStats, RingtoneType } from './types';
import TaskCard from './TaskCard';
import SetupForm from './SetupForm';
import Header from './Header';
import NotificationPanel from './NotificationPanel';
import TaskFormModal from './TaskFormModal';
import ReviewModal from './ReviewModal';
import Dashboard from './Dashboard';
import SettingsModal from './SettingsModal';

const generateTimetableAPI = async (
  userInput: string,
  dayStart: string,
  dayEnd: string,
  carryOverTasks: Task[]
): Promise<Task[]> => {
  const res = await fetch('/api/generateTimetable', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userInput,
      dayStart,
      dayEnd,
      carryOverTasks,
    }),
  });

  if (!res.ok) {
    throw new Error('Failed to generate timetable');
  }

  const data = await res.json();

  return data.tasks.map((task: any, index: number) => ({
    ...task,
    id: `task-${Date.now()}-${index}`,
    status: 'Pending',
    notified: false,
  }));
};

const generateDayReviewAPI = async (tasks: Task[]): Promise<DayReview> => {
  const res = await fetch('/api/generateDayReview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tasks }),
  });

  if (!res.ok) {
    throw new Error('Failed to generate day review');
  }

  return res.json();
};


const App: React.FC = () => {
  const [view, setView] = useState<AppView>('Setup');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [carryOverTasks, setCarryOverTasks] = useState<Task[]>([]);
  const [history, setHistory] = useState<DayStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState<{ id: string; message: string; type: 'start' | 'end' | 'system'; taskId?: string }[]>([]);
  
  // Day Configuration State
  const [dayStart, setDayStart] = useState('08:00');
  const [dayEnd, setDayEnd] = useState('22:00');
  const [alarmDate, setAlarmDate] = useState(new Date().toISOString().split('T')[0]);
  const [firedAlarms, setFiredAlarms] = useState<Set<string>>(new Set());
  const [selectedRingtone, setSelectedRingtone] = useState<RingtoneType>('Classic');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [currentReview, setCurrentReview] = useState<DayReview | null>(null);
  const [isReviewLoading, setIsReviewLoading] = useState(false);

  // Audio Context for Alarm
  const audioContextRef = useRef<AudioContext | null>(null);
  const swRegistrationRef = useRef<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      window.removeEventListener('click', initAudio);
    };
    window.addEventListener('click', initAudio);

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        swRegistrationRef.current = reg;
      });
    }

    return () => window.removeEventListener('click', initAudio);
  }, []);

  const playAlarmSound = useCallback((ringtone: RingtoneType = selectedRingtone) => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    switch (ringtone) {
      case 'Pulse':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.1);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.3);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
        break;
      case 'Echo':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
        break;
      case 'Digital':
        osc.type = 'square';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.setValueAtTime(0, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0, ctx.currentTime + 0.15);
        break;
      default:
        osc.type = 'square';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 1.2);
  }, [selectedRingtone]);

  // Persistent storage load
  useEffect(() => {
    const savedTasks = localStorage.getItem('aether_tasks');
    const savedConfig = localStorage.getItem('aether_config');
    const savedCarry = localStorage.getItem('aether_carryover');
    const savedHistory = localStorage.getItem('aether_history');
    
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
      setView('Active');
    }
    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setDayStart(config.dayStart);
      setDayEnd(config.dayEnd);
      setAlarmDate(config.alarmDate || new Date().toISOString().split('T')[0]);
      setSelectedRingtone(config.selectedRingtone || 'Classic');
    }
    if (savedCarry) {
      setCarryOverTasks(JSON.parse(savedCarry));
    }
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }

    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  // Persistent storage save
  useEffect(() => {
    localStorage.setItem('aether_tasks', JSON.stringify(tasks));
    localStorage.setItem('aether_config', JSON.stringify({ dayStart, dayEnd, alarmDate, selectedRingtone }));
    localStorage.setItem('aether_carryover', JSON.stringify(carryOverTasks));
    localStorage.setItem('aether_history', JSON.stringify(history));
  }, [tasks, dayStart, dayEnd, alarmDate, carryOverTasks, history, selectedRingtone]);

  const triggerNotification = useCallback((message: string, type: 'start' | 'end' | 'system', taskId?: string) => {
    const id = `${taskId || 'sys'}-${type}-${Date.now()}`;
    playAlarmSound();

    if ("Notification" in window && Notification.permission === "granted") {
      const options = {
        body: message,
        vibrate: [200, 100, 200],
        tag: id,
        renotify: true,
        requireInteraction: true
      };

      if (swRegistrationRef.current) {
        swRegistrationRef.current.showNotification("Aether Planner", options);
      } else {
        new Notification("Aether Planner", options);
      }
    }
    setNotifications(prev => [...prev, { id, message, type, taskId }]);
  }, [playAlarmSound]);

  const recordDayStats = useCallback((userNotes?: string) => {
    if (tasks.length === 0) return;
    const stats: DayStats = {
      date: alarmDate,
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'Completed').length,
      missed: tasks.filter(t => t.status === 'Missed').length,
      pending: tasks.filter(t => t.status === 'Pending' || t.status === 'In-Progress').length,
      userNotes
    };
    setHistory(prev => {
      const filtered = prev.filter(h => h.date !== alarmDate);
      return [...filtered, stats];
    });
  }, [tasks, alarmDate]);

  const handleDayEndAlarm = async () => {
  setIsReviewOpen(true);
  setIsReviewLoading(true);

  try {
    const review = await generateDayReviewAPI(tasks);
    setCurrentReview(review);
  } catch (error) {
    console.error('Failed to generate review:', error);
  } finally {
    setIsReviewLoading(false);
  }
};

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      const dateStr = now.toISOString().split('T')[0];
      
      tasks.forEach(task => {
        if (task.startTime === timeStr && task.status === 'Pending' && !task.notified) {
          triggerNotification(`Time to start: ${task.title}`, 'start', task.id);
          updateTaskStatus(task.id, 'In-Progress');
          setTasks(prev => prev.map(t => t.id === task.id ? { ...t, notified: true } : t));
        }
        if (task.reminderMinutes && task.reminderMinutes > 0 && !task.reminderFired && task.status === 'Pending') {
          const [h, m] = task.startTime.split(':').map(Number);
          const startDateTime = new Date();
          startDateTime.setHours(h, m, 0, 0);
          const reminderTime = new Date(startDateTime.getTime() - task.reminderMinutes * 60000);
          const reminderStr = reminderTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
          if (reminderStr === timeStr) {
            triggerNotification(`Upcoming Task: ${task.title} starts in ${task.reminderMinutes} mins`, 'system', task.id);
            setTasks(prev => prev.map(t => t.id === task.id ? { ...t, reminderFired: true } : t));
          }
        }
        if (task.endTime === timeStr && task.status === 'In-Progress') {
           triggerNotification(`Did you complete: ${task.title}?`, 'end', task.id);
        }
      });

      if (dateStr === alarmDate) {
        const startAlarmKey = `start-${alarmDate}`;
        if (timeStr === dayStart && !firedAlarms.has(startAlarmKey)) {
          triggerNotification("Your planned day has begun!", 'system');
          setFiredAlarms(prev => new Set(prev).add(startAlarmKey));
        }
        const endAlarmKey = `end-${alarmDate}`;
        if (timeStr === dayEnd && !firedAlarms.has(endAlarmKey)) {
          triggerNotification("Planned day complete! Time to review.", 'system');
          setFiredAlarms(prev => new Set(prev).add(endAlarmKey));
          handleDayEndAlarm();
        }
      }
    }, 10000);
    return () => clearInterval(timer);
  }, [tasks, dayStart, dayEnd, alarmDate, firedAlarms, triggerNotification]);

  const handleGenerate = async (
  input: string,
  start: string,
  end: string,
  carryOver: Task[],
  selectedDate: string
) => {
  setIsLoading(true);
  setDayStart(start);
  setDayEnd(end);
  setAlarmDate(selectedDate);

  try {
    const generatedTasks = await generateTimetableAPI(input, start, end, carryOver);
    const orderedTasks = generatedTasks.map((t, i) => ({ ...t, order: i }));

    setTasks(orderedTasks);
    setCarryOverTasks([]);
    setView('Active');
  } catch (error) {
    console.error(error);
    alert('Failed to generate timetable.');
  } finally {
    setIsLoading(false);
  }
};


  const updateTaskStatus = (id: string, status: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const handleTaskSubmit = (taskData: Partial<Task>) => {
    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...taskData } as Task : t));
    } else {
      const newTask: Task = {
        ...taskData,
        id: `manual-task-${Date.now()}`,
        status: 'Pending',
        notified: false,
        order: tasks.length
      } as Task;
      setTasks(prev => [...prev, newTask]);
    }
    setEditingTask(null);
  };

  const handleReorderTasks = (draggedId: string, droppedOnId: string) => {
    setTasks(prev => {
      const newList = [...prev];
      const draggedIndex = newList.findIndex(t => t.id === draggedId);
      const droppedIndex = newList.findIndex(t => t.id === droppedOnId);
      const [draggedItem] = newList.splice(draggedIndex, 1);
      newList.splice(droppedIndex, 0, draggedItem);
      return newList.map((t, i) => ({ ...t, order: i }));
    });
  };

  const openAddModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to clear your current schedule? This will record today's stats and return you to the design screen.")) {
      recordDayStats();
      setTasks([]);
      setView('Setup');
      localStorage.removeItem('aether_tasks');
      setCurrentReview(null);
    }
  };

  const handlePlanTomorrow = (carried: Task[], userNotes?: string) => {
    recordDayStats(userNotes);
    setCarryOverTasks(carried);
    setTasks([]);
    setView('Setup');
    localStorage.removeItem('aether_tasks');
    setCurrentReview(null);
  };

  const currentFormattedTime = currentTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header 
        currentTime={currentTime} 
        currentView={view}
        hasTasks={tasks.length > 0}
        onNavigate={setView}
        onReset={tasks.length > 0 ? handleReset : undefined}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl animate-in fade-in duration-500">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-slate-600 font-medium">Gemini is crafting your perfect day...</p>
          </div>
        ) : view === 'Setup' ? (
          <SetupForm 
            onGenerate={handleGenerate} 
            initialStart={dayStart} 
            initialEnd={dayEnd} 
            initialDate={alarmDate}
            carryOverTasks={carryOverTasks}
            onRemoveCarryOver={(id) => setCarryOverTasks(prev => prev.filter(t => t.id !== id))}
          />
        ) : view === 'Dashboard' ? (
          <Dashboard 
            currentTasks={tasks}
            history={history}
            onBack={() => setView(tasks.length > 0 ? 'Active' : 'Setup')}
          />
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
               <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">Your Daily Path</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-0.5 rounded uppercase tracking-tighter">
                      Scheduled: {alarmDate}
                    </span>
                    <span className="text-sm text-slate-500 font-medium">
                      {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
               </div>
               
               <div className="flex items-center gap-3">
                 <button 
                  onClick={() => handleDayEndAlarm()}
                  className="p-2 text-indigo-600 bg-white border border-indigo-100 rounded-xl hover:bg-indigo-50 transition-colors shadow-sm"
                  title="Generate Reflection Now"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                   </svg>
                 </button>
                 <div className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 shadow-sm">
                   {tasks.filter(t => t.status === 'Completed').length} / {tasks.length} Done
                 </div>
                 <button 
                  onClick={openAddModal}
                  className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-[0.98]"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                   </svg>
                   <span>Add</span>
                 </button>
               </div>
            </div>
            
            <div className="grid gap-4">
              {tasks.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-medium">No tasks for today yet.</p>
                </div>
              ) : (
                [...tasks].sort((a,b) => (a.order ?? 0) - (b.order ?? 0)).map((task) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onStatusUpdate={updateTaskStatus} 
                    onEdit={openEditModal}
                    onReorder={handleReorderTasks}
                    isCurrent={task.startTime <= currentFormattedTime && task.endTime > currentFormattedTime}
                  />
                ))
              )}
            </div>
            {tasks.length > 1 && (
              <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">
                Tip: Drag tasks by the handle to reorder them
              </p>
            )}
          </div>
        )}
      </main>

      <NotificationPanel 
        notifications={notifications} 
        onDismiss={dismissNotification}
        onCompleteTask={(taskId, notificationId) => {
          if (taskId) updateTaskStatus(taskId, 'Completed');
          dismissNotification(notificationId);
        }}
      />

      <TaskFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleTaskSubmit}
        initialData={editingTask}
      />

      <ReviewModal 
        isOpen={isReviewOpen} 
        onClose={() => setIsReviewOpen(false)} 
        review={currentReview} 
        isLoading={isReviewLoading} 
        tasks={tasks}
        onPlanTomorrow={handlePlanTomorrow}
      />

      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        selectedRingtone={selectedRingtone}
        onSelectRingtone={setSelectedRingtone}
        onPreviewRingtone={playAlarmSound}
      />
    </div>
  );
};

export default App;
