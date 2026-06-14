"""Seed sample LA County / SoCal data focused on SNAP-ineligible communities."""
import json
from database import SessionLocal, engine, Base
import models

Base.metadata.create_all(bind=engine)

# Tag legend used across pantries + resources:
#   undocumented      = welcoming to undocumented residents
#   mixed_status      = mixed-status families
#   student           = college / high school students
#   senior            = 60+
#   children          = families with kids
#   recent_immigrant  = recently arrived
#   denied_snap       = denied or just over the line
#   no_kitchen        = ready-to-eat / hot meals (no cooking)
#   no_address        = no fixed address needed

# All entries are real organizations with their public addresses.
# Verify hours by phone before relying on them — they change seasonally.
def _p(name, address, city, zip_code, phone, hours, notes, lat, lng, languages="en,es"):
    return dict(name=name, address=address, city=city, zip_code=zip_code,
                phone=phone, hours=hours, notes=notes, lat=lat, lng=lng,
                languages=languages, requires_eligibility=False,
                no_id_required=True, immigration_safe=True)


SAMPLE_PANTRIES = [
    # ---- Central / Downtown LA ----
    _p("Los Angeles Regional Food Bank", "1734 E 41st St", "Los Angeles", "90058",
       "(323) 234-3030", "Mon-Fri 8am-4pm",
       "Hub supplying 700+ partner pantries. Use their online locator for a site near you.",
       34.0019, -118.2437),
    _p("St. Francis Center", "1835 S Hope St", "Los Angeles", "90015",
       "(213) 747-5347", "Mon-Fri 8am-3pm",
       "Groceries, hot meals, hygiene kits. No address required.",
       34.0364, -118.2697),
    _p("Union Rescue Mission", "545 S San Pedro St", "Los Angeles", "90013",
       "(213) 347-6300", "Daily meals",
       "Three meals daily on Skid Row, open to anyone. No questions asked.",
       34.0443, -118.2451),
    _p("The Midnight Mission", "601 S San Pedro St", "Los Angeles", "90014",
       "(213) 624-9258", "Daily 6:30am, 12pm, 4:30pm",
       "Public meals served three times daily, every day of the year.",
       34.0437, -118.2446),
    _p("Los Angeles Mission", "303 E 5th St", "Los Angeles", "90013",
       "(213) 629-1227", "Daily meals",
       "Meals, shelter, and services downtown. Everyone welcome.",
       34.0458, -118.2440),
    _p("All Peoples Community Center", "822 E 20th St", "Los Angeles", "90011",
       "(213) 747-6357", "Call for pantry days",
       "South-Central community center with a weekly food pantry.",
       34.0269, -118.2563),

    # ---- Hollywood / Mid-City / Westside ----
    _p("Hollywood Food Coalition", "5939 Hollywood Blvd", "Los Angeles", "90028",
       "(323) 462-2032", "Daily 5:30pm-7pm",
       "Hot dinner nightly. Open to everyone, no questions asked.",
       34.1016, -118.3225),
    _p("Project Angel Food", "922 Vine St", "Los Angeles", "90038",
       "(323) 845-1800", "Mon-Fri office hours",
       "Free medically tailored meals delivered to people with serious illness.",
       34.0877, -118.3266),
    _p("SOVA West (JFS LA)", "8846 W Pico Blvd", "Los Angeles", "90035",
       "(818) 988-7682", "Call for hours",
       "Free groceries for anyone in need. Part of Jewish Family Service LA.",
       34.0553, -118.3925, "en,es,he,ru"),
    _p("Westside Food Bank", "1710 22nd St", "Santa Monica", "90404",
       "(310) 828-6016", "Mon-Thu 9am-3pm",
       "Supplies pantries across the Westside — call for the nearest distribution.",
       34.0312, -118.4711),

    # ---- San Fernando Valley ----
    _p("MEND Poverty", "10641 N San Fernando Rd", "Pacoima", "91331",
       "(818) 896-0246", "Mon-Fri 8am-12pm",
       "Largest pantry in the San Fernando Valley. Walk-ins welcome.",
       34.2620, -118.4170),
    _p("SOVA Valley (JFS LA)", "16439 Vanowen St", "Van Nuys", "91406",
       "(818) 988-7682", "Tue/Thu 10am-1pm",
       "Free groceries for any family in need.",
       34.1939, -118.4870, "en,es,he,ru"),
    _p("San Fernando Valley Rescue Mission", "13422 Saticoy St", "North Hollywood", "91605",
       "(818) 785-4476", "Call for meal times",
       "Meals and family services in the East Valley.",
       34.2086, -118.4262),
    _p("West Valley Food Pantry", "5700 Rudnick Ave", "Woodland Hills", "91367",
       "(818) 346-5554", "Mon-Fri mornings",
       "Long-running pantry at Prince of Peace Church. Groceries weekly.",
       34.1727, -118.6326),

    # ---- South LA / South Bay ----
    _p("Watts Labor Community Action Committee", "10950 S Central Ave", "Los Angeles", "90059",
       "(323) 563-5639", "Call for distribution days",
       "Food distributions and senior meals in Watts.",
       33.9352, -118.2547),
    _p("St. Margaret's Center", "10217 S Inglewood Ave", "Lennox", "90304",
       "(310) 672-2208", "Mon-Fri 8:30am-4pm",
       "Catholic Charities center near LAX. Food pantry + immigration services.",
       33.9377, -118.3581),

    # ---- Long Beach ----
    _p("Food Bank of Southern California", "1444 San Francisco Ave", "Long Beach", "90813",
       "(562) 435-3577", "Mon-Fri 8am-4pm",
       "Long Beach's food bank — call for partner pantry locations.",
       33.7842, -118.2031),
    _p("Long Beach Rescue Mission", "1430 Pacific Ave", "Long Beach", "90813",
       "(562) 591-1292", "Public lunch ~12-1pm (not Fri)",
       "Hundreds of meals served daily. Public lunch open to everyone.",
       33.7821, -118.1929, "en,es,km"),

    # ---- Pasadena / San Gabriel Valley ----
    _p("Friends In Deed", "444 E Washington Blvd", "Pasadena", "91104",
       "(626) 797-2402", "Pantry: Tue-Thu",
       "Choice-style food pantry — shop for what you actually need.",
       34.1672, -118.1357),
    _p("Foothill Unity Center", "790 W Chestnut Ave", "Monrovia", "91016",
       "(626) 358-3486", "Mon-Fri, call first",
       "Food and crisis help for the San Gabriel Valley foothills.",
       34.1471, -118.0065),
    _p("Salvation Army Pasadena Hope Center", "1000 E Walnut St", "Pasadena", "91106",
       "(626) 529-0503", "Mon/Wed/Fri 9-11:30am",
       "Hope Pantry — choose your own groceries and hygiene products, free.",
       34.1497, -118.1278),

    # ---- Orange County ----
    _p("Second Harvest Food Bank of OC", "8014 Marine Way", "Irvine", "92618",
       "(949) 653-2900", "Mon-Fri 8am-4pm",
       "OC's largest food bank — mobile pantries across the county.",
       33.6519, -117.7437, "en,es,vi"),
    _p("OC Food Bank (CAP OC)", "11870 Monarch St", "Garden Grove", "92841",
       "(714) 897-6670", "Mon-Fri 8am-4pm",
       "Distributes through hundreds of OC partner sites — call for the nearest.",
       33.7896, -117.9764, "en,es,vi,ko"),
    _p("Someone Cares Soup Kitchen", "720 W 19th St", "Costa Mesa", "92627",
       "(949) 548-8861", "Daily hot lunch",
       "Hot meals daily, no questions asked.",
       33.6313, -117.9271),

    # ---- Inland Empire / Ventura ----
    _p("Feeding America Riverside | San Bernardino", "2950-B Jefferson St", "Riverside", "92504",
       "(951) 359-4757", "Mon-Fri 7am-3:30pm",
       "Inland Empire's food bank — call for partner pantry locations.",
       33.9218, -117.4173),
    _p("FOOD Share of Ventura County", "4156 Southbank Rd", "Oxnard", "93036",
       "(805) 983-7100", "Mon-Fri 8am-4pm",
       "Ventura County's food bank with pantry locator by city.",
       34.2399, -119.1392),
]

