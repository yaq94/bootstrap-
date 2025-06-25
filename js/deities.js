// All content will be replaced.

document.addEventListener('DOMContentLoaded', () => {

    /**
     * Fetches data and initializes all modules on the page.
     * Centralized error handling for fetch operation.
     */
    async function main() {
        try {
            const response = await fetch('data/deities.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // Initialize modules safely
            initializeCelestialWheel(data.heavenly_generals);
            initializeNarrative(data.monthly_generals);
            await initializeMatrix();

        } catch (error) {
            console.error("Failed to fetch or initialize page:", error);
            // Display a generic error on all modules if data fails
            document.body.innerHTML = `<div class="container text-center py-5"><p class="text-danger">页面核心数据加载失败，请检查网络连接或联系管理员。</p><p>${error}</p></div>`;
        }
    }

    /**
     * MODULE 2: Celestial Wheel
     * @param {Array} generals - Array of heavenly general objects.
     */
    function initializeCelestialWheel(generals = []) {
        const wheel = document.querySelector('.celestial-wheel');
        const detailPanel = document.querySelector('.celestial-detail-panel');
        if (!wheel || !detailPanel) return;

        wheel.innerHTML = ''; // Clear placeholders

        const detailContent = document.getElementById('celestial-detail-content');

        if (generals.length > 0) {
            updateDetailPanel(generals[0]); // Set initial state with the first general
        }

        const numGenerals = generals.length;
        const radius = wheel.offsetWidth / 2 * 0.85; // A little bit further out

        generals.forEach((general, i) => {
            const angle = (i / numGenerals) * 360;
            const rad = (angle - 90) * Math.PI / 180;
            const x = (wheel.offsetWidth / 2) + radius * Math.cos(rad);
            const y = (wheel.offsetHeight / 2) + radius * Math.sin(rad);

            const el = document.createElement('div');
            el.className = 'celestial-general';
            el.style.left = `${x}px`;
            el.style.top = `${y}px`;
            el.innerHTML = `<i class="bi ${general.icon}"></i><span>${general.name}</span>`;
            el.addEventListener('click', () => handleGeneralClick(general, angle));
            wheel.appendChild(el);
        });

        function handleGeneralClick(general, angle) {
            const rotationAngle = -angle;
            wheel.style.transform = `rotate(${rotationAngle}deg)`;

            const allGeneralElements = document.querySelectorAll('.celestial-general');
            allGeneralElements.forEach(el => {
                el.style.setProperty('--rotation-angle', rotationAngle);
            });
            updateDetailPanel(general);
        }

        function updateDetailPanel(general) {
            if (!detailContent) return;
            detailContent.style.opacity = 0;
            setTimeout(() => {
                detailContent.innerHTML = `
                    <h3 class="celestial-detail-name">${general.name} <small class="text-muted">${general.pinyin}</small></h3>
                    <div class="deity-meta mb-3">
                        <span class="badge rounded-pill bg-primary">${general.wuxing}</span>
                        <span class="badge rounded-pill bg-secondary">${general.yin_yang}</span>
                        <span class="badge rounded-pill bg-info text-dark">${general.category}</span>
                    </div>
                    <p class="celestial-detail-desc">${general.description}</p>
                `;
                detailContent.style.opacity = 1;
            }, 300);
        }
    }

    /**
     * MODULE 3: Monthly Generals Scrolling Narrative
     * @param {Array} generals - Array of monthly general objects.
     */
    function initializeNarrative(generals = []) {
        const container = document.querySelector('.narrative-scroll-container');
        const nav = document.querySelector('.narrative-nav');

        if (!container || !nav) return;

        container.innerHTML = '';
        nav.innerHTML = '';

        generals.forEach(general => {
            const section = document.createElement('div');
            section.className = 'narrative-section';
            section.id = `monthly-${general.id}`;
            
            // Create the card structure
            section.innerHTML = `
                <div class="narrative-card-inner">
                    <div class="narrative-card-front" style="background-image: url('${general.image_url}')">
                        <div class="narrative-content">
                            <h3>${general.name}</h3>
                            <p class="narrative-zodiac">( ${general.zodiac} )</p>
                            <p class="narrative-description">${general.summary}</p>
                        </div>
                    </div>
                    <div class="narrative-card-back">
                        <h4 class="mb-3">${general.name} <small class="text-muted">(${general.pinyin})</small></h4>
                        <div class="deity-meta mb-3">
                            <span class="badge rounded-pill bg-primary">${general.wuxing}</span>
                            <span class="badge rounded-pill bg-secondary">${general.yin_yang}</span>
                            <span class="badge rounded-pill bg-info text-dark">${general.category}</span>
                        </div>
                        <hr class="w-50 mx-auto">
                        <p>${general.description}</p>
                    </div>
                </div>
            `;
            
            // Click to scroll into view
            section.addEventListener('click', () => {
                section.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            });

            container.appendChild(section);

            const dot = document.createElement('span');
            dot.className = 'nav-dot';
            dot.dataset.target = `#monthly-${general.id}`;
            dot.addEventListener('click', () => document.querySelector(dot.dataset.target).scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }));
            nav.appendChild(dot);
        });

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const visibleId = entry.target.id;
                    nav.querySelectorAll('.nav-dot').forEach(dot => {
                        dot.classList.toggle('active', dot.dataset.target === `#${visibleId}`);
                    });
                }
            });
        }, { root: container, threshold: 0.6 });

        container.querySelectorAll('.narrative-section').forEach(section => observer.observe(section));
    }

    /**
     * MODULE 4: Dynamic Relationship Matrix
     * @param {Object} data - The entire deities data object.
     */
    async function initializeMatrix() {
        try {
            const [deitiesRes, interpretationsRes] = await Promise.all([
                fetch('data/deities.json'),
                fetch('data/matrix_content.json')
            ]);
            
            if (!deitiesRes.ok || !interpretationsRes.ok) {
                throw new Error('Failed to load matrix data');
            }

            const deitiesData = await deitiesRes.json();
            const interpretations = await interpretationsRes.json();
            
            setupMatrix(deitiesData, interpretations.interpretations);

        } catch (error) {
            console.error("Failed to initialize matrix:", error);
            const matrixContainer = document.getElementById('deities-matrix');
            if(matrixContainer) {
                matrixContainer.innerHTML = '<p class="text-danger text-center">关系矩阵模块加载失败。</p>';
            }
        }
    }

    function setupMatrix(data = {}, interpretations = {}) {
        const selector1 = document.getElementById('matrix-selector-1');
        const selector2 = document.getElementById('matrix-selector-2');
        const resultBox = document.querySelector('.matrix-result-box');
        const resultText = document.getElementById('matrix-result-text');
        
        const interpretationContainer = document.getElementById('matrix-interpretation-content');
        const titleEl = document.getElementById('interpretation-title');
        const summaryEl = document.getElementById('interpretation-summary');
        const detailsEl = document.getElementById('interpretation-details');
        const specificEl = document.getElementById('specific-analysis');

        if (!selector1 || !selector2 || !interpretationContainer) return;

        const allGenerals = [...(data.heavenly_generals || []), ...(data.monthly_generals || [])];
        if (allGenerals.length === 0) return;

        selector1.innerHTML = '<option value="">请选择神将...</option>';
        selector2.innerHTML = '<option value="">请选择神将...</option>';

        allGenerals.forEach(g => {
            const optionText = `${g.type_ch} - ${g.name} (${g.wuxing})`;
            selector1.add(new Option(optionText, g.id));
            selector2.add(new Option(optionText, g.id));
        });

        const updateMatrix = () => {
            resultText.classList.add('fade-out');
            interpretationContainer.style.display = 'none';
            interpretationContainer.style.opacity = 0;

            setTimeout(() => {
                const g1 = allGenerals.find(g => g.id === selector1.value);
                const g2 = allGenerals.find(g => g.id === selector2.value);

                if (!g1 || !g2) {
                    resultText.textContent = '请选择神将';
                    resultBox.className = 'matrix-result-box result-unknown';
                    resultText.classList.remove('fade-out');
                    return;
                }
    
                const wuxingMap = { '金': { '生': '水', '克': '木' }, '木': { '生': '火', '克': '土' }, '水': { '生': '木', '克': '火' }, '火': { '生': '土', '克': '金' }, '土': { '生': '金', '克': '水' }};
                let relKey = '', relText = '关系未明', css = 'unknown';

                if (g1 === g2) { 
                    relKey = 'wo_tong_ta'; 
                    relText = `${g1.name} 与自身比和`;
                    css = 'bihe';
                } else if (g1.wuxing === g2.wuxing) { 
                    relKey = 'wo_tong_ta';
                    relText = `${g1.name} 与 ${g2.name} 比和`; 
                    css = 'bihe';
                } else if (wuxingMap[g1.wuxing]?.['生'] === g2.wuxing) { 
                    relKey = 'wo_sheng_ta';
                    relText = `${g1.name} 生 ${g2.name}`; 
                    css = 'sheng';
                } else if (wuxingMap[g1.wuxing]?.['克'] === g2.wuxing) { 
                    relKey = 'wo_ke_ta';
                    relText = `${g1.name} 克 ${g2.name}`; 
                    css = 'ke';
                } else if (wuxingMap[g2.wuxing]?.['生'] === g1.wuxing) { 
                    relKey = 'ta_sheng_wo';
                    relText = `${g2.name} 生 ${g1.name}`;
                    css = 'sheng';
                } else if (wuxingMap[g2.wuxing]?.['克'] === g1.wuxing) { 
                    relKey = 'ta_ke_wo';
                    relText = `${g2.name} 克 ${g1.name}`;
                    css = 'ke';
                }
                
                resultText.textContent = relText;
                resultBox.className = `matrix-result-box result-${css}`;
                resultText.classList.remove('fade-out');

                const interpretation = interpretations[relKey];
                if (interpretation) {
                    titleEl.textContent = interpretation.title;
                    summaryEl.textContent = interpretation.summary;
                    detailsEl.textContent = interpretation.details;

                    // Assemble the specific analysis
                    specificEl.textContent = `在此组合中，象征"${g1.summary}"的【${g1.name}】(${g1.wuxing})，与象征"${g2.summary}"的【${g2.name}】(${g2.wuxing})相遇，构成了"${interpretation.title}"的格局。这通常预示着... (可根据神将特性进一步展开论述)`;

                    interpretationContainer.style.display = 'block';
                    setTimeout(() => {
                        interpretationContainer.style.opacity = 1;
                    }, 50); // Short delay to ensure display:block is applied before transition
                }

            }, 200);
        };

        selector1.addEventListener('change', updateMatrix);
        selector2.addEventListener('change', updateMatrix);
    }

    // Run the application
    main();
});
