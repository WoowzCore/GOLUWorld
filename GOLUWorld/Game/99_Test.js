const TEST_CYCLE = function(DT){
    if(Player.Interface.InInterface){ return; }
    
    const MouseWorldX = Input.Mouse.Position[0] + Player.Camera.X;
    const MouseWorldY = Input.Mouse.Position[1] + Player.Camera.Y;
    const TX = Math.floor(MouseWorldX / SIZE_TILE);
    const TY = Math.floor(MouseWorldY / SIZE_TILE);

    const SX = TX * SIZE_TILE - Player.Camera.X;
    const SY = TY * SIZE_TILE - Player.Camera.Y;
    const EX = SX + SIZE_TILE;
    const EY = SY + SIZE_TILE;

    if(Input.MouseIsPressed(0)){
        World.SetTile(TX, TY, Tile_Concrete);
    }

    if(Input.MouseIsPressed(1)){
        World.SetTile(TX, TY, Tile_EmptyWall);
    }

    Graphic.DrawRectOutline(SX, SY, EX, EY, 1, 255, 255, 255, 200);
}

const TEST_START = function(){
    World.Start();

    for(let y = 0; y < 40; y++) {
        for(let x = 0; x < 40; x++) {
            World.SetTile(x, y, Tile_Grass);
        }
    }
    
    for(let y = 10; y < 30; y++) {
        for(let x = 10; x < 30; x++) {
            World.SetTile(x, y, Tile_Ground);
            if ((x === 10 || y === 10 || x === 29 || y === 29) && !(x === 20 && y === 10) && !(x === 19 && y === 10)) World.SetTile(x, y, Tile_Bricks);
        }
    }
}