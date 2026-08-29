/**
 * SVG Weather Icons & Visual Assets Generator
 * High-definition, beautifully styled modern weather iconography
 */

const WeatherIcons = {
    // Return SVG markup for various weather conditions
    getIcon(condition, isDay = 1, className = "weather-svg-icon") {
        const key = (condition || '').toLowerCase();
        
        if (key.includes('thunder') || key.includes('lightning') || key.includes('storm')) {
            return `
            <svg class="${className}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="cloudGradStorm" x1="16" y1="12" x2="48" y2="44" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#707B8A" />
                        <stop offset="100%" stop-color="#333A44" />
                    </linearGradient>
                    <linearGradient id="boltGrad" x1="28" y1="32" x2="38" y2="60" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#FFE600" />
                        <stop offset="100%" stop-color="#FF9900" />
                    </linearGradient>
                    <filter id="boltGlow" x="15" y="25" width="34" height="40">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>
                <path d="M46 38c5.5 0 10-4.5 10-10 0-5.1-3.8-9.3-8.8-9.9C45.8 11.5 40 6 33 6c-6.2 0-11.4 4.3-12.7 10.1C19.5 16 18.8 16 18 16c-5.5 0-10 4.5-10 10 0 5.2 4 9.5 9.1 9.9L46 38z" fill="url(#cloudGradStorm)"/>
                <path d="M34 26L24 40h9l-4 18 15-20h-9l6-12z" fill="url(#boltGrad)" filter="url(#boltGlow)" class="anim-bolt"/>
            </svg>`;
        }
        
        if (key.includes('snow') || key.includes('blizzard') || key.includes('ice') || key.includes('flurries')) {
            return `
            <svg class="${className}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="snowCloud" x1="16" y1="10" x2="48" y2="40" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#A5C8E8" />
                        <stop offset="100%" stop-color="#6F93B8" />
                    </linearGradient>
                    <filter id="snowGlow">
                        <feGaussianBlur stdDeviation="1" result="blur"/>
                        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                    </filter>
                </defs>
                <path d="M46 34c5.5 0 10-4.5 10-10 0-5.1-3.8-9.3-8.8-9.9C45.8 7.5 40 2 33 2c-6.2 0-11.4 4.3-12.7 10.1C19.5 12 18.8 12 18 12c-5.5 0-10 4.5-10 10 0 5.2 4 9.5 9.1 9.9L46 34z" fill="url(#snowCloud)"/>
                <!-- Snowflakes -->
                <g filter="url(#snowGlow)" fill="#E0F2FE">
                    <circle cx="22" cy="44" r="2.5" class="anim-snow-1"/>
                    <circle cx="32" cy="48" r="3" class="anim-snow-2"/>
                    <circle cx="42" cy="43" r="2" class="anim-snow-3"/>
                    <circle cx="26" cy="56" r="2.5" class="anim-snow-2"/>
                    <circle cx="38" cy="57" r="2.5" class="anim-snow-1"/>
                </g>
            </svg>`;
        }

        if (key.includes('rain') || key.includes('drizzle') || key.includes('shower')) {
            return `
            <svg class="${className}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="rainCloud" x1="16" y1="10" x2="48" y2="40" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#8EABCE" />
                        <stop offset="100%" stop-color="#4B6E94" />
                    </linearGradient>
                    <linearGradient id="raindrop" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#60A5FA" />
                        <stop offset="100%" stop-color="#38BDF8" />
                    </linearGradient>
                </defs>
                <path d="M46 34c5.5 0 10-4.5 10-10 0-5.1-3.8-9.3-8.8-9.9C45.8 7.5 40 2 33 2c-6.2 0-11.4 4.3-12.7 10.1C19.5 12 18.8 12 18 12c-5.5 0-10 4.5-10 10 0 5.2 4 9.5 9.1 9.9L46 34z" fill="url(#rainCloud)"/>
                <!-- Raindrops -->
                <line x1="20" y1="42" x2="16" y2="52" stroke="url(#raindrop)" stroke-width="2.5" stroke-linecap="round" class="anim-rain-1"/>
                <line x1="32" y1="42" x2="28" y2="54" stroke="url(#raindrop)" stroke-width="2.5" stroke-linecap="round" class="anim-rain-2"/>
                <line x1="44" y1="42" x2="40" y2="52" stroke="url(#raindrop)" stroke-width="2.5" stroke-linecap="round" class="anim-rain-3"/>
            </svg>`;
        }

        if (key.includes('fog') || key.includes('mist') || key.includes('haze')) {
            return `
            <svg class="${className}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="fogGrad" x1="10" y1="0" x2="54" y2="0" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#CBD5E1" stop-opacity="0.2"/>
                        <stop offset="50%" stop-color="#E2E8F0" stop-opacity="0.9"/>
                        <stop offset="100%" stop-color="#CBD5E1" stop-opacity="0.2"/>
                    </linearGradient>
                </defs>
                <path d="M42 26c4.4 0 8-3.6 8-8 0-4.1-3-7.4-7-7.9C41.8 4.4 37.2 0 31.6 0 26.6 0 22.4 3.4 21.4 8.1 20.9 8 20.5 8 20 8c-4.4 0-8 3.6-8 8 0 4.2 3.2 7.6 7.3 7.9L42 26z" fill="#94A3B8" opacity="0.6"/>
                <line x1="12" y1="36" x2="52" y2="36" stroke="url(#fogGrad)" stroke-width="3" stroke-linecap="round" class="anim-fog-1"/>
                <line x1="16" y1="44" x2="48" y2="44" stroke="url(#fogGrad)" stroke-width="3" stroke-linecap="round" class="anim-fog-2"/>
                <line x1="20" y1="52" x2="44" y2="52" stroke="url(#fogGrad)" stroke-width="3" stroke-linecap="round" class="anim-fog-3"/>
            </svg>`;
        }

        if (key.includes('cloud') || key.includes('overcast')) {
            if (key.includes('partly') || key.includes('scattered') || key.includes('few')) {
                // Partly cloudy (Sun / Moon + Cloud)
                if (isDay) {
                    return `
                    <svg class="${className}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <radialGradient id="sunGradPartly" cx="30%" cy="30%" r="70%">
                                <stop offset="0%" stop-color="#FFF066" />
                                <stop offset="100%" stop-color="#F59E0B" />
                            </radialGradient>
                            <linearGradient id="cloudGradPartly" x1="20" y1="20" x2="56" y2="52" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#FFFFFF" />
                                <stop offset="100%" stop-color="#CBD5E1" />
                            </linearGradient>
                            <filter id="cloudShadow" x="10" y="16" width="52" height="42" filterUnits="userSpaceOnUse">
                                <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#000000" flood-opacity="0.2"/>
                            </filter>
                        </defs>
                        <!-- Sun -->
                        <circle cx="26" cy="24" r="14" fill="url(#sunGradPartly)" class="anim-sun-spin"/>
                        <!-- Sun Rays -->
                        <g stroke="#FBBF24" stroke-width="2" stroke-linecap="round" opacity="0.8">
                            <line x1="26" y1="4" x2="26" y2="8" />
                            <line x1="12" y1="10" x2="15" y2="13" />
                            <line x1="6" y1="24" x2="10" y2="24" />
                            <line x1="12" y1="38" x2="15" y2="35" />
                        </g>
                        <!-- Cloud -->
                        <g filter="url(#cloudShadow)">
                            <path d="M48 48c4.4 0 8-3.6 8-8 0-4.1-3-7.4-7-7.9C47.8 26.4 43.2 22 37.6 22c-5 0-9.2 3.4-10.2 8.1-.5-.1-.9-.1-1.4-.1-4.4 0-8 3.6-8 8 0 4.2 3.2 7.6 7.3 7.9L48 48z" fill="url(#cloudGradPartly)"/>
                        </g>
                    </svg>`;
                } else {
                    // Moon + Cloud
                    return `
                    <svg class="${className}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="moonGrad" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stop-color="#FDF4DC" />
                                <stop offset="100%" stop-color="#D4AF37" />
                            </linearGradient>
                            <linearGradient id="nightCloud" x1="20" y1="20" x2="56" y2="52" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stop-color="#94A3B8" />
                                <stop offset="100%" stop-color="#475569" />
                            </linearGradient>
                        </defs>
                        <!-- Moon -->
                        <path d="M26 8c-1.2 0-2.3.2-3.4.5 4.9 3.2 8.1 8.7 8.1 14.9 0 7.8-5.1 14.4-12.2 16.6 2.3 1.3 4.9 2 7.5 2 8.8 0 16-7.2 16-16S34.8 8 26 8z" fill="url(#moonGrad)" />
                        <!-- Cloud -->
                        <path d="M48 50c4.4 0 8-3.6 8-8 0-4.1-3-7.4-7-7.9C47.8 28.4 43.2 24 37.6 24c-5 0-9.2 3.4-10.2 8.1-.5-.1-.9-.1-1.4-.1-4.4 0-8 3.6-8 8 0 4.2 3.2 7.6 7.3 7.9L48 50z" fill="url(#nightCloud)"/>
                    </svg>`;
                }
            }
            
            // Full overcast cloud
            return `
            <svg class="${className}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="cloudMain" x1="16" y1="12" x2="52" y2="48" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#FFFFFF" />
                        <stop offset="100%" stop-color="#94A3B8" />
                    </linearGradient>
                    <filter id="cloudDepth" x="4" y="8" width="56" height="48">
                        <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#1E293B" flood-opacity="0.25"/>
                    </filter>
                </defs>
                <g filter="url(#cloudDepth)">
                    <path d="M47 44c5 0 9-4 9-9 0-4.6-3.4-8.4-7.9-8.9C46.8 19.8 41.5 15 35 15c-5.7 0-10.4 3.9-11.6 9.2-.5-.1-1-.2-1.4-.2-5 0-9 4-9 9 0 4.7 3.6 8.6 8.2 9L47 44z" fill="url(#cloudMain)"/>
                </g>
            </svg>`;
        }

        // Clear Sky
        if (isDay) {
            return `
            <svg class="${className}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <radialGradient id="sunCore" cx="40%" cy="40%" r="60%">
                        <stop offset="0%" stop-color="#FFFBEB" />
                        <stop offset="50%" stop-color="#FBBF24" />
                        <stop offset="100%" stop-color="#D97706" />
                    </radialGradient>
                    <filter id="sunGlow" x="0" y="0" width="64" height="64">
                        <feGaussianBlur stdDeviation="3" result="blur"/>
                        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                    </filter>
                </defs>
                <g filter="url(#sunGlow)">
                    <!-- Sun rays -->
                    <g stroke="#F59E0B" stroke-width="2.5" stroke-linecap="round" class="anim-sun-spin">
                        <line x1="32" y1="6" x2="32" y2="12" />
                        <line x1="32" y1="52" x2="32" y2="58" />
                        <line x1="6" y1="32" x2="12" y2="32" />
                        <line x1="52" y1="32" x2="58" y2="32" />
                        <line x1="13.6" y1="13.6" x2="17.8" y2="17.8" />
                        <line x1="46.2" y1="46.2" x2="50.4" y2="50.4" />
                        <line x1="13.6" y1="50.4" x2="17.8" y2="46.2" />
                        <line x1="46.2" y1="17.8" x2="50.4" y2="13.6" />
                    </g>
                    <!-- Sun center -->
                    <circle cx="32" cy="32" r="14" fill="url(#sunCore)" />
                </g>
            </svg>`;
        } else {
            // Clear Night Moon
            return `
            <svg class="${className}" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="moonCore" x1="14" y1="14" x2="50" y2="50" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stop-color="#FFFBEB" />
                        <stop offset="50%" stop-color="#E2E8F0" />
                        <stop offset="100%" stop-color="#94A3B8" />
                    </linearGradient>
                    <filter id="moonGlow">
                        <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#93C5FD" flood-opacity="0.4"/>
                    </filter>
                </defs>
                <path filter="url(#moonGlow)" d="M38 10C24.7 10 14 20.7 14 34s10.7 24 24 24c8.4 0 15.8-4.3 20.1-10.9-10.4 1.5-20.2-6.5-20.2-17.1 0-7.3 4.7-13.6 11.5-16C45.7 11.4 42 10 38 10z" fill="url(#moonCore)" />
                <!-- Stars -->
                <circle cx="48" cy="14" r="1.5" fill="#FEF08A" class="anim-star-1"/>
                <circle cx="16" cy="18" r="1" fill="#FEF08A" class="anim-star-2"/>
                <circle cx="52" cy="46" r="1.2" fill="#FEF08A" class="anim-star-3"/>
            </svg>`;
        }
    }
};

window.WeatherIcons = WeatherIcons;
