import { Request, Response } from "express";
import axios from "axios";
import * as cheerio from "cheerio";

class OtakudesuClient {
    private baseURL = "https://otakudesu.cloud";

    private async fetch(url: string) {
        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0"
            },
            timeout: 30000
        });
        return data;
    }

    public async getLatest(page: number = 1) {
        const html = await this.fetch(
            `${this.baseURL}/ongoing-anime/page/${page}/`
        );

        const $ = cheerio.load(html);
        const results: any[] = [];

        $(".venz > ul > li").each((_, el) => {
            const title = $(el).find(".thumbz h2").text().trim();
            const link = $(el).find("a").attr("href");
            const thumb = $(el).find("img").attr("src");
            const episode = $(el).find(".epz").text().trim();
            const date = $(el).find(".newnime").text().trim();

            results.push({
                title,
                episode,
                date,
                link,
                thumb
            });
        });

        return results;
    }
}

export default async function otakudesuHandler(req: Request, res: Response) {
    const page = parseInt((req.query.page as string) || "1");

    try {
        const client = new OtakudesuClient();
        const data = await client.getLatest(page);

        res.json({
            status: true,
            total: data.length,
            data
        });
    } catch (err: any) {
        res.status(500).json({
            status: false,
            message: err.message
        });
    }
}
