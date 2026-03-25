import {
  getTopNewsArticles,
  getHeadlineArticles,
  getTopSliderArticles,
  getMiddleSliderArticles,
  getMostReadArticles,
  getPopularNewsArticles,
  getTechInnovationArticles,
  getEditorChoiceArticles,
  getRecentPostArticles,
  getRecentReviewArticles,
  getLatestArticles,
} from "@/services/articleService";
import { getYoutubeVideos, getActivePoll } from "@/services/mediaService";
import {
  getGlobalSettings,
  getTags,
  getCategories,
  getTrendingCategories,
  getSidebarCategories,
  getAdsManagement,
  getHeaderTop,
  getMenuItems,
} from "@/services/globalService";
import { getWeatherForecast } from "@/services/weatherService";
import { localizeLocationLabel } from "@/lib/locationLocalization";
import { getCategoriesWithChildren } from "@/services/categoryService";
import { getStrapiMedia } from "@/lib/strapi";
import { getCurrentWeather } from "@/services/weatherService";
import { formatDate } from "@/lib/strapi";

export async function getHomeInitialData(locale = "bn") {
  try {
    const [
      topSliderRes,
      middleSliderRes,
      headlineRes,
      latestRes,
      youtubeRes,
      pollRes,
      globalRes,
      tagsRes,
      topNewsRes,
      mostReadRes,
      popularNewsRes,
      techRes,
      editorRes,
      recentPostRes,
      reviewRes,
      categoriesRes,
      trendingRes,
      sidebarRes,
      adsRes,
      weatherRes,
      headerTopRes,
      headerMenuRes,
      sidebarMenuRes,
      categoryTreeRes,
      headerWeatherRes,
    ] = await Promise.allSettled([
      getTopSliderArticles(10, locale),
      getMiddleSliderArticles(10, locale),
      getHeadlineArticles(15, locale),
      getLatestArticles(1, 20, locale),
      getYoutubeVideos(locale),
      getActivePoll(locale),
      getGlobalSettings(locale),
      getTags(10, locale),
      getTopNewsArticles(5, locale),
      getMostReadArticles(10, locale),
      getPopularNewsArticles(10, locale),
      getTechInnovationArticles(4, locale),
      getEditorChoiceArticles(5, locale),
      getRecentPostArticles(20, locale),
      getRecentReviewArticles(7, locale),
      getCategories(20, locale),
      getTrendingCategories(20, locale),
      getSidebarCategories(20, locale),
      getAdsManagement(),
      getWeatherForecast(undefined, undefined, locale),
      getHeaderTop(locale),
      getMenuItems("header", locale),
      getMenuItems("sidebar", locale),
      getCategoriesWithChildren(locale),
      getCurrentWeather(undefined, undefined, locale),
    ]);

    const latestFallback = latestRes.value?.data || [];
    const recentPostData = recentPostRes.value?.data;
    const initialLatest = recentPostData?.length > 0 ? recentPostData : latestFallback;

    let weatherData = {
      currentTemp: null,
      apparentTemp: null,
      description: "",
      icon: "partly-cloudy",
      iconClass: "wi wi-day-cloudy",
      rainChance: null,
      locationLabel: "",
      daily: [],
    };

    if (weatherRes.status === "fulfilled" && weatherRes.value) {
      weatherData = {
        ...weatherRes.value,
        locationLabel: weatherRes.value.locationLabel
          ? localizeLocationLabel(weatherRes.value.locationLabel, locale)
          : "",
      };
    }

    const globalRaw = globalRes.value?.data || globalRes.value || null;
    const globalData = globalRaw?.attributes || globalRaw;
    const adsRaw = adsRes.value?.data || adsRes.value || null;
    const headerTopData = headerTopRes.value?.data || headerTopRes.value || null;
    const headerMenuItems = headerMenuRes.value?.data || [];
    const headerAttrs = headerMenuRes.value?.attributes || {};
    const mobileMenuItems = headerAttrs.mobileMenu || [];
    const headerLogo = headerAttrs.logo ? getStrapiMedia(headerAttrs.logo, null) : null;
    const sidebarMenuItems = sidebarMenuRes.value?.data || [];
    const sidebarData = sidebarMenuRes.value?.attributes || null;
    const categoryTree = categoryTreeRes.value || [];
    const headerWeather = headerWeatherRes.value || { temp: null, weatherCode: null, icon: "cloudy" };
    const headerCurrentDate = formatDate(new Date().toISOString(), locale, true);

    return {
      locale,
      featured: topSliderRes.value?.data || [],
      popular: middleSliderRes.value?.data || [],
      trending: headlineRes.value?.data || [],
      latest: initialLatest,
      topNews: topNewsRes.value?.data || [],
      mostRead: mostReadRes.value?.data || [],
      popularNews: popularNewsRes.value?.data || [],
      youtubeData: youtubeRes.value?.data || [],
      pollData: pollRes.value?.data?.[0] || null,
      globalSettings: globalData,
      tags: tagsRes.value?.data || [],
      techArticles: techRes.value?.data || [],
      editorPicks: editorRes.value?.data || [],
      latestReviews: reviewRes.value?.data || [],
      adsData: adsRaw,
      categories: categoriesRes.value?.data || [],
      trendingCategories: trendingRes.value?.data || [],
      sidebarCategories: sidebarRes.value?.data || [],
      weatherData,
      totalPages: latestRes.value?.meta?.pagination?.pageCount || 1,
      headerTopData,
      headerMenuItems,
      mobileMenuItems,
      sidebarMenuItems,
      sidebarData,
      categoryTree,
      headerLogo,
      headerWeather,
      headerCurrentDate,
      serverTimestamp: Date.now(),
    };
  } catch {
    return {
      locale,
      featured: [],
      popular: [],
      trending: [],
      latest: [],
      topNews: [],
      mostRead: [],
      popularNews: [],
      youtubeData: [],
      pollData: null,
      globalSettings: null,
      tags: [],
      techArticles: [],
      editorPicks: [],
      latestReviews: [],
      adsData: null,
      categories: [],
      trendingCategories: [],
      sidebarCategories: [],
      weatherData: {
        currentTemp: null,
        apparentTemp: null,
        description: "",
        icon: "partly-cloudy",
        iconClass: "wi wi-day-cloudy",
        rainChance: null,
        locationLabel: "",
        daily: [],
      },
      totalPages: 1,
      headerTopData: null,
      headerMenuItems: [],
      mobileMenuItems: [],
      sidebarMenuItems: [],
      sidebarData: null,
      categoryTree: [],
      headerLogo: null,
      headerWeather: { temp: null, weatherCode: null, icon: "cloudy" },
      headerCurrentDate: "",
    };
  }
}
