const got = require('@/utils/got');
// const got = require('got');
const cheerio = require('cheerio');
const { JSDOM } = require('jsdom');

module.exports = async (ctx) => {
    const host = 'https://www.chaincatcher.com/';

    const response = await got({
        method: 'get',
        url: host,
    });

    const data = new JSDOM(response.body, {
        runScripts: 'dangerously',
    });

    const list = data.window.INITIALIZED_DATA.main;
    // console.log(list);

    const items = list.map((i) => {
        if (i.cid === 3) {
            // 排除快讯
            return undefined;
        }

        // if (i.title === undefined) {
        //     return undefined;
        // }

        const single = {
            title: i.tit,
            description: i.des,
            link: `https://www.chaincatcher.com/article/${i.id}`,
        };
        // console.log(i);
        return single;
    });

    // 删除 undefined
    while (items.indexOf(undefined) !== -1) {
        items.splice(
            items.findIndex((item) => item === undefined),
            1
        );
    }

    const result = await Promise.all(
        items.map(async (item) => {
            // if (item.link !== 'https://www.chaincatcher.com/article/2069316') {
            //     return undefined;
            // }
            // console.log(item);
            const cache = await ctx.cache.get(item.link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const itemReponse = await got.get(item.link);

            const data = itemReponse.data;
            const itemElement = cheerio.load(data);

            item.description = itemElement('div#article').html();
            // console.log(item.description);

            ctx.cache.set(item.link, JSON.stringify(item));
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: '链捕手 首页新闻',
        link: 'https://www.chaincatcher.com',
        description: '链捕手 首页新闻',
        item: result,
    };
};
