/**
 * Weather Service using Open-Meteo API (free, no API key required)
 * Uses geolocation or defaults to Dhaka, Bangladesh
 */

const DEFAULT_LAT = 23.8103; // Dhaka, Bangladesh
const DEFAULT_LON = 90.4125;

const WEATHER_DESCRIPTION_BN = {
  'Clear sky': 'পরিষ্কার আকাশ',
  'Partly cloudy': 'আংশিক মেঘলা',
  'Overcast': 'ঘন মেঘলা',
  'Foggy': 'কুয়াশাচ্ছন্ন',
  'Drizzle': 'গুঁড়ি গুঁড়ি বৃষ্টি',
  'Rain': 'বৃষ্টি',
  'Snow': 'তুষারপাত',
  'Rain showers': 'ঝরনা বৃষ্টি',
  'Snow showers': 'তুষার ঝরনা',
  'Thunderstorm': 'বজ্রঝড়',
  'Unknown': 'অজানা',
  'N/A': 'উপলভ্য নয়',
};

function formatLocationLabel(location, locale = 'en') {
  if (!location) {
    return '';
  }

  const city = location.name || location.admin1 || location.country || '';
  const country = location.country || '';

  if (!city && !country) {
    return '';
  }

  return country && city !== country ? `${city}, ${country}` : city;
}

async function getLocationName(lat, lon, locale = 'en') {
  try {
    const language = locale === 'bn' ? 'bn' : 'en';
    // Nominatim supports true reverse geocoding (lat/lon → name)
    const reverseUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=${language}`;
    const response = await fetch(reverseUrl, {
      headers: { 'User-Agent': 'SatyadharaProtidin/1.0 (news portal)' },
      next: { revalidate: 86400 }, // location name rarely changes — cache 24h
    });
    if (!response.ok) throw new Error('Reverse geocoding failed');

    const data = await response.json();
    const addr = data?.address || {};
    const city = addr.city || addr.town || addr.village || addr.county || '';
    const country = addr.country || '';
    if (!city && !country) return '';
    return city && country && city !== country ? `${city}, ${country}` : city || country;
  } catch (error) {
    console.error('Location lookup error:', error);
    return '';
  }
}

function localizeWeatherDescription(description, locale = 'en') {
  if (locale === 'bn') {
    return WEATHER_DESCRIPTION_BN[description] || description;
  }
  return description;
}

/**
 * Get current weather data from Open-Meteo API
 * @param {number} lat - Latitude (defaults to Dhaka)
 * @param {number} lon - Longitude (defaults to Dhaka)
 * @returns {Promise<{temp: number, weatherCode: number, description: string, icon: string}>}
 */
export async function getCurrentWeather(lat = DEFAULT_LAT, lon = DEFAULT_LON, locale = 'en', { noCache = false } = {}) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&temperature_unit=celsius&timezone=auto`;
    const fetchOpts = noCache ? { cache: 'no-store' } : { next: { revalidate: 1800 } };
    const response = await fetch(url, fetchOpts);
    if (!response.ok) throw new Error('Weather fetch failed');
    const data = await response.json();

    const temp = Math.round(data.current.temperature_2m);
    const weatherCode = data.current.weather_code;
    const { description, icon } = getWeatherInfo(weatherCode);

    return { temp, weatherCode, description: localizeWeatherDescription(description, locale), icon };
  } catch (error) {
    console.error('Weather service error:', error);
    return { temp: null, weatherCode: null, description: localizeWeatherDescription('N/A', locale), icon: 'cloudy' };
  }
}

/**
 * Map WMO weather code to description and icon type
 */
export function getWeatherInfo(code) {
  if (code === 0) return { description: 'Clear sky', icon: 'sunny' };
  if (code <= 2) return { description: 'Partly cloudy', icon: 'partly-cloudy' };
  if (code === 3) return { description: 'Overcast', icon: 'cloudy' };
  if (code <= 49) return { description: 'Foggy', icon: 'foggy' };
  if (code <= 59) return { description: 'Drizzle', icon: 'rainy' };
  if (code <= 69) return { description: 'Rain', icon: 'rainy' };
  if (code <= 79) return { description: 'Snow', icon: 'snowy' };
  if (code <= 82) return { description: 'Rain showers', icon: 'rainy' };
  if (code <= 86) return { description: 'Snow showers', icon: 'snowy' };
  if (code <= 99) return { description: 'Thunderstorm', icon: 'thunderstorm' };
  return { description: 'Unknown', icon: 'cloudy' };
}

/**
 * Map weather code to weather-icons CSS class used in sidebar weather widget
 */
export function getWeatherIconClass(code) {
  if (code === 0) return 'wi wi-day-sunny';
  if (code <= 2) return 'wi wi-day-cloudy';
  if (code === 3) return 'wi wi-cloudy';
  if (code <= 49) return 'wi wi-fog';
  if (code <= 59) return 'wi wi-sprinkle';
  if (code <= 69) return 'wi wi-rain';
  if (code <= 79) return 'wi wi-snow';
  if (code <= 82) return 'wi wi-showers';
  if (code <= 86) return 'wi wi-snow-wind';
  if (code <= 99) return 'wi wi-thunderstorm';
  return 'wi wi-day-cloudy';
}

/**
 * Get current + 7 day weather data for sidebar widget
 * @param {number} lat - Latitude (defaults to Dhaka)
 * @param {number} lon - Longitude (defaults to Dhaka)
 */
export async function getWeatherForecast(lat = DEFAULT_LAT, lon = DEFAULT_LON, locale = 'en') {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,weather_code&daily=weather_code,temperature_2m_max,precipitation_probability_max&temperature_unit=celsius&timezone=auto&forecast_days=7`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Weather forecast fetch failed');

    const data = await response.json();
    const locationLabel = await getLocationName(lat, lon, locale);
    const currentCode = data?.current?.weather_code;
    const info = getWeatherInfo(currentCode);

    const dailyCodes = data?.daily?.weather_code || [];
    const dailyMaxTemps = data?.daily?.temperature_2m_max || [];
    const dailyRainChance = data?.daily?.precipitation_probability_max || [];

    const daily = Array.from({ length: 7 }).map((_, index) => {
      const weatherCode = dailyCodes[index] ?? null;
      return {
        weatherCode,
        iconClass: getWeatherIconClass(weatherCode),
        maxTemp: dailyMaxTemps[index] ?? null,
        rainChance: dailyRainChance[index] ?? null,
      };
    });

    return {
      currentTemp: data?.current?.temperature_2m ?? null,
      apparentTemp: data?.current?.apparent_temperature ?? null,
      weatherCode: currentCode ?? null,
      description: localizeWeatherDescription(info.description, locale),
      icon: info.icon,
      iconClass: getWeatherIconClass(currentCode),
      rainChance: daily[0]?.rainChance ?? null,
      locationLabel,
      daily,
    };
  } catch (error) {
    console.error('Weather forecast error:', error);
    return {
      currentTemp: null,
      apparentTemp: null,
      weatherCode: null,
      description: localizeWeatherDescription('N/A', locale),
      icon: 'partly-cloudy',
      iconClass: 'wi wi-day-cloudy',
      rainChance: null,
      locationLabel: locale === 'bn' ? 'ঢাকা, বাংলাদেশ' : 'Dhaka, Bangladesh',
      daily: [],
    };
  }
}
