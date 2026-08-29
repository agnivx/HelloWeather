/**
 * Procedural Multi-Sound Weather Audio Synthesizer (Web Audio API)
 * Generates realistic, soothing, procedural soundscapes matching real-time weather conditions:
 * - Rain & Patter
 * - Thunderstorm & Distant Lightning Rumbles
 * - Cold Winter Blizzard Wind
 * - Clear Sunny Day & Songbirds
 * - Serene Night & Crickets
 * - Gentle Breeze & Foggy Atmosphere
 * Zero external audio files required — 100% native synthesis
 */

class WeatherAudioSynthesizer {
    constructor() {
        this.ctx = null;
        this.isPlaying = false;
        this.currentMode = 'auto'; // 'auto' or specific preset
        this.activeWeatherType = 'clear-day';
        this.masterGain = null;
        
        // Active audio generator nodes
        this.generators = [];
        this.activeTimers = [];
    }

    initContext() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(0.0001, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Helper: Pink / Brown noise buffer for natural fluid sound
    createNoiseBuffer(type = 'pink') {
        if (!this.ctx) return null;
        const bufferSize = this.ctx.sampleRate * 4; // 4s seamless loop
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        let lastOut = 0.0;

        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            if (type === 'brown') {
                lastOut = (lastOut + (0.02 * white)) / 1.02;
                data[i] = lastOut * 3.5;
            } else {
                // Pink Noise (Paul Kellet's filtered method)
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.07;
                b6 = white * 0.115926;
            }
        }
        return buffer;
    }

    // Map weather code/theme to sound preset
    getWeatherSoundType(theme, isDay = true) {
        if (theme === 'rain' || theme === 'drizzle') return 'rain';
        if (theme === 'storm') return 'storm';
        if (theme === 'snow') return 'snow';
        if (theme === 'fog' || theme === 'clouds') return 'wind';
        return isDay ? 'birds' : 'crickets';
    }

    getSoundLabel(type) {
        switch (type) {
            case 'rain': return { label: 'Rain Patter', icon: 'fa-cloud-rain' };
            case 'storm': return { label: 'Thunderstorm', icon: 'fa-cloud-bolt' };
            case 'snow': return { label: 'Blizzard Wind', icon: 'fa-snowflake' };
            case 'birds': return { label: 'Sunny Birds', icon: 'fa-dove' };
            case 'crickets': return { label: 'Night Crickets', icon: 'fa-moon' };
            case 'wind': return { label: 'Gentle Breeze', icon: 'fa-wind' };
            default: return { label: 'Ambient Weather', icon: 'fa-volume-high' };
        }
    }

    // Automatically called whenever the city or weather changes
    setWeatherCondition(theme, isDay = true) {
        const soundType = this.getWeatherSoundType(theme, isDay);
        this.activeWeatherType = soundType;

        if (this.isPlaying && this.currentMode === 'auto') {
            this.crossfadeTo(soundType);
        }
    }

    // Crossfade smoothly between soundscapes
    crossfadeTo(newType) {
        if (!this.ctx || !this.isPlaying) return;
        
        // Quick duck
        const now = this.ctx.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
        this.masterGain.gain.linearRampToValueAtTime(0.01, now + 0.6);

        setTimeout(() => {
            if (!this.isPlaying) return;
            this.clearAllGenerators();
            this.buildSoundscape(newType);
            
            const fadeInTime = this.ctx.currentTime;
            this.masterGain.gain.cancelScheduledValues(fadeInTime);
            this.masterGain.gain.setValueAtTime(0.01, fadeInTime);
            this.masterGain.gain.exponentialRampToValueAtTime(0.2, fadeInTime + 1.2);
        }, 650);
    }

    // Start playing sound
    start(preset = 'auto') {
        this.initContext();
        this.stop(false);

        this.currentMode = preset;
        const soundType = preset === 'auto' ? this.activeWeatherType : preset;

        this.clearAllGenerators();
        this.buildSoundscape(soundType);

        // Smooth fade-in
        const now = this.ctx.currentTime;
        this.masterGain.gain.cancelScheduledValues(now);
        this.masterGain.gain.setValueAtTime(0.001, now);
        this.masterGain.gain.exponentialRampToValueAtTime(0.2, now + 1.5);
        this.isPlaying = true;
    }

    // Stop playing sound
    stop(fade = true) {
        if (!this.ctx) return;
        this.isPlaying = false;

        this.activeTimers.forEach(t => clearTimeout(t));
        this.activeTimers = [];

        if (fade && this.masterGain) {
            const now = this.ctx.currentTime;
            this.masterGain.gain.cancelScheduledValues(now);
            this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
            this.masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

            setTimeout(() => {
                this.clearAllGenerators();
            }, 650);
        } else {
            this.clearAllGenerators();
        }
    }

