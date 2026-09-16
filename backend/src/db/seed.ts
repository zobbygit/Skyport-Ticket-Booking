import bcrypt from "bcrypt";
import { pool } from "../config/db";
import { env } from "../config/env";

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // --- Super admin ---
    if (env.superAdmin.email && env.superAdmin.password) {
      const hash = await bcrypt.hash(env.superAdmin.password, 12);
      await client.query(
        `INSERT INTO admins (full_name, email, password_hash, role)
         VALUES ($1, $2, $3, 'SUPER_ADMIN')
         ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
        [env.superAdmin.name, env.superAdmin.email, hash]
      );
      console.log(`[seed] Super admin ready: ${env.superAdmin.email}`);
    }

    // --- 43 Real Airports (13 original + 30 new) ---
    const airports = [
      // ===== ORIGINAL 13 =====
      { iata: "JFK", name: "John F. Kennedy International Airport",    city: "New York",      country: "USA",            tz: "America/New_York",    lat: 40.6413,  lon: -73.7781,  facilities: ["Free WiFi","Sky Club Lounge","Duty Free","Restaurants","Baby Care Rooms","Currency Exchange","Medical Center","Yoga Room"], transportation: ["AirTrain","Subway","Taxi","Uber/Lyft","Airport Shuttle","Rental Cars"] },
      { iata: "LAX", name: "Los Angeles International Airport",        city: "Los Angeles",   country: "USA",            tz: "America/Los_Angeles", lat: 33.9416,  lon: -118.4085, facilities: ["Free WiFi","The Private Suite","Duty Free","Multiple Restaurants","Children Play Area","Spa","Art Galleries"], transportation: ["FlyAway Bus","Taxi","Uber/Lyft","Metro Rail","Rental Cars"] },
      { iata: "LHR", name: "London Heathrow Airport",                  city: "London",        country: "United Kingdom", tz: "Europe/London",       lat: 51.4700,  lon: -0.4543,   facilities: ["Free WiFi","Clubrooms Lounge","Harrods","Multiple Restaurants","Prayer Room","Showers","Pharmacy","Nursing Room"], transportation: ["Elizabeth Line","Heathrow Express","Taxi","National Express","Rental Cars"] },
      { iata: "DXB", name: "Dubai International Airport",              city: "Dubai",         country: "UAE",            tz: "Asia/Dubai",          lat: 25.2532,  lon: 55.3657,   facilities: ["Free WiFi","Emirates Business Lounge","Duty Free World","Fine Dining","Spa","Swimming Pool","Prayer Rooms","Medical Center"], transportation: ["Dubai Metro","Taxi","RTA Bus","Rental Cars"] },
      { iata: "SIN", name: "Singapore Changi Airport",                 city: "Singapore",     country: "Singapore",      tz: "Asia/Singapore",      lat: 1.3644,   lon: 103.9915,  facilities: ["Free WiFi","Jewel Waterfall","Cinema","Butterfly Garden","Swimming Pool","Restaurants","Duty Free","Gaming Zones"], transportation: ["MRT Skytrain","Taxi","Grab","Airport Shuttle","Rental Cars"] },
      { iata: "CDG", name: "Charles de Gaulle Airport",                city: "Paris",         country: "France",         tz: "Europe/Paris",        lat: 48.9794,  lon: 2.5330,    facilities: ["Free WiFi","Air France Lounge","French Cuisine","Duty Free","Art Installations","Pharmacy","Nursery","Prayer Room"], transportation: ["RER B Train","Roissy Bus","Taxi","Le Bus Direct","Rental Cars"] },
      { iata: "FRA", name: "Frankfurt Airport",                        city: "Frankfurt",     country: "Germany",        tz: "Europe/Berlin",       lat: 50.0379,  lon: 8.5622,    facilities: ["Free WiFi","Senator Lounge","Beer Garden","Duty Free","Fitness Center","Medical Center","Observation Deck","Kids Area"], transportation: ["S-Bahn","ICE Train","Taxi","Shuttle Bus","Rental Cars"] },
      { iata: "NRT", name: "Narita International Airport",             city: "Tokyo",         country: "Japan",          tz: "Asia/Tokyo",          lat: 35.7647,  lon: 140.3864,  facilities: ["Free WiFi","ANA Lounge","Japanese Restaurants","Duty Free","Capsule Hotel","Onsen","Anime Shop","Prayer Room"], transportation: ["Narita Express","Keisei Skyliner","Taxi","Limousine Bus","Rental Cars"] },
      { iata: "SYD", name: "Sydney Kingsford Smith Airport",           city: "Sydney",        country: "Australia",      tz: "Australia/Sydney",    lat: -33.9399, lon: 151.1753,  facilities: ["Free WiFi","Qantas Club","Australian Restaurants","Duty Free","Newsagency","Medical Center","Baby Care Rooms","Play Area"], transportation: ["Train","Taxi","Uber","Bus","Rental Cars"] },
      { iata: "DEL", name: "Indira Gandhi International Airport",      city: "New Delhi",     country: "India",          tz: "Asia/Kolkata",        lat: 28.5562,  lon: 77.1000,   facilities: ["Free WiFi","Plaza Premium Lounge","Indian Cuisine","Duty Free","Yoga Center","Spa","Prayer Rooms","Medical Center"], transportation: ["Delhi Metro","Taxi","Ola/Uber","Airport Express","Rental Cars"] },
      { iata: "ORD", name: "O'Hare International Airport",             city: "Chicago",       country: "USA",            tz: "America/Chicago",     lat: 41.9742,  lon: -87.9073,  facilities: ["Free WiFi","United Club","Deep Dish Pizza Restaurants","Duty Free","Art Exhibits","Kids Museum","Nursing Rooms","Yoga Studio"], transportation: ["CTA Blue Line","Taxi","Uber/Lyft","Hotel Shuttles","Rental Cars"] },
      { iata: "AMS", name: "Amsterdam Airport Schiphol",               city: "Amsterdam",     country: "Netherlands",    tz: "Europe/Amsterdam",    lat: 52.3105,  lon: 4.7683,    facilities: ["Free WiFi","KLM Crown Lounge","Rijksmuseum Exhibit","Casino","Library","Duty Free","Meditation Room","Pharmacy"], transportation: ["Intercity Train","Taxi","Connexxion Bus","Rental Cars"] },
      { iata: "ICN", name: "Incheon International Airport",            city: "Seoul",         country: "South Korea",    tz: "Asia/Seoul",          lat: 37.4691,  lon: 126.4510,  facilities: ["Free WiFi","Korean Cultural Center","Traditional Spa","Golf Course","Ice Rink","Cinema","Duty Free","Medical Center"], transportation: ["AREX Express","Limousine Bus","Taxi","KTX","Rental Cars"] },
      
      // ===== NEW 30 AIRPORTS =====
      { iata: "HKG", name: "Hong Kong International Airport",          city: "Hong Kong",     country: "Hong Kong",      tz: "Asia/Hong_Kong",      lat: 22.3080,  lon: 113.9185,  facilities: ["Free WiFi","Plaza Premium Lounge","Duty Free","Cantonese Cuisine","IMAX Cinema","Golf Course","Prayer Room","Medical Center"], transportation: ["Airport Express","Taxi","Bus","Ferry","Rental Cars"] },
      { iata: "PVG", name: "Shanghai Pudong International Airport",    city: "Shanghai",      country: "China",          tz: "Asia/Shanghai",       lat: 31.1443,  lon: 121.8083,  facilities: ["Free WiFi","China Eastern Lounge","Duty Free","Chinese Restaurants","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Maglev Train","Metro Line 2","Taxi","Bus","Rental Cars"] },
      { iata: "PEK", name: "Beijing Capital International Airport",    city: "Beijing",       country: "China",          tz: "Asia/Shanghai",       lat: 40.0799,  lon: 116.6031,  facilities: ["Free WiFi","Air China Lounge","Duty Free","Peking Duck Restaurant","Spa","Prayer Room","Medical Center","Business Center"], transportation: ["Airport Express","Taxi","Bus","Rental Cars"] },
      { iata: "BKK", name: "Suvarnabhumi Airport",                     city: "Bangkok",       country: "Thailand",       tz: "Asia/Bangkok",        lat: 13.6900,  lon: 100.7501,  facilities: ["Free WiFi","Thai Airways Lounge","Duty Free","Thai Cuisine","Massage","Prayer Room","Medical Center","Nursery"], transportation: ["Airport Rail Link","Taxi","Bus","Grab","Rental Cars"] },
      { iata: "KUL", name: "Kuala Lumpur International Airport",       city: "Kuala Lumpur",  country: "Malaysia",       tz: "Asia/Kuala_Lumpur",   lat: 2.7456,   lon: 101.7099,  facilities: ["Free WiFi","Malaysia Airlines Lounge","Duty Free","Malaysian Cuisine","Spa","Prayer Room","Medical Center","Kids Area"], transportation: ["KLIA Ekspres","Taxi","Bus","Grab","Rental Cars"] },
      { iata: "CGK", name: "Soekarno-Hatta International Airport",     city: "Jakarta",       country: "Indonesia",      tz: "Asia/Jakarta",        lat: -6.1256,  lon: 106.6558,  facilities: ["Free WiFi","Garuda Lounge","Duty Free","Indonesian Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Airport Train","Taxi","Bus","Grab","Rental Cars"] },
      { iata: "MNL", name: "Ninoy Aquino International Airport",       city: "Manila",        country: "Philippines",    tz: "Asia/Manila",         lat: 14.5086,  lon: 121.0194,  facilities: ["Free WiFi","PAL Lounge","Duty Free","Filipino Cuisine","Massage","Prayer Room","Medical Center","Nursery"], transportation: ["Taxi","Bus","Grab","Jeepney","Rental Cars"] },
      { iata: "HAN", name: "Noi Bai International Airport",            city: "Hanoi",         country: "Vietnam",        tz: "Asia/Ho_Chi_Minh",    lat: 21.2212,  lon: 105.8072,  facilities: ["Free WiFi","Vietnam Airlines Lounge","Duty Free","Pho Restaurant","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Taxi","Bus","Grab","Rental Cars"] },
      { iata: "SGN", name: "Tan Son Nhat International Airport",       city: "Ho Chi Minh City", country: "Vietnam",     tz: "Asia/Ho_Chi_Minh",    lat: 10.8188,  lon: 106.6520,  facilities: ["Free WiFi","Vietnam Airlines Lounge","Duty Free","Vietnamese Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Taxi","Bus","Grab","Rental Cars"] },
      { iata: "BOM", name: "Chhatrapati Shivaji Maharaj International Airport", city: "Mumbai", country: "India",      tz: "Asia/Kolkata",        lat: 19.0896,  lon: 72.8656,   facilities: ["Free WiFi","GVK Lounge","Duty Free","Indian Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Metro","Taxi","Ola/Uber","Bus","Rental Cars"] },
      { iata: "BLR", name: "Kempegowda International Airport",         city: "Bangalore",     country: "India",          tz: "Asia/Kolkata",        lat: 13.1986,  lon: 77.7066,   facilities: ["Free WiFi","Plaza Premium Lounge","Duty Free","South Indian Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Airport Bus","Taxi","Ola/Uber","Rental Cars"] },
      { iata: "MAA", name: "Chennai International Airport",            city: "Chennai",       country: "India",          tz: "Asia/Kolkata",        lat: 12.9941,  lon: 80.1709,   facilities: ["Free WiFi","Plaza Premium Lounge","Duty Free","South Indian Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Metro","Taxi","Ola/Uber","Bus","Rental Cars"] },
      { iata: "HYD", name: "Rajiv Gandhi International Airport",       city: "Hyderabad",     country: "India",          tz: "Asia/Kolkata",        lat: 17.2403,  lon: 78.4294,   facilities: ["Free WiFi","Plaza Premium Lounge","Duty Free","Hyderabadi Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Airport Bus","Taxi","Ola/Uber","Rental Cars"] },
      { iata: "CCU", name: "Netaji Subhas Chandra Bose International Airport", city: "Kolkata", country: "India",      tz: "Asia/Kolkata",        lat: 22.6547,  lon: 88.4467,   facilities: ["Free WiFi","Plaza Premium Lounge","Duty Free","Bengali Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Taxi","Ola/Uber","Bus","Rental Cars"] },
      { iata: "CMB", name: "Bandaranaike International Airport",       city: "Colombo",       country: "Sri Lanka",      tz: "Asia/Colombo",        lat: 7.1808,   lon: 79.8841,   facilities: ["Free WiFi","SriLankan Lounge","Duty Free","Sri Lankan Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Taxi","Bus","PickMe","Rental Cars"] },
      { iata: "KTM", name: "Tribhuvan International Airport",          city: "Kathmandu",     country: "Nepal",          tz: "Asia/Kathmandu",      lat: 27.6966,  lon: 85.3591,   facilities: ["Free WiFi","Nepal Airlines Lounge","Duty Free","Nepali Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Taxi","Bus","Rental Cars"] },
      { iata: "DAC", name: "Hazrat Shahjalal International Airport",   city: "Dhaka",         country: "Bangladesh",     tz: "Asia/Dhaka",          lat: 23.8433,  lon: 90.3978,   facilities: ["Free WiFi","Biman Lounge","Duty Free","Bengali Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Taxi","Bus","CNG","Rental Cars"] },
      { iata: "IST", name: "Istanbul Airport",                         city: "Istanbul",      country: "Turkey",         tz: "Europe/Istanbul",     lat: 41.2753,  lon: 28.7519,   facilities: ["Free WiFi","Turkish Airlines Lounge","Duty Free","Turkish Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Metro","Taxi","Bus","Havaist","Rental Cars"] },
      { iata: "SVO", name: "Sheremetyevo International Airport",       city: "Moscow",        country: "Russia",         tz: "Europe/Moscow",       lat: 55.9736,  lon: 37.4125,   facilities: ["Free WiFi","Aeroflot Lounge","Duty Free","Russian Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Aeroexpress","Taxi","Bus","Rental Cars"] },
      { iata: "FCO", name: "Leonardo da Vinci–Fiumicino Airport",      city: "Rome",          country: "Italy",          tz: "Europe/Rome",         lat: 41.8003,  lon: 12.2389,   facilities: ["Free WiFi","Alitalia Lounge","Duty Free","Italian Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Leonardo Express","Taxi","Bus","Rental Cars"] },
      { iata: "MAD", name: "Adolfo Suárez Madrid–Barajas Airport",     city: "Madrid",        country: "Spain",          tz: "Europe/Madrid",       lat: 40.4936,  lon: -3.5668,   facilities: ["Free WiFi","Iberia Lounge","Duty Free","Spanish Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Metro","Taxi","Bus","Cercanías","Rental Cars"] },
      { iata: "BCN", name: "Josep Tarradellas Barcelona–El Prat Airport", city: "Barcelona",  country: "Spain",          tz: "Europe/Madrid",       lat: 41.2974,  lon: 2.0833,    facilities: ["Free WiFi","Iberia Lounge","Duty Free","Catalan Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Metro","Taxi","Bus","Rental Cars"] },
      { iata: "LIS", name: "Humberto Delgado Airport",                 city: "Lisbon",        country: "Portugal",       tz: "Europe/Lisbon",       lat: 38.7742,  lon: -9.1342,   facilities: ["Free WiFi","TAP Lounge","Duty Free","Portuguese Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Metro","Taxi","Bus","Rental Cars"] },
      { iata: "ATH", name: "Athens International Airport",             city: "Athens",        country: "Greece",         tz: "Europe/Athens",       lat: 37.9364,  lon: 23.9445,   facilities: ["Free WiFi","Aegean Lounge","Duty Free","Greek Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Metro","Taxi","Bus","Rental Cars"] },
      { iata: "ZRH", name: "Zurich Airport",                           city: "Zurich",        country: "Switzerland",    tz: "Europe/Zurich",       lat: 47.4647,  lon: 8.5492,    facilities: ["Free WiFi","SWISS Lounge","Duty Free","Swiss Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Train","Taxi","Bus","Rental Cars"] },
      { iata: "VIE", name: "Vienna International Airport",             city: "Vienna",        country: "Austria",        tz: "Europe/Vienna",       lat: 48.1103,  lon: 16.5697,   facilities: ["Free WiFi","Austrian Lounge","Duty Free","Austrian Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Train","Taxi","Bus","Rental Cars"] },
      { iata: "CPH", name: "Copenhagen Airport",                       city: "Copenhagen",    country: "Denmark",        tz: "Europe/Copenhagen",   lat: 55.6180,  lon: 12.6508,   facilities: ["Free WiFi","SAS Lounge","Duty Free","Danish Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Metro","Train","Taxi","Bus","Rental Cars"] },
      { iata: "ARN", name: "Stockholm Arlanda Airport",                city: "Stockholm",     country: "Sweden",         tz: "Europe/Stockholm",    lat: 59.6519,  lon: 17.9186,   facilities: ["Free WiFi","SAS Lounge","Duty Free","Swedish Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Arlanda Express","Taxi","Bus","Rental Cars"] },
      { iata: "OSL", name: "Oslo Airport, Gardermoen",                 city: "Oslo",          country: "Norway",         tz: "Europe/Oslo",         lat: 60.1976,  lon: 11.1004,   facilities: ["Free WiFi","SAS Lounge","Duty Free","Norwegian Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Flytoget","Taxi","Bus","Rental Cars"] },
      { iata: "HEL", name: "Helsinki Airport",                         city: "Helsinki",      country: "Finland",        tz: "Europe/Helsinki",     lat: 60.3172,  lon: 24.9633,   facilities: ["Free WiFi","Finnair Lounge","Duty Free","Finnish Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Train","Taxi","Bus","Rental Cars"] },
      { iata: "DUB", name: "Dublin Airport",                           city: "Dublin",        country: "Ireland",        tz: "Europe/Dublin",       lat: 53.4213,  lon: -6.2701,   facilities: ["Free WiFi","Aer Lingus Lounge","Duty Free","Irish Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Taxi","Bus","Rental Cars"] },
      { iata: "EDI", name: "Edinburgh Airport",                        city: "Edinburgh",     country: "United Kingdom", tz: "Europe/London",       lat: 55.9500,  lon: -3.3725,   facilities: ["Free WiFi","BA Lounge","Duty Free","Scottish Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Tram","Taxi","Bus","Rental Cars"] },
      { iata: "MAN", name: "Manchester Airport",                       city: "Manchester",    country: "United Kingdom", tz: "Europe/London",       lat: 53.3537,  lon: -2.2750,   facilities: ["Free WiFi","BA Lounge","Duty Free","British Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Train","Taxi","Bus","Rental Cars"] },
      { iata: "GLA", name: "Glasgow Airport",                          city: "Glasgow",       country: "United Kingdom", tz: "Europe/London",       lat: 55.8719,  lon: -4.4331,   facilities: ["Free WiFi","BA Lounge","Duty Free","Scottish Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Taxi","Bus","Rental Cars"] },
      { iata: "BRU", name: "Brussels Airport",                         city: "Brussels",      country: "Belgium",        tz: "Europe/Brussels",     lat: 50.9014,  lon: 4.4844,    facilities: ["Free WiFi","Brussels Airlines Lounge","Duty Free","Belgian Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Train","Taxi","Bus","Rental Cars"] },
      { iata: "MUC", name: "Munich Airport",                           city: "Munich",        country: "Germany",        tz: "Europe/Berlin",       lat: 48.3538,  lon: 11.7861,   facilities: ["Free WiFi","Lufthansa Lounge","Duty Free","Bavarian Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["S-Bahn","Taxi","Bus","Rental Cars"] },
      { iata: "DUS", name: "Düsseldorf Airport",                       city: "Düsseldorf",    country: "Germany",        tz: "Europe/Berlin",       lat: 51.2895,  lon: 6.7668,    facilities: ["Free WiFi","Lufthansa Lounge","Duty Free","German Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["S-Bahn","Taxi","Bus","Rental Cars"] },
      { iata: "HAM", name: "Hamburg Airport",                          city: "Hamburg",       country: "Germany",        tz: "Europe/Berlin",       lat: 53.6304,  lon: 9.9882,    facilities: ["Free WiFi","Lufthansa Lounge","Duty Free","German Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["S-Bahn","Taxi","Bus","Rental Cars"] },
      { iata: "BER", name: "Berlin Brandenburg Airport",               city: "Berlin",        country: "Germany",        tz: "Europe/Berlin",       lat: 52.3667,  lon: 13.5033,   facilities: ["Free WiFi","Lufthansa Lounge","Duty Free","German Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Train","Taxi","Bus","Rental Cars"] },
      { iata: "PRG", name: "Václav Havel Airport Prague",              city: "Prague",        country: "Czech Republic", tz: "Europe/Prague",       lat: 50.1008,  lon: 14.2600,   facilities: ["Free WiFi","Czech Airlines Lounge","Duty Free","Czech Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Taxi","Bus","Rental Cars"] },
      { iata: "WAW", name: "Warsaw Chopin Airport",                    city: "Warsaw",        country: "Poland",         tz: "Europe/Warsaw",       lat: 52.1657,  lon: 20.9671,   facilities: ["Free WiFi","LOT Lounge","Duty Free","Polish Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Taxi","Bus","Rental Cars"] },
      { iata: "BUD", name: "Budapest Ferenc Liszt International Airport", city: "Budapest",   country: "Hungary",        tz: "Europe/Budapest",     lat: 47.4369,  lon: 19.2556,   facilities: ["Free WiFi","Wizz Lounge","Duty Free","Hungarian Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Taxi","Bus","Rental Cars"] },
      { iata: "OTP", name: "Henri Coandă International Airport",       city: "Bucharest",     country: "Romania",        tz: "Europe/Bucharest",    lat: 44.5711,  lon: 26.0850,   facilities: ["Free WiFi","TAROM Lounge","Duty Free","Romanian Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Taxi","Bus","Rental Cars"] },
      { iata: "SOF", name: "Sofia Airport",                           city: "Sofia",         country: "Bulgaria",       tz: "Europe/Sofia",        lat: 42.6967,  lon: 23.4114,   facilities: ["Free WiFi","Bulgaria Air Lounge","Duty Free","Bulgarian Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Metro","Taxi","Bus","Rental Cars"] },
      { iata: "SKG", name: "Thessaloniki Airport",                     city: "Thessaloniki",  country: "Greece",         tz: "Europe/Athens",       lat: 40.5197,  lon: 22.9709,   facilities: ["Free WiFi","Aegean Lounge","Duty Free","Greek Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Taxi","Bus","Rental Cars"] },
      { iata: "HER", name: "Heraklion International Airport",          city: "Heraklion",     country: "Greece",         tz: "Europe/Athens",       lat: 35.3397,  lon: 25.1803,   facilities: ["Free WiFi","Aegean Lounge","Duty Free","Cretan Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Taxi","Bus","Rental Cars"] },
      { iata: "PMI", name: "Palma de Mallorca Airport",                city: "Palma",         country: "Spain",          tz: "Europe/Madrid",       lat: 39.5517,  lon: 2.7388,    facilities: ["Free WiFi","Iberia Lounge","Duty Free","Spanish Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Taxi","Bus","Rental Cars"] },
      { iata: "AGP", name: "Málaga Airport",                           city: "Málaga",        country: "Spain",          tz: "Europe/Madrid",       lat: 36.6749,  lon: -4.4991,   facilities: ["Free WiFi","Iberia Lounge","Duty Free","Spanish Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Train","Taxi","Bus","Rental Cars"] },
      { iata: "VLC", name: "Valencia Airport",                         city: "Valencia",      country: "Spain",          tz: "Europe/Madrid",       lat: 39.4893,  lon: -0.4816,   facilities: ["Free WiFi","Iberia Lounge","Duty Free","Spanish Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Metro","Taxi","Bus","Rental Cars"] },
      { iata: "SVQ", name: "Seville Airport",                          city: "Seville",       country: "Spain",          tz: "Europe/Madrid",       lat: 37.4180,  lon: -5.8931,   facilities: ["Free WiFi","Iberia Lounge","Duty Free","Spanish Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Taxi","Bus","Rental Cars"] },
      { iata: "BIO", name: "Bilbao Airport",                           city: "Bilbao",        country: "Spain",          tz: "Europe/Madrid",       lat: 43.3011,  lon: -2.9106,   facilities: ["Free WiFi","Iberia Lounge","Duty Free","Basque Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Taxi","Bus","Rental Cars"] },
      { iata: "OPO", name: "Francisco Sá Carneiro Airport",            city: "Porto",         country: "Portugal",       tz: "Europe/Lisbon",       lat: 41.2481,  lon: -8.6814,   facilities: ["Free WiFi","TAP Lounge","Duty Free","Portuguese Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Metro","Taxi","Bus","Rental Cars"] },
      { iata: "FAO", name: "Faro Airport",                            city: "Faro",          country: "Portugal",       tz: "Europe/Lisbon",       lat: 37.0144,  lon: -7.9659,   facilities: ["Free WiFi","TAP Lounge","Duty Free","Portuguese Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Taxi","Bus","Rental Cars"] },
      { iata: "LPA", name: "Gran Canaria Airport",                     city: "Las Palmas",    country: "Spain",          tz: "Atlantic/Canary",     lat: 27.9319,  lon: -15.3866,  facilities: ["Free WiFi","Iberia Lounge","Duty Free","Canarian Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Taxi","Bus","Rental Cars"] },
      { iata: "TFS", name: "Tenerife South Airport",                   city: "Tenerife",      country: "Spain",          tz: "Atlantic/Canary",     lat: 28.0445,  lon: -16.5725,  facilities: ["Free WiFi","Iberia Lounge","Duty Free","Canarian Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Taxi","Bus","Rental Cars"] },
      { iata: "ACE", name: "Lanzarote Airport",                        city: "Lanzarote",     country: "Spain",          tz: "Atlantic/Canary",     lat: 28.9455,  lon: -13.6052,  facilities: ["Free WiFi","Iberia Lounge","Duty Free","Canarian Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Taxi","Bus","Rental Cars"] },
      { iata: "FUE", name: "Fuerteventura Airport",                    city: "Fuerteventura", country: "Spain",          tz: "Atlantic/Canary",     lat: 28.4527,  lon: -13.8638,  facilities: ["Free WiFi","Iberia Lounge","Duty Free","Canarian Cuisine","Spa","Prayer Room","Medical Center","Nursery"], transportation: ["Taxi","Bus","Rental Cars"] },
    ];

    const airportIds: Record<string, string> = {};
    for (const a of airports) {
      const res = await client.query(
        `INSERT INTO airports (iata_code, name, city, country, timezone, latitude, longitude, facilities, transportation, security_info)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (iata_code) DO UPDATE SET name = EXCLUDED.name, latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, facilities = EXCLUDED.facilities
         RETURNING id`,
        [a.iata, a.name, a.city, a.country, a.tz, a.lat, a.lon,
          JSON.stringify(a.facilities),
          JSON.stringify(a.transportation),
          JSON.stringify({ standardWaitMinutes: 20, recommendedArrivalHours: 3 })]
      );
      airportIds[a.iata] = res.rows[0].id;
    }
    console.log(`[seed] ${airports.length} airports seeded.`);

    // --- Terminals for each airport ---
    const terminalDefs: Record<string, { code: string; name: string }[]> = {
      // Original 13
      JFK: [{ code: "T1", name: "Terminal 1" }, { code: "T4", name: "Terminal 4 (Main)" }, { code: "T8", name: "Terminal 8 (American)" }],
      LAX: [{ code: "T1", name: "Terminal 1" }, { code: "T3", name: "Terminal 3" }, { code: "TBIT", name: "Tom Bradley International" }],
      LHR: [{ code: "T2", name: "Terminal 2 (The Queen's)" }, { code: "T3", name: "Terminal 3" }, { code: "T5", name: "Terminal 5 (British Airways)" }],
      DXB: [{ code: "T1", name: "Terminal 1" }, { code: "T3", name: "Terminal 3 (Emirates)" }],
      SIN: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }, { code: "T3", name: "Terminal 3" }],
      CDG: [{ code: "T1", name: "Terminal 1" }, { code: "T2E", name: "Terminal 2E" }, { code: "T2F", name: "Terminal 2F" }],
      FRA: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }],
      NRT: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }],
      SYD: [{ code: "T1", name: "International Terminal" }, { code: "T2", name: "Domestic Terminal" }],
      DEL: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }, { code: "T3", name: "Terminal 3 (IGI)" }],
      ORD: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }, { code: "T3", name: "Terminal 3 (International)" }],
      AMS: [{ code: "T1", name: "Departure Hall 1" }, { code: "T2", name: "Departure Hall 2" }, { code: "T3", name: "Departure Hall 3" }],
      ICN: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2 (New)" }],
      // New 30
      HKG: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }],
      PVG: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }],
      PEK: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }, { code: "T3", name: "Terminal 3" }],
      BKK: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }],
      KUL: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }],
      CGK: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }, { code: "T3", name: "Terminal 3" }],
      MNL: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }, { code: "T3", name: "Terminal 3" }],
      HAN: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }],
      SGN: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }],
      BOM: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }],
      BLR: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }],
      MAA: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }],
      HYD: [{ code: "T1", name: "Terminal 1" }],
      CCU: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }],
      CMB: [{ code: "T1", name: "Terminal 1" }],
      KTM: [{ code: "T1", name: "Terminal 1" }],
      DAC: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }],
      IST: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }],
      SVO: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }],
      FCO: [{ code: "T1", name: "Terminal 1" }, { code: "T3", name: "Terminal 3" }],
      MAD: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }, { code: "T4", name: "Terminal 4" }],
      BCN: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }],
      LIS: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }],
      ATH: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }],
      ZRH: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }],
      VIE: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }, { code: "T3", name: "Terminal 3" }],
      CPH: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }, { code: "T3", name: "Terminal 3" }],
      ARN: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }, { code: "T5", name: "Terminal 5" }],
      OSL: [{ code: "T1", name: "Terminal 1" }],
      HEL: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }],
      DUB: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }],
      EDI: [{ code: "T1", name: "Terminal 1" }],
      MAN: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }],
      GLA: [{ code: "T1", name: "Terminal 1" }],
      BRU: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }],
      MUC: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }],
      DUS: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }],
      HAM: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }],
      BER: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }],
      PRG: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }, { code: "T3", name: "Terminal 3" }],
      WAW: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }],
      BUD: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }],
      OTP: [{ code: "T1", name: "Terminal 1" }],
      SOF: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }],
      SKG: [{ code: "T1", name: "Terminal 1" }],
      HER: [{ code: "T1", name: "Terminal 1" }],
      PMI: [{ code: "T1", name: "Terminal 1" }],
      AGP: [{ code: "T1", name: "Terminal 1" }, { code: "T2", name: "Terminal 2" }],
      VLC: [{ code: "T1", name: "Terminal 1" }],
      SVQ: [{ code: "T1", name: "Terminal 1" }],
      BIO: [{ code: "T1", name: "Terminal 1" }],
      OPO: [{ code: "T1", name: "Terminal 1" }],
      FAO: [{ code: "T1", name: "Terminal 1" }],
      LPA: [{ code: "T1", name: "Terminal 1" }],
      TFS: [{ code: "T1", name: "Terminal 1" }],
      ACE: [{ code: "T1", name: "Terminal 1" }],
      FUE: [{ code: "T1", name: "Terminal 1" }],
    };

    const terminalIds: Record<string, Record<string, string>> = {};
    for (const [iata, terms] of Object.entries(terminalDefs)) {
      terminalIds[iata] = {};
      for (const t of terms) {
        const res = await client.query(
          `INSERT INTO terminals (airport_id, code, name, congestion_level)
           VALUES ($1,$2,$3,'MODERATE')
           ON CONFLICT (airport_id, code) DO UPDATE SET name = EXCLUDED.name
           RETURNING id`,
          [airportIds[iata], t.code, t.name]
        );
        terminalIds[iata][t.code] = res.rows[0].id;
      }
    }
    console.log("[seed] Terminals seeded.");

    // --- Gates for each terminal ---
    const gatesByAirport: Record<string, { terminal: string; gates: string[] }[]> = {
      // Original 13
      JFK:  [{ terminal: "T1", gates: ["A1","A2","A3","B1","B2"] }, { terminal: "T4", gates: ["A10","A11","A12","B5","B6","B7"] }, { terminal: "T8", gates: ["10","11","12","13","30","31"] }],
      LAX:  [{ terminal: "T1", gates: ["1","2","3","4","5"] }, { terminal: "T3", gates: ["30","31","32","33"] }, { terminal: "TBIT", gates: ["B1","B2","B3","B4","B5","B6"] }],
      LHR:  [{ terminal: "T2", gates: ["A1","A2","A3","B40","B41"] }, { terminal: "T3", gates: ["10","11","12","13","14"] }, { terminal: "T5", gates: ["A1","A2","A3","B30","B31","B32"] }],
      DXB:  [{ terminal: "T1", gates: ["A1","A2","A3","B1","B2","B3"] }, { terminal: "T3", gates: ["C1","C2","C3","D1","D2","D3"] }],
      SIN:  [{ terminal: "T1", gates: ["A1","A2","B1","B2","B3"] }, { terminal: "T2", gates: ["C1","C2","D1","D2"] }, { terminal: "T3", gates: ["E1","E2","E3","F1","F2"] }],
      CDG:  [{ terminal: "T1", gates: ["K1","K2","K3","L1","L2"] }, { terminal: "T2E", gates: ["E1","E2","E3","E4"] }, { terminal: "T2F", gates: ["F1","F2","F3","F4"] }],
      FRA:  [{ terminal: "T1", gates: ["A1","A2","B1","B2","B3"] }, { terminal: "T2", gates: ["D1","D2","D3","E1","E2"] }],
      NRT:  [{ terminal: "T1", gates: ["21","22","31","32","33"] }, { terminal: "T2", gates: ["51","52","53","61","62"] }],
      SYD:  [{ terminal: "T1", gates: ["1","2","3","4","5","6"] }, { terminal: "T2", gates: ["20","21","22","23"] }],
      DEL:  [{ terminal: "T1", gates: ["1","2","3","4"] }, { terminal: "T2", gates: ["10","11","12"] }, { terminal: "T3", gates: ["20","21","22","23","24","25"] }],
      ORD:  [{ terminal: "T1", gates: ["B1","B2","B3","C1","C2"] }, { terminal: "T2", gates: ["E1","E2","E3","F1","F2"] }, { terminal: "T3", gates: ["H1","H2","K1","K2","L1"] }],
      AMS:  [{ terminal: "T1", gates: ["D1","D2","D3","D4"] }, { terminal: "T2", gates: ["E1","E2","E3","F1","F2"] }, { terminal: "T3", gates: ["G1","G2","G3","G4"] }],
      ICN:  [{ terminal: "T1", gates: ["10","11","12","13","20","21"] }, { terminal: "T2", gates: ["230","231","232","233","234"] }],
      // New 30
      HKG:  [{ terminal: "T1", gates: ["1","2","3","4","5","6"] }, { terminal: "T2", gates: ["10","11","12","13"] }],
      PVG:  [{ terminal: "T1", gates: ["A1","A2","A3","A4"] }, { terminal: "T2", gates: ["B1","B2","B3","B4"] }],
      PEK:  [{ terminal: "T1", gates: ["1","2","3"] }, { terminal: "T2", gates: ["10","11","12"] }, { terminal: "T3", gates: ["20","21","22","23"] }],
      BKK:  [{ terminal: "T1", gates: ["A1","A2","A3"] }, { terminal: "T2", gates: ["B1","B2","B3"] }],
      KUL:  [{ terminal: "T1", gates: ["A1","A2","A3"] }, { terminal: "T2", gates: ["B1","B2","B3"] }],
      CGK:  [{ terminal: "T1", gates: ["A1","A2","A3"] }, { terminal: "T2", gates: ["B1","B2","B3"] }, { terminal: "T3", gates: ["C1","C2","C3"] }],
      MNL:  [{ terminal: "T1", gates: ["1","2","3"] }, { terminal: "T2", gates: ["10","11","12"] }, { terminal: "T3", gates: ["20","21","22"] }],
      HAN:  [{ terminal: "T1", gates: ["A1","A2","A3"] }, { terminal: "T2", gates: ["B1","B2","B3"] }],
      SGN:  [{ terminal: "T1", gates: ["A1","A2","A3"] }, { terminal: "T2", gates: ["B1","B2","B3"] }],
      BOM:  [{ terminal: "T1", gates: ["1","2","3"] }, { terminal: "T2", gates: ["10","11","12"] }],
      BLR:  [{ terminal: "T1", gates: ["1","2","3"] }, { terminal: "T2", gates: ["10","11","12"] }],
      MAA:  [{ terminal: "T1", gates: ["1","2","3"] }, { terminal: "T2", gates: ["10","11","12"] }],
      HYD:  [{ terminal: "T1", gates: ["1","2","3"] }],
      CCU:  [{ terminal: "T1", gates: ["1","2","3"] }, { terminal: "T2", gates: ["10","11","12"] }],
      CMB:  [{ terminal: "T1", gates: ["1","2","3"] }],
      KTM:  [{ terminal: "T1", gates: ["1","2","3"] }],
      DAC:  [{ terminal: "T1", gates: ["1","2","3"] }, { terminal: "T2", gates: ["10","11","12"] }],
      IST:  [{ terminal: "T1", gates: ["A1","A2","A3"] }, { terminal: "T2", gates: ["B1","B2","B3"] }],
      SVO:  [{ terminal: "T1", gates: ["A1","A2","A3"] }, { terminal: "T2", gates: ["B1","B2","B3"] }],
      FCO:  [{ terminal: "T1", gates: ["A1","A2","A3"] }, { terminal: "T3", gates: ["B1","B2","B3"] }],
      MAD:  [{ terminal: "T1", gates: ["A1","A2","A3"] }, { terminal: "T2", gates: ["B1","B2","B3"] }, { terminal: "T4", gates: ["C1","C2","C3"] }],
      BCN:  [{ terminal: "T1", gates: ["A1","A2","A3"] }, { terminal: "T2", gates: ["B1","B2","B3"] }],
      LIS:  [{ terminal: "T1", gates: ["A1","A2","A3"] }, { terminal: "T2", gates: ["B1","B2","B3"] }],
      ATH:  [{ terminal: "T1", gates: ["A1","A2","A3"] }, { terminal: "T2", gates: ["B1","B2","B3"] }],
      ZRH:  [{ terminal: "T1", gates: ["A1","A2","A3"] }, { terminal: "T2", gates: ["B1","B2","B3"] }],
      VIE:  [{ terminal: "T1", gates: ["A1","A2","A3"] }, { terminal: "T2", gates: ["B1","B2","B3"] }, { terminal: "T3", gates: ["C1","C2","C3"] }],
      CPH:  [{ terminal: "T1", gates: ["A1","A2","A3"] }, { terminal: "T2", gates: ["B1","B2","B3"] }, { terminal: "T3", gates: ["C1","C2","C3"] }],
      ARN:  [{ terminal: "T1", gates: ["A1","A2","A3"] }, { terminal: "T2", gates: ["B1","B2","B3"] }, { terminal: "T5", gates: ["C1","C2","C3"] }],
      OSL:  [{ terminal: "T1", gates: ["A1","A2","A3"] }],
      HEL:  [{ terminal: "T1", gates: ["A1","A2","A3"] }, { terminal: "T2", gates: ["B1","B2","B3"] }],
      DUB:  [{ terminal: "T1", gates: ["A1","A2","A3"] }, { terminal: "T2", gates: ["B1","B2","B3"] }],
      EDI:  [{ terminal: "T1", gates: ["A1","A2","A3"] }],
      MAN:  [{ terminal: "T1", gates: ["A1","A2","A3"] }, { terminal: "T2", gates: ["B1","B2","B3"] }],
      GLA:  [{ terminal: "T1", gates: ["A1","A2","A3"] }],
      BRU:  [{ terminal: "T1", gates: ["A1","A2","A3"] }, { terminal: "T2", gates: ["B1","B2","B3"] }],
      MUC:  [{ terminal: "T1", gates: ["A1","A2","A3"] }, { terminal: "T2", gates: ["B1","B2","B3"] }],
      DUS:  [{ terminal: "T1", gates: ["A1","A2","A3"] }, { terminal: "T2", gates: ["B1","B2","B3"] }],
      HAM:  [{ terminal: "T1", gates: ["A1","A2","A3"] }, { terminal: "T2", gates: ["B1","B2","B3"] }],
      BER:  [{ terminal: "T1", gates: ["A1","A2","A3"] }, { terminal: "T2", gates: ["B1","B2","B3"] }],
      PRG:  [{ terminal: "T1", gates: ["A1","A2","A3"] }, { terminal: "T2", gates: ["B1","B2","B3"] }, { terminal: "T3", gates: ["C1","C2","C3"] }],
      WAW:  [{ terminal: "T1", gates: ["A1","A2","A3"] }, { terminal: "T2", gates: ["B1","B2","B3"] }],
      BUD:  [{ terminal: "T1", gates: ["A1","A2","A3"] }, { terminal: "T2", gates: ["B1","B2","B3"] }],
      OTP:  [{ terminal: "T1", gates: ["A1","A2","A3"] }],
      SOF:  [{ terminal: "T1", gates: ["A1","A2","A3"] }, { terminal: "T2", gates: ["B1","B2","B3"] }],
      SKG:  [{ terminal: "T1", gates: ["A1","A2","A3"] }],
      HER:  [{ terminal: "T1", gates: ["A1","A2","A3"] }],
      PMI:  [{ terminal: "T1", gates: ["A1","A2","A3"] }],
      AGP:  [{ terminal: "T1", gates: ["A1","A2","A3"] }, { terminal: "T2", gates: ["B1","B2","B3"] }],
      VLC:  [{ terminal: "T1", gates: ["A1","A2","A3"] }],
      SVQ:  [{ terminal: "T1", gates: ["A1","A2","A3"] }],
      BIO:  [{ terminal: "T1", gates: ["A1","A2","A3"] }],
      OPO:  [{ terminal: "T1", gates: ["A1","A2","A3"] }],
      FAO:  [{ terminal: "T1", gates: ["A1","A2","A3"] }],
      LPA:  [{ terminal: "T1", gates: ["A1","A2","A3"] }],
      TFS:  [{ terminal: "T1", gates: ["A1","A2","A3"] }],
      ACE:  [{ terminal: "T1", gates: ["A1","A2","A3"] }],
      FUE:  [{ terminal: "T1", gates: ["A1","A2","A3"] }],
    };

    const gateIds: Record<string, Record<string, Record<string, string>>> = {};
    for (const [iata, termGates] of Object.entries(gatesByAirport)) {
      gateIds[iata] = {};
      for (const { terminal, gates } of termGates) {
        gateIds[iata][terminal] = {};
        for (const g of gates) {
          const res = await client.query(
            `INSERT INTO gates (terminal_id, code, status) VALUES ($1,$2,'AVAILABLE')
             ON CONFLICT (terminal_id, code) DO UPDATE SET status = gates.status RETURNING id`,
            [terminalIds[iata][terminal], g]
          );
          gateIds[iata][terminal][g] = res.rows[0].id;
        }
      }
    }
    console.log("[seed] Gates seeded.");

    // --- Map points for each airport ---
    const mapPointTypes = [
      { type: "CHECKIN",      label: "Check-in Counter Row A",    x: 5,  y: 8 },
      { type: "CHECKIN",      label: "Check-in Counter Row B",    x: 15, y: 8 },
      { type: "SECURITY",     label: "Security Checkpoint 1",     x: 8,  y: 14 },
      { type: "SECURITY",     label: "Security Checkpoint 2",     x: 20, y: 14 },
      { type: "GATE",         label: "Gates A1-A3",               x: 5,  y: 25 },
      { type: "GATE",         label: "Gates B1-B3",               x: 15, y: 25 },
      { type: "GATE",         label: "Gates C1-C2",               x: 25, y: 25 },
      { type: "BAGGAGE_BELT", label: "Baggage Belt 1",            x: 5,  y: 45 },
      { type: "BAGGAGE_BELT", label: "Baggage Belt 2",            x: 15, y: 45 },
      { type: "LOUNGE",       label: "Business Lounge",           x: 25, y: 18 },
      { type: "LOUNGE",       label: "Premium Lounge",            x: 5,  y: 18 },
      { type: "RESTAURANT",   label: "Food Court",                x: 12, y: 20 },
      { type: "RESTAURANT",   label: "Fine Dining Restaurant",    x: 22, y: 20 },
      { type: "RESTAURANT",   label: "Coffee Shop",               x: 8,  y: 30 },
      { type: "SHOP",         label: "Duty Free Store",           x: 18, y: 30 },
      { type: "SHOP",         label: "Newsagent & Books",         x: 10, y: 35 },
      { type: "SHOP",         label: "Fashion Boutique",          x: 22, y: 35 },
      { type: "RESTROOM",     label: "Restrooms Level 1",         x: 6,  y: 40 },
      { type: "RESTROOM",     label: "Restrooms Level 2",         x: 20, y: 40 },
      { type: "INFO_DESK",    label: "Information Desk",          x: 13, y: 5 },
      { type: "TRANSPORT",    label: "Ground Transport Hub",      x: 2,  y: 48 },
      { type: "PARKING",      label: "Parking Garage P1",         x: 2,  y: 3 },
    ];

    for (const [iata, airportId] of Object.entries(airportIds)) {
      const firstTerminalCode = Object.keys(terminalIds[iata])[0];
      const firstTerminalId = terminalIds[iata][firstTerminalCode];
      for (const mp of mapPointTypes) {
        await client.query(
          `INSERT INTO map_points (airport_id, terminal_id, type, label, x, y) VALUES ($1,$2,$3,$4,$5,$6)`,
          [airportId, firstTerminalId, mp.type, mp.label, mp.x, mp.y]
        );
      }
    }
    console.log(`[seed] Map points seeded (${mapPointTypes.length} per airport).`);

    // --- Flights (43 original + 50 new = 93 total) ---
    const inHours = (h: number) => new Date(Date.now() + h * 3600 * 1000);
    const inDays  = (d: number, h = 8) => new Date(Date.now() + d * 86400000 + h * 3600000);

    const flights = [
      // ===== ORIGINAL 43 =====
      { num: "SK101", airline: "SkyPort Air",   aircraft: "Boeing 787-9",    o: "JFK", d: "LHR", dep: inHours(4),    arr: inHours(11),   boarding: inHours(3.3),   status: "CHECK_IN_OPEN", price: 620,  seats: 180 },
      { num: "SK102", airline: "SkyPort Air",   aircraft: "Boeing 787-9",    o: "LHR", d: "JFK", dep: inHours(6),    arr: inHours(14),   boarding: inHours(5.3),   status: "SCHEDULED",     price: 590,  seats: 165 },
      { num: "SK103", airline: "SkyPort Air",   aircraft: "Airbus A321neo",  o: "JFK", d: "ORD", dep: inHours(2),    arr: inHours(4.5),  boarding: inHours(1.3),   status: "BOARDING",      price: 180,  seats: 200 },
      { num: "SK104", airline: "SkyPort Air",   aircraft: "Airbus A321neo",  o: "ORD", d: "JFK", dep: inHours(5),    arr: inHours(7.5),  boarding: inHours(4.3),   status: "SCHEDULED",     price: 190,  seats: 200 },
      { num: "SK105", airline: "SkyPort Air",   aircraft: "Boeing 777-300ER",o: "JFK", d: "DXB", dep: inHours(7),    arr: inHours(19),   boarding: inHours(6.3),   status: "SCHEDULED",     price: 980,  seats: 350 },
      { num: "SK106", airline: "SkyPort Air",   aircraft: "Airbus A380",     o: "DXB", d: "JFK", dep: inDays(1, 2),  arr: inDays(1, 16), boarding: inDays(1, 1.3), status: "SCHEDULED",     price: 1050, seats: 489 },
      { num: "SK201", airline: "SkyPort Air",   aircraft: "Airbus A321neo",  o: "LAX", d: "JFK", dep: inHours(1.5),  arr: inHours(4.5),  boarding: inHours(0.8),   status: "BOARDING",      price: 210,  seats: 180 },
      { num: "SK202", airline: "SkyPort Air",   aircraft: "Boeing 737 MAX",  o: "JFK", d: "LAX", dep: inHours(3),    arr: inHours(6.5),  boarding: inHours(2.3),   status: "CHECK_IN_OPEN", price: 225,  seats: 160 },
      { num: "SK203", airline: "SkyPort Air",   aircraft: "Boeing 787-9",    o: "LAX", d: "NRT", dep: inHours(9),    arr: inHours(19.5), boarding: inHours(8.3),   status: "SCHEDULED",     price: 890,  seats: 250 },
      { num: "SK204", airline: "SkyPort Air",   aircraft: "Boeing 787-9",    o: "NRT", d: "LAX", dep: inDays(1, 10), arr: inDays(1, 4),  boarding: inDays(1, 9.3), status: "SCHEDULED",     price: 870,  seats: 250 },
      { num: "SK205", airline: "SkyPort Air",   aircraft: "Airbus A380",     o: "LAX", d: "SIN", dep: inDays(1, 0),  arr: inDays(1, 20), boarding: inDays(0, 23.3),status: "SCHEDULED",     price: 1200, seats: 500 },
      { num: "SK301", airline: "SkyPort Air",   aircraft: "Airbus A350-900", o: "LHR", d: "DXB", dep: inHours(3),    arr: inHours(10),   boarding: inHours(2.3),   status: "CHECK_IN_OPEN", price: 550,  seats: 300 },
      { num: "SK302", airline: "SkyPort Air",   aircraft: "Boeing 787-9",    o: "LHR", d: "SIN", dep: inHours(5),    arr: inHours(18),   boarding: inHours(4.3),   status: "SCHEDULED",     price: 870,  seats: 250 },
      { num: "SK303", airline: "SkyPort Air",   aircraft: "Airbus A320neo",  o: "LHR", d: "CDG", dep: inHours(1),    arr: inHours(2.5),  boarding: inHours(0.3),   status: "BOARDING",      price: 180,  seats: 180 },
      { num: "SK304", airline: "SkyPort Air",   aircraft: "Airbus A320neo",  o: "CDG", d: "LHR", dep: inHours(4),    arr: inHours(5.5),  boarding: inHours(3.3),   status: "SCHEDULED",     price: 175,  seats: 180 },
      { num: "SK305", airline: "SkyPort Air",   aircraft: "Airbus A380",     o: "LHR", d: "JFK", dep: inDays(1, 6),  arr: inDays(1, 14), boarding: inDays(1, 5.3), status: "SCHEDULED",     price: 720,  seats: 489 },
      { num: "SK401", airline: "SkyPort Air",   aircraft: "Boeing 777-300ER",o: "DXB", d: "SIN", dep: inHours(2),    arr: inHours(9.5),  boarding: inHours(1.3),   status: "GATE_CHANGED",  price: 680,  seats: 350 },
      { num: "SK402", airline: "SkyPort Air",   aircraft: "Airbus A380",     o: "DXB", d: "LHR", dep: inHours(6),    arr: inHours(13),   boarding: inHours(5.3),   status: "SCHEDULED",     price: 820,  seats: 489 },
      { num: "SK403", airline: "SkyPort Air",   aircraft: "Boeing 777-300ER",o: "DXB", d: "DEL", dep: inHours(3),    arr: inHours(6.5),  boarding: inHours(2.3),   status: "CHECK_IN_OPEN", price: 380,  seats: 350 },
      { num: "SK404", airline: "SkyPort Air",   aircraft: "Boeing 777-300ER",o: "DEL", d: "DXB", dep: inHours(8),    arr: inHours(11.5), boarding: inHours(7.3),   status: "SCHEDULED",     price: 360,  seats: 350 },
      { num: "SK501", airline: "SkyPort Air",   aircraft: "Airbus A350-900", o: "SIN", d: "SYD", dep: inHours(5),    arr: inHours(13),   boarding: inHours(4.3),   status: "SCHEDULED",     price: 650,  seats: 300 },
      { num: "SK502", airline: "SkyPort Air",   aircraft: "Boeing 787-9",    o: "SIN", d: "NRT", dep: inHours(7),    arr: inHours(14.5), boarding: inHours(6.3),   status: "DELAYED",       price: 720,  seats: 250 },
      { num: "SK503", airline: "SkyPort Air",   aircraft: "Airbus A380",     o: "SIN", d: "LHR", dep: inDays(1, 1),  arr: inDays(1, 14), boarding: inDays(1, 0.3), status: "SCHEDULED",     price: 1100, seats: 489 },
      { num: "SK601", airline: "SkyPort Air",   aircraft: "Airbus A320neo",  o: "CDG", d: "FRA", dep: inHours(2),    arr: inHours(3),    boarding: inHours(1.3),   status: "BOARDING",      price: 150,  seats: 180 },
      { num: "SK602", airline: "SkyPort Air",   aircraft: "Boeing 787-9",    o: "CDG", d: "JFK", dep: inHours(6),    arr: inHours(14),   boarding: inHours(5.3),   status: "CHECK_IN_OPEN", price: 680,  seats: 250 },
      { num: "SK603", airline: "SkyPort Air",   aircraft: "Airbus A350-900", o: "CDG", d: "DXB", dep: inHours(4),    arr: inHours(11),   boarding: inHours(3.3),   status: "SCHEDULED",     price: 590,  seats: 300 },
      { num: "SK701", airline: "SkyPort Air",   aircraft: "Airbus A320neo",  o: "FRA", d: "LHR", dep: inHours(1.5),  arr: inHours(3),    boarding: inHours(0.8),   status: "BOARDING",      price: 160,  seats: 180 },
      { num: "SK702", airline: "SkyPort Air",   aircraft: "Boeing 777-300ER",o: "FRA", d: "JFK", dep: inHours(5),    arr: inHours(13),   boarding: inHours(4.3),   status: "SCHEDULED",     price: 710,  seats: 350 },
      { num: "SK703", airline: "SkyPort Air",   aircraft: "Airbus A340-600", o: "FRA", d: "SIN", dep: inDays(1, 3),  arr: inDays(1, 15), boarding: inDays(1, 2.3), status: "SCHEDULED",     price: 960,  seats: 250 },
      { num: "SK801", airline: "SkyPort Air",   aircraft: "Boeing 787-9",    o: "NRT", d: "SIN", dep: inHours(4),    arr: inHours(11.5), boarding: inHours(3.3),   status: "CHECK_IN_OPEN", price: 750,  seats: 250 },
      { num: "SK802", airline: "SkyPort Air",   aircraft: "Airbus A380",     o: "NRT", d: "LHR", dep: inHours(8),    arr: inHours(21),   boarding: inHours(7.3),   status: "SCHEDULED",     price: 1150, seats: 489 },
      { num: "SK803", airline: "SkyPort Air",   aircraft: "Boeing 777-300ER",o: "NRT", d: "ICN", dep: inHours(2),    arr: inHours(4),    boarding: inHours(1.3),   status: "BOARDING",      price: 250,  seats: 350 },
      { num: "SK901", airline: "SkyPort Air",   aircraft: "Airbus A380",     o: "SYD", d: "LHR", dep: inHours(7),    arr: inHours(30),   boarding: inHours(6.3),   status: "SCHEDULED",     price: 1450, seats: 489 },
      { num: "SK902", airline: "SkyPort Air",   aircraft: "Boeing 787-9",    o: "SYD", d: "SIN", dep: inHours(5),    arr: inHours(13),   boarding: inHours(4.3),   status: "CHECK_IN_OPEN", price: 690,  seats: 250 },
      { num: "SK1001", airline: "SkyPort Air",  aircraft: "Airbus A321neo",  o: "DEL", d: "LHR", dep: inHours(6),    arr: inHours(15),   boarding: inHours(5.3),   status: "SCHEDULED",     price: 780,  seats: 200 },
      { num: "SK1002", airline: "SkyPort Air",  aircraft: "Boeing 787-9",    o: "DEL", d: "SIN", dep: inHours(4),    arr: inHours(9.5),  boarding: inHours(3.3),   status: "DELAYED",       price: 520,  seats: 250 },
      { num: "SK1101", airline: "SkyPort Air",  aircraft: "Boeing 737 MAX",  o: "ORD", d: "LAX", dep: inHours(3),    arr: inHours(6.5),  boarding: inHours(2.3),   status: "CHECK_IN_OPEN", price: 220,  seats: 160 },
      { num: "SK1102", airline: "SkyPort Air",  aircraft: "Boeing 787-9",    o: "ORD", d: "LHR", dep: inHours(7),    arr: inHours(16),   boarding: inHours(6.3),   status: "SCHEDULED",     price: 680,  seats: 250 },
      { num: "SK1201", airline: "SkyPort Air",  aircraft: "Airbus A320neo",  o: "AMS", d: "LHR", dep: inHours(1),    arr: inHours(2),    boarding: inHours(0.3),   status: "BOARDING",      price: 140,  seats: 180 },
      { num: "SK1202", airline: "SkyPort Air",  aircraft: "Boeing 787-9",    o: "AMS", d: "JFK", dep: inHours(5),    arr: inHours(13),   boarding: inHours(4.3),   status: "SCHEDULED",     price: 650,  seats: 250 },
      { num: "SK1301", airline: "SkyPort Air",  aircraft: "Airbus A380",     o: "ICN", d: "LHR", dep: inHours(6),    arr: inHours(18),   boarding: inHours(5.3),   status: "SCHEDULED",     price: 1050, seats: 489 },
      { num: "SK1302", airline: "SkyPort Air",  aircraft: "Boeing 777-300ER",o: "ICN", d: "SIN", dep: inHours(4),    arr: inHours(9.5),  boarding: inHours(3.3),   status: "CHECK_IN_OPEN", price: 680,  seats: 350 },

      // ===== NEW 50 FLIGHTS =====
      // HKG routes
      { num: "SK1401", airline: "SkyPort Air", aircraft: "Boeing 777-300ER", o: "HKG", d: "SIN", dep: inHours(3), arr: inHours(7), boarding: inHours(2.3), status: "CHECK_IN_OPEN", price: 450, seats: 350 },
      { num: "SK1402", airline: "SkyPort Air", aircraft: "Airbus A350-900", o: "HKG", d: "LHR", dep: inHours(6), arr: inHours(20), boarding: inHours(5.3), status: "SCHEDULED", price: 890, seats: 300 },
      { num: "SK1403", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "HKG", d: "BKK", dep: inHours(2), arr: inHours(4.5), boarding: inHours(1.3), status: "BOARDING", price: 280, seats: 180 },
      // PVG routes
      { num: "SK1501", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "PVG", d: "NRT", dep: inHours(4), arr: inHours(7), boarding: inHours(3.3), status: "CHECK_IN_OPEN", price: 520, seats: 250 },
      { num: "SK1502", airline: "SkyPort Air", aircraft: "Airbus A350-900", o: "PVG", d: "CDG", dep: inHours(8), arr: inHours(20), boarding: inHours(7.3), status: "SCHEDULED", price: 920, seats: 300 },
      // PEK routes
      { num: "SK1601", airline: "SkyPort Air", aircraft: "Boeing 777-300ER", o: "PEK", d: "SIN", dep: inHours(5), arr: inHours(11.5), boarding: inHours(4.3), status: "SCHEDULED", price: 680, seats: 350 },
      { num: "SK1602", airline: "SkyPort Air", aircraft: "Airbus A380", o: "PEK", d: "LHR", dep: inHours(9), arr: inHours(23), boarding: inHours(8.3), status: "SCHEDULED", price: 1100, seats: 489 },
      // BKK routes
      { num: "SK1701", airline: "SkyPort Air", aircraft: "Airbus A350-900", o: "BKK", d: "SYD", dep: inHours(4), arr: inHours(13), boarding: inHours(3.3), status: "CHECK_IN_OPEN", price: 720, seats: 300 },
      { num: "SK1702", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "BKK", d: "DEL", dep: inHours(6), arr: inHours(10), boarding: inHours(5.3), status: "SCHEDULED", price: 380, seats: 250 },
      // KUL routes
      { num: "SK1801", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "KUL", d: "SIN", dep: inHours(2), arr: inHours(3.5), boarding: inHours(1.3), status: "BOARDING", price: 150, seats: 180 },
      { num: "SK1802", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "KUL", d: "HKG", dep: inHours(4), arr: inHours(8), boarding: inHours(3.3), status: "CHECK_IN_OPEN", price: 420, seats: 250 },
      // CGK routes
      { num: "SK1901", airline: "SkyPort Air", aircraft: "Boeing 737 MAX", o: "CGK", d: "SIN", dep: inHours(3), arr: inHours(5.5), boarding: inHours(2.3), status: "SCHEDULED", price: 280, seats: 160 },
      { num: "SK1902", airline: "SkyPort Air", aircraft: "Airbus A330-300", o: "CGK", d: "HKG", dep: inHours(5), arr: inHours(10), boarding: inHours(4.3), status: "SCHEDULED", price: 550, seats: 300 },
      // MNL routes
      { num: "SK2001", airline: "SkyPort Air", aircraft: "Airbus A321neo", o: "MNL", d: "HKG", dep: inHours(2), arr: inHours(4.5), boarding: inHours(1.3), status: "BOARDING", price: 320, seats: 200 },
      { num: "SK2002", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "MNL", d: "NRT", dep: inHours(4), arr: inHours(8.5), boarding: inHours(3.3), status: "CHECK_IN_OPEN", price: 580, seats: 250 },
      // HAN routes
      { num: "SK2101", airline: "SkyPort Air", aircraft: "Airbus A321neo", o: "HAN", d: "SIN", dep: inHours(3), arr: inHours(7), boarding: inHours(2.3), status: "SCHEDULED", price: 350, seats: 200 },
      { num: "SK2102", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "HAN", d: "HKG", dep: inHours(5), arr: inHours(7.5), boarding: inHours(4.3), status: "SCHEDULED", price: 380, seats: 250 },
      // SGN routes
      { num: "SK2201", airline: "SkyPort Air", aircraft: "Airbus A321neo", o: "SGN", d: "BKK", dep: inHours(2), arr: inHours(4), boarding: inHours(1.3), status: "CHECK_IN_OPEN", price: 220, seats: 200 },
      { num: "SK2202", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "SGN", d: "SIN", dep: inHours(4), arr: inHours(6.5), boarding: inHours(3.3), status: "SCHEDULED", price: 260, seats: 250 },
      // BOM routes
      { num: "SK2301", airline: "SkyPort Air", aircraft: "Airbus A350-900", o: "BOM", d: "LHR", dep: inHours(6), arr: inHours(15), boarding: inHours(5.3), status: "SCHEDULED", price: 780, seats: 300 },
      { num: "SK2302", airline: "SkyPort Air", aircraft: "Boeing 777-300ER", o: "BOM", d: "DXB", dep: inHours(3), arr: inHours(5.5), boarding: inHours(2.3), status: "CHECK_IN_OPEN", price: 320, seats: 350 },
      // BLR routes
      { num: "SK2401", airline: "SkyPort Air", aircraft: "Airbus A321neo", o: "BLR", d: "SIN", dep: inHours(4), arr: inHours(8.5), boarding: inHours(3.3), status: "SCHEDULED", price: 420, seats: 200 },
      { num: "SK2402", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "BLR", d: "LHR", dep: inHours(7), arr: inHours(16.5), boarding: inHours(6.3), status: "SCHEDULED", price: 820, seats: 250 },
      // MAA routes
      { num: "SK2501", airline: "SkyPort Air", aircraft: "Airbus A321neo", o: "MAA", d: "CMB", dep: inHours(2), arr: inHours(3.5), boarding: inHours(1.3), status: "BOARDING", price: 180, seats: 200 },
      { num: "SK2502", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "MAA", d: "SIN", dep: inHours(5), arr: inHours(9.5), boarding: inHours(4.3), status: "SCHEDULED", price: 450, seats: 250 },
      // HYD routes
      { num: "SK2601", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "HYD", d: "DXB", dep: inHours(3), arr: inHours(6), boarding: inHours(2.3), status: "CHECK_IN_OPEN", price: 350, seats: 180 },
      { num: "SK2602", airline: "SkyPort Air", aircraft: "Boeing 737 MAX", o: "HYD", d: "BOM", dep: inHours(1), arr: inHours(2.5), boarding: inHours(0.3), status: "BOARDING", price: 120, seats: 160 },
      // CCU routes
      { num: "SK2701", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "CCU", d: "BKK", dep: inHours(4), arr: inHours(6.5), boarding: inHours(3.3), status: "SCHEDULED", price: 280, seats: 180 },
      { num: "SK2702", airline: "SkyPort Air", aircraft: "Boeing 737 MAX", o: "CCU", d: "DEL", dep: inHours(2), arr: inHours(4), boarding: inHours(1.3), status: "CHECK_IN_OPEN", price: 150, seats: 160 },
      // CMB routes
      { num: "SK2801", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "CMB", d: "MAA", dep: inHours(3), arr: inHours(4.5), boarding: inHours(2.3), status: "SCHEDULED", price: 180, seats: 180 },
      { num: "SK2802", airline: "SkyPort Air", aircraft: "Airbus A321neo", o: "CMB", d: "SIN", dep: inHours(5), arr: inHours(9), boarding: inHours(4.3), status: "SCHEDULED", price: 420, seats: 200 },
      // KTM routes
      { num: "SK2901", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "KTM", d: "DEL", dep: inHours(2), arr: inHours(4), boarding: inHours(1.3), status: "BOARDING", price: 220, seats: 180 },
      { num: "SK2902", airline: "SkyPort Air", aircraft: "Boeing 737 MAX", o: "KTM", d: "BKK", dep: inHours(5), arr: inHours(8), boarding: inHours(4.3), status: "SCHEDULED", price: 350, seats: 160 },
      // DAC routes
      { num: "SK3001", airline: "SkyPort Air", aircraft: "Airbus A321neo", o: "DAC", d: "CCU", dep: inHours(2), arr: inHours(3.5), boarding: inHours(1.3), status: "CHECK_IN_OPEN", price: 160, seats: 200 },
      { num: "SK3002", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "DAC", d: "DXB", dep: inHours(6), arr: inHours(10), boarding: inHours(5.3), status: "SCHEDULED", price: 450, seats: 250 },
      // IST routes
      { num: "SK3101", airline: "SkyPort Air", aircraft: "Airbus A350-900", o: "IST", d: "LHR", dep: inHours(4), arr: inHours(8), boarding: inHours(3.3), status: "CHECK_IN_OPEN", price: 380, seats: 300 },
      { num: "SK3102", airline: "SkyPort Air", aircraft: "Boeing 777-300ER", o: "IST", d: "JFK", dep: inHours(8), arr: inHours(18), boarding: inHours(7.3), status: "SCHEDULED", price: 850, seats: 350 },
      { num: "SK3103", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "IST", d: "FCO", dep: inHours(2), arr: inHours(4), boarding: inHours(1.3), status: "BOARDING", price: 220, seats: 180 },
      // SVO routes
      { num: "SK3201", airline: "SkyPort Air", aircraft: "Boeing 777-300ER", o: "SVO", d: "LHR", dep: inHours(5), arr: inHours(9.5), boarding: inHours(4.3), status: "SCHEDULED", price: 480, seats: 350 },
      { num: "SK3202", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "SVO", d: "BER", dep: inHours(3), arr: inHours(5.5), boarding: inHours(2.3), status: "CHECK_IN_OPEN", price: 250, seats: 180 },
      // FCO routes
      { num: "SK3301", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "FCO", d: "CDG", dep: inHours(2), arr: inHours(4), boarding: inHours(1.3), status: "BOARDING", price: 180, seats: 180 },
      { num: "SK3302", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "FCO", d: "DXB", dep: inHours(6), arr: inHours(13), boarding: inHours(5.3), status: "SCHEDULED", price: 620, seats: 250 },
      // MAD routes
      { num: "SK3401", airline: "SkyPort Air", aircraft: "Airbus A350-900", o: "MAD", d: "LHR", dep: inHours(3), arr: inHours(5.5), boarding: inHours(2.3), status: "CHECK_IN_OPEN", price: 280, seats: 300 },
      { num: "SK3402", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "MAD", d: "JFK", dep: inHours(7), arr: inHours(15), boarding: inHours(6.3), status: "SCHEDULED", price: 680, seats: 250 },
      // BCN routes
      { num: "SK3501", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "BCN", d: "CDG", dep: inHours(2), arr: inHours(4), boarding: inHours(1.3), status: "BOARDING", price: 160, seats: 180 },
      { num: "SK3502", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "BCN", d: "LHR", dep: inHours(5), arr: inHours(7.5), boarding: inHours(4.3), status: "SCHEDULED", price: 250, seats: 250 },
      // LIS routes
      { num: "SK3601", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "LIS", d: "MAD", dep: inHours(2), arr: inHours(3.5), boarding: inHours(1.3), status: "CHECK_IN_OPEN", price: 140, seats: 180 },
      { num: "SK3602", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "LIS", d: "LHR", dep: inHours(6), arr: inHours(8.5), boarding: inHours(5.3), status: "SCHEDULED", price: 260, seats: 250 },
      // ATH routes
      { num: "SK3701", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "ATH", d: "IST", dep: inHours(3), arr: inHours(5), boarding: inHours(2.3), status: "SCHEDULED", price: 200, seats: 180 },
      { num: "SK3702", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "ATH", d: "LHR", dep: inHours(5), arr: inHours(9), boarding: inHours(4.3), status: "CHECK_IN_OPEN", price: 320, seats: 250 },
      // ZRH routes
      { num: "SK3801", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "ZRH", d: "CDG", dep: inHours(2), arr: inHours(3.5), boarding: inHours(1.3), status: "BOARDING", price: 180, seats: 180 },
      { num: "SK3802", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "ZRH", d: "JFK", dep: inHours(7), arr: inHours(15), boarding: inHours(6.3), status: "SCHEDULED", price: 720, seats: 250 },
      // VIE routes
      { num: "SK3901", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "VIE", d: "FRA", dep: inHours(2), arr: inHours(3.5), boarding: inHours(1.3), status: "CHECK_IN_OPEN", price: 160, seats: 180 },
      { num: "SK3902", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "VIE", d: "LHR", dep: inHours(5), arr: inHours(7.5), boarding: inHours(4.3), status: "SCHEDULED", price: 240, seats: 250 },
      // CPH routes
      { num: "SK4001", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "CPH", d: "ARN", dep: inHours(1.5), arr: inHours(3), boarding: inHours(0.8), status: "BOARDING", price: 130, seats: 180 },
      { num: "SK4002", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "CPH", d: "LHR", dep: inHours(4), arr: inHours(6.5), boarding: inHours(3.3), status: "SCHEDULED", price: 220, seats: 250 },
      // ARN routes
      { num: "SK4101", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "ARN", d: "OSL", dep: inHours(2), arr: inHours(3.5), boarding: inHours(1.3), status: "CHECK_IN_OPEN", price: 120, seats: 180 },
      { num: "SK4102", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "ARN", d: "LHR", dep: inHours(6), arr: inHours(8.5), boarding: inHours(5.3), status: "SCHEDULED", price: 240, seats: 250 },
      // OSL routes
      { num: "SK4201", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "OSL", d: "HEL", dep: inHours(2), arr: inHours(4), boarding: inHours(1.3), status: "BOARDING", price: 140, seats: 180 },
      { num: "SK4202", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "OSL", d: "LHR", dep: inHours(5), arr: inHours(7.5), boarding: inHours(4.3), status: "SCHEDULED", price: 230, seats: 250 },
      // HEL routes
      { num: "SK4301", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "HEL", d: "ARN", dep: inHours(2), arr: inHours(3.5), boarding: inHours(1.3), status: "CHECK_IN_OPEN", price: 130, seats: 180 },
      { num: "SK4302", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "HEL", d: "LHR", dep: inHours(6), arr: inHours(9), boarding: inHours(5.3), status: "SCHEDULED", price: 250, seats: 250 },
      // DUB routes
      { num: "SK4401", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "DUB", d: "LHR", dep: inHours(2), arr: inHours(3.5), boarding: inHours(1.3), status: "BOARDING", price: 150, seats: 180 },
      { num: "SK4402", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "DUB", d: "JFK", dep: inHours(6), arr: inHours(13), boarding: inHours(5.3), status: "SCHEDULED", price: 580, seats: 250 },
      // EDI routes
      { num: "SK4501", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "EDI", d: "LHR", dep: inHours(2), arr: inHours(3.5), boarding: inHours(1.3), status: "CHECK_IN_OPEN", price: 160, seats: 180 },
      { num: "SK4502", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "EDI", d: "AMS", dep: inHours(5), arr: inHours(7), boarding: inHours(4.3), status: "SCHEDULED", price: 220, seats: 250 },
      // MAN routes
      { num: "SK4601", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "MAN", d: "LHR", dep: inHours(2), arr: inHours(3.5), boarding: inHours(1.3), status: "BOARDING", price: 150, seats: 180 },
      { num: "SK4602", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "MAN", d: "JFK", dep: inHours(7), arr: inHours(14), boarding: inHours(6.3), status: "SCHEDULED", price: 620, seats: 250 },
      // GLA routes
      { num: "SK4701", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "GLA", d: "LHR", dep: inHours(2), arr: inHours(3.5), boarding: inHours(1.3), status: "CHECK_IN_OPEN", price: 160, seats: 180 },
      { num: "SK4702", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "GLA", d: "DUB", dep: inHours(4), arr: inHours(5.5), boarding: inHours(3.3), status: "SCHEDULED", price: 180, seats: 250 },
      // BRU routes
      { num: "SK4801", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "BRU", d: "CDG", dep: inHours(2), arr: inHours(3.5), boarding: inHours(1.3), status: "BOARDING", price: 140, seats: 180 },
      { num: "SK4802", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "BRU", d: "LHR", dep: inHours(5), arr: inHours(7), boarding: inHours(4.3), status: "SCHEDULED", price: 220, seats: 250 },
      // MUC routes
      { num: "SK4901", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "MUC", d: "FRA", dep: inHours(2), arr: inHours(3.5), boarding: inHours(1.3), status: "CHECK_IN_OPEN", price: 140, seats: 180 },
      { num: "SK4902", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "MUC", d: "JFK", dep: inHours(7), arr: inHours(15), boarding: inHours(6.3), status: "SCHEDULED", price: 720, seats: 250 },
      // DUS routes
      { num: "SK5001", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "DUS", d: "LHR", dep: inHours(2), arr: inHours(3.5), boarding: inHours(1.3), status: "BOARDING", price: 150, seats: 180 },
      { num: "SK5002", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "DUS", d: "FRA", dep: inHours(4), arr: inHours(5.5), boarding: inHours(3.3), status: "SCHEDULED", price: 160, seats: 250 },
      // HAM routes
      { num: "SK5101", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "HAM", d: "FRA", dep: inHours(2), arr: inHours(3.5), boarding: inHours(1.3), status: "CHECK_IN_OPEN", price: 140, seats: 180 },
      { num: "SK5102", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "HAM", d: "LHR", dep: inHours(5), arr: inHours(7), boarding: inHours(4.3), status: "SCHEDULED", price: 230, seats: 250 },
      // BER routes
      { num: "SK5201", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "BER", d: "FRA", dep: inHours(2), arr: inHours(3.5), boarding: inHours(1.3), status: "BOARDING", price: 140, seats: 180 },
      { num: "SK5202", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "BER", d: "LHR", dep: inHours(5), arr: inHours(7), boarding: inHours(4.3), status: "SCHEDULED", price: 220, seats: 250 },
      // PRG routes
      { num: "SK5301", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "PRG", d: "FRA", dep: inHours(2), arr: inHours(3.5), boarding: inHours(1.3), status: "CHECK_IN_OPEN", price: 150, seats: 180 },
      { num: "SK5302", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "PRG", d: "CDG", dep: inHours(4), arr: inHours(6), boarding: inHours(3.3), status: "SCHEDULED", price: 180, seats: 250 },
      // WAW routes
      { num: "SK5401", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "WAW", d: "LHR", dep: inHours(2), arr: inHours(4), boarding: inHours(1.3), status: "BOARDING", price: 170, seats: 180 },
      { num: "SK5402", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "WAW", d: "FRA", dep: inHours(4), arr: inHours(6), boarding: inHours(3.3), status: "SCHEDULED", price: 190, seats: 250 },
      // BUD routes
      { num: "SK5501", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "BUD", d: "FRA", dep: inHours(2), arr: inHours(3.5), boarding: inHours(1.3), status: "CHECK_IN_OPEN", price: 150, seats: 180 },
      { num: "SK5502", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "BUD", d: "LHR", dep: inHours(5), arr: inHours(7), boarding: inHours(4.3), status: "SCHEDULED", price: 230, seats: 250 },
      // OTP routes
      { num: "SK5601", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "OTP", d: "FRA", dep: inHours(2), arr: inHours(3.5), boarding: inHours(1.3), status: "BOARDING", price: 160, seats: 180 },
      { num: "SK5602", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "OTP", d: "LHR", dep: inHours(5), arr: inHours(7.5), boarding: inHours(4.3), status: "SCHEDULED", price: 240, seats: 250 },
      // SOF routes
      { num: "SK5701", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "SOF", d: "FRA", dep: inHours(2), arr: inHours(3.5), boarding: inHours(1.3), status: "CHECK_IN_OPEN", price: 160, seats: 180 },
      { num: "SK5702", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "SOF", d: "LHR", dep: inHours(5), arr: inHours(7.5), boarding: inHours(4.3), status: "SCHEDULED", price: 240, seats: 250 },
      // SKG routes
      { num: "SK5801", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "SKG", d: "ATH", dep: inHours(2), arr: inHours(3.5), boarding: inHours(1.3), status: "BOARDING", price: 120, seats: 180 },
      { num: "SK5802", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "SKG", d: "FRA", dep: inHours(4), arr: inHours(6), boarding: inHours(3.3), status: "SCHEDULED", price: 200, seats: 250 },
      // HER routes
      { num: "SK5901", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "HER", d: "ATH", dep: inHours(1), arr: inHours(2.5), boarding: inHours(0.3), status: "CHECK_IN_OPEN", price: 110, seats: 180 },
      { num: "SK5902", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "HER", d: "LHR", dep: inHours(5), arr: inHours(8), boarding: inHours(4.3), status: "SCHEDULED", price: 280, seats: 250 },
      // PMI routes
      { num: "SK6001", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "PMI", d: "BCN", dep: inHours(2), arr: inHours(3.5), boarding: inHours(1.3), status: "BOARDING", price: 130, seats: 180 },
      { num: "SK6002", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "PMI", d: "MAD", dep: inHours(4), arr: inHours(5.5), boarding: inHours(3.3), status: "SCHEDULED", price: 150, seats: 250 },
      // AGP routes
      { num: "SK6101", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "AGP", d: "MAD", dep: inHours(2), arr: inHours(3.5), boarding: inHours(1.3), status: "CHECK_IN_OPEN", price: 120, seats: 180 },
      { num: "SK6102", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "AGP", d: "LHR", dep: inHours(5), arr: inHours(7.5), boarding: inHours(4.3), status: "SCHEDULED", price: 240, seats: 250 },
      // VLC routes
      { num: "SK6201", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "VLC", d: "BCN", dep: inHours(2), arr: inHours(3.5), boarding: inHours(1.3), status: "BOARDING", price: 120, seats: 180 },
      { num: "SK6202", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "VLC", d: "MAD", dep: inHours(4), arr: inHours(5.5), boarding: inHours(3.3), status: "SCHEDULED", price: 140, seats: 250 },
      // SVQ routes
      { num: "SK6301", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "SVQ", d: "MAD", dep: inHours(2), arr: inHours(3.5), boarding: inHours(1.3), status: "CHECK_IN_OPEN", price: 120, seats: 180 },
      { num: "SK6302", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "SVQ", d: "BCN", dep: inHours(4), arr: inHours(5.5), boarding: inHours(3.3), status: "SCHEDULED", price: 140, seats: 250 },
      // BIO routes
      { num: "SK6401", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "BIO", d: "MAD", dep: inHours(2), arr: inHours(3.5), boarding: inHours(1.3), status: "BOARDING", price: 130, seats: 180 },
      { num: "SK6402", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "BIO", d: "LHR", dep: inHours(5), arr: inHours(7.5), boarding: inHours(4.3), status: "SCHEDULED", price: 250, seats: 250 },
      // OPO routes
      { num: "SK6501", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "OPO", d: "LIS", dep: inHours(2), arr: inHours(3.5), boarding: inHours(1.3), status: "CHECK_IN_OPEN", price: 110, seats: 180 },
      { num: "SK6502", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "OPO", d: "LHR", dep: inHours(5), arr: inHours(7.5), boarding: inHours(4.3), status: "SCHEDULED", price: 240, seats: 250 },
      // FAO routes
      { num: "SK6601", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "FAO", d: "LIS", dep: inHours(2), arr: inHours(3.5), boarding: inHours(1.3), status: "BOARDING", price: 110, seats: 180 },
      { num: "SK6602", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "FAO", d: "LHR", dep: inHours(5), arr: inHours(7.5), boarding: inHours(4.3), status: "SCHEDULED", price: 240, seats: 250 },
      // LPA routes
      { num: "SK6701", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "LPA", d: "MAD", dep: inHours(3), arr: inHours(5.5), boarding: inHours(2.3), status: "CHECK_IN_OPEN", price: 180, seats: 180 },
      { num: "SK6702", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "LPA", d: "LHR", dep: inHours(6), arr: inHours(10), boarding: inHours(5.3), status: "SCHEDULED", price: 320, seats: 250 },
      // TFS routes
      { num: "SK6801", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "TFS", d: "MAD", dep: inHours(3), arr: inHours(5.5), boarding: inHours(2.3), status: "BOARDING", price: 180, seats: 180 },
      { num: "SK6802", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "TFS", d: "LHR", dep: inHours(6), arr: inHours(10), boarding: inHours(5.3), status: "SCHEDULED", price: 320, seats: 250 },
      // ACE routes
      { num: "SK6901", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "ACE", d: "MAD", dep: inHours(3), arr: inHours(5.5), boarding: inHours(2.3), status: "CHECK_IN_OPEN", price: 180, seats: 180 },
      { num: "SK6902", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "ACE", d: "LHR", dep: inHours(6), arr: inHours(10), boarding: inHours(5.3), status: "SCHEDULED", price: 320, seats: 250 },
      // FUE routes
      { num: "SK7001", airline: "SkyPort Air", aircraft: "Airbus A320neo", o: "FUE", d: "MAD", dep: inHours(3), arr: inHours(5.5), boarding: inHours(2.3), status: "BOARDING", price: 180, seats: 180 },
      { num: "SK7002", airline: "SkyPort Air", aircraft: "Boeing 787-9", o: "FUE", d: "LHR", dep: inHours(6), arr: inHours(10), boarding: inHours(5.3), status: "SCHEDULED", price: 320, seats: 250 },
    ];

    for (const f of flights) {
      const oId = airportIds[f.o];
      const dId = airportIds[f.d];
      if (!oId || !dId) { console.warn(`[seed] Skipping ${f.num} — unknown airport`); continue; }

      const firstTCode = Object.keys(terminalIds[f.o] || {})[0];
      const firstTermId = firstTCode ? terminalIds[f.o][firstTCode] : null;
      const firstGateCode = firstTermId ? Object.keys(gateIds[f.o]?.[firstTCode] || {})[0] : null;
      const firstGateId = firstGateCode ? gateIds[f.o][firstTCode][firstGateCode] : null;

      await client.query(
        `INSERT INTO flights (flight_number, airline, aircraft, origin_airport_id, destination_airport_id,
         departure_time, arrival_time, boarding_time, terminal_id, gate_id, status, base_price, seats_available)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         ON CONFLICT DO NOTHING`,
        [f.num, f.airline, f.aircraft, oId, dId, f.dep, f.arr, f.boarding,
          firstTermId, firstGateId, f.status, f.price, f.seats]
      );
    }
    console.log(`[seed] ${flights.length} flights seeded.`);

    await client.query("COMMIT");
    console.log(`[seed] ✅ All done — ${airports.length} airports, terminals, gates, map points, ${flights.length} flights.`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch((err) => {
  console.error("[seed] Failed:", err);
  process.exit(1);
});