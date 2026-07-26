import React, { useState } from "react";
import { 
  X, 
  Lock, 
  LogOut, 
  Plus, 
  Trash2, 
  Save, 
  Download, 
  Upload, 
  Check, 
  Settings, 
  User, 
  Briefcase, 
  GraduationCap, 
  Terminal, 
  Layers, 
  Phone,
  AlertCircle
} from "lucide-react";
import { PortfolioData, Project, ExperienceItem } from "../types";

interface AdminPanelProps {
  data: PortfolioData;
  onSave: (newData: PortfolioData) => Promise<boolean> | void;
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminPanel({ data, onSave, isOpen, onClose }: AdminPanelProps) {
  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem("portfolio_admin_logged_in") === "true";
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Edit fields (temporary local state, initialized when panel opens or data changes)
  const [localData, setLocalData] = useState<PortfolioData>(data);
  const [activeTab, setActiveTab] = useState<"hero" | "about" | "skills" | "experience" | "projects" | "contact" | "backup">("hero");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // New item auxiliary states
  const [newFrontendSkill, setNewFrontendSkill] = useState("");
  const [newBackendSkill, setNewBackendSkill] = useState("");
  const [newOtherSkill, setNewOtherSkill] = useState("");

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    callback: (base64Url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Handle PDF files
    if (file.type === "application/pdf") {
      if (file.size > 800 * 1024) {
        alert("The PDF file is too large (maximum size is 800KB). Please compress your PDF before uploading to ensure database compatibility.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          callback(reader.result);
        }
      };
      reader.readAsDataURL(file);
      return;
    }

    // Handle image files
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          const img = new Image();
          img.src = reader.result;
          img.onload = () => {
            // Keep at high definition (Full HD - max 1920px on the larger side)
            // If the image is smaller, do not upscale it to avoid pixelation.
            const maxDimension = 1920;
            let width = img.width;
            let height = img.height;

            if (width > maxDimension || height > maxDimension) {
              if (width > height) {
                height = Math.round((height * maxDimension) / width);
                width = maxDimension;
              } else {
                width = Math.round((width * maxDimension) / height);
                height = maxDimension;
              }
            }

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              
              // Smart Dynamic Compression: Try to find a quality (lossless-looking JPEGs) 
              // that fits inside database limits (~250KB binary / ~350k base64 characters).
              let quality = 0.85;
              let compressedBase64 = canvas.toDataURL("image/jpeg", quality);
              
              // Reduce quality step-by-step if the image details make the file size too large
              while (compressedBase64.length > 350000 && quality > 0.45) {
                quality -= 0.1;
                compressedBase64 = canvas.toDataURL("image/jpeg", quality);
              }

              // Fallback: If still too large, downscale slightly to 1280px (HD ready) to guarantee size compatibility
              if (compressedBase64.length > 400000) {
                const altDimension = 1280;
                let altWidth = img.width;
                let altHeight = img.height;
                if (altWidth > altDimension || altHeight > altDimension) {
                  if (altWidth > altHeight) {
                    altHeight = Math.round((altHeight * altDimension) / altWidth);
                    altWidth = altDimension;
                  } else {
                    altWidth = Math.round((altWidth * altDimension) / altHeight);
                    altHeight = altDimension;
                  }
                }
                const altCanvas = document.createElement("canvas");
                altCanvas.width = altWidth;
                altCanvas.height = altHeight;
                const altCtx = altCanvas.getContext("2d");
                if (altCtx) {
                  altCtx.drawImage(img, 0, 0, altWidth, altHeight);
                  compressedBase64 = altCanvas.toDataURL("image/jpeg", 0.65);
                }
              }

              callback(compressedBase64);
            } else {
              callback(reader.result as string);
            }
          };
          img.onerror = () => {
            callback(reader.result as string);
          };
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Initialize states when opening panel
  React.useEffect(() => {
    if (isOpen) {
      setLocalData(JSON.parse(JSON.stringify(data)));
      setSaveSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handles Admin Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() === "ahmedjabar45656@gmail.com" && password === "123456789") {
      setIsLoggedIn(true);
      localStorage.setItem("portfolio_admin_logged_in", "true");
      setLoginError("");
    } else {
      setLoginError("Invalid email or password. Please try again.");
    }
  };

  // Handles Logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("portfolio_admin_logged_in");
  };

  // Save changes to parent state and LocalStorage
  const handleSaveChanges = async () => {
    setIsSaving(true);
    setSaveError("");
    setSaveSuccess(false);

    try {
      const result = onSave(localData);
      if (result instanceof Promise) {
        const success = await result;
        if (success !== false) {
          setSaveSuccess(true);
          setTimeout(() => {
            setSaveSuccess(false);
          }, 4000);
        } else {
          setSaveError("Failed to save changes. Check file sizes.");
        }
      } else {
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
        }, 4000);
      }
    } catch (err: any) {
      console.error("Save execution error:", err);
      setSaveError(err?.message || "Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  // Export Portfolio Config to JSON File
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "portfolio-config.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import Portfolio Config from JSON File
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          // Simple validation check
          if (parsed.hero && parsed.skills && parsed.projects && parsed.experience) {
            setLocalData(parsed);
            alert("Portfolio configuration imported successfully! Click 'Save Changes' to apply.");
          } else {
            alert("Invalid configuration file format. Make sure it matches the exported template.");
          }
        } catch (err) {
          alert("Failed to parse JSON file.");
        }
      };
    }
  };

  // Utility to update hero fields
  const updateHero = (field: keyof typeof localData.hero, value: string) => {
    setLocalData(prev => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: value
      }
    }));
  };

  // Utility to update contact fields
  const updateContact = (field: keyof typeof localData.contact, value: string) => {
    setLocalData(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        [field]: value
      }
    }));
  };

  // Utility to update education fields
  const updateEducation = (field: keyof typeof localData.education, value: string) => {
    setLocalData(prev => ({
      ...prev,
      education: {
        ...prev.education,
        [field]: value
      }
    }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-5xl h-[85vh] md:h-[80vh] bg-zinc-950 border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex justify-between items-center px-8 py-5 border-b border-white/5 bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/10">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight font-headline">
                Customization Dashboard
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                {isLoggedIn ? "Manage and edit all portfolio sections" : "Enter credentials to unlock editing capabilities"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 border border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-full text-[11px] font-bold uppercase tracking-wider transition-all"
                title="Log out of admin mode"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            )}
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
              aria-label="Close panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Lock Screen / Login Portal */}
        {!isLoggedIn ? (
          <div className="flex-grow flex flex-col justify-center items-center px-8 py-8 font-sans overflow-y-auto">
            <div className="max-w-md w-full bg-zinc-900/50 border border-white/5 rounded-3xl p-8 md:p-10 shadow-xl">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 mx-auto mb-4">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 font-headline">
                  Secure Identity Check
                </h3>
                <p className="text-sm text-slate-400">
                  Please sign in to modify the website data.
                </p>
              </div>

              {loginError && (
                <div className="flex items-center gap-2.5 p-4 mb-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@example.com"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="•••••••••"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20"
                >
                  Unlock Editing Console
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Active Editing Workspace */
          <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar Navigation */}
            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/5 bg-zinc-950 px-4 py-6 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible md:overflow-y-auto">
              
              <button
                onClick={() => setActiveTab("hero")}
                className={`flex-shrink-0 flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "hero" ? "bg-indigo-500/10 text-white border-l-2 border-indigo-500" : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <User className="w-4 h-4" />
                Hero Section
              </button>

              <button
                onClick={() => setActiveTab("about")}
                className={`flex-shrink-0 flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "about" ? "bg-indigo-500/10 text-white border-l-2 border-indigo-500" : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                About & Ed
              </button>

              <button
                onClick={() => setActiveTab("skills")}
                className={`flex-shrink-0 flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "skills" ? "bg-indigo-500/10 text-white border-l-2 border-indigo-500" : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Layers className="w-4 h-4" />
                Skills Grid
              </button>

              <button
                onClick={() => setActiveTab("experience")}
                className={`flex-shrink-0 flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "experience" ? "bg-indigo-500/10 text-white border-l-2 border-indigo-500" : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Briefcase className="w-4 h-4" />
                Work Timeline
              </button>

              <button
                onClick={() => setActiveTab("projects")}
                className={`flex-shrink-0 flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "projects" ? "bg-indigo-500/10 text-white border-l-2 border-indigo-500" : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Terminal className="w-4 h-4" />
                Selected Works
              </button>

              <button
                onClick={() => setActiveTab("contact")}
                className={`flex-shrink-0 flex items-center gap-3 px-4 py-3.5 rounded-xl text-left text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "contact" ? "bg-indigo-500/10 text-white border-l-2 border-indigo-500" : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Phone className="w-4 h-4" />
                Contact Info
              </button>

              <div className="hidden md:block my-4 border-t border-white/5"></div>

              <button
                onClick={() => setActiveTab("backup")}
                className={`flex-shrink-0 flex items-center gap-3 px-4 py-3.5 mt-auto rounded-xl text-left text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeTab === "backup" ? "bg-indigo-500/10 text-white border-l-2 border-indigo-500" : "text-indigo-400/80 hover:bg-indigo-500/5 hover:text-white"
                }`}
              >
                <Download className="w-4 h-4" />
                JSON Config
              </button>

            </div>

            {/* Editing Pane Area */}
            <div className="flex-grow p-6 md:p-8 overflow-y-auto bg-zinc-900/20 font-sans">
              
              {/* SAVED NOTIFICATION BANNER */}
              {saveSuccess && (
                <div className="mb-6 flex items-center gap-3 p-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded-2xl text-sm animate-bounce">
                  <Check className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                  <span>Changes synchronized successfully! Content updated in live portfolio.</span>
                </div>
              )}

              {/* TAB 1: HERO SECTION */}
              {activeTab === "hero" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-white mb-2 font-headline">Hero Customizer</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2">First Name</label>
                      <input 
                        type="text" 
                        value={localData.hero.firstName}
                        onChange={(e) => updateHero("firstName", e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2">Last Name</label>
                      <input 
                        type="text" 
                        value={localData.hero.lastName}
                        onChange={(e) => updateHero("lastName", e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2">Tagline Description</label>
                    <input 
                      type="text" 
                      value={localData.hero.tagline}
                      onChange={(e) => updateHero("tagline", e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2">Capsule Portrait Image</label>
                    <div className="flex flex-col sm:flex-row gap-4 items-center bg-zinc-900/30 border border-white/5 rounded-2xl p-4">
                      {localData.hero.profileImageUrl ? (
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 bg-zinc-950">
                          <img 
                            src={localData.hero.profileImageUrl} 
                            alt="Profile Preview" 
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => updateHero("profileImageUrl", "")}
                            className="absolute top-1 right-1 bg-red-600 hover:bg-red-500 text-white rounded-full p-1 cursor-pointer"
                            title="Remove profile image"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center text-slate-500 text-[10px] uppercase font-bold flex-shrink-0">
                          No Image
                        </div>
                      )}
                      <div className="flex-grow w-full space-y-2">
                        <input 
                          type="text" 
                          placeholder="Paste profile image URL..."
                          value={localData.hero.profileImageUrl || ""}
                          onChange={(e) => updateHero("profileImageUrl", e.target.value)}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                        />
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2 px-3 py-1.5 border border-white/10 hover:bg-white/5 rounded-lg text-[11px] font-bold uppercase tracking-wider text-slate-300 cursor-pointer transition-colors">
                            <Upload className="w-3.5 h-3.5 text-indigo-400" />
                            Upload File
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => handleImageUpload(e, (base64) => updateHero("profileImageUrl", base64))} 
                              className="hidden" 
                            />
                          </label>
                          <span className="text-[10px] text-slate-500">
                            Or upload from local device. Saved in database.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2">Resume / CV Document (PDF)</label>
                    <div className="flex flex-col sm:flex-row gap-4 items-center bg-zinc-900/30 border border-white/5 rounded-2xl p-4">
                      {localData.resumeUrl ? (
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 bg-indigo-500/10 flex flex-col items-center justify-center text-indigo-400">
                          <Download className="w-8 h-8 animate-pulse" />
                          <span className="text-[9px] uppercase font-bold tracking-wider mt-1">PDF Loaded</span>
                          <button
                            type="button"
                            onClick={() => setLocalData(prev => ({ ...prev, resumeUrl: "" }))}
                            className="absolute top-1 right-1 bg-red-600 hover:bg-red-500 text-white rounded-full p-1 cursor-pointer"
                            title="Remove resume"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-slate-500 text-[10px] uppercase font-bold flex-shrink-0">
                          No PDF
                        </div>
                      )}
                      <div className="flex-grow w-full space-y-2">
                        <input 
                          type="text" 
                          placeholder="Paste PDF URL or upload..."
                          value={localData.resumeUrl || ""}
                          onChange={(e) => setLocalData(prev => ({ ...prev, resumeUrl: e.target.value }))}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                        />
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-2 px-3 py-1.5 border border-white/10 hover:bg-white/5 rounded-lg text-[11px] font-bold uppercase tracking-wider text-slate-300 cursor-pointer transition-colors">
                            <Upload className="w-3.5 h-3.5 text-indigo-400" />
                            Upload PDF
                            <input 
                              type="file" 
                              accept="application/pdf" 
                              onChange={(e) => handleImageUpload(e, (base64) => setLocalData(prev => ({ ...prev, resumeUrl: base64 })))} 
                              className="hidden" 
                            />
                          </label>
                          <span className="text-[10px] text-slate-500">
                            Or upload a PDF file. Saved in database.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ABOUT & EDUCATION */}
              {activeTab === "about" && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-6">
                    <h3 className="text-lg font-bold text-white mb-4 font-headline">Biographic Paragraphs</h3>
                    
                    <div className="space-y-4">
                      {localData.aboutParagraphs.map((para, idx) => (
                        <div key={idx} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Paragraph #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setLocalData(prev => ({
                                  ...prev,
                                  aboutParagraphs: prev.aboutParagraphs.filter((_, i) => i !== idx)
                                }));
                              }}
                              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove
                            </button>
                          </div>
                          <textarea
                            value={para}
                            rows={3}
                            onChange={(e) => {
                              const updated = [...localData.aboutParagraphs];
                              updated[idx] = e.target.value;
                              setLocalData(prev => ({ ...prev, aboutParagraphs: updated }));
                            }}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setLocalData(prev => ({
                          ...prev,
                          aboutParagraphs: [...prev.aboutParagraphs, "I am an passionate creator..."]
                        }));
                      }}
                      className="mt-4 flex items-center gap-2 px-4 py-2 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 rounded-full text-xs font-bold uppercase tracking-widest cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add Paragraph
                    </button>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white mb-4 font-headline">Education Milestone</h3>
                    <div className="grid grid-cols-1 gap-5">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2">Academic Institution</label>
                        <input 
                          type="text" 
                          value={localData.education.institution}
                          onChange={(e) => updateEducation("institution", e.target.value)}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2">Degree Program</label>
                          <input 
                            type="text" 
                            value={localData.education.degree}
                            onChange={(e) => updateEducation("degree", e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2">Honors / Distinction</label>
                          <input 
                            type="text" 
                            value={localData.education.honors}
                            onChange={(e) => updateEducation("honors", e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 3: SKILLS GRID */}
              {activeTab === "skills" && (
                <div className="space-y-8">
                  <h3 className="text-lg font-bold text-white font-headline mb-2">Technical Capabilities</h3>

                  {/* Frontend Section */}
                  <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6">
                    <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> Frontend Technologies
                    </h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {localData.skills.frontend.map((skill, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/10 text-indigo-300 pl-3.5 pr-2 py-1 rounded-full text-xs font-semibold">
                          {skill}
                          <button 
                            type="button"
                            onClick={() => {
                              setLocalData(prev => ({
                                ...prev,
                                skills: { ...prev.skills, frontend: prev.skills.frontend.filter((_, i) => i !== idx) }
                              }));
                            }}
                            className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-indigo-500/20 text-indigo-400 hover:text-white font-bold cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="Add technology (e.g. Next.js)"
                        value={newFrontendSkill}
                        onChange={(e) => setNewFrontendSkill(e.target.value)}
                        className="max-w-[280px] px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newFrontendSkill.trim()) {
                            setLocalData(prev => ({
                              ...prev,
                              skills: { ...prev.skills, frontend: [...prev.skills.frontend, newFrontendSkill.trim()] }
                            }));
                            setNewFrontendSkill("");
                          }
                        }}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Add
                      </button>
                    </div>

                    {/* Background Image Control */}
                    <div className="mt-6 border-t border-white/5 pt-4">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2">
                        Frontend Card Background Image
                      </label>
                      <div className="flex flex-col sm:flex-row gap-4 items-center">
                        {localData.skills.frontendBgUrl ? (
                          <div className="relative w-24 h-16 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 bg-zinc-950">
                            <img 
                              src={localData.skills.frontendBgUrl} 
                              alt="Frontend Bg Preview" 
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setLocalData(prev => ({
                                  ...prev,
                                  skills: { ...prev.skills, frontendBgUrl: "" }
                                }));
                              }}
                              className="absolute top-1 right-1 bg-red-600 hover:bg-red-500 text-white rounded-full p-1 cursor-pointer"
                              title="Remove background image"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-24 h-16 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center text-slate-500 text-[10px] uppercase font-bold flex-shrink-0">
                            No Image
                          </div>
                        )}
                        <div className="flex-grow w-full space-y-2">
                          <input 
                            type="text"
                            placeholder="Or paste background image URL..."
                            value={localData.skills.frontendBgUrl || ""}
                            onChange={(e) => {
                              setLocalData(prev => ({
                                ...prev,
                                skills: { ...prev.skills, frontendBgUrl: e.target.value }
                              }));
                            }}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                          />
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 px-3 py-1.5 border border-white/10 hover:bg-white/5 rounded-lg text-[11px] font-bold uppercase tracking-wider text-slate-300 cursor-pointer transition-colors">
                              <Upload className="w-3.5 h-3.5 text-indigo-400" />
                              Upload File
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => handleImageUpload(e, (base64) => {
                                  setLocalData(prev => ({
                                    ...prev,
                                    skills: { ...prev.skills, frontendBgUrl: base64 }
                                  }));
                                })} 
                                className="hidden" 
                              />
                            </label>
                            <span className="text-[10px] text-slate-500">
                              Base64 upload will be saved in Firebase.
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Backend Section */}
                  <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6">
                    <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> Backend & Databases
                    </h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {localData.skills.backend.map((skill, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/10 text-indigo-300 pl-3.5 pr-2 py-1 rounded-full text-xs font-semibold">
                          {skill}
                          <button 
                            type="button"
                            onClick={() => {
                              setLocalData(prev => ({
                                ...prev,
                                skills: { ...prev.skills, backend: prev.skills.backend.filter((_, i) => i !== idx) }
                              }));
                            }}
                            className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-indigo-500/20 text-indigo-400 hover:text-white font-bold cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="Add technology (e.g. Postgres)"
                        value={newBackendSkill}
                        onChange={(e) => setNewBackendSkill(e.target.value)}
                        className="max-w-[280px] px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newBackendSkill.trim()) {
                            setLocalData(prev => ({
                              ...prev,
                              skills: { ...prev.skills, backend: [...prev.skills.backend, newBackendSkill.trim()] }
                            }));
                            setNewBackendSkill("");
                          }
                        }}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Add
                      </button>
                    </div>

                    {/* Background Image Control */}
                    <div className="mt-6 border-t border-white/5 pt-4">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2">
                        Backend Card Background Image
                      </label>
                      <div className="flex flex-col sm:flex-row gap-4 items-center">
                        {localData.skills.backendBgUrl ? (
                          <div className="relative w-24 h-16 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 bg-zinc-950">
                            <img 
                              src={localData.skills.backendBgUrl} 
                              alt="Backend Bg Preview" 
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setLocalData(prev => ({
                                  ...prev,
                                  skills: { ...prev.skills, backendBgUrl: "" }
                                }));
                              }}
                              className="absolute top-1 right-1 bg-red-600 hover:bg-red-500 text-white rounded-full p-1 cursor-pointer"
                              title="Remove background image"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-24 h-16 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center text-slate-500 text-[10px] uppercase font-bold flex-shrink-0">
                            No Image
                          </div>
                        )}
                        <div className="flex-grow w-full space-y-2">
                          <input 
                            type="text"
                            placeholder="Or paste background image URL..."
                            value={localData.skills.backendBgUrl || ""}
                            onChange={(e) => {
                              setLocalData(prev => ({
                                ...prev,
                                skills: { ...prev.skills, backendBgUrl: e.target.value }
                              }));
                            }}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                          />
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 px-3 py-1.5 border border-white/10 hover:bg-white/5 rounded-lg text-[11px] font-bold uppercase tracking-wider text-slate-300 cursor-pointer transition-colors">
                              <Upload className="w-3.5 h-3.5 text-indigo-400" />
                              Upload File
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => handleImageUpload(e, (base64) => {
                                  setLocalData(prev => ({
                                    ...prev,
                                    skills: { ...prev.skills, backendBgUrl: base64 }
                                  }));
                                })} 
                                className="hidden" 
                              />
                            </label>
                            <span className="text-[10px] text-slate-500">
                              Base64 upload will be saved in Firebase.
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Other Section */}
                  <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6">
                    <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span> Other Tools & Langs
                    </h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {localData.skills.other.map((skill, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/10 text-indigo-300 pl-3.5 pr-2 py-1 rounded-full text-xs font-semibold">
                          {skill}
                          <button 
                            type="button"
                            onClick={() => {
                              setLocalData(prev => ({
                                ...prev,
                                skills: { ...prev.skills, other: prev.skills.other.filter((_, i) => i !== idx) }
                              }));
                            }}
                            className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-indigo-500/20 text-indigo-400 hover:text-white font-bold cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="Add skill (e.g. Docker)"
                        value={newOtherSkill}
                        onChange={(e) => setNewOtherSkill(e.target.value)}
                        className="max-w-[280px] px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newOtherSkill.trim()) {
                            setLocalData(prev => ({
                              ...prev,
                              skills: { ...prev.skills, other: [...prev.skills.other, newOtherSkill.trim()] }
                            }));
                            setNewOtherSkill("");
                          }
                        }}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Add
                      </button>
                    </div>

                    {/* Background Image Control */}
                    <div className="mt-6 border-t border-white/5 pt-4">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2">
                        Other Card Background Image
                      </label>
                      <div className="flex flex-col sm:flex-row gap-4 items-center">
                        {localData.skills.otherBgUrl ? (
                          <div className="relative w-24 h-16 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 bg-zinc-950">
                            <img 
                              src={localData.skills.otherBgUrl} 
                              alt="Other Bg Preview" 
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setLocalData(prev => ({
                                  ...prev,
                                  skills: { ...prev.skills, otherBgUrl: "" }
                                }));
                              }}
                              className="absolute top-1 right-1 bg-red-600 hover:bg-red-500 text-white rounded-full p-1 cursor-pointer"
                              title="Remove background image"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-24 h-16 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center text-slate-500 text-[10px] uppercase font-bold flex-shrink-0">
                            No Image
                          </div>
                        )}
                        <div className="flex-grow w-full space-y-2">
                          <input 
                            type="text"
                            placeholder="Or paste background image URL..."
                            value={localData.skills.otherBgUrl || ""}
                            onChange={(e) => {
                              setLocalData(prev => ({
                                ...prev,
                                skills: { ...prev.skills, otherBgUrl: e.target.value }
                              }));
                            }}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
                          />
                          <div className="flex items-center gap-2">
                            <label className="flex items-center gap-2 px-3 py-1.5 border border-white/10 hover:bg-white/5 rounded-lg text-[11px] font-bold uppercase tracking-wider text-slate-300 cursor-pointer transition-colors">
                              <Upload className="w-3.5 h-3.5 text-indigo-400" />
                              Upload File
                              <input 
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => handleImageUpload(e, (base64) => {
                                  setLocalData(prev => ({
                                    ...prev,
                                    skills: { ...prev.skills, otherBgUrl: base64 }
                                  }));
                                })} 
                                className="hidden" 
                              />
                            </label>
                            <span className="text-[10px] text-slate-500">
                              Base64 upload will be saved in Firebase.
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 4: WORK TIMELINE */}
              {activeTab === "experience" && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white font-headline">Professional Experience Timeline</h3>
                    <button
                      type="button"
                      onClick={() => {
                        const newExp: ExperienceItem = {
                          id: `exp-${Date.now()}`,
                          role: "New Role",
                          company: "Company Name",
                          period: "2024 - Present",
                          bullets: ["Assisted in designing custom web modules."]
                        };
                        setLocalData(prev => ({
                          ...prev,
                          experience: [newExp, ...prev.experience]
                        }));
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-xs font-bold uppercase tracking-widest cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> New Workplace
                    </button>
                  </div>

                  <div className="space-y-6">
                    {localData.experience.map((exp, expIdx) => (
                      <div key={exp.id} className="p-6 bg-zinc-900/40 border border-white/5 rounded-[2rem] space-y-4">
                        <div className="flex justify-between items-start gap-4">
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">Position #{expIdx + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setLocalData(prev => ({
                                ...prev,
                                experience: prev.experience.filter(item => item.id !== exp.id)
                              }));
                            }}
                            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove Work
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Role Title</label>
                            <input 
                              type="text" 
                              value={exp.role}
                              onChange={(e) => {
                                const updated = [...localData.experience];
                                updated[expIdx].role = e.target.value;
                                setLocalData(prev => ({ ...prev, experience: updated }));
                              }}
                              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Company</label>
                            <input 
                              type="text" 
                              value={exp.company}
                              onChange={(e) => {
                                const updated = [...localData.experience];
                                updated[expIdx].company = e.target.value;
                                setLocalData(prev => ({ ...prev, experience: updated }));
                              }}
                              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Period</label>
                            <input 
                              type="text" 
                              value={exp.period}
                              onChange={(e) => {
                                const updated = [...localData.experience];
                                updated[expIdx].period = e.target.value;
                                setLocalData(prev => ({ ...prev, experience: updated }));
                              }}
                              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Key Responsibilities (Bullets)</label>
                          {exp.bullets.map((bullet, bulletIdx) => (
                            <div key={bulletIdx} className="flex gap-2">
                              <input 
                                type="text"
                                value={bullet}
                                onChange={(e) => {
                                  const updated = [...localData.experience];
                                  updated[expIdx].bullets[bulletIdx] = e.target.value;
                                  setLocalData(prev => ({ ...prev, experience: updated }));
                                }}
                                className="flex-grow px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...localData.experience];
                                  updated[expIdx].bullets = updated[expIdx].bullets.filter((_, i) => i !== bulletIdx);
                                  setLocalData(prev => ({ ...prev, experience: updated }));
                                }}
                                className="px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl cursor-pointer"
                                title="Remove bullet"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...localData.experience];
                              updated[expIdx].bullets.push("New accomplishment detail...");
                              setLocalData(prev => ({ ...prev, experience: updated }));
                            }}
                            className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add bullet point
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* TAB 5: SELECTED PROJECTS */}
              {activeTab === "projects" && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white font-headline">Selected Projects Customizer</h3>
                    <button
                      type="button"
                      onClick={() => {
                        const newProj: Project = {
                          id: `proj-${Date.now()}`,
                          title: "New Custom Project",
                          description: "Short description of the architectural depth of the project.",
                          imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
                          tech: ["React", "TypeScript", "Tailwind"],
                          url: "#"
                        };
                        setLocalData(prev => ({
                          ...prev,
                          projects: [newProj, ...prev.projects]
                        }));
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-xs font-bold uppercase tracking-widest cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Selected Work
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-8">
                    {localData.projects.map((proj, pIdx) => (
                      <div key={proj.id} className="p-6 bg-zinc-900/40 border border-white/5 rounded-[2.5rem] space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-400">Project #{pIdx + 1}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setLocalData(prev => ({
                                ...prev,
                                projects: prev.projects.filter(item => item.id !== proj.id)
                              }));
                            }}
                            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete Project
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Project Name</label>
                            <input 
                              type="text" 
                              value={proj.title}
                              onChange={(e) => {
                                const updated = [...localData.projects];
                                updated[pIdx].title = e.target.value;
                                setLocalData(prev => ({ ...prev, projects: updated }));
                              }}
                              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Destination URL Link</label>
                            <input 
                              type="text" 
                              value={proj.url}
                              onChange={(e) => {
                                const updated = [...localData.projects];
                                updated[pIdx].url = e.target.value;
                                setLocalData(prev => ({ ...prev, projects: updated }));
                              }}
                              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Description</label>
                          <textarea
                            value={proj.description}
                            rows={2}
                            onChange={(e) => {
                              const updated = [...localData.projects];
                              updated[pIdx].description = e.target.value;
                              setLocalData(prev => ({ ...prev, projects: updated }));
                            }}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                            Project Cover Image
                          </label>
                          <div className="flex flex-col sm:flex-row gap-4 items-center bg-zinc-900/30 border border-white/5 rounded-2xl p-4">
                            {proj.imageUrl ? (
                              <div className="relative w-24 h-16 rounded-xl overflow-hidden border border-white/10 flex-shrink-0 bg-zinc-950">
                                <img 
                                  src={proj.imageUrl} 
                                  alt="Project Preview" 
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...localData.projects];
                                    updated[pIdx].imageUrl = "";
                                    setLocalData(prev => ({ ...prev, projects: updated }));
                                  }}
                                  className="absolute top-1 right-1 bg-red-600 hover:bg-red-500 text-white rounded-full p-1 cursor-pointer"
                                  title="Remove image"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <div className="w-24 h-16 rounded-xl border-2 border-dashed border-white/10 flex items-center justify-center text-slate-500 text-[10px] uppercase font-bold flex-shrink-0">
                                No Image
                              </div>
                            )}
                            <div className="flex-grow w-full space-y-2">
                              <input 
                                type="text" 
                                placeholder="Paste project cover image URL..."
                                value={proj.imageUrl || ""}
                                onChange={(e) => {
                                  const updated = [...localData.projects];
                                  updated[pIdx].imageUrl = e.target.value;
                                  setLocalData(prev => ({ ...prev, projects: updated }));
                                }}
                                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                              />
                              <div className="flex items-center gap-2">
                                <label className="flex items-center gap-2 px-3 py-1.5 border border-white/10 hover:bg-white/5 rounded-lg text-[11px] font-bold uppercase tracking-wider text-slate-300 cursor-pointer transition-colors">
                                  <Upload className="w-3.5 h-3.5 text-indigo-400" />
                                  Upload File
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={(e) => handleImageUpload(e, (base64) => {
                                      const updated = [...localData.projects];
                                      updated[pIdx].imageUrl = base64;
                                      setLocalData(prev => ({ ...prev, projects: updated }));
                                    })} 
                                    className="hidden" 
                                  />
                                </label>
                                <span className="text-[10px] text-slate-500">
                                  Or upload from local device. Saved in database.
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Tech Tags (Comma separated list)</label>
                          <input 
                            type="text" 
                            value={proj.tech.join(", ")}
                            onChange={(e) => {
                              const updated = [...localData.projects];
                              updated[pIdx].tech = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                              setLocalData(prev => ({ ...prev, projects: updated }));
                            }}
                            placeholder="Laravel, MySQL, CSS"
                            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* TAB 6: CONTACT & SOCIALS */}
              {activeTab === "contact" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-white mb-2 font-headline">Contact Information</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2">Primary Inquiry Email</label>
                      <input 
                        type="email" 
                        value={localData.contact.email}
                        onChange={(e) => updateContact("email", e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2">LinkedIn Profile URL</label>
                      <input 
                        type="text" 
                        value={localData.contact.linkedin}
                        onChange={(e) => updateContact("linkedin", e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2">GitHub Profile Link</label>
                      <input 
                        type="text" 
                        value={localData.contact.github}
                        onChange={(e) => updateContact("github", e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2">Twitter Profile Link</label>
                      <input 
                        type="text" 
                        value={localData.contact.twitter}
                        onChange={(e) => updateContact("twitter", e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 7: BACKUP & RESTORE */}
              {activeTab === "backup" && (
                <div className="space-y-6 font-sans">
                  <h3 className="text-lg font-bold text-white mb-2 font-headline">Import & Export Configurations</h3>
                  <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">
                    Save a full offline copy of your custom configurations so that you can migrate, back up, or reset your portfolio layout in one click.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                    <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white mb-2">Export Current Portfolio</h4>
                        <p className="text-xs text-slate-400 mb-4">
                          Download a copy of your custom text, skills, experiences, and project lists.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleExportJSON}
                        className="w-full py-3 border border-white/10 hover:bg-white hover:text-black text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Download className="w-4 h-4" /> Download config.json
                      </button>
                    </div>

                    <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-white mb-2">Import Custom Portfolio</h4>
                        <p className="text-xs text-slate-400 mb-4">
                          Replace all page items instantly by uploading a previously downloaded portfolio config JSON file.
                        </p>
                      </div>
                      <label className="w-full py-3 border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 text-indigo-400 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer text-center">
                        <Upload className="w-4 h-4" />
                        Upload config.json
                        <input 
                          type="file" 
                          accept=".json" 
                          onChange={handleImportJSON} 
                          className="hidden" 
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Action Bottom Bar (Only shown when logged in) */}
        {isLoggedIn && (
          <div className="flex justify-between items-center px-8 py-5 border-t border-white/5 bg-zinc-900/40">
            <div className="flex flex-col">
              {saveSuccess && (
                <span className="text-[11px] text-green-400 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Changes saved and synced successfully!
                </span>
              )}
              {saveError && (
                <span className="text-[11px] text-red-400 font-bold flex items-center gap-1 max-w-sm">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {saveError}
                </span>
              )}
              {!saveSuccess && !saveError && (
                <span className="text-[11px] text-slate-500 italic">
                  Unsaved changes will be lost unless you save.
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setLocalData(JSON.parse(JSON.stringify(data)))}
                disabled={isSaving}
                className="px-6 py-2.5 border border-white/10 rounded-full text-[11px] font-bold uppercase tracking-wider hover:bg-white/5 text-slate-400 hover:text-white transition-all cursor-pointer disabled:opacity-50"
              >
                Reset Tab Inputs
              </button>
              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 cursor-pointer disabled:bg-indigo-700/50 disabled:opacity-75"
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
