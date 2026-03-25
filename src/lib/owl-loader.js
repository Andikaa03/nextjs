// Shared singleton promise — both carousel components resolve from the same load
let owlPromise = null;

export function loadOwlCarousel() {
  if (owlPromise) return owlPromise;

  owlPromise = Promise.all([
    import('jquery'),
    import('react-owl-carousel'),
  ]).then(([jqueryModule, owlModule]) => {
    const jQuery = jqueryModule.default || jqueryModule;
    if (typeof window !== 'undefined' && !window.jQuery) {
      window.$ = window.jQuery = jQuery;
    }
    return owlModule.default || owlModule;
  }).catch((err) => {
    // Reset so a retry is possible on next mount
    owlPromise = null;
    throw err;
  });

  return owlPromise;
}

// Eagerly kick off loading as soon as this module is evaluated in the browser.
// This runs when HomePageClient imports this file — well before HomeCenterSlider mounts.
if (typeof window !== 'undefined') {
  loadOwlCarousel().catch(() => {});
}
