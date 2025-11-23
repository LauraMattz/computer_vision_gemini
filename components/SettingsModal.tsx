import React from 'react';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md bg-hud-dark border border-hud-green p-6 shadow-[0_0_50px_rgba(0,255,65,0.2)] m-4">
        <div className="flex justify-between items-center mb-6 border-b border-hud-green/30 pb-2">
          <h2 className="text-xl font-bold text-hud-green">PROTOCOLO DE SISTEMA</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            [X]
          </button>
        </div>

        <div className="space-y-4 text-sm text-gray-300">
          <p>
            <strong className="text-white">Versão:</strong> 2.5.0 (Gemini Flash)
          </p>
          <p>
            <strong className="text-white">Modo:</strong> Detecção de Objetos em Tempo Real
          </p>
          <div className="bg-black/40 p-3 border border-hud-green/20">
            <h3 className="text-hud-green mb-2 font-bold">INSTRUÇÕES:</h3>
            <ul className="list-disc pl-4 space-y-1 marker:text-hud-green">
              <li>Aponte a câmera para objetos ou cenas.</li>
              <li>Pressione "INICIAR SISTEMA".</li>
              <li>A IA analisará o quadro a cada 2 segundos.</li>
              <li>Objetos identificados serão marcados com caixas de segmentação.</li>
            </ul>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Desenvolvido com Google Gemini API. Os resultados podem variar dependendo da iluminação e clareza da imagem.
          </p>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-hud-green/10 border border-hud-green text-hud-green hover:bg-hud-green hover:text-black transition-colors font-bold"
          >
            CONFIRMAR
          </button>
        </div>
      </div>
    </div>
  );
};