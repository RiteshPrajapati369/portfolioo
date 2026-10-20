import Link from "next/link";
import {
  FolderGit2,
  BookOpen,
  Mail,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Plus,
  User,
  Clock,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase-admin";
import { getOwnerConfig } from "@/lib/owner-auth";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardOverviewPage() {
  let projectsCount = 0;
  let blogCount = 0;
  let messagesCount = 0;
  let skillsCount = 0;
  let recentMessages: any[] = [];

  try {
    const admin = createAdminClient();
    const [pRes, bRes, mRes, sRes, recentRes] = await Promise.all([
      admin.from("projects").select("*", { count: "exact", head: true }).is("deleted_at", null),
      admin.from("blog_posts").select("*", { count: "exact", head: true }),
      admin
        .from("contact_messages")
        .select("*", { count: "exact", head: true })
        .eq("status", "new"),
      admin.from("skills").select("*", { count: "exact", head: true }),
      admin
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    projectsCount = pRes.count || 0;
    blogCount = bRes.count || 0;
    messagesCount = mRes.count || 0;
    skillsCount = sRes.count || 0;
    recentMessages = recentRes.data || [];
  } catch (err) {
    console.warn("Dashboard overview metrics query error:", err);
  }

  const hasMfa = Boolean(getOwnerConfig()?.mfaEnabled);

  return (
    <div className="space-y-8">
      {/* Page Title & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground">
            Security Operations Console
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-mono mt-1">
            Overview of portfolio content, communication channels, and authentication state
          </p>
        </div>

        {/* Security badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-mono">
          <ShieldCheck className={`w-4 h-4 ${hasMfa ? "text-emerald-500" : "text-amber-500"}`} />
          <span>MFA: {hasMfa ? "ENFORCED" : "PENDING ENROLLMENT"}</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Projects Metric */}
        <div className="p-6 rounded-2xl border border-border bg-card/60 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Projects
            </div>
            <div className="text-3xl font-bold font-mono text-foreground mt-1">
              {projectsCount || 0}
            </div>
            <Link
              href="/dashboard/projects"
              className="text-[11px] font-mono text-primary hover:underline mt-2 inline-block"
            >
              Manage Projects &rarr;
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center text-primary">
            <FolderGit2 className="w-6 h-6" />
          </div>
        </div>

        {/* Blog Metric */}
        <div className="p-6 rounded-2xl border border-border bg-card/60 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Blog Posts
            </div>
            <div className="text-3xl font-bold font-mono text-foreground mt-1">
              {blogCount || 0}
            </div>
            <Link
              href="/dashboard/blog"
              className="text-[11px] font-mono text-primary hover:underline mt-2 inline-block"
            >
              Manage Articles &rarr;
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center text-primary">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        {/* Messages Metric */}
        <div className="p-6 rounded-2xl border border-border bg-card/60 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              New Messages
            </div>
            <div className="text-3xl font-bold font-mono text-foreground mt-1">
              {messagesCount || 0}
            </div>
            <Link
              href="/dashboard/messages"
              className="text-[11px] font-mono text-primary hover:underline mt-2 inline-block"
            >
              View Inquiries &rarr;
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center text-primary">
            <Mail className="w-6 h-6" />
          </div>
        </div>

        {/* Skills Metric */}
        <div className="p-6 rounded-2xl border border-border bg-card/60 flex items-center justify-between shadow-sm">
          <div>
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Skills Registered
            </div>
            <div className="text-3xl font-bold font-mono text-foreground mt-1">
              {skillsCount || 0}
            </div>
            <Link
              href="/dashboard/skills"
              className="text-[11px] font-mono text-primary hover:underline mt-2 inline-block"
            >
              Manage Skills &rarr;
            </Link>
          </div>
          <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center text-primary">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="p-6 rounded-2xl border border-border bg-card/40 space-y-4">
        <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-muted-foreground">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/projects"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-mono text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Project</span>
          </Link>
          <Link
            href="/dashboard/blog"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card hover:bg-card/80 text-foreground font-mono text-xs font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-primary" />
            <span>New Article</span>
          </Link>
          <Link
            href="/dashboard/profile"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card hover:bg-card/80 text-foreground font-mono text-xs font-medium transition-colors"
          >
            <User className="w-3.5 h-3.5 text-primary" />
            <span>Update Avatar / Profile</span>
          </Link>
          <Link
            href="/dashboard/security"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card hover:bg-card/80 text-foreground font-mono text-xs font-medium transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>MFA & Lockout Logs</span>
          </Link>
        </div>
      </div>

      {/* Recent Inquiries List */}
      <div className="rounded-2xl border border-border bg-card/60 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            <h2 className="font-mono font-bold text-sm text-foreground">
              Recent Contact Form Inquiries
            </h2>
          </div>
          <Link
            href="/dashboard/messages"
            className="text-xs font-mono text-primary hover:underline flex items-center gap-1"
          >
            <span>All Messages</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {!recentMessages || recentMessages.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-muted-foreground">
            No incoming contact messages yet.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentMessages.map((msg) => (
              <div key={msg.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-foreground">{msg.name}</span>
                    <span className="text-[11px] font-mono text-muted-foreground">&lt;{msg.email}&gt;</span>
                    {msg.status === "new" && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 uppercase">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate max-w-xl">
                    <span className="font-medium text-foreground">{msg.subject}</span> — {msg.message}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono text-muted-foreground shrink-0">
                  <Clock className="w-3 h-3 text-primary" />
                  <span>{formatDate(msg.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
