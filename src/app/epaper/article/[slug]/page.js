'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { getEpaperArticleBySlug } from '@/lib/epaper-api';
import Layout from "@/components/ltr/layout/layout";
import { getGlobalSettings } from "@/services/globalService";
import { getStrapiMedia, formatDate } from '@/lib/strapi';
import { useLanguage } from '@/lib/LanguageContext';
import { useTranslations } from '@/lib/translations';

export default function EpaperArticlePage() {
  const params = useParams();
  const slug = params?.slug;
  const { locale } = useLanguage();
  const { t } = useTranslations(locale);
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [globalSettings, setGlobalSettings] = useState(null);
  const [viewMode, setViewMode] = useState('text'); // 'text' or 'image'
  const [fontSize, setFontSize] = useState(locale === 'bn' ? 22 : 16); 
  const { theme } = useTheme();
  const [isSaved, setIsSaved] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [imageZoom, setImageZoom] = useState(1);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update default font size when locale changes
  useEffect(() => {
    setFontSize(locale === 'bn' ? 22 : 16);
  }, [locale]);

  useEffect(() => {
    async function fetchData() {
      if (!slug) return;
      try {
        setLoading(true);
        const [articleData, globalRes] = await Promise.all([
          getEpaperArticleBySlug(slug, locale),
          getGlobalSettings(locale),
        ]);
        
        console.log('Fetched article data:', articleData);
        
        setArticle(articleData);
        const globalRaw = globalRes?.data || globalRes || null;
        setGlobalSettings(globalRaw?.attributes || globalRaw);

        // Check localStorage for saved state
        const savedArticles = JSON.parse(localStorage.getItem('saved_epaper_articles') || '{}');
        setIsSaved(!!savedArticles[slug]);
      } catch (err) {
        console.error('Failed to fetch ePaper article:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug, locale]);

  const articleImageUrl = article?.image_view ? getStrapiMedia(article.image_view) : null;

  const handleFontInc = () => viewMode === 'text' && setFontSize(prev => Math.min(prev + 2, 32));
  const handleFontDec = () => viewMode === 'text' && setFontSize(prev => Math.max(prev - 2, 12));
  
  const handleImageZoomIn = () => viewMode === 'image' && setImageZoom(prev => Math.min(prev + 0.2, 3));
  const handleImageZoomOut = () => viewMode === 'image' && setImageZoom(prev => Math.max(prev - 0.2, 0.5));

  const handleToggleSave = () => {
    if (!slug) return;
    const savedArticles = JSON.parse(localStorage.getItem('saved_epaper_articles') || '{}');
    if (isSaved) {
      delete savedArticles[slug];
    } else {
      savedArticles[slug] = { 
        title: article?.title, 
        savedAt: new Date().toISOString() 
      };
    }
    localStorage.setItem('saved_epaper_articles', JSON.stringify(savedArticles));
    setIsSaved(!isSaved);
  };

  if (!mounted) return null;

  const isDark = theme === 'skin-dark';

  return (
    <Layout globalSettings={globalSettings}>
      <div className={`article_reader_wrapper locale-${locale}`} style={{ 
        background: isDark ? '#121212' : '#f0f0f0', 
        minHeight: '100vh',
        transition: 'background 0.3s ease'
      }}>
        
        {/* Prothom Alo Style Toolbar */}
        <div className="article_actions" style={{ 
          background: isDark ? '#1e1e1e' : '#f5f5f5', 
          color: isDark ? '#fff' : '#333', 
          padding: '5px 0', 
          borderBottom: isDark ? '1px solid #333' : '1px solid #ddd'
        }}>
          <div className="container" style={{ display: 'flex', justifyContent: 'center' }}>
            <ul id="mainUl" style={{ 
              display: 'flex', 
              listStyle: 'none', 
              margin: 0, 
              padding: 0, 
              gap: '20px', 
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
                <li>
                    <div className="action_item" onClick={() => window.location.href = '/epaper'}>
                        <span>
                            <i className="fa-regular fa-newspaper"></i>
                            <label>{t('goToPage')}</label>
                        </span>
                    </div>
                </li>
                {/* Font Controls (Active in Text Mode) */}
                <li>
                    <div className="action_item" onClick={handleFontInc} style={{ cursor: viewMode === 'text' ? 'pointer' : 'default' }}>
                        <span style={{ opacity: viewMode === 'text' ? 1 : 0.3 }}>
                            <i className="fa-solid fa-plus"></i>
                            <label>{t('fontInc')}</label>
                        </span>
                    </div>
                </li>
                <li>
                    <div className="action_item" onClick={handleFontDec} style={{ cursor: viewMode === 'text' ? 'pointer' : 'default' }}>
                        <span style={{ opacity: viewMode === 'text' ? 1 : 0.3 }}>
                            <i className="fa-solid fa-minus"></i>
                            <label>{t('fontDec')}</label>
                        </span>
                    </div>
                </li>
                {/* Zoom Controls (Active in Image Mode) */}
                <li>
                    <div className="action_item" onClick={handleImageZoomIn} style={{ cursor: viewMode === 'image' ? 'pointer' : 'default' }}>
                        <span style={{ opacity: viewMode === 'image' ? 1 : 0.3 }}>
                            <i className="fa-solid fa-magnifying-glass-plus"></i>
                            <label>{t('zoomIn')}</label>
                        </span>
                    </div>
                </li>
                <li>
                    <div className="action_item" onClick={handleImageZoomOut} style={{ cursor: viewMode === 'image' ? 'pointer' : 'default' }}>
                        <span style={{ opacity: viewMode === 'image' ? 1 : 0.3 }}>
                            <i className="fa-solid fa-magnifying-glass-minus"></i>
                            <label>{t('zoomOut')}</label>
                        </span>
                    </div>
                </li>
                <li>
                    <div className="action_item" 
                        onClick={() => articleImageUrl && window.open(articleImageUrl, '_blank')} 
                        style={{ cursor: articleImageUrl ? 'pointer' : 'default' }}
                    >
                        <span style={{ opacity: articleImageUrl ? 1 : 0.3 }}>
                            <i className="fa-solid fa-download"></i>
                            <label>{t('downloadImage')}</label>
                        </span>
                    </div>
                </li>
                <li>
                    <div className={`action_item ${viewMode === 'image' ? 'active' : ''}`} onClick={() => setViewMode('image')}>
                        <span>
                            <i className="fa-regular fa-image"></i>
                            <label>{t('imageView')}</label>
                        </span>
                    </div>
                </li>
                <li>
                    <div className={`action_item ${viewMode === 'text' ? 'active' : ''}`} onClick={() => setViewMode('text')}>
                        <span>
                            <i className="fa-solid fa-align-left"></i>
                            <label>{t('textView')}</label>
                        </span>
                    </div>
                </li>
                <li>
                    <div className="action_item" onClick={handleToggleSave}>
                        <span style={{ color: isSaved ? '#eb0254' : 'inherit' }}>
                            <i className={isSaved ? "fa-solid fa-heart" : "fa-regular fa-heart"}></i>
                            <label>{isSaved ? t('saved') : t('save')}</label>
                        </span>
                    </div>
                </li>
            </ul>
          </div>
        </div>

        <main className="py-4">
          <div className="container" style={{ maxWidth: '80%' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <div className="spinner-border text-danger" role="status" />
                <div className="mt-2">{t('loading')}</div>
              </div>
            ) : !article ? (
              <div className="text-center py-5 bg-white rounded shadow-sm" style={{ background: isDark ? '#1e1e1e' : '#fff' }}>
                <h2 style={{ color: isDark ? '#fff' : '#333' }}>{t('articleNotFound')}</h2>
                <div className="mt-3">
                  <p className="text-muted small">Slug: {slug} | Locale: {locale}</p>
                </div>
                <button 
                  onClick={() => window.location.href = '/epaper'}
                  className="btn btn-sm mt-3"
                  style={{ background: '#eb0254', color: '#fff' }}
                >
                  {t('backToePaper')}
                </button>
              </div>
            ) : (() => {
                const data = article.attributes || article;
                const articleImageUrl = data.image_view ? getStrapiMedia(data.image_view) : null;
                
                return (
                  <div className="row justify-content-center">
                    <div className="col-12">
                        <div className="article_paper_box" style={{ 
                            background: isDark ? 'transparent' : '#fff',
                            padding: '40px',
                            minHeight: '800px',
                            border: isDark ? 'none' : '1px solid #eee',
                            borderRadius: '2px'
                        }}>
                            {viewMode === 'image' ? (
                                <div className="articles_section_body_imgview" style={{ overflow: 'auto', maxHeight: '100vh' }}>
                                    {articleImageUrl ? (
                                        <img 
                                            src={articleImageUrl} 
                                            alt={data.title} 
                                            style={{ 
                                                width: '100%', 
                                                height: 'auto', 
                                                display: 'block',
                                                transform: `scale(${imageZoom})`,
                                                transformOrigin: 'top center',
                                                transition: 'transform 0.3s ease'
                                            }} 
                                        />
                                    ) : (
                                        <div className="text-center py-5 text-muted">{t('noImageAvailable')}</div>
                                    )}
                                </div>
                            ) : (
                                <div className="articles_section_body_textview">
                                    <div className="headline mb-4">
                                        <span className="headline_inner kicker" style={{ 
                                            color: '#eb0254', 
                                            fontWeight: 'bold', 
                                            fontSize: '18px',
                                            display: 'block', 
                                            marginBottom: '5px' 
                                        }}>
                                            {data.kicker || ''}
                                        </span>
                                        <div id="divheading" className="headline_inner">
                                            <h1 className="head_line" style={{ 
                                                fontSize: '32px', 
                                                fontWeight: '700', 
                                                lineHeight: locale === 'bn' ? '1.4' : '1.3',
                                                color: isDark ? '#fff' : '#111',
                                                marginBottom: '10px',
                                                fontFamily: locale === 'bn' ? 'var(--font-solaiman-lipi), serif' : 'inherit'
                                            }}>
                                                {data.title}
                                            </h1>
                                        </div>
                                    </div>

                                    <div className="article-meta-info" style={{ 
                                        margin: '5px 0 25px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '10px', 
                                        color: isDark ? '#aaa' : '#9a9a9a',
                                        borderBottom: isDark ? '1px solid #333' : '1px solid #eee', 
                                        paddingBottom: '10px' 
                                    }}>
                                    <span className="meta-item date" style={{ fontSize: locale === 'bn' ? '18px' : '14px', fontWeight: '400', lineHeight: '1.1' }}>
                                        {data.createdAt && formatDate(data.createdAt, locale)}
                                    </span>
                                    </div>

                                    <div id="body" className="story_body" style={{ 
                                        fontSize: `${fontSize}px`, 
                                        lineHeight: locale === 'bn' ? '1.5' : '1.6',
                                        color: isDark ? '#ccc' : '#333',
                                        fontFamily: locale === 'bn' ? 'var(--font-solaiman-lipi), serif' : 'inherit'
                                    }}>
                                        <div dangerouslySetInnerHTML={{ __html: data.text_view || '' }} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                  </div>
                );
            })()}
          </div>
        </main>
      </div>

      <style jsx>{`
        .action_item {
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: pointer;
            text-align: center;
            padding: 5px 10px;
            transition: all 0.2s;
        }
        .action_item i {
            font-size: 20px;
            margin-bottom: 3px;
            display: block;
        }
        .action_item label {
            font-size: 11px;
            text-transform: capitalize;
            cursor: pointer;
            margin: 0;
            display: block;
        }
        .action_item:hover {
            color: #eb0254;
        }
        .action_item.active {
            color: #eb0254;
            border-bottom: 2px solid #eb0254;
        }
        .story_body :global(p) {
            margin-bottom: 1.5rem;
            text-align: justify;
        }
        .story_body :global(img) {
            max-width: 100%;
            height: auto;
            margin: 20px 0;
            border-radius: 4px;
        }
        .locale-en .meta-item.date {
            font-size: 14px !important;
        }
        @media (max-width: 768px) {
            .article_paper_box {
                padding: 20px !important;
            }
            .action_item label {
                display: none;
            }
        }
      `}</style>
    </Layout>
  );
}
