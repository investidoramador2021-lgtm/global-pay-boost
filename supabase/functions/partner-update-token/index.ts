import { createClient } from 'npm:@supabase/supabase-js@2'
import { SMTPClient } from 'npm:emailjs@4.0.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function isValidBtcAddress(addr: string): boolean {
  return /^(1[1-9A-HJ-NP-Za-km-z]{25,34}|3[1-9A-HJ-NP-Za-km-z]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{25,90})$/.test(addr)
}

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

// ── Language strings (13 languages) ──
const LANG: Record<string, {
  pwSubject: string; pwTitle: string; pwBody: string; pwBtn: string;
  walletSubject: string; walletTitle: string; walletBody: string; walletBtn: string;
  confirmPwSubject: string; confirmPwTitle: string; confirmPwBody: string;
  confirmWalletSubject: string; confirmWalletTitle: string; confirmWalletBody: string;
  footer: string;
}> = {
  en: { pwSubject: 'Action Required: Reset your MRC GlobalPay Password', pwTitle: 'Password Reset', pwBody: 'You requested a password reset. Click the button below to set your new password. This link expires in 15 minutes.', pwBtn: 'Reset My Password', walletSubject: 'Action Required: Update your Settlement Wallet Address', walletTitle: 'Wallet Update', walletBody: 'You requested to update your settlement wallet address. Click the button below to proceed. This link expires in 15 minutes.', walletBtn: 'Update My Wallet', confirmPwSubject: 'Your MRC GlobalPay Password Was Changed', confirmPwTitle: 'Password Changed', confirmPwBody: 'Your account password was recently changed. If this wasn\'t you, contact compliance@mrc-pay.com immediately.', confirmWalletSubject: 'Your Settlement Wallet Was Updated', confirmWalletTitle: 'Wallet Updated', confirmWalletBody: 'Your settlement wallet address was recently updated. If this wasn\'t you, contact compliance@mrc-pay.com immediately.', footer: 'MRC GlobalPay is a Registered Canadian MSB. Non-custodial service — we never hold your keys.' },
  es: { pwSubject: 'Acción Requerida: Restablezca su Contraseña', pwTitle: 'Restablecer Contraseña', pwBody: 'Solicitó restablecer su contraseña. Haga clic abajo. El enlace caduca en 15 minutos.', pwBtn: 'Restablecer Contraseña', walletSubject: 'Acción Requerida: Actualice su Billetera', walletTitle: 'Actualizar Billetera', walletBody: 'Solicitó actualizar su billetera de pago. Haga clic abajo. El enlace caduca en 15 minutos.', walletBtn: 'Actualizar Billetera', confirmPwSubject: 'Su Contraseña Fue Cambiada', confirmPwTitle: 'Contraseña Cambiada', confirmPwBody: 'Su contraseña fue cambiada recientemente. Si no fue usted, contacte a compliance@mrc-pay.com.', confirmWalletSubject: 'Su Billetera Fue Actualizada', confirmWalletTitle: 'Billetera Actualizada', confirmWalletBody: 'Su billetera fue actualizada recientemente. Si no fue usted, contacte a compliance@mrc-pay.com.', footer: 'MRC GlobalPay es una MSB registrada en Canadá.' },
  pt: { pwSubject: 'Ação Necessária: Redefina sua Senha', pwTitle: 'Redefinir Senha', pwBody: 'Você solicitou a redefinição da senha. Clique abaixo. O link expira em 15 minutos.', pwBtn: 'Redefinir Senha', walletSubject: 'Ação Necessária: Atualize sua Carteira', walletTitle: 'Atualizar Carteira', walletBody: 'Você solicitou a atualização da carteira. Clique abaixo. O link expira em 15 minutos.', walletBtn: 'Atualizar Carteira', confirmPwSubject: 'Sua Senha Foi Alterada', confirmPwTitle: 'Senha Alterada', confirmPwBody: 'Sua senha foi alterada recentemente. Se não foi você, contate compliance@mrc-pay.com.', confirmWalletSubject: 'Sua Carteira Foi Atualizada', confirmWalletTitle: 'Carteira Atualizada', confirmWalletBody: 'Sua carteira foi atualizada recentemente. Se não foi você, contate compliance@mrc-pay.com.', footer: 'MRC GlobalPay é um MSB registrado no Canadá.' },
  fr: { pwSubject: 'Action Requise: Réinitialisez votre Mot de Passe', pwTitle: 'Réinitialiser le Mot de Passe', pwBody: 'Vous avez demandé la réinitialisation de votre mot de passe. Cliquez ci-dessous. Ce lien expire dans 15 minutes.', pwBtn: 'Réinitialiser', walletSubject: 'Action Requise: Mettez à jour votre Portefeuille', walletTitle: 'Mettre à Jour le Portefeuille', walletBody: 'Vous avez demandé la mise à jour de votre portefeuille. Cliquez ci-dessous. Ce lien expire dans 15 minutes.', walletBtn: 'Mettre à Jour', confirmPwSubject: 'Votre Mot de Passe a été Changé', confirmPwTitle: 'Mot de Passe Changé', confirmPwBody: 'Votre mot de passe a été récemment changé. Si ce n\'était pas vous, contactez compliance@mrc-pay.com.', confirmWalletSubject: 'Votre Portefeuille a été Mis à Jour', confirmWalletTitle: 'Portefeuille Mis à Jour', confirmWalletBody: 'Votre portefeuille a été récemment mis à jour. Si ce n\'était pas vous, contactez compliance@mrc-pay.com.', footer: 'MRC GlobalPay est un MSB enregistré au Canada.' },
  ja: { pwSubject: '対応が必要：パスワードをリセットしてください', pwTitle: 'パスワードリセット', pwBody: 'パスワードのリセットが要求されました。下のボタンをクリックしてください。15分で期限切れになります。', pwBtn: 'パスワードをリセット', walletSubject: '対応が必要：ウォレットアドレスを更新してください', walletTitle: 'ウォレット更新', walletBody: 'ウォレットアドレスの更新が要求されました。下のボタンをクリックしてください。15分で期限切れになります。', walletBtn: 'ウォレットを更新', confirmPwSubject: 'パスワードが変更されました', confirmPwTitle: 'パスワード変更完了', confirmPwBody: 'パスワードが最近変更されました。心当たりがない場合は、compliance@mrc-pay.comにご連絡ください。', confirmWalletSubject: 'ウォレットが更新されました', confirmWalletTitle: 'ウォレット更新完了', confirmWalletBody: 'ウォレットアドレスが最近更新されました。心当たりがない場合は、compliance@mrc-pay.comにご連絡ください。', footer: 'MRC GlobalPayはカナダ登録MSBです。' },
  tr: { pwSubject: 'İşlem Gerekli: Şifrenizi Sıfırlayın', pwTitle: 'Şifre Sıfırlama', pwBody: 'Şifre sıfırlama talebinde bulundunuz. Aşağıdaki butona tıklayın. 15 dakika sonra sona erer.', pwBtn: 'Şifremi Sıfırla', walletSubject: 'İşlem Gerekli: Cüzdan Adresinizi Güncelleyin', walletTitle: 'Cüzdan Güncelleme', walletBody: 'Cüzdan güncelleme talebinde bulundunuz. Aşağıdaki butona tıklayın. 15 dakika sonra sona erer.', walletBtn: 'Cüzdanımı Güncelle', confirmPwSubject: 'Şifreniz Değiştirildi', confirmPwTitle: 'Şifre Değiştirildi', confirmPwBody: 'Şifreniz yakın zamanda değiştirildi. Bu siz değilseniz, compliance@mrc-pay.com ile iletişime geçin.', confirmWalletSubject: 'Cüzdanınız Güncellendi', confirmWalletTitle: 'Cüzdan Güncellendi', confirmWalletBody: 'Cüzdanınız yakın zamanda güncellendi. Bu siz değilseniz, compliance@mrc-pay.com ile iletişime geçin.', footer: 'MRC GlobalPay Kanada kayıtlı MSB\'dir.' },
  hi: { pwSubject: 'कार्रवाई आवश्यक: अपना पासवर्ड रीसेट करें', pwTitle: 'पासवर्ड रीसेट', pwBody: 'आपने पासवर्ड रीसेट का अनुरोध किया। नीचे बटन पर क्लिक करें। 15 मिनट में लिंक समाप्त हो जाएगा।', pwBtn: 'पासवर्ड रीसेट करें', walletSubject: 'कार्रवाई आवश्यक: अपना वॉलेट अपडेट करें', walletTitle: 'वॉलेट अपडेट', walletBody: 'आपने वॉलेट अपडेट का अनुरोध किया। नीचे बटन पर क्लिक करें। 15 मिनट में लिंक समाप्त हो जाएगा।', walletBtn: 'वॉलेट अपडेट करें', confirmPwSubject: 'आपका पासवर्ड बदल दिया गया', confirmPwTitle: 'पासवर्ड बदला गया', confirmPwBody: 'आपका पासवर्ड हाल ही में बदला गया। यदि यह आप नहीं थे, तो compliance@mrc-pay.com से संपर्क करें।', confirmWalletSubject: 'आपका वॉलेट अपडेट किया गया', confirmWalletTitle: 'वॉलेट अपडेट', confirmWalletBody: 'आपका वॉलेट हाल ही में अपडेट किया गया। यदि यह आप नहीं थे, तो compliance@mrc-pay.com से संपर्क करें।', footer: 'MRC GlobalPay कनाडा पंजीकृत MSB है।' },
  vi: { pwSubject: 'Hành Động Cần Thiết: Đặt Lại Mật Khẩu', pwTitle: 'Đặt Lại Mật Khẩu', pwBody: 'Bạn đã yêu cầu đặt lại mật khẩu. Nhấp nút bên dưới. Liên kết hết hạn sau 15 phút.', pwBtn: 'Đặt Lại Mật Khẩu', walletSubject: 'Hành Động Cần Thiết: Cập Nhật Ví', walletTitle: 'Cập Nhật Ví', walletBody: 'Bạn đã yêu cầu cập nhật ví. Nhấp nút bên dưới. Liên kết hết hạn sau 15 phút.', walletBtn: 'Cập Nhật Ví', confirmPwSubject: 'Mật Khẩu Đã Thay Đổi', confirmPwTitle: 'Mật Khẩu Đã Đổi', confirmPwBody: 'Mật khẩu của bạn đã được thay đổi. Nếu không phải bạn, liên hệ compliance@mrc-pay.com.', confirmWalletSubject: 'Ví Đã Được Cập Nhật', confirmWalletTitle: 'Ví Đã Cập Nhật', confirmWalletBody: 'Ví của bạn đã được cập nhật. Nếu không phải bạn, liên hệ compliance@mrc-pay.com.', footer: 'MRC GlobalPay là MSB đã đăng ký tại Canada.' },
  af: { pwSubject: 'Aksie Vereis: Stel jou Wagwoord Terug', pwTitle: 'Wagwoord Terugstel', pwBody: 'Jy het versoek om jou wagwoord terug te stel. Klik hieronder. Skakel verval in 15 minute.', pwBtn: 'Stel Terug', walletSubject: 'Aksie Vereis: Dateer jou Beursie op', walletTitle: 'Beursie Opdatering', walletBody: 'Jy het versoek om jou beursie op te dateer. Klik hieronder. Skakel verval in 15 minute.', walletBtn: 'Dateer Op', confirmPwSubject: 'Jou Wagwoord is Verander', confirmPwTitle: 'Wagwoord Verander', confirmPwBody: 'Jou wagwoord is onlangs verander. As dit nie jy was nie, kontak compliance@mrc-pay.com.', confirmWalletSubject: 'Jou Beursie is Opgedateer', confirmWalletTitle: 'Beursie Opgedateer', confirmWalletBody: 'Jou beursie is onlangs opgedateer. As dit nie jy was nie, kontak compliance@mrc-pay.com.', footer: 'MRC GlobalPay is \'n Kanada-geregistreerde MSB.' },
  fa: { pwSubject: 'اقدام لازم: رمز عبور خود را بازنشانی کنید', pwTitle: 'بازنشانی رمز عبور', pwBody: 'شما درخواست بازنشانی رمز عبور داده‌اید. روی دکمه زیر کلیک کنید. ۱۵ دقیقه اعتبار دارد.', pwBtn: 'بازنشانی رمز عبور', walletSubject: 'اقدام لازم: کیف پول خود را بروزرسانی کنید', walletTitle: 'بروزرسانی کیف پول', walletBody: 'شما درخواست بروزرسانی کیف پول داده‌اید. روی دکمه زیر کلیک کنید. ۱۵ دقیقه اعتبار دارد.', walletBtn: 'بروزرسانی کیف پول', confirmPwSubject: 'رمز عبور شما تغییر کرد', confirmPwTitle: 'رمز عبور تغییر کرد', confirmPwBody: 'رمز عبور شما اخیراً تغییر کرده است. اگر شما نبودید، با compliance@mrc-pay.com تماس بگیرید.', confirmWalletSubject: 'کیف پول شما بروزرسانی شد', confirmWalletTitle: 'کیف پول بروزرسانی شد', confirmWalletBody: 'کیف پول شما اخیراً بروزرسانی شده است. اگر شما نبودید، با compliance@mrc-pay.com تماس بگیرید.', footer: 'MRC GlobalPay یک MSB ثبت شده کانادا است.' },
  ur: { pwSubject: 'عمل درکار: اپنا پاس ورڈ ری سیٹ کریں', pwTitle: 'پاس ورڈ ری سیٹ', pwBody: 'آپ نے پاس ورڈ ری سیٹ کی درخواست کی ہے۔ نیچے بٹن پر کلک کریں۔ 15 منٹ میں لنک ختم ہو جائے گا۔', pwBtn: 'پاس ورڈ ری سیٹ', walletSubject: 'عمل درکار: اپنا والٹ اپ ڈیٹ کریں', walletTitle: 'والٹ اپ ڈیٹ', walletBody: 'آپ نے والٹ اپ ڈیٹ کی درخواست کی ہے۔ نیچے بٹن پر کلک کریں۔ 15 منٹ میں لنک ختم ہو جائے گا۔', walletBtn: 'والٹ اپ ڈیٹ', confirmPwSubject: 'آپ کا پاس ورڈ تبدیل ہو گیا', confirmPwTitle: 'پاس ورڈ تبدیل', confirmPwBody: 'آپ کا پاس ورڈ حال ہی میں تبدیل کیا گیا۔ اگر یہ آپ نہیں تھے تو compliance@mrc-pay.com سے رابطہ کریں۔', confirmWalletSubject: 'آپ کا والٹ اپ ڈیٹ ہو گیا', confirmWalletTitle: 'والٹ اپ ڈیٹ', confirmWalletBody: 'آپ کا والٹ حال ہی میں اپ ڈیٹ کیا گیا۔ اگر یہ آپ نہیں تھے تو compliance@mrc-pay.com سے رابطہ کریں۔', footer: 'MRC GlobalPay کینیڈا میں رجسٹرڈ MSB ہے۔' },
  he: { pwSubject: 'נדרשת פעולה: אפס את הסיסמה שלך', pwTitle: 'איפוס סיסמה', pwBody: 'ביקשת לאפס את הסיסמה. לחץ למטה. הקישור תקף 15 דקות.', pwBtn: 'אפס סיסמה', walletSubject: 'נדרשת פעולה: עדכן את כתובת הארנק', walletTitle: 'עדכון ארנק', walletBody: 'ביקשת לעדכן את כתובת הארנק. לחץ למטה. הקישור תקף 15 דקות.', walletBtn: 'עדכן ארנק', confirmPwSubject: 'הסיסמה שלך שונתה', confirmPwTitle: 'סיסמה שונתה', confirmPwBody: 'הסיסמה שלך שונתה לאחרונה. אם זה לא היית אתה, צור קשר עם compliance@mrc-pay.com.', confirmWalletSubject: 'הארנק שלך עודכן', confirmWalletTitle: 'ארנק עודכן', confirmWalletBody: 'כתובת הארנק שלך עודכנה לאחרונה. אם זה לא היית אתה, צור קשר עם compliance@mrc-pay.com.', footer: 'MRC GlobalPay הוא MSB רשום בקנדה.' },
  uk: { pwSubject: 'Потрібна дія: Скиньте ваш пароль', pwTitle: 'Скидання пароля', pwBody: 'Ви запросили скидання пароля. Натисніть нижче. Посилання діє 15 хвилин.', pwBtn: 'Скинути пароль', walletSubject: 'Потрібна дія: Оновіть ваш гаманець', walletTitle: 'Оновлення гаманця', walletBody: 'Ви запросили оновлення гаманця. Натисніть нижче. Посилання діє 15 хвилин.', walletBtn: 'Оновити гаманець', confirmPwSubject: 'Ваш пароль змінено', confirmPwTitle: 'Пароль змінено', confirmPwBody: 'Ваш пароль було нещодавно змінено. Якщо це були не ви, зв\'яжіться з compliance@mrc-pay.com.', confirmWalletSubject: 'Ваш гаманець оновлено', confirmWalletTitle: 'Гаманець оновлено', confirmWalletBody: 'Ваш гаманець було нещодавно оновлено. Якщо це були не ви, зв\'яжіться з compliance@mrc-pay.com.', footer: 'MRC GlobalPay — зареєстрований канадський MSB.' },
}

