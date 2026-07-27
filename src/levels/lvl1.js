module.exports = {
    worldWidth: 2400,
    backgroundLevel: '/sprites/backgrounds/background1.png',
    floorBackground: '/sprites/scenary/floor.png',
    backgroundItems: [
      { type: 'coconut_tree', x: 150, y: 360, w: 110, h: 200, background: '/sprites/scenary/coconut_tree.gif' },
      { type: 'coconut_tree', x: 266, y: 360, w: 110, h: 200, background: '/sprites/scenary/coconut_tree.gif' },
      { type: 'bush', x: 400, y: 452, w: 100, h: 90, background: '/sprites/scenary/bush.gif' },

    ],
    enemies: [
      {
        id: 'enemy-1',
        x: 764,
        y: 489,
        width: 50,
        height: 43,
        background: '/sprites/enemy.gif',
        direction: 1,
        speed: 1.4,
        minX: 500, // limite da esquerda (menor que x)
        maxX: 980, // limite da direita (maior que x)
        grounded: true,
      },
    ],
    items: [
      { id: 'coin-1', type: 'coin', x: 610, y: 290, w: 60, h: 40, background: '/sprites/coins.png' },
      // { id: 'speed_boost-1', type: 'speed_boost', x: 610, y: 489, w: 60, h: 40, background: '/sprites/coins.png' },
    ],
    platforms: [
      { x: -10, y: 536, w: 1020, h: 70, background: '/sprites/scenary/floor.png', debug: false },
      { x: 597, y: 313, w: 170, h: 70, background: '/sprites/scenary/floor2.png', debug: false },
      { x: 900, y: 467, w: 80, h: 70, background: '/sprites/scenary/floor2.png', debug: false },
      
    ],
}