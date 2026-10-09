const Game = {}

Game.IsEXE = false;

Game.DT = 0;
Game.FPS = 0;

Game.Start = function(){
    Game.IsEXE = Bridge.Value.ThatEXE;
}

let __FPSTimer = 1;
let __FPSCache = 0;
Game.GenerateWindowTitle = function(){
    __FPSTimer += Game.DT;
    if(__FPSTimer > 1){ __FPSTimer = 0; __FPSCache = Game.FPS; }
    
    return `GOLUWorld : ${(Game.IsEXE ? "C#" : "WEB")} Instance : ${__FPSCache.toFixed(1)}`;
}