const GEO_OPTIONS = {
  enableHighAccuracy: false,
  timeout: 8000,
  maximumAge: 600000,
};

const LOCATION_FETCH_TIMEOUT_MS = 5000;

const fetchJsonWithTimeout = async (url, options = {}, timeoutMs = LOCATION_FETCH_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const getBrowserCoordinates = () => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      () => resolve(null),
      GEO_OPTIONS
    );
  });
};

export const getIpLocation = async () => {
  const providers = [
    async () => {
      const data = await fetchJsonWithTimeout('https://ipapi.co/json/', { cache: 'no-store' });
      if (!data) return null;
      return {
        lat: Number(data?.latitude),
        lon: Number(data?.longitude),
        city: data?.city || '',
        country: data?.country_name || '',
      };
    },
    async () => {
      const data = await fetchJsonWithTimeout('https://ipwho.is/', { cache: 'no-store' });
      if (!data) return null;
      return {
        lat: Number(data?.latitude),
        lon: Number(data?.longitude),
        city: data?.city || '',
        country: data?.country || '',
      };
    },
  ];

  for (const provider of providers) {
    try {
      const result = await provider();
      const lat = Number(result?.lat);
      const lon = Number(result?.lon);
      if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

      const city = result?.city || '';
      const country = result?.country || '';
      const label = city && country ? `${city}, ${country}` : city || country || '';

      return { lat, lon, label };
    } catch {
    }
  }

  return null;
};

export const getTimezoneLocation = async (locale = 'en') => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    if (!timezone.includes('/')) return null;

    const timezoneParts = timezone.split('/');
    const cityGuess = timezoneParts[timezoneParts.length - 1]?.replace(/_/g, ' ');
    if (!cityGuess) return null;

    const language = locale === 'bn' ? 'bn' : 'en';
    const data = await fetchJsonWithTimeout(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityGuess)}&count=1&language=${language}&format=json`,
      { cache: 'no-store' }
    );
    if (!data) return null;
    const result = data?.results?.[0];
    if (!result) return null;

    const lat = Number(result?.latitude);
    const lon = Number(result?.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;

    const city = result?.name || cityGuess;
    const country = result?.country || '';
    const label = city && country ? `${city}, ${country}` : city || country || '';

    return { lat, lon, label };
  } catch {
    return null;
  }
};

export const resolveClientLocation = async (locale = 'en') => {
  // REMOVED getBrowserCoordinates() from automatic resolution because it
  // triggers an intrusive permission prompt immediately on page load.
  const [ipLocation, timezoneLocation] = await Promise.all([
    getIpLocation(),
    getTimezoneLocation(locale),
  ]);

  const lat = ipLocation?.lat ?? timezoneLocation?.lat;
  const lon = ipLocation?.lon ?? timezoneLocation?.lon;
  const fallbackLabel = ipLocation?.label || timezoneLocation?.label || '';

  return {
    lat,
    lon,
    fallbackLabel,
  };
};
