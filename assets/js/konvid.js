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

function translate(locale, key) {
    let dict = lang_dict[locale] || {};
    return dict[key] || "";
}

function russianNumeration(value, plural, endingWithOne, endingFromTwoToFour) {
    let lastDigit = (value % 10);
    let secondDigit = Math.trunc(value / 10) % 10;

    if (secondDigit !== 1) {
        if (lastDigit === 1) {
            return endingWithOne;
        } else if ((lastDigit >= 2) && (lastDigit <= 4)) {
            return endingFromTwoToFour;
        } else {
            return plural;
        }
    } else {
        return plural;
    }
}

function translateDays(value) {
    let res = "";
    if (value < -1) {
        switch (language) {
            case "it": return -value + " giorni <b>prima</b> del vostro contatto";
            case "fr": return -value + " jours <b>avant</b> de vôtre contact";
            case "de": return -value + " Tage <b>vor</b> eurer Begegnung";
            case "ru":
                if (value <= -5) {
                    return -value + " дней <b>до</b> вашей встречи";
                } else {
                    return -value + " дня <b>до</b> вашей встречи";
                }
            case "jp": return "私との濃厚接触から " + -value + " <b>　日 </b> 前";

            default: return -value + " days <b>before</b> your meeting";
        }
    } else if (value === -1) {
        switch (language) {
            case "it": return "il giorno <b>prima</b> del vostro contatto";
            case "fr": return "le jour <b>avant</b> de vôtre contact";
            case "de": return "am Tag <b>vor</b> eurer Begegnung";
            case "ru": return "за день <b>до</b> вашей встречи";
            case "jp": return "私との濃厚接触から <b> 一日 </b> 前";

            default: return "the day <b>before</b> your meeting";
        }
    } else if (value === 0) {
        switch (language) {
            case "it": return "<b>il giorno in cui lo hai incontrato</b>";
            case "fr": return "<b>le jour que vous vous êtes rencontré</b>";
            case "de": return "<b>am Tag der Begegnung</b>";
            case "ru": return "<b>в день вашей встречи</b>";
            case "jp": return "<b>感染者と濃厚接触があった日</b>";

            default: return "<b>the same day of your meeting</b>";
        }
    } else if (value === 1) {
        switch (language) {
            case "it": return "il giorno <b>dopo</b> il vostro contatto";
            case "fr": return "le jour <b>aprés</b> le contact";
            case "de": return "am Tag <b>nach</b> eurer Begegnung";
            case "ru": return "в день <b>после</b> вашей встречи";
            case "jp": return "私との濃厚接触から <b> 一日 </b>　後";

            default: return "the day <b>after</b> your meeting";
        }
    } else {
        switch (language) {
            case "it": return value + " giorni <b>dopo</b> il vostro contatto";
            case "fr": return value + " jours <b>aprés</b> le contact";
            case "de": return value + " Tage <b>nach</b> eurer Begegnung";
            case "ru": return value + " дня <b>после</b> вашей встречи";
            case "jp": return "私との濃厚接触から " + value + "<b>　日 </b> 後";

            default: return value + " days <b>after</b> your meeting";
        }
    }
}

function translateDistance(value) {
    if (value === 0) {
        switch (language) {
            case "it": return "distanza zero ";
            case "fr": return "distance nulle";
            case "de": return "Null Abstand";
            case "ru": return "Расстояние равное нулю";
            case "jp": return "距離ゼロ";

            default: return "no distance";
        }
    } else {
        let res = "";

        if (value >= 100) {
            let meters = Math.trunc(value / 100);
            value = value - meters * 100;

            switch (language) {
                case "it":
                    res = meters + " metr" + ((meters == 1) ? "o" : "i") + " ";
                    break;

                case "fr":
                    res = meters + " mètre" + ((meters == 1) ? "" : "s") + " ";
                    break;

                case "de":
                    res = meters + " Meter ";
                    break;

                case "ru":
                    res = meters + " " + russianNumeration(meter, "метров", "метр", "метра");
                    break;

                case "jp":
                    res = meters + " メートル ";
                    break;

                default:
                    res = meters + " meter" + ((meters == 1) ? "" : "s") + " ";
                    break;
            }
        }
        if (value !== 0) {
            switch (language) {
                case "it":
                    res += value + " centimetr" + ((value == 1) ? "o" : "i");
                    break;

                case "fr":
                    res += value + " centimètre" + ((value == 1) ? "" : "s");
                    break;

                case "de":
                    res += value + " Zentimeter";
                    break;

                case "ru":
                    res += value + " " + russianNumeration(value, "сантиметров", "сантиметр", "сантиметрa");
                    break;

                case "jp":
                    res += value + " センチ";
                    break;

                default:
                    res += value + " centimeter" + ((value == 1) ? "" : "s");
                    break;
            }
        }

        return res;
    }
}

