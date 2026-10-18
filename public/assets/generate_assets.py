"""Original code-authored Cancel City punk cartoon vector illustrations. No external art."""
from pathlib import Path
import json
from xml.etree import ElementTree as ET
ROOT=Path(__file__).resolve().parent
INK='#101014'; PAPER='#f1e8d5'; ACID='#deff00'; PINK='#ff2daa'; CYAN='#31d7ff'; RED='#ff665c'; PURPLE='#9662d7'; SKIN='#e9a875'

def p(d,fill=INK,stroke=INK,w=8,extra=''):
    return f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round" {extra}/>'
def r(x,y,w,h,fill,rx=8,extra='',stroke=INK,sw=8):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" {extra}/>'
def c(x,y,rad,fill,extra='',stroke=INK,sw=8):
    return f'<circle cx="{x}" cy="{y}" r="{rad}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" {extra}/>'
def e(x,y,rx,ry,fill,extra='',stroke=INK,sw=8):
    return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" {extra}/>'
def line(d,color=INK,w=8): return p(d,'none',color,w)
def group(s,transform): return f'<g transform="{transform}">{s}</g>'
def eyes(x=240,y=217,mood='angry',glasses=False):
    if glasses:
        return r(x-71,y-22,63,42,INK,4)+r(x+8,y-22,63,42,INK,4)+line(f'M{x-7} {y-5} H{x+8}')+line(f'M{x-66} {y-11} l20 15 M{x+13} {y-11} l20 15',CYAN,4)
    a=e(x-32,y,23,20,PAPER)+e(x+32,y,23,20,PAPER)+c(x-26,y+2,6,INK,sw=0)+c(x+26,y+2,6,INK,sw=0)
    if mood=='angry': a+=line(f'M{x-58} {y-30} l48 16 M{x+12} {y-14} l48 -16')
    elif mood=='sad': a+=line(f'M{x-58} {y-28} l48 -12 M{x+12} {y-40} l48 12')
    elif mood=='crazy': a+=c(x+32,y,12,PINK,sw=0)+c(x+32,y,5,INK,sw=0)
    return a

def face(x=240,y=216,skin=SKIN,mood='angry',hair='black',glasses=False,mouth='smirk',wide=1):
    a=e(x,y+7,82*wide,95,skin)+e(x-80*wide,y+4,12,23,skin)+e(x+80*wide,y+4,12,23,skin)
    a+=p(f'M{x-77*wide} {y-33} Q{x-87*wide} {y-115} {x+5} {y-108} Q{x+92*wide} {y-112} {x+78*wide} {y-26} L{x+62} {y-61} L{x+20} {y-72} L{x-5} {y-50} L{x-48} {y-64} Z',hair)
    a+=eyes(x,y,mood,glasses)
    a+=line(f'M{x+2} {y+2} l-10 28 l17 3',INK,5)
    if mouth=='yell':
        a+=e(x,y+57,34,27,INK)+p(f'M{x-27} {y+43} h54 l-6 13 h-43 Z',PAPER,w=3)+e(x,y+73,18,6,PINK,sw=0)
    elif mouth=='sad': a+=line(f'M{x-24} {y+61} Q{x} {y+37} {x+25} {y+62}',INK,7)
    elif mouth=='teeth': a+=p(f'M{x-35} {y+45} Q{x} {y+59} {x+36} {y+43} L{x+26} {y+71} Q{x} {y+78} {x-27} {y+66}Z',PAPER,w=6)+line(f'M{x-13} {y+53}v15 M{x+9} {y+54}v17',INK,3)
    else:a+=line(f'M{x-25} {y+56} Q{x+10} {y+72} {x+40} {y+42}',INK,7)
    a+=p(f'M{x-64} {y+13} l13 24 l-17 21',skin,INK,3)+line(f'M{x+42} {y+22} l15 -2',INK,3)
    return a

def body(fill=PURPLE,tie=False,x=240):
    a=p(f'M{x-55} 295 Q{x-134} 317 {x-140} 449 L{x+142} 460 Q{x+132} 317 {x+52} 295 Z',fill)
    if tie:a+=p(f'M{x-48} 300 L{x} 352 L{x+48} 300 L{x+20} 293 H{x-22} Z',PAPER)+p(f'M{x-13} 336 L{x+15} 336 L{x+23} 404 L{x} 430 L{x-23} 402 Z',PINK,w=5)
    a+=p(f'M{x-94} 346 l15 104 M{x+91} 346 l-15 104','none',INK,5)
    return a

