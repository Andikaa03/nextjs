
"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ScrollToTopUI from '../scroll-to-top/scroll-to-top';
import { useBackgroundImageLoader } from '../use-background-image/use-background-image';
import { getRecentPostArticles } from '@/services/articleService';
import { getCategories, getTags, getFooterData, getMenuItems, getGlobalSettings } from '@/services/globalService';
import { getStrapiMedia, formatDate, toBengaliNumber, getStrapiLocale } from '@/lib/strapi';
import { useLanguage } from '@/lib/LanguageContext';

const dictionary = {
  en: {
    description: "Satyadhara Pratidin - Always in search of truth. We are committed to serving neutral and objective news.",
    subscribe: {
      placeholder: "Enter your email address",
      btn: "Subscribe",
      text: "By subscribing you agree to our",
      privacy: "Privacy Policy",
      agree: "."
    },
    app: {
      title: "Download App",
      text: "Scan QR code and download our app."
    },
    social: "Social Contact",
    socialLinks: {
      fb: "Facebook",
      tw: "Twitter",
      yt: "Youtube",
      ig: "Instagram"
    },
    category: "Category",
    recentPost: "Recent Post",
    hotTopics: "Popular Topics",
    copyright: "Copyright: \u00A9 2026 Satyadhara Pratidin",
    links: {
      privacy: "Privacy",
      contact: "Contact",
      donation: "Donation",
      faq: "FAQ"
    }
  },
  bn: {
    description: "সত্যধারা প্রতিদিন - সত্যের সন্ধানে সর্বদা। আমরা নিরপেক্ষ ও বস্তুনিষ্ঠ সংবাদ পরিবেশনে প্রতিশ্রুতিবদ্ধ।",
    subscribe: {
      placeholder: "আপনার ইমেইল ঠিকানা লিখুন",
      btn: "সাবস্ক্রাইব",
      text: "সাবস্ক্রাইব করার মাধ্যমে আপনি আমাদের",
      privacy: "গোপনীয়তা নীতি",
      agree: "তে সম্মত হচ্ছেন।"
    },
    app: {
      title: "অ্যাপ ডাউনলোড করুন",
      text: "কিউআর কোড স্ক্যান করুন এবং আমাদের অ্যাপ ডাউনলোড করুন।"
    },
    social: "সামাজিক যোগাযোগ",
    socialLinks: {
      fb: "ফেসবুক",
      tw: "টুইটার",
      yt: "ইউটিউব",
      ig: "ইনস্টাগ্রাম"
    },
    category: "বিভাগ",
    recentPost: "সাম্প্রতিক পোস্ট",
    hotTopics: "জনপ্রিয় টপিক",
    copyright: "স্বত্ব: \u00A9 ২০২৬ সত্যধারা প্রতিদিন",
    links: {
      privacy: "গোপনীয়তা",
      contact: "যোগাযোগ",
      donation: "অনুদান",
      faq: "প্রশ্নাবলী"
    }
  }
};

