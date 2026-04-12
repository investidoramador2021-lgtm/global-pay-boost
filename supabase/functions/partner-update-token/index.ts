import { createClient } from 'npm:@supabase/supabase-js@2'
import { SMTPClient } from 'npm:emailjs@4.0.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ── BTC wallet validation ──
function isValidBtcAddress(addr: string): boolean {
  // Legacy (1...), SegWit (3...), Native SegWit (bc1...)
  return /^(1[1-9A-HJ-NP-Za-km-z]{25,34}|3[1-9A-HJ-NP-Za-km-z]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{25,90})$/.test(addr)
}

// ── SMTP send via no-reply account ──
async function sendSmtp(to: string, subject: string, html: string) {
  const user = Deno.env.get('NOREPLY_USER')!
  const pass = Deno.env.get('NOREPLY_PASS')!
  const client = new SMTPClient({ user, password: pass, host: 'smtp.hostinger.com', ssl: true })
  await client.sendAsync({
    from: `MRC GlobalPay <${user}>`,
    to,
    subject,
    attachment: [{ data: html, alternative: true }],
  } as any)
}

// ── Language strings ──
const LANG: Record<string, { secureSubject: string; secureTitle: string; secureBody: string; secureBtn: string; confirmSubject: string; confirmTitle: string; confirmBody: string; footer: string }> = {
  en: { secureSubject: 'Action Required: Secure Link to Update Your Account', secureTitle: 'Secure Account Update', secureBody: 'You requested to update your account security details. Click the button below to proceed. This link expires in 15 minutes.', secureBtn: 'Update My Account', confirmSubject: 'Account Security Details Updated', confirmTitle: 'Account Updated', confirmBody: 'Your account security details were recently updated. If this wasn\'t you, contact compliance@mrc-pay.com immediately.', footer: 'MRC GlobalPay is a Registered Canadian MSB. Non-custodial service — we never hold your keys.' },
  es: { secureSubject: 'Acción Requerida: Enlace Seguro para Actualizar su Cuenta', secureTitle: 'Actualización Segura de Cuenta', secureBody: 'Solicitó actualizar los datos de seguridad de su cuenta. Haga clic en el botón a continuación. Este enlace caduca en 15 minutos.', secureBtn: 'Actualizar Mi Cuenta', confirmSubject: 'Datos de Seguridad de Cuenta Actualizados', confirmTitle: 'Cuenta Actualizada', confirmBody: 'Los detalles de seguridad de su cuenta fueron actualizados recientemente. Si no fue usted, contacte a compliance@mrc-pay.com inmediatamente.', footer: 'MRC GlobalPay es una MSB registrada en Canadá. Servicio no custodial — nunca mantenemos tus claves.' },
  pt: { secureSubject: 'Ação Necessária: Link Seguro para Atualizar Sua Conta', secureTitle: 'Atualização Segura da Conta', secureBody: 'Você solicitou atualizar os detalhes de segurança da sua conta. Clique no botão abaixo. Este link expira em 15 minutos.', secureBtn: 'Atualizar Minha Conta', confirmSubject: 'Detalhes de Segurança da Conta Atualizados', confirmTitle: 'Conta Atualizada', confirmBody: 'Os detalhes de segurança da sua conta foram atualizados recentemente. Se não foi você, entre em contato com compliance@mrc-pay.com imediatamente.', footer: 'MRC GlobalPay é um MSB registrado no Canadá. Serviço não custodial — nunca guardamos suas chaves.' },
  fr: { secureSubject: 'Action Requise: Lien Sécurisé pour Mettre à Jour Votre Compte', secureTitle: 'Mise à Jour Sécurisée du Compte', secureBody: 'Vous avez demandé à mettre à jour les détails de sécurité de votre compte. Cliquez sur le bouton ci-dessous. Ce lien expire dans 15 minutes.', secureBtn: 'Mettre à Jour Mon Compte', confirmSubject: 'Détails de Sécurité du Compte Mis à Jour', confirmTitle: 'Compte Mis à Jour', confirmBody: 'Les détails de sécurité de votre compte ont été récemment mis à jour. Si ce n\'était pas vous, contactez compliance@mrc-pay.com immédiatement.', footer: 'MRC GlobalPay est un MSB enregistré au Canada. Service non-dépositaire — nous ne détenons jamais vos clés.' },
  ja: { secureSubject: '対応が必要: アカウント更新のためのセキュアリンク', secureTitle: 'セキュアアカウント更新', secureBody: 'アカウントのセキュリティ情報の更新をリクエストしました。以下のボタンをクリックしてください。このリンクは15分で期限切れになります。', secureBtn: 'アカウントを更新', confirmSubject: 'アカウントセキュリティ情報が更新されました', confirmTitle: 'アカウント更新完了', confirmBody: 'お客様のアカウントのセキュリティ情報が最近更新されました。心当たりがない場合は、直ちに compliance@mrc-pay.com までご連絡ください。', footer: 'MRC GlobalPayはカナダ登録MSBです。ノンカストディアルサービス — お客様の鍵を保持しません。' },
  tr: { secureSubject: 'Eylem Gerekli: Hesabınızı Güncellemek İçin Güvenli Bağlantı', secureTitle: 'Güvenli Hesap Güncellemesi', secureBody: 'Hesap güvenlik bilgilerinizi güncelleme talebinde bulundunuz. Devam etmek için aşağıdaki düğmeye tıklayın. Bu bağlantı 15 dakika sonra sona erer.', secureBtn: 'Hesabımı Güncelle', confirmSubject: 'Hesap Güvenlik Bilgileri Güncellendi', confirmTitle: 'Hesap Güncellendi', confirmBody: 'Hesap güvenlik bilgileriniz yakın zamanda güncellendi. Bu siz değilseniz, hemen compliance@mrc-pay.com ile iletişime geçin.', footer: 'MRC GlobalPay, Kanada kayıtlı bir MSB\'dir. Emanetçi olmayan hizmet — anahtarlarınızı asla tutmuyoruz.' },
  hi: { secureSubject: 'कार्रवाई आवश्यक: अपना खाता अपडेट करने के लिए सुरक्षित लिंक', secureTitle: 'सुरक्षित खाता अपडेट', secureBody: 'आपने अपने खाते की सुरक्षा विवरण अपडेट करने का अनुरोध किया है। नीचे दिए गए बटन पर क्लिक करें। यह लिंक 15 मिनट में समाप्त हो जाएगा।', secureBtn: 'मेरा खाता अपडेट करें', confirmSubject: 'खाता सुरक्षा विवरण अपडेट किया गया', confirmTitle: 'खाता अपडेट किया गया', confirmBody: 'आपके खाते की सुरक्षा विवरण हाल ही में अपडेट किए गए हैं। यदि यह आप नहीं थे, तो तुरंत compliance@mrc-pay.com से संपर्क करें।', footer: 'MRC GlobalPay एक कनाडा पंजीकृत MSB है। नॉन-कस्टोडियल सेवा — हम कभी आपकी कुंजी नहीं रखते।' },
  vi: { secureSubject: 'Hành Động Cần Thiết: Liên Kết An Toàn để Cập Nhật Tài Khoản', secureTitle: 'Cập Nhật Tài Khoản An Toàn', secureBody: 'Bạn đã yêu cầu cập nhật chi tiết bảo mật tài khoản. Nhấp vào nút bên dưới. Liên kết này hết hạn sau 15 phút.', secureBtn: 'Cập Nhật Tài Khoản', confirmSubject: 'Chi Tiết Bảo Mật Tài Khoản Đã Được Cập Nhật', confirmTitle: 'Tài Khoản Đã Cập Nhật', confirmBody: 'Chi tiết bảo mật tài khoản của bạn đã được cập nhật gần đây. Nếu không phải bạn, hãy liên hệ compliance@mrc-pay.com ngay lập tức.', footer: 'MRC GlobalPay là MSB đã đăng ký tại Canada. Dịch vụ phi lưu ký — chúng tôi không bao giờ giữ chìa khóa của bạn.' },
  af: { secureSubject: 'Aksie Vereis: Veilige Skakel om Jou Rekening op te Dateer', secureTitle: 'Veilige Rekening Opdatering', secureBody: 'Jy het versoek om jou rekeningsekuriteitsbesonderhede op te dateer. Klik op die knoppie hieronder. Hierdie skakel verval oor 15 minute.', secureBtn: 'Dateer My Rekening Op', confirmSubject: 'Rekening Sekuriteitsbesonderhede Opgedateer', confirmTitle: 'Rekening Opgedateer', confirmBody: 'Jou rekeningsekuriteitsbesonderhede is onlangs opgedateer. As dit nie jy was nie, kontak compliance@mrc-pay.com onmiddellik.', footer: 'MRC GlobalPay is \'n Kanada-geregistreerde MSB. Nie-bewarende diens — ons hou nooit jou sleutels nie.' },
  fa: { secureSubject: 'اقدام لازم: لینک امن برای بروزرسانی حساب شما', secureTitle: 'بروزرسانی امن حساب', secureBody: 'شما درخواست بروزرسانی جزئیات امنیتی حساب خود را داده‌اید. روی دکمه زیر کلیک کنید. این لینک ۱۵ دقیقه دیگر منقضی می‌شود.', secureBtn: 'بروزرسانی حساب', confirmSubject: 'جزئیات امنیتی حساب بروزرسانی شد', confirmTitle: 'حساب بروزرسانی شد', confirmBody: 'جزئیات امنیتی حساب شما اخیراً بروزرسانی شده است. اگر این شما نبودید، فوراً با compliance@mrc-pay.com تماس بگیرید.', footer: 'MRC GlobalPay یک MSB ثبت شده کانادا است. خدمات غیرامانی — ما هرگز کلیدهای شما را نگه نمی‌داریم.' },
  ur: { secureSubject: 'عمل درکار: اپنا اکاؤنٹ اپ ڈیٹ کرنے کے لیے محفوظ لنک', secureTitle: 'محفوظ اکاؤنٹ اپ ڈیٹ', secureBody: 'آپ نے اپنے اکاؤنٹ کی حفاظتی تفصیلات اپ ڈیٹ کرنے کی درخواست کی ہے۔ نیچے دیے گئے بٹن پر کلک کریں۔ یہ لنک 15 منٹ میں ختم ہو جائے گا۔', secureBtn: 'میرا اکاؤنٹ اپ ڈیٹ کریں', confirmSubject: 'اکاؤنٹ سیکیورٹی تفصیلات اپ ڈیٹ ہو گئیں', confirmTitle: 'اکاؤنٹ اپ ڈیٹ ہو گیا', confirmBody: 'آپ کے اکاؤنٹ کی حفاظتی تفصیلات حال ہی میں اپ ڈیٹ کی گئی ہیں۔ اگر یہ آپ نہیں تھے تو فوری طور پر compliance@mrc-pay.com سے رابطہ کریں۔', footer: 'MRC GlobalPay کینیڈا میں رجسٹرڈ MSB ہے۔ نان-کسٹوڈیل سروس — ہم کبھی آپ کی چابیاں نہیں رکھتے۔' },
  he: { secureSubject: 'נדרשת פעולה: קישור מאובטח לעדכון החשבון שלך', secureTitle: 'עדכון חשבון מאובטח', secureBody: 'ביקשת לעדכן את פרטי האבטחה של חשבונך. לחץ על הכפתור למטה. קישור זה יפוג תוך 15 דקות.', secureBtn: 'עדכן את החשבון שלי', confirmSubject: 'פרטי אבטחת החשבון עודכנו', confirmTitle: 'החשבון עודכן', confirmBody: 'פרטי אבטחת החשבון שלך עודכנו לאחרונה. אם זה לא היית אתה, צור קשר עם compliance@mrc-pay.com מיד.', footer: 'MRC GlobalPay הוא MSB רשום בקנדה. שירות ללא משמורת — אנחנו אף פעם לא מחזיקים במפתחות שלך.' },
  uk: { secureSubject: 'Потрібна дія: Безпечне посилання для оновлення вашого облікового запису', secureTitle: 'Безпечне оновлення облікового запису', secureBody: 'Ви запросили оновлення деталей безпеки вашого облікового запису. Натисніть кнопку нижче. Це посилання діє 15 хвилин.', secureBtn: 'Оновити мій обліковий запис', confirmSubject: 'Деталі безпеки облікового запису оновлено', confirmTitle: 'Обліковий запис оновлено', confirmBody: 'Деталі безпеки вашого облікового запису були нещодавно оновлені. Якщо це були не ви, негайно зв\'яжіться з compliance@mrc-pay.com.', footer: 'MRC GlobalPay — зареєстрований канадський MSB. Некастодіальний сервіс — ми ніколи не зберігаємо ваші ключі.' },
}

