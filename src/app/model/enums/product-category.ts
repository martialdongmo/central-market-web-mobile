export enum ProductCategory {
  // =========================
  // FASHION - HOMME
  // =========================
  MEN_CLOTHING = 'MEN_CLOTHING',
  SHIRT = 'SHIRT',
  T_SHIRT = 'T_SHIRT',
  SUIT = 'SUIT',
  MEN_PANTS = 'MEN_PANTS',
  MEN_JEANS = 'MEN_JEANS',
  SHORTS = 'SHORTS',
  BOUBOU = 'BOUBOU',
  MEN_SHOES = 'MEN_SHOES',

  // =========================
  // FASHION - FEMME
  // =========================
  WOMEN_CLOTHING = 'WOMEN_CLOTHING',
  DRESS = 'DRESS',
  SKIRT = 'SKIRT',
  NIGHTGOWN = 'NIGHTGOWN',
  BLOUSE = 'BLOUSE',
  JUMPSUIT = 'JUMPSUIT',
  LINGERIE = 'LINGERIE',
  WOMEN_JEANS = 'WOMEN_JEANS',
  WOMEN_SHOES = 'WOMEN_SHOES',
  HEELS = 'HEELS',

  // =========================
  // FASHION - COMMUN / UNISEXE
  // =========================
  JACKET = 'JACKET',
  COAT = 'COAT',
  SWEATER = 'SWEATER',
  HOODIE = 'HOODIE',
  TRADITIONAL_WEAR = 'TRADITIONAL_WEAR',
  SNEAKERS = 'SNEAKERS',
  SANDALS = 'SANDALS',
  BOOTS = 'BOOTS',
  SHOES = 'SHOES',
  BAGS = 'BAGS',
  HANDBAG = 'HANDBAG',
  BACKPACK = 'BACKPACK',
  TRAVEL_BAG = 'TRAVEL_BAG',
  WATCHES = 'WATCHES',
  JEWELRY = 'JEWELRY',

  // =========================
  // ELECTRONICS
  // =========================
  SMARTPHONES = 'SMARTPHONES',
  LAPTOPS = 'LAPTOPS',
  TABLETS = 'TABLETS',
  TELEVISIONS = 'TELEVISIONS',
  AUDIO = 'AUDIO',
  CAMERAS = 'CAMERAS',
  GAMING = 'GAMING',
  ACCESSORIES = 'ACCESSORIES',

  // =========================
  // FOOD
  // =========================
  GROCERIES = 'GROCERIES',
  DRINKS = 'DRINKS',
  FAST_FOOD = 'FAST_FOOD',
  BAKERY = 'BAKERY',
  FRUITS = 'FRUITS',
  VEGETABLES = 'VEGETABLES',

  // =========================
  // HOME
  // =========================
  FURNITURE = 'FURNITURE',
  HOME_DECOR = 'HOME_DECOR',
  KITCHEN = 'KITCHEN',
  BEDDING = 'BEDDING',
  HOME_APPLIANCES = 'HOME_APPLIANCES',

  // =========================
  // BEAUTY
  // =========================
  MAKEUP = 'MAKEUP',
  SKINCARE = 'SKINCARE',
  PERFUMES = 'PERFUMES',
  HAIRCARE = 'HAIRCARE',
  PERSONAL_CARE = 'PERSONAL_CARE',

  // =========================
  // HEALTH & WELLNESS
  // =========================
  MEDICINE = 'MEDICINE',
  FITNESS = 'FITNESS',
  SUPPLEMENTS = 'SUPPLEMENTS',
  NUTRITION_WELLNESS = 'NUTRITION_WELLNESS',
  ALOE_VERA_DRINKS = 'ALOE_VERA_DRINKS',
  HIVE_PRODUCTS = 'HIVE_PRODUCTS',

  // =========================
  // BUNDLES
  // =========================
  PACKS = 'PACKS',

  // =========================
  // SPORTS
  // =========================
  SPORTS_EQUIPMENT = 'SPORTS_EQUIPMENT',
  BICYCLES = 'BICYCLES',

  // =========================
  // BOOKS
  // =========================
  BOOKS = 'BOOKS',
  SCHOOL_SUPPLIES = 'SCHOOL_SUPPLIES',

  // =========================
  // BABY
  // =========================
  BABY_CLOTHING = 'BABY_CLOTHING',
  BABY_BODYSUIT = 'BABY_BODYSUIT',
  BABY_SHOES = 'BABY_SHOES',
  TOYS = 'TOYS',

  // =========================
  // AUTOMOTIVE
  // =========================
  CAR_PARTS = 'CAR_PARTS',
  MOTORCYCLE_PARTS = 'MOTORCYCLE_PARTS',

  // =========================
  // PETS
  // =========================
  PET_FOOD = 'PET_FOOD',
  PET_ACCESSORIES = 'PET_ACCESSORIES',

  // =========================
  // SERVICES
  // =========================
  DIGITAL_SERVICES = 'DIGITAL_SERVICES',
  HOME_SERVICES = 'HOME_SERVICES',

  // =========================
  // MARQUES - SMARTPHONES & INFORMATIQUE
  // =========================
  IPHONE = 'IPHONE',
  SAMSUNG = 'SAMSUNG',
  TECNO = 'TECNO',
  INFINIX = 'INFINIX',
  ITEL = 'ITEL',
  HUAWEI = 'HUAWEI',
  XIAOMI = 'XIAOMI',
  OPPO = 'OPPO',
  VIVO = 'VIVO',
  NOKIA = 'NOKIA',
  HP = 'HP',
  DELL = 'DELL',
  LENOVO = 'LENOVO',
  ASUS = 'ASUS',
  ACER = 'ACER',
  APPLE_MAC = 'APPLE_MAC',
  MICROSOFT = 'MICROSOFT',

  // =========================
  // MARQUES - AUDIO, PHOTO & GAMING
  // =========================
  JBL = 'JBL',
  BOSE = 'BOSE',
  SONY = 'SONY',
  CANON = 'CANON',
  NIKON = 'NIKON',
  PLAYSTATION = 'PLAYSTATION',
  XBOX = 'XBOX',
  NINTENDO = 'NINTENDO',

  // =========================
  // MARQUES - ELECTROMENAGER & TV
  // =========================
  LG = 'LG',
  HISENSE = 'HISENSE',
  TCL = 'TCL',
  PHILIPS = 'PHILIPS',
  BOSCH = 'BOSCH',
  WHIRLPOOL = 'WHIRLPOOL',
  NASCO = 'NASCO',
  ARMCO = 'ARMCO',
  SONA = 'SONA',
  BINATONE = 'BINATONE',
  POLYSTAR = 'POLYSTAR',

  // =========================
  // MARQUES - MODE & SPORTSWEAR
  // =========================
  NIKE = 'NIKE',
  ADIDAS = 'ADIDAS',
  PUMA = 'PUMA',
  ZARA = 'ZARA',
  H_AND_M = 'H_AND_M',
  GUCCI = 'GUCCI',
  LOUIS_VUITTON = 'LOUIS_VUITTON',
  LACOSTE = 'LACOSTE',
  TOMMY_HILFIGER = 'TOMMY_HILFIGER',
  LEVIS = 'LEVIS',
  CONVERSE = 'CONVERSE',
  VANS = 'VANS',
  FILA = 'FILA',
  REEBOK = 'REEBOK',
  UNDER_ARMOUR = 'UNDER_ARMOUR',
  BALENCIAGA = 'BALENCIAGA',
  DECATHLON = 'DECATHLON',

  // =========================
  // MARQUES - BEAUTE & SOINS
  // =========================
  LOREAL = 'LOREAL',
  NIVEA = 'NIVEA',
  DOVE = 'DOVE',
  REXONA = 'REXONA',
  PALMERS = 'PALMERS',
  VASELINE = 'VASELINE',
  SHEA_MOISTURE = 'SHEA_MOISTURE',
  MAC_COSMETICS = 'MAC_COSMETICS',
  CERAVE = 'CERAVE',
  GARNIER = 'GARNIER',
  PANTENE = 'PANTENE',
  TRESEMME = 'TRESEMME',
  FOREVER_LIVING = 'FOREVER_LIVING',
  OMO = 'OMO',
  ARIEL = 'ARIEL',

  // =========================
  // MARQUES - BOISSONS & ALIMENTATION
  // =========================
  NESTLE = 'NESTLE',
  COCA_COLA = 'COCA_COLA',
  PEPSI = 'PEPSI',
  GUINNESS = 'GUINNESS',
  HEINEKEN = 'HEINEKEN',
  CASTEL = 'CASTEL',
  BRASSERIES_DU_CAMEROUN = 'BRASSERIES_DU_CAMEROUN',
  AZUR = 'AZUR',
  TOP = 'TOP',
  MALTA_GUINNESS = 'MALTA_GUINNESS',
  FANTA = 'FANTA',
  SPRITE = 'SPRITE',
  NIDO = 'NIDO',
  MILO = 'MILO',
  CERELAC = 'CERELAC',
  INDOMIE = 'INDOMIE',

  // =========================
  // MARQUES - AUTOMOBILE
  // =========================
  TOYOTA = 'TOYOTA',
  HYUNDAI = 'HYUNDAI',
  KIA = 'KIA',
  NISSAN = 'NISSAN',
  MERCEDES = 'MERCEDES',
  BMW = 'BMW',
  FORD = 'FORD',
  HONDA = 'HONDA',
  PEUGEOT = 'PEUGEOT',
  RENAULT = 'RENAULT',
  MITSUBISHI = 'MITSUBISHI',
  VOLKSWAGEN = 'VOLKSWAGEN',

  // =========================
  // MARQUES - MOTOS
  // =========================
  YAMAHA = 'YAMAHA',
  BAJAJ = 'BAJAJ',
  TVS = 'TVS',
  HAOJUE = 'HAOJUE',
  SANYA = 'SANYA',

  // =========================
  // MARQUES - BEBE
  // =========================
  PAMPERS = 'PAMPERS',
  HUGGIES = 'HUGGIES',
  JOHNSON = 'JOHNSON',
  NAN = 'NAN',
  AVENT = 'AVENT',

  // =========================
  // CONSTRUCTION - GROS OEUVRE
  // =========================
  CONSTRUCTION_MATERIALS = 'CONSTRUCTION_MATERIALS',
  CEMENT = 'CEMENT',
  CONCRETE_BLOCKS = 'CONCRETE_BLOCKS',
  SAND_GRAVEL = 'SAND_GRAVEL',
  REBAR_STEEL = 'REBAR_STEEL',
  BRICKS = 'BRICKS',

  // =========================
  // CONSTRUCTION - PLOMBERIE
  // =========================
  PLUMBING = 'PLUMBING',
  PLUMBING_PIPES = 'PLUMBING_PIPES',
  PLUMBING_FITTINGS = 'PLUMBING_FITTINGS',
  WATER_TANKS = 'WATER_TANKS',
  WATER_PUMPS = 'WATER_PUMPS',
  TAPS_FAUCETS = 'TAPS_FAUCETS',
  SANITARY_WARE = 'SANITARY_WARE',

  // =========================
  // CONSTRUCTION - ELECTRICITE
  // =========================
  ELECTRICAL_SUPPLIES = 'ELECTRICAL_SUPPLIES',
  ELECTRICAL_CABLES = 'ELECTRICAL_CABLES',
  SWITCHES_SOCKETS = 'SWITCHES_SOCKETS',
  CIRCUIT_BREAKERS = 'CIRCUIT_BREAKERS',
  LIGHTING_FIXTURES = 'LIGHTING_FIXTURES',
  GENERATORS = 'GENERATORS',
  SOLAR_EQUIPMENT = 'SOLAR_EQUIPMENT',

  // =========================
  // CONSTRUCTION - PEINTURE & FINITION
  // =========================
  PAINT = 'PAINT',
  VARNISH = 'VARNISH',
  WALLPAPER = 'WALLPAPER',
  ADHESIVES_GLUE = 'ADHESIVES_GLUE',

  // =========================
  // CONSTRUCTION - SOLS & PLAFONDS
  // =========================
  TILES = 'TILES',
  FLOORING = 'FLOORING',
  CEILING_MATERIALS = 'CEILING_MATERIALS',

  // =========================
  // CONSTRUCTION - MENUISERIE & TOITURE
  // =========================
  DOORS_WINDOWS = 'DOORS_WINDOWS',
  WOOD_TIMBER = 'WOOD_TIMBER',
  METAL_PROFILES = 'METAL_PROFILES',
  ROOFING_MATERIALS = 'ROOFING_MATERIALS',
  GUTTERS = 'GUTTERS',

  // =========================
  // CONSTRUCTION - QUINCAILLERIE & OUTILLAGE
  // =========================
  HARDWARE_TOOLS = 'HARDWARE_TOOLS',
  POWER_TOOLS = 'POWER_TOOLS',
  HAND_TOOLS = 'HAND_TOOLS',
  FASTENERS = 'FASTENERS',
  LOCKS_HINGES = 'LOCKS_HINGES',
  LADDERS = 'LADDERS',

  // =========================
  // CONSTRUCTION - SOUDURE & SECURITE CHANTIER
  // =========================
  WELDING_METALWORK = 'WELDING_METALWORK',
  WELDING_EQUIPMENT = 'WELDING_EQUIPMENT',
  SCAFFOLDING = 'SCAFFOLDING',
  SAFETY_EQUIPMENT = 'SAFETY_EQUIPMENT',
  INSULATION_MATERIALS = 'INSULATION_MATERIALS',

  // =========================
  // MARQUES - CONSTRUCTION & BTP
  // =========================
  CIMENCAM = 'CIMENCAM',
  DANGOTE_CEMENT = 'DANGOTE_CEMENT',
  LAFARGE = 'LAFARGE',
  MAKITA = 'MAKITA',
  DEWALT = 'DEWALT',
  STANLEY = 'STANLEY',
  BLACK_DECKER = 'BLACK_DECKER',
  NEXANS = 'NEXANS',
  SCHNEIDER_ELECTRIC = 'SCHNEIDER_ELECTRIC',
  LEGRAND = 'LEGRAND',
  FIRMAN = 'FIRMAN',
  JINKO_SOLAR = 'JINKO_SOLAR',
  DULUX = 'DULUX',
  CROWN_PAINT = 'CROWN_PAINT',

  OTHER = 'OTHER'
}

