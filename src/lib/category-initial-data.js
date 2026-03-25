import { getCategoryBySlug } from "@/services/categoryService";
import {
  getArticlesByCategoryEnhanced,
  getMostViewedByCategory,
  getPopularByCategory,
  getTopSliderByCategory,
  getHeadlineByCategory,
} from "@/services/articleService";
import { getGlobalSettings } from "@/services/globalService";

export async function getCategoryInitialData(slug, page = 1, locale = "bn") {
  if (!slug) {
    return {
      slug: "",
      page: 1,
      locale,
      isNotFound: true,
      categoryName: "",
      featuredImage: null,
      articles: [],
      pagination: null,
      mostViewed: [],
      popularNews: [],
      globalSettings: null,
      sliderData: [],
      gridData: [],
      serverTimestamp: Date.now(),
    };
  }

  const safePage = Number(page) > 0 ? Number(page) : 1;

  try {
    const [
      catData,
      articlesRes,
      globalRes,
      sliderRes,
      gridRes,
      mostViewedRes,
      popularRes,
    ] = await Promise.allSettled([
      getCategoryBySlug(slug, locale),
      getArticlesByCategoryEnhanced(slug, 19, { page: safePage }, locale),
      getGlobalSettings(locale),
      getTopSliderByCategory(slug, 5, locale),
      getHeadlineByCategory(slug, 4, locale),
      getMostViewedByCategory(slug, 5, locale),
      getPopularByCategory(slug, 5, locale),
    ]);

    const category = catData.status === "fulfilled" ? catData.value : null;
    if (!category) {
      return {
        slug,
        page: safePage,
        locale,
        isNotFound: true,
        categoryName: "",
        featuredImage: null,
        articles: [],
        pagination: null,
        mostViewed: [],
        popularNews: [],
        globalSettings: null,
        sliderData: [],
        gridData: [],
        serverTimestamp: Date.now(),
      };
    }

    const articlesData = articlesRes.status === "fulfilled" ? articlesRes.value : null;
    const globalDataRaw = globalRes.status === "fulfilled" ? globalRes.value : null;
    const sliderData = sliderRes.status === "fulfilled" ? sliderRes.value : null;
    const gridData = gridRes.status === "fulfilled" ? gridRes.value : null;
    const mostViewedData = mostViewedRes.status === "fulfilled" ? mostViewedRes.value : null;
    const popularData = popularRes.status === "fulfilled" ? popularRes.value : null;

    const globalRaw = globalDataRaw?.data || globalDataRaw || null;
    const globalSettings = globalRaw?.attributes || globalRaw;

    return {
      slug,
      page: safePage,
      locale,
      isNotFound: false,
      categoryName: category?.attributes?.name || category?.name || slug,
      featuredImage: category?.attributes?.featuredImage || category?.featuredImage || null,
      articles: articlesData?.data || [],
      pagination: articlesData?.meta?.pagination || null,
      mostViewed: mostViewedData?.data || [],
      popularNews: popularData?.data || [],
      globalSettings,
      sliderData: sliderData?.data || [],
      gridData: gridData?.data || [],
      serverTimestamp: Date.now(),
    };
  } catch {
    return {
      slug,
      page: safePage,
      locale,
      isNotFound: true,
      categoryName: "",
      featuredImage: null,
      articles: [],
      pagination: null,
      mostViewed: [],
      popularNews: [],
      globalSettings: null,
      sliderData: [],
      gridData: [],
      serverTimestamp: Date.now(),
    };
  }
}