
import dynamic from "next/dynamic";
import Link from "next/link";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import 'animate.css/animate.css'
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


if (typeof window !== "undefined") {
  window.$ = window.jQuery = typeof window !== "undefined" && require("jquery");
}
// This is for Next.js. On Rect JS remove this line
const OwlCarousel = dynamic(() => import("react-owl-carousel"), {
  ssr: false,
});

const NewsTicker = ({ data = [], isLoading = false }) => {
  const { locale } = useLanguage();
  const t = dictionary[locale] || dictionary.bn;
  
  // Use dummy data if loading, otherwise real data
  let items = isLoading ? t.dummy : data;

  // Clone if only 1 item to force Owl Carousel to loop and show navigation
  if (!isLoading && items.length === 1) {
    items = [items[0], items[0]];
  }

  if (!isLoading && items.length === 0) return null;

  return (
    <div className="container">
      <div className="newstricker_inner">
        <div className={`trending ${locale === 'en' ? 'trending-en' : 'trending-bn'}`}>
          {t.trending} {t.now}
        </div>
        <OwlCarousel
          key={isLoading ? 'loading' : 'loaded'}
          className="news-ticker owl-theme"
          loop={true}
          items={1}
          dots={false}
          animateOut='animate__slideOutDown'
          animateIn='animate__flipInX'
          autoplay={true}
          autoplayTimeout={5000}
          autoplayHoverPause={true}
          nav={true}
          navText={[
            `<i class='fa fa-angle-left'></i>`,
            `<i class='fa fa-angle-right'></i>`
          ]}
        >
          {items.map((article) => {
            const articleData = article.attributes || article;
            const slug = articleData.slug || '#';
            const title = articleData.title || '';

            return (
              <div className="item" key={article.id}>
                <p>
                  <Link href={isLoading ? '#' : `/article/${slug}`}>{title}</Link>
                </p>
              </div>
            );
          })}
        </OwlCarousel>
      </div>
    </div>
  );
};

export default NewsTicker;