const got = require('@/utils/got');
const cheerio = require('cheerio');
const { JSDOM } = require('jsdom');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const host = `https://blog.csdn.net/${id}`;

    const response = await got({
        method: 'get',
        url: host,
    });

    const data = response.body;
    var data2 = data.replace('window.csdn.sideToolbar = ', '')
    data2 =  new JSDOM(data2, {
        runScripts: 'dangerously',
    });

    const blogTitle = data2.window.__INITIAL_STATE__.pageData.data.baseInfo.blogModule.title;

    const list = data2.window.__INITIAL_STATE__.pageData.data.baseInfo.latelyList;

    const items = list.map((i) => {
        const single = {
            title: i.title,
            description: i.description,
            link: i.url,
        };
        return single;
    });

    ctx.state.data = {
        title: `CSDN BLOG - ${blogTitle}`,
        link: host,
        description: `CSDN BLOG - ${blogTitle}`,
        item: items,
    };
};
