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

// every time server recieves message broadcast list of users to everyone, shows whos online and their state
const broadcastState = () => {
  // biome-ignore lint/complexity/noForEach: <explanation>
  Object.keys(connections).forEach((uuid) => {
    const connection = connections[uuid];
    const message = JSON.stringify(users);
    connection.send(message);
  });
};

const broadcast = (message) => {
  const messageString = JSON.stringify(message);
  // biome-ignore lint/complexity/noForEach: <explanation>
  Object.values(connections).forEach((connection) => {
    connection.send(messageString);
  });
};

const handleMessage = (bytes, uuid) => {
  try {
    const message = JSON.parse(bytes.toString());
    const user = users[uuid];

    if (message.type === "setRealUsername") {
      user.realUsername = message.realUsername;
      console.log(
        `Associated ${user.username} with real username ${message.realUsername}`
      );
      broadcast({
        type: "join",
        username: user.username,
      });
    } else if (message.type === "chat") {
      broadcast({
        type: "chat",
        username: user.username,
        message: message.message,
      });
    } else {
      user.state = {
        x: message.x,
        y: message.y,
        cursor: message.cursor,
        username: message.username,
        color: message.color,
      };
      broadcastState();
    }
  } catch (error) {
    console.error("Error parsing message:", error);
  }
};

const handleClose = (uuid) => {
  console.log(`${users[uuid].username} disconnected`);
  delete connections[uuid];
  delete users[uuid];
  broadcastState();
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
    realUsername: null, // set this when receive the setRealUsername message
    state: {
      x: 0,
      y: 0,
      cursor: selectedCursor || "/norm.png",
      color: color || "red",
    },
  };

  connection.on("message", (message) => handleMessage(message, uuid));
  connection.on("close", () => handleClose(uuid));

  connection.send(JSON.stringify({ type: "userState", users }));

  broadcast({
    type: "join",
    username: username,
  });
});

server.listen(port, () => {
  console.log(`Websocket server is running on port ${port}`);
});
