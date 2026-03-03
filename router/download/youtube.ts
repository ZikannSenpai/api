import { Request, Response } from "express";
import axios from "axios";

export default async function detailAnime(req: Request, res: Response) {
    const { slug } = req.query;

    if (!slug) {
        return res.status(400).json({
            status: false,
            message: "Parameter 'url' diperlukan."
        });
    }

    try {
        const url = `https://api.danzy.web.id/api/download/ytmp4?url=${slug}`;

        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                Referer: "https://sankavollerei.com/"
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
