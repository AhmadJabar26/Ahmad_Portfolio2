/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Menu, 
  X, 
  GraduationCap, 
  Brush, 
  Database, 
  Code, 
  ArrowRight, 
  Mail, 
  Link as LinkIcon,
  ChevronDown,
  Lock,
  Github,
  Twitter,
  Sparkles,
  ExternalLink
} from "lucide-react";
import { INITIAL_PORTFOLIO_DATA, PortfolioData } from "./types";
import AdminPanel from "./components/AdminPanel";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "./lib/firebase";
import { NeonGlowCard } from "./components/NeonGlowCard";
import { ScrollReveal } from "./components/ScrollReveal";
import { TextReveal } from "./components/TextReveal";

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Hero section 3-second recurring animation state trigger
  const [heroPulse, setHeroPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroPulse(true);
      setTimeout(() => {
        setHeroPulse(false);
      }, 1200);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Track liked projects locally
  const [likedProjects, setLikedProjects] = useState<string[]>(() => {
    const saved = localStorage.getItem("liked_projects");
    return saved ? JSON.parse(saved) : [];
  });

  const handleLikeProject = (id: string) => {
    setLikedProjects(prev => {
      const next = prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id];
      localStorage.setItem("liked_projects", JSON.stringify(next));
      return next;
    });
  };

  const handleOpenResume = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!portfolioData.resumeUrl) {
      alert("No resume document has been uploaded yet. Please use the Admin Panel to upload a PDF.");
      return;
    }
    
    if (portfolioData.resumeUrl.startsWith("data:application/pdf;base64,")) {
      try {
        const parts = portfolioData.resumeUrl.split(";base64,");
        const contentType = parts[0].split(":")[1] || "application/pdf";
        const base64Data = parts[1];
        
        const byteCharacters = window.atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: contentType });
        
        const blobUrl = URL.createObjectURL(blob);
        const newTab = window.open(blobUrl, "_blank");
        if (!newTab) {
          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = "resume.pdf";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (err) {
        console.error("Error building or launching PDF Blob URL:", err);
        alert("Failed to render PDF document. Try re-uploading the file in the Admin Panel.");
      }
    } else {
      window.open(portfolioData.resumeUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Load custom portfolio data state
  const [portfolioData, setPortfolioData] = useState<PortfolioData>(() => {
    const saved = localStorage.getItem("custom_portfolio_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_PORTFOLIO_DATA,
          ...parsed,
          skills: {
            ...INITIAL_PORTFOLIO_DATA.skills,
            ...parsed.skills
          }
        };
      } catch (e) {
        console.error("Failed to parse saved portfolio data", e);
      }
    }
    return INITIAL_PORTFOLIO_DATA;
  });

  // Listen to real-time database updates from Firebase Firestore
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "portfolio_config", "default"), (docSnap) => {
      if (docSnap.exists()) {
        const remoteData = docSnap.data() as PortfolioData;
        setPortfolioData({
          ...INITIAL_PORTFOLIO_DATA,
          ...remoteData,
          skills: {
            ...INITIAL_PORTFOLIO_DATA.skills,
            ...(remoteData.skills || {})
          }
        });
        localStorage.setItem("custom_portfolio_data", JSON.stringify(remoteData));
      } else {
        setDoc(doc(db, "portfolio_config", "default"), INITIAL_PORTFOLIO_DATA)
          .catch(err => console.error("Error initializing Firestore document:", err));
      }
    }, (error) => {
      console.error("Firestore subscription error:", error);
    });

    return () => unsub();
  }, []);

  // Compress base64 images as a safeguard
  const compressBase64Image = (base64Str: string, maxDim: number = 800, quality: number = 0.55): Promise<string> => {
    return new Promise((resolve) => {
      if (!base64Str || !base64Str.startsWith("data:image/")) {
        resolve(base64Str);
        return;
      }
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", quality);
          if (compressed.length < base64Str.length) {
            resolve(compressed);
          } else {
            resolve(base64Str);
          }
        } else {
          resolve(base64Str);
        }
      };
      img.onerror = () => {
        resolve(base64Str);
      };
    });
  };

  const handleSavePortfolioData = async (newData: PortfolioData): Promise<boolean> => {
    try {
      const dataToSave = JSON.parse(JSON.stringify(newData)) as PortfolioData;
      let currentSize = JSON.stringify(dataToSave).length;

      if (currentSize > 500 * 1024) {
        if (dataToSave.hero.profileImageUrl) {
          dataToSave.hero.profileImageUrl = await compressBase64Image(dataToSave.hero.profileImageUrl, 800, 0.55);
        }
        if (dataToSave.skills.frontendBgUrl) {
          dataToSave.skills.frontendBgUrl = await compressBase64Image(dataToSave.skills.frontendBgUrl, 800, 0.55);
        }
        if (dataToSave.skills.backendBgUrl) {
          dataToSave.skills.backendBgUrl = await compressBase64Image(dataToSave.skills.backendBgUrl, 800, 0.55);
        }
        if (dataToSave.skills.otherBgUrl) {
          dataToSave.skills.otherBgUrl = await compressBase64Image(dataToSave.skills.otherBgUrl, 800, 0.55);
        }
        if (dataToSave.projects && dataToSave.projects.length > 0) {
          for (let i = 0; i < dataToSave.projects.length; i++) {
            if (dataToSave.projects[i].imageUrl) {
              dataToSave.projects[i].imageUrl = await compressBase64Image(dataToSave.projects[i].imageUrl, 800, 0.55);
            }
          }
        }
      }

      await setDoc(doc(db, "portfolio_config", "default"), dataToSave);
      setPortfolioData(dataToSave);
      localStorage.setItem("custom_portfolio_data", JSON.stringify(dataToSave));
      return true;
    } catch (e: any) {
      console.error("Failed to save portfolio to Firestore:", e);
      alert("Failed to save changes: " + (e?.message || e));
      return false;
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["about", "skills", "experience", "projects", "contact"];
      const scrollPosition = window.scrollY + 160;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            return;
          }
        }
      }
      if (window.scrollY < 100) {
        setActiveSection("");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({
        top: el.offsetTop - 80,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-slate-300 font-sans antialiased selection:bg-purple-500/30 selection:text-purple-200 relative overflow-x-hidden bg-grid-pattern">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-[600px] h-[600px] bg-purple-600/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-[35%] right-0 translate-x-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-20 left-0 -translate-x-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/10 transition-all duration-300">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-8 flex justify-between items-center h-20">
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="font-headline text-2xl font-bold tracking-tighter text-white hover:text-purple-400 transition-colors uppercase flex items-center gap-2"
            id="nav-logo"
          >
            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            <span>{portfolioData.hero.firstName}<span className="text-purple-400">.</span></span>
          </button>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {["About", "Skills", "Experience", "Projects", "Contact"].map((item) => {
              const id = item.toLowerCase();
              const isActive = activeSection === id;
              return (
                <button
                  key={item}
                  onClick={() => scrollToSection(id)}
                  className={`font-label text-[11px] font-bold uppercase tracking-[0.2em] transition-all relative py-1 ${
                    isActive 
                      ? "text-purple-400" 
                      : "text-slate-400 hover:text-white"
                  }`}
                  id={`nav-link-${id}`}
                >
                  {item}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                  )}
                </button>
              );
            })}
            <button
              onClick={handleOpenResume}
              className="px-6 py-2.5 border border-purple-500/30 rounded-full text-[11px] font-bold uppercase tracking-wider hover:bg-purple-600 hover:text-white transition-all bg-purple-500/10 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)] cursor-pointer"
              id="desktop-resume-btn"
            >
              Resume
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-white p-2 hover:bg-white/5 rounded-full transition-colors"
            id="mobile-menu-toggle"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      <div
        className={`fixed inset-y-0 right-0 w-72 z-40 bg-zinc-950/95 border-l border-white/10 shadow-2xl md:hidden transform transition-transform duration-300 ease-in-out backdrop-blur-xl ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        id="mobile-drawer"
      >
        <div className="flex flex-col h-full pt-28 px-8 pb-8 justify-between">
          <div className="flex flex-col gap-6">
            {["About", "Skills", "Experience", "Projects", "Contact"].map((item) => {
              const id = item.toLowerCase();
              const isActive = activeSection === id;
              return (
                <button
                  key={item}
                  onClick={() => scrollToSection(id)}
                  className={`text-left font-label text-sm uppercase tracking-[0.15em] font-bold transition-all ${
                    isActive 
                      ? "text-purple-400 pl-3 border-l-2 border-purple-500" 
                      : "text-slate-400 hover:text-white hover:pl-2"
                  }`}
                  id={`mobile-nav-link-${id}`}
                >
                  {item}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleOpenResume}
            className="border border-purple-500/40 text-purple-300 bg-purple-500/10 hover:bg-purple-600 hover:text-white w-full py-3.5 rounded-full font-label text-xs uppercase tracking-widest font-bold transition-all text-center cursor-pointer shadow-[0_0_20px_rgba(168,85,247,0.3)]"
            id="mobile-resume-btn"
          >
            Download CV
          </button>
        </div>
      </div>

      {/* HERO SECTION */}
      <header className="relative min-h-screen pt-28 pb-16 px-6 sm:px-8 max-w-[1280px] mx-auto flex flex-col justify-center items-center bg-transparent overflow-hidden">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center z-10">
          
          {/* Left Side: Ahmad Jabar Section (Sticky/Aligned Left) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
            {/* Status Indicator Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-zinc-900/90 border border-purple-500/30 text-purple-300 text-xs font-mono backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.2)]">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="font-semibold tracking-wide uppercase">Available for Hire & Projects</span>
            </div>

            {/* Main Name Heading with 3-Second Interval Animation Loop */}
            <div className="relative w-full">
              <div className={`transition-all duration-700 transform ${heroPulse ? "scale-[1.02] text-glow-purple" : ""}`}>
                <h1 className="font-bold font-mono text-[48px] sm:text-[72px] md:text-[88px] lg:text-[104px] leading-[0.88] tracking-tighter uppercase text-[#C3E41D]">
                  {portfolioData.hero.firstName}
                </h1>
                <h1 className={`font-bold font-mono text-[48px] sm:text-[72px] md:text-[88px] lg:text-[104px] leading-[0.88] tracking-tighter uppercase transition-colors duration-500 ${
                  heroPulse ? "text-purple-300" : "text-white"
                }`}>
                  {portfolioData.hero.lastName}
                </h1>
              </div>

              {/* Dynamic 3-second sweep accent line */}
              <div className={`mt-4 h-1.5 rounded-full bg-gradient-to-r from-[#C3E41D] via-purple-500 to-indigo-500 transition-all duration-700 ${
                heroPulse ? "w-full shadow-[0_0_25px_rgba(168,85,247,0.9)] opacity-100" : "w-32 opacity-50"
              }`} />
            </div>

            {/* Tagline */}
            <TextReveal 
              text={portfolioData.hero.tagline}
              className="font-sans text-base sm:text-lg md:text-xl text-slate-300 max-w-xl leading-relaxed"
              as="p"
              staggerDelay={0.02}
            />

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => scrollToSection("projects")}
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 text-white font-bold text-xs uppercase tracking-widest shadow-[0_0_25px_rgba(168,85,247,0.35)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] transition-all duration-300 cursor-pointer flex items-center gap-2 group"
              >
                Explore Works <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={handleOpenResume}
                className="px-8 py-3.5 rounded-full bg-zinc-900/80 border border-white/15 hover:border-purple-500/50 hover:bg-zinc-800 text-white font-bold text-xs uppercase tracking-widest transition-all duration-300 cursor-pointer"
              >
                Download CV
              </button>
            </div>

            {/* Social Icons row */}
            <div className="flex items-center gap-4 pt-2 text-slate-400">
              <a href={portfolioData.contact.github} target="_blank" rel="noreferrer" className="p-3 rounded-full bg-zinc-900 border border-white/10 hover:border-purple-500 hover:text-white hover:scale-110 transition-all shadow-md">
                <Github className="w-5 h-5" />
              </a>
              <a href={portfolioData.contact.linkedin} target="_blank" rel="noreferrer" className="p-3 rounded-full bg-zinc-900 border border-white/10 hover:border-purple-500 hover:text-white hover:scale-110 transition-all shadow-md">
                <LinkIcon className="w-5 h-5" />
              </a>
              <a href={`mailto:${portfolioData.contact.email}`} className="p-3 rounded-full bg-zinc-900 border border-white/10 hover:border-purple-500 hover:text-white hover:scale-110 transition-all shadow-md">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Right Side: Profile Image Section (Sticky/Aligned Right with Increased Length & Width) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end w-full">
            <div className="relative group w-full max-w-[340px] sm:max-w-[400px] md:max-w-[440px] lg:max-w-[460px]">
              {/* Neon Backlight Aura */}
              <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-lime-400 rounded-[2.8rem] blur-2xl opacity-60 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse-glow" />
              
              {/* Increased Height & Width Frame */}
              <div className="relative w-full aspect-[3/4] sm:h-[500px] md:h-[560px] lg:h-[620px] rounded-[2.5rem] overflow-hidden bg-zinc-950 border-2 border-purple-500/40 shadow-[0_20px_50px_rgba(0,0,0,0.9)] transition-transform duration-500 group-hover:scale-[1.02]">
                <img
                  src={portfolioData.hero.profileImageUrl}
                  alt={`${portfolioData.hero.firstName} ${portfolioData.hero.lastName}`}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800";
                  }}
                />

                {/* Bottom Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-80" />

                {/* Floating Badge 1 - Top Left */}
                <div className="absolute top-6 left-6 px-4 py-2 rounded-2xl bg-zinc-950/80 backdrop-blur-md border border-white/10 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <span>Full-Stack Architect</span>
                </div>

                {/* Floating Badge 2 - Bottom Right */}
                <div className="absolute bottom-6 right-6 px-4 py-2.5 rounded-2xl bg-zinc-950/80 backdrop-blur-md border border-purple-500/30 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-lg">
                  <span className="text-[#C3E41D] font-bold text-sm">10+</span>
                  <span>Production Projects</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Chevron */}
        <button
          type="button"
          onClick={() => scrollToSection("about")}
          className="mt-12 transition-colors duration-300 z-20 cursor-pointer flex flex-col items-center text-slate-500 hover:text-white"
          aria-label="Scroll down"
        >
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] mb-1">Scroll Down</span>
          <ChevronDown className="w-6 h-6 animate-bounce text-purple-400" />
        </button>
      </header>

      {/* ABOUT & EDUCATION SECTION */}
      <section className="py-24 md:py-[120px] max-w-[1280px] mx-auto px-6 sm:px-8 border-t border-white/5" id="about">
        <ScrollReveal direction="up" duration={0.7}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            {/* About Column */}
            <div className="md:col-span-7 space-y-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-purple-400 block">
                Background
              </span>
              <h2 className="font-headline text-3xl md:text-[40px] font-bold text-white tracking-tight" id="about-heading">
                About Me
              </h2>
              <div className="font-sans text-lg text-slate-300 space-y-6 leading-relaxed">
                {portfolioData.aboutParagraphs.map((para, idx) => (
                  <TextReveal 
                    key={idx} 
                    text={para} 
                    as="p" 
                    className="leading-relaxed text-slate-300" 
                    delay={idx * 0.1} 
                    staggerDelay={0.015} 
                  />
                ))}
              </div>
            </div>

            {/* Education Column with Neon Glow Card */}
            <div className="md:col-span-5 md:pl-6 space-y-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-purple-400 block">
                Qualifications
              </span>
              <h2 className="font-headline text-3xl md:text-[40px] font-bold text-white tracking-tight" id="education-heading">
                Education
              </h2>
              
              <NeonGlowCard className="p-8 md:p-10" id="education-card">
                <div className="flex items-start gap-5">
                  <div className="bg-purple-500/10 p-3.5 rounded-2xl text-purple-400 border border-purple-500/20">
                    <GraduationCap className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-label text-xs font-bold tracking-widest text-slate-400 uppercase mb-2">
                      {portfolioData.education.institution}
                    </h3>
                    <p className="font-headline text-xl font-semibold text-white mb-1.5">
                      {portfolioData.education.degree}
                    </p>
                    <p className="font-mono text-[13px] text-purple-400 font-medium">
                      {portfolioData.education.honors}
                    </p>
                  </div>
                </div>
              </NeonGlowCard>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* TECHNICAL ARSENAL SECTION (SKILLS) */}
      <section className="py-24 md:py-[120px] bg-zinc-950/40 border-y border-white/5" id="skills">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-8">
          <ScrollReveal direction="up" duration={0.6}>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-purple-400 mb-2 block">
              Capabilities
            </span>
            <h2 className="font-headline text-3xl md:text-[40px] font-bold text-white tracking-tight mb-12" id="skills-heading">
              Technical Arsenal
            </h2>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Frontend Card with Cursor Neon Spotlight */}
            <ScrollReveal direction="up" delay={0.1} duration={0.7}>
              <NeonGlowCard className="p-8 sm:p-10 min-h-[320px] flex flex-col justify-between group" id="skills-card-frontend">
                {portfolioData.skills.frontendBgUrl && (
                  <>
                    <img 
                      src={portfolioData.skills.frontendBgUrl} 
                      alt="Frontend background" 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 z-0 opacity-15"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent z-0" />
                  </>
                )}
                <div className="relative z-10 space-y-6">
                  <div className="text-purple-400 bg-purple-500/10 w-12 h-12 flex items-center justify-center rounded-2xl border border-purple-500/20">
                    <Brush className="w-6 h-6" />
                  </div>
                  <h3 className="font-headline text-2xl font-bold text-white">
                    Frontend
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {portfolioData.skills.frontend.map((skill) => (
                      <span
                        key={skill}
                        className="bg-white/5 text-slate-300 hover:bg-purple-500/20 hover:text-white px-3.5 py-1.5 rounded-full font-label text-xs font-semibold border border-white/10 transition-all"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </NeonGlowCard>
            </ScrollReveal>

            {/* Backend Card with Cursor Neon Spotlight */}
            <ScrollReveal direction="up" delay={0.2} duration={0.7}>
              <NeonGlowCard className="p-8 sm:p-10 min-h-[320px] flex flex-col justify-between group" id="skills-card-backend">
                {portfolioData.skills.backendBgUrl && (
                  <>
                    <img 
                      src={portfolioData.skills.backendBgUrl} 
                      alt="Backend background" 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 z-0 opacity-15"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent z-0" />
                  </>
                )}
                <div className="relative z-10 space-y-6">
                  <div className="text-purple-400 bg-purple-500/10 w-12 h-12 flex items-center justify-center rounded-2xl border border-purple-500/20">
                    <Database className="w-6 h-6" />
                  </div>
                  <h3 className="font-headline text-2xl font-bold text-white">
                    Backend
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {portfolioData.skills.backend.map((skill) => (
                      <span
                        key={skill}
                        className="bg-white/5 text-slate-300 hover:bg-purple-500/20 hover:text-white px-3.5 py-1.5 rounded-full font-label text-xs font-semibold border border-white/10 transition-all"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </NeonGlowCard>
            </ScrollReveal>

            {/* Other Card with Cursor Neon Spotlight */}
            <ScrollReveal direction="up" delay={0.3} duration={0.7}>
              <NeonGlowCard className="p-8 sm:p-10 min-h-[320px] flex flex-col justify-between group" id="skills-card-other">
                {portfolioData.skills.otherBgUrl && (
                  <>
                    <img 
                      src={portfolioData.skills.otherBgUrl} 
                      alt="Other background" 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 z-0 opacity-15"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent z-0" />
                  </>
                )}
                <div className="relative z-10 space-y-6">
                  <div className="text-purple-400 bg-purple-500/10 w-12 h-12 flex items-center justify-center rounded-2xl border border-purple-500/20">
                    <Code className="w-6 h-6" />
                  </div>
                  <h3 className="font-headline text-2xl font-bold text-white">
                    Languages & AI
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {portfolioData.skills.other.map((skill) => (
                      <span
                        key={skill}
                        className="bg-white/5 text-slate-300 hover:bg-purple-500/20 hover:text-white px-3.5 py-1.5 rounded-full font-label text-xs font-semibold border border-white/10 transition-all"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </NeonGlowCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* PROFESSIONAL EXPERIENCE SECTION */}
      <section className="py-24 md:py-[120px] max-w-[1280px] mx-auto px-6 sm:px-8" id="experience">
        <ScrollReveal direction="up" duration={0.6}>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-purple-400 mb-2 block">
            Timeline
          </span>
          <h2 className="font-headline text-3xl md:text-[40px] font-bold text-white tracking-tight mb-16" id="experience-heading">
            Professional Experience
          </h2>
        </ScrollReveal>

        <div className="relative border-l-2 border-purple-500/30 ml-4 md:ml-8 pl-6 md:pl-12 space-y-12">
          {portfolioData.experience.map((exp, idx) => (
            <ScrollReveal key={exp.id} direction="up" delay={idx * 0.15} duration={0.7}>
              <div className="relative" id={`experience-item-${idx + 1}`}>
                {/* Timeline Marker Ring */}
                <div className="absolute -left-[35px] md:-left-[59px] top-4 w-6 h-6 bg-zinc-950 border-4 border-purple-500 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.8)]" />
                
                <NeonGlowCard className="p-8 md:p-10">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
                    <div>
                      <h3 className="font-headline text-2xl font-bold text-white leading-snug">
                        {exp.role}
                      </h3>
                      <p className="font-label text-xs font-bold tracking-widest text-purple-400 uppercase mt-1.5">
                        {exp.company}
                      </p>
                    </div>
                    <span className="inline-block md:mt-1 self-start font-mono text-xs font-bold uppercase tracking-wider text-purple-300 bg-purple-950/50 px-4 py-1.5 rounded-full border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                      {exp.period}
                    </span>
                  </div>

                  <ul className="space-y-3.5">
                    {exp.bullets.map((bullet, bulletIdx) => (
                      <li key={bulletIdx} className="flex items-start font-sans text-base text-slate-300 leading-relaxed">
                        <span className="mt-2 mr-3.5 w-2 h-2 bg-purple-400 rounded-full flex-shrink-0 shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </NeonGlowCard>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* FEATURED PROJECTS SECTION WITH NEON PURPLE SPOTLIGHT CARDS */}
      <section className="py-24 md:py-[120px] bg-transparent border-t border-white/5" id="projects">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-8">
          <ScrollReveal direction="up" duration={0.6}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-purple-400 mb-2 block">
                  Selected Works
                </span>
                <h2 className="font-headline text-3xl md:text-[40px] font-bold text-white tracking-tight" id="projects-heading">
                  Featured Projects
                </h2>
              </div>
              <TextReveal 
                text="High-performance applications built with technical accuracy and responsive design."
                as="p"
                className="font-sans text-base text-slate-400 max-w-sm leading-relaxed"
                staggerDelay={0.02}
              />
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {portfolioData.projects.map((proj, idx) => (
              <ScrollReveal key={proj.id} direction="up" delay={idx * 0.15} duration={0.7}>
                <NeonGlowCard 
                  className="flex flex-col h-full group"
                  id={`project-card-${idx + 1}`}
                >
                  {/* Project Image Header */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-950">
                    <img
                      src={proj.imageUrl}
                      alt={proj.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = `https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=800`;
                      }}
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-70" />

                    {/* Like Button overlay */}
                    <button
                      aria-label={likedProjects.includes(proj.id) ? "Unlike project" : "Like project"}
                      onClick={() => handleLikeProject(proj.id)}
                      className="absolute top-4 right-4 z-20 rounded-full bg-black/60 p-3 backdrop-blur-md transition-all duration-200 hover:bg-black/90 border border-white/10 active:scale-90 cursor-pointer shadow-lg"
                    >
                      <svg
                        className={`h-4.5 w-4.5 transition-all duration-300 ${
                          likedProjects.includes(proj.id) ? "fill-red-500 text-red-500 scale-110" : "text-white"
                        }`}
                        fill={likedProjects.includes(proj.id) ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                      </svg>
                    </button>
                  </div>

                  {/* Card Content */}
                  <div className="p-8 flex flex-col justify-between flex-grow space-y-6">
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {proj.tech.map((t) => (
                          <span key={t} className="text-[10px] font-mono tracking-wider text-purple-300 bg-purple-500/10 border border-purple-500/20 py-1 px-3 rounded-full">
                            {t}
                          </span>
                        ))}
                      </div>
                      <h3 className="font-headline text-2xl font-bold tracking-tight text-white group-hover:text-purple-400 transition-colors">
                        {proj.title}
                      </h3>
                      <p className="font-sans text-sm text-slate-300 leading-relaxed">
                        {proj.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                      <a
                        href={proj.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-bold uppercase tracking-widest text-[11px] transition-colors"
                      >
                        View Project <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </NeonGlowCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section className="py-24 md:py-[120px] max-w-[1280px] mx-auto px-6 sm:px-8" id="contact">
        <ScrollReveal direction="up" duration={0.8}>
          <NeonGlowCard className="p-10 sm:p-16 md:p-20 relative overflow-hidden" id="contact-banner">
            <div className="relative z-10 max-w-2xl space-y-8">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-purple-400 block">
                Inquiries
              </span>
              <TextReveal 
                text="Let's build something technically sound."
                as="h2"
                className="font-headline text-4xl sm:text-5xl font-bold tracking-tight text-white"
                staggerDelay={0.03}
              />
              <TextReveal 
                text="I am currently open to new opportunities and collaborations. Reach out to discuss architectural designs, full-stack systems, or custom software projects."
                as="p"
                className="font-sans text-lg text-slate-300 leading-relaxed"
                delay={0.1}
                staggerDelay={0.015}
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-3xl pt-4">
                {/* Email Contact Link */}
                <a 
                  href={`mailto:${portfolioData.contact.email}`} 
                  className="flex items-center gap-4 bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 p-5 rounded-2xl transition-all duration-300 cursor-pointer shadow-md"
                  id="contact-email-link"
                >
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold tracking-widest text-purple-400 uppercase">
                      Email
                    </p>
                    <p className="font-headline text-sm font-semibold text-white break-all">
                      {portfolioData.contact.email}
                    </p>
                  </div>
                </a>

                {/* LinkedIn Contact Link */}
                {portfolioData.contact.linkedin && (
                  <a 
                    href={portfolioData.contact.linkedin} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 p-5 rounded-2xl transition-all duration-300 cursor-pointer shadow-md"
                    id="contact-linkedin-link"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                      <LinkIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-widest text-purple-400 uppercase">
                        LinkedIn
                      </p>
                      <p className="font-headline text-sm font-semibold text-white">
                        Connect on LinkedIn
                      </p>
                    </div>
                  </a>
                )}

                {/* GitHub Contact Link */}
                {portfolioData.contact.github && (
                  <a 
                    href={portfolioData.contact.github} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 p-5 rounded-2xl transition-all duration-300 cursor-pointer shadow-md"
                    id="contact-github-link"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                      <Github className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-widest text-purple-400 uppercase">
                        GitHub
                      </p>
                      <p className="font-headline text-sm font-semibold text-white">
                        View GitHub Profile
                      </p>
                    </div>
                  </a>
                )}

                {/* Twitter Contact Link */}
                {portfolioData.contact.twitter && (
                  <a 
                    href={portfolioData.contact.twitter} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-500/10 p-5 rounded-2xl transition-all duration-300 cursor-pointer shadow-md"
                    id="contact-twitter-link"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                      <Twitter className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-widest text-purple-400 uppercase">
                        Twitter
                      </p>
                      <p className="font-headline text-sm font-semibold text-white">
                        Follow on Twitter
                      </p>
                    </div>
                  </a>
                )}
              </div>
            </div>
          </NeonGlowCard>
        </ScrollReveal>
      </section>

      {/* FOOTER */}
      <footer className="w-full py-16 bg-transparent border-t border-white/5">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="font-headline text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>{portfolioData.hero.firstName}<span className="text-purple-400">.</span></span>
          </div>
          
          <div className="flex gap-8">
            <a
              href={portfolioData.contact.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-purple-300 transition-colors font-sans text-[11px] font-bold uppercase tracking-widest"
            >
              GitHub
            </a>
            <a
              href={portfolioData.contact.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-purple-300 transition-colors font-sans text-[11px] font-bold uppercase tracking-widest"
            >
              LinkedIn
            </a>
            <a
              href={portfolioData.contact.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-purple-300 transition-colors font-sans text-[11px] font-bold uppercase tracking-widest"
            >
              Twitter
            </a>
            <a
              href={`mailto:${portfolioData.contact.email}`}
              className="text-slate-400 hover:text-purple-300 transition-colors font-sans text-[11px] font-bold uppercase tracking-widest"
            >
              Email
            </a>
          </div>
          
          <p className="text-slate-500 font-sans text-xs md:text-right uppercase tracking-wider">
            © 2026 {portfolioData.hero.firstName} {portfolioData.hero.lastName}. Built with technical precision.
          </p>
        </div>
      </footer>

      {/* Floating Admin Panel Trigger */}
      <button
        onClick={() => setIsAdminPanelOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full bg-zinc-900 border border-purple-500/40 flex items-center justify-center text-purple-400 hover:text-white hover:bg-purple-600 hover:border-purple-400 hover:shadow-[0_0_25px_rgba(168,85,247,0.5)] hover:scale-110 transition-all duration-300 cursor-pointer shadow-xl"
        title="Open Customizer Panel"
      >
        <Lock className="w-5 h-5" />
      </button>

      {/* Admin Customizer Modal */}
      <AdminPanel 
        data={portfolioData}
        onSave={handleSavePortfolioData}
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
      />
    </div>
  );
}


