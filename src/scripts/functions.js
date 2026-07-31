

function savePlayerPosition(socketId, x, y, currentLevel = 1) {
    emitter.emit('savePlayerPosition', {
        socketId,
        x,
        y,
        currentLevel,
    });
}

module.exports = {
    savePlayerPosition,
}