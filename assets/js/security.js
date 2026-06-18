// Security measures to prevent casual scraping and copying

(function() {
    // Disable Right-Click
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
    });

    // Disable common developer tool keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Prevent F12
        if (e.key === 'F12' || e.keyCode === 123) {
            e.preventDefault();
        }
        
        // Prevent Ctrl+Shift+I / Cmd+Option+I (Inspect)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) {
            e.preventDefault();
        }
        
        // Prevent Ctrl+Shift+J / Cmd+Option+J (Console)
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) {
            e.preventDefault();
        }
        
        // Prevent Ctrl+U / Cmd+U (View Source)
        if ((e.ctrlKey || e.metaKey) && (e.key === 'U' || e.key === 'u' || e.keyCode === 85)) {
            e.preventDefault();
        }
        
        // Prevent Ctrl+S / Cmd+S (Save Page)
        if ((e.ctrlKey || e.metaKey) && (e.key === 'S' || e.key === 's' || e.keyCode === 83)) {
            e.preventDefault();
        }

        // Prevent Ctrl+C / Cmd+C (Copy)
        if ((e.ctrlKey || e.metaKey) && (e.key === 'C' || e.key === 'c' || e.keyCode === 67)) {
            e.preventDefault();
        }
    });

    // Disable dragging of images and text
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
    });

    // Inject CSS to disable user selection
    const style = document.createElement('style');
    style.innerHTML = `
        * {
            -webkit-user-select: none; /* Safari */
            -moz-user-select: none;    /* Firefox */
            -ms-user-select: none;     /* IE10+/Edge */
            user-select: none;         /* Standard */
        }
        
        /* Exception for inputs and textareas */
        input, textarea {
            -webkit-user-select: auto;
            -moz-user-select: auto;
            -ms-user-select: auto;
            user-select: auto;
        }
    `;
    document.head.appendChild(style);
})();
