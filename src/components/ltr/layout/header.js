"use client";
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { formatDate, getStrapiMedia, toBengaliNumber } from '@/lib/strapi';
import { getCurrentWeather } from '@/services/weatherService';
import { getIpLocation } from '@/services/locationService';
import { getMenuItems, getAdsManagement, getHeaderTop } from '@/services/globalService';
import { getCategoriesWithChildren } from '@/services/categoryService';
import { useLanguage } from '@/lib/LanguageContext';
import { WiDaySunny, WiCloud, WiRain, WiSnow, WiThunderstorm, WiFog } from 'weather-icons-react';
import ThemeChanger from '../style-selectors/style-selector';

// Helper function to get weather icon
const getWeatherIcon = (iconName) => {
    switch (iconName) {
        case 'sunny': return <WiDaySunny size={28} />;
        case 'cloudy': return <WiCloud size={28} />;
        case 'rainy': return <WiRain size={28} />;
        case 'snowy': return <WiSnow size={28} />;
        case 'thunderstorm': return <WiThunderstorm size={28} />;
        case 'foggy': return <WiFog size={28} />;
        default: return <WiDaySunny size={28} />;
    }
};

const Header = ({ hideMiddleHeader = false, globalSettings }) => {
    const { locale } = useLanguage();
    const [weather, setWeather] = useState({ temp: null, weatherCode: null, icon: 'cloudy' });
    const [isSidebarActive, setSidebarActive] = useState(false);
    const [isOverlayActive, setOverlayActive] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const path = usePathname()
   
    const toggleSidebar = () => {
        setSidebarActive(!isSidebarActive);
        setOverlayActive(!isOverlayActive);
    };

    const closeSidebar = () => {
        setSidebarActive(false);
        setOverlayActive(false);
    };

    const [currentDate, setCurrentDate] = useState('');
    const [menuItems, setMenuItems] = useState([]);
    const [isLoadingMenu, setIsLoadingMenu] = useState(true);
    const [sidebarMenuItems, setSidebarMenuItems] = useState([]);
    const [expandedSidebarItems, setExpandedSidebarItems] = useState({});
    const [sidebarData, setSidebarData] = useState(null);
    const [categoryTree, setCategoryTree] = useState([]);

    const [headerTopData, setHeaderTopData] = useState(null);
    const [adsData, setAdsData] = useState(null);
    const [headerLogo, setHeaderLogo] = useState(null);
    const navbarNavRef = useRef(null);

    const hasWeatherTemp = weather.temp !== null && weather.temp !== undefined && !Number.isNaN(Number(weather.temp));
    const roundedHeaderTemp = hasWeatherTemp ? Math.round(Number(weather.temp)) : null;
    const weatherTempText = hasWeatherTemp
        ? (locale === 'bn' ? toBengaliNumber(roundedHeaderTemp) : roundedHeaderTemp)
        : '--';
    const weatherUnitText = locale === 'bn' ? '°সে' : '°C';

    useEffect(() => {
        getAdsManagement().then(res => {
            setAdsData(res?.data || res || null);
        });
        getHeaderTop(locale).then(res => {
            setHeaderTopData(res?.data || res || null);
        });
    }, [locale]);

    useEffect(() => {
        // Fetch header menu items from the relocated structure
        setIsLoadingMenu(true);
        getMenuItems('header', locale).then(res => {
            setMenuItems(res?.data || []);
            // Extract logo from header attributes
            const attrs = res?.attributes || {};
            if (attrs.logo) setHeaderLogo(getStrapiMedia(attrs.logo));
        }).finally(() => {
            setIsLoadingMenu(false);
        });

        // Fetch sidebar menu items
        getMenuItems('sidebar', locale).then(res => {
            if (setSidebarMenuItems) {
                setSidebarMenuItems(res?.data || []);
                setSidebarData(res?.attributes || null);
            }
        });

        // Fetch categories tree for mega menu
        getCategoriesWithChildren(locale).then(tree => {
            setCategoryTree(tree || []);
        });
        
        const fetchHeaderWeather = async () => {
            const ipCoords = await getIpLocation();
            const lat = ipCoords?.lat;
            const lon = ipCoords?.lon;

            const data = await getCurrentWeather(lat, lon, locale);
            setWeather(data);
        };

        fetchHeaderWeather();
    }, [locale]);

    const toggleSidebarSubMenu = (itemId) => {
        setExpandedSidebarItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
    };

    useEffect(() => {
        // Set current date on mount to avoid hydration mismatch, including Bangla Date
        setCurrentDate(formatDate(new Date().toISOString(), locale, true));

        // Update document title and html lang when locale changes
        if (typeof document !== 'undefined') {
            document.documentElement.lang = locale === 'bn' ? 'bn' : 'en';
            
            // Fetch global settings for the current locale to get the right site name
            import('@/services/globalService').then(({ getGlobalSettings }) => {
                getGlobalSettings(locale).then(res => {
                    const attrs = res?.data?.attributes || res?.data || {};
                    const seo = attrs.defaultSeo || {};
                    const title = attrs.siteName || seo.metaTitle || 
                        (locale === 'bn' ? 'সত্যধারা প্রতিদিন' : 'Satyadhara Pratidin');
                    document.title = title;
                }).catch(() => {
                    document.title = locale === 'bn' ? 'সত্যধারা প্রতিদিন' : 'Satyadhara Pratidin';
                });
            });
        }
    }, [locale]);

    useEffect(() => {
        const dismissOverlay = document.querySelector('#dismiss');
        const overlay = document.querySelector('.overlay');
        const navIcon = document.querySelector('#nav-icon');

        if (dismissOverlay && overlay) {
            dismissOverlay.addEventListener('click', closeSidebar);
            overlay.addEventListener('click', closeSidebar);
        }

        if (navIcon) {
            navIcon.addEventListener('click', toggleSidebar);
        }

        return () => {
            if (dismissOverlay && overlay) {
                dismissOverlay.removeEventListener('click', closeSidebar);
                overlay.removeEventListener('click', closeSidebar);
            }
            if (navIcon) {
                navIcon.removeEventListener('click', toggleSidebar);
            }
        };
    }, [isSidebarActive, isOverlayActive]);

    // Auto-shrink navbar font to fit in one row
    useEffect(() => {
        const navEl = navbarNavRef.current;
        if (!navEl) return;

        const fitNav = () => {
            // Only apply on desktop (lg+)
            if (window.innerWidth < 992) {
                navEl.style.fontSize = '';
                return;
            }
            
            // UNIFIED LOGIC FOR ALL PAGES
            const container = navEl.closest('.container');
            if (!container) return;
            
            let siblingsWidth = 0;
            
            // Calculate width of right icons (search & theme)
            const rightIconsContainer = container.querySelector('.d-none.d-lg-flex');
            if (rightIconsContainer) {
                siblingsWidth += rightIconsContainer.offsetWidth;
            }
            
            const collapse = navEl.closest('.navbar-collapse');
            if (collapse && collapse.parentElement) {
                // Also subtract width of other siblings in the navbar container
                Array.from(collapse.parentElement.children).forEach(child => {
                    if (child !== collapse && child !== rightIconsContainer && window.getComputedStyle(child).display !== 'none') {
                        siblingsWidth += child.offsetWidth;
                    }
                });
            }
            
            const maxWidth = container.clientWidth - siblingsWidth - 20;
            
            const baseFontSize = locale === 'bn' ? 20 : 16;
            // Use consistent minFontSize parameters
            const minFontSize = locale === 'bn' ? 14 : 11;
            
            navEl.style.fontSize = baseFontSize + 'px';
            let fontSize = baseFontSize;
            while (navEl.scrollWidth > maxWidth && fontSize > minFontSize) {
                fontSize -= 0.5;
                navEl.style.fontSize = fontSize + 'px';
            }
        };

        // Use ResizeObserver to detect zoom/resize changes reliably
        const containerRef = navEl.closest('.container');
        let ro;
        if (containerRef && typeof ResizeObserver !== 'undefined') {
            ro = new ResizeObserver(() => fitNav());
            ro.observe(containerRef);
        }

        // Also run on initial render
        const timer = setTimeout(fitNav, 200);
        
        return () => {
            clearTimeout(timer);
            if (ro) ro.disconnect();
        };
    }, [menuItems]);

    useEffect(() => {
        const fullSkinSearch = () => {
            let wHeight = window.innerHeight;
            const fullscreenSearchform = document.getElementById('fullscreen-searchform');
            if(fullscreenSearchform) fullscreenSearchform.style.top = `${wHeight / 2}px`;

            window.addEventListener('resize', () => {
                wHeight = window.innerHeight;
                if(fullscreenSearchform) fullscreenSearchform.style.top = `${wHeight / 2}px`;
            });
        };

        fullSkinSearch();
    }, []);

    const handleSearchButtonClick = () => {
        setIsSearchOpen(!isSearchOpen);
    };

    const handleCloseButtonClick = () => {
        setIsSearchOpen(false);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setIsSearchOpen(false);
            setSearchQuery('');
        }
    };

    const renderMenuItem = (item, index) => {
        const component = item.__component;
        const data = item.attributes || item; // Handle both direct component data and relation data
        
        // Handle Component: Navigation.base-link
        if (component === 'navigation.base-link') {
            const slug = data.url || data.slug || '#';
            const url = slug.startsWith('http') || slug === '#' ? slug : (slug.startsWith('/') ? slug : `/${slug}`);
            return (
                <li className="nav-item" key={index}>
                    <Link className="nav-link" href={url} target={data.openInNewTab ? "_blank" : "_self"}>
                        {data.title}
                    </Link>
                </li>
            );
        }

        // Handle Component: Navigation.menu-button
        if (component === 'navigation.menu-button') {
            const slug = data.url || '#';
            const url = slug.startsWith('http') || slug === '#' ? slug : (slug.startsWith('/') ? slug : `/${slug}`);
            const btnClass = data.buttonType === 'primary' ? 'btn-primary' : (data.buttonType === 'secondary' ? 'btn-secondary' : 'btn-outline-primary');
            return (
                <li className="nav-item d-flex align-items-center ms-lg-2" key={index}>
                    <Link className={`btn ${btnClass} btn-sm text-white`} href={url}>
                        {data.title}
                    </Link>
                </li>
            );
        }

        // Handle Component: Navigation.dropdown-menu
        if (component === 'navigation.dropdown-menu') {
            const subMenus = data.subMenus || [];
            return (
                <li className="nav-item dropdown" key={index}>
                    <Link className="nav-link dropdown-toggle" href="#" id={`dropdown-${index}`} data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
                        {data.title}
                    </Link>
                    <ul className="dropdown-menu" aria-labelledby={`dropdown-${index}`}>
                        {subMenus.map((sub, i) => {
                            const subComponent = sub.__component;
                            if (subComponent === 'navigation.dropdown-header') {
                                return (
                                    <li key={i}>
                                        <h6 className="dropdown-header fw-bold text-dark">{sub.title}</h6>
                                    </li>
                                );
                            }
                            if (subComponent === 'navigation.nested-dropdown') {
                                const nestedItems = sub.subMenus || [];
                                return (
                                    <li className="nav-item dropdown dropend" key={i}>
                                        <Link className="dropdown-item dropdown-toggle" href="#" data-bs-toggle="dropdown" aria-expanded="false">
                                            {sub.title}
                                        </Link>
                                        <ul className="dropdown-menu">
                                            {nestedItems.map((nested, ni) => {
                                                const nestedSlug = nested.url || '#';
                                                const nestedUrl = nestedSlug.startsWith('http') || nestedSlug === '#' ? nestedSlug : (nestedSlug.startsWith('/') ? nestedSlug : `/${nestedSlug}`);
                                                return (
                                                    <li key={ni}>
                                                        <Link className="dropdown-item" href={nestedUrl} target={nested.openInNewTab ? "_blank" : "_self"}>
                                                            {nested.title}
                                                        </Link>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </li>
                                );
                            }
                            const subSlug = sub.url || '#';
                            const subUrl = subSlug.startsWith('http') || subSlug === '#' ? subSlug : (subSlug.startsWith('/') ? subSlug : `/${subSlug}`);
                            return (
                                <li key={i}>
                                    <Link className="dropdown-item" href={subUrl} target={sub.openInNewTab ? "_blank" : "_self"}>
                                        {sub.title}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </li>
            );
        }

        // Handle Component: Navigation.mega-menu
        if (component === 'navigation.mega-menu') {
            const sections = data.sections || [];
            
            // Auto-populate from categories API when no sections are configured
            if (sections.length === 0 && categoryTree.length > 0) {
                return (
                    <li className="nav-item dropdown mega-menu-content d-none d-lg-block" key={index}>
                        <Link className="nav-link dropdown-toggle" href="#" id={`mega-${index}`} data-bs-toggle="dropdown" aria-expanded="false">
                            {data.title}
                        </Link>
                        <ul className="dropdown-menu mega-menu p-3 megamenu-content" aria-labelledby={`mega-${index}`}>
                            <li>
                                <div className="row">
                                    {categoryTree.map((parent, i) => (
                                        <div className="col-menu col-md-3" key={i}>
                                            <h6 className="title">
                                                <Link href={`/${parent.slug}`} style={{ color: '#e6005c' }}>{parent.name}</Link>
                                            </h6>
                                            <div className="content">
                                                <ul className="menu-col">
                                                    {(parent.children || []).map((child, j) => (
                                                        <li key={j}>
                                                            <Link href={`/${child.slug}`}>
                                                                {child.name}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </li>
                        </ul>
                    </li>
                );
            }

            // Manual sections from CMS
            return (
                <li className="nav-item dropdown mega-menu-content d-none d-lg-block" key={index}>
                    <Link className="nav-link dropdown-toggle" href="#" id={`mega-${index}`} data-bs-toggle="dropdown" aria-expanded="false">
                        {data.title}
                    </Link>
                    <ul className="dropdown-menu mega-menu p-3 megamenu-content" aria-labelledby={`mega-${index}`}>
                        <li>
                            <div className="row">
                                {sections.map((section, i) => (
                                    <div className="col-menu col-md-3" key={i}>
                                        <h6 className="title">{section.heading}</h6>
                                        <div className="content">
                                            <ul className="menu-col">
                                                {section.links?.map((link, j) => {
                                                    const linkSlug = link.url || '#';
                                                    const linkUrl = linkSlug.startsWith('http') || linkSlug === '#' ? linkSlug : (linkSlug.startsWith('/') ? linkSlug : `/${linkSlug}`);
                                                    return (
                                                        <li key={j}>
                                                            <Link href={linkUrl} className="d-flex align-items-center gap-2">
                                                                {link.icon && <img src={getStrapiMedia(link.icon)} alt="" style={{ width: '16px', height: '16px' }} />}
                                                                <div>
                                                                    <div className="fw-bold">{link.title}</div>
                                                                    {link.description && <small className="text-muted d-block" style={{ fontSize: '11px', lineHeight: '1.2' }}>{link.description}</small>}
                                                                </div>
                                                            </Link>
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </li>
                    </ul>
                </li>
            );
        }

        // Handle Component: Navigation.video-menu
        if (component === 'navigation.video-menu') {
            const videos = data.videos || [];
            return (
                <li className="nav-item dropdown mega-menu-content d-none d-lg-block" key={index}>
                    <Link className="nav-link dropdown-toggle" href="#" id={`megavideo-${index}`} data-bs-toggle="dropdown" aria-expanded="false">
                        {data.title}
                    </Link>
                    <ul className="dropdown-menu mega-menu p-3 megamenu-content" aria-labelledby={`megavideo-${index}`}>
                        <li className="g-3 row">
                            {videos.slice(0, 5).map((video, vIndex) => {
                                const videoSlug = video.url || '#';
                                const videoUrl = videoSlug.startsWith('http') || videoSlug === '#' ? videoSlug : (videoSlug.startsWith('/') ? videoSlug : `/${videoSlug}`);
                                
                                return (
                                    <div className="col-menu-video col-md-3" key={vIndex}>
                                        <Link className="video-nav-item" href={videoUrl}>
                                            <div className="img-wrapper">
                                                <img
                                                    src={getStrapiMedia(video.thumbnail) || "/assets/images/gallery-235x160-1.jpg"}
                                                    alt={video.title}
                                                    className="img-fluid"
                                                />
                                                <div className="link-icon">
                                                    <i className="ti ti-video-camera" />
                                                </div>
                                            </div>
                                            <h4>
                                                {video.title}
                                            </h4>
                                        </Link>
                                    </div>
                                );
                            })}
                        </li>
                    </ul>
                </li>
            );
        }

        // Fallback for old menu items structure (backward compatibility)
        const children = data.menu_items?.data || [];
        const hasChildren = children.length > 0;
        const slug = data.slug || '#';
        const url = slug.startsWith('http') || slug === '#' ? slug : (slug.startsWith('/') ? slug : `/${slug}`);
        const isActive = path === url;

        if (hasChildren) {
            return (
                <li className="nav-item dropdown" key={index}>
                    <Link className={`nav-link dropdown-toggle ${isActive ? 'active' : ''}`} href="#" data-bs-toggle="dropdown">
                        {data.title}
                    </Link>
                    <ul className="dropdown-menu">
                        {children.map((child, cIndex) => {
                            const childData = child.attributes || child;
                            const childSlug = childData.slug || '#';
                            const childUrl = childSlug.startsWith('http') || childSlug === '#' ? childSlug : (childSlug.startsWith('/') ? childSlug : `/${childSlug}`);
                            return (
                                <li key={cIndex}>
                                    <Link className={`dropdown-item ${path === childUrl ? 'active' : ''}`} href={childUrl}>
                                        {childData.title}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </li>
            );
        }

        return (
            <li className="nav-item" key={index}>
                <Link className={`nav-link ${isActive ? 'active' : ''}`} href={url}>
                    {data.title}
                </Link>
            </li>
        );
    };

    return (
        <>
            <header className={`main-header header-locale-${locale} home-nine`}>
                {/* START HEADER TOP */}
                <div className="header-top border-bottom" style={{ minHeight: '40.26px', maxHeight: '40.26px', display: 'flex', alignItems: 'center' }}>
                    <div className="container">
                        <div className="row">
                            <div className="col">
                                {/* Start top left menu */}
                                <div className="d-flex top-left-menu">
                                    <ul className="align-items-center d-flex flex-wrap">
                                        {headerTopData?.socialLinks?.length > 0 && (
                                        <li>
                                            {/* Start header social */}
                                            <div className="header-social">
                                                <ul className="align-items-center d-flex gap-2">
                                                    {headerTopData.socialLinks.map((item, i) => (
                                                    <li key={i}>
                                                        <Link href={item.url || '#'} target="_blank">
                                                            <i className={`fab fa-${item.icon}`} />
                                                        </Link>
                                                    </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            {/* End of /. header social */}
                                        </li>
                                        )}
                                        {headerTopData?.leftMenu?.map((item, i) => (
                                        <li className="d-none d-sm-block" key={i}>
                                            <Link href={item.url || "#"}>
                                                {item.icon && (
                                                    <i className={`fa fa-${item.icon}`} title={item.label}></i>
                                                )}
                                                <span>{item.label}</span>
                                            </Link>
                                        </li>
                                        ))}
                                    </ul>
                                </div>
                                {/* End of /. top left menu */}
                            </div>
                            {/* Language Switcher - Mobile Only (centered) */}
                            <div className="col-auto d-flex d-lg-none justify-content-center align-items-center w-100" style={{ position: 'absolute', left: 0, pointerEvents: 'none' }}>
                                <div className="dropdown language-dropdown" style={{ pointerEvents: 'auto' }}>
                                    <button className="btn p-0 dropdown-toggle d-flex align-items-center gap-1" type="button" data-bs-toggle="dropdown" aria-expanded="false" style={{ color: '#fff', fontSize: '0.781rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                                        <i className="fa-solid fa-earth-americas" />
                                        <span className="fw-semibold">{locale === 'en' ? 'En' : 'বাং'}</span>
                                    </button>
                                    <ul className="dropdown-menu">
                                        <li><a className={`dropdown-item ${locale === 'bn' ? 'active' : ''}`} href="/bn"><span className="language-text">বাংলা</span></a></li>
                                        <li><a className={`dropdown-item ${locale === 'en' ? 'active' : ''}`} href="/en"><span className="language-text">English</span></a></li>
                                    </ul>
                                </div>
                            </div>
                            {/* end of /. Language Switcher */}
                            {/* Start header top right menu */}
                            {headerTopData?.rightMenu?.length > 0 && (
                            <div className="col-auto ms-auto">
                                <div className="header-right-menu">
                                    <ul className="d-flex justify-content-end">
                                        {headerTopData.rightMenu.map((item, i) => (
                                        <li key={i}>
                                            <Link href={item.url || "#"}>
                                                {item.icon && (
                                                    <i className={`fa fa-${item.icon}`} title={item.label}></i>
                                                )}
                                                <span>{item.label}</span>
                                            </Link>
                                        </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            )}
                            {/* end of /. header top right menu */}
                        </div>
                        {/* end of /. row */}
                    </div>
                    {/* end of /. container */}
                </div>
                {/* END HEADER TOP */}

                {/* START MIDDLE SECTION */}
                {hideMiddleHeader || path.includes('/article/') ? (
                    <div className="d-md-block d-none header-mid pt-2 pb-2">
                        <div className="container">
                            <div className="align-items-center row">
                                <div className="col-sm-4">
                                    <Link href="/" className="header-logo">
                                        <img
                                            src={headerLogo || "/assets/images/logo.png"}
                                            className="img-fluid header-logo"
                                            alt="Logo"
                                            style={{ width: '180px', height: '45px', objectFit: 'contain' }}
                                        />
                                    </Link>
                                </div>
                                <div className="col-sm-8 text-end">
                                    <Link href={adsData?.headerBannerLink || '#'}>
                                        <img 
                                            src={getStrapiMedia(adsData?.headerBanner) || "/assets/images/add728x90-1.jpg"} 
                                            alt="Header Banner" 
                                            style={{ width: '728px', height: '90px', objectFit: 'cover' }}
                                            className="img-fluid"
                                        />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="d-md-block d-none header-mid" style={{height : "96px"}}>
                        <div className="container h-100">
                            <div className="align-items-center row justify-content-center h-100">
                                <div className="col">
                                    <div className="hstack gap-3">
                                        <div id="nav-icon" className={isSidebarActive ? 'open' : ''}>
                                            <span /> <span /> <span />
                                        </div>
                                        <div className="vr" />
                                        <span className="fw-semibold text-uppercase menu-text">All Section</span>
                                    </div>
                                </div>
                                <div className="col-auto">
                                    <div className="align-items-center d-flex gap-3">
                                        <div className="fs-5 fw-semibold weather-text d-flex align-items-center gap-2">
                                            {getWeatherIcon(weather.icon)} {weatherTempText}{weatherUnitText}
                                        </div>
                                        <Link href="/" className="header-logo" >
                                            <img 
                                                src={headerLogo || "/assets/images/logo.png"} 
                                                alt="Logo" 
                                                style={{ width: '210px', height: '56px', objectFit: 'contain' }}
                                            />
                                        </Link>
                                        <div className="dropdown language-dropdown">
                                            <button className="btn p-0 dropdown-toggle d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                <i className="fa-solid fa-earth-americas" />
                                                <div className="fw-semibold text-uppercase" style={{ fontSize: '13px' }}>{locale === 'en' ? 'En' : 'Bn'}</div>
                                            </button>
                                            <ul className="dropdown-menu">
                                                <li><a className={`dropdown-item ${locale === 'bn' ? 'active' : ''}`} href="/bn"><span className="language-text">Bangla</span></a></li>
                                                <li><a className={`dropdown-item ${locale === 'en' ? 'active' : ''}`} href="/en"><span className="language-text">English</span></a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className={`col text-end text-uppercase date-text ${locale === 'bn' ? 'date-text-bn' : ''}`}>{currentDate}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* START NAVIGATION */}
                <style>{`
                    .custom-navbar .nav-link {
                        padding-top: 0 !important;
                        padding-bottom: 0 !important;
                        display: flex !important;
                        align-items: center !important;
                        height: 51px !important; /* menyesuaikan tinggi 53px dikurangi border 2px */
                    }
                    .custom-navbar .navbar-nav {
                        margin-bottom: 0 !important;
                    }
                `}</style>
                <nav 
                    className="custom-navbar navbar navbar-expand-lg sticky-top flex-column no-logo border-top border-bottom"
                    style={{ minHeight: '53.61px', maxHeight: '53.61px', padding: 0 }}
                >
                    <div className={`fullscreen-search-overlay ${isSearchOpen ? 'fullscreen-search-overlay-show' : ''}`} >
                        <Link href="#" className="fullscreen-close" onClick={handleCloseButtonClick} id="fullscreen-close-button"><i className="ti ti-close" /></Link>
                        <div id="fullscreen-search-wrapper">
                            <form onSubmit={handleSearchSubmit} id="fullscreen-searchform">
                                <input 
                                    type="text" 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Type keyword(s) here" 
                                    id="fullscreen-search-input" 
                                />
                                <i className="ti ti-search fullscreen-search-icon" onClick={handleSearchSubmit}>
                                    <input value="" type="submit" style={{ display: 'none' }} />
                                </i>
                            </form>
                        </div>
                    </div>
                    <div className="container position-relative">
                        <div className="d-md-none flex-grow-1 ps-2">
                            <Link className="navbar-brand d-block mb-1" href="/">
                                <img 
                                    src={headerLogo || "/assets/images/logo.png"} 
                                    alt="Logo" 
                                    style={{ width: '150px', height: '40px', objectFit: 'contain' }}
                                />
                            </Link>
                            <div className={`date-text-mobile fw-medium ${locale === 'bn' ? 'date-text-bn' : ''}`}>
                                {currentDate}
                            </div>
                        </div>
                        <button type="button" className="btn btn-search_two  ms-auto ms-md-0 d-lg-none" onClick={handleSearchButtonClick}><i className="fa fa-search" /></button>
                          
                        <div className="d-lg-none ms-2"><ThemeChanger /></div>
                        <button className={`navbar-toggler ms-1`} type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon" />
                        </button>
                        <div className={`collapse navbar-collapse`} id="navbarSupportedContent">
                            <div className="align-items-center border-bottom d-flex d-lg-none  justify-content-between mb-3 navbar-collapse__header pb-3">
                                <div className="collapse-brand flex-shrink-0">
                                    <Link href="/">
                                        <img 
                                            src={headerLogo || "/assets/images/logo.png"} 
                                            alt="Logo" 
                                            style={{ width: '150px', height: '40px', objectFit: 'contain' }}
                                        />
                                    </Link>
                                </div>
                                <div className="flex-grow-1 ms-3 text-end">
                                    <button type="button" className="bg-transparent border-0 collapse-close p-0 position-relative" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                                        <span /> <span />
                                    </button>
                                </div>
                            </div>
                            
                            {/* Dynamic Menu Items */}
                            <ul className="navbar-nav" ref={navbarNavRef}>
                                {isLoadingMenu ? (
                                    <li className="nav-item"><span className="nav-link">Loading...</span></li>
                                ) : menuItems.length > 0 ? (
                                    menuItems.map((item, index) => renderMenuItem(item, index))
                                ) : (
                                    <li className="nav-item"><Link className="nav-link" href="#">No Menu Items</Link></li>
                                )}
                            </ul>
                        </div>
                        <div className="w-100 w-lg-auto d-none d-lg-flex">
                            <div className='d-flex align-items-center gap-3'>
                                <button type="button" className="btn btn-search_two ms-auto" onClick={handleSearchButtonClick} ><i className="fa fa-search fa-lg" /></button>
                                <ThemeChanger />
                            </div>
                        </div>
                    </div>
                </nav>

                {/* START SIDEBAR */}
                <nav id="sidebar" className={isSidebarActive ? "active p-4" : "p-4"} >
                    <div id="dismiss" onClick={closeSidebar}>
                        <i className="fas fa-arrow-left" />
                    </div>
                    <div className="d-flex flex-column h-100">
                        <div className="">
                            <Link href="/" className="d-inline-block my-3">
                                {sidebarData?.logo ? (
                                    <img src={getStrapiMedia(sidebarData.logo)} alt="Sidebar Logo" height={50} />
                                ) : globalSettings?.data?.attributes?.favicon?.data ? (
                                    <img src={getStrapiMedia(globalSettings.data.attributes.favicon)} alt={globalSettings?.data?.attributes?.siteName || "Logo"} height={50} />
                                ) : (
                                    <img src="/assets/images/logo-white.png" alt="Logo" height={50} />
                                )}
                            </Link>
                            <p className="sidebar-description">
                                {sidebarData?.description || globalSettings?.data?.attributes?.siteDescription || "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout."}
                            </p>
                        </div>
                        <ul className="nav d-block flex-column my-4">
                            {sidebarMenuItems.length > 0 ? (
                                sidebarMenuItems.map((item, index) => {
                                    const data = item.attributes || item;
                                    const title = data.title;
                                    const url = data.url || '#';
                                    const finalUrl = url.startsWith('http') || url === '#' ? url : (url.startsWith('/') ? url : `/${url}`);

                                    return (
                                        <li className="nav-item" key={data.id || index}>
                                            <div className="d-flex align-items-center justify-content-between">
                                                <Link className="nav-link flex-grow-1 fw-bold" href={finalUrl} onClick={closeSidebar}>
                                                    {title}
                                                </Link>
                                            </div>
                                        </li>
                                    );
                                })
                            ) : (
                                <li className="nav-item"><span className="nav-link">No menu item</span></li>
                            )}
                        </ul>
                    </div>
                </nav>
                <div className={`overlay ${isOverlayActive ? 'active' : ''}`} onClick={closeSidebar} />
            </header>
        </>
    );
};

export default Header;