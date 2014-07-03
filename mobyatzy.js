// Yatzy
// Copyright (C) 2008 by Mikael O. Bonnier, Lund, Sweden.
// License: GPLv3+.

// Global variables

var MAXNOPLAYERS = 4;
var noPlayers = 0;              // Number of players
var player = 0;                 // Current player
var results = new Array(18);    // results is a two dimensional array
for(var i = 0; i < results.length; ++i)
    results[i] = new Array(MAXNOPLAYERS);
var imgDices = new Array(6);    // Images of the six sides of a dice
var URLBase = "http://wp.orbin.se/ap1/";
var dices = new Array(5);       // Five yatzy dices
var diceThrow = 1;              // Keeps track of the number of the throw of the dices for one player
var placed = true;              // If the score has been marked
var eTH = { ONES:0, TWOS:1, THREES:2, FOURS:3, FIVES:4, SIXES:5, SUM:6, BONUS:7,
            PAIR:8, TWOPAIR:9, THREEOFAKIND:10, FOUROFAKIND:11, 
            STRAIGHTLO:12, STRAIGHTHI:13, FULLHOUSE:14, CHANCE:15, YATZY:16, TOTAL:17 };
            // Enumerated Table Headings

function selectNoPlayers() {
    var optNoPlayers = document.getElementById("optNoPlayers");
    noPlayers = optNoPlayers.selectedIndex + 1;
    resetGame();
    // console.log(noPlayers);
}

function throwDices() {
    for (var i = 0; i < 5; ++i) {
        var chkHold = document.getElementById("chkHold" + i);
        if (!chkHold.checked) {
            var imgDice = document.getElementById("imgDice" + i);
            imgDice.src = imgDices[dices[i] = Math.floor(Math.random()*6)].src;
        }
    }
    ++diceThrow;
    var btnThrow = document.getElementById("btnThrow");
    if (diceThrow > 3) {
        btnThrow.disabled = true;
    }
    else {
        if (diceThrow == 2) {
            setHoldDisabled(false);
            placed = false;
        }
        btnThrow.value = "Kasta " + diceThrow + " av 3";
    }
}

function markScore(e) {
    if (placed)
        return;
    var eventObject = EventLib.getEventObject(e);
    if(eventObject == null){
        alert("Inte tillräckligt stöd för JavaScript.");
        return;
    }
    var clickedCell = EventLib.getEventTarget(eventObject);
    var sId = clickedCell.id;
    var p = parseInt(sId.slice(1, 2));  // Player number. Example sId: p0f17
    if (p != player)
        return;
    placed = true;
    EventLib.removeEvent(clickedCell, "click", markScore, false);
    var hist = [0,0,0,0,0,0];
    for (var i = 0; i < 5; ++i)
        ++hist[dices[i]];
    var result = -1;
    var iTH = parseInt(sId.slice(3));   // Field number. Example sId: p0f17

    switch (iTH) {
        case eTH.ONES:
            result = hist[0];
            break;
        case eTH.TWOS:
            result = hist[1]*2;
            break;
        case eTH.THREES:
            result = hist[2]*3;
            break;
        case eTH.FOURS:
            result = hist[3]*4;
            break;
        case eTH.FIVES:
            result = hist[4]*5;
            break;
        case eTH.SIXES:
            result = hist[5]*6;
            break;
        case eTH.PAIR:
            result = 0;
            for (var i = 5; i >= 0; --i)
                if (hist[i] >= 2) {
                    result = 2*(i+1);
                    break;
                }
            break;
        case eTH.TWOPAIR:
            var nPair = 0;
            result = 0;
            for (var i = 5; i >= 0; --i)
                if (hist[i] >= 2) {
                    result += 2*(i+1);
                    ++nPair;
                    if (nPair == 2)
                        break;
                }
            if (nPair != 2)
                result = 0;
            break;
        case eTH.THREEOFAKIND:
            result = 0;
            for (var i = 5; i >= 0; --i)
                if (hist[i] >= 3) {
                    result = 3*(i+1);
                    break;
                }
            break;
        case eTH.FOUROFAKIND:
            result = 0;
            for (var i = 5; i >= 0; --i)
                if (hist[i] >= 4) {
                    result = 4*(i+1);
                    break;
                }
            break;
        case eTH.STRAIGHTLO:
            var straightlo = true;
            result = 15;
            for (var i = 0; i < 5; ++i)
                if (hist[i] == 0) {
                    straightlo = false;
                    break;
                }
            if (!straightlo)
                result = 0;
            break;
        case eTH.STRAIGHTHI:
            var straighthi = true;
            result = 20;
            for (var i = 1; i < 6; ++i)
                if (hist[i] == 0) {
                    straighthi = false;
                    break;
                }
            if (!straighthi)
                result = 0;
            break;
        case eTH.FULLHOUSE:
            var fullhouse = false;
            for (var i = 0; i < 6; ++i)
                if (hist[i] == 2) {
                    result = 2*(i+1);
                    for (var i = 0; i < 6; ++i)
                        if (hist[i] == 3) {
                            result += 3*(i+1);
                            fullhouse = true;
                            break;
                        }
                    fullhouse &= true;
                    break;
                }
            if (!fullhouse)
                result = 0;
            break;
        case eTH.CHANCE:
            result = 0;
            for (var i = 0; i < 6; ++i)
                result += hist[i]*(i+1);
            break;
        case eTH.YATZY:
            result = 0;
            for (var i = 5; i >= 0; --i)
                if (hist[i] >= 5) {
                    result = 50;
                    break;
                }
            break;
    }

    results[iTH][player] = result;
    setText(clickedCell, result);

    if (results[eTH.BONUS][player] == null)
        setSumBonus();
    setTotal();

    var btnThrow = document.getElementById("btnThrow");
    diceThrow = 1;
    btnThrow.value = "Kasta " + diceThrow + " av 3";
    btnThrow.disabled = false;
    btnThrow.focus();
    setHoldDisabled(true);
    if (finished()) {
        btnThrow.disabled = true;
        var winners = calcWinners();
        var ok = confirm("Spelet är slut. Spelare " + winners.join(" och ") + " vann."
            + " Börjar på nytt med tom spelplan.");
        if (ok)
            resetGame();
    }
    else {
        clearPlayer(player);
        ++player;
        if(player == noPlayers)
            player = 0;
        markPlayer(player);
    }
}

