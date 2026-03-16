import { fetchAPI, getStrapiLocale } from './strapi';
import qs from 'qs';

/**
 * Get all ePaper entries, sorted newest first
 * Now populates the repeatable zones component and the related article
 */
export async function getEpapers(locale = 'bn') {
  const strapiLocale = getStrapiLocale(locale);
  const query = qs.stringify({
    locale: strapiLocale,
    populate: {
      image: true,
      zones: {
        populate: {
          article: true
        }
      }
    },
    sort: ['createdAt:desc'],
    pagination: { pageSize: 100 },
  });
  const res = await fetchAPI(`/epapers?${query}`);
  return res?.data || [];
}

/**
 * Get a single ePaper article by slug
 */
export async function getEpaperArticleBySlug(slug, locale = 'bn') {
  const strapiLocale = getStrapiLocale(locale);
  const query = qs.stringify({
    locale: strapiLocale,
    filters: { slug: { $eq: slug } },
    populate: '*',
  });
  const res = await fetchAPI(`/epaper-articles?${query}`);
  return res?.data?.[0] || null;
}
