(function() {
  document.addEventListener('DOMContentLoaded', () => {
    let isTransitioning = false;
    
    // Listen for Taxi events
    document.addEventListener('taxi:transition-start', () => {
      isTransitioning = true;
      document.body.style.pointerEvents = 'none';
      
      // Stop Webflow ix2 to prevent conflicts
      if (window.Webflow && window.Webflow.require('ix2')) {
        window.Webflow.require('ix2').destroy();
      }
    });

    document.addEventListener('taxi:transition-end', () => {
      isTransitioning = false;
      document.body.style.pointerEvents = '';
      
      // Restart Webflow and Interactions after transition
      if (window.Webflow) {
        window.Webflow.destroy();
        window.Webflow.ready();
        window.Webflow.require('ix2').init();
      }

      // If there are Lottie animations, we can try to re-init them, though Webflow handles most
      if (window.lottie && window.lottie.searchAnimations) {
        window.lottie.searchAnimations();
      }
    });
    
    // Lock click events if a transition is active
    document.addEventListener('click', (e) => {
      if (isTransitioning) {
        const link = e.target.closest('a');
        if (link && link.hostname === window.location.hostname && !link.hash) {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }
      }
    }, true);
  });
})();
