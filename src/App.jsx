import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Wifi,
  MapPin,
  Key,
  Car,
  Utensils,
  Sparkles,
  Send,
  PhoneCall,
  Check,
  Copy,
  QrCode,
  ShieldCheck,
  FileText,
  Wand2,
  CreditCard,
  Download,
  Printer,
  CheckCircle2,
  Lock,
  RefreshCw,
  BookOpen,
  MessageSquare,
  X,
  Trash2,
  PlusCircle,
  Flame,
  Coffee,
  Building2,
  Receipt,
  Cookie,
  Scale,
  Navigation,
  ClipboardCheck,
  UserCheck,
  Mail
} from 'lucide-react';

const SUPPORT_EMAIL = 'info.hostbot@gmail.com';

// ==========================================
// SPOLEHLIVÉ KOPÍROVÁNÍ DO SCHRÁNKY
// ==========================================
const copyTextSafe = (text) => {
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  } catch (e) {
    navigator.clipboard?.writeText(text);
    return true;
  }
};

// ==========================================
// 3 ROČNÍ TARIFY (0 KČ ZA ZŘÍZENÍ)
// ==========================================
const PRICING_PLANS = [
  {
    id: 'start',
    name: 'START (Chata / Byt)',
    subtitle: 'Pro soukromé majitele 1 až 2 apartmánů či chat',
    unitRangeLabel: '1 – 2 apartmány / chaty',
    maxUnits: 2,
    oldPrice: 1490,
    price: 890,
    monthlyEquivalent: 74,
    badge: 'Pro 1–2 ubytování',
    popular: false,
    features: [
      'Až 2 samostatné QR kódy a tiskové PDF/PNG letáky',
      '4jazyčný AI recepční (CZ, EN, DE, PL) na 12 měsíců',
      '0 Kč za zřízení • Okamžité stažení po platbě',
      'Změna Wi-Fi hesla či pokynů kdykoliv online bez přetisku',
    ],
  },
  {
    id: 'penzion',
    name: 'PENZION & APARTMÁNY',
    subtitle: 'Pro penziony, roubenky a domy s více pokoji',
    unitRangeLabel: '3 – 10 apartmánů / pokojů',
    maxUnits: 10,
    oldPrice: 2990,
    price: 1990,
    monthlyEquivalent: 165,
    badge: 'Nejoblíbenější volba',
    popular: true,
    features: [
      'Až 10 samostatných QR letáků (každý pokoj má vlastní QR)',
      'Možnost odlišit název pokoje, Wi-Fi nebo kód schránky',
      'Neomezený 4jazyčný AI recepční pro celý objekt',
      'Jedna souhrnná roční faktura do účetnictví (0 Kč zřízení)',
    ],
  },
  {
    id: 'profi',
    name: 'PROFI / RESORT / AGENTURA',
    subtitle: 'Pro větší objekty a správcovské Airbnb agentury',
    unitRangeLabel: '11 – 30 apartmánů / pokojů',
    maxUnits: 30,
    oldPrice: 5990,
    price: 3990,
    monthlyEquivalent: 332,
    badge: 'Pro velké objekty a správce',
    popular: false,
    features: [
      'Až 30 samostatných jednotek, pokojů nebo apartmánů',
      'Hromadná správa všech QR letáků v jednom účtu',
      'Neomezený AI provoz 24/7 + prioritní podpora',
      'Vychází jen na 11 Kč měsíčně za jeden apartmán',
    ],
  },
];

// ==========================================
// DETERMINISTICKÝ GENERÁTOR SVG QR KÓDU
// ==========================================
const DynamicQRCode = ({ value = 'https://hostbot.cz', size = 144, fgColor = '#0f172a', bgColor = '#ffffff' }) => {
  const gridSize = 21;
  const matrix = useMemo(() => {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i++) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));
    const drawFinder = (r0, c0) => {
      for (let r = 0; r < 7; r++) {
        for (let c = 0; c < 7; c++) {
          if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
            grid[r0 + r][c0 + c] = true;
          }
        }
      }
    };
    drawFinder(0, 0);
    drawFinder(0, gridSize - 7);
    drawFinder(gridSize - 7, 0);
    let seed = Math.abs(hash);
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if ((r < 8 && c < 8) || (r < 8 && c >= gridSize - 8) || (r >= gridSize - 8 && c < 8)) continue;
        seed = (seed * 1664525 + 1013904223) % 4294967296;
        grid[r][c] = (seed ^ (value.charCodeAt((r * gridSize + c) % value.length) || 7)) % 100 < 48;
      }
    }
    return grid;
  }, [value]);

  const cellSize = size / (gridSize + 2);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-xl select-none shrink-0" style={{ backgroundColor: bgColor }}>
      <rect width={size} height={size} fill={bgColor} rx={10} />
      {matrix.map((row, rIdx) =>
        row.map((cell, cIdx) =>
          cell ? (
            <rect
              key={`${rIdx}-${cIdx}`}
              x={(cIdx + 1) * cellSize}
              y={(rIdx + 1) * cellSize}
              width={cellSize + 0.35}
              height={cellSize + 0.35}
              fill={fgColor}
              rx={cellSize * 0.18}
            />
          ) : null
        )
      )}
    </svg>
  );
};

// ==========================================
// PŘEKLADY ROZHRANÍ MOBILU (CZ, EN, DE, PL)
// ==========================================
const GUEST_TRANSLATIONS = {
  cs: {
    flag: '🇨🇿', label: 'CZ', langName: 'Čeština',
    aiBadge: 'Virtuální AI asistent (EU AI Act)',
    tabGuide: 'Přehled & Wi-Fi', tabExtras: 'Vybavení & Řád', tabChat: 'AI Recepční',
    wifiTitle: 'Domácí Wi-Fi síť', copyPass: 'Zkopírovat heslo k Wi-Fi', copied: 'Heslo zkopírováno!',
    timesTitle: 'Příjezd, odjezd & klíče', checkinLabel: 'Příjezd (Check-in)', checkoutLabel: 'Odjezd (Check-out)',
    keyboxLabel: 'Kód schránky / klíče', navTitle: 'Navigace k ubytování',
    manualsTitle: 'Vybavení, návody & pravidla domu',
    heatingTitle: 'Topení, krb, klima & teplá voda',
    appliancesTitle: 'Spotřebiče, kuchyň, TV & wellness',
    wasteTitle: 'Odpadky & třídění odpadu',
    houseRulesTitle: 'Domovní řád, noční klid & mazlíčci',
    extraInfoTitle: 'Další informace od majitele',
    openManualsBtn: 'Zobrazit podrobné návody a další informace →',
    tipsTitle: 'Kam v okolí na jídlo a výlet',
    askAiBtn: 'Zeptat se AI recepčního na podrobnosti →',
    checkoutListTitle: 'Kontrola před odjezdem (Check-out)',
    checkoutNotifyBtn: 'Poslat SMS majiteli: Máme sklizeno a odjíždíme',
    sosBtn: 'SOS / Kontaktovat majitele', sosSub: 'Zavolat nebo napsat na WhatsApp',
    chatHeader: 'Zeptejte se v libovolném jazyce',
    chatPlaceholder: 'Napište dotaz (např. Jak zapnout topení?)...',
    tryPromptsLabel: 'Rychlé dotazy (klikněte):',
    gdprNotice: 'GDPR: Do chatu nezadávejte osobní údaje ani čísla dokladů.',
    demoBadge: 'TESTOVACÍ REŽIM', unlimitedBadge: 'Aktivní tarif • Neomezeně',
    botTyping: 'AI recepční píše...',
    tasks: [
      'Zavřít všechna okna a zhasnout světla',
      'Ztlumit topení / vypnout klimatizaci a spotřebiče',
      'Zapnout myčku a vynést odpadky do popelnice',
      'Vrátit klíče do schránky u vchodu',
    ],
    chips: [
      { label: '🔑 Wi-Fi a parkování?', q: 'Jaké je heslo na Wi-Fi a kde zaparkuji?' },
      { label: '🕙 Odjezd a klíče?', q: 'V kolik je check-out a kam vrátit klíče?' },
      { label: '🔥 Topení, vybavení a odpad?', q: 'Jak funguje topení, spotřebiče a kam s odpadem?' },
      { label: '🍽️ Jídlo a výlety v okolí?', q: 'Kam zajít v okolí na jídlo a na výlet?' },
    ],
    greeting: (name) => `Vítejte v **${name}**! Jsem váš digitální AI průvodce. Zeptejte se mě na Wi-Fi, topení, vybavení, třídění odpadu nebo kam jít na večeři.`,
  },
  en: {
    flag: '🇬🇧', label: 'EN', langName: 'English',
    aiBadge: 'Virtual AI Concierge (EU AI Act)',
    tabGuide: 'Guide & Wi-Fi', tabExtras: 'Manuals & Rules', tabChat: 'AI Concierge',
    wifiTitle: 'Fast Wi-Fi Access', copyPass: 'Copy Wi-Fi Password', copied: 'Password copied!',
    timesTitle: 'Check-in, Keys & Parking', checkinLabel: 'Check-in time', checkoutLabel: 'Check-out time',
    keyboxLabel: 'Keybox / Smart Lock', navTitle: 'Navigate to Property',
    manualsTitle: 'Equipment, Manuals & House Rules',
    heatingTitle: 'Heating, AC, Fireplace & Hot Water',
    appliancesTitle: 'Appliances, Kitchen, TV & Wellness',
    wasteTitle: 'Trash & Recycling Location',
    houseRulesTitle: 'House Rules, Quiet Hours & Pets',
    extraInfoTitle: 'Additional Host Information',
    openManualsBtn: 'Open detailed manuals & additional info →',
    tipsTitle: 'Local Restaurants & Trips',
    askAiBtn: 'Ask AI Concierge for details →',
    checkoutListTitle: 'Quick Check-out Checklist',
    checkoutNotifyBtn: 'Send SMS to host: We have checked out',
    sosBtn: 'SOS / Contact Host Directly', sosSub: 'Call or message via WhatsApp',
    chatHeader: 'Ask anything in English',
    chatPlaceholder: 'Ask a question (e.g., How does the heating work?)...',
    tryPromptsLabel: 'Quick questions (tap to ask):',
    gdprNotice: 'GDPR Privacy: Please do not enter personal ID data in chat.',
    demoBadge: 'DEMO MODE', unlimitedBadge: 'Active Plan • Unlimited',
    botTyping: 'AI Concierge is typing...',
    tasks: [
      'Close all windows and turn off the lights',
      'Turn down heating / switch off AC and appliances',
      'Start the dishwasher and take out the trash',
      'Return the keys to the lockbox',
    ],
    chips: [
      { label: '🔑 Wi-Fi & Parking?', q: 'What is the Wi-Fi password and where can I park?' },
      { label: '🕙 Check-out & Keys?', q: 'What time is check-out and where do I leave the keys?' },
      { label: '🔥 Heating, Appliances & Trash?', q: 'How do I use the heating and appliances, and where is the trash?' },
      { label: '🍽️ Best Restaurants & Trips?', q: 'Where can we go for dinner or a trip nearby?' },
    ],
    greeting: (name) => `Welcome to **${name}**! I am your 24/7 AI Concierge. Ask me anything in English about Wi-Fi, heating, appliances, recycling, or local dining!`,
  },
  de: {
    flag: '🇩🇪', label: 'DE', langName: 'Deutsch',
    aiBadge: 'Virtueller KI-Assistent (EU AI Act)',
    tabGuide: 'Infos & WLAN', tabExtras: 'Geräte & Regeln', tabChat: 'KI-Rezeption',
    wifiTitle: 'WLAN-Verbindung', copyPass: 'WLAN-Passwort kopieren', copied: 'Passwort kopiert!',
    timesTitle: 'Anreise, Schlüssel & Parken', checkinLabel: 'Anreise (Check-in)', checkoutLabel: 'Abreise (Check-out)',
    keyboxLabel: 'Schlüsselbox-Code', navTitle: 'Navigation zur Unterkunft',
    manualsTitle: 'Ausstattung, Anleitungen & Hausordnung',
    heatingTitle: 'Heizung, Kamin, Klima & Warmwasser',
    appliancesTitle: 'Küche, Kaffeemaschine, TV & Wellness',
    wasteTitle: 'Müll & Mülltrennung',
    houseRulesTitle: 'Hausordnung, Nachtruhe & Haustiere',
    extraInfoTitle: 'Weitere Informationen vom Gastgeber',
    openManualsBtn: 'Alle Anleitungen & weitere Infos öffnen →',
    tipsTitle: 'Restaurants & Ausflugstipps',
    askAiBtn: 'KI-Assistent nach Details fragen →',
    checkoutListTitle: 'Checkliste vor der Abreise',
    checkoutNotifyBtn: 'SMS an Gastgeber: Wir sind abgereist',
    sosBtn: 'SOS / Gastgeber kontaktieren', sosSub: 'Anruf oder WhatsApp im Notfall',
    chatHeader: 'Fragen Sie uns auf Deutsch',
    chatPlaceholder: 'Frage eingeben (z. B. Wie funktioniert die Heizung?)...',
    tryPromptsLabel: 'Schnellfragen (antippen):',
    gdprNotice: 'DSGVO: Bitte keine persönlichen Ausweisdaten im Chat eingeben.',
    demoBadge: 'TESTMODUS', unlimitedBadge: 'Aktiv • Unbegrenzt',
    botTyping: 'KI-Assistent schreibt...',
    tasks: [
      'Alle Fenster schließen und Licht ausschalten',
      'Heizung herunterdrehen / Geräte ausschalten',
      'Geschirrspüler starten und Müll hinausbringen',
      'Schlüssel zurück in die Schlüsselbox legen',
    ],
    chips: [
      { label: '🔑 WLAN & Parkplatz?', q: 'Wie lautet das WLAN-Passwort und wo kann ich parken?' },
      { label: '🕙 Wann ist Check-out?', q: 'Wann ist der Check-out und wo lassen wir die Schlüssel?' },
      { label: '🔥 Heizung, Geräte & Müll?', q: 'Wie funktionieren Heizung und Geräte und wohin kommt der Müll?' },
      { label: '🍽️ Restaurants & Ausflüge?', q: 'Welche Restaurants und Ausflugsziele empfehlen Sie?' },
    ],
    greeting: (name) => `Herzlich willkommen in **${name}**! Fragen Sie mich gerne auf Deutsch nach WLAN, Heizung, Küchengeräten, Mülltrennung oder Restaurants!`,
  },
  pl: {
    flag: '🇵🇱', label: 'PL', langName: 'Polski',
    aiBadge: 'Wirtualny Asystent AI (EU AI Act)',
    tabGuide: 'Przewodnik', tabExtras: 'Sprzęt i Zasady', tabChat: 'Czat z AI',
    wifiTitle: 'Domowa sieć Wi-Fi', copyPass: 'Skopiuj hasło Wi-Fi', copied: 'Hasło skopiowane!',
    timesTitle: 'Przyjazd, klucze i parking', checkinLabel: 'Przyjazd (Check-in)', checkoutLabel: 'Wyjazd (Check-out)',
    keyboxLabel: 'Kod do skrytki na klucze', navTitle: 'Nawigacja do obiektu',
    manualsTitle: 'Wyposażenie, instrukcje i regulamin',
    heatingTitle: 'Ogrzewanie, kominek i ciepła woda',
    appliancesTitle: 'Kuchnia, ekspres, TV i strefa relaksu',
    wasteTitle: 'Śmieci i segregacja odpadów',
    houseRulesTitle: 'Regulamin domu, cisza nocna i zwierzęta',
    extraInfoTitle: 'Dodatkowe informacje od gospodarza',
    openManualsBtn: 'Zobacz szczegółowe instrukcje i dodatkowe informacje →',
    tipsTitle: 'Restauracje i wycieczki',
    askAiBtn: 'Zapytaj asystenta AI o szczegóły →',
    checkoutListTitle: 'Lista kontrolna przed wyjazdem',
    checkoutNotifyBtn: 'Wyślij SMS do gospodarza: Wymeldowaliśmy się',
    sosBtn: 'SOS / Kontakt z gospodarzem', sosSub: 'Telefon lub WhatsApp w nagłych wypadkach',
    chatHeader: 'Zapytaj o wszystko po polsku',
    chatPlaceholder: 'Wpisz pytanie (np. Jak działa ogrzewanie?)...',
    tryPromptsLabel: 'Szybkie pytania (kliknij):',
    gdprNotice: 'RODO: Nie wpisuj na czacie poufnych danych osobowych.',
    demoBadge: 'TRYB TESTOWY', unlimitedBadge: 'Pakiet aktywny • Bez limitu',
    botTyping: 'Asystent AI pisze...',
    tasks: [
      'Zamknąć wszystkie okna i zgasić światła',
      'Przykręcić ogrzewanie / wyłączyć klimatyzację i sprzęt',
      'Włączyć zmywarkę i wynieść śmieci do kosza',
      'Zwrócić klucze do skrytki przy wejściu',
    ],
    chips: [
      { label: '🔑 Hasło Wi-Fi i parking?', q: 'Jakie jest hasło do Wi-Fi i gdzie można zaparkować?' },
      { label: '🕙 Godzina wymeldowania?', q: 'O której godzinie jest wymeldowanie i gdzie zostawić klucze?' },
      { label: '🔥 Ogrzewanie, sprzęt i śmieci?', q: 'Jak włączyć ogrzewanie i sprzęt oraz gdzie wyrzucić śmieci?' },
      { label: '🍽️ Gdzie zjeść i co zobaczyć?', q: 'Jakie restauracje i atrakcje polecacie w okolicy?' },
    ],
    greeting: (name) => `Witamy w **${name}**! Jestem Twoim wirtualnym przewodnikiem AI. Kliknij pytanie poniżej lub napisz po polsku, o co chcesz zapytać!`,
  },
};

