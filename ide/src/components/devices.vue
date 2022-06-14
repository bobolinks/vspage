<template>
  <select class="select" placeholder="请选择" size="mini" style="flex: 0; min-width: 160px; margin-left: 4px"
    @change="onChanged">
    <option v-for="item in items" :key="item.value" :label="item.label" :value="item.value"
      :selected="device === item.value"></option>
  </select>
</template>

<script lang="ts" setup>
import { readonly, } from 'vue';

export type DeviceInfo = {
  value: string;
  label: string;
  statusBarHeight: number;
  dimension: {
    width: number;
    height: number;
  };
};

defineProps({
  device: {
    type: String,
    default: 'iPhoneX',
  },
});

const items = readonly<Array<DeviceInfo>>([
  { value: 'iPhone13PM', label: 'iPhone 12/13 Pro Max', statusBarHeight: 47, dimension: { width: 428, height: 926 } },
  { value: 'iPhone13P', label: 'iPhone 12/13 Pro', statusBarHeight: 47, dimension: { width: 390, height: 844 } },
  { value: 'iPhone12m', label: 'iPhone 12/13 mini', statusBarHeight: 44, dimension: { width: 375, height: 812 } },
  { value: 'iPhoneXsMax', label: 'iPhone Xs Max/11 Pro Max', statusBarHeight: 44, dimension: { width: 414, height: 896 } },
  { value: 'iPhoneXR', label: 'iPhone XR/11 Pro', statusBarHeight: 44, dimension: { width: 414, height: 896 } },
  { value: 'iPhoneX', label: 'iPhone X/Xs', statusBarHeight: 44, dimension: { width: 375, height: 812 } },
  { value: 'iPhone8Plus', label: 'iPhone 6p/7p/8p', statusBarHeight: 20, dimension: { width: 414, height: 736 } },
  { value: 'iPhone8', label: 'iPhone 6/7/8', statusBarHeight: 20, dimension: { width: 375, height: 667 } },
  { value: 'iPhone5', label: 'iPhone 5/5s/5se', statusBarHeight: 20, dimension: { width: 320, height: 568 } },
  { value: 'iPad', label: 'iPad', statusBarHeight: 20, dimension: { width: 768, height: 1024 } },
  { value: 'iPadPro10.9', label: 'iPad Pro 10.9-inch', statusBarHeight: 20, dimension: { width: 834, height: 1112 } },
  { value: 'iPadPro12.9', label: 'iPad Pro 12.9-inch', statusBarHeight: 20, dimension: { width: 1024, height: 1366 } },
  { value: 'GalaxyS5', label: 'Galaxy S5', statusBarHeight: 20, dimension: { width: 360, height: 640 } },
  { value: 'Pixel2', label: 'Pixel 2', statusBarHeight: 20, dimension: { width: 411, height: 731 } },
]);

const emit = defineEmits(["input"]);

const onChanged = (ev: any) => {
  emit(
    'input',
    items.find((e: any) => e.value === ev.currentTarget.value),
  );
};

</script>

<style scoped>
.select {
  border: none;
  font-size: 12px;
  height: 26px;
  vertical-align: middle;
  border-radius: 4px;
  color: var(--color-content);
  background-color: var(--background-color-popver);
  border: 1px solid var(--border-color-default) !important;
}
</style>
