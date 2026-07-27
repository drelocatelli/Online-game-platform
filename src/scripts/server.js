const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs  = require('fs')
const {
  getPlatforms,
  getWorldWidth,
  getBackgroundItems,
  getCurrentLevel,
  setLevel,
  getBackgroundLevel,
  getFloorBackground,
  getEnemiesLevel,
} = require('./levels.js');

const DEBUG = true;
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
const JUMP_FORCE = -12;
const ENEMY_SPEED = 1.6;
const PLAYER_SPAWN = { x: 50, y: 50 };

const players = {};
const enemies = [];
const colors = ['#ff4d4d', '#4da6ff', '#4dff88', '#ffea4d', '#ff4dff'];
const outfitHues = [0, 40, 80, 140, 200, 260, 320];

function cloneEnemies(levelEnemies) {
  return (levelEnemies || []).map((enemy) => ({ ...enemy }));
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

function savePlayerPosition(socketId, x, y) {
  try {
    const saves = loadSaves();
    saves[socketId] = { x, y };

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
  let savedPos = PLAYER_SPAWN;
  if (DEBUG) {
    const saves = loadSaves();
    savedPos = saves[playerId] || PLAYER_SPAWN;
  }
  const color = colors[Object.keys(players).length % colors.length];
  players[socket.id] = {
    id: playerId,
    x: savedPos.x,
    y: savedPos.y,
    width: 20,
    height: 30,
    lastSafeX: PLAYER_SPAWN.x, // Salva a última posição segura em X
    lastSafeY: PLAYER_SPAWN.y, // Salva a última posição segura em Y
    vx: 0,
    vy: 0,
    color: color,
    grounded: false,
    facing: 'right',
    outfitHue: pickUniqueOutfitHue(),
    inputs: { left: false, right: false, up: false }
  };


  enemies.length = 0;
  enemies.push(...cloneEnemies(getEnemiesLevel()));

  socket.emit('init', {
    id: socket.id,
    platforms: getPlatforms(),
    level: getCurrentLevel(),
    worldWidth: getWorldWidth(),
    backgroundItems: getBackgroundItems(),
    enemies: cloneEnemies(getEnemiesLevel()),
    backgroundLevel: getBackgroundLevel(),
    floorBackground: getFloorBackground(),
    debug: DEBUG
  });

  socket.on('playerInput', (inputs) => {
    if (players[socket.id]) {
      players[socket.id].inputs = inputs;
    }
  });


  socket.on('changeLevel', (newLevel) => {
    if (setLevel(newLevel)) {
      enemies.length = 0;
      enemies.push(...cloneEnemies(getEnemiesLevel()));

      io.emit('levelChanged', {
        level: getCurrentLevel(),
        platforms: getPlatforms(),
        worldWidth: getWorldWidth(),
        backgroundItems: getBackgroundItems(),
        enemies: cloneEnemies(getEnemiesLevel()),
        backgroundLevel: getBackgroundLevel(),
        floorBackground: getFloorBackground(),
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Jogador desconectado: ${socket.id}`);
    
    if (DEBUG && players[socket.id]) {
      // Salva a posição final usando o ID fixo ('player1')
      savePlayerPosition(players[socket.id].id, players[socket.id].x, players[socket.id].y);
    }

    delete players[socket.id];
  });
});

enemies.push(...cloneEnemies(getEnemiesLevel()));

setInterval(() => {
  const currentPlatforms = getPlatforms();

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

  for (let id in players) {
    const p = players[id];


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
    handleCollision(p, true, currentPlatforms);


    p.y += p.vy;
    p.grounded = false;
    handleCollision(p, false, currentPlatforms);


    const currentWorldWidth = getWorldWidth();
    if (p.x < 0) p.x = 0;
    if (p.x + p.width > currentWorldWidth) p.x = currentWorldWidth - p.width;

    if (p.y > CANVAS_HEIGHT) {
      resetPlayerToSpawn(p);
    }

    if(!DEBUG)
    for (let enemy of enemies) {
      if (rectsIntersect(p, enemy)) {
        resetPlayerToSpawn(p);
        break;
      }
    }
  }

  io.emit('state', { players, enemies });
}, 1000 / 60);

function resetPlayerToSpawn(player) {
  if (!player) return;

  if (DEBUG && player.lastSafeX !== undefined && player.lastSafeY !== undefined) {
    player.x = player.lastSafeX;
    player.y = player.lastSafeY;

    // Salva usando o id que está gravado no player
    savePlayerPosition(player.id, player.x, player.y);
  } else {
    player.x = PLAYER_SPAWN.x;
    player.y = PLAYER_SPAWN.y;
  }

  player.vx = 0;
  player.vy = 0;
  player.grounded = false;
  player.inputs = { left: false, right: false, up: false };
}

function rectsIntersect(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
