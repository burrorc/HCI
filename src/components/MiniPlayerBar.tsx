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
}

const MiniPlayerBar: React.FC<MiniPlayerBarProps> = ({
  isOpen,
  onClose,
  name = "placeholder-deployment-14331567",
  time = "1m30s",
  liveCommitId = "abc123",
  desiredCommitId = "def456",
  autoOpenPiP = false,
}) => {
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [syncStartTime, setSyncStartTime] = useState<number | null>(null);
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
      setSyncStartTime(Date.now());
      const totalTime = parseTimeToSeconds(time);
      const cycleDuration = totalTime * 2;
      setRemainingTime(cycleDuration);
    }
  }, [isOpen, time]);

  // Update timer every second
  useEffect(() => {
    if (!syncStartTime || !isOpen) return;

    const totalTime = parseTimeToSeconds(time);
    const cycleDuration = totalTime * 2;

    const timerInterval = setInterval(() => {
      const elapsed = (Date.now() - syncStartTime) / 1000;
      const remaining = Math.max(0, cycleDuration - elapsed);
      setRemainingTime(remaining);
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [syncStartTime, time, isOpen]);

  const handleOpenPiP = useCallback(async () => {
    try {
      const documentPiP = (window as any).documentPictureInPicture;
      if (!documentPiP) {
        console.error("Document Picture-in-Picture API is not available");
        onClose();
        return;
      }

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
        <span class="timer">EST ${formatTime(remainingTime)} REMAINING</span>
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
          // TODO: Add minimize functionality here
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
  }, [onClose, name, remainingTime]);

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
    if (!pipWindow) return;

    const timerElement = pipWindow.document.querySelector(".timer");
    if (timerElement) {
      timerElement.textContent = `EST ${formatTime(remainingTime)} REMAINING`;
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
          // TODO: Add maximize functionality here
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
