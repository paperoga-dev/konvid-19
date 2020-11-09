'use strict';

function getSelectedRadio(radioName) {
    let radioValue = null;
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

    for (let i = 0; i < radios.length; ++i) {
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
        let n = Math.trunc(x + 0.5);
        return factorial(2 * n - 1) / (Math.pow(2, 2 * n - 1) * factorial(n - 1)) * Math.sqrt(Math.PI);
    }
}

function calculateR(hasFever, daysBetweenContactAndFever) {
    if (hasFever === 0)
        return 0.5;
    else if (hasFever === 2)
        return 0.75;
    else
        return Math.pow(1.05, daysBetweenContactAndFever / 2.0 - 1.0) / (extendedFactorial(daysBetweenContactAndFever / 2.0 - 1.0) * Math.exp(1.05)) / 0.404614;
}

function calculateFP(duration) {
    return Math.log(duration + 1.0) / Math.log(61.0);
}

function calculateNE(distance, maxRange) {
    return Math.pow(1.0 - distance / maxRange, 2.0);
}

function calculateFL(closedSpace, distance, maxRange) {
    let dd = (closedSpace) ? 0.0 : Math.min(distance, maxRange);

    return 1.0 - ((Math.pow(dd / maxRange, 3.0) + dd / maxRange) / 2.0) * 0.5;
}

function calculateShieldFactor(shield, gain) {
    return 1.0 - Math.min((shield + gain), 100.0) / 100.0;
}

