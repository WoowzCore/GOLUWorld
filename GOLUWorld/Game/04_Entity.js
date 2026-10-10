class GamePosition{
    constructor(X = 0, Y = 0){
        this.X = X;
        this.Y = Y;
    }
    
    X  = 0;
    Y  = 0;

    get TileX(){ return Math.floor(this.X / WORLD_TILE_SIZE); }
    get TileY(){ return Math.floor(this.Y / WORLD_TILE_SIZE); }

    get OffsetX(){ return this.X % WORLD_TILE_SIZE; }
    get OffsetY(){ return this.Y % WORLD_TILE_SIZE; }

    SetPositionTile(TX, TY){
        if(TX !== undefined){ this.X = TX * WORLD_TILE_SIZE; }
        if(TY !== undefined){ this.Y = TY * WORLD_TILE_SIZE; }
    }
    
    SetPositionPixels(PX, PY){
        if(PX !== undefined){ this.X = PX; }
        if(PY !== undefined){ this.Y = PY; }
    }
    
    AddVelocity(VX, VY){
        if(VX !== undefined){ this.X += VX; }
        if(VY !== undefined){ this.Y += VY; }
    }
}

class GameRender{
    /** @type GamePosition */
    Position = null;
    
    constructor(Position, RenderFunction = undefined){
        this.Position = Position;
        this.RenderFunction = RenderFunction || function(X, Y){ Graphic.DrawRect(X, Y, X + WORLD_TILE_SIZE, Y + WORLD_TILE_SIZE, 255, 0, 255); };
    }
    
    /** @type {function(number, number, GameRender)} */
    RenderFunction = null;
    
    Render(X, Y){
        if(this.RenderFunction === null){ return; }
        
        let XP, YP;
        if(X !== undefined && Y !== undefined){
            XP = X; YP = Y;
        }else{
            XP = this.Position.X;
            YP = this.Position.Y;
        }
        this.RenderFunction(Math.floor(XP), Math.floor(YP), this);
    }
}

class GameCollider{
    /** @type GamePosition */
    Position = null;
    
    constructor(Position, W = WORLD_TILE_SIZE, H = WORLD_TILE_SIZE) {
        this.Position = Position;
        
        this.W = W;
        this.H = H;
    }

    W = WORLD_TILE_SIZE;
    H = WORLD_TILE_SIZE;
    
    OffsetX = 0;
    OffsetY = 0;
}

const TILE_LAYER_FLOOR   = 0;
const TILE_LAYER_WALL    = 1;
const TILE_LAYER_OVERLAY = 2;
const TILE_LAYER_CEILING = 3;
class GameTile{
    /** @type GamePosition */
    Position = null;
    /** @type GameRender */
    Render = null;
    /** @type GameCollider */
    Collider = null;
    
    constructor(X, Y, Layer, Tile){
        this.Position = new GamePosition(X * WORLD_TILE_SIZE, Y * WORLD_TILE_SIZE);
        this.Render   = new GameRender(this.Position);
        this.Collider = new GameCollider(this.Position);
        
        this.Layer = Layer;
        
        this.SetTile(Tile);
    }
    
    Layer = 0;
    
    IsSolid = false;
    Tile = null;

    SetTile(Def){
        if(Def.Layer !== this.Layer){ return; }
        
        this.Tile = Def;
        this.IsSolid = Def.IsSolid;
        
        const RenderResource = Def.SpriteOrRender;
        
        if(RenderResource instanceof Sprite){
            this.Render.RenderFunction = (X, Y) => {
                Graphic.DrawSprite(X, Y, RenderResource);
            };
        }else if(typeof RenderResource === "function"){
            this.Render.RenderFunction = RenderResource;
        }else if(RenderResource === null){
            this.Render.RenderFunction = null
        }else{
            this.Render.RenderFunction = (X, Y) => {
                Graphic.DrawRect(X, Y, X + WORLD_TILE_SIZE, Y + WORLD_TILE_SIZE, 255, 0, 255);
            };
        }
    }
}

class GameEntity{
    /** @type GamePosition */
    Position = null;
    /** @type GameRender */
    Render = null;
    /** @type GameCollider */
    Collider = null;
    
    constructor(X = 0, Y = 0){
        this.Position = new GamePosition(X, Y);
        this.Render   = new GameRender(this.Position);
        this.Collider = new GameCollider(this.Position, WORLD_TILE_SIZE, WORLD_TILE_SIZE);
    }
    
    DoRender = true;
    DoUpdate = true;
    
    VelocityX = 0;
    VelocityY = 0;
    
    InWorld = false;
    
    Update(DT){
        if(!this.DoUpdate){ return; }
        
        this.Position.AddVelocity(this.VelocityX * DT, this.VelocityY * DT);
    }
    
    Draw(CameraX = 0, CameraY = 0){
        if(!this.DoRender){ return; }
        
        this.Render.Render(this.Position.X - CameraX, this.Position.Y - CameraY);
    }
}

// ----------------------------------------------------------------------

const Entity = {};

Entity.Register = {};

// ----------------------------------------------------------------------

Entity.Register.Tile = {};

Entity.Register.Tile.Definitions = {};

Entity.Register.Tile.Register = function(Name, Layer, SpriteOrRender = Sprite_Error, Extra = {}){
    const ID = Object.keys(Entity.Register.Tile.Definitions).length + 1;
    
    Entity.Register.Tile.Definitions[ID] = {
        ID: ID,
        Name: Name,
        Layer: Layer,
        SpriteOrRender: SpriteOrRender,
        IsSolid: Extra.IsSolid || (Layer === TILE_LAYER_WALL),
        Extra: Extra
    };
    return ID;
}

Entity.Register.Tile.Get = function(ID){
    return Entity.Register.Tile.Definitions[ID] || Tile_ErrorWall;
}