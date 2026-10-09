var Tick = 0;
var posX = 0;

const TEST = function(DT) {
    Tick += DT;

    Graphic.Clear(10, 10, 10);

    for(let i = 0; i < 2000; i++){
        Graphic.SetPixel(Math.floor(Math.random() * 128), Math.floor(Math.random() * 128), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255));
    }
    
    let pulse2 = Math.abs(GMath.SinFast(Tick * 0.5)) * 200;
    Graphic.Effect(GRAPHIC_EFFECT_XOR, () => {
        Graphic.DrawSprite(pulse2, pulse2, Sprite_Test)
    });

    Graphic.DrawRect(Graphic.BufferW - Sprite_Test.Width, 0, Graphic.BufferW, Sprite_Test.Height, 0, 0, 255)
    Graphic.Clip(Graphic.BufferW - Sprite_Test.Width, 0, Graphic.BufferW, Sprite_Test.Height, () => {
        Graphic.DrawSprite(Graphic.BufferW - (GMath.CosFast(Tick * 2) * Sprite_Test.Width * 0.5) - Sprite_Test.Width, GMath.SinFast(Tick * 2) * Sprite_Test.Height  * 0.5, Sprite_Test)
    })

    let targetX = Graphic.BufferW - 64;
    let targetY = Graphic.BufferH - 64;

    Graphic.DrawSprite(targetX, targetY, Sprite_Test);

    let centerX = targetX + Sprite_Test.Width * 0.5;
    let centerY = targetY + Sprite_Test.Height * 0.5;

    Graphic.Canvas(64, 64, centerX, centerY, 1, 1, 0, 0, Tick, (W, H) => {

        let drawX = W * 0.5 - Sprite_Test.Width * 0.5;
        let drawY = H * 0.5 - Sprite_Test.Height * 0.5;

        Graphic.DrawSprite(drawX, drawY, Sprite_Test);
    });

    Graphic.Canvas(64, 64, centerX - 64, centerY, (0.5 + GMath.SinFast(Tick) * 0.5) * 2, (0.5 + GMath.CosFast(Tick * 2) * 0.5) * 2, 0, 0, 0, (W, H) => {

        let drawX = W * 0.5 - Sprite_Test.Width * 0.5;
        let drawY = H * 0.5 - Sprite_Test.Height * 0.5;

        Graphic.DrawSprite(drawX, drawY, Sprite_Test);
    });
    
    Graphic.DrawRect(0, 150, 0 + Graphic.BufferW, 150 + 20, 0, 100, 255, 128);

    Graphic.DrawRect(150, 50, 150 + 80, 50 + 80, 255, 0, 0);
    
    Graphic.Effect(GRAPHIC_EFFECT_ADD, () => {
        let pulse = Math.abs(GMath.SinFast(Tick * 2)) * 100;
        Graphic.DrawRect(200, 100, 200 + 30, 100 + 30, pulse, pulse, pulse);
    });

    posX = (posX + DT * 200)
    if(posX > Graphic.BufferW){ posX = -40; }
    let intPosX = Math.floor(posX);

    Graphic.Effect(GRAPHIC_EFFECT_INVERT, () => {
        Graphic.DrawRect(intPosX, 80, intPosX + 40, 80 + 40, 255, 255, 255);
    });
}