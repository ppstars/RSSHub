const got = require('@/utils/got');
// const got = require('got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const boardId = ctx.params.boardid;
    const host = `https://forum.gamer.com.tw/B.php?bsn=${boardId}`;

    const response = await got({
        method: 'get',
        url: host,
    });

    const data = response.body;

    const $ = cheerio.load(data);

    const list = $('.b-list__row.b-list-item.b-imglist-item .b-list__main .b-list__tile p.b-list__main__title').get();
    const boardTitle = $('title').html();

    const items = list.map((i) => {
        const item = $(i);
        const url = item.attr('href');
        const title = item.text();

        const single = {
            title: title,
            description: title,
            link: 'https://forum.gamer.com.tw/' + url,
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

            const data = itemReponse.body;
            const itemElement = cheerio.load(data);

            var description = itemElement('.c-post__body .c-article__content').html();
            item.description = description;

            ctx.cache.set(item.link, JSON.stringify(item));
            return Promise.resolve(item);
        })
    );

    ctx.state.data = {
        title: '巴哈姆特 ' + boardTitle,
        link: 'http://www.a9vg.com/list/news/',
        description: boardTitle,
        item: result,
    };
};
