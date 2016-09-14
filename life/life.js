var m; // broj redova tabele (uzima se iz inicijalne vrednosti odgovarajućeg input polja)
var n; // broj kolona tabele (uzima se iz inicijalne vrednosti odgovarajućeg input polja)
var p; // broj ćelija tabele (p=m*n, broj ćelija tabele je proizvod broja redova i broja kolona)
var cellDim = 9; // inicijalna dimenzija ćelije (širina = visina, budući da je ćelija kvadratnog oblika), dobija se ili iz polja za unos dimenzije ćelije, ili izračunavanjem na osnovu unete širine i broja kolona tabele
var counter; // brojač koraka simulacije
var ledFlag; // indikator stanja LED-diode za vreme njenog blinkanja u režimu „PAUSE“ (0 – off; 1 – on)
var ledLoop = 0; // varijabla timing-eventa treperenja LED-diode u režimima „PAUSE“ i „REVERSE“
var runLoop = 0; // varijabla timing-eventa izvršavanja radne petlje
var playButton = imgFolder + "play.png"; // lokacija simbola za "PLAY"
var pauseButton = imgFolder + "pause.png"; // lokacija simbola za "PAUSE"
var playPauseButton = imgFolder + "play-pause.png"; // lokacija simbola za "PLAY" i "PAUSE"
var stepButton = imgFolder + "step.png"; // lokacija simbola za "FRAME ADVANCE"
var stepButtonDisabled = imgFolder + "step-disabled.png"; // lokacija deaktiviranog simbola za "FRAME ADVANCE"
var stepRevButton = imgFolder + "step-rev.png"; // lokacija simbola za "PREVIOUS FRAME"
var stepRevButtonDisabled = imgFolder + "step-rev-disabled.png"; // lokacija deaktiviranog simbola za "PREVIOUS FRAME"
var reverseButton = imgFolder + "reverse.png"; // lokacija simbola za "REVERSE"
var reverseButtonDisabled = imgFolder + "reverse-disabled.png"; // lokacija deaktiviranog simbola za "REVERSE"
var mode = 0; // flag radnog režima (0 – STOP; 1 – PLAY; 2 – PAUSE; 3 – REVERSE)
var cellsArray = []; // niz u kojem se čuvaju statusi ćelija
var edge = 0; // flag za edge-mod (0 – ivice se ponašaju kao fizičke prepreke; 1 – prolaskom kroz svaku ivicu element se pojavljuje na suprotnoj ivici tabele)
var tablemousedown = false; // ako je levi taster miša stisnut dok je kursor unutar tabele, postavlja se na TRUE; ako je levi taster miša otpušten bilo unutar, bilo van tabele, postavlja se na FALSE; koristi se radi crtanja po tabeli pomoću dragginga
var tablemouserightdown = false; // ako je desni taster miša stisnut dok je kursor unutar tabele, postavlja se na TRUE; ako je desni taster miša otpušten bilo unutar, bilo van tabele, postavlja se na FALSE; koristi se radi crtanja po tabeli pomoću right-dragginga
var densityValue = 5; // varijabla koja sadrži vrednost regulatora gustine random rasporeda
var speedValue = 5; // varijabla koja sadrži vrednost regulatora brzine simulacije
var dimChosen = false; // flag koji pokazuje da li je korisnik najmanje jednom izabrao dimenzije tabele; koristi se da bi, u slučaju da korisnik nije prethodno naveo dimenzije tabele, prilikom resizovanja browsera iste bile prilagođene novoj veličini browserskog prozora

// inicijalizacija
function init() {
	document.getElementById("density").value = densityValue; // postavljanje regulatora gustine random rasporeda na inicijalnu vrednost (sadržanu u varijabli „densityValue“)
	document.getElementById("speed").value = speedValue; // postavljanje regulatora brzine simulacije na inicijalnu vrednost (sadržanu u varijabli „speedValue“)
	newDimOnWinResize(); // automatska promena dimenzija tabele, prilagođena novim dimenzijama browserskog prozora (promena broja redova i broja kolona)
}

