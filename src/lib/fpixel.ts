export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '';

export const pixelPageView = () => {
  if (!FB_PIXEL_ID || typeof window === 'undefined') return;
  window.fbq?.('track', 'PageView');
};

type PixelEventParams = Record<string, unknown>;

export const pixelTrack = (event: string, params?: PixelEventParams) => {
  if (!FB_PIXEL_ID || typeof window === 'undefined') return;
  if (typeof window.fbq !== 'function') return;
  if (params) {
    window.fbq('track', event, params);
  } else {
    window.fbq('track', event);
  }
};

export interface InitiateCheckoutItem {
  contentId: string;
  quantity: number;
  unitPrice: number;
}

// Single payload builder for InitiateCheckout, shared by every checkout entry
// point (cart page, cart drawer) so both send identical event shapes.
export const trackInitiateCheckout = (items: InitiateCheckoutItem[]) => {
  if (items.length === 0) return;
  pixelTrack('InitiateCheckout', {
    content_ids: items.map((item) => item.contentId),
    content_type: 'product',
    value: items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    currency: 'BDT',
    num_items: items.reduce((sum, item) => sum + item.quantity, 0),
  });
};
