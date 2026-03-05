import { Request, Response } from "express";
import axios from "axios";

export default async function randomNeko(req: Request, res: Response) {
    try {
        const api = "https://api.danzy.web.id/api/random/neko";

        const response = await axios.get(api, {
            responseType: "arraybuffer",
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
                Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
                Referer: "https://api.danzy.web.id/"
            },
            timeout: 30000
        });

        res.set(
            "Content-Type",
            response.headers["content-type"] || "image/jpeg"
        );
        res.send(response.data);
    } catch (err: any) {
        res.status(500).json({
            status: false,
            message: err.message
        });
    }
}
