# mcp-tcgdex

TCGdex MCP — multi-language open trading card game database (Pokémon TCG and more).

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `search_cards` | Search Pokémon TCG (and other trading card games) cards by name in the TCGdex card database. Returns brief matches (id, localId, name, image thumbnail). Use get_card with an id for full card details. |
| `get_card` | Look up a single Pokémon TCG (or other trading card game) card by its TCGdex id (e.g. "swsh3-136"). Returns full card details: category, rarity, hp, types, stage, set, illustrator, attacks, abilities, and a high-quality image URL. |
| `list_sets` | List all Pokémon TCG (and other trading card game) sets/expansions in the TCGdex database, with id, name, and card counts. Use get_set with an id for the full set including its card list. |
| `get_set` | Look up a single Pokémon TCG (or other trading card game) set by its TCGdex id (e.g. "swsh3"). Returns full set details: serie, release date, card counts, and the list of cards in the set. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "tcgdex": {
      "url": "https://gateway.pipeworx.io/tcgdex/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Tcgdex data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
