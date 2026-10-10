const Sprite_Cursor = Resource.Register.Sprite("Cursor", "6|24|丰仿一一儠倅匑匔匕伕刔丒圊匀");
const Sprite_CursorBG = Resource.Register.Sprite("CursorBG", "6|24|丰一巿嶿巰倀丐丘並严嘨丠一一");

const Sprite_Error = Resource.Register.Sprite("Error", "16|5|丰一巰仿巰倀丅協何匀両单一倔丅匂佅匀嘡剕丈倔卐亂佅匀嘤伀墢噁上堨刐亪傄伀墢噀墠丨刀亪墄一墪嘪墠一");

const Sprite_PlayerBody = Resource.Register.Sprite("PlayerBody", "16|24|习一凿嵿巻巿巿崀巰刀丒倢倢伐一专剃儴儲伀专剄剃剃儡专儳剄剄刳偒元兄剄剄儥偄剄兄剄刳匤剄剄剃元兒剄剄剄儳儵偄刳剄剃倣匣剄刴剄刳兑儴剄剄刳儵伳儴剄儳儲匒儳儳儳儲佐伣儳儢倢佐丁倳倡休佐一乕单单卐一");
const Sprite_PlayerMouth = Resource.Register.Sprite("PlayerMouth", "16|24|习一凿嶿巷巿丏巿巰刀一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一丐一一一一丁一一一一倱一一一一丁儀丑儢丂們儀一儔剄刓倀一一偕卒倀一一丳儳倀一一一一一一一一一一一一");
const Sprite_PlayerEyeLeft = Resource.Register.Sprite("PlayerEyeLeft", "16|24|乐一姿崀巿巿嗿崄一一一一一一一一一一一一一一一一一休一一一一伢們一一一伣儲刀一一丒休倐一一一伢倐一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一");
const Sprite_PlayerEyeLeftClose = Resource.Register.Sprite("PlayerEyeLeftClose", "16|24|乐一姿巿巰仿嗿崄一一一一一一一一一一一一一一一一一休一一一一伢們一一一伱倓刀一一且儳刐一一一佄刐一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一");
const Sprite_PlayerEyeRight = Resource.Register.Sprite("PlayerEyeRight", "16|24|乐一姿崀巿巿嗿崄一一一一一一一一一一一一一一伐一一一一伢倐一一一伣儲一一一乂休倀一一丁刢倐一一一丑伐一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一");
const Sprite_PlayerEyeRightClose = Resource.Register.Sprite("PlayerEyeRightClose", "16|24|乐一姿巿巰仿嗿崄一一一一一一一一一一一一一一伐一一一一伢倐一一一伱倓一一一乄儳刀一一丁剄刐一一一丑伐一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一");
const Sprite_PlayerNose = Resource.Register.Sprite("PlayerNose", "16|24|乐一凿嶿巿巿嗿崄一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一一丁一一一一丂伀一一一一倱一一一一乁传一一一丂倠一一一一一一一一一一一一一一一一一一一一一一一一一一一一一");

const Sprite_Ground = Resource.Register.Sprite("Ground", "16|7|丷塓侃崿出卼几倔墠墢堢亡努堨堊墪嘪堪墒亨努嚪堨堖墊墨亪倊墊倊堊傠傪噚嚤墢侪倚亨傆墢墢傠嚠塪墨墪嘪墢墨");
const Sprite_Grass = Resource.Register.Sprite("Grass", "16|7|丵佺亘労克埠啠倅乕劕伅丁垐劔厐圄劅噄乀丁剕乀乐侀且乑噀刄刉佂刐亅圠丅呔圐伆偉協乂十吒匥卆佡佖乥向別卄");

const Sprite_PlayerShadow = Resource.Register.Sprite("PlayerShadow", "16|24|丠一万崁嗿峿巿巿嗿尿巀");

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