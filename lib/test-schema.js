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
const schema_1 = require("@colyseus/schema");
class Item extends schema_1.Schema {
    constructor(name) {
        super();
        this.name = name;
    }
}
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], Item.prototype, "name", void 0);
class Player extends schema_1.Schema {
    constructor(name) {
        super();
        this.inventory = new schema_1.ArraySchema();
        this.name = name;
    }
    addItem(item, quantity) {
        // For tuple types, we need to push an array with the item and quantity
        this.inventory.push([item, quantity]);
    }
}
__decorate([
    (0, schema_1.type)("string"),
    __metadata("design:type", String)
], Player.prototype, "name", void 0);
__decorate([
    (0, schema_1.type)([Item, "number"]),
    __metadata("design:type", Object)
], Player.prototype, "inventory", void 0);
// Test the schema
const player = new Player("TestPlayer");
const item = new Item("TestItem");
player.addItem(item, 5);
console.log("Player:", player);
console.log("Inventory:", player.inventory);
console.log("First item:", player.inventory[0]);
