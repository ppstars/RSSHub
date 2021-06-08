const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const host = 'https://bihu.com/index';

    const response = await got({
        method: 'get',
        url: host,
    });

    const data = response.data;
    const $ = cheerio.load(data);

    let list = $('div.commend-item-content').get();

    const items = list.map((i) => {
        const item = $(i);
        const url = item.find('.content p:first-child a').attr('href');
        const title = item.find('.content p:first-child a').text();

        const single = {
            title: title,
            description: title,
            link: `https://bihu.com${url}`,
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
            
            let content = itemElement('#__NEXT_DATA__').html()
            content = JSON.parse(content)
            item.description = content.props.pageProps.html

            ctx.cache.set(link, JSON.stringify(item));
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: `币乎首页`,
        link: host,
        description: `币乎首页`,
        item: result,
    };
};
