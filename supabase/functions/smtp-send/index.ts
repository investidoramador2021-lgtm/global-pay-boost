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
    case 'risk-alert': {
      const user = Deno.env.get('COMPLIANCE_USER')
      const pass = Deno.env.get('COMPLIANCE_PASS')
      if (!user || !pass) throw new Error('COMPLIANCE_USER / COMPLIANCE_PASS not configured')
      return { user, pass, displayName: 'MRC GlobalPay Compliance' }
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
  en: { greeting: 'Hello', receiptTitle: 'Exchange Receipt', pairLabel: 'Exchange Pair', depositLabel: 'Deposit Address', recipientLabel: 'Recipient Address', trackBtn: 'Track Your Exchange', footer: 'MRC GlobalPay is a Registered Canadian MSB. Non-custodial service — we never hold your keys.', errorSubject: 'System Alert: Settlement Delay', verifySubject: 'Action Required: Verify Your MRC GlobalPay Account', verifyTitle: 'Confirm Your Email', verifyBody: 'For your security, you must confirm your email within 48 hours. If not verified by {deadline}, this account and all associated data will be permanently deleted for your protection.', verifyBtn: 'Confirm My Email', loanConfirmSubject: 'Loan Confirmation — MRC GlobalPay', loanConfirmTitle: 'Your Loan Has Been Created', loanConfirmBody: 'Your collateral has been received and your loan is now active. Please send the exact collateral amount to the address provided.', earnConfirmSubject: 'Earn Deposit Confirmation — MRC GlobalPay', earnConfirmTitle: 'Your Earn Position Has Been Created', earnConfirmBody: 'Your deposit request is active. Send the exact amount to the address below to start accruing daily interest.', riskAlertSubject: 'LTV Risk Alert — MRC GlobalPay', riskAlertTitle: 'Collateral Risk Alert', riskAlertYellow: 'Your loan LTV has entered the Yellow (Risk) zone. Please top up your collateral to avoid liquidation.', riskAlertRed: 'Your loan LTV has entered the Red (Liquidation) zone. Immediate action is required to prevent automatic liquidation.', collateralLabel: 'Collateral', ltvLabel: 'LTV Ratio', amountLabel: 'Loan Amount', assetLabel: 'Asset', apyLabel: 'APY', viewDashboard: 'View Dashboard', liabilityNote: 'Monitoring, security alerts, and liquidation execution are managed exclusively by our technology partner\'s automated risk engine.' },
  es: { greeting: 'Hola', receiptTitle: 'Recibo de Intercambio', pairLabel: 'Par de Intercambio', depositLabel: 'Dirección de Depósito', recipientLabel: 'Dirección del Destinatario', trackBtn: 'Seguir tu Intercambio', footer: 'MRC GlobalPay es una MSB registrada en Canadá. Servicio no custodial — nunca mantenemos tus claves.', errorSubject: 'Alerta del Sistema: Retraso de Liquidación', verifySubject: 'Acción Requerida: Verifique su cuenta MRC GlobalPay', verifyTitle: 'Confirme su Correo', verifyBody: 'Por su seguridad, debe confirmar su correo electrónico en 48 horas. Si no se verifica antes de {deadline}, esta cuenta será eliminada permanentemente.', verifyBtn: 'Confirmar mi Correo', loanConfirmSubject: 'Confirmación de Préstamo — MRC GlobalPay', loanConfirmTitle: 'Su Préstamo Ha Sido Creado', loanConfirmBody: 'Su colateral ha sido recibido y su préstamo está activo. Envíe la cantidad exacta de colateral a la dirección proporcionada.', earnConfirmSubject: 'Confirmación de Depósito Earn — MRC GlobalPay', earnConfirmTitle: 'Su Posición Earn Ha Sido Creada', earnConfirmBody: 'Su solicitud de depósito está activa. Envíe la cantidad exacta a la dirección a continuación para comenzar a acumular intereses diarios.', riskAlertSubject: 'Alerta de Riesgo LTV — MRC GlobalPay', riskAlertTitle: 'Alerta de Riesgo de Colateral', riskAlertYellow: 'El LTV de su préstamo ha entrado en la zona Amarilla (Riesgo). Por favor, aumente su colateral para evitar la liquidación.', riskAlertRed: 'El LTV de su préstamo ha entrado en la zona Roja (Liquidación). Se requiere acción inmediata para evitar la liquidación automática.', collateralLabel: 'Colateral', ltvLabel: 'Ratio LTV', amountLabel: 'Monto del Préstamo', assetLabel: 'Activo', apyLabel: 'APY', viewDashboard: 'Ver Panel', liabilityNote: 'El monitoreo, las alertas de seguridad y la ejecución de liquidaciones son gestionados exclusivamente por el motor de riesgo automatizado de nuestro socio tecnológico.' },
  pt: { greeting: 'Olá', receiptTitle: 'Recibo de Troca', pairLabel: 'Par de Troca', depositLabel: 'Endereço de Depósito', recipientLabel: 'Endereço do Destinatário', trackBtn: 'Rastrear sua Troca', footer: 'MRC GlobalPay é um MSB registrado no Canadá. Serviço não custodial — nunca guardamos suas chaves.', errorSubject: 'Alerta do Sistema: Atraso de Liquidação', verifySubject: 'Ação Necessária: Verifique sua conta MRC GlobalPay', verifyTitle: 'Confirme seu Email', verifyBody: 'Para sua segurança, confirme seu email em 48 horas. Se não verificado até {deadline}, esta conta será permanentemente excluída.', verifyBtn: 'Confirmar meu Email', loanConfirmSubject: 'Confirmação de Empréstimo — MRC GlobalPay', loanConfirmTitle: 'Seu Empréstimo Foi Criado', loanConfirmBody: 'Seu colateral foi recebido e seu empréstimo está ativo. Envie o valor exato do colateral para o endereço fornecido.', earnConfirmSubject: 'Confirmação de Depósito Earn — MRC GlobalPay', earnConfirmTitle: 'Sua Posição Earn Foi Criada', earnConfirmBody: 'Sua solicitação de depósito está ativa. Envie o valor exato para o endereço abaixo para começar a acumular juros diários.', riskAlertSubject: 'Alerta de Risco LTV — MRC GlobalPay', riskAlertTitle: 'Alerta de Risco de Colateral', riskAlertYellow: 'O LTV do seu empréstimo entrou na zona Amarela (Risco). Por favor, aumente seu colateral para evitar a liquidação.', riskAlertRed: 'O LTV do seu empréstimo entrou na zona Vermelha (Liquidação). Ação imediata é necessária para evitar a liquidação automática.', collateralLabel: 'Colateral', ltvLabel: 'Razão LTV', amountLabel: 'Valor do Empréstimo', assetLabel: 'Ativo', apyLabel: 'APY', viewDashboard: 'Ver Painel', liabilityNote: 'O monitoramento, alertas de segurança e execução de liquidações são gerenciados exclusivamente pelo motor de risco automatizado do nosso parceiro tecnológico.' },
  fr: { greeting: 'Bonjour', receiptTitle: 'Reçu d\'Échange', pairLabel: 'Paire d\'Échange', depositLabel: 'Adresse de Dépôt', recipientLabel: 'Adresse du Destinataire', trackBtn: 'Suivre votre Échange', footer: 'MRC GlobalPay est un MSB enregistré au Canada. Service non-dépositaire — nous ne détenons jamais vos clés.', errorSubject: 'Alerte Système: Délai de Règlement', verifySubject: 'Action Requise: Vérifiez votre compte MRC GlobalPay', verifyTitle: 'Confirmez votre Email', verifyBody: 'Pour votre sécurité, confirmez votre email sous 48 heures. S\'il n\'est pas vérifié avant {deadline}, ce compte sera définitivement supprimé.', verifyBtn: 'Confirmer mon Email', loanConfirmSubject: 'Confirmation de Prêt — MRC GlobalPay', loanConfirmTitle: 'Votre Prêt a Été Créé', loanConfirmBody: 'Votre collatéral a été reçu et votre prêt est maintenant actif. Veuillez envoyer le montant exact du collatéral à l\'adresse fournie.', earnConfirmSubject: 'Confirmation de Dépôt Earn — MRC GlobalPay', earnConfirmTitle: 'Votre Position Earn a Été Créée', earnConfirmBody: 'Votre demande de dépôt est active. Envoyez le montant exact à l\'adresse ci-dessous pour commencer à accumuler des intérêts quotidiens.', riskAlertSubject: 'Alerte de Risque LTV — MRC GlobalPay', riskAlertTitle: 'Alerte de Risque de Collatéral', riskAlertYellow: 'Le LTV de votre prêt est entré dans la zone Jaune (Risque). Veuillez augmenter votre collatéral pour éviter la liquidation.', riskAlertRed: 'Le LTV de votre prêt est entré dans la zone Rouge (Liquidation). Une action immédiate est nécessaire pour éviter la liquidation automatique.', collateralLabel: 'Collatéral', ltvLabel: 'Ratio LTV', amountLabel: 'Montant du Prêt', assetLabel: 'Actif', apyLabel: 'APY', viewDashboard: 'Voir le Tableau de Bord', liabilityNote: 'La surveillance, les alertes de sécurité et l\'exécution des liquidations sont gérées exclusivement par le moteur de risque automatisé de notre partenaire technologique.' },
  ja: { greeting: 'こんにちは', receiptTitle: '交換レシート', pairLabel: '交換ペア', depositLabel: '入金アドレス', recipientLabel: '受取アドレス', trackBtn: '交換を追跡', footer: 'MRC GlobalPayはカナダ登録MSBです。ノンカストディアルサービス — お客様の鍵を保持しません。', errorSubject: 'システムアラート: 決済遅延', verifySubject: '対応が必要：MRC GlobalPayアカウントを確認してください', verifyTitle: 'メールアドレスを確認', verifyBody: 'セキュリティのため、48時間以内にメールを確認してください。{deadline}までに確認されない場合、アカウントは永久に削除されます。', verifyBtn: 'メールを確認', loanConfirmSubject: 'ローン確認 — MRC GlobalPay', loanConfirmTitle: 'ローンが作成されました', loanConfirmBody: '担保が受領され、ローンが有効になりました。提供されたアドレスに正確な担保額を送信してください。', earnConfirmSubject: 'Earn入金確認 — MRC GlobalPay', earnConfirmTitle: 'Earnポジションが作成されました', earnConfirmBody: '入金リクエストが有効です。毎日の利息の蓄積を開始するには、以下のアドレスに正確な金額を送信してください。', riskAlertSubject: 'LTVリスクアラート — MRC GlobalPay', riskAlertTitle: '担保リスクアラート', riskAlertYellow: 'ローンのLTVがイエロー（リスク）ゾーンに入りました。清算を避けるため、担保を追加してください。', riskAlertRed: 'ローンのLTVがレッド（清算）ゾーンに入りました。自動清算を防ぐために即座の対応が必要です。', collateralLabel: '担保', ltvLabel: 'LTV比率', amountLabel: 'ローン額', assetLabel: '資産', apyLabel: 'APY', viewDashboard: 'ダッシュボードを見る', liabilityNote: '監視、セキュリティアラート、清算の実行は、当社のテクノロジーパートナーの自動リスクエンジンによって独占的に管理されています。' },
  tr: { greeting: 'Merhaba', receiptTitle: 'Değişim Makbuzu', pairLabel: 'Değişim Çifti', depositLabel: 'Depozit Adresi', recipientLabel: 'Alıcı Adresi', trackBtn: 'Değişiminizi Takip Edin', footer: 'MRC GlobalPay, Kanada kayıtlı bir MSB\'dir. Emanetçi olmayan hizmet — anahtarlarınızı asla tutmuyoruz.', errorSubject: 'Sistem Uyarısı: Uzlaşma Gecikmesi', verifySubject: 'İşlem Gerekli: MRC GlobalPay Hesabınızı Doğrulayın', verifyTitle: 'E-postanızı Onaylayın', verifyBody: 'Güvenliğiniz için e-postanızı 48 saat içinde onaylamanız gerekir. {deadline} tarihine kadar doğrulanmazsa bu hesap kalıcı olarak silinecektir.', verifyBtn: 'E-postamı Onayla', loanConfirmSubject: 'Kredi Onayı — MRC GlobalPay', loanConfirmTitle: 'Krediniz Oluşturuldu', loanConfirmBody: 'Teminatınız alındı ve krediniz aktif. Lütfen sağlanan adrese tam teminat miktarını gönderin.', earnConfirmSubject: 'Earn Yatırım Onayı — MRC GlobalPay', earnConfirmTitle: 'Earn Pozisyonunuz Oluşturuldu', earnConfirmBody: 'Yatırım talebiniz aktif. Günlük faiz biriktirmeye başlamak için aşağıdaki adrese tam miktarı gönderin.', riskAlertSubject: 'LTV Risk Uyarısı — MRC GlobalPay', riskAlertTitle: 'Teminat Risk Uyarısı', riskAlertYellow: 'Kredinizin LTV\'si Sarı (Risk) bölgesine girdi. Tasfiyeden kaçınmak için teminatınızı artırın.', riskAlertRed: 'Kredinizin LTV\'si Kırmızı (Tasfiye) bölgesine girdi. Otomatik tasfiyeyi önlemek için acil müdahale gerekli.', collateralLabel: 'Teminat', ltvLabel: 'LTV Oranı', amountLabel: 'Kredi Miktarı', assetLabel: 'Varlık', apyLabel: 'APY', viewDashboard: 'Paneli Görüntüle', liabilityNote: 'İzleme, güvenlik uyarıları ve tasfiye işlemleri, teknoloji ortağımızın otomatik risk motoru tarafından münhasıran yönetilmektedir.' },
  hi: { greeting: 'नमस्ते', receiptTitle: 'एक्सचेंज रसीद', pairLabel: 'एक्सचेंज जोड़ी', depositLabel: 'जमा पता', recipientLabel: 'प्राप्तकर्ता पता', trackBtn: 'अपना एक्सचेंज ट्रैक करें', footer: 'MRC GlobalPay एक कनाडा पंजीकृत MSB है। नॉन-कस्टोडियल सेवा — हम कभी आपकी कुंजी नहीं रखते।', errorSubject: 'सिस्टम चेतावनी: निपटान विलंब', verifySubject: 'कार्रवाई आवश्यक: अपना MRC GlobalPay खाता सत्यापित करें', verifyTitle: 'अपना ईमेल पुष्टि करें', verifyBody: 'आपकी सुरक्षा के लिए, 48 घंटों के भीतर अपना ईमेल पुष्टि करें। {deadline} तक सत्यापित नहीं होने पर यह खाता स्थायी रूप से हटा दिया जाएगा।', verifyBtn: 'ईमेल पुष्टि करें', loanConfirmSubject: 'ऋण पुष्टिकरण — MRC GlobalPay', loanConfirmTitle: 'आपका ऋण बनाया गया है', loanConfirmBody: 'आपका कोलैटरल प्राप्त हो गया है और आपका ऋण सक्रिय है। कृपया दिए गए पते पर सटीक कोलैटरल राशि भेजें।', earnConfirmSubject: 'Earn जमा पुष्टिकरण — MRC GlobalPay', earnConfirmTitle: 'आपकी Earn पोज़ीशन बनाई गई है', earnConfirmBody: 'आपका जमा अनुरोध सक्रिय है। दैनिक ब्याज अर्जित करना शुरू करने के लिए नीचे दिए गए पते पर सटीक राशि भेजें।', riskAlertSubject: 'LTV जोखिम चेतावनी — MRC GlobalPay', riskAlertTitle: 'कोलैटरल जोखिम चेतावनी', riskAlertYellow: 'आपके ऋण का LTV पीले (जोखिम) क्षेत्र में प्रवेश कर गया है। परिसमापन से बचने के लिए कृपया अपना कोलैटरल बढ़ाएं।', riskAlertRed: 'आपके ऋण का LTV लाल (परिसमापन) क्षेत्र में प्रवेश कर गया है। स्वचालित परिसमापन को रोकने के लिए तत्काल कार्रवाई आवश्यक है।', collateralLabel: 'कोलैटरल', ltvLabel: 'LTV अनुपात', amountLabel: 'ऋण राशि', assetLabel: 'संपत्ति', apyLabel: 'APY', viewDashboard: 'डैशबोर्ड देखें', liabilityNote: 'निगरानी, सुरक्षा चेतावनी और परिसमापन निष्पादन विशेष रूप से हमारे प्रौद्योगिकी भागीदार के स्वचालित जोखिम इंजन द्वारा प्रबंधित किए जाते हैं।' },
  vi: { greeting: 'Xin chào', receiptTitle: 'Biên Lai Giao Dịch', pairLabel: 'Cặp Giao Dịch', depositLabel: 'Địa Chỉ Nạp', recipientLabel: 'Địa Chỉ Nhận', trackBtn: 'Theo Dõi Giao Dịch', footer: 'MRC GlobalPay là MSB đã đăng ký tại Canada. Dịch vụ phi lưu ký — chúng tôi không bao giờ giữ chìa khóa của bạn.', errorSubject: 'Cảnh Báo Hệ Thống: Trì Hoãn Thanh Toán', verifySubject: 'Hành Động Cần Thiết: Xác Minh Tài Khoản MRC GlobalPay', verifyTitle: 'Xác Nhận Email', verifyBody: 'Vì bảo mật, bạn phải xác nhận email trong 48 giờ. Nếu không xác minh trước {deadline}, tài khoản sẽ bị xóa vĩnh viễn.', verifyBtn: 'Xác Nhận Email', loanConfirmSubject: 'Xác Nhận Khoản Vay — MRC GlobalPay', loanConfirmTitle: 'Khoản Vay Của Bạn Đã Được Tạo', loanConfirmBody: 'Tài sản thế chấp đã được nhận và khoản vay đang hoạt động. Vui lòng gửi chính xác số tiền thế chấp đến địa chỉ được cung cấp.', earnConfirmSubject: 'Xác Nhận Nạp Earn — MRC GlobalPay', earnConfirmTitle: 'Vị Thế Earn Đã Được Tạo', earnConfirmBody: 'Yêu cầu nạp tiền đang hoạt động. Gửi số tiền chính xác đến địa chỉ bên dưới để bắt đầu tích lũy lãi suất hàng ngày.', riskAlertSubject: 'Cảnh Báo Rủi Ro LTV — MRC GlobalPay', riskAlertTitle: 'Cảnh Báo Rủi Ro Tài Sản Thế Chấp', riskAlertYellow: 'LTV khoản vay đã vào vùng Vàng (Rủi ro). Vui lòng tăng tài sản thế chấp để tránh thanh lý.', riskAlertRed: 'LTV khoản vay đã vào vùng Đỏ (Thanh lý). Cần hành động ngay lập tức để ngăn chặn thanh lý tự động.', collateralLabel: 'Thế Chấp', ltvLabel: 'Tỷ Lệ LTV', amountLabel: 'Số Tiền Vay', assetLabel: 'Tài Sản', apyLabel: 'APY', viewDashboard: 'Xem Bảng Điều Khiển', liabilityNote: 'Giám sát, cảnh báo bảo mật và thực hiện thanh lý được quản lý độc quyền bởi công cụ rủi ro tự động của đối tác công nghệ của chúng tôi.' },
  af: { greeting: 'Hallo', receiptTitle: 'Ruil Kwitansie', pairLabel: 'Ruil Paar', depositLabel: 'Deposito Adres', recipientLabel: 'Ontvanger Adres', trackBtn: 'Volg Jou Ruil', footer: 'MRC GlobalPay is \'n Kanada-geregistreerde MSB. Nie-bewarende diens — ons hou nooit jou sleutels nie.', errorSubject: 'Stelsel Waarskuwing: Vestigingsvertraging', verifySubject: 'Aksie Vereis: Bevestig jou MRC GlobalPay Rekening', verifyTitle: 'Bevestig Jou E-pos', verifyBody: 'Vir jou sekuriteit, bevestig jou e-pos binne 48 uur. As dit nie teen {deadline} geverifieer word nie, sal hierdie rekening permanent uitgevee word.', verifyBtn: 'Bevestig E-pos', loanConfirmSubject: 'Lening Bevestiging — MRC GlobalPay', loanConfirmTitle: 'Jou Lening Is Geskep', loanConfirmBody: 'Jou onderpand is ontvang en jou lening is aktief. Stuur asseblief die presiese onderpandbedrag na die verskafde adres.', earnConfirmSubject: 'Earn Deposito Bevestiging — MRC GlobalPay', earnConfirmTitle: 'Jou Earn Posisie Is Geskep', earnConfirmBody: 'Jou depositoversoek is aktief. Stuur die presiese bedrag na die adres hieronder om daagliks rente te begin verdien.', riskAlertSubject: 'LTV Risiko Waarskuwing — MRC GlobalPay', riskAlertTitle: 'Onderpand Risiko Waarskuwing', riskAlertYellow: 'Jou lening se LTV het die Geel (Risiko) sone betree. Verhoog asseblief jou onderpand om likwidasie te vermy.', riskAlertRed: 'Jou lening se LTV het die Rooi (Likwidasie) sone betree. Onmiddellike aksie is nodig om outomatiese likwidasie te voorkom.', collateralLabel: 'Onderpand', ltvLabel: 'LTV Verhouding', amountLabel: 'Leningbedrag', assetLabel: 'Bate', apyLabel: 'APY', viewDashboard: 'Bekyk Dashboard', liabilityNote: 'Monitering, sekuriteitswaarskuwings en likwidasie-uitvoering word uitsluitlik bestuur deur ons tegnologiavennoot se outomatiese risiko-enjin.' },
  fa: { greeting: 'سلام', receiptTitle: 'رسید مبادله', pairLabel: 'جفت مبادله', depositLabel: 'آدرس واریز', recipientLabel: 'آدرس گیرنده', trackBtn: 'پیگیری مبادله', footer: 'MRC GlobalPay یک MSB ثبت شده کانادا است. خدمات غیرامانی — ما هرگز کلیدهای شما را نگه نمی‌داریم.', errorSubject: 'هشدار سیستم: تأخیر تسویه', verifySubject: 'اقدام لازم: حساب MRC GlobalPay خود را تأیید کنید', verifyTitle: 'ایمیل خود را تأیید کنید', verifyBody: 'برای امنیت شما، ایمیل خود را ظرف ۴۸ ساعت تأیید کنید. اگر تا {deadline} تأیید نشود، این حساب برای همیشه حذف خواهد شد.', verifyBtn: 'تأیید ایمیل', loanConfirmSubject: 'تأیید وام — MRC GlobalPay', loanConfirmTitle: 'وام شما ایجاد شد', loanConfirmBody: 'وثیقه شما دریافت شد و وام شما فعال است. لطفاً مقدار دقیق وثیقه را به آدرس ارائه شده ارسال کنید.', earnConfirmSubject: 'تأیید سپرده Earn — MRC GlobalPay', earnConfirmTitle: 'موقعیت Earn شما ایجاد شد', earnConfirmBody: 'درخواست سپرده شما فعال است. مبلغ دقیق را به آدرس زیر ارسال کنید تا سود روزانه خود را شروع کنید.', riskAlertSubject: 'هشدار ریسک LTV — MRC GlobalPay', riskAlertTitle: 'هشدار ریسک وثیقه', riskAlertYellow: 'LTV وام شما وارد منطقه زرد (ریسک) شده است. لطفاً وثیقه خود را افزایش دهید تا از تسویه جلوگیری شود.', riskAlertRed: 'LTV وام شما وارد منطقه قرمز (تسویه) شده است. اقدام فوری برای جلوگیری از تسویه خودکار لازم است.', collateralLabel: 'وثیقه', ltvLabel: 'نسبت LTV', amountLabel: 'مبلغ وام', assetLabel: 'دارایی', apyLabel: 'APY', viewDashboard: 'مشاهده داشبورد', liabilityNote: 'نظارت، هشدارهای امنیتی و اجرای تسویه به طور انحصاری توسط موتور ریسک خودکار شریک فناوری ما مدیریت می‌شود.' },
  ur: { greeting: 'السلام علیکم', receiptTitle: 'تبادلہ رسید', pairLabel: 'تبادلہ جوڑا', depositLabel: 'جمع ایڈریس', recipientLabel: 'وصول کنندہ ایڈریس', trackBtn: 'اپنا تبادلہ ٹریک کریں', footer: 'MRC GlobalPay کینیڈا میں رجسٹرڈ MSB ہے۔ نان-کسٹوڈیل سروس — ہم کبھی آپ کی چابیاں نہیں رکھتے۔', errorSubject: 'سسٹم الرٹ: تصفیہ تاخیر', verifySubject: 'عمل درکار: اپنا MRC GlobalPay اکاؤنٹ تصدیق کریں', verifyTitle: 'ای میل کی تصدیق کریں', verifyBody: 'آپ کی سیکورٹی کے لیے، 48 گھنٹے میں ای میل کی تصدیق کریں۔ اگر {deadline} تک تصدیق نہیں ہوئی تو یہ اکاؤنٹ مستقل طور پر حذف ہو جائے گا۔', verifyBtn: 'ای میل تصدیق', loanConfirmSubject: 'قرض کی تصدیق — MRC GlobalPay', loanConfirmTitle: 'آپ کا قرض بنایا گیا', loanConfirmBody: 'آپ کی ضمانت موصول ہو گئی ہے اور آپ کا قرض فعال ہے۔ براہ کرم فراہم کردہ ایڈریس پر عین ضمانت کی رقم بھیجیں۔', earnConfirmSubject: 'Earn جمع تصدیق — MRC GlobalPay', earnConfirmTitle: 'آپ کی Earn پوزیشن بنائی گئی', earnConfirmBody: 'آپ کی جمع درخواست فعال ہے۔ روزانہ منافع حاصل کرنا شروع کرنے کے لیے نیچے دیے گئے ایڈریس پر عین رقم بھیجیں۔', riskAlertSubject: 'LTV خطرے کی وارننگ — MRC GlobalPay', riskAlertTitle: 'ضمانت خطرے کی وارننگ', riskAlertYellow: 'آپ کے قرض کا LTV پیلے (خطرہ) زون میں داخل ہو گیا ہے۔ لیکویڈیشن سے بچنے کے لیے اپنی ضمانت بڑھائیں۔', riskAlertRed: 'آپ کے قرض کا LTV سرخ (لیکویڈیشن) زون میں داخل ہو گیا ہے۔ خودکار لیکویڈیشن روکنے کے لیے فوری کارروائی ضروری ہے۔', collateralLabel: 'ضمانت', ltvLabel: 'LTV تناسب', amountLabel: 'قرض کی رقم', assetLabel: 'اثاثہ', apyLabel: 'APY', viewDashboard: 'ڈیش بورڈ دیکھیں', liabilityNote: 'نگرانی، سیکورٹی الرٹس اور لیکویڈیشن کا نفاذ خصوصی طور پر ہمارے ٹیکنالوجی پارٹنر کے خودکار رسک انجن کے ذریعے منظم ہوتا ہے۔' },
  he: { greeting: 'שלום', receiptTitle: 'קבלת המרה', pairLabel: 'זוג המרה', depositLabel: 'כתובת הפקדה', recipientLabel: 'כתובת מקבל', trackBtn: 'עקוב אחרי ההמרה שלך', footer: 'MRC GlobalPay הוא MSB רשום בקנדה. שירות ללא משמורת — אנחנו אף פעם לא מחזיקים במפתחות שלך.', errorSubject: 'התראת מערכת: עיכוב סליקה', verifySubject: 'נדרשת פעולה: אמת את חשבון MRC GlobalPay שלך', verifyTitle: 'אשר את האימייל שלך', verifyBody: 'לביטחונך, אשר את האימייל שלך תוך 48 שעות. אם לא יאומת עד {deadline}, החשבון יימחק לצמיתות.', verifyBtn: 'אשר אימייל', loanConfirmSubject: 'אישור הלוואה — MRC GlobalPay', loanConfirmTitle: 'ההלוואה שלך נוצרה', loanConfirmBody: 'הבטוחה שלך התקבלה וההלוואה פעילה. אנא שלח את סכום הבטוחה המדויק לכתובת שסופקה.', earnConfirmSubject: 'אישור הפקדת Earn — MRC GlobalPay', earnConfirmTitle: 'פוזיציית ה-Earn שלך נוצרה', earnConfirmBody: 'בקשת ההפקדה שלך פעילה. שלח את הסכום המדויק לכתובת למטה כדי להתחיל לצבור ריבית יומית.', riskAlertSubject: 'התראת סיכון LTV — MRC GlobalPay', riskAlertTitle: 'התראת סיכון בטוחה', riskAlertYellow: 'ה-LTV של ההלוואה שלך נכנס לאזור הצהוב (סיכון). אנא הגדל את הבטוחה כדי למנוע חיסול.', riskAlertRed: 'ה-LTV של ההלוואה שלך נכנס לאזור האדום (חיסול). נדרשת פעולה מיידית למניעת חיסול אוטומטי.', collateralLabel: 'בטוחה', ltvLabel: 'יחס LTV', amountLabel: 'סכום הלוואה', assetLabel: 'נכס', apyLabel: 'APY', viewDashboard: 'צפה בלוח בקרה', liabilityNote: 'ניטור, התראות אבטחה וביצוע חיסולים מנוהלים באופן בלעדי על ידי מנוע הסיכונים האוטומטי של שותף הטכנולוגיה שלנו.' },
  uk: { greeting: 'Привіт', receiptTitle: 'Квитанція Обміну', pairLabel: 'Пара Обміну', depositLabel: 'Адреса Депозиту', recipientLabel: 'Адреса Отримувача', trackBtn: 'Відстежити Ваш Обмін', footer: 'MRC GlobalPay — зареєстрований канадський MSB. Некастодіальний сервіс — ми ніколи не зберігаємо ваші ключі.', errorSubject: 'Системне сповіщення: затримка розрахунків', verifySubject: 'Потрібна дія: Підтвердіть ваш обліковий запис MRC GlobalPay', verifyTitle: 'Підтвердіть вашу електронну пошту', verifyBody: 'Для вашої безпеки підтвердіть email протягом 48 годин. Якщо не підтверджено до {deadline}, обліковий запис буде остаточно видалено.', verifyBtn: 'Підтвердити email', loanConfirmSubject: 'Підтвердження Позики — MRC GlobalPay', loanConfirmTitle: 'Вашу Позику Створено', loanConfirmBody: 'Вашу заставу отримано та позика активна. Будь ласка, надішліть точну суму застави на надану адресу.', earnConfirmSubject: 'Підтвердження Депозиту Earn — MRC GlobalPay', earnConfirmTitle: 'Вашу Earn Позицію Створено', earnConfirmBody: 'Ваш запит на депозит активний. Надішліть точну суму на адресу нижче, щоб почати накопичувати щоденні відсотки.', riskAlertSubject: 'Попередження про Ризик LTV — MRC GlobalPay', riskAlertTitle: 'Попередження про Ризик Застави', riskAlertYellow: 'LTV вашої позики увійшов у Жовту (Ризик) зону. Будь ласка, збільшіть заставу, щоб уникнути ліквідації.', riskAlertRed: 'LTV вашої позики увійшов у Червону (Ліквідація) зону. Необхідні негайні дії для запобігання автоматичній ліквідації.', collateralLabel: 'Застава', ltvLabel: 'Коефіцієнт LTV', amountLabel: 'Сума Позики', assetLabel: 'Актив', apyLabel: 'APY', viewDashboard: 'Переглянути Панель', liabilityNote: 'Моніторинг, сповіщення безпеки та виконання ліквідацій управляються виключно автоматизованим движком ризиків нашого технологічного партнера.' },
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

// ── Loan Confirmation Template ──
function renderLoanConfirmation(data: {
  collateralAmount: string; collateralCurrency: string; loanAmount: string;
  ltvPercent: string; sendAddress: string; txId: string; lang?: string;
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
<tr><td style="padding:32px 32px 24px;text-align:center;border-bottom:1px solid #334155;">
  <div style="font-size:24px;font-weight:700;color:#D4AF37;letter-spacing:-0.3px;">MRC GlobalPay</div>
</td></tr>
<tr><td style="padding:28px 32px 8px;text-align:center;">
  <div style="font-size:22px;font-weight:700;color:#f1f5f9;">🔒 ${l.loanConfirmTitle}</div>
</td></tr>
<tr><td style="padding:16px 32px;">
  <div style="font-size:15px;color:#94a3b8;line-height:1.7;text-align:center;">${l.loanConfirmBody}</div>
</td></tr>
<tr><td style="padding:8px 32px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:10px;border:1px solid #334155;">
  <tr><td style="padding:16px 20px;">
    <div style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px;">${l.collateralLabel}</div>
    <div style="font-size:18px;font-weight:700;color:#D4AF37;">${data.collateralAmount} ${(data.collateralCurrency || '').toUpperCase()}</div>
  </td></tr>
  </table>
</td></tr>
<tr><td style="padding:8px 32px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:10px;border:1px solid #334155;">
  <tr><td style="padding:16px 20px;">
    <div style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px;">${l.amountLabel} / ${l.ltvLabel}</div>
    <div style="font-size:18px;font-weight:700;color:#f1f5f9;">${data.loanAmount} USDT <span style="color:#D4AF37;">@ ${data.ltvPercent}% LTV</span></div>
  </td></tr>
  </table>
</td></tr>
<tr><td style="padding:8px 32px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:10px;border:1px solid #334155;">
  <tr><td style="padding:16px 20px;">
    <div style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px;">${l.depositLabel}</div>
    <div style="font-size:13px;font-weight:500;color:#94a3b8;font-family:'Roboto Mono',monospace;word-break:break-all;">${maskAddress(data.sendAddress)}</div>
  </td></tr>
  </table>
</td></tr>
<tr><td style="padding:8px 32px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:10px;border:1px solid #334155;">
  <tr><td style="padding:16px 20px;">
    <div style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;">Transaction ID</div>
    <div style="font-size:14px;font-weight:600;color:#D4AF37;font-family:'Roboto Mono',monospace;margin-top:4px;">${maskTxHash(data.txId)}</div>
  </td></tr>
  </table>
</td></tr>
<tr><td style="padding:24px 32px;text-align:center;">
  <a href="https://mrcglobalpay.com/lend?tab=track" style="display:inline-block;background:linear-gradient(135deg,#D4AF37,#B8962E);color:#0f172a;font-size:15px;font-weight:700;padding:14px 36px;border-radius:10px;text-decoration:none;">${l.viewDashboard}</a>
</td></tr>
<tr><td style="padding:12px 32px;">
  <div style="font-size:10px;color:#64748b;line-height:1.6;text-align:center;font-style:italic;">${l.liabilityNote}</div>
</td></tr>
<tr><td style="padding:12px 32px 32px;text-align:center;border-top:1px solid #334155;">
  <div style="font-size:11px;color:#64748b;line-height:1.6;">${l.footer}</div>
  <div style="font-size:10px;color:#475569;margin-top:8px;">© ${new Date().getFullYear()} MRC GlobalPay. All rights reserved.</div>
</td></tr>
</table></td></tr></table></body></html>`
}

// ── Earn Confirmation Template ──
function renderEarnConfirmation(data: {
  depositAmount: string; depositCurrency: string; apy: string;
  sendAddress: string; txId: string; lang?: string;
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
<tr><td style="padding:32px 32px 24px;text-align:center;border-bottom:1px solid #334155;">
  <div style="font-size:24px;font-weight:700;color:#10b981;letter-spacing:-0.3px;">MRC GlobalPay</div>
</td></tr>
<tr><td style="padding:28px 32px 8px;text-align:center;">
  <div style="font-size:22px;font-weight:700;color:#f1f5f9;">📈 ${l.earnConfirmTitle}</div>
</td></tr>
<tr><td style="padding:16px 32px;">
  <div style="font-size:15px;color:#94a3b8;line-height:1.7;text-align:center;">${l.earnConfirmBody}</div>
</td></tr>
<tr><td style="padding:8px 32px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:10px;border:1px solid #334155;">
  <tr><td style="padding:16px 20px;">
    <div style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px;">${l.assetLabel} / ${l.apyLabel}</div>
    <div style="font-size:18px;font-weight:700;color:#10b981;">${data.depositAmount} ${(data.depositCurrency || '').toUpperCase()} <span style="color:#f1f5f9;">@ ${data.apy}% APY</span></div>
  </td></tr>
  </table>
</td></tr>
<tr><td style="padding:8px 32px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:10px;border:1px solid #334155;">
  <tr><td style="padding:16px 20px;">
    <div style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.8px;margin-bottom:6px;">${l.depositLabel}</div>
    <div style="font-size:13px;font-weight:500;color:#94a3b8;font-family:'Roboto Mono',monospace;word-break:break-all;">${maskAddress(data.sendAddress)}</div>
  </td></tr>
  </table>
</td></tr>
<tr><td style="padding:8px 32px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:10px;border:1px solid #334155;">
  <tr><td style="padding:16px 20px;">
    <div style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;">Transaction ID</div>
    <div style="font-size:14px;font-weight:600;color:#10b981;font-family:'Roboto Mono',monospace;margin-top:4px;">${maskTxHash(data.txId)}</div>
  </td></tr>
  </table>
</td></tr>
<tr><td style="padding:24px 32px;text-align:center;">
  <a href="https://mrcglobalpay.com/lend?tab=earn" style="display:inline-block;background:linear-gradient(135deg,#10b981,#059669);color:#0f172a;font-size:15px;font-weight:700;padding:14px 36px;border-radius:10px;text-decoration:none;">${l.viewDashboard}</a>
</td></tr>
<tr><td style="padding:12px 32px 32px;text-align:center;border-top:1px solid #334155;">
  <div style="font-size:11px;color:#64748b;line-height:1.6;">${l.footer}</div>
  <div style="font-size:10px;color:#475569;margin-top:8px;">© ${new Date().getFullYear()} MRC GlobalPay. All rights reserved.</div>
</td></tr>
</table></td></tr></table></body></html>`
}

// ── Risk Alert Template ──
function renderRiskAlert(data: {
  loanId: string; collateralCurrency: string; currentLtv: string;
  zone: 'yellow' | 'red'; lang?: string;
}): string {
  const l = getLang(data.lang)
  const dir = isRtl(data.lang || 'en') ? 'rtl' : 'ltr'
  const isRed = data.zone === 'red'
  const zoneColor = isRed ? '#ef4444' : '#eab308'
  const zoneLabel = isRed ? 'RED — LIQUIDATION' : 'YELLOW — RISK'
  const zoneMsg = isRed ? l.riskAlertRed : l.riskAlertYellow
  return `<!DOCTYPE html>
<html lang="${(data.lang || 'en').slice(0, 2)}" dir="${dir}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Inter','Helvetica Neue',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" width="580" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid ${zoneColor};">
<tr><td style="padding:32px;text-align:center;border-bottom:1px solid #334155;">
  <div style="font-size:24px;font-weight:700;color:${zoneColor};">⚠️ ${l.riskAlertTitle}</div>
</td></tr>
<tr><td style="padding:24px 32px;">
  <div style="background:${zoneColor}20;border:1px solid ${zoneColor};border-radius:10px;padding:16px;text-align:center;margin-bottom:16px;">
    <div style="font-size:13px;font-weight:700;color:${zoneColor};letter-spacing:1px;">${zoneLabel}</div>
    <div style="font-size:28px;font-weight:800;color:${zoneColor};margin-top:4px;">${data.currentLtv}% LTV</div>
  </div>
  <div style="font-size:15px;color:#94a3b8;line-height:1.7;">${zoneMsg}</div>
</td></tr>
<tr><td style="padding:8px 32px;">
  <table role="presentation" width="100%" style="background:#0f172a;border-radius:10px;border:1px solid #334155;">
  <tr><td style="padding:16px 20px;">
    <div style="font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;">Loan ID / ${l.collateralLabel}</div>
    <div style="font-size:14px;font-weight:600;color:#f1f5f9;font-family:'Roboto Mono',monospace;margin-top:4px;">${maskTxHash(data.loanId)} · ${(data.collateralCurrency || '').toUpperCase()}</div>
  </td></tr>
  </table>
</td></tr>
<tr><td style="padding:24px 32px;text-align:center;">
  <a href="https://mrcglobalpay.com/lend?tab=track" style="display:inline-block;background:${zoneColor};color:#0f172a;font-size:15px;font-weight:700;padding:14px 36px;border-radius:10px;text-decoration:none;">${l.viewDashboard}</a>
</td></tr>
<tr><td style="padding:12px 32px;">
  <div style="font-size:10px;color:#64748b;line-height:1.6;text-align:center;font-style:italic;">${l.liabilityNote}</div>
</td></tr>
<tr><td style="padding:12px 32px 32px;text-align:center;border-top:1px solid #334155;">
  <div style="font-size:11px;color:#64748b;line-height:1.6;">${l.footer}</div>
  <div style="font-size:10px;color:#475569;margin-top:8px;">© ${new Date().getFullYear()} MRC GlobalPay</div>
</td></tr>
</table></td></tr></table></body></html>`
}
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
      type, // 'receipt' | 'system-error' | 'verification' | 'loan-confirmation' | 'earn-confirmation' | 'risk-alert'
      recipientEmail,
      transactionId,
      fromAmount, fromCurrency, toCurrency,
      depositAddress, recipientAddress,
      message: errorMessage,
      lang,
      to, // alias for recipientEmail (used by verification)
      verificationToken,
      expiresAt,
      // Loan/Earn fields
      collateralAmount, collateralCurrency, loanAmount, ltvPercent,
      sendAddress, txId,
      // Earn fields
      depositAmount, depositCurrency, apy,
      // Risk alert fields
      loanId, currentLtv, zone,
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