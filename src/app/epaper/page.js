'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTheme } from 'next-themes';
import { getEpapers } from '@/lib/epaper-api';
import { getStrapiMedia } from '@/lib/strapi';
import Layout from "@/components/ltr/layout/layout";
import { getGlobalSettings } from "@/services/globalService";
import { useLanguage } from '@/lib/LanguageContext';
import { useTranslations } from '@/lib/translations';

export default function EpaperPage() {
  const searchParams = useSearchParams();
  const isAdmin = searchParams.get('admin') === 'true';
  const { locale } = useLanguage();
  const { t } = useTranslations(locale);

  const [pages, setPages] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [globalSettings, setGlobalSettings] = useState(null);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentBox, setCurrentBox] = useState(null);
  const [drawnZones, setDrawnZones] = useState([]);
  const [selectedZoneIndex, setSelectedZoneIndex] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const imageRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [result, globalRes] = await Promise.all([
          getEpapers(locale),
          getGlobalSettings(locale),
        ]);
        setPages(result);
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

  const currentPage = pages[currentPageIndex] || null;
  const imageUrl = currentPage ? getStrapiMedia(currentPage.image) : null;
  // Parse zones from Strapi JSON field
  const zones = currentPage?.zones || [];

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

    setCurrentBox({
      top: Math.min(y, startPos.y),
      left: Math.min(x, startPos.x),
      width: Math.abs(x - startPos.x),
      height: Math.abs(y - startPos.y),
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !isAdmin) return;
    setIsDrawing(false);
    if (currentBox && currentBox.width > 0.1 && currentBox.height > 0.1) {
      const newZone = { ...currentBox, url: '#', title: `Area ${drawnZones.length + 1}` };
      const updatedZones = [...drawnZones, newZone];
      setDrawnZones(updatedZones);
      setSelectedZoneIndex(updatedZones.length - 1);
    }
    setCurrentBox(null);
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text.toString());
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const triggerAnimation = (direction, newIndex) => {
    setCurrentPageIndex(newIndex);
  };

  const goToPrev = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };
  const goToNext = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  return (
    <Layout globalSettings={globalSettings} hideMiddleHeader={true}>
      <main className="page_main_wrapper">

        {/* Main content */}
        <div style={{ 
          background: mounted && theme === 'skin-dark' ? '#121212' : '#f0f0f0', 
          minHeight: '85vh',
          transition: 'background 0.3s ease',
          position: 'relative',
          paddingTop: '40px'
        }}>
          <div className="container" style={{ maxWidth: '90%', padding: '0 15px' }}>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '120px 0', color: '#999' }}>
                <div className="spinner-border text-danger mb-3" role="status">
                  <span className="visually-hidden">{t('loading')}</span>
                </div>
                <p style={{ fontSize: '16px' }}>{t('loading')}</p>
              </div>
            ) : pages.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '120px 20px', color: '#666',
                background: theme === 'skin-dark' ? '#1e1e1e' : '#fff', 
                borderRadius: '12px', 
                boxShadow: theme === 'skin-dark' ? 'none' : '0 2px 15px rgba(0,0,0,0.06)'
              }}>
                <div style={{ fontSize: '60px', marginBottom: '15px' }}>📭</div>
                <h3 style={{ fontSize: '22px', marginBottom: '10px', fontWeight: 'bold', color: theme === 'skin-dark' ? '#fff' : '#333' }}>
                  {t('noEpaperFound')}
                </h3>
                <p style={{ fontSize: '15px', color: '#999' }}>{t('uploadEpaperInstruction')}</p>
              </div>
            ) : (
                /* Main page image container */
                <div style={{
                  display: 'flex',
                  gap: '20px',
                  justifyContent: 'center',
                  alignItems: 'flex-start',
                  flexWrap: isAdmin ? 'nowrap' : 'wrap',
                  position: 'relative',
                  maxWidth: isAdmin ? '1300px' : '100%',
                  margin: '0 auto',
                  padding: isAdmin ? '0 20px' : '0'
                }}>
                  <div 
                    style={{
                      flex: isAdmin ? '1' : '0 1 100%',
                      maxWidth: isAdmin ? 'calc(100% - 240px)' : '100%',
                      position: 'relative',
                      background: '#fff',
                      borderRadius: '8px',
                      boxShadow: mounted && theme === 'skin-dark' ? '0 10px 40px rgba(0,0,0,0.6)' : '0 10px 30px rgba(0,0,0,0.1)',
                      overflow: 'hidden',
                      cursor: isAdmin ? 'crosshair' : 'default',
                      userSelect: 'none',
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                  >
                    {imageUrl ? (
                      <div style={{ position: 'relative', width: '100%' }}>
                        <img
                          ref={imageRef}
                          src={imageUrl}
                          alt={currentPage?.title || 'ePaper'}
                          style={{ width: '100%', height: 'auto', display: 'block' }}
                          onError={(e) => e.target.src = '/default.jpg'}
                          draggable={false}
                        />
                        
                        {/* Render Clickable Zones from Strapi */}
                        {[...zones].reverse().map((zone, idx) => {
                          const articleSlug = zone.article?.slug;
                          const finalUrl = articleSlug ? `/epaper/article/${articleSlug}` : '#';
                          return (
                            <a
                              key={idx}
                              href={finalUrl}
                              title={zone.article?.title || t('relatedArticles')}
                              style={{
                                position: 'absolute',
                                top: `${zone.top}%`,
                                left: `${zone.left}%`,
                                width: `${zone.width}%`,
                                height: `${zone.height}%`,
                                border: isAdmin ? '1px dashed rgba(220,38,38,0.5)' : 'none',
                                backgroundColor: 'transparent',
                                zIndex: 10,
                              }}
                              onMouseOver={(e) => !isAdmin && (e.target.style.backgroundColor = 'rgba(220,38,38,0.1)')}
                              onMouseOut={(e) => !isAdmin && (e.target.style.backgroundColor = 'transparent')}
                            />
                          );
                        })}

                        {/* Render temporary drawn zones if in admin mode */}
                        {drawnZones.map((zone, idx) => (
                          <div
                            key={`drawn-${idx}`}
                            onClick={(e) => { e.stopPropagation(); setSelectedZoneIndex(idx); }}
                            style={{
                              position: 'absolute',
                              top: `${zone.top}%`,
                              left: `${zone.left}%`,
                              width: `${zone.width}%`,
                              height: `${zone.height}%`,
                              border: selectedZoneIndex === idx ? '3px solid #dc2626' : '1px solid #dc2626',
                              backgroundColor: selectedZoneIndex === idx ? 'rgba(220,38,38,0.3)' : 'rgba(220,38,38,0.1)',
                              zIndex: 10,
                              cursor: 'pointer'
                            }}
                          />
                        ))}

                        {/* Active drawing box */}
                        {currentBox && (
                          <div style={{
                            position: 'absolute',
                            top: `${currentBox.top}%`,
                            left: `${currentBox.left}%`,
                            width: `${currentBox.width}%`,
                            height: `${currentBox.height}%`,
                            border: '2px solid #dc2626',
                            backgroundColor: 'rgba(220,38,38,0.2)',
                            zIndex: 11,
                          }} />
                        )}
                      </div>
                    ) : (
                      <div style={{
                        width: '100%', aspectRatio: '1008 / 1584', background: '#f3f4f6',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '18px'
                      }}>
                        No image
                      </div>
                    )}
                  </div>

                  {/* Floating Navigation Buttons */}
                  {!isAdmin && pages.length > 1 && (
                    <>
                      <button 
                        onClick={goToPrev}
                        disabled={currentPageIndex === 0}
                        className="nav_btn_floating"
                        style={{
                          position: 'fixed', left: '20px', top: '50%', transform: 'translateY(-50%)',
                          width: '50px', height: '50px', borderRadius: '50%', 
                          background: '#eb0254',
                          color: '#fff',
                          border: 'none', fontSize: '24px', cursor: 'pointer', zIndex: 100,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 8px 32px rgba(235,2,84,0.2)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          opacity: currentPageIndex === 0 ? 0.2 : 1
                        }}
                      >
                        ‹
                      </button>
                      <button 
                        onClick={goToNext}
                        disabled={currentPageIndex === pages.length - 1}
                        className="nav_btn_floating"
                        style={{
                          position: 'fixed', right: '20px', top: '50%', transform: 'translateY(-50%)',
                          width: '50px', height: '50px', borderRadius: '50%', 
                          background: '#eb0254',
                          color: '#fff',
                          border: 'none', fontSize: '24px', cursor: 'pointer', zIndex: 100,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 8px 32px rgba(235,2,84,0.2)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          opacity: currentPageIndex === pages.length - 1 ? 0.2 : 1
                        }}
                      >
                        ›
                      </button>
                    </>
                  )}

                  {/* Admin Coordinator Panel - Side Positioned */}
                  {isAdmin && (
                    <div style={{
                      flex: '0 0 220px',
                      background: '#1a1a2e', 
                      color: '#fff', padding: '15px', borderRadius: '12px', fontSize: '13px',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      position: 'sticky',
                      top: '20px'
                    }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '10px', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px' }}>🛠</span> Area Coordinator
                      </div>
                      
                      {drawnZones.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '10px', paddingBottom: '5px' }}>
                            {drawnZones.map((_, i) => (
                              <button 
                                key={i}
                                onClick={() => setSelectedZoneIndex(i)}
                                style={{
                                  padding: '4px 10px', borderRadius: '4px', border: 'none',
                                  background: selectedZoneIndex === i ? '#dc2626' : '#333',
                                  color: '#fff', fontSize: '11px', cursor: 'pointer',
                                  minWidth: '35px'
                                }}
                              >
                                #{i + 1}
                              </button>
                            ))}
                            <button 
                              onClick={() => { setDrawnZones([]); setSelectedZoneIndex(null); }}
                              style={{ padding: '4px 8px', borderRadius: '4px', border: 'none', background: '#444', color: '#ff4444', fontSize: '10px', cursor: 'pointer' }}
                            >
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
                                    <button 
                                      onClick={() => copyToClipboard(drawnZones[selectedZoneIndex][field].toFixed(2), field)}
                                      style={{ background: 'none', border: 'none', color: copiedField === field ? '#10b981' : '#dc2626', cursor: 'pointer', padding: '2px', display: 'flex' }}
                                      title={`Copy ${field}`}
                                    >
                                      {copiedField === field ? (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                      ) : (
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                          <div style={{ fontSize: '10px', color: '#888', marginTop: '5px', textAlign: 'center' }}>
                            Click a zone on image or a number to select
                          </div>
                        </div>
                      ) : (
                        <div style={{ color: '#888', fontStyle: 'italic', fontSize: '12px' }}>
                          Draw a box on the image to see coordinates...
                        </div>
                      )}
                    </div>
                  )}
                </div>
            )}
          </div>
        </div>

        {/* Thumbnail strip (Prothom Alo Style) */}
        {pages.length > 0 && (
          <div className="main_thumbnails_section" style={{
            background: 'transparent',
            padding: '40px 0',
            marginTop: '40px',
            width: '100%'
          }}>
            <div className="container" style={{ maxWidth: '90%', padding: '0 15px' }}>
              <div className="thumbnails_section" style={{
                display: 'flex',
                gap: '0',
                overflowX: 'auto',
                paddingBottom: '20px',
                scrollbarWidth: 'thin',
                scrollbarColor: `#eb0254 ${mounted && theme === 'skin-dark' ? '#2b2b2b' : '#eee'}`
              }}>
                {pages.map((page, index) => {
                  const thumbUrl = getStrapiMedia(page.image);
                  const isActive = index === currentPageIndex;
                  return (
                    <div
                      key={page.id || index}
                      onClick={() => setCurrentPageIndex(index)}
                      className="owl-item active"
                      style={{
                        width: '96px',
                        marginRight: '15px',
                        flex: '0 0 auto',
                        cursor: 'pointer'
                      }}
                    >
                      <div className="item" style={{ minWidth: '97px', textAlign: 'center' }}>
                        <div style={{
                          position: 'relative',
                          border: isActive ? '1px solid #eb0254' : '1px solid transparent',
                          borderRadius: '2px',
                          overflow: 'hidden',
                          marginBottom: '10px',
                          backgroundColor: 'transparent',
                        }}>
                          <img
                            src={thumbUrl}
                            alt={page.title}
                            className={`pg_thumnail ${isActive ? 'selectedIMG' : ''}`}
                            style={{
                              width: '100%',
                              height: '140px',
                              objectFit: 'contain',
                              display: 'block',
                            }}
                            onError={(e) => e.target.src = '/default.jpg'}
                          />
                        </div>
                        <span className="page_title" style={{
                          fontSize: '12px',
                          color: mounted && theme === 'skin-dark' ? '#fff' : '#333',
                          fontWeight: 'normal',
                          display: 'block',
                          textAlign: 'center',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {page.title || `${t('pageLabel')} ${index + 1}`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        .nav_btn_floating:hover {
          background: #eb0254 !important;
          color: #fff !important;
          transform: translateY(-50%) scale(1.1) !important;
          box-shadow: 0 12px 40px rgba(235,2,84,0.3) !important;
        }
        .main_thumbnails_section {
          background: transparent !important;
          border: none !important;
          padding: 30px 0 !important;
        }
        .thumbnails_section .item.selected {
          border-color: #eb0254;
          transform: translateY(-5px);
        }
        @media (max-width: 1024px) {
          .nav_btn_floating {
            display: none !important;
          }
        }
      `}</style>
    </Layout>
  );
}
