import { Request, Response } from "express";
import axios from "axios";

export default async function detailAnime(req: Request, res: Response) {
    const { url } = req.url;

    if (!url) {
        return res.status(400).json({
            status: false,
            message: "Parameter 'slug' diperlukan."
        });
    }

    try {
        const url = `https://api.danzy.web.id/api/maker/removebg?url=${url}`;

        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                Referer: "https://sankavollerei.com/"
            }
        });
        res.json({
            ok: true,
            message: "Success",
            data: data
        });
    } catch (err: any) {
        res.status(500).json({
            status: false,
            message: err.message
        });
    }
}
