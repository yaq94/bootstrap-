// js/cases.js
// This file will contain all the unique JavaScript logic for the interactive case studies page.

document.addEventListener('DOMContentLoaded', () => {
    const caseSelectorContainer = document.querySelector('.case-selector-container');
    const placeholder = document.querySelector('.case-card-placeholder');
    const prevCaseBtn = document.getElementById('prev-case');
    const nextCaseBtn = document.getElementById('next-case');
    const caseContentArea = document.getElementById('case-content-area');
    const unlockBtn = document.getElementById('unlock-outcome-btn');
    const outcomeContainer = document.getElementById('outcome-container');
    const outcomeTextEl = document.getElementById('outcome-text');

    let allCases = [];
    let currentIndex = 0;

    async function initialLoad() {
        try {
            const response = await fetch('data/cases.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            allCases = data.cases;

            if (allCases.length > 0) {
                if(placeholder) placeholder.remove();
                createCaseCards();
                displayCase(currentIndex); // Display the first case initially
            } else {
                if(placeholder) placeholder.innerHTML = '<p>没有可用的课例。</p>';
            }
        } catch (error) {
            console.error("无法加载课例数据:", error);
            if (placeholder) {
                placeholder.innerHTML = `<p class="text-danger">加载课例失败，请检查文件或网络连接。</p>`;
            }
        }
    }

    function createCaseCards() {
        // Clear existing cards first to prevent duplication on any potential re-run
        caseSelectorContainer.querySelectorAll('.case-card').forEach(card => card.remove());
        // Use insertAdjacentHTML for efficient card creation
        caseSelectorContainer.querySelector('.case-selector-nav').insertAdjacentHTML('beforebegin', 
            allCases.map((caseData, index) => `
                <div class="case-card" data-index="${index}">
                    <h3>${caseData.title}</h3>
                    <p>${caseData.description}</p>
                </div>
            `).join('')
        );
        updateCarousel();
    }
    
    function displayCase(index) {
        currentIndex = index;
        updateCarousel();

        const caseData = allCases[index];
        if (!caseData) return;

        console.log("Loading content for:", caseData.title);
        caseContentArea.classList.remove('d-none');
        
        // This function is now defined in js/board-renderer.js
        renderLiurenBoard(caseData.liuren_board, 'liuren-board-container');
        
        renderAnalysisSteps(caseData.analysis_steps);
        renderOutcome(caseData.outcome);

        // Reset outcome module state
        outcomeContainer.classList.add('outcome-blurred');
        unlockBtn.disabled = true;
        unlockBtn.textContent = '请先完成所有分析步骤';
        unlockBtn.style.display = 'block';

        // Scroll smoothly to the content area
        caseContentArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function updateCarousel() {
        const cards = document.querySelectorAll('.case-card');
        cards.forEach((card, index) => {
            card.classList.remove('active', 'prev', 'next', 'hidden');
            if (index === currentIndex) card.classList.add('active');
            else if (index === (currentIndex - 1 + allCases.length) % allCases.length) card.classList.add('prev');
            else if (index === (currentIndex + 1) % allCases.length) card.classList.add('next');
            else card.classList.add('hidden');
        });
    }

    function renderLiurenBoard(boardData, containerId) {
        const container = document.getElementById(containerId);
        container.innerHTML = ''; // Clear previous board

        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute('class', 'liuren-board-svg');
        svg.setAttribute('viewBox', '0 0 500 320');

        // 1. Render Plates (Heavenly and Earthly)
        const plateRadius = 80;
        const plateCenterX = 130;
        const plateCenterY = 160;

        // Earthly Plate
        const earthlyGroup = document.createElementNS(svgNS, 'g');
        earthlyGroup.setAttribute('class', 'earthly-plate');
        const earthlyCircle = document.createElementNS(svgNS, 'circle');
        earthlyCircle.setAttributes({ cx: plateCenterX, cy: plateCenterY, r: plateRadius, class: 'plate-circle' });
        earthlyGroup.appendChild(earthlyCircle);

        boardData.earthly_plate.forEach((palace, i) => {
            const angle = (i * -30) + 60; // Start from top and go clockwise
            const x = plateCenterX + plateRadius * Math.cos(angle * Math.PI / 180);
            const y = plateCenterY - plateRadius * Math.sin(angle * Math.PI / 180);
            const text = document.createElementNS(svgNS, 'text');
            text.setAttributes({ x, y, class: 'plate-text' });
            text.textContent = palace;
            earthlyGroup.appendChild(text);
        });

        // Heavenly Plate
        const heavenlyGroup = document.createElementNS(svgNS, 'g');
        heavenlyGroup.setAttribute('class', 'heavenly-plate');
        const heavenlyCircle = document.createElementNS(svgNS, 'circle');
        heavenlyCircle.setAttributes({ cx: plateCenterX, cy: plateCenterY, r: plateRadius - 25, class: 'plate-circle' });
        heavenlyGroup.appendChild(heavenlyCircle);

        boardData.heavenly_plate.forEach((palace, i) => {
            const angle = (i * -30) + 60;
            const x = plateCenterX + (plateRadius - 25) * Math.cos(angle * Math.PI / 180);
            const y = plateCenterY - (plateRadius - 25) * Math.sin(angle * Math.PI / 180);
            const text = document.createElementNS(svgNS, 'text');
            text.setAttributes({ x, y, class: 'plate-text' });
            text.textContent = palace;
            heavenlyGroup.appendChild(text);
        });

        svg.appendChild(earthlyGroup);
        svg.appendChild(heavenlyGroup);


        // 2. Render Lessons (Four Ke)
        const lessonsGroup = document.createElementNS(svgNS, 'g');
        lessonsGroup.setAttribute('class', 'lessons-group');
        boardData.lessons.forEach((lesson, i) => {
            const g = document.createElementNS(svgNS, 'g');
            g.setAttribute('class', 'lesson');
            g.setAttribute('id', lesson.id);

            const x = 270 + (i % 2) * 110;
            const y = 100 + Math.floor(i / 2) * 110;
            
            const rect = document.createElementNS(svgNS, 'rect');
            rect.setAttributes({ x, y, width: 80, height: 60, class: 'lesson-box'});
            
            const deityText = document.createElementNS(svgNS, 'text');
            deityText.setAttributes({ x: x + 40, y: y + 30, class: 'lesson-deity' });
            deityText.textContent = lesson.deity;
            
            const palaceText = document.createElementNS(svgNS, 'text');
            palaceText.setAttributes({ x: x + 40, y: y + 50, class: 'lesson-palace' });
            palaceText.textContent = lesson.palace;

            g.append(rect, deityText, palaceText);
            lessonsGroup.appendChild(g);
        });
        svg.appendChild(lessonsGroup);

        // 3. Render Transmissions (San Chuan)
        const transGroup = document.createElementNS(svgNS, 'g');
        transGroup.setAttribute('class', 'transmissions-group');
        boardData.transmissions.forEach((trans, i) => {
            const g = document.createElementNS(svgNS, 'g');
            g.setAttribute('class', 'transmission');
            g.setAttribute('id', trans.id);
            
            const x = 320;
            const y = 20 + i * 80;

            const rect = document.createElementNS(svgNS, 'rect');
            rect.setAttributes({ x, y, width: 80, height: 60, class: 'transmission-box'});

            const deityText = document.createElementNS(svgNS, 'text');
            deityText.setAttributes({ x: x + 40, y: y + 30, class: 'transmission-deity' });
            deityText.textContent = trans.deity;

            const palaceText = document.createElementNS(svgNS, 'text');
            palaceText.setAttributes({ x: x + 40, y: y + 50, class: 'transmission-palace' });
            palaceText.textContent = trans.palace;
            
            g.append(rect, deityText, palaceText);
            transGroup.appendChild(g);
        });
        // Reposition for better layout
        lessonsGroup.setAttribute('transform', 'translate(10, -80)');
        transGroup.setAttribute('transform', 'translate(40, 20)');

        svg.appendChild(transGroup);

        container.appendChild(svg);
        
        // Helper for setting multiple attributes
        Element.prototype.setAttributes = function (attrs) {
            for (var key in attrs) {
                this.setAttribute(key, attrs[key]);
            }
        };
    }

    function renderAnalysisSteps(steps) {
        const container = document.getElementById('analysis-steps-container');
        container.innerHTML = '';

        steps.forEach((step, stepIndex) => {
            const stepEl = document.createElement('div');
            stepEl.className = 'analysis-step';
            stepEl.innerHTML = `
                <h4>${step.title}</h4>
                <div class="interpretation"><p>${step.interpretation}</p></div>`;
            container.appendChild(stepEl);

            stepEl.addEventListener('click', () => {
                stepEl.classList.toggle('active');
                
                const activeSteps = container.querySelectorAll('.analysis-step.active');
                const elementsToHighlight = new Set();
                
                activeSteps.forEach(activeStep => {
                    // Find the index of the clicked step to get its data
                    const currentStepIndex = Array.from(container.children).indexOf(activeStep);
                    if (steps[currentStepIndex] && steps[currentStepIndex].focus_elements) {
                        steps[currentStepIndex].focus_elements.forEach(id => elementsToHighlight.add(id));
                    }
                });
                
                highlightBoardElements(Array.from(elementsToHighlight));
                checkCompletion(steps);
            });
        });
    }
    
    function highlightBoardElements(elementIds) {
        const svg = document.querySelector('.liuren-board-svg');
        if (!svg) return;

        // First, dim all elements that can be dimmed
        svg.querySelectorAll('.lesson, .transmission').forEach(el => el.classList.add('dimmed'));
        
        // If nothing should be highlighted, remove all dimming and exit
        if (elementIds.length === 0) {
            svg.querySelectorAll('.dimmed').forEach(el => el.classList.remove('dimmed'));
            return;
        }

        // Otherwise, "un-dim" the highlighted elements
        elementIds.forEach(id => {
            const elToHighlight = svg.querySelector(`#${id}`);
            if (elToHighlight) elToHighlight.classList.remove('dimmed');
        });
    }
    
    function checkCompletion(allSteps) {
        const activeSteps = document.querySelectorAll('.analysis-step.active');
        if (activeSteps.length === allSteps.length) {
            unlockBtn.disabled = false;
            unlockBtn.textContent = '所有步骤已阅，可揭晓结局';
        } else {
            unlockBtn.disabled = true;
            unlockBtn.textContent = '请先完成所有分析步骤';
        }
    }

    function renderOutcome(outcome) {
        outcomeTextEl.innerHTML = `<h4>占断结果</h4><p>${outcome}</p>`;
    }

    // --- Event Listeners ---
    
    prevCaseBtn.addEventListener('click', () => {
        const newIndex = (currentIndex - 1 + allCases.length) % allCases.length;
        displayCase(newIndex);
    });

    nextCaseBtn.addEventListener('click', () => {
        const newIndex = (currentIndex + 1) % allCases.length;
        displayCase(newIndex);
    });

    // Use event delegation for the cards
    caseSelectorContainer.addEventListener('click', (e) => {
        const card = e.target.closest('.case-card');
        if (card && card.dataset.index) {
            const newIndex = parseInt(card.dataset.index, 10);
            displayCase(newIndex);
        }
    });

    unlockBtn.addEventListener('click', () => {
        outcomeContainer.classList.remove('outcome-blurred');
        unlockBtn.style.display = 'none';
    });

    initialLoad();
});
