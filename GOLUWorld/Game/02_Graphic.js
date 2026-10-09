const GRAPHIC_EFFECT_NORMAL = 0;
const GRAPHIC_EFFECT_ADD = 1;
const GRAPHIC_EFFECT_SUB = 2;
const GRAPHIC_EFFECT_MUL = 3;
const GRAPHIC_EFFECT_XOR = 4;
const GRAPHIC_EFFECT_INVERT = 5;

const Graphic = {}

Graphic.__Effect = GRAPHIC_EFFECT_NORMAL;
Graphic.__Clip = { X1: 0, Y1: 0, X2: 0, Y2: 0 }

/** @type Uint32Array */
Graphic.Buffer = null;
Graphic.BufferSize = [0, 0];
Graphic.BufferW = 0;
Graphic.BufferH = 0;
Graphic.Div255 = 1 / 255;

Graphic.Start = function(){
    Graphic.Buffer     = Bridge.Value.FrameBuffer;
    Graphic.BufferSize = Bridge.Value.ScreenSize;
    Graphic.BufferW    = Graphic.BufferSize[0];
    Graphic.BufferH    = Graphic.BufferSize[1];

    Graphic.__Clip.X1 = 0;
    Graphic.__Clip.Y1 = 0;
    Graphic.__Clip.X2 = Graphic.BufferW;
    Graphic.__Clip.Y2 = Graphic.BufferH;
}

Graphic.Effect = function(Effect, Function){
    let OldEffect = Graphic.__Effect;
    Graphic.__Effect = Effect;
    Function();
    Graphic.__Effect = OldEffect;
}

Graphic.Clip = function(X1, Y1, X2, Y2, Function){
    let OldClipX1 = Graphic.__Clip.X1;
    let OldClipY1 = Graphic.__Clip.Y1;
    let OldClipX2 = Graphic.__Clip.X2;
    let OldClipY2 = Graphic.__Clip.Y2;
    
    Graphic.__Clip.X1 = Math.max(0, X1) | 0;
    Graphic.__Clip.Y1 = Math.max(0, Y1) | 0;
    Graphic.__Clip.X2 = Math.min(Graphic.BufferW, X2) | 0;
    Graphic.__Clip.Y2 = Math.min(Graphic.BufferH, Y2) | 0;
    
    Function();

    Graphic.__Clip.X1 = OldClipX1;
    Graphic.__Clip.Y1 = OldClipY1;
    Graphic.__Clip.X2 = OldClipX2;
    Graphic.__Clip.Y2 = OldClipY2;
}

Graphic.__CanvasPool = [];
Graphic.__CanvasStack = [];
Graphic.__GetPoolBuffer = function(Size){
    for(let i = 0; i < this.__CanvasPool.length; i++){
        if(this.__CanvasPool[i].length >= Size){
            return this.__CanvasPool.splice(i, 1)[0];
        }
    }
    return new Uint32Array(Size);
}

Graphic.Canvas = function(W, H, X, Y, SW, SH, PX, PY, Rot, Function){
    let Size = (W * H) | 0;
    const CanvasData = Graphic.__GetPoolBuffer(Size);
    CanvasData.fill(0, 0, Size);
    
    Graphic.__CanvasStack.push({
        Buffer: Graphic.Buffer,
        W: Graphic.BufferW,
        H: Graphic.BufferH,
        Clip: { ...Graphic.__Clip }
    });
    
    Graphic.Buffer = CanvasData;
    Graphic.BufferW = W;
    Graphic.BufferH = H;
    Graphic.__Clip = { X1: 0, Y1: 0, X2: W, Y2: H };
    
    Function(W, H);
    
    const Parent = Graphic.__CanvasStack.pop();
    Graphic.Buffer = Parent.Buffer;
    Graphic.BufferW = Parent.W;
    Graphic.BufferH = Parent.H;
    Graphic.__Clip = Parent.Clip;
    
    Graphic.DrawPixelsTransformed(CanvasData, W | 0, H | 0, X, Y, SW, SH, PX, PY, Rot);
    
    Graphic.__CanvasPool.push(CanvasData);
}

Graphic.Clear = function(R, G, B){
    Graphic.Buffer.fill((255 << 24) | (B << 16) | (G << 8) | R);
}

Graphic.In = function(X, Y, X1, Y1, X2, Y2){
    return X >= X1 && X < X2 && Y >= Y1 && Y < Y2;
}

Graphic.InBuffer = function(X, Y){
    return Graphic.In(X, Y, 0, 0, Graphic.BufferW, Graphic.BufferH);
}