const Footer = () => {
  useBackgroundImageLoader();
  const { locale } = useLanguage();
  const isBanglaLocale = (locale || '').toLowerCase().startsWith('bn');
  const t = dictionary[locale] || dictionary.bn;
  const [recentPosts, setRecentPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [hotTopics, setHotTopics] = useState([]);

  const [footerData, setFooterData] = useState(null);
  const [globalSettings, setGlobalSettings] = useState(null);
  const [footerMenuItems, setFooterMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const strapiLocale = getStrapiLocale(locale);
        const [recentRes, catRes, tagRes, footerDataRes, footerMenuRes, globalRes] = await Promise.all([
          getRecentPostArticles(3, locale), // Fetch 3 recent posts (isRecentPost=true)
          getCategories(6, locale), // Fetch 6 categories (generic)
          getTags(12, locale), // Fetch 12 tags for hot topics
          getFooterData(locale), // Fetch footer data
          getMenuItems('footer', locale), // Fetch footer menu
          getGlobalSettings(locale)
        ]);

        let recentPostsData = recentRes?.data || [];
        // Fallback to 'bn' if 'bn-BD' is empty for articles
        if (recentPostsData.length === 0 && strapiLocale === 'bn-BD') {
          const fallbackRes = await getLatestArticles(1, 3, 'bn');
          recentPostsData = fallbackRes?.data || [];
        }

        setRecentPosts(recentPostsData);
        setCategories(catRes?.data || []);
        setHotTopics(tagRes?.data || []);
        setFooterData(footerDataRes?.data || null);
        
        const globalRaw = globalRes?.data || globalRes || null;
        setGlobalSettings(globalRaw?.attributes || globalRaw);
        
        const footerItems = footerMenuRes?.data || [];
        setFooterMenuItems(footerItems);
      } catch (error) {
        console.error("Error fetching footer data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [locale]);

  // Split categories into two columns
  const midIndex = Math.ceil(categories.length / 2);
  const leftCategories = categories.slice(0, midIndex);
  const rightCategories = categories.slice(midIndex);

  const footerAttrs = footerData?.attributes || footerData || {};
  const footerPrimaryText = footerAttrs?.description || t.description || '';
  const hasBanglaFooterText = /[\u0980-\u09FF]/.test(footerPrimaryText);
  const applyBanglaFooterClass = isBanglaLocale || hasBanglaFooterText;

  return (
    <>
       <ScrollToTopUI/>
      {/* *** START FOOTER *** */}
      <footer
        id="footer"
        className={`main-footer ${applyBanglaFooterClass ? 'footer-locale-bn' : ''}`}
        style={{
          backgroundImage: `url(${getStrapiMedia(footerAttrs?.backgroundImage) || "/assets/images/1920x1000-1.jpg"})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="container position-relative z-1">
          <div className="g-3 row">
            <div className="col-md-3">
              <img
                src={getStrapiMedia(footerAttrs?.logo) || "/assets/images/logo-white.png"}
                alt="footer logo"
                className="img-fluid"
              />
            </div>
            <div className="col-md-5">
              <p className="text-white mb-0">
                {footerAttrs?.description || t.description}
              </p>
            </div>
            <div className="col-md-4">
              {/* Form */}
              <form className="row row-cols-lg-auto g-2 align-items-center justify-content-end">
                <div className="col-12">
                  <input
                    type="email"
                    className="form-control"
                    placeholder={t.subscribe.placeholder}
                  />
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-news m-0">
                    {t.subscribe.btn}
                  </button>
                </div>
                <div className="form-text mt-2 text-white">
                  {(() => {
                    const text = footerAttrs?.newsletterText;
                    if (text) {
                      const placeholder = "[privacy_policy]";
                      if (text.includes(placeholder)) {
                        const parts = text.split(placeholder);
                        return (
                          <>
                            {parts[0]}
                            <Link href={footerAttrs?.privacyPolicyUrl || "#"} className="text-decoration-underline text-primary">
                              {t.subscribe.privacy}
                            </Link>
                            {parts[1]}
                          </>
                        );
                      }
                      return text;
                    }
                    return (
                      <>
                        {t.subscribe.text}
                        <Link href={footerAttrs?.privacyPolicyUrl || "#"} className="text-decoration-underline text-primary ms-1">
                          {t.subscribe.privacy}
                        </Link>
                        {t.subscribe.agree}
                      </>
                    );
                  })()}
                </div>
              </form>
            </div>
          </div>
          <hr className="mt-5 mb-4" />
          <div className="row">
            {/* START FOOTER BOX (Qr Code) */}
            <div className="col-sm-6 col-lg-3 footer-box py-4">
              <div className="about-inner text-center">
                <h5 className="wiget-title">{t.app.title}</h5>
                <div className="bg-white pb-0 mb-3 d-inline-block rounded">
                  {/* Start Qr Code Image */}
                  <img
                    src={getStrapiMedia(footerAttrs?.appQrImage) || "/assets/images/qr-code.png"}
                    height={180}
                    width={180}
                    alt="Qr Code"
                  />
                  {/* /. End Qr Code Image */}
                </div>
                <p>{footerAttrs?.appDescription || t.app.text}</p>
              </div>
            </div>
            {/*  END OF /. FOOTER BOX (Qr Code) */}
            
            {/* START FOOTER BOX (Social Contact - Was Twitter) */}
            <div className="col-sm-6 col-lg-3 footer-box py-4">
               <h5 className="wiget-title">{t.social}</h5>
                <ul className="list-unstyled m-0 menu-services">
                    <li><a href={globalSettings?.socialFacebookUrl || "#"} target="_blank">{t.socialLinks.fb}</a></li>
                    <li><a href={globalSettings?.socialTwitterUrl || "#"} target="_blank">{t.socialLinks.tw}</a></li>
                    <li><a href={globalSettings?.socialYoutubeUrl || "#"} target="_blank">{t.socialLinks.yt}</a></li>
                    <li><a href={globalSettings?.socialInstagramUrl || "#"} target="_blank">{t.socialLinks.ig}</a></li>
                </ul>
            </div>
            {/* END OF /. FOOTER BOX (Social Contact) */}

            {/* START FOOTER BOX (Category) */}
            <div className="col-sm-6 col-lg-3 footer-box py-4">
              <h5 className="wiget-title">{t.category}</h5>
              <div className="row">
                <div className="col-6">
                  <ul className="list-unstyled m-0 menu-services">
                    {leftCategories.map((cat, i) => (
                      <li key={i}>
                        <Link href={`/category/${cat.attributes?.slug || cat.slug || '#'}`}>
                          {cat.attributes?.name || cat.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="col-6">
                  <ul className="list-unstyled m-0 menu-services">
                    {rightCategories.map((cat, i) => (
                      <li key={i}>
                        <Link href={`/category/${cat.attributes?.slug || cat.slug || '#'}`}>
                          {cat.attributes?.name || cat.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            {/* END OF /. FOOTER BOX (Category) */}

            {/* START FOOTER BOX (Recent Post) */}
            <div className="col-sm-6 col-lg-3 footer-box py-4">
              <h5 className="wiget-title">{t.recentPost}</h5>
              <div className="footer-news-grid">
                {recentPosts.map((post, i) => {
                  const p = post.attributes || post;
                  const img = getStrapiMedia(p.cover);
                  const date = formatDate(p.createdAt || p.publishedAt, locale);
                  
                  return (
                    <div className="news-list-item" key={i}>
                      <div className="img-wrapper">
                        <Link href={`/article/${p.slug}`} className="thumb">
                          <img
                            src={img}
                            alt={p.title}
                            className="img-fluid"
                            onError={(e) => e.target.src = '/default.jpg'}
                          />
                        </Link>
                      </div>
                      <div className="post-info-2">
                        <h5>
                          <Link href={`/article/${p.slug}`} className="title">
                            {p.title}
                          </Link>
                        </h5>
                        <ul className="align-items-center authar-info d-flex flex-wrap gap-1">
                          <li>{date}</li>
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* END OF /. FOOTER BOX (Recent Post) */}

          </div>
          {/* START HOT TOPICS */}
          <h5 className="wiget-title">{t.hotTopics}</h5>
          <ul className="lh-lg list-inline mb-0 text-primary-hover hot-topics">
            {hotTopics.map((tag, i) => (
              <li className="list-inline-item" key={i}>
                <Link href={`/bn/tag/${tag.attributes?.slug || '#'}`}>
                   {tag.attributes?.name}
                </Link>
              </li>
            ))}
          </ul>
          {/* END OF /. HOT TOPICS */}
        </div>
      </footer>
      {/* *** END OF /. FOOTER *** */}

      {/* *** START SUB FOOTER *** */}
      <div className={`sub-footer ${applyBanglaFooterClass ? 'footer-locale-bn' : ''}`}>
        <div className="container">
          <div className="align-items-center g-1 g-sm-3 row">
            <div className="col text-center text-sm-start">
              <div className="copy">{t.copyright}</div>
            </div>
            <div className="col-sm-auto">
              <ul className="footer-nav list-unstyled text-center mb-0">
                {footerMenuItems.length > 0 ? (
                  footerMenuItems.map((item, index) => {
                    const data = item.attributes || item;
                    const title = data.title;
                    const url = data.url || '#';
                    const finalUrl = url.startsWith('http') || url === '#' ? url : (url.startsWith('/') ? url : `/${url}`);
                    return (
                        <li className="list-inline-item" key={data.id || index}>
                            <Link href={finalUrl}>{title}</Link>
                        </li>
                    );
                  })
                ) : (
                  <li className="list-inline-item">No Menu Items</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>


    </>
  );
};

export default Footer;