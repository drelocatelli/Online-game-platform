const lvl1 = require('../levels/lvl1')
const lvl2 = require('../levels/lvl2');
const { savePlayerPosition } = require('./functions');

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

function setLevel(player, newLevel, playerSpawn, moveSpeed, debug, onLevelChanged  = () => {}) {
  const p = player;
  const socketId = p.id

  if (p && levels && levels[newLevel]) {
    p.currentLevel = newLevel;

    const levelData = levels[newLevel];
    p.x = levelData.spawnX || playerSpawn.x;
    p.y = levelData.spawnY || playerSpawn.y;

    p.hasGun = false;
    p.equippedGunId = null;
    p.speed = moveSpeed;

    if (debug) {
      savePlayerPosition(p.id, p.x, p.y, p.currentLevel);
    }

    onLevelChanged(socketId, newLevel, levelData)
    

    console.log(`Jogador ${socketId} (ID: ${p.id}) mudou para o Level ${newLevel}`);
    return true;
  }

  return false;
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
  setLevel,
};
