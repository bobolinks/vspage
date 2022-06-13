<template>
  <div ref="root" class="popover">
    <div class="popover-container" :style="{ 'max-width': maxWidth }">
      <slot></slot>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';

defineProps({
  maxWidth: {
    type: String,
    default: "320px",
  },
  placement: {
    type: String,
    default: "left",
    values: ["left", "right", "bottom"],
  },
});

const root = ref<HTMLDivElement>(null as any);

const onBlur = () => {
  root.value.style.display = "none";
};

onMounted(() => {
  document.addEventListener("click", onBlur);
  root.value.parentElement?.removeChild(root.value);
  document.body.appendChild(root.value);
});

onUnmounted(() => {
  document.removeEventListener("click", onBlur);
  document.body.removeChild(root.value);
});

</script>

<style scoped>
.popover {
  position: absolute;
  background: transparent;
  pointer-events: none;
  position: absolute;
  overflow: visible;
  z-index: 100;
  transition: all 0.3s ease-out;
  display: none;
}

/** placement = left */
.popover .popover-container {
  position: absolute;
  z-index: -1;
  left: unset;
  right: calc(100% + 8px);
  top: unset;
  min-width: 20px;
  min-height: 20px;
  padding: 10px;
  display: inline-block;
  background: var(--background-color-pane);
  border-radius: 4px;
  border: 1px solid var(--border-color-default);
  pointer-events: all;
}

.popover[placement="right"] .popover-container {
  left: calc(100% + 8px);
  right: unset;
  top: unset;
}

.popover[placement="bottom"] .popover-container {
  left: unset;
  right: unset;
  top: calc(100% + 8px);
}
</style>
