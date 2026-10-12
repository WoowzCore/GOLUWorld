const Player = {}

Player.Camera = {}
Player.Camera.X = 0;
Player.Camera.Y = 0;
Player.Camera.Zoom = 1;

Player.Camera.Update = function(DT){
    const PlayerX = Math.round(World.MainPlayer.Position.X);
    const PlayerY = Math.round(World.MainPlayer.Position.Y);
    const PlayerCenterX = PlayerX + SIZE_TILE * 0.5;
    const PlayerCenterY = PlayerY + SIZE_TILE * 0.5;

    const MouseOffsetX = Input.Mouse.Position[0] - (Graphic.BufferW * 0.5);
    const MouseOffsetY = Input.Mouse.Position[1] - (Graphic.BufferH * 0.5);

    Player.Camera.X = PlayerCenterX + (MouseOffsetX * 0.25) - (Graphic.BufferW * 0.5);
    Player.Camera.Y = PlayerCenterY + (MouseOffsetY * 0.25) - (Graphic.BufferH * 0.5);
}

class GamePlayer extends GameEntity{
    constructor(X = 0, Y = 0) {
        super(X, Y);

        this.Collider.OffsetX = this.Collider.OffsetY = 2;
        this.Collider.W = this.Collider.H = SIZE_TILE - this.Collider.OffsetX * 2; 
        
        this.Render.RenderFunction = (X, Y) => {
            const MouseWorldX = Input.Mouse.Position[0] + Player.Camera.X;
            const MouseWorldY = Input.Mouse.Position[1] + Player.Camera.Y;

            const PlayerX = this.Position.X + SIZE_TILE * 0.5;
            const PlayerY = this.Position.Y + SIZE_TILE * 0.5;
            
            const DX = MouseWorldX - PlayerX;
            const DY = MouseWorldY - PlayerY;
            const Distance = Math.sqrt(DX*DX + DY*DY) || 1;
            
            let LookX = 0;
            let LookY = 0;
            
            if(Distance > 8){
                LookX = (DX / Distance);
                LookY = (DY / Distance);
            }
            
            const MirrorX = this.WalkedRight ? -1 : 1;
            LookX = LookX * MirrorX;
            
            Graphic.Canvas(48, 48, X + 8, Y + 8, MirrorX, 1, 0, 0, 0, (W, H) => {
                Graphic.DrawSprite(16, 16, Sprite_PlayerBody);
                Graphic.DrawSprite(16, 16, Sprite_PlayerMouth);
                
                const RenderEye = (EyeX, EyeY, Sprite, SpriteClose, Blink, Right) => {
                    Graphic.DrawSprite(16, 16, Blink ? SpriteClose : Sprite);
                    if(Blink){ return; }
                    
                    let PupilX = Math.round(LookX);
                    let PupilY = Math.round(LookY);
                    
                    let DoublePupil = PupilY === 0;
                    if(!DoublePupil && PupilY < 0){
                        PupilY += 1;
                    }
                    
                    Graphic.SetPixel(EyeX + PupilX, EyeY + PupilY, 0, 0, 0);
                    if(DoublePupil){
                        Graphic.SetPixel(EyeX + PupilX, EyeY + PupilY + 1, 0, 0, 0);
                    }
                };
                
                RenderEye(16 + 4, 16 + 4, Sprite_PlayerEyeLeft, Sprite_PlayerEyeLeftClose, this.IsBlinking, false);
                RenderEye(16 + 11, 16 + 3, Sprite_PlayerEyeRight, Sprite_PlayerEyeRightClose, this.IsBlinking, true);
                
                Graphic.DrawSprite(16, 16, Sprite_PlayerNose);
            });
        };
        
        this.Render.HeightFunction = (X, Y) => {
            Graphic.FillHeightSprite(X, Y, Sprite_PlayerBody, 64);
        };
    }

    BlinkTimer = 0;
    IsBlinking = false;
    BlinkDuration = 0.15;
    
    Speed = 0;
    
    WalkedRight = false;

    WalkX = false;
    WalkY = false;
    Walk = false;
    
    Update(DT){
        this.BlinkTimer -= DT;
        if(this.BlinkTimer <= 0){
            if(!this.IsBlinking){
                this.IsBlinking = true;
                this.BlinkTimer = this.BlinkDuration;
            }else{
                this.IsBlinking = false;
                this.BlinkTimer = 2 + GMath.Random.Float() * 5;
                if(GMath.Random.Float() < 0.15){
                    this.BlinkTimer = 0.1;
                }
            }
        }
        
        if(Input.KeyIsPressed("home")){
            this.Position.X = this.Position.Y = SIZE_TILE * 5;
        }
        
        this.Speed = Input.KeyIsPressed("shiftl") ? 120 : 60;
        
        this.VelocityX = 0;
        this.VelocityY = 0;
        
        if(Input.KeyIsPressed("d")){
            this.VelocityX += this.Speed;
        }
        if(Input.KeyIsPressed("a")){
            this.VelocityX -= this.Speed;
        }
        if(Input.KeyIsPressed("s")){
            this.VelocityY += this.Speed;
        }
        if(Input.KeyIsPressed("w")){
            this.VelocityY -= this.Speed;
        }
        
        this.WalkX = this.VelocityX !== 0;
        this.WalkY = this.VelocityY !== 0;
        this.Walk = this.WalkX || this.WalkY;
        
        if(this.VelocityX !== 0 && this.VelocityY !== 0){
            const DiagScale = Math.SQRT1_2;
            this.VelocityX *= DiagScale;
            this.VelocityY *= DiagScale;
        }

        if(this.WalkX){
            this.WalkedRight = this.VelocityX > 0;
        }
        
        super.Update(DT);
    }
}