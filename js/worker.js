// --- 1. Constants ---
const TIANGAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DIZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const DIZHI_TO_MONTHLY_GENERAL = {
    '子': '神后', '丑': '大吉', '寅': '功曹', '卯': '太冲', '辰': '天罡', '巳': '太乙',
    '午': '胜光', '未': '小吉', '申': '传送', '酉': '从魁', '戌': '河魁', '亥': '登明'
};
const DIZHI_INDEX = Object.fromEntries(DIZHI.map((dz, i) => [dz, i]));
const TIANGAN_YIN_YANG = {'甲': '阳', '乙': '阴', '丙': '阳', '丁': '阴', '戊': '阳', '己': '阴', '庚': '阳', '辛': '阴', '壬': '阳', '癸': '阴'};
const TIANGAN_JIGONG = { '甲': '寅', '乙': '辰', '丙': '巳', '丁': '未', '戊': '巳', '己': '未', '庚': '申', '辛': '戌', '壬': '亥', '癸': '丑' };
const DIZHI_WUXING = { '子': '水', '丑': '土', '寅': '木', '卯': '木', '辰': '土', '巳': '火', '午': '火', '未': '土', '申': '金', '酉': '金', '戌': '土', '亥': '水' };
const WUXING_RELATIONS = {
    '金': { '生我': '土', '我生': '水', '克我': '火', '我克': '木', '同我': '金' },
    '木': { '生我': '水', '我生': '火', '克我': '金', '我克': '土', '同我': '木' },
    '水': { '生我': '金', '我生': '木', '克我': '土', '我克': '火', '同我': '水' },
    '火': { '生我': '木', '我生': '土', '克我': '水', '我克': '金', '同我': '火' },
    '土': { '生我': '火', '我生': '金', '克我': '木', '我克': '水', '同我': '土' }
};
const HEAVENLY_GENERALS = ['贵人', '螣蛇', '朱雀', '六合', '勾陈', '青龙', '天空', '白虎', '太常', '玄武', '太阴', '天后'];
const GUIREN_LOOKUP = {
    '甲': { 'day': '未', 'night': '丑' }, '戊': { 'day': '未', 'night': '丑' }, '庚': { 'day': '未', 'night': '丑' },
    '乙': { 'day': '申', 'night': '子' }, '己': { 'day': '申', 'night': '子' },
    '丙': { 'day': '酉', 'night': '亥' }, '丁': { 'day': '酉', 'night': '亥' },
    '壬': { 'day': '卯', 'night': '巳' }, '癸': { 'day': '卯', 'night': '巳' },
    '辛': { 'day': '午', 'night': '寅' }
};
const DIZHI_GROUP = {
    '孟': ['寅', '申', '巳', '亥'],
    '仲': ['子', '午', '卯', '酉'],
    '季': ['辰', '戌', '丑', '未']
};
// Note: Approximate solar term dates for simplified calculations.
const SOLAR_TERMS_QI = {
    0: 20, 1: 19, 2: 21, 3: 20, 4: 21, 5: 22, 6: 23, 7: 23, 8: 23, 9: 24, 10: 22, 11: 22
};
// --- 2. Core Calculation Functions ---
function getFourPillars(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const hour = date.getHours();
    const yearStemIndex = (year - 4) % 10;
    const yearBranchIndex = (year - 4) % 12;
    const yearPillar = TIANGAN[yearStemIndex] + DIZHI[yearBranchIndex];
    const yearStem = TIANGAN[yearStemIndex];
    let monthStemIndex;
    if (yearStem === '甲' || yearStem === '己') monthStemIndex = 2;
    else if (yearStem === '乙' || yearStem === '庚') monthStemIndex = 4;
    else if (yearStem === '丙' || yearStem === '辛') monthStemIndex = 6;
    else if (yearStem === '丁' || yearStem === '壬') monthStemIndex = 8;
    else monthStemIndex = 0;
    monthStemIndex = (monthStemIndex + month) % 10;
    const monthBranchIndex = (month + 2) % 12;
    const monthPillar = TIANGAN[monthStemIndex] + DIZHI[monthBranchIndex];
    const refDate = new Date('2000-01-01T00:00:00Z');
    const daysFromRef = Math.floor((date.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24));
    const dayStemIndex = (6 + daysFromRef % 60 + 60) % 10;
    const dayBranchIndex = (4 + daysFromRef % 60 + 60) % 12;
    const dayPillar = TIANGAN[dayStemIndex] + DIZHI[dayBranchIndex];
    
    const hourBranchIndex = (hour >= 23) ? 0 : Math.floor((hour + 1) / 2);
    const hourPillar = TIANGAN[((dayStemIndex % 5) * 2 + hourBranchIndex) % 10] + DIZHI[hourBranchIndex];
    return {
        year: yearPillar, month: monthPillar, day: dayPillar, hour: hourPillar,
        dayStem: dayPillar[0], dayBranch: dayPillar[1], hourBranch: hourPillar[1]
    };
}
function getMonthlyGeneral(date) {
    // Simplified calculation based on approximate solar term dates.
    const month = date.getMonth();
    const day = date.getDate();
    const qiDate = SOLAR_TERMS_QI[month];
    
    const jsMonthToSolarMonth = { 0: 12, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, 11: 11 };
    let currentSolarMonth = jsMonthToSolarMonth[month];
    if (day < qiDate) {
        currentSolarMonth = (currentSolarMonth === 1) ? 12 : currentSolarMonth - 1;
    }
    
    const generalIndexMap = { 1: 11, 2: 10, 3: 9, 4: 8, 5: 7, 6: 6, 7: 5, 8: 4, 9: 3, 10: 2, 11: 1, 12: 0 }; // 寅月(1)用亥(11), 卯月(2)用戌(10)...
    const generalDizhiIndex = generalIndexMap[currentSolarMonth];
    return DIZHI[generalDizhiIndex];
}
function getPlates(monthlyGeneral, hourBranch) {
    const earthPlate = [...DIZHI];
    const hourBranchIndexOnEarth = DIZHI_INDEX[hourBranch];
    const monthlyGeneralIndex = DIZHI_INDEX[monthlyGeneral];
    const heavenPlate = new Array(12);
    for (let i = 0; i < 12; i++) {
        const earthIndex = (hourBranchIndexOnEarth + i) % 12;
        const heavenBranchIndex = (monthlyGeneralIndex + i) % 12;
        heavenPlate[earthIndex] = DIZHI[heavenBranchIndex];
    }
    return { heaven: heavenPlate, earth: earthPlate };
}
function getFourLessons(dayStem, dayBranch, plates) {
    const { heaven } = plates;
    const stemJigong = TIANGAN_JIGONG[dayStem];
    const stemJigongIndex = DIZHI_INDEX[stemJigong];
    const stemUpperGod = heaven[stemJigongIndex];
    const branchIndex = DIZHI_INDEX[dayBranch];
    const branchUpperGod = heaven[branchIndex];
    const firstUpperIndex = DIZHI_INDEX[stemUpperGod];
    const secondUpperGod = heaven[firstUpperIndex];
    const thirdUpperIndex = DIZHI_INDEX[branchUpperGod];
    const fourthUpperGod = heaven[thirdUpperIndex];
    return [
        { upper: stemUpperGod, lower: dayStem },
        { upper: secondUpperGod, lower: stemUpperGod },
        { upper: branchUpperGod, lower: dayBranch },
        { upper: fourthUpperGod, lower: branchUpperGod }
    ];
}
function getThreeTransmissions(fourLessons, dayStem, plates) {
    const dayType = TIANGAN_YIN_YANG[dayStem];
    let attackers = [];
    let controllers = [];
    fourLessons.forEach((lesson, index) => {
        const upperWuxing = DIZHI_WUXING[lesson.upper];
        const lowerBranch = DIZHI.includes(lesson.lower) ? lesson.lower : TIANGAN_JIGONG[lesson.lower];
        const lowerWuxing = DIZHI_WUXING[lowerBranch];
        if (WUXING_RELATIONS[lowerWuxing]['我克'] === upperWuxing) attackers.push({ lesson: lesson, index: index + 1, upper: lesson.upper });
        if (WUXING_RELATIONS[upperWuxing]['我克'] === lowerWuxing) controllers.push({ lesson: lesson, index: index + 1, upper: lesson.upper });
    });

    // Rule 1: Zeike and Shehai
    let transmissionRule = null;
    if (attackers.length > 0) {
        transmissionRule = { candidates: attackers, type: '贼克法 (下克上)' };
    } else if (controllers.length > 0) {
        transmissionRule = { candidates: controllers, type: '贼克法 (上克下)' };
    }
    
    if (transmissionRule) {
        let initial;
        if (transmissionRule.candidates.length === 1) {
            initial = transmissionRule.candidates[0].lesson.upper;
        } else {
            // Shehai Logic
            let maxDepth = -1;
            let finalCandidates = [];
            const isDescending = transmissionRule.type.includes('下克上');
            transmissionRule.candidates.forEach(c => {
                const upper = c.lesson.upper; // This is the potential 初传
                const lower = c.lesson.lower;
                const mengZhongJiKey = Object.keys(DIZHI_GROUP).find(key => DIZHI_GROUP[key].includes(isDescending ? lower : upper));
                const group = DIZHI_GROUP[mengZhongJiKey];
                const depth = calculateShehaiDepth(upper, lower, group);
                
                if (depth > maxDepth) {
                    maxDepth = depth;
                    finalCandidates = [upper];
                } else if (depth === maxDepth) {
                    finalCandidates.push(upper);
                }
            });
            if (finalCandidates.length === 1) {
                initial = finalCandidates[0];
                transmissionRule.type = '涉害法';
            } else {
                // Simplification for Jianji rule: take the one on the Yang lesson if day is Yang, else Yin.
                const isYangDay = dayType === '阳';
                const preferredIndex = isYangDay ? 0 : 3; // 1st or 4th lesson
                const found = transmissionRule.candidates.find(c => c.index === (preferredIndex + 1) && finalCandidates.includes(c.lesson.upper));
                initial = found ? found.lesson.upper : finalCandidates[0]; // fallback
                transmissionRule.type = '涉害法 (见机)';
            }
        }
        
        const initialUpperIndex = DIZHI_INDEX[initial];
        const middle = plates.heaven[initialUpperIndex];
        const middleUpperIndex = DIZHI_INDEX[middle];
        const final = plates.heaven[middleUpperIndex];

        // --- NEW: Keti Name Identification ---
        let ketiName = transmissionRule.type; // Default to method name
        if (transmissionRule.type.includes('贼克')) {
             if (controllers.length > 0 && initial === fourLessons[0].upper) {
                ketiName = '元首课';
            } else if (attackers.length > 0 && initial === fourLessons[2].upper) {
                ketiName = '重审课';
            }
        }
        // --- END NEW ---

        return { initial, middle, final, type: ketiName };
    }

    // Rule 2: Biyong
    const uppers = fourLessons.map(l => l.upper);
    const upperCounts = uppers.reduce((acc, val) => { acc[val] = (acc[val] || 0) + 1; return acc; }, {});
    if (Object.values(upperCounts).some(count => count > 1)) {
        let initial = null;
        const isYangDay = dayType === '阳';
        
        const checkOrder = isYangDay ? [0, 2, 3, 1] : [3, 1, 0, 2];
        for (const i of checkOrder) {
            const upper = fourLessons[i].upper;
            if (upperCounts[upper] > 1) {
                initial = upper;
                break;
            }
        }
        
        if (initial) {
            const initialUpperIndex = DIZHI_INDEX[initial];
            const middle = plates.heaven[initialUpperIndex];
            const middleUpperIndex = DIZHI_INDEX[middle];
            const final = plates.heaven[middleUpperIndex];
            return { initial, middle, final, type: '比用课' };
        }
    }

    // Fallback if no rules match
    return { initial: null, middle: null, final: null, type: '无传' };
}
function calculateShehaiDepth(heavenPlateBranch, earthPlateBranch, mengZhongJi) {
    let depth = 0;
    let currentIndex = DIZHI_INDEX[heavenPlateBranch];
    const endIndex = DIZHI_INDEX[earthPlateBranch];
    if (currentIndex === endIndex) return 0;
    while (currentIndex !== endIndex) {
        if (mengZhongJi.includes(DIZHI[currentIndex])) {
            depth++;
        }
        currentIndex = (currentIndex + 1) % 12;
    }
    return depth;
}
function getHeavenlyGenerals(dayStem, hourBranch, plates) {
    const hourIndex = DIZHI_INDEX[hourBranch];
    const isDay = hourIndex >= 3 && hourIndex <= 8; // 卯(3) to 申(8)
    const guirenDizhi = GUIREN_LOOKUP[dayStem][isDay ? 'day' : 'night'];
    const guirenIndexOnEarth = DIZHI_INDEX[guirenDizhi];
    
    const shunxingGuirenList = ['丑', '未', '子', '申']; // These are Guiren locations, not day stems
    const isShunxing = TIANGAN_YIN_YANG[dayStem] === '阳';
    
    const generalsOnHeavenPlate = {};
    for (let i = 0; i < 12; i++) {
        const generalIndex = isShunxing ? i : (12 - i) % 12;
        const earthPlateIndex = (guirenIndexOnEarth + (isShunxing ? i : -i) + 12) % 12;
        const heavenPlateBranch = plates.heaven[earthPlateIndex];
        generalsOnHeavenPlate[heavenPlateBranch] = HEAVENLY_GENERALS[generalIndex];
    }
    return generalsOnHeavenPlate;
}
/**
 * Calculates key Shen Sha (Symbolic Stars).
 * @param {object} siZhu - The Four Pillars object.
 * @returns {object} An object containing key Shen Sha.
 */
