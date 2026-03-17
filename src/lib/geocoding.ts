// Known locations for precise geocoding from article titles
export const KNOWN_LOCATIONS: Record<string, { lat: number; lng: number; name: string }> = {
  // Iran
  'tehran': { lat: 35.69, lng: 51.39, name: 'Tehran, Iran' },
  'isfahan': { lat: 32.65, lng: 51.68, name: 'Isfahan, Iran' },
  'natanz': { lat: 33.51, lng: 51.92, name: 'Natanz, Iran' },
  'shiraz': { lat: 29.59, lng: 52.58, name: 'Shiraz, Iran' },
  'tabriz': { lat: 38.08, lng: 46.29, name: 'Tabriz, Iran' },
  'bushehr': { lat: 28.97, lng: 50.84, name: 'Bushehr, Iran' },
  'bandar abbas': { lat: 27.19, lng: 56.27, name: 'Bandar Abbas, Iran' },
  'hormuz': { lat: 26.56, lng: 56.28, name: 'Strait of Hormuz' },
  'strait of hormuz': { lat: 26.56, lng: 56.28, name: 'Strait of Hormuz' },
  'kharg island': { lat: 29.24, lng: 50.31, name: 'Kharg Island, Iran' },
  'fordow': { lat: 34.88, lng: 51.59, name: 'Fordow, Iran' },
  'arak': { lat: 34.09, lng: 49.69, name: 'Arak, Iran' },
  'parchin': { lat: 35.52, lng: 51.77, name: 'Parchin, Iran' },
  'chabahar': { lat: 25.29, lng: 60.64, name: 'Chabahar, Iran' },
  'qom': { lat: 34.64, lng: 50.88, name: 'Qom, Iran' },
  'mashhad': { lat: 36.31, lng: 59.60, name: 'Mashhad, Iran' },
  'abadan': { lat: 30.34, lng: 48.30, name: 'Abadan, Iran' },
  'irgc': { lat: 35.69, lng: 51.39, name: 'Tehran, Iran' },
  'khuzestan': { lat: 31.32, lng: 48.67, name: 'Khuzestan, Iran' },

  // Israel & Palestine
  'tel aviv': { lat: 32.09, lng: 34.78, name: 'Tel Aviv, Israel' },
  'jerusalem': { lat: 31.77, lng: 35.23, name: 'Jerusalem' },
  'haifa': { lat: 32.79, lng: 34.99, name: 'Haifa, Israel' },
  'nevatim': { lat: 31.21, lng: 35.01, name: 'Nevatim Air Base, Israel' },
  'dimona': { lat: 31.07, lng: 35.03, name: 'Dimona, Israel' },
  'gaza': { lat: 31.50, lng: 34.47, name: 'Gaza' },
  'west bank': { lat: 31.95, lng: 35.20, name: 'West Bank' },
  'golan': { lat: 33.00, lng: 35.80, name: 'Golan Heights' },
  'eilat': { lat: 29.56, lng: 34.95, name: 'Eilat, Israel' },
  'beer sheva': { lat: 31.25, lng: 34.79, name: 'Beer Sheva, Israel' },
  'ben gurion': { lat: 32.01, lng: 34.87, name: 'Ben Gurion Airport, Israel' },
  'iron dome': { lat: 32.09, lng: 34.78, name: 'Israel (Iron Dome)' },
  'galilee': { lat: 32.83, lng: 35.50, name: 'Galilee, Israel' },

  // Lebanon
  'beirut': { lat: 33.89, lng: 35.50, name: 'Beirut, Lebanon' },
  'lebanon': { lat: 33.89, lng: 35.50, name: 'Lebanon' },
  'nabatieh': { lat: 33.38, lng: 35.48, name: 'Nabatieh, Lebanon' },
  'hezbollah': { lat: 33.38, lng: 35.48, name: 'Southern Lebanon' },
  'tyre': { lat: 33.27, lng: 35.20, name: 'Tyre, Lebanon' },
  'baalbek': { lat: 34.01, lng: 36.21, name: 'Baalbek, Lebanon' },

  // Syria
  'damascus': { lat: 33.51, lng: 36.29, name: 'Damascus, Syria' },
  'aleppo': { lat: 36.20, lng: 37.15, name: 'Aleppo, Syria' },
  'syria': { lat: 34.80, lng: 38.99, name: 'Syria' },
  'idlib': { lat: 35.93, lng: 36.63, name: 'Idlib, Syria' },

  // Iraq
  'baghdad': { lat: 33.31, lng: 44.37, name: 'Baghdad, Iraq' },
  'ain al-asad': { lat: 33.79, lng: 43.56, name: 'Ain al-Asad, Iraq' },
  'erbil': { lat: 36.19, lng: 44.01, name: 'Erbil, Iraq' },
  'basra': { lat: 30.51, lng: 47.81, name: 'Basra, Iraq' },
  'iraq': { lat: 33.31, lng: 44.37, name: 'Iraq' },

  // Gulf States
  'al udeid': { lat: 25.12, lng: 51.31, name: 'Al Udeid Air Base, Qatar' },
  'qatar': { lat: 25.29, lng: 51.53, name: 'Qatar' },
  'doha': { lat: 25.29, lng: 51.53, name: 'Doha, Qatar' },
  'dubai': { lat: 25.20, lng: 55.27, name: 'Dubai, UAE' },
  'abu dhabi': { lat: 24.45, lng: 54.65, name: 'Abu Dhabi, UAE' },
  'uae': { lat: 24.45, lng: 54.65, name: 'UAE' },
  'united arab emirates': { lat: 24.45, lng: 54.65, name: 'UAE' },
  'al dhafra': { lat: 24.25, lng: 54.55, name: 'Al Dhafra Air Base, UAE' },
  'bahrain': { lat: 26.07, lng: 50.55, name: 'Bahrain' },
  'isa air base': { lat: 26.03, lng: 50.59, name: 'Isa Air Base, Bahrain' },
  'oman': { lat: 23.58, lng: 58.38, name: 'Oman' },
  'muscat': { lat: 23.59, lng: 58.55, name: 'Muscat, Oman' },
  'riyadh': { lat: 24.71, lng: 46.67, name: 'Riyadh, Saudi Arabia' },
  'saudi arabia': { lat: 24.71, lng: 46.67, name: 'Saudi Arabia' },
  'saudi': { lat: 24.71, lng: 46.67, name: 'Saudi Arabia' },
  'jeddah': { lat: 21.49, lng: 39.19, name: 'Jeddah, Saudi Arabia' },
  'prince sultan': { lat: 24.06, lng: 47.58, name: 'Prince Sultan Air Base, Saudi Arabia' },
  'kuwait': { lat: 29.38, lng: 47.99, name: 'Kuwait' },
  'persian gulf': { lat: 26.50, lng: 52.00, name: 'Persian Gulf' },
  'gulf': { lat: 26.50, lng: 52.00, name: 'Persian Gulf' },

  // Yemen / Red Sea
  'yemen': { lat: 15.37, lng: 44.19, name: 'Yemen' },
  'sanaa': { lat: 15.37, lng: 44.19, name: "Sana'a, Yemen" },
  'aden': { lat: 12.79, lng: 45.01, name: 'Aden, Yemen' },
  'hodeidah': { lat: 14.80, lng: 42.95, name: 'Hodeidah, Yemen' },
  'houthi': { lat: 15.37, lng: 44.19, name: 'Yemen (Houthi)' },
  'red sea': { lat: 20.00, lng: 38.50, name: 'Red Sea' },
  'bab el-mandeb': { lat: 12.58, lng: 43.33, name: 'Bab el-Mandeb Strait' },
  'marib': { lat: 15.46, lng: 45.32, name: 'Marib, Yemen' },
  'jizan': { lat: 16.89, lng: 42.55, name: 'Jizan, Saudi Arabia' },

  // Ukraine / Russia
  'kyiv': { lat: 50.45, lng: 30.52, name: 'Kyiv, Ukraine' },
  'kiev': { lat: 50.45, lng: 30.52, name: 'Kyiv, Ukraine' },
  'kharkiv': { lat: 49.99, lng: 36.23, name: 'Kharkiv, Ukraine' },
  'odesa': { lat: 46.48, lng: 30.73, name: 'Odesa, Ukraine' },
  'odessa': { lat: 46.48, lng: 30.73, name: 'Odesa, Ukraine' },
  'zaporizhzhia': { lat: 47.84, lng: 35.14, name: 'Zaporizhzhia, Ukraine' },
  'kherson': { lat: 46.64, lng: 32.62, name: 'Kherson, Ukraine' },
  'bakhmut': { lat: 48.60, lng: 37.99, name: 'Bakhmut, Ukraine' },
  'donetsk': { lat: 48.00, lng: 37.80, name: 'Donetsk, Ukraine' },
  'luhansk': { lat: 48.57, lng: 39.31, name: 'Luhansk, Ukraine' },
  'crimea': { lat: 44.95, lng: 34.10, name: 'Crimea' },
  'sevastopol': { lat: 44.62, lng: 33.52, name: 'Sevastopol, Crimea' },
  'moscow': { lat: 55.76, lng: 37.62, name: 'Moscow, Russia' },
  'kursk': { lat: 51.73, lng: 36.19, name: 'Kursk, Russia' },
  'belgorod': { lat: 50.60, lng: 36.59, name: 'Belgorod, Russia' },
  'mariupol': { lat: 47.10, lng: 37.54, name: 'Mariupol, Ukraine' },
  'dnipro': { lat: 48.46, lng: 35.05, name: 'Dnipro, Ukraine' },
  'lviv': { lat: 49.84, lng: 24.03, name: 'Lviv, Ukraine' },
  'sumy': { lat: 50.91, lng: 34.80, name: 'Sumy, Ukraine' },
  'mykolaiv': { lat: 46.97, lng: 31.99, name: 'Mykolaiv, Ukraine' },

  // Sudan
  'khartoum': { lat: 15.59, lng: 32.53, name: 'Khartoum, Sudan' },
  'darfur': { lat: 13.50, lng: 25.00, name: 'Darfur, Sudan' },
  'el fasher': { lat: 13.63, lng: 25.35, name: 'El Fasher, Darfur' },
  'port sudan': { lat: 19.62, lng: 37.22, name: 'Port Sudan, Sudan' },
  'nyala': { lat: 12.05, lng: 24.88, name: 'Nyala, Sudan' },
  'el geneina': { lat: 13.45, lng: 22.45, name: 'El Geneina, Darfur' },
  'sudan': { lat: 15.59, lng: 32.53, name: 'Sudan' },
  'rsf': { lat: 15.59, lng: 32.53, name: 'Sudan (RSF)' },

  // Myanmar
  'yangon': { lat: 16.87, lng: 96.20, name: 'Yangon, Myanmar' },
  'mandalay': { lat: 21.97, lng: 96.08, name: 'Mandalay, Myanmar' },
  'naypyidaw': { lat: 19.76, lng: 96.07, name: 'Naypyidaw, Myanmar' },
  'myanmar': { lat: 19.76, lng: 96.07, name: 'Myanmar' },
  'rakhine': { lat: 20.15, lng: 92.90, name: 'Rakhine, Myanmar' },
  'shan': { lat: 22.00, lng: 97.00, name: 'Shan State, Myanmar' },
  'sagaing': { lat: 21.88, lng: 95.97, name: 'Sagaing, Myanmar' },
  'lashio': { lat: 22.93, lng: 97.75, name: 'Lashio, Myanmar' },
  'myawaddy': { lat: 16.70, lng: 98.60, name: 'Myawaddy, Myanmar' },
  'sittwe': { lat: 20.15, lng: 92.90, name: 'Sittwe, Myanmar' },

  // International
  'un': { lat: 40.75, lng: -73.97, name: 'UN HQ, New York' },
  'united nations': { lat: 40.75, lng: -73.97, name: 'UN HQ, New York' },
  'nato': { lat: 50.88, lng: 4.42, name: 'NATO HQ, Brussels' },
  'washington': { lat: 38.91, lng: -77.04, name: 'Washington DC, USA' },
  'pentagon': { lat: 38.87, lng: -77.06, name: 'Pentagon, USA' },
  'white house': { lat: 38.90, lng: -77.04, name: 'White House, USA' },
  'london': { lat: 51.51, lng: -0.13, name: 'London, UK' },
  'beijing': { lat: 39.90, lng: 116.40, name: 'Beijing, China' },
  'china': { lat: 39.90, lng: 116.40, name: 'Beijing, China' },
};

/**
 * Extract a known location from a text string (article title).
 * Returns the first match found, prioritizing longer matches.
 */
export function geocodeFromTitle(title: string): { lat: number; lng: number; name: string } | null {
  const lower = title.toLowerCase();

  // Sort keys by length (longest first) to match "strait of hormuz" before "hormuz"
  const sortedKeys = Object.keys(KNOWN_LOCATIONS).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    if (lower.includes(key)) {
      return KNOWN_LOCATIONS[key];
    }
  }
  return null;
}
