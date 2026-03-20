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

    async function loadProjects() {
        try {
            const response = await fetch('portfolio.json');
            const data = await response.json();
            const container = document.getElementById('projects-container');
            if (!container) return;

            data.categories.forEach((category, index) => {
                const section = document.createElement('section');
                section.className = 'mb-24';

                const headerHtml = `
                    <div class="flex items-end justify-between mb-16">
                        <div>
                            <h2 class="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-white">${category.name}</h2>
                            <p class="text-on-surface-variant">Colección de mis trabajos en esta categoría.</p>
                        </div>
                        <div class="hidden md:block h-[1px] flex-grow mx-12 bg-outline-variant/20"></div>
                        <span class="text-xs uppercase tracking-widest text-on-surface-variant">0${index + 2} / Work</span>
                    </div>
                `;
                section.innerHTML = headerHtml;

                const grid = document.createElement('div');
                grid.className = 'grid grid-cols-1 md:grid-cols-2 gap-12';

                category.items.forEach((item, i) => {
                    const card = document.createElement('a');
                    card.href = item.link_url;
                    card.target = '_blank';
                    card.className = `group ${i % 2 !== 0 ? 'md:mt-24' : ''} block`;

                    let mediaHtml = '';
                    if (item.image) {
                        mediaHtml = `<img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100">`;
                    } else {
                        mediaHtml = `<span class="material-symbols-outlined text-[100px] text-primary opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-700">${item.icon}</span>`;
                    }

                    card.innerHTML = `
                        <div class="project-card-container relative overflow-hidden aspect-[16/10] bg-surface-container-high rounded-xl mb-6 flex items-center justify-center border border-primary/10 transition-colors group-hover:border-primary/40">
                            ${mediaHtml}
                            <div class="absolute top-6 left-6 flex gap-2">
                                <span class="px-3 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase tracking-wider text-primary">${item.tag || 'Proyecto'}</span>
                            </div>
                        </div>
                        <h3 class="text-2xl font-bold mb-2 text-white group-hover:text-primary transition-colors">${item.title}</h3>
                        <p class="text-on-surface-variant leading-relaxed mb-4">${item.description}</p>
                        <span class="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider opacity-80 group-hover:opacity-100 transition-opacity">
                            ${item.link_text} <span class="material-symbols-outlined text-sm">arrow_forward</span>
                        </span>
                    `;
                    grid.appendChild(card);
                });

                section.appendChild(grid);
                container.appendChild(section);
            });
        } catch (error) {
            console.error('Error cargando proyectos:', error);
            const container = document.getElementById('projects-container');
            if (container) container.innerHTML = '<p class="text-center text-error">Error al cargar los proyectos.</p>';
        }
    }

    loadProjects();
});
