import {
  Vector3,
  Engine,
  Scene,
  SceneLoader,
  ISceneLoaderAsyncResult,
  CubeTexture,
  ISceneLoaderProgressEvent,
} from "@babylonjs/core";
import "@babylonjs/loaders";
import { useCallback, useRef, useState, useEffect } from "react";
import { Box, styled, Stack, Button } from "@mui/material";
import {
  calculateBoundingInfoFromMeshes,
  setupArcCamera,
} from "@/helpers/babylonjs-helper/viewer.helper";
import LoadingScene3D from "@/components/Utilities/Loaders/LoadingScene3D";
import useWindowEvent from "@/lib/hooks/dom/useWindowEvent";
import DrawingRenderer from "@/components/Drawing/DrawingRenderer";
import {
  DrawingRendererOnInitInstance,
  DrawingRenderingMethodEnum,
} from "../Drawing/@types/drawingRenderer";

const CanvasModel = styled(Box)`
  width: 100%;
  height: 100%;
  background: transparent;
`;

interface Render3DSceneProps {}

const ContentContainer = styled(Stack)`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  .drawing-button {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 9999;
  }
  canvas {
    outline: none;
  }
  .drawing-inactive {
    pointer-events: none;
  }
`;

export default function Render3DScene(props: Render3DSceneProps) {
  const babylonJsCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const loadingContainerRef = useRef<HTMLDivElement>(null);

  const onLoad = useCallback((progress: ISceneLoaderProgressEvent) => {
    const currentProgress = progress.lengthComputable
      ? progress.loaded / progress.total
      : progress.loaded / 10000;
    const circleElement =
      loadingContainerRef.current?.getElementsByTagName("circle")?.[0];
    let initialDashArray = 125;
    if (circleElement) {
      initialDashArray = parseFloat(circleElement.style.strokeDasharray);
      circleElement.style.strokeDasharray = "";
      circleElement.style.strokeDashoffset = "";
    }

    const linearElement = loadingContainerRef.current?.getElementsByClassName(
      "MuiLinearProgress-bar"
    )?.[0] as HTMLElement;

    if (currentProgress > 0) {
      const percentage = parseFloat(currentProgress.toFixed(2)) * 100;
      //circle loader
      if (circleElement) {
        const fullDashArray = initialDashArray;
        const currentDash = currentProgress * fullDashArray;
        circleElement.setAttribute(
          "stroke-dasharray",
          fullDashArray.toString()
        );
        circleElement.setAttribute(
          "stroke-dashoffset",
          (fullDashArray - currentDash).toString()
        );
      }
      //linear loader
      if (linearElement) {
        linearElement.style.transform = `translateX(-${100 - percentage}%)`;
      }
    }
  }, []);

  useEffect(() => {
    //get the canvas
    const canvasCurrentContent = babylonJsCanvasRef.current;
    if (!canvasCurrentContent) {
      return;
    }
    let currentContentEngine: Engine;
    let currentContentScene: Scene;
    try {
      //create engine
      currentContentEngine = new Engine(canvasCurrentContent, true, {
        preserveDrawingBuffer: true,
        stencil: true,
      });
      //set configuration
      currentContentEngine.adaptToDeviceRatio = true;
      engineRef.current = currentContentEngine;
      //create scene and set it's properties
      currentContentScene = new Scene(currentContentEngine);
      sceneRef.current = currentContentScene;
      currentContentScene.imageProcessingConfiguration.contrast = 1.6;
      currentContentScene.imageProcessingConfiguration.exposure = 0.6;
      currentContentScene.imageProcessingConfiguration.toneMappingEnabled =
        true;
      currentContentScene.collisionsEnabled = false;
      currentContentScene.gravity = new Vector3(0, -0.9, 0);
      //set hdr texture for global light effect
      const hdrTextureCurrentScene = new CubeTexture(
        "/environment/texture.env",
        currentContentScene
      );
      currentContentScene.environmentTexture = hdrTextureCurrentScene;

      //setup arc camera
      const arcCamera = setupArcCamera(undefined, currentContentScene);

      currentContentScene.activeCamera = arcCamera;
      currentContentScene.activeCamera.attachControl(
        canvasCurrentContent,
        true
      );

      //now load the mesh
      SceneLoader.ImportMeshAsync(
        "",
        "/models/sofa.glb",
        "",
        currentContentScene,
        onLoad
      )
        .then((model) => {
          setModelProps(model);
        })
        .catch((ex) => {
          console.log("failed loading 3D file: ", ex);
        });
      //after mesh is loaded run the render loop
      currentContentScene.executeWhenReady(() => {
        engineRef.current?.resize();
        currentContentEngine.runRenderLoop(() => {
          currentContentScene.render();
        });
      });
    } catch (e) {
      console.log(e);
    }

    return () => {
      currentContentScene.dispose();
      currentContentEngine.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setModelProps = useCallback((model: ISceneLoaderAsyncResult) => {
    const calculatedBoundingInfo = calculateBoundingInfoFromMeshes(
      model.meshes,
      false
    );

    if (model.meshes) {
      const rootMesh = model.meshes[0];
      if (rootMesh) {
        rootMesh.name = "rootMeshName" + Date.now();
        if (calculatedBoundingInfo) {
          rootMesh.setBoundingInfo(calculatedBoundingInfo);
        }
        rootMesh.computeWorldMatrix();
        // rootMesh.showBoundingBox = process.env.NODE_ENV === "development";
      }
    }
    if (loadingContainerRef.current) {
      loadingContainerRef.current.classList.add("fade-out");
    }
  }, []);

  //if we have any scaling ratio enabled using css transform
  //so it would calculate exact points when clicking on the drawing canvas
  const scaleRef = useRef(1);

  //feel free to change this method currently
  //i made support for canvas/svg renderer.
  //but there is little flickering when resizing the canvas
  const renderMethod = DrawingRenderingMethodEnum.canvas;

  const [drawingEnabled, setDrawingEnabled] = useState(false);

  //it is the drawing instance
  const [drawingRendererInstance, setDrawingRendererInstance] =
    useState<Nullable<DrawingRendererOnInitInstance<typeof renderMethod>>>(
      null
    );

  const toggleDrawingMode = useCallback(() => {
    setDrawingEnabled((prevState) => !prevState);
  }, []);

  const changeDrawingCanvasSize = useCallback(() => {
    const drawingCanvas = drawingRendererInstance?.getRendererContainer();
    const engine = engineRef?.current;
    if (drawingCanvas && engine) {
      const renderingCanvasHeight = engine?.getRenderHeight();
      const renderingCanvasWidth = engine?.getRenderWidth();
      drawingCanvas.height = renderingCanvasHeight;
      drawingCanvas.width = renderingCanvasWidth;
    }
  }, [drawingRendererInstance]);

  useEffect(() => {
    changeDrawingCanvasSize();
  }, [changeDrawingCanvasSize]);

  useWindowEvent("resize", () => {
    engineRef.current?.resize();
    changeDrawingCanvasSize();
  });

  return (
    <ContentContainer justifyContent="center" alignItems={"center"}>
      <LoadingScene3D ref={loadingContainerRef} />
      <CanvasModel component={"canvas"} ref={babylonJsCanvasRef} />
      <Button
        className="drawing-button"
        variant={"contained"}
        color={drawingEnabled ? "error" : "info"}
        onClick={toggleDrawingMode}
      >
        {drawingEnabled ? "Disable" : "Enable"} drawing
      </Button>
      <DrawingRenderer
        className={`${
          !drawingEnabled ? "drawing-inactive" : ""
        } drawing-canvas`}
        onInit={setDrawingRendererInstance}
        defaultTool={"drawing"}
        scaleRef={scaleRef}
        renderMethod={renderMethod}
      />
    </ContentContainer>
  );
}
