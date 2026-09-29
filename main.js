const canvas =
  document.getElementById("glCanvas");

const gl =
  canvas.getContext("webgl2");

if (!gl) {
  alert("WebGL2 tidak tersedia.");
  throw new Error(
    "WebGL2 tidak tersedia."
  );
}

// --------------------------------------------------
// Shader source
// --------------------------------------------------

const vertexShaderSource = `#version 300 es

in vec2 a_position;
in vec3 a_color;

out vec3 v_color;

void main() {
  gl_Position = vec4(
    a_position,
    0.0,
    1.0
  );

  gl_PointSize = 12.0;

  v_color = a_color;
}
`;

const fragmentShaderSource = `#version 300 es

precision highp float;

in vec3 v_color;

out vec4 outColor;

void main() {
  outColor = vec4(
    v_color,
    1.0
  );
}
`;

// --------------------------------------------------
// Helper: shader
// --------------------------------------------------

function createShader(
  gl,
  type,
  source
) {
  const shader =
    gl.createShader(type);

  gl.shaderSource(
    shader,
    source
  );

  gl.compileShader(shader);

  const success =
    gl.getShaderParameter(
      shader,
      gl.COMPILE_STATUS
    );

  if (!success) {
    const info =
      gl.getShaderInfoLog(shader);

    gl.deleteShader(shader);

    throw new Error(
      "Shader compile error:\n" +
      info
    );
  }

  return shader;
}

// --------------------------------------------------
// Helper: program
// --------------------------------------------------

function createProgram(
  gl,
  vertexShader,
  fragmentShader
) {
  const program =
    gl.createProgram();

  gl.attachShader(
    program,
    vertexShader
  );

  gl.attachShader(
    program,
    fragmentShader
  );

  gl.linkProgram(program);

  const success =
    gl.getProgramParameter(
      program,
      gl.LINK_STATUS
    );

  if (!success) {
    const info =
      gl.getProgramInfoLog(
        program
      );

    gl.deleteProgram(program);

    throw new Error(
      "Program link error:\n" +
      info
    );
  }

  return program;
}

// --------------------------------------------------
// Helper: buffer
// --------------------------------------------------

function createBuffer(
  gl,
  data,
  usage = gl.STATIC_DRAW
) {
  const buffer =
    gl.createBuffer();

  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    buffer
  );

  gl.bufferData(
    gl.ARRAY_BUFFER,
    data,
    usage
  );

  return buffer;
}

// --------------------------------------------------
// Helper: attribute
// --------------------------------------------------

function setupAttribute(
  gl,
  buffer,
  location,
  size
) {
  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    buffer
  );

  gl.enableVertexAttribArray(
    location
  );

  gl.vertexAttribPointer(
    location,
    size,
    gl.FLOAT,
    false,
    0,
    0
  );
}

// --------------------------------------------------
// Compile + link
// --------------------------------------------------

const vertexShader =
  createShader(
    gl,
    gl.VERTEX_SHADER,
    vertexShaderSource
  );

const fragmentShader =
  createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
  );

const program =
  createProgram(
    gl,
    vertexShader,
    fragmentShader
  );

// --------------------------------------------------
// Attribute locations
// --------------------------------------------------

const positionLocation =
  gl.getAttribLocation(
    program,
    "a_position"
  );

const colorLocation =
  gl.getAttribLocation(
    program,
    "a_color"
  );

// --------------------------------------------------
// Vertex data
// --------------------------------------------------

const basePositions = 
  new Float32Array([
    // garis horizontal
    -1, 0.20,
    1, 0.20,

    -0.95, 0.20,
    -0.50, 0.70,
    -0.05, 0.20
  ]);

const positions =
 new Float32Array(
    basePositions
);

const colors = new Float32Array([
    0.0, 0.0, 0.0,
    0.0, 0.0, 0.0,

    0.0, 0.0, 0.0,
    0.0, 0.0, 0.0,
    0.0, 0.0, 0.0
]);

// --------------------------------------------------
// Buffers
// --------------------------------------------------

const positionBuffer =
  createBuffer(
    gl,
    positions,
    gl.DYNAMIC_DRAW
  );

const colorBuffer =
  createBuffer(
    gl,
    colors,
    gl.STATIC_DRAW
  );

// --------------------------------------------------
// Update
// --------------------------------------------------

function uploadPositions() {
  gl.bindBuffer(
    gl.ARRAY_BUFFER,
    positionBuffer
  );

  gl.bufferData(
    gl.ARRAY_BUFFER,
    positions,
    gl.DYNAMIC_DRAW
  );
}

function drawScene() {
  gl.viewport(
    0,
    0,
    canvas.width,
    canvas.height
  );

  gl.clearColor(
    1.0,
    1.0,
    1.0,
    1.0
  );

  gl.clear(
    gl.COLOR_BUFFER_BIT
  );

  gl.useProgram(program);

  setupAttribute(
    gl,
    positionBuffer,
    positionLocation,
    2
  );

  setupAttribute(
    gl,
    colorBuffer,
    colorLocation,
    3
  );

  // Line
  gl.drawArrays(
    gl.LINES,
    0,
    2
  );

  gl.drawArrays(
    gl.TRIANGLES,
    2,
    3
  );
}


// --------------------------------------------------
// Rendering loop
// --------------------------------------------------

let previousTime = 0;

function render(currentTime) {
  const timeInSeconds =
    currentTime * 0.001;

  const deltaTime =
    Math.min(
      timeInSeconds -
      previousTime,
      0.05
    );

  previousTime =
    timeInSeconds;

  // State-based input dibaca setiap frame.
//   handleInput(
//     deltaTime
//   );

//   if (!isPaused) {
//     updateTriangle(
//       deltaTime
//     );
//   }

  uploadPositions();
  drawScene();

  requestAnimationFrame(
    render
  );
}

requestAnimationFrame(render);