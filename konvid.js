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

function update() {
    var tm = null;
    var daysToKillerContact = null;

    var tu = null;
    var daysToVictimContact = null;

    var killerHasFever = null;
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

    var illness1Severity = null;
    var illness2Severity = null;
    var illness3Severity = null;

    var P1 = null;
    var P2 = null;
    var P3 = null;

    var P = null;

    var realN = null;

    try {
        document.getElementsByName("btnVictimSwabState").forEach((btn) => { if (btn.checked) tm = parseFloat(btn.value); });
        if (tm === 3.0) {
            document.getElementById("slDaysToKillerContact").disabled = true;
            tm = 1.0;
        } else if (tm === 2.0) {
            document.getElementById("slDaysToKillerContact").disabled = true;
            throw 0;
        } else if (tm === 1.0) {
            document.getElementById("slDaysToKillerContact").disabled = true;
            tm = 0.3;
        } else {
            document.getElementById("slDaysToKillerContact").disabled = false;
            daysToKillerContact = document.getElementById("slDaysToKillerContact").valueAsNumber;
            if ((daysToKillerContact >= 0) && (daysToKillerContact <= 3))
                tm = 1.0;
            else
                tm = 0.3;
        }

        document.getElementsByName("btnKillerSwabState").forEach((btn) => { if (btn.checked) tu = parseFloat(btn.value); });
        if (tu === 4) {
            document.getElementById("slDaysToVictimContact").disabled = true;
            tu = 1.0;
        } else if (tu === 3) {
            document.getElementById("slDaysToVictimContact").disabled = true;
            tu = 1.1;
        } else if (tu === 2) {
            document.getElementById("slDaysToVictimContact").disabled = false;
            daysToVictimContact = document.getElementById("slDaysToVictimContact").valueAsNumber;
            if (((daysToVictimContact >= -15) && (daysToVictimContact <= -12)) ||
                ((daysToVictimContact >= 3)))
                tu = 1.0;
            else
                tu = 1.1;
        } else if (tu === 1) {
            document.getElementById("slDaysToVictimContact").disabled = true;
            tu = 0.8;
        } else {
            document.getElementById("slDaysToVictimContact").disabled = false;
            daysToVictimContact = document.getElementById("slDaysToVictimContact").valueAsNumber;
            if (((daysToVictimContact >= -15) && (daysToVictimContact <= -12)) ||
                ((daysToVictimContact >= 3)))
                tu = 1.0;
            else
                tu = 0.8;
        }

        document.getElementsByName("btnKillerHasFever").forEach((btn) => { if (btn.checked) killerHasFever = parseFloat(btn.value); });
        if (killerHasFever === 1.0) {
            document.getElementById("slDaysBetweenContactAndFever").disabled = false;

            daysBetweenContactAndFever = 2.0 - document.getElementById("slDaysBetweenContactAndFever").valueAsNumber;
            R = Math.exp((-Math.pow(-8.0 + daysBetweenContactAndFever, 2.0) / 18.0)) / (3.0 * Math.sqrt(2.0 * Math.PI)) / 0.1329805;
        } else {
            document.getElementById("slDaysBetweenContactAndFever").disabled = true;
            R = 0.5;
        }

        contactDuration = document.getElementById("slContactDuration").valueAsNumber;
        fp = ((Math.log(contactDuration + 1.0)) / (Math.log(61.0))) * 0.3 + 0.8;

        actorsDistance = document.getElementById("slActorsDistance").valueAsNumber;
        ne = Math.pow(1.0 - actorsDistance / 300.0, 2.0);

        document.getElementsByName("btnPlaceType").forEach((btn) => { if (btn.checked) closedSpace = parseFloat(btn.value); });
        fl = ((closedSpace === 1.0) ? 100.0 : 90.0) / 100.0;

        document.getElementsByName("btnKillerShieldType").forEach((btn) => { if (btn.checked) killerShield = parseFloat(btn.value); });
        fi = 1.0 - killerShield / 100.0;

        document.getElementsByName("btnVictimShieldType").forEach((btn) => { if (btn.checked) victimShield = parseFloat(btn.value); });
        fc = 1.0 - victimShield / 100.0;

        victimAge = document.getElementById("slVictimAge").valueAsNumber;
        var mL = null;
        if ((victimAge >= 0) && (victimAge < 10))
            mL = 0.0;
        else if ((victimAge >= 10) && (victimAge < 20))
            mL = 1.0;
        else if ((victimAge >= 20) && (victimAge < 30))
            mL = 2.0;
        else if ((victimAge >= 30) && (victimAge < 40))
            mL = 5.0;
        else if ((victimAge >= 40) && (victimAge < 50))
            mL = 12.0;
        else if ((victimAge >= 50) && (victimAge < 60))
            mL = 17.0;
        else if ((victimAge >= 60) && (victimAge < 70))
            mL = 56.0;
        else if ((victimAge >= 70) && (victimAge < 80))
            mL = 71.0;
        else if ((victimAge >= 80) && (victimAge < 90))
            mL = 85.0;
        else if ((victimAge >= 90) && (victimAge < 100))
            mL = 95.0;
        else
            mL = 100.0;

        L = (mL / 100.0) * 0.1 + 1.0;

        document.getElementsByName("btnIllness1Severity").forEach((btn) => { if (btn.checked) illness1Severity = parseFloat(btn.value); });
        document.getElementsByName("btnIllness2Severity").forEach((btn) => { if (btn.checked) illness2Severity = parseFloat(btn.value); });
        document.getElementsByName("btnIllness3Severity").forEach((btn) => { if (btn.checked) illness3Severity = parseFloat(btn.value); });

        if (illness1Severity < illness2Severity)
            [illness1Severity, illness2Severity] = [illness2Severity, illness1Severity];

        if (illness1Severity < illness3Severity)
            [illness1Severity, illness3Severity] = [illness3Severity, illness1Severity];

        if (illness2Severity < illness3Severity)
            [illness2Severity, illness3Severity] = [illness3Severity, illness2Severity];

        P1 = ((illness1Severity / 100.0) + 1.0);
        P2 = ((illness2Severity / 200.0) + 1.0);
        P3 = ((illness3Severity / 400.0) + 1.0);

        P = (((((P1 * P2 * P3) - 1.0) / ((1.5 * 1.25 * 1.125) - 1.0)) * 0.1) + 1.0);

        realN = R * tu * tm * fp * ne * fl * fi * fc * L * P;
    } catch (exc) {
        realN = 1.4641;
    }

    var N = Math.min(100, Math.round(realN * 100.0 / 1.4641));

    var progress = document.querySelector('.progress-done');
    progress.setAttribute('data-done', N);
    progress.style.width = progress.getAttribute('data-done') + '%';
    progress.textContent = progress.getAttribute('data-done') + '%';

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

    var isDebug = window.location.search.endsWith("?debug");

    if (isDebug) {
        document.getElementById("debug").innerHTML =
            "daysBetweenContactAndFever = " + daysBetweenContactAndFever + "<br>" +
            "R = " + R + "<br><br>" +
            "contactDuration = " + contactDuration + "<br>" +
            "fp = " + fp + "<br><br>" +
            "actorsDistance = " + actorsDistance + "<br>" +
            "ne = " + ne + "<br><br>" +
            "closedSpace = " + closedSpace + "<br>" +
            "fl = " + fl + "<br><br>" +
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
            "illness1Severity = " + illness1Severity + "<br>" +
            "P1 = " + P1 + "<br><br>" +
            "illness2Severity = " + illness2Severity + "<br>" +
            "P2 = " + P2 + "<br><br>" +
            "illness3Severity = " + illness3Severity + "<br>" +
            "P3 = " + P3 + "<br><br>" +
            "P = " + P + "<br><br>" +
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
    const progress = document.querySelector('.progress-done');

    progress.style.width = progress.getAttribute('data-done') + '%';
    progress.style.opacity = 1;

    var cookieData = document.cookie;
    if ((cookieData !== "") && cookieData.startsWith("konvidCookie")) {
        cookieDict = getDataFromCookie(cookieData.split(";")[0].replace("konvidCookie=", ""));

        var elems = document.querySelectorAll("[data-ck]");

        elems.forEach(elem => {
            if ((elem.type === "checkbox") || (elem.type === "radio"))
                elem.checked = cookieDict[elem.getAttribute("data-ck")];
            else
                elem.valueAsNumber = cookieDict[elem.getAttribute("data-ck")];
        });
    }

    update();
}

function cookiePopup() {
    // Get the modal
    var modal = document.getElementById("cookieDialog");

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("acceptButton")[0];

    modal.style.display = "block";

    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
        modal.style.display = "none";
    }
}


