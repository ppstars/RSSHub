const got = require('@/utils/got');
// const got = require('got');
const cheerio = require('cheerio');
const { JSDOM } = require('jsdom');

module.exports = async (ctx) => {
    const host = 'https://www.theblockbeats.com/';

    const response = await got({
        method: 'get',
        url: host,
    });

    const data =  new JSDOM(response.body, {
        runScripts: 'dangerously',
    });

    const list = data.window.__NUXT__.data[0].articleList;

    const items = list.map((i) => {
        if (i.flash == 1) {
            // 排除快讯
            return
        }

        const single = {
            title: i.title,
            description: i.im_abstract,
            link: `https://www.theblockbeats.com/news/${i.id}`,
        };
        return single;
    });

    // 删除 undefined
    while (items.indexOf(undefined) != -1) {
        items.splice(items.findIndex(item => item === undefined), 1)
    }

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

            const c = data.window.__NUXT__.data[0].infoList.content;

            item.description = c;

            ctx.cache.set(item.link, JSON.stringify(item));
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: '律动 首页新闻',
        link: 'https://www.theblockbeats.com',
        description: '律动 首页新闻',
        item: result,
    };
};
