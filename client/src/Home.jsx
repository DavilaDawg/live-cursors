import { useEffect, useRef } from "react";
import useWebSocket from "react-use-websocket";
import throttle from "lodash.throttle";
import { Cursor } from "./components/Cursor";

const renderCursors = users => {
    return Object.keys(users).map(uuid => {
        const user = users[uuid]

        return (
            <Cursor key={uuid} point={[user.state.x, user.state.y]} />
        )
    })
}

const renderUsersList = users => {
    return (
        <ul>
            {Object.keys(users).map(uuid => {
                return <li key={uuid}>{JSON.stringify(users[uuid])}</li>
            })}
        </ul>
    )
}

export const Home = ({ username }) => {
  const WS_URL = "ws://localhost:8000";
  const { sendJsonMessage, lastJsonMessage } = useWebSocket(WS_URL, {
    queryParams: { username }, // lets us pass username as query param to server
  });

  const THROTTLE = 40;

  const sendJsonMessageThrottled = useRef(throttle(sendJsonMessage, THROTTLE));

  useEffect(() => {
    // ask server to send everyones state the component reloads 
    sendJsonMessage({
        x:0,
        y:0
    })

    window.addEventListener("mousemove", (e) => {
      sendJsonMessageThrottled.current({
        x: e.clientX,
        y: e.clientY,
      });
    });
  }, []);

  if (lastJsonMessage) {
    return <>
        {renderCursors(lastJsonMessage)}
        {renderUsersList(lastJsonMessage)}
    </>
  }

  return <h1> Hello, {username} </h1>
};
