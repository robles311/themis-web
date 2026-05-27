const { Pool } = require("pg");

// Simple hash-based embedding generator (2048 dims)
// Produces consistent vectors based on word-level features
function embedText(text) {
  const words = text.toLowerCase().split(/\W+/).filter(Boolean);
  const dims = 2048;
  const vec = new Array(dims).fill(0);
  
  for (const word of words) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) - hash) + word.charCodeAt(i);
      hash |= 0;
    }
    const pos = ((hash % dims) + dims) % dims;
    vec[pos] += 1;
    
    // Bigram features
    for (let i = 0; i < word.length - 1; i++) {
      const bg = word.substring(i, i+2);
      let bh = 0;
      for (let j = 0; j < bg.length; j++) {
        bh = ((bh << 5) - bh) + bg.charCodeAt(j);
        bh |= 0;
      }
      const bpos = ((bh % dims) + dims) % dims;
      vec[bpos] += 0.5;
    }
  }
  
  // Normalize
  let mag = 0;
  for (let i = 0; i < dims; i++) mag += vec[i] * vec[i];
  mag = Math.sqrt(mag);
  if (mag > 0) for (let i = 0; i < dims; i++) vec[i] /= mag;
  
  return vec;
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const docs = [
  {s:"CIVIL",cn:"Codigo Civil, Art. 1",an:"1",t:"Definicion de ley",c:"La ley es una declaracion de la voluntad soberana que, manifestada en la forma prescrita por la Constitucion, manda, prohibe o permite."},
  {s:"CIVIL",cn:"Codigo Civil, Art. 1437",an:"1437",t:"Fuentes de obligaciones",c:"Las obligaciones nacen del concurso real de las voluntades de dos o mas personas, como en los contratos o convenciones; ya de un hecho voluntario de la persona que se obliga; ya a consecuencia de un hecho que ha inferido injuria o dano a otra persona; ya por disposicion de la ley."},
  {s:"CIVIL",cn:"Codigo Civil, Art. 1545",an:"1545",t:"Contratos como ley",c:"Los contratos legalmente celebrados son una ley para los contratantes, y no pueden ser invalidados sino por su consentimiento mutuo o por causas legales."},
  {s:"CIVIL",cn:"Codigo Civil, Art. 565",an:"565",t:"Clasificacion de bienes",c:"Los bienes consisten en cosas corporales o incorporales. Corporales son las que tienen un ser real y pueden ser percibidas por los sentidos, como una casa, un libro. Incorporales las que consisten en meros derechos."},
  {s:"FAMILIAR",cn:"Ley 19.947, Art. 102 CC",an:"102",t:"Definicion de matrimonio",c:"El matrimonio es un contrato solemne por el cual un hombre y una mujer se unen actual e indisolublemente, y por toda la vida, con el fin de vivir juntos, de procrear, y de auxiliarse mutuamente."},
  {s:"FAMILIAR",cn:"Codigo Civil, Art. 131",an:"131",t:"Separacion de bienes",c:"Por el pacto de separacion total de bienes, cada uno de los conyuges conserva el dominio, goce y libre administracion de todos los bienes que tenian al tiempo de celebrarlo y de los que despues adquieran."},
  {s:"PENAL",cn:"Codigo Penal, Art. 1",an:"1",t:"Principio de legalidad",c:"Ningun delito sera castigado con otra pena que la senalada por una ley promulgada con anterioridad a su perpetracion."},
  {s:"PENAL",cn:"Codigo Penal, Art. 490",an:"490",t:"Homicidio",c:"El que mate a otro sera penado con presidio mayor en sus grados minimo a medio."},
  {s:"LABORAL",cn:"Codigo Trabajo, Art. 1",an:"1",t:"Ambito laboral",c:"El Codigo del Trabajo regula las relaciones laborales entre empleadores y trabajadores y se aplica a todas las actividades de la produccion, del comercio y de servicios."},
  {s:"LABORAL",cn:"Codigo Trabajo, Art. 7",an:"7",t:"Contrato individual de trabajo",c:"Contrato individual de trabajo es una convencion por la cual el empleador y el trabajador se obligan reciprocamente, este a prestar servicios personales bajo dependencia y subordinacion del primero, y aquel a pagar una remuneracion determinada."},
  {s:"LABORAL",cn:"Codigo Trabajo, Art. 159",an:"159",t:"Causales de termino",c:"El contrato de trabajo terminara en los siguientes casos: 1. Mutuo acuerdo. 2. Renuncia del trabajador. 3. Muerte del trabajador. 4. Vencimiento del plazo. 5. Conclusion del trabajo. 6. Caso fortuito."},
  {s:"TRIBUTARIO",cn:"Codigo Tributario, Art. 1",an:"1",t:"Ambito tributario",c:"Las disposiciones de este Codigo se aplicaran a todas las materias de tributacion fiscal, salvo aquellas que por su naturaleza deban ser reguladas por leyes especiales."},
  {s:"TRIBUTARIO",cn:"LIR, Art. 20",an:"20",t:"Impuesto primera categoria",c:"Los contribuyentes que obtengan rentas de capitales, empresas o actividades comerciales, industriales o mineras, pagaran anualmente un impuesto de primera categoria del 27% sobre las utilidades tributables."},
  {s:"CONTRATOS",cn:"Codigo Civil, Art. 1438",an:"1438",t:"Definicion de contrato",c:"Contrato o convencion es un acto por el cual una parte se obliga para con otra a dar, hacer o no hacer alguna cosa. Cada parte puede ser una o muchas personas."},
  {s:"CONTRATOS",cn:"Codigo Civil, Art. 1445",an:"1445",t:"Requisitos de validez",c:"Para que una persona se obligue a otra por un acto o declaracion de voluntad, es necesario: 1. Que sea legalmente capaz. 2. Que consienta sin vicios. 3. Que recaiga sobre objeto licito. 4. Que tenga causa licita."},
  {s:"CONTRATOS",cn:"Codigo Civil, Art. 1560",an:"1560",t:"Interpretacion contractual",c:"Conocida claramente la intencion de los contratantes, debe estarse a ella mas que a lo literal de las palabras."},
  {s:"INMUEBLES",cn:"Codigo Civil, Art. 580",an:"580",t:"Bienes inmuebles",c:"Son bienes inmuebles las cosas que no pueden transportarse de un lugar a otro, como las tierras y minas, y las que adhieren permanentemente a ellas, como los edificios, los arboles."},
  {s:"INMUEBLES",cn:"Codigo Civil, Art. 724",an:"724",t:"Modos de adquirir dominio",c:"El dominio se adquiere por la ocupacion, la accesion, la tradicion, la sucesion por causa de muerte, y por la prescripcion adquisitiva."},
];

