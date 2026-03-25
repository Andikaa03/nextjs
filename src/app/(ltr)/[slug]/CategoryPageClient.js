"use client"

import Layout from '@/components/ltr/layout/layout';
import useRemoveBodyClass from '@/components/ltr/useEffect-hook/useEffect-hook';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import StickyBox from 'react-sticky-box';
import dynamic from 'next/dynamic';
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import 'animate.css/animate.css';
import { getCategoryBySlug } from '@/services/categoryService';
import { getArticlesByCategoryEnhanced, getMostViewedByCategory, getPopularByCategory, getTopSliderByCategory, getHeadlineByCategory } from '@/services/articleService';
import { getGlobalSettings } from '@/services/globalService';
import { getStrapiMedia, formatDate } from '@/lib/strapi';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import Pagination from '@/components/ui/Pagination';
import { useLanguage } from '@/lib/LanguageContext';

const dictionary = {
    en: {
        loading: "Loading...",
        loadingTitle: "Loading: News title will appear here...",
        home: "Home",
        mostViewed: "Most Viewed",
        popularNews: "Popular News",
        join: "Join",
        followers: "Followers",
        subscribers: "Subscribers",
        fans: "Fans",
        noNews: "No news found in this category.",
        by: "by"
    },
    bn: {
        loading: "লোড হচ্ছে...",
        loadingTitle: "লোড হচ্ছে: সংবাদের শিরোনাম এখানে দেখাবে...",
        home: "হোম",
        mostViewed: "সর্বাধিক দেখা",
        popularNews: "জনপ্রিয় সংবাদ",
        join: "যোগ দিন",
        followers: "অনুসরণকারীরা",
        subscribers: "সাবস্ক্রাইবার",
        fans: "ফ্যান",
        noNews: "এই বিভাগে কোনো সংবাদ পাওয়া যায়নি।",
        by: "লিখেছেন:"
    }
};

if (typeof window !== 'undefined') {
    window.$ = window.jQuery = require('jquery');
}
const OwlCarousel = dynamic(() => import('react-owl-carousel'), { ssr: false });

// ---- Helper ----
function getAttr(article) {
    return article?.attributes || article || {};
}

function ArticleCard({ article, categoryName, locale }) {
    const a = getAttr(article);
    const coverUrl = getStrapiMedia(a.cover, '/default.jpg');
    const slug = a.slug || article?.id || '#';
    const title = a.title || '';
    const date = formatDate(a.publishedAt || a.createdAt, locale);
    const catName = categoryName || a.category?.data?.attributes?.name || a.category?.name || '';
    const authorName = a.author?.data?.attributes?.name || a.author?.name || '';
    const { locale: currentLocale } = useLanguage();
    const t = dictionary[currentLocale] || dictionary.bn;

    return (
        <article>
            <figure>
                <Link href={`/article/${slug}`} className="news-image">
                    <ImageWithFallback
                        src={coverUrl}
                        height={242}
                        width={345}
                        alt={title}
                        className="img-fluid"
                    />
                </Link>
                <span className="post-category">{catName}</span>
            </figure>
            <div className="post-info">
                <h3><Link href={`/article/${slug}`}>{title}</Link></h3>
                <ul className="authar-info d-flex flex-wrap">
                    {date && <li><i className="ti ti-timer" /> {date}</li>}
                    {authorName && <li className="authar d-lg-block d-none"><a href="#">{t.by} {authorName}</a></li>}
                </ul>
            </div>
        </article>
    );
}

function SliderItem({ article, categoryName, locale }) {
    const a = getAttr(article);
    const coverUrl = getStrapiMedia(a.cover, '/default.jpg');
    const slug = a.slug || article?.id || '#';
    const title = a.title || '';
    const date = formatDate(a.publishedAt || a.createdAt, locale);
    const catName = categoryName || a.category?.data?.attributes?.name || a.category?.name || '';
    const authorName = a.author?.data?.attributes?.name || a.author?.name || '';
    const { locale: currentLocale } = useLanguage();
    const t = dictionary[currentLocale] || dictionary.bn;
    const views = a.viewCount || 0;

    return (
        <div className="item">
            <div className="slider-post post-height-1">
                <Link href={`/article/${slug}`} className="news-image">
                    <img
                        src={coverUrl}
                        alt={title}
                        className="img-fluid"
                        onError={(e) => { e.target.src = '/default.jpg'; e.target.onerror = null; }}
                    />
                </Link>
                <div className="post-text">
                    <span className="post-category">{catName}</span>
                    <h2><Link href={`/article/${slug}`}>{title}</Link></h2>
                    <ul className="authar-info d-flex flex-wrap">
                        {authorName && <li className="authar"><a href="#">{t.by} {authorName}</a></li>}
                        {date && <li className="date">{date}</li>}
                        {views > 0 && <li className="view"><a href="#">{views} views</a></li>}
                    </ul>
                </div>
            </div>
        </div>
    );
}

