const Sprite_Cursor = Resource.Register.Sprite("Cursor", "6|24|丰仿一一凰倅匑匔匕伕刔丒圊匀");
const Sprite_CursorBG = Resource.Register.Sprite("CursorBG", "6|24|丰一巿嶿巰倀丐丘並严嘨丠一一");

const Sprite_Error = Resource.Register.Sprite("Error", "16|7|乍屼唈倮偃崉乀一一倀一丁何单卡坕卖吔单卒丄乐你巏嬿名勓兎什娳仠巏嬿名勓兎什嬳勡川啵尕单卖侕单呡剕单偪墪墫");

const Sprite_PlayerBody = Resource.Register.Sprite("PlayerBody", "16|15|乐一一乒匥僿堊亠巿峿巿崀一仿乀丁伒休們一丁倳儡倲倐丁伒儳儳儲企倣儳儳儲伔伣儳們伒們刓儳們伣儳偁儡伒倳儳儤伡倣儳儳儳伒倣儳儳儲倒儳儳儲倢佁伳儳儲休休划儳儢伒儳允倢儳儳伒値丑伢儳倡伔一刡伢們伔一丄剄休剄一");
const Sprite_PlayerMouth = Resource.Register.Sprite("PlayerMouth", "16|15|乐一一乒匥僿堊亠巰一丏巾巿巿乀一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一传一一一估両倢倢倢伲一倳儳儳儲一一偄剄倠一一丂倢倀一一一一一一一一一一一一");
const Sprite_PlayerEyeLeft = Resource.Register.Sprite("PlayerEyeLeft", "16|15|乐一一亠堊仿匥偒巰一丏巾巿巿乀一一一一一一一一一一一丑休一一一丣儲伐一一专剄儡一一丁兄刲一一一丣儲一一一丁休伀一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一");
const Sprite_PlayerEyeLeftClose = Resource.Register.Sprite("PlayerEyeLeftClose", "16|15|乐一一亠堊仿匥偒巿峿巿崀一仿乀一一一一一一一一一一一丑休一一一両儒伐一一且伱刡一一丁剄剂一一一両伒一一一丁休伀一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一");
const Sprite_PlayerEyeRight = Resource.Register.Sprite("PlayerEyeRight", "16|15|乐一一亠堊仿匥偒巰一丏巾巿巿乀一一一一一一一一丁伀一一一丣儲一一一专剄儀一一丂兄刱一一一倣儲伀一一一休伀一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一");
const Sprite_PlayerEyeRightClose = Resource.Register.Sprite("PlayerEyeRightClose", "16|15|乐一一亠堊仿匥偒巿峿巿崀一仿乀一一一一一一一一丁伀一一一両儒一一一且伱刀一一丂剄剁一一一倡伒伀一一一休伀一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一");
const Sprite_PlayerNose = Resource.Register.Sprite("PlayerNose", "16|15|乐一一一一仿堊亠巵偒匯巾巿巿乀一一一一一一一一一一一一一一一一一一一一一一一一一一一一一伀一一一一倰一一一一丣倀一一一两刐一一一一們一一一一丳儰一一一一一一一一一一一一一一一一一一一一一一一一一一一一");

const Sprite_Ground = Resource.Register.Sprite("Ground", "16|7|丮囐墬嚑几伃丸劄劄嘰儀娌丠倁丐企丰冄噄噈儃丌什倂丐企丐");
const Sprite_Grass = Resource.Register.Sprite("Grass", "16|7|丨侺傃佣一伀丈嘀剈嘢剁伢丁伀一一一一丂丂伢侉伄劈丄刀一");

const Sprite_Concrete = Resource.Register.Sprite("Concrete", "16|7|乊亠堍埚埕偒匠一一倅匀佫佀刐匥丆匁偈偤嘢刅吅丠乒佀偕別刂卑呐严嘦劆偐伤佒刐倁匤匂佀偔丠丂厂倈倨七一冫已姿");
const Sprite_Bricks = Resource.Register.Sprite("Bricks", "16|7|么倮偍屼唀一七崉乀倅匡乒刀啀买七一冿巻巿匡卒佐啀估七刀儀巻巿姵卖何呀乴七一儀主巿姿嵖何偕临七刀儀丰仿姿嶿");

// ----------------------------------------------------------------------

const Tile_EmptyFloor   = Entity.Register.Tile.Register("Empty", TILE_LAYER_FLOOR, null);
const Tile_EmptyWall    = Entity.Register.Tile.Register("Empty", TILE_LAYER_WALL, null);
const Tile_EmptyOverlay = Entity.Register.Tile.Register("Empty", TILE_LAYER_OVERLAY, null);
const Tile_EmptyCeiling = Entity.Register.Tile.Register("Empty", TILE_LAYER_CEILING, null);

const Tile_ErrorFloor   = Entity.Register.Tile.Register("Error", TILE_LAYER_FLOOR, Sprite_Error);
const Tile_ErrorWall    = Entity.Register.Tile.Register("Error", TILE_LAYER_WALL, Sprite_Error);
const Tile_ErrorOverlay = Entity.Register.Tile.Register("Error", TILE_LAYER_OVERLAY, Sprite_Error);
const Tile_ErrorCeiling = Entity.Register.Tile.Register("Error", TILE_LAYER_CEILING, Sprite_Error);

const Tile_Ground = Entity.Register.Tile.Register("Ground", TILE_LAYER_FLOOR, Sprite_Ground);
const Tile_Grass = Entity.Register.Tile.Register("Grass", TILE_LAYER_FLOOR, Sprite_Grass);

const Tile_Concrete = Entity.Register.Tile.Register("Concrete", TILE_LAYER_WALL, Sprite_Concrete);
const Tile_Bricks = Entity.Register.Tile.Register("Bricks", TILE_LAYER_WALL, Sprite_Bricks);