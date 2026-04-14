import { createClient } from 'npm:@supabase/supabase-js@2'
import { SMTPClient } from 'npm:emailjs@4.0.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── Multi-account SMTP routing ──
interface SmtpAccount {
  user: string; pass: string; displayName: string;
}

function getSmtpAccount(type: string): SmtpAccount {
  switch (type) {
    case 'system-error': {
      const user = Deno.env.get('SUPPORT_USER')
      const pass = Deno.env.get('SUPPORT_PASS')
      if (!user || !pass) throw new Error('SUPPORT_USER / SUPPORT_PASS not configured')
      return { user, pass, displayName: 'MRC GlobalPay Support' }
    }
    default: {
      const user = Deno.env.get('NOREPLY_USER')
      const pass = Deno.env.get('NOREPLY_PASS')
      if (!user || !pass) throw new Error('NOREPLY_USER / NOREPLY_PASS not configured')
      return { user, pass, displayName: 'MRC GlobalPay' }
    }
  }
}

// ── Data masking utility ──
function maskAddress(addr: string): string {
  if (!addr || addr.length < 10) return addr || '—'
  return `${addr.slice(0, 6)}····${addr.slice(-4)}`
}

function maskTxHash(hash: string): string {
  if (!hash || hash.length < 12) return hash || '—'
  return `${hash.slice(0, 6)}····${hash.slice(-6)}`
}

