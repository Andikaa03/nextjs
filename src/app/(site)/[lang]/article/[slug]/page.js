"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from "next/image";
import Link from "next/link";
import StickyBox from "react-sticky-box";
import RelatedArticles from "@/components/article/RelatedArticles";
import TrendingTopics from "@/components/homepage/TrendingNews";
import Comments from "@/components/article/Comments";
import { getArticleBySlug, incrementViewCount, getMostViewedArticles, getPopularArticles } from '@/services/articleService';
import { getGlobalSettings } from '@/services/globalService';
import { getStrapiMedia, formatDate } from '@/lib/strapi';
import Skeleton from '@/components/skeleton';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { useLanguage } from '@/context/LanguageContext';

// Force dynamic rendering to avoid build issues with client-only libraries
export const dynamic = 'force-dynamic';

const ArticleDetailPage = () => {
  const params = useParams();
  const { language, translateNumber } = useLanguage();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostViewed, setMostViewed] = useState([]);
  const [popular, setPopular] = useState([]);
  const [globalSettings, setGlobalSettings] = useState(null);

  const locale = language === 'bn' ? 'bn' : 'en';

  const t = {
    bn: {
      home: 'প্রথম পাতা',
      share: 'শেয়ার করুন:',
      relatedStrong: 'সম্পর্কিত',
      relatedRest: 'সংবাদ',
      comments: 'মন্তব্য',
      mostViewed: 'সর্বাধিক পঠিত',
      popularNews: 'জনপ্রিয় খবর',
      notFound: 'নিবন্ধ পাওয়া যায়নি',
      notFoundDesc: 'আপনি যে নিবন্ধটি খুঁজছেন তা বিদ্যমান নেই।',
      goHome: 'প্রথম পাতায় যান',
      updateTime: 'আপডেট এর সময় :',
      categoryFallback: 'সাধারণ',
      authorFallback: 'সম্পাদক',
      fans: 'ফ্যানস',
      followers: 'ফলোয়ারস',
      subscribers: 'সাবস্ক্রাইবারস',
    },
    en: {
      home: 'Home',
      share: 'Share:',
      relatedStrong: 'Related',
      relatedRest: 'News',
      comments: 'Comments',
      mostViewed: 'Most Viewed',
      popularNews: 'Popular News',
      notFound: 'Article Not Found',
      notFoundDesc: 'The article you are looking for does not exist.',
      goHome: 'Go Back Home',
      updateTime: 'Updated:',
      categoryFallback: 'General',
      authorFallback: 'Editor',
      fans: 'Fans',
      followers: 'Followers',
      subscribers: 'Subscribers',
    }
  };

  const currentT = t[language] || t.bn;

  useEffect(() => {
    async function fetchArticle() {
      try {
        const articleData = await getArticleBySlug(params.slug, locale);
        
        if (articleData) {
          setArticle(articleData);
        } else {
          setError(currentT.notFound);
        }
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    }

    if (params?.slug) {
      fetchArticle();
    }
  }, [params?.slug, locale]);

  // Fetch sidebar data (most viewed + popular)
  useEffect(() => {
    async function fetchSidebarData() {
      try {
        const results = await Promise.allSettled([
          getMostViewedArticles(5, locale),
          getPopularArticles(5, locale),
          getGlobalSettings(locale),
        ]);
        
        const mvResponse = results[0].status === 'fulfilled' ? results[0].value : null;
        const popResponse = results[1].status === 'fulfilled' ? results[1].value : null;
        const globalData = results[2].status === 'fulfilled' ? results[2].value : null;

        setMostViewed(mvResponse?.data || []);
        setPopular(popResponse?.data || []);
        setGlobalSettings(globalData?.data || null);
      } catch (err) {
        console.error('Error fetching sidebar data:', err);
      }
    }
    fetchSidebarData();
  }, [locale]);

  // Increment view count with debounce/timer and session check
  useEffect(() => {
    let timer;

    if (article) {
      const articleId = article.documentId || article.id;
      const storageKey = `viewed_article_${articleId}`;
      const hasViewed = sessionStorage.getItem(storageKey);

      if (!hasViewed) {
        // Wait 10 seconds before counting as a view
        timer = setTimeout(() => {
          const currentViews = article.attributes?.viewCount || article.viewCount || 0;
          incrementViewCount(articleId, currentViews);
          sessionStorage.setItem(storageKey, 'true');
        }, 10000); 
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [article]);

  if (loading) {
    return (
      <main className="page_main_wrapper">
        <div className="container">
          <div className="row">
            <div className="col-md-8">
              <Skeleton className="w-100 mb-4" style={{ height: '400px' }} />
              <Skeleton className="w-75 mb-3" style={{ height: '40px' }} />
              <Skeleton className="w-50 mb-4" style={{ height: '20px' }} />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !article) {
    return (
      <main className="page_main_wrapper">
        <div className="container py-5 text-center">
          <h1>404 - {currentT.notFound}</h1>
          <p className="text-muted mb-4">{error || currentT.notFoundDesc}</p>
          <Link href={`/${language}`} className="btn btn-primary">{currentT.goHome}</Link>
        </div>
      </main>
    );
  }

  const data = article.attributes || article;
  const { title, content, cover, publishedAt, category, author, excerpt } = data;
  const categoryName = category?.data?.attributes?.name || category?.name || currentT.categoryFallback;
  const categorySlug = category?.data?.attributes?.slug || category?.slug || 'general';
  const authorName = author?.data?.attributes?.name || author?.name || currentT.authorFallback;
  const imageUrl = getStrapiMedia(cover);

  // Get ad banner from global settings
  const adBannerUrl = globalSettings ? getStrapiMedia(globalSettings.adBannerSidebar) : null;
  const adBannerLink = globalSettings?.adBannerSidebarLink || '#';

  // Helper to render sidebar article list
  const renderSidebarArticles = (articles) => (
    <div className="footer-news-grid">
      {articles.map((item) => {
        const itemData = item.attributes || item;
        const itemImage = getStrapiMedia(itemData.cover);
        const itemSlug = itemData.slug;
        return (
          <div className="news-list-item" key={item.id}>
            <div className="img-wrapper">
              <Link href={`/${language}/article/${itemSlug}`} className="thumb">
                <ImageWithFallback src={itemImage} alt={itemData.title} className="img-fluid" width={80} height={60} />
              </Link>
            </div>
            <div className="post-info-2">
              <h5>
                <Link href={`/${language}/article/${itemSlug}`} className="title" style={{ fontSize: '0.85rem' }}>
                  {itemData.title}
                </Link>
              </h5>
              <ul className="align-items-center authar-info d-flex flex-wrap gap-1">
                <li>{formatDate(itemData.publishedAt || itemData.createdAt, locale)}</li>
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );

  // Derived social media data
  const socialData = {
    fb: globalSettings?.socialFacebookFans || 0,
    twitter: globalSettings?.socialTwitterFollowers || 0,
    youtube: globalSettings?.socialYoutubeSubscribers || 0,
  };

  const socialLinks = {
    fb: globalSettings?.socialFacebookUrl || '#',
    twitter: globalSettings?.socialTwitterUrl || '#',
    youtube: globalSettings?.socialYoutubeUrl || '#',
  };

  return (
    <>
      <main className="page_main_wrapper">
        <div className="container">
          <div className="row row-m">
            {/* START MAIN CONTENT */}
            <div className="col-md-8 col-p main-content">
              <StickyBox>
                <div className="post_details_inner">
                  {/* Custom Header Layout matching reference */}
                  <div className="mb-4">
                     {/* Breadcrumb */}
                     <nav aria-label="breadcrumb" className="mb-3 d-none d-md-block">
                      <ol className="breadcrumb d-inline-block bg-transparent p-0 m-0">
                        <li className="breadcrumb-item">
                          <Link href={`/${language}`} className="text-danger"><i className="fas fa-home"></i> {currentT.home}</Link>
                        </li>
                        <li className="breadcrumb-item">
                          <Link href={`/${language}/category/${categorySlug}`} className="text-decoration-none font-weight-bold" style={{ color: '#0d6efd' }}>
                            {categoryName}
                          </Link>
                        </li>
                        <li className="breadcrumb-item active" aria-current="page">
                           {title.substring(0, 50)}...
                        </li>
                      </ol>
                    </nav>

                    {/* Title */}
                    <h1 className="mb-3 font-weight-bold" style={{ fontSize: '2.5rem', lineHeight: '1.3' }}>
                      {title}
                    </h1>

                    {/* Author and Meta Info */}
                    <div className="d-flex align-items-center mb-3 text-muted">
                        <div className="mr-3">
                            <div className="d-flex align-items-center">
                                <div className="mr-2 bg-light rounded-circle d-flex align-items-center justify-content-center" style={{width: '40px', height: '40px'}}>
                                    <i className="fas fa-user text-secondary"></i>
                                </div>
                                <span className="font-weight-bold text-dark">{authorName}</span>
                            </div>
                        </div>
                    </div>
                     <div className="d-flex align-items-center text-muted small mb-4">
                        <i className="far fa-clock mr-1"></i> {currentT.updateTime} {formatDate(publishedAt, locale)}
                     </div>
                  </div>

                  {/* Featured Image */}
                  <div className="post_details_block">
                    {imageUrl && (
                      <figure className="social-icon mb-4">
                        <ImageWithFallback
                          src={imageUrl}
                          width={800}
                          height={600}
                          className="img-fluid w-100"
                          alt={title}
                          style={{ borderRadius: '5px', width: '100%', height: 'auto' }}
                          priority
                        />
                      </figure>
                    )}

                    {/* YouTube Video Embed */}
                    {(() => {
                        const getEmbedUrl = (url) => {
                            if (!url) return null;
                            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                            const match = url.match(regExp);
                            return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
                        };
                        const embedUrl = getEmbedUrl(data.videoUrl);
                        return embedUrl && (
                            <div className="mb-4 position-relative" style={{ paddingBottom: '56.25%', height: 0 }}>
                                <iframe
                                    src={embedUrl}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="position-absolute top-0 start-0 w-100 h-100 rounded"
                                ></iframe>
                            </div>
                        );
                    })()}

                    {/* Excerpt */}
                    {excerpt && (
                      <div className="lead mb-4 text-muted fst-italic border-start border-primary border-3 ps-3">
                        {excerpt}
                      </div>
                    )}

                    {/* Article Content */}
                    <div 
                      className="article-content" 
                      dangerouslySetInnerHTML={{ __html: content }}
                      style={{ fontSize: '1.1rem', lineHeight: '1.8' }}
                    />

                    {/* Tags */}
                    {data.tags && data.tags.data && data.tags.data.length > 0 && (
                        <div className="mb-4">
                            <i className="fas fa-tags text-muted me-2"></i>
                            {data.tags.data.map((tag) => (
                                <span key={tag.id} className="badge bg-light text-dark me-1 border">{tag.attributes?.name || tag.name}</span>
                            ))}
                        </div>
                    )}

                    {/* Article Bottom Share */}
                    <div className="mt-5 border-top pt-4">
                        <h5 className="mb-3">{currentT.share}</h5>
                        <div className="d-flex">
                          <Link href={`https://www.facebook.com/sharer/sharer.php?u=${typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''}`} className="btn btn-primary btn-sm mr-2" style={{ backgroundColor: '#3b5998', borderColor: '#3b5998' }} target="_blank">
                            <i className="fab fa-facebook-f mr-1" /> Facebook
                          </Link>
                           <Link href={`https://wa.me/?text=${encodeURIComponent(title)}`} className="btn btn-success btn-sm mr-2" style={{ backgroundColor: '#25D366', borderColor: '#25D366' }} target="_blank">
                            <i className="fab fa-whatsapp mr-1" /> WhatsApp
                          </Link>
                        </div>
                    </div>

                  </div>
                  
                  {/* Related Articles Section */}
                  <div className="post-inner post-inner-2 mt-5">
                    <div className="post-head">
                      <h2 className="title">
                        <strong>{currentT.relatedStrong} </strong> {currentT.relatedRest}
                      </h2>
                    </div>
                    <div className="post-body">
                      <RelatedArticles /> 
                    </div>
                  </div>

                  {/* Comments Section */}
                  <Comments
                    articleSlug={params.slug}
                    articleDocumentId={article.documentId || article.id}
                  />

                </div>
              </StickyBox>
            </div>
            {/* END OF /. MAIN CONTENT */}

            {/* START SIDE CONTENT */}
            <div className="col-md-4 col-p rightSidebar">
                 {/* Social Media Widget */}
                  <div className="social-media-inner mb-4">
                    <ul className="g-1 row social-media">
                      <li className="col-4">
                        <Link href={socialLinks.fb} className="fb" target="_blank">
                          <i className="fab fa-facebook-f" />
                          <div>{translateNumber(socialData.fb.toLocaleString())}</div>
                          <p>{currentT.fans}</p>
                        </Link>
                      </li>
                      <li className="col-4">
                        <Link href={socialLinks.twitter} className="twitter" target="_blank">
                          <i className="fab fa-twitter" />
                          <div>{translateNumber(socialData.twitter.toLocaleString())}</div>
                          <p>{currentT.followers}</p>
                        </Link>
                      </li>
                      <li className="col-4">
                        <Link href={socialLinks.youtube} className="you_tube" target="_blank">
                          <i className="fab fa-youtube" />
                          <div>{translateNumber(socialData.youtube.toLocaleString())}</div>
                          <p>{currentT.subscribers}</p>
                        </Link>
                      </li>
                    </ul>
                  </div>

                {/* Advertisement — from Strapi global settings */}
                {adBannerUrl && adBannerUrl !== '/default.jpg' && (
                  <div className="add-inner mb-4">
                    <a href={adBannerLink} target="_blank" rel="noopener noreferrer">
                      <img
                        src={adBannerUrl}
                        className="img-fluid"
                        alt="Advertisement"
                      />
                    </a>
                  </div>
                )}

                {/* Tags Wrapper (Most Viewed / Popular) — from real API */}
                <div className="tabs-wrapper">
                    <ul className="nav nav-tabs" id="myTab" role="tablist">
                      <li className="nav-item" role="presentation">
                        <button className="nav-link border-0 active" id="most-viewed-tab" data-bs-toggle="tab" data-bs-target="#most-viewed" type="button" role="tab" aria-controls="most-viewed" aria-selected="true">
                          {currentT.mostViewed}
                        </button>
                      </li>
                      <li className="nav-item" role="presentation">
                        <button className="nav-link border-0" id="popular-news-tab" data-bs-toggle="tab" data-bs-target="#popular-news" type="button" role="tab" aria-controls="popular-news" aria-selected="false">
                          {currentT.popularNews}
                        </button>
                      </li>
                    </ul>
                    <div className="tab-content" id="myTabContent">
                      <div className="tab-pane fade show active" id="most-viewed" role="tabpanel" aria-labelledby="most-viewed-tab">
                        <div className="most-viewed">
                          {mostViewed.length > 0 ? renderSidebarArticles(mostViewed) : (
                            <div className="p-3">{[1,2,3].map(i => <Skeleton key={i} className="mb-2" style={{height:'60px'}} />)}</div>
                          )}
                        </div>
                      </div>
                      <div className="tab-pane fade" id="popular-news" role="tabpanel" aria-labelledby="popular-news-tab">
                        <div className="popular-news">
                          {popular.length > 0 ? renderSidebarArticles(popular) : (
                            <div className="p-3">{[1,2,3].map(i => <Skeleton key={i} className="mb-2" style={{height:'60px'}} />)}</div>
                          )}
                        </div>
                      </div>
                    </div>
                </div>

                {/* START TRENDING TOPICS */}
                <TrendingTopics />
                {/* END OF /. TRENDING TOPICS */}
            </div>
            {/* END OF /. SIDE CONTENT */}
          </div>
        </div>
      </main>
      {/* *** END OF /. PAGE MAIN CONTENT *** */}
    </>
  );
};

export default ArticleDetailPage;
