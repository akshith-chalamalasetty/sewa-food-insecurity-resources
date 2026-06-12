import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext.jsx";
import { useLang } from "../context/LangContext.jsx";

const EMPTY = { donation_type: "food", contact: "", notes: "", other_detail: "" };

// What to donate (and not) — standard food bank safety guidelines.
const DONATION_GUIDE = {
  recommended: {
    en: ["Canned vegetables, fruits & beans (pop-top lids are best)", "Rice, dried beans & lentils", "Pasta & pasta sauce", "Peanut butter & nut butters (sealed)", "Cereal, oatmeal & granola bars", "Shelf-stable milk & plant milks", "Cooking oil (sealed, plastic bottles)", "Sealed baby formula & baby food (not expired)", "Culturally familiar staples: masa, soy sauce, spices, tea"],
    es: ["Vegetales, frutas y frijoles enlatados (tapa fácil es mejor)", "Arroz, frijoles secos y lentejas", "Pasta y salsa para pasta", "Crema de cacahuate (sellada)", "Cereal, avena y barras de granola", "Leche de larga duración y leches vegetales", "Aceite de cocina (sellado, botella de plástico)", "Fórmula y comida para bebé selladas (no vencidas)", "Básicos culturales: masa, salsa de soya, especias, té"],
    zh: ["罐装蔬菜、水果和豆类（易拉盖最佳）", "大米、干豆和扁豆", "意面和意面酱", "花生酱（密封）", "麦片、燕麦和谷物棒", "常温奶和植物奶", "食用油（密封塑料瓶）", "密封婴儿配方奶和辅食（未过期）", "文化常用主食：玉米粉、酱油、香料、茶"],
    vi: ["Rau củ, trái cây và đậu đóng hộp (nắp giật tốt nhất)", "Gạo, đậu khô và đậu lăng", "Mì Ý và sốt", "Bơ đậu phộng (còn niêm phong)", "Ngũ cốc, yến mạch và thanh granola", "Sữa tiệt trùng và sữa thực vật", "Dầu ăn (niêm phong, chai nhựa)", "Sữa công thức và đồ ăn em bé niêm phong (chưa hết hạn)", "Thực phẩm quen thuộc: bột masa, nước tương, gia vị, trà"],
    ko: ["통조림 야채, 과일, 콩 (원터치 캔이 가장 좋음)", "쌀, 마른 콩, 렌틸콩", "파스타와 파스타 소스", "땅콩버터 (밀봉)", "시리얼, 오트밀, 그래놀라 바", "멸균 우유 및 식물성 우유", "식용유 (밀봉된 플라스틱 병)", "밀봉된 분유와 이유식 (유통기한 내)", "친숙한 식재료: 마사 가루, 간장, 향신료, 차"],
    tl: ["De-latang gulay, prutas at beans (mas maganda ang pop-top)", "Bigas, dried beans at lentils", "Pasta at pasta sauce", "Peanut butter (nakasara)", "Cereal, oatmeal at granola bars", "Shelf-stable milk at plant milks", "Mantika (nakasara, plastic bottle)", "Nakasarang baby formula at baby food (hindi expired)", "Mga pamilyar na sangkap: masa, toyo, spices, tsaa"],
    hy: ["Պահածոյացված բանջարեղեն, մրգեր և լոբի (բացվող կափարիչով՝ լավագույնը)", "Բրինձ, չոր լոբի և ոսպ", "Մակարոն և սոուս", "Գետնանուշի կարագ (փակ)", "Շիլա, վարսակ և գրանոլա", "Երկարապահ կաթ և բուսական կաթ", "Ձեթ (փակ, պլաստիկ շիշ)", "Փակ մանկական կաթնախառնուրդ և սնունդ (ոչ ժամկետանց)", "Ծանոթ մթերքներ՝ մասա, սոյայի սոուս, համեմունքներ, թեյ"],
    fa: ["سبزیجات، میوه و حبوبات کنسروی (درب آسان‌بازشو بهتر است)", "برنج، حبوبات خشک و عدس", "پاستا و سس", "کره بادام‌زمینی (پلمب)", "غلات صبحانه، جو دوسر و گرانولا", "شیر بادوام و شیرهای گیاهی", "روغن (پلمب، بطری پلاستیکی)", "شیرخشک و غذای کودک پلمب (تاریخ‌دار)", "اقلام آشنا: آرد ذرت، سس سویا، ادویه، چای"],
    ru: ["Консервы: овощи, фрукты, фасоль (лучше с кольцом)", "Рис, сухая фасоль и чечевица", "Макароны и соус", "Арахисовая паста (запечатанная)", "Хлопья, овсянка и батончики", "Долгохранящееся и растительное молоко", "Масло (запечатанное, пластик)", "Запечатанные смеси и детское питание (не просроченные)", "Привычные продукты: маса, соевый соус, специи, чай"],
    ar: ["خضار وفواكه وبقوليات معلبة (الأغطية السهلة أفضل)", "أرز وبقوليات جافة وعدس", "معكرونة وصلصة", "زبدة فول سوداني (مغلقة)", "حبوب إفطار وشوفان وألواح جرانولا", "حليب طويل الأمد وحليب نباتي", "زيت طبخ (مغلق، عبوة بلاستيك)", "حليب وأغذية أطفال مغلقة (غير منتهية)", "أساسيات مألوفة: دقيق الذرة، صلصة الصويا، بهارات، شاي"],
    hi: ["डिब्बाबंद सब्ज़ियाँ, फल और बीन्स (पॉप-टॉप ढक्कन बेहतर)", "चावल, सूखी दालें और मसूर", "पास्ता और सॉस", "पीनट बटर (सीलबंद)", "सीरियल, ओट्स और ग्रेनोला बार", "लंबे समय चलने वाला दूध और प्लांट मिल्क", "खाना पकाने का तेल (सीलबंद, प्लास्टिक बोतल)", "सीलबंद बेबी फ़ॉर्मूला और बेबी फ़ूड (एक्सपायर्ड नहीं)", "परिचित चीज़ें: मासा, सोया सॉस, मसाले, चाय"],
    ja: ["缶詰の野菜・果物・豆類 (プルトップ式が最適)", "米・乾燥豆・レンズ豆", "パスタとパスタソース", "ピーナッツバター (未開封)", "シリアル・オートミール・グラノーラバー", "常温保存可能な牛乳・植物性ミルク", "食用油 (未開封・プラ容器)", "未開封の粉ミルク・ベビーフード (期限内)", "なじみの食材: マサ粉・醤油・香辛料・お茶"],
    km: ["បន្លែ ផ្លែឈើ និងសណ្តែកកំប៉ុង (គម្របងាយបើកល្អបំផុត)", "អង្ករ សណ្តែកស្ងួត", "មីប៉ាស្តា និងទឹកជ្រលក់", "ប័រសណ្តែកដី (បិទជិត)", "ធញ្ញជាតិ និងរបារគ្រាប់ធញ្ញជាតិ", "ទឹកដោះគោរក្សាបានយូរ", "ប្រេងចម្អិន (បិទជិត ដបប្លាស្ទិក)", "ទឹកដោះគោម្សៅ និងអាហារទារកបិទជិត (មិនផុតកំណត់)", "គ្រឿងផ្សំធម្មតា: ម្សៅពោត ទឹកស៊ីអ៊ីវ គ្រឿងទេស តែ"],
    th: ["ผัก ผลไม้ ถั่วกระป๋อง (ฝาดึงเปิดดีที่สุด)", "ข้าว ถั่วแห้ง และถั่วเลนทิล", "พาสต้าและซอส", "เนยถั่ว (ปิดผนึก)", "ซีเรียล ข้าวโอ๊ต กราโนล่าบาร์", "นมยูเอชทีและนมพืช", "น้ำมันพืช (ปิดผนึก ขวดพลาสติก)", "นมผงและอาหารเด็กปิดผนึก (ไม่หมดอายุ)", "ของคุ้นเคย: แป้งมาซา ซีอิ๊ว เครื่องเทศ ชา"],
    fr: ["Légumes, fruits et haricots en conserve (couvercles à anneau de préférence)", "Riz, haricots secs et lentilles", "Pâtes et sauce", "Beurre de cacahuète (scellé)", "Céréales, flocons d'avoine et barres granola", "Lait longue conservation et laits végétaux", "Huile de cuisson (scellée, bouteille plastique)", "Lait infantile et petits pots scellés (non périmés)", "Produits familiers : masa, sauce soja, épices, thé"],
  },
  notAllowed: {
    en: ["Expired food", "Opened or unsealed packages", "Homemade or home-canned food", "Dented, rusty, or bulging cans", "Alcohol", "Items needing refrigeration (unless arranged ahead)", "Glass containers (break in transport)"],
    es: ["Comida vencida", "Paquetes abiertos o sin sellar", "Comida casera o enlatada en casa", "Latas abolladas, oxidadas o infladas", "Alcohol", "Productos que requieren refrigeración (salvo acuerdo previo)", "Envases de vidrio (se rompen en el transporte)"],
    zh: ["过期食品", "已开封或未密封的包装", "自制或家庭罐装食品", "凹陷、生锈或鼓胀的罐头", "酒精", "需要冷藏的食品（除非事先安排）", "玻璃容器（运输中易碎）"],
    vi: ["Thực phẩm hết hạn", "Bao bì đã mở hoặc không niêm phong", "Đồ ăn tự làm hoặc tự đóng hộp", "Lon móp, gỉ hoặc phồng", "Rượu bia", "Đồ cần giữ lạnh (trừ khi sắp xếp trước)", "Hộp thủy tinh (dễ vỡ khi vận chuyển)"],
    ko: ["유통기한이 지난 식품", "개봉되었거나 밀봉되지 않은 포장", "집에서 만든 음식 또는 가정 통조림", "찌그러지거나 녹슬거나 부푼 캔", "주류", "냉장이 필요한 품목 (사전 협의 제외)", "유리 용기 (운송 중 파손)"],
    tl: ["Expired na pagkain", "Bukas o hindi nakasarang packages", "Lutong-bahay o home-canned na pagkain", "Yupi, kalawangin, o namamagang lata", "Alak", "Mga kailangan ng refrigeration (maliban kung napag-usapan)", "Salamin na lalagyan (nababasag sa biyahe)"],
    hy: ["Ժամկետանց սնունդ", "Բացված կամ չփակված փաթեթներ", "Տնական կամ տնային պահածոներ", "Փչացած, ժանգոտ կամ ուռած տուփեր", "Ալկոհոլ", "Սառնարան պահանջող մթերք (եթե նախապես չի պայմանավորվել)", "Ապակյա տարաներ (կոտրվում են փոխադրման ժամանակ)"],
    fa: ["غذای تاریخ‌گذشته", "بسته‌های باز یا بدون پلمب", "غذای خانگی یا کنسرو خانگی", "قوطی‌های فرورفته، زنگ‌زده یا بادکرده", "الکل", "اقلام نیازمند یخچال (مگر با هماهنگی قبلی)", "ظروف شیشه‌ای (در حمل می‌شکنند)"],
    ru: ["Просроченные продукты", "Открытые или негерметичные упаковки", "Домашняя еда и домашние консервы", "Вмятые, ржавые или вздутые банки", "Алкоголь", "Продукты, требующие холодильника (без договорённости)", "Стеклянная тара (бьётся при перевозке)"],
    ar: ["طعام منتهي الصلاحية", "عبوات مفتوحة أو غير محكمة", "طعام منزلي أو معلبات منزلية", "علب مبعوجة أو صدئة أو منتفخة", "كحول", "أصناف تحتاج تبريدًا (إلا بترتيب مسبق)", "عبوات زجاجية (تنكسر أثناء النقل)"],
    hi: ["एक्सपायर्ड खाना", "खुले या बिना सील पैकेट", "घर का बना या घर में डिब्बाबंद खाना", "पिचके, जंग लगे या फूले डिब्बे", "शराब", "फ्रिज की ज़रूरत वाली चीज़ें (बिना पूर्व व्यवस्था)", "कांच के बर्तन (परिवहन में टूटते हैं)"],
    ja: ["期限切れ食品", "開封済み・未密封の包装", "手作り・自家製の瓶詰食品", "へこみ・サビ・膨張した缶", "アルコール", "要冷蔵品 (事前の取り決めがない場合)", "ガラス容器 (輸送中に割れます)"],
    km: ["អាហារផុតកំណត់", "កញ្ចប់បើក ឬមិនបិទជិត", "អាហារធ្វើនៅផ្ទះ", "កំប៉ុងបុប ច្រែះ ឬប៉ោង", "គ្រឿងស្រវឹង", "អាហារត្រូវការទូទឹកកក (លើកលែងមានការព្រមព្រៀង)", "ធុងកែវ (បែកពេលដឹក)"],
    th: ["อาหารหมดอายุ", "บรรจุภัณฑ์ที่เปิดแล้วหรือไม่ปิดผนึก", "อาหารทำเองหรือบรรจุกระป๋องเอง", "กระป๋องบุบ ขึ้นสนิม หรือบวม", "แอลกอฮอล์", "ของที่ต้องแช่เย็น (เว้นแต่นัดล่วงหน้า)", "ภาชนะแก้ว (แตกระหว่างขนส่ง)"],
    fr: ["Aliments périmés", "Emballages ouverts ou non scellés", "Plats maison ou conserves maison", "Boîtes cabossées, rouillées ou gonflées", "Alcool", "Produits à réfrigérer (sauf accord préalable)", "Contenants en verre (cassent au transport)"],
  },
};

