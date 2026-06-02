import type { Spot } from "./types";

/**
 * Curated fallback for famous landmarks. The geocoder/Overpass query
 * will return one of these if OSM has no data nearby. Coordinates are
 * approximate but good enough for "is this a match?" purposes.
 */
export const CURATED_SPOTS: Omit<Spot, "distanceKm">[] = [
  {
    id: "curated-taj",
    name: "Taj Mahal",
    lat: 27.1751,
    lon: 78.0421,
    category: "Monument",
    wikipedia: "Taj_Mahal",
    summary:
      "A 17th-century ivory-white marble mausoleum in Agra, built by Mughal emperor Shah Jahan for his wife Mumtaz Mahal.",
    famousFor:
      "Stunning Indo-Islamic architecture, symmetrical gardens, and being one of the New Seven Wonders of the World.",
    backstory:
      "Commissioned in 1632 by Emperor Shah Jahan in memory of his beloved wife Mumtaz Mahal, the Taj Mahal took roughly 20 years and 20,000 artisans to complete. Its marble was sourced from Makrana, Rajasthan, and inlaid with 28 types of precious and semi-precious stones using the pietra dura technique. The four minarets lean slightly outward so that in case of collapse they would fall away from the main tomb. The mausoleum changes color throughout the day — pinkish at dawn, milky white at noon, and golden under moonlight. It is a UNESCO World Heritage Site and receives around 8 million visitors a year.",
    curated: true,
  },
  {
    id: "curated-eiffel",
    name: "Eiffel Tower",
    lat: 48.8584,
    lon: 2.2945,
    category: "Landmark",
    wikipedia: "Eiffel_Tower",
    summary:
      "A wrought-iron lattice tower in Paris, designed by Gustave Eiffel and completed in 1889 for the World's Fair celebrating the centennial of the French Revolution.",
    famousFor:
      "Its iconic silhouette, panoramic views of Paris, and as a global symbol of France and romance.",
    backstory:
      "Built in just over two years by Gustave Eiffel's company, the tower was originally criticized by leading artists and intellectuals of the day as an eyesore. Standing at 330 meters today (with antenna), it was the tallest man-made structure in the world for 41 years until the Chrysler Building surpassed it in 1930. Originally intended as a temporary structure, it was saved because of its usefulness as a radio transmission tower. Every seven years it is repainted with 60 tons of paint to protect it from rust. The tower sparkles with 20,000 light bulbs every evening for five minutes on the hour.",
    curated: true,
  },
  {
    id: "curated-colosseum",
    name: "Colosseum",
    lat: 41.8902,
    lon: 12.4922,
    category: "Historic",
    wikipedia: "Colosseum",
    summary:
      "An ancient Roman amphitheater in the heart of Rome, completed in 80 AD under Emperor Titus, once hosting gladiatorial contests and public spectacles.",
    famousFor:
      "Engineering genius of the Roman Empire, its role in ancient entertainment, and surviving nearly two thousand years of history.",
    backstory:
      "Commissioned by Emperor Vespasian in 72 AD, the Colosseum could hold 50,000 to 80,000 spectators who entered through 80 numbered gates. Beneath the wooden arena floor lay the hypogeum, a two-level underground network of tunnels and cages where gladiators and wild animals waited before their contests. The arena hosted mock sea battles, animal hunts, executions, and dramatic re-enactments of famous battles. After the fall of the Western Roman Empire it was used as housing, a fortress, a quarry, and a Christian shrine. Earthquakes in 1349 caused the southern outer wall to collapse, and the stone was reused to build palaces and churches across Rome. Today it is one of the New Seven Wonders of the World.",
    curated: true,
  },
  {
    id: "curated-statue",
    name: "Statue of Liberty",
    lat: 40.6892,
    lon: -74.0445,
    category: "Monument",
    wikipedia: "Statue_of_Liberty",
    summary:
      "A colossal neoclassical sculpture on Liberty Island in New York Harbor, dedicated in 1886, a gift from France to the United States.",
    famousFor:
      "Symbolizing freedom and democracy, welcoming immigrants arriving by ship, and as an enduring icon of New York City.",
    backstory:
      "Conceived by French historian Édouard de Laboulaye and sculpted by Frédéric Auguste Bartholdi, the statue's metal framework was designed by Gustave Eiffel (yes, the same engineer as the Eiffel Tower). It was built in France, disassembled into 350 pieces, shipped across the Atlantic in 214 crates, and reassembled on Bedloe's Island (now Liberty Island). The seven rays on her crown represent the seven continents and seas. The tablet she holds reads 'JULY IV MDCCLXXVI' — July 4, 1776 — the date of American independence. In 1916, the Black Tom explosion damaged the statue, and its torch has been closed to the public ever since. A replica of the torch now lights the way for visitors.",
    curated: true,
  },
  {
    id: "curated-great-wall",
    name: "Great Wall of China",
    lat: 40.4319,
    lon: 116.5704,
    category: "Historic",
    wikipedia: "Great_Wall_of_China",
    summary:
      "A system of walls and fortifications stretching across northern China, built over many centuries to protect Chinese states from invasions.",
    famousFor:
      "Its staggering length, the only man-made structure visible from space with the naked eye (a popular myth), and 2,000+ years of history.",
    backstory:
      "Construction began in the 7th century BC under the state of Qi and continued through the Qin, Han, and Ming dynasties. The most iconic, well-preserved sections near Beijing were built during the Ming dynasty (1368–1644) using bricks and stone. Contrary to popular belief, the wall is not visible from space with the naked eye — this has been confirmed by many astronauts. The wall stretches over 21,000 kilometers including all branches and trenches. It was built by soldiers, peasants, and prisoners; many workers were buried within it. A popular folk tale says that the wall is held together by the bones of those who died building it, though the mortar actually used rice flour and slaked lime. Today it is a UNESCO World Heritage Site and one of the most visited landmarks on Earth.",
    curated: true,
  },
  {
    id: "curated-pyramids",
    name: "Pyramids of Giza",
    lat: 29.9792,
    lon: 31.1342,
    category: "Historic",
    wikipedia: "Great_Pyramid_of_Giza",
    summary:
      "Ancient Egyptian pyramid structures built as royal tombs for pharaohs of the Fourth Dynasty (c. 2580–2560 BC), on the Giza Plateau near Cairo.",
    famousFor:
      "Mathematical precision, astronomical alignment, and being the only surviving wonder of the ancient world.",
    backstory:
      "The Great Pyramid of Khufu, the largest, was built from an estimated 2.3 million limestone blocks averaging 2.5 tons each. For over 3,800 years it was the tallest man-made structure in the world at 146.6 meters. Its sides align almost perfectly with the cardinal points of the compass, an accuracy that modern surveyors still find remarkable. The three main pyramids serve as tombs for Khufu, Khafre, and Menkaure. The Great Sphinx, a 73-meter limestone statue with the body of a lion and the face of a pharaoh, guards the complex. Egyptologists believe the pyramids were built by paid laborers rather than slaves, based on recent discoveries of workers' villages and tombs. The pyramids have been studied for centuries, and their construction techniques are still debated today.",
    curated: true,
  },
  {
    id: "curated-machu",
    name: "Machu Picchu",
    lat: -13.1631,
    lon: -72.545,
    category: "Historic",
    wikipedia: "Machu_Picchu",
    summary:
      "A 15th-century Inca citadel set high in the Andes Mountains of Peru, above the Sacred Valley, built around 1450 during the reign of Inca emperor Pachacuti.",
    famousFor:
      "Stunning mountain setting, mysterious abandonment, and being the most iconic symbol of the Inca civilization.",
    backstory:
      "Built as an estate for Emperor Pachacuti, Machu Picchu was abandoned roughly 100 years later during the Spanish conquest — possibly because the Spanish never found it, sparing it from destruction. The site remained unknown to the outside world until 1911, when American historian Hiram Bingham was led there by local farmers. Its construction is a marvel of dry-stone walls fitted together so precisely that not even a blade of grass fits between them, and the entire complex is earthquake-resistant. The site contains more than 150 buildings, including temples, terraces, and astronomical observatories aligned with the sun. The Incas had no written language, so much of what we know comes from archaeology. Machu Picchu sits at 2,430 meters above sea level and is reached today by train or the famous Inca Trail trek.",
    curated: true,
  },
  {
    id: "curated-sydney-opera",
    name: "Sydney Opera House",
    lat: -33.8568,
    lon: 151.2153,
    category: "Landmark",
    wikipedia: "Sydney_Opera_House",
    summary:
      "A multi-venue performing arts center at Sydney Harbour in Australia, designed by Danish architect Jørn Utzon and opened in 1973.",
    famousFor:
      "Its striking sail-shaped roof, harbor setting, and as a 20th-century architectural icon recognized worldwide.",
    backstory:
      "An international design competition in 1956 attracted 233 entries; Utzon's was selected as the winner despite being relatively inexperienced. Construction began in 1959 and was originally expected to take four years but took 14, with the project running severely over budget. The shell-shaped roof is made of more than a million ceramic tiles manufactured in Sweden. Utzon resigned before the project was completed and never returned to see it finished, due to disputes with the government. He was awarded the Pritzker Prize in 2003, and in 2004 the NSW government formally apologized to him. Today the Opera House hosts more than 1,500 performances a year and is visited by over 8 million people. It is a UNESCO World Heritage Site and remains one of the most photographed buildings in the world.",
    curated: true,
  },
];

/**
 * Find curated spots within `radiusKm` of (lat, lon) and return with distance set.
 */
export function findCuratedSpotsNear(
  lat: number,
  lon: number,
  radiusKm: number,
  limit = 5,
): Spot[] {
  const withDist = CURATED_SPOTS.map((s) => ({
    ...s,
    distanceKm: haversineKm(lat, lon, s.lat, s.lon),
  }))
    .filter((s) => s.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
  return withDist;
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