Graphic.InClip = function(X, Y){
    return Graphic.In(X, Y, Graphic.__Clip.X1, Graphic.__Clip.Y1, Graphic.__Clip.X2, Graphic.__Clip.Y2);
}

Graphic.GetPixel = function(X, Y){
    if(!Graphic.InBuffer(X, Y)){ return [0, 0, 0, 0, true]; }
    const Color = Graphic.Buffer[(Y | 0) * Graphic.BufferW + (X | 0)];
    return [
         Color        & 0xFF,
        (Color >> 8 ) & 0xFF,
        (Color >> 16) & 0xFF,
        (Color >> 24) & 0xFF
    ];
}

Graphic.CalculateColorResult = { R: 0, G: 0, B: 0 }
Graphic.CalculateColor = function(DR, DG, DB, R, G, B, A, Effect){
    let RR = R;
    let RG = G;
    let RB = B;
    
    if(Effect !== GRAPHIC_EFFECT_NORMAL){
        switch(Effect){
            case GRAPHIC_EFFECT_ADD:
                RR = (R + DR); if(RR > 255){ RR = 255 }
                RG = (G + DG); if(RG > 255){ RG = 255 }
                RB = (B + DB); if(RB > 255){ RB = 255 }
                break;
            case GRAPHIC_EFFECT_SUB:
                RR = (DR - R); if(RR < 0){ RR = 0 }
                RG = (DG - G); if(RG < 0){ RG = 0 }
                RB = (DB - B); if(RB < 0){ RB = 0 }
                break;
            case GRAPHIC_EFFECT_MUL:
                RR = (R * DR) >> 8;
                RG = (G * DG) >> 8;
                RB = (B * DB) >> 8;
                break;
            case GRAPHIC_EFFECT_XOR:
                RR = R ^ DR;
                RG = G ^ DG;
                RB = B ^ DB;
                break;
            case GRAPHIC_EFFECT_INVERT:
                RR = 255 - DR;
                RG = 255 - DG;
                RB = 255 - DB;
                break;
            default:
                RR = 255;
                RG = 0;
                RB = 255;
        }
    }
    
    if(A < 255){
        const IA = 255 - A;
        RR = ((RR * A) + (DR * IA)) >> 8;
        RG = ((RG * A) + (DG * IA)) >> 8;
        RB = ((RB * A) + (DB * IA)) >> 8;
    }
    
    Graphic.CalculateColorResult.R = RR;
    Graphic.CalculateColorResult.G = RG;
    Graphic.CalculateColorResult.B = RB;
}

Graphic.SetPixel = function(X, Y, R, G, B, A = 255){
    if(A === 0 || !Graphic.InClip(X, Y)){ return; }
    
    const Index = (Y | 0) * Graphic.BufferW + (X | 0);
    const Buf = Graphic.Buffer;

    if (Graphic.__Effect === GRAPHIC_EFFECT_NORMAL && A === 255) {
        Buf[Index] = (255 << 24) | (B << 16) | (G << 8) | R;
        return;
    }
    
    const DColor = Buf[Index];
    const DR =  DColor        & 0xFF;
    const DG = (DColor >> 8 ) & 0xFF;
    const DB = (DColor >> 16) & 0xFF;

    Graphic.CalculateColor(DR, DG, DB, R, G, B, A, Graphic.__Effect);

    Buf[Index] = (255 << 24) | (Graphic.CalculateColorResult.B << 16) | (Graphic.CalculateColorResult.G << 8) | Graphic.CalculateColorResult.R;
}

Graphic.DrawRect = function(X1, Y1, X2, Y2, R, G, B, A = 255){
    if(A === 0){ return; }
    
    X1 = Math.max(Graphic.__Clip.X1, X1) | 0;
    Y1 = Math.max(Graphic.__Clip.Y1, Y1) | 0;
    X2 = Math.min(Graphic.__Clip.X2, X2) | 0;
    Y2 = Math.min(Graphic.__Clip.Y2, Y2) | 0;
    
    if(X1 >= X2 || Y1 >= Y2){ return; }

    const SW = Graphic.BufferW;
    const Buf = Graphic.Buffer;
    
    const Effect = Graphic.__Effect;
    
    if(A === 255 && Effect === GRAPHIC_EFFECT_NORMAL){
        const Color = (255 << 24) | (B << 16) | (G << 8) | R;
        for(let PY = Y1; PY < Y2; PY++){
            const Row = PY * SW;
            Buf.fill(Color, Row + X1, Row + X2);
        }
        return;
    }
    
    for(let PY = Y1; PY < Y2; PY++){
        const RowOffset = PY * SW;
        for(let PX = X1; PX < X2; PX++){
            const Index = RowOffset + PX;
            const DColor = Buf[Index];
            const DR =  DColor        & 0xFF;
            const DG = (DColor >> 8 ) & 0xFF;
            const DB = (DColor >> 16) & 0xFF;
            
            Graphic.CalculateColor(DR, DG, DB, R, G, B, A, Effect);
            
            Buf[Index] = (255 << 24) | (Graphic.CalculateColorResult.B << 16) | (Graphic.CalculateColorResult.G << 8) | Graphic.CalculateColorResult.R;
        }
    }
}

