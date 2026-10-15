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

// ----------------------------------------------------------------------

Game.GlobalUpdate = function(DT){
    World.Update(DT);
    
    Game.GlobalRender(DT);
}

Game.GlobalRender = function(DT){
    Graphic.Clear(160, 160, 160);
    Graphic.ClearHeight(0);

    Player.Camera.Update(DT);

    World.Render(Player.Camera.X, Player.Camera.Y);
    
    TEST_CYCLE(DT);

    Graphic.DrawText(6, 6, "Hi, welcome here! " + Input.Mouse.Position[0] + " : " + Input.Mouse.Position[1] + "\nВы поверили?", 64, 64, 64, 255);
    Graphic.DrawText(5, 5, "Hi, welcome here! " + Input.Mouse.Position[0] + " : " + Input.Mouse.Position[1] + "\nВы поверили?", 255, 255, 255, 255);
    
    Interface.RenderCursor(Input.Mouse.Position[0], Input.Mouse.Position[1]);
}