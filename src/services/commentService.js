
import { fetchAPI } from '@/lib/strapi';

function isApprovedComment(comment) {
  if (!comment || comment.removed || comment.blocked) return false;

  const status = String(comment.approvalStatus || comment.status || '').toUpperCase();
  if (!status) return true;

  return status === 'APPROVED';
}

function filterApprovedTree(comments) {
  if (!Array.isArray(comments)) return [];

  return comments
    .filter(isApprovedComment)
    .map((comment) => {
      const children = filterApprovedTree(comment.children || []);
      return { ...comment, children };
    });
}

async function fetchLocalComments(documentId, options = {}) {
  if (typeof window === 'undefined' || window.location.hostname !== 'localhost') {
    return null;
  }

  const url = `http://localhost:1337/api/public-comments/${documentId}${options.query || ''}`;
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: options.body,
  });

  if (!response.ok) {
    const error = new Error(`Local comments request failed: ${response.statusText}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

/**
 * Fetch comments for a specific article using custom public Strapi endpoint
 */
export async function getCommentsByArticle(articleDocumentId, locale = 'bn') {
  try {
    const localData = await fetchLocalComments(articleDocumentId, {
      query: `?locale=${encodeURIComponent(locale)}`,
    });
    if (localData !== null) {
      return filterApprovedTree(localData || []);
    }

    const response = await fetchAPI(
      `/public-comments/${articleDocumentId}?locale=${encodeURIComponent(locale)}`,
      { silent: true }
    );
    return filterApprovedTree(response || []);
  } catch (error) {
    // Backward compatibility until Strapi deployment picks up /public-comments routes
    try {
      const fallback = await fetchAPI(
        `/comments/api::article.article:${articleDocumentId}`,
        { silent: true }
      );
      return filterApprovedTree(fallback || []);
    } catch {
      console.warn('getCommentsByArticle failed:', error);
      return [];
    }
  }
}

/**
 * Post a new comment using custom public Strapi endpoint
 */
export async function createComment(articleDocumentId, authorName, authorEmail, content, threadOf = null, locale = 'bn') {
  try {
    const body = {
      author: {
        id: authorEmail,
        name: authorName,
        email: authorEmail,
      },
      content,
      locale,
    };
    if (threadOf) {
      body.threadOf = threadOf;
    }

    try {
      const localData = await fetchLocalComments(articleDocumentId, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (localData !== null) {
        return localData;
      }
    } catch {
      // Fall through to existing proxy-based behavior
    }

    try {
      return await fetchAPI(
        `/public-comments/${articleDocumentId}`,
        {
          method: 'POST',
          body: JSON.stringify(body),
        }
      );
    } catch {
      // Backward compatibility until Strapi deployment picks up /public-comments routes
      return await fetchAPI(
        `/comments/api::article.article:${articleDocumentId}`,
        {
          method: 'POST',
          body: JSON.stringify(body),
        }
      );
    }
  } catch (error) {
    console.error('createComment failed:', error);
    throw error;
  }
}
