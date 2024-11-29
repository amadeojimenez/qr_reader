$(document).ready(function () {
    const audioValidated = new Audio('../sounds/valid.mp3');
    const audioUnvalidated = new Audio('../sounds/unvalid.mp3');
    const videoElement = document.getElementById('video');
    const scanAreaElement = document.getElementById('scan-area');
    const statusElement = document.getElementById('status');
    const modeIndicator = document.getElementById('mode-indicator');
    const toggleModeButton = document.getElementById('toggle-mode-button');
    const unblockButton = document.getElementById('unblock-button');
    const botonPasar = document.getElementById('pasar-button');
    let lastReadQR = '';

    function setLastReadQR(qr) { //TODO checkear que esto tiene una pirueta ahi abajo
        lastReadQR = qr;
        setTimeout(() => {
            if (lastReadQR === qr) {
                lastReadQR = '';
            }
        }, 5000);
    }

    function didIJustReadThisQR(qr) {
        return lastReadQR === qr;  
    }

    unblockButton.addEventListener('click', function () {
        unblockScanner();
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

    function unblockScanner(message = 'Apunta la cámara hacia el QR.') {
        resetScanner(message)
        unblockButton.style.display = 'none';
    }


    // Call the function initially and on window resize
    window.addEventListener('resize', adjustScanArea);


    //mucho ojo con declarar listeners dentro de un listener!!!, igual que cargar los audios y demas
    // botonPasar.onclick = () => {
    //     resetScanner();
    //     botonPasar.style.display = 'none';
    // };


    
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
                alert(response.status, 'STATUS');
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
                    setTimeout(() => {
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
        modeIndicator.className = scanMode; // Change background color
        scanAreaElement.style.borderColor = scanMode === 'entrada' ? 'rgba(0, 128, 0, 0.649)' : 'rgba(0, 0, 255,  0.649)';

        toggleModeButton.innerHTML = scanMode === 'entrada'
            ? '<i class="fa-solid fa-right-from-bracket"></i>'
            : '<i class="fa-solid fa-person-walking"></i>';
    });

    // Start scanning
    startQrScanner();
});
