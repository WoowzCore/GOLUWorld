const WORLD_TILE_SIZE = 16;

const World = {};

World.Map = {};

World.Map.SizeW = 0;
World.Map.SizeH = 0;

World.Map.Tiles = {
    [TILE_LAYER_CEILING]: null,
    [TILE_LAYER_OVERLAY]: null,
    [TILE_LAYER_WALL   ]: null,
    [TILE_LAYER_FLOOR  ]: null,
};

World.GetIndex = function(X, Y){ return (Y * World.Map.SizeW) + X; }

World.SetTile = function(X, Y, TileID){
    if(X < 0 || X >= World.Map.SizeW || Y < 0 || Y >= World.Map.SizeH){ return; }
    
    const Def = Entity.Register.Tile.Get(TileID);
    const Index = World.GetIndex(X, Y);
    
    World.Map.Tiles[Def.Layer][Index].SetTile(Def);
}

World.Start = function(MapSizeW = 256, MapSizeH = 256){
    World.Map.SizeW = MapSizeW;
    World.Map.SizeH = MapSizeH;
    
    const TotalSize = MapSizeW * MapSizeH;
    
    const ApplyLayers = (Layer, DefaultID) => {
        const Array__ = new Array(TotalSize);
        const Def = Entity.Register.Tile.Get(DefaultID);
        for(let Y = 0; Y < MapSizeH; Y++){
            const RowOffset = Y * MapSizeW;
            for(let X = 0; X < MapSizeW; X++){
                Array__[RowOffset + X] = new GameTile(X, Y, Layer, Def);
            }
        }
        World.Map.Tiles[Layer] = Array__;
    };

    ApplyLayers(TILE_LAYER_FLOOR  , Tile_EmptyFloor  );
    ApplyLayers(TILE_LAYER_WALL   , Tile_EmptyWall   );
    ApplyLayers(TILE_LAYER_OVERLAY, Tile_EmptyOverlay);
    ApplyLayers(TILE_LAYER_CEILING, Tile_EmptyCeiling);
}

World.Render = function(CameraX = 0, CameraY = 0, Zoom = 1){
    const ScreenW = Graphic.BufferW;
    const ScreenH = Graphic.BufferH;

    let X1 = Math.floor(CameraX / WORLD_TILE_SIZE);
    let Y1 = Math.floor(CameraY / WORLD_TILE_SIZE);
    let X2 = X1 + Math.ceil(ScreenW / WORLD_TILE_SIZE) + 1;
    let Y2 = Y1 + Math.ceil(ScreenH / WORLD_TILE_SIZE) + 1;

    X1 = Math.max(0, X1);
    Y1 = Math.max(0, Y1);
    X2 = Math.min(World.Map.SizeW, X2);
    Y2 = Math.min(World.Map.SizeH, Y2);
    
    const LayerOrder = [TILE_LAYER_FLOOR, TILE_LAYER_WALL, TILE_LAYER_OVERLAY, TILE_LAYER_CEILING];
    
    for(let L of LayerOrder){
        const LayerData = World.Map.Tiles[L];
        for(let Y = Y1; Y < Y2; Y++){
            const RowOffset = Y * World.Map.SizeW;
            for(let X = X1; X < X2; X++){
                const Tile = LayerData[RowOffset + X];
                
                Tile.Render.Render(
                    (X * WORLD_TILE_SIZE) - CameraX,
                    (Y * WORLD_TILE_SIZE) - CameraY
                );
            }    
        }
    }
}