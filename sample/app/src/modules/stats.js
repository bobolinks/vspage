/* eslint-disable */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-throw-literal */
import { appData } from '../store';
const cached = {
    service: [],
    product: [],
};
async function fetchData() {
    const file = await wx.cloud.downloadFile({
        fileID: 'cloud://cloud1-0g8h5fze48931cdf.636c-cloud1-0g8h5fze48931cdf-1305608886/earns.json'
    });
    const fs = wx.getFileSystemManager();
    const { tempFilePath } = file;
    const data = JSON.parse(fs.readFileSync(tempFilePath, 'utf-8'));
    if (!cached.service.length || !cached.product.length) {
        for (const iterator of ['s', 'p']) {
            const mapping = {};
            for (const [symbol, stock] of Object.entries(data)) {
                const { n: name, d: date, } = stock;
                const source = stock[iterator];
                for (const [ks, s] of Object.entries(source)) {
                    if (!s.i || !s.c || s.i < 0 || s.c < 0 || /其中|其他｜未分配/.test(ks)) {
                        continue;
                    }
                    const sv = mapping[ks] || (mapping[ks] = { name: ks, date: date, sample: 0, gross: 0, cap: 0, income: 0, cost: 0, proportion: [], left: { income: 0, cost: 0, gross: 0 } });
                    sv.sample += 1;
                    if (sv.date.localeCompare(date) < 0) {
                        sv.date = date;
                    }
                    sv.cap += s.i;
                    if (s.c > 0) {
                        sv.income += s.i;
                        sv.cost += s.c;
                        sv.proportion.push({ name, symbol, income: s.i, cost: s.c, gross: 1 - s.c / s.i });
                    }
                }
            }
            Object.values(mapping).forEach(sv => {
                sv.proportion.sort((a, b) => b.income - a.income);
                sv.gross = 1 - sv.cost / sv.income;
                sv.proportion.slice(4).forEach(p => {
                    sv.left.income += p.income;
                    sv.left.cost += p.cost || 0;
                });
                sv.left.gross = 1 - sv.left.cost / sv.left.income;
            });
            const mName = iterator === 's' ? 'service' : 'product';
            cached[mName] = Object.values(mapping).sort((a, b) => b.gross - a.gross);
        }
    }
    const pathCached = `${wx.env.USER_DATA_PATH}/cached.json`;
    fs.writeFileSync(pathCached, JSON.stringify(cached), 'utf-8');
    appData.ready = true;
}
export async function loadData() {
    const pathCached = `${wx.env.USER_DATA_PATH}/cached.json`;
    const fs = wx.getFileSystemManager();
    try {
        fs.accessSync(pathCached);
        const pack = JSON.parse(fs.readFileSync(pathCached, 'utf-8'));
        cached.service = pack.service;
        cached.product = pack.product;
        appData.ready = true;
    }
    catch (_e) {
        await fetchData();
    }
}
export default new class {
    list(type, key, order, count, offset) {
        const items = key ? cached[type].filter(item => item.name.indexOf(key) !== -1) : cached[type];
        console.time('stats');
        const rs = {
            total: items.length,
            cap: items.reduce((a, b) => a + b.cap, 0),
            cost: items.reduce((a, b) => a + b.cost, 0),
            date: items.reduce((a, b) => a.localeCompare(b.date) > 0 ? a : b.date, ''),
            items: [],
        };
        console.timeEnd('stats');
        if (!offset) {
            offset = 0;
        }
        else if (offset > items.length) {
            offset = items.length - 1;
        }
        if (!count) {
            count = items.length - offset;
        }
        else {
            count = Math.min(count, items.length - offset);
        }
        if (order === 'desc') {
            rs.items = items.slice(offset, offset + count);
        }
        else {
            rs.items = items.slice(items.length - offset - count, offset + count).reverse();
        }
        return rs;
    }
};
