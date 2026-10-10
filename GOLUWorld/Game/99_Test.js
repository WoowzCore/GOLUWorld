let camx = 0;
let camy = 0;

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
    
    Graphic.Clear(200, 200, 200);
    
    for(let i = 0; i < 10; i++){
        World.Render(camx + i, camy + i);
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