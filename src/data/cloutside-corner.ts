export type CornerSpeaker='overlord'|'dealer'|'detective';
export type CornerClueId='receipt'|'statement';
export interface CornerLine {speaker:CornerSpeaker;line:string}

// The cast keeps the card identities, costumes and props. Their jobs belong to this street scene.
export const CORNER_CAST={
 overlord:{
  cardId:'CC054',name:'420 Overlord',role:'Owner / Still in the chair',
  firstLine:'If this is another inspection, stamp your own card. I’m not getting up.',
  ambient:['Opening hours? I’m open. That’s an hour.','The chair is a business expense. The throne is a medical necessity.','He called it evidence, then asked for a bag with handles.'],
 },
 dealer:{
  cardId:'CC018',name:'Gandalf the Grey Market',role:'The Plug / Unlicensed competitor',
  firstLine:'Same shit. He’s just got a fucking receipt printer.',
  ambient:['I had customers before he had a logo.','They ask if I validate parking. I’m standing behind a bin.','I spent forty quid on flyers. He spent it on a fucking loyalty app.'],
 },
 detective:{
  cardId:'CC003',name:'L Ratio',role:'Detective / Very regular inspector',
  firstLine:'Routine inspection. The fact that they know my usual is irrelevant.',
  ambient:['These are not loyalty points. They are a record of attendance.','I am undercover. The slippers would compromise the operation.','No photographs. Unless you get my good side.'],
 },
} as const satisfies Record<CornerSpeaker,{cardId:string;name:string;role:string;firstLine:string;ambient:readonly string[]}>;

export const CORNER_CLUES={
 receipt:{
  title:'The inspector’s receipt',
  detail:'Four visits today. Four loyalty stamps. L Ratio used the “official inspection” discount every time. One more stamp earns him a free muffin.',
  speaker:'overlord',line:'He said it was evidence. Then asked if the points carried over.',
 },
 statement:{
  title:'The Plug’s statement',
  detail:'Gandalf watched the detective ask for “the usual,” scan his loyalty card and put the purchase on expenses. So much for a surprise inspection.',
  speaker:'dealer',line:'He shouts “police” at my corner, then whispers “member price” at his counter.',
 },
} as const satisfies Record<CornerClueId,{title:string;detail:string;speaker:CornerSpeaker;line:string}>;

export const CORNER_OPENING=[
 {speaker:'detective',line:'Routine inspection.'},
 {speaker:'dealer',line:'Fourth one today. You fucking live here?'},
 {speaker:'overlord',line:'One more and he gets a free muffin.'},
 {speaker:'detective',line:'That is confidential.'},
] as const satisfies readonly CornerLine[];

export const CORNER_ENDINGS={
 0:{speaker:'overlord',line:'I put his card in the window. He wanted his name spelled correctly.',sign:'INSPECTOR OF THE MONTH',dealerLine:'Four inspections. No case. Excellent customer retention.',detectiveLine:'The muffin is now part of an ongoing investigation.'},
 1:{speaker:'overlord',line:'Crossed out the discount. He finished the inspection before the ink dried.',sign:'BADGES DON’T GET 20% OFF',dealerLine:'Found the exit as soon as he found the price.',detectiveLine:'I appear to have finished my inspection.'},
 2:{speaker:'dealer',line:'It was meant to say free gift WITH purchase. The printer fucked me.',sign:'FREE GIFT MEANS FREE',dealerLine:'Stop taking two. I can see you taking two.',detectiveLine:'I’m only here for the free gift. Off duty, obviously.'},
} as const satisfies Record<0|1|2,{speaker:CornerSpeaker;line:string;sign:string;dealerLine:string;detectiveLine:string}>;
