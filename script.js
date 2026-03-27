document.addEventListener('DOMContentLoaded', () => {
    const modernApp = document.getElementById('modern-app');
    const terminalOverlay = document.getElementById('terminal-overlay');
    const btnOpenTerminal = document.getElementById('btn-terminal-mode');
    const btnCloseTerminal = document.getElementById('btn-close-terminal');
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const terminal = document.getElementById('terminal');
    const rebootButton = document.getElementById('reboot-button');
    const backgroundNoise = document.getElementById('background-noise');

    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark');
        if (themeIcon) themeIcon.textContent = 'light_mode';
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = document.documentElement.classList.contains('dark');
            if (isDark) {
                document.documentElement.classList.remove('dark');
                localStorage.setItem('theme', 'light');
                if (themeIcon) themeIcon.textContent = 'dark_mode';
            } else {
                document.documentElement.classList.add('dark');
                localStorage.setItem('theme', 'dark');
                if (themeIcon) themeIcon.textContent = 'light_mode';
            }
        });
    }

    if (btnOpenTerminal && terminalOverlay && modernApp) {
        btnOpenTerminal.addEventListener('click', () => {
            console.log("Abriendo Terminal...");
            modernApp.style.display = 'none';
            terminalOverlay.style.display = 'flex';
            if (terminal) terminal.innerHTML = '';
            if (backgroundNoise) backgroundNoise.textContent = '';
            if (rebootButton) rebootButton.style.display = 'none';
            setupAudio();
            runPresentation();
        });
    }

    if (btnCloseTerminal && terminalOverlay && modernApp) {
        btnCloseTerminal.addEventListener('click', () => {
            console.log("Cerrando Terminal...");
            clearInterval(robotInterval);
            stopCrazyMode();
            if (keySoundOscillator) { try { keySoundOscillator.stop(); } catch (e) { } }
            terminalOverlay.style.display = 'none';
            modernApp.style.display = 'block';
        });
    }

    if (rebootButton) {
        rebootButton.addEventListener('click', startNuclearSequence);
    }

    let audioCtx;
    let keySoundOscillator;
    let robotInterval;
    let crazyIntervals = [];
    const TYPING_SPEED = 10;


    function setupAudio() {
        if (audioCtx) return;
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) { console.error("Web Audio API no es compatible."); }
    }

    function playKeySound() {
        if (!audioCtx) return;
        if (keySoundOscillator) { try { keySoundOscillator.stop(); } catch (e) { } }
        keySoundOscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        keySoundOscillator.type = 'square';
        keySoundOscillator.frequency.setValueAtTime(1200, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        keySoundOscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        keySoundOscillator.start();
        keySoundOscillator.stop(audioCtx.currentTime + 0.03);
    }

    function playExplosionSound() {
        if (!audioCtx) return;
        const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 1.5, audioCtx.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        for (let i = 0; i < noiseData.length; i++) { noiseData[i] = Math.random() * 2 - 1; }
        const noiseSource = audioCtx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        const noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.5, audioCtx.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.5);
        noiseSource.connect(noiseGain);
        noiseGain.connect(audioCtx.destination);
        const boom = audioCtx.createOscillator();
        const boomGain = audioCtx.createGain();
        boom.type = 'sawtooth';
        boom.frequency.setValueAtTime(100, audioCtx.currentTime);
        boom.frequency.exponentialRampToValueAtTime(0.1, audioCtx.currentTime + 1);
        boomGain.gain.setValueAtTime(0.8, audioCtx.currentTime);
        boomGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1);
        boom.connect(boomGain);
        boomGain.connect(audioCtx.destination);
        noiseSource.start();
        boom.start();
        noiseSource.stop(audioCtx.currentTime + 1.5);
        boom.stop(audioCtx.currentTime + 1);
    }

    const presentationLines = [
        { text: '> Cargando perfil...', delayAfter: 500 },
        { text: 'MATIAS GABRIEL TELLO', class: 'title-line', delayAfter: 800 },
        { text: '[QUERY]: Buscando credenciales...', class: 'query-line', delayAfter: 500 },
        { text: '[STATUS]: Técnico Informático (Graduado)', delayAfter: 300 },
        { text: '[ESTUDIANDO]: Lic. en Economía Industrial', delayAfter: 300 },
        { text: '[HOBBY]: ', delayAfter: 0 },
        { text: '<span class="glitch" data-text="PROGRAMAR POR DIVERSION">PROGRAMAR POR DIVERSION</span>', isHTML: true, noBreak: true, delayAfter: 800 },
        { text: '[PROYECTOS_OPEN_SOURCE]:', delayAfter: 300 },
        { text: '> <a href="https://mentitos.github.io/finanzaslibre-pagina/" target="_blank">Finanzas Libre</a>: App móvil para la gestión integral de finanzas personales.', class: 'link-line', isHTML: true, delayAfter: 600 },
        { text: '> <a href="https://mentitos.github.io/horarios-pagina/" target="_blank">Horarios UNGS</a>: Gestión de horarios de cursada. Nació de un proyecto en conjunto como un Excel, luego pasó a ser Web y terminó en Android.', class: 'link-line', isHTML: true, delayAfter: 600 },
        { text: '[PROYECTOS_WEB]:', delayAfter: 300 },
        { text: '> <a href="https://mentitos.github.io/GabrielaS/" target="_blank">GabrielaS</a>: Pagina web de Gabriela, una emprendedora dedicada a la venta de aceite CBD.', class: 'link-line', isHTML: true, delayAfter: 400 },
        { text: '> <a href="https://mentitos.github.io/Ferrovias/" target="_blank">Ferrovias</a>: Una mejor pagina para ver los hoarios del Belgrano Norte "El Rojito".', class: 'link-line', isHTML: true, delayAfter: 400 },
        { text: '> <a href="https://mentitos.github.io/chillimicalamejor-fanpage/" target="_blank">Fanpage de Chillimica</a>: Página fan de Chillimica.', class: 'link-line', isHTML: true, delayAfter: 400 },
        { text: '> <a href="https://mentitos.github.io/distrimas/" target="_blank">Distrimas</a>: Página web para una distribuidora de harinas y demas.', class: 'link-line', isHTML: true, delayAfter: 400 },
        { text: '> <a href="https://mentitos.github.io/QRgenerador/" target="_blank">QR Generador</a>: Generador de códigos QR simple.', class: 'link-line', isHTML: true, delayAfter: 400 },
        { text: '> <a href="https://mentitos.github.io/Reparaciones.Francisconi/" target="_blank">Reparaciones Francisconi</a>: Página web para negocio de reparación de electrodomesticos.', class: 'link-line', isHTML: true, delayAfter: 400 },
        { text: '> <a href="https://mentitos.github.io/los-dos-pibes/" target="_blank">Los Dos Pibes</a>: Pagina para un corralon "Los dos pibes".', class: 'link-line', isHTML: true, delayAfter: 400 },
        { text: '> <a href="https://mentitos.github.io/materiasungsporcentaje/" target="_blank">Calculadora Progreso UNGS</a>: Página web interactiva original para calcular el porcentaje de avance en tu carrera.', class: 'link-line', isHTML: true, delayAfter: 400 },
        { text: '[PROYECTOS_SILLY]:', delayAfter: 300 },
        { text: '> <a href="https://mentitos.github.io/idle/" target="_blank">Idle de desarrollo (Dev Empire)</a>: Un juego incremental (idle) en el que puedes armar tu propio imperio de desarrollo de software.', class: 'link-line', isHTML: true, delayAfter: 600 },
        { text: '> <a href="https://github.com/Mentitos/Game-Of-Life-In-Your-Terminal" target="_blank">Game Of Life In Your Terminal</a>: El clásico juego de la vida de Conway, pero en tu consola.', class: 'link-line', isHTML: true, delayAfter: 600 },
        { text: '[??]: <span class="loco">¡Fanático de la ayuda de las Clankers!</span><span class="dancing-robot"></span>', isHTML: true, delayAfter: 500, id: 'clankers-line' },
    ];

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    async function typeLine(p, line) {
        if (terminalOverlay.style.display === 'none') return;

        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        p.appendChild(cursor);
        if (line.isHTML) {
            await sleep(200);
            const content = document.createElement('span');
            content.innerHTML = line.text;
            p.insertBefore(content, cursor);
            terminalOverlay.scrollTo({ top: terminalOverlay.scrollHeight, behavior: 'smooth' });
        } else {
            const text = line.text || '';
            for (const char of text) {
                if (terminalOverlay.style.display === 'none') break;
                playKeySound();
                const textNode = document.createTextNode(char);
                p.insertBefore(textNode, cursor);
                terminalOverlay.scrollTo(0, terminalOverlay.scrollHeight);
                await sleep(TYPING_SPEED);
            }
        }
        cursor.style.display = 'none';
    }

    function startCrazyMode() {
        stopCrazyMode();
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789*&^%$#@!';
        const noiseInterval = setInterval(() => {
            if (terminalOverlay.style.display === 'none') { stopCrazyMode(); return; }
            let content = '';
            for (let i = 0; i < 15000; i++) {
                content += chars[Math.floor(Math.random() * chars.length)];
            }
            backgroundNoise.textContent = content;
        }, 150);

        const effectsInterval = setInterval(() => {
            if (terminalOverlay.style.display === 'none') { stopCrazyMode(); return; }
            const effect = Math.random();
            if (effect < 0.1) {
                terminalOverlay.classList.add('crazy-shake');
                setTimeout(() => terminalOverlay.classList.remove('crazy-shake'), 200);
            } else if (effect < 0.3) {
                createSpinningSymbol();
            }
        }, 200);
        crazyIntervals.push(noiseInterval, effectsInterval);
    }

    function createSpinningSymbol() {
        const symbol = document.createElement('span');
        const symbols = ['*', '#', '§', '?', '¤', '%', '&', '@'];
        const colors = ['#00ff00', '#ff00c1', '#00fff9', '#ffff00'];
        symbol.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        symbol.className = 'spinning-symbol';
        symbol.style.color = colors[Math.floor(Math.random() * colors.length)];
        symbol.style.top = `${Math.random() * 100}vh`;
        symbol.style.left = `${Math.random() * 100}vw`;
        terminalOverlay.appendChild(symbol);
        setTimeout(() => {
            symbol.remove();
        }, 1500);
    }

    function stopCrazyMode() {
        crazyIntervals.forEach(clearInterval);
        crazyIntervals = [];
        backgroundNoise.textContent = '';
        terminalOverlay.classList.remove('crazy-shake');
    }

    async function runPresentation() {
        clearInterval(robotInterval);
        stopCrazyMode();
        rebootButton.style.display = 'none';
        terminal.innerHTML = '';
        let currentP = null;

        for (const line of presentationLines) {
            if (terminalOverlay.style.display === 'none') return;

            if (!line.noBreak) {
                currentP = document.createElement('p');
                if (line.class) { currentP.className = line.class; }
                terminal.appendChild(currentP);
            }
            await typeLine(currentP, line);
            if (line.id === 'clankers-line') {
                const robotContainer = terminal.querySelector('.dancing-robot');
                if (robotContainer) {
                    const robotFrames = ['d[-_-]b', 'q[-_-]p'];
                    let frameIndex = 0;
                    robotInterval = setInterval(() => {
                        robotContainer.textContent = robotFrames[frameIndex];
                        frameIndex = (frameIndex + 1) % robotFrames.length;
                    }, 300);
                }
            }
            if (line.delayAfter) { await sleep(line.delayAfter); }
        }

        if (terminalOverlay.style.display !== 'none') {
            startCrazyMode();
            const finalCursorP = document.createElement('p');
            const finalCursor = document.createElement('span');
            finalCursor.className = 'cursor';
            finalCursorP.appendChild(finalCursor);
            terminal.appendChild(finalCursorP);
            rebootButton.style.display = 'block';
        }
    }

    async function startNuclearSequence() {
        setupAudio();
        rebootButton.disabled = true;
        clearInterval(robotInterval);
        stopCrazyMode();
        terminal.innerHTML = '';

        const countdownLines = [
            { text: 'ALERTA: Protocolo nuclear iniciado.', class: 'countdown-line', delayAfter: 1000 },
            { text: '3', class: 'countdown-line', delayAfter: 1000 },
            { text: '2', class: 'countdown-line', delayAfter: 1000 },
            { text: '1', class: 'countdown-line', delayAfter: 1000 },
        ];

        for (const line of countdownLines) {
            if (terminalOverlay.style.display === 'none') return;
            const p = document.createElement('p');
            p.className = line.class;
            terminal.appendChild(p);
            await typeLine(p, line);
            await sleep(line.delayAfter);
        }

        if (terminalOverlay.style.display === 'none') return;

        playExplosionSound();
        const flash = document.createElement('div');
        flash.className = 'flash';
        terminalOverlay.appendChild(flash);
        terminalOverlay.classList.add('nuclear-shake');

        await sleep(1500);

        terminalOverlay.classList.remove('nuclear-shake');
        flash.remove();
        rebootButton.disabled = false;
        runPresentation();
    }

    rebootButton.addEventListener('click', startNuclearSequence);

    // Content Rendering System
    async function initDynamicContent() {
        try {
            const response = await fetch('portfolio.json');
            const data = await response.json();

            renderHero(data.hero);
            renderExpertise(data.expertise);
            renderSkills(data.skills);
            renderProjects(data.categories);
            renderCTA(data.cta);
            renderFooter(data.footer);

        } catch (error) {
            console.error('Error cargando el contenido del portafolio:', error);
        }
    }

    function renderHero(hero) {
        const container = document.getElementById('hero-container');
        if (!container || !hero) return;

        let buttonHtml = hero.cta_text ? `
            <div class="mt-12">
                <a href="${hero.cta_link}" class="inline-block bg-primary text-black px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform duration-400">
                    ${hero.cta_text}
                </a>
            </div>
        ` : '';

        container.innerHTML = `
            <div class="max-w-4xl">
                <span class="inline-block px-3 py-1 bg-surface-container rounded-lg text-primary text-[10px] font-bold tracking-[0.2em] uppercase mb-6">${hero.tag}</span>
                <h1 class="text-6xl md:text-8xl font-black tracking-[-0.04em] leading-[0.9] mb-8 text-white">
                    ${hero.title}
                </h1>
                <p class="text-xl md:text-2xl text-on-surface-variant font-light leading-relaxed max-w-2xl">
                    ${hero.description}
                </p>
                ${buttonHtml}
            </div>
        `;
    }

    function renderExpertise(expertise) {
        const header = document.getElementById('expertise-header');
        const grid = document.getElementById('expertise-grid');
        if (!header || !grid || !expertise) return;

        header.innerHTML = `
            <div class="flex items-end justify-between mb-12">
                <h2 class="text-3xl font-bold tracking-tight">${expertise.title}</h2>
                <span class="text-xs uppercase tracking-widest text-on-surface-variant">01 / Expertise</span>
            </div>
        `;

        grid.innerHTML = expertise.items.map(item => {
            if (item.type === 'card-large') {
                return `
                    <div class="md:col-span-7 bg-surface-container-low p-10 rounded-xl flex flex-col justify-between min-h-[400px]">
                        <div class="space-y-4">
                            <span class="material-symbols-outlined text-primary text-4xl">${item.icon}</span>
                            <h3 class="text-3xl font-bold tracking-tight text-white">${item.title}</h3>
                            <p class="text-on-surface-variant text-lg leading-relaxed max-w-md">
                                ${item.description}
                            </p>
                        </div>
                        <div class="mt-8 flex gap-4">
                            ${item.tags.map(tag => `<div class="px-4 py-2 bg-surface-container rounded-full text-xs font-medium border border-outline-variant/15 text-white">${tag}</div>`).join('')}
                        </div>
                    </div>
                `;
            } else if (item.type === 'card-small') {
                let buttonHtml = item.cta_text ? `
                    <div class="mt-8">
                        <a href="${item.cta_link}" target="_blank" class="inline-block bg-primary text-black px-6 py-3 rounded-full font-black uppercase tracking-[0.1em] text-[10px] hover:scale-105 transition-transform duration-300 shadow-[0_4px_10px_rgba(136,173,255,0.2)]">
                            ${item.cta_text}
                        </a>
                    </div>
                ` : '';

                return `
                    <div class="md:col-span-5 bg-surface-container-high p-10 rounded-xl border border-primary/10 group hover:border-primary/40 transition-colors flex flex-col">
                        <h4 class="text-primary text-xs font-bold tracking-widest uppercase mb-2">${item.category}</h4>
                        <h3 class="text-2xl font-bold mb-4 text-white">${item.title}</h3>
                        <p class="text-on-surface-variant mb-8">${item.description}</p>
                        <div class="mt-auto">
                            <p class="text-xs text-on-surface-variant uppercase tracking-widest mb-1">${item.price_label}</p>
                            <p class="text-4xl font-black text-white mb-4">${item.price}</p>
                            ${buttonHtml}
                        </div>
                    </div>
                `;
            } else if (item.type === 'card-accent') {
                return `
                    <div class="md:col-span-7 bg-surface-container p-10 rounded-xl relative overflow-hidden">
                        <div class="relative z-10">
                            <h3 class="text-xl font-bold mb-4 text-white">${item.title}</h3>
                            <p class="text-on-surface-variant">${item.description}</p>
                        </div>
                        <div class="absolute -bottom-10 -right-10 opacity-10">
                            <span class="material-symbols-outlined text-[200px] text-primary">${item.icon}</span>
                        </div>
                    </div>
                `;
            }
            return '';
        }).join('');
    }

    function renderSkills(skills) {
        const container = document.getElementById('skills-container');
        if (!container || !skills) return;

        container.innerHTML = skills.map(skill => `
            <div class="flex items-center gap-4 px-8 py-5 bg-surface-container rounded-3xl border border-outline-variant/10 hover:border-primary/30 transition-all">
                <img src="${skill.icon}" class="w-10 h-10" alt="${skill.name}">
                <span class="text-lg font-bold">${skill.name}</span>
            </div>
        `).join('');
    }

    function renderProjects(categories) {
        const container = document.getElementById('projects-container');
        if (!container || !categories) return;

        container.innerHTML = categories.map((category, index) => {
            const itemsHtml = category.items.map((item, i) => {
                let mediaHtml = item.image ? `<img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100">` : `<span class="material-symbols-outlined text-[100px] text-primary opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700">${item.icon}</span>`;

                return `
                    <a href="${item.link_url}" target="_blank" class="group ${i % 2 !== 0 ? 'md:mt-24' : ''} block">
                        <div class="relative aspect-[4/3] overflow-hidden rounded-3xl bg-surface-container-low mb-8 project-card-container">
                            ${mediaHtml}
                            <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            <div class="absolute bottom-8 left-8 right-8 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                <span class="material-symbols-outlined text-white text-3xl">arrow_outward</span>
                            </div>
                        </div>
                        <div class="flex justify-between items-start">
                            <div>
                                <h3 class="text-2xl font-black mb-2 text-white group-hover:text-primary transition-colors">${item.title}</h3>
                                <div class="description-wrapper">
                                    <div class="description-container">
                                        <p class="text-on-surface-variant max-w-sm">${item.description}</p>
                                    </div>
                                    ${item.description.length > 110 ? `
                                        <button class="btn-read-more" onclick="window.toggleDescription(this, event)">
                                            LEER MÁS 
                                            <span class="material-symbols-outlined">expand_more</span>
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                            <span class="project-tag">${item.tag || 'Work'}</span>
                        </div>
                    </a>
                `;
            }).join('');

            return `
                <section class="mb-24">
                    <div class="flex items-end justify-between mb-16">
                        <div>
                            <h2 class="text-xs font-bold tracking-[0.3em] uppercase text-primary mb-4">${category.name}</h2>
                            <p class="text-on-surface-variant">Colección de mis trabajos en esta categoría.</p>
                        </div>
                        <div class="hidden md:block h-[1px] flex-grow mx-12 bg-outline-variant/20"></div>
                        <span class="text-xs uppercase tracking-widest text-on-surface-variant">0${index + 2} / Work</span>
                    </div>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
                        ${itemsHtml}
                    </div>
                </section>
            `;
        }).join('');
    }

    function renderCTA(cta) {
        const container = document.getElementById('cta-container');
        if (!container || !cta) return;

        container.setAttribute('id', 'contact');
        container.innerHTML = `
            <div class="relative z-10 max-w-2xl mx-auto px-6">
                <h2 class="text-5xl md:text-6xl font-black mb-8 leading-tight text-white">${cta.title}</h2>
                <p class="text-on-surface-variant text-lg mb-12">${cta.description}</p>
                <a class="inline-block bg-[#25D366] text-white px-10 py-5 rounded-full font-black uppercase tracking-[0.2em] text-sm hover:scale-105 transition-transform duration-400 shadow-[0_4px_15px_rgba(37,211,102,0.3)]"
                    href="${cta.link}" target="_blank">
                    ${cta.button_text}
                </a>
            </div>
            <div class="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none"></div>
        `;
    }

    function renderFooter(footer) {
        const container = document.getElementById('footer-container');
        if (!container || !footer) return;

        container.innerHTML = `
            <div class="text-lg font-bold text-white tracking-tighter uppercase">MGT.</div>
            <div class="text-[#adaaaa] text-xs font-medium max-w-md text-center">
                ${footer.copyright}
            </div>
            <div class="flex gap-8 font-['Inter'] text-[#adaaaa] text-xs tracking-widest uppercase">
                ${footer.links.map(link => `<a class="hover:text-white transition-colors duration-400" href="${link.url}" target="_blank">${link.name}</a>`).join('')}
            </div>
        `;
    }

    initDynamicContent();

    window.toggleDescription = function (btn, event) {
        event.preventDefault();
        event.stopPropagation();
        const container = btn.previousElementSibling;
        const isExpanded = container.classList.toggle('description-expanded');
        btn.classList.toggle('active');
        const icon = btn.querySelector('.material-symbols-outlined');

        if (isExpanded) {
            btn.innerHTML = `VER MENOS <span class="material-symbols-outlined">expand_less</span>`;
        } else {
            btn.innerHTML = `LEER MÁS <span class="material-symbols-outlined">expand_more</span>`;
        }
    };
});