// crtanje nove tabele (prazne ili s nekim drugim predefinisanim sadržajem, u zavisnosti od argumenta „content“)
function drawTable(content) {
	var i, j; // i – brojač redova tabele; j – brojač kolona tabele (redovi su numerisani od 1 do m, a kolone od 1 do n)
	var cellHTML = ""; // tekstualna promenljiva u koju smeštamo HTML-kôd trenutnog reda tabele
	counter = 0; // resetovanje brojača koraka, budući da je s prethodnom simulacijom završeno
	document.getElementById("counter").style.display = "none"; // uklanjanje prikaza broja koraka (iz istog razloga kao malopre)
	reverseDeact(); // deaktivacija dugmeta za vraćanje simulacije unazad
	stepRevDeact(); // deaktivacija dugmeta za prethodni korak simulacije
	cellsArray[0] = []; // globalni niz u kojem se čuva sadržaj tabele u nultom (inicijalnom) koraku
	if (mode == 0 || mode == 2) { // ako je režim bio „STOP“ ili „PAUSE“...
		document.getElementById("start").getElementsByTagName("img")[0].src = playButton; // na aktivacionom dugmetu prikazuje se oznaka „PLAY“
		document.getElementById("start-tip").style.display = 'inline'; // help tip se...
		document.getElementById("pause-tip").style.display = 'none'; // ...postavlja na...
		document.getElementById("cont-tip").style.display = 'none'; // ...„pokretanje simulacije“
		if (mode == 2) { // ako je režim bio „PAUSE“...
			mode = 0; // ...prelazak u režim „STOP“
			clearInterval(ledLoop); // zaustavljanje petlje za sporo treperenje LED-diode
			ledLoop = 0;
			document.getElementById("led").className = "led-off"; // LED se isključuje
		}
	}
	var cellID = 0; // redni broj trenutne ćelije
	if (content == 0) { // u slučaju da je izabran random raspored...
		thresholdRandom = 0.08 * document.getElementById("density").value; // ...generiše se prag odlučivanja da li će ćelija biti mrtva ili živa – što je izabrana gustina živih ćelija veća, i prag za žive ćelije će biti veći
	}
	for (i = 1; i <= m; i++) { // petlja po redovima tabele
		cellHTML += "<tr>"; // pri započinjanju svakog reda tabele na string „cellHTML“ dodajemo otvarajući HTML-tag za red tabele
		for (j = 1; j <= n; j++) { // petlja po kolonama tabele
			cellID++; // redni broj trenutne ćelije se uvećava prilikom svakog prolaska kroz unutrašnju petlju
			cellHTML += "<td id='" + cellID + "' onmousedown='tableMouseDown(event," + cellID + ")' onmouseenter='tableMouseEnter(" + cellID + ")' ondragstart='return false' oncontextmenu='return false'"; // započinjemo HTML-kôd za ćeliju tabele; onmousedown u slučaju pritiska na levi taster miša postavljaće flag „tablemousedown“ na TRUE i postavljaće status ćelije na „živo“, dok će u slučaju pritiska na desni taster miša postavljati flag „tablemouserightdown“ na TRUE i postavljati status ćelije na „mrtvo“; onmouseenter, u slučaju da je flag „tablemousedown“ ili flag „tablemouserightdown“ postavljen na TRUE i da se kursorom miša prešlo iz jedne ćelije u drugu, postavljaće odgovarajući status te ćelije u koju se prešlo, u zavisnosti od toga koji je flag TRUE (tj. koje je dugme miša pritisnuto); ondragstart='return false' sprečavaće pravi mouse-dragging, jer bi on zbrljao stvari; oncontextmenu='return false' sprečavaće pojavu context-menija prilikom desnog klika dok je kursor unutar tabele
			var life = false; // privremena varijabla u kojoj čuvamo status koji treba da ima trenutna ćelija (ćelija živa – TRUE; ćelija mrtva – FALSE)
			switch (content) {
				case 0: // žive i mrtve ćelije treba da budu random raspoređene
					if (Math.random() < thresholdRandom) { // ukoliko je random generisan broj (između 0 i 1) manji od praga za žive ćelije, ćelija će biti živa; u suprotnom, ostaće mrtva
						life = true;
					}
					break;
				// case 1 (sve bele ćelije) možemo preskočiti, jer varijabla life tada za svaku ćeliju zadržava već postojeću vrednost FALSE
				case 2: // sve ćelije tabele treba da budu crne (žive)
					life = true;
					break;
				case 3:
					if (i % 2 == 1) { // raspored po horizontalnim prugama (u neparnim redovima žive ćelije, u parnim redovima mrtve ćelije)
						life = true;
					}
					break;
				case 4:
					if (j % 2 == 1) { // raspored po vertikalnim prugama (u neparnim kolonama žive ćelije, u parnim kolonama mrtve ćelije)
						life = true;
					}
					break;
				case 5:
					if ((i + j) % 3 == 0) { // dijagonalni raspored živih i mrtvih ćelija
						life = true;
					}
					break;
				case 6:
					if ((i + j) % 2 == 0) { // šahovski raspored živih i mrtvih ćelija
						life = true;
					}
					break;
			}
			if (life) { // ako trenutna ćelija treba da bude živa...
				cellHTML += " class='alive'"; // ...unošenje stila za prikaz žive ćelije tabele
				cellsArray[0][cellID] = 1; // ...i unošenje jedinice u odgovarajući član globalnog niza „cellsArray[]“ ([0] označava nulti korak simulacije)
			} else { // a ako trenutna ćelija treba da bude mrtva...
				cellHTML += " class='dead'"; // ...unošenje stila za prikaz mrtve ćelije tabele
				cellsArray[0][cellID] = 0; // ...i unošenje nule u odgovarajući član globalnog niza „cellsArray[]“ ([0] označava nulti korak simulacije)
			}
			cellHTML += " style='width:"+cellDim+"px;height:"+cellDim+"px'></td>"; // na kraju svake ćelije tabele (tj. nakon prolaza kroz svaku unutrašnju petlju) dodajemo stil za širinu i visinu ćelije, a zatim i zatvarajući HTML-tag za ćeliju tabele
		}
		cellHTML += "</tr>"; // na kraju svakog reda tabele (tj. nakon prolaza kroz svaku spoljašnju petlju) dodajemo zatvarajući HTML-tag za red tabele
	}
	
	document.getElementById("table").style.width = (n * cellDim + n + 3) + "px"; // širina tabele dobija se tako što širina ćelije zajedno s jednim zidom ćelije ima cellDim+1 piksela, pa se to pomnoži brojem kolona n i doda 3, budući da leva i desna ivica tabele imaju po 2 piksela
	document.getElementById("table").innerHTML = cellHTML; // unošenje HTML-koda za celu tabelu
}

// ako je levi taster miša pritisnut unutar tabele, dok je kursor na ćeliji pod rednim brojem x, status te ćelije se postavlja na „živo“ i flag „tablemousedown“ se postavlja na TRUE; ako je desni taster miša pritisnut unutar tabele, dok je kursor na ćeliji pod rednim brojem x, status te ćelije se postavlja na „mrtvo“ i flag „tablemouserightdown“ se postavlja na TRUE
function tableMouseDown(event, x) {
	if ((event.button == 0 || event.button == 1) && !tablemouserightdown) { // ako je pritisnut levi taster miša, a pri tome nije već odranije pritisnut desni taster miša (savremeni browseri za pritisnut levi taster miša daju rezultat 0, dok IE8 i ranije verzije daju rezultat 1)
		tablemousedown = true; // flag pritisnutog levog tastera miša se postavlja na TRUE
		document.getElementById(x).className = 'alive'; // odgovarajuća ćelija tabele postavlja se na „živo“
		cellsArray[counter][x] = 1; // u odgovarajući član globalnog niza „cellsArray[]“ unosi se vrednost 1, koja odgovara statusu „živo“
	} else if (event.button == 2 && !tablemousedown) { // ako je pritisnut desni taster miša, a pri tome nije već odranije pritisnut levi taster miša
		tablemouserightdown = true; // flag pritisnutog desnog tastera miša se postavlja na TRUE
		document.getElementById(x).className = 'dead'; // odgovarajuća ćelija tabele postavlja se na „mrtvo“
		cellsArray[counter][x] = 0; // u odgovarajući član globalnog niza „cellsArray[]“ unosi se vrednost 0, koja odgovara statusu „mrtvo“
		document.getElementById("table").className = 'rightclick'; // postavlja se klasa koja će omogućiti da kursor pređe u gumicu za brisanje
	}
}

// ako je levi taster miša otpušten, flag „tablemousedown“ treba vratiti na FALSE; ako je desni taster miša otpušten, flag „tablemouserightdown“ treba vratiti na FALSE
function tableMouseUp(event) {
	if (event.button == 0 || event.button == 1) { // ukoliko je otpušten levi taster miša (savremeni browseri za pritisnut levi taster miša daju rezultat 0, dok IE8 i ranije verzije daju rezultat 1)...
		tablemousedown = false; // ...flag pritisnutog levog tastera miša se vraća na FALSE
	}
	if (event.button == 2) { // ukoliko je otpušten desni taster miša...
		tablemouserightdown = false; // ...flag pritisnutog desnog tastera miša se vraća na FALSE
		document.getElementById("table").className = ''; // briše se klasa kojom je kursor bio postavljen na gumicu za brisanje, tj. kursor se vraća na olovku
	}
}

// ukoliko se, dok je levi ili desni taster miša pritisnut (tj. flag „tablemousedown“ ili flag „tablemouserightdown“ postavljen na TRUE), kursorom miša prešlo iz jedne u drugu ćeliju tabele koja je pod rednim brojem x, tada se za ćeliju u koju se došlo postavlja novi status, u zavisnosti od toga koje je dugme miša pritisnuto
function tableMouseEnter(x) {
	if (tablemousedown) { // ako je pritisnuto levo dugme miša
		document.getElementById(x).className = 'alive'; // odgovarajuća ćelija tabele postavlja se na „živo“
		cellsArray[counter][x] = 1; // u odgovarajući član globalnog niza „cellsArray[]“ unosi se vrednost 1, koja odgovara statusu „živo“
	} else if (tablemouserightdown) { // ako je pritisnuto desno dugme miša
		document.getElementById(x).className = 'dead'; // odgovarajuća ćelija tabele postavlja se na „mrtvo“
		cellsArray[counter][x] = 0; // u odgovarajući član globalnog niza „cellsArray[]“ unosi se vrednost 0, koja odgovara statusu „mrtvo“
	}
}

