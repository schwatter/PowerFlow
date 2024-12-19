// Funktion, um CSRF-Token aus dem Body-Element zu extrahieren
function getCsrfToken() {
    const csrfTokenElement = document.querySelector("body");
    if (csrfTokenElement) {
        return csrfTokenElement.getAttribute("fwcsrf");
    } else {
        console.error("CSRF token element not found.");
        return null;
    }
}

function setBatteryState(batteryState) {
    // Schalte Animationen basierend auf dem batteryState
    if (batteryState === 'gridLoad') {
        updateAnimation('batteryToHouse', 'off');
        updateAnimation('solarToBattery', 'off');
        setBatteryAnimation('gridLoad'); // Ladezustand vom Netz
    } else if (batteryState === 'gridUnload') {
        updateAnimation('solarToBattery', 'off');
        updateAnimation('batteryToHouse', 'off');
        setBatteryAnimation('gridUnload'); // Entladezustand ins Netz
    } else if (batteryState === 'solarLoad') {
        updateAnimation('solarToBattery', 'on');
        updateAnimation('batteryToHouse', 'off');
        setBatteryAnimation('solarLoad'); // Ladezustand von Solar
    } else if (batteryState === 'houseUnload') {
        updateAnimation('batteryToHouse', 'on');
        updateAnimation('solarToBattery', 'off');
        updateAnimation('gridToBattery', 'off');
        setBatteryAnimation('houseUnload'); // Entladezustand ins Haus
    } else if (batteryState === 'stop') {
        updateAnimation('solarToBattery', 'off');
        updateAnimation('batteryToHouse', 'off');
        setBatteryAnimation('stop'); // Batteriestatus gestoppt
    }
}

// Funktion zum Starten/Stoppen von Animationen basierend auf dem Reading
function updateAnimation(lineId, shouldAnimate) {
    const motionAnim = document.getElementById(lineId); // Das <animateMotion> Element
    const parentCircle = motionAnim ? motionAnim.parentElement : null; // Der umgebende Kreis (Punkt)

    if (motionAnim && parentCircle) {
        if (shouldAnimate === 'on') {
            // Nur Animation starten, wenn sie nicht bereits läuft
            parentCircle.style.display = 'block'; // Stelle sicher, dass der Punkt sichtbar ist
            if (motionAnim.getAttribute('dur') !== '3s') {
                motionAnim.setAttribute('dur', '3s'); // Setze die Dauer auf 3s
                motionAnim.beginElement(); // Animation starten
            }
        } else {
            // Animation stoppen und den Punkt ausblenden
            motionAnim.setAttribute('dur', '0s'); // Setze die Dauer auf 0s
            parentCircle.style.display = 'none'; // Verstecke den Punkt komplett
        }
    }
}

// Funktion, um die Ringsegmente basierend auf den Werten zu aktualisieren
function updateRing(solar, grid, battery) {
    // Setze negative Werte auf 0
    solar = Math.max(0, solar);
    grid = Math.max(0, grid);
    battery = Math.max(0, battery);

    const total = solar + grid + battery;
    
    // Wenn der total 0 ist, beende die Funktion, um Division durch 0 zu vermeiden
    if (total === 0) return;

    // Berechne die Prozentsätze, und stelle sicher, dass die Summe immer 100% beträgt
    const solarPercentage = (solar / total) * 100;
    const gridPercentage = (grid / total) * 100;
    const batteryPercentage = (battery / total) * 100;
    
    const circleCircumference = 2 * Math.PI * 40; // 40 ist der Radius des Kreises

    // Berechne die Länge der Stroke-Dasharray für jedes Segment
    const solarLength = (solarPercentage / 100) * circleCircumference;
    const gridLength = (gridPercentage / 100) * circleCircumference;
    const batteryLength = (batteryPercentage / 100) * circleCircumference;

    // Setze die Stroke-Dasharray und den Dashoffset entsprechend
    document.getElementById('solarSegment').setAttribute('stroke-dasharray', `${solarLength} ${circleCircumference}`);
    document.getElementById('gridSegment').setAttribute('stroke-dasharray', `${gridLength} ${circleCircumference}`);
    document.getElementById('batterySegment').setAttribute('stroke-dasharray', `${batteryLength} ${circleCircumference}`);
    
    // Offsets setzen, damit sich die Segmente nicht überlappen
    document.getElementById('gridSegment').setAttribute('stroke-dashoffset', -solarLength);
    document.getElementById('batterySegment').setAttribute('stroke-dashoffset', -(solarLength + gridLength));
}

