console.log("¡Hola, mundo!");
console.log("Este es un programa JavaScript sencillo.");
console.log("Imprime varias líneas en la consola.");
console.log("Cada línea se imprime usando una declaración console.log separada.");


document.addEventListener("DOMContentLoaded", function() {
    
    // 1. Obtener referencias a los elementos HTML
    const startButton = document.getElementById('startButton');
    const videoElement = document.getElementById('videoElement');
    const statusMessage = document.getElementById('statusMessage');
    
    // Comprueba si el navegador soporta la API de medios
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        
        // 2. Manejar el evento del botón
        startButton.addEventListener('click', function() {
            statusMessage.textContent = "Solicitando acceso a la cámara...";
            startButton.disabled = true; // Desactivar el botón para evitar múltiples clics
            
            // 3. Solicitar acceso a la cámara (y micrófono, si no se especifica solo video)
            navigator.mediaDevices.getUserMedia({
                video: true // Solicitamos solo acceso a video
                // audio: true // Si también necesitaras audio
            })
            .then(function(stream) {
                // ÉXITO: El usuario dio permiso
                
                statusMessage.textContent = "Cámara activa. ¡Transmisión en tiempo real!";
                
                // 4. Asignar el stream de la cámara al elemento <video>
                videoElement.srcObject = stream;
                
                // Opcional: escuchar cuando el video comienza a reproducirse
                videoElement.onloadedmetadata = function(e) {
                    videoElement.play();
                };
            })
            .catch(function(err) {
                // ERROR: El usuario denegó el permiso o hubo un problema
                
                startButton.disabled = false; // Reactivar el botón
                
                if (err.name === 'NotAllowedError') {
                    statusMessage.textContent = "⚠️ Permiso denegado por el usuario. No se puede acceder a la cámara.";
                } else if (err.name === 'NotFoundError') {
                    statusMessage.textContent = "⚠️ No se encontró una cámara disponible.";
                } else {
                    statusMessage.textContent = `❌ Error al acceder a la cámara: ${err.name}`;
                    console.error("Error al obtener el stream de la cámara:", err);
                }
            });
        });
        
    } else {
        // El navegador no es compatible
        startButton.disabled = true;
        statusMessage.textContent = "⚠️ Lo sentimos, tu navegador no soporta la API `getUserMedia`.";
    }

});