// ako je levi taster miša pritisnut dok je kursor na regulatoru gustine random rasporeda
function densityMouseDown() {
	densityValue = document.getElementById("density").value; // vrednost regulatora gustine random rasporeda kopira se u varijablu „densityValue“
	drawTable(0); // crtanje tabele (argument 0 znači da se crta random raspored)
	dnsLoop = setInterval(densityLoop, 100); // startovanje petlje u kojoj se proverava da li je došlo do pomeranja regulatora gustine random rasporeda
}

// petlja u kojoj se proverava da li je došlo do pomeranja regulatora gustine random rasporeda
function densityLoop() {
	if (densityValue != document.getElementById("density").value) { // ako položaj regulatora gustine random rasporeda više nije jednak vrednosti koja je sačuvana u varijabli „densityValue“, znači da je došlo do pomeranja regulatora
		densityValue = document.getElementById("density").value; // u tom slučaju, nova vrednost koju daje regulator gustine random rasporeda kopira se u varijablu „densityValue“...
		drawTable(0); // ...i crta se nova tabela (argument 0 znači da se crta random raspored)
	}
}

// nakon otpuštanja levog tastera miša prilikom promene gustine random rasporeda...
function densityMouseUp() {
	clearInterval(dnsLoop); // zaustavlja se petlja za proveru pomeranja regulatora gustine
}

// ako je levi taster miša pritisnut dok je kursor na regulatoru brzine simulacije
function speedMouseDown() {
	if (speedValue != document.getElementById("speed").value) {
		speedValue = document.getElementById("speed").value; // vrednost regulatora brzine simulacije kopira se u varijablu „speedValue“
		changeSpeed();
	}
	spdLoop = setInterval(speedLoop, 100); // startovanje petlje u kojoj se proverava da li je došlo do pomeranja regulatora brzine simulacije
}

// petlja u kojoj se proverava da li je došlo do pomeranja regulatora brzine simulacije
function speedLoop() {
	if (speedValue != document.getElementById("speed").value) { // ako položaj regulatora brzine simulacije više nije jednak vrednosti koja je sačuvana u varijabli „speedValue“, znači da je došlo do pomeranja regulatora
		speedValue = document.getElementById("speed").value; // u tom slučaju, nova vrednost koju daje regulator brzine simulacije kopira se u varijablu „speedValue“...
		changeSpeed(); // i brzina simulacije se postavlja na novopodešenu vrednost
	}
}

// nakon otpuštanja levog tastera miša prilikom promene brzine simulacije...
function speedMouseUp() {
	clearInterval(spdLoop); // zaustavlja se petlja za proveru pomeranja regulatora brzine
}

// vrednost funkcije je 0 ako je ćelija pod rednim brojem x mrtva, a 1 ako je živa
function checkCell(x) {
	if (document.getElementById(x).className == 'alive' || document.getElementById(x).className == 'revived') {
		return 1;
	} else {
		return 0;
	}
}

// promena statusa ćelije pod rednim brojem x – ako je bila živa postaje mrtva, a ako je bila mrtva postaje živa
function changeCell(x) {
	if (checkCell(x) == 1) {
		document.getElementById(x).className = 'dead';
	} else {
		document.getElementById(x).className = 'alive';
	}
	cellsArray[counter][x] = 1 - (cellsArray[counter][x] % 2); // promena vrednosti trenutnog člana niza – ako je bio 0 (mrtvo) ili 2 (upravo umrlo), dobija vrednost 1 (živo); ako je bio 1 (živo) ili 3 (upravo oživljeno), dobija vrednost 0 (mrtvo)
}

// zamena svih živih ćelija mrtvima i obratno
function inverse() {
	if (document.getElementById("counter").style.display != "none") { // ukoliko je brojač prikazan...
		counter = 0; // ...resetovanje brojača...
		dispCounter(); // ...i njegovo ponovno prikazivanje
	}
	for (i = 1; i <= p; i++) { // petlja po ćelijama tabele (ćelija ima p=m*n)
		changeCell(i); // promena statusa trenutne ćelije tabele
	}
}

// vrednost funkcije predstavlja novi status ćelije (0 – mrtva, 1 – živa, 2 – upravo umrla, 3 – upravo oživela), u zavisnosti od njenog prethodnog statusa (x) i broja živih suseda (neighbours)
function newStatus(x, neighbours) {
	if (checkCell(x) == 0) { // ukoliko je posmatrana ćelija mrtva...
		if (neighbours == 3) { // ...i broj suseda jednak 3...
			return 3; // ...tada mrtva ćelija oživljava, što predstavljamo statusom 3
		} else { // u suprotnom, mrtva ćelija ostaje mrtva...
			return 0; // ...što predstavljamo statusom 0
		}
	} else { // ako je posmatrana ćelija živa...
		if (neighbours == 2 || neighbours == 3) { // ...a broj suseda je 2 ili 3...
			return 1; // ...tada živa ćelija ostaje živa, što predstavljamo statusom 1
		} else { // u suprotnom, kada je broj suseda manji od 2 ili veći od 3, tada živa ćelija umire, zbog usamljenosti odnosno prenaseljenosti...
			return 2; // ...što predstavljamo statusom 2
		}
	}
}

// aktivira se pritiskom na „FRAME ADVANCE“ dugme ili na njegov keyboard shorcut; služi da se dugmad „REVERSE“ i „PREVIOUS FRAME“ aktiviraju pre pozivanja glavne funkcije step()
function oneStep() {
	reverseAct(); // aktivacija dugmeta „REVERSE“
	stepRevAct(); // aktivacija dugmeta „PREVIOUS FRAME“
	step(); // izvršavanje koraka simulacije
}