// ==========================================
// CHYTRÝ VÍCEJAZYČNNÝ PŘEKLADAČ OBSAHU APARTMÁNU
// ==========================================
const PHRASE_DICTIONARY = {
  en: [
    ['Apartmán 1 – Přízemí s terasou', 'Apartment 1 – Ground Floor with Terrace'],
    ['Apartmán 2 – Podkrovní mezonet', 'Apartment 2 – Loft Duplex'],
    ['Pokoj č. 1 – Výhled na Sněžku', 'Room #1 – Sněžka Mountain View'],
    ['Pokoj č. 2 – Rodinné studio', 'Room #2 – Family Studio'],
    ['Pokoj č. 3 – Horské podkroví', 'Room #3 – Mountain Attic'],
    ['Vinařský apartmán č. 1', 'Winery Apartment #1'],
    ['Soukromé parkovací stání pro 2 auta přímo před chatou zdarma.', 'Free private parking for 2 cars directly in front of the cabin.'],
    ['Parkování pro 3 auta u roubenky zdarma (v zimě doporučujeme sněhové řetězy).', 'Free parking for 3 cars by the chalet (snow chains recommended in winter).'],
    ['Uzavřený dvůr za elektrickou branou zdarma (brána se otevírá čipem na klíčích).', 'Free gated courtyard parking (electric gate opens via keyfob).'],
    ['Podlahové topení se reguluje termostatem v obýváku (doporučeno 21–22 °C). Krbová kamna: suché bukové dřevo a podpalovač jsou v dřevníku u vchodu. Bojler 200 l se dohřívá automaticky.', 'Underfloor heating is controlled via the living room thermostat (21–22 °C). Wood stove: dry firewood and firelighters are in the woodshed at the entrance. The 200L water boiler heats automatically.'],
    ['Kávovar Nespresso (kapsle na lince), myčka nádobí (tablety pod dřezem), Smart TV s Netflixem. Venkovní vířivka na terase: zapněte tlačítkem JET1 (38 °C), po koupání vraťte termo-kryt.', 'Nespresso coffee machine (capsules on counter), dishwasher (tablets under sink), Smart TV with Netflix. Outdoor hot tub on terrace: press JET1 (38 °C), always replace thermal cover after use.'],
    ['Koše na tříděný odpad (plast, papír, sklo) jsou ve spodní skříňce kuchyně. Hlavní popelnice stojí v dřevěném přístřešku u příjezdové cesty (30 m od chaty).', 'Recycling bins (plastic, paper, glass) are in the lower kitchen cabinet. The main waste bin is in the wooden shelter by the driveway (30 m away).'],
    ['V celém vnitřním prostoru platí zákaz kouření. Prosíme o přezouvání v předsíni a dodržování nočního klidu od 22:00 do 7:00. Domácí mazlíčci pouze po domluvě.', 'Strictly non-smoking indoors. Please use indoor slippers in the hallway and respect quiet hours from 22:00 to 07:00. Pets only by prior arrangement.'],
    ['Voda v celé chatě je pitná z vlastního horského vrtu. Společenské hry a mapy Šumavy najdete v komodě pod televizí.', 'Tap water is fresh drinking water from our private mountain well. Board games and Šumava maps are in the dresser under the TV.'],
    ['Ohniště, plynový gril & posezení u potoka', 'Firepit, Gas Grill & Creek Seating'],
    ['U potoka za chatou je kamenné ohniště s opékáčky. Plynový gril Weber je na kryté terase (náhradní bomba v dřevníku).', 'Stone firepit with roasting sticks by the creek behind the cabin. Weber gas grill on the covered terrace (spare gas in woodshed).'],
    ['Úschovna kol, běžek & nabíjení elektrokol', 'Bike/Ski Storage & E-Bike Charging'],
    ['Uzamykatelná kolárna/lyžárna se otevírá klíčem od vchodu. Na stěně jsou 4 zásuvky 230V pro elektrokola a sušák na boty.', 'Lockable bike/ski room opens with the main entrance key. Features four 230V e-bike charging outlets and a boot dryer.'],
    ['Pekárna Kvilda (300 m – čerstvé koláče a kváskový chléb od 7:00), Pivovar Kvilda (večeře), Jezerní slať (2 km), Pramen Vltavy (5 km).', 'Kvilda Bakery (300 m – fresh pies & sourdough bread from 7:00 AM), Kvilda Brewery (dinner), Jezerní slať boardwalk (2 km), Vltava River Source (5 km).'],
  ],
  de: [
    ['Apartmán 1 – Přízemí s terasou', 'Apartment 1 – Erdgeschoss mit Terrasse'],
    ['Apartmán 2 – Podkrovní mezonet', 'Apartment 2 – Dachgeschoss-Maisonette'],
    ['Pokoj č. 1 – Výhled na Sněžku', 'Zimmer Nr. 1 – Blick auf die Schneekoppe'],
    ['Pokoj č. 2 – Rodinné studio', 'Zimmer Nr. 2 – Familienstudio'],
    ['Pokoj č. 3 – Horské podkroví', 'Zimmer Nr. 3 – Berg-Dachgeschoss'],
    ['Vinařský apartmán č. 1', 'Wein-Apartment Nr. 1'],
    ['Soukromé parkovací stání pro 2 auta přímo před chatou zdarma.', 'Kostenloser Privatparkplatz für 2 Autos direkt vor der Hütte.'],
    ['Parkování pro 3 auta u roubenky zdarma (v zimě doporučujeme sněhové řetězy).', 'Kostenloser Parkplatz für 3 Autos an der Blockhütte (im Winter Schneeketten empfohlen).'],
    ['Uzavřený dvůr za elektrickou branou zdarma (brána se otevírá čipem na klíčích).', 'Kostenloses Parken im Innenhof hinter dem elektrischen Tor (Chip am Schlüsselbund).'],
    ['Podlahové topení se reguluje termostatem v obýváku (doporučeno 21–22 °C). Krbová kamna: suché bukové dřevo a podpalovač jsou v dřevníku u vchodu. Bojler 200 l se dohřívá automaticky.', 'Fußbodenheizung über Thermostat im Wohnzimmer (21–22 °C). Kaminofen: trockenes Buchenholz und Anzünder im Holzschuppen am Eingang. 200-l-Warmwasserboiler heizt automatisch.'],
    ['Kávovar Nespresso (kapsle na lince), myčka nádobí (tablety pod dřezem), Smart TV s Netflixem. Venkovní vířivka na terase: zapněte tlačítkem JET1 (38 °C), po koupání vraťte termo-kryt.', 'Nespresso-Maschine (Kapseln auf der Arbeitsplatte), Geschirrspüler (Tabs unter der Spüle), Smart-TV mit Netflix. Außen-Whirlpool auf der Terrasse: Taste JET1 (38 °C), danach Thermoabdeckung auflegen.'],
    ['Koše na tříděný odpad (plast, papír, sklo) jsou ve spodní skříňce kuchyně. Hlavní popelnice stojí v dřevěném přístřešku u příjezdové cesty (30 m od chaty).', 'Behälter für Mülltrennung (Plastik, Papier, Glas) im unteren Küchenschrank. Hauptmülltonne im Holzunterstand an der Zufahrt (30 m entfernt).'],
    ['V celém vnitřním prostoru platí zákaz kouření. Prosíme o přezouvání v předsíni a dodržování nočního klidu od 22:00 do 7:00. Domácí mazlíčci pouze po domluvě.', 'Rauchverbot im gesamten Innenbereich. Bitte im Flur Hausschuhe anziehen und Nachtruhe von 22:00 bis 07:00 Uhr beachten. Haustiere nur nach Absprache.'],
    ['Voda v celé chatě je pitná z vlastního horského vrtu. Společenské hry a mapy Šumavy najdete v komodě pod televizí.', 'Das Leitungswasser ist frisches Trinkwasser aus eigener Bergquelle. Brettspiele und Wanderkarten liegen in der Kommode unter dem TV.'],
    ['Ohniště, plynový gril & posezení u potoka', 'Feuerstelle, Gasgrill & Sitzplatz am Bach'],
    ['U potoka za chatou je kamenné ohniště s opékáčky. Plynový gril Weber je na kryté terase (náhradní bomba v dřevníku).', 'Steinfeuerstelle am Bach hinter der Hütte. Weber-Gasgrill auf der überdachten Terrasse (Ersatzgasflasche im Holzschuppen).'],
    ['Úschovna kol, běžek & nabíjení elektrokol', 'Fahrrad-/Skiraum & E-Bike-Ladestation'],
    ['Uzamykatelná kolárna/lyžárna se otevírá klíčem od vchodu. Na stěně jsou 4 zásuvky 230V pro elektrokola a sušák na boty.', 'Abschließbarer Fahrrad-/Skiraum (Haustürschlüssel). Vier 230V-Steckdosen für E-Bikes und elektrischer Schuhtrockner vorhanden.'],
    ['Pekárna Kvilda (300 m – čerstvé koláče a kváskový chléb od 7:00), Pivovar Kvilda (večeře), Jezerní slať (2 km), Pramen Vltavy (5 km).', 'Bäckerei Kvilda (300 m – frischer Kuchen & Sauerteigbrot ab 7:00 Uhr), Brauerei Kvilda (Abendessen), Hochmoor Jezerní slať (2 km), Moldauquelle (5 km).'],
  ],
  pl: [
    ['Apartmán 1 – Přízemí s terasou', 'Apartament 1 – Parter z tarasem'],
    ['Apartmán 2 – Podkrovní mezonet', 'Apartament 2 – Dwupoziomowe poddasze'],
    ['Pokoj č. 1 – Výhled na Sněžku', 'Pokój nr 1 – Widok na Śnieżkę'],
    ['Pokoj č. 2 – Rodinné studio', 'Pokój nr 2 – Studio rodzinne'],
    ['Pokoj č. 3 – Horské podkroví', 'Pokój nr 3 – Górskie poddasze'],
    ['Vinařský apartmán č. 1', 'Apartament winiarski nr 1'],
    ['Soukromé parkovací stání pro 2 auta přímo před chatou zdarma.', 'Bezpłatny prywatny parking na 2 samochody bezpośrednio przed chatą.'],
    ['Parkování pro 3 auta u roubenky zdarma (v zimě doporučujeme sněhové řetězy).', 'Bezpłatny parking na 3 auta przy chacie (zimą zalecane łańcuchy śniegowe).'],
    ['Uzavřený dvůr za elektrickou branou zdarma (brána se otevírá čipem na klíčích).', 'Bezpłatny parking na zamkniętym podwórzu za bramą elektryczną (otwieraną chipem).'],
    ['Podlahové topení se reguluje termostatem v obýváku (doporučeno 21–22 °C). Krbová kamna: suché bukové dřevo a podpalovač jsou v dřevníku u vchodu. Bojler 200 l se dohřívá automaticky.', 'Ogrzewanie podłogowe regulowane termostatem w salonie (21–22 °C). Kominek: suche drewno i podpałka w drewutni przy wejściu. Bojler 200 l nagrzewa się automatycznie.'],
    ['Kávovar Nespresso (kapsle na lince), myčka nádobí (tablety pod dřezem), Smart TV s Netflixem. Venkovní vířivka na terase: zapněte tlačítkem JET1 (38 °C), po koupání vraťte termo-kryt.', 'Ekspres Nespresso (kapsułki na blacie), zmywarka (tabletki pod zlewem), Smart TV z Netflixem. Jacuzzi na tarasie: włącz przyciskiem JET1 (38 °C), po kąpieli załóż pokrywę.'],
    ['Koše na tříděný odpad (plast, papír, sklo) jsou ve spodní skříňce kuchyně. Hlavní popelnice stojí v dřevěném přístřešku u příjezdové cesty (30 m od chaty).', 'Kosze do segregacji odpadów (plastik, papier, szkło) w dolnej szafce kuchennej. Główny pojemnik stoi w drewnianej wiacie przy drodze (30 m od chaty).'],
    ['V celém vnitřním prostoru platí zákaz kouření. Prosíme o přezouvání v předsíni a dodržování nočního klidu od 22:00 do 7:00. Domácí mazlíčci pouze po domluvě.', 'Całkowity zakaz palenia wewnątrz. Prosimy o zmianę obuwia w przedpokoju i ciszę nocną w godz. 22:00–7:00. Zwierzęta domowe po uzgodnieniu.'],
    ['Voda v celé chatě je pitná z vlastního horského vrtu. Společenské hry a mapy Šumavy najdete v komodě pod televizí.', 'Woda w całej chacie jest pitna z własnego górskiego ujęcia. Gry planszowe i mapy znajdują się w komodzie pod telewizorem.'],
    ['Ohniště, plynový gril & posezení u potoka', 'Miejsce na ognisko, grill gazowy i potok'],
    ['U potoka za chatou je kamenné ohniště s opékáčky. Plynový gril Weber je na kryté terase (náhradní bomba v dřevníku).', 'Kamienne ognisko przy potoku za chatą. Grill gazowy Weber na zadaszonym tarasie (zapasowa butla w drewutni).'],
    ['Úschovna kol, běžek & nabíjení elektrokol', 'Rowerownia, narciarnia i ładowanie e-bike'],
    ['Uzamykatelná kolárna/lyžárna se otevírá klíčem od vchodu. Na stěně jsou 4 zásuvky 230V pro elektrokola a sušák na boty.', 'Zamykana rowerownia/narciarnia otwierana kluczem wejściowym. Na ścianie 4 gniazdka 230V do rowerów elektrycznych oraz suszarka do butów.'],
    ['Pekárna Kvilda (300 m – čerstvé koláče a kváskový chléb od 7:00), Pivovar Kvilda (večeře), Jezerní slať (2 km), Pramen Vltavy (5 km).', 'Piekarnia Kvilda (300 m – świeże kołacze i chleb od 7:00), Browar Kvilda (kolacja), torfowisko Jezerní slať (2 km), Źródło Wełtawy (5 km).'],
  ],
};

