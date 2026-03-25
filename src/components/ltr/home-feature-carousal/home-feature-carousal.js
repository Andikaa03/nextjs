"use client";
import Link from "next/link";
import { getStrapiMedia } from "@/lib/strapi";
import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';

const dictionary = {
  en: {
    news: 'News',
    loading: 'Loading...'
  },
  bn: {
    news: 'সংবাদ',
    loading: 'লোড হচ্ছে...'
  }
};

const HomeFeatureCarousal = ({ data = [], isLoading = false }) => {
  const { locale } = useLanguage();
  const t = dictionary[locale] || dictionary.bn;
  const items = data.slice(0, 8);

  if (!isLoading && items.length === 0) return null;

  const renderItem = (article, index, isPlaceholder = false) => {
    const articleData = article.attributes || article;
    const imageUrl = getStrapiMedia(articleData.cover);
    // robust category access
    const category = articleData.category?.name || articleData.category?.data?.attributes?.name || t.news;
    const slug = articleData.slug || '#';
    const title = articleData.title || t.loading;

    return (
      <div key={article.id || index} className="news-list-item">
        <div className="img-wrapper">
          <Link href={isPlaceholder ? '#' : `/article/${slug}`} className="thumb">
            <img
              src={imageUrl}
              alt={title}
              className="img-fluid"
              onError={(e) => e.target.src = '/default.jpg'}
            />
            <div className="link-icon">
              <i className="fa fa-camera" />
            </div>
          </Link>
        </div>
        <div className="post-info-2 pt-3 pt-md-0">
          <span className="post-category">{category}</span>
          <h5 className="mb-0">
            <Link href={isPlaceholder ? '#' : `/article/${slug}`} className="title">
              {title}
            </Link>
          </h5>
        </div>
      </div>
    );
  };
  
  return (
    <div className="featured-carousel featured-carousel-static d-flex gap-3 overflow-auto align-items-start">
      {items.map((article, index) => renderItem(article, index, isLoading))}
    </div>
  );
};



export default HomeFeatureCarousal;