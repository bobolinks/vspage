<template>
  <select class="select" placeholder="请选择" size="mini" style="flex: 0; min-width: 120px; margin-left: 4px"
    @change="onChanged">
    <option v-for="item in items" :key="item.value" :label="item.label" :value="item.value"
      :selected="value && value.value === item.value"></option>
  </select>
</template>

<script lang="ts" setup>
import { readonly, } from 'vue';
import type { DeviceInfo } from '../store';

defineProps({
  value: {} as any,
});

const items = readonly<Array<DeviceInfo>>([
  { value: 'Auto', label: '自适应', dimension: { width: '100%', height: '100%' } },
  { value: 'iPhone12', label: 'iPhone 12', statusBarHeight: '44px', dimension: { width: '390px', height: '844px' } },
  { value: 'iPhoneXsMax', label: 'iPhone Xs Max/11 Pro Max', statusBarHeight: '44px', dimension: { width: '414px', height: '896px' } },
  { value: 'iPhoneXR', label: 'iPhone XR/11 Pro', statusBarHeight: '44px', dimension: { width: '414px', height: '896px' } },
  { value: 'iPhoneX', label: 'iPhone X/Xs', statusBarHeight: '44px', dimension: { width: '375px', height: '812px' } },
  { value: 'iPhone8Plus', label: 'iPhone 6p/7p/8p', statusBarHeight: '20px', dimension: { width: '414px', height: '736px' } },
  { value: 'iPhone8', label: 'iPhone 6/7/8', statusBarHeight: '20px', dimension: { width: '375px', height: '667px' } },
  { value: 'iPhone5', label: 'iPhone 5/5s/5se', statusBarHeight: '20px', dimension: { width: '320px', height: '568px' } },
  { value: 'iPhone4', label: 'iPhone 3G/3Gs/4/4s', statusBarHeight: '20px', dimension: { width: '320px', height: '480px' } },
  { value: 'iPad', label: 'iPad', statusBarHeight: '20px', dimension: { width: '768px', height: '1024px' } },
  { value: 'GalaxyS5', label: 'Galaxy S5', statusBarHeight: '20px', dimension: { width: '360px', height: '640px' } },
  { value: 'Pixel2', label: 'Pixel 2', statusBarHeight: '20px', dimension: { width: '411px', height: '731px' } },
  { value: 'LongPage', label: '[660 X 100%] 长页', dimension: { width: '660px', height: '100%' }, },
  { value: 'WidePage', label: '[1366 X 768] 宽屏', dimension: { width: '1366px', height: '768px' }, },
  { value: 'WidePageEx', label: '[1920 X 1080] 超宽屏', dimension: { width: '1920px', height: '1080px' }, },
  { value: 'NorPage', label: '[1440 X 900] 普屏', dimension: { width: '1440px', height: '900px' }, },
  { value: '15Inc4:3', label: '15寸4:3宽屏', dimension: { width: '1024px', height: '768px' }, },
  { value: '16Inc4:3', label: '16寸4:3宽屏', dimension: { width: '1440px', height: '1050px' }, },
  { value: 'ad336px280px', label: '广告大矩形', dimension: { width: '336px', height: '280px' }, },
  { value: 'ad300px250px', label: '广告中矩形', dimension: { width: '300px', height: '250px' }, },
  { value: 'ad300px100px', label: '广告矩形', dimension: { width: '300px', height: '100px' }, },
  { value: 'ad728px90px', label: '广告通栏', dimension: { width: '728px', height: '90px' }, },
  { value: 'ad320px50px', label: '广告通栏移动版', dimension: { width: '320px', height: '50px' }, },
  { value: 'ad160px600px', label: '广告宽幅摩天大楼', dimension: { width: '160px', height: '600px' }, },
  { value: 'ad120px600px', label: '广告摩天大楼', dimension: { width: '120px', height: '600px' }, },
  { value: 'ad300px600px', label: '广告半页', dimension: { width: '300px', height: '600px' }, },
  { value: 'ad480px60px', label: '广告横幅', dimension: { width: '480px', height: '60px' }, },
  { value: 'ad88px31px', label: '广告微型形', dimension: { width: '88px', height: '31px' }, },
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
