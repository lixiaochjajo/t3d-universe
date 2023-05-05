import * as t3d from "t3d";
let smokeVertexShader = t3d.ShaderLib.point_vert;
let smokeFragmentShader = t3d.ShaderLib.point_frag;
smokeVertexShader = smokeVertexShader.replace(
    `uniform float u_PointScale;`,
    `uniform float u_PointScale;
     varying vec3 v_Point; `
);
smokeVertexShader = smokeVertexShader.replace(
    `vec4 mvPosition = u_View * u_Model * vec4(transformed, 1.0);`,
    `vec4 mvPosition = u_View * u_Model * vec4(transformed, 1.0);
     v_Point =  vec4(transformed, 1.0).xyz;`
);
smokeFragmentShader = smokeFragmentShader.replace(
    `#include <color_pars_frag>`,
    `#include <color_pars_frag>
     varying vec3 v_Point;`
);
smokeFragmentShader = smokeFragmentShader.replace(
    `outColor *= texture2D(diffuseMap, vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y));`,
    `outColor *= texture2D(diffuseMap, vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y));
     float a = distance(vec3(0.), v_Point);
     if (a < 100.) {
        outColor *= vec4(1.0, 1.0, 194. / 255., .2);
     } else {
        outColor *= vec4(136. / 255., 133. / 255., 174. / 255., .2);
     }`
);
const pointUniforms = {
    time: 0.0,
    invWaveLength: 20,
};
let pointVertexShader = t3d.ShaderLib.point_vert;
let pointFragmentShader = t3d.ShaderLib.point_frag;
pointVertexShader = pointVertexShader.replace(
    `uniform float u_PointScale;`,
    `uniform float u_PointScale;
     uniform float time;
     uniform float invWaveLength;
     attribute float instanceFeatureAttribute;
     float random (vec2 st){
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
     }
     vec3 hash31(float p) {
     vec3 p3 = fract(vec3(p) * vec3(0.1031, 0.1030, 0.0973));
     p3 += dot(p3, p3.yzx + 33.33);
     return fract((p3.xxy + p3.yzz) * p3.zyx);
     }`
);
pointVertexShader = pointVertexShader.replace(
    `vec4 mvPosition = u_View * u_Model * vec4(transformed, 1.0);`,
    `vec4 mvPosition = u_View * u_Model * vec4(transformed, 1.0);
     vec4 offset = vec4(0.0);
     offset.yzw = vec3(0.0, 0.0, 0.0);
     offset.x = sin(1. * time + transformed.x * invWaveLength + transformed.y * invWaveLength + transformed.z * invWaveLength) * 1.;
     offset.y = sin(1. * time + transformed.x * invWaveLength + transformed.y * invWaveLength + transformed.z * invWaveLength) * 1.;
     gl_Position = u_ProjectionView * u_Model * vec4(transformed + offset.xyz, 1.0);`
);
export { smokeFragmentShader, smokeVertexShader, pointUniforms, pointVertexShader, pointFragmentShader };