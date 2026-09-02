import * as THREE from "three";
import type { Car, LevelConfig, GameStats } from "./types";

export interface EngineCallbacks {
  onStatsUpdate: (stats: GameStats) => void;
  onCollision: (type: "crash" | "traffic") => void;
  onVictory: () => void;
  onDefeat: () => void;
}

interface TrafficCar {
  mesh: THREE.Group;
  z: number;
  x: number;
  speed: number;
  laneOffset: number;
  changeTimer: number;
}

interface Obstacle {
  mesh: THREE.Mesh;
  z: number;
  x: number;
}

interface RoadSegment {
  z: number;
  centerOffset: number;
}

const ROAD_WIDTH = 12;
const LANE_COUNT = 4;

function getPhysics(car: Car) {
  const topSpeedKmh = 120 + car.stats.topSpeed * 1.8;
  const accelRate = 8 + car.stats.acceleration * 0.12;
  const brakeRate = 20 + car.stats.braking * 0.6;
  const turnRate = 1.2 + car.stats.handling * 0.025;
  return { topSpeedKmh, accelRate, brakeRate, turnRate };
}

export class GameEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private container: HTMLElement;
  private callbacks: EngineCallbacks;
  private level: LevelConfig;
  private car: Car;

  private carGroup: THREE.Group;
  private carPosition = new THREE.Vector3(0, 0.5, 0);
  private carSpeed = 0; // km/h
  private carLateral = 0; // lateral offset
  private carRotation = 0; // visual rotation
  private topSpeedReached = 0;
  private collisions = 0;

  private roadSegments: RoadSegment[] = [];
  private roadMeshes: THREE.Mesh[] = [];
  private trafficCars: TrafficCar[] = [];
  private obstacles: Obstacle[] = [];
  private decorObjects: THREE.Object3D[] = [];

  private clock = new THREE.Clock();
  private timeRemaining: number;
  private distanceTraveled = 0;
  private isRunning = false;
  private isPaused = false;
  private isFinished = false;
  private animationId = 0;

  private keys: Record<string, boolean> = {};
  private touchInput = { accelerate: false, brake: false, left: false, right: false };
  private envFog: THREE.FogExp2 | null = null;
  private rainParticles: THREE.Points | null = null;
  private headlightMeshes: THREE.SpotLight[] = [];

  constructor(
    container: HTMLElement,
    level: LevelConfig,
    car: Car,
    callbacks: EngineCallbacks,
  ) {
    this.container = container;
    this.level = level;
    this.car = car;
    this.callbacks = callbacks;
    this.timeRemaining = level.timeLimit;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      70,
      container.clientWidth / container.clientHeight,
      0.1,
      500,
    );
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.carGroup = new THREE.Group();
  }

  init(): void {
    this.setupEnvironment();
    this.setupLights();
    this.createRoad();
    this.createPlayerCar();
    this.createTraffic();
    this.createObstacles();
    this.createDecor();
    this.setupEventListeners();
    this.isRunning = true;
    this.clock.start();
    this.animate();
  }

  private setupEnvironment(): void {
    const env = this.level.environment;
    let skyColor = 0x87ceeb;
    let fogColor = 0x87ceeb;
    let fogDensity = 0.002;
    let groundColor = 0x3a7d3a;

    switch (env) {
      case "night":
        skyColor = 0x0a0a2e;
        fogColor = 0x0a0a2e;
        fogDensity = 0.004;
        groundColor = 0x1a1a3a;
        break;
      case "rain":
        skyColor = 0x4a5568;
        fogColor = 0x4a5568;
        fogDensity = 0.005;
        groundColor = 0x2d3a2d;
        break;
      case "fog":
        skyColor = 0xb0b0b0;
        fogColor = 0xb0b0b0;
        fogDensity = 0.02;
        groundColor = 0x556655;
        break;
      case "desert":
        skyColor = 0xf4a261;
        fogColor = 0xf4a261;
        fogDensity = 0.003;
        groundColor = 0xc89b6b;
        break;
      case "snow":
        skyColor = 0xd0d0e0;
        fogColor = 0xd0d0e0;
        fogDensity = 0.006;
        groundColor = 0xe0e0f0;
        break;
    }

    this.scene.background = new THREE.Color(skyColor);
    this.envFog = new THREE.FogExp2(fogColor, fogDensity);
    this.scene.fog = this.envFog;

    // Ground plane
    const groundGeo = new THREE.PlaneGeometry(300, this.level.trackLength + 200);
    const groundMat = new THREE.MeshLambertMaterial({ color: groundColor });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.z = -this.level.trackLength / 2 + 50;
    ground.receiveShadow = true;
    this.scene.add(ground);

    if (env === "rain") this.createRain();
  }

  private createRain(): void {
    const count = 800;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = Math.random() * 30;
      positions[i * 3 + 2] = -Math.random() * 200;
    }
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xaaccff,
      size: 0.3,
      transparent: true,
      opacity: 0.6,
    });
    this.rainParticles = new THREE.Points(geo, mat);
    this.scene.add(this.rainParticles);
  }

  private setupLights(): void {
    const env = this.level.environment;
    const ambientIntensity = env === "night" ? 0.15 : env === "fog" ? 0.4 : 0.5;
    const ambient = new THREE.AmbientLight(0xffffff, ambientIntensity);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xffffff, env === "night" ? 0.2 : 0.8);
    sun.position.set(30, 50, 10);
    sun.castShadow = true;
    sun.shadow.camera.left = -40;
    sun.shadow.camera.right = 40;
    sun.shadow.camera.top = 40;
    sun.shadow.camera.bottom = -40;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    this.scene.add(sun);

    if (env === "night") {
      const hl1 = new THREE.SpotLight(0xffffcc, 2, 40, Math.PI / 6, 0.5, 1);
      hl1.position.set(0, 2, 0);
      hl1.target.position.set(0, 0, -10);
      this.carGroup.add(hl1);
      this.carGroup.add(hl1.target);
      this.headlightMeshes.push(hl1);
    }
  }

  private getRoadCenterX(z: number): number {
    if (this.roadSegments.length === 0) return 0;
    const curveAmount = this.level.curveIntensity;
    const wave = Math.sin(z * 0.005) * curveAmount * 8;
    return wave;
  }

  private createRoad(): void {
    const segmentLength = 20;
    const totalSegments = Math.ceil(this.level.trackLength / segmentLength) + 5;

    for (let i = 0; i < totalSegments; i++) {
      const z = -i * segmentLength;
      const centerX = this.getRoadCenterX(z);
      this.roadSegments.push({ z, centerOffset: centerX });

      // Road segment
      const roadGeo = new THREE.PlaneGeometry(ROAD_WIDTH, segmentLength);
      const roadMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
      const road = new THREE.Mesh(roadGeo, roadMat);
      road.rotation.x = -Math.PI / 2;
      road.position.set(centerX, 0.02, z - segmentLength / 2);
      road.receiveShadow = true;
      this.scene.add(road);
      this.roadMeshes.push(road);

      // Lane markings
      for (let lane = 1; lane < LANE_COUNT; lane++) {
        const laneX = centerX - ROAD_WIDTH / 2 + (lane * ROAD_WIDTH / LANE_COUNT);
        const markGeo = new THREE.PlaneGeometry(0.2, segmentLength * 0.7);
        const markMat = new THREE.MeshBasicMaterial({
          color: i % 2 === 0 ? 0xffffff : 0x333333,
          transparent: true,
          opacity: i % 2 === 0 ? 0.8 : 0,
        });
        const mark = new THREE.Mesh(markGeo, markMat);
        mark.rotation.x = -Math.PI / 2;
        mark.position.set(laneX, 0.03, z - segmentLength / 2);
        this.scene.add(mark);
      }

      // Road edges (curbs)
      for (const side of [-1, 1]) {
        const edgeGeo = new THREE.BoxGeometry(0.5, 0.15, segmentLength);
        const edgeMat = new THREE.MeshLambertMaterial({
          color: i % 2 === 0 ? 0xff0000 : 0xffffff,
        });
        const edge = new THREE.Mesh(edgeGeo, edgeMat);
        edge.position.set(
          centerX + side * (ROAD_WIDTH / 2 + 0.25),
          0.075,
          z - segmentLength / 2,
        );
        edge.castShadow = true;
        this.scene.add(edge);
      }
    }

    // Finish line
    const finishZ = -this.level.trackLength;
    const finishGeo = new THREE.PlaneGeometry(ROAD_WIDTH, 2);
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 32;
    const ctx = canvas.getContext("2d")!;
    const sqSize = 16;
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 8; col++) {
        ctx.fillStyle = (row + col) % 2 === 0 ? "#000" : "#fff";
        ctx.fillRect(col * sqSize, row * sqSize, sqSize, sqSize);
      }
    }
    const finishTex = new THREE.CanvasTexture(canvas);
    const finishMat = new THREE.MeshBasicMaterial({ map: finishTex });
    const finishLine = new THREE.Mesh(finishGeo, finishMat);
    finishLine.rotation.x = -Math.PI / 2;
    finishLine.position.set(this.getRoadCenterX(finishZ), 0.04, finishZ);
    this.scene.add(finishLine);
  }

  private createPlayerCar(): void {
    this.carGroup = this.buildCarMesh(this.car.bodyColor, this.car.accentColor);
    this.carGroup.position.copy(this.carPosition);
    this.scene.add(this.carGroup);

    // Initial camera position
    this.camera.position.set(0, 6, 12);
    this.camera.lookAt(0, 1, -5);
  }

  private buildCarMesh(bodyColor: string, accentColor: string): THREE.Group {
    const group = new THREE.Group();

    // Body
    const bodyGeo = new THREE.BoxGeometry(1.8, 0.6, 3.5);
    const bodyMat = new THREE.MeshPhongMaterial({ color: bodyColor, shininess: 100 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.5;
    body.castShadow = true;
    group.add(body);

    // Cabin
    const cabinGeo = new THREE.BoxGeometry(1.5, 0.5, 1.8);
    const cabinMat = new THREE.MeshPhongMaterial({ color: accentColor, shininess: 80 });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 0.95, -0.2);
    cabin.castShadow = true;
    group.add(cabin);

    // Windshield
    const windshieldGeo = new THREE.BoxGeometry(1.4, 0.45, 0.1);
    const windshieldMat = new THREE.MeshPhongMaterial({
      color: 0x88aacc,
      transparent: true,
      opacity: 0.6,
      shininess: 200,
    });
    const windshield = new THREE.Mesh(windshieldGeo, windshieldMat);
    windshield.position.set(0, 0.95, 0.7);
    group.add(windshield);

    // Wheels
    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.3, 12);
    const wheelMat = new THREE.MeshPhongMaterial({ color: 0x111111 });
    const wheelPositions: [number, number, number][] = [
      [-0.95, 0.35, 1.2],
      [0.95, 0.35, 1.2],
      [-0.95, 0.35, -1.2],
      [0.95, 0.35, -1.2],
    ];
    for (const [x, y, z] of wheelPositions) {
      const wheel = new THREE.Mesh(wheelGeo, wheelMat);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, y, z);
      wheel.castShadow = true;
      group.add(wheel);
    }

    // Headlights
    for (const side of [-1, 1]) {
      const hlGeo = new THREE.BoxGeometry(0.3, 0.2, 0.1);
      const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffcc });
      const hl = new THREE.Mesh(hlGeo, hlMat);
      hl.position.set(side * 0.6, 0.5, 1.75);
      group.add(hl);
    }

    // Taillights
    for (const side of [-1, 1]) {
      const tlGeo = new THREE.BoxGeometry(0.3, 0.2, 0.1);
      const tlMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const tl = new THREE.Mesh(tlGeo, tlMat);
      tl.position.set(side * 0.6, 0.5, -1.75);
      group.add(tl);
    }

    return group;
  }

  private createTraffic(): void {
    const count = Math.floor(this.level.trafficDensity * 20);
    const carColors = [
      ["#ff6b6b", "#c92a2a"],
      ["#4ecdc4", "#2c8a85"],
      ["#ffe66d", "#d4a017"],
      ["#a8e6cf", "#5a9b7e"],
      ["#ff8a5c", "#c44d28"],
      ["#9b59b6", "#6c3483"],
    ];

    for (let i = 0; i < count; i++) {
      const [bc, ac] = carColors[i % carColors.length];
      const mesh = this.buildCarMesh(bc, ac);
      const lane = Math.floor(Math.random() * LANE_COUNT);
      const x = -ROAD_WIDTH / 2 + (lane * ROAD_WIDTH / LANE_COUNT) + ROAD_WIDTH / (LANE_COUNT * 2);
      const z = -50 - Math.random() * (this.level.trackLength - 100);
      mesh.position.set(x, 0, z);
      mesh.rotation.y = Math.PI; // facing towards us (opposing traffic)
      this.scene.add(mesh);

      const speedType = Math.random();
      const speed = speedType < 0.4 ? 20 : speedType < 0.8 ? 35 : 50;

      this.trafficCars.push({
        mesh,
        z,
        x,
        speed,
        laneOffset: x,
        changeTimer: Math.random() * 3,
      });
    }
  }

  private createObstacles(): void {
    const count = Math.floor(this.level.obstacleDensity * 25);
    for (let i = 0; i < count; i++) {
      const type = Math.random();
      let mesh: THREE.Mesh;
      if (type < 0.4) {
        // Cone
        const geo = new THREE.ConeGeometry(0.4, 0.8, 8);
        const mat = new THREE.MeshPhongMaterial({ color: 0xff6600 });
        mesh = new THREE.Mesh(geo, mat);
      } else if (type < 0.7) {
        // Barrel
        const geo = new THREE.CylinderGeometry(0.5, 0.5, 1, 10);
        const mat = new THREE.MeshPhongMaterial({ color: 0xcc3333 });
        mesh = new THREE.Mesh(geo, mat);
      } else {
        // Box barrier
        const geo = new THREE.BoxGeometry(1.5, 1, 0.8);
        const mat = new THREE.MeshPhongMaterial({ color: 0xffcc00 });
        mesh = new THREE.Mesh(geo, mat);
      }
      const lane = Math.floor(Math.random() * LANE_COUNT);
      const x = -ROAD_WIDTH / 2 + (lane * ROAD_WIDTH / LANE_COUNT) + ROAD_WIDTH / (LANE_COUNT * 2);
      const z = -80 - Math.random() * (this.level.trackLength - 160);
      mesh.position.set(x, 0.4, z);
      mesh.castShadow = true;
      this.scene.add(mesh);
      this.obstacles.push({ mesh, z, x });
    }
  }

  private createDecor(): void {
    const env = this.level.environment;
    const treeColor = env === "snow" ? 0xb0c4de : env === "desert" ? 0x8c7a5b : 0x2d6a2d;
    const interval = 30;

    for (let z = 0; z > -this.level.trackLength; z -= interval) {
      for (const side of [-1, 1]) {
        if (Math.random() < 0.7) {
          const tree = this.buildTree(treeColor, env);
          tree.position.set(
            this.getRoadCenterX(z) + side * (ROAD_WIDTH / 2 + 4 + Math.random() * 8),
            0,
            z - Math.random() * 15,
          );
          this.scene.add(tree);
          this.decorObjects.push(tree);
        }

        // Streetlight for night levels
        if (env === "night" && Math.random() < 0.5) {
          const lamp = this.buildStreetlight();
          lamp.position.set(
            this.getRoadCenterX(z) + side * (ROAD_WIDTH / 2 + 2),
            0,
            z,
          );
          this.scene.add(lamp);
          this.decorObjects.push(lamp);
        }
      }
    }

    // Buildings for city-like levels
    if (this.level.id === 6 || this.level.id === 3) {
      for (let z = -20; z > -this.level.trackLength; z -= 40) {
        for (const side of [-1, 1]) {
          if (Math.random() < 0.5) {
            const building = this.buildBuilding();
            building.position.set(
              this.getRoadCenterX(z) + side * (ROAD_WIDTH / 2 + 12 + Math.random() * 6),
              0,
              z,
            );
            this.scene.add(building);
            this.decorObjects.push(building);
          }
        }
      }
    }
  }

  private buildTree(color: number, env: string): THREE.Group {
    const group = new THREE.Group();
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 6);
    const trunkMat = new THREE.MeshLambertMaterial({ color: 0x4a3520 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.y = 0.75;
    trunk.castShadow = true;
    group.add(trunk);

    const foliageGeo = new THREE.ConeGeometry(1.2, 2.5, 6);
    const foliageMat = new THREE.MeshLambertMaterial({ color });
    const foliage = new THREE.Mesh(foliageGeo, foliageMat);
    foliage.position.y = 2.5;
    foliage.castShadow = true;
    group.add(foliage);
    return group;
  }

  private buildStreetlight(): THREE.Group {
    const group = new THREE.Group();
    const poleGeo = new THREE.CylinderGeometry(0.1, 0.1, 6, 6);
    const poleMat = new THREE.MeshLambertMaterial({ color: 0x444444 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 3;
    pole.castShadow = true;
    group.add(pole);

    const bulbGeo = new THREE.SphereGeometry(0.3, 8, 8);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffffaa });
    const bulb = new THREE.Mesh(bulbGeo, bulbMat);
    bulb.position.y = 6;
    group.add(bulb);

    const light = new THREE.PointLight(0xffeeaa, 1, 15);
    light.position.y = 6;
    group.add(light);

    return group;
  }

  private buildBuilding(): THREE.Mesh {
    const h = 5 + Math.random() * 15;
    const w = 4 + Math.random() * 4;
    const geo = new THREE.BoxGeometry(w, h, w);
    const colors = [0x8a8a8a, 0x9a9a9a, 0x7a7a8a, 0xa0a0a0, 0x6a6a7a];
    const mat = new THREE.MeshLambertMaterial({
      color: colors[Math.floor(Math.random() * colors.length)],
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = h / 2;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  private setupEventListeners(): void {
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);
    window.addEventListener("resize", this.onResize);
  }

  private onKeyDown = (e: KeyboardEvent): void => {
    this.keys[e.code] = true;
    if (e.code === "Space") e.preventDefault();
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    this.keys[e.code] = false;
  };

  private onResize = (): void => {
    if (!this.container) return;
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  };

  setTouchInput(input: Partial<typeof this.touchInput>): void {
    Object.assign(this.touchInput, input);
  }

  setPaused(paused: boolean): void {
    this.isPaused = paused;
    if (paused) {
      this.clock.stop();
    } else {
      this.clock.start();
    }
  }

  private isAccelerating(): boolean {
    return this.keys["ArrowUp"] || this.keys["KeyW"] || this.touchInput.accelerate;
  }

  private isBraking(): boolean {
    return this.keys["Space"] || this.touchInput.brake;
  }

  private isSlowing(): boolean {
    return this.keys["ArrowDown"] || this.keys["KeyS"];
  }

  private isLeft(): boolean {
    return this.keys["ArrowLeft"] || this.keys["KeyA"] || this.touchInput.left;
  }

  private isRight(): boolean {
    return this.keys["ArrowRight"] || this.keys["KeyD"] || this.touchInput.right;
  }

  private animate = (): void => {
    this.animationId = requestAnimationFrame(this.animate);
    if (!this.isRunning || this.isPaused || this.isFinished) {
      this.renderer.render(this.scene, this.camera);
      return;
    }

    const dt = Math.min(this.clock.getDelta(), 0.05);
    this.updatePhysics(dt);
    this.updateTraffic(dt);
    this.updateCamera(dt);
    this.updateRain(dt);
    this.updateTimer(dt);
    this.renderer.render(this.scene, this.camera);
  };

  private updatePhysics(dt: number): void {
    const physics = getPhysics(this.car);
    const topSpeed = physics.topSpeedKmh;

    if (this.isAccelerating()) {
      this.carSpeed += physics.accelRate * dt * 30;
    } else if (this.isSlowing() || this.isBraking()) {
      const decel = this.isBraking() ? physics.brakeRate : 10;
      this.carSpeed -= decel * dt * 30;
    } else {
      this.carSpeed -= 5 * dt * 30; // engine friction
    }

    this.carSpeed = Math.max(0, Math.min(this.carSpeed, topSpeed));
    if (this.carSpeed > this.topSpeedReached) this.topSpeedReached = this.carSpeed;

    // Forward movement
    const speedMps = this.carSpeed / 3.6; // km/h to m/s
    this.carPosition.z -= speedMps * dt;
    this.distanceTraveled = Math.abs(this.carPosition.z);

    // Steering - speed dependent
    const speedFactor = Math.min(1, this.carSpeed / 30);
    const steerAmount = physics.turnRate * speedFactor;
    if (this.isLeft()) {
      this.carLateral -= steerAmount * dt * 10;
      this.carRotation = THREE.MathUtils.lerp(this.carRotation, 0.15, dt * 5);
    } else if (this.isRight()) {
      this.carLateral += steerAmount * dt * 10;
      this.carRotation = THREE.MathUtils.lerp(this.carRotation, -0.15, dt * 5);
    } else {
      this.carRotation = THREE.MathUtils.lerp(this.carRotation, 0, dt * 5);
    }

    // Apply road curve - the car drifts towards the curve
    const roadCenter = this.getRoadCenterX(this.carPosition.z);
    const driftFromCenter = this.carLateral - roadCenter;

    // Off-road check
    const halfRoad = ROAD_WIDTH / 2 - 1;
    if (Math.abs(driftFromCenter) > halfRoad + 1) {
      this.handleCrash();
      return;
    }

    // Lateral friction / return to center tendency
    this.carLateral = roadCenter + driftFromCenter * 0.98;

    // Update car mesh
    this.carGroup.position.set(this.carLateral, 0.5, this.carPosition.z);
    this.carGroup.rotation.y = this.carRotation;
    this.carGroup.rotation.z = -this.carRotation * 0.3;

    // Wheel rotation effect - spin the car body slightly
    const speedRatio = this.carSpeed / topSpeed;

    // Check finish line
    if (this.carPosition.z <= -this.level.trackLength) {
      this.handleVictory();
      return;
    }

    // Check collisions with traffic and obstacles
    this.checkCollisions();

    // Emit stats
    const distancePercent = Math.min(100, (this.distanceTraveled / this.level.trackLength) * 100);
    this.callbacks.onStatsUpdate({
      timeUsed: this.level.timeLimit - this.timeRemaining,
      timeRemaining: Math.max(0, this.timeRemaining),
      distancePercent,
      speed: Math.round(this.carSpeed),
      topSpeed: Math.round(this.topSpeedReached),
      collisions: this.collisions,
      score: this.calculateScore(distancePercent),
      stars: 0,
    });
  }

  private updateTraffic(dt: number): void {
    for (const tc of this.trafficCars) {
      // Traffic moves towards us (opposite direction)
      tc.z += tc.speed * dt;

      // Lane change behavior
      tc.changeTimer -= dt;
      if (tc.changeTimer <= 0) {
        tc.changeTimer = 2 + Math.random() * 3;
        if (Math.random() < 0.3) {
          const newLane = Math.floor(Math.random() * LANE_COUNT);
          tc.laneOffset = -ROAD_WIDTH / 2 + (newLane * ROAD_WIDTH / LANE_COUNT) + ROAD_WIDTH / (LANE_COUNT * 2);
        }
      }

      // Smoothly move towards lane offset
      tc.x = THREE.MathUtils.lerp(tc.x, tc.laneOffset + this.getRoadCenterX(tc.z), dt * 2);

      // Reset traffic cars that pass behind us
      if (tc.z > this.carPosition.z + 30) {
        tc.z = this.carPosition.z - 80 - Math.random() * 60;
        const lane = Math.floor(Math.random() * LANE_COUNT);
        tc.laneOffset = -ROAD_WIDTH / 2 + (lane * ROAD_WIDTH / LANE_COUNT) + ROAD_WIDTH / (LANE_COUNT * 2);
      }

      tc.mesh.position.set(tc.x, 0, tc.z);
    }
  }

  private updateCamera(dt: number): void {
    const targetX = this.carLateral * 0.8;
    const targetZ = this.carPosition.z + 10;
    const targetY = 5 + (this.carSpeed / 200) * 1.5;

    this.camera.position.x = THREE.MathUtils.lerp(this.camera.position.x, targetX, dt * 3);
    this.camera.position.y = THREE.MathUtils.lerp(this.camera.position.y, targetY, dt * 2);
    this.camera.position.z = THREE.MathUtils.lerp(this.camera.position.z, targetZ, dt * 4);

    const lookX = this.carLateral + this.carRotation * 5;
    this.camera.lookAt(lookX, 1, this.carPosition.z - 8);

    // Speed-based FOV
    const speedRatio = this.carSpeed / getPhysics(this.car).topSpeedKmh;
    const targetFov = 70 + speedRatio * 15;
    this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, targetFov, dt * 2);
    this.camera.updateProjectionMatrix();
  }

  private updateRain(dt: number): void {
    if (!this.rainParticles) return;
    const positions = this.rainParticles.geometry.attributes.position as THREE.BufferAttribute;
    const arr = positions.array as Float32Array;
    for (let i = 0; i < arr.length; i += 3) {
      arr[i + 1] -= 30 * dt;
      arr[i + 2] += this.carSpeed / 3.6 * dt * 0.3;
      if (arr[i + 1] < 0) {
        arr[i + 1] = 30;
        arr[i] = (Math.random() - 0.5) * 60;
      }
    }
    positions.needsUpdate = true;
    this.rainParticles.position.z = this.carPosition.z;
  }

  private updateTimer(dt: number): void {
    this.timeRemaining -= dt;
    if (this.timeRemaining <= 0) {
      this.timeRemaining = 0;
      this.handleDefeat();
    }
  }

  private checkCollisions(): void {
    const carX = this.carLateral;
    const carZ = this.carPosition.z;

    // Traffic collision
    for (const tc of this.trafficCars) {
      const dx = Math.abs(tc.x - carX);
      const dz = Math.abs(tc.z - carZ);
      if (dx < 1.8 && dz < 3.5) {
        this.collisions++;
        this.carSpeed *= 0.3;
        this.callbacks.onCollision("traffic");
        // Push traffic car away
        tc.z += 5;
        tc.x += (tc.x > carX ? 2 : -2);
        if (this.collisions >= 5) {
          this.handleCrash();
          return;
        }
      }
    }

    // Obstacle collision
    for (const obs of this.obstacles) {
      const dx = Math.abs(obs.x - carX);
      const dz = Math.abs(obs.z - carZ);
      if (dx < 1.5 && dz < 2) {
        this.collisions++;
        this.carSpeed *= 0.4;
        this.callbacks.onCollision("crash");
        // Move obstacle away to avoid repeated hits
        obs.mesh.visible = false;
        if (this.collisions >= 5) {
          this.handleCrash();
          return;
        }
      }
    }
  }

  private handleCrash(): void {
    if (this.isFinished) return;
    this.isFinished = true;
    this.callbacks.onDefeat();
  }

  private handleVictory(): void {
    if (this.isFinished) return;
    this.isFinished = true;
    this.callbacks.onVictory();
  }

  private handleDefeat(): void {
    if (this.isFinished) return;
    this.isFinished = true;
    this.callbacks.onDefeat();
  }

  private calculateScore(distancePercent: number): number {
    const timeBonus = Math.round(this.timeRemaining * 10);
    const speedBonus = Math.round(this.topSpeedReached * 5);
    const collisionPenalty = this.collisions * 200;
    const distScore = Math.round(distancePercent * 50);
    return Math.max(0, distScore + timeBonus + speedBonus - collisionPenalty);
  }

  getFinalStats(): GameStats {
    const distancePercent = Math.min(100, (this.distanceTraveled / this.level.trackLength) * 100);
    const score = this.calculateScore(distancePercent);
    const stars = this.calculateStars(score);
    return {
      timeUsed: this.level.timeLimit - this.timeRemaining,
      timeRemaining: this.timeRemaining,
      distancePercent,
      speed: Math.round(this.carSpeed),
      topSpeed: Math.round(this.topSpeedReached),
      collisions: this.collisions,
      score,
      stars,
    };
  }

  private calculateStars(score: number): number {
    if (score >= 8000) return 3;
    if (score >= 5000) return 2;
    return 1;
  }

  getEngineSpeedRatio(): number {
    return this.carSpeed / getPhysics(this.car).topSpeedKmh;
  }

  isAcceleratingNow(): boolean {
    return this.isAccelerating();
  }

  isBrakingNow(): boolean {
    return this.isBraking();
  }

  dispose(): void {
    this.isRunning = false;
    cancelAnimationFrame(this.animationId);
    window.removeEventListener("keydown", this.onKeyDown);
    window.removeEventListener("keyup", this.onKeyUp);
    window.removeEventListener("resize", this.onResize);
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement === this.container) {
      this.container.removeChild(this.renderer.domElement);
    }
    // Dispose geometries and materials
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry?.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material?.dispose();
        }
      }
    });
  }
}
