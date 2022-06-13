<template>
  <div class="vi-ruler" style="min-width: 16px; min-height: 16px;">
    <canvas ref="canvas" style="position: absolute; left:0px; top: 0px;"></canvas>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';

const canvas = ref<HTMLCanvasElement>(null as any);

const markHeight = 5.0;

const props = defineProps({
  align: {
    default: 'horizontal',
    type: String,
    validator: function (value: string) {
      return ['horizontal', 'vertical'].indexOf(value) !== -1
    }
  },
  elementBound: String,
  axisWidth: {
    default: 0.5,
    type: Number,
  },
  axisStep: {
    default: 10,
    type: Number,
    validator: function (value: number) {
      return value > 0;
    }
  },
  highStep: {
    default: 10,
    type: Number,
    validator: function (value: number) {
      return value > 2;
    }
  },
  color: {
    default: '#808695',
    type: String,
  },
  updateTick: {
    type: Number,
  },
});

function getPixelRatio(context: any) {
  const viewScale = parseFloat(document.documentElement.style.getPropertyValue('--view-scale')) || 1;
  const backingStore = context.backingStorePixelRatio ||
    context.webkitBackingStorePixelRatio ||
    context.mozBackingStorePixelRatio ||
    context.msBackingStorePixelRatio ||
    context.oBackingStorePixelRatio ||
    context.backingStorePixelRatio || 1;
  return (window.devicePixelRatio || 1) / (viewScale * backingStore);
}

const resize = () => {
  const ctx = canvas.value.getContext('2d');
  const ratio = getPixelRatio(ctx);
  const rt = canvas.value.parentElement?.getBoundingClientRect() as any;
  canvas.value.setAttribute('width', `${rt.width * ratio}`);
  canvas.value.setAttribute('height', `${rt.height * ratio}`);
  canvas.value.style.width = rt.width + 'px';
  canvas.value.style.height = rt.height + 'px';
  redraw();
};

const redraw = () => {
  // force reshape
  canvas.value.width = canvas.value.width;
  const parent = canvas.value.parentElement as any;
  const rt = parent.getBoundingClientRect() as any;
  const rtAnchor = (props.elementBound ? (document.getElementById(props.elementBound) || parent) : parent).getBoundingClientRect();
  const ctx = canvas.value.getContext('2d') as CanvasRenderingContext2D;
  const ratio = getPixelRatio(ctx);
  ctx.scale(ratio, ratio);
  ctx.lineWidth = props.axisWidth;
  ctx.strokeStyle = ctx.fillStyle = props.color;
  if (props.align === 'vertical') {
    drawVerticalAxis(ctx, rtAnchor.y - rt.y, rt.height);
  }
  else {
    drawHorizontalAxis(ctx, rtAnchor.x - rt.x, rt.width);
  }
};

function drawHorizontalAxis(ctx: CanvasRenderingContext2D, xAnchor: number, width: number) {
  ctx.lineTo(width, markHeight);
  let c = 0;
  let i = 0;
  for (i = xAnchor; i >= 0; i -= props.axisStep) {
    ctx.moveTo(i, 0);
    if (c % props.highStep) {
      ctx.lineTo(i, markHeight);
    }
    else {
      ctx.lineTo(i, markHeight * 2);
      ctx.fillText(`${i - xAnchor}`, i + 2.0, markHeight * 2.5);
    }
    c++;
  }
  for (c = 1, i = xAnchor + props.axisStep; i <= width; i += props.axisStep) {
    ctx.moveTo(i, 0);
    if (c % props.highStep) {
      ctx.lineTo(i, markHeight);
    }
    else {
      ctx.lineTo(i, markHeight * 2);
      ctx.fillText(`${i - xAnchor}`, i + 2.0, markHeight * 2.5);
    }
    c++;
  }
  ctx.stroke();
}

function drawVerticalAxis(ctx: CanvasRenderingContext2D, yAnchor: number, height: number) {
  ctx.beginPath();
  let c = 0;
  let i = 0;

  for (i = yAnchor; i >= 0; i -= props.axisStep) {
    ctx.moveTo(0, i);
    if (c % props.highStep) {
      ctx.lineTo(markHeight, i);
    }
    else {
      ctx.lineTo(markHeight * 2, i);
    }
    c++;
  }
  for (c = 1, i = yAnchor + props.axisStep; i <= height; i += props.axisStep) {
    ctx.moveTo(0, i);
    if (c % props.highStep) {
      ctx.lineTo(markHeight, i);
    }
    else {
      ctx.lineTo(markHeight * 2, i);
    }
    c++;
  }

  ctx.stroke();

  ctx.save();

  ctx.rotate(90 * Math.PI / 180);
  const wildStep = props.highStep * props.axisStep;
  for (i = yAnchor; i >= 0; i -= wildStep) {
    ctx.fillText(`${i - yAnchor}`, i + 2.0, -markHeight);
  }
  for (i = yAnchor + wildStep; i <= height; i += wildStep) {
    ctx.fillText(`${i - yAnchor}`, i + 2.0, -markHeight);
  }

  ctx.restore();
}

watch(() => props.updateTick, () => {
  redraw();
});

const onMutationHandled = (mutations: Array<MutationRecord>) => {
  let needRedraw = false;
  for (const mutation of mutations) {
    if (mutation.type === 'attributes' && (mutation.attributeName === 'style' || mutation.attributeName === 'href')) {
      needRedraw = true;
      break;
    }
  }
  if (needRedraw) {
    redraw();
  }
}

const observers: Array<MutationObserver> = [];

onMounted(() => {
  resize();
  var MutationObserver = window.MutationObserver || (window as any).WebKitMutationObserver || (window as any).MozMutationObserver;
  const es = [canvas.value.parentElement];
  if (props.elementBound) {
    es.push(document.getElementById(props.elementBound));
  }
  for (const key in es) {
    const e = es[key];
    if (!e) continue;
    const m = new MutationObserver(onMutationHandled);
    m.observe(e, { attributes: true, attributeFilter: ['style'] });
    observers.push(m);
  }

  window.addEventListener("resize", resize);
});

onUnmounted(() => {
  window.removeEventListener("resize", resize);
  observers.forEach(o => o.disconnect());
});

</script>

<style scoped>
.vi-ruler {
  position: relative;
  background: var(--background-color-default);
  overflow: hidden;
}
</style>
