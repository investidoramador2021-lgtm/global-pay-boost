/**
 * Per-route, per-language SEO content for prerender-static-routes plugin.
 *
 * Each route has English content + minimal localized title/description for the
 * other 12 languages so every URL has unique <title>, <meta description>,
 * canonical, hreflang, and noscript H1. Body content stays in English (already
 * indexed; localized hubs render the same content client-side via i18next).
 */
export type StaticRouteKey =
  | "/"
  | "/affiliates"
  | "/partners"
  | "/referral"
  | "/lend"
  | "/private-transfer"
  | "/permanent-bridge"
  | "/about"
  | "/compliance"
  | "/blog";

export interface RouteSeo {
  title: string;
  description: string;
  h1: string;
  bodyHtml: string;
  jsonLd?: Record<string, unknown>;
}

const SITE = "https://mrcglobalpay.com";

// Localized title prefixes/suffixes — keep brand "MRC GlobalPay" in English
const LOCALIZED_LABELS: Record<string, Record<StaticRouteKey, { t: string; d: string; h: string }>> = {
  en: {
    "/": { t: "MRC GlobalPay — Instant Crypto Swap, Registration-Free", d: "Swap 6,000+ cryptocurrencies in under 60 seconds from $0.30. Non-custodial, no account, Canadian MSB-registered (C100000015).", h: "Instant Crypto Swap — 6,000+ Assets, From $0.30" },
    "/affiliates": { t: "Affiliate Program — Earn BTC on Every Swap | MRC GlobalPay", d: "Join the MRC GlobalPay affiliate program. Earn Bitcoin commissions on every referred swap. Marketing materials, real-time dashboards, weekly payouts.", h: "Earn Bitcoin Commissions as an MRC Affiliate" },
    "/partners": { t: "Partner Program — White-Label Crypto Swap API | MRC GlobalPay", d: "Embed the MRC GlobalPay swap engine in your wallet, exchange, or app. White-label widget, REST API, webhook events, partner dashboard.", h: "MRC Partner Program — White-Label Swap Infrastructure" },
    "/referral": { t: "Referral Rewards — Get Paid in BTC | MRC GlobalPay", d: "Refer friends to MRC GlobalPay and earn Bitcoin on every swap they complete. Lifetime referral commissions, transparent reporting, instant withdrawals.", h: "Refer Friends, Earn Bitcoin Forever" },
    "/lend": { t: "Crypto Lending & Earn — Up to 14% APY | MRC GlobalPay", d: "Earn passive income on your crypto with MRC GlobalPay's lending portal. Up to 14% APY on stablecoins, instant withdrawals, source-back payout policy.", h: "Crypto Lending & Earn Portal — Up to 14% APY" },
    "/private-transfer": { t: "Private Crypto Transfer — Wallet-to-Wallet | MRC GlobalPay", d: "Send crypto privately wallet-to-wallet with MRC GlobalPay. No KYC, no account, end-to-end shielded. Supports Monero, Zcash and 6,000+ assets.", h: "Private Wallet-to-Wallet Crypto Transfer" },
    "/permanent-bridge": { t: "Permanent Crypto Bridge — Reusable Deposit Address | MRC GlobalPay", d: "Generate a permanent, fixed-rate crypto bridge address. Auto-converts incoming deposits to your target asset. Perfect for recurring payments and treasury.", h: "Permanent Crypto Bridge — Set It and Forget It" },
    "/about": { t: "About MRC GlobalPay — Canadian MSB Crypto Exchange", d: "MRC Pay International Corp operates MRC GlobalPay, a registered Canadian Money Services Business (FINTRAC C100000015) for instant crypto swaps.", h: "About MRC GlobalPay" },
    "/compliance": { t: "Compliance & MSB Registration | MRC GlobalPay", d: "MRC GlobalPay is a registered Canadian MSB (FINTRAC C100000015). Read our compliance framework, AML policy, and regulatory commitments.", h: "Regulatory Compliance & MSB Status" },
    "/blog": { t: "Blog — Crypto Guides, News & Analysis | MRC GlobalPay", d: "Expert crypto guides, market analysis, and how-to tutorials from the MRC GlobalPay team. Updated weekly.", h: "MRC GlobalPay Blog" },
  },
  es: {
    "/": { t: "MRC GlobalPay — Intercambio Cripto Instantáneo, Sin Registro", d: "Intercambia 6.000+ criptomonedas en menos de 60 segundos desde $0,30. Sin custodia, sin cuenta, MSB registrado en Canadá.", h: "Intercambio Cripto Instantáneo — Más de 6.000 Activos" },
    "/affiliates": { t: "Programa de Afiliados — Gana BTC | MRC GlobalPay", d: "Únete al programa de afiliados de MRC GlobalPay. Gana comisiones en Bitcoin por cada intercambio referido.", h: "Gana Comisiones en Bitcoin como Afiliado MRC" },
    "/partners": { t: "Programa de Socios — API de Intercambio Cripto | MRC GlobalPay", d: "Integra el motor de intercambio MRC GlobalPay en tu wallet, exchange o aplicación. Widget de marca blanca, API REST, dashboard de socios.", h: "Programa de Socios MRC — Infraestructura White-Label" },
    "/referral": { t: "Recompensas por Referidos — Cobra en BTC | MRC GlobalPay", d: "Refiere amigos a MRC GlobalPay y gana Bitcoin por cada intercambio que completen. Comisiones vitalicias, reporting transparente.", h: "Refiere Amigos, Gana Bitcoin para Siempre" },
    "/lend": { t: "Préstamos y Earn Cripto — Hasta 14% APY | MRC GlobalPay", d: "Gana ingresos pasivos con tus criptos en el portal de préstamos de MRC GlobalPay. Hasta 14% APY en stablecoins.", h: "Portal de Préstamos y Earn Cripto — Hasta 14% APY" },
    "/private-transfer": { t: "Transferencia Privada Cripto | MRC GlobalPay", d: "Envía cripto de forma privada wallet-a-wallet con MRC GlobalPay. Sin KYC, sin cuenta, totalmente cifrado.", h: "Transferencia Privada Wallet-a-Wallet" },
    "/permanent-bridge": { t: "Puente Cripto Permanente | MRC GlobalPay", d: "Genera una dirección de puente cripto permanente y de tasa fija. Auto-convierte depósitos a tu activo objetivo.", h: "Puente Cripto Permanente — Configúralo y Olvídate" },
    "/about": { t: "Acerca de MRC GlobalPay — Exchange MSB Canadiense", d: "MRC Pay International Corp opera MRC GlobalPay, un Money Services Business registrado en Canadá (FINTRAC C100000015).", h: "Acerca de MRC GlobalPay" },
    "/compliance": { t: "Cumplimiento y Registro MSB | MRC GlobalPay", d: "MRC GlobalPay es un MSB registrado en Canadá (FINTRAC C100000015). Marco de cumplimiento, política AML.", h: "Cumplimiento Regulatorio y Estado MSB" },
    "/blog": { t: "Blog — Guías Cripto y Análisis | MRC GlobalPay", d: "Guías expertas de cripto, análisis de mercado y tutoriales del equipo de MRC GlobalPay.", h: "Blog de MRC GlobalPay" },
  },
  pt: {
    "/": { t: "MRC GlobalPay — Troca Cripto Instantânea, Sem Registro", d: "Troque 6.000+ criptomoedas em menos de 60 segundos a partir de $0,30. Sem custódia, sem conta, MSB registrado no Canadá.", h: "Troca Cripto Instantânea — Mais de 6.000 Ativos" },
    "/affiliates": { t: "Programa de Afiliados — Ganhe BTC | MRC GlobalPay", d: "Participe do programa de afiliados MRC GlobalPay. Ganhe comissões em Bitcoin em cada troca indicada.", h: "Ganhe Comissões em Bitcoin como Afiliado MRC" },
    "/partners": { t: "Programa de Parceiros — API de Troca Cripto | MRC GlobalPay", d: "Integre o motor de troca MRC GlobalPay em sua carteira, exchange ou app. Widget white-label, API REST.", h: "Programa de Parceiros MRC — Infraestrutura White-Label" },
    "/referral": { t: "Recompensas por Indicação — Receba em BTC | MRC GlobalPay", d: "Indique amigos ao MRC GlobalPay e ganhe Bitcoin em cada troca que eles completarem.", h: "Indique Amigos, Ganhe Bitcoin para Sempre" },
    "/lend": { t: "Lending e Earn Cripto — Até 14% APY | MRC GlobalPay", d: "Ganhe renda passiva com suas criptos no portal de empréstimos MRC GlobalPay. Até 14% APY em stablecoins.", h: "Portal de Lending e Earn Cripto — Até 14% APY" },
    "/private-transfer": { t: "Transferência Cripto Privada | MRC GlobalPay", d: "Envie cripto de forma privada de carteira-a-carteira com MRC GlobalPay. Sem KYC, sem conta.", h: "Transferência Privada Carteira-a-Carteira" },
    "/permanent-bridge": { t: "Ponte Cripto Permanente | MRC GlobalPay", d: "Gere um endereço de ponte cripto permanente e de taxa fixa. Auto-converte depósitos.", h: "Ponte Cripto Permanente" },
    "/about": { t: "Sobre MRC GlobalPay — Exchange MSB Canadense", d: "MRC Pay International Corp opera MRC GlobalPay, um Money Services Business registrado no Canadá.", h: "Sobre MRC GlobalPay" },
    "/compliance": { t: "Compliance e Registro MSB | MRC GlobalPay", d: "MRC GlobalPay é um MSB registrado no Canadá (FINTRAC C100000015).", h: "Compliance Regulatório e Status MSB" },
    "/blog": { t: "Blog — Guias Cripto e Análise | MRC GlobalPay", d: "Guias especializados de cripto, análise de mercado e tutoriais da equipe MRC GlobalPay.", h: "Blog MRC GlobalPay" },
  },
  fr: {
    "/": { t: "MRC GlobalPay — Échange Crypto Instantané, Sans Inscription", d: "Échangez 6 000+ cryptomonnaies en moins de 60 secondes dès 0,30 $. Non-custodial, sans compte, MSB canadien enregistré.", h: "Échange Crypto Instantané — Plus de 6 000 Actifs" },
    "/affiliates": { t: "Programme d'Affiliation — Gagnez en BTC | MRC GlobalPay", d: "Rejoignez le programme d'affiliation MRC GlobalPay. Gagnez des commissions en Bitcoin sur chaque échange référé.", h: "Gagnez des Commissions Bitcoin en tant qu'Affilié MRC" },
    "/partners": { t: "Programme Partenaires — API d'Échange Crypto | MRC GlobalPay", d: "Intégrez le moteur d'échange MRC GlobalPay dans votre wallet, exchange ou app. Widget white-label, API REST.", h: "Programme Partenaires MRC — Infrastructure White-Label" },
    "/referral": { t: "Récompenses de Parrainage — Payé en BTC | MRC GlobalPay", d: "Parrainez vos amis sur MRC GlobalPay et gagnez du Bitcoin sur chaque échange qu'ils effectuent.", h: "Parrainez vos Amis, Gagnez du Bitcoin à Vie" },
    "/lend": { t: "Lending Crypto — Jusqu'à 14% APY | MRC GlobalPay", d: "Générez des revenus passifs avec vos cryptos sur le portail de lending MRC GlobalPay. Jusqu'à 14% APY.", h: "Portail Lending & Earn Crypto — Jusqu'à 14% APY" },
    "/private-transfer": { t: "Transfert Crypto Privé | MRC GlobalPay", d: "Envoyez des cryptos en privé wallet-à-wallet avec MRC GlobalPay. Sans KYC, sans compte.", h: "Transfert Privé Wallet-à-Wallet" },
    "/permanent-bridge": { t: "Pont Crypto Permanent | MRC GlobalPay", d: "Générez une adresse de pont crypto permanente et à taux fixe. Conversion automatique.", h: "Pont Crypto Permanent" },
    "/about": { t: "À Propos de MRC GlobalPay — Exchange MSB Canadien", d: "MRC Pay International Corp opère MRC GlobalPay, un Money Services Business canadien enregistré.", h: "À Propos de MRC GlobalPay" },
    "/compliance": { t: "Conformité et Enregistrement MSB | MRC GlobalPay", d: "MRC GlobalPay est un MSB canadien enregistré (FINTRAC C100000015).", h: "Conformité Réglementaire et Statut MSB" },
    "/blog": { t: "Blog — Guides Crypto et Analyses | MRC GlobalPay", d: "Guides crypto experts, analyses de marché et tutoriels de l'équipe MRC GlobalPay.", h: "Blog MRC GlobalPay" },
  },
  ja: {
    "/": { t: "MRC GlobalPay — 登録不要の即時暗号資産スワップ", d: "6,000以上の暗号資産を$0.30から60秒以内にスワップ。ノンカストディアル、口座不要、カナダMSB登録済み。", h: "即時暗号資産スワップ — 6,000以上の資産" },
    "/affiliates": { t: "アフィリエイトプログラム — BTCで稼ぐ | MRC GlobalPay", d: "MRC GlobalPayアフィリエイトプログラムに参加。紹介スワップごとにビットコインの報酬。", h: "MRCアフィリエイトとしてビットコイン報酬を獲得" },
    "/partners": { t: "パートナープログラム — 暗号資産スワップAPI | MRC GlobalPay", d: "MRC GlobalPayスワップエンジンをウォレット、取引所、アプリに組み込み。ホワイトラベルウィジェット、REST API。", h: "MRCパートナープログラム — ホワイトラベル基盤" },
    "/referral": { t: "紹介報酬 — BTCで受取 | MRC GlobalPay", d: "MRC GlobalPayを友人に紹介し、彼らが完了する各スワップでビットコインを獲得。", h: "友人を紹介、永久にビットコインを獲得" },
    "/lend": { t: "暗号資産レンディング — 最大14% APY | MRC GlobalPay", d: "MRC GlobalPayレンディングポータルで暗号資産から不労所得。ステーブルコインで最大14% APY。", h: "暗号資産レンディング・Earnポータル — 最大14% APY" },
    "/private-transfer": { t: "プライベート暗号資産送金 | MRC GlobalPay", d: "MRC GlobalPayでウォレット間でプライベートに暗号資産を送金。KYC不要、口座不要。", h: "プライベート ウォレット間送金" },
    "/permanent-bridge": { t: "永続暗号資産ブリッジ | MRC GlobalPay", d: "永続的な固定レートの暗号資産ブリッジアドレスを生成。受信入金を自動変換。", h: "永続暗号資産ブリッジ" },
    "/about": { t: "MRC GlobalPay について — カナダMSB暗号資産取引所", d: "MRC Pay International CorpがMRC GlobalPayを運営。カナダ登録Money Services Business。", h: "MRC GlobalPay について" },
    "/compliance": { t: "コンプライアンス & MSB登録 | MRC GlobalPay", d: "MRC GlobalPayは登録済みカナダMSB(FINTRAC C100000015)。", h: "規制コンプライアンス & MSBステータス" },
    "/blog": { t: "ブログ — 暗号資産ガイド・分析 | MRC GlobalPay", d: "MRC GlobalPayチームによる暗号資産ガイド、市場分析、チュートリアル。", h: "MRC GlobalPay ブログ" },
  },
  fa: {
    "/": { t: "MRC GlobalPay — تبادل آنی رمزارز بدون ثبت‌نام", d: "بیش از ۶٬۰۰۰ رمزارز را در کمتر از ۶۰ ثانیه از ۰٫۳۰ دلار مبادله کنید. بدون حساب، MSB کانادا.", h: "تبادل آنی رمزارز — بیش از ۶٬۰۰۰ دارایی" },
    "/affiliates": { t: "برنامه افیلیت — درآمد بیت‌کوین | MRC GlobalPay", d: "به برنامه افیلیت MRC GlobalPay بپیوندید. کمیسیون بیت‌کوین در هر تبادل.", h: "کسب کمیسیون بیت‌کوین به‌عنوان افیلیت MRC" },
    "/partners": { t: "برنامه شرکا — API تبادل رمزارز | MRC GlobalPay", d: "موتور تبادل MRC GlobalPay را در کیف پول یا اپ خود ادغام کنید.", h: "برنامه شرکای MRC — زیرساخت وایت‌لیبل" },
    "/referral": { t: "پاداش معرفی — دریافت BTC | MRC GlobalPay", d: "دوستان خود را به MRC GlobalPay معرفی کنید و در هر تبادل بیت‌کوین کسب کنید.", h: "دوستان را معرفی کنید، برای همیشه بیت‌کوین کسب کنید" },
    "/lend": { t: "وام و درآمد رمزارز — تا ۱۴٪ APY | MRC GlobalPay", d: "از پرتال وام MRC GlobalPay درآمد غیرفعال کسب کنید.", h: "پرتال وام و درآمد رمزارز — تا ۱۴٪ APY" },
    "/private-transfer": { t: "انتقال خصوصی رمزارز | MRC GlobalPay", d: "ارسال خصوصی رمزارز کیف‌پول به کیف‌پول. بدون KYC.", h: "انتقال خصوصی کیف‌پول به کیف‌پول" },
    "/permanent-bridge": { t: "پل دائمی رمزارز | MRC GlobalPay", d: "آدرس پل دائمی با نرخ ثابت ایجاد کنید.", h: "پل دائمی رمزارز" },
    "/about": { t: "درباره MRC GlobalPay — صرافی MSB کانادا", d: "MRC Pay International Corp، MSB ثبت‌شده در کانادا.", h: "درباره MRC GlobalPay" },
    "/compliance": { t: "انطباق و ثبت MSB | MRC GlobalPay", d: "MRC GlobalPay یک MSB ثبت‌شده در کانادا است (FINTRAC C100000015).", h: "انطباق نظارتی و وضعیت MSB" },
    "/blog": { t: "بلاگ — راهنماهای رمزارز | MRC GlobalPay", d: "راهنماهای رمزارز و تحلیل بازار توسط تیم MRC GlobalPay.", h: "بلاگ MRC GlobalPay" },
  },
  ur: {
    "/": { t: "MRC GlobalPay — فوری کرپٹو سویپ، رجسٹریشن کے بغیر", d: "6,000+ کرپٹو کرنسی کو 60 سیکنڈ سے کم میں $0.30 سے سویپ کریں۔ کینیڈین MSB رجسٹرڈ۔", h: "فوری کرپٹو سویپ — 6,000+ اثاثے" },
    "/affiliates": { t: "ایفیلی ایٹ پروگرام — BTC کمائیں | MRC GlobalPay", d: "MRC GlobalPay ایفیلی ایٹ پروگرام میں شامل ہوں۔ ہر سویپ پر بٹ کوائن کمیشن۔", h: "MRC ایفیلی ایٹ کے طور پر بٹ کوائن کمائیں" },
    "/partners": { t: "پارٹنر پروگرام — کرپٹو سویپ API | MRC GlobalPay", d: "MRC GlobalPay سویپ انجن کو اپنے والیٹ یا ایپ میں شامل کریں۔", h: "MRC پارٹنر پروگرام" },
    "/referral": { t: "ریفرل انعامات — BTC میں ادائیگی | MRC GlobalPay", d: "دوستوں کو ریفر کریں اور بٹ کوائن کمائیں۔", h: "دوستوں کو ریفر کریں، ہمیشہ بٹ کوائن کمائیں" },
    "/lend": { t: "کرپٹو لینڈنگ — 14% APY تک | MRC GlobalPay", d: "MRC GlobalPay لینڈنگ پورٹل سے کرپٹو پر منافع کمائیں۔", h: "کرپٹو لینڈنگ پورٹل" },
    "/private-transfer": { t: "نجی کرپٹو ٹرانسفر | MRC GlobalPay", d: "والیٹ سے والیٹ نجی کرپٹو بھیجیں۔", h: "نجی والیٹ ٹرانسفر" },
    "/permanent-bridge": { t: "مستقل کرپٹو برج | MRC GlobalPay", d: "مستقل فکسڈ ریٹ کرپٹو برج ایڈریس بنائیں۔", h: "مستقل کرپٹو برج" },
    "/about": { t: "MRC GlobalPay کے بارے میں — کینیڈین MSB", d: "MRC Pay International Corp، کینیڈا میں رجسٹرڈ MSB۔", h: "MRC GlobalPay کے بارے میں" },
    "/compliance": { t: "تعمیل اور MSB رجسٹریشن | MRC GlobalPay", d: "MRC GlobalPay ایک کینیڈین رجسٹرڈ MSB ہے۔", h: "ریگولیٹری تعمیل" },
    "/blog": { t: "بلاگ — کرپٹو گائیڈز | MRC GlobalPay", d: "MRC GlobalPay ٹیم سے کرپٹو گائیڈز اور مارکیٹ تجزیہ۔", h: "MRC GlobalPay بلاگ" },
  },
  he: {
    "/": { t: "MRC GlobalPay — החלפת קריפטו מיידית ללא הרשמה", d: "החלף 6,000+ מטבעות קריפטו בפחות מ-60 שניות מ-$0.30. ללא חשבון, MSB קנדי רשום.", h: "החלפת קריפטו מיידית — 6,000+ נכסים" },
    "/affiliates": { t: "תוכנית שותפים — הרווח BTC | MRC GlobalPay", d: "הצטרף לתוכנית השותפים של MRC GlobalPay. עמלות ביטקוין על כל החלפה.", h: "הרווח עמלות ביטקוין כשותף MRC" },
    "/partners": { t: "תוכנית פרטנרים — API החלפת קריפטו | MRC GlobalPay", d: "שלב את מנוע ההחלפה של MRC GlobalPay בארנק או באפליקציה שלך.", h: "תוכנית פרטנרים MRC" },
    "/referral": { t: "תגמולי הפניה — קבל ב-BTC | MRC GlobalPay", d: "הפנה חברים ל-MRC GlobalPay והרווח ביטקוין על כל החלפה.", h: "הפנה חברים, הרווח ביטקוין לנצח" },
    "/lend": { t: "הלוואות קריפטו — עד 14% APY | MRC GlobalPay", d: "הרווח הכנסה פסיבית עם פורטל ההלוואות של MRC GlobalPay.", h: "פורטל הלוואות קריפטו" },
    "/private-transfer": { t: "העברת קריפטו פרטית | MRC GlobalPay", d: "שלח קריפטו בפרטיות מארנק לארנק. ללא KYC.", h: "העברה פרטית מארנק לארנק" },
    "/permanent-bridge": { t: "גשר קריפטו קבוע | MRC GlobalPay", d: "צור כתובת גשר קריפטו קבועה בשער קבוע.", h: "גשר קריפטו קבוע" },
    "/about": { t: "אודות MRC GlobalPay — חליפין MSB קנדי", d: "MRC Pay International Corp, MSB קנדי רשום.", h: "אודות MRC GlobalPay" },
    "/compliance": { t: "ציות ורישום MSB | MRC GlobalPay", d: "MRC GlobalPay הוא MSB קנדי רשום (FINTRAC C100000015).", h: "ציות רגולטורי וסטטוס MSB" },
    "/blog": { t: "בלוג — מדריכי קריפטו | MRC GlobalPay", d: "מדריכי קריפטו וניתוח שוק מצוות MRC GlobalPay.", h: "בלוג MRC GlobalPay" },
  },
  af: {
    "/": { t: "MRC GlobalPay — Onmiddellike Krypto-ruil, Sonder Registrasie", d: "Ruil 6,000+ kriptogeldeenhede in minder as 60 sekondes vanaf $0.30. Geen rekening, Kanadese MSB-geregistreer.", h: "Onmiddellike Krypto-ruil — 6,000+ Bates" },
    "/affiliates": { t: "Affiliasie Program — Verdien BTC | MRC GlobalPay", d: "Sluit aan by die MRC GlobalPay affiliasie program. Verdien Bitcoin op elke verwysing.", h: "Verdien Bitcoin Kommissie as MRC Affiliasie" },
    "/partners": { t: "Vennootskap Program — Krypto Ruil API | MRC GlobalPay", d: "Integreer die MRC GlobalPay ruil-enjin in jou beursie of app.", h: "MRC Vennootskap Program" },
    "/referral": { t: "Verwysingsbelonings — Word betaal in BTC | MRC GlobalPay", d: "Verwys vriende na MRC GlobalPay en verdien Bitcoin.", h: "Verwys Vriende, Verdien Bitcoin" },
    "/lend": { t: "Krypto Lening — Tot 14% APY | MRC GlobalPay", d: "Verdien passiewe inkomste met die MRC GlobalPay leningsportaal.", h: "Krypto Leningsportaal" },
    "/private-transfer": { t: "Private Krypto-oordrag | MRC GlobalPay", d: "Stuur krypto privaat van beursie tot beursie. Geen KYC.", h: "Private Beursie-oordrag" },
    "/permanent-bridge": { t: "Permanente Krypto-brug | MRC GlobalPay", d: "Skep 'n permanente vaste-koers krypto-brug-adres.", h: "Permanente Krypto-brug" },
    "/about": { t: "Oor MRC GlobalPay — Kanadese MSB", d: "MRC Pay International Corp, geregistreerde Kanadese MSB.", h: "Oor MRC GlobalPay" },
    "/compliance": { t: "Voldoening & MSB Registrasie | MRC GlobalPay", d: "MRC GlobalPay is 'n geregistreerde Kanadese MSB.", h: "Regulatoriese Voldoening" },
    "/blog": { t: "Blog — Krypto Gidse | MRC GlobalPay", d: "Krypto gidse en markontleding van die MRC GlobalPay span.", h: "MRC GlobalPay Blog" },
  },
  hi: {
    "/": { t: "MRC GlobalPay — पंजीकरण-मुक्त तत्काल क्रिप्टो स्वैप", d: "6,000+ क्रिप्टोकरेंसी को 60 सेकंड से कम में $0.30 से स्वैप करें। कोई खाता नहीं, कनाडाई MSB।", h: "तत्काल क्रिप्टो स्वैप — 6,000+ संपत्तियां" },
    "/affiliates": { t: "एफिलिएट प्रोग्राम — BTC कमाएं | MRC GlobalPay", d: "MRC GlobalPay एफिलिएट प्रोग्राम में शामिल हों। हर स्वैप पर बिटकॉइन कमीशन।", h: "MRC एफिलिएट के रूप में बिटकॉइन कमाएं" },
    "/partners": { t: "पार्टनर प्रोग्राम — क्रिप्टो स्वैप API | MRC GlobalPay", d: "MRC GlobalPay स्वैप इंजन को अपने वॉलेट या ऐप में एकीकृत करें।", h: "MRC पार्टनर प्रोग्राम" },
    "/referral": { t: "रेफरल पुरस्कार — BTC में भुगतान | MRC GlobalPay", d: "दोस्तों को रेफर करें और बिटकॉइन कमाएं।", h: "दोस्तों को रेफर करें, हमेशा बिटकॉइन कमाएं" },
    "/lend": { t: "क्रिप्टो लेंडिंग — 14% APY तक | MRC GlobalPay", d: "MRC GlobalPay लेंडिंग पोर्टल से निष्क्रिय आय कमाएं।", h: "क्रिप्टो लेंडिंग पोर्टल" },
    "/private-transfer": { t: "निजी क्रिप्टो ट्रांसफर | MRC GlobalPay", d: "वॉलेट से वॉलेट निजी क्रिप्टो भेजें। कोई KYC नहीं।", h: "निजी वॉलेट ट्रांसफर" },
    "/permanent-bridge": { t: "स्थायी क्रिप्टो ब्रिज | MRC GlobalPay", d: "स्थायी निश्चित-दर क्रिप्टो ब्रिज एड्रेस बनाएं।", h: "स्थायी क्रिप्टो ब्रिज" },
    "/about": { t: "MRC GlobalPay के बारे में — कनाडाई MSB", d: "MRC Pay International Corp, पंजीकृत कनाडाई MSB।", h: "MRC GlobalPay के बारे में" },
    "/compliance": { t: "अनुपालन और MSB पंजीकरण | MRC GlobalPay", d: "MRC GlobalPay एक पंजीकृत कनाडाई MSB है।", h: "नियामक अनुपालन" },
    "/blog": { t: "ब्लॉग — क्रिप्टो गाइड | MRC GlobalPay", d: "MRC GlobalPay टीम से क्रिप्टो गाइड और बाजार विश्लेषण।", h: "MRC GlobalPay ब्लॉग" },
  },
  vi: {
    "/": { t: "MRC GlobalPay — Hoán đổi Tiền điện tử Tức thì, Không Đăng ký", d: "Hoán đổi 6,000+ tiền điện tử trong dưới 60 giây từ $0.30. Không tài khoản, MSB Canada đăng ký.", h: "Hoán đổi Tiền điện tử Tức thì — 6,000+ Tài sản" },
    "/affiliates": { t: "Chương trình Affiliate — Kiếm BTC | MRC GlobalPay", d: "Tham gia chương trình affiliate MRC GlobalPay. Hoa hồng Bitcoin trên mỗi giao dịch.", h: "Kiếm Hoa hồng Bitcoin với MRC Affiliate" },
    "/partners": { t: "Chương trình Đối tác — API Hoán đổi | MRC GlobalPay", d: "Tích hợp công cụ hoán đổi MRC GlobalPay vào ví hoặc ứng dụng của bạn.", h: "Chương trình Đối tác MRC" },
    "/referral": { t: "Phần thưởng Giới thiệu — Nhận BTC | MRC GlobalPay", d: "Giới thiệu bạn bè đến MRC GlobalPay và kiếm Bitcoin.", h: "Giới thiệu Bạn bè, Kiếm Bitcoin Mãi mãi" },
    "/lend": { t: "Cho vay Tiền điện tử — Lên đến 14% APY | MRC GlobalPay", d: "Kiếm thu nhập thụ động với cổng cho vay MRC GlobalPay.", h: "Cổng Cho vay Tiền điện tử" },
    "/private-transfer": { t: "Chuyển Tiền điện tử Riêng tư | MRC GlobalPay", d: "Gửi tiền điện tử riêng tư từ ví đến ví. Không KYC.", h: "Chuyển Riêng tư Ví-đến-Ví" },
    "/permanent-bridge": { t: "Cầu Tiền điện tử Vĩnh viễn | MRC GlobalPay", d: "Tạo địa chỉ cầu tiền điện tử vĩnh viễn với tỷ giá cố định.", h: "Cầu Tiền điện tử Vĩnh viễn" },
    "/about": { t: "Về MRC GlobalPay — Sàn MSB Canada", d: "MRC Pay International Corp, MSB Canada đăng ký.", h: "Về MRC GlobalPay" },
    "/compliance": { t: "Tuân thủ & Đăng ký MSB | MRC GlobalPay", d: "MRC GlobalPay là MSB Canada đăng ký (FINTRAC C100000015).", h: "Tuân thủ Quy định" },
    "/blog": { t: "Blog — Hướng dẫn Tiền điện tử | MRC GlobalPay", d: "Hướng dẫn tiền điện tử và phân tích thị trường từ đội ngũ MRC GlobalPay.", h: "Blog MRC GlobalPay" },
  },
  tr: {
    "/": { t: "MRC GlobalPay — Anında Kripto Takası, Kayıt Olmadan", d: "6,000+ kripto parayı 60 saniyeden kısa sürede $0.30'dan takas edin. Hesap yok, Kanada MSB kayıtlı.", h: "Anında Kripto Takası — 6,000+ Varlık" },
    "/affiliates": { t: "Affiliate Programı — BTC Kazanın | MRC GlobalPay", d: "MRC GlobalPay affiliate programına katılın. Her takasta Bitcoin komisyonu.", h: "MRC Affiliate Olarak Bitcoin Kazanın" },
    "/partners": { t: "Ortak Programı — Kripto Takas API | MRC GlobalPay", d: "MRC GlobalPay takas motorunu cüzdanınıza veya uygulamanıza entegre edin.", h: "MRC Ortak Programı" },
    "/referral": { t: "Referans Ödülleri — BTC Olarak Ödeme | MRC GlobalPay", d: "Arkadaşlarınızı MRC GlobalPay'e yönlendirin ve Bitcoin kazanın.", h: "Arkadaş Yönlendirin, Sonsuza Kadar Bitcoin Kazanın" },
    "/lend": { t: "Kripto Kredi — %14 APY'ye Kadar | MRC GlobalPay", d: "MRC GlobalPay kredi portalı ile pasif gelir elde edin.", h: "Kripto Kredi Portalı" },
    "/private-transfer": { t: "Özel Kripto Transferi | MRC GlobalPay", d: "Cüzdandan cüzdana özel kripto gönderin. KYC yok.", h: "Özel Cüzdan Transferi" },
    "/permanent-bridge": { t: "Kalıcı Kripto Köprüsü | MRC GlobalPay", d: "Kalıcı sabit oranlı kripto köprü adresi oluşturun.", h: "Kalıcı Kripto Köprüsü" },
    "/about": { t: "MRC GlobalPay Hakkında — Kanada MSB", d: "MRC Pay International Corp, kayıtlı Kanada MSB.", h: "MRC GlobalPay Hakkında" },
    "/compliance": { t: "Uyumluluk & MSB Kaydı | MRC GlobalPay", d: "MRC GlobalPay kayıtlı bir Kanada MSB'sidir.", h: "Düzenleyici Uyumluluk" },
    "/blog": { t: "Blog — Kripto Rehberleri | MRC GlobalPay", d: "MRC GlobalPay ekibinden kripto rehberleri ve piyasa analizi.", h: "MRC GlobalPay Blogu" },
  },
  uk: {
    "/": { t: "MRC GlobalPay — Миттєвий Обмін Криптовалют без Реєстрації", d: "Обмінюйте 6,000+ криптовалют менш ніж за 60 секунд від $0.30. Без облікового запису, канадський MSB.", h: "Миттєвий Обмін Криптовалют — 6,000+ Активів" },
    "/affiliates": { t: "Партнерська Програма — Заробляйте BTC | MRC GlobalPay", d: "Приєднуйтесь до партнерської програми MRC GlobalPay. Комісії Bitcoin за кожен обмін.", h: "Заробляйте Bitcoin як Партнер MRC" },
    "/partners": { t: "Програма Партнерів — Крипто Обмін API | MRC GlobalPay", d: "Інтегруйте систему обміну MRC GlobalPay у ваш гаманець або додаток.", h: "Програма Партнерів MRC" },
    "/referral": { t: "Реферальні Винагороди — Отримуйте в BTC | MRC GlobalPay", d: "Запрошуйте друзів до MRC GlobalPay і заробляйте Bitcoin.", h: "Запрошуйте Друзів, Заробляйте Bitcoin Назавжди" },
    "/lend": { t: "Криптокредитування — До 14% APY | MRC GlobalPay", d: "Отримуйте пасивний дохід з порталом кредитування MRC GlobalPay.", h: "Портал Криптокредитування" },
    "/private-transfer": { t: "Приватний Криптопереказ | MRC GlobalPay", d: "Надсилайте криптовалюту приватно з гаманця в гаманець. Без KYC.", h: "Приватний Переказ Гаманця" },
    "/permanent-bridge": { t: "Постійний Криптомост | MRC GlobalPay", d: "Створіть постійну адресу криптомосту з фіксованою ставкою.", h: "Постійний Криптомост" },
    "/about": { t: "Про MRC GlobalPay — Канадська MSB Біржа", d: "MRC Pay International Corp, зареєстрована канадська MSB.", h: "Про MRC GlobalPay" },
    "/compliance": { t: "Комплаєнс і Реєстрація MSB | MRC GlobalPay", d: "MRC GlobalPay — зареєстрована канадська MSB (FINTRAC C100000015).", h: "Регуляторний Комплаєнс" },
    "/blog": { t: "Блог — Крипто Гайди | MRC GlobalPay", d: "Крипто гайди та аналіз ринку від команди MRC GlobalPay.", h: "Блог MRC GlobalPay" },
  },
};

