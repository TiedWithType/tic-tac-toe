# 🎮 Tic Tac Toe

**Tic Tac Toe** to rozbudowana wersja klasycznego kółka i krzyżyka, z trybami gry dla dwóch graczy, AI, statystykami sesji, personalizacją graczy, dźwiękami i mobilnym menu ustawień.

Aktualna wersja: **v.4.1.0 beta "Key Lime Pie"**
Autor: **TiedWithType**

## ✨ Co potrafi gra?

- 🎲 Klasyczna gra w kółko i krzyżyk na planszy 3x3.
- 👥 Tryb **player vs player**.
- 🤖 Tryb **user vs ai**.
- 🧠 Tryb **ai vs ai**.
- 🎚️ Trzy poziomy trudności AI: **easy**, **normal**, **hard**.
- 🟢🟡🔴 Kolorystyczne oznaczenie poziomów trudności.
- 🏁 Wybór gracza rozpoczynającego rundę: **O**, **X** albo **random**.
- 🎨 Zmiana kolorów markerów **O** i **X**.
- 🏆 Podświetlenie zwycięskich pól oraz animowana linia wygranej.
- 📊 Historia wyników aktualnej sesji.
- 📈 Statystyki rund, remisów, wygranych i win rate.
- 🔊 Dźwięki ruchu, remisu, wygranej oraz intro przy starcie gry.
- 🔇 Toggle mute.
- 💾 Zapisywanie ustawień w `localStorage`.
- 📱 Jednolite menu ustawień w modalu na mobile i desktopie.
- ✏️ Zmiana nazw graczy przez **PPM** albo **long press** na mobile.
- 🏷️ Domyślne nazwy graczy zależne od trybu gry.
- ⚡ Lekki ekran startowy z dynamicznym runtime gry i idle preloadem.
- 🔤 Lokalne fonty tekstu i ikon ograniczające FOUT/FOIT oraz zewnętrzne requesty.
- 🧩 Kod podzielony na moduły: reducer/store, controller, Web Components, game engine, AI i serwisy.

## 🕹️ Jak grać?

1. Otwórz aplikację.
2. Wybierz poziom trudności AI, jeśli planujesz grać z AI albo oglądać AI vs AI.
3. Wybierz, kto zaczyna rundę: **O**, **X** albo **random**.
4. Kliknij `Start game`.
5. W trybie gracza klikaj wolne pola na planszy.
6. Po zakończonej rundzie użyj `new round`, żeby wyczyścić planszę i zachować wynik.
7. Użyj `main menu`, żeby wyzerować wynik, historię i wrócić do ekranu startowego.

## 🎮 Tryby gry

### 👥 Player vs Player

Dwóch graczy gra lokalnie na jednej planszy. Gracz **O** i gracz **X** wykonują ruchy naprzemiennie.

### 🤖 User vs AI

Gracz gra jako **O**, a AI gra jako **X**. Po ruchu użytkownika komputer wykonuje swój ruch automatycznie.

### 🧠 AI vs AI

Obie strony są sterowane przez AI. Ten tryb jest dobry do testowania poziomów trudności albo po prostu oglądania, jak algorytm rozgrywa rundę.

## 🎚️ Poziomy trudności AI

### 🟢 Easy

AI gra głównie losowo, ale czasem wykona prosty ruch taktyczny. Dobre do luźnej gry.

### 🟡 Normal

AI potrafi blokować, wygrywać natychmiastowe pozycje i czasem szuka najlepszego ruchu. To najbardziej zbalansowany poziom.

### 🔴 Hard

AI używa minimax i wybiera najlepszy dostępny ruch. W praktyce jest bardzo trudne do pokonania.

## ⚙️ Ustawienia

W menu ustawień możesz zmienić:

- 🎨 kolor gracza **O**
- 🎨 kolor gracza **X**
- 🔄 rozpocząć nową rundę
- 🧭 wrócić do menu głównego i wybrać inny tryb gry
- 📜 otworzyć historię sesji
- 🔊 włączyć lub wyłączyć dźwięki
- 🧹 wykonać pełny reset gry

