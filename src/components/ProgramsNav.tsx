import { Link, useLocation } from "react-router-dom";
import { Share2, Users, Gift } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const LANGS = ["en", "es", "fr", "pt", "tr", "uk", "vi", "hi", "ja", "fa", "ur", "he", "af"];

const useLp = () => {
  const { pathname } = useLocation();
  const seg = pathname.split("/")[1];
  const prefix = LANGS.includes(seg) ? `/${seg}` : "";
  return (p: string) => `${prefix}${p}`;
};

type Active = "affiliates" | "partners" | "referral";

const items: { key: Active; label: string; path: string; icon: typeof Share2 }[] = [
  { key: "affiliates", label: "Affiliates", path: "/affiliates", icon: Share2 },
  { key: "partners", label: "Partners", path: "/partners", icon: Users },
  { key: "referral", label: "Referral", path: "/referral", icon: Gift },
];

export const ProgramsNav = ({ active }: { active: Active }) => {
  const lp = useLp();
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? i18n.language ?? "en";
  const copy = {
    en: { programs: "Our Programs:", affiliates: "Affiliates", partners: "Partners", referral: "Referral", explore: "Explore our programs", title: "Three ways to earn lifetime BTC with MRC GlobalPay", affiliatesDesc: "Embed our swap widget. Marketing assets + dashboard.", partnersDesc: "Private dashboard, settlement reporting, negotiated rates.", referralDesc: "One simple link. No setup. Best for casual sharers.", program: "Program", current: "You are here", note: "All programs pay in BTC and operate under FINTRAC MSB #C100000015 and Bank of Canada PSP registration." },
    es: { programs: "Nuestros programas:", affiliates: "Afiliados", partners: "Socios", referral: "Referidos", explore: "Explora nuestros programas", title: "Tres formas de ganar BTC de por vida con MRC GlobalPay", affiliatesDesc: "Incrusta nuestro widget de swap. Materiales de marketing + panel.", partnersDesc: "Panel privado, reportes de liquidación y tarifas negociadas.", referralDesc: "Un enlace simple. Sin configuración. Ideal para compartir casualmente.", program: "Programa", current: "Estás aquí", note: "Todos los programas pagan en BTC y operan bajo el registro FINTRAC MSB #C100000015 y el registro PSP del Banco de Canadá." },
    fr: { programs: "Nos programmes :", affiliates: "Affiliation", partners: "Partenaires", referral: "Parrainage", explore: "Découvrez nos programmes", title: "Trois façons de gagner du BTC à vie avec MRC GlobalPay", affiliatesDesc: "Intégrez notre widget de swap. Ressources marketing + tableau de bord.", partnersDesc: "Tableau de bord privé, rapports de règlement, tarifs négociés.", referralDesc: "Un lien simple. Aucun paramétrage. Idéal pour un partage occasionnel.", program: "Programme", current: "Vous êtes ici", note: "Tous les programmes paient en BTC et fonctionnent sous l'enregistrement FINTRAC MSB #C100000015 et l'enregistrement PSP de la Banque du Canada." },
    pt: { programs: "Nossos programas:", affiliates: "Afiliados", partners: "Parceiros", referral: "Indicação", explore: "Explore nossos programas", title: "Três formas de ganhar BTC vitalício com a MRC GlobalPay", affiliatesDesc: "Incorpore nosso widget de swap. Materiais de marketing + painel.", partnersDesc: "Painel privado, relatórios de liquidação e taxas negociadas.", referralDesc: "Um link simples. Sem configuração. Melhor para compartilhamento casual.", program: "Programa", current: "Você está aqui", note: "Todos os programas pagam em BTC e operam sob o registro FINTRAC MSB #C100000015 e o registro PSP do Bank of Canada." },
    tr: { programs: "Programlarımız:", affiliates: "Affiliate", partners: "Ortaklar", referral: "Referans", explore: "Programlarımızı keşfedin", title: "MRC GlobalPay ile ömür boyu BTC kazanmanın üç yolu", affiliatesDesc: "Swap widget'ımızı gömün. Pazarlama materyalleri + panel.", partnersDesc: "Özel panel, mutabakat raporları ve pazarlıklı oranlar.", referralDesc: "Tek bir basit link. Kurulum yok. Gündelik paylaşım için ideal.", program: "Programı", current: "Buradasınız", note: "Tüm programlar BTC ile ödeme yapar ve FINTRAC MSB #C100000015 ile Bank of Canada PSP kaydı altında çalışır." },
    uk: { programs: "Наші програми:", affiliates: "Афіліати", partners: "Партнери", referral: "Реферали", explore: "Перегляньте наші програми", title: "Три способи заробляти BTC довічно з MRC GlobalPay", affiliatesDesc: "Вбудуйте наш swap-віджет. Маркетингові матеріали + панель.", partnersDesc: "Приватна панель, звіти по розрахунках і узгоджені ставки.", referralDesc: "Одне просте посилання. Без налаштування. Найкраще для простих рекомендацій.", program: "Програма", current: "Ви тут", note: "Усі програми виплачують BTC і працюють під реєстрацією FINTRAC MSB #C100000015 та реєстрацією PSP Банку Канади." },
    vi: { programs: "Chương trình của chúng tôi:", affiliates: "Affiliate", partners: "Đối tác", referral: "Giới thiệu", explore: "Khám phá các chương trình", title: "Ba cách để kiếm BTC trọn đời với MRC GlobalPay", affiliatesDesc: "Nhúng widget swap của chúng tôi. Tài liệu marketing + bảng điều khiển.", partnersDesc: "Bảng điều khiển riêng, báo cáo thanh toán, mức phí thương lượng.", referralDesc: "Một liên kết đơn giản. Không cần thiết lập. Phù hợp để chia sẻ thông thường.", program: "Chương trình", current: "Bạn đang ở đây", note: "Tất cả chương trình đều trả bằng BTC và hoạt động theo đăng ký FINTRAC MSB #C100000015 và PSP của Bank of Canada." },
    hi: { programs: "हमारे प्रोग्राम:", affiliates: "एफिलिएट", partners: "पार्टनर्स", referral: "रेफरल", explore: "हमारे प्रोग्राम देखें", title: "MRC GlobalPay के साथ जीवनभर BTC कमाने के तीन तरीके", affiliatesDesc: "हमारा swap widget एम्बेड करें। मार्केटिंग सामग्री + डैशबोर्ड।", partnersDesc: "प्राइवेट डैशबोर्ड, सेटलमेंट रिपोर्टिंग, नेगोशिएटेड रेट्स।", referralDesc: "एक सरल लिंक। कोई सेटअप नहीं। सामान्य शेयरिंग के लिए सबसे अच्छा।", program: "प्रोग्राम", current: "आप यहाँ हैं", note: "सभी प्रोग्राम BTC में भुगतान करते हैं और FINTRAC MSB #C100000015 तथा Bank of Canada PSP पंजीकरण के तहत संचालित होते हैं।" },
    ja: { programs: "プログラム一覧:", affiliates: "アフィリエイト", partners: "パートナー", referral: "紹介", explore: "プログラムを見る", title: "MRC GlobalPayで生涯BTCを稼ぐ3つの方法", affiliatesDesc: "スワップウィジェットを埋め込み。マーケ素材 + ダッシュボード。", partnersDesc: "非公開ダッシュボード、精算レポート、個別レート。", referralDesc: "シンプルなリンク1つ。設定不要。気軽な共有向け。", program: "プログラム", current: "現在地", note: "すべてのプログラムはBTCで支払われ、FINTRAC MSB #C100000015 と Bank of Canada PSP 登録のもとで運営されています。" },
    fa: { programs: "برنامه‌های ما:", affiliates: "افیلیت", partners: "شرکا", referral: "معرفی", explore: "برنامه‌ها را ببینید", title: "سه روش برای کسب BTC مادام‌العمر با MRC GlobalPay", affiliatesDesc: "ویجت سواپ ما را جاسازی کنید. محتوای بازاریابی + داشبورد.", partnersDesc: "داشبورد خصوصی، گزارش تسویه و نرخ‌های توافقی.", referralDesc: "یک لینک ساده. بدون راه‌اندازی. مناسب اشتراک‌گذاری معمولی.", program: "برنامه", current: "شما اینجا هستید", note: "همه برنامه‌ها با BTC پرداخت می‌کنند و تحت ثبت FINTRAC MSB #C100000015 و ثبت PSP بانک کانادا فعالیت می‌کنند." },
    ur: { programs: "ہمارے پروگرام:", affiliates: "افیلیئیٹس", partners: "پارٹنرز", referral: "ریفرل", explore: "ہمارے پروگرام دیکھیں", title: "MRC GlobalPay کے ساتھ تاحیات BTC کمانے کے تین طریقے", affiliatesDesc: "ہمارا swap widget ایمبیڈ کریں۔ مارکیٹنگ مواد + ڈیش بورڈ۔", partnersDesc: "پرائیویٹ ڈیش بورڈ، سیٹلمنٹ رپورٹنگ، مذاکراتی ریٹس۔", referralDesc: "ایک سادہ لنک۔ کوئی سیٹ اپ نہیں۔ عام شیئرنگ کے لیے بہترین۔", program: "پروگرام", current: "آپ یہاں ہیں", note: "تمام پروگرام BTC میں ادائیگی کرتے ہیں اور FINTRAC MSB #C100000015 اور Bank of Canada PSP رجسٹریشن کے تحت چلتے ہیں۔" },
    he: { programs: "התוכניות שלנו:", affiliates: "שותפי אפיליאציה", partners: "שותפים", referral: "הפניות", explore: "גלה את התוכניות שלנו", title: "שלוש דרכים להרוויח BTC לכל החיים עם MRC GlobalPay", affiliatesDesc: "הטמעו את ווידג'ט ההחלפה שלנו. חומרי שיווק + דשבורד.", partnersDesc: "דשבורד פרטי, דוחות סליקה ותעריפים מותאמים.", referralDesc: "קישור פשוט אחד. ללא התקנה. מתאים לשיתופים מזדמנים.", program: "תוכנית", current: "אתם כאן", note: "כל התוכניות משלמות ב-BTC ופועלות תחת רישום FINTRAC MSB #C100000015 ורישום PSP של Bank of Canada." },
    af: { programs: "Ons programme:", affiliates: "Affiliasies", partners: "Vennote", referral: "Verwysing", explore: "Verken ons programme", title: "Drie maniere om lewenslange BTC met MRC GlobalPay te verdien", affiliatesDesc: "Bed die ruil-widget in. Bemarkingsmateriaal + dashboard.", partnersDesc: "Privaat dashboard, vereffeningsverslagdoening, onderhandelde tariewe.", referralDesc: "Een eenvoudige skakel. Geen opstelling nie. Beste vir informele deel.", program: "Program", current: "Jy is hier", note: "Alle programme betaal in BTC en funksioneer onder FINTRAC MSB #C100000015 en Bank of Canada PSP-registrasie." },
  } as const;
  const text = copy[(lang in copy ? lang : "en") as keyof typeof copy];
  const localizedItems = items.map((item) => ({
    ...item,
    label: item.key === "affiliates" ? text.affiliates : item.key === "partners" ? text.partners : text.referral,
  }));
  return (
    <div className="border-b border-border/60 bg-muted/30">
      <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-2 gap-y-2 px-4 py-3">
        <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {text.programs}
        </span>
        {localizedItems.map((it, i) => {
          const isActive = it.key === active;
          const Icon = it.icon;
          return (
            <div key={it.key} className="flex items-center gap-2">
              {i > 0 && <span className="text-muted-foreground/50">|</span>}
              {isActive ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  <Icon className="h-3 w-3" /> {it.label}
                </span>
              ) : (
                <Link
                  to={lp(it.path)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-muted-foreground transition",
                    "hover:bg-primary/10 hover:text-primary",
                  )}
                >
                  <Icon className="h-3 w-3" /> {it.label}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ProgramsFooterLinks = ({ active }: { active: Active }) => {
  const lp = useLp();
  const { i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? i18n.language ?? "en";
  const copy = {
    en: { affiliates: "Affiliates", partners: "Partners", referral: "Referral", explore: "Explore our programs", title: "Three ways to earn lifetime BTC with MRC GlobalPay", affiliatesDesc: "Embed our swap widget. Marketing assets + dashboard.", partnersDesc: "Private dashboard, settlement reporting, negotiated rates.", referralDesc: "One simple link. No setup. Best for casual sharers.", program: "Program", current: "You are here", note: "All programs pay in BTC and operate under FINTRAC MSB #C100000015 and Bank of Canada PSP registration." },
    es: { affiliates: "Afiliados", partners: "Socios", referral: "Referidos", explore: "Explora nuestros programas", title: "Tres formas de ganar BTC de por vida con MRC GlobalPay", affiliatesDesc: "Incrusta nuestro widget de swap. Materiales de marketing + panel.", partnersDesc: "Panel privado, reportes de liquidación y tarifas negociadas.", referralDesc: "Un enlace simple. Sin configuración. Ideal para compartir casualmente.", program: "Programa", current: "Estás aquí", note: "Todos los programas pagan en BTC y operan bajo el registro FINTRAC MSB #C100000015 y el registro PSP del Banco de Canadá." },
    fr: { affiliates: "Affiliation", partners: "Partenaires", referral: "Parrainage", explore: "Découvrez nos programmes", title: "Trois façons de gagner du BTC à vie avec MRC GlobalPay", affiliatesDesc: "Intégrez notre widget de swap. Ressources marketing + tableau de bord.", partnersDesc: "Tableau de bord privé, rapports de règlement, tarifs négociés.", referralDesc: "Un lien simple. Aucun paramétrage. Idéal pour un partage occasionnel.", program: "Programme", current: "Vous êtes ici", note: "Tous les programmes paient en BTC et fonctionnent sous l'enregistrement FINTRAC MSB #C100000015 et l'enregistrement PSP de la Banque du Canada." },
  } as const;
  const text = copy[(lang in copy ? lang : "en") as keyof typeof copy] ?? copy.en;
  const localizedItems = items.map((item) => ({
    ...item,
    label: item.key === "affiliates" ? text.affiliates : item.key === "partners" ? text.partners : text.referral,
    desc: item.key === "affiliates" ? text.affiliatesDesc : item.key === "partners" ? text.partnersDesc : text.referralDesc,
  }));
  return (
    <section className="border-t border-border/60 bg-muted/20 py-10">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {text.explore}
          </p>
          <h2 className="mt-2 font-display text-xl font-bold text-foreground sm:text-2xl">
            {text.title}
          </h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {localizedItems.map((it) => {
              const Icon = it.icon;
              const isActive = it.key === active;
              return (
                <Link
                  key={it.key}
                  to={lp(it.path)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "rounded-xl border p-4 text-left transition",
                    isActive
                      ? "border-primary/40 bg-primary/5"
                      : "border-border bg-card hover:border-primary/40 hover:bg-primary/5",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    <span className="font-display text-sm font-semibold text-foreground">
                      {it.label} {text.program}
                    </span>
                    {isActive && (
                      <span className="ml-auto text-[10px] font-semibold uppercase text-primary">
                        {text.current}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{it.desc}</p>
                </Link>
              );
            })}
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            {text.note}
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProgramsNav;
