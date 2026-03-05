import { Request, Response } from "express";
import axios from "axios";

export default async function quotesAnime(req: Request, res: Response) {
    try {
        const url = `https://api.danzy.web.id/api/random/quotesanime`;

        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                Referer: "https://api.danzy.web.id/"
            }
        });

        res.json({
            apiType: "Otakudesu",
            ok: true,
            data: data.data.result
        });
    } catch (err: any) {
        res.status(500).json({
            status: false,
            message: err.message
        });
    }
}
