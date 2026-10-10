class Sprite{
    constructor(Name, ID, Width, Height, HasR, HasG, HasB, HasA, IsGray, Data){
        this.Name = Name;
        this.ID = ID;
        
        this.Width  = this.W = Width;
        this.Height = this.H = Height;

        this.HasR = HasR;
        this.HasG = HasG;
        this.HasB = HasB;
        this.HasA = HasA;
        this.IsGray = IsGray;
        this.Data = Data;
    }
    
    Name = "";
    ID = -1;
    
    Width = -1;
    Height = -1;
    W = -1;
    H = -1;

    HasR = false;
    HasG = false;
    HasB = false;
    HasA = false;
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
    const OFFSET = 0x4E00
    
    const Parts = DataString.split('|');
    const Width = parseInt(Parts[0]);
    const Flags  = parseInt(Parts[1]);
    const EncodedData = Parts[2];

    let BufferBytes = [];
    let BitBuffer = 0;
    let Bits = 0;
    for(let i = 0; i < EncodedData.length; i++){
        BitBuffer = (BitBuffer << 12) | (EncodedData.charCodeAt(i) - OFFSET);
        Bits += 12;
        while(Bits >= 8){
            Bits -= 8;
            BufferBytes.push((BitBuffer >> Bits) & 0xFF);
        }
    }
    const Buffer = new Uint8Array(BufferBytes);

    let Ptr = 0;
    const ColorCount = Buffer[Ptr++];
    const Palette = new Uint32Array(ColorCount);

    const IsGray = (Flags & 16) !== 0;
    const HasR = (Flags & 1) !== 0;
    const HasG = (Flags & 2) !== 0;
    const HasB = (Flags & 4) !== 0;
    const HasA = (Flags & 8) !== 0;
    
    for(let i = 0; i < ColorCount; i++){
        let R = 0, G = 0, B = 0, A = 255;
        
        if(IsGray){
            R = G = B = Buffer[Ptr++];
            if(HasA){ A = Buffer[Ptr++]; }
        }else{
            if(HasR){ R = Buffer[Ptr++]; }
            if(HasG){ G = Buffer[Ptr++]; }
            if(HasB){ B = Buffer[Ptr++]; }
            if(HasA){ A = Buffer[Ptr++]; }
        }
        
        Palette[i] = ((A << 24) | (B << 16) | (G << 8) | R) >>> 0;
    }
    
    const BPP = Buffer[Ptr++];
    
    const TotalPixels = Math.floor(((Buffer.length - Ptr) * 8) / BPP);
    const Height = Math.floor(TotalPixels / Width);
    const PixelData = new Uint32Array(Width * Height);
    
    let PixelIndex = 0;
    let CurrentByte = 0;
    let BitCount = 0;
    
    while(PixelIndex < PixelData.length){
        if(BitCount < BPP){
            if(Ptr >= Buffer.length){ break; }
            CurrentByte = Buffer[Ptr++];
            BitCount = 8;
        }
        
        let Index = (CurrentByte >> (BitCount - BPP)) & ((1 << BPP) - 1);
        PixelData[PixelIndex++] = Palette[Index];
        BitCount -= BPP;
    }

    let ID = Object.keys(Resource.Sprites).length + 1;
    const NewSprite = new Sprite(Name, ID, Width, Height, HasR, HasG, HasB, HasA, IsGray, PixelData);
    
    Resource.Sprites[ID] = NewSprite;
    
    return NewSprite;
}