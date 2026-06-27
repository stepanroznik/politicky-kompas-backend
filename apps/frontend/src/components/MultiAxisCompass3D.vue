<template>
  <div
    ref="rootRef"
    class="relative w-full overflow-visible bg-white"
    :class="sizeClasses"
  >
    <canvas
      ref="canvasRef"
      class="absolute inset-0 block h-full w-full scale-110 cursor-grab touch-none active:cursor-grabbing"
      aria-label="3D vizualizace politického profilu"
      @pointerdown="startDrag"
      @pointermove="drag"
      @pointerup="stopDrag"
      @pointercancel="stopDrag"
      @pointerleave="stopDrag"
    />
    <div class="absolute left-4 top-4 z-10 flex max-w-[calc(100%-2rem)] flex-wrap gap-2 text-xs text-gray-700">
      <span
        v-if="showUser"
        class="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white/95 px-2 py-1 shadow-sm"
      >
        <span class="h-2.5 w-2.5 rounded-full bg-gray-950" />
        Vy
      </span>
      <button
        v-for="(match, index) in matches"
        :key="match.partyCode"
        class="inline-flex items-center gap-1 rounded-full border bg-white/95 px-2 py-1 shadow-sm transition hover:border-gray-500"
        :class="isPartyHidden(match.partyCode) ? 'border-gray-200 opacity-45' : 'border-gray-300 opacity-100'"
        type="button"
        :aria-pressed="!isPartyHidden(match.partyCode)"
        :title="isPartyHidden(match.partyCode) ? `Zobrazit ${match.partyName}` : `Skrýt ${match.partyName}`"
        @click="toggleParty(match.partyCode)"
      >
        <party-logo
          :party-code="match.partyCode"
          class="h-5 w-8 rounded-sm border border-gray-200"
        />
        <span
          class="h-2.5 w-2.5 rounded-sm"
          :style="{ backgroundColor: cssPartyColors[index] }"
        />
        {{ match.partyName }}
      </button>
      <button
        v-if="hiddenPartyCodes.size"
        class="rounded-full border border-gray-300 bg-white/95 px-2 py-1 font-semibold text-gray-700 shadow-sm transition hover:border-gray-600"
        type="button"
        @click="showAllParties"
      >
        Zobrazit vše
      </button>
    </div>
    <div
      v-if="!isWebglAvailable"
      class="absolute inset-0 flex items-center justify-center bg-gray-100 px-6 text-center text-sm text-gray-700"
    >
      3D zobrazení není v tomto prohlížeči dostupné.
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, PropType, ref, watch } from "vue";
import * as THREE from "three";
import PartyLogo from "@frontend/components/PartyLogo.vue";
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
    showUser: {
        type: Boolean,
        default: true,
    },
    size: {
        type: String as PropType<"compact" | "default" | "large">,
        default: "default",
    },
});

const rootRef = ref<HTMLElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const isWebglAvailable = ref(true);
const hiddenPartyCodes = ref(new Set<string>());

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let animationId = 0;
let rotationX = 0;
let rotationZ = 0;
let isDragging = false;
let lastInteractionAt = 0;
let previousPointer = { x: 0, y: 0 };
let spinSpeed = 0.001;
let resizeObserver: ResizeObserver | null = null;

const partyColors = [0x2563eb, 0xdc2626, 0x16a34a, 0x9333ea, 0x0891b2, 0xea580c, 0x4b5563];
const cssPartyColors = ["#2563eb", "#dc2626", "#16a34a", "#9333ea", "#0891b2", "#ea580c", "#4b5563"];

const visibleMatches = computed(() =>
    props.matches.filter((match) => !hiddenPartyCodes.value.has(match.partyCode)),
);
const sizeClasses = computed(() => {
    if (props.size === "compact") return "h-[24rem] min-h-[24rem] lg:h-[30rem] lg:min-h-[30rem]";
    if (props.size === "large") return "h-[34rem] min-h-[34rem] lg:h-[40rem] lg:min-h-[40rem]";
    return "h-[28rem] min-h-[28rem] lg:h-[32rem] lg:min-h-[32rem]";
});

function scoreMap(scores: AxisScore[]) {
    return new Map(scores.map((score) => [score.axisCode, score.value]));
}

function pointForAxis(index: number, total: number, value: number) {
    const angle = (index / total) * Math.PI * 2;
    const radius = 1.3 + ((value + 1) / 2) * 2;
    const z = Math.sin(angle * 2) * 0.18;
    return new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, z);
}

function addProfile(
    targetScene: THREE.Scene,
    axes: CalculatorAxis[],
    scores: AxisScore[],
    color: number,
    opacity: number,
) {
    if (!axes.length) return;
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
            new THREE.SphereGeometry(0.065, 16, 16),
            new THREE.MeshBasicMaterial({ color }),
        );
        marker.position.copy(point);
        targetScene.add(marker);
    }
}

