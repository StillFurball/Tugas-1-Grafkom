import {
  Mat3,
  createRTMatrix,
  createTRSMatrix,
  degToRad,
} from "./matrix3.js";

const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
  throw new Error("WebGL2 tidak tersedia.");
}

gl.viewport(0, 0, canvas.width, canvas.height);

const vertexShaderSource = `#version 300 es
  in vec2 a_position;
  uniform mat3 u_matrix;

  void main() {
    vec3 p = u_matrix * vec3(a_position, 1.0);
    gl_Position = vec4(p.xy, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `#version 300 es
  precision highp float;

  uniform vec4 u_color;
  out vec4 outColor;

  void main() {
    outColor = u_color;
  }
`;

function createShader(glContext, type, source) {
  const shader = glContext.createShader(type);
  glContext.shaderSource(shader, source);
  glContext.compileShader(shader);

  const success = glContext.getShaderParameter(shader, glContext.COMPILE_STATUS);

  if (!success) {
    const info = glContext.getShaderInfoLog(shader);
    glContext.deleteShader(shader);
    throw new Error(`Shader compile error:\n${info}`);
  }

  return shader;
}

function createProgram(glContext, vertexShader, fragmentShader) {
  const program = glContext.createProgram();
  glContext.attachShader(program, vertexShader);
  glContext.attachShader(program, fragmentShader);
  glContext.linkProgram(program);

  const success = glContext.getProgramParameter(program, glContext.LINK_STATUS);

  if (!success) {
    const info = glContext.getProgramInfoLog(program);
    glContext.deleteProgram(program);
    throw new Error(`Program link error:\n${info}`);
  }

  return program;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = createProgram(gl, vertexShader, fragmentShader);

gl.useProgram(program);

const vertices = new Float32Array([
  //segitiga
  -0.18, -0.15,
  0.18, -0.15,
  0.0, 0.22,

  //kotak
  0, 0.44,
  0.5, 0.44,
  0.5, 0.22,
  
  //gunung kiri
  -0.99 , 0.20,
  -0.50, 0.70,
  -0.05, 0.20,
  
  //gunung kanan
  -0.06, 0.20,
  0.40 , 0.70,
  0.99, 0.20,

  //jalan
  0.2, -1,  
  -0.055, 0.20,
  0.4, -1,

  //padi padian
  0.02, 0.05,
  0.0, 0.0,
  -0.02, 0.05,

  //rumah
  -0.1, -0.8,
  -0.1, -0.6,
  -0.3, -0.6,
  -0.3, -0.8,
  -0.6, -0.75,
  -0.6, -0.55,
  
  //atap
  -0.08, -0.6, //24
  -0.3, -0.6, //25
  -0.19, -0.3,
  -0.50,-0.25,
  -0.61, -0.55,
  

]);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const positionLocation = gl.getAttribLocation(program, "a_position");

gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

const matrixLocation = gl.getUniformLocation(program, "u_matrix");
const colorLocation = gl.getUniformLocation(program, "u_color");

const objectA = {
  x: 0.0,
  y: 0.0,
  rotation: 0.0,
  scaleX: 1.0,
  scaleY: 1.0,
};
const objectC = {
  x: 0.45 ,
  y: -0.46,
  rotation: 0.0,
  scaleX: 1,
  scaleY: 1.0,
};

const objectGunung = {
  x: 0 ,
  y: 0,
  rotation: 0.0,
  scaleX: 1,
  scaleY: 1.0,
}

const objectsPadi = [
  { x: 0.23, y: -0.15 },
  { x: 0.3, y: -0.35 },
  { x: 0.4, y: -0.55 },
  { x: 0.51, y: -0.75 },

  { x: 0.47, y: -0.15 },
  { x: 0.61, y: -0.35 },
  { x: 0.64, y: -0.55 },
  { x: 0.68, y: -0.75 },

  { x: 0.7, y: -0.15 },
  { x: 0.81, y: -0.35 },
  { x: 0.82, y: -0.55 },
  { x: 0.84, y: -0.75 },
];

const colorA = new Float32Array([0.1, 0.75, 1.0, 1.0]);
const colorB = new Float32Array([1.0, 0.55, 0.1, 1.0]);
const colorC = new Float32Array([0, 0, 0, 1.0]);

const keys = {};
const positionInfo = document.getElementById("positionInfo");
const rotationInfo = document.getElementById("rotationInfo");
const scaleInfo = document.getElementById("scaleInfo");
const orderInfo = document.getElementById("orderInfo");

let transformOrder = "TRS";
let lastTime = 0;

function resetObjectA() {
  objectA.x = -0.35;
  objectA.y = 0.0;
  objectA.rotation = 0.0;
  objectA.scaleX = 1.0;
  objectA.scaleY = 1.0;
}

function resetObject1() {
  objectA.x = -0.4;
  objectA.y = 0.2;
  objectA.rotation = 0.0;
  objectA.scaleX = 1.0;
  objectA.scaleY = 1.0;
}

function resetObject2() {
  objectA.x = 0.0;
  objectA.y = 0.0;
  objectA.rotation = 45;
  objectA.scaleX = 1.5;
  objectA.scaleY = 1.5;
}

function resetObject3() {
  objectA.x = 0.30;
  objectA.y = -0.2;
  objectA.rotation = 90;
  objectA.scaleX = 1.8;
  objectA.scaleY = 0.6;
}

function clampObjectA() {
  objectA.x = Math.max(-0.8, Math.min(0.8, objectA.x));
  objectA.y = Math.max(-0.75, Math.min(0.75, objectA.y));
  objectA.scaleX = Math.max(0.2, Math.min(2.5, objectA.scaleX));
  objectA.scaleY = Math.max(0.2, Math.min(2.5, objectA.scaleY));
}

function updateTranslation(dt) {
  const moveSpeed = 0.65;

  if (keys["arrowleft"]) objectA.x -= moveSpeed * dt;
  if (keys["arrowright"]) objectA.x += moveSpeed * dt;
  if (keys["arrowup"]) objectA.y += moveSpeed * dt;
  if (keys["arrowdown"]) objectA.y -= moveSpeed * dt;
}

function updateRotation(dt) {
  const rotationSpeed = 100.0;

  if (keys["q"]) objectA.rotation -= rotationSpeed * dt;
  if (keys["e"]) objectA.rotation += rotationSpeed * dt;
}

function updateUniformScale(dt) {
  const scaleSpeed = 0.8;

  if (keys["+"] || keys["="]) {
    objectA.scaleX += scaleSpeed * dt;
    objectA.scaleY += scaleSpeed * dt;
  }

  if (keys["-"] || keys["_"]) {
    objectA.scaleX -= scaleSpeed * dt;
    objectA.scaleY -= scaleSpeed * dt;
  }
}

function updateNonUniformScale(dt) {
  const scaleSpeed = 0.8;

  if (keys["z"]) objectA.scaleX -= scaleSpeed * dt;
  if (keys["x"]) objectA.scaleX += scaleSpeed * dt;
  if (keys["c"]) objectA.scaleY -= scaleSpeed * dt;
  if (keys["v"]) objectA.scaleY += scaleSpeed * dt;
}

function update(dt) {
  updateTranslation(dt);
  updateRotation(dt);
  updateUniformScale(dt);
  updateNonUniformScale(dt);
  clampObjectA();
}

function updateHUD() {
  positionInfo.textContent = `(${objectA.x.toFixed(2)}, ${objectA.y.toFixed(2)})`;
  rotationInfo.textContent = `${objectA.rotation.toFixed(1)}°`;
  scaleInfo.textContent = `(${objectA.scaleX.toFixed(2)}, ${objectA.scaleY.toFixed(2)})`;

  orderInfo.textContent =
    transformOrder === "TRS"
      ? "Scale → Rotate → Translate"
      : "Translate → Rotate";
}

function drawObject(matrix, color, idx) {
  gl.uniformMatrix3fv(matrixLocation, false, matrix);
  gl.uniform4fv(colorLocation, color);
  gl.drawArrays(gl.TRIANGLES, idx, 3);
}

function drawRectacle(matrix, color,idx) {
  gl.uniformMatrix3fv(matrixLocation, false, matrix);
  gl.uniform4fv(colorLocation, color);
  gl.drawArrays(gl.LINE_LOOP, idx, 4);
}

// function drawRectacle(matrix, color,idx, vertic) {
//   gl.uniformMatrix3fv(matrixLocation, false, matrix);
//   gl.uniform4fv(colorLocation, color);
//   gl.drawArrays(gl.LINE_LOOP, idx, vertic);
// }

function drawLine(matrix, color,idx, vertic) {
  gl.uniformMatrix3fv(matrixLocation, false, matrix);
  gl.uniform4fv(colorLocation, color);
  gl.drawArrays(gl.LINE_STRIP, idx, vertic);
}

function createObjectBMatrix(seconds) {
  const rotation = seconds * 70.0;
  const scale = 1.0 + Math.sin(seconds * 2.0) * 0.25;

  const transformB = {
    x: 0.42,
    y: 0.0,
    rotation,
    scaleX: scale,
    scaleY: scale,
  };

  return createTRSMatrix(transformB);
}

function getObjectAMatrix() {
  if (transformOrder === "TRS") {
    return createTRSMatrix(objectA);
  }

  return createRTMatrix(objectA);
}

function getObjectCMatrix(objectC) {
  if (transformOrder === "TRS") {
    return createTRSMatrix(objectC);
  }

  return createRTMatrix(objectC);
}

function drawScene(seconds) {
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1.00, 1.00, 1.00, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);

  const matrixA = getObjectAMatrix();
  const matrixB = createObjectBMatrix(seconds);
  const matrixC = getObjectCMatrix(objectC);
  const matrixgunung = getObjectCMatrix(objectGunung);

  // drawObject(matrixA, colorA);
  // drawObject(matrixB, colorB);
  // drawRectacle(matrixC, colorC, 2);
  drawObject(matrixgunung, colorC, 6);
  drawObject(matrixgunung, colorC, 9);
  drawLine(matrixgunung, colorC, 12, 3);

  
  for (const padi of objectsPadi) {
    const matrixPadi = createTRSMatrix({
      x: padi.x,
      y: padi.y,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    });
    
    drawLine(matrixPadi, colorC, 15, 3);
  }

  // rumah
  drawRectacle(matrixA, colorC, 18);
  drawRectacle(matrixA, colorC, 20);
  drawObject(matrixA, colorC, 24);
  drawRectacle(matrixA, colorC, 25);
}

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  keys[key] = true;

  if (event.key.startsWith("Arrow")) {
    event.preventDefault();
  }

  if (key === "r" && !event.repeat) {
    resetObjectA();
  }
  if (key === "1" && !event.repeat) {
    resetObject1();
  }
  if (key === "2" && !event.repeat) {
    resetObject2();
  }
  if (key === "3" && !event.repeat) {
    resetObject3();
  }

  if (key === "t" && !event.repeat) {
    transformOrder = transformOrder === "TRS" ? "RT" : "TRS";
  }
});

window.addEventListener("keyup", (event) => {
  keys[event.key.toLowerCase()] = false;
});

canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const pixelX = (event.clientX - rect.left) * (canvas.width / rect.width);
  const pixelY = (event.clientY - rect.top) * (canvas.height / rect.height);

  objectA.x = (pixelX / canvas.width) * 2 - 1;
  objectA.y = 1 - (pixelY / canvas.height) * 2;

  clampObjectA();
  updateHUD();
});

function render(time) {
  const seconds = time * 0.001;
  let dt = (time - lastTime) * 0.001;

  lastTime = time;
  dt = Math.min(dt, 0.05);

  update(dt);
  updateHUD();
  drawScene(seconds);

  requestAnimationFrame(render);
}

requestAnimationFrame(render);
