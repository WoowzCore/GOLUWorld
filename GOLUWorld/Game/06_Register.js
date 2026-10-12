const SIZE_TILE = 16;

const Sprite_AtlasCursor = Resource.Register.Sprite("Atlas_Cursor", "12|24|乀仿一仿巰丿丠单卑佖卑剖坑化塑卆墑分坑凖卐嵕卐");
const Sprite_AtlasTile = Resource.Register.Sprite("Atlas_Tile", "32|7|亾囐墬嚑凨侺傃佣上亠堍埚埕偒匠一丈倮偍屼唃崉乀刀一丑一一伒倢倢倢倢倢伀丁丁一丐串倣倢倢倢倠伀伀丁丁一倲倣倣倢儢倀伐一丁伀丂倲倣倣倢儢一丑一一伐丢倲倣倣倢儠一丁一一丐倢倢倢倣倢儀一丁一一丒倢倢倢倢倢一一丐一一伢倢倢倢倢倠一丁伀一丑倢倢倢倢倢倐一伀伀丁丂倢倢倢倢倢丐丐一伀伀丢儢倢倢倢儠丑一一伐一倢儢儢倲倢儀丁伀一丑七倢儢儢倲倢一一伀一丁丣倢儢儢倲倠一一伀一丁倢倢倢儢倲倀一丁一一丒倢倢倢倢倢剅单剄剅卦喈垙垇嚘嚙噴協剅剅剅卆垈嚈垩嚈嚉塕剄剖協剅剨嚈嚈墈嚈嚊卆剆卥剤剤呺墪墪喪墪墥剄单呄協剆垘喉垙垇嚙坄剅卆剕剄剨嚚垈嚉嚨嚈单協剥協剄咈嚩嚈嚈墈嚅单剕呕剄剆墪塺墪墪喪塕呄呖卆剖剩垙垙喉垙垗協剅剥剅協咘嚈嚚垈嚈嚥剅剄呄剕卆嚈嚈嚨嚈嚈塔協剆剕剄剧墪墪塺墪墪单剄剤剄剄咙坸垙垘喙垕卤剤呄呄呆嚈墘嚈嚊垈噤剄則剄剄剸嚊嚈嚈嚨嚈呦啷啴呧啷喪墧墪墪塺墠");
const Sprite_AtlasPlayer = Resource.Register.Sprite("Atlas_Player", "32|15|习一一乒匥僿堊亠巿巿巿巾巿巿一一巰刀丑伡伒伐七儳儳儳儳儳丁偄刡偂倐丳儳儳儳儳儰休偄剄剄倐儳儳儳儳儳儒偄剄剄刡体儳儳儳儳儳伤剄們伒們匳儳儳儳儳儱剄刡伒剄別儳儳儳儳儳儔們伢剄剄偓儳儳儳儳儳伡値剄剄剄伳儳儳儳儳儱倢剄剄剄倡儳儳儳儳儳儤剄剄刢倡匓儳儳儳儳儳佄剄剂休休匳儳儳儳儳儱偄剂們偄剅儳儳儳儳儳儒値剄剁伢偓儳儳儳儳儳丑伢剄倡伕丳儳儳儳儳儰乒伒倡休匀儳儳儳儳儳儀乕卑伕卐七儳儳儳儳儳一一一一一丳儳儳儳儳儰一一一一一儳儳儳儳儳儀一一一一七儳儳儳儳儳一一一一一丳儳儳儳儳儰一一一一一儳儳儳儳儳儀一一一一七儳儳儳儳儳一一一一一丳儳儳儳儳儰一一一一一儳儳儳儳儳儀一一一一七儳儳儳儳儳丒一一一丕丳儳儳儳儳儰倒倢倢倡匠儳儳儳儳儳儀偕单单卒七儳儳儳儳儳一两剄刢一丳儳儳儳儳儰一丢倢一一儳儳儳儳儳儀一一一一七儳儳儳儳儳一一一一一丳儳儳儳儳儰一一一一一一一一一一一一一一一一一一一一一一倢倠一一一丢倢一一一丕卑倠一一丁偂伢一一丂卄剑倀一一偒別传一一严剄匐一一丂单卑一一一丕卑一一一丁倢伀一一一倢倠一一一丢倢一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一丂倀一一一一倠一一一丁单伀一一一伤倐一一一偔剅一一一严偂匀一一丁卄剒一一一何单倀一一丑单传一一丁伢倒一一一丂倢一一一一倢倀一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一丳儳儳儳儳儰一一一一一儳儳儳儳儳儀一一一一七儳儳儳儳儳一一一一一丳儳儳儳儳儰一一一一一儳儳儳儳儳儀一一匀一七儳儳儳儳儳一一両一一丳儳儳儳儳儰一一倒一一儳儳儳儳儳儀一两剐一七儳儳儳儳儳一一严匀一丳儳儳儳儳儰一一休伀一儳儳儳儳儳儀一一一一七儳儳儳儳儳一一一一一丳儳儳儳儳儰一一一一一儳儳儳儳儳儀一一一一七儳儳儳儳儳一一一一一丳儳儳儳儳儰");

