class GamePosition{
    constructor(X = 0, Y = 0, XD = 0, YD = 0){
        this.X = X;
        this.Y = Y;
        this.XD = XD;
        this.YD = YD;
    }
    
    X  = 0;
    Y  = 0;
    XD = 0;
    YD = 0;
    
    GetPositionTile(){
        return [this.X, this.Y];
    }
    
    GetPositionPixels(){
        return [this.X * WORLD_TILE_SIZE + this.XD, this.Y * WORLD_TILE_SIZE + this.YD];
    }
    
    SetPositionTile(X, Y){
        this.X = X;
        this.Y = Y;
        this.XD = 0;
        this.YD = 0;
    }
    
    SetPositionPixels(X, Y){
        this.X = Math.floor(X / WORLD_TILE_SIZE);
        this.Y = Math.floor(Y / WORLD_TILE_SIZE);

        this.XD = X - (this.X * WORLD_TILE_SIZE);
        this.YD = Y - (this.Y * WORLD_TILE_SIZE);
    }
    
    Normalize(){
        while(this.XD >= WORLD_TILE_SIZE){ this.XD -= WORLD_TILE_SIZE; this.X++; }
        while(this.XD  < 0             ){ this.XD += WORLD_TILE_SIZE; this.X--; }
        while(this.YD >= WORLD_TILE_SIZE){ this.YD -= WORLD_TILE_SIZE; this.Y++; }
        while(this.YD  < 0             ){ this.YD += WORLD_TILE_SIZE; this.Y--; }
    }
    
    AddVelocityPosition(VX, VY){
        this.XD += VX;
        this.YD += VY;
        this.Normalize();
    }
}

class GameRender{
    /** @type GamePosition */
    Position = null;
    
    constructor(Position, RenderFunction = undefined){
        this.Position = Position;
        this.RenderFunction = RenderFunction || function(XP, YP, Self){ Graphic.DrawRect(XP, YP, XP + WORLD_TILE_SIZE, YP + WORLD_TILE_SIZE, 255, 0, 255); };
    }
    
    /** @type {function(number, number, GameRender)} */
    RenderFunction = null;
    
    Render(X, Y){
        if(this.RenderFunction === null){ return; }
        
        let XP, YP;
        if(X !== undefined && Y !== undefined){
            XP = X; YP = Y;
        }else{
            const PixelPosition = this.Position.GetPositionPixels();
            XP = PixelPosition[0];
            YP = PixelPosition[1];
        }
        this.RenderFunction(XP, YP, this);
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
        this.Position = new GamePosition(X, Y);
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
            this.Render.RenderFunction = (XP, YP) => {
                Graphic.DrawSprite(XP, YP, RenderResource);
            };
        }else if(typeof RenderResource === "function"){
            this.Render.RenderFunction = RenderResource;
        }else if(RenderResource === null){
            this.Render.RenderFunction = null
        }else{
            this.Render.RenderFunction = (XP, YP) => {
                Graphic.DrawRect(XP, YP, XP + WORLD_TILE_SIZE, YP + WORLD_TILE_SIZE, 255, 0, 255);
            };
        }
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