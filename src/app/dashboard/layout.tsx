import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase-server";
import { DashboardNav } from "@/components/dashboard/dashboard-nav";
import { verifyOwnerSessionToken, OWNER_EMAIL } from "@/lib/owner-auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const ownerToken = cookieStore.get("ritesh_owner_session")?.value;
  const isOwner = verifyOwnerSessionToken(ownerToken);

  let user = null;
  // Fast path: Only make external Supabase Auth network call if owner session is NOT active
  if (!isOwner) {
    try {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch {
      // Graceful fallback
    }
  }

  if (!user && !isOwner) {
    try {
      cookieStore.delete("ritesh_owner_session");
    } catch {
      // ignore
    }
    redirect("/auth/login?next=/dashboard");
  }

  const userEmail = isOwner ? OWNER_EMAIL : (user?.email || "panditritesh005@gmail.com");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col lg:flex-row">
      <DashboardNav userEmail={userEmail} />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
