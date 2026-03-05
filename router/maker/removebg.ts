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
        const api = `https://api.danzy.web.id/api/maker/removebg?url=${encodeURIComponent(url)}`;

        const response = await axios.get(api, {
            responseType: "arraybuffer",
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });

        res.set(
            "Content-Type",
            response.headers["content-type"] || "image/png"
        );
        res.send(response.data);
    } catch (err: any) {
        res.status(500).json({
            status: false,
            message: err.message
        });
    }
}
