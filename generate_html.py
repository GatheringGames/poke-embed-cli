import json
import requests
from pathlib import Path

# Load cards from local JSON file
with open("cards.json", "r", encoding="utf-8") as f:
    data = json.load(f)

cards = data["data"]

# Create a folder for assets
output_path = Path("journey_together_embed.html")

# Start HTML with just the grid
html = '<div class="pokemon-set-list-grid">'

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
    
    # Format the card number with leading zeros if it's numeric
    formatted_number = number
    if number and number.isdigit() and printed_total:
        # Convert printed_total to string if it's an integer
        printed_total_str = str(printed_total)
        # Determine the number of digits in the total
        total_digits = len(printed_total_str)
        # Pad the number with leading zeros to match
        formatted_number = number.zfill(total_digits)
    
    price = card.get("tcgplayer", {}).get("prices", {}).get("normal", {}).get("market")
    price_str = f"${price:.2f}" if price else "—"
    card_id = card.get("id", "")
    set_id = card.get("set", {}).get("id", "")
    image_url = card.get("images", {}).get("small", "")
    rarity = card.get("rarity", "")
    
    # Get card text (flavor text only, skip rules for Pokemon cards)
    flavor_text = " ".join(card.get("flavorText", []))
    rules_text = ""
    
    # Only include rules text for trainer cards and energy cards, not for Pokémon
    if card.get("supertype", "") != "Pokémon":
        rules_text = " ".join(card.get("rules", []))
    
    text = flavor_text or rules_text or ""
    
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
                data-number="{formatted_number}"
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
            <img src="{image_url}" alt="{name} ({formatted_number})" loading="lazy">
            <p>{name}<br>
                <small>{formatted_number}/{printed_total}</small><br>
                <small class="card-price">Loading...</small>
            </p>
        </div>
        '''

# Just add the modal container div, don't close HTML
html += '''
</div>
<div class="poke-embed-modal" id="pokeEmbedModal"></div>
'''

# Write to file
with open(output_path, "w", encoding="utf-8") as f:
    f.write(html)

output_path.name
