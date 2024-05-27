class Cube {
  constructor() {
    this.type = "cube";
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.textureNum = -2;
  }

  render() {
    var rgba = this.color;

    gl.uniform1i(u_whichTexture, this.textureNum);
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Draw

    //  FRONT
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    drawTriangle3DNormal( [0,0,0,  1,1,0,  1,0,0], [0,0,-1, 0,0,-1, 0,0,-1] );
    drawTriangle3DNormal( [0,0,0,  0,1,0,  1,1,0], [0,0,-1, 0,0,-1, 0,0,-1] );

    //  TOP
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    drawTriangle3DNormal( [0,1,0,  0,1,1,  1,1,1], [0,1,0, 0,1,0, 0,1,0] );
    drawTriangle3DNormal( [0,1,0,  1,1,1,  1,1,0], [0,1,0, 0,1,0, 0,1,0] );

    //  RIGHT
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    drawTriangle3DNormal( [1,0,0,  1,1,1,  1,0,1], [1,0,0, 1,0,0, 1,0,0] );
    drawTriangle3DNormal( [1,0,0,  1,1,0,  1,1,1], [1,0,0, 1,0,0, 1,0,0] );

    //  LEFT
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    drawTriangle3DNormal( [0,0,0,  0,0,1,  0,1,1], [-1,0,0, -1,0,0, -1,0,0] );
    drawTriangle3DNormal( [0,0,0,  0,1,1,  0,1,0], [-1,0,0, -1,0,0, -1,0,0] );

    //  BOTTOM
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    drawTriangle3DNormal( [0,0,0,  1,0,0,  1,0,1], [0,-1,0, 0,-1,0, 0,-1,0] );
    drawTriangle3DNormal( [0,0,0,  1,0,1,  0,0,1], [0,-1,0, 0,-1,0, 0,-1,0] );

    //  BACK
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    drawTriangle3DNormal( [0,0,1,  1,0,1,  1,1,1], [0,0,1, 0,0,1, 0,0,1] );
    drawTriangle3DNormal( [0,0,1,  1,1,1,  0,1,1], [0,0,1, 0,0,1, 0,0,1] );
  }

  get_POS() {
    return([this.matrix.elements[12],this.matrix.elements[13],this.matrix.elements[14]]);
  }
}