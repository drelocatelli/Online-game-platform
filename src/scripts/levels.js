const levels = {
  1: {
    worldWidth: 2400,
    backgroundLevel: '/sprites/backgrounds/background1.png',
    floorBackground: '/sprites/scenary/floor1.png',
    backgroundItems: [
      { type: 'tree', x: 80, y: 436, w: 110, h: 150, background: '/sprites/scenary/tree.png' },
      { type: 'tree', x: 500, y: 373, w: 110, h: 140, background: '/sprites/scenary/tree.png' },
      { type: 'tree', x: 1460, y: 353, w: 110, h: 150, background: '/sprites/scenary/tree.png' },
    ],
    enemies: [
      {
        id: 'enemy-1',
        x: 250,
        y: 476,
        width: 28,
        height: 28,
        background: '/sprites/enemy.svg',
        direction: 1,
        speed: 1.6,
        minX: 200,
        maxX: 380,
        grounded: true,
      },
      {
        id: 'enemy-2',
        x: 760,
        y: 415,
        width: 28,
        height: 28,
        background: '/sprites/enemy.svg',
        direction: 1,
        speed: 1.6,
        minX: 720,
        maxX: 810,
        grounded: true,
      },
      {
        id: 'enemy-3',
        x: 1440,
        y: 455,
        width: 28,
        height: 28,
        background: '/sprites/enemy.svg',
        direction: -1,
        speed: 1.6,
        minX: 1400,
        maxX: 1540,
        grounded: true,
      },
    ],
    platforms: [

      { x: 0, y: 575, w: 200, h: 20, color: '#e94560' },
      { x: 200, y: 500, w: 200, h: 20, color: '#e94560' },
      { x: 500, y: 500, w: 150, h: 20, color: '#e94560' },


      { x: 720, y: 440, w: 100, h: 20, color: '#e94560' },
      { x: 880, y: 380, w: 90, h: 20, color: '#e94560' },
      { x: 1040, y: 320, w: 110, h: 20, color: '#e94560' },


      { x: 1220, y: 420, w: 120, h: 20, color: '#e94560' },
      { x: 1400, y: 480, w: 160, h: 20, color: '#e94560' },



      { x: 1630, y: 400, w: 80, h: 20, color: '#e94560' },
      { x: 1780, y: 310, w: 70, h: 20, color: '#e94560' },
      { x: 1920, y: 220, w: 90, h: 20, color: '#e94560' },


      { x: 2080, y: 280, w: 100, h: 20, color: '#e94560' },


      { x: 2240, y: 200, w: 140, h: 20, color: '#ff2e63' },
    ],
  },
  2: {
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
  },
};

let currentLevel = 1;

function getPlatforms() {
  return (levels[currentLevel] || levels[1]).platforms;
}

function getWorldWidth() {
  return (levels[currentLevel] || levels[1]).worldWidth;
}

function getBackgroundItems() {
  return (levels[currentLevel] || levels[1]).backgroundItems || [];
}

function getFloorBackground() {
  return (levels[currentLevel] || levels[1]).floorBackground || '/sprites/scenary/floor1.png';
}

function setLevel(levelNumber) {
  if (levels[levelNumber]) {
    currentLevel = levelNumber;
    return true;
  }
  return false;
}

function getBackgroundLevel() {
  return (levels[currentLevel] || levels[1]).backgroundLevel || '#1d3557';
}

function getEnemiesLevel() {
  return (levels[currentLevel] || levels[1]).enemies || [];
}

module.exports = {
  levels,
  getPlatforms,
  getWorldWidth,
  getBackgroundItems,
  getFloorBackground,
  getEnemiesLevel,
  setLevel,
  getCurrentLevel: () => currentLevel,
  getBackgroundLevel,
};
