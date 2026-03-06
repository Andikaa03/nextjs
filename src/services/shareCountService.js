import { fetchAPI } from '@/lib/strapi';

/**
 * Get share counts for an article.
 * GET /api/share-counts/by-article/:articleId
 */
export async function getShareCounts(articleId) {
  try {
    const response = await fetchAPI(`/share-counts/by-article/${articleId}`);
    return response?.data || { facebook: 0, twitter: 0, linkedin: 0, pinterest: 0, whatsapp: 0 };
  } catch (error) {
    console.error('Failed to fetch share counts:', error);
    return { facebook: 0, twitter: 0, linkedin: 0, pinterest: 0, whatsapp: 0 };
  }
}

/**
 * Increment share count for a specific platform.
 * POST /api/share-counts/increment
 */
export async function incrementShareCount(articleId, platform) {
  try {
    const response = await fetchAPI('/share-counts/increment', {
      method: 'POST',
      body: JSON.stringify({ articleId, platform }),
    });
    return response?.data || null;
  } catch (error) {
    console.error('Failed to increment share count:', error);
    return null;
  }
}
