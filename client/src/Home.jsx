import { useEffect, useRef, useState } from "react";
import useWebSocket from "react-use-websocket";
import throttle from "lodash.throttle";
import { Cursor } from "./components/Cursor";

const renderCursors = (users, color, currentId) => {
  return Object.keys(users)
    .filter((uuid) => uuid !== currentId)
    .map((uuid) => {
      const user = users[uuid];

      return (
        <Cursor key={uuid} point={[user.state.x, user.state.y]} color={color} />
      );
    });
};

const renderUsersList = (users) => {
  return (
    <ul>
      {Object.keys(users).map((uuid) => {
        return <li key={uuid}>{JSON.stringify(users[uuid])}</li>;
      })}
    </ul>
  );
};

export const Home = ({ username, color }) => {
  const [currentId, setCurrentId] = useState(null);

  const WS_URL = "ws://localhost:8000";
  const { sendJsonMessage, lastJsonMessage } = useWebSocket(WS_URL, {
    queryParams: { username },
  });

  const THROTTLE = 40;

  const sendJsonMessageThrottled = useRef(throttle(sendJsonMessage, THROTTLE));

  useEffect(() => {
    sendJsonMessage({
      x: 0,
      y: 0
    });
    window.addEventListener("mousemove", (e) => {
      sendJsonMessageThrottled.current({
        x: e.clientX,
        y: e.clientY,
      });
    });
  }, []);

  useEffect(() => {
    if (lastJsonMessage && !currentId) {
      setCurrentId(lastJsonMessage.currentId);
    }
  }, [lastJsonMessage, currentId]);


  if (lastJsonMessage) {
    return (
      <>
        {renderCursors(lastJsonMessage, color)}
        {renderUsersList(lastJsonMessage)}
      </>
    );
  }

  return <h1> Hello, {username} </h1>;
};
