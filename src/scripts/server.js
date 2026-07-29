const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const {
  getPlatforms,
  getWorldWidth,
  getBackgroundItems,
  getFloorBackground,
  getEnemiesLevel,
  getItemsLevel,
  levels,
} = require('./levels.js');

const DEBUG = false;
const SHOW_ROWS = false;

const SAVE_FILE = path.join(__dirname, 'saves', 'player_saves.json');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '../public')));

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const GRAVITY = 0.6;
const FRICTION = 0.8;
const MOVE_SPEED = 5;
const JUMP_FORCE = -16;
const ENEMY_SPEED = 1.6;
const PLAYER_SPAWN = { x: 50, y: 50 };

const players = {};
let enemies = [];
let items = [];
const bullets = [];

function loadAllLevelsData() {
  let allEnemies = [];
  let allItems = [];

  for (let levelNum in levels) {
    const lvl = levels[levelNum];

    if (lvl.enemies) {
      lvl.enemies.forEach((e) => {
        allEnemies.push({ ...e, level: Number(levelNum) });
      });
    }

    if (lvl.items) {
      lvl.items.forEach((i) => {
        allItems.push({ ...i, level: Number(levelNum) });
      });
    }
  }

  enemies = allEnemies;
  items = allItems;
}

loadAllLevelsData();

const colors = ['#ff4d4d', '#4da6ff', '#4dff88', '#ffea4d', '#ff4dff'];
const outfitHues = [0, 40, 80, 140, 200, 260, 320];

function cloneEnemies(levelEnemies) {
  return (levelEnemies || []).map((enemy) => ({ ...enemy }));
}

function cloneItems(levelItems) {
  return (levelItems || []).map((item) => ({ ...item }));
}

function loadSaves() {
  try {
    if (!fs.existsSync(SAVE_FILE)) {
      fs.writeFileSync(SAVE_FILE, JSON.stringify({}, null, 2), 'utf8');
      console.log('Arquivo player_saves.json criado com sucesso!');
      return {};
    }
    const data = fs.readFileSync(SAVE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Erro ao ler/criar arquivo de save:', err);
    return {};
  }
}

function savePlayerPosition(socketId, x, y, currentLevel = 1) {
  try {
    const saves = loadSaves();
    saves[socketId] = { x, y, currentLevel };

    // Garante que o diretório existe
    const dir = path.dirname(SAVE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Cria/sobrecreve o arquivo com os dados salvos
    fs.writeFileSync(SAVE_FILE, JSON.stringify(saves, null, 2), 'utf8');
    console.log(`[DEBUG] Save atualizado para ${socketId} em X: ${Math.round(x)}, Y: ${Math.round(y)}`);
  } catch (err) {
    console.error('Erro ao salvar no arquivo:', err);
  }
}

function pickUniqueOutfitHue() {
  const usedHues = new Set(Object.values(players).map((player) => player.outfitHue));
  const availableHues = outfitHues.filter((hue) => !usedHues.has(hue));

  if (availableHues.length > 0) {
    return availableHues[Math.floor(Math.random() * availableHues.length)];
  }

  return outfitHues[Math.floor(Math.random() * outfitHues.length)];
}

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../index.html'));
});

app.get('/game', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../game.html'));
});

io.on('connection', (socket) => {
  console.log(`Jogador conectado: ${socket.id}`);
  const playerId = DEBUG ? 'player1' : socket.id;

  let savedData = { x: PLAYER_SPAWN.x, y: PLAYER_SPAWN.y, currentLevel: 1 };
  if (DEBUG) {
    const saves = loadSaves();
    savedData = saves[playerId] || savedData;
  }

  const color = colors[Object.keys(players).length % colors.length];
  const targetLevel = savedData.currentLevel || 1;

  players[socket.id] = {
    id: playerId,
    x: savedData.x,
    y: savedData.y,
    width: 20,
    height: 30,
    lastSafeX: savedData.x,
    lastSafeY: savedData.y,
    vx: 0,
    vy: 0,
    color: color,
    grounded: false,
    facing: 'right',
    score: 0,
    hasGun: false,
    collectedItems: [],
    currentLevel: targetLevel,
    outfitHue: pickUniqueOutfitHue(),
    inputs: { left: false, right: false, up: false },
  };

  // Envia os dados filtrados apenas para a fase em que o jogador está entrando
  socket.emit('init', {
    id: socket.id,
    platforms: levels[targetLevel]?.platforms || getPlatforms(),
    level: targetLevel,
    worldWidth: levels[targetLevel]?.worldWidth || getWorldWidth(),
    backgroundItems: levels[targetLevel]?.backgroundItems || getBackgroundItems(),
    enemies: enemies.filter((e) => e.level === targetLevel),
    backgroundLevel: levels[targetLevel]?.backgroundLevel || null,
    floorBackground: levels[targetLevel]?.floorBackground || getFloorBackground(),
    items: items.filter((i) => i.level === targetLevel),
    debug: DEBUG,
    showRows: SHOW_ROWS,
  });

  socket.on('shot', () => {
    const player = players[socket.id];
    if (!player || !player.hasGun) return;

    player.lastShotTime = Date.now();
    const direction = player.facing === 'left' ? -1 : 1;

    const bullet = {
      id: Math.random().toString(),
      playerId: socket.id,
      currentLevel: player.currentLevel,
      x: direction === 1 ? player.x + player.width : player.x - 12,
      y: player.y - 6,
      w: 10,
      h: 10,
      vx: direction * 7,
      life: 50,
    };

    bullets.push(bullet);
    io.emit('playerShot', socket.id);
  });

  socket.on('playerInput', (inputs) => {
    if (players[socket.id]) {
      players[socket.id].inputs = inputs;
    }
  });

  socket.on('disconnect', () => {
    console.log(`Jogador desconectado: ${socket.id}`);

    if (DEBUG && players[socket.id]) {
      savePlayerPosition(players[socket.id].id, players[socket.id].x, players[socket.id].y, players[socket.id].currentLevel);
    }

    delete players[socket.id];

    // --- REINICIA O MUNDO QUANDO O ÚLTIMO JOGADOR SAIR ---
    if (Object.keys(players).length === 0) {
      loadAllLevelsData(); // Recarrega inimigos e itens originais de todos os níveis
      bullets.length = 0;   // Limpa projéteis soltos no mapa
      console.log('[SERVIDOR] Servidor zerado! Aguardando novos jogadores...');
    }
  });
});

