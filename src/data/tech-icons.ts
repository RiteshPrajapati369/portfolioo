import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  Code2,
  FileCode,
  Globe,
  Database,
  Lock,
  Cpu,
  Server,
  Network,
  Bug,
  Binary,
  Layers,
  type LucideIcon,
} from "lucide-react";

export interface TechIconConfig {
  name: string;
  icon: LucideIcon;
  color?: string;
}

export const TECH_ICON_MAP: Record<string, LucideIcon> = {
  "Snort / Suricata": ShieldAlert,
  "Python": Terminal,
  "Burp Suite": Bug,
  "Next.js 14": Globe,
  "TypeScript": FileCode,
  "Supabase / PostgreSQL": Database,
  "Tailwind CSS": Layers,
  "Penetesting / Bug Hunting": ShieldCheck,
  "HTML": Code2,
  "CSS": Layers,
  "JS": FileCode,
  "PHP": Server,
  "Network Security": Network,
  "Offensive Security": Shield,
  "Authentication": Lock,
  "Hardware Security": Cpu,
  "Binary Analysis": Binary,
};

export function getTechIcon(name: string): LucideIcon {
  const match = Object.keys(TECH_ICON_MAP).find(
    (key) => key.toLowerCase() === name.toLowerCase() || name.toLowerCase().includes(key.toLowerCase())
  );
  return match ? TECH_ICON_MAP[match] : Shield;
}
