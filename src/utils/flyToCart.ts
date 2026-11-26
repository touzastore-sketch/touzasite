/**
 * Launches a GPU-accelerated flying product thumbnail from the clicked Add-to-Cart
 * element straight into the Navbar shopping bag icon (#navbar-cart-btn), then
 * fires a `touza_cart_pop` event so the bag animates on impact.
 */
export function triggerFlyToCart(
  sourceEl: HTMLElement | null,
  imageUrl?: string
): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const targetEl = document.getElementById('navbar-cart-btn');

  if (prefersReducedMotion || !sourceEl || !targetEl) {
    window.dispatchEvent(new CustomEvent('touza_cart_pop'));
    return;
  }

  const startRect = sourceEl.getBoundingClientRect();
  const endRect = targetEl.getBoundingClientRect();

  // If either element is off-screen or zero-sized, just pop the cart icon
  if (
    startRect.width === 0 ||
    startRect.height === 0 ||
    endRect.width === 0 ||
    endRect.height === 0
  ) {
    window.dispatchEvent(new CustomEvent('touza_cart_pop'));
    return;
  }

  const flyerWidth = 58;
  const flyerHeight = 72;
  const startX = startRect.left + startRect.width / 2 - flyerWidth / 2;
  const startY = startRect.top + startRect.height / 2 - flyerHeight / 2;
  const endX = endRect.left + endRect.width / 2 - flyerWidth / 2;
  const endY = endRect.top + endRect.height / 2 - flyerHeight / 2;

  const deltaX = endX - startX;
  const deltaY = endY - startY;

  // Create curved mid-point lifted slightly upward for a natural luxury arc
  const midX = deltaX * 0.48;
  const midY = Math.min(deltaY * 0.35 - 70, deltaY - 40);

  const flyer = document.createElement('div');
  flyer.setAttribute('aria-hidden', 'true');
  flyer.style.position = 'fixed';
  flyer.style.left = `${startX}px`;
  flyer.style.top = `${startY}px`;
  flyer.style.width = `${flyerWidth}px`;
  flyer.style.height = `${flyerHeight}px`;
  flyer.style.zIndex = '100000';
  flyer.style.pointerEvents = 'none';
  flyer.style.backgroundColor = '#f2f2f0';
  flyer.style.border = '1px solid #111111';
  flyer.style.boxShadow = '0 14px 32px rgba(0, 0, 0, 0.24)';
  flyer.style.overflow = 'hidden';
  flyer.style.willChange = 'transform, opacity';

  if (imageUrl && imageUrl.trim()) {
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = '';
    img.referrerPolicy = 'no-referrer';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'cover';
    img.style.display = 'block';
    flyer.appendChild(img);
  } else {
    flyer.style.display = 'flex';
    flyer.style.alignItems = 'center';
    flyer.style.justifyContent = 'center';
    flyer.style.backgroundColor = '#111111';
    flyer.style.color = '#ffffff';
    flyer.style.fontSize = '11px';
    flyer.style.fontWeight = '600';
    flyer.textContent = '+1';
  }

  document.body.appendChild(flyer);

  if (typeof flyer.animate === 'function') {
    const anim = flyer.animate(
      [
        {
          transform: 'translate3d(0px, 0px, 0) scale(1) rotate(0deg)',
          opacity: 1,
        },
        {
          transform: `translate3d(${midX}px, ${midY}px, 0) scale(1.06) rotate(${deltaX >= 0 ? 6 : -6}deg)`,
          opacity: 0.96,
          offset: 0.45,
        },
        {
          transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(0.22) rotate(${deltaX >= 0 ? 14 : -14}deg)`,
          opacity: 0.2,
        },
      ],
      {
        duration: 660,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'forwards',
      }
    );

    anim.onfinish = () => {
      flyer.remove();
      window.dispatchEvent(new CustomEvent('touza_cart_pop'));
    };

    // Safety cleanup in case animation is interrupted
    setTimeout(() => {
      if (flyer.parentNode) {
        flyer.remove();
        window.dispatchEvent(new CustomEvent('touza_cart_pop'));
      }
    }, 850);
  } else {
    flyer.remove();
    window.dispatchEvent(new CustomEvent('touza_cart_pop'));
  }
}