// korak simulacije
function step() {
	// prikazivanje rednog broja koraka simulacije
	counter++; // uvećavanje koraka simulacije za jedan...
	dispCounter(); // ...a zatim prikazivanje rednog broja trenutnog koraka

	cellsArray[counter] = []; // globalni niz u kojem se čuvaju statusi polja tabele za trenutni korak simulacije

	var neighbours; // varijabla koja pokazuje koliko trenutna ćelija ima živih suseda
	var doubleN = 2 * n; // privremena varijabla koja sadrži dvostruku vrednost broja kolona; uvedena radi optimizacije algoritma, budući da se ta vrednost često ponavlja u operacijama
	var pSubN = p - n; // privremena varijabla koja sadrži redni broj poslednje ćelije u pretposlednjem redu tabele; uvedena radi optimizacije algoritma, budući da se ta vrednost često ponavlja u operacijama

	// Prvo obrađujemo četiri ćelije na ćoškovima

	// ćelija u gornjem levom uglu
	neighbours = checkCell(2) + checkCell(n + 1) + checkCell(n + 2) + edge * (checkCell(n) + checkCell(doubleN) + checkCell(pSubN + 1) + checkCell(pSubN + 2) + checkCell(p)); // prebrojavamo koliko živih ćelija ima među susedne tri ćelije; ako je edge=1 (tj. odabran mode 2 za ivice tabele), dodati još i statuse odgovarajućih pet ćelija na ostalim uglovima tabele
	cellsArray[counter][1] = newStatus(1, neighbours); // novi status ćelije smešta se u odgovarajući član globalnog niza

	// ćelija u gornjem desnom uglu
	neighbours = checkCell(n - 1) + checkCell(doubleN - 1) + checkCell(doubleN) + edge * (checkCell(1) + checkCell(n + 1) + checkCell(pSubN + 1) + checkCell(p - 1) + checkCell(p)); // prebrojavamo koliko živih ćelija ima među susedne tri ćelije; ako je edge=1 (tj. odabran mode 2 za ivice tabele), dodati još i statuse odgovarajućih pet ćelija na ostalim uglovima tabele
	cellsArray[counter][n] = newStatus(n, neighbours); // novi status ćelije smešta se u odgovarajući član globalnog niza

	// ćelija u donjem levom uglu
	neighbours = checkCell(p - doubleN + 1) + checkCell(p - doubleN + 2) + checkCell(pSubN + 2) + edge * (checkCell(1) + checkCell(2) + checkCell(n) + checkCell(pSubN) + checkCell(p)); // prebrojavamo koliko živih ćelija ima među susedne tri ćelije; ako je edge=1 (tj. odabran mode 2 za ivice tabele), dodati još i statuse odgovarajućih pet ćelija na ostalim uglovima tabele
	cellsArray[counter][pSubN + 1] = newStatus(pSubN + 1, neighbours); // novi status ćelije smešta se u odgovarajući član globalnog niza

	// ćelija u donjem desnom uglu
	neighbours = checkCell(pSubN - 1) + checkCell(pSubN) + checkCell(p - 1) + edge * (checkCell(1) + checkCell(n - 1) + checkCell(n) + checkCell(p - doubleN + 1) + checkCell(pSubN + 1)); // prebrojavamo koliko živih ćelija ima među susedne tri ćelije; ako je edge=1 (tj. odabran mode 2 za ivice tabele), dodati još i statuse odgovarajućih pet ćelija na ostalim uglovima tabele
	cellsArray[counter][p] = newStatus(p, neighbours); // novi status ćelije smešta se u odgovarajući član globalnog niza

	// Obrađujemo prvi (gornji) red (bez ugaonih ćelija)
	for (i = 2; i <= n - 1; i++) {
		neighbours = checkCell(i - 1) + checkCell(i + 1) + checkCell(n + i - 1) + checkCell(n + i) + checkCell(n + i + 1) + edge * (checkCell(pSubN + i - 1) + checkCell(pSubN + i) + checkCell(pSubN + i + 1)); // prebrojavamo koliko živih ćelija ima među susednih pet ćelija; ako je edge=1 (tj. odabran mode 2 za ivice tabele), dodati još i statuse odgovarajuće tri ćelije na donjoj ivici tabele
		cellsArray[counter][i] = newStatus(i, neighbours); // novi status ćelije smešta se u odgovarajući član globalnog niza
	}

	// Obrađujemo poslednji (donji) red (bez ugaonih ćelija)
	var start = pSubN + 2; // redni broj ćelije koja je prva desno od ćelije u donjem levom uglu
	var end = p - 1; // redni broj ćelije koja je prva levo od ćelije u donjem desnom uglu
	var cell = 1;
	for (i = start; i <= end; i++) {
		cell++;
		neighbours=checkCell(i - 1) + checkCell(i + 1) + checkCell(i - 1 - n) + checkCell(i - n) + checkCell(i + 1 - n) + edge * (checkCell(cell - 1) + checkCell(cell) + checkCell(cell + 1)); // prebrojavamo koliko živih ćelija ima među susednih pet ćelija; ako je edge=1 (tj. odabran mode 2 za ivice tabele), dodati još i statuse odgovarajuće tri ćelije na gornjoj ivici tabele
		cellsArray[counter][i] = newStatus(i, neighbours); // novi status ćelije smešta se u odgovarajući član globalnog niza
	}

	// Sada obrađujemo sve preostale redove – od drugog pa do pretposlednjeg
	var above; // varijabla koja će označavati redni broj ćelije iznad posmatrane
	var under; // varijabla koja će označavati redni broj ćelije ispod posmatrane
	for (i = 2; i <= m - 1; i++) { // dakle, petlja od drugog do pretposlednjeg reda

		// Prvo ćelije koje su uz levu ivicu tabele
		k = (i - 1) * n + 1; // redni broj posmatrane ćelije koja se nalazi uz levu ivicu tabele
		above = k - n; // redni broj ćelije koja se nalazi odmah iznad posmatrane
		under = k + n; // redni broj ćelije koja se nalazi odmah ispod posmatrane
		neighbours = checkCell(above) + checkCell(above + 1) + checkCell(k + 1) + checkCell(under) + checkCell(under + 1) + edge * (checkCell(k - 1) + checkCell(under - 1) + checkCell(under + n - 1)); // prebrojavamo koliko živih ćelija ima među susednih pet ćelija; ako je edge=1 (tj. odabran mode 2 za ivice tabele), dodati još i statuse odgovarajuće tri ćelije na desnoj ivici tabele
		cellsArray[counter][k] = newStatus(k, neighbours); // novi status ćelije smešta se u odgovarajući član globalnog niza

		// Zatim ćelije koje su uz desnu ivicu tabele
		k = i * n; // redni broj posmatrane ćelije koja se nalazi uz desnu ivicu tabele
		above = k - n; // redni broj ćelije koja se nalazi odmah iznad posmatrane
		under = k + n; // redni broj ćelije koja se nalazi odmah ispod posmatrane
		neighbours = checkCell(above) + checkCell(above - 1) + checkCell(k - 1) + checkCell(under - 1) + checkCell(under) + edge * (checkCell(above - n + 1) + checkCell(above + 1) + checkCell(k + 1)); // prebrojavamo koliko živih ćelija ima među susednih pet ćelija; ako je edge=1 (tj. odabran mode 2 za ivice tabele), dodati još i statuse odgovarajuće tri ćelije na levoj ivici tabele
		cellsArray[counter][k] = newStatus(k, neighbours); // novi status ćelije smešta se u odgovarajući član globalnog niza

		// Zatim sve ostale ćelije u trenutnom redu (od drugog do pretposlednjeg, sleva nadesno)
		for (j = 2; j <= n - 1; j++) {
			k = (i - 1) * n + j; // redni broj posmatrane ćelije
			neighbours = checkCell(k - n - 1) + checkCell(k - n) + checkCell(k - n + 1) + checkCell(k - 1) + checkCell(k + 1) + checkCell(k + n - 1) + checkCell(k + n) + checkCell(k + n + 1); // prebrojavamo koliko živih ćelija ima među susednih osam ćelija
			cellsArray[counter][k] = newStatus(k, neighbours); // novi status ćelije smešta se u odgovarajući član globalnog niza
		}
	}

	// sada kada su novi statusi svih ćelija pohranjeni u privremeni niz, vršimo prebacivanje vrednosti članova niza u samu tabelu, tj. prikazivanje ne ekranu
	displayNew();
}

// prikazivanje rednog broja koraka simulacije (na osnovu sadržaja globalne varijable „counter“)
function dispCounter() {
	document.getElementById("counter").style = "inline"; // prikazivanje brojača (za slučaj da je bio sakriven)
	document.getElementById("counter").getElementsByTagName("span")[0].innerHTML = counter; // prikazivanje rednog broja koraka simulacije
}

