//
// Fragment Shader
//

const BRAINSTORM_VERTEX_SHADER_SOURCE = `
precision mediump float;

attribute vec3 position;
attribute float z_displacement;

vec3 color;
varying vec3 vColor;

uniform int effect;
uniform int signaltype;
uniform mat4 matrix;
uniform float synchrony;
uniform float u_time;
uniform int u_ambientNoiseToggle;
uniform vec3 eeg_coords[67];
uniform float eeg_signal[67];
uniform vec2 aspectChange;
uniform vec2 mousePos;
uniform int colorToggle;

vec3 ambient_noise;
float dist;

vec3 positionTransforms;
vec4 positionProjected;
vec2 currentScreen;

 // Set Up Synchrony Scaling
 float ss;
 float eeg_ss[67];
 float zdelta;


//Classic Perlin 3D Noise 
//by Stefan Gustavson
//
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}

float cnoise(vec3 P){
  vec3 Pi0 = floor(P); // Integer part for indexing
  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P); // Fractional part for interpolation
  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;

  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);

  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);

  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);

  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);

  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
  g000 *= norm0.x;
  g010 *= norm0.y;
  g100 *= norm0.z;
  g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
  g001 *= norm1.x;
  g011 *= norm1.y;
  g101 *= norm1.z;
  g111 *= norm1.w;

  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
  float n111 = dot(g111, Pf1);

  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x); 
  return 2.2 * n_xyz;
}

void main() {

    vec3 pos_timeoffset = (position/100.0) + u_time / 2.0;
     
     // Initialize color at zero
     vColor = vec3(1.0,1.0,1.0);
     
    // Scale Values and Cap at [-1,1]
    
    // displacement
    if (signaltype != 1){
        zdelta = z_displacement*10.0;
        if (zdelta >= 5.0){
            zdelta = 5.0;
        } else if (zdelta <= -5.0){
            zdelta = -5.0;
        }
    } 
    else {
        zdelta = z_displacement;
    }

    // projection
    for (int i = 0; i < 67; i++){
        if (signaltype != 1){
            eeg_ss[i] = eeg_signal[i]*10.0;
        } else {
           eeg_ss[i] = eeg_signal[i];
        }
        
        if (eeg_ss[i] >= 1.0){
            eeg_ss[i] = 1.0;
        } else if (eeg_ss[i] <= -1.0){
            eeg_ss[i] = -1.0;
        }
    } 
    
    // one-dimensional values
    ss = synchrony*10.0;
    if (ss >= 1.0){
        ss = 1.0;
    } else if (ss <= -1.0){
        ss = -1.0;
    }

     // Add color effects
     if (colorToggle == 1){
        if (effect == 1){
            for (int i = 0; i < 67; i++){
                if (abs(distance(eeg_coords[i],position)) <= 60.0){
                    float factor = (eeg_ss[i])*(1.0-pow(abs(distance(eeg_coords[i],position)/75.0),2.0));
                    if (eeg_ss[i] > 0.0){
                        vColor.y -= 0.5*factor;
                        vColor.z -= 0.2*factor;
                    } else if (eeg_ss[i] < 0.0){
                        vColor.x += 0.5*factor;
                        vColor.y += 0.2*factor;
                    }
                }  
            }
        } 
        else if (effect == 2){

            if (ss > 0.0){
                vColor.y -= 0.5*(ss);
                vColor.z -= 0.2*(ss);
            } else if (ss < 0.0){
                vColor.x += 0.5*ss;
                vColor.y += 0.2*ss;
            }
        } 
        else if (effect == 3){
            dist = abs(distance(150.0*-cos(u_time*1.25),position.z));
                if (dist <= 10.0){
                vColor.y = 0.0;
                vColor.z = 0.0;
            }
        }

        if (zdelta > 0.0){
            vColor.y -= 0.5*(zdelta);
            vColor.z -= 0.2*(zdelta);
        } else if (zdelta < 0.0){
            vColor.x += 0.5*(zdelta);
            vColor.y += 0.2*(zdelta);
        }

    }

    positionTransforms = position;
    if (u_ambientNoiseToggle == 1){
        if (effect == 2 && ss < 0.0){
            positionTransforms = position * (1.0+(cnoise(pos_timeoffset)*ss));
        } else{
            positionTransforms = position * (1.0+cnoise(pos_timeoffset)/75.0);
        }
    } 

     positionTransforms.z += zdelta;
     
     if (effect == 2){
        positionTransforms *= (1.0+(ss/2.0));
     }
     
     positionProjected = matrix * vec4(positionTransforms,1.0);
    positionProjected.x /= aspectChange.x;
    positionProjected.y /= aspectChange.y;

    if (aspectChange.x > 1.0 || aspectChange.y > 1.0){
        positionProjected.xy *= min(aspectChange.x,aspectChange.y);
    } else if (aspectChange.x < 1.0 || aspectChange.y < 1.0){
        positionProjected.xy *= min(aspectChange.x,aspectChange.y);
    }


    // Add mouse effects
    if (abs(distance(mousePos,positionProjected.xy)) <= 100.0){
        positionProjected += 100.0*cnoise(pos_timeoffset)*(100.0/(1.0+abs(distance(mousePos,positionProjected.xy))));
    }


    // Pass final positions
    gl_Position = positionProjected;
    gl_PointSize = 1.0;
}`



//
// Fragment Shader
//

const BRAINSTORM_FRAGMENT_SHADER_SOURCE = `
precision mediump float;
varying vec3 vColor;

void main() {
    gl_FragColor = vec4(vColor,0.5);
}
`
