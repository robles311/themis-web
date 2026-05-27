export type ChatItem = {
  question: string;
  answer: string;
  citation: string;
};

export const chatData: ChatItem[] = [
  {
    question: "¿Cuáles son los requisitos de validez de un contrato en Chile?",
    answer:
      "De acuerdo con el **Artículo 1445 del Código Civil**, para que una persona se obligue a otra por un acto o declaración de voluntad es necesario:\n\n1. Que sea legalmente **capaz**.\n2. Que consienta en dicho acto y su consentimiento no adolezca de **vicio** (error, fuerza o dolo).\n3. Que recaiga sobre un **objeto lícito**.\n4. Que tenga una **causa lícita**.",
    citation: "Código Civil, Art. 1445",
  },
  {
    question: "¿Cómo se pagan las horas extraordinarias según la ley chilena?",
    answer:
      "Conforme al **Artículo 32 del Código del Trabajo**, las horas extraordinarias se pagarán con un **recargo del 50%** sobre el sueldo convenido para la jornada ordinaria. Deben liquidarse y pagarse conjuntamente con las remuneraciones ordinarias del respectivo período.",
    citation: "Código del Trabajo, Art. 32",
  },
  {
    question:
      "¿Qué causales justifican el término del contrato sin derecho a indemnización?",
    answer:
      "Las causales de caducidad del contrato de trabajo sin derecho a indemnización están en el **Artículo 160 del Código del Trabajo** e incluyen:\n\n* Falta de probidad, vías de hecho, injurias o conducta inmoral grave.\n* Negociaciones que el trabajador ejecute dentro del giro del negocio.\n* Inasistencia injustificada durante dos días seguidos.\n* Abandono del trabajo y actos imprudentes que afecten la seguridad.",
    citation: "Código del Trabajo, Art. 160",
  },
  {
    question: "¿Qué efectos produce la posesión inscrita de un inmueble?",
    answer:
      "Según el **Artículo 728 del Código Civil**, la posesión del inmueble inscrito **no cesa** sino por la cancelación de su inscripción, sea por voluntad de las partes, por nueva inscripción a favor de otro o por decreto judicial. Mientras subsista la inscripción, el poseedor inscrito conserva la posesión aunque otro se apodere materialmente de la cosa.",
    citation: "Código Civil, Art. 728",
  },
  {
    question:
      "¿Cómo se determina la compensación económica en el divorcio?",
    answer:
      "El **Artículo 62 de la Ley N° 19.947** de Matrimonio Civil ordena considerar especialmente:\n\n* La duración del matrimonio y de la vida en común.\n* La situación patrimonial de ambos cónyuges.\n* La buena o mala fe.\n* La edad y el estado de salud del cónyuge beneficiario.\n* Su situación previsional y de salud.\n* Su cualificación profesional y posibilidades de acceso al mercado laboral.",
    citation: "Ley N° 19.947, Art. 62",
  },
];

export type Feature = {
  title: string;
  description: string;
  icon:
    | "message"
    | "file"
    | "pen"
    | "scale"
    | "calculator"
    | "shield";
};

export const features: Feature[] = [
  {
    icon: "message",
    title: "Respuestas con base legal",
    description:
      "Pregunta en lenguaje natural y recibe respuestas argumentadas técnicamente, con citas precisas a artículos de códigos y leyes vigentes en Chile.",
  },
  {
    icon: "file",
    title: "Análisis de documentos",
    description:
      "Sube contratos, demandas, escrituras o minutas y obtén en segundos un escaneo de riesgos, cláusulas desfavorables y sugerencias de mejora.",
  },
  {
    icon: "pen",
    title: "Generación de borradores",
    description:
      "Redacta escritos judiciales, cartas de despido, cláusulas contractuales o correos de opinión legal partiendo de una estructura adaptada a la doctrina local.",
  },
  {
    icon: "scale",
    title: "Búsqueda de jurisprudencia",
    description:
      "Encuentra fallos relevantes de la Corte Suprema y Cortes de Apelaciones chilenas que apoyen la teoría de tu caso en un par de clics.",
  },
  {
    icon: "calculator",
    title: "Cálculos sin errores",
    description:
      "Liquidaciones de sueldo, recargos de horas extra, indemnizaciones por años de servicio y pensiones de alimentos con fórmulas exactas apegadas a la ley.",
  },
  {
    icon: "shield",
    title: "Privacidad institucional",
    description:
      "Tus consultas e información están protegidas con encriptación de nivel bancario. Tus datos nunca se usarán para entrenar modelos públicos.",
  },
];

