 const socket = io();
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  // ==========================================
  // CONFIGURAÇÕES DE ESCALA VISUAL
  // ==========================================
  const PLAYER_RENDER_SCALE = 2.9; // Aumentou o Player (Era 1.5)
  const ITEM_RENDER_SCALE = 5.4; // <--- NOVO: Aumenta as árvores/itens
  const FLOOR_TILE_SCALE = 1.5; // <--- NOVO: Aumenta a textura do chão/plataforma

  let isWalkGifLoaded = false;
  let isEnemyGifLoaded = false;

  const spriteImages = {
    idle: new Image(),
    walk: new Image(),
    jump: new Image(),
    enemy: new Image(),
    tree: new Image(),
    floor: new Image(),
    player_with_gun: new Image(),
  };

  const backgroundCache = {};

  spriteImages.idle.src = '/sprites/idle.png';
  spriteImages.walk.src = '/sprites/walk.gif';
  spriteImages.jump.src = '/sprites/jump.png';
  spriteImages.enemy.src = '/sprites/enemy.gif';
  spriteImages.tree.src = '/sprites/scenary/tree.png';
  spriteImages.floor.src = '/sprites/scenary/floor.png';
  spriteImages.player_with_gun.src = '/sprites/player_with_gun.png';

  let myId = null;
  
  let players = {};
  let enemies = [];
  let items = [];
  let bullets = [];
  let backgroundItems = [];
  
  let platforms = [];
  

  let worldWidth = 800;
  let cameraX = 0;
  let currentLevel = 1;
  let backgroundLevel;
  let floorBackground;
  let debug = false;
  let showRows = false;
  let globalAnimTimer = 0;

  const imageCache = {};
  const gifCache = {};

  const walkSprite = loadGif('/sprites/walk.gif');
  const enemySprite = loadGif('/sprites/enemy.gif');

  // Posição do mouse
  const mouse = { x: 0, y: 0 };

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;

  // --- GERENCIAMENTO DE INPUTS (TECLADO) ---
  const keys = {
    left: false,
    right: false,
    up: false,
  };

  function onDrawWalkFrame(ctx, frame) {
    // Ajusta o tamanho do canvas para a dimensão do frame atual
    ctx.canvas.width = frame.width;
    ctx.canvas.height = frame.height;

    // Limpa e desenha o frame buffer do GIF
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(frame.buffer, frame.x, frame.y, frame.width, frame.height);

    isWalkGifLoaded = true;
  }

  function onDrawEnemyFrame(ctx, frame) {
    ctx.canvas.width = frame.width;
    ctx.canvas.height = frame.height;
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(frame.buffer, frame.x, frame.y, frame.width, frame.height);
    isEnemyGifLoaded = true;
  }

  function getGif(url) {
    if (!url) return null;

    if (gifCache[url]) {
      return gifCache[url];
    }

    const gifCanvas = document.createElement('canvas');
    const gifData = {
      canvas: gifCanvas,
      isLoaded: false,
    };

    gifCache[url] = gifData;

    try {
      gifler(url).frames(gifCanvas, (gifCtx, frame) => {
        // Ajusta o tamanho APENAS na primeira vez que carrega:
        if (gifCtx.canvas.width !== frame.width) {
          gifCtx.canvas.width = frame.width;
          gifCtx.canvas.height = frame.height;
        }

        gifCtx.globalCompositeOperation = 'source-over';
        gifCtx.drawImage(frame.buffer, frame.x, frame.y, frame.width, frame.height);
        gifData.isLoaded = true;
      });
    } catch (e) {
      console.error('Erro ao carregar GIF:', url, e);
    }

    return gifData;
  }

  // Função auxiliar que cria o canvas e gerencia o GIF
  function loadGif(url) {
    const gifCanvas = document.createElement('canvas');
    const gifData = {
      canvas: gifCanvas,
      isLoaded: false,
    };

    gifler(url).frames(gifCanvas, (gifCtx, frame) => {
      gifCtx.canvas.width = frame.width;
      gifCtx.canvas.height = frame.height;
      gifCtx.globalCompositeOperation = 'source-over';
      gifCtx.drawImage(frame.buffer, frame.x, frame.y, frame.width, frame.height);

      gifData.isLoaded = true; // Avisa que o primeiro frame já carregou
    });

    return gifData;
  }

  function sendInputs() {
    socket.emit('playerInput', keys);
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'j' || e.key === 'J' || e.key === 'k' || e.key === 'K') {
      if (myId && players[myId] && players[myId].hasGun) {
        socket.emit('shot'); // Emite o tiro pro servidor
      }
    }

    let changed = false;
    if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
      if (!keys.left) {
        keys.left = true;
        changed = true;
      }
    }
    if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
      if (!keys.right) {
        keys.right = true;
        changed = true;
      }
    }
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp' || e.key === ' ') {
      if (!keys.up) {
        keys.up = true;
        changed = true;
      }
    }
    if (e.key === 'l' || e.key === 'L') {
      currentLevel = currentLevel === 1 ? 2 : 1;
      socket.emit('changeLevel', currentLevel);
    }

    if (changed) sendInputs();
  });

  window.addEventListener('keyup', (e) => {
    let changed = false;
    if (e.key === 'a' || e.key === 'A' || e.key === 'ArrowLeft') {
      keys.left = false;
      changed = true;
    }
    if (e.key === 'd' || e.key === 'D' || e.key === 'ArrowRight') {
      keys.right = false;
      changed = true;
    }
    if (e.key === 'w' || e.key === 'W' || e.key === 'ArrowUp' || e.key === ' ') {
      keys.up = false;
      changed = true;
    }

    if (changed) sendInputs();
  });

  // --- RASTREAMENTO DO MOUSE ---
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();

    // Proporção do tamanho nativo (800x600) em relação ao tamanho exibido na tela
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Calcula a posição EXATA dentro da resolução 800x600 do jogo
    mouse.x = Math.round((e.clientX - rect.left) * scaleX);
    mouse.y = Math.round((e.clientY - rect.top) * scaleY);
  });

  // --- EVENTOS SOCKET.IO ---

  socket.on('init', (data) => {
    myId = data.id;
    platforms = data.platforms;
    worldWidth = data.worldWidth;
    currentLevel = data.level || currentLevel;
    backgroundItems = data.backgroundItems || [];
    enemies = data.enemies || [];
    items = data.items || [];
    backgroundLevel = data.backgroundLevel || backgroundLevel;
    floorBackground = data.floorBackground || floorBackground;
    debug = data.debug || false;
    showRows = data.showRows || false
  });

  socket.on('state', (serverState) => {
    players = serverState.players || serverState;

    // Atualiza a pontuação do jogador local no HTML
    if (myId && players[myId]) {
      const myScore = players[myId].score || 0;
      const scoreElement = document.getElementById('score-val');
      if (scoreElement) {
        scoreElement.innerText = myScore;
      }

      const hasGun = players[myId].hasGun || false;
      const bulletElement = document.getElementById('bullet-val');
      if (bulletElement) {
        bulletElement.innerText = hasGun ? 'true' : 'false';
      }
    }

    enemies = serverState.enemies || [];
    items = serverState.items || [];
    bullets = serverState.bullets || [];
    render();
  });

  socket.on('levelChanged', (data) => {
    platforms = data.platforms;
    worldWidth = data.worldWidth;
    currentLevel = data.level || currentLevel;
    backgroundItems = data.backgroundItems || [];
    enemies = data.enemies || [];
    items = data.items || [];
    backgroundLevel = data.backgroundLevel || backgroundLevel;
    floorBackground = data.floorBackground || floorBackground;
    render();
  });

  function getPlayerSprite(player) {
    if (player.hasGun) {
      return spriteImages.player_with_gun;
    }

    if (!player.grounded && player.vy < 0) {
      return spriteImages.jump;
    }

    if (Math.abs(player.vx) > 0.5) {
      return 'walk';
    }

    return spriteImages.idle;
  }

  function drawCollectibleItem(item) {
    const x = item.x ?? 0;
    const y = item.y ?? 0;
    const w = item.w ?? item.width ?? 30;
    const h = item.h ?? item.height ?? 30;

    const imagePath = item.background || item.sprite || item.image || '/sprites/coin.gif';
    const sprite = getSprite(imagePath);

    let drawn = false;

    if (sprite) {
      if (sprite.isGif && sprite.isLoaded) {
        ctx.drawImage(sprite.canvas, x, y, w, h);
        drawn = true;
      } else if (!sprite.isGif && sprite.image.complete && sprite.image.naturalWidth > 0) {
        ctx.drawImage(sprite.image, x, y, w, h);
        drawn = true;
      }
    }

    if(item.gun) {
      makeGun(ctx, item)
    }

    // Se a imagem/GIF ainda não carregou, desenha um círculo amarelo para garantir visibilidade
    if (!drawn) {
      ctx.save();
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#B8860B';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
  }

  function makeGun(ctx, item) {
    
    
  }
  
  function getSpriteImage(src) {
    if (!src) return null;
    if (!imageCache[src]) {
      const img = new Image();
      img.src = src;
      imageCache[src] = img;
    }
    return imageCache[src];
  }

  function drawBackgroundItem(ctx, item) {
    if (!item) return;
    const itemBg = item.background || '/sprites/scenary/tree.png';

    const x = item.x || 0;
    const y = item.y || 0;
    const w = item.w || item.width || 50;
    const h = item.h || item.height || 50;

    // Se for arquivo .gif
    if (itemBg.endsWith('.gif')) {
      const gifData = getGif(itemBg);
      if (gifData && gifData.isLoaded) {
        ctx.drawImage(gifData.canvas, x, y, w, h);
      }
      return;
    }

    // Se for Spritesheet (PNG/JPG) com múltiplos quadros
    const img = getSpriteImage(itemBg);
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const totalFrames = item.frames || (itemBg.includes('cascate') ? 12 : 1);

    if (totalFrames > 1) {
      const frameWidth = img.naturalWidth / totalFrames;
      const frameHeight = img.naturalHeight;
      const speed = item.frameSpeed || 4;

      const currentFrame = Math.floor(globalAnimTimer / speed) % totalFrames;

      ctx.drawImage(
        img,
        currentFrame * frameWidth,
        0,
        frameWidth,
        frameHeight,
        x,
        y,
        w,
        h
      );
    } else {
      ctx.drawImage(img, x, y, w, h);
    }
  }
  
  function drawPlayerSprite(player) {
    const sprite = getPlayerSprite(player);

    // Se estiver andando mas o GIF ainda não carregou, usa fallback de cor
    if (sprite === 'walk' && !walkSprite.isLoaded) {
      ctx.fillStyle = player.color;
      ctx.fillRect(player.x, player.y - 14, player.width, player.height);
      return;
    }

    // Se for Idle/Jump/Com arma e a imagem não carregou
    if (sprite !== 'walk' && (!sprite || !sprite.complete)) {
      ctx.fillStyle = player.color;
      ctx.fillRect(player.x, player.y - 14, player.width, player.height);
      return;
    }

    const facing = player.facing || (player.vx < 0 ? 'left' : 'right');
    const drawWidth = player.width * PLAYER_RENDER_SCALE;
    const drawHeight = player.height * PLAYER_RENDER_SCALE;
    const outfitHue = player.outfitHue || 0;

    ctx.save();
    ctx.filter = `hue-rotate(${outfitHue}deg) saturate(1.15) brightness(1.03)`;

    ctx.translate(player.x + player.width / 2, player.y - 14 + player.height + 20);

    if (facing === 'left') {
      ctx.scale(-1, 1);
    }

    // Se for 'walk', usa nosso walkGifCanvas; caso contrário, a imagem normal
    const imageToDraw = sprite === 'walk' ? walkSprite.canvas : sprite;

    ctx.drawImage(imageToDraw, -drawWidth / 2, -drawHeight, drawWidth, drawHeight);
    ctx.restore();
  }

  function drawEnemySprite(enemy) {
    // Pega a URL vinda do backend ou usa uma padrão
    const gifUrl = enemy.background || '/sprites/enemy.gif';
    const enemyGif = getGif(gifUrl);

    const drawWidth = enemy.width * 1.25;
    const drawHeight = enemy.height * 1.25;

    ctx.save();
    ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);

    if (enemy.direction < 0) {
      ctx.scale(-1, 1);
    }

    // Se o GIF do inimigo já baixou o 1º frame, desenha ele
    if (enemyGif && enemyGif.isLoaded) {
      ctx.drawImage(enemyGif.canvas, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    } else {
      // Fallback vermelho enquanto o GIF carrega
      ctx.fillStyle = enemy.color || 'red';
      ctx.fillRect(-enemy.width / 2, -enemy.height / 2, enemy.width, enemy.height);
    }

    ctx.restore();
  }



  function getSprite(src) {
    if (!src) return null;

    // Se for um GIF, usa a lógica do Gifler
    if (src.endsWith('.gif')) {
      if (gifCache[src]) return gifCache[src];

      const gifCanvas = document.createElement('canvas');
      const gifData = { canvas: gifCanvas, isLoaded: false, isGif: true };
      gifCache[src] = gifData;

      gifler(src).frames(gifCanvas, (gifCtx, frame) => {
        gifCtx.canvas.width = frame.width;
        gifCtx.canvas.height = frame.height;
        gifCtx.globalCompositeOperation = 'source-over';
        gifCtx.drawImage(frame.buffer, frame.x, frame.y, frame.width, frame.height);
        gifData.isLoaded = true;
      });

      return gifData;
    }

    // Se for Imagem Normal (.png, .jpg, etc.)
    if (!imageCache[src]) {
      const img = new Image();
      img.src = src;
      imageCache[src] = img;
    }

    return { image: imageCache[src], isLoaded: imageCache[src].complete, isGif: false };
  }

  function drawPlatformSprite(plat) {
    // 1. Define o raio das bordas (padrão 12px, ou customizado via JSON)
    const borderRadius = plat.borderRadius !== undefined ? plat.borderRadius : 12;

    // 2. Busca a textura/imagem
    const textureSource = plat.background || floorBackground || '/sprites/scenary/floor.png';
    const sprite = getSprite(textureSource);

    ctx.save();

    // --- MÁSCARA COM TODAS AS BORDAS ARREDONDADAS ---
    ctx.beginPath();
    if (ctx.roundRect) {
      // Método nativo moderno para 4 bordas arredondadas
      ctx.roundRect(plat.x, plat.y, plat.w, plat.h, borderRadius);
    } else {
      // Fallback manual para navegadores mais antigos
      ctx.moveTo(plat.x + borderRadius, plat.y);
      ctx.arcTo(plat.x + plat.w, plat.y, plat.x + plat.w, plat.y + plat.h, borderRadius);
      ctx.arcTo(plat.x + plat.w, plat.y + plat.h, plat.x, plat.y + plat.h, borderRadius);
      ctx.arcTo(plat.x, plat.y + plat.h, plat.x, plat.y, borderRadius);
      ctx.arcTo(plat.x, plat.y, plat.x + plat.w, plat.y, borderRadius);
    }
    ctx.closePath();

    // Recorta o canvas no formato totalmente arredondado
    ctx.clip();

    // --- DESENHO DA TEXTURA ---
    if (sprite) {
      if (sprite.isGif && sprite.isLoaded) {
        const tileW = sprite.canvas.width;
        for (let x = plat.x; x < plat.x + plat.w; x += tileW) {
          ctx.drawImage(sprite.canvas, x, plat.y, tileW, plat.h);
        }
      } else if (!sprite.isGif && sprite.image.complete && sprite.image.naturalWidth > 0) {
        const img = sprite.image;
        const scale = plat.h / img.naturalHeight;
        const tileW = img.naturalWidth * scale;
        const tileH = plat.h;

        for (let x = plat.x; x < plat.x + plat.w; x += tileW) {
          ctx.drawImage(img, x, plat.y, tileW, tileH);
        }
      } else {
        ctx.fillStyle = plat.color || '#e94560';
        ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
      }
    } else {
      ctx.fillStyle = plat.color || '#e94560';
      ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
    }

    ctx.restore();

    // --- BORDA DE ugUG ---
    if (plat.debug || (debug && showRows)) {
      ctx.save();
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);
      ctx.restore();
    }
  }

  function getBackgroundImage(src) {
    if (!src) return null;
    if (!imageCache[src]) {
      const img = new Image();
      img.src = src;
      imageCache[src] = img;
    }
    return imageCache[src];
  }

  function drawFixedBackground() {
    const baseBackground = backgroundLevel || '#1d3557';

    if (typeof baseBackground === 'string' && baseBackground.startsWith('/')) {
      const backgroundImage = getBackgroundImage(baseBackground);

      if (backgroundImage.complete) {
        ctx.drawImage(backgroundImage, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        return;
      }
    }

    ctx.fillStyle = baseBackground;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  // --- RENDERIZAÇÃO E CÂMERA ---
  function render() {
    // 1. Limpa a tela
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 2. Desenha o fundo fixo na tela
    drawFixedBackground();

    // 3. Calcula a posição da Câmera
    const myPlayer = players[myId];
    if (myPlayer) {
      cameraX = myPlayer.x - CANVAS_WIDTH / 2 + myPlayer.width / 2;
      cameraX = Math.max(0, Math.min(cameraX, worldWidth - CANVAS_WIDTH));
    }

    // 4. Salva o estado original do Canvas
    ctx.save();

    // 5. Move o mundo inteiro para a esquerda com base no Scroll
    ctx.translate(-cameraX, 0);

    // --- DESENHAR O JOGO (Afetado pela câmera) ---

    backgroundItems.forEach((item) => {
      drawBackgroundItem(ctx, item);
    });

    // Desenhar Plataformas
    platforms.forEach((plat) => {
      drawPlatformSprite(plat);
    });

    enemies.forEach((enemy) => {
      drawEnemySprite(enemy);
    });

    //  Renderiza os Itens Coletáveis
    if (Array.isArray(items)) {
      items.forEach((item) => {
        drawCollectibleItem(item);
      });
    }

    // Desenhar Jogadores
    for (let id in players) {
      const p = players[id];
      drawPlayerSprite(p);

      // user border
      if (id === myId) {
        ctx.strokeStyle = 'transparent';
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x, p.y, p.width, p.height);
      }
    }

    // Desenhar Projéteis (Bolhas de sabão)
    if (Array.isArray(bullets)) {
      bullets.forEach((b) => {
        ctx.save();
        ctx.fillStyle = 'rgba(173, 216, 230, 0.7)'; // Azul bebê translúcido
        ctx.strokeStyle = '#add8e6';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Pequeno brilho na bolha
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(b.x + b.w * 0.3, b.y + b.h * 0.3, b.w * 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    }

    // 5. Restaura o Canvas para a posição normal
    ctx.restore();

    // --- DESENHAR HUD / UI (Fixo na tela) ---
    if(debug) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Arial';
  
      // Posição na tela (0 a 800, 0 a 600)
      ctx.fillText(`Mouse Tela: X: ${mouse.x}, Y: ${mouse.y}`, 10, 20);
  
      // Posição no mundo do jogo (considerando o scroll da câmera)
      const worldMouseX = Math.round(mouse.x + cameraX);
      ctx.fillText(`Mouse Mundo: X: ${worldMouseX}, Y: ${mouse.y}`, 10, 40);
  
      // Posição do Jogador no Mundo
      if (myPlayer) {
        const playerX = Math.round(myPlayer.x);
        const playerY = Math.round(myPlayer.y);
        ctx.fillText(`Player Mundo: X: ${playerX}, Y: ${playerY}`, 10, 60);
      }
    }

    globalAnimTimer++;
  }