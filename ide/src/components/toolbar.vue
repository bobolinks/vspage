<template>
  <div class="toolbar" :align="align" :size="size">
    <i v-for="(item, key) in items" :key="key" :class="iconOf(item)" @click="callIt(item, $event)"
      :disabled="isDisabled(item)" :actived="isActived(item)">
    </i>
  </div>
</template>
<script lang="ts" setup>

defineProps({
  align: {
    type: String,
    default: "horizontal",
    values: ["vertical", "horizontal"],
  },
  size: {
    type: String,
    default: 'medium',
    values: ['mini', 'medium', 'large'],
  },
  items: {
    type: Array,
    default: [],
  },
});

const iconOf = (item: any) => {
  if (item.icon) {
    if (typeof item.icon === 'function') {
      return item.icon();
    }
    return `icon-${item.icon}`;
  }
  if (item.type === 'separator') {
    return 'icon-separator';
  }
}

const callIt = (item: any, event: any) => {
  if (item.excute) {
    item.excute(event);
  }
}

const isDisabled = (item: any) => {
  if (typeof item.disabled === 'function') {
    return item.disabled();
  }
  return !!item.disabled;
}

const isActived = (item: any) => {
  if (typeof item.actived === 'function') {
    return item.actived();
  }
  return !!item.actived;
}

</script>
<style scoped>
.toolbar {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
  align-items: center;
  justify-items: center;
}

.toolbar[align="vertical"] {
  flex-direction: column;
}

.toolbar i {
  margin: 0 4px;
  flex: 0 0 0%;
  min-width: 1em;
  border-radius: 4px;
  cursor: pointer;
  justify-content: space-between;
  color: var(--color-content);

  font-family: "idefont" !important;
  font-size: 16px;
  font-style: normal;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.toolbar i,
.toolbar[size="medium"] i {
  font-size: var(--font-size-icon-medium);
}

.toolbar[size="large"] i {
  font-size: var(--font-size-icon-large);
}

.toolbar[size="mini"] i {
  font-size: var(--font-size-icon-mini);
}

.toolbar i:hover {
  background: var(--background-color-light-normal);
  color: var(--color-light-normal);
}

.toolbar i[disabled="true"] {
  background: unset;
  color: var(--color-disabled);
  cursor: not-allowed;
  pointer-events: none;
}

.toolbar i[actived="true"] {
  color: var(--color-light-normal);
}

.toolbar[align="vertical"] i {
  margin: 8px 0;
}
</style>
