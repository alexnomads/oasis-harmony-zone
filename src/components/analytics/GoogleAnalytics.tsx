
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Declare the gtag function to avoid TypeScript errors
declare global {
  interface Window {
    gtag: (
      command: string,
      action: string,
      params?: {
        page_path?: string;
        page_title?: string;
        [key: string]: any;
      }
    ) => void;
  }
}

interface GoogleAnalyticsProps {
  measurementId: string;
}

export const GoogleAnalytics = ({ measurementId }: GoogleAnalyticsProps) => {
  const location = useLocation();
  
  // Update the tracking ID in the HTML script
  useEffect(() => {
    // Replace the placeholder with the actual measurement ID
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].src.includes('googletagmanager.com/gtag/js')) {
        scripts[i].src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      }
      
      if (scripts[i].innerHTML.includes('G-MEASUREMENT_ID')) {
        scripts[i].innerHTML = scripts[i].innerHTML.replace(
          'G-MEASUREMENT_ID', 
          measurementId
        );
      }
    }
  }, [measurementId]);
  
  // Track page views
  useEffect(() => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('config', measurementId, {
        page_path: location.pathname + location.search,
        page_title: document.title
      });
    }
  }, [location, measurementId]);

  return null; // This component doesn't render anything
};
