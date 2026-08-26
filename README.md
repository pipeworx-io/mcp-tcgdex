# mcp-tcgdex

TCGdex MCP — multi-language open trading card game database (Pokémon TCG and more).

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1476+ live data sources.

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

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/tcgdex/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1476+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Tcgdex data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
