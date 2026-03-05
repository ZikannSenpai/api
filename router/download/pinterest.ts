import { Request, Response } from "express";
import axios from "axios";

export default async function pinterest(req: Request, res: Response) {
    const slug = (req.body.url || req.query.url) as string;

    if (!slug) {
        return res.status(400).json({
            status: false,
            message: "Parameter 'url' diperlukan."
        });
    }

    try {
        const url = `https://api.danzy.web.id/api/download/pinterest?url=${slug}`;

        const { data } = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
                Accept: "application/json, text/plain, */*",
                Referer: "https://api.danzy.web.id/",
                Connection: "keep-alive"
            }
        });
        res.json({
            apiType: "Downloader",
            ok: true,
            message: "Success",
            data: data.result
        });
    } catch (err: any) {
        res.status(500).json({
            status: false,
            message: err.message
        });
    }
}
