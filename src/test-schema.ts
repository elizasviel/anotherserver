import { Schema, type, ArraySchema, MapSchema } from "@colyseus/schema";

class Item extends Schema {
  @type("string") name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }
}

class Player extends Schema {
  @type("string") name: string;
  @type([Item, "number"]) inventory = new ArraySchema<[Item, number]>();

  constructor(name: string) {
    super();
    this.name = name;
  }

  addItem(item: Item, quantity: number) {
    // For tuple types, we need to push an array with the item and quantity
    this.inventory.push([item, quantity]);
  }
}

// Test the schema
const player = new Player("TestPlayer");
const item = new Item("TestItem");
player.addItem(item, 5);

console.log("Player:", player);
console.log("Inventory:", player.inventory);
console.log("First item:", player.inventory[0]);
