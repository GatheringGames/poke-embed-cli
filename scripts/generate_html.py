import json
import requests
from pathlib import Path
import os

# Get the script directory and project root directory
script_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(script_dir)

# Load cards from local JSON file in the assets directory
cards_path = os.path.join(project_root, "assets", "cards.json")
try:
    with open(cards_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    cards = data["data"]
except FileNotFoundError:
    print(f"Error: Could not find cards.json at {cards_path}")
    # Check if the assets directory exists
    assets_dir = os.path.join(project_root, "assets")
    if os.path.exists(assets_dir):
        print(f"The assets directory exists at {assets_dir}")
        print("Files in assets directory:")
        for file in os.listdir(assets_dir):
            print(f"  - {file}")
    else:
        print(f"The assets directory does not exist at {assets_dir}")
    
    # Create empty cards list as fallback
    cards = []

# Create output file in src directory
output_path = Path(os.path.join(project_root, "src", "journey_together_embed.html"))

# Start HTML with a container for the whole experience
html = '<div class="pokemon-set-container">'

# This div is where filter controls will be inserted by JavaScript
html += '<div class="pokemon-set-filter-placeholder"></div>'

# Add the grid for cards
html += '<div class="pokemon-set-list-grid">'

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

# Close the grid div
html += '</div>'

# Add the modal container
html += '<div class="poke-embed-modal" id="pokeEmbedModal"></div>'

# Close the main container
html += '</div>'

# Add the Smart Snippet container
html += '''
<div class="dib-ss fr-deletable fr-draggable dib-custom-block" contenteditable="false" draggable="true" data-replace-ss-id="212">
	<h2 class="toc-skip">Smart Snippet&trade; | Pokemon TCG Card List</h2>
</div>
'''

# Add the script tag to load the card-list.js file from src directory
html += '<script src="card-list.js"></script>'

# Create the src directory if it doesn't exist
os.makedirs(os.path.dirname(output_path), exist_ok=True)

# Write to file
with open(output_path, "w", encoding="utf-8") as f:
    f.write(html)

print(f"Generated HTML file at: {output_path}")
