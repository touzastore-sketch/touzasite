import { CartItem, Product, ShippingAddress } from '../types';

export interface WhatsAppOrderDetails {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  governorate?: string;
  address: string;
  apartment?: string;
  notes?: string;
  items: Array<{
    title: string;
    selectedColor?: string;
    selectedSize?: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  discountAmount?: number;
  promoCode?: string;
  shippingFee: number;
  total: number;
  paymentMethod: string;
}

/**
 * Normalizes any Egyptian/International phone number for WhatsApp wa.me links
 * Default fallback is TOUZA store's official WhatsApp: 01070606272 -> 201070606272
 */
export const formatWhatsAppNumber = (rawNumber?: string): string => {
  if (!rawNumber || !rawNumber.trim()) {
    return '201070606272';
  }
  const digits = rawNumber.replace(/[^0-9]/g, '');
  if (digits.startsWith('0')) {
    return '2' + digits;
  }
  if (digits.startsWith('20')) {
    return digits;
  }
  return digits || '201070606272';
};

/**
 * Formats a comprehensive, highly readable order message for WhatsApp
 */
export const buildWhatsAppOrderMessage = (order: WhatsAppOrderDetails): string => {
  const dateFormatted = new Date().toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' });
  const lines: string[] = [
    '🛍️ *طلب شراء جديد - متجر توزا (TOUZA)*',
    '━━━━━━━━━━━━━━━━━━━━',
    `📌 *رقم الطلب:* #${order.orderNumber}`,
    `📅 *تاريخ الطلب:* ${dateFormatted}`,
    '━━━━━━━━━━━━━━━━━━━━',
    '👤 *بيانات المستلم والتوصيل:*',
    `• *الاسم:* ${order.customerName}`,
    `• *رقم الهاتف للتواصل:* ${order.customerPhone}`,
    order.governorate ? `• *المحافظة:* ${order.governorate}` : '',
    `• *العنوان بالتفصيل:* ${order.address}${order.apartment ? ' (شقة/عمارة: ' + order.apartment + ')' : ''}`,
    order.notes ? `• *ملاحظات العميل للتوصيل:* ${order.notes}` : '',
    '━━━━━━━━━━━━━━━━━━━━',
    '👕 *المنتجات المطلوبة:*',
  ];

  order.items.forEach((item, index) => {
    lines.push(`${index + 1}. *${item.title}*`);
    const specs: string[] = [];
    if (item.selectedColor) specs.push(`اللون: ${item.selectedColor}`);
    if (item.selectedSize) specs.push(`المقاس: ${item.selectedSize}`);
    specs.push(`العدد: ${item.quantity}`);
    specs.push(`الإجمالي: ${item.price * item.quantity} ج.م`);
    lines.push(`   ▸ ${specs.join(' | ')}`);
  });

  lines.push('━━━━━━━━━━━━━━━━━━━━');
  lines.push('💰 *ملخص الحساب المطلوب سداده:*');
  lines.push(`• المجموع الفرعي: ${order.subtotal} ج.م`);

  if (order.discountAmount && order.discountAmount > 0) {
    const promoLabel = order.promoCode ? ` (كود: ${order.promoCode})` : '';
    lines.push(`• الخصم: -${order.discountAmount} ج.م${promoLabel}`);
  }

  if (order.shippingFee > 0) {
    lines.push(`• مصاريف الشحن: ${order.shippingFee} ج.م`);
  } else {
    lines.push('• مصاريف الشحن: شحن مجاني ✨');
  }

  lines.push(`• *المبلغ الإجمالي للدفع عند الاستلام:* ${order.total} ج.م`);
  lines.push(`💳 *طريقة الدفع المختارة:* ${order.paymentMethod}`);
  lines.push('━━━━━━━━━━━━━━━━━━━━');
  lines.push('✨ برجاء تأكيد استلام الطلب وتحديد موعد الشحن والتسليم، شكراً لكم!');

  // Filter empty lines cleanly
  return lines.filter((l) => l !== undefined && l !== null).join('\n');
};

/**
 * Builds the complete WhatsApp URL for the order (uses api.whatsapp.com/send for universal desktop & mobile compatibility)
 */
export const getWhatsAppOrderUrl = (
  whatsappNumber: string | undefined,
  order: WhatsAppOrderDetails
): string => {
  const phone = formatWhatsAppNumber(whatsappNumber);
  const text = buildWhatsAppOrderMessage(order);
  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`;
};

/**
 * Direct WhatsApp inquiry/order for a single product from ProductDetail
 */
export const getDirectProductWhatsAppUrl = (
  whatsappNumber: string | undefined,
  productName: string,
  price: number,
  selectedColor?: string,
  selectedSize?: string
): string => {
  const phone = formatWhatsAppNumber(whatsappNumber);
  const lines = [
    '👋 *مرحباً توزا (TOUZA)*',
    'أود الاستفسار والطلب المباشر للمنتج التالي:',
    `👕 *${productName}*`,
    `💰 *السعر:* ${price} ج.م`,
    selectedColor ? `🎨 *اللون:* ${selectedColor}` : '',
    selectedSize ? `📏 *المقاس:* ${selectedSize}` : '',
    '',
    'هل المنتج متاح للشحن؟',
  ].filter(Boolean);

  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`;
};
