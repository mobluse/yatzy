// DOMLib -- libmobdom.js
// Inspired from dom_library.js from www.MAH.se course in web programming.
// License: Public Domain.

// dom_library.js ingår i övningsmateriel från kursen Webbprogrammering, DA123A,
// HT08 vid Malmö högskola.
// Filerna hämtades från kursplatsen på It's learning (www.mah.se/lms) 2008-10-08.

function setText(element, string) {
    removeAllChildren(element);
    var textNode = document.createTextNode(string);
    element.appendChild(textNode);
}

function removeAllChildren(element) {
    while (element.firstChild != null)
        element.removeChild(element.firstChild);
}
