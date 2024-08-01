const fs = require('fs-extra');
const path = require('path');
const http = require('http');
const https = require('https');
const { XMLParser } = require('fast-xml-parser');
const ejs = require('ejs');

// Function to decode HTML entities
function decodeHtml(html) {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
}

// Read and parse the XML file
const xmlFilePath = path.join(__dirname, 'laurenswersky.wordpress.2024-07-28.000.xml');
const xmlData = fs.readFileSync(xmlFilePath, 'utf-8');
const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
const jsonObj = parser.parse(xmlData);

// Extract posts and attachments
const posts = jsonObj.rss.channel.item;

// Define paths
const outputDir = path.join(__dirname, 'static-site');
const templateDir = path.join(__dirname, 'templates');
fs.ensureDirSync(outputDir);

// Process each post and attachment
(async function() {
    let pinned_posts = [];
    let post_list = [];

    for (const post of posts) {
        // Download attachments
        if (post['wp:post_type'] === 'attachment') {
            const url = post['wp:attachment_url'];
            const protocol = url.startsWith('https') ? https : http;
            if (Array.isArray(post['wp:postmeta'])) {
                for (const post_meta of post['wp:postmeta']) {
                    if (post_meta['wp:meta_key'] === '_wp_attached_file') {
                        const file_path = post_meta['wp:meta_value'];
                        const full_path = path.join(outputDir, 'wp-content/uploads', file_path);
                        fs.ensureDirSync(path.dirname(full_path));
                        const file = fs.createWriteStream(full_path);
                        protocol.get(url, (resp) => {
                            resp.pipe(file);
                            file.on("finish", () => {
                                file.close();
                            });
                        });
                    }
                }
            }
        }

        // Generate post page if it's published
        if (post['wp:post_type'] === 'post' && post['pubDate']) {
            // Decode HTML entities
            post['content:encoded'] = decodeHtml(post['content:encoded']);

            post['content:encoded'] = post['content:encoded']
                .split(/\r?\n|\r|\n/g)
                .reduce((accumulator, currentValue) => accumulator + `${currentValue}`, '');

            const content = await ejs.renderFile(path.join(templateDir, 'post.ejs'), { post: post });
            const postDir = path.join(outputDir, 'archives', post['wp:post_id'].toString());
            fs.ensureDirSync(postDir);
            fs.writeFileSync(path.join(postDir, 'index.html'), content);

            const element = {
                id: post['wp:post_id'].toString(),
                title: post.title,
                summary: post['content:encoded'].replace(/<[^>]*>?/gm, '').slice(0, 300)
            };

            // Assuming 'pinned_post_ids' is an array of strings or numbers
            if (['pinned_post_ids'].includes(post['wp:post_id'])) {
                pinned_posts.push(element);
            } else {
                post_list.push(element);
            }
        }
    }

    // Generate table of contents (toc)
    pinned_posts.sort((a, b) => b.id - a.id);
    let merged_posts = pinned_posts.concat(post_list.sort((a, b) => b.id - a.id));

    // Generate README.md
    let readme = `# My WordPress Blog\nThis is a backup of my WordPress blog.\n\n`;
    merged_posts.forEach(post => {
        readme += `[${post.title}](archives/${post.id})\n\n`;
    });
    fs.writeFileSync(path.join(outputDir, 'README.md'), readme);

    // Generate index.html (table of contents)
    const tocContent = await ejs.renderFile(path.join(templateDir, 'toc.ejs'), { posts: merged_posts });
    fs.writeFileSync(path.join(outputDir, 'index.html'), tocContent);

    console.log('Static site generated successfully.');
})();
