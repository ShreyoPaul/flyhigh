import React, { useEffect } from "react";
import Phaser from "phaser";
import AirplaneScene from "./AirplaneScene";

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [AirplaneScene],
  parent: "game-container", // This is where Phaser will be mounted
};

export function Game() {
  useEffect(() => {
    // Phaser game is initialized as a side effect when component mounts
    const phaser = new Phaser.Game(config);
    // return phaser.destroy(true)
  }, []);

  return (
    <div className="App">
      <h1>Airplane Game</h1>
      <div id="game-container" style={{ width: "800px", margin: "0 auto" }} />
    </div>
  );
}

function App() {
  return <Game />;
}

export default App;
