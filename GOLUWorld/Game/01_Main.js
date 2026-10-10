const GString = {}

GString.ToMessage = function(...Args){
    return Args.map(Arg => {
        if(Arg === null){ return "null"; }
        if(Arg === undefined){ return "undefined"; }
        
        return typeof Arg === "object" ? JSON.stringify(Arg) : String(Arg);
    }).join(' ');
}

// ----------------------------------------------------------------------

const Log = {}

Log.Info  = function(...Args){ Bridge.LogInfo (GString.ToMessage(...Args)); }
Log.Warn  = function(...Args){ Bridge.LogWarn (GString.ToMessage(...Args)); }
Log.Error = function(...Args){ Bridge.LogError(GString.ToMessage(...Args)); }

// ----------------------------------------------------------------------

const GMath = {}

GMath.__LUT_Size = 2048;
GMath.__LUT_Sin = new Float32Array(GMath.__LUT_Size);
GMath.__LUT_Cos = new Float32Array(GMath.__LUT_Size);
for(let i = 0; i < GMath.__LUT_Size; i++){
    let Rad = (i / GMath.__LUT_Size) * Math.PI * 2;
    GMath.__LUT_Sin[i] = Math.sin(Rad);
    GMath.__LUT_Cos[i] = Math.cos(Rad);
}

let __LUTSizeDivMathPIMul2 = (GMath.__LUT_Size / (Math.PI * 2));
GMath.SinFast = function(Rad){
    let i = ((Rad * __LUTSizeDivMathPIMul2) | 0) % GMath.__LUT_Size;
    if(i < 0){ i += GMath.__LUT_Size; }
    return GMath.__LUT_Sin[i];
}
GMath.CosFast = function(Rad){
    let i = ((Rad * __LUTSizeDivMathPIMul2) | 0) % GMath.__LUT_Size;
    if(i < 0){ i += GMath.__LUT_Size; }
    return GMath.__LUT_Cos[i];
}

GMath.Random = {};

GMath.Random.__Seed = 152637079899;

GMath.Random.SetSeed = function(Seed){
    GMath.Random.__Seed = (Seed || 152637079899) >>> 0;
}

GMath.Random.Raw = function(){
    GMath.Random.__Seed ^= GMath.Random.__Seed << 13;
    GMath.Random.__Seed ^= GMath.Random.__Seed >> 17;
    GMath.Random.__Seed ^= GMath.Random.__Seed << 5;
    return GMath.Random.__Seed >>> 0;
}

GMath.Random.Float = function(){
    return GMath.Random.Raw() / 4294967296;
}

GMath.Random.Int = function(Min, Max){
    if(Max === undefined){ Max = Min; Min = 0; }
    return (Min + (GMath.Random.Raw() % (Max - Min + 1))) | 0;
}

// ----------------------------------------------------------------------

const Input = {}

Input.Keys = {}

Input.KeyIsPressed = function(Key){
    return Input.Keys[Key] === true;
}

Input.Mouse = {}

Input.Mouse.Buttons = {}

Input.MouseIsPressed = function(Button){
    return Input.Mouse.Buttons[Button] === true;
}

Input.Mouse.Position = [0, 0];