declare global {
  interface Window {
    Razorpay?: any;
  }
}

/**
 * Ensures the official Razorpay Checkout SDK is loaded and available on window.Razorpay
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    // If already loaded and initialized on window
    if (typeof window.Razorpay === 'function') {
      resolve(true);
      return;
    }

    // Check if script tag is already in DOM
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
    );

    if (existing) {
      let checkCount = 0;
      const interval = setInterval(() => {
        checkCount++;
        if (typeof window.Razorpay === 'function') {
          clearInterval(interval);
          resolve(true);
        } else if (checkCount > 30) {
          clearInterval(interval);
          resolve(typeof window.Razorpay === 'function');
        }
      }, 50);

      existing.addEventListener('load', () => {
        clearInterval(interval);
        resolve(true);
      });
      existing.addEventListener('error', () => {
        clearInterval(interval);
        resolve(false);
      });
      return;
    }

    // Otherwise create and append the script tag
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => {
      let checkCount = 0;
      const interval = setInterval(() => {
        checkCount++;
        if (typeof window.Razorpay === 'function') {
          clearInterval(interval);
          resolve(true);
        } else if (checkCount > 20) {
          clearInterval(interval);
          resolve(typeof window.Razorpay === 'function');
        }
      }, 50);
    };
    script.onerror = () => {
      console.error('❌ Failed to load Razorpay Checkout script.');
      resolve(false);
    };

    document.head.appendChild(script);
  });
};
