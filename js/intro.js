// JavaScript for intro.html
document.addEventListener('DOMContentLoaded', () => {

    // New logic for the vertical scroll timeline
    const timelinePanesScroll = document.querySelectorAll('.timeline-pane-scroll');
    const axisDots = document.querySelectorAll('.axis-dot');

    const observerOptions = {
        root: null, // relative to document viewport 
        rootMargin: '-40% 0px -60% 0px', // trigger when pane is in the vertical center
        threshold: 0
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetId = entry.target.id;

                // Activate corresponding dot
                axisDots.forEach(dot => {
                    dot.classList.toggle('is-active', dot.dataset.target === targetId);
                });

                // Activate pane
                entry.target.classList.add('is-active');
            } else {
                 entry.target.classList.remove('is-active');
            }
        });
    }, observerOptions);

    timelinePanesScroll.forEach(pane => {
        observer.observe(pane);
    });


    // Logic for the interactive fans
    const fanItems = document.querySelectorAll('.fan-item');
    fanItems.forEach(item => {
        item.querySelector('.fan-handle').addEventListener('click', () => {
            const isOpening = !item.classList.contains('open');
            
            // Close all other fans
            fanItems.forEach(otherItem => {
                otherItem.classList.remove('open');
            });

            // Open the clicked one if it wasn't already open
            if (isOpening) {
                item.classList.add('open');
            }
        });
    });

    // --- Wuxing (Five Elements) Interaction Logic ---
    const wuxingData = {
        mu: {
            name: "木",
            sheng: { target: 'huo', text: '木生火：木材燃烧生火，象征创造与新生。' },
            ke: { target: 'tu', text: '木克土：树木扎根于土，代表克服与约束。' },
            cheng: { target: 'tu', text: '相乘：木气过旺，则过度克伐土，使土崩解。' },
            wu: { target: 'jin', text: '相侮：木气强盛，能反克强金，使金器钝卷。' },
            info: {
                类象: '东方, 春季, 酸味, 仁德, 肝胆, 文化, 教育, 林业, 青色。',
                旺相: '春旺, 夏相, 四季休, 秋囚, 冬死。',
                辩证: '水能生木，水多木漂；金能克木，木坚金缺。'
            }
        },
        huo: {
            name: "火",
            sheng: { target: 'tu', text: '火生土：燃烧后化为灰土，象征转化与孕育。' },
            ke: { target: 'jin', text: '火克金：烈火熔化金属，代表变革与重塑。' },
            cheng: { target: 'jin', text: '相乘：火气过旺，则过度熔炼金，使其消融。' },
            wu: { target: 'shui', text: '相侮：火气强盛，能反蒸干水，使水沸腾。' },
            info: {
                类象: '南方, 夏季, 苦味, 礼德, 心脏, 能源, 电子, 娱乐, 红色。',
                旺相: '夏旺, 四季相, 秋休, 冬囚, 春死。',
                辩证: '木能生火，木多火塞；水能克火，火旺水干。'
            }
        },
        tu: {
            name: "土",
            sheng: { target: 'jin', text: '土生金：大地孕育矿物，象征承载与收获。' },
            ke: { target: 'shui', text: '土克水：堤坝阻挡洪水，代表稳定与规范。' },
            cheng: { target: 'shui', text: '相乘：土气过旺，则过度壅塞水，使其不流。' },
            wu: { target: 'mu', text: '相侮：土气强盛，能反使木折，所谓"土多木折"。' },
            info: {
                类象: '中央, 四季, 甘味, 信德, 脾胃, 建筑, 农业, 地产, 黄色。',
                旺相: '四季旺, 秋相, 冬休, 春囚, 夏死。',
                辩证: '火能生土，火多土焦；木能克土，木强土陷。'
            }
        },
        jin: {
            name: "金",
            sheng: { target: 'shui', text: '金生水：金属表面凝露，象征凝聚与净化。' },
            ke: { target: 'mu', text: '金克木：斧斤砍伐树木，代表收割与规则。' },
            cheng: { target: 'mu', text: '相乘：金气过旺，则过度砍伐木，使其凋零。' },
            wu: { target: 'huo', text: '相侮：金气强盛，能反扑灭火，所谓"金多火熄"。' },
            info: {
                类象: '西方, 秋季, 辛味, 义德, 肺腑, 金融, 机械, 军事, 白色。',
                旺相: '秋旺, 冬相, 春休, 夏囚, 四季死。',
                辩证: '土能生金，土多金埋；火能克金，火旺金熔。'
            }
        },
        shui: {
            name: "水",
            sheng: { target: 'mu', text: '水生木：雨露滋养树木，象征润泽与生长。' },
            ke: { target: 'huo', text: '水克火：大水熄灭烈焰，代表压制与平衡。' },
            cheng: { target: 'huo', text: '相乘：水气过旺，则过度熄灭火，使其不燃。' },
            wu: { target: 'tu', text: '相侮：水气强盛，能反冲垮土，所谓"水多土荡"。' },
            info: {
                类象: '北方, 冬季, 咸味, 智德, 肾脏, 运输, 水利, 智慧, 黑色。',
                旺相: '冬旺, 春相, 夏休, 四季囚, 秋死。',
                辩证: '金能生水，金多水浊；土能克水，土厚水塞。'
            }
        }
    };

    const svg = document.getElementById('wuxing-svg');
    const infoPanel = document.getElementById('wuxing-info-panel');
    const infoTitle = document.getElementById('wuxing-info-title');
    const infoContent = document.getElementById('wuxing-info-content');
    const controls = document.getElementById('wuxing-controls');
    
    let currentRelation = 'sheng';
    let activeElementId = null;

    const globalRelationInfo = {
        sheng: {
            title: '相生循环 - 创造与滋养',
            text: '相生，是五行之间相互促进、相互滋养的关系，如同母亲孕育子女。它代表了宇宙中一切事物的创造、生长和发展的过程，形成一个生生不息、循环不绝的能量链条。'
        },
        ke: {
            title: '相克循环 - 平衡与约束',
            text: '相克，是五行之间相互制约、相互克服的关系。它并非单纯的压迫，而是维持事物健康发展的必要平衡机制，防止任何一方过度生长而导致系统崩溃。'
        },
        cheng: {
            title: '相乘 - 过度的克伐',
            text: '相乘，是相克的极端化表现。当五行中的某一行过分强盛，它对所克之行的制约就会超出正常范围，如同暴雨摧毁庄稼，是一种具有破坏性的关系。'
        },
        wu: {
            title: '相侮 - 反向的克制',
            text: '相侮，又称反克，是指五行中的某一行过于强盛，以至于它能够反过来克制原本克制它的那一行，如同水能克火，但火势太盛亦可将水烧干。这代表了力量失衡下的逆转现象。'
        }
    };

    function updateWuxingView() {
        // 1. Reset all paths to their default state by removing active classes.
        svg.querySelectorAll('.sheng-cycle, .ke-cycle').forEach(el => el.classList.remove('sheng-active', 'ke-active'));
        // 2. Reset all nodes.
        svg.querySelectorAll('.element-node').forEach(el => el.classList.remove('active'));

        // Determine the class to apply based on the current relation.
        const activeClass = (currentRelation === 'sheng') ? 'sheng-active' : 'ke-active';

        // Global view: An element is NOT selected
        if (!activeElementId) {
            svg.querySelectorAll(`.sheng-cycle, .ke-cycle`).forEach(path => {
                const [type, source, target] = path.id.split('-');
                if (wuxingData[source] && wuxingData[source][currentRelation] && wuxingData[source][currentRelation].target === target) {
                     path.classList.add(activeClass);
                }
            });
        } 
        // Element-specific view
        else {
            const sourceElement = svg.querySelector(`#node-${activeElementId}`);
            if (sourceElement) sourceElement.classList.add('active');

            const sourceData = wuxingData[activeElementId];
            const relationData = sourceData[currentRelation];
            if (relationData) {
                const targetElement = svg.querySelector(`#node-${relationData.target}`);
                if (targetElement) targetElement.classList.add('active');
                
                const path = findPath(activeElementId, relationData.target);
                if (path) {
                    path.classList.add(activeClass);
                }
            }
        }
    }

    function findPath(source, target) {
        // Path IDs can be sheng-mu-huo, ke-mu-tu, etc.
        const idsToTry = [
            `sheng-${source}-${target}`, `ke-${source}-${target}`,
            `sheng-${target}-${source}`, `ke-${target}-${source}`
        ];
        for(const id of idsToTry) {
            const path = svg.querySelector(`#${id}`);
            if (path) return path;
        }
        return null;
    }

    function updateInfoPanel() {
        // Global view
        if (!activeElementId) {
            const globalInfo = globalRelationInfo[currentRelation];
            infoTitle.textContent = globalInfo.title;
            infoContent.innerHTML = `<p>${globalInfo.text}</p><hr><p class="lead">请点击图中任意元素，深入了解其在该关系下的具体表现。</p>`;
        } 
        // Element-specific view
        else {
            const data = wuxingData[activeElementId];
            const relationData = data[currentRelation];
            infoTitle.textContent = `${data.name} - ${relationData.text.split('：')[0]}`;
            
            let contentHTML = `<p>${relationData.text.split('：')[1]}</p><hr>`;
            for(const [key, value] of Object.entries(data.info)) {
                contentHTML += `<strong>${key}：</strong><p>${value}</p>`;
            }
            infoContent.innerHTML = contentHTML;
        }

        if (!infoPanel.classList.contains('visible')) {
            infoPanel.classList.add('visible');
        }
    }

    // Event listener for SVG elements
    svg.querySelectorAll('.element-node').forEach(el => {
        el.addEventListener('click', () => {
            const elementId = el.dataset.element;
            if (activeElementId === elementId) {
                activeElementId = null; // Toggle off
            } else {
                activeElementId = elementId; // Select new
            }
            updateWuxingView();
            updateInfoPanel();
        });
    });

    // Event listener for control buttons
    controls.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const newRelation = e.target.dataset.relation;
            if (newRelation === currentRelation) return;

            controls.querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            currentRelation = newRelation;
            
            updateWuxingView();
            updateInfoPanel();
        }
    });
    
    // Initial state on load
    updateWuxingView();
    updateInfoPanel();

}); 