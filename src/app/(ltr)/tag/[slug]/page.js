"use client"

import Layout from '@/components/ltr/layout/layout';
import useRemoveBodyClass from '@/components/ltr/useEffect-hook/useEffect-hook';
import Link from 'next/link';
import { useParams, useSearchParams, notFound } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import StickyBox from 'react-sticky-box';
import dynamic from 'next/dynamic';
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import 'animate.css/animate.css';
import { getTagBySlug } from '@/services/tagService';
import { getArticlesByTagEnhanced, getMostViewedByTag, getPopularByTag, getTopSliderByTag, getHeadlineByTag } from '@/services/articleService';
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
        tags: "Tags",
        mostViewed: "Most Viewed",
        popularNews: "Popular News",
        join: "Join",
        followers: "Followers",
        subscribers: "Subscribers",
        fans: "Fans",
        noNews: "No news found for this tag.",
        by: "by"
    },
    bn: {
        loading: "লোড হচ্ছে...",
        loadingTitle: "লোড হচ্ছে: সংবাদের শিরোনাম এখানে দেখাবে...",
        home: "হোম",
        tags: "ট্যাগ",
        mostViewed: "সর্বাধিক দেখা",
        popularNews: "জনপ্রিয় সংবাদ",
        join: "যোগ দিন",
        followers: "অনুসরণকারীরা",
        subscribers: "সাবস্ক্রাইবার",
        fans: "ফ্যান",
        noNews: "এই ট্যাগে কোনো সংবাদ পাওয়া যায়নি।",
        by: "লিখেছেন:"
    }
};

if (typeof window !== 'undefined') {
    window.$ = window.jQuery = require('jquery');
}
const OwlCarousel = dynamic(() => import('react-owl-carousel'), { ssr: false });

// ---- Skeleton placeholders ----
const SKELETON_ARTICLES = Array.from({ length: 9 }, (_, i) => ({ id: `sk-${i}`, _skeleton: true }));

const ArticleSkeleton = ({ t }) => (
    <article>
        <figure>
            <a href="#" className="news-image">
                <img src="/default.jpg" alt="" className="img-fluid" />
            </a>
            <span className="post-category">...</span>
        </figure>
        <div className="post-info">
            <h3><a href="#">{t.loadingTitle}</a></h3>
            <ul className="authar-info d-flex flex-wrap">
                <li><i className="ti ti-timer" /> ...</li>
            </ul>
        </div>
    </article>
);

const SliderSkeleton = ({ t }) => (
    <div className="slider-post post-height-1">
        <a href="#" className="news-image">
            <img src="/default.jpg" alt="" className="img-fluid" />
        </a>
        <div className="post-text">
            <span className="post-category">{t.loading}</span>
            <h2><a href="#">{t.loadingTitle}</a></h2>
            <ul className="authar-info d-flex flex-wrap">
                <li className="authar"><a href="#">{t.loading}</a></li>
                <li className="date">{t.loading}</li>
            </ul>
        </div>
    </div>
);

// ---- Helper ----
function getAttr(article) {
    return article?.attributes || article || {};
}

