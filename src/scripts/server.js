const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
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

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, '../public')));

const DEBUG = false;
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

  const color = colors[Object.keys(players).length % colors.length];
  players[socket.id] = {
    x: 50,
    y: 50,
    width: 20,
    height: 30,
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

    for (let enemy of enemies) {
      if (rectsIntersect(p, enemy) && !DEBUG) {
        resetPlayerToSpawn(p);
        break;
      }
    }
  }

  io.emit('state', { players, enemies });
}, 1000 / 60);

function resetPlayerToSpawn(player) {
  player.x = PLAYER_SPAWN.x;
  player.y = PLAYER_SPAWN.y;
  player.vx = 0;
  player.vy = 0;
  player.grounded = false;
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
