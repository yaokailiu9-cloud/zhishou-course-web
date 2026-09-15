const serenityImages = ["", "", ""];

const userPortrait = "https://lh3.googleusercontent.com/aida-public/AB6AXuB8wRsE4wfy7XQ6BGzxDX24neIKACENyIK4s7Hwrg50eFd8sRUBFcC1JeICM134ePoHG7M7H5a3vbL6h6RUcoZpNUL7KZ3f7mcRbtlfoEadVCPzByjxIEREAxf6Y_Wo4M_5plCmvhB7JpFekpkQiUIq62XH4PV80fBddutRqV1-SkVW7n0x47DGnzNAAVjaJb_OR1SpZ8FDr2FI7ybeczB40WZEIv3zA1MYsau91oBubehguHY6WsVm";

const advisors = [
  {
    id: "adv-001",
    name: "叶闻",
    title: "情感关系咨询师",
    company: "长期关系修复与沟通陪伴",
    avatarText: "叶",
    imageUrl: serenityImages[0],
    badge: "答主",
    tags: ["情感修复", "沟通分析", "长期关系"],
    topics: ["关系冷淡后如何重新沟通", "伴侣频繁争吵后的修复方式"],
    helped: 10,
    rating: 7.3,
    price: 200,
    bio: "擅长帮助来访者梳理关系矛盾、沟通误区和情绪需求，找到更稳定的相处方式。"
  },
  {
    id: "adv-002",
    name: "刘丽平",
    title: "亲密关系陪伴师",
    company: "婚恋关系与情绪支持",
    avatarText: "刘",
    imageUrl: serenityImages[1],
    badge: "答主",
    tags: ["婚恋关系", "情绪压力", "分手复盘"],
    topics: ["分手后是否还有修复空间", "恋爱中的安全感与边界感"],
    helped: 133,
    rating: 9.5,
    price: 200,
    bio: "长期陪伴婚恋与亲密关系议题，适合做情绪安抚、关系复盘和下一步沟通策略。"
  },
  {
    id: "adv-003",
    name: "星星老师",
    title: "情绪疗愈咨询师",
    company: "自我成长与依恋关系",
    avatarText: "星",
    imageUrl: serenityImages[2],
    badge: "答主",
    tags: ["情绪陪伴", "依恋模式", "自我成长"],
    topics: ["为什么总在关系里患得患失", "如何从内耗里慢慢走出来"],
    helped: 5,
    rating: 10,
    price: 200,
    bio: "风格温和，擅长陪你看见情绪背后的真实需求，减少内耗和关系中的反复拉扯。"
  },
  {
    id: "adv-004",
    name: "宋富强",
    title: "关系沟通咨询师",
    company: "冲突沟通与复合策略",
    avatarText: "宋",
    imageUrl: serenityImages[0],
    badge: "答主",
    tags: ["复合策略", "冲突沟通", "关系判断"],
    topics: ["对方突然冷淡该不该主动", "如何判断一段关系是否值得继续"],
    helped: 86,
    rating: 9.2,
    price: 200,
    bio: "擅长把复杂关系问题拆成可行动的沟通步骤，帮助你判断节奏、降低冲突。"
  }
];

const quickPrompts = [
  "我和对方最近越来越冷淡",
  "分手后我还想挽回怎么办？",
  "我总是在关系里没有安全感",
  "我们总是吵架，该怎么沟通？"
];

const courses = [
  {
    id: "course-001",
    title: "亲密关系沟通基础课",
    subtitle: "从冷战到有效对话的 7 天重建练习",
    coverUrl: serenityImages[0],
    durationText: "6小时32分",
    badge: "热门",
    chapters: [
      { id: "c1-1", title: "第一课：识别关系中的沟通陷阱", duration: "18:20" },
      { id: "c1-2", title: "第二课：从指责到表达的转换", duration: "24:05" },
      { id: "c1-3", title: "第三课：倾听与共情的练习", duration: "21:40" },
      { id: "c1-4", title: "第四课：冲突后的修复对话", duration: "28:15" }
    ]
  },
  {
    id: "course-002",
    title: "情绪内耗自救指南",
    subtitle: "减少反复想、睡不着、情绪起伏大的日常训练",
    coverUrl: serenityImages[2],
    durationText: "4小时18分",
    badge: "推荐",
    chapters: [
      { id: "c2-1", title: "第一课：什么是情绪内耗", duration: "12:30" },
      { id: "c2-2", title: "第二课：情绪命名的力量", duration: "16:45" },
      { id: "c2-3", title: "第三课：睡前放松三步法", duration: "19:20" }
    ]
  },
  {
    id: "course-003",
    title: "分手后关系复盘课",
    subtitle: "理性看待分手，找到下一段关系的起点",
    coverUrl: serenityImages[1],
    durationText: "5小时06分",
    badge: "",
    chapters: [
      { id: "c3-1", title: "第一课：分手后的情绪周期", duration: "15:10" },
      { id: "c3-2", title: "第二课：复盘不是翻旧账", duration: "22:35" }
    ]
  },
  {
    id: "course-004",
    title: "婚恋关系安全感建立",
    subtitle: "减少控制与试探，建立稳定信任",
    coverUrl: serenityImages[0],
    durationText: "7小时12分",
    badge: "新课",
    chapters: [
      { id: "c4-1", title: "第一课：你的依恋风格是什么", duration: "20:00" },
      { id: "c4-2", title: "第二课：焦虑型依恋的调节", duration: "26:40" }
    ]
  },
  {
    id: "course-005",
    title: "职场压力与情绪边界",
    subtitle: "工作再累，也不把情绪全部带回家",
    coverUrl: serenityImages[2],
    durationText: "3小时45分",
    badge: "",
    chapters: [
      { id: "c5-1", title: "第一课：情绪边界是什么", duration: "14:20" },
      { id: "c5-2", title: "第二课：下班前的 5 分钟切换", duration: "11:55" }
    ]
  },
  {
    id: "course-006",
    title: "父母沟通与家庭关系",
    subtitle: "减少代际冲突，建立成年子女边界",
    coverUrl: serenityImages[1],
    durationText: "4小时50分",
    badge: "",
    chapters: [
      { id: "c6-1", title: "第一课：为什么越长大越难沟通", duration: "17:30" },
      { id: "c6-2", title: "第二课：温和拒绝的练习", duration: "19:15" }
    ]
  }
];

const courseCategories = [];

module.exports = {
  advisors,
  courses,
  courseCategories,
  quickPrompts,
  serenityImages,
  userPortrait
};
