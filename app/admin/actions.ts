"use server";

import { revalidatePath } from "next/cache";
import { setGameAvailability, setHomePageHeadline } from "@/lib/db";

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

export async function updateHomePageHeadline(formData: FormData) {
  const headline = String(formData.get("headline") ?? "");
  await setHomePageHeadline(headline);

  revalidatePath("/");
  revalidatePath("/admin");
}
