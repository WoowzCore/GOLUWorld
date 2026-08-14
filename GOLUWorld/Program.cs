using WoowzLib.Window.GLFW.WLO;

// ----------------------------------------------------------------------

Window_GLFW Window = new Window_GLFW();

Window.Create(800, 600, "TEST WINDOW");

while(!Window.IsClosed){
    Window.PollEvents();
    
    Window.SwapBuffers();
}

Window.Close();
Window_GLFW.TerminateGLFW();