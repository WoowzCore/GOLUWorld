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