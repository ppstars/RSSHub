const got = require('got');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const { exitOnError } = require('winston');
const { JSDOM } = require('jsdom');

(async () => {
    const host = 'https://www.chainnews.com/';
    // 发起 HTTP GET 请求
    const response = await got({
        method: 'get',
        url: host,
    });
    const data = response.body;
    // const data2 = new JSDOM(response.body, {
    //     runScripts: 'dangerously',
    // });

    // const blogTitle = data2.window.__INITIAL_STATE__.pageData.data.baseInfo.blogModule.title;
    // console.log(blogTitle);

    // const list = data2.window.__NUXT__.data[0].articleList;
    // console.log(response.body);
    // console.log(list);
    const $ = cheerio.load(data);

    const list = $('h2.feed-post-title').get();
    // const boardTitle = $('title').html();
    // console.log(boardTitle);

    const items = list.map((i) => {
        const item = $(i);
        // console.log(i, new Date().toUTCString());
        const url = item.find('a').attr('href');
        const title = item.find('a').text();
        // console.log(url);
        // console.log(title);

        // if (i.flash === 1) {
        //     // 排除快讯
        //     return;
        // }

        const single = {
            title: url,
            description: title,
            link: `https://www.chainnews.com${url}`,
        };
        return single;
    });
    // 删除 undefined
    // while (items.indexOf(undefined) != -1) {
    //     items.splice(
    //         items.findIndex((item) => item === undefined),
    //         1
    //     );
    // }
    // items.splice(items.findIndex(i => i == undefined), 1)
    // console.log(items)
    // console.log(items.indexOf(undefined));
    // console.log(items);

    const result = await Promise.all(
        items.map(async (item) => {
            console.log(item.link);
            console.log(item.title);
            // const cache = await ctx.cache.get(link);
            // if (cache) {
            //     return Promise.resolve(JSON.parse(cache));
            // }

            // const response = await got({
            //     method: 'get',
            //     url: item.link,
            // });
            // const data = response.body;
            // const data = new JSDOM(response.body, {
            //     runScripts: 'dangerously',
            // });

            // const c = data.window.__NUXT__.data[0].infoList.content;
            // console.log(c);

            // console.log(c.richText);

            const itemReponse = await got.get(item.link);

            const data = itemReponse.body;

            const itemElement = cheerio.load(data);

            let t = itemElement('h2.post-content.markdown').html();
            if (t === null) {
                t = itemElement('div.post-content.markdown').html();
            }
            // console.log(t);
            // console.log(t)
            // t = Date.parse(t)
            // console.log(Date.parse(t))
            // console.log(new Date(t * 1000).toUTCString());

            // var description = itemElement('.c-post__body .c-article__content').html();
            // item.description = c;
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
