import { BoxGeometry, DRAW_SIDE, Mesh, ShaderMaterial } from 't3d';

class SkyBox extends Mesh {
  constructor(texture) {
    const geometry = new BoxGeometry(1, 1, 1);

    const material = new ShaderMaterial(SkyBox.SkyBoxShader);
    material.side = DRAW_SIDE.BACK;

    super(geometry, material);

    this.material = material;

    if (texture) {
      this.texture = texture;
    }

    this.frustumCulled = false;
  }

  set level(val) {
    this.material.uniforms.level = val;
  }

  get level() {
    return this.material.uniforms.level;
  }

  set gamma(val) {
    this.material.defines.GAMMA = val;
    this.material.needsUpdate = true;
  }

  get gamma() {
    return this.material.defines.GAMMA;
  }

  set texture(val) {
    if (val.isTextureCube) {
      this.material.cubeMap = val;
      this.material.uniforms.flip = val.images[0] && val.images[0].rtt ? 1 : -1;
      this.material.defines['PANORAMA'] = false;
    } else {
      this.material.diffuseMap = val;
      this.material.uniforms.flip = -1;
      this.material.defines['PANORAMA'] = '';
    }
    this.material.needsUpdate = true;
  }

  get texture() {
    return this.material.diffuseMap || this.material.cubeMap;
  }

  get fog() {
    return this.material.defines.SKYFOG;
  }

  set fog(val) {
    this.material.defines.SKYFOG = val;
    this.material.needsUpdate = true;
  }
}

SkyBox.SkyBoxShader = {
  name: 'skybox',

  defines: {
    GAMMA: false,
    PANORAMA: false,
    SKYFOG: false
  },

  uniforms: {
    level: 0,
    flip: -1,
    fogColor: [1, 1, 1],
    fogStart: 0.0, // value from -0.5 to 0.5
    fogHeight: 0.1,
    iTime: 0.0,
    iResolution: [1.0, 1.0],
    iMouse: [0.5, 0.5],
    iChannel0: 0.0
  },

  vertexShader: `
		#include <common_vert>

		varying vec3 vDir;

		#ifdef SKYFOG
			varying vec3 vPosition;
		#endif

		mat4 clearMat4Translate(mat4 m) {
			mat4 outMatrix = m;
			outMatrix[3].xyz = vec3(0., 0., 0.);
			return outMatrix;
		}

		void main() {
			mat4 modelMatrix = clearMat4Translate(u_Model);
			mat4 viewMatrix = clearMat4Translate(u_View);

			vDir = normalize((modelMatrix * vec4(a_Position, 0.0)).xyz);

			#ifdef SKYFOG
				vPosition = a_Position.xyz;
			#endif

			gl_Position = u_Projection * viewMatrix * modelMatrix * vec4(a_Position, 1.0);
			gl_Position.z = gl_Position.w;
		}
	`,

  fragmentShader: `
		 #include <common_frag>
    
    #define iterations 17    // 分形迭代次数，值越大细节越丰富（性能消耗越大）
    #define formuparam 0.53  // 分形形态参数，控制结构松紧（0.5-0.6效果最佳）
    #define volsteps 20      // 体积光步进次数，影响渲染精度和性能
    #define stepsize 0.1     // 光线步长，值越小精度越高但噪点更多

    #define tile   0.850     // 空间平铺系数，控制图案重复频率
    #define speed  0.010     // 动画速度系数，值越大旋转移动越快

    #define brightness 0.0015 // 基础亮度系数，整体亮度调节
    #define darkmatter 0.300 // "暗物质"强度，值越大黑暗区域越明显
    #define distfading 0.730  // 距离衰减系数，值越大远处细节消失越快
    #define saturation 0.850  // 颜色饱和度，1.0为原始颜色，0.5为去色
    
    varying vec3 vDir;
    uniform float iTime;
    uniform vec2 iResolution;
    uniform vec2 iMouse;

    void main() {
        vec2 uv = (gl_FragCoord.xy/iResolution.xy) - 0.5;
        uv.y *= iResolution.y/iResolution.x;
        
        // 使用天空盒方向向量替代原始方向计算
        vec3 dir = normalize(vDir);
        
        float time = iTime * speed + 0.25;
        
        // 应用分形宇宙核心算法
        vec3 from = vec3(1.0, 0.5, 0.5);
        from += vec3(time*2.0, time, -2.0);
        
        float s = 0.1, fade = 1.0;
        vec3 v = vec3(0.0);
        for (int r=0; r<volsteps; r++) {
            vec3 p = from + s*dir*0.5;
            p = abs(vec3(tile) - mod(p, vec3(tile*2.0)));
            float pa, a = pa = 0.0;
            for (int i=0; i<iterations; i++) { 
                p = abs(p)/dot(p,p) - formuparam;
                a += abs(length(p) - pa);
                pa = length(p);
            }
            float dm = max(0.0, darkmatter - a*a*0.001);
            a *= a*a;
            if (r > 6) fade *= 1.0 - dm;
            v += fade;
            v += vec3(s, s*s, s*s*s*s)*a*brightness*fade;
            fade *= distfading;
            s += stepsize;
        }
        v = mix(vec3(length(v)), v, saturation);
        vec3 finalColor = v * 0.01;
         gl_FragColor = vec4(finalColor, 1.0);
        
        #ifdef SKYFOG
            // 保留原始雾效混合逻辑
            float alpha = clamp((vPosition.y - fogStart) / fogHeight, 0.0, 1.0);
            gl_FragColor.rgb = mix(fogColor, gl_FragColor.rgb, alpha);
        #endif
    
		}
	`
};

export { SkyBox };
