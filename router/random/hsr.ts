import { Request, Response } from "express";
import axios from "axios";

export default async function randomHsr(req: Request, res: Response) {
    try {
        const url = "https://api.danzy.web.id/api/random/hsr";

        const { data } = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
                Accept: "application/json, text/plain, */*",
                Referer: "https://api.danzy.web.id/",
                Connection: "keep-alive"
            },
            timeout: 30000
        });

        res.json({
            ok: true,
            data: data
        });
    } catch (err: any) {
        res.status(500).json({
            status: false,
            message: err.message
        });
    }
}
