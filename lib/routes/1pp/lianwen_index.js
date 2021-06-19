const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const host = 'https://www.chainnews.com/';

    const response = await got({
        method: 'get',
        url: host,
    });

    const data = response.data;
    const $ = cheerio.load(data);

    const list = $('h2.feed-post-title').get();

    const items = list.map((i) => {
        const item = $(i);
        const url = item.find('a').attr('href');
        const title = item.find('a').text();

        const single = {
            title: title,
            description: title,
            link: `https://www.chainnews.com${url}`,
        };
        return single;
    });

    const result = await Promise.all(
        items.map(async (item) => {
            const link = item.link;

            const cache = await ctx.cache.get(link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const itemReponse = await got({
                method: 'get',
                url: link,
            });

            const data = itemReponse.data;
            const itemElement = cheerio.load(data);

            let t = itemElement('h2.post-content.markdown').html();
            if (t === null) {
                t = itemElement('div.post-content.markdown').html();
            }
            item.description = t;
            ctx.cache.set(link, JSON.stringify(item));
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: `链闻 首页`,
        link: host,
        description: `链闻 首页`,
        item: result,
    };
};
