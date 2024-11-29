$(document).ready(function() {
    const videoElement = document.getElementById('video');
    const scanAreaElement = document.getElementById('scan-area');
    const statusElement = document.getElementById('status');
    const menu = document.getElementById('menu');
    const scanner = document.getElementById('scanner');
    const backButton = document.getElementById('back-button');
    let isScanning = true; 
    let scanMode = ''; 

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
            data: {qr_data: qrData} ,
            success: function(response) {
                console.log(response,'response')
                return response;  //{ status: "approved" | "denied" }
            },
            error: function(err) {
                console.error('Error:', err);
                return { status: 'error' }; 
            }
        });
    }

      //Update UI en función de la respuesta
      function handleResponse(status) {
        if (status === 'approved') {
            scanAreaElement.style.backgroundColor = 'rgba(0, 255, 0, 0.2)';
            statusElement.textContent = 'QR válido!';
        } else if (status === 'denied') {
            scanAreaElement.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
            statusElement.textContent = 'QR inválido o ya usado!';
        } else {
            statusElement.textContent = 'Error procesando QR!';
        }

        setTimeout(() => {
            scanAreaElement.style.backgroundColor = 'rgba(138, 138, 138, 0.2)';
            statusElement.textContent = 'Apunta la cámara hacia el QR.';
            isScanning = true;
        }, 2000);
    }

    // Initialize the QR Scanner
        const qrScanner = new QrScanner(
            videoElement,
            result => {
                if (isScanning) {
                    console.log('Decoded QR Code:', result);
                    isScanning = false;  // deshabilitamos el escaneo hasta recibir respuesta del backend
                    statusElement.textContent = 'Procesando QR...';

                    // Enviamos la data del qr al backend
                    sendQRCodeData(result)
                        .then(response => {
                            handleResponse(response.status);
                        });
                }
            },
        );

        function startQrScanner() {
            qrScanner.start()
            .then(() => {
                statusElement.textContent = 'Apunta la cámara hacia el QR.';
            })
            .catch(error => {
                console.error('Camera initialization failed:', error);
                statusElement.textContent = 'No se ha podido acceder a la cámara. Verifica que se han habilitado los permisos.';
            });
        }
        
        //  Event Listeners
    $('#entrada-button').on('click', function () {
        scanMode = 'entrada';
        menu.style.display = 'none';
        scanner.style.display = 'block';
        startQrScanner();
        adjustScanArea();
    });

    $('#salida-button').on('click', function () {
        scanMode = 'salida';
        menu.style.display = 'none';
        scanner.style.display = 'block';
        startQrScanner();
        adjustScanArea();
    });

    backButton.addEventListener('click', function () {
        qrScanner.stop();
        scanner.style.display = 'none';
        menu.style.display = 'flex';
    });
       
});

