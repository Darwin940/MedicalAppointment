# Citas Médicas - Ionic Android

Aplicación Ionic Angular independiente para Android. Implementa inicio de sesión, navegación según rol y los catálogos de médicos y pacientes, conectándose a la API de la capa Business.

## Requisitos

- Node.js y npm
- Android Studio con Android SDK
- API Business ejecutándose en el puerto `9090`

## Ejecutar en Android Emulator

La URL inicial de la API está en `src/environments/environment.ts` y `src/environments/environment.prod.ts`. `10.0.2.2` es el host del emulador Android para acceder al `localhost` de la computadora; use una dirección IP alcanzable desde la red al ejecutar en un dispositivo físico.

```powershell
npm install
npm run build
npx cap sync android
npx cap open android
```

La plataforma `android` ya está incluida en el proyecto. Si se elimina y necesita regenerarla, ejecute `npx cap add android`. Compile e inicie la aplicación desde Android Studio. Para cambios posteriores en el frontend, ejecute `npm run build` y `npx cap sync android`.

El proyecto usa HTTP y el esquema Android `http` para funcionar con el backend local actual. En una instalación de producción, configure `apiUrl` para un servidor HTTPS y habilite CORS para el origen nativo de Capacitor en Business.
