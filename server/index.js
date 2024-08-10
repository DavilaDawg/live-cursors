const http = require("http");
const { WebSocketServer } = require("ws");
const uuidv4 = require("uuid").v4;

const url = require("url");

const server = http.createServer();
const wsServer = new WebSocketServer({ server });
const port = 8000;

const connections = {};
const users = {}; // to track users behind connection and associate our own metadata 

const broadcast = () => { // every time server recieves message broadcast list of users to everyone, shows whos online and their state 
    Object.keys(connections).forEach(uuid => {
        const connection = connections[uuid]
        const message = JSON.stringify(users)
        connection.send(message)
    })
}

const handleMessage = (bytes, uuid) => { // every time user moves cursor client sends message to server with xy coords
    // message = {"x": 0 , "y":100} (message is the state )
    // user.state.x = message.x  and same for y but since state only holds x,y coords just override: users.state = message 
    const message = JSON.parse(bytes.toString()) // get message from client but server recives it in bytes

    const user = users[uuid]
    user.state = message
    // in other cases do if(messageType = currorUpdate) ... 

    broadcast() //everytime state updates (message received), update user state and broadcast 

    console.log(`${user.username} updated their state: ${JSON.stringify(user.state)}`)
}

const handleClose = uuid => {
    console.log(`${users[uuid].username} disconnected`)

    delete connections[uuid]
    delete users[uuid]

    // send message to client somehow "${user} disconnected" for avitar stack 

    broadcast()
}


wsServer.on("connection", (connection, request) => {
  // ws://localhost:8000?username=Alex

  const { username } = url.parse(request.url, true).query;
  const uuid = uuidv4();
  console.log(`${username} connected`);
  console.log(uuid);

  // broadcast is when send message to every connected user, due to having connections obj, loop over and do connection.send for each

  connections[uuid] = connection; // key is uuid in collections obj

    // instead of connetion.username = ... do this to avoid messing with connections obj
  users[uuid]= { // create user for every connection 
    username,
    state: { // everytime user moves curser send and update to server with websocket with new positons and periodiclly send a broadcast to all connected users with list of users and positons 
        // x: 0,
        // y: 0,
        // typing: true
        // onlineStatus: "On best space ever"
    }
  }

  connection.on("message", message => handleMessage(message, uuid)) // every time get new message know who it is and the uuid of connection and user 
  connection.on("close",  () => handleClose(uuid)) 


});

server.listen(port, () => {
  console.log(`Websocket server is running on port ${port}`);
});
