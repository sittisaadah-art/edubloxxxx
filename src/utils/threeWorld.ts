import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { BuildingData, Player, PlacedOrnament } from '../types/game';

export interface WorldCallbacks {
  onBuildingEnter?: (buildingCode: string) => void;
  onGroundClick?: (coords: { x: number; z: number }) => void;
  onProjectedPositions?: (tags: Array<{ id: number; name: string; color: string; x: number; y: number; visible: boolean; emoji: string }>) => void;
}

export class ThreeWorld {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  private canvas: HTMLCanvasElement;
  private isSoftwareGl: boolean;
  private pmremGenerator: THREE.PMREMGenerator;

  // Meshes & Groups
  private playerMeshMap: Map<number, THREE.Group> = new Map();
  private buildingMeshMap: Map<string, THREE.Group> = new Map();
  private ornamentMeshMap: Map<string, THREE.Group> = new Map();
  private crystalMonument: THREE.Mesh | null = null;
  private cloudsGroup: THREE.Group = new THREE.Group();
  private groundMesh: THREE.Mesh | null = null;

  // Camera & Controls state
  public cameraAngle: number = Math.PI / 4;
  public cameraDistance: number = 110;
  public cameraHeight: number = 75;
  public isAutoOrbit: boolean = false;
  public cameraFocusMode: 'ALL' | number = 'ALL';

  // Raycasting & Interaction
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private mouse: THREE.Vector2 = new THREE.Vector2();
  private lastQuizTriggerTime: number = 0;
  private frameId: number = 0;
  private isDisposed: boolean = false;

  public callbacks: WorldCallbacks = {};
  public playersRef: Player[] = [];
  public buildingsRef: Record<string, BuildingData> = {};

  constructor(canvas: HTMLCanvasElement, callbacks: WorldCallbacks) {
    this.canvas = canvas;
    this.callbacks = callbacks;

    // Detect software WebGL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // Initialize Scene & Fog
    this.scene = new THREE.Scene();
    const skyColor = new THREE.Color(0x7dd3fc); // Light sky blue
    this.scene.background = skyColor;
    this.scene.fog = new THREE.FogExp2(0x7dd3fc, 0.0022);

    // Camera setup
    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      1200
    );

