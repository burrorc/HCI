import React, { useRef, useState } from "react";
import AppModal from "./AppModal";
import StatusBar from "./StatusBar";
import {
  LayoutGrid,
  Folder,
  GitBranch,
  Server,
  Settings,
  User,
  BookOpen,
  Pencil,
  Check,
} from "lucide-react";
import servicesData from "../../services.json";
import environmentsData from "../../environments.json";

type AppStatus = "Healthy" | "Progressing" | "Degraded" | "Missing" | "Unknown";

interface ServiceItem {
  name: string;
  abbreviation: string;
  liveBranch: string;
  liveCommit: string;
  desiredBranch: string;
  desiredCommit: string;
  status?: "Progressing" | "Healthy";
}

interface AppItem {
  name: string;
  status: AppStatus;
  synced: boolean;
  project: string;
  labels: string;
  repository: string;
  targetRevision: string;
  path: string;
  destination: string;
  namespace: string;
  createdAt: string;
  lastSync: string;
  time?: string;
}

interface StatusPillProps {
  label: string;
  color: string;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

interface AppCardProps {
  app: AppItem;
  draftTitle: string;
  isStarred: boolean;
  onToggleStar: () => void;
  isInfoMode: boolean;
  onToggleInfo: () => void;
  onDraftTitleChange: (next: string) => void;
  onTitleSave: () => void;
  onTitleRevert: () => void;
  onCardClick: () => void;
}

type IconSize = "sm" | "lg";

const HealthyIcon = ({ size = "sm" }: { size?: IconSize }) => {
  const iconClass = size === "lg" ? "w-10 h-10" : "w-4 h-4";
  const textClass = size === "lg" ? "text-2xl font-extrabold" : "text-xs";
  return (
    <div className="flex items-center gap-2 text-green-600">
      <svg viewBox="0 0 24 24" className={`${iconClass} fill-current`}>
        <path d="M12 21l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3 9.24 3 10.91 3.81 12 5.09 13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.18L12 21z" />
      </svg>
      <span className={textClass}>Healthy</span>
    </div>
  );
};

const ProgressingIcon = ({ size = "sm" }: { size?: IconSize }) => {
  const iconClass = size === "lg" ? "w-10 h-10" : "w-4 h-4";
  const textClass = size === "lg" ? "text-2xl font-extrabold" : "text-xs";
  return (
    <div className="flex items-center gap-2 text-green-600">
      <svg
        className={`${iconClass}`}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
      <span className={textClass}>Healthy</span>
    </div>
  );
};

const BlueProgressingIcon = ({ size = "sm" }: { size?: IconSize }) => {
  const iconClass = size === "lg" ? "w-10 h-10" : "w-4 h-4";
  const textClass = size === "lg" ? "text-2xl font-extrabold" : "text-xs";
  return (
    <div className="flex items-center gap-2 text-blue-600">
      <svg
        className={`${iconClass} animate-spin`}
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          strokeDasharray="60"
          strokeDashoffset="20"
        />
      </svg>
      <span className={textClass}>Progressing</span>
    </div>
  );
};

const DegradedIcon = ({ size = "sm" }: { size?: IconSize }) => {
  const iconClass = size === "lg" ? "w-10 h-10" : "w-4 h-4";
  const textClass = size === "lg" ? "text-2xl font-extrabold" : "text-xs";
  return (
    <div className="flex items-center gap-2 text-red-500">
      <svg viewBox="0 0 24 24" className={`${iconClass} stroke-current`} fill="none" strokeWidth="2">
        {/* Broken chain link */}
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        {/* Break symbol - diagonal line */}
        <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
      </svg>
      <span className={textClass}>Degraded</span>
    </div>
  );
};

const MissingIcon = ({ size = "sm" }: { size?: IconSize }) => {
  const iconClass = size === "lg" ? "w-10 h-10" : "w-4 h-4";
  const textClass = size === "lg" ? "text-2xl font-extrabold" : "text-xs";
  return (
    <div className="flex items-center gap-2 text-yellow-600">
      <svg viewBox="0 0 24 24" className={`${iconClass} fill-current`}>
        <path d="M12 2L2 22h20L12 2zm0 14h-1v-4h2v4h-1zm0 4h-1v-2h2v2h-1z" />
      </svg>
      <span className={textClass}>Missing</span>
    </div>
  );
};

const UnknownIcon = ({ size = "sm" }: { size?: IconSize }) => {
  const dotClass = size === "lg" ? "w-6 h-6" : "w-3 h-3";
  const textClass = size === "lg" ? "text-2xl font-extrabold" : "text-xs";
  return (
    <div className="flex items-center gap-2 text-gray-500">
      <div className={`${dotClass} rounded-full bg-gray-400`} />
      <span className={textClass}>Unknown</span>
    </div>
  );
};

const OutOfSyncIcon = ({ size = "sm" }: { size?: IconSize }) => {
  const iconClass = size === "lg" ? "w-10 h-10" : "w-4 h-4";
  const textClass = size === "lg" ? "text-2xl font-extrabold" : "text-xs";
  return (
    <div className="flex items-center gap-2 text-yellow-600">
      <svg viewBox="0 0 24 24" className={`${iconClass} stroke-current`} fill="none" strokeWidth="2">
        <path d="M12 19V5" />
        <polyline points="5 12 12 5 19 12" />
      </svg>
      <span className={textClass}>OutOfSync</span>
    </div>
  );
};

const SyncedIcon = ({ size = "sm" }: { size?: IconSize }) => {
  const iconClass = size === "lg" ? "w-10 h-10" : "w-4 h-4";
  const textClass = size === "lg" ? "text-2xl font-extrabold" : "text-xs";
  return (
    <div className="flex items-center gap-2 text-green-600">
      <svg viewBox="0 0 24 24" className={`${iconClass} stroke-current`}>
        <path d="M5 13l4 4L19 7" strokeWidth="2" fill="none" />
      </svg>
      <span className={textClass}>Synced</span>
    </div>
  );
};

const SyncIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current">
    <path d="M4 12a8 8 0 0113-5" strokeWidth="2" fill="none" />
    <polyline points="17,3 17,7 13,7" strokeWidth="2" fill="none" />
    <path d="M20 12a8 8 0 01-13 5" strokeWidth="2" fill="none" />
    <polyline points="7,21 7,17 11,17" strokeWidth="2" fill="none" />
  </svg>
);

const RefreshIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current">
    <path
      d="M20 12a8 8 0 10-2.35 5.65"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
    <polyline
      points="20 8 20 12 16 12"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const DeleteIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 stroke-current">
    <polyline points="3 6 5 6 21 6" strokeWidth="2" fill="none" />
    <path d="M19 6l-1 14H6L5 6" strokeWidth="2" fill="none" />
    <path d="M10 11v6M14 11v6" strokeWidth="2" />
    <path d="M9 6V4h6v2" strokeWidth="2" />
  </svg>
);

const apps: AppItem[] = environmentsData.map((env, i) => {
  const name = `${env.environment}-${env.cluster}-${env.group}`;
  
  let status: AppStatus = "Healthy";
  let synced = true;
  
  // Set specific statuses
  if (i === 4 || i === 22) {
    status = "Progressing";
  } else if (i === 0 || i === 10 || i === 18) {
    synced = false; // Out of Sync
  } else if (i === 23) {
    status = "Degraded";
  }
  
  return {
    name,
    status,
    synced,
    project: env.gcpProject,
    labels: `environment=${env.environment}, group=${env.group}, region=${env.cluster}`,
    repository: `https://github.com/my-boutique-shop/${env.environment}-${env.cluster}-manifest.git`,
    targetRevision: env.environment,
    path: `deployment/${env.group}/${env.environment}/${env.cluster}/`,
    destination: env.destination,
    namespace: "my-boutique-shop",
    createdAt: "01/21/2025 09:59:55 (a year ago)",
    lastSync: "03/24/2026 11:32:52 (4 hours ago)",
    time: `${1 + (i % 2)}m${30 + (i * 3 % 30)}s`,
  };
});

