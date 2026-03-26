import React, { useState } from "react";

export interface AppModalProps {
  app: any;
  onClose: () => void;
}

const AppModal: React.FC<AppModalProps> = ({ app, onClose }) => {
  const [forceReplace, setForceReplace] = useState(false);
  const [forceSync, setForceSync] = useState(false);

  if (!app) return null;

  const isSynced = app.liveBranch === app.desiredBranch && app.liveCommit === app.desiredCommit;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[360px] max-w-[90vw] relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="flex items-start gap-4 mb-4 pb-4 border-b">
          {app.abbreviation && (
            <div className={`w-12 h-12 rounded-full ${isSynced ? 'bg-green-500' : 'bg-yellow-500'} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
              {app.abbreviation}
            </div>
          )}
          <h2 className="text-xl font-bold flex-1 break-words pt-1">{app.name}</h2>
        </div>

        <div className="mb-4 pb-4 border-b">
          <div className="text-sm">
            <div className="flex items-center justify-center gap-3">
              <svg className="w-12 h-12 text-green-500 fill-current" viewBox="0 0 24 24">
                <path d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3 9.24 3 10.91 3.81 12 5.09 13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.18L12 21z" />
              </svg>
              <span className="text-lg text-gray-600">2 pods</span>
              <div className="flex items-center gap-1">
                {isSynced ? (
                  <>
                    <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-lg text-green-600">Synced</span>
                  </>
                ) : (
                  <>
                    <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M12 19V5" />
                      <polyline points="5 12 12 5 19 12" />
                    </svg>
                    <span className="text-lg text-yellow-600">Out of Sync</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-green-50 rounded p-3 border border-green-200">
                <div className="text-sm font-bold text-green-700 mb-2 uppercase text-center">Live</div>
                <div className="space-y-2">
                  {(app.liveBranch || app.desiredBranch) && (
                    <div>
                      <div className="text-xs text-gray-500">branch</div>
                      <div className="font-mono text-sm text-gray-800 break-all">{app.liveBranch || "-"}</div>
                    </div>
                  )}
                  {(app.liveCommit || app.desiredCommit) && (
                    <div>
                      <div className="text-xs text-gray-500">commitId</div>
                      <div className="font-mono text-sm text-gray-800 break-all">{app.liveCommit || "-"}</div>
                    </div>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 rounded p-3 border border-gray-300">
                <div className="text-sm font-bold text-gray-700 mb-2 uppercase text-center">Desired</div>
                <div className="space-y-2">
                  {(app.liveBranch || app.desiredBranch) && (
                    <div>
                      <div className="text-xs text-gray-500">branch</div>
                      <div className="font-mono text-sm text-gray-700 italic break-all">{app.desiredBranch || "-"}</div>
                    </div>
                  )}
                  {(app.liveCommit || app.desiredCommit) && (
                    <div>
                      <div className="text-xs text-gray-500">commitId</div>
                      <div className="font-mono text-sm text-gray-700 italic break-all">{app.desiredCommit || "-"}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 flex justify-center gap-4 border-t pt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4"
              checked={forceReplace}
              onChange={(e) => setForceReplace(e.target.checked)}
            />
            <span className="text-sm text-gray-700">Force</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4"
              checked={forceSync}
              onChange={(e) => setForceSync(e.target.checked)}
            />
            <span className="text-sm text-gray-700">Replace</span>
          </label>
        </div>

        <div className="flex justify-center gap-2 pt-4 border-t">
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
