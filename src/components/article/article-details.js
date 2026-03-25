"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import StickyBox from "react-sticky-box";
import Layout from "@/components/ltr/layout/layout";
import ArticleRelated from "@/components/article/article-related";
import ArticleComments from "@/components/article/article-comments";
import ArticleSidebar from "@/components/article/article-sidebar";
import useRemoveBodyClass from "@/components/ltr/useEffect-hook/useEffect-hook";
import { getStrapiMedia, formatDate } from '@/lib/strapi';
import { useTranslations } from '@/lib/translations';
import StrapiBlocks from '@/components/article/strapi-blocks';
import SocialShare from '@/components/article/social-share';
import { getMostViewedArticles, getPopularArticles } from '@/services/articleService';
import { getGlobalSettings, getAdsManagement } from '@/services/globalService';

const ClientArticleDetail = ({ article, mostViewed = [], popularNews = [], globalSettings, adsData, locale = 'bn' }) => {
  useRemoveBodyClass(['None'], ['home-seven', 'home-nine','boxed-layout','home-six']);
  const { t } = useTranslations(locale);
  
  const [sidebarData, setSidebarData] = useState({
    mostViewed: mostViewed,
    popularNews: popularNews,
    globalSettings: globalSettings,
    adsData: adsData,
    loading: !globalSettings, // If globalSettings is empty, sidebar data is loading
  });

  // Fetch sidebar data on client to avoid blocking article render
  useEffect(() => {
    let mounted = true;

    const fetchSidebarData = async () => {
      try {
        const [mostViewedRes, popularRes, settingsRes, adsRes] = await Promise.all([
          getMostViewedArticles(5, locale),
          getPopularArticles(5, locale),
          getGlobalSettings(locale),
          getAdsManagement(),
        ]);

        if (!mounted) return;

        setSidebarData({
          mostViewed: mostViewedRes?.data || [],
          popularNews: popularRes?.data || [],
          globalSettings: settingsRes?.data,
          adsData: adsRes?.data,
          loading: false,
        });
      } catch (error) {
        console.error('Error fetching sidebar data:', error);
        if (mounted) {
          setSidebarData((prev) => ({ ...prev, loading: false }));
        }
      }
    };

    if (!globalSettings) {
      fetchSidebarData();
    }

    return () => {
      mounted = false;
    };
  }, [locale, globalSettings]);
  
  const data = article.attributes || article;
  const { title, content, cover, publishedAt, author, views } = data;
  const categorySlug = data.category?.data?.attributes?.slug || data.category?.slug || "";
  const authorName = author?.data?.attributes?.name || t('editor');
  const imageUrl = getStrapiMedia(cover);

  // Resolve global settings for social URLs
  const gs = globalSettings?.attributes || globalSettings;

  // Helper for YouTube embed
  const getEmbedUrl = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };
  const videoEmbedUrl = getEmbedUrl(data.videoUrl);

  return (
    <Layout hideMiddleHeader={true} globalSettings={globalSettings}>
      {/* *** START PAGE MAIN CONTENT *** */}
      <main className={`page_main_wrapper article-page-wrapper ${locale === 'en' ? 'locale-en' : ''}`}>
        {/* START PAGE TITLE */}
        <div className="page-title">
          <div className="container">
            <div className="align-items-center row">
     
              <div className="col-12 col-sm-auto">
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb d-inline-block">
                    <li className="breadcrumb-item">
                      <Link href="/">{t('home')}</Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                      {title && title.length > 20 ? title.substring(0, 20) + '...' : title}
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </div>
        {/* END OF /. PAGE TITLE */}
        <div className="container">
          <div className="row row-m article-layout-row">
            {/* START MAIN CONTENT */}
            <div className="col-p main-content article-main-content">
              <div>
                <div className="post_details_inner">
                  <div className="post_details_block">
                    {imageUrl && (
                        <figure className="social-icon">
                            <Image
                                src={imageUrl}
                                className="img-fluid"
                                alt={title}
                                width={800}
                                height={450}
                                priority
                                onError={(e) => e.target.style.display = 'none'}
                            />
                            {/* Floating Social Share Buttons */}
                            <SocialShare title={title} slug={data.slug} articleId={article.documentId || article.id} />
                        </figure>
                    )}
                    
                    <h2>{title}</h2>
                    <div className="article-meta-info">
                      <span className="meta-item author">{t('by')} {authorName}</span>
                      <span className="meta-separator">|</span>
                      <span className="meta-item date">{formatDate(publishedAt, locale)}</span>
                    </div>

                    {videoEmbedUrl && (
                        <div className="mb-4 position-relative" style={{ paddingBottom: '56.25%', height: 0 }}>
                            <iframe
                                src={videoEmbedUrl}
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="position-absolute top-0 start-0 w-100 h-100 rounded"
                            ></iframe>
                        </div>
                    )}

                    {/* Universal Renderer: Handles both Markdown and Blocks */}
                    <StrapiBlocks content={content} />
                    
                  </div>
                  
                  {/* Post footer - Pagination (if needed) */}
                  {/* <div className="post-footer">
                    <div className="row thm-margin">
                      <div className="col-xs-12 col-sm-12 col-md-12 thm-padding">
                        <ul className="pagination">
                           ...
                        </ul>
                      </div>
                    </div>
                  </div> */}

                </div>

                {/* START RELATED ARTICLES - Hide if isAbout is true */}
                {!data.isAbout && (
                  <>
                    <ArticleRelated articles={sidebarData.mostViewed} locale={locale} articleSlug={data.slug} articleTitle={title} categorySlug={categorySlug} />
                    <ArticleComments articleSlug={data.slug} articleDocumentId={article.documentId || article.id} locale={locale} />
                  </>
                )}
                {/* END OF /. RELATED ARTICLES */}
              
              </div>
            </div>
            {/* END OF /. MAIN CONTENT */}

            {/* START SIDE CONTENT */}
            <div className="col-p rightSidebar article-sidebar-col">
               <ArticleSidebar 
                  mostViewed={sidebarData.mostViewed} 
                  popularNews={sidebarData.popularNews} 
                  globalSettings={sidebarData.globalSettings} 
                  adsData={sidebarData.adsData}
                  locale={locale} 
               />
            </div>
            {/* END OF /. SIDE CONTENT */}
          </div>
        </div>
      </main>
      {/* *** END OF /. PAGE MAIN CONTENT *** */}
    </Layout>
  );
};

export default ClientArticleDetail;