// ── Language map ──
const LANG_STRINGS: Record<string, {
  greeting: string; receiptTitle: string; pairLabel: string;
  depositLabel: string; recipientLabel: string; trackBtn: string;
  footer: string; errorSubject: string;
  verifySubject: string; verifyTitle: string; verifyBody: string; verifyBtn: string;
  loanConfirmSubject: string; loanConfirmTitle: string; loanConfirmBody: string;
  earnConfirmSubject: string; earnConfirmTitle: string; earnConfirmBody: string;
  riskAlertSubject: string; riskAlertTitle: string; riskAlertYellow: string; riskAlertRed: string;
  collateralLabel: string; ltvLabel: string; amountLabel: string; assetLabel: string; apyLabel: string;
  viewDashboard: string; liabilityNote: string;
}> = {
  en: { greeting: 'Hello', receiptTitle: 'Exchange Receipt', pairLabel: 'Exchange Pair', depositLabel: 'Deposit Address', recipientLabel: 'Recipient Address', trackBtn: 'Track Your Exchange', footer: 'MRC GlobalPay is a Registered Canadian MSB. Non-custodial service — we never hold your keys.', errorSubject: 'System Alert: Settlement Delay', verifySubject: 'Action Required: Verify Your MRC GlobalPay Account', verifyTitle: 'Confirm Your Email', verifyBody: 'For your security, you must confirm your email within 48 hours. If not verified by {deadline}, this account and all associated data will be permanently deleted for your protection.', verifyBtn: 'Confirm My Email' },
  es: { greeting: 'Hola', receiptTitle: 'Recibo de Intercambio', pairLabel: 'Par de Intercambio', depositLabel: 'Dirección de Depósito', recipientLabel: 'Dirección del Destinatario', trackBtn: 'Seguir tu Intercambio', footer: 'MRC GlobalPay es una MSB registrada en Canadá. Servicio no custodial — nunca mantenemos tus claves.', errorSubject: 'Alerta del Sistema: Retraso de Liquidación', verifySubject: 'Acción Requerida: Verifique su cuenta MRC GlobalPay', verifyTitle: 'Confirme su Correo', verifyBody: 'Por su seguridad, debe confirmar su correo electrónico en 48 horas. Si no se verifica antes de {deadline}, esta cuenta será eliminada permanentemente.', verifyBtn: 'Confirmar mi Correo' },
  pt: { greeting: 'Olá', receiptTitle: 'Recibo de Troca', pairLabel: 'Par de Troca', depositLabel: 'Endereço de Depósito', recipientLabel: 'Endereço do Destinatário', trackBtn: 'Rastrear sua Troca', footer: 'MRC GlobalPay é um MSB registrado no Canadá. Serviço não custodial — nunca guardamos suas chaves.', errorSubject: 'Alerta do Sistema: Atraso de Liquidação', verifySubject: 'Ação Necessária: Verifique sua conta MRC GlobalPay', verifyTitle: 'Confirme seu Email', verifyBody: 'Para sua segurança, confirme seu email em 48 horas. Se não verificado até {deadline}, esta conta será permanentemente excluída.', verifyBtn: 'Confirmar meu Email' },
  fr: { greeting: 'Bonjour', receiptTitle: 'Reçu d\'Échange', pairLabel: 'Paire d\'Échange', depositLabel: 'Adresse de Dépôt', recipientLabel: 'Adresse du Destinataire', trackBtn: 'Suivre votre Échange', footer: 'MRC GlobalPay est un MSB enregistré au Canada. Service non-dépositaire — nous ne détenons jamais vos clés.', errorSubject: 'Alerte Système: Délai de Règlement', verifySubject: 'Action Requise: Vérifiez votre compte MRC GlobalPay', verifyTitle: 'Confirmez votre Email', verifyBody: 'Pour votre sécurité, confirmez votre email sous 48 heures. S\'il n\'est pas vérifié avant {deadline}, ce compte sera définitivement supprimé.', verifyBtn: 'Confirmer mon Email' },
  ja: { greeting: 'こんにちは', receiptTitle: '交換レシート', pairLabel: '交換ペア', depositLabel: '入金アドレス', recipientLabel: '受取アドレス', trackBtn: '交換を追跡', footer: 'MRC GlobalPayはカナダ登録MSBです。ノンカストディアルサービス — お客様の鍵を保持しません。', errorSubject: 'システムアラート: 決済遅延', verifySubject: '対応が必要：MRC GlobalPayアカウントを確認してください', verifyTitle: 'メールアドレスを確認', verifyBody: 'セキュリティのため、48時間以内にメールを確認してください。{deadline}までに確認されない場合、アカウントは永久に削除されます。', verifyBtn: 'メールを確認' },
  tr: { greeting: 'Merhaba', receiptTitle: 'Değişim Makbuzu', pairLabel: 'Değişim Çifti', depositLabel: 'Depozit Adresi', recipientLabel: 'Alıcı Adresi', trackBtn: 'Değişiminizi Takip Edin', footer: 'MRC GlobalPay, Kanada kayıtlı bir MSB\'dir. Emanetçi olmayan hizmet — anahtarlarınızı asla tutmuyoruz.', errorSubject: 'Sistem Uyarısı: Uzlaşma Gecikmesi', verifySubject: 'İşlem Gerekli: MRC GlobalPay Hesabınızı Doğrulayın', verifyTitle: 'E-postanızı Onaylayın', verifyBody: 'Güvenliğiniz için e-postanızı 48 saat içinde onaylamanız gerekir. {deadline} tarihine kadar doğrulanmazsa bu hesap kalıcı olarak silinecektir.', verifyBtn: 'E-postamı Onayla' },
  hi: { greeting: 'नमस्ते', receiptTitle: 'एक्सचेंज रसीद', pairLabel: 'एक्सचेंज जोड़ी', depositLabel: 'जमा पता', recipientLabel: 'प्राप्तकर्ता पता', trackBtn: 'अपना एक्सचेंज ट्रैक करें', footer: 'MRC GlobalPay एक कनाडा पंजीकृत MSB है। नॉन-कस्टोडियल सेवा — हम कभी आपकी कुंजी नहीं रखते।', errorSubject: 'सिस्टम चेतावनी: निपटान विलंब', verifySubject: 'कार्रवाई आवश्यक: अपना MRC GlobalPay खाता सत्यापित करें', verifyTitle: 'अपना ईमेल पुष्टि करें', verifyBody: 'आपकी सुरक्षा के लिए, 48 घंटों के भीतर अपना ईमेल पुष्टि करें। {deadline} तक सत्यापित नहीं होने पर यह खाता स्थायी रूप से हटा दिया जाएगा।', verifyBtn: 'ईमेल पुष्टि करें' },
  vi: { greeting: 'Xin chào', receiptTitle: 'Biên Lai Giao Dịch', pairLabel: 'Cặp Giao Dịch', depositLabel: 'Địa Chỉ Nạp', recipientLabel: 'Địa Chỉ Nhận', trackBtn: 'Theo Dõi Giao Dịch', footer: 'MRC GlobalPay là MSB đã đăng ký tại Canada. Dịch vụ phi lưu ký — chúng tôi không bao giờ giữ chìa khóa của bạn.', errorSubject: 'Cảnh Báo Hệ Thống: Trì Hoãn Thanh Toán', verifySubject: 'Hành Động Cần Thiết: Xác Minh Tài Khoản MRC GlobalPay', verifyTitle: 'Xác Nhận Email', verifyBody: 'Vì bảo mật, bạn phải xác nhận email trong 48 giờ. Nếu không xác minh trước {deadline}, tài khoản sẽ bị xóa vĩnh viễn.', verifyBtn: 'Xác Nhận Email' },
  af: { greeting: 'Hallo', receiptTitle: 'Ruil Kwitansie', pairLabel: 'Ruil Paar', depositLabel: 'Deposito Adres', recipientLabel: 'Ontvanger Adres', trackBtn: 'Volg Jou Ruil', footer: 'MRC GlobalPay is \'n Kanada-geregistreerde MSB. Nie-bewarende diens — ons hou nooit jou sleutels nie.', errorSubject: 'Stelsel Waarskuwing: Vestigingsvertraging', verifySubject: 'Aksie Vereis: Bevestig jou MRC GlobalPay Rekening', verifyTitle: 'Bevestig Jou E-pos', verifyBody: 'Vir jou sekuriteit, bevestig jou e-pos binne 48 uur. As dit nie teen {deadline} geverifieer word nie, sal hierdie rekening permanent uitgevee word.', verifyBtn: 'Bevestig E-pos' },
  fa: { greeting: 'سلام', receiptTitle: 'رسید مبادله', pairLabel: 'جفت مبادله', depositLabel: 'آدرس واریز', recipientLabel: 'آدرس گیرنده', trackBtn: 'پیگیری مبادله', footer: 'MRC GlobalPay یک MSB ثبت شده کانادا است. خدمات غیرامانی — ما هرگز کلیدهای شما را نگه نمی‌داریم.', errorSubject: 'هشدار سیستم: تأخیر تسویه', verifySubject: 'اقدام لازم: حساب MRC GlobalPay خود را تأیید کنید', verifyTitle: 'ایمیل خود را تأیید کنید', verifyBody: 'برای امنیت شما، ایمیل خود را ظرف ۴۸ ساعت تأیید کنید. اگر تا {deadline} تأیید نشود، این حساب برای همیشه حذف خواهد شد.', verifyBtn: 'تأیید ایمیل' },
  ur: { greeting: 'السلام علیکم', receiptTitle: 'تبادلہ رسید', pairLabel: 'تبادلہ جوڑا', depositLabel: 'جمع ایڈریس', recipientLabel: 'وصول کنندہ ایڈریس', trackBtn: 'اپنا تبادلہ ٹریک کریں', footer: 'MRC GlobalPay کینیڈا میں رجسٹرڈ MSB ہے۔ نان-کسٹوڈیل سروس — ہم کبھی آپ کی چابیاں نہیں رکھتے۔', errorSubject: 'سسٹم الرٹ: تصفیہ تاخیر', verifySubject: 'عمل درکار: اپنا MRC GlobalPay اکاؤنٹ تصدیق کریں', verifyTitle: 'ای میل کی تصدیق کریں', verifyBody: 'آپ کی سیکورٹی کے لیے، 48 گھنٹے میں ای میل کی تصدیق کریں۔ اگر {deadline} تک تصدیق نہیں ہوئی تو یہ اکاؤنٹ مستقل طور پر حذف ہو جائے گا۔', verifyBtn: 'ای میل تصدیق' },
  he: { greeting: 'שלום', receiptTitle: 'קבלת המרה', pairLabel: 'זוג המרה', depositLabel: 'כתובת הפקדה', recipientLabel: 'כתובת מקבל', trackBtn: 'עקוב אחרי ההמרה שלך', footer: 'MRC GlobalPay הוא MSB רשום בקנדה. שירות ללא משמורת — אנחנו אף פעם לא מחזיקים במפתחות שלך.', errorSubject: 'התראת מערכת: עיכוב סליקה', verifySubject: 'נדרשת פעולה: אמת את חשבון MRC GlobalPay שלך', verifyTitle: 'אשר את האימייל שלך', verifyBody: 'לביטחונך, אשר את האימייל שלך תוך 48 שעות. אם לא יאומת עד {deadline}, החשבון יימחק לצמיתות.', verifyBtn: 'אשר אימייל' },
  uk: { greeting: 'Привіт', receiptTitle: 'Квитанція Обміну', pairLabel: 'Пара Обміну', depositLabel: 'Адреса Депозиту', recipientLabel: 'Адреса Отримувача', trackBtn: 'Відстежити Ваш Обмін', footer: 'MRC GlobalPay — зареєстрований канадський MSB. Некастодіальний сервіс — ми ніколи не зберігаємо ваші ключі.', errorSubject: 'Системне сповіщення: затримка розрахунків', verifySubject: 'Потрібна дія: Підтвердіть ваш обліковий запис MRC GlobalPay', verifyTitle: 'Підтвердіть вашу електронну пошту', verifyBody: 'Для вашої безпеки підтвердіть email протягом 48 годин. Якщо не підтверджено до {deadline}, обліковий запис буде остаточно видалено.', verifyBtn: 'Підтвердити email' },
}