function buildScene() {
    if (!scene || !canvasRef.value) return;
    scene.clear();
    scene.background = new THREE.Color(0xffffff);

    const axes = [...props.axes].sort((a, b) => a.order - b.order);
    if (!axes.length) return;
    const gridMaterial = new THREE.LineBasicMaterial({
        color: 0xcbd5e1,
        transparent: true,
        opacity: 0.9,
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

    if (props.showUser) {
        addProfile(scene, axes, props.userAxisScores, 0x111827, 1);
    }
    visibleMatches.value.forEach((match) => {
        addProfile(scene!, axes, match.axisScores, colorForParty(match.partyCode), 0.75);
    });
}

function createLabel(text: string) {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;
    const context = canvas.getContext("2d")!;
    context.fillStyle = "rgba(255, 255, 255, 0.86)";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.strokeStyle = "rgba(203, 213, 225, 0.9)";
    context.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
    context.fillStyle = "#334155";
    context.font = "21px sans-serif";
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
    if (!rootRef.value || !renderer || !camera) return;
    const { width, height } = rootRef.value.getBoundingClientRect();
    const renderWidth = Math.max(1, Math.floor(width));
    const renderHeight = Math.max(1, Math.floor(height));
    renderer.setSize(renderWidth, renderHeight, false);
    camera.aspect = renderWidth / renderHeight;
    camera.updateProjectionMatrix();
}

function animate() {
    if (!renderer || !scene || !camera) return;
    if (!isDragging) {
        const idleMs = performance.now() - lastInteractionAt;
        const targetSpin = idleMs > 1200 ? 0.001 : 0;
        spinSpeed += (targetSpin - spinSpeed) * 0.015;
        rotationZ += spinSpeed;
    }
    scene.rotation.z = rotationZ;
    scene.rotation.x = rotationX;
    renderer.render(scene, camera);
    animationId = requestAnimationFrame(animate);
}

function startDrag(event: PointerEvent) {
    if (!canvasRef.value) return;
    isDragging = true;
    spinSpeed = 0;
    lastInteractionAt = performance.now();
    previousPointer = { x: event.clientX, y: event.clientY };
    canvasRef.value.setPointerCapture(event.pointerId);
}

function drag(event: PointerEvent) {
    if (!isDragging) return;
    const dx = event.clientX - previousPointer.x;
    const dy = event.clientY - previousPointer.y;
    previousPointer = { x: event.clientX, y: event.clientY };
    rotationZ += dx * 0.01;
    rotationX = Math.max(-1.2, Math.min(0.35, rotationX + dy * 0.008));
    lastInteractionAt = performance.now();
}

function stopDrag(event: PointerEvent) {
    if (!canvasRef.value || !isDragging) return;
    isDragging = false;
    lastInteractionAt = performance.now();
    if (canvasRef.value.hasPointerCapture(event.pointerId)) {
        canvasRef.value.releasePointerCapture(event.pointerId);
    }
}

function isPartyHidden(partyCode: string) {
    return hiddenPartyCodes.value.has(partyCode);
}

function toggleParty(partyCode: string) {
    const nextHidden = new Set(hiddenPartyCodes.value);
    if (nextHidden.has(partyCode)) nextHidden.delete(partyCode);
    else nextHidden.add(partyCode);
    hiddenPartyCodes.value = nextHidden;
    buildScene();
}

function showAllParties() {
    hiddenPartyCodes.value = new Set();
    buildScene();
}

function colorForParty(partyCode: string) {
    const index = props.matches.findIndex((match) => match.partyCode === partyCode);
    return partyColors[Math.max(0, index) % partyColors.length];
}

onMounted(() => {
    if (!canvasRef.value) return;
    try {
        renderer = new THREE.WebGLRenderer({
            canvas: canvasRef.value,
            antialias: true,
            preserveDrawingBuffer: true,
            alpha: true,
        });
    } catch {
        isWebglAvailable.value = false;
        return;
    }

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 9);
    camera.lookAt(0, 0, 0);
    buildScene();
    resize();
    resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(rootRef.value!);
    window.addEventListener("resize", resize);
    animate();
});

watch(
    () => [props.axes, props.userAxisScores, props.matches, props.showUser],
    () => buildScene(),
    { deep: true },
);

watch(
    () => props.matches.map((match) => match.partyCode),
    (partyCodes) => {
        const allowedCodes = new Set(partyCodes);
        const nextHidden = new Set(
            [...hiddenPartyCodes.value].filter((partyCode) => allowedCodes.has(partyCode)),
        );
        hiddenPartyCodes.value = nextHidden;
        buildScene();
    },
);

onBeforeUnmount(() => {
    cancelAnimationFrame(animationId);
    window.removeEventListener("resize", resize);
    resizeObserver?.disconnect();
    renderer?.dispose();
});
</script>
