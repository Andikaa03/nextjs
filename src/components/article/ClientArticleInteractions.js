"use client";

import { useEffect, useState } from 'react';
import { incrementViewCount } from '@/services/articleService';
import Link from "next/link";
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import { getStrapiMedia, formatDate } from '@/lib/strapi';
import Skeleton from '@/components/skeleton';

export default function ClientArticleInteractions({ 
  articleId, 
  articleViewCount, 
  language, 
  locale,
  initialMostViewed = [],
  initialPopular = [],
  initialGlobalSettings = null,
  t
}) {
  const [mostViewed, setMostViewed] = useState(initialMostViewed);
  const [popular, setPopular] = useState(initialPopular);
  // We can use initial data or fetch more if needed. For now, we use passed data.

  // Increment view count with debounce/timer and session check
  useEffect(() => {
    let timer;

    if (articleId) {
      const storageKey = `viewed_article_${articleId}`;
      const hasViewed = sessionStorage.getItem(storageKey);

      if (!hasViewed) {
        // Wait 10 seconds before counting as a view
        timer = setTimeout(() => {
          incrementViewCount(articleId, articleViewCount);
          sessionStorage.setItem(storageKey, 'true');
        }, 10000); 
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [articleId, articleViewCount]);

  // Helper to render sidebar article list
  const renderSidebarArticles = (articles) => (
    <div className="footer-news-grid">
      {articles.map((item) => {
        const itemData = item.attributes || item;
        if (!itemData) return null;
        
        const itemImage = getStrapiMedia(itemData.cover);
        const itemSlug = itemData.slug;
        const itemTitle = itemData.title || 'Untitled';
        
        if (!itemSlug) return null;

        return (
          <div className="news-list-item" key={item.id}>
            <div className="img-wrapper">
              <Link href={`/${language}/article/${itemSlug}`} className="thumb">
                <ImageWithFallback src={itemImage} alt={itemTitle} className="img-fluid" width={80} height={60} />
              </Link>
            </div>
            <div className="post-info-2">
              <h5>
                <Link href={`/${language}/article/${itemSlug}`} className="title" style={{ fontSize: '0.85rem' }}>
                  {itemTitle}
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

  return (
    <div className="tabs-wrapper">
        <ul className="nav nav-tabs" id="myTab" role="tablist">
          <li className="nav-item" role="presentation">
            <button className="nav-link border-0 active" id="most-viewed-tab" data-bs-toggle="tab" data-bs-target="#most-viewed" type="button" role="tab" aria-controls="most-viewed" aria-selected="true">
              {t.mostViewed}
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button className="nav-link border-0" id="popular-news-tab" data-bs-toggle="tab" data-bs-target="#popular-news" type="button" role="tab" aria-controls="popular-news" aria-selected="false">
              {t.popularNews}
            </button>
          </li>
        </ul>
        <div className="tab-content" id="myTabContent">
          <div className="tab-pane fade show active" id="most-viewed" role="tabpanel" aria-labelledby="most-viewed-tab">
            <div className="most-viewed">
              {mostViewed.length > 0 ? renderSidebarArticles(mostViewed) : (
                <div className="p-3 text-muted">{t.notFound}</div>
              )}
            </div>
          </div>
          <div className="tab-pane fade" id="popular-news" role="tabpanel" aria-labelledby="popular-news-tab">
            <div className="popular-news">
              {popular.length > 0 ? renderSidebarArticles(popular) : (
                <div className="p-3 text-muted">{t.notFound}</div>
              )}
            </div>
          </div>
        </div>
    </div>
  );
}
