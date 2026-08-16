import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  SlidersHorizontal, 
  Sparkles, 
  Code2, 
  Users, 
  Rocket, 
  ExternalLink, 
  ArrowRight, 
  Check, 
  Plus, 
  Briefcase, 
  ArrowUpRight, 
  HelpCircle,
  FileCode,
  Github,
  Globe,
  Database,
  Cpu,
  X
} from 'lucide-react';
import { PROJECTS, MEETING_LOCATION, MEETING_DAY, MEETING_TIME, CLUB_EMAIL, PROJECT_APPLICATION_URL } from '../data';
import { ProjectItem } from '../types';
import { TextScramble } from '../components/TextScramble';
import { Reveal } from '../components/Reveal';
import { useRevealProps, useRevealSequenceProps, sequenceDelay, staggerDelay } from '../hooks/useReveal';

export const Projects: React.FC = () => {
  // Sequenced, not all-at-once: the hero's eyebrow, heading, copy and buttons
  // each get their own slot. See `useRevealSequenceProps`.
  const heroReveal = useRevealSequenceProps();
  const heroStatsReveal = useRevealProps(120);
  // In-place props: the sidebar and the results column are `lg:col-span-*`
  // children of the section grid and must stay direct children of it.
  const sidebarReveal = useRevealProps();
  const resultsReveal = useRevealProps(100);

  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTag, setSelectedTag] = useState<string>('All');
  
  // Selected project for detailed modal (acting as the active expanded card now)
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [animState, setAnimState] = useState<'idle' | 'starting' | 'active' | 'closing'>('idle');
  const [initialRect, setInitialRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const cardsRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Escape key to close flipped card & handle body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    if (animState !== 'idle') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [animState]);

  const handleCardClick = (proj: ProjectItem, id: string) => {
    if (animState !== 'idle') return;

    const cardEl = cardsRef.current[id];
    if (cardEl) {
      const rect = cardEl.getBoundingClientRect();
      setInitialRect(rect);
      setSelectedProject(proj);
      setAnimState('starting');

      setTimeout(() => {
        setAnimState('active');
      }, 30);
    }
  };

  const handleClose = () => {
    if (animState !== 'active') return;

    setAnimState('closing');

    setTimeout(() => {
      setSelectedProject(null);
      setInitialRect(null);
      setAnimState('idle');
    }, 600);
  };

  // Extract unique categories and tags
  const categories = ['All', ...Array.from(new Set(PROJECTS.map(p => p.category)))];
  const allTags = ['All', ...Array.from(new Set(PROJECTS.flatMap(p => p.tags)))];

  // Filtering logic
  const filteredProjects = PROJECTS.filter(proj => {
    const matchesSearch = 
      proj.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      proj.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesCategory = selectedCategory === 'All' || proj.category === selectedCategory;
    const matchesTag = selectedTag === 'All' || proj.tags.includes(selectedTag);

    return matchesSearch && matchesCategory && matchesTag;
  });

  // Static mock roadmap milestones to enrich modal details
  const getProjectMilestones = (id: string) => {
    switch (id) {
      case 'buckeye-chatbot':
        return [
          { phase: 'Phase 1: PDF Scraper', status: 'Completed', details: 'Extracted and sanitized 2,500+ pages of OSU bulletins.' },
          { phase: 'Phase 2: Embedding Pipeline', status: 'Completed', details: 'Generated dense vector index using local BGE embeddings.' },
          { phase: 'Phase 3: RAG Fine-tuning', status: 'Active', details: 'Refining prompt templates with user feedback logs.' }
        ];
      case 'traffic-analysis':
        return [
          { phase: 'Phase 1: Video Collection', status: 'Completed', details: 'Captured & annotation of Lane Ave dashcam sequences.' },
          { phase: 'Phase 2: Model Deployment', status: 'Completed', details: 'Configured model parameters to operate live on NVIDIA Jetson.' },
          { phase: 'Phase 3: Interface Build', status: 'Active', details: 'Building dashboard map indicating average speed metrics.' }
        ];
      case 'rl-quadcopter':
        return [
          { phase: 'Phase 1: Env Gym Sim', status: 'Completed', details: 'Ported custom quadcopter parameters into Pybullet environments.' },
          { phase: 'Phase 2: PPO Algorithm Tuning', status: 'Completed', details: 'Optimized reward functions to prioritize horizontal stability.' },
          { phase: 'Phase 3: Real Hardware Build', status: 'Active', details: 'Translating trained weights into flight-controller firmwares.' }
        ];
      default:
        return [
          { phase: 'Phase 1: Data Gathering', status: 'Completed', details: 'Wrangled datasets and set validation limits.' },
          { phase: 'Phase 2: Neural Training', status: 'Completed', details: 'Optimized loss functions on high-performance rigs.' },
          { phase: 'Phase 3: Interactive Demo', status: 'Active', details: 'Configuring web integrations for community testing.' }
        ];
    }
  };

  const renderExpandedProject = () => {
    if (!mounted || !selectedProject || !initialRect) return null;

    return createPortal(
      <>
        {/* Backdrop for flipped card focus */}
        <AnimatePresence mode="wait">
          {animState !== 'idle' && (
            <motion.div
              id="project-flip-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={handleClose}
              className="fixed inset-0 bg-overlay backdrop-blur-sm z-[100] cursor-pointer"
            />
          )}
        </AnimatePresence>

        {/* Floating Centered Expanded Card */}
        <div
          className="card-container is-active"
          id="project-card-container-expanded"
          style={{
            position: 'fixed',
            width: animState === 'active' ? 'max(350px, min(800px, 92vw))' : `${initialRect.width}px`,
            height: animState === 'active' ? 'min(780px, 92vh)' : `${initialRect.height}px`,
            top: animState === 'active' ? '50%' : `${initialRect.top}px`,
            left: animState === 'active' ? '50%' : `${initialRect.left}px`,
            transform: animState === 'active' ? 'translate(-50%, -50%)' : 'translate(0, 0)',
            transition: animState === 'starting' 
              ? 'none' 
              : 'width 600ms cubic-bezier(0.4, 0, 0.2, 1), height 600ms cubic-bezier(0.4, 0, 0.2, 1), top 600ms cubic-bezier(0.4, 0, 0.2, 1), left 600ms cubic-bezier(0.4, 0, 0.2, 1), transform 600ms cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 110,
            perspective: '1200px',
            cursor: 'default',
          }}
        >
          <div
            className="card-inner"
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              transition: 'transform 600ms cubic-bezier(0.4, 0, 0.2, 1)',
              transformStyle: 'preserve-3d',
              transform: animState === 'active' ? 'rotateY(180deg)' : 'rotateY(0deg)',
            }}
          >
            {/* FRONT FACE */}
            <div
              className="card-front"
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                top: 0,
                left: 0,
                overflow: 'hidden',
              }}
            >
              <div className="w-full h-full rounded-2xl bg-bg-elevated border border-border-subtle shadow-card flex flex-col justify-between overflow-hidden">
                <div>
                  {/* Thumbnail banner */}
                  <div className="h-[200px] w-full relative overflow-hidden bg-bg-primary border-b border-border-subtle">
                    <img
                      referrerPolicy="no-referrer"
                      src={selectedProject.image}
                      alt={selectedProject.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-inverse-deep/60 via-transparent to-transparent pointer-events-none" />
                    
                    {/* Interactive ping metrics badge */}
                    <div className="absolute top-4 left-4 font-mono text-[10px] font-bold text-on-accent px-2.5 py-1 rounded-full bg-accent-secondary flex items-center space-x-1 shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-on-accent animate-ping mr-0.5" />
                      <span>{selectedProject.stats}</span>
                    </div>
                    
                    <div className="absolute bottom-4 left-4">
                      <span className="px-2.5 py-1 bg-overlay backdrop-blur-md rounded text-[10px] font-black uppercase text-accent-secondary tracking-widest leading-none">
                        {selectedProject.category}
                      </span>
                    </div>
                  </div>

                  {/* Content panel */}
                  <div className="p-6 text-left">
                    <h4 className="font-display text-lg font-extrabold text-text-primary tracking-tight leading-snug">
                      {selectedProject.title}
                    </h4>
                    <p className="font-sans text-[13px] text-text-secondary leading-relaxed mt-2.5 line-clamp-3">
                      {selectedProject.description}
                    </p>
                  </div>
                </div>

                {/* Card bottom tags */}
                <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-border-subtle/50 bg-bg-secondary/20">
                  <div className="flex flex-wrap gap-1.5 max-w-[75%] overflow-hidden">
                    {selectedProject.tags.slice(0, 3).map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-bg-elevated border border-border-subtle rounded font-mono text-[9px] font-semibold text-text-muted">
                        {t}
                      </span>
                    ))}
                  </div>
                  <span className="font-semibold text-xs text-accent-primary flex items-center space-x-1 transition-transform">
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>

            {/* BACK FACE */}
            <div
              className="card-back"
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
                top: 0,
                left: 0,
                overflow: 'hidden',
              }}
            >
              <div className="w-full h-full p-6 md:p-8 flex flex-col justify-between bg-bg-elevated rounded-2xl border border-border-subtle shadow-[0_20px_50px_var(--ui-shadow-color)] relative overflow-hidden text-left">
                {/* Close Button top-right */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                  }}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-bg-primary border border-border-subtle flex items-center justify-center text-text-secondary hover:text-status-danger hover:border-status-danger cursor-pointer transition-all active:scale-95 z-20"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Scrollable inner content to prevent overflowing smaller screens */}
                <div className="flex-grow overflow-y-auto pr-2 pb-4 scrollbar-thin space-y-6">
                  {/* Title Bar */}
                  <div className="mr-8">
                    <span className="font-mono text-[10px] font-bold text-accent-secondary uppercase tracking-[0.15em] block mb-1">
                      System Architecture Deep-Dive
                    </span>
                    <h3 className="font-display text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
                      {selectedProject.title}
                    </h3>
                  </div>

                  {/* Header row with basic details */}
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="w-full md:w-1/3 aspect-[4/3] rounded-xl overflow-hidden bg-bg-secondary border border-border-subtle shrink-0">
                      <img
                        referrerPolicy="no-referrer"
                        src={selectedProject.image}
                        alt={selectedProject.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="px-2.5 py-0.5 bg-accent-primary-dim text-accent-primary rounded-full text-[10px] font-bold uppercase tracking-wider">
                          {selectedProject.category}
                        </span>
                        <span className="font-mono text-[10px] font-bold text-accent-secondary bg-badge-accent px-2.5 py-0.5 rounded-full uppercase">
                          Metric: {selectedProject.stats}
                        </span>
                      </div>
                      <p className="font-sans text-[13.5px] leading-[1.6] text-text-secondary">
                        {selectedProject.description}
                      </p>
                      <div>
                        <a
                          href={selectedProject.applyUrl || PROJECT_APPLICATION_URL}
                          target="_blank"
                          rel="noreferrer"
                          className="font-sans text-xs font-bold text-accent-primary hover:underline hover:text-accent-primary-hover inline-flex items-center space-x-1"
                        >
                          <span>Apply for this team</span>
                          <span className="font-mono">→</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Technical Stack */}
                  <div className="border border-border-subtle/50 rounded-xl p-4 bg-bg-secondary/40">
                    <h5 className="font-display font-bold text-[10px] uppercase tracking-wider text-text-primary mb-2.5">
                      Targeted Technical Stack
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedProject.tags.map((tag, idx) => (
                        <span 
                          key={idx} 
                          className="px-2.5 py-1 bg-bg-elevated border border-border-subtle rounded-md font-mono text-[10.5px] font-semibold text-text-primary flex items-center space-x-1.5 shadow-sm"
                        >
                          <Cpu className="w-3 h-3 text-accent-primary" />
                          <span>{tag}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Flowchart Sequence */}
                  <div className="space-y-2.5">
                    <h5 className="font-display font-medium text-[10px] uppercase tracking-wider text-text-primary">
                      System Dataflow Sequence
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {/* Step 1 */}
                      <div className="p-3 bg-bg-secondary/40 border border-border-subtle rounded-lg flex flex-col justify-between items-start space-y-1 relative">
                        <span className="absolute top-1.5 right-1.5 text-[8.5px] font-mono text-text-muted font-bold">01</span>
                        <span className="text-[8px] font-black uppercase text-accent-secondary tracking-widest leading-none">Ingestion</span>
                        <span className="font-display font-bold text-[11px] text-text-primary leading-tight">Sensor / Scrapes</span>
                        <p className="font-sans text-[10px] text-text-secondary leading-tight mt-0.5">Wrangling unstructured real-time inputs.</p>
                      </div>

                      {/* Step 2 */}
                      <div className="p-3 bg-bg-secondary/40 border border-border-subtle rounded-lg flex flex-col justify-between items-start space-y-1 relative">
                        <span className="absolute top-1.5 right-1.5 text-[8.5px] font-mono text-text-muted font-bold">02</span>
                        <span className="text-[8px] font-black uppercase text-status-warning tracking-widest leading-none">Embeddings</span>
                        <span className="font-display font-bold text-[11px] text-text-primary leading-tight">VectorDB Ingest</span>
                        <p className="font-sans text-[10px] text-text-secondary leading-tight mt-0.5">Transforming inputs into dense vectors.</p>
                      </div>

                      {/* Step 3 */}
                      <div className="p-3 bg-bg-secondary/40 border border-border-subtle rounded-lg flex flex-col justify-between items-start space-y-1 relative">
                        <span className="absolute top-1.5 right-1.5 text-[8.5px] font-mono text-text-muted font-bold">03</span>
                        <span className="text-[8px] font-black uppercase text-status-success tracking-widest leading-none">Model Layer</span>
                        <span className="font-display font-bold text-[11px] text-text-primary leading-tight">Core Inference</span>
                        <p className="font-sans text-[10px] text-text-secondary leading-tight mt-0.5">Pulsing model computations live.</p>
                      </div>

                      {/* Step 4 */}
                      <div className="p-3 bg-bg-secondary/40 border border-border-subtle rounded-lg flex flex-col justify-between items-start space-y-1 relative">
                        <span className="absolute top-1.5 right-1.5 text-[8.5px] font-mono text-text-muted font-bold">04</span>
                        <span className="text-[8px] font-black uppercase text-accent-tertiary tracking-widest leading-none">Client UI</span>
                        <span className="font-display font-bold text-[11px] text-text-primary leading-tight">Dashboards</span>
                        <p className="font-sans text-[10px] text-text-secondary leading-tight mt-0.5">Connecting endpoints for student apps.</p>
                      </div>
                    </div>
                  </div>

                  {/* Milestones */}
                  <div className="space-y-3">
                    <h5 className="font-display font-medium text-[10px] uppercase tracking-wider text-text-primary">
                      Current Execution Milestones
                    </h5>
                    <div className="space-y-2.5">
                      {getProjectMilestones(selectedProject.id).map((m, idx) => (
                        <div key={idx} className="flex items-start space-x-2.5 text-xs">
                          <div className={`mt-0.5 w-4 h-4 rounded-full shrink-0 flex items-center justify-center font-bold text-[8px] ${
                            m.status === 'Completed' 
                              ? 'bg-status-success/15 text-status-success border border-status-success/20' 
                              : 'bg-accent-primary/15 text-accent-primary border border-accent-primary/20 animate-pulse'
                          }`}>
                            {m.status === 'Completed' ? '✓' : '•'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-text-primary">{m.phase}</span>
                              <span className={`text-[8.5px] uppercase font-black tracking-widest ${
                                m.status === 'Completed' ? 'text-status-success' : 'text-accent-primary'
                              }`}>{m.status}</span>
                            </div>
                            <p className="text-text-secondary text-[11px] mt-0.5 leading-snug">{m.details}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="border-t border-border-subtle/50 pt-4 flex flex-wrap items-center justify-between gap-3 bg-bg-elevated mt-2">
                  <span className="font-mono text-[10px] text-text-muted">
                    Reach out to the officer team: {CLUB_EMAIL}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => alert(`This sandbox repository represents the secure, open-source model parameters representing the compiled weights of "${selectedProject.title}".`)}
                      className="h-9 px-3.5 rounded-lg border border-border-subtle hover:border-text-primary font-sans text-xs font-semibold flex items-center space-x-2 transition-colors cursor-pointer bg-bg-primary"
                    >
                      <Github className="w-3.5 h-3.5 text-text-nav" />
                      <span>Sandbox Code</span>
                    </button>
                    <a
                      href={selectedProject.applyUrl || PROJECT_APPLICATION_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="h-9 px-3.5 rounded-lg bg-accent-primary hover:bg-accent-primary-hover text-on-accent font-sans text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer shadow-sm inline-flex justify-center items-center"
                    >
                      <span>Apply for this Team</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>,
      document.body
    );
  };

  return (
    <div id="projects-page-root" className="pt-[72px] min-h-screen select-none">
      
      {/* 1. HERO HEADER INTRO */}
      <section id="projects-hero-banner" className="py-20 md:py-24 bg-[linear-gradient(to_bottom,var(--ui-veil-band),rgba(0,0,0,0))] border-b border-border-subtle relative overflow-hidden">
        {/* Decorative elements representing AI connections */}
        <div className="absolute top-[20%] right-[10%] w-72 h-72 bg-accent-primary/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 md:px-16 relative z-10 flex flex-col items-center">
          <div className="max-w-3xl text-center" {...heroReveal}>
            <span className="font-sans text-[12px] font-bold text-accent-secondary uppercase tracking-[0.2em] block mb-3">
              Student-Led Innovation
            </span>
            <h1 className="font-display text-[38px] md:text-[54px] font-extrabold text-text-primary tracking-tight leading-[1.1]">
              <TextScramble id="projects-title-scramble" text="The Projects Incubator" delay={sequenceDelay(1)} />
            </h1>
            <p className="font-sans text-[16px] md:text-[18px] text-text-secondary leading-relaxed mt-4 max-w-2xl mx-auto">
              Each semester, our members form multidisciplinary sprint teams to construct open-source AI software. From state-of-the-art computer vision tools to autonomous reinforcement learning models, we build real products.
            </p>
          </div>

          {/* Quick Stats Counter strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-14 pt-8 border-t border-border-subtle/70" {...heroStatsReveal}>
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-accent-primary-dim text-accent-primary flex items-center justify-center font-bold">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-mono text-2xl font-black text-text-primary">4 Active</span>
                <span className="text-[11px] uppercase font-bold text-text-muted tracking-wider block">Core Pipelines</span>
              </div>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-accent-secondary/10 text-accent-secondary flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-mono text-2xl font-black text-text-primary">28 Total</span>
                <span className="text-[11px] uppercase font-bold text-text-muted tracking-wider block">Sprint Programmers</span>
              </div>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-status-success/10 text-status-success flex items-center justify-center font-bold">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-mono text-2xl font-black text-text-primary">100k+</span>
                <span className="text-[11px] uppercase font-bold text-text-muted tracking-wider block">Training Tokens</span>
              </div>
            </div>

            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-accent-tertiary/10 text-accent-tertiary flex items-center justify-center font-bold">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-mono text-2xl font-black text-text-primary">100%</span>
                <span className="text-[11px] uppercase font-bold text-text-muted tracking-wider block">Open-Source Code</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DYNAMIC WORKSPACE EXPLORER */}
      <section id="projects-browser-hub" className="py-24 max-w-7xl mx-auto px-6 md:px-16 grid grid-cols-1 lg:grid-cols-4 gap-10 items-start">
        
        {/* Left Column Filters (1 Col) */}
        <div id="filter-controls-sidebar" className="lg:col-span-1 border border-border-subtle rounded-2xl p-6 bg-bg-elevated/40 backdrop-blur-sm sticky top-24 self-start space-y-6" {...sidebarReveal}>
          <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
            <h3 className="font-display font-black text-[15px] text-text-primary uppercase tracking-wide flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-accent-primary" />
              <span>Refine View</span>
            </h3>
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedTag('All');
              }}
              className="text-[11px] font-bold text-accent-primary hover:underline cursor-pointer"
            >
              Reset All
            </button>
          </div>

          {/* Search bar */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-2">Keyword Search</label>
            <div className="relative">
              <input
                id="sidebar-projects-search"
                type="text"
                placeholder="Search ML tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-4 bg-bg-primary border border-border-medium rounded-xl text-[13px] text-text-primary placeholder-text-muted focus:border-accent-primary focus:outline-none transition-all"
              />
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-3" />
            </div>
          </div>

          {/* Categories select list */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-2.5">Domain Category</label>
            <div className="space-y-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  id={`cat-filter-btn-${cat}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-lg font-sans text-xs font-semibold cursor-pointer transition-all flex items-center justify-between ${
                    selectedCategory === cat
                      ? 'bg-accent-primary/10 text-accent-primary'
                      : 'text-text-secondary hover:bg-bg-primary'
                  }`}
                >
                  <span>{cat}</span>
                  {selectedCategory === cat && <span className="w-1.5 h-1.5 rounded-full bg-accent-primary" />}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Tags pills */}
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-2.5">Core Technology</label>
            <div className="flex flex-wrap gap-1.5">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  id={`tag-filter-btn-${tag}`}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-2.5 py-1.5 rounded-md font-mono text-[10px] font-bold cursor-pointer transition-all border ${
                    selectedTag === tag
                      ? 'bg-accent-primary text-on-accent border-accent-primary'
                      : 'bg-bg-primary text-text-secondary border-border-subtle hover:border-text-muted'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Notice */}
          <div className="p-4 rounded-xl bg-status-warning/5 border border-status-warning/10 text-[11px] text-text-muted leading-relaxed">
            <span className="font-bold text-status-warning uppercase block mb-1">Weekly Standups</span>
            Our project teams assemble weekly in {MEETING_LOCATION} on {MEETING_DAY} at {MEETING_TIME}. Attendees receive hardware credits and technical coaching.
          </div>
        </div>

        {/* Right Column Project Cards Grid (3 Cols) */}
        <div id="projects-presentation-grid" className="lg:col-span-3 space-y-8" {...resultsReveal}>
          
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-bold text-text-muted">
              Displaying <strong className="text-text-primary">{filteredProjects.length}</strong> of {PROJECTS.length} products
            </span>
          </div>

          {filteredProjects.length === 0 ? (
            <div className="py-20 border border-dashed border-border-medium rounded-3xl text-center bg-bg-secondary/40">
              <span className="font-display font-black text-lg text-text-primary block">No matching pipeline found</span>
              <p className="font-sans text-xs text-text-muted mt-2 max-w-sm mx-auto">
                Try clearing active filters or resetting your parameters to explore core semester projects.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedTag('All');
                }}
                className="mt-5 h-9 px-4 rounded-full bg-accent-primary text-on-accent font-sans text-xs font-semibold cursor-pointer shadow-sm hover:bg-accent-primary-hover"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProjects.map((proj, idx) => {
                return (
                  // Reveal stays mounted across the placeholder swap below, so
                  // closing the modal does not replay the card's reveal.
                  <Reveal key={proj.id} delay={staggerDelay(idx)}>
                  {selectedProject && selectedProject.id === proj.id ? (
                    <div className="h-[420px]" style={{ visibility: 'hidden' }} />
                  ) : (
                  <div
                    ref={(el) => {
                      cardsRef.current[proj.id] = el as HTMLDivElement;
                    }}
                    id={`project-card-view-${proj.id}`}
                    onClick={() => handleCardClick(proj, proj.id)}
                    className="group bg-bg-elevated rounded-2xl overflow-hidden border border-border-subtle hover:border-accent-primary/20 transition-all duration-350 hover:-translate-y-1.5 hover:shadow-md flex flex-col justify-between h-[420px] cursor-pointer"
                  >
                    <div>
                      {/* Thumbnail banner */}
                      <div className="h-[200px] w-full relative overflow-hidden bg-bg-primary border-b border-border-subtle">
                        <img
                          referrerPolicy="no-referrer"
                          src={proj.image}
                          alt={proj.title}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-surface-inverse-deep/60 via-transparent to-transparent pointer-events-none" />
                        
                        {/* Interactive ping metrics badge */}
                        <div className="absolute top-4 left-4 font-mono text-[10px] font-bold text-on-accent px-2.5 py-1 rounded-full bg-accent-secondary flex items-center space-x-1 shadow-md">
                          <span className="w-1.5 h-1.5 rounded-full bg-on-accent animate-ping mr-0.5" />
                          <span>{proj.stats}</span>
                        </div>
                        
                        <div className="absolute bottom-4 left-4">
                          <span className="px-2.5 py-1 bg-overlay backdrop-blur-md rounded text-[10px] font-black uppercase text-accent-secondary tracking-widest leading-none">
                            {proj.category}
                          </span>
                        </div>
                      </div>

                      {/* Content panel */}
                      <div className="p-6">
                        <h4 className="font-display text-lg font-extrabold text-text-primary tracking-tight leading-snug group-hover:text-accent-primary transition-colors">
                          {proj.title}
                        </h4>
                        <p className="font-sans text-[13px] text-text-secondary leading-relaxed mt-2.5 line-clamp-3">
                          {proj.description}
                        </p>
                      </div>
                    </div>

                    {/* Card bottom tags */}
                    <div className="px-6 pb-6 pt-2 flex items-center justify-between border-t border-border-subtle/50 bg-bg-secondary/20">
                      <div className="flex flex-wrap gap-1.5 max-w-[75%] overflow-hidden">
                        {proj.tags.slice(0, 3).map((t, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-bg-elevated border border-border-subtle rounded font-mono text-[9px] font-semibold text-text-muted">
                            {t}
                          </span>
                        ))}
                      </div>
                      <span className="font-semibold text-xs text-accent-primary flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                        <span>Inspect</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                  )}
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* "Join or Form an ML Team" section is removed as requested */}

      {renderExpandedProject()}

    </div>
  );
};
