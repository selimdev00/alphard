const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

const PLANETS = require("./data/planets-list.json").planets;
const BY_SLUG = new Map(PLANETS.map((p) => [p.slug, p]));

// Static assets (app images, css, js, fonts)
app.use(express.static(path.join(__dirname, "assets")));

// Only the vendor package we actually need, scoped (never the whole node_modules tree)
app.use(
  "/vendor/model-viewer",
  express.static(path.join(__dirname, "node_modules/@google/model-viewer/dist"))
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", (req, res) => {
  res.render("index", {
    planets: PLANETS,
    pageTitle: "Astronomia - путеводитель по Солнечной системе",
  });
});

app.get("/planets/:name", (req, res) => {
  const slug = String(req.params.name).toLowerCase();
  const planet = BY_SLUG.get(slug);
  if (!planet) return res.status(404).render("404", { pageTitle: "Планета не найдена - Astronomia" });

  const file = path.join(__dirname, "data", "contents", `${slug}.json`);
  fs.readFile(file, "utf8", (err, raw) => {
    if (err) return res.status(404).render("404", { pageTitle: "Планета не найдена - Astronomia" });

    let body;
    try {
      body = JSON.parse(raw);
    } catch (e) {
      return res.status(500).render("404", { pageTitle: "Ошибка загрузки - Astronomia" });
    }

    const i = PLANETS.indexOf(planet);
    const prev = PLANETS[(i - 1 + PLANETS.length) % PLANETS.length];
    const next = PLANETS[(i + 1) % PLANETS.length];

    res.render("planet", {
      planet,
      content: body,
      planets: PLANETS,
      prev,
      next,
      pageTitle: `${planet.name} - Astronomia`,
    });
  });
});

app.use((req, res) => {
  res.status(404).render("404", { pageTitle: "Страница не найдена - Astronomia" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Astronomia listening on port ${PORT}`));
