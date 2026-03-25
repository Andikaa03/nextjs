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

    const response = await fetch('/api/strapi/newsletters/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const body = await response.json().catch(() => null);

    if (!response.ok) {
      const message = String(body?.error?.message || '').toLowerCase();

      if (response.status === 400) {
        if (message.includes('turnstile')) {
          return { success: false, error: 'turnstile' };
        }
        if (message.includes('already') || message.includes('unique') || message.includes('email')) {
          return { success: false, error: 'duplicate' };
        }
        return { success: false, error: 'bad_request' };
      }

      if (response.status === 403) {
        return { success: false, error: 'forbidden' };
      }

      return { success: false, error: 'unknown' };
    }

    return { success: true, data: body };
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return { success: false, error: 'unknown' };
  }
}

