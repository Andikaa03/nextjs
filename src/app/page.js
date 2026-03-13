"use client"
import StickyBox from "react-sticky-box";
import dynamic from "next/dynamic";
import NewsTicker from "@/components/ltr/news-ticker-carousal/page";
import SunnyWeather from "@/components/ltr/sunny-wether/sunny-weather";
import { useBackgroundImageLoader } from "@/components/ltr/use-background-image/use-background-image";
import Layout from "@/components/ltr/layout/layout";
import useRemoveBodyClass from "@/components/ltr/useEffect-hook/useEffect-hook";
import HomeFeatureCarousal from "@/components/ltr/home-feature-carousal/home-feature-carousal";
import HomeCenterSlider from "@/components/ltr/home-center-slider/home-center-slider";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getTopNewsArticles, getHeadlineArticles, getTopSliderArticles, getMiddleSliderArticles, getMostReadArticles, getPopularNewsArticles, getTechInnovationArticles, getEditorChoiceArticles, getRecentPostArticles, getRecentReviewArticles, getLatestArticles, getArticlesByCategory } from "@/services/articleService";
import { getYoutubeVideos, getActivePoll } from "@/services/mediaService";
import { getGlobalSettings, getTags, getCategories, getTrendingCategories, getAdsManagement } from "@/services/globalService";
import { getWeatherForecast } from "@/services/weatherService";
import { resolveClientLocation } from "@/services/locationService";
import { getStrapiMedia, formatDate, toBengaliNumber } from "@/lib/strapi";
import { localizeLocationLabel } from "@/lib/locationLocalization";

const YoutubeVideo = dynamic(() => import("@/components/ltr/youtube-video/youtube-video"), { ssr: false });
const DatePickerComponents = dynamic(() => import("@/components/ltr/date-picker/date-picker"), { ssr: false });
const PollWidget = dynamic(() => import("@/components/ltr/poll-widget/poll"), { ssr: false });
const Tags = dynamic(() => import("@/components/ltr/tags/tags"), { ssr: false });

// Helper: get article data (supports both v4 and v5)
// Helper: get article data (supports both v4 and v5)
const getArt = (article, locale = 'bn') => {
  const t = dictionary[locale] || dictionary.bn;
  const d = article?.attributes || article || {};
  return {
    title: d.title || '',
    slug: d.slug || '#',
    image: getStrapiMedia(d.cover),
    category: d.category?.data?.attributes?.name || d.category?.name || t.news,
    author: d.author?.data?.attributes?.name || d.author?.name || t.editor,
    date: d.createdAt || d.publishedAt || new Date().toISOString(),
    excerpt: d.excerpt || '',
    videoUrl: d.videoUrl || null,
    rating: d.rating || null,
    id: article?.id || 0,
  };
};

const fmtDate = (dateStr, locale = 'bn') => {
  if (!dateStr) return '';
  // Use the centralized formatDate which enforces Bengali numerals if locale is bn
  return formatDate(dateStr, locale);
};

const fmtWeatherValue = (value, locale = 'bn') => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '--';
  const rounded = Math.round(Number(value));
  return locale === 'bn' ? toBengaliNumber(rounded) : rounded;
};

// ... (rest of page component)
import { useLanguage } from '@/lib/LanguageContext';

// ... (rest of imports)

const dictionary = {
  en: {
    loading: 'Loading...',
    topNews: 'Top News',
    mostRead: 'Most Read',
    popularNews: 'Popular News',
    by: 'By',
    editor: 'Editor',
    news: 'News',
    trendingTopics: 'Trending Topics',
    seeAllCategories: 'See All Categories',
    recentReviews: 'Recent Reviews',
    latestVideoNews: 'Latest Video News',
    latestVideoDesc: 'Watch videos of recent events and important news.',
    techInnovation: 'Tech & Innovation',
    editorsChoice: "Editor's Choice",
    recentArticles: 'Recent Articles',
    weatherCity: 'Dhaka, Bangladesh',
    today: 'Today',
    socialJoin: 'Join',
    socialFollowers: 'Followers',
    socialFans: 'Fans',
    socialSubscribers: 'Subscribers',
    weatherStatic: {
      condition: 'Partly Sunny',
      realFeel: 'Real Feel',
      chanceOfRain: 'Chance of Rain',
      days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    }
  },
  bn: {
    loading: 'লোড হচ্ছে...',
    topNews: 'শীর্ষ সংবাদ',
    topNews: 'শীর্ষ সংবাদ',
    mostRead: 'সর্বাধিক পঠিত',
    popularNews: 'জনপ্রিয় সংবাদ',
    by: 'লিখেছেন:',
    editor: 'সম্পাদক',
    news: 'সংবাদ',
    trendingTopics: 'ট্রেন্ডিং বিষয়',
    seeAllCategories: 'সব বিভাগ দেখুন',
    recentReviews: 'সাম্প্রতিক পর্যালোচনা',
    latestVideoNews: 'সর্বশেষ ভিডিও সংবাদ',
    latestVideoDesc: 'সাম্প্রতিক ঘটনাবলী ও গুরুত্বপূর্ণ সংবাদের ভিডিও দেখুন।',
    techInnovation: 'প্রযুক্তি ও উদ্ভাবন',
    editorsChoice: 'সম্পাদকের পছন্দ',
    recentArticles: 'সাম্প্রতিক নিবন্ধ',
    weatherCity: 'ঢাকা, বাংলাদেশ',
    today: 'আজ',
    socialJoin: 'যোগ দিন',
    socialFollowers: 'অনুসরণকারী',
    socialFans: 'ভক্ত',
    socialSubscribers: 'সাবস্ক্রাইবার',
    weatherStatic: {
      condition: 'আংশিক রৌদ্রোজ্জ্বল',
      realFeel: 'অনুভূত',
      chanceOfRain: 'বৃষ্টির সম্ভাবনা',
      days: ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি']
    }
  }
};

