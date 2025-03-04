import express from "express";
import { playerDataManager } from "./playerData";

const router = express.Router();

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  const success = await playerDataManager.registerPlayer(username, password);
  if (!success) {
    return res.status(400).json({ error: "Username already exists" });
  }

  res.json({ message: "Registration successful" });
  console.log("AUTH: Registered player:", username, password);
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  const playerData = await playerDataManager.loginPlayer(username, password);
  if (!playerData) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.json({
    playerData: {
      ...playerData,
    },
  });
  console.log("AUTH: Logged in player:", username, password, playerData);
});

export default router;

//Authenticaation API. Takes in requests and either tells the player data manager to create a new player
//Or to login and retrieve player data.
