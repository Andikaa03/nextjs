
import { fetchAPI, getStrapiLocale } from '@/lib/strapi';

export async function getGlobalSettings(locale = 'bn') {
  const strapiLocale = getStrapiLocale(locale);
  try {
    return await fetchAPI(`/global?populate=*&locale=${strapiLocale}`, { silent: true });
  } catch (error) {
    // Silent fallback when global singleton is missing/unpublished/unreachable
    return { data: null };
  }
}


export async function getAuthors(locale = 'bn') {
  const strapiLocale = getStrapiLocale(locale);
  return fetchAPI(`/authors?populate=*&locale=${strapiLocale}`);
}

export async function getTrendingCategories(limit = 5, locale = 'bn') {
  const strapiLocale = getStrapiLocale(locale);
  try {
      return await fetchAPI(`/categories?populate=*&filters[isTrending][$eq]=true&pagination[limit]=${limit}&locale=${strapiLocale}`);
  } catch (e) {
      console.warn("getTrendingCategories failed. Returning empty.", e);
      return { data: [] };
  }
}

export async function getCategories(limit = 10, locale = 'bn') {
  const strapiLocale = getStrapiLocale(locale);
  try {
      return await fetchAPI(`/categories?populate=*&pagination[limit]=${limit}&locale=${strapiLocale}`);
  } catch (e) {
      console.warn("getCategories failed. Returning empty.", e);
      return { data: [] };
  }
}

export async function getTags(limit = 10, locale = 'bn') {
  const strapiLocale = getStrapiLocale(locale);
  try {
    const queryParams = new URLSearchParams({
      'pagination[limit]': limit,
      'locale': strapiLocale,
    });

    return await fetchAPI(`/tags?${queryParams}`);
  } catch (error) {
    console.warn("getTags failed. Returning empty.", error);
    return { data: [] };
  }
}

export async function getMenuItems(location = 'header', locale = 'bn') {
  const strapiLocale = getStrapiLocale(locale);
  try {
    let endpoint = '';
    let query = '';

    if (location === 'header') {
      endpoint = '/header';
      query = [
        `locale=${strapiLocale}`,
        'populate[logo][fields][0]=url&populate[logo][fields][1]=alternativeText',
        'populate[menu][on][navigation.base-link][populate]=*',
        'populate[menu][on][navigation.menu-button][populate]=*',
        'populate[menu][on][navigation.dropdown-menu][populate][subMenus][on][navigation.base-link][populate]=*',
        'populate[menu][on][navigation.dropdown-menu][populate][subMenus][on][navigation.dropdown-header][populate]=*',
        'populate[menu][on][navigation.dropdown-menu][populate][subMenus][on][navigation.nested-dropdown][populate][subMenus]=*',
        'populate[menu][on][navigation.mega-menu][populate][sections][populate][links][populate]=*',
        'populate[menu][on][navigation.video-menu][populate][videos][populate][thumbnail][fields][0]=url&populate[menu][on][navigation.video-menu][populate][videos][populate][thumbnail][fields][1]=alternativeText&populate[menu][on][navigation.video-menu][populate][videos][populate][thumbnail][fields][2]=width&populate[menu][on][navigation.video-menu][populate][videos][populate][thumbnail][fields][3]=height'
      ].join('&');
    } else if (location === 'footer') {
      endpoint = '/footer';
      query = `locale=${strapiLocale}&populate=*`;
    } else if (location === 'sidebar') {
      endpoint = '/sidebar';
      query = `locale=${strapiLocale}&populate=*`;
    }

    const response = await fetchAPI(`${endpoint}?${query}`, { silent: true });
    
    const firstEntry = response?.data;
    const attributes = firstEntry?.attributes || firstEntry || {};

    // Standardize the return property to `menu` instead of `headerMenu`, `sidebarMenu`, etc.
    // The APIs now all hold their menu as attributes.menu
    const menuData = attributes.menu || [];

    // We also return attributes so the caller can access things like `logo` and `description` from the sidebar
    return { data: menuData, attributes };

  } catch (error) {
    // Missing menu singleton should not break UI
    return { data: [], attributes: {} };
  }
}

export async function getAdsManagement() {
  try {
    return await fetchAPI(`/ads-management?populate=*`, { silent: true });
  } catch {
    return { data: null };
  }
}

export async function getHeaderTop(locale = 'bn') {
  const strapiLocale = getStrapiLocale(locale);
  try {
    return await fetchAPI(`/header-top?populate[socialLinks][populate]=icon&populate[leftMenu][populate]=icon&populate[rightMenu][populate]=icon&locale=${strapiLocale}`, { silent: true });
  } catch {
    return { data: null };
  }
}
