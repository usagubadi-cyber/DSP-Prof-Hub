"use server";

import { redirect } from "next/navigation";

import { checkAdminPassword, clearAdminSession, setAdminSession } from "@/lib/auth";

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");

  if (!password || !checkAdminPassword(password)) {
    return { error: "Incorrect password." };
  }

  await setAdminSession();
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await clearAdminSession();
  redirect("/admin/login");
}