Graphic.DrawPixels = function(X, Y, W, Data){
    if(!Data){ return; }
    
    const H = (Data.length / W) | 0;

    let X1 = Math.max(Graphic.__Clip.X1, X) | 0;
    let Y1 = Math.max(Graphic.__Clip.Y1, Y) | 0;
    let X2 = Math.min(Graphic.__Clip.X2, X + W) | 0;
    let Y2 = Math.min(Graphic.__Clip.Y2, Y + H) | 0;
    
    if(X1 >= X2 || Y1 >= Y2){ return; }

    const SW = Graphic.BufferW;
    const Buf = Graphic.Buffer;
    
    const Effect = Graphic.__Effect;
    
    for(let PY = Y1; PY < Y2; PY++){
        const ScreenRowOffset = PY * SW;
        const SpriteRowOffset = ((PY - Y) | 0) * W;
        
        for(let PX = X1; PX < X2; PX++){
            const SpriteIndex = SpriteRowOffset + ((PX - X) | 0);
            const Color = Data[SpriteIndex];
            
            const A = (Color >> 24) & 0xFF;
            
            if(A === 0){ continue; }

            const R =  Color        & 0xFF;
            const G = (Color >> 8 ) & 0xFF;
            const B = (Color >> 16) & 0xFF;
            
            const BufIndex = ScreenRowOffset + PX;
            
            if(Effect === GRAPHIC_EFFECT_NORMAL && A === 255){
                Buf[BufIndex] = Color;
            }else{
                const DColor = Buf[BufIndex];
                const DR =  DColor        & 0xFF;
                const DG = (DColor >> 8 ) & 0xFF;
                const DB = (DColor >> 16) & 0xFF;
                
                Graphic.CalculateColor(DR, DG, DB, R, G, B, A, Effect);
                
                Buf[BufIndex] = (255 << 24) | (Graphic.CalculateColorResult.B << 16) | (Graphic.CalculateColorResult.G << 8) | Graphic.CalculateColorResult.R;
            }
        }
    }
}

Graphic.DrawSprite = function(X, Y, Sprite){
    if(!Sprite){ return; }
    Graphic.DrawPixels(X, Y, Sprite.Width, Sprite.Data);
}

Graphic.DrawPixelsTransformed = function(Data, W, H, X, Y, SW, SH, PX, PY, Rot){
    const Sin = GMath.SinFast(Rot);
    const Cos = GMath.CosFast(Rot);

    const MaxDim = Math.sqrt(W*W + H*H) * Math.max(Math.abs(SW), Math.abs(SH));
    let X1 = Math.max(Graphic.__Clip.X1, X - MaxDim) | 0;
    let Y1 = Math.max(Graphic.__Clip.Y1, Y - MaxDim) | 0;
    let X2 = Math.min(Graphic.__Clip.X2, X + MaxDim) | 0;
    let Y2 = Math.min(Graphic.__Clip.Y2, Y + MaxDim) | 0;

    if(X1 >= X2 || Y1 >= Y2){ return; }

    const PivotX = W * (PX + 1) * 0.5;
    const PivotY = H * (1 - PY) * 0.5;
    
    const ISW = 1 / SW;
    const ISH = 1 / SH;

    const SM1 =  Cos * ISW;
    const SM2 =  Sin * ISW;
    const SM3 = -Sin * ISH;
    const SM4 =  Cos * ISH;
    
    for(let SY = Y1; SY < Y2; SY++){
        let DX = (X1 - X);
        let DY = (SY - Y);

        let RX = DX * SM1 + DY * SM2 + PivotX;
        let RY = DX * SM3 + DY * SM4 + PivotY;
        
        for(let SX = X1; SX < X2; SX++){
            if(RX >= 0 && RX < W && RY >= 0 && RY < H){
                const Color = Data[(RY | 0) * W + (RX | 0)];
                const A = (Color >> 24 & 0xFF);
                
                if(A > 0){
                    Graphic.SetPixel(SX, SY, Color & 0xFF, (Color >> 8) & 0xFF, (Color >> 16) & 0xFF, A);
                }
            }
            
            RX += SM1;
            RY += SM3;
        }
    }
}