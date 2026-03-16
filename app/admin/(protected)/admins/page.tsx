import type { Metadata } from "next";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminUnavailableState } from "@/components/admin/admin-unavailable-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireAdminSession } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admins",
  description: "View who can access the admin workspace.",
};

type AdminProfile = {
  userId: string;
  email: string;
  fullName: string | null;
};

export default async function AdminAdminsPage() {
  const session = await requireAdminSession();

  if (session.mode === "demo") {
    return (
      <div className="space-y-6">
        <AdminPageHeader
          eyebrow="Admin access"
          title="Admins"
          description="Demo mode has a single shared admin session. Connect Supabase to manage real admin accounts."
        />

        <Card className="rounded-[28px] border border-border/70 bg-white/95 p-5 shadow-[0_18px_42px_rgba(15,23,42,0.05)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-stone-950">Demo Admin</p>
              <p className="text-sm text-stone-600">{session.email}</p>
            </div>
            <Badge variant="accent">Current session</Badge>
          </div>
        </Card>

        <Card className="rounded-[28px] border border-border/70 bg-white/95 p-5 text-sm text-stone-700 shadow-[0_18px_42px_rgba(15,23,42,0.05)]">
          <p className="font-semibold text-stone-950">Need to add/remove admins?</p>
          <p className="mt-2">
            In demo mode this is fixed to one shared account. Connect Supabase first,
            then manage rows in <code>admin_profiles</code>.
          </p>
        </Card>
      </div>
    );
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return (
      <AdminUnavailableState
        title="Admins are unavailable"
        description="Supabase is not configured. Connect your database to view admin accounts."
        retryHref="/admin/admins"
        backHref="/admin/vehicles"
      />
    );
  }

  const { data, error } = await supabase
    .from("admin_profiles")
    .select("user_id, email, full_name")
    .order("created_at", { ascending: true });

  if (error) {
    return (
      <AdminUnavailableState
        title="Admins are unavailable"
        description={error.message}
        retryHref="/admin/admins"
        backHref="/admin/vehicles"
      />
    );
  }

  const admins: AdminProfile[] = (data || []).map((item) => ({
    userId: String(item.user_id),
    email: item.email ? String(item.email) : "No email",
    fullName: item.full_name ? String(item.full_name) : null,
  }));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Admin access"
        title="Admins"
        description="These team members can sign into the admin workspace."
      />

      <Card className="rounded-[28px] border border-border/70 bg-white/95 p-5 text-sm text-stone-700 shadow-[0_18px_42px_rgba(15,23,42,0.05)]">
        <p className="font-semibold text-stone-950">How to add or remove admins</p>
        <ol className="mt-3 list-decimal space-y-2 pl-5">
          <li>Create or invite the user in Supabase Auth first.</li>
          <li>Add admin access by inserting their <code>auth.users.id</code> into <code>admin_profiles</code>.</li>
          <li>Remove access by deleting that user row from <code>admin_profiles</code>.</li>
        </ol>
        <pre className="mt-3 overflow-x-auto rounded-2xl border border-border/70 bg-stone-950 p-3 text-xs text-stone-100"><code>{`-- Add admin access
insert into public.admin_profiles (user_id, email, full_name)
values ('<auth_user_uuid>', 'admin@example.com', 'Admin Name');

-- Remove admin access
delete from public.admin_profiles
where email = 'admin@example.com';`}</code></pre>
        <div className="mt-3">
          <Button asChild size="sm" variant="secondary">
            <Link href="https://supabase.com/docs/guides/database/migrations" target="_blank" rel="noreferrer">
              Supabase migration docs
            </Link>
          </Button>
        </div>
      </Card>
      <Card className="rounded-[28px] border border-border/70 bg-white/95 p-5 shadow-[0_18px_42px_rgba(15,23,42,0.05)]">
        <div className="space-y-4">
          {admins.map((admin) => {
            const isCurrent = admin.userId === session.userId;

            return (
              <div
                key={admin.userId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-stone-50/80 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-stone-950">
                    {admin.fullName || "Unnamed admin"}
                  </p>
                  <p className="text-sm text-stone-600">{admin.email}</p>
                </div>
                {isCurrent ? <Badge variant="accent">Current session</Badge> : null}
              </div>
            );
          })}

          {admins.length === 0 ? (
            <p className="text-sm text-stone-600">
              No admin profiles found. Add a row in <code>admin_profiles</code> to
              grant access.
            </p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
