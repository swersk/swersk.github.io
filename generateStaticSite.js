const fs = require('fs');
const path = require('path');

const posts = [
    {
        id: 'compostnyc',
        title: "CompostNYC",
        content: `hi!`
    },
];

const generatePostHtml = (post) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${post.title}</title>
        <link rel="stylesheet" href="/styles.css">
    </head>
    <body>
        <h1>${post.title}</h1>
        <div>${post.content}</div>
    </body>
    </html>`;
};

posts.forEach(post => {
    const html = generatePostHtml(post);
    const postDir = path.join(__dirname, post.id);
    if (!fs.existsSync(postDir)) {
        fs.mkdirSync(postDir, { recursive: true });
    }
    fs.writeFileSync(path.join(postDir, 'index.html'), html, 'utf8');
});

// Generate the main index.html
const mainIndexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Archive</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <h1>Lauren Swersky</h1>
    <h6>Software / Product / Design</h6>
    <div class="container">
        ${posts.map(post => `
        <a href="./${post.id}/index.html" style="color:inherit; text-decoration:none;">
            <div class="image-container" style="background-image:url('images/${post.id}.png');">
                <div class="overlay">
                    ${post.title}
                </div>
            </div>
        </a>
        `).join('')}
    </div>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'index.html'), mainIndexHtml, 'utf8');