
"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ScrollToTopUI from '../scroll-to-top/scroll-to-top';
import { useBackgroundImageLoader } from '../use-background-image/use-background-image';
import { getRecentPostArticles, getLatestArticles } from '@/services/articleService';
import { getTags, getMenuItems, getGlobalSettings } from '@/services/globalService';
import { subscribeNewsletter } from '@/services/newsletterService';
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
    },
    newsletter: {
      success: "Subscribed successfully!",
      duplicate: "This email is already subscribed.",
      error: "Subscription failed. Please try again."
    },
    contact: {
      address: "Address",
      email: "Email",
      phone: "Phone"
    },
    editorial: {
      title: "Satyadhara Pratidin",
      office: "Editorial Office",
      address1: "House 12, Road 7, Dhanmondi",
      address2: "Dhaka 1209, Bangladesh",
      phone: "Phone: +880 1712-345678",
      email: "Email: press@sottyodharaprotidin.com",
      editor: "Editor:",
      publisher: "Publisher:"
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
    },
    newsletter: {
      success: "সফলভাবে সাবস্ক্রাইব হয়েছে!",
      duplicate: "এই ইমেইল ইতিমধ্যে সাবস্ক্রাইব করা আছে।",
      error: "সাবস্ক্রিপশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।"
    },
    contact: {
      address: "ঠিকানা",
      email: "ইমেইল",
      phone: "ফোন"
    },
    editorial: {
      title: "সত্যধারা প্রতিদিন",
      office: "সম্পাদকীয় কার্যালয়",
      address1: "হাউস ১২, রোড ৭, ধানমন্ডি",
      address2: "ঢাকা ১২০৯, বাংলাদেশ",
      phone: "ফোন: +৮৮০ ১৭১২-৩৪৫৬৭৮",
      email: "ইমেইল: press@sottyodharaprotidin.com",
      editor: "সম্পাদক:",
      publisher: "প্রকাশক:"
    }
  }
};

