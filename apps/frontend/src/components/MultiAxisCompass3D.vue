<template>
  <div class="relative min-h-[26rem] w-full overflow-hidden border border-gray-300 bg-gray-950">
    <canvas
      ref="canvasRef"
      class="block h-full min-h-[26rem] w-full"
      aria-label="3D vizualizace politického profilu"
    />
    <div
      v-if="!isWebglAvailable"
      class="absolute inset-0 flex items-center justify-center bg-gray-100 px-6 text-center text-sm text-gray-700"
    >
      3D zobrazení není v tomto prohlížeči dostupné.
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, PropType, ref, watch } from "vue";
import * as THREE from "three";
import { AxisScore, CalculatorAxis, PartyMatch } from "@frontend/stores/calculator2026";

const props = defineProps({
    axes: {
        type: Array as PropType<CalculatorAxis[]>,
        required: true,
    },
    userAxisScores: {
        type: Array as PropType<AxisScore[]>,
        required: true,
    },
    matches: {
        type: Array as PropType<PartyMatch[]>,
        required: true,
    },
});

const canvasRef = ref<HTMLCanvasElement | null>(null);
const isWebglAvailable = ref(true);

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let frame = 0;
let animationId = 0;

const partyColors = [0x38bdf8, 0xf97316, 0x84cc16];

function scoreMap(scores: AxisScore[]) {
    return new Map(scores.map((score) => [score.axisCode, score.value]));
}

function pointForAxis(index: number, total: number, value: number) {
    const angle = (index / total) * Math.PI * 2;
    const radius = 1.5 + ((value + 1) / 2) * 2.3;
    const z = Math.sin(angle * 2) * 0.35;
    return new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, z);
}

function addProfile(
    targetScene: THREE.Scene,
    axes: CalculatorAxis[],
    scores: AxisScore[],
    color: number,
    opacity: number,
) {
    const values = scoreMap(scores);
    const points = axes.map((axis, index) =>
        pointForAxis(index, axes.length, values.get(axis.code) ?? 0),
    );
    points.push(points[0].clone());

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({
            color,
            transparent: true,
            opacity,
        }),
    );
    targetScene.add(line);

    for (const point of points.slice(0, -1)) {
        const marker = new THREE.Mesh(
            new THREE.SphereGeometry(0.06, 16, 16),
            new THREE.MeshBasicMaterial({ color }),
        );
        marker.position.copy(point);
        targetScene.add(marker);
    }
}

function buildScene() {
    if (!scene || !canvasRef.value) return;
    scene.clear();
    scene.background = new THREE.Color(0x020617);

    const axes = [...props.axes].sort((a, b) => a.order - b.order);
    const gridMaterial = new THREE.LineBasicMaterial({
        color: 0x475569,
        transparent: true,
        opacity: 0.65,
    });

    for (let ring = 0; ring < 4; ring += 1) {
        const radiusValue = -1 + ring * (2 / 3);
        const points = axes.map((_, index) => pointForAxis(index, axes.length, radiusValue));
        points.push(points[0].clone());
        scene.add(
            new THREE.Line(
                new THREE.BufferGeometry().setFromPoints(points),
                gridMaterial,
            ),
        );
    }

    axes.forEach((axis, index) => {
        const start = pointForAxis(index, axes.length, -1);
        const end = pointForAxis(index, axes.length, 1);
        scene!.add(
            new THREE.Line(
                new THREE.BufferGeometry().setFromPoints([start, end]),
                gridMaterial,
            ),
        );

        const label = createLabel(axis.name);
        label.position.copy(pointForAxis(index, axes.length, 1.15));
        scene!.add(label);
    });

    addProfile(scene, axes, props.userAxisScores, 0xfacc15, 1);
    props.matches.slice(0, 3).forEach((match, index) => {
        addProfile(scene!, axes, match.axisScores, partyColors[index], 0.75);
    });
}

function createLabel(text: string) {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;
    const context = canvas.getContext("2d")!;
    context.fillStyle = "rgba(15, 23, 42, 0.78)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#f8fafc";
    context.font = "22px sans-serif";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text.slice(0, 24), canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
        }),
    );
    sprite.scale.set(1.45, 0.36, 1);
    return sprite;
}

function resize() {
    if (!canvasRef.value || !renderer || !camera) return;
    const { clientWidth, clientHeight } = canvasRef.value;
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / clientHeight;
    camera.updateProjectionMatrix();
}

function animate() {
    if (!renderer || !scene || !camera) return;
    frame += 0.004;
    scene.rotation.z = frame;
    scene.rotation.x = -0.45;
    renderer.render(scene, camera);
    animationId = requestAnimationFrame(animate);
}

onMounted(() => {
    if (!canvasRef.value) return;
    try {
        renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.value,
            antialias: true,
            preserveDrawingBuffer: true,
        });
    } catch {
        isWebglAvailable.value = false;
        return;
    }

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, -7.5, 5.5);
    camera.lookAt(0, 0, 0);
    buildScene();
    resize();
    window.addEventListener("resize", resize);
    animate();
});

watch(
    () => [props.axes, props.userAxisScores, props.matches],
    () => buildScene(),
    { deep: true },
);

onBeforeUnmount(() => {
    cancelAnimationFrame(animationId);
    window.removeEventListener("resize", resize);
    renderer?.dispose();
});
</script>
