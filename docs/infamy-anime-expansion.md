# Internet Infamy + Anime Brainrot

Sixteen new playable residents, CC051–CC066, in two sets: Internet Infamy (10) and Anime Brainrot (6). The complete catalogue now has 66 cards.

## Runtime integration

Every new resident has matching punk-comic portrait art, responsive thumbnails, six transparent full-body poses, a combat kit, a five-beat authored special, a scripted resident profile and an original meme poster. They participate in regular pack rolls, Scrap Exchange crafting/recycling, foil fusion, saved squads, battles, mastery rewards and city assignments. New-set completions grant three packs each, once, through either opening or crafting. Reveal presentation never rerolls or grants copies.

Rarity odds remain 60/25/10/4/1 percent. Existing resident identities, kits, faction completions, campaign rewards and saved inventories remain intact. The save schema stays version 2 and battle rules stay version 3. Daily roster version 4 uses the 66-card pool and a deterministic date hash; roster versions 1/2/3 retain their original 30/42/50-card pools and date selection for paused battles.

## Authored scenes

1. Oscar Goblin: golden trophy barrier, incoming receipts, trophy refusing to comment.
2. Sentence Is Just a Number: blocked microphone, curtains closing, no encore.
3. Island Guide: luxury itinerary filling with redaction bars.
4. 420 Overlord: smoke throne and calendar invite; support heals/guards the actual squad.
5. Rain of Subscribers: renewal-coin weather and an umbrella subscription.
6. Jeffrey Gobstein: VIP bubble, invading receipts, immunity declined.
7. Baby Oil Supplier: bulk delivery, bottle wave, slipping on the supply chain.
8. Vaccine Update: progress stalled at 99%, support patch, recursive restart reminders.
9. Oprahoma: panhandle arm, flying giftboxes, debuffs for the postcode.
10. Matrixed: five recursive exit plans ending in another checkout.
11. Power of Friendship: seventeen accumulating flashback windows and a skip prompt.
12. Anti-Anti-Meat Activist: buffet, rubber arm and giant meat club.
13. Infinite Rizz: loading spinner trapping the attack and an infinity beam.
14. Big Bald Energy: urgent cabbage coupon, abrupt punch, zero speeches.
15. Absent Father: missed-call windows, teleport disappearance, instant childcare invoice.
16. The Eternal 2nd: final beam, dropping silver trophy, outraged runner-up.

All solo scenes use actual committed battle outcomes at the existing contact fraction. Previews are explicitly labelled and grant no rewards. Full/quick/reduced playback, hidden-tab pause, sound controls and skip use the existing cinematic lifecycle. Ordinary combat, pulls and street residents consume the same acting cast. The total acting cast is now 32 residents / 192 poses.

## Art and portrayal

Built-in image generation used the existing CC039 and CC044 portraits as style references. Generated masters, selected sheets, prompts and measured alpha bounds/ground anchors are in `docs/art/wave-four/`. Every runtime sprite was inspected for complete isolated silhouettes. Oprahoma is an original Oklahoma-shaped adult talk-show mascot: the image tool rejected the Oprah likeness request, and the replacement preserves the state-body/panhandle/gifts concept without claiming an exact likeness. Other characters are fictional caricatures; their quotes, invoices, itineraries and events are authored satire, not factual statements or real quotes. No sexual or victim imagery is used.

Selected portraits were encoded as 896px WebP delivery derivatives; original art masters remain unchanged. This preserves dense ink/halftone artwork while reducing portrait transfer size from 30.39 MB to 17.83 MB and keeps deployment packaging reliable.

## Verification

- TypeScript passed; 220 tests passed across 17 suites.
- New tests cover all 16 kits, faithful support/attack targets, one-time completion grants, command replay, committed pack/reveal recovery, old 50-card daily saves, new daily roster coverage, asset references and contact timing.
- Native Canvas review rendered 241 frames using the actual runtime painter, including every new special and reduced-motion ending. Scene inputs remained immutable. Corrected the falling supplier and wide panhandle staging after visual review.
- Browser DOM layout, animation playback and audio playback remain unverified because no supported browser-control skill is available. Native frame review does not verify browser playback.
