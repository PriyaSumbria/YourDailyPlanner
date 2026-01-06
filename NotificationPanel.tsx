
import React from 'react';

// Added specific interface for clarity
interface Notification {
  id: string;
  message: string;
  type: 'start' | 'end' | 'system';
  taskId?: string;
}

interface NotificationPanelProps {
  // Updated notifications type to match App.tsx state
  notifications: Notification[];
  onDismiss: (id: string) => void;
  // Updated taskId to be optional in the callback
  onCompleteTask: (taskId: string | undefined, notificationId: string) => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ notifications, onDismiss, onCompleteTask }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm space-y-3 px-4 sm:px-0">
      {notifications.map((notif) => (
        <div 
          key={notif.id}
          className="bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-slide-in-right p-4"
        >
          <div className="flex items-start space-x-3">
            {/* Added styling for system type */}
            <div className={`p-2 rounded-full ${
              notif.type === 'start' ? 'bg-indigo-100 text-indigo-600' : 
              notif.type === 'end' ? 'bg-emerald-100 text-emerald-600' : 
              'bg-amber-100 text-amber-600'
            }`}>
              {notif.type === 'start' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              ) : notif.type === 'end' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              )}
            </div>
            
            <div className="flex-1">
              <h4 className="text-sm font-bold text-slate-800">Planner Alert</h4>
              <p className="text-sm text-slate-600 mt-1">{notif.message}</p>
              
              <div className="flex items-center space-x-2 mt-3">
                {notif.type === 'end' ? (
                  <button 
                    onClick={() => onCompleteTask(notif.taskId, notif.id)}
                    className="text-xs font-bold bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Yes, Done!
                  </button>
                ) : (
                  <button 
                    onClick={() => onDismiss(notif.id)}
                    className={`text-xs font-bold ${notif.type === 'system' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white px-3 py-1.5 rounded-lg transition-colors`}
                  >
                    Understood
                  </button>
                )}
                <button 
                  onClick={() => onDismiss(notif.id)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2 py-1.5 transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
      <style>{`
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default NotificationPanel;
