import { Request, Response } from "express";
import axios from "axios";

export default async function listAnime(req: Request, res: Response) {
    try {
        const url = "https://www.sankavollerei.com/anime/home";

        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0",
                Accept: "application/json, text/plain, */*",
                Referer: "https://sankavollerei.com/",
                Origin: "https://sankavollerei.com"
            }
        });
        res.json({
            status: true,
            result: data
        });
    } catch (err: any) {
        res.status(500).json({
            status: false,
            message: err.message
        });
    }
}
