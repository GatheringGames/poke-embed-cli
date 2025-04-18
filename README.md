# poke-embed-cli

A tool for generating and displaying Pokémon TCG card embeds with filtering and sorting capabilities.

## Project Structure

This repository is organized as follows:

- **src/** - Core source files 
  - JavaScript files for card rendering, filtering, and sorting
  - HTML templates and test pages
  
- **tests/** - Testing and browser automation scripts
  - Playwright browser automation tests
  
- **scripts/** - Utility scripts
  - Python scripts for generating HTML embeddings
  
- **assets/** - Static assets
  - Card data files (JSON)
  - SVG symbols for card types and rarities
  
- **screenshots/** - Test output screenshots for debugging

## Getting Started

1. Clone this repository
2. Install dependencies: `npm install`
3. Run tests: `node tests/browser-control.js`

## Features

- Render Pokémon card embeds with detailed information
- Filter cards by type and rarity
- Sort cards by various criteria
- View card pricing information