function translateTime(value) {
    switch (language) {
        case "it": return value + " minut" + ((value == 1) ? "o" : "i");
        case "fr": return value + " minute" + ((value == 1) ? "" : "s");
        case "de": return value + " Minute" + ((value == 1) ? "" : "n");
        case "ru": return value + " " + russianNumeration(value, "минут", "минутy", "минуты");
        case "jp": return value + " 分";

        default: return value + " minut" + ((value == 1) ? "e" : "es");
    }
}

function translateAge(value) {
    switch (language) {
        case "it": return value + " ann" + ((value == 1) ? "o" : "i");
        case "fr": return value + " an" + ((value == 1) ? "" : "s");
        case "de": return value + " Jahr" + ((value == 1) ? "" : "e");
        case "ru": return value + " " + russianNumeration(value, "лет", "год", "годa");
        case "jp": return value + " 歳";

        default: return value = " year" + ((value == 1) ? "" : "s");
    }
}

function update() {
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
        let hasFever = getSelectedRadio("btnKillerHasFever");
        daysBetweenContactAndFever = document.getElementById("slDaysBetweenContactAndFever").valueAsNumber;
        R = calculateR(hasFever, 3.0 - daysBetweenContactAndFever);
        document.getElementById("rowDaysBetweenContactAndFever").setAttribute("class", (hasFever === 1) ? "" : "row_hidden");
        document.getElementById("rowDaysBetweenContactAndFever").setAttribute("className", (hasFever === 1) ? "" : "row_hidden");

        let slText = document.getElementById("slDaysBetweenContactAndFeverText");
        slText.innerHTML = translateDays(daysBetweenContactAndFever);

        contactDuration = document.getElementById("slContactDuration").valueAsNumber;
        fp = calculateFP(contactDuration);

        slText = document.getElementById("slContactDurationText");
        slText.innerHTML = translateTime(contactDuration);
        let funnySentence = null;
        if (contactDuration > 50) {
            funnySentence = translate(language, "frasi_1");
        } else if (contactDuration > 40) {
            funnySentence = translate(language, "frasi_2");
        } else if (contactDuration > 30) {
            funnySentence = translate(language, "frasi_3");
        } else if (contactDuration > 20) {
            funnySentence = translate(language, "frasi_4");
        } else if (contactDuration > 10) {
            funnySentence = translate(language, "frasi_5");
        } else if (contactDuration > 5) {
            funnySentence = translate(language, "frasi_6");
        } else if (contactDuration > 2) {
            funnySentence = translate(language, "frasi_7");
        } else {
            funnySentence = translate(language, "frasi_8");
        }
        if (funnySentence !== null) {
            slText.innerHTML += " => " + funnySentence;
        }

        let aD = document.getElementById("slActorsDistance").valueAsNumber;
        let origAD = aD;
        actorsDistance = Math.min(aD, maxD);
        ne = calculateNE(actorsDistance, maxD);

        slText = document.getElementById("slActorsDistanceText");
        slText.innerHTML = translateDistance(aD);
        funnySentence = null;
        if (origAD > 500) {
            funnySentence = translate(language, "frasi_9");
        } else if (origAD > 400) {
            funnySentence = translate(language, "frasi_10");
        } else if (origAD > 300) {
            funnySentence = translate(language, "frasi_11");
        } else if (origAD > 200) {
            funnySentence = translate(language, "frasi_12");
        } else if (origAD > 100) {
            funnySentence = translate(language, "frasi_13");
        } else if (origAD > 50) {
            funnySentence = translate(language, "frasi_14");
        } else if (origAD > 10) {
            funnySentence = translate(language, "frasi_15");
        } else {
            funnySentence = translate(language, "frasi_16");
        }
        if (funnySentence !== null) {
            slText.innerHTML += " => " + funnySentence;
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
        slText.innerHTML = translateAge(victimAge);

        realN = R * fp * ne * fl * fi * fc * L;
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

function updateLang() {
    if (language === "") {
        language = getFirstBrowserLanguage().split("_")[0];
    }

    if (!(language in lang_dict)) {
        language = "en";
    }

    let items = document.querySelectorAll('[data-lang]');

    for (let item of items) {
        item.innerHTML = lang_dict[language][item.getAttribute('data-lang')] || lang_dict["en"][item.getAttribute('data-lang')];
    }

    items = document.querySelectorAll('[pic-lang]');

    for (let item of items) {
        item.src = pic_dict[language][item.getAttribute('pic-lang')] || pic_dict["en"][item.getAttribute('pic-lang')];
    }
}

function switchLanguage(newLanguage) {
    language = newLanguage;

    if (!(language in lang_dict)) {
        language = "en";
    }

    setCookie("konvid-language", language, 365);

    location.reload();
}

function init() {
    updateLang();
    update();
}
