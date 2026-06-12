import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import { useLang } from "../context/LangContext.jsx";

const EMPTY = {
  business_name: "", address: "", zip_code: "",
  description: "", pickup_window: "", contact_phone: "",
};

/**
 * Real food-recovery programs & resources — static, verified, no API needed.
 * audience: business (donate surplus) | apps (discounted rescued food) |
 *           free (free community sharing) | stores (rescued-food stores)
 */
const PROGRAMS = [
  {
    name: "Careit", audience: "business", icon: "📱",
    link: "https://www.careitapp.com/",
    desc: {
      en: "Free app connecting restaurants and grocers with nonprofits for same-day surplus pickups. Donations are tax-deductible and liability-protected.",
      es: "App gratuita que conecta restaurantes y tiendas con organizaciones para recoger excedentes el mismo día. Donaciones deducibles de impuestos.",
      zh: "免费应用，连接餐厅、食品店与非营利组织当天取走剩余食物。捐赠可抵税并有责任保护。",
      vi: "Ứng dụng miễn phí kết nối nhà hàng, cửa hàng với tổ chức phi lợi nhuận để lấy thực phẩm dư trong ngày. Được khấu trừ thuế.",
      ko: "식당·식료품점과 비영리단체를 연결해 당일 잉여 식품 픽업을 돕는 무료 앱. 기부는 세금 공제 및 책임 보호 대상.",
      tl: "Libreng app na nag-uugnay sa mga restawran at grocery sa mga nonprofit para sa same-day pickups. Tax-deductible ang donasyon.",
    },
  },
  {
    name: "Chefs to End Hunger", audience: "business", icon: "👨‍🍳",
    link: "https://www.chefstoendhunger.org/",
    desc: {
      en: "LA program collecting prepared surplus food from restaurants, hotels, and caterers — repackaged into meals for shelters. Free pickup via existing delivery routes.",
      es: "Programa de LA que recoge comida preparada sobrante de restaurantes, hoteles y caterings — convertida en comidas para refugios. Recogida gratis.",
      zh: "洛杉矶项目，从餐厅、酒店和餐饮商收集剩余熟食 — 重新打包为庇护所餐食。通过现有配送路线免费取货。",
      vi: "Chương trình LA thu thực phẩm chế biến dư từ nhà hàng, khách sạn — đóng gói lại thành bữa ăn cho nơi tạm trú. Lấy hàng miễn phí.",
      ko: "식당, 호텔, 케이터링 업체의 잉여 조리 식품을 수거해 쉼터용 식사로 재포장하는 LA 프로그램. 무료 픽업.",
      tl: "Programa sa LA na kumukuha ng sobrang lutong pagkain mula sa mga restawran at hotel — ginagawang meals para sa shelters. Libreng pickup.",
    },
  },
  {
    name: "Replate", audience: "business", icon: "🔄",
    link: "https://www.replate.org/",
    desc: {
      en: "Schedule recurring surplus pickups for offices, caterers, and events. Operates across LA; provides impact reports for every donation.",
      es: "Programa recogidas recurrentes de excedentes para oficinas, caterings y eventos. Opera en LA; da reportes de impacto por cada donación.",
      zh: "为办公室、餐饮和活动安排定期剩余食物取货。覆盖洛杉矶；每次捐赠提供影响报告。",
      vi: "Đặt lịch lấy thực phẩm dư định kỳ cho văn phòng, tiệc và sự kiện. Hoạt động khắp LA; có báo cáo tác động.",
      ko: "사무실, 케이터링, 행사용 잉여 식품 정기 픽업 예약. LA 전역 운영; 기부마다 임팩트 리포트 제공.",
      tl: "Mag-schedule ng recurring pickups para sa opisina, caterer, at events. May impact reports bawat donasyon.",
    },
  },
  {
    name: "Too Good To Go", audience: "apps", icon: "🛍️",
    link: "https://www.toogoodtogo.com/en-us",
    desc: {
      en: "App selling end-of-day 'surprise bags' from bakeries, cafés, and restaurants at 1/3 the price — active all over LA. Rescue food AND save money.",
      es: "App que vende 'bolsas sorpresa' de fin de día de panaderías y restaurantes a 1/3 del precio — activa en todo LA. Rescata comida Y ahorra dinero.",
      zh: "应用出售面包店、咖啡馆和餐厅的'惊喜袋'，仅 1/3 价格 — 全洛杉矶可用。既救食物又省钱。",
      vi: "Ứng dụng bán 'túi bất ngờ' cuối ngày từ tiệm bánh, quán cà phê với giá 1/3 — hoạt động khắp LA. Cứu thực phẩm VÀ tiết kiệm tiền.",
      ko: "베이커리, 카페, 식당의 마감 '서프라이즈 백'을 1/3 가격에 판매하는 앱 — LA 전역에서 이용 가능.",
      tl: "App na nagbebenta ng end-of-day 'surprise bags' mula sa bakeries at restawran sa 1/3 ng presyo — available sa buong LA.",
    },
  },
  {
    name: "Misfits Market (Imperfect Foods)", audience: "apps", icon: "🥕",
    link: "https://www.misfitsmarket.com/",
    desc: {
      en: "Grocery delivery of 'ugly' produce and surplus pantry items at up to 40% off store prices. Rescued food, delivered weekly in CA.",
      es: "Entrega de productos 'feos' y excedentes con hasta 40% de descuento. Comida rescatada, entregada semanalmente en California.",
      zh: "配送'丑'农产品和过剩食品，最高比商店便宜 40%。获救食物，加州每周配送。",
      vi: "Giao rau củ 'xấu' và hàng dư với giá giảm tới 40%. Thực phẩm được cứu, giao hàng tuần tại CA.",
      ko: "'못생긴' 농산물과 잉여 식품을 최대 40% 할인 배송. 구조된 식품, 캘리포니아 주간 배송.",
      tl: "Grocery delivery ng 'pangit' na produce at surplus items na hanggang 40% mas mura. Lingguhang delivery sa CA.",
    },
  },
  {
    name: "World Harvest Food Bank", audience: "stores", icon: "🛒",
    link: "https://worldharvestla.org/",
    desc: {
      en: "Pay-what-you-can grocery store in LA stocked with rescued food — a cart full of groceries for a small donation, no eligibility ever.",
      es: "Tienda de paga-lo-que-puedas en LA con comida rescatada — un carrito lleno por una pequeña donación, sin requisitos.",
      zh: "洛杉矶'随心付'杂货店，货品为获救食物 — 小额捐款即可装满购物车，无任何资格要求。",
      vi: "Cửa hàng trả-tùy-tâm ở LA với thực phẩm được cứu — đầy xe hàng chỉ với khoản quyên góp nhỏ, không cần điều kiện.",
      ko: "구조된 식품으로 채워진 LA의 '형편껏 내는' 식료품점 — 적은 기부로 카트 가득, 자격 요건 없음.",
      tl: "Pay-what-you-can grocery sa LA na puno ng rescued food — isang kariton ng groceries para sa maliit na donasyon.",
    },
  },
  {
    name: "Olio", audience: "free", icon: "🏘️",
    link: "https://olioapp.com/",
    desc: {
      en: "Neighbor-to-neighbor app for sharing surplus food for free — leftover groceries, garden produce, extra meals. Works in any neighborhood.",
      es: "App entre vecinos para compartir comida sobrante gratis — víveres, productos del jardín, comidas extra. Funciona en cualquier vecindario.",
      zh: "邻里互助应用，免费分享剩余食物 — 多余食品、自家菜园产品、多做的饭菜。任何社区都能用。",
      vi: "Ứng dụng hàng xóm chia sẻ thực phẩm dư miễn phí — đồ ăn thừa, rau vườn, bữa ăn dư. Hoạt động ở mọi khu phố.",
      ko: "이웃끼리 잉여 음식을 무료로 나누는 앱 — 남는 식료품, 텃밭 농산물, 여분의 식사. 어느 동네서나 가능.",
      tl: "Neighbor-to-neighbor app para sa libreng pagbabahagi ng sobrang pagkain — groceries, ani sa garden, sobrang ulam.",
    },
  },
  {
    name: "Martie", audience: "apps", icon: "📦",
    link: "https://www.martie.com/",
    desc: {
      en: "California online grocer selling surplus and overstock pantry food at up to 70% off — ships anywhere in CA.",
      es: "Tienda en línea de California que vende excedentes de despensa con hasta 70% de descuento — envía a toda California.",
      zh: "加州在线杂货商，以最高 70% 折扣出售过剩食品 — 配送至全加州。",
      vi: "Cửa hàng trực tuyến California bán thực phẩm dư thừa giảm tới 70% — giao khắp CA.",
      ko: "잉여 및 재고 식품을 최대 70% 할인 판매하는 캘리포니아 온라인 식료품점 — CA 전역 배송.",
      tl: "Online grocer sa California na nagbebenta ng surplus na pagkain na hanggang 70% off — nagpapadala kahit saan sa CA.",
    },
  },
  {
    name: "Buy Nothing Project", audience: "free", icon: "🎁",
    link: "https://buynothingproject.org/",
    desc: {
      en: "Hyper-local groups where neighbors give away food and household items completely free. Find your neighborhood's group and just ask.",
      es: "Grupos locales donde vecinos regalan comida y artículos del hogar totalmente gratis. Encuentra el grupo de tu vecindario y pide.",
      zh: "超本地化社区群组，邻居们完全免费赠送食物和家居用品。找到您社区的群组直接提出请求。",
      vi: "Các nhóm địa phương nơi hàng xóm tặng thực phẩm và đồ gia dụng hoàn toàn miễn phí. Tìm nhóm khu phố của bạn và hỏi xin.",
      ko: "이웃들이 음식과 생활용품을 완전히 무료로 나누는 동네 그룹. 동네 그룹을 찾아 요청하세요.",
      tl: "Mga hyper-local na grupo kung saan namimigay ang mga kapitbahay ng pagkain at gamit nang libre. Hanapin ang grupo ng iyong lugar.",
    },
  },
  {
    name: "LA Community Fridges", audience: "free", icon: "🧊",
    link: "https://www.lacommunityfridges.com/",
    desc: {
      en: "Map of 24/7 free community fridges across LA — take what you need, leave what you can. No questions, no ID, ever.",
      es: "Mapa de refrigeradores comunitarios gratis 24/7 en LA — toma lo que necesites, deja lo que puedas. Sin preguntas, sin identificación.",
      zh: "洛杉矶 24/7 免费社区冰箱地图 — 按需取用，量力捐赠。无需提问，无需证件。",
      vi: "Bản đồ tủ lạnh cộng đồng miễn phí 24/7 khắp LA — lấy những gì bạn cần, để lại những gì có thể. Không hỏi, không cần ID.",
      ko: "LA 전역의 24/7 무료 커뮤니티 냉장고 지도 — 필요한 만큼 가져가고 가능한 만큼 남기세요. 질문도 신분증도 없습니다.",
      tl: "Mapa ng 24/7 libreng community fridges sa LA — kunin ang kailangan, mag-iwan kung kaya. Walang tanong, walang ID.",
    },
  },
  {
    name: "Grocery Outlet", audience: "stores", icon: "🏬",
    link: "https://www.groceryoutlet.com/",
    desc: {
      en: "Discount grocery chain selling surplus, overstock, and closeout food at 40-70% off — dozens of locations across LA County.",
      es: "Cadena de descuento que vende excedentes y liquidaciones de comida con 40-70% de descuento — docenas de tiendas en el condado de LA.",
      zh: "折扣杂货连锁店，以 40-70% 折扣出售过剩和清仓食品 — 洛杉矶县有数十家门店。",
      vi: "Chuỗi cửa hàng giảm giá bán thực phẩm dư thừa với giá giảm 40-70% — hàng chục địa điểm khắp Quận LA.",
      ko: "잉여 및 재고 정리 식품을 40-70% 할인 판매하는 할인 식료품 체인 — LA 카운티 전역 수십 개 매장.",
      tl: "Discount grocery chain na nagbebenta ng surplus na pagkain na 40-70% off — maraming branch sa LA County.",
    },
  },
];

