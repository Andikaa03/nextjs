"use client";

import Link from "next/link";
import StickyBox from "react-sticky-box";
import { getStrapiMedia, formatDate, toBengaliNumber } from '@/lib/strapi';
import { useTranslations } from '@/lib/translations';
import ImageWithFallback from "@/components/ui/ImageWithFallback";

const ArticleSidebar = ({ mostViewed, popularNews, globalSettings: rawGlobalSettings, adsData, locale = 'bn' }) => {
  const { t } = useTranslations(locale);
  const globalSettings = rawGlobalSettings?.attributes || rawGlobalSettings;

  return (
    <StickyBox offsetTop={100} offsetBottom={20}>
      {/* START ADVERTISEMENT */}
      <div className="add-inner">
        <Link href={adsData?.articleBannerLink || '#'} target="_blank">
            <img
            src={getStrapiMedia(adsData?.articleBanner) || "/assets/images/add/sidebar.jpg"}
            className="img-fluid"
            alt="Sidebar Advertisement"
            onError={(e) => e.target.style.display = 'none'}
            />
        </Link>
      </div>
      {/* END OF /. ADVERTISEMENT */}
      
      {/* START SOCIAL COUNTER TEXT */}
      <div className="align-items-center d-flex fs-6 justify-content-center mb-1 text-center social-counter-total">
        <i className="fa-solid fa-heart text-primary me-1" /> {t('joinFollowers')}{" "}
        <span className="fw-bold mx-1">{globalSettings?.socialTotalFollowers || '0'}</span> {t('followers')}
      </div>
      {/* END OF /. SOCIAL COUNTER TEXT */}

      {/* START SOCIAL ICON */}
      <div className="social-media-inner mb-2">
        <ul className="g-1 row social-media">
          <li className="col-4">
            <Link href={globalSettings?.socialRssUrl || '#'} className="rss" target="_blank">
              <i className="fas fa-rss" />
              <div>{globalSettings?.socialRssSubscribers || 0}</div>
              <p className="social-text follower-label-text">{t('subscribers')}</p>
            </Link>
          </li>
          <li className="col-4">
            <Link href={globalSettings?.socialFacebookUrl || '#'} className="fb" target="_blank">
              <i className="fab fa-facebook-f" />
              <div>{globalSettings?.socialFacebookFans || 0}</div>
              <p className="social-text follower-label-text">{t('fans')}</p>
            </Link>
          </li>
          <li className="col-4">
            <Link href={globalSettings?.socialInstagramUrl || '#'} className="insta" target="_blank">
              <i className="fab fa-instagram" />
              <div>{globalSettings?.socialInstagramFollowers || 0}</div>
              <p className="social-text follower-label-text">{t('followers')}</p>
            </Link>
          </li>
          <li className="col-4">
            <Link href={globalSettings?.socialYoutubeUrl || '#'} className="you_tube" target="_blank">
              <i className="fab fa-youtube" />
              <div>{globalSettings?.socialYoutubeSubscribers || 0}</div>
              <p className="social-text follower-label-text">{t('subscribers')}</p>
            </Link>
          </li>
          <li className="col-4">
            <Link href={globalSettings?.socialTwitterUrl || '#'} className="twitter" target="_blank">
              <i className="fab fa-twitter" />
              <div>{globalSettings?.socialTwitterFollowers || 0}</div>
              <p className="social-text follower-label-text">{t('followers')}</p>
            </Link>
          </li>
          <li className="col-4">
            <Link href={globalSettings?.socialPinterestUrl || '#'} className="pint" target="_blank">
              <i className="fab fa-pinterest-p" />
              <div>{globalSettings?.socialPinterestFollowers || 0}</div>
              <p className="social-text follower-label-text">{t('followers')}</p>
            </Link>
          </li>
        </ul>
      </div>
      {/* END OF /. SOCIAL ICON */}

      {/* START NAV TABS */}
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
              {t('mostViewed')}
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
              {t('popular')}
            </button>
          </li>
        </ul>
        <div className="tab-content" id="myTabContent">
          <div
            className="tab-pane fade show active"
            id="most-viewed-pane"
            role="tabpanel"
            aria-labelledby="most-viewed"
            tabIndex="0"
          >
            <div className="most-viewed">
              <ul id="most-today" className="content tabs-content">
                {mostViewed && mostViewed.length > 0 ? (
                    mostViewed.slice(0, 5).map((item, index) => {
                        const data = item.attributes || item;
                        return (
                            <li key={index}>
                              <span className="count">0{index + 1}</span>
                              <span className="text">
                                <Link href={`/${locale === 'en' ? 'en/article' : 'article'}/${data.slug}${locale === 'bn' ? '-bn' : ''}`}>
                                  {data.title}
                                </Link>
                              </span>
                            </li>
                        );
                    })
                ) : (
                    <li>No most viewed articles</li>
                )}
              </ul>
            </div>
          </div>
          <div
            className="tab-pane fade"
            id="popular-news-pane"
            role="tabpanel"
            aria-labelledby="popular-news"
            tabIndex="0"
          >
            <div className="popular-news">
             {popularNews && popularNews.length > 0 ? (
                popularNews.slice(0, 5).map((item, index) => {
                    const data = item.attributes || item;
                    return (
                      <div className="p-post" key={index}>
                        <h4>
                          <Link href={`/${locale === 'en' ? 'en/article' : 'article'}/${data.slug}${locale === 'bn' ? '-bn' : ''}`}>
                            {data.title}
                          </Link>
                        </h4>
                        <ul className="authar-info d-flex flex-wrap justify-content-center">
                          <li className="date">
                            <Link href="#">
                              <p className="social-text">{t('subscribers')}</p> {formatDate(data.publishedAt, locale)}
                            </Link>
                          </li>
                          <li className="like">
                            <Link href="#">
                              <i className="ti ti-thumb-up" />
                              {data.likes || 0} likes
                            </Link>
                          </li>
                        </ul>
                        {data.rating > 0 && (
                        <div className="reatting-2">
                          {[1,2,3,4,5].map(star => (
                            <i key={star} className={`fas ${data.rating >= star ? 'fa-star' : data.rating >= star - 0.5 ? 'fa-star-half-alt' : 'far fa-star'}`} />
                          ))}
                        </div>
                        )}
                      </div>
                    );
                })
            ) : (
                <p>No popular news</p>
            )}
            </div>
          </div>
        </div>
      </div>
    </StickyBox>
  );
};

export default ArticleSidebar;
