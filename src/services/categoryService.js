
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
 * Fetch categories and build a tree structure using the `parentCategory` field.
 * Returns only root categories (those without a parentCategory), each with a `children` array.
 * Root categories must have showInMenu === true.
 */
export async function getCategoriesWithChildren(locale = 'bn') {
  const strapiLocale = getStrapiLocale(locale);
  try {
    const res = await fetchAPI(
      `/categories?populate=parentCategory&locale=${strapiLocale}&sort=sortOrder:asc,name:asc&pagination[pageSize]=100`
    );
    const allCategories = (res?.data || []).map(c => c.attributes || c);

    // Identify root categories: no parentCategory and showInMenu === true
    const roots = allCategories.filter(cat => {
      if (cat.showInMenu !== true) return false;
      const parentId = cat.parentCategory?.id || cat.parentCategory?.data?.id;
      if (!parentId) return true;
      if (parentId === cat.id) return true; // Fix circular references
      return false;
    });

    const rootIds = new Set(roots.map(r => r.id));

    // Build children manually: categories whose parentCategory points to a root
    return roots.map(root => {
      const children = allCategories
        .filter(cat => {
          const parentId = cat.parentCategory?.id || cat.parentCategory?.data?.id;
          return parentId === root.id && cat.id !== root.id && !rootIds.has(cat.id);
        })
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      return { ...root, children };
    });
  } catch (error) {
    console.error('Error fetching categories with children:', error);
    return [];
  }
}
