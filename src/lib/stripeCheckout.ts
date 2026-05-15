export type CheckoutBookingPayload = {
  professional_id: string;
  start_time: string;
  end_time: string;
  price_amount: number;
  currency?: string;
  client_name: string;
  professional_name: string;
  client_user_id?: string;
};

const apiBase = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

export async function createStripeCheckoutSession(
  payload: CheckoutBookingPayload,
): Promise<{ sessionId: string; url: string }> {
  const res = await fetch(`${apiBase}/api/create-checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error ?? 'Could not start Stripe checkout');
  }
  if (!data?.url) {
    throw new Error('Stripe checkout URL was not returned');
  }
  return { sessionId: data.sessionId, url: data.url };
}
