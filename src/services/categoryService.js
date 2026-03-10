
import { fetchAPI, getStrapiLocale } from '@/lib/strapi';

// Get all categories (for navigation menu)
export async function getAllCategories(locale = 'bn') {
  const strapiLocale = getStrapiLocale(locale);
  try {
    return await fetchAPI(`/categories?populate=*&locale=${strapiLocale}&sort=name:asc`);
  } catch (error) {
    console.error('Error fetching all categories:', error);
    return { data: [] };
  }
}

export async function getCategories(locale = 'bn') {
  const strapiLocale = getStrapiLocale(locale);
  return await fetchAPI(`/categories?populate=*&locale=${strapiLocale}`);
}

export async function getCategoryBySlug(slug, locale = 'bn') {
  const strapiLocale = getStrapiLocale(locale);
  const data = await fetchAPI(`/categories?populate=*&filters[slug][$eq]=${encodeURIComponent(slug)}&locale=${strapiLocale}`);
  return data?.data?.[0] || null;
}

/**
 * Fetch categories with parent/children relations and build a tree structure.
 * Returns only root (parent) categories, each with a `children` array.
 * Filters out categories where showInMenu is false.
 */
export async function getCategoriesWithChildren(locale = 'bn') {
  const strapiLocale = getStrapiLocale(locale);
  try {
    const res = await fetchAPI(
      `/categories?populate[children][populate]=*&populate[parent][fields][0]=id&populate[featuredImage]=*&locale=${strapiLocale}&sort=sortOrder:asc,name:asc&pagination[pageSize]=100`
    );
    const allCategories = (res?.data || []).map(c => c.attributes || c);

    // Build tree: root categories are those without a parent
    const roots = allCategories.filter(cat => {
      const hasParent = cat.parent?.data?.id || cat.parent?.id;
      const showInMenu = cat.showInMenu !== false;
      return !hasParent && showInMenu;
    });

    // For each root, attach its children (filter by showInMenu)
    return roots.map(root => {
      const childrenData = root.children?.data || root.children || [];
      const children = childrenData
        .map(c => c.attributes || c)
        .filter(c => c.showInMenu !== false)
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      return { ...root, children };
    });
  } catch (error) {
    console.error('Error fetching categories with children:', error);
    return [];
  }
}
