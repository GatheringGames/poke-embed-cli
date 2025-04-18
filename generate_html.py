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
</head>
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
    
    # Get the supertype (Pokémon, Trainer, Energy)
    supertype = card.get("supertype", "")
    
    # Get the subtype for trainer cards (Item, Supporter, Stadium, Tool)
    subtypes = card.get("subtypes", [])
    subtype = subtypes[0] if subtypes else ""
    
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
                data-attacks="{attacks_json}"
                data-supertype="{supertype}"
                data-subtype="{subtype}">
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
</html>
'''

# Write to file
with open(output_path, "w", encoding="utf-8") as f:
    f.write(html)

output_path.name