// prikazivanje sadržaja tabele na osnovu podataka smeštenih u globalnom nizu „cellsArray[]“
function displayNew() {
	var status; // privremena varijabla za smeštanje statusa trenutne ćelije tabele
	for (i = 1; i <= p; i++) { // petlja po članovima niza (niz ima p=m*n članova, tj. onoliko koliko ima ćelija tabele)
		if (document.getElementById("changes").checked) { // ukoliko je uključena opcija da se promene prikazuju bojama...
			status = cellsArray[counter][i]; // ...tada uzimamo nepromenjenu vrednost člana niza
		} else { // u suprotnom, ako je isključena opcija da se promene prikazuju bojama...
			status = cellsArray[counter][i] % 2; // ...tada uzimamo ostatak pri deljenju sa 2 (0 ostaje 0, 1 ostaje 1, 2 postaje 0, 3 postaje 1)
		}
		switch (status) {
			case 0: // ako je ćelija mrtva
				document.getElementById(i).className = "dead"; // ćelija će biti prikazana belom bojom (podešeno u CSS-u)
				break;
			case 1: // ako je ćelija živa
				document.getElementById(i).className = "alive"; // ćelija će biti prikazana crnom bojom (podešeno u CSS-u)
				break;
			case 2: // ako je ćelija upravo umrla
				document.getElementById(i).className = "died"; // ćelija će biti prikazana žutom bojom (podešeno u CSS-u)
				break;
			case 3: // ako je ćelija upravo oživljena
				document.getElementById(i).className = "revived"; // ćelija će biti prikazana plavom bojom (podešeno u CSS-u)
				break;
		}
	}
}

// vraćanje simulacije za jedan korak
function stepRev() {
	counter--; // umanjujemo brojač koraka simulacije za jedan
	if (counter == 0) { // ako smo stigli do nultog koraka simulacije...
		reverseDeact(); // ...deaktiviramo dugme za vraćanje simulacije unazad
		stepRevDeact(); // takođe deaktiviramo dugme za prethodni korak simulacije
		
		// zaustavljanje radne petlje
		if (runLoop != 0) {
			clearInterval(runLoop);
			runLoop = 0;
		}

		clearInterval(ledLoop); // zaustavlja se treperenje LED-diode...
		ledLoop = 0; // ...i varijabla timing-eventa treperenja se postavlja na nulu
		document.getElementById("led").className = "led-off"; // LED se isključuje
		document.getElementById("start").getElementsByTagName("img")[0].src = playButton; // na aktivacionom dugmetu prikazuje se oznaka „PLAY“
		document.getElementById("start-tip").style.display = 'inline'; // help tip se...
		document.getElementById("pause-tip").style.display = 'none'; // ...postavlja na...
		document.getElementById("cont-tip").style.display = 'none'; // ...„pokretanje simulacije“
		afterReverse(); // reaktivacija dugmadi i opcija nakon završetka režima „REVERSE“
		mode = 0; // prelazi se u režim „STOP“
	}
	dispCounter(); // prikazivanje brojača koraka
	displayNew(); // prikazivanje stanja tabele u trenutnom koraku
}

// vraća simulaciju unazad
function reverse() {
	if (mode != 1 && mode != 3 && counter > 0) { // komanda „REVERSE“ se prihvata samo u režimima „STOP“ i „PAUSE“ i to u slučaju da je izvršen bar jedan korak simulacije
	
		// deaktivacija dugmadi koja ne mogu biti korišćena tokom vraćanja simulacije unazad
		document.getElementById("random").className = "deact"; // prikazivanje fonta regulatora gustine random rasporeda sivom (neaktivnom) bojom
		document.getElementById("density").disabled = true;
		document.getElementById("white").disabled = true;
		document.getElementById("black").disabled = true;
		document.getElementById("hor").disabled = true;
		document.getElementById("vert").disabled = true;
		document.getElementById("diag").disabled = true;
		document.getElementById("chess").disabled = true;
		document.getElementById("inverse").disabled = true;
		stepRevDeact(); // deaktivacija dugmeta „PREVIOUS FRAME“
		stepDeact(); // deaktivacija dugmeta „FRAME ADVANCE“
		document.getElementById("edge").className = "deact"; // prikazivanje fonta opcije „edge“ sivom (neaktivnom) bojom
		document.getElementById("edge1").disabled = true;
		document.getElementById("edge2").disabled = true;

		clearInterval(ledLoop); // zaustavlja se sporo treperenje LED-diode iz režima „PAUSE“...
		ledLoop = 0; // ...i varijabla timing-eventa treperenja se postavlja na nulu
		ledFlag = 0; // pre ulaska u petlju za brzo treperenje postavljamo indikator da je LED isključena
		ledLoop = setInterval(ledBlink, 170); // petlja za brzo treperenje LED-diode, s periodom od 170ms

		mode = 3; // „mode“ varijabla se postavlja na vrednost koja označava režim „REVERSE“
		document.getElementById("start").getElementsByTagName("img")[0].src = pauseButton; // na aktivacionom dugmetu se prikazuje simbol "PAUSE"
		document.getElementById("start-tip").style.display = 'none'; // help tip se...
		document.getElementById("pause-tip").style.display = 'inline'; // ...postavlja na...
		document.getElementById("cont-tip").style.display = 'none'; // ...„pauziranje simulacije“
		a = document.getElementById("speed").value; // podešavanje brzine na osnovu položaja klizača brzine
		runLoop = setInterval(stepRev, 1361 - 150 * a); // ponavljanje radne petlje
	}
}

// reaktivacija dugmadi i opcija nakon završetka režima „REVERSE“
function afterReverse() {
	document.getElementById("random").className = ""; // prikazivanje fonta regulatora gustine random rasporeda crnom (aktivnom) bojom
	document.getElementById("density").disabled = false;
	document.getElementById("white").disabled = false;
	document.getElementById("black").disabled = false;
	document.getElementById("hor").disabled = false;
	document.getElementById("vert").disabled = false;
	document.getElementById("diag").disabled = false;
	document.getElementById("chess").disabled = false;
	document.getElementById("inverse").disabled = false;
	document.getElementById("step").disabled = false;
	stepAct(); // aktivacija dugmeta „FRAME ADVANCE“
	document.getElementById("edge").className = ""; // prikazivanje fonta opcije „edge“ crnom (aktivnom) bojom
	document.getElementById("edge1").disabled = false;
	document.getElementById("edge2").disabled = false;
}

// podešavanje brzine na osnovu položaja klizača brzine i ponavljanje radne petlje
function setSpeed() {
	a = document.getElementById("speed").value; // podešavanje brzine na osnovu položaja klizača brzine
	b = 1361 - 150 * a; // najmanjoj brzini (a=1) odgovara najveći period (b=1211), dok najvećoj brzini (a=9) odgovara najmanji period (b=11)
	if (mode == 1) {
		runLoop = setInterval(step, b); // ponavljanje radne petlje (za režim „PLAY“)
	} else {
		runLoop = setInterval(stepRev, b); // ponavljanje radne petlje (za režim „REVERSE“)
	}
}

