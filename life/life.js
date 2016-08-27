var m = 58; // broj redova tabele
var n = 80; // broj kolona tabele
var p = m * n; // broj polja tabele
var counter; // brojač koraka simulacije
var ledFlag; // indikator stanja LED-diode za vreme njenog blinkanja u režimu „PAUSE“ (0 – off; 1 – on)
var ledLoop = 0; // varijabla timing-eventa treperenja LED-diode u režimu „PAUSE“
var imgFolder = "images/"; // lokacija foldera za slike
var playButton = imgFolder + "play.png"; // lokacija simbola za "PLAY"
var pauseButton = imgFolder + "pause.png"; // lokacija simbola za "PAUSE"
var playPauseButton = imgFolder + "play-pause.png"; // lokacija simbola za "PLAY" i "PAUSE"
var stepButton = imgFolder + "step.png"; // lokacija simbola za "FRAME ADVANCE"
var stepButtonDisabled = imgFolder + "step-disabled.png"; // lokacija deaktiviranog simbola za "FRAME ADVANCE"
var mode = 0; // flag radnog režima (0 – STOP; 1 – PLAY; 2 – PAUSE)
var fieldsArray = []; // niz u kojem se čuvaju statusi polja

function init() {
	english(); // prikazivanje natpisa i poruka na engleskom jeziku
	drawTable(60,80,1); // formiranje tabele
}

function drawTable(content) { // crtanje nove tabele (prazne ili s predefinisanim sadržajem)
	var i, j; // i – brojač vrsta; j – brojač kolona (vrste su numerisane od 1 do m, a kolone od 1 do n)
	var a = ""; // tekstualna promenljiva u koju smeštamo HTML-kôd tekuće vrste tabele
	counter = 0; // resetovanje brojača koraka, budući da je s prethodnom simulacijom završeno
	document.getElementById("counter").innerHTML = ""; // uklanjanje prikaza broja koraka (iz istog razloga kao malopre)
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
	for (i = 1; i <= m; i++) { // petlja po vrstama
		a += "<tr>";
		for (j = 1; j <= n; j++) { // petlja po kolonama
			var fieldID = n * (i - 1) + j; // računanje rednog broja polja, na osnovu tekuće vrste i kolone
			a += "<td id='" + fieldID + "' onmousedown='changeField(" + fieldID + ")'";
			switch(content) {
				case 0: // živa i mrtva polja treba da budu random raspoređena
					b = 0.08 * document.getElementById("density").value; // "density" predstavlja meru gustine random raspoređenih živih polja
					if (Math.random() > b) {
						a += " class='dead'"; // polje je mrtvo
					} else {
						a += " class='alive'"; // polje je živo
					}
					break;
				case 1: // sva polja tabele treba da budu bela (mrtva)
					a += " class='dead'";
					break;
				case 2: // sva polja tabele treba da budu crna (živa)
					a += " class='alive'";
					break;
				case 3:
					if (i % 2 == 1) { // raspored po horizontalnim prugama
						a += " class='alive'";
					} else {
						a += " class='dead'";
					}
					break;
				case 4:
					if (j % 2 == 1) { // raspored po vertikalnim prugama
						a += " class='alive'";
					} else {
						a += " class='dead'";
					}
					break;
				case 5:
					if ((i + j) % 3 == 0) { // dijagonalni raspored živih i mrtvih polja
						a += " class='alive'";
					} else {
						a += " class='dead'";
					}
					break;
				case 6:
					if ((i + j) % 2 == 0) { // šahovski raspored živih i mrtvih polja
						a += " class='alive'";
					} else {
						a += " class='dead'";
					}
					break;
			}
			a += "></td>";
		}
		a += "</tr>";
	}
	document.getElementById("table").innerHTML=a; // unošenje HTML-koda za tekuću vrstu tabele
}

function checkField(x) { // vrednost funkcije je 0 ako je polje pod rednim brojem x mrtvo, a 1 ako je živo
	if(document.getElementById(x).className == 'alive') {
		return 1;
	} else {
		return 0;
	}
}

function changeField(x) { // promena statusa polja pod rednim brojem x – ako je bilo živo postaje mrtvo, a ako je bilo mrtvo postaje živo
	if (checkField(x)==1) {
		document.getElementById(x).className = 'dead';
	} else {
		document.getElementById(x).className = 'alive';
	}
}

