var Tick = 0;
var posX = 0;

const TEST = function(DT){
    Tick += DT;
    
    let ScreenBuffer = Bridge.Value.FrameBuffer;
    let ScreenW = Bridge.Value.ScreenSize[0];
    let ScreenH = Bridge.Value.ScreenSize[1];
    
    let r = Math.sin(Tick) * 50 + 50;
    
    for(let i = 0; i < ScreenBuffer.length; i += 3){
        ScreenBuffer[i] = r;
        ScreenBuffer[i + 1] = 20;
        ScreenBuffer[i + 2] = 40;
    }

    for (let i = 0; i < 200; i++) {
        let rx = Math.floor(Math.random() * ScreenW);
        let ry = Math.floor(Math.random() * ScreenH);
        let index = (ry * ScreenW + rx) * 3;

        ScreenBuffer[index]     = 255;
        ScreenBuffer[index + 1] = 255;
        ScreenBuffer[index + 2] = 255;
    }

    posX = (posX + DT * 100) % ScreenW;
    let intPosX = Math.floor(posX);

    for (let y = 80; y < 120; y++) {
        for (let x = intPosX; x < intPosX + 40; x++) {
            if (x >= ScreenW) continue;

            let index = (y * ScreenW + x) * 3;
            ScreenBuffer[index]     = 255;
            ScreenBuffer[index + 1] = 255;
            ScreenBuffer[index + 2] = 0;
        }
    }
    
    Bridge.Render();
}