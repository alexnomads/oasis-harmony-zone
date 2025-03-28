
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
        send_page_view?: boolean;
        [key: string]: any;
      }
    ) => void;
    dataLayer: any[];
  }
}

interface GoogleAnalyticsProps {
  measurementId: string;
}

export const GoogleAnalytics = ({ measurementId }: GoogleAnalyticsProps) => {
  const location = useLocation();
  
  // Track page views
  useEffect(() => {
    if (typeof window.gtag !== 'undefined') {
      // Send page view with updated path
      window.gtag('config', measurementId, {
        page_path: location.pathname + location.search,
        page_title: document.title,
        send_page_view: true
      });
      
      console.log('GA pageview tracked:', location.pathname + location.search);
    } else {
      console.warn('Google Analytics not loaded properly');
    }
  }, [location, measurementId]);

  // Debug initialization
  useEffect(() => {
    console.log('Google Analytics initialization check');
    if (typeof window.gtag === 'undefined') {
      console.warn('Google Analytics gtag not found');
    } else {
      console.log('Google Analytics initialized with ID:', measurementId);
    }
    
    // Check if dataLayer exists
    if (window.dataLayer) {
      console.log('dataLayer exists:', window.dataLayer);
    } else {
      console.warn('dataLayer not initialized');
    }
  }, [measurementId]);

  return null; // This component doesn't render anything
};

// Helper function that can be used elsewhere in the app
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
    console.log('GA event tracked:', { category, action, label, value });
  }
};
