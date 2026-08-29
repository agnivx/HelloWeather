/**
 * Dynamic Canvas Weather Particle Engine
 * 60fps realistic simulations for Rain, Thunderstorm, Snow, Clouds, Fog, Stars & Sunbeams
 */

class WeatherCanvasEffect {
    constructor(canvasId = 'weather-canvas') {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.width = 0;
        this.height = 0;
        this.particles = [];
        this.splashes = [];
        this.shootingStars = [];
        this.lightningFlash = 0;
        this.nextLightningTime = 0;
        this.mode = 'clear-day';
        this.isDay = true;
        this.animationFrameId = null;
        this.lastTime = performance.now();

        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.start();
    }

    resize() {
        if (!this.canvas) return;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.spawnParticles();
    }

    setWeather(theme, isDay = true) {
        let newMode = 'clear-day';
        if (theme === 'rain' || theme === 'drizzle') {
            newMode = 'rain';
        } else if (theme === 'storm' || theme === 'thunderstorm') {
            newMode = 'storm';
        } else if (theme === 'snow') {
            newMode = 'snow';
        } else if (theme === 'clouds' || theme === 'partly-cloudy') {
            newMode = isDay ? 'clouds-day' : 'clouds-night';
        } else if (theme === 'fog' || theme === 'mist') {
            newMode = 'fog';
        } else {
            newMode = isDay ? 'clear-day' : 'clear-night';
        }

        this.isDay = isDay;
        if (this.mode !== newMode) {
            this.mode = newMode;
            this.spawnParticles();
        }
    }

