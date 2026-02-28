import { cookies } from "next/headers";
import { dict, type Lang } from "@/i18n/dict";

export async function getLang(): Promise<Lang> {
  const cookieStore = await cookies();
  const value = cookieStore.get("lang")?.value;
  return value === "bn" ? "bn" : "en";
}

export async function getDict() {
  const lang = await getLang();
  return { lang, t: dict[lang] };
}