    clearAllGenerators() {
        this.activeTimers.forEach(t => clearTimeout(t));
        this.activeTimers = [];

        this.generators.forEach(node => {
            try {
                if (node.stop) node.stop();
                node.disconnect();
            } catch (e) {}
        });
        this.generators = [];
    }

    // Build specific soundscapes
    buildSoundscape(type) {
        if (!this.ctx) return;

        switch (type) {
            case 'rain':
                this.buildRainSoundscape();
                break;
            case 'storm':
                this.buildStormSoundscape();
                break;
            case 'snow':
                this.buildSnowSoundscape();
                break;
            case 'birds':
                this.buildBirdsSoundscape();
                break;
            case 'crickets':
                this.buildCricketsSoundscape();
                break;
            case 'wind':
            default:
                this.buildWindSoundscape();
                break;
        }
    }

    // 1. Rain Soundscape: Lowpass pink noise + randomized droplet clicks
    buildRainSoundscape() {
        const noiseBuf = this.createNoiseBuffer('pink');
        const noiseSrc = this.ctx.createBufferSource();
        noiseSrc.buffer = noiseBuf;
        noiseSrc.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
        filter.Q.setValueAtTime(1.0, this.ctx.currentTime);

        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.setValueAtTime(0.3, this.ctx.currentTime);
        lfoGain.gain.setValueAtTime(200, this.ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        noiseSrc.connect(filter);
        filter.connect(this.masterGain);

        noiseSrc.start(0);
        lfo.start(0);
        this.generators.push(noiseSrc, filter, lfo, lfoGain);

        // Procedural individual droplet clicks
        const spawnDroplet = () => {
            if (!this.isPlaying) return;
            try {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const now = this.ctx.currentTime;
                const freq = 1200 + Math.random() * 800;

                osc.frequency.setValueAtTime(freq, now);
                osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

                gain.gain.setValueAtTime(0.04 + Math.random() * 0.04, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

                osc.connect(gain);
                gain.connect(this.masterGain);
                osc.start(now);
                osc.stop(now + 0.06);
            } catch (e) {}

            const nextTime = Math.random() * 150 + 50;
            const timer = setTimeout(spawnDroplet, nextTime);
            this.activeTimers.push(timer);
        };
        spawnDroplet();
    }

    // 2. Storm Soundscape: Heavy rain + periodic thunder rumbles + howling wind
    buildStormSoundscape() {
        // Heavy rain base
        const noiseBuf = this.createNoiseBuffer('pink');
        const noiseSrc = this.ctx.createBufferSource();
        noiseSrc.buffer = noiseBuf;
        noiseSrc.loop = true;

        const rainFilter = this.ctx.createBiquadFilter();
        rainFilter.type = 'lowpass';
        rainFilter.frequency.setValueAtTime(1400, this.ctx.currentTime);

        noiseSrc.connect(rainFilter);
        rainFilter.connect(this.masterGain);
        noiseSrc.start(0);
        this.generators.push(noiseSrc, rainFilter);

        // Thunder generator
        const playThunder = () => {
            if (!this.isPlaying) return;
            try {
                const brownBuf = this.createNoiseBuffer('brown');
                const tSrc = this.ctx.createBufferSource();
                tSrc.buffer = brownBuf;

                const tFilter = this.ctx.createBiquadFilter();
                tFilter.type = 'lowpass';
                tFilter.frequency.setValueAtTime(120, this.ctx.currentTime);
                tFilter.Q.setValueAtTime(4.0, this.ctx.currentTime);

                const tGain = this.ctx.createGain();
                const now = this.ctx.currentTime;

                tGain.gain.setValueAtTime(0.001, now);
                tGain.gain.linearRampToValueAtTime(0.35, now + 0.4);
                tGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

                tSrc.connect(tFilter);
                tFilter.connect(tGain);
                tGain.connect(this.masterGain);

                tSrc.start(now);
                tSrc.stop(now + 4.0);
            } catch (e) {}

            const nextThunder = Math.random() * 8000 + 5000;
            const timer = setTimeout(playThunder, nextThunder);
            this.activeTimers.push(timer);
        };

        const initialThunderTimer = setTimeout(playThunder, 2000);
        this.activeTimers.push(initialThunderTimer);
    }

    // 3. Snow / Blizzard: Cold resonant wind whistle
    buildSnowSoundscape() {
        const noiseBuf = this.createNoiseBuffer('pink');
        const noiseSrc = this.ctx.createBufferSource();
        noiseSrc.buffer = noiseBuf;
        noiseSrc.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(420, this.ctx.currentTime);
        filter.Q.setValueAtTime(3.5, this.ctx.currentTime);

        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);
        lfoGain.gain.setValueAtTime(220, this.ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        noiseSrc.connect(filter);
        filter.connect(this.masterGain);

        noiseSrc.start(0);
        lfo.start(0);
        this.generators.push(noiseSrc, filter, lfo, lfoGain);
    }

    // 4. Sunny Day Birds: Gentle breeze + procedural songbird chirps
    buildBirdsSoundscape() {
        // Soft warm breeze background
        const noiseBuf = this.createNoiseBuffer('pink');
        const noiseSrc = this.ctx.createBufferSource();
        noiseSrc.buffer = noiseBuf;
        noiseSrc.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, this.ctx.currentTime);

        const bgGain = this.ctx.createGain();
        bgGain.gain.setValueAtTime(0.4, this.ctx.currentTime);

        noiseSrc.connect(filter);
        filter.connect(bgGain);
        bgGain.connect(this.masterGain);
        noiseSrc.start(0);
        this.generators.push(noiseSrc, filter, bgGain);

        // Procedural bird song melody generator
        const chirpBird = () => {
            if (!this.isPlaying) return;
            try {
                const now = this.ctx.currentTime;
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const numNotes = Math.floor(Math.random() * 3) + 2;
                const baseFreq = 2200 + Math.random() * 800;

                osc.type = 'sine';
                osc.frequency.setValueAtTime(baseFreq, now);

                let timeOffset = 0;
                for (let i = 0; i < numNotes; i++) {
                    const noteDur = 0.08 + Math.random() * 0.06;
                    const pitchChange = (Math.random() - 0.5) * 600;
                    osc.frequency.linearRampToValueAtTime(baseFreq + pitchChange, now + timeOffset + noteDur);
                    timeOffset += noteDur + 0.03;
                }

                gain.gain.setValueAtTime(0.001, now);
                gain.gain.linearRampToValueAtTime(0.06, now + 0.04);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + timeOffset);

                osc.connect(gain);
                gain.connect(this.masterGain);
                osc.start(now);
                osc.stop(now + timeOffset + 0.05);
            } catch (e) {}

            const nextChirp = Math.random() * 3500 + 1500;
            const timer = setTimeout(chirpBird, nextChirp);
            this.activeTimers.push(timer);
        };

        const timer = setTimeout(chirpBird, 1000);
        this.activeTimers.push(timer);
    }

