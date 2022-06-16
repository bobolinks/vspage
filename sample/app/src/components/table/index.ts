/* eslint-disable no-nested-ternary */
import { Stats } from '../../modules/index';

Component({
  options: {
    addGlobalClass: true,
  },
  properties: {
    name: {
      type: String,
      value: 'service',
    },
    tick: {
      type: Number,
    },
    key: {
      type: String,
    },
    limit: {
      type: Number,
      value: 300,
    },
  },
  data: {
    items: [{
      name: 'name',
      gross: 80,
      cap: 1,
      sample: 100,
    }] as any,
    ready: false,
    sum: {
      gross: '0',
      cap: '0',
      sample: 0,
      date: '',
    },
  },
  lifetimes: {
    attached() {
      this.update();
    },
  },
  observers: {
    key(value) {
      this.update();
    },
  },
  methods: {
    update() {
      const rs = Stats.list(this.data.name as any, this.data.key, 'desc', this.data.limit, 0);
      this.setData({
        items: rs.items.map((e, index) => {
          return {
            ...e,
            gross: (e.gross * 100).toFixed(2),
            cap: (e.cap / 100000000).toFixed(3),
            rank: index + 1,
          };
        }),
        sum: {
          gross: ((1 - rs.cost / rs.cap) * 100).toFixed(2),
          cap: (rs.cap / 100000000).toFixed(3),
          sample: rs.total,
          date: rs.date,
        },
      });
      console.log('updated');
    },
    onTap(event: any) {
      const { index } = event.currentTarget.dataset;
      const item = this.data.items[index];
      this.triggerEvent('action', { ...item, gross: parseFloat(item.gross) * 0.01, cap: parseFloat(item.cap) * 100000000 },);
    },
  },
});