function getLang(lang?: string) {
  const k = (lang || 'en').toLowerCase().slice(0, 2)
  return LANG[k] || LANG.en
}

const RTL = ['fa', 'ur', 'he']

function renderSecureLink(link: string, lang: string): string {
  const l = getLang(lang)
  const dir = RTL.includes(lang.slice(0, 2)) ? 'rtl' : 'ltr'
  return `<!DOCTYPE html>
<html lang="${lang.slice(0,2)}" dir="${dir}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="580" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">
<tr><td style="padding:32px 32px 24px;text-align:center;border-bottom:1px solid #334155;">
  <div style="font-size:24px;font-weight:700;color:#38bdf8;letter-spacing:-0.3px;">MRC GlobalPay</div>
</td></tr>
<tr><td style="padding:28px 32px 8px;text-align:center;">
  <div style="font-size:22px;font-weight:700;color:#f1f5f9;">🔒 ${l.secureTitle}</div>
</td></tr>
<tr><td style="padding:16px 32px;">
  <div style="font-size:15px;color:#94a3b8;line-height:1.7;text-align:center;">${l.secureBody}</div>
</td></tr>
<tr><td style="padding:24px 32px;text-align:center;">
  <a href="${link}" style="display:inline-block;background:linear-gradient(135deg,#0ea5e9,#38bdf8);color:#0f172a;font-size:15px;font-weight:700;padding:14px 36px;border-radius:10px;text-decoration:none;">${l.secureBtn}</a>
</td></tr>
<tr><td style="padding:16px 32px;text-align:center;">
  <div style="font-size:11px;color:#64748b;">⏱ 15 min</div>
</td></tr>
<tr><td style="padding:20px 32px 32px;text-align:center;border-top:1px solid #334155;">
  <div style="font-size:11px;color:#64748b;line-height:1.6;">${l.footer}</div>
  <div style="font-size:10px;color:#475569;margin-top:8px;">© ${new Date().getFullYear()} MRC GlobalPay</div>
</td></tr>
</table></td></tr></table></body></html>`
}