function GridItem({ article, categoryName, locale }) {
    const a = getAttr(article);
    const coverUrl = getStrapiMedia(a.cover, '/default.jpg');
    const slug = a.slug || article?.id || '#';
    const title = a.title || '';
    const date = formatDate(a.publishedAt || a.createdAt, locale);
    const catName = categoryName || a.category?.data?.attributes?.name || a.category?.name || '';
    const authorName = a.author?.data?.attributes?.name || a.author?.name || '';
    const { locale: currentLocale } = useLanguage();
    const t = dictionary[currentLocale] || dictionary.bn;

    return (
        <div className="col-6 col-sm-6 thm-padding">
            <div className="slider-post post-height-2">
                <Link href={`/article/${slug}`} className="news-image">
                    <img
                        src={coverUrl}
                        alt={title}
                        className="img-fluid"
                        onError={(e) => { e.target.src = '/default.jpg'; e.target.onerror = null; }}
                    />
                </Link>
                <div className="post-text">
                    <span className="post-category">{catName}</span>
                    <h4><Link href={`/article/${slug}`}>{title}</Link></h4>
                    <ul className="authar-info d-flex flex-wrap">
                        {authorName && <li className="authar d-lg-block d-none"><a href="#">{t.by} {authorName}</a></li>}
                        {date && <li className="d-md-block d-none">{date}</li>}
                    </ul>
                </div>
            </div>
        </div>
    );
}

const carouselOptions = {
    loop: true,
    items: 1,
    dots: true,
    autoplay: true,
    autoplayTimeout: 4000,
    autoplayHoverPause: true,
    nav: true,
    navText: ["<i class='ti ti ti-angle-left'></i>", "<i class='ti ti ti-angle-right'></i>"],
};

function getInitialState(initialData, fallbackSlug = '', fallbackPage = 1) {
    return {
        loading: !initialData,
        isNotFound: initialData?.isNotFound || false,
        categoryName: initialData?.categoryName || '',
        featuredImage: initialData?.featuredImage || null,
        articles: initialData?.articles || [],
        pagination: initialData?.pagination || null,
        mostViewed: initialData?.mostViewed || [],
        popularNews: initialData?.popularNews || [],
        globalSettings: initialData?.globalSettings || null,
        sliderData: initialData?.sliderData || [],
        gridData: initialData?.gridData || [],
        slug: initialData?.slug || fallbackSlug,
        page: initialData?.page || fallbackPage,
    };
}

