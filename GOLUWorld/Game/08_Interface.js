const Interface = {}

Interface.RenderCursor = function(X, Y){
    Graphic.Effect(GRAPHIC_EFFECT_INVERT, () => {
        Graphic.DrawSprite(X, Y, Sprite_CursorBG);
    });
    Graphic.DrawSprite(X, Y, Sprite_Cursor);
}