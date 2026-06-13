# Flashcards

Een kleine flashcard-app voor de browser.

Python is optioneel:

- Zonder Python kun je `index.html` openen. Dan bewaart elke browser zijn eigen kaarten.
- Met Python kun je `server.py` starten. Dan bewaart de app de kaarten ook in `data/flashcards.json`, en andere toestellen op hetzelfde netwerk kunnen dezelfde app openen.

Alleen de PC die `server.py` start heeft Python nodig. Een Chromebook of tablet opent gewoon de browserlink.

## Starten

Op Windows kun je dubbelklikken op:

```text
start_flashcards.bat
```

De browser opent dan automatisch op `http://localhost:8000/`.

Andere toestellen op hetzelfde netwerk kunnen de netwerklink openen die Python toont.

## Hulp En Credits

Bovenaan in de app staat een ronde `i`-knop. Die opent `info.html` met korte uitleg over oefenen, importeren, exporteren en nieuwe sets maken met AI.

De knop `Credits` opent `credits.html`. Daar staan de bronnen en licenties van foto's, geluiden, kaarten en databronnen.

## Wat Kan Al

- Sets maken, wijzigen, kopieren en verwijderen
- Sets verslepen om de volgorde te wijzigen
- Flashcards toevoegen met tekst, afbeelding of geluid
- Nieuwe sets importeren uit CSV
- Leren met omdraaien of met `Antwoord typen`
- Taalkaarten omdraaien: `NL -> taal` of `taal -> NL`
- `FR-NL Codex` en `EN-NL Codex` filteren op woorden/werkwoorden en leerjaar
- Automatisch rekensets maken voor +, -, x en /
- Timer met optie `Met timer` of `Zonder timer`
- Import en export naar JSON
- Ronde `i`-knop bovenaan met korte hulp over gebruik, import, export en nieuwe sets
- `Credits`-pagina met bronnen/licenties voor foto's, geluiden, kaarten en data

## Rondes

Een ronde is altijd de volledige gekozen set of de gekozen filter binnen een taal-Codex set.

Kaarten starten in willekeurige volgorde. Kaarten die fout gaan, komen pas terug nadat de hele ronde klaar is. Die fouten worden daarna opnieuw in willekeurige volgorde geoefend.

Met `Opnieuw starten` begint de ronde opnieuw, worden de kaarten opnieuw geschud, en gaan de tellers en timer terug naar nul.

Als je het antwoord ziet, kun je met de kleine schuine pijl op de kaart de vraag opnieuw bekijken. Dat is handig bij foto- en geluidskaarten, zoals vogels herkennen.

## Antwoord Typen

Ga naar `Opties` en kies `Antwoord typen`.

Na `Controleer` toont de app de vraag, het juiste antwoord en jouw antwoord. Groen betekent juist; rood met gele markering toont waar het fout loopt.

## Taalkaarten

Voor `FR-NL Codex` en `EN-NL Codex` is Nederlands standaard de vraag en Frans/Engels het antwoord.

Bij `Opties` kun je `Taalrichting` wijzigen:

- `NL -> taal`
- `Taal -> NL`

Bij `Opties` kun je voor taal-Codex sets ook kiezen:

- woorden en werkwoorden
- alleen woorden
- alleen werkwoorden
- leerjaar, van `1e Leerjaar` tot `6e ASO`

`FR-NL Codex` bevat 720 woordkaarten en 156 werkwoordkaarten.
`EN-NL Codex` bevat 720 woordkaarten en 156 werkwoordkaarten.
Dit zijn oefensets, geen officiele schoolmethode-lijsten.

De knop `Spreek` is verwijderd, omdat de browserstem niet altijd goed Frans uitspreekt.

## Sets Volgorde

In de setlijst links kun je sets verslepen om ze hoger of lager te zetten. De volgorde wordt bewaard. Tijdens zoeken staat verslepen uit.

## Rekenen

Ga naar `Rekenen`.

- Voor `+` en `-` kies je tot welk getal je wil oefenen.
- Voor `x` en `/` vul je tafels in met komma's, bijvoorbeeld `11,13,14`.
- Klik op `Rekenset maken`; daarna kun je die set meteen leren.

## Timer En Punten

Klik op `Start timer` voordat je begint met leren. Als je dat vergeet, start de timer automatisch bij je eerste antwoord.

- `Juist / geprobeerd` telt hoeveel antwoorden juist waren tegenover hoeveel antwoorden je geprobeerd hebt.
- Na starten verandert `Start timer` in `Reset timer`.
- `Stop timer` pauzeert de tijd zonder de ronde te resetten.
- Bij `Opties` kun je kiezen voor `Zonder timer`.

## CSV Importeren

Klik in de app op `Import JSON/CSV` en kies een `.csv` bestand.

Een CSV mag er zo uitzien:

```csv
Frans les 3
vraag,antwoord,labels
la maison,het huis,Frans les 3
le chien,de hond,Frans les 3
manger,eten,Frans les 3
```

`labels` zijn optionele trefwoorden of categorieen. Je mag die kolom gewoon weglaten.

CSV kan ook naar afbeeldingen of geluiden verwijzen:

```csv
vraag,antwoord,vraagafbeelding,vraaggeluid
Welk dier zie je?,Huismus,./images/vogels/01-huismus.jpg,
Welk geluid hoor je?,Huismus,,./audio/vogels/01-huismus.mp3
```