Na desktopie i mobile akcje gry są pod planszą, a ustawienia otwierają się w tym samym modalu.

## ✏️ Zmiana nazw graczy

Nazwy graczy możesz zmienić bez osobnego formularza:

- 🖱️ na desktopie: kliknij **PPM** na nazwie gracza
- 📱 na mobile: przytrzymaj nazwę gracza przez chwilę

Maksymalna długość nazwy to **8 znaków**, dzięki czemu scoreboard nie rozjeżdża layoutu.

## 📊 Historia i statystyki

Gra pokazuje historię aktualnej sesji:

- 🧾 numer rundy
- 🏆 zwycięzcę albo remis
- 🎮 tryb gry
- 🎚️ poziom AI
- 🏁 gracza rozpoczynającego rundę

Statystyki obejmują:

- 🔢 liczbę rund
- 🤝 liczbę remisów
- ⭕ wygrane O
- ❌ wygrane X
- 📈 win rate dla obu graczy

Historia działa dla aktualnej sesji i jest czyszczona przez `main menu`.

## 🔊 Dźwięki

Gra używa Web Audio API. Efekty są generowane w kodzie, bez zewnętrznych plików audio:

- 🎵 intro przed rozpoczęciem gry
- ⭕ osobny dźwięk ruchu dla O
- ❌ osobny dźwięk ruchu dla X
- 🤝 dźwięk remisu
- 🏆 fanfara zwycięstwa

## 💾 Zapisywanie ustawień

Ustawienia są zapisywane w `localStorage`, więc po odświeżeniu strony gra pamięta:

- nazwy graczy
- nazwy graczy osobno dla każdego trybu gry
- kolory markerów
- tryb gry
- poziom AI
- gracza rozpoczynającego
- mute

## 🧱 Architektura po refaktorze

Kod aplikacji jest podzielony na mniejsze moduły:

```txt
src/
  app.ts

  bootstrap/
    start.menu.ts

  core/
    game.controller.ts
    game.store.ts
    constants.ts
    types.ts

  game/
    ai.player.ts
    game.engine.ts

  services/
    audio.service.ts
    settings.service.ts

  ui/
    game.view.ts
    player.name.editor.ts

  components/
    app-root/
    game-shell/
    game-board/
    player-scoreboard/
    game-actions/
    options-menu/
    start-menu/
    history-panel/
    app-footer/

  styles/
    base.css

  public/
    fonts/
    icons/
```

### 🧠 `GameStore`

Reducer-backed store dla stanu aplikacji. Odpowiada za:

- planszę i aktualnego gracza
- wynik, historię i status meczu
- tryb gry, poziom AI, startującego i ustawienia graczy
- snapshot ustawień zapisywany w `localStorage`

### 🧭 `GameController`

Koordynator efektów ubocznych. Obsługuje start gry, reset rundy, AI, audio, zapis ustawień i reakcje na akcje widoku, ale nie mutuje bezpośrednio stanu gry.

### 🎲 `GameEngine`

Czysta logika planszy:

- sprawdzanie zwycięzcy
- sprawdzanie remisu
- dostępne ruchy
- przeciwny gracz
- wybór startującego gracza

### 🤖 `AiPlayer`

Logika AI:

- ruch losowy
- ruch taktyczny
- minimax dla poziomu hard

### 🖼️ `GameView`

Lekki adapter między kontrolerem a komponentami. Deleguje renderowanie i zdarzenia do Web Components:

- plansza
- wyniki
- historia
- status rundy
- modal ustawień

### 🧩 `components/*`

Komponenty Web Components z własnymi template'ami, stylami Shadow DOM i lokalną logiką renderowania:

- `app-root` - główny shell aplikacji
- `game-shell` - układ rundy, planszy i akcji
- `game-board` - plansza oraz linia wygranej
- `player-scoreboard` - nazwy i wyniki graczy
- `game-actions` - szybkie akcje pod planszą
- `options-menu` - modal ustawień
- `start-menu` - ekran startowy
- `history-panel` - historia i statystyki sesji
- `app-footer` - statyczna etykieta wersji

