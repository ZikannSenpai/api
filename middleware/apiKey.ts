import { Request, Response, NextFunction } from "express";

interface RateLimitRecord {
    count: number;
    lastReset: number;
}

const validApiKeys = ["zikaneko"]; // bisa dari config.json juga
const limits: Record<string, RateLimitRecord> = {};
const MAX_PER_MINUTE = 50;

export const apiKeyMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const apiKey = req.query.apikey as string;
    if (!apiKey || !validApiKeys.includes(apiKey)) {
        return res
            .status(401)
            .json({ status: false, message: "API key invalid" });
    }

    const now = Date.now();
    if (!limits[apiKey]) {
        limits[apiKey] = { count: 1, lastReset: now };
        return next();
    }

    const record = limits[apiKey];

    if (now - record.lastReset > 60_000) {
        // reset tiap 1 menit
        record.count = 1;
        record.lastReset = now;
        return next();
    }

    if (record.count >= MAX_PER_MINUTE) {
        return res
            .status(429)
            .json({ status: false, message: "Rate limit exceeded" });
    }

    record.count++;
    next();
};
