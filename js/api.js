/**
 * Weather API & Geocoding Service Layer
 * Uses Open-Meteo free APIs (high precision, global coverage, no rate limit keys needed)
 */

const WeatherAPI = {
    // WMO Weather interpretation codes (WW)
    weatherCodes: {
        0: { description: 'Clear sky', iconKey: 'clear', theme: 'clear' },
        1: { description: 'Mainly clear', iconKey: 'clear', theme: 'clear' },
        2: { description: 'Partly cloudy', iconKey: 'partly-cloudy', theme: 'clouds' },
        3: { description: 'Overcast', iconKey: 'cloud', theme: 'clouds' },
        45: { description: 'Fog', iconKey: 'fog', theme: 'fog' },
        48: { description: 'Depositing rime fog', iconKey: 'fog', theme: 'fog' },
        51: { description: 'Light drizzle', iconKey: 'drizzle', theme: 'rain' },
        53: { description: 'Moderate drizzle', iconKey: 'drizzle', theme: 'rain' },
        55: { description: 'Dense drizzle', iconKey: 'drizzle', theme: 'rain' },
        56: { description: 'Light freezing drizzle', iconKey: 'rain', theme: 'rain' },
        57: { description: 'Dense freezing drizzle', iconKey: 'rain', theme: 'rain' },
        61: { description: 'Slight rain', iconKey: 'rain', theme: 'rain' },
        62: { description: 'Moderate rain', iconKey: 'rain', theme: 'rain' },
        63: { description: 'Moderate rain', iconKey: 'rain', theme: 'rain' },
        65: { description: 'Heavy rain', iconKey: 'rain', theme: 'rain' },
        66: { description: 'Light freezing rain', iconKey: 'rain', theme: 'rain' },
        67: { description: 'Heavy freezing rain', iconKey: 'rain', theme: 'rain' },
        71: { description: 'Slight snow fall', iconKey: 'snow', theme: 'snow' },
        73: { description: 'Moderate snow fall', iconKey: 'snow', theme: 'snow' },
        75: { description: 'Heavy snow fall', iconKey: 'snow', theme: 'snow' },
        77: { description: 'Snow grains', iconKey: 'snow', theme: 'snow' },
        80: { description: 'Slight rain showers', iconKey: 'rain', theme: 'rain' },
        81: { description: 'Moderate rain showers', iconKey: 'rain', theme: 'rain' },
        82: { description: 'Violent rain showers', iconKey: 'rain', theme: 'rain' },
        85: { description: 'Slight snow showers', iconKey: 'snow', theme: 'snow' },
        86: { description: 'Heavy snow showers', iconKey: 'snow', theme: 'snow' },
        95: { description: 'Thunderstorm', iconKey: 'thunderstorm', theme: 'storm' },
        96: { description: 'Thunderstorm with slight hail', iconKey: 'thunderstorm', theme: 'storm' },
        99: { description: 'Thunderstorm with heavy hail', iconKey: 'thunderstorm', theme: 'storm' }
    },

    getWeatherInfo(code) {
        return this.weatherCodes[code] || {
            description: 'Partly Cloudy',
            iconKey: 'partly-cloudy',
            theme: 'clouds'
        };
    },

    // Convert Celsius to Fahrenheit
    cToF(celsius) {
        return Math.round((celsius * 9) / 5 + 32);
    },

    // Format temperature based on current unit
    formatTemp(celsius, unit = 'C') {
        if (celsius === null || celsius === undefined || isNaN(celsius)) return '--';
        const val = unit === 'F' ? this.cToF(celsius) : Math.round(celsius);
        return `${val}°`;
    },

    // Degrees to Compass Cardinal Direction
    degToCompass(deg) {
        const val = Math.floor((deg / 22.5) + 0.5);
        const arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
        return arr[(val % 16)];
    },

    // US AQI qualitative breakdown
    getAQIStatus(aqi) {
        if (aqi <= 50) return { label: 'Good', color: '#10B981', desc: 'Air quality is satisfactory with little or no risk.' };
        if (aqi <= 100) return { label: 'Moderate', color: '#FBBF24', desc: 'Acceptable quality, but sensitive people may be affected.' };
        if (aqi <= 150) return { label: 'Unhealthy for Sensitive Groups', color: '#F97316', desc: 'Members of sensitive groups may experience health effects.' };
        if (aqi <= 200) return { label: 'Unhealthy', color: '#EF4444', desc: 'Everyone may begin to experience health effects.' };
        if (aqi <= 300) return { label: 'Very Unhealthy', color: '#8B5CF6', desc: 'Health alert: risk of more serious health effects.' };
        return { label: 'Hazardous', color: '#7E22CE', desc: 'Emergency health warning: serious impact likely.' };
    },

    // UV Index qualitative breakdown
    getUVStatus(uv) {
        const val = Math.round(uv);
        if (val <= 2) return { label: 'Low', color: '#10B981', advice: 'No protection required. Safe to enjoy outdoors.' };
        if (val <= 5) return { label: 'Moderate', color: '#FBBF24', advice: 'Wear sunglasses & use sunscreen on bright days.' };
        if (val <= 7) return { label: 'High', color: '#F97316', advice: 'Wear hat, sunglasses, SPF 30+ sunscreen, seek shade.' };
        if (val <= 10) return { label: 'Very High', color: '#EF4444', advice: 'Extra protection needed. Avoid sun around midday.' };
        return { label: 'Extreme', color: '#9333EA', advice: 'Take all precautions. Avoid direct sun exposure.' };
    },

    // Search cities / locations with autocomplete
    async searchCities(query) {
        if (!query || query.trim().length < 2) return [];
        const cleanQuery = query.trim();
        const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cleanQuery)}&count=6&language=en&format=json`;
        
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('Geocoding search failed');
            const data = await res.json();
            return (data.results || []).map(item => ({
                id: `${item.latitude}_${item.longitude}`,
                name: item.name,
                admin1: item.admin1 || '',
                country: item.country || '',
                countryCode: item.country_code || '',
                lat: item.latitude,
                lon: item.longitude,
                timezone: item.timezone || 'auto',
                elevation: item.elevation
            }));
        } catch (err) {
            console.warn('Geocoding search error:', err);
            return [];
        }
    },

    // Reverse Geocoding by Coordinates
    async reverseGeocode(lat, lon) {
        try {
            const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
            if (res.ok) {
                const data = await res.json();
                const city = data.city || data.locality || data.principalSubdivision || 'Current Location';
                const country = data.countryName || '';
                const admin1 = data.principalSubdivision || '';
                return {
                    name: city,
                    admin1: admin1 !== city ? admin1 : '',
                    country: country,
                    lat,
                    lon
                };
            }
        } catch (e) {
            console.warn('Reverse geocode fallback:', e);
        }
        return {
            name: `Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
            country: '',
            lat,
            lon
        };
    },

    // Fetch Full Weather Data (Current, 24h Hourly, 7-Day Daily, Air Quality)
    async fetchWeatherData(lat, lon, timezone = 'auto') {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
            `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m` +
            `&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,precipitation_probability,weather_code,wind_speed_10m,uv_index,visibility` +
            `&daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max` +
            `&timezone=${encodeURIComponent(timezone)}`;

        const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}` +
            `&current=us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone` +
            `&timezone=${encodeURIComponent(timezone)}`;

        try {
            const [weatherRes, aqiRes] = await Promise.all([
                fetch(weatherUrl),
                fetch(aqiUrl).catch(() => null)
            ]);

            if (!weatherRes.ok) {
                throw new Error(`Weather fetch error: ${weatherRes.status}`);
            }

            const weatherData = await weatherRes.json();
            let aqiData = null;
            if (aqiRes && aqiRes.ok) {
                aqiData = await aqiRes.json();
            }

            return this.processWeatherData(weatherData, aqiData);
        } catch (err) {
            console.error('Fetch weather data error:', err);
            throw err;
        }
    },

    // Process and normalize API responses
    processWeatherData(weather, aqi) {
        const current = weather.current || {};
        const hourly = weather.hourly || {};
        const daily = weather.daily || {};
        const currentAqi = aqi && aqi.current ? aqi.current : {};

        const weatherInfo = this.getWeatherInfo(current.weather_code);

        // Process 24-hour forecast from current hour
        const hourlyList = [];
        if (hourly.time && hourly.time.length) {
            const nowIso = current.time || new Date().toISOString();
            let startIdx = hourly.time.findIndex(t => t >= nowIso.slice(0, 13));
            if (startIdx === -1) startIdx = 0;

            const maxHours = Math.min(startIdx + 24, hourly.time.length);
            for (let i = startIdx; i < maxHours; i++) {
                const timeStr = hourly.time[i];
                const dateObj = new Date(timeStr);
                const hourFormatted = dateObj.toLocaleTimeString([], { hour: 'numeric', hour12: true });
                const code = hourly.weather_code[i];
                const info = this.getWeatherInfo(code);

                hourlyList.push({
                    time: timeStr,
                    hourLabel: i === startIdx ? 'Now' : hourFormatted,
                    temp: hourly.temperature_2m[i],
                    humidity: hourly.relative_humidity_2m[i],
                    pop: hourly.precipitation_probability ? hourly.precipitation_probability[i] : 0,
                    weatherCode: code,
                    description: info.description,
                    iconKey: info.iconKey,
                    isDay: (dateObj.getHours() >= 6 && dateObj.getHours() < 20) ? 1 : 0,
                    windSpeed: hourly.wind_speed_10m ? hourly.wind_speed_10m[i] : 0
                });
            }
        }

        // Process 7-Day forecast
        const dailyList = [];
        if (daily.time && daily.time.length) {
            for (let i = 0; i < daily.time.length; i++) {
                const dateStr = daily.time[i];
                const dateObj = new Date(dateStr + 'T00:00:00');
                const isToday = i === 0;
                const dayName = isToday ? 'Today' : dateObj.toLocaleDateString([], { weekday: 'short' });
                const dateFormatted = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
                const code = daily.weather_code[i];
                const info = this.getWeatherInfo(code);

                dailyList.push({
                    date: dateStr,
                    dayName,
                    dateFormatted,
                    maxTemp: daily.temperature_2m_max[i],
                    minTemp: daily.temperature_2m_min[i],
                    weatherCode: code,
                    description: info.description,
                    iconKey: info.iconKey,
                    precipProb: daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : 0,
                    uvMax: daily.uv_index_max ? daily.uv_index_max[i] : 0,
                    sunrise: daily.sunrise ? daily.sunrise[i] : null,
                    sunset: daily.sunset ? daily.sunset[i] : null
                });
            }
        }

        // Current Sun cycle info
        const todaySunrise = daily.sunrise && daily.sunrise[0] ? new Date(daily.sunrise[0]) : null;
        const todaySunset = daily.sunset && daily.sunset[0] ? new Date(daily.sunset[0]) : null;
        const nowTime = new Date();
        let sunProgress = 0;
        if (todaySunrise && todaySunset) {
            const totalDaylight = todaySunset - todaySunrise;
            const elapsed = nowTime - todaySunrise;
            sunProgress = Math.max(0, Math.min(100, Math.round((elapsed / totalDaylight) * 100)));
        }

        return {
            current: {
                temp: current.temperature_2m,
                feelsLike: current.apparent_temperature,
                humidity: current.relative_humidity_2m,
                isDay: current.is_day,
                weatherCode: current.weather_code,
                description: weatherInfo.description,
                iconKey: weatherInfo.iconKey,
                theme: weatherInfo.theme,
                windSpeed: current.wind_speed_10m,
                windDirection: current.wind_direction_10m,
                windCompass: this.degToCompass(current.wind_direction_10m),
                windGusts: current.wind_gusts_10m,
                pressure: current.surface_pressure || current.pressure_msl,
                cloudCover: current.cloud_cover,
                precipitation: current.precipitation,
                uvIndex: daily.uv_index_max ? daily.uv_index_max[0] : 0,
                visibility: (hourly.visibility && hourly.visibility[0]) ? Math.round(hourly.visibility[0] / 1000) : 10,
                dewPoint: (hourly.dew_point_2m && hourly.dew_point_2m[0]) ? Math.round(hourly.dew_point_2m[0]) : null,
                sunrise: todaySunrise,
                sunset: todaySunset,
                sunProgress
            },
            hourly: hourlyList,
            daily: dailyList,
            aqi: {
                usAqi: currentAqi.us_aqi ?? 28,
                pm2_5: currentAqi.pm2_5 ?? 6.4,
                pm10: currentAqi.pm10 ?? 12.1,
                ozone: currentAqi.ozone ?? 45,
                no2: currentAqi.nitrogen_dioxide ?? 15,
                so2: currentAqi.sulphur_dioxide ?? 2
            },
            elevation: weather.elevation,
            timezone: weather.timezone
        };
    }
};

window.WeatherAPI = WeatherAPI;