const Footer = ({ hideMiddleHeader = false }) => {
  useBackgroundImageLoader();
  const { locale } = useLanguage();
  const isBanglaLocale = (locale || '').toLowerCase().startsWith('bn');
  const t = dictionary[locale] || dictionary.bn;
  const [recentPosts, setRecentPosts] = useState([]);
  const [hotTopics, setHotTopics] = useState([]);

  const [footerData, setFooterData] = useState(null);
  const [globalSettings, setGlobalSettings] = useState(null);
  const [footerMenuItems, setFooterMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Newsletter form state
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState(null);
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const turnstileRef = useRef(null);
  const [turnstileToken, setTurnstileToken] = useState(null);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  // Load Cloudflare Turnstile script
  useEffect(() => {
    if (!turnstileSiteKey) return;
    if (document.getElementById('cf-turnstile-script')) return;
    const script = document.createElement('script');
    script.id = 'cf-turnstile-script';
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, [turnstileSiteKey]);

  // Render Turnstile widget after script loads
  useEffect(() => {
    if (!turnstileSiteKey || !turnstileRef.current) return;
    const interval = setInterval(() => {
      if (window.turnstile && turnstileRef.current) {
        clearInterval(interval);
        window.turnstile.render(turnstileRef.current, {
          sitekey: turnstileSiteKey,
          callback: (token) => setTurnstileToken(token),
          'expired-callback': () => setTurnstileToken(null),
          theme: 'dark',
          size: 'compact',
        });
      }
    }, 200);
    return () => clearInterval(interval);
  }, [turnstileSiteKey, loading]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const strapiLocale = getStrapiLocale(locale);
        const [recentRes, tagRes, footerMenuRes, globalRes] = await Promise.all([
          getRecentPostArticles(3, locale), // Fetch 3 recent posts (isRecentPost=true)
          getTags(12, locale), // Fetch 12 tags for hot topics
          getMenuItems('footer', locale), // Fetch footer menu & attributes
          getGlobalSettings(locale)
        ]);

        let recentPostsData = recentRes?.data || [];
        // Fallback to 'bn' if 'bn-BD' is empty for articles
        if (recentPostsData.length === 0 && strapiLocale === 'bn-BD') {
          const fallbackRes = await getLatestArticles(1, 3, 'bn');
          recentPostsData = fallbackRes?.data || [];
        }

        setRecentPosts(recentPostsData);
        setHotTopics(tagRes?.data || []);
        const footerItems = footerMenuRes?.data || [];
        const footerAttrs = footerMenuRes?.attributes || {};
        
        setFooterMenuItems(footerItems);
        setFooterData(footerAttrs);
        
        const globalRaw = globalRes?.data || globalRes || null;
        setGlobalSettings(globalRaw?.attributes || globalRaw);
      } catch (error) {
        console.error("Error fetching footer data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [locale]);

  const footerAttrs = footerData?.attributes || footerData || {};
  
  // Determine which categories to use
  const footerCategories = footerAttrs?.footerCategoryLinks || [];
  
  const displayCategories = footerCategories;

  // Split categories into two columns
  const midIndex = Math.ceil(displayCategories.length / 2);
  const leftCategories = displayCategories.slice(0, midIndex);
  const rightCategories = displayCategories.slice(midIndex);

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
        style={footerAttrs?.backgroundImage ? {
          backgroundImage: `url(${getStrapiMedia(footerAttrs?.backgroundImage)})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        } : {}}
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
              <p className="text-white mb-0 footer-description">
                {footerAttrs?.description || t.description}
              </p>
            </div>
            <div className="col-md-4">
              {/* Newsletter Form */}
              <form className="row row-cols-lg-auto g-2 align-items-center justify-content-end" onSubmit={async (e) => {
                e.preventDefault();
                if (!newsletterEmail || newsletterSubmitting) return;
                setNewsletterSubmitting(true);
                setNewsletterMessage(null);
                const result = await subscribeNewsletter(newsletterEmail, 'footer', turnstileToken);
                if (result.success) {
                  setNewsletterSuccess(true);
                  setNewsletterMessage(t.newsletter.success);
                  setNewsletterEmail('');
                  // Reset Turnstile
                  if (window.turnstile && turnstileRef.current) {
                    window.turnstile.reset(turnstileRef.current);
                    setTurnstileToken(null);
                  }
                } else if (result.error === 'duplicate') {
                  setNewsletterSuccess(false);
                  setNewsletterMessage(t.newsletter.duplicate);
                } else {
                  setNewsletterSuccess(false);
                  setNewsletterMessage(t.newsletter.error);
                }
                setNewsletterSubmitting(false);
              }}>
                <div className="col-12">
                    <input
                      type="email"
                      className="form-control"
                      placeholder={footerAttrs?.newsletterPlaceholder || t.subscribe.placeholder}
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-12">
                    <button type="submit" className="btn btn-news m-0" disabled={newsletterSubmitting}>
                      {newsletterSubmitting ? '...' : (footerAttrs?.newsletterButtonText || t.subscribe.btn)}
                    </button>
                </div>
                {turnstileSiteKey && (
                  <div className="col-12 mt-2">
                    <div ref={turnstileRef}></div>
                  </div>
                )}
                <div className="form-text mt-2 text-white footer-newsletter-text">
                  {(() => {
                    const text = footerAttrs?.newsletterText;
                    // Find Privacy link from menu
                    const privacyItem = footerMenuItems.find(item => 
                      (item.attributes?.title || item.title || '').toLowerCase().includes('privacy')
                    );
                    const privacyUrl = privacyItem?.attributes?.url || privacyItem?.url || "#";

                    if (text) {
                      const placeholder = "[privacy_policy]";
                      if (text.includes(placeholder)) {
                        const parts = text.split(placeholder);
                        return (
                          <>
                            {parts[0]}
                            <Link href={privacyUrl} className="text-decoration-underline text-primary">
                              {t.subscribe.privacy}
                            </Link>
                            {parts[1]}
                          </>
                        );
                      }
                      return <span dangerouslySetInnerHTML={{ __html: text }} />;
                    }
                    return (
                      <>
                        {t.subscribe.text}
                        <Link href={privacyUrl} className="text-decoration-underline text-primary ms-1">
                          {t.subscribe.privacy}
                        </Link>
                        {t.subscribe.agree}
                      </>
                    );
                  })()}
                </div>
                {newsletterMessage && (
                  <div className={`form-text mt-2 ${newsletterSuccess ? 'text-success' : 'text-warning'}`}>
                    {newsletterMessage}
                  </div>
                )}
              </form>
            </div>
          </div>
          <hr className="mt-5 mb-4" />
          <div className="row">
            {/* START FOOTER BOX (Qr Code) */}
            {!hideMiddleHeader && (
              <div className="col-sm-6 col-lg-3 footer-box py-4 footer-hide-mobile">
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
            )}
            {/*  END OF /. FOOTER BOX (Qr Code) */}
            
            {/* START FOOTER BOX (Social Contact - Dynamic) */}
            <div className={hideMiddleHeader ? "col-sm-6 col-lg-4 footer-box py-4 footer-social-box" : "col-sm-6 col-lg-3 footer-box py-4 footer-social-box"}>
               <h5 className="wiget-title">{footerAttrs?.socialTitle || t.social}</h5>
                <ul className="list-unstyled m-0 menu-services">
                    {footerAttrs?.socialLinks && footerAttrs.socialLinks.length > 0 ? (
                        footerAttrs.socialLinks.map((link, i) => (
                            <li key={i}>
                                <a href={link.url || "#"} target="_blank" rel="noopener noreferrer">
                                    {link.title}
                                </a>
                            </li>
                        ))
                    ) : (
                        <>
                            <li><a href={globalSettings?.socialFacebookUrl || "#"} target="_blank" rel="noopener noreferrer">{t.socialLinks.fb}</a></li>
                            <li><a href={globalSettings?.socialTwitterUrl || "#"} target="_blank" rel="noopener noreferrer">{t.socialLinks.tw}</a></li>
                            <li><a href={globalSettings?.socialYoutubeUrl || "#"} target="_blank" rel="noopener noreferrer">{t.socialLinks.yt}</a></li>
                            <li><a href={globalSettings?.socialInstagramUrl || "#"} target="_blank" rel="noopener noreferrer">{t.socialLinks.ig}</a></li>
                        </>
                    )}
                </ul>

                {/* Editorial Office Info */}
                <div className="mt-5 text-white footer-editorial" style={{ fontSize: '14px', lineHeight: '1.6' }}>
                  <h5 className="wiget-title mb-1">{footerAttrs?.editorialName || t.editorial.title}</h5>
                  <p className="mb-0">{footerAttrs?.editorialOffice || t.editorial.office}</p>
                  <p className="mb-0">{footerAttrs?.editorialAddress1 || t.editorial.address1}</p>
                  <p className="mb-0">{footerAttrs?.editorialAddress2 || t.editorial.address2}</p>
                  <p className="mb-0">{footerAttrs?.editorialPhone || t.editorial.phone}</p>
                  <p className="mb-0" style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>{footerAttrs?.editorialEmail || t.editorial.email}</p>
                  <p className="mb-0">{footerAttrs?.editorialEditor || t.editorial.editor}</p>
                  <p className="mb-0">{footerAttrs?.editorialPublisher || t.editorial.publisher}</p>
                </div>
            </div>
            {/* END OF /. FOOTER BOX (Social Contact) */}

            {/* START FOOTER BOX (Category) */}
            <div className={hideMiddleHeader ? "col-sm-6 col-lg-4 footer-box py-4 footer-hide-mobile" : "col-sm-6 col-lg-3 footer-box py-4 footer-hide-mobile"}>
              <h5 className="wiget-title">{footerAttrs?.categoryTitle || t.category}</h5>
              <div className="row">
                <div className="col-6">
                  <ul className="list-unstyled m-0 menu-services">
                    {leftCategories.map((cat, i) => (
                      <li key={i}>
                        <Link href={cat.url || '#'}>
                          {cat.title || cat.attributes?.name || cat.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="col-6">
                  <ul className="list-unstyled m-0 menu-services">
                    {rightCategories.map((cat, i) => (
                      <li key={i}>
                        <Link href={cat.url || '#'}>
                          {cat.title || cat.attributes?.name || cat.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            {/* END OF /. FOOTER BOX (Category) */}

            {/* START FOOTER BOX (Recent Post) */}
            <div className={hideMiddleHeader ? "col-sm-6 col-lg-4 footer-box py-4 footer-hide-mobile" : "col-sm-6 col-lg-3 footer-box py-4 footer-hide-mobile"}>
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



        </div>
      </footer>
      {/* *** END OF /. FOOTER *** */}

      {/* *** START SUB FOOTER *** */}
      <div className={`sub-footer ${applyBanglaFooterClass ? 'footer-locale-bn' : ''}`}>
        <div className="container">
          <div className="align-items-center g-1 g-sm-3 row">
            <div className="col text-center text-sm-start">
              <div className="copy" dangerouslySetInnerHTML={{ __html: footerAttrs?.copyrightText || t.copyright }}></div>
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