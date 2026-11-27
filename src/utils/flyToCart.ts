import type { TouzaBagCatchDetail } from '../components/FloatingTouzaBag';

/**
 * Triggers a subtle luxury acknowledgement sway on the Floating TOUZA Bag
 * whenever the customer chooses a size or color on a product.
 */
export function triggerBagNudge(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('touza_bag_nudge'));
}

/**
 * Launches a GPU-accelerated flying product thumbnail from the clicked Add-to-Cart
 * element straight into the Floating TOUZA Luxury Bag (#floating-touza-bag) —
 * falling back to the Navbar cart button (#navbar-cart-btn) if hidden —
 * then fires `touza_bag_catch` & `touza_cart_pop` so both bags animate on impact.
 */
export function triggerFlyToCart(
  sourceEl: HTMLElement | null,
  imageUrl?: string,
  meta?: Omit<TouzaBagCatchDetail, 'imageUrl'>
): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const detail: TouzaBagCatchDetail = {
    ...meta,
    imageUrl,
  };

  const dispatchImpact = () => {
    window.dispatchEvent(new CustomEvent('touza_cart_pop'));
    window.dispatchEvent(new CustomEvent('touza_bag_catch', { detail }));
  };

  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const floatingBagEl = document.getElementById('floating-touza-bag');
  const navbarBagEl = document.getElementById('navbar-cart-btn');

  // Prefer the visible Floating TOUZA Branded Bag as the primary catch target
  const floatingRect = floatingBagEl?.getBoundingClientRect();
  const isFloatingVisible =
    floatingBagEl &&
    floatingRect &&
    floatingRect.width > 0 &&
    floatingRect.height > 0;

  const targetEl = isFloatingVisible ? floatingBagEl : navbarBagEl;

  if (prefersReducedMotion || !sourceEl || !targetEl) {
    dispatchImpact();
    return;
  }

  const startRect = sourceEl.getBoundingClientRect();
  const endRect = targetEl.getBoundingClientRect();

  // If either element is off-screen or zero-sized, fire impact immediately
  if (
    startRect.width === 0 ||
    startRect.height === 0 ||
    endRect.width === 0 ||
    endRect.height === 0
  ) {
    dispatchImpact();
    return;
  }

  // Signal the TOUZA bag to lean slightly open and prepare to catch the product
  window.dispatchEvent(new CustomEvent('touza_bag_incoming'));

  const flyerWidth = 60;
  const flyerHeight = 76;
  const startX = startRect.left + startRect.width / 2 - flyerWidth / 2;
  const startY = startRect.top + startRect.height / 2 - flyerHeight / 2;

  // Aim directly into the open mouth of the TOUZA bag (top ~26% of bag height)
  const endX = endRect.left + endRect.width / 2 - flyerWidth / 2;
  const endY = isFloatingVisible
    ? endRect.top + endRect.height * 0.24 - flyerHeight / 2
    : endRect.top + endRect.height / 2 - flyerHeight / 2;

  const deltaX = endX - startX;
  const deltaY = endY - startY;

  // Smooth elevated luxury parabolic arc toward the TOUZA bag
  const midX = deltaX * 0.46;
  const midY = Math.min(deltaY * 0.32 - 84, -56);

  const flyer = document.createElement('div');
  flyer.setAttribute('aria-hidden', 'true');
  flyer.style.position = 'fixed';
  flyer.style.left = `${startX}px`;
  flyer.style.top = `${startY}px`;
  flyer.style.width = `${flyerWidth}px`;
  flyer.style.height = `${flyerHeight}px`;
  flyer.style.zIndex = '100000';
  flyer.style.pointerEvents = 'none';
  flyer.style.backgroundColor = '#f8f6f1';
  flyer.style.border = '1.5px solid #121211';
  flyer.style.outline = '1px solid rgba(200, 176, 138, 0.7)';
  flyer.style.outlineOffset = '-3px';
  flyer.style.boxShadow = '0 16px 34px rgba(0, 0, 0, 0.26)';
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
    flyer.style.backgroundColor = '#121211';
    flyer.style.color = '#e8d8ba';
    flyer.style.fontFamily = '"Playfair Display", Georgia, serif';
    flyer.style.fontSize = '10px';
    flyer.style.letterSpacing = '0.16em';
    flyer.textContent = 'TOUZA';
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
          transform: `translate3d(${midX}px, ${midY}px, 0) scale(1.06) rotate(${deltaX >= 0 ? 7 : -7}deg)`,
          opacity: 0.98,
          offset: 0.44,
        },
        {
          transform: `translate3d(${deltaX}px, ${deltaY - 10}px, 0) scale(0.38) rotate(${deltaX >= 0 ? 10 : -10}deg)`,
          opacity: 0.85,
          offset: 0.84,
        },
        {
          transform: `translate3d(${deltaX}px, ${deltaY + 8}px, 0) scale(0.16) rotate(0deg)`,
          opacity: 0,
        },
      ],
      {
        duration: 680,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'forwards',
      }
    );

    let finished = false;
    const finishOnce = () => {
      if (finished) return;
      finished = true;
      if (flyer.parentNode) flyer.remove();
      dispatchImpact();
    };

    anim.onfinish = finishOnce;
    setTimeout(finishOnce, 860);
  } else {
    flyer.remove();
    dispatchImpact();
  }
}
