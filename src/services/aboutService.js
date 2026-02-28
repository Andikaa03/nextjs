
import { fetchAPI, getStrapiLocale } from '@/lib/strapi';

export async function getAboutData(locale = 'bn') {
  const strapiLocale = getStrapiLocale(locale);
  try {
    const queryParams = new URLSearchParams({
      'locale': strapiLocale,
      'populate[heroImage]': '*',
      'populate[logo]': '*',
      'populate[teamMembers][populate][photo]': '*',
      'populate[teamMembers][populate][socialLinks]': '*',
    });

    return await fetchAPI(`/about?${queryParams}`);
  } catch (error) {
    console.warn('getAboutData failed:', error);
    return { data: null };
  }
}
