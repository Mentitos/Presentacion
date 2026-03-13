document.addEventListener('DOMContentLoaded', () => {
    const modernApp = document.getElementById('modern-app');
    const terminalOverlay = document.getElementById('terminal-overlay');
    const btnOpenTerminal = document.getElementById('btn-terminal-mode');
    const btnCloseTerminal = document.getElementById('btn-close-terminal');

    btnOpenTerminal.addEventListener('click', () => {
        modernApp.style.display = 'none';
        terminalOverlay.style.display = 'flex';
        terminal.innerHTML = '';
        backgroundNoise.textContent = '';
        rebootButton.style.display = 'none';
        setupAudio();
        runPresentation();
    });

    btnCloseTerminal.addEventListener('click', () => {
        clearInterval(robotInterval);
        stopCrazyMode();
        if (keySoundOscillator) { try { keySoundOscillator.stop(); } catch (e) { } }

        terminalOverlay.style.display = 'none';
        modernApp.style.display = 'block';
    });


    const terminal = document.getElementById('terminal');
    const rebootButton = document.getElementById('reboot-button');
    const backgroundNoise = document.getElementById('background-noise');

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
});
