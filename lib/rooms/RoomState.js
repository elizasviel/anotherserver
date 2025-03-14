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
exports.MyRoomState = exports.Portal = exports.SpawnedMonster = exports.SpawnedPlayer = exports.SpawnedLoot = exports.Loot = exports.Obstacle = void 0;
const schema_1 = require("@colyseus/schema");
class Obstacle extends schema_1.Schema {
    constructor(id, x, y, width, height, isOneWayPlatform) {
        super();
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.isOneWayPlatform = isOneWayPlatform;
    }
}
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], Obstacle.prototype, "id", void 0);
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
class Loot extends schema_1.Schema {
    constructor(name, width, height) {
        super();
        this.name = name;
        this.width = width;
        this.height = height;
    }
}
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], Loot.prototype, "name", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], Loot.prototype, "width", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], Loot.prototype, "height", void 0);
exports.Loot = Loot;
class SpawnedLoot extends schema_1.Schema {
    constructor(id, name, x, y, velocityX, velocityY, width, height, spawnTime) {
        super();
        this.id = id;
        this.name = name;
        this.x = x;
        this.y = y;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.width = width;
        this.height = height;
        this.spawnTime = spawnTime;
        this.collectedBy = null;
        this.isBeingCollected = false;
    }
}
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], SpawnedLoot.prototype, "id", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], SpawnedLoot.prototype, "name", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], SpawnedLoot.prototype, "x", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], SpawnedLoot.prototype, "y", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], SpawnedLoot.prototype, "velocityX", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], SpawnedLoot.prototype, "velocityY", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], SpawnedLoot.prototype, "width", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], SpawnedLoot.prototype, "height", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], SpawnedLoot.prototype, "spawnTime", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], SpawnedLoot.prototype, "collectedBy", void 0);
__decorate([
    (0, schema_1.type)("boolean"),
    __metadata("design:type", Boolean)
], SpawnedLoot.prototype, "isBeingCollected", void 0);
exports.SpawnedLoot = SpawnedLoot;
class SpawnedPlayer extends schema_1.Schema {
    constructor(id, username, x, y, velocityX, velocityY, experience, level, height, width, canAttack, canLoot, canJump, isAttacking, lastProcessedTick, lastDamageTime, maxHealth, currentHealth, isInvulnerable, strength, inventory, inputQueue) {
        super();
        this.inventory = new schema_1.MapSchema();
        this.inventoryQuantities = new schema_1.MapSchema();
        this.id = id;
        this.username = username;
        this.x = x;
        this.y = y;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.experience = experience;
        this.level = level;
        this.height = height;
        this.width = width;
        this.canAttack = canAttack;
        this.canLoot = canLoot;
        this.canJump = canJump;
        this.isAttacking = isAttacking;
        this.inputQueue = inputQueue;
        this.lastProcessedTick = lastProcessedTick;
        this.lastDamageTime = lastDamageTime;
        this.maxHealth = maxHealth;
        this.currentHealth = currentHealth;
        this.isInvulnerable = isInvulnerable;
        this.strength = strength;
        // Convert inventory items to MapSchema
        if (inventory) {
            inventory.forEach((item) => {
                const lootId = item.loot.name; // Use name as the key
                this.inventory.set(lootId, item.loot);
                this.inventoryQuantities.set(lootId, item.quantity);
            });
        }
    }
}
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], SpawnedPlayer.prototype, "id", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], SpawnedPlayer.prototype, "username", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], SpawnedPlayer.prototype, "x", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], SpawnedPlayer.prototype, "y", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], SpawnedPlayer.prototype, "velocityX", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], SpawnedPlayer.prototype, "velocityY", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], SpawnedPlayer.prototype, "experience", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], SpawnedPlayer.prototype, "level", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], SpawnedPlayer.prototype, "height", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], SpawnedPlayer.prototype, "width", void 0);
__decorate([
    (0, schema_1.type)("boolean"),
    __metadata("design:type", Boolean)
], SpawnedPlayer.prototype, "canAttack", void 0);
__decorate([
    (0, schema_1.type)("boolean"),
    __metadata("design:type", Boolean)
], SpawnedPlayer.prototype, "canLoot", void 0);
__decorate([
    (0, schema_1.type)("boolean"),
    __metadata("design:type", Boolean)
], SpawnedPlayer.prototype, "canJump", void 0);
__decorate([
    (0, schema_1.type)("boolean"),
    __metadata("design:type", Boolean)
], SpawnedPlayer.prototype, "isAttacking", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], SpawnedPlayer.prototype, "lastProcessedTick", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], SpawnedPlayer.prototype, "lastDamageTime", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], SpawnedPlayer.prototype, "maxHealth", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], SpawnedPlayer.prototype, "currentHealth", void 0);
__decorate([
    (0, schema_1.type)("boolean"),
    __metadata("design:type", Boolean)
], SpawnedPlayer.prototype, "isInvulnerable", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], SpawnedPlayer.prototype, "strength", void 0);
__decorate([
    (0, schema_1.type)({ map: Loot }),
    __metadata("design:type", Object)
], SpawnedPlayer.prototype, "inventory", void 0);
__decorate([
    (0, schema_1.type)({ map: "number" }),
    __metadata("design:type", Object)
], SpawnedPlayer.prototype, "inventoryQuantities", void 0);
exports.SpawnedPlayer = SpawnedPlayer;
class SpawnedMonster extends schema_1.Schema {
    constructor(id, monsterType, spawnX, spawnY) {
        super();
        this.id = id;
        this.name = monsterType.name;
        this.x = spawnX;
        this.y = spawnY;
        this.velocityX = 0;
        this.velocityY = 0;
        this.maxHealth = monsterType.maxHealth;
        this.currentHealth = monsterType.maxHealth;
        this.damage = monsterType.damage;
        this.height = monsterType.height;
        this.width = monsterType.width;
        this.detectionRange = monsterType.detectionRange;
        this.experience = monsterType.experience;
        this.canJump = true;
        this.behaviorState = "idle";
        this.behaviorTimer = 0;
        this.behaviorDuration = Math.random() * 3000 + 1000;
        this.potentialLoot = monsterType.potentialLoot.map((loot) => new Loot(loot.name, loot.width, loot.height));
    }
}
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], SpawnedMonster.prototype, "id", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], SpawnedMonster.prototype, "name", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], SpawnedMonster.prototype, "x", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], SpawnedMonster.prototype, "y", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], SpawnedMonster.prototype, "velocityX", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], SpawnedMonster.prototype, "velocityY", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], SpawnedMonster.prototype, "maxHealth", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], SpawnedMonster.prototype, "currentHealth", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], SpawnedMonster.prototype, "damage", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], SpawnedMonster.prototype, "height", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], SpawnedMonster.prototype, "width", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], SpawnedMonster.prototype, "detectionRange", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], SpawnedMonster.prototype, "experience", void 0);
__decorate([
    (0, schema_1.type)("boolean"),
    __metadata("design:type", Boolean)
], SpawnedMonster.prototype, "canJump", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], SpawnedMonster.prototype, "behaviorState", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], SpawnedMonster.prototype, "behaviorTimer", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], SpawnedMonster.prototype, "behaviorDuration", void 0);
__decorate([
    (0, schema_1.type)([Loot]),
    __metadata("design:type", Array)
], SpawnedMonster.prototype, "potentialLoot", void 0);
exports.SpawnedMonster = SpawnedMonster;
class Portal extends schema_1.Schema {
    constructor(id, x, y, width, height, targetRoom, targetX, targetY, isOneWayPlatform) {
        super();
        this.id = id;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.targetRoom = targetRoom;
        this.targetX = targetX;
        this.targetY = targetY;
        this.isOneWayPlatform = isOneWayPlatform;
    }
}
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], Portal.prototype, "id", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], Portal.prototype, "x", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], Portal.prototype, "y", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], Portal.prototype, "width", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], Portal.prototype, "height", void 0);
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], Portal.prototype, "targetRoom", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], Portal.prototype, "targetX", void 0);
__decorate([
    (0, schema_1.type)("number"),
    __metadata("design:type", Number)
], Portal.prototype, "targetY", void 0);
__decorate([
    (0, schema_1.type)("boolean"),
    __metadata("design:type", Boolean)
], Portal.prototype, "isOneWayPlatform", void 0);
exports.Portal = Portal;
class MyRoomState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.spawnedPlayers = new Array();
        this.obstacles = new Array();
        this.spawnedMonsters = new Array();
        this.spawnedLoot = new Array();
        this.portals = new Array();
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
    (0, schema_1.type)([SpawnedPlayer]),
    __metadata("design:type", Object)
], MyRoomState.prototype, "spawnedPlayers", void 0);
__decorate([
    (0, schema_1.type)([Obstacle]),
    __metadata("design:type", Object)
], MyRoomState.prototype, "obstacles", void 0);
__decorate([
    (0, schema_1.type)([SpawnedMonster]),
    __metadata("design:type", Object)
], MyRoomState.prototype, "spawnedMonsters", void 0);
__decorate([
    (0, schema_1.type)([SpawnedLoot]),
    __metadata("design:type", Object)
], MyRoomState.prototype, "spawnedLoot", void 0);
__decorate([
    (0, schema_1.type)([Portal]),
    __metadata("design:type", Object)
], MyRoomState.prototype, "portals", void 0);
exports.MyRoomState = MyRoomState;
//spawnloot concern
