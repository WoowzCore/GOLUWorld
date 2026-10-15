const GRAPHIC_EFFECT_NORMAL = 0;
const GRAPHIC_EFFECT_ADD = 1;
const GRAPHIC_EFFECT_SUB = 2;
const GRAPHIC_EFFECT_MUL = 3;
const GRAPHIC_EFFECT_XOR = 4;
const GRAPHIC_EFFECT_INVERT = 5;

const Graphic = {}

Graphic.__Effect = GRAPHIC_EFFECT_NORMAL;
Graphic.__Clip = { X1: 0, Y1: 0, X2: 0, Y2: 0 }
Graphic.__Colorize = null;

/** @type Uint32Array */
Graphic.Buffer = null;
Graphic.BufferSize = [0, 0];
Graphic.BufferW = 0;
Graphic.BufferH = 0;
Graphic.Div255 = 1 / 255;

Graphic.ScreenExtend = 64;

/** @type Uint16Array */
Graphic.HeightBuffer = null;
Graphic.HeightW = 0;
Graphic.HeightH = 0;

/** @type Uint8Array */
Graphic.ShadowBuffer = null;

Graphic.Start = function(){
    Graphic.Buffer     = Bridge.Value.FrameBuffer;
    Graphic.BufferSize = Bridge.Value.ScreenSize;
    Graphic.BufferW    = Graphic.BufferSize[0];
    Graphic.BufferH    = Graphic.BufferSize[1];

    Graphic.HeightW = Graphic.BufferW + Graphic.ScreenExtend * 2;
    Graphic.HeightH = Graphic.BufferH + Graphic.ScreenExtend * 2;
    Graphic.HeightBuffer = new Uint16Array(Graphic.HeightW * Graphic.HeightH);
    Graphic.ShadowBuffer = new Uint8Array(Graphic.BufferW * Graphic.BufferH);

    Graphic.__Clip.X1 = 0;
    Graphic.__Clip.Y1 = 0;
    Graphic.__Clip.X2 = Graphic.BufferW;
    Graphic.__Clip.Y2 = Graphic.BufferH;
}

Graphic.Effect = function(Effect, Function){
    let OldEffect = Graphic.__Effect;
    
    Graphic.__Effect = Effect;
    
    let Result = Function();
    
    Graphic.__Effect = OldEffect;
    
    return Result;
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

    let Result = Function();

    Graphic.__Clip.X1 = OldClipX1;
    Graphic.__Clip.Y1 = OldClipY1;
    Graphic.__Clip.X2 = OldClipX2;
    Graphic.__Clip.Y2 = OldClipY2;
    
    return Result;
}

