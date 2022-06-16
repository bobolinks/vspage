/* eslint-disable */
/* eslint-disable no-nested-ternary */
import { Utils } from '../../utils/index';
import { $s } from '../../locales/index';
import actions from '../tabs/actions';
const first = Object.entries(actions.bottom)[0];
Component({
    options: {
        addGlobalClass: true,
    },
    properties: {
        name: {
            type: String,
            value: first[0],
        },
    },
    data: {
        isPlaying: false,
        statusBarHeight: 24,
        naviPadding: 68,
        $s,
        icon: first[1].topicon || first[1].icon,
        search: first[1].input === true,
        title: first[1].input,
    },
    observers: {
        name(value) {
            this.update(value);
        },
    },
    lifetimes: {
        attached() {
            this.setData({
                statusBarHeight: Utils.getSystemInfo().statusBarHeight,
                naviPadding: Utils.getSystemInfo().naviPadding,
            });
        },
    },
    methods: {
        update(name) {
            const tab = actions.bottom[name];
            this.setData({
                icon: tab.topicon || tab.icon,
                search: tab.input === true,
                title: tab.input,
            });
        },
        onInput(event) {
            const valueFmt = event.detail.value.replace(/[`@#$^&*|{}''[\]<>/?~！@#￥……&*（）——|{}【】‘；：”“'。？]/g, '').replace(/^(.{0,10}).*$/, '$1');
            this.triggerEvent('search', valueFmt);
        },
        onMain() {
            this.triggerEvent('action', 'main');
        },
        onTap(event) {
            const name = event.currentTarget.dataset.name;
            this.setData({
                tagSel: name,
            });
            this.triggerEvent('action', name);
        },
    },
});
