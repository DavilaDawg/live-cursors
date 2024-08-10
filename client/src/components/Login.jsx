import React, { useState, useEffect } from "react";
import randomColor from "randomcolor";

export const Login = ({ onSubmit, setColorProp }) => {
  const [username, setUsername] = useState("");
  const [color, setColor] = useState("");

  useEffect(() => {
    if (username && !color) {
      const newColor = randomColor()
      setColor(newColor);
    }
  }, [username, color]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username) {
      onSubmit(username);
      setColorProp(color); 
    }
  };

  return (
    <>
      <h1>Welcome</h1>
      <p>What should people call you?</p>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          placeholder="username"
          onChange={(e) => {
            setUsername(e.target.value);
          }}
        />
        <input type="submit" />
      </form>
    </>
  );
};
