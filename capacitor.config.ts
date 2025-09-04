import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.61b6909d21c34d52bc90c6b7b0e6c0f4',
  appName: 'oasis-harmony-zone',
  webDir: 'dist',
  server: {
    url: "https://61b6909d-21c3-4d52-bc90-c6b7b0e6c0f4.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    KeepAwake: {
      ios: {
        allowIdleTimer: false
      },
      android: {
        allowIdleTimer: false
      }
    }
  }
};

export default config;