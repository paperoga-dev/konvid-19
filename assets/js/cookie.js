function getCookie(cname) {
    const name = cname + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');

    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }

    return "";
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();

    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));

    const expires = "expires=" + d.toUTCString();

    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

const cookieBanner = document.querySelector('#cookie-banner');
const hasCookieConsent = getCookie('cookies-consent');
var language = getCookie('konvid-language');

if (!hasCookieConsent) {
    cookieBanner.classList.remove('hidden');
}

function getFirstBrowserLanguage() {
    let nav = window.navigator,
        browserLanguagePropertyKeys = ['language', 'browserLanguage', 'systemLanguage', 'userLanguage'],
        i,
        language,
        len,
        shortLanguage = null;

    // support for HTML 5.1 "navigator.languages"
    if (Array.isArray(nav.languages)) {
        for (i = 0; i < nav.languages.length; i++) {
            language = nav.languages[i];
            len = language.length;
            if (!shortLanguage && len) {
                shortLanguage = language;
            }
            if (language && len > 2) {
                return language;
            }
        }
    }

    // support for other well known properties in browsers
    for (i = 0; i < browserLanguagePropertyKeys.length; i++) {
        language = nav[browserLanguagePropertyKeys[i]];
        //skip this loop iteration if property is null/undefined.  IE11 fix.
        if (language == null) { continue; }
        len = language.length;
        if (!shortLanguage && len) {
            shortLanguage = language;
        }
        if (language && len > 2) {
            return language;
        }
    }

    return shortLanguage;
}

const consentCta = cookieBanner.querySelector('#consent-cookies');

consentCta.addEventListener('click', () => {
    cookieBanner.classList.add('hidden');
    setCookie('cookies-consent', 1, 365);
});