function renderConfirmation(lang: string): string {
  const l = getLang(lang)
  const dir = RTL.includes(lang.slice(0, 2)) ? 'rtl' : 'ltr'
  return `<!DOCTYPE html>
<html lang="${lang.slice(0,2)}" dir="${dir}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="580" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">
<tr><td style="padding:32px 32px 24px;text-align:center;border-bottom:1px solid #334155;">
  <div style="font-size:24px;font-weight:700;color:#38bdf8;letter-spacing:-0.3px;">MRC GlobalPay</div>
</td></tr>
<tr><td style="padding:28px 32px 8px;text-align:center;">
  <div style="font-size:22px;font-weight:700;color:#f1f5f9;">✅ ${l.confirmTitle}</div>
</td></tr>
<tr><td style="padding:16px 32px 24px;">
  <div style="font-size:15px;color:#94a3b8;line-height:1.7;text-align:center;">${l.confirmBody}</div>
</td></tr>
<tr><td style="padding:20px 32px 32px;text-align:center;border-top:1px solid #334155;">
  <div style="font-size:11px;color:#64748b;line-height:1.6;">${l.footer}</div>
  <div style="font-size:10px;color:#475569;margin-top:8px;">© ${new Date().getFullYear()} MRC GlobalPay</div>
</td></tr>
</table></td></tr></table></body></html>`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    const body = await req.json()
    const { action } = body // 'generate' | 'validate' | 'apply'

    if (action === 'generate') {
      // Requires auth — get user from JWT
      const authHeader = req.headers.get('Authorization')
      if (!authHeader) throw new Error('Unauthorized')

      const { data: { user }, error: authErr } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      )
      if (authErr || !user) throw new Error('Unauthorized')

      // Get partner profile
      const { data: profile } = await supabase
        .from('partner_profiles')
        .select('id, first_name')
        .eq('user_id', user.id)
        .maybeSingle()
      if (!profile) throw new Error('No partner profile found')

      // Generate token
      const token = crypto.randomUUID() + '-' + crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

      await supabase.from('partner_update_tokens').insert({
        user_id: user.id,
        token,
        expires_at: expiresAt,
      })

      // Send magic link email
      const lang = body.lang || 'en'
      const l = getLang(lang)
      const baseUrl = 'https://mrcglobalpay.com'
      const link = `${baseUrl}/verify-update?token=${token}`
      const html = renderSecureLink(link, lang)

      await sendSmtp(user.email!, l.secureSubject, html)

      // Log
      await supabase.from('email_send_log').insert({
        message_id: crypto.randomUUID(),
        template_name: 'smtp-secure-update-link',
        recipient_email: user.email!,
        status: 'sent',
      })

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'validate') {
      const { token } = body
      if (!token) throw new Error('Token required')

      const { data: row } = await supabase
        .from('partner_update_tokens')
        .select('*')
        .eq('token', token)
        .maybeSingle()

      if (!row) {
        return new Response(JSON.stringify({ valid: false, reason: 'invalid' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      if (row.used_at) {
        return new Response(JSON.stringify({ valid: false, reason: 'used' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      if (new Date(row.expires_at) < new Date()) {
        return new Response(JSON.stringify({ valid: false, reason: 'expired' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ valid: true, userId: row.user_id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (action === 'apply') {
      const { token, newPassword, newWallet, lang } = body
      if (!token) throw new Error('Token required')

      // Validate token
      const { data: row } = await supabase
        .from('partner_update_tokens')
        .select('*')
        .eq('token', token)
        .maybeSingle()

      if (!row || row.used_at || new Date(row.expires_at) < new Date()) {
        return new Response(JSON.stringify({ success: false, reason: 'invalid_or_expired' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Validate wallet if provided
      if (newWallet && !isValidBtcAddress(newWallet)) {
        return new Response(JSON.stringify({ success: false, reason: 'invalid_wallet' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Apply password change via admin API
      if (newPassword && newPassword.length >= 8) {
        const { error: pwErr } = await supabase.auth.admin.updateUserById(
          row.user_id,
          { password: newPassword }
        )
        if (pwErr) throw new Error(`Password update failed: ${pwErr.message}`)
      }

      // Apply wallet change
      if (newWallet) {
        const { error: walletErr } = await supabase
          .from('partner_profiles')
          .update({ btc_wallet: newWallet })
          .eq('user_id', row.user_id)
        if (walletErr) throw new Error(`Wallet update failed: ${walletErr.message}`)
      }

      // Mark token as used
      await supabase
        .from('partner_update_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('id', row.id)

      // Get user email for confirmation
      const { data: { user } } = await supabase.auth.admin.getUserById(row.user_id)
      if (user?.email) {
        const l = getLang(lang || 'en')
        const html = renderConfirmation(lang || 'en')
        await sendSmtp(user.email, l.confirmSubject, html)

        await supabase.from('email_send_log').insert({
          message_id: crypto.randomUUID(),
          template_name: 'smtp-update-confirmation',
          recipient_email: user.email,
          status: 'sent',
        })
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('partner-update-token error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