    spawnParticles() {
        this.particles = [];
        this.splashes = [];
        this.shootingStars = [];
        const area = this.width * this.height;

        if (this.mode === 'rain' || this.mode === 'storm') {
            const count = this.mode === 'storm' ? Math.min(180, Math.floor(area / 6000)) : Math.min(120, Math.floor(area / 9000));
            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    length: Math.random() * 24 + 14,
                    speed: Math.random() * 10 + 16,
                    thickness: Math.random() * 1.5 + 0.8,
                    opacity: Math.random() * 0.5 + 0.3,
                    wind: (Math.random() - 0.2) * 4
                });
            }
        } else if (this.mode === 'snow') {
            const count = Math.min(100, Math.floor(area / 8000));
            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    radius: Math.random() * 3 + 1,
                    speed: Math.random() * 1.5 + 0.8,
                    opacity: Math.random() * 0.7 + 0.3,
                    angle: Math.random() * Math.PI * 2,
                    angularSpeed: Math.random() * 0.03 + 0.01,
                    sway: Math.random() * 1.5 + 0.5
                });
            }
        } else if (this.mode === 'clear-night' || this.mode === 'clouds-night') {
            const count = Math.min(130, Math.floor(area / 7000));
            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * (this.height * 0.85),
                    radius: Math.random() * 1.8 + 0.5,
                    baseAlpha: Math.random() * 0.7 + 0.2,
                    twinkleSpeed: Math.random() * 0.04 + 0.01,
                    phase: Math.random() * Math.PI * 2,
                    color: Math.random() > 0.8 ? '#93C5FD' : (Math.random() > 0.7 ? '#FEF08A' : '#FFFFFF')
                });
            }
        } else if (this.mode === 'clear-day') {
            const count = Math.min(45, Math.floor(area / 20000));
            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    radius: Math.random() * 3 + 1,
                    baseAlpha: Math.random() * 0.35 + 0.1,
                    speedX: (Math.random() - 0.5) * 0.4,
                    speedY: -Math.random() * 0.6 - 0.2,
                    phase: Math.random() * Math.PI * 2
                });
            }
        } else if (this.mode === 'fog') {
            const count = 12;
            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * this.height,
                    radius: Math.random() * 200 + 120,
                    speedX: (Math.random() * 0.3 + 0.1) * (Math.random() > 0.5 ? 1 : -1),
                    opacity: Math.random() * 0.12 + 0.04
                });
            }
        } else if (this.mode === 'clouds-day') {
            const count = 8;
            for (let i = 0; i < count; i++) {
                this.particles.push({
                    x: Math.random() * this.width,
                    y: Math.random() * (this.height * 0.5),
                    radius: Math.random() * 150 + 100,
                    speedX: Math.random() * 0.25 + 0.08,
                    opacity: Math.random() * 0.15 + 0.05
                });
            }
        }
    }

    start() {
        const render = (time) => {
            const dt = (time - this.lastTime) / 1000;
            this.lastTime = time;

            this.update(dt);
            this.draw();

            this.animationFrameId = requestAnimationFrame(render);
        };
        this.animationFrameId = requestAnimationFrame(render);
    }

    update(dt) {
        // Rain & Storm update
        if (this.mode === 'rain' || this.mode === 'storm') {
            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];
                p.y += p.speed;
                p.x += p.wind;

                // Hit ground splash
                if (p.y > this.height) {
                    if (Math.random() > 0.7 && this.splashes.length < 30) {
                        this.splashes.push({
                            x: p.x,
                            y: this.height - Math.random() * 10,
                            radius: 1,
                            maxRadius: Math.random() * 6 + 3,
                            alpha: 0.6
                        });
                    }
                    p.y = -p.length;
                    p.x = Math.random() * this.width;
                }
            }

            // Update splashes
            for (let i = this.splashes.length - 1; i >= 0; i--) {
                const s = this.splashes[i];
                s.radius += 0.4;
                s.alpha -= 0.03;
                if (s.alpha <= 0 || s.radius >= s.maxRadius) {
                    this.splashes.splice(i, 1);
                }
            }

            // Storm lightning
            if (this.mode === 'storm') {
                const now = performance.now();
                if (now > this.nextLightningTime) {
                    this.lightningFlash = 0.85;
                    this.nextLightningTime = now + Math.random() * 7000 + 4000;
                }
                if (this.lightningFlash > 0) {
                    this.lightningFlash = Math.max(0, this.lightningFlash - dt * 2.2);
                }
            }
        }

        // Snow update
        if (this.mode === 'snow') {
            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];
                p.angle += p.angularSpeed;
                p.y += p.speed;
                p.x += Math.sin(p.angle) * p.sway;

                if (p.y > this.height + 10) {
                    p.y = -10;
                    p.x = Math.random() * this.width;
                }
            }
        }

        // Starry Night & Shooting Stars
        if (this.mode === 'clear-night' || this.mode === 'clouds-night') {
            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];
                p.phase += p.twinkleSpeed;
            }

            // Occasional shooting star
            if (Math.random() < 0.003 && this.shootingStars.length < 2) {
                this.shootingStars.push({
                    x: Math.random() * (this.width * 0.7),
                    y: Math.random() * (this.height * 0.3),
                    length: Math.random() * 80 + 50,
                    speed: Math.random() * 12 + 10,
                    dx: 1,
                    dy: 0.6,
                    alpha: 1
                });
            }

            for (let i = this.shootingStars.length - 1; i >= 0; i--) {
                const ss = this.shootingStars[i];
                ss.x += ss.speed * ss.dx;
                ss.y += ss.speed * ss.dy;
                ss.alpha -= 0.02;
                if (ss.alpha <= 0 || ss.x > this.width || ss.y > this.height) {
                    this.shootingStars.splice(i, 1);
                }
            }
        }

        // Sunbeams / Dust particles (Clear Day)
        if (this.mode === 'clear-day') {
            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];
                p.y += p.speedY;
                p.x += p.speedX;
                p.phase += 0.02;

                if (p.y < -10) {
                    p.y = this.height + 10;
                    p.x = Math.random() * this.width;
                }
            }
        }

        // Fog & Clouds
        if (this.mode === 'fog' || this.mode === 'clouds-day') {
            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];
                p.x += p.speedX;
                if (p.x > this.width + p.radius) {
                    p.x = -p.radius;
                } else if (p.x < -p.radius) {
                    p.x = this.width + p.radius;
                }
            }
        }
    }

    draw() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Draw lightning flash background overlay
        if (this.mode === 'storm' && this.lightningFlash > 0) {
            this.ctx.fillStyle = `rgba(224, 231, 255, ${this.lightningFlash * 0.35})`;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }

        // Draw Sunbeams (Clear Day)
        if (this.mode === 'clear-day') {
            // Ambient sun glow in top right
            const sunGrad = this.ctx.createRadialGradient(
                this.width * 0.8, this.height * 0.15, 10,
                this.width * 0.8, this.height * 0.15, this.width * 0.6
            );
            sunGrad.addColorStop(0, 'rgba(254, 240, 138, 0.15)');
            sunGrad.addColorStop(0.5, 'rgba(251, 191, 36, 0.05)');
            sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            this.ctx.fillStyle = sunGrad;
            this.ctx.fillRect(0, 0, this.width, this.height);

            // Shimmering light motes
            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];
                const alpha = p.baseAlpha + Math.sin(p.phase) * 0.15;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(254, 240, 138, ${Math.max(0, alpha)})`;
                this.ctx.shadowBlur = 8;
                this.ctx.shadowColor = '#FBBF24';
                this.ctx.fill();
            }
            this.ctx.shadowBlur = 0;
        }

        // Draw Stars (Night)
        if (this.mode === 'clear-night' || this.mode === 'clouds-night') {
            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];
                const alpha = Math.max(0.1, p.baseAlpha + Math.sin(p.phase) * 0.35);
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.fillStyle = p.color;
                this.ctx.globalAlpha = alpha;
                this.ctx.shadowBlur = 4;
                this.ctx.shadowColor = '#93C5FD';
                this.ctx.fill();
            }
            this.ctx.globalAlpha = 1;
            this.ctx.shadowBlur = 0;

            // Draw shooting stars
            for (let i = 0; i < this.shootingStars.length; i++) {
                const ss = this.shootingStars[i];
                const grad = this.ctx.createLinearGradient(
                    ss.x, ss.y,
                    ss.x - ss.length * ss.dx, ss.y - ss.length * ss.dy
                );
                grad.addColorStop(0, `rgba(255, 255, 255, ${ss.alpha})`);
                grad.addColorStop(0.3, `rgba(147, 197, 253, ${ss.alpha * 0.8})`);
                grad.addColorStop(1, 'rgba(147, 197, 253, 0)');

                this.ctx.beginPath();
                this.ctx.moveTo(ss.x, ss.y);
                this.ctx.lineTo(ss.x - ss.length * ss.dx, ss.y - ss.length * ss.dy);
                this.ctx.strokeStyle = grad;
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
        }

        // Draw Rain & Storm Drops
        if (this.mode === 'rain' || this.mode === 'storm') {
            this.ctx.strokeStyle = this.mode === 'storm' ? 'rgba(191, 219, 254, 0.75)' : 'rgba(147, 197, 253, 0.6)';
            this.ctx.lineCap = 'round';

            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];
                this.ctx.lineWidth = p.thickness;
                this.ctx.globalAlpha = p.opacity;
                this.ctx.beginPath();
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(p.x + p.wind * 1.5, p.y + p.length);
                this.ctx.stroke();
            }

            // Draw splashes
            this.ctx.strokeStyle = 'rgba(191, 219, 254, 0.5)';
            this.ctx.lineWidth = 1.2;
            for (let i = 0; i < this.splashes.length; i++) {
                const s = this.splashes[i];
                this.ctx.globalAlpha = s.alpha;
                this.ctx.beginPath();
                this.ctx.ellipse(s.x, s.y, s.radius * 2, s.radius * 0.6, 0, 0, Math.PI * 2);
                this.ctx.stroke();
            }
            this.ctx.globalAlpha = 1;
        }

        // Draw Snowflakes
        if (this.mode === 'snow') {
            this.ctx.fillStyle = '#FFFFFF';
            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];
                this.ctx.globalAlpha = p.opacity;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.shadowBlur = 6;
                this.ctx.shadowColor = 'rgba(224, 242, 254, 0.8)';
                this.ctx.fill();
            }
            this.ctx.globalAlpha = 1;
            this.ctx.shadowBlur = 0;
        }

        // Draw Fog / Clouds
        if (this.mode === 'fog' || this.mode === 'clouds-day') {
            for (let i = 0; i < this.particles.length; i++) {
                const p = this.particles[i];
                const grad = this.ctx.createRadialGradient(
                    p.x, p.y, 0,
                    p.x, p.y, p.radius
                );
                grad.addColorStop(0, `rgba(241, 245, 249, ${p.opacity})`);
                grad.addColorStop(0.6, `rgba(226, 232, 240, ${p.opacity * 0.5})`);
                grad.addColorStop(1, 'rgba(226, 232, 240, 0)');

                this.ctx.fillStyle = grad;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
    }

    destroy() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }
}

window.WeatherCanvasEffect = WeatherCanvasEffect;