    // Renderer configuration
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.setPixelRatio(
      this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2)
    );
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Studio Environment
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = this.pmremGenerator.fromScene(
      new RoomEnvironment(),
      0.04
    ).texture;

    // Lighting rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 0.4);
    this.scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfffaed, 0.95);
    sunLight.position.set(100, 150, 80);
    sunLight.castShadow = !this.isSoftwareGl;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 400;
    const d = 160;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.02;
    this.scene.add(sunLight);

    // Build the World
    this.buildGroundIsland();
    this.buildClouds();
    this.buildCenterMonument();
    this.buildFlora();

    // Event listeners
    window.addEventListener('resize', this.onResize);
    this.canvas.addEventListener('pointerdown', this.onPointerDown);

    // Initial Camera
    this.updateCameraPosition();

    // Start Animation Loop
    this.tick = this.tick.bind(this);
    this.tick();
  }

  // 260x260 Studs Roblox Island
  private buildGroundIsland() {
    const islandGeo = new THREE.BoxGeometry(260, 8, 260);
    const islandMat = new THREE.MeshStandardMaterial({
      color: 0x4ade80, // Lush grass green
      roughness: 0.8,
    });
    this.groundMesh = new THREE.Mesh(islandGeo, islandMat);
    this.groundMesh.position.y = -4;
    this.groundMesh.receiveShadow = true;
    this.scene.add(this.groundMesh);

    // Yellow Roads
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      roughness: 0.6,
    });
    const roadH = new THREE.Mesh(new THREE.PlaneGeometry(240, 24), roadMat);
    roadH.rotation.x = -Math.PI / 2;
    roadH.position.y = 0.05;
    roadH.receiveShadow = true;
    this.scene.add(roadH);

    const roadV = new THREE.Mesh(new THREE.PlaneGeometry(24, 240), roadMat);
    roadV.rotation.x = -Math.PI / 2;
    roadV.position.y = 0.06;
    roadV.receiveShadow = true;
    this.scene.add(roadV);

    // Central circular plaza
    const plazaMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.4,
    });
    const plaza = new THREE.Mesh(
      new THREE.CylinderGeometry(28, 28, 0.25, 36),
      plazaMat
    );
    plaza.position.y = 0.12;
    plaza.receiveShadow = true;
    this.scene.add(plaza);
  }

  // Rotating Octahedron Crystal Monument with 3D Billboard
  private buildCenterMonument() {
    const group = new THREE.Group();
    group.position.set(0, 0, 0);

    const baseGeo = new THREE.CylinderGeometry(8, 10, 4, 12);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.3,
      metalness: 0.2,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 2;
    base.castShadow = true;
    base.receiveShadow = true;
    group.add(base);

    // Octahedron crystal
    const crystalGeo = new THREE.OctahedronGeometry(5, 0);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.85,
      roughness: 0.1,
      emissive: 0x78350f,
    });
    this.crystalMonument = new THREE.Mesh(crystalGeo, crystalMat);
    this.crystalMonument.position.y = 10;
    this.crystalMonument.castShadow = true;
    group.add(this.crystalMonument);

    // 3D Billboard label atop monument
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 140;
    const ctx = canvas.getContext('2d')!;

    // Background banner
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(10, 10, 492, 120, 24);
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Edublox City By Sitty', 256, 58);
    ctx.font = 'bold 22px Nunito, sans-serif';
    ctx.fillText('Informatika Kelas VIII • Kota Algoritma', 256, 98);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const spriteMat = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(30, 8.2, 1);
    sprite.position.y = 20;
    group.add(sprite);

    this.scene.add(group);
  }

  // Floating Stylized Blocky Clouds
  private buildClouds() {
    this.cloudsGroup = new THREE.Group();
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
    });

    for (let i = 0; i < 14; i++) {
      const cloud = new THREE.Group();
      for (let j = 0; j < 5; j++) {
        const piece = new THREE.Mesh(
          new THREE.BoxGeometry(
            12 + Math.random() * 8,
            6 + Math.random() * 4,
            12 + Math.random() * 8
          ),
          cloudMat
        );
        piece.position.set(
          j * 6 - 12,
          Math.random() * 2,
          (Math.random() - 0.5) * 8
        );
        cloud.add(piece);
      }
      cloud.position.set(
        (Math.random() - 0.5) * 240,
        55 + Math.random() * 25,
        (Math.random() - 0.5) * 240
      );
      this.cloudsGroup.add(cloud);
    }
    this.scene.add(this.cloudsGroup);
  }

  // Flora: Trees & Flowerbeds
  private buildFlora() {
    const treeCoords = [
      { x: -35, z: -35, type: 'oak' },
      { x: 35, z: -35, type: 'pine' },
      { x: -35, z: 35, type: 'sakura' },
      { x: 35, z: 35, type: 'oak' },
      { x: -105, z: -105, type: 'pine' },
      { x: 105, z: -105, type: 'oak' },
      { x: -105, z: 105, type: 'sakura' },
      { x: 105, z: 105, type: 'pine' },
      { x: 0, z: -45, type: 'sakura' },
      { x: 0, z: 45, type: 'oak' },
      { x: -45, z: 0, type: 'pine' },
      { x: 45, z: 0, type: 'sakura' },
      { x: -90, z: 0, type: 'oak' },
      { x: 90, z: 0, type: 'sakura' },
    ];

    treeCoords.forEach((p) => {
      const tree = this.createTreeMesh(p.type as 'oak' | 'pine' | 'sakura');
      tree.position.set(p.x, 0, p.z);
      this.scene.add(tree);
    });
  }

  private createTreeMesh(type: 'oak' | 'pine' | 'sakura') {
    const group = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.8,
    });
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.8, 10, 6),
      trunkMat
    );
    trunk.position.y = 5;
    trunk.castShadow = !this.isSoftwareGl;
    trunk.receiveShadow = true;
    group.add(trunk);

    let leafColor = 0x16a34a; // Oak Green
    if (type === 'pine') leafColor = 0x065f46; // Dark Pine
    if (type === 'sakura') leafColor = 0xf472b6; // Sakura Pink

    const leafMat = new THREE.MeshStandardMaterial({
      color: leafColor,
      roughness: 0.6,
    });

    if (type === 'pine') {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(6, 14, 5), leafMat);
      cone.position.y = 15;
      cone.castShadow = !this.isSoftwareGl;
      group.add(cone);
    } else {
      for (let i = 0; i < 3; i++) {
        const leaves = new THREE.Mesh(
          new THREE.BoxGeometry(8 - i * 2, 5, 8 - i * 2),
          leafMat
        );
        leaves.position.y = 11 + i * 4;
        leaves.castShadow = !this.isSoftwareGl;
        group.add(leaves);
      }
    }
    return group;
  }

  // Update Buildings based on dynamic data
  public updateBuildings(buildings: Record<string, BuildingData>) {
    this.buildingsRef = buildings;

    // Remove existing buildings
    this.buildingMeshMap.forEach((mesh) => this.scene.remove(mesh));
    this.buildingMeshMap.clear();

    Object.keys(buildings).forEach((code) => {
      const b = buildings[code];
      const group = new THREE.Group();
      group.position.set(b.pos.x, 0, b.pos.z);

      // Main Block (32x22x32)
      const mainMat = new THREE.MeshStandardMaterial({
        color: b.color,
        roughness: 0.45,
      });
      const mainMesh = new THREE.Mesh(
        new THREE.BoxGeometry(32, 22, 32),
        mainMat
      );
      mainMesh.position.y = 11;
      mainMesh.castShadow = !this.isSoftwareGl;
      mainMesh.receiveShadow = true;
      group.add(mainMesh);

      // Modern Dark Roof Rim
      const roofMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.3,
      });
      const roof = new THREE.Mesh(new THREE.BoxGeometry(34, 4, 34), roofMat);
      roof.position.y = 24;
      roof.castShadow = !this.isSoftwareGl;
      group.add(roof);

      // Double Glass Entrance Door
      const doorMat = new THREE.MeshStandardMaterial({
        color: 0xf8fafc,
        metalness: 0.2,
        roughness: 0.2,
      });
      const door = new THREE.Mesh(new THREE.BoxGeometry(8, 12, 1.5), doorMat);
      door.position.set(0, 6, 16.5);
      door.receiveShadow = true;
      group.add(door);

      // 3D Billboard Sign atop Building
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext('2d')!;

      ctx.fillStyle = b.colorHex;
      ctx.fillRect(0, 0, 512, 256);
      ctx.lineWidth = 14;
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(8, 8, 496, 240);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 58px Fredoka, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${b.icon} GEDUNG ${b.code}`, 256, 88);

      ctx.font = 'bold 28px Nunito, sans-serif';
      ctx.fillText(b.title, 256, 155);

      ctx.font = 'bold 22px Nunito, sans-serif';
      ctx.fillText('Informatika Kelas VIII', 256, 202);

      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      const spriteMat = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.scale.set(28, 14, 1);
      sprite.position.y = 35;
      group.add(sprite);

      this.scene.add(group);
      this.buildingMeshMap.set(code, group);
    });
  }

  // Update Players 3D Characters
  public updatePlayers(players: Player[]) {
    this.playersRef = players;

    // Remove old player meshes
    this.playerMeshMap.forEach((mesh) => this.scene.remove(mesh));
    this.playerMeshMap.clear();

    players.forEach((p, idx) => {
      const pGroup = new THREE.Group();
      pGroup.position.set(p.pos.x, 0, p.pos.z);

      // Blocky Torso
      const torsoMat = new THREE.MeshStandardMaterial({
        color: p.color,
        roughness: 0.4,
      });
      const torso = new THREE.Mesh(new THREE.BoxGeometry(3, 4, 1.8), torsoMat);
      torso.position.y = 3.5;
      torso.castShadow = !this.isSoftwareGl;
      pGroup.add(torso);

      // Head (Yellow Classic Roblox)
      const headMat = new THREE.MeshStandardMaterial({
        color: 0xfde047,
        roughness: 0.3,
      });
      const head = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.4, 2.4), headMat);
      head.position.y = 6.7;
      head.castShadow = !this.isSoftwareGl;
      pGroup.add(head);

      // Face Decal / Eyes & Smile
      const faceCanvas = document.createElement('canvas');
      faceCanvas.width = 128;
      faceCanvas.height = 128;
      const fCtx = faceCanvas.getContext('2d')!;
      fCtx.fillStyle = '#fde047';
      fCtx.fillRect(0, 0, 128, 128);
      // Eyes
      fCtx.fillStyle = '#0f172a';
      fCtx.beginPath();
      fCtx.arc(40, 50, 8, 0, Math.PI * 2);
      fCtx.arc(88, 50, 8, 0, Math.PI * 2);
      fCtx.fill();
      // Smile
      fCtx.lineWidth = 6;
      fCtx.beginPath();
      fCtx.arc(64, 75, 20, 0.1 * Math.PI, 0.9 * Math.PI, false);
      fCtx.stroke();

      const faceTex = new THREE.CanvasTexture(faceCanvas);
      faceTex.colorSpace = THREE.SRGBColorSpace;
      const facePlane = new THREE.Mesh(
        new THREE.PlaneGeometry(2.3, 2.3),
        new THREE.MeshBasicMaterial({ map: faceTex })
      );
      facePlane.position.set(0, 6.7, 1.25);
      pGroup.add(facePlane);

      // Legs
      const legMat = new THREE.MeshStandardMaterial({
        color: 0x1e293b,
        roughness: 0.6,
      });
      const legL = new THREE.Mesh(new THREE.BoxGeometry(1.3, 3.5, 1.6), legMat);
      legL.position.set(-0.75, 1.75, 0);
      legL.castShadow = !this.isSoftwareGl;
      pGroup.add(legL);

      const legR = new THREE.Mesh(new THREE.BoxGeometry(1.3, 3.5, 1.6), legMat);
      legR.position.set(0.75, 1.75, 0);
      legR.castShadow = !this.isSoftwareGl;
      pGroup.add(legR);

      // Hat Accessory
      this.addAvatarHat(pGroup, p.avatar);

      // 3D Overhead Name Sprite
      const nameSprite = this.createPlayerOverheadSprite(p);
      nameSprite.position.y = 10.5;
      pGroup.add(nameSprite);

      this.scene.add(pGroup);
      this.playerMeshMap.set(idx, pGroup);
    });

    this.updateCameraPosition();
  }

  private addAvatarHat(parent: THREE.Group, avatar: Player['avatar']) {
    if (avatar === 'raja') {
      const crownMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.85,
        roughness: 0.2,
      });
      const crown = new THREE.Mesh(
        new THREE.CylinderGeometry(1.5, 1.2, 1, 6),
        crownMat
      );
      crown.position.y = 8.4;
      parent.add(crown);
    } else if (avatar === 'neko') {
      const earMat = new THREE.MeshStandardMaterial({ color: 0xec4899 });
      const earL = new THREE.Mesh(new THREE.ConeGeometry(0.5, 1, 4), earMat);
      earL.position.set(-0.8, 8.4, 0);
      parent.add(earL);
      const earR = earL.clone();
      earR.position.set(0.8, 8.4, 0);
      parent.add(earR);
    } else if (avatar === 'penyihir') {
      const hatMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6 });
      const hat = new THREE.Mesh(new THREE.ConeGeometry(1.5, 3.5, 8), hatMat);
      hat.position.y = 9.3;
      parent.add(hat);
    } else if (avatar === 'kesatria') {
      const helmMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        metalness: 0.5,
      });
      const cap = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.6, 2.6), helmMat);
      cap.position.y = 8.2;
      parent.add(cap);
    } else if (avatar === 'kapten') {
      const antMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8 });
      const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2), antMat);
      ant.position.y = 8.9;
      parent.add(ant);
      const star = new THREE.Mesh(
        new THREE.SphereGeometry(0.4, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xfacc15, emissive: 0xca8a04 })
      );
      star.position.y = 10;
      parent.add(star);
    }
  }

  private createPlayerOverheadSprite(player: Player) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 96;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = player.colorHex;
    ctx.beginPath();
    ctx.roundRect(8, 8, 240, 80, 20);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(player.name, 128, 56);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const spriteMat = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(12, 4.5, 1);
    return sprite;
  }

  // Update Ornaments dynamically
  public updateOrnaments(ornaments: PlacedOrnament[]) {
    this.ornamentMeshMap.forEach((mesh) => this.scene.remove(mesh));
    this.ornamentMeshMap.clear();

    ornaments.forEach((orn) => {
      const mesh = this.createOrnamentMesh(orn.typeId, orn.quote);
      mesh.position.set(orn.x, 0, orn.z);
      this.scene.add(mesh);
      this.ornamentMeshMap.set(orn.id, mesh);
    });
  }

  private createOrnamentMesh(typeId: string, quote?: string) {
    const group = new THREE.Group();
    const textQuote =
      quote ||
      'Berpikir Komputasional & Algoritma adalah kunci memecahkan masalah masa depan!';

    if (typeId === 'gazebo') {
      const baseMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(5.5, 5.5, 1, 8),
        baseMat
      );
      base.position.y = 0.5;
      group.add(base);

      // 4 Pillars
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const pillar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 0.3, 6),
          baseMat
        );
        pillar.position.set(Math.cos(angle) * 3.5, 3.5, Math.sin(angle) * 3.5);
        group.add(pillar);
      }

      const roofMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c });
      const roof = new THREE.Mesh(new THREE.ConeGeometry(6.5, 4, 8), roofMat);
      roof.position.y = 8;
      group.add(roof);

      const sprite = this.createTextSprite('⛩️ Gazebo Literasi', textQuote, '#10b981');
      sprite.position.y = 11;
      group.add(sprite);
    } else if (typeId === 'mading') {
      const boardMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b });
      const board = new THREE.Mesh(
        new THREE.BoxGeometry(8, 5, 0.5),
        boardMat
      );
      board.position.y = 5;
      group.add(board);

      const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
      const pole1 = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 5), poleMat);
      pole1.position.set(-3, 2.5, 0);
      group.add(pole1);
      const pole2 = pole1.clone();
      pole2.position.set(3, 2.5, 0);
      group.add(pole2);

      const sprite = this.createTextSprite('📋 Mading Informatika', textQuote, '#3b82f6');
      sprite.position.y = 9.5;
      group.add(sprite);
    } else if (typeId === 'fountain') {
      const poolMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        roughness: 0.1,
      });
      const pool = new THREE.Mesh(
        new THREE.CylinderGeometry(6, 6, 2, 16),
        poolMat
      );
      pool.position.y = 1;
      group.add(pool);

      const center = new THREE.Mesh(
        new THREE.CylinderGeometry(1.5, 2, 4, 8),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8 })
      );
      center.position.y = 3;
      group.add(center);

      const water = new THREE.Mesh(
        new THREE.SphereGeometry(2, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.85 })
      );
      water.position.y = 5.5;
      group.add(water);
    } else if (typeId === 'robot') {
      const rMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
      const body = new THREE.Mesh(new THREE.BoxGeometry(3, 4, 2), rMat);
      body.position.y = 3;
      group.add(body);
      const rHead = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), rMat);
      rHead.position.y = 6;
      group.add(rHead);
    } else if (typeId === 'cat_statue') {
      const catMat = new THREE.MeshStandardMaterial({ color: 0xf97316 });
      const cat = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 4), catMat);
      cat.position.y = 2;
      group.add(cat);
      const cHead = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.5, 2), catMat);
      cHead.position.set(0, 4, 1.5);
      group.add(cHead);
    } else {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(3, 3, 3),
        new THREE.MeshStandardMaterial({ color: 0xec4899 })
      );
      box.position.y = 1.5;
      group.add(box);
    }

    return group;
  }

  private createTextSprite(title: string, desc: string, colorHex: string) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(8, 8, 496, 144, 20);
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = colorHex;
    ctx.stroke();

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 30px Fredoka, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, 256, 48);

    ctx.fillStyle = '#475569';
    ctx.font = 'bold 18px Nunito, sans-serif';
    ctx.fillText(desc.substring(0, 45), 256, 88);
    ctx.fillText(desc.substring(45, 90), 256, 118);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const spriteMat = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(20, 6.25, 1);
    return sprite;
  }

  // Camera Management
  public updateCameraPosition() {
    if (this.cameraFocusMode === 'ALL') {
      let avgX = 0;
      let avgZ = 0;
      const count = this.playersRef.length || 1;
      this.playersRef.forEach((p) => {
        avgX += p.pos.x;
        avgZ += p.pos.z;
      });
      avgX /= count;
      avgZ /= count;

      this.camera.position.x = avgX + Math.sin(this.cameraAngle) * this.cameraDistance;
      this.camera.position.z = avgZ + Math.cos(this.cameraAngle) * this.cameraDistance;
      this.camera.position.y = this.cameraHeight;
      this.camera.lookAt(avgX, 0, avgZ);
    } else if (
      typeof this.cameraFocusMode === 'number' &&
      this.playersRef[this.cameraFocusMode]
    ) {
      const p = this.playersRef[this.cameraFocusMode];
      this.camera.position.x = p.pos.x + Math.sin(this.cameraAngle) * 50;
      this.camera.position.z = p.pos.z + Math.cos(this.cameraAngle) * 50;
      this.camera.position.y = 35;
      this.camera.lookAt(p.pos.x, 3, p.pos.z);
    }
  }

  public rotateCamera(delta: number) {
    this.cameraAngle += delta;
    this.updateCameraPosition();
  }

  public zoomCamera(delta: number) {
    this.cameraDistance = Math.max(30, Math.min(180, this.cameraDistance + delta));
    this.updateCameraPosition();
  }

  public setCameraFocus(mode: 'ALL' | number) {
    this.cameraFocusMode = mode;
    this.updateCameraPosition();
  }

  public toggleAutoOrbit(): boolean {
    this.isAutoOrbit = !this.isAutoOrbit;
    return this.isAutoOrbit;
  }

  // Move a player in 3D
  public movePlayer(pIdx: number, dx: number, dz: number) {
    if (!this.playersRef[pIdx]) return;
    const p = this.playersRef[pIdx];

    p.pos.x = Math.max(-120, Math.min(120, p.pos.x + dx));
    p.pos.z = Math.max(-120, Math.min(120, p.pos.z + dz));

    const mesh = this.playerMeshMap.get(pIdx);
    if (mesh) {
      mesh.position.x = p.pos.x;
      mesh.position.z = p.pos.z;
      if (dx !== 0 || dz !== 0) {
        mesh.rotation.y = Math.atan2(dx, dz);
      }
    }

    if (this.cameraFocusMode === 'ALL' || this.cameraFocusMode === pIdx) {
      this.updateCameraPosition();
    }
  }

  // Animation Loop
  private tick() {
    if (this.isDisposed) return;

    // Auto orbit
    if (this.isAutoOrbit) {
      this.cameraAngle += 0.005;
      this.updateCameraPosition();
    }

    // Spin central monument
    if (this.crystalMonument) {
      this.crystalMonument.rotation.y += 0.02;
      this.crystalMonument.rotation.x += 0.01;
    }

    // Auto patrol mode for players
    this.playersRef.forEach((p, idx) => {
      if (p.auto) {
        const t = Date.now() * 0.0015 + idx * 1.5;
        this.movePlayer(idx, Math.sin(t) * 0.6, Math.cos(t) * 0.6);
      }
    });

    // Proximity check for buildings entrance (< 22 distance)
    this.checkBuildingProximity();

    // Projected HTML overhead labels calculation
    this.calculateProjectedOverheadTags();

    // Render frame
    this.renderer.render(this.scene, this.camera);

    this.frameId = requestAnimationFrame(this.tick);
  }

  private checkBuildingProximity() {
    if (Date.now() - this.lastQuizTriggerTime < 3500) return;

    Object.keys(this.buildingsRef).forEach((code) => {
      const b = this.buildingsRef[code];
      this.playersRef.forEach((p) => {
        const dist = Math.hypot(p.pos.x - b.pos.x, p.pos.z - b.pos.z);
        if (dist < 22) {
          this.lastQuizTriggerTime = Date.now();
          if (this.callbacks.onBuildingEnter) {
            this.callbacks.onBuildingEnter(code);
          }
        }
      });
    });
  }

  private calculateProjectedOverheadTags() {
    if (!this.callbacks.onProjectedPositions) return;

    const projectedTags: Array<{
      id: number;
      name: string;
      color: string;
      x: number;
      y: number;
      visible: boolean;
      emoji: string;
    }> = [];

    const tempV = new THREE.Vector3();

    this.playersRef.forEach((p, idx) => {
      const mesh = this.playerMeshMap.get(idx);
      if (!mesh) return;

      tempV.copy(mesh.position);
      tempV.y += 11; // Above character head
      tempV.project(this.camera);

      const x = (tempV.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-(tempV.y * 0.5) + 0.5) * window.innerHeight;
      const isVisible = tempV.z < 1;

      projectedTags.push({
        id: p.id,
        name: p.name,
        color: p.colorHex,
        x,
        y,
        visible: isVisible,
        emoji: '👑',
      });
    });

    this.callbacks.onProjectedPositions(projectedTags);
  }

  private onPointerDown = (e: PointerEvent) => {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);
    if (!this.groundMesh) return;

    const intersects = this.raycaster.intersectObject(this.groundMesh, false);
    if (intersects.length > 0) {
      const pt = intersects[0].point;
      if (Math.abs(pt.x) <= 120 && Math.abs(pt.z) <= 120) {
        if (this.callbacks.onGroundClick) {
          this.callbacks.onGroundClick({
            x: Math.round(pt.x),
            z: Math.round(pt.z),
          });
        }
      }
    }
  };

  private onResize = () => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.updateCameraPosition();
  };

  public dispose() {
    this.isDisposed = true;
    cancelAnimationFrame(this.frameId);
    window.removeEventListener('resize', this.onResize);
    this.canvas.removeEventListener('pointerdown', this.onPointerDown);
    this.renderer.dispose();
    this.pmremGenerator.dispose();
  }
}
