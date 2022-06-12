<template>
  <div class="main">
    <div style="display: flex; flex-direction: row">
      <div style="display: flex; flex-direction: column; min-height: 100vh; flex: 0 0 0%; position: relative">
        <div class="topbar" style="display: flex; flex-direction: row; justify-content: flex-end">
          <Devices :device="state.sysinfo.model" @input="change" style="flex: 0 0 0%"></Devices>
        </div>
        <div class="container"
          style="align-items: center; display: flex; flex-direction: column; justify-content: center">
          <div class="simulator" id="simulator"
            style="align-items: stretch; flex-direction: column; position: relative;">
            <StatusBar class="statusbar" :options="state.page" :sysinfo="state.sysinfo"></StatusBar>
            <iframe seamless="true"></iframe>
          </div>
          <div class="qrcode" v-if="qrcode"
            style="align-items: center; display: flex; flex-direction: column; justify-content: center">
            <img :src="qrcode" />
          </div>
          <ModalBox v-if="modal.content" :content="modal.content" :showcancel="modal.showCancel"
            :canceltext="modal.cancelText" :confirmtext="modal.confirmText" @action="onModalAction"></ModalBox>
          <Loading v-if="loading.show"></Loading>
        </div>
      </div>
      <div class="plugins" style="justify-content: space-between">
        <div class="tabs" style="align-items: center; display: flex; flex-direction: row">
          <label class="tab-item" v-for="(item, index) in plugins" :key="index" :selected="index === pluginSelected"
            @click="tagPlugin(index)">{{ item.label }}</label>
          <label class="tab-item" style="flex: 1 1 auto"></label>
        </div>
        <keep-alive>
          <Plugin :src="plugins[pluginSelected].link" style="width: 100%; height: 100%"></Plugin>
        </keep-alive>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, readonly, onMounted, computed, } from 'vue';
import Devices from '../components/devices.vue';
import ModalBox from '../components/modalBox.vue';
import Loading from '../components/loading.vue';
import Plugin from '../components/plugin.vue';
import StatusBar from '../components/wxatoolbar.vue';
import state from '../store';
import { rpc } from '../rpc';
import type { DeviceInfo } from '../components/devices.vue';

const qrcode = ref('');
const plugins = readonly([
  {
    label: '命令行',
    link: '',
  },
  {
    label: '自动化测试',
    link: '',
  },
]);
const pluginSelected = ref(0);

const modal = computed(() => {
  return state.modal;
});

const loading = computed(() => {
  return state.loading;
});

onMounted(() => {
  rpc.describe('account:qrcode', (url: string) => {
    qrcode.value = url;
  }, null);
});

const change = (device: DeviceInfo) => {
  if (!device) {
    // fk, why vue emit change event twice
    return;
  }
  state.sysinfo.brand = device.value;
  state.sysinfo.model = device.label;
  // state.sysinfo.naviHeight = 40;
  const safeHeight = device.dimension.height - device.statusBarHeight - state.sysinfo.naviHeight + 6;
  state.sysinfo.safeArea = {
    top: device.statusBarHeight,
    left: 0,
    right: device.dimension.width,
    bottom: device.statusBarHeight + safeHeight,
    height: safeHeight,
    width: device.dimension.width,
  };
  state.sysinfo.screenHeight = device.dimension.height;
  state.sysinfo.screenWidth = device.dimension.width;
  state.sysinfo.statusBarHeight = device.statusBarHeight;
  state.sysinfo.windowHeight = device.dimension.height;
  state.sysinfo.windowWidth = device.dimension.width;

  document.documentElement.style.setProperty('--dev-width', `${device.dimension.width}px`);
  document.documentElement.style.setProperty('--dev-height', `${device.dimension.height}px`);
};

const onModalAction = (name: string) => {
  state.modal.content = '';
  state.modal.resolve ?? (name);
};

const tagPlugin = (index: number) => {
  pluginSelected.value = index;
};

</script>
<style>
:root {
  --dev-width: 375px;
  --dev-height: 812px;
}

.main {
  width: 100vw;
  height: 100vh;
  position: relative;
}

.container {
  flex: 1 1 auto;
  justify-self: stretch;
  padding: 8px;
  min-width: calc(var(--dev-width) + 16px);
  min-height: calc(var(--dev-height) + 16px);
  position: relative;
}

.statusbar {
  z-index: 999;
}

.simulator {
  margin: auto;
  width: var(--dev-width);
  min-width: var(--dev-width);
  height: var(--dev-height);
  min-height: var(--dev-height);
  display: flex;
  box-shadow: 0px 0px 6px 1px gray;
}

.simulator iframe {
  flex: 1 1 auto;
  z-index: 0;
  border: none;
}

.plugins {
  flex: 1 1 auto;
  min-width: 200px;
  border-left: 2px solid #f2f2f2;
}

.main .qrcode {
  position: absolute;
  z-index: 9999;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
}

.main .qrcode img {
  width: 60%;
  object-fit: contain;
}

.topbar {
  z-index: 9999;
  height: 30px;
  border-bottom: 1px solid #f2f2f2;
  padding: 2px 8px;
}

.tabs {
  padding: 0;
}

.tab-item {
  height: 30px;
  line-height: 30px;
  vertical-align: middle;
  border-bottom: 1px solid #f2f2f2;
  padding: 2px 8px;
}

.tab-item[selected='true'] {
  border-color: var(--color-light-high);
}
</style>
