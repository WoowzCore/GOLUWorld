using System.Runtime.InteropServices;
using System.Text;
using Silk.NET.GLFW;
using Silk.NET.OpenGL;
using WLO;
using WLO.GPU;
using WLO.Math;
using WLO.Render;
using WLO.Render.Hardware;
using WLO.Window;
using WLOLanguageContext;

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
    public static int Main(string[] Args){
        try{
            WLO.Window.GLFW Window = null!;

            double Accumulator = 0;
            long   LastTicks   = 0;

            DeltaTimeInfo DTI = default;

            OpenGL      Render = null!;
            GLView      View   = null!;
            GLTexture2D Screen = null!;
            
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
                Render.CreateShader(WLI.GPU.Shader.Type.Vertex, 
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
                Render.CreateShader(WLI.GPU.Shader.Type.Fragment, 
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
            
            void TEST_FillNoise() {
                int totalPixels = Screen.Size.W * Screen.Size.H;
                Color4B[] noise = new Color4B[totalPixels];
    
                for (int i = 0; i < totalPixels; i++) {
                    noise[i] = new Color4B(
                        (byte)Random.Shared.Next(0, 256),
                        (byte)Random.Shared.Next(0, 256),
                        (byte)Random.Shared.Next(0, 256),
                        255
                    );
                }
    
                Screen.Update(noise);
            }
            
            // ----------------------------------------------------------------------
            
            WLOLanguage.JS JS_Engine = new WLOLanguage.JS();
            JS JS = JS_Engine.CreateContext();
            JS.OnError += WL.Logger.Error;

            Dictionary<string, string> Scripts = [];

            try{
                string ScriptsWLPK = Path.Combine(WL.Core.PathToFolderEXE, "GOLUWorldResources.wlpk");
                if(File.Exists(ScriptsWLPK)){
                    (string[] Keys, byte[][] Contents) = WL.IO.Unpack(ScriptsWLPK);
                    for(int i = 0; i < Keys.Length; i++){
                        if(Keys[i].EndsWith(".js")){
                            Scripts[Keys[i]] = Encoding.UTF8.GetString(Contents[i]);
                        }
                    }
                }
                else{
                    string ScriptsFolder = Path.Combine(WL.Core.PathToFolderEXE, "Game");
                    if(!Directory.Exists(ScriptsFolder)){
                        ScriptsFolder = "W:/Other/GOLUWorld/GOLUWorld/Game";
                        if(!Directory.Exists(ScriptsFolder)){ throw new Exception("Произошла ошибка при загрузке скриптов! А именно ИГРА НЕ НАШЛА! откуда загружать скрипты вообще! Нет скриптов, нет игры. Мб нет файла GOLUWorldResources.wlpk???"); }
                    }

                    foreach(string ScriptPath in Directory.GetFiles(ScriptsFolder, "*.js", SearchOption.TopDirectoryOnly)){
                        Scripts[Path.GetRelativePath(ScriptsFolder, ScriptPath).Replace("\\", "/")] = File.ReadAllText(ScriptPath);
                    }
                }
            }catch(Exception e){
                throw new Exception("Произошла ошибка при загрузке/обнаружении скриптов!", e);
            }

            try{
                foreach(string ScriptPath in Scripts.Keys.OrderBy(K => K).ToList()){
                    try{
                        WL.Logger.Info($"Запуск: {ScriptPath}");
                        JS.Execute(Scripts[ScriptPath]);
                    }catch(Exception e){
                        throw new Exception($"Произошла ошибка при запуске скрипта: {ScriptPath}", e);
                    }
                }
            }catch(Exception e){
                throw new Exception("Произошла ошибка при запуске скриптов в JS!", e);
            }
            
            // ----------------------------------------------------------------------
            
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
                        
                        TEST_FillNoise();
                        
                        Render.Pool.SetTexture2D(Screen, 0);

                        ScreenProgram.SetUniform(UniformValue.CreateI(LocScreen!.Value, 0));
                        ScreenProgram.SetUniform(UniformValue.CreateM4F(LocModel!.Value, Model));
                        
                        Render.Draw(ScreenMesh, ScreenProgram);
                    });
                    
                    Window.SwapBuffers();
                    Window.PollEvents2();
                }
            }
            
            JS.Dispose();
            JS_Engine.Dispose();
            
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