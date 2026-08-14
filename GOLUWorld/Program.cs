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
    
    
    Window.Present(Buffer);
}

Window.Close();

WLO.Window.GLFW.TerminateGLFW();