-- Initial taxonomy seed. Safe to run after supabase/schema.sql.

insert into public.subjects(code,name) values
('1249','Sejarah'),
('1449','Mathematics'),
('4541','Additional Mathematics'),
('1511','Science'),
('4531','Physics'),
('4541-C','Chemistry'),
('4551','Biology'),
('1103','Bahasa Melayu'),
('1119','English')
on conflict (name) do nothing;

with s as (select id from public.subjects where name='Sejarah')
insert into public.chapters(subject_id,form_level,chapter_no,name,importance)
select s.id, x.form_level, x.chapter_no, x.name, x.importance
from s cross join (values
(4,1,'Warisan Negara Bangsa',82),(4,2,'Kebangkitan Nasionalisme',90),
(4,3,'Konflik Dunia dan Pendudukan Jepun di Negara Kita',88),
(4,4,'Era Peralihan Kuasa British di Negara Kita',84),
(4,5,'Persekutuan Tanah Melayu 1948',90),
(4,6,'Ancaman Komunis dan Perisytiharan Darurat',88),
(4,7,'Usaha ke Arah Kemerdekaan',94),(4,8,'Pilihan Raya',92),
(4,9,'Perlembagaan Persekutuan Tanah Melayu 1957',96),
(4,10,'Pemasyhuran Kemerdekaan',96),
(5,1,'Kedaulatan Negara',95),(5,2,'Perlembagaan Persekutuan',96),
(5,3,'Raja Berperlembagaan dan Demokrasi Berparlimen',95),
(5,4,'Sistem Persekutuan',90),(5,5,'Pembentukan Malaysia',96),
(5,6,'Cabaran Selepas Pembentukan Malaysia',90),
(5,7,'Membina Kesejahteraan Negara',88),
(5,8,'Membina Kemakmuran Negara',88),(5,9,'Dasar Luar Malaysia',91),
(5,10,'Kecemerlangan Malaysia di Persada Dunia',86)
) as x(form_level,chapter_no,name,importance)
on conflict (subject_id,form_level,chapter_no,curriculum) do update
set name=excluded.name, importance=excluded.importance;