export type SpecialtyMaterial = {
  title: string;
  category: string;
  items: { title: string; desc: string }[];
};

export const specialtyKeys = [
  "civil",
  "penal",
  "laboral",
  "comercial",
  "familia",
  "tributario",
  "contratos",
  "inmuebles",
] as const;

export type SpecialtyKey = (typeof specialtyKeys)[number];

export const specialtyMaterials: Record<SpecialtyKey, SpecialtyMaterial> = {
  civil: {
    title: "Derecho Civil",
    category: "Área Sustantiva",
    items: [
      {
        title: "Código Civil Chileno",
        desc: "Reglas de obligaciones, contratos, sucesiones y derechos reales.",
      },
      {
        title: "Jurisprudencia de Casación",
        desc: "Colección unificada de fallos de la Corte Suprema en responsabilidad contractual y extracontractual.",
      },
      {
        title: "Tratados de Doctrina",
        desc: "Obras clásicas chilenas (Alessandri, Somarriva, Fueyo) para resolución doctrinaria de dudas.",
      },
      {
        title: "Ley N° 19.496",
        desc: "Normas sobre protección de los derechos de los consumidores en contratos de adhesión.",
      },
    ],
  },
  penal: {
    title: "Derecho Penal",
    category: "Área Sancionatoria",
    items: [
      {
        title: "Código Penal y Procesal Penal",
        desc: "Tipicidad delictiva, atenuantes, agravantes y etapas de formalización procesal.",
      },
      {
        title: "Jurisprudencia Penal",
        desc: "Resoluciones de amparo y apelaciones en delitos económicos y contra la propiedad.",
      },
      {
        title: "Ley N° 20.393",
        desc: "Responsabilidad penal de las personas jurídicas y modelos de prevención de delitos.",
      },
    ],
  },
  laboral: {
    title: "Derecho Laboral",
    category: "Área Corporativa / Social",
    items: [
      {
        title: "Código del Trabajo",
        desc: "Contratación, jornadas, despidos, desafueros e indemnizaciones legales.",
      },
      {
        title: "Dictámenes Dirección del Trabajo",
        desc: "Criterios interpretativos y circulares de fiscalización actualizadas del ente administrativo.",
      },
      {
        title: "Ley de Cobro de Cotizaciones",
        desc: "Reglas sobre nulidad del despido (Ley Bustos) e incidentes de cobranza previsional.",
      },
    ],
  },
  comercial: {
    title: "Derecho Comercial",
    category: "Área Corporativa",
    items: [
      {
        title: "Código de Comercio",
        desc: "Actos de comercio, sociedades de hecho, títulos de crédito y corretaje.",
      },
      {
        title: "Ley N° 18.046 (Sociedades Anónimas)",
        desc: "Gobernanza corporativa, juntas de accionistas y directores.",
      },
      {
        title: "Ley N° 20.720 (Insolvencia)",
        desc: "Procesos de reorganización y liquidación de empresas y personas.",
      },
    ],
  },
  familia: {
    title: "Derecho de Familia",
    category: "Área Social / Judicial",
    items: [
      {
        title: "Ley N° 19.947 (Matrimonio Civil)",
        desc: "Causales de divorcio, separación judicial y compensación económica.",
      },
      {
        title: "Ley N° 21.389 (Registro de Deudores)",
        desc: "Medidas de retención de fondos y cálculo de pensiones alimenticias.",
      },
      {
        title: "Ley de Violencia Intrafamiliar",
        desc: "Medidas de protección y competencia de Tribunales de Familia.",
      },
    ],
  },
  tributario: {
    title: "Derecho Tributario",
    category: "Área Fiscal",
    items: [
      {
        title: "Código Tributario Chileno",
        desc: "Procedimientos de reclamación, plazos de prescripción y fiscalización del SII.",
      },
      {
        title: "Impuesto a la Renta & IVA",
        desc: "Análisis de la Ley sobre Impuesto a la Renta (LIR) y la Ley sobre Impuesto a las Ventas y Servicios.",
      },
      {
        title: "Circulares y Oficios del SII",
        desc: "Instrucciones técnicas y respuestas a consultas de contribuyentes oficiales.",
      },
    ],
  },
  contratos: {
    title: "Redacción & Contratos",
    category: "Práctica Contractual",
    items: [
      {
        title: "Cláusulas Especiales Chilenas",
        desc: "Biblioteca de cláusulas penales, arbitraje (CAM Santiago), pactos de socios e indemnidades.",
      },
      {
        title: "Arrendamientos y Promesas",
        desc: "Modelos optimizados conforme a la Ley de Arrendamiento Urbano e inscripciones.",
      },
      {
        title: "Contratos de Trabajo & Anexos",
        desc: "Formatos ajustados a exigencias del Art. 10 del Código del Trabajo.",
      },
    ],
  },
  inmuebles: {
    title: "Derecho Inmobiliario",
    category: "Bienes Raíces",
    items: [
      {
        title: "Reglamento del Conservador",
        desc: "Requisitos de inscripción del CBR (títulos, hipotecas, gravámenes, interdicciones).",
      },
      {
        title: "Estudios de Títulos",
        desc: "Guías doctrinales para saneamiento de títulos, herencias y loteos irregulares.",
      },
      {
        title: "Ley General de Urbanismo",
        desc: "Normas de construcción, subdivisión de predios y permisos municipales.",
      },
    ],
  },
};

