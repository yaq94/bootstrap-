function renderLiurenBoard(boardData, containerId) {
    const mainContainer = document.getElementById(containerId);
    if (!mainContainer) {
        console.error(`Main container with id ${containerId} not found.`);
        return;
    }

    // Clear previous content
    mainContainer.innerHTML = '';
     // Re-create the structure since innerHTML wipes it
    mainContainer.innerHTML = `
        <div id="board-meta" class="board-section"></div>
        <div id="board-plates" class="board-section"></div>
        <div id="board-lessons" class="board-section"></div>
        <div id="board-transmissions" class="board-section"></div>
        <div id="board-shas" class="board-section"></div>
    `;


    const { earthly_plate, heavenly_plate, heavenly_generals, lessons, transmissions, meta } = boardData;
    const shas = meta ? meta.shas : []; // Adapt to new data structure

    if (!earthly_plate || !heavenly_plate || !lessons || !transmissions) {
        console.error("Board data is incomplete.", boardData);
        mainContainer.innerHTML = '<p class="text-danger">课盘数据不完整，无法渲染。</p>';
        return;
    }
    
    // Render each part into its dedicated container
    renderPlates(earthly_plate, heavenly_plate, heavenly_generals, 'board-plates');
    renderLessons(lessons, 'board-lessons');
    renderTransmissions(transmissions, 'board-transmissions');
    renderShas(shas, 'board-shas');
    renderMeta(meta, 'board-meta');
}

function createSvgContainer(viewBox) {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("viewBox", viewBox);
    svg.setAttribute("class", "liuren-board-svg");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    return svg;
}


function renderPlates(earthly_plate, heavenly_plate, heavenly_generals, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const svg = createSvgContainer("0 0 300 300");
    svg.setAttribute("aria-label", "天地盘");

    const boardGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    boardGroup.setAttribute("transform", "translate(150, 150)");
    svg.appendChild(boardGroup);

    const plateRadius = 140;
    const center = { x: 0, y: 0 };

    // Earth Plate (地盘)
    const earthGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    earthGroup.setAttribute("class", "earth-plate plate-group");
    boardGroup.appendChild(earthGroup);
    earthly_plate.forEach((item, i) => {
        const angle = -90 + (i * 30);
        const textAngle = angle + 90;
        const x = center.x + (plateRadius - 20) * Math.cos(angle * Math.PI / 180);
        const y = center.y + (plateRadius - 20) * Math.sin(angle * Math.PI / 180);
        const textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textEl.setAttribute("x", x);
        textEl.setAttribute("y", y);
        textEl.setAttribute('id', `earth-plate-${item}`);
        textEl.setAttribute("text-anchor", "middle");
        textEl.setAttribute("dominant-baseline", "middle");
        textEl.setAttribute("transform", `rotate(${textAngle}, ${x}, ${y})`);
        textEl.textContent = item;
        textEl.setAttribute('data-tooltip-key', item);
        earthGroup.appendChild(textEl);
    });

    // Heaven Plate (天盘)
    const heavenGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    heavenGroup.setAttribute("class", "heaven-plate plate-group");
    boardGroup.appendChild(heavenGroup);
    heavenly_plate.forEach((item, i) => {
        const angle = -90 + (i * 30);
        const textAngle = angle + 90;
        const x = center.x + (plateRadius - 55) * Math.cos(angle * Math.PI / 180);
        const y = center.y + (plateRadius - 55) * Math.sin(angle * Math.PI / 180);
        const textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textEl.setAttribute("x", x);
        textEl.setAttribute("y", y);
        textEl.setAttribute('id', `heaven-plate-${item}`);
        textEl.setAttribute("text-anchor", "middle");
        textEl.setAttribute("dominant-baseline", "middle");
        textEl.setAttribute("transform", `rotate(${textAngle}, ${x}, ${y})`);
        textEl.textContent = item;
        textEl.setAttribute('data-tooltip-key', item);
        heavenGroup.appendChild(textEl);
    });

    // Heavenly Generals (天将)
    if (heavenly_generals && heavenly_generals.length > 0) {
        const generalsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
        generalsGroup.setAttribute("class", "heavenly-generals plate-group");
        boardGroup.appendChild(generalsGroup);
        heavenly_generals.forEach((item, i) => {
            const angle = -90 + (i * 30);
            const textAngle = angle + 90;
            const x = center.x + (plateRadius - 90) * Math.cos(angle * Math.PI / 180);
            const y = center.y + (plateRadius - 90) * Math.sin(angle * Math.PI / 180);
            const textEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
            textEl.setAttribute("x", x);
            textEl.setAttribute("y", y);
            textEl.setAttribute("class", "general");
            textEl.setAttribute("text-anchor", "middle");
            textEl.setAttribute("dominant-baseline", "middle");
            textEl.setAttribute("transform", `rotate(${textAngle}, ${x}, ${y})`);
            textEl.textContent = item;
            textEl.setAttribute('data-tooltip-key', item);
            generalsGroup.appendChild(textEl);
        });
    }

    // Draw circles
    for (let r of [plateRadius - 35, plateRadius - 70, plateRadius - 105]) {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", center.x);
        circle.setAttribute("cy", center.y);
        circle.setAttribute("r", r);
        circle.setAttribute("class", "plate-circle");
        boardGroup.appendChild(circle);
    }
    const outer_circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    outer_circle.setAttribute("cx", center.x);
    outer_circle.setAttribute("cy", center.y);
    outer_circle.setAttribute("r", plateRadius);
    outer_circle.setAttribute("class", "plate-circle-outer");
    boardGroup.appendChild(outer_circle);
    
    container.innerHTML = '';
    container.appendChild(svg);
}