// Prelazak u režim „PLAY“ ili „PAUSE“
function run() {
	// ako je režim bio „PLAY“ ili „REVERSE“, prelazak u režim „PAUSE“
	if (mode == 1 || mode == 3) {
		clearInterval(runLoop); // zaustavlja se radna petlja
		document.getElementById("start").getElementsByTagName("img")[0].src = playPauseButton; // na aktivacionom dugmetu se prikazuje simbol "PLAY/PAUSE"
		document.getElementById("start-tip").style.display = 'none'; // help tip se...
		document.getElementById("pause-tip").style.display = 'none'; // ...postavlja na...
		document.getElementById("cont-tip").style.display = 'inline'; // ...„nastavljanje simulacije“
		document.getElementById("step").disabled = false; // ponovo se aktivira dugme „FRAME ADVANCE“ (koje je bilo deaktivirano tokom režima „PLAY“)
		document.getElementById("step").getElementsByTagName("img")[0].src = stepButton; // ponovo se aktivira i slika njegovog simbola na tasteru
		if (counter > 0) { // ukoliko nismo na nultom koraku simulacije...
			reverseAct(); // ...aktivacija dugmeta za vraćanje simulacije unazad
			stepRevAct(); // takođe, aktivacija dugmeta za prethodni korak simulacije
		}
		document.getElementById("led").className = "led-off"; // LED se isključuje pre započinjanja sporog treperućeg režima
		if (mode = 3) { // ako je režim bio „REVERSE“...
			clearInterval(ledLoop); // ...zaustavlja se brzo treperenje LED-diode...
			ledLoop = 0; // ...i varijabla timing-eventa treperenja se postavlja na nulu
			afterReverse(); // reaktivacija dugmadi i opcija nakon završetka režima „REVERSE“
		}
		ledFlag = 0; // pre ulaska u petlju za sporo treperenje postavljamo indikator da je LED isključena
		ledLoop = setInterval(ledBlink, 500); // petlja za sporo treperenje LED-diode, s periodom od 500ms
		mode = 2; // flag radnog režima se postavlja na vrednost koji označava režim „PAUSE“
	}
	
	// Ako je režim bio „STOP“ ili „PAUSE“, onda prelazak u režim „PLAY“
	else {
		if (mode == 2) { // u slučaju da je režim bio „PAUSE“...
			clearInterval(ledLoop); // ...zaustavlja se sporo treperenje LED-diode...
			ledLoop = 0; // ...i varijabla timing-eventa treperenja se postavlja na nulu
		}
		mode = 1; // flag radnog režima se postavlja na vrednost koji označava režim „PLAY“
		document.getElementById("start").getElementsByTagName("img")[0].src = pauseButton; // na aktivacionom dugmetu se prikazuje simbol "PAUSE"
		document.getElementById("start-tip").style.display = 'none'; // help tip se...
		document.getElementById("pause-tip").style.display = 'inline'; // ...postavlja na...
		document.getElementById("cont-tip").style.display = 'none'; // ...„pauziranje simulacije“
		document.getElementById("led").className = "led-on"; // LED se uključuje
		document.getElementById("step").disabled = true; // za vreme režima „PLAY“, dugme „FRAME ADVANCE“ je deaktivirano
		document.getElementById("step").getElementsByTagName("img")[0].src = stepButtonDisabled; // deaktivira se i slika njegovog simbola na tasteru
		reverseDeact(); // deaktivacija dugmeta za vraćanje simulacije unazad
		stepRevDeact(); // deaktivacija dugmeta za prethodni korak simulacije
		setSpeed(); // podešavanje brzine na osnovu položaja klizača brzine i ponavljanje radne petlje
	}
}


// Aktivacija i deaktivacija dugmadi

// aktivacija dugmeta „PREVIOUS FRAME“
function stepRevAct() {
	document.getElementById("step-rev").disabled = false; // aktivira se dugme „PREVIOUS FRAME“
	document.getElementById("step-rev").getElementsByTagName("img")[0].src = stepRevButton; // aktivira se i slika njegovog simbola na tasteru
}

// deaktivacija dugmeta „PREVIOUS FRAME“
function stepRevDeact() {
	document.getElementById("step-rev").disabled = true; // deaktivira se dugme „PREVIOUS FRAME“
	document.getElementById("step-rev").getElementsByTagName("img")[0].src = stepRevButtonDisabled; // deaktivira se i slika njegovog simbola na tasteru
}

// aktivacija dugmeta „REVERSE“
function reverseAct() {
	document.getElementById("reverse").disabled = false; // aktivira se dugme „REVERSE“
	document.getElementById("reverse").getElementsByTagName("img")[0].src = reverseButton; // aktivira se i slika njegovog simbola na tasteru
}

// deaktivacija dugmeta „REVERSE“
function reverseDeact() {
	document.getElementById("reverse").disabled = true; // deaktivira se dugme „REVERSE“
	document.getElementById("reverse").getElementsByTagName("img")[0].src = reverseButtonDisabled; // deaktivira se i slika njegovog simbola na tasteru
}

// aktivacija dugmeta „FRAME ADVANCE“
function stepAct() {
	document.getElementById("step").disabled = false; // aktivira se dugme „FRAME ADVANCE“
	document.getElementById("step").getElementsByTagName("img")[0].src = stepButton; // aktivira se i slika njegovog simbola na tasteru
}

// deaktivacija dugmeta „FRAME ADVANCE“
function stepDeact() {
	document.getElementById("step").disabled = true; // deaktivira se dugme „FRAME ADVANCE“
	document.getElementById("step").getElementsByTagName("img")[0].src = stepButtonDisabled; // deaktivira se i slika njegovog simbola na tasteru
}

// treperenje LED-diode u režimima „PAUSE“ i „REVERSE“
function ledBlink() {
	if (ledFlag == 1) { // ukoliko je LED uključena...
		document.getElementById("led").className = "led-off"; // ...isključuje se...
		ledFlag = 0; // ...i indikator uključene LED se postavlja na nulu
	} else { // u suprotnom, ako je LED isključena...
		document.getElementById("led").className = "led-on"; // ...uključuje se...
		ledFlag = 1; // ...i indikator uključene LED se postavlja na jedinicu
	}
}

// promena brzine u toku simulacije
function changeSpeed() {
	if (mode == 1 || mode == 3) { // izvršava se jedino u režimu „PLAY“ ili u režimu „REVERSE“
		clearInterval(runLoop); // prekida se dosadašnja radna petlja...
		setSpeed(); // ...i startuje nova, s novopodešenom brzinom
	}
}

// promena načina na koji se ivice tabele ponašaju
function changeEdgeMode(newEdge) {
	edge = newEdge;
}

// ukoliko je kliknuto na promenu dimenzija tabele (promena broja redova, promena broja kolona, promena širine cele tabele ili promena dimenzije ćelije)
function clickTableDim() {
	if (mode != 1 && mode != 3) { // u režimima „PLAY“ i „REVERSE“ treba da bude onemogućena promena dimazija tabele
		dimChosen = true; // postavljanje flaga koji pokazuje da je korisnik najmanje jednom izabrao dimenzije tabele
		if (isAnyAlive()) { // ukoliko na tabeli postoji makar jedna „živa“ ćelija...
			answer = confirm (alertMsg); // ...iskače alert box s pitanjem da li da se obriše cela tabela...
			if (answer) {
				createTableDim(); // ...i, ukoliko je odgovor potvrdan, klik na promenu dimenzija tabele se prihvata
			}
		} else { // ukoliko na tabeli nije pronađena nijedna „živa“ ćelija...
			createTableDim(); // klik na promenu dimenzija tabele se automatski prihvata
		}
	}
}

