// 2.js (c)
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute float a_select;\n' +
  'attribute vec4 a_normal;\n' +
  'uniform mat4 u_mvpMatrix;\n' +
  'uniform float u_pointSize;\n' +
  'uniform float u_pointSizeSelect;\n' +
  'uniform vec4 u_color;\n' +
  'uniform vec4 u_colorSelect;\n' +
  'varying vec4 v_color;\n' +
  'varying vec4 v_normal;\n' +
  'varying vec4 v_position;\n' +
  'void main() {\n' +
  '  gl_Position = u_mvpMatrix * a_Position;\n' +
  '  if (a_select != 0.0)\n' +
  '  {\n' +
  '    v_color = u_colorSelect;\n' +
  '    gl_PointSize = u_pointSizeSelect;\n' +
  '  }\n' +
  '  else\n' +
  '  {\n' +
  '    v_color = u_color;\n' +
  '    gl_PointSize = u_pointSize;\n' +
  '  }\n' +
  '  v_normal = a_normal;\n' +
  '  v_position = a_Position;\n' +
'}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'varying vec4 v_color;\n' +
  'varying vec4 v_normal;\n' +
  'varying vec4 v_position;\n' +
  'uniform bool u_drawPolygon;\n' +
  'uniform vec3 u_LightColor;\n' +     // Light color
  'uniform vec4 u_LightPosition;\n' + // Position of the light source (in the world coordinate system)
  'uniform vec3 u_AmbientLight;\n' +   // Color of an ambient light
  'uniform vec3 u_colorAmbient;\n' +
  'uniform vec3 u_colorSpec;\n' +
  'uniform float u_shininess;\n' +
  'void main() {\n' +
  '  if (u_drawPolygon) {\n' +
       // Make the length of the normal 1.0
  '    vec3 normal =  normalize(gl_FrontFacing ? v_normal.xyz : -v_normal.xyz);\n' +
      // Calculate the light direction and make it 1.0 in length
  '    vec3 lightDirection = normalize(vec3(u_LightPosition - v_position));\n' +
       // Dot product of the light direction and the orientation of a surface (the normal)
  '    float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
       // Calculate the color due to diffuse reflection
  '    vec3 diffuse = u_LightColor * v_color.rgb * nDotL;\n' +
       // Calculate the color due to ambient reflection
  '    vec3 ambient = u_AmbientLight * u_colorAmbient;\n' +
  '    vec3 r = reflect( -lightDirection, normal );\n' +
  '    vec3 spec = vec3(0.0);\n'+
  '    if( nDotL > 0.0 )\n' +
  '      spec = u_LightColor * u_colorSpec *\n' +
  '             pow( max( dot(r,lightDirection), 0.0 ), u_shininess );\n' +
  '    \n'+
       // Add the surface colors due to diffuse reflection and ambient reflection
  '    gl_FragColor = vec4(spec + diffuse + ambient, v_color.a);\n' +
  '  } else {\n' +
  '    gl_FragColor = v_color;\n' +
  '  }\n' +
 '}\n';

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  var viewport = [0, 0, canvas.width, canvas.height];
  gl.viewport(viewport[0], viewport[1], viewport[2], viewport[3]);

  var Xmin = document.getElementById("Xmin");
  var Xmax = document.getElementById("Xmax");
  var Ymin = document.getElementById("Ymin");
  var Ymax = document.getElementById("Ymax");
  var Z = document.getElementById("Z");
  var N_ctr = document.getElementById("N_ctr");
  var M_ctr = document.getElementById("M_ctr");
  var N = document.getElementById("N");
  var M = document.getElementById("M");
  var alpha = document.getElementById("alpha");
  var uniformParam = document.getElementById("uniformParam");
  var distanceParam = document.getElementById("distanceParam");

  Data.init(gl, viewport, eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Z.value),
      N_ctr, M_ctr, N, M, uniformParam, distanceParam, alpha);

  canvas.onmousemove = function (ev) { mousemove(ev, canvas); };

  canvas.onmousedown = function (ev) { mousedown(ev, canvas); };

  canvas.onmouseup = function (ev) { mouseup(ev, canvas); };

  (function () {

      function handleMouseWheel(event) {
          event = EventUtil.getEvent(event);
          var delta = EventUtil.getWheelDelta(event);
          Data.mousewheel(delta);
      }

      EventUtil.addHandler(document, "mousewheel", handleMouseWheel);
      EventUtil.addHandler(document, "DOMMouseScroll", handleMouseWheel);

  })();

  var lineSurfaceSpline = document.getElementById("chkLineSurfaceSpline");
  var brokenLines = document.getElementById("chkBrokenLines");
  var visualizeSplineWithPoints = document.getElementById("chkVisualizeWithPoints");
  var visualizeSplineWithLines = document.getElementById("chkVisualizeWithLines");
  var visualizeSplineWithSurface = document.getElementById("chkVisualizeWithSurface");

  lineSurfaceSpline.onclick = function () { Data.plotMode(1); };
  visualizeSplineWithPoints.onclick = function () { Data.plotMode(4); };
  visualizeSplineWithLines.onclick = function () { Data.plotMode(5); };
  visualizeSplineWithSurface.onclick = function () { Data.plotMode(6); };

  Xmin.onchange = function () {
      Data.setDependentGeomParameters(
          eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Z.value));
      Data.generateControlPoints(N_ctr.value, M_ctr.value,
          eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Z.value));
  };
  Xmax.onchange = function () {
      Data.setDependentGeomParameters(
          eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Z.value));
      Data.generateControlPoints(N_ctr.value, M_ctr.value,
          eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Z.value));
  };
  Ymin.onchange = function () {
      Data.setDependentGeomParameters(
          eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Z.value));
      Data.generateControlPoints(N_ctr.value, M_ctr.value,
          eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Z.value));
  };
  Ymax.onchange = function () {
      Data.setDependentGeomParameters(
          eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Z.value));
      Data.generateControlPoints(N_ctr.value, M_ctr.value,
          eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Z.value));
  };
  Z.onchange = function () {
      Data.setDependentGeomParameters(
          eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Z.value));
      Data.generateControlPoints(N_ctr.value, M_ctr.value,
          eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Z.value));
  };
  N_ctr.onchange = function () {
      Data.generateControlPoints(N_ctr.value, M_ctr.value,
          eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Z.value));
  };
  M_ctr.onchange = function () {
      Data.generateControlPoints(N_ctr.value, M_ctr.value,
          eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Z.value));
  };
  N.onchange = function () { Data.plotMode(2); };
  M.onchange = function () { Data.plotMode(2); };
  alpha.onchange = function () { Data.plotMode(0); };
  uniformParam.onclick = function () { Data.plotMode(2); };
  distanceParam.onclick = function () { Data.plotMode(2); };
  brokenLines.onclick = function () { Data.plotMode(3); };
   
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.DEPTH_TEST);

  // Specify the color for clearing <canvas>
  gl.clearColor(0.8, 0.8, 0.8, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  Data.generateControlPoints(N_ctr.value, M_ctr.value,
      eval(Xmin.value), eval(Xmax.value), eval(Ymin.value), eval(Ymax.value), eval(Z.value));
}

