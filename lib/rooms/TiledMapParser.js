"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TiledMapParser = void 0;
class TiledMapParser {
    static getTileProperties(map, tileId) {
        var _a;
        // Find the correct tileset by checking firstgid ranges
        const tileset = map.tilesets.find((ts, index) => {
            const nextTileset = map.tilesets[index + 1];
            return (tileId >= ts.firstgid && (!nextTileset || tileId < nextTileset.firstgid));
        });
        if (!tileset)
            return [];
        // Adjust tileId based on the correct tileset's firstgid
        const adjustedTileId = tileId - tileset.firstgid;
        // Find tile properties
        const tileData = (_a = tileset.tiles) === null || _a === void 0 ? void 0 : _a.find((t) => t.id === adjustedTileId);
        return (tileData === null || tileData === void 0 ? void 0 : tileData.properties) || [];
    }
    static parseColliders(map) {
        const colliders = [];
        const { tilewidth, tileheight } = map;
        map.layers[0].data.forEach((tileId, index) => {
            if (tileId === 0)
                return; // Skip empty tiles
            const x = (index % map.width) * tilewidth + tilewidth / 2;
            const y = Math.floor(index / map.width) * tileheight + tileheight / 2;
            const properties = this.getTileProperties(map, tileId);
            const hasCollision = properties.find((p) => p.name === "collision" && p.value === true);
            const isOneWay = properties.find((p) => p.name === "oneway" && p.value === true);
            if (hasCollision || isOneWay) {
                colliders.push({
                    x,
                    y,
                    isOneWay: !!isOneWay,
                });
            }
        });
        return colliders;
    }
}
exports.TiledMapParser = TiledMapParser;
