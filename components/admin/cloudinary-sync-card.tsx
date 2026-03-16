"use client";

import { Images } from "lucide-react";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { syncVehicleImagesAction } from "@/lib/actions/admin-actions";
import { Card } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import type { ActionState } from "@/types/dealership";

const initialState: ActionState = {
  success: false,
  message: "",
};

export function CloudinarySyncCard({
  vehicleId,
  stockCode,
}: {
  vehicleId: string;
  stockCode: string;
}) {
  const router = useRouter();
  const [state, formAction] = useActionState(
    syncVehicleImagesAction,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      router.refresh();
    }
  }, [router, state]);

  return (
    <Card className="rounded-[24px] border border-border bg-stone-50 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-stone-950">
            Cloudinary folder sync
          </p>
          <p className="mt-1 text-sm leading-6 text-stone-600">
            Replace the saved gallery with the images already living inside{" "}
            <strong>{stockCode}</strong> after your listing details are saved.
          </p>
        </div>

        <form action={formAction} className="shrink-0">
          <input type="hidden" name="id" value={vehicleId} />
          <SubmitButton className="w-full sm:w-auto">
            <Images className="size-4" />
            Sync folder images
          </SubmitButton>
        </form>
      </div>

      {state.message ? (
        <p
          className={`mt-3 text-sm ${
            state.success ? "text-emerald-700" : "text-red-600"
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </Card>
  );
}
