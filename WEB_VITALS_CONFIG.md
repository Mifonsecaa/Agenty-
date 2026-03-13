// next-env.d.ts - Web Vitals Configuration
// Para monitorear el rendimiento en tiempo real

import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next"

// Agregar a tu RootLayout:
/*
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
*/

// Métricas que ahora se capturan automáticamente:
const metricsToMonitor = {
  LCP: "Largest Contentful Paint (meta: <2.5s)",
  FID: "First Input Delay (meta: <100ms)",
  CLS: "Cumulative Layout Shift (meta: <0.1)",
  TTFB: "Time to First Byte (meta: <600ms)",
  FCP: "First Contentful Paint (meta: <1.8s)",
};

// Si quieres agregar Web Vitals manualmente:
/*
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  console.log('Core Web Vital:', metric);
  // Enviar a tu servicio analítico
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
*/

