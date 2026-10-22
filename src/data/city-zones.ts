export interface CityZoneReward {packs?:number;influence?:number;scrap?:number}
export interface CityZoneChoice {label:string;outcome:string;reward:CityZoneReward}
export interface CityZone {
 id:string;
 name:string;
 district:string;
 tagline:string;
 hostCardId?:string;
 art:string;
 color:string;
 intro:string;
 choices:readonly [CityZoneChoice,CityZoneChoice,CityZoneChoice];
}

// Fixed landmarks sit beside the player's twelve plots. They are not construction recipes.
export const CITY_ZONES=[
 {
  id:'yacht-club',name:'Gobstein Yacht Club',district:'THE FILTHY RICH / HARBOUR',
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
  id:'oil-manor',name:'Baby Oil Manor',district:'THE SLIPPERY HILLS',
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
  id:'red-flag-house',name:'The Red Flag Brothel',district:'AFTERPARTY STRIP / ADULTS ONLY',
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
  id:'kfc',name:'Kancel Fried Chicken',district:'THE FOOD COURT / OPEN FAR TOO LATE',
  tagline:'FINGER-LICKING EVIDENCE.',
  art:'/assets/city-v2/zone-kfc.webp',color:'#ffbd38',
  intro:'The bucket says FAMILY FEAST. Inside: one wing, thirteen wet wipes and a receipt asking for a tip. The manager says portion size is subjective. A bloke in the queue has been staring at his empty box long enough to develop a personal grudge.',
  choices:[
   {label:'MAKE THE MANAGER EAT HIS OWN SPECIAL',outcome:'He says he already ate. You point at the staff meal he ordered from the kebab shop next door. The queue goes quiet. He opens your bucket, looks inside and refunds it without another fucking word.',reward:{packs:1}},
   {label:'WEIGH THE “FAMILY” BUCKET AT THE COUNTER',outcome:'The wet wipes weigh more than the chicken. He calls it a supply issue. The cook shouts that they have three freezers full of it. The queue elects you to negotiate. Nobody accepts a voucher.',reward:{influence:25}},
   {label:'CHECK WHAT THE FRYER’S BEEN EATING',outcome:'You fish out six coins, a false nail and the manager’s missing cufflink. He says it adds flavour. The cook takes his apron off. You sell the metal before he can put it back in the fryer.',reward:{scrap:8}},
  ],
 },
] as const satisfies readonly CityZone[];

export type CityZoneId=typeof CITY_ZONES[number]['id'];
export const CITY_ZONE_BY_ID=Object.fromEntries(CITY_ZONES.map(zone=>[zone.id,zone])) as Record<CityZoneId,CityZone>;
