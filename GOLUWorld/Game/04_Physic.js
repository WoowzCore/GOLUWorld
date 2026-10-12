const Physic = {}

Physic.Intersects = function(X1, Y1, W1, H1, X2, Y2, W2, H2){
    return X1 < X2 + W2 && X1 + W1 > X2 && Y1 < Y2 + H2 && Y1 + H1 > Y2;
}

Physic.CollidesWithTiles = function(X, Y, W, H){
    const TX1 = Math.floor(X / WORLD_TILE_SIZE);
    const TY1 = Math.floor(Y / WORLD_TILE_SIZE);
    const TX2 = Math.floor((X + W - 1) / WORLD_TILE_SIZE);
    const TY2 = Math.floor((Y + H - 1) / WORLD_TILE_SIZE);

    for(let TY = TY1; TY <= TY2; TY++){
        for(let TX = TX1; TX <= TX2; TX++){
            if(Physic.IsSolidTile(TX, TY)){ return true; }
        }
    }
    return false;
}

Physic.IsSolidTile = function(TX, TY){
    if(TX < 0 || TX >= World.Map.SizeW || TY < 0 || TY >= World.Map.SizeH){ return true; }

    const WallTile = World.Map.Tiles[TILE_LAYER_WALL][TY * World.Map.SizeW + TX];
    if(WallTile && WallTile.IsSolid){ return true; }

    return false;
}

Physic.MoveWithCollision = function(X, Y, W, H, VX, VY){
    let NewX = X;
    let NewY = Y;
    let HitX = false;
    let HitY = false;

    if(VX !== 0){
        const TryX = X + VX;
        if(!Physic.CollidesWithTiles(TryX, Y, W, H)){
            NewX = TryX;
        }else{
            const Step = VX > 0 ? 1 : -1;
            let TestX = X;
            while(true){
                const NextX = TestX + Step;
                if(VX > 0 && NextX > TryX){ break; }
                if(VX < 0 && NextX < TryX){ break; }
                if(Physic.CollidesWithTiles(NextX, Y, W, H)){ break; }
                TestX = NextX;
            }
            NewX = TestX;
            HitX = true;
        }
    }

    if(VY !== 0){
        const TryY = Y + VY;
        if(!Physic.CollidesWithTiles(NewX, TryY, W, H)){
            NewY = TryY;
        }else{
            const Step = VY > 0 ? 1 : -1;
            let TestY = Y;
            while(true){
                const NextY = TestY + Step;
                if(VY > 0 && NextY > TryY){ break; }
                if(VY < 0 && NextY < TryY){ break; }
                if(Physic.CollidesWithTiles(NewX, NextY, W, H)){ break; }
                TestY = NextY;
            }
            NewY = TestY;
            HitY = true;
        }
    }

    return { X: NewX, Y: NewY, HitX: HitX, HitY: HitY };
}