function getLang(lang?: string) {
  const k = (lang || 'en').toLowerCase().slice(0, 2)
  return LANG[k] || LANG.en
}

const RTL = ['fa', 'ur', 'he']

function renderEmail(opts: { title: string; body: string; btnText: string; btnUrl: string; footer: string; lang: string }): string {
  const dir = RTL.includes(opts.lang.slice(0, 2)) ? 'rtl' : 'ltr'
  return `<!DOCTYPE html>
<html lang="${opts.lang.slice(0,2)}" dir="${dir}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="580" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">
<tr><td style="padding:32px 32px 24px;text-align:center;border-bottom:1px solid #334155;">
  <div style="font-size:24px;font-weight:700;color:#38bdf8;">MRC GlobalPay</div>
</td></tr>
<tr><td style="padding:28px 32px 8px;text-align:center;">
  <div style="font-size:22px;font-weight:700;color:#f1f5f9;">🔒 ${opts.title}</div>
</td></tr>
<tr><td style="padding:16px 32px;">
  <div style="font-size:15px;color:#94a3b8;line-height:1.7;text-align:center;">${opts.body}</div>
</td></tr>
${opts.btnUrl ? `<tr><td style="padding:24px 32px;text-align:center;">
  <a href="${opts.btnUrl}" style="display:inline-block;background:linear-gradient(135deg,#0ea5e9,#38bdf8);color:#0f172a;font-size:15px;font-weight:700;padding:14px 36px;border-radius:10px;text-decoration:none;">${opts.btnText}</a>
</td></tr>
<tr><td style="padding:0 32px 8px;text-align:center;">
  <div style="font-size:11px;color:#64748b;">⏱ 15 min</div>
</td></tr>` : ''}
<tr><td style="padding:20px 32px 32px;text-align:center;border-top:1px solid #334155;">
  <div style="font-size:11px;color:#64748b;line-height:1.6;">${opts.footer}</div>
  <div style="font-size:10px;color:#475569;margin-top:8px;">© ${new Date().getFullYear()} MRC GlobalPay</div>
</td></tr>
</table></td></tr></table></body></html>`
}

