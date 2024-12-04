$(document).ready(function () {
    const audioValidated = new Audio('../sounds/valid.mp3');
    const audioUnvalidated = new Audio('../sounds/unvalid.mp3');
    const videoElement = document.getElementById('video');
    const scanAreaElement = document.getElementById('scan-area');
    const statusElement = document.getElementById('status');
    const modeIndicator = document.getElementById('mode-indicator');
    const toggleModeButton = document.getElementById('toggle-mode-button');
    const unblockButton = document.getElementById('unblock-button');
    const refreshButton = document.getElementById('refresh-button');
    const sleepIcon = document.getElementById('sleep-icon');
    const cookieName = 'talentday-qr-reader';
    let userId;
    let lastReadQR = '';
    let inactivityTimeout;
    let delayQRTimeout;
    let sameQRTimeout;
    let mergeDatabasesTimer = null;
    let isSleepMode = false;
    let isScanning = true;
    let scanMode = 'entrada'; // Default mode

    function setCookieToIdentifyUser() {
        const cookieValue = Math.random().toString(36).substring(7);
        // set the cookie to expire in 1 year
        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 1);
        document.cookie = `${cookieName}=${cookieValue}; expires=${expirationDate.toUTCString()}; path=/`;
        userId = userCookie.split('=')[1];
        console.log('Cookie set to identify user:', userId);
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

    function blockScanner(message, color= 'rgba(255, 0, 0, 0.5)') {
        scanAreaElement.style.backgroundColor = color;
        statusElement.textContent = message;
        unblockButton.style.display = 'flex';
        isScanning = false;
    }

    function unblockScanner() {
        resetScanner()
        unblockButton.style.display = 'none';
    }


    // Call the function initially and on window resize
    window.addEventListener('resize', adjustScanArea);


    //mucho ojo con declarar listeners dentro de un listener!!!, igual que cargar los audios y demas
    // botonPasar.onclick = () => {
    //     resetScanner();
    //     botonPasar.style.display = 'none';
    // };


    // Sleep mode functions
    function activateSleepMode() {
        isSleepMode = true;
        refreshButton.style.display = "none"
        videoElement.style.display = 'none';
        scanAreaElement.style.display = 'none';
        statusElement.style.display = 'none'; 
        modeIndicator.style.display = 'none';
        toggleModeButton.style.display = 'none'; 
        sleepIcon.style.display = 'block'; 
        unblockButton.style.display = 'flex'; 
        unblockButton.textContent = 'Escanear'; 

        document.body.classList.add('sleep-mode');
    }

    function exitSleepMode() {
        isSleepMode = false;
        refreshButton.style.display = 'flex'; 
        videoElement.style.display = 'block';
        scanAreaElement.style.display = 'block'; 
        statusElement.style.display = 'block'; 
        modeIndicator.style.display = 'block'; 
        toggleModeButton.style.display = 'flex'; 
        sleepIcon.style.display = 'none'; 
        unblockButton.style.display = 'none'; 
        unblockButton.textContent = 'Seguir'; 

        document.body.classList.remove('sleep-mode');

        resetInactivityTimer();

    }

    function resetInactivityTimer() {
        clearTimeout(inactivityTimeout);
        if (!isSleepMode) {
            inactivityTimeout = setTimeout(activateSleepMode, 180000); // 3 minutos :180000 
        }
    }

    
    //------OFFLINE QR DATA SAVING------------
    let offlineDataSent = false;

    function storeDataInLocalStorage(id, scanMode) {
        let inOrOut = 'in';
        if(scanMode === 'salida') inOrOut = 'out';

        const timestamp = new Date().toISOString();
        const offlineData = JSON.parse(localStorage.getItem("LocalStorageDatabase")) || [];
        offlineData.push({ id, inOrOut, timestamp });
        localStorage.setItem("LocalStorageDatabase", JSON.stringify(offlineData));
        console.log("Datos guardados offline:", { id, inOrOut, timestamp });
    }

    

    async function sendStoredLocalStorageData() {

        if (offlineDataSent) return;
        offlineDataSent = true; //para prevenir que se reenvie varias veces la misma req al detectar reconexion

        const offlineData = JSON.parse(localStorage.getItem("LocalStorageDatabase")) || [];
        if (offlineData.length === 0){
            console.log('No hay datos en el localStorage')
            offlineDataSent = false;
            return; // no se envia nada si no hay nada
        }
        console.log("Probando el envío de datos offline...");
    
        try {
            const response = await $.ajax({
                url: "/qrReader/offline",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(offlineData),
            });
            console.log("Datos enviados correctamente:", response);
    
        } catch (error) {
            console.error("Failed to send offline data (WE ARE SUPPOSEDLY ONLINE):", error);
    
        } finally {
            offlineDataSent = false; //reseteamos el status para poder enviar nueva data offline o si ha habido un error
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
    function sendQRCodeData(qrData) {
        // const shortRandomString = Math.random().toString(36).substring(7);
        const url = scanMode === 'entrada' ? '/qrReader/in/' + qrData : '/qrReader/out/' + qrData;

        const miliseconds = new Date().getTime();

        const uniqueHash = miliseconds+ '---' + userId;
        const data = { uniqueHash };

        return $.ajax({
            url: url,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data),
            success: function (response) {
                // alert(response.status, 'STATUS');
                return response; 
            },
            error: function (err) {
                console.error('Error:', err);
                if (scanMode == 'entrada') {
             
                    blockScanner('Bienvenid@!', 'rgba(0, 255, 0, 0.2)')
                    audioValidated.play();
                    delayQRTimeout = setTimeout(() => {
                         unblockScanner();
                    }, 2000);
                }
                else {
                    blockScanner('Hasta la próxima!', 'rgba(0, 255, 0, 0.2)');
                    audioValidated.play();
                    setTimeout(() => {
                        unblockScanner();
                    }, 2000);
                }
                return { status: 'error' };
            }
        });
    }

    // Update UI based on the response
    function handleResponse(status) {
       

        if (scanMode == 'entrada') {
            switch (status) {
                case 'ok':
                    blockScanner('Bienvenid@!', 'rgba(0, 255, 0, 0.2)')
                    audioValidated.play();
                    delayQRTimeout = setTimeout(() => {
                        unblockScanner();
                    }, 2000);
                   break;

                case 'already_in':
                    blockScanner('QR ya usado!', 'rgba(255, 0, 0, 0.5)');
                    audioUnvalidated.play()
                    break;

                case 'was_out':
                    //TODO
                    blockScanner('Este usuario había salido', 'rgba(0, 0, 255, 0.5)');
                    audioValidated.play();
                    delayQRTimeout = setTimeout(() => {
                        unblockScanner();
                    }, 2000);
                    break;
                default:
                    statusElement.textContent = 'Error procesando QR!'
                    break;
            }

        } else {

            switch (status) {

                case 'was_in':
                    blockScanner('Hasta la próxima!', 'rgba(0, 255, 0, 0.2)');
                    audioValidated.play();
                    setTimeout(() => {
                        unblockScanner();
                    }, 2000);
                    break;

                case 'already_out':
                    blockScanner('Esta persona ya estaba fuera?', 'rgba(255, 0, 0, 0.5)');
                    audioUnvalidated.play()
                    break;

                case 'not_in':
                    blockScanner('No consta que hubiera entrado! Leelo de entrada porfavor', 'rgba(255, 0, 0, 0.5)');
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


    // Initialize the QR Scanner
    const qrScanner = new QrScanner(
        videoElement,
        async (result) => {
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
                console.log(idMatch[1])

                //TODO !!!!!!
                // aqui el fall back de que pasa si se pierde un poco la conexion. me ha pasado en mi casa!!
                // Send QR data to the backend
                // creo que hay un problema al hacerlo asi, mejor usar wait y async
                // también ver si el QR de la respuesta es el mismo que el QR que se ha mandado, hacer esto
                try {
                    const response = await sendQRCodeData(idMatch[1]);

                    handleResponse(response.status);
                } catch (error) {
                    console.error("Failed to send QR data (SERVER OFFLINE):", error);
                    storeDataInLocalStorage(idMatch[1],scanMode); // Guardar data offline
                }
               
            }
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
        modeIndicator.className = scanMode === 'entrada' ? "badge bg-success mt-3 fs-5" : "badge bg-primary mt-3 fs-5"; 
        scanAreaElement.style.borderColor = scanMode === 'entrada' ? '#198754' : '#0d6efd';
        toggleModeButton.style.backgroundColor =   scanMode === 'entrada' ?  '#0d6efd' : '#198754';
        toggleModeButton.innerHTML = scanMode === 'entrada'
            ? '<i class="fa-solid fa-right-from-bracket"></i>'
            : '<i class="fa-solid fa-person-walking"></i>';
    });

    function initializeScanner() {  
    adjustScanArea(); //adjusting the scan area
    resetInactivityTimer(); //reseting the timer to enter sleep mode
    checkForConnection(); //checking for connection to send stored Data
    startQrScanner();     // Starting the scanner
    }

    initializeScanner();


// LLama mergeLocalStorageWithDatabase cada segundo
setInterval(mergeLocalStorageWithDatabase, 1000);

});


$(document).on('click', '#refresh-button',  function () {
    location.reload();
})