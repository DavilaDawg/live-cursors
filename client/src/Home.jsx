import { useEffect, useRef, useState } from "react";
import useWebSocket from "react-use-websocket";
import throttle from "lodash.throttle";
import { Cursor } from "./components/Cursor";

const renderCursors = (users, color) => {
  return Object.keys(users).map((uuid) => {
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
        return <li key={uuid}>{users[uuid].username}</li>;
      })}
    </ul>
  );
};

export const Home = ({ username, color }) => {
  const [otherUsers, setOtherUsers] = useState({});

  const WS_URL = "ws://localhost:8000";
  const { sendJsonMessage, lastJsonMessage } = useWebSocket(WS_URL, {
    queryParams: { username },
  });

  const THROTTLE = 40;

  const sendJsonMessageThrottled = useRef(throttle(sendJsonMessage, THROTTLE));

  useEffect(() => {
    sendJsonMessage({
      x: 0,
      y: 0,
    });
    window.addEventListener("mousemove", (e) => {
      sendJsonMessageThrottled.current({
        x: e.clientX,
        y: e.clientY,
      });
    });
  }, []);

  useEffect(() => {
    if (lastJsonMessage) {
      const users = lastJsonMessage;
      const filteredUsers = Object.keys(users).reduce((acc, uuid) => {
        if (users[uuid].username !== username) {
          acc[uuid] = users[uuid];
        }
        return acc;
      }, {});
      setOtherUsers(filteredUsers);
    }
  }, [lastJsonMessage, username]);

  return (
    <>
      {renderCursors(otherUsers, color)}
      {renderUsersList(otherUsers)}
      <h1>Hello, {username}</h1>
    </>
  );
};