function getLang(lang?: string) {
  const key = (lang || 'en').toLowerCase().slice(0, 2)
  return LANG_STRINGS[key] || LANG_STRINGS.en
}

// ── RTL detection ──
const RTL_LANGS = ['fa', 'ur', 'he']
function isRtl(lang: string): boolean {
  return RTL_LANGS.includes((lang || 'en').toLowerCase().slice(0, 2))
}

// ── Premium Dark Template ──
function renderReceipt(data: {
  transactionId: string; fromAmount: string; fromCurrency: string;
  toCurrency: string; depositAddress: string; recipientAddress: string;
  lang?: string;
}): string {
  const l = getLang(data.lang)
  const dir = isRtl(data.lang || 'en') ? 'rtl' : 'ltr'

  return `<!DOCTYPE html>
<html lang="${(data.lang || 'en').slice(0, 2)}" dir="${dir}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="580" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">

<!-- Header -->
<tr><td style="padding:32px 32px 24px;text-align:center;border-bottom:1px solid #334155;">
  <div style="font-size:24px;font-weight:700;color:#38bdf8;letter-spacing:-0.3px;">MRC GlobalPay</div>
</td></tr>

<!-- Title -->
<tr><td style="padding:28px 32px 8px;text-align:center;">
  <div style="font-size:22px;font-weight:700;color:#f1f5f9;">${l.receiptTitle}</div>
</td></tr>

<!-- Transaction ID -->
<tr><td style="padding:16px 32px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:10px;border:1px solid #334155;">
  <tr><td style="padding:16px 20px;">
    <div style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px;">Transaction ID</div>
    <div style="font-size:14px;font-weight:600;color:#38bdf8;font-family:'Roboto Mono',monospace;word-break:break-all;">${maskTxHash(data.transactionId)}</div>
  </td></tr>
  </table>
</td></tr>

<!-- Exchange Pair -->
<tr><td style="padding:8px 32px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:10px;border:1px solid #334155;">
  <tr><td style="padding:16px 20px;">
    <div style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px;">${l.pairLabel}</div>
    <div style="font-size:18px;font-weight:700;color:#f1f5f9;">${data.fromAmount} ${(data.fromCurrency || '').toUpperCase()} <span style="color:#38bdf8;">→</span> ${(data.toCurrency || '').toUpperCase()}</div>
  </td></tr>
  </table>
</td></tr>

<!-- Deposit Address -->
<tr><td style="padding:8px 32px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:10px;border:1px solid #334155;">
  <tr><td style="padding:16px 20px;">
    <div style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px;">${l.depositLabel}</div>
    <div style="font-size:13px;font-weight:500;color:#94a3b8;font-family:'Roboto Mono',monospace;word-break:break-all;">${maskAddress(data.depositAddress)}</div>
  </td></tr>
  </table>
</td></tr>

<!-- Recipient Address -->
<tr><td style="padding:8px 32px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:10px;border:1px solid #334155;">
  <tr><td style="padding:16px 20px;">
    <div style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px;">${l.recipientLabel}</div>
    <div style="font-size:13px;font-weight:500;color:#94a3b8;font-family:'Roboto Mono',monospace;word-break:break-all;">${maskAddress(data.recipientAddress)}</div>
  </td></tr>
  </table>
</td></tr>

<!-- CTA -->
<tr><td style="padding:24px 32px;text-align:center;">
  <a href="https://mrcglobalpay.com" style="display:inline-block;background:linear-gradient(135deg,#0ea5e9,#38bdf8);color:#0f172a;font-size:15px;font-weight:700;padding:14px 36px;border-radius:10px;text-decoration:none;">${l.trackBtn}</a>
</td></tr>

<!-- Footer -->
<tr><td style="padding:20px 32px 32px;text-align:center;border-top:1px solid #334155;">
  <div style="font-size:11px;color:#64748b;line-height:1.6;">${l.footer}</div>
  <div style="font-size:10px;color:#475569;margin-top:8px;">© ${new Date().getFullYear()} MRC GlobalPay. All rights reserved.</div>
</td></tr>

</table>
</td></tr></table>
</body></html>`
}

