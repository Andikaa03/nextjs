
import dynamic from "next/dynamic";
import Link from "next/link";
import { getStrapiMedia } from "@/lib/strapi";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import 'animate.css/animate.css'
import React, { useEffect } from 'react';
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

const OwlCarousel = dynamic(() => import("react-owl-carousel"), {
  ssr: false,
});

const HomeFeatureCarousal = ({ data = [], isLoading = false }) => {
  const { locale } = useLanguage();
  const t = dictionary[locale] || dictionary.bn;
  const items = data;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadJQuery = async () => {
      if (!window.jQuery) {
        const jqueryModule = await import('jquery');
        const jquery = jqueryModule.default || jqueryModule;
        window.$ = window.jQuery = jquery;
      }
    };

    loadJQuery();
  }, []);

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
    <OwlCarousel
      key={isLoading ? 'loading' : 'loaded'}
      className="owl-theme featured-carousel"
      loop={true}
      margin={10}
      nav={false}
      dots={false}
      responsive={{
        0: { items: 1, autoplay: true },
        576: { items: 2 },
        768: { items: 2.5 },
        992: { items: 3.5 },
        1200: { items: 4 }
      }}
    >
      {items.map((article, index) => renderItem(article, index, isLoading))}
    </OwlCarousel>
  );
};



export default HomeFeatureCarousal;