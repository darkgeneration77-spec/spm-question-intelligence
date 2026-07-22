// Form 5 expansion: ensure Worlds 11-15 contain 15 SPM-style objective questions each.
(function(){
const add=(worldIndex,items)=>{if(!DATA[worldIndex])return;const seen=new Set(DATA[worldIndex].qs.map(x=>x.q));items.forEach(x=>{if(!seen.has(x.q)&&DATA[worldIndex].qs.length<15){DATA[worldIndex].qs.push(x);seen.add(x.q)}})};

add(10,[
Q('Apakah jenis kedaulatan yang berkaitan dengan kuasa mutlak raja?',['Kedaulatan tradisional','Kedaulatan moden','Kedaulatan undang-undang','Kedaulatan antarabangsa'],0,'传统主权强调君主拥有最高权力。','kedaulatan tradisional → raja'),
Q('Kedaulatan undang-undang menuntut semua pihak...',['Mematuhi undang-undang','Menguasai ekonomi','Menolak perlembagaan','Menghapus sempadan'],0,'法律主权强调所有人都必须守法。','kedaulatan undang-undang → patuh undang-undang'),
Q('Pengiktirafan negara lain berkaitan dengan...',['Kedaulatan antarabangsa','Kedaulatan tradisional','Kuasa tempatan','Pentadbiran daerah'],0,'国际主权需要获得其他国家承认。','antarabangsa → pengiktirafan'),
Q('Apakah unsur penting sesebuah negara berdaulat?',['Pemerintahan','Syarikat asing','Tentera upahan','Pasaran bebas'],0,'主权国家必须有有效政府。','negara berdaulat → pemerintahan'),
Q('Mengapakah sempadan penting kepada negara?',['Menentukan wilayah kekuasaan','Menghapus undang-undang','Membenarkan penjajahan','Menggantikan rakyat'],0,'边界确定国家统治范围。','sempadan → wilayah'),
Q('Apakah peranan rakyat dalam mempertahankan kedaulatan?',['Memupuk patriotisme','Menyebar fitnah','Mengabaikan undang-undang','Membantu campur tangan asing'],0,'人民应培养爱国精神并守法。','rakyat → patriotisme'),
Q('Apakah kesan jika kedaulatan negara tergugat?',['Campur tangan asing','Ekonomi lebih stabil','Perpaduan meningkat automatik','Undang-undang lebih kukuh'],0,'主权受威胁会引来外部干预。','kedaulatan tergugat → campur tangan'),
Q('Pemerintah mempertahankan kedaulatan melalui...',['Pentadbiran yang cekap','Menghapus keselamatan','Menyerahkan kuasa','Menutup hubungan diplomatik'],0,'高效治理能强化国家主权。','pemerintah → pentadbiran cekap'),
Q('Mengapakah perpaduan penting kepada kedaulatan?',['Menghalang ancaman luar','Melemahkan pertahanan','Mengurangkan identiti','Memecah masyarakat'],0,'团结能增强国家抵御威胁的能力。','perpaduan → pertahan negara'),
Q('Apakah nilai yang perlu diamalkan untuk menjaga kedaulatan?',['Setia kepada negara','Mementingkan diri','Menghina simbol negara','Melanggar undang-undang'],0,'忠于国家是维护主权的重要价值。','setia → kedaulatan'),
Q('Hubungan diplomatik membantu negara...',['Mendapat pengiktirafan dan kerjasama','Kehilangan identiti','Menghapus sempadan','Menyerahkan kuasa'],0,'外交关系带来国际承认与合作。','diplomatik → pengiktirafan')]);

add(11,[
Q('Mengapakah Perlembagaan Persekutuan penting?',['Menjadi rujukan pemerintahan','Menghapus hak rakyat','Menutup Parlimen','Menggantikan undang-undang'],0,'宪法是国家治理的主要依据。','perlembagaan → rujukan pemerintahan'),
Q('Apakah ciri tradisional dalam Perlembagaan?',['Kesultanan','Republik','Kuasa penjajah','Pemerintahan tentera'],0,'传统特征包括马来君主制度。','tradisional → kesultanan'),
Q('Apakah ciri moden dalam Perlembagaan?',['Kerajaan Persekutuan','Sistem feudal mutlak','Kuasa penjajah','Pemerintahan tanpa pilihan raya'],0,'现代特征包括联邦政府与民主制度。','moden → kerajaan persekutuan'),
Q('Siapakah yang berkuasa meminda Perlembagaan?',['Parlimen mengikut prosedur','Syarikat swasta','Pihak asing','Kerajaan tempatan sahaja'],0,'修宪须由国会依程序进行。','pindaan → Parlimen'),
Q('Apakah tujuan pindaan Perlembagaan?',['Menyesuaikan keperluan semasa','Menghapus kedaulatan','Menggantung demokrasi','Menyerah kuasa asing'],0,'修宪是为了适应时代需要。','pindaan → keperluan semasa'),
Q('Apakah prinsip penting dalam keluhuran Perlembagaan?',['Semua undang-undang tertakluk kepadanya','Rakyat bebas melanggar undang-undang','Parlimen tiada batas','Kuasa asing lebih tinggi'],0,'其他法律不能违背联邦宪法。','keluhuran perlembagaan'),
Q('Hak asasi rakyat dijamin melalui...',['Perlembagaan Persekutuan','Arahan syarikat','Perjanjian asing','Adat semata-mata'],0,'基本权利受联邦宪法保障。','hak asasi → perlembagaan'),
Q('Bahasa Melayu diperuntukkan sebagai...',['Bahasa kebangsaan','Bahasa asing','Bahasa negeri sahaja','Bahasa perdagangan sahaja'],0,'马来语是国家语言。','Bahasa Melayu → bahasa kebangsaan'),
Q('Agama Islam diperuntukkan sebagai...',['Agama Persekutuan','Agama negeri sahaja','Agama asing','Tiada kedudukan'],0,'伊斯兰教为联邦宗教。','Islam → agama Persekutuan'),
Q('Apakah kesan mematuhi Perlembagaan?',['Kestabilan negara terpelihara','Konflik meningkat','Hak rakyat terhapus','Pentadbiran lumpuh'],0,'遵守宪法有助国家稳定。','patuh perlembagaan → stabil'),
Q('Mengapakah rakyat perlu menghormati Perlembagaan?',['Menjamin keharmonian','Menghapus perpaduan','Melemahkan negara','Membuka ruang penjajahan'],0,'尊重宪法能维护社会和谐。','hormat perlembagaan → harmoni')]);

add(12,[
Q('Apakah maksud Raja Berperlembagaan?',['Raja memerintah mengikut perlembagaan','Raja berkuasa mutlak','Raja dipilih rakyat setiap tahun','Raja tidak mempunyai peranan'],0,'君主立宪指君主依宪法行使职权。','Raja Berperlembagaan'),
Q('Siapakah memilih Yang di-Pertuan Agong?',['Majlis Raja-Raja','Dewan Rakyat','Kabinet','Mahkamah'],0,'国家元首由统治者会议选出。','YDPA → Majlis Raja-Raja'),
Q('Tempoh jawatan Yang di-Pertuan Agong ialah...',['Lima tahun','Tiga tahun','Sepuluh tahun','Seumur hidup'],0,'国家元首任期五年。','YDPA → lima tahun'),
Q('Yang di-Pertuan Agong bertindak atas nasihat...',['Jemaah Menteri','Syarikat swasta','Pihak asing','Kerajaan tempatan'],0,'多数职权依内阁建议行使。','YDPA → nasihat Jemaah Menteri'),
Q('Apakah peranan Yang di-Pertuan Agong dalam Parlimen?',['Memanggil dan membubarkan Parlimen mengikut peruntukan','Menghapus Dewan Negara','Menentukan semua undi','Menggantikan mahkamah'],0,'国家元首依宪法召集和解散国会。','YDPA → Parlimen'),
Q('Siapakah ketua agama Islam bagi negeri tidak beraja?',['Yang di-Pertuan Agong','Perdana Menteri','Ketua Hakim','Yang Dipertua Dewan'],0,'无君主州属的伊斯兰教领袖为国家元首。','YDPA → ketua agama Islam'),
Q('Apakah fungsi Majlis Raja-Raja?',['Memilih Yang di-Pertuan Agong','Mengurus syarikat','Menggubal semua undang-undang sendiri','Menghapus pilihan raya'],0,'统治者会议负责选举国家元首等事项。','Majlis Raja-Raja → pilih YDPA'),
Q('Mengapakah institusi beraja penting?',['Menjadi lambang perpaduan','Menghapus demokrasi','Memecah rakyat','Menguatkan kuasa asing'],0,'君主制度是团结与国家连续性的象征。','institusi beraja → perpaduan'),
Q('Apakah kuasa budi bicara Yang di-Pertuan Agong?',['Melantik Perdana Menteri','Menentukan semua keputusan mahkamah','Menghapus Perlembagaan','Menutup semua negeri'],0,'任命首相属于国家元首的酌情权之一。','budi bicara → lantik PM'),
Q('Raja Berperlembagaan memastikan kuasa raja...',['Dijalankan mengikut undang-undang','Tidak terbatas','Mengatasi Perlembagaan','Bebas tanpa nasihat'],0,'君主权力受宪法规范。','kuasa raja → ikut undang-undang'),
Q('Apakah nilai yang perlu ditunjukkan terhadap institusi beraja?',['Kesetiaan','Penghinaan','Keengganan mematuhi undang-undang','Permusuhan'],0,'人民应对君主制度表现忠诚与尊重。','institusi beraja → kesetiaan')]);

add(13,[
Q('Apakah maksud Sistem Persekutuan?',['Penyatuan beberapa negeri di bawah kerajaan pusat','Pemerintahan satu negeri sahaja','Pemerintahan tanpa undang-undang','Pentadbiran syarikat asing'],0,'联邦制是多个州属在中央政府下组成国家。','Sistem Persekutuan'),
Q('Pertahanan berada di bawah...',['Senarai Persekutuan','Senarai Negeri','Senarai Bersama','Kuasa tempatan'],0,'国防属于联邦权限。','pertahanan → Senarai Persekutuan'),
Q('Tanah berada di bawah...',['Senarai Negeri','Senarai Persekutuan','Senarai Bersama','Pihak asing'],0,'土地事务属于州权限。','tanah → Senarai Negeri'),
Q('Kesihatan awam termasuk dalam...',['Senarai Bersama','Senarai Negeri sahaja','Senarai Persekutuan sahaja','Tiada senarai'],0,'公共卫生属于共同权限。','kesihatan awam → Senarai Bersama'),
Q('Mengapakah pembahagian kuasa penting?',['Mengelakkan pertindihan tugas','Menghapus kerajaan negeri','Menguatkan kuasa asing','Menutup Parlimen'],0,'权力划分可避免职责重叠。','pembahagian kuasa → elak pertindihan'),
Q('Siapakah mengetuai Kerajaan Persekutuan?',['Perdana Menteri','Menteri Besar setiap negeri','Datuk Bandar','Ketua Kampung'],0,'联邦政府由首相领导。','Kerajaan Persekutuan → Perdana Menteri'),
Q('Siapakah mengetuai pentadbiran negeri beraja?',['Menteri Besar','Perdana Menteri','Yang Dipertua Dewan','Ketua Hakim'],0,'有君主州属由州务大臣领导行政。','negeri beraja → Menteri Besar'),
Q('Apakah bentuk kerjasama Persekutuan-negeri?',['Pembangunan wilayah','Menghapus sempadan negeri','Menutup sekolah','Membatalkan undang-undang'],0,'联邦与州可在区域发展等方面合作。','kerjasama → pembangunan wilayah'),
Q('Apakah kesan kerjasama kerajaan pusat dan negeri?',['Perkhidmatan lebih berkesan','Konflik kuasa meningkat','Pembangunan terhenti','Rakyat hilang hak'],0,'合作可提高公共服务效率。','kerjasama → perkhidmatan berkesan'),
Q('Jika berlaku percanggahan undang-undang, yang diutamakan ialah...',['Undang-undang Persekutuan','Arahan syarikat','Undang-undang asing','Peraturan persatuan'],0,'发生冲突时联邦法律优先。','percanggahan → undang-undang Persekutuan'),
Q('Apakah nilai penting dalam Sistem Persekutuan?',['Kerjasama','Persaingan tidak sihat','Mementingkan wilayah sendiri','Menolak rundingan'],0,'联邦制需要各级政府合作。','Sistem Persekutuan → kerjasama')]);

add(14,[
Q('Bilakah idea pembentukan Malaysia diumumkan oleh Tunku Abdul Rahman?',['27 Mei 1961','31 Ogos 1957','16 September 1963','1 Februari 1948'],0,'东姑阿都拉曼于1961年5月27日提出构想。','27 Mei 1961'),
Q('Wilayah manakah menyertai Malaysia pada 1963?',['Sabah dan Sarawak','Brunei dan Indonesia','Thailand dan Filipina','Myanmar dan Laos'],0,'沙巴与砂拉越于1963年加入马来西亚。','Malaysia 1963 → Sabah + Sarawak'),
Q('Apakah tujuan Suruhanjaya Cobbold?',['Meninjau pandangan penduduk Sabah dan Sarawak','Menggubal undang-undang darurat','Menentukan sempadan Thailand','Mengurus pilihan raya 1955'],0,'科博德委员会调查沙砂人民意见。','Suruhanjaya Cobbold → pandangan rakyat'),
Q('Jawatankuasa Antara Kerajaan membincangkan...',['Hak dan kepentingan Sabah serta Sarawak','Perdagangan Eropah','Pilihan raya tempatan','Rancangan Briggs'],0,'政府间委员会讨论沙砂权益保障。','JAK → hak Sabah Sarawak'),
Q('Perjanjian Malaysia ditandatangani pada...',['9 Julai 1963','16 September 1963','31 Ogos 1957','27 Mei 1961'],0,'马来西亚协定于1963年7月9日签署。','MA63 → 9 Julai 1963'),
Q('Mengapakah pembentukan Malaysia dapat mengukuhkan keselamatan?',['Membendung ancaman komunis','Menghapus pertahanan','Menyerah kuasa kepada asing','Memecah wilayah'],0,'成立马来西亚有助遏制共产主义威胁。','Malaysia → bendung komunis'),
Q('Apakah reaksi Indonesia terhadap pembentukan Malaysia?',['Konfrontasi','Sokongan penuh tanpa syarat','Menjadi anggota Malaysia','Tiada pendirian'],0,'印尼发动对抗政策。','Indonesia → Konfrontasi'),
Q('Apakah tuntutan Filipina berkaitan pembentukan Malaysia?',['Sabah','Sarawak','Singapura','Brunei'],0,'菲律宾对沙巴提出主权要求。','Filipina → Sabah'),
Q('Apakah peranan PBB sebelum pembentukan Malaysia?',['Menilai sokongan rakyat Sabah dan Sarawak','Menghapus Suruhanjaya Cobbold','Mengurus pilihan raya 1955','Menggubal Perlembagaan 1957'],0,'联合国评估沙砂人民意愿。','PBB → nilai sokongan rakyat'),
Q('Mengapakah Singapura keluar dari Malaysia?',['Masalah politik dan hubungan pusat-negeri','Tiada penduduk','Tiada ekonomi','Menolak kemerdekaan sejak awal'],0,'新加坡退出涉及政治与中央关系问题。','Singapura keluar → masalah politik'),
Q('Apakah kepentingan pembentukan Malaysia kepada wilayah anggota?',['Mempercepat pembangunan','Menghapus identiti tempatan','Menutup peluang ekonomi','Mengurangkan keselamatan'],0,'成立马来西亚促进安全与发展。','Malaysia → pembangunan')]);
})();