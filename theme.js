const body = document.body;
const THEME_KEY = 'theme-preference';

function getToggle() {
  return document.getElementById('toggle');
}

async function getLocationAndSetTheme() {
  const manualPreference = localStorage.getItem(THEME_KEY);
  let isDay = false;

  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const geoResponse = await fetch('https://ipapi.co/json/');
    const geoData = await geoResponse.json();
    const { latitude, longitude } = geoData;
    const today = new Date().toISOString().split('T')[0];
    const sunResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=sunrise,sunset&timezone=${timezone}&date=${today}`
    );
    const sunData = await sunResponse.json();

    if (sunData.daily && sunData.daily.sunrise && sunData.daily.sunset) {
      const sunrise = new Date(sunData.daily.sunrise[0]);
      const sunset = new Date(sunData.daily.sunset[0]);
      const now = new Date();
      isDay = now >= sunrise && now < sunset;
    }
  } catch (error) {
    const hour = new Date().getHours();
    isDay = hour >= 6 && hour < 18;
    console.warn('Using fallback time-based theme detection:', error);
  }

  const toggleEl = getToggle();
  const html = document.documentElement;
  function applyLight(on) {
    if (on) {
      body.classList.add('light');
      html.classList.add('light');
      if (toggleEl) toggleEl.textContent = '☀️';
    } else {
      body.classList.remove('light');
      html.classList.remove('light');
      if (toggleEl) toggleEl.textContent = '🌙';
    }
  }

  if (!manualPreference) {
    applyLight(isDay);
  } else {
    applyLight(manualPreference === 'light');
  }
}

function setThemeToggle() {
  const toggleEl = getToggle();
  if (!toggleEl) return;

  // Ensure button text matches current theme immediately
  const isLightNow = body.classList.contains('light') || document.documentElement.classList.contains('light');
  toggleEl.textContent = isLightNow ? '☀️' : '🌙';

  toggleEl.onclick = () => {
    const nowIsLight = body.classList.contains('light') || document.documentElement.classList.contains('light');
    // Toggle both html and body classes so head-prep script and runtime stay in sync
    if (nowIsLight) {
      body.classList.remove('light');
      document.documentElement.classList.remove('light');
      toggleEl.textContent = '🌙';
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      body.classList.add('light');
      document.documentElement.classList.add('light');
      toggleEl.textContent = '☀️';
      localStorage.setItem(THEME_KEY, 'light');
    }
  };
}

function setYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  // Attach toggle handler and year immediately to allow instant interaction
  setThemeToggle();
  setYear();

  // Perform location-based theme check asynchronously (may involve network)
  getLocationAndSetTheme().catch(() => {});
});