// Descriptions for the 9 newer site languages, keyed by program name.
const EXTRA_DESCS = {
  "Careit": {
    hy: "Անվճար հավելված, որը կապում է ռեստորանները ոչ առևտրային կազմակերպությունների հետ՝ նույն օրը ավելցուկի վերցման համար: Նվիրատվությունները հարկային նվազեցման ենթակա են:",
    fa: "اپ رایگان که رستوران‌ها را به سازمان‌های خیریه برای دریافت مازاد همان روز وصل می‌کند. کمک‌ها مشمول کسر مالیاتی‌اند.",
    ru: "Бесплатное приложение, связывающее рестораны с НКО для вывоза излишков в тот же день. Пожертвования вычитаются из налогов.",
    ar: "تطبيق مجاني يربط المطاعم بالمنظمات لاستلام الفائض في نفس اليوم. التبرعات معفاة ضريبيًا.",
    hi: "मुफ़्त ऐप जो रेस्तरां को उसी दिन अतिरिक्त भोजन उठाने के लिए संस्थाओं से जोड़ता है। दान कर-कटौती योग्य।",
    ja: "レストランと非営利団体をつなぎ、当日中に余剰を回収する無料アプリ。寄付は税控除対象。",
    km: "កម្មវិធីឥតគិតថ្លៃភ្ជាប់ភោជនីយដ្ឋានជាមួយអង្គការដើម្បីយកអាហារសល់ក្នុងថ្ងៃតែមួយ។",
    th: "แอปฟรีเชื่อมร้านอาหารกับองค์กรไม่แสวงกำไรรับอาหารส่วนเกินวันเดียวกัน บริจาคลดหย่อนภาษีได้",
    fr: "Appli gratuite reliant restaurants et associations pour des collectes le jour même. Dons déductibles.",
  },
  "Chefs to End Hunger": {
    hy: "LA ծրագիր, որը հավաքում է պատրաստի ավելցուկ սնունդ ռեստորաններից և հյուրանոցներից՝ ապաստարանների ճաշերի համար: Անվճար վերցում:",
    fa: "برنامه LA که غذای پخته مازاد را از رستوران‌ها و هتل‌ها جمع‌آوری و برای پناهگاه‌ها بسته‌بندی می‌کند. دریافت رایگان.",
    ru: "Программа LA: собирает готовые излишки из ресторанов и отелей для приютов. Бесплатный вывоз.",
    ar: "برنامج في LA يجمع الطعام الجاهز الفائض من المطاعم والفنادق لوجبات الملاجئ. استلام مجاني.",
    hi: "LA कार्यक्रम जो रेस्तरां और होटलों से तैयार अतिरिक्त भोजन इकट्ठा कर आश्रयों के लिए भेजता है। मुफ़्त पिकअप।",
    ja: "レストランやホテルの調理済み余剰食品を回収し、シェルターの食事に。無料回収。",
    km: "កម្មវិធី LA ប្រមូលអាហារចម្អិនរួចពីភោជនីយដ្ឋាន និងសណ្ឋាគារសម្រាប់ជម្រក។ យកឥតគិតថ្លៃ។",
    th: "โครงการ LA รวบรวมอาหารปรุงสุกส่วนเกินจากร้านอาหารและโรงแรมไปเป็นมื้ออาหารให้ที่พักพิง รับฟรี",
    fr: "Programme LA collectant les plats préparés en surplus des restaurants et hôtels pour les refuges. Collecte gratuite.",
  },
  "Replate": {
    hy: "Պլանավորեք կրկնվող ավելցուկի վերցումներ գրասենյակների և միջոցառումների համար: Գործում է ամբողջ LA-ում:",
    fa: "برداشت‌های دوره‌ای مازاد برای دفاتر و رویدادها برنامه‌ریزی کنید. در سراسر LA فعال است.",
    ru: "Регулярный вывоз излишков для офисов и мероприятий. Работает по всему ЛА с отчётами о вкладе.",
    ar: "جدولة استلام دوري للفائض من المكاتب والفعاليات. يعمل عبر LA مع تقارير الأثر.",
    hi: "दफ़्तरों और आयोजनों के लिए नियमित अतिरिक्त भोजन पिकअप शेड्यूल करें। पूरे LA में सक्रिय।",
    ja: "オフィスやイベントの余剰を定期回収。LA全域対応、寄付ごとに報告書を提供。",
    km: "កំណត់ពេលយកអាហារសល់ជាប្រចាំសម្រាប់ការិយាល័យ និងព្រឹត្តិការណ៍។ ដំណើរការទូទាំង LA។",
    th: "นัดรับอาหารส่วนเกินประจำสำหรับออฟฟิศและงานอีเวนต์ ดำเนินการทั่ว LA",
    fr: "Planifiez des collectes récurrentes pour bureaux et événements. Actif dans tout LA avec rapports d'impact.",
  },
  "Too Good To Go": {
    hy: "Հավելված, որը վաճառում է «անակնկալ տոպրակներ» հացատներից և ռեստորաններից 1/3 գնով — ակտիվ ամբողջ LA-ում:",
    fa: "اپی که «کیسه‌های شگفتانه» نانوایی‌ها و رستوران‌ها را به یک‌سوم قیمت می‌فروشد — در سراسر LA فعال.",
    ru: "Приложение продаёт «сюрприз-пакеты» из пекарен и ресторанов за треть цены — по всему ЛА.",
    ar: "تطبيق يبيع «أكياس مفاجآت» من المخابز والمطاعم بثلث السعر — نشط في كل LA.",
    hi: "ऐप जो बेकरियों और रेस्तरां के 'सरप्राइज़ बैग' 1/3 कीमत पर बेचता है — पूरे LA में सक्रिय।",
    ja: "ベーカリーやレストランの「サプライズバッグ」を1/3価格で販売するアプリ — LA全域で利用可。",
    km: "កម្មវិធីលក់ «កាបូបភ្ញាក់ផ្អើល» ពីហាងនំប៉័ង និងភោជនីយដ្ឋានត្រឹម 1/3 តម្លៃ — សកម្មទូទាំង LA។",
    th: "แอปขาย 'ถุงเซอร์ไพรส์' จากเบเกอรี่และร้านอาหารราคา 1/3 — ใช้ได้ทั่ว LA",
    fr: "Appli vendant des « paniers surprise » de boulangeries et restos au tiers du prix — partout à LA.",
  },
  "Misfits Market (Imperfect Foods)": {
    hy: "«Տգեղ» մթերքի և ավելցուկի առաքում մինչև 40% զեղչով: Փրկված սնունդ, շաբաթական առաքում CA-ում:",
    fa: "تحویل میوه‌جات «نازیبا» و مازاد با تا ۴۰٪ تخفیف. غذای نجات‌یافته، تحویل هفتگی در کالیفرنیا.",
    ru: "Доставка «некрасивых» овощей и излишков со скидкой до 40%. Спасённая еда, еженедельно по Калифорнии.",
    ar: "توصيل منتجات «غير مثالية» وفائض بخصم حتى ٤٠٪. طعام منقذ، توصيل أسبوعي في كاليفورنيا.",
    hi: "'बदसूरत' उत्पाद और अतिरिक्त सामान 40% तक छूट पर डिलीवरी। बचाया खाना, CA में साप्ताहिक।",
    ja: "「不揃い」野菜や余剰品を最大40%オフで宅配。レスキュー食品、CA内毎週配達。",
    km: "ដឹកជញ្ជូនបន្លែ «មិនស្អាត» និងទំនិញសល់បញ្ចុះតម្លៃរហូតដល់ 40%។ ដឹកប្រចាំសប្តាហ៍ក្នុង CA។",
    th: "ส่งผัก 'หน้าตาไม่สวย' และของส่วนเกินลดถึง 40% อาหารกู้ภัย ส่งรายสัปดาห์ใน CA",
    fr: "Livraison de produits « moches » et surplus jusqu'à -40%. Aliments sauvés, livrés chaque semaine en CA.",
  },
  "Martie": {
    hy: "Կալիֆորնիական օնլայն խանութ, որը վաճառում է ավելցուկային մթերք մինչև 70% զեղչով — առաքում ամբողջ CA-ում:",
    fa: "فروشگاه آنلاین کالیفرنیا که مواد غذایی مازاد را تا ۷۰٪ تخفیف می‌فروشد — ارسال به سراسر CA.",
    ru: "Калифорнийский онлайн-магазин излишков со скидкой до 70% — доставка по всей Калифорнии.",
    ar: "متجر إلكتروني كاليفورني يبيع طعامًا فائضًا بخصم حتى ٧٠٪ — شحن لكل كاليفورنيا.",
    hi: "कैलिफ़ोर्निया का ऑनलाइन स्टोर जो अतिरिक्त सामान 70% तक छूट पर बेचता है — पूरे CA में शिपिंग।",
    ja: "余剰食品を最大70%オフで販売するカリフォルニアのオンラインストア — CA全域配送。",
    km: "ហាងអនឡាញកាលីហ្វ័រញ៉ាលក់អាហារសល់បញ្ចុះតម្លៃរហូតដល់ 70% — ដឹកគ្រប់ទីកន្លែងក្នុង CA។",
    th: "ร้านออนไลน์แคลิฟอร์เนียขายอาหารส่วนเกินลดถึง 70% — ส่งทั่ว CA",
    fr: "Épicerie en ligne californienne vendant les surplus jusqu'à -70% — livraison partout en CA.",
  },
  "Olio": {
    hy: "Հարևանների միջև հավելված՝ ավելցուկ սնունդն անվճար կիսելու համար: Գործում է ցանկացած թաղամասում:",
    fa: "اپ همسایه‌به‌همسایه برای اشتراک رایگان غذای مازاد. در هر محله‌ای کار می‌کند.",
    ru: "Приложение «сосед-соседу» для бесплатного обмена излишками еды. Работает в любом районе.",
    ar: "تطبيق بين الجيران لمشاركة الطعام الفائض مجانًا. يعمل في أي حي.",
    hi: "पड़ोसियों के बीच मुफ़्त अतिरिक्त भोजन साझा करने का ऐप। किसी भी मोहल्ले में काम करता है।",
    ja: "余った食品をご近所同士で無料シェアするアプリ。どの地域でも利用可。",
    km: "កម្មវិធីអ្នកជិតខាងចែករំលែកអាហារសល់ដោយឥតគិតថ្លៃ។ ដំណើរការគ្រប់សង្កាត់។",
    th: "แอปแบ่งปันอาหารส่วนเกินฟรีระหว่างเพื่อนบ้าน ใช้ได้ทุกย่าน",
    fr: "Appli de partage gratuit de surplus entre voisins. Fonctionne dans tout quartier.",
  },
  "Buy Nothing Project": {
    hy: "Տեղական խմբեր, որտեղ հարևանները բոլորովին անվճար նվիրում են սնունդ և կենցաղային իրեր:",
    fa: "گروه‌های محلی که همسایه‌ها غذا و وسایل خانه را کاملاً رایگان می‌بخشند. گروه محله‌تان را پیدا کنید.",
    ru: "Локальные группы, где соседи бесплатно отдают еду и вещи. Найдите свою группу и просто попросите.",
    ar: "مجموعات محلية يهدي فيها الجيران الطعام والأغراض مجانًا تمامًا. اعثر على مجموعة حيك واطلب.",
    hi: "स्थानीय समूह जहाँ पड़ोसी खाना और घरेलू सामान बिल्कुल मुफ़्त देते हैं। अपने मोहल्ले का समूह खोजें।",
    ja: "ご近所が食品や日用品を完全無料で譲り合う地域グループ。お住まいの地区のグループを探して。",
    km: "ក្រុមតំបន់ដែលអ្នកជិតខាងផ្តល់អាហារ និងរបស់របរដោយឥតគិតថ្លៃទាំងស្រុង។",
    th: "กลุ่มท้องถิ่นที่เพื่อนบ้านแจกอาหารและของใช้ฟรีทั้งหมด หากลุ่มย่านของคุณแล้วขอได้เลย",
    fr: "Groupes hyper-locaux où les voisins donnent nourriture et objets gratuitement. Trouvez votre groupe.",
  },
  "LA Community Fridges": {
    hy: "24/7 անվճար համայնքային սառնարանների քարտեզ ամբողջ LA-ում — վերցրեք ինչ պետք է: Առանց հարցերի, առանց ID-ի:",
    fa: "نقشه یخچال‌های اجتماعی رایگان ۲۴/۷ در LA — هر چه نیاز دارید بردارید. بدون سؤال، بدون مدرک.",
    ru: "Карта бесплатных холодильников 24/7 по всему ЛА — берите что нужно. Без вопросов, без документов.",
    ar: "خريطة ثلاجات مجتمعية مجانية ٢٤/٧ عبر LA — خذ ما تحتاج. بلا أسئلة، بلا هوية.",
    hi: "पूरे LA में 24/7 मुफ़्त सामुदायिक फ्रिज का नक्शा — जो चाहिए लें। बिना सवाल, बिना ID।",
    ja: "LA全域の24時間無料コミュニティ冷蔵庫マップ — 必要な分をどうぞ。質問なし、身分証不要。",
    km: "ផែនទីទូទឹកកកសហគមន៍ឥតគិតថ្លៃ 24/7 ទូទាំង LA — យកអ្វីដែលត្រូវការ។ គ្មានសំណួរ គ្មាន ID។",
    th: "แผนที่ตู้เย็นชุมชนฟรี 24/7 ทั่ว LA — หยิบที่ต้องการได้เลย ไม่มีคำถาม ไม่ใช้บัตร",
    fr: "Carte des frigos communautaires gratuits 24/7 à LA — prenez ce qu'il vous faut. Sans questions, sans pièce d'identité.",
  },
  "World Harvest Food Bank": {
    hy: "«Վճարիր ինչքան կարող ես» խանութ LA-ում՝ լի փրկված սննդով — լիքը սայլակ փոքր նվիրատվությամբ:",
    fa: "فروشگاه «هرچه می‌توانی بپرداز» در LA پر از غذای نجات‌یافته — یک سبد کامل با کمک ناچیز، بدون شرایط.",
    ru: "Магазин «плати сколько можешь» в ЛА со спасённой едой — полная тележка за небольшое пожертвование.",
    ar: "متجر «ادفع ما تستطيع» في LA مليء بالطعام المنقذ — عربة كاملة مقابل تبرع صغير، بلا شروط.",
    hi: "'जितना दे सको दो' स्टोर LA में बचाए खाने से भरा — छोटे दान में पूरी ट्रॉली, कोई शर्त नहीं।",
    ja: "「払える分だけ」のLAの店、レスキュー食品が満載 — 少額の寄付でカートいっぱい。条件なし。",
    km: "ហាង «បង់តាមលទ្ធភាព» ក្នុង LA ពោរពេញដោយអាហារសង្គ្រោះ — រទេះពេញមួយដោយការបរិច្ចាគតិចតួច។",
    th: "ร้าน 'จ่ายตามกำลัง' ใน LA เต็มไปด้วยอาหารกู้ภัย — รถเข็นเต็มคันด้วยเงินบริจาคเล็กน้อย ไม่มีเงื่อนไข",
    fr: "Épicerie « payez ce que vous pouvez » à LA remplie d'aliments sauvés — un chariot plein pour un petit don.",
  },
  "Grocery Outlet": {
    hy: "Զեղչային խանութների ցանց՝ ավելցուկային սնունդ 40-70% զեղչով — տասնյակ խանութներ LA շրջանում:",
    fa: "زنجیره فروشگاه تخفیفی با غذای مازاد ۴۰-۷۰٪ ارزان‌تر — ده‌ها شعبه در شهرستان LA.",
    ru: "Сеть дисконт-магазинов с излишками на 40-70% дешевле — десятки точек в округе ЛА.",
    ar: "سلسلة متاجر مخفضة تبيع الفائض بخصم ٤٠-٧٠٪ — عشرات الفروع في مقاطعة LA.",
    hi: "डिस्काउंट किराना चेन जो अतिरिक्त सामान 40-70% छूट पर बेचती है — LA काउंटी में दर्जनों दुकानें।",
    ja: "余剰・在庫処分食品を40〜70%オフで販売するディスカウントチェーン — LA郡に多数店舗。",
    km: "ខ្សែសង្វាក់ហាងបញ្ចុះតម្លៃលក់អាហារសល់ 40-70% ថោកជាង — ហាងរាប់សិបក្នុង LA County។",
    th: "เชนร้านขายของชำลดราคาขายของส่วนเกินถูกลง 40-70% — หลายสิบสาขาทั่ว LA County",
    fr: "Chaîne discount vendant surplus et fins de série à -40-70% — des dizaines de magasins dans le comté de LA.",
  },
};

