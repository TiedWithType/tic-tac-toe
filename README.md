# 🎮 Tic Tac Toe

**Tic Tac Toe** to rozbudowana wersja klasycznego kółka i krzyżyka, z trybami gry dla dwóch graczy, AI, statystykami sesji, personalizacją graczy, dźwiękami i mobilnym menu ustawień.

Aktualna wersja: **v.4.0.0 beta "Jelly Roll"**
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
- 🔊 Dźwięki ruchu, remisu, wygranej oraz intro przed startem gry.
- 🔇 Toggle mute.
- 💾 Zapisywanie ustawień w `localStorage`.
- 📱 Jednolite menu ustawień w modalu na mobile i desktopie.
- ✏️ Zmiana nazw graczy przez **PPM** albo **long press** na mobile.
- 🏷️ Domyślne nazwy graczy zależne od trybu gry.
- ⚡ Dynamiczne ładowanie runtime gry dopiero po wyborze trybu.
- 🧩 Kod podzielony na moduły: controller, view, game engine, AI i serwisy.

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

  styles/
    base.css
    game-layout.css
    board.css
    controls.css
    start-overlay.css
    shell.css
    mobile.css
```

### 🧠 `GameController`

Główny koordynator aplikacji. Zarządza stanem gry, startem, resetem, rundami, AI, zapisem ustawień i renderowaniem widoku.

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

Warstwa DOM i renderowania UI:

- plansza
- wyniki
- historia
- status rundy
- modal ustawień

### 🔊 `AudioService`

Dźwięki generowane przez Web Audio API.

### 💾 `SettingsService`

Zapis i odczyt ustawień z `localStorage`.

### 🎨 `styles/*`

Style są podzielone na moduły CSS importowane przez `src/style.css`:

- `base.css` - tokeny, reset i globalne style strony
- `game-layout.css` - layout gry, status rundy i scoreboard
- `board.css` - plansza, O/X rysowane w CSS, zwycięska linia i animacje
- `controls.css` - przyciski, quick actions, menu opcji, kolory graczy i modal ustawień
- `start-overlay.css` - ekran startowy, difficulty, starter i przyciski startu
- `shell.css` - footer oraz panel historii
- `mobile.css` - mobilne dopasowania historii

## 🏷️ Konfiguracja aplikacji

Konfiguracja jest trzymana blisko miejsca użycia:

- wersja publiczna: `src/index.html` oraz `.vercel/versions.json`
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
- ✅ intro gra przed startem
- ✅ `Start game` uruchamia player vs player
- ✅ wybór `user vs ai` uruchamia grę przeciw AI
- ✅ wybór `ai vs ai` uruchamia symulację AI
- ✅ difficulty wpływa na decyzje AI
- ✅ `new round` czyści planszę i zachowuje wynik
- ✅ `main menu` czyści planszę, wynik i historię
- ✅ kolory O/X zmieniają markery, start button i glow tytułu
- ✅ PPM zmienia nazwę gracza na desktopie
- ✅ long press zmienia nazwę gracza na mobile
- ✅ settings otwierają się w tym samym modalu na desktopie i mobile
- ✅ historia sesji aktualizuje statystyki
- ✅ mute wyłącza dźwięki
- ✅ `bun run vite:build` przechodzi bez błędów

## 🧑‍💻 Autor

Made by **TiedWithType**.
