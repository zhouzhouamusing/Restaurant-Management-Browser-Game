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
