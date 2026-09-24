const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve os arquivos da pasta "public"
app.use(express.static('public'));

let players = {};

// Loop do servidor enviando a posição de todos os jogadores (30 vezes por segundo)
setInterval(() => {
  io.emit('currentPlayers', players);
}, 1000 / 30);

io.on('connection', (socket) => {
  console.log(`Jogador conectado: ${socket.id}`);

  // Cria o novo jogador com dados iniciais na Starter Island
  players[socket.id] = {
    x: 2100,
    y: 1820,
    angle: -Math.PI / 2,
    hp: 100,
    maxHp: 100,
    level: 1,
    fruit: null
  };

  // Ouve quando o jogador se move ou altera status
  socket.on('playerUpdate', (data) => {
    if (players[socket.id]) {
      players[socket.id].x = data.x;
      players[socket.id].y = data.y;
      players[socket.id].angle = data.angle;
      players[socket.id].hp = data.hp;
      players[socket.id].level = data.level;
      players[socket.id].fruit = data.fruit;
    }
  });

  // Quando o jogador desconecta
  socket.on('disconnect', () => {
    console.log(`Jogador desconectado: ${socket.id}`);
    delete players[socket.id];
    io.emit('removePlayer', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
