import React from "react";

export default function ArgoLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col p-4">
        <div className="text-2xl font-bold mb-6">argo</div>
        <nav className="space-y-4">
          <div className="opacity-80 hover:opacity-100 cursor-pointer">Applications</div>
          <div className="opacity-80 hover:opacity-100 cursor-pointer">Settings</div>
          <div className="opacity-80 hover:opacity-100 cursor-pointer">User Info</div>
          <div className="opacity-80 hover:opacity-100 cursor-pointer">Documentation</div>
        </nav>
        <div className="mt-8">
          <input
            className="w-full p-2 rounded bg-slate-800 text-sm"
            placeholder="Filter name"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white p-4 shadow flex items-center justify-between">
          <div className="text-lg font-semibold">Applications / prometheus</div>
          <div className="space-x-2">
            <button className="px-3 py-1 bg-gray-200 rounded">Sync</button>
            <button className="px-3 py-1 bg-gray-200 rounded">Refresh</button>
          </div>
        </div>

        {/* Status Row */}
        <div className="grid grid-cols-3 gap-4 p-4">
          <div className="bg-white p-4 rounded shadow">Healthy</div>
          <div className="bg-white p-4 rounded shadow">Synced</div>
          <div className="bg-white p-4 rounded shadow">Sync OK</div>
        </div>

        {/* Graph Area */}
        <div className="flex-1 p-4 overflow-auto">
          <div className="bg-white rounded shadow p-4 h-full">
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 bg-gray-100 rounded">prometheus</div>
              <div className="p-4 bg-gray-100 rounded">service accounts</div>
              <div className="p-4 bg-gray-100 rounded">pods</div>
              <div className="p-4 bg-gray-100 rounded">deployments</div>
              <div className="p-4 bg-gray-100 rounded">replica sets</div>
              <div className="p-4 bg-gray-100 rounded">controller revisions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