function calculateL(age) {
    let mL = null;
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
    let tm = null;
    let daysToKillerContact = null;

    let tu = null;
    let daysToVictimContact = null;

    let R = null;
    let daysBetweenContactAndFever = null;

    let contactDuration = null;
    let fp = null;

    let actorsDistance = null;
    let ne = null;

    let closedSpace = null;
    let fl = null;

    let killerShield = null;
    let fi = null;

    let victimShield = null;
    let fc = null;

    let victimAge = null;
    let L = null;

    let realN = null;

    let maxD = getSelectedRadio("btnKillerAction");

    let maxValue = calculateR(1, 3.0) *
        calculateFP(60.0) *
        calculateNE(0.0, maxD) *
        calculateFL(true, 0.0, maxD) *
        calculateShieldFactor(0.0, 0.0) *
        calculateShieldFactor(0.0, 0.0) *
        calculateL(100.0);

    try {
        tm = 1.0;
        tu = 1.0;

        let hasFever = getSelectedRadio("btnKillerHasFever");
        daysBetweenContactAndFever = document.getElementById("slDaysBetweenContactAndFever").valueAsNumber;
        R = calculateR(hasFever, 3.0 - daysBetweenContactAndFever);
        document.getElementById("rowDaysBetweenContactAndFever").setAttribute("class", (hasFever === 1) ? "" : "row_hidden");
        document.getElementById("rowDaysBetweenContactAndFever").setAttribute("className", (hasFever === 1) ? "" : "row_hidden");

        let slText = document.getElementById("slDaysBetweenContactAndFeverText");
        if (daysBetweenContactAndFever < -1) {
            slText.innerHTML = -daysBetweenContactAndFever + " giorni <b>prima</b> del vostro contatto";
        } else if (daysBetweenContactAndFever === -1) {
            slText.innerHTML = "il giorno <b>prima</b> del vostro contatto";
        } else if (daysBetweenContactAndFever === 0) {
            slText.innerHTML = "<b>il giorno in cui lo hai incontrato</b>";
        } else if (daysBetweenContactAndFever === 1) {
            slText.innerHTML = "il giorno <b>dopo</b> il vostro contatto";
        } else {
            slText.innerHTML = daysBetweenContactAndFever + " giorni <b>dopo</b> il vostro contatto";
        }

        contactDuration = document.getElementById("slContactDuration").valueAsNumber;
        fp = calculateFP(contactDuration);

        slText = document.getElementById("slContactDurationText");
        slText.innerHTML = contactDuration + " minut" + ((contactDuration == 1) ? "o" : "i") + " => ";
        if (contactDuration > 50) {
            slText.innerHTML += "trovare un parcheggio sotto casa";
        } else if (contactDuration > 40) {
            slText.innerHTML += "rapporto sessuale in un film porno";
        } else if (contactDuration > 30) {
            slText.innerHTML += "antivax che ti spiega del mercurio nei vaccini";
        } else if (contactDuration > 20) {
            slText.innerHTML += "cottura al microonde di lasagne congelate";
        } else if (contactDuration > 10) {
            slText.innerHTML += "durata di una pubblicit&agrave; di un programma per bambini";
        } else if (contactDuration > 5) {
            slText.innerHTML += "ricordarti dove hai messo la mascherina";
        } else if (contactDuration > 2) {
            slText.innerHTML += "rapporto sessuale di un maschio medio";
        } else {
            slText.innerHTML += "vedere l'ex da lontano e fuggire";
        }

        let aD = document.getElementById("slActorsDistance").valueAsNumber;
        let origAD = aD;
        actorsDistance = Math.min(aD, maxD);
        ne = calculateNE(actorsDistance, maxD);

        slText = document.getElementById("slActorsDistanceText");
        slText.innerHTML = "";
        if (aD === 0) {
            slText.innerHTML += "distanza zero ";
        } else {
            if (aD >= 100) {
                let meters = Math.trunc(aD / 100);
                aD = aD - meters * 100;
                slText.innerHTML = meters + " metr" + ((meters == 1) ? "o" : "i") + " ";
            }
            if (aD !== 0) {
                slText.innerHTML += aD + " centimetr" + ((aD == 1) ? "o" : "i") + " ";
            }
        }
        slText.innerHTML += "=> ";
        if (origAD > 500) {
            slText.innerHTML += "incrociare il proprio capo";
        } else if (origAD > 400) {
            slText.innerHTML += "incrociare punkabbestia sotto ketamina con pitbull ringhiante";
        } else if (origAD > 300) {
            slText.innerHTML += "dirimpettaia che parla male della portinaia";
        } else if (origAD > 200) {
            slText.innerHTML += "mi scusi... crede nella vita dopo la morte?";
        } else if (origAD > 100) {
            slText.innerHTML += "mi fai questa fotocopia?";
        } else if (origAD > 50) {
            slText.innerHTML += "sgomitatore in metropolitana";
        } else if (origAD > 10) {
            slText.innerHTML += "strizzargli un punto nero sul naso";
        } else {
            slText.innerHTML += "giochiamo ad annoda-lingue?";
        }

        closedSpace = getSelectedRadio("btnPlaceType");
        fl = calculateFL(closedSpace, actorsDistance, maxD);

        killerShield = getSelectedRadio("btnKillerShieldType");
        fi = calculateShieldFactor(killerShield, ((getSelectedRadio("btnKillerHasFaceShield") === 1) && (killerShield < 90)) ? 5.0 : 0.0);

        victimShield = getSelectedRadio("btnVictimShieldType");
        fc = calculateShieldFactor(victimShield, ((getSelectedRadio("btnVictimHasFaceShield") === 1) && (victimShield < 80)) ? 15.0 : 0.0);

        victimAge = document.getElementById("slVictimAge").valueAsNumber;
        L = calculateL(victimAge);

        slText = document.getElementById("slVictimAgeText");
        slText.innerHTML = victimAge + " ann" + ((victimAge == 1) ? "o" : "i");

        realN = R * tu * tm * fp * ne * fl * fi * fc * L;
    } catch (exc) {
        realN = maxValue;
    }

    let N = Math.max((((killerShield === 0.0) || (victimShield === 0.0)) && (actorsDistance < 100)) ? 10.0 : 1.0, Math.min(100.0, Math.round(realN * 100.0 / maxValue)));

    document.getElementById('progress-done').style.width = N + '%';
    let pB = document.getElementById('progress-bar');
    if (N >= 66.6)
        pB.className = "progress-bar red glow";
    else if (N >= 33.3)
        pB.className = "progress-bar orange glow";
    else
        pB.className = "progress-bar yellow glow";
}

function init() {
    update();
}
