import React from 'react';

interface HeaderProps {
  onOpenSettings: () => void;
  isScanning: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings, isScanning }) => {
  return (
    <header className="w-full border-b border-hud-green/30 bg-hud-dark/80 backdrop-blur-md p-4 flex justify-between items-center z-50 sticky top-0">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${isScanning ? 'bg-hud-red animate-pulse' : 'bg-hud-green'}`}></div>
        <h1 className="text-xl tracking-widest font-bold text-hud-green">
          VISION<span className="text-white">OS</span> v2.5
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex gap-4 text-xs text-hud-green/60">
          <span>CPU: NOMINAL</span>
          <span>NET: CONECTADO</span>
          <span>LATÊNCIA: BAIXA</span>
        </div>
        <button 
          onClick={onOpenSettings}
          className="p-2 hover:text-hud-green transition-colors"
          title="Configurações"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
      </div>
    </header>
  );
};