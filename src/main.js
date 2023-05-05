import * as t3d from "t3d";
import { Texture2DLoader } from "t3d/examples/jsm//loaders/Texture2DLoader.js";
import { OrbitControls } from "t3d/examples/jsm//controls/OrbitControls.js";
import { GUI } from "./libs/lil-gui.esm.min.js";
import { GLTFLoader } from "t3d/examples/jsm//loaders/glTF/GLTFLoader.js";
import { TextureCubeLoader } from "t3d/examples/jsm//loaders/TextureCubeLoader.js";
import { SkyBox } from "t3d/examples/jsm//objects/SkyBox.js";
import { smokeFragmentShader, smokeVertexShader, pointUniforms, pointVertexShader, pointFragmentShader } from "./shader.js";
import { ForwardRenderer } from 't3d/examples/jsm/render/ForwardRenderer.js';

function getGrouperGeometry(number, range, offset) {
    const verticesArray = [];
    for (let i = 0; i < number; i++) {
        verticesArray.push(
            Math.random() * range - range / 2 + offset[0],
            Math.random() * range - range / 2 + offset[1],
            Math.random() * range - range / 2 + offset[2],
        );
    }
    let meshGeometry = new t3d.Geometry();
    meshGeometry.addAttribute(
        "a_Position",
        new t3d.Attribute(new t3d.Buffer(new Float32Array(verticesArray), 3))
    );
    meshGeometry.computeBoundingBox();
    meshGeometry.computeBoundingSphere();
    return meshGeometry;
}
function getNebulaGeometry(disLength = 10, range = 0, number = 1) {
    const verticesArray = [];
    let arr = galacticData;
    for (let i = 0; i < arr.length / 6; i++) {
        verticesArray.push(arr[i * 3] * 9, arr[i * 3 + 1] * 9, arr[i * 3 + 2] * 9);
        if (i * 6 + 3 < arr.length) {
            let dx = Math.abs(arr[i * 3] * 9 - arr[i * 3 + 3] * 9);
            let dy = Math.abs(arr[i * 3 + 1] * 9 - arr[i * 3 + 4] * 9);
            let dz = Math.abs(arr[i * 3 + 2] * 9 - arr[i * 3 + 5] * 9);
            let dis = Math.sqrt(Math.pow(dx, 2) + Math.pow(dz, 2) + Math.pow(dy, 2));
            for (let k = 0; k < number; k++) {
                for (let j = 1; dis > j * disLength; j++) {
                    verticesArray.push(
                        arr[i * 3] * 9 +
                        ((-arr[i * 3] * 9 + arr[i * 3 + 3] * 9) * disLength * j) / dis +
                        Math.random() * range -
                        range / 2,
                        arr[i * 3 + 1] * 9 +
                        ((-arr[i * 3 + 1] * 9 + arr[i * 3 + 4] * 9) * disLength * j) /
                        dis +
                        Math.random() * range -
                        range / 2,
                        arr[i * 3 + 2] * 9 +
                        ((-arr[i * 3 + 2] * 9 + arr[i * 3 + 5] * 9) * disLength * j) /
                        dis +
                        Math.random() * range -
                        range / 2
                    );
                }
            }
        }
    }
    for (let i = 0; i < 20; i++) {
        verticesArray.push(Math.random() * 100 - 50, 0, Math.random() * 100 - 50);
    }
    let meshGeometry = new t3d.Geometry();
    meshGeometry.addAttribute(
        "a_Position",
        new t3d.Attribute(new t3d.Buffer(new Float32Array(verticesArray), 3))
    );
    meshGeometry.computeBoundingBox();
    meshGeometry.computeBoundingSphere();
    return meshGeometry;
}
function getPointMesh(objects) {
    let {
        shadertype,
        disLength,
        range,
        number,
        geometrytype,
        pointSize,
        pointTexture,
        offset,
        isGrouper
    } = objects;
    let meshGeometry;
    if (geometrytype) {
        meshGeometry = getNebulaGeometry(disLength, range, number);
    }
    else {
        meshGeometry = getGrouperGeometry(number, range, offset);
    }
    let meshMaterial;
    switch (shadertype) {
        case "CUSTOM_SMOKE":
            meshMaterial = new t3d.PointsMaterial();
            meshMaterial.shaderName = "CUSTOM_SMOKE";
            meshMaterial.type = t3d.MATERIAL_TYPE.SHADER;
            meshMaterial.vertexShader = smokeVertexShader;
            meshMaterial.fragmentShader = smokeFragmentShader;
            break;
        case "CUSTOM_PIOINT":
            meshMaterial = new t3d.PointsMaterial();
            meshMaterial.shaderName = "CUSTOM_PIOINT";
            meshMaterial.type = t3d.MATERIAL_TYPE.SHADER;
            meshMaterial.opacity = 0.8;
            meshMaterial.uniforms = pointUniforms;
            meshMaterial.vertexShader = pointVertexShader;
            meshMaterial.fragmentShader = pointFragmentShader;
            break;
        case "T3D_PIOINT":
            meshMaterial = new t3d.PointsMaterial();
            if (isGrouper)
                meshMaterial.opacity = 0.;
            break;
    }
    meshMaterial.blending = t3d.BLEND_TYPE.ADD;
    meshMaterial.depthWrite = false;
    meshMaterial.transparent = true;
    meshMaterial.depthTest = true;
    meshMaterial.diffuseMap = pointTexture;
    meshMaterial.size = pointSize;

    const points = new t3d.Mesh(meshGeometry, meshMaterial);
    return points;
}
function getGalacticPlan() {
    const planeGeometry = new t3d.PlaneGeometry(600, 600);
    const texturePlan = loader.load("milkyway/galactictop.png");
    texturePlan.magFilter = t3d.TEXTURE_FILTER.LINEAR;
    texturePlan.minFilter = t3d.TEXTURE_FILTER.LINEAR;
    const planeMaterial = new t3d.BasicMaterial();
    planeMaterial.blending = t3d.BLEND_TYPE.ADD;
    planeMaterial.side = t3d.DRAW_SIDE.DOUBLE;

    planeMaterial.transparent = true;
    planeMaterial.depthWrite = false;
    planeMaterial.depthTest = true;
    planeMaterial.diffuseMap = texturePlan;
    let plane = new t3d.Mesh(planeGeometry, planeMaterial);
    plane.position.set(0, 9, 0);
    scene.add(plane);
    return plane;
}
let width = window.innerWidth || 2;
let height = window.innerHeight || 2;
window.canvas = document.createElement("canvas");
canvas.width = width;
canvas.height = height;
document.body.appendChild(canvas);