SAMPLE_RESOURCES = [
    # ----- Community fridges (24/7, anonymous, no questions) -----
    dict(name="LA Community Fridges (citywide map)", category="community_fridge",
         description="Free 24/7 community fridges across LA — live map of locations. Take what you need, leave what you can. No questions, no ID.",
         zip_code=None, url="https://www.lacommunityfridges.com/",
         tags="undocumented,no_address,recent_immigrant,denied_snap",
         languages="en,es", no_id_required=True, immigration_safe=True),
    dict(name="Long Beach Fridge Network", category="community_fridge",
         description="Multiple fridge locations across Long Beach. Map online.",
         zip_code="90813", url="https://www.lacommunityfridges.com/",
         tags="undocumented,no_address",
         languages="en,es,km", no_id_required=True, immigration_safe=True),

    # ----- Mutual aid (community-run, no bureaucracy) -----
    dict(name="Ground Game LA", category="mutual_aid",
         description="Weekly food distribution + supplies. Run by neighbors for neighbors.",
         zip_code="90026", url="https://mutualaidla.org/",
         tags="undocumented,recent_immigrant,denied_snap,mixed_status",
         languages="en,es", no_id_required=True, immigration_safe=True),
    dict(name="Polo's Pantry", category="mutual_aid",
         description="Mutual-aid pantry serving Pico-Union and surrounding immigrant neighborhoods.",
         zip_code="90006", url="https://www.polospantry.org/",
         tags="undocumented,recent_immigrant,mixed_status",
         languages="en,es", no_id_required=True, immigration_safe=True),
    dict(name="SELAH Neighborhood Homeless Coalition", category="mutual_aid",
         description="Weekly hygiene + food distribution. NE LA. Anyone welcome.",
         zip_code="90041", url="https://selahnhc.org/",
         tags="no_address,undocumented",
         languages="en,es", no_id_required=True, immigration_safe=True),

    # ----- WIC (different eligibility than SNAP — citizen kids of undocumented parents qualify) -----
    dict(name="PHFE WIC Program", category="wic",
         description="WIC supports pregnant people, new parents, and kids under 5. Immigration status doesn't matter for the child's eligibility — undocumented parents CAN apply for their U.S.-citizen kids.",
         phone="(888) 942-2229", url="https://www.phfewic.org/",
         tags="children,mixed_status,recent_immigrant",
         languages="en,es,zh,vi,ko,tl",
         no_id_required=False, immigration_safe=True),
    dict(name="WIC California Hotline", category="wic",
         description="Statewide WIC info and signup. Translators on call.",
         phone="(800) 852-5770",
         tags="children,mixed_status",
         languages="en,es,zh,vi,ko,tl",
         no_id_required=False, immigration_safe=True),

    # ----- School meals (citizenship irrelevant) -----
    dict(name="LAUSD Grab-and-Go Meals", category="school_meal",
         description="Free breakfast + lunch for any student 18 and under at LAUSD sites. No enrollment proof needed in summer.",
         url="https://food.lausd.org/",
         tags="children,mixed_status,undocumented,recent_immigrant",
         languages="en,es", no_id_required=True, immigration_safe=True),
    dict(name="Summer Food Service Program (SFSP)", category="school_meal",
         description="Free summer meals for kids 18 and under at parks, libraries, community centers. No application.",
         url="https://www.cde.ca.gov/ls/nu/sf/",
         tags="children,no_address",
         languages="en,es", no_id_required=True, immigration_safe=True),

    # ----- Senior programs -----
    dict(name="St. Vincent Meals on Wheels", category="senior",
         description="Free or low-cost hot meals delivered to homebound seniors. No income limit at intake.",
         phone="(213) 484-7775", url="https://www.svmow.org/",
         tags="senior,no_kitchen",
         languages="en,es", no_id_required=True, immigration_safe=True),
    dict(name="CSFP — Senior Food Box (LA Food Bank)", category="senior",
         description="Monthly grocery box for seniors 60+. Income limit is higher than SNAP. Citizens, LPRs, refugees, and asylees qualify; LA Food Bank can also connect undocumented seniors to alternative monthly boxes.",
         phone="(323) 234-3030",
         tags="senior,denied_snap",
         languages="en,es", no_id_required=False, immigration_safe=True),

    # ----- Student programs -----
    dict(name="Swipe Out Hunger", category="student",
         description="Free meals on college campuses across SoCal. Most campuses have a basic-needs center.",
         url="https://www.swipehunger.org/",
         tags="student,denied_snap",
         languages="en,es", no_id_required=True, immigration_safe=True),
    dict(name="UCLA Community Programs Office Food Closet", category="student",
         description="Free groceries for UCLA students. No proof of need required.",
         address="220 Westwood Plaza (Student Activities Center)", zip_code="90095", url="https://cpo.ucla.edu/",
         tags="student", languages="en,es",
         no_id_required=False, immigration_safe=True),
    dict(name="CSULB Beach Pantry", category="student",
         description="On-campus food pantry for CSULB students. Anonymous and free.",
         zip_code="90840", url="https://www.csulb.edu/student-affairs/basic-needs/food",
         tags="student", languages="en,es",
         no_id_required=False, immigration_safe=True),

    # ----- Immigrant rights orgs offering food + know-your-rights -----
    dict(name="CHIRLA (Coalition for Humane Immigrant Rights)", category="immigrant_org",
         description="Food distributions, immigration legal help, know-your-rights workshops. Trusted by LA's immigrant community.",
         phone="(213) 353-1333", url="https://www.chirla.org/",
         tags="undocumented,mixed_status,recent_immigrant",
         languages="en,es", no_id_required=True, immigration_safe=True),
    dict(name="Central American Resource Center (CARECEN)", category="immigrant_org",
         description="Food assistance, legal services, and case management for Central American families.",
         phone="(213) 385-7800", url="https://www.carecen-la.org/",
         tags="undocumented,recent_immigrant,mixed_status",
         languages="en,es", no_id_required=True, immigration_safe=True),
    dict(name="Asian Americans Advancing Justice — LA", category="immigrant_org",
         description="Resources and referrals for Asian and Pacific Islander immigrant families.",
         url="https://www.advancingjustice-la.org/",
         tags="recent_immigrant,mixed_status",
         languages="en,zh,ko,vi,tl,th", no_id_required=True, immigration_safe=True),

    # ----- Legal aid -----
    dict(name="Public Counsel — Immigrants' Rights Project", category="legal_aid",
         description="Free legal help on immigration and public benefits. Find out if using a program affects your case (in most cases food assistance does NOT).",
         phone="(213) 385-2977", url="https://publiccounsel.org/",
         tags="undocumented,mixed_status,recent_immigrant",
         languages="en,es", no_id_required=True, immigration_safe=True),

    # ----- Know-your-rights -----
    dict(name="Your Rights at Food Pantries", category="know_your_rights",
         description="Food pantries are private spaces. ICE cannot enter without a judicial warrant. You do not have to answer immigration questions to receive food. You do not need an ID at most pantries listed here.",
         url="https://www.ilrc.org/red-cards",
         tags="undocumented,mixed_status,recent_immigrant",
         languages="en,es,zh,vi,ko,tl,ar",
         no_id_required=True, immigration_safe=True),
    dict(name="Public Charge Rule — What You Should Know", category="know_your_rights",
         description="Using food banks, WIC, school meals, free clinics, and most state programs is NOT considered in a public charge determination. Only cash assistance (SSI, TANF) and long-term institutional care are. When in doubt, talk to a legal-aid org first.",
         url="https://www.uscis.gov/green-card/green-card-processes-and-procedures/public-charge",
         tags="undocumented,mixed_status,recent_immigrant",
         languages="en,es", no_id_required=True, immigration_safe=True),

    # ----- Hotlines -----
    dict(name="211 LA County", category="hotline",
         description="24/7 referrals to food, housing, healthcare. Free, confidential, multilingual. They don't ask about immigration status.",
         phone="211", url="https://www.211la.org/",
         tags="undocumented,mixed_status,recent_immigrant,denied_snap,senior,student,children,no_address",
         languages="en,es,zh,vi,ko,tl,ar,fa,hy",
         no_id_required=True, immigration_safe=True),
    dict(name="USDA National Hunger Hotline", category="hotline",
         description="Find nearby food resources nationwide. English and Spanish.",
         phone="(866) 348-6479",
         tags="denied_snap,no_address",
         languages="en,es", no_id_required=True, immigration_safe=True),

    # ----- Directories & application help -----
    dict(name="One Degree", category="hotline",
         description="Free web directory of vetted social services across California — food, housing, health, legal. Search by ZIP in English or Spanish.",
         url="https://www.1degree.org/",
         tags="denied_snap,undocumented,mixed_status,recent_immigrant,student,senior,children,no_address",
         languages="en,es", no_id_required=True, immigration_safe=True),
    dict(name="FindHelp.org", category="hotline",
         description="National search engine for free and reduced-cost help — type your ZIP and browse food programs near you.",
         url="https://www.findhelp.org/",
         tags="denied_snap,no_address,student,senior",
         languages="en,es", no_id_required=True, immigration_safe=True),
    dict(name="GetCalFresh.org", category="hotline",
         description="Apply for CalFresh online in ~10 minutes. Mixed-status households CAN apply for eligible members (like citizen kids) — applying does not report anyone.",
         url="https://www.getcalfresh.org/",
         tags="mixed_status,children,denied_snap,student",
         languages="en,es,zh", no_id_required=False, immigration_safe=True),

    # ----- More mutual aid / direct services -----
    dict(name="St. Joseph Center", category="mutual_aid",
         description="Venice-based food pantry plus housing and job services. Serves the Westside, no judgment.",
         address="204 Hampton Dr", zip_code="90291", phone="(310) 396-6468",
         url="https://stjosephctr.org/",
         tags="no_address,denied_snap",
         languages="en,es", no_id_required=True, immigration_safe=True),
    dict(name="Seeds of Hope LA", category="mutual_aid",
         description="Community gardens and produce distributions across LA — fresh fruits and vegetables grown and gleaned locally.",
         url="https://seedsofhopela.org/",
         tags="denied_snap,children",
         languages="en,es", no_id_required=True, immigration_safe=True),

    # ----- More immigrant community orgs -----
    dict(name="Little Tokyo Service Center", category="immigrant_org",
         description="Social services for Japanese and broader API communities downtown — food support, seniors, housing help.",
         address="231 E 3rd St", zip_code="90013", phone="(213) 473-3030",
         url="https://www.ltsc.org/",
         tags="recent_immigrant,mixed_status,senior",
         languages="en,ja,es", no_id_required=True, immigration_safe=True),
    dict(name="Thai Community Development Center", category="immigrant_org",
         description="Serves Thai Town and beyond — food distributions, workers' rights, and immigrant services.",
         address="6376 Yucca St", zip_code="90028", phone="(323) 468-2555",
         url="https://thaicdc.org/",
         tags="recent_immigrant,undocumented",
         languages="en,th", no_id_required=True, immigration_safe=True),
    dict(name="Koreatown Youth & Community Center (KYCC)", category="immigrant_org",
         description="Koreatown services for families: food support, youth programs, counseling — Korean and Spanish spoken.",
         address="680 S Wilton Pl", zip_code="90005", phone="(213) 365-7400",
         url="https://www.kyccla.org/",
         tags="recent_immigrant,mixed_status,children",
         languages="en,ko,es", no_id_required=True, immigration_safe=True),
    dict(name="Pilipino Workers Center", category="immigrant_org",
         description="Filipino community organization — caregiver support, food distributions, immigrant rights.",
         address="153 Glendale Blvd", zip_code="90026", phone="(213) 250-4353",
         url="https://www.pwcsc.org/",
         tags="recent_immigrant,undocumented",
         languages="en,tl", no_id_required=True, immigration_safe=True),
    dict(name="TODEC Legal Center", category="immigrant_org",
         description="Inland Empire immigrant rights organization — legal help, know-your-rights, and community support in Riverside/San Bernardino counties.",
         zip_code="92570", url="https://todec.org/",
         tags="undocumented,mixed_status,recent_immigrant",
         languages="en,es", no_id_required=True, immigration_safe=True),

    # ----- More legal aid -----
    dict(name="Esperanza Immigrant Rights Project", category="legal_aid",
         description="Catholic Charities legal program for immigrants — low-cost immigration legal services downtown.",
         address="1530 James M Wood Blvd", zip_code="90015", phone="(213) 251-3505",
         url="https://www.esperanza-la.org/",
         tags="undocumented,recent_immigrant,mixed_status",
         languages="en,es", no_id_required=True, immigration_safe=True),

    # ----- More hotlines -----
    dict(name="211 Orange County", category="hotline",
         description="24/7 referrals to food and services across Orange County. Free, confidential, multilingual.",
         phone="211", url="https://www.211oc.org/",
         tags="denied_snap,undocumented,mixed_status,recent_immigrant,senior,children,no_address",
         languages="en,es,vi,ko", no_id_required=True, immigration_safe=True),
    dict(name="LA County Aging & Disabilities (Area Agency on Aging)", category="senior",
         description="County info line for seniors 60+ — home-delivered meals, senior dining sites, and caregiver support.",
         phone="(800) 510-2020",
         tags="senior",
         languages="en,es", no_id_required=True, immigration_safe=True),
]

