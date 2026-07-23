module.exports = {
    worldWidth: 2400,
    backgroundLevel: '/sprites/backgrounds/background1.png',
    floorBackground: '/sprites/scenary/floor2.png',
    backgroundItems: [
      { type: 'tree', x: 200, y: 342, w: 110, h: 200, background: '/sprites/scenary/tree.gif' },
      { type: 'tree', x: 400, y: 342, w: 110, h: 200, background: '/sprites/scenary/tree.gif' },
    ],
    enemies: [
      {
        id: 'enemy-1',
        x: 700,
        y: 486,
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
      { x: 0, y: 530, w: 1000, h: 70, color: '#e94560', debug: false },
      
    ],
}