export const PRODUCT_CATEGORY_LABEL: Record<ProductCategory, string> = {
  // FASHION - HOMME
  [ProductCategory.MEN_CLOTHING]: 'Vêtements homme',
  [ProductCategory.SHIRT]: 'Chemise',
  [ProductCategory.T_SHIRT]: 'T-shirt',
  [ProductCategory.SUIT]: 'Costume',
  [ProductCategory.MEN_PANTS]: 'Pantalon homme',
  [ProductCategory.MEN_JEANS]: 'Jean homme',
  [ProductCategory.SHORTS]: 'Short',
  [ProductCategory.BOUBOU]: 'Boubou',
  [ProductCategory.MEN_SHOES]: 'Chaussures homme',

  // FASHION - FEMME
  [ProductCategory.WOMEN_CLOTHING]: 'Vêtements femme',
  [ProductCategory.DRESS]: 'Robe',
  [ProductCategory.SKIRT]: 'Jupe',
  [ProductCategory.NIGHTGOWN]: 'Nuisette',
  [ProductCategory.BLOUSE]: 'Chemisier',
  [ProductCategory.JUMPSUIT]: 'Combinaison',
  [ProductCategory.LINGERIE]: 'Lingerie',
  [ProductCategory.WOMEN_JEANS]: 'Jean femme',
  [ProductCategory.WOMEN_SHOES]: 'Chaussures femme',
  [ProductCategory.HEELS]: 'Talons',

  // FASHION - COMMUN / UNISEXE
  [ProductCategory.JACKET]: 'Veste',
  [ProductCategory.COAT]: 'Manteau',
  [ProductCategory.SWEATER]: 'Pull',
  [ProductCategory.HOODIE]: 'Sweat à capuche',
  [ProductCategory.TRADITIONAL_WEAR]: 'Tenue traditionnelle',
  [ProductCategory.SNEAKERS]: 'Baskets',
  [ProductCategory.SANDALS]: 'Sandales',
  [ProductCategory.BOOTS]: 'Bottes',
  [ProductCategory.SHOES]: 'Chaussures',
  [ProductCategory.BAGS]: 'Sacs',
  [ProductCategory.HANDBAG]: 'Sac à main',
  [ProductCategory.BACKPACK]: 'Sac à dos',
  [ProductCategory.TRAVEL_BAG]: 'Valise / Sac de voyage',
  [ProductCategory.WATCHES]: 'Montres',
  [ProductCategory.JEWELRY]: 'Bijoux',

  // ELECTRONICS
  [ProductCategory.SMARTPHONES]: 'Smartphones',
  [ProductCategory.LAPTOPS]: 'Ordinateurs portables',
  [ProductCategory.TABLETS]: 'Tablettes',
  [ProductCategory.TELEVISIONS]: 'Téléviseurs',
  [ProductCategory.AUDIO]: 'Audio',
  [ProductCategory.CAMERAS]: 'Appareils photo',
  [ProductCategory.GAMING]: 'Jeux vidéo',
  [ProductCategory.ACCESSORIES]: 'Accessoires',

  // FOOD
  [ProductCategory.GROCERIES]: 'Épicerie',
  [ProductCategory.DRINKS]: 'Boissons',
  [ProductCategory.FAST_FOOD]: 'Restauration rapide',
  [ProductCategory.BAKERY]: 'Boulangerie',
  [ProductCategory.FRUITS]: 'Fruits',
  [ProductCategory.VEGETABLES]: 'Légumes',

  // HOME
  [ProductCategory.FURNITURE]: 'Meubles',
  [ProductCategory.HOME_DECOR]: 'Décoration',
  [ProductCategory.KITCHEN]: 'Cuisine',
  [ProductCategory.BEDDING]: 'Literie',
  [ProductCategory.HOME_APPLIANCES]: 'Électroménager',

  // BEAUTY
  [ProductCategory.MAKEUP]: 'Maquillage',
  [ProductCategory.SKINCARE]: 'Soins de la peau',
  [ProductCategory.PERFUMES]: 'Parfums',
  [ProductCategory.HAIRCARE]: 'Soins capillaires',
  [ProductCategory.PERSONAL_CARE]: 'Soins personnels',

  // HEALTH & WELLNESS
  [ProductCategory.MEDICINE]: 'Médicaments',
  [ProductCategory.FITNESS]: 'Fitness & minceur',
  [ProductCategory.SUPPLEMENTS]: 'Compléments alimentaires',
  [ProductCategory.NUTRITION_WELLNESS]: 'Nutrition & bien-être',
  [ProductCategory.ALOE_VERA_DRINKS]: 'Buvables à l\'aloe vera',
  [ProductCategory.HIVE_PRODUCTS]: 'Produits de la ruche',

  // BUNDLES
  [ProductCategory.PACKS]: 'Packs',

  // SPORTS
  [ProductCategory.SPORTS_EQUIPMENT]: 'Équipement sportif',
  [ProductCategory.BICYCLES]: 'Vélos',

  // BOOKS
  [ProductCategory.BOOKS]: 'Livres',
  [ProductCategory.SCHOOL_SUPPLIES]: 'Fournitures scolaires',

  // BABY
  [ProductCategory.BABY_CLOTHING]: 'Vêtements bébé',
  [ProductCategory.BABY_BODYSUIT]: 'Body bébé',
  [ProductCategory.BABY_SHOES]: 'Chaussures bébé',
  [ProductCategory.TOYS]: 'Jouets',

  // AUTOMOTIVE
  [ProductCategory.CAR_PARTS]: 'Pièces automobiles',
  [ProductCategory.MOTORCYCLE_PARTS]: 'Pièces moto',

  // PETS
  [ProductCategory.PET_FOOD]: 'Nourriture pour animaux',
  [ProductCategory.PET_ACCESSORIES]: 'Accessoires pour animaux',

  // SERVICES
  [ProductCategory.DIGITAL_SERVICES]: 'Services numériques',
  [ProductCategory.HOME_SERVICES]: 'Services à domicile',

  // MARQUES - SMARTPHONES & INFORMATIQUE
  [ProductCategory.IPHONE]: 'iPhone',
  [ProductCategory.SAMSUNG]: 'Samsung',
  [ProductCategory.TECNO]: 'Tecno',
  [ProductCategory.INFINIX]: 'Infinix',
  [ProductCategory.ITEL]: 'Itel',
  [ProductCategory.HUAWEI]: 'Huawei',
  [ProductCategory.XIAOMI]: 'Xiaomi',
  [ProductCategory.OPPO]: 'Oppo',
  [ProductCategory.VIVO]: 'Vivo',
  [ProductCategory.NOKIA]: 'Nokia',
  [ProductCategory.HP]: 'HP',
  [ProductCategory.DELL]: 'Dell',
  [ProductCategory.LENOVO]: 'Lenovo',
  [ProductCategory.ASUS]: 'Asus',
  [ProductCategory.ACER]: 'Acer',
  [ProductCategory.APPLE_MAC]: 'Apple Mac',
  [ProductCategory.MICROSOFT]: 'Microsoft',

  // MARQUES - AUDIO, PHOTO & GAMING
  [ProductCategory.JBL]: 'JBL',
  [ProductCategory.BOSE]: 'Bose',
  [ProductCategory.SONY]: 'Sony',
  [ProductCategory.CANON]: 'Canon',
  [ProductCategory.NIKON]: 'Nikon',
  [ProductCategory.PLAYSTATION]: 'PlayStation',
  [ProductCategory.XBOX]: 'Xbox',
  [ProductCategory.NINTENDO]: 'Nintendo',

  // MARQUES - ELECTROMENAGER & TV
  [ProductCategory.LG]: 'LG',
  [ProductCategory.HISENSE]: 'Hisense',
  [ProductCategory.TCL]: 'TCL',
  [ProductCategory.PHILIPS]: 'Philips',
  [ProductCategory.BOSCH]: 'Bosch',
  [ProductCategory.WHIRLPOOL]: 'Whirlpool',
  [ProductCategory.NASCO]: 'Nasco',
  [ProductCategory.ARMCO]: 'Armco',
  [ProductCategory.SONA]: 'Sona',
  [ProductCategory.BINATONE]: 'Binatone',
  [ProductCategory.POLYSTAR]: 'Polystar',

  // MARQUES - MODE & SPORTSWEAR
  [ProductCategory.NIKE]: 'Nike',
  [ProductCategory.ADIDAS]: 'Adidas',
  [ProductCategory.PUMA]: 'Puma',
  [ProductCategory.ZARA]: 'Zara',
  [ProductCategory.H_AND_M]: 'H&M',
  [ProductCategory.GUCCI]: 'Gucci',
  [ProductCategory.LOUIS_VUITTON]: 'Louis Vuitton',
  [ProductCategory.LACOSTE]: 'Lacoste',
  [ProductCategory.TOMMY_HILFIGER]: 'Tommy Hilfiger',
  [ProductCategory.LEVIS]: 'Levi\'s',
  [ProductCategory.CONVERSE]: 'Converse',
  [ProductCategory.VANS]: 'Vans',
  [ProductCategory.FILA]: 'Fila',
  [ProductCategory.REEBOK]: 'Reebok',
  [ProductCategory.UNDER_ARMOUR]: 'Under Armour',
  [ProductCategory.BALENCIAGA]: 'Balenciaga',
  [ProductCategory.DECATHLON]: 'Decathlon',

  // MARQUES - BEAUTE & SOINS
  [ProductCategory.LOREAL]: 'L\'Oréal',
  [ProductCategory.NIVEA]: 'Nivea\'',
  [ProductCategory.DOVE]: 'Dove',
  [ProductCategory.REXONA]: 'Rexona',
  [ProductCategory.PALMERS]: 'Palmer\'s',
  [ProductCategory.VASELINE]: 'Vaseline',
  [ProductCategory.SHEA_MOISTURE]: 'Shea Moisture',
  [ProductCategory.MAC_COSMETICS]: 'MAC Cosmetics',
  [ProductCategory.CERAVE]: 'CeraVe',
  [ProductCategory.GARNIER]: 'Garnier',
  [ProductCategory.PANTENE]: 'Pantene',
  [ProductCategory.TRESEMME]: 'TRESemmé',
  [ProductCategory.FOREVER_LIVING]: 'Forever Living',
  [ProductCategory.OMO]: 'Omo',
  [ProductCategory.ARIEL]: 'Ariel',

  // MARQUES - BOISSONS & ALIMENTATION
  [ProductCategory.NESTLE]: 'Nestlé',
  [ProductCategory.COCA_COLA]: 'Coca-Cola',
  [ProductCategory.PEPSI]: 'Pepsi',
  [ProductCategory.GUINNESS]: 'Guinness',
  [ProductCategory.HEINEKEN]: 'Heineken',
  [ProductCategory.CASTEL]: 'Castel',
  [ProductCategory.BRASSERIES_DU_CAMEROUN]: 'Brasseries du Cameroun',
  [ProductCategory.AZUR]: 'Azur',
  [ProductCategory.TOP]: 'Top',
  [ProductCategory.MALTA_GUINNESS]: 'Malta Guinness',
  [ProductCategory.FANTA]: 'Fanta',
  [ProductCategory.SPRITE]: 'Sprite',
  [ProductCategory.NIDO]: 'Nido',
  [ProductCategory.MILO]: 'Milo',
  [ProductCategory.CERELAC]: 'Cerelac',
  [ProductCategory.INDOMIE]: 'Indomie',

  // MARQUES - AUTOMOBILE
  [ProductCategory.TOYOTA]: 'Toyota',
  [ProductCategory.HYUNDAI]: 'Hyundai',
  [ProductCategory.KIA]: 'Kia',
  [ProductCategory.NISSAN]: 'Nissan',
  [ProductCategory.MERCEDES]: 'Mercedes',
  [ProductCategory.BMW]: 'BMW',
  [ProductCategory.FORD]: 'Ford',
  [ProductCategory.HONDA]: 'Honda',
  [ProductCategory.PEUGEOT]: 'Peugeot',
  [ProductCategory.RENAULT]: 'Renault',
  [ProductCategory.MITSUBISHI]: 'Mitsubishi',
  [ProductCategory.VOLKSWAGEN]: 'Volkswagen',

  // MARQUES - MOTOS
  [ProductCategory.YAMAHA]: 'Yamaha',
  [ProductCategory.BAJAJ]: 'Bajaj',
  [ProductCategory.TVS]: 'TVS',
  [ProductCategory.HAOJUE]: 'Haojue',
  [ProductCategory.SANYA]: 'Sanya',

  // MARQUES - BEBE
  [ProductCategory.PAMPERS]: 'Pampers',
  [ProductCategory.HUGGIES]: 'Huggies',
  [ProductCategory.JOHNSON]: 'Johnson',
  [ProductCategory.NAN]: 'Nan',
  [ProductCategory.AVENT]: 'Avent',

  // CONSTRUCTION - GROS OEUVRE
  [ProductCategory.CONSTRUCTION_MATERIALS]: 'Matériaux de construction',
  [ProductCategory.CEMENT]: 'Ciment',
  [ProductCategory.CONCRETE_BLOCKS]: 'Parpaings / Blocs béton',
  [ProductCategory.SAND_GRAVEL]: 'Sable & gravier',
  [ProductCategory.REBAR_STEEL]: 'Fer à béton',
  [ProductCategory.BRICKS]: 'Briques',

  // CONSTRUCTION - PLOMBERIE
  [ProductCategory.PLUMBING]: 'Plomberie',
  [ProductCategory.PLUMBING_PIPES]: 'Tuyaux',
  [ProductCategory.PLUMBING_FITTINGS]: 'Raccords de plomberie',
  [ProductCategory.WATER_TANKS]: 'Réservoirs d\'eau',
  [ProductCategory.WATER_PUMPS]: 'Pompes à eau',
  [ProductCategory.TAPS_FAUCETS]: 'Robinetterie',
  [ProductCategory.SANITARY_WARE]: 'Sanitaires',

  // CONSTRUCTION - ELECTRICITE
  [ProductCategory.ELECTRICAL_SUPPLIES]: 'Matériel électrique',
  [ProductCategory.ELECTRICAL_CABLES]: 'Câbles électriques',
  [ProductCategory.SWITCHES_SOCKETS]: 'Interrupteurs & prises',
  [ProductCategory.CIRCUIT_BREAKERS]: 'Disjoncteurs',
  [ProductCategory.LIGHTING_FIXTURES]: 'Luminaires',
  [ProductCategory.GENERATORS]: 'Groupes électrogènes',
  [ProductCategory.SOLAR_EQUIPMENT]: 'Équipement solaire',

  // CONSTRUCTION - PEINTURE & FINITION
  [ProductCategory.PAINT]: 'Peinture',
  [ProductCategory.VARNISH]: 'Vernis',
  [ProductCategory.WALLPAPER]: 'Papier peint',
  [ProductCategory.ADHESIVES_GLUE]: 'Colles & adhésifs',

  // CONSTRUCTION - SOLS & PLAFONDS
  [ProductCategory.TILES]: 'Carrelage',
  [ProductCategory.FLOORING]: 'Revêtements de sol',
  [ProductCategory.CEILING_MATERIALS]: 'Faux plafonds',

  // CONSTRUCTION - MENUISERIE & TOITURE
  [ProductCategory.DOORS_WINDOWS]: 'Portes & fenêtres',
  [ProductCategory.WOOD_TIMBER]: 'Bois de construction',
  [ProductCategory.METAL_PROFILES]: 'Profilés métalliques',
  [ProductCategory.ROOFING_MATERIALS]: 'Matériaux de toiture',
  [ProductCategory.GUTTERS]: 'Gouttières',

  // CONSTRUCTION - QUINCAILLERIE & OUTILLAGE
  [ProductCategory.HARDWARE_TOOLS]: 'Quincaillerie',
  [ProductCategory.POWER_TOOLS]: 'Outillage électroportatif',
  [ProductCategory.HAND_TOOLS]: 'Outillage à main',
  [ProductCategory.FASTENERS]: 'Visserie & boulonnerie',
  [ProductCategory.LOCKS_HINGES]: 'Serrures & charnières',
  [ProductCategory.LADDERS]: 'Échelles',

  // CONSTRUCTION - SOUDURE & SECURITE CHANTIER
  [ProductCategory.WELDING_METALWORK]: 'Soudure & métallerie',
  [ProductCategory.WELDING_EQUIPMENT]: 'Postes à souder',
  [ProductCategory.SCAFFOLDING]: 'Échafaudages',
  [ProductCategory.SAFETY_EQUIPMENT]: 'Équipement de sécurité (EPI)',
  [ProductCategory.INSULATION_MATERIALS]: 'Matériaux d\'isolation',

  // MARQUES - CONSTRUCTION & BTP
  [ProductCategory.CIMENCAM]: 'Cimencam',
  [ProductCategory.DANGOTE_CEMENT]: 'Dangote Cement',
  [ProductCategory.LAFARGE]: 'Lafarge',
  [ProductCategory.MAKITA]: 'Makita',
  [ProductCategory.DEWALT]: 'DeWalt',
  [ProductCategory.STANLEY]: 'Stanley',
  [ProductCategory.BLACK_DECKER]: 'Black & Decker',
  [ProductCategory.NEXANS]: 'Nexans',
  [ProductCategory.SCHNEIDER_ELECTRIC]: 'Schneider Electric',
  [ProductCategory.LEGRAND]: 'Legrand',
  [ProductCategory.FIRMAN]: 'Firman',
  [ProductCategory.JINKO_SOLAR]: 'Jinko Solar',
  [ProductCategory.DULUX]: 'Dulux',
  [ProductCategory.CROWN_PAINT]: 'Crown Paint',

  [ProductCategory.OTHER]: 'Autre'
};

/**
 * Retourne le libelle francais d'une categorie de produit.
 * Usage: getProductCategoryLabel(ProductCategory.MEN_SHOES) -> "Chaussures homme"
 */
export function getProductCategoryLabel(category: ProductCategory): string {
  return PRODUCT_CATEGORY_LABEL[category] ?? category;
}