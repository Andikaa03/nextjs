import { fetchAPI } from '@/lib/strapi';

/**
 * Subscribe an email to the newsletter.
 * POST /api/newsletters
 */
export async function subscribeNewsletter(email, source = 'footer', turnstileToken = null) {
  try {
    const payload = {
      data: {
        email,
        source,
        subscribed_at: new Date().toISOString(),
      },
    };

    // Add Turnstile token if provided
    if (turnstileToken) {
      payload.data.turnstileToken = turnstileToken;
    }

    const response = await fetchAPI('/newsletters', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return { success: true, data: response };
  } catch (error) {
    // Strapi returns 400 for duplicate unique fields or turnstile failure
    if (error?.status === 400) {
      return { success: false, error: 'duplicate' };
    }
    console.error('Newsletter subscription error:', error);
    return { success: false, error: 'unknown' };
  }
}

