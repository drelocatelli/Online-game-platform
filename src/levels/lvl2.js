module.exports = {
    worldWidth: 5000,
    backgroundLevel: '/sprites/backgrounds/background1.png',
    floorBackground: '/sprites/scenary/floor.png',
    backgroundItems: [
    ],
    enemies: [
      {
        id: 'enemy-1',
        x: 677,
        y: 337,
        width: 50,
        height: 43,
        background: '/sprites/enemy.gif',
        direction: 1,
        speed: 1.6,
        minX: 677, // limite da esquerda (menor que x)
        maxX: 1000, // limite da direita (maior que x)
        grounded: true,
      },
      {
        id: 'enemy-2',
        x: 865,
        y: 183,
        width: 50,
        height: 43,
        background: '/sprites/enemy.gif',
        direction: 1,
        speed: 1.6,
        minX: 865, // limite da esquerda (menor que x)
        maxX: 1042, // limite da direita (maior que x)
        grounded: true,
      },
    ],
    items: [
      { id: 'chest-1', type: 'chest', collect: 'gun', keyId: 'key-1', locked: true,  x: 1053, y: 150, w: 70, h: 70, background: '/sprites/items/chest_closed.png' },
      { id: 'key-1', type: 'key',  x: 820, y: 340, w: 36, h: 36, background: '/sprites/items/key.png' },
  
    ],
    platforms: [
      { x: 0, y: 536, w: 1020, h: 70, background: '/sprites/scenary/floor.png', debug: false },
      { x: 597, y: 380, w: 500, h: 40, background: '/sprites/scenary/floor2.png', debug: false },
      { x: 597, y: 350, w: 80, h: 40, background: '/sprites/scenary/floor2.png', debug: false },
      { x: 1017, y: 350, w: 80, h: 40, background: '/sprites/scenary/floor2.png', debug: false },

      { x: 780, y: 230, w: 350, h: 40, background: '/sprites/scenary/floor2.png', debug: false },
      { x: 1050, y: 210, w: 80, h: 40, background: '/sprites/scenary/floor2.png', debug: false },
      { x: 780, y: 210, w: 80, h: 40, background: '/sprites/scenary/floor2.png', debug: false },
      
    ],
}