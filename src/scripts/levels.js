const levels = {
  1: {
    worldWidth: 2400, // Largura total do mapa (3x a tela de 800)
    platforms: [
      // --- TELA 1 (0 a 800) [MANTIDO INTATCTO] ---
      { x: 0, y: 575, w: 200, h: 20, color: '#e94560' },
      { x: 200, y: 500, w: 200, h: 20, color: '#e94560' },
      { x: 500, y: 500, w: 150, h: 20, color: '#e94560' },

      // --- TELA 2 (800 a 1600) [PARKOUR INTERMEDIÁRIO] ---
      // Transição em subida com saltos intercalados
      { x: 720, y: 440, w: 100, h: 20, color: '#e94560' },
      { x: 880, y: 380, w: 90, h: 20, color: '#e94560' },
      { x: 1040, y: 320, w: 110, h: 20, color: '#e94560' },

      // Descida técnica para área de respiro
      { x: 1220, y: 420, w: 120, h: 20, color: '#e94560' },
      { x: 1400, y: 480, w: 160, h: 20, color: '#e94560' },

      // --- TELA 3 (1600 a 2400) [DESAFIO FINAL E CHEGADA] ---
      // Escalada íngreme de precisão (plataformas menores)
      { x: 1630, y: 400, w: 80, h: 20, color: '#e94560' },
      { x: 1780, y: 310, w: 70, h: 20, color: '#e94560' },
      { x: 1920, y: 220, w: 90, h: 20, color: '#e94560' },

      // Plataforma de impulso para o salto final
      { x: 2080, y: 280, w: 100, h: 20, color: '#e94560' },

      // Plataforma de Chegada (Destaque Rosa)
      { x: 2240, y: 200, w: 140, h: 20, color: '#ff2e63' },
    ],
  },
  2: {
    worldWidth: 2000,
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

function setLevel(levelNumber) {
  if (levels[levelNumber]) {
    currentLevel = levelNumber;
    return true;
  }
  return false;
}

module.exports = {
  levels,
  getPlatforms,
  getWorldWidth,
  setLevel,
  getCurrentLevel: () => currentLevel,
};
