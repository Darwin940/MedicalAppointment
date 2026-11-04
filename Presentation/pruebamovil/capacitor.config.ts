import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.luiswest.citasmedicas',
  appName: 'CitasMedicas',
  webDir: 'dist/Presentation/browser',
  server: {
    cleartext: true,
    androidScheme: 'http'
  }
};

export default config;
