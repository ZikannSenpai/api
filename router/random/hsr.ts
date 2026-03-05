import { Request, Response } from "express";
import axios from "axios";

export default async function randomHsr(req: Request, res: Response) {
    try {
        const url = `https://api.danzy.web.id/api/random/hsr`;

        const data = await axios.get(url);

        res.json({
            apiType: "Otakudesu",
            ok: true,
            data: data.data
        });
    } catch (err: any) {
        res.status(500).json({
            status: false,
            message: err.message
        });
    }
}
