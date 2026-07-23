module.exports = {
     worldWidth: 2000,
    backgroundLevel: '#f4a261',
    floorBackground: '/sprites/scenary/floor1.png',
    backgroundItems: [
      { type: 'tree', x: 180, y: 360, w: 110, h: 140, background: '/sprites/scenary/tree.png' },
      { type: 'tree', x: 980, y: 240, w: 110, h: 150, background: '/sprites/scenary/tree.png' },
    ],
    enemies: [],
    platforms: [
      { x: 50, y: 520, w: 1800, h: 20, color: '#00adb5' },
      { x: 500, y: 380, w: 200, h: 20, color: '#00adb5' },
      { x: 1100, y: 280, w: 200, h: 20, color: '#00adb5' },
    ],
}