import { fetchAPI, getStrapiLocale } from '@/lib/strapi';

/**
 * Get active polls
 */
export async function getActivePolls(locale = 'bn') {
  const strapiLocale = getStrapiLocale(locale);
  try {
    return await fetchAPI(`/polls?filters[isActive][$eq]=true&populate=*&locale=${strapiLocale}`, {
      cache: 'no-store',
    });
  } catch (error) {
    console.error('Error fetching active polls:', error);
    return { data: [] };
  }
}

/**
 * Vote for a poll option
 */
export async function votePoll(pollId, optionIndex) {
  try {
    const response = await fetchAPI(`/polls/${pollId}/vote`, {
      method: 'PUT',
      body: JSON.stringify({
        optionIndex: optionIndex
      })
    });
    return response;
  } catch (error) {
    console.error('Error voting:', error);
    return { success: false, error: error.message };
  }
}
