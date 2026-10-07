const GRAPHIC_EFFECT_NORMAL = 0;
const GRAPHIC_EFFECT_ADD = 1;
const GRAPHIC_EFFECT_SUB = 2;
const GRAPHIC_EFFECT_MUL = 3;
const GRAPHIC_EFFECT_XOR = 4;
const GRAPHIC_EFFECT_INVERT = 5;

const Graphic = {}

Graphic.__Effect = GRAPHIC_EFFECT_NORMAL;

/** @type Uint32Array */
Graphic.Buffer = null;
Graphic.ScreenSize = [0, 0];
Graphic.ScreenSizeW = 0;
Graphic.ScreenSizeH = 0;
Graphic.Div255 = 1 / 255;

Graphic.Start = function(){
    Graphic.Buffer      = Bridge.Value.FrameBuffer;
    Graphic.ScreenSize  = Bridge.Value.ScreenSize;
    Graphic.ScreenSizeW = Graphic.ScreenSize[0];
    Graphic.ScreenSizeH = Graphic.ScreenSize[1];
}

Graphic.Effect = function(Effect, Function){
    let PushEffect = Graphic.__Effect;
    Graphic.__Effect = Effect;
    Function();
    Graphic.__Effect = PushEffect;
}

Graphic.Clear = function(R, G, B){
    Graphic.Buffer.fill((255 << 24) | (B << 16) | (G << 8) | R);
}

Graphic.PixelOut = function(X, Y, W, H){
    return X < 0 || X >= W || Y < 0 || Y >= H;
}

Graphic.GetPixel = function(X, Y){
    if(Graphic.PixelOut(X, Y, Graphic.ScreenSizeW, Graphic.ScreenSizeH)){ return [0, 0, 0, 0]; }
    const Color = Graphic.Buffer[(Y | 0) * Graphic.ScreenSizeW + (X | 0)];
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
    if(A === 0 || Graphic.PixelOut(X, Y, Graphic.ScreenSizeW, Graphic.ScreenSizeH)){ return; }
    
    const Index = (Y | 0) * Graphic.ScreenSizeW + (X | 0);
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

Graphic.DrawRect = function(X, Y, W, H, R, G, B, A = 255){
    if(A === 0){ return; }

    const SW = Graphic.ScreenSizeW;
    const SH = Graphic.ScreenSizeH;
    const Buf = Graphic.Buffer;
    
    let X1 = Math.max(0, X) | 0;
    let Y1 = Math.max(0, Y) | 0;
    let X2 = Math.min(SW, X + W) | 0;
    let Y2 = Math.min(SH, Y + H) | 0;
    
    if(X1 >= X2 || Y1 >= Y2){ return; }
    
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