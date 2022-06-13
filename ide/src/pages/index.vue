<template>
  <div class="main">
    <div style="display: flex; flex-direction: row">
      <div style="display: flex; flex-direction: column; min-height: 100vh; flex: 1 0 0%; position: relative">
        <div class="topbar" style="justify-content: space-between">
          <Toolbar :items="topbar" align="horizontal"></Toolbar>
          <Devices :device="state.sysinfo.model" @input="change" style="flex: 0 0 0%"></Devices>
        </div>
        <div class="container"
          style="align-items: center; display: flex; flex-direction: column; justify-content: center">
          <div class="simulator" id="simulator"
            style="align-items: stretch; flex-direction: column; position: relative;">
            <StatusBar class="statusbar" :options="state.page" :sysinfo="state.sysinfo"></StatusBar>
            <iframe seamless="true"></iframe>
          </div>
          <div class="ruler-corner"></div>
          <Ruler class="ruler-hori" align="horizontal" elementBound="simulator" :update-tick="updateTick"></Ruler>
          <Ruler class="ruler-vert" align="vertical" elementBound="simulator" :update-tick="updateTick"></Ruler>
          <div class="qrcode" v-if="qrcode"
            style="align-items: center; display: flex; flex-direction: column; justify-content: center">
            <img :src="qrcode" />
          </div>
          <ModalBox v-if="modal.content" :content="modal.content" :showcancel="modal.showCancel"
            :canceltext="modal.cancelText" :confirmtext="modal.confirmText" @action="onModalAction"></ModalBox>
          <Loading v-if="loading.show"></Loading>
        </div>
      </div>
      <div class="rightbar">
        <div class="topbar" style="justify-content:center; align-items: center;">
          <i class="idefont icon-logo" @click="changeTheme" :theme="state.theme"></i>
        </div>
        <Toolbar :items="handside" align="vertical"></Toolbar>
        <Popover class="tmpsPop" placement="left" max-width="420px">
          <FlexPane key="Flex-Pane" v-if="showFlex"></FlexPane>
        </Popover>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, markRaw, onMounted, computed, } from 'vue';
import Devices from '../components/devices.vue';
import ModalBox from '../components/modalBox.vue';
import Loading from '../components/loading.vue';
import StatusBar from '../components/wxatoolbar.vue';
import Ruler from '../components/ruler.vue';
import Toolbar from '../components/toolbar.vue';
import Popover, { showPopover } from '../components/popover.vue';
import FlexPane from '../components/flex.vue';
import state from '../store';
import { rpc } from '../rpc';
import type { DeviceInfo } from '../components/devices.vue';
import { layout } from '../actions/layout';
import { group as handsideGroup } from '../actions/handside';
import { Editor } from '../vspage';
import { updateSelector } from '../core/page';

const qrcode = ref('');

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
  const simulator = document.getElementById('simulator') as HTMLElement;
  if (simulator.parentElement) {
    simulator.parentElement.onclick = () => {
      const iframe = simulator.querySelector('iframe') as HTMLIFrameElement;
      updateSelector(iframe.contentDocument as any);
      Editor.select(null as any);
    };
  }
});

const updateTick = ref(0);

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

  updateTick.value++;
};

const onModalAction = (name: string) => {
  state.modal.content = '';
  state.modal.resolve ?? (name);
};

/** top bar */
const topbar = markRaw(Object.values(layout));

const showFlex = ref(false);

handsideGroup.flex.excute = (ev: Event) => {
  showFlex.value = true;
  const popover = document.querySelector('.tmpsPop') as HTMLElement;
  showPopover(popover, ev);
};

const handside = markRaw(Object.values(handsideGroup));

const changeTheme = () => {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  document.body.classList.toggle('theme-light');
  document.body.classList.toggle('theme-dark');
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
  background-color: var(--background-color-default);
}

.container {
  flex: 1 1 auto;
  justify-self: stretch;
  padding: 40px;
  min-width: calc(var(--dev-width) + 80px);
  min-height: calc(var(--dev-height) + 80px);
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
  box-shadow: var(--box-shadow-canvas);
}

.simulator iframe {
  flex: 1 1 auto;
  z-index: 0;
  border: none;
  background-color: white;
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
  display: flex;
  flex-direction: row;
  /* z-index: 9999; */
  /* height: 30px; */
  border-bottom: 1px solid var(--border-color-default);
  padding: 4px 8px;
  height: 40px;
  background: var(--background-color-toolbar);
}

.ruler-corner {
  position: absolute;
  left: 0;
  top: 0;
  width: 16px;
  height: 16px;
  background: var(--background-color-default);
}

.ruler-hori {
  position: absolute !important;
  left: 16px;
  top: 0;
  width: calc(100% - 16px);
  height: 16px;
  background: var(--background-color-default);
}

.ruler-vert {
  position: absolute !important;
  left: 0;
  top: 16px;
  width: 16px;
  height: calc(100% - 16px);
  background: var(--background-color-default);
}

.rightbar {
  flex: 0 0 0%;
  min-width: 40px;
  background: var(--background-color-toolbar);
  border-left: 1px solid var(--border-color-default);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.icon-logo {
  font-size: 24px;
  cursor: pointer;
}

.icon-logo[theme="dark"] {
  color: var(--color-light-normal);
}
</style>