function getShenSha(siZhu) {
    const { dayStem, dayBranch } = siZhu;
    const shensha = {};
    // 1. 禄神 (Lu Shen) - Prosperity
    const luShenMap = {
        '甲': '寅', '乙': '卯', '丙': '巳', '丁': '午', '戊': '巳',
        '己': '午', '庚': '申', '辛': '酉', '壬': '亥', '癸': '子'
    };
    shensha['禄神'] = luShenMap[dayStem];
    // 2. 驿马 (Yi Ma) - Post Horse (Travel)
    const yiMaGroup = {
        '申': '寅', '子': '寅', '辰': '寅',
        '寅': '申', '午': '申', '戌': '申',
        '亥': '巳', '卯': '巳', '未': '巳',
        '巳': '亥', '酉': '亥', '丑': '亥'
    };
    shensha['驿马'] = yiMaGroup[dayBranch];
    // 3. 天乙贵人 (Tian Yi Gui Ren) - Nobleman
    const tianYiMap = {
        '甲': { day: '未', night: '丑' }, '戊': { day: '未', night: '丑' }, '庚': { day: '未', night: '丑' },
        '乙': { day: '申', night: '子' }, '己': { day: '申', night: '子' },
        '丙': { day: '酉', night: '亥' }, '丁': { day: '酉', night: '亥' },
        '壬': { day: '卯', night: '巳' }, '癸': { day: '卯', night: '巳' },
        '辛': { day: '午', night: '寅' }
    };
    shensha['天乙贵人'] = `昼: ${tianYiMap[dayStem].day} / 夜: ${tianYiMap[dayStem].night}`;
    return shensha;
}
function getPan(date) {
    const siZhu = getFourPillars(date);
    const monthlyGeneral = getMonthlyGeneral(date);
    siZhu.monthlyGeneral = DIZHI_TO_MONTHLY_GENERAL[monthlyGeneral];
    const plates = getPlates(monthlyGeneral, siZhu.hourBranch);
    const fourLessons = getFourLessons(siZhu.dayStem, siZhu.dayBranch, plates);
    const threeTransmissions = getThreeTransmissions(fourLessons, siZhu.dayStem, plates);
    const heavenlyGenerals = getHeavenlyGenerals(siZhu.dayStem, siZhu.hourBranch, plates);
    const shenSha = getShenSha(siZhu);
    return {
        siZhu,
        monthlyGeneral,
        plates,
        fourLessons,
        threeTransmissions,
        heavenlyGenerals,
        shenSha
    };
}
// --- Web Worker Listener ---
self.onmessage = function(e) {
    console.log('Worker: Message received from main script');
    const date = new Date(e.data.date);
    const pan = getPan(date);
    console.log('Worker: Posting message back to main script');
    self.postMessage(pan);
}; 