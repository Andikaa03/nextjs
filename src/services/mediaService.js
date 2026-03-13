import { fetchAPI, getStrapiLocale } from "@/lib/strapi";

/**
 * Get Youtube videos
 * @param {string} locale
 */
export async function getYoutubeVideos(locale = 'bn') {
  const strapiLocale = getStrapiLocale(locale);
  const queryParams = new URLSearchParams({
    locale: strapiLocale,
    'sort[0]': 'createdAt:desc',
    populate: '*',
    'pagination[limit]': 20,
  });

  try {
    const data = await fetchAPI(`/latest-ytvideo-news?${queryParams}`);
    return data;
  } catch {
    return { data: [] };
  }
}

/**
 * Get Active Poll
 * @param {string} locale
 */
export async function getActivePoll(locale = 'bn') {
  const strapiLocale = getStrapiLocale(locale);
  const queryParams = new URLSearchParams({
    locale: strapiLocale,
    'filters[isActive][$eq]': 'true',
    'sort[0]': 'publishedAt:desc',
    populate: '*',
    'pagination[limit]': 1,
  });

  try {
    const data = await fetchAPI(`/polls?${queryParams}`, {
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    return data;
  } catch {
    return { data: [] };
  }
}
