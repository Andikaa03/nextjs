"use client"
import dynamic from "next/dynamic";
import Image from "next/image";
import "owl.carousel/dist/assets/owl.carousel.css";
import "owl.carousel/dist/assets/owl.theme.default.css";
import 'animate.css/animate.css'
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { getStrapiMedia, formatDate } from "@/lib/strapi";
import { useTranslations } from '@/lib/translations';

if (typeof window !== "undefined") {
    window.$ = window.jQuery = typeof window !== "undefined" && require("jquery");
}
// This is for Next.js. On Rect JS remove this line
const OwlCarousel = dynamic(() => import("react-owl-carousel"), {
    ssr: false,
});

const ArticleRelated = ({ articles, locale = 'bn', articleSlug = '', articleTitle = '', categorySlug = '' }) => {
    const { t } = useTranslations(locale);
    const [articleUrl, setArticleUrl] = useState('');
    const [isSaved, setIsSaved] = useState(false);
    const [isShareOpen, setIsShareOpen] = useState(false);
    const shareRef = useRef(null);

    useEffect(() => {
        if (articleSlug) {
            setArticleUrl(`${window.location.origin}/article/${articleSlug}`);
            try {
                const saved = JSON.parse(localStorage.getItem('rasel_saved_articles') || '[]');
                if (saved.includes(articleSlug)) {
                    setIsSaved(true);
                }
            } catch (e) {}
        }
    }, [articleSlug]);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (shareRef.current && !shareRef.current.contains(event.target)) {
                setIsShareOpen(false);
            }
        };

        document.addEventListener('click', handleOutsideClick);
        return () => document.removeEventListener('click', handleOutsideClick);
    }, []);

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

    const encodedUrl = encodeURIComponent(articleUrl);
    const encodedTitle = encodeURIComponent(articleTitle);
    const fallbackCategorySlug = articles?.[0]?.attributes?.category?.data?.attributes?.slug || articles?.[0]?.category?.data?.attributes?.slug || articles?.[0]?.attributes?.category?.slug || articles?.[0]?.category?.slug || '';
    const morePostsHref = categorySlug ? `/${categorySlug}` : (fallbackCategorySlug ? `/${fallbackCategorySlug}` : '/');

    const handleShareClick = (e, url) => {
        e.preventDefault();
        window.open(url, 'share', 'width=600,height=400,menubar=no,toolbar=no');
        setIsShareOpen(false);
    };

    const toggleShareMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsShareOpen((prev) => !prev);
    };

    const toggleSaveArticle = (e) => {
        e.preventDefault();
        try {
            const saved = JSON.parse(localStorage.getItem('rasel_saved_articles') || '[]');
            if (isSaved) {
                const updated = saved.filter(slug => slug !== articleSlug);
                localStorage.setItem('rasel_saved_articles', JSON.stringify(updated));
                setIsSaved(false);
            } else {
                if (!saved.includes(articleSlug)) {
                    saved.push(articleSlug);
                    localStorage.setItem('rasel_saved_articles', JSON.stringify(saved));
                }
                setIsSaved(true);
            }
        } catch (e) {}
    };

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
                                                            <Image
                                                                src={imageUrl || '/default.jpg'}
                                                                className="img-fluid"
                                                                alt={data.title}
                                                                width={300}
                                                                height={200}
                                                                onError={(e) => e.target.style.display = 'none'}
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
                        <Link href={morePostsHref} className="more-btn" style={locale !== 'bn' ? { fontSize: '13px' } : undefined}>
                            {t('morePopularPosts')}
                        </Link>
                    </div>
                    <div className="col-md-4 d-md-block d-none thm-padding">
                        <div className="social">
                            <ul>
                                <li>
                                    <div ref={shareRef} className={`share transition ${isShareOpen ? 'is-open' : ''}`}>
                                        <a
                                            href="#"
                                            className="ico fb"
                                            onClick={(e) => handleShareClick(e, `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`)}
                                            title="Share on Facebook"
                                        >
                                            <i className="fab fa-facebook-f" />
                                        </a>
                                        <a
                                            href="#"
                                            className="ico tw"
                                            onClick={(e) => handleShareClick(e, `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`)}
                                            title="Share on Twitter"
                                        >
                                            <i className="fab fa-twitter" />
                                        </a>
                                        <a
                                            href="#"
                                            className="ico wa"
                                            onClick={(e) => handleShareClick(e, `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`)}
                                            title="Share on WhatsApp"
                                        >
                                            <i className="fab fa-whatsapp" />
                                        </a>
                                        <a
                                            href="#"
                                            className="ico pin"
                                            onClick={(e) => handleShareClick(e, `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`)}
                                            title="Share on Pinterest"
                                        >
                                            <i className="fab fa-pinterest-p" />
                                        </a>
                                        <button
                                            type="button"
                                            className="share-toggle-btn"
                                            onClick={toggleShareMenu}
                                            aria-label="Open share options"
                                            aria-expanded={isShareOpen}
                                        >
                                            <i className="ti ti-share ico-share" style={{ cursor: 'pointer' }} />
                                        </button>
                                    </div>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        className="bg-transparent border-0 p-0"
                                        onClick={toggleSaveArticle}
                                        title={isSaved ? "Unsave article" : "Save article"}
                                    >
                                        <i className={isSaved ? "ti ti-heart" : "ti ti-heart"} style={{ color: isSaved ? '#eb0254' : 'inherit' }} />
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        className="bg-transparent border-0 p-0"
                                        onClick={(e) => handleShareClick(e, `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`)}
                                        title="Share on Twitter"
                                    >
                                        <i className="ti ti-twitter" />
                                    </button>
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

