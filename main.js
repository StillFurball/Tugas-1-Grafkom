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


const circleSegments = 40;
const circleVertices = [0.72, 0.78]; // center

for (let i = 0; i <= circleSegments; i++) {
  const angle = (i / circleSegments) * Math.PI * 2;
  circleVertices.push(
    0.72 + Math.cos(angle) * 0.12,
    0.78 + Math.sin(angle) * 0.18
  );
}

// Wings raised: V
const wingsRaised = [
  -0.16, 0.12,
   0.00, 0.00,
   0.16, 0.12,
];

// Wings flat: ----
const wingsFlat = [
  -0.16, 0.00,
   0.00, 0.00,
   0.16, 0.00,
];

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

  // jendela rumah kanan
  -0.28, -0.72,
  -0.22, -0.72,
  -0.22, -0.64,
  -0.28, -0.64,

  // pintu rumah kanan
  -0.19, -0.80,
  -0.12, -0.80,
  -0.12, -0.64,
  -0.19, -0.64,

  // tiga jendela rumah kiri
  -0.58, -0.617,
  -0.52, -0.627,
  -0.52, -0.707,
  -0.58, -0.697,

  -0.49, -0.632,
  -0.43, -0.642,
  -0.43, -0.722,
  -0.49, -0.712,

  -0.40, -0.647,
  -0.34, -0.657,
  -0.34, -0.737,
  -0.40, -0.727,

  
  ...circleVertices,
  ...wingsRaised,
  ...wingsFlat,

]);

const circleStart =
  (vertices.length - circleVertices.length - wingsRaised.length - wingsFlat.length) / 2;



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

const objectBird1 = {
  x: 0.8 ,
  y: .8,
  rotation: 0.0,
  scaleX: 1,
  scaleY: 1.0,
}

