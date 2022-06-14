<template>
  <div class="devbar" :mode="options.navigationStyle" :style="{
    display: 'flex', 'flex-direction': 'column', width: '100%',
    backgroundColor: options.navigationBarBackgroundColor || 'white',
  }">
    <StatusBar :options="options" :sysinfo="sysinfo"></StatusBar>
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
  sysinfo: {
    type: Object,
    default: {
      statusBarHeight: 22,
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
