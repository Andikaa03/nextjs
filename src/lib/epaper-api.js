import { fetchAPI, getStrapiLocale } from './strapi';
import qs from 'qs';

/**
 * Get all ePaper entries, sorted newest first
 * Populates zones with their images
 */
export async function getEpapers(locale = 'bn') {
  const strapiLocale = getStrapiLocale(locale);
  const query = qs.stringify({
    locale: strapiLocale,
    populate: {
      image: true,
      zones: {
        populate: {
          images: true
        }
      }
    },
    sort: ['publishDate:desc'],
    pagination: { pageSize: 100 },
  });
  const res = await fetchAPI(`/epapers?${query}`);
  return res?.data || [];
}


