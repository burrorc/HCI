import React from "react";

interface StatusSegment {
  label: string;
  count: number;
  color: string;
}

interface StatusBarProps {
  segments: StatusSegment[];
  total: number;
}

const StatusBar: React.FC<StatusBarProps> = ({ segments, total }) => {
  return (
    <div className="px-4 py-2">
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden flex">
        {segments
          .filter((seg) => seg.count > 0)
          .map((seg) => (
            <div
              key={seg.label}
              className={`${seg.color} h-full`}
              style={{ width: `${(seg.count / total) * 100}%` }}
              aria-label={`${seg.label}: ${seg.count}`}
            />
          ))}
      </div>
    </div>
  );
};

export default StatusBar;