export default function Home() {
  const { locale } = useLanguage();
  const t = dictionary[locale] || dictionary.bn;
  
  // Dummy data for loading state
  // Dummy data for loading state
  const dummyArticles = Array(12).fill({
    title: 'সত্যধারা প্রতিদিনে সর্বশেষ আপডেট দেখুন',
    excerpt: 'দেশ-বিদেশ, রাজনীতি, অর্থনীতি, খেলাধুলা ও প্রযুক্তির গুরুত্বপূর্ণ খবর এক নজরে।',
    slug: '#',
    category: { data: { attributes: { name: 'ক্যাটাগরি' } } },
    author: { name: 'ডেস্ক রিপোর্ট' },
    cover: null, // Set null to trigger getStrapiMedia fallback to '/default.jpg'
    createdAt: new Date().toISOString(),
    id: 'dummy'
  }).map((item, i) => ({ ...item, id: `dummy-${i}` }));

  // State untuk menyimpan data dari API
  const [featured, setFeatured] = useState([]);
  const [popular, setPopular] = useState([]);
  const [trending, setTrending] = useState([]);
  const [latest, setLatest] = useState([]);
  const [topNews, setTopNews] = useState([]);
  const [mostRead, setMostRead] = useState([]);
  const [popularNews, setPopularNews] = useState([]);
  const [youtubeData, setYoutubeData] = useState([]);
  const [pollData, setPollData] = useState(null);
  const [globalSettings, setGlobalSettings] = useState(null);
  const [tags, setTags] = useState([]);
  const [techArticles, setTechArticles] = useState([]);
  const [editorPicks, setEditorPicks] = useState([]);
  const [latestReviews, setLatestReviews] = useState([]);
  const [adsData, setAdsData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [trendingCategories, setTrendingCategories] = useState([]);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [weatherData, setWeatherData] = useState({
    currentTemp: null,
    apparentTemp: null,
    description: '',
    icon: 'partly-cloudy',
    iconClass: 'wi wi-day-cloudy',
    rainChance: null,
    locationLabel: '',
    daily: [],
  });
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPageUrl, setCurrentPageUrl] = useState('');
  const [isRecentFooterLiked, setIsRecentFooterLiked] = useState(false);

  const shareBaseUrl = currentPageUrl || 'https://shottyodharaprotidin.com';
  const shareTitle = t.recentArticles;
  const shareText = locale === 'bn' ? 'সাম্প্রতিক নিবন্ধ দেখুন' : 'Check out recent articles';
  const encodedShareUrl = encodeURIComponent(shareBaseUrl);
  const encodedShareText = encodeURIComponent(shareText);

  const openPopup = (url) => {
    if (typeof window === 'undefined') return;
    window.open(url, '_blank', 'noopener,noreferrer,width=700,height=560');
  };

  const handleShareClick = async (e) => {
    e.preventDefault();
    if (typeof window === 'undefined') return;
    const url = currentPageUrl || window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, text: shareText, url });
        return;
      } catch {
      }
    }

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url);
      } catch {
      }
    }
  };

  const handleLikeClick = (e) => {
    e.preventDefault();
    setIsRecentFooterLiked((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('recentFooterLiked', next ? '1' : '0');
      }
      return next;
    });
  };

  const handleTwitterClick = (e) => {
    e.preventDefault();
    openPopup(`https://twitter.com/intent/tweet?url=${encodedShareUrl}&text=${encodedShareText}`);
  };

  const displayFeatured = isInitialLoading ? dummyArticles : featured;
  const displayPopular = isInitialLoading ? dummyArticles : popular;
  const displayTrending = isInitialLoading ? dummyArticles : trending;
  const displayLatest = isInitialLoading ? dummyArticles : latest;
  const displayTopNews = isInitialLoading ? dummyArticles : topNews;
  const displayMostRead = isInitialLoading ? dummyArticles : mostRead;
  const displayPopularNews = isInitialLoading ? dummyArticles : popularNews;
  const displayTech = isInitialLoading ? dummyArticles : techArticles;
  const displayEditor = isInitialLoading ? dummyArticles : editorPicks;
  const displayReviews = isInitialLoading ? dummyArticles : latestReviews;

  const handlePageChange = async (page) => {
    if (page < 1 || page > totalPages) return;
    setLoading(true); // Optional: show loading indicator specifically for this section
    try {
      const res = await getLatestArticles(page, 20, locale);
      
      if (res && res.data) {
        setLatest(res.data);
        setCurrentPage(page);
      }
      
      // Scroll to the latest articles section if needed
      const element = document.getElementById('latest-articles');
      // if (element) element.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Error changing page:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Remove RTL direction
    document.documentElement.removeAttribute('dir', 'rtl');
    setCurrentPageUrl(window.location.href);
    setIsRecentFooterLiked(window.localStorage.getItem('recentFooterLiked') === '1');
    
    // Fetch data dari API
    async function fetchData() {
      let skeletonReleased = false;
      const releaseSkeleton = () => {
        if (!skeletonReleased) {
          setIsInitialLoading(false);
          skeletonReleased = true;
        }
      };

      try {
        const resolvedLocation = await resolveClientLocation(locale);
        const weatherLat = resolvedLocation?.lat;
        const weatherLon = resolvedLocation?.lon;
        const detectedLocationLabel = resolvedLocation?.fallbackLabel || '';

        const [topSliderRes, middleSliderRes, headlineRes, latestRes] = await Promise.allSettled([
          getTopSliderArticles(10, locale),
          getMiddleSliderArticles(10, locale),
          getHeadlineArticles(15, locale),
          getLatestArticles(1, 20, locale),
        ]);

        setFeatured(topSliderRes.value?.data || []);
        setPopular(middleSliderRes.value?.data || []);
        setTrending(headlineRes.value?.data || []);
        setLatest(latestRes.value?.data || []);
        setTotalPages(latestRes.value?.meta?.pagination?.pageCount || 1);

        releaseSkeleton();

        const [youtubeRes, pollRes, globalRes, tagsRes, topNewsRes, mostReadRes, popularNewsRes, techRes, editorRes, recentPostRes, reviewRes, categoriesRes, trendingRes, adsRes, weatherRes] = await Promise.allSettled([
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
          getAdsManagement(),
          getWeatherForecast(weatherLat, weatherLon, locale),
        ]);

        setYoutubeData(youtubeRes.value?.data || []);
        setPollData(pollRes.value?.data?.[0] || null);
        const globalRaw = globalRes.value?.data || globalRes.value || null;
        const globalData = globalRaw?.attributes || globalRaw;
        setGlobalSettings(globalData);
        setTags(tagsRes.value?.data || []);
        setTopNews(topNewsRes.value?.data || []);
        setMostRead(mostReadRes.value?.data || []);
        setPopularNews(popularNewsRes.value?.data || []);
        setTechArticles(techRes.value?.data || []);
        setEditorPicks(editorRes.value?.data || []);
        setLatest(prev => {
          const recentPostData = recentPostRes.value?.data;
          return (recentPostData && recentPostData.length > 0) ? recentPostData : prev;
        });
        setLatestReviews(reviewRes.value?.data || []);
        setCategories(categoriesRes.value?.data || []);
        setTrendingCategories(trendingRes.value?.data || []);
        const adsRaw = adsRes.value?.data || adsRes.value || null;
        setAdsData(adsRaw);
        if (weatherRes.status === 'fulfilled' && weatherRes.value) {
          const nextWeatherData = { ...weatherRes.value };
          const resolvedLocationLabel = weatherRes.value.locationLabel || detectedLocationLabel || '';
          if (resolvedLocationLabel) {
            nextWeatherData.locationLabel = localizeLocationLabel(resolvedLocationLabel, locale);
          }
          setWeatherData(nextWeatherData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        releaseSkeleton();
      }
    }

    fetchData();
  }, []);

  {/* *** ADD AND REMOVE CLASS ON BODY TAG *** */ }
  useRemoveBodyClass(['home-nine'], ['home-six', 'home-seven', 'boxed-layout', 'layout-rtl']);
  {/* *** IMPORT BACKGROUND IMAGE *** */ }
  useBackgroundImageLoader()
  return (
    <Layout globalSettings={globalSettings}>
      {/* *** START PAGE MAIN CONTENT *** */}
      <main className="page_main_wrapper">
        {/* START NEWSTRICKER */}
        <NewsTicker data={displayTrending} isLoading={false} />
        {/*  END OF /. NEWSTRICKER */}
        {/* START FEATURE SECTION */}
        <div
          className="bg-img feature-section py-4 py-lg-3 py-xl-4"
          data-image-src="/default.jpg"
        >
          <div className="container">
            <HomeFeatureCarousal data={displayFeatured} isLoading={false} />
          </div>
        </div>
        {/* END OF /. FEATURE SECTION */}
        {/* START POST BLOCK SECTION */}
        <section className="slider-inner">
          <div className="container-fluid p-0">
            <div className="row thm-margin">
              <div className="col-md-4 col-xxl-4 thm-padding d-none d-xxl-block">
                <div className="row slider-right-post thm-margin">
                  {(displayFeatured.length > 0 ? displayFeatured.slice(0, 2) : []).map((article, i) => {
                    const a = getArt(article, locale);
                    const heights = ['post-height-4', 'post-height-4'];
                    return (
                      <div key={a.id || `left-${i}`} className={`${i < 2 ? 'col-6 col-sm-6' : 'col-md-12 col-sm-12 d-md-block d-none'} thm-padding`}>
                        <div className={`slider-post ${heights[i] || 'post-height-4'}`}>
                          <Link href={a.slug !== '#' ? `/article/${a.slug}` : '#'} className="news-image">
                            <img src={a.image} alt={a.title} className="img-fluid" onError={(e) => e.target.src = '/default.jpg'} />
                          </Link>
                          <div className="post-text">
                            <span className="post-category">{a.category}</span>
                            <h4>
                              <Link href={a.slug !== '#' ? `/article/${a.slug}` : '#'}>{a.title || t.loading}</Link>
                            </h4>
                            <ul className="align-items-center authar-info d-flex flex-wrap gap-1">
                              <li>{t.by} <span className="editor-name">{a.author}</span></li>
                              <li>{fmtDate(a.date, locale)}</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {displayFeatured.length > 2 && (() => {
                    const a = getArt(displayFeatured[2]);
                    return (
                      <div className="col-md-12 col-sm-12 d-md-block d-none thm-padding">
                        <div className="slider-post post-height-4">
                          <Link href={`/article/${a.slug}`} className="news-image">
                            <img src={a.image} alt={a.title} className="img-fluid" onError={(e) => e.target.src = '/default.jpg'} />
                          </Link>
                          <div className="post-text">
                            <span className="post-category">{a.category}</span>
                            <h4><Link href={`/article/${a.slug}`}>{a.title}</Link></h4>
                            <ul className="align-items-center authar-info d-flex flex-wrap gap-1">
                              <li>{t.by} <span className="editor-name">{a.author}</span></li>
                              <li>{fmtDate(a.date, locale)}</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
              <div className="col-md-6 col-xxl-4 thm-padding">
                <div className="slider-wrapper">
                  <HomeCenterSlider data={displayPopular} isLoading={false} />
                </div>
              </div>
              <div className="col-md-6 col-xxl-4 thm-padding">
                <div className="row slider-right-post thm-margin">
                  {(displayLatest.length > 0 ? displayLatest.slice(0, 3) : []).map((article, i) => {
                    const a = getArt(article, locale);
                    return (
                      <div key={a.id || `right-${i}`} className={`${i === 0 ? 'col-md-12 col-sm-12 d-md-block d-none' : 'col-6 col-sm-6 d-none d-md-block'} thm-padding`}>
                        <div className={`slider-post ${i === 0 ? 'post-height-2' : 'post-height-2'}`}>
                          <Link href={`/article/${a.slug}`} className="news-image">
                            <img src={a.image} alt={a.title} className="img-fluid" onError={(e) => e.target.src = '/default.jpg'} />
                          </Link>
                          <div className="post-text">
                            <span className="post-category">{a.category}</span>
                            <h4><Link href={`/article/${a.slug}`}>{a.title}</Link></h4>
                            <ul className="align-items-center authar-info d-flex flex-wrap gap-1">
                              <li>{t.by} <span className="editor-name">{a.author}</span></li>
                              <li>{fmtDate(a.date, locale)}</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* END OF /. POST BLOCK SECTION */}
        <div className="container">
          <div className="row gx-lg-5">
            {/* START MAIN CONTENT */}
            <div className="col-md-3 leftSidebar d-none d-xl-block">
              <StickyBox >
                <div className="panel_header">
                  <h4>
                    <strong>{t.topNews}</strong>
                  </h4>
                </div>
                <div className="border-bottom posts">
                  <ul>
                    {(displayTopNews.length > 0 ? displayTopNews.slice(0, 3) : []).map((article, i) => {
                      const a = getArt(article, locale);
                      return (
                        <li key={a.id || `ts-${i}`} className={`${i === 2 ? 'd-none d-xl-block ' : ''}post-grid`}>
                          <div className="posts-inner px-0">
                            <h6 className="posts-title">
                              <Link href={`/article/${a.slug}`}>{a.title}</Link>
                            </h6>
                            <ul className="align-items-center authar-info d-flex flex-wrap gap-1">
                              <li><span className="post-category">{a.category}</span></li>
                              <li>{fmtDate(a.date, locale)}</li>
                            </ul>
                            <p>{a.excerpt}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                {/* START NAV TABS */}
                <div className={`tabs-wrapper ${locale === 'bn' ? 'tabs-wrapper-bn' : 'tabs-wrapper-en'}`}>
                  <ul className="nav nav-tabs" id="myTab" role="tablist">
                    <li className="nav-item" role="presentation">
                      <button className="nav-link border-0 active" id="most-viewed" data-bs-toggle="tab" data-bs-target="#most-viewed-pane" type="button" role="tab" aria-controls="most-viewed-pane" aria-selected="true">
                        {t.mostRead}
                      </button>
                    </li>
                    <li className="nav-item" role="presentation">
                      <button className="nav-link border-0" id="popular-news" data-bs-toggle="tab" data-bs-target="#popular-news-pane" type="button" role="tab" aria-controls="popular-news-pane" aria-selected="false">
                        {t.popularNews}
                      </button>
                    </li>
                  </ul>
                  <div className="tab-content" id="myTabContent">
                    <div className="tab-pane fade show active" id="most-viewed-pane" role="tabpanel" aria-labelledby="most-viewed" tabIndex={0}>
                      <div className="most-viewed">
                        <ul id="most-today" className="content tabs-content">
                          {(displayMostRead.length > 0 ? displayMostRead.slice(0, 5) : []).map((article, i) => {
                            const a = getArt(article, locale);
                            return (
                              <li key={a.id || `mv-${i}`}>
                                <span className="count">{String(i + 1).padStart(2, '0')}</span>
                                <span className="text">
                                  <Link href={`/article/${a.slug}`}>{a.title}</Link>
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                    <div className="tab-pane fade" id="popular-news-pane" role="tabpanel" aria-labelledby="popular-news" tabIndex={0}>
                      <div className="popular-news">
                        {(displayPopularNews.length > 0 ? displayPopularNews.slice(0, 5) : []).map((article, i) => {
                          const a = getArt(article, locale);
                          return (
                            <div key={a.id || `pn-${i}`} className="p-post">
                              <h4><Link href={`/article/${a.slug}`}>{a.title}</Link></h4>
                              <ul className="authar-info d-flex flex-wrap justify-content-center">
                                <li className="date"><i className="ti ti ti-timer" /> {fmtDate(a.date, locale)}</li>
                              </ul>
                              {a.rating > 0 && (
                              <div className="reatting-2">
                                {[1,2,3,4,5].map(star => (
                                  <i key={star} className={`fas ${a.rating >= star ? 'fa-star' : a.rating >= star - 0.5 ? 'fa-star-half-alt' : 'far fa-star'}`} />
                                ))}
                              </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
                {/* END OF /. NAV TABS */}
              </StickyBox>
            </div>
            <div className="col-sm-7 col-md-8 col-xl-6 border-start border-end main-content">
              <StickyBox>
                {/* START POST CATEGORY STYLE ONE (Popular news) */}
                <div className="post-inner">
                  {/* post body */}
                  <div className="post-body py-0">
                    {displayPopular.length > 0 && (() => {
                      const a = getArt(displayPopular[0]);
                      return (
                        <article>
                          <figure>
                            <Link href={`/article/${a.slug}`}>
                              <img src={a.image} width={345} alt={a.title} className="img-fluid" onError={(e) => e.target.src = '/default.jpg'} />
                            </Link>
                          </figure>
                          <div className="post-info">
                            <h3 className="fs-4"><Link href={`/article/${a.slug}`}>{a.title}</Link></h3>
                            <ul className="align-items-center authar-info d-flex flex-wrap gap-1">
                              <li><span className="post-category mb-0">{a.category}</span></li>
                              <li>{t.by} <span className="editor-name">{a.author}</span></li>
                              <li>{fmtDate(a.date, locale)}</li>
                            </ul>
                            <p>{a.excerpt}</p>
                          </div>
                        </article>
                      );
                    })()}
                  </div>
                </div>
                {/* END OF /. POST CATEGORY STYLE ONE (Popular news) */}
                <div className="news-grid-2 border-top pt-4 mb-4">
                  <div className="row gx-3 gx-lg-4 gy-4">
                    {(displayLatest.length > 3 ? displayLatest.slice(3, 9) : []).map((article, i) => {
                      const a = getArt(article, locale);
                      const iconClass = a.videoUrl ? 'fa-play' : 'fa-camera';
                      return (
                        <div key={a.id || `grid-${i}`} className="col-6 col-md-4 col-sm-6">
                          <div className="grid-item mb-0">
                            <div className="grid-item-img">
                              <Link href={`/article/${a.slug}`}>
                                <img src={a.image} className="img-fluid" alt={a.title} onError={(e) => e.target.src = '/default.jpg'} />
                                <div className="link-icon"><i className={`fa ${iconClass}`} /></div>
                              </Link>
                            </div>
                            <h5><Link href={`/article/${a.slug}`} className="title">{a.title}</Link></h5>
                            <ul className="align-items-center authar-info d-flex flex-wrap gap-1 mb-0">
                              <li>{fmtDate(a.date, locale)}</li>
                            </ul>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* START ADVERTISEMENT */}
                <div className="add-inner">
                  <Link href={adsData?.homeTopBannerLink || '#'}>
                    <img
                      src={getStrapiMedia(adsData?.homeTopBanner) || "/assets/images/add728x90-1.jpg"}
                      className="img-fluid"
                      alt="Banner Ad"
                    />
                  </Link>
                </div>
                {/* END OF /. ADVERTISEMENT */}
              </StickyBox>
            </div>
            {/* END OF /. MAIN CONTENT */}
            {/* START SIDE CONTENT */}
            <div className={`col-sm-5 col-md-4 col-xl-3 rightSidebar ${locale === 'bn' ? 'rightSidebar-locale-bn' : 'rightSidebar-locale-en'}`}>
              <StickyBox>
                {/* START SOCIAL COUNTER TEXT */}
                <div className="align-items-center d-flex fs-6 justify-content-center mb-1 text-center social-counter-total">
                  <i className="fa-solid fa-heart text-primary me-1" /> {t.socialJoin}{" "}
                  <span className="fw-bold mx-1">{globalSettings?.socialTotalFollowers || '0'}</span> {t.socialFollowers}
                </div>
                {/* END OF /. SOCIAL COUNTER TEXT */}
                {/* START SOCIAL ICON */}
                <div className="social-media-inner">
                  <ul className="g-1 row social-media">
                    <li className="col-4">
                      <a href={globalSettings?.socialRssUrl || '#'} className="rss" target="_blank">
                        <i className="fas fa-rss" />
                        <div>{globalSettings?.socialRssSubscribers || 0}</div>
                        <p className="follower-label-text">{t.socialSubscribers}</p>
                      </a>
                    </li>
                    <li className="col-4">
                      <a href={globalSettings?.socialFacebookUrl || '#'} className="fb" target="_blank">
                        <i className="fab fa-facebook-f" />
                        <div>{globalSettings?.socialFacebookFans || 0}</div>
                        <p className="follower-label-text">{t.socialFans}</p>
                      </a>
                    </li>
                    <li className="col-4">
                      <a href={globalSettings?.socialInstagramUrl || '#'} className="insta" target="_blank">
                        <i className="fab fa-instagram" />
                        <div>{globalSettings?.socialInstagramFollowers || 0}</div>
                        <p className="follower-label-text">{t.socialFollowers}</p>
                      </a>
                    </li>
                    <li className="col-4">
                      <a href={globalSettings?.socialYoutubeUrl || '#'} className="you_tube" target="_blank">
                        <i className="fab fa-youtube" />
                        <div>{globalSettings?.socialYoutubeSubscribers || 0}</div>
                        <p className="follower-label-text">{t.socialSubscribers}</p>
                      </a>
                    </li>
                    <li className="col-4">
                      <a href={globalSettings?.socialTwitterUrl || '#'} className="twitter" target="_blank">
                        <i className="fab fa-twitter" />
                        <div>{globalSettings?.socialTwitterFollowers || 0}</div>
                        <p className="follower-label-text">{t.socialFollowers}</p>
                      </a>
                    </li>
                    <li className="col-4">
                      <a href={globalSettings?.socialPinterestUrl || '#'} className="pint" target="_blank">
                        <i className="fab fa-pinterest-p" />
                        <div>{globalSettings?.socialPinterestFollowers || 0}</div>
                        <p className="follower-label-text">{t.socialFollowers}</p>
                      </a>
                    </li>
                  </ul>{" "}
                  {/* /.social icon */}
                </div>
                {/* END OF /. SOCIAL ICON */}
                {/* START TRENDING TOPICS */}
                <div className="panel_inner review-inner">
                  <div className="panel_header">
                    <h4><strong>{t.trendingTopics}</strong></h4>
                  </div>
                  <div className="panel_body">
                    {(() => {
                      const sourceCategories = trendingCategories.length > 0 ? trendingCategories : (categories.length > 0 ? categories : (loading ? Array(5).fill(null) : []));
                      const displayCategories = showAllCategories ? sourceCategories : sourceCategories.slice(0, 5);
                      
                      return (
                        <>
                          {displayCategories.map((cat, i) => {
                            const catData = cat?.attributes || cat;
                            const slug = catData?.slug || '#';
                            const name = catData?.name || '...';
                            const catImage = getStrapiMedia(catData?.featuredImage) || '/default.jpg';
                            return (
                              <div key={cat?.id || `tt-${i}`} className="text-center mb-2 card-bg-scale position-relative overflow-hidden bg-dark-overlay bg-img p-3" data-image-src={catImage}>
                                <Link href={slug !== '#' ? `/${slug}` : '#'} className="btn-link fs-5 fw-bold stretched-link text-decoration-none text-white">
                                  {name}
                                </Link>
                              </div>
                            );
                          })}
                          
                          {!showAllCategories && sourceCategories.length > 5 && (
                            <div className="text-center mt-3">
                              <span
                                role="button"
                                onClick={() => setShowAllCategories(true)}
                                className={`text-primary-hover see-all-categories-link ${locale === 'bn' ? 'see-all-categories-link-bn' : ''}`}
                                style={{ cursor: 'pointer' }}
                              >
                                <u>{t.seeAllCategories}</u>
                              </span>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
                {/* END OF /. TRENDING TOPICS */}
                {/* START LATEST REVIEWS */}
                <div className="panel_inner review-inner recent-reviews-panel">
                  <div className="panel_header">
                    <h4><strong>{t.recentReviews}</strong></h4>
                  </div>
                  <div className="panel_body">
                    {displayReviews.length > 0 && (() => {
                      const a = getArt(displayReviews[0]);
                      return (
                        <div className="more-post">
                          <Link href={a.slug !== '#' ? `/article/${a.slug}` : '#'} className="news-image">
                            <img src={a.image} alt={a.title} className="img-fluid w-100" onError={(e) => e.target.src = '/default.jpg'} />
                          </Link>
                          {a.rating > 0 && (
                          <div className="reatting">
                            {[1,2,3,4,5].map(star => (
                              <i key={star} className={a.rating >= star ? 'fa fa-star' : a.rating >= star - 0.5 ? 'fa fa-star-half-o' : 'fa fa-star-o'} />
                            ))}
                          </div>
                          )}
                          <div className="post-text">
                            <ul className="align-items-center authar-info d-flex flex-wrap gap-1 mb-1">
                              <li><span className="post-category mb-0">{a.category}</span></li>
                              <li>{fmtDate(a.date, locale)}</li>
                            </ul>
                            <h4 className="mb-0">{a.title}</h4>
                          </div>
                        </div>
                      );
                    })()}
                    <div className="mt-4 news-list">
                      {(displayReviews.length > 1 ? displayReviews.slice(1, 4) : []).map((article, i) => {
                        const a = getArt(article);
                        return (
                          <div key={a.id || `rv-${i}`} className={`news-list-item p-0 ${i < 2 ? 'mb-4' : ''}`}>
                            <div className="img-wrapper">
                              <Link href={a.slug !== '#' ? `/article/${a.slug}` : '#'} className="thumb">
                                <img src={a.image} alt={a.title} className="img-fluid" onError={(e) => e.target.src = '/default.jpg'} />
                                {a.videoUrl && <div className="link-icon"><i className="fa fa-play" /></div>}
                              </Link>
                            </div>
                            <div className="post-info-2">
                              <h5><Link href={a.slug !== '#' ? `/article/${a.slug}` : '#'} className="title">{a.title}</Link></h5>
                              {a.rating > 0 && (
                              <div className="reviews-reatting">
                                {[1,2,3,4,5].map(star => (
                                  <i key={star} className={`fas ${a.rating >= star ? 'fa-star' : a.rating >= star - 0.5 ? 'fa-star-half-alt' : 'far fa-star'}`} />
                                ))}
                              </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                {/* END OF /. LATEST REVIEWS */}
              </StickyBox>
            </div>
            {/* END OF /. SIDE CONTENT */}
          </div>
        </div>
        {/* START YOUTUBE VIDEO */}
        <div className="mb-4 py-5 position-relative video-section">
          <div className="container">
            <div className="row justify-content-center mb-5">
              <div className="col-md-6 text-center">
                <h3 className="text-white latest-video-title">{t.latestVideoNews}</h3>
                <p className="text-white mb-0 latest-video-desc">
                  {t.latestVideoDesc}
                </p>
              </div>
            </div>
            <YoutubeVideo data={youtubeData} isLoading={false} />
          </div>
        </div>
        {/* END OF /. YOUTUBE VIDEO */}
        <section className="articles-wrapper">
          <div className="container">
            <div className="row gx-lg-5">
              <div className={`col-md-3 leftSidebar d-none d-lg-block ${locale === 'bn' ? 'leftSidebar-locale-bn' : 'leftSidebar-locale-en'}`}>
                <StickyBox>
                  {/* START TECH & INNOVATION */}
                  <div className="panel_inner tech-innovation-panel">
                    <div className="panel_header">
                      <h4><strong>{t.techInnovation}</strong></h4>
                    </div>
                    <div className="panel_body">
                      {displayTech.length > 0 && (() => {
                        const a = getArt(displayTech[0]);
                        return (
                          <div className="border-bottom">
                            <Link href={a.slug !== '#' ? `/article/${a.slug}` : '#'} className="d-block mb-3">
                              <img src={a.image} alt={a.title} className="img-fluid w-100" onError={(e) => e.target.src = '/default.jpg'} />
                            </Link>
                            <h5><Link href={a.slug !== '#' ? `/article/${a.slug}` : '#'}>{a.title}</Link></h5>
                            <ul className="align-items-center authar-info d-flex flex-wrap gap-1">
                              <li><span className="post-category mb-0">{a.category}</span></li>
                              <li>{fmtDate(a.date, locale)}</li>
                            </ul>
                            <p>{a.excerpt}</p>
                          </div>
                        );
                      })()}
                      {(displayTech.length > 1 ? displayTech.slice(1, 4) : []).map((article, i) => {
                        const a = getArt(article);
                        return (
                          <div key={a.id || `tech-${i}`} className={`${i < 2 ? 'border-bottom ' : ''}${i === 2 ? 'pb-0 ' : ''}py-3`}>
                            <h6 className="posts-title"><Link href={a.slug !== '#' ? `/article/${a.slug}` : '#'}>{a.title}</Link></h6>
                            <ul className="align-items-center authar-info d-flex flex-wrap gap-1 mb-0">
                              <li>{fmtDate(a.date, locale)}</li>
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {/* END OF /. TECH & INNOVATION */}
                  {/* START EDITOR'S PICKS */}
                  <div className="panel_inner mb-0 editor-picks-panel">
                    <div className="panel_header">
                      <h4><strong>{t.editorsChoice}</strong></h4>
                    </div>
                    <div className="panel_body">
                      {displayEditor.length > 0 && (() => {
                        const a = getArt(displayEditor[0]);
                        return (
                          <div className="border-bottom">
                            <Link href={a.slug !== '#' ? `/article/${a.slug}` : '#'} className="d-block mb-3">
                              <img src={a.image} alt={a.title} className="img-fluid" onError={(e) => e.target.src = '/default.jpg'} />
                            </Link>
                            <h5><Link href={a.slug !== '#' ? `/article/${a.slug}` : '#'}>{a.title}</Link></h5>
                            <ul className="align-items-center authar-info d-flex flex-wrap gap-1">
                              <li><span className="post-category mb-0">{a.category}</span></li>
                              <li>{fmtDate(a.date, locale)}</li>
                            </ul>
                            <p>{a.excerpt}</p>
                          </div>
                        );
                      })()}
                      {(displayEditor.length > 1 ? displayEditor.slice(1, 4) : []).map((article, i) => {
                        const a = getArt(article);
                        return (
                          <div key={a.id || `ep-${i}`} className={`${i < 2 ? 'border-bottom ' : ''}${i === 2 ? 'pb-0 ' : ''}py-3`}>
                            <h6 className="posts-title"><Link href={a.slug !== '#' ? `/article/${a.slug}` : '#'}>{a.title}</Link></h6>
                            <ul className="align-items-center authar-info d-flex flex-wrap gap-1 mb-0">
                              <li>{fmtDate(a.date, locale)}</li>
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {/* END OF /. EDITOR'S PICKS */}
                </StickyBox>
              </div>
              <div className="col-sm-7 col-md-8 col-xl-6 border-start border-end main-content">
                <StickyBox>
                  {/* START POST CATEGORY STYLE FOUR (Latest articles ) */}
                  <div className={`post-inner recent-articles-panel ${locale === 'bn' ? 'recent-articles-panel-bn' : 'recent-articles-panel-en'}`}>
                    {/*post header*/}
                    <div className="post-head">
                      <h2 className="title recent-articles-title">{t.recentArticles}</h2>
                    </div>
                    {/* post body */}
                    <div className="post-body">
                      {(displayLatest.length > 0 ? displayLatest.slice(0, 5) : []).map((article, i) => {
                        const a = getArt(article);
                        return (
                          <div key={a.id || `la-${i}`} className="news-list-item articles-list">
                            <div className="img-wrapper">
                              <div className="align-items-center bg-primary d-flex justify-content-center position-absolute rounded-circle text-white trending-post z-1">
                                <i className="fa-solid fa-bolt-lightning" />
                              </div>
                              <Link href={`/article/${a.slug}`} className="thumb">
                                <img src={a.image} alt={a.title} className="img-fluid w-100" onError={(e) => e.target.src = '/default.jpg'} />
                              </Link>
                            </div>
                            <div className="post-info-2">
                              <h4><Link href={`/article/${a.slug}`} className="title">{a.title}</Link></h4>
                              <ul className="align-items-center authar-info d-flex flex-wrap gap-1">
                                <li><span className="post-category mb-0">{a.category}</span></li>
                                <li>{t.by} <span className="editor-name">{a.author}</span></li>
                                <li>{fmtDate(a.date, locale)}</li>
                              </ul>
                              <p className="d-lg-block d-none">{a.excerpt}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>{" "}
                    {/* /. post body */}
                    {/*Post footer*/}
                    <div className="post-footer">
                      <div className="row thm-margin">
                        <div className="col-md-8 thm-padding">
                          {/* pagination */}
                          {totalPages > 1 && (
                            <ul className="pagination">
                              <li className={`${currentPage === 1 ? 'disabled' : ''}`}>
                                {currentPage === 1 ? (
                                  <span className="ti ti-angle-left" />
                                ) : (
                                  <a href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }}>
                                    <span className="ti ti-angle-left" />
                                  </a>
                                )}
                              </li>
                              
                              {(() => {
                                const pages = [];
                                const maxVisible = 5;
                                
                                if (totalPages <= maxVisible + 1) {
                                  for (let i = 1; i <= totalPages; i++) {
                                    pages.push(i);
                                  }
                                } else {
                                  let startPage, endPage;
                                  
                                  if (currentPage <= 3) {
                                    startPage = 1;
                                    endPage = 5;
                                  } else if (currentPage >= totalPages - 2) {
                                    startPage = totalPages - 4;
                                    endPage = totalPages;
                                  } else {
                                    startPage = currentPage - 2;
                                    endPage = currentPage + 2;
                                  }
                                  
                                  if (startPage < 1) { startPage = 1; endPage = 5; }
                                  if (endPage > totalPages) { endPage = totalPages; startPage = totalPages - 4; }

                                  for (let i = startPage; i <= endPage; i++) {
                                    pages.push(i);
                                  }
                                  
                                  if (endPage < totalPages) {
                                     pages.push('...');
                                     pages.push(totalPages);
                                  }
                                }

                                return pages.map((page, index) => (
                                  <li key={index} className={`${currentPage === page ? 'active' : ''} ${page === '...' ? 'disabled' : ''}`}>
                                    {page === '...' ? (
                                      <span className="extend">...</span>
                                    ) : currentPage === page ? (
                                      <span>{page}</span>
                                    ) : (
                                      <a href="#" onClick={(e) => { e.preventDefault(); handlePageChange(page); }}>
                                        {page}
                                      </a>
                                    )}
                                  </li>
                                ));
                              })()}

                              <li className={`${currentPage === totalPages ? 'disabled' : ''}`}>
                                {currentPage === totalPages ? (
                                  <span className="ti ti-angle-right" />
                                ) : (
                                  <a href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }}>
                                    <i className="ti ti-angle-right" />
                                  </a>
                                )}
                              </li>
                            </ul>
                          )}{" "}
                          {/* /.pagination */}
                        </div>
                        <div className="col-md-4 d-md-block d-none thm-padding">
                          <div className="social">
                            <ul>
                              <li>
                                <div className="share transition">
                                  <a
                                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodedShareUrl}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ico fb"
                                  >
                                    <i className="fab fa-facebook-f" />
                                  </a>
                                  <a
                                    href={`https://twitter.com/intent/tweet?url=${encodedShareUrl}&text=${encodedShareText}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ico tw"
                                  >
                                    <i className="fab fa-twitter" />
                                  </a>
                                  <a
                                    href={globalSettings?.socialRssUrl || '/feed.xml'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ico rs"
                                  >
                                    <i className="fas fa-rss" />
                                  </a>
                                  <a
                                    href={`https://pinterest.com/pin/create/button/?url=${encodedShareUrl}&description=${encodeURIComponent(shareTitle)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ico pin"
                                  >
                                    <i className="fab fa-pinterest-p" />
                                  </a>
                                  <a href="#" onClick={handleShareClick} className="ico-share" aria-label={locale === 'bn' ? 'শেয়ার করুন' : 'Share'}>
                                    <i className="ti ti-share ico-share" />
                                  </a>
                                </div>
                              </li>
                              <li>
                                <a href="#" onClick={handleLikeClick} aria-label={locale === 'bn' ? 'লাইক' : 'Like'}>
                                  <i className={`ti ti-heart ${isRecentFooterLiked ? 'text-primary' : ''}`} />
                                </a>
                              </li>
                              <li>
                                <a
                                  href={`https://twitter.com/intent/tweet?url=${encodedShareUrl}&text=${encodedShareText}`}
                                  onClick={handleTwitterClick}
                                  aria-label={locale === 'bn' ? 'টুইটারে শেয়ার করুন' : 'Share on X'}
                                >
                                  <i className="ti ti-twitter" />
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>{" "}
                    {/* /.Post footer*/}
                  </div>
                  {/* END OF /. POST CATEGORY STYLE FOUR (Latest articles ) */}
                  {/* START ADVERTISEMENT */}
                  <div className="add-inner mb-0">
                    <Link href={adsData?.homeSecondBannerLink || '#'}>
                      <img
                        src={getStrapiMedia(adsData?.homeSecondBanner) || "/assets/images/add/sidebar.jpg"}
                        className="img-fluid"
                        alt="Banner Ad"
                      />
                    </Link>
                  </div>
                  {/* END OF /. ADVERTISEMENT */}
                </StickyBox>
              </div>
              <div className="col-sm-5 col-md-4 col-xl-3 rightSidebar">
                <StickyBox>
                  {/* START WEATHER */}
                  <div className="weather-wrapper-2 weather-bg-2">
                    <div className="weather-temperature">
                      <div className="weather-now">
                        <span className="big-degrees">{fmtWeatherValue(weatherData.currentTemp, locale)}</span>
                        <span className="circle">°</span>
                        <span className="weather-unit">C</span>
                      </div>
                      <div className="weather-icon-2">
                        <SunnyWeather icon={weatherData.icon || 'partly-cloudy'} />
                      </div>
                    </div>
                    <div className="weather-info">
                      <div className="weather-name">{weatherData.description || t.weatherStatic.condition}</div>
                      <span className="weather-real-feel">
                        <span className="weather-real-feel-label">{t.weatherStatic.realFeel}:</span>{' '}
                        <span className="weather-real-feel-value">{fmtWeatherValue(weatherData.apparentTemp, locale)}</span>{' '}
                        <sup>°</sup>
                      </span>
                      <span>
                        {t.weatherStatic.chanceOfRain}: {weatherData.rainChance === null || weatherData.rainChance === undefined
                          ? '--'
                          : `${fmtWeatherValue(weatherData.rainChance, locale)}%`}
                      </span>
                    </div>
                    <div className="weather-week-2">
                      {t.weatherStatic.days.map((dayLabel, index) => {
                        const day = weatherData.daily?.[index] || {};
                        return (
                          <div className="weather-days" key={`weather-day-${index}`}>
                            <div className={`day-${index}`}>{dayLabel}</div>
                            <div className="day-icon">
                              <i className={day.iconClass || "wi wi-day-cloudy"} />
                            </div>
                            <div className="day-degrees">
                              <span className={`degrees-${index}`}>{fmtWeatherValue(day.maxTemp, locale)}</span>
                              <span className="circle">°</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="weather-footer">
                      <div className="weather-date">{formatDate(new Date().toISOString(), locale)}</div>
                      <div className="weather-city">{weatherData.locationLabel || t.weatherCity}</div>
                    </div>
                  </div>
                  {/* END OF /. WEATHER */}
                  {/* START ADVERTISEMENT */}
                  <div className="add-inner">
                    <Link href={adsData?.homeSidebarBannerLink || '#'} target="_blank">
                      <img
                        src={getStrapiMedia(adsData?.homeSidebarBanner) || "/assets/images/add/sidebar.jpg"}
                        className="img-fluid"
                        alt="Sidebar Banner"
                      />
                    </Link>
                  </div>
                  {/* END OF /. ADVERTISEMENT */}
                  {/* START ARCHIVE */}
                  <div className="archive-wrapper">
                    <DatePickerComponents />
                  </div>
                  {/* END OF /. ARCHIVE */}
                  {/* START POLL WIDGET */}
                  <PollWidget data={pollData} isLoading={false} />
                  {/* END OF /. POLL WIDGET */}
                  {/* START TAGS */}
                  <Tags data={tags} isLoading={false} />
                  {/* END OF /. TAGS */}
                </StickyBox>
              </div>
            </div>
          </div>
        </section>
      </main>
      {/* *** END OF /. PAGE MAIN CONTENT *** */}

    </Layout>

  )
}
