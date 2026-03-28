'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { getEpapers } from '@/lib/epaper-api';
import { getStrapiMedia, toBengaliNumber } from '@/lib/strapi';
import Layout from "@/components/ltr/layout/layout";
import { getGlobalSettings } from "@/services/globalService";
import { useLanguage } from '@/lib/LanguageContext';
import { useTranslations } from '@/lib/translations';
import './epaper.css';

/* ─── helpers ─── */
const toBnDate = (dateObj) => {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  return `${toBengaliNumber(y)}-${toBengaliNumber(m)}-${toBengaliNumber(d)}`;
};

const isSameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/* ─── constants ─── */
const bnMonths = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
const enMonths = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const bnDays = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
const enDays = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const localizedEditionLabels = {
  bn: {
    'edition-1': 'প্রথম সংস্করণ',
    'edition-2': 'দ্বিতীয় সংস্করণ'
  },
  en: {
    'edition-1': 'First Edition',
    'edition-2': 'Second Edition'
  }
};

export default function EpaperPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = searchParams.get('admin') === 'true';
  const { locale } = useLanguage();
  const { t } = useTranslations(locale);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  /* data */
  const [allPages, setAllPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [globalSettings, setGlobalSettings] = useState(null);

  /* navigation */
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEdition, setSelectedEdition] = useState(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [showAllPages, setShowAllPages] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [hasDateFilter, setHasDateFilter] = useState(false);

  /* admin drawing */
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentBox, setCurrentBox] = useState(null);
  const [drawnZones, setDrawnZones] = useState([]);
  const [selectedZoneIndex, setSelectedZoneIndex] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [activeModalImages, setActiveModalImages] = useState([]);
  const [activeZoneImages, setActiveZoneImages] = useState([]);
  const imageRef = useRef(null);
  const thumbContainerRef = useRef(null);
  const pageNumContainerRef = useRef(null);
  const calendarRef = useRef(null);

  const isDark = mounted && theme === 'skin-dark';

  useEffect(() => { setMounted(true); }, []);

  /* ─── fetch ─── */
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [result, globalRes] = await Promise.all([
          getEpapers(locale),
          getGlobalSettings(locale),
        ]);
        setAllPages(result);
        const globalRaw = globalRes?.data || globalRes || null;
        setGlobalSettings(globalRaw?.attributes || globalRaw);
      } catch (err) {
        console.error('Failed to fetch ePaper:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [locale]);

  /* group pages by date (using publishDate field) */
  const availableDates = useMemo(() => {
    const dateMap = {};
    allPages.forEach(p => {
      const raw = p.publishDate || p.createdAt || p.publishedAt;
      const d = new Date(raw + (raw.length === 10 ? 'T00:00:00' : ''));
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!dateMap[key]) dateMap[key] = d;
    });
    return Object.values(dateMap).sort((a, b) => b - a);
  }, [allPages]);

  /* editions are now fixed to edition-1 and edition-2 */
  const editions = useMemo(() => {
    return ['edition-1', 'edition-2'];
  }, []);

  /* pages for current selected date + edition, sorted by ID to replace removed pageNumber */
  const pages = useMemo(() => {
    const activeEdition = selectedEdition || editions[0] || null;
    return allPages
      .filter(p => {
        const raw = p.publishDate || p.createdAt || p.publishedAt;
        const d = new Date(raw + (raw.length === 10 ? 'T00:00:00' : ''));
        const edMatch = !activeEdition || (p.edition || 'edition-1') === activeEdition;
        if (hasDateFilter) {
          return isSameDay(d, selectedDate) && edMatch;
        }
        return edMatch;
      })
      .sort((a, b) => {
        if (!hasDateFilter) {
          const dateA = new Date(a.publishDate || a.createdAt || 0).getTime();
          const dateB = new Date(b.publishDate || b.createdAt || 0).getTime();
          if (dateB !== dateA) return dateB - dateA;
        }
        // User wants newest (latest uploaded) at the top
        return (b.id || 0) - (a.id || 0);
      });
  }, [allPages, selectedDate, selectedEdition, editions, locale, hasDateFilter]);

  /* auto-select latest date when data loads */
  useEffect(() => {
    if (availableDates.length > 0 && !allPages.some(p => {
      const raw = p.publishDate || p.createdAt || p.publishedAt;
      const d = new Date(raw + (raw.length === 10 ? 'T00:00:00' : ''));
      return isSameDay(d, selectedDate);
    })) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates]);

  /* auto-select first edition when date or editions change */
  useEffect(() => {
    if (editions.length > 0 && (!selectedEdition || !editions.includes(selectedEdition))) {
      setSelectedEdition(editions[0]);
    }
  }, [editions]);
  const currentPage = pages[currentPageIndex] || null;
  const imageUrl = currentPage ? getStrapiMedia(currentPage.image) : null;
  const zones = currentPage?.zones || [];

  /* auto-select first zone for preview on desktop when switching pages */
  useEffect(() => {
    const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;
    if (isDesktop && zones && zones.length > 0) {
      const firstZone = zones[0];
      const imgs = (firstZone.images?.data || firstZone.images || []).map(img => getStrapiMedia(img));
      setActiveZoneImages(imgs);
    } else {
      setActiveZoneImages([]);
    }
  }, [currentPageIndex, zones]);

  /* ─── URL SYNC (page + date) ─── */
  useEffect(() => {
    if (!mounted) return;
    const params = new URLSearchParams(searchParams);
    params.set('page', (currentPageIndex + 1).toString());
    
    if (hasDateFilter) {
      const dateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
      params.set('date', dateStr);
    } else {
      params.delete('date');
    }
    if (selectedEdition) {
      params.set('edition', selectedEdition);
    } else {
      params.delete('edition');
    }
    
    // Keep admin param if present
    if (isAdmin) params.set('admin', 'true');
    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    router.replace(url, { scroll: false });
  }, [currentPageIndex, selectedDate, selectedEdition, hasDateFilter, mounted, isAdmin, searchParams, pathname, router]);

  // Read page and date from URL on initial load
  useEffect(() => {
    const urlPage = searchParams.get('page');
    if (urlPage) {
      const p = parseInt(urlPage, 10);
      if (!isNaN(p) && p > 0) setCurrentPageIndex(p - 1);
    }
    const urlDate = searchParams.get('date');
    if (urlDate) {
      const d = new Date(urlDate + 'T00:00:00');
      if (!isNaN(d)) {
        setSelectedDate(d);
        setHasDateFilter(true);
      }
    }
    const urlEdition = searchParams.get('edition');
    if (urlEdition) {
      setSelectedEdition(urlEdition);
    }
  }, [mounted, searchParams]);



  /* ─── navigation ─── */
  const goToPrev = () => { if (currentPageIndex > 0) setCurrentPageIndex(currentPageIndex - 1); };
  const goToNext = () => { if (currentPageIndex < pages.length - 1) setCurrentPageIndex(currentPageIndex + 1); };

  const scrollPageNums = (dir) => {
    if (pageNumContainerRef.current) {
      pageNumContainerRef.current.scrollBy({ left: dir * 150, behavior: 'smooth' });
    }
  };

  /* ─── admin drawing ─── */
  const handleMouseDown = (e) => {
    if (!isAdmin) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentBox({ top: y, left: x, width: 0, height: 0 });
  };
  const handleMouseMove = (e) => {
    if (!isDrawing || !isAdmin) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCurrentBox({ top: Math.min(y, startPos.y), left: Math.min(x, startPos.x), width: Math.abs(x - startPos.x), height: Math.abs(y - startPos.y) });
  };
  const handleMouseUp = () => {
    if (!isDrawing || !isAdmin) return;
    setIsDrawing(false);
    if (currentBox && currentBox.width > 0.1 && currentBox.height > 0.1) {
      const newZone = { ...currentBox, url: '#', title: `Area ${drawnZones.length + 1}` };
      const updated = [...drawnZones, newZone];
      setDrawnZones(updated);
      setSelectedZoneIndex(updated.length - 1);
    }
    setCurrentBox(null);
  };
  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text.toString());
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const calendarGrid = useMemo(() => {
    const y = calendarDate.getFullYear();
    const m = calendarDate.getMonth();
    const daysInMonth = getDaysInMonth(y, m);
    const firstDay = getFirstDayOfMonth(y, m);
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [calendarDate]);

  const hasDataForDate = (day) => {
    if (!day) return false;
    const check = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
    return availableDates.some(d => isSameDay(d, check));
  };

  const handleCalendarSelect = (day) => {
    if (!day) return;
    const d = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
    setSelectedDate(d);
    setHasDateFilter(true);
    setShowCalendar(false);
  };

  const navigateMonth = (dir) => {
    setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + dir, 1));
  };

  /* close calendar on click outside */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    };
    if (showCalendar) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCalendar]);

  /* scroll active thumbnail into view */
  useEffect(() => {
    if (thumbContainerRef.current) {
      const active = thumbContainerRef.current.querySelector('[data-active="true"]');
      if (active) active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [currentPageIndex]);

  /* ─── render ─── */
  return (
    <Layout globalSettings={globalSettings} hideMiddleHeader={true}>
      <main className="page_main_wrapper">
        <div className="epaper-root" data-dark={isDark ? "true" : "false"}>

          {/* ── TOOLBAR ── */}
          <div className="epaper-toolbar">
            <div className="epaper-toolbar-inner">
              {/* Date picker */}
              <div className="epaper-tool-group" ref={calendarRef}>
                <div className="epaper-date-wrapper" onClick={() => setShowCalendar(!showCalendar)} style={{ display: 'flex', alignItems: 'center' }}>
                  <svg className="epaper-date-icon" viewBox="64 64 896 896" width="1em" height="1em" fill="currentColor" style={{ marginRight: '8px' }}><path d="M880 184H712v-64c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v64H384v-64c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v64H144c-17.7 0-32 14.3-32 32v664c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V216c0-17.7-14.3-32-32-32zm-40 656H184V460h656v380zM184 392V256h128v48c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-48h256v48c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-48h128v136H184z"/></svg>
                  <span className="epaper-date-display">{hasDateFilter ? toBnDate(selectedDate) : (locale === 'bn' ? 'সব তারিখ' : 'All Dates')}</span>
                  {hasDateFilter && (
                    <span 
                      style={{ marginLeft: '10px', marginTop: '-2px', cursor: 'pointer', color: '#ff4d4f', padding: '0 4px', fontSize: '18px', fontWeight: 'bold' }}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setHasDateFilter(false); 
                      }}
                      title={locale === 'bn' ? 'তারিখ মুছুন' : 'Clear Date'}
                    >
                      ×
                    </span>
                  )}
                </div>
                {showCalendar && (
                  <div className="epaper-calendar-dropdown">
                    <div className="epaper-cal-header">
                      <button className="epaper-cal-nav" onClick={() => navigateMonth(-1)}>‹</button>
                      <span className="epaper-cal-title">
                        {locale === 'bn' 
                          ? `${bnMonths[calendarDate.getMonth()]} ${toBengaliNumber(calendarDate.getFullYear())}` 
                          : `${enMonths[calendarDate.getMonth()]} ${calendarDate.getFullYear()}`}
                      </span>
                      <button className="epaper-cal-nav" onClick={() => navigateMonth(1)}>›</button>
                    </div>
                    <div className="epaper-cal-days">
                      {(locale === 'bn' ? bnDays : enDays).map(d => (
                        <div key={d} className="epaper-cal-dayname">{d}</div>
                      ))}
                    </div>
                    <div className="epaper-cal-grid">
                      {calendarGrid.map((day, idx) => {
                        if (!day) return <div key={`empty-${idx}`} className="epaper-cal-cell empty" />;
                        const isSelected = isSameDay(selectedDate, new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day));
                        const hasData = hasDataForDate(day);
                        const isToday = isSameDay(new Date(), new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day));
                        return (
                          <div
                            key={day}
                            className={`epaper-cal-cell ${isSelected ? 'selected' : ''} ${hasData ? 'has-data' : ''} ${isToday ? 'today' : ''}`}
                            onClick={() => handleCalendarSelect(day)}
                          >
                            {locale === 'bn' ? toBengaliNumber(day) : day}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Edition selector */}
              {editions.length > 0 && (
                <div className="epaper-tool-group">
                  <select
                    className="epaper-edition-select"
                    value={selectedEdition || ''}
                    onChange={(e) => setSelectedEdition(e.target.value)}
                  >
                    {editions.map(ed => (
                      <option key={ed} value={ed}>{localizedEditionLabels[locale]?.[ed] || ed}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Page number selector */}
              <div className="epaper-tool-group epaper-page-nums-wrap">
                <button className="epaper-page-arrow" onClick={() => { goToPrev(); scrollPageNums(-1); }} aria-label="Scroll left">
                  <svg viewBox="0 0 320 512" width="10" height="10" fill="currentColor"><path d="M34.52 239.03L228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94z"/></svg>
                </button>
                <div className="epaper-page-nums" ref={pageNumContainerRef}>
                  {pages.map((_, i) => (
                    <button
                      key={i}
                      className={`epaper-page-num ${i === currentPageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentPageIndex(i)}
                    >
                      {toBengaliNumber(i + 1)}
                    </button>
                  ))}
                </div>
                <button className="epaper-page-arrow" onClick={() => { goToNext(); scrollPageNums(1); }} aria-label="Scroll right">
                  <svg viewBox="0 0 320 512" width="10" height="10" fill="currentColor"><path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"/></svg>
                </button>
              </div>

              {/* All pages toggle */}
              <button
                className={`epaper-all-pages-btn ${showAllPages ? 'active' : ''}`}
                onClick={() => setShowAllPages(!showAllPages)}
              >
                {locale === 'bn' ? 'সব পাতা' : 'All Pages'}
              </button>
            </div>
          </div>

          {/* ── LOADING / EMPTY ── */}
          {loading ? (
            <div className="epaper-loading">
              <div className="spinner-border text-danger mb-3" role="status">
                <span className="visually-hidden">{t('loading')}</span>
              </div>
              <p>{t('loading')}</p>
            </div>
          ) : pages.length === 0 ? (
            <div className="epaper-empty">
              <div style={{ fontSize: '60px', marginBottom: '15px' }}>📭</div>
              <h3>{t('noEpaperFound')}</h3>
              <p>{t('uploadEpaperInstruction')}</p>
            </div>
          ) : showAllPages ? (
            /* ── ALL PAGES GRID ── */
            <div className="epaper-grid-view">
              <div className="epaper-grid">
                {pages.map((page, i) => {
                  const thumbUrl = getStrapiMedia(page.image);
                  return (
                    <div
                      key={page.id || i}
                      className={`epaper-grid-item ${i === currentPageIndex ? 'active' : ''}`}
                      onClick={() => { setCurrentPageIndex(i); setShowAllPages(false); }}
                    >
                      <img src={thumbUrl} alt={locale === 'bn' ? `পাতা ${toBengaliNumber(i + 1)}` : `Page ${i + 1}`} onError={(e) => e.target.src = '/default.jpg'} />
                      <div className="epaper-grid-label">
                        {locale === 'bn' ? `পাতা ${toBengaliNumber(i + 1)}` : `Page ${i + 1}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* ── MAIN VIEWER ── */
            <div className="epaper-viewer">
              {/* LEFT SIDEBAR — thumbnails (desktop) */}
              <div className="epaper-sidebar" ref={thumbContainerRef}>
                {pages.map((page, i) => {
                  const thumbUrl = getStrapiMedia(page.image);
                  const isActive = i === currentPageIndex;
                  return (
                    <div
                      key={page.id || i}
                      className={`epaper-thumb ${isActive ? 'active' : ''}`}
                      data-active={isActive ? 'true' : undefined}
                      onClick={() => setCurrentPageIndex(i)}
                    >
                      <img src={thumbUrl} alt={locale === 'bn' ? `পাতা ${toBengaliNumber(i + 1)}` : `Page ${i + 1}`} onError={(e) => e.target.src = '/default.jpg'} />
                      <div className={`epaper-thumb-label ${isActive ? 'active' : ''}`}>
                        {locale === 'bn' ? `পাতা ${toBengaliNumber(i + 1)}` : `Page ${i + 1}`}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CENTER — main page image */}
              <div className="epaper-center">
                <div
                  className="epaper-image-container"
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  style={{ cursor: isAdmin ? 'crosshair' : 'default' }}
                >
                  {imageUrl ? (
                    <div style={{ position: 'relative', width: '100%' }}>
                      <img
                        ref={imageRef}
                        src={imageUrl}
                        alt={locale === 'bn' ? `পাতা ${toBengaliNumber(currentPageIndex + 1)}` : `Page ${currentPageIndex + 1}`}
                        className="epaper-main-img"
                        onError={(e) => e.target.src = '/default.jpg'}
                        draggable={false}
                      />
                      {/* Strapi clickable zones — show images on click */}
                      {[...zones].reverse().map((zone, idx) => {
                        const zoneImages = (zone.images || []).map(img => getStrapiMedia(img)).filter(Boolean);
                        return (
                          <div
                            key={idx}
                            className="epaper-zone"
                            style={{
                              top: `${zone.top}%`, left: `${zone.left}%`,
                              width: `${zone.width}%`, height: `${zone.height}%`,
                              border: isAdmin ? '1px dashed rgba(220,38,38,0.5)' : 'none',
                              cursor: zoneImages.length > 0 ? 'pointer' : 'default',
                            }}
                            onClick={() => {
                              if (zoneImages.length === 0) return;
                              // Mobile: open modal directly. Desktop: show in side panel.
                              if (typeof window !== 'undefined' && window.innerWidth < 768) {
                                setActiveModalImages(zoneImages);
                              } else {
                                setActiveZoneImages(zoneImages);
                              }
                            }}
                            onMouseOver={(e) => !isAdmin && zoneImages.length > 0 && (e.currentTarget.style.backgroundColor = 'rgba(220,38,38,0.1)')}
                            onMouseOut={(e) => !isAdmin && (e.currentTarget.style.backgroundColor = 'transparent')}
                          />
                        );
                      })}
                      {/* admin drawn zones */}
                      {drawnZones.map((zone, idx) => (
                        <div
                          key={`drawn-${idx}`}
                          onClick={(e) => { e.stopPropagation(); setSelectedZoneIndex(idx); }}
                          className="epaper-zone"
                          style={{
                            top: `${zone.top}%`, left: `${zone.left}%`,
                            width: `${zone.width}%`, height: `${zone.height}%`,
                            border: selectedZoneIndex === idx ? '3px solid #dc2626' : '1px solid #dc2626',
                            backgroundColor: selectedZoneIndex === idx ? 'rgba(220,38,38,0.3)' : 'rgba(220,38,38,0.1)',
                            cursor: 'pointer',
                          }}
                        />
                      ))}
                      {currentBox && (
                        <div className="epaper-zone" style={{
                          top: `${currentBox.top}%`, left: `${currentBox.left}%`,
                          width: `${currentBox.width}%`, height: `${currentBox.height}%`,
                          border: '2px solid #dc2626', backgroundColor: 'rgba(220,38,38,0.2)', zIndex: 11,
                        }} />
                      )}
                    </div>
                  ) : (
                    <div className="epaper-no-image">No image</div>
                  )}

                  {/* Prev / Next overlay buttons */}
                  {!isAdmin && pages.length > 1 && (
                    <>
                      {currentPageIndex > 0 && (
                        <button className="epaper-nav-btn-overlay epaper-nav-prev-overlay" onClick={goToPrev} aria-label="Previous Page">
                          <svg viewBox="0 0 320 512" width="24" height="24" fill="currentColor"><path d="M34.52 239.03L228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94z"/></svg>
                        </button>
                      )}
                      {currentPageIndex < pages.length - 1 && (
                        <button className="epaper-nav-btn-overlay epaper-nav-next-overlay" onClick={goToNext} aria-label="Next Page">
                          <svg viewBox="0 0 320 512" width="24" height="24" fill="currentColor"><path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"/></svg>
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* RIGHT PANEL — share + zone images (desktop only, hidden on mobile) */}
              <div className="epaper-right-panel hidden md:block">
                {/* Share */}
                <div className="epaper-share-bar">
                  <span>{locale === 'bn' ? 'শেয়ার করুন' : 'Share'}</span>
                  <div className="epaper-share-icons">
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noopener noreferrer" className="epaper-share-icon fb" aria-label="Facebook">
                      <i className="fab fa-facebook-f" />
                    </a>
                    <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noopener noreferrer" className="epaper-share-icon wa" aria-label="WhatsApp">
                      <i className="fab fa-whatsapp" />
                    </a>
                    <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noopener noreferrer" className="epaper-share-icon tw" aria-label="Twitter">
                      <i className="fab fa-twitter" />
                    </a>
                  </div>
                </div>

                {/* Zone images for the selected area */}
                <div className="epaper-highlights">
                  {activeZoneImages.length > 0 ? (
                    <div className="flex flex-col gap-6 items-center w-full">
                      {activeZoneImages.map((imgUrl, imgIdx) => (
                        <div key={imgIdx} className="epaper-highlight-card w-full">
                          <div className="epaper-highlight-badge">
                            {globalSettings?.logo?.url ? (
                              <img src={getStrapiMedia(globalSettings.logo)} alt="Logo" />
                            ) : (
                              <img src="/assets/images/logo.png" alt="Logo" />
                            )}
                          </div>
                          <div className="epaper-highlight-images">
                            <img
                              src={imgUrl}
                              alt={`Selected ${imgIdx + 1}`}
                              className="epaper-highlight-img"
                              onClick={() => setActiveModalImages(activeZoneImages)}
                              onError={(e) => e.target.src = '/default.jpg'}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="epaper-highlights-empty">
                      {locale === 'bn' 
                        ? 'খবর দেখতে পাতার ওপর ক্লিক করুন' 
                        : 'Click on the newspaper page to view details'}
                    </div>
                  )}
                </div>
              </div>

              {/* Admin panel (preserved) */}
              {isAdmin && (
                <div className="epaper-admin-panel">
                  <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>🛠</span> Area Coordinator
                  </div>
                  {drawnZones.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px' }}>
                        {drawnZones.map((_, i) => (
                          <button key={i} onClick={() => setSelectedZoneIndex(i)}
                            style={{ padding: '4px 10px', borderRadius: '4px', border: 'none', background: selectedZoneIndex === i ? '#dc2626' : '#333', color: '#fff', fontSize: '11px', cursor: 'pointer', minWidth: '35px' }}>
                            #{i + 1}
                          </button>
                        ))}
                        <button onClick={() => { setDrawnZones([]); setSelectedZoneIndex(null); }}
                          style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: '#444', color: '#ff4444', fontSize: '10px', cursor: 'pointer' }}>
                          Reset
                        </button>
                      </div>
                      {selectedZoneIndex !== null && drawnZones[selectedZoneIndex] && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {['top', 'left', 'width', 'height'].map(field => (
                            <div key={field} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', padding: '5px 8px', borderRadius: '6px' }}>
                              <span style={{ color: '#aaa', textTransform: 'capitalize' }}>{field}:</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <code style={{ color: '#fff', fontSize: '12px' }}>{drawnZones[selectedZoneIndex][field].toFixed(2)}</code>
                                <button onClick={() => copyToClipboard(drawnZones[selectedZoneIndex][field].toFixed(2), field)}
                                  style={{ background: 'none', border: 'none', color: copiedField === field ? '#10b981' : '#dc2626', cursor: 'pointer', padding: '2px', display: 'flex' }}>
                                  {copiedField === field ? '✓' : '📋'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ color: '#888', fontStyle: 'italic', fontSize: '12px' }}>
                      Draw a box on the image to see coordinates...
                    </div>
                  )}
                </div>
              )}

              {/* ── MOBILE THUMBNAIL STRIP (Now inside viewer grid) ── */}
              {!showAllPages && pages.length > 0 && (
                <div className="epaper-mobile-thumbs p-3 gap-3 overflow-x-scroll">
                  {pages.map((page, i) => {
                    const thumbUrl = getStrapiMedia(page.image);
                    const isActive = i === currentPageIndex;
                    return (
                      <div
                        key={page.id || i}
                        className={`flex-shrink-0 border scroll-smooth ${isActive ? 'border-red1' : 'border-black'}`}
                        onClick={() => setCurrentPageIndex(i)}
                      >
                        <img src={thumbUrl} alt={`page ${i + 1}`} style={{ width: '100px', height: 'auto' }} onError={(e) => e.target.src = '/default.jpg'} />
                        <div className={`flex justify-center text-white text-sm ${isActive ? 'bg-red1' : 'bg-gray-900'}`}>
                          {locale === 'bn' ? `পাতা ${toBengaliNumber(i + 1)}` : `Page ${i + 1}`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── IMAGE MODAL ── */}
        {activeModalImages && activeModalImages.length > 0 && (
          <div className="epaper-modal-overlay" onClick={() => setActiveModalImages([])}>
            <div className="ant-modal-content" onClick={(e) => e.stopPropagation()}>
              <button type="button" aria-label="Close" className="ant-modal-close" onClick={() => setActiveModalImages([])}>
                <span className="ant-modal-close-x">
                  <span role="img" aria-label="close" className="anticon anticon-close ant-modal-close-icon">
                    <svg fillRule="evenodd" viewBox="64 64 896 896" focusable="false" data-icon="close" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                      <path d="M799.86 166.31c.02 0 .04.02.08.06l57.69 57.7c.04.03.05.05.06.08a.12.12 0 010 .06c0 .03-.02.05-.06.09L569.93 512l287.7 287.7c.04.04.05.06.06.09a.12.12 0 010 .07c0 .02-.02.04-.06.08l-57.7 57.69c-.03.04-.05.05-.07.06a.12.12 0 01-.07 0c-.03 0-.05-.02-.09-.06L512 569.93l-287.7 287.7c-.04.04-.06.05-.09.06a.12.12 0 01-.07 0c-.02 0-.04-.02-.08-.06l-57.69-57.7c-.04-.03-.05-.05-.06-.07a.12.12 0 010-.07c0-.03.02-.05.06-.09L454.07 512l-287.7-287.7c-.04-.04-.05-.06-.06-.09a.12.12 0 010-.07c0-.02.02-.04.06-.08l57.7-57.69c.03-.04.05-.05.07-.06a.12.12 0 01.07 0c.03 0 .05.02.09.06L512 454.07l287.7-287.7c.04-.04.06-.05.09-.06a.12.12 0 01.07 0z"></path>
                    </svg>
                  </span>
                </span>
              </button>
              <div className="ant-modal-body">
                {/* Modal Share Bar */}
                <div className="modal-share-bar">
                  <div className="share-label">{locale === 'bn' ? 'শেয়ার করুন' : 'Share'}</div>
                  <div className="share-icons">
                    <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')} aria-label="facebook">
                      <img alt="facebook" src="https://images.dailyamardesh.com/social/facebook.png" width="22" height="22" />
                    </button>
                    <button onClick={() => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(window.location.href)}`, '_blank')} aria-label="whatsapp">
                      <img alt="whatsapp" src="https://images.dailyamardesh.com/social/whatsapp.png" width="22" height="22" />
                    </button>
                    <button onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}`, '_blank')} aria-label="twitter">
                      <img alt="twitter" src="https://images.dailyamardesh.com/social/twitter.png" width="22" height="22" />
                    </button>
                  </div>
                </div>

                {/* Branded Highlight Cards in Modal */}
                {activeModalImages.map((imgUrl, idx) => (
                  <div key={idx} className="modal-highlight-container">
                    <div className="modal-highlight-card">
                      <div className="modal-highlight-badge">
                        {globalSettings?.logo?.url ? (
                          <img src={getStrapiMedia(globalSettings.logo)} alt="Logo" />
                        ) : (
                          <img src="/assets/images/logo.png" alt="Logo" />
                        )}
                      </div>
                      <div className="modal-image-wrapper">
                        <img src={imgUrl} alt={`Article ${idx + 1}`} onError={(e) => e.target.src = '/default.jpg'} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </Layout>
  );
}