function project(obj, mvpMatrix, viewport){
    var win = vec4.transformMat4(vec4.create(), obj, mvpMatrix);

    if (win[3] == 0.0) 
        return;

    win[0] /= win[3];
    win[1] /= win[3];
    win[2] /= win[3];

    win[0] = win[0] * 0.5 + 0.5;
    win[1] = win[1] * 0.5 + 0.5;
    win[2] = win[2] * 0.5 + 0.5;

    win[0] = viewport[0] + win[0] * viewport[2];
    win[1] = viewport[1] + win[1] * viewport[3];

    return win;
}

function unproject(win, modelView, projection, viewport) {

    var invertMV = mat4.invert(mat4.create(), modelView);
    var invertP = mat4.invert(mat4.create(), projection);

    var invertMVP = mat4.multiply(mat4.create(), invertMV, invertP);

    win[0] = (win[0] - viewport[0]) / viewport[2];
    win[1] = (win[1] - viewport[1]) / viewport[3];

    win[0] = win[0] * 2 - 1;
    win[1] = win[1] * 2 - 1;
    win[2] = win[2] * 2 - 1;

    var obj = vec4.transformMat4(vec4.create(), win, invertMVP);
    
    if (obj[3] == 0.0) 
        return;

    obj[0] /= obj[3];
    obj[1] /= obj[3];
    obj[2] /= obj[3];

    return obj;
}

function Point(x,y,z) {
    this.select = false;
    // ДОБАВИТЬ ПАРАМЕТРИЧЕСКИЕ КООРДИНАТЫ t и tau
    this.t = 0;
    this.tau = 0;
    this.x = x;
    this.y = y;
    this.z = z;
    this.winx = 0.0;
    this.winz = 0.0;
    this.winy = 0.0;
    //this.setRect();
}

Point.prototype = {
    setRect: function () {
        this.left = this.winx - 5;
        this.right = this.winx + 5;
        this.bottom = this.winy - 5;
        this.up = this.winy + 5;
    },
    calculateWindowCoordinates: function(mvpMatrix, viewport) {
        var worldCoord = vec4.fromValues(this.x,this.y,this.z,1.0);

        //------------Get window coordinates of point-----------
        var winCoord = project(worldCoord, mvpMatrix, viewport);
        winCoord[1] = (winCoord[1]); // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

        this.winx = winCoord[0];
        this.winy = winCoord[1];
        this.winz = winCoord[2];

        this.setRect();//create a bounding rectangle around point
    },
    ptInRect(x, y) {
        var inX = this.left <= x && x <= this.right;
        var inY = this.bottom <= y && y <= this.up;
        return inX && inY;
    }
}

var Camera = {
    //cartesian coordinates
    x0: 0.0,
    y0: 0.0,
    z0: 0.0,
    //spherical coordinates
    r: 0.0,
    theta: 0.0,
    phi: 0.0,
    //initial spherical coordinates
    r_0: 0.0,
    theta_0: 0.0,
    phi_0: 0.0,
    //point the viewer is looking at
    x_ref: 0.0,
    y_ref: 0.0,
    z_ref: 0.0,
    //up vector
    Vx: 0.0,
    Vy: 0.0,
    Vz: 0.0,
    //view volume bounds
    xw_min: 0.0,
    xw_max: 0.0,
    yw_min: 0.0,
    yw_max: 0.0,
    d_near: 0.0,
    d_far: 0.0,
    convertFromCartesianToSpherical: function () {
        var R = this.r + this.r_0;
        var Theta = this.theta + this.theta_0;
        var Phi = this.phi + this.phi_0;

        this.convertFromCartesianToSphericalCoordinates(R, Theta, Phi);

        this.Vx = -R * Math.cos(Theta) * Math.cos(Phi);
        this.Vy = -R * Math.cos(Theta) * Math.sin(Phi);
        this.Vz = R * Math.sin(Theta);

        this.xw_min = -R;
        this.xw_max = R;
        this.yw_min = -R;
        this.yw_max = R;
        this.d_near = 0.0;
        this.d_far = 2 * R;
    },
    convertFromCartesianToSphericalCoordinates: function (r, theta, phi) {
        this.x0 = r * Math.sin(theta) * Math.cos(phi);
        this.y0 = r * Math.sin(theta) * Math.sin(phi);
        this.z0 = r * Math.cos(theta);
    },
    normalizeAngle: function (angle) {
        var lAngle = angle;
        while (lAngle < 0)
            lAngle += 360 * 16;
        while (lAngle > 360 * 16)
            lAngle -= 360 * 16;

        return lAngle;
    },
    getLookAt: function (r, theta, phi) {
        this.r = r;
        this.phi = glMatrix.toRadian(phi / 16.0);
        this.theta = glMatrix.toRadian(theta / 16.0);
        this.convertFromCartesianToSpherical();

        return mat4.lookAt(mat4.create(), 
            [Camera.x0, Camera.y0, Camera.z0], 
            [Camera.x_ref, Camera.y_ref, Camera.z_ref], 
            [Camera.Vx, Camera.Vy, Camera.Vz]);
    },
    getProjMatrix: function() {
        return mat4.ortho(mat4.create(), 
            this.xw_min, this.xw_max, this.yw_min, this.yw_max, this.d_near, this.d_far);
    }
}

