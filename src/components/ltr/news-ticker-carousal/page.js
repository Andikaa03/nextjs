
import Link from "next/link";
import { useLanguage } from '@/lib/LanguageContext';

const dictionary = {
  en: {
    trending: 'Breaking',
    now: 'News',
    dummy: [
      { id: 'd1', title: 'Sample News: Revolution in the Tech World', slug: '#' },
      { id: 'd2', title: 'Sample News: Bangladesh Cricket Team Continues Winning Streak', slug: '#' },
      { id: 'd3', title: 'Sample News: Climate Change and Our Responsibilities', slug: '#' }
    ]
  },
  bn: {
    trending: 'সংবাদ শিরোনাম',
    now: '',
    dummy: [
      { id: 'd1', title: 'নমুনা সংবাদ: প্রযুক্তি বিশ্বে নতুন বিপ্লব', slug: '#' },
      { id: 'd2', title: 'নমুনা সংবাদ: বাংলাদেশ ক্রিকেট দলের জয়ের ধারা অব্যাহত', slug: '#' },
      { id: 'd3', title: 'নমুনা সংবাদ: জলবায়ু পরিবর্তন ও আমাদের করণীয়', slug: '#' }
    ]
  }
};

const NewsTicker = ({ data = [], isLoading = false }) => {
  const { locale } = useLanguage();
  const t = dictionary[locale] || dictionary.bn;
  
  // Use dummy data if loading, otherwise real data
  const sourceItems = isLoading ? t.dummy : data;
  const items = sourceItems
    .map((article) => {
      const articleData = article.attributes || article;
      return {
        id: article.id,
        slug: articleData.slug || '#',
        title: (articleData.title || '').trim(),
      };
    })
    .filter((article) => article.title.length > 0);

  if (!isLoading && items.length === 0) return null;

  return (
    <div className="container">
      <div className="newstricker_inner">
        <div className={`trending ${locale === 'en' ? 'trending-en' : 'trending-bn'}`}>
          {t.trending} {t.now}
        </div>
        <div className="news-ticker" aria-live="polite">
          <div className="news-ticker-track">
            {[0, 1].map((copyIndex) => (
              <div className="news-ticker-group" key={`copy-${copyIndex}`} aria-hidden={copyIndex === 1}>
                {items.map((article, index) => {
                  return (
                    <span className="item" key={`${copyIndex}-${article.id || index}`}>
                      <Link href={isLoading ? '#' : `/article/${article.slug}`}>{article.title}</Link>
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsTicker;