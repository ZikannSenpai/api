import { Request, Response } from "express";
import axios from "axios";
import * as cheerio from "cheerio";

export default async function mlPatch(req: Request, res: Response) {
    try {
        const { data } = await axios.get("https://www.mobilelegends.com/news", {
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });

        const $ = cheerio.load(data);

        const result: any[] = [];

        $(".news-item").each((i, el) => {
            const title = $(el).find("h3").text().trim();
            const link =
                "https://www.mobilelegends.com" + $(el).find("a").attr("href");
            const thumbnail = $(el).find("img").attr("src");

            result.push({
                title,
                link,
                thumbnail
            });
        });

        res.json({
            status: true,
            category: "patch",
            total: result.length,
            result
        });
    } catch (err: any) {
        res.status(500).json({
            status: false,
            message: err.message
        });
    }
}
