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

class Glyph{
    constructor(Sprite, Width, Height = undefined){
        Sprite = Sprite ? Sprite : Sprite_Error;
        this.Sprite = Sprite;
        this.Width  = this.W = Width  !== undefined ? Width  : Sprite.Width;
        this.Height = this.H = Height !== undefined ? Height : Sprite.Height;
    }
    
    static CreateSpace(Width = 8){
        let Space = new Glyph(undefined, Width, 1);
        Space.Sprite = null;
        Space.SpecialAction = function(CX, CY, Font, SX, SY, OnlyCalculate){
            return [CX + Space.W + Font.Spacing, CY];
        };
        return Space;
    }
    
    static CreateNewLine(){
        let NewLine = new Glyph(undefined, 0, 0);
        NewLine.Sprite = null;
        NewLine.SpecialAction = function(CX, CY, Font, SX, SY, OnlyCalculate){
            return [SX, CY + Font.LineHeight];
        };
        return NewLine;
    }
    
    /** @type Sprite */
    Sprite = null;
    
    Width = -1;
    Height = -1;
    W = -1;
    H = -1;
    
    Render(X, Y, OnlyCalculate = false){
        if(this.Sprite !== null && !OnlyCalculate){
            Graphic.DrawSprite(X, Y, this.Sprite);
        }
        
        return this.Width;
    }
    
    /** @type {(function(number,number,Font,number,number,boolean): [number,number])|null} */
    SpecialAction = null;
}

class Font{
    constructor(Name, LineHeight = 8, Spacing = 1){
        this.Name = Name;
        this.LineHeight = LineHeight;
        this.Spacing = Spacing;
    }
    
    RegisterDefaultsGlyphs(Width = 8){
        this.RegisterGlyph('\r', null);
        this.RegisterGlyph(' ', Glyph.CreateSpace(Width));
        this.RegisterGlyph('\n', Glyph.CreateNewLine());
        this.RegisterGlyph('\t', Glyph.CreateSpace(Width * 4));
    }
    
    Name = "";
    LineHeight = 8;
    Spacing = 1;
    
    /** @type {Map<number, Glyph>} */
    Glyphs = new Map();
    
    /** @type {Glyph|null} */
    FallbackGlyph = null;
    
    RegisterGlyph(CharOrCode, Glyph){
        if(Array.isArray(CharOrCode)){
            for(const Item of CharOrCode){
                this.RegisterGlyph(Item, Glyph);
            }
            return Glyph;
        }
        
        if(typeof CharOrCode === "string"){
            for(const Char of CharOrCode){
                this.Glyphs.set(Char.codePointAt(0), Glyph);
            }
            return Glyph;
        }
        
        this.Glyphs.set(CharOrCode, Glyph);
        return Glyph;
    }
    
    HasGlyph(CharOrCode){
        let Glyph = this.GetGlyph(CharOrCode);
        return !(!Glyph || Glyph === this.FallbackGlyph);
    }
    
    GetGlyph(CharOrCode){
        if(typeof CharOrCode === "string"){
            CharOrCode = CharOrCode.codePointAt(0);
        }
        
        if(this.Glyphs.has(CharOrCode)){
            return this.Glyphs.get(CharOrCode);
        }
        
        return this.FallbackGlyph;
    }
    
    RenderText(X, Y, Text, OnlyCalculate = false){
        if(!Text){ return [0, 0]; }
        
        const StartX = X;
        const StartY = Y;
        
        let MaxX = X;
        let MaxY = Y;
        
        let CX = X;
        let CY = Y;
        
        for(const Char of Text){
            const Glyph = this.GetGlyph(Char);
            
            if(Glyph){
                if(Glyph.SpecialAction){
                    let Result = Glyph.SpecialAction(CX, CY, this, StartX, StartY, OnlyCalculate);
                    CX = Result[0];
                    CY = Result[1];
                }else{
                    CX += Glyph.Render(CX, CY, OnlyCalculate) + this.Spacing;
                }

                if(CX > MaxX){ MaxX = CX; }
                if(CY > MaxY){ MaxY = CY; }
            }
        }
        
        return [MaxX - StartX, (MaxY - StartY) + this.LineHeight];
    }
}

