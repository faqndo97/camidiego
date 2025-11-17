// Configuration
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz8EVaWNaDQe2d7HVOKlu_LYwUWvC94gnPbgrMgbKQo0mev8rMLAit-8zTYZmuHc8GY2g/exec';

// Password Modal & Background Music Control
const passwordModal = document.getElementById('password-modal');
const passwordForm = document.getElementById('password-form');
const passwordInput = document.getElementById('password-input');
const passwordError = document.getElementById('password-error');
const backgroundMusic = document.getElementById('background-music');
const musicToggle = document.getElementById('music-toggle');
let isPlaying = false;

// Set your password here
const CORRECT_PASSWORD = 'diegocamila2026';

// Check if user already entered password in this session
window.addEventListener('load', function() {
    const hasAccess = sessionStorage.getItem('wedding_access');

    if (hasAccess === 'true') {
        // User already has access, hide modal
        passwordModal.classList.add('hidden');
    } else {
        // Show modal, focus on input
        passwordModal.classList.remove('hidden');
        setTimeout(() => passwordInput.focus(), 500);
    }
});

// Handle password form submission
passwordForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const enteredPassword = passwordInput.value;

    if (enteredPassword === CORRECT_PASSWORD) {
        // Correct password
        passwordError.classList.add('hidden');
        passwordModal.classList.add('hidden');

        // Save access in session
        sessionStorage.setItem('wedding_access', 'true');

        // Start music
        backgroundMusic.play()
            .then(() => {
                isPlaying = true;
                musicToggle.classList.add('playing');
            })
            .catch(() => {
                // Music didn't play, but modal is hidden
                isPlaying = false;
            });
    } else {
        // Incorrect password
        passwordError.classList.remove('hidden');
        passwordInput.value = '';
        passwordInput.focus();

        // Shake animation
        passwordForm.style.animation = 'none';
        setTimeout(() => {
            passwordForm.style.animation = 'shake 0.5s ease';
        }, 10);
    }
});

// Toggle music on button click
musicToggle.addEventListener('click', function() {
    if (isPlaying) {
        backgroundMusic.pause();
        isPlaying = false;
        musicToggle.classList.remove('playing');
    } else {
        backgroundMusic.play();
        isPlaying = true;
        musicToggle.classList.add('playing');
    }
});

// Countdown Timer
function updateCountdown() {
    // Wedding date: February 14, 2026 at 21:00 (9:00 PM) in timezone -03:00 (Montevideo)
    const weddingDate = new Date('2026-02-14T21:00:00-03:00');
    const now = new Date();

    // Calculate the difference in milliseconds
    const difference = weddingDate - now;

    if (difference > 0) {
        // Calculate time units
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        // Update the HTML elements
        document.getElementById('days').textContent = days;
        document.getElementById('hours').textContent = hours;
        document.getElementById('minutes').textContent = minutes;
        document.getElementById('seconds').textContent = seconds;
    } else {
        // Wedding day has passed
        document.getElementById('countdown').innerHTML = '<p style="font-size: 2rem;">¡Es hoy!</p>';
    }
}

// Update countdown every second
updateCountdown();
setInterval(updateCountdown, 1000);

// Copy to clipboard function
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent;

    // Use the Clipboard API
    navigator.clipboard.writeText(text).then(() => {
        // Show a temporary success message
        const originalText = element.innerHTML;
        element.innerHTML = '✓ Copiado';

        setTimeout(() => {
            element.innerHTML = originalText;
        }, 1500);
    }).catch(err => {
        console.error('Error copying text: ', err);
        alert('Copiado: ' + text);
    });
}

// Song Request Form Toggle
function toggleSongForm() {
    const formContainer = document.getElementById('song-form-container');
    formContainer.classList.toggle('hidden');

    // Scroll to form if it's being shown
    if (!formContainer.classList.contains('hidden')) {
        setTimeout(() => {
            formContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
}

// Floating RSVP Button functionality
document.addEventListener('DOMContentLoaded', function() {
    const floatingBtn = document.getElementById('floating-rsvp-btn');
    const submitBtn = document.querySelector('.btn-submit');
    const rsvpForm = document.querySelector('.rsvp-form');
    const rsvpSection = document.querySelector('.rsvp');

    // Function to check if submit button is visible
    function checkSubmitButtonVisibility() {
        const submitBtnRect = submitBtn.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        // Check if submit button is visible in viewport
        const isVisible = submitBtnRect.top < windowHeight && submitBtnRect.bottom > 0;

        if (isVisible) {
            // Hide floating button when submit button is visible
            floatingBtn.classList.add('hidden');
        } else {
            // Show floating button when submit button is not visible
            floatingBtn.classList.remove('hidden');
        }
    }

    // Handle floating button click - scroll to RSVP section
    floatingBtn.addEventListener('click', function(e) {
        e.preventDefault();
        rsvpSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    // Handle form submission
    rsvpForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form data
        const formData = {
            action: 'rsvp',
            nombre: document.getElementById('nombre').value,
            apellido: document.getElementById('apellido').value,
            menu: document.getElementById('menu').value,
            asistencia: document.querySelector('input[name="asistencia"]:checked').value,
            referer: window.location.origin
        };

        // Disable submit button to prevent double submission
        const submitBtn = rsvpForm.querySelector('.btn-submit');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando...';

        // Send to Apps Script
        fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(() => {
            // Note: no-cors mode means we can't read the response
            // Show success message
            alert('¡Gracias por confirmar tu asistencia! Nos vemos el 14 de Febrero de 2026.');

            // Reset form
            rsvpForm.reset();
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('Hubo un error al enviar la confirmación. Por favor, intenta nuevamente.');
        })
        .finally(() => {
            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        });
    });

    // Check button visibility on scroll
    window.addEventListener('scroll', checkSubmitButtonVisibility);

    // Initial check
    checkSubmitButtonVisibility();

    // Song Request Form Submission
    const songForm = document.getElementById('song-form');
    const successMessage = document.getElementById('song-success-message');

    if (songForm) {
        songForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form data
            const songData = {
                action: 'song',
                songName: document.getElementById('song-name').value,
                artistName: document.getElementById('artist-name').value,
                guestName: document.getElementById('guest-name').value,
                referer: window.location.origin
            };

            // Disable submit button to prevent double submission
            const submitBtn = songForm.querySelector('.btn-submit');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Enviando...';

            // Send to Apps Script
            fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(songData)
            })
            .then(() => {
                // Show success message
                successMessage.classList.remove('hidden');

                // Scroll to success message
                setTimeout(() => {
                    successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 100);

                // Save guest name before resetting
                const savedGuestName = songData.guestName;

                // Reset form (but keep form container visible)
                songForm.reset();

                // Restore guest name
                if (savedGuestName) {
                    document.getElementById('guest-name').value = savedGuestName;
                }

                // Hide success message after 10 seconds
                setTimeout(() => {
                    successMessage.classList.add('hidden');
                }, 10000);
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Hubo un error al enviar la canción. Por favor, intenta nuevamente.');
            })
            .finally(() => {
                // Re-enable button
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            });
        });
    }
});