function ArticleCard({ article, locale }) {
    const a = getAttr(article);
    const coverUrl = getStrapiMedia(a.cover, '/default.jpg');
    const slug = a.slug || article?.id || '#';
    const title = a.title || '';
    const date = formatDate(a.publishedAt || a.createdAt, locale);
    const catName = a.category?.data?.attributes?.name || a.category?.name || '';
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

function SliderItem({ article, locale }) {
    const a = getAttr(article);
    const coverUrl = getStrapiMedia(a.cover, '/default.jpg');
    const slug = a.slug || article?.id || '#';
    const title = a.title || '';
    const date = formatDate(a.publishedAt || a.createdAt, locale);
    const catName = a.category?.data?.attributes?.name || a.category?.name || '';
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

function GridItem({ article, locale }) {
    const a = getAttr(article);
    const coverUrl = getStrapiMedia(a.cover, '/default.jpg');
    const slug = a.slug || article?.id || '#';
    const title = a.title || '';
    const date = formatDate(a.publishedAt || a.createdAt, locale);
    const catName = a.category?.data?.attributes?.name || a.category?.name || '';
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

const TagPage = () => {
    useRemoveBodyClass(['None'], ['home-seven', 'home-nine', 'boxed-layout', 'home-six', 'home-two']);
    const params = useParams();
    const searchParams = useSearchParams();
    const slug = params?.slug || '';
    const page = Number(searchParams.get('page')) || 1;
    const { locale } = useLanguage();
    const t = dictionary[locale] || dictionary.bn;

    const [loading, setLoading] = useState(true);
    const [isNotFound, setIsNotFound] = useState(false);
    const [tagName, setTagName] = useState('');
    const [tagDescription, setTagDescription] = useState('');
    const [articles, setArticles] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [mostViewed, setMostViewed] = useState([]);
    const [popularNews, setPopularNews] = useState([]);
    const [globalSettings, setGlobalSettings] = useState(null);
    const [sliderData, setSliderData] = useState([]);
    const [gridData, setGridData] = useState([]);

    useEffect(() => {
        if (!slug) return;
        const fetchData = async () => {
            setLoading(true);
            try {
                const [tagData, articlesRes, mostViewedRes, popularRes, globalRes, sliderRes, gridRes] = await Promise.all([
                    getTagBySlug(slug, locale).catch(() => null),
                    getArticlesByTagEnhanced(slug, 19, { page }, locale).catch(() => ({ data: [] })),
                    getMostViewedByTag(slug, 5, locale).catch(() => ({ data: [] })),
                    getPopularByTag(slug, 5, locale).catch(() => ({ data: [] })),
                    getGlobalSettings(locale).catch(() => ({ data: null })),
                    getTopSliderByTag(slug, 5, locale).catch(() => ({ data: [] })),
                    getHeadlineByTag(slug, 4, locale).catch(() => ({ data: [] })),
                ]);

                if (!tagData) {
                    setIsNotFound(true);
                    return;
                }

                const name = tagData?.attributes?.name || tagData?.name || slug;
                setTagName(name);
                setTagDescription(tagData?.attributes?.description || tagData?.description || '');
                setArticles(articlesRes?.data || []);
                setPagination(articlesRes?.meta?.pagination || null);
                setMostViewed(mostViewedRes?.data || []);
                setPopularNews(popularRes?.data || []);
                const globalRaw = globalRes?.data || globalRes || null;
                setGlobalSettings(globalRaw?.attributes || globalRaw);
                setSliderData(sliderRes?.data || []);
                setGridData(gridRes?.data || []);
            } catch (e) {
                console.error('TagPage fetch error:', e);
                setIsNotFound(true);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [slug, page, locale]);

    if (isNotFound) {
        return notFound();
    }

    // Slider & grid use flagged articles; main content uses general tag articles
    const sliderArticles = loading ? SKELETON_ARTICLES.slice(0, 5) : sliderData;
    const gridArticles = loading ? SKELETON_ARTICLES.slice(0, 4) : gridData;
    const mainArticles = loading ? SKELETON_ARTICLES : articles;

    return (
        <Layout hideMiddleHeader={true} globalSettings={globalSettings}>
            {/* START PAGE TITLE */}
            <div className="page-title">
                <div className="container">
                    <div className="align-items-center row">
                        <div className="col">
                            <h1 className="mb-sm-0">
                                <strong>{loading ? t.loading : tagName}</strong>
                            </h1>
                            {tagDescription && (
                                <p className="mb-0 mt-1 text-muted" style={{ fontSize: '14px' }}>{tagDescription}</p>
                            )}
                        </div>
                        <div className="col-12 col-sm-auto">
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb d-inline-block">
                                    <li className="breadcrumb-item">
                                        <Link href="/">{t.home}</Link>
                                    </li>
                                    <li className="breadcrumb-item">
                                        {t.tags}
                                    </li>
                                    <li className="breadcrumb-item active" aria-current="page">
                                        {loading ? t.loading : tagName}
                                    </li>
                                </ol>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>
            {/* END OF /. PAGE TITLE */}

            {/* *** START PAGE MAIN CONTENT *** */}
            <main className="page_main_wrapper">
                {/* START POST BLOCK SECTION */}
                {(loading || sliderArticles.length > 0) && (
                <section className="slider-inner">
                    <div className="container">
                        <div className="row thm-margin">
                            {/* LEFT: Slider */}
                            <div className="col-md-6 thm-padding">
                                <div className="slider-wrapper">
                                    {loading ? (
                                        <SliderSkeleton t={t} />
                                    ) : (
                                        <OwlCarousel key={`slider-${articles.length}`} id="owl-slider" className="owl-theme" {...carouselOptions}>
                                            {sliderArticles.map((article) => (
                                                <SliderItem key={article.id} article={article} locale={locale} />
                                            ))}
                                        </OwlCarousel>
                                    )}
                                </div>
                            </div>
                            {/* RIGHT: 2x2 grid */}
                            <div className="col-md-6 thm-padding">
                                <div className="row slider-right-post thm-margin">
                                    {loading
                                        ? SKELETON_ARTICLES.slice(0, 4).map((_, i) => (
                                            <div className="col-6 col-sm-6 thm-padding" key={i}>
                                                <div className="slider-post post-height-2">
                                                    <a href="#" className="news-image">
                                                        <img src="/default.jpg" alt="" className="img-fluid" />
                                                    </a>
                                                    <div className="post-text">
                                                        <span className="post-category">{t.loading}</span>
                                                        <h4><a href="#">{t.loadingTitle}</a></h4>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                        : gridArticles.map((article) => (
                                            <GridItem key={article.id} article={article} locale={locale} />
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                )}
                {/* END OF /. POST BLOCK SECTION */}

                <div className="container">
                    <div className="row row-m">
                        {/* START MAIN CONTENT */}
                        <div className="col-sm-7 col-md-8 col-p main-content">
                            <StickyBox>
                                <div className="post-inner categoty-style-1">
                                    <div className="post-body">
                                        <div className="row row-m">
                                            {loading
                                                ? SKELETON_ARTICLES.map((_, i) => (
                                                    <div className="col-md-6 col-p" key={i}>
                                                        <ArticleSkeleton t={t} />
                                                    </div>
                                                ))
                                                : mainArticles.length === 0 && articles.length === 0
                                                    ? (
                                                        <div className="col-12 text-center py-5">
                                                            <p>{t.noNews}</p>
                                                        </div>
                                                    )
                                                    : mainArticles.map((article) => (
                                                        <div className="col-md-6 col-p" key={article.id}>
                                                            <ArticleCard article={article} locale={locale} />
                                                        </div>
                                                    ))
                                            }
                                        </div>
                                        {/* Pagination */}
                                        {pagination && (
                                            <Pagination
                                                currentPage={pagination.page}
                                                totalPages={pagination.pageCount}
                                                basePath={`/tag/${slug}`}
                                            />
                                        )}
                                    </div>
                                </div>
                            </StickyBox>
                        </div>
                        {/* END OF /. MAIN CONTENT */}

                        {/* START SIDE CONTENT */}
                        <div className="col-sm-5 col-md-4 col-p rightSidebar">
                            <StickyBox>
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
                                {/* NAV TABS */}
                                <div className="tabs-wrapper">
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
                                                    {loading
                                                        ? Array.from({ length: 5 }, (_, i) => (
                                                            <li key={i}>
                                                                <span className="count">{String(i + 1).padStart(2, '0')}</span>
                                                                <span className="text"><a href="#">{t.loadingTitle}</a></span>
                                                            </li>
                                                        ))
                                                        : mostViewed.map((article, i) => {
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
                                                        })
                                                    }
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
                                                {loading
                                                    ? Array.from({ length: 3 }, (_, i) => (
                                                        <div className="p-post" key={i}>
                                                            <h4><a href="#">{t.loadingTitle}</a></h4>
                                                            <ul className="authar-info d-flex flex-wrap justify-content-center">
                                                                <li className="date"><a href="#"><i className="ti ti-timer" /> {t.loading}</a></li>
                                                            </ul>
                                                        </div>
                                                    ))
                                                    : popularNews.map((article) => {
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
                                                    })
                                                }
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

export default TagPage;
