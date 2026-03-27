import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface MiniPlayerBarProps {
  isOpen: boolean;
  onClose: () => void;
  name?: string;
  time?: string;
  liveCommitId?: string;
  desiredCommitId?: string;
  autoOpenPiP?: boolean;
  syncStartTime?: number | null;
  onMaximize?: (syncStartTime: number | null) => void;
}

const MiniPlayerBar: React.FC<MiniPlayerBarProps> = ({
  isOpen,
  onClose,
  name = "placeholder-deployment-14331567",
  time = "1m30s",
  liveCommitId = "abc123",
  desiredCommitId = "def456",
  autoOpenPiP = false,
  syncStartTime: initialSyncStartTime = null,
  onMaximize,
}) => {
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [syncStartTime, setSyncStartTime] = useState<number | null>(initialSyncStartTime);
  const [remainingTime, setRemainingTime] = useState<number>(0);

  const parseTimeToSeconds = (timeStr: string) => {
    const minMatch = timeStr.match(/(\d+)m/);
    const secMatch = timeStr.match(/(\d+)s/);

    const minutes = minMatch ? parseInt(minMatch[1]) : 0;
    const seconds = secMatch ? parseInt(secMatch[1]) : 0;

    return minutes * 60 + seconds;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  // Initialize sync when component opens
  useEffect(() => {
    if (isOpen) {
      console.log("[MiniPlayerBar] Init effect - isOpen:", isOpen, "initialSyncStartTime:", initialSyncStartTime, "time:", time);
      const totalTime = parseTimeToSeconds(time);
      const cycleDuration = totalTime * 2;
      console.log("[MiniPlayerBar] Calculated totalTime:", totalTime, "cycleDuration:", cycleDuration);
      
      if (initialSyncStartTime !== null) {
        // Use the provided syncStartTime
        console.log("[MiniPlayerBar] Setting syncStartTime to:", initialSyncStartTime);
        setSyncStartTime(initialSyncStartTime);
        // Calculate remaining time based on elapsed time
        const elapsed = (Date.now() - initialSyncStartTime) / 1000;
        const remaining = Math.max(0, cycleDuration - elapsed);
        console.log("[MiniPlayerBar] Calculated elapsed:", elapsed, "remaining:", remaining);
        setRemainingTime(remaining);
      } else {
        // Create a new sync start time if none provided
        console.log("[MiniPlayerBar] Creating new sync start time");
        setSyncStartTime(Date.now());
        setRemainingTime(cycleDuration); // Full duration for new sync
      }
    }
  }, [isOpen, time, initialSyncStartTime]);


  // Update timer every second
  useEffect(() => {
    if (!syncStartTime || !isOpen) {
      console.log("[MiniPlayerBar] Timer effect skipped - syncStartTime:", syncStartTime, "isOpen:", isOpen);
      return;
    }

    const totalTime = parseTimeToSeconds(time);
    const cycleDuration = totalTime * 2;

    // Update immediately when syncStartTime changes
    const elapsed = (Date.now() - syncStartTime) / 1000;
    const remaining = Math.max(0, cycleDuration - elapsed);
    console.log("[MiniPlayerBar] Timer effect - updating remainingTime to:", remaining);
    setRemainingTime(remaining);

    const timerInterval = setInterval(() => {
      const elapsed = (Date.now() - syncStartTime) / 1000;
      const remaining = Math.max(0, cycleDuration - elapsed);
      setRemainingTime(remaining);
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [syncStartTime, time, isOpen]);

  const handleOpenPiP = useCallback(async () => {
    try {
      console.log("[MiniPlayerBar] handleOpenPiP called - syncStartTime:", syncStartTime);
      const documentPiP = (window as any).documentPictureInPicture;
      if (!documentPiP) {
        console.error("Document Picture-in-Picture API is not available");
        onClose();
        return;
      }

      // Calculate current remaining time before creating window
      const totalTime = parseTimeToSeconds(time);
      const cycleDuration = totalTime * 2;
      const currentSyncStartTime = syncStartTime || Date.now();
      console.log("[MiniPlayerBar] Using currentSyncStartTime:", currentSyncStartTime, "cycleDuration:", cycleDuration);
      const elapsed = (Date.now() - currentSyncStartTime) / 1000;
      const currentRemaining = Math.max(0, cycleDuration - elapsed);
      const formattedTime = formatTime(currentRemaining);

      console.log("Opening PiP with remaining time:", currentRemaining, "formatted:", formattedTime);

      // Request a small PiP window just for the header
      const newWindow = await documentPiP.requestWindow({
        width: 420,
        height: 50,
      });

      // Add custom CSS styling
      const styleSheet = document.createElement("style");
      styleSheet.textContent = `
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        html, body {
          height: 100%;
          width: 100%;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          background-color: #eab308;
          color: white;
          margin: 0;
          padding: 0;
        }
        .bar-container {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 12px;
          font-size: 14px;
          font-weight: bold;
          background-color: #eab308;
        }
        .bar-section {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .timer {
          font-size: 12px;
          font-weight: 500;
          text-align: center;
        }
        button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 0 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          width: 24px;
          height: 24px;
        }
        button:hover {
          opacity: 0.8;
        }
      `;
      newWindow.document.head.appendChild(styleSheet);

      // Create the bar content
      const container = newWindow.document.createElement("div");
      container.className = "bar-container";
      container.innerHTML = `
        <span>${name.toUpperCase()} CPU USAGE</span>
        <span class="timer">EST ${formattedTime} REMAINING</span>
        <button id="minimize-btn" title="Maximize">
          <svg viewBox="0 0 24 24" style="width: 18px; height: 18px; fill: none; stroke: white; stroke-width: 1.5;">
            <rect x="1" y="1" width="22" height="22" rx="1" />
            <rect x="14" y="14" width="9" height="9" rx="0.5" fill="white" />
          </svg>
        </button>
      `;

      // Add minimize button functionality
      const minimizeBtn = container.querySelector("#minimize-btn");
      if (minimizeBtn) {
        minimizeBtn.addEventListener("click", () => {
          if (onMaximize) {
            onMaximize(syncStartTime);
          }
        });
      }

      newWindow.document.body.appendChild(container);

      setPipWindow(newWindow);

      // Handle window close
      newWindow.addEventListener("unload", () => {
        setPipWindow(null);
        onClose();
      });
    } catch (err) {
      console.error("Failed to open PiP window:", err);
      setPipWindow(null);
    }
  }, [onClose, name, time, syncStartTime]);

  // Auto-open PiP window on mount if autoOpenPiP is true
  useEffect(() => {
    if (autoOpenPiP && isOpen && !pipWindow) {
      const timer = setTimeout(() => {
        handleOpenPiP();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [autoOpenPiP, isOpen, pipWindow, handleOpenPiP]);

  // Update timer in PiP window
  useEffect(() => {
    if (!pipWindow) {
      console.log("[MiniPlayerBar] DOM update effect - no pipWindow");
      return;
    }

    const timerElement = pipWindow.document.querySelector(".timer");
    const formatted = formatTime(remainingTime);
    console.log("[MiniPlayerBar] Updating PiP DOM timer - remainingTime:", remainingTime, "formatted:", formatted);
    if (timerElement) {
      timerElement.textContent = `EST ${formatted} REMAINING`;
    } else {
      console.log("[MiniPlayerBar] WARNING: timer element not found in PiP window");
    }
  }, [remainingTime, pipWindow]);

  useEffect(() => {
    if (pipWindow) {
      pipWindow.close();
      setPipWindow(null);
    }
    if (!isOpen) {
      onClose();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // If auto-opening PiP, only show the PiP window
  if (autoOpenPiP) {
    return null;
  }

  // Fallback to fixed header if PiP not available
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "50px",
        backgroundColor: "#eab308",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: "16px",
        paddingRight: "16px",
        zIndex: 9999,
        fontSize: "14px",
        fontWeight: "bold",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
      }}
    >
      <span>{name.toUpperCase()} CPU USAGE</span>
      <span style={{ fontSize: "12px", fontWeight: "500", textAlign: "center" }}>
        EST {formatTime(remainingTime)} REMAINING
      </span>
      <button
        onClick={() => {
          if (onMaximize) {
            onMaximize(syncStartTime);
          }
        }}
        style={{
          background: "none",
          border: "none",
          color: "white",
          cursor: "pointer",
          padding: "0 4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          lineHeight: "1",
          width: "24px",
          height: "24px",
        }}
        title="Maximize"
      >
        <svg
          viewBox="0 0 24 24"
          style={{
            width: "18px",
            height: "18px",
            fill: "none",
            stroke: "white",
            strokeWidth: "1.5",
          }}
        >
          {/* Outer rectangle */}
          <rect x="1" y="1" width="22" height="22" rx="1" />
          {/* Inner square (25% smaller) in lower right corner for maximize */}
          <rect x="14" y="14" width="9" height="9" rx="0.5" fill="white" />
        </svg>
      </button>
    </div>
  );
};

export default MiniPlayerBar;
