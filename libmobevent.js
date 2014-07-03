// EventLib -- libmobevent.js
// Copyright (C) 2008 by Mikael O. Bonnier, Lund, Sweden.
// All Rights Reserved.

// Inspired by events_library.js from www.MAH.se course in web programming, however
// this is much different from that.

// events_library.js ingår i övningsmateriel från kursen Webbprogrammering, DA123A, 
// HT08 vid Malmö högskola. 
// Filerna hämtades från kursplatsen på It's learning (www.mah.se/lms) 2008-10-08.

// The purpose is to smooth out differences between Firefox/DOM and IE (perhaps only older versions).

var EventLib = new Object(); // EventLib corresponds to an abstract static class in Java.

EventLib.addEvent = function (element, eventType, listener, useCapture) {
    if (element.addEventListener) { // DOM
        EventLib.addEvent = function (element, eventType, listener, useCapture) {
            element.addEventListener(eventType, listener, useCapture);
            return true;
        }
        EventLib.removeEvent = function (element, eventType, listener, useCapture) {
            element.removeEventListener(eventType, listener, useCapture);
        }
        EventLib.getEventObject = function (event) {
            return event;
        }
        EventLib.getEventTarget = function (event) {
            return event.target;
        }
    }
    else if (element.attachEvent) { // IE
        EventLib.addEvent = function (element, eventType, listener, useCapture) {
            return element.attachEvent("on" + eventType, listener);
        }
        EventLib.removeEvent = function (element, eventType, listener, useCapture) {
            element.detachEvent("on" + eventType, listener);
        }
        EventLib.getEventObject = function (event) {
            return window.event;
        }
        EventLib.getEventTarget = function (event) {
            return event.srcElement;
        }
    }
    return EventLib.addEvent(element, eventType, listener, useCapture);
}
