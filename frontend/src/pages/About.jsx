import React from 'react';
import { User, Code2, Server, Database, Globe, Linkedin, Github, ExternalLink, GraduationCap, Award, Compass } from 'lucide-react';

const About = () => {
  const skills = {
    frontend: ['React.js', 'HTML5 / CSS3', 'Tailwind CSS', 'Bootstrap'],
    backend: ['Node.js', 'Express.js', 'FastAPI', 'REST API Design', 'JWT Authentication', 'Role-Based Auth'],
    database: ['MongoDB', 'MySQL', 'SQLite'],
    tools: ['JavaScript', 'Python', 'Git & GitHub', 'Postman API Testing', 'Linux Basics']
  };

  const projects = [
    {
      title: "eCart Multi-Vendor Marketplace",
      tech: ["MongoDB", "Express.js", "React.js", "Node.js", "Tailwind CSS"],
      description: "A production-grade MERN marketplace featuring secure customer checkout via wallet credits, visual multi-vendor order splitting, seller inventory fulfillment dashboard with visual shipment timelines, and Super Admin KYC controls.",
      link: "https://github.com/nk1411projects/eCart"
    },
    {
      title: "CareSync Clinic Portal",
      tech: ["React.js", "FastAPI", "MongoDB", "Async APIs"],
      description: "A hospital appointment management system bridging patient bookings with real-time doctor schedule calendars. Features clinic schedules, appointment logs, and secure status validations.",
      link: "https://github.com/nk1411projects/CareSync"
    },
    {
      title: "PhishGuard URL Detector",
      tech: ["React.js", "Flask", "Python", "Machine Learning"],
      description: "A cybersecurity URL classification tool. Evaluates suspicious website links in real-time using ML models to warn users of malicious phishing threats.",
      link: "https://github.com/nk1411projects/PhishGuard"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto my-12 px-4 sm:px-6 lg:px-8 text-slate-900 dark:text-slate-100">
      {/* Bio Header Section */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center mb-16 pb-12 border-b border-slate-200 dark:border-slate-800">
        <div className="flex-1 space-y-4 text-center lg:text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400">
            <GraduationCap className="w-3.5 h-3.5" /> Full Stack Developer & AI/ML Enthusiast
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Nithish Kumar
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            I am a Full stack developer and AI/ML enthusiast based in Tamil Nadu, India, holding a Bachelor of Computer Applications (BCA). I specialize in designing and constructing scalable, secure, and user-focused web architectures, with a core expertise in the MERN Stack.
          </p>
          <div className="flex gap-4 justify-center lg:justify-start pt-2">
            <a 
              href="https://nk-myfolio.vercel.app/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Globe className="w-4 h-4" /> Portfolio <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a 
              href="https://www.linkedin.com/in/nithishkumar1411/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Linkedin className="w-4 h-4 text-sky-500" /> LinkedIn
            </a>
            <a 
              href="https://github.com/nk1411projects" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Github className="w-4 h-4 text-slate-900 dark:text-white" /> GitHub
            </a>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Skills on Left, Projects on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Skills & Goals */}
        <div className="lg:col-span-5 space-y-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Code2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Technical Expertise
            </h2>
            
            {/* Skills Lists */}
            <div className="space-y-4">
              {/* Frontend Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-500" /> Frontend Engineering
                </h4>
                <div className="flex flex-wrap gap-2">
                  {skills.frontend.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">{s}</span>
                  ))}
                </div>
              </div>

              {/* Backend Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-indigo-500" /> Backend Development
                </h4>
                <div className="flex flex-wrap gap-2">
                  {skills.backend.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">{s}</span>
                  ))}
                </div>
              </div>

              {/* Database & Tools */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-indigo-500" /> Databases
                </h4>
                <div className="flex flex-wrap gap-2">
                  {skills.database.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">{s}</span>
                  ))}
                </div>
              </div>

              {/* Tools & Languages */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/40">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-indigo-500" /> Languages & Core Utilities
                </h4>
                <div className="flex flex-wrap gap-2">
                  {skills.tools.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Goal Statement Card */}
          <div className="p-6 rounded-2xl bg-indigo-50/20 dark:bg-indigo-950/10 border border-indigo-100/30 dark:border-indigo-900/20">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-indigo-500" /> Professional Objective
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
              My target is to engineer scalable, high-performance backends and clean user interfaces. I continuously study API architectures, caching engines, database optimizations, and cloud deployment pipelines to build resilient products.
            </p>
          </div>
        </div>

        {/* Right Column: Featured Projects */}
        <div className="lg:col-span-7 space-y-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Featured Engineering Projects
          </h2>
          
          <div className="space-y-6">
            {projects.map((proj, i) => (
              <div key={i} className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none transition-all hover:border-slate-300 dark:hover:border-slate-700">
                <div className="flex justify-between items-start gap-4 mb-2">
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">{proj.title}</h3>
                  <a 
                    href={proj.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex-shrink-0"
                    title="View Code Repository"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
                
                {/* Tech Badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {proj.tech.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{t}</span>
                  ))}
                </div>

                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  {proj.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