// promena dimenzije tabele (promena broja redova, promena broja kolona, promena širine cele tabele ili promena dimenzije ćelije)
function createTableDim() {
	document.getElementById("counter").style.display = "none"; // uklanjanje prikaza broja koraka, budući da je s prethodnom simulacijom završeno
	m = +document.getElementById("numberofrows").value; // broj redova tabele (uzima se iz vrednosti odgovarajućeg input polja)
	n = +document.getElementById("numberofcolumns").value; // broj kolona tabele (uzima se iz vrednosti odgovarajućeg input polja)
	p = m * n; // broj ćelija tabele je proizvod broja redova i broja kolona
	if (document.getElementById("tablewidth").disabled) { // ukoliko nije uneta širina tabele, već dimenzija ćelije...
		cellDim = +document.getElementById("cellwidth").value; // varijabla „cellDim“ koja sadrži vrednost dimenzije ćelije, poprima vrednost unete dimenzije ćelije
	} else { // u suprotnom, ukoliko je uneta širina tabele...
		cellDim = Math.floor((+document.getElementById("tablewidth").value - 23) / n) - 1; // ...dimenzija ćelije (širina = visina, budući da je ćelija kvadratnog oblika); prilikom računanja dimenzije ćelije u zavisnosti od širine tabele i broja kolona uzima se u obzir da je širina tabele jednaka proizvodu broja kolona i dimenzije ćelije zajedno s jednim njenim zidom (cellDim+1), na šta se još doda 3 budući da na okvir tabele ide 4 piksela, a ne 1 piksel; takođe, levo i desno od tabele se ostavlja margina od 10px
		cellDim = (cellDim < 1) ? 1 : cellDim; // minimalna dimenzija ćelije mora biti 1, pa ukoliko je dobijena dimenzija ćelije manja od 1, dodeljuje joj se vrednost 1
	}
	drawTable(1); // crta se prazna tabela s novim dimenzijama
}

function alertChangeLang(link) { // upozorenje i zahtev za potvrdu prilikom klika na link za promenu jezika, u slučaju da je na tabeli bar jedna ćelija označena kao „živa“; „link“ je adresa na koju se ide u slučaju potvrde
	// provera da li se na tabeli nalazi bar jedna „živa“ ćelija
	if (isAnyAlive()) {
		answer = confirm (alertMsg); // iskače alert box s pitanjem da li da se obriše cela tabela...
		if (answer) {
			window.location = link; // ukoliko je odgovor potvrdan, klik na link za promenu jezika se prihvata
		}
	} else { // nije pronađena nijedna „živa“ ćelija...
		window.location = link; // ...pa se klik na link za promenu jezika automatski prihvata
	}
}

// provera da li se na tabeli nalazi bar jedna „živa“ ćelija (ako se nalazi – TRUE, ako se ne nalazi – FALSE)
function isAnyAlive() {
	for (i = 1; i <= p; i++) { // testiranje od prve do poslednje (p-te) ćelije
		if (checkCell(i) == 1) { // u slučaju da je otkrivena „živa“ ćelija...
			return true; // ...funkcija vraća vrednost TRUE...
			break; // ...i izlazi se iz petlje
		}
	}
	return false; // ako je petlja završena bez otkrivanja žive ćelije, funkcija vraća vrednost FALSE
}

// provera da li je numerički unos dimenzija tabele ispravan
function verifyInput() {
	if (document.getElementById("numberofrows").value > 500) { // uneti unos broja redova tabele ne može biti veći od 500
		document.getElementById("numberofrows").value = 500;
	}
	if (document.getElementById("numberofcolumns").value > 500) { // uneti unos broja kolona tabele ne može biti veći od 500
		document.getElementById("numberofcolumns").value = 500;
	}
	if (document.getElementById("tablewidth").value > 1920) { // uneti unos širine tabele ne može biti veći od 1920 (koliko iznosi rezolucija na najvećim monitorima)
		document.getElementById("tablewidth").value = 1920;
	}
	if (document.getElementById("cellwidth").value > 99) { // uneti unos dimenzije ćelije ne može biti veći od 99
		document.getElementById("cellwidth").value = 99;
	}
	if (document.getElementById("numberofrows").value < 1) { // uneti unos broja redova tabele ne može biti manji od 1
		document.getElementById("numberofrows").value = 1;
	}
	if (document.getElementById("numberofcolumns").value < 1) { // uneti unos broja redova tabele ne može biti manji od 1
		document.getElementById("numberofcolumns").value = 1;
	}
	if (document.getElementById("tablewidth").value < 1) { // uneti unos širine tabele ne može biti manji od 1
		document.getElementById("tablewidth").value = 1;
	}
	if (document.getElementById("cellwidth").value < 1) { // uneti unos dimenzije ćelije ne može biti manji od 1
		document.getElementById("cellwidth").value = 1;
	}
}

function newDimOnWinResize() { // automatska promena dimenzija tabele, prilagođena novim dimenzijama browserskog prozora (promena broja redova i broja kolona)
	if (!dimChosen && !isAnyAlive()) { // ne vrši se automatski resize tabele u slučaju da je korisnik uneo dimenzije tabele, ili u slučaju da na tabeli već postoje „živa“ polja
		document.getElementById("tablewidth").value = window.innerWidth; // postavljanje inicijalne vrednosti polja za unos širine tabele na vrednost širine browserskog prozora
		document.getElementById("cellwidth").value = cellDim; // postavljanje inicijalne vrednosti polja za unos dimenzije ćelije
		m = Math.floor((window.innerHeight - document.getElementsByClassName("container")[0].offsetHeight - document.getElementsByClassName("container")[1].offsetHeight - 51) / (cellDim + 1)); // prilikom računanja inicijalnog broja redova u zavisnosti od visine raspoloživog prostora i dimenzije ćelije uzima se u obzir da je visina tabele jednaka proizvodu broja redova i dimenzije ćelije zajedno s jednim njenim zidom (cellDim+1), na šta se još doda 3 budući da na okvir tabele ide 4 piksela, a ne 1 piksel
		n = Math.floor((document.getElementById("tablewidth").value - 23) / (cellDim + 1)); // prilikom računanja inicijalnog broja kolona u zavisnosti od širine browserskog prozora i dimenzije ćelije uzima se u obzir da je širina tabele jednaka proizvodu broja kolona i dimenzije ćelije zajedno s jednim njenim zidom (cellDim+1), na šta se još doda 3 budući da na okvir tabele ide 4 piksela, a ne 1 piksel
		m = (m < 10) ? 10 : m; // minimalan početni broj redova tabele mora biti 10, pa ukoliko je dobijena vrednost manja od 10, dodeljuje joj se vrednost 10
		n = (n < 10) ? 10 : n; // minimalan početni broj kolona tabele mora biti 10, pa ukoliko je dobijena vrednost manja od 10, dodeljuje joj se vrednost 10
		p = m * n; // broj ćelija tabele je proizvod broja redova i broja kolona
		document.getElementById("numberofrows").value = m; // postavljanje vrednosti polja za unos broja redova tabele
		document.getElementById("numberofcolumns").value = n; // postavljanje vrednosti polja za unos broja kolona tabele
		drawTable(1);
	}
}

