import { useEffect, useState } from "react";
import { Login } from "./components/Login";
import { Home } from "./Home";

function App() {
  const [username, setUsername] = useState("");
  const [color, setColor] = useState("")

  return username ? (
    <Home username={username} color={color}/>
  ) : (
    <Login onSubmit={setUsername} setColorProp={setColor} />
  );
}

export default App;
