const Bridge = {}
    
/** @type function(any):void */
Bridge.LogInfo  = __Core.LogInfo;
/** @type function(any):void */
Bridge.LogWarn  = __Core.LogWarn;
/** @type function(any):void */
Bridge.LogError = __Core.LogError;

/** @type function(Uint8Array):void */
Bridge.Render = __Core.Render;

// ----------------------------------------------------------------------

Bridge.Value = {}

Bridge.Value.ThatEXE = false;
Bridge.Value.ScreenSize = [0, 0];
/** @type Uint8Array */
Bridge.Value.FrameBuffer = null;

// ----------------------------------------------------------------------

Bridge.Hook = {}

Bridge.Hook.Start = function(ThatEXE, ScreenSizeW, ScreenSizeH, FrameBuffer){
    Bridge.Value.ThatEXE = ThatEXE;
    Bridge.Value.ScreenSize = [ScreenSizeW, ScreenSizeH];
    Bridge.Value.FrameBuffer = FrameBuffer;
    
    Log.Info(`HI AND WELCOME TO ${(ThatEXE ? "EXE" : "WEB SITE")}`)
}

Bridge.Hook.Cycle = function(DT){
    TEST(DT);
}