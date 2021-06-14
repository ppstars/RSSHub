const got = require('@/utils/got');
// const got = require('got');
const cheerio = require('cheerio');
const { JSDOM } = require('jsdom');

module.exports = async (ctx) => {
    const host = 'https://gouhuo.qq.com/content/tablist/1_110';

    const response = await got({
        method: 'get',
        url: host,
    });

    const data =  new JSDOM(response.body, {
        runScripts: 'dangerously',
    });

    const list = data.window.__NUXT__.data[0].list;

    const items = list.map((i) => {
        const url = i.link;
        const title = i.title;

        const single = {
            title: title,
            description: title,
            link: url,
            pubDate: new Date().toUTCString(),
        };
        return single;
    });

    const result = await Promise.all(
        items.map(async (item) => {
            const cache = await ctx.cache.get(item.link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const itemReponse = await got.get(item.link);

            const data =  new JSDOM(itemReponse.body, {
                runScripts: 'dangerously',
            });

            const c = data.window.__NUXT__.data[0];

            item.description = c.richText;

            ctx.cache.set(item.link, JSON.stringify(item));
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: '篝火营地 精选',
        link: 'https://gouhuo.qq.com/content/tablist/1_110',
        description: '篝火营地 精选',
        item: result,
    };
};
