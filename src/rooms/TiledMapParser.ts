export interface TileProperty {
  name: string;
  type: string;
  value: boolean | string | number;
}

export interface TileData {
  id: number;
  properties?: TileProperty[];
}

export interface TilesetData {
  firstgid: number;
  tiles?: TileData[];
}

export interface TiledMap {
  width: number;
  height: number;
  tilewidth: number;
  tileheight: number;
  layers: {
    data: number[];
    width: number;
    height: number;
  }[];
  tilesets: TilesetData[];
}

export class TiledMapParser {
  static getTileProperties(map: TiledMap, tileId: number): TileProperty[] {
    // Find the correct tileset by checking firstgid ranges
    const tileset = map.tilesets.find((ts, index) => {
      const nextTileset = map.tilesets[index + 1];
      return (
        tileId >= ts.firstgid && (!nextTileset || tileId < nextTileset.firstgid)
      );
    });

    if (!tileset) return [];

    // Adjust tileId based on the correct tileset's firstgid
    const adjustedTileId = tileId - tileset.firstgid;

    // Find tile properties
    const tileData = tileset.tiles?.find((t) => t.id === adjustedTileId);
    return tileData?.properties || [];
  }

  static parseColliders(map: TiledMap) {
    const colliders: Array<{ x: number; y: number; isOneWay: boolean }> = [];
    const { tilewidth, tileheight } = map;

    map.layers[0].data.forEach((tileId: number, index: number) => {
      if (tileId === 0) return; // Skip empty tiles

      const x = (index % map.width) * tilewidth + tilewidth / 2;
      const y = Math.floor(index / map.width) * tileheight + tileheight / 2;

      const properties = this.getTileProperties(map, tileId);

      const hasCollision = properties.find(
        (p) => p.name === "collision" && p.value === true
      );
      const isOneWay = properties.find(
        (p) => p.name === "oneway" && p.value === true
      );

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
