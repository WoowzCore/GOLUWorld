const Bridge = {}
    
/** @type function(any):void */
Bridge.LogInfo  = __Core.LogInfo;
/** @type function(any):void */
Bridge.LogWarn  = __Core.LogWarn;
/** @type function(any):void */
Bridge.LogError = __Core.LogError;

/** @type function():void */
Bridge.PersistentRender = __Core.PersistentRender;

/** @type {function(string):(string|number[])} */
Bridge.Atob = __Core.Base64ToBytes;

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
    
    TEST_START();
}

Bridge.Hook.Cycle = function(DT, FPS, MouseX, MouseY){
    Game.DT = DT;
    Game.FPS = FPS;

    Input.Mouse.Position[0] = MouseX;
    Input.Mouse.Position[1] = MouseY;
    
    Game.GlobalUpdate(DT);
}

Bridge.Hook.WindowTitle = function(){
    return Game.GenerateWindowTitle();
}

const __ConvertKeys = {
    ["arrowright"]: "right",
    ["arrowleft" ]: "left",
    ["arrowup"   ]: "up",
    ["arrowdown" ]: "down",
    ["shiftleft" ]: "shiftl",
}
Bridge.Hook.KeyDown = function(Key){
    Key = Key.toLowerCase();
    
    Key = __ConvertKeys[Key] || Key;
    
    if(Input.Keys[Key] !== true){
        Log.Info(Key);
        
        Player.KeyPress(Key, true);
    }
    
    Input.Keys[Key] = true;
}

Bridge.Hook.KeyUp = function(Key){
    Key = Key.toLowerCase();

    Key = __ConvertKeys[Key] || Key;

    if(Input.Keys[Key] !== false){
        Player.KeyPress(Key, false);
    }
    
    Input.Keys[Key] = false;
}

Bridge.Hook.MouseButtonDown = function(Button){
    if(Input.Mouse.Buttons[Button] !== true){
        Log.Info(Button);
        
    }
    
    Input.Mouse.Buttons[Button] = true;
}

Bridge.Hook.MouseButtonUp = function(Button){
    if(Input.Mouse.Buttons[Button] !== false){
        
    }
    
    Input.Mouse.Buttons[Button] = false;
}