var Data = {
    pointsCtr: [],
    indicesCtr: [],
    pointsSpline: [],
    indicesSplineLines: [],
    indicesSplineSurface: [],
    normalsSpline: [],
    count: 0,
    countAttribData: 4, //x,y,z,sel
    verticesCtr: {},
    verticesSpline: {},
    FSIZE: 0,
    ISIZE: 0,
    gl: null,
    vertexBufferCtr: null,
    indexBufferCtr:null,
    vertexBufferSpline: null,
    indexBufferSplineLines: null,
    indexBufferSplineSurface: null,
    a_Position: -1,
    a_select: -1,
    a_normal: -1,
    u_color: null,
    u_colorSelect: null,
    u_pointSize: null,
    u_pointSizeSelect: null,
    u_drawPolygon: false,
    u_mvpMatrix: null,
    u_LightColor: null,
    u_LightPosition: null,
    u_AmbientLight: null,
    u_colorAmbient: null,
    u_colorSpec: null,
    u_shininess: null,
    moveMode: false,
    iMove: -1,
    jMove: -1,
    leftButtonDown: false,
    drawBrokenLines: false,
    drawLineSurfaceSpline: false,
    visualizeSplineWithPoints: true,
    visualizeSplineWithLines: false,
    visualizeSplineWithSurface: false,
    uniformParam: null,
    distanceParam: null,
    N_ctr: null,
    M_ctr: null,
    N: null,
    M: null,
    alpha: null,
    //Area bounds
    Xmin: 0.0,
    Xmax: 3 * Math.PI,
    Ymin: 0.0,
    Ymax: 3 * Math.PI,
    Z: 1.5,
    Xmid: 0.0,
    Ymid: 0.0,
    //DX: 0.0,
    maxCountCtrPoints: 0,
    maxCountSplinePoints: 0,
    xRot: 0,
    yRot: 0,
    wheelDelta: 0.0,
    proj: mat4.create(),
    cam: mat4.create(),
    world: mat4.create(),
    viewport: [],
    lastPosX: 0,
    lastPosY: 0,
    init: function (gl, viewport, Xmin, Xmax, Ymin, Ymax, Z, N_ctr, M_ctr, N, M, uniformParam, distanceParam, alpha) {
        this.gl = gl;
        // Create a buffer object
        this.vertexBufferCtr = this.gl.createBuffer();
        if (!this.vertexBufferCtr) {
            console.log('Failed to create the buffer object for control points');
            return -1;
        }
        this.vertexBufferSpline = this.gl.createBuffer();
        if (!this.vertexBufferSpline) {
            console.log('Failed to create the buffer object for spline points');
            return -1;
        }

        this.indexBufferCtr = this.gl.createBuffer();
        if (!this.indexBufferCtr) {
            console.log('Failed to create the index object for control points');
            return -1;
        }

        this.indexBufferSplineLines = this.gl.createBuffer();
        if (!this.indexBufferSplineLines) {
            console.log('Failed to create the index object for control points');
            return -1;
        }

        this.indexBufferSplineSurface = this.gl.createBuffer();
        if (!this.indexBufferSplineSurface) {
            console.log('Failed to create the index object for control points');
            return -1;
        }

        this.a_Position = this.gl.getAttribLocation(this.gl.program, 'a_Position');
        if (this.a_Position < 0) {
            console.log('Failed to get the storage location of a_Position');
            return -1;
        }

        this.a_select = this.gl.getAttribLocation(this.gl.program, 'a_select');
        if (this.a_select < 0) {
            console.log('Failed to get the storage location of a_select');
            return -1;
        }

        this.a_normal = this.gl.getAttribLocation(this.gl.program, 'a_normal');
        if (this.a_normal < 0) {
            console.log('Failed to get the storage location of a_normal');
            return -1;
        }

        // Get the storage location of u_color
        this.u_color = this.gl.getUniformLocation(this.gl.program, 'u_color');
        if (!this.u_color) {
            console.log('Failed to get u_color variable');
            return;
        }

        // Get the storage location of u_colorSelect
        this.u_colorSelect = gl.getUniformLocation(this.gl.program, 'u_colorSelect');
        if (!this.u_colorSelect) {
            console.log('Failed to get u_colorSelect variable');
            return;
        }

        // Get the storage location of u_pointSize
        this.u_pointSize = gl.getUniformLocation(this.gl.program, 'u_pointSize');
        if (!this.u_pointSize) {
            console.log('Failed to get u_pointSize variable');
            return;
        }

        // Get the storage location of u_pointSize
        this.u_pointSizeSelect = gl.getUniformLocation(this.gl.program, 'u_pointSizeSelect');
        if (!this.u_pointSizeSelect) {
            console.log('Failed to get u_pointSizeSelect variable');
            return;
        }

        // Get the storage location of u_drawPolygon
        this.u_drawPolygon = this.gl.getUniformLocation(this.gl.program, 'u_drawPolygon');
        if (!this.u_drawPolygon) {
            console.log('Failed to get u_drawPolygon variable');
            return;
        }

        // Get the storage location of u_LightColor
        this.u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
        if (!this.u_LightColor) {
            console.log('Failed to get u_LightColor variable');
            return;
        }

        // Get the storage location of u_LightPosition
        this.u_LightPosition = gl.getUniformLocation(gl.program, 'u_LightPosition');
        if (!this.u_LightPosition) {
            console.log('Failed to get u_LightPosition variable');
            return;
        }

        // Get the storage location of u_AmbientLight
        this.u_AmbientLight = gl.getUniformLocation(gl.program, 'u_AmbientLight');
        if (!this.u_AmbientLight) {
            console.log('Failed to get u_AmbientLight variable');
            return;
        }

        // Get the storage location of u_colorAmbient
        this.u_colorAmbient = gl.getUniformLocation(gl.program, 'u_colorAmbient');
        if (!this.u_colorAmbient) {
            console.log('Failed to get u_colorAmbient variable');
            return;
        }

        // Get the storage location of u_colorSpec
        this.u_colorSpec = gl.getUniformLocation(gl.program, 'u_colorSpec');
        if (!this.u_colorSpec) {
            console.log('Failed to get u_colorSpec variable');
            return;
        }

        // Get the storage location of u_shininess
        this.u_shininess = gl.getUniformLocation(gl.program, 'u_shininess');
        if (!this.u_shininess) {
            console.log('Failed to get u_shininess variable');
            return;
        }

        this.u_mvpMatrix = gl.getUniformLocation(gl.program, 'u_mvpMatrix');
        if (!this.u_mvpMatrix) {
            console.log('Failed to get the storage location of u_mvpMatrix');
            return;
        }

        this.gl.uniform3f(this.u_LightColor, 1.0, 1.0, 1.0);
        // Set the ambient light
        this.gl.uniform3f(this.u_AmbientLight, 0.2, 0.2, 0.2);
        // Set the material ambient color
        this.gl.uniform3f(this.u_colorSpec, 0.2313, 0.2313, 0.2313);
        // Set the material specular color
        this.gl.uniform3f(this.u_colorSpec, 0.7739, 0.7739, 0.7739);
        // Set the material shininess
        this.gl.uniform1f(this.u_shininess, 90);

        this.viewport = viewport;

        this.N_ctr = N_ctr;
        this.M_ctr = M_ctr;
        this.N = N;
        this.M = M;
        this.uniformParam = uniformParam;
        this.distanceParam = distanceParam;
        this.alpha = alpha;

        this.setDependentGeomParameters(Xmin, Xmax, Ymin, Ymax, Z);
    },
    setDependentGeomParameters: function (Xmin, Xmax, Ymin, Ymax, Z) {
        this.Xmid = Xmin + (Xmax - Xmin) / 2.0;
        this.Ymid = Ymin + (Ymax - Ymin) / 2.0;

        Camera.r_0 = Math.sqrt(Math.pow((Xmax - Xmin) / 2.0, 2) +
           Math.pow((Ymax - Ymin) / 2.0, 2) +
           Math.pow(Z, 2));

        this.resetCamera();
    },
    generateControlPoints: function (n, m, Xmin, Xmax, Ymin, Ymax, Z) {
        var x, y, z;

        this.clear();

        this.pointsCtr = new Array(n);
        for (var i = 0; i < n; i++)
            this.pointsCtr[i] = new Array(m);

        for (var i = 0; i < n; i++)
            for (var j = 0; j < m; j++)
            {
                x = Xmin + i * (Xmax - Xmin) / (n - 1) - this.Xmid;
                y = Ymin + j * (Ymax - Ymin) / (m - 1) - this.Ymid;
                z = Z * Math.sin(x) * Math.sin(y);

                this.add_coords(i, j, x, y, z);
            }

        this.add_vertices(n,m);
        this.FSIZE = this.verticesCtr.BYTES_PER_ELEMENT;

        this.createIndicesCtr(n, m);
        this.ISIZE = this.indicesCtr.BYTES_PER_ELEMENT;

        if (this.drawLineSurfaceSplines)
            this.calculateLineSurfaceSpline();

        this.setVertexBuffersAndDraw();
    },
    resetCamera: function () {
        this.xRot = 0;
        this.yRot = 0;
        this.wheelDelta = 0.0;
    },
    setLeftButtonDown: function(value){
        this.leftButtonDown = value;
    },
    add_coords: function (i, j, x, y, z) {
        var pt = new Point(x, y, z);
        this.pointsCtr[i][j] = pt;
        this.count += this.countAttribData;
    },
    createIndicesCtr: function(n,m) {
        var k = 0;
        this.indicesCtr = new Uint16Array(2 * n * m);

        for (var i = 0; i < n; i++)
        {
            for (var j = 0; j < m; j++)
                this.indicesCtr[k++] = i*m+j;
        }
        for (j = 0; j < m; j++)
        {
            for (i = 0; i < n; i++)
                this.indicesCtr[k++] = i*m+j;
        }
    },
    createIndicesSplineLines: function (n, m) {
        var k = 0;
        this.indicesSplineLines = new Uint16Array(2 * n * m);

        for (var i = 0; i < n; i++) {
            for (var j = 0; j < m; j++)
                this.indicesSplineLines[k++] = i * m + j;
        }
        for (j = 0; j < m; j++) {
            for (i = 0; i < n; i++)
                this.indicesSplineLines[k++] = i * m + j;
        }
    },
    createIndicesSplineSurface: function (n, m) {
        var k = 0;
        this.indicesSplineSurface = new Uint16Array(6 * (n-1) * (m-1));

        for (var i = 0; i < n-1; i++)
            for (var j = 0; j < m-1; j++) {
                this.indicesSplineSurface[k++] = i * m + j;
                this.indicesSplineSurface[k++] = (i+1) * m + j;
                this.indicesSplineSurface[k++] = i * m + j+1;
                this.indicesSplineSurface[k++] = i * m + j+1;
                this.indicesSplineSurface[k++] = (i + 1) * m + j;
                this.indicesSplineSurface[k++] = (i + 1) * m + j+1;
            }
    },
    setXRotation: function(angle)
    {
        var lAngle = Camera.normalizeAngle(angle);
        if (lAngle != this.xRot) {
            this.xRot = lAngle;
        }
    },
    setYRotation: function(angle)
    {
        var lAngle = Camera.normalizeAngle(angle);
        if (lAngle != this.yRot) {
            this.yRot = lAngle;
        }
    },
    mousemoveHandler: function (x, y) {
        if (this.leftButtonDown) {
            if (this.moveMode) {
                var winCoord = vec4.create();

                winCoord[0] = x;
                winCoord[1] = y;
                winCoord[2] = this.pointsCtr[this.iMove][this.jMove].winz;
                winCoord[3] = 1.0;

                var mvMatr = mat4.mul(mat4.create(), this.cam, this.world);

                var worldCoord = unproject(winCoord, mvMatr, this.proj, this.viewport);

                this.pointsCtr[this.iMove][this.jMove].x = worldCoord[0];
                this.pointsCtr[this.iMove][this.jMove].y = worldCoord[1];
                this.pointsCtr[this.iMove][this.jMove].z = worldCoord[2];

                this.verticesCtr[(this.iMove * this.M_ctr.value + this.jMove) * this.countAttribData] = this.pointsCtr[this.iMove][this.jMove].x;
                this.verticesCtr[(this.iMove * this.M_ctr.value + this.jMove) * this.countAttribData + 1] = this.pointsCtr[this.iMove][this.jMove].y;
                this.verticesCtr[(this.iMove * this.M_ctr.value + this.jMove) * this.countAttribData + 2] = this.pointsCtr[this.iMove][this.jMove].z;

                if (this.drawLineSurfaceSplines)
                    this.calculateLineSurfaceSpline();
            }
            else
            {
                var dx = x - this.lastPosX;
                var dy = y - this.lastPosY;

                this.setXRotation(this.xRot - 8 * dy);
                this.setYRotation(this.yRot + 8 * dx);

                this.lastPosX = x;
                this.lastPosY = y;
            }
            this.setVertexBuffersAndDraw();
        }
        else
            for (var i = 0; i < this.N_ctr.value; i++)
                for (var j = 0; j < this.M_ctr.value; j++) {
                    this.pointsCtr[i][j].select = false;

                    if (this.pointsCtr[i][j].ptInRect(x,y))
                        this.pointsCtr[i][j].select = true;

                    this.verticesCtr[(i * this.M_ctr.value + j) * this.countAttribData + 3] = this.pointsCtr[i][j].select;

                    this.setVertexBuffersAndDraw();
            }
    },
    mousedownHandler: function (button, x, y) {
        switch (button) {
            case 0: //left button
                this.moveMode = false;

                for (var i = 0; i < this.N_ctr.value; i++)
                    for (var j = 0; j < this.M_ctr.value; j++) {
                        if (this.pointsCtr[i][j].select == true) {
                            this.moveMode = true;
                            this.iMove = i;
                            this.jMove = j;
                        }
                    }

                if (!this.moveMode) {
                    this.lastPosX = x;
                    this.lastPosY = y;
                }

                this.setLeftButtonDown(true);
                break;
            case 2: //right button
                this.resetCamera();
                this.setVertexBuffersAndDraw();
                break;
        }
    },
    mouseupHandler: function (button, x, y) {
        if (button == 0) //left button
            this.setLeftButtonDown(false);
    },
    mousewheel: function (delta) {
        var d;
        d = Camera.r_0 * (-1.) * delta / 1000.0;
        if ((this.wheelDelta + d >= -Camera.r_0) && (this.wheelDelta + d <= Camera.r_0*3.0))
        {
            this.wheelDelta += d;
        }

        this.setVertexBuffersAndDraw();
    },
    clear: function () {
        this.count = 0;
    },
    add_vertices: function (n,m) {
        this.verticesCtr = new Float32Array(this.count);
        for (var i = 0; i < n; i++)
            for (var j = 0; j < m; j++) {
            this.verticesCtr[(i*m + j) * this.countAttribData] = this.pointsCtr[i][j].x;
            this.verticesCtr[(i*m + j) * this.countAttribData + 1] = this.pointsCtr[i][j].y;
            this.verticesCtr[(i*m + j) * this.countAttribData + 2] = this.pointsCtr[i][j].z;
            this.verticesCtr[(i*m + j) * this.countAttribData + 3] = this.pointsCtr[i][j].select;
        }
    },
    setVertexBuffersAndDraw: function () {
        var i,j;
        // Bind the buffer object to target
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBufferCtr);
        // Write date into the buffer object
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.verticesCtr, this.gl.DYNAMIC_DRAW);
        // Assign the buffer object to a_Position variable
        this.gl.vertexAttribPointer(this.a_Position, 3, this.gl.FLOAT, false, this.FSIZE*4, 0);
        // Enable the assignment to a_Position variable
        this.gl.enableVertexAttribArray(this.a_Position);
        // Assign the buffer object to a_select variable
        this.gl.vertexAttribPointer(this.a_select, 1, this.gl.FLOAT, false, this.FSIZE * 4, this.FSIZE * 3);
        // Enable the assignment to a_select variable
        this.gl.enableVertexAttribArray(this.a_select);
        // Disable the assignment to a_normal variable
        this.gl.disableVertexAttribArray(this.a_normal);

        this.cam = Camera.getLookAt(this.wheelDelta, this.xRot, this.yRot);
        this.proj = Camera.getProjMatrix();

        var mvMatr = mat4.mul(mat4.create(), this.cam, this.world);
        var mvpMatr = mat4.mul(mat4.create(), this.proj, mvMatr);
        this.gl.uniformMatrix4fv(this.u_mvpMatrix, false, mvpMatr);

        this.gl.uniform4f(this.u_color, 0.0, 0.0, 0.0, 1.0);
        this.gl.uniform4f(this.u_LightPosition, Camera.x0, Camera.y0, Camera.z0, 1.0);

        this.gl.uniform1f(this.u_drawPolygon, false);

        // Clear <canvas>
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.uniform4f(this.u_color, 0.0, 0.0, 0.0, 1.0);
        this.gl.uniform4f(this.u_colorSelect, 0.5, 0.5, 0.0, 1.0);
        this.gl.uniform1f(this.u_pointSize, 3.0);
        this.gl.uniform1f(this.u_pointSizeSelect, 7.0);

        for (i = 0; i < this.N_ctr.value; i++)
            for (j = 0; j < this.M_ctr.value; j++)
                this.pointsCtr[i][j].calculateWindowCoordinates(mvpMatr, this.viewport);

        // Draw
        this.gl.drawArrays(this.gl.POINTS, 0, this.count / this.countAttribData);
        if (this.drawBrokenLines) {
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBufferCtr);
            this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indicesCtr, this.gl.DYNAMIC_DRAW);

            this.gl.uniform4f(this.u_color, 0.0, 1.0, 0.0, 1.0);
            this.gl.uniform4f(this.u_colorSelect, 0.0, 1.0, 0.0, 1.0);

            for (i = 0; i < this.N_ctr.value; i++)
            {
                this.gl.drawElements(this.gl.LINE_STRIP, this.M_ctr.value, this.gl.UNSIGNED_SHORT, ((i * this.M_ctr.value) * this.ISIZE));
            }

            this.gl.uniform4f(this.u_color, 0.0, 0.0, 1.0, 1.0);
            this.gl.uniform4f(this.u_colorSelect, 0.0, 0.0, 1.0, 1.0);

            for (j = 0; j < this.M_ctr.value; j++) {
                this.gl.drawElements(this.gl.LINE_STRIP, this.N_ctr.value, this.gl.UNSIGNED_SHORT, ((this.N_ctr.value * this.M_ctr.value + j * this.N_ctr.value) * this.ISIZE));
            }
        }
        if (this.drawLineSurfaceSplines)
        {
            // Bind the buffer object to target
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBufferSpline);
            // Write date into the buffer object
            this.gl.bufferData(this.gl.ARRAY_BUFFER, this.verticesSpline, this.gl.DYNAMIC_DRAW);
            //var FSIZE = this.verticesSpline.BYTES_PER_ELEMENT;
            // Assign the buffer object to a_Position variable
            this.gl.vertexAttribPointer(this.a_Position, 3, this.gl.FLOAT, false, this.FSIZE * 6, 0);
            // Assign the buffer object to a_normal variable
            this.gl.vertexAttribPointer(this.a_normal, 3, this.gl.FLOAT, false, this.FSIZE * 6, this.FSIZE * 3);
            // Enable the assignment to a_Position variable
            this.gl.enableVertexAttribArray(this.a_Position);
            // Disable the assignment to a_select variable
            this.gl.disableVertexAttribArray(this.a_select);
            // Enable the assignment to a_normal variable
            this.gl.enableVertexAttribArray(this.a_normal);

            this.gl.uniform4f(this.u_color, 1.0, 0.0, 0.0, 1.0);
            this.gl.uniform1f(this.u_pointSize, 5.0);
            //points
            if (this.visualizeSplineWithPoints)
                this.gl.drawArrays(this.gl.POINTS, 0, this.N.value * this.M.value);
            //lines
            if (this.visualizeSplineWithLines) {
                this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBufferSplineLines);
                this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indicesSplineLines, this.gl.DYNAMIC_DRAW);

                this.gl.uniform4f(this.u_color, 0.0, 1.0, 1.0, 1.0);

                for (i = 0; i < this.N.value; i++) {
                    this.gl.drawElements(this.gl.LINE_STRIP, this.M.value, this.gl.UNSIGNED_SHORT, ((i * this.M.value) * this.ISIZE));
                }

                this.gl.uniform4f(this.u_color, 1.0, 0.0, 1.0, 1.0);

                for (j = 0; j < this.M.value; j++) {
                    this.gl.drawElements(this.gl.LINE_STRIP, this.N.value, this.gl.UNSIGNED_SHORT, ((this.N.value * this.M.value + j * this.N.value) * this.ISIZE));
                }
            }
            //surface
            if (this.visualizeSplineWithSurface) {
                this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBufferSplineSurface);
                this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indicesSplineSurface, this.gl.DYNAMIC_DRAW);

                this.gl.uniform1f(this.u_drawPolygon, true);
                this.gl.depthMask(false);
                this.gl.enable(this.gl.BLEND);
                this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
                this.gl.uniform4f(this.u_color, 0.2775, 0.2775, 0.2775, this.alpha.value);
                this.gl.drawElements(this.gl.TRIANGLES, 6 * (this.N.value - 1) * (this.M.value - 1), this.gl.UNSIGNED_SHORT, 0);
                this.gl.disable(this.gl.BLEND);
                this.gl.depthMask(true);
            }
        }
    },
    plotMode: function(selOption){
        switch (selOption)
        {
            case 1:
                this.drawLineSurfaceSplines = !this.drawLineSurfaceSplines;
                if (this.drawLineSurfaceSplines)
                {
                    this.calculateLineSurfaceSpline();
                }
                break;
            case 2:
                if (this.drawLineSurfaceSplines) {
                    this.calculateLineSurfaceSpline();
                }
                break;
            case 3:
                this.drawBrokenLines = !this.drawBrokenLines;
                break;
            case 4:
                this.visualizeSplineWithPoints = !this.visualizeSplineWithPoints;
                break;
            case 5:
                this.visualizeSplineWithLines = !this.visualizeSplineWithLines;
                break;
            case 6:
                this.visualizeSplineWithSurface = !this.visualizeSplineWithSurface;
                break;
        }
        this.setVertexBuffersAndDraw();
    },
    calculateLineSurfaceSpline: function(){

        var i, j,dt,dtau;

        var N_ctr = this.N_ctr.value;
        var M_ctr = this.M_ctr.value;
        var N = this.N.value;
        var M = this.M.value;

        // ДОБАВИТЬ ИНИЦИАЛИЗАЦИЮ ПАРАМЕТРИЧЕСКИХ КООРДИНАТ t и tau
        for (i = 0; i < N_ctr; i++) 
        {
			this.pointsCtr[i][0].tau = 0;
        	for (j = 1; j < M_ctr; j++)
        	{
              if (this.uniformParam.checked)
              {
                  this.pointsCtr[i][j].tau = this.pointsCtr[i][j-1].tau + 1;
              }
              if (this.distanceParam.checked)
              {
                  this.pointsCtr[i][j].tau = this.pointsCtr[i][j - 1].tau + Math.sqrt(Math.pow(this.pointsCtr[i][j].x - this.pointsCtr[i][j-1].x,2) + Math.pow(this.pointsCtr[i][j].y - this.pointsCtr[i][j-1].y,2) + Math.pow(this.pointsCtr[i][j].z - this.pointsCtr[i][j-1].z,2));
                  //this.pointsCtr[i][j].tau = this.pointsCtr[i][j - 1].tau + Math.hypot(this.pointsCtr[i][j].x - this.pointsCtr[i][j - 1].x, this.pointsCtr[i][j].y - this.pointsCtr[i][j - 1].y, this.pointsCtr[i][j].z - this.pointsCtr[i][j - 1].z);
              }
        	}
        }

        for (i = 1; i < N_ctr; i++)
        {
            for (j = 0; j < M_ctr; j++)
            {
				if (i==1)
				{
				this.pointsCtr[0][j].t = 0;
				}
				if (this.uniformParam.checked)
                {
                    this.pointsCtr[i][j].t = this.pointsCtr[i-1][j].t + 1;
                    
                }
                if (this.distanceParam.checked) {
                    this.pointsCtr[i][j].t = this.pointsCtr[i - 1][j].t + Math.sqrt(Math.pow(this.pointsCtr[i][j].x - this.pointsCtr[i - 1][j].x,2) + Math.pow(this.pointsCtr[i][j].y - this.pointsCtr[i - 1][j].y,2) + Math.pow(this.pointsCtr[i][j].z - this.pointsCtr[i - 1][j].z,2));
                }
            }
        }

        this.pointsSpline = new Array(parseInt(N));
        this.normalsSpline = new Array(parseInt(N));
        for (i = 0; i < N; i++) {
            this.pointsSpline[i] = new Array(parseInt(M));
            this.normalsSpline[i] = new Array(parseInt(M));
			for (j = 0; j < M; j++) {
            this.normalsSpline[i][j] = new Array(parseInt(3));
        }
        }
        var t, tau;
        dt = (this.pointsCtr[N_ctr - 1][0].t - this.pointsCtr[0][0].t) / (M-1);
        dtau = (this.pointsCtr[0][M_ctr - 1].tau - this.pointsCtr[0][0].tau) / (N-1);
        t = this.pointsCtr[0][0].t;
        tau = this.pointsCtr[0][0].tau;
        var k = 0, m = 0;j=0;count = 0;
        // ДОБАВИТЬ КОД РАСЧЕТА ТОЧЕК ЛИНЕЙНОГО ПОВЕРХНОСТНОГО СПЛАЙНА И НОРМАЛЕЙ В НИХ
	
		   for (i = 0; i < M_ctr - 1;i++) 
	{
			   while (tau <= this.pointsCtr[0][i+1].tau)
		{
			w2 = (tau - this.pointsCtr[0][i].tau) / (this.pointsCtr[0][i+1].tau - this.pointsCtr[0][i].tau);
			//y = (1 - w) * this.pointsCtr[0][i].y + this.pointsCtr[0][i+1].y*w;
						for (j = 0; j < N_ctr - 1;j++)
					{
						while (t <= this.pointsCtr[j+1][i].t)
						{
						  w = (t - this.pointsCtr[j][i].t) / (this.pointsCtr[j+1][i].t - this.pointsCtr[j][i].t);
						 //w= (t - this.pointsCtr[k][m].t) / (this.pointsCtr[k+1][m].t - this.pointsCtr[k][m].t)+(tau - this.pointsCtr[k][m].tau) / (this.pointsCtr[k+1][m].tau - this.pointsCtr[k][m].tau);
						  //x = (1 - w) * this.pointsCtr[j][i].x + this.pointsCtr[j + 1][i].x*w;
						  //x = (1 - w) * this.pointsCtr[j][i].x + this.pointsCtr[j + 1][i].x*w;
						  //z = (1 - w) * this.pointsCtr[j][i].z + this.pointsCtr[j + 1][i].z*w;
						  
						  x1 = (1 - w) * this.pointsCtr[j][i].x + this.pointsCtr[j + 1][i].x*w;
						  y1 = (1 - w) * this.pointsCtr[j][i].y + this.pointsCtr[j + 1][i].y*w;
						  z1 = (1 - w) * this.pointsCtr[j][i].z + this.pointsCtr[j + 1][i].z*w;
						  x2 = (1 - w) * this.pointsCtr[j][i+1].x + this.pointsCtr[j + 1][i+1].x*w;
						  y2 = (1 - w) * this.pointsCtr[j][i+1].y + this.pointsCtr[j + 1][i+1].y*w;
						  z2 = (1 - w) * this.pointsCtr[j][i+1].z + this.pointsCtr[j + 1][i+1].z*w;
						  x = (1 - w2) * x1 + x2*w2;
						  y = (1 - w2) * y1 + y2*w2;
						  z = (1 - w2) * z1 + z2*w2;
						  
						  pt = new Point(x, y, z);
						  this.pointsSpline[k][m] = pt;
						  t += dt;
						  m++;
									  //nx = (y2-y1)*(z-z1)-(y-y1)*(z2-z1);
									  //ny = -((x2-x1)*(z-z1)-(x-x1)*(z2-z1));
									  //nz = (x2-x1)*(y-y1)-(x-x1)*(y2-y1);
									  //this.normalsSpline[i][j][0] = nx;
									  //this.normalsSpline[i][j][1] = ny;
									  //this.normalsSpline[i][j][2] = nz;
						}	
						          
					}
					m=0;
					t=0;
					tau+=dtau;
					k++;
		}
	}
	k=parseInt(M);m=parseInt(N)
					for (i = 1; i < k;i++)
					{						
								for (j = 1; j < m;j++)
								{
									nx = (this.pointsSpline[i][j-1].y-this.pointsSpline[i-1][j].y)*(this.pointsSpline[i][j].z-this.pointsSpline[i-1][j].z)-(this.pointsSpline[i][j].y-this.pointsSpline[i-1][j].y)*(this.pointsSpline[i][j-1].z-this.pointsSpline[i-1][j].z);
									ny = -((this.pointsSpline[i][j-1].x-this.pointsSpline[i-1][j].x)*(this.pointsSpline[i][j].z-this.pointsSpline[i-1][j].z)-(this.pointsSpline[i][j].x-this.pointsSpline[i-1][j].x)*(this.pointsSpline[i][j-1].z-this.pointsSpline[i-1][j].z));
									nz = (this.pointsSpline[i][j-1].x-this.pointsSpline[i-1][j].x)*(this.pointsSpline[i][j].y-this.pointsSpline[i-1][j].y)-(this.pointsSpline[i][j].x-this.pointsSpline[i-1][j].x)*(this.pointsSpline[i][j-1].y-this.pointsSpline[i-1][j].y);
									this.normalsSpline[i][j][0] = nx;
									this.normalsSpline[i][j][1] = ny;
									this.normalsSpline[i][j][2] = nz;
								}
	
					}
					
						for (i = 0; i < k;i++)
					{						
									this.normalsSpline[i][0][0] = this.normalsSpline[i][1][0];
									this.normalsSpline[i][0][1] = this.normalsSpline[i][1][1];
									this.normalsSpline[i][0][2] = this.normalsSpline[i][1][2];
	
					}
					for (i = 0; i < k;i++)
					{						
									this.normalsSpline[0][i][0] = this.normalsSpline[1][i][0];
									this.normalsSpline[0][i][1] = this.normalsSpline[1][i][1];
									this.normalsSpline[0][i][2] = this.normalsSpline[1][i][2];
	
					}
			
/*
				for ( int i=0; i < k-2 ;i++)
				{
					for (int j = 0; j < m-2 ;j++)
					{
						this.pointsSpline[k][m]
						*/

				
				
        /*
        for (i = 0; i < M_ctr-1;i++) {
        	for (j = 0; j < N_ctr-1;j++)
            {
				while (t <= this.pointsCtr[j+1][i].t)
				{
				  w = (t - this.pointsCtr[j][i].t) / (this.pointsCtr[j+1][i].t - this.pointsCtr[j][i].t)
				 //w= (t - this.pointsCtr[k][m].t) / (this.pointsCtr[k+1][m].t - this.pointsCtr[k][m].t)+(tau - this.pointsCtr[k][m].tau) / (this.pointsCtr[k+1][m].tau - this.pointsCtr[k][m].tau);
				  x = (1 - w) * this.pointsCtr[j][i].x + this.pointsCtr[j + 1][i].x*w;
				  y = (1 - w) * this.pointsCtr[j][i].y + this.pointsCtr[j + 1][i].y*w;
				  z = (1 - w) * this.pointsCtr[j][i].z + this.pointsCtr[j + 1][i].z*w;
				  pt = new Point(x, y, z);
				  this.pointsSpline[i][m] = pt;
				  t += dt;
				  m++;
				}	
				*/
				//m=0;
				/*
				  while (tau <= this.pointsCtr[j][i+1].tau)
				{
				  w = (tau - this.pointsCtr[i][j].tau) / (this.pointsCtr[i][j+1].tau - this.pointsCtr[i][j].tau)
				 //w= (t - this.pointsCtr[k][m].t) / (this.pointsCtr[k+1][m].t - this.pointsCtr[k][m].t)+(tau - this.pointsCtr[k][m].tau) / (this.pointsCtr[k+1][m].tau - this.pointsCtr[k][m].tau);
				  x = (1 - w) * this.pointsCtr[j][i].x + this.pointsCtr[j + 1][i].x*w;
				  y = (1 - w) * this.pointsCtr[j][i].y + this.pointsCtr[j + 1][i].y*w;
				  z = (1 - w) * this.pointsCtr[j][i].z + this.pointsCtr[j + 1][i].z*w;
				  pt = new Point(x, y, z);
				  this.pointsSpline[i+4][m] = pt;
   				  tau+=dtau;
				  m++;
				}	
*/				
		
              //while (tau <= this.pointsCtr[k][m + 1].tau)
              //{
              //    w = (tau - this.pointsCtr[k][m].tau) / (this.pointsCtr[k + 1][m].tau - this.pointsCtr[k][m].tau);
              //    x = (1 - w) * this.pointsCtr[k][m].x + this.pointsCtr[k + 1][m].x * w;
              //    y = (1 - w) * this.pointsCtr[k][m].y + this.pointsCtr[k + 1][m].y * w;
              //    z = (1 - w) * this.pointsCtr[k][m].z + this.pointsCtr[k + 1][m].z * w;
              //    pt = new Point(x, y, z);
              //    this.pointsSpline[i][j] = pt;
              //    tau += dtau;
              //}
              //nx = ;
              //ny = ;
              //nz = ;
              //this.normalsSpline[i][j][0] = nx;
              //this.normalsSpline[i][j][1] = ny;
              //this.normalsSpline[i][j][2] = nz;
	

    

        this.verticesSpline = new Float32Array(N * M * 6);
        for (i = 0; i < N; i++)
            for (j = 0; j < M; j++) {
                this.verticesSpline[(i * M + j) * 6] = this.pointsSpline[i][j].x;
                this.verticesSpline[(i * M + j) * 6 + 1] = this.pointsSpline[i][j].y;
                this.verticesSpline[(i * M + j) * 6 + 2] = this.pointsSpline[i][j].z;
                this.verticesSpline[(i * M + j) * 6 + 3] = this.normalsSpline[i][j][0];
                this.verticesSpline[(i * M + j) * 6 + 4] = this.normalsSpline[i][j][1];
                this.verticesSpline[(i * M + j) * 6 + 5] = this.normalsSpline[i][j][2];
            }

        this.createIndicesSplineLines(N, M);
        this.createIndicesSplineSurface(N, M);
    }
}

function mousedown(ev, canvas) {
    event = EventUtil.getEvent(event);

    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    Data.mousedownHandler(EventUtil.getButton(ev), x - rect.left, canvas.height - (y - rect.top));
}

function mouseup(ev, canvas) {
    event = EventUtil.getEvent(event);

    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    Data.mouseupHandler(EventUtil.getButton(ev), x - rect.left, canvas.height - (y - rect.top));
}

function mousemove(ev, canvas)
{
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    Data.mousemoveHandler(x - rect.left, canvas.height - (y - rect.top));
}