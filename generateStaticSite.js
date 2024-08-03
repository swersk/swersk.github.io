const fs = require('fs');
const path = require('path');

const posts = [
    {
        id: 'compostnyc',
        title: "CompostNYC",
        content: `
        A Proximity-Based 3D Visualization to Help New Yorkers Find Compost Bins 🗽🌱
        <h2>Introduction</h2>
        <p>Welcome to an exciting new way to explore composting in New York City! CompostNYC helps NYers visualizare far their location is from the nearest composting location.</p>
        <h2>Method</h2>
        <h3>Step 1: Source Data</h3>
        <p>Composite site location data and NYC building data from:</p>
        <ul>
            <li>NYC OpenData</li>
            <li>BigQuery</li>
            <li>PLUTO from CARTO data warehouse</li>
        </ul>
        <h3>Step 2: Spatial Analyses</h3>
        <p>SQL to measure the nearest compost bin from a given location.</p>
        <pre><code>
        SELECT
            b.* -- Select all columns from building_locations
        FROM
            carto-demo-data.demo_tables.manhattan_pluto_data b,
            carto-dw-ac-zp3r15zi.shared.CompostNYC c
        WHERE
            ST_DWithin(b.geom, c.geom, 400);
        </code></pre>
        <h3>Step 3: Add a CARTO Layer and 3D Map</h3>
        <p>Use CARTO API and Google Tiles API to render photorealistic tiles on deck.gl for a 3D map visualization.</p>
        <h3>Step 4: Style</h3>
        <p>Color-coded the buildings according to their proximity to compost bins.</p>
        <p>👉 <a href="#">Check it out: Live link here</a></p>
        `
    },
    {
        id: 'george-carlin',
        title: "Ask George Carlin: A 21st Century Bot",
        content: ` 
        <h2>Ask George Carlin: A 21st Century Bot</h2>
        <p>Welcome! This project leverages the power of OpenAI API to bring to life a conversational AI bot modeled after the iconic stand-up comedian, George Carlin.
I created an asynchronous server-side function using Node.js to interact with OpenAI’s GPT-3 API. The function takes user input and crafts a custom prompt to instruct the GPT-3 model to emulate comedian George Carlin’s unique style and humor. Error handling and input validation ensure the final generated text is sent back as a JSON response.
Ask George a question at the live link 👉</p><a href="https://george-carlin-bot.vercel.app/">here</a>
        `
    }
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