"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ThreeModule = typeof import("three");
type Group = import("three").Group;
type Mesh = import("three").Mesh;
type PerspectiveCamera = import("three").PerspectiveCamera;
type Scene = import("three").Scene;
type WebGLRenderer = import("three").WebGLRenderer;

type LakeHeightmapAsset = {
  cols: number;
  rows: number;
  widthMm: number;
  lengthMm: number;
  baseThicknessMm: number;
  minTopMm: number;
  maxTopMm: number;
  heightsMm: number[];
};

const HEIGHTMAP_URL = "/assets/lake-monomonac-web-heightmap.json";
const TOP_TEXTURE_URL = "/assets/lake-monomonac-prize-texture.png";
const UNDERSIDE_LOGO_URL = "/assets/lake-monomonac-underside-logo-mark.png";

const BASE_GREEN = 0x748000;
const WATER_BLUE = 0x0a2989;
const MODEL_WIDTH_WORLD = 3;
const INITIAL_SPIN_Y = -0.08;
const TOP_TILT_X = 0;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function makeTerrainGeometry(THREE: ThreeModule, data: LakeHeightmapAsset) {
  const unitScale = MODEL_WIDTH_WORLD / data.widthMm;
  const worldWidth = MODEL_WIDTH_WORLD;
  const worldLength = data.lengthMm * unitScale;
  const maxTop = data.maxTopMm * unitScale;
  const centerY = maxTop * 0.5;
  const cols = data.cols;
  const rows = data.rows;
  const positions = new Float32Array(cols * rows * 3);
  const uvs = new Float32Array(cols * rows * 2);
  const indices: number[] = [];
  const topYByIndex = new Float32Array(cols * rows);

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const index = row * cols + col;
      const x = (col / (cols - 1) - 0.5) * worldWidth;
      const z = (row / (rows - 1) - 0.5) * worldLength;
      const y = data.heightsMm[index] * unitScale - centerY;
      const positionIndex = index * 3;
      const uvIndex = index * 2;

      positions[positionIndex] = x;
      positions[positionIndex + 1] = y;
      positions[positionIndex + 2] = z;
      topYByIndex[index] = y;

      uvs[uvIndex] = col / (cols - 1);
      uvs[uvIndex + 1] = 1 - row / (rows - 1);
    }
  }

  for (let row = 0; row < rows - 1; row += 1) {
    for (let col = 0; col < cols - 1; col += 1) {
      const a = row * cols + col;
      const b = a + 1;
      const c = a + cols;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return {
    geometry,
    topYByIndex,
    worldWidth,
    worldLength,
    bottomY: -centerY,
    unitScale
  };
}

function makeSideGeometry(
  THREE: ThreeModule,
  data: LakeHeightmapAsset,
  topYByIndex: Float32Array,
  worldWidth: number,
  worldLength: number,
  bottomY: number
) {
  const cols = data.cols;
  const rows = data.rows;
  const positions: number[] = [];
  const indices: number[] = [];

  const appendWall = (edge: Array<{ x: number; y: number; z: number }>) => {
    for (let index = 0; index < edge.length - 1; index += 1) {
      const current = edge[index];
      const next = edge[index + 1];
      const start = positions.length / 3;

      positions.push(
        current.x,
        current.y,
        current.z,
        next.x,
        next.y,
        next.z,
        next.x,
        bottomY,
        next.z,
        current.x,
        bottomY,
        current.z
      );
      indices.push(start, start + 1, start + 2, start, start + 2, start + 3);
    }
  };

  const makePoint = (row: number, col: number) => {
    const index = row * cols + col;

    return {
      x: (col / (cols - 1) - 0.5) * worldWidth,
      y: topYByIndex[index],
      z: (row / (rows - 1) - 0.5) * worldLength
    };
  };

  appendWall(Array.from({ length: cols }, (_, col) => makePoint(0, col)));
  appendWall(Array.from({ length: rows }, (_, row) => makePoint(row, cols - 1)));
  appendWall(Array.from({ length: cols }, (_, col) => makePoint(rows - 1, cols - 1 - col)));
  appendWall(Array.from({ length: rows }, (_, row) => makePoint(rows - 1 - row, 0)));

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

function disposeScene(scene: Scene, renderer: WebGLRenderer) {
  scene.traverse((object) => {
    const mesh = object as Mesh;

    if (mesh.geometry) {
      mesh.geometry.dispose();
    }

    const material = mesh.material;

    if (Array.isArray(material)) {
      material.forEach((entry) => entry.dispose());
    } else if (material) {
      material.dispose();
    }
  });

  renderer.dispose();
}

export function PrizeObjectViewer() {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const cameraRef = useRef<PerspectiveCamera | null>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const spinGroupRef = useRef<Group | null>(null);
  const tiltGroupRef = useRef<Group | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    spinY: number;
    tiltX: number;
  } | null>(null);
  const isSpinningRef = useRef(true);
  const targetSpinYRef = useRef(INITIAL_SPIN_Y);
  const targetTiltXRef = useRef(TOP_TILT_X);
  const [loadError, setLoadError] = useState(false);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const spinGroup = spinGroupRef.current;
    const tiltGroup = tiltGroupRef.current;

    if (!spinGroup || !tiltGroup) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      spinY: spinGroup.rotation.y,
      tiltX: tiltGroup.rotation.x
    };
  }, []);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    targetSpinYRef.current = drag.spinY + (event.clientX - drag.startX) * 0.008;
    targetTiltXRef.current = clamp(drag.tiltX + (event.clientY - drag.startY) * 0.006, -2.9, 0.7);
  }, []);

  const clearDrag = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;

    if (drag?.pointerId === event.pointerId) {
      dragRef.current = null;
    }
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (mediaQuery.matches) {
      isSpinningRef.current = false;
    }
  }, []);

  useEffect(() => {
    const mount = mountRef.current;

    if (!mount) {
      return;
    }

    let scene: Scene | null = null;
    let renderer: WebGLRenderer | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let disposed = false;

    const init = async () => {
      const [THREE, heightResponse] = await Promise.all([import("three"), fetch(HEIGHTMAP_URL)]);

      if (!heightResponse.ok) {
        throw new Error(`Failed to load ${HEIGHTMAP_URL}`);
      }

      if (disposed) {
        return;
      }

      const heightData = (await heightResponse.json()) as LakeHeightmapAsset;
      const {
        geometry: terrainGeometry,
        topYByIndex,
        worldWidth,
        worldLength,
        bottomY,
        unitScale
      } = makeTerrainGeometry(THREE, heightData);

      scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
      camera.position.set(3.35, 2.25, 5.2);
      camera.lookAt(0, -0.02, 0);
      cameraRef.current = camera;

      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance"
      });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.domElement.setAttribute("aria-label", "Rotating Lake Monomonac 3D prize model");
      renderer.domElement.dataset.prizeModelCanvas = "true";
      rendererRef.current = renderer;
      mount.appendChild(renderer.domElement);

      const textureLoader = new THREE.TextureLoader();
      const topTexture = textureLoader.load(TOP_TEXTURE_URL);
      topTexture.colorSpace = THREE.SRGBColorSpace;
      topTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

      const logoTexture = textureLoader.load(UNDERSIDE_LOGO_URL);
      logoTexture.colorSpace = THREE.SRGBColorSpace;
      logoTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

      const topMaterial = new THREE.MeshStandardMaterial({
        map: topTexture,
        roughness: 0.74,
        metalness: 0.03,
        side: THREE.DoubleSide
      });
      const sideMaterial = new THREE.MeshStandardMaterial({
        color: BASE_GREEN,
        roughness: 0.8,
        metalness: 0.02,
        side: THREE.DoubleSide
      });
      const undersideLogoMaterial = new THREE.MeshBasicMaterial({
        color: WATER_BLUE,
        map: logoTexture,
        transparent: true,
        alphaTest: 0.05,
        depthWrite: false,
        side: THREE.DoubleSide
      });

      const terrain = new THREE.Mesh(terrainGeometry, topMaterial);
      const sideGeometry = makeSideGeometry(
        THREE,
        heightData,
        topYByIndex,
        worldWidth,
        worldLength,
        bottomY
      );
      const sides = new THREE.Mesh(sideGeometry, sideMaterial);

      const bottom = new THREE.Mesh(new THREE.PlaneGeometry(worldWidth, worldLength), sideMaterial);
      bottom.rotation.x = -Math.PI / 2;
      bottom.position.y = bottomY;

      const logo = new THREE.Mesh(
        new THREE.PlaneGeometry(worldWidth * 0.8, worldLength * 0.78),
        undersideLogoMaterial
      );
      logo.rotation.x = Math.PI / 2;
      logo.position.set(0, bottomY - 0.012 * unitScale, 0);

      const modelGroup = new THREE.Group();
      modelGroup.add(terrain, sides, bottom, logo);

      const tiltGroup = new THREE.Group();
      tiltGroup.rotation.x = TOP_TILT_X;
      tiltGroup.add(modelGroup);
      tiltGroupRef.current = tiltGroup;

      const spinGroup = new THREE.Group();
      spinGroup.rotation.y = INITIAL_SPIN_Y;
      spinGroup.add(tiltGroup);
      spinGroupRef.current = spinGroup;
      scene.add(spinGroup);

      const hemisphereLight = new THREE.HemisphereLight(0xfff7df, 0x1a2614, 2.1);
      const keyLight = new THREE.DirectionalLight(0xfff3cf, 2.7);
      keyLight.position.set(-3.8, 4.4, 5.6);
      const fillLight = new THREE.DirectionalLight(0x78b5ff, 0.75);
      fillLight.position.set(3.6, 1.5, -4.2);
      scene.add(hemisphereLight, keyLight, fillLight);

      const resize = () => {
        if (!renderer || !camera) {
          return;
        }

        const width = Math.max(mount.clientWidth, 1);
        const height = Math.max(mount.clientHeight, 1);
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        const spinGroupCurrent = spinGroupRef.current;

        if (spinGroupCurrent) {
          const isNarrow = width < 760;
          spinGroupCurrent.position.x = isNarrow ? 0.16 : 1.12;
          spinGroupCurrent.position.y = isNarrow ? -0.22 : -0.02;
          spinGroupCurrent.scale.setScalar(isNarrow ? 0.68 : 0.76);
        }
      };

      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(mount);
      resize();

      let lastTime = performance.now();
      const animate = (time: number) => {
        if (!renderer || !scene || !camera || !spinGroupRef.current || !tiltGroupRef.current) {
          return;
        }

        const delta = Math.min((time - lastTime) / 1000, 0.05);
        lastTime = time;

        if (isSpinningRef.current) {
          targetSpinYRef.current += delta * 0.18;
        }

        const spinGroupCurrent = spinGroupRef.current;
        const tiltGroupCurrent = tiltGroupRef.current;
        spinGroupCurrent.rotation.y += (targetSpinYRef.current - spinGroupCurrent.rotation.y) * 0.08;
        tiltGroupCurrent.rotation.x += (targetTiltXRef.current - tiltGroupCurrent.rotation.x) * 0.08;

        renderer.render(scene, camera);
        animationRef.current = window.requestAnimationFrame(animate);
      };

      animationRef.current = window.requestAnimationFrame(animate);
      setLoadError(false);
    };

    init().catch((error: unknown) => {
      console.error(error);
      setLoadError(true);
    });

    return () => {
      disposed = true;

      if (animationRef.current !== null) {
        window.cancelAnimationFrame(animationRef.current);
      }

      resizeObserver?.disconnect();

      if (scene && renderer) {
        disposeScene(scene, renderer);
      }

      if (renderer?.domElement.parentElement === mount) {
        mount.removeChild(renderer.domElement);
      }

      rendererRef.current = null;
      cameraRef.current = null;
      spinGroupRef.current = null;
      tiltGroupRef.current = null;
    };
  }, []);

  return (
    <section className="prize-viewer-app" aria-label="Lake Monomonac interactive prize viewer">
      <div
        className="prize-viewer-stage"
        onPointerCancel={clearDrag}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={clearDrag}
      >
        <div className="prize-viewer-glow" aria-hidden="true" />
        <div className="prize-viewer-shadow" aria-hidden="true" />
        <div ref={mountRef} className="prize-webgl-mount" />
        {loadError ? (
          <img
            className="prize-viewer-fallback"
            src="/assets/lake-monomonac-3d-print-preview.png"
            alt="Lake Monomonac 3D printed prize preview"
          />
        ) : null}
      </div>

      <div className="prize-viewer-copy">
        <h1>Lake Monomonac 2026</h1>
      </div>
    </section>
  );
}