### 🔊 `AudioService`

Dźwięki generowane przez Web Audio API. Intro jest anulowane przed efektami rozgrywki, żeby start i pierwszy ruch nie nakładały się na siebie.

### 💾 `SettingsService`

Zapis i odczyt ustawień z `localStorage`.

### 🎨 Style i fonty

Globalny arkusz `src/styles/base.css` zawiera tokeny, reset, style strony oraz lokalne `@font-face`.
Style elementów interfejsu są trzymane przy komponentach jako pliki `.component.css`.

Fonty są serwowane lokalnie z `src/public/fonts`:

- `quicksand-latin.woff2`
- `quicksand-latin-ext.woff2`
- `material-symbols-rounded.woff2`

## 🏷️ Konfiguracja aplikacji

Konfiguracja jest trzymana blisko miejsca użycia:

- wersja publiczna: komponenty `app-footer` i `options-menu` oraz `.vercel/versions.json`
- domyślne nazwy graczy: `src/core/constants.ts`
- ustawienia użytkownika i migracje storage: `src/services/settings.service.ts`

## 🍩 Wersjonowanie

Projekt używa Semantic Versioning oraz nazw kodowych zgodnych z polityką w:

```txt
.vercel/versioning-policy.md
```

Rejestr wersji znajduje się w:

```txt
.vercel/versions.json
```

Nazwy kodowe idą alfabetycznie i są inspirowane deserami:

- 🍎 `1.1.0 beta "Apple Pie"`
- 🍫 `1.2.0 beta "Brownie"`
- 🍰 `1.3.0 beta "Cheesecake"`
- 🍩 `2.0.0 beta "Donut"`
- ⚡ `2.1.0 beta "Eclair"`
- ⚡ `2.1.1 beta "Eclair"`
- 🍫 `2.2.0 beta "Fudge"`
- 🍨 `2.3.0 beta "Gelato"`
- 🍯 `3.0.0 beta "Honeycomb"`
- 🍦 `3.1.0 beta "Ice Cream"`
- 🍥 `4.0.0 beta "Jelly Roll"`
- 🍥 `4.0.1 beta "Jelly Roll"`
- 🥧 `4.1.0 beta "Key Lime Pie"`

## 🚀 Uruchamianie lokalnie

Zainstaluj zależności:

```bash
bun install
```

Uruchom dev server:

```bash
bun run dev
```

Zbuduj wersję produkcyjną:

```bash
bun run vite:build
```

Podejrzyj build:

```bash
bun run vite:preview
```

## 📦 Skrypty

```json
{
  "dev": "vite ./src --host",
  "m:dev": "bunx vite ./src",
  "vite:build": "vite build ./src --emptyOutDir --outDir ../dist",
  "vite:preview": "vite preview"
}
```

## 🧪 Testowanie manualne

Przed releasem warto sprawdzić:

- ✅ ekran startowy pokazuje tytuł gry z glow
- ✅ intro gra przy starcie gry
- ✅ intro nie nakłada się na pierwszy ruch ani dźwięki rozgrywki
- ✅ `Start game` uruchamia player vs player
- ✅ wybór `user vs ai` uruchamia grę przeciw AI
- ✅ wybór `ai vs ai` uruchamia symulację AI
- ✅ difficulty wpływa na decyzje AI
- ✅ `new round` czyści planszę i zachowuje wynik
- ✅ `main menu` czyści planszę, wynik i historię
- ✅ `main menu` nie nadpisuje zapisanego trybu gry w `localStorage`
- ✅ kolory O/X zmieniają markery, start button i glow tytułu
- ✅ PPM zmienia nazwę gracza na desktopie
- ✅ long press zmienia nazwę gracza na mobile
- ✅ settings otwierają się w tym samym modalu na desktopie i mobile
- ✅ historia sesji aktualizuje statystyki
- ✅ mute wyłącza dźwięki
- ✅ `bun run vite:build` przechodzi bez błędów

## 🧑‍💻 Autor

Made by **TiedWithType**.
