import nodemailer from 'nodemailer'
// MailComposer ensures correct MIME encoding for UTF-8 bodies
import MailComposer from 'nodemailer/lib/mail-composer'
import { google } from 'googleapis'
import { NextResponse } from 'next/server'

// Server-only API route to send an email to admin when a new order arrives.
// Expects JSON body { order: { order_number, final_amount, user: { name, phone }, ... } }

const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const GMAIL_EMAIL = process.env.GMAIL_EMAIL

// Disable all outbound emails when this flag is set (set to 'true' or '1')
const DISABLE_EMAIL_SENDING = (process.env.DISABLE_EMAIL_SENDING || '')
  .toString()
  .toLowerCase() === 'true' || process.env.DISABLE_EMAIL_SENDING === '1'

// OAuth2 credentials
const GMAIL_CLIENT_ID = process.env.GMAIL_CLIENT_ID
const GMAIL_CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET
const GMAIL_REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN

// App password fallback
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD

export async function POST(req: Request) {
  try {
    // Short-circuit if sending is disabled
    if (DISABLE_EMAIL_SENDING) {
      console.log('send-order-email: DISABLE_EMAIL_SENDING is set — skipping send')
      return NextResponse.json({ ok: true, skipped: true, reason: 'disabled' })
    }

    const body = await req.json()
    const { order } = body

    if (!order) {
      return NextResponse.json({ ok: false, error: 'missing order' }, { status: 400 })
    }

    const subject = `طلب جديد: ${order.order_number || 'Unknown'}`

    // بناء جدول المنتجات بالتنسيق السابق المحسن  
    const buildItemsTable = (items: any[]) => {
      if (!items || !Array.isArray(items) || items.length === 0) return '<p><em>لا توجد عناصر</em></p>'
      
      const rows = items.map(item => {
        const productName = item.product_name || item.product?.name || 'منتج محذوف'
        const productPrice = item.product_price || item.price || 0
        const quantity = item.quantity || 0
        const totalPrice = item.total_price || (productPrice * quantity)
        
        return `
          <tr>
            <td style="padding:8px;border:1px solid #ddd">${productName}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:center">${quantity}</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:right">${productPrice.toFixed(2)} ج.م</td>
            <td style="padding:8px;border:1px solid #ddd;text-align:right">${totalPrice.toFixed(2)} ج.م</td>
          </tr>
        `
      }).join('')
      
      return `
        <h3>🛒 عناصر الطلب</h3>
        <table style="border-collapse:collapse;width:100%;max-width:700px;margin:10px 0">
          <thead>
            <tr style="background:#f8f9fa">
              <th style="padding:8px;border:1px solid #ddd;text-align:right">المنتج</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:center">الكمية</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:right">السعر</th>
              <th style="padding:8px;border:1px solid #ddd;text-align:right">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      `
    }

    // استخدام البيانات الفعلية كما تظهر في صفحة الإدمن
    const customerName = order.user?.name || 'غير محدد'
    const customerPhone = order.user?.phone || order.delivery_phone || 'غير محدد'
    const deliveryAddress = order.delivery_address || 'غير محدد'
    
    // بناء جدول المنتجات باستخدام order_items كما هو موجود في النظام
    const itemsHtml = buildItemsTable(order.order_items || [])
    
    // حساب الإجماليات
    const subtotal = order.subtotal || 0
    const shippingFee = order.shipping_fee || 0
    const discountAmount = order.discount_amount || 0
    const taxAmount = order.tax_amount || 0
    const finalAmount = order.final_amount || 0
    const pointsEarned = order.points_earned || 0
    const pointsUsed = order.points_used || 0

    // تحويل حالة الطلب للعربية
    const getStatusLabel = (status: string) => {
      const statusMap: { [key: string]: string } = {
        'PENDING': 'في الانتظار',
        'CONFIRMED': 'مؤكد',
        'PREPARING': 'قيد التحضير',
        'OUT_FOR_DELIVERY': 'في الطريق',
        'DELIVERED': 'تم التوصيل',
        'CANCELLED': 'ملغي',
        'REFUNDED': 'مسترد'
      }
      return statusMap[status] || status
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body>
      <div style="font-family:Arial,Helvetica,sans-serif;color:#111;direction:rtl;text-align:right">
        <h2 style="color:#2563eb;border-bottom:2px solid #e5e7eb;padding-bottom:10px">🔔 طلب جديد</h2>
        
        <div style="background:#f8f9fa;padding:15px;border-radius:8px;margin:15px 0">
          <h3 style="margin:0 0 10px 0;color:#374151">📋 معلومات الطلب</h3>
          <p><strong>رقم الطلب:</strong> ${order.order_number || 'غير محدد'}</p>
          <p><strong>تاريخ الطلب:</strong> ${order.created_at ? new Date(order.created_at).toLocaleString('ar-EG') : 'غير محدد'}</p>
          <p><strong>الحالة:</strong> <span style="background:#fef3c7;padding:2px 8px;border-radius:4px">${getStatusLabel(order.status)}</span></p>
        </div>

        <div style="background:#f0f9ff;padding:15px;border-radius:8px;margin:15px 0">
          <h3 style="margin:0 0 10px 0;color:#374151">👤 بيانات العميل</h3>
          <p><strong>الاسم:</strong> ${customerName}</p>
          <p><strong>الهاتف:</strong> ${customerPhone}</p>
          <p><strong>عنوان التوصيل:</strong> ${deliveryAddress}</p>
          ${order.delivery_city ? `<p><strong>المدينة:</strong> ${order.delivery_city}</p>` : ''}
          ${order.delivery_area ? `<p><strong>المنطقة:</strong> ${order.delivery_area}</p>` : ''}
          ${order.delivery_notes ? `<p><strong>ملاحظات التوصيل:</strong> ${order.delivery_notes}</p>` : ''}
          ${order.notes ? `<p><strong>ملاحظات إضافية:</strong> ${order.notes}</p>` : ''}
        </div>

        ${itemsHtml}

        <div style="background:#f0fdf4;padding:15px;border-radius:8px;margin:15px 0">
          <h3 style="margin:0 0 10px 0;color:#374151">💰 التفاصيل المالية</h3>
          <table style="width:100%;border-collapse:collapse">
            ${subtotal > 0 ? `<tr><td style="padding:5px 0;border-bottom:1px solid #e5e7eb"><strong>المجموع الفرعي:</strong></td><td style="text-align:left;padding:5px 0;border-bottom:1px solid #e5e7eb">${subtotal.toFixed(2)} ج.م</td></tr>` : ''}
            ${shippingFee > 0 ? `<tr><td style="padding:5px 0;border-bottom:1px solid #e5e7eb"><strong>رسوم الشحن:</strong></td><td style="text-align:left;padding:5px 0;border-bottom:1px solid #e5e7eb">${shippingFee.toFixed(2)} ج.م</td></tr>` : ''}
            ${discountAmount > 0 ? `<tr><td style="padding:5px 0;border-bottom:1px solid #e5e7eb;color:#dc2626"><strong>الخصم:</strong></td><td style="text-align:left;padding:5px 0;border-bottom:1px solid #e5e7eb;color:#dc2626">-${discountAmount.toFixed(2)} ج.م</td></tr>` : ''}
            ${taxAmount > 0 ? `<tr><td style="padding:5px 0;border-bottom:1px solid #e5e7eb"><strong>الضرائب:</strong></td><td style="text-align:left;padding:5px 0;border-bottom:1px solid #e5e7eb">${taxAmount.toFixed(2)} ج.م</td></tr>` : ''}
            <tr style="background:#dcfce7"><td style="padding:8px 0;font-size:18px"><strong>المبلغ النهائي:</strong></td><td style="text-align:left;padding:8px 0;font-size:18px;font-weight:bold;color:#16a34a">${finalAmount.toFixed(2)} ج.م</td></tr>
          </table>
          
          <div style="margin-top:10px">
            <p><strong>طريقة الدفع:</strong> ${order.payment_method || 'غير محدد'}</p>
            <p><strong>حالة الدفع:</strong> ${order.payment_status || 'غير محدد'}</p>
          </div>
          
          ${pointsEarned > 0 || pointsUsed > 0 ? `
            <div style="margin-top:10px;padding:10px;background:#fef3c7;border-radius:4px">
              ${pointsUsed > 0 ? `<p><strong>نقاط مستخدمة:</strong> ${pointsUsed}</p>` : ''}
              ${pointsEarned > 0 ? `<p><strong>نقاط مكتسبة:</strong> ${pointsEarned}</p>` : ''}
            </div>
          ` : ''}
        </div>

        <div style="text-align:center;margin:20px 0">
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || '#'}/admin" 
             style="background:#2563eb;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block">
            🔗 فتح لوحة الإدارة
          </a>
        </div>

      </div>
      </body>
      </html>
    `

  let transporter: nodemailer.Transporter

    // Prefer OAuth2 -> use Gmail REST API (more reliable than SMTP XOAUTH2)
    if (GMAIL_CLIENT_ID && GMAIL_CLIENT_SECRET && GMAIL_REFRESH_TOKEN && GMAIL_EMAIL) {
      const oAuth2Client = new google.auth.OAuth2(
        GMAIL_CLIENT_ID,
        GMAIL_CLIENT_SECRET,
        'https://developers.google.com/oauthplayground'
      )
      oAuth2Client.setCredentials({ refresh_token: GMAIL_REFRESH_TOKEN })

      // get access token
      const accessTokenResponse = await oAuth2Client.getAccessToken()
      const accessToken = typeof accessTokenResponse === 'string'
        ? accessTokenResponse
        : accessTokenResponse?.token
      console.log('send-order-email: using OAuth2 (Gmail REST)', {
        hasAccessToken: !!accessToken,
        accessTokenSnippet: accessToken ? String(accessToken).slice(0, 20) + '...' : null,
        gmailEmail: GMAIL_EMAIL,
      })

      if (!accessToken) {
        throw new Error('Failed to obtain access token')
      }

      // Build MIME message with MailComposer to guarantee correct UTF-8 encoding
      const mailOptions = {
        from: GMAIL_EMAIL,
        to: ADMIN_EMAIL,
        subject,
        html,
        text: undefined,
        headers: {
          'X-Mailer': 'Perfecto Server',
        },
      }

      const mailComposer = new MailComposer(mailOptions)
      const messageBuffer: Buffer = await new Promise((resolve, reject) => {
        mailComposer.compile().build((err: Error | null, msg: Buffer) => {
          if (err) return reject(err)
          resolve(msg)
        })
      })

      // base64url encode the compiled MIME message
      const raw = messageBuffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

      const gmail = google.gmail({ version: 'v1', auth: oAuth2Client })
      const sendRes = await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw },
      })

      console.log('send-order-email: gmail API send result=', { id: sendRes.data?.id })
      return NextResponse.json({ ok: true, info: sendRes.data })
    } else if (GMAIL_EMAIL && GMAIL_APP_PASSWORD) {
      // fallback to app password SMTP
      transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: GMAIL_EMAIL,
          pass: GMAIL_APP_PASSWORD,
        },
      } as any)
    } else {
      console.warn('send-order-email: missing email configuration')
      return NextResponse.json({ ok: false, error: 'missing email configuration' }, { status: 500 })
    }

    console.log('send-order-email: about to send mail, to=', ADMIN_EMAIL)
    const info = await transporter.sendMail({
      from: `"Orders" <${GMAIL_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject,
      html,
    })
    console.log('send-order-email: mail sent info=', { messageId: info?.messageId, accepted: info?.accepted })

    return NextResponse.json({ ok: true, info })
  } catch (err: any) {
    console.error('send-order-email error', err)
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 })
  }
}
