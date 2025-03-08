
import React from 'react';

interface VersionProps {
  version: string;
}

export const Version: React.FC<VersionProps> = ({ version }) => {
  return (
    <div className="text-xs text-gray-400 opacity-70 hover:opacity-100 transition-opacity">
      Version: {version}
    </div>
  );
};
