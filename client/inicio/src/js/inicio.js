$(document).ready(function () {
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
    const colors = {
        entrada: '#198754',
        salida: '#0e6698',
    };
    let userId;
    let lastReadQR = '';
    let inactivityTimeout;
    let delayQRTimeout;
    let sameQRTimeout;
    let mergeDatabasesTimer = null;
    let isSleepMode = false;
    let isScanning = true;
    let scanMode = 'entrada'; // Default mode
    let LocalStorageDatabaseSent = false; //default


    function setCookieToIdentifyUser() {
        const cookieValue = Math.random().toString(36).substring(7);
        // set the cookie to expire in 1 year
        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 1);
        document.cookie = `${cookieName}=${cookieValue}; expires=${expirationDate.toUTCString()}; path=/`;
        userId = cookieValue;
    }
    
    function setUserId() {
        const cookies = document.cookie.split(';');
        const userCookie = cookies.find((cookie) => cookie.includes(cookieName));
        if (!userCookie) {
            setCookieToIdentifyUser();
        } else {
            userId = userCookie.split('=')[1];
            console.log('Cookie recovered to identify user:', userId);
        }
    }

    setUserId();

    function setLastReadQR(qr) {//TODO checkear que esto tiene una pirueta ahi abajo
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
    
        storeDataInLocalStorage(idUser, uniqueHash);
        if (navigator.onLine) {
            sendDataToDatabase(idUser, uniqueHash);
        }
    
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


    function resetScanner(message= 'Apunta la cámara hacia el QR.') {
        scanAreaElement.style.backgroundColor = 'transparent';
        statusElement.textContent = message;
        isScanning = true;
    }

    function blockScanner(message, color= 'rgba(255, 0, 0, 0.5)', unblockButtonAlternativeText = null, addExtraButton = null) {
        scanAreaElement.style.backgroundColor = color;
        statusElement.textContent = message;
        unblockButton.style.display = 'flex';

        if(unblockButtonAlternativeText){
            unblockButton.textContent = unblockButtonAlternativeText
        }
        else{
            unblockButton.textContent = 'Continuar'
        }

        if(addExtraButton){
            buttonContainer.className = "d-flex justify-content-center two_buttons"
            extraButton.dataset.id = addExtraButton.id;  // Store idUser
            extraButton.dataset.hash = addExtraButton.hash; // Store uniqueHash
        }
        else{
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
        isScanning = false;
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

    }

    function resetInactivityTimer() {
        clearTimeout(inactivityTimeout);
        if (!isSleepMode) {
            inactivityTimeout = setTimeout(activateSleepMode, 120000); // 2 minutos :120000 
        }
    }

    

    function storeDataInLocalStorage(id, uniqueHash) {
        let inOrOut = 'in';
        if(scanMode === 'salida') inOrOut = 'out';

        const timestamp = new Date().toISOString();
        const LocalStorageDatabase = JSON.parse(localStorage.getItem("LocalStorageDatabase")) || [];
        LocalStorageDatabase.push({ id, inOrOut, timestamp, uniqueHash });
        localStorage.setItem("LocalStorageDatabase", JSON.stringify(LocalStorageDatabase));
        console.log("Datos guardados offline:", { id, inOrOut, timestamp, uniqueHash });
    }

    

    async function sendStoredLocalStorageData() {
       
        if (LocalStorageDatabaseSent) return;
        LocalStorageDatabaseSent = true; //para prevenir que se reenvie varias veces la misma req al detectar reconexion

        const LocalStorageDatabase = JSON.parse(localStorage.getItem("LocalStorageDatabase")) || [];
        if (LocalStorageDatabase.length === 0){
            console.log('No hay datos en el localStorage')
            LocalStorageDatabaseSent = false;
            return; // no se envia nada si no hay nada
        }
        console.log("Probando el envío de datos guardados en local...");
    
        try {
            const response = await $.ajax({
                url: "/qrReader/sendLocalStorageToDB",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(LocalStorageDatabase),
            });
            console.log("Datos enviados correctamente:", response);
    
        } catch (error) {
            console.error("Failed to send LocalData:", error);
    
        } finally {
            LocalStorageDatabaseSent = false; //reseteamos el status para poder enviar nueva data offline o si ha habido un error
        }
    }

    async function getUpdatedDatabase() {

        try {
            const response = await $.ajax({
                url: "/qrReader/getDatabase",
                type: "GET",
                dataType: "json",
            });
    
            console.log("Database retrieved successfully:", response);
    
            // Reemplazamos el LocalStorage con los nuevos datos
            localStorage.removeItem("LocalStorageDatabase"); 
            localStorage.setItem("LocalStorageDatabase", JSON.stringify(response)); 
            console.log("Local storage updated.");
    
        } catch (error) {
            console.error("Failed to fetch the updated database:", error);
            throw new Error("Unable to retrieve database. Please try again later.");
        }
    }
    
    

    // Function to send QR data to the backend
    function sendDataToDatabase(qrData, uniqueHash) {
        const url = scanMode === 'entrada' ? '/qrReader/in/' + qrData : '/qrReader/out/' + qrData;

        const data = { uniqueHash };

        return $.ajax({
            url: url,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (response) {
                // alert(response.status, 'STATUS');
                console.log(response)
                return response; 
            },
            error: function (err) {
                console.error('Error:', err);
                return { status: 'error' };
            }
        });
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
                    blockScanner('¡Esta persona debe firmar antes de entrar!', 'rgba(234, 202, 43, 0.5)','Pendiente', status);
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
                await sendStoredLocalStorageData();
            } catch (error) {
                console.error("Error sending local storage data:", error);
                throw new Error("Failed to send local storage data.");
            }

            try {
                await getUpdatedDatabase();
            } catch (error) {
                console.error("Error retrieving updated database:", error);
                throw new Error("Failed to retrieve updated database.");
            }

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
    const users = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    return users.includes(idUser);
}

function processQRValidation(idUser, uniqueHash = 'none') {
    // Retrieve localStorage database
    const LocalStorageDatabase = JSON.parse(localStorage.getItem("LocalStorageDatabase")) || [];
    
    // Find the last record for the id
    const lastUserRecord = LocalStorageDatabase.slice().reverse().find(record => record.id === idUser);
    
    if (scanMode === 'entrada') {
 
        if (!lastUserRecord ) {
            
            if (checkIfMustSign(idUser)) { //no user record and has to sign=> check for sign
                return {message:'must_sign', id: idUser, hash: uniqueHash};
            } else { //no user record => then can get in
                storeDataInLocalStorage(idUser, uniqueHash);
                if (navigator.onLine) sendDataToDatabase(idUser, uniqueHash);
                return {message:'ok'};
            }
        } else if (lastUserRecord.inOrOut === 'out') { // Last action was "out" => allow entry

            storeDataInLocalStorage(idUser, uniqueHash)
            if (navigator.onLine) sendDataToDatabase(idUser, uniqueHash);
           return {message:'was_out'};
        } else {
            // Already in
            return {message:'already_in'};
        }
    } else if (scanMode === 'salida') {

        if (!lastUserRecord) { //no user record => can't get in
            return {message:'not_in'};
        } else if (lastUserRecord.inOrOut === 'in') { // Last action was "in" => allow exit
            storeDataInLocalStorage(idUser, uniqueHash)
            if (navigator.onLine) sendDataToDatabase(idUser, uniqueHash);
            return {message:'was_in'};
        } else {
            // Already out
            return {message:'already_out'};
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
                clearTimeout(delayQRTimeout); // resetea el timer para el delay generico entre lecturas
                setLastReadQR(result);
                
                isScanning = false; // Disable scanning until response is received
                statusElement.textContent = 'Procesando QR...';
                console.log('Decoded QR Code:', result);

                if (!result.startsWith("https://www.camarabadajoz.es/talentday/attendance")) {
                    blockScanner('QR inválido!', 'rgba(255, 0, 0, 0.5)');
                    audioUnvalidated.play()
                    return;
                }
                const idMatch = result.match(/\/attendance\/(\d+)$/);

                //TODO !!!!!!
                // ver si el QR de la respuesta es el mismo que el QR que se ha mandado, hacer esto
                try {
                    const miliseconds = new Date().getTime();
                    const uniqueHash = miliseconds+ '---' + userId;

                    const response = processQRValidation(idMatch[1], uniqueHash);
                    handleResponse(response); 

                } catch (error) {
                    console.error("Failed to send QR data:", error);
                    
                }
               
            }
        },

        {
            highlightScanRegion: true, // Highlight the scan region
            highlightCodeOutline: true, // Highlight detected QR code outline
            maxScansPerSecond: 5, // Limit scans to 5 per second to save battery life
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

    // Cambiar el ScanMode
    toggleModeButton.addEventListener('click', function () {
        scanMode = scanMode === 'entrada' ? 'salida' : 'entrada';

        // Update the UI based on the new mode
        modeIndicator.textContent = scanMode.toUpperCase();
        // modeIndicator.className = scanMode === 'entrada' ? "badge bg-success mt-3 fs-5" : "badge bg-primary mt-3 fs-5"; 
        modeIndicator.style.backgroundColor = colors[scanMode];
        scanAreaElement.style.borderColor = colors[scanMode];
        videoContainer.className  = scanMode === 'entrada' ? 'position-relative w-100 entrada' : 'position-relative w-100 salida'
        headerSection.className = scanMode === 'entrada' ? 'header-section' : 'header-section salida';
        // I need it to use the oppopsite color of the scanMode
        toggleModeButton.style.backgroundColor = scanMode === 'entrada' ? colors.salida : colors.entrada;
        toggleModeButton.innerHTML = scanMode === 'entrada'
            ? '<i class="fa-solid fa-right-from-bracket"></i>'
            : '<i class="fa-solid fa-person-walking"></i>';
    });

    function initializeScanner() {  
        adjustScanArea(); //adjusting the scan area
        resetInactivityTimer(); //reseting the timer to enter sleep mode
        startQrScanner();     // Starting the scanner
    }

    initializeScanner();


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
        if(isSleepMode === false){
            if (window.innerWidth > window.innerHeight) {
    
                activateNoRotationMode();
              } else {
                desactivateNoRotationMode();
              }
        }
        else{
            return;
        }
}

// Adjust on page load and whenever orientation changes
window.addEventListener("load", adjustForOrientation);
window.addEventListener("resize", adjustForOrientation);

// LLama mergeLocalStorageWithDatabase cada segundo
setInterval(mergeLocalStorageWithDatabase, 1000);

});


$(document).on('click', '#refresh-button',  function () {
    location.reload();
})