

import Image from "next/image";
import Link from "next/link";
import ClientStickyBox from "@/components/ui/ClientStickyBox";
import RelatedArticles from "@/components/article/RelatedArticles";
import TrendingTopics from "@/components/homepage/TrendingNews";
import Comments from "@/components/article/Comments";
import ClientArticleInteractions from "@/components/article/ClientArticleInteractions";
import { getArticleBySlug, getMostViewedArticles, getPopularArticles } from '@/services/articleService';
import { getGlobalSettings, getTrendingCategories } from '@/services/globalService'; // Added getTrendingCategories
import { getStrapiMedia, formatDate } from '@/lib/strapi';
import ImageWithFallback from '@/components/ui/ImageWithFallback';

// Force dynamic rendering since we rely on request params and external data
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const locale = params.lang === 'bn' ? 'bn' : 'en';
  const articleData = await getArticleBySlug(params.slug, locale);
  
  if (!articleData) {
    return {
      title: 'Article Not Found',
    };
  }

  const data = articleData.attributes || articleData;
  const imageUrl = getStrapiMedia(data.cover);

  return {
    title: data.title,
    description: data.excerpt,
    openGraph: {
      title: data.title,
      description: data.excerpt,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

const ArticleDetailPage = async ({ params }) => {
  const { lang, slug } = params;
  const locale = lang === 'bn' ? 'bn' : 'en';

  // Parallel Data Fetching with Error Handling
  let articleData = null;
  let mostViewedResponse = { data: [] };
  let popularResponse = { data: [] };
  let globalSettingsResponse = { data: null };
  let trendingCategoriesResponse = { data: [] };

  try {
    const results = await Promise.allSettled([
      getArticleBySlug(slug, locale),
      getMostViewedArticles(5, locale),
      getPopularArticles(5, locale),
      getGlobalSettings(locale),
      getTrendingCategories(5, locale)
    ]);

    articleData = results[0].status === 'fulfilled' ? results[0].value : null;
    mostViewedResponse = results[1].status === 'fulfilled' ? results[1].value : { data: [] };
    popularResponse = results[2].status === 'fulfilled' ? results[2].value : { data: [] };
    globalSettingsResponse = results[3].status === 'fulfilled' ? results[3].value : { data: null };
    trendingCategoriesResponse = results[4].status === 'fulfilled' ? results[4].value : { data: [] };
  } catch (error) {
    console.error("Error fetching data for article page:", error);
    // Proceed with null articleData, which will trigger 404
  }

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
      titleStrong: 'ট্রেন্ডিং', 
      titleRest: 'টপিকস', 
      viewAll: 'সব ক্যাটাগরি দেখুন',
      categoryFallback: 'ক্যাটাগরি'
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
      titleStrong: 'Trending',
      titleRest: 'topics',
      viewAll: 'View all categories',
      categoryFallback: 'Category'
    }
  };

  const currentT = t[lang] || t.bn;

  if (!articleData) {
    return (
      <main className="page_main_wrapper">
        <div className="container py-5 text-center">
          <h1>404 - {currentT.notFound}</h1>
          <p className="text-muted mb-4">{currentT.notFoundDesc}</p>
          <Link href={`/${lang}`} className="btn btn-primary">{currentT.goHome}</Link>
        </div>
      </main>
    );
  }

  const article = articleData;
  const data = article.attributes || article;
  const { title, content, cover, publishedAt, category, author, excerpt } = data;
  const categoryName = category?.data?.attributes?.name || category?.name || currentT.categoryFallback;
  const categorySlug = category?.data?.attributes?.slug || category?.slug || 'general';
  const authorName = author?.data?.attributes?.name || author?.name || currentT.authorFallback;
  const imageUrl = getStrapiMedia(cover);

  const globalSettings = globalSettingsResponse?.data;
  const mostViewed = mostViewedResponse?.data || [];
  const popular = popularResponse?.data || [];
  const trendingCategories = trendingCategoriesResponse?.data || [];

  // Get ad banner from global settings
  const adBannerUrl = globalSettings ? getStrapiMedia(globalSettings.adBannerSidebar) : null;
  const adBannerLink = globalSettings?.adBannerSidebarLink || '#';

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

  // Helper function for translateNumber (basic implementation for server)
  const translateNumber = (numStr) => {
    if (lang !== 'bn') return numStr;
    const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return numStr.toString().replace(/[0-9]/g, (w) => bnNums[+w]);
  };

  return (
    <>
      <main className="page_main_wrapper">
        <div className="container">
          <div className="row row-m">
            {/* START MAIN CONTENT */}
            <div className="col-md-8 col-p main-content">
              <ClientStickyBox>
                <div className="post_details_inner">
                  {/* Custom Header Layout */}
                  <div className="mb-4">
                     {/* Breadcrumb */}
                     <nav aria-label="breadcrumb" className="mb-3 d-none d-md-block">
                      <ol className="breadcrumb d-inline-block bg-transparent p-0 m-0">
                        <li className="breadcrumb-item">
                          <Link href={`/${lang}`} className="text-danger"><i className="fas fa-home"></i> {currentT.home}</Link>
                        </li>
                        <li className="breadcrumb-item">
                          <Link href={`/${lang}/category/${categorySlug}`} className="text-decoration-none font-weight-bold" style={{ color: '#0d6efd' }}>
                            {categoryName}
                          </Link>
                        </li>
                        <li className="breadcrumb-item active" aria-current="page">
                           {(title || '').substring(0, 50)}...
                        </li>
                      </ol>
                    </nav>

                    {/* Title */}
                    <h1 className="mb-3 font-weight-bold" style={{ fontSize: '2.5rem', lineHeight: '1.3' }}>
                      {title || ''}
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
                          alt={title || ''}
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
                      dangerouslySetInnerHTML={{ __html: content || '' }}
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
                          <Link href={`https://www.facebook.com/sharer/sharer.php?u=https://shottyodharaprotidin.com/${lang}/article/${slug}`} className="btn btn-primary btn-sm mr-2" style={{ backgroundColor: '#3b5998', borderColor: '#3b5998' }} target="_blank">
                            <i className="fab fa-facebook-f mr-1" /> Facebook
                          </Link>
                           <Link href={`https://wa.me/?text=${encodeURIComponent(title || '')}`} className="btn btn-success btn-sm mr-2" style={{ backgroundColor: '#25D366', borderColor: '#25D366' }} target="_blank">
                            <i className="fab fa-whatsapp mr-1" /> WhatsApp
                          </Link>
                        </div>
                    </div>

                  </div>
                  
                  {/* Related Articles Section - Passed locale to client component if needed or use server component */}
                  <div className="post-inner post-inner-2 mt-5">
                    <div className="post-head">
                      <h2 className="title">
                        <strong>{currentT.relatedStrong} </strong> {currentT.relatedRest}
                      </h2>
                    </div>
                    <div className="post-body">
                      <RelatedArticles categorySlug={categorySlug} /> 
                    </div>
                  </div>

                  {/* Comments Section - Client Component */}
                  <Comments
                    articleSlug={slug}
                    articleDocumentId={article.documentId || article.id}
                  />

                </div>
              </ClientStickyBox>
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

                {/* Client Interactivity for Tabs and View Count */}
                <ClientArticleInteractions 
                  articleId={article.documentId || article.id}
                  articleViewCount={article.attributes?.viewCount || article.viewCount || 0}
                  language={lang}
                  locale={locale}
                  initialMostViewed={mostViewed}
                  initialPopular={popular}
                  initialGlobalSettings={globalSettings}
                  t={currentT}
                />

                {/* START TRENDING TOPICS */}
                <TrendingTopics initialCategories={trendingCategories} />
                {/* END OF /. TRENDING TOPICS */}
            </div>
            {/* END OF /. SIDE CONTENT */}
          </div>
        </div>
      </main>
    </>
  );
};

export default ArticleDetailPage;
