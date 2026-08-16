import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Events } from './pages/Events';
import { HackAI } from './pages/HackAI';
import { Projects } from './pages/Projects';
import { GetInvolved } from './pages/GetInvolved';
import { SmoothScrollProvider } from './components/SmoothScrollProvider';
import { PageTransition } from './components/PageTransition';
import { BackgroundMesh } from './components/BackgroundMesh';

export default function App() {
  const [activePage, setActivePage] = useState<string>('home');

  const renderActivePage = (page: string) => {
    switch (page) {
      case 'home':
        return <Home onNavigate={setActivePage} />;
      case 'about':
        return <About onNavigate={setActivePage} />;
      case 'events':
        return <Events />;
      case 'hackai':
        return <HackAI />;
      case 'projects':
        return <Projects />;
      case 'getinvolved':
        return <GetInvolved onNavigate={setActivePage} />;
      default:
        return <Home onNavigate={setActivePage} />;
    }
  };

  return (
    <div id="application-container-viewport" className="min-h-screen flex flex-col justify-between">
      {/* Site-wide ambient gradient. Must stay a sibling of SmoothScrollProvider
          rather than living inside it — see BackgroundMesh.tsx. It is `fixed`, so
          it is out of flow and does not become a flex item here. */}
      <BackgroundMesh />

      {/* Navigation header pinned to the top of all pages */}
      <Navbar activePage={activePage} onNavigate={setActivePage} />

      <SmoothScrollProvider>
        {/* Dynamic Client Page Layout with Directional Transition.
            The footer is passed in rather than rendered as a sibling so it
            animates together with the page instead of sitting frozen on screen
            while the scroll position resets. */}
        <PageTransition
          activePage={activePage}
          renderPage={renderActivePage}
          footer={<Footer activePage={activePage} onNavigate={setActivePage} />}
        />
      </SmoothScrollProvider>
    </div>
  );
}


