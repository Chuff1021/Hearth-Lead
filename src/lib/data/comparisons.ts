export interface ComparisonData {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  optionA: { name: string; pros: string[]; cons: string[]; bestFor: string; cost: string };
  optionB: { name: string; pros: string[]; cons: string[]; bestFor: string; cost: string };
  optionC?: { name: string; pros: string[]; cons: string[]; bestFor: string; cost: string };
  verdict: string;
  localAngle: string;
}

export const COMPARISONS: ComparisonData[] = [
  {
    slug: 'gas-vs-wood-vs-electric',
    title: 'Gas vs Wood-Burning vs Electric Fireplace: Which Is Right for Your Missouri Home?',
    metaTitle: 'Gas vs Wood vs Electric Fireplace | Springfield MO Guide',
    metaDescription: 'Compare gas, wood-burning, and electric fireplaces for your new home in Springfield MO. Costs, efficiency, maintenance, and which is best for SW Missouri.',
    intro: 'Choosing between gas, wood-burning, and electric is the first big fireplace decision you\'ll make. Each has genuine advantages depending on your lifestyle, budget, and home design. Here\'s an honest comparison from a local installer who works with all three.',
    optionA: {
      name: 'Gas Fireplace',
      pros: [
        'Instant on/off with remote or wall switch',
        'Consistent, controllable heat output',
        'No wood to split, store, or carry',
        'Clean — no ash, creosote, or smoke',
        '70-85% energy efficient',
        'Works during power outages (most models)',
        'Lower insurance premiums than wood-burning',
      ],
      cons: [
        'Requires gas line (natural gas or propane)',
        'Flames look realistic but not identical to wood',
        'Annual inspection recommended ($100-150)',
        'Higher upfront cost than electric',
      ],
      bestFor: 'Most new construction homes. The convenience, safety, and efficiency make gas the #1 choice for families.',
      cost: '$2,500–$7,500 installed (new construction)',
    },
    optionB: {
      name: 'Wood-Burning Fireplace',
      pros: [
        'Authentic crackling fire experience',
        'No utility costs — just wood',
        'Works without any power or gas',
        'Traditional aesthetic appeal',
        'Can heat a room effectively',
        'Many homeowners enjoy the ritual',
      ],
      cons: [
        'Requires chimney (adds $2,000-5,000 to construction)',
        'Must source, split, and store firewood',
        'Ash cleanup after every use',
        'Annual chimney cleaning required ($150-300)',
        'Creosote buildup is a fire risk if not maintained',
        'Cannot be left unattended',
        'Only 10-15% energy efficient',
        'May increase homeowner insurance rates',
      ],
      bestFor: 'Rural properties with acreage, homeowners who enjoy the wood-burning ritual, and homes where the fireplace is a primary heat source.',
      cost: '$2,200–$20,000 installed (new construction, prefab to masonry)',
    },
    optionC: {
      name: 'Electric Fireplace',
      pros: [
        'Lowest installation cost',
        'No venting required — install anywhere',
        'No gas line needed',
        'Modern LED flame effects are convincing',
        'Zero emissions, no maintenance',
        'Can be turned off/on instantly',
        'Supplemental zone heating',
        'Easy to upgrade or replace later',
      ],
      cons: [
        'No real flame (LED simulation)',
        'Adds to electric bill when heating',
        'Less heat output than gas or wood',
        'Perceived as less premium by some buyers',
        'Requires electrical outlet (minor during construction)',
      ],
      bestFor: 'Budget-conscious builds, secondary rooms (bedroom, basement), condos/townhomes without gas access, and homeowners who want ambiance without maintenance.',
      cost: '$500–$3,500 installed (new construction)',
    },
    verdict: 'For most new construction in Southwest Missouri, a gas fireplace is the smart choice. It offers the best balance of convenience, efficiency, and resale value. If you\'re building on acreage and love the wood-burning experience, go wood — just budget for the chimney. Electric is perfect as a second fireplace or for budget-friendly builds.',
    localAngle: 'In Springfield and the surrounding cities, natural gas is widely available, making gas fireplaces the most economical to operate. In rural Christian County areas where natural gas isn\'t available, you\'ll need propane for gas fireplaces (add a propane tank) or consider wood-burning or electric. Nixa, Ozark, and Republic all have natural gas service within city limits.',
  },
  {
    slug: 'ventless-vs-direct-vent',
    title: 'Ventless vs Direct-Vent Gas Fireplace: Which Should You Choose?',
    metaTitle: 'Ventless vs Direct-Vent Gas Fireplace | Springfield MO Comparison',
    metaDescription: 'Compare ventless and direct-vent gas fireplaces for your new home. Learn the differences in cost, installation, safety, and efficiency. Expert advice for SW Missouri.',
    intro: 'If you\'ve decided on a gas fireplace, your next choice is ventless or direct-vent. This is a more nuanced decision than most homeowners realize, and the right answer depends on your specific situation.',
    optionA: {
      name: 'Direct-Vent Gas Fireplace',
      pros: [
        'Sealed combustion — no indoor air quality concerns',
        'Can be installed on any exterior wall or vented through roof',
        'Realistic log sets and flame patterns',
        'Higher BTU output for better heating',
        'No moisture added to indoor air',
        'Accepted by all building codes',
        'Better resale value',
      ],
      cons: [
        'Requires vent pipe through wall or roof',
        'Slightly higher installation cost',
        'Must be placed on or near an exterior wall',
        'Vent termination has clearance requirements',
      ],
      bestFor: 'Primary living spaces, bedrooms, and any room where the fireplace will be used regularly for heating. This is the standard choice for new construction.',
      cost: '$2,500–$5,500 installed (new construction)',
    },
    optionB: {
      name: 'Ventless (Vent-Free) Gas Fireplace',
      pros: [
        'No vent pipe needed — install on any wall',
        'Lower installation cost',
        'Nearly 100% efficient (all heat stays in room)',
        'More flexible placement options',
        'Good supplemental heat source',
      ],
      cons: [
        'Burns indoor oxygen (requires room ventilation)',
        'Adds moisture to indoor air',
        'Can produce odor in some conditions',
        'Lower BTU limits to prevent air quality issues',
        'Not allowed in bedrooms in most jurisdictions',
        'Some buyers/inspectors view them negatively',
        'Must be sized to room volume',
        'Oxygen depletion sensor required',
      ],
      bestFor: 'Interior walls where venting isn\'t practical, supplemental heating in large rooms, and budget installations. Best as a secondary fireplace, not the primary one.',
      cost: '$1,800–$3,500 installed (new construction)',
    },
    verdict: 'For new construction, always go direct-vent for your primary fireplace. The vent pipe is trivial to install during framing and the sealed combustion design is simply better for air quality and peace of mind. Ventless makes sense as a supplemental unit in an interior room where running a vent pipe would be impractical.',
    localAngle: 'Greene County and Christian County both allow ventless gas fireplaces in accordance with the IRC, but they must include an oxygen depletion sensor (ODS) and cannot be installed in bedrooms or bathrooms. The City of Springfield follows the same guidelines. During new construction, there\'s little reason to go ventless when the vent pipe can be installed at minimal cost during framing.',
  },
  {
    slug: 'fireplace-insert-vs-built-in',
    title: 'Fireplace Insert vs Built-In: What\'s the Difference?',
    metaTitle: 'Fireplace Insert vs Built-In Fireplace | Which Is Right for You?',
    metaDescription: 'Learn the difference between fireplace inserts and built-in fireplaces. Which is better for new construction? Cost comparison and expert recommendations.',
    intro: 'The terms "insert" and "built-in" are often confused, but they\'re actually quite different products designed for different situations. Here\'s a clear explanation.',
    optionA: {
      name: 'Built-In (Zero-Clearance) Fireplace',
      pros: [
        'Designed specifically for new construction',
        'Installed directly into framed wall cavity',
        'Wide range of sizes and styles available',
        'Seamless, integrated appearance',
        'Optimized venting from the factory',
        'Best selection of contemporary/linear designs',
      ],
      cons: [
        'Requires framed chase in wall',
        'Not designed for existing masonry fireplaces',
        'More expensive than inserts',
        'Installation requires construction coordination',
      ],
      bestFor: 'New construction and major renovations where you\'re building the fireplace wall from scratch. This is the standard choice for new homes.',
      cost: '$2,500–$7,500 installed (new construction)',
    },
    optionB: {
      name: 'Fireplace Insert',
      pros: [
        'Designed to fit into existing fireplace openings',
        'Converts inefficient wood-burning to efficient gas/electric',
        'Uses existing chimney (with liner)',
        'Less construction work required',
        'Good way to upgrade an existing fireplace',
      ],
      cons: [
        'Limited by existing fireplace opening size',
        'Fewer style options (must fit existing opening)',
        'May require chimney liner ($500-1,000)',
        'Not ideal for new construction',
        'Smaller viewing area than built-in',
      ],
      bestFor: 'Existing homes with an old, inefficient fireplace. If you\'re renovating and already have a fireplace opening, an insert is the smart upgrade.',
      cost: '$1,500–$4,500 installed (retrofit)',
    },
    verdict: 'For new construction: always choose a built-in fireplace. You\'re building the wall anyway, so there\'s no reason to limit yourself to an insert. Inserts are designed to upgrade existing fireplaces in older homes. If you hear a builder suggest an insert for new construction, they may be confused about the terminology — ask them to clarify.',
    localAngle: 'In the Springfield MO market, built-in gas fireplaces from brands like Heat & Glo, Napoleon, and Majestic are the standard for new construction. Inserts are commonly used in older Springfield homes (Rountree, Phelps Grove, Grant Beach neighborhoods) that have original masonry fireplaces.',
  },
];

export function getComparisonBySlug(slug: string): ComparisonData | undefined {
  return COMPARISONS.find(c => c.slug === slug);
}

export function getAllComparisonSlugs(): string[] {
  return COMPARISONS.map(c => c.slug);
}
