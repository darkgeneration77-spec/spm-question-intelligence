// Form 4 SPM-style expansion: Worlds 1-5 to 15 objective questions each.
(function(){
const add=(w,items)=>{if(!DATA[w])return;const seen=new Set(DATA[w].qs.map(x=>x.q));items.forEach(x=>{if(!seen.has(x.q))DATA[w].qs.push(x)});};
add(0,[
Q('Apakah peranan raja dalam kerajaan Alam Melayu?',['Menjadi tonggak utama kerajaan','Menjadi pedagang asing','Menghapus undang-undang','Menutup pelabuhan'],0,'君主是王国的核心，统领行政并维护秩序。','raja → tonggak kerajaan'),
Q('Rakyat menunjukkan kesetiaan kepada pemerintah melalui...',['Taat setia','Pemberontakan','Pengasingan','Penjajahan'],0,'人民通过效忠统治者体现归属。','rakyat → taat setia'),
Q('Apakah tujuan lambang kebesaran digunakan?',['Menunjukkan identiti dan kedaulatan','Menentukan harga barang','Menghapus cukai','Memilih pembesar'],0,'王室标志显示身份与主权。','lambang kebesaran → identiti'),
Q('Siapakah menjaga keamanan Kota Melaka?',['Temenggung','Syahbandar','Laksamana','Penghulu Bendahari'],0,'Temenggung 负责城市治安。','keamanan kota → Temenggung'),
Q('Apakah tugas Syahbandar?',['Mengurus pedagang di pelabuhan','Mengetuai angkatan laut','Menjadi ketua agama','Menggubal undang-undang'],0,'港务官负责管理商人和港口事务。','Syahbandar → pelabuhan'),
Q('Hukum Kanun Melaka berkaitan dengan...',['Peraturan pentadbiran dan jenayah','Sukan rakyat','Sistem pendidikan','Pertanian moden'],0,'《马六甲法典》涵盖行政与刑事规则。','Hukum Kanun Melaka'),
Q('Undang-Undang Laut Melaka digunakan untuk...',['Mengawal pelayaran dan perdagangan','Mengurus istana','Mengutip zakat','Memilih sultan'],0,'海事法用于规范航海和贸易。','Undang-Undang Laut Melaka'),
Q('Mengapakah pembesar penting dalam pentadbiran Melaka?',['Membantu sultan mengurus kerajaan','Menggantikan rakyat','Menutup hubungan luar','Menghapus pelabuhan'],0,'大臣协助苏丹执行行政。','pembesar → bantu sultan'),
Q('Bagaimanakah kerajaan Melaka mengukuhkan kedaulatan?',['Melalui undang-undang dan pentadbiran tersusun','Dengan menolak semua pedagang','Dengan menghapus pembesar','Dengan menutup wilayah'],0,'有序行政与法律强化主权。','kedaulatan → pentadbiran tersusun'),
Q('Apakah kesan rakyat tidak taat kepada pemerintah?',['Kestabilan negara tergugat','Perdagangan terus maju','Undang-undang semakin kuat','Wilayah semakin luas'],0,'人民不效忠会威胁国家稳定。','tidak taat → kestabilan tergugat'),
Q('Mengapakah sistem Pembesar Empat Lipatan berkesan?',['Tugas pentadbiran dibahagikan dengan jelas','Semua kuasa diberi kepada pedagang','Rakyat tidak terlibat','Undang-undang dihapuskan'],0,'明确分工提高行政效率。','Pembesar Empat Lipatan → pembahagian tugas')]);
add(1,[
Q('Apakah matlamat gerakan nasionalisme?',['Membebaskan negara daripada penjajahan','Mengukuhkan kuasa asing','Menutup sekolah','Menghapus bahasa'],0,'民族主义旨在摆脱殖民统治。','nasionalisme → bebas penjajahan'),
Q('Tokoh nasionalisme India yang terkenal ialah...',['Mahatma Gandhi','Jose Rizal','Soekarno','Sun Yat Sen'],0,'甘地是印度民族主义领袖。','India → Mahatma Gandhi'),
Q('Tokoh nasionalisme Indonesia ialah...',['Soekarno','Mao Zedong','Jose Rizal','Rizal Nordin'],0,'苏加诺推动印尼独立。','Indonesia → Soekarno'),
Q('Nasionalisme di China dipimpin oleh...',['Dr. Sun Yat Sen','Gandhi','Jose Rizal','Ho Chi Minh'],0,'孙中山推动中国民族主义。','China → Sun Yat Sen'),
Q('Apakah kesan perkembangan pendidikan?',['Melahirkan golongan intelektual','Mengukuhkan penjajahan','Menutup akhbar','Menghapus kesedaran politik'],0,'教育培养知识分子并提高政治意识。','pendidikan → intelektual'),
Q('Akhbar dan majalah penting kerana...',['Menyebarkan kesedaran kebangsaan','Menghalang idea baru','Membantu penjajah','Menutup persatuan'],0,'报刊传播民族意识。','akhbar → kesedaran kebangsaan'),
Q('Apakah peranan persatuan dalam nasionalisme?',['Menghimpunkan tenaga perjuangan','Menghapus kerjasama','Menutup sekolah','Menyekat bahasa'],0,'协会凝聚斗争力量。','persatuan → himpun perjuangan'),
Q('Mengapakah golongan agama menyokong nasionalisme?',['Mahu membela maruah bangsa dan agama','Mahu kuasa asing kekal','Mahu sekolah ditutup','Mahu cukai dinaikkan'],0,'宗教群体维护民族与宗教尊严。','agama → bela maruah'),
Q('Apakah persamaan gerakan nasionalisme Asia Tenggara?',['Menentang penjajahan Barat','Menyokong penjajah','Menghapus pendidikan','Menolak perpaduan'],0,'共同点是反殖民。','Asia Tenggara → anti penjajahan'),
Q('Bagaimanakah karya kreatif membantu nasionalisme?',['Membangkitkan semangat cinta negara','Menghapus identiti','Menyokong penjajah','Menutup media'],0,'文学作品激发爱国精神。','karya kreatif → cinta negara'),
Q('Apakah iktibar daripada perjuangan tokoh nasionalisme?',['Perpaduan dan keberanian penting','Penjajahan perlu diterima','Ilmu tidak penting','Rakyat mesti berpecah'],0,'团结与勇气是斗争关键。','iktibar → perpaduan + keberanian')]);
add(2,[
Q('Apakah maksud imperialisme?',['Dasar meluaskan kuasa dan wilayah','Sistem pilihan raya','Kerjasama pendidikan','Perdagangan tempatan'],0,'帝国主义是扩张权力与领土。','imperialisme → perluasan kuasa'),
Q('Kuasa Tengah dalam Perang Dunia Pertama diketuai oleh...',['Jerman dan Austria-Hungary','Britain dan Perancis','Rusia dan Amerika','China dan Jepun'],0,'同盟国核心包括德国与奥匈帝国。','Kuasa Tengah'),
Q('Apakah kesan Perang Dunia Pertama?',['Kemunculan negara baharu di Eropah','Penjajahan berakhir serta-merta','Ekonomi dunia terus stabil','Tiada perubahan politik'],0,'一战后欧洲出现新国家。','PDP1 → negara baharu'),
Q('Fahaman yang dikaitkan dengan Jerman Nazi ialah...',['Fasisme','Demokrasi liberal','Komunalisme','Feudalisme'],0,'纳粹德国与法西斯主义相关。','Jerman Nazi → fasisme'),
Q('Apakah sebab Jepun menyerang Tanah Melayu?',['Kedudukan strategik dan bahan mentah','Pilihan raya tempatan','Pendidikan rendah','Pertanian sara diri'],0,'马来亚具有战略位置和原料。','Jepun → strategik + bahan mentah'),
Q('Apakah propaganda Jepun di Asia?',['Asia untuk Orang Asia','Merdeka tujuh kali','Hidup British','Persekutuan untuk semua'],0,'日本宣传“亚洲人的亚洲”。','Asia untuk Orang Asia'),
Q('Bagaimanakah Jepun mengawal ekonomi?',['Catuan makanan dan penggunaan wang Jepun','Menghapus semua cukai','Membebaskan perdagangan','Menutup semua ladang'],0,'日本实行配给并发行军票。','ekonomi Jepun → catuan'),
Q('Apakah kesan penggunaan wang pokok pisang?',['Inflasi meningkat','Harga menurun','Ekonomi stabil','Eksport berkembang'],0,'军票导致通货膨胀。','wang pokok pisang → inflasi'),
Q('Mengapakah MPAJA ditubuhkan?',['Menentang pendudukan Jepun','Menyokong Jepun','Menubuhkan sekolah','Mengurus pelabuhan'],0,'MPAJA 成立以抗日。','MPAJA → lawan Jepun'),
Q('Apakah kesan pendudukan Jepun terhadap politik tempatan?',['Kesedaran kemerdekaan meningkat','Rakyat hilang semua kesedaran','Parti politik dihapus kekal','Tiada perubahan'],0,'日据时期提高独立意识。','pendudukan Jepun → kesedaran politik'),
Q('Apakah iktibar utama daripada pendudukan Jepun?',['Kedaulatan mesti dipertahankan','Kuasa asing perlu dijemput','Perpaduan tidak penting','Ekonomi tidak perlu dirancang'],0,'必须捍卫国家主权。','iktibar → pertahan kedaulatan')]);
add(3,[
Q('Siapakah wakil British mendapatkan tandatangan raja Melayu?',['Harold MacMichael','Gerald Templer','Malcolm MacDonald','Frank Swettenham'],0,'Harold MacMichael 取得马来统治者签名。','Harold MacMichael'),
Q('Apakah ciri Malayan Union?',['Negeri Melayu disatukan di bawah Gabenor British','Raja berkuasa mutlak','Singapura disatukan','Kerajaan negeri semakin kuat'],0,'马来各州由英国总督统一管理。','Malayan Union → Gabenor British'),
Q('Singapura tidak dimasukkan dalam Malayan Union kerana...',['Kepentingannya sebagai pelabuhan bebas','Tiada penduduk','Dikuasai Jepun','Menjadi negeri Melayu'],0,'新加坡因自由港利益被分开。','Singapura → pelabuhan bebas'),
Q('Mengapakah cara MacMichael ditentang?',['Menggunakan tekanan untuk mendapatkan tandatangan','Memberi kuasa penuh kepada raja','Membatalkan kewarganegaraan','Menyokong UMNO'],0,'他以压力取得签名。','MacMichael → tekanan'),
Q('Apakah tindakan Raja-raja Melayu menentang Malayan Union?',['Memulau upacara pelantikan Gabenor','Menyokong semua syarat','Membubarkan UMNO','Menutup istana'],0,'马来统治者抵制总督就职礼。','Raja-raja → pulau upacara'),
Q('Kongres Melayu 1946 membawa kepada penubuhan...',['UMNO','MCA','MIC','PKM'],0,'1946年马来人大会促成巫统成立。','Kongres Melayu → UMNO'),
Q('Siapakah presiden pertama UMNO?',['Dato Onn Jaafar','Tunku Abdul Rahman','Tun Razak','Ishak Haji Muhammad'],0,'翁惹化是巫统首任主席。','UMNO → Dato Onn Jaafar'),
Q('Apakah peranan akhbar Melayu dalam tentangan?',['Menyebarkan bantahan dan kesedaran','Menyokong Gabenor','Menutup kongres','Menghalang perpaduan'],0,'马来报章传播反对意见。','akhbar Melayu → bantahan'),
Q('Mengapakah British menggantikan Malayan Union?',['Tentangan orang Melayu yang kuat','Sokongan rakyat terlalu tinggi','Jepun kembali memerintah','Ekonomi runtuh sepenuhnya'],0,'强烈反对迫使英国改变计划。','tentangan kuat → ganti MU'),
Q('Apakah kesan tentangan secara teratur?',['British bersetuju berunding','Raja kehilangan kuasa sepenuhnya','UMNO dibubarkan','Malayan Union dikekalkan'],0,'有组织抗争迫使英国谈判。','tentangan teratur → rundingan'),
Q('Apakah nilai daripada perjuangan menentang Malayan Union?',['Bersatu mempertahankan hak','Menerima tekanan asing','Mengutamakan perpecahan','Menolak rundingan'],0,'团结维护权益是核心价值。','nilai → bersatu')]);
add(4,[
Q('Siapakah terlibat menggubal PTM 1948?',['Jawatankuasa Kerja','Suruhanjaya Reid','CLC','Rancangan Briggs'],0,'工作委员会拟定1948联邦协议。','PTM 1948 → Jawatankuasa Kerja'),
Q('Apakah tujuan penubuhan PTM 1948?',['Menggantikan Malayan Union','Menubuhkan republik','Menghapus raja','Menggabungkan Singapura'],0,'PTM 1948 取代马来亚联邦计划。','PTM 1948 → ganti MU'),
Q('Siapakah ketua PTM 1948?',['Pesuruhjaya Tinggi British','Gabenor Malayan Union','Perdana Menteri','Yang di-Pertuan Agong'],0,'行政首长是英国高级专员。','ketua PTM → Pesuruhjaya Tinggi'),
Q('Apakah kedudukan Singapura dalam PTM 1948?',['Kekal sebagai tanah jajahan berasingan','Menjadi negeri Melayu','Menjadi ibu negara','Dihapuskan'],0,'新加坡继续作为独立殖民地。','Singapura → berasingan'),
Q('Majlis Raja-Raja berfungsi untuk...',['Membolehkan raja membincangkan perkara bersama','Menghapus kuasa negeri','Mengurus syarikat asing','Menentukan harga eksport'],0,'统治者会议让各州君主共同讨论事务。','Majlis Raja-Raja'),
Q('Apakah syarat kewarganegaraan PTM 1948?',['Lebih ketat berbanding Malayan Union','Terbuka tanpa syarat','Untuk pedagang sahaja','Untuk British sahaja'],0,'公民条件比 Malayan Union 更严格。','kewarganegaraan → lebih ketat'),
Q('Apakah maksud rakyat Raja?',['Orang Melayu dan Orang Asli yang lahir di negeri Melayu','Semua pendatang baharu','Pegawai British','Tentera Jepun'],0,'“苏丹臣民”主要指在马来州出生的马来人与原住民。','rakyat Raja'),
Q('Mengapakah PTM 1948 diterima orang Melayu?',['Kedudukan raja dan Melayu dipulihkan','Singapura digabungkan','Kuasa Gabenor bertambah','Jus soli tanpa syarat'],0,'恢复君主与马来人地位，因此获接受。','diterima → kedudukan dipulihkan'),
Q('Apakah reaksi PUTERA-AMCJA?',['Menolak PTM 1948','Menyokong sepenuhnya','Membubarkan gabungan','Menyertai British'],0,'PUTERA-AMCJA 反对 PTM 1948。','PUTERA-AMCJA → menolak'),
Q('Perlembagaan Rakyat dicadangkan oleh...',['PUTERA-AMCJA','UMNO sahaja','British sahaja','Raja-raja Melayu'],0,'人民宪法由 PUTERA-AMCJA 提出。','Perlembagaan Rakyat'),
Q('Apakah kesan PTM 1948 terhadap kemerdekaan?',['Menjadi asas pentadbiran menuju berkerajaan sendiri','Menghapus perjuangan politik','Mengukuhkan penjajahan kekal','Menutup pilihan raya'],0,'它成为迈向自治与独立的行政基础。','PTM 1948 → asas kemerdekaan')]);
})();