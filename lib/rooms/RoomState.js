"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyRoomState = exports.Loot = exports.LootType = exports.Monster = exports.Obstacle = exports.Player = exports.PlayerData = void 0;
const schema_1 = require("@colyseus/schema");
class PlayerData extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.name = "";
        this.coins = 0;
        this.experience = 0;
        this.level = 1;
        // Add other persistent player data here
    }
}
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], PlayerData.prototype, "name", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], PlayerData.prototype, "coins", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], PlayerData.prototype, "experience", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], PlayerData.prototype, "level", void 0);
exports.PlayerData = PlayerData;
class Player extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.velocityY = 0;
        this.isAttacking = false;
        this.isGrounded = false;
        this.isFacingLeft = false;
        this.height = 32;
        this.data = new PlayerData();
        this.inputQueue = [];
    }
}
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], Player.prototype, "x", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], Player.prototype, "y", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], Player.prototype, "velocityY", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], Player.prototype, "tick", void 0);
__decorate([
    (0, schema_1.type)("boolean"),
    __metadata("design:type", Boolean)
], Player.prototype, "isAttacking", void 0);
__decorate([
    (0, schema_1.type)("boolean"),
    __metadata("design:type", Boolean)
], Player.prototype, "isGrounded", void 0);
__decorate([
    (0, schema_1.type)("boolean"),
    __metadata("design:type", Boolean)
], Player.prototype, "isFacingLeft", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], Player.prototype, "height", void 0);
__decorate([
    (0, schema_1.type)(PlayerData),
    __metadata("design:type", Object)
], Player.prototype, "data", void 0);
exports.Player = Player;
class Obstacle extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.isOneWayPlatform = false;
    }
}
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], Obstacle.prototype, "x", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], Obstacle.prototype, "y", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], Obstacle.prototype, "width", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], Obstacle.prototype, "height", void 0);
__decorate([
    (0, schema_1.type)("boolean"),
    __metadata("design:type", Boolean)
], Obstacle.prototype, "isOneWayPlatform", void 0);
exports.Obstacle = Obstacle;
class Monster extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.velocityX = 1; // Initial movement direction
        this.velocityY = 0;
        this.isGrounded = false;
        this.health = 100;
        this.isHit = false;
        this.height = 32;
        this.patrolDirection = 1;
    }
}
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], Monster.prototype, "x", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], Monster.prototype, "y", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], Monster.prototype, "velocityX", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], Monster.prototype, "velocityY", void 0);
__decorate([
    (0, schema_1.type)("boolean"),
    __metadata("design:type", Boolean)
], Monster.prototype, "isGrounded", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], Monster.prototype, "health", void 0);
__decorate([
    (0, schema_1.type)("boolean"),
    __metadata("design:type", Boolean)
], Monster.prototype, "isHit", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], Monster.prototype, "height", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], Monster.prototype, "patrolStartX", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], Monster.prototype, "patrolDirection", void 0);
exports.Monster = Monster;
var LootType;
(function (LootType) {
    LootType["COIN"] = "coin";
    // Add more types as needed:
    // GEM = 'gem',
    // POTION = 'potion',
    // etc.
})(LootType = exports.LootType || (exports.LootType = {}));
class Loot extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.velocityX = 0;
        this.velocityY = 0;
        this.value = 1;
        this.spawnTime = Date.now();
        this.collectedBy = null; // Player sessionId who's collecting it
        this.isBeingCollected = false;
    }
}
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], Loot.prototype, "type", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], Loot.prototype, "x", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], Loot.prototype, "y", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], Loot.prototype, "velocityX", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], Loot.prototype, "velocityY", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], Loot.prototype, "value", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], Loot.prototype, "spawnTime", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], Loot.prototype, "collectedBy", void 0);
__decorate([
    (0, schema_1.type)("boolean"),
    __metadata("design:type", Boolean)
], Loot.prototype, "isBeingCollected", void 0);
exports.Loot = Loot;
class MyRoomState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.players = new schema_1.MapSchema();
        this.obstacles = new Array();
        this.monsters = new Array();
        this.loot = new Array();
    }
}
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], MyRoomState.prototype, "mapWidth", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], MyRoomState.prototype, "mapHeight", void 0);
__decorate([
    (0, schema_1.type)({ map: Player }),
    __metadata("design:type", Object)
], MyRoomState.prototype, "players", void 0);
__decorate([
    (0, schema_1.type)([Obstacle]),
    __metadata("design:type", Object)
], MyRoomState.prototype, "obstacles", void 0);
__decorate([
    (0, schema_1.type)([Monster]),
    __metadata("design:type", Object)
], MyRoomState.prototype, "monsters", void 0);
__decorate([
    (0, schema_1.type)([Loot]),
    __metadata("design:type", Object)
], MyRoomState.prototype, "loot", void 0);
exports.MyRoomState = MyRoomState;
