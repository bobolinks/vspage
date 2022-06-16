/* eslint-disable */
import actions from './actions';
const first = Object.entries(actions.bottom)[0];
Component({
    options: {
        addGlobalClass: true,
    },
    properties: {
        current: {
            type: String,
            value: first[0],
        },
    },
    data: {
        items: actions.bottom,
    },
    methods: {
        onGoto(event) {
            const name = event.currentTarget.dataset.name;
            this.setData({
                current: name,
            });
            this.triggerEvent('action', name);
        },
    },
    pageLifetimes: {
        show() {
            this.setData({});
        },
    },
});
