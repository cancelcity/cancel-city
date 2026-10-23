export type HillsSpeaker='owner'|'oscar'|'supplier';
export type HarbourClueId='invoice'|'guest-list';
export interface HillsLine {speaker:HillsSpeaker;line:string}

// These are the existing card characters, with their original costumes and props.
export const HILLS_CAST={
 owner:{
  cardId:'CC056',name:'Jeffrey Gobstein',role:'Yacht club owner / Charity begins at his bar',
  firstLine:'It’s a charity gala. That means I shouldn’t have to pay for it.',
  ambient:['The captain keeps mentioning his invoice during my speech. Very unprofessional.','The velvet rope is rented. Please stop leaning on it.','Of course the drinks cost extra. You’re here to give.'],
 },
 oscar:{
  cardId:'CC051',name:'Oscar Goblin',role:'Invited guest / Still waiting for his introduction',
  firstLine:'They put me down as a donor. I agreed to attend. That’s the fucking donation.',
  ambient:['I clapped for his speech. He can clap for my parking.','My assistant said black tie. Nobody said bring a fucking wallet.','There are six cameras and no one has asked me a question.'],
 },
 supplier:{
  cardId:'CC057',name:'Baby Oil Supplier',role:'Wrong delivery / Refuses to reload the van',
  firstLine:'Five hundred bottles for the gala. Apparently he ordered five hundred olives.',
  ambient:['I asked him twice. He said “the usual.” That’s on him.','He wants to send it back. He’s already opened twelve.','I’m not carrying these up that fucking hill again.'],
 },
} as const satisfies Record<HillsSpeaker,{cardId:string;name:string;role:string;firstLine:string;ambient:readonly [string,string,string]}>;

export const HILLS_OPENING=[
 {speaker:'owner',line:'Welcome to our charity gala. Drinks are forty quid.'},
 {speaker:'oscar',line:'Which charity?'},
 {speaker:'owner',line:'It’s on the guest list.'},
 {speaker:'supplier',line:'So is my delivery. Who ordered five hundred bottles of baby oil?'},
 {speaker:'owner',line:'Olives. I said fucking olives.'},
] as const satisfies readonly HillsLine[];

export const HILLS_CLUES={
 invoice:{
  title:'The harbour invoice',
  detail:'Three unpaid nights at the dock. The gala bar tab lists champagne, a gold-plated ice bucket and one packet of peanuts. Every charge is marked “bill the charity.” There is no charity account.',
  speaker:'owner',line:'The captain has confused “complimentary berth” with “three overdue invoices.”',
 },
 'guest-list':{
  title:'Oscar’s guest list',
  detail:'Every guest is marked COMPLIMENTARY. The charity-name field is blank. Oscar has circled his own name and added “attendance counts as donation.” No money has been collected.',
  speaker:'oscar',line:'It says “charity to be confirmed.” He’s booked the fucking photographer, though.',
 },
} as const satisfies Record<HarbourClueId,{title:string;detail:string;speaker:HillsSpeaker;line:string}>;

// Choice order and payouts are the existing Gobstein Yacht Club encounter.
export const HILLS_ENDINGS={
 0:{speaker:'owner',line:'You put the bar tab on the gate. Someone has already asked for a refund. They didn’t even pay.',sign:'GALA BAR TAB: NOW PUBLIC',oscarLine:'Please crop my name out. I brought my own peanuts.',supplierLine:'Turns out the only person who donated anything was me. Twelve fucking bottles.'},
 1:{speaker:'owner',line:'Fine. Docking fees paid. The captain could at least say thank you in front of the cameras.',sign:'DOCKING FEES PAID IN FULL',oscarLine:'He asked me to split it. I gave him a standing ovation.',supplierLine:'Amazing. He knows how a card reader works when the boat’s chained up.'},
 2:{speaker:'owner',line:'You can’t just take my VIP sign. People will think anyone can get in.',sign:'VIP SIGN REMOVED',oscarLine:'The sign was brass? He charged me extra to stand next to it.',supplierLine:'I’ve got a spare label. “Keep out of direct sunlight.” Fits him nicely.'},
} as const satisfies Record<0|1|2,{speaker:HillsSpeaker;line:string;sign:string;oscarLine:string;supplierLine:string}>;
