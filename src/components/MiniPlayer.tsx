import React, { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface MiniPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  autoOpenPiP?: boolean;
  name?: string;
  time?: string;
  liveCommitId?: string;
  desiredCommitId?: string;
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({ isOpen, onClose, autoOpenPiP = false, name = "placeholder-deployment-14331567", time = "1m30s", liveCommitId = "abc123", desiredCommitId = "def456" }) => {
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

      // Add custom CSS styling
      const styleSheet = document.createElement('style');
      styleSheet.textContent = `
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          background-color: #fff;
          color: #333;
        }
        .pip-container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .pip-header {
          background-color: #eab308;
          color: white;
          padding: 6px 12px;
          font-weight: bold;
          font-size: 14px;
        }
        .pip-content {
          flex: 1;
          overflow: auto;
        }
        .pip-footer {
          border-top: 1px solid #e0e0e0;
          padding: 12px;
          background: linear-gradient(to bottom, #f9fafb, #f3f4f6);
          font-size: 13px;
        }
        .deployment-item {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
          padding: 8px 10px;
          background-color: white;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
          transition: all 0.2s ease;
        }
        .deployment-item:hover {
          background-color: #f0f9ff;
          border-color: #3b82f6;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .status-badge {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          flex-shrink: 0;
          box-shadow: 0 2px 4px rgba(34, 197, 94, 0.3);
        }
        .deployment-name {
          color: #1f2937;
          font-size: 12px;
          font-weight: 500;
          font-family: 'Monaco', 'Menlo', monospace;
          letter-spacing: 0.3px;
        }
        .graph-container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          background-color: #f3f4f6;
        }
        .graph-header {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
        }
        .graph-title {
          font-size: 13px;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 8px;
        }
        .graph-legend {
          display: flex;
          gap: 16px;
          font-size: 12px;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .legend-line {
          width: 12px;
          height: 2px;
        }
        .legend-label {
          color: #4b5563;
        }
        .graph-body {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 8px;
        }
        .graph-svg {
          background-color: white;
          border-radius: 4px;
        }
      `;
      newWindow.document.head.appendChild(styleSheet);

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
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#f3f4f6' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '8px', backgroundColor: '#f3f4f6' }}>
          {/* Graph */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
            <svg width={width} height={height} style={{ backgroundColor: 'white', borderRadius: '4px' }}>
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
          
          {/* Deployment Status */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e5e7eb', transition: 'all 0.2s ease' }}>
              <span style={{ color: '#1f2937', fontSize: '12px', fontWeight: 500, fontFamily: "'Monaco', 'Menlo', monospace", letterSpacing: '0.3px' }}>{name}-deployment-{liveCommitId}</span>
              <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0, boxShadow: '0 2px 4px rgba(34, 197, 94, 0.3)' }}>✓</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', backgroundColor: 'white', borderRadius: '6px', border: '1px solid #e5e7eb', transition: 'all 0.2s ease' }}>
              <span style={{ color: '#1f2937', fontSize: '12px', fontWeight: 500, fontFamily: "'Monaco', 'Menlo', monospace", letterSpacing: '0.3px' }}>{name}-deployment-{desiredCommitId}</span>
              <svg viewBox="0 0 24 24" style={{ width: '18px', height: '18px', stroke: '#22c55e', flexShrink: 0 }}>
                <path d="M20 12a8 8 0 10-2.35 5.65" strokeWidth="2" fill="none" strokeLinecap="round" />
                <polyline points="20 8 20 12 16 12" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PiPContent = () => {
    const latestData = cpuData[cpuData.length - 1];
    const usagePercent = Math.round((latestData.used / latestData.limit) * 100);
    
    return (
    <div className="pip-container">
      {/* Header */}
      <div className="pip-header" style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>{name.toUpperCase()} CPU USAGE</span>
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          style={{
            background: 'none',
            border: 'none',
            color: 'white',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '0 4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title={isMinimized ? "Restore" : "Minimize"}
        >
          {isMinimized ? '▢' : '−'}
        </button>
      </div>

      {/* Content - CPU Graph */}
      {!isMinimized && (
        <div className="pip-content">
          <CPUGraphChart />
        </div>
      )}
    </div>
  );
  };

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