const COMMON_BODY: Record<StaticRouteKey, string> = {
  "/": `<h2>What is MRC GlobalPay?</h2><p>MRC GlobalPay is a non-custodial crypto exchange operated by MRC Pay International Corp, a registered Canadian Money Services Business (FINTRAC #C100000015). We let anyone swap 6,000+ cryptocurrencies wallet-to-wallet in under 60 seconds, starting from $0.30 — no account, no email, no KYC for standard swaps.</p><h2>How does an MRC swap work?</h2><ol><li>Pick the asset you have and the asset you want.</li><li>Enter your destination wallet address.</li><li>Send your deposit to the one-time address shown.</li><li>Receive the converted asset in your wallet, typically within 60 seconds.</li></ol><h2>What makes MRC different?</h2><ul><li>Aggregated liquidity from 700+ sources for best rate</li><li>Crypto dust support — minimum swap as low as $0.30</li><li>Canadian MSB regulatory status</li><li>13 languages, 24/7 multilingual concierge</li><li>Embeddable widget, partner API, and white-label infrastructure</li></ul>`,
  "/affiliates": `<h2>Earn Bitcoin on every referred swap</h2><p>The MRC GlobalPay affiliate program pays Bitcoin commissions on every successful swap from users you refer. Real-time dashboard, weekly automated payouts to your BTC wallet, lifetime tracking, no caps.</p><h2>How it works</h2><ol><li>Sign up and claim your unique <code>?ref=YOUR_CODE</code> link.</li><li>Share with your audience or embed our widget.</li><li>Earn BTC on every completed swap. Withdrawn directly to your wallet — no holding period, no minimum threshold beyond network fees.</li></ol><h2>Marketing materials</h2><p>Branded banners in 8 languages and sizes, comparison content, ready-to-publish landing copy, transparent rate cards, and a real-time stats API.</p>`,
  "/partners": `<h2>White-label crypto swap infrastructure</h2><p>MRC Partner Program lets fintechs, wallets, and exchanges embed our 6,000+ asset swap engine via a customizable widget, REST API, and webhook events. Single integration, multi-provider liquidity, full compliance coverage.</p><h2>What you get</h2><ul><li>Embeddable swap widget (responsive, white-label)</li><li>REST API for programmatic swaps and rate quotes</li><li>Webhook events for transaction lifecycle</li><li>Partner dashboard with real-time analytics</li><li>Dedicated technical onboarding</li></ul>`,
  "/referral": `<h2>Invite friends, earn Bitcoin forever</h2><p>The MRC referral program pays you Bitcoin every time a friend you referred completes a swap — for life. No expiration, no caps, no minimum balance. Withdraw to your BTC wallet anytime.</p><h2>How it works</h2><ol><li>Generate your referral link from your account.</li><li>Send it to friends, post on social, or embed.</li><li>Earn BTC commission on every swap they complete, paid weekly.</li></ol>`,
  "/lend": `<h2>Earn up to 14% APY on your crypto</h2><p>The MRC Lend &amp; Earn portal lets you put idle crypto to work with up to 14% APY on stablecoins, instant withdrawals, and a strict source-back payout policy that returns rewards to the wallet you deposited from.</p><h2>Supported assets</h2><p>USDT, USDC, DAI, BTC, ETH, SOL, and 40+ more. Multi-signature custody. Real-time portfolio tracking.</p>`,
  "/private-transfer": `<h2>Send crypto privately, wallet-to-wallet</h2><p>The MRC Private Transfer service lets you send any of 6,000+ cryptocurrencies privately from one wallet to another, with no account, no email, no KYC, and end-to-end shielded routing. Supports Monero (XMR), Zcash (ZEC), and full privacy coin coverage.</p>`,
  "/permanent-bridge": `<h2>One address, infinite bridges</h2><p>Generate a permanent fixed-address that auto-converts every incoming deposit into your target asset. Perfect for recurring payments, treasury management, payroll, and donation flows. Stateless, signed PDF receipts on every conversion.</p>`,
  "/about": `<h2>About MRC GlobalPay</h2><p>MRC Pay International Corp operates MRC GlobalPay, a registered Canadian Money Services Business (FINTRAC #C100000015) headquartered in Ottawa. We provide instant non-custodial crypto swaps, lending, and payment infrastructure to retail users and partners across 13 languages.</p>`,
  "/compliance": `<h2>Regulatory framework</h2><p>MRC GlobalPay is registered with FINTRAC (Financial Transactions and Reports Analysis Centre of Canada) as a Money Services Business under registration number C100000015. We comply with Canadian AML/ATF rules including the PCMLTFA, maintain a written compliance program, and conduct ongoing risk assessments.</p>`,
  "/blog": `<h2>Latest from the MRC blog</h2><p>Hands-on crypto guides, market commentary, regulatory analysis, and product updates from the MRC GlobalPay editorial team. New posts published weekly across multiple languages.</p>`,
};

function buildOrgJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    name: "MRC GlobalPay",
    url: SITE,
    description: "Instant non-custodial crypto exchange and lending platform. Canadian MSB-registered.",
    logo: `${SITE}/favicon-192x192.png`,
    sameAs: ["https://twitter.com/mrcglobalpay"],
    areaServed: "Worldwide",
  };
}

export const STATIC_ROUTE_SEO: Record<StaticRouteKey, Record<string, RouteSeo>> = (() => {
  const out: Record<string, Record<string, RouteSeo>> = {};
  const routes = Object.keys(COMMON_BODY) as StaticRouteKey[];
  for (const route of routes) {
    out[route] = {};
    for (const lang of Object.keys(LOCALIZED_LABELS)) {
      const labels = LOCALIZED_LABELS[lang][route];
      out[route][lang] = {
        title: labels.t,
        description: labels.d,
        h1: labels.h,
        bodyHtml: COMMON_BODY[route],
        jsonLd: route === "/" ? buildOrgJsonLd() : undefined,
      };
    }
  }
  return out as Record<StaticRouteKey, Record<string, RouteSeo>>;
})();
