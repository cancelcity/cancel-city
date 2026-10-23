import type {CityZoneId} from './city-zones';

export type AtlasDistrictId='cloutside'|'liability-hills'|'overtime-downtown'|'rug-street'|'404-quarter'|'doom-county';
export type AtlasAction='jobs'|'build'|'residents'|'collect'|'drama'|'beef'|'raid'|'help'|'found';

export interface AtlasDistrict {
 id:AtlasDistrictId;
 name:string;
 color:string;
 art:string;
 description:string;
 overview:{x:number;y:number;width:number;height:number};
 focus:{x:number;y:number;zoom:number};
}

export interface AtlasBuilding {
 id:string;
 district:AtlasDistrictId;
 name:string;
 purpose:string;
 description:string;
 quip:string;
 cast:string[];
 action?:AtlasAction;
 href?:string;
 actionLabel:string;
 legacyVenue?:CityZoneId;
 x:number;
 y:number;
 width:number;
 height:number;
}

export const CITY_ATLAS_OVERVIEW_ART='/assets/city-v6/city-overview.webp';

// Camera centres and building footprints refer to the complete, uncropped art.
// Rug Street and the 404 Quarter share the same canal-side illustration.
export const CITY_ATLAS_DISTRICTS:readonly AtlasDistrict[]=[
 {id:'cloutside',name:'Cloutside',color:'#ffbe45',art:CITY_ATLAS_OVERVIEW_ART,description:'Food, fresh cuts, record deals and a police loyalty card. Everybody knows everybody’s business.',overview:{x:1,y:37,width:31,height:34},focus:{x:18,y:54,zoom:1.95}},
 {id:'liability-hills',name:'Liability Hills',color:'#e6bb68',art:CITY_ATLAS_OVERVIEW_ART,description:'The gates are higher than their standards. Five familiar scandals and two very expensive comeback plans.',overview:{x:67,y:5,width:32,height:48},focus:{x:82,y:29,zoom:1.8}},
 {id:'overtime-downtown',name:'Overtime Downtown',color:'#ffd35e',art:'/assets/city-v6/overtime-downtown.webp',description:'The depot, the courthouse, the help desk. The city runs because someone here still hasn’t gone home.',overview:{x:32,y:7,width:34,height:34},focus:{x:50,y:50,zoom:1}},
 {id:'rug-street',name:'Rug Street',color:'#f4cb57',art:'/assets/city-v6/rug-street-404.webp',description:'Small print. Huge exits. The market is open and Dutch has another payment plan.',overview:{x:57,y:37,width:29,height:28},focus:{x:30,y:52,zoom:1}},
 {id:'404-quarter',name:'The 404 Quarter',color:'#4de5fa',art:'/assets/city-v6/rug-street-404.webp',description:'Every screen wants your attention. Every checkbox is already ticked.',overview:{x:1,y:8,width:31,height:28},focus:{x:74,y:47,zoom:1}},
 {id:'doom-county',name:'Doom County',color:'#c7e373',art:CITY_ATLAS_OVERVIEW_ART,description:'Salvage, conspiracy neighbours and the last patch of grass. Keep your hands inside the tow truck.',overview:{x:65,y:68,width:34,height:29},focus:{x:81,y:82,zoom:1.9}},
];

