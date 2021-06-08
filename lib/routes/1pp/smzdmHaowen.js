const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const host = 'https://post.smzdm.com/hot_1/';

    const response = await got({
        method: 'get',
        url: host,
    });

    const data = response.data;
    const $ = cheerio.load(data);

    let list = $('.z-feed-title').get();

    const items = list.map((i) => {
        const item = $(i);
        const url = item.find('a').attr('href');
        const title = item.find('a').text();

        const single = {
            title: title,
            description: title,
            link: url,
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

            item.description = itemElement('#articleId').html();

            ctx.cache.set(link, JSON.stringify(item));
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: `什么值得买 好文日榜`,
        link: host,
        description: `什么值得买 好文日榜`,
        item: result,
    };
};
