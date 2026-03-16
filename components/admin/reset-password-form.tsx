"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { resetAdminPasswordAction } from "@/lib/actions/admin-actions";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/ui/submit-button";
import type { ActionState } from "@/types/dealership";

const initialState: ActionState = { success: false, message: "" };

export function ResetPasswordForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(
    resetAdminPasswordAction,
    initialState,
  );

  useEffect(() => {
    if (state.success && state.redirectTo) {
      router.push(state.redirectTo);
    }
  }, [router, state.redirectTo, state.success]);

  return (
    <Card className="w-full rounded-[32px] border border-white/80 bg-white p-7 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
        Reset password
      </p>
      <h1 className="mt-4 text-3xl font-semibold text-stone-950">
        Set a new admin password
      </h1>
      <p className="mt-4 text-sm leading-7 text-stone-600">
        For security, new admins must reset the temporary password before
        accessing the dashboard.
      </p>

      <form action={formAction} className="mt-8 space-y-4">
        <div>
          <Label htmlFor="password">New password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>

        {!state.success && state.message ? (
          <p className="text-sm text-red-600" role="alert">
            {state.message}
          </p>
        ) : null}

        {state.success && state.message ? (
          <p className="text-sm text-emerald-700">{state.message}</p>
        ) : null}

        <SubmitButton className="w-full">Update password</SubmitButton>
      </form>
    </Card>
  );
}
