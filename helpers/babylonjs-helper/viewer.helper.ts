import {
  UniversalCamera,
  ArcRotateCamera,
  Vector3,
  AbstractMesh,
  Scene,
  BoundingInfo,
  Viewport,
  FreeCameraMouseWheelInput,
} from "@babylonjs/core";

export enum Model3DCameraEnum {
  ArcRotateCamera = "ArcRotateCamera",
  UniversalCamera = "UniversalCamera",
}
const toRad = (degree: number) => {
  return degree * (Math.PI / 180);
};

export const setupArcCamera = (
  currentCamera?: ArcRotateCamera,
  scene?: Scene,
  viewPort?: Viewport,
  configs?: Partial<{
    alpha: number;
    beta: number;
    radius: number;
  }>
) => {
  const camera = new ArcRotateCamera(
    Model3DCameraEnum.ArcRotateCamera,
    currentCamera
      ? currentCamera.alpha
      : typeof configs?.alpha !== "undefined"
      ? configs?.alpha
      : toRad(90),
    currentCamera
      ? currentCamera.beta
      : typeof configs?.beta !== "undefined"
      ? configs?.beta
      : toRad(80),
    currentCamera
      ? currentCamera.radius
      : typeof configs?.radius !== "undefined"
      ? configs?.radius
      : 10,
    currentCamera ? currentCamera.target : Vector3.Zero(),
    scene
  );
  if (viewPort) {
    camera.viewport = viewPort;
  }

  camera.minZ = 0;
  camera.lowerRadiusLimit = 0;
  camera.checkCollisions = false;
  // camera.speed = 0.02;

  camera.wheelDeltaPercentage = 0.05;
  // camera.wheelPrecision = 20;
  // camera.wheelDeltaPercentage = 10;
  camera.panningSensibility = 1000;

  //set up keys

  return camera;
};

export const setupUniversalCamera = (
  currentCamera?: UniversalCamera,
  scene?: Scene,
  viewPort?: Viewport
) => {
  const camera = new UniversalCamera(
    Model3DCameraEnum.UniversalCamera,
    currentCamera ? currentCamera.position : new Vector3(0, 0.5, 0),
    scene
  );
  camera.setTarget(currentCamera ? currentCamera.target : Vector3.Zero());

  if (viewPort) {
    camera.viewport = viewPort;
  }

  camera.ellipsoid = new Vector3(0.1, 0.1, 0.1);
  camera.applyGravity = false;
  camera.checkCollisions = false;
  camera.minZ = 0;
  camera.speed = 1;
  camera.inputs.removeByType("FreeCameraKeyboardMoveInput");

  const cameraWheelInput = new FreeCameraMouseWheelInput();
  cameraWheelInput.wheelPrecisionX = 0.1;
  cameraWheelInput.wheelPrecisionY = 0.1;
  cameraWheelInput.wheelPrecisionZ = 0.1;

  camera.inputs.add(cameraWheelInput);

  return camera;
};



export const calculateBoundingInfoFromMeshes = (
  meshes: AbstractMesh[],
  checkCollision?: boolean
) => {
  let newMin: Vector3 | null = null;
  let newMax: Vector3 | null = null;
  meshes.forEach((mesh: AbstractMesh) => {
    // mesh.scaling = new Vector3(1, 1, 1);
    // mesh.rotation = new Vector3(0, 0, 0);
    const boundingBox = mesh.getBoundingInfo().boundingBox;
    if (!newMin) {
      newMin = new Vector3();
      newMin.copyFrom(boundingBox.minimumWorld);
    }
    if (!newMax) {
      newMax = new Vector3();
      newMax.copyFrom(boundingBox.maximumWorld);
    }
    newMin = Vector3.Minimize(newMin, boundingBox.minimumWorld);
    newMax = Vector3.Maximize(newMax, boundingBox.maximumWorld);
    if (checkCollision) {
      mesh.checkCollisions = true;
    }
  });
  if (newMin && newMax) {
    return new BoundingInfo(newMin, newMax);
  }
  return null;
};
