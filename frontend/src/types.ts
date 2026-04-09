export interface Theme {
  background: string;
  foreground: string;
  accent: string;
  secondary: string;
  headerFont: string;
  bodyFont: string;
  backgroundImage: string | null;
  backgroundImageOpacity: number;
}

export interface Hero {
  title: string;
  subtitle: string;
  tagline: string;
  backgroundVideo: string | null;
  backgroundImage: string | null;
  showVideo: boolean;
  backgroundImageOpacity: number;
  backgroundVideoOpacity: number;
  ctaPortfolio: string;
  ctaResume: string;
}

export interface Education {
  year: string;
  degree: string;
  institution: string;
}

export interface Honor {
  year: string;
  title: string;
  description: string;
  url: string;
}

export interface Publication {
  year: string;
  title: string;
  venue: string;
  url: string;
}

export interface About {
  bio: string;
  philosophy: string;
  linkedin: string;
  photo: string | null;
  education: Education[];
  skills: string[];
  honors: Honor[];
  publications: Publication[];
}

export interface Project {
  id: string;
  title: string;
  name?: string;
  description: string;
  category: string;
  year: string;
  client: string;
  location: string;
  images: string[];
  cover: string | null;
  video: string | null;
  videoUrl: string | null;
}

export interface Resume {
  file: string | null;
  visible: boolean;
  highlights: string[];
}

export interface Portfolio {
  file: string | null;
  visible: boolean;
}

export interface Contact {
  email: string;
  linkedin: string;
  message: string;
}

export interface ShowcaseVideo {
  id: string;
  url: string;
  title: string;
  description: string;
}

export interface Showcase {
  title: string;
  subtitle: string;
  videoOpacity: number;
  videos: ShowcaseVideo[];
}

export interface SiteConfig {
  theme: Theme;
  hero: Hero;
  about: About;
  projectTypes: string[];
  projects: Project[];
  resume: Resume;
  portfolio?: Portfolio;
  contact: Contact;
  showcase: Showcase;
}
