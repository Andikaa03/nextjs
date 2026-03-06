
import { fetchAPI, getStrapiLocale } from '@/lib/strapi';

export async function getArticles(params = {}, locale = 'bn') {
  const strapiLocale = getStrapiLocale(locale);
  const defaultParams = {
    'populate[0]': 'cover',
    'populate[1]': 'author',
    'populate[2]': 'category',
    sort: ['createdAt:desc'],
    locale: strapiLocale,
  };

  const queryParams = new URLSearchParams({
    ...defaultParams,
    ...params,
  });

  return await fetchAPI(`/articles?${queryParams}`);
}

export async function getArticleBySlug(slug, locale = 'bn') {
  const strapiLocale = getStrapiLocale(locale);
  const queryParams = new URLSearchParams({
    'filters[slug][$eq]': slug,
    'populate': '*',
    'locale': strapiLocale,
  });
  const data = await fetchAPI(`/articles?${queryParams}`);
  return data?.data?.[0] || null;
}

export async function getArticleBySlugPreview(slug, locale = 'bn-BD') {
  // getStrapiLocale maps 'bn' -> 'bn-BD'. Passing 'bn-BD' directly falls through unchanged.
  const strapiLocale = getStrapiLocale(locale) || locale;
  // Strapi v5 uses status=draft instead of deprecated publicationState=preview
  const queryParams = new URLSearchParams({
    'filters[slug][$eq]': slug,
    'populate[0]': 'cover',
    'populate[1]': 'author',
    'populate[2]': 'category',
    'populate[3]': 'tags',
    'populate[4]': 'blocks',
    'populate[5]': 'seo.shareImage',
    'locale': strapiLocale,
    'status': 'draft',
  });
  const url = `/articles?${queryParams}`;
  console.log('Fetching preview article by slug:', url);
  const data = await fetchAPI(url);
  console.log('Preview article data length:', data?.data?.length);
  return data?.data?.[0] || null;
}

export async function getArticleByDocumentIdPreview(documentId, locale) {
  // getStrapiLocale maps 'bn' -> 'bn-BD'. Passing 'bn-BD' directly falls through unchanged.
  const strapiLocale = locale ? (getStrapiLocale(locale) || locale) : null;
  // Strapi v5 uses status=draft
  const queryParams = new URLSearchParams({
    'filters[documentId][$eq]': documentId,
    'populate[0]': 'cover',
    'populate[1]': 'author',
    'populate[2]': 'category',
    'populate[3]': 'tags',
    'populate[4]': 'blocks',
    'populate[5]': 'seo.shareImage',
    'status': 'draft',
  });
  if (strapiLocale) {
    queryParams.append('locale', strapiLocale);
  }
  const url = `/articles?${queryParams}`;
  console.log('Fetching preview article by documentId:', url);
  try {
      const data = await fetchAPI(url);
      console.log('Preview article data (by documentId):', data?.data?.length);
      return data?.data?.[0] || null;
  } catch (e) {
      console.warn('Failed to fetch by documentId:', e);
      return null;
  }
}


export async function getLatestArticles(page = 1, limit = 5, locale = 'bn') {
  const strapiLocale = getStrapiLocale(locale);
  const queryParams = new URLSearchParams({
    'populate[0]': 'cover',
    'populate[1]': 'author',
    'populate[2]': 'category',
    'pagination[page]': page,
    'pagination[pageSize]': limit,
    'sort': 'createdAt:desc',
    'locale': strapiLocale,
  });

  return await fetchAPI(`/articles?${queryParams}`);
}

export async function getRelatedArticles(categorySlug, currentArticleId, limit = 4, locale = 'bn') {
    const strapiLocale = getStrapiLocale(locale);
    const queryParams = new URLSearchParams({
        'filters[category][slug][$eq]': categorySlug,
        'filters[id][$ne]': currentArticleId,
        'populate': 'cover',
        'pagination[limit]': limit,
        'sort': 'publishedAt:desc',
        'locale': strapiLocale
    });
    return await fetchAPI(`/articles?${queryParams}`);
}

// Helper: create a section query function that filters by a boolean flag
function createSectionFetcher(flagName, defaultLimit = 10) {
  return async function(limit = defaultLimit, locale = 'bn') {
    const strapiLocale = getStrapiLocale(locale);
    try {
      const queryParams = new URLSearchParams({
        [`filters[${flagName}][$eq]`]: 'true',
        'populate[0]': 'cover',
        'populate[1]': 'author',
        'populate[2]': 'category',
        'pagination[limit]': limit,
        'sort': 'createdAt:desc',
        'locale': strapiLocale,
      });

      return await fetchAPI(`/articles?${queryParams}`);
    } catch (error) {
      return { data: [] };
    }
  };
}