(async () => {
  await pool.query("CREATE EXTENSION IF NOT EXISTS vector");
  await pool.query(`CREATE TABLE IF NOT EXISTS legal_documents (
    id SERIAL PRIMARY KEY,
    specialty TEXT NOT NULL,
    code_name TEXT NOT NULL,
    article_number TEXT,
    title TEXT,
    content TEXT NOT NULL,
    embedding vector(2048),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP DEFAULT NOW()
  )`);
  await pool.query("DELETE FROM legal_documents");

  let ok = 0;
  for (let i = 0; i < docs.length; i++) {
    const d = docs[i];
    process.stdout.write("  [" + (i+1) + "/" + docs.length + "] " + d.t + "... ");
    try {
      const vec = embedText(d.c);
      await pool.query(
        "INSERT INTO legal_documents(specialty,code_name,article_number,title,content,embedding) VALUES($1,$2,$3,$4,$5,$6::vector)",
        [d.s, d.cn, d.an, d.t, d.c, "[" + vec.join(",") + "]"]
      );
      console.log("OK");
      ok++;
    } catch (e) {
      console.log("ERR: " + String(e.message).substring(0, 80));
    }
  }
  console.log("\nDone: " + ok + "/" + docs.length + " documents seeded");
  await pool.end();
})();
