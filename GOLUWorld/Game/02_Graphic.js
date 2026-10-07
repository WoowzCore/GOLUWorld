const GRAPHIC_EFFECT_NORMAL = 0;
const GRAPHIC_EFFECT_ADD = 1;
const GRAPHIC_EFFECT_SUB = 2;
const GRAPHIC_EFFECT_MUL = 3;
const GRAPHIC_EFFECT_XOR = 4;
const GRAPHIC_EFFECT_INVERT = 5;

const Graphic = {}

Graphic.__Effect = GRAPHIC_EFFECT_NORMAL;

/** @type Uint8Array */
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
    let Buf = Graphic.Buffer;
    for(let i = 0; i < Buf.length; i += 3){
        Buf[i    ] = R;
        Buf[i + 1] = G;
        Buf[i + 2] = B;
    }
}

Graphic.PixelOut = function(X, Y, W, H){
    return X < 0 || X >= W || Y < 0 || Y >= H;
}

Graphic.PixelIndex = function(X, Y, W){
    return (Y * W + X) * 3;
}

Graphic.GetPixel = function(X, Y){
    let SW = Graphic.ScreenSizeW;
    let SH = Graphic.ScreenSizeH;
    if(Graphic.PixelOut(X, Y, SW, SH)){ return [0, 0, 0]; }
    
    let Index = Graphic.PixelIndex(X, Y, SW);
    let Buf = Graphic.Buffer;
    return [Buf[Index], Buf[Index + 1], Buf[Index + 2]];
}

Graphic.SetPixel = function(X, Y, R, G, B, A = 255){
    let SW = Graphic.ScreenSizeW;
    let SH = Graphic.ScreenSizeH;
    if(A === 0 || Graphic.PixelOut(X, Y, SW, SH)){ return [0, 0, 0]; }
    
    let Buf = Graphic.Buffer;
    let Index = Graphic.PixelIndex(X, Y, SW);

    let DR = Buf[Index    ];
    let DG = Buf[Index + 1];
    let DB = Buf[Index + 2];
    
    let RR = R;
    let RG = G;
    let RB = B;
    
    switch(Graphic.__Effect){
        case GRAPHIC_EFFECT_NORMAL:
            break;
        case GRAPHIC_EFFECT_ADD:
            RR = Math.min(255, DR + R);
            RG = Math.min(255, DG + G);
            RB = Math.min(255, DB + B);
            break;
        case GRAPHIC_EFFECT_SUB:
            RR = Math.max(0, DR - R);
            RG = Math.max(0, DG - G);
            RB = Math.max(0, DB - B);
            break;
        case GRAPHIC_EFFECT_MUL:
            RR = (DR * R) * Graphic.Div255;
            RG = (DG * G) * Graphic.Div255;
            RB = (DB * B) * Graphic.Div255;
            break;
        case GRAPHIC_EFFECT_XOR:
            RR = DR ^ R;
            RG = DG ^ G;
            RB = DB ^ B;
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
    
    if(A < 255){
        let Alpha = A;
        let IAlpha = 255 - Alpha;
        Buf[Index    ] = ((RR * Alpha) + (DR * IAlpha)) >> 8;
        Buf[Index + 1] = ((RG * Alpha) + (DG * IAlpha)) >> 8;
        Buf[Index + 2] = ((RB * Alpha) + (DB * IAlpha)) >> 8;
    }else{
        Buf[Index    ] = RR;
        Buf[Index + 1] = RG;
        Buf[Index + 2] = RB;
    }
}

Graphic.DrawRect = function(X, Y, W, H, R, G, B, A = 255){
    if(A === 0){ return; }

    let X1 = Math.max(0, X);
    let Y1 = Math.max(0, Y);
    let X2 = Math.min(Graphic.ScreenSizeW, X + W);
    let Y2 = Math.min(Graphic.ScreenSizeH, Y + H);
    
    if(X1 >= X2 || Y1 >= Y2){ return; }
    
    if(A === 255 && Graphic.__Effect === GRAPHIC_EFFECT_NORMAL){
        let Buf = Graphic.Buffer;
        for(let PY = Y1; PY < Y2; PY++){
            let Index = Graphic.PixelIndex(X1, PY, Graphic.ScreenSizeW);
            for(let PX = X1; PX < X2; PX++){
                Buf[Index    ] = R;
                Buf[Index + 1] = G;
                Buf[Index + 2] = B;
                Index += 3;
            }   
        }
    }else{
        for(let PY = Y1; PY < Y2; PY++){
            for(let PX = X1; PX < X2; PX++){
                Graphic.SetPixel(PX, PY, R, G, B, A);
            }
        }   
    }
}