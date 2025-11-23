import React, { useMemo } from 'react';
import { DetectedObject } from '../types';

interface OverlayProps {
  objects: DetectedObject[];
  videoWidth: number;
  videoHeight: number;
  containerWidth: number;
  containerHeight: number;
}

export const Overlay: React.FC<OverlayProps> = ({ 
  objects, 
  videoWidth, 
  videoHeight, 
  containerWidth, 
  containerHeight 
}) => {
  
  // Calculate scaling factors to map video coordinates to container coordinates
  // accounting for object-fit: cover behavior
  const { scale, offsetX, offsetY } = useMemo(() => {
    if (videoWidth === 0 || videoHeight === 0 || containerWidth === 0 || containerHeight === 0) {
      return { scale: 1, offsetX: 0, offsetY: 0 };
    }

    const videoRatio = videoWidth / videoHeight;
    const containerRatio = containerWidth / containerHeight;

    let renderWidth, renderHeight;
    let s;

    // Logic for object-fit: cover
    if (containerRatio > videoRatio) {
      s = containerWidth / videoWidth;
      renderWidth = containerWidth;
      renderHeight = videoHeight * s;
    } else {
      s = containerHeight / videoHeight;
      renderHeight = containerHeight;
      renderWidth = videoWidth * s;
    }

    const x = (containerWidth - renderWidth) / 2;
    const y = (containerHeight - renderHeight) / 2;

    return {
      scale: s,
      offsetX: x,
      offsetY: y
    };
  }, [videoWidth, videoHeight, containerWidth, containerHeight]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {objects.map((obj, index) => {
        const [ymin, xmin, ymax, xmax] = obj.box_2d;

        const top = (ymin / 1000) * videoHeight * scale + offsetY;
        const left = (xmin / 1000) * videoWidth * scale + offsetX;
        const height = ((ymax - ymin) / 1000) * videoHeight * scale;
        const width = ((xmax - xmin) / 1000) * videoWidth * scale;

        const colors = ['#00ff41', '#00f0ff', '#ff003c', '#ffe600', '#ff00ff'];
        const color = colors[index % colors.length];

        // Corner bracket size
        const cornerSize = Math.min(width, height) * 0.25;

        return (
          <div
            key={`${index}-${obj.label}`}
            className="absolute transition-all duration-200"
            style={{
              top: `${top}px`,
              left: `${left}px`,
              width: `${width}px`,
              height: `${height}px`,
            }}
          >
            {/* Visual style: Corner Brackets instead of full square */}
            
            {/* Top Left */}
            <div className="absolute top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-xl shadow-[0_0_10px_currentColor]" 
                 style={{ width: cornerSize, height: cornerSize, borderColor: color }}></div>
            
            {/* Top Right */}
            <div className="absolute top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-xl shadow-[0_0_10px_currentColor]" 
                 style={{ width: cornerSize, height: cornerSize, borderColor: color }}></div>
            
            {/* Bottom Left */}
            <div className="absolute bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-xl shadow-[0_0_10px_currentColor]" 
                 style={{ width: cornerSize, height: cornerSize, borderColor: color }}></div>
            
            {/* Bottom Right */}
            <div className="absolute bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-xl shadow-[0_0_10px_currentColor]" 
                 style={{ width: cornerSize, height: cornerSize, borderColor: color }}></div>

            {/* Slight center glow area */}
            <div className="absolute inset-0 opacity-10 rounded-xl" style={{ backgroundColor: color }}></div>

            {/* Label Tag - Floating above */}
            <div 
              className="absolute -top-8 left-0 flex flex-col items-start"
            >
              <div 
                className="px-3 py-1 text-xs font-bold text-black rounded-lg flex items-center gap-2 shadow-[0_0_15px_currentColor]"
                style={{ backgroundColor: color, color: '#000' }}
              >
                <span className="uppercase tracking-widest">{obj.label}</span>
                <span className="bg-black/20 px-1.5 rounded-md text-[10px]">{(obj.confidence * 100).toFixed(0)}%</span>
              </div>
              {/* Connector line */}
              <div className="w-[2px] h-2 ml-4" style={{ backgroundColor: color }}></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};