function setSumBonus() {
    var sum = 0;
    var full = true;
    for (var i = eTH.ONES; i <= eTH.SIXES; ++i)
        if (results[i][player] != null)
            sum += results[i][player];
        else
            full = false;
    results[eTH.SUM][player] = sum;
    var td = document.getElementById("p" + player + "f" + eTH.SUM);
    setText(td, sum);

    if(full)
        setBonus();
}

function setBonus() {
    var bonus;
    results[eTH.BONUS][player] = bonus = 0;
    if (results[eTH.SUM][player] >= 63) {
        results[eTH.BONUS][player] = bonus = 50;
    }
    td = document.getElementById("p" + player + "f" + eTH.BONUS);
    setText(td, bonus);
}

function setTotal() {
    var total = 0;
    for (var i = eTH.SUM; i <= eTH.YATZY; ++i)
        if (results[i][player] != null)
            total += results[i][player];
    results[eTH.TOTAL][player] = total;
    td = document.getElementById("p" + player + "f" + eTH.TOTAL);
    setText(td, total);
}

function calcWinners() {
    var max = results[eTH.TOTAL][0];
    for (var p = 1; p < MAXNOPLAYERS; ++p) {
        if (results[eTH.TOTAL][p] > max)
            max = results[eTH.TOTAL][p];
    }
    var winners = new Array();
    for (var p = 0; p < MAXNOPLAYERS; ++p) {
        if (results[eTH.TOTAL][p] == max)
            winners.push(p+1);
    }
    return winners; // winners contains player numbers in user coordinates
}

function resetGame() {
    for (var i = eTH.ONES; i <= eTH.TOTAL; ++i) {
        for (var p = 0; p < MAXNOPLAYERS; ++p) {
            results[i][p] = null;
            var td = document.getElementById("p" + p + "f" + i);
            setText(td, String.fromCharCode(160)); // &nbsp;
        }
    }
    addFieldListeners();

    clearPlayer(player);
    player = 0;
    markPlayer(player);
    placed = true;
    setHoldDisabled(true);

    var btnThrow = document.getElementById("btnThrow");
    diceThrow = 1;
    btnThrow.value = "Kasta " + diceThrow + " av 3";
    btnThrow.disabled = false;
    btnThrow.focus();
}

function clearPlayer(p) {
    var thPlayerOld = document.getElementById("p" + p);
    thPlayerOld.style.backgroundColor = "rgb(255, 255, 255)";
}

function markPlayer(p) {
    var thPlayer = document.getElementById("p" + p);
    thPlayer.style.backgroundColor = "rgb(51, 255, 51)";
    var txtPlayer = document.getElementById("txtPlayer");
    txtPlayer.value = player + 1;
}

function setHoldDisabled(disabled) {
    for (var i = 0; i < 5; ++i) {
        var chkHold = document.getElementById("chkHold" + i);
        if (disabled)
            chkHold.checked = false;
        chkHold.disabled = disabled;
    }
}

function finished() {
    var finished = true;
    for (var i = eTH.ONES; i <= eTH.TOTAL; ++i)
        for (var p = 0; p < noPlayers; ++p)
            if (results[i][p] == null)
                finished = false;
    return finished;
}

function addFieldListeners() {
    for (var i = eTH.ONES; i <= eTH.SIXES; ++i)
        for (var p = 0; p < noPlayers; ++p)
            addMarkScoreEvent(i, p);
    for (var i = eTH.PAIR; i <= eTH.YATZY; ++i)
        for (var p = 0; p < noPlayers; ++p)
            addMarkScoreEvent(i, p);
}

function addMarkScoreEvent(i, p) {
    var td = document.getElementById("p" + p + "f" + i);
    EventLib.removeEvent(td, "click", markScore, false); // Prevent double event handlers.
    EventLib.addEvent(td, "click", markScore, false);
}

function loadImages() {
    for (var i = 0; i < 6; ++i) {
        imgDices[i] = new Image();
        imgDices[i].src = URLBase+(i+1)+".gif";
    }
}

function initialize() {
    var btnThrow = document.getElementById("btnThrow");
    EventLib.addEvent(btnThrow, "click", throwDices, false);
    var btnNoPlayers = document.getElementById("btnNoPlayers");
    EventLib.addEvent(btnNoPlayers, "click", selectNoPlayers, false);
    loadImages();
    var optNoPlayers = document.getElementById("optNoPlayers");
    optNoPlayers.focus();
}

EventLib.addEvent(window, "load", initialize, false);
