<template>
  <div class="navbar" :mode="options.navigationStyle" :style="{
    backgroundColor: options.navigationBarBackgroundColor,
    color: options.navigationBarTextStyle || 'black',
  }" style="align-items: center; display: flex; flex-direction: row">
    <div style="width: 87px"></div>
    <span class="text-ellipsis" style="font-size: 14px">{{ options.navigationBarTitleText || '' }}</span>
    <div class="sc-gZMcBi jZVkoE" style="display: flex">
      <div class="sc-gqjmRU gBcYTa"
        style="background-color: rgba(255, 255, 255, 0.6); border-color: rgba(0, 0, 0, 0.05)">
        <div class="sc-fjdhpX fDwLsC"><i class="sc-kgoBCf fEZocp" style="background-color: rgb(0, 0, 0)"></i></div>
        <span class="sc-VigVT dhLBTW" style="background: rgba(0, 0, 0, 0.15)"></span>
        <div class="sc-fjdhpX fDwLsC"><i class="sc-kGXeez gvgaer" style="background-color: rgb(0, 0, 0)"></i></div>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>

defineProps({
  options: {
    /** StatusInfo from store.ts */
    type: Object,
    default: {
      navigationStyle: 'custom',
      navigationBarTitleText: 'title',
      navigationBarTextStyle: 'white',
    },
    required: true,
  },
});
</script>
<style scoped>
.navbar {
  flex: 0;
  min-height: 40px;
  margin: 0;
  padding: 0px 8px;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.navbar[mode='custom'] {
  /* min-height: unset;
  height: 0;
  position: absolute; */
  background: transparent;
  /* top: 24px; */
}

.jZVkoE {
  right: 0px;
  display: flex;
  -webkit-box-align: center;
  align-items: center;
  pointer-events: all;
}

.gBcYTa {
  display: flex;
  width: 87px;
  line-height: 1;
  font-size: 0px;
  -webkit-box-align: center;
  align-items: center;
  border-radius: 27px;
  border-width: 1px;
  border-style: solid;
  border-color: rgba(255, 255, 255, 0.25);
  border-image: initial;
}

.fDwLsC {
  display: flex;
  height: 30px;
  -webkit-box-align: center;
  align-items: center;
  -webkit-box-pack: center;
  justify-content: center;
  cursor: pointer;
  flex: 1 1 0%;
  padding: 6.4px 0px;
}

.dhLBTW {
  display: inline-block;
  min-width: 1px;
  height: 17.2px;
  background: rgba(255, 255, 255, 0.25);
}

.fEZocp {
  display: inline-block;
  vertical-align: middle;
  width: 22px;
  height: 7px;
  -webkit-mask: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDUiIGhlaWdodD0iMTUiIHZpZXdCb3g9IjAgMCA0NSAxNSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+bWVudV9ibGFja0AyeDwvdGl0bGU+PHBhdGggZD0iTTEwIDhBNSA1IDAgMSAxLS4wMDEgNy45OTkgNSA1IDAgMCAxIDEwIDh6bTEyLjUtOGE3LjUgNy41IDAgMSAxIDAgMTUgNy41IDcuNSAwIDAgMSAwLTE1ek00MCAzYTUgNSAwIDEgMSAwIDEwIDUgNSAwIDAgMSAwLTEweiIgZmlsbD0iIzAwMCIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+) 50% 50% / cover no-repeat;
  mask: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDUiIGhlaWdodD0iMTUiIHZpZXdCb3g9IjAgMCA0NSAxNSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+bWVudV9ibGFja0AyeDwvdGl0bGU+PHBhdGggZD0iTTEwIDhBNSA1IDAgMSAxLS4wMDEgNy45OTkgNSA1IDAgMCAxIDEwIDh6bTEyLjUtOGE3LjUgNy41IDAgMSAxIDAgMTUgNy41IDcuNSAwIDAgMSAwLTE1ek00MCAzYTUgNSAwIDEgMSAwIDEwIDUgNSAwIDAgMSAwLTEweiIgZmlsbD0iIzAwMCIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9zdmc+) 50% 50% / cover no-repeat;
  background: rgb(255, 255, 255);
}

.gvgaer {
  display: inline-block;
  vertical-align: middle;
  width: 17px;
  height: 17px;
  -webkit-mask: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTIiIGhlaWdodD0iNTIiIHZpZXdCb3g9IjAgMCA1MiA1MiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+ZXhpdDwvdGl0bGU+PHBhdGggZD0iTTI2IDUyQzExLjY0IDUyIDAgNDAuMzYgMCAyNlMxMS42NCAwIDI2IDBzMjYgMTEuNjQgMjYgMjYtMTEuNjQgMjYtMjYgMjZ6bTAtNi4xMThjMTAuOTggMCAxOS44ODItOC45MDEgMTkuODgyLTE5Ljg4MiAwLTEwLjk4LTguOTAxLTE5Ljg4Mi0xOS44ODItMTkuODgyQzE1LjAyIDYuMTE4IDYuMTE4IDE1LjAxOSA2LjExOCAyNmMwIDEwLjk4IDguOTAxIDE5Ljg4MiAxOS44ODIgMTkuODgyek0zNSAyNmE5LjAwMSA5LjAwMSAwIDEgMS0xOC4wMDItLjAwMkE5LjAwMSA5LjAwMSAwIDAgMSAzNSAyNnoiIGZpbGw9IiMwMDAiIGZpbGwtcnVsZT0ibm9uemVybyIvPjwvc3ZnPg==) 50% 50% / cover no-repeat;
  mask: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTIiIGhlaWdodD0iNTIiIHZpZXdCb3g9IjAgMCA1MiA1MiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+ZXhpdDwvdGl0bGU+PHBhdGggZD0iTTI2IDUyQzExLjY0IDUyIDAgNDAuMzYgMCAyNlMxMS42NCAwIDI2IDBzMjYgMTEuNjQgMjYgMjYtMTEuNjQgMjYtMjYgMjZ6bTAtNi4xMThjMTAuOTggMCAxOS44ODItOC45MDEgMTkuODgyLTE5Ljg4MiAwLTEwLjk4LTguOTAxLTE5Ljg4Mi0xOS44ODItMTkuODgyQzE1LjAyIDYuMTE4IDYuMTE4IDE1LjAxOSA2LjExOCAyNmMwIDEwLjk4IDguOTAxIDE5Ljg4MiAxOS44ODIgMTkuODgyek0zNSAyNmE5LjAwMSA5LjAwMSAwIDEgMS0xOC4wMDItLjAwMkE5LjAwMSA5LjAwMSAwIDAgMSAzNSAyNnoiIGZpbGw9IiMwMDAiIGZpbGwtcnVsZT0ibm9uemVybyIvPjwvc3ZnPg==) 50% 50% / cover no-repeat;
  background: rgb(255, 255, 255);
}
</style>