Graphic.Colorize = function(R, G, B, A, Multiply, Function){
    const Old = Graphic.__Colorize;
    
    let NewR = R;
    let NewG = G;
    let NewB = B;
    let NewA = A;
    
    if(Multiply && Old !== null){
        NewR = (R * Old.R) >> 8;
        NewG = (G * Old.G) >> 8;
        NewB = (B * Old.B) >> 8;
        NewA = (A * Old.A) >> 8;
    }
    
    if(NewR === 255 && NewG === 255 && NewB === 255 && NewA === 255){
        Graphic.__Colorize = null;
    }else{
        Graphic.__Colorize = { R: NewR, G: NewG, B: NewB, A: NewA };
    }
    
    let Result = Function();
    
    Graphic.__Colorize = Old;
    
    return Result;
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

Graphic.IsByteData = function(Data){
    if(!Data){ return false; }
    if(Data instanceof Uint8Array){ return true; }
    return Data.BYTES_PER_ELEMENT === 1;
}

Graphic.DataGet = function(Data, Index, IsU8){
    if(IsU8){
        const B = Index * 4;
        return (
            (Data[B    ]      ) |
            (Data[B + 1] << 8 ) |
            (Data[B + 2] << 16) |
            (Data[B + 3] << 24)
        ) >>> 0;
    }
    return Data[Index];
}

Graphic.DataAlphaGet = function(Data, Index, IsU8){
    if(IsU8){ return Data[Index * 4 + 3]; }
    return (Data[Index] >>> 24) & 0xFF;
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

    let Result = Function(W, H);
    
    const Parent = Graphic.__CanvasStack.pop();
    Graphic.Buffer = Parent.Buffer;
    Graphic.BufferW = Parent.W;
    Graphic.BufferH = Parent.H;
    Graphic.__Clip = Parent.Clip;
    
    Graphic.DrawPixelsTransformed(CanvasData, W | 0, H | 0, X, Y, SW, SH, PX, PY, Rot);
    
    Graphic.__CanvasPool.push(CanvasData);
    
    return Result;
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

Graphic.CalculateColorResult = { R: 0, G: 0, B: 0, A: 0 }
Graphic.CalculateColor = function(DR, DG, DB, DA, R, G, B, A, Effect){
    let RR = R;
    let RG = G;
    let RB = B;
    let RA = A;
    
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
        RA = Math.max(DA, A);
    }
    
    Graphic.CalculateColorResult.R = RR;
    Graphic.CalculateColorResult.G = RG;
    Graphic.CalculateColorResult.B = RB;
    Graphic.CalculateColorResult.A = RA;
}

Graphic.SetPixel = function(X, Y, R, G, B, A = 255){
    const Tint = Graphic.__Colorize;
    if(Tint !== null){
        R = (R * Tint.R) >> 8;
        G = (G * Tint.G) >> 8;
        B = (B * Tint.B) >> 8;
        A = (A * Tint.A) >> 8;
    }
    
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
    const DA = (DColor >> 24) & 0xFF;

    Graphic.CalculateColor(DR, DG, DB, DA, R, G, B, A, Graphic.__Effect);

    Buf[Index] = (Graphic.CalculateColorResult.A << 24) | (Graphic.CalculateColorResult.B << 16) | (Graphic.CalculateColorResult.G << 8) | Graphic.CalculateColorResult.R;
}

Graphic.DrawRect = function(X1, Y1, X2, Y2, R, G, B, A = 255){
    const Tint = Graphic.__Colorize;
    if(Tint !== null){
        R = (R * Tint.R) >> 8;
        G = (G * Tint.G) >> 8;
        B = (B * Tint.B) >> 8;
        A = (A * Tint.A) >> 8;
    }
    
    if(A === 0){ return; }

    let MinX = Math.floor(Math.min(X1, X2));
    let MaxX = Math.floor(Math.max(X1, X2));
    let MinY = Math.floor(Math.min(Y1, Y2));
    let MaxY = Math.floor(Math.max(Y1, Y2));
    
    X1 = Math.max(Graphic.__Clip.X1, Math.floor(MinX));
    Y1 = Math.max(Graphic.__Clip.Y1, Math.floor(MinY));
    X2 = Math.min(Graphic.__Clip.X2, Math.floor(MaxX));
    Y2 = Math.min(Graphic.__Clip.Y2, Math.floor(MaxY));
    
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
            const DA = (DColor >> 24) & 0xFF;
            
            Graphic.CalculateColor(DR, DG, DB, DA, R, G, B, A, Effect);
            
            Buf[Index] = (Graphic.CalculateColorResult.A << 24) | (Graphic.CalculateColorResult.B << 16) | (Graphic.CalculateColorResult.G << 8) | Graphic.CalculateColorResult.R;
        }
    }
}

Graphic.DrawPixels = function(X, Y, W, Data){
    if(!Data){ return; }

    const IsU8 = Graphic.IsByteData(Data);
    const H = IsU8 ? ((Data.length / 4 / W) | 0) : ((Data.length / W) | 0);

    X = Math.floor(X);
    Y = Math.floor(Y);

    let X1 = Math.max(Graphic.__Clip.X1, X) | 0;
    let Y1 = Math.max(Graphic.__Clip.Y1, Y) | 0;
    let X2 = Math.min(Graphic.__Clip.X2, X + W) | 0;
    let Y2 = Math.min(Graphic.__Clip.Y2, Y + H) | 0;

    if(X1 >= X2 || Y1 >= Y2){ return; }

    const SW = Graphic.BufferW;
    const Buf = Graphic.Buffer;
    const Effect = Graphic.__Effect;
    const Tint = Graphic.__Colorize;

    for(let PY = Y1; PY < Y2; PY++){
        const ScreenRowOffset = PY * SW;
        const SpriteRowOffset = (PY - Y) * W;

        for(let PX = X1; PX < X2; PX++){
            const SIndex = SpriteRowOffset + ((PX - X) | 0);
            const Color = Graphic.DataGet(Data, SIndex, IsU8);
            let A = (Color >>> 24) & 0xFF;

            if(Tint !== null){ A = (A * Tint.A) >> 8; }
            
            if(A === 0){ continue; }

            let R =  Color        & 0xFF;
            let G = (Color >>> 8 ) & 0xFF;
            let B = (Color >>> 16) & 0xFF;

            if(Tint !== null){
                R = (R * Tint.R) >> 8;
                G = (G * Tint.G) >> 8;
                B = (B * Tint.B) >> 8;
            }
            
            const BufIndex = ScreenRowOffset + PX;

            if(Effect === GRAPHIC_EFFECT_NORMAL && A === 255){
                Buf[BufIndex] = Color;
            }else{
                const DColor = Buf[BufIndex];
                const DR =  DColor        & 0xFF;
                const DG = (DColor >>> 8 ) & 0xFF;
                const DB = (DColor >>> 16) & 0xFF;
                const DA = (DColor >>> 24) & 0xFF;

                Graphic.CalculateColor(DR, DG, DB, DA, R, G, B, A, Effect);

                Buf[BufIndex] = (Graphic.CalculateColorResult.A << 24) | (Graphic.CalculateColorResult.B << 16) | (Graphic.CalculateColorResult.G << 8) | Graphic.CalculateColorResult.R;
            }
        }
    }
}

