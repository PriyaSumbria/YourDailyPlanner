
import React from 'react';
import { RingtoneType, RINGTONES } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRingtone: RingtoneType;
  onSelectRingtone: (ringtone: RingtoneType) => void;
  onPreviewRingtone: (ringtone: RingtoneType) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedRingtone, 
  onSelectRingtone, 
  onPreviewRingtone 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800">Settings</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <section>
            <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Alarm Ringtone</h4>
            <div className="grid gap-2">
              {RINGTONES.map((ringtone) => (
                <div 
                  key={ringtone}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                    selectedRingtone === ringtone 
                      ? 'bg-indigo-50 border-indigo-200 ring-2 ring-indigo-100/50' 
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                  onClick={() => onSelectRingtone(ringtone)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${selectedRingtone === ringtone ? 'border-indigo-600 bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.5)]' : 'border-slate-300'}`} />
                    <span className={`font-bold ${selectedRingtone === ringtone ? 'text-indigo-900' : 'text-slate-600'}`}>{ringtone}</span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onPreviewRingtone(ringtone); }}
                    className="p-2 text-indigo-600 hover:bg-white rounded-xl transition-all active:scale-90"
                    title="Preview Sound"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </section>

          <div className="pt-4">
             <button 
              onClick={onClose}
              className="w-full py-4 bg-indigo-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98]"
             >
               Save Changes
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
