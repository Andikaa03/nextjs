
import { fetchAPI, getStrapiLocale } from '@/lib/strapi';

export async function getGlobalSettings(locale = 'bn') {
  const strapiLocale = getStrapiLocale(locale);
  try {
    return await fetchAPI(`/global?populate=*&locale=${strapiLocale}`);
  } catch (error) {
    console.warn("getGlobalSettings failed. Returning empty.", error);
    return { data: null };
  }
}

export async function getAuthors(locale = 'bn') {
  const strapiLocale = getStrapiLocale(locale);
  return fetchAPI(`/authors?populate=*&locale=${strapiLocale}`);
}

export async function getTrendingCategories(limit = 5, locale = 'bn') {
  const strapiLocale = getStrapiLocale(locale);
  try {
      return await fetchAPI(`/categories?populate=*&filters[isTrending][$eq]=true&pagination[limit]=${limit}&locale=${strapiLocale}`);
  } catch (e) {
      console.warn("getTrendingCategories failed. Returning empty.", e);
      return { data: [] };
  }
}
