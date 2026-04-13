export interface CityData {
  slug: string;
  name: string;
  county: string;
  state: string;
  zip: string[];
  population: number;
  description: string;
  fireplaceContent: string;
  buildingCodeNotes: string;
  popularStyles: string[];
  avgFireplaceCost: string;
  nearbySubdivisions: string[];
  metaTitle: string;
  metaDescription: string;
}

export const CITIES: CityData[] = [
  {
    slug: 'fireplaces-springfield-mo',
    name: 'Springfield',
    county: 'Greene',
    state: 'MO',
    zip: ['65801', '65802', '65803', '65804', '65806', '65807', '65809', '65810'],
    population: 169176,
    description: 'As the third-largest city in Missouri and the heart of the Ozarks, Springfield sees hundreds of new residential construction permits each year. With cold winters averaging 40 days below freezing, a fireplace isn\'t just a luxury—it\'s a centerpiece of every new home.',
    fireplaceContent: `Springfield homeowners overwhelmingly choose gas fireplaces for new construction, with direct-vent models being the most popular choice. The city sits on the natural gas grid, making gas fireplaces economical to operate. For homes in south Springfield's newer developments, linear contemporary fireplaces are trending, while traditional manteled designs remain popular in established neighborhoods like Galloway and Rountree.

The City of Springfield requires all fireplace installations to comply with the 2018 International Residential Code (IRC). Gas fireplaces must be installed by a licensed contractor, and all installations require a separate mechanical permit in addition to the building permit. Inspections are required before the fireplace surround is enclosed.

Installing a fireplace during new construction typically costs $2,500–$6,500 for a gas unit, compared to $5,000–$12,000 for a retrofit after the home is complete. This is because the framing, venting, and gas line can be roughed in during the normal construction sequence without any demolition or rework.`,
    buildingCodeNotes: '2018 IRC adopted. Gas fireplaces require mechanical permit. All installations inspected before enclosure. Licensed contractor required for gas line work.',
    popularStyles: ['Linear contemporary', 'Traditional mantel', 'Corner unit', 'See-through dual-sided'],
    avgFireplaceCost: '$2,500–$6,500 (new construction)',
    nearbySubdivisions: ['The Lakes at Wild Horse', 'Woodvale', 'Lakepointe Reserve', 'Elfindale'],
    metaTitle: 'Fireplace Installation Springfield MO | New Construction Fireplaces',
    metaDescription: 'Expert fireplace installation for new homes in Springfield, MO. Gas, wood-burning, and electric options. Save $3,000+ by installing during construction. Free consultation.',
  },
  {
    slug: 'fireplaces-nixa-mo',
    name: 'Nixa',
    county: 'Christian',
    state: 'MO',
    zip: ['65714'],
    population: 22086,
    description: 'Nixa is one of the fastest-growing cities in Southwest Missouri, with new subdivisions opening every year. Located just 15 minutes south of Springfield, Nixa attracts young families drawn to its top-rated school district and affordable new construction.',
    fireplaceContent: `Nixa's new construction market is booming, with production builders like Schuber Mitchell and Cronkhite Homes actively developing multiple communities. Fireplaces are one of the most popular upgrade options—and one of the most cost-effective when included during the build.

In Nixa, the most requested fireplace styles are traditional gas units with stone or brick surrounds that complement the area's popular Craftsman and farmhouse architectural styles. Corner fireplaces are particularly popular in Nixa's open-concept floor plans, as they provide a focal point visible from both the living room and kitchen.

Christian County follows the 2015 International Building Code with local amendments. Nixa's building department issues permits through their myNixa online portal, and fireplace installations are inspected as part of the mechanical inspection phase.`,
    buildingCodeNotes: '2015 IBC with local amendments. Permits via myNixa portal. Mechanical inspection required for fireplace installations.',
    popularStyles: ['Corner gas fireplace', 'Traditional stone surround', 'Farmhouse mantel', 'Electric accent wall'],
    avgFireplaceCost: '$2,200–$5,800 (new construction)',
    nearbySubdivisions: ['Riverton Park', 'North Point', 'Aldersgate', 'McCracken Hills'],
    metaTitle: 'Fireplace Installation Nixa MO | New Home Fireplaces',
    metaDescription: 'Fireplace options for new homes in Nixa, MO. Work with your builder to include a fireplace during construction and save thousands. Expert installation & consultation.',
  },
  {
    slug: 'fireplaces-ozark-mo',
    name: 'Ozark',
    county: 'Christian',
    state: 'MO',
    zip: ['65721'],
    population: 21816,
    description: 'Ozark sits along the Finley River in Christian County and has experienced explosive growth over the past decade. With new developments stretching along the Highway 65 corridor, Ozark is a prime market for new construction fireplaces.',
    fireplaceContent: `Ozark's building permit data shows consistent growth in new residential construction, with many homes in the $280,000–$450,000 range that are ideal candidates for fireplace installations. The city's SmartGov online permitting system makes it easy to track new construction activity.

Ozark homeowners tend to prefer traditional and rustic fireplace designs that complement the Ozarks aesthetic. Stone-faced fireplaces with wooden mantels are the most popular choice, followed by modern linear units in newer contemporary homes. Many Ozark homes feature walkout basements, creating an opportunity for dual fireplace installations—one on the main level and one in the basement rec room.

The City of Ozark reviews fireplace plans as part of the standard building permit review process. Gas line installations must be performed by a licensed plumber, and the fireplace rough-in is inspected before drywall.`,
    buildingCodeNotes: 'SmartGov online permitting. Gas line work requires licensed plumber. Rough-in inspection before drywall.',
    popularStyles: ['Stone-faced traditional', 'Rustic wooden mantel', 'Basement rec room unit', 'Outdoor fireplace/fire pit'],
    avgFireplaceCost: '$2,400–$6,200 (new construction)',
    nearbySubdivisions: ['Finley Crossing', 'Greenbridge Estates', 'Rivercut', 'Ozark Highlands'],
    metaTitle: 'Fireplace Installation Ozark MO | New Construction Fireplaces',
    metaDescription: 'Fireplace installation for new homes in Ozark, MO. Traditional stone, modern linear, and basement options. Install during construction and save. Free quote.',
  },
  {
    slug: 'fireplaces-republic-mo',
    name: 'Republic',
    county: 'Greene',
    state: 'MO',
    zip: ['65738'],
    population: 18438,
    description: 'Republic is a thriving community west of Springfield with some of the most active new home construction in Greene County. Affordable land and excellent schools make it a top choice for families building their first home.',
    fireplaceContent: `Republic's new construction market is dominated by production builders offering homes in the $250,000–$380,000 range. At this price point, a fireplace is one of the most impactful upgrades a buyer can choose—adding both comfort and resale value for a relatively modest investment.

The most popular fireplace choice in Republic is a direct-vent gas fireplace installed in the main living area. Many Republic floor plans feature an open great room where the fireplace serves as the architectural anchor. Electric fireplaces are also gaining traction as a budget-friendly alternative, particularly in secondary living spaces.

Pro tip: If you're building in Republic, discuss fireplace options with your builder before the framing stage. Adding a fireplace rough-in during framing costs about $800–$1,200, but retrofitting the chase and venting after construction can cost $3,000–$5,000 in additional framing and finish work.`,
    buildingCodeNotes: 'Greene County building codes apply in unincorporated areas. City permits required within city limits.',
    popularStyles: ['Direct-vent gas (living room)', 'Electric accent fireplace', 'Outdoor fire pit', 'Double-sided living/patio'],
    avgFireplaceCost: '$2,100–$5,200 (new construction)',
    nearbySubdivisions: ['Greenfield Estates', 'Olde Savannah', 'Brookstone Meadows', 'Wilson Creek Farms'],
    metaTitle: 'Fireplace Installation Republic MO | Affordable New Home Fireplaces',
    metaDescription: 'Affordable fireplace installation for new homes in Republic, MO. Gas and electric options starting at $2,100. Include in your build and save thousands vs retrofit.',
  },
  {
    slug: 'fireplaces-battlefield-mo',
    name: 'Battlefield',
    county: 'Greene',
    state: 'MO',
    zip: ['65619'],
    population: 6800,
    description: 'Battlefield is a growing suburb south of Springfield known for its newer developments and family-friendly atmosphere. New construction activity has been strong, with several active subdivisions attracting buyers looking for quality homes.',
    fireplaceContent: `Battlefield's residential market leans toward move-up homes in the $300,000–$500,000 range, where fireplaces are nearly expected. Builders in the area report that homes with fireplaces sell faster and at a premium compared to similar homes without them.

The proximity to Springfield means Battlefield homeowners have access to the full range of fireplace products and installation services. Most new homes in Battlefield feature gas fireplaces, with a growing number opting for see-through or multi-sided units that serve as room dividers in open floor plans.`,
    buildingCodeNotes: 'Greene County codes. Permits through county building department for unincorporated areas.',
    popularStyles: ['See-through room divider', 'Traditional gas with stone', 'Outdoor living fireplace', 'Master bedroom accent'],
    avgFireplaceCost: '$2,800–$7,000 (new construction)',
    nearbySubdivisions: ['Old Wire Crossing', 'Battlefield Estates', 'Cannonball Creek'],
    metaTitle: 'Fireplace Installation Battlefield MO | Premium New Home Fireplaces',
    metaDescription: 'Premium fireplace options for new homes in Battlefield, MO. See-through, traditional, and outdoor fireplaces. Expert installation during construction.',
  },
  {
    slug: 'fireplaces-rogersville-mo',
    name: 'Rogersville',
    county: 'Greene',
    state: 'MO',
    zip: ['65742'],
    population: 4200,
    description: 'Rogersville is a small but growing community east of Springfield, offering rural charm with proximity to city amenities. New construction here tends toward larger lots and custom-built homes.',
    fireplaceContent: `Rogersville's custom home market presents unique fireplace opportunities. With larger lots and more spacious floor plans, many Rogersville homes include both an interior fireplace and an outdoor fireplace or fire pit for entertaining. Wood-burning fireplaces are more common here than in Springfield proper, as many homeowners appreciate the traditional experience and have access to local firewood.

For new construction in Rogersville, we recommend planning your fireplace during the design phase. Custom homes offer the flexibility to position the fireplace exactly where it creates the most visual and functional impact.`,
    buildingCodeNotes: 'Greene County building regulations apply. Larger lot sizes may require additional setback considerations for outdoor fireplaces.',
    popularStyles: ['Wood-burning traditional', 'Outdoor stone fireplace', 'Great room statement piece', 'Dual indoor/outdoor'],
    avgFireplaceCost: '$2,600–$8,000 (new construction)',
    nearbySubdivisions: ['Logan Creek', 'Valley View Estates'],
    metaTitle: 'Fireplace Installation Rogersville MO | Custom Home Fireplaces',
    metaDescription: 'Custom fireplace design and installation for new homes in Rogersville, MO. Wood-burning, gas, and outdoor options. Plan your fireplace during the design phase.',
  },
  {
    slug: 'fireplaces-willard-mo',
    name: 'Willard',
    county: 'Greene',
    state: 'MO',
    zip: ['65781'],
    population: 5700,
    description: 'Willard is a growing community northwest of Springfield with excellent schools and affordable new construction. The town has seen significant residential growth along the Highway 160 corridor.',
    fireplaceContent: `Willard's new construction market offers excellent value, with many homes in the $230,000–$350,000 range. A fireplace upgrade in this price bracket is one of the best investments a buyer can make—typically adding $5,000–$10,000 in appraised value for a $2,500–$4,500 installation cost.

Gas fireplaces dominate in Willard's new builds, with most homeowners opting for efficient direct-vent models that provide supplemental heating during Missouri's cold winters. The Willard school district is a major draw for young families, and a cozy fireplace makes these family homes even more appealing.`,
    buildingCodeNotes: 'Greene County codes apply. Standard residential building permit required.',
    popularStyles: ['Direct-vent gas', 'Traditional with tile surround', 'Electric media wall', 'Efficient heating unit'],
    avgFireplaceCost: '$2,200–$4,800 (new construction)',
    nearbySubdivisions: ['Willard Heights', 'Prairie Creek'],
    metaTitle: 'Fireplace Installation Willard MO | Affordable Fireplace Options',
    metaDescription: 'Affordable fireplace installation for new homes in Willard, MO. Add value and comfort to your new build. Gas and electric options from $2,200.',
  },
  {
    slug: 'fireplaces-strafford-mo',
    name: 'Strafford',
    county: 'Greene',
    state: 'MO',
    zip: ['65757'],
    population: 2800,
    description: 'Strafford is a small community east of Springfield along I-44 with steady new home construction. Known for its excellent school district and small-town feel with easy interstate access.',
    fireplaceContent: `Strafford's new homes blend small-town charm with modern amenities. Fireplaces are a popular upgrade that enhances the cozy, family-oriented atmosphere that draws residents to Strafford. Most new construction here features open floor plans where a fireplace serves as the natural gathering point.

With I-44 access providing easy commutes to Springfield, Strafford attracts buyers who want more space for their money. Many homes here feature bonus rooms and finished basements—perfect locations for a second fireplace installation.`,
    buildingCodeNotes: 'Greene County building regulations apply. Standard permit process.',
    popularStyles: ['Traditional gas', 'Basement fireplace', 'Open-concept focal point', 'Brick surround'],
    avgFireplaceCost: '$2,300–$5,000 (new construction)',
    nearbySubdivisions: ['Strafford Meadows', 'Twin Oaks'],
    metaTitle: 'Fireplace Installation Strafford MO | New Home Fireplaces',
    metaDescription: 'Fireplace options for new homes in Strafford, MO. Traditional and modern designs for your new build. Install during construction and save.',
  },
];

export function getCityBySlug(slug: string): CityData | undefined {
  return CITIES.find(c => c.slug === slug);
}

export function getAllCitySlugs(): string[] {
  return CITIES.map(c => c.slug);
}
