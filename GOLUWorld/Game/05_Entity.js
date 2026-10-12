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
    
    constructor(Position, RenderFunction = undefined, HeightFunction = undefined){
        this.Position = Position;
        this.RenderFunction = RenderFunction || function(X, Y){ Graphic.DrawRect(X, Y, X + WORLD_TILE_SIZE, Y + WORLD_TILE_SIZE, 255, 0, 255); };
        this.HeightFunction = HeightFunction || null;
    }
    
    /** @type {function(number, number, GameRender)} */
    RenderFunction = null;
    
    /** @type {function(number, number, GameRender)} */
    HeightFunction = null;
    
    RenderSelected(X, Y, Function){
        if(Function === null){ return; }

        Function(X, Y, this);
    }
    
    Render(X, Y, Height = false){
        const XP = Math.floor(X !== undefined ? X : this.Position.X);
        const YP = Math.floor(Y !== undefined ? Y : this.Position.Y);
        
        if(Height){
            this.RenderSelected(XP, YP, this.HeightFunction);
        }else{
            this.RenderSelected(XP, YP, this.RenderFunction);
        }
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
    
    Active = true;
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
        
        this.Tile    = Def;
        this.IsSolid = Def.IsSolid;
        
        const RenderResource = Def.SpriteOrRender;
        
        if(RenderResource instanceof Sprite){
            this.Render.RenderFunction = (X, Y) => {
                Graphic.DrawSprite(X, Y, RenderResource);
            };
            this.Render.HeightFunction = (X, Y) => {
                Graphic.FillHeight(X, Y, X + WORLD_TILE_SIZE, Y + WORLD_TILE_SIZE, this.Tile.Height);
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

        const VX = this.VelocityX * DT;
        const VY = this.VelocityY * DT;
        
        if(this.Collider.Active){
            const CX = this.Position.X + this.Collider.OffsetX;
            const CY = this.Position.Y + this.Collider.OffsetY;
            
            const Result = Physic.MoveWithCollision(CX, CY, this.Collider.W, this.Collider.H, VX, VY);

            this.Position.X += Result.X - CX;
            this.Position.Y += Result.Y - CY;
        }else{
            this.Position.AddVelocity(VX, VY);   
        }
    }

    Draw(CameraX = 0, CameraY = 0){
        if(!this.DoRender){ return; }

        const SnappedX = Math.round(this.Position.X);
        const SnappedY = Math.round(this.Position.Y);
        this.Render.Render(SnappedX - CameraX, SnappedY - CameraY, false);
        this.Render.Render(SnappedX - CameraX, SnappedY - CameraY, true );
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
        IsSolid: Extra.IsSolid !== undefined ? Extra.IsSolid : (Layer === TILE_LAYER_WALL),
        Height: Extra.Height !== undefined ? Extra.Height : (Layer === TILE_LAYER_WALL ? 255 : 0),
        Extra: Extra
    };
    return ID;
}

Entity.Register.Tile.Get = function(ID){
    return Entity.Register.Tile.Definitions[ID] || Tile_ErrorWall;
}