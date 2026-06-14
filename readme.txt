FLASHCARD APP - KORTE HANDLEIDING
=================================

Belangrijk:
Als het programma of het gebruik verandert, pas dan ook deze readme.txt aan.


1. WAAR STAAT DE APP?
--------------------

De app staat in:

C:\temp\Milskie

Belangrijke bestanden:

- start_flashcards.bat
  Start de app op een Windows-PC.

- index.html
  De app zelf. Dit kun je ook rechtstreeks openen in een browser.

- info.html
  Korte hulp over gebruik, import, export en nieuwe sets maken.
  In de app open je dit met de ronde i-knop bovenaan.

- credits.html
  Bronvermelding voor gebruikte foto's, geluiden, kaarten en data.

- data\flashcards.json
  Hierin staan de opgeslagen sets als je de Python-server gebruikt.

- images
  Afbeeldingen, bijvoorbeeld vogelbeelden.

- audio
  Geluiden, bijvoorbeeld vogelgeluiden.


2. GEBRUIKEN OP WINDOWS-PC
--------------------------

Dubbelklik op:

C:\temp\Milskie\start_flashcards.bat

De browser opent normaal automatisch op:

http://localhost:8000/


3. LEREN
--------

Kies links een set en ga naar Leren.

Bovenaan staan ook enkele algemene knoppen:

- i
  Opent de infopagina met korte uitleg over de app.

- Credits
  Opent de bronlijst van foto's, geluiden, kaarten en data.

Je kunt leren op 2 manieren:

- Omdraaien
  Je bekijkt de vraag, draait om, en kiest zelf:
  Ik wist het / Nog oefenen.

- Antwoord typen
  Je typt zelf het antwoord.
  De app controleert of het juist is.
  Bij een fout toont de app vraag, juiste antwoord, jouw antwoord,
  en een duidelijke markering van de fout.

Dit kies je bij:

Opties -> Manier van leren


4. TAAL-CODEX SETS
------------------

Alle Franse en Engelse woordenschat en werkwoorden zitten in 2 sets:

FR-NL Codex
EN-NL Codex

In elke set zitten:

- 720 woordkaarten
- 156 werkwoordkaarten

Dit zijn oefenkaarten van Codex, geen officiele woordenlijst van een schoolmethode.
Woorden van uitgeverijen of schoolmethodes mag je niet zomaar volledig kopieren zonder toestemming.

Bij Opties kun je kiezen:

- Taalrichting
  NL -> taal of taal -> NL

- Taal Codex soort
  woorden en werkwoorden, alleen woorden, of alleen werkwoorden

- Taal Codex leerjaar
  alle leerjaren, 1e Leerjaar tot 6e Leerjaar, of 1e ASO tot 6e ASO

Voor de extra Engelse woordenlijst uit EN_NL_Woordenlijst1.pdf zijn er aparte keuzes:

- 1e ASO Rob alle
- 1e ASO Rob Chores
- 1e ASO Rob Rooms in the house
- 1e ASO Rob Cleaning supplies
- 1e ASO Rob Talents
- 1e ASO Rob Skills
- 1e ASO Rob Jobs

De knop Spreek is verwijderd, omdat de browserstem niet altijd goed Frans uitspreekt.


5. WERELD LANDEN EN HOOFDSTEDEN
--------------------------------

De set "Wereld landen en hoofdsteden" gebruikt 1 wereldset.
Bij Opties kun je aanvinken welke werelddelen je wil oefenen:

- Europa
- Afrika
- Azie
- Noord-Amerika
- Zuid-Amerika
- Oceanie

Standaard staan alle werelddelen aan.
Laat je alleen Europa aangevinkt, dan oefen je alleen de Europese landen.
De voortgang en timer tellen dan alleen de gekozen kaarten.


6. RONDES EN RANDOM VOLGORDE
----------------------------

Een ronde is altijd de volledige gekozen set, of de gekozen filter binnen FR-NL Codex of EN-NL Codex.
Bij de wereldset is een ronde de gekozen werelddelen.

De kaarten worden willekeurig geschud.

Kaarten die fout gaan, komen pas terug nadat de hele ronde klaar is.
Die fouten worden daarna opnieuw in willekeurige volgorde geoefend.

Knop:

- Opnieuw starten
  Begint de ronde opnieuw, schudt de kaarten opnieuw,
  en zet voortgang, goed, oefenen, timer en punten terug op nul.

Als je het antwoord ziet, verschijnt op de kaart een kleine schuine pijl.
Daarmee kun je de vraag opnieuw bekijken.
Dat is handig bij foto- en geluidskaarten, zoals vogels herkennen.