function renderConfirmation(opts: { title: string; body: string; footer: string; lang: string }): string {
  const dir = RTL.includes(opts.lang.slice(0, 2)) ? 'rtl' : 'ltr'
  return `<!DOCTYPE html>
<html lang="${opts.lang.slice(0,2)}" dir="${dir}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="580" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155;">
<tr><td style="padding:32px 32px 24px;text-align:center;border-bottom:1px solid #334155;">
  <div style="font-size:24px;font-weight:700;color:#38bdf8;">MRC GlobalPay</div>
</td></tr>
<tr><td style="padding:28px 32px 8px;text-align:center;">
  <div style="font-size:22px;font-weight:700;color:#f1f5f9;">✅ ${opts.title}</div>
</td></tr>
<tr><td style="padding:16px 32px 24px;">
  <div style="font-size:15px;color:#94a3b8;line-height:1.7;text-align:center;">${opts.body}</div>
</td></tr>
<tr><td style="padding:20px 32px 32px;text-align:center;border-top:1px solid #334155;">
  <div style="font-size:11px;color:#64748b;line-height:1.6;">${opts.footer}</div>
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

    // ── GENERATE ──
    if (action === 'generate') {
      const purpose = body.purpose // 'password' | 'wallet'
      if (!purpose || !['password', 'wallet'].includes(purpose)) {
        return new Response(JSON.stringify({ error: 'purpose must be password or wallet' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const authHeader = req.headers.get('Authorization')
      if (!authHeader) throw new Error('Unauthorized')
      const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
      if (authErr || !user) throw new Error('Unauthorized')

      const { data: profile } = await supabase
        .from('partner_profiles').select('id').eq('user_id', user.id).maybeSingle()
      if (!profile) throw new Error('No partner profile found')

      const token = crypto.randomUUID() + '-' + crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

      await supabase.from('partner_update_tokens').insert({
        user_id: user.id, token, expires_at: expiresAt,
        purpose,
      })

      const lang = body.lang || 'en'
      const l = getLang(lang)
      const link = `https://mrcglobalpay.com/verify-update?token=${token}`

      const subject = purpose === 'password' ? l.pwSubject : l.walletSubject
      const html = renderEmail({
        title: purpose === 'password' ? l.pwTitle : l.walletTitle,
        body: purpose === 'password' ? l.pwBody : l.walletBody,
        btnText: purpose === 'password' ? l.pwBtn : l.walletBtn,
        btnUrl: link,
        footer: l.footer,
        lang,
      })

      await sendSmtp(user.email!, subject, html)

      await supabase.from('email_send_log').insert({
        message_id: crypto.randomUUID(),
        template_name: `smtp-${purpose}-update-link`,
        recipient_email: user.email!,
        status: 'sent',
      })

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ── VALIDATE ──
    if (action === 'validate') {
      const { token } = body
      if (!token) throw new Error('Token required')

      const { data: row } = await supabase
        .from('partner_update_tokens').select('*').eq('token', token).maybeSingle()

      if (!row) return json({ valid: false, reason: 'invalid' })
      if (row.used_at) return json({ valid: false, reason: 'used' })
      if (new Date(row.expires_at) < new Date()) return json({ valid: false, reason: 'expired' })

      return json({ valid: true, purpose: row.purpose, userId: row.user_id })
    }

    // ── APPLY ──
    if (action === 'apply') {
      const { token, purpose, newPassword, newWallet, lang } = body
      if (!token || !purpose) throw new Error('Token and purpose required')

      const { data: row } = await supabase
        .from('partner_update_tokens').select('*').eq('token', token).maybeSingle()

      if (!row || row.used_at || new Date(row.expires_at) < new Date() || row.purpose !== purpose) {
        return new Response(JSON.stringify({ success: false, reason: 'invalid_or_expired' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (purpose === 'password') {
        if (!newPassword || newPassword.length < 8) {
          return new Response(JSON.stringify({ success: false, reason: 'password_too_short' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
        const { error: pwErr } = await supabase.auth.admin.updateUserById(row.user_id, { password: newPassword })
        if (pwErr) throw new Error(`Password update failed: ${pwErr.message}`)
      }

      if (purpose === 'wallet') {
        if (!newWallet || !isValidBtcAddress(newWallet)) {
          return new Response(JSON.stringify({ success: false, reason: 'invalid_wallet' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          })
        }
        const { error: walletErr } = await supabase
          .from('partner_profiles').update({ btc_wallet: newWallet }).eq('user_id', row.user_id)
        if (walletErr) throw new Error(`Wallet update failed: ${walletErr.message}`)
      }

      // Mark token as used
      await supabase.from('partner_update_tokens').update({ used_at: new Date().toISOString() }).eq('id', row.id)

      // Send confirmation email
      const { data: { user } } = await supabase.auth.admin.getUserById(row.user_id)
      if (user?.email) {
        const l = getLang(lang || 'en')
        const subject = purpose === 'password' ? l.confirmPwSubject : l.confirmWalletSubject
        const html = renderConfirmation({
          title: purpose === 'password' ? l.confirmPwTitle : l.confirmWalletTitle,
          body: purpose === 'password' ? l.confirmPwBody : l.confirmWalletBody,
          footer: l.footer,
          lang: lang || 'en',
        })
        await sendSmtp(user.email, subject, html)
        await supabase.from('email_send_log').insert({
          message_id: crypto.randomUUID(),
          template_name: `smtp-${purpose}-update-confirmation`,
          recipient_email: user.email,
          status: 'sent',
        })
      }

      return json({ success: true })
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('partner-update-token error:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

function json(data: unknown) {
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
