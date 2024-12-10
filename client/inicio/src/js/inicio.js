$(document).ready(function () {
    const debugging = 'desktop'; // mobile, desktop, both, false
    const audioValidated = new Audio('../sounds/valid.mp3');
    const audioUnvalidated = new Audio('../sounds/unvalid.mp3');
    const audioSignWaiver = new Audio('../sounds/sign_waiver.mp3');
    const videoElement = document.getElementById('video');
    const videoContainer = document.getElementById('video-container');
    const scanAreaElement = document.getElementById('scan-area');
    const statusElement = document.getElementById('status');
    const modeIndicator = document.getElementById('mode-indicator');
    const toggleModeButton = document.getElementById('toggle-mode-button');
    const unblockButton = document.getElementById('unblock-button');
    const extraButton = document.getElementById('extra-button');
    const buttonContainer = document.getElementById('button-container');
    const refreshButton = document.getElementById('refresh-button');
    const headerSection = document.getElementById('header-section');
    const sleepIcon = document.getElementById('sleep-icon');
    const cookieName = 'talentday-qr-reader';
    // write to 1000 entries in the allowedhashes object with numbers from 1 to 1000 and value true for all of them
    // const allowedhashes = { ...Array.from({ length: 1000 }, (_, i) => [i + 1, true]) };
    const colors = {
        entrada: '#198754',
        salida: '#0e6698',
    };
    let idDevice;
    let lastReadQR = '';
    let inactivityTimeout;
    // let delayQRTimeout;
    let sameQRTimeout;
    let mergeDatabasesTimer = null;
    let isSleepMode = false;
    let isScanning = true;
    let scanMode = 'entrada'; // Default mode
    let LocalStorageDatabaseSent = false; //default

    let log = (message) => { }

    switch (debugging) {
        case 'mobile':
            log = alert;
            break;
        case 'desktop':
            log = console.log;
            break;
        case 'both': // check if mobile device
            if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                log = alert;
            } else {
                log = console.log
            }
            break;
        default:
            log = () => { };
    }


    function setCookieToIdentifyDevice() {
        const cookieValue = Math.random().toString(36).substring(7);
        // set the cookie to expire in 1 year
        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 1);
        document.cookie = `${cookieName}=${cookieValue}; expires=${expirationDate.toUTCString()}; path=/`;
        idDevice = cookieValue;
    }

    function setidDevice() {
        const cookies = document.cookie.split(';');
        const userCookie = cookies.find((cookie) => cookie.includes(cookieName));
        if (!userCookie) {
            setCookieToIdentifyDevice();
        } else {
            idDevice = userCookie.split('=')[1];
            console.log('Cookie recovered to identify user:', idDevice);
        }
    }

    setidDevice();

    function setLastReadQR(qr) {
        lastReadQR = qr;
        clearTimeout(sameQRTimeout) //resetea el timer del delay por mismo QR
        sameQRTimeout = setTimeout(() => {
            if (lastReadQR === qr) {
                lastReadQR = '';
            }
        }, 5000);
    }

    function didIJustReadThisQR(qr) {
        return lastReadQR === qr;
    }

    unblockButton.addEventListener('click', function () {
        if (isSleepMode) {
            exitSleepMode();
        } else {
            unblockScanner();
        }
    });

    extraButton.addEventListener('click', function () {
        const idUser = this.dataset.id;
        const uniqueHash = this.dataset.hash;

        sendToDB(idUser, uniqueHash);


        unblockScanner();
    });

    // Function to dynamically position the scan area
    function adjustScanArea() {
        const containerWidth = window.innerWidth;
        const containerHeight = window.innerHeight;

        // Set the size of the scan area as 75% of the smaller screen dimension
        const scanAreaSize = Math.min(containerWidth, containerHeight) * 0.75;

        // Apply size and center the scan area
        scanAreaElement.style.width = `${scanAreaSize}px`;
        scanAreaElement.style.height = `${scanAreaSize}px`;
        scanAreaElement.style.top = `${(containerHeight - scanAreaSize) / 2}px`;
        scanAreaElement.style.left = `${(containerWidth - scanAreaSize) / 2}px`;
    }


    function resetScanner(message = 'Apunta la cámara hacia el QR.') {
        scanAreaElement.style.backgroundColor = 'transparent';
        statusElement.textContent = message;
        isScanning = true;
    }

    function blockScanner(message, color = 'rgba(255, 0, 0, 0.5)', unblockButtonAlternativeText = null, addExtraButton = null) {
        scanAreaElement.style.backgroundColor = color;
        statusElement.textContent = message;

        unblockButton.style.display = 'flex';
        unblockButton.textContent = unblockButtonAlternativeText || 'Continuar'

        if (addExtraButton) {
            buttonContainer.className = "d-flex justify-content-center two_buttons"
            extraButton.dataset.id = addExtraButton.id;  // Store idUser
            extraButton.dataset.hash = addExtraButton.hash; // Store uniqueHash
        } else {
            buttonContainer.className = "d-flex justify-content-center single_button"
        }

        isScanning = false;

    }

    function unblockScanner() {
        resetScanner()
        unblockButton.style.display = 'none';
        buttonContainer.className = "d-flex justify-content-center single_button"
    }


    // Call the function initially and on window resize
    window.addEventListener('resize', adjustScanArea);


    // Sleep mode functions
    function activateSleepMode() {
        isSleepMode = true;
        isScanning = false;
        videoContainer.style.display = 'none';
        headerSection.style.display = 'none';
        refreshButton.style.display = "none";
        videoElement.style.display = 'none';
        scanAreaElement.style.display = 'none';
        statusElement.style.display = 'none';
        modeIndicator.style.display = 'none';
        toggleModeButton.style.display = 'none';
        sleepIcon.style.display = 'block';
        unblockButton.style.display = 'flex';
        unblockButton.textContent = 'Escanear';
        buttonContainer.className = "d-flex justify-content-center single_button"

        // extraButton.style.display = 'flex'; 

        document.body.classList.add('sleep-mode');

        qrScanner.stop();
    }

    function exitSleepMode() {
        isSleepMode = false;
        isScanning = true;
        videoContainer.style.display = 'flex';
        headerSection.style.display = 'flex';
        refreshButton.style.display = 'flex';
        videoElement.style.display = 'block';
        scanAreaElement.style.display = 'block';
        statusElement.style.display = 'block';
        modeIndicator.style.display = 'block';
        toggleModeButton.style.display = 'flex';
        sleepIcon.style.display = 'none';
        unblockButton.textContent = 'Seguir';

        document.body.classList.remove('sleep-mode');

        unblockScanner();
        resetInactivityTimer();

        startQrScanner();

    }

    function resetInactivityTimer() {
        clearTimeout(inactivityTimeout);
        if (!isSleepMode) {
            inactivityTimeout = setTimeout(activateSleepMode, 60000);
        }
    }



    function sendToDB(id, uniqueHash) {
        let inOrOut = scanMode === 'salida' ? 'out' : 'in';

        saveInLocalStorage(id, uniqueHash, inOrOut);
        sendToServer(id, uniqueHash, inOrOut);
    }


    // Function to send QR data to the backend
    function sendToServer(_userId, uniqueHash, inOrOut) {


        if (!navigator.onLine) return
        const url = `/qrReader/record/`

        const data = { uniqueHash, idDevice, idUser: _userId, inOrOut };

        return $.ajax({
            url: url,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (response) {
                log(response)
                return response;
            },
            error: function (err) {
                console.error('Error:', err);
                return { status: 'error' };
            }
        });
    }

    function saveInLocalStorage(id, uniqueHash, inOrOut) {

        const LocalStorageDatabase = JSON.parse(localStorage.getItem("LocalStorageDatabase")) || [];
        LocalStorageDatabase.push({ id, inOrOut, uniqueHash, idDevice });
        localStorage.setItem("LocalStorageDatabase", JSON.stringify(LocalStorageDatabase));
    }



    async function uploadAndRefreshLocalDb() {

        if (LocalStorageDatabaseSent) return;
        LocalStorageDatabaseSent = true; //para prevenir que se reenvie varias veces la misma req al detectar reconexion

        const LocalStorageDatabase = JSON.parse(localStorage.getItem("LocalStorageDatabase")) || [];

        log("Probando el envío de datos guardados en local...");
        const onlyThisDeviceData = LocalStorageDatabase.filter(record => record.idDevice === idDevice || !record.idDevice);
        try {
            const response = await $.ajax({
                url: "/qrReader/sendLocalStorageToDB",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(onlyThisDeviceData),
            });
            log("Datos enviados correctamente:", response);
            // Retrieve the existing local storage data
            const localStorageData = JSON.parse(localStorage.getItem("LocalStorageDatabase")) || [];

            // Merge the server response with the local storage data
            const mergedData = mergeDatabases(localStorageData, response);

            // Save the merged data back to local storage
            localStorage.setItem("LocalStorageDatabase", JSON.stringify(mergedData));
            log("Local storage updated.");

        } catch (error) {
            console.error("Failed to send LocalData:", error);

        } finally {
            LocalStorageDatabaseSent = false; //reseteamos el status para poder enviar nueva data offline o si ha habido un error
        }
    }

    async function getDataFromServer() {

        try {
            const response = await $.ajax({
                url: "/qrReader/getDatabase",
                type: "GET",
                dataType: "json",
            });

            log("Database retrieved successfully:", response);

            // we merge the local storage with the response from the server

            // Retrieve the existing local storage data
            const localStorageData = JSON.parse(localStorage.getItem("LocalStorageDatabase")) || [];

            // Merge the server response with the local storage data
            const mergedData = mergeDatabases(localStorageData, response);

            // Save the merged data back to local storage
            localStorage.setItem("LocalStorageDatabase", JSON.stringify(mergedData));
            log("Local storage updated.");

        } catch (error) {
            console.error("Failed to fetch the updated database:", error);
            throw new Error("Unable to retrieve database. Please try again later.");
        }
    }

    function mergeDatabases(localData, serverData) {

        return serverData;
        /*
        Creo que no es necesario hacer cremallera ahora que los datos del servidor llegan como respuesta al enviar los datos locales
        pero podría salir mal si justo hay la casualidad de que se lee un QR justo mientras llegaba y además falla el envio al servidor...
        aun asi no esta bien del todo tampoco porq creo que como esta haría crecer mucho el request ya se enviaría siempre todo el historial de este dispositivo
        sería mejor algo que lleve el registro de elementos ya enviados y recidibidos y solo haga cremallera de lo que no se han recibido en el servidor...

        */
        const mergedData = [...serverData];
        const thisDeviceRecordedData = localData.filter(record => record.idDevice === idDevice || !record.idDevice);
        for (const record of thisDeviceRecordedData) {
            const existingRecord = mergedData.find(item => item.uniqueHash === record.uniqueHash);
            if (!existingRecord) {
                mergedData.push(record);
            }
        }

        return mergedData;
    }




    // Update UI based on the response
    function handleResponse(status) {


        if (scanMode == 'entrada') {
            switch (status.message) {
                case 'ok':
                    blockScanner('¡Bienvenid@!', 'rgba(0, 255, 0, 0.4)')
                    audioValidated.play();
                    // delayQRTimeout = setTimeout(() => {
                    //     unblockScanner();
                    // }, 2000);
                    break;

                case 'already_in':
                    blockScanner('Esta persona ya ha entrado', 'rgba(255, 0, 0, 0.5)');
                    audioUnvalidated.play()
                    break;

                case 'was_out':
                    blockScanner('Este usuario había salido, puede entrar', 'rgba(0, 255, 0, 0.4)');
                    audioValidated.play();
                    break;
                case 'must_sign':
                    blockScanner('¡Esta persona debe firmar antes de entrar!', 'rgba(234, 202, 43, 0.5)', 'Pendiente', status);
                    audioSignWaiver.play();
                    break;

                default:
                    statusElement.textContent = 'Hay algún error con el QR!';
                    break;
            }

        } else {

            switch (status.message) {

                case 'was_in':
                    blockScanner('Puede salir', 'rgba(0, 0, 255, 0.5)');
                    audioValidated.play();
                    // setTimeout(() => {
                    //     unblockScanner();
                    // }, 2000);
                    break;

                case 'already_out':
                    blockScanner('Leer de entrada', 'rgba(255, 0, 0, 0.5)');
                    audioUnvalidated.play()
                    break;

                case 'not_in':
                    blockScanner('No consta que hubiera entrado, leer de entrada', 'rgba(255, 0, 0, 0.5)');
                    audioUnvalidated.play()
                    break;

                default:
                    statusElement.textContent = 'Error procesando QR!';
                    break;
            }


        }

    }



    // Function to check online status and merge with database
    async function mergeLocalStorageWithDatabase() {
        try {
            if (navigator.onLine && !mergeDatabasesTimer) {
                console.log("The browser is online, and at least 1 minute has passed since last merge. Data can be merged.");

                try {
                    await uploadAndRefreshLocalDb();
                } catch (error) {
                    console.error("Error sending local storage data:", error);
                    throw new Error("Failed to send local storage data.");
                }

                // try { // data is being sent as response at previous step
                //     await getDataFromServer();
                // } catch (error) {
                //     console.error("Error retrieving updated database:", error);
                //     throw new Error("Failed to retrieve updated database.");
                // }

                //contador de 60secs para entrar en la logica cada minuto online
                mergeDatabasesTimer = setTimeout(() => {
                    mergeDatabasesTimer = null;
                }, 60000); // 1 minute = 60000 ms

            } else if (!navigator.onLine) {
                console.log("The browser is offline.");
            }
        } catch (error) {
            console.error("An error occurred during the merge operation:", error);
        }
    }


    const checkIfMustSign = (idUser) => {

        const must_sign_array = { 1230: true, 792: true, 1259: true, 1036: true, 901: true, 1256: true, 355: true, 972: true, 830: true, 907: true, 520: true, 1234: true, 835: true, 951: true, 932: true, 30: true, 667: true, 1096: true, 690: true, 1091: true, 524: true, 1080: true, 209: true, 545: true, 1100: true, 624: true, 219: true, 220: true, 1333: true, 1221: true, 777: true, 1226: true, 457: true, 1423: true, 1117: true, 1317: true, 32: true, 1105: true, 1037: true, 862: true, 1160: true, 1112: true, 1327: true, 1575: true, 1255: true, 1050: true, 1143: true, 1233: true, 1268: true, 1099: true, 1120: true, 1153: true, 585: true, 784: true, 1422: true, 622: true, 1157: true, 802: true, 891: true, 589: true, 829: true, 1150: true, 686: true, 134: true, 699: true, 1210: true, 1264: true, 705: true, 786: true, 1413: true, 544: true, 211: true, 1483: true, 1161: true, 1263: true, 1101: true, 574: true, 1269: true, 1410: true, 605: true, 996: true, 611: true, 728: true, 697: true, 896: true, 1414: true, 1243: true, 1266: true, 1085: true, 691: true, 958: true, 594: true, 937: true, 588: true, 413: true, 790: true, 685: true, 864: true, 689: true, 943: true, 271: true, 1124: true, 849: true, 523: true, 884: true, 518: true, 593: true, 921: true, 309: true, 164: true, 866: true, 971: true, 591: true, 1435: true, 964: true, 773: true, 687: true, 623: true }
        log('must_sign_array[idUser]', must_sign_array[idUser])
        return must_sign_array[idUser];
    }
    function processQRValidation(idUser) {
        // Retrieve localStorage database

        const miliseconds = new Date().getTime();
        const uniqueHash = miliseconds + '---' + idDevice;

        const LocalStorageDatabase = JSON.parse(localStorage.getItem("LocalStorageDatabase")) || [];

        // Find the last record for the id
        const lastUserRecord = LocalStorageDatabase.slice().reverse().find(record => record.id === idUser);

        if (scanMode === 'entrada') {

            if (!lastUserRecord) {

                if (checkIfMustSign(idUser)) { //no user record and has to sign=> check for sign
                    return { message: 'must_sign', id: idUser, hash: uniqueHash };
                } else { //no user record => then can get in
                    sendToDB(idUser, uniqueHash);
                    return { message: 'ok' };
                }
            } else if (lastUserRecord.inOrOut === 'out') { // Last action was "out" => allow entry

                sendToDB(idUser, uniqueHash)
                return { message: 'was_out' };
            } else {
                // Already in
                return { message: 'already_in' };
            }
        } else if (scanMode === 'salida') {

            if (!lastUserRecord) { //no user record => can't get in
                return { message: 'not_in' };
            } else if (lastUserRecord.inOrOut === 'in') { // Last action was "in" => allow exit
                sendToDB(idUser, uniqueHash)

                return { message: 'was_in' };
            } else {
                // Already out
                return { message: 'already_out' };
            }
        }
    }

    function flushLocalStorage() {
        localStorage.removeItem("LocalStorageDatabase");
        console.log("Local storage flushed.");
    }
    flushLocalStorage(); //TODO     !!




    // Initialize the QR Scanner
    const qrScanner = new QrScanner(
        videoElement,
        async (_result) => {
            const result = _result.data;
            if (isScanning) {

                if (didIJustReadThisQR(result)) {
                    return;
                }

                resetInactivityTimer(); // Resetea el timer de inactividad para sleep mode
                // clearTimeout(delayQRTimeout); // resetea el timer para el delay generico entre lecturas
                setLastReadQR(result);

                isScanning = false; // Disable scanning until response is received
                statusElement.textContent = 'Procesando QR...';
                log('Decoded QR Code:', result);

                const [qrUrl, idMatch] = result.split('attendance/');
                log(idMatch)
                log(isNaN(parseInt(idMatch)))
                log(isNaN(idMatch))
                function isNumeric(value) {
                    return /^\d+$/.test(value);
                }
                log('isNumeric(idMatch)', isNumeric(idMatch))
                if (qrUrl !== "https://www.camarabadajoz.es/talentday/" || !idMatch || !isNumeric(idMatch) || parseInt(idMatch) > 1860) {
                    blockScanner('QR inválido!', 'rgba(255, 0, 0, 0.5)');
                    audioUnvalidated.play();
                    return;
                }


                try {

                    const response = processQRValidation(idMatch);
                    handleResponse(response);

                } catch (error) {
                    log("Failed:  " + error);

                }

            }
        },

        {
            highlightScanRegion: true, // Highlight the scan region
            highlightCodeOutline: true, // Highlight detected QR code outline
            maxScansPerSecond: 3, // Limit scans to 5 per second to save battery life
            // scanRegion: {
            //     x: 0,
            //     y: 0,
            //     width: 0.8,
            //     height: 0.8,
            // },

        }
    );

    function startQrScanner() {

        qrScanner
            .start()
            .then(() => {

                statusElement.textContent = 'Apunta la cámara hacia el QR.';
            })
            .catch((error) => {
                console.error('Camera initialization failed:', error);
                statusElement.textContent =
                    'No se ha podido acceder a la cámara. Verifica que se han habilitado los permisos.';
            });
    }

    const opposite = {
        entrada: 'salida',
        salida: 'entrada'
    }


    function initializeScanner() {
        adjustScanArea(); //adjusting the scan area
        resetInactivityTimer(); //reseting the timer to enter sleep mode
        startQrScanner();     // Starting the scanner
    }

    initializeScanner();

    //  --------------------------------   DEVICE ORIENTATION LOGIC  --------------------------------
    function activateNoRotationMode() {

        headerSection.style.display = 'none';
        refreshButton.style.display = "none";
        videoElement.style.display = 'none';
        scanAreaElement.style.display = 'none';
        statusElement.textContent = 'Desactiva la rotación automática o vuelve a rotar tu teléfono.';
        modeIndicator.style.display = 'none';
        toggleModeButton.style.display = 'none';
        unblockButton.style.display = 'none';
        unblockButton.textContent = 'Escanear';
        isScanning = false;
    }

    function desactivateNoRotationMode() {

        headerSection.style.display = 'flex';
        refreshButton.style.display = 'flex';
        videoElement.style.display = 'block';
        scanAreaElement.style.display = 'block';
        statusElement.style.display = 'block';
        modeIndicator.style.display = 'block';
        toggleModeButton.style.display = 'flex';
        sleepIcon.style.display = 'none';
        unblockButton.textContent = 'Continuar';
        isScanning = true;
        unblockScanner();
    }

    function adjustForOrientation() {
        if (isSleepMode === false) {
            if (window.innerWidth > window.innerHeight) {

                activateNoRotationMode();
            } else {
                desactivateNoRotationMode();
            }
        }
        else {
            return;
        }
    }

    // --------------------------------   LISTENERS  --------------------------------
    // Adjust on page load and whenever orientation changes
    window.addEventListener("load", adjustForOrientation);
    window.addEventListener("resize", adjustForOrientation);


    toggleModeButton.addEventListener('click',
        function changeScanMode() {
            //scanMode = scanMode === 'entrada' ? 'salida' : 'entrada';
            scanMode = opposite[scanMode];

            // Update the UI based on the new mode
            modeIndicator.textContent = scanMode.toUpperCase();
            // modeIndicator.className = scanMode === 'entrada' ? "badge bg-success mt-3 fs-5" : "badge bg-primary mt-3 fs-5"; 
            modeIndicator.style.backgroundColor = colors[scanMode];
            scanAreaElement.style.borderColor = colors[scanMode];
            //videoContainer.className  = scanMode === 'entrada' ? 'position-relative w-100 entrada' : 'position-relative w-100 salida'
            $(videoContainer).removeClass(opposite[scanMode]);
            $(videoContainer).addClass(scanMode);
            //headerSection.className = scanMode === 'entrada' ? 'header-section' : 'header-section salida';
            $(headerSection).removeClass(opposite[scanMode]);
            $(headerSection).addClass(scanMode);
            // I need it to use the oppopsite color of the scanMode
            toggleModeButton.style.backgroundColor = colors[opposite[scanMode]];
            toggleModeButton.innerHTML = scanMode === 'entrada'
                ? '<i class="fa-solid fa-right-from-bracket"></i>'
                : '<i class="fa-solid fa-person-walking"></i>';
        }
    );

    // LLama mergeLocalStorageWithDatabase cada 10 segundos, se puede tocar para casos de conexión muy irregular
    setInterval(mergeLocalStorageWithDatabase, 10000);

    // before unload event

    $(document).on('click', '#refresh-button', async function () {
        try {
            await uploadAndRefreshLocalDb();
        } catch (error) {
            console.error("Error sending local storage data:", error);
            throw new Error("Failed to send local storage data.");
        }
        location.reload();
    })

});