const Sprite_Cursor = Resource.Register.SpriteFromSprite("Cursor", Sprite_AtlasCursor, 0, 0, 6, 8);
const Sprite_CursorBG = Resource.Register.SpriteFromSprite("CursorBG", Sprite_AtlasCursor, 6, 0, 6, 8);

const Sprite_Error = Resource.Register.Sprite("Error", "16|7|乍屼唈倮偃崉乀一一倀一丁何单卡坕卖吔单卒丄乐你巏嬿名勓兎什娳仠巏嬿名勓兎什嬳勡川啵尕单卖侕单呡剕单偪墪墫");

const Sprite_PlayerBody = Resource.Register.SpriteFromSprite("PlayerBody", Sprite_AtlasPlayer, 0, 0, SIZE_TILE, SIZE_TILE);
const Sprite_PlayerMouth = Resource.Register.SpriteFromSprite("PlayerMouth", Sprite_AtlasPlayer, 0, SIZE_TILE, SIZE_TILE, SIZE_TILE);
const Sprite_PlayerEyeLeft = Resource.Register.SpriteFromSprite("PlayerEyeLeft", Sprite_AtlasPlayer, 0, SIZE_TILE * 2, SIZE_TILE, SIZE_TILE);
const Sprite_PlayerEyeLeftClose = Resource.Register.SpriteFromSprite("PlayerEyeLeftClose", Sprite_AtlasPlayer, SIZE_TILE, SIZE_TILE * 2, SIZE_TILE, SIZE_TILE);
const Sprite_PlayerEyeRight = Resource.Register.SpriteFromSprite("PlayerEyeRight", Sprite_AtlasPlayer, 0, SIZE_TILE * 3, SIZE_TILE, SIZE_TILE);
const Sprite_PlayerEyeRightClose = Resource.Register.SpriteFromSprite("PlayerEyeRightClose", Sprite_AtlasPlayer, SIZE_TILE, SIZE_TILE * 3, SIZE_TILE, SIZE_TILE);
const Sprite_PlayerNose = Resource.Register.SpriteFromSprite("PlayerNose", Sprite_AtlasPlayer, 0, SIZE_TILE * 4, SIZE_TILE, SIZE_TILE);

const Sprite_Ground = Resource.Register.SpriteFromSprite("Ground", Sprite_AtlasTile, 0, 0, SIZE_TILE, SIZE_TILE);
const Sprite_Grass = Resource.Register.SpriteFromSprite("Grass", Sprite_AtlasTile, SIZE_TILE, 0, SIZE_TILE, SIZE_TILE);

const Sprite_Concrete = Resource.Register.SpriteFromSprite("Concrete", Sprite_AtlasTile, 0, SIZE_TILE, SIZE_TILE, SIZE_TILE);
const Sprite_Bricks = Resource.Register.SpriteFromSprite("Bricks", Sprite_AtlasTile, SIZE_TILE, SIZE_TILE, SIZE_TILE, SIZE_TILE);

// ----------------------------------------------------------------------

const Tile_EmptyFloor   = Entity.Register.Tile.Register("Empty", TILE_LAYER_FLOOR, null, { IsSolid: false });
const Tile_EmptyWall    = Entity.Register.Tile.Register("Empty", TILE_LAYER_WALL, null, { IsSolid: false });
const Tile_EmptyOverlay = Entity.Register.Tile.Register("Empty", TILE_LAYER_OVERLAY, null, { IsSolid: false });
const Tile_EmptyCeiling = Entity.Register.Tile.Register("Empty", TILE_LAYER_CEILING, null, { IsSolid: false });

const Tile_ErrorFloor   = Entity.Register.Tile.Register("Error", TILE_LAYER_FLOOR, Sprite_Error);
const Tile_ErrorWall    = Entity.Register.Tile.Register("Error", TILE_LAYER_WALL, Sprite_Error);
const Tile_ErrorOverlay = Entity.Register.Tile.Register("Error", TILE_LAYER_OVERLAY, Sprite_Error);
const Tile_ErrorCeiling = Entity.Register.Tile.Register("Error", TILE_LAYER_CEILING, Sprite_Error);

const Tile_Ground = Entity.Register.Tile.Register("Ground", TILE_LAYER_FLOOR, Sprite_Ground);
const Tile_Grass = Entity.Register.Tile.Register("Grass", TILE_LAYER_FLOOR, Sprite_Grass);

const Tile_Concrete = Entity.Register.Tile.Register("Concrete", TILE_LAYER_WALL, Sprite_Concrete);
const Tile_Bricks = Entity.Register.Tile.Register("Bricks", TILE_LAYER_WALL, Sprite_Bricks);