function inverse() { // zamena svih živih polja mrtvima i obratno
	for (i = 1; i <= p; i++) { // petlja po poljima tabele (polja ima p=m*n)
		changeField(i); // promena statusa tekućeg polja tabele
		fieldsArray[i] = 1 - fieldsArray[i] // promena vrednosti tekućeg člana niza
	}
	if (document.getElementById("counter").innerHTML != "") { // ukoliko vrednost brojača nije nula, tj. ako je simulacija već započeta...
		counter = 0; // resetovanje brojača...
		dispCounter(); // ...i njegovo ponovno prikazivanje
	}
}

function newStatus(x,count) { // vrednost funkcije predstavlja novi status ćelije (1=živa, 0=mrtva), u zavisnosti od njenog prethodnog statusa i broja živih suseda
	if (count == 3) { // u slučaju tačno tri živa suseda,
		return 1; // živa ćelija ostaje živa, a mrtva ćelija oživljava
	}
	else if (count < 2 || count > 3) { // ćelija umire ili zbog usamljenosti (count<2) ili zbog zagušenosti (count>3)
		return 0;
	} else {
		if (checkField(x) == 0) { // u preostalom slučaju (broj suseda je tačno dva) status ćelije se ne menja
			return 0;
		} else {
			return 1;
		}
	}
}

function step() { // korak simulacije
	var count; // varijabla koja pokazuje koliko tekuće polje ima živih suseda

	for (i = 1; i <= p; i++) { // inicijalno ispunjavanje privremenog niza nulama (niz ima p=m*n članova, tj. onoliko koliko ima polja tabele)
		fieldsArray[i] = 0;
	}

	// Prvo obrađujemo četiri polja na ćoškovima
	count = checkField(2) + checkField(n + 1) + checkField(n + 2); // polje u gornjem levom uglu; prebrojavamo koliko živih polja ima među susedna tri polja
	fieldsArray[1] = newStatus(1, count); // novi status polja smešta se u odgovarajući član privremenog niza
	count = checkField(n - 1) + checkField(2 * n - 1) + checkField(2 * n);
	fieldsArray[n] = newStatus(n, count); // polje u gornjem desnom uglu
	count = checkField((m - 2) * n + 1) + checkField((m - 2) * n + 2) + checkField((m - 1) * n + 2);
	fieldsArray[(m - 1) * n + 1] = newStatus((m - 1) * n + 1, count); // polje u donjem levom uglu
	count = checkField((m - 1) * n - 1) + checkField((m - 1) * n) + checkField(m * n - 1);
	fieldsArray[m * n] = newStatus(m * n, count); // polje u donjem desnom uglu

	// Obrađujemo prvi (gornji) red (bez ugaonih polja)
	for (i = 2; i <= n-1; i++) {
		count = checkField(i - 1) + checkField(i + 1) + checkField(n + i - 1) + checkField(n + i) + checkField(n + i + 1); // prebrojavamo koliko živih polja ima među susednih pet polja
		fieldsArray[i] = newStatus(i, count); // novi status polja smešta se u odgovarajući član privremenog niza
	}

	// Obrađujemo poslednji (donji) red (bez ugaonih polja)
	var start = (m - 1) * n + 2; // redni broj polja koje je prvo desno od polja u donjem levom uglu
	var end = m * n - 1; // redni broj polja koje je prvo levo od polja u donjem desnom uglu
	for (i = start; i <= end; i++) {
		count=checkField(i - 1) + checkField(i + 1) + checkField(i - 1 - n) + checkField(i - n) + checkField(i + 1 - n); // prebrojavamo koliko živih polja ima među susednih pet polja
		fieldsArray[i] = newStatus(i, count); // novi status polja smešta se u odgovarajući član privremenog niza
	}

	// Sada obrađujemo sve preostale redove – od drugog pa do pretposlednjeg
	for (i = 2; i <= m-1; i++) { // dakle, od drugog do pretposlednjeg reda

		// Prvo polja koja su uz levu ivicu tabele
		k = (i - 1) * n + 1; // redni broj posmatranog polja koje se nalazi uz levu ivicu tabele
		count = checkField(k - n) + checkField(k - n + 1) + checkField(k + 1) + checkField(k + n) + checkField(k + n + 1); // prebrojavamo koliko živih polja ima među susednih pet polja
		fieldsArray[k] = newStatus(k, count); // novi status polja smešta se u odgovarajući član privremenog niza

		// Zatim polja koja su uz desnu ivicu tabele
		k = i * n; // redni broj posmatranog polja koje se nalazi uz desnu ivicu tabele
		count = checkField(k - n) + checkField(k - n - 1) + checkField(k - 1) + checkField(k + n - 1) + checkField(k + n); // prebrojavamo koliko živih polja ima među susednih pet polja
		fieldsArray[k] = newStatus(k, count); // novi status polja smešta se u odgovarajući član privremenog niza

		// Zatim sva ostala polja u tekućem redu (od drugog do pretposlednjeg, sleva nadesno)
		for (j = 2; j <= n-1; j++) {
			k=(i - 1) * n + j; // redni broj posmatranog polja
			count = checkField(k - n - 1) + checkField(k - n) + checkField(k - n + 1) + checkField(k - 1) + checkField(k + 1) + checkField(k + n - 1) + checkField(k + n) + checkField(k + n + 1); // prebrojavamo koliko živih polja ima među susednih osam polja
		fieldsArray[k] = newStatus(k, count); // novi status polja smešta se u odgovarajući član privremenog niza
		}
	}

	// sada kada su novi statusi svih polja pohranjeni u privremeni niz, vršimo prebacivanje vrednosti članova niza u samu tabelu, tj. prikazivanje ne ekranu
	for (i = 1; i <= p; i++) { // petlja po članovima niza (niz ima p=m*n članova, tj. onoliko koliko ima polja tabele)
		if(fieldsArray[i] == 0) {
			document.getElementById(i).className = "dead";
		} else {
			document.getElementById(i).className = "alive";
		}
	}

	// prikazivanje rednog broja koraka simulacije
	counter++;
	dispCounter();
}