const scene = new t3d.Scene();
const ambientLight = new t3d.AmbientLight(0xffffff, 1.3);
scene.add(ambientLight);



const camera = new t3d.Camera();

camera.position.set(0, 75, -200);
camera.lookAt(new t3d.Vector3(0, 0, 0), new t3d.Vector3(0, 1, 0));
camera.setPerspective((75 / 180) * Math.PI, width / height, 0.001, 2000);
scene.add(camera);

const controller = new OrbitControls(camera, canvas);
controller.target.set(0, 9.2, 110);
controller.enablePan = false;
controller.rotateSpeed = 0.2;
controller.minDistance = 0.05;
controller.maxDistance = 700.0;

const forwardRenderer = new ForwardRenderer(canvas);

const gui = new GUI();
let timeLine = {
    extends: 10,
};

const loaderGltf = new GLTFLoader();
const galacticModelUrl = "milkyway/scene.glb";
const earthModelUrl = "milkyway/earth.glb";
let galacticData;
await loaderGltf.load(galacticModelUrl).then(function (result) {
    galacticData = result.accessors[0].buffer.array;
});



const loader = new Texture2DLoader();
let textureArray = [];
let textureUrl = [
    "Grouper0.png",
    "star_preview.png",
    "atmosphere.png",
    "galactic_sharp.png",
    "Grouper.png",
    "smoke4.png",
    "p_1.png",
    "facula.png",
    "facula1.png",
    "light.png",
    "addlight.png",
];
for (let i = 0; i < textureUrl.length; i++) {
   await textureArray.push(loader.load("milkyway/" + textureUrl[i]));
}

