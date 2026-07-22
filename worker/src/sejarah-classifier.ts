export type SejarahClassification = {
  subject: 'Sejarah';
  form: 4 | 5 | null;
  chapter: string | null;
  confidence: number;
  matchedKeywords: string[];
  reason: string;
  skills: string[];
  cognitiveLevel: string | null;
  questionType: string;
};

type Rule = { form: 4 | 5; chapter: string; keywords: string[] };

const rules: Rule[] = [
  { form: 4, chapter: 'Bab 1 Warisan Negara Bangsa', keywords: ['warisan negara bangsa','kerajaan alam melayu','ciri negara bangsa','kesultanan melayu melaka'] },
  { form: 4, chapter: 'Bab 2 Kebangkitan Nasionalisme', keywords: ['nasionalisme','kesedaran kebangsaan','tokoh nasionalis','perkembangan nasionalisme'] },
  { form: 4, chapter: 'Bab 3 Konflik Dunia dan Pendudukan Jepun di Negara Kita', keywords: ['perang dunia','pendudukan jepun','malayan union','tentera jepun','bintang tiga'] },
  { form: 4, chapter: 'Bab 4 Era Peralihan Kuasa British di Negara Kita', keywords: ['british military administration','bma','malayan union','penyerahan sarawak','penyerahan sabah'] },
  { form: 4, chapter: 'Bab 5 Persekutuan Tanah Melayu 1948', keywords: ['persekutuan tanah melayu 1948','ptm 1948','jawatankuasa kerja','ciri persekutuan'] },
  { form: 4, chapter: 'Bab 6 Ancaman Komunis dan Perisytiharan Darurat', keywords: ['komunis','darurat','rancangan briggs','min yuen','perang saraf'] },
  { form: 4, chapter: 'Bab 7 Usaha ke Arah Kemerdekaan', keywords: ['sistem ahli','pakatan murni','jawatankuasa hubungan antara kaum','clc','rombongan kemerdekaan'] },
  { form: 4, chapter: 'Bab 8 Pilihan Raya', keywords: ['pilihan raya','majlis perundangan persekutuan','pengundi','kempen pilihan raya'] },
  { form: 4, chapter: 'Bab 9 Perlembagaan Persekutuan Tanah Melayu 1957', keywords: ['perlembagaan 1957','suruhanjaya reid','perjanjian persekutuan tanah melayu 1957'] },
  { form: 4, chapter: 'Bab 10 Pemasyhuran Kemerdekaan', keywords: ['pemasyhuran kemerdekaan','31 ogos 1957','stadium merdeka','detik kemerdekaan'] },
  { form: 5, chapter: 'Bab 1 Kedaulatan Negara', keywords: ['kedaulatan','negara berdaulat','jenis kedaulatan'] },
  { form: 5, chapter: 'Bab 2 Perlembagaan Persekutuan', keywords: ['perlembagaan persekutuan','pindaan perlembagaan','undang-undang utama'] },
  { form: 5, chapter: 'Bab 3 Raja Berperlembagaan dan Demokrasi Berparlimen', keywords: ['raja berperlembagaan','demokrasi berparlimen','yang di-pertuan agong','majlis raja-raja'] },
  { form: 5, chapter: 'Bab 4 Sistem Persekutuan', keywords: ['sistem persekutuan','kerajaan persekutuan','kerajaan negeri','pembahagian kuasa'] },
  { form: 5, chapter: 'Bab 5 Pembentukan Malaysia', keywords: ['pembentukan malaysia','suruhanjaya cobbold','jawatankuasa antara kerajaan','jag','referendum singapura'] },
  { form: 5, chapter: 'Bab 6 Cabaran Selepas Pembentukan Malaysia', keywords: ['konfrontasi','pemisahan singapura','tragedi 13 mei','darurat sarawak'] },
  { form: 5, chapter: 'Bab 7 Membina Kesejahteraan Negara', keywords: ['rukun negara','dasar pendidikan kebangsaan','bahasa melayu','sukan untuk perpaduan'] },
  { form: 5, chapter: 'Bab 8 Membina Kemakmuran Negara', keywords: ['dasar ekonomi baru','deb','dasar pembangunan nasional','dPN','felda'] },
  { form: 5, chapter: 'Bab 9 Dasar Luar Malaysia', keywords: ['dasar luar','asean','komanwel','pbb','nam','oic'] },
  { form: 5, chapter: 'Bab 10 Kecemerlangan Malaysia di Persada Dunia', keywords: ['persada dunia','isu global','keamanan dunia','misi pengaman','kelestarian global'] },
];

function detectSkills(text: string) {
  const lower = text.toLowerCase();
  const skills: string[] = [];
  if (/faktor|sebab|punca/.test(lower)) skills.push('sebab');
  if (/kesan|implikasi/.test(lower)) skills.push('kesan');
  if (/kepentingan|faedah|manfaat/.test(lower)) skills.push('kepentingan');
  if (/langkah|usaha|cara/.test(lower)) skills.push('langkah');
  if (/banding|beza/.test(lower)) skills.push('perbandingan');
  if (/pendapat|wajarkah|sejauh mana|bincangkan/.test(lower)) skills.push('KBAT');
  if (!skills.length) skills.push('fakta');
  return skills;
}

function detectCognitive(text: string) {
  const lower = text.toLowerCase();
  if (/nilai|wajarkah|sejauh mana|bincangkan/.test(lower)) return 'Menilai';
  if (/huraikan|bandingkan|analisis/.test(lower)) return 'Menganalisis';
  if (/jelaskan|terangkan/.test(lower)) return 'Memahami';
  if (/nyatakan|senaraikan|namakan/.test(lower)) return 'Mengingat';
  return null;
}

function detectType(text: string) {
  const lower = text.toLowerCase();
  if (/huraikan|bincangkan|sejauh mana/.test(lower) && text.length > 220) return 'Esei';
  if (/a\)|b\)|c\)|\[\d+\s*markah\]/i.test(text)) return 'Struktur';
  return 'Imported';
}

export function classifySejarah(text: string): SejarahClassification {
  const lower = text.toLowerCase();
  const ranked = rules.map((rule) => {
    const hits = rule.keywords.filter((keyword) => lower.includes(keyword));
    const score = hits.reduce((sum, keyword) => sum + Math.max(1, keyword.split(' ').length), 0);
    return { rule, hits, score };
  }).sort((a,b) => b.score-a.score);

  const best = ranked[0];
  const second = ranked[1];
  if (!best || best.score === 0) {
    return { subject:'Sejarah', form:null, chapter:null, confidence:25, matchedKeywords:[], reason:'Tiada kata kunci bab yang kukuh ditemui.', skills:detectSkills(text), cognitiveLevel:detectCognitive(text), questionType:detectType(text) };
  }

  const margin = best.score - (second?.score ?? 0);
  const confidence = Math.min(96, 55 + best.score * 7 + margin * 4);
  return {
    subject:'Sejarah',
    form:best.rule.form,
    chapter:best.rule.chapter,
    confidence,
    matchedKeywords:best.hits,
    reason:`Padanan tertinggi berdasarkan ${best.hits.join(', ')}.`,
    skills:detectSkills(text),
    cognitiveLevel:detectCognitive(text),
    questionType:detectType(text),
  };
}
