import { Request, Response } from "express";
import axios from "axios";
import * as cheerio from "cheerio";

class AnimeScraper {
  private baseURL = "https://otakudesu.best";

  private async fetchPage(path: string) {
    const { data } = await axios.get(this.baseURL + path, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Mobile Safari/537.36",
      },
      timeout: 30000,
    });

    return cheerio.load(data);
  }

  public async getLatest() {
    const $ = await this.fetchPage("/anime");

    const results = $(".anime-item")
      .map((_, el) => {
        const title = $(el).find(".title").text().trim();
        const link = $(el).find("a").attr("href");
        const thumbnail = $(el).find("img").attr("src");

        return {
          title,
          link,
          thumbnail,
        };
      })
      .get();

    return results;
  }

  public async getDetail(slug: string) {
    const $ = await this.fetchPage(`/anime/${slug}`);

    const title = $(".anime-title").text().trim();
    const synopsis = $(".synopsis").text().trim();
    const episodes = $(".episode-list a")
      .map((_, el) => ({
        title: $(el).text().trim(),
        link: $(el).attr("href"),
      }))
      .get();

    return { title, synopsis, episodes };
  }
}

export default async function animeHandler(req: Request, res: Response) {
  const { type, slug } = req.query;

  const scraper = new AnimeScraper();

  try {
    if (type === "latest") {
      const data = await scraper.getLatest();
      return res.json({ status: true, data });
    }

    if (type === "detail" && slug) {
      const data = await scraper.getDetail(slug as string);
      return res.json({ status: true, data });
    }

    res.status(400).json({ status: false, message: "Invalid params" });
  } catch (err: any) {
    res.status(500).json({ status: false, message: err.message });
  }
}
