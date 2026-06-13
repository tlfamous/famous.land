"use server";

import { revalidatePath } from "next/cache";
import { setGameAvailability } from "@/lib/db";

const gameAvailabilityPaths = [
  "/",
  "/quest",
  "/quests",
  "/progress",
  "/save-progress",
  "/prize/lakemonomonac2026",
  "/admin"
];

export async function updateGameAvailability(formData: FormData) {
  const enabled = formData.get("enabled") === "true";
  await setGameAvailability(enabled);

  for (const path of gameAvailabilityPaths) {
    revalidatePath(path);
  }
}
