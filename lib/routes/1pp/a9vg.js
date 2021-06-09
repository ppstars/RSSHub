const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const response = await got({
        method: 'get',
        url: 'http://www.a9vg.com/list/news',
        headers: {
            Referer: 'http://www.a9vg.com/list/news',
        },
    });

    const data = response.data;

    const $ = cheerio.load(data);
    const list = $('.a9-rich-card-list li').get();

    const items = list.map((i) => {
        const item = $(i);
        const url = 'http://www.a9vg.com' + item.find('.a9-rich-card-list_item').attr('href');
        const title = item.find('.a9-rich-card-list_label').text();

        const single = {
            title: title,
            description: title,
            link: url,
            pubDate: new Date(item.find('.a9-rich-card-list_infos').text()).toUTCString(),
        };
        return single;
    });

    const result = await Promise.all(
        items.map(async (item) => {
            const cache = await ctx.cache.get(item.link);
            if (cache) {
                return Promise.resolve(JSON.parse(cache));
            }

            const itemReponse = await got({
                method: 'get',
                url: item.link,
            });

            const data = itemReponse.body;
            const itemElement = cheerio.load(data);

            var description = itemElement('.c-article-main_contentraw').html();
            item.description = description;

            ctx.cache.set(item.link, JSON.stringify(item));
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: 'A9VG电玩部落',
        link: 'http://www.a9vg.com/list/news/',
        description: '电玩资讯_电玩动态- A9VG电玩部落',
        item: result,
    };
};