7. SETS VERPLAATSEN
-------------------

In de setlijst links kun je sets verslepen om ze hoger of lager te zetten.
De volgorde wordt bewaard.

Tijdens zoeken staat verslepen uit.


8. TIMER
--------

Bij Opties kun je kiezen:

- Met timer
- Zonder timer

Met timer:

- Start timer
  Start de timer. Als je vergeet te starten, begint de timer automatisch
  bij je eerste antwoord.

- Reset timer
  Verschijnt nadat de timer gestart is.
  Zet alleen timer en Juist / geprobeerd terug naar nul.

- Stop timer
  Stopt de tijd zonder de ronde te resetten.

Juist / geprobeerd betekent bijvoorbeeld:

7 / 10 = 7 juiste antwoorden op 10 pogingen.


9. NIEUWE KAARTEN OF SETS MAKEN
-------------------------------

Ga naar Kaarten om losse kaarten toe te voegen.

Ga naar Sets om sets te maken, hernoemen, kopieren of verwijderen.

Ga naar Rekenen om automatisch rekensets te maken voor plus, min, maal en delen.


10. CSV IMPORTEREN
-----------------

Klik in de app op:

Import JSON/CSV

Een CSV-bestand mag er zo uitzien:

Frans les 3
vraag,antwoord,labels
la maison,het huis,Frans les 3
le chien,de hond,Frans les 3
manger,eten,Frans les 3


11. NIEUWE SET MAKEN VAN EEN SCREENSHOT/FOTO MET AI
---------------------------------------------------

1. Maak een foto of screenshot van de woordenlijst of leerstof.
2. Open ChatGPT of een andere AI die afbeeldingen kan lezen.
3. Upload de foto/screenshot.
4. Vraag bijvoorbeeld:

Maak hiervan een CSV voor mijn flashcard-app.
Gebruik deze kolommen:
vraag,antwoord,labels

Zet bovenaan als eerste regel:
Frans les 3

Gebruik Frans als vraag en Nederlands als antwoord.
Geef alleen de CSV, geen uitleg.

5. Controleer kort of alle woorden erin staan.
6. Download of bewaar als .csv.
7. Importeer dat CSV-bestand in de flashcard-app via Import JSON/CSV.


12. CHROMEBOOK ZONDER WINDOWS-PC
--------------------------------

Als je alleen een Chromebook gebruikt, kan dat zonder Python.

1. Kopieer de hele map Milskie naar de Chromebook.
   Neem ook data, images en audio mee.

2. Open index.html in Chrome.

3. De eerste keer zie je mogelijk alleen de 2 standaardsets.
   Dat is normaal, want index.html leest data\flashcards.json niet automatisch.

4. Klik op Import JSON/CSV.

5. Kies:

Milskie/data/flashcards.json

6. Kies OK als gevraagd wordt om bestaande sets te vervangen.

Daarna staan de sets in de browseropslag van die Chromebook.
Normaal hoef je dit maar 1 keer per Chromebook/browser te doen.

Als je op de Chromebook nieuwe sets maakt, klik daarna ook op Export.
Bewaar dat exportbestand als backup.

Als je later een nieuw exportbestand importeert, kan de app vragen of bestaande
sets vervangen mogen worden. Kies vervangen als het exportbestand de nieuwste
volledige versie is.


13. CHROMEBOOK MET WINDOWS-PC ALS SERVER
----------------------------------------

1. Start op de Windows-PC:

C:\temp\Milskie\start_flashcards.bat

2. Zorg dat PC en Chromebook op dezelfde wifi zitten.

3. Open op de Chromebook het netwerkadres van de PC, bijvoorbeeld:

http://192.168.1.34:8000/

Gebruik niet:

http://localhost:8000/

Want localhost betekent op de Chromebook: de Chromebook zelf.


14. IPAD OF TABLET
------------------

Beste manier:

Start de app op de Windows-PC met start_flashcards.bat
en open op de iPad/tablet het netwerkadres van de PC.

Rechtstreeks index.html openen op een iPad kan moeilijker zijn,
vooral met lokale mappen, afbeeldingen en geluiden.


15. BACKUP
----------

Gebruik regelmatig:

Export

Vooral als je zonder Python werkt, bijvoorbeeld rechtstreeks via index.html
op Chromebook of tablet.

Bij een websiteversie geldt hetzelfde: zelf gemaakte of geimporteerde sets
worden in die browser bewaard. Gebruik Export als backup of om ze naar iemand
anders door te sturen.

Bewaar het exportbestand goed.
Je kunt het later opnieuw importeren met Import JSON/CSV.