function renderLessons(lessons, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const lessonNames = ["第一课 (日阳)", "第二课 (日阴)", "第三课 (辰阳)", "第四课 (辰阴)"];
    
    const title = document.createElement('h4');
    title.className = 'board-section-title';
    title.textContent = '四课';
    
    const content = document.createElement('div');
    content.className = 'lessons-content';

    lessons.forEach((lesson, i) => {
        const lessonDiv = document.createElement('div');
        lessonDiv.className = 'lesson-item';
        lessonDiv.id = lesson.id;
        if(lesson.reveals) {
            lessonDiv.setAttribute('data-reveals', JSON.stringify(lesson.reveals));
        }
        
        lessonDiv.innerHTML = `
            <div class="lesson-shen" data-tooltip-key="${lesson.shen}">${lesson.shen}</div>
            <div class="lesson-ganzhi" data-tooltip-key="${lesson.gan}">${lesson.gan}</div>
            <div class="lesson-ganzhi" data-tooltip-key="${lesson.zhi}">${lesson.zhi}</div>
            <div class="lesson-relation">${lessonNames[i]}</div>
        `;
        content.appendChild(lessonDiv);
    });
    
    container.innerHTML = '';
    container.appendChild(title);
    container.appendChild(content);
}


function renderTransmissions(transmissions, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const title = document.createElement('h4');
    title.className = 'board-section-title';
    title.textContent = '三传';

    const content = document.createElement('div');
    content.className = 'transmissions-content';

    transmissions.forEach((transmission, i) => {
        const transmissionDiv = document.createElement('div');
        transmissionDiv.className = 'transmission-item';
        transmissionDiv.id = transmission.id;

        transmissionDiv.innerHTML = `
            <div class="transmission-type" data-tooltip-key="${transmission.type}">${transmission.type}</div>
            <div class="transmission-shen" data-tooltip-key="${transmission.shen}">${transmission.shen}</div>
            <div class="transmission-zhi" data-tooltip-key="${transmission.zhi}">${transmission.zhi}</div>
        `;
        content.appendChild(transmissionDiv);
    });
    
    container.innerHTML = '';
    container.appendChild(title);
    container.appendChild(content);
}

function renderShas(shas, containerId) {
    const container = document.getElementById(containerId);
    if (!container || !shas || shas.length === 0) {
        if(container) container.style.display = 'none';
        return;
    };
    container.style.display = 'block';

    const title = document.createElement('h4');
    title.className = 'board-section-title';
    title.textContent = '神煞';

    const content = document.createElement('div');
    content.className = 'shas-content';

    shas.forEach(sha => {
        const shaSpan = document.createElement('span');
        shaSpan.className = 'sha-item';
        shaSpan.textContent = sha;
        shaSpan.setAttribute('data-tooltip-key', sha);
        content.appendChild(shaSpan);
    });

    container.innerHTML = '';
    container.appendChild(title);
    container.appendChild(content);
}

function renderMeta(meta, containerId) {
    const container = document.getElementById(containerId);
    if (!container || !meta) return;

    const content = `
        <div class="meta-grid">
            <div><strong>占事:</strong> ${meta.subject || 'N/A'}</div>
            <div><strong>占时:</strong> ${meta.datetime || 'N/A'}</div>
            <div><strong>月将:</strong> ${meta.month_general || 'N/A'}</div>
            <div><strong>空亡:</strong> ${meta.day_void || 'N/A'}</div>
        </div>
    `;

    container.innerHTML = content;
} 