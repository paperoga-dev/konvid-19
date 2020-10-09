'use strict';

var cookieVersion = 1;
var cookieDict = {};

function setCookie(cookieData, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = "konvidCookie=" + cookieData + ";  expires=" + expires + "; path=/";
}

function getDataFromCookie(cookieData) {
    var pairs = cookieData.split("|");

    var dict = {};

    pairs.forEach(cookiePair => {
        var values = cookiePair.trim().split(">");
        var key = values[0];
        if ((key != "version") && (key != "expires") && (key != "path"))
            if ((values[1] === "true") || (values[1] === "false"))
                dict[key] = values[1] === "true";
            else
                dict[key] = values[1];
    });

    return dict;
}

function createDataForCookie(dataDict) {
    var list = [];

    list.push("version>" + cookieVersion);

    for (var key in dataDict) {
        list.push(key + ">" + dataDict[key]);
    }

    return list.join("|");
}

function getSelectedRadio(radioName) {
    var radioValue = null;
    document.getElementsByName(radioName).forEach((btn) => { if (btn.checked) radioValue = parseInt(btn.value); });
    return radioValue;
}

function disableRadio(radioName, disabledState) {
    document.getElementsByName(radioName).forEach((btn) => { btn.disabled = disabledState; });
}

function checkOneIfUnchecked(radios) {
    if (radios.length === 0) {
        return;
    }

    for (var i = 0; i < radios.length; ++i) {
        if (radios[i].checked) {
            return;
        }
    }

    radios[0].checked = true;
}

function factorial(num) {
    return (num === 0) ? 1 : (num * factorial(num - 1));
}

function extendedFactorial(x) {
    /* This function implements x! for negative x values too.
     *
     * As this requires the implementation of the Gamma and Pi Functions, and they are quite expensive, this code
     * just hard-codes them for some values, and falls back to a standard equivalent in some other cases.
     *
     * In detail: */

    /* when x -> -1 (right), we have (-1)! -> +inf. Just return a very high positive value */
    if (x === -1)
        return 1E+100;

    /* when x = -0.5 we have sqrt(PI), according to https://en.wikipedia.org/wiki/Factorial */
    else if (x === -0.5)
        return Math.sqrt(Math.PI);

    /* when x is integer, just compute the factorial */
    else if (x === Math.trunc(x))
        return factorial(x);

    /* According to Gamma, we have that (n - 0.5)! = Gamma(n + 1.5).
     * We need to correct x, to pretend that we're calculating (-1/2 + n)!, so, for example, if we need to calculate 0.5!, we calculate
     * Gamma(1.5), i.e Gamma(1 + 0.5) */
    else {
        var n = Math.trunc(x + 0.5);
        return factorial(2 * n - 1) / (Math.pow(2, 2 * n - 1) * factorial(n - 1)) * Math.sqrt(Math.PI);
    }
}

function calculateR(hasFever, daysBetweenContactAndFever) {
    if (hasFever === 0)
        return 0.5;
    else if (hasFever === 2)
        return 0.75;
    else
        // return Math.exp((-Math.pow(-8.0 + daysBetweenContactAndFever, 2.0) / 18.0)) / (3.0 * Math.sqrt(2.0 * Math.PI)) / 0.1329805;
        return Math.pow(1.05, daysBetweenContactAndFever / 2.0 - 1.0) / (extendedFactorial(daysBetweenContactAndFever / 2.0 - 1.0) * Math.exp(1.05)) / 0.404614;
}

function calculateFP(duration) {
    return Math.log(duration + 1.0) / Math.log(61.0);
}

function calculateNE(distance, maxRange) {
    return Math.pow(1.0 - distance / maxRange, 2.0);
}

function calculateFL(closedSpace, distance, maxRange) {
    var dd = (closedSpace) ? 0.0 : Math.min(distance, maxRange);

    return 1.0 - ((Math.pow(dd / maxRange, 3.0) + dd / maxRange) / 2.0) * 0.5;
}

function calculateShieldFactor(shield) {
    return 1.0 - shield / 100.0;
}

