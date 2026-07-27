module.exports = {
    worldWidth: 2400,
    backgroundLevel: '/sprites/backgrounds/background1.png',
    floorBackground: '/sprites/scenary/floor.png',
    backgroundItems: [
      { type: 'coconut_tree', x: 150, y: 350, w: 110, h: 200, background: '/sprites/scenary/coconut_tree.gif' },
      { type: 'coconut_tree', x: 300, y: 350, w: 110, h: 200, background: '/sprites/scenary/coconut_tree.gif' },
      { type: 'bush', x: 400, y: 452, w: 100, h: 90, background: '/sprites/scenary/bush.gif' },
    ],
    enemies: [
      {
        id: 'enemy-1',
        x: 700,
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
    platforms: [
      { x: -10, y: 536, w: 1020, h: 70, background: '/sprites/scenary/floor.png', debug: false },
      { x: 720, y: 399, w: 500, h: 70, background: '/sprites/scenary/floor2.png', debug: false },
      
    ],
}