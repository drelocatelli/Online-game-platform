const initialY = 82;
const gap = 50;

module.exports = {
    worldWidth: 5000,
    backgroundLevel: '/sprites/backgrounds/background1.png',
    floorBackground: '/sprites/scenary/floor.png',
    backgroundItems: [
      { type: 'coconut_tree', x: 150, y: 360, w: 110, h: 200, background: '/sprites/scenary/coconut_tree.gif' },
      { type: 'coconut_tree', x: 266, y: 360, w: 110, h: 200, background: '/sprites/scenary/coconut_tree.gif' },
      { type: 'bush', x: 400, y: 452, w: 100, h: 90, background: '/sprites/scenary/bush.gif' },
      { type: 'cascate', x: 1000, y: 535, w: 250, h: 64, background: '/sprites/scenary/cascate-sprite2.png', frames: 4, frameSpeed: 3 },

      { type: 'bush', x: 1302, y: 452, w: 100, h: 90, background: '/sprites/scenary/bush.gif' },

      { type: 'cascate', x: 1701, y: 540, w: 310, h: 64, background: '/sprites/scenary/cascate-sprite2.png', frames: 4, frameSpeed: 3 },

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
        maxX: 900, // limite da direita (maior que x)
        grounded: true,
      },
      {
        id: 'enemy-2',
        x: 1240,
        y: 489,
        width: 50,
        height: 43,
        background: '/sprites/enemy.gif',
        direction: 1,
        speed: 1.4,
        minX: 1240, // limite da esquerda (menor que x)
        maxX: 1600, // limite da direita (maior que x)
        grounded: true,
      },
    ],
    items: [
      { id: 'coin-1', type: 'coin', x: 606, y: 273, w: 40, h: 40, background: '/sprites/items/coins.gif' },
      { id: 'gun-1', type: 'gun', x: 1908, y: 172, w: 40, h: 40, background: '/sprites/items/gun.png' },

      { id: 'coin-2', type: 'coin', x: 2009, y: initialY, w: 40, h: 40, background: '/sprites/items/coins.gif' },
      { id: 'coin-3', type: 'coin', x: 2009, y: initialY + gap, w: 40, h: 40, background: '/sprites/items/coins.gif' },
      { id: 'coin-4', type: 'coin', x: 2009, y: initialY + (gap * 2), w: 40, h: 40, background: '/sprites/items/coins.gif' },
      { id: 'coin-5', type: 'coin', x: 2009, y: initialY + (gap * 3), w: 40, h: 40, background: '/sprites/items/coins.gif' },
      { id: 'coin-6', type: 'coin', x: 2009, y: initialY + (gap * 4), w: 40, h: 40, background: '/sprites/items/coins.gif' },
      { id: 'coin-7', type: 'coin', x: 2009, y: initialY + (gap * 5), w: 40, h: 40, background: '/sprites/items/coins.gif' },

      { id: 'door-1', type: 'door', x: 2606, y: 392, w: 150, h: 150, background: '/sprites/door.png' },
      // { id: 'speed_boost-1', type: 'speed_boost', x: 610, y: 489, w: 60, h: 40, background: '/sprites/coins.png' },
    ],
    platforms: [
      { x: -10, y: 536, w: 1020, h: 70, background: '/sprites/scenary/floor.png', debug: false },
      { x: 597, y: 313, w: 170, h: 70, background: '/sprites/scenary/floor2.png', debug: false },
      { x: 900, y: 467, w: 80, h: 70, background: '/sprites/scenary/floor2.png', debug: false },
      { x: 1222, y: 536, w: 500, h: 70, background: '/sprites/scenary/floor.png', debug: false },

      { x: 1449, y: 360, w: 80, h: 70, background: '/sprites/scenary/floor2.png', debug: false },
      { x: 1529, y: 360, w: 80, h: 70, background: '/sprites/scenary/floor2.png', debug: false },
      { x: 1666, y: 218, w: 300, h: 70, background: '/sprites/scenary/floor2.png', debug: false },

      { x: 1970, y: 540, w: 800, h: 70, background: '/sprites/scenary/floor.png', debug: false },

      
    ],
}