const params = [
    {
        shadertype: "CUSTOM_SMOKE",
        disLength: 10,
        range: 0,
        number: 1,
        geometrytype: true,
        pointSize: 60,
        pointTexture: textureArray[5],
        rotationsNumber: 4,
    },
    {
        shadertype: "CUSTOM_PIOINT",
        disLength: 3,
        range: 20,
        number: 10,
        geometrytype: true,
        pointSize: 2,
        pointTexture: textureArray[1],
        rotationsNumber: 4,
    },
    {
        shadertype: "CUSTOM_PIOINT",
        disLength: 4,
        range: 20,
        number: 3,
        geometrytype: true,
        pointSize: 2,
        pointTexture: textureArray[3],
        rotationsNumber: 4,
    },
    {
        shadertype: "CUSTOM_PIOINT",
        disLength: null,
        range: 500,
        number: 4000,
        geometrytype: false,
        pointSize: 2,
        pointTexture: textureArray[2],
        rotationsNumber: 1,
        offset: [0, 0, 0],
    },
    {
        shadertype: "T3D_PIOINT",
        disLength: null,
        range: 15,
        number: 50000,
        geometrytype: false,
        pointSize: 0.01,
        pointTexture: textureArray[6],
        rotationsNumber: 1,
        offset: [0, 9.2, 110],
        isGrouper: true
    },
    {
        shadertype: "T3D_PIOINT",
        disLength: null,
        range: 0,
        number: 1,
        geometrytype: false,
        pointSize: 30,
        pointTexture: textureArray[0],
        rotationsNumber: 1,
        offset: [0, 9.2, 110],
        isGrouper: true
    },
    {
        shadertype: "T3D_PIOINT",
        disLength: null,
        range: 0,
        number: 1,
        geometrytype: false,
        pointSize: 3,
        pointTexture: textureArray[7],
        rotationsNumber: 1,
        offset: [0, 9.2, 110],
        isGrouper: true
    },
    {
        shadertype: "T3D_PIOINT",
        disLength: null,
        range: 0,
        number: 1,
        geometrytype: false,
        pointSize: 3,
        pointTexture: textureArray[8],
        rotationsNumber: 1,
        offset: [0, 9.2, 110],
        isGrouper: true
    },
    {
        shadertype: "T3D_PIOINT",
        disLength: null,
        range: 0,
        number: 1,
        geometrytype: false,
        pointSize: 3,
        pointTexture: textureArray[9],
        rotationsNumber: 1,
        offset: [0, 9.2, 110],
        isGrouper: true
    },
    {
        shadertype: "T3D_PIOINT",
        disLength: null,
        range: 0,
        number: 1,
        geometrytype: false,
        pointSize: 3,
        pointTexture: textureArray[10],
        rotationsNumber: 1,
        offset: [0, 9.2, 110],
        isGrouper: true
    },
];
let pointsArray = [];
let Grouper = [];
for (let j = 0; j < params.length; j++) {
    for (let i = 0; i < params[j].rotationsNumber; i++) {
        const param = params[j];
        const points = getPointMesh(param);
        scene.add(points);
        points.euler.x = 0;
        points.euler.y = (i * Math.PI) / 2;
        points.euler.z = 0;
        if (param.isGrouper)
            Grouper.push(points);
        else
            pointsArray.push(points);
    }
}
let position = new t3d.Vector3(0, 75, -200);
gui.add(timeLine, "extends", 0, 10, 0.01).onChange((val) => {
    let data = 1 - (Math.pow(2, val) - 1) / 1024;
    camera.position.set(
        position.x * (1 - data),
        position.y * (1 - data) + 9.2 * data,
        position.z * (1 - data) + 109.950 * data
    );
    for (let i = 0; i < pointsArray.length; i++) {
        pointsArray[i].material.opacity = 1.0 - data;
    }
    let dist = camera.position.distanceTo(new t3d.Vector3(0, 9.2, 110));
    for (let i = 1; i < 5; i++) {
        Grouper[i].material.opacity = 0;
    }
    Grouper[0].material.opacity = 0;
    earthModel.visible = false;
    // if (dist < 80) {
    //     sky_box.material.opacity = dist / 80.;
    // }
    if (dist < 40) {
        for (let i = 1; i < 5; i++) {
            Grouper[i].material.opacity = (1. - dist / 40.);
        }
    }
    if (dist < 20) {
        Grouper[0].material.opacity = (1. - dist / 20.);
    }
    if (dist < 4) {
        for (let i = 1; i < 5; i++) {
            Grouper[i].material.opacity = (dist - 0.3) / 1
        }
    }
    if (dist < 1) {
        earthModel.visible = true;
    }
    galacticPlane.material.opacity = 1.0 - data;
    camera.lookAt(new t3d.Vector3(0, 0, 0), new t3d.Vector3(0, 1, 0));

});
let galacticPlane = getGalacticPlan();
let time;
function loop(count, deltaTime = 0.0166666) {
    requestAnimationFrame(loop);
     time = Date.now() * 0.002 * deltaTime;
    for (let i = 0; i < pointsArray.length; i++) {
        pointsArray[i].euler.y = (i * Math.PI) / 2 + -time / 2;
        pointsArray[i].material.uniforms.time += 0.003;
    }
    galacticPlane.euler.y = -time / 2;
    controller.update();
    scene.updateMatrix();
    scene.updateRenderStates(camera);
    scene.updateRenderQueue(camera);
    forwardRenderer.render(scene, camera);

}
requestAnimationFrame(loop);

function onWindowResize() {
    width = window.innerWidth || 2;
    height = window.innerHeight || 2;

    camera.setPerspective((75 / 180) * Math.PI, width / height, 0.001, 2000);
    forwardRenderer.backRenderTarget.resize(width, height);

}
let earthModel;
loaderGltf.load(earthModelUrl).then(function (result) {
    result.root.scale.set(0.0003, 0.0003, 0.0003);
    result.root.position.set(0, 9.2, 110);
    earthModel = result.root;
    earthModel.visible = false;
    scene.add(earthModel);
});
const cube_texture = new TextureCubeLoader().load([
    "milkyway/sky/rightImage.png",
    "milkyway/sky/leftImage.png",
    "milkyway/sky/upImage.png",
    "milkyway/sky/downImage.png",
    "milkyway/sky/backImage.png",
    "milkyway/sky/frontImage.png",
]);

const sky_box = new SkyBox(cube_texture);
camera.add(sky_box);
window.addEventListener("resize", onWindowResize, false);
