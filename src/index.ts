interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * TCGdex MCP — multi-language open trading card game database (Pokémon TCG and more).
 * Keyless. TCGdex serves card and set data; list endpoints return BRIEF objects,
 * single-resource endpoints return FULL objects. Card images come without an
 * extension — append a quality+format like `{image}/high.webp` to display.
 */


const BASE = 'https://api.tcgdex.net/v2/en';
const UA = 'pipeworx/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'search_cards',
    description:
      'Search Pokémon TCG (and other trading card games) cards by name in the TCGdex card database. Returns brief matches (id, localId, name, image thumbnail). Use get_card with an id for full card details.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Card name or partial name to search for, e.g. "pikachu". Omit to list cards.' },
        limit: { type: 'number', description: 'Max cards to return (default 30, max 100).' },
      },
    },
  },
  {
    name: 'get_card',
    description:
      'Look up a single Pokémon TCG (or other trading card game) card by its TCGdex id (e.g. "swsh3-136"). Returns full card details: category, rarity, hp, types, stage, set, illustrator, attacks, abilities, and a high-quality image URL.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'TCGdex card id, e.g. "swsh3-136".' },
      },
      required: ['id'],
    },
  },
  {
    name: 'list_sets',
    description:
      'List all Pokémon TCG (and other trading card game) sets/expansions in the TCGdex database, with id, name, and card counts. Use get_set with an id for the full set including its card list.',
    inputSchema: { type: 'object', properties: {} },
  },
  {
    name: 'get_set',
    description:
      'Look up a single Pokémon TCG (or other trading card game) set by its TCGdex id (e.g. "swsh3"). Returns full set details: serie, release date, card counts, and the list of cards in the set.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'TCGdex set id, e.g. "swsh3".' },
      },
      required: ['id'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'search_cards': {
      const nameArg = typeof args.name === 'string' ? args.name.trim() : '';
      const limit = clampLimit(args.limit, 30, 100);
      const params = new URLSearchParams();
      if (nameArg) params.set('name', nameArg);
      params.set('pagination:itemsPerPage', String(limit));
      const res = await tcgGet(`/cards?${params.toString()}`);
      if (isError(res)) return res;
      const data = (res as Array<Record<string, unknown>>) || [];
      return {
        count: data.length,
        cards: data.slice(0, limit).map((c) => ({
          id: c.id,
          localId: c.localId,
          name: c.name,
          image: c.image ? `${c.image}/low.webp` : null,
        })),
      };
    }
    case 'get_card': {
      const id = reqStr(args, 'id', '"swsh3-136"');
      const res = await tcgGet(`/cards/${encodeURIComponent(id)}`);
      if (isError(res)) return res;
      const c = res as Record<string, any>;
      return {
        id: c.id,
        localId: c.localId,
        name: c.name,
        category: c.category,
        rarity: c.rarity,
        hp: c.hp,
        types: c.types,
        stage: c.stage,
        set: c.set?.name,
        illustrator: c.illustrator,
        attacks: c.attacks?.map((a: Record<string, unknown>) => ({
          name: a.name,
          cost: a.cost,
          damage: a.damage,
          effect: a.effect,
        })),
        abilities: c.abilities,
        image_url: c.image ? `${c.image}/high.webp` : null,
      };
    }
    case 'list_sets': {
      const res = await tcgGet('/sets');
      if (isError(res)) return res;
      const data = (res as Array<Record<string, any>>) || [];
      return data.map((s) => ({
        id: s.id,
        name: s.name,
        total_cards: s.cardCount?.total,
        official_cards: s.cardCount?.official,
      }));
    }
    case 'get_set': {
      const id = reqStr(args, 'id', '"swsh3"');
      const res = await tcgGet(`/sets/${encodeURIComponent(id)}`);
      if (isError(res)) return res;
      const c = res as Record<string, any>;
      return {
        id: c.id,
        name: c.name,
        serie: c.serie?.name,
        releaseDate: c.releaseDate,
        cardCount: c.cardCount,
        cards: (c.cards || []).map((card: Record<string, unknown>) => ({
          id: card.id,
          localId: card.localId,
          name: card.name,
        })),
      };
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function tcgGet(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Accept: 'application/json', 'User-Agent': UA },
  });
  if (!res.ok) {
    const text = await res.text();
    return { error: res.status, message: text.slice(0, 300) };
  }
  return res.json();
}

function isError(res: unknown): boolean {
  return typeof res === 'object' && res !== null && 'error' in (res as Record<string, unknown>);
}

function clampLimit(v: unknown, def: number, max: number): number {
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
  if (!Number.isFinite(n) || n <= 0) return def;
  return Math.min(Math.floor(n), max);
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
