const Interface = {}

Interface.RenderCursor = function(X, Y){
    Graphic.Effect(GRAPHIC_EFFECT_INVERT, () => {
        Graphic.DrawSprite(X, Y, Sprite_CursorBG);
    });
    Graphic.DrawSprite(X, Y, Sprite_Cursor);
}

Interface.RenderPlayerInterface = function(ID){
    switch(ID){
        case INTERFACE_PANEL_CREATIVE: {
            Interface.RenderCreative();
            break
        }
    }
    
    Interface.__DarkBackgroundRendered = false;
}

Interface.__DarkBackgroundRendered = false;
Interface.RenderDarkBackground = function(){
    if(Interface.__DarkBackgroundRendered){ return; } Interface.__DarkBackgroundRendered = true;
    
    Graphic.DrawRect(0, 0, Graphic.BufferW, Graphic.BufferH, 0, 0, 0, 128);
}

Interface.RenderCreative = function(){
    Interface.RenderDarkBackground();
    
    const X = 30;
    const Y = 8;
    
    Interface.Render.Rect(X, Y, Graphic.BufferW - X, Graphic.BufferH - Y);
}

// ----------------------------------------------------------------------

const INTERFACE_COLOR_BACKGROUND = { R: 0, G: 0, B: 0 }
const INTERFACE_COLOR_OUTLINE = { R: 255, G: 0, B: 0 }
const INTERFACE_COLOR_OUTLINE_DARK = { R: 128, G: 0, B: 0 }

Interface.Render = {}

Interface.Render.Rect = function(X1, Y1, X2, Y2){
    Graphic.DrawRect(X1 + 2, Y1 + 2, X2 - 2, Y2 - 2, INTERFACE_COLOR_BACKGROUND.R, INTERFACE_COLOR_BACKGROUND.G, INTERFACE_COLOR_BACKGROUND.B);
    
    Graphic.DrawRectOutline(X1 + 1, Y1 + 1, X2 - 1, Y2 - 1, 1, INTERFACE_COLOR_OUTLINE_DARK.R, INTERFACE_COLOR_OUTLINE_DARK.G, INTERFACE_COLOR_OUTLINE_DARK.B);
    Graphic.DrawRectOutline(X1, Y1, X2, Y2, 1, INTERFACE_COLOR_OUTLINE.R, INTERFACE_COLOR_OUTLINE.G, INTERFACE_COLOR_OUTLINE.B);
}