const objectBird2 = {
  x: -1.5,
  y: .9,
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

const sunCycle = {
  bottomY: -1.3,
  topY: 0.08,
  speed: 0.22,
};

const objectMatahari = {
  x: -0.77 ,
  y: sunCycle.bottomY,
  rotation: 0.0,
  scaleX: 1,
  scaleY: 1.0,
}

const objectGround = {
  x: 0.2,
  y: 0.622,
  rotation: 0.0,
  scaleX: 20  ,
  scaleY: 9,
}

const colorA = new Float32Array([0.1, 0.75, 1.0, 1.0]);
const colorB = new Float32Array([1.0, 0.55, 0.1, 1.0]);
const colorC = new Float32Array([0, 0, 0, 1.0]);
const coklat = new Float32Array([0.48, 0.22, 0.16,1.0])
const kuning = new Float32Array([1.0, 1.0, 0.05, 1.0])
const biru_langit = new Float32Array([0.42, 0., 0.02, 1.0])
const ijo_tanah = new Float32Array([0.56, 1.0, 0.34, 1.0])
const colorHouse = new Float32Array([1, 1, 1, 1.0]);
const colorRoof = new Float32Array([1, 0, 0, 1.0]);
const colorDoorWindow = new Float32Array([1.0, 0.95, 0.65, 1.0]);
const colorRoad = new Float32Array([0.3, 0.3, 0.4, 1.0]);


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

function updateSun(dt) {
  objectMatahari.y += sunCycle.speed * dt;
  objectMatahari.x += sunCycle.speed * 0.1 * dt;

  if (objectMatahari.y > sunCycle.topY+0.2) {
    objectMatahari.y = sunCycle.bottomY;
  } 
}

function getSkyColor() {
  const progress = Math.max(
    0,
    Math.min(1, (objectMatahari.y - sunCycle.bottomY) / (sunCycle.topY - sunCycle.bottomY))
  );
  const skyColors = [
    [0.035, 0.08, 0.22],
    [0.18, 0.20, 0.40],
    [0.65, 0.30, 0.38],
    [0.95, 0.48, 0.33],
    [0.60, 0.65, 0.75],
    [0.42, 0.78, 0.94],
  ];
  const colorIndex = Math.min(
    skyColors.length - 1,
    Math.floor(progress * skyColors.length)
  );

  return skyColors[colorIndex];
}

function drawObject3(matrix, color, idx) {
  gl.uniformMatrix3fv(matrixLocation, false, matrix);
  gl.uniform4fv(colorLocation, color);
  gl.drawArrays(gl.LINE_LOOP, idx, 3);
}

function drawFilledObject3(matrix, color, idx) {
  gl.uniformMatrix3fv(matrixLocation, false, matrix);
  gl.uniform4fv(colorLocation, color);
  gl.drawArrays(gl.TRIANGLE_FAN, idx, 3);
}

function drawFilledRectacle(matrix, color, idx) {
  gl.uniformMatrix3fv(matrixLocation, false, matrix);
  gl.uniform4fv(colorLocation, color);
  gl.drawArrays(gl.TRIANGLE_FAN, idx, 4);
}


function update(dt) {
  updateTranslation(dt);
  updateRotation(dt);
  updateUniformScale(dt);
  updateNonUniformScale(dt);
  updateSun(dt);
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

function drawFilledSquare(matrix, color, idx) {
  gl.uniformMatrix3fv(matrixLocation, false, matrix);
  gl.uniform4fv(colorLocation, color);
  gl.drawArrays(gl.TRIANGLE_FAN, idx, 4);
}

function drawCircle(matrix, color, first, count) {
  gl.uniformMatrix3fv(matrixLocation, false, matrix);
  gl.uniform4fv(colorLocation, color);
  gl.drawArrays(gl.TRIANGLE_FAN, first, count);
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
  gl.clearColor(...getSkyColor(), 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.useProgram(program);

  const matrixA = getObjectAMatrix();
  const matrixB = createObjectBMatrix(seconds);
  const matrixC = getObjectCMatrix(objectC);
  const matrixgunung = getObjectCMatrix(objectGunung);
  const matrixMatahari = getObjectCMatrix(objectMatahari);
  const matrixGround = getObjectCMatrix(objectGround);
  const matrixBird1 = createTRSMatrix({
      x: objectBird1.x,
      y: objectBird1.y,
      rotation: 0,
      scaleX: 0.8,
      scaleY: 0.8,
    });
  const matrixBird2 = createTRSMatrix({
      x: objectBird2.x,
      y: objectBird2.y,
      rotation: 0,
      scaleX: 0.6,
      scaleY: 0.6,
    });


  const raisedWing = circleStart + circleVertices.length / 2;
  const flatWing = raisedWing + wingsRaised.length / 2;
  
  let usedWingType = raisedWing
  // console.log(parseInt(seconds))
  let second_wing_pos = 1
  if (parseInt(seconds) % 2  === 0) {
    console.log("h")
    usedWingType = raisedWing
  } else {
    usedWingType = flatWing
  }
  // drawObject(matrixA, colorA);
  // drawObject(matrixB, colorB);
  // drawRectacle(matrixC, colorC, 2);


  // matahari
  drawCircle(matrixMatahari, kuning, circleStart, circleVertices.length / 2);
  

  // burung
  drawLine(matrixBird1, colorC, usedWingType, 3);
  drawLine(matrixBird2, colorC, usedWingType, 3);

  //tanah
  drawFilledSquare(matrixGround, ijo_tanah, 18);

  // gunung
  drawObject(matrixgunung, coklat, 6);
  drawObject(matrixgunung, coklat, 9);
  drawLine(matrixgunung, coklat, 12, 3);

  // padi
  for (const padi of objectsPadi) {
    const matrixPadi = createTRSMatrix({
      x: padi.x,
      y: padi.y,
      rotation: 0,
      scaleX: 0.5,
      scaleY: 0.5,
    });
    
    drawLine(matrixPadi, colorC, 15, 3);


    
  }


  // rumah
  drawFilledRectacle(matrixA, colorHouse, 18);
  drawFilledRectacle(matrixA, colorHouse, 20);
  drawRectacle(matrixA, colorC, 18);
  drawRectacle(matrixA, colorC, 20);
  drawObject3(matrixA, colorC, 24);
  drawFilledObject3(matrixA, colorRoof, 24);
  drawRectacle(matrixA, colorC, 25);
  drawFilledRectacle(matrixA, colorRoof, 25);

  // pintu dan jendela
  for (const index of [29, 33, 37, 41, 45]) {
    drawFilledRectacle(matrixA, colorDoorWindow, index);
    drawRectacle(matrixA, colorC, index);
  }



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
