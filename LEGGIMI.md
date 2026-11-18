# Crystal Studio per iPhone — versione 1

## Cosa fa
- PWA installabile da Safari dopo la pubblicazione HTTPS.
- Propone ogni giorno Story, post e idea Reel in base al giorno della settimana.
- Usa soltanto le immagini originali Crystal presenti nella cartella assets e le nuove foto aggiunte dal titolare.
- Produce immagini PNG 1080×1920 o 1080×1350, testi modificabili, hashtag pertinenti e scalette Reel.
- Scarica o condivide il file tramite le opzioni supportate dal browser iOS.
- Archivia bozze e promozioni nel browser, foto aggiuntive in IndexedDB; backup JSON manuale.
- Mostra prezzi soltanto se l'offerta è stata confermata e non è scaduta.

## Limiti espliciti
- Non è un generatore AI remoto: combina modelli editoriali e varianti predefinite, senza costi API.
- Non produce video Reel; prepara la copertina e una scaletta per riprese reali.
- Non pubblica automaticamente su Instagram/TikTok e non recupera dati di performance.
- Nessuna garanzia di hashtag virali o disponibilità della struttura.
- Non invia notifiche push quotidiane, non si sincronizza fra dispositivi.
- Il contenuto è conservato localmente: cancellare dati Safari può cancellare bozze e foto importate. Esportare backup regolarmente.
- Non caricare documenti degli ospiti o altri dati personali.

## Pubblicazione gratis con GitHub Pages
1. Crea un repository GitHub **pubblico** dedicato, ad esempio `crystal-studio`.
2. Carica **il contenuto della cartella** `crystal_studio_ios`, non lo ZIP come file unico.
3. Apri Settings > Pages, scegli Deploy from a branch, branch main e cartella / (root).
4. Attendi l'URL HTTPS fornito da GitHub Pages e aprilo in Safari su iPhone.
5. Condividi > Aggiungi alla schermata Home.

**Attenzione:** il codice e le foto incluse in un repository GitHub Pages pubblico saranno accessibili a chiunque. Se vuoi mantenere private le foto, non pubblicare questa versione su un repository pubblico: scegli un hosting privato o sostituisci gli asset pubblici. Non inserire credenziali, dati degli ospiti, numeri privati o token nel progetto.

## Test locale su computer
Nella cartella: `python3 -m http.server 8080` e apri `http://localhost:8080`. La PWA non si installa correttamente da un file aperto direttamente come file://.
