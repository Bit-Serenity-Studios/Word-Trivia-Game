# Third-party assets

All bundled art and audio in this directory come from
[Kenney](https://www.kenney.nl), released under the
[Creative Commons Zero (CC0)](https://creativecommons.org/publicdomain/zero/1.0/)
license — no attribution required, but Kenney's work supports itself on donations
so a credit is the polite thing to do.

## What we pulled and where it came from

| Path in this repo | Source pack | Original file name |
| --- | --- | --- |
| `assets/audio/music/sad-town.ogg` | Kenney — Music Loops (v1.1) | `Sad Town.ogg` |
| `assets/audio/music/sad-descent.ogg` | Kenney — Music Loops (v1.1) | `Sad Descent.ogg` |
| `assets/audio/sfx/tile-place.ogg` | Kenney — Interface Sounds | `drop_001.ogg` |
| `assets/audio/sfx/tile-wrong.ogg` | Kenney — Interface Sounds | `error_001.ogg` |
| `assets/audio/sfx/volume-complete.ogg` | Kenney — Interface Sounds | `confirmation_002.ogg` |
| `assets/audio/sfx/wax-seal.ogg` | Kenney — RPG Audio | `bookPlace1.ogg` |
| `assets/audio/sfx/page-turn.ogg` | Kenney — RPG Audio | `bookFlip1.ogg` |
| `assets/audio/sfx/volume-open.ogg` | Kenney — RPG Audio | `bookOpen.ogg` |
| `assets/icons/kenney/arrow-right.svg` | Kenney — Board Game Icons | `arrow_right.svg` |
| `assets/icons/kenney/book-open.svg` | Kenney — Board Game Icons | `book_open.svg` |
| `assets/icons/kenney/book-closed.svg` | Kenney — Board Game Icons | `book_closed.svg` |
| `assets/icons/kenney/hourglass.svg` | Kenney — Board Game Icons | `hourglass.svg` |
| `assets/icons/kenney/crown.svg` | Kenney — Board Game Icons | `crown_a.svg` |
| `assets/icons/kenney/card-place.svg` | Kenney — Board Game Icons | `card_place.svg` |
| `assets/icons/kenney/gear.png` | Kenney — Game Icons | `gear.png` (White, 2x) |
| `assets/icons/kenney/shopping-basket.png` | Kenney — Game Icons | `shoppingBasket.png` (White, 2x) |

## Sourcing

The upstream repository is
[`Bit-Serenity-Studios/KennyNLAssets`](https://github.com/bit-serenity-studios/kennynlassets).
Everything above is a straight copy — nothing modified — so refreshing from the
source is a straight overwrite. Consult that repo (or
[kenney.nl](https://www.kenney.nl)) for the current versions of any pack.

## A note on the music

Kenney's music library is deliberately playful (chiptune, polka, ethnic-comedy).
The two tracks we picked — *Sad Town* and *Sad Descent* — are the least
tonally jarring against the game's Dark Academia aesthetic, but they are still
chiptune melancholy, not candlelit-hall ambient. They are a placeholder. The
music player in `services/audio.ts` treats tracks as a swappable list; when a
proper composition arrives, drop the new `.ogg` into `assets/audio/music/` and
update the array in `services/audio.ts`.

## License headers

Each source pack's `License.txt` is preserved at the source repository. All
files under `assets/` in this repo inherit the Kenney CC0 grant.
