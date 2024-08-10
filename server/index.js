const http = require("http");
const { WebSocketServer } = require("ws");
const uuidv4 = require("uuid").v4;
const url = require("url");

const server = http.createServer();
const wsServer = new WebSocketServer({ server });
const port = 8000;

const connections = {};
const users = {};

const broadcast = () => {
  // every time server recieves message broadcast list of users to everyone, shows whos online and their state
  Object.keys(connections).forEach((uuid) => {
    const connection = connections[uuid];
    const message = JSON.stringify(users);
    connection.send(message);
  });
};

const handleMessage = (bytes, uuid) => {
  // message = {"x": 0 , "y":100} (message is the state) or user.state.x = message.x
  const message = JSON.parse(bytes.toString());
  const user = users[uuid];
  user.state = message;
  // if(messageType = currorUpdate) ...
  broadcast(); //everytime state updates (message received), update user state and broadcast
};

const handleClose = (uuid) => {
  console.log(`${users[uuid].username} disconnected`);
  delete connections[uuid];
  delete users[uuid];
  broadcast();
};

wsServer.on("connection", (connection, request) => { // ws://localhost:8000?username=Alex
  const { username } = url.parse(request.url, true).query;
  const uuid = uuidv4();
  console.log(`${username} connected`);

  connections[uuid] = connection; // key is uuid in collections obj

  users[uuid] = {
    username,
    state: {
      // everytime user moves curser send and update to server with websocket with new positons and periodiclly send a broadcast to all connected users with list of users and positons
      // x: 0,
      // y: 0,
      // typing: true
      // onlineStatus: "On best space ever"
    },
  };

  connection.on("message", (message) => handleMessage(message, uuid));
  connection.on("close", () => handleClose(uuid));
});

server.listen(port, () => {
  console.log(`Websocket server is running on port ${port}`);
});
