import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.darwincortes.medicalappointments',
  appName: 'Medical Appointments',
  webDir: 'www',
  server: {
    androidScheme: 'http',
  },
};

export default config;
