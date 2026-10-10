using System.Runtime.InteropServices;
using System.Text;
using Microsoft.ClearScript.JavaScript;
using Silk.NET.OpenGL;
using WLI_Input;
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
            WL.Core.Start(Args);
            
            WL.Core.ProjectInfo = new ProjectInfo("GOLUWorld", Author: "Woowz11", License: "Look at Repo (WIP)"); //todo
            
            WLO.Window.GLFW Window = new GLFW(new Vector2I(800, 600), "Loading...");
            Window.TODO_UseDarkMode();
            Window.CursorHided = true;

            OpenGL Render = new OpenGL(Window.GetProcAddress, new OpenGL.StartParameters{
                DebugLogger = false
            }, true);
            GLView View = Render.Pool.DefaultView;

            WLO.Geometry Quad = WL.Geometry.CreateQuad(1);
            Span<Vertex> __QuadVerticesSpan = Quad.VerticesSpan;
            for(int i = 0; i < __QuadVerticesSpan.Length; i++){ __QuadVerticesSpan[i].UV.Y = 1f - __QuadVerticesSpan[i].UV.Y; }

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
            
            Vector2I ScreenSize = new Vector2I(384, 216);
            uint[] FrameBuffer = new uint[ScreenSize.W * ScreenSize.H];
            
            GLTexture2D Screen = GLTexture2D.Create(Render, ScreenSize, InternalFormat.Rgba8, PixelFormat.Rgba, PixelType.UnsignedByte);
            Screen.SetFilter(TextureMinFilter.Nearest);
            
            // ----------------------------------------------------------------------
            
            WLOLanguage.ClearScript ClearScript_Engine = new WLOLanguage.ClearScript();
            ClearScript ClearScript = ClearScript_Engine.CreateContext();
            ClearScript.OnError += WL.Logger.Error;

            dynamic ClearScriptFrameBuffer = ClearScript.__Engine.Evaluate($"new Uint32Array({FrameBuffer.Length})");
            ClearScript.SetVariable("__Core_FrameBuffer", ClearScriptFrameBuffer);
            
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

            void RenderScreen(){
                if(ClearScriptFrameBuffer is ITypedArray<uint> Array){
                    Array.Read(0, (ulong)FrameBuffer.Length, FrameBuffer, 0);
                }
                
                Screen.Update(FrameBuffer);
                        
                View.Viewport = Window.Size;
                Render.Render(() => {
                    Vector2I WinSize = Window.Size;
                    Vector2I TexSize = Screen.Size;

                    float Scale = WL.Math.MinF((float)WinSize.W / TexSize.W, (float)WinSize.H / TexSize.H);

                    float DisplayW = TexSize.W * Scale;
                    float DisplayH = TexSize.H * Scale;

                    float ScaleX = DisplayW / WinSize.W;
                    float ScaleY = DisplayH / WinSize.H;

                    Matrix4F Model = Matrix4F.CreateScale(new Vector3F(ScaleX, ScaleY, 1));
                        
                    Render.Pool.SetTexture2D(Screen, 0);

                    ScreenProgram.SetUniform(UniformValue.CreateI(LocScreen!.Value, 0));
                    ScreenProgram.SetUniform(UniformValue.CreateM4F(LocModel!.Value, Model));
                        
                    Render.Draw(ScreenMesh, ScreenProgram);
                });
                    
                Window.SwapBuffers();
            }
            
            try{
                ClearScript.SetVariable("__Core", new {
                    LogInfo  = new Action<object>(Message => WL.Logger.Info (Message?.ToString() ?? "null")),
                    LogWarn  = new Action<object>(Message => WL.Logger.Warn (Message?.ToString() ?? "null")),
                    LogError = new Action<object>(Message => WL.Logger.Error(Message?.ToString() ?? "null")),
                    
                    PersistentRender = new Action(RenderScreen),
                    
                    Base64ToBytes = new Func<string, byte[]>(Base64 => {
                        try{
                            return Convert.FromBase64String(Base64);
                        }catch(Exception e){
                            WL.Logger.Error("Ошибка декодирования Base64!", e);
                            return [];
                        }
                    })
                });   
            }catch(Exception e){
                throw new Exception("Произошла ошибка при загрузке базовых функций JS!", e);
            }
            
            try{
                foreach(string ScriptPath in Scripts.Keys.OrderBy(K => K).ToList()){
                    try{
                        WL.Logger.Info($"Запуск: {ScriptPath}");
                        ClearScript.Execute(Scripts[ScriptPath]);
                    }catch(Exception e){
                        throw new Exception($"Произошла ошибка при запуске скрипта: {ScriptPath}", e);
                    }
                }
            }catch(Exception e){
                throw new Exception("Произошла ошибка при запуске скриптов в JS!", e);
            }

            try{
                ClearScript.Call("Bridge.Hook.Start", true, ScreenSize.W, ScreenSize.H, ClearScriptFrameBuffer);
            }catch(Exception e){
                throw new Exception("Произошла ошибка при запуске игры JS!", e);
            }

            Window.Keyboard.OnKey += (Key, Down) => {
                if(Down){
                    if(Key == WLI_Input.Keyboard.Key.Escape){
                        Window.IsLocked = false;
                    }
                    
                    ClearScript.Call("Bridge.Hook.KeyDown", Key.ToString());
                }else{
                    ClearScript.Call("Bridge.Hook.KeyUp", Key.ToString());
                }
            };

            Window.Mouse.OnButton += (Button, Down) => {
                if(Down){
                    if(!Window.IsLocked){
                        Window.IsLocked = true;
                    }
                    
                    ClearScript.Call("Bridge.Hook.MouseButtonDown", (int)Button);
                }else{
                    ClearScript.Call("Bridge.Hook.MouseButtonUp", (int)Button);
                }
            };
            
            // ----------------------------------------------------------------------

            DeltaTimeInfo? DTI__ = null;
            double TargetDT = DeltaTimeInfo.FPSToDT(60);

            float LogicalMouseX = ScreenSize.W / 2f;
            float LogicalMouseY = ScreenSize.H / 2f;
            
            while(!Window.IsClosed){
                Window.PollEvents();

                if(WL.Thread.LimitByDeltaTime(TargetDT, ref DTI__)){
                    DeltaTimeInfo DTI = DTI__!.Value;

                    Vector2I WindowSize = Window.Size;
                    float Scale = WL.Math.MinF((float)WindowSize.W / ScreenSize.W, (float)WindowSize.H / ScreenSize.H);
                    float OffsetX = (WindowSize.W - ScreenSize.W * Scale) * 0.5f;
                    float OffsetY = (WindowSize.H - ScreenSize.H * Scale) * 0.5f;

                    if(Window.IsLocked){
                        LogicalMouseX += Window.Mouse.Delta.X / Scale;
                        LogicalMouseY += Window.Mouse.Delta.Y / Scale;
                    }else{
                        LogicalMouseX = (Window.Mouse.Position.X - OffsetX) / Scale;
                        LogicalMouseY = (Window.Mouse.Position.Y - OffsetY) / Scale;
                    }

                    LogicalMouseX = WL.Math.ClampF(LogicalMouseX, 0, ScreenSize.W - 6);
                    LogicalMouseY = WL.Math.ClampF(LogicalMouseY, 0, ScreenSize.H - 8);
                    
                    try{
                        ClearScript.Call("Bridge.Hook.Cycle", DTI.DT, DTI.FPS, LogicalMouseX, LogicalMouseY);
                    }catch(Exception e){
                        WL.Logger.Error("Произошла ошибка в игровом цикле!", e);
                    }

                    Window.Title = (ClearScript.Call("Bridge.Hook.WindowTitle") as string)!;
                    
                    RenderScreen();
                    
                    Window.PollEvents2();
                }
            }
            
            ClearScript.Dispose();
            ClearScript_Engine.Dispose();
            
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