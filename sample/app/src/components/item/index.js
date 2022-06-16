/* eslint-disable */
"use strict";
/* eslint-disable no-nested-ternary */
Component({
    options: {
        addGlobalClass: true,
    },
    properties: {
        props: {
            type: Object,
            value: {},
        },
    },
    methods: {
        onTap() {
            this.triggerEvent('action', this.data.props);
        },
    },
});