def hand(x,y,skin=SKIN,rot=0):
    return group(p('M-22 19 Q-31 -5 -18 -16 L-16 -32 Q-8 -45 0 -30 L4 -9 L11 -24 Q22 -33 24 -19 L21 18 Q5 42 -22 19Z',skin,w=6),f'translate({x} {y}) rotate({rot})')

def skull(x=240,y=208,size=1):
    a=p('M-67 34 Q-98 -70 -30 -91 Q44 -124 82 -55 Q112 -2 69 45 L51 84 H-44 L-54 45 Z',PAPER)
    a+=e(-33,-3,25,30,INK,sw=0)+e(36,-3,25,30,INK,sw=0)+p('M-10 35 L3 12 L14 35 Z',INK,w=3)+r(-49,51,96,30,PAPER,3,sw=5)+line('M-28 54v24 M-7 53v25 M14 53v25 M34 53v25',INK,4)
    return group(a,f'translate({x} {y}) scale({size})')

names=['The Professional Victim','Discord Dictator','The Reply Guy','AI Slop Prophet','The Algorithm','LinkedIn Gladiator','Unpaid Intern','HR Necromancer','Private Jet Environmentalist','CEO of Poverty','French Strike Simulator','Swiss Neutrality Enjoyer','British Museum Collector','Italian Pasta Inquisition','Florida Man','Minister of Denial','Virtue Signal Knight','Tax Evasion Wizard','Populist Megaphone','Democracy Paywall','Exit Liquidity Chad','Diamond Hands Corpse','Rug Pull Magician','Dubai Course Seller','Forgotten Seed Phrase','Final Boss Karen','Doomsday Prepper','Conspiracy Uncle','Doomscroll Parasite','Cancelled Messiah']
factions=['terminally-online','corporate-hell','international-incidents','politics-hypocrisy','crypto-degenerates','cursed-society']
colors=[CYAN,PINK,ACID,RED,PURPLE,CYAN]