# Volunteers are real self-sign-ups only — no sample data.

# Food listings are real business posts only — no sample data.

# ============================================================
# Meal plans: generated from per-diet meal pools so we can cover
# every budget from $10 to $100 across all diets (54 plans total).
# ============================================================
DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

MEAL_POOLS = {
    "any": [
        "Oatmeal w/ banana", "Bean & rice burrito", "Veggie fried rice w/ egg",
        "Lentil soup + bread", "Pasta w/ tomato & spinach", "Chicken thighs + rice",
        "Baked potato + beans + cheese", "Egg & potato hash", "Tuna pasta salad",
        "Chili + cornbread", "Quesadillas + corn salad", "Chicken & vegetable soup",
        "Tacos + beans", "Arroz con pollo",
    ],
    "vegetarian": [
        "Veggie omelette + toast", "Dal (lentil curry) + rice", "Bean tacos w/ slaw",
        "Vegetable stir-fry + noodles", "Chickpea curry + rice", "Grilled cheese + tomato soup",
        "Veggie pasta bake", "Mac & cheese w/ peas", "Lentil sloppy joes",
        "Veggie pizza (homemade)", "Burrito bowls", "Pancakes + eggs + fruit",
    ],
    "vegan": [
        "Oatmeal w/ peanut butter & banana", "Tofu stir-fry + rice", "Black bean tacos",
        "Chickpea & spinach curry", "Lentil bolognese + pasta", "Rice & beans w/ avocado",
        "Vegetable soup + crusty bread", "Hummus wrap + carrots", "Peanut noodle bowl",
        "Veggie chili", "Roasted vegetables + quinoa", "Vegan banana pancakes",
    ],
    "halal": [
        "Foul (fava beans) + pita", "Halal chicken & rice", "Lentil soup + flatbread",
        "Vegetable couscous", "Chicken shawarma-style wrap", "Egg & tomato scramble + bread",
        "Chickpea stew + rice", "Halal beef kofta + bulgur", "Spiced rice w/ peas",
        "Bean & vegetable tagine", "Halal chicken biryani", "Yogurt + fruit + flatbread",
    ],
    "gluten_free": [
        "Rice porridge w/ banana", "Corn tortilla bean tacos", "Baked potato + cheese + broccoli",
        "Chicken & rice bowl", "Egg & potato hash", "Rice noodle stir-fry",
        "Chili (no flour) + rice", "Polenta w/ vegetables", "GF oats + fruit",
        "Stuffed peppers w/ rice", "Frittata + salad", "Beans + corn salad",
    ],
    "diabetic": [
        "Eggs + spinach + whole-grain toast", "Tuna salad over greens", "Chicken & vegetable soup",
        "Black bean & egg scramble", "Lentil salad w/ cucumber", "Baked chicken + green beans",
        "Cabbage & bean stew", "Greek yogurt + nuts", "Turkey lettuce wraps",
        "Cauliflower fried rice", "Zucchini & egg skillet", "No-sugar bean & veg chili",
    ],
}

