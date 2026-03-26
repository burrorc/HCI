import React, { useState } from "react";

export interface AppModalProps {
  app: any;
  onClose: () => void;
}

const AppModal: React.FC<AppModalProps> = ({ app, onClose }) => {
  const [forceReplace, setForceReplace] = useState(false);
  const [forceSync, setForceSync] = useState(false);

  if (!app) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[360px] max-w-[90vw] relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4">{app.name}</h2>
        
        <div className="mb-6 space-y-3 text-sm">
          {app.liveBranch && (
            <div>
              <span className="font-semibold text-gray-700">Live Branch:</span>
              <div className="text-gray-600 ml-2">{app.liveBranch}</div>
            </div>
          )}
          {app.desiredBranch && (
            <div>
              <span className="font-semibold text-gray-700">Desired Branch:</span>
              <div className="text-gray-600 ml-2">{app.desiredBranch}</div>
            </div>
          )}
          {app.liveCommit && (
            <div>
              <span className="font-semibold text-gray-700">Live Commit:</span>
              <div className="text-gray-600 ml-2 font-mono text-xs">{app.liveCommit}</div>
            </div>
          )}
          {app.desiredCommit && (
            <div>
              <span className="font-semibold text-gray-700">Desired Commit:</span>
              <div className="text-gray-600 ml-2 font-mono text-xs">{app.desiredCommit}</div>
            </div>
          )}
        </div>

        <div className="mb-4 space-y-2 border-t pt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4"
              checked={forceReplace}
              onChange={(e) => setForceReplace(e.target.checked)}
            />
            <span className="text-sm text-gray-700">Force Replace</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4"
              checked={forceSync}
              onChange={(e) => setForceSync(e.target.checked)}
            />
            <span className="text-sm text-gray-700">Force Sync</span>
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
          <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium">
            Sync
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppModal;
