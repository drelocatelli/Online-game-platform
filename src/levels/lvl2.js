module.exports = {
    worldWidth: 5000,
    backgroundLevel: '/sprites/backgrounds/background1.png',
    floorBackground: '/sprites/scenary/floor.png',
    backgroundItems: [
    ],
    enemies: [

    ],
    items: [
      { id: 'chest-1', type: 'chest', collect: 'gun',  x: 121, y: 469, w: 90, h: 90, background: '/sprites/items/chest_closed.png' },
  
    ],
    platforms: [
      { x: 0, y: 536, w: 1020, h: 70, background: '/sprites/scenary/floor.png', debug: false },
     
      
    ],
}