Graphic.DrawPixelsGray = function(X, Y, W, Data, Alpha = 255){
    if(!Data){ return; }

    const H = (Data.length / W) | 0;

    X = Math.floor(X);
    Y = Math.floor(Y);

    let X1 = Math.max(Graphic.__Clip.X1, X) | 0;
    let Y1 = Math.max(Graphic.__Clip.Y1, Y) | 0;
    let X2 = Math.min(Graphic.__Clip.X2, X + W) | 0;
    let Y2 = Math.min(Graphic.__Clip.Y2, Y + H) | 0;

    if(X1 >= X2 || Y1 >= Y2){ return; }

    const SW = Graphic.BufferW;
    const Buf = Graphic.Buffer;
    const Effect = Graphic.__Effect;
    const Tint = Graphic.__Colorize;

    for(let PY = Y1; PY < Y2; PY++){
        const ScreenRowOffset = PY * SW;
        const SpriteRowOffset = (PY - Y) * W;

        for(let PX = X1; PX < X2; PX++){
            const Value = Data[SpriteRowOffset + ((PX - X) | 0)];

            let A = Alpha;
            
            if(Tint !== null){ A = (A * Tint.A) >> 8; }
            
            if(Alpha === 0){ continue; }

            let R = Value;
            let G = Value;
            let B = Value;

            if(Tint !== null){
                R = (R * Tint.R) >> 8;
                G = (G * Tint.G) >> 8;
                B = (B * Tint.B) >> 8;
            }
            
            const BufIndex = ScreenRowOffset + PX;

            if(Alpha === 255 && Effect === GRAPHIC_EFFECT_NORMAL){
                Buf[BufIndex] = (255 << 24) | (B << 16) | (G << 8) | R;
            }else{
                const DColor = Buf[BufIndex];
                const DR =  DColor        & 0xFF;
                const DG = (DColor >> 8 ) & 0xFF;
                const DB = (DColor >> 16) & 0xFF;
                const DA = (DColor >> 24) & 0xFF;

                Graphic.CalculateColor(DR, DG, DB, DA, R, G, B, A, Effect);

                Buf[BufIndex] = (Graphic.CalculateColorResult.A << 24) | (Graphic.CalculateColorResult.B << 16) | (Graphic.CalculateColorResult.G << 8) | Graphic.CalculateColorResult.R;
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

    const IsU8 = Graphic.IsByteData(Data);

    const PivotX = W * (PX + 1) * 0.5 + (SW < 0 ? -0.5 : 0);
    const PivotY = H * (1 - PY) * 0.5 + (SH < 0 ? -0.5 : 0);

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
                const SIndex = Math.floor(RY) * W + Math.floor(RX);
                const Color = Graphic.DataGet(Data, SIndex, IsU8);
                const A = (Color >>> 24) & 0xFF;

                if(A > 0){
                    Graphic.SetPixel(SX, SY, Color & 0xFF, (Color >>> 8) & 0xFF, (Color >>> 16) & 0xFF, A);
                }
            }

            RX += SM1;
            RY += SM3;
        }
    }
}

