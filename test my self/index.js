const got = require('got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const { exitOnError } = require('winston');

(async () => {
    const host = 'http://www.a9vg.com/list/news';
    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',
        url: host,
    });
    const data = response.body;
    // console.log(data);
    const $ = cheerio.load(data);
    const list = $('.a9-rich-card-list li').get();

    const items = list.map((i) => {
        const item = $(i);
        const url = `http://www.a9vg.com${item.find('a').attr('href')}`;
        const title = item.find('.a9-rich-card-list_label').text();
        // console.log(url);
        // console.log(title);

        const single = {
            title: title,
            description: title,
            link: url,
            pubDate: new Date(item.find('.a9-rich-card-list_infos').text()).toUTCString(),
        };
        return single;
    });
    // console.log(items);

    const result = await Promise.all(
        items.map(async (item) => {
            console.log(item.link);
            // const cache = await ctx.cache.get(link);
            // if (cache) {
            //     return Promise.resolve(JSON.parse(cache));
            // }

            const itemReponse = await got({
                method: 'get',
                url: item.link,
            });

            const data = itemReponse.body;
            const itemElement = cheerio.load(data);

            // const t = itemElement('.article-info > .date').text()
            // console.log(t)
            // t = Date.parse(t)
            // console.log(Date.parse(t))
            // console.log(new Date(t * 1000).toUTCString());

            var description = itemElement('.c-article-main_contentraw').html();
            // dd = JSON.parse(dd);
            console.log(description);

            item.description = description;
            // console.log(item.description);
            // console.log(item.description);
            // ctx.cache.set(link, JSON.stringify(item));
            // return Promise.resolve(item);
        })
    );

    console.log(result);

    // let list = $('div[class=art-list]').get()

    // const items = list.map((i) => {
    //     console.log($(i));
    // })
    // console.log();
})();
