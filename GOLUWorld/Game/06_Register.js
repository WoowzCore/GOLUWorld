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

const Sprite_AtlasDefaultFont = Resource.Register.Sprite("Atlas_DefaultFont", "128|24|丿巿一一巰倀丁单伕单協乕单卑卑单包包单单单单单单单单佑卐何匑協匕休包剔剕何卅单何单卑单单单单单剕佔刕单单一匑卐匕匕单卑单卅匔单何单单单单卅匕佁单单卅佔乕卅十何单何協協何丁单卐丕单卑卑剔何单協匕匑卑卑剕单匕单剕刕卑单单单单協单伕剕单单一匑佔包佅单協单匕匔单何单单单单剕包十单单卅佔乕佐十何单包包单单单匕单单何匕卐一单单单单单单单单单单单单单单協单单单单单刅卑協乕刅匕佐丕刅匀佔乕刅单单单卅单卑单刅匕佔何佑匕佑匕何匕何匕佑匕何单单卑单单剕匕佑匕匕单何匕佑匀卑单卑匕佑匕何匕協单丁卑单匕休卑单乕刅匀何匕丅協協乕刁单单单何单单剕卅匕何何剕单何匕卑匕何何佑单何单单卅单单匕卑卑匕匕匕卑匕卑匕佑匕匕匕佑匕单单单何丁卅单单刅匀佐丕刅单佔乕刅卑協乕刅匕卑单卅单卑单匕单单单单单单单单单单单单单单单剕单单单单单協丅刅匀協乕丅匀佐丕刁匕佐何卑匕佑单佑匕佔乕何伕佑匕佑匕佑单何匕卑匕剕单佑匕何匄佑匕佑匔休匕佑匕卑匕何匕卑单佑卅单匕佅匕卑伕乑匕佑休丁匀卑单佑匀卐乕佁匀佔单卑匁卑单佑匑佑匕伀伕佑匕何匕佑单何匕佑匕剕单佑剕何匕佑刕佑匕卑匕佑匕佑匕何匕卑匕佑卅卑匕佑匕卑匕佑匕佔丅佑匀協乕丅匀佑单刅匕佐何刅匕佐丕佑匕佔乕单单单单单单单单单单单单单单单单单单单单单匀協乕丅區卐丕佑匕佑匕佑匕佐丕丕匕卐何匕单卑匕佑匕佑匕匕匕佑匕佑匕佑匕卑匕協单匕卄单单佑匕佑匕何卑卑匕佑匕佔剕剅協卑单剕卑卑匕单匀卑匕丅區单何佑匕佑匕匕卑单何何卑单何单单卑单佑匕何匕匕匕佔剕休卄单何剕匕单剕匕单单单何匔卑匕佑卑卑匕剅匄佑匕匕匕卑单卅卑单单单匕協伕佑區单何刅卑卑匕佑卑卐丕丕单佐何单单单单单单单单单单单单单单单单单单单单单单卐一何单单单单单单单单单单单单单单单单单单单单卅单单单单单单单单单单单单单单单单单单单单单单刅匀協乕丅匀佐乕刅匕佐何卑匕佑单佑匕佔乕单匕佑匕佑匕佑单何匕卑匕剕单佑剕何匄佐匕佑单卐丕丅匕卑匕丅匁卑刕丁卅单匕丕匕卑伕休匕何单佑匕佑匕佑匕卑单佑匕佔单佑匔卑单佑匔佑匕单匕佐乕刅匀卐丕何區卑匕丕匕佑匕丁匕佑匕刅单单单单单单单单单单单单单協乕单单单单单单单单单单单单单单单单单单单单单卐卑单乕十剔剕单单单单单单单单单单单单单单協单何卑卑刕单匀協乕丅區佐丕佑匕佑匕佑匕佐丕剕匕单何单匀佑匕佑匕佑单匕匕佑匕佑卄協剕卅匕卑单卅单卑单丅匕佐乕刅卑卑匕佑匑何何匕卑協单何卑单单丅匕卑剕佑单何何佑卄卐刕剅卑協单剕匕单何单匕卑单刑匕佐乕匕區单何佑匕何何丁卐卑单乕单卐丕单单单单单单单单单单单单单单单单单单单单单厪墠丕墪堀佔丕墪堑佚墪佑卑博墪刁厪墪墪墪堀佚墪何厪墡单剑厪墡伕墪堕佑匕墪塅佚墪墪墪墡匕墪堕博墪何卅佚墪休厪墡刕佁厪墤匕墪墪墪墪佑厪墠乕墪堕協匕墪塀博墪休匑佚墪剑厪墪墪墪堕佚墪佑厪墡单剑厪墡伕墪堅佐匕墪塅佚墪墪墪墡匕墪堕佚墪何匀乚墪休厪墡匕佑厪墤匕墪墪墪墪佑厪墠乕墪堕卑卅墪堑佚墪佑匕佚墪佑厪墪墪墪堕佚墪单厪墥单单厪墥单墪塕单单墪塕博墪墪墪墥单墪墪墪墪佑協博墪佅匕佑伕休匁卑卅何區卑刕刁厪墪墪墪堕佔丅墪堔卑匕休匑何何佔匕卑匕伔匕佚墪墪墪墡匕佅侪墡剕佑匑佑伕匕匕剑单卑匑剑匕墪墪墪墪刁匔匚墪佅區佑伕休卐佐佅丕卐佐佅刁厪墪墪墪塕佑剑墪堔单匕休匑何佅佄匔单匕伔匕佚墪墪墪墡匕刀厪墡剕卑匑佑伕匔匔剑剕佑匑剑匕墪墪墪墪刅協博墪丁单佐丕一卐佐佅丕區卑刕佑厪墪墪墪塕单单墪塕何单单单剕单单单单单单单博墪单厪墥单单厪墥单单单協乕墪塕博墪墪墪墥单墪塕博墪单单博墪单单单单单厪墥单墪墪墪墪单厪墠丕墪堀佔乕墪堑佔乕佑匕佚墪刁厪墪墪墪堀佚墪何厪墡单剅厪墡伕佑匔佑刕墪塅佚墪墪墪墡匕墪堀博墪何卄博墪刅卐卑伕休厪墤匕墪墪墪墪佑厪墡匕墪堕卐丕墪堑佑匕乑包佚墪剑厪墪墪墪堕佚墪丅厪墡单佑厪墡伕刅匕佑匕墪堕佚墪墪墪墡匕墪塕博墪单单博墪单单单单单厪墥单墪墪墪墪单厪墪墪墪塕单单墪塕单单单单单单单单单单单单博墪墪墪墥单单厪墥单单单单单单单单单单单单单墪墪墪墪佑區博墪佅匕佑伕休匁卑卅何區卑刕刁厪墪墪墪堕佑伕墪堔卑匕休匑何何佔匕卑匕伔匕佚墪墪墪墡匕休厪墡剕刁匑佑伕匁匁剐何匁匁剔丕墪墪墪墪刁匑佚墪佅单佑伕休卑剑剅佅匕佑佅佑厪墪墪墪塕佔乕墪堀何匕丁匀乕丕且匁協乕佁匕佚墪墪墪墠乕匕厪墥匕单单单卅单单单单单单单单墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪墪");
const Font_Default = Resource.Register.Font("Default", Sprite_AtlasDefaultFont, [
    "Ą","!","\"","#","$","%","&","'","(",")","*","+",",","-",".","/",
    "0","1","2","3З","4","5","6","7","8","9",":",";","<","=",">","?",
    "@","AА","BВ","CС","D","EЕ","F","G","HН","I","J","KК","L","MМ","N","OО",
    "PР","Q","R","S","TТ","U","V","W","XХ","Y","Z","[","\\","]","^","_",
    "`","aа","bв","cс","d","eе","f","g","hн","i","j","kк","l","mм","n","oо",
    "pр","q","r","s","tт","u","v","w","xх","y","z","{","|","}","~","Ёё",
    "","Б","","Г","Д","","Ж", "","И","Й","","Л","","","","П",
    "","","","У","Ф","","Ц","Ч","Ш","Щ","Ъ","Ы","Ь","Э","Ю","Я",
    "","б","","г","д","","ж","з","и","й","","л","","","","п",
    "","","","у","ф","","ц","ч","ш","щ","ъ","ы","ь","э","ю","я"
], 'Ą', 8, 8, false);

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