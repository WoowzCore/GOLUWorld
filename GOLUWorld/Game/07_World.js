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

/** @type GameEntity[] */
World.Map.Entities = [];

// ----------------------------------------------------------------------

World.AddEntity = function(Entity){
    if(Entity.InWorld){ return Entity; }

    World.Map.Entities.push(Entity);
    Entity.InWorld = true;
    return Entity;
}

World.RemoveEntity = function(Entity){
    if(!Entity.InWorld){ return; }
    
    const Index = World.Map.Entities.indexOf(Entity);
    if(Index !== -1){ World.Map.Entities.splice(Index, 1); Entity.InWorld = false; }
}

World.RemoveAllEntities = function(){
    for(let Entity of World.Map.Entities){
        Entity.InWorld = false;
    }
    
    World.Entities.length = 0;
}

// ----------------------------------------------------------------------

/** @type GamePlayer */
World.MainPlayer = null;

// ----------------------------------------------------------------------

World.GetIndex = function(X, Y){ return (Y * World.Map.SizeW) + X; }

World.SetTile = function(X, Y, TileID){
    if(X < 0 || X >= World.Map.SizeW || Y < 0 || Y >= World.Map.SizeH){ return; }
    
    const Def   = Entity.Register.Tile.Get(TileID);
    const Index = World.GetIndex(X, Y);
    
    World.Map.Tiles[Def.Layer][Index].SetTile(Def);
}

World.ScreenToWorld = function(ScreenX, ScreenY, CameraX, CameraY){
    return {
        X: ScreenX + CameraX,
        Y: ScreenY + CameraY
    };
}

World.WorldToTile = function(WorldX, WorldY){
    return {
        TX: Math.floor(WorldX / SIZE_TILE),
        TY: Math.floor(WorldY / SIZE_TILE)
    };
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
    
    World.MainPlayer = new GamePlayer(50, 50);
    World.AddEntity(World.MainPlayer);
}

World.TEST_SUN = 45;
World.Update = function(DT){
    World.TEST_SUN = (World.TEST_SUN + DT) % 360;
    
    for(let i = 0; i < World.Map.Entities.length; i++){
        World.Map.Entities[i].Update(DT);
    }
}

World.Render = function(CameraX = 0, CameraY = 0, Zoom = 1){
    const ScreenW = Graphic.BufferW;
    const ScreenH = Graphic.BufferH;
    const Ext = Graphic.ScreenExtend;
    const ExtTile = Ext / SIZE_TILE;

    let X1 = Math.floor(CameraX / SIZE_TILE) - 1 - ExtTile;
    let Y1 = Math.floor(CameraY / SIZE_TILE) - 1 - ExtTile;
    let X2 = Math.ceil((CameraX + ScreenW) / SIZE_TILE) + 1 + ExtTile;
    let Y2 = Math.ceil((CameraY + ScreenH) / SIZE_TILE) + 1 + ExtTile;

    X1 = Math.max(0, X1);
    Y1 = Math.max(0, Y1);
    X2 = Math.min(World.Map.SizeW, X2);
    Y2 = Math.min(World.Map.SizeH, Y2);

    const RenderLayer = (L) => {
        const LayerData = World.Map.Tiles[L];
        for(let Y = Y1; Y < Y2; Y++){
            const RowOffset = Y * World.Map.SizeW;
            for(let X = X1; X < X2; X++){
                const Tile = LayerData[RowOffset + X];
                if(!Tile.Tile || Tile.Tile.Name === "Empty"){ continue; }

                const ScreenX = (X * SIZE_TILE) - CameraX;
                const ScreenY = (Y * SIZE_TILE) - CameraY;

                if(ScreenX + SIZE_TILE > 0 && ScreenX < ScreenW &&
                   ScreenY + SIZE_TILE > 0 && ScreenY < ScreenH)
                {
                    Tile.Render.Render(ScreenX, ScreenY, false);
                }
                
                Tile.Render.Render(
                    ScreenX,
                    ScreenY,
                    true
                );
            }
        }
    };

    RenderLayer(TILE_LAYER_FLOOR);
    
    World.Map.Entities.sort((A, B) => A.Position.Y - B.Position.Y);
    for(let Entity of World.Map.Entities){
        if(Entity.Position.X + SIZE_TILE > CameraX &&
           Entity.Position.X < CameraX + ScreenW &&
           Entity.Position.Y + SIZE_TILE > CameraY &&
           Entity.Position.Y < CameraY + ScreenH
        ){
            Entity.Draw(CameraX, CameraY);
        }
    }

    RenderLayer(TILE_LAYER_WALL);
    RenderLayer(TILE_LAYER_OVERLAY);
    RenderLayer(TILE_LAYER_CEILING);

    Graphic.GenerateShadows(
        Graphic.Buffer, Graphic.BufferW, Graphic.BufferH,
        Graphic.HeightBuffer, Graphic.HeightW, Graphic.HeightH, Graphic.ScreenExtend,
        Graphic.ShadowBuffer,
        World.TEST_SUN,
        30,
        180,
        0.75,
        6,
        0, 0, 0
    );

    World.TEST_DebugRenderBounds(CameraX, CameraY);
}

World.TEST_DebugRenderBounds = function(CameraX, CameraY){
    const TS = SIZE_TILE;

    const WorldX1 = -CameraX;
    const WorldY1 = -CameraY;
    const WorldX2 = World.Map.SizeW * TS - CameraX;
    const WorldY2 = World.Map.SizeH * TS - CameraY;

    Graphic.DrawRect(WorldX1, WorldY1, WorldX2, WorldY1 + 2, 255, 0, 0, 255);
    Graphic.DrawRect(WorldX1, WorldY2 - 2, WorldX2, WorldY2, 255, 0, 0, 255);
    Graphic.DrawRect(WorldX1, WorldY1, WorldX1 + 2, WorldY2, 255, 0, 0, 255);
    Graphic.DrawRect(WorldX2 - 2, WorldY1, WorldX2, WorldY2, 255, 0, 0, 255);
}