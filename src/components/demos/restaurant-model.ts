import type { Language } from '../../content';

export type RestaurantText = Record<Language, string>;
export type FoodCategory = 'mains' | 'salads' | 'drinks';
export type RestaurantItem = {
  id: string; name: RestaurantText; description: RestaurantText; category: FoodCategory;
  image: string; price: number; minutes: number;
  extras: { id: string; name: RestaurantText; price: number }[];
};
export const restaurantMenu: RestaurantItem[] = [
  { id: 'burger', name: { ar: 'برغر كلاسيك', en: 'Classic burger' }, description: { ar: 'لحم مشوي، جبن، خضار مقرمشة وصلصتنا الخاصة.', en: 'Grilled beef, cheese, crisp vegetables and our house sauce.' }, category: 'mains', image: './demo-operations/burger.jpg', price: 28, minutes: 15, extras: [{ id: 'cheese', name: { ar: 'جبن إضافي', en: 'Extra cheese' }, price: 3 }, { id: 'fries', name: { ar: 'بطاطس جانبية', en: 'Side of fries' }, price: 7 }] },
  { id: 'pizza', name: { ar: 'بيتزا الفرن', en: 'Oven pizza' }, description: { ar: 'عجينة خفيفة، طماطم وجبن موزاريلا ذائب.', en: 'A light crust with tomato and melted mozzarella.' }, category: 'mains', image: './demo-operations/pizza.jpg', price: 36, minutes: 18, extras: [{ id: 'cheese', name: { ar: 'جبن إضافي', en: 'Extra cheese' }, price: 4 }, { id: 'mushrooms', name: { ar: 'فطر', en: 'Mushrooms' }, price: 5 }] },
  { id: 'pasta', name: { ar: 'باستا كريمية', en: 'Creamy pasta' }, description: { ar: 'باستا بصلصة كريمية ولمسة من الأعشاب الطازجة.', en: 'Pasta in a creamy sauce with a touch of fresh herbs.' }, category: 'mains', image: './demo-operations/pasta.jpg', price: 32, minutes: 16, extras: [{ id: 'chicken', name: { ar: 'دجاج مشوي', en: 'Grilled chicken' }, price: 8 }, { id: 'cheese', name: { ar: 'جبن إضافي', en: 'Extra cheese' }, price: 3 }] },
  { id: 'salad', name: { ar: 'سلطة الحديقة', en: 'Garden salad' }, description: { ar: 'خضار موسمية وتتبيلة خفيفة، بداية منعشة لوجبتك.', en: 'Seasonal greens with a light dressing. A fresh start to your meal.' }, category: 'salads', image: './demo-operations/salad.jpg', price: 19, minutes: 8, extras: [{ id: 'chicken', name: { ar: 'دجاج مشوي', en: 'Grilled chicken' }, price: 8 }] },
  { id: 'coffee', name: { ar: 'قهوة لاتيه', en: 'Caffè latte' }, description: { ar: 'إسبريسو وحليب ناعم، لوقت يستحق التمهّل.', en: 'Espresso and silky milk, for a moment worth slowing down.' }, category: 'drinks', image: './demo-operations/coffee.jpg', price: 9, minutes: 5, extras: [{ id: 'espresso', name: { ar: 'جرعة إسبريسو', en: 'Espresso shot' }, price: 3 }] },
  { id: 'juice', name: { ar: 'عصير البرتقال', en: 'Orange juice' }, description: { ar: 'نكهة برتقال منعشة، تقدّم باردة.', en: 'A refreshing orange drink, served chilled.' }, category: 'drinks', image: './demo-operations/juice.jpg', price: 11, minutes: 4, extras: [] },
];
export type DiningMode = 'dineIn' | 'takeaway' | 'delivery';
export type KitchenStatus = 'new' | 'preparing' | 'ready' | 'served' | 'cancelled';
export type RestaurantRole = 'manager' | 'kitchen' | 'cashier';
export type RestaurantLine = { id: string; product: string; extras: string[]; quantity: number; note: string };
export type RestaurantOrder = {
  id: string; number: number; mode: DiningMode; table: number | null;
  customer: string; phone: string; address: string; lines: RestaurantLine[];
  status: KitchenStatus; paid: boolean; createdAt: string; total: number; delivery: number;
};
export type TableReservation = { id: string; name: string; phone: string; date: string; time: string; guests: number; table: number; cancelled: boolean };
export type RestaurantState = { cart: RestaurantLine[]; orders: RestaurantOrder[]; reservations: TableReservation[]; unavailable: string[]; notice: string | null };
export const restaurantTables = [{ id: 1, seats: 2 }, { id: 2, seats: 2 }, { id: 3, seats: 4 }, { id: 4, seats: 4 }, { id: 5, seats: 6 }, { id: 6, seats: 6 }];
export const restaurantReservationTimes = ['12:00', '14:00', '16:00', '18:00', '20:00', '22:00'];
export const restaurantMoney = (value: number, lang: Language) => `${new Intl.NumberFormat(lang === 'ar' ? 'ar-LY' : 'en', { maximumFractionDigits: 2 }).format(value)} ${lang === 'ar' ? 'د.ل.' : 'LYD'}`;
export function foodUnitPrice(line: RestaurantLine) {
  const item = restaurantMenu.find(product => product.id === line.product);
  return item ? item.price + item.extras.filter(extra => line.extras.includes(extra.id)).reduce((sum, extra) => sum + extra.price, 0) : 0;
}
export const restaurantSubtotal = (lines: RestaurantLine[]) => lines.reduce((sum, line) => sum + foodUnitPrice(line) * line.quantity, 0);
export function initialRestaurantState(): RestaurantState {
  const now = new Date().toISOString();
  return { cart: [], unavailable: [], reservations: [], notice: null, orders: [
    { id: 'sample-201', number: 201, mode: 'dineIn', table: 3, customer: 'DEMO 01', phone: '', address: '', lines: [{ id: 'sample-line-1', product: 'pizza', extras: [], quantity: 1, note: '' }, { id: 'sample-line-2', product: 'juice', extras: [], quantity: 2, note: '' }], status: 'preparing', paid: false, createdAt: now, total: 58, delivery: 0 },
    { id: 'sample-202', number: 202, mode: 'takeaway', table: null, customer: 'DEMO 02', phone: '', address: '', lines: [{ id: 'sample-line-3', product: 'coffee', extras: [], quantity: 2, note: '' }], status: 'ready', paid: false, createdAt: now, total: 18, delivery: 0 },
  ] };
}
export type RestaurantAction =
  | { type: 'add'; line: RestaurantLine }
  | { type: 'quantity'; id: string; change: number }
  | { type: 'remove'; id: string }
  | { type: 'order'; id: string; mode: DiningMode; table: number | null; customer: string; phone: string; address: string; now: string }
  | { type: 'advance'; id: string; role: RestaurantRole }
  | { type: 'cancel'; id: string; role: RestaurantRole }
  | { type: 'pay'; id: string; role: RestaurantRole }
  | { type: 'availability'; product: string; role: RestaurantRole }
  | { type: 'reserve'; reservation: TableReservation }
  | { type: 'cancelReservation'; id: string; role: RestaurantRole }
  | { type: 'clearNotice' }
  | { type: 'reset' };
