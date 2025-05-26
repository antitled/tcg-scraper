
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/scrape', async (req, res) => {
  const { url } = req.query;
  if (!url || !url.includes("tcgplayer.com")) {
    return res.status(400).json({ error: "Invalid TCGplayer URL" });
  }

  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const name = $("h1").first().text().trim();
    const marketPrice = $('[data-testid="product-details__price"] span').first().text().replace('$', '').trim();
    const imageUrl = $("img[alt*='Product Image']").first().attr("src") || "";
    const setName = $('[data-testid="product-details__set-name"]').first().text().trim();
    const rarity = $('[data-testid="product-details__rarity"]').first().text().trim();

    res.json({
      name,
      marketPrice,
      imageUrl,
      set: setName,
      rarity,
      psaPrice: null,
      cgcPrice: null
    });
  } catch (error) {
    console.error("Scraping error:", error);
    res.status(500).json({ error: "Scraping failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
