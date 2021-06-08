const got = require('got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const { exitOnError } = require('winston');

(async () => {
    const host = 'https://post.smzdm.com/hot_1/';
    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',
        url: host,
    });
    const data = response.body;
    // console.log(data);
    const $ = cheerio.load(data);

    // console.log($('.content p:first-child a').text());

    let list = $('.z-feed-title').get();

    const items = list.map((i) => {
        const item = $(i);
        const url = item.find('a').attr('href');
        const title = item.find('a').text();
        // console.log(url);
        // console.log(title);

        const single = {
            title: title,
            description: title,
            link: url,
            pubDate: new Date(item.ctime * 1000).toUTCString(),
        };

        return single;
    });

    const result = await Promise.all(
        items.map(async (item) => {
            const link = item.link;
            console.log(link);
            // const cache = await ctx.cache.get(link);
            // if (cache) {
            //     return Promise.resolve(JSON.parse(cache));
            // }

            const itemReponse = await got({
                method: 'get',
                url: link,
            });

            const data = itemReponse.body;
            // console.log(data);
            // console.log(data);
            const itemElement = cheerio.load(data);

            // const t = itemElement('.article-info > .date').text()
            // console.log(t)
            // t = Date.parse(t)
            // console.log(Date.parse(t))
            // console.log(new Date(t * 1000).toUTCString());

            // var dd = itemElement('#__NEXT_DATA__').html()
            // dd = JSON.parse(dd)
            // console.log(dd.props.pageProps.html);

            item.description = itemElement('#articleId').html();
            console.log(item.description);
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
