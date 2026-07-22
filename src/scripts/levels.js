const levels = {
  1: {
    worldWidth: 2400,
    backgroundLevel: '/sprites/backgrounds/background1.png',
    backgroundItems: [
      { type: 'tree', x: 120, y: 428, w: 110, h: 150 },
      { type: 'tree', x: 620, y: 360, w: 110, h: 140 },
      { type: 'tree', x: 1460, y: 390, w: 110, h: 150 },
      { type: 'tree', x: 2060, y: 300, w: 100, h: 140 },
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
    backgroundItems: [
      { type: 'tree', x: 180, y: 360, w: 110, h: 140 },
      { type: 'tree', x: 980, y: 240, w: 110, h: 150 },
    ],
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

module.exports = {
  levels,
  getPlatforms,
  getWorldWidth,
  getBackgroundItems,
  setLevel,
  getCurrentLevel: () => currentLevel,
  getBackgroundLevel,
};
