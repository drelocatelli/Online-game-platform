const {levels} = require("./levels");

function handleItems(p, item, playerSpawn, moveSpeed, emitter) {
  if (item.type === 'door') {
    return handleDoor(p, playerSpawn, moveSpeed, emitter);
  }

  if(item.type === 'chest') {
    return handleChest(p, item.collect, item.id);
  }

  // Demais itens
  switch (item.type) {
    case 'coin':
      p.score = (p.score || 0) + (item.value || 1);
      break;

    case 'speed_boost':
      p.speed = 8;
      break;

    case 'gun':
      p.hasGun = true;
      p.equippedGunId = item.id;
      break;
  }

  if (item.id) {
    p.collectedItems.push(item.id);
  }

  return p;
}

function handleChest(p, collect, e) {
    if(collect === 'gun') {
        p.hasGun = true;
        p.equippedGunId = itemId;
    }
}

function handleDoor(p, playerSpawn, moveSpeed, emitter) {
    const currentLevelNum = parseInt(p.currentLevel, 10) || 1;
    const nextLevel = currentLevelNum + 1;

    const levelData = levels[nextLevel];

    if (levelData) {
      // 1. Atualiza o nível do player
      p.currentLevel = nextLevel;

      // 2. Define as novas coordenadas de spawn
      const newX = levelData.spawnX !== undefined ? levelData.spawnX : playerSpawn.x;
      const newY = levelData.spawnY !== undefined ? levelData.spawnY : playerSpawn.y;

      p.x = newX;
      p.y = newY;

      // 3. Atualiza os pontos de segurança do modo DEBUG
      p.lastSafeX = newX;
      p.lastSafeY = newY;

      // 4. Reseta física e itens
      p.vx = 0;
      p.vy = 0;
      p.hasGun = false;
      p.equippedGunId = null;
      p.speed = moveSpeed;
      p.collectedItems = [];

      // 5. Emite para o server tratar a transição do cliente
      if (emitter) {
        emitter.emit('levelChanged', {
          socketId: p.socketId,
          playerId: p.id,
          newLevel: nextLevel,
          levelData,
        });
      }
    }

    return true;
}

module.exports = {
    handleItems
}