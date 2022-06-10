<template>
  <div class="devbar" :mode="options.navigationStyle"
    style="display: flex; flex-direction: column; position: relative; width: 100%">
    <StatusBar :options="options" :device="device"></StatusBar>
    <NavBar :options="options"></NavBar>
  </div>
</template>
<script lang="ts" setup>
import StatusBar from './statusbar.vue';
import NavBar from './wxnavbar.vue';

defineProps({
  options: {
    /** StatusInfo from store.ts */
    type: Object,
    default: {
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: 'title',
      navigationBarTextStyle: 'black',
    },
    required: true,
  },
  device: {
    type: Object,
    default: {
      statusBarHeight: '22px',
    },
    required: true,
  },
});

</script>
<style scoped>
.devbar[mode='custom'] {
  min-height: unset;
  height: 0;
  position: absolute;
  background: transparent;
  pointer-events: none;
}
</style>
