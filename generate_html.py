import json
import requests
from pathlib import Path

# Load cards from local JSON file
with open("cards.json", "r", encoding="utf-8") as f:
    data = json.load(f)

cards = data["data"]

# Create a folder for assets
output_path = Path("journey_together_embed.html")

# HTML header
html = '''
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Journey Together Set List</title>
  <style>
    body {
      font-family: sans-serif;
      padding: 20px;
      background: #f5f5f5;
    }
    h1 {
      text-align: center;
    }
    .pokemon-set-list-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 24px;
      width: 90vw;
      margin-left: calc(-45vw + 50%);
      margin-right: calc(-45vw + 50%);
    }
    .pokemon-set-list-card {
      text-align: center;
      background: white;
      padding: 10px;
      border-radius: 12px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      transition: transform 0.2s ease;
      cursor: pointer;
    }
    .pokemon-set-list-card:hover {
      transform: scale(1.05);
    }
    .pokemon-set-list-card img {
      width: 100%;
      height: auto;
    }
    .pokemon-set-list-card p {
      margin: 8px 0 0;
      font-size: 14px;
    }

    @media (max-width: 600px) {
      .pokemon-set-list-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .poke-embed-modal {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.75);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1em;
    }

    .poke-embed {
      background: #394042;
      color: white;
      border-radius: 8px;
      padding: 1em;
      display: flex;
      gap: 1em;
      border: 2px solid #5c696d;
      align-items: center;
      max-width: 1000px;
      width: 100%;
    }

    .poke-card-image img {
      width: 250px;
      border-radius: 4px;
      cursor: zoom-in;
      display: block;
      margin: 0 auto;
    }

    .poke-info {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .poke-info h3 {
      margin-top: 0;
      color: white;
    }

    .poke-rarity {
      margin-bottom: 0.5em;
      color: #ccc;
    }

    .poke-text {
      font-size: 14px;
      line-height: 1.4;
      margin-bottom: 0.5em;
    }

    .poke-price-label {
      font-weight: bold;
      margin-top: 0.5em;
    }

    .poke-currency-buttons, .poke-range-buttons {
      display: flex;
      justify-content: center;
      gap: 0.5em;
      margin-top: 0.5em;
    }

    .poke-currency-buttons button, .poke-range-buttons button {
      padding: 4px 8px;
      cursor: pointer;
      border: none;
      background: #ccc;
      border-radius: 4px;
    }

    .poke-currency-buttons button.active, .poke-range-buttons button.active {
      background-color: #d8232f;
      color: white;
    }

    canvas.poke-price-chart {
      max-width: 100%;
      margin: 1em auto 0 auto;
      background: white;
      border-radius: 4px;
      display: block;
    }

    .poke-price-note {
      font-size: 0.8em;
      margin-top: 4px;
      color: #ccc;
      text-align: center;
    }

    @media (max-width: 768px) {
      .poke-embed {
        flex-direction: column;
        align-items: center;
      }
    }
  </style>
</head>
<body>
  <h1>Journey Together - Complete Set List</h1>
  <div class="pokemon-set-list-grid">
'''
ENERGY_SYMBOLS = {
    "Grass": "G",
    "Fire": "R",
    "Water": "W",
    "Lightning": "L",
    "Psychic": "P",
    "Fighting": "F",
    "Darkness": "D",
    "Metal": "M",
    "Fairy": "Y",
    "Dragon": "N",
    "Colorless": "C"
}

# Generate each card's HTML
for card in cards:
    name = card.get("name")
    number = card.get("number")
    printed_total = card.get("set", {}).get("printedTotal", "")
    price = card.get("tcgplayer", {}).get("prices", {}).get("normal", {}).get("market")
    price_str = f"${price:.2f}" if price else "—"
    card_id = card.get("id", "")
    set_id = card.get("set", {}).get("id", "")
    image_url = card.get("images", {}).get("small", "")
    rarity = card.get("rarity", "")
    text = " ".join(card.get("flavorText", []) or card.get("rules", []) or card.get("attacks", [{}])[0].get("text", "").splitlines())
    hp = card.get("hp", "")
    types = ", ".join(card.get("types", []))
    ability = card.get("abilities", [{}])[0]
    ability_name = ability.get("name", "")
    ability_text = ability.get("text", "")
    attack_list = []
    for atk in card.get("attacks", []):
        attack_list.append({
            "name": atk.get("name", ""),
            "cost": [f"{{{ENERGY_SYMBOLS.get(c, c)}}}" for c in atk.get("cost", [])],
            "damage": atk.get("damage", ""),
            "text": atk.get("text", "")
         })


    attacks_json = json.dumps(attack_list).replace('"', '&quot;')

    

    if name and card_id and set_id:
        html += f'''
        <div class="pokemon-set-list-card"
                data-id="{card_id}"
                data-name="{name}"
                data-number="{number}"
                data-set="{set_id}"
                data-image="{image_url}"
                data-rarity="{rarity}"
                data-text="{text.replace('"', '&quot;')}"
                data-hp="{hp}"
                data-types="{types}"
                data-ability-name="{ability_name.replace('"', '&quot;')}"
                data-ability-text="{ability_text.replace('"', '&quot;')}"
                data-attacks="{attacks_json}">
            <img src="{image_url}" alt="{name} ({number})" loading="lazy">
            <p>{name}<br>
                <small>{number}/{printed_total}</small><br>
                <small class="card-price">Loading...</small>
            </p>
        </div>
        '''

# Modal container
html += '''
  </div>

  <div class="poke-embed-modal" id="pokeEmbedModal"></div>

  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://js.gatheringgames.co.uk/pokemon-embed.js"></script>
</body>
</html>
'''

# Write to file
with open(output_path, "w", encoding="utf-8") as f:
    f.write(html)

output_path.name
