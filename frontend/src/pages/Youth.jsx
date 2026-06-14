import { useState } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../context/LangContext.jsx";

/**
 * Youth-focused programs. Real programs with real links; descriptions
 * translated inline (these are static content, not DB rows).
 */
const PROGRAMS = [
  {
    name: "Head Start & Early Head Start",
    age: "under5", icon: "🧸",
    link: "https://prekkid.org/",
    desc: {
      en: "Free preschool with free meals for kids 0-5 from low-income families. Immigration status is never asked. Also supports pregnant parents.",
      es: "Preescolar gratis con comidas gratis para niños de 0 a 5 de familias de bajos ingresos. Nunca preguntan estatus migratorio. También apoya a padres embarazados.",
      zh: "为低收入家庭 0-5 岁儿童提供免费学前班和免费餐食。从不询问移民身份。也支持怀孕的父母。",
      vi: "Mầm non miễn phí kèm bữa ăn miễn phí cho trẻ 0-5 tuổi từ gia đình thu nhập thấp. Không bao giờ hỏi tình trạng nhập cư. Cũng hỗ trợ cha mẹ đang mang thai.",
      ko: "저소득 가정의 0-5세 아동을 위한 무료 유아원과 무료 급식. 이민 신분을 절대 묻지 않습니다. 임신한 부모도 지원합니다.",
      tl: "Libreng preschool na may libreng pagkain para sa batang 0-5 mula sa low-income na pamilya. Hindi tinatanong ang immigration status. Sinusuportahan din ang mga buntis.",
    },
  },
  {
    name: "Baby2Baby",
    age: "under5", icon: "👶",
    link: "https://baby2baby.org/",
    desc: {
      en: "Diapers, formula, baby food, and clothing for families in need, distributed through schools, clinics, and shelters across LA.",
      es: "Pañales, fórmula, comida para bebés y ropa para familias necesitadas, distribuidos a través de escuelas, clínicas y refugios en LA.",
      zh: "通过洛杉矶各地的学校、诊所和庇护所，为有需要的家庭分发尿布、配方奶、婴儿食品和衣物。",
      vi: "Tã, sữa công thức, thức ăn em bé và quần áo cho gia đình khó khăn, phân phát qua trường học, phòng khám và nơi tạm trú khắp LA.",
      ko: "기저귀, 분유, 이유식, 의류를 LA 전역의 학교, 클리닉, 쉼터를 통해 필요한 가정에 전달합니다.",
      tl: "Diapers, formula, baby food, at damit para sa mga pamilyang nangangailangan, ipinamamahagi sa mga paaralan, clinic, at shelter sa LA.",
    },
  },
  {
    name: "WIC (Women, Infants & Children)",
    age: "under5", icon: "🍼",
    link: "https://www.phfewic.org/",
    desc: {
      en: "Groceries, formula, and nutrition help for pregnant people and kids under 5. Undocumented parents CAN apply for their U.S.-citizen kids.",
      es: "Comestibles, fórmula y ayuda nutricional para embarazadas y niños menores de 5. Padres indocumentados SÍ pueden aplicar para sus hijos ciudadanos.",
      zh: "为孕妇和 5 岁以下儿童提供食品、配方奶和营养帮助。无证父母可以为其美国公民子女申请。",
      vi: "Thực phẩm, sữa công thức và hỗ trợ dinh dưỡng cho người mang thai và trẻ dưới 5 tuổi. Cha mẹ không giấy tờ VẪN có thể đăng ký cho con là công dân Mỹ.",
      ko: "임산부와 5세 미만 아동을 위한 식료품, 분유, 영양 지원. 미등록 부모도 미국 시민권자 자녀를 위해 신청 가능합니다.",
      tl: "Groceries, formula, at nutrition help para sa mga buntis at batang wala pang 5. PWEDENG mag-apply ang undocumented na magulang para sa anak na US citizen.",
    },
  },
  {
    name: "Free School Breakfast & Lunch (LAUSD)",
    age: "k12", icon: "🏫",
    link: "https://food.lausd.org/",
    desc: {
      en: "Every LAUSD student eats breakfast AND lunch free — no application, no questions. California serves free school meals to ALL students regardless of income or status.",
      es: "Todo estudiante de LAUSD desayuna Y almuerza gratis — sin solicitud, sin preguntas. California da comidas escolares gratis a TODOS los estudiantes sin importar ingresos o estatus.",
      zh: "每位 LAUSD 学生都可免费享用早餐和午餐 — 无需申请，无需提问。加州为所有学生提供免费校餐，不论收入或身份。",
      vi: "Mọi học sinh LAUSD đều được ăn sáng VÀ trưa miễn phí — không cần đơn, không hỏi. California phục vụ bữa ăn miễn phí cho TẤT CẢ học sinh bất kể thu nhập hay tình trạng.",
      ko: "모든 LAUSD 학생은 아침과 점심을 무료로 먹습니다 — 신청도 질문도 없습니다. 캘리포니아는 소득이나 신분에 관계없이 모든 학생에게 무료 급식을 제공합니다.",
      tl: "Lahat ng estudyante ng LAUSD ay libreng almusal AT tanghalian — walang application, walang tanong. Libre ang school meals sa California para sa LAHAT ng estudyante.",
    },
  },
  {
    name: "SUN Bucks (Summer EBT)",
    age: "k12", icon: "☀️",
    link: "https://www.cdss.ca.gov/sunbucks",
    desc: {
      en: "$120 per child in summer grocery money, loaded on an EBT card. Most kids who get free school meals qualify automatically — watch the mail in late spring.",
      es: "$120 por niño en dinero para comestibles de verano, cargado en una tarjeta EBT. La mayoría de niños con comidas escolares gratis califican automáticamente.",
      zh: "每名儿童 120 美元的夏季食品补助，充值到 EBT 卡。大多数享受免费校餐的孩子自动符合资格 — 春末留意邮件。",
      vi: "$120 mỗi trẻ cho tiền thực phẩm mùa hè, nạp vào thẻ EBT. Hầu hết trẻ nhận bữa ăn miễn phí ở trường tự động đủ điều kiện.",
      ko: "여름 식료품비로 아동 1인당 $120를 EBT 카드에 지급. 무료 급식을 받는 대부분의 아이들은 자동으로 자격이 됩니다.",
      tl: "$120 bawat bata na pang-grocery sa summer, naka-load sa EBT card. Karamihan ng batang may libreng school meals ay automatic na kwalipikado.",
    },
  },
  {
    name: "Summer Food Service Program (SFSP)",
    age: "k12", icon: "🌳",
    link: "https://www.cde.ca.gov/ls/nu/sf/",
    desc: {
      en: "Free meals at parks, libraries, and community centers all summer. Kids 18 and under just show up — no sign-up, no ID.",
      es: "Comidas gratis en parques, bibliotecas y centros comunitarios todo el verano. Niños de 18 o menos solo llegan — sin registro, sin identificación.",
      zh: "整个夏天在公园、图书馆和社区中心提供免费餐食。18 岁及以下直接前往即可 — 无需报名，无需证件。",
      vi: "Bữa ăn miễn phí tại công viên, thư viện, trung tâm cộng đồng suốt mùa hè. Trẻ 18 tuổi trở xuống chỉ cần đến — không đăng ký, không cần ID.",
      ko: "여름 내내 공원, 도서관, 커뮤니티 센터에서 무료 식사. 18세 이하는 그냥 방문하면 됩니다 — 등록도 신분증도 불필요.",
      tl: "Libreng pagkain sa mga parke, library, at community center buong summer. Pumunta lang ang batang 18 pababa — walang sign-up, walang ID.",
    },
  },
  {
    name: "After-School Snack & Supper (CACFP)",
    age: "k12", icon: "🥪",
    link: "https://www.cde.ca.gov/ls/nu/as/index.asp",
    desc: {
      en: "Free snacks and supper at after-school programs, Boys & Girls Clubs, and rec centers.",
      es: "Meriendas y cena gratis en programas después de clases, Boys & Girls Clubs y centros recreativos.",
      zh: "课后项目、Boys & Girls Clubs 和活动中心提供免费点心和晚餐。",
      vi: "Đồ ăn nhẹ và bữa tối miễn phí tại chương trình sau giờ học, Boys & Girls Clubs và trung tâm giải trí.",
      ko: "방과후 프로그램, Boys & Girls Club, 레크리에이션 센터에서 무료 간식과 저녁 제공.",
      tl: "Libreng snacks at hapunan sa after-school programs, Boys & Girls Clubs, at rec centers.",
    },
  },
  {
    name: "Lunch at the Library (LA County Library)",
    age: "k12", icon: "📚",
    link: "https://lacountylibrary.org/lunch-at-the-library/",
    desc: {
      en: "Free lunch + activities at LA County libraries every summer weekday. Kids and teens 18 and under, no sign-up.",
      es: "Almuerzo gratis + actividades en bibliotecas del condado de LA todos los días de verano. Niños y adolescentes de 18 o menos, sin registro.",
      zh: "整个夏天工作日在洛杉矶县图书馆提供免费午餐和活动。18 岁及以下儿童和青少年，无需报名。",
      vi: "Bữa trưa miễn phí + hoạt động tại thư viện Quận LA mỗi ngày trong tuần mùa hè. Trẻ em và thiếu niên 18 tuổi trở xuống, không cần đăng ký.",
      ko: "여름 평일마다 LA 카운티 도서관에서 무료 점심과 활동 제공. 18세 이하 어린이와 청소년, 등록 불필요.",
      tl: "Libreng tanghalian + activities sa mga LA County library tuwing summer weekday. Para sa batang 18 pababa, walang sign-up.",
    },
  },
  {
    name: "Boys & Girls Clubs of Metro LA",
    age: "k12", icon: "🏀",
    link: "https://www.bgcmla.org/",
    desc: {
      en: "Low-cost after-school programs with free hot supper, homework help, and sports across LA neighborhoods.",
      es: "Programas después de clases de bajo costo con cena caliente gratis, ayuda con tareas y deportes en vecindarios de LA.",
      zh: "洛杉矶各社区低价课后项目，提供免费热晚餐、作业辅导和体育活动。",
      vi: "Chương trình sau giờ học chi phí thấp với bữa tối nóng miễn phí, hỗ trợ bài tập và thể thao khắp các khu LA.",
      ko: "LA 곳곳에서 무료 따뜻한 저녁, 숙제 도움, 스포츠가 포함된 저비용 방과후 프로그램.",
      tl: "Murang after-school programs na may libreng mainit na hapunan, tulong sa homework, at sports sa mga LA neighborhood.",
    },
  },
  {
    name: "My Friend's Place",
    age: "teen", icon: "🏠",
    link: "https://myfriendsplace.org/",
    desc: {
      en: "Hollywood drop-in center for youth 12-25 experiencing homelessness: hot meals, showers, clothing, and case management. No questions, no judgment.",
      es: "Centro en Hollywood para jóvenes de 12 a 25 sin hogar: comidas calientes, duchas, ropa y gestión de casos. Sin preguntas, sin juicio.",
      zh: "好莱坞为 12-25 岁无家可归青少年提供的中心：热餐、淋浴、衣物和个案管理。不提问，不评判。",
      vi: "Trung tâm ở Hollywood cho thanh thiếu niên 12-25 tuổi vô gia cư: bữa ăn nóng, tắm rửa, quần áo và quản lý hồ sơ. Không hỏi, không phán xét.",
      ko: "노숙을 겪는 12-25세 청소년을 위한 할리우드 드롭인 센터: 따뜻한 식사, 샤워, 의류, 사례 관리. 질문도 판단도 없습니다.",
      tl: "Drop-in center sa Hollywood para sa kabataang 12-25 na walang tirahan: mainit na pagkain, shower, damit, at case management. Walang tanong, walang panghuhusga.",
    },
  },
  {
    name: "Safe Place for Youth (SPY)",
    age: "teen", icon: "🌊",
    link: "https://www.safeplaceforyouth.org/",
    desc: {
      en: "Venice-based services for youth 12-25: meals, health care, education support, and housing navigation.",
      es: "Servicios en Venice para jóvenes de 12 a 25: comidas, atención médica, apoyo educativo y navegación de vivienda.",
      zh: "位于 Venice，为 12-25 岁青少年提供餐食、医疗、教育支持和住房协助。",
      vi: "Dịch vụ tại Venice cho thanh thiếu niên 12-25 tuổi: bữa ăn, chăm sóc sức khỏe, hỗ trợ giáo dục và tìm nhà ở.",
      ko: "베니스 기반 12-25세 청소년 서비스: 식사, 의료, 교육 지원, 주거 안내.",
      tl: "Mga serbisyo sa Venice para sa kabataang 12-25: pagkain, health care, suporta sa edukasyon, at tulong sa pabahay.",
    },
  },
  {
    name: "Covenant House California",
    age: "teen", icon: "🛏️",
    link: "https://covenanthousecalifornia.org/",
    desc: {
      en: "Shelter, three meals a day, and job programs for young people 18-24 facing homelessness. Hollywood location, doors open 24/7.",
      es: "Refugio, tres comidas al día y programas de empleo para jóvenes de 18 a 24 sin hogar. Ubicado en Hollywood, abierto 24/7.",
      zh: "为 18-24 岁无家可归的年轻人提供住所、一日三餐和就业项目。位于好莱坞，24/7 开放。",
      vi: "Nơi ở, ba bữa ăn mỗi ngày và chương trình việc làm cho thanh niên 18-24 tuổi vô gia cư. Tại Hollywood, mở cửa 24/7.",
      ko: "노숙 위기의 18-24세 청년을 위한 쉼터, 하루 세 끼 식사, 취업 프로그램. 할리우드 위치, 24/7 운영.",
      tl: "Shelter, tatlong beses na pagkain kada araw, at job programs para sa kabataang 18-24 na walang tirahan. Sa Hollywood, bukas 24/7.",
    },
  },
  {
    name: "Swipe Out Hunger",
    age: "college", icon: "🎓",
    link: "https://www.swipehunger.org/",
    desc: {
      en: "Free meal swipes donated by classmates at colleges across SoCal. Ask your campus basic-needs center.",
      es: "Comidas gratis donadas por compañeros en universidades del Sur de California. Pregunta en el centro de necesidades básicas de tu campus.",
      zh: "南加州各大学同学捐赠的免费餐券。请咨询校园基本需求中心。",
      vi: "Suất ăn miễn phí do bạn học quyên góp tại các trường đại học khắp SoCal. Hỏi trung tâm nhu cầu cơ bản của trường.",
      ko: "남부 캘리포니아 대학에서 학우들이 기부한 무료 식권. 캠퍼스 기본 생활 지원 센터에 문의하세요.",
      tl: "Libreng meal swipes na donated ng mga kaklase sa mga college sa SoCal. Magtanong sa campus basic-needs center.",
    },
  },
  {
    name: "Campus Food Pantries (UCLA, CSULB, community colleges)",
    age: "college", icon: "🛒",
    link: "https://cpo.ucla.edu/",
    desc: {
      en: "Almost every SoCal campus now runs a free student pantry — UCLA Food Closet, CSULB Beach Pantry, and most community colleges. Anonymous, no proof of need.",
      es: "Casi todo campus del Sur de California tiene una despensa estudiantil gratis — UCLA, CSULB y la mayoría de colegios comunitarios. Anónimo, sin prueba de necesidad.",
      zh: "南加州几乎每个校园都有免费学生食物站 — UCLA、CSULB 和大多数社区大学。匿名，无需证明需求。",
      vi: "Hầu hết các trường ở SoCal đều có kho thực phẩm sinh viên miễn phí — UCLA, CSULB và các trường cao đẳng cộng đồng. Ẩn danh, không cần chứng minh.",
      ko: "남부 캘리포니아 거의 모든 캠퍼스에 무료 학생 팬트리가 있습니다 — UCLA, CSULB 및 대부분의 커뮤니티 칼리지. 익명, 증명 불필요.",
      tl: "Halos lahat ng campus sa SoCal ay may libreng student pantry — UCLA, CSULB, at karamihan ng community colleges. Anonymous, walang proof of need.",
    },
  },
  {
    name: "CalFresh for College Students",
    age: "college", icon: "💳",
    link: "https://www.getcalfresh.org/en/students",
    desc: {
      en: "Many students DO qualify for CalFresh (up to $292/month for groceries) — work-study, EOPS, or 20+ hrs/week work all count. Worth a 10-minute application.",
      es: "Muchos estudiantes SÍ califican para CalFresh (hasta $292/mes en comestibles) — work-study, EOPS o trabajar 20+ hrs/semana cuentan. Vale la pena aplicar.",
      zh: "许多学生其实符合 CalFresh 资格（每月最多 $292 食品补助）— 勤工俭学、EOPS 或每周工作 20 小时以上均可。值得花 10 分钟申请。",
      vi: "Nhiều sinh viên ĐỦ điều kiện CalFresh (tới $292/tháng tiền thực phẩm) — work-study, EOPS hoặc làm việc 20+ giờ/tuần đều được tính. Đáng để nộp đơn 10 phút.",
      ko: "많은 학생들이 CalFresh 자격이 됩니다 (월 최대 $292 식료품비) — 근로장학, EOPS, 주 20시간 이상 근무 모두 인정. 10분 신청할 가치가 있습니다.",
      tl: "Maraming estudyante ang kwalipikado sa CalFresh (hanggang $292/buwan) — bilang ang work-study, EOPS, o 20+ oras na trabaho kada linggo. Sulit ang 10-minutong application.",
    },
  },
  {
    name: "EOPS / CARE (Community Colleges)",
    age: "college", icon: "🧾",
    link: "https://icangotocollege.com/financial-aid",
    desc: {
      en: "Extra grants, food vouchers, book money, and counseling for low-income community college students. Single parents get extra support through CARE.",
      es: "Becas extra, vales de comida, dinero para libros y consejería para estudiantes de colegios comunitarios de bajos ingresos. Padres solteros reciben apoyo extra con CARE.",
      zh: "为低收入社区大学学生提供额外补助、食品券、书本费和辅导。单亲家长可通过 CARE 获得额外支持。",
      vi: "Trợ cấp thêm, phiếu thực phẩm, tiền sách và tư vấn cho sinh viên cao đẳng cộng đồng thu nhập thấp. Cha mẹ đơn thân được hỗ trợ thêm qua CARE.",
      ko: "저소득 커뮤니티 칼리지 학생을 위한 추가 보조금, 식품 바우처, 도서비, 상담. 한부모는 CARE를 통해 추가 지원을 받습니다.",
      tl: "Dagdag na grants, food vouchers, pambili ng libro, at counseling para sa low-income na community college students. May dagdag na suporta ang single parents sa CARE.",
    },
  },
  {
    name: "Volunteer & Earn Service Hours",
    age: "teen", icon: "⭐",
    link: "/food-recovery",
    internal: true,
    desc: {
      en: "Teens: food banks and our Food Recovery network count toward school community-service hours. Help your neighborhood and your college apps at the same time.",
      es: "Adolescentes: los bancos de comida y nuestra red de Recuperación de Alimentos cuentan para horas de servicio comunitario escolar. Ayuda a tu vecindario y a tus aplicaciones universitarias a la vez.",
      zh: "青少年：食物银行和我们的剩食回收网络可计入学校社区服务时数。同时帮助社区和大学申请。",
      vi: "Thanh thiếu niên: ngân hàng thực phẩm và mạng lưới Thu hồi Thực phẩm được tính giờ phục vụ cộng đồng của trường. Vừa giúp khu phố vừa đẹp hồ sơ đại học.",
      ko: "청소년: 푸드뱅크와 음식 회수 네트워크 활동은 학교 봉사 시간으로 인정됩니다. 동네도 돕고 대학 지원서도 채우세요.",
      tl: "Teens: bilang sa school community-service hours ang food banks at ang aming Food Recovery network. Tulungan ang kapitbahayan at ang college apps mo nang sabay.",
    },
  },
];

