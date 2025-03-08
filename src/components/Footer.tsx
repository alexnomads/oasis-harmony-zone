
import React from 'react';
import { Version } from './Version';

export const Footer = () => {
  // This should ideally come from an environment variable or package.json
  const version = "1.0.0";
  
  return (
    <footer className="w-full py-4 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()} Rose of Jericho. All rights reserved.
        </p>
        <Version version={version} />
      </div>
    </footer>
  );
};