setInterval(() => {
  // 1. Atualizar Inimigos
  for (let enemy of enemies) {
    enemy.x += enemy.direction * enemy.speed;

    if (enemy.x <= enemy.minX) {
      enemy.x = enemy.minX;
      enemy.direction = 1;
    }

    if (enemy.x + enemy.width >= enemy.maxX) {
      enemy.x = enemy.maxX - enemy.width;
      enemy.direction = -1;
    }
  }

  // 2. Atualizar Projéteis (Bolhas de Sabão) e Colisão com Inimigos
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.vx;
    b.life--;

    if (b.life <= 0) {
      bullets.splice(i, 1);
      continue;
    }

    let hitEnemy = false;
    for (let j = enemies.length - 1; j >= 0; j--) {
      const enemy = enemies[j];

      if (checkCollision(b, enemy)) {
        enemies.splice(j, 1);
        hitEnemy = true;
        break;
      }
    }

    if (hitEnemy) {
      bullets.splice(i, 1);
    }
  }

  // 3. Movimentação dos Jogadores e Colisão com Inimigos
  for (let id in players) {
    const p = players[id];
    const playerPlatforms = levels[p.currentLevel]?.platforms || getPlatforms();

    if (p.inputs.left) {
      p.vx = -MOVE_SPEED;
      p.facing = 'left';
    } else if (p.inputs.right) {
      p.vx = MOVE_SPEED;
      p.facing = 'right';
    } else {
      p.vx *= FRICTION;
    }

    if (p.inputs.up && p.grounded) {
      p.vy = JUMP_FORCE;
      p.grounded = false;
    }

    p.vy += GRAVITY;

    p.x += p.vx;
    handleCollision(p, true, playerPlatforms);

    p.y += p.vy;
    p.grounded = false;
    handleCollision(p, false, playerPlatforms);

    if (p.grounded) {
      p.lastSafeX = p.x;
      p.lastSafeY = p.y;
    }

    const currentWorldWidth = levels[p.currentLevel]?.worldWidth || getWorldWidth();
    if (p.x < 0) p.x = 0;
    if (p.x + p.width > currentWorldWidth) p.x = currentWorldWidth - p.width;

    if (p.y > CANVAS_HEIGHT) {
      resetPlayerToSpawn(p, true);
    }

    // Colisão do jogador com inimigos da mesma fase
    if (!DEBUG) {
      for (let enemy of enemies) {
        if (enemy.level === p.currentLevel && rectsIntersect(p, enemy)) {
          resetPlayerToSpawn(p);
          break;
        }
      }
    }
  }

  // 4. Colisão com Itens (fora do loop de players)
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];

    for (let id in players) {
      const p = players[id];

      // Ignora se o jogador já coletou este item antes
      if (p.collectedItems.includes(item.id)) continue;

      if (p.currentLevel === item.level && checkCollision(p, item)) {
        if (item.type === 'door') {
          setLevel(id, p.currentLevel + 1);
          break;
        }

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

          default:
            break;
        }

        // Registra que ESTE jogador coletou o item (sem remover do servidor)
        p.collectedItems.push(item.id);
        break;
      }
    }
  }

  // 5. Enviar estado atualizado para cada jogador
  for (let socketId in players) {
    const p = players[socketId];
    const pLevel = p.currentLevel || 1;

    // Filtra itens da fase atual que o jogador AINDA NÃO coletou
    const visibleItems = items.filter(
      (i) => i.level === pLevel && !p.collectedItems.includes(i.id)
    );

    io.to(socketId).emit('state', {
      players: players,
      enemies: enemies.filter((e) => e.level === pLevel),
      items: visibleItems,
      bullets: bullets.filter((b) => b.currentLevel === pLevel),
    });
  }
}, 1000 / 60);

