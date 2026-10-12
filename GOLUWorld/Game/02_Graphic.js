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

/** @type Uint16Array */
Graphic.HeightBuffer = null;

/** @type Uint8Array */
Graphic.ShadowBuffer = null;

Graphic.Start = function(){
    Graphic.Buffer     = Bridge.Value.FrameBuffer;
    Graphic.BufferSize = Bridge.Value.ScreenSize;
    Graphic.BufferW    = Graphic.BufferSize[0];
    Graphic.BufferH    = Graphic.BufferSize[1];
    
    Graphic.HeightBuffer = new Uint16Array(Graphic.BufferW * Graphic.BufferH);
    Graphic.ShadowBuffer = new Uint8Array(Graphic.BufferW * Graphic.BufferH);

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

    for(let PY = Y1; PY < Y2; PY++){
        const ScreenRowOffset = PY * SW;
        const SpriteRowOffset = (PY - Y) * W;

        for(let PX = X1; PX < X2; PX++){
            const SIndex = SpriteRowOffset + ((PX - X) | 0);
            const Color = Graphic.DataGet(Data, SIndex, IsU8);
            const A = (Color >>> 24) & 0xFF;

            if(A === 0){ continue; }

            const R =  Color        & 0xFF;
            const G = (Color >>> 8 ) & 0xFF;
            const B = (Color >>> 16) & 0xFF;

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

    const FullOpacity = (Alpha === 255 && Effect === GRAPHIC_EFFECT_NORMAL);

    for(let PY = Y1; PY < Y2; PY++){
        const ScreenRowOffset = PY * SW;
        const SpriteRowOffset = (PY - Y) * W;

        for(let PX = X1; PX < X2; PX++){
            const Value = Data[SpriteRowOffset + ((PX - X) | 0)];

            if(Alpha === 0){ continue; }

            const R = Value;
            const G = Value;
            const B = Value;

            const BufIndex = ScreenRowOffset + PX;

            if(FullOpacity){
                Buf[BufIndex] = (255 << 24) | (B << 16) | (G << 8) | R;
            }else{
                const DColor = Buf[BufIndex];
                const DR =  DColor        & 0xFF;
                const DG = (DColor >> 8 ) & 0xFF;
                const DB = (DColor >> 16) & 0xFF;
                const DA = (DColor >> 24) & 0xFF;

                Graphic.CalculateColor(DR, DG, DB, DA, R, G, B, Alpha, Effect);

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

// ----------------------------------------------------------------------

Graphic.ClearHeight = function(Height){
    Graphic.HeightBuffer.fill(Height);
}

Graphic.SetMaxHeight = function(X, Y, Height){
    if(Height === 0){ return; }
    if(!Graphic.InBuffer(X, Y)){ return; }

    const Index = (Y | 0) * Graphic.BufferW + (X | 0);
    const Buf = Graphic.HeightBuffer;
    if(Height > Buf[Index]){ Buf[Index] = Height; }
}

Graphic.FillHeight = function(X1, Y1, X2, Y2, Height){
    if(Height === 0){ return; }

    X1 = Math.max(0, Math.floor(X1)) | 0;
    Y1 = Math.max(0, Math.floor(Y1)) | 0;
    X2 = Math.min(Graphic.BufferW, Math.floor(X2)) | 0;
    Y2 = Math.min(Graphic.BufferH, Math.floor(Y2)) | 0;

    if(X1 >= X2 || Y1 >= Y2){ return; }

    const Buf = Graphic.HeightBuffer;
    const SW = Graphic.BufferW;

    for(let PY = Y1; PY < Y2; PY++){
        const Row = PY * SW;
        for(let PX = X1; PX < X2; PX++){
            const Index = Row + PX;
            if(Height > Buf[Index]){ Buf[Index] = Height; }
        }
    }
}

Graphic.GetHeight = function(X, Y){
    if(!Graphic.InBuffer(X, Y)){ return 0; }
    return Graphic.HeightBuffer[(Y | 0) * Graphic.BufferW + (X | 0)];
}

Graphic.FillHeightSprite = function(X, Y, Sprite, Height, Threshold = 1){
    if(!Sprite || Height === 0){ return; }

    const Data = Sprite.Data;
    const W = Sprite.Width;
    const H = Sprite.Height;

    X = Math.floor(X);
    Y = Math.floor(Y);

    let X1 = Math.max(0, X) | 0;
    let Y1 = Math.max(0, Y) | 0;
    let X2 = Math.min(Graphic.BufferW, X + W) | 0;
    let Y2 = Math.min(Graphic.BufferH, Y + H) | 0;

    if(X1 >= X2 || Y1 >= Y2){ return; }

    const IsU8 = Graphic.IsByteData(Data);
    const HBuf = Graphic.HeightBuffer;
    const SW = Graphic.BufferW;

    for(let PY = Y1; PY < Y2; PY++){
        const ScreenRow = PY * SW;
        const SpriteRow = (PY - Y) * W;

        for(let PX = X1; PX < X2; PX++){
            const SIndex = SpriteRow + ((PX - X) | 0);
            const A = Graphic.DataAlphaGet(Data, SIndex, IsU8);
            if(A < Threshold){ continue; }

            const BufIndex = ScreenRow + PX;
            if(Height > HBuf[BufIndex]){ HBuf[BufIndex] = Height; }
        }
    }
}

// ----------------------------------------------------------------------

Graphic.GenerateShadows = function(
    Buffer, BufferW, BufferH,
    HeightBuffer,
    ShadowBuffer,
    SunAngle = 45,
    SunHeight = 45,
    Strength = 140,
    Softness = 1,
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

    for(let Y = 0; Y < H; Y++){
        const Row = Y * W;
        for(let X = 0; X < W; X++){
            const HVal = HBuf[Row + X];
            if(HVal <= 0){ continue; }

            const ShadowLength = ((HVal / 16) * LengthScale) | 0;
            if(ShadowLength <= 0){ continue; }

            for(let S = 1; S <= ShadowLength; S++){
                const SX = X + Math.round(ShadowDX * S);
                const SY = Y + Math.round(ShadowDY * S);

                if(SX < 0 || SY < 0 || SX >= W || SY >= H){ break; }

                const SIndex = SY * W + SX;
                const TargetH = HBuf[SIndex];

                const ShadowHeight = HVal * (1 - S / ShadowLength);
                if(ShadowHeight <= TargetH){ continue; }

                const Coverage = TargetH === 0
                    ? 1
                    : Math.max(0, (ShadowHeight - TargetH) / ShadowHeight);

                const T = (S - 1) / ShadowLength;
                let Falloff;
                if(Softness <= 0){
                    Falloff = 1;
                }else{
                    Falloff = 1 - T * Softness;
                    if(Falloff < 0){ Falloff = 0; }
                }

                let Amount = (Strength * Falloff * Coverage) | 0;
                if(Amount > 255){ Amount = 255; }
                if(Amount < 0){ Amount = 0; }

                if(Amount > SBuf[SIndex]){ SBuf[SIndex] = Amount; }
            }
        }
    }

    for(let I = 0; I < W * H; I++){
        const Amount = SBuf[I];
        if(Amount <= 0){ continue; }

        const Color = Buf[I];
        const DR =  Color        & 0xFF;
        const DG = (Color >> 8 ) & 0xFF;
        const DB = (Color >> 16) & 0xFF;
        const DA = (Color >> 24) & 0xFF;

        const IA = 255 - Amount;
        const R = ((ShadowR * Amount) + (DR * IA)) / 255 | 0;
        const G = ((ShadowG * Amount) + (DG * IA)) / 255 | 0;
        const B = ((ShadowB * Amount) + (DB * IA)) / 255 | 0;

        Buf[I] = (DA << 24) | (B << 16) | (G << 8) | R;
    }
}