var Tick = 0;
var posX = 0;

const TEST = function(DT) {
    Tick += DT;

    let r = Math.sin(Tick) * 50 + 50;
    //Graphic.Clear(r, 20, 40);

    for (let i = 0; i < 2000; i++) {
        let rx = Math.floor(Math.random() * Graphic.ScreenSizeW);
        let ry = Math.floor(Math.random() * Graphic.ScreenSizeH);
        Graphic.SetPixel(rx, ry, Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255));
    }

    posX = (posX + DT * 200) % Graphic.ScreenSizeW;
    let intPosX = Math.floor(posX);

    Graphic.DrawRect(intPosX, 80, 40, 40, 255, 255, 0);

    Graphic.DrawRect(0, 150, Graphic.ScreenSizeW, 20, 0, 100, 255, 128);

    Graphic.Effect(GRAPHIC_EFFECT_INVERT, () => {
        Graphic.DrawRect(150, 50, 80, 80, 255, 255, 255);
    });
    
    Graphic.Effect(GRAPHIC_EFFECT_ADD, () => {
        let pulse = Math.abs(Math.sin(Tick * 2)) * 100;
        Graphic.DrawRect(200, 100, 30, 30, pulse, pulse, pulse);
    });

    let pulse2 = Math.abs(Math.sin(Tick)) * 100;
    Graphic.DrawSprite(pulse2, pulse2, Sprite_Test)
}