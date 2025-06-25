document.addEventListener('DOMContentLoaded', () => {

    let liurenWorker;
    // 1. 初始化 Web Worker
    try {
        if (window.Worker) {
            liurenWorker = new Worker('js/worker.js?v=2.2');
            liurenWorker.onmessage = handleWorkerMessage;
            liurenWorker.onerror = handleWorkerError;
        } else {
            throw new Error("浏览器不支持 Web Worker。");
        }
    } catch (error) {
        console.error("Web Worker 初始化失败:", error);
        alert("排盘功能核心组件加载失败，请尝试刷新或更换现代浏览器。");
    }

    // 2. DOM 元素获取
    const generateBtn = document.getElementById('generate-chart');
    const dateTimeInput = document.getElementById('divination-datetime');
    const reasonInput = document.getElementById('divination-reason');
    
    const settingsPanel = document.querySelector('.settings-panel');
    const toggleSettingsBtn = document.getElementById('toggle-settings-btn');

    const mainContent = document.querySelector('.main-content');
    const placeholder = document.querySelector('.placeholder-content');
    const resultsContainer = document.getElementById('results-container');

    const infoPanel = document.querySelector('.info-panel');
    const infoPanelCloseBtn = document.getElementById('info-panel-close');
    const infoPanelBody = document.getElementById('info-panel-body');

    // 4. 数据存储
    let deitiesData = {}; // 用于存储天将、神煞等的详细释义
    let interpretationsData = {}; // 用于存储课体、关系等释义

    // 3. 事件监听
    generateBtn.addEventListener('click', generateChart);
    toggleSettingsBtn.addEventListener('click', () => settingsPanel.classList.remove('collapsed'));
    infoPanelCloseBtn.addEventListener('click', closeInfoPanel);

    /**
     * 初始化函数
     */
    function initialize() {
        // 设置当前时间为默认值
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        dateTimeInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
        
        // 用于测试信息面板的临时代码
        mainContent.addEventListener('click', (e) => {
            if (e.target.classList.contains('placeholder-content')) {
                 openInfoPanel({title: '测试面板', content: '这是一个测试内容，证明面板可以被打开。'});
            }
        });
        
        // 预加载释义数据
        loadDeitiesData();
        loadInterpretationsData();

        // 初始化悬浮导航栏/页脚功能
        initializeHoverBars();
    }

    /**
     * 初始化悬浮导航栏/页脚功能
     */
    function initializeHoverBars() {
        const header = document.querySelector('header');
        const footer = document.querySelector('footer');
        const headerTrigger = document.getElementById('header-trigger');
        const footerTrigger = document.getElementById('footer-trigger');

        let headerTimeout;
        let footerTimeout;
        const HIDE_DELAY = 200; // 延迟隐藏的时间(毫秒)

        if (header && headerTrigger) {
            const showHeader = () => {
                clearTimeout(headerTimeout);
                header.classList.add('is-visible');
            };
            const hideHeader = () => {
                headerTimeout = setTimeout(() => {
                    header.classList.remove('is-visible');
                }, HIDE_DELAY);
            };

            headerTrigger.addEventListener('mouseenter', showHeader);
            header.addEventListener('mouseenter', showHeader);
            
            headerTrigger.addEventListener('mouseleave', hideHeader);
            header.addEventListener('mouseleave', hideHeader);
        }

        if (footer && footerTrigger) {
             const showFooter = () => {
                clearTimeout(footerTimeout);
                footer.classList.add('is-visible');
            };
            const hideFooter = () => {
                footerTimeout = setTimeout(() => {
                    footer.classList.remove('is-visible');
                }, HIDE_DELAY);
            };

            footerTrigger.addEventListener('mouseenter', showFooter);
            footer.addEventListener('mouseenter', showFooter);

            footerTrigger.addEventListener('mouseleave', hideFooter);
            footer.addEventListener('mouseleave', hideFooter);
        }
    }

    /**
     * 异步加载天将等神煞的释义数据
     */
    async function loadDeitiesData() {
        try {
            const response = await fetch('data/deities.json?v=2.2');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            // 将数据处理成更容易按名称查找的格式
            deitiesData.heavenly_generals = data.heavenly_generals.reduce((acc, item) => {
                acc[item.name] = item;
                return acc;
            }, {});
            deitiesData.monthly_generals = data.monthly_generals.reduce((acc, item) => {
                acc[item.zodiac] = item; // 按地支索引月将
                return acc;
            }, {});
            console.log("Deities data loaded and processed.");
        } catch (e) {
            console.error("无法加载神将释义数据:", e);
        }
    }

    /**
     * 异步加载课体等释义数据
     */
    async function loadInterpretationsData() {
        try {
            const response = await fetch('data/interpretations.json?v=2.2');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            interpretationsData = await response.json();
            console.log("Interpretations data loaded.");
        } catch (e) {
            console.error("无法加载课体释义数据:", e);
        }
    }

    /**
     * 主函数：点击"一键排盘"
     */
    function generateChart() {
        if (!liurenWorker) {
            alert("排盘功能尚未准备就绪，请稍后重试。");
            return;
        }

        const date = dateTimeInput.value ? new Date(dateTimeInput.value) : new Date();
        
        // 显示加载状态
        placeholder.classList.add('d-none');
        resultsContainer.classList.add('d-none');
        resultsContainer.innerHTML = ''; // 清空旧结果
        mainContent.insertAdjacentHTML('afterbegin', '<div class="loading-spinner"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>');

        // 发送消息到 Worker
        liurenWorker.postMessage({ date: date.toISOString() });

        // 收起设置面板
        settingsPanel.classList.add('collapsed');
    }

    /**
     * 接收 Worker 返回的消息
     * @param {MessageEvent} e 
     */
    function handleWorkerMessage(e) {
        const panData = e.data;
        console.log("收到来自 Worker 的数据:", panData); // 调试：打印从 worker 收到的完整数据
        const resultsContainer = document.getElementById('results-container');
        const infoPanel = document.getElementById('info-panel');
        const settingsPanel = document.getElementById('settings-panel');

        // 移除加载状态
        const spinner = mainContent.querySelector('.loading-spinner');
        if (spinner) {
            spinner.remove();
        }

        // 渲染结果
        renderResults(panData);
    }
    
    /**
     * 处理 Worker 错误
     * @param {ErrorEvent} e 
     */
    function handleWorkerError(e) {
        console.error('Worker Error:', e);
        alert(`排盘计算时发生错误: ${e.message}`);
         const spinner = mainContent.querySelector('.loading-spinner');
        if (spinner) {
            spinner.remove();
        }
        placeholder.classList.remove('d-none');
    }

    /**
     * 渲染结果
     * @param {object} data 
     */
    function renderResults(data) {
        // 隐藏占位符，显示结果容器
        placeholder.classList.add('d-none');
        resultsContainer.classList.remove('d-none');
        resultsContainer.innerHTML = ''; // 清空旧结果

        // 准备一个对象来存放所有模块的HTML
        const htmlModules = {
            judgement: renderJudgement(data),
            sike: renderSike(data),
            sanchuan: renderSanchuan(data),
            tiandiPan: renderTiandiPan(data),
            shensha: renderShensha(data)
        };
        
        // 使用我们新的HTML骨架来组装最终的视图
        resultsContainer.innerHTML = `
            <div class="grid-item judgement-container">${htmlModules.judgement}</div>
            <div class="grid-item sike-container">${htmlModules.sike}</div>
            <div class="grid-item sanchuan-container">${htmlModules.sanchuan}</div>
            <div class="grid-item tiandi-pan-container">${htmlModules.tiandiPan}</div>
            <div class="grid-item shensha-container">${htmlModules.shensha}</div>
        `;

        // 依次播放入场动画
        document.querySelectorAll('.grid-item').forEach((item, index) => {
            setTimeout(() => {
                item.classList.add('visible');
            }, index * 100); // 每个模块延迟100ms
        });

        // 为新生成的元素添加交互事件
        addResultInteractivity(data);
    }

    /**
     * 渲染课体总览模块
     */
    function renderJudgement(data) {
        const { threeTransmissions, siZhu } = data;
        const ketiName = threeTransmissions.type || '未知课体';
        return `
            <div class="result-module">
                <h6 class="module-title" data-type="keti" data-id="${ketiName}">课体总览</h6>
                <div class="judgement-body" data-type="keti" data-id="${ketiName}">
                    <p class="ket-name">${ketiName}</p>
                    <p class="ket-summary">月将: ${siZhu.monthlyGeneral} / 占时: ${siZhu.hourBranch}时</p>
                </div>
            </div>
        `;
    }

    /**
     * 渲染四课模块
     */
    function renderSike(data) {
        const { fourLessons } = data;
        const lessonTitles = ['日干', '干阳', '日支', '支阴'];
        let lessonsHtml = fourLessons.map((lesson, index) => `
            <div class="sike-lesson" 
                 data-type="sike-lesson" 
                 data-id="${lessonTitles[index]}" 
                 data-upper="${lesson.upper}" 
                 data-lower="${lesson.lower}">
                <div class="sike-gods">
                    <span class="sike-upper" data-type="dizhi" data-id="${lesson.upper}">${lesson.upper}</span>
                    <span class="sike-lower" data-type="dizhi" data-id="${lesson.lower}">${lesson.lower}</span>
                </div>
                <div class="sike-title">${lessonTitles[index]}</div>
            </div>
        `).join('');

        return `
            <div class="result-module">
                <h6 class="module-title">四课</h6>
                <div class="sike-body">${lessonsHtml}</div>
            </div>
        `;
    }

    /**
     * 渲染三传模块
     */
    function renderSanchuan(data) {
        const { threeTransmissions, heavenlyGenerals, plates } = data;
        if (!threeTransmissions || !threeTransmissions.initial) {
            return `<div class="result-module"><h6 class="module-title">三传</h6><div class="sanchuan-body"><p class="text-muted small">此课为${threeTransmissions.type}，无三传。</p></div></div>`;
        }
        const transmissions = [threeTransmissions.initial, threeTransmissions.middle, threeTransmissions.final];
        const transmissionNames = ['初传', '中传', '末传'];
        
        let transmissionsHtml = transmissions.map((branch, index) => {
            if (!branch) return '';
            const general = heavenlyGenerals[branch] || ' ';
            const earthBranch = plates.earth[plates.heaven.indexOf(branch)];
            return `
                <div class="sanchuan-item">
                    <div class="sanchuan-title" 
                         data-type="sanchuan-title"
                         data-id="${transmissionNames[index]}"
                         data-general="${general}"
                         data-heaven="${branch}"
                         data-earth="${earthBranch}">${transmissionNames[index]}</div>
                    <div class="sanchuan-gods">
                        <span class="sanchuan-general" data-type="tianjiang" data-id="${general}">${general}</span>
                        <span class="sanchuan-heaven" data-type="dizhi" data-id="${branch}">${branch}</span>
                        <span class="sanchuan-earth" data-type="dizhi" data-id="${earthBranch}">${earthBranch}</span>
                    </div>
                </div>
            `;
        }).join('<div class="sanchuan-arrow">→</div>');
        
        return `
            <div class="result-module">
                <h6 class="module-title">三传</h6>
                <div class="sanchuan-body">${transmissionsHtml}</div>
            </div>
        `;
    }

    /**
     * 渲染天地盘模块 (SVG圆形方案)
     */
    function renderTiandiPan(data) {
        const { plates, heavenlyGenerals } = data;
        const DIZHI_ARR = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
        const DIZHI_INDEX = DIZHI_ARR.reduce((acc, current, index) => {
            acc[current] = index;
            return acc;
        }, {});

        const size = 300; // SVG画布大小
        const center = size / 2;
        const earthRadius = 130;
        const heavenRadius = 100;
        const generalRadius = 70;

        let svgContent = `<svg width="100%" height="100%" viewBox="0 0 ${size} ${size}" class="pan-svg">`;
        
        // 绘制同心圆参考线 (可选，用于美观)
        svgContent += `<circle cx="${center}" cy="${center}" r="${earthRadius}" class="pan-circle"/>`;
        svgContent += `<circle cx="${center}" cy="${center}" r="${heavenRadius}" class="pan-circle"/>`;
        svgContent += `<circle cx="${center}" cy="${center}" r="${generalRadius}" class="pan-circle"/>`;
        svgContent += `<circle cx="${center}" cy="${center}" r="30" class="pan-center-circle"/>`;
        svgContent += `<text x="${center}" y="${center}" class="pan-center-text">天心</text>`;

        // 绘制十二宫地支
        for (let i = 0; i < 12; i++) {
            const angle = -90 + (i * 30); // 0度在正上方
            const rad = angle * (Math.PI / 180);
            const x = center + earthRadius * Math.cos(rad);
            const y = center + earthRadius * Math.sin(rad);
            const dizhi = DIZHI_ARR[i];
            
            const heavenBranchOnTop = plates.heaven[DIZHI_INDEX[dizhi]];
            const generalOnTop = heavenlyGenerals[heavenBranchOnTop] || '';

            const h_x = center + heavenRadius * Math.cos(rad);
            const h_y = center + heavenRadius * Math.sin(rad);
            
            const g_x = center + generalRadius * Math.cos(rad);
            const g_y = center + generalRadius * Math.sin(rad);

            // Group for each palace
            svgContent += `
                <g class="palace-group" data-dizhi="${dizhi}" data-tianpan="${heavenBranchOnTop}" data-tianjiang="${generalOnTop}">
                    <text x="${x}" y="${y}" class="pan-text earth-text" data-type="dizhi" data-id="${dizhi}">${dizhi}</text>
                    <text x="${h_x}" y="${h_y}" class="pan-text heaven-text" data-type="dizhi" data-id="${heavenBranchOnTop}">${heavenBranchOnTop}</text>
                    <text x="${g_x}" y="${g_y}" class="pan-text general-text" data-type="tianjiang" data-id="${generalOnTop}">${generalOnTop}</text>
                </g>
            `;
        }

        svgContent += `</svg>`;
        
        return `
             <div class="result-module tiandi-pan-module">
                <h6 class="module-title">天地盘</h6>
                <div class="tiandi-pan-body svg-pan-container">${svgContent}</div>
            </div>
        `;
    }

    /**
     * 渲染神煞模块
     */
    function renderShensha(data) {
        const { shenSha } = data;
        let shenshaHtml = Object.entries(shenSha).map(([name, value]) => `
            <div class="shensha-item" data-type="shensha" data-id="${name}">
                <span class="shensha-name">${name}</span>
                <span class="shensha-value" data-type="dizhi" data-id="${value}">${value}</span>
            </div>
        `).join('');

        return `
            <div class="result-module">
                <h6 class="module-title">神煞</h6>
                <div class="shensha-body">${shenshaHtml}</div>
            </div>
        `;
    }
    
    /**
     * 为结果模块添加交互 (待办)
     */
    function addResultInteractivity(data) {
        resultsContainer.addEventListener('click', (e) => {
            const targetElement = e.target.closest('[data-type]');
            if (!targetElement) return;

            const { type, id } = targetElement.dataset;
            console.log(`Clicked on: type=${type}, id=${id}`);
            
            let info = { title: `详解: ${id}`, tabs: [] };

            // 构建"基本释义"标签页内容
            let basicContent = '<p>暂无详细释义。</p>';
            if (type === 'tianjiang' && id && deitiesData.heavenly_generals && deitiesData.heavenly_generals[id]) {
                const d = deitiesData.heavenly_generals[id];
                info.title = `天将 · ${d.name}`;
                basicContent = `<p class="mb-2"><strong>${d.summary}</strong></p><p>${d.description}</p><p class="small text-muted mt-3">五行: ${d.wuxing} | 阴阳: ${d.yin_yang}</p>`;
            } else if (type === 'dizhi' && id && deitiesData.monthly_generals && deitiesData.monthly_generals[id]) {
                const d = deitiesData.monthly_generals[id];
                info.title = `地支 · ${id} (${d.name})`;
                basicContent = `<p class="mb-2"><strong>${d.summary}</strong></p><p>${d.description}</p><p class="small text-muted mt-3">五行: ${d.wuxing} | 阴阳: ${d.yin_yang}</p>`;
            } else if (type === 'sanchuan-title') {
                const { id, general, heaven, earth } = targetElement.dataset;
                info.title = `三传 · ${id}`;
                let explanation = '';
                if (id === '初传') {
                    explanation = '<strong>初传</strong>代表事情的开端、初始阶段。它是事件发展的第一个关键环节，通常反映了事情的起因或最早出现的变化。';
                } else if (id === '中传') {
                    explanation = '<strong>中传</strong>代表事情的中间过程、发展阶段。它承上启下，是事件演变的核心部分，反映了事情的主要矛盾和胶着状态。';
                } else if (id === '末传') {
                    explanation = '<strong>末传</strong>代表事情的最终结果、归宿阶段。它揭示了事件的结局和未来的走向，是判断最终吉凶成败的关键所在。';
                }
                
                basicContent = `
                    <p class="mb-2"><strong>名称:</strong> ${id}</p>
                    <p><strong>天将:</strong> <span class="interactive-text" data-type="tianjiang" data-id="${general}">${general}</span></p>
                    <p><strong>天盘:</strong> <span class="interactive-text" data-type="dizhi" data-id="${heaven}">${heaven}</span></p>
                    <p><strong>地盘:</strong> <span class="interactive-text" data-type="dizhi" data-id="${earth}">${earth}</span></p>
                    <hr>
                    <p class="small text-muted">${explanation}</p>
                `;
            } else if (type === 'sike-lesson') {
                const { id, upper, lower } = targetElement.dataset;
                info.title = `四课 · ${id}`;
                basicContent = `
                    <p class="mb-2"><strong>课名:</strong> ${id}</p>
                    <p><strong>天盘 (上神):</strong> <span class="interactive-text" data-type="dizhi" data-id="${upper}">${upper}</span></p>
                    <p><strong>地盘 (下神):</strong> <span class="interactive-text" data-type="dizhi" data-id="${lower}">${lower}</span></p>
                    <hr>
                    <p class="small text-muted">
                        此为<strong>${id}</strong>课，它反映了事情在此方面的基本情况。<br>
                        上神为天盘十二支，代表动态、天时、外部因素；<br>
                        下神为地盘十二支，代表静态、地利、内部基础。<br>
                        通过分析上神与下神之间的五行生克关系，可以初步判断此事的吉凶趋势。
                    </p>
                `;
            } else if (type === 'keti' && id && interpretationsData.keti && interpretationsData.keti[id.trim()]) {
                const d = interpretationsData.keti[id.trim()];
                info.title = `课体 · ${d.name}`;
                basicContent = `<p class="mb-2"><strong>${d.summary}</strong></p><p><strong>判断: </strong>${d.condition}</p><hr><p>${d.interpretation}</p><blockquote class="blockquote-footer mt-3">${d.poem}</blockquote>`;
            } else if (type === 'shensha' && id && interpretationsData.shensha && interpretationsData.shensha[id]) {
                const d = interpretationsData.shensha[id];
                info.title = `神煞 · ${d.name}`;
                basicContent = `<p class="mb-2"><strong>${d.summary}</strong></p><p>${d.interpretation}</p><p class="small text-muted mt-3"><strong>查找规则:</strong> ${d.location_rule}</p>`;
            } else if (targetElement.parentElement.classList.contains('judgement-body')) {
                const ketiId = targetElement.parentElement.dataset.id;
                if (ketiId && interpretationsData.keti[ketiId.trim()]) {
                    const d = interpretationsData.keti[ketiId.trim()];
                    info.title = `课体 · ${d.name}`;
                    basicContent = `<p class="mb-2"><strong>${d.summary}</strong></p><p><strong>判断: </strong>${d.condition}</p><hr><p>${d.interpretation}</p><blockquote class="blockquote-footer mt-3">${d.poem}</blockquote>`;
                    info.tabs.push({ title: '基本释义', content: basicContent });
                    openInfoPanel(info);
                    return; // 提前返回，避免重复处理
                }
            }
            info.tabs.push({ title: '基本释义', content: basicContent });

            // 如果是地支，添加"关系网络"标签页
            if (type === 'dizhi' && interpretationsData.relationships && interpretationsData.relationships.dizhi[id]) {
                
                // 1. 收集盘面上的所有地支，以便高亮
                const panDizhi = new Set();
                data.fourLessons.forEach(lesson => {
                    panDizhi.add(lesson.upper);
                    panDizhi.add(lesson.lower);
                });
                if (data.threeTransmissions && data.threeTransmissions.initial) {
                    panDizhi.add(data.threeTransmissions.initial);
                    panDizhi.add(data.threeTransmissions.middle);
                    panDizhi.add(data.threeTransmissions.final);
                }

                // 2. 构建关系图HTML
                const relations = interpretationsData.relationships.dizhi[id];
                let graphHtml = '<div class="relation-graph">';
                
                const relationMap = {
                    'chong': '六冲',
                    'he': '六合',
                    'sanhe': '三合'
                };

                for (const [key, value] of Object.entries(relations)) {
                    const label = relationMap[key] || key;
                    if (Array.isArray(value)) { // 处理三合
                        value.forEach(node => {
                            const isHighlighted = panDizhi.has(node);
                            graphHtml += `
                                <div class="relation-item ${isHighlighted ? 'highlight' : ''}">
                                    <span class="relation-label">${label}</span>
                                    <span class="relation-node">${node}</span>
                                </div>
                            `;
                        });
                    } else { // 处理冲、合
                        const isHighlighted = panDizhi.has(value);
                        graphHtml += `
                            <div class="relation-item ${isHighlighted ? 'highlight' : ''}">
                                <span class="relation-label">${label}</span>
                                <span class="relation-node">${value}</span>
                            </div>
                        `;
                    }
                }
                graphHtml += '</div>';

                info.tabs.push({ title: '关系网络', content: graphHtml });
            }
            
            openInfoPanel(info);
        });

        document.querySelectorAll('.palace-group').forEach(group => {
            group.addEventListener('mouseenter', (e) => {
                e.currentTarget.classList.add('highlight');
            });
            group.addEventListener('mouseleave', (e) => {
                e.currentTarget.classList.remove('highlight');
            });
        });
    }

    /**
     * 打开信息面板 (升级版，支持标签页)
     * @param {object} info - {title: string, tabs: [{title: string, content: string}]}
     */
    function openInfoPanel(info) {
        let tabButtons = '';
        let tabPanes = '';

        info.tabs.forEach((tab, index) => {
            const isActive = index === 0 ? 'active' : '';
            tabButtons += `<button class="info-panel-tab ${isActive}" data-tab="tab-${index}">${tab.title}</button>`;
            tabPanes += `<div class="info-panel-content-pane ${isActive}" id="tab-${index}">${tab.content}</div>`;
        });

        infoPanelBody.innerHTML = `
            <h5>${info.title}</h5>
            <div class="info-panel-tabs">${tabButtons}</div>
            <div class="info-panel-content-container">${tabPanes}</div>
        `;

        // 为新生成的标签页按钮添加事件监听
        infoPanelBody.querySelectorAll('.info-panel-tab').forEach(button => {
            button.addEventListener('click', (e) => {
                // 移除所有按钮和面板的 active 类
                infoPanelBody.querySelectorAll('.info-panel-tab').forEach(btn => btn.classList.remove('active'));
                infoPanelBody.querySelectorAll('.info-panel-content-pane').forEach(pane => pane.classList.remove('active'));

                // 为被点击的按钮和对应的内容面板添加 active 类
                const tabId = e.currentTarget.dataset.tab;
                e.currentTarget.classList.add('active');
                infoPanelBody.querySelector(`#${tabId}`).classList.add('active');
            });
        });
        
        infoPanel.classList.add('is-open');
    }

    /**
     * 关闭信息面板
     */
    function closeInfoPanel() {
        infoPanel.classList.remove('is-open');
    }

    // 启动！
    initialize();
});
