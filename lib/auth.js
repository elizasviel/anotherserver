"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const playerData_1 = require("./playerData");
const router = express_1.default.Router();
router.post("/register", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res
            .status(400)
            .json({ error: "Username and password are required" });
    }
    const success = await playerData_1.playerDataManager.registerPlayer(username, password);
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
    const playerData = await playerData_1.playerDataManager.loginPlayer(username, password);
    if (!playerData) {
        return res.status(401).json({ error: "Invalid credentials" });
    }
    res.json({
        playerData: Object.assign({}, playerData),
    });
    console.log("AUTH: Logged in player:", username, password, playerData);
});
exports.default = router;
//Authenticaation API. Takes in requests and either tells the player data manager to create a new player
//Or to login and retrieve player data.
