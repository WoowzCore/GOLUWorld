class Sprite{
    constructor(Name, ID, Width, Height, HasAlpha, IsGray, Data){
        this.Name = Name;
        this.ID = ID;
        
        this.Width = this.W = Width;
        this.Height = this.H = Height;
        
        this.HasAlpha = HasAlpha;
        this.IsGray = IsGray;
        this.Data = Data;
    }
    
    Name = "";
    ID = -1;
    
    Width = -1;
    Height = -1;
    W = -1;
    H = -1;
    
    HasAlpha = false;
    IsGray = false;
    /** @type Uint32Array */
    Data = null;
}

// ----------------------------------------------------------------------

const Resource = {}

Resource.Sprites = {}

// ----------------------------------------------------------------------

Resource.Register = {}

Resource.Register.Sprite = function(Name, DataString){
    let ID = Object.keys(Resource.Sprites).length + 1;
    
    const Parts = DataString.split('|');
    const Width = parseInt(Parts[0]);
    const Flags  = parseInt(Parts[1]);

    const RawData = Bridge.Atob(Parts[2]);
    /** @type Uint8Array */
    let Buffer;
    
    if(typeof RawData === "string"){
        Buffer = new Uint8Array(RawData.length);
        for(let i = 0; i < RawData.length; i++){
            Buffer[i] = RawData.charCodeAt(i);
        }   
    }else{
        Buffer = new Uint8Array(RawData);
    }
    
    const HasAlpha = (Flags & 1) !== 0;
    const IsGray   = (Flags & 2) !== 0;
    
    let BPP = 3;
    if(Flags === 1){ BPP = 4; }else if(Flags === 2){ BPP = 1; }else if(Flags === 3){ BPP = 2; }
    
    const PixelCount = Buffer.length / BPP;
    const Height = PixelCount / Width;
    
    const PixelData = new Uint32Array(PixelCount);
    let Ptr = 0;
    
    for(let i = 0; i < PixelCount; i++){
        let R, G, B, A;
        
        if(Flags === 0){
            R = Buffer[Ptr++]; G = Buffer[Ptr++]; B = Buffer[Ptr++]; A = 255;
        }else if(Flags === 1){
            R = Buffer[Ptr++]; G = Buffer[Ptr++]; B = Buffer[Ptr++]; A = Buffer[Ptr++];
        }else if(Flags === 2){
            R = G = B = Buffer[Ptr++]; A = 255;
        }else if(Flags === 3){
            R = G = B = Buffer[Ptr++]; A = Buffer[Ptr++];
        }
        
        PixelData[i] = ((A << 24) | (B << 16) + (G << 8) | R) >>> 0;
    }
    
    const NewSprite = new Sprite(Name, ID, Width, Height, HasAlpha, IsGray, PixelData);
    
    Resource.Sprites[ID] = NewSprite;
    
    return NewSprite;
}