DIET_SUMMARIES = {
    "any": "Budget-stretching staples: beans, rice, eggs, seasonal produce, and one-pot meals.",
    "vegetarian": "Meat-free week built on lentils, beans, eggs, cheese, and seasonal produce.",
    "vegan": "Fully plant-based: beans, tofu, grains, and vegetables. No animal products.",
    "halal": "Halal-friendly: halal meat from ethnic markets, lentils, rice, and vegetables. No pork, no alcohol-based ingredients.",
    "gluten_free": "No wheat, barley, or rye. Rice, corn tortillas, potatoes, beans, and eggs keep it cheap.",
    "diabetic": "Lower-carb, high-fiber meals to keep blood sugar steadier. Lean proteins, beans, and leafy greens.",
}

DIET_TITLES = {
    "any": "", "vegetarian": " vegetarian", "vegan": " vegan",
    "halal": " halal", "gluten_free": " gluten-free", "diabetic": " diabetic-friendly",
}


def _household_label(servings):
    return "1 adult" if servings == 1 else f"{servings} people" if servings == 2 else f"family of {servings}"


def _make_plan(budget, servings, diet):
    pool = MEAL_POOLS[diet]
    start = (budget + servings * 3) % len(pool)  # deterministic variety
    meals = [pool[(start + i) % len(pool)] for i in range(7)]
    base = budget * 0.70 / 7  # dinners get ~70% of budget; rest covers staples
    recipes = []
    for i, (day, meal) in enumerate(zip(DAYS, meals)):
        wiggle = 0.80 + 0.40 * (((i * 37) + budget) % 10) / 10
        recipes.append({"day": day, "meal": meal, "cost": round(base * wiggle, 2)})
    return dict(
        title=f"${budget}/week{DIET_TITLES[diet]}, {_household_label(servings)}",
        weekly_budget_usd=float(budget),
        servings=servings,
        diet=diet,
        summary=DIET_SUMMARIES[diet],
        recipes_json=json.dumps(recipes),
    )


