import { Request, Response } from "express";
import axios from "axios";
import * as cheerio from "cheerio";

export default async function amShare(req: Request, res: Response) {
    const url = (req.query.url || req.body.url) as string;

    if (!url) {
        return res.status(400).json({
            status: false,
            message: "parameter url diperlukan"
        });
    }

    try {
        const data = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });

        const $ = cheerio.load(data);

        const title = $("meta[property='og:title']").attr("content");
        const desc = $("meta[property='og:description']").attr("content");
        const thumb = $("meta[property='og:image']").attr("content");

        res.json({
            status: true,
            result: {
                title,
                description: desc,
                thumbnail: thumb
            }
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: err.message
        });
    }
}
