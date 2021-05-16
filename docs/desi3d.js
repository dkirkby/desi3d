// https://observablehq.com/@dkirkby/desi3d@1309
import define1 from "https://observablehq.com/@mbostock/scrubber.js?v=3";
import define2 from "https://observablehq.com/@observablehq/inputs.js?v=3";
import define3 from "https://observablehq.com/@dkirkby/cosmocalc.js?v=3";
import define4 from "https://observablehq.com/@dkirkby/jumpy.js?v=3";
import define5 from "https://observablehq.com/@dkirkby/random.js?v=3";
import define6 from "https://observablehq.com/@dkirkby/array-utilities.js?v=3";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# DESI in 3D`
)});
  main.variable(observer("universe")).define("universe", ["THREE","viewSize","bgImageURL","camera","maxOrbitAngleDeg","scene","invalidation","applyCosmology","initialModel","visibleTypes"], function(THREE,viewSize,bgImageURL,camera,maxOrbitAngleDeg,scene,invalidation,applyCosmology,initialModel,visibleTypes)
{
  const renderer = new THREE.WebGLRenderer({antialias: true, alpha:true});
  renderer.setSize(viewSize, viewSize);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.domElement.style["background"] = `url(${bgImageURL}) no-repeat center center`;
  renderer.domElement.style["background-size"] = "cover";

  const PI = Math.PI;
  const deg2rad = deg => PI*deg/180;

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(0,0,camera.position.z+1);
  controls.maxPolarAngle = deg2rad(90+maxOrbitAngleDeg);
  controls.minPolarAngle = deg2rad(90-maxOrbitAngleDeg);
  controls.maxAzimuthAngle = deg2rad(180+maxOrbitAngleDeg);
  controls.minAzimuthAngle = deg2rad(180-maxOrbitAngleDeg);
  controls.rotateSpeed = -1;
  controls.enableRotate = true;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.addEventListener("change", () => { renderer.render(scene, camera); });
  invalidation.then(() => (controls.dispose(), renderer.dispose()));

  applyCosmology(initialModel);
  renderer.render(scene, camera);

  return Object.assign(renderer.domElement, {
    updateVisibility(viz) {
      for(const T of visibleTypes) scene.getObjectByName(T).visible = viz.includes(T);
      renderer.render(scene, camera);
    },
    updateView(cz) {
      // Linear ramp from 0.5 to 1.0 Gpc.
      const alpha = Math.max(0, Math.min(1, (cz/1000 - 0.5) / 0.5));
      renderer.setClearAlpha(alpha);
      camera.position.set(0,0,cz);
      controls.target.set(0, 0, camera.position.z+1);
      controls.update();
      renderer.render(scene, camera);
    },
    updateCosmology(model) {
      applyCosmology(model);
      renderer.render(scene, camera);
    }
  });
}
);
  main.variable(observer("viewof cameraRedshift")).define("viewof cameraRedshift", ["Scrubber","linspace"], function(Scrubber,linspace){return(
Scrubber(linspace(0.05,2.5,4801), {
  autoplay:false,
  alternate:true,
  format: ()=>""
})
)});
  main.variable(observer("cameraRedshift")).define("cameraRedshift", ["Generators", "viewof cameraRedshift"], (G, _) => G.input(_));
  main.variable(observer("observerText")).define("observerText", ["cameraDistance","universeSize","cosmologyModel","cameraRedshift","html"], function(cameraDistance,universeSize,cosmologyModel,cameraRedshift,html)
{
  const D = 1e-3 * cameraDistance;
  const f = cameraDistance / universeSize;
  const lbtime = cosmologyModel.lookback_time(0, cameraRedshift);
  return html`You are at redshift z=${Number(cameraRedshift).toFixed(2)}, which is ${Number(D).toFixed(2)} Gpc from Earth and ${Number(100*f).toFixed(0)}% of the way to the edge of the observable universe. Light reaching Earth from here today left ${Number(lbtime).toFixed(1)} Gyrs ago.`;
}
);
  main.variable(observer("modelText")).define("modelText", ["cosmologyModel","html"], function(cosmologyModel,html)
{
  const curv = (cosmologyModel.R0 > 400000) ? "spatially flat" :
    ((cosmologyModel.kappa < 0) ? "negatively":"positively") + " curved";
  return html`This universe is ${Number(cosmologyModel.age).toFixed(2)} billion years old and ${curv}.`;
}
);
  main.variable(observer("viewof showTypes")).define("viewof showTypes", ["Checkbox","visibleTypes","html","sourceColor"], function(Checkbox,visibleTypes,html,sourceColor){return(
Checkbox(visibleTypes, {
  value:visibleTypes,
  format:T=>html`<span style="padding:1px 8px; background-color:#${sourceColor[T].slice(2)}">${T}</span>`
})
)});
  main.variable(observer("showTypes")).define("showTypes", ["Generators", "viewof showTypes"], (G, _) => G.input(_));
  main.variable(observer("viewof Om0")).define("viewof Om0", ["Range","Om0Default","html","tex"], function(Range,Om0Default,html,tex){return(
Range([0.2,0.4], {value:Om0Default, step:0.005, label:html`Matter ${tex`\Omega_{\text{m},0}`}`})
)});
  main.variable(observer("Om0")).define("Om0", ["Generators", "viewof Om0"], (G, _) => G.input(_));
  main.variable(observer("viewof Ode0")).define("viewof Ode0", ["Range","Ode0Default","html","tex"], function(Range,Ode0Default,html,tex){return(
Range([0.6,0.8], {value:Ode0Default, step:0.005, label:html`Dark energy ${tex`\Omega_{\Lambda,0}`}`})
)});
  main.variable(observer("Ode0")).define("Ode0", ["Generators", "viewof Ode0"], (G, _) => G.input(_));
  main.variable(observer("reset")).define("reset", ["html","viewof Om0","Om0Default","Event","viewof Ode0","Ode0Default"], function(html,$0,Om0Default,Event,$1,Ode0Default)
{
  // See https://observablehq.com/@mbostock/views-are-mutable-values
  const form = html`
<form onsubmit='return false;'>
  <button name=benchmark>RESET COSMOLOGY</button>
</form>`;
  form.benchmark.onclick = () => {
    $0.value = Om0Default; $0.dispatchEvent(new Event('input'));
    $1.value = Ode0Default; $1.dispatchEvent(new Event('input'));
  }
  return form;
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`### Legacy Survey Image`
)});
  main.variable(observer("fieldOfViewDeg")).define("fieldOfViewDeg", function(){return(
4
)});
  main.variable(observer("imageSize")).define("imageSize", ["viewSize"], function(viewSize){return(
viewSize
)});
  main.variable(observer("imageURL")).define("imageURL", ["catalog","fieldOfViewDeg","imageSize"], function(catalog,fieldOfViewDeg,imageSize)
{
  const RA = 180 * catalog["RA0"] / Math.PI;
  const DEC = 180 * catalog["DEC0"] / Math.PI;
  const pixscale = 3600 * fieldOfViewDeg / imageSize;
  const url = new URL("https://www.legacysurvey.org/viewer/jpeg-cutout");
  url.searchParams.set("ra", Number(RA).toFixed(3));
  url.searchParams.set("dec", Number(DEC).toFixed(3));
  url.searchParams.set("layer", "unwise-neo6");
  url.searchParams.set("pixscale", Number(pixscale).toFixed(5));
  url.searchParams.set("size", imageSize);
  return url;
}
);
  main.variable(observer()).define(["html","imageURL"], function(html,imageURL){return(
html`Use <a href=${imageURL}>this link</a> to view the Legacy survey image for this data.`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Use the version hosted on github instead of a FileAttachment`
)});
  main.variable(observer("bgImageURL")).define("bgImageURL", function(){return(
"https://dkirkby.github.io/desi3d/img/rosette15-unwise-neo6.jpg"
)});
  main.variable(observer()).define(["md"], function(md){return(
md`### Geometry`
)});
  main.variable(observer("viewSize")).define("viewSize", ["width"], function(width){return(
Math.min(width, 800)
)});
  main.variable(observer()).define(["md"], function(md){return(
md`### 3D Rendering`
)});
  main.variable(observer("maxOrbitAngleDeg")).define("maxOrbitAngleDeg", function(){return(
15
)});
  main.variable(observer("camera")).define("camera", ["THREE"], function(THREE)
{
  const fov = 25;
  const aspect = 1;
  const near = 25;
  const far = 8000;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0,0,0);
  camera.lookAt(new THREE.Vector3(0,0,10000));
  return camera;
}
);
  main.variable(observer("sourceColor")).define("sourceColor", function(){return(
{
  BGS: "0xffff00",
  LRG: "0xff0000",
  ELG: "0x00ff00",
  QSO: "0x00ffff",
  LYA: "0xddffff"}
)});
  main.variable(observer("visibleTypes")).define("visibleTypes", ["sourceColor"], function(sourceColor){return(
Object.keys(sourceColor)
)});
  main.variable(observer()).define(["md"], function(md){return(
md`File attachments must be named statically so we list them all here`
)});
  main.variable(observer("textureURLs")).define("textureURLs", ["Types"], function(Types)
{
  const numTextures = 4;
  const base = "https://dkirkby.github.io/desi3d/img/";
  return Object.fromEntries(Types.map(ttype => [
    ttype,
    Array.from({length:numTextures}, (_,i) => base + ttype + i + ".png")
    ]));
}
);
  main.variable(observer("textures")).define("textures", ["THREE","textureURLs"], async function(THREE,textureURLs)
{
  const loader = new THREE.TextureLoader();
  const load = url => new Promise(async resolve => loader.load(url, resolve));
  const entries = Object.entries(textureURLs).map(async ([key, urls]) => {
    const textures = await Promise.all(urls.map(load));
    return [key, textures];
  });
  return Object.fromEntries(await Promise.all(entries));
}
);
  main.variable(observer("SceneObj")).define("SceneObj", ["THREE"], function(THREE){return(
class SceneObj {
  constructor(name, coords, minRedshift, maxRedshift) {
    // Find the indices passing the redshift cuts, assuming that the input coords are already sorted.
    const last = coords["z"].filter(z => z <=  maxRedshift).length;
    const first = coords["z"].slice(0,last).filter(z => z <= minRedshift).length;
    this.unitX = Float32Array.from(coords["phi"].slice(first,last), phi => Math.cos(phi));
    this.unitY = Float32Array.from(coords["phi"].slice(first,last), phi => Math.sin(phi));
    this.theta = Float32Array.from(coords["theta"].slice(first,last), mrad => 1e-3*mrad);
    this.redshift = Float32Array.from(coords["z"].slice(first,last));
    this.count = this.redshift.length;
    this.obj = new THREE.Group();
    this.obj.name = name;
  }
  needsUpdate() {
    for(const child of this.obj.children) {
      child.geometry.attributes.position.needsUpdate = true;
    }
  }
}
)});
  main.variable(observer("RNG")).define("RNG", ["RandomState"], function(RandomState){return(
new RandomState('desi3d')
)});
  main.variable(observer("SceneGalaxy")).define("SceneGalaxy", ["SceneObj","textures","arange","RNG","THREE","sourceColor","zeros","interp","redshiftGrid"], function(SceneObj,textures,arange,RNG,THREE,sourceColor,zeros,interp,redshiftGrid){return(
class SceneGalaxy extends SceneObj {
  constructor(name, coords, minRedshift, maxRedshift, size) {
    super(name, coords, minRedshift, maxRedshift);
    const nChunks = textures[name].length;
    this.chunks = arange(nChunks + 1, {dtype:Int32Array}).map(n => Math.round(n*this.count/nChunks));
    this.shuffle = RNG.shuffle(arange(this.count, {dtype:Int32Array}));
    this.xyzs = [];
    for(let j=0; j<nChunks; j++) {
      const [lo,hi] = this.chunks.slice(j,j+2);
      const material = new THREE.PointsMaterial({
        size: size, map: textures[name][j], color: Number.parseInt(sourceColor[name]),
        alphaTest:0.5, transparent: true});
      const xyz = zeros(3*(hi-lo), {dtype:Float32Array});
      this.xyzs.push(xyz);
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(xyz, 3));
      this.obj.add(new THREE.Points(geometry, material));
    }
  }
  updateComoving(distanceGrid, transverseGrid) {
    const z = interp(this.redshift, redshiftGrid, distanceGrid);
    const zt = interp(this.redshift, redshiftGrid, transverseGrid);
    for(let j=0; j<this.chunks.length-1; j++) {
      const [lo,hi] = this.chunks.slice(j,j+2);
      for(let i=lo; i<hi; i++) {
        const k = this.shuffle[i];
        const rperp = zt[k] * this.theta[k];
        const xyz = this.xyzs[j];
        const base=3*(i-lo);
        xyz[base + 0] = rperp * this.unitX[k];
        xyz[base + 1] = rperp * this.unitY[k];
        xyz[base + 2] = z[k];
      }
    }
    this.needsUpdate();
  }
}
)});
  main.variable(observer("SceneLineOfSight")).define("SceneLineOfSight", ["SceneObj","THREE","sourceColor","zeros","interp","redshiftGrid"], function(SceneObj,THREE,sourceColor,zeros,interp,redshiftGrid){return(
class SceneLineOfSight extends SceneObj {
  constructor(name, coords, minRedshift, maxRedshift) {
    super(name, coords, minRedshift, maxRedshift);
    this.minRedshift = minRedshift;
    const material = new THREE.LineBasicMaterial({color: Number.parseInt(sourceColor[name]), linewidth: 1});
    this.xyz = zeros(6 * this.count, {dtype:Float32Array});
    this.geometry = new THREE.BufferGeometry();
    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.xyz, 3));
    this.obj.add(new THREE.LineSegments(this.geometry, material));
  }
  updateComoving(distanceGrid, transverseGrid) {
    const z1 = interp(this.minRedshift, redshiftGrid, distanceGrid);
    const z2 = interp(this.redshift, redshiftGrid, distanceGrid);
    const zt1 = interp(this.minRedshift, redshiftGrid, transverseGrid);
    const zt2 = interp(this.redshift, redshiftGrid, transverseGrid);
    for(let i=0; i < this.count; i++) {
      const rperp1 = zt1 * this.theta[i];
      const rperp2 = zt2[i] * this.theta[i];
      this.xyz[6*i + 0] = rperp1 * this.unitX[i];
      this.xyz[6*i + 1] = rperp1 * this.unitY[i];
      this.xyz[6*i + 2] = z1;
      this.xyz[6*i + 3] = rperp2 * this.unitX[i];
      this.xyz[6*i + 4] = rperp2 * this.unitY[i];
      this.xyz[6*i + 5] = z2[i];
    }
    this.needsUpdate();
  }
}
)});
  main.variable(observer("SceneObjects")).define("SceneObjects", ["SceneGalaxy","catalog","SceneLineOfSight"], function(SceneGalaxy,catalog,SceneLineOfSight){return(
{
  BGS: new SceneGalaxy("BGS", catalog["BGS"], 0.1, 0.5, 2),
  LRG: new SceneGalaxy("LRG", catalog["LRG"], 0.3, 1.4, 6),
  ELG: new SceneGalaxy("ELG", catalog["ELG"], 0.4, 1.9, 6),
  QSO: new SceneGalaxy("QSO", catalog["QSO"], 0.9, 5.0, 6),
  LYA: new SceneLineOfSight("LYA", catalog["QSO"], 2.1, 5.0)
}
)});
  main.variable(observer()).define(["SceneObjects"], function(SceneObjects){return(
SceneObjects["BGS"].count + SceneObjects["LRG"].count + SceneObjects["ELG"].count + SceneObjects["QSO"].count
)});
  main.variable(observer("createRings")).define("createRings", ["zeros","THREE"], function(zeros,THREE){return(
function(distances, radius, nSegments=48, color=0xffffff) {
  const nRings = distances.length;
  const xyz = zeros(6 * nSegments * nRings, {dtype:Float32Array});
  const dPhi = 2 * Math.PI / nSegments;
  let [x1, y1, x2, y2] = [0, 0, radius, 0];
  for(let i=0; i<nSegments; i++) {
    [x1, y1] = [x2, y2];
    const phi = dPhi * (i+1);
    x2 = radius * Math.cos(phi);
    y2 = radius * Math.sin(phi);
    for(let j=0; j<nRings; j++) {
      const z = distances[j];
      const base = 6 * (nSegments * j + i);
      xyz[base + 0] = x1;
      xyz[base + 1] = y1;
      xyz[base + 2] = z;
      xyz[base + 3] = x2;
      xyz[base + 4] = y2;
      xyz[base + 5] = z;
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(xyz, 3));
  const material = new THREE.LineBasicMaterial({color: color, linewidth: 1});
  const rings = new THREE.LineSegments(geometry, material);
  rings.name = "rings";
  return rings;
}
)});
  main.variable(observer("scene")).define("scene", ["THREE","visibleTypes","SceneObjects","createRings","linspace"], function(THREE,visibleTypes,SceneObjects,createRings,linspace)
{
  const scene = new THREE.Scene();
  //scene.background = new THREE.Color(0x000000);
  scene.fog = new THREE.FogExp2(0x000000, 0.001);
  for(const T of visibleTypes) scene.add(SceneObjects[T].obj);
  scene.add(createRings(linspace(600, 6000, 19), 150));
  return scene;
}
);
  main.variable(observer("toggled")).define("toggled", ["universe","showTypes"], function(universe,showTypes)
{
  universe.updateVisibility(showTypes);
  return true;
}
);
  main.variable(observer("animated")).define("animated", ["universe","cameraDistance"], function(universe,cameraDistance)
{
  universe.updateView(cameraDistance);
  return true;
}
);
  main.variable(observer("dynamic")).define("dynamic", ["universe","cosmologyModel"], function(universe,cosmologyModel)
{
  universe.updateCosmology(cosmologyModel);
  return true;
}
);
  main.variable(observer()).define(["md"], function(md){return(
md`### Cosmology`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Use a two-parameter (matter,DE) model with fixed w=-1, radiation and H0 but unconstrained curvature`
)});
  main.variable(observer("H0")).define("H0", ["Planck15"], function(Planck15){return(
Planck15.H0.value
)});
  main.variable(observer("Orad0")).define("Orad0", ["Planck15"], function(Planck15){return(
Planck15.Ogamma0 + Planck15.Onu0
)});
  main.variable(observer("cosmologyModel")).define("cosmologyModel", ["FluidsModel","Orad0","Om0","Ode0","H0"], function(FluidsModel,Orad0,Om0,Ode0,H0){return(
new FluidsModel(Orad0, Om0, Ode0, H0)
)});
  main.variable(observer("cameraDistance")).define("cameraDistance", ["cosmologyModel","cameraRedshift"], function(cosmologyModel,cameraRedshift){return(
cosmologyModel.comoving_distance(0, cameraRedshift)
)});
  main.variable(observer("universeAge")).define("universeAge", ["cosmologyModel"], function(cosmologyModel){return(
cosmologyModel.age
)});
  main.variable(observer("universeSize")).define("universeSize", ["cosmologyModel"], function(cosmologyModel){return(
cosmologyModel.horizon
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Define the model to draw the initial view, which should not be reactive to the cosmology sliders`
)});
  main.variable(observer("initialModel")).define("initialModel", ["Planck15"], function(Planck15){return(
Planck15
)});
  main.variable(observer("Om0Default")).define("Om0Default", ["Planck15"], function(Planck15){return(
Planck15.Om0
)});
  main.variable(observer("Ode0Default")).define("Ode0Default", ["Planck15"], function(Planck15){return(
Planck15.Ode0
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Build (redshift,distance) lookup tables for interpolating comoving coordinates`
)});
  main.variable(observer("nGrid")).define("nGrid", function(){return(
100
)});
  main.variable(observer("redshiftGrid")).define("redshiftGrid", ["linspace","redshiftMax","nGrid"], function(linspace,redshiftMax,nGrid){return(
linspace(0, redshiftMax+0.1, nGrid)
)});
  main.variable(observer("applyCosmology")).define("applyCosmology", ["redshiftGrid","visibleTypes","SceneObjects"], function(redshiftGrid,visibleTypes,SceneObjects){return(
function(cosmo) {
  const distanceGrid = cosmo.gridz(redshiftGrid, "comoving_distance");
  const transverseGrid = distanceGrid.map(d => cosmo.Sk(d));
  for(const T of visibleTypes) SceneObjects[T].updateComoving(distanceGrid, transverseGrid);
}
)});
  main.variable(observer()).define(["md"], function(md){return(
md`### Catalog`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Load a catalog of observed angles and redshifts.`
)});
  main.variable(observer("catalog")).define("catalog", ["blob2text","png2blob"], async function(blob2text,png2blob){return(
JSON.parse(
  await blob2text(
    await png2blob("https://dkirkby.github.io/desi3d/img/aleatoire.png")))
)});
  main.variable(observer("Types")).define("Types", ["catalog"], function(catalog){return(
catalog["ttypes"]
)});
  main.variable(observer("counts")).define("counts", ["Types","catalog"], function(Types,catalog){return(
Types.map(T => catalog[T]["z"].length).reduce((a, b) => a + b, 0)
)});
  main.variable(observer()).define(["md"], function(md){return(
md`Find the maximum redshift in the catalog`
)});
  main.variable(observer("redshiftMax")).define("redshiftMax", ["Types","catalog"], function(Types,catalog){return(
Math.max(...Types.map(T => Math.max(...catalog[T]["z"])))
)});
  main.variable(observer("png2blob")).define("png2blob", ["DOM","decode"], function(DOM,decode){return(
async function png2blob(src, {channels = 3} = {}) {
  const img = DOM.element('img', {crossorigin: 'anonymous', src});
  await img.decode();
  const {naturalWidth: width, naturalHeight: height} = img;
  const ctx = DOM.element('canvas', {width, height}).getContext('2d');
  ctx.drawImage(img, 0, 0);
  return decode(ctx.getImageData(0, 0, width, height), {channels});
}
)});
  main.variable(observer("decode")).define("decode", ["EOF"], function(EOF){return(
function decode(imgData, {channels = 4, eofMarker = EOF} = {}) {
  const d = imgData.data;
  const arr = new Uint8Array(d.length / 4 * channels);
  for(let i = 0, j = 0; i < d.length; (i += 4), (j += 4 - channels)) {
    arr.set(d.slice(i, i + channels), i - j);
  }

  let len = arr.length;
  while(len > 0 && arr[len-1] !== eofMarker) len--;
  return new Blob([arr.slice(0, len-1)]);
}
)});
  main.variable(observer("blob2text")).define("blob2text", ["Response"], function(Response){return(
async function blob2text(blob) {
  return new Response(blob).text();
}
)});
  main.variable(observer("EOF")).define("EOF", function(){return(
123
)});
  main.variable(observer()).define(["md"], function(md){return(
md`---`
)});
  main.variable(observer("THREE")).define("THREE", ["require"], async function(require)
{
  // Using the recipe in https://observablehq.com/@observablehq/how-to-require-stubborn-modules
  const THREE = window.THREE = await require("three@0.127.0/build/three.min.js");
  await require("three@0.127.0/examples/js/controls/OrbitControls.js").catch(() => {});
  await require("three@0.127.0/examples/js/lines/LineMaterial.js").catch(() => {});
  //const THREE = window.THREE = await require('three');
  //await require('three/examples/js/controls/OrbitControls.js').catch(() => {});
  return THREE;
}
);
  const child1 = runtime.module(define1);
  main.import("Scrubber", child1);
  const child2 = runtime.module(define2);
  main.import("Range", child2);
  main.import("Checkbox", child2);
  const child3 = runtime.module(define3);
  main.import("Planck15", child3);
  main.import("FluidsModel", child3);
  const child4 = runtime.module(define4);
  main.import("zeros", child4);
  main.import("linspace", child4);
  main.import("interp", child4);
  main.import("arange", child4);
  const child5 = runtime.module(define5);
  main.import("RandomState", child5);
  const child6 = runtime.module(define6);
  main.import("interleave", child6);
  return main;
}
