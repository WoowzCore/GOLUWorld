let camx = 0;
let camy = 0;

let startx, starty = 0;

const TEST_MOUSEPRESS = function(Button, Down){
    if(Down){
        Log.Info(Button)
        if(Button === 0){
            startx = Input.Mouse.Position[0];
            starty = Input.Mouse.Position[1];
        }
    }
}

const TEST = function(DT){
    const camspeed = 50 * DT;
    
    if(Input.KeyIsPressed("right")){
        camx += camspeed;
    }
    if(Input.KeyIsPressed("left")){
        camx -= camspeed;
    }

    if(Input.KeyIsPressed("down")){
        camy += camspeed;
    }
    if(Input.KeyIsPressed("up")){
        camy -= camspeed;
    }
    
    World.Render(camx, camy);

    if(Input.MouseIsPressed(0)){
        Graphic.DrawRect(startx, starty, Input.Mouse.Position[0], Input.Mouse.Position[1], 255, 0, 0, 127);
    }
}

const TEST_START = function(){
    World.Start();
    
    for(let y = 0; y < 10; y++) {
        for(let x = 0; x < 20; x++) {
            //World.SetTile(x, y, TILE_GRASS);
            if (x === 0 || y === 0 || x === 19 || y === 9) World.SetTile(x, y, Tile_ErrorWall);
        }
    }
}