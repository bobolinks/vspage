<template>
  <div class="layout-col flex-pane">
    <div class="sep" style="font-size: 12px">FLEX布局配置</div>
    <div v-for="(item, key) in items" :key="key" class="layout-col flex-group">
      <div class="layout-row" style="margin-bottom: 4px">
        <span>{{ key }}:</span>
        <span style="margin-left: 4px; color: var(--color-light-warning)">{{
            getValue(key)
        }}</span>
      </div>
      <div class="layout-row flex-items">
        <i v-for="(it, k) in item" :key="k" :class="`flex ${clsColomn}${key}-${it}`" :actived="getValue(key) === it"
          @click="applyStyle(key, it)"></i>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { readonly, computed } from 'vue';
import state from '../store';
import { Editor } from '../vspage';

const items = readonly({
  "flex-direction": ["row", "row-reverse", "column", "column-reverse"],
  "flex-wrap": ["nowrap", "wrap"],
  "align-content": [
    "center",
    "flex-start",
    "flex-end",
    "space-around",
    "space-between",
    "stretch",
  ],
  "justify-content": [
    "center",
    "flex-start",
    "flex-end",
    "space-around",
    "space-between",
    "space-evenly",
  ],
  "align-items": ["center", "flex-start", "flex-end", "stretch", "baseline"],
});

const clsColomn = computed(() => {
  const ast = state.swap.ast;
  if (!ast?.style) {
    return '';
  }
  return ast.style["flex-direction"] === "column" ? "column " : "";
});

const estyle = computed(() => {
  const ast = state.swap.ast;
  if (!ast?.style) {
    return '';
  }
  return ast.style || {};
});

const applyStyle = (key: string, value: string) => {
  const style = estyle as any;
  if (style[key] === value) {
    delete style[key];
  } else {
    style[key] = value;
  }
  Editor.markDirty();
}

const getValue = (name: string) => {
  const style = estyle as any;
  return style[name];
}

</script>
<style scoped>
.layout-col {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: stretch;
}

.flex-pane {
  width: 100%;
  align-items: stretch;
}

.flex-group {
  padding: 4px;
}

.flex-group span {
  white-space: nowrap;
}

.flex-items i {
  font-size: 22px;
  border: 1px solid rgba(100, 100, 100, 0.5);
  border-right: none;
}

.flex-items i:last-child {
  border-right: 1px solid rgba(100, 100, 100, 0.5);
}
</style>