// Funktion zum Anpassen der Grid-to-Battery Animation basierend auf dem State Reading
function setGridToBatteryAnimation(state) {
    const staticCircle = document.getElementById('gridToBatteryStatic');
    const forwardCircle = document.getElementById('gridToBatteryForward');
    const backwardCircle = document.getElementById('batteryToGridForward');

    // Alle Punkte standardmäßig ausblenden
    staticCircle.style.display = 'none';
    forwardCircle.style.display = 'none';
    backwardCircle.style.display = 'none';

    // Zeige den passenden Punkt basierend auf dem Zustand
    switch (state) {
        case 'gridLoad':
            forwardCircle.style.display = 'block'; // Zeige Vorwärts-Animation
            break;
        case 'gridUnload':
            backwardCircle.style.display = 'block'; // Zeige Rückwärts-Animation
            break;
        default:
            // Kein spezifischer Zustand, statischer Punkt bleibt versteckt
            break;
    }
}

function setBatteryAnimation(batteryStateReading) {
    // Greife auf die spezifischen Batteriezustände zu
    const staticCircle = document.getElementById('batteryStatic');
    const clockwiseGridLoad = document.getElementById('batteryClockwiseGridLoad');
    const clockwiseHouseUnload = document.getElementById('batteryClockwiseHouseUnload');
    const clockwiseSolarLoad = document.getElementById('batteryClockwiseSolarLoad');
    const counterClockwiseGridUnload = document.getElementById('batteryCounterclockwiseGridUnload');

    // Verstecke alle Kreise standardmäßig
    staticCircle.style.display = 'none';
    clockwiseGridLoad.style.display = 'none';
    clockwiseHouseUnload.style.display = 'none';
    clockwiseSolarLoad.style.display = 'none';
    counterClockwiseGridUnload.style.display = 'none';

    // Zeige den passenden Kreis basierend auf dem Zustand
    if (batteryStateReading === 'stop') {
        staticCircle.style.display = 'block'; // Zeige statische Batterie
    } else if (batteryStateReading === 'gridLoad') {
        clockwiseGridLoad.style.display = 'block'; // Zeige Ladeanimation vom Netz
    } else if (batteryStateReading === 'gridUnload') {
        counterClockwiseGridUnload.style.display = 'block'; // Zeige Entladeanimation ins Netz
    } else if (batteryStateReading === 'solarLoad') {
        clockwiseSolarLoad.style.display = 'block'; // Zeige Ladeanimation von Solar
    } else if (batteryStateReading === 'houseUnload') {
        clockwiseHouseUnload.style.display = 'block'; // Zeige Entladeanimation ins Haus
    }
}


