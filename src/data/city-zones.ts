import type {CityDistrictId} from './city-districts';

export interface CityZoneReward {packs?:number;influence?:number;scrap?:number}
export interface CityZoneChoice {label:string;outcome:string;reward:CityZoneReward}
export interface CityZone {
 id:string;
 name:string;
 districtId:CityDistrictId;
 district:string;
 specialty:string;
 tagline:string;
 hostCardId?:string;
 art:string;
 artPosition?:string;
 color:string;
 intro:string;
 choices:readonly [CityZoneChoice,CityZoneChoice,CityZoneChoice];
}

// These IDs are saved venue IDs, retained under the legacy "zone" name for compatibility.
// Districts group these specialist buildings; the player's twelve construction plots are separate.
export const CITY_ZONES=[
 {
  id:'probable-cause',name:'Probable Cause Dispensary',districtId:'cloutside',district:'CLOUTSIDE / THE LOYALTY INSPECTION',specialty:'Dispensary / The loyalty inspection',
  tagline:'FOUR INSPECTIONS. FIVE STAMPS GETS A MUFFIN.',hostCardId:'CC054',
  art:'/assets/city-v4/corner-exterior.webp',color:'#bded69',
  intro:'420 Overlord runs the shop without leaving his smoke throne. Gandalf works the corner outside. L Ratio is on his fourth “surprise inspection” today, and the till has just printed his loyalty balance. Find the receipt inside, then hear the Plug’s side outside.',
  choices:[
   {label:'EXPOSE THE COP’S LOYALTY CARD',outcome:'You pin the receipt beside the detective’s full loyalty card. L Ratio calls it a breach of confidentiality. The queue counts his stamps out loud. Overlord makes him INSPECTOR OF THE MONTH and hands you a collector pack. The detective asks whether the muffin is still valid.',reward:{packs:1}},
   {label:'REVOKE THE “INSPECTION” DISCOUNT',outcome:'You cross OFFICIAL BUSINESS off the discount board. L Ratio reaches for his badge. Overlord points at the card reader. He reaches for his wallet instead. The owner pays you 25 Influence for closing the loophole. Next inspection: apparently not today.',reward:{influence:25}},
   {label:'MAKE THE PLUG HONOUR HIS FLYER',outcome:'Gandalf’s flyer says FREE GIFT, NO PURCHASE. He insists there is small print. You hold it up: there isn’t. He puts out a box of free novelty stickers while you remove the misleading metal sign. Worth 8 Trash. L Ratio joins the queue and insists he is off duty.',reward:{scrap:8}},
  ],
 },
 {
  id:'yacht-club',name:'Gobstein Yacht Club',districtId:'liability-hills',district:'LIABILITY HILLS / PRIVATE HARBOUR',specialty:'VIP harbour & outrageous bar tabs',
  tagline:'THE BOAT IS OFFSHORE. THE RECEIPTS ARE NOT.',hostCardId:'CC056',
  art:'/assets/city-v2/zone-yacht-club.webp',color:'#e3c56c',
  intro:'A green goblin has bought a yacht, a velvet rope and the belief that nobody can tell him to fuck off. The bouncer checks your net worth. Behind him, the captain is trying to scrape an unpaid invoice off the champagne fridge.',
  choices:[
   {label:'LEAK THE VIP BAR TAB',outcome:'The goblin called it a charity reception. The tab lists champagne, a gold-plated ice bucket and one packet of peanuts. Nobody donated a fucking thing. The captain gives you a pack for finally making the bill public.',reward:{packs:1}},
   {label:'MAKE THE RICH PRICK PAY DOCKING FEES',outcome:'He says the harbour belongs to everyone. You point at his PRIVATE PROPERTY sign. He pays before you can read the rest of his own argument back to him.',reward:{influence:30}},
   {label:'STRIP THE GOLD OFF HIS VIP SIGN',outcome:'It is brass sprayed gold. Of course it fucking is. The goblin threatens to sue for the loss of “perceived value.” You take the useful bits to the scrap dealer.',reward:{scrap:8}},
  ],
 },
 {
  id:'oil-manor',name:'Baby Oil Manor',districtId:'liability-hills',district:'LIABILITY HILLS / MANSION ROW',specialty:'Bulk deliveries & luxury excess',
  tagline:'FIVE HUNDRED BOTTLES. STILL NO FUCKING GRIP.',hostCardId:'CC057',
  art:'/assets/city-v2/zone-oil-manor.webp',color:'#a9c6ff',
  intro:'The supplier ordered enough oil to lubricate a fucking continent. Now he cannot get up his own front steps. There are two guests, five hundred bottles and a delivery driver refusing to explain any of this to his insurer.',
  choices:[
   {label:'CALL THE FUCKING SLIP INSPECTOR',outcome:'The inspector takes one step, travels twelve feet and stamps FAILED while still moving. The supplier tries to appeal. His lawyer cannot stop long enough to pick up the form. You collect a pack for the report.',reward:{packs:1}},
   {label:'SELL HIM A NONSLIP BATH MAT',outcome:'He offers you a VIP wristband. You ask for payment. He offers “exposure.” You put the mat back in the bag. Funny how quickly the cheap bastard finds a budget when he is stuck on all fours.',reward:{influence:30}},
   {label:'RETURN THE UNOPENED PALLETS',outcome:'The warehouse asks why anyone ordered this much. The supplier says “dry skin.” The driver looks at the ballroom, then at him. Nobody says another word. The empty crates are worth keeping.',reward:{scrap:10}},
  ],
 },
 {
  id:'red-flag-house',name:'The Red Flag Brothel',districtId:'liability-hills',district:'LIABILITY HILLS / AFTERPARTY STRIP',specialty:'Adults-only nightlife & expensive alibis',
  tagline:'LEAVE YOUR EGO AT THE DOOR. IT WON’T FIT ANYWAY.',
  art:'/assets/city-v2/zone-red-flag-house.webp',color:'#ff398f',
  intro:'Pink windows, a cash-only desk and a bouncer who looks better in your trousers than you do. Some idiot in a wedding suit is asking whether the cloakroom takes alibis. The night staff would like one shift without hearing “I’m actually a nice guy.”',
  choices:[
   {label:'TAKE THE MIC OFF THE “NICE GUY”',outcome:'He says women never give him a chance. The woman behind the desk points at the price list he has spent twenty minutes arguing with. You cut his mic. The staff put a pack in your hand before he starts talking again.',reward:{packs:1}},
   {label:'CHARGE THE CHEATERS A CLOAKROOM FEE',outcome:'Wedding Suit insists he only came in for directions. You ask where he is going. He says “the toilet.” The queue hears him. You charge extra for hanging up that much bullshit.',reward:{influence:30}},
   {label:'RECYCLE THE DISCARDED WEDDING RINGS',outcome:'There are nine in the lost-property drawer. One bloke comes back claiming he lost “a keyring.” You hold up his engraved wedding date. He remembers somewhere else he needs to be.',reward:{scrap:8}},
  ],
 },
 {
  id:'kfc',name:'Kancel Fried Chicken',districtId:'cloutside',district:'CLOUTSIDE / TAKEAWAY CORNER',specialty:'Late-night food & portion fraud',
  tagline:'FINGER-LICKING EVIDENCE.',
  art:'/assets/city-v2/zone-kfc.webp',color:'#ffbd38',
  intro:'The bucket says FAMILY FEAST. Inside: one wing, thirteen wet wipes and a receipt asking for a tip. The manager says portion size is subjective. A bloke in the queue has been staring at his empty box long enough to develop a personal grudge.',
  choices:[
   {label:'MAKE THE MANAGER EAT HIS OWN SPECIAL',outcome:'He says he already ate. You point at the staff meal he ordered from the kebab shop next door. The queue goes quiet. He opens your bucket, looks inside and refunds it without another fucking word.',reward:{packs:1}},
   {label:'WEIGH THE “FAMILY” BUCKET AT THE COUNTER',outcome:'The wet wipes weigh more than the chicken. He calls it a supply issue. The cook shouts that they have three freezers full of it. The queue elects you to negotiate. Nobody accepts a voucher.',reward:{influence:25}},
   {label:'CHECK WHAT THE FRYER’S BEEN EATING',outcome:'You fish out six coins, a false nail and the manager’s missing cufflink. He says it adds flavour. The cook takes his apron off. You sell the metal before he can put it back in the fryer.',reward:{scrap:8}},
  ],
 },
 {
  id:'fade-court',name:'Fade Court',districtId:'cloutside',district:'CLOUTSIDE / BARBERSHOP ROW',specialty:'Fresh cuts & unpaid punditry',
  tagline:'HE ASKED FOR A LITTLE OFF THE TOP. THEY TOOK HIS DEPOSIT.',
  art:'/assets/city-v3/district-cloutside.webp',artPosition:'25% 29%',color:'#ffbc61',
  intro:'The barber has paused your haircut to settle a greatest-album argument. Half your head is done. Three men have joined in. The booking app charges by the hour, so this prick has discovered a business model.',
  choices:[
   {label:'MAKE HIM FINISH THE OTHER SIDE',outcome:'He says greatness cannot be rushed. You turn the chair toward the mirror. He looks at the half-fade, says “fair enough” and finally picks up the clippers. Your compensation pack arrives before his next opinion.',reward:{packs:1}},
   {label:'PUT THE DEBATE ON HIS OWN TIME',outcome:'You stop the booking timer and hand him the phone. The album argument ends in four seconds. Turns out he can keep an opinion to himself when it costs him forty quid.',reward:{influence:25}},
   {label:'CASH IN THE “LUXURY” CHAIR',outcome:'The chair surcharge is six quid. The chair is held together with duct tape and a car jack. The owner waives the charge while you take his broken chrome footrest to the scrap dealer.',reward:{scrap:8}},
  ],
 },
 {
  id:'sole-custody',name:'Sole Custody',districtId:'cloutside',district:'CLOUTSIDE / SNEAKER EXCHANGE',specialty:'Sneaker resale & manufactured scarcity',
  tagline:'SAME SHOE. SECOND MORTGAGE.',
  art:'/assets/city-v3/district-cloutside.webp',artPosition:'74% 30%',color:'#85e8d8',
  intro:'A reseller wants eight hundred for trainers he bought yesterday for ninety. “Deadstock,” he says. They still have the sale sticker on. He offers to remove it for an authentication fee.',
  choices:[
   {label:'ASK HIM TO AUTHENTICATE THE SALE STICKER',outcome:'He peels it off. There is a second, cheaper sticker underneath. The queue starts filming and his “private client” discount suddenly becomes available to everyone. You leave with an apology pack.',reward:{packs:1}},
   {label:'SELL HIM HIS OWN QUEUE PLACE',outcome:'You charge him fifty to stand in the queue for his own shop. He calls it ridiculous. You say “limited availability.” The bastard pays, then asks whether the receipt is collectible.',reward:{influence:25}},
   {label:'SCRAP THE AUTHENTICATION MACHINE',outcome:'His premium authenticity scanner is a desk lamp over an old webcam. You switch it off. It still says AUTHENTIC. He offers you the equipment if you stop demonstrating it to customers.',reward:{scrap:8}},
  ],
 },
 {
  id:'360-records',name:'360 Deal Records',districtId:'cloutside',district:'CLOUTSIDE / STUDIO BLOCK',specialty:'Record deals & royalty extraction',
  tagline:'THEY GET 360. YOU GET FUCK ALL.',
  art:'/assets/city-v3/district-cloutside.webp',artPosition:'75% 71%',color:'#ed73fb',
  intro:'The label boss says he believes in your voice. The contract says he owns it, along with your merch, gigs and future apology video. The advance barely covers the lawyer needed to read the fucking contract.',
  choices:[
   {label:'READ THE ROYALTY SPLIT OUT LOUD',outcome:'Ninety for the label. Ten for the artist, minus expenses. The first expense is the boss’s car. The artist takes the contract back, crosses out the signature and hands you a pack from the release-party box.',reward:{packs:1}},
   {label:'CHARGE THE BOSS AN EXPOSURE FEE',outcome:'He asks you to promote the signing for free. You send an invoice marked EXPOSURE, PAYABLE IN MONEY. His assistant pays it out of the artist-development budget. The artist immediately asks for a copy.',reward:{influence:25}},
   {label:'TAKE BACK THE “GOLD” RECORD',outcome:'The wall plaque celebrates ten million streams. Nine million came from a laptop under his desk. The record itself is spray-painted metal. You take it; the laptop keeps clapping.',reward:{scrap:8}},
  ],
 },
 {
  id:'oscar-studios',name:'Oscar Goblin Studios',districtId:'liability-hills',district:'LIABILITY HILLS / STUDIO GATES',specialty:'Prestige pictures & bought applause',
  tagline:'HIS FILM GOT TWO STARS. HE BOUGHT SIX TROPHIES.',hostCardId:'CC051',
  art:'/assets/city-v3/district-liability-hills.webp',artPosition:'23% 26%',color:'#eccb79',
  intro:'The Oscar Goblin has commissioned a standing ovation before shooting a single scene. His own portrait fills the audition room. The actors are outside eating crisps because he spent the catering budget engraving PRODUCER on everything.',
  choices:[
   {label:'LET THE CREW REVIEW THE DIRECTOR',outcome:'The crew gives him one star. He orders the assistant to remove the negative review. She points at all forty people holding it up. He gives you a pack to end the screening; the crew keeps the cards.',reward:{packs:1}},
   {label:'MAKE HIM PAY FOR HIS STANDING OVATION',outcome:'The extras have been standing for three hours. You explain overtime. He says applause should be sincere. They sit down. His accountant has the money ready before his arse reaches the chair.',reward:{influence:25}},
   {label:'WEIGH THE TROPHY ARMOUR',outcome:'He says the awards speak for themselves. The prop master taps one with a screwdriver. It is hollow. You strip the broken display rack while he asks whether anybody heard that.',reward:{scrap:8}},
  ],
 },
 {
  id:'moonwalk-museum',name:'Moonwalk Museum',districtId:'liability-hills',district:'LIABILITY HILLS / MEMORABILIA DRIVE',specialty:'Celebrity auctions & eternal comeback tickets',
  tagline:'ONE GLOVE. TWO HUNDRED QUID. NO LEFT HAND.',
  art:'/assets/city-v3/district-liability-hills.webp',artPosition:'75% 74%',color:'#b6c2ff',
  intro:'The curator wants two hundred for a silver glove. The label says “stage worn”; the box behind him says PARTY ACCESSORIES, PACK OF TWELVE. Upstairs, the comeback exhibition has postponed its own opening for the sixth time.',
  choices:[
   {label:'ASK WHERE THE OTHER ELEVEN GLOVES WENT',outcome:'He calls them alternate-era artefacts. You count the empty display cases and start reading the bulk-order receipt. He gives you a collector pack before you reach the discount code.',reward:{packs:1}},
   {label:'REFUND THE COMEBACK THAT NEVER CAME',outcome:'The ticket says FINAL COMEBACK. The next one says FINAL FINAL COMEBACK. You pin all six editions to the counter. The curator refunds the queue while insisting the next one is definitely the last.',reward:{influence:25}},
   {label:'DISMANTLE THE SELF-MOONWALKING DISPLAY',outcome:'The priceless stage mechanism is a treadmill running backwards. It eats the curator’s velvet rope and spits the gold clips at your feet. You collect the metal. He adds PERFORMANCE ART to the label.',reward:{scrap:8}},
  ],
 },
] as const satisfies readonly CityZone[];

export type CityZoneId=typeof CITY_ZONES[number]['id'];
export const CITY_ZONE_BY_ID=Object.fromEntries(CITY_ZONES.map(zone=>[zone.id,zone])) as Record<CityZoneId,CityZone>;
