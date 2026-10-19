import {
  LayoutDashboard,
  User,
  FolderGit2,
  BookOpen,
  Sparkles,
  Share2,
  Mail,
  Image as ImageIcon,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export interface DashboardNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
}

export const DASHBOARD_NAV_ITEMS: DashboardNavItem[] = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Profile & Avatar",
    href: "/dashboard/profile",
    icon: User,
  },
  {
    title: "Projects / Work",
    href: "/dashboard/projects",
    icon: FolderGit2,
  },
  {
    title: "Blog & Notes",
    href: "/dashboard/blog",
    icon: BookOpen,
  },
  {
    title: "Skills & Services",
    href: "/dashboard/skills",
    icon: Sparkles,
  },
  {
    title: "Social Links",
    href: "/dashboard/social",
    icon: Share2,
  },
  {
    title: "Messages",
    href: "/dashboard/messages",
    icon: Mail,
  },
  {
    title: "Media Library",
    href: "/dashboard/media",
    icon: ImageIcon,
  },
  {
    title: "Security & MFA",
    href: "/dashboard/security",
    icon: ShieldCheck,
  },
];