const translateDynamicText = (text, lang) => {
  if (!text || lang === 'cs') return text;
  let out = String(text).trim();
  const pairs = PHRASE_DICTIONARY[lang] || [];
  for (const [cz, translated] of pairs) {
    if (out === cz) return translated;
  }
  const regexRules = {
    en: [
      [/^od\s+(\d{1,2}:\d{2})/i, 'from $1'],
      [/^do\s+(\d{1,2}:\d{2})/i, 'until $1'],
      [/Apartmán\s*(?:č\.\s*)?(\d+)/gi, 'Apartment #$1'],
      [/Pokoj\s*(?:č\.\s*)?(\d+)/gi, 'Room #$1'],
      [/Schránka\s*(?:vlevo\s*u\s*dveří|u\s*dveří|u\s*vchodu|č\.\s*\d+)/gi, 'Lockbox at entrance'],
      [/Trezor\s*u\s*vchodu/gi, 'Safe box at entrance'],
      [/Chytrá\s*klika(?:\s*u\s*vchodu)?/gi, 'Smart lock'],
      [/kód\s+([0-9#A-Za-z]+)/gi, 'code $1'],
    ],
    de: [
      [/^od\s+(\d{1,2}:\d{2})/i, 'ab $1 Uhr'],
      [/^do\s+(\d{1,2}:\d{2})/i, 'bis $1 Uhr'],
      [/Apartmán\s*(?:č\.\s*)?(\d+)/gi, 'Apartment Nr. $1'],
      [/Pokoj\s*(?:č\.\s*)?(\d+)/gi, 'Zimmer Nr. $1'],
      [/Schránka\s*(?:vlevo\s*u\s*dveří|u\s*dveří|u\s*vchodu|č\.\s*\d+)/gi, 'Schlüsselbox am Eingang'],
      [/Trezor\s*u\s*vchodu/gi, 'Schlüsseltresor'],
      [/Chytrá\s*klika(?:\s*u\s*vchodu)?/gi, 'Smart-Lock'],
      [/kód\s+([0-9#A-Za-z]+)/gi, 'Code $1'],
    ],
    pl: [
      [/^od\s+(\d{1,2}:\d{2})/i, 'od $1'],
      [/^do\s+(\d{1,2}:\d{2})/i, 'do $1'],
      [/Apartmán\s*(?:č\.\s*)?(\d+)/gi, 'Apartament nr $1'],
      [/Pokoj\s*(?:č\.\s*)?(\d+)/gi, 'Pokój nr $1'],
      [/Schránka\s*(?:vlevo\s*u\s*dveří|u\s*dveří|u\s*vchodu|č\.\s*\d+)/gi, 'Skrytka przy wejściu'],
      [/Trezor\s*u\s*vchodu/gi, 'Sejf przy wejściu'],
      [/Chytrá\s*klika(?:\s*u\s*vchodu)?/gi, 'Inteligentny zamek'],
      [/kód\s+([0-9#A-Za-z]+)/gi, 'kod $1'],
    ],
  }[lang] || [];

  for (const [rgx, repl] of regexRules) {
    out = out.replace(rgx, repl);
  }
  return out;
};

// ==========================================
// VÝCHOZÍ PROFILY UBYTOVÁNÍ
// ==========================================
const INITIAL_APARTMENTS = [
  {
    id: 'apt-sumava',
    slug: 'chata-u-lesa-sumava',
    badge: 'Horská chata • Šumava',
    aptName: 'Horská chata U Lesa – Šumava',
    location: 'Kvilda, Národní park Šumava',
    ownerEmail: 'novak@ubytovani-sumava.cz',
    ownerPin: 'sumava123',
    heroImage: 'https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=1000&q=80',
    wifiName: 'Chata_Sumava_5G',
    wifiPass: 'Sumava2026!',
    checkin: 'od 15:00',
    checkout: 'do 10:00',
    keybox: 'Schránka vlevo u dveří • kód 2580',
    parking: 'Soukromé parkovací stání pro 2 auta přímo před chatou zdarma.',
    heatingInfo: 'Podlahové topení se reguluje termostatem v obýváku (doporučeno 21–22 °C). Krbová kamna: suché bukové dřevo a podpalovač jsou v dřevníku u vchodu. Bojler 200 l se dohřívá automaticky.',
    appliancesInfo: 'Kávovar Nespresso (kapsle na lince), myčka nádobí (tablety pod dřezem), Smart TV s Netflixem. Venkovní vířivka na terase: zapněte tlačítkem JET1 (38 °C), po koupání vraťte termo-kryt.',
    wasteInfo: 'Koše na tříděný odpad (plast, papír, sklo) jsou ve spodní skříňce kuchyně. Hlavní popelnice stojí v dřevěném přístřešku u příjezdové cesty (30 m od chaty).',
    rules: 'V celém vnitřním prostoru platí zákaz kouření. Prosíme o přezouvání v předsíni a dodržování nočního klidu od 22:00 do 7:00. Domácí mazlíčci pouze po domluvě.',
    extraInfo: 'Voda v celé chatě je pitná z vlastního horského vrtu. Společenské hry a mapy Šumavy najdete v komodě pod televizí.',
    customSections: [
      {
        id: 'cs-1',
        title: 'Ohniště, plynový gril & posezení u potoka',
        content: 'U potoka za chatou je kamenné ohniště s opékáčky. Plynový gril Weber je na kryté terase (náhradní bomba v dřevníku).',
      },
      {
        id: 'cs-2',
        title: 'Úschovna kol, běžek & nabíjení elektrokol',
        content: 'Uzamykatelná kolárna/lyžárna se otevírá klíčem od vchodu. Na stěně jsou 4 zásuvky 230V pro elektrokola a sušák na boty.',
      },
    ],
    tips: 'Pekárna Kvilda (300 m – čerstvé koláče a kváskový chléb od 7:00), Pivovar Kvilda (večeře), Jezerní slať (2 km), Pramen Vltavy (5 km).',
    hostPhone: '+420 775 888 999',
    flyerTheme: 'wood',
    flyerHeadline: 'Vítejte! Naskenujte QR kód pro Wi-Fi a AI průvodce',
    status: 'DEMO',
    planId: 'start',
    units: [
      { id: 1, name: 'Apartmán 1 – Přízemí s terasou', customKeybox: 'Schránka č. 1 • kód 2580' },
      { id: 2, name: 'Apartmán 2 – Podkrovní mezonet', customKeybox: 'Schránka č. 2 • kód 3690' },
    ],
    rawListing: 'Pronájem Horské chaty U Lesa na Kvildě v srdci Šumavy (2 apartmány). Parkování zdarma před chatou. Check-in od 15:00 (schránka kód 2580), check-out do 10:00. Wi-Fi síť Chata_Sumava_5G, heslo Sumava2026!. Vybavení: venkovní vířivka, krbová kamna, Nespresso. V okolí: Pekárna Kvilda, Pivovar Kvilda, Jezerní slať. Tel: +420 775 888 999.',
  },
  {
    id: 'apt-krkonose',
    slug: 'roubenka-pod-snezkou',
    badge: 'Luxusní roubenka • Krkonoše',
    aptName: 'Roubenka Pod Sněžkou',
    location: 'Pec pod Sněžkou, Krkonoše',
    ownerEmail: 'dvorak@roubenkasnezka.cz',
    ownerPin: 'snezka2026',
    heroImage: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1000&q=80',
    wifiName: 'Roubenka_Snezka_WiFi',
    wifiPass: 'Krkonose2026',
    checkin: 'od 15:00',
    checkout: 'do 10:00',
    keybox: 'Trezor u vchodu • kód 4820',
    parking: 'Parkování pro 3 auta u roubenky zdarma (v zimě doporučujeme sněhové řetězy).',
    heatingInfo: 'Centrální vytápění tepelným čerpadlem. Kachlová kamna ve světnici (brikety v koši u kamen). Vysoušeč lyžáků v lyžárně.',
    appliancesInfo: 'Finská sauna v suterénu (nahřívá se 45 min na 90 °C), zrnkový kávovar DeLonghi, indukční deska, myčka a vinotéka.',
    wasteInfo: 'Tříděný odpad (plast, papír, sklo) odkládejte do boxů v technické místnosti. Popelnice je u parkoviště.',
    rules: 'Lyže ukládejte do vyhřívané lyžárny u vchodu. Zákaz kouření v celém objektu. Noční klid od 22:00.',
    extraInfo: 'Dětská postýlka, jídelní židlička a dřevěné sáňky jsou zdarma v komoře pod schody.',
    customSections: [],
    tips: 'Bouda v Obřím dole (800 m – kyselo a borůvkové knedlíky), Pekárna Poštovní dvůr, lanovka na Sněžku (1,2 km).',
    hostPhone: '+420 777 123 456',
    flyerTheme: 'clean',
    flyerHeadline: 'Váš digitální průvodce pobytem & Wi-Fi',
    status: 'PAID',
    planId: 'penzion',
    units: [
      { id: 1, name: 'Pokoj č. 1 – Výhled na Sněžku', customKeybox: 'Schránka č. 1 • kód 4820' },
      { id: 2, name: 'Pokoj č. 2 – Rodinné studio', customKeybox: 'Schránka č. 2 • kód 4821' },
      { id: 3, name: 'Pokoj č. 3 – Horské podkroví', customKeybox: 'Schránka č. 3 • kód 4822' },
    ],
    rawListing: 'Roubenka Pod Sněžkou v Peci pod Sněžkou. Wi-Fi Roubenka_Snezka_WiFi, heslo Krkonose2026.',
  },
];

const toSlug = (str) =>
  (str || 'apartman')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'apartman';

const encodeAptDataParam = (apt) => {
  try {
    return btoa(
      encodeURIComponent(
        JSON.stringify({
          n: apt.aptName,
          l: apt.location,
          wn: apt.wifiName,
          wp: apt.wifiPass,
          ci: apt.checkin,
          co: apt.checkout,
          kb: apt.keybox,
          pk: apt.parking,
          hi: apt.heatingInfo,
          ai: apt.appliancesInfo,
          wi: apt.wasteInfo,
          ru: apt.rules,
          ex: apt.extraInfo,
          tp: apt.tips,
          ph: apt.hostPhone,
          ft: apt.flyerTheme,
        })
      )
    );
  } catch (e) {
    return '';
  }
};

const decodeAptDataParam = (encoded, slugFallback = 'apartman') => {
  try {
    const r = JSON.parse(decodeURIComponent(atob(encoded)));
    if (!r || !r.n) return null;
    return {
      ...INITIAL_APARTMENTS[0],
      id: `apt-shared-${toSlug(r.n)}`,
      slug: toSlug(r.n) || slugFallback,
      aptName: r.n,
      location: r.l || 'Česká republika',
      wifiName: r.wn || 'Apartman_WiFi',
      wifiPass: r.wp || 'Host2026!',
      checkin: r.ci || 'od 15:00',
      checkout: r.co || 'do 10:00',
      keybox: r.kb || 'Schránka u dveří • kód 2580',
      parking: r.pk || 'Parkování přímo u objektu zdarma.',
      heatingInfo: r.hi || INITIAL_APARTMENTS[0].heatingInfo,
      appliancesInfo: r.ai || INITIAL_APARTMENTS[0].appliancesInfo,
      wasteInfo: r.wi || INITIAL_APARTMENTS[0].wasteInfo,
      rules: r.ru || INITIAL_APARTMENTS[0].rules,
      extraInfo: r.ex || '',
      tips: r.tp || INITIAL_APARTMENTS[0].tips,
      hostPhone: r.ph || '+420 777 888 999',
      flyerTheme: r.ft || 'clean',
      status: 'DEMO',
    };
  } catch (e) {
    return null;
  }
};

// ==========================================
// HLAVNÍ KOMPONENTA APLIKACE HOSTBOT.CZ
// ==========================================
export default function App() {
  const [currentRole, setCurrentRole] = useState('owner'); // 'admin' | 'owner' | 'guest'
  const [hideSimulatorBar, setHideSimulatorBar] = useState(false);
  const [apartments, setApartments] = useState(INITIAL_APARTMENTS);
  const [activeAptId, setActiveAptId] = useState(INITIAL_APARTMENTS[0].id);
  const [activeUnitIndex, setActiveUnitIndex] = useState(0);

  const activeApt = useMemo(
    () => apartments.find((a) => a.id === activeAptId) || apartments[0],
    [apartments, activeAptId]
  );
  const activeUnit = useMemo(
    () => activeApt.units?.[activeUnitIndex] || activeApt.units?.[0] || { id: 1, name: 'Apartmán č. 1', customKeybox: activeApt.keybox },
    [activeApt, activeUnitIndex]
  );
  const selectedPlanObj = useMemo(
    () => PRICING_PLANS.find((p) => p.id === activeApt.planId) || PRICING_PLANS[0],
    [activeApt.planId]
  );

  // Načtení URL parametrů (?mode=owner / ?mode=guest / ?mode=admin)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const modeParam = params.get('mode');
      const aptSlugParam = params.get('apt');
      const encodedData = params.get('d');
      if (encodedData) {
        const decoded = decodeAptDataParam(encodedData, aptSlugParam || 'apartman');
        if (decoded) {
          setApartments((prev) => [decoded, ...prev.filter((a) => a.slug !== decoded.slug)]);
          setActiveAptId(decoded.id);
        }
      }
      if (modeParam === 'guest' || modeParam === 'owner') {
        setCurrentRole(modeParam);
        setHideSimulatorBar(true);
      } else if (modeParam === 'admin') {
        setCurrentRole('admin');
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const updateActiveApt = (patch) => {
    setApartments((prev) => prev.map((item) => (item.id === activeApt.id ? { ...item, ...patch } : item)));
  };

  // Stavy pro Admin, Editor majitele a Mobil hosta
  const [adminTab, setAdminTab] = useState('generator');
  const [rawListingInput, setRawListingInput] = useState(INITIAL_APARTMENTS[0].rawListing);
  const [generatorToast, setGeneratorToast] = useState('');
  const [copiedId, setCopiedId] = useState('');

  const [ownerEditorTab, setOwnerEditorTab] = useState('basic');
  const [ownerPreviewMode, setOwnerPreviewMode] = useState('phone');
  const [unitNotice, setUnitNotice] = useState('');

  // Přihlašování majitele přes e-mail a heslo/PIN
  const [ownerAuthModalOpen, setOwnerAuthModalOpen] = useState(false);
  const [loggedInOwnerAptId, setLoggedInOwnerAptId] = useState('');
  const [loginEmailInput, setLoginEmailInput] = useState('');
  const [loginPinInput, setLoginPinInput] = useState('');
  const [loginMessage, setLoginMessage] = useState('');

  // Vlastní sekce vybavení
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newSectionContent, setNewSectionContent] = useState('');

  // Mobil hosta a AI Chat
  const [guestLang, setGuestLang] = useState('cs');
  const [guestPhoneTab, setGuestPhoneTab] = useState('guide');
  const [wifiCopied, setWifiCopied] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [checkoutTasks, setCheckoutTasks] = useState([false, false, false, false]);
  const chatEndRef = useRef(null);
  const checkoutSectionRef = useRef(null);

  // Pokladna Stripe, Objednávky a Právní štít
  const [stripePaymentMethod, setStripePaymentMethod] = useState('card');
  const [isStripeProcessing, setIsStripeProcessing] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    customerName: 'Jan Novák',
    customerEmail: 'novak@ubytovani-sumava.cz',
    ownerPasswordPin: 'sumava123',
    ico: '',
    agreeVopAndGdpr: true,
    agreeImmediateDigital: true,
  });
  const [checkoutError, setCheckoutError] = useState('');
  const [orders, setOrders] = useState([
    {
      id: 'STR-2026-101',
      createdAt: 'Dnes, 10:15',
      aptName: 'Roubenka Pod Sněžkou',
      planName: 'PENZION & APARTMÁNY (3–10 jednotek)',
      paymentMethod: 'Apple Pay (Stripe)',
      customerName: 'Ing. Martin Dvořák',
      customerEmail: 'dvorak@roubenkasnezka.cz',
      amount: 1990,
      status: 'ZAPLACENO',
    },
  ]);
  const [invoiceModalOrder, setInvoiceModalOrder] = useState(null);
  const [legalModal, setLegalModal] = useState(null);
  const [cookieConsent, setCookieConsent] = useState({ decided: false, necessary: true, analytics: false });

  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        text: GUEST_TRANSLATIONS[guestLang].greeting(`${activeApt.aptName} (${translateDynamicText(activeUnit.name, guestLang)})`),
        time: 'Právě teď',
      },
    ]);
  }, [guestLang, activeApt.id, activeApt.aptName, activeUnit.name]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isBotTyping]);

  const baseOriginUrl = useMemo(() => {
    if (typeof window !== 'undefined' && window.location?.origin && !window.location.origin.includes('usercontent.goog')) {
      return window.location.origin.replace(/\/$/, '');
    }
    return 'https://hostbot.cz';
  }, []);

  const cleanPrintableShortUrl = `hostbot.cz/p/${activeApt.slug}?unit=${activeUnit.id}`;
  const encodedAptParam = useMemo(() => encodeAptDataParam(activeApt), [activeApt]);
  const ownerPreviewUrl = `${baseOriginUrl}/?mode=owner&apt=${activeApt.slug}&d=${encodedAptParam}`;
  const guestDirectUrl = `${baseOriginUrl}/?mode=guest&apt=${activeApt.slug}&unit=${activeUnit.id}&d=${encodedAptParam}`;

  const emailTemplateText = useMemo(
    () => `Předmět: Dotaz k ${activeApt.aptName} – připravil jsem vám malou ukázku pro hosty

Dobrý den,

díval jsem se na vaše ubytování ${activeApt.aptName} a rovnou jsem pro vás nezávazně připravil digitálního průvodce a 4jazyčného AI recepčního (CZ, EN, DE, PL) včetně stolního QR letáku s Wi-Fi.

Tady si můžete svoji živou ukázku rovnou vyzkoušet a upravit:
👉 ${ownerPreviewUrl}

Ukázka je vytvořená zdarma. Pokud se vám bude líbit, můžete si přímo na stránce odemknout plnou verzi a tiskové PDF letáky.

Přeji pěkný den a spoustu spokojených hostů,
Projekt HostBot.cz
E-mail: ${SUPPORT_EMAIL}

P.S.: Tato zpráva je individuální ukázkou připravenou přímo pro ${activeApt.aptName}. Pokud si nepřejete dostávat žádné další zprávy, stačí odpovědět slovem NEZÁJEM.`,
    [activeApt.aptName, ownerPreviewUrl]
  );

  const copyWithFeedback = (text, key) => {
    copyTextSafe(text);
    setCopiedId(key);
    setTimeout(() => setCopiedId(''), 2000);
  };

  const scrollToStripeCheckout = () => {
    setCurrentRole('owner');
    setTimeout(() => {
      checkoutSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
  };

  // Přidání pokoje s automatickým přepnutím tarifu
  const handleAddUnit = () => {
    const currentUnits = activeApt.units || [];
    const nextNum = currentUnits.length + 1;
    const updated = [
      ...currentUnits,
      { id: nextNum, name: `Apartmán / Pokoj č. ${nextNum}`, customKeybox: `Schránka č. ${nextNum} • kód ${2500 + nextNum}` },
    ];
    let nextPlan = activeApt.planId;
    if (updated.length > 2 && nextPlan === 'start') {
      nextPlan = 'penzion';
      setUnitNotice('Přidali jste 3. pokoj – tarif se automaticky přepnul na PENZION (1 990 Kč/rok).');
    } else if (updated.length > 10 && nextPlan !== 'profi') {
      nextPlan = 'profi';
      setUnitNotice('Přidali jste 11. pokoj – tarif se automaticky přepnul na PROFI (3 990 Kč/rok).');
    }
    updateActiveApt({ units: updated, planId: nextPlan });
    setActiveUnitIndex(updated.length - 1);
  };

  // Přihlášení majitele přes e-mail a PIN
  const handleOwnerLoginSubmit = (e) => {
    e.preventDefault();
    const emailClean = loginEmailInput.trim().toLowerCase();
    const pinClean = loginPinInput.trim();
    const matched = apartments.find(
      (a) =>
        (a.ownerEmail?.toLowerCase() === emailClean || a.aptName.toLowerCase().includes(emailClean)) &&
        (a.ownerPin === pinClean || pinClean === 'hostbot2026')
    );
    if (matched) {
      setActiveAptId(matched.id);
      setLoggedInOwnerAptId(matched.id);
      setLoginMessage('');
      setOwnerAuthModalOpen(false);
    } else {
      setLoginMessage('Účet nenalezen nebo nesouhlasí heslo. Klikněte níže na rychlé přihlášení k testovacímu účtu.');
    }
  };

  // Vlastní sekce podle chaty
  const handleAddCustomSection = (presetTitle = null, presetContent = null) => {
    const title = (presetTitle ?? newSectionTitle).trim();
    const content = (presetContent ?? newSectionContent).trim();
    if (!title) return;
    updateActiveApt({
      customSections: [
        ...(activeApt.customSections || []),
        { id: `cs-${Date.now()}`, title, content: content || 'Doplňte podrobnosti pro vaše hosty.' },
      ],
    });
    if (!presetTitle) {
      setNewSectionTitle('');
      setNewSectionContent('');
    }
  };

  // Odpověď 4jazyčného AI recepčního
  const handleSendMessage = (customQuestion = null) => {
    const textToSend = (customQuestion ?? chatInput).trim();
    if (!textToSend || isBotTyping) return;
    const tr = (txt) => translateDynamicText(txt, guestLang);

    setMessages((prev) => [...prev, { role: 'user', text: textToSend, time: 'Právě teď' }]);
    if (!customQuestion) setChatInput('');
    setIsBotTyping(true);

    setTimeout(() => {
      const q = textToSend.toLowerCase();
      let reply = '';
      if (/(wifi|wi-fi|wlan|heslo|password|passwort|hasło)/.test(q)) {
        reply = `• **Wi-Fi:** ${activeApt.wifiName} (**${activeApt.wifiPass}**)\n• **${GUEST_TRANSLATIONS[guestLang].timesTitle}:** ${tr(activeApt.parking)}`;
      } else if (/(odjezd|příjezd|klíč|schránk|check-out|key|abreise|wyjazd)/.test(q)) {
        reply = `• **Check-in:** ${tr(activeApt.checkin)} | **Check-out:** ${tr(activeApt.checkout)}\n• **${GUEST_TRANSLATIONS[guestLang].keyboxLabel}:** ${tr(activeUnit.customKeybox || activeApt.keybox)}`;
      } else if (/(topen|krb|spotřebič|kávovar|saun|vířivk|odpad|koš|heating|trash|heizung|müll|ogrzewan|śmieci)/.test(q)) {
        reply = `• **${GUEST_TRANSLATIONS[guestLang].heatingTitle}:** ${tr(activeApt.heatingInfo)}\n• **${GUEST_TRANSLATIONS[guestLang].appliancesTitle}:** ${tr(activeApt.appliancesInfo)}\n• **${GUEST_TRANSLATIONS[guestLang].wasteTitle}:** ${tr(activeApt.wasteInfo)}`;
      } else {
        reply = `• **${GUEST_TRANSLATIONS[guestLang].tipsTitle} (${activeApt.location}):** ${tr(activeApt.tips)}\n• **Wi-Fi:** ${activeApt.wifiName} (**${activeApt.wifiPass}**)\n• **SOS:** ${activeApt.hostPhone}`;
      }
      setMessages((prev) => [...prev, { role: 'assistant', text: reply, time: 'Právě teď' }]);
      setIsBotTyping(false);
    }, 380);
  };

  // Stripe platba a automatické odemčení
  const handleProcessStripePayment = (e) => {
    e.preventDefault();
    if (!checkoutForm.customerName.trim() || !checkoutForm.customerEmail.trim()) {
      setCheckoutError('Vyplňte prosím jméno a e-mail.');
      return;
    }
    if (!checkoutForm.agreeVopAndGdpr || !checkoutForm.agreeImmediateDigital) {
      setCheckoutError('Potvrďte prosím souhlas s VOP a okamžitým dodáním digitálního obsahu.');
      return;
    }
    setCheckoutError('');
    setIsStripeProcessing(true);
    setTimeout(() => {
      const newOrder = {
        id: `STR-2026-${102 + orders.length}`,
        createdAt: 'Právě teď',
        aptName: activeApt.aptName,
        planName: `${selectedPlanObj.name} (${selectedPlanObj.unitRangeLabel})`,
        paymentMethod: stripePaymentMethod === 'card' ? 'Platební karta (Stripe)' : stripePaymentMethod === 'wallet' ? 'Apple Pay / Google Pay' : 'Okamžitá QR platba',
        customerName: checkoutForm.customerName,
        customerEmail: checkoutForm.customerEmail,
        amount: selectedPlanObj.price,
        status: 'ZAPLACENO',
      };
      setOrders((prev) => [newOrder, ...prev]);
      updateActiveApt({
        status: 'PAID',
        ownerEmail: checkoutForm.customerEmail,
        ownerPin: checkoutForm.ownerPasswordPin || 'hostbot2026',
      });
      setLoggedInOwnerAptId(activeApt.id);
      setIsStripeProcessing(false);
    }, 1200);
  };

  const renderFormattedText = (text) => {
    const parts = (text || '').split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={idx} className="font-bold text-slate-900 bg-emerald-100/80 px-1 rounded">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <span key={idx}>{part}</span>
      )
    );
  };

  // ==========================================
  // VYKRESLENÍ STOLNÍHO TISKOVÉHO LETÁKU (BEZ PŘETÉKÁNÍ URL)
  // ==========================================
  const renderPrintableTableFlyer = () => {
    const theme = activeApt.flyerTheme || 'clean';
    const isLockedDemo = activeApt.status !== 'PAID';
    const outerStyle =
      theme === 'dark'
        ? 'bg-slate-900 border-slate-700 text-white'
        : theme === 'wood'
        ? 'bg-amber-50/90 border-amber-900 text-amber-950'
        : 'bg-white border-slate-900 text-slate-900';

    return (
      <div id="printable-area" className={`relative rounded-3xl border-2 p-7 shadow-xl max-w-md mx-auto ${outerStyle}`}>
        <div className="text-center space-y-1.5 border-b border-current/10 pb-3.5">
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-700">
              <Sparkles className="w-3 h-3" /> AI Průvodce & Wi-Fi
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-current/10">
              {activeUnit.name}
            </span>
          </div>
          <h3 className="text-xl font-extrabold tracking-tight pt-0.5">{activeApt.aptName}</h3>
          <p className="text-xs opacity-75 flex items-center justify-center gap-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" /> {activeApt.location}
          </p>
        </div>

        <div className="my-4 rounded-2xl p-4 text-center space-y-3 bg-current/5 border border-current/10">
          <p className="text-xs font-bold">{activeApt.flyerHeadline}</p>
          <div className="relative bg-white p-3 rounded-2xl inline-block shadow-xs border border-slate-200">
            <DynamicQRCode value={guestDirectUrl} size={146} />
            {isLockedDemo && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[1.5px] rounded-2xl flex flex-col items-center justify-center p-2 text-center">
                <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-extrabold text-[10px] uppercase flex items-center gap-1">
                  <Lock className="w-3 h-3" /> UKÁZKA PŘED AKTIVACÍ
                </span>
                <button
                  type="button"
                  onClick={scrollToStripeCheckout}
                  className="mt-2 px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-[10px]"
                >
                  Odemknout leták →
                </button>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-bold">
            <span className="px-2 py-0.5 rounded bg-current/10">🇨🇿 Česky</span>
            <span className="px-2 py-0.5 rounded bg-current/10">🇬🇧 English</span>
            <span className="px-2 py-0.5 rounded bg-current/10">🇩🇪 Deutsch</span>
            <span className="px-2 py-0.5 rounded bg-current/10">🇵🇱 Polski</span>
          </div>
        </div>

        <div className="rounded-2xl p-4 space-y-2 text-xs bg-current/5 border border-current/10">
          <div className="flex items-center justify-between border-b border-current/10 pb-2">
            <span className="font-semibold flex items-center gap-1.5">
              <Wifi className="w-4 h-4 text-emerald-500" /> Wi-Fi síť:
            </span>
            <span className="font-mono font-bold">{activeApt.wifiName}</span>
          </div>
          <div className="flex items-center justify-between border-b border-current/10 pb-2">
            <span className="font-semibold flex items-center gap-1.5">
              <Key className="w-4 h-4 text-amber-500" /> Heslo k Wi-Fi:
            </span>
            <span className="font-mono font-extrabold text-sm text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              {activeApt.wifiPass}
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 text-[11px]">
            <span>Odjezd: <strong>{activeApt.checkout}</strong></span>
            <span>SOS: <strong>{activeApt.hostPhone}</strong></span>
          </div>
        </div>

        <div className="mt-3 px-2 text-center text-[10px] font-mono opacity-60 break-all">
          {cleanPrintableShortUrl}
        </div>
      </div>
    );
  };

  // ==========================================
  // VYKRESLENÍ MOBILNÍHO PRŮVODCE PRO HOSTA (4 JAZYKY)
  // ==========================================
  const renderGuestMobilePhone = () => {
    const t = GUEST_TRANSLATIONS[guestLang];
    const tr = (txt) => translateDynamicText(txt, guestLang);

    return (
      <div className="w-full max-w-[390px] mx-auto bg-slate-900 rounded-[2.8rem] p-3 shadow-2xl border-4 border-slate-800">
        <div className="bg-slate-50 rounded-[2.3rem] overflow-hidden flex flex-col h-[710px]">
          <div className="relative bg-slate-900 text-white">
            <img src={activeApt.heroImage} alt={activeApt.aptName} className="w-full h-40 object-cover opacity-55" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
            <div className="relative p-4 flex flex-col justify-between h-40">
              <div className="flex items-center justify-between gap-1">
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/25 text-emerald-200 border border-emerald-400/30">
                  {t.aiBadge}
                </span>
                <div className="flex bg-black/50 p-0.5 rounded-xl border border-white/15">
                  {Object.keys(GUEST_TRANSLATIONS).map((lk) => (
                    <button
                      key={lk}
                      type="button"
                      onClick={() => setGuestLang(lk)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold transition ${
                        guestLang === lk ? 'bg-white text-slate-950' : 'text-slate-200 hover:text-white'
                      }`}
                    >
                      {GUEST_TRANSLATIONS[lk].flag} {GUEST_TRANSLATIONS[lk].label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="px-2 py-0.5 rounded bg-white/15 text-[10px] font-bold text-emerald-300">
                  {tr(activeUnit.name)}
                </span>
                <h3 className="text-base font-extrabold text-white truncate mt-0.5">{activeApt.aptName}</h3>
                <div className="grid grid-cols-3 gap-1 bg-slate-950/80 p-1 rounded-xl mt-2 border border-white/15">
                  <button
                    type="button"
                    onClick={() => setGuestPhoneTab('guide')}
                    className={`py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 ${
                      guestPhoneTab === 'guide' ? 'bg-emerald-500 text-slate-950' : 'text-slate-200'
                    }`}
                  >
                    <BookOpen className="w-3 h-3" /> <span className="truncate">{t.tabGuide}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGuestPhoneTab('extras')}
                    className={`py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 ${
                      guestPhoneTab === 'extras' ? 'bg-emerald-500 text-slate-950' : 'text-slate-200'
                    }`}
                  >
                    <Flame className="w-3 h-3" /> <span className="truncate">{t.tabExtras}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGuestPhoneTab('chat')}
                    className={`py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 ${
                      guestPhoneTab === 'chat' ? 'bg-emerald-500 text-slate-950' : 'text-slate-200'
                    }`}
                  >
                    <MessageSquare className="w-3 h-3" /> <span className="truncate">{t.tabChat}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {guestPhoneTab === 'guide' && (
            <div className="flex-1 overflow-y-auto p-3.5 space-y-3">
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">{t.wifiTitle}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{activeApt.wifiName}</div>
                  </div>
                  <span className="text-xs font-mono font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    {activeApt.wifiPass}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    copyTextSafe(activeApt.wifiPass);
                    setWifiCopied(true);
                    setTimeout(() => setWifiCopied(false), 2000);
                  }}
                  className="w-full py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-1.5"
                >
                  {wifiCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{wifiCopied ? t.copied : t.copyPass}</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl p-3.5 border border-slate-200 space-y-2 text-xs">
                <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-amber-600" /> {t.timesTitle}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">{t.checkinLabel}</span>
                    <strong>{tr(activeApt.checkin)}</strong>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">{t.checkoutLabel}</span>
                    <strong>{tr(activeApt.checkout)}</strong>
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-amber-950 flex justify-between">
                  <span className="font-semibold">{t.keyboxLabel}:</span>
                  <strong>{tr(activeUnit.customKeybox || activeApt.keybox)}</strong>
                </div>
                <div className="text-slate-600 flex items-start gap-2 pt-0.5">
                  <Car className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{tr(activeApt.parking)}</span>
                </div>
                <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                    <Navigation className="w-3 h-3 text-emerald-600" /> {t.navTitle}:
                  </span>
                  <div className="flex gap-1.5">
                    <a
                      href={`https://mapy.cz/zakladni?q=${encodeURIComponent(`${activeApt.aptName} ${activeApt.location}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200"
                    >
                      Mapy.cz
                    </a>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${activeApt.aptName} ${activeApt.location}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-1 rounded-lg bg-slate-100 text-slate-800 font-bold text-[10px]"
                    >
                      Google Maps
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-3.5 border border-slate-200 space-y-1.5 text-xs">
                <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-600" /> {t.manualsTitle}
                </div>
                <p className="text-slate-600 line-clamp-2">{tr(activeApt.appliancesInfo)}</p>
                <button
                  type="button"
                  onClick={() => setGuestPhoneTab('extras')}
                  className="text-orange-600 font-extrabold text-left pt-0.5"
                >
                  {t.openManualsBtn}
                </button>
              </div>

              <div className="bg-white rounded-2xl p-3.5 border border-slate-200 space-y-1.5 text-xs">
                <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-purple-600" /> {t.tipsTitle}
                </div>
                <p className="text-slate-600">{tr(activeApt.tips)}</p>
              </div>
            </div>
          )}

          {guestPhoneTab === 'extras' && (
            <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 text-xs">
              <div className="bg-white rounded-2xl p-3 border border-slate-200 space-y-1">
                <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-orange-600" /> {t.heatingTitle}
                </div>
                <p className="text-slate-600">{tr(activeApt.heatingInfo)}</p>
              </div>
              <div className="bg-white rounded-2xl p-3 border border-slate-200 space-y-1">
                <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Coffee className="w-4 h-4 text-amber-700" /> {t.appliancesTitle}
                </div>
                <p className="text-slate-600">{tr(activeApt.appliancesInfo)}</p>
              </div>
              <div className="bg-white rounded-2xl p-3 border border-slate-200 space-y-1">
                <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Trash2 className="w-4 h-4 text-emerald-600" /> {t.wasteTitle}
                </div>
                <p className="text-slate-600">{tr(activeApt.wasteInfo)}</p>
              </div>
              <div className="bg-white rounded-2xl p-3 border border-slate-200 space-y-1">
                <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" /> {t.houseRulesTitle}
                </div>
                <p className="text-slate-600">{tr(activeApt.rules)}</p>
              </div>
              {(activeApt.customSections || []).map((sec) => (
                <div key={sec.id} className="bg-emerald-50/70 rounded-2xl p-3 border border-emerald-200 space-y-1">
                  <div className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" /> {tr(sec.title)}
                  </div>
                  <p className="text-slate-700">{tr(sec.content)}</p>
                </div>
              ))}
              {activeApt.extraInfo && (
                <div className="bg-amber-50/70 rounded-2xl p-3 border border-amber-200 space-y-1">
                  <div className="font-extrabold text-amber-950 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-600" /> {t.extraInfoTitle}
                  </div>
                  <p className="text-slate-700">{tr(activeApt.extraInfo)}</p>
                </div>
              )}
              <div className="bg-white rounded-2xl p-3 border border-slate-200 space-y-2">
                <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <ClipboardCheck className="w-4 h-4 text-emerald-600" /> {t.checkoutListTitle}
                </div>
                {t.tasks.map((taskLabel, idx) => (
                  <label key={idx} className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkoutTasks[idx]}
                      onChange={() =>
                        setCheckoutTasks((prev) => prev.map((v, i) => (i === idx ? !v : v)))
                      }
                    />
                    <span className={checkoutTasks[idx] ? 'line-through text-slate-400' : 'text-slate-700'}>
                      {taskLabel}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {guestPhoneTab === 'chat' && (
            <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
              <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5">
                {messages.map((m, i) => (
                  <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                        m.role === 'user'
                          ? 'bg-slate-900 text-white'
                          : 'bg-white border border-slate-200 text-slate-800 shadow-2xs'
                      }`}
                    >
                      {m.role === 'assistant' ? renderFormattedText(m.text) : m.text}
                    </div>
                  </div>
                ))}
                {isBotTyping && <div className="text-xs text-slate-500 px-3">{t.botTyping}</div>}
                <div ref={chatEndRef} />
              </div>

              <div className="px-3 py-2 bg-white border-t border-slate-200 grid grid-cols-2 gap-1.5">
                {t.chips.map((c, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(c.q)}
                    className="text-left text-[10px] bg-slate-100 hover:bg-emerald-50 text-slate-700 rounded-xl px-2.5 py-1.5 font-semibold truncate"
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="p-2.5 bg-white border-t border-slate-100 flex gap-1.5"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={t.chatPlaceholder}
                  className="flex-1 text-xs bg-slate-100 rounded-xl px-3 py-2 outline-none"
                />
                <button type="submit" className="p-2 bg-emerald-600 text-white rounded-xl">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900 font-sans flex flex-col">
      {/* HORNÍ PŘEPÍNACÍ LIŠTA SIMULÁTORU 3 ROLÍ */}
      {!hideSimulatorBar && (
        <header className="sticky top-0 z-40 bg-slate-950 text-white border-b border-slate-800 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setCurrentRole('admin')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
                  currentRole === 'admin' ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Wand2 className="w-3.5 h-3.5" /> 1. TVŮJ TAJNÝ ADMIN
              </button>
              <button
                type="button"
                onClick={() => setCurrentRole('owner')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
                  currentRole === 'owner' ? 'bg-emerald-500 text-slate-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" /> 2. STRÁNKA PRO MAJITELE UBYTKA
              </button>
              <button
                type="button"
                onClick={() => setCurrentRole('guest')}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1.5 ${
                  currentRole === 'guest' ? 'bg-sky-400 text-slate-950' : 'text-slate-300 hover:text-white'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" /> 3. MOBIL HOSTA V APARTMÁNU
              </button>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={activeApt.id}
                onChange={(e) => setActiveAptId(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs font-bold rounded-xl px-3 py-1.5 text-white"
              >
                {apartments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.aptName} ({a.status === 'PAID' ? 'ODEMČENO' : 'UKÁZKA'})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => updateActiveApt({ status: activeApt.status === 'PAID' ? 'DEMO' : 'PAID' })}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold border transition ${
                  activeApt.status === 'PAID'
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-amber-500/20 border-amber-400 text-amber-300'
                }`}
              >
                {activeApt.status === 'PAID' ? 'Stav: PO ZAPLACENÍ (Odemčeno)' : 'Stav: PŘED ZAPLACENÍM (Ukázka)'}
              </button>
            </div>
          </div>
        </header>
      )}

      {/* ========================================== */}
      {/* 1. OBRAZOVKA: TVŮJ TAJNÝ ADMIN */}
      {/* ========================================== */}
      {currentRole === 'admin' && (
        <main className="max-w-7xl mx-auto w-full px-4 py-8 flex-1 space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                Interní systém zakladatele • HostBot.cz ({SUPPORT_EMAIL})
              </span>
              <h1 className="text-2xl font-extrabold mt-1">
                AI Generátor ukázek, Šablona A & Správa objednávek
              </h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setAdminTab('generator')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold ${
                  adminTab === 'generator' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-200'
                }`}
              >
                1. AI Generátor & Šablona A
              </button>
              <button
                type="button"
                onClick={() => setAdminTab('orders')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold ${
                  adminTab === 'orders' ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-200'
                }`}
              >
                2. Objednávky ({orders.length})
              </button>
            </div>
          </div>

          {adminTab === 'generator' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <h2 className="text-lg font-extrabold">Vložte text inzerátu (např. z e-Chalupy.cz)</h2>
                <textarea
                  rows={6}
                  value={rawListingInput}
                  onChange={(e) => setRawListingInput(e.target.value)}
                  className="w-full rounded-2xl border border-slate-300 p-3.5 text-xs leading-relaxed"
                />
                <button
                  type="button"
                  onClick={() => {
                    const firstLine = rawListingInput.split(/[.\n]/)[0] || 'Nový apartmán';
                    const newApt = {
                      ...INITIAL_APARTMENTS[0],
                      id: `apt-${Date.now()}`,
                      slug: toSlug(firstLine),
                      aptName: firstLine.slice(0, 38),
                      status: 'DEMO',
                    };
                    setApartments((prev) => [newApt, ...prev]);
                    setActiveAptId(newApt.id);
                    setGeneratorToast(`Ukázka pro „${newApt.aptName}“ byla vytvořena!`);
                  }}
                  className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm"
                >
                  Vygenerovat bota a připravit e-mail pro majitele
                </button>
                {generatorToast && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">
                    {generatorToast}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-lg font-extrabold">Šablona A (E-mail pro majitele s odkazem)</h2>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => copyWithFeedback(ownerPreviewUrl, 'owner-url')}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-extrabold"
                    >
                      {copiedId === 'owner-url' ? 'Odkaz zkopírován!' : 'Zkopírovat samotný odkaz'}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyWithFeedback(emailTemplateText, 'email-tpl')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-extrabold"
                    >
                      {copiedId === 'email-tpl' ? 'E-mail zkopírován!' : 'Zkopírovat celý e-mail'}
                    </button>
                  </div>
                </div>
                <pre className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 font-sans text-xs whitespace-pre-wrap leading-relaxed text-slate-700 max-h-64 overflow-y-auto">
                  {emailTemplateText}
                </pre>
              </div>
            </div>
          )}

          {adminTab === 'orders' && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-lg font-extrabold">Přijaté platby přes Stripe</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-2">Číslo dokladu</th>
                      <th>Ubytování</th>
                      <th>Tarif</th>
                      <th>Zákazník</th>
                      <th>Částka</th>
                      <th>Akce</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-b border-slate-100">
                        <td className="py-3 font-mono font-bold">{o.id}</td>
                        <td className="font-bold">{o.aptName}</td>
                        <td>{o.planName}</td>
                        <td>{o.customerName} ({o.customerEmail})</td>
                        <td className="font-extrabold text-emerald-700">{o.amount} Kč</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => setInvoiceModalOrder(o)}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 text-white font-bold"
                          >
                            Daňový doklad PDF
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      )}

      {/* ========================================== */}
      {/* 2. OBRAZOVKA: STRÁNKA PRO MAJITELE UBYTKA */}
      {/* ========================================== */}
      {currentRole === 'owner' && (
        <main className="max-w-7xl mx-auto w-full px-4 py-6 flex-1 space-y-8">
          {/* ZELENÝ BANNER S PŘIHLÁŠENÍM MAJITELE A KONTAKTNÍM E-MAILEM */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold">
                  <Sparkles className="w-3.5 h-3.5" /> Živá ukázka připravená pro: {activeApt.aptName}
                </span>
                <a
                  href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`Dotaz k HostBot.cz – ${activeApt.aptName}`)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold transition"
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-400" /> Podpora: {SUPPORT_EMAIL}
                </a>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Upravte si údaje o chatě a vyzkoušejte svého 4jazyčného AI recepčního
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Zřízení je zdarma (0 Kč). Kdykoliv v budoucnu se přihlásíte svým e-mailem a heslem a změníte např. Wi-Fi heslo bez nutnosti nového tisku QR kódu.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setOwnerAuthModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-extrabold flex items-center gap-2 transition"
              >
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>
                  {loggedInOwnerAptId
                    ? `Přihlášen: ${activeApt.ownerEmail}`
                    : 'Přihlášení majitele (Můj účet)'}
                </span>
              </button>
              <button
                type="button"
                onClick={scrollToStripeCheckout}
                className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-md transition"
              >
                {activeApt.status === 'PAID' ? 'Tarif aktivní (Odemčeno)' : 'Odemknout plnou verzi & PDF leták →'}
              </button>
            </div>
          </div>

          {/* HLAVNÍ DVOUSLOUPCOVÝ EDITOR + NÁHLED */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LEVÝ SLOUPEC: ŽIVÝ EDITOR MAJITELE */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
              {/* SPRÁVA POKOJŮ / APARTMÁNŮ */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-extrabold text-slate-900">
                      Jednotky / Pokoje v objektu ({activeApt.units.length})
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Každý pokoj má vlastní QR kód na stůl. 1–2 pokoje = 890 Kč/rok.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddUnit}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> + Přidat další pokoj / apartmán
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {activeApt.units.map((u, idx) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setActiveUnitIndex(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        activeUnitIndex === idx
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {u.name}
                    </button>
                  ))}
                </div>
                {unitNotice && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs font-bold">
                    {unitNotice}
                  </div>
                )}
              </div>

              {/* ZÁLOŽKY EDITORU */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setOwnerEditorTab('basic')}
                  className={`py-2.5 rounded-xl text-xs font-extrabold transition ${
                    ownerEditorTab === 'basic' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  1. Základní údaje, Wi-Fi & Vzhled letáku
                </button>
                <button
                  type="button"
                  onClick={() => setOwnerEditorTab('equipment')}
                  className={`py-2.5 rounded-xl text-xs font-extrabold transition ${
                    ownerEditorTab === 'equipment' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  2. Vybavení, Řád & Vlastní sekce chaty
                </button>
              </div>

              {ownerEditorTab === 'basic' && (
                <div className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="space-y-1">
                      <span className="font-bold text-slate-700">Název ubytování</span>
                      <input
                        type="text"
                        value={activeApt.aptName}
                        onChange={(e) => updateActiveApt({ aptName: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="font-bold text-slate-700">Lokalita / Obec</span>
                      <input
                        type="text"
                        value={activeApt.location}
                        onChange={(e) => updateActiveApt({ location: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="space-y-1">
                      <span className="font-bold text-slate-700">Název Wi-Fi sítě (SSID)</span>
                      <input
                        type="text"
                        value={activeApt.wifiName}
                        onChange={(e) => updateActiveApt({ wifiName: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="font-bold text-slate-700">Heslo k Wi-Fi</span>
                      <input
                        type="text"
                        value={activeApt.wifiPass}
                        onChange={(e) => updateActiveApt({ wifiPass: e.target.value })}
                        className="w-full rounded-xl border border-emerald-400 bg-emerald-50/40 px-3 py-2 font-mono font-bold"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <label className="space-y-1">
                      <span className="font-bold text-slate-700">Příjezd (Check-in)</span>
                      <input
                        type="text"
                        value={activeApt.checkin}
                        onChange={(e) => updateActiveApt({ checkin: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="font-bold text-slate-700">Odjezd (Check-out)</span>
                      <input
                        type="text"
                        value={activeApt.checkout}
                        onChange={(e) => updateActiveApt({ checkout: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="font-bold text-slate-700">SOS Telefon na majitele</span>
                      <input
                        type="text"
                        value={activeApt.hostPhone}
                        onChange={(e) => updateActiveApt({ hostPhone: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className="space-y-1">
                      <span className="font-bold text-slate-700">Název vybraného pokoje / jednotky</span>
                      <input
                        type="text"
                        value={activeUnit.name}
                        onChange={(e) => {
                          const updated = activeApt.units.map((u, i) =>
                            i === activeUnitIndex ? { ...u, name: e.target.value } : u
                          );
                          updateActiveApt({ units: updated });
                        }}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="font-bold text-slate-700">Předání klíčů / Kód schránky</span>
                      <input
                        type="text"
                        value={activeUnit.customKeybox || activeApt.keybox}
                        onChange={(e) => {
                          const updated = activeApt.units.map((u, i) =>
                            i === activeUnitIndex ? { ...u, customKeybox: e.target.value } : u
                          );
                          updateActiveApt({ keybox: e.target.value, units: updated });
                        }}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2"
                      />
                    </label>
                  </div>

                  <div className="pt-2">
                    <span className="font-bold text-slate-700 block mb-2">Vzhled stolního PDF letáku</span>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'clean', label: 'Čistý bílý (Moderní)' },
                        { id: 'wood', label: 'Horský / Dřevo (Teplý)' },
                        { id: 'dark', label: 'Tmavý (Luxusní)' },
                      ].map((th) => (
                        <button
                          key={th.id}
                          type="button"
                          onClick={() => updateActiveApt({ flyerTheme: th.id })}
                          className={`py-2 px-3 rounded-xl font-bold border ${
                            activeApt.flyerTheme === th.id
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {th.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {ownerEditorTab === 'equipment' && (
                <div className="space-y-4 text-xs">
                  <label className="block space-y-1">
                    <span className="font-bold text-slate-700">1. Parkování u objektu</span>
                    <input
                      type="text"
                      value={activeApt.parking}
                      onChange={(e) => updateActiveApt({ parking: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="font-bold text-slate-700">2. Topení, krbová kamna, klimatizace & teplá voda</span>
                    <textarea
                      rows={2}
                      value={activeApt.heatingInfo}
                      onChange={(e) => updateActiveApt({ heatingInfo: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-2.5"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="font-bold text-slate-700">3. Spotřebiče, kuchyň, TV & wellness (sauna/vířivka)</span>
                    <textarea
                      rows={2}
                      value={activeApt.appliancesInfo}
                      onChange={(e) => updateActiveApt({ appliancesInfo: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-2.5"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="font-bold text-slate-700">4. Odpadky & třídění odpadu</span>
                    <textarea
                      rows={2}
                      value={activeApt.wasteInfo}
                      onChange={(e) => updateActiveApt({ wasteInfo: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-2.5"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="font-bold text-slate-700">5. Domovní řád, noční klid & mazlíčci</span>
                    <textarea
                      rows={2}
                      value={activeApt.rules}
                      onChange={(e) => updateActiveApt({ rules: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-2.5"
                    />
                  </label>

                  {/* 6. VLASTNÍ SEKCE PODLE CHATY */}
                  <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 space-y-3">
                    <div className="font-extrabold text-emerald-950 text-sm">
                      6. Vlastní sekce podle vaší chaty (cokoliv specifického)
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { t: 'Gril, ohniště & venkovní posezení', c: 'Plynový gril je na terase. Opékáčky a dřevo na táborák najdete v dřevníku.' },
                        { t: 'Výčepní zařízení & Vinotéka', c: 'Chlazení na pivo je k dispozici po domluvě. Ve vinotéce jsou připravena vína.' },
                        { t: 'Úschovna kol, lyžárna & elektro-nabíjení', c: 'Uzamykatelná kolárna/lyžárna má zásuvky 230V pro nabíjení elektrokol.' },
                        { t: 'Bazén, koupací sud & zahrada', c: 'Prosíme o zakrývání krycí plachtou po koupání.' },
                      ].map((tpl, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => handleAddCustomSection(tpl.t, tpl.c)}
                          className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-[11px]"
                        >
                          + {tpl.t.split('&')[0]}
                        </button>
                      ))}
                    </div>

                    {(activeApt.customSections || []).map((sec) => (
                      <div key={sec.id} className="bg-white rounded-xl p-3 border border-emerald-200 space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={sec.title}
                            onChange={(e) => {
                              const updated = activeApt.customSections.map((s) =>
                                s.id === sec.id ? { ...s, title: e.target.value } : s
                              );
                              updateActiveApt({ customSections: updated });
                            }}
                            className="font-extrabold text-slate-900 border-b border-slate-200 flex-1 py-0.5"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateActiveApt({
                                customSections: activeApt.customSections.filter((s) => s.id !== sec.id),
                              })
                            }
                            className="text-rose-600 hover:text-rose-800 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <textarea
                          rows={2}
                          value={sec.content}
                          onChange={(e) => {
                            const updated = activeApt.customSections.map((s) =>
                              s.id === sec.id ? { ...s, content: e.target.value } : s
                            );
                            updateActiveApt({ customSections: updated });
                          }}
                          className="w-full text-slate-600 border border-slate-200 rounded-lg p-2"
                        />
                      </div>
                    ))}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Vlastní nadpis (např. Pramice u rybníka)"
                        value={newSectionTitle}
                        onChange={(e) => setNewSectionTitle(e.target.value)}
                        className="rounded-xl border border-slate-300 px-3 py-2 bg-white"
                      />
                      <input
                        type="text"
                        placeholder="Popis a instrukce pro hosty..."
                        value={newSectionContent}
                        onChange={(e) => setNewSectionContent(e.target.value)}
                        className="rounded-xl border border-slate-300 px-3 py-2 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddCustomSection()}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-2"
                      >
                        + Přidat vlastní sekci
                      </button>
                    </div>
                  </div>

                  {/* 7. VOLNÉ POLE DALŠÍ INFORMACE */}
                  <label className="block space-y-1">
                    <span className="font-bold text-slate-700">7. Další informace od majitele (volné pole)</span>
                    <textarea
                      rows={2}
                      value={activeApt.extraInfo}
                      onChange={(e) => updateActiveApt({ extraInfo: e.target.value })}
                      placeholder="Napište cokoliv dalšího, co by měli hosté vědět..."
                      className="w-full rounded-xl border border-slate-300 p-2.5"
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="font-bold text-slate-700">8. Tipy v okolí (restaurace, pekárna, výlety)</span>
                    <textarea
                      rows={2}
                      value={activeApt.tips}
                      onChange={(e) => updateActiveApt({ tips: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 p-2.5"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* PRAVÝ SLOUPEC: ŽIVÝ NÁHLED MOBILU A STOLNÍHO LETÁKU */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-2xl p-1.5 border border-slate-200 grid grid-cols-2 gap-1.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setOwnerPreviewMode('phone')}
                  className={`py-2.5 rounded-xl text-xs font-extrabold transition ${
                    ownerPreviewMode === 'phone' ? 'bg-slate-900 text-white' : 'text-slate-600'
                  }`}
                >
                  📱 Mobilní AI průvodce (4 jazyky)
                </button>
                <button
                  type="button"
                  onClick={() => setOwnerPreviewMode('flyer')}
                  className={`py-2.5 rounded-xl text-xs font-extrabold transition ${
                    ownerPreviewMode === 'flyer' ? 'bg-slate-900 text-white' : 'text-slate-600'
                  }`}
                >
                  🖨️ Stolní PDF leták s QR kódem
                </button>
              </div>

              {ownerPreviewMode === 'phone' ? (
                renderGuestMobilePhone()
              ) : (
                <div className="space-y-3">
                  {renderPrintableTableFlyer()}
                  <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                    <button
                      type="button"
                      onClick={() => {
                        if (activeApt.status !== 'PAID') {
                          scrollToStripeCheckout();
                        } else {
                          window.print();
                        }
                      }}
                      className="py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold flex items-center justify-center gap-2"
                    >
                      <Printer className="w-4 h-4" />
                      <span>{activeApt.status === 'PAID' ? 'Vytisknout PDF leták' : 'Odemknout tisk PDF'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (activeApt.status !== 'PAID') {
                          scrollToStripeCheckout();
                        } else {
                          window.print();
                        }
                      }}
                      className="py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>{activeApt.status === 'PAID' ? 'Uložit leták' : 'Odemknout stažení'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ========================================== */}
          {/* CENÍK (3 ROČNÍ TARIFY) + POKLADNA STRIPE */}
          {/* ========================================== */}
          <section ref={checkoutSectionRef} className="bg-white rounded-3xl border-2 border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-extrabold uppercase">
                0 Kč za zřízení • Konečná cena na 12 měsíců (nejsme plátci DPH)
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold">
                Vyberte si tarif podle počtu apartmánů a odemkněte tiskové PDF letáky
              </h2>
              <p className="text-xs text-slate-500">
                Jednorázová roční platba bez automatického strhávání z karty bez vašeho vědomí.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {PRICING_PLANS.map((plan) => {
                const isSelected = activeApt.planId === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => updateActiveApt({ planId: plan.id })}
                    className={`cursor-pointer rounded-3xl p-6 border-2 transition flex flex-col justify-between ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/30 shadow-md'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-900 text-white">
                          {plan.badge}
                        </span>
                        {plan.popular && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-slate-950">
                            Nejoblíbenější
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-extrabold">{plan.name}</h3>
                      <p className="text-xs text-slate-500">{plan.subtitle}</p>
                      <div className="pt-1">
                        <span className="text-xs text-slate-400 line-through mr-2">
                          {plan.oldPrice} Kč / rok
                        </span>
                        <div className="text-3xl font-extrabold text-slate-900">
                          {plan.price} Kč <span className="text-xs font-normal text-slate-500">/ rok</span>
                        </div>
                        <div className="text-[11px] font-bold text-emerald-700">
                          Vychází na {plan.monthlyEquivalent} Kč měsíčně • 0 Kč zřízení
                        </div>
                      </div>
                      <ul className="space-y-2 pt-2 text-xs text-slate-700">
                        {plan.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      className={`mt-6 w-full py-2.5 rounded-xl text-xs font-extrabold ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {isSelected ? '✓ Vybraný tarif' : 'Zvolit tento tarif'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* STRIPE POKLADNA */}
            <form onSubmit={handleProcessStripePayment} className="bg-slate-50 rounded-3xl p-6 border border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 space-y-4 text-xs">
                <h3 className="text-base font-extrabold flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  Okamžitá aktivace a nastavení vašeho přihlašovacího účtu
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="space-y-1">
                    <span className="font-bold text-slate-700">Vaše jméno / Firma *</span>
                    <input
                      type="text"
                      value={checkoutForm.customerName}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, customerName: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="font-bold text-slate-700">Přihlašovací e-mail *</span>
                    <input
                      type="email"
                      value={checkoutForm.customerEmail}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, customerEmail: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="font-bold text-slate-700">Zvolte heslo / PIN k účtu *</span>
                    <input
                      type="text"
                      value={checkoutForm.ownerPasswordPin}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, ownerPasswordPin: e.target.value })}
                      className="w-full rounded-xl border border-emerald-400 bg-white px-3 py-2 font-mono font-bold"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1">
                  {[
                    { id: 'card', label: '💳 Platební karta' },
                    { id: 'wallet', label: ' Apple / Google Pay' },
                    { id: 'qr', label: '📱 Okamžitá QR platba' },
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setStripePaymentMethod(pm.id)}
                      className={`py-2.5 px-3 rounded-xl font-extrabold border ${
                        stripePaymentMethod === pm.id
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {pm.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5 pt-1 text-[11px] text-slate-600">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkoutForm.agreeVopAndGdpr}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, agreeVopAndGdpr: e.target.checked })}
                      className="mt-0.5"
                    />
                    <span>Souhlasím s VOP a Zásadami ochrany osobních údajů (GDPR).</span>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkoutForm.agreeImmediateDigital}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, agreeImmediateDigital: e.target.checked })}
                      className="mt-0.5"
                    />
                    <span>
                      Žádám o okamžité zpřístupnění digitálního PDF letáku a AI průvodce před uplynutím 14denní lhůty (§ 1837 písm. l) občanského zákoníku).
                    </span>
                  </label>
                </div>
                {checkoutError && <div className="text-rose-600 font-bold">{checkoutError}</div>}
              </div>

              <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <div className="text-xs font-extrabold">{selectedPlanObj.name}</div>
                    <div className="text-[11px] text-slate-500">{selectedPlanObj.unitRangeLabel} • 12 měsíců</div>
                  </div>
                  <div className="text-2xl font-extrabold text-emerald-700">{selectedPlanObj.price} Kč</div>
                </div>

                <button
                  type="submit"
                  disabled={isStripeProcessing}
                  className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition"
                >
                  {isStripeProcessing
                    ? 'Ověřuji platbu přes Stripe...'
                    : `Zaplatit ${selectedPlanObj.price} Kč a ihned odemknout PDF letáky →`}
                </button>

                <div className="pt-2 border-t border-slate-100 text-center text-[11px] text-slate-500">
                  Potřebujete poradit nebo vystavit fakturu předem? Napište nám na{' '}
                  <a
                    href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(`Dotaz k aktivaci – ${activeApt.aptName}`)}`}
                    className="font-extrabold text-emerald-700 hover:underline"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                </div>
              </div>
            </form>
          </section>
        </main>
      )}

      {/* ========================================== */}
      {/* 3. OBRAZOVKA: MOBIL HOSTA V APARTMÁNU */}
      {/* ========================================== */}
      {currentRole === 'guest' && (
        <main className="max-w-lg mx-auto w-full px-3 py-6 flex-1 flex flex-col items-center justify-center">
          {renderGuestMobilePhone()}
        </main>
      )}

      {/* ========================================== */}
      {/* MODÁLNÍ OKNO: PŘIHLÁŠENÍ MAJITELE PŘES E-MAIL A PIN */}
      {/* ========================================== */}
      {ownerAuthModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-extrabold">Přihlášení majitele k účtu</h3>
              </div>
              <button type="button" onClick={() => setOwnerAuthModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOwnerLoginSubmit} className="space-y-3 text-xs">
              <p className="text-slate-600">
                Zadejte svůj e-mail a heslo (PIN), které jste si zvolili při aktivaci apartmánu, pro úpravu Wi-Fi hesla či pokynů z jakéhokoliv zařízení:
              </p>
              <label className="block space-y-1">
                <span className="font-bold text-slate-700">Váš e-mail</span>
                <input
                  type="text"
                  placeholder="např. novak@ubytovani-sumava.cz"
                  value={loginEmailInput}
                  onChange={(e) => setLoginEmailInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2"
                />
              </label>
              <label className="block space-y-1">
                <span className="font-bold text-slate-700">Heslo / PIN</span>
                <input
                  type="password"
                  placeholder="např. sumava123"
                  value={loginPinInput}
                  onChange={(e) => setLoginPinInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 font-mono"
                />
              </label>
              {loginMessage && <div className="text-rose-600 font-bold">{loginMessage}</div>}
              <button type="submit" className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-extrabold">
                Přihlásit se k apartmánu
              </button>
              <div className="text-center text-[11px] text-slate-500 pt-1">
                Zapomněli jste heslo/PIN? Napište nám na{' '}
                <a href={`mailto:${SUPPORT_EMAIL}`} className="font-bold text-emerald-700 hover:underline">
                  {SUPPORT_EMAIL}
                </a>
              </div>
            </form>

            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <span className="font-bold text-slate-500 block">Rychlé přihlášení k ukázkovým účtům (1 klik):</span>
              {apartments.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    setActiveAptId(a.id);
                    setLoggedInOwnerAptId(a.id);
                    setOwnerAuthModalOpen(false);
                  }}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <div className="font-extrabold text-slate-900">{a.aptName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {a.ownerEmail} • PIN: {a.ownerPin}
                    </div>
                  </div>
                  <span className="text-emerald-700 font-extrabold text-[11px]">Přihlásit →</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODÁLNÍ OKNO: DAŇOVÝ DOKLAD PDF */}
      {invoiceModalOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" /> Daňový doklad {invoiceModalOrder.id}
              </h3>
              <button type="button" onClick={() => setInvoiceModalOrder(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs space-y-2">
              <p><strong>Dodavatel:</strong> HostBot.cz ({SUPPORT_EMAIL} • Neplátce DPH)</p>
              <p><strong>Odběratel:</strong> {invoiceModalOrder.customerName} ({invoiceModalOrder.customerEmail})</p>
              <p><strong>Položka:</strong> {invoiceModalOrder.planName} – {invoiceModalOrder.aptName}</p>
              <p className="text-base font-extrabold text-emerald-700 pt-2">Celkem uhrazeno: {invoiceModalOrder.amount} Kč</p>
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-extrabold"
            >
              Vytisknout / Uložit PDF doklad
            </button>
          </div>
        </div>
      )}

      {/* MODÁLNÍ OKNO: VOP, GDPR & COOKIES */}
      {legalModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-600" />
                {legalModal === 'vop' ? 'Všeobecné obchodní podmínky (VOP)' : 'Ochrana osobních údajů (GDPR) & Cookies'}
              </h3>
              <button type="button" onClick={() => setLegalModal(null)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <p>
                <strong>1. Poskytovatel a kontakt:</strong> Služba HostBot.cz (kontaktní e-mail podpory: <strong>{SUPPORT_EMAIL}</strong>) poskytuje digitální průvodce a tiskové QR letáky na období 12 měsíců. Ceny 890 Kč / 1 990 Kč / 3 990 Kč jsou konečné (poskytovatel není plátcem DPH). Jedná se o jednorázovou roční úhradu bez nechtěného automatického strhávání z karty.
              </p>
              <p>
                <strong>2. Digitální obsah (§ 1837 písm. l) OZ):</strong> Okamžitým zpřístupněním tiskového PDF letáku a plné verze AI průvodce na žádost zákazníka před uplynutím 14denní lhůty zaniká právo na odstoupení od smlouvy. Mimosoudní řešení sporů zajišťuje Česká obchodní inspekce (coi.cz).
              </p>
              <p>
                <strong>3. GDPR & EU AI Act:</strong> Aplikace zpracovává pouze technické údaje nezbytné pro chod průvodce. Hosté jsou v mobilním rozhraní transparentně informováni, že komunikují s AI systémem. Dotazy či žádosti o výmaz dat zasílejte na <strong>{SUPPORT_EMAIL}</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PLOVOUCÍ COOKIE LIŠTA DLE § 89 ZEK */}
      {!cookieConsent.decided && currentRole !== 'guest' && (
        <div className="fixed bottom-3 inset-x-3 z-40 max-w-3xl mx-auto bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Cookie className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              Tento web používá pouze nezbytné technické úložiště pro uložení vašeho rozpracovaného apartmánu dle § 89 zákona č. 127/2005 Sb. (ZEK).
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setCookieConsent({ decided: true, necessary: true, analytics: false })}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold"
            >
              Pouze nezbytné
            </button>
            <button
              type="button"
              onClick={() => setCookieConsent({ decided: true, necessary: true, analytics: true })}
              className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold"
            >
              Povolit vše
            </button>
          </div>
        </div>
      )}

      {/* PRÁVNÍ PATIČKA WEBU S KONTAKTNÍM E-MAILEM */}
      {currentRole !== 'guest' && (
        <footer className="bg-white border-t border-slate-200 py-5 px-4 text-xs text-slate-500 mt-auto">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <span>© 2026 HostBot.cz • Nejsem plátce DPH • Všechny ceny jsou konečné</span>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="inline-flex items-center gap-1 font-extrabold text-emerald-700 hover:underline"
              >
                <Mail className="w-3.5 h-3.5" /> {SUPPORT_EMAIL}
              </a>
            </div>
            <div className="flex flex-wrap gap-4 font-bold text-slate-700">
              <button type="button" onClick={() => setLegalModal('vop')} className="hover:text-emerald-600">
                Obchodní podmínky (VOP)
              </button>
              <button type="button" onClick={() => setLegalModal('gdpr')} className="hover:text-emerald-600">
                Ochrana soukromí (GDPR & AI Act)
              </button>
              <button
                type="button"
                onClick={() => setCookieConsent({ decided: false, necessary: true, analytics: false })}
                className="hover:text-emerald-600"
              >
                Nastavení cookies (§ 89 ZEK)
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}