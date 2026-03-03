import { Request, Response } from "express";
import axios from "axios";

export default async function detailAnime(req: Request, res: Response) {
    try {
        const url = `https://www.sankavollerei.com/anime/schedule`;

        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                Referer: "https://sankavollerei.com/"
            }
        });

        res.json({
            apiType: "Otakudesu",
            ok: true,
            message: "Success",
            data: data.data
        });
    } catch (err: any) {
        res.status(500).json({
            status: false,
            message: err.message
        });
    }
}
