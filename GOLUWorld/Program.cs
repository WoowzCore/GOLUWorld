using System.Runtime.InteropServices;
using Silk.NET.OpenGL;
using WLO;
using WLO.GPU;
using WLO.Math;
using WLO.Render;
using WLO.Render.Hardware;
using WLO.Window;
using Shader = WLI.GPU.Shader;

[StructLayout(LayoutKind.Sequential, Pack = 1)]
public struct GOLUVertex{
    public Vector3F Position;
    public Vector2F UV;

    public GOLUVertex(Vector3F Position, Vector2F UV){
        this.Position = Position;
        this.UV = UV;
    }
}

public static class Program{
    public static WLO.Window.GLFW Window = null!;

    public static double Accumulator = 0;
    public static long   LastTicks;

    public static DeltaTimeInfo DTI;

    public static OpenGL      Render = null!;
    public static GLView      View   = null!;
    public static GLTexture2D Screen = null!;
    
    public static int Main(string[] Args){
        try{
            Window = new GLFW(new Vector2I(800, 600), "GOLUWorld : C# Instance");
            Window.TODO_UseDarkMode();

            Render = new OpenGL(Window.GetProcAddress, new OpenGL.StartParameters{
                DebugLogger = false
            }, true);
            View = Render.Pool.DefaultView;

            WLO.Geometry Quad = WL.Geometry.CreateQuad(1);

            VertexLayout Layout = new VertexLayout(
                new VertexAttribute("Position", 3, VertexAttribute.AttributeType.Float),
                new VertexAttribute("UV", 2, VertexAttribute.AttributeType.Float)
            );

            GLMesh ScreenMesh = Render.CreateMesh(Layout, Quad.Vertices.Select(V => new GOLUVertex(V.Position, V.UV)).ToArray(), Quad.Indices.ToArray());
            GLProgram ScreenProgram = Render.CreateProgram(
                Render.CreateShader(Shader.Type.Vertex, 
@"#version 430 core
layout (location = 0) in vec3 Position;
layout (location = 1) in vec2 UV;

uniform mat4 Model;

out vec2 OutUV;

void main(){
    gl_Position = Model * vec4(Position, 1);
    OutUV = UV;
}"
),
                Render.CreateShader(Shader.Type.Fragment, 
@"#version 430 core
out vec4 FragColor;

in vec2 OutUV;

uniform sampler2D Screen;

void main(){
    FragColor = texture(Screen, OutUV);
}"
)
            );
            
            int? LocScreen = ScreenProgram.GetLocationFromName("Screen");
            int? LocModel  = ScreenProgram.GetLocationFromName("Model");
            
            Screen = Render.CreateTexture2D(new Vector2I(384, 216));
            Screen.SetFilter(TextureMinFilter.Nearest);
            Screen.Fill(new Color4B(0, 255, 0));
            
            double Step = DeltaTimeInfo.FPSToDT(30);
            LastTicks = System.Diagnostics.Stopwatch.GetTimestamp();
            while(!Window.IsClosed){
                Window.PollEvents();
                
                Accumulator += WL.Thread.GetRawDT(ref LastTicks);
                
                while(WL.Thread.NeedFixedUpdate(ref Accumulator, Step)){
                    DTI = new DeltaTimeInfo(0, Step);
                 
                    View.Viewport = Window.Size;
                    Render.Render(() => {
                        Render.Clear(Color4B.Black);

                        Vector2I WinSize = Window.Size;
                        Vector2I TexSize = Screen.Size;

                        float Scale = WL.Math.MinF((float)WinSize.W / TexSize.W, (float)WinSize.H / TexSize.H);

                        float DisplayW = TexSize.W * Scale;
                        float DisplayH = TexSize.H * Scale;

                        float ScaleX = DisplayW / WinSize.W;
                        float ScaleY = DisplayH / WinSize.H;

                        Matrix4F Model = Matrix4F.CreateScale(new Vector3F(ScaleX, ScaleY, 1));
                        
                        Screen.Fill(new Color4B((byte)Random.Shared.Next(0, 255), (byte)Random.Shared.Next(0, 255), (byte)Random.Shared.Next(0, 255)));
                        
                        Render.Pool.SetTexture2D(Screen, 0);

                        ScreenProgram.SetUniform(UniformValue.CreateI(LocScreen!.Value, 0));
                        ScreenProgram.SetUniform(UniformValue.CreateM4F(LocModel!.Value, Model));
                        
                        Render.Draw(ScreenMesh, ScreenProgram);
                    });
                    
                    Window.SwapBuffers();
                    Window.PollEvents2();
                }
            }
            
            Screen?.Destroy();
            ScreenMesh?.Destroy();
            ScreenProgram.Destroy();
            
            Render?.Stop();
            Render = null!;
            
            Window?.Close();
            Window = null!;
        }catch(Exception e){
            WL.Logger.Fatal("Произошла ошибка глобального характера! GOLUWorld больше не доступен на C#!", e);
            throw;
        }
        
        return 0;
    }
}