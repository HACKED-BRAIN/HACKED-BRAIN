const http = require("http");
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const PORT = 3000;
const ROOT = path.join(__dirname, "..");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

const server = http.createServer((req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS"
    );

    if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
    }

    // باز کردن سایت
    if (req.method === "GET" && req.url === "/") {

        const file = fs.readFileSync(
            path.join(ROOT, "Index.html")
        );

        res.writeHead(200, {
            "Content-Type": "text/html; charset=utf-8"
        });

        res.end(file);
        return;
    }

    // دریافت پیام و فرستادن به هوش مصنوعی
    if (req.method === "POST" && req.url === "/chat") {

        let body = "";

        req.on("data", chunk => {
            body += chunk;
        });

        req.on("end", async () => {

            try {

                const data = JSON.parse(body);

                const message = data.message;

                const response = await client.responses.create({
                    model: "gpt-5.6",
                    input: message
                });

                res.writeHead(200, {
                    "Content-Type":
                        "application/json; charset=utf-8"
                });

                res.end(JSON.stringify({
                    reply: response.output_text
                }));

            } catch (error) {

                console.error(error);

                res.writeHead(500, {
                    "Content-Type":
                        "application/json; charset=utf-8"
                });

                res.end(JSON.stringify({
                    reply:
                        "یه مشکلی پیش اومد. دوباره امتحان کن."
                }));
            }
        });

        return;
    }

    res.writeHead(404, {
        "Content-Type": "text/plain; charset=utf-8"
    });

    res.end("Not Found");
});

server.listen(PORT, "0.0.0.0", () => {

    console.log(
        "Hacked Brain server running on port " + PORT
    );

});