// Section-specific article fetchers
export const getTopNewsArticles = createSectionFetcher('isTopNews', 5);
export const getHeadlineArticles = createSectionFetcher('isHeadline', 15);
export const getTopSliderArticles = createSectionFetcher('isTopSlider', 10);
export const getMiddleSliderArticles = createSectionFetcher('isMiddleSlider', 10);
export const getMostReadArticles = createSectionFetcher('isMostRead', 10);
export const getPopularNewsArticles = createSectionFetcher('isPopularNews', 10);
export const getTechInnovationArticles = createSectionFetcher('isTechInnovation', 4);
export const getEditorChoiceArticles = createSectionFetcher('isEditorsChoice', 5);
export const getRecentPostArticles = createSectionFetcher('isRecentPost', 20);
export const getRecentReviewArticles = createSectionFetcher('isRecentReview', 7);
export const getAboutPageArticles = createSectionFetcher('isAboutPage', 4);

// Keep old names as aliases for backward compatibility
export const getFeaturedArticles = getTopSliderArticles;
export const getSliderArticles = getTopSliderArticles;
export const getTrendingNews = getHeadlineArticles;
export const getPopularArticles = getPopularNewsArticles;
export const getMostViewedArticles = getMostReadArticles;
export const getReviewArticles = getRecentReviewArticles;
export const getEditorPicks = getEditorChoiceArticles;

// Category-filtered section fetchers for sidebar
function createCategorySectionFetcher(flagName, defaultLimit = 10) {
  return async function(categorySlug, limit = defaultLimit, locale = 'bn') {
    const strapiLocale = getStrapiLocale(locale);
    try {
      const queryParams = new URLSearchParams({
        [`filters[${flagName}][$eq]`]: 'true',
        'filters[category][slug][$eq]': categorySlug,
        'populate[0]': 'cover',
        'populate[1]': 'author',
        'populate[2]': 'category',
        'pagination[limit]': limit,
        'sort': 'createdAt:desc',
        'locale': strapiLocale,
      });
      return await fetchAPI(`/articles?${queryParams}`);
    } catch (error) {
      return { data: [] };
    }
  };
}

export const getMostViewedByCategory = createCategorySectionFetcher('isMostRead', 5);
export const getPopularByCategory = createCategorySectionFetcher('isPopularNews', 5);
export const getTopSliderByCategory = createCategorySectionFetcher('isTopSlider', 10);
export const getHeadlineByCategory = createCategorySectionFetcher('isHeadline', 10);
export const getTopNewsByCategory = createCategorySectionFetcher('isTopNews', 5);

export async function getArticlesByCategorySlug(categorySlug, limit = 20, locale = 'bn') {
  const strapiLocale = getStrapiLocale(locale);
  const queryParams = new URLSearchParams({
    'filters[category][slug][$eq]': categorySlug,
    'populate[0]': 'cover',
    'populate[1]': 'category',
    'populate[2]': 'author',
    'pagination[limit]': limit,
    'sort': 'publishedAt:desc',
    'locale': strapiLocale,
  });

  return await fetchAPI(`/articles?${queryParams}`);
}

export async function getArticlesByCategory(categorySlug, limit = 10, locale = 'bn') {
  const strapiLocale = getStrapiLocale(locale);
  const queryParams = new URLSearchParams({
    'filters[category][slug][$eq]': categorySlug,
    'populate[0]': 'cover',
    'populate[1]': 'author',
    'populate[2]': 'category',
    'pagination[limit]': limit,
    'sort': 'createdAt:desc',
    'locale': strapiLocale,
  });

  return await fetchAPI(`/articles?${queryParams}`);
}

export async function getArticlesByCategoryEnhanced(categorySlug, limit = 10, options = {}, locale = 'bn') {
  const strapiLocale = getStrapiLocale(locale);
  const queryParams = new URLSearchParams({
    'filters[category][slug][$eq]': categorySlug,
    'populate': '*', 
    'pagination[pageSize]': limit,
    'pagination[page]': options.page || 1,
    'sort': options.sort || 'createdAt:desc',
    'locale': strapiLocale,
  });

  return await fetchAPI(`/articles?${queryParams}`);
}


export async function incrementViewCount(articleId, currentViews) {
  try {
    return await fetchAPI(`/articles/${articleId}`, {
      method: 'PUT',
      body: JSON.stringify({
        data: {
          viewCount: (currentViews || 0) + 1,
        },
      }),
    });
  } catch (error) {
    console.error('Error incrementing view count:', error);
    return null;
  }
}

export async function searchArticles(query, limit = 20, page = 1, locale = 'bn') {
  const strapiLocale = getStrapiLocale(locale);
  const queryParams = new URLSearchParams({
    'filters[$or][0][title][$contains]': query,
    'filters[$or][1][content][$contains]': query,
    'populate[0]': 'cover',
    'populate[1]': 'category',
    'populate[2]': 'author',
    'pagination[page]': page,
    'pagination[pageSize]': limit,
    'sort': 'publishedAt:desc',
    'locale': strapiLocale,
  });

  return await fetchAPI(`/articles?${queryParams}`);
}