Graphic.DrawText = function(X, Y, Text, R = 255, G = 255, B = 255, A = 255, Font = undefined){
    Font = Font === undefined ? Font_Default : Font;
    
    return Graphic.Colorize(R, G, B, A, true, () => Font.RenderText(X, Y, Text));
}

// ----------------------------------------------------------------------

Graphic.ClearHeight = function(Height){
    Graphic.HeightBuffer.fill(Height);
}

Graphic.SetMaxHeight = function(X, Y, Height){
    if(Height === 0){ return; }

    const Ext = Graphic.ScreenExtend;
    const W = Graphic.HeightW;
    const H = Graphic.HeightH;

    const IX = (X | 0) + Ext;
    const IY = (Y | 0) + Ext;

    if(IX < 0 || IY < 0 || IX >= W || IY >= H){ return; }

    const Index = IY * W + IX;
    const Buf = Graphic.HeightBuffer;
    if(Height > Buf[Index]){ Buf[Index] = Height; }
}

Graphic.FillHeight = function(X1, Y1, X2, Y2, Height){
    if(Height === 0){ return; }

    const Ext = Graphic.ScreenExtend;
    const W = Graphic.HeightW;
    const H = Graphic.HeightH;

    X1 = Math.max(0, Math.floor(X1) + Ext);
    Y1 = Math.max(0, Math.floor(Y1) + Ext);
    X2 = Math.min(W, Math.floor(X2) + Ext);
    Y2 = Math.min(H, Math.floor(Y2) + Ext);

    if(X1 >= X2 || Y1 >= Y2){ return; }

    const Buf = Graphic.HeightBuffer;

    for(let PY = Y1; PY < Y2; PY++){
        const Row = PY * W;
        for(let PX = X1; PX < X2; PX++){
            const Index = Row + PX;
            if(Height > Buf[Index]){ Buf[Index] = Height; }
        }
    }
}

Graphic.GetHeight = function(X, Y){
    const Ext = Graphic.ScreenExtend;
    const IX = (X | 0) + Ext;
    const IY = (Y | 0) + Ext;
    if(IX < 0 || IY < 0 || IX >= Graphic.HeightW || IY >= Graphic.HeightH){ return 0; }
    return Graphic.HeightBuffer[IY * Graphic.HeightW + IX];
}

Graphic.FillHeightSprite = function(X, Y, Sprite, Height, Threshold = 1){
    if(!Sprite || Height === 0){ return; }
    
    const Data = Sprite.Data;
    const SW = Sprite.Width;
    const SH = Sprite.Height;
    
    const Ext = Graphic.ScreenExtend;
    const BufW = Graphic.HeightW;
    const BufH = Graphic.HeightH;
    
    X = Math.floor(X);
    Y = Math.floor(Y);
    
    let X1 = Math.max(0, X + Ext);
    let Y1 = Math.max(0, Y + Ext);
    let X2 = Math.min(BufW, X + Ext + SW);
    let Y2 = Math.min(BufH, Y + Ext + SH);
    
    if(X1 >= X2 || Y1 >= Y2){ return; }
    
    const IsU8 = Graphic.IsByteData(Data);
    const HBuf = Graphic.HeightBuffer;
    
    if(IsU8){
        for(let PY = Y1; PY < Y2; PY++){
            const BufRow = PY * BufW;
            const SpriteRow = (PY - Ext - Y) * SW * 4;
            for(let PX = X1; PX < X2; PX++){
                const A = Data[SpriteRow + (PX - Ext - X) * 4 + 3];
                if(A < Threshold){ continue; }
                const BufIndex = BufRow + PX;
                if(Height > HBuf[BufIndex]){ HBuf[BufIndex] = Height; }
            }
        }
    }else{
        for(let PY = Y1; PY < Y2; PY++){
            const BufRow = PY * BufW;
            const SpriteRow = (PY - Ext - Y) * SW;
            for(let PX = X1; PX < X2; PX++){
                const A = (Data[SpriteRow + (PX - Ext - X)] >>> 24) & 0xFF;
                if(A < Threshold){ continue; }
                const BufIndex = BufRow + PX;
                if(Height > HBuf[BufIndex]){ HBuf[BufIndex] = Height; }
            }
        }
    }
}

// ----------------------------------------------------------------------

