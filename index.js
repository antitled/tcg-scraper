
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
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    const name = $("h1[data-testid='product-details__product-name']").text().trim()
      || $("h1").first().text().trim();

    const marketPrice = $('[data-testid="product-details__price"]').text().replace('$', '').trim();

    const imageUrl = $("img[alt*='Product Image']").attr("src") 
      || $("img[src*='product-images']").attr("src") 
      || "";

    const setName = $('[data-testid="product-details__set-name"]').text().trim()
      || $("div:contains('Set Name')").next().text().trim();

    const rarity = $('[data-testid="product-details__rarity"]').text().trim()
      || $("div:contains('Rarity')").next().text().trim();

    res.json({
      name,
      marketPrice,
      imageUrl: imageUrl.startsWith('http') ? imageUrl : 'https://www.tcgplayer.com' + imageUrl,
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
