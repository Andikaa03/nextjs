"use client"
import dynamic from "next/dynamic";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import 'animate.css/animate.css'
import Link from "next/link";
import { getStrapiMedia, formatDate } from "@/lib/strapi";
import { useTranslations } from '@/lib/translations';

if (typeof window !== "undefined") {
    window.$ = window.jQuery = typeof window !== "undefined" && require("jquery");
}
// This is for Next.js. On Rect JS remove this line
const OwlCarousel = dynamic(() => import("react-owl-carousel"), {
    ssr: false,
});

const ArticleRelated = ({ articles, locale = 'bn' }) => {
    const { t } = useTranslations(locale);
    const optionThree = {
        items: 1,
        loop: true,
        dots: false,
        animateOut: 'fadeOut',
        animateIn: 'fadeIn',
        nav: true,
        navText: [
            "<i class='ti ti-angle-left'></i>",
            "<i class='ti ti-angle-right'></i>"
        ]
    }

    if (!articles || articles.length === 0) return null;

    const chunkArticles = () => {
        const chunks = [];
        for (let i = 0; i < articles.length; i += 3) {
            chunks.push(articles.slice(i, i + 3));
        }
        return chunks;
    };

    const chunks = chunkArticles();

    return (
        <div className="post-inner post-inner-2">
            {/*post header*/}
            <div className="post-head">
                <h2 className="title">
                    <strong>{t('relatedArticles').split(' ')[0]} </strong> {t('relatedArticles').split(' ').slice(1).join(' ')}
                </h2>
            </div>
            {/* post body */}
            <div className="post-body">
                <OwlCarousel className="post-slider owl-theme" {...optionThree}>
                    {chunks.map((chunk, index) => (
                        <div className="item" key={index}>
                            <div className="news-grid-2">
                                <div className="row row-margin">
                                    {chunk.map((article) => {
                                        const data = article.attributes || article;
                                        const imageUrl = getStrapiMedia(data.cover);
                                        return (
                                            <div className="col-xs-6 col-sm-4 col-md-4 col-padding" key={article.id}>
                                                <div className="grid-item">
                                                    <div className="grid-item-img">
                                                        <Link href={`/article/${data.slug}`}>
                                                            <img
                                                                src={imageUrl || '/default.jpg'}
                                                                className="img-fluid"
                                                                alt={data.title}
                                                            />
                                                        </Link>
                                                    </div>
                                                    <h5>
                                                        <Link href={`/article/${data.slug}`} className="title">
                                                            {data.title && data.title.length > 50 ? data.title.substring(0, 50) + '...' : data.title}
                                                        </Link>
                                                    </h5>
                                                    <ul className="authar-info d-flex flex-wrap">
                                                        <li>{formatDate(data.publishedAt, locale)}</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </OwlCarousel>
            </div>
            {/* Post footer */}
            <div className="post-footer">
                <div className="row thm-margin">
                    <div className="col-md-8 thm-padding">
                        <Link href={`/${locale === 'en' ? 'en/' : ''}news${locale === 'bn' ? '-bn' : ''}`} className="more-btn">
                            {t('morePopularPosts')}
                        </Link>
                    </div>
                    <div className="col-md-4 d-md-block d-none thm-padding">
                        <div className="social">
                            <ul>
                                <li>
                                    <div className="share transition">
                                        <Link href="#" target="_blank" className="ico fb">
                                            <i className="fab fa-facebook-f" />
                                        </Link>
                                        <Link href="#" target="_blank" className="ico tw">
                                            <i className="fab fa-twitter" />
                                        </Link>
                                        <Link href="#" target="_blank" className="ico rs">
                                            <i className="fas fa-rss" />
                                        </Link>
                                        <Link href="#" target="_blank" className="ico pin">
                                            <i className="fab fa-pinterest-p" />
                                        </Link>
                                        <i className="ti ti-share ico-share" />
                                    </div>
                                </li>
                                <li>
                                    <Link href="#">
                                        <i className="ti ti-heart" />
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#">
                                        <i className="ti ti-twitter" />
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticleRelated;
