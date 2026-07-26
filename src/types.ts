export interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  tech: string[];
  url: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  period: string;
  bullets: string[];
}

export interface EducationInfo {
  institution: string;
  degree: string;
  honors: string;
}

export interface SkillsData {
  frontend: string[];
  backend: string[];
  other: string[];
  frontendBgUrl?: string;
  backendBgUrl?: string;
  otherBgUrl?: string;
}

export interface ContactInfo {
  email: string;
  linkedin: string;
  github: string;
  twitter: string;
}

export interface HeroData {
  firstName: string;
  lastName: string;
  tagline: string;
  profileImageUrl: string;
}

export interface PortfolioData {
  hero: HeroData;
  aboutParagraphs: string[];
  education: EducationInfo;
  skills: SkillsData;
  experience: ExperienceItem[];
  projects: Project[];
  contact: ContactInfo;
  resumeUrl?: string;
}

export const INITIAL_PORTFOLIO_DATA: PortfolioData = {
  hero: {
    firstName: "AHMAD",
    lastName: "JABAR",
    tagline: "Designing human experiences in code.",
    profileImageUrl: "https://i.postimg.cc/y8DnKLyK/albert-dera-ILip77-Sbm-OE-unsplash.jpg"
  },
  aboutParagraphs: [
    "I am a Software Engineering graduate with a profound passion for creating scalable digital solutions. My expertise spans across the full-stack development lifecycle, from designing intuitive frontend experiences to architecting efficient backend systems.",
    "With additional experience in AI and Machine Learning, I bring a data-driven perspective to web development, ensuring that the applications I build are not only functional but also intelligent and user-centric."
  ],
  education: {
    institution: "COMSATS University",
    degree: "BSc Software Engineering",
    honors: "Graduated with Technical Honors"
  },
  skills: {
    frontend: ["HTML", "Tailwind CSS", "JavaScript", "TypeScript", "React"],
    backend: ["Node.js", "Express", "PHP", "Laravel"],
    other: ["Python", "Java", "Django"],
    frontendBgUrl: "https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&q=80&w=800",
    backendBgUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800",
    otherBgUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800"
  },
  experience: [
    {
      id: "exp-1",
      role: "Generative AI Intern",
      company: "ITSOLERA",
      period: "2023 - Present",
      bullets: [
        "Assisting in the implementation of LLM-based solutions for internal workflow optimization.",
        "Developing prompt engineering strategies and fine-tuning models for specific domain tasks.",
        "Collaborating with the backend team to integrate AI microservices using Python and Node.js."
      ]
    },
    {
      id: "exp-2",
      role: "Web Developer",
      company: "Codistan Ventures",
      period: "2022 - 2023",
      bullets: [
        "Built and maintained high-performance web applications using Laravel and React.",
        "Optimized database queries leading to a 30% reduction in server response times.",
        "Participated in code reviews and architectural planning for client-facing projects."
      ]
    }
  ],
  projects: [
    {
      id: "proj-1",
      title: "Print My Boxes",
      description: "An end-to-end client packaging system allowing users to configure, quote, and track custom box orders with real-time inventory synchronization.",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBDW4BCON7wLEFqzl3F_-se-XVr4D4hF0PXIkXApF-ePuH5Hbc3k3-kj0xtN1v3YK9yMwisQFlh3-OR9oQwuNBQYZR5_fXz3DkTJFzKX5cVrUmk-uLabTcCwTxkEGiz12MMpRXJfT_TA0LqU8wSF3xa1vzK6QbXNYvJ4TrB3nZT33WCHAshTsTkqsdjbjsKBFaj2C1DTsDkAAM40mMdBs-sSFEie6B9mqoxklblZWT2SQvQAa19f9tVI4l693F7SBhZJG7TdLmOK_KP",
      tech: ["Laravel", "MySQL", "Tailwind"],
      url: "#"
    },
    {
      id: "proj-2",
      title: "Flavors Cafe",
      description: "A modern restaurant platform featuring a dynamic digital menu, online table reservation system, and a custom content management backend.",
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDcOShF6_iR9X-jR6m8b_AcbcmER9v34YmY7Ft6ewg7JF8llI1YQDQaraEtCybfSKhNepO5ULK3xuTMithVDbHFwmNiI8OyoAeXPnwIOOtFXWxMYZSlxEq7V-Xl3H7qnxLt5wMV728RrAbsKcojOZlUA4I4ID8JleXLRWu4_9Gtb0W3Ef2b5Xx_8CCdHCv_xdqsG3FCNasvuz-xRn4zMT6fv2kCIAhgz36fd6pmXnpL8BLguojhaY15Tl3VMs1YzF0f5MyCMPUnB8U_",
      tech: ["React", "Firebase", "Framer Motion"],
      url: "#"
    }
  ],
  contact: {
    email: "Ahmedjabar45656@gmail.com",
    linkedin: "https://linkedin.com/in/ahmadjabar",
    github: "https://github.com/ahmadjabar",
    twitter: "https://twitter.com/ahmadjabar"
  },
  resumeUrl: ""
};
