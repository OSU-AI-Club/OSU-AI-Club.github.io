import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import aiLogo from '../assets/images/AI_Logo_Final.png';
import { initTheme, subscribe } from './theme';
import { startSplashHandoff } from './splash';

// Reconcile the class set by the pre-paint script in index.html with the store.
initTheme();

// Tell the boot splash the bundle has executed, and let it track the remaining
// critical images. No-ops when the splash was skipped for this session.
startSplashHandoff();

// Dynamically generate a high-quality app icon/favicon with a rounded themed background.
const setupDynamicFavicon = () => {
  if (typeof window === 'undefined') return;
  const img = new Image();
  img.src = aiLogo;
  img.crossOrigin = 'anonymous';

  const draw = () => {
    try {
      const size = 128;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background follows the theme's inverse surface token rather than a
      // hardcoded navy, so the tab icon tracks light/dark like the rest of the UI.
      ctx.fillStyle =
        getComputedStyle(document.documentElement)
          .getPropertyValue('--ui-surface-inverse')
          .trim() || '#16191D';
      const radius = size * 0.25;
      
      if (typeof ctx.roundRect === 'function') {
        ctx.beginPath();
        ctx.roundRect(0, 0, size, size, radius);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(radius, 0);
        ctx.lineTo(size - radius, 0);
        ctx.quadraticCurveTo(size, 0, size, radius);
        ctx.lineTo(size, size - radius);
        ctx.quadraticCurveTo(size, size, size - radius, size);
        ctx.lineTo(radius, size);
        ctx.quadraticCurveTo(0, size, 0, size - radius);
        ctx.lineTo(0, radius);
        ctx.quadraticCurveTo(0, 0, radius, 0);
        ctx.closePath();
        ctx.fill();
      }

      // Draw the logo centered-resized (simulating the nav menu style)
      const iconSize = size * 0.61;
      const offset = (size - iconSize) / 2;
      ctx.drawImage(img, offset, offset, iconSize, iconSize);

      // Create or update link tag
      let link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.type = 'image/png';
      link.href = canvas.toDataURL('image/png');
    } catch (e) {
      console.warn('Failed to construct themed favicon', e);
    }
  };

  img.onload = () => {
    draw();
    // Redraw when the theme flips so the tab icon keeps matching the page.
    subscribe(draw);
  };
};

setupDynamicFavicon();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