export const faqs: { question: string; answer: string }[] = [
  {
    question: "¿Cuándo estará disponible para el público?",
    answer:
      "Actualmente estamos probando el asistente legal con un selecto grupo de estudios jurídicos asociados en Chile. La beta privada se abrirá por fases a los primeros inscritos en la lista de espera durante las próximas semanas.",
  },
  {
    question: "¿Reemplaza Themis la labor de un abogado?",
    answer:
      "De ninguna manera. Themis está diseñado como un copiloto de apoyo y optimización. Toda respuesta generada incluye referencias exactas a las normas vigentes para que el profesional del derecho pueda validar y firmar el trabajo con total control y responsabilidad ética.",
  },
  {
    question: "¿De dónde obtiene y cómo procesa la información legal?",
    answer:
      "Nuestros modelos están entrenados de manera nativa con códigos de la República de Chile (Civil, de Comercio, Penal, Orgánico, del Trabajo), dictámenes oficiales de la Dirección del Trabajo, circulares del SII y fallos del Poder Judicial, asegurando que las respuestas contengan doctrina jurídica local vigente.",
  },
  {
    question: "¿Qué costos tendrá el servicio?",
    answer:
      "Themis contará con una versión de acceso gratuito para realizar un número limitado de consultas básicas al mes. Para estudios jurídicos, corporaciones y profesionales de uso intensivo, ofreceremos planes de suscripción mensual altamente competitivos.",
  },
  {
    question: "¿Cómo se maneja la confidencialidad de las consultas?",
    answer:
      "La privacidad es nuestra máxima prioridad. Todas las conexiones se realizan mediante HTTPS encriptado de extremo a extremo. Contamos con acuerdos corporativos con nuestros proveedores de infraestructura de nube que impiden el uso de tu historial para entrenamiento o publicidad comercial.",
  },
];
