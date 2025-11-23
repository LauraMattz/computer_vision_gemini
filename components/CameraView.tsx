import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { analyzeImage } from '../services/geminiService';
import { Overlay } from './Overlay';
import { AnalysisResult, SCAN_INTERVAL_MS } from '../types';

interface CameraViewProps {
  isScanning: boolean;
  onResultsReceived: (results: AnalysisResult) => void;
  results: AnalysisResult | null;
}

export interface CameraHandle {
  capture: () => Promise<void>;
}

export const CameraView = forwardRef<CameraHandle, CameraViewProps>(({ isScanning, onResultsReceived, results }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [videoSize, setVideoSize] = useState({ width: 0, height: 0 });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Initialize Camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment', // Rear camera preferred
            width: { ideal: 1280 }, 
            height: { ideal: 720 } 
          },
          audio: false,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Não foi possível acessar a câmera. Verifique as permissões.");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle container resizing
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleVideoMetadata = () => {
    if (videoRef.current) {
      setVideoSize({
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight,
      });
    }
  };

  // Capture and Analyze Logic
  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || isAnalyzing) return;

    setIsAnalyzing(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // OPTIMIZATION: 
      // Reduced to 640px. This is the sweet spot between speed and accuracy for standard object detection.
      const MAX_WIDTH = 640;
      const scale = Math.min(1, MAX_WIDTH / video.videoWidth);
      
      canvas.width = video.videoWidth * scale;
      canvas.height = video.videoHeight * scale;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw scaled image
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to base64 with slightly lower quality for speed (0.8)
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        
        const detectedObjects = await analyzeImage(base64);
        
        onResultsReceived({
          objects: detectedObjects,
          timestamp: Date.now()
        });
      }
    } catch (e) {
      console.error("Capture loop error", e);
    } finally {
      setIsAnalyzing(false);
    }
  }, [isAnalyzing, onResultsReceived]);

  // Expose capture method to parent
  useImperativeHandle(ref, () => ({
    capture: async () => {
      // Force a capture even if one is in progress (optional, but safer to wait)
      if (!isAnalyzing) {
        await captureAndAnalyze();
      }
    }
  }));

  // Polling Effect
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (isScanning) {
      captureAndAnalyze(); // Immediate first run
      
      intervalId = setInterval(() => {
        captureAndAnalyze();
      }, SCAN_INTERVAL_MS);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isScanning, captureAndAnalyze]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-black border border-hud-green/40 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(0,255,65,0.1)]"
    >
      {/* Hidden Canvas for Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        onLoadedMetadata={handleVideoMetadata}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Error State */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/90 text-hud-red z-50">
          <p className="text-center px-4">{error}</p>
        </div>
      )}

      {/* HUD Grid Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,255,65,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,65,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      {/* Center Reticle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 border border-hud-green/50 pointer-events-none flex items-center justify-center opacity-50 rounded-lg">
        <div className="w-[2px] h-2 bg-hud-green/80 absolute"></div>
        <div className="h-[2px] w-2 bg-hud-green/80 absolute"></div>
      </div>

      {/* Dynamic Bounding Box Overlay */}
      {results && (
        <Overlay
          objects={results.objects}
          videoWidth={videoSize.width}
          videoHeight={videoSize.height}
          containerWidth={containerSize.width}
          containerHeight={containerSize.height}
        />
      )}

      {/* Analyzing Indicator */}
      {isAnalyzing && (
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full border border-hud-green/50 text-hud-green text-xs shadow-lg z-20">
          <div className="w-2 h-2 bg-hud-green animate-ping rounded-full"></div>
          PROCESSANDO
        </div>
      )}
    </div>
  );
});

CameraView.displayName = 'CameraView';