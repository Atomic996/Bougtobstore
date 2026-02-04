
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

console.log("🚀 Bougtob Store is starting...");

const startApp = () => {
  const container = document.getElementById('root');
  
  if (!container) {
    console.error("❌ Fatal Error: Element #root not found in HTML.");
    return;
  }

  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("✅ React App mounted successfully.");
  } catch (err) {
    console.error("❌ Critical Error during React hydration:", err);
    container.innerHTML = `
      <div style="color: white; padding: 20px; text-align: center; background: #050810; height: 100vh; display: flex; flex-direction: column; justify-content: center;">
        <h2 style="color: #ef4444;">حدث خطأ أثناء تحميل الصفحة</h2>
        <p style="color: #94a3b8;">يرجى تحديث الصفحة أو المحاولة لاحقاً</p>
        <code style="font-size: 10px; opacity: 0.5;">${err}</code>
      </div>
    `;
  }
};

// تشغيل التطبيق فوراً
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  startApp();
} else {
  document.addEventListener('DOMContentLoaded', startApp);
}
