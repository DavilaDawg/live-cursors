// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
const http = require("http");
const { WebSocketServer } = require("ws");
const uuidv4 = require("uuid").v4;
// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
const url = require("url");

const server = http.createServer();
const wsServer = new WebSocketServer({ server });
const port = 8000;

const connections = {};
const users = {};

const broadcast = () => {
  // every time server recieves message broadcast list of users to everyone, shows whos online and their state
  // biome-ignore lint/complexity/noForEach: <explanation>
  Object.keys(connections).forEach((uuid) => {
    const connection = connections[uuid];
    const message = JSON.stringify(users);
    connection.send(message);
  });
};

const handleMessage = (bytes, uuid) => {
  const message = JSON.parse(bytes.toString());
  const user = users[uuid];
  user.state = {
    x: message.x,
    y: message.y,
    cursor: message.cursor,
    username: message.username,
    color: message.color,
  };
  broadcast(); //everytime state updates (message received), update user state and broadcast
};

const handleClose = (uuid) => {
  console.log(`${users[uuid].username} disconnected`);
  delete connections[uuid];
  delete users[uuid];
  broadcast();
};

wsServer.on("connection", (connection, request) => {
  // ws://localhost:8000?username=Alex
  const { selectedCursor, color, username } = url.parse(
    request.url,
    true
  ).query;
  const uuid = uuidv4();
  console.log(`${username} connected`);

  connections[uuid] = connection; // key is uuid in collections obj

  users[uuid] = {
    username,
    state: {
      x: 0,
      y: 0,
      cursor: selectedCursor || "",
      color: color || "red",
    },
  };

  connection.on("message", (message) => handleMessage(message, uuid));
  connection.on("close", () => handleClose(uuid));
});

server.listen(port, () => {
  console.log(`Websocket server is running on port ${port}`);
});
