import React, { useState, useCallback, useRef } from 'react';
import { CameraView, CameraHandle } from './components/CameraView';
import { Header } from './components/Header';
import { SettingsModal } from './components/SettingsModal';
import { AnalysisResult, DetectedObject } from './types';

export default function App() {
  const [isScanning, setIsScanning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  
  // History state for unique items
  const [inventory, setInventory] = useState<DetectedObject[]>([]);
  
  const cameraRef = useRef<CameraHandle>(null);

  const handleToggleScan = useCallback(() => {
    setIsScanning((prev) => !prev);
  }, []);

  const handleClearInventory = () => {
    setInventory([]);
  };

  const processResults = useCallback((newResults: AnalysisResult) => {
    setResults(newResults);

    // De-duplication logic: Add only if label doesn't exist in inventory
    setInventory(currentInventory => {
      const newItems = newResults.objects.filter(newObj => 
        !currentInventory.some(existing => existing.label.toLowerCase() === newObj.label.toLowerCase())
      );

      if (newItems.length > 0) {
        return [...newItems, ...currentInventory];
      }
      return currentInventory;
    });
  }, []);

  return (
    <div className="h-screen bg-hud-black text-white font-mono flex flex-col relative overflow-hidden">
      <div className="scanline"></div>
      
      <Header 
        onOpenSettings={() => setShowSettings(true)} 
        isScanning={isScanning}
      />

      <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 w-full max-w-7xl mx-auto relative z-10 overflow-hidden">
        
        {/* Left Column: Camera Feed */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 min-h-0 relative">
            <CameraView 
              ref={cameraRef}
              isScanning={isScanning} 
              onResultsReceived={processResults}
              results={results}
            />
          </div>
          
          {/* Controls Bar */}
          <div className="mt-4 flex gap-4 h-14 shrink-0">
             <button
              onClick={handleToggleScan}
              className={`
                flex-1 px-4 font-bold tracking-widest uppercase border-2 transition-all duration-200 flex items-center justify-center gap-2 text-sm md:text-base
                ${isScanning 
                  ? 'border-hud-red text-hud-red hover:bg-hud-red/10 shadow-[0_0_15px_rgba(255,0,60,0.5)]' 
                  : 'border-hud-green text-hud-green hover:bg-hud-green/10 shadow-[0_0_15px_rgba(0,255,65,0.5)]'
                }
              `}
            >
              {isScanning ? (
                <>
                  <div className="w-2 h-2 bg-hud-red animate-pulse rounded-full"></div>
                  PARAR SISTEMA
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  INICIAR ESCANEAMENTO
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Inventory/Log */}
        <div className="w-full lg:w-80 flex flex-col bg-hud-dark/50 border border-hud-green/30 rounded-lg overflow-hidden shrink-0 h-[30vh] lg:h-auto">
          <div className="p-3 border-b border-hud-green/30 bg-hud-dark/80 flex justify-between items-center">
            <h2 className="text-hud-green font-bold tracking-wider text-sm flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              REGISTRO DE DADOS
            </h2>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded border ${isScanning ? 'border-hud-green text-hud-green' : 'border-gray-500 text-gray-500'}`}>
                {isScanning ? 'ATIVO' : 'ESPERA'}
              </span>
              <button onClick={handleClearInventory} title="Limpar Lista" className="text-hud-green hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {inventory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 text-xs gap-2 opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <span className="tracking-widest">NENHUM ALVO DETECTADO</span>
              </div>
            ) : (
              inventory.map((item, idx) => (
                <div key={`${idx}-${item.label}`} className="bg-black/40 border-l-2 border-hud-green p-2 flex items-center gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex-1 min-w-0">
                    <div className="text-hud-green font-bold text-sm truncate uppercase tracking-wide">{item.label}</div>
                    <div className="text-[10px] text-gray-400 font-mono">CONF: {(item.confidence * 100).toFixed(1)}%</div>
                  </div>
                  <div className="text-[10px] text-gray-600 font-mono">
                    #{String(idx + 1).padStart(3, '0')}
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-2 bg-hud-dark/80 border-t border-hud-green/30 text-[10px] text-center text-gray-500 font-mono">
            TOTAL DE OBJETOS: {inventory.length}
          </div>
        </div>

      </main>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  );
}