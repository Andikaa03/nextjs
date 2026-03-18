
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
    // Populate parentCategory to identify relationships
    const res = await fetchAPI(
      `/categories?populate=parentCategory&locale=${strapiLocale}&sort=sortOrder:asc,name:asc&pagination[pageSize]=100`
    );
    const allCategories = (res?.data || []).map(c => ({
      id: c.id,
      ...(c.attributes || c)
    }));

    // Logic for parent-child hierarchy as requested:
    // 1. A category is a "Parent" (heading) if:
    //    - It has no parent (Root)
    //    - OR it has children
    
    // First, map which categories have children
    const parentIdsWithChildren = new Set();
    allCategories.forEach(cat => {
      const parentId = cat.parentCategory?.id || cat.parentCategory?.data?.id;
      if (parentId) {
        parentIdsWithChildren.add(parentId);
      }
    });

    // Identify headings: No parent OR has children, AND showInMenu must be true
    const headings = allCategories.filter(cat => {
      if (cat.showInMenu !== true) return false;
      const parentId = cat.parentCategory?.id || cat.parentCategory?.data?.id;
      
      // If no parent, it's a heading
      if (!parentId) return true;
      
      // If it has children, it's also a heading (even if it has a parent)
      if (parentIdsWithChildren.has(cat.id)) return true;
      
      return false;
    });

    // For each heading, find its children
    return headings.map(parent => {
      const children = allCategories
        .filter(cat => {
          const parentId = cat.parentCategory?.id || cat.parentCategory?.data?.id;
          return parentId === parent.id && cat.id !== parent.id;
        })
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      
      return { ...parent, children };
    });
  } catch (error) {
    console.error('Error fetching categories with children:', error);
    return [];
  }
}
