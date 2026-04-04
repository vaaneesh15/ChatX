const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

let messages = [];

app.post('/auth', (req, res) => {
  res.json({ success: true, nick: "Пользователь", token: "dummy" });
});

app.post('/verify', (req, res) => {
  res.json({ success: true });
});

app.get('/messages', (req, res) => {
  res.json(messages.slice(-200));
});

io.on('connection', (socket) => {
  socket.on('new message', (data) => {
    const { nick, text } = data;
    if (!nick || !text || text.trim() === '') return;
    const newMsg = {
      id: Date.now(),
      nick,
      text: text.trim(),
      created_at: new Date()
    };
    messages.push(newMsg);
    io.emit('message received', newMsg);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Сервер запущен на порту ${PORT}`));