// Funktion zum Abrufen der Readings von der FHEM-Seite
function fetchReadings() {
    const csrfToken = getCsrfToken();
    if (!csrfToken) return;

    const fetchUrl = `/fhem?detail=powerGrid&fwcsrf=${csrfToken}`;
    
    fetch(fetchUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(data => {
        // Extrahiere die Werte aus der Antwort
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, 'text/html');

        // Hilfsfunktion für Parsing mit Fallback auf "n/a"
        const getValueOrNA = (selector) => {
            const element = doc.querySelector(selector);
            if (!element) return "n/a";
            const value = parseFloat(element.textContent);
            return isNaN(value) ? "n/a" : value;
        };

        // Zahlenwerte mit optionalem Rundungs-Handling
        const getRoundedValueOrNA = (selector, decimals = 1) => {
            const value = getValueOrNA(selector);
            return value !== "n/a" ? parseFloat(value).toFixed(decimals) : value;
        };
        
        // Readings
        const solarReading = getValueOrNA("div[informid='powerGrid-solar_v']");
        const gridReading = getValueOrNA("div[informid='powerGrid-grid_v']");
        const gridReadingIn = getRoundedValueOrNA("div[informid='powerGrid-grid_in_v']");
        const gridReadingOut = getRoundedValueOrNA("div[informid='powerGrid-grid_out_v']");
        const batteryReading = getValueOrNA("div[informid='powerGrid-battery_v']");
        const batteryReading_p = getValueOrNA("div[informid='powerGrid-battery_p']");
        const houseReading = getValueOrNA("div[informid='powerGrid-house_v']");
        const airdryerReading = getValueOrNA("div[informid='powerGrid-airdryer_v']");
        const dishwasherReading = getValueOrNA("div[informid='powerGrid-dishwasher_v']");
        const dryerReading = getValueOrNA("div[informid='powerGrid-dryer_v']");
        const fridgeReading = getValueOrNA("div[informid='powerGrid-fridge_v']");
        const washerReading = getValueOrNA("div[informid='powerGrid-washer_v']");
        const lowcarbonReading = getValueOrNA("div[informid='powerGrid-lowcarbon_v']");
        const batteryStateReading = doc.querySelector("div[informid='powerGrid-batteryState_v']") ? doc.querySelector("div[informid='powerGrid-batteryState_v']").textContent : "stop";

        // Aktualisiere die entsprechenden SVG-Elemente
        document.getElementById('solarPower').textContent = solarReading + " W";
        document.getElementById('lowCarbonPower').textContent = lowcarbonReading + " %";
        document.getElementById('gridPower').textContent = gridReading + " W";
        document.getElementById('gridPowerIn').textContent = gridReadingIn + " kWh";
        document.getElementById('gridPowerOut').textContent = gridReadingOut + " kWh";
        document.getElementById('batteryPower').textContent = batteryReading + " W";
        document.getElementById('batteryPercent').textContent = batteryReading_p + " %";
        document.getElementById('housePower').textContent = houseReading + " W";
        document.getElementById('airdryerPower').textContent = airdryerReading + " W";
        document.getElementById('dishwasherPower').textContent = dishwasherReading + " W";
        document.getElementById('dryerPower').textContent = dryerReading + " W";
        document.getElementById('fridgePower').textContent = fridgeReading + " W";
        document.getElementById('washerPower').textContent = washerReading + " W";

        // Animationen basierend auf den Readings starten/stoppen
        updateAnimation('solarToHouse', solarReading > 0 ? 'on' : 'off');
        //updateAnimation('batteryToHouse', batteryToHouseReading);
        //updateAnimation('solarToBattery', solarToBatteryReading);
        updateAnimation('houseToAirdryer', airdryerReading > 0 ? 'on' : 'off');
        updateAnimation('houseToFridge', fridgeReading > 0 ? 'on' : 'off');
        updateAnimation('gridToLowCarbon', (gridReading > 0 || batteryStateReading === 'gridLoad') ? 'on' : 'off');
        updateAnimation('gridToHouse', gridReading > 0 ? 'on' : 'off');
        updateAnimation('houseToDryer', dryerReading > 0 ? 'on' : 'off');
        updateAnimation('houseToDishwasher', dishwasherReading > 0 ? 'on' : 'off');
        updateAnimation('solarToGrid', gridReading < 0 ? 'on' : 'off');
        //updateAnimation('gridToBattery', gridToBatteryReading);
        updateAnimation('houseToWasher', washerReading > 0 ? 'on' : 'off');


        // Aktualisiere die Ring-Segmente für Solar, Grid und Batterie
        // Wenn batteryState 'stop' oder 'backward' ist, den Battery-Wert nicht berücksichtigen
        if (batteryStateReading === 'stop' || batteryStateReading === 'gridLoad' || batteryStateReading === 'gridUnload' || batteryStateReading === 'solarLoad') {
            updateRing(parseFloat(solarReading), parseFloat(gridReading), 0);
        } else {
            updateRing(parseFloat(solarReading), parseFloat(gridReading), parseFloat(batteryReading));
        }

        // Battery Animation Handling
        //setBatteryAnimation(batteryStateReading);

        // Battery Animation Handling
        setBatteryState(batteryStateReading);

        // Grid-to-Battery Animation aktualisieren
        setGridToBatteryAnimation(batteryStateReading);
        
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });
}

// Funktion zum Initialisieren und zyklischen Aktualisieren
document.addEventListener('DOMContentLoaded', function() {
    fetchReadings();
    setInterval(fetchReadings, 5000); // Aktualisiere alle 5 Sekunden
});