def build_meal_plans():
    plans = [
        # Handcrafted: no-kitchen plan stays special.
        dict(title="$15/week, no kitchen", weekly_budget_usd=15.0, servings=1, diet="any",
             summary="For folks without cooking access. Ready-to-eat shelf staples + free hot meal stops.",
             recipes_json=json.dumps([
                 {"day": "Mon", "meal": "Peanut butter + bread + apple", "cost": 1.50},
                 {"day": "Tue", "meal": "Canned tuna + crackers + carrots", "cost": 2.00},
                 {"day": "Wed", "meal": "Trail mix + banana + yogurt cup", "cost": 2.30},
                 {"day": "Thu", "meal": "Free hot meal — Hollywood Food Coalition", "cost": 0.00},
                 {"day": "Fri", "meal": "Bagel + cream cheese + orange", "cost": 1.80},
                 {"day": "Sat", "meal": "Canned chili (ready-to-eat) + roll", "cost": 2.20},
                 {"day": "Sun", "meal": "Free hot meal — St. Francis Center", "cost": 0.00},
             ])),
    ]
    # Singles: every diet at every budget tier from $10 to $35.
    for budget in (10, 15, 20, 25, 30, 35):
        for diet in ("any", "vegetarian", "vegan", "halal", "gluten_free", "diabetic"):
            plans.append(_make_plan(budget, 1, diet))
    # Couples.
    for budget in (30, 40, 50):
        for diet in ("any", "vegetarian", "vegan"):
            plans.append(_make_plan(budget, 2, diet))
    # Families.
    for budget in (60, 70, 80):
        for diet in ("any", "vegetarian"):
            plans.append(_make_plan(budget, 4, diet))
    plans.append(_make_plan(85, 5, "any"))
    plans.append(_make_plan(100, 6, "any"))
    return plans


def run():
    db = SessionLocal()
    try:
        # Pantries: guarded (only seed when empty).
        if db.query(models.Pantry).count() == 0:
            db.add_all([models.Pantry(**p) for p in SAMPLE_PANTRIES])
        # Food listings + volunteers: real self-sign-ups only — nothing seeded.
        # Resources + meal plans: pure curated catalogs (no user data),
        # always refresh so edits (e.g. link fixes) take effect on every deploy.
        db.query(models.Resource).delete()
        db.add_all([models.Resource(**r) for r in SAMPLE_RESOURCES])
        db.query(models.MealPlan).delete()
        db.add_all([models.MealPlan(**m) for m in build_meal_plans()])
        db.commit()
        print("Seed complete.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
