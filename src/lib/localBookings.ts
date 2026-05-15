export type LocalBooking = {
  id: string;
  serviceId: string;
  professionalId?: string;
  serviceTitle: string;
  provider: string;
  priceLabel: string;
  priceAmount: number;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'paid';
  createdAt: string;
};

const STORAGE_KEY = 'cp-marketplace-bookings';

export function loadLocalBookings(): LocalBooking[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LocalBooking[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalBooking(booking: LocalBooking): void {
  const list = loadLocalBookings();
  list.unshift(booking);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
}
