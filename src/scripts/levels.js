const lvl1 = require('../levels/lvl1')
const lvl2 = require('../levels/lvl2')


const levels = {
  1: lvl1,
  2: lvl2,
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