function StatusPill({ label, color }: StatusPillProps) {
  return (
    <div className="flex items-center gap-1 text-xs text-gray-600">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      {label}
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: NavItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-2 py-2 rounded text-left transition-colors ${
        active ? "bg-white/15 text-white" : "text-gray-200 hover:bg-white/10"
      }`}
    >
      <span className="shrink-0">{icon}</span>
      <span className="truncate text-sm">{label}</span>
    </button>
  );
}
const ArgoLogo = () => (
  <img
    src="https://jenkins.reporting.globalpay.com/argocd/assets/images/logo.png"
    alt="Argo logo"
    className="w-[74px] h-[74px] object-contain"
  />
);

function AppCard({
  app,
  draftTitle,
  isStarred,
  onToggleStar,
  isInfoMode,
  onToggleInfo,
  onDraftTitleChange,
  onTitleSave,
  onTitleRevert,
  onCardClick,
}: AppCardProps & { onCardClick: () => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const justSavedRef = useRef(false);
  const statusColor =
    app.status === "Degraded"
      ? "bg-red-500"
      : app.status === "Progressing"
        ? "bg-blue-600"
        : !app.synced
          ? "bg-yellow-500"
          : "bg-green-500";

  const renderStatusIcon = (size: IconSize = "sm") => {
    switch (app.status) {
      case "Healthy":
        return <HealthyIcon size={size} />;
      case "Progressing":
        return <ProgressingIcon size={size} />;
      case "Degraded":
        return <DegradedIcon size={size} />;
      case "Missing":
        return <MissingIcon size={size} />;
      default:
        return <UnknownIcon size={size} />;
    }
  };

  const renderSyncIcon = (size: IconSize = "sm") => {
    if (app.status === "Progressing") {
      return <BlueProgressingIcon size={size} />;
    }
    return app.synced ? <SyncedIcon size={size} /> : <OutOfSyncIcon size={size} />;
  };

  return (
    <div
      className={`flex rounded-lg shadow-sm overflow-hidden border-2 cursor-pointer ${
        isInfoMode ? "bg-sky-50 border-blue-200" : "bg-white border-gray-200"
      }`}
      onClick={onCardClick}
    >
      {/* LEFT status bar */}
      <div
        className={`w-1.5 ${statusColor} ${
          isInfoMode ? "filter brightness-90" : ""
        }`}
      />

      {/* Card content */}
      <div className="flex-1 p-2 sm:p-3 text-xs sm:text-sm flex flex-col gap-1 sm:gap-2 overflow-hidden relative">
        {/* Buttons - top right */}
        <div className="absolute top-2 right-2 flex items-center gap-1 flex-shrink-0 z-10">
          <button
            className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full text-xs flex items-center justify-center font-semibold italic font-serif border transition-colors ${
              isInfoMode
                ? "bg-white text-blue-600 border-blue-500 hover:bg-blue-50"
                : "bg-blue-500 text-white border-blue-500 hover:bg-blue-600"
            }`}
            aria-label="Toggle info view"
            onClick={(e) => {
              e.stopPropagation();
              onToggleInfo();
            }}
          >
            i
          </button>
          <button
            type="button"
            aria-label={isStarred ? "Unstar app" : "Star app"}
            className={`text-base sm:text-lg transition-colors ${
              isStarred ? "text-yellow-400" : "text-gray-300"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar();
            }}
          >
            {isStarred ? "★" : "☆"}
          </button>
        </div>

        {/* Header */}
        <div className="flex items-center gap-1 sm:gap-2 pr-16">
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-1 rounded border border-transparent bg-gray-50/80 px-1 sm:px-1.5 py-0.5 shadow-inner focus-within:border-gray-300 focus-within:bg-white group h-6">
              <input
                className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 bg-transparent border-none focus:outline-none flex-1 truncate"
                value={draftTitle}
                onChange={(e) => onDraftTitleChange(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    justSavedRef.current = true;
                    onTitleSave();
                    inputRef.current?.blur();
                  }
                }}
                onBlur={(e) => {
                  if (justSavedRef.current) {
                    justSavedRef.current = false;
                    return;
                  }
                  const target = e.relatedTarget as HTMLElement | null;
                  if (target && target.dataset?.titleSave === app.name) return;
                  onTitleRevert();
                }}
                ref={inputRef}
              />
              <button
                type="button"
                aria-label="Save title"
                className="relative w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center rounded text-green-600 hover:bg-green-50 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-green-300 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  justSavedRef.current = true;
                  onTitleSave();
                  (e.currentTarget as HTMLButtonElement).blur();
                  inputRef.current?.blur();
                }}
                data-title-save={app.name}
              >
                <Pencil
                  size={12}
                  className="text-gray-400 transition-opacity duration-150 group-focus-within:opacity-0"
                  aria-hidden="true"
                />
                <Check
                  size={12}
                  className="absolute text-green-600 opacity-0 transition-opacity duration-150 group-focus-within:opacity-100"
                  aria-hidden="true"
                />
              </button>
            </div>
            <div className="text-xs text-gray-500 px-1 truncate">{app.name}</div>
          </div>
        </div>

        {/* Meta */}
        <div className="text-xs flex-1 space-y-0.5 sm:space-y-1 flex flex-col items-center justify-center overflow-y-auto px-2">
          {isInfoMode ? (
            <div className="w-full">
              <div className="truncate whitespace-nowrap"><span className="text-gray-600">Project:</span> <span className="text-gray-700">{app.project}</span></div>
              <div className="truncate whitespace-nowrap"><span className="text-gray-600">Labels:</span> <span className="text-gray-700">{app.labels}</span></div>
              <div className="flex gap-1 items-center whitespace-nowrap">
                <span className="text-gray-500">Status:</span>
                <div className="scale-75 origin-left">
                  {renderStatusIcon()}
                </div>
                <div className="scale-75 origin-left">
                  {renderSyncIcon()}
                </div>
              </div>
              <div className="truncate whitespace-nowrap"><span className="text-gray-600">Repo:</span> <span className="text-gray-700">{app.repository}</span></div>
              <div className="truncate whitespace-nowrap"><span className="text-gray-600">Revision:</span> <span className="text-gray-700">{app.targetRevision}</span></div>
              <div className="truncate whitespace-nowrap"><span className="text-gray-600">Path:</span> <span className="text-gray-700">{app.path}</span></div>
              <div className="truncate whitespace-nowrap"><span className="text-gray-600">Destination:</span> <span className="text-gray-700">{app.destination}</span></div>
              <div className="truncate whitespace-nowrap"><span className="text-gray-600">Namespace:</span> <span className="text-gray-700">{app.namespace}</span></div>
              <div className="truncate whitespace-nowrap"><span className="text-gray-600">Created:</span> <span className="text-gray-700">{app.createdAt}</span></div>
              <div className="truncate whitespace-nowrap"><span className="text-gray-600">Sync:</span> <span className="text-gray-700">{app.lastSync}</span></div>
            </div>
          ) : (
            <div className="flex flex-col gap-1 sm:gap-2 text-gray-800 items-center text-center">
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 shadow-inner">
                <div className="scale-75 origin-center">
                  {renderStatusIcon("lg")}
                </div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1 shadow-sm">
                <div className="scale-75 origin-center">
                  {renderSyncIcon("lg")}
                </div>
              </div>
              <div className="text-gray-500 truncate text-xs"><span className="text-gray-600">Created:</span> <span className="text-gray-700">{app.createdAt}</span></div>
              <div className="text-gray-500 truncate text-xs"><span className="text-gray-600">Synced:</span> <span className="text-gray-700">{app.lastSync}</span></div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-1 mt-auto pt-1 justify-center items-center">
          <button onClick={(e) => e.stopPropagation()} className="px-2 h-6 text-xs bg-gray-700 text-white rounded-full flex items-center gap-1 whitespace-nowrap">
            <SyncIcon />
            <span className="hidden sm:inline">SYNC</span>
          </button>
          <button onClick={(e) => e.stopPropagation()} className="px-2 h-6 text-xs bg-gray-700 text-white rounded-full flex items-center gap-1 whitespace-nowrap">
            <RefreshIcon />
            <span className="hidden sm:inline">REFRESH</span>
          </button>
          <button onClick={(e) => e.stopPropagation()} className="px-2 h-6 text-xs bg-gray-700 text-white rounded-full flex items-center gap-1 whitespace-nowrap">
            <DeleteIcon />
            <span className="hidden sm:inline">DELETE</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ServiceCard({
  service,
  onCardClick,
}: {
  service: ServiceItem;
  onCardClick?: () => void;
}) {
  const isSynced = service.liveBranch === service.desiredBranch && service.liveCommit === service.desiredCommit;
  const isProgressing = service.status === "Progressing";
  const statusColor = isProgressing ? "bg-blue-600" : (isSynced ? "bg-green-500" : "bg-yellow-500");

  return (
    <div
      className={`flex rounded-lg shadow-sm overflow-hidden border-2 bg-white border-gray-200 relative cursor-pointer`}
      onClick={onCardClick}
    >
      {/* LEFT status bar */}
      <div className={`w-1.5 ${statusColor}`} />

      {/* Abbreviation Circle - Top Left (moved slightly right) */}
      <div className={`absolute top-2 left-3 w-9 h-9 rounded-full ${statusColor} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
        {service.abbreviation}
      </div>

      {/* Card content */}
      <div className="flex-1 p-2 sm:p-3 text-xs sm:text-sm flex flex-col gap-1 sm:gap-2 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 ml-10">
          <div className="flex flex-col flex-1 min-w-0">
            <div className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
              {service.name}
            </div>
          </div>
        </div>

        {/* Meta */}
        <div className="text-xs flex-1 flex flex-col justify-between">
          {/* Centered Synced Pill with Icon */}
          <div className="flex-1 flex items-center justify-center">
            <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded text-xl font-bold ${isProgressing ? 'bg-blue-100 text-blue-800' : (isSynced ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800')}`}>
              {isProgressing ? (
                <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeDasharray="60" strokeDashoffset="20" /></svg>
              ) : isSynced ? (
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
              ) : (
                <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 19V5" /><polyline points="5 12 12 5 19 12" /></svg>
              )}
              {isProgressing ? 'Progressing' : (isSynced ? 'Synced' : 'Out of Sync')}
            </span>
          </div>

          {/* Live vs Desired Comparison - Bottom */}
          <div className="grid grid-cols-2 gap-0 mt-auto">
            {/* Live */}
            <div className="pr-1 flex flex-col gap-0.5">
              <div className="flex items-center gap-1 text-gray-700 font-bold text-xs mb-1">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Live
              </div>
              <div className="truncate whitespace-nowrap"><span className="text-gray-600">branch:</span> <span className="text-gray-700 text-xs">{service.liveBranch}</span></div>
              <div className="truncate whitespace-nowrap"><span className="text-gray-600">commitId:</span> <span className="text-gray-700 font-mono text-xs">{service.liveCommit.slice(0, 8)}</span></div>
            </div>
            
            {/* Desired */}
            <div className="pl-1 flex flex-col gap-0.5">
              <div className="flex items-center gap-1 text-gray-700 font-bold text-xs mb-1">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
                Desired
              </div>
              <div className="truncate whitespace-nowrap"><span className="text-gray-600">branch:</span> <span className="text-gray-700 text-xs">{service.desiredBranch}</span></div>
              <div className="truncate whitespace-nowrap"><span className="text-gray-600">commitId:</span> <span className="text-gray-700 font-mono text-xs">{service.desiredCommit.slice(0, 8)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ArgoCardsLayout() {
  const [starredByName, setStarredByName] = useState<Record<string, boolean>>({});
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const [infoModeByName, setInfoModeByName] = useState<Record<string, boolean>>({});
  const [titlesByName, setTitlesByName] = useState<Record<string, string>>(
    () => Object.fromEntries(apps.map((a) => [a.name, a.name]))
  );
  const [draftTitlesByName, setDraftTitlesByName] = useState<Record<string, string>>(
    () => Object.fromEntries(apps.map((a) => [a.name, a.name]))
  );
  const [selectedApp, setSelectedApp] = useState<string | null>(null);
  const [servicePage, setServicePage] = useState(1);
  const [modalApp, setModalApp] = useState<AppItem | ServiceItem | null>(null);
  const [syncingApps, setSyncingApps] = useState<Set<string>>(new Set());
  const [syncedApps, setSyncedApps] = useState<Set<string>>(new Set());
  const [syncedLiveData, setSyncedLiveData] = useState<Record<string, { liveBranch: string; liveCommit: string }>>({});

  const getDisplayTitle = (app: AppItem) => titlesByName[app.name] ?? app.name;
  const getDraftTitle = (app: AppItem) => draftTitlesByName[app.name] ?? getDisplayTitle(app);

  const sortedApps = [...apps].map(app => {
    if (syncingApps.has(app.name)) {
      return { ...app, status: "Progressing" as AppStatus };
    } else if (syncedApps.has(app.name)) {
      return { ...app, status: "Healthy" as AppStatus, synced: true };
    }
    return app;
  }).sort((a, b) => {
    const aStar = !!starredByName[a.name];
    const bStar = !!starredByName[b.name];

    if (aStar && !bStar) return -1;
    if (!aStar && bStar) return 1;

    const titleCompare = getDisplayTitle(a)
      .toLowerCase()
      .localeCompare(getDisplayTitle(b).toLowerCase());

    if (titleCompare !== 0) return titleCompare;
    return a.name.localeCompare(b.name);
  });

  const totalPages = Math.max(1, Math.ceil(sortedApps.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pagedApps = sortedApps.slice(startIndex, startIndex + pageSize);

  const servicePageSize = 16;  // 4 rows × 4 cols
  const sortedServices = [...servicesData].map(service => {
    const synced = syncedLiveData[service.name];
    if (syncingApps.has(service.name)) {
      return { 
        ...service, 
        status: "Progressing" as const,
        liveBranch: synced?.liveBranch ?? service.liveBranch,
        liveCommit: synced?.liveCommit ?? service.liveCommit,
      };
    } else if (syncedApps.has(service.name)) {
      return { 
        ...service, 
        status: "Healthy" as const,
        liveBranch: synced?.liveBranch ?? service.liveBranch,
        liveCommit: synced?.liveCommit ?? service.liveCommit,
      };
    }
    return service;
  }).sort((a, b) => a.name.localeCompare(b.name));
  const servicePages = Math.max(1, Math.ceil(sortedServices.length / servicePageSize));
  const currentServicePage = Math.min(servicePage, servicePages);
  const serviceStartIndex = (currentServicePage - 1) * servicePageSize;
  const pagedServices = sortedServices.slice(serviceStartIndex, serviceStartIndex + servicePageSize);

  const statusCounts = sortedApps.reduce(
    (acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    },
    {
      Healthy: 0,
      Progressing: 0,
      Degraded: 0,
      Missing: 0,
      Unknown: 0,
    } as Record<AppStatus, number>
  );

  const statusSegments = [
    { label: "Synced", count: sortedApps.filter(app => app.synced === true && !syncingApps.has(app.name)).length, color: "bg-green-500" },
    { label: "Out of Sync", count: sortedApps.filter(app => app.synced === false && !syncingApps.has(app.name)).length, color: "bg-yellow-500" },
    { label: "Progressing", count: statusCounts.Progressing, color: "bg-blue-600" },
    { label: "Degraded", count: statusCounts.Degraded, color: "bg-red-500" },
  ];
  const totalStatus = sortedApps.length || 1;

  // Service status counts
  const serviceSyncCounts = sortedServices.reduce(
    (acc, service) => {
      if (syncingApps.has(service.name)) {
        acc.Progressing = (acc.Progressing || 0) + 1;
      } else {
        const isSynced = service.liveBranch === service.desiredBranch && service.liveCommit === service.desiredCommit;
        if (isSynced) {
          acc.Synced = (acc.Synced || 0) + 1;
        } else {
          acc["Out of Sync"] = (acc["Out of Sync"] || 0) + 1;
        }
      }
      return acc;
    },
    { Synced: 0, "Out of Sync": 0, Progressing: 0 } as Record<string, number>
  );

  const serviceStatusSegments = [
    { label: "Synced", count: serviceSyncCounts.Synced, color: "bg-green-500" },
    { label: "Out of Sync", count: serviceSyncCounts["Out of Sync"], color: "bg-yellow-500" },
    { label: "Progressing", count: serviceSyncCounts.Progressing, color: "bg-blue-600" },
  ];
  const totalServiceStatus = sortedServices.length || 1;

  return (
    <>
      <AppModal 
        app={modalApp} 
        onClose={() => setModalApp(null)} 
        selectedAppName={selectedApp || undefined}
        isSyncing={modalApp ? syncingApps.has(modalApp.name) : false}
        syncedLiveData={modalApp ? syncedLiveData[modalApp.name] : undefined}
        onSync={(app) => {
          if (app && 'name' in app) {
            // Parse time from app data (e.g., "1m45s" -> milliseconds)
            let durationMs = 2000; // default
            if (app.time) {
              const minuteMatch = app.time.match(/(\d+)m/);
              const secondMatch = app.time.match(/(\d+)s/);
              const minutes = minuteMatch ? parseInt(minuteMatch[1]) : 0;
              const seconds = secondMatch ? parseInt(secondMatch[1]) : 0;
              durationMs = (minutes * 60 + seconds) * 1000;
            }
            
            // Add app to syncing set
            setSyncingApps(prev => new Set([...prev, app.name]));
            
            // Update synced live data with desired values
            setSyncedLiveData(prev => ({
              ...prev,
              [app.name]: {
                liveBranch: app.desiredBranch,
                liveCommit: app.desiredCommit,
              }
            }));
            
            // After duration expires, move to synced
            setTimeout(() => {
              setSyncingApps(prev => {
                const newSet = new Set(prev);
                newSet.delete(app.name);
                return newSet;
              });
              setSyncedApps(prev => new Set([...prev, app.name]));
            }, durationMs);
          }
        }}
      />
      <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-[#1A3B4C] text-gray-200 flex flex-col p-4">
  {/* Logo */}
  <div className="flex items-center gap-2 text-white mb-6 px-1">
  <ArgoLogo />
  <span className="font-semibold text-2xl">argo</span>
</div>

  {/* Nav Items */}
  <div className="flex flex-col gap-3 text-sm">
    <NavItem icon={<LayoutGrid size={18} />} label="Applications" active />
        <NavItem icon={<Folder size={18} />} label="Projects" />
        <NavItem icon={<GitBranch size={18} />} label="Repositories" />
        <NavItem icon={<Server size={18} />} label="Clusters" />
        <NavItem icon={<Settings size={18} />} label="Settings" />
        <NavItem icon={<User size={18} />} label="User Info" />
        <NavItem icon={<BookOpen size={18} />} label="Documentation" />
  </div>

  {/* Filters */}
  <div className="mt-6">
    <input
      className="w-full px-3 py-2 rounded bg-[#132A36] text-sm placeholder-gray-400 outline-none"
      placeholder="Filter name"
    />
  </div>
</div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Controls */}
        <div className="bg-white border-b p-3 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <button className="px-2 py-0.5 text-[10px] bg-gray-100 rounded">
              + NEW APP
            </button>
            <button className="px-2 py-0.5 text-[10px] bg-gray-100 rounded">
              SYNC APPS
            </button>
            <button className="px-2 py-0.5 text-[10px] bg-gray-100 rounded">
              REFRESH APPS
            </button>

            <div className="relative ml-4">
              <input
                className="px-3 py-1 border rounded-full text-xs w-64"
                placeholder="Search applications..."
                onFocus={() => setShowSearchDropdown(true)}
                onBlur={() => setShowSearchDropdown(false)}
              />
              {showSearchDropdown && (
                <div className="absolute mt-1 w-64 bg-white border rounded shadow text-xs max-h-64 overflow-auto z-50">
                  {sortedApps.map((app) => {
                      const displayTitle = titlesByName[app.name] ?? app.name;
                    return (
                    <div
                      key={app.name}
                      className="px-3 py-1 hover:bg-gray-100 cursor-pointer flex items-start gap-2"
                      onMouseDown={() => {
                        setSelectedApp(app.name);
                        setShowSearchDropdown(false);
                      }}
                    >
                      <span className={starredByName[app.name] ? "text-yellow-400" : "text-gray-300"}>
                        {starredByName[app.name] ? "★" : "☆"}
                      </span>
                      <div className="flex flex-col leading-tight">
                        <span className="font-medium text-gray-800">{displayTitle}</span>
                        <span className="text-[11px] text-gray-500">{app.name}</span>
                      </div>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-0">
            <button
              onClick={() => {
                setPage(1);
                setSelectedApp(null);
              }}
              className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800 hover:underline font-medium"
            >
              / projects
            </button>
            {selectedApp && (
              <>
                <span className="text-gray-400">
                  /
                </span>
                <span className="text-sm text-gray-600 font-medium">
                  {selectedApp}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Progress bar */}
        {!selectedApp && (
          <StatusBar segments={statusSegments} total={totalStatus} />
        )}

        {selectedApp && (
          <StatusBar segments={serviceStatusSegments} total={totalServiceStatus} />
        )}

        {/* Page selector */}
        {!selectedApp && (
          <div className="flex items-center justify-center gap-1 sm:gap-2 text-xs text-gray-600 px-4 py-2">
            <button
              className="px-1.5 py-0.5 bg-gray-200 rounded disabled:opacity-50 text-xs"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <span className="text-xs whitespace-nowrap">
              {currentPage}/{totalPages}
            </span>
            <button
              className="px-1.5 py-0.5 bg-gray-200 rounded disabled:opacity-50 text-xs"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}

        {selectedApp && (
          <div className="flex items-center justify-center gap-1 sm:gap-2 text-xs text-gray-600 px-4 py-2">
            <button
              className="px-1.5 py-0.5 bg-gray-200 rounded disabled:opacity-50 text-xs"
              onClick={() => setServicePage((p) => Math.max(1, p - 1))}
              disabled={currentServicePage === 1}
            >
              Prev
            </button>
            <span className="text-xs whitespace-nowrap">
              {currentServicePage}/{servicePages}
            </span>
            <button
              className="px-1.5 py-0.5 bg-gray-200 rounded disabled:opacity-50 text-xs"
              onClick={() => setServicePage((p) => Math.min(servicePages, p + 1))}
              disabled={currentServicePage === servicePages}
            >
              Next
            </button>
          </div>
        )}

        {/* Cards Grid */}
        <div className="flex-1 overflow-hidden p-2 sm:p-3 flex flex-col gap-1 sm:gap-2">

          <div className="flex-1 overflow-hidden">
            <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 h-full ${selectedApp ? "grid-rows-4" : "auto-rows-fr"}`}>
              {selectedApp ? (
                // Show services from services.json (paginated)
                pagedServices.map((service) => (
                  <ServiceCard 
                    key={service.name} 
                    service={service}
                    onCardClick={() => setModalApp(service as any)}
                  />
                ))
              ) : (
                // Show apps
                pagedApps.map((app) => {
                  const displayTitle = getDisplayTitle(app);
                  const draftTitle = getDraftTitle(app);
                  return (
                    <AppCard
                      key={app.name}
                      app={app}
                      draftTitle={draftTitle}
                      isStarred={!!starredByName[app.name]}
                      onToggleStar={() =>
                        setStarredByName((prev) => ({
                          ...prev,
                          [app.name]: !prev[app.name],
                        }))
                      }
                      isInfoMode={!!infoModeByName[app.name]}
                      onToggleInfo={() =>
                        setInfoModeByName((prev) => ({
                          ...prev,
                          [app.name]: !prev[app.name],
                        }))
                      }
                      onDraftTitleChange={(next) =>
                        setDraftTitlesByName((prev) => ({
                          ...prev,
                          [app.name]: next,
                        }))
                      }
                      onTitleSave={() => {
                        const next = (draftTitlesByName[app.name] ?? app.name).trim();
                        const safeNext = next || app.name;
                        setTitlesByName((prev) => ({
                          ...prev,
                          [app.name]: safeNext,
                        }));
                        setDraftTitlesByName((prev) => ({
                          ...prev,
                          [app.name]: safeNext,
                        }));
                      }}
                      onTitleRevert={() => {
                        const saved = getDisplayTitle(app);
                        setDraftTitlesByName((prev) => ({
                          ...prev,
                          [app.name]: saved,
                        }));
                      }}
                      onCardClick={() => {
                        setSelectedApp(app.name);
                        setServicePage(1);
                      }}
                    />
                  );
                })
              )}
            </div>
          </div>

          {selectedApp ? (
            <div className="flex items-center justify-center gap-1 sm:gap-2 text-xs text-gray-600">
              <button
                className="px-1.5 py-0.5 bg-gray-200 rounded disabled:opacity-50 text-xs"
                onClick={() => setServicePage((p) => Math.max(1, p - 1))}
                disabled={currentServicePage === 1}
              >
                Prev
              </button>
              <span className="text-xs whitespace-nowrap">
                {currentServicePage}/{servicePages}
              </span>
              <button
                className="px-1.5 py-0.5 bg-gray-200 rounded disabled:opacity-50 text-xs"
                onClick={() => setServicePage((p) => Math.min(servicePages, p + 1))}
                disabled={currentServicePage === servicePages}
              >
                Next
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1 sm:gap-2 text-xs text-gray-600">
              <button
                className="px-1.5 py-0.5 bg-gray-200 rounded disabled:opacity-50 text-xs"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              <span className="text-xs whitespace-nowrap">
                {currentPage}/{totalPages}
              </span>
              <button
                className="px-1.5 py-0.5 bg-gray-200 rounded disabled:opacity-50 text-xs"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );

}