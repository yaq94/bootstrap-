// js/tooltip-data.js
const tooltipData = {
    // 天将
    "贵人": "【天乙贵人】吉神。利于谒见官贵、解决争端、获取帮助。为众神之首，解厄扶危。",
    "螣蛇": "【螣蛇】凶神。主惊恐、怪异、噩梦、官司缠绕。其性虚伪、善变。",
    "朱雀": "【朱雀】凶神。主口舌是非、文书官司、信息传递。其性急速、喧闹。",
    "六合": "【六合】吉神。主婚姻、合作、中介、喜庆之事。其性和善、多合。",
    "勾陈": "【勾陈】凶神。主牵连、迟滞、田土、争斗。其性顽固、有占有欲。",
    "青龙": "【青龙】吉神。主财帛、喜庆、官职、酒食。为东方木神，象征新生与财富。",
    "天空": "【天空】中性神。主虚诈、欺骗、空亡、理想。其性虚幻、不实。",
    "白虎": "【白虎】凶神。主道路、兵戈、丧病、血光。为西方金神，象征威权与凶险。",
    "太常": "【太常】吉神。主衣食、宴会、文章、赏赐。其性安逸、有享受之福。",
    "玄武": "【玄武】凶神。主盗贼、遗失、暧昧、暗中之事。其性不明、善于隐藏。",
    "太阴": "【太阴】吉神。主阴私、谋划、喜事、妇女。为西方金神，象征隐秘与策划。",
    "天后": "【天后】吉神。主妇女、恩泽、私事、家庭。为北方水神，象征柔顺与慈爱。",
    // 地支
    "子": "【子 (zǐ)】阳水，属鼠。主智慧、机敏、河流、夜晚。",
    "丑": "【丑 (chǒu)】阴土，属牛。主库藏、田地、桥梁、金库。",
    "寅": "【寅 (yín)】阳木，属虎。主官禄、权势、道路、山林。",
    "卯": "【卯 (mǎo)】阴木，属兔。主门户、船车、街道、交易。",
    "辰": "【辰 (chén)】阳土，属龙。主争斗、牢狱、田地、水库。",
    "巳": "【巳 (sì)】阴火，属蛇。主变化、信息、炉灶、道路。",
    "午": "【午 (wǔ)】阳火，属马。主官讼、文书、信息、大路。",
    "未": "【未 (wèi)】阴土，属羊。主酒食、宴会、田园、祭祀。",
    "申": "【申 (shēn)】阳金，属猴。主传送、行人、道路、金属。",
    "酉": "【酉 (yǒu)】阴金，属鸡。主阴私、信息、门户、酒。",
    "戌": "【戌 (xū)】阳土，属狗。主虚诈、牢狱、坟墓、建筑。",
    "亥": "【亥 (hài)】阴水，属猪。主乞索、收藏、厕所、仓库。",
    // 天干
    "甲": "【甲 (jiǎ)】阳木。十干之首，主首领、贵人、森林。",
    "乙": "【乙 (yǐ)】阴木。主花草、艺术、柔顺、中医。",
    "丙": "【丙 (bǐng)】阳火。主权威、光明、急躁、乱子。",
    "丁": "【丁 (dīng)】阴火。主信息、文书、秀丽、眼睛。",
    "戊": "【戊 (wù)】阳土。主城墙、高地、资本、中正。",
    "己": "【己 (jǐ)】阴土。主田园、策划、私欲、坟墓。",
    "庚": "【庚 (gēng)】阳金。主道路、兵戈、阻碍、仇敌。",
    "辛": "【辛 (xīn)】阴金。主珠宝、错误、革新、针。",
    "壬": "【壬 (rén)】阳水。主智慧、流动、变化、江河。",
    "癸": "【癸 (guǐ)】阴水。主玄武、私欲、闭藏、眼泪。",
    // 三传类型
    "初传": "【初传】事情的开端，为事件的起因和动力。",
    "中传": "【中传】事情的经过，为事件发展的中间环节。",
    "末传": "【末传】事情的结局，为事件的最终归宿和结果。",
    // 神煞
    "禄神": "【禄神】吉神。主官禄、俸禄、食禄、身体。临之则有官有财，衣食无忧。",
    "德": "【天德/月德】吉神。主解危扶困，化解凶煞。品性高尚，能得天佑。",
    "天喜": "【天喜】吉神。主喜庆、婚姻、生育、吉利之事。",
    "驿马": "【驿马】动神。主走动、出行、搬迁、升职。为变动之象。",
    "国印": "【国印】吉神。主权力、印信、公职、信誉。利于求官和掌握实权。",
    "华盖": "【华盖】艺星。主艺术、才华、孤高、宗教。利于创作和思考，但有孤独之象。",
    "文昌": "【文昌】吉神。主智慧、学业、文书、考试。利于学习和创作。",
    "桃花": "【桃花】情缘星。主男女情爱、人缘、魅力、欲望。亦主酒色、纠纷。",
    "劫煞": "【劫煞】凶神。主劫夺、破财、是非、灾患。临之须防财物损失和争斗。",
    // 断案原理
    "取象": "【取象】六壬判断的核心思维之一。从事物的外形、性质、状态等出发，将其类比于课盘中的某个符号（干支、神将），从而建立联系进行预测。",
    "类神": "【类神】指在占断具体事项时，能够代表该事项本身的特定符号。如占官运以官鬼爻为类神，占财运以妻财爻为类神。",
    "天将": "【天将】十二天将是判断事情性质、状态和细节的关键。每个天将都有其独特的吉凶、含义和象征，深刻影响课体的最终判断。",
    "生克": "【生克】五行的生克制化是六壬乃至所有术数的基础规则。通过分析课体中各元素之间的生克关系，可以判断事物的吉凶成败、发展趋势。",
    "神煞": "【神煞】一种辅助判断系统，源于星辰崇拜。神煞能为课体提供更细节、更具体的信息，如驿马主变动，桃花主情缘等。"
}; 