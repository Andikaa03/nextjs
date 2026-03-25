import { cookies } from "next/headers";
import HomePageClient from "./HomePageClient";
import { getHomeInitialData } from "@/lib/home-initial-data";

export const dynamic = "force-dynamic";

function normalizeLocale(value) {
  return value === "en" ? "en" : "bn";
}

export default async function Page() {
  const cookieStore = await cookies();
  const localeFromCookie = cookieStore.get("NEXT_LOCALE")?.value;
  const locale = normalizeLocale(localeFromCookie);
  const initialData = await getHomeInitialData(locale);
  return <HomePageClient initialData={initialData} />;
}