// ----------------------------------------------------------------------

const Resource = {}

Resource.Sprites = {}

Resource.Fonts = {};

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

Resource.Register.SpriteFromSprite = function(Name, Source, X, Y, W, H) {
    if(!Source){
        return null;
    }
    if(Source.Data === null){
        return null;
    }
    
    X = X | 0;
    Y = Y | 0;
    W = W | 0;
    H = H | 0;
    
    if(X < 0){ X = 0; }
    if(Y < 0){ Y = 0; }
    if(X + W > Source.Width){ W = Source.Width - X; }
    if(Y + H > Source.Height){ H = Source.Height - Y; }
    
    if(W <= 0 || H <= 0){ return null; }
    
    const SourceData = Source.Data;
    const SourceW = Source.Width;
    const NewData = new Uint32Array(W * H);
    
    for(let Row = 0; Row < H; Row++){
        const SrcRow = (Y + Row) * SourceW + X;
        const DstRow = Row * W;
    
        for(let Col = 0; Col < W; Col++){
            NewData[DstRow + Col] = SourceData[SrcRow + Col];
        }
    }
    
    let ID = Object.keys(Resource.Sprites).length + 1;
    const NewSprite = new Sprite(Name, ID, W, H, Source.HasR, Source.HasG, Source.HasB, Source.HasA, Source.IsGray, NewData);
    
    Resource.Sprites[ID] = NewSprite;
    
    return NewSprite;
}

Resource.Register.Font = function(Name, Atlas, CharSequence, FallbackChar = '', CharW = 8, CharH = 8, MonoSpaced = false){
    const Spacing = 1;
    const LineHeight = CharH + Spacing;
    
    const Font__ = new Font(Name, LineHeight, Spacing);
    Font__.RegisterDefaultsGlyphs(CharW);
    
    const Cols = Math.floor(Atlas.Width / CharW);
    let Index = 0;
    
    const CharGroups = Array.isArray(CharSequence) ? CharSequence : Array.from(CharSequence);
    
    for(const Group of CharGroups){
        const FirstChar = typeof Group === "string" ? Group[0] : Group;
        
        if(Font__.HasGlyph(FirstChar)){ Index++; continue; }
        
        const Col = Index % Cols;
        const Row = Math.floor(Index / Cols);
        
        const X = Col * CharW;
        const Y = Row * CharH;
        
        const SpriteName = `Font_${Name}_${Group}`;
        let CharSprite = null;
        
        let FinalWidth = null;
        
        if(MonoSpaced){
            CharSprite = Resource.Register.SpriteFromSprite(SpriteName, Atlas, X, Y, CharW, CharH);
            FinalWidth = CharW;
        }else{
            let MaxX = -1;
            
            const AtlasData = Atlas.Data;
            const AtlasW = Atlas.W;
            
            for(let R = 0; R < CharH; R++){
                const RowOffset = (Y + R) * AtlasW + X;
                for(let C = 0; C < CharW; C++){
                    const Color = AtlasData[RowOffset + C];
                    const Alpha = (Color >>> 24) & 0xFF;
                    
                    if(Alpha > 63){
                        if(C > MaxX){ MaxX = C; }
                    }
                }
            }
            
            if(MaxX === -1){
                MaxX = Math.floor(CharW / 2) - 1;
                if(MaxX < 0){ MaxX = 0; }
            }
            
            const TrimmedW = MaxX + 1;
            
            CharSprite = Resource.Register.SpriteFromSprite(SpriteName, Atlas, X, Y, TrimmedW, CharH);
            FinalWidth = TrimmedW;
        }
        
        const Glyph__ = new Glyph(CharSprite, FinalWidth, CharH);

        Font__.RegisterGlyph(Group, Glyph__);
        
        if(FallbackChar !== '' && (Group === FallbackChar || (typeof Group === 'string' && Group.includes(FallbackChar)))){
            Font__.FallbackGlyph = Glyph__;
        }
        
        Index++;
    }
    
    Resource.Fonts[Name] = Font__;
    return Font__;
}