import { getArticleBySlug, getArticleBySlugPreview, getMostViewedArticles, getPopularArticles } from '@/services/articleService';
import { cookies, draftMode } from 'next/headers';
import { getGlobalSettings, getAdsManagement } from '@/services/globalService';
import { getStrapiMedia } from '@/lib/strapi';
import ClientArticleDetail from '@/components/article/article-details';

// Force dynamic rendering since we rely on request params and external data
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = params;
  const cookieStore = cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'bn';
  let articleData = null;

  try {
    articleData = await getArticleBySlug(slug, locale);
  } catch (error) {
    console.error('Error generating article metadata:', error);
  }
  
  if (!articleData) {
    return {
      title: 'Article Not Found',
    };
  }

  const data = articleData.attributes || articleData;
  const seo = data.seo || {};
  const metaTitle = seo.metaTitle || data.title;
  const metaDescription = seo.metaDescription || data.excerpt || '';
  const shareImage = getStrapiMedia(seo.shareImage) || getStrapiMedia(data.cover);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://shottyodharaprotidin.com';
  const articleUrl = `${siteUrl}/article/${slug}`;

  return {
    title: metaTitle,
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: articleUrl,
      siteName: 'Satyadhara Protidin',
      type: 'article',
      images: shareImage ? [shareImage] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: shareImage ? [shareImage] : [],
    },
  };
}

const ArticleDetailPage = async ({ params, searchParams }) => {
  const { slug } = params;
  const cookieStore = cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'bn';

  // Parallel Data Fetching with Error Handling
  let articleData = null;
  let mostViewedResponse = { data: [] };
  let popularResponse = { data: [] };
  let globalSettingsResponse = { data: null };
  let adsResponse = { data: null };

  // Deteksi Draft Mode
  const { isEnabled } = draftMode();

  // When in draft mode, use the locale from URL params (e.g. from preview redirect)
  // because the browser cookie might be in a different language from the article
  const previewLocale = searchParams?.locale || locale;
  const articleFetcher = isEnabled ? getArticleBySlugPreview : getArticleBySlug;
  const fetchLocale = isEnabled ? previewLocale : locale;

  try {
    const results = await Promise.allSettled([
      articleFetcher(slug, fetchLocale),
      getMostViewedArticles(5, locale),
      getPopularArticles(5, locale),
      getGlobalSettings(locale),
      getAdsManagement(),
    ]);

    articleData = results[0].status === 'fulfilled' ? results[0].value : null;
    mostViewedResponse = results[1].status === 'fulfilled' ? results[1].value : { data: [] };
    popularResponse = results[2].status === 'fulfilled' ? results[2].value : { data: [] };
    globalSettingsResponse = results[3].status === 'fulfilled' ? results[3].value : { data: null };
    const adsRaw = results[4].status === 'fulfilled' ? results[4].value : null;
    adsResponse = { data: adsRaw?.data || adsRaw || null };
  } catch (error) {
    console.error("Error fetching data for article page:", error);
  }

  if (!articleData) {
     // You might want to render a custom 404 component here
    return <div>Article not found</div>;
  }

  return (
    <>
    {isEnabled && <PreviewBanner slug={slug} />}

    <ClientArticleDetail 
      article={articleData}
      mostViewed={mostViewedResponse?.data || []}
      popularNews={popularResponse?.data || []}
      globalSettings={globalSettingsResponse?.data}
      adsData={adsResponse?.data}
      locale={locale}
    />
    </>
  );
};

/* Preview Banner Component */
function PreviewBanner({ slug }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      background: '#f59e0b',
      color: '#000',
      padding: '12px',
      textAlign: 'center',
      zIndex: 9999,
      fontWeight: 'bold',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      ⚠️ Mode Preview — Artikel ini belum dipublish.{' '}
      <a 
        href={`/api/disable-preview?slug=${slug}`}
        style={{ textDecoration: 'underline', marginLeft: '10px' }}
      >
        Keluar dari Preview
      </a>
    </div>
  );
}


export default ArticleDetailPage;
