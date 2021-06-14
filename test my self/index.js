const got = require('got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const { exitOnError } = require('winston');
const { JSDOM } = require('jsdom');

(async () => {
    const host = 'https://gouhuo.qq.com/content/tablist/1_110';
    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',
        url: host,
    });
    // const data = response.body;
    const data =  new JSDOM(response.body, {
        runScripts: 'dangerously',
    });

    const list = data.window.__NUXT__.data[0].list;
    // console.log(data2);
    // console.log(data2.length);
    // const $ = cheerio.load(data);

    // const list = $('.b-list__row.b-list-item.b-imglist-item .b-list__main .b-list__tile p.b-list__main__title').get();
    // const boardTitle = $('title').html();
    // console.log(boardTitle);

    const items = list.map((i) => {
        // const item = $(i);
        // console.log(i, new Date().toUTCString());
        const url = i.link;
        // console.log(url);
        const title = i.title;
        // console.log(url);
        // console.log(title);

        const single = {
            title: title,
            description: title,
            link: url,
            pubDate: new Date().toUTCString(),
        };
        return single;
    });
    // console.log(items);

    const result = await Promise.all(
        items.map(async (item) => {
            // console.log(item.link);
            // const cache = await ctx.cache.get(link);
            // if (cache) {
            //     return Promise.resolve(JSON.parse(cache));
            // }

            const response = await got({
                method: 'get',
                url: item.link,
            });
            // const data = response.body;
            const data =  new JSDOM(response.body, {
                runScripts: 'dangerously',
            });

            const c = data.window.__NUXT__.data[0];

            // console.log(c.richText);

            // const itemReponse = await got.get(item.link);

            // const data = itemReponse.body;

            // const itemElement = cheerio.load(data);

            // const t = itemElement('.article-info > .date').text()
            // console.log(t)
            // t = Date.parse(t)
            // console.log(Date.parse(t))
            // console.log(new Date(t * 1000).toUTCString());

            // var description = itemElement('.c-post__body .c-article__content').html();
            item.description = c.richText;
            // return item;
            // dd = JSON.parse(dd);
            // console.log(description);

            // console.log(item.description);
            // ctx.cache.set(link, JSON.stringify(item));
            return Promise.resolve(item);
        })
    );

    // console.log(result[0]);

    // let list = $('div[class=art-list]').get()

    // const items = list.map((i) => {
    //     console.log($(i));
    // })
    // console.log();
})();
