$(document).ready(function () {
    const videoElement = document.getElementById('video');
    const scanAreaElement = document.getElementById('scan-area');
    const statusElement = document.getElementById('status');
    const modeIndicator = document.getElementById('mode-indicator');
    const toggleModeButton = document.getElementById('toggle-mode-button');
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

    // Call the function initially and on window resize
    window.addEventListener('resize', adjustScanArea);
    adjustScanArea();

    // Function to send QR data to the backend
    function sendQRCodeData(qrData) {
        const url = scanMode === 'entrada' ? '/qrReader/entrada' : '/qrReader/salida';

        return $.ajax({
            url: url,
            type: 'POST',
            data: { qr_data: qrData },
            success: function (response) {
                console.log(response, 'response');
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

        const audioValidated = new Audio('../sounds/valid.mp3');
        const audioUnvalidated = new Audio('../sounds/unvalid.mp3');

        if(scanMode == 'entrada'){

            if (status === 'approved') {
                scanAreaElement.style.backgroundColor = 'rgba(0, 255, 0, 0.2)';
                statusElement.textContent = 'QR válido!';
                audioValidated.play();

            const botonPasar = document.getElementById('pasar-button');
            botonPasar.style.display = 'flex';

         
            botonPasar.onclick = () => {
                resetScanner();
                botonPasar.style.display = 'none';
            };

            } else if (status === 'denied') {
                scanAreaElement.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
                statusElement.textContent = 'QR inválido o ya usado!';
                audioUnvalidated.play()
                
            } else {
                statusElement.textContent = 'Error procesando QR!';
            }
    
        const timeoutId = setTimeout(() => {
            resetScanner();
            const botonPasar = document.getElementById('pasar-button');
            botonPasar.style.display = 'none';
        }, 2000);


        function resetScanner() {
            scanAreaElement.style.backgroundColor = 'transparent';
            statusElement.textContent = 'Apunta la cámara hacia el QR.';
            isScanning = true;
            clearTimeout(timeoutId); 
        }

        }
        else {

            if (status === 'approved') {
                scanAreaElement.style.backgroundColor = 'rgba(0, 255, 0, 0.2)';
                statusElement.textContent = 'QR válido!';
                audioValidated.play();
            } else if (status === 'denied') {
                scanAreaElement.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
                statusElement.textContent = 'QR inválido o ya usado!';
                audioUnvalidated.play()
            } else {
                statusElement.textContent = 'Error procesando QR!';
            }
    
            setTimeout(() => {
                scanAreaElement.style.backgroundColor = 'transparent';
                statusElement.textContent = 'Apunta la cámara hacia el QR.';
                isScanning = true;
            }, 2000);


        }
       
    }

    // Initialize the QR Scanner
    const qrScanner = new QrScanner(
        videoElement,
        (result) => {
            if (isScanning) {
                console.log('Decoded QR Code:', result);
                isScanning = false; // Disable scanning until response is received
                statusElement.textContent = 'Procesando QR...';

                // Send QR data to the backend
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
