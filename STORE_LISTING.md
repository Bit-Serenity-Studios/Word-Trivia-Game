# The Athenaeum — Store Listing Copy

Prepared for iOS App Store + Google Play Store. English only (M10
localization foundation is in place; translated listings can follow
once the game is translated).

## App name

**The Athenaeum**

## Subtitle / short description

*iOS uses "Subtitle" (30 chars max); Google Play uses "Short description" (80 chars).*

- **iOS subtitle (30):** `A candle-lit word game.`
- **Play short description (80):** `A candle-lit trivia game for Dark Academia readers.`

## Long description

*iOS: 4,000 chars max. Play: 4,000 chars max. The copy below is ~1,700 chars.*

> A candle-lit word game for the kind of reader who lingers in used bookshops.
>
> Each entry is a small prompt — a line about a Greek nymph, a Renaissance instrument, a mineral, a cartographer's word — and a tray of brass letters you drag into place. Solve it and the wax seal stamps *catalogued*.
>
> **Seven Volumes.** Two hundred and ten entries, arranged across seven curated collections. The Firmament for stars and stones. Old Empires for Roman senate and Egyptian obelisk. The Marginalia for parchment and palimpsest. Each volume opens with a letter from a fictional curator, and closes with a wax-seal ceremony when the last entry is inked.
>
> **A Reading List, not a scoreboard.** No leaderboards, no push-notification abuse. Every entry earns *ink* you can spend on hints, or hoard for a Nightly Entry — one puzzle every day, the same one for every reader.
>
> **A Cabinet of Curiosities.** Ten hand-drawn artifacts unlock as you catalogue. A pressed fern, a beeswax taper, a brass astrolabe, a mnemonic wheel. On your fifteenth entry, a spectral owl arrives and offers to forage the stacks for you.
>
> **Reader ranks, from Novice Reader to Master of the Athenaeum.** The register grades progress on entries catalogued, artifacts uncovered, and Nightly Entries kept in unbroken streak.
>
> **Built for readers.** Cormorant Garamond and EB Garamond throughout. A palette of ink, mahogany, parchment, sepia, burgundy, forest, and gold — nothing brighter than a struck match. Full VoiceOver / TalkBack support, high-contrast mode, larger-text mode, reduce-motion mode.
>
> **Content**
> - 210 hand-written entries across seven volumes
> - Seven fictional curators, each with an opening letter and a closing epigram
> - Ten cabinet artifacts, unlocked as you catalogue
> - A daily Nightly Entry, identical for every reader
> - Sealed Volumes — occasional harder puzzles paying triple ink
> - Patron of the Athenaeum — one-time $4.99 that removes every advertisement and gifts founding ink

## Keywords (iOS, 100 chars comma-separated)

`trivia,word game,puzzle,quiz,dark academia,vocabulary,scholarly,reading,literature,books`

## Category

- **Primary:** Games → Word / Word Games
- **Secondary:** Games → Trivia

## Content rating

- **iOS:** 4+ (no objectionable content)
- **Google Play:** Everyone (E)
- **Ad disclosure:** Contains advertisements (AdMob banner + interstitial); ad-free purchase available
- **IAP disclosure:** Yes — one non-consumable ($4.99 Patron), plus consumables (ink packs, hint bundles)

## Age rating rationale

The game contains no violence, no gore, no drug references, no sexual content, no crude humor. Vocabulary includes historical / mythological entries (e.g. GLADIATOR, LEGION, HELLEBORE, MANTICORE). Nothing that would push it above 4+.

## Screenshot compositions

*Take these at 6.7-inch iPhone (1290 × 2796) then downscale. Same set works for iPad and Android in landscape and portrait.*

1. **Play surface, mid-round.** Parchment prompt card visible, four brass tiles in the tray, one placed in the answer slot. Ledger showing modest ink (12) and streak (2). Caption: *"Every entry, one brass letter at a time."*
2. **The Reading List (Volume Shelf).** All seven volume cards visible with progress bars and per-tier ribbons. Bookplate at the top showing "Bibliographer." Caption: *"Seven curated collections. Two hundred and ten entries."*
3. **A wax-seal solve.** The wax-seal stamp landing on the parchment mid-animation. Caption: *"Solved. Catalogued."*
4. **Curator's Letter.** A curator letter overlay open — Beatrix Wren's letter for The Firmament. Caption: *"A letter from the keeper of each volume."*
5. **The Cabinet.** Cabinet screen showing several unlocked artifacts (pressed fern, taper, astrolabe, spectral owl) and the familiar panel. Caption: *"A cabinet of curiosities."*

## Support URL / marketing URL

*Placeholder — replace before submission.*

- Support: `https://bitserenity.studio/athenaeum/support`
- Marketing: `https://bitserenity.studio/athenaeum`
- Privacy policy: `https://bitserenity.studio/athenaeum/privacy`

## Reviewer notes (iOS App Review)

- The game is entirely single-player and offline; no accounts or servers.
- Advertisements are served via Google AdMob using standard rewarded, banner, and interstitial units.
- IAP is handled via `react-native-purchases` (RevenueCat) with StoreKit / Play Billing on the respective platforms.
- No user-generated content, no chat, no leaderboards, no camera / microphone / location access.
- Notification permission is asked contextually the first time the player sends the spectral owl foraging, not on launch.
