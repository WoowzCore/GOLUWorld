const Bridge = {}
    
/** @type function(any):void */
Bridge.LogInfo  = __Core.LogInfo;
/** @type function(any):void */
Bridge.LogWarn  = __Core.LogWarn;
/** @type function(any):void */
Bridge.LogError = __Core.LogError;

/** @type function():void */
Bridge.PersistentRender = __Core.PersistentRender;

// ----------------------------------------------------------------------

Bridge.Value = {}

Bridge.Value.ThatEXE = false;
Bridge.Value.ScreenSize = [0, 0];
/** @type Uint32Array */
Bridge.Value.FrameBuffer = null;

// ----------------------------------------------------------------------

Bridge.Hook = {}

Bridge.Hook.Start = function(ThatEXE, ScreenSizeW, ScreenSizeH, FrameBuffer){
    Bridge.Value.ThatEXE = ThatEXE;
    Bridge.Value.ScreenSize = [ScreenSizeW, ScreenSizeH];
    Bridge.Value.FrameBuffer = FrameBuffer;
    
    Log.Info(`HI AND WELCOME TO ${(ThatEXE ? "EXE" : "WEB SITE")}`)
    
    Graphic.Start();
    Game.Start();
}

Bridge.Hook.Cycle = function(DT, FPS){
    Game.DT = DT;
    Game.FPS = FPS;
    
    TEST(DT);
}

Bridge.Hook.WindowTitle = function(){
    return Game.GenerateWindowTitle();
}