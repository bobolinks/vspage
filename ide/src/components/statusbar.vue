<template>
  <div class="iPhoneX-StatusBar" :mode="options.navigationStyle"
    :style="{ flex: '0', minHeight: device.statusBarHeight, backgroundColor: options.navigationBarBackgroundColor || '#f8f8f9' }">
    <div style="display: flex; flex: 0; flex-direction: row">
      <div class="StatusBarSignal">
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="12">
          <path
            d="M1.25 6.5h1a1 1 0 0 1 1 1V10a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V7.5a1 1 0 0 1 1-1zM5.75 5h1a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm4.5-2h1a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm4.5-2h1a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z"
            fill-rule="evenodd"></path>
        </svg>
      </div>
      <div class="StatusBarWifi">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="12">
          <path
            d="M8.007 2.787a8.64 8.64 0 0 1 5.953 2.379c.12.118.314.116.433-.004l1.156-1.166a.322.322 0 0 0-.003-.456 10.897 10.897 0 0 0-15.08 0 .322.322 0 0 0-.003.456L1.62 5.162c.119.12.312.122.433.004a8.641 8.641 0 0 1 5.954-2.379zm0 3.796c1.217 0 2.391.452 3.294 1.27a.31.31 0 0 0 .433-.006l1.155-1.167a.322.322 0 0 0-.005-.459 7.16 7.16 0 0 0-9.752 0 .322.322 0 0 0-.005.46l1.155 1.166a.31.31 0 0 0 .433.006 4.907 4.907 0 0 1 3.292-1.27zm2.219 2.784a.314.314 0 0 0-.01-.457 3.422 3.422 0 0 0-4.42 0 .314.314 0 0 0-.009.457l1.998 2.016a.312.312 0 0 0 .443 0l1.998-2.016z"
            fill-rule="nonzero"></path>
        </svg>
      </div>
    </div>
    <div class="StatusBarTime" style="display: flex; flex-direction: row">12:00</div>
    <div class="StatusBarBattery" style="display: flex; flex-direction: row">
      <svg xmlns="http://www.w3.org/2000/svg" width="25" height="12">
        <path
          d="M2.667 1.333C1.747 1.333 1 2.08 1 3v6c0 .92.746 1.667 1.667 1.667h16.666C20.253 10.667 21 9.92 21 9V3c0-.92-.746-1.667-1.667-1.667H2.667zm0-1h16.666A2.667 2.667 0 0 1 22 3v6a2.667 2.667 0 0 1-2.667 2.667H2.667A2.667 2.667 0 0 1 0 9V3A2.667 2.667 0 0 1 2.667.333z"
          opacity=".35"></path>
        <path d="M23 4v4a2.17 2.17 0 0 0 0-4" opacity=".4"></path>
        <rect x="2" y="2.333" width="18" height="7.333" rx="1.333"></rect>
      </svg>
    </div>
  </div>
</template>
<script lang="ts" setup>

defineProps({
  options: {
    /** StatusInfo from store.ts */
    type: Object,
    default: {
      navigationBarBackgroundColor: '#fff',
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
.iPhoneX-StatusBar {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  justify-items: center;
  align-items: center;
  flex-wrap: nowrap;
  width: 100%;
  padding: 0 14px;
  position: relative;
  color: #3e3e3e;
}

.iPhoneX-StatusBar[mode='custom'] {
  background: transparent !important;
}

.iPhoneX-StatusBar .StatusBarTime {
  margin-left: 7px;
  width: 54px;
  font-size: 14px;
  font-weight: 600;
}

.iPhoneX-StatusBar .StatusBarSignal,
.iPhoneX-StatusBar .StatusBarWifi {
  margin-right: 0.4em;
}
</style>
