export const DECORATION_CATALOG = {
  wallpapers: [
    {
      id: 'wp_cream',
      name: '简约奶油墙',
      description: '温暖的奶油色渐变，经典简约风格',
      cost: 0,
      category: 'wallpaper',
      bonus: { type: 'none', value: 0 },
      render: { pattern: 'cream_gradient' }
    },
    {
      id: 'wp_brick',
      name: '复古红砖墙',
      description: '精致红砖纹理墙面，散发温馨复古气息',
      cost: 120,
      category: 'wallpaper',
      bonus: { type: 'tip_multiplier', value: 0.05 },
      render: { pattern: 'brick' }
    },
    {
      id: 'wp_stripe',
      name: '优雅条纹墙纸',
      description: '金色竖条纹墙纸，提升餐厅格调',
      cost: 200,
      category: 'wallpaper',
      bonus: { type: 'patience_boost', value: 0.08 },
      render: { pattern: 'stripes' }
    },
    {
      id: 'wp_floral',
      name: '田园碎花墙纸',
      description: '精美碎花图案，营造浪漫用餐氛围',
      cost: 300,
      category: 'wallpaper',
      bonus: { type: 'tip_multiplier', value: 0.10 },
      render: { pattern: 'floral' }
    }
  ],

  floors: [
    {
      id: 'fl_wood',
      name: '原木地板',
      description: '朴实的原木色地板，简洁大方',
      cost: 0,
      category: 'floor',
      bonus: { type: 'none', value: 0 },
      render: { pattern: 'wood_planks' }
    },
    {
      id: 'fl_checker',
      name: '黑白棋盘砖',
      description: '经典黑白格地砖，透视效果极具立体感',
      cost: 250,
      category: 'floor',
      bonus: { type: 'tip_multiplier', value: 0.08 },
      render: { pattern: 'checker' }
    },
    {
      id: 'fl_terracotta',
      name: '暖色陶土砖',
      description: '温暖的六角陶土砖，地中海风情',
      cost: 180,
      category: 'floor',
      bonus: { type: 'patience_boost', value: 0.06 },
      render: { pattern: 'terracotta' }
    },
    {
      id: 'fl_marble',
      name: '大理石地板',
      description: '高级大理石纹理，奢华质感让顾客倍感尊贵',
      cost: 400,
      category: 'floor',
      bonus: { type: 'tip_multiplier', value: 0.12 },
      render: { pattern: 'marble' }
    }
  ],

  wall_art: [
    {
      id: 'art_landscape',
      name: '水墨山水画',
      description: '素雅水墨画，宁静致远，顾客心情更放松',
      cost: 80,
      category: 'wall_art',
      bonus: { type: 'patience_boost', value: 0.05 },
      render: { drawFn: 'drawLandscapePainting', width: 70, height: 45 },
      defaultPos: { x: 0.38, y: 0.12 }
    },
    {
      id: 'art_food',
      name: '美食油画',
      description: '精美食物油画，激发食欲让顾客更愿给小费',
      cost: 100,
      category: 'wall_art',
      bonus: { type: 'tip_multiplier', value: 0.05 },
      render: { drawFn: 'drawFoodPainting', width: 60, height: 50 },
      defaultPos: { x: 0.62, y: 0.10 }
    },
    {
      id: 'art_abstract',
      name: '现代抽象画',
      description: '色彩斑斓的抽象艺术，提升餐厅艺术品位',
      cost: 150,
      category: 'wall_art',
      bonus: { type: 'tip_multiplier', value: 0.07 },
      render: { drawFn: 'drawAbstractPainting', width: 55, height: 40 },
      defaultPos: { x: 0.50, y: 0.08 }
    },
    {
      id: 'art_clock',
      name: '复古挂钟',
      description: '古铜色罗马数字挂钟，增添经典韵味',
      cost: 65,
      category: 'wall_art',
      bonus: { type: 'patience_boost', value: 0.03 },
      render: { drawFn: 'drawWallClock', width: 40, height: 40 },
      defaultPos: { x: 0.50, y: 0.06 }
    },
    {
      id: 'art_shelf',
      name: '实木置物架',
      description: '墙面装饰架，摆放精致器皿展现品味',
      cost: 90,
      category: 'wall_art',
      bonus: { type: 'tip_multiplier', value: 0.04 },
      render: { drawFn: 'drawWallShelf', width: 80, height: 35 },
      defaultPos: { x: 0.30, y: 0.18 }
    },
    {
      id: 'art_mirror',
      name: '欧式装饰镜',
      description: '金框装饰镜，扩大空间感让餐厅显得更开阔',
      cost: 130,
      category: 'wall_art',
      bonus: { type: 'patience_boost', value: 0.06 },
      render: { drawFn: 'drawDecorMirror', width: 40, height: 55 },
      defaultPos: { x: 0.70, y: 0.10 }
    }
  ],

  lighting: [
    {
      id: 'light_pendant',
      name: '工业风吊灯',
      description: '黑色铁艺吊灯，暖黄灯光营造温馨氛围',
      cost: 100,
      category: 'lighting',
      bonus: { type: 'tip_multiplier', value: 0.05 },
      render: { drawFn: 'drawPendantLamp', width: 50, height: 60 },
      defaultPos: { x: 0.30, y: 0.05 }
    },
    {
      id: 'light_chandelier',
      name: '水晶吊灯',
      description: '华丽水晶灯，璀璨光芒让餐厅金碧辉煌',
      cost: 350,
      category: 'lighting',
      bonus: { type: 'tip_multiplier', value: 0.10 },
      render: { drawFn: 'drawChandelier', width: 70, height: 65 },
      defaultPos: { x: 0.50, y: 0.04 }
    },
    {
      id: 'light_wall_sconce',
      name: '壁灯',
      description: '柔和暖光壁灯，增加墙面层次感',
      cost: 60,
      category: 'lighting',
      bonus: { type: 'patience_boost', value: 0.03 },
      render: { drawFn: 'drawWallSconce', width: 25, height: 35 },
      defaultPos: { x: 0.15, y: 0.12 }
    },
    {
      id: 'light_floor_lamp',
      name: '落地灯',
      description: '现代简约落地灯，角落温暖光源',
      cost: 80,
      category: 'lighting',
      bonus: { type: 'patience_boost', value: 0.04 },
      render: { drawFn: 'drawFloorLamp', width: 25, height: 70 },
      defaultPos: { x: 0.96, y: 0.45 }
    }
  ],

  furniture: [
    {
      id: 'furn_cabinet',
      name: '实木餐边柜',
      description: '大容量储物柜，彰显餐厅品质与格调',
      cost: 200,
      category: 'furniture',
      bonus: { type: 'tip_multiplier', value: 0.06 },
      render: { drawFn: 'drawCabinet', width: 60, height: 55 },
      defaultPos: { x: 0.92, y: 0.62 }
    },
    {
      id: 'furn_bookshelf',
      name: '文艺书架',
      description: '精致书架装饰，文化气息让顾客流连忘返',
      cost: 160,
      category: 'furniture',
      bonus: { type: 'patience_boost', value: 0.06 },
      render: { drawFn: 'drawBookshelf', width: 50, height: 65 },
      defaultPos: { x: 0.05, y: 0.48 }
    },
    {
      id: 'furn_sofa',
      name: '皮质沙发',
      description: '柔软皮质沙发，等位顾客更有耐心',
      cost: 250,
      category: 'furniture',
      bonus: { type: 'patience_boost', value: 0.08 },
      render: { drawFn: 'drawSofa', width: 70, height: 40 },
      defaultPos: { x: 0.50, y: 0.82 }
    },
    {
      id: 'furn_wine_rack',
      name: '红酒展示架',
      description: '精美红酒陈列架，提升顾客对餐厅的消费意愿',
      cost: 280,
      category: 'furniture',
      bonus: { type: 'tip_multiplier', value: 0.08 },
      render: { drawFn: 'drawWineRack', width: 45, height: 60 },
      defaultPos: { x: 0.88, y: 0.45 }
    }
  ],

  appliances: [
    {
      id: 'app_ac',
      name: '壁挂空调',
      description: '冷暖空调让顾客冬暖夏凉，心情舒适',
      cost: 180,
      category: 'appliances',
      bonus: { type: 'patience_boost', value: 0.07 },
      render: { drawFn: 'drawAirConditioner', width: 70, height: 25 },
      defaultPos: { x: 0.75, y: 0.05 }
    },
    {
      id: 'app_water',
      name: '饮水机',
      description: '自助饮水机，免费热水让等待更舒适',
      cost: 120,
      category: 'appliances',
      bonus: { type: 'patience_boost', value: 0.05 },
      render: { drawFn: 'drawWaterDispenser', width: 30, height: 55 },
      defaultPos: { x: 0.94, y: 0.55 }
    },
    {
      id: 'app_speaker',
      name: '蓝牙音箱',
      description: '播放轻音乐，舒缓等餐焦虑',
      cost: 70,
      category: 'appliances',
      bonus: { type: 'patience_boost', value: 0.04 },
      render: { drawFn: 'drawSpeaker', width: 25, height: 30 },
      defaultPos: { x: 0.08, y: 0.62 }
    },
    {
      id: 'app_tv',
      name: '壁挂电视',
      description: '播放美食节目，吸引顾客注意力忘记等待',
      cost: 220,
      category: 'appliances',
      bonus: { type: 'patience_boost', value: 0.08 },
      render: { drawFn: 'drawTV', width: 65, height: 40 },
      defaultPos: { x: 0.50, y: 0.06 }
    }
  ],

  curtains: [
    {
      id: 'curtain_elegant',
      name: '丝绒窗帘',
      description: '深红丝绒窗帘，遮光的同时增添高级感',
      cost: 150,
      category: 'curtains',
      bonus: { type: 'tip_multiplier', value: 0.06 },
      render: { drawFn: 'drawVelvetCurtain', width: 55, height: 90 },
      defaultPos: { x: 0.13, y: 0.08 }
    },
    {
      id: 'curtain_sheer',
      name: '蕾丝纱帘',
      description: '半透明纱帘柔化光线，温馨浪漫',
      cost: 80,
      category: 'curtains',
      bonus: { type: 'patience_boost', value: 0.04 },
      render: { drawFn: 'drawSheerCurtain', width: 50, height: 85 },
      defaultPos: { x: 0.87, y: 0.08 }
    },
    {
      id: 'curtain_bamboo',
      name: '竹编卷帘',
      description: '日式竹帘，禅意十足让人心静',
      cost: 100,
      category: 'curtains',
      bonus: { type: 'patience_boost', value: 0.05 },
      render: { drawFn: 'drawBambooBlinds', width: 50, height: 70 },
      defaultPos: { x: 0.13, y: 0.10 }
    }
  ],

  plants: [
    {
      id: 'plant_monstera',
      name: '龟背竹',
      description: '大叶热带绿植，为餐厅注入自然活力',
      cost: 60,
      category: 'plant',
      bonus: { type: 'tip_multiplier', value: 0.03 },
      render: { drawFn: 'drawMonstera', width: 45, height: 55 },
      defaultPos: { x: 0.04, y: 0.55 }
    },
    {
      id: 'plant_ficus',
      name: '琴叶榕',
      description: '优雅的琴叶榕，营造高级感',
      cost: 90,
      category: 'plant',
      bonus: { type: 'patience_boost', value: 0.04 },
      render: { drawFn: 'drawFicus', width: 40, height: 60 },
      defaultPos: { x: 0.95, y: 0.50 }
    },
    {
      id: 'plant_succulent',
      name: '多肉组合盆栽',
      description: '精致小巧的多肉植物，桌上的一抹清新',
      cost: 40,
      category: 'plant',
      bonus: { type: 'patience_boost', value: 0.03 },
      render: { drawFn: 'drawSucculent', width: 30, height: 30 },
      defaultPos: { x: 0.50, y: 0.45 }
    },
    {
      id: 'plant_bamboo',
      name: '富贵竹',
      description: '翠绿富贵竹，带来好运与财气',
      cost: 70,
      category: 'plant',
      bonus: { type: 'tip_multiplier', value: 0.04 },
      render: { drawFn: 'drawBamboo', width: 25, height: 65 },
      defaultPos: { x: 0.03, y: 0.40 }
    },
    {
      id: 'plant_hanging',
      name: '垂吊绿萝',
      description: '悬挂绿萝，为高处空间增添生机',
      cost: 50,
      category: 'plant',
      bonus: { type: 'tip_multiplier', value: 0.03 },
      render: { drawFn: 'drawHangingPlant', width: 35, height: 45 },
      defaultPos: { x: 0.22, y: 0.06 }
    }
  ]
}

export function findItemById(id) {
  for (const category of Object.values(DECORATION_CATALOG)) {
    const item = category.find(i => i.id === id)
    if (item) return item
  }
  return null
}

export function getDefaultDecorationState() {
  return {
    activeWallpaper: 'wp_cream',
    activeFloor: 'fl_wood',
    owned: ['wp_cream', 'fl_wood'],
    placed: []
  }
}
