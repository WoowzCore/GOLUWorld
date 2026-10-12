let startx, starty = 0;

const TEST_MOUSEPRESS = function(Button, Down){
    if(Down){
        if(Button === 0){
            startx = Input.Mouse.Position[0] + Player.Camera.X;
            starty = Input.Mouse.Position[1] + Player.Camera.Y;
        }
    }
}

const TEST_CYCLE = function(DT){
    if(Input.MouseIsPressed(0)){
        Graphic.DrawRect(startx - Player.Camera.X, starty - Player.Camera.Y, Input.Mouse.Position[0], Input.Mouse.Position[1], 255, 0, 0, 127);
    }
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
            if (x === 10 || y === 10 || x === 29 || y === 29) World.SetTile(x, y, Tile_Bricks);
        }
    }
}