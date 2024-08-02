const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const ejs = require('ejs');

const parser = new xml2js.Parser();

const xmlFile = fs.readFileSync(path.join(__dirname, 'laurenswersky.wordpress.2024-07-28.000.xml'), 'utf8');

parser.parseString(xmlFile, (err, result) => {
    if (err) {
        throw err;
    }

    const posts = result.rss.channel[0].item.map(post => {
        return {
            id: post['wp:post_id'][0],
            title: post.title[0],
            link: post.link[0],
            content: post['content:encoded'][0],
            postName: post['wp:post_name'][0],
        };
    });

    // Call the function to generate the static site
    generateStaticSite(posts);
});

function generateStaticSite(posts) {
    posts.forEach(post => {
        const html = ejs.renderFile(
            path.join(__dirname, 'templates', 'post.ejs'), 
            { post },
            (err, str) => {
                if (err) {
                    console.error(err);
                    return;
                }

                const outputPath = path.join(__dirname, 'static-site', 'archives', post.postName, 'index.html');
                fs.mkdirSync(path.dirname(outputPath), { recursive: true });
                fs.writeFileSync(outputPath, str, 'utf8');
            }
        );
    });
}