// prečice na tastaturi
document.onkeypress = key;
function key(event) {
	// pribavljanje koda pritisnutog tastera
	var x = event.which || event.keyCode;

	// pritisnut neki od tastera od 1 do 9, radi regulisanja gustine random rasporeda
	if (x >= 49 && x <= 57 && mode != 3 && !(document.activeElement.type == "number")) { // opcija je neaktivna u režimu „REVERSE“; takođe, prečice na tastaturi treba onemogućiti dok je fokus na poljima za numerički unos (budući da su ovde u pitanju numerički tasteri)
		document.getElementById("density").focus(); // stavljanje fokusa na regulator gustine random rasporeda
		densityValue = x - 48; // za tastere 1–9 vrednost njihovog koda je za 48 veća od njihove vrednosti – prema tome, od koda tastera treba oduzeti 48 (npr. kôd za taster 3 je 51, oduzmemo 48 i dobijemo 3)
		document.getElementById("density").value = densityValue; // regulator se namešta na onu poziciju koja odgovara pritisnutom tasteru 1–9
		drawTable(0); // crtanje tabele (argument 0 znači da se crta random raspored)
	}

	// pritisnut neki od tastera za regulaciju brzine simulacije
	if (x == 110 || x == 109) {
		document.getElementById("speed").focus(); // stavljanje fokusa na regulator brzine simulacije
		if (x == 110) { // taster „N“ za usporavanje simulacije
			var speed = document.getElementById("speed").value;
			if (speed > 1) { // Ako klizač regulatora brzine nije na krajnjoj levoj poziciji...
				speed--;
				document.getElementById("speed").value = speed; // ...pomera se za jednu poziciju nalevo
				changeSpeed(); // brzina simulacije se smanjuje
			}
		} else { // taster „M“ za ubrzavanje simulacije
			var speed = document.getElementById("speed").value;
			if (speed < 9) { // Ako klizač regulatora brzine nije na krajnjoj desnoj poziciji...
				speed++;
				document.getElementById("speed").value = speed; // ...pomera se za jednu poziciju nadesno
				changeSpeed(); // brzina simulacije se povećava
			}
		}
	}

	if (mode != 3) { // komande koje su neaktivne tokom režima „REVERSE“
		switch (x) {
			// taster „L“ za izbor ponašanja ivica tabele
			case 108:
				if (edge) { // ako je bilo postavljeno na mode 1, prebaciti na mode 0
					document.getElementById("edge1").checked = true; // odabir odgovarajučeg radio-buttona
					document.getElementById("edge1").focus(); // stavljanje fokusa na odgovarajući radio-button
				} else { // u suprotnom (ako je bilo postavljeno na mode 0), prebaciti na mode 1
					document.getElementById("edge2").checked = true; // odabir odgovarajučeg radio-buttona
					document.getElementById("edge2").focus(); // stavljanje fokusa na odgovarajući radio-button
				}
				edge = 1 - edge;
				break;

			// predefinisani sadržaji tabele
			case 97: // taster „A“ za tabelu sa svim belim (mrtvim) ćelijama
				drawTable(1);
				document.getElementById("white").focus(); // stavljanje fokusa na odgovarajuće dugme
				break;
			case 115: // taster „S“ za tabelu sa svim crnim (živim) ćelijama
				drawTable(2);
				document.getElementById("black").focus(); // stavljanje fokusa na odgovarajuće dugme
				break;
			case 100: // taster „D“ za raspored u vidu horizontalnih pruga
				drawTable(3);
				document.getElementById("hor").focus(); // stavljanje fokusa na odgovarajuće dugme
				break;
			case 102: // taster „F“ za raspored u vidu vertikalnih pruga
				drawTable(4);
				document.getElementById("vert").focus(); // stavljanje fokusa na odgovarajuće dugme
				break;
			case 103: // taster „G“ za raspored u vidu dijagonalnih pruga
				drawTable(5);
				document.getElementById("diag").focus(); // stavljanje fokusa na odgovarajuće dugme
				break;
			case 104: // taster „H“ za raspored u vidu šahovskih polja
				drawTable(6);
				document.getElementById("chess").focus(); // stavljanje fokusa na odgovarajuće dugme
				break;

			// inverzni raspored (da sve bele ćelije postanu crne i obratno)
			case 105: // pritisnut taster „I“
				inverse();
				document.getElementById("inverse").focus(); // stavljanje fokusa na odgovarajuće dugme
				break;

			// radne komande
			case 120: // taster „X“ za simulaciju unazad
				if (mode != 1 && mode != 3 && counter > 0) { // osim u režimu „REVERSE“, isto tako i u režimu „PLAY“ (mode=1), kao i pre izvršenja prvog koraka simulacije, opcija za simulaciju unazad je onemogućena
					reverse();
					document.getElementById("reverse").focus(); // stavljanje fokusa na odgovarajuće dugme
				}
				break;
			case 99: // taster „C“ za vraćanje jednog koraka simulacije
				if (mode != 1 && mode != 3 && counter > 0) { // osim u režimu „REVERSE“, isto tako i u režimu „PLAY“ (mode=1), kao i pre izvršenja prvog koraka simulacije, opcija za vraćanje jednog koraka simulacije je onemogućena
					stepRev();
					document.getElementById("step-rev").focus(); // stavljanje fokusa na odgovarajuće dugme
				}
				break;
			case 118: // taster „V“ za izvršavanje jednog koraka simulacije
				if (mode != 1) { // osim u režimu „REVERSE“, opcija za jedan korak simulacije je onemogućena i u režimu „PLAY“ (mode=1)
					oneStep();
					document.getElementById("step").focus(); // stavljanje fokusa na odgovarajuće dugme
				}
				break;
			case 13: // taster „ENTER“ za unošenje novih dimenzija tabele
				if (mode != 1 && (document.activeElement.id == "numberofrows" || document.activeElement.id == "numberofcolumns" || document.activeElement.id == "tablewidth" || document.activeElement.id == "cellwidth")) { // osim u režimu „REVERSE“, opcija za unošenje novih dimenzija tabele je onemogućena i u režimu „PLAY“ (mode=1); omogućena je jedino ako je fokus na nekom od polja za unos dimenzija tabele
					dimChosen = true; // flag koji pokazuje da li je korisnik najmanje jednom izabrao dimenzije tabele postavlja se na TRUE
					clickTableDim(); // promena dimenzija tabele (promena broja redova, promena broja kolona, promena širine cele tabele ili promena dimenzije ćelije)
					document.getElementById("accept").focus(); // stavljanje fokusa na odgovarajuće dugme
				}
				break;
		}
	}
	
	switch (x) {
		case 98: // taster „B“ za pokretanje/pauziranje simulacije
			run();
			document.getElementById("start").focus(); // stavljanje fokusa na odgovarajuće dugme
			break;
		case 107: // taster „K“ da se promene statusa ćelija prikazuju u boji
			if (document.getElementById("changes").checked) {
				document.getElementById("changes").checked = false;
			} else {
				document.getElementById("changes").checked = true;
			}
			document.getElementById("changes").focus(); // stavljanje fokusa na odgovarajuće dugme
			displayNew();
			break;
	}
}
