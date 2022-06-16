import WxCanvas from './wx-canvas';
const echarts = require('./echarts.min');

function compareVersion(v1: any, v2: any) {
  v1 = v1.split('.')
  v2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)

  while (v1.length < len) {
    v1.push('0')
  }
  while (v2.length < len) {
    v2.push('0')
  }

  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i])
    const num2 = parseInt(v2[i])

    if (num1 > num2) {
      return 1
    } else if (num1 < num2) {
      return -1
    }
  }
  return 0
}

Component({
  properties: {
    canvasId: {
      type: String,
      value: 'ec-canvas'
    },
    options: {
      type: Object,
    },
  },

  ready: function () {
    // Disable prograssive because drawImage doesn't support DOM as parameter
    // See https://developers.weixin.qq.com/miniprogram/dev/api/canvas/CanvasContext.drawImage.html
    echarts.registerPreprocessor((option: { series: { length: number; forEach: (arg0: (series: any) => void) => void; progressive: number; }; }) => {
      if (option && option.series) {
        if (option.series.length > 0) {
          option.series.forEach((series: { progressive: number; }) => {
            series.progressive = 0;
          });
        }
        else if (typeof option.series === 'object') {
          option.series.progressive = 0;
        }
      }
    });

    if (!this.data.options) {
      console.warn('组件需绑定 options 变量，例：<ec-canvas canvasId="canvasId" options="{{ options }}"></ec-canvas>');
      return;
    }
    this.init();
  },

  methods: {
    init: function () {
      const version = wx.getSystemInfoSync().SDKVersion

      const canUseNewCanvas = compareVersion(version, '2.9.0') >= 0;

      if (!canUseNewCanvas) {
        console.warn('版本不兼容');
      }

      // version >= 2.9.0：使用新的方式初始化
      const query = wx.createSelectorQuery().in(this)
      query
        .select('.ec-canvas')
        .fields({ node: true, size: true })
        .exec(res => {
          const canvasNode = res[0].node
          // @ts-ignore
          this.canvasNode = canvasNode

          const canvasDpr = wx.getSystemInfoSync().pixelRatio
          const canvasWidth = res[0].width
          const canvasHeight = res[0].height

          const ctx = canvasNode.getContext('2d')

          const canvas = new WxCanvas(ctx, this.data.canvasId, true, canvasNode)
          echarts.setCanvasCreator(() => {
            return canvas
          })

          const chart = echarts.init(canvas, null, {
            width: canvasWidth,
            height: canvasHeight,
            devicePixelRatio: canvasDpr,
          });
          canvas.setChart(chart);
          chart.setOption(this.data.options);
          (this as any).chart = chart;
          // chart.on('click', (params) => {
          //   this.triggerEvent('action', params);
          // });
          chart.getZr().on("click", (params: any) => {
            this.triggerEvent('action', params);
          });
          return chart;
        });
    },
    canvasToTempFilePath(opt: { canvas: any; }) {
      const query = wx.createSelectorQuery().in(this)
      query
        .select('.ec-canvas')
        .fields({ node: true, size: true })
        .exec(res => {
          const canvasNode = res[0].node
          opt.canvas = canvasNode
          wx.canvasToTempFilePath(opt)
        });
    },

    touchStart(e: { touches: string | any[]; }) {
      // @ts-ignore
      if (this.chart && e.touches.length > 0) {
        var touch = e.touches[0];
        // @ts-ignore
        var handler = this.chart.getZr().handler;
        handler.dispatch('mousedown', {
          zrX: touch.x,
          zrY: touch.y
        });
        handler.dispatch('mousemove', {
          zrX: touch.x,
          zrY: touch.y
        });
        handler.processGesture(wrapTouch(e), 'start');
      }
    },

    touchMove(e: { touches: string | any[]; }) {
      // @ts-ignore
      if (this.chart && e.touches.length > 0) {
        var touch = e.touches[0];
        // @ts-ignore
        var handler = this.chart.getZr().handler;
        handler.dispatch('mousemove', {
          zrX: touch.x,
          zrY: touch.y
        });
        handler.processGesture(wrapTouch(e), 'change');
      }
    },

    touchEnd(e: { changedTouches: any[]; }) {
      // @ts-ignore
      if (this.chart) {
        const touch = e.changedTouches ? e.changedTouches[0] : {};
        // @ts-ignore
        var handler = this.chart.getZr().handler;
        handler.dispatch('mouseup', {
          zrX: touch.x,
          zrY: touch.y
        });
        handler.dispatch('click', {
          zrX: touch.x,
          zrY: touch.y
        });
        handler.processGesture(wrapTouch(e as any), 'end');
      }
    },

    updateOptions(options: WechatMiniprogram.IAnyObject) {
      this.data.options = options;
      (this as any).chart.setOption(options);
    },

    getChartInstance() {
      return (this as any).chart;
    }
  }
});

function wrapTouch(event: { touches: string | any[]; }) {
  for (let i = 0; i < event.touches.length; ++i) {
    const touch = event.touches[i];
    touch.offsetX = touch.x;
    touch.offsetY = touch.y;
  }
  return event;
}
