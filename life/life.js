var m = 58; // broj redova tabele
var n = 80; // broj kolona tabele
var p = m * n; // broj polja tabele
var counter; // brojač koraka simulacije
var ledFlag; // indikator stanja LED-diode za vreme njenog blinkanja u režimu „PAUSE“ (0 – off; 1 – on)
var ledLoop = 0; // varijabla timing-eventa treperenja LED-diode u režimu „PAUSE“
var imgFolder = "images/"; // lokacija foldera za slike
var ledOff = "led_off.png"; // naziv slike sa isključenom LED
var ledOn = "led_on.png"; // naziv slike sa uključenom LED
var mode = 0; // flag radnog režima (0 – STOP; 1 – PLAY; 2 – PAUSE)

function drawTable(content) { // crtanje nove tabele (prazne ili s predefinisanim sadržajem)
	var i, j; // i – brojač vrsta; j – brojač kolona (vrste su numerisane od 1 do m, a kolone od 1 do n)
	var a = ""; // tekstualna promenljiva u koju smeštamo HTML-kôd tekuće vrste tabele
	counter = 0; // resetovanje brojača koraka, budući da je s prethodnom simulacijom završeno
	document.getElementById("counter").innerHTML = ""; // uklanjanje prikaza broja koraka (iz istog razloga kao malopre)
	if (ledLoop != 0) {
		clearInterval(ledLoop);
	}
	if (mode == 2) {
		document.getElementById("start").innerHTML = "Pokreni";
		mode = 0;
		ledLoop = 0;
		document.getElementById("led").src = imgFolder + ledOff;
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
	for (i = 1; i <= p; i++) { // petlja po članovima niza (niz ima p=m*n članova, tj. onoliko koliko ima polja tabele)
		changeField(i);
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
	var fieldsArray = new Array; // kreiramo privremeni niz u kojem ćemo čuvati nove statuse polja
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

	// prikazivanje tekućeg koraka
	counter++;
	document.getElementById("counter").innerHTML = "Redni broj koraka: <span class='counter'>" + counter + "</span>";

}

function setSpeed() { // podešavanje brzine na osnovu položaja klizača brzine i ponavljanje radne petlje
	a = document.getElementById("speed").value; // podešavanje brzine na osnovu položaja klizača brzine
	runLoop = setInterval(step, 1361 - 150 * a); // ponavljanje radne petlje
}

function run() { // Prelazak u režim „PLAY“ ili „PAUSE“
	if (mode == 1) { // ako je režim bio „PLAY“, prelazak u režim „PAUSE“
		clearInterval(runLoop); // zaustavlja se radna petlja
		document.getElementById("start").innerHTML = "Nastavi"; // na aktivacionom dugmetu se prikazuje „Nastavi“
		mode = 2; // flag radnog režima se postavlja na vrednost koji označava režim „PAUSE“
		document.getElementById("step").disabled = false; // aktivira se dugme „Jedan korak“ (koje je bilo deaktivirano tokom režima „PLAY“)
		document.getElementById("led").src = imgFolder + ledOff; // LED se isključuje pre započinjanja treperućeg režima
		ledFlag = 0; // pre ulaska u petlju za treperenje postavljamo indikator da je LED isključena
		ledLoop = setInterval(ledBlink, 500); // petlja za treperenje LED-diode, s periodom od 500ms
	}
	else { // Ako je režim bio „STOP“ ili „PAUSE“, onda prelazak u režim „PLAY“
		if (mode == 2) { // u slučaju da je režim bio „PAUSE“...
			clearInterval(ledLoop); // ...zaustavlja se treperenje diode...
			ledLoop = 0; // ...i varijabla timing-eventa treperenja se postavlja na nulu
		}
		document.getElementById("start").innerHTML = "Pauziraj"; // na aktivacionom dugmetu se prikazuje „Pauziraj“
		mode = 1; // flag radnog režima se postavlja na vrednost koji označava režim „PLAY“
		document.getElementById("led").src = imgFolder + ledOn; // LED se uključuje
		document.getElementById("step").disabled = true; // za vreme „PLAY“ režima, dugme „Jedan korak“ je deaktivirano
		setSpeed(); // podešavanje brzine na osnovu položaja klizača brzine i ponavljanje radne petlje
	}
}

function ledBlink() { // treperenje LED-diode u režimu „PAUSE“
	if (ledFlag == 1) { // ukoliko je LED uključena...
		document.getElementById("led").src = imgFolder + ledOff; // ...isključuje se...
		ledFlag = 0; // ...i indikator uključene LED se postavlja na nulu
	} else { // u suprotnom, ako je LED isključena...
		document.getElementById("led").src = imgFolder + ledOn; // ...uključuje se...
		ledFlag = 1; // ...i indikator uključene LED se postavlja na jedinicu
	}
}

function changeSpeed () { // promena brzine u toku simulacije
	if (mode == 1) { // izvršava se jedino u režimu „PLAY“
		clearInterval(runLoop); // prekida se dosadašnja radna petlja...
		setSpeed(); // ...i startuje nova, s novopodešenom brzinom
	}
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