// Descriptions for the 9 newer site languages, keyed by program name.
// Render falls back: desc[lang] → EXTRA_DESCS → English.
const EXTRA_DESCS = {
  "Head Start & Early Head Start": {
    hy: "Անվճար մանկապարտեզ՝ անվճար սննդով 0-5 տարեկանների համար: Ներգաղթի կարգավիճակը երբեք չի հարցվում:",
    fa: "پیش‌دبستانی رایگان با غذای رایگان برای کودکان ۰-۵ سال. وضعیت مهاجرتی هرگز پرسیده نمی‌شود.",
    ru: "Бесплатный детсад с питанием для детей 0-5 лет из малообеспеченных семей. Статус никогда не спрашивают.",
    ar: "روضة مجانية مع وجبات مجانية للأطفال ٠-٥ سنوات. لا يُسأل عن وضع الهجرة أبدًا.",
    hi: "0-5 साल के बच्चों के लिए मुफ़्त भोजन के साथ मुफ़्त प्रीस्कूल। आप्रवासन स्थिति कभी नहीं पूछी जाती।",
    ja: "0〜5歳児向けの無料給食付きプリスクール。移民ステータスは一切問われません。",
    km: "មត្តេយ្យឥតគិតថ្លៃជាមួយអាហារឥតគិតថ្លៃសម្រាប់កុមារ ០-៥ ឆ្នាំ។ មិនដែលសួរស្ថានភាពអន្តោប្រវេសន៍ទេ។",
    th: "เตรียมอนุบาลฟรีพร้อมอาหารฟรีสำหรับเด็ก 0-5 ปี ไม่เคยถามสถานะการเข้าเมือง",
    fr: "Préscolaire gratuit avec repas pour les 0-5 ans. Le statut migratoire n'est jamais demandé.",
  },
  "Baby2Baby": {
    hy: "Տակդիրներ, կաթնախառնուրդ, մանկական սնունդ և հագուստ կարիքավոր ընտանիքների համար:",
    fa: "پوشک، شیرخشک، غذای کودک و لباس برای خانواده‌های نیازمند در سراسر لس‌آنجلس.",
    ru: "Подгузники, смеси, детское питание и одежда для нуждающихся семей по всему ЛА.",
    ar: "حفاضات وحليب وأغذية أطفال وملابس للعائلات المحتاجة عبر لوس أنجلوس.",
    hi: "ज़रूरतमंद परिवारों के लिए डायपर, फ़ॉर्मूला, बेबी फ़ूड और कपड़े।",
    ja: "おむつ・粉ミルク・ベビーフード・衣類をLA全域の必要な家庭に配布。",
    km: "ខោទឹកនោម ទឹកដោះគោម្សៅ អាហារទារក និងសម្លៀកបំពាក់សម្រាប់គ្រួសារខ្វះខាត។",
    th: "ผ้าอ้อม นมผง อาหารเด็ก และเสื้อผ้าสำหรับครอบครัวที่ขัดสนทั่ว LA",
    fr: "Couches, lait infantile, petits pots et vêtements pour familles dans le besoin à LA.",
  },
  "WIC (Women, Infants & Children)": {
    hy: "Մթերք և սննդային օգնություն հղիների և մինչև 5 տարեկան երեխաների համար: Փաստաթղթազուրկ ծնողները ԿԱՐՈՂ ԵՆ դիմել իրենց քաղաքացի երեխաների համար:",
    fa: "خواروبار و کمک تغذیه برای بارداران و کودکان زیر ۵ سال. والدین بدون مدرک می‌توانند برای فرزندان شهروندشان درخواست دهند.",
    ru: "Продукты и помощь беременным и детям до 5 лет. Родители без документов МОГУТ подать на детей-граждан.",
    ar: "بقالة ومساعدة غذائية للحوامل والأطفال دون ٥. يمكن للآباء بلا أوراق التقديم لأطفالهم المواطنين.",
    hi: "गर्भवती और 5 से कम उम्र के बच्चों के लिए राशन और पोषण मदद। बिना दस्तावेज़ माता-पिता अपने नागरिक बच्चों के लिए आवेदन कर सकते हैं।",
    ja: "妊婦と5歳未満の子供への食料・栄養支援。書類のない親も市民権を持つ子のために申請できます。",
    km: "គ្រឿងទេស និងជំនួយអាហារូបត្ថម្ភសម្រាប់ស្ត្រីមានផ្ទៃពោះ និងកុមារក្រោម ៥ ឆ្នាំ។ ឪពុកម្តាយគ្មានឯកសារអាចដាក់ពាក្យឱ្យកូនជាពលរដ្ឋ។",
    th: "อาหารและความช่วยเหลือโภชนาการสำหรับหญิงตั้งครรภ์และเด็กต่ำกว่า 5 ปี พ่อแม่ไร้เอกสารสมัครให้ลูกที่เป็นพลเมืองได้",
    fr: "Aide alimentaire pour femmes enceintes et enfants de moins de 5 ans. Les parents sans papiers PEUVENT postuler pour leurs enfants citoyens.",
  },
  "Free School Breakfast & Lunch (LAUSD)": {
    hy: "Յուրաքանչյուր LAUSD աշակերտ ուտում է անվճար նախաճաշ ԵՎ ճաշ — առանց դիմումի, առանց հարցերի:",
    fa: "هر دانش‌آموز LAUSD صبحانه و ناهار رایگان می‌خورد — بدون درخواست، بدون سؤال.",
    ru: "Каждый ученик LAUSD получает бесплатный завтрак И обед — без заявлений, без вопросов.",
    ar: "كل طالب في LAUSD يأكل فطورًا وغداءً مجانًا — بلا طلب، بلا أسئلة.",
    hi: "हर LAUSD छात्र मुफ़्त नाश्ता और दोपहर का भोजन पाता है — बिना आवेदन, बिना सवाल।",
    ja: "LAUSDの全生徒が朝食と昼食を無料で — 申請不要、質問なし。",
    km: "សិស្ស LAUSD គ្រប់រូបញ៉ាំអាហារពេលព្រឹក និងថ្ងៃត្រង់ឥតគិតថ្លៃ — គ្មានពាក្យសុំ គ្មានសំណួរ។",
    th: "นักเรียน LAUSD ทุกคนได้อาหารเช้าและกลางวันฟรี — ไม่ต้องสมัคร ไม่มีคำถาม",
    fr: "Chaque élève LAUSD mange petit-déjeuner ET déjeuner gratuits — sans demande, sans questions.",
  },
  "SUN Bucks (Summer EBT)": {
    hy: "$120 մեկ երեխայի համար ամառային մթերքի գումար EBT քարտով: Անվճար դպրոցական ճաշ ստացողների մեծ մասը ինքնաբերաբար իրավասու է:",
    fa: "۱۲۰ دلار برای هر کودک پول خواروبار تابستانی روی کارت EBT. بیشتر کودکان دارای غذای رایگان مدرسه خودکار واجد شرایط‌اند.",
    ru: "$120 на ребёнка на летние продукты на карте EBT. Большинство детей со школьным питанием получают автоматически.",
    ar: "١٢٠ دولارًا لكل طفل لبقالة الصيف على بطاقة EBT. معظم أطفال الوجبات المدرسية مؤهلون تلقائيًا.",
    hi: "EBT कार्ड पर प्रति बच्चा $120 की गर्मी की राशन राशि। मुफ़्त स्कूल भोजन वाले अधिकांश बच्चे स्वतः पात्र।",
    ja: "夏の食料費として子供1人$120をEBTカードに支給。給食を受ける子の多くは自動的に対象。",
    km: "$120 ក្នុងមួយកុមារសម្រាប់គ្រឿងទេសរដូវក្តៅលើកាត EBT។ កុមារភាគច្រើនមានសិទ្ធិដោយស្វ័យប្រវត្តិ។",
    th: "เงินซื้ออาหารหน้าร้อน $120 ต่อเด็กบนบัตร EBT เด็กส่วนใหญ่ที่ได้อาหารโรงเรียนฟรีมีสิทธิ์อัตโนมัติ",
    fr: "120 $ par enfant pour l'épicerie d'été sur carte EBT. La plupart des enfants aux repas gratuits sont éligibles d'office.",
  },
  "Summer Food Service Program (SFSP)": {
    hy: "Անվճար ճաշեր այգիներում, գրադարաններում ամբողջ ամառ: 18 և ցածր տարիքի երեխաները պարզապես գալիս են:",
    fa: "وعده‌های رایگان در پارک‌ها و کتابخانه‌ها تمام تابستان. کودکان ۱۸ سال و کمتر فقط حاضر شوند.",
    ru: "Бесплатные обеды в парках и библиотеках всё лето. Детям до 18 — просто прийти.",
    ar: "وجبات مجانية في الحدائق والمكتبات طوال الصيف. الأطفال ١٨ وأقل يحضرون فقط.",
    hi: "पूरी गर्मियों पार्कों और पुस्तकालयों में मुफ़्त भोजन। 18 या कम उम्र के बच्चे बस आ जाएं।",
    ja: "夏の間、公園や図書館で無料の食事。18歳以下はそのまま行くだけ。",
    km: "អាហារឥតគិតថ្លៃនៅសួនច្បារ និងបណ្ណាល័យពេញរដូវក្តៅ។ កុមារ ១៨ ឆ្នាំចុះគ្រាន់តែមក។",
    th: "อาหารฟรีที่สวนสาธารณะและห้องสมุดตลอดหน้าร้อน เด็ก 18 ปีลงมาแค่ไปก็พอ",
    fr: "Repas gratuits dans les parcs et bibliothèques tout l'été. Les 18 ans et moins viennent simplement.",
  },
  "After-School Snack & Supper (CACFP)": {
    hy: "Անվճար նախուտեստներ և ընթրիք դպրոցից հետո ծրագրերում և կենտրոններում:",
    fa: "میان‌وعده و شام رایگان در برنامه‌های بعد از مدرسه و مراکز تفریحی.",
    ru: "Бесплатные перекусы и ужин в программах продлёнки и центрах досуга.",
    ar: "وجبات خفيفة وعشاء مجاني في برامج ما بعد المدرسة والمراكز.",
    hi: "स्कूल के बाद के कार्यक्रमों और केंद्रों में मुफ़्त नाश्ता और रात का खाना।",
    ja: "放課後プログラムやレクセンターで無料の軽食と夕食。",
    km: "អាហារសម្រន់ និងអាហារល្ងាចឥតគិតថ្លៃនៅកម្មវិធីក្រោយម៉ោងសិក្សា។",
    th: "ของว่างและอาหารเย็นฟรีที่โครงการหลังเลิกเรียนและศูนย์กิจกรรม",
    fr: "Goûters et dîners gratuits dans les programmes périscolaires et centres de loisirs.",
  },
  "Lunch at the Library (LA County Library)": {
    hy: "Անվճար ճաշ + միջոցառումներ LA County գրադարաններում ամառային աշխատանքային օրերին: Առանց գրանցման:",
    fa: "ناهار رایگان + برنامه‌ها در کتابخانه‌های LA County هر روز کاری تابستان. بدون ثبت‌نام.",
    ru: "Бесплатный обед + занятия в библиотеках округа ЛА летом по будням. Без записи.",
    ar: "غداء مجاني + أنشطة في مكتبات مقاطعة LA كل يوم صيفي. بلا تسجيل.",
    hi: "गर्मी के हर कार्यदिवस LA County पुस्तकालयों में मुफ़्त लंच + गतिविधियाँ। बिना पंजीकरण।",
    ja: "夏の平日、LA郡立図書館で無料ランチ＋アクティビティ。登録不要。",
    km: "អាហារថ្ងៃត្រង់ឥតគិតថ្លៃ + សកម្មភាពនៅបណ្ណាល័យ LA County រាល់ថ្ងៃធ្វើការរដូវក្តៅ។",
    th: "อาหารกลางวันฟรี + กิจกรรมที่ห้องสมุด LA County ทุกวันธรรมดาหน้าร้อน ไม่ต้องลงทะเบียน",
    fr: "Déjeuner gratuit + activités dans les bibliothèques du comté de LA chaque jour d'été. Sans inscription.",
  },
  "Boys & Girls Clubs of Metro LA": {
    hy: "Մատչելի դպրոցից հետո ծրագրեր անվճար տաք ընթրիքով, դասերի օգնությամբ և սպորտով:",
    fa: "برنامه‌های ارزان بعد از مدرسه با شام گرم رایگان، کمک تکالیف و ورزش.",
    ru: "Недорогая продлёнка с бесплатным горячим ужином, помощью с уроками и спортом.",
    ar: "برامج ميسورة بعد المدرسة مع عشاء ساخن مجاني ومساعدة بالواجبات ورياضة.",
    hi: "मुफ़्त गर्म रात्रिभोजन, होमवर्क मदद और खेल के साथ किफ़ायती आफ्टर-स्कूल कार्यक्रम।",
    ja: "無料の温かい夕食・宿題サポート・スポーツ付きの低料金放課後プログラム。",
    km: "កម្មវិធីក្រោយម៉ោងសិក្សាតម្លៃទាបជាមួយអាហារល្ងាចក្តៅឥតគិតថ្លៃ ជំនួយកិច្ចការផ្ទះ និងកីឡា។",
    th: "โครงการหลังเลิกเรียนราคาถูกพร้อมอาหารเย็นร้อนฟรี ช่วยการบ้าน และกีฬา",
    fr: "Programmes périscolaires abordables avec dîner chaud gratuit, aide aux devoirs et sport.",
  },
  "My Friend's Place": {
    hy: "Կենտրոն Հոլիվուդում 12-25 տարեկան անօթևան երիտասարդների համար՝ տաք ճաշեր, ցնցուղ, հագուստ: Առանց հարցերի:",
    fa: "مرکز هالیوود برای جوانان ۱۲-۲۵ بی‌خانمان: غذای گرم، دوش، لباس. بدون سؤال، بدون قضاوت.",
    ru: "Центр в Голливуде для бездомной молодёжи 12-25: горячая еда, душ, одежда. Без вопросов.",
    ar: "مركز هوليوود للشباب المشردين ١٢-٢٥: وجبات ساخنة، استحمام، ملابس. بلا أسئلة.",
    hi: "12-25 उम्र के बेघर युवाओं के लिए हॉलीवुड केंद्र: गर्म भोजन, स्नान, कपड़े। बिना सवाल।",
    ja: "ホームレスの12〜25歳向けハリウッドの施設：温かい食事・シャワー・衣類。質問なし。",
    km: "មជ្ឈមណ្ឌល Hollywood សម្រាប់យុវជន ១២-២៥ គ្មានផ្ទះ: អាហារក្តៅ ងូតទឹក សម្លៀកបំពាក់។ គ្មានសំណួរ។",
    th: "ศูนย์ฮอลลีวูดสำหรับเยาวชนไร้บ้าน 12-25 ปี: อาหารร้อน อาบน้ำ เสื้อผ้า ไม่มีคำถาม",
    fr: "Centre à Hollywood pour jeunes sans-abri de 12-25 ans : repas chauds, douches, vêtements. Sans questions.",
  },
  "Safe Place for Youth (SPY)": {
    hy: "Ծառայություններ Վենիսում 12-25 տարեկանների համար՝ ճաշեր, բուժօգնություն, կրթական աջակցություն:",
    fa: "خدمات در ونیز برای جوانان ۱۲-۲۵: غذا، مراقبت سلامت، حمایت تحصیلی و کمک مسکن.",
    ru: "Услуги в Венисе для молодёжи 12-25: еда, медпомощь, поддержка в учёбе и жилье.",
    ar: "خدمات في فينيس للشباب ١٢-٢٥: وجبات، رعاية صحية، دعم تعليمي وسكني.",
    hi: "12-25 उम्र के लिए वेनिस में सेवाएं: भोजन, स्वास्थ्य देखभाल, शिक्षा और आवास सहायता।",
    ja: "ベニスの12〜25歳向けサービス：食事・医療・教育支援・住居案内。",
    km: "សេវានៅ Venice សម្រាប់យុវជន ១២-២៥: អាហារ ការថែទាំសុខភាព ការគាំទ្រការសិក្សា។",
    th: "บริการที่เวนิสสำหรับเยาวชน 12-25 ปี: อาหาร สุขภาพ การศึกษา และที่อยู่อาศัย",
    fr: "Services à Venice pour les 12-25 ans : repas, soins, soutien scolaire et logement.",
  },
  "Covenant House California": {
    hy: "Կացարան, օրական երեք ճաշ և աշխատանքի ծրագրեր 18-24 տարեկան անօթևան երիտասարդների համար: Բաց 24/7:",
    fa: "سرپناه، سه وعده غذا در روز و برنامه‌های شغلی برای جوانان ۱۸-۲۴ بی‌خانمان. باز ۲۴/۷.",
    ru: "Приют, трёхразовое питание и трудовые программы для молодёжи 18-24. Открыто 24/7.",
    ar: "مأوى وثلاث وجبات يوميًا وبرامج عمل للشباب ١٨-٢٤. مفتوح ٢٤/٧.",
    hi: "18-24 उम्र के बेघर युवाओं के लिए आश्रय, दिन में तीन भोजन और नौकरी कार्यक्रम। 24/7 खुला।",
    ja: "18〜24歳のホームレス青年向けシェルター・1日3食・就労プログラム。24時間対応。",
    km: "ជម្រក អាហារបីពេលក្នុងមួយថ្ងៃ និងកម្មវិធីការងារសម្រាប់យុវជន ១៨-២៤។ បើក 24/7។",
    th: "ที่พัก อาหารวันละสามมื้อ และโครงการงานสำหรับเยาวชน 18-24 ปี เปิด 24/7",
    fr: "Hébergement, trois repas par jour et programmes d'emploi pour les 18-24 ans. Ouvert 24h/24.",
  },
  "Swipe Out Hunger": {
    hy: "Անվճար ճաշի սվայփներ՝ նվիրաբերված համակուրսեցիների կողմից SoCal-ի քոլեջներում:",
    fa: "وعده‌های رایگان اهدایی هم‌کلاسی‌ها در دانشگاه‌های سراسر جنوب کالیفرنیا.",
    ru: "Бесплатные обеды, подаренные сокурсниками, в кампусах Южной Калифорнии.",
    ar: "وجبات مجانية تبرع بها الزملاء في جامعات جنوب كاليفورنيا.",
    hi: "दक्षिणी कैलिफ़ोर्निया के कॉलेजों में सहपाठियों द्वारा दान किए मुफ़्त भोजन स्वाइप।",
    ja: "南カリフォルニアの大学で、学友が寄付した食事スワイプを無料提供。",
    km: "ការទូទាត់អាហារឥតគិតថ្លៃដែលបរិច្ចាគដោយមិត្តរួមថ្នាក់នៅសាកលវិទ្យាល័យ SoCal។",
    th: "มื้ออาหารฟรีที่เพื่อนนักศึกษาบริจาคในวิทยาเขตทั่ว SoCal",
    fr: "Repas gratuits offerts par les camarades sur les campus de Californie du Sud.",
  },
  "Campus Food Pantries (UCLA, CSULB, community colleges)": {
    hy: "Գրեթե յուրաքանչյուր SoCal համալսարան ունի անվճար ուսանողական մթերային կետ: Անանուն:",
    fa: "تقریباً هر دانشگاه SoCal یک انبار غذای رایگان دانشجویی دارد. ناشناس، بدون اثبات نیاز.",
    ru: "Почти в каждом кампусе Южной Калифорнии есть бесплатная студенческая кладовая. Анонимно.",
    ar: "تقريبًا كل جامعة في جنوب كاليفورنيا لديها مخزن طعام مجاني للطلاب. مجهول الهوية.",
    hi: "लगभग हर SoCal कैंपस में मुफ़्त छात्र पैंट्री है। गुमनाम, बिना ज़रूरत के सबूत।",
    ja: "南カリフォルニアのほぼ全キャンパスに無料の学生パントリーあり。匿名利用可。",
    km: "ស្ទើរគ្រប់សាកលវិទ្យាល័យ SoCal មានឃ្លាំងអាហារនិស្សិតឥតគិតថ្លៃ។ អនាមិក។",
    th: "เกือบทุกวิทยาเขต SoCal มีตู้อาหารนักศึกษาฟรี ไม่ระบุชื่อ",
    fr: "Presque chaque campus de SoCal a une banque alimentaire étudiante gratuite. Anonyme.",
  },
  "CalFresh for College Students": {
    hy: "Շատ ուսանողներ ԻՐԱՎԱՍՈՒ ԵՆ CalFresh-ի (մինչև $292/ամիս մթերքի համար): Արժե 10 րոպե դիմել:",
    fa: "بسیاری از دانشجویان واجد شرایط CalFresh هستند (تا ۲۹۲ دلار در ماه). درخواست ۱۰ دقیقه‌ای می‌ارزد.",
    ru: "Многие студенты ИМЕЮТ право на CalFresh (до $292/мес на продукты). Заявка занимает 10 минут.",
    ar: "كثير من الطلاب مؤهلون لـ CalFresh (حتى ٢٩٢ دولارًا شهريًا). يستحق طلبًا من ١٠ دقائق.",
    hi: "कई छात्र CalFresh के पात्र हैं (राशन के लिए $292/माह तक)। 10 मिनट का आवेदन सार्थक है।",
    ja: "多くの学生がCalFresh対象 (月最大$292の食料費)。10分の申請の価値あり。",
    km: "និស្សិតជាច្រើនមានសិទ្ធិ CalFresh (រហូតដល់ $292/ខែ)។ ពាក្យសុំ ១០ នាទីមានតម្លៃ។",
    th: "นักศึกษาหลายคนมีสิทธิ์ CalFresh (สูงสุด $292/เดือน) คุ้มกับการสมัคร 10 นาที",
    fr: "Beaucoup d'étudiants SONT éligibles à CalFresh (jusqu'à 292 $/mois). Vaut les 10 minutes de demande.",
  },
  "EOPS / CARE (Community Colleges)": {
    hy: "Լրացուցիչ դրամաշնորհներ, սննդի կտրոններ և խորհրդատվություն ցածր եկամուտ ունեցող քոլեջի ուսանողների համար:",
    fa: "کمک‌هزینه اضافی، کوپن غذا و مشاوره برای دانشجویان کم‌درآمد کالج‌های محلی.",
    ru: "Доп. гранты, продуктовые ваучеры и консультации для малоимущих студентов колледжей.",
    ar: "منح إضافية وقسائم طعام وإرشاد لطلاب الكليات المجتمعية ذوي الدخل المنخفض.",
    hi: "कम आय वाले कम्युनिटी कॉलेज छात्रों के लिए अतिरिक्त अनुदान, फ़ूड वाउचर और परामर्श।",
    ja: "低所得のコミュニティカレッジ学生に追加助成金・食料バウチャー・カウンセリング。",
    km: "ជំនួយបន្ថែម ប័ណ្ណអាហារ និងការប្រឹក្សាសម្រាប់និស្សិតមហាវិទ្យាល័យសហគមន៍ចំណូលទាប។",
    th: "ทุนเพิ่ม คูปองอาหาร และคำปรึกษาสำหรับนักศึกษาวิทยาลัยชุมชนรายได้น้อย",
    fr: "Bourses supplémentaires, bons alimentaires et conseil pour étudiants à faibles revenus.",
  },
  "Volunteer & Earn Service Hours": {
    hy: "Դեռահասներ՝ սննդի բանկերը հաշվվում են դպրոցական ծառայության ժամերի համար: Օգնեք թաղամասին ու ձեր դիմումներին միաժամանակ:",
    fa: "نوجوانان: بانک‌های غذا برای ساعات خدمات اجتماعی مدرسه حساب می‌شوند. به محله و رزومه دانشگاهتان همزمان کمک کنید.",
    ru: "Подростки: работа в фудбанках засчитывается как школьные волонтёрские часы. Помогите району и своему поступлению.",
    ar: "للمراهقين: بنوك الطعام تُحسب ضمن ساعات الخدمة المدرسية. ساعد حيك وطلباتك الجامعية معًا.",
    hi: "किशोर: फ़ूड बैंक स्कूल सामुदायिक सेवा घंटों में गिने जाते हैं। मोहल्ले और कॉलेज आवेदन दोनों में मदद करें।",
    ja: "ティーンへ：フードバンク活動は学校のボランティア時間に算入。地域貢献と進学準備を同時に。",
    km: "យុវវ័យ: ធនាគារអាហាររាប់បញ្ចូលក្នុងម៉ោងសេវាសហគមន៍សាលា។ ជួយសង្កាត់ និងពាក្យសុំមហាវិទ្យាល័យព្រមគ្នា។",
    th: "วัยรุ่น: งานธนาคารอาหารนับเป็นชั่วโมงบำเพ็ญประโยชน์ของโรงเรียน ช่วยชุมชนและใบสมัครมหาวิทยาลัยไปพร้อมกัน",
    fr: "Ados : les banques alimentaires comptent pour les heures de service scolaire. Aidez votre quartier et vos candidatures.",
  },
};

