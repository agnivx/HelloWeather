/**
 * HelloWeather — Application Controller & UI Orchestrator
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- Application State ---
    const state = {
        city: {
            name: 'Athens',
            admin1: 'Attica',
            country: 'Greece',
            countryCode: 'GR',
            lat: 37.9838,
            lon: 23.7275,
            timezone: 'Europe/Athens'
        },
        data: null,
        unit: localStorage.getItem('helloweather_unit') || 'C',
        favorites: JSON.parse(localStorage.getItem('helloweather_favs') || '[]'),
        audioActive: false,
        activeSearchIndex: -1,
        searchResults: []
    };

    // --- DOM Elements ---
    const searchInput = document.getElementById('city-search-input');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const autocompleteDropdown = document.getElementById('autocomplete-dropdown');
    const locateBtn = document.getElementById('locate-btn');
    const audioToggle = document.getElementById('audio-toggle');
    const soundBadge = document.getElementById('sound-badge');
    const unitToggle = document.getElementById('unit-toggle');
    const favoritesBar = document.getElementById('favorites-bar');
    const bookmarkBtn = document.getElementById('bookmark-btn');
    const brandLogo = document.getElementById('brand-logo');

    // Weather Display Elements
    const cityNameEl = document.getElementById('city-name');
    const countryTagEl = document.getElementById('country-tag');
    const currentDateTimeEl = document.getElementById('current-date-time');
    const currentTempEl = document.getElementById('current-temp');
    const feelsLikeTempEl = document.getElementById('feels-like-temp');
    const highTempEl = document.getElementById('high-temp');
    const lowTempEl = document.getElementById('low-temp');
    const heroWindEl = document.getElementById('hero-wind');
    const heroWeatherIconEl = document.getElementById('hero-weather-icon');
    const conditionBadgeEl = document.getElementById('condition-badge');
    const conditionBadgeDesktopEl = document.getElementById('condition-badge-desktop');

    // Forecast Containers
    const hourlyCarouselEl = document.getElementById('hourly-carousel');
    const dailyListEl = document.getElementById('daily-list');

    // Highlights Elements
    const aqiValEl = document.getElementById('aqi-val');
    const aqiPillEl = document.getElementById('aqi-pill');
    const aqiDescEl = document.getElementById('aqi-desc');
    const pm25El = document.getElementById('pollutant-pm25');
    const pm10El = document.getElementById('pollutant-pm10');
    const o3El = document.getElementById('pollutant-o3');

    const uvValEl = document.getElementById('uv-val');
    const uvPointerEl = document.getElementById('uv-pointer');
    const uvAdviceEl = document.getElementById('uv-advice');

    const windSpeedValEl = document.getElementById('wind-speed-val');
    const windDirValEl = document.getElementById('wind-dir-val');
    const windGustValEl = document.getElementById('wind-gust-val');
    const compassNeedleEl = document.getElementById('compass-needle');

    const sunArcOrbEl = document.getElementById('sun-arc-orb');
    const sunriseTimeEl = document.getElementById('sunrise-time');
    const sunsetTimeEl = document.getElementById('sunset-time');

    const humidityValEl = document.getElementById('humidity-val');
    const dewpointValEl = document.getElementById('dewpoint-val');
    const visibilityValEl = document.getElementById('visibility-val');
    const pressureValEl = document.getElementById('pressure-val');

    // --- Subsystem Instances ---
    const canvasEffect = new WeatherCanvasEffect('weather-canvas');
    const audioSynth = new WeatherAudioSynthesizer();

    // --- Initial Startup ---
    initApp();

    function initApp() {
        setupEventListeners();
        syncUnitButtons();
        renderFavorites();

        // Restore last city if available
        const savedCity = localStorage.getItem('helloweather_last_city');
        if (savedCity) {
            try {
                state.city = JSON.parse(savedCity);
            } catch (e) {}
        }

        loadWeatherData();
    }

    // --- Data Loading & UI Update ---
    async function loadWeatherData() {
        try {
            cityNameEl.textContent = 'Updating...';
            const weatherData = await WeatherAPI.fetchWeatherData(
                state.city.lat,
                state.city.lon,
                state.city.timezone
            );

            state.data = weatherData;
            localStorage.setItem('helloweather_last_city', JSON.stringify(state.city));
            
            updateTheme(weatherData.current.theme, weatherData.current.isDay);

            // Auto-update audio soundscape if weather changed
            audioSynth.setWeatherCondition(weatherData.current.theme, weatherData.current.isDay);
            updateSoundBadgeUI();

            renderCurrentWeather();
            renderHourlyForecast();
            renderDailyForecast();
            renderHighlights();
            updateBookmarkButtonState();
        } catch (err) {
            console.error('Failed to load weather:', err);
            showToast('Unable to load weather data. Please try again.', 'error');
            cityNameEl.textContent = state.city.name || 'Unknown Location';
        }
    }

    function updateTheme(theme, isDay) {
        document.body.className = '';
        let themeClass = 'theme-clear-day';

        if (theme === 'rain' || theme === 'drizzle') {
            themeClass = 'theme-rain';
        } else if (theme === 'storm') {
            themeClass = 'theme-storm';
        } else if (theme === 'snow') {
            themeClass = 'theme-snow';
        } else if (theme === 'clouds') {
            themeClass = 'theme-clouds';
        } else if (theme === 'fog') {
            themeClass = 'theme-fog';
        } else {
            themeClass = isDay ? 'theme-clear-day' : 'theme-clear-night';
        }

        document.body.classList.add(themeClass);
        canvasEffect.setWeather(theme, isDay);
    }

    // --- Render Hero Current Weather ---
    function renderCurrentWeather() {
        if (!state.data) return;
        const cur = state.data.current;
        const todayDaily = state.data.daily[0] || {};

        cityNameEl.textContent = state.city.name;
        countryTagEl.textContent = state.city.countryCode || state.city.country || 'Global';

        // Local time calculation
        const dateOptions = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        currentDateTimeEl.textContent = new Date().toLocaleDateString([], dateOptions);

        currentTempEl.innerHTML = `${WeatherAPI.formatTemp(cur.temp, state.unit)}`;
        feelsLikeTempEl.textContent = WeatherAPI.formatTemp(cur.feelsLike, state.unit);
        highTempEl.textContent = WeatherAPI.formatTemp(todayDaily.maxTemp, state.unit);
        lowTempEl.textContent = WeatherAPI.formatTemp(todayDaily.minTemp, state.unit);

        const windSpeedFormatted = state.unit === 'F' 
            ? `${Math.round(cur.windSpeed * 0.621371)} mph` 
            : `${Math.round(cur.windSpeed)} km/h`;
        heroWindEl.textContent = windSpeedFormatted;

        if (conditionBadgeEl) conditionBadgeEl.textContent = cur.description;
        if (conditionBadgeDesktopEl) conditionBadgeDesktopEl.textContent = cur.description;
        
        heroWeatherIconEl.innerHTML = WeatherIcons.getIcon(cur.iconKey, cur.isDay, 'weather-svg-icon');
    }

    // --- Render 24-Hour Hourly Forecast ---
    function renderHourlyForecast() {
        if (!state.data || !state.data.hourly) return;
        hourlyCarouselEl.innerHTML = '';

        state.data.hourly.forEach((hour, idx) => {
            const card = document.createElement('div');
            card.className = `hourly-card ${idx === 0 ? 'active' : ''}`;

            const iconSvg = WeatherIcons.getIcon(hour.iconKey, hour.isDay, 'hourly-icon');
            const tempStr = WeatherAPI.formatTemp(hour.temp, state.unit);

            card.innerHTML = `
                <span class="hourly-time">${hour.hourLabel}</span>
                <div class="hourly-icon-wrap">${iconSvg}</div>
                <span class="hourly-temp">${tempStr}</span>
                <div class="hourly-pop">
                    <i class="fa-solid fa-droplet" style="font-size: 9px;"></i>
                    <span>${hour.pop}%</span>
                </div>
            `;
            hourlyCarouselEl.appendChild(card);
        });
    }

    // --- Render 7-Day Extended Forecast ---
    function renderDailyForecast() {
        if (!state.data || !state.data.daily) return;
        dailyListEl.innerHTML = '';

        // Find min/max across whole week for proportional range bar
        let globalMin = 999;
        let globalMax = -999;
        state.data.daily.forEach(d => {
            if (d.minTemp < globalMin) globalMin = d.minTemp;
            if (d.maxTemp > globalMax) globalMax = d.maxTemp;
        });
        const totalSpan = Math.max(1, globalMax - globalMin);

        state.data.daily.forEach(day => {
            const row = document.createElement('div');
            row.className = 'daily-row';

            const iconSvg = WeatherIcons.getIcon(day.iconKey, 1, 'daily-icon-box');
            const minTempStr = WeatherAPI.formatTemp(day.minTemp, state.unit);
            const maxTempStr = WeatherAPI.formatTemp(day.maxTemp, state.unit);

            // Calculate range bar offset & width
            const leftPercent = Math.max(0, Math.min(100, Math.round(((day.minTemp - globalMin) / totalSpan) * 100)));
            const widthPercent = Math.max(10, Math.min(100 - leftPercent, Math.round(((day.maxTemp - day.minTemp) / totalSpan) * 100)));

            row.innerHTML = `
                <div class="daily-day-info">
                    <span class="daily-day-name">${day.dayName}</span>
                    <span class="daily-date">${day.dateFormatted}</span>
                </div>
                <div class="daily-icon-box">${iconSvg}</div>
                <div class="daily-condition-text">${day.description}</div>
                <div class="temp-range-bar-container">
                    <span class="daily-temp-min">${minTempStr}</span>
                    <div class="range-bar-track">
                        <div class="range-bar-fill" style="left: ${leftPercent}%; width: ${widthPercent}%;"></div>
                    </div>
                    <span class="daily-temp-max">${maxTempStr}</span>
                </div>
            `;
            dailyListEl.appendChild(row);
        });
    }

    // --- Render Weather Highlights & Insights ---
    function renderHighlights() {
        if (!state.data) return;
        const cur = state.data.current;
        const aqi = state.data.aqi;

        // AQI
        const aqiInfo = WeatherAPI.getAQIStatus(aqi.usAqi);
        aqiValEl.textContent = aqi.usAqi;
        aqiPillEl.textContent = aqiInfo.label;
        aqiPillEl.style.backgroundColor = `${aqiInfo.color}22`;
        aqiPillEl.style.color = aqiInfo.color;
        aqiPillEl.style.border = `1px solid ${aqiInfo.color}44`;
        aqiDescEl.textContent = aqiInfo.desc;
        pm25El.textContent = `${aqi.pm2_5} µg/m³`;
        pm10El.textContent = `${aqi.pm10} µg/m³`;
        o3El.textContent = `${aqi.ozone} µg/m³`;

        // UV Index
        const uvInfo = WeatherAPI.getUVStatus(cur.uvIndex);
        uvValEl.textContent = `${Math.round(cur.uvIndex)} — ${uvInfo.label}`;
        const uvPercent = Math.min(100, Math.round((cur.uvIndex / 12) * 100));
        uvPointerEl.style.left = `${uvPercent}%`;
        uvAdviceEl.textContent = uvInfo.advice;

        // Wind & Compass
        const windSpeed = state.unit === 'F' ? `${Math.round(cur.windSpeed * 0.621371)} mph` : `${Math.round(cur.windSpeed)} km/h`;
        const windGust = state.unit === 'F' ? `${Math.round(cur.windGusts * 0.621371)} mph` : `${Math.round(cur.windGusts)} km/h`;
        windSpeedValEl.textContent = windSpeed;
        windDirValEl.textContent = `${cur.windCompass} (${cur.windDirection}°)`;
        windGustValEl.textContent = `Gusts ${windGust}`;
        compassNeedleEl.style.transform = `rotate(${cur.windDirection}deg)`;

        // Sun & Daylight
        if (cur.sunrise && cur.sunset) {
            sunriseTimeEl.textContent = cur.sunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            sunsetTimeEl.textContent = cur.sunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // Sun path arc calculation (parabolic arc)
            const progress = cur.sunProgress / 100;
            const x = 10 + progress * 180;
            const y = 50 - Math.sin(progress * Math.PI) * 38;
            sunArcOrbEl.setAttribute('cx', x);
            sunArcOrbEl.setAttribute('cy', y);
        }

        // Humidity & Dew point
        humidityValEl.textContent = `${cur.humidity}%`;
        dewpointValEl.textContent = cur.dewPoint !== null ? `Dew point: ${WeatherAPI.formatTemp(cur.dewPoint, state.unit)}` : 'Optimal moisture';

        // Visibility & Pressure
        const visFormatted = state.unit === 'F' ? `${Math.round(cur.visibility * 0.621371)} mi` : `${cur.visibility} km`;
        visibilityValEl.textContent = visFormatted;
        pressureValEl.textContent = `${Math.round(cur.pressure)} hPa`;
    }

    // --- Search & Autocomplete Event Logic ---
    let searchDebounceTimer = null;

    function setupEventListeners() {
        // Search Input
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value;
            clearSearchBtn.style.display = query.length > 0 ? 'block' : 'none';

            clearTimeout(searchDebounceTimer);
            if (query.trim().length < 2) {
                hideAutocomplete();
                return;
            }

            searchDebounceTimer = setTimeout(async () => {
                const results = await WeatherAPI.searchCities(query);
                state.searchResults = results;
                renderAutocompleteDropdown(results);
            }, 200);
        });

        // Search Keyboard Navigation
        searchInput.addEventListener('keydown', (e) => {
            const items = autocompleteDropdown.querySelectorAll('.autocomplete-item');
            if (!items.length) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (state.searchResults.length > 0) {
                        selectCity(state.searchResults[0]);
                    }
                }
                return;
            }

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                state.activeSearchIndex = (state.activeSearchIndex + 1) % items.length;
                updateActiveAutocomplete(items);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                state.activeSearchIndex = (state.activeSearchIndex - 1 + items.length) % items.length;
                updateActiveAutocomplete(items);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (state.activeSearchIndex >= 0 && state.activeSearchIndex < state.searchResults.length) {
                    selectCity(state.searchResults[state.activeSearchIndex]);
                } else if (state.searchResults.length > 0) {
                    selectCity(state.searchResults[0]);
                }
            } else if (e.key === 'Escape') {
                hideAutocomplete();
            }
        });

        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            clearSearchBtn.style.display = 'none';
            hideAutocomplete();
            searchInput.focus();
        });

        // Close dropdown on click outside
        document.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !autocompleteDropdown.contains(e.target)) {
                hideAutocomplete();
            }
        });

        // Geolocation Button
        locateBtn.addEventListener('click', () => {
            detectCurrentLocation();
        });

        // Unit Switcher
        unitToggle.addEventListener('click', (e) => {
            const opt = e.target.closest('.unit-option');
            if (!opt) return;
            const newUnit = opt.dataset.unit;
            if (newUnit !== state.unit) {
                state.unit = newUnit;
                localStorage.setItem('helloweather_unit', newUnit);
                syncUnitButtons();
                renderCurrentWeather();
                renderHourlyForecast();
                renderDailyForecast();
                renderHighlights();
            }
        });

        // Audio Toggle Button
        audioToggle.addEventListener('click', () => {
            const currentTheme = state.data?.current?.theme || 'clear';
            const isDay = state.data?.current?.isDay ?? 1;
            state.audioActive = audioSynth.toggle(currentTheme, isDay);
            updateSoundBadgeUI();
            
            if (state.audioActive) {
                const info = audioSynth.getSoundLabel(audioSynth.activeWeatherType);
                showToast(`Sound ON: ${info.label} (auto-syncing with weather)`, 'success');
            } else {
                showToast('Ambient sound muted', 'info');
            }
        });

        // Bookmark Toggle Button
        bookmarkBtn.addEventListener('click', () => {
            toggleFavoriteCity();
        });

        // Brand Logo Click (Reset to Athens)
        brandLogo.addEventListener('click', () => {
            state.city = {
                name: 'Athens',
                admin1: 'Attica',
                country: 'Greece',
                countryCode: 'GR',
                lat: 37.9838,
                lon: 23.7275,
                timezone: 'Europe/Athens'
            };
            searchInput.value = '';
            clearSearchBtn.style.display = 'none';
            hideAutocomplete();
            loadWeatherData();
        });

        // Global hotkey: '/' to focus search
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && document.activeElement !== searchInput) {
                e.preventDefault();
                searchInput.focus();
            }
        });
    }

    function updateSoundBadgeUI() {
        if (!soundBadge) return;
        if (state.audioActive && audioSynth.isPlaying) {
            audioToggle.classList.add('active');
            const info = audioSynth.getSoundLabel(audioSynth.activeWeatherType);
            audioToggle.querySelector('i').className = `fa-solid ${info.icon}`;
            soundBadge.textContent = info.label;
        } else {
            audioToggle.classList.remove('active');
            audioToggle.querySelector('i').className = 'fa-solid fa-volume-xmark';
            soundBadge.textContent = 'Off';
        }
    }

    // --- Autocomplete Rendering ---
    function renderAutocompleteDropdown(results) {
        if (!results.length) {
            autocompleteDropdown.innerHTML = `<div class="autocomplete-item" style="color: var(--text-muted); cursor: default;">No locations found</div>`;
            autocompleteDropdown.style.display = 'block';
            return;
        }

        state.activeSearchIndex = -1;
        autocompleteDropdown.innerHTML = results.map((r, i) => `
            <div class="autocomplete-item" data-index="${i}">
                <div>
                    <div class="autocomplete-city">${r.name}</div>
                    <div class="autocomplete-region">${r.admin1 ? `${r.admin1}, ` : ''}${r.country}</div>
                </div>
                <span class="autocomplete-country">${r.countryCode || 'LOC'}</span>
            </div>
        `).join('');

        autocompleteDropdown.querySelectorAll('.autocomplete-item').forEach(el => {
            el.addEventListener('click', () => {
                const idx = parseInt(el.dataset.index);
                selectCity(results[idx]);
            });
        });

        autocompleteDropdown.style.display = 'block';
    }

    function updateActiveAutocomplete(items) {
        items.forEach((it, i) => {
            if (i === state.activeSearchIndex) {
                it.classList.add('active');
                it.scrollIntoView({ block: 'nearest' });
            } else {
                it.classList.remove('active');
            }
        });
    }

    function hideAutocomplete() {
        autocompleteDropdown.style.display = 'none';
        state.activeSearchIndex = -1;
    }

    function selectCity(cityItem) {
        state.city = cityItem;
        searchInput.value = `${cityItem.name}${cityItem.admin1 ? `, ${cityItem.admin1}` : ''}`;
        hideAutocomplete();
        loadWeatherData();
    }

    // --- Geolocation Detection ---
    function detectCurrentLocation() {
        if (!navigator.geolocation) {
            showToast('Geolocation is not supported by your browser.', 'error');
            return;
        }

        locateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        locateBtn.disabled = true;

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                try {
                    const geo = await WeatherAPI.reverseGeocode(lat, lon);
                    state.city = {
                        name: geo.name,
                        admin1: geo.admin1,
                        country: geo.country,
                        countryCode: '',
                        lat: lat,
                        lon: lon,
                        timezone: 'auto'
                    };
                    searchInput.value = geo.name;
                    await loadWeatherData();
                    showToast(`Detected location: ${geo.name}`, 'success');
                } catch (e) {
                    showToast('Failed to locate city name.', 'error');
                } finally {
                    locateBtn.innerHTML = '<i class="fa-solid fa-crosshairs"></i>';
                    locateBtn.disabled = false;
                }
            },
            (error) => {
                locateBtn.innerHTML = '<i class="fa-solid fa-crosshairs"></i>';
                locateBtn.disabled = false;
                showToast('Location permission denied or unavailable.', 'error');
            },
            { timeout: 8000 }
        );
    }

    // --- Favorites Management ---
    function toggleFavoriteCity() {
        const id = `${state.city.lat.toFixed(3)}_${state.city.lon.toFixed(3)}`;
        const index = state.favorites.findIndex(f => f.id === id);

        if (index > -1) {
            state.favorites.splice(index, 1);
            showToast(`Removed ${state.city.name} from favorites`, 'info');
        } else {
            state.favorites.push({
                id: id,
                name: state.city.name,
                admin1: state.city.admin1 || '',
                country: state.city.country || '',
                countryCode: state.city.countryCode || '',
                lat: state.city.lat,
                lon: state.city.lon,
                timezone: state.city.timezone || 'auto'
            });
            showToast(`Saved ${state.city.name} to favorites`, 'success');
        }

        localStorage.setItem('helloweather_favs', JSON.stringify(state.favorites));
        renderFavorites();
        updateBookmarkButtonState();
    }

    function renderFavorites() {
        favoritesBar.innerHTML = '';
        if (!state.favorites || !state.favorites.length) {
            favoritesBar.style.display = 'none';
            return;
        }

        favoritesBar.style.display = 'flex';
        state.favorites.forEach(fav => {
            const chip = document.createElement('div');
            const isActive = Math.abs(fav.lat - state.city.lat) < 0.05 && Math.abs(fav.lon - state.city.lon) < 0.05;
            chip.className = `fav-chip ${isActive ? 'active' : ''}`;
            chip.innerHTML = `
                <i class="fa-solid fa-location-dot"></i>
                <span>${fav.name}</span>
                <span class="remove-fav" title="Remove">&times;</span>
            `;

            chip.querySelector('span:nth-child(2)').addEventListener('click', () => {
                state.city = fav;
                loadWeatherData();
            });

            chip.querySelector('.remove-fav').addEventListener('click', (e) => {
                e.stopPropagation();
                state.favorites = state.favorites.filter(f => f.id !== fav.id);
                localStorage.setItem('helloweather_favs', JSON.stringify(state.favorites));
                renderFavorites();
                updateBookmarkButtonState();
            });

            favoritesBar.appendChild(chip);
        });
    }

    function updateBookmarkButtonState() {
        const id = `${state.city.lat.toFixed(3)}_${state.city.lon.toFixed(3)}`;
        const isSaved = state.favorites.some(f => f.id === id);
        if (isSaved) {
            bookmarkBtn.classList.add('saved');
            bookmarkBtn.innerHTML = '<i class="fa-solid fa-star"></i>';
        } else {
            bookmarkBtn.classList.remove('saved');
            bookmarkBtn.innerHTML = '<i class="fa-regular fa-star"></i>';
        }
    }

    // --- Unit Switcher Visual Sync ---
    function syncUnitButtons() {
        unitToggle.querySelectorAll('.unit-option').forEach(opt => {
            if (opt.dataset.unit === state.unit) {
                opt.classList.add('active');
            } else {
                opt.classList.remove('active');
            }
        });
    }

    // --- Toast Notifications ---
    function showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = 'toast';
        
        let icon = 'fa-info-circle';
        if (type === 'success') icon = 'fa-circle-check';
        if (type === 'error') icon = 'fa-circle-exclamation';

        toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            setTimeout(() => toast.remove(), 300);
        }, 3200);
    }
});
