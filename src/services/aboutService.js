
import { fetchAPI, getStrapiLocale } from '@/lib/strapi';

export async function getAboutData(locale = 'bn') {
  const strapiLocale = getStrapiLocale(locale);
  try {
    const queryParams = new URLSearchParams({
      'locale': strapiLocale,
      'populate[heroImage][fields][0]': 'url',
      'populate[heroImage][fields][1]': 'alternativeText',
      'populate[teamMembers][populate][photo][fields][0]': 'url',
      'populate[teamMembers][populate][photo][fields][1]': 'alternativeText',
      'populate[teamMembers][populate][socialLinks]': '*',
    });

    return await fetchAPI(`/about?${queryParams}`);
  } catch (error) {
    console.warn('getAboutData failed:', error);
    return { data: null };
  }
}
