export type LyricLine = {
  time: number; // saniye cinsinden
  text: string;
};

export type Song = {
  url: string;
  title: string;
  artist: string;
  filename: string;
  cover?: string;
  lyrics?: LyricLine[];
};

export const SONGS: Song[] = [
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/ATLXS_Passo.mp3",
    "title": "Passo",
    "artist": "ATLXS",
    "filename": "ATLXS_Passo.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Aaron_Dancin.mp3",
    "title": "Aaron_Dancin",
    "artist": "Aaron Smith",
    "filename": "Aaron_Dancin.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Abdurrahman_Kabe.mp3",
    "title": "Kabede hacılara",
    "artist": "Abdurrahman Önül",
    "filename": "Abdurrahman_Kabe.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Affet.mp3",
    "title": "Affet",
    "artist": "Müslüm gürses",
    "filename": "Affet.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Alexander_Fairytale.mp3",
    "title": "Fairytale",
    "artist": "Alexander Rybak",
    "filename": "Alexander_Fairytale.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Alla_Beni_Pulla_Beni.mp3",
    "title": "Alla Beni Pulla Beni",
    "artist": "Barıl manço",
    "filename": "Alla_Beni_Pulla_Beni.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Altaylardan_Tunaya.mp3",
    "title": "Altaylardan Tunaya",
    "artist": "Ali aksoy",
    "filename": "Altaylardan_Tunaya.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Anlamazdin.mp3",
    "title": "Anlamazdin",
    "artist": "Ayla dikmen",
    "filename": "Anlamazdin.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Audiomachine_Guardians.mp3",
    "title": "Guardians",
    "artist": "Audiomachine",
    "filename": "Audiomachine_Guardians.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Baris_Derinden.mp3",
    "title": "Derinden",
    "artist": "Baris diri",
    "filename": "Baris_Derinden.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Beggin_Slowed.mp3",
    "title": "Beggin (Slowed)",
    "artist": "Maneskin",
    "filename": "Beggin_Slowed.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Boney_Rasputin.mp3",
    "title": "Rasputin",
    "artist": "Boney M",
    "filename": "Boney_Rasputin.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Bu_Havada.mp3",
    "title": "Bu Havada gidilmez",
    "artist": "Mabuş baba",
    "filename": "Bu_Havada.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Cagatay_Bizim.mp3",
    "title": "Bizim hikaye",
    "artist": "Cagatay Ulusoy",
    "filename": "Cagatay_Bizim.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Cem_Ceviz.mp3",
    "title": "Ceviz Agaci",
    "artist": "Cem Karaca",
    "filename": "Cem_Ceviz.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Cem_Tamirci.mp3",
    "title": "Tamirci cirağı",
    "artist": "Cem Karaca",
    "filename": "Cem_Tamirci.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Dark_Night.mp3",
    "title": "Dark Night",
    "artist": "Savlonic",
    "filename": "Dark_Night.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/David_Daylight.mp3",
    "title": "Daylight",
    "artist": "David Kushner",
    "filename": "David_Daylight.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Dre_Episode.mp3",
    "title": "Episode",
    "artist": "Dr. Dre",
    "filename": "Dre_Episode.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Etxrnall_Love.mp3",
    "title": "extnall Love",
    "artist": "Etxrnall",
    "filename": "Etxrnall_Love.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Evgeny_Valse.mp3",
    "title": "Valse",
    "artist": "Evgeny Grinko",
    "filename": "Evgeny_Valse.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Farazi_Dobro.mp3",
    "title": "Dobro",
    "artist": "Farazi",
    "filename": "Farazi_Dobro.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Fazil_Insan.mp3",
    "title": "Insan insan",
    "artist": "Fazil Say",
    "filename": "Fazil_Insan.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Funda_Caresizim.mp3",
    "title": "Caresizim",
    "artist": "Funda Arar",
    "filename": "Funda_Caresizim.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Gala_Freed.mp3",
    "title": "Freed from Desire",
    "artist": "Gala",
    "filename": "Gala_Freed.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Gangsta_Paradise.mp3",
    "title": "Gangsta's Paradise",
    "artist": "Coolio",
    "filename": "Gangsta_Paradise.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Gangsta_Paradise2.mp3",
    "title": "Gangsta's Paradise v2",
    "artist": "Coolio",
    "filename": "Gangsta_Paradise2.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Grup_Bella.mp3",
    "title": "Grup Bella",
    "artist": "Grup Bella",
    "filename": "Grup_Bella.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Guzin_Baha.mp3",
    "title": "Gençlik başımda duman",
    "artist": "Guzin ile baha",
    "filename": "Guzin_Baha.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Heart_Courage.mp3",
    "title": "Courage",
    "artist": "Superchick",
    "filename": "Heart_Courage.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Huznu_Hecem.mp3",
    "title": "Huznu Hecem",
    "artist": "Yener çevik",
    "filename": "Huznu_Hecem.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Imagine_Believer.mp3",
    "title": "Believer",
    "artist": "Imagine Dragons",
    "filename": "Imagine_Believer.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Imanbek_Belly.mp3",
    "title": "Belly Dancer",
    "artist": "Imanbek & BYOR",
    "filename": "Imanbek_Belly.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Indila_Danse.mp3",
    "title": "Danse",
    "artist": "Indila",
    "filename": "Indila_Danse.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Indila_Danse2.mp3",
    "title": "Danse v2",
    "artist": "Indila",
    "filename": "Indila_Danse2.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Kardan_Aydinlik.mp3",
    "title": "Kardan Aydinlik",
    "artist": "Teymullah",
    "filename": "Kardan_Aydinlik.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Khamzat_Chimaev.mp3",
    "title": "Khamzat Chimaev",
    "artist": "bilinmiyor",
    "filename": "Khamzat_Chimaev.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Lady_Bloody.mp3",
    "title": "Bloody Mary",
    "artist": "Lady Gaga",
    "filename": "Lady_Bloody.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Maneskin_Beggin.mp3",
    "title": "Beggin",
    "artist": "Maneskin",
    "filename": "Maneskin_Beggin.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Manga_Kadin.mp3",
    "title": "bir kadin çizeceksin",
    "artist": "Manga",
    "filename": "Manga_Kadin.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Manus_Baba.mp3",
    "title": "karanfil kokuyor cigaram",
    "artist": "Manus baba",
    "filename": "Manus_Baba.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Matushka_Ultrafunk.mp3",
    "title": "MAtushka Ultrafunk",
    "artist": "Matushka",
    "filename": "Matushka_Ultrafunk.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Mesela_Yani.mp3",
    "title": "Mesela Yani",
    "artist": "Kayra",
    "filename": "Mesela_Yani.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Model_Pembe.mp3",
    "title": "Pembe mezarlık",
    "artist": "Model",
    "filename": "Model_Pembe.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Modern_Cheri.mp3",
    "title": "Cheri Cheri Lady",
    "artist": "Modern Talking",
    "filename": "Modern_Cheri.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Mt_Bozkurt.mp3",
    "title": "Bozkurt ordusu",
    "artist": "Mt",
    "filename": "Mt_Bozkurt.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Nada_Nada.mp3",
    "title": "Nada Nada",
    "artist": "Jmilton",
    "filename": "Nada_Nada.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Nilufer.mp3",
    "title": "Nilufer",
    "artist": "Müslüm gürses",
    "filename": "Nilufer.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Nilufer_Caddelerde.mp3",
    "title": "Caddelerde rüzgar",
    "artist": "dobadali",
    "filename": "Nilufer_Caddelerde.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Oguzhan_Ayy.mp3",
    "title": "Ayy ben hala rüyada",
    "artist": "Oguzhan Koc",
    "filename": "Oguzhan_Ayy.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Orange_Yasidi.mp3",
    "title": "Ya sidi",
    "artist": "orange Blossom",
    "filename": "Orange_Yasidi.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Plevne_Marsi.mp3",
    "title": "Plevne Marsi",
    "artist": "Mehter Marsi",
    "filename": "Plevne_Marsi.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Rammstein_Sonne.mp3",
    "title": "Sonne_slowed",
    "artist": "Rammstein",
    "filename": "Rammstein_Sonne.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Savai_Dark.mp3",
    "title": "savai_Dark_life",
    "artist": "Savai",
    "filename": "Savai_Dark.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Sebnem_Mayin.mp3",
    "title": "Mayin_tarlası",
    "artist": "Sebnem Ferah",
    "filename": "Sebnem_Mayin.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Selin_Bana.mp3",
    "title": "Birde bana sor",
    "artist": "Selin",
    "filename": "Selin_Bana.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Star_Wars.mp3",
    "title": "Star Wars Theme",
    "artist": "John Williams",
    "filename": "Star_Wars.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Starset_Demons.mp3",
    "title": "My Demons",
    "artist": "Starset",
    "filename": "Starset_Demons.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Sunstroke_Runaway.mp3",
    "title": "Runaway",
    "artist": "Sunstroke Project",
    "filename": "Sunstroke_Runaway.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Warriyo_Mortals.mp3",
    "title": "Mortals",
    "artist": "Warriyo ft. Laura Brehm",
    "filename": "Warriyo_Mortals.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Adele.-.Easy.On.Me.Official.Lyric.Video.mp3",
    "title": "Easy On Me",
    "artist": "Adele",
    "filename": "Adele.-.Easy.On.Me.Official.Lyric.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Adele.-.Easy.On.Me.Official.Video.mp3",
    "title": "Easy On Me (Video)",
    "artist": "Adele",
    "filename": "Adele.-.Easy.On.Me.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Alan.Walker.-.Faded.mp3",
    "title": "Faded",
    "artist": "Alan Walker",
    "filename": "Alan.Walker.-.Faded.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Aleyna.Tilki.-.Tanirim.Intihari.mp3",
    "title": "Tanırım İntiharı",
    "artist": "Aleyna Tilki",
    "filename": "Aleyna.Tilki.-.Tanirim.Intihari.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Allame.-.Yemin.Et.feat.Joker.Official.Audio.mp3",
    "title": "Yemin Et",
    "artist": "Allame ft. Joker",
    "filename": "Allame.-.Yemin.Et.feat.Joker.Official.Audio.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Ask.Kitabi.mp3",
    "title": "Aşk Kitabı",
    "artist": "Athena",
    "filename": "Ask.Kitabi.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Athena.-.Ben.Boyleyim.mp3",
    "title": "Ben Böyleyim",
    "artist": "Athena",
    "filename": "Athena.-.Ben.Boyleyim.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Avicii.-.Wake.Me.Up.Official.Video.mp3",
    "title": "Wake Me Up",
    "artist": "Avicii",
    "filename": "Avicii.-.Wake.Me.Up.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Ben.Fero.Anil.Piyanci.-.Siki.Dur.Official.Audio.mp3",
    "title": "Siki Dur",
    "artist": "Ben Fero & Anıl Piyancı",
    "filename": "Ben.Fero.Anil.Piyanci.-.Siki.Dur.Official.Audio.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Billie.Eilish.-.bad.guy.mp3",
    "title": "bad guy",
    "artist": "Billie Eilish",
    "filename": "Billie.Eilish.-.bad.guy.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Calvin.Harris.-.Summer.Official.Video.mp3",
    "title": "Summer",
    "artist": "Calvin Harris",
    "filename": "Calvin.Harris.-.Summer.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Cardi.B.-.WAP.feat.Megan.Thee.Stallion.Official.Music.Video.mp3",
    "title": "WAP",
    "artist": "Cardi B ft. Megan Thee Stallion",
    "filename": "Cardi.B.-.WAP.feat.Megan.Thee.Stallion.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Cem.Adrian.-.Cem.Adrian.-.Elbet.Bir.Gun.Bulusacagiz.Official.Lyric.Video.mp3",
    "title": "Elbet Bir Gün Buluşacağız",
    "artist": "Cem Adrian",
    "filename": "Cem.Adrian.-.Cem.Adrian.-.Elbet.Bir.Gun.Bulusacagiz.Official.Lyric.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/CEZA.-.Holocaust.Official.Audio.mp3",
    "title": "Holocaust",
    "artist": "Ceza",
    "filename": "CEZA.-.Holocaust.Official.Audio.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/CEZA.-.Med.Cezir.Official.Audio.mp3",
    "title": "Med Cezir",
    "artist": "Ceza",
    "filename": "CEZA.-.Med.Cezir.Official.Audio.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Contra.-.Kibir.mp3",
    "title": "Kibir",
    "artist": "Contra",
    "filename": "Contra.-.Kibir.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Drake.-.One.Dance.Lyrics.mp3",
    "title": "One Dance",
    "artist": "Drake",
    "filename": "Drake.-.One.Dance.Lyrics.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Dua.Lipa.-.Levitating.Featuring.DaBaby.Official.Music.Video.mp3",
    "title": "Levitating",
    "artist": "Dua Lipa ft. DaBaby",
    "filename": "Dua.Lipa.-.Levitating.Featuring.DaBaby.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Duman.-.Seni.Kendime.Sakladim.mp3",
    "title": "Seni Kendime Sakladım",
    "artist": "Duman",
    "filename": "Duman.-.Seni.Kendime.Sakladim.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Ebru.Yasar.Burak.Bulut.-.Affet.mp3",
    "title": "Affet",
    "artist": "Ebru Yaşar & Burak Bulut",
    "filename": "Ebru.Yasar.Burak.Bulut.-.Affet.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Ed.Sheeran.-.Shape.of.You.Official.Music.Video.mp3",
    "title": "Shape of You",
    "artist": "Ed Sheeran",
    "filename": "Ed.Sheeran.-.Shape.of.You.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Eminem.-.Without.Me.Official.Music.Video.mp3",
    "title": "Without Me",
    "artist": "Eminem",
    "filename": "Eminem.-.Without.Me.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Ezhel.-.Geceler.mp3",
    "title": "Geceler",
    "artist": "Ezhel",
    "filename": "Ezhel.-.Geceler.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Glass.Animals.-.Heat.Waves.mp3",
    "title": "Heat Waves",
    "artist": "Glass Animals",
    "filename": "Glass.Animals.-.Heat.Waves.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Gripin.-.Yanimda.Kal.-.Alpay.a.Saygi.mp3",
    "title": "Yanımda Kal",
    "artist": "Gripin",
    "filename": "Gripin.-.Yanimda.Kal.-.Alpay.a.Saygi.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Hadise.-.Ask.Kac.Beden.Giyer.mp3",
    "title": "Aşk Kaç Beden Giyer",
    "artist": "Hadise",
    "filename": "Hadise.-.Ask.Kac.Beden.Giyer.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Harry.Styles.-.As.It.Was.Official.Video.mp3",
    "title": "As It Was",
    "artist": "Harry Styles",
    "filename": "Harry.Styles.-.As.It.Was.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Ibrahim.Tatlises.-.Etek.Sari.mp3",
    "title": "Etek Sarı",
    "artist": "İbrahim Tatlıses",
    "filename": "Ibrahim.Tatlises.-.Etek.Sari.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Imagine.Dragons.x.J.I.D.-.Enemy.from.the.series.Arcane.League.of.Legends.mp3",
    "title": "Enemy",
    "artist": "Imagine Dragons x J.I.D",
    "filename": "Imagine.Dragons.x.J.I.D.-.Enemy.from.the.series.Arcane.League.of.Legends.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Jabbar.YAK.mp3",
    "title": "YAK",
    "artist": "Jabbar",
    "filename": "Jabbar.YAK.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Kalan.Saglar.Senin.Olsun.mp3",
    "title": "Senin Olsun",
    "artist": "Kalan Sağlar",
    "filename": "Kalan.Saglar.Senin.Olsun.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Kendrick.Lamar.-.HUMBLE.mp3",
    "title": "HUMBLE",
    "artist": "Kendrick Lamar",
    "filename": "Kendrick.Lamar.-.HUMBLE.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Lil.Nas.X.-.MONTERO.Call.Me.By.Your.Name.Official.Video.mp3",
    "title": "MONTERO",
    "artist": "Lil Nas X",
    "filename": "Lil.Nas.X.-.MONTERO.Call.Me.By.Your.Name.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/maNga.-.Beni.Benimle.Birak.mp3",
    "title": "Beni Benimle Bırak",
    "artist": "maNga",
    "filename": "maNga.-.Beni.Benimle.Birak.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/maNga.-.We.Could.Be.The.Same.-.Turkey.-.Grand.Final.-.Eurovision.2010.mp3",
    "title": "We Could Be The Same",
    "artist": "maNga",
    "filename": "maNga.-.We.Could.Be.The.Same.-.Turkey.-.Grand.Final.-.Eurovision.2010.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Marshmello.ft.Bastille.-.Happier.Official.Music.Video.mp3",
    "title": "Happier",
    "artist": "Marshmello ft. Bastille",
    "filename": "Marshmello.ft.Bastille.-.Happier.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Miley.Cyrus.-.Flowers.Official.Video.mp3",
    "title": "Flowers",
    "artist": "Miley Cyrus",
    "filename": "Miley.Cyrus.-.Flowers.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/mor.ve.otesi.-.Bir.Derdim.Var.Official.Video.mp3",
    "title": "Bir Derdim Var",
    "artist": "Mor ve Ötesi",
    "filename": "mor.ve.otesi.-.Bir.Derdim.Var.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Muslum.Gurses.-.Affet.mp3",
    "title": "Affet",
    "artist": "Müslüm Gürses",
    "filename": "Muslum.Gurses.-.Affet.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/NewJeans.Super.Shy.Official.MV.mp3",
    "title": "Super Shy",
    "artist": "NewJeans",
    "filename": "NewJeans.Super.Shy.Official.MV.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Norm.Ender.-.Mekanin.Sahibi.mp3",
    "title": "Mekanın Sahibi",
    "artist": "Norm Ender",
    "filename": "Norm.Ender.-.Mekanin.Sahibi.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Oguzhan.Koc.-.Hesabima.Yaziyor.Official.Video.mp3",
    "title": "Hesabıma Yazıyor",
    "artist": "Oğuzhan Koç",
    "filename": "Oguzhan.Koc.-.Hesabima.Yaziyor.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Olivia.Rodrigo.-.drivers.license.Official.Video.mp3",
    "title": "drivers license",
    "artist": "Olivia Rodrigo",
    "filename": "Olivia.Rodrigo.-.drivers.license.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Orhan.Gencebay-batsin.bu.dunya.mp3",
    "title": "Batsın Bu Dünya",
    "artist": "Orhan Gencebay",
    "filename": "Orhan.Gencebay-batsin.bu.dunya.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Otonom.Piyade.-.Kapali.Kapilar.Video.mp3",
    "title": "Kapalı Kapılar",
    "artist": "Otonom Piyade",
    "filename": "Otonom.Piyade.-.Kapali.Kapilar.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Pavyon.-.Ezhel.DJ.Artz.Official.Video.mp3",
    "title": "Pavyon",
    "artist": "Ezhel & DJ Artz",
    "filename": "Pavyon.-.Ezhel.DJ.Artz.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Pinhani.-.Ben.Nasil.Buyuk.Adam.Olucam.mp3",
    "title": "Ben Nasıl Büyük Adam Olucam",
    "artist": "Pinhani",
    "filename": "Pinhani.-.Ben.Nasil.Buyuk.Adam.Olucam.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Post.Malone.-.rockstar.Official.Music.Video.ft.21.Savage.mp3",
    "title": "rockstar",
    "artist": "Post Malone ft. 21 Savage",
    "filename": "Post.Malone.-.rockstar.Official.Music.Video.ft.21.Savage.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Post.Malone.Swae.Lee.-.Sunflower.Spider-Man.Into.the.Spider-Verse.mp3",
    "title": "Sunflower",
    "artist": "Post Malone & Swae Lee",
    "filename": "Post.Malone.Swae.Lee.-.Sunflower.Spider-Man.Into.the.Spider-Verse.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Raks.Aga.-.Karabasan.mp3",
    "title": "Karabasan",
    "artist": "Raks Ağa",
    "filename": "Raks.Aga.-.Karabasan.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Reynmen.-.Derdim.Olsun.Official.Video.mp3",
    "title": "Derdim Olsun",
    "artist": "Reynmen",
    "filename": "Reynmen.-.Derdim.Olsun.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Semicenk.-.Cikmaz.Bir.Sokakta.mp3",
    "title": "Çıkmaz Bir Sokakta",
    "artist": "Semicenk",
    "filename": "Semicenk.-.Cikmaz.Bir.Sokakta.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Server.Uraz.-.Akbaba.Ziyafeti.Official.Video.mp3",
    "title": "Akbaba Ziyafeti",
    "artist": "Server Uraz",
    "filename": "Server.Uraz.-.Akbaba.Ziyafeti.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Seytan.Bunun.Neresinde.mp3",
    "title": "Şeytan Bunun Neresinde",
    "artist": "bilinmiyor",
    "filename": "Seytan.Bunun.Neresinde.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Sezen.Aksu.-.Firuze.Official.Audio.-.Orijinal.Plak.Kayit.mp3",
    "title": "Firuze",
    "artist": "Sezen Aksu",
    "filename": "Sezen.Aksu.-.Firuze.Official.Audio.-.Orijinal.Plak.Kayit.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Stromae.-.Alors.on.danse.Official.Video.mp3",
    "title": "Alors on danse",
    "artist": "Stromae",
    "filename": "Stromae.-.Alors.on.danse.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/TARKAN.-.Adimi.Kalbine.Yaz.Official.Audio.mp3",
    "title": "Adımı Kalbine Yaz",
    "artist": "Tarkan",
    "filename": "TARKAN.-.Adimi.Kalbine.Yaz.Official.Audio.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Taylor.Swift.-.Anti-Hero.Official.Music.Video.mp3",
    "title": "Anti-Hero",
    "artist": "Taylor Swift",
    "filename": "Taylor.Swift.-.Anti-Hero.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/The.Kid.LAROI.Justin.Bieber.-.STAY.Official.Video.mp3",
    "title": "STAY",
    "artist": "The Kid LAROI & Justin Bieber",
    "filename": "The.Kid.LAROI.Justin.Bieber.-.STAY.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/The.Weeknd.-.Blinding.Lights.Official.Video.mp3",
    "title": "Blinding Lights",
    "artist": "The Weeknd",
    "filename": "The.Weeknd.-.Blinding.Lights.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/TONES.AND.I.-.DANCE.MONKEY.OFFICIAL.VIDEO.mp3",
    "title": "Dance Monkey",
    "artist": "Tones and I",
    "filename": "TONES.AND.I.-.DANCE.MONKEY.OFFICIAL.VIDEO.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Travis.Scott.-.SICKO.MODE.Official.Video.ft.Drake.mp3",
    "title": "SICKO MODE",
    "artist": "Travis Scott ft. Drake",
    "filename": "Travis.Scott.-.SICKO.MODE.Official.Video.ft.Drake.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Ufo361.-.ICH.BIN.EIN.BERLINER.mp3",
    "title": "ICH BIN EIN BERLINER",
    "artist": "Ufo361",
    "filename": "Ufo361.-.ICH.BIN.EIN.BERLINER.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/What.is.a.data.center.mp3",
    "title": "What is a Data Center",
    "artist": "bilinmiyor",
    "filename": "What.is.a.data.center.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/HITLER.mp3",
    "title": "Hitler",
    "artist": "Ado",
    "filename": "HITLER.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/HITLER_bass.mp3",
    "title": "Hitler (Bass Boosted)",
    "artist": "Ado",
    "filename": "HITLER_bass.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/ITU_Mehter_Ceddin_Deden.mp3",
    "title": "Ceddin Deden",
    "artist": "İTÜ Mehter Birimi",
    "filename": "ITU_Mehter_Ceddin_Deden.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/AKDO.Lvbel.C5.-.SUBMARINER.mp3",
    "title": "SUBMARINER",
    "artist": "AKDO, Lvbel C5",
    "filename": "AKDO.Lvbel.C5.-.SUBMARINER.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Alay.Marsi.Turk.Asker.Marslari.-.Turkish.Army.Anthem.mp3",
    "title": "Alay Marşı",
    "artist": "Türk Asker Marşları",
    "filename": "Alay.Marsi.Turk.Asker.Marslari.-.Turkish.Army.Anthem.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Amo988.-.Elini.Ver.mp3",
    "title": "Elini Ver",
    "artist": "Amo988",
    "filename": "Amo988.-.Elini.Ver.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Atilla.Yilmaz.Gundogdu.Marsi.La.Galibe.Illallah.mp3",
    "title": "Gündoğdu Marşı (La Galibe İllallah)",
    "artist": "Atilla Yılmaz",
    "filename": "Atilla.Yilmaz.Gundogdu.Marsi.La.Galibe.Illallah.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Aykut.Closer.-MyNeck.MyBack.mp3",
    "title": "My Neck My Back",
    "artist": "Aykut Closer",
    "filename": "Aykut.Closer.-MyNeck.MyBack.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Limp.bizkit.-.Take.a.look.around.mp3",
    "title": "Take a Look Around",
    "artist": "Limp Bizkit",
    "filename": "Limp.bizkit.-.Take.a.look.around.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Enth.E.Nd.-.Linkin.Park.Reanimation.mp3",
    "title": "Enth E Nd",
    "artist": "Linkin Park",
    "filename": "Enth.E.Nd.-.Linkin.Park.Reanimation.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/CEZA.-.Fark.Var.Official.Audio.mp3",
    "title": "Fark Var",
    "artist": "Ceza",
    "filename": "CEZA.-.Fark.Var.Official.Audio.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Crawling.Official.HD.Music.Video.-.Linkin.Park.mp3",
    "title": "Crawling",
    "artist": "Linkin Park",
    "filename": "Crawling.Official.HD.Music.Video.-.Linkin.Park.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Crazy.Robert.Cristian.Remix.mp3",
    "title": "Crazy (Robert Cristian Remix)",
    "artist": "Faydee",
    "filename": "Crazy.Robert.Cristian.Remix.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Cure.For.The.Itch.-.Linkin.Park.Hybrid.Theory.mp3",
    "title": "Cure for the Itch",
    "artist": "Linkin Park",
    "filename": "Cure.For.The.Itch.-.Linkin.Park.Hybrid.Theory.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/CVRTOON.-.Operasyon.mp3",
    "title": "Operasyon",
    "artist": "CVRTOON",
    "filename": "CVRTOON.-.Operasyon.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/CVRTOON.-.VATAN.SAGOLSUN.mp3",
    "title": "Vatan Sağolsun",
    "artist": "CVRTOON",
    "filename": "CVRTOON.-.VATAN.SAGOLSUN.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Daniel.Pemberton.-.The.Prowler.From.Spider-Man.Into.the.Spider-Verse.Score.mp3",
    "title": "The Prowler",
    "artist": "Daniel Pemberton",
    "filename": "Daniel.Pemberton.-.The.Prowler.From.Spider-Man.Into.the.Spider-Verse.Score.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Deftones.-.MX.-.Lyrics.mp3",
    "title": "MX",
    "artist": "Deftones",
    "filename": "Deftones.-.MX.-.Lyrics.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Deftones.-.My.Own.Summer.Official.Music.Video.HD.Remaster.mp3",
    "title": "My Own Summer (Shove It)",
    "artist": "Deftones",
    "filename": "Deftones.-.My.Own.Summer.Official.Music.Video.HD.Remaster.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Destan.mp3",
    "title": "Destan",
    "artist": "",
    "filename": "Destan.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/DJ.Oliver.Mendes.-.Brutal.Infernal.Funk.Slowed.mp3",
    "title": "Brutal Infernal Funk (Slowed)",
    "artist": "DJ Oliver Mendes",
    "filename": "DJ.Oliver.Mendes.-.Brutal.Infernal.Funk.Slowed.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/DJ.Snake.Lil.Jon.-.Turn.Down.for.What.mp3",
    "title": "Turn Down for What",
    "artist": "DJ Snake, Lil Jon",
    "filename": "DJ.Snake.Lil.Jon.-.Turn.Down.for.What.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Don.Omar.-.Danza.Kuduro.ft.Lucenzo.mp3",
    "title": "Danza Kuduro",
    "artist": "Don Omar ft. Lucenzo",
    "filename": "Don.Omar.-.Danza.Kuduro.ft.Lucenzo.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Don.t.Stay.-.Linkin.Park.Meteora.mp3",
    "title": "Don't Stay",
    "artist": "Linkin Park",
    "filename": "Don.t.Stay.-.Linkin.Park.Meteora.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Drowning.Pool.-.Bodies.Official.HD.Music.Video.mp3",
    "title": "Bodies",
    "artist": "Drowning Pool",
    "filename": "Drowning.Pool.-.Bodies.Official.HD.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Duman.-.Seviyorsan.Inaniyorsan.mp3",
    "title": "Seviyorsan İnanıyorsan",
    "artist": "Duman",
    "filename": "Duman.-.Seviyorsan.Inaniyorsan.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Duman_Kufi.mp3",
    "title": "Duman Küfi",
    "artist": "Duman",
    "filename": "Duman_Kufi.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Duncan.Laurence.-.Arcade.Lyric.Video.ft.FLETCHER.mp3",
    "title": "Arcade",
    "artist": "Duncan Laurence ft. FLETCHER",
    "filename": "Duncan.Laurence.-.Arcade.Lyric.Video.ft.FLETCHER.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/ElMusto.-.Dale.Don.Dale.Official.Music.Video.mp3",
    "title": "Dale Don Dale",
    "artist": "ElMusto",
    "filename": "ElMusto.-.Dale.Don.Dale.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Kiss.-.I.Was.Made.For.Lovin.You.mp3",
    "title": "I Was Made for Lovin' You",
    "artist": "KISS",
    "filename": "Kiss.-.I.Was.Made.For.Lovin.You.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Era7capone.ft.Batuflex.-.CISTAK.Official.Video.mp3",
    "title": "CISTAK",
    "artist": "Era7capone ft. Batuflex",
    "filename": "Era7capone.ft.Batuflex.-.CISTAK.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Faint.Official.Music.Video.4K.UPGRADE.Linkin.Park.mp3",
    "title": "Faint",
    "artist": "Linkin Park",
    "filename": "Faint.Official.Music.Video.4K.UPGRADE.Linkin.Park.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Figure.09.-.Linkin.Park.Meteora.mp3",
    "title": "Figure.09",
    "artist": "Linkin Park",
    "filename": "Figure.09.-.Linkin.Park.Meteora.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/FloyyMenor.Cris.MJ.-.Gata.Only.mp3",
    "title": "Gata Only",
    "artist": "FloyyMenor, Cris MJ",
    "filename": "FloyyMenor.Cris.MJ.-.Gata.Only.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Fonola.Band.-.Bella.Ciao.Audio.mp3",
    "title": "Bella Ciao",
    "artist": "Fonola Band",
    "filename": "Fonola.Band.-.Bella.Ciao.Audio.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Forgotten.-.Linkin.Park.Hybrid.Theory.mp3",
    "title": "Forgotten",
    "artist": "Linkin Park",
    "filename": "Forgotten.-.Linkin.Park.Hybrid.Theory.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/From.The.Inside.Official.Music.Video.4K.UPGRADE.Linkin.Park.mp3",
    "title": "From the Inside",
    "artist": "Linkin Park",
    "filename": "From.The.Inside.Official.Music.Video.4K.UPGRADE.Linkin.Park.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Gece.Golgenin.Rahatina.Bak.-.Cagatay.Akman.Official.Video.mp3",
    "title": "Gece Gölgenin Rahatına Bak",
    "artist": "Çağatay Akman",
    "filename": "Gece.Golgenin.Rahatina.Bak.-.Cagatay.Akman.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/GIMS.-.NINAO.Clip.officiel.mp3",
    "title": "NINAO",
    "artist": "GIMS",
    "filename": "GIMS.-.NINAO.Clip.officiel.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Grup.VOLKAN.-SAHLANIS.MARSI-.mp3",
    "title": "Şahlanış Marşı",
    "artist": "Grup Volkan",
    "filename": "Grup.VOLKAN.-SAHLANIS.MARSI-.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/H.Vltg3.-.Linkin.Park.Reanimation.mp3",
    "title": "H! Vltg3",
    "artist": "Linkin Park",
    "filename": "H.Vltg3.-.Linkin.Park.Reanimation.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Hands.Held.High.-.Linkin.Park.Minutes.To.Midnight.mp3",
    "title": "Hands Held High",
    "artist": "Linkin Park",
    "filename": "Hands.Held.High.-.Linkin.Park.Minutes.To.Midnight.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/High.Voltage.-.Linkin.Park.mp3",
    "title": "High Voltage",
    "artist": "Linkin Park",
    "filename": "High.Voltage.-.Linkin.Park.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Hit.The.Floor.-.Linkin.Park.Meteora.mp3",
    "title": "Hit the Floor",
    "artist": "Linkin Park",
    "filename": "Hit.The.Floor.-.Linkin.Park.Meteora.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Home.Free.-.Sea.Shanty.Medley.mp3",
    "title": "Sea Shanty Medley",
    "artist": "Home Free",
    "filename": "Home.Free.-.Sea.Shanty.Medley.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Hot.Dog.mp3",
    "title": "Hot Dog",
    "artist": "Limp Bizkit",
    "filename": "Hot.Dog.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/In.The.End.Official.HD.Music.Video.-.Linkin.Park.mp3",
    "title": "In the End",
    "artist": "Linkin Park",
    "filename": "In.The.End.Official.HD.Music.Video.-.Linkin.Park.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/INNA.-.Bad.Boys.Exclusive.Online.Video.mp3",
    "title": "Bad Boys",
    "artist": "INNA",
    "filename": "INNA.-.Bad.Boys.Exclusive.Online.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Kirac.-.Gundogdu.Marsi.mp3",
    "title": "Gündoğdu Marşı",
    "artist": "Kıraç",
    "filename": "Kirac.-.Gundogdu.Marsi.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Linkin.Park.-.Given.Up.Live.In.Clarkston.HD.mp3",
    "title": "Given Up (Live)",
    "artist": "Linkin Park",
    "filename": "Linkin.Park.-.Given.Up.Live.In.Clarkston.HD.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Linkin.Park.-.A.Place.for.My.Head.Live.In.Texas.mp3",
    "title": "A Place for My Head (Live)",
    "artist": "Linkin Park",
    "filename": "Linkin.Park.-.A.Place.for.My.Head.Live.In.Texas.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Linkin.Park.-.Papercut.Live.In.Texas.mp3",
    "title": "Papercut (Live)",
    "artist": "Linkin Park",
    "filename": "Linkin.Park.-.Papercut.Live.In.Texas.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Luis.Fonsi.-.Despacito.ft.Daddy.Yankee.mp3",
    "title": "Despacito",
    "artist": "Luis Fonsi ft. Daddy Yankee",
    "filename": "Luis.Fonsi.-.Despacito.ft.Daddy.Yankee.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/LVBEL.C5.-.nE.mp3",
    "title": "nE?",
    "artist": "Lvbel C5",
    "filename": "LVBEL.C5.-.nE.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/LVBEL.C5.-.SEZEN.AKSU.mp3",
    "title": "SEZEN AKSU",
    "artist": "Lvbel C5",
    "filename": "LVBEL.C5.-.SEZEN.AKSU.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Lying.From.You.-.Linkin.Park.Meteora.mp3",
    "title": "Lying From You",
    "artist": "Linkin Park",
    "filename": "Lying.From.You.-.Linkin.Park.Meteora.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Mabel.Matiz.-.Ahu.mp3",
    "title": "Ahu",
    "artist": "Mabel Matiz",
    "filename": "Mabel.Matiz.-.Ahu.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/MALA.feat.Anuel.Aa.mp3",
    "title": "MALA",
    "artist": "6ix9ine ft. Anuel AA",
    "filename": "MALA.feat.Anuel.Aa.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Megadeth.-.Tipping.Point.Official.Music.Video.mp3",
    "title": "Tipping Point",
    "artist": "Megadeth",
    "filename": "Megadeth.-.Tipping.Point.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Mehter.Dunyanin.En.Eski.Askeri.Bandosu.-.Estergon.Kal.asi.mp3",
    "title": "Estergon Kalesi",
    "artist": "Mehter",
    "filename": "Mehter.Dunyanin.En.Eski.Askeri.Bandosu.-.Estergon.Kal.asi.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Lady.Gaga.Bruno.Mars.-.Die.With.A.Smile.Official.Music.Video.mp3",
    "title": "Die With a Smile",
    "artist": "Lady Gaga, Bruno Mars",
    "filename": "Lady.Gaga.Bruno.Mars.-.Die.With.A.Smile.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Limp.Bizkit.-.Boiler.Official.Music.Video.mp3",
    "title": "Boiler",
    "artist": "Limp Bizkit",
    "filename": "Limp.Bizkit.-.Boiler.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Limp.Bizkit.-.Break.Stuff.Official.Music.Video.mp3",
    "title": "Break Stuff",
    "artist": "Limp Bizkit",
    "filename": "Limp.Bizkit.-.Break.Stuff.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Limp.Bizkit.-.Gold.Cobra.mp3",
    "title": "Gold Cobra",
    "artist": "Limp Bizkit",
    "filename": "Limp.Bizkit.-.Gold.Cobra.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Limp.Bizkit.-.Livin.It.Up.Party.Up.Live.at.Budapest.Hungary.2015.Official.Pro.Shot.mp3",
    "title": "Livin' It Up",
    "artist": "Limp Bizkit",
    "filename": "Limp.Bizkit.-.Livin.It.Up.Party.Up.Live.at.Budapest.Hungary.2015.Official.Pro.Shot.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Limp.Bizkit.-.My.Generation.mp3",
    "title": "My Generation",
    "artist": "Limp Bizkit",
    "filename": "Limp.Bizkit.-.My.Generation.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Limp.Bizkit.-.My.Way.mp3",
    "title": "My Way",
    "artist": "Limp Bizkit",
    "filename": "Limp.Bizkit.-.My.Way.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Limp.Bizkit.-.Nookie.Official.Music.Video.mp3",
    "title": "Nookie",
    "artist": "Limp Bizkit",
    "filename": "Limp.Bizkit.-.Nookie.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Limp.Bizkit.-.Rollin.Air.Raid.Vehicle.mp3",
    "title": "Rollin' (Air Raid Vehicle)",
    "artist": "Limp Bizkit",
    "filename": "Limp.Bizkit.-.Rollin.Air.Raid.Vehicle.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Michel.Telo.-.Ai.Se.Eu.Te.Pego.-.Video.Oficial.Assim.voce.me.mata.mp3",
    "title": "Ai Se Eu Te Pego",
    "artist": "Michel Teló",
    "filename": "Michel.Telo.-.Ai.Se.Eu.Te.Pego.-.Video.Oficial.Assim.voce.me.mata.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Muhabbet.Bagina.Girdim.Bu.Gece.Ararim.Sorarim.mp3",
    "title": "Muhabbet Bağına Girdim",
    "artist": "Pamela",
    "filename": "Muhabbet.Bagina.Girdim.Bu.Gece.Ararim.Sorarim.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Murat.Gogebakan.-.Vurgunum.Official.Video.mp3",
    "title": "Vurgunum",
    "artist": "Murat Göğebakan",
    "filename": "Murat.Gogebakan.-.Vurgunum.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Muslum.Gurses.-.Sigara.mp3",
    "title": "Sigara",
    "artist": "Müslüm Gürses",
    "filename": "Muslum.Gurses.-.Sigara.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Muslum.Gurses.-.Tutamiyorum.Zamani.mp3",
    "title": "Tutamıyorum Zamanı",
    "artist": "Müslüm Gürses",
    "filename": "Muslum.Gurses.-.Tutamiyorum.Zamani.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/New.Divide.Official.Music.Video.4K.Upgrade.-.Linkin.Park.mp3",
    "title": "New Divide",
    "artist": "Linkin Park",
    "filename": "New.Divide.Official.Music.Video.4K.Upgrade.-.Linkin.Park.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Nobody.s.Listening.-.Linkin.Park.Meteora.mp3",
    "title": "Nobody's Listening",
    "artist": "Linkin Park",
    "filename": "Nobody.s.Listening.-.Linkin.Park.Meteora.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Numb.Encore.Live.Official.Music.Video.4K.Upgrade.-.Linkin.Park.JAY-Z.mp3",
    "title": "Numb / Encore (Live)",
    "artist": "Linkin Park & JAY-Z",
    "filename": "Numb.Encore.Live.Official.Music.Video.4K.Upgrade.-.Linkin.Park.JAY-Z.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Oguzhan.Koc.-.Hesabima.Yaziyor.Official.Video.mp3",
    "title": "Hesabıma Yazıyor",
    "artist": "Oğuzhan Koç",
    "filename": "Oguzhan.Koc.-.Hesabima.Yaziyor.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Papa.Roach.-.Between.Angels.And.Insects.mp3",
    "title": "Between Angels and Insects",
    "artist": "Papa Roach",
    "filename": "Papa.Roach.-.Between.Angels.And.Insects.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Papercut.Official.HD.Music.Video.-.Linkin.Park.mp3",
    "title": "Papercut",
    "artist": "Linkin Park",
    "filename": "Papercut.Official.HD.Music.Video.-.Linkin.Park.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Pirates.Of.The.Caribbean.-.Main.Theme.-.He.s.A.Pirate.mp3",
    "title": "He's a Pirate",
    "artist": "Pirates of the Caribbean",
    "filename": "Pirates.Of.The.Caribbean.-.Main.Theme.-.He.s.A.Pirate.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Points.Of.Authority.Official.HD.Music.Video.-.Linkin.Park.mp3",
    "title": "Points of Authority",
    "artist": "Linkin Park",
    "filename": "Points.Of.Authority.Official.HD.Music.Video.-.Linkin.Park.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/PSY.-.GANGNAM.STYLE.M.V.mp3",
    "title": "Gangnam Style",
    "artist": "PSY",
    "filename": "PSY.-.GANGNAM.STYLE.M.V.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Pushing.Me.Away.-.Linkin.Park.Hybrid.Theory.mp3",
    "title": "Pushing Me Away",
    "artist": "Linkin Park",
    "filename": "Pushing.Me.Away.-.Linkin.Park.Hybrid.Theory.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/One.Step.Closer.Official.HD.Music.Video.-.Linkin.Park.mp3",
    "title": "One Step Closer",
    "artist": "Linkin Park",
    "filename": "One.Step.Closer.Official.HD.Music.Video.-.Linkin.Park.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Raim.Artur.Adil.-.OFFICIAL.VIDEO.mp3",
    "title": "Sımpa",
    "artist": "RaiM, Artur, Adil",
    "filename": "Raim.Artur.Adil.-.OFFICIAL.VIDEO.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Remember.The.Name.Official.Video.-.Fort.Minor.4K.mp3",
    "title": "Remember the Name",
    "artist": "Fort Minor",
    "filename": "Remember.The.Name.Official.Video.-.Fort.Minor.4K.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Reynmen.-.Renklensin.Official.Premiere.Video.mp3",
    "title": "Renklensin",
    "artist": "Reynmen",
    "filename": "Reynmen.-.Renklensin.Official.Premiere.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Runaway.-.Linkin.Park.Hybrid.Theory.mp3",
    "title": "Runaway",
    "artist": "Linkin Park",
    "filename": "Runaway.-.Linkin.Park.Hybrid.Theory.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Sefo.Capo.-.ISABELLE.Official.Video.mp3",
    "title": "ISABELLE",
    "artist": "Sefo & Capo",
    "filename": "Sefo.Capo.-.ISABELLE.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Sen.Istanbul.sun.Official.Video.-.Gokhan.Turkmen.enbastan.mp3",
    "title": "Sen İstanbul'sun",
    "artist": "Gökhan Türkmen",
    "filename": "Sen.Istanbul.sun.Official.Video.-.Gokhan.Turkmen.enbastan.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Serdar.Ortac.-.Poset.mp3",
    "title": "Poşet",
    "artist": "Serdar Ortaç",
    "filename": "Serdar.Ortac.-.Poset.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Serhat.Durmus.-.Turkum.mp3",
    "title": "Türküm",
    "artist": "Serhat Durmus",
    "filename": "Serhat.Durmus.-.Turkum.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Set.Fire.to.the.Rain.mp3",
    "title": "Set Fire to the Rain",
    "artist": "Adele",
    "filename": "Set.Fire.to.the.Rain.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Shakira.-.Waka.Waka.This.Time.For.Africa.Official.HD.Video.ft.Freshlyground.mp3",
    "title": "Waka Waka",
    "artist": "Shakira",
    "filename": "Shakira.-.Waka.Waka.This.Time.For.Africa.Official.HD.Video.ft.Freshlyground.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/SHX4.-.OI.OI.OI.BAKA.Brazilian.Funk.mp3",
    "title": "OI OI OI BAKA",
    "artist": "RioX",
    "filename": "SHX4.-.OI.OI.OI.BAKA.Brazilian.Funk.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Sila.-.Kafa.mp3",
    "title": "Kafa",
    "artist": "Sıla Gençoğlu",
    "filename": "Sila.-.Kafa.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/SLANDER.-.Love.Is.Gone.ft.Dylan.Matthew.Acoustic.mp3",
    "title": "Love Is Gone (Acoustic)",
    "artist": "SLANDER",
    "filename": "SLANDER.-.Love.Is.Gone.ft.Dylan.Matthew.Acoustic.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Somewhere.I.Belong.Official.Music.Video.4K.UPGRADE.Linkin.Park.mp3",
    "title": "Somewhere I Belong",
    "artist": "Linkin Park",
    "filename": "Somewhere.I.Belong.Official.Music.Video.4K.UPGRADE.Linkin.Park.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Spice.Sean.Paul.Shaggy.-.Go.Down.Deh.Official.Music.Video.mp3",
    "title": "Go Down Deh",
    "artist": "Spice, Sean Paul, Shaggy",
    "filename": "Spice.Sean.Paul.Shaggy.-.Go.Down.Deh.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Stained.Live.-.Linkin.Park.mp3",
    "title": "Stained (Live)",
    "artist": "Linkin Park",
    "filename": "Stained.Live.-.Linkin.Park.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/System.Of.A.Down.-.Chop.Suey.Official.HD.Video.mp3",
    "title": "Chop Suey",
    "artist": "System Of A Down",
    "filename": "System.Of.A.Down.-.Chop.Suey.Official.HD.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/The.Eastern.Man.-.Dive.Official.MV.mp3",
    "title": "Dive",
    "artist": "The Eastern Man",
    "filename": "The.Eastern.Man.-.Dive.Official.MV.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Tokyo.Drift.-.Teriyaki.Boyz.MUSIC.VIDEO.HD.mp3",
    "title": "Tokyo Drift",
    "artist": "Teriyaki Boyz",
    "filename": "Tokyo.Drift.-.Teriyaki.Boyz.MUSIC.VIDEO.HD.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Two.Faced.Official.Music.Video.-.Linkin.Park.mp3",
    "title": "Two Faced",
    "artist": "Linkin Park",
    "filename": "Two.Faced.Official.Music.Video.-.Linkin.Park.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Ula.Hamsi.Tuttum.Seni.Hamsi.Stayla.mp3",
    "title": "Ula Hamsi Tuttum Seni",
    "artist": "Hüseyin Erbaş",
    "filename": "Ula.Hamsi.Tuttum.Seni.Hamsi.Stayla.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/When.They.Come.For.Me.-.Linkin.Park.A.Thousands.Suns.mp3",
    "title": "When They Come For Me",
    "artist": "Linkin Park",
    "filename": "When.They.Come.For.Me.-.Linkin.Park.A.Thousands.Suns.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Whisky.Cola.Tequila.-.Slowed.mp3",
    "title": "Whisky Cola Tequila (Slowed)",
    "artist": "Mapikkunn",
    "filename": "Whisky.Cola.Tequila.-.Slowed.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Willy.William.-.Ego.Clip.Officiel.mp3",
    "title": "Ego",
    "artist": "Willy William",
    "filename": "Willy.William.-.Ego.Clip.Officiel.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/With.You.-.Linkin.Park.Hybrid.Theory.mp3",
    "title": "With You",
    "artist": "Linkin Park",
    "filename": "With.You.-.Linkin.Park.Hybrid.Theory.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Wretches.And.Kings.-.Linkin.Park.A.Thousands.Suns.mp3",
    "title": "Wretches And Kings",
    "artist": "Linkin Park",
    "filename": "Wretches.And.Kings.-.Linkin.Park.A.Thousands.Suns.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/X.Remix.-.Nicky.Jam.x.J.Balvin.x.Ozuna.x.Maluma.mp3",
    "title": "X (Remix)",
    "artist": "Nicky Jam, J Balvin, Ozuna, Maluma",
    "filename": "X.Remix.-.Nicky.Jam.x.J.Balvin.x.Ozuna.x.Maluma.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/X-Ecutioners.feat.Mike.Shinoda.Mr.Hahn.-.It.s.Goin.Down.Official.Music.Video.mp3",
    "title": "It's Goin' Down",
    "artist": "X-Ecutioners ft. Mike Shinoda & Mr. Hahn",
    "filename": "X-Ecutioners.feat.Mike.Shinoda.Mr.Hahn.-.It.s.Goin.Down.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/15.Ceddin.Deden.ITTMT.Mehter.Birimi.Album.mp3",
    "title": "Ceddin Deden (ITTMT)",
    "artist": "Mehter Birimi",
    "filename": "15.Ceddin.Deden.ITTMT.Mehter.Birimi.Album.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Ajda.Pekkan.-.Super.Star.4.-.87.Remastered.Full.Album.mp3",
    "title": "Super Star",
    "artist": "Ajda Pekkan",
    "filename": "Ajda.Pekkan.-.Super.Star.4.-.87.Remastered.Full.Album.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Alan.Walker.Sabrina.Carpenter.Farruko.-.On.My.Way.mp3",
    "title": "On My Way",
    "artist": "Alan Walker, Sabrina Carpenter, Farruko",
    "filename": "Alan.Walker.Sabrina.Carpenter.Farruko.-.On.My.Way.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Ankarali.Namik.-.Oglumun.Tabancasi.mp3",
    "title": "Oğlumun Tabancası",
    "artist": "Ankara'lı Namık",
    "filename": "Ankarali.Namik.-.Oglumun.Tabancasi.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/BAD.NOVA.-.Hala.Madrid.2025.EDITION.Lyrics.Video.mp3",
    "title": "Hala Madrid 2025",
    "artist": "BAD NOVA",
    "filename": "BAD.NOVA.-.Hala.Madrid.2025.EDITION.Lyrics.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Besiktas.Taraftar.Korosu.-.Yagmurlu.Bir.Gunde.Official.Audio.mp3",
    "title": "Yağmurlu Bir Günde",
    "artist": "Beşiktaş Taraftar Korosu",
    "filename": "Besiktas.Taraftar.Korosu.-.Yagmurlu.Bir.Gunde.Official.Audio.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Blackout.-.Linkin.Park.A.Thousands.Suns.mp3",
    "title": "Blackout",
    "artist": "Linkin Park",
    "filename": "Blackout.-.Linkin.Park.A.Thousands.Suns.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Bleed.It.Out.Official.Music.Video.4K.Upgrade.-.Linkin.Park.mp3",
    "title": "Bleed It Out",
    "artist": "Linkin Park",
    "filename": "Bleed.It.Out.Official.Music.Video.4K.Upgrade.-.Linkin.Park.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Bloc.Party.feat.Mike.Shinoda.Tak.mp3",
    "title": "Tak",
    "artist": "Bloc Party ft. Mike Shinoda",
    "filename": "Bloc.Party.feat.Mike.Shinoda.Tak.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/BOUNTYHUNTER.-.WOOPS.TECHNO.mp3",
    "title": "WOOPS TECHNO",
    "artist": "BOUNTYHUNTER",
    "filename": "BOUNTYHUNTER.-.WOOPS.TECHNO.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Breaking.the.Habit.Official.Music.Video.HD.UPGRADE.Linkin.Park.mp3",
    "title": "Breaking the Habit",
    "artist": "Linkin Park",
    "filename": "Breaking.the.Habit.Official.Music.Video.HD.UPGRADE.Linkin.Park.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/BURN.IT.DOWN.Official.Music.Video.4K.Upgrade.-.Linkin.Park.mp3",
    "title": "Burn It Down",
    "artist": "Linkin Park",
    "filename": "BURN.IT.DOWN.Official.Music.Video.4K.Upgrade.-.Linkin.Park.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/By.Myself.-.Linkin.Park.Hybrid.Theory.mp3",
    "title": "By Myself",
    "artist": "Linkin Park",
    "filename": "By.Myself.-.Linkin.Park.Hybrid.Theory.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Glass.Animals.-.Heat.Waves.Official.Video.mp3",
    "title": "Heat Waves (Official Video)",
    "artist": "Glass Animals",
    "filename": "Glass.Animals.-.Heat.Waves.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/MX.mp3",
    "title": "MX (Full)",
    "artist": "Deftones",
    "filename": "MX.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Scriptonite_Polozhenie.mp3",
    "title": "Положение",
    "artist": "Scriptonite",
    "filename": "Scriptonite_Polozhenie.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Yandi.Gonlum.mp3",
    "title": "Yandı Gönlüm",
    "artist": "bilinmiyor",
    "filename": "Yandi.Gonlum.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/ABBA.-.Dancing.Queen.Official.Music.Video.mp3",
    "title": "Dancing Queen",
    "artist": "ABBA",
    "filename": "ABBA.-.Dancing.Queen.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/AC.DC.-.Thunderstruck.Official.Video.mp3",
    "title": "Thunderstruck",
    "artist": "AC/DC",
    "filename": "AC.DC.-.Thunderstruck.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Adele.-.Hello.Official.Music.Video.mp3",
    "title": "Hello",
    "artist": "Adele",
    "filename": "Adele.-.Hello.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Adele.-.Rolling.in.the.Deep.Official.Music.Video.mp3",
    "title": "Rolling in the Deep",
    "artist": "Adele",
    "filename": "Adele.-.Rolling.in.the.Deep.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Adele.-.Someone.Like.You.Official.Music.Video.mp3",
    "title": "Someone Like You",
    "artist": "Adele",
    "filename": "Adele.-.Someone.Like.You.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Alan.Walker.-.Alone.mp3",
    "title": "Alone",
    "artist": "Alan Walker",
    "filename": "Alan.Walker.-.Alone.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Alan.Walker.-.Darkside.feat.Au.Ra.and.Tomine.Harket.mp3",
    "title": "Darkside",
    "artist": "Alan Walker ft. Au/Ra & Tomine Harket",
    "filename": "Alan.Walker.-.Darkside.feat.Au.Ra.and.Tomine.Harket.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Aleyna.Tilki.-.Ayri.Gitme.mp3",
    "title": "Ayrı Gitme",
    "artist": "Aleyna Tilki",
    "filename": "Aleyna.Tilki.-.Ayri.Gitme.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Alisirim.Gozlerimi.Kapamaya.mp3",
    "title": "Alışırım Gözlerimi Kapamaya",
    "artist": "Sezen Aksu",
    "filename": "Alisirim.Gozlerimi.Kapamaya.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Allame.-.Omur.Official.Video.Clip.mp3",
    "title": "Ömür",
    "artist": "Allame",
    "filename": "Allame.-.Omur.Official.Video.Clip.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Arctic.Monkeys.-.Do.I.Wanna.Know.Official.Video.mp3",
    "title": "Do I Wanna Know?",
    "artist": "Arctic Monkeys",
    "filename": "Arctic.Monkeys.-.Do.I.Wanna.Know.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Arctic.Monkeys.-.R.U.Mine.Official.Video.mp3",
    "title": "R U Mine?",
    "artist": "Arctic Monkeys",
    "filename": "Arctic.Monkeys.-.R.U.Mine.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Ariana.Grande.-.7.rings.Official.Video.mp3",
    "title": "7 rings",
    "artist": "Ariana Grande",
    "filename": "Ariana.Grande.-.7.rings.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Ariana.Grande.-.no.tears.left.to.cry.Official.Video.mp3",
    "title": "no tears left to cry",
    "artist": "Ariana Grande",
    "filename": "Ariana.Grande.-.no.tears.left.to.cry.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Ariana.Grande.-.thank.u.next.Official.Video.mp3",
    "title": "thank u, next",
    "artist": "Ariana Grande",
    "filename": "Ariana.Grande.-.thank.u.next.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Avicii.-.Hey.Brother.mp3",
    "title": "Hey Brother",
    "artist": "Avicii",
    "filename": "Avicii.-.Hey.Brother.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Avicii.-.Levels.mp3",
    "title": "Levels",
    "artist": "Avicii",
    "filename": "Avicii.-.Levels.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Batesmotelpro.-.Buz.Gibi.Biraderler.mp3",
    "title": "Buz Gibi Biraderler",
    "artist": "Batesmotelpro",
    "filename": "Batesmotelpro.-.Buz.Gibi.Biraderler.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Ben.Bunu.Hak.Etmedim.Sila.Ismail.Kacan.mp3",
    "title": "Ben Bunu Hak Etmedim",
    "artist": "Sıla & İsmail Kaçan",
    "filename": "Ben.Bunu.Hak.Etmedim.Sila.Ismail.Kacan.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Ben.Fero.-.Mahallemiz.Esmer.Official.Video.mp3",
    "title": "Mahallemiz Esmer",
    "artist": "Ben Fero",
    "filename": "Ben.Fero.-.Mahallemiz.Esmer.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Benim.Stilim.mp3",
    "title": "Benim Stilim",
    "artist": "Kolera",
    "filename": "Benim.Stilim.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Beyonce.-.Crazy.In.Love.ft.JAY.Z.mp3",
    "title": "Crazy in Love",
    "artist": "Beyoncé ft. JAY-Z",
    "filename": "Beyonce.-.Crazy.In.Love.ft.JAY.Z.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Beyonce.-.Halo.mp3",
    "title": "Halo",
    "artist": "Beyoncé",
    "filename": "Beyonce.-.Halo.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Bir_Baskedir.mp3",
    "title": "Bir Başkedir",
    "artist": "Yıldız Tilbe",
    "filename": "Bir_Baskedir.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Bon.Jovi.-.Livin.On.A.Prayer.mp3",
    "title": "Livin' On a Prayer",
    "artist": "Bon Jovi",
    "filename": "Bon.Jovi.-.Livin.On.A.Prayer.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Bruno.Mars.-.Locked.Out.Of.Heaven.Official.Music.Video.mp3",
    "title": "Locked Out of Heaven",
    "artist": "Bruno Mars",
    "filename": "Bruno.Mars.-.Locked.Out.Of.Heaven.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Bruno.Mars.-.That.s.What.I.Like.Official.Music.Video.mp3",
    "title": "That's What I Like",
    "artist": "Bruno Mars",
    "filename": "Bruno.Mars.-.That.s.What.I.Like.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Buyuk.Dusler.mp3",
    "title": "Büyük Düşler",
    "artist": "Manuş Baba",
    "filename": "Buyuk.Dusler.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Calvin.Harris.Dua.Lipa.-.One.Kiss.Official.Video.mp3",
    "title": "One Kiss",
    "artist": "Calvin Harris & Dua Lipa",
    "filename": "Calvin.Harris.Dua.Lipa.-.One.Kiss.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Calvin.Harris.Rihanna.-.This.Is.What.You.Came.For.Official.Video.mp3",
    "title": "This Is What You Came For",
    "artist": "Calvin Harris ft. Rihanna",
    "filename": "Calvin.Harris.Rihanna.-.This.Is.What.You.Came.For.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Cardi.B.-.Bodak.Yellow.OFFICIAL.MUSIC.VIDEO.mp3",
    "title": "Bodak Yellow",
    "artist": "Cardi B",
    "filename": "Cardi.B.-.Bodak.Yellow.OFFICIAL.MUSIC.VIDEO.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Ceddin.Deden.mp3",
    "title": "Ceddin Deden",
    "artist": "Mehter Marşı",
    "filename": "Ceddin.Deden.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Cem.Yildiz.-.Dar-i.Dunya.Official.Video.mp3",
    "title": "Dar-ı Dünya",
    "artist": "Cem Yıldız",
    "filename": "Cem.Yildiz.-.Dar-i.Dunya.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Ceza.-.Yerli.Plaka.Official.Video.Yuksek.Kalite.mp3",
    "title": "Yerli Plaka",
    "artist": "Ceza",
    "filename": "Ceza.-.Yerli.Plaka.Official.Video.Yuksek.Kalite.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Chris.Brown.-.With.You.Official.HD.Video.mp3",
    "title": "With You",
    "artist": "Chris Brown",
    "filename": "Chris.Brown.-.With.You.Official.HD.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Coldplay.-.A.Sky.Full.Of.Stars.Official.Video.mp3",
    "title": "A Sky Full of Stars",
    "artist": "Coldplay",
    "filename": "Coldplay.-.A.Sky.Full.Of.Stars.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Coldplay.-.The.Scientist.Official.4K.Video.mp3",
    "title": "The Scientist",
    "artist": "Coldplay",
    "filename": "Coldplay.-.The.Scientist.Official.4K.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Coldplay.-.Yellow.Official.Video.mp3",
    "title": "Yellow",
    "artist": "Coldplay",
    "filename": "Coldplay.-.Yellow.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Daft.Punk.-.Get.Lucky.Official.Video.feat.Pharrell.Williams.and.Nile.Rodgers.mp3",
    "title": "Get Lucky",
    "artist": "Daft Punk ft. Pharrell Williams & Nile Rodgers",
    "filename": "Daft.Punk.-.Get.Lucky.Official.Video.feat.Pharrell.Williams.and.Nile.Rodgers.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Daft.Punk.-.Harder.Better.Faster.Stronger.Official.Video.mp3",
    "title": "Harder, Better, Faster, Stronger",
    "artist": "Daft Punk",
    "filename": "Daft.Punk.-.Harder.Better.Faster.Stronger.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/David.Guetta.-.Titanium.ft.Sia.Official.Video.mp3",
    "title": "Titanium",
    "artist": "David Guetta ft. Sia",
    "filename": "David.Guetta.-.Titanium.ft.Sia.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/David.Guetta.-.Without.You.ft.Usher.Official.Video.mp3",
    "title": "Without You",
    "artist": "David Guetta ft. Usher",
    "filename": "David.Guetta.-.Without.You.ft.Usher.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Deeperise.Jabbar.-.Gecmis.Degismez.mp3",
    "title": "Geçmiş Değişmez",
    "artist": "Deeperise & Jabbar",
    "filename": "Deeperise.Jabbar.-.Gecmis.Degismez.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Drake.-.God.s.Plan.mp3",
    "title": "God's Plan",
    "artist": "Drake",
    "filename": "Drake.-.God.s.Plan.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Drake.-.Hotline.Bling.mp3",
    "title": "Hotline Bling",
    "artist": "Drake",
    "filename": "Drake.-.Hotline.Bling.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Drake.-.In.My.Feelings.mp3",
    "title": "In My Feelings",
    "artist": "Drake",
    "filename": "Drake.-.In.My.Feelings.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Dua.Lipa.-.Don.t.Start.Now.Official.Music.Video.mp3",
    "title": "Don't Start Now",
    "artist": "Dua Lipa",
    "filename": "Dua.Lipa.-.Don.t.Start.Now.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Dua.Lipa.-.New.Rules.Official.Music.Video.mp3",
    "title": "New Rules",
    "artist": "Dua Lipa",
    "filename": "Dua.Lipa.-.New.Rules.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Dua.Lipa.-.Physical.Official.Video.mp3",
    "title": "Physical",
    "artist": "Dua Lipa",
    "filename": "Dua.Lipa.-.Physical.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Dunya.yok.oluyor.mp3",
    "title": "Dünya Yok Oluyor",
    "artist": "Sıla",
    "filename": "Dunya.yok.oluyor.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/EARFQUAKE.mp3",
    "title": "EARFQUAKE",
    "artist": "Tyler, the Creator",
    "filename": "EARFQUAKE.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Ed.Sheeran.-.Bad.Habits.Official.Video.mp3",
    "title": "Bad Habits",
    "artist": "Ed Sheeran",
    "filename": "Ed.Sheeran.-.Bad.Habits.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Ed.Sheeran.-.Perfect.Official.Music.Video.mp3",
    "title": "Perfect",
    "artist": "Ed Sheeran",
    "filename": "Ed.Sheeran.-.Perfect.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Ed.Sheeran.-.Thinking.Out.Loud.Official.Music.Video.mp3",
    "title": "Thinking Out Loud",
    "artist": "Ed Sheeran",
    "filename": "Ed.Sheeran.-.Thinking.Out.Loud.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Eminem.-.Lose.Yourself.mp3",
    "title": "Lose Yourself",
    "artist": "Eminem",
    "filename": "Eminem.-.Lose.Yourself.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Eminem.-.Not.Afraid.mp3",
    "title": "Not Afraid",
    "artist": "Eminem",
    "filename": "Eminem.-.Not.Afraid.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Eminem.-.Rap.God.Explicit.mp3",
    "title": "Rap God",
    "artist": "Eminem",
    "filename": "Eminem.-.Rap.God.Explicit.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Ezhel.-.Dum.Dum.mp3",
    "title": "Dum Dum",
    "artist": "Ezhel",
    "filename": "Ezhel.-.Dum.Dum.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Fall.Out.Boy.-.Sugar.We.re.Goin.Down.Official.Music.Video.mp3",
    "title": "Sugar, We're Goin Down",
    "artist": "Fall Out Boy",
    "filename": "Fall.Out.Boy.-.Sugar.We.re.Goin.Down.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Faruk.Sabanci.Norm.Ender.-.Bulamazdin.mp3",
    "title": "Bulamazdın",
    "artist": "Faruk Şabancı & Norm Ender",
    "filename": "Faruk.Sabanci.Norm.Ender.-.Bulamazdin.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Foo.Fighters.-.Best.Of.You.Official.HD.Video.mp3",
    "title": "Best of You",
    "artist": "Foo Fighters",
    "filename": "Foo.Fighters.-.Best.Of.You.Official.HD.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Foo.Fighters.-.Everlong.Official.HD.Video.mp3",
    "title": "Everlong",
    "artist": "Foo Fighters",
    "filename": "Foo.Fighters.-.Everlong.Official.HD.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Gize.Ali.Metin.Arsiz.Bela.-.Sende.Unutulurmussun.Prod.Berkay.Candir.mp3",
    "title": "Sende Unutulurmuşsun",
    "artist": "Gize Ali Metin & Arsız Bela",
    "filename": "Gize.Ali.Metin.Arsiz.Bela.-.Sende.Unutulurmussun.Prod.Berkay.Candir.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Green.Day.-.American.Idiot.Official.Music.Video.4K.Upgrade.mp3",
    "title": "American Idiot",
    "artist": "Green Day",
    "filename": "Green.Day.-.American.Idiot.Official.Music.Video.4K.Upgrade.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Green.Day.-.Boulevard.Of.Broken.Dreams.Official.Music.Video.4K.Upgrade.mp3",
    "title": "Boulevard of Broken Dreams",
    "artist": "Green Day",
    "filename": "Green.Day.-.Boulevard.Of.Broken.Dreams.Official.Music.Video.4K.Upgrade.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Gripin.-.Boyle.Kahpedir.Dunya.mp3",
    "title": "Böyle Kahpedir Dünya",
    "artist": "Gripin",
    "filename": "Gripin.-.Boyle.Kahpedir.Dunya.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Gulsen.-.En.Sevdigim.Yanlisim.mp3",
    "title": "En Sevdiğim Yanlışım",
    "artist": "Gülşen",
    "filename": "Gulsen.-.En.Sevdigim.Yanlisim.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Guns.N.Roses.-.Sweet.Child.O.Mine.Official.Music.Video.mp3",
    "title": "Sweet Child O' Mine",
    "artist": "Guns N' Roses",
    "filename": "Guns.N.Roses.-.Sweet.Child.O.Mine.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/H.E.R.-.Focus.Official.Video.mp3",
    "title": "Focus",
    "artist": "H.E.R.",
    "filename": "H.E.R.-.Focus.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Hadise.feat.Raw.Jawz.-.Sweat.mp3",
    "title": "Sweat",
    "artist": "Hadise ft. Raw Jawz",
    "filename": "Hadise.feat.Raw.Jawz.-.Sweat.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Hayko.Cepkin.-.Yarasi.Sakli.mp3",
    "title": "Yarası Saklı",
    "artist": "Hayko Cepkin",
    "filename": "Hayko.Cepkin.-.Yarasi.Sakli.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Imagine.Dragons.-.Natural.mp3",
    "title": "Natural",
    "artist": "Imagine Dragons",
    "filename": "Imagine.Dragons.-.Natural.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Imagine.Dragons.-.Radioactive.mp3",
    "title": "Radioactive",
    "artist": "Imagine Dragons",
    "filename": "Imagine.Dragons.-.Radioactive.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Imagine.Dragons.-.Thunder.mp3",
    "title": "Thunder",
    "artist": "Imagine Dragons",
    "filename": "Imagine.Dragons.-.Thunder.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/John.Legend.-.All.of.Me.Official.Video.mp3",
    "title": "All of Me",
    "artist": "John Legend",
    "filename": "John.Legend.-.All.of.Me.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Juice.WRLD.-.Lucid.Dreams.Official.Music.Video.mp3",
    "title": "Lucid Dreams",
    "artist": "Juice WRLD",
    "filename": "Juice.WRLD.-.Lucid.Dreams.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Justin.Bieber.-.Love.Yourself.PURPOSE.The.Movement.mp3",
    "title": "Love Yourself",
    "artist": "Justin Bieber",
    "filename": "Justin.Bieber.-.Love.Yourself.PURPOSE.The.Movement.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Justin.Bieber.-.Peaches.ft.Daniel.Caesar.Giveon.mp3",
    "title": "Peaches",
    "artist": "Justin Bieber ft. Daniel Caesar & Giveon",
    "filename": "Justin.Bieber.-.Peaches.ft.Daniel.Caesar.Giveon.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Justin.Bieber.-.Sorry.PURPOSE.The.Movement.mp3",
    "title": "Sorry",
    "artist": "Justin Bieber",
    "filename": "Justin.Bieber.-.Sorry.PURPOSE.The.Movement.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Katliam.3.OFFICIAL.VIDEO.prod.by.Buaka.mp3",
    "title": "Katliam 3",
    "artist": "Murda & Ezhel",
    "filename": "Katliam.3.OFFICIAL.VIDEO.prod.by.Buaka.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Kendrick.Lamar.-.DNA.mp3",
    "title": "DNA.",
    "artist": "Kendrick Lamar",
    "filename": "Kendrick.Lamar.-.DNA.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Kendrick.Lamar.-.Swimming.Pools.Drank.mp3",
    "title": "Swimming Pools (Drank)",
    "artist": "Kendrick Lamar",
    "filename": "Kendrick.Lamar.-.Swimming.Pools.Drank.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Kygo.-.Firestone.ft.Conrad.Sewell.Official.Video.mp3",
    "title": "Firestone",
    "artist": "Kygo ft. Conrad Sewell",
    "filename": "Kygo.-.Firestone.ft.Conrad.Sewell.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Kygo.Selena.Gomez.-.It.Ain.t.Me.Official.Video.mp3",
    "title": "It Ain't Me",
    "artist": "Kygo & Selena Gomez",
    "filename": "Kygo.Selena.Gomez.-.It.Ain.t.Me.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/LVBEL.C5.-.dubaiiiiii.mp3",
    "title": "dubaiiiiii",
    "artist": "Lvbel C5",
    "filename": "LVBEL.C5.-.dubaiiiiii.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Mabel.Matiz.-.Hala.Haber.Bekliyorum.Senden.Mabel.s.Version.mp3",
    "title": "Hala Haber Bekliyorum Senden",
    "artist": "Mabel Matiz",
    "filename": "Mabel.Matiz.-.Hala.Haber.Bekliyorum.Senden.Mabel.s.Version.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Marshmello.-.Alone.Official.Music.Video.mp3",
    "title": "Alone",
    "artist": "Marshmello",
    "filename": "Marshmello.-.Alone.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Martin.Garrix.-.Animals.Official.Video.mp3",
    "title": "Animals",
    "artist": "Martin Garrix",
    "filename": "Martin.Garrix.-.Animals.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Martin.Garrix.Bebe.Rexha.-.In.The.Name.Of.Love.Official.Video.mp3",
    "title": "In the Name of Love",
    "artist": "Martin Garrix & Bebe Rexha",
    "filename": "Martin.Garrix.Bebe.Rexha.-.In.The.Name.Of.Love.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Metallica.Enter.Sandman.Official.Music.Video.mp3",
    "title": "Enter Sandman",
    "artist": "Metallica",
    "filename": "Metallica.Enter.Sandman.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Michael.Jackson.-.Billie.Jean.Official.Video.mp3",
    "title": "Billie Jean",
    "artist": "Michael Jackson",
    "filename": "Michael.Jackson.-.Billie.Jean.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Michael.Jackson.-.Thriller.Official.4K.Video.mp3",
    "title": "Thriller",
    "artist": "Michael Jackson",
    "filename": "Michael.Jackson.-.Thriller.Official.4K.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Model.-.Degmesin.Ellerimiz.mp3",
    "title": "Değmesin Ellerimiz",
    "artist": "Model",
    "filename": "Model.-.Degmesin.Ellerimiz.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Muse.-.Supermassive.Black.Hole.Official.Music.Video.mp3",
    "title": "Supermassive Black Hole",
    "artist": "Muse",
    "filename": "Muse.-.Supermassive.Black.Hole.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/My.Chemical.Romance.-.Welcome.To.The.Black.Parade.Official.Music.Video.HD.mp3",
    "title": "Welcome to the Black Parade",
    "artist": "My Chemical Romance",
    "filename": "My.Chemical.Romance.-.Welcome.To.The.Black.Parade.Official.Music.Video.HD.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Neler_Oluyor.mp3",
    "title": "Neler Oluyor",
    "artist": "Sıla",
    "filename": "Neler_Oluyor.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Nicki.Minaj.-.Super.Bass.Official.Video.mp3",
    "title": "Super Bass",
    "artist": "Nicki Minaj",
    "filename": "Nicki.Minaj.-.Super.Bass.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Nirvana.-.Come.As.You.Are.Official.Music.Video.mp3",
    "title": "Come as You Are",
    "artist": "Nirvana",
    "filename": "Nirvana.-.Come.As.You.Are.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Nirvana.-.Smells.Like.Teen.Spirit.Official.Music.Video.mp3",
    "title": "Smells Like Teen Spirit",
    "artist": "Nirvana",
    "filename": "Nirvana.-.Smells.Like.Teen.Spirit.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Panic.At.The.Disco.-.High.Hopes.Official.Video.mp3",
    "title": "High Hopes",
    "artist": "Panic! At The Disco",
    "filename": "Panic.At.The.Disco.-.High.Hopes.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Post.Malone.-.Circles.mp3",
    "title": "Circles",
    "artist": "Post Malone",
    "filename": "Post.Malone.-.Circles.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Red.Hot.Chili.Peppers.-.Californication.Official.Music.Video.HD.UPGRADE.mp3",
    "title": "Californication",
    "artist": "Red Hot Chili Peppers",
    "filename": "Red.Hot.Chili.Peppers.-.Californication.Official.Music.Video.HD.UPGRADE.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Red.Hot.Chili.Peppers.-.Under.The.Bridge.Official.Music.Video.mp3",
    "title": "Under the Bridge",
    "artist": "Red Hot Chili Peppers",
    "filename": "Red.Hot.Chili.Peppers.-.Under.The.Bridge.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Reynmen.-.Ela.Official.Video.mp3",
    "title": "Ela",
    "artist": "Reynmen",
    "filename": "Reynmen.-.Ela.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Rihanna.-.Diamonds.mp3",
    "title": "Diamonds",
    "artist": "Rihanna",
    "filename": "Rihanna.-.Diamonds.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Rihanna.-.We.Found.Love.ft.Calvin.Harris.mp3",
    "title": "We Found Love",
    "artist": "Rihanna ft. Calvin Harris",
    "filename": "Rihanna.-.We.Found.Love.ft.Calvin.Harris.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Roddy.Ricch.-.The.Box.Official.Music.Video.mp3",
    "title": "The Box",
    "artist": "Roddy Ricch",
    "filename": "Roddy.Ricch.-.The.Box.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Sam.Smith.-.Stay.With.Me.Official.Music.Video.mp3",
    "title": "Stay With Me",
    "artist": "Sam Smith",
    "filename": "Sam.Smith.-.Stay.With.Me.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Sam.Smith.-.Writing.s.On.The.Wall.from.Spectre.Official.Music.Video.mp3",
    "title": "Writing's on the Wall",
    "artist": "Sam Smith",
    "filename": "Sam.Smith.-.Writing.s.On.The.Wall.from.Spectre.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Satisfaction.Guaracha.2022.@Alcyone.-.Aleteo.Zapateo.Tribal.House.Guaracha.Nati...mp3",
    "title": "Satisfaction (Guaracha)",
    "artist": "Alcyone",
    "filename": "Satisfaction.Guaracha.2022.@Alcyone.-.Aleteo.Zapateo.Tribal.House.Guaracha.Nati...mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Sebnem.Ferah.-.Cakil.Taslari.Official.Video.mp3",
    "title": "Çakıl Taşları",
    "artist": "Şebnem Ferah",
    "filename": "Sebnem.Ferah.-.Cakil.Taslari.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Sebnem.Ferah.-.Mayin.Tarlasi.10.Mart.2007.Istanbul.Konseri.mp3",
    "title": "Mayın Tarlası (İstanbul Konseri)",
    "artist": "Şebnem Ferah",
    "filename": "Sebnem.Ferah.-.Mayin.Tarlasi.10.Mart.2007.Istanbul.Konseri.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Semicenk.Rast.-.Canin.Sag.Olsun.prod.by.Buken.mp3",
    "title": "Canın Sağ Olsun",
    "artist": "Semicenk & Rast",
    "filename": "Semicenk.Rast.-.Canin.Sag.Olsun.prod.by.Buken.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Sezen.Aksu.-.Geri.Don.Official.Video.mp3",
    "title": "Geri Dön",
    "artist": "Sezen Aksu",
    "filename": "Sezen.Aksu.-.Geri.Don.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Sezen.Aksu.-.Hadi.Bakalim.Official.Video.mp3",
    "title": "Hadi Bakalım",
    "artist": "Sezen Aksu",
    "filename": "Sezen.Aksu.-.Hadi.Bakalim.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Survivor.-.Eye.Of.The.Tiger.Official.HD.Video.mp3",
    "title": "Eye of the Tiger",
    "artist": "Survivor",
    "filename": "Survivor.-.Eye.Of.The.Tiger.Official.HD.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/TARKAN.-.Kuzu.Kuzu.Official.Music.Video.mp3",
    "title": "Kuzu Kuzu",
    "artist": "Tarkan",
    "filename": "TARKAN.-.Kuzu.Kuzu.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/TARKAN.-.Simarik.Official.Music.Video.mp3",
    "title": "Şımarık",
    "artist": "Tarkan",
    "filename": "TARKAN.-.Simarik.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Taylor.Swift.-.Bad.Blood.ft.Kendrick.Lamar.mp3",
    "title": "Bad Blood",
    "artist": "Taylor Swift ft. Kendrick Lamar",
    "filename": "Taylor.Swift.-.Bad.Blood.ft.Kendrick.Lamar.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Taylor.Swift.-.Blank.Space.mp3",
    "title": "Blank Space",
    "artist": "Taylor Swift",
    "filename": "Taylor.Swift.-.Blank.Space.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Taylor.Swift.-.Shake.It.Off.mp3",
    "title": "Shake It Off",
    "artist": "Taylor Swift",
    "filename": "Taylor.Swift.-.Shake.It.Off.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Teoman.in.Yaklasik.30.Manken.Esliginde.Cektigi.Yeni.Klip.-.DiviksFilm.Com.mp3",
    "title": "Ben Sana Vurgunum",
    "artist": "Teoman",
    "filename": "Teoman.in.Yaklasik.30.Manken.Esliginde.Cektigi.Yeni.Klip.-.DiviksFilm.Com.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/The.Chainsmokers.-.Closer.Official.Video.ft.Halsey.mp3",
    "title": "Closer",
    "artist": "The Chainsmokers ft. Halsey",
    "filename": "The.Chainsmokers.-.Closer.Official.Video.ft.Halsey.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/The.Chainsmokers.Coldplay.-.Something.Just.Like.This.Official.Lyric.Video.mp3",
    "title": "Something Just Like This",
    "artist": "The Chainsmokers & Coldplay",
    "filename": "The.Chainsmokers.Coldplay.-.Something.Just.Like.This.Official.Lyric.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/The.Weeknd.-.Can.t.Feel.My.Face.Official.Video.mp3",
    "title": "Can't Feel My Face",
    "artist": "The Weeknd",
    "filename": "The.Weeknd.-.Can.t.Feel.My.Face.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/The.Weeknd.-.Save.Your.Tears.Official.Music.Video.mp3",
    "title": "Save Your Tears",
    "artist": "The Weeknd",
    "filename": "The.Weeknd.-.Save.Your.Tears.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/The.Weeknd.-.Starboy.ft.Daft.Punk.Official.Video.ft.Daft.Punk.mp3",
    "title": "Starboy",
    "artist": "The Weeknd ft. Daft Punk",
    "filename": "The.Weeknd.-.Starboy.ft.Daft.Punk.Official.Video.ft.Daft.Punk.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Three.Days.Grace.-.I.Hate.Everything.About.You.Official.Video.mp3",
    "title": "I Hate Everything About You",
    "artist": "Three Days Grace",
    "filename": "Three.Days.Grace.-.I.Hate.Everything.About.You.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Tiesto.-.The.Business.Official.Music.Video.mp3",
    "title": "The Business",
    "artist": "Tiësto",
    "filename": "Tiesto.-.The.Business.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Toto.-.Africa.Official.HD.Video.mp3",
    "title": "Africa",
    "artist": "Toto",
    "filename": "Toto.-.Africa.Official.HD.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Tugkan.-.Gitmelisin.Official.Lyric.Video.mp3",
    "title": "Gitmelisin",
    "artist": "Tuğkan",
    "filename": "Tugkan.-.Gitmelisin.Official.Lyric.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Usher.-.Yeah.Official.Video.ft.Lil.Jon.Ludacris.mp3",
    "title": "Yeah!",
    "artist": "Usher ft. Lil Jon & Ludacris",
    "filename": "Usher.-.Yeah.Official.Video.ft.Lil.Jon.Ludacris.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/XXXTENTACION.-.MOONLIGHT.OFFICIAL.MUSIC.VIDEO.mp3",
    "title": "Moonlight",
    "artist": "XXXTENTACION",
    "filename": "XXXTENTACION.-.MOONLIGHT.OFFICIAL.MUSIC.VIDEO.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/XXXTENTACION.-.SAD.Official.Music.Video.mp3",
    "title": "SAD!",
    "artist": "XXXTENTACION",
    "filename": "XXXTENTACION.-.SAD.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Yalin.-.Ask.Ne.Demek.Official.Audio.mp3",
    "title": "Aşk Ne Demek",
    "artist": "Yalın",
    "filename": "Yalin.-.Ask.Ne.Demek.Official.Audio.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Yalin.-.Ben.Bilmem.Official.Video.mp3",
    "title": "Ben Bilmem",
    "artist": "Yalın",
    "filename": "Yalin.-.Ben.Bilmem.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Yalin.-.Gunaydin.Official.Video.mp3",
    "title": "Günaydın",
    "artist": "Yalın",
    "filename": "Yalin.-.Gunaydin.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Yalin.-.Her.Sey.Sensin.Official.Video.mp3",
    "title": "Her Şey Sensin",
    "artist": "Yalın",
    "filename": "Yalin.-.Her.Sey.Sensin.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Yalin.-.Ki.Sen.Official.Video.mp3",
    "title": "Ki Sen",
    "artist": "Yalın",
    "filename": "Yalin.-.Ki.Sen.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Yalin.-.Kucucugum.Official.Video.mp3",
    "title": "Küçücüğüm",
    "artist": "Yalın",
    "filename": "Yalin.-.Kucucugum.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Yalin.-.Sesinde.Ask.Var.Official.Video.mp3",
    "title": "Sesinde Aşk Var",
    "artist": "Yalın",
    "filename": "Yalin.-.Sesinde.Ask.Var.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Yalin.-.Sonsuz.Ol.Official.Video.mp3",
    "title": "Sonsuz Ol",
    "artist": "Yalın",
    "filename": "Yalin.-.Sonsuz.Ol.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Yalin.-.Zalim.Official.Video.mp3",
    "title": "Zalim",
    "artist": "Yalın",
    "filename": "Yalin.-.Zalim.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Zedd.-.Beautiful.Now.ft.Jon.Bellion.Official.Music.Video.mp3",
    "title": "Beautiful Now",
    "artist": "Zedd ft. Jon Bellion",
    "filename": "Zedd.-.Beautiful.Now.ft.Jon.Bellion.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/Zedd.Maren.Morris.Grey.-.The.Middle.Official.Music.Video.mp3",
    "title": "The Middle",
    "artist": "Zedd, Maren Morris, Grey",
    "filename": "Zedd.Maren.Morris.Grey.-.The.Middle.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/mor.ve.otesi.-.Cambaz.Official.Video.mp3",
    "title": "Cambaz",
    "artist": "Mor ve Ötesi",
    "filename": "mor.ve.otesi.-.Cambaz.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/twenty.one.pilots.Heathens.from.Suicide.Squad.The.Album.OFFICIAL.VIDEO.mp3",
    "title": "Heathens",
    "artist": "twenty one pilots",
    "filename": "twenty.one.pilots.Heathens.from.Suicide.Squad.The.Album.OFFICIAL.VIDEO.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/twenty.one.pilots.Stressed.Out.OFFICIAL.VIDEO.mp3",
    "title": "Stressed Out",
    "artist": "twenty one pilots",
    "filename": "twenty.one.pilots.Stressed.Out.OFFICIAL.VIDEO.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music2/releases/download/v1.0/Hadise.feat.Raw.Jawz.-.Sweat.mp3",
    "title": "Sweat",
    "artist": "Ayfer-5",
    "filename": "Hadise.feat.Raw.Jawz.-.Sweat.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music2/releases/download/v1.0/Hayko.Cepkin.-.Paranoya.mp3",
    "title": "Paranoya",
    "artist": "Hayko Cepkin",
    "filename": "Hayko.Cepkin.-.Paranoya.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music2/releases/download/v1.0/Lil.Baby.x.Gunna.-.Drip.Too.Hard.Official.Music.Video.mp3",
    "title": "Drip Too Hard",
    "artist": "Lil Baby Official",
    "filename": "Lil.Baby.x.Gunna.-.Drip.Too.Hard.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music2/releases/download/v1.0/Mabel.Matiz.-.Hala.Haber.Bekliyorum.Senden.Mabel.s.Version.mp3",
    "title": "Hâlâ Haber Bekliyorum",
    "artist": "mabelmatiz",
    "filename": "Mabel.Matiz.-.Hala.Haber.Bekliyorum.Senden.Mabel.s.Version.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music2/releases/download/v1.0/Mark.Ronson.-.Uptown.Funk.Official.Video.ft.Bruno.Mars.mp3",
    "title": "Uptown Funk",
    "artist": "Mark Ronson",
    "filename": "Mark.Ronson.-.Uptown.Funk.Official.Video.ft.Bruno.Mars.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music2/releases/download/v1.0/Marshmello.-.Alone.Official.Music.Video.mp3",
    "title": "Alone",
    "artist": "Marshmello",
    "filename": "Marshmello.-.Alone.Official.Music.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music2/releases/download/v1.0/Muse.-.Madness.mp3",
    "title": "Madness",
    "artist": "Muse",
    "filename": "Muse.-.Madness.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music2/releases/download/v1.0/Queen.-.Don.t.Stop.Me.Now.Official.Video.mp3",
    "title": "Don't Stop Me Now",
    "artist": "Queen Official",
    "filename": "Queen.-.Don.t.Stop.Me.Now.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music2/releases/download/v1.0/Red.Hot.Chili.Peppers.-.Californication.Official.Music.Video.HD.UPGRADE.mp3",
    "title": "Californication",
    "artist": "Red Hot Chili Peppers",
    "filename": "Red.Hot.Chili.Peppers.-.Californication.Official.Music.Video.HD.UPGRADE.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music2/releases/download/v1.0/Semicenk.Ziynet.Sali.Ilkan.Gunuc.-.Bozulmus.Kalbim.mp3",
    "title": "Bozulmuş Kalbim",
    "artist": "Eva Records",
    "filename": "Semicenk.Ziynet.Sali.Ilkan.Gunuc.-.Bozulmus.Kalbim.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music2/releases/download/v1.0/Serdar.Ortac.-.Ben.Adam.Olmam.Official.Video.mp3",
    "title": "Ben Adam Olmam",
    "artist": "MuzikPlay",
    "filename": "Serdar.Ortac.-.Ben.Adam.Olmam.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music2/releases/download/v1.0/Sezen.Aksu.-.Hadi.Bakalim.Official.Video.mp3",
    "title": "Hadi Bakalım",
    "artist": "Sezen Aksu",
    "filename": "Sezen.Aksu.-.Hadi.Bakalim.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music2/releases/download/v1.0/Teoman.-.Paramparca.mp3",
    "title": "Paramparça",
    "artist": "TeomanVEVO",
    "filename": "Teoman.-.Paramparca.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music2/releases/download/v1.0/Teoman.in.Yaklasik.30.Manken.Esliginde.Cektigi.Yeni.Klip.-.DiviksFilm.Com.mp3",
    "title": "Yaklaşık 30 Manken",
    "artist": "Diviks Robotu",
    "filename": "Teoman.in.Yaklasik.30.Manken.Esliginde.Cektigi.Yeni.Klip.-.DiviksFilm.Com.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music2/releases/download/v1.0/Travis.Scott.-.Antidote.Official.Video.mp3",
    "title": "Antidote",
    "artist": "Travis Scott",
    "filename": "Travis.Scott.-.Antidote.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music2/releases/download/v1.0/Tugkan.-.Gitmelisin.Official.Lyric.Video.mp3",
    "title": "Gitmelisin",
    "artist": "Tuğkan",
    "filename": "Tugkan.-.Gitmelisin.Official.Lyric.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music2/releases/download/v1.0/Yalin.-.Halbuki.mp3",
    "title": "Halbuki",
    "artist": "YALIN",
    "filename": "Yalin.-.Halbuki.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music2/releases/download/v1.0/Yalin.-.Her.Sey.Sensin.Official.Video.mp3",
    "title": "Her Şey Sensin",
    "artist": "MuzikPlay",
    "filename": "Yalin.-.Her.Sey.Sensin.Official.Video.mp3"
  },
  {
    "url": "https://github.com/judy658/sportify-music/releases/download/v1.0/🎵",
    "title": "🎶",
    "artist": "🎸",
    "filename": "🎵"
  }
];