const AUDIENCE_FILTERS = [
  { key: "all",      tKey: "cat_all",      icon: "✨" },
  { key: "business", tKey: "frp_business", icon: "🏪" },
  { key: "apps",     tKey: "frp_apps",     icon: "📱" },
  { key: "free",     tKey: "frp_free",     icon: "🆓" },
  { key: "stores",   tKey: "frp_stores",   icon: "🏬" },
];

export default function FoodRecovery() {
  const { user } = useAuth();
  const { t, lang } = useLang();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  // Multi-select: empty set = "All".
  const [auds, setAuds] = useState(new Set());

  const load = async () => setRows(await api.foodListings());
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const post = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.createFoodListing(form);
      setForm(EMPTY);
      setShowForm(false);
      await load();
    } catch (err) { setError(err.message); }
  };

  const claim = async (id) => {
    try { await api.claimFoodListing(id); await load(); }
    catch (err) { setError(err.message); }
  };

  const toggleAud = (key) => {
    if (key === "all") { setAuds(new Set()); return; }
    const next = new Set(auds);
    next.has(key) ? next.delete(key) : next.add(key);
    setAuds(next);
  };

  const filtered = auds.size === 0 ? PROGRAMS : PROGRAMS.filter((p) => auds.has(p.audience));

  return (
    <div className="page">
      <h2>♻️ {t("foodRecovery")}</h2>
      <p className="muted">{t("foodRecoveryIntro")}</p>

      {/* ---- Live community board ---- */}
      {user ? (
        <button className="btn primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? t("cancel") : t("postFood")}
        </button>
      ) : (
        <p className="muted">🔑 {t("login")} →</p>
      )}

      {showForm && (
        <form className="card-form" onSubmit={post}>
          <input placeholder={t("businessName")} value={form.business_name} onChange={set("business_name")} required />
          <input placeholder={t("address")} value={form.address} onChange={set("address")} required />
          <input placeholder={t("zip")} value={form.zip_code} onChange={set("zip_code")} maxLength={5} required />
          <textarea placeholder={t("description")} value={form.description} onChange={set("description")} required />
          <input placeholder={t("pickupWindow")} value={form.pickup_window} onChange={set("pickup_window")} required />
          <input placeholder={t("phone")} value={form.contact_phone} onChange={set("contact_phone")} />
          {error && <p className="error">{error}</p>}
          <button className="btn primary" type="submit">{t("submit")}</button>
        </form>
      )}

      <div className="list" style={{ marginTop: "1rem" }}>
        {rows.map((r) => (
          <article key={r.id} className="resource-card">
            <header>
              <h3>{r.business_name}</h3>
              <span className={`badge ${r.status === "open" ? "ok" : "cat"}`}>
                {r.status === "open"
                  ? t("statusOpen")
                  : user && r.claimed_by_user_id === user.id
                    ? `✓ ${t("donors_claimedByYou")}`
                    : `✓ ${t("donors_claimedBadge")}`}
              </span>
            </header>
            <p>{r.address} • {r.zip_code}</p>
            <p>{r.description}</p>
            <p><strong>{t("pickupWindow")}:</strong> {r.pickup_window}</p>
            {r.contact_phone && <p><strong>{t("phone")}:</strong> {r.contact_phone}</p>}
            {user && r.status === "open" && (
              <button className="btn primary" onClick={() => claim(r.id)}>{t("claim")}</button>
            )}
          </article>
        ))}
        {rows.length === 0 && <p className="muted">{t("noListings")}</p>}
      </div>

      {/* ---- Real programs (static, Youth-style) ---- */}
      <section style={{ marginTop: "2rem" }}>
        <h3>🌟 {t("frp_title")}</h3>
        <div className="category-pills">
          {AUDIENCE_FILTERS.map((f) => (
            <button
              key={f.key}
              className={`pill ${(f.key === "all" ? auds.size === 0 : auds.has(f.key)) ? "active" : ""}`}
              onClick={() => toggleAud(f.key)}
            >
              <span aria-hidden>{f.icon}</span> {t(f.tKey)}
            </button>
          ))}
        </div>
        <div className="list">
          {filtered.map((p) => (
            <article key={p.name} className="resource-card">
              <header>
                <div className="rc-title">
                  <span className="rc-icon" aria-hidden>{p.icon}</span>
                  <h3>{p.name}</h3>
                </div>
                <span className="badge cat">
                  {t(AUDIENCE_FILTERS.find((f) => f.key === p.audience)?.tKey || "cat_all")}
                </span>
              </header>
              <p>{p.desc[lang] ?? EXTRA_DESCS[p.name]?.[lang] ?? p.desc.en}</p>
              <a href={p.link} target="_blank" rel="noreferrer" className="btn">{t("learnMore")}</a>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
