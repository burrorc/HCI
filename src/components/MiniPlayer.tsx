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

  const PiPContent = () => (
    <div className="w-full h-full bg-white flex flex-col">
      {/* Header */}
      <div className="bg-green-500 text-white p-3 flex items-center justify-between">
        <h2 className="font-bold text-lg">🎵 Spotify</h2>
        <button
          onClick={ClosePiP}
          className="text-white hover:text-gray-200 text-2xl leading-none"
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-auto">
        <div className="text-6xl mb-4">🎵</div>
        <h3 className="font-bold text-lg text-gray-800">Now Playing</h3>
        <p className="text-sm text-gray-600">{currentTrack.name}</p>
        <p className="text-xs text-gray-500">{currentTrack.artist}</p>
      </div>

      {/* Controls */}
      <div className="border-t p-3 flex gap-2">
        <button 
          onClick={handlePrevTrack}
          className="flex-1 px-2 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm font-semibold"
        >
          ⏮
        </button>
        <button 
          onClick={handlePlayPause}
          className="flex-1 px-2 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm font-semibold"
        >
          {isPlaying ? "⏸" : "▶"}
        </button>
        <button 
          onClick={handleNextTrack}
          className="flex-1 px-2 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm font-semibold"
        >
          ⏭
        </button>
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
            <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center">
              <div className="text-center">
                <p className="text-4xl mb-2">🎵</p>
                <p className="font-semibold text-gray-800">{currentTrack.name}</p>
                <p className="text-sm text-gray-600">{currentTrack.artist}</p>
                <p className="text-xs text-gray-400 mt-3">{isPlaying ? "▶ Playing" : "⏸ Paused"}</p>
              </div>
            </div>
          )}

          {/* Footer with Controls */}
          {!isMinimized && (
            <div className="p-4 border-t flex flex-col gap-2">
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setPipSize('small')}
                  className={`flex-1 px-3 py-2 rounded text-sm font-semibold transition-colors ${
                    pipSize === 'small'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Small PiP
                </button>
                <button
                  onClick={() => setPipSize('large')}
                  className={`flex-1 px-3 py-2 rounded text-sm font-semibold transition-colors ${
                    pipSize === 'large'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Large PiP
                </button>
              </div>
              <button
                onClick={handleOpenPiP}
                className="w-full px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm font-semibold"
              >
                🖵 Open in Picture-in-Picture
              </button>
              <div className="flex gap-2">
                <button 
                  onClick={handlePrevTrack}
                  className="flex-1 px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm font-semibold"
                >
                  ⏮ Prev
                </button>
                <button 
                  onClick={handlePlayPause}
                  className="flex-1 px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm font-semibold"
                >
                  {isPlaying ? "⏸ Pause" : "▶ Play"}
                </button>
                <button 
                  onClick={handleNextTrack}
                  className="flex-1 px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm font-semibold"
                >
                  Next ⏭
                </button>
              </div>
              <div className="text-center text-xs mt-2">
                <p className="font-semibold text-gray-800">{currentTrack.name}</p>
                <p className="text-gray-600">{currentTrack.artist}</p>
              </div>
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
