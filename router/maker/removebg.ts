import { Request, Response } from "express";
import axios from "axios";

export default async function removeBG(req: Request, res: Response) {
    const url = (req.query.url || req.body.url) as string;

    if (!url) {
        return res.status(400).json({
            status: false,
            message: "Parameter 'url' diperlukan."
        });
    }

    try {
        const link = `https://api.danzy.web.id/api/maker/removebg?url=${encodeURIComponent(url)}`;

        const data = await axios.get(link, {
            responseType: "arraybuffer",
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
                Referer: "https://api.danzy.web.id/",
                Connection: "keep-alive"
            }
        });
        res.set("Content-Type", "image/png");
        res.send(data.data);
    } catch (err: any) {
        res.status(500).json({
            status: false,
            message: err.message
        });
    }
}