export default function Donors() {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");

  const load = async () => setRows(await api.donors());
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const claim = async (id) => {
    setError("");
    try { await api.claimDonor(id); await load(); }
    catch (err) { setError(err.message); }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // For "other", fold the what-they're-contributing detail into notes.
      const notes = form.donation_type === "other"
        ? [form.other_detail, form.notes].filter(Boolean).join(" — ")
        : form.notes;
      await api.registerDonor({
        donation_type: form.donation_type,
        contact: form.contact,
        notes,
      });
      setForm(EMPTY);
      await load();
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="page">
      <h2>{t("donors")}</h2>
      <p className="muted">{t("donorsIntro")}</p>

      <div className="donation-guide">
        <div className="guide-col rec">
          <h3>✅ {t("don_recTitle")}</h3>
          <ul>
            {(DONATION_GUIDE.recommended[lang] ?? DONATION_GUIDE.recommended.en).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="guide-col no">
          <h3>🚫 {t("don_noTitle")}</h3>
          <ul>
            {(DONATION_GUIDE.notAllowed[lang] ?? DONATION_GUIDE.notAllowed.en).map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      {user ? (
        <form className="card-form" onSubmit={submit}>
          <h3>{t("signUpDonor")}</h3>
          <p className="muted small">
            👤 {t("donors_signingAs")} <strong>{user.full_name}</strong>
          </p>
          <select value={form.donation_type} onChange={set("donation_type")}>
            <option value="food">{t("donors_typeFood")}</option>
            <option value="cash">{t("donors_typeCash")}</option>
            <option value="both">{t("donors_typeBoth")}</option>
            <option value="other">{t("donors_typeOther")}</option>
          </select>
          {form.donation_type === "other" && (
            <input
              placeholder={t("donors_otherWhat")}
              value={form.other_detail}
              onChange={set("other_detail")}
              required
            />
          )}
          <input
            placeholder={`${t("contact")} (${t("email")} / ${t("phone")})`}
            value={form.contact}
            onChange={set("contact")}
          />
          <textarea placeholder={t("notes")} value={form.notes} onChange={set("notes")} />
          {error && <p className="error">{error}</p>}
          <button className="btn primary" type="submit">{t("submit")}</button>
        </form>
      ) : (
        <div className="card-form">
          <h3>{t("signUpDonor")}</h3>
          <p className="muted">{t("donors_loginRequired")}</p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Link className="btn primary" to="/login">{t("login")}</Link>
            <Link className="btn" to="/register">{t("register")}</Link>
          </div>
        </div>
      )}

      <h3>{t("recentDonors")}</h3>
      <p className="muted small">💡 {t("donors_claimNote")}</p>
      <div className="list">
        {rows.map((d) => (
          <article key={d.id} className="resource-card">
            <header>
              <h3>{d.name}</h3>
              <div className="badge-row" style={{ marginTop: 0 }}>
                <span className="badge">{d.donation_type}</span>
                {d.status === "claimed" && (
                  <span className="badge cat">
                    {user && d.claimed_by_user_id === user.id
                      ? `✓ ${t("donors_claimedByYou")}`
                      : `✓ ${t("donors_claimedBadge")}`}
                  </span>
                )}
              </div>
            </header>
            <p>{d.contact}</p>
            {d.notes && <p>{d.notes}</p>}
            {user && d.status === "open" && (
              <button className="btn primary" onClick={() => claim(d.id)}>
                🤝 {t("donors_claim")}
              </button>
            )}
          </article>
        ))}
        {rows.length === 0 && <p className="muted">{t("noDonors")}</p>}
      </div>
    </div>
  );
}
