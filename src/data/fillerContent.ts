// Deterministic index from string — same fact always gets same filler
export function stableIndex(str: string, len: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % len;
}

export const MAGICAL_ADS = [
  "Flourish & Blotts — All histories half-price this fortnight",
  "Owl Post Express — Next-day delivery to all counties, guaranteed",
  "Madam Malkin's Robes for All Occasions — Est. 1652",
  "Gringotts Wizarding Bank — Your gold is safe with goblins",
  "Quality Quidditch Supplies — New Nimbus models now in stock",
  "Slug & Jiggers Apothecary — Finest potions ingredients since 1207",
  "Wiseacre's Wizarding Equipment — Telescopes, scales & phials",
  "Eeylops Owl Emporium — Tawny, screech, barn & snowy available",
  "Ollivanders — Makers of fine wands since 382 B.C.",
  "The Leaky Cauldron — Rooms to let, enquire within",
  "Twilfitt and Tatting's — Bespoke enchanted garments",
  "Potage's Cauldron Shop — All sizes, copper to self-stirring",
  "Scribbulus Writing Instruments — Ever-lasting ink, self-correcting quills",
  "Obscurus Books — Publishers of wizarding literature since 1422",
  "Gladrags Wizardwear — London, Paris & Hogsmeade",
];

export const NOTICES = [
  "WANTED: Reliable house-elf, must have references. Apply Box 394",
  "LOST: One remembrall, last seen vicinity of Hogsmeade. Reward offered",
  "PUBLIC NOTICE: The Floo Network will undergo maintenance Thursday eve",
  "CAUTION: Nifflers spotted near Diagon Alley vaults. Secure all shinies",
  "FOR SALE: Slightly singed flying carpet, one careful owner. Box 271",
  "FOUND: Self-shuffling pack of cards, Knockturn Alley. Claim at Ministry",
  "MISSING: Three garden gnomes, answers to nothing. Last seen heading north",
  "NOTICE: Apparition licenses must be renewed before the solstice",
  "WARNING: Do not feed the gargoyles outside Gringotts after midnight",
  "SEEKING: Experienced curse-breaker for short-term contract. Excellent pay",
  "TO LET: One-bedroom flat above Flourish & Blotts, no pets (owls excepted)",
  "REWARD: Information leading to recovery of enchanted pocket watch. Box 88",
];

export const WEATHER = [
  "Partly enchanted with scattered parchment showers expected by evening",
  "Thunderbolts and broomstick turbulence over the northern counties",
  "Dense fog of forgetting in lowland regions — travel not advised",
  "Fair skies with occasional bursts of accidental magic in the south",
  "Intermittent drizzle of invisible rain — carry enchanted umbrellas",
  "Balmy conditions disrupted by rogue bludger activity in the midlands",
  "Clear stargazing tonight — centaurs predict significant celestial events",
  "Charmed snowfall expected in Scotland — non-melting variety",
];

export const MINI_HEADLINES = [
  "CAULDRON SHORTAGE HITS THIRD WEEK",
  "MINISTRY DENIES RUMOURS",
  "GINGER WITCH SURVIVES",
  "POTION WASTE: THE FACTS",
  "HENNA EXPLOSION SHOCKS VILLAGE",
  "GOBLIN RELATIONS AT NEW LOW",
  "MUGGLE ARTEFACTS SEIZED IN RAID",
  "BROOMSTICK RECALL AFFECTS THOUSANDS",
  "DRAGON PACT UNDER REVIEW",
  "CENTAURS REFUSE MINISTRY TALKS",
  "ANCIENT RUNE DISCOVERY STUNS SCHOLARS",
  "WEREWOLF REGISTRY DEBATE CONTINUES",
  "QUIDDITCH SCORES DISPUTED",
  "ENCHANTED CHEESE BAFFLES EXPERTS",
  "TROLL SIGHTING IN SURREY DENIED",
  "PHOENIX FEATHER SHORTAGE LOOMS",
  "MERPEOPLE DEMAND LAKE RIGHTS",
  "POLYJUICE PRICE TRIPLES OVERNIGHT",
  "DOXY INFESTATION CLOSES LIBRARY",
  "VEELA DELEGATION ARRIVES FROM FRANCE",
];

export const TICKER_ITEMS = [
  "POTIONS 7",
  "CHARMS 8",
  "HOCUS-POCUS",
  "DARK ARTS DEFENCE 3",
  "TRANSFIGURATION 5",
  "HERBOLOGY 4",
  "DIVINATION 2",
  "ENCHANTMENTS 6",
  "RUNES 9",
  "MAGICAL HISTORY 3",
];

export const SUBHEADLINES: Record<string, string[]> = {
  person: [
    "Born into a world forever changed",
    "A life of remarkable distinction began this day",
    "The arrival that would shape an era",
    "From humble beginnings to lasting renown",
    "A name that history would not forget",
  ],
  event: [
    "A day the world shall not soon forget",
    "The course of history altered in an instant",
    "An event of extraordinary consequence",
    "The moment everything changed",
    "Witnessed by many, understood by few",
  ],
  music: [
    "A melody that captured the age",
    "The song that defined a generation",
    "Notes that echoed through the decades",
    "A musical enchantment of the highest order",
    "Sound and fury, signifying everything",
  ],
  movie: [
    "A cinematic triumph for the ages",
    "The moving picture that mesmerised millions",
    "Flickering images that stirred the soul",
    "A celluloid spell most potent",
    "The screen came alive with wonder",
  ],
};
