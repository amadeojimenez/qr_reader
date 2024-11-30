$(document).ready(function () {
    const audioValidated = new Audio('../sounds/valid.mp3');
    const audioUnvalidated = new Audio('../sounds/unvalid.mp3');
    const videoElement = document.getElementById('video');
    const scanAreaElement = document.getElementById('scan-area');
    const statusElement = document.getElementById('status');
    const modeIndicator = document.getElementById('mode-indicator');
    const toggleModeButton = document.getElementById('toggle-mode-button');
    const unblockButton = document.getElementById('unblock-button');
    // const botonPasar = document.getElementById('pasar-button');
    const sleepIcon = document.getElementById('sleep-icon');
    let lastReadQR = '';
    let inactivityTimeout;
    let delayQRTimeout;
    let sameQRTimeout;
    let isSleepMode = false;

    function setLastReadQR(qr) {//TODO checkear que esto tiene una pirueta ahi abajo
        lastReadQR = qr;
        resetInactivityTimer(); // Resetea el timer de inactividad para sleep mode
        clearTimeout(delayQRTimeout) // resetea el timer para el delay generico entre lecturas
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
    let isScanning = true;
    let scanMode = 'entrada'; // Default mode

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
            inactivityTimeout = setTimeout(activateSleepMode, 18000); // 3 minutos :180000 
        }
    }




    resetInactivityTimer();

    
    adjustScanArea();
    // Function to send QR data to the backend
    function sendQRCodeData(qrData) {
        const shortRandomString = Math.random().toString(36).substring(7);
        const url = scanMode === 'entrada' ? '/qrReader/in/' + shortRandomString : '/qrReader/out/' +shortRandomString;

        return $.ajax({
            url: url,
            type: 'POST',
            // data: { qr_data: qrData },
            success: function (response) {
                // alert(response.status, 'STATUS');
                return response; // { status: "approved" | "denied" }
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
            switch (status) {
                case 'ok':
                    blockScanner('Bienvenid@!', 'rgba(0, 255, 0, 0.2)')
                    audioValidated.play();
                    delayQRTimeout = setTimeout(() => {
                        unblockScanner();
                    }, 2000);
                    // botonPasar.style.display = 'flex'; // TODO yo quitaria este y unficaria todo en un solo boton (el de abajo)
                    break;

                case 'already_in':
                    blockScanner('QR inválido o ya usado!', 'rgba(255, 0, 0, 0.5)');
                    audioUnvalidated.play()
                    break;

                case 'was_out':
                    //TODO
                    blockScanner('Este usuario había salido', 'rgba(0, 0, 255, 0.5)');
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

    // Initialize the QR Scanner
    const qrScanner = new QrScanner(
        videoElement,
        result => {
            if (isScanning) {
                if (didIJustReadThisQR(result)) {
                    return;
                }
                setLastReadQR(result);
                console.log('Decoded QR Code:', result);
                isScanning = false; // Disable scanning until response is received
                statusElement.textContent = 'Procesando QR...';

                //TODO !!!!!!
                // aqui el fall back de que pasa si se pierde un poco la conexion. me ha pasado en mi casa!!
                // Send QR data to the backend
                // creo que hay un problema al hacerlo asi, mejor usar wait y async
                // también ver si el QR de la respuesta es el mismo que el QR que se ha mandado, hacer esto
                sendQRCodeData(result)
                    .then((response) => {
                        handleResponse(response.status);
                    });
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

    // Toggle scan mode
    toggleModeButton.addEventListener('click', function () {
        scanMode = scanMode === 'entrada' ? 'salida' : 'entrada';

        // Update the UI based on the new mode
        modeIndicator.textContent = scanMode.toUpperCase();
        modeIndicator.className = scanMode === 'entrada' ? "badge bg-success mt-3 fs-5" : "badge bg-primary mt-3 fs-5"; // Change background color
        scanAreaElement.style.borderColor = scanMode === 'entrada' ? '#198754' : '#0d6efd';

        toggleModeButton.innerHTML = scanMode === 'entrada'
            ? '<i class="fa-solid fa-right-from-bracket"></i>'
            : '<i class="fa-solid fa-person-walking"></i>';
    });

    // Start scanning
    startQrScanner();
});
