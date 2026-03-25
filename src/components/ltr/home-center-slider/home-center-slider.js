"use client";

import Link from "next/link";
import { getStrapiMedia } from "@/lib/strapi";
import { useEffect, useRef, useState, useCallback } from "react";
import { useLanguage } from '@/lib/LanguageContext';

const AUTOPLAY_MS = 4000;

const dictionary = {
  en: { news: 'News', editor: 'Editor', by: 'By' },
  bn: { news: 'সংবাদ', editor: 'সম্পাদক', by: 'লিখেছেন:' },
};

const HomeCenterSlider = ({ data = [], isLoading = false }) => {
  const { locale } = useLanguage();
  const t = dictionary[locale] || dictionary.bn;
  const dateLocale = locale === 'en' ? 'en-US' : 'bn-BD';
  const items = data.slice(0, 5);

  const [current, setCurrent] = useState(0);
  const hoveredRef = useRef(false);
  const timerRef = useRef(null);

  const goTo = useCallback((index) => {
    setCurrent((index + items.length) % items.length);
  }, [items.length]);

  // Reset index when data changes
  useEffect(() => { setCurrent(0); }, [items.length]);

  // Autoplay
  useEffect(() => {
    if (items.length <= 1) return;
    timerRef.current = setInterval(() => {
      if (!hoveredRef.current) {
        setCurrent(c => (c + 1) % items.length);
      }
    }, AUTOPLAY_MS);
    return () => clearInterval(timerRef.current);
  }, [items.length]);

  if (!isLoading && items.length === 0) return null;

  if (items.length === 0) {
    return (
      <div className="home-hero-slider-skeleton">
        <div className="skeleton-slide">
          <div className="skeleton-image" />
          <div className="skeleton-content">
            <div className="skeleton-label" />
            <div className="skeleton-title" />
            <div className="skeleton-title" style={{ width: '80%' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      id="owl-slider"
      className="owl-carousel owl-theme owl-loaded home-hero-slider"
      onMouseEnter={() => { hoveredRef.current = true; }}
      onMouseLeave={() => { hoveredRef.current = false; }}
    >
      {/* Height anchor — keeps the container the correct height without JS */}
      <div className="post-height-1" style={{ visibility: 'hidden', pointerEvents: 'none' }} aria-hidden="true" />

      <div className="owl-stage-outer" style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {items.map((article, index) => {
          const articleData = article.attributes || article;
          const imageUrl = getStrapiMedia(articleData.cover);
          const category = articleData.category?.name || articleData.category?.data?.attributes?.name || t.news;
          const slug = articleData.slug || '#';
          const title = articleData.title || '';
          const authorName = articleData.author?.name || articleData.author?.data?.attributes?.name || t.editor;
          const date = new Date(articleData.createdAt || articleData.publishedAt).toLocaleDateString(dateLocale, { year: 'numeric', month: 'short', day: 'numeric' });
          const isActive = index === current;

          return (
            <div
              key={article.id || index}
              className={`owl-item item${isActive ? ' active' : ''}`}
              style={{
                position: 'absolute', inset: 0,
                opacity: isActive ? 1 : 0,
                transition: 'opacity 0.6s ease',
                pointerEvents: isActive ? 'auto' : 'none',
                zIndex: isActive ? 1 : 0,
              }}
              aria-hidden={!isActive}
            >
              <div className="slider-post post-height-1">
                <Link href={`/article/${slug}`} className="news-image">
                  <img
                    src={imageUrl}
                    alt={title}
                    className="img-fluid"
                    loading={index === 0 ? 'eager' : 'lazy'}
                    fetchPriority={index === 0 ? 'high' : 'auto'}
                    decoding="async"
                    onError={(e) => { e.target.src = '/default.jpg'; }}
                  />
                </Link>
                <div className="post-text">
                  <span className="post-category">{category}</span>
                  <h4 className="mb-2">
                    <Link href={`/article/${slug}`}>{title}</Link>
                  </h4>
                  <ul className="align-items-center authar-info d-flex flex-wrap">
                    <li className="post-atuthor-list">
                      <div className="post-atuthor">
                        <span><Link href="#">{authorName}</Link></span>
                      </div>
                    </li>
                    <li className="post-date">{date}</li>
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="owl-nav">
        <button className="owl-prev" onClick={() => goTo(current - 1)} aria-label="Previous">
          <i className="ti ti-angle-left" />
        </button>
        <button className="owl-next" onClick={() => goTo(current + 1)} aria-label="Next">
          <i className="ti ti-angle-right" />
        </button>
      </div>

      <div className="owl-dots">
        {items.map((_, i) => (
          <button
            key={i}
            className={`owl-dot${i === current ? ' active' : ''}`}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
          >
            <span />
          </button>
        ))}
      </div>
    </div>
  );
};

export default HomeCenterSlider;