// These are street addresses, not a second rewards system. Existing venues keep
// their saved IDs; other addresses open real game services through the atlas.
export const CITY_ATLAS_BUILDINGS:readonly AtlasBuilding[]=[
 {
  id:'probable-cause',district:'cloutside',name:'Probable Cause Dispensary',purpose:'THE LOYALTY INSPECTION',
  description:'Overlord runs the till. Gandalf works the curb. Read the receipt inside, hear the Plug outside, then decide what to do with the inspector’s loyalty card.',
  quip:'“If this is a raid, why did you bring your stamp card?”',cast:['CC054','CC018'],legacyVenue:'probable-cause',actionLabel:'ENTER DISPENSARY',x:26,y:59,width:11,height:15,
 },
 {
  id:'fade-court',district:'cloutside',name:'Fade Court',purpose:'FRESH CUTS / OLD ARGUMENTS',
  description:'Infinite Rizz has the chair. The barber has a greatest-album argument. You have half a haircut and a booking timer that is still running.',
  quip:'“Bro said trust the process. The process has taken my left eyebrow.”',cast:['CC063'],legacyVenue:'fade-court',actionLabel:'ENTER BARBERSHOP',x:15,y:52,width:10,height:15,
 },
 {
  id:'sole-custody',district:'cloutside',name:'Sole Custody',purpose:'SNEAKER RESALE',
  description:'Nicki Min-Max is inspecting the limited drop. The reseller would like eight hundred for trainers with the ninety-pound sale sticker still on.',
  quip:'“The shoe’s authentic. His rent problem is extra.”',cast:['CC104'],legacyVenue:'sole-custody',actionLabel:'ENTER SHOE SHOP',x:27,y:48,width:10,height:15,
 },
 {
  id:'kfc',district:'cloutside',name:'Kancel Fried Chicken',purpose:'PORTION FRAUD / FAMILY FEAST',
  description:'Big Bald Energy and Master Cheese are waiting for a family bucket. So far the family has received thirteen wet wipes and something that used to know a chicken.',
  quip:'“Family feast? What family, a fucking hamster?”',cast:['CC019','CC064'],legacyVenue:'kfc',actionLabel:'ENTER TAKEAWAY',x:6,y:59,width:11,height:17,
 },
 {
  id:'360-records',district:'cloutside',name:'360 Deal Records',purpose:'THE ROYALTY SPLIT',
  description:'Two Yes, two editors, one contract. The boss believes in your voice and would like to own it along with every apology you have not recorded yet.',
  quip:'“You get creative freedom. He gets the fucking money.”',cast:['CC041','CC099','CC112','CC142'],legacyVenue:'360-records',actionLabel:'ENTER RECORD LABEL',x:21,y:57,width:10,height:14,
 },
 {
  id:'minimum-wage-food-court',district:'cloutside',name:'Minimum Wage Food Court',purpose:'CITY JOB BOARD',
  description:'Kobeni has three orders on, Gordon Ramen is shouting at the garnish and Freezer has locked the cold room. Pick a city job from the board.',
  quip:'“The staff meal is whatever Gordon throws back.”',cast:['CC007','CC012','CC014'],action:'jobs',actionLabel:'FIND A CITY JOB',x:8,y:70,width:11,height:9,
 },
 {
  id:'clip-farm',district:'cloutside',name:'The Clip Farm',purpose:'ROAST NIGHT / CREATOR STAGE',
  description:'A creator house with four ring lights, one treadmill and no off switch. The residents have put their worst opinions on the Roast Night stage.',
  quip:'“He called the ambulance before he started the challenge. Content strategy.”',cast:['CC044','CC087','CC095','CC098'],href:'/roast/',actionLabel:'GO TO ROAST NIGHT',x:16,y:39,width:10,height:9,
 },
 {
  id:'final-final-tour-arena',district:'cloutside',name:'The Final Final Tour Arena',purpose:'ROAST NIGHT',
  description:'The farewell tour has announced an extension. Take the mic at Roast Night; the lineup can wait its fucking turn.',
  quip:'“Last ever show. Again. VIP tickets still available.”',cast:['CC017','CC032','CC036','CC059','CC102','CC103','CC105','CC106'],href:'/roast/',actionLabel:'TAKE THE MIC',x:6,y:42,width:12,height:10,
 },
 {
  id:'cease-desist-convention',district:'cloutside',name:'Cease & Desist Convention Hall',purpose:'COLLECTION EXHIBITION',
  description:'Mew Khalifa hosts the costumes, the collectors and the increasingly specific legal notices. Open your collection to inspect your residents and build a deck.',
  quip:'“The costume contest has been won by the copyright lawyer.”',cast:['CC043'],href:'/collection/',actionLabel:'OPEN COLLECTION',x:6,y:78,width:12,height:9,
 },
 {
  id:'yacht-club',district:'liability-hills',name:'Gobstein Yacht Club',purpose:'THE GALA INVESTIGATION',
  description:'Read the dock invoice at the harbour office, then ask Oscar for the guest list. The gala has a gold-plated ice bucket and a conspicuous lack of donations.',
  quip:'“Charity begins at home. Apparently it stays there too.”',cast:['CC053','CC056'],legacyVenue:'yacht-club',actionLabel:'ENTER PRIVATE HARBOUR',x:91,y:49,width:13,height:14,
 },
 {
  id:'oil-manor',district:'liability-hills',name:'Baby Oil Manor',purpose:'THE BULK DELIVERY',
  description:'Five hundred bottles, one mansion and a delivery driver who would like a written explanation for his insurer. The supplier cannot reach his own front door.',
  quip:'“He said dry skin. The driver said fuck this.”',cast:['CC057'],legacyVenue:'oil-manor',actionLabel:'ENTER MANOR',x:92,y:20,width:12,height:19,
 },
 {
  id:'red-flag-house',district:'liability-hills',name:'The Red Flag Brothel',purpose:'ADULT NIGHTLIFE / LOST ALIBIS',
  description:'The staff want a quiet shift. A man in a wedding suit has been arguing with the cloakroom for twenty minutes. Somebody needs to take away the mic.',
  quip:'“He only came in for directions. To the fucking cloakroom, apparently.”',cast:[],legacyVenue:'red-flag-house',actionLabel:'ENTER NIGHTCLUB',x:82,y:37,width:12,height:13,
 },
 {
  id:'oscar-studios',district:'liability-hills',name:'Oscar Goblin Studios',purpose:'THE COMEBACK PRODUCTION',
  description:'A rented red carpet, a producer in trophy armour and a comeback nobody ordered. Visit the studio and read the fine print on the audition.',
  quip:'“The standing ovation is a clause in the extras’ contracts.”',cast:['CC051','CC052'],legacyVenue:'oscar-studios',actionLabel:'ENTER FILM STUDIO',x:77,y:21,width:12,height:17,
 },
 {
  id:'moonwalk-museum',district:'liability-hills',name:'Moonwalk Museum',purpose:'MEMORABILIA / QUESTIONABLE PAPERWORK',
  description:'Internet Explorer is still checking the provenance labels. The gloves are in glass cases. The gift shop has somehow authenticated all six of them.',
  quip:'“One of a kind. Available in six colours.”',cast:['CC084'],legacyVenue:'moonwalk-museum',actionLabel:'ENTER MUSEUM',x:94,y:35,width:10,height:16,
 },
 {
  id:'sorry-not-sorry-retreat',district:'liability-hills',name:'Sorry Not Sorry Retreat',purpose:'REPUTATION / CITY DRAMA',
  description:'Cancelled Messiah has booked the ring-light chapel. Apology Influencer is rehearsing the sigh. Handle your block’s current drama before anyone sells it a recovery course.',
  quip:'“The tears are real. The sponsorship disclosure is below the fold.”',cast:['CC030','CC042','CC045'],action:'drama',actionLabel:'HANDLE CITY DRAMA',x:85,y:10,width:11,height:11,
 },
 {
  id:'paywall-penthouse',district:'liability-hills',name:'Paywall Penthouse',purpose:'RESIDENTS / POOL COMMITTEE',
  description:'Rain of Subscribers wants a rooftop pool. Ken has called a committee. The zoning officer has brought a tape measure. Manage the actual residents assigned to your block.',
  quip:'“The roof leaks. He calls it subscriber-only rain.”',cast:['CC055','CC096','CC125'],action:'residents',actionLabel:'MANAGE YOUR RESIDENTS',x:75,y:9,width:11,height:11,
 },
 {
  id:'mandatory-happiness-hq',district:'overtime-downtown',name:'Mandatory Happiness HQ',purpose:'CITY JOB BOARD',
  description:'The morale survey is mandatory. So is the unpaid meeting about it. Take a city job from the board and get a clear reward before anyone says “family”.',
  quip:'“They laid off the wellbeing team. The email said exciting times.”',cast:['CC006','CC008','CC011','CC016','CC113','CC127','CC139'],action:'jobs',actionLabel:'OPEN JOB BOARD',x:14,y:24,width:19,height:27,
 },
 {
  id:'cheek-depot',district:'overtime-downtown',name:'The Cheek Depot',purpose:'CITY JOBS / DEPOT DESK',
  description:'Hampter handles storage, Prime Overlord handles deadlines and Solid Snake is filed under packaging. The depot desk opens your existing city jobs.',
  quip:'“Your parcel is out for delivery. Snake has been inside it since Tuesday.”',cast:['CC033','CC073','CC123'],action:'jobs',actionLabel:'CHECK CITY JOBS',x:24,y:63,width:32,height:29,
 },
 {
  id:'load-bearing-bullshit',district:'overtime-downtown',name:'Load-Bearing Bullshit Construction',purpose:'YOUR BLOCK / BUILD & UPGRADE',
  description:'Longcat supports the extension. Side-Quest Dad has found something wrong with the wall. Build or upgrade properties on your own twelve saved plots.',
  quip:'“That wall’s structural. Dad’s already taken it out to have a look.”',cast:['CC069','CC141'],action:'build',actionLabel:'BUILD ON YOUR BLOCK',x:86,y:62,width:25,height:49,
 },
 {
  id:'rent-free-realty',district:'overtime-downtown',name:'Rent-Free Realty',purpose:'YOUR BLOCK / RESIDENT ASSIGNMENTS',
  description:'Sigma Landlord has listed a cupboard as an intimate studio. Homelesslander is not signing. Assign owned residents to your actual city properties.',
  quip:'“Natural light available as a premium add-on.”',cast:['CC010','CC046'],action:'residents',actionLabel:'ASSIGN RESIDENTS',x:5,y:48,width:8,height:15,
 },
 {
  id:'please-hold-forever',district:'overtime-downtown',name:'Please Hold Forever',purpose:'CITY HELP DESK',
  description:'The service desk has four agents and one phrase. Open the city guide for the actual rules, costs and next steps; no nine-minute voice note required.',
  quip:'“Your call is important. Not answer-the-fucking-phone important.”',cast:['CC071','CC100','CC111','CC128'],action:'help',actionLabel:'OPEN CITY GUIDE',x:66,y:51,width:17,height:29,
 },
 {
  id:'everything-fine-fire-station',district:'overtime-downtown',name:'Everything’s Fine Fire Station',purpose:'CITY DRAMA / INCIDENT DESK',
  description:'This Is Fine has the incident book. Godzilla has a hard hat and a worrying interpretation of demolition permission. Deal with the drama affecting your block.',
  quip:'“They put the incident report in the fire. Case closed.”',cast:['CC085','CC126'],action:'drama',actionLabel:'VIEW CITY DRAMA',x:76,y:21,width:19,height:23,
 },
 {
  id:'court-public-opinion',district:'overtime-downtown',name:'Court of Public Opinion',purpose:'NEIGHBOUR DISPUTES',
  description:'The magistrate has bongos. The defence has opened the wrong browser tab. Bring your neighbour beef to the existing dispute desk.',
  quip:'“Objection. That folder is absolutely not work-related.”',cast:['CC003','CC047','CC072','CC110','CC124'],action:'beef',actionLabel:'SETTLE NEIGHBOUR BEEF',x:46,y:26,width:26,height:29,
 },
 {
  id:'tremendous-city-hall',district:'overtime-downtown',name:'Tremendous City Hall',purpose:'CITY RULES / PUBLIC DESK',
  description:'Five officials have signed off on a plaque congratulating themselves. The public desk opens your city guide: founding, production, residents and upgrades.',
  quip:'“The budget meeting has been postponed until they can afford the meeting.”',cast:['CC020','CC035','CC037','CC038','CC081'],action:'help',actionLabel:'OPEN CITY GUIDE',x:50,y:9,width:12,height:10,
 },
 {
  id:'overdraft-cathedral',district:'rug-street',name:'Overdraft Cathedral',purpose:'YOUR BLOCK / COLLECT PRODUCTION',
  description:'Nyan brings the rainbow. Clippy brings the account statement. Collect your saved block’s production when it is ready; this desk never invents a second balance.',
  quip:'“It looks like you’re trying to own something. Would you like a fee?”',cast:['CC067','CC082','CC086'],action:'collect',actionLabel:'COLLECT BLOCK INCOME',x:29,y:36,width:36,height:43,
 },
 {
  id:'dutch-payment-plan',district:'rug-street',name:'Dutch’s Payment Plan Exchange',purpose:'TRASH MARKET',
  description:'Dutch has a plan. Smooth Rug Pull has already located the exit. Open the real Trash Market to recycle duplicates and craft residents.',
  quip:'“Just one more payment, Arthur. Then we’ll have enough for the next payment.”',cast:['CC021','CC024'],href:'/market/',actionLabel:'OPEN TRASH MARKET',x:19,y:68,width:27,height:28,
 },
 {
  id:'diamond-hands-cemetery',district:'rug-street',name:'Diamond Hands Cemetery',purpose:'COLLECTION ARCHIVE',
  description:'Bagholder Eternal has not sold. Seed Phrase Sommelier would like to know where he was buried. Inspect your collection; nobody here gets to confiscate it.',
  quip:'“He took his bags to the grave. They’re still down ninety-eight percent.”',cast:['CC022','CC025'],href:'/collection/?faction=crypto-degenerates',actionLabel:'VIEW CRYPTO COLLECTION',x:7,y:29,width:11,height:15,
 },
 {
  id:'fraudo-offshore-shire',district:'rug-street',name:'Fraudo’s Offshore Shire',purpose:'YOUR BLOCK / PRODUCTION ACCOUNTS',
  description:'Fraudo’s round door hides an alarming number of registered offices. Check and collect the production from your actual properties, using the same saved balance.',
  quip:'“One does not simply trace the fucking invoice.”',cast:['CC023','CC050'],action:'collect',actionLabel:'CHECK BLOCK INCOME',x:41,y:70,width:19,height:23,
 },
 {
  id:'hostile-rebrand-campus',district:'rug-street',name:'Hostile Rebrand Campus',purpose:'RAID DESK',
  description:'Three founders have renamed the same campus three times. If your city is ready, choose a rival at the existing raid desk and read the stakes before you fight.',
  quip:'“They’ve disrupted payroll. Nobody got paid.”',cast:['CC039','CC040','CC060'],action:'raid',actionLabel:'OPEN RIVAL RAIDS',x:44,y:18,width:14,height:15,
 },
 {
  id:'accept-all-data-centre',district:'404-quarter',name:'Accept All Data Centre',purpose:'YOUR ACCOUNT / SETTINGS',
  description:'Zuck.exe has pre-ticked the boxes. Algorithm Daddy wants one more signal. Open your real account and game settings; Ceiling Cat is watching the desk.',
  quip:'“They respect your privacy. That’s why they kept a copy.”',cast:['CC005','CC031','CC048','CC070'],href:'/settings/',actionLabel:'OPEN GAME SETTINGS',x:66,y:30,width:24,height:48,
 },
 {
  id:'ban-note-precinct',district:'404-quarter',name:'Ban Note Precinct',purpose:'BATTLE / MODERATOR ON DUTY',
  description:'Light Yagamod has opened the notebook. Discord E-Knight is reciting the rules. Take a squad into the actual battle arena and settle it there.',
  quip:'“He banned you for arguing. His appeal says stop arguing.”',cast:['CC002','CC088','CC138'],href:'/battle/',actionLabel:'ENTER BATTLE ARENA',x:88,y:44,width:20,height:29,
 },
 {
  id:'hallucination-press',district:'404-quarter',name:'The Hallucination Press',purpose:'CITY DRAMA / CURRENT INCIDENT',
  description:'UsoppGPT has printed the headline. Prompt Goblin has requested more adjectives. Open your block’s actual drama, before Repost Necromancer brings last week back.',
  quip:'“Source: a bloke who looked like he had a source.”',cast:['CC004','CC136','CC137','CC101'],action:'drama',actionLabel:'CHECK CITY DRAMA',x:79,y:77,width:30,height:32,
 },
 {
  id:'404-repair-regret',district:'404-quarter',name:'404 Repair & Regret',purpose:'YOUR BLOCK / UPGRADES',
  description:'GenOS brought the parts. Bonzi brought himself. Copy-Paste Kakashi has duplicated the invoice. Manage the buildings you own and inspect their real upgrade costs.',
  quip:'“Have you tried turning the invoice off and on again?”',cast:['CC013','CC058','CC083','CC097'],action:'build',actionLabel:'MANAGE BLOCK UPGRADES',x:96,y:61,width:7,height:18,
 },
 {
  id:'one-more-video-cinema',district:'404-quarter',name:'One More Video Cinema',purpose:'THE CINEMA',
  description:'Keyboard Cat is at the exit piano. Doomscroll Parasite has missed three last trains. Watch the actual films and specials in the cinema.',
  quip:'“The intro has sponsors. The sponsors have intros.”',cast:['CC029','CC068','CC140'],href:'/cinema/',actionLabel:'ENTER CINEMA',x:97,y:83,width:6,height:20,
 },
 {
  id:'free-trial-hotel',district:'404-quarter',name:'The Free Trial Hotel',purpose:'YOUR ACCOUNT / SETTINGS',
  description:'Subscription Goblin has extended the checkout form. Yoda is reading clause four backwards. Your real settings are one door away, with no invented hotel charge.',
  quip:'“Checkout is free. Finding the fucking button is the service.”',cast:['CC034','CC109'],href:'/settings/',actionLabel:'OPEN GAME SETTINGS',x:86,y:18,width:12,height:14,
 },
 {
  id:'trust-me-bro-bunker',district:'doom-county',name:'Trust Me Bro Bunker',purpose:'CITY DRAMA / NEIGHBOUR RUMOURS',
  description:'Doomer Wojak brought beans. Conspiracy Mom has connected the postman to the moon landing. Read the actual incident affecting your block before adding more red string.',
  quip:'“He’s prepared for everything except a normal conversation.”',cast:['CC027','CC028'],action:'drama',actionLabel:'CHECK CITY DRAMA',x:77,y:83,width:8,height:15,
 },
 {
  id:'florida-man-salvage',district:'doom-county',name:'Florida Man Impound & Salvage',purpose:'TRASH MARKET / RECYCLING',
  description:'Florida Man has a tow truck and an alligator with no professional qualifications. Open the Trash Market to recycle spare cards or check crafting recipes.',
  quip:'“The truck’s insured. The alligator is named on the policy.”',cast:['CC015'],href:'/market/',actionLabel:'RECYCLE AT THE MARKET',x:70,y:84,width:13,height:18,
 },
 {
  id:'touch-grass-reserve',district:'doom-county',name:'Touch Grass Reserve',purpose:'YOUR BLOCK / RESIDENTS',
  description:'The final boss has protected the grass. The barbecue committee has interpreted this as a challenge. Assign an owned resident to your own sanctuary or another matching property.',
  quip:'“Protected wildlife. Bring your own fucking ketchup.”',cast:['CC049','CC062'],action:'residents',actionLabel:'MANAGE RESIDENTS',x:95,y:76,width:10,height:15,
 },
 {
  id:'last-nerve-bathhouse',district:'doom-county',name:'Last Nerve Bathhouse',purpose:'CITY GUIDE / TAKE A BREATHER',
  description:'Capybara has filled the bath. Olaf is inspecting the cooling plant. Read the city guide here if you need the next step spelled out before returning to your block.',
  quip:'“No phones. No meetings. First sensible fucking sign in this city.”',cast:['CC009','CC074'],action:'help',actionLabel:'READ CITY GUIDE',x:94,y:89,width:10,height:10,
 },
 {
  id:'one-more-episode-training',district:'doom-county',name:'One More Episode Training Ground',purpose:'BATTLE PRACTICE',
  description:'Yasuo is queuing again. The Eternal 2nd has brought a training plan. Open Battle and use its practice fight to learn summoning, attacks and card effects.',
  quip:'“Warm-up game, he says. It’s his ninth fucking warm-up game.”',cast:['CC001','CC061','CC065','CC066'],href:'/battle/?practice=1',actionLabel:'GO TO BATTLE PRACTICE',x:73,y:74,width:13,height:9,
 },
 {
  id:'karen-returns-fortress',district:'doom-county',name:'Karen’s Returns Fortress',purpose:'NEIGHBOUR DISPUTES / ESCALATIONS',
  description:'Karen has the receipt, the packaging and the manager’s personal number. Handle the neighbour beef on your own block before she gets hold of the group chat.',
  quip:'“She returned a microwave because it wouldn’t heat her argument.”',cast:['CC026'],action:'beef',actionLabel:'HANDLE NEIGHBOUR BEEF',x:85,y:85,width:14,height:16,
 },
];

export const CITY_ATLAS_DISTRICT_BY_ID=Object.fromEntries(CITY_ATLAS_DISTRICTS.map(district=>[district.id,district])) as Record<AtlasDistrictId,AtlasDistrict>;
export const CITY_ATLAS_BUILDING_BY_ID=Object.fromEntries(CITY_ATLAS_BUILDINGS.map(building=>[building.id,building])) as Record<string,AtlasBuilding>;