function resetAllItems() {
  items = cloneItems(getItemsLevel());
  console.log('[SERVIDOR] Todos os jogadores saíram. Itens e progresso de mapa resetados!');
}

function reloadLevelData(levelNum) {
  if (levels && levels[levelNum]) {
    enemies.length = 0;
    enemies.push(...cloneEnemies(levels[levelNum].enemies || []));
    items = cloneItems(levels[levelNum].items || []);
  }
}

function setLevel(socketId, newLevel) {
  const p = players[socketId];

  if (p && levels && levels[newLevel]) {
    p.currentLevel = newLevel;

    const levelData = levels[newLevel];
    p.x = levelData.spawnX || PLAYER_SPAWN.x;
    p.y = levelData.spawnY || PLAYER_SPAWN.y;

    p.hasGun = false;
    p.equippedGunId = null;
    p.speed = MOVE_SPEED;

    if (DEBUG) {
      savePlayerPosition(p.id, p.x, p.y, p.currentLevel);
    }

    io.to(socketId).emit('levelChanged', {
      levelNumber: newLevel,
      levelData,
    });

    console.log(`Jogador ${socketId} (ID: ${p.id}) mudou para o Level ${newLevel}`);
    return true;
  }

  return false;
}

if (DEBUG) {
  setInterval(() => {
    let changed = false;
    const saves = loadSaves();
    for (let id in players) {
      const p = players[id];
      const lastSave = saves[p.id];

      // Checa se mudou X, Y ou Nível
      if (
        !lastSave ||
        Math.round(lastSave.x) !== Math.round(p.x) ||
        Math.round(lastSave.y) !== Math.round(p.y) ||
        lastSave.currentLevel !== p.currentLevel
      ) {
        saves[p.id] = {
          x: p.x,
          y: p.y,
          currentLevel: p.currentLevel || 1, // ✅ Preserva a propriedade do Nível
        };
        changed = true;
      }
    }

    if (changed) {
      try {
        const dir = path.dirname(SAVE_FILE);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(SAVE_FILE, JSON.stringify(saves, null, 2), 'utf8');
      } catch (err) {
        console.error('Erro no autosave:', err);
      }
    }
  }, 1000);
}

function respawnLevelItems(levelNum) {
  // Remove do servidor apenas os itens do nível atual
  items = items.filter(i => i.level !== levelNum);

  // Recarrega os itens originais daquele nível a partir do arquivo levels.js
  if (levels[levelNum] && levels[levelNum].items) {
    levels[levelNum].items.forEach((i) => {
      items.push({ ...i, level: Number(levelNum) });
    });
  }
}

function resetPlayerToSpawn(player, resetItems = false) {
  if (!player) return;

  if (DEBUG && player.lastSafeX !== undefined && player.lastSafeY !== undefined) {
    player.x = player.lastSafeX;
    player.y = player.lastSafeY;

    savePlayerPosition(player.id, player.x, player.y, player.currentLevel);
  } else {
    player.x = PLAYER_SPAWN.x;
    player.y = PLAYER_SPAWN.y;
  }

  if(resetItems) {
    respawnLevelItems(player.currentLevel);
    player.score = 0;
  }
  
  player.vx = 0;
  player.vy = 0;
  player.grounded = false;
  player.inputs = { left: false, right: false, up: false };
  player.hasGun = false;
  player.collectedItems = [];
}

function rectsIntersect(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function rectsIntersect(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function handleCollision(player, isHorizontal, platforms) {
  for (let plat of platforms) {
    if (player.x < plat.x + plat.w && player.x + player.width > plat.x && player.y < plat.y + plat.h && player.y + player.height > plat.y) {
      if (isHorizontal) {
        if (player.vx > 0) player.x = plat.x - player.width;
        else if (player.vx < 0) player.x = plat.x + plat.w;
        player.vx = 0;
      } else {
        if (player.vy > 0) {
          player.y = plat.y - player.height;
          player.grounded = true;
        } else if (player.vy < 0) {
          player.y = plat.y + plat.h;
        }
        player.vy = 0;
      }
    }
  }
}

function checkCollision(rect1, rect2) {
  const r1W = rect1.w || rect1.width || 30;
  const r1H = rect1.h || rect1.height || 30;
  const r2W = rect2.w || rect2.width || 30;
  const r2H = rect2.h || rect2.height || 30;

  return rect1.x < rect2.x + r2W && rect1.x + r1W > rect2.x && rect1.y < rect2.y + r2H && rect1.y + r1H > rect2.y;
}

const PORT = process.env.PORT || 3901;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
