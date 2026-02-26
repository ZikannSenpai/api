export default function handler(req, res) {
    res.status(200).json({
        commit: process.env.VERCEL_GIT_COMMIT_SHA || "dev",
        message: process.env.VERCEL_GIT_COMMIT_MESSAGE || "local",
        date: new Date().toISOString()
    });
}
