document.addEventListener('DOMContentLoaded', () => {
    const terminal = document.getElementById('terminal');
    const rebootButton = document.getElementById('reboot-button');
    const backgroundNoise = document.getElementById('background-noise');

    let audioCtx;
    let keySoundOscillator;
    let robotInterval;
    let crazyIntervals = [];
    const TYPING_SPEED = 15; // ¡Más rápido!

    // --- Configuración de Audio ---
    function setupAudio() {
        if (audioCtx) return;
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) { console.error("Web Audio API no es compatible."); }
    }

    function playKeySound() {
        if (!audioCtx) return;
        if (keySoundOscillator) { try { keySoundOscillator.stop(); } catch (e) {} }
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

    // --- Lógica de Animación ---
    const presentationLines = [
        { text: '> Cargando perfil...', delayAfter: 500 },
        { text: 'MATIAS GABRIEL TELLO', class: 'title-line', delayAfter: 800 },
        { text: '[QUERY]: Buscando credenciales...', class: 'query-line', delayAfter: 500 },
        { text: '[STATUS]: Técnico Informático (Graduado)', delayAfter: 300 },
        { text: '[ESTUDIANDO]: Lic. en Economía Industrial', delayAfter: 300 },
        { text: '[HOBBY]: ', delayAfter: 0 },
        { text: '<span class="glitch" data-text="PROGRAMAR POR DIVERSION">PROGRAMAR POR DIVERSION</span>', isHTML: true, noBreak: true, delayAfter: 800 },
        { text: '[PROYECTO_ACTUAL]: \'Finanzas Libre\' (App Móvil)', delayAfter: 300 },
        { text: '> <a href="https://github.com/Mentitos/finanzaslibre" target="_blank">[Ver GitHub]</a> > <a href="https://drive.google.com/drive/u/0/folders/1B1raOcchcyAkt_Jv80F6SJl3J1mk8eJC?hl=es" target="_blank">[Descargar APK]</a>', class: 'link-line', isHTML: true, delayAfter: 300 },
        { text: '[PROYECTO_WEB]: <a href="https://mentitos.github.io/materiasungsporcentaje/" target="_blank">Calculadora Progreso UNGS</a>', isHTML: true, delayAfter: 300 },
        { text: '[??]: <span class="loco">¡Fanático de la ayuda de las Clankers!</span><span class="dancing-robot"></span>', isHTML: true, delayAfter: 500, id: 'clankers-line' },
    ];

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    async function typeLine(p, line) {
        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        p.appendChild(cursor);
        if (line.isHTML) {
            await sleep(200);
            const content = document.createElement('span');
            content.innerHTML = line.text;
            p.insertBefore(content, cursor);
        } else {
            const text = line.text || '';
            for (const char of text) {
                playKeySound();
                const textNode = document.createTextNode(char);
                p.insertBefore(textNode, cursor);
                await sleep(TYPING_SPEED);
            }
        }
        cursor.style.display = 'none';
    }

    // --- MODO LOCO ---
    function startCrazyMode() {
        stopCrazyMode();
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789*&^%$#@!';
        const noiseInterval = setInterval(() => {
            let content = '';
            for (let i = 0; i < 5000; i++) {
                content += chars[Math.floor(Math.random() * chars.length)];
            }
            backgroundNoise.textContent = content;
        }, 100);

        const effectsInterval = setInterval(() => {
            const effect = Math.random();
            if (effect < 0.1) { // 10% de probabilidad de temblor
                document.body.classList.add('crazy-shake');
                setTimeout(() => document.body.classList.remove('crazy-shake'), 200);
            } else if (effect < 0.3) { // 20% de probabilidad de símbolo giratorio
                createSpinningSymbol();
            }
        }, 200); // Intervalo más rápido para más caos
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
        document.body.appendChild(symbol);
        setTimeout(() => {
            symbol.remove();
        }, 1500); // Coincide con la duración de la animación
    }

    function stopCrazyMode() {
        crazyIntervals.forEach(clearInterval);
        crazyIntervals = [];
        backgroundNoise.textContent = '';
    }

    async function runPresentation() {
        clearInterval(robotInterval);
        stopCrazyMode();
        rebootButton.style.display = 'none';
        terminal.innerHTML = '';
        let currentP = null;

        for (const line of presentationLines) {
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

        startCrazyMode();

        const finalCursorP = document.createElement('p');
        const finalCursor = document.createElement('span');
        finalCursor.className = 'cursor';
        finalCursorP.appendChild(finalCursor);
        terminal.appendChild(finalCursorP);
        rebootButton.style.display = 'block';
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
            const p = document.createElement('p');
            p.className = line.class;
            terminal.appendChild(p);
            await typeLine(p, line);
            await sleep(line.delayAfter);
        }

        playExplosionSound();
        const flash = document.createElement('div');
        flash.className = 'flash';
        document.body.appendChild(flash);
        document.body.classList.add('nuclear-shake');

        await sleep(1500);

        document.body.classList.remove('nuclear-shake');
        flash.remove();
        rebootButton.disabled = false;
        runPresentation();
    }

    rebootButton.addEventListener('click', startNuclearSequence);
    document.body.addEventListener('click', setupAudio, { once: true });

    runPresentation();
});
