// ... (kode sebelumnya)

// Define global variables
let gl;
let shaderProgram;
let buffers;
let rotation = 0.0;
let scaling = 1.0;
let isAnimating = true;

function main() {
    const canvas = document.getElementById('canvas');
    gl = canvas.getContext('webgl');

    if (!gl) {
        alert('WebGL tidak tersedia di browser Anda. Silakan coba browser lain.');
        return;
    }

    const vsSource = `
        attribute vec4 aVertexPosition;
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;

        void main(void) {
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        }
    `;

    const fsSource = `
        void main(void) {
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        }
    `;

    shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    buffers = initBuffers(gl);

    if (!shaderProgram || !buffers) {
        return;
    }

    // Interaction: Toggle animation with spacebar
    document.addEventListener('keydown', (event) => {
        if (event.code === 'Space') {
            isAnimating = !isAnimating;
        }
    });

    // Start the rendering loop
    requestAnimationFrame(render);
}

function initBuffers(gl) {
    // Create a buffer for the cube's vertex positions
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Define vertices for the "S" shape
    const vertices = [
        // Segmen atas huruf "S"
        -0.6, 0.4, 0.0,
        -0.2, 0.4, 0.0,
        -0.2, 0.3, 0.0,
        -0.6, 0.3, 0.0,
        
        // Segmen tengah atas huruf "S"
        -0.6, 0.3, 0.0,
        -0.5, 0.3, 0.0,
        -0.5, 0.1, 0.0,
        -0.6, 0.1, 0.0,
    
        // Segmen tengah bawah huruf "S"
        -0.6, 0.1, 0.0,
        -0.5, 0.1, 0.0,
        -0.5, 0.0, 0.0,
        -0.6, 0.0, 0.0,
    
        // Segmen bawah huruf "S"
        -0.6, 0.0, 0.0,
        -0.2, 0.0, 0.0,
        -0.2, -0.1, 0.0,
        -0.6, -0.1, 0.0,
        
        // Titik tengah huruf "S"
        -0.4, 0.2, 0.0
    ];
    
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    return {
        position: positionBuffer,
    };
}

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    if (!vertexShader || !fragmentShader) {
        return null;
    }

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Gagal menginisialisasi program shader: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    gl.useProgram(shaderProgram);

    return shaderProgram;
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Gagal mengkompilasi shader: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function drawScene(gl, programInfo, buffers) {
    // Clear the canvas
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set up perspective matrix
    const fieldOfView = 45 * Math.PI / 180;
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    // Set up model-view matrix
    const modelViewMatrix = mat4.create();
    mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -5.0]);
    mat4.rotate(modelViewMatrix, modelViewMatrix, rotation, [0, 1, 0]);
    mat4.scale(modelViewMatrix, modelViewMatrix, [scaling, scaling, scaling]);

    // Specify the shader program to use
    gl.useProgram(programInfo.program);

    // Set the shader uniforms
    gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

    // Bind the vertex buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);

    // Tell WebGL how to get the positions from the buffer
    gl.vertexAttribPointer(
        programInfo.attribLocations.vertexPosition,
        3,          // size (3 components per iteration)
        gl.FLOAT,   // type
        false,      // normalize
        0,          // stride
        0           // offset
    )

    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

    // Draw the object
    const offset = 0;
    const vertexCount = vertices.length / 3; // Define the number of vertices
    gl.drawArrays(gl.TRIANGLES, offset, vertexCount);
}

function render() {
    if (isAnimating) {
        rotation += 0.01;
    }

    drawScene(gl, shaderProgram, buffers);

    requestAnimationFrame(render);
}

// Start the main function
main();
