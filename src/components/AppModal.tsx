import React, { useState, useEffect } from "react";

export interface AppModalProps {
  app: any;
  onClose: () => void;
  selectedAppName?: string;
}

const AppModal: React.FC<AppModalProps> = ({ app, onClose, selectedAppName }) => {
  const [yamlMode, setYamlMode] = useState<"live" | "desired" | null>(null);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [moreOptions, setMoreOptions] = useState({
    force: false,
    replace: false,
    prune: false,
    dryRun: false,
    applyOnly: false,
    skipSchemaValidation: false,
    autoCreateNamespace: true,
    pruneLast: false,
    applyOutOfSyncOnly: false,
    respectIgnoreDifferences: false,
    serverSideApply: false,
    prunePropagationReplace: false,
    prunePropagationRetry: false,
  });

  useEffect(() => {
    setYamlMode(null);
  }, [app]);

  if (!app) return null;

  console.log("Modal app data:", app);

  const isSynced = app.liveBranch === app.desiredBranch && app.liveCommit === app.desiredCommit;

  const generateYaml = (branch: string, commitId: string) => {
    try {
      console.log("Generating YAML with branch:", branch, "commitId:", commitId);
      
      // Parse service name by splitting on hyphens, using selectedAppName if available
      const nameToUse = selectedAppName || app.name || "service";
      const nameParts = nameToUse.split("-");
      const environment = nameParts[0] || "unknown";
      const group = nameParts[1] || "unknown";
      const region = nameParts[2] || "unknown";

      const yaml = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${app.name || "service"}
  namespace: ${app.namespace || "default"}
  labels:
    environment: ${environment}
    group: ${group}
    region: ${region}
  annotations:
    deployment.branch: ${branch || "N/A"}
    deployment.commitId: ${commitId || "N/A"}
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ${app.name || "service"}
  template:
    metadata:
      labels:
        app: ${app.name || "service"}
        environment: ${environment}
    spec:
      containers:
      - name: ${app.name || "service"}
        image: ghcr.io/globalpayments/${app.name || "service"}:latest
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 8080
          name: http
        env:
        - name: ENVIRONMENT
          value: "${environment}"
        - name: LOG_LEVEL
          value: "INFO"
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
      serviceAccountName: ${app.name || "service"}
      securityContext:
        fsGroup: 1000`;
      console.log("Generated YAML:", yaml);
      return yaml;
    } catch (error) {
      console.error("Error generating YAML:", error);
      return "Error generating YAML";
    }
  };

  const getHighlightedYaml = () => {
    if (!yamlMode) return null;

    const liveYaml = generateYaml(app.liveBranch || "", app.liveCommit || "");
    const desiredYaml = generateYaml(app.desiredBranch || "", app.desiredCommit || "");
    
    const yamlToDisplay = yamlMode === "live" ? liveYaml : desiredYaml;
    const otherYaml = yamlMode === "live" ? desiredYaml : liveYaml;
    
    const yamlLines = yamlToDisplay.split("\n");
    const otherLines = otherYaml.split("\n");
    
    return yamlLines.map((line, idx) => ({
      line,
      isDiff: line !== (otherLines[idx] || ""),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-4 bg-black bg-opacity-40 pointer-events-none">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[500px] max-h-[calc(100vh-2rem)] relative pointer-events-auto flex flex-col">
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
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-bold text-green-700 uppercase flex-1 text-center">Live</div>
                  <button
                    onClick={() => setYamlMode(yamlMode === "live" ? null : "live")}
                    className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                  >
                    YAML
                  </button>
                </div>
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
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-bold text-gray-700 uppercase flex-1 text-center">Desired</div>
                  <button
                    onClick={() => setYamlMode(yamlMode === "desired" ? null : "desired")}
                    className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                  >
                    YAML
                  </button>
                </div>
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

        <div className="mb-4 flex justify-center">
          <button 
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            className="px-3 py-1 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            {showMoreOptions ? "Hide options" : "More options"}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 mb-4">
          {yamlMode && (
            <div className="pb-4 border-b">
              <div className={`${yamlMode === "live" ? "bg-green-50 text-gray-800" : "bg-gray-100 text-gray-800"} p-3 rounded font-mono text-xs overflow-x-auto`} style={{ maxHeight: "300px", overflowY: "auto" }}>
                <pre className="whitespace-pre-wrap break-words">
                  {getHighlightedYaml()?.map((item, idx) => (
                    <div key={idx} className={item.isDiff ? "bg-red-200" : ""}>
                      {item.line}
                    </div>
                  ))}
                </pre>
              </div>
            </div>
          )}

          {showMoreOptions && (
            <div className="pb-4 space-y-4">
            {/* General Options */}
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs font-semibold text-gray-700 mb-2 uppercase">General Options</div>
              <div className="grid grid-cols-4 gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={moreOptions.force}
                    onChange={(e) => setMoreOptions({ ...moreOptions, force: e.target.checked })}
                  />
                  <span className="text-xs text-gray-700">Force</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={moreOptions.prune}
                    onChange={(e) => setMoreOptions({ ...moreOptions, prune: e.target.checked })}
                  />
                  <span className="text-xs text-gray-700">Prune</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={moreOptions.dryRun}
                    onChange={(e) => setMoreOptions({ ...moreOptions, dryRun: e.target.checked })}
                  />
                  <span className="text-xs text-gray-700">Dry Run</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={moreOptions.applyOnly}
                    onChange={(e) => setMoreOptions({ ...moreOptions, applyOnly: e.target.checked })}
                  />
                  <span className="text-xs text-gray-700">Apply Only</span>
                </label>
              </div>
            </div>

            {/* Sync Options */}
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs font-semibold text-gray-700 mb-2 uppercase">Sync Options</div>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={moreOptions.skipSchemaValidation}
                    onChange={(e) => setMoreOptions({ ...moreOptions, skipSchemaValidation: e.target.checked })}
                  />
                  <span className="text-xs text-gray-700">Skip Schema Validation</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={moreOptions.autoCreateNamespace}
                    onChange={(e) => setMoreOptions({ ...moreOptions, autoCreateNamespace: e.target.checked })}
                  />
                  <span className="text-xs text-gray-700">Auto-create Namespace</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={moreOptions.pruneLast}
                    onChange={(e) => setMoreOptions({ ...moreOptions, pruneLast: e.target.checked })}
                  />
                  <span className="text-xs text-gray-700">Prune Last</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={moreOptions.applyOutOfSyncOnly}
                    onChange={(e) => setMoreOptions({ ...moreOptions, applyOutOfSyncOnly: e.target.checked })}
                  />
                  <span className="text-xs text-gray-700">Apply Out of Sync Only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={moreOptions.respectIgnoreDifferences}
                    onChange={(e) => setMoreOptions({ ...moreOptions, respectIgnoreDifferences: e.target.checked })}
                  />
                  <span className="text-xs text-gray-700">Respect Ignore Differences</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={moreOptions.serverSideApply}
                    onChange={(e) => setMoreOptions({ ...moreOptions, serverSideApply: e.target.checked })}
                  />
                  <span className="text-xs text-gray-700">Server Side Apply</span>
                </label>
              </div>
            </div>

            {/* Prune Propagation Policy */}
            <div className="bg-gray-50 p-3 rounded">
              <div className="text-xs font-semibold text-gray-700 mb-2 uppercase">Prune Propagation Policy</div>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={moreOptions.prunePropagationReplace}
                    onChange={(e) => setMoreOptions({ ...moreOptions, prunePropagationReplace: e.target.checked })}
                  />
                  <span className="text-xs text-gray-700">Replace</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={moreOptions.prunePropagationRetry}
                    onChange={(e) => setMoreOptions({ ...moreOptions, prunePropagationRetry: e.target.checked })}
                  />
                  <span className="text-xs text-gray-700">Retry</span>
                </label>
              </div>
            </div>
          </div>
        )}
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