const AGE_FILTERS = [
  { key: "all",     tKey: "youth_ageAll",     icon: "✨" },
  { key: "under5",  tKey: "youth_ageUnder5",  icon: "🍼" },
  { key: "k12",     tKey: "youth_ageK12",     icon: "🏫" },
  { key: "teen",    tKey: "youth_ageTeen",    icon: "⭐" },
  { key: "college", tKey: "youth_ageCollege", icon: "🎓" },
];

export default function Youth() {
  const { t, lang } = useLang();
  // Multi-select: empty set = "All".
  const [ages, setAges] = useState(new Set());

  const toggleAge = (key) => {
    if (key === "all") { setAges(new Set()); return; }
    const next = new Set(ages);
    next.has(key) ? next.delete(key) : next.add(key);
    setAges(next);
  };

  const filtered = ages.size === 0 ? PROGRAMS : PROGRAMS.filter((p) => ages.has(p.age));

  return (
    <div className="page">
      <h2>🎒 {t("youth")}</h2>
      <p className="muted">{t("youthIntro")}</p>

      <div className="callout safe">
        <strong>🏫 {t("youth_rightsTitle")}</strong> {t("youth_rightsBody")}
      </div>

      <div className="category-pills">
        {AGE_FILTERS.map((f) => (
          <button
            key={f.key}
            className={`pill ${(f.key === "all" ? ages.size === 0 : ages.has(f.key)) ? "active" : ""}`}
            onClick={() => toggleAge(f.key)}
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
                {t(AGE_FILTERS.find((f) => f.key === p.age)?.tKey || "youth")}
              </span>
            </header>
            <p>{p.desc[lang] ?? EXTRA_DESCS[p.name]?.[lang] ?? p.desc.en}</p>
            {p.internal ? (
              <Link to={p.link} className="btn">{t("learnMore")}</Link>
            ) : (
              <a href={p.link} target="_blank" rel="noreferrer" className="btn">{t("learnMore")}</a>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
