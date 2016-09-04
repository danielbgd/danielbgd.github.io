var m = 58; // broj redova tabele
var n = 80; // broj kolona tabele
var p = m * n; // broj ćelija tabele
var counter; // brojač koraka simulacije
var ledFlag; // indikator stanja LED-diode za vreme njenog blinkanja u režimu „PAUSE“ (0 – off; 1 – on)
var ledLoop = 0; // varijabla timing-eventa treperenja LED-diode u režimu „PAUSE“
var runLoop = 0; // varijabla timing-eventa izvršavanja radne petlje
var imgFolder = "images/"; // lokacija foldera za slike
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
var edge = 0; // varijabla za edge-mod (0 – ivice se ponašaju kao fizičke prepreke; 1 – prolaskom kroz svaku ivicu element se pojavljuje na suprotnoj ivici tabele)
var mousedown = false; // ako je levi taster miša stisnut dok je kursor unutar tabele, onda TRUE; ako je levi taster miša otpušten bilo unutar, bilo van tabele, onda FALSE; koristi se radi crtanja po tabeli pomoću dragginga

function init() {
	english(); // prikazivanje natpisa i poruka na defaultnom (engleskom, zasad) jeziku
	drawTable(1); // formiranje tabele
}

function drawTable(content) { // crtanje nove tabele (prazne ili s nekim drugim predefinisanim sadržajem)
	var i, j; // i – brojač redova tabele; j – brojač kolona tabele (redovi su numerisani od 1 do m, a kolone od 1 do n)
	var a = ""; // tekstualna promenljiva u koju smeštamo HTML-kôd trenutnog reda tabele
	counter = 0; // resetovanje brojača koraka, budući da je s prethodnom simulacijom završeno
	document.getElementById("counter").innerHTML = ""; // uklanjanje prikaza broja koraka (iz istog razloga kao malopre)
	reverseDeact(); // deaktivacija dugmeta za vraćanje simulacije unazad
	stepRevDeact(); // deaktivacija dugmeta za prethodni korak simulacije
	cellsArray[0] = []; // globalni niz u kojem se čuva sadržaj tabele u nultom (inicijalnom) koraku
	if (ledLoop != 0) { // ako LED-dioda treperi...
		clearInterval(ledLoop); // ...zaustavi treperenje
	}
	if (mode == 2) { // ako je režim bio „PAUSE“...
		mode = 0; // ...prelazak u režim „STOP“
		document.getElementById("start").getElementsByTagName("img")[0].src = playButton; // na aktivacionom dugmetu prikazuje se oznaka „PLAY“
		document.getElementById("start-tip").innerHTML = langArray["start tip"]; // help tip se postavlja na „pokretanje simulacije“
		ledLoop = 0;
		document.getElementById("led").className = "led-off"; // LED se isključuje
	}
	var cellID = 0; // redni broj trenutne ćelije
	for (i = 1; i <= m; i++) { // petlja po redovima tabele
		a += "<tr>"; // pri započinjanju svakog reda tabele na string a dodajemo otvarajući HTML-tag za red tabele
		for (j = 1; j <= n; j++) { // petlja po kolonama tabele
			cellID++; // redni broj trenutne ćelije se uvećava prilikom svakog prolaska kroz unutrašnju petlju
			a += "<td id='" + cellID + "' onmousedown='mouseDown(" + cellID + ")' onmouseenter='mouseEnter(" + cellID + ")' ondragstart='return false'"; // onmousedown u slučaju pritiska na levi taster miša postavlja flag mousedown na TRUE i menja status ćelije; onmouseenter, u slučaju da je flag mousedown postavljen na TRUE i da se kursorom miša prešlo iz jedne ćelije u drugu, menja status te ćelije u koju se prešlo; ondragstart='return false' sprečava pravi mouse-dragging, jer bi on zbrljao stvari
			var life = false; // privremena varijabla u kojoj čuvamo status koji treba da ima trenutna ćelija (ćelija živa – true; ćelija mrtva – false)
			switch(content) {
				case 0: // žive i mrtve ćelije treba da budu random raspoređene
					b = 0.08 * document.getElementById("density").value; // "density" predstavlja meru gustine random raspoređenih živih ćelija
					if (Math.random() < b) {
						life = true;
					}
					break;
				// case 1 (sve bele ćelije) možemo preskočiti, jer varijabla life tada za svaku ćeliju zadržava već postojeću vrednost false
				case 2: // sve ćelije tabele treba da budu crna (živa)
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
			if(life) { // ako trenutna ćelija treba da bude živa...
				a += " class='alive'"; // ...unošenje stila za prikaz žive ćelije tabele
				cellsArray[0][cellID] = 1; // ...i unošenje jedinice u odgovarajući član globalnog niza cellsArray[] ([0] označava nulti korak simulacije)
			} else { // a ako trenutna ćelija treba da bude mrtva...
				a += " class='dead'"; // ...unošenje stila za prikaz mrtve ćelije tabele
				cellsArray[0][cellID] = 0; // ...i unošenje nule u odgovarajući član globalnog niza cellsArray[] ([0] označava nulti korak simulacije)
			}
			a += "></td>"; // na kraju svake ćelije tabele (tj. nakon prolaza kroz svaku unutrašnju petlju) dodajemo zatvarajući HTML-tag za ćeliju tabele
		}
		a += "</tr>"; // na kraju svakog reda tabele (tj. nakon prolaza kroz svaku spoljašnju petlju) dodajemo zatvarajući HTML-tag za red tabele
	}
	document.getElementById("table").innerHTML=a; // unošenje HTML-koda za celu tabelu
}

function mouseDown(x) { // ako je levi taster miša pritisnut unutar tabele, dok je kursor na ćeliji pod rednim brojem x, menja se status te ćelije i flag mousedown se postavlja na TRUE.
	mousedown = true;
	changeCell(x)
}

function mouseUp() { // ako je levi taster miša otpušten, flag mousedown treba vratiti na FALSE
	mousedown = false;
}

function mouseEnter(x) { // ukoliko se, dok je levi taster miša pritisnut (tj. flag mousedown postavljen na TRUE), kursorom miša prešlo iz jedne u drugu ćeliju tabele koja je pod rednim brojem x, tada ćelija u koju se došlo menja svoj status
	if (mousedown) {
		changeCell(x)
	}
}

function checkCell(x) { // vrednost funkcije je 0 ako je ćelija pod rednim brojem x mrtva, a 1 ako je živa
	if(document.getElementById(x).className == 'alive' || document.getElementById(x).className == 'revived') {
		return 1;
	} else {
		return 0;
	}
}

function changeCell(x) { // promena statusa ćelije pod rednim brojem x – ako je bila živa postaje mrtva, a ako je bila mrtva postaje živa
	if (checkCell(x)==1) {
		document.getElementById(x).className = 'dead';
	} else {
		document.getElementById(x).className = 'alive';
	}
	cellsArray[counter][x] = 1 - (cellsArray[counter][x] % 2); // promena vrednosti trenutnog člana niza – ako je bio 0 (mrtvo) ili 2 (upravo umrlo), dobija vrednost 1 (živo); ako je bio 1 (živo) ili 3 (upravo oživljeno), dobija vrednost 0 (mrtvo)
}

function inverse() { // zamena svih živih ćelija mrtvima i obratno
	if (document.getElementById("counter").innerHTML != "") { // ukoliko je brojač prikazan...
		counter = 0; // ...resetovanje brojača...
		dispCounter(); // ...i njegovo ponovno prikazivanje
	}
	for (i = 1; i <= p; i++) { // petlja po ćelijama tabele (ćelija ima p=m*n)
		changeCell(i); // promena statusa trenutne ćelije tabele
	}
}

function newStatus(x, neighbours) { // vrednost funkcije predstavlja novi status ćelije (0 – mrtva, 1 – živa, 2 – upravo umrla, 3 – upravo oživela), u zavisnosti od njenog prethodnog statusa (x) i broja živih suseda (neighbours)
	if (checkCell(x) == 0 || checkCell(x) == 2) { // ukoliko je posmatrana ćelija mrtva...
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

function oneStep() { // aktivira se pritiskom na „FRAME ADVANCE“ dugme ili na njegov keyboard shorcut; služi da se dugme „PREVIOUS FRAME“ aktivira pre pozivanja glavne funkcije step()
	reverseAct(); // aktivacija dugmeta „REVERSE“
	stepRevAct(); // aktivacija dugmeta „PREVIOUS FRAME“
	step(); // izvršavanje koraka simulacije
}

function step() { // korak simulacije
	// prikazivanje rednog broja koraka simulacije
	counter++; // uvećavanje koraka simulacije za jedan...
	dispCounter(); // ...a zatim prikazivanje rednog broja trenutnog koraka

	cellsArray[counter] = []; // niz u kojem će se čuvati statusi polja tabele za trenutni korak simulacije

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

function dispCounter() { // prikazivanje rednog broja koraka simulacije (na osnovu sadržaja globalne varijable counter)
	document.getElementById("counter").innerHTML = langArray["step count"] + " <span class='counter'>" + counter + "</span>";
}

function displayNew() { // prikazuje sadržaj tabele na osnovu podataka smeštenih u globalnom nizu cellsArray[]
	var status; // privremena varijabla za smeštanje statusa trenutne ćelije tabele
	for (i = 1; i <= p; i++) { // petlja po članovima niza (niz ima p=m*n članova, tj. onoliko koliko ima ćelija tabele)
		if (document.getElementById("changes").checked) { // ukoliko je uključena opcija da se promene prikazuju bojama...
			status = cellsArray[counter][i]; // ...tada uzimamo nepromenjenu vrednost člana niza
		} else { // u suprotnom, ako je isključena opcija da se promene prikazuju bojama...
			status = cellsArray[counter][i] % 2; // ... tada uzimamo ostatak pri deljenju sa 2 (0 ostaje 0, 1 ostaje 1, 2 postaje 0, 3 postaje 1)
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

function displayNewWhileStopPause() { // ova funkcija se pokreće ukoliko je u toku režima „STOP“ ili „PAUSE“ uključena ili isključena opcija da se promene prikazuju u boji (u toku režima „STOP“ može biti potrebe za ovom funkcijom u slučaju da je simulacija pokrenuta dugmetom „FRAME ADVANCE“, pri čemu se ostalo u „STOP“ modu)
	if (mode != 1) { // ako je trenutni radni režim „STOP“ ili „PAUSE“
		displayNew(); // pozvati funkciju koja prikazuje sadržaj tabele na osnovu podataka smeštenih u globalnom nizu cellsArray[]
	}
}

function stepRev() { // vraća simulaciju za jedan korak
	counter--; // umanjujemo brojač koraka simulacije za jedan
	if (counter == 0) { // ako smo stigli do nultog koraka simulacije...
		reverseDeact(); // ...deaktiviramo dugme za vraćanje simulacije unazad
		stepRevDeact(); // takođe deaktiviramo dugme za prethodni korak simulacije
		// zaustavljanje radne petlje
		if (runLoop != 0) {
			clearInterval(runLoop);
			runLoop = 0;
		}
		clearInterval(ledLoop); // zaustavlja se treperenje diode...
		ledLoop = 0; // ...i varijabla timing-eventa treperenja se postavlja na nulu
		document.getElementById("led").className = "led-off"; // LED se isključuje
		document.getElementById("start").getElementsByTagName("img")[0].src = playButton; // na aktivacionom dugmetu prikazuje se oznaka „PLAY“
		document.getElementById("start-tip").innerHTML = langArray["start tip"]; // help tip se postavlja na „pokretanje simulacije“
		afterReverse(); // reaktivacija dugmadi i opcija nakon završetka režima „REVERSE“
		mode = 0; // prelazi se u režim „STOP“
	}
	dispCounter(); // prikazivanje brojača koraka
	displayNew(); // prikazivanje stanja tabele u trenutnom koraku
}

function reverse() { // vraća simulaciju unazad
	if (mode != 1 && mode != 3 && counter > 0) { // komanda za reverse sa prihvata samo u režimima „STOP“ i „PAUSE“ i to u slučaju da je izvršen bar jedan korak simulacije
		// deaktivacija dugmadi koja ne mogu biti korišćena tokom vraćanja simulacije unazad
		document.getElementById("random").className = "deact"; // deaktiviranje help-tipa za regulator gustine random rasporeda
		document.getElementById("density").disabled = true;
		document.getElementsByClassName("commands1")[0].getElementsByTagName("ul")[0].className = "deact"; // deaktiviranje help-tipa za tastere predefinisanih sadržaja
		document.getElementById("white").disabled = true;
		document.getElementById("black").disabled = true;
		document.getElementById("hor").disabled = true;
		document.getElementById("vert").disabled = true;
		document.getElementById("diag").disabled = true;
		document.getElementById("chess").disabled = true;
		document.getElementById("inverse").disabled = true;
		stepRevDeact(); // deaktivacija dugmeta „PREVIOUS FRAME“
		stepDeact(); // deaktivacija dugmeta „FRAME ADVANCE“
		document.getElementById("edge").className = "deact";
		document.getElementById("edge1").disabled = true;
		document.getElementById("edge2").disabled = true;

		clearInterval(ledLoop); // zaustavlja se treperenje diode iz režima „PAUSE“...
		ledLoop = 0; // ...i varijabla timing-eventa treperenja se postavlja na nulu
		ledFlag = 0; // pre ulaska u petlju za treperenje postavljamo indikator da je LED isključena
		ledLoop = setInterval(ledBlink, 170); // petlja za treperenje LED-diode, s periodom od 170ms

		mode = 3; // mode varijabla se postavlja na vrednost koja označava režim „REVERSE“
		document.getElementById("start").getElementsByTagName("img")[0].src = pauseButton; // na aktivacionom dugmetu se prikazuje simbol "PAUSE"
		document.getElementById("start-tip").innerHTML = langArray["pause tip"]; // help tip se postavlja na „pauziranje simulacije“
		a = document.getElementById("speed").value; // podešavanje brzine na osnovu položaja klizača brzine
		runLoop = setInterval(stepRev, 1361 - 150 * a); // ponavljanje radne petlje
	}
}

function afterReverse() { // reaktivacija dugmadi i opcija nakon završetka režima „REVERSE“
	document.getElementById("random").className = ""; // aktiviranje help-tipa za regulator gustine random rasporeda
	document.getElementById("density").disabled = false;
	document.getElementsByClassName("commands1")[0].getElementsByTagName("ul")[0].className = ""; // aktiviranje help-tipa za tastere predefinisanih sadržaja
	document.getElementById("white").disabled = false;
	document.getElementById("black").disabled = false;
	document.getElementById("hor").disabled = false;
	document.getElementById("vert").disabled = false;
	document.getElementById("diag").disabled = false;
	document.getElementById("chess").disabled = false;
	document.getElementById("inverse").disabled = false;
	document.getElementById("step").disabled = false;
	stepAct(); // aktivacija dugmeta „FRAME ADVANCE“
	document.getElementById("edge").className = "";
	document.getElementById("edge1").disabled = false;
	document.getElementById("edge2").disabled = false;
}

function setSpeed() { // podešavanje brzine na osnovu položaja klizača brzine i ponavljanje radne petlje
	a = document.getElementById("speed").value; // podešavanje brzine na osnovu položaja klizača brzine
	b = 1361 - 150 * a;
	if (mode == 1) {
		runLoop = setInterval(step, b); // ponavljanje radne petlje (za režim „PLAY“)
	} else {
		runLoop = setInterval(stepRev, b); // ponavljanje radne petlje (za režim „REVERSE“)
	}
}

function run() { // Prelazak u režim „PLAY“ ili „PAUSE“
	if (mode == 1 || mode == 3) { // ako je režim bio „PLAY“ ili „REVERSE“, prelazak u režim „PAUSE“
		clearInterval(runLoop); // zaustavlja se radna petlja
		document.getElementById("start").getElementsByTagName("img")[0].src = playPauseButton; // na aktivacionom dugmetu se prikazuju simboli "PLAY" i "PAUSE"
		document.getElementById("start-tip").innerHTML = langArray["cont tip"]; // help tip se postavlja na „nastavljanje simulacije“
		document.getElementById("step").disabled = false; // ponovo se aktivira dugme „FRAME ADVANCE“ (koje je bilo deaktivirano tokom režima „PLAY“)
		document.getElementById("step").getElementsByTagName("img")[0].src = stepButton; // ponovo se aktivira i slika njegovog simbola na tasteru
		document.getElementById("step-tip").className = "tip"; // samim tim, pošto je dugme aktivirano, treba da se hoverom na njega ispisuje i help tip
		if (counter > 0) { // ukoliko nismo na nultom koraku simulacije...
			reverseAct(); // ...aktivacija dugmeta za vraćanje simulacije unazad
			stepRevAct(); // takođe, aktivacija dugmeta za prethodni korak simulacije
		}
		document.getElementById("led").className = "led-off"; // LED se isključuje pre započinjanja treperućeg režima
		if (mode = 3) { // ako je režim bio „REVERSE“...
			clearInterval(ledLoop); // ...zaustavlja se treperenje diode...
			ledLoop = 0; // ...i varijabla timing-eventa treperenja se postavlja na nulu
			afterReverse(); // reaktivacija dugmadi i opcija nakon završetka režima „REVERSE“
		}
		ledFlag = 0; // pre ulaska u petlju za treperenje postavljamo indikator da je LED isključena
		ledLoop = setInterval(ledBlink, 500); // petlja za treperenje LED-diode, s periodom od 500ms
		mode = 2; // flag radnog režima se postavlja na vrednost koji označava režim „PAUSE“
	}
	else { // Ako je režim bio „STOP“ ili „PAUSE“, onda prelazak u režim „PLAY“
		if (mode == 2) { // u slučaju da je režim bio „PAUSE“...
			clearInterval(ledLoop); // ...zaustavlja se treperenje diode...
			ledLoop = 0; // ...i varijabla timing-eventa treperenja se postavlja na nulu
		}
		mode = 1; // flag radnog režima se postavlja na vrednost koji označava režim „PLAY“
		document.getElementById("start").getElementsByTagName("img")[0].src = pauseButton; // na aktivacionom dugmetu se prikazuje simbol "PAUSE"
		document.getElementById("start-tip").innerHTML = langArray["pause tip"]; // help tip se postavlja na „pauziranje simulacije“
		document.getElementById("led").className = "led-on"; // LED se uključuje
		document.getElementById("step").disabled = true; // za vreme režima „PLAY“, dugme „FRAME ADVANCE“ je deaktivirano
		document.getElementById("step").getElementsByTagName("img")[0].src = stepButtonDisabled; // deaktivira se i slika njegovog simbola na tasteru
		document.getElementById("step-tip").className = "tip-deact"; // samim tim, pošto je dugme deaktivirano, hoverom na njega ne treba da se ispisuje help tip
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
	document.getElementById("step-rev-tip").className = "tip"; // samim tim, pošto je dugme aktivirano, treba da se hoverom na njega ispisuje i help tip
}

// deaktivacija dugmeta „PREVIOUS FRAME“
function stepRevDeact() {
	document.getElementById("step-rev").disabled = true; // deaktivira se dugme „PREVIOUS FRAME“
	document.getElementById("step-rev").getElementsByTagName("img")[0].src = stepRevButtonDisabled; // deaktivira se i slika njegovog simbola na tasteru
	document.getElementById("step-rev-tip").className = "tip-deact"; // samim tim, pošto je dugme deaktivirano, hoverom na njega ne treba da se ispisuje help tip
}

// aktivacija dugmeta „REVERSE“
function reverseAct() {
	document.getElementById("reverse").disabled = false; // aktivira se dugme „REVERSE“
	document.getElementById("reverse").getElementsByTagName("img")[0].src = reverseButton; // aktivira se i slika njegovog simbola na tasteru
	document.getElementById("reverse-tip").className = "tip"; // samim tim, pošto je dugme aktivirano, treba da se hoverom na njega ispisuje i help tip
}

// deaktivacija dugmeta „REVERSE“
function reverseDeact() {
	document.getElementById("reverse").disabled = true; // deaktivira se dugme „REVERSE“
	document.getElementById("reverse").getElementsByTagName("img")[0].src = reverseButtonDisabled; // deaktivira se i slika njegovog simbola na tasteru
	document.getElementById("reverse-tip").className = "tip-deact"; // samim tim, pošto je dugme deaktivirano, hoverom na njega ne treba da se ispisuje help tip
}

// aktivacija dugmeta „FRAME ADVANCE“
function stepAct() {
	document.getElementById("step").disabled = false; // aktivira se dugme „FRAME ADVANCE“
	document.getElementById("step").getElementsByTagName("img")[0].src = stepButton; // aktivira se i slika njegovog simbola na tasteru
	document.getElementById("step-tip").className = "tip"; // samim tim, pošto je dugme aktivirano, treba da se hoverom na njega ispisuje i help tip
}

// deaktivacija dugmeta „FRAME ADVANCE“
function stepDeact() {
	document.getElementById("step").disabled = true; // deaktivira se dugme „FRAME ADVANCE“
	document.getElementById("step").getElementsByTagName("img")[0].src = stepButtonDisabled; // deaktivira se i slika njegovog simbola na tasteru
	document.getElementById("step-tip").className = "tip-deact"; // samim tim, pošto je dugme deaktivirano, hoverom na njega ne treba da se ispisuje help tip
}

function ledBlink() { // treperenje LED-diode u režimu „PAUSE“
	if (ledFlag == 1) { // ukoliko je LED uključena...
		document.getElementById("led").className = "led-off"; // ...isključuje se...
		ledFlag = 0; // ...i indikator uključene LED se postavlja na nulu
	} else { // u suprotnom, ako je LED isključena...
		document.getElementById("led").className = "led-on"; // ...uključuje se...
		ledFlag = 1; // ...i indikator uključene LED se postavlja na jedinicu
	}
}

function changeSpeed() { // promena brzine u toku simulacije
	if (mode == 1 || mode == 3) { // izvršava se jedino u režimu „PLAY“ ili u režimu „REVERSE“
		clearInterval(runLoop); // prekida se dosadašnja radna petlja...
		setSpeed(); // ...i startuje nova, s novopodešenom brzinom
	}
}

function changeEdgeMode(newEdge) { // 
	edge = newEdge;
}

// ispunjavanje niza natpisima i porukama na engleskom jeziku
function english() {
	langArray = []; // niz u kojem se čuvaju natpisi i poruke na engleskom jeziku
	
	// naslov
	langArray["title"] = "The Game of Life";
	
	// natpisi
	langArray["step count"] = "Step count:";
	langArray["rand"] = "Random layout:";
	langArray["thin"] = "thin";
	langArray["thick"] = "thick";
	langArray["all whites"] = "All whites";
	langArray["all blacks"] = "All blacks";
	langArray["hbars"] = "Horizontal bars";
	langArray["vbars"] = "Vertical bars";
	langArray["dbars"] = "Diagonal bars";
	langArray["chess"] = "Chess layout";
	langArray["inverse"] = "Inverse layout";
	langArray["slow"] = "slow";
	langArray["fast"] = "fast";
	langArray["changes in color"] = "Status changes<br />are displayed in color";
	langArray["edge"] = "Table edges behavior";
	
	// poruke
	langArray["random tip"] = "Regulator for the black (alive)<br />cells density in the initial step.<ul><li>Leftmost position – minimal density;</li><li>Rightmost position – maximal density;</li></ul>Keyboard shortcuts: <span class='keyshort'>1–9</span><ul><li>key 1 – minimal density</li><li>key 9 – maximal density</li></ul>";
	langArray["white tip"] = "Populating the table with<br />all the white (dead) cells.<br />Keyboard shortcut: <span class='keyshort'>A</span>";
	langArray["black tip"] = "Populating the table with<br />all the black (alive) cells.<br />Keyboard shortcut: <span class='keyshort'>S</span>";
	langArray["hor tip"] = "The arrangement of the<br />alive and the dead cells<br />in the form of horizontal bars<br />(every odd row – alive cells;<br />every even row – dead cells).<br />Keyboard shortcut: <span class='keyshort'>D</span>";
	langArray["vert tip"] = "The arrangement of the<br />alive and the dead cells<br />in the form of vertical bars<br />(every odd column – alive cells;<br />every even column – dead cells).<br />Keyboard shortcut: <span class='keyshort'>F</span>";
	langArray["diag tip"] = "The arrangement of the<br />alive and the dead cells<br />in the form of diagonal bars.<br />Keyboard shortcut: <span class='keyshort'>G</span>";
	langArray["chess tip"] = "The arrangement of the alive<br />and the dead cells in the<br />form of a chessboard fields.<br />Keyboard shortcut: <span class='keyshort'>H</span>";
	langArray["inverse tip"] = "Replaces all the black (live) cells with<br />the white (dead) cells and vice versa;<br />after this, the simulation step counter<br />returns to zero, since hereby<br />the new simulation is started.<br />Keyboard shortcut: <span class='keyshort'>I</span>";
	langArray["reverse tip"] = "Starts the simulation backwards.<br />Keyboard shortcut: <span class='keyshort'>X</span>";
	langArray["step rev tip"] = "Goes back one<br />simulation step.<br />Keyboard shortcut: <span class='keyshort'>C</span>";
	langArray["step tip"] = "Executes one<br />simulation step.<br />Keyboard shortcut: <span class='keyshort'>V</span>";
	langArray["start tip"] = "Starts the simulation.<br />Keyboard shortcut: <span class='keyshort'>B</span>";
	langArray["pause tip"] = "Pauses the simulation.<br />Keyboard shortcut: <span class='keyshort'>B</span>";
	langArray["cont tip"] = "Continues the simulation.<br />Keyboard shortcut: <span class='keyshort'>B</span>";
	langArray["led tip"] = 'Mode LED-indicator:<ul><li>off: "STOP" mode</li><li>on: "PLAY" mode</li><li>slow blinking: "PAUSE" mode</li><li>fast blinking: "REVERSE" mode</li></ul>';
	langArray["speed tip"] = "Simulation speed regulator:<ul><li>Leftmost position – minimal speed</li><li>Rightmost position – maximal speed</li></ul>Keyboard shortcuts:<br /><ul><li><span class='keyshort'>N</span> (reduces speed)</li><li><span class='keyshort'>M</span> (increase speed)</li></ul>";
	langArray["changes tip"] = "When unchecked, the cells are<br />displayed in two colors:<ul><li>black: alive</li><li>white: dead</li></ul>Checking this option adds two<br />more colors:<ul><li>blue: the cell has just revived</li><li>yellow: the cell has just died</li></ul>Keyboard shortcut: <span class='keyshort'>K</span>";
	langArray["edge tip"] = "The way cells located on the edges<br />of the table behave:<ul><li>mode 1: the table edges act like<br />real, physical walls – there's no<br />anything behind them;</li><li>mode 2: behind the right edge<br />there's the left edge of the table,<br />behind the bottom edge there's<br />the top edge of the table and<br />so on. In other words, the table<br />can be observed as a surface of<br />the sphere, whereby it's right<br />edge is joined with the left edge,<br />likewise the bottom with the top<br />edge.</li></ul>Keyboard shortcut: <span class='keyshort'>L</span>";
	
	// help
	langArray["help"] = "<p>The Game of Life is a very popular game demonstrating how it's possible to obtain ordered structures from an initial chaos, when a few simple rules are obeyed.</p><p>The main object in this game is a table consisting of alive (black) and dead (white) cells, whereby each cell is surrounded by eight other (living or dead) cells. At the very beginning, we arrange the alive and dead cells in a desired, arbitrary way. Some of the predefined layouts can be obtained using the available buttons (All whites, All blacks...), combining with activating/deactivating some cells with the left mouse button, which makes it possible to manualy draw some objects. There is, also, an option of generating a random layout (with the random slider).</p><p>After setting up the table, the simulation can be run in two ways – by going step by step pressing the "+'"'+"one-step"+'"'+" button for every new simulation step, or by pressing the "+'"'+"start"+'"'+" button which runs the automated simulation.</p><p>The rules the simulation is based on are the following:<ul><li>if a cell is surrounded by less than two alive cells, or is surrounded by more than three alive cells, in the next step it's dead due to the loneliness (in the first case), or due to the overpopulation (in the second case);</li><li>if a cell is surrounded by exactly two alive cells, in the next step it doesn't change its status (the alive cell stays alive, the dead cell stays dead);</li><li>if a cell is surrounded by exactly three alive cells, in the next step it's alive.</li></ul><p>Or, from the standpoint of cell's survival, these rules can be formulated in a slightly different form:</p><ul><li>if a cell is dead, in the next step it becomes alive if and only if it's surrounded by exactly three alive cells;</li><li>if a cell is alive, in the next step it stays alive if and only if it's surrounded by exactly two or by exactly three alive cells.</li></ul></p><p>Keyboard shortcuts:</p><ul>Populating the table with predefined content:<li><span class='keyshort'>1–9</span> – random layout – 1 is for the minimal density, 9 is for the maximal density;</li><li><span class='keyshort'>A</span> – all white cells;</li><li><span class='keyshort'>S</span> – all black cells;</li><li><span class='keyshort'>D</span> – a form of horizontal bars;</li><li><span class='keyshort'>F</span> – a form of vertical bars;</li><li><span class='keyshort'>G</span> – a form of diagonal bars;</li><li><span class='keyshort'>H</span> – a chess-shaped form;</li><li><span class='keyshort'>I</span> – making the inverse of the current layout.</li></ul><ul>Commands:<li><span class='keyshort'>X</span> – runs the simulation backwards;</li><li><span class='keyshort'>C</span> – one simulation step back;</li><li><span class='keyshort'>V</span> – one simulation step advance;</li><li><span class='keyshort'>B</span> – running/pausing the simulation;</li><li><span class='keyshort'>N</span> – slowing down the simulation running;</li><li><span class='keyshort'>M</span> – accelerating the simulation running;</li><li><span class='keyshort'>K</span> – status changes are displayed in color;</li><li><span class='keyshort'>L</span> – table edges behavior.</li></ul><p>A detailed description of a particular option can be seen by hovering a button/regulator/checkbox for that option.</p>";
	
	document.getElementById("eng").className = "selected"; // simbol izabranog jezika treba da bude uokviren i da na njemu kursor miša bude default
	document.getElementById("srb").className = ""; // simbol neizabranog jezika treba da bude neuokviren i da na njemu kursor miša bude pointer
	writeLang(langArray); // pozivanje funkcija za prikaz natpisa i poruka
}

// ispunjavanje niza natpisima i porukama na srpskom jeziku
function serbian() {
	langArray = []; // niz u kojem se čuvaju natpisi i poruke na srpskom jeziku
	
	// naslov
	langArray["title"] = "Igra života";
	
	// natpisi
	langArray["step count"] = "Redni broj koraka:";
	langArray["rand"] = "Random raspored:";
	langArray["thin"] = "retko";
	langArray["thick"] = "gusto";
	langArray["all whites"] = "Sve bele";
	langArray["all blacks"] = "Sve crne";
	langArray["hbars"] = "Horizontalne pruge";
	langArray["vbars"] = "Vertikalne pruge";
	langArray["dbars"] = "Dijagonalne pruge";
	langArray["chess"] = "Šahovski raspored";
	langArray["inverse"] = "Inverzan raspored";
	langArray["slow"] = "sporo";
	langArray["fast"] = "brzo";
	langArray["changes in color"] = "Promene statusa se<br />prikazuju u boji";
	langArray["edge"] = "Ponašanje ivica tabele";
	
	// poruke
	langArray["random tip"] = "Regulator gustine crnih (živih) ćelija<br />u početnom koraku.<ul><li>Krajnji levi položaj – najmanja gustina;</li><li>Krajnji desni položaj – najveća gustina;</li></ul>Prečice na tastaturi: <span class='keyshort'>1–9</span><ul><li>taster 1 – najmanja gustina</li><li>taster 9 – najveća gustina</li></ul>";
	langArray["white tip"] = "Popunjavanje tabele svim<br />belim (mrtvim) ćelijama.<br />Prečica na tastaturi: <span class='keyshort'>A</span>";
	langArray["black tip"] = "Popunjavanje tabele svim<br />crnim (živim) ćelijama.<br />Prečica na tastaturi: <span class='keyshort'>S</span>";
	langArray["hor tip"] = "Raspoređivanje živih i mrtvih ćelija<br />u vidu horizontalnih pruga<br />(svaki neparni red – žive ćelije;<br />svaki parni red – mrtve ćelije).<br />Prečica na tastaturi: <span class='keyshort'>D</span>";
	langArray["vert tip"] = "Raspoređivanje živih i mrtvih ćelija<br />u vidu vertikalnih pruga<br />(svaka neparna kolona – žive ćelije;<br />svaka parna kolona – mrtve ćelije).<br />Prečica na tastaturi: <span class='keyshort'>F</span>";
	langArray["diag tip"] = "Raspoređivanje živih i mrtvih ćelija<br />u vidu dijagonalnih pruga.<br />Prečica na tastaturi: <span class='keyshort'>G</span>";
	langArray["chess tip"] = "Raspoređivanje živih<br />i mrtvih ćelija u vidu<br />polja na šahovskoj tabli.<br />Prečica na tastaturi: <span class='keyshort'>H</span>";
	langArray["inverse tip"] = "Zamena svih crnih (živih) ćelija<br />belim (mrtvim) ćelijama i obratno;<br />nakon ovoga, brojač koraka<br />simulacije se vraća na nulu,<br />budući da ovime počinje<br />nova simulacija.<br />Prečica na tastaturi: <span class='keyshort'>I</span>";
	langArray["reverse tip"] = "Vraćanje simulacije unazad.<br />Prečica na tastaturi: <span class='keyshort'>X</span>";
	langArray["step rev tip"] = "Vraćanje za jedan<br />korak simulacije.<br />Prečica na tastaturi: <span class='keyshort'>C</span>";
	langArray["step tip"] = "Izvršavanje jednog<br />koraka simulacije.<br />Prečica na tastaturi: <span class='keyshort'>V</span>";
	langArray["start tip"] = "Pokretanje simulacije.<br />Prečica na tastaturi: <span class='keyshort'>B</span>";
	langArray["pause tip"] = "Pauziranje simulacije.<br />Prečica na tastaturi: <span class='keyshort'>B</span>";
	langArray["cont tip"] = "Nastavljanje simulacije.<br />Prečica na tastaturi: <span class='keyshort'>B</span>";
	langArray["led tip"] = "Indikator režima rada:<ul><li>isključeno: režim „STOP“</li><li>uključeno: režim „PLAY“</li><li>sporo treperenje: režim „PAUSE“</li><li>brzo treperenje: režim „REVERSE“</li></ul>";
	langArray["speed tip"] = "Regulator brzine simulacije:<ul><li>Krajnji levi položaj – najmanja brzina</li><li>Krajnji desni položaj – najveća brzina</li></ul>Prečice na tastaturi:<br /><ul><li><span class='keyshort'>N</span> (smanjivanje brzine)</li><li><span class='keyshort'>M</span> (povećavanje brzine)</li></ul>";
	langArray["changes tip"] = "Kada je ova opcija isključena,<br />ćelije se prikazuju u dve boje:<ul><li>crna: živa</li><li>bela: mrtva</li></ul>Uključenjem ove opcije dodaju se<br />dve nove boje:<ul><li>plava: ćelija je upravo oživela</li><li>žuta: ćelija je upravo umrla</li></ul>Prečica na tastaturi: <span class='keyshort'>K</span>";
	langArray["edge tip"] = "Način na koji se ponašaju ćelije<br />locirane na ivicama tabele:<ul><li>mode 1: ivice tabele se ponašaju<br />kao pravi, fizički zidovi – ne postoji<br />ništa iza njih;</li><li>mode 2: iza desne ivice nalazi se<br />leva ivica tabele, iza donje ivice<br />nalazi se gornja ivica tabele itd.<br />Drugim rečima, tabela se može<br />posmatrati kao površina sfere,<br />pri čemu je njena desna ivica<br />spojena s desnom ivicom, isto<br />tako donja s gornjom ivicom.</li></ul>Prečica na tastaturi: <span class='keyshort'>L</span>";
	
	// help
	langArray["help"] = "<p>Igra života je veoma popularna igra koja demonstrira kako je moguće iz početnog haosa dobiti uređene strukture, kada je ispunjeno nekoliko jednostavnih pravila.</p><p>Glavni objekt ove igre je tabela koja se sastoji od živih (crnih) i mrtvih (belih) ćelija, pri čemu je svaka ćelija okružena sa osam drugih (živih ili mrtvih) ćelija. Na samom početku, raspoređujemo žive i mrtve ćelije na željen, proizvoljan način. Neki od predefinisanih rasporeda mogu se postići upotrebom dostupnih dugmeta (Sve bele, Sve crne...), u kombinaciji s aktiviranjem/deaktiviranjem nekih ćelija levim klikom miša, čime je omogućeno ručno crtanje nekih objekata. Postoji, takođe, opcija generisanja random rasporeda (pomoću random klizača).</p><p>Nakon postavljanja tabele, simulacija se može izvršiti na dva načina – idući korak po korak pritiskanjem „one-step“ dugmeta za svaki novi korak simulacije, ili pritiskom na „start“ dugme čime se pokreće automatizovana simulacija.</p><p>Pravila po kojima se simulacija izvršava jesu sledeća:<ul><li>ako je ćelija okružena s manje od dve žive ćelije, ili je okružena s više od tri žive ćelije, u sledećem koraku ona je mrtva usled usamljenosti (u prvom slučaju), ili usled prenaseljenosti (u drugom slučaju);</li><li>ako je ćelija okružena s tačno dve žive ćelije, u sledećem koraku ne menja svoj status (živa ćelija ostaje živa, mrtva ćelija ostaje mrtva);</li><li>ako je ćelija okružena s tačno tri žive ćelije, u sledećem koraku ona je živa.</li></ul><p>Ili, sa stanovišta opstanka ćelije, ova pravila se mogu formulisati u nešto drugačijem obliku:</p><ul><li>ako je ćelija mrtva, u sledećem koraku ona oživljava ako i samo ako je okružena s tačno tri žive ćelije;</li><li>ako je ćelija živa, u sledećem koraku ona ostaje živa ako i samo ako je okružena s tačno dve ili s tačno tri žive ćelije.</li></ul></p><p>Prečice na tastaturi:</p><ul>Popunjavanje tabele predefinisanim sadržajem:<li><span class='keyshort'>1–9</span> – random raspored – 1 je za najmanju gustinu, 9 je za najveću gustinu;</li><li><span class='keyshort'>A</span> – sve bele ćelije;</li><li><span class='keyshort'>S</span> – sve crne ćelije;</li><li><span class='keyshort'>D</span> – raspored u vidu horizontalnih pruga;</li><li><span class='keyshort'>F</span> – raspored u vidu vertikalnih pruga;</li><li><span class='keyshort'>G</span> – raspored u vidu dijagonalnih pruga;</li><li><span class='keyshort'>H</span> – raspored u vidu šahovskih polja;</li><li><span class='keyshort'>I</span> – pravljenje inverznog rasporeda u odnosu na trenutni.</li></ul><ul>Komande:<li><span class='keyshort'>X</span> – pokretanje simulacije unazad;</li><li><span class='keyshort'>C</span> – jedan korak simulacije nazad;</li><li><span class='keyshort'>V</span> – jedan korak simulacije napred;</li><li><span class='keyshort'>B</span> – pokretanje/pauziranje simulacije;</li><li><span class='keyshort'>N</span> – usporavanje simulacije;</li><li><span class='keyshort'>M</span> – ubrzavanje simulacije;</li><li><span class='keyshort'>K</span> – promene statusa se prikazuju u boji;</li><li><span class='keyshort'>L</span> – ponašanje ivica tabele.</li></ul><p>Detaljan opis svake opcije može se videti prelaskom kursora miša preko dugmeta/regulatora/checkboxa za tu opciju.</p>";
	
	document.getElementById("srb").className = "selected"; // simbol izabranog jezika treba da bude uokviren i da na njemu kursor miša bude default
	document.getElementById("eng").className = ""; // simbol neizabranog jezika treba da bude neuokviren i da na njemu kursor miša bude pointer
	writeLang(langArray); // pozivanje funkcija za prikaz natpisa i poruka
}

function writeLang() { // prikazivanje natpisa i poruka na izabranom jeziku, na osnovu sadržaja niza langArray[]
	
	// naslov
	document.getElementsByTagName("title")[0].innerHTML = langArray["title"];
	document.getElementsByTagName("h1")[0].innerHTML = langArray["title"];
	
	// natpisi
	dispCounter();
	document.getElementById("rand").innerHTML = langArray["rand"];
	document.getElementById("rand-thin").innerHTML = langArray["thin"];
	document.getElementById("rand-thick").innerHTML = langArray["thick"];
	document.getElementById("white").innerHTML = langArray["all whites"];
	document.getElementById("black").innerHTML = langArray["all blacks"];
	document.getElementById("hor").innerHTML = langArray["hbars"];
	document.getElementById("vert").innerHTML = langArray["vbars"];
	document.getElementById("diag").innerHTML = langArray["dbars"];
	document.getElementById("chess").innerHTML = langArray["chess"];
	document.getElementById("inverse").innerHTML = langArray["inverse"];
	document.getElementById("slow").innerHTML = langArray["slow"];
	document.getElementById("fast").innerHTML = langArray["fast"];
	document.getElementById("changes-in-color").innerHTML = langArray["changes in color"];
	document.getElementById("edge").getElementsByTagName("span")[0].innerHTML = langArray["edge"];
	
	// poruke
	document.getElementById("random-tip").innerHTML = langArray["random tip"];
	document.getElementById("white-tip").innerHTML = langArray["white tip"];
	document.getElementById("black-tip").innerHTML = langArray["black tip"];
	document.getElementById("hor-tip").innerHTML = langArray["hor tip"];
	document.getElementById("vert-tip").innerHTML = langArray["vert tip"];
	document.getElementById("diag-tip").innerHTML = langArray["diag tip"];
	document.getElementById("chess-tip").innerHTML = langArray["chess tip"];
	document.getElementById("inverse-tip").innerHTML = langArray["inverse tip"];
	document.getElementById("reverse-tip").innerHTML = langArray["reverse tip"];
	document.getElementById("step-rev-tip").innerHTML = langArray["step rev tip"];
	document.getElementById("step-tip").innerHTML = langArray["step tip"];
	switch(mode) { // help tip aktivacionog dugmeta se razlikuje u zavisnosti od toga da li je trenutni radni režim „STOP“, „PLAY“ ili „PAUSE“
		case 0: // ukoliko je trenutni radni režim „STOP“...
			document.getElementById("start-tip").innerHTML = langArray["start tip"]; // ...prikazuje se poruka „pokretanje simulacije“
			break;
		case 1: // ukoliko je trenutni radni režim „PLAY“...
			document.getElementById("start-tip").innerHTML = langArray["pause tip"]; // ...prikazuje se poruka „pauziranje simulacije“
			break;
		case 2: // ukoliko je trenutni radni režim „PAUSE“...
			document.getElementById("start-tip").innerHTML = langArray["cont tip"]; // ...prikazuje se poruka „nastavljanje simulacije“
			break;
		case 3: // ukoliko je trenutni radni režim „REVERSE“...
			document.getElementById("start-tip").innerHTML = langArray["pause tip"]; // ...prikazuje se poruka „pauziranje simulacije“
			break;
	}
	document.getElementById("led-tip").innerHTML = langArray["led tip"];
	document.getElementById("speed-tip").innerHTML = langArray["speed tip"];
	document.getElementById("changes-tip").innerHTML = langArray["changes tip"];
	document.getElementById("edge-tip").innerHTML = langArray["edge tip"];
	
	//help
	document.getElementById("help2").innerHTML = langArray["help"];
}

document.onkeypress = key;
function key(event) {
	var x = event.which || event.keyCode;
	if (x >= 49 && x <= 57 && mode != 3) { // pritisnut neki od tastera od 1 do 9, radi regulisanja gustine sadržaja (neaktivno u režimu „REVERSE“)
		document.getElementById("density").focus(); // stavljanje fokusa na regulator gustine sadržaja
		switch(x) {
			case 49: // taster „1“ za random raspored, s klizačem na položaju 1 (najređe raspoređene žive ćelije)
				document.getElementById("density").value = "1";
				drawTable(0);
				break;
			case 50: // taster „2“ za random raspored, s klizačem na položaju 2
				document.getElementById("density").value = "2";
				drawTable(0);
				break;
			case 51: // taster „3“ za random raspored, s klizačem na položaju 3
				document.getElementById("density").value = "3";
				drawTable(0);
				break;
			case 52: // taster „4“ za random raspored, s klizačem na položaju 4
				document.getElementById("density").value = "4";
				drawTable(0);
				break;
			case 53: // taster „5“ za random raspored, s klizačem na položaju 5
				document.getElementById("density").value = "5";
				drawTable(0);
				break;
			case 54: // taster „6“ za random raspored, s klizačem na položaju 6
				document.getElementById("density").value = "6";
				drawTable(0);
				break;
			case 55: // taster „7“ za random raspored, s klizačem na položaju 7
				document.getElementById("density").value = "7";
				drawTable(0);
				break;
			case 56: // taster „8“ za random raspored, s klizačem na položaju 8
				document.getElementById("density").value = "8";
				drawTable(0);
				break;
			case 57: // taster „9“ za random raspored, s klizačem na položaju 9 (najgušće raspoređene žive ćelije)
				document.getElementById("density").value = "9";
				drawTable(0);
				break;
		}
	}
	if (x == 110 || x == 109) {
		document.getElementById("speed").focus(); // stavljanje fokusa na odgovarajuće dugme
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
	if(mode !=3) { // komande koje su neaktivne tokom režima „REVERSE“
		switch(x) {
			case 108: // taster „L“ za izbor ponašanja ivica tabele
				if(edge) { // ako je bilo postavljeno na mode 1, prebaciti na mode 0
					document.getElementById("edge1").checked = true; // odabir odgovarajučeg radio-buttona
					document.getElementById("edge1").focus(); // stavljanje fokusa na odgovarajuće dugme
				} else { // u suprotnom (ako je bilo postavljeno na mode 0), prebaciti na mode 1
					document.getElementById("edge2").checked = true; // odabir odgovarajučeg radio-buttona
					document.getElementById("edge2").focus(); // stavljanje fokusa na odgovarajuće dugme
				}
				edge = 1 - edge;
				displayNewWhileStopPause();
				break;
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
			case 105: // taster „I“ za inverzni raspored (da sve bele ćelije postanu crne i obratno)
				inverse();
				document.getElementById("inverse").focus(); // stavljanje fokusa na odgovarajuće dugme
				break;
			case 120: // taster „X“ za simulaciju unazad
				if (mode != 1 && mode != 3 && counter > 0) { // u bilo kom režimu osim „STOP“ i „PAUSE“, kao i pre izvršenja prvog koraka simulacije, opcija za simulaciju unazad je onemogućena
					reverse();
					document.getElementById("reverse").focus(); // stavljanje fokusa na odgovarajuće dugme
				}
				break;
			case 99: // taster „C“ za vraćanje jednog koraka simulacije
				if (mode != 1 && mode != 3 && counter > 0) { // u bilo kom režimu osim „STOP“ i „PAUSE“, kao i pre izvršenja prvog koraka simulacije, opcija za jedan korak simulacije je onemogućena
					stepRev();
					document.getElementById("step-rev").focus(); // stavljanje fokusa na odgovarajuće dugme
				}
				break;
			case 118: // taster „V“ za izvršavanje jednog koraka simulacije
				if (mode != 1) { // u režimu „PLAY“ (mode=1) opcija za jedan korak simulacije je onemogućena
					oneStep();
					document.getElementById("step").focus(); // stavljanje fokusa na odgovarajuće dugme
				}
				break;
		}
	}
	switch(x) {
		case 98: // taster „B“ za pokretanje/pauziranje simulacije
			run();
			document.getElementById("start").focus(); // stavljanje fokusa na odgovarajuće dugme
			break;
		case 107: // taster „K“ da se promene statusa ćelija prikazuju u boji
			if(document.getElementById("changes").checked) {
				document.getElementById("changes").checked = false;
			} else {
				document.getElementById("changes").checked = true;
			}
			document.getElementById("changes").focus(); // stavljanje fokusa na odgovarajuće dugme
			displayNewWhileStopPause();
			break;
	}
}
