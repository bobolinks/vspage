<template>
  <select class="select" placeholder="请选择" size="mini" style="flex: 0; min-width: 120px; margin-left: 4px"
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
  { value: 'iPhone12', label: 'iPhone 12', statusBarHeight: 44, dimension: { width: 390, height: 844 } },
  { value: 'iPhoneXsMax', label: 'iPhone Xs Max/11 Pro Max', statusBarHeight: 44, dimension: { width: 414, height: 896 } },
  { value: 'iPhoneXR', label: 'iPhone XR/11 Pro', statusBarHeight: 44, dimension: { width: 414, height: 896 } },
  { value: 'iPhoneX', label: 'iPhone X/Xs', statusBarHeight: 44, dimension: { width: 375, height: 812 } },
  { value: 'iPhone8Plus', label: 'iPhone 6p/7p/8p', statusBarHeight: 20, dimension: { width: 414, height: 736 } },
  { value: 'iPhone8', label: 'iPhone 6/7/8', statusBarHeight: 20, dimension: { width: 375, height: 667 } },
  { value: 'iPhone5', label: 'iPhone 5/5s/5se', statusBarHeight: 20, dimension: { width: 320, height: 568 } },
  { value: 'iPhone4', label: 'iPhone 3G/3Gs/4/4s', statusBarHeight: 20, dimension: { width: 320, height: 480 } },
  { value: 'iPad', label: 'iPad', statusBarHeight: 20, dimension: { width: 768, height: 1024 } },
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
  font-size: 14px;
  line-height: 14px;
  vertical-align: middle;
  padding: 4px 10px;
}
</style>