    // 5. Clear Night Crickets: Night breeze + rhythmic chirping
    buildCricketsSoundscape() {
        const noiseBuf = this.createNoiseBuffer('pink');
        const noiseSrc = this.ctx.createBufferSource();
        noiseSrc.buffer = noiseBuf;
        noiseSrc.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, this.ctx.currentTime);
        const bgGain = this.ctx.createGain();
        bgGain.gain.setValueAtTime(0.3, this.ctx.currentTime);

        noiseSrc.connect(filter);
        filter.connect(bgGain);
        bgGain.connect(this.masterGain);
        noiseSrc.start(0);
        this.generators.push(noiseSrc, filter, bgGain);

        // Crickets pattern
        const chirpCricket = () => {
            if (!this.isPlaying) return;
            try {
                const now = this.ctx.currentTime;
                const pulses = 4;
                for (let i = 0; i < pulses; i++) {
                    const osc = this.ctx.createOscillator();
                    const gain = this.ctx.createGain();
                    const pTime = now + (i * 0.045);

                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(4600 + Math.random() * 200, pTime);

                    gain.gain.setValueAtTime(0.001, pTime);
                    gain.gain.linearRampToValueAtTime(0.04, pTime + 0.015);
                    gain.gain.exponentialRampToValueAtTime(0.0001, pTime + 0.04);

                    osc.connect(gain);
                    gain.connect(this.masterGain);
                    osc.start(pTime);
                    osc.stop(pTime + 0.045);
                }
            } catch (e) {}

            const nextCricket = Math.random() * 1200 + 800;
            const timer = setTimeout(chirpCricket, nextCricket);
            this.activeTimers.push(timer);
        };
        const timer = setTimeout(chirpCricket, 600);
        this.activeTimers.push(timer);
    }

    // 6. Wind & Fog Soundscape: Tranquil air wash
    buildWindSoundscape() {
        const noiseBuf = this.createNoiseBuffer('pink');
        const noiseSrc = this.ctx.createBufferSource();
        noiseSrc.buffer = noiseBuf;
        noiseSrc.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(350, this.ctx.currentTime);
        filter.Q.setValueAtTime(1.8, this.ctx.currentTime);

        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.setValueAtTime(0.18, this.ctx.currentTime);
        lfoGain.gain.setValueAtTime(120, this.ctx.currentTime);
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        noiseSrc.connect(filter);
        filter.connect(this.masterGain);

        noiseSrc.start(0);
        lfo.start(0);
        this.generators.push(noiseSrc, filter, lfo, lfoGain);
    }

    toggle(theme, isDay = true) {
        if (this.isPlaying) {
            this.stop(true);
            return false;
        } else {
            this.activeWeatherType = this.getWeatherSoundType(theme, isDay);
            this.start(this.currentMode);
            return true;
        }
    }
}

window.WeatherAudioSynthesizer = WeatherAudioSynthesizer;
