const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { getPlatforms, getWorldWidth, getCurrentLevel, setLevel } = require('./levels.js');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const GRAVITY = 0.6;
const FRICTION = 0.8;
const MOVE_SPEED = 5;
const JUMP_FORCE = -12;

const players = {};
const colors = ['#ff4d4d', '#4da6ff', '#4dff88', '#ffea4d', '#ff4dff'];

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../index.html'));
});

io.on('connection', (socket) => {
  console.log(`Jogador conectado: ${socket.id}`);

  const color = colors[Object.keys(players).length % colors.length];
  players[socket.id] = {
    x: 50, 
    y: 50,
    width: 30,
    height: 30,
    vx: 0,
    vy: 0,
    color: color,
    grounded: false,
    inputs: { left: false, right: false, up: false }
};

  // Envia o ID e as plataformas da fase atual para o jogador
  socket.emit('init', {
    id: socket.id,
    platforms: getPlatforms(),
    level: getCurrentLevel(),
    worldWidth: getWorldWidth()
  });

  socket.on('playerInput', (inputs) => {
    if (players[socket.id]) {
      players[socket.id].inputs = inputs;
    }
  });

  // Exemplo de evento para trocar de fase no servidor
  socket.on('changeLevel', (newLevel) => {
    if (setLevel(newLevel)) {
      io.emit('levelChanged', {
        level: getCurrentLevel(),
        platforms: getPlatforms(),
        worldWidth: getWorldWidth()
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Jogador desconectado: ${socket.id}`);
    delete players[socket.id];
  });
});

setInterval(() => {
  const currentPlatforms = getPlatforms(); // Obtém as plataformas ativas no momento

  for (let id in players) {
    const p = players[id];

    // Movimento Horizontal
    if (p.inputs.left) {
      p.vx = -MOVE_SPEED;
    } else if (p.inputs.right) {
      p.vx = MOVE_SPEED;
    } else {
      p.vx *= FRICTION;
    }

    // Pulo
    if (p.inputs.up && p.grounded) {
      p.vy = JUMP_FORCE;
      p.grounded = false;
    }

    // Gravidade
    p.vy += GRAVITY;

    // Movimento X + Colisão
    p.x += p.vx;
    handleCollision(p, true, currentPlatforms);

    // Movimento Y + Colisão
    p.y += p.vy;
    p.grounded = false;
    handleCollision(p, false, currentPlatforms);

    // Limites da tela nas laterais (X)
    const currentWorldWidth = getWorldWidth();
    if (p.x < 0) p.x = 0;
    if (p.x + p.width > currentWorldWidth) p.x = currentWorldWidth - p.width;

    // --- CHECAGEM DO LIMBO ---
    // Se o player passou da altura máxima do canvas (caiu no buraco)
    if (p.y > CANVAS_HEIGHT) {
      // Redefine para a posição inicial de spawn
      p.x = 50; 
      p.y = 50; 

      // Zera as velocidades
      p.vx = 0;
      p.vy = 0;
      p.grounded = false;
    }
  }

  io.emit('state', players);
}, 1000 / 60);

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