def background(i):
    col=colors[(i-1)//5]
    a=r(0,0,480,480,col,0,sw=0)
    a+=p('M-30 90 L104 128 L80 -20 L216 117 L307 -30 L302 162 L488 38 L389 211 L515 301 L337 303 L420 499 L257 380 L122 516 L142 333 L-24 372 L71 250Z',PAPER,w=3,extra='opacity=".32"')
    a+=r(0,0,480,480,'url(#dots)',0,sw=0)
    a+=p('M0 389 L64 374 L116 397 L143 381 L189 400 L260 382 L301 410 L355 383 L397 400 L449 377 L480 388 V480 H0Z',INK,w=0)
    a+=line('M17 31l26 7 M412 29l32 -9 M18 343l35 -9 M427 355l28 11',INK,4)
    return a

def portrait(i):
    a=''
    if i==1:
        a=c(240,219,164,PAPER,sw=12)+c(240,219,140,INK,sw=0)+body(PINK)+face(mood='sad',hair='#d18f3c',mouth='sad')
        a+=p('M207 233 Q183 270 208 276 Q224 268 207 233Z',CYAN,w=3)+p('M273 233 Q254 263 271 266 Q289 265 273 233Z',CYAN,w=3)
        a+=r(43,312,99,132,INK,10)+r(55,326,75,99,PURPLE,5,sw=3)+c(91,432,4,CYAN,sw=0)+hand(145,370,rot=10)
    elif i==2:
        a+=body(PURPLE)+face(hair='#32283d',wide=1.12,mouth='yell')
        a+=p('M165 126 L155 69 L198 92 L227 46 L251 87 L294 65 L307 132Z',ACID)+c(226,91,8,PINK,sw=3)
        a+=p('M150 218 Q126 86 243 90 Q357 98 340 220','none',INK,15)+r(128,199,27,66,CYAN)+r(325,199,27,66,CYAN)+line('M337 259 L295 280',INK,10)+c(286,282,8,INK,sw=0)
        a+=group(r(0,0,24,160,PAPER,3)+r(-36,-35,96,64,PINK,5), 'translate(379 267) rotate(18)')+hand(375,372)
    elif i==3:
        a+=body('#54787e')+face(hair='#3c3026',mouth='teeth')+line('M161 253 Q162 327 242 328 Q316 322 317 254 L281 282 Q239 315 197 276Z',INK,11)
        a+=r(47,349,314,117,PAPER,7)+r(64,366,280,75,'#aab1ae',4,sw=3)
        a+=line('M80 384h240 M80 404h240 M103 374v56 M139 374v56 M178 374v56 M217 374v56 M256 374v56 M294 374v56',INK,3)
        a+=hand(375,248,rot=-28)+line('M364 223l7 -46',SKIN,18)+line('M371 175l2 -20',INK,6)
    elif i==4:
        a+=p('M139 361 L100 244 L138 209 L112 159 L182 159 L183 94 L235 123 L282 91 L299 155 L350 153 L332 209 L375 244 L341 371Z',PURPLE)
        a+=p('M170 214 Q167 139 238 135 Q310 144 309 215 L286 296 L197 299Z',PAPER)+eyes(240,220,'crazy')+e(240,270,43,15,INK)+line('M209 269h64',ACID,5)
        a+=body('#223333')+r(142,332,196,113,ACID,12)+p('M208 357 L266 374 L229 393 L271 415 L212 426Z',PINK,w=5)
        a+=hand(121,375,skin=PAPER,rot=-22)+hand(359,375,skin=PAPER,rot=22)+p('M98 378 l-23 28 M95 383 l-15 44 M360 380l31 31 M366 383l19 45','none',PAPER,14)
    elif i==5:
        a+=c(239,207,165,INK,sw=0)+c(239,207,143,ACID,sw=10)+line('M240 28v45 M61 117l34 21 M417 119l-38 20 M405 331l-31 -20 M76 329l26 -23',PAPER,12)
        a+=group(r(0,0,188,291,INK,27)+r(16,24,156,241,PINK,8)+r(65,7,59,9,PAPER,5,sw=0)+eyes(94,117,'angry')+p('M48 175 Q97 216 146 176 L134 226 Q94 249 60 220Z',INK,w=3)+line('M71 185v18 M94 193v18 M120 185v19',PAPER,8),'translate(147 90) rotate(-8 90 140)')
        a+=p('M142 303 L83 411 L55 386 L127 306 M323 301 L407 410 L428 375 L337 286',PAPER,w=8)+e(72,426,41,19,PAPER)+e(413,422,41,19,PAPER)
    elif i==6:
        a+=body('#2a5371',True)+face(hair='#372720',mouth='teeth')
        a+=p('M153 128 L143 89 Q227 44 321 89 L329 136 L281 118 L209 113Z',CYAN)+p('M223 74L247 75L249 17L225 15Z',PINK)
        a+=group(r(0,0,27,174,PAPER,3)+p('M-12 4 L14 -47 L36 5Z',PINK),'translate(388 245) rotate(12)')+hand(385,345)
        a+=r(135,338,207,46,PAPER,5)+line('M155 355h104 M155 368h169',INK,4)
    elif i==7:
        a+=body('#bbb7a7',True)+face(skin='#d7b995',hair='#42372c',mood='sad',mouth='sad')
        a+=line('M189 237l27 3 M265 240l27 -3',PURPLE,5)+p('M219 301 L257 301 L256 331 L227 333Z',SKIN)
        a+=r(50,318,93,129,PAPER,6)+line('M70 344h51 M70 362h45 M70 381h55',INK,4)+hand(143,373)
        a+=r(330,324,85,59,CYAN,0)+r(319,382,98,25,PAPER,0)+r(338,411,73,27,PAPER,0)+hand(320,413)
    elif i==8:
        a+=body('#415058',True)+skull()+p('M152 144 Q151 73 253 98 Q321 85 323 143Z',PURPLE)
        a+=r(139,336,116,113,ACID,3)+p('M191 351v65 M161 385h61','none',INK,9)
        a+=group(line('M0 0v184',PAPER,15)+c(0,0,24,PINK)+p('M-29 25 L0 58 L31 25',PAPER), 'translate(381 256) rotate(16)')+hand(366,355,PAPER)
    elif i==9:
        a+=p('M46 91 L157 95 L338 63 L412 85 L337 120 L452 157 L427 180 L278 131 L89 147 L26 125Z',PAPER,w=6)+line('M205 91l110 -13',CYAN,10)
        a+=body('#408b57',True)+face(hair='#bfad6f',glasses=True,mouth='teeth')
        a+=c(95,368,49,ACID)+p('M95 337 Q52 357 77 395 Q126 373 95 337Z','#499956',w=5)+line('M80 389l19 -33',INK,5)+hand(144,390)
    elif i==10:
        a+=body(INK,True)+face(y=225,skin='#eab179',hair=PAPER,wide=1.22,mouth='teeth')
        a+=p('M115 128 L124 72 L169 103 L219 49 L254 104 L309 54 L352 125Z',ACID)+c(220,92,10,PINK,sw=3)
        a+=group(r(0,0,97,97,ACID,2)+line('M18 18h61 M18 39h61 M18 61h61',INK,5),'translate(44 332) rotate(-11)')+hand(140,374)+hand(360,374)
        a+=r(352,307,86,144,PAPER,7)+line('M368 332h51 M368 351h51',INK,5)+p('M369 405l17 -17 l9 4 l27 -37','none',PINK,7)
    elif i==11:
        a+=body('#405b71')+face(hair='#413329',mouth='yell')+p('M148 138 Q160 79 269 94 L294 84 L300 102 Q333 95 334 143Z',INK)+line('M177 324h127 M156 354h163 M145 385h185 M145 415h185',PAPER,9)
        a+=line('M80 249v204',PAPER,17)+group(r(0,0,109,91,RED,0)+line('M17 25h73 M17 44h73 M17 64h50',PAPER,8),'translate(23 191) rotate(-7)')+hand(89,352)
    elif i==12:
        a+=p('M0 225L65 104L111 168L174 41L251 179L311 97L383 204L427 140L480 246V480H0Z',PAPER,w=3)+body('#38394b',True)+face(hair=PAPER,glasses=True)
        a+=p('M183 92L240 71L303 101L312 144H164Z',INK)+r(38,354,139,100,CYAN,4)+line('M52 376h109 M52 397h109',INK,5)
        a+=r(328,337,102,115,RED,4)+p('M369 358h20v25h24v19h-24v25h-20v-25h-23v-19h23Z',PAPER,w=0)
    elif i==13:
        a+=body('#c5a27d',True)+face(hair='#665346',mouth='teeth')+e(278,217,24,26,'none',sw=5)+line('M299 220l18 58',INK,3)
        a+=p('M76 369 Q49 272 74 190 L128 184 L130 256 Q168 264 167 313 L145 389Z',ACID)+p('M75 212L128 215L119 244L79 244Z',PINK)+eyes(103,278,'angry')+line('M83 315h40',INK,6)+hand(167,381)
        a+=p('M358 318 L381 281 L406 287 L419 338 L409 422 L367 424Z',PAPER)+c(385,327,15,CYAN)+hand(348,378)
    elif i==14:
        a+=body('#b74842')+face(skin='#dda576',hair=PAPER,mouth='yell',wide=.95)+p('M162 144 Q144 99 184 84 Q155 51 194 38 Q223 13 247 41 Q278 5 304 41 Q346 42 323 97 Q346 120 318 143Z',PAPER)+r(159,108,162,42,PAPER,5)
        a+=p('M168 317 L194 294 L216 346 L264 346 L284 294 L311 317 L327 459 H153Z',PAPER)
        a+=p('M358 222 L381 195 L411 226 L391 250 L405 362 L372 369 L369 251Z',CYAN)+hand(379,360)
        a+=line('M68 306l35 104 M77 300l35 102 M91 295l35 101',ACID,8)+hand(113,392)
    elif i==15:
        a+=body(ACID)+face(hair='#a76632',mood='crazy',mouth='yell')+p('M192 100 L173 62 L215 73 L220 33 L251 81 L300 66 L289 108Z',RED)
        a+=p('M-28 372 L59 308 L182 352 L326 368 L389 327 L477 362 L449 399 L352 406 L259 451 L216 407 L93 434 L29 411Z','#488256')
        a+=p('M356 370L460 364L444 391L369 393Z',PAPER,w=5)+line('M372 374v16 M394 374v16 M417 373v16 M438 373v14',INK,4)+c(388,351,9,PAPER,sw=4)+c(388,351,3,INK,sw=0)+hand(162,391)+hand(332,407)
        a+=p('M33 100l-16 60 M46 101l5 69','none',PAPER,10)
    elif i==16:
        a+=body('#344957',True)+face(hair='#66564a',mouth='yell')+p('M153 182 L138 203L153 237 L191 241 L207 191Z',SKIN)+p('M286 195 L307 186L331 204L332 237 L300 241Z',SKIN)
        a+=r(67,365,346,103,PAPER,6)+line('M93 387h115 M93 410h144 M93 433h111',INK,5)+p('M282 390l86 43 M370 390l-88 43','none',RED,10)
    elif i==17:
        a+=p('M133 305 L139 119 L208 76 L284 76 L342 130 L337 311Z',CYAN)+p('M174 145H302V235L269 269H209L174 235Z',PAPER)+eyes(239,201,'angry')+line('M215 246h45',INK,7)
        a+=body(CYAN)+p('M174 308L239 330L304 308L289 391L239 425L187 391Z',PAPER)+p('M211 366 l20 22 l39 -47','none',PINK,14)
        a+=group(p('M-43 -24H45V47Q0 93 -43 47Z',ACID)+p('M-17 14l15 15 l27 -34','none',INK,10),'translate(99 359) rotate(-13)')+hand(133,380,PAPER)
    elif i==18:
        a+=body(PURPLE)+face(hair=PAPER,mouth='teeth')+p('M163 139 L239 11 L306 145Z',PURPLE)+p('M128 149Q232 106 338 153L341 167H127Z',PURPLE)+c(241,91,12,ACID,sw=3)
        a+=p('M183 268 L239 278 L299 265 L274 364 L239 388 L206 344Z',PAPER,w=5)+c(92,353,56,PINK)+c(92,353,36,INK)+r(48,315,57,35,ACID,4,extra='transform="rotate(-28 75 330)"')+hand(144,381)
        a+=line('M370 409l29 -160',PAPER,13)+p('M399 249L378 211L415 219L442 187L438 228L466 248L426 255L409 287Z',CYAN)+hand(377,364)
    elif i==19:
        a+=body('#5a5666',True)+face(hair='#d4a96a',mouth='yell')+p('M176 101 L150 135 L208 143 L249 119 L301 152 L327 107 L294 69 L231 72Z','#e8b65f')
        a+=group(p('M0 0L103 -49L103 73L0 32Z',RED)+r(-24,-6,43,49,PAPER,4)+r(12,36,21,68,INK,4),'translate(318 287) rotate(-8)')+hand(329,382)
        a+=p('M81 283l-39 -31 l12 -13 l61 20 l26 36 L126 351 L81 345Z',SKIN)+line('M48 252l-28 -13',SKIN,20)
    elif i==20:
        a+=r(101,98,277,298,INK,12)+r(118,116,243,167,PAPER,3)+p('M196 145L228 127L269 141L287 176L269 209L223 217L190 189Z',CYAN)+line('M217 170l15 16l29 -32',INK,10)+r(181,244,119,47,PINK,7)
        a+=r(128,308,92,67,PURPLE,3)+r(255,307,83,41,ACID,3)+r(255,360,65,8,PAPER,0,sw=0)
        a+=p('M101 351 L47 404L78 432L144 383 M373 350L435 400L410 433L344 381',PAPER)+e(157,439,61,21,INK)+e(328,439,61,21,INK)+p('M171 90L170 39L308 39L309 90',PAPER)+line('M197 61h85',INK,8)
    elif i==21:
        a+=p('M9 177L84 126L148 133L219 66L290 98L386 30L471 36','none',ACID,15)+body('#854cac')+face(hair='#5b3c27',glasses=True,mouth='teeth')+p('M167 319 Q240 394 313 319','none',ACID,15)
        a+=c(239,380,30,ACID)+line('M235 358v42 M224 365h23q18 0 13 13q22 16 -5 21h-31',INK,5)
        a+=r(348,315,77,112,INK,9)+r(358,329,57,78,PINK,3,sw=0)+line('M367 347l12 18l12 -8l16 26',PAPER,5)+hand(338,373)
    elif i==22:
        a+=body('#293847',True)+skull()+p('M160 123L171 67L211 95L246 63L306 109Z',PINK)
        a+=p('M77 332L101 308L124 340L117 389L83 392L64 365Z',CYAN)+p('M366 330L385 308L413 338L418 368L397 391L365 378Z',CYAN)+p('M71 347l29 -7l17 33 M375 345l28 3l-18 40','none',PAPER,4)
        a+=line('M127 388l48 -34 M364 382l-50 -32',PAPER,19)+r(167,361,145,98,PURPLE,7)+line('M198 381v48 M270 381v48',INK,7)
    elif i==23:
        a+=body(INK,True)+face(hair=PAPER,skin='#ccb9a8',mouth='teeth')+r(174,50,137,95,INK,5)+e(240,145,120,24,INK)+r(176,110,134,25,PINK,0,sw=0)
        a+=p('M52 380 Q96 324 176 367 Q256 411 335 358 L426 400 Q304 468 184 415 Q119 383 70 430Z',PURPLE)+p('M58 384Q142 352 200 399L338 381','none',PAPER,6)
        a+=hand(95,356,rot=35)+hand(370,351,rot=-35)+p('M373 303l31 -69',PAPER,w=0)+line('M385 275l21 -45',INK,11)+c(411,422,24,CYAN)+c(439,378,13,PINK)+c(27,412,18,ACID)
    elif i==24:
        a+=p('M43 290L62 166H98V290 M347 267L364 71H384L405 269 M408 294L422 186H449V294',PAPER,w=5)+body(PAPER,True)+face(hair=INK,glasses=True,mouth='teeth')
        a+=line('M170 257 Q183 323 240 322 Q306 320 310 254',INK,12)+p('M163 90L303 92L334 132H158Z',INK)
        a+=r(330,322,106,125,ACID,6)+line('M349 347h69 M349 365h56 M349 388h65 M349 411h34',INK,6)+hand(328,391)+hand(137,377)+r(111,339,59,22,ACID,4)+c(141,348,14,PAPER,sw=5)
    elif i==25:
        a+=r(71,81,341,344,INK,25)+r(90,104,298,295,'#41444b',8)+r(104,120,270,65,RED,6)+line('M132 145h31 M174 145h30 M218 145h31 M262 145h29 M305 145h31',PAPER,5)
        a+=c(236,286,77,PAPER)+c(236,286,53,PURPLE)+line('M236 223v126 M173 286h126',INK,12)+c(236,286,20,INK)+r(333,219,24,150,CYAN,3)+r(36,169,50,54,PAPER,3)+r(37,309,51,54,PAPER,3)
        a+=p('M231 58 Q213 1 255 15 Q285 18 262 49L254 57V70','none',ACID,15)+c(254,83,6,ACID,sw=0)+e(126,437,44,15,PAPER)+e(355,437,44,15,PAPER)
    elif i==26:
        a+=body(PINK)+p('M113 312 Q78 139 127 112 Q86 65 155 48 Q170 3 243 45 Q288 4 326 57 Q391 77 362 141 Q405 242 370 332Z',ACID)
        a+=face(hair=ACID,mouth='yell',skin='#edb08a',wide=1.07)+p('M149 165Q182 70 312 98L267 156L202 141L174 184Z',ACID)+line('M189 190l30 1 M269 191l28 -6',PINK,5)+e(178,262,8,11,PINK,sw=0)+e(303,263,8,11,PINK,sw=0)
        a+=r(358,254,75,132,INK,12)+r(366,267,58,102,CYAN,5,sw=0)+hand(353,342)+hand(112,381,rot=-25)+p('M96 327l-8 -49','none',SKIN,16)
    elif i==27:
        a+=body('#627246')+face(hair='#473c2d',mouth='teeth')+p('M161 115Q165 66 242 66Q315 64 321 118Z','#65774b')+r(158,111,170,23,INK,5)+c(248,102,16,ACID,sw=4)
        a+=r(154,322,76,60,PAPER,4)+r(250,322,76,60,PAPER,4)+r(156,397,76,60,PAPER,4)+r(249,397,76,60,PAPER,4)+line('M192 336v31 M175 352h34',RED,8)
        a+=p('M77 305L44 355L66 418L108 423L133 374L113 318Z',ACID)+c(91,365,25,INK)+p('M91 342L98 358L114 356L103 370L108 386L92 379L78 389L82 371L68 360L86 357Z',RED,w=2)+hand(142,378)
    elif i==28:
        a+=r(54,35,350,211,PAPER,4)+c(99,81,12,PINK)+c(328,71,14,CYAN)+c(175,112,12,ACID)+c(351,174,13,RED)+line('M99 81L328 71L175 112L351 174L99 81 M175 112L144 206L328 71',RED,4)
        a+=body('#92743d')+face(hair='#77716b',mood='crazy',mouth='teeth')+p('M158 150L169 95L201 81L226 44L244 82L287 92L320 148Z',PAPER)+line('M169 137l44 -30l27 10l27 -22l41 39',CYAN,4)
        a+=r(343,324,76,125,INK,7)+r(352,337,57,94,PURPLE,3,sw=0)+c(380,374,17,ACID,sw=4)+hand(340,392)
    elif i==29:
        a+=p('M93 164L57 101L93 65L153 155 M339 164L397 65L427 119L379 188',PURPLE)+p('M153 115Q269 61 345 146L386 311L323 401L157 403L82 312Z',PURPLE)
        a+=e(176,217,52,56,PAPER)+e(293,204,54,62,PAPER)+e(189,229,12,23,INK,sw=0)+e(279,221,13,24,INK,sw=0)+p('M150 282Q235 245 331 282L303 341L188 351Z',INK)+p('M166 283l13 28l17 -33l19 34l19 -38l17 37l17 -37l16 33l18 -29',PAPER,w=2)
        a+=r(157,322,176,141,INK,14)+r(171,336,148,109,CYAN,4,sw=0)+p('M197 348L278 390L197 426Z',PINK,w=5)+hand(128,371,PURPLE,rot=-15)+hand(358,371,PURPLE,rot=15)
    elif i==30:
        a+=c(240,147,117,ACID,sw=9)+c(240,147,84,PINK,sw=5)+line('M240 20v26 M111 54l24 24 M366 54l-24 24 M97 155h-36 M389 155h34',PAPER,8)
        a+=body(PAPER)+face(hair='#663747',mouth='teeth',skin='#daae87')+p('M162 136Q116 213 146 312L181 322L165 205L191 145Z',INK)+p('M297 139Q351 198 334 312L301 321L320 219L276 145Z',INK)
        a+=p('M162 271Q170 351 241 368Q308 348 318 269L279 286L240 305L201 287Z',INK)+p('M135 344L314 444L334 403L174 309Z',PINK,w=5)
        a+=p('M57 331l49 -37l39 40l-19 54l-49 9Z',SKIN)+p('M366 311l46 32l9 48l-46 16l-29 -38Z',SKIN)+line('M83 339l16 -50 M389 331l-7 -40',SKIN,21)
    return a

manifest=[]
for i,name in enumerate(names,1):
    svg=f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480" width="480" height="480" role="img" aria-labelledby="title"><title id="title">{name} — original Cancel City character portrait</title><defs><pattern id="dots" width="11" height="11" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.8" fill="{INK}" opacity=".13"/></pattern><clipPath id="canvas"><rect width="480" height="480"/></clipPath></defs><g clip-path="url(#canvas)">{background(i)}{portrait(i)}</g></svg>'''
    ET.fromstring(svg)
    filename=f'cards/CC{i:03d}.svg'; (ROOT/filename).write_text(svg)
    manifest.append({'key':f'CC{i:03d}','path':f'/assets/{filename}','dimensions':{'width':480,'height':480},'author':'Cancel City / Codex original vector illustration','source':'Authored SVG paths; generate_assets.py','licence':'Original project asset; no third-party source material','status':'final','alt':f'Punk cartoon portrait of {name}','faction':factions[(i-1)//5]})

# Wide skyline. Left-side text-safe haze, uneven collage shapes on the right.
a=r(0,0,1800,900,INK,0,sw=0)
a+=p('M0 498 Q312 159 650 320 Q1023 186 1308 358 Q1658 224 1800 402V900H0Z','#242433',w=0)
a+=e(1415,290,179,166,PINK,sw=0,extra='opacity=".17"')+c(1499,240,81,ACID,sw=0)+p('M0 522L576 571L679 521L738 551L775 374L856 351L871 549L925 489L967 514L1003 311L1064 300L1091 517L1169 531L1188 376L1244 349L1280 513L1341 529L1376 429L1437 464L1462 555L1559 518L1603 356L1668 334L1703 526L1800 568V900H0Z','#353340',w=5)
# Every tower has an individual cutout silhouette.
buildings=[(681,459,123,392,'#24242a'),(804,339,137,542,'#17171f'),(974,232,175,649,'#202027'),(1154,485,130,395,'#31313a'),(1296,314,193,566,'#191921'),(1507,446,113,434,'#2c2c36'),(1643,234,157,646,'#21212b')]
for idx,(x,y,w,h,col) in enumerate(buildings):
    a+=p(f'M{x} {y+16}L{x+w-7} {y}L{x+w} {y+h}L{x-11} {y+h+8}Z',col,w=9)
    for row in range(7):
        for column in range(3):
            if (row+column+idx)%4!=0:
                a+=r(x+16+column*(w-26)/3,y+48+row*62,17,27,ACID if (row+idx)%3 else CYAN,0,sw=0,extra='opacity=".6"')
    a+=p(f'M{x+18} {y}L{x+22} {y-43}L{x+w-24} {y-47}L{x+w-17} {y-3}Z',PAPER,w=6)
    a+=line(f'M{x+35} {y-25}H{x+w-40}',PINK,7)
a+=line('M912 363L894 106L928 111L948 341',INK,18)+line('M880 201l67 1 M876 228l76 1',ACID,5)
a+=r(1270,403,251,137,PAPER,1,extra='transform="rotate(-5 1390 470)"')+p('M1288 480L1350 437L1399 465L1478 411','none',PINK,18)+r(1335,541,22,132,INK,0)+r(1451,531,22,146,INK,0)
a+=group(r(0,0,168,114,PINK,2)+c(87,52,31,INK,sw=5)+eyes(87,48,'angry')+line('M67 83h38',INK,6),'translate(1670 480) rotate(5)')
a+=line('M678 548Q923 609 1180 567Q1473 602 1798 494 M745 293Q1002 399 1267 302 M1165 694Q1541 739 1798 652','#514a5b',8)
a+=p('M0 807L451 831L744 748L823 760L874 671L942 694L994 758L1058 741L1090 784L1218 755L1254 714L1320 743L1379 805L1473 785L1531 726L1587 762L1654 793L1747 729L1800 772V900H0Z',INK,w=0)
a+=r(1618,714,165,83,PAPER,0,extra='transform="rotate(-6 1690 749)"')+line('M1636 745l30 -8 M1677 736l14 17 M1714 737l39 -6',INK,7)
a+=p('M0 0H780V900H0Z','url(#shade)',w=0)
svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1800 900" width="1800" height="900" role="img" aria-labelledby="title"><title id="title">Cancel City at night, a crooked corporate cartoon skyline</title><defs><linearGradient id="shade"><stop offset="0" stop-color="#101014"/><stop offset=".57" stop-color="#101014" stop-opacity=".75"/><stop offset="1" stop-color="#101014" stop-opacity="0"/></linearGradient></defs>{a}</svg>'
ET.fromstring(svg); (ROOT/'city/skyline.svg').write_text(svg)
manifest.append({'key':'city-skyline','path':'/assets/city/skyline.svg','dimensions':{'width':1800,'height':900},'author':'Cancel City / Codex original vector illustration','source':'Authored SVG paths; generate_assets.py','licence':'Original project asset; no third-party source material','status':'final','alt':'Crooked corporate towers, acidic windows, cable lines and satirical cartoon billboards at night'})
# Pack design deliberately contains no UI labels; HTML supplies its type.
a=p('M68 25L71 449L403 451L412 29L381 17L348 29L317 18L288 29L257 16L227 29L194 17L163 30L129 18L99 29Z',PINK,w=12)
a+=p('M87 53H389L381 422H88Z',INK,w=4)+p('M83 95L137 115L162 75L226 116L273 63L312 115L380 84L363 174L418 203L348 246L398 332L315 329L320 403L251 359L172 418L161 338L93 363L109 278L67 211L135 174Z',ACID,w=6)
a+=skull(240,224,1.1)+p('M171 95L151 51L199 80L235 37L273 78L315 51L306 109Z',CYAN)+line('M85 35h312 M79 437h319',PAPER,8)+p('M110 341L367 360L359 414L115 395Z',PAPER,w=5)+line('M141 365l74 7 M260 375l72 7',INK,8)
svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480" width="480" height="480" role="img" aria-labelledby="title"><title id="title">Original City Intake punk booster wrapper</title>{a}</svg>'
ET.fromstring(svg); (ROOT/'packs/city-intake.svg').write_text(svg)
manifest.append({'key':'city-intake','path':'/assets/packs/city-intake.svg','dimensions':{'width':480,'height':480},'author':'Cancel City / Codex original vector illustration','source':'Authored SVG paths; generate_assets.py','licence':'Original project asset; no third-party source material','status':'final','alt':'Magenta booster wrapper with acid burst, crowned skull and a blank paper label'})
(ROOT/'manifest.json').write_text(json.dumps({'version':1,'artDirection':'Original punk cutout cartoon, thick ink outlines, misregistered colours, halftone, paper bursts. No external images or copyrighted character designs.','assets':manifest},indent=2))
print(f'Created and XML-validated {len(manifest)} original SVG assets.')
