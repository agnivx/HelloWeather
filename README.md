# 🌦️ HelloWeather: Real-Time Atmosphere & Forecast Web App

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/Vanilla-JS-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS3 Glassmorphism](https://img.shields.io/badge/CSS3-Glassmorphism-60a5fa.svg)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![Open-Meteo](https://img.shields.io/badge/API-Open--Meteo-0284c7.svg)](https://open-meteo.com/)

> **HelloWeather** is a responsive, glassmorphic weather web application packed with real-time 60 FPS dynamic background particle simulations, 24-hour hourly forecasts, 7-day extended forecasts, Air Quality Index (AQI), UV Index, an interactive Wind Compass, Sun daylight tracking, and procedurally generated ambient soundscapes that automatically adapt to live weather conditions.

---

## ✨ Features & Highlights

### 🎨 1. Dynamic 60 FPS Particle Weather Engine
- **Rain & Drizzle**: High-speed raindrop streaks with realistic ground impact splashes and ripple effects.
- **Thunderstorm**: Heavy downpour accompanied by dynamic multi-pulse lightning sky flashes.
- **Snow & Flurries**: Sinusoidal drifting snowflakes with variable depth, sway, and soft glow.
- **Clear Night Sky**: Twinkling starlight field with shooting stars sweeping across the atmosphere.
- **Clear Day**: Warm sunbeam aura with floating golden atmospheric light motes.
- **Fog & Mist**: Soft drifting misty air currents.

### 🎵 2. Procedural Multi-Soundscape Audio Engine (Web Audio API)
Generates 100% synthetic, relaxing natural audio soundscapes natively in the browser with **zero external audio file downloads**:
- 🌧️ **Rain Patter**: Natural pink noise filtering with randomized water droplet clicks.
- ⛈️ **Thunderstorm**: Torrential downpour with periodic low-frequency rolling thunder rumbles.
- ❄️ **Blizzard Wind**: Cold resonant winter wind whistling through trees.
- 🐦 **Sunny Morning Birds**: Warm gentle daylight breeze + procedural melodic songbird chirps.
- 🦗 **Night Crickets**: Midnight breeze + rhythmic nocturnal crickets / cicadas.
- 💨 **Gentle Breeze**: Soothing atmospheric air stream for overcast & foggy skies.
- ⚡ **Auto-Weather Sync**: When switching between cities, the soundscape automatically crossfades to match the destination's active weather condition.

### 📊 3. Comprehensive Weather Forecasting & Atmospheric Insights
- **Hero Weather Card**: Large temperature display, "Feels like", High/Low range, animated vector SVG weather icons, and live local time.
- **24-Hour Hourly Forecast**: Smooth horizontal scrollable carousel with hour-by-hour temperatures, condition icons, and precipitation probability percentages.
- **7-Day Extended Forecast**: Daily forecast list with visual temperature distribution gradient bars (relative min/max temperature spans).
- **Air Quality Index (AQI)**: US AQI rating badge with detailed pollutant breakdowns for PM2.5, PM10, and Ozone ($O_3$).
- **UV Index Gauge**: Color-coded risk meter with sun-protection safety advice.
- **Interactive Wind Compass**: Rotating compass needle indicating wind direction, bearing angle, wind speed (km/h & mph), and peak gusts.
- **Sun & Daylight Arc**: Parabolic solar trajectory tracker showing exact sunrise, sunset, and remaining daylight hours.
- **Atmospheric Metrics**: Humidity percentage, dew point calculation, visibility distance, and surface barometric pressure ($hPa$).

### 🔍 4. Smart Search, Autocomplete & Geolocation
- **Instant Search with Autocomplete**: Debounced live global city search powered by Open-Meteo Geocoding with full keyboard navigation (`↑`, `↓`, `Enter`, `Esc`).
- **One-Tap GPS Geolocation**: Auto-detects user coordinates with reverse geocoding.
- **Favorites & Bookmarks**: Save favorite cities to `localStorage` for instant switching.
- **Instant Unit Toggle**: Toggle seamlessly between Celsius (°C) and Fahrenheit (°F).
- **Responsive Layout**: Designed for seamless performance across mobile, tablet, and desktop viewports.

---

## 🚀 Quick Start

No build tools or installation steps are required! Open `index.html` directly in any modern browser, or run a local static server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (npx serve)
npx serve .
```

Then visit `http://localhost:8000` in your web browser.

---

## 🛠️ Technology Stack

- **HTML5 & Vanilla CSS3**: Glassmorphic filters, responsive CSS grid/flexbox, custom design tokens, SVG micro-animations.
- **JavaScript (ES6+)**: Modular architecture with zero build overhead.
- **Open-Meteo API**: High-precision global weather, 7-day forecasts, hourly data, and Air Quality metrics (no API keys or rate limits required).
- **HTML5 Canvas 2D**: Optimized 60 FPS particle simulation engine.
- **Web Audio API**: Synthetic procedural natural audio soundscapes.
- **Google Fonts**: [*Outfit*](https://fonts.google.com/specimen/Outfit) & [*Plus Jakarta Sans*](https://fonts.google.com/specimen/Plus+Jakarta+Sans).
- **FontAwesome 6**: Modern iconography.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
