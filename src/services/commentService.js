
import { fetchAPI } from '@/lib/strapi';

/**
 * Fetch comments for a specific article using strapi-plugin-comments
 * The plugin exposes: GET /api/comments/api::article.article:<documentId>
 */
export async function getCommentsByArticle(articleDocumentId) {
  try {
    const response = await fetchAPI(
      `/comments/api::article.article:${articleDocumentId}`,
      { silent: true }
    );
    return response || { data: [] };
  } catch (error) {
    console.warn('getCommentsByArticle (plugin) failed:', error);
    return { data: [] };
  }
}

/**
 * Post a new comment using strapi-plugin-comments
 * POST /api/comments/api::article.article:<documentId>
 */
export async function createComment(articleDocumentId, authorName, authorEmail, content, threadOf = null) {
  try {
    const body = {
      author: {
        id: authorEmail,
        name: authorName,
        email: authorEmail,
      },
      content,
    };
    if (threadOf) {
      body.threadOf = threadOf;
    }
    return await fetchAPI(
      `/comments/api::article.article:${articleDocumentId}`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
  } catch (error) {
    console.error('createComment (plugin) failed:', error);
    throw error;
  }
}