// ── System error template ──
function renderSystemError(data: { transactionId: string; message: string }): string {
  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="580" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #f59e0b;">

<tr><td style="padding:32px;text-align:center;border-bottom:1px solid #334155;">
  <div style="font-size:24px;font-weight:700;color:#fbbf24;">🔧 System Alert</div>
</td></tr>

<tr><td style="padding:24px 32px;">
  <div style="color:#f1f5f9;font-size:15px;line-height:1.7;">
    <p>${data.message}</p>
  </div>
  <table role="presentation" width="100%" style="margin:16px 0;background:#0f172a;border-radius:10px;border:1px solid #334155;">
  <tr><td style="padding:16px 20px;">
    <div style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;">Transaction ID</div>
    <div style="font-size:14px;font-weight:600;color:#38bdf8;font-family:'Roboto Mono',monospace;margin-top:4px;">${maskTxHash(data.transactionId)}</div>
    <div style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;margin-top:12px;">Timestamp</div>
    <div style="font-size:13px;color:#94a3b8;margin-top:4px;">${new Date().toISOString()}</div>
  </td></tr>
  </table>
</td></tr>

<tr><td style="padding:16px 32px 32px;text-align:center;border-top:1px solid #334155;">
  <div style="font-size:10px;color:#64748b;">Automated system monitoring — MRC GlobalPay Infrastructure.</div>
</td></tr>

</table></td></tr></table></body></html>`
}

// ── SMTP send function (multi-account) ──
async function sendViaSMTP(opts: {
  account: SmtpAccount; to: string; subject: string;
  html: string; bcc?: string;
}) {
  const client = new SMTPClient({
    user: opts.account.user,
    password: opts.account.pass,
    host: 'smtp.hostinger.com',
    ssl: true,
  })

  const message: Record<string, unknown> = {
    from: `${opts.account.displayName} <${opts.account.user}>`,
    to: opts.to,
    subject: opts.subject,
    attachment: [{ data: opts.html, alternative: true }],
  }
  if (opts.bcc) message.bcc = opts.bcc

  await client.sendAsync(message as any)
}

// ── Main handler ──
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const {
      type, // 'receipt' | 'system-error' | 'verification'
      recipientEmail,
      transactionId,
      fromAmount, fromCurrency, toCurrency,
      depositAddress, recipientAddress,
      message: errorMessage,
      lang,
      to, // alias for recipientEmail (used by verification)
      verificationToken,
      expiresAt,
    } = body

    const toEmail = recipientEmail || to

    if (!type) {
      return new Response(JSON.stringify({ error: 'type is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Check suppression
    if (toEmail) {
      const { data: suppressed } = await supabase
        .from('suppressed_emails')
        .select('id')
        .eq('email', toEmail.toLowerCase())
        .maybeSingle()
      if (suppressed) {
        return new Response(JSON.stringify({ success: false, reason: 'email_suppressed' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    let html: string
    let subject: string
    const l = getLang(lang)

    // Resolve the correct SMTP account for this email type
    const account = getSmtpAccount(type)

    switch (type) {
      case 'receipt': {
        if (!toEmail) throw new Error('recipientEmail required for receipts')
        subject = `${l.receiptTitle} — MRC GlobalPay`
        html = renderReceipt({
          transactionId, fromAmount, fromCurrency, toCurrency,
          depositAddress, recipientAddress, lang,
        })
        break
      }

      case 'system-error': {
        subject = l.errorSubject
        html = renderSystemError({
          transactionId: transactionId || 'N/A',
          message: errorMessage || 'A bridge settlement has been delayed beyond the expected threshold.',
        })
        break
      }

      case 'verification': {
        if (!toEmail) throw new Error('to/recipientEmail required for verification')
        if (!verificationToken) throw new Error('verificationToken required')
        const deadline = expiresAt ? new Date(expiresAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '48 hours'
        const verifyLink = `https://mrcglobalpay.com/verify-email?token=${verificationToken}`
        subject = l.verifySubject
        const dir = RTL_LANGS.includes((lang || 'en').slice(0, 2)) ? 'rtl' : 'ltr'
        html = `<!DOCTYPE html>
<html lang="${(lang || 'en').slice(0,2)}" dir="${dir}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="580" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">
<tr><td style="padding:32px 32px 24px;text-align:center;border-bottom:1px solid #334155;">
  <div style="font-size:24px;font-weight:700;color:#38bdf8;">MRC GlobalPay</div>
</td></tr>
<tr><td style="padding:28px 32px 8px;text-align:center;">
  <div style="font-size:22px;font-weight:700;color:#f1f5f9;">📧 ${l.verifyTitle}</div>
</td></tr>
<tr><td style="padding:16px 32px;">
  <div style="font-size:15px;color:#94a3b8;line-height:1.7;text-align:center;">${l.verifyBody.replace('{deadline}', deadline)}</div>
</td></tr>
<tr><td style="padding:24px 32px;text-align:center;">
  <a href="${verifyLink}" style="display:inline-block;background:linear-gradient(135deg,#0ea5e9,#38bdf8);color:#0f172a;font-size:15px;font-weight:700;padding:14px 36px;border-radius:10px;text-decoration:none;">${l.verifyBtn}</a>
</td></tr>
<tr><td style="padding:0 32px 8px;text-align:center;">
  <div style="font-size:11px;color:#64748b;">⏱ 48h</div>
</td></tr>
<tr><td style="padding:20px 32px 32px;text-align:center;border-top:1px solid #334155;">
  <div style="font-size:11px;color:#64748b;line-height:1.6;">${l.footer}</div>
  <div style="font-size:10px;color:#475569;margin-top:8px;">© ${new Date().getFullYear()} MRC GlobalPay</div>
</td></tr>
</table></td></tr></table></body></html>`
        break
      }

      default:
        return new Response(JSON.stringify({ error: `Unknown type: ${type}` }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }

    const toAddress = type === 'system-error'
      ? 'support@mrc-pay.com'
      : toEmail

    await sendViaSMTP({
      account,
      to: toAddress,
      subject,
      html,
    })

    // Log the send
    await supabase.from('email_send_log').insert({
      message_id: crypto.randomUUID(),
      template_name: `smtp-${type}`,
      recipient_email: toAddress,
      status: 'sent',
    })

    console.log(`SMTP email sent: type=${type}, to=${toAddress}`)

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('SMTP send error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})