function dispCounter() { // prikazivanje rednog broja koraka simulacije (na osnovu sadržaja globalne varijable counter)
	document.getElementById("counter").innerHTML = langArray["step count"] + " <span class='counter'>" + counter + "</span>";
}

function setSpeed() { // podešavanje brzine na osnovu položaja klizača brzine i ponavljanje radne petlje
	a = document.getElementById("speed").value; // podešavanje brzine na osnovu položaja klizača brzine
	runLoop = setInterval(step, 1361 - 150 * a); // ponavljanje radne petlje
}

function run() { // Prelazak u režim „PLAY“ ili „PAUSE“
	if (mode == 1) { // ako je režim bio „PLAY“, prelazak u režim „PAUSE“
		clearInterval(runLoop); // zaustavlja se radna petlja
		mode = 2; // flag radnog režima se postavlja na vrednost koji označava režim „PAUSE“
		document.getElementById("start").getElementsByTagName("img")[0].src = playPauseButton; // na aktivacionom dugmetu se prikazuju simboli "PLAY" i "PAUSE"
		document.getElementById("start-tip").innerHTML = langArray["cont tip"]; // help tip se postavlja na „nastavljanje simulacije“
		document.getElementById("step").disabled = false; // aktivira se dugme „FRAME ADVANCE“ (koje je bilo deaktivirano tokom režima „PLAY“)
		document.getElementById("step").getElementsByTagName("img")[0].src = stepButton; // aktivira se i slika njegovog simbola na tasteru
		document.getElementById("step-tip").className = "tip"; // samim tim, pošto je dugme aktivirano, treba da se hoverom na njega ispisuje i help tip
		document.getElementById("led").className = "led-off"; // LED se isključuje pre započinjanja treperućeg režima
		ledFlag = 0; // pre ulaska u petlju za treperenje postavljamo indikator da je LED isključena
		ledLoop = setInterval(ledBlink, 500); // petlja za treperenje LED-diode, s periodom od 500ms
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
		document.getElementById("step").disabled = true; // za vreme „PLAY“ režima, dugme „FRAME ADVANCE“ je deaktivirano
		document.getElementById("step").getElementsByTagName("img")[0].src = stepButtonDisabled; // deaktivira se i slika njegovog simbola na tasteru
		document.getElementById("step-tip").className = "tip-deact"; // samim tim, pošto je dugme deaktivirano, hoverom na njega ne treba da se ispisuje help tip
		setSpeed(); // podešavanje brzine na osnovu položaja klizača brzine i ponavljanje radne petlje
	}
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

function changeSpeed () { // promena brzine u toku simulacije
	if (mode == 1) { // izvršava se jedino u režimu „PLAY“
		clearInterval(runLoop); // prekida se dosadašnja radna petlja...
		setSpeed(); // ...i startuje nova, s novopodešenom brzinom
	}
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
	
	// poruke
	langArray["random tip"] = "Regulator for the black (alive) fields density<br />in the initial step.<ul><li>Leftmost position – minimal density;</li><li>Rightmost position – maximal density;</li></ul>Keyboard shortcuts: <span class='keyshort'>1–9</span><ul><li>key 1 – minimal density</li><li>key 9 – maximal density</li></ul>";
	langArray["white tip"] = "Populating the table<br />with all the white (dead) fields.<br />Keyboard shortcut: <span class='keyshort'>A</span>";
	langArray["black tip"] = "Populating the table<br />with all the black (alive) fields.<br />Keyboard shortcut: <span class='keyshort'>S</span>";
	langArray["hor tip"] = "The arrangement of the alive<br />and the dead fields<br />in the form of horizontal bars<br />(every odd row – alive fields;<br />every even row – dead fields).<br />Keyboard shortcut: <span class='keyshort'>D</span>";
	langArray["vert tip"] = "The arrangement of the alive<br />and the dead fields<br />in the form of vertical bars<br />(every odd column – alive fields;<br />every even column – dead fields).<br />Keyboard shortcut: <span class='keyshort'>F</span>";
	langArray["diag tip"] = "The arrangement of the alive<br />and the dead fields<br />in the form of diagonal bars.<br />Keyboard shortcut: <span class='keyshort'>G</span>";
	langArray["chess tip"] = "The arrangement of the alive<br />and the dead fields<br />in the form of a chessboard fields.<br />Keyboard shortcut: <span class='keyshort'>H</span>";
	langArray["inverse tip"] = "Replaces all the black (live) fields<br />with the white (dead) fields and vice versa;<br />after this, the simulation step counter<br />returns to zero, since hereby<br />the new simulation is started.<br />Keyboard shortcut: <span class='keyshort'>I</span>";
	langArray["step tip"] = "Executes one<br />simulation step.<br />Keyboard shortcut: <span class='keyshort'>X</span>";
	langArray["start tip"] = "Starts the simulation.<br />Keyboard shortcut: <span class='keyshort'>C</span>";
	langArray["pause tip"] = "Pauses the simulation.<br />Keyboard shortcut: <span class='keyshort'>C</span>";
	langArray["cont tip"] = "Continues the simulation.<br />Keyboard shortcut: <span class='keyshort'>C</span>";
	langArray["led tip"] = 'Mode LED-indicator:<ul><li>off: "STOP" mode</li><li>on: "PLAY" mode</li><li>blinking: "PAUSE" mode</li></ul>';
	langArray["speed tip"] = "Simulation speed regulator:<ul><li>Leftmost position – minimal speed</li><li>Rightmost position – maximal speed</li></ul>Keyboard shortcuts:<br /><ul><li><span class='keyshort'>N</span> (reduces speed)</li><li><span class='keyshort'>M</span> (increase speed)</li></ul>";
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
	langArray["all whites"] = "Sva bela";
	langArray["all blacks"] = "Sva crna";
	langArray["hbars"] = "Horizontalne pruge";
	langArray["vbars"] = "Vertikalne pruge";
	langArray["dbars"] = "Dijagonalne pruge";
	langArray["chess"] = "Šahovski raspored";
	langArray["inverse"] = "Inverzan raspored";
	langArray["slow"] = "sporo";
	langArray["fast"] = "brzo";
	
	// poruke
	langArray["random tip"] = "Regulator gustine crnih (živih) polja<br />u početnom koraku.<ul><li>Krajnji levi položaj – najmanja gustina;</li><li>Krajnji desni položaj – najveća gustina;</li></ul>Prečice na tastaturi: <span class='keyshort'>1–9</span><ul><li>taster 1 – najmanja gustina</li><li>taster 9 – najveća gustina</li></ul>";
	langArray["white tip"] = "Popunjavanje tabele<br />svim belim (neživim) poljima.<br />Prečica na tastaturi: <span class='keyshort'>A</span>";
	langArray["black tip"] = "Popunjavanje tabele<br />svim crnim (živim) poljima.<br />Prečica na tastaturi: <span class='keyshort'>S</span>";
	langArray["hor tip"] = "Raspoređivanje živih i mrtvih polja<br />u vidu horizontalnih pruga<br />(svaki neparni red – živa polja;<br />svaki parni red – mrtva polja).<br />Prečica na tastaturi: <span class='keyshort'>D</span>";
	langArray["vert tip"] = "Raspoređivanje živih i mrtvih polja<br />u vidu vertikalnih pruga<br />(svaka neparna kolona – živa polja;<br />svaka parna kolona – mrtva polja).<br />Prečica na tastaturi: <span class='keyshort'>F</span>";
	langArray["diag tip"] = "Raspoređivanje živih i mrtvih polja<br />u vidu dijagonalnih pruga.<br />Prečica na tastaturi: <span class='keyshort'>G</span>";
	langArray["chess tip"] = "Raspoređivanje živih i mrtvih polja<br />u vidu polja na šahovskoj tabli.<br />Prečica na tastaturi: <span class='keyshort'>H</span>";
	langArray["inverse tip"] = "Zamena svih crnih (živih) polja<br />belim (mrtvim) poljima i obratno;<br />nakon ovoga, brojač koraka<br />simulacije se vraća na nulu,<br />budući da ovime počinje<br />nova simulacija.<br />Prečica na tastaturi: <span class='keyshort'>I</span>";
	langArray["step tip"] = "Izvršavanje jednog<br />koraka simulacije.<br />Prečica na tastaturi: <span class='keyshort'>X</span>";
	langArray["start tip"] = "Pokretanje simulacije.<br />Prečica na tastaturi: <span class='keyshort'>C</span>";
	langArray["pause tip"] = "Pauziranje simulacije.<br />Prečica na tastaturi: <span class='keyshort'>C</span>";
	langArray["cont tip"] = "Nastavljanje simulacije.<br />Prečica na tastaturi: <span class='keyshort'>C</span>";
	langArray["led tip"] = "Indikator režima rada:<ul><li>isključeno: režim „STOP“</li><li>uključeno: režim „PLAY“</li><li>treperenje: režim „PAUSE“</li></ul>";
	langArray["speed tip"] = "Regulator brzine simulacije:<ul><li>Krajnji levi položaj – najmanja brzina</li><li>Krajnji desni položaj – najveća brzina</li></ul>Prečice na tastaturi:<br /><ul><li><span class='keyshort'>N</span> (smanjivanje brzine)</li><li><span class='keyshort'>M</span> (povećavanje brzine)</li></ul>";
	document.getElementById("srb").className = "selected"; // simbol izabranog jezika treba da bude uokviren i da na njemu kursor miša bude default
	document.getElementById("eng").className = ""; // simbol neizabranog jezika treba da bude neuokviren i da na njemu kursor miša bude pointer
	writeLang(langArray); // pozivanje funkcija za prikaz natpisa i poruka
}

function writeLang() { // prikazivanje natpisa i poruka na izabranom jeziku, na osnovu sadržaja niza langArray[]
	document.getElementsByTagName("title")[0].innerHTML = langArray["title"];
	document.getElementsByTagName("h1")[0].innerHTML = langArray["title"];
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
	document.getElementById("random-tip").innerHTML = langArray["random tip"];
	document.getElementById("white-tip").innerHTML = langArray["white tip"];
	document.getElementById("black-tip").innerHTML = langArray["black tip"];
	document.getElementById("hor-tip").innerHTML = langArray["hor tip"];
	document.getElementById("vert-tip").innerHTML = langArray["vert tip"];
	document.getElementById("diag-tip").innerHTML = langArray["diag tip"];
	document.getElementById("chess-tip").innerHTML = langArray["chess tip"];
	document.getElementById("inverse-tip").innerHTML = langArray["inverse tip"];
	document.getElementById("step-tip").innerHTML = langArray["step tip"];
	switch(mode) { // help tip aktivacionog dugmeta se razlikuje u zavisnosti od toga da li je trenutni radni režim „STOP“, „PLAY“ ili „PAUSE“
		case 0: // ukoliko je trenutni radni režim „STOP“...
			document.getElementById("start-tip").innerHTML = langArray["start tip"]; // ...prikazuje se poruka „pokretanje simulacije“
			break;
		case 1: // ukoliko je trenutni radni režim „PLAY“...
			document.getElementById("start-tip").innerHTML = langArray["pause tip"]; // ...prikazuje se poruka „paziranje simulacije“
			break;
		case 2: // ukoliko je trenutni radni režim „PAUSE“...
			document.getElementById("start-tip").innerHTML = langArray["cont tip"]; // ...prikazuje se poruka „nastavljanje simulacije“
			break;
	}
	document.getElementById("led-tip").innerHTML = langArray["led tip"];
	document.getElementById("speed-tip").innerHTML = langArray["speed tip"];
}

document.onkeypress = key;
function key(event) {
	var x = event.which || event.keyCode;
	if (x >= 49 && x <= 57) { // pritisnut neki od tastera od 1 do 9, radi regulisanja gustine sadržaja
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
		if (x == 110) { // taster „n“ za usporavanje simulacije
			var speed = document.getElementById("speed").value;
			if (speed > 1) { // Ako klizač regulatora brzine nije na krajnjoj levoj poziciji...
				speed--;
				document.getElementById("speed").value = speed; // ...pomera se za jednu poziciju nalevo
				changeSpeed(); // brzina simulacije se smanjuje
			}
		} else { // taster „m“ za ubrzavanje simulacije
			var speed = document.getElementById("speed").value;
			if (speed < 9) { // Ako klizač regulatora brzine nije na krajnjoj desnoj poziciji...
				speed++;
				document.getElementById("speed").value = speed; // ...pomera se za jednu poziciju nadesno
				changeSpeed(); // brzina simulacije se povećava
			}
		}
	}
	switch(x) {
		case 97: // taster „a“ za tabelu sa svim belim (neživim) poljima
			drawTable(1);
			document.getElementById("white").focus(); // stavljanje fokusa na odgovarajuće dugme
			break;
		case 115: // taster „s“ za tabelu sa svim crnim (živim) poljima
			drawTable(2);
			document.getElementById("black").focus(); // stavljanje fokusa na odgovarajuće dugme
			break;
		case 100: // taster „d“ za raspored u vidu horizontalnih pruga
			drawTable(3);
			document.getElementById("hor").focus(); // stavljanje fokusa na odgovarajuće dugme
			break;
		case 102: // taster „f“ za raspored u vidu vertikalnih pruga
			drawTable(4);
			document.getElementById("vert").focus(); // stavljanje fokusa na odgovarajuće dugme
			break;
		case 103: // taster „g“ za raspored u vidu dijagonalnih pruga
			drawTable(5);
			document.getElementById("diag").focus(); // stavljanje fokusa na odgovarajuće dugme
			break;
		case 104: // taster „h“ za raspored u vidu šahovskih polja
			drawTable(6);
			document.getElementById("chess").focus(); // stavljanje fokusa na odgovarajuće dugme
			break;
		case 105: // taster „i“ za inverzni raspored (da sva bela polja postanu crna i obratno)
			inverse();
			document.getElementById("inverse").focus(); // stavljanje fokusa na odgovarajuće dugme
			break;
		case 120: // taster „x“ za izvršavanje jednog koraka simulacije
			if (mode != 1) { // u režimu „PLAY“ (mode=1) opcija za jedan korak simulacije je onemogućena
				step();
				document.getElementById("step").focus(); // stavljanje fokusa na odgovarajuće dugme
			}
			break;
		case 99: // taster „c“ za pokretanje/pauziranje simulacije
			run();
			document.getElementById("start").focus(); // stavljanje fokusa na odgovarajuće dugme
			break;
	}
}