function calculateL(age) {
    var mL = null;
    if ((age >= 0) && (age < 10))
        mL = 0.0;
    else if ((age >= 10) && (age < 20))
        mL = 1.0;
    else if ((age >= 20) && (age < 30))
        mL = 2.0;
    else if ((age >= 30) && (age < 40))
        mL = 5.0;
    else if ((age >= 40) && (age < 50))
        mL = 12.0;
    else if ((age >= 50) && (age < 60))
        mL = 17.0;
    else if ((age >= 60) && (age < 70))
        mL = 56.0;
    else if ((age >= 70) && (age < 80))
        mL = 71.0;
    else if ((age >= 80) && (age < 90))
        mL = 85.0;
    else if ((age >= 90) && (age < 100))
        mL = 95.0;
    else
        mL = 100.0;

    return (mL / 100.0) * 0.1 + 1.0;
}

function update() {
    var tm = null;
    var daysToKillerContact = null;

    var tu = null;
    var daysToVictimContact = null;

    var R = null;
    var daysBetweenContactAndFever = null;

    var contactDuration = null;
    var fp = null;

    var actorsDistance = null;
    var ne = null;

    var closedSpace = null;
    var fl = null;

    var killerShield = null;
    var fi = null;

    var victimShield = null;
    var fc = null;

    var victimAge = null;
    var L = null;

    var realN = null;

    var maxD = getSelectedRadio("btnKillerAction");

    var maxValue = calculateR(1, 3.0) *
        calculateFP(60.0) *
        calculateNE(0.0, maxD) *
        calculateFL(true, 0.0, maxD) *
        calculateShieldFactor(0.0) *
        calculateShieldFactor(0.0) *
        calculateL(100.0);

    try {
        /*
        switch (getSelectedRadio("btnVictimSwabState")) {
            case 2:
                document.getElementById("slDaysToKillerContact").disabled = true;
                disableRadio("btnVictimSwabDate", true);

                tm = 1.0;
                break;

            case 1:
                document.getElementById("slDaysToKillerContact").disabled = true;
                disableRadio("btnVictimSwabDate", true);

                throw 0;

            default:
                disableRadio("btnVictimSwabDate", false);

                switch (getSelectedRadio("btnVictimSwabDate")) {
                    case 1:
                        document.getElementById("slDaysToKillerContact").disabled = false;
                        daysToKillerContact = document.getElementById("slDaysToKillerContact").valueAsNumber;
                        if ((daysToKillerContact >= 0) && (daysToKillerContact <= 3))
                            tm = 1.0;
                        else
                            tm = 0.3;
                        break;

                    default:
                        document.getElementById("slDaysToKillerContact").disabled = true;
                        tm = 0.3;
                        break;
                }
                break;
        }
        */
        tm = 1.0;

        /*
         switch (getSelectedRadio("btnKillerSwabState")) {
             case 2:
                 document.getElementById("slDaysToVictimContact").disabled = true;
                 disableRadio("btnKillerSwabDate", true);

                 tu = 1.0;
                 break;

             case 1:
                 disableRadio("btnKillerSwabDate", false);

                 switch (getSelectedRadio("btnKillerSwabDate")) {
                     case 1:
                         document.getElementById("slDaysToVictimContact").disabled = false;
                         daysToVictimContact = document.getElementById("slDaysToVictimContact").valueAsNumber;
                         if (((daysToVictimContact >= -15) && (daysToVictimContact <= -12)) ||
                             ((daysToVictimContact >= 3)))
                             tu = 1.0;
                         else
                             tu = 1.1;
                         break;

                     default:
                         document.getElementById("slDaysToVictimContact").disabled = true;
                         tu = 1.1;
                         break;
                 }
                 break;

             default:
                 disableRadio("btnKillerSwabDate", false);

                 switch (getSelectedRadio("btnKillerSwabDate")) {
                     case 1:
                         document.getElementById("slDaysToVictimContact").disabled = false;
                         daysToVictimContact = document.getElementById("slDaysToVictimContact").valueAsNumber;
                         if (((daysToVictimContact >= -15) && (daysToVictimContact <= -12)) ||
                             ((daysToVictimContact >= 3)))
                             tu = 1.0;
                         else
                             tu = 0.8;
                         break;

                     default:
                         document.getElementById("slDaysToVictimContact").disabled = true;
                         tu = 0.8;
                         break;
                 }
                 break;
         }
         */
        tu = 1.0;

        var hasFever = getSelectedRadio("btnKillerHasFever");
        daysBetweenContactAndFever = document.getElementById("slDaysBetweenContactAndFever").valueAsNumber;
        R = calculateR(hasFever, 3.0 - daysBetweenContactAndFever);
        document.getElementById("rowDaysBetweenContactAndFever").setAttribute("class", (hasFever === 1) ? "" : "row_hidden");
        document.getElementById("rowDaysBetweenContactAndFever").setAttribute("className", (hasFever === 1) ? "" : "row_hidden");

        var slText = document.getElementById("slDaysBetweenContactAndFeverText");
        if (daysBetweenContactAndFever < -1) {
            slText.innerHTML = -daysBetweenContactAndFever + " giorni <b>prima</b> del contatto";
        } else if (daysBetweenContactAndFever === -1) {
            slText.innerHTML = "il giorno <b>prima</b> del contatto";
        } else if (daysBetweenContactAndFever === 0) {
            slText.innerHTML = "<b>il giorno stesso</b>";
        } else if (daysBetweenContactAndFever === 1) {
            slText.innerHTML = "il giorno <b>dopo</b> il contatto";
        } else {
            slText.innerHTML = daysBetweenContactAndFever + " giorni <b>dopo</b> il contatto";
        }

        contactDuration = document.getElementById("slContactDuration").valueAsNumber;
        fp = calculateFP(contactDuration);

        slText = document.getElementById("slContactDurationText");
        if (contactDuration > 50) {
            slText.innerHTML = "trovare un parcheggio sotto casa";
        } else if (contactDuration > 40) {
            slText.innerHTML = "rapporto sessuale su YouPorn";
        } else if (contactDuration > 30) {
            slText.innerHTML = "antivax che ti spiega del mercurio nei vaccini";
        } else if (contactDuration > 20) {
            slText.innerHTML = "cottura al microonde di lasagne congelate";
        } else if (contactDuration > 10) {
            slText.innerHTML = "durata di una pubblicit&agrave; Mediaset";
        } else if (contactDuration > 5) {
            slText.innerHTML = "ricordarti dove hai messo la mascherina";
        } else if (contactDuration > 2) {
            slText.innerHTML = "rapporto sessuale di un maschio medio";
        } else {
            slText.innerHTML = "vedere l'ex da lontano e fuggire";
        }

        var aD = document.getElementById("slActorsDistance").valueAsNumber;
        actorsDistance = Math.min(aD, maxD);
        ne = calculateNE(actorsDistance, maxD);

        slText = document.getElementById("slActorsDistanceText");
        if (aD > 500) {
            slText.innerHTML = "incrociare il proprio capo";
        } else if (aD > 400) {
            slText.innerHTML = "incrociare punkabbestia sotto ketamina con pitbull ringhiante";
        } else if (aD > 300) {
            slText.innerHTML = "dirimpettaia che parla male della portinaia";
        } else if (aD > 200) {
            slText.innerHTML = "mi scusi... crede nella vita dopo la morte?";
        } else if (aD > 100) {
            slText.innerHTML = "mi fai questa fotocopia?";
        } else if (aD > 50) {
            slText.innerHTML = "sgomitatore in metropolitana";
        } else if (aD > 10) {
            slText.innerHTML = "strizzargli un punto nero sul naso";
        } else {
            slText.innerHTML = "giochiamo ad annoda-lingue?";
        }

        closedSpace = getSelectedRadio("btnPlaceType");
        fl = calculateFL(closedSpace, actorsDistance, maxD);

        killerShield = getSelectedRadio("btnKillerShieldType");
        fi = calculateShieldFactor(killerShield);

        victimShield = getSelectedRadio("btnVictimShieldType");
        fc = calculateShieldFactor(victimShield);

        victimAge = document.getElementById("slVictimAge").valueAsNumber;
        L = calculateL(victimAge);

        realN = R * tu * tm * fp * ne * fl * fi * fc * L /* P */;
    } catch (exc) {
        realN = maxValue;
    }

    var N = Math.max((((killerShield === 0.0) || (victimShield === 0.0)) && (actorsDistance < 100)) ? 10.0 : 1.0, Math.min(100.0, Math.round(realN * 100.0 / maxValue)));

    var progressDone = document.querySelector('.progress-done');
    progressDone.style.width = N + '%';
    if (N >= 66.6)
        progressDone.style.backgroundColor = "red";
    else if (N >= 33.3)
        progressDone.style.backgroundColor = "orange";
    else
        progressDone.style.backgroundColor = "lightgreen";

    var isDebug = window.location.search.endsWith("?debug");

    if (isDebug)
        document.querySelector('.progress-value').textContent = N + '%';
    else
        document.querySelector('.progress-value').textContent = '';

    var elems = document.querySelectorAll("[data-ck]");

    cookieDict = {}
    elems.forEach(elem => {
        if (elem.type == "radio") {
            if (elem.checked)
                cookieDict[elem.getAttribute("data-ck")] = elem.checked;
        } else if (elem.type == "checkbox") {
            cookieDict[elem.getAttribute("data-ck")] = elem.checked;
        } else {
            cookieDict[elem.getAttribute("data-ck")] = elem.valueAsNumber;
        }
    })

    setCookie(createDataForCookie(cookieDict), 30);

    document.getElementById("debug").style.visibility = (debug) ? "visible" : "collapse";

    if (isDebug) {
        document.getElementById("debug").innerHTML = "<br><br>" +
            "daysBetweenContactAndFever = " + daysBetweenContactAndFever + "<br>" +
            "R = " + R + "<br><br>" +
            "contactDuration = " + contactDuration + "<br>" +
            "fp = " + fp + "<br><br>" +
            "actorsDistance = " + actorsDistance + "<br>" +
            "ne = " + ne + "<br><br>" +
            "closedSpace = " + closedSpace + "<br>" +
            "fl = " + fl + "<br>" +
            "maxD = " + maxD + "<br><br>" +
            "killerShield = " + killerShield + "<br>" +
            "fi = " + fi + "<br><br>" +
            "victimShield = " + victimShield + "<br>" +
            "fc = " + fc + "<br><br>" +
            "victimAge = " + victimAge + "<br>" +
            "L = " + L + "<br><br>" +
            "daysToVictimContact = " + daysToVictimContact + "<br>" +
            "tu = " + tu + "<br><br>" +
            "daysToKillerContact = " + daysToKillerContact + "<br>" +
            "tm = " + tm + "<br><br>" +
            "maxValue = " + maxValue + "<br>" +
            "realN = " + realN;
    }

    var slElems = document.querySelectorAll('input[type="range"], input[type="range"][list]');
    slElems.forEach(slElem => {
        var outputElement = document.getElementById(slElem.id + "Value");
        outputElement.value = slElem.valueAsNumber;
        outputElement.style.display = (isDebug) ? "inline" : "none";
    });
}

function init() {
    var cookieData = document.cookie;
    if (cookieData !== "") {
        cookieData.split(';').forEach(cookieElem => {
            cookieElem = cookieElem.trim();
            if (!cookieElem.startsWith("konvidCookie"))
                return;

            cookieDict = getDataFromCookie(cookieElem.replace("konvidCookie=", ""));

            var elems = document.querySelectorAll("[data-ck]");

            elems.forEach(elem => {
                if ((elem.type === "checkbox") || (elem.type === "radio"))
                    elem.checked = cookieDict[elem.getAttribute("data-ck")];
                else
                    elem.valueAsNumber = cookieDict[elem.getAttribute("data-ck")];
            });

            checkOneIfUnchecked(document.getElementsByName('btnKillerHasFever'));
            checkOneIfUnchecked(document.getElementsByName('btnKillerAction'));
            checkOneIfUnchecked(document.getElementsByName('btnPlaceType'));
            checkOneIfUnchecked(document.getElementsByName('btnKillerShieldType'));
            checkOneIfUnchecked(document.getElementsByName('btnVictimShieldType'));
        });
    }

    update();
}
