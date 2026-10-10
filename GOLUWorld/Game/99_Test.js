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
    
    for(let y = 0; y < 10; y++) {
        for(let x = 0; x < 20; x++) {
            World.SetTile(x, y, Tile_Grass);
            if (x === 0 || y === 0 || x === 19 || y === 9) World.SetTile(x, y, Tile_ErrorWall);
        }
    }
}