Graphic.GenerateShadows = function(
    Buffer, BufferW, BufferH,
    HeightBuffer, HeightExtW, HeightExtH, Ext,
    ShadowBuffer,
    SunAngle = 45,
    SunHeight = 45,
    Strength = 140,
    Softness = 1,
    Levels = 0,
    ShadowR = 0, ShadowG = 0, ShadowB = 0
){
    const W = BufferW;
    const H = BufferH;
    const HBuf = HeightBuffer;
    const SBuf = ShadowBuffer;
    const Buf = Buffer;

    SBuf.fill(0);

    const AngleRad = SunAngle * Math.PI / 180;
    const ShadowDX = Math.cos(AngleRad);
    const ShadowDY = Math.sin(AngleRad);

    const HeightRad = Math.max(1, Math.min(89, SunHeight)) * Math.PI / 180;
    const LengthScale = 1 / Math.tan(HeightRad);

    const MAX_SHADOW = 64;

    const DXPos = ShadowDX > 0;
    const DXNeg = ShadowDX < 0;
    const DXZero = ShadowDX === 0;
    const DYPos = ShadowDY > 0;
    const DYNeg = ShadowDY < 0;
    const DYZero = ShadowDY === 0;

    for(let EY = 0; EY < HeightExtH; EY++){
        const ExtRow = EY * HeightExtW;
        const SrcScreenY = EY - Ext;

        for(let EX = 0; EX < HeightExtW; EX++){
            const HVal = HBuf[ExtRow + EX];
            if(HVal <= 0){ continue; }

            const SrcScreenX = EX - Ext;

            let ShadowLength = ((HVal * LengthScale) / 16) | 0;
            if(ShadowLength > MAX_SHADOW){ ShadowLength = MAX_SHADOW; }
            if(ShadowLength <= 0){ continue; }

            const InvLength = 1 / ShadowLength;
            const InvLengthSoft = InvLength * Softness;

            let FX = SrcScreenX + ShadowDX;
            let FY = SrcScreenY + ShadowDY;

            if(DXPos && SrcScreenX >= W){ continue; }
            if(DXNeg && SrcScreenX < 0){ continue; }
            if(DYPos && SrcScreenY >= H){ continue; }
            if(DYNeg && SrcScreenY < 0){ continue; }

            for(let S = 1; S <= ShadowLength; S++){
                const SX = FX | 0;
                const SY = FY | 0;
                FX += ShadowDX;
                FY += ShadowDY;

                if(DXPos && SX >= W){ break; }
                if(DXNeg && SX < 0){ break; }
                if(DXZero && (SX < 0 || SX >= W)){ break; }
                if(DYPos && SY >= H){ break; }
                if(DYNeg && SY < 0){ break; }
                if(DYZero && (SY < 0 || SY >= H)){ break; }

                if(SX < 0 || SY < 0 || SX >= W || SY >= H){ continue; }

                const TargetH = HBuf[(SY + Ext) * HeightExtW + (SX + Ext)];

                const ShadowHeight = HVal * (1 - S * InvLength);
                if(ShadowHeight <= TargetH){ continue; }

                const SIndex = SY * W + SX;

                let Falloff = 1 - (S - 1) * InvLengthSoft;
                if(Falloff < 0){ Falloff = 0; }

                const Amount = (Strength * Falloff) | 0;

                if(Amount > SBuf[SIndex]){ SBuf[SIndex] = Amount; }
            }
        }
    }

    const Inv255 = 1 / 255;
    const Step = Levels > 0 ? (255 / Levels) : 0;

    for(let I = 0, N = W * H; I < N; I++){
        let Amount = SBuf[I];
        if(Amount <= 0){ continue; }

        if(Levels > 0){
            Amount = Math.ceil(Amount / Step) * Step;
            if(Amount > 255){ Amount = 255; }
        }

        const Color = Buf[I];
        const DR =  Color        & 0xFF;
        const DG = (Color >> 8 ) & 0xFF;
        const DB = (Color >> 16) & 0xFF;
        const DA = (Color >> 24) & 0xFF;

        const IA = 255 - Amount;
        const R = ((ShadowR * Amount) + (DR * IA)) * Inv255 | 0;
        const G = ((ShadowG * Amount) + (DG * IA)) * Inv255 | 0;
        const B = ((ShadowB * Amount) + (DB * IA)) * Inv255 | 0;

        Buf[I] = (DA << 24) | (B << 16) | (G << 8) | R;
    }
}