const CategoryPage = ({ initialData = null, slug = '', page = 1 }) => {
    useRemoveBodyClass(['None'], ['home-seven', 'home-nine', 'boxed-layout', 'home-six', 'home-two']);
    const { locale } = useLanguage();
    const t = dictionary[locale] || dictionary.bn;

    const initialState = useMemo(() => getInitialState(initialData, slug, page), [initialData, slug, page]);
    const [loading, setLoading] = useState(initialState.loading);
    const [isNotFound, setIsNotFound] = useState(initialState.isNotFound);
    const [categoryName, setCategoryName] = useState(initialState.categoryName);
    const [featuredImage, setFeaturedImage] = useState(initialState.featuredImage);
    const [articles, setArticles] = useState(initialState.articles);
    const [pagination, setPagination] = useState(initialState.pagination);
    const [mostViewed, setMostViewed] = useState(initialState.mostViewed);
    const [popularNews, setPopularNews] = useState(initialState.popularNews);
    const [globalSettings, setGlobalSettings] = useState(initialState.globalSettings);
    const [sliderData, setSliderData] = useState(initialState.sliderData);
    const [gridData, setGridData] = useState(initialState.gridData);

    const requestSlug = slug || initialState.slug || '';
    const requestPage = Number(page) > 0 ? Number(page) : Number(initialState.page) || 1;
    const serverSeedKey = `${initialData?.slug || ''}:${initialData?.page || 1}:${initialData?.locale || 'bn'}`;
    const requestKey = `${requestSlug}:${requestPage}:${locale}`;
    const skipFetchKeyRef = useRef(serverSeedKey);

    useEffect(() => {
        setLoading(initialState.loading);
        setIsNotFound(initialState.isNotFound);
        setCategoryName(initialState.categoryName);
        setFeaturedImage(initialState.featuredImage);
        setArticles(initialState.articles);
        setPagination(initialState.pagination);
        setMostViewed(initialState.mostViewed);
        setPopularNews(initialState.popularNews);
        setGlobalSettings(initialState.globalSettings);
        setSliderData(initialState.sliderData);
        setGridData(initialState.gridData);
        skipFetchKeyRef.current = serverSeedKey;
    }, [initialState, serverSeedKey]);

    useEffect(() => {
        if (!requestSlug) return;

        if (skipFetchKeyRef.current && skipFetchKeyRef.current === requestKey) {
            skipFetchKeyRef.current = '';
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                const [catData, articlesRes, globalRes, sliderRes, gridRes] = await Promise.all([
                    getCategoryBySlug(requestSlug, locale).catch(() => null),
                    getArticlesByCategoryEnhanced(requestSlug, 19, { page: requestPage }, locale).catch(() => ({ data: [] })),
                    getGlobalSettings(locale).catch(() => ({ data: null })),
                    getTopSliderByCategory(requestSlug, 5, locale).catch(() => ({ data: [] })),
                    getHeadlineByCategory(requestSlug, 4, locale).catch(() => ({ data: [] })),
                ]);

                if (!catData) {
                    setIsNotFound(true);
                    return;
                }

                const name = catData?.attributes?.name || catData?.name || slug;
                setCategoryName(name);
                setFeaturedImage(catData?.attributes?.featuredImage || catData?.featuredImage || null);
                setArticles(articlesRes?.data || []);
                setPagination(articlesRes?.meta?.pagination || null);
                const globalRaw = globalRes?.data || globalRes || null;
                setGlobalSettings(globalRaw?.attributes || globalRaw);
                setSliderData(sliderRes?.data || []);
                setGridData(gridRes?.data || []);
                setLoading(false);

                // Fetch secondary sidebar blocks after primary page content is visible.
                const [mostViewedRes, popularRes] = await Promise.all([
                    getMostViewedByCategory(requestSlug, 5, locale).catch(() => ({ data: [] })),
                    getPopularByCategory(requestSlug, 5, locale).catch(() => ({ data: [] })),
                ]);
                setMostViewed(mostViewedRes?.data || []);
                setPopularNews(popularRes?.data || []);
            } catch (e) {
                console.error('CategoryPage fetch error:', e);
                setIsNotFound(true);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [requestSlug, requestPage, requestKey, locale]);

    if (isNotFound) {
        return notFound();
    }

    // Keep category hero blocks populated even when flag-based API sections are sparse.
    const getArticleKey = (article) => {
        const a = getAttr(article);
        return a.documentId || article?.documentId || article?.id || a.slug || '';
    };

    const mainArticles = articles;
    const hasMainArticles = mainArticles.length > 0;
    const showMainLoading = loading && !hasMainArticles;
    const showNoNews = !loading && !hasMainArticles;
    const sliderArticles = (sliderData.length > 0 ? sliderData : mainArticles).slice(0, 5);
    const showSliderSection = sliderArticles.length > 0;

    const gridArticles = (() => {
        const baseGrid = Array.isArray(gridData) ? gridData : [];
        const used = new Set(baseGrid.map(getArticleKey).filter(Boolean));
        const pool = [...sliderArticles, ...mainArticles].filter((article) => {
            const key = getArticleKey(article);
            if (!key || used.has(key)) return false;
            used.add(key);
            return true;
        });
        return [...baseGrid, ...pool].slice(0, 4);
    })();

    return (
        <Layout hideMiddleHeader={true} globalSettings={globalSettings}>
            {/* START PAGE TITLE */}
            <div className="page-title">
                <div className="container">
                    <div className="align-items-center row">
                        <div className="col">
                            <h1 className="mb-sm-0">
                                <strong>{categoryName}</strong>
                            </h1>
                        </div>
                        <div className="col-12 col-sm-auto">
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb d-inline-block">
                                    <li className="breadcrumb-item">
                                        <Link href="/">{t.home}</Link>
                                    </li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        {categoryName}
                                    </li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
            {/* END OF /. PAGE TITLE */}

            {/* *** START PAGE MAIN CONTENT *** */}
            <main className="page_main_wrapper article-page-wrapper">
                {/* START POST BLOCK SECTION */}
                {showSliderSection && (
                <section className="slider-inner">
                    <div className="container">
                        <div className="row thm-margin">
                            {/* LEFT: Slider */}
                            <div className="col-12 col-md-6 thm-padding">
                                <div className="slider-wrapper">
                                    <OwlCarousel key={`slider-${articles.length}`} id="owl-slider" className="owl-carousel owl-theme" {...carouselOptions}>
                                        {sliderArticles.map((article) => (
                                            <SliderItem key={article.id} article={article} categoryName={categoryName} locale={locale} />
                                        ))}
                                    </OwlCarousel>
                                </div>
                            </div>
                            {/* RIGHT: 2x2 grid */}
                            <div className="col-12 col-md-6 thm-padding">
                                <div className="row slider-right-post thm-margin">
                                    {gridArticles.map((article) => (
                                        <GridItem key={article.id} article={article} categoryName={categoryName} locale={locale} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                )}
                {/* END OF /. POST BLOCK SECTION */}

                <div className="container">
                    <div className="row row-m article-layout-row">
                        {/* START MAIN CONTENT */}
                        <div className="col-p main-content article-main-content">
                            {showMainLoading ? (
                                <div className="category-empty-note text-center">
                                    <p>{t.loading}</p>
                                </div>
                            ) : hasMainArticles ? (
                                <div className="post-inner categoty-style-1">
                                    <div className="post-body">
                                        <div className="row row-m">
                                            {mainArticles.map((article) => (
                                                <div className="col-md-6 col-p" key={article.id}>
                                                    <ArticleCard article={article} categoryName={categoryName} locale={locale} />
                                                </div>
                                            ))}
                                        </div>
                                        {/* Pagination */}
                                        {pagination && (
                                            <Pagination
                                                currentPage={pagination.page}
                                                totalPages={pagination.pageCount}
                                                basePath={`/${requestSlug}`}
                                            />
                                        )}
                                    </div>
                                </div>
                            ) : showNoNews ? (
                                <div className="category-empty-note text-center">
                                    <p>{t.noNews}</p>
                                </div>
                            ) : null}
                        </div>
                        {/* END OF /. MAIN CONTENT */}

                        {/* START SIDE CONTENT */}
                        <div className={`col-p rightSidebar article-sidebar-col ${locale === 'bn' ? 'rightSidebar-locale-bn' : ''}`}>
                            <StickyBox offsetTop={100} offsetBottom={20} className="article-sidebar-sticky">
                                {/* SOCIAL COUNTER */}
                                <div className="align-items-center d-flex fs-6 justify-content-center mb-1 text-center social-counter-total">
                                    <i className="fa-solid fa-heart text-primary me-1" /> {t.join}{" "}
                                    <span className="fw-bold mx-1">
                                        {globalSettings?.socialTotalFollowers || '0'}
                                    </span> {t.followers}
                                </div>
                                {/* SOCIAL ICONS */}
                                <div className="social-media-inner mb-2">
                                    <ul className="g-1 row social-media">
                                        <li className="col-4">
                                            <a href={globalSettings?.socialRssUrl || '#'} className="rss" target="_blank" rel="noopener noreferrer">
                                                <i className="fas fa-rss" />
                                                <div>{globalSettings?.socialRssSubscribers || '0'}</div>
                                                <p>{t.subscribers}</p>
                                            </a>
                                        </li>
                                        <li className="col-4">
                                            <a href={globalSettings?.socialFacebookUrl || '#'} className="fb" target="_blank" rel="noopener noreferrer">
                                                <i className="fab fa-facebook-f" />
                                                <div>{globalSettings?.socialFacebookFans || '0'}</div>
                                                <p>{t.fans}</p>
                                            </a>
                                        </li>
                                        <li className="col-4">
                                            <a href={globalSettings?.socialInstagramUrl || '#'} className="insta" target="_blank" rel="noopener noreferrer">
                                                <i className="fab fa-instagram" />
                                                <div>{globalSettings?.socialInstagramFollowers || '0'}</div>
                                                <p>{t.followers}</p>
                                            </a>
                                        </li>
                                        <li className="col-4">
                                            <a href={globalSettings?.socialYoutubeUrl || '#'} className="you_tube" target="_blank" rel="noopener noreferrer">
                                                <i className="fab fa-youtube" />
                                                <div>{globalSettings?.socialYoutubeSubscribers || '0'}</div>
                                                <p>{t.subscribers}</p>
                                            </a>
                                        </li>
                                        <li className="col-4">
                                            <a href={globalSettings?.socialTwitterUrl || '#'} className="twitter" target="_blank" rel="noopener noreferrer">
                                                <i className="fab fa-twitter" />
                                                <div>{globalSettings?.socialTwitterFollowers || '0'}</div>
                                                <p>{t.followers}</p>
                                            </a>
                                        </li>
                                        <li className="col-4">
                                            <a href={globalSettings?.socialPinterestUrl || '#'} className="pint" target="_blank" rel="noopener noreferrer">
                                                <i className="fab fa-pinterest-p" />
                                                <div>{globalSettings?.socialPinterestFollowers || '0'}</div>
                                                <p>{t.followers}</p>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                                {/* ADVERTISEMENT */}
                                <div className="add-inner">
                                    <ImageWithFallback
                                        src={getStrapiMedia(featuredImage, '/default.jpg')}
                                        className="img-fluid"
                                        alt={categoryName}
                                        width={300}
                                        height={250}
                                        style={{ width: '100%', height: 'auto' }}
                                    />
                                </div>
                                {/* NAV TABS */}
                                <div className={`tabs-wrapper ${locale === 'bn' ? 'tabs-wrapper-bn' : 'tabs-wrapper-en'}`}>
                                    <ul className="nav nav-tabs" id="myTab" role="tablist">
                                        <li className="nav-item" role="presentation">
                                            <button
                                                className="nav-link border-0 active"
                                                id="most-viewed"
                                                data-bs-toggle="tab"
                                                data-bs-target="#most-viewed-pane"
                                                type="button"
                                                role="tab"
                                                aria-controls="most-viewed-pane"
                                                aria-selected="true"
                                            >
                                                {t.mostViewed}
                                            </button>
                                        </li>
                                        <li className="nav-item" role="presentation">
                                            <button
                                                className="nav-link border-0"
                                                id="popular-news"
                                                data-bs-toggle="tab"
                                                data-bs-target="#popular-news-pane"
                                                type="button"
                                                role="tab"
                                                aria-controls="popular-news-pane"
                                                aria-selected="false"
                                            >
                                                {t.popularNews}
                                            </button>
                                        </li>
                                    </ul>
                                    <div className="tab-content" id="myTabContent">
                                        {/* Most Viewed Tab */}
                                        <div
                                            className="tab-pane fade show active"
                                            id="most-viewed-pane"
                                            role="tabpanel"
                                            aria-labelledby="most-viewed"
                                            tabIndex={0}
                                        >
                                            <div className="most-viewed">
                                                <ul id="most-today" className="content tabs-content">
                                                    {mostViewed.map((article, i) => {
                                                        const a = getAttr(article);
                                                        const s = a.slug || article?.id || '#';
                                                        return (
                                                            <li key={article.id}>
                                                                <span className="count">{String(i + 1).padStart(2, '0')}</span>
                                                                <span className="text">
                                                                    <Link href={`/article/${s}`}>{a.title}</Link>
                                                                </span>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        </div>
                                        {/* Popular News Tab */}
                                        <div
                                            className="tab-pane fade"
                                            id="popular-news-pane"
                                            role="tabpanel"
                                            aria-labelledby="popular-news"
                                            tabIndex={0}
                                        >
                                            <div className="popular-news">
                                                {popularNews.map((article) => {
                                                    const a = getAttr(article);
                                                    const s = a.slug || article?.id || '#';
                                                    const date = formatDate(a.publishedAt || a.createdAt);
                                                    return (
                                                        <div className="p-post" key={article.id}>
                                                            <h4><Link href={`/article/${s}`}>{a.title}</Link></h4>
                                                            <ul className="authar-info d-flex flex-wrap justify-content-center">
                                                                {date && (
                                                                    <li className="date">
                                                                        <a href="#"><i className="ti ti-timer" /> {date}</a>
                                                                    </li>
                                                                )}
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
                        {/* END OF /. SIDE CONTENT */}
                    </div>
                </div>
            </main>
            {/* *** END OF /. PAGE MAIN CONTENT *** */}
        </Layout>
    );
};

export default CategoryPage;
