/* eslint-disable */
import { $s } from '../../locales/index';
import { PageWithData } from '../../utils/router';
PageWithData({
    data: {
        $s,
        item: { left: {}, proportion: [] },
        items: [],
        ecData: {
            title: {
                subtext: '市场份额',
                left: 'center'
            },
            legend: {
                top: 'bottom',
            },
            series: [
                {
                    type: 'pie',
                    radius: '50%',
                    data: [
                        { value: 1048, name: 'Search Engine' },
                        { value: 735, name: 'Direct' },
                        { value: 580, name: 'Email' },
                        { value: 484, name: 'Union Ads' },
                        { value: 300, name: 'Video Ads' }
                    ],
                    itemStyle: {
                        borderRadius: 4,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: {
                        formatter: '{per|{d}%}  ',
                        rich: {
                            per: {
                                color: '#fff',
                                backgroundColor: '#4C5058',
                                padding: [3, 4],
                                borderRadius: 4
                            }
                        }
                    },
                }
            ]
        },
    },
    onLoad(options) {
        wx.setNavigationBarTitle({
            title: this.data.item.name,
        });
        const item = this.data.item;
        const data = this.data.ecData.series[0].data;
        data.length = 0;
        const count = Math.min(4, item.proportion.length);
        for (let i = 0; i < count; i++) {
            const p = item.proportion[i];
            data.push({ value: p.income, name: p.name });
        }
        if (item.left.income) {
            data.push({ value: item.left.income, name: '其他' });
        }
        let rank = 1;
        this.setData({
            item: {
                ...item,
                gross: (item.gross * 100).toFixed(2),
                cap: (item.cap / 100000000).toFixed(3),
            },
            items: item.proportion.map(e => ({
                ...e,
                value: Math.min(100, (100 * e.income / item.cap)).toFixed(2),
                income: (e.income / 100000000).toFixed(3),
                gross: (e.gross * 100).toFixed(2),
                rank: rank++,
            })),
            ecData: this.data.ecData,
        });
    },
    onShareAppMessage() {
        return {};
    },
    onGoto(event) {
        this.setData({
            tab: event.detail,
        });
    },
    search(event) {
        this.setData({
            key: event.detail,
        });
    },
});
