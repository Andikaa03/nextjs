import { fetchAPI } from '@/lib/strapi';

/**
 * Get share counts for an article.
 * GET /api/share-counts/by-article/:articleId
 */
export async function getShareCounts(articleId) {
  try {
    const response = await fetchAPI(`/share-counts/by-article/${articleId}`);
    return response?.data || { facebook: 0, twitter: 0, linkedin: 0, pinterest: 0, whatsapp: 0, likes: 0 };
  } catch (error) {
    console.error('Failed to fetch share counts:', error);
    return { facebook: 0, twitter: 0, linkedin: 0, pinterest: 0, whatsapp: 0, likes: 0 };
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

export async function decrementShareCount(articleId, platform) {
  try {
    const response = await fetchAPI('/share-counts/decrement', {
      method: 'POST',
      body: JSON.stringify({ articleId, platform }),
    });
    return response?.data || null;
  } catch (error) {
    console.error('Failed to decrement share count:', error);
    return null;
  }
}

export async function getLikeCount(articleId) {
  const counts = await getShareCounts(articleId);
  return Number(counts?.likes ?? counts?.linkedin ?? 0);
}

export async function incrementLikeCount(articleId) {
  const likeResponse = await incrementShareCount(articleId, 'likes');
  const likeValue = Number(likeResponse?.likes ?? likeResponse?.data?.likes);
  if (Number.isFinite(likeValue)) {
    return likeValue;
  }

  const fallbackResponse = await incrementShareCount(articleId, 'linkedin');
  const fallbackValue = Number(fallbackResponse?.linkedin ?? fallbackResponse?.data?.linkedin);
  return Number.isFinite(fallbackValue) ? fallbackValue : null;
}

export async function decrementLikeCount(articleId) {
  const likeResponse = await decrementShareCount(articleId, 'likes');
  const likeValue = Number(likeResponse?.likes ?? likeResponse?.data?.likes);
  if (Number.isFinite(likeValue)) {
    return likeValue;
  }

  const fallbackResponse = await decrementShareCount(articleId, 'linkedin');
  const fallbackValue = Number(fallbackResponse?.linkedin ?? fallbackResponse?.data?.linkedin);
  return Number.isFinite(fallbackValue) ? fallbackValue : null;
}
