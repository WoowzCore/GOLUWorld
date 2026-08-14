using WLI_Input;
using WLO;
using WLO.Render.Software;
using WLO.Window;
using WoowzLib.Core.WLO;
using WoowzLib.Core.WLO.Math;

WLO.Window.GLFW Window = new WLO.Window.GLFW(new Vector2I(800, 600), "TEST WINDOW");

FrameBuffer Buffer = new FrameBuffer(new Vector2I(800, 600));
WLO.Render.Software.Simple Render = new Simple();

int cubeX = 0;
int cubeY = 200;
int speed = 1;

while(!Window.IsClosed){
    Window.PollEvents();
    
    Array.Fill(Buffer.Pixels, new Color4B(0, 0, 0));

    for (int i = 0; i < 800; i += 40)
    {
        Render.DrawLine(Buffer, new Vector2I(i, 0), new Vector2I(i, 600), new Color4B(50, 50, 50));
    }
    for (int i = 0; i < 600; i += 40)
    {
        Render.DrawLine(Buffer, new Vector2I(0, i), new Vector2I(800, i), new Color4B(50, 50, 50));
    }

    if(Window.Keyboard.IsKeyDown(Keyboard.Key.D)){
        cubeX += speed;
    }
    if(Window.Keyboard.IsKeyDown(Keyboard.Key.A)){
        cubeX -= speed;
    }
    
    if(Window.Keyboard.IsKeyDown(Keyboard.Key.W)){
        cubeY += speed;
    }
    if(Window.Keyboard.IsKeyDown(Keyboard.Key.S)){
        cubeY -= speed;
    }
    
    Render.DrawRect(Buffer, new Rect2I(cubeX, cubeY, 100, 100), new Color4B(255, 0, 0));
    
    Window.Present(Buffer);
}

Window.Close();

WLO.Window.GLFW.TerminateGLFW();