const activeStatus = (status: KitchenStatus) => status !== 'served' && status !== 'cancelled';
export const restaurantPhoneValid = (value: string) => /^\+?\d{7,15}$/.test(value.replace(/[٠-٩]/g, digit => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit))).replace(/[\s()-]/g, ''));
export function restaurantDateValid(value: string, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date(now); today.setHours(0, 0, 0, 0);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day && date >= today;
}
export function restaurantReservationTimeValid(date: string, time: string, now = new Date()) {
  if (!restaurantDateValid(date, now) || !restaurantReservationTimes.includes(time)) return false;
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  return new Date(year, month - 1, day, hour, minute).getTime() > now.getTime();
}
export function restaurantReducer(state: RestaurantState, action: RestaurantAction): RestaurantState {
  if (action.type === 'clearNotice') return { ...state, notice: null };
  if (action.type === 'reset') return initialRestaurantState();
  if (action.type === 'add') {
    const item = restaurantMenu.find(product => product.id === action.line.product);
    if (!item || state.unavailable.includes(item.id) || action.line.quantity < 1 || action.line.quantity > 20 || !Number.isInteger(action.line.quantity)) return { ...state, notice: 'unavailable' };
    const line = { ...action.line, extras: [...new Set(action.line.extras)].filter(id => item.extras.some(extra => extra.id === id)), note: action.line.note.trim().slice(0, 180) };
    const match = state.cart.find(current => current.product === line.product && [...current.extras].sort().join(',') === [...line.extras].sort().join(',') && current.note === line.note);
    return { ...state, cart: match ? state.cart.map(current => current.id === match.id ? { ...current, quantity: Math.min(20, current.quantity + line.quantity) } : current) : [...state.cart, line], notice: 'added' };
  }
  if (action.type === 'quantity') return Number.isInteger(action.change) ? { ...state, cart: state.cart.map(line => line.id === action.id ? { ...line, quantity: Math.min(20, Math.max(0, line.quantity + action.change)) } : line).filter(line => line.quantity > 0), notice: null } : state;
  if (action.type === 'remove') return { ...state, cart: state.cart.filter(line => line.id !== action.id), notice: 'removed' };
  if (action.type === 'order') {
    if (!state.cart.length || state.cart.some(line => state.unavailable.includes(line.product))) return { ...state, notice: 'unavailable' };
    if (!action.customer.trim() || (action.mode !== 'dineIn' && !restaurantPhoneValid(action.phone)) || (action.mode === 'delivery' && !action.address.trim()) || (action.mode === 'dineIn' && !restaurantTables.some(table => table.id === action.table))) return { ...state, notice: 'invalid' };
    if (state.orders.some(order => order.id === action.id)) return state;
    const delivery = action.mode === 'delivery' ? 8 : 0;
    const order: RestaurantOrder = { id: action.id, number: Math.max(200, ...state.orders.map(item => item.number)) + 1, mode: action.mode, table: action.mode === 'dineIn' ? action.table : null, customer: action.customer.trim(), phone: action.phone.trim(), address: action.mode === 'delivery' ? action.address.trim() : '', lines: state.cart.map(line => ({ ...line, extras: [...line.extras] })), status: 'new', paid: false, createdAt: action.now, total: restaurantSubtotal(state.cart) + delivery, delivery };
    return { ...state, cart: [], orders: [order, ...state.orders], notice: 'ordered' };
  }
  if (action.type === 'reserve') {
    const candidate = action.reservation;
    const table = restaurantTables.find(item => item.id === candidate.table);
    const collision = state.reservations.some(item => !item.cancelled && item.date === candidate.date && item.time === candidate.time && item.table === candidate.table);
    if (state.reservations.some(item => item.id === candidate.id)) return state;
    if (!table || candidate.guests > table.seats || candidate.guests < 1 || !Number.isInteger(candidate.guests) || !candidate.name.trim() || !restaurantPhoneValid(candidate.phone) || !restaurantReservationTimeValid(candidate.date, candidate.time) || collision) return { ...state, notice: 'reservationUnavailable' };
    return { ...state, reservations: [{ ...candidate, name: candidate.name.trim(), phone: candidate.phone.trim(), cancelled: false }, ...state.reservations], notice: 'reserved' };
  }
  if (action.type === 'cancelReservation') {
    if (action.role === 'kitchen') return { ...state, notice: 'forbidden' };
    return { ...state, reservations: state.reservations.map(item => item.id === action.id ? { ...item, cancelled: true } : item), notice: 'reservationCancelled' };
  }
  if (action.type === 'availability') {
    if (action.role !== 'manager' || !restaurantMenu.some(item => item.id === action.product)) return { ...state, notice: 'forbidden' };
    return { ...state, unavailable: state.unavailable.includes(action.product) ? state.unavailable.filter(id => id !== action.product) : [...state.unavailable, action.product], notice: 'availability' };
  }
  const order = state.orders.find(item => item.id === action.id);
  if (!order) return state;
  if (action.type === 'pay') {
    if (action.role === 'kitchen' || order.status === 'cancelled' || order.paid) return { ...state, notice: 'forbidden' };
    return { ...state, orders: state.orders.map(item => item.id === action.id ? { ...item, paid: true } : item), notice: 'paid' };
  }
  if (action.type === 'cancel') {
    if (action.role === 'kitchen' || order.paid || !activeStatus(order.status)) return { ...state, notice: 'forbidden' };
    return { ...state, orders: state.orders.map(item => item.id === action.id ? { ...item, status: 'cancelled' } : item), notice: 'cancelled' };
  }
  if (!activeStatus(order.status) || (action.role === 'cashier' && order.status !== 'ready')) return { ...state, notice: 'forbidden' };
  const next: Record<KitchenStatus, KitchenStatus> = { new: 'preparing', preparing: 'ready', ready: 'served', served: 'served', cancelled: 'cancelled' };
  return { ...state, orders: state.orders.map(item => item.id === action.id ? { ...item, status: next[item.status] } : item), notice: 'advanced' };
}
