import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import CategoryPageClient from "./CategoryPageClient";
import { getCategoryInitialData } from "@/lib/category-initial-data";

export const revalidate = 60;

function normalizeLocale(value) {
  return value === "en" ? "en" : "bn";
}

export default async function Page({ params, searchParams }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  const slug = resolvedParams?.slug || "";
  const pageParam = Number(resolvedSearchParams?.page) || 1;

  const cookieStore = await cookies();
  const localeFromCookie = cookieStore.get("NEXT_LOCALE")?.value;
  const locale = normalizeLocale(localeFromCookie);

  const initialData = await getCategoryInitialData(slug, pageParam, locale);

  if (initialData?.isNotFound) {
    notFound();
  }

  return <CategoryPageClient initialData={initialData} slug={slug} page={pageParam} />;
}
