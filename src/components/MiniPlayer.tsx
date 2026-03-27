import React, { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface MiniPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  autoOpenPiP?: boolean;
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({ isOpen, onClose, autoOpenPiP = false }) => {
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [pipSize, setPipSize] = useState<'small' | 'large'>('large');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  // CPU metrics data (in millicores)
  const [cpuData, setCpuData] = useState<Array<{ used: number; requested: number; limit: number }>>([
    { used: 100, requested: 200, limit: 500 },
    { used: 150, requested: 200, limit: 500 },
    { used: 200, requested: 200, limit: 500 },
    { used: 180, requested: 200, limit: 500 },
    { used: 220, requested: 200, limit: 500 },
    { used: 250, requested: 200, limit: 500 },
    { used: 210, requested: 200, limit: 500 },
    { used: 190, requested: 200, limit: 500 },
  ]);

  // Update CPU data every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuData((prevData) => {
        // Generate new data point based on last value (slightly variable)
        const lastPoint = prevData[prevData.length - 1];
        const change = (Math.random() - 0.5) * 60; // Random change between -30 and +30
        const newUsed = Math.max(50, Math.min(350, lastPoint.used + change)); // Clamp between 50 and 350
        
        const newPoint = {
          used: Math.round(newUsed),
          requested: 200,
          limit: 500,
        };
        
        // Keep only last 8 data points
        return [...prevData.slice(1), newPoint];
      });
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const tracks = [
    { name: "Blinding Lights", artist: "The Weeknd" },
    { name: "Shape of You", artist: "Ed Sheeran" },
    { name: "Levitating", artist: "Dua Lipa" },
    { name: "As It Was", artist: "Harry Styles" },
    { name: "Anti-Hero", artist: "Taylor Swift" },
  ];

  const handleOpenPiP = useCallback(async () => {
    try {
      const documentPiP = (window as any).documentPictureInPicture;
      if (!documentPiP) {
        console.error('Document Picture-in-Picture API is not available');
        onClose();
        return;
      }

      // Request a new PiP window with specified dimensions
      const width = pipSize === 'large' ? 400 : 280;
      const height = pipSize === 'large' ? 320 : 200;
      
      const newWindow = await documentPiP.requestWindow({
        width,
        height,
      });

      // Copy styles from main window to PiP window
      const stylesheets = Array.from(document.styleSheets);
      stylesheets.forEach((stylesheet) => {
        try {
          if (stylesheet.href && !stylesheet.href.includes('chrome://')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = stylesheet.href;
            newWindow.document.head.appendChild(link);
          }
        } catch (e) {
          console.error('Could not clone stylesheet:', e);
        }
      });

      // Add Tailwind to the PiP window
      const tailwindLink = document.createElement('link');
      tailwindLink.rel = 'stylesheet';
      tailwindLink.href = 'https://cdn.tailwindcss.com';
      newWindow.document.head.appendChild(tailwindLink);

      setPipWindow(newWindow);

      // Handle window close
      const handleClose = () => {
        setPipWindow(null);
        if (autoOpenPiP) {
          onClose();
        }
      };
      newWindow.addEventListener('pagehide', handleClose);
    } catch (err) {
      console.error('PiP Error:', err);
      setPipWindow(null);
      onClose();
    }
  }, [pipSize, autoOpenPiP, onClose]);

  useEffect(() => {
    if (autoOpenPiP && isOpen && !pipWindow) {
      // Automatically open PiP after a short delay to ensure component is mounted
      const timer = setTimeout(() => {
        handleOpenPiP();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoOpenPiP, isOpen, pipWindow, handleOpenPiP]);

  const ClosePiP = () => {
    if (pipWindow) {
      pipWindow.close();
      setPipWindow(null);
    }
    onClose();
  };

  const currentTrack = tracks[currentTrackIndex];

  const handlePrevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  const handleNextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const CPUGraphChart = () => {
    const width = 360;
    const height = 200;
    const padding = 40;
    const maxValue = 500; // max CPU in millicores
    
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;
    
    const xScale = chartWidth / (cpuData.length - 1);
    const yScale = chartHeight / maxValue;
    
    // Generate paths for each metric
    const generatePath = (key: 'used' | 'requested' | 'limit') => {
      return cpuData
        .map((point, idx) => {
          const x = padding + idx * xScale;
          const y = height - padding - point[key] * yScale;
          return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
        })
        .join(' ');
    };
    
    return (
      <div className="w-full h-full flex flex-col bg-gray-50">
        <div className="p-3 border-b">
          <h3 className="text-sm font-semibold text-gray-800">CPU Usage</h3>
          <div className="flex gap-4 text-xs mt-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-blue-600"></div>
              <span className="text-gray-600">Used</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-green-600"></div>
              <span className="text-gray-600">Requested</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-red-600"></div>
              <span className="text-gray-600">Limit</span>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-2">
          <svg width={width} height={height} className="bg-white rounded">
            {/* Grid lines */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <line
                key={`grid-${i}`}
                x1={padding}
                y1={padding + (i * chartHeight) / 5}
                x2={width - padding}
                y2={padding + (i * chartHeight) / 5}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="2,2"
              />
            ))}
            
            {/* Y-axis labels */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <text
                key={`label-${i}`}
                x={padding - 10}
                y={height - padding - (i * chartHeight) / 5 + 4}
                fontSize="10"
                textAnchor="end"
                fill="#888"
              >
                {i * 100}m
              </text>
            ))}
            
            {/* Limit line (red) */}
            <path
              d={generatePath('limit')}
              stroke="#dc2626"
              strokeWidth="2"
              fill="none"
            />
            
            {/* Requested line (green) */}
            <path
              d={generatePath('requested')}
              stroke="#16a34a"
              strokeWidth="2"
              fill="none"
            />
            
            {/* Used line (blue) */}
            <path
              d={generatePath('used')}
              stroke="#2563eb"
              strokeWidth="2"
              fill="none"
            />
            
            {/* Y-axis */}
            <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#333" strokeWidth="1" />
            {/* X-axis */}
            <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#333" strokeWidth="1" />
          </svg>
        </div>
      </div>
    );
  };

  const PiPContent = () => (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-3">
        <h2 className="font-bold text-lg">Kubernetes Workload CPU</h2>
      </div>

      {/* Content - CPU Graph */}
      <div className="flex-1 overflow-auto">
        <CPUGraphChart />
      </div>
    </div>
  );

  if (!isOpen) return null;

  // If auto-opening PiP, only show the PiP window, not the sidebar
  if (autoOpenPiP) {
    return pipWindow ? createPortal(<PiPContent />, pipWindow.document.body) : null;
  }

  return (
    <>
      <div className={`fixed z-[9999] ${isMinimized ? 'bottom-4 right-4 w-48' : 'bottom-6 right-6 w-96'}`}>
        <div className={`bg-white rounded-lg shadow-2xl flex flex-col border border-gray-200 ${isMinimized ? 'max-h-16' : ''}`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-bold">{isMinimized ? '🎵' : 'Mini Player'}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="text-gray-600 hover:text-gray-800 text-lg"
                aria-label={isMinimized ? "Expand" : "Minimize"}
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? '▢' : '−'}
              </button>
              <button
                onClick={handleOpenPiP}
                className="text-blue-600 hover:text-blue-700 text-lg"
                aria-label="Open Picture-in-Picture"
                title="Open Picture-in-Picture"
              >
                ⛶
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
                aria-label="Close"
              >
                ×
              </button>
            </div>
          </div>

          {/* Content */}
          {!isMinimized && (
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Used:</span>
                  <span className="font-semibold text-blue-600">{cpuData[cpuData.length - 1].used}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Requested:</span>
                  <span className="font-semibold text-green-600">{cpuData[cpuData.length - 1].requested}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Limit:</span>
                  <span className="font-semibold text-red-600">{cpuData[cpuData.length - 1].limit}m</span>
                </div>
                <div className="pt-2 border-t">
                  <div className="text-xs text-gray-500">% of Limit</div>
                  <div className="text-lg font-bold text-gray-800">
                    {Math.round((cpuData[cpuData.length - 1].used / cpuData[cpuData.length - 1].limit) * 100)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer with Controls */}
          {!isMinimized && (
            <div className="p-4 border-t flex flex-col gap-2">
              {/* Add your custom controls here */}
            </div>
          )}
        </div>
      </div>

      {/* Render PiP content if window is open */}
      {pipWindow && createPortal(<PiPContent />, pipWindow.document.body)}
    </>
  );
};

export default MiniPlayer;
