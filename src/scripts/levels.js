const lvl1 = require('../levels/lvl1')
const lvl2 = require('../levels/lvl2')


const levels = [
  lvl1,
  lvl2,
]

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
  return (levels[currentLevel] || levels[1]).floorBackground || '/sprites/scenary/floor.png';
}

function getItemsLevel() {
  return (levels[currentLevel] || levels[1]).items || [];
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
  getCurrentLevel: () => currentLevel,
  getBackgroundLevel,
  getItemsLevel,
};
