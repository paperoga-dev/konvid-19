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


function calculateR(hasFever, daysBetweenContactAndFever) {
    return (hasFever) ? Math.exp((-Math.pow(-8.0 + daysBetweenContactAndFever, 2.0) / 18.0)) / (3.0 * Math.sqrt(2.0 * Math.PI)) / 0.1329805 : 0.5;
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

/*
function calculateIllness(I1, I2, I3) {
    if (I1 < I2)
        [I1, I2] = [I2, I1];

    if (I1 < I3)
        [I1, I3] = [I3, I1];

    if (I2 < I3)
        [I2, I3] = [I3, I2];

    var P1 = ((I1 / 100.0) + 1.0);
    var P2 = ((I2 / 200.0) + 1.0);
    var P3 = ((I3 / 400.0) + 1.0);

    return [P1, P2, P3, (((((P1 * P2 * P3) - 1.0) / ((1.5 * 1.25 * 1.125) - 1.0)) * 0.1) + 1.0)];
}
*/

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

    /*
    var illness1Severity = null;
    var illness2Severity = null;
    var illness3Severity = null;

    var P1 = null;
    var P2 = null;
    var P3 = null;

    var P = null;
    */

    var realN = null;

    var maxD = getSelectedRadio("btnKillerAction");

    var maxValue = calculateR(true, 8.0) *
        calculateFP(60.0) *
        calculateNE(0.0, maxD) *
        calculateFL(true, 0.0, maxD) *
        calculateShieldFactor(0.0) *
        calculateShieldFactor(0.0) *
        calculateL(100.0) /* *
        calculateIllness(50.0, 50.0, 50.0)[3] */;

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

        var hasFever = getSelectedRadio("btnKillerHasFever") === 1;
        daysBetweenContactAndFever = document.getElementById("slDaysBetweenContactAndFever").valueAsNumber;
        R = calculateR(hasFever, 2.0 - daysBetweenContactAndFever);
        document.getElementById("rowDaysBetweenContactAndFever").setAttribute("class", (hasFever) ? "" : "row_hidden");
        document.getElementById("rowDaysBetweenContactAndFever").setAttribute("className", (hasFever) ? "" : "row_hidden");

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
            slText.innerHTML = "guardare una puntata di Masterchef senza pubblicità";
        } else if (contactDuration > 40) {
            slText.innerHTML = "trovare un negozio che venda viti da 5,23 mm";
        } else if (contactDuration > 30) {
            slText.innerHTML = "farsi barba e capelli";
        } else if (contactDuration > 20) {
            slText.innerHTML = "telefonare alla mamma";
        } else if (contactDuration > 10) {
            slText.innerHTML = "usare questo tool";
        } else if (contactDuration > 5) {
            slText.innerHTML = "prendere un caffè con la macchina in seconda fila";
        } else if (contactDuration > 2) {
            slText.innerHTML = "scrivere una cagata su Tumblr";
        } else {
            slText.innerHTML = "cambiare l'acqua";
        }

        var aD = document.getElementById("slActorsDistance").valueAsNumber;
        actorsDistance = Math.min(aD, maxD);
        ne = calculateNE(actorsDistance, maxD);

        slText = document.getElementById("slActorsDistanceText");
        if (aD > 500) {
            slText.innerHTML = "incontrato al supermercato";
        } else if (aD > 400) {
            slText.innerHTML = "ammiccare al ristorante";
        } else if (aD > 300) {
            slText.innerHTML = "discussione col vicino";
        } else if (aD > 200) {
            slText.innerHTML = "chiacchiera al bar";
        } else if (aD > 100) {
            slText.innerHTML = "inciucio tra colleghi";
        } else if (aD > 50) {
            slText.innerHTML = "vicino sconosciuto di tavolo al matrimonio";
        } else if (aD > 10) {
            slText.innerHTML = "ce sto a prova'";
        } else {
            slText.innerHTML = "limonare di brutto";
        }

        closedSpace = getSelectedRadio("btnPlaceType");
        fl = calculateFL(closedSpace, actorsDistance, maxD);

        killerShield = getSelectedRadio("btnKillerShieldType");
        fi = calculateShieldFactor(killerShield);

        victimShield = getSelectedRadio("btnVictimShieldType");
        fc = calculateShieldFactor(victimShield);

        victimAge = document.getElementById("slVictimAge").valueAsNumber;
        L = calculateL(victimAge);

        /*
        illness1Severity = getSelectedRadio("btnIllness1Severity");
        illness2Severity = getSelectedRadio("btnIllness2Severity");
        illness3Severity = getSelectedRadio("btnIllness3Severity");

        var pValues = calculateIllness(illness1Severity, illness2Severity, illness3Severity);

        P1 = pValues[0];
        P2 = pValues[1];
        P3 = pValues[2];
        P = pValues[3];
        */

        realN = R * tu * tm * fp * ne * fl * fi * fc * L /* P */;
    } catch (exc) {
        realN = maxValue;
    }

    var N = Math.max(10.0, Math.min(100.0, Math.round(realN * 100.0 / maxValue)));

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
            /*
            "illness1Severity = " + illness1Severity + "<br>" +
            "P1 = " + P1 + "<br><br>" +
            "illness2Severity = " + illness2Severity + "<br>" +
            "P2 = " + P2 + "<br><br>" +
            "illness3Severity = " + illness3Severity + "<br>" +
            "P3 = " + P3 + "<br><br>" +
            "P = " + P + "<br><br>" +
            */
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

/*
function cookiePopup() {
    var modal = document.getElementById("cookieDialog");
    var span = document.getElementsByClassName("acceptButton")[0];

    modal.style.display = "block";

    span.onclick = function () {
        modal.style.display = "none";
    }
}
*/

