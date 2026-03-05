import { Request, Response } from "express";
import axios from "axios";

export default async function removeBG(req: Request, res: Response) {
    try {
        const api = `https://api.danzy.web.id/api/random/blue-archive`;

        const response = await axios.get(api, {
            headers: {
                "User-Agent": "Mozilla/5.0"
            }
        });
        res.send(response);
    } catch (err: any) {
        res.status(500).json({
            status: false,
            message: err.message
        });
    }
}
