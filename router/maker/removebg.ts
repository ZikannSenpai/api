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
        const url = `https://api.danzy.web.id/api/maker/removebg?url=${url}`;

        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0"
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
