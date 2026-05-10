
// J.A.R.V.I.S INTELLIGENCE ENGINE (STARK OS) - GITHUB ANTI-BAN KORUMASI 🛡️
const JARVIS_KEYS = [
  atob("QUl6YVN5Q2ktNF9maDhuOTVZMTZtMjFDMlY3dXl4bXVHOWptVFY0"), // Key 1
  atob("QUl6YVN5Qk1KYWhyUFVpR0ZJRTVMQUtRSkVnQ0tQLUtldmdBTGs4"),
  atob("QUl6YVN5QjQ3NWx4UlVTUEt4MU5xWFozN2F4TUd2QkZOZzE2dmM4"),
  atob("QUl6YVN5QlNYdUtFTTdOOWtQSHRERkdnbW1MZGxhR3FHUG9vRmlz"),
  atob("QUl6YVN5QkhpUnFvTUFYTnVkY2N5UXVOZUNabzU3VzRkbGMxTlpZ")
];
let currentJarvisKeyIndex = 0;

const SPORTIFY_SONGS = [{"title":"Passo","filename":"ATLXS_Passo.mp3"},{"title":"Aaron_Dancin","filename":"Aaron_Dancin.mp3"},{"title":"Kabede hacılara","filename":"Abdurrahman_Kabe.mp3"},{"title":"Affet","filename":"Affet.mp3"},{"title":"Fairytale","filename":"Alexander_Fairytale.mp3"},{"title":"Alla Beni Pulla Beni","filename":"Alla_Beni_Pulla_Beni.mp3"},{"title":"Altaylardan Tunaya","filename":"Altaylardan_Tunaya.mp3"},{"title":"Anlamazdin","filename":"Anlamazdin.mp3"},{"title":"Guardians","filename":"Audiomachine_Guardians.mp3"},{"title":"Derinden","filename":"Baris_Derinden.mp3"},{"title":"Beggin (Slowed)","filename":"Beggin_Slowed.mp3"},{"title":"Rasputin","filename":"Boney_Rasputin.mp3"},{"title":"Bu Havada gidilmez","filename":"Bu_Havada.mp3"},{"title":"Bizim hikaye","filename":"Cagatay_Bizim.mp3"},{"title":"Ceviz Agaci","filename":"Cem_Ceviz.mp3"},{"title":"Tamirci cirağı","filename":"Cem_Tamirci.mp3"},{"title":"Dark Night","filename":"Dark_Night.mp3"},{"title":"Daylight","filename":"David_Daylight.mp3"},{"title":"Episode","filename":"Dre_Episode.mp3"},{"title":"extnall Love","filename":"Etxrnall_Love.mp3"},{"title":"Valse","filename":"Evgeny_Valse.mp3"},{"title":"Dobro","filename":"Farazi_Dobro.mp3"},{"title":"Insan insan","filename":"Fazil_Insan.mp3"},{"title":"Caresizim","filename":"Funda_Caresizim.mp3"},{"title":"Freed from Desire","filename":"Gala_Freed.mp3"},{"title":"Gangsta's Paradise","filename":"Gangsta_Paradise.mp3"},{"title":"Gangsta's Paradise v2","filename":"Gangsta_Paradise2.mp3"},{"title":"Grup Bella","filename":"Grup_Bella.mp3"},{"title":"Gençlik başımda duman","filename":"Guzin_Baha.mp3"},{"title":"Courage","filename":"Heart_Courage.mp3"},{"title":"Huznu Hecem","filename":"Huznu_Hecem.mp3"},{"title":"Believer","filename":"Imagine_Believer.mp3"},{"title":"Belly Dancer","filename":"Imanbek_Belly.mp3"},{"title":"Danse","filename":"Indila_Danse.mp3"},{"title":"Danse v2","filename":"Indila_Danse2.mp3"},{"title":"Kardan Aydinlik","filename":"Kardan_Aydinlik.mp3"},{"title":"Khamzat Chimaev","filename":"Khamzat_Chimaev.mp3"},{"title":"Bloody Mary","filename":"Lady_Bloody.mp3"},{"title":"Beggin","filename":"Maneskin_Beggin.mp3"},{"title":"bir kadin çizeceksin","filename":"Manga_Kadin.mp3"},{"title":"karanfil kokuyor cigaram","filename":"Manus_Baba.mp3"},{"title":"MAtushka Ultrafunk","filename":"Matushka_Ultrafunk.mp3"},{"title":"Mesela Yani","filename":"Mesela_Yani.mp3"},{"title":"Pembe mezarlık","filename":"Model_Pembe.mp3"},{"title":"Cheri Cheri Lady","filename":"Modern_Cheri.mp3"},{"title":"Bozkurt ordusu","filename":"Mt_Bozkurt.mp3"},{"title":"Nada Nada","filename":"Nada_Nada.mp3"},{"title":"Nilufer","filename":"Nilufer.mp3"},{"title":"Caddelerde rüzgar","filename":"Nilufer_Caddelerde.mp3"},{"title":"Ayy ben hala rüyada","filename":"Oguzhan_Ayy.mp3"},{"title":"Ya sidi","filename":"Orange_Yasidi.mp3"},{"title":"Plevne Marsi","filename":"Plevne_Marsi.mp3"},{"title":"Sonne_slowed","filename":"Rammstein_Sonne.mp3"},{"title":"savai_Dark_life","filename":"Savai_Dark.mp3"},{"title":"Mayin_tarlası","filename":"Sebnem_Mayin.mp3"},{"title":"Birde bana sor","filename":"Selin_Bana.mp3"},{"title":"Star Wars Theme","filename":"Star_Wars.mp3"},{"title":"My Demons","filename":"Starset_Demons.mp3"},{"title":"Runaway","filename":"Sunstroke_Runaway.mp3"},{"title":"Mortals","filename":"Warriyo_Mortals.mp3"},{"title":"Easy On Me","filename":"Adele.-.Easy.On.Me.Official.Lyric.Video.mp3"},{"title":"Easy On Me (Video)","filename":"Adele.-.Easy.On.Me.Official.Video.mp3"},{"title":"Faded","filename":"Alan.Walker.-.Faded.mp3"},{"title":"Tanırım İntiharı","filename":"Aleyna.Tilki.-.Tanirim.Intihari.mp3"},{"title":"Yemin Et","filename":"Allame.-.Yemin.Et.feat.Joker.Official.Audio.mp3"},{"title":"Aşk Kitabı","filename":"Ask.Kitabi.mp3"},{"title":"Ben Böyleyim","filename":"Athena.-.Ben.Boyleyim.mp3"},{"title":"Wake Me Up","filename":"Avicii.-.Wake.Me.Up.Official.Video.mp3"},{"title":"Siki Dur","filename":"Ben.Fero.Anil.Piyanci.-.Siki.Dur.Official.Audio.mp3"},{"title":"bad guy","filename":"Billie.Eilish.-.bad.guy.mp3"},{"title":"Summer","filename":"Calvin.Harris.-.Summer.Official.Video.mp3"},{"title":"WAP","filename":"Cardi.B.-.WAP.feat.Megan.Thee.Stallion.Official.Music.Video.mp3"},{"title":"Elbet Bir Gün Buluşacağız","filename":"Cem.Adrian.-.Cem.Adrian.-.Elbet.Bir.Gun.Bulusacagiz.Official.Lyric.Video.mp3"},{"title":"Holocaust","filename":"CEZA.-.Holocaust.Official.Audio.mp3"},{"title":"Med Cezir","filename":"CEZA.-.Med.Cezir.Official.Audio.mp3"},{"title":"Kibir","filename":"Contra.-.Kibir.mp3"},{"title":"One Dance","filename":"Drake.-.One.Dance.Lyrics.mp3"},{"title":"Levitating","filename":"Dua.Lipa.-.Levitating.Featuring.DaBaby.Official.Music.Video.mp3"},{"title":"Seni Kendime Sakladım","filename":"Duman.-.Seni.Kendime.Sakladim.mp3"},{"title":"Affet","filename":"Ebru.Yasar.Burak.Bulut.-.Affet.mp3"},{"title":"Shape of You","filename":"Ed.Sheeran.-.Shape.of.You.Official.Music.Video.mp3"},{"title":"Without Me","filename":"Eminem.-.Without.Me.Official.Music.Video.mp3"},{"title":"Geceler","filename":"Ezhel.-.Geceler.mp3"},{"title":"Heat Waves","filename":"Glass.Animals.-.Heat.Waves.mp3"},{"title":"Yanımda Kal","filename":"Gripin.-.Yanimda.Kal.-.Alpay.a.Saygi.mp3"},{"title":"Aşk Kaç Beden Giyer","filename":"Hadise.-.Ask.Kac.Beden.Giyer.mp3"},{"title":"As It Was","filename":"Harry.Styles.-.As.It.Was.Official.Video.mp3"},{"title":"Etek Sarı","filename":"Ibrahim.Tatlises.-.Etek.Sari.mp3"},{"title":"Enemy","filename":"Imagine.Dragons.x.J.I.D.-.Enemy.from.the.series.Arcane.League.of.Legends.mp3"},{"title":"YAK","filename":"Jabbar.YAK.mp3"},{"title":"Senin Olsun","filename":"Kalan.Saglar.Senin.Olsun.mp3"},{"title":"HUMBLE","filename":"Kendrick.Lamar.-.HUMBLE.mp3"},{"title":"MONTERO","filename":"Lil.Nas.X.-.MONTERO.Call.Me.By.Your.Name.Official.Video.mp3"},{"title":"Beni Benimle Bırak","filename":"maNga.-.Beni.Benimle.Birak.mp3"},{"title":"We Could Be The Same","filename":"maNga.-.We.Could.Be.The.Same.-.Turkey.-.Grand.Final.-.Eurovision.2010.mp3"},{"title":"Happier","filename":"Marshmello.ft.Bastille.-.Happier.Official.Music.Video.mp3"},{"title":"Flowers","filename":"Miley.Cyrus.-.Flowers.Official.Video.mp3"},{"title":"Bir Derdim Var","filename":"mor.ve.otesi.-.Bir.Derdim.Var.Official.Video.mp3"},{"title":"Affet","filename":"Muslum.Gurses.-.Affet.mp3"},{"title":"Super Shy","filename":"NewJeans.Super.Shy.Official.MV.mp3"},{"title":"Mekanın Sahibi","filename":"Norm.Ender.-.Mekanin.Sahibi.mp3"},{"title":"Hesabıma Yazıyor","filename":"Oguzhan.Koc.-.Hesabima.Yaziyor.Official.Video.mp3"},{"title":"drivers license","filename":"Olivia.Rodrigo.-.drivers.license.Official.Video.mp3"},{"title":"Batsın Bu Dünya","filename":"Orhan.Gencebay-batsin.bu.dunya.mp3"},{"title":"Kapalı Kapılar","filename":"Otonom.Piyade.-.Kapali.Kapilar.Video.mp3"},{"title":"Pavyon","filename":"Pavyon.-.Ezhel.DJ.Artz.Official.Video.mp3"},{"title":"Ben Nasıl Büyük Adam Olucam","filename":"Pinhani.-.Ben.Nasil.Buyuk.Adam.Olucam.mp3"},{"title":"rockstar","filename":"Post.Malone.-.rockstar.Official.Music.Video.ft.21.Savage.mp3"},{"title":"Sunflower","filename":"Post.Malone.Swae.Lee.-.Sunflower.Spider-Man.Into.the.Spider-Verse.mp3"},{"title":"Karabasan","filename":"Raks.Aga.-.Karabasan.mp3"},{"title":"Derdim Olsun","filename":"Reynmen.-.Derdim.Olsun.Official.Video.mp3"},{"title":"Çıkmaz Bir Sokakta","filename":"Semicenk.-.Cikmaz.Bir.Sokakta.mp3"},{"title":"Akbaba Ziyafeti","filename":"Server.Uraz.-.Akbaba.Ziyafeti.Official.Video.mp3"},{"title":"Şeytan Bunun Neresinde","filename":"Seytan.Bunun.Neresinde.mp3"},{"title":"Firuze","filename":"Sezen.Aksu.-.Firuze.Official.Audio.-.Orijinal.Plak.Kayit.mp3"},{"title":"Alors on danse","filename":"Stromae.-.Alors.on.danse.Official.Video.mp3"},{"title":"Adımı Kalbine Yaz","filename":"TARKAN.-.Adimi.Kalbine.Yaz.Official.Audio.mp3"},{"title":"Anti-Hero","filename":"Taylor.Swift.-.Anti-Hero.Official.Music.Video.mp3"},{"title":"STAY","filename":"The.Kid.LAROI.Justin.Bieber.-.STAY.Official.Video.mp3"},{"title":"Blinding Lights","filename":"The.Weeknd.-.Blinding.Lights.Official.Video.mp3"},{"title":"Dance Monkey","filename":"TONES.AND.I.-.DANCE.MONKEY.OFFICIAL.VIDEO.mp3"},{"title":"SICKO MODE","filename":"Travis.Scott.-.SICKO.MODE.Official.Video.ft.Drake.mp3"},{"title":"ICH BIN EIN BERLINER","filename":"Ufo361.-.ICH.BIN.EIN.BERLINER.mp3"},{"title":"What is a Data Center","filename":"What.is.a.data.center.mp3"},{"title":"Hitler","filename":"HITLER.mp3"},{"title":"Hitler (Bass Boosted)","filename":"HITLER_bass.mp3"},{"title":"Ceddin Deden","filename":"ITU_Mehter_Ceddin_Deden.mp3"},{"title":"SUBMARINER","filename":"AKDO.Lvbel.C5.-.SUBMARINER.mp3"},{"title":"Alay Marşı","filename":"Alay.Marsi.Turk.Asker.Marslari.-.Turkish.Army.Anthem.mp3"},{"title":"Elini Ver","filename":"Amo988.-.Elini.Ver.mp3"},{"title":"Gündoğdu Marşı (La Galibe İllallah)","filename":"Atilla.Yilmaz.Gundogdu.Marsi.La.Galibe.Illallah.mp3"},{"title":"My Neck My Back","filename":"Aykut.Closer.-MyNeck.MyBack.mp3"},{"title":"Take a Look Around","filename":"Limp.bizkit.-.Take.a.look.around.mp3"},{"title":"Enth E Nd","filename":"Enth.E.Nd.-.Linkin.Park.Reanimation.mp3"},{"title":"Fark Var","filename":"CEZA.-.Fark.Var.Official.Audio.mp3"},{"title":"Crawling","filename":"Crawling.Official.HD.Music.Video.-.Linkin.Park.mp3"},{"title":"Crazy (Robert Cristian Remix)","filename":"Crazy.Robert.Cristian.Remix.mp3"},{"title":"Cure for the Itch","filename":"Cure.For.The.Itch.-.Linkin.Park.Hybrid.Theory.mp3"},{"title":"Operasyon","filename":"CVRTOON.-.Operasyon.mp3"},{"title":"Vatan Sağolsun","filename":"CVRTOON.-.VATAN.SAGOLSUN.mp3"},{"title":"The Prowler","filename":"Daniel.Pemberton.-.The.Prowler.From.Spider-Man.Into.the.Spider-Verse.Score.mp3"},{"title":"MX","filename":"Deftones.-.MX.-.Lyrics.mp3"},{"title":"My Own Summer (Shove It)","filename":"Deftones.-.My.Own.Summer.Official.Music.Video.HD.Remaster.mp3"},{"title":"Destan","filename":"Destan.mp3"},{"title":"Brutal Infernal Funk (Slowed)","filename":"DJ.Oliver.Mendes.-.Brutal.Infernal.Funk.Slowed.mp3"},{"title":"Turn Down for What","filename":"DJ.Snake.Lil.Jon.-.Turn.Down.for.What.mp3"},{"title":"Danza Kuduro","filename":"Don.Omar.-.Danza.Kuduro.ft.Lucenzo.mp3"},{"title":"Don't Stay","filename":"Don.t.Stay.-.Linkin.Park.Meteora.mp3"},{"title":"Bodies","filename":"Drowning.Pool.-.Bodies.Official.HD.Music.Video.mp3"},{"title":"Seviyorsan İnanıyorsan","filename":"Duman.-.Seviyorsan.Inaniyorsan.mp3"},{"title":"Duman Küfi","filename":"Duman_Kufi.mp3"},{"title":"Arcade","filename":"Duncan.Laurence.-.Arcade.Lyric.Video.ft.FLETCHER.mp3"},{"title":"Dale Don Dale","filename":"ElMusto.-.Dale.Don.Dale.Official.Music.Video.mp3"},{"title":"I Was Made for Lovin' You","filename":"Kiss.-.I.Was.Made.For.Lovin.You.mp3"},{"title":"CISTAK","filename":"Era7capone.ft.Batuflex.-.CISTAK.Official.Video.mp3"},{"title":"Faint","filename":"Faint.Official.Music.Video.4K.UPGRADE.Linkin.Park.mp3"},{"title":"Figure.09","filename":"Figure.09.-.Linkin.Park.Meteora.mp3"},{"title":"Gata Only","filename":"FloyyMenor.Cris.MJ.-.Gata.Only.mp3"},{"title":"Bella Ciao","filename":"Fonola.Band.-.Bella.Ciao.Audio.mp3"},{"title":"Forgotten","filename":"Forgotten.-.Linkin.Park.Hybrid.Theory.mp3"},{"title":"From the Inside","filename":"From.The.Inside.Official.Music.Video.4K.UPGRADE.Linkin.Park.mp3"},{"title":"Gece Gölgenin Rahatına Bak","filename":"Gece.Golgenin.Rahatina.Bak.-.Cagatay.Akman.Official.Video.mp3"},{"title":"NINAO","filename":"GIMS.-.NINAO.Clip.officiel.mp3"},{"title":"Şahlanış Marşı","filename":"Grup.VOLKAN.-SAHLANIS.MARSI-.mp3"},{"title":"H! Vltg3","filename":"H.Vltg3.-.Linkin.Park.Reanimation.mp3"},{"title":"Hands Held High","filename":"Hands.Held.High.-.Linkin.Park.Minutes.To.Midnight.mp3"},{"title":"High Voltage","filename":"High.Voltage.-.Linkin.Park.mp3"},{"title":"Hit the Floor","filename":"Hit.The.Floor.-.Linkin.Park.Meteora.mp3"},{"title":"Sea Shanty Medley","filename":"Home.Free.-.Sea.Shanty.Medley.mp3"},{"title":"Hot Dog","filename":"Hot.Dog.mp3"},{"title":"In the End","filename":"In.The.End.Official.HD.Music.Video.-.Linkin.Park.mp3"},{"title":"Bad Boys","filename":"INNA.-.Bad.Boys.Exclusive.Online.Video.mp3"},{"title":"Gündoğdu Marşı","filename":"Kirac.-.Gundogdu.Marsi.mp3"},{"title":"Given Up (Live)","filename":"Linkin.Park.-.Given.Up.Live.In.Clarkston.HD.mp3"},{"title":"A Place for My Head (Live)","filename":"Linkin.Park.-.A.Place.for.My.Head.Live.In.Texas.mp3"},{"title":"Papercut (Live)","filename":"Linkin.Park.-.Papercut.Live.In.Texas.mp3"},{"title":"Despacito","filename":"Luis.Fonsi.-.Despacito.ft.Daddy.Yankee.mp3"},{"title":"nE?","filename":"LVBEL.C5.-.nE.mp3"},{"title":"SEZEN AKSU","filename":"LVBEL.C5.-.SEZEN.AKSU.mp3"},{"title":"Lying From You","filename":"Lying.From.You.-.Linkin.Park.Meteora.mp3"},{"title":"Ahu","filename":"Mabel.Matiz.-.Ahu.mp3"},{"title":"MALA","filename":"MALA.feat.Anuel.Aa.mp3"},{"title":"Tipping Point","filename":"Megadeth.-.Tipping.Point.Official.Music.Video.mp3"},{"title":"Estergon Kalesi","filename":"Mehter.Dunyanin.En.Eski.Askeri.Bandosu.-.Estergon.Kal.asi.mp3"},{"title":"Die With a Smile","filename":"Lady.Gaga.Bruno.Mars.-.Die.With.A.Smile.Official.Music.Video.mp3"},{"title":"Boiler","filename":"Limp.Bizkit.-.Boiler.Official.Music.Video.mp3"},{"title":"Break Stuff","filename":"Limp.Bizkit.-.Break.Stuff.Official.Music.Video.mp3"},{"title":"Gold Cobra","filename":"Limp.Bizkit.-.Gold.Cobra.mp3"},{"title":"Livin' It Up","filename":"Limp.Bizkit.-.Livin.It.Up.Party.Up.Live.at.Budapest.Hungary.2015.Official.Pro.Shot.mp3"},{"title":"My Generation","filename":"Limp.Bizkit.-.My.Generation.mp3"},{"title":"My Way","filename":"Limp.Bizkit.-.My.Way.mp3"},{"title":"Nookie","filename":"Limp.Bizkit.-.Nookie.Official.Music.Video.mp3"},{"title":"Rollin' (Air Raid Vehicle)","filename":"Limp.Bizkit.-.Rollin.Air.Raid.Vehicle.mp3"},{"title":"Ai Se Eu Te Pego","filename":"Michel.Telo.-.Ai.Se.Eu.Te.Pego.-.Video.Oficial.Assim.voce.me.mata.mp3"},{"title":"Muhabbet Bağına Girdim","filename":"Muhabbet.Bagina.Girdim.Bu.Gece.Ararim.Sorarim.mp3"},{"title":"Vurgunum","filename":"Murat.Gogebakan.-.Vurgunum.Official.Video.mp3"},{"title":"Sigara","filename":"Muslum.Gurses.-.Sigara.mp3"},{"title":"Tutamıyorum Zamanı","filename":"Muslum.Gurses.-.Tutamiyorum.Zamani.mp3"},{"title":"New Divide","filename":"New.Divide.Official.Music.Video.4K.Upgrade.-.Linkin.Park.mp3"},{"title":"Nobody's Listening","filename":"Nobody.s.Listening.-.Linkin.Park.Meteora.mp3"},{"title":"Numb / Encore (Live)","filename":"Numb.Encore.Live.Official.Music.Video.4K.Upgrade.-.Linkin.Park.JAY-Z.mp3"},{"title":"Hesabıma Yazıyor","filename":"Oguzhan.Koc.-.Hesabima.Yaziyor.Official.Video.mp3"},{"title":"Between Angels and Insects","filename":"Papa.Roach.-.Between.Angels.And.Insects.mp3"},{"title":"Papercut","filename":"Papercut.Official.HD.Music.Video.-.Linkin.Park.mp3"},{"title":"He's a Pirate","filename":"Pirates.Of.The.Caribbean.-.Main.Theme.-.He.s.A.Pirate.mp3"},{"title":"Points of Authority","filename":"Points.Of.Authority.Official.HD.Music.Video.-.Linkin.Park.mp3"},{"title":"Gangnam Style","filename":"PSY.-.GANGNAM.STYLE.M.V.mp3"},{"title":"Pushing Me Away","filename":"Pushing.Me.Away.-.Linkin.Park.Hybrid.Theory.mp3"},{"title":"One Step Closer","filename":"One.Step.Closer.Official.HD.Music.Video.-.Linkin.Park.mp3"},{"title":"Sımpa","filename":"Raim.Artur.Adil.-.OFFICIAL.VIDEO.mp3"},{"title":"Remember the Name","filename":"Remember.The.Name.Official.Video.-.Fort.Minor.4K.mp3"},{"title":"Renklensin","filename":"Reynmen.-.Renklensin.Official.Premiere.Video.mp3"},{"title":"Runaway","filename":"Runaway.-.Linkin.Park.Hybrid.Theory.mp3"},{"title":"ISABELLE","filename":"Sefo.Capo.-.ISABELLE.Official.Video.mp3"},{"title":"Sen İstanbul'sun","filename":"Sen.Istanbul.sun.Official.Video.-.Gokhan.Turkmen.enbastan.mp3"},{"title":"Poşet","filename":"Serdar.Ortac.-.Poset.mp3"},{"title":"Türküm","filename":"Serhat.Durmus.-.Turkum.mp3"},{"title":"Set Fire to the Rain","filename":"Set.Fire.to.the.Rain.mp3"},{"title":"Waka Waka","filename":"Shakira.-.Waka.Waka.This.Time.For.Africa.Official.HD.Video.ft.Freshlyground.mp3"},{"title":"OI OI OI BAKA","filename":"SHX4.-.OI.OI.OI.BAKA.Brazilian.Funk.mp3"},{"title":"Kafa","filename":"Sila.-.Kafa.mp3"},{"title":"Love Is Gone (Acoustic)","filename":"SLANDER.-.Love.Is.Gone.ft.Dylan.Matthew.Acoustic.mp3"},{"title":"Somewhere I Belong","filename":"Somewhere.I.Belong.Official.Music.Video.4K.UPGRADE.Linkin.Park.mp3"},{"title":"Go Down Deh","filename":"Spice.Sean.Paul.Shaggy.-.Go.Down.Deh.Official.Music.Video.mp3"},{"title":"Stained (Live)","filename":"Stained.Live.-.Linkin.Park.mp3"},{"title":"Chop Suey","filename":"System.Of.A.Down.-.Chop.Suey.Official.HD.Video.mp3"},{"title":"Dive","filename":"The.Eastern.Man.-.Dive.Official.MV.mp3"},{"title":"Tokyo Drift","filename":"Tokyo.Drift.-.Teriyaki.Boyz.MUSIC.VIDEO.HD.mp3"},{"title":"Two Faced","filename":"Two.Faced.Official.Music.Video.-.Linkin.Park.mp3"},{"title":"Ula Hamsi Tuttum Seni","filename":"Ula.Hamsi.Tuttum.Seni.Hamsi.Stayla.mp3"},{"title":"When They Come For Me","filename":"When.They.Come.For.Me.-.Linkin.Park.A.Thousands.Suns.mp3"},{"title":"Whisky Cola Tequila (Slowed)","filename":"Whisky.Cola.Tequila.-.Slowed.mp3"},{"title":"Ego","filename":"Willy.William.-.Ego.Clip.Officiel.mp3"},{"title":"With You","filename":"With.You.-.Linkin.Park.Hybrid.Theory.mp3"},{"title":"Wretches And Kings","filename":"Wretches.And.Kings.-.Linkin.Park.A.Thousands.Suns.mp3"},{"title":"X (Remix)","filename":"X.Remix.-.Nicky.Jam.x.J.Balvin.x.Ozuna.x.Maluma.mp3"},{"title":"It's Goin' Down","filename":"X-Ecutioners.feat.Mike.Shinoda.Mr.Hahn.-.It.s.Goin.Down.Official.Music.Video.mp3"},{"title":"Ceddin Deden (ITTMT)","filename":"15.Ceddin.Deden.ITTMT.Mehter.Birimi.Album.mp3"},{"title":"Super Star","filename":"Ajda.Pekkan.-.Super.Star.4.-.87.Remastered.Full.Album.mp3"},{"title":"On My Way","filename":"Alan.Walker.Sabrina.Carpenter.Farruko.-.On.My.Way.mp3"},{"title":"Oğlumun Tabancası","filename":"Ankarali.Namik.-.Oglumun.Tabancasi.mp3"},{"title":"Hala Madrid 2025","filename":"BAD.NOVA.-.Hala.Madrid.2025.EDITION.Lyrics.Video.mp3"},{"title":"Yağmurlu Bir Günde","filename":"Besiktas.Taraftar.Korosu.-.Yagmurlu.Bir.Gunde.Official.Audio.mp3"},{"title":"Blackout","filename":"Blackout.-.Linkin.Park.A.Thousands.Suns.mp3"},{"title":"Bleed It Out","filename":"Bleed.It.Out.Official.Music.Video.4K.Upgrade.-.Linkin.Park.mp3"},{"title":"Tak","filename":"Bloc.Party.feat.Mike.Shinoda.Tak.mp3"},{"title":"WOOPS TECHNO","filename":"BOUNTYHUNTER.-.WOOPS.TECHNO.mp3"},{"title":"Breaking the Habit","filename":"Breaking.the.Habit.Official.Music.Video.HD.UPGRADE.Linkin.Park.mp3"},{"title":"Burn It Down","filename":"BURN.IT.DOWN.Official.Music.Video.4K.Upgrade.-.Linkin.Park.mp3"},{"title":"By Myself","filename":"By.Myself.-.Linkin.Park.Hybrid.Theory.mp3"},{"title":"Heat Waves (Official Video)","filename":"Glass.Animals.-.Heat.Waves.Official.Video.mp3"},{"title":"MX (Full)","filename":"MX.mp3"},{"title":"Положение","filename":"Scriptonite_Polozhenie.mp3"},{"title":"Yandı Gönlüm","filename":"Yandi.Gonlum.mp3"},{"title":"Dancing Queen","filename":"ABBA.-.Dancing.Queen.Official.Music.Video.mp3"},{"title":"Thunderstruck","filename":"AC.DC.-.Thunderstruck.Official.Video.mp3"},{"title":"Hello","filename":"Adele.-.Hello.Official.Music.Video.mp3"},{"title":"Rolling in the Deep","filename":"Adele.-.Rolling.in.the.Deep.Official.Music.Video.mp3"},{"title":"Someone Like You","filename":"Adele.-.Someone.Like.You.Official.Music.Video.mp3"},{"title":"Alone","filename":"Alan.Walker.-.Alone.mp3"},{"title":"Darkside","filename":"Alan.Walker.-.Darkside.feat.Au.Ra.and.Tomine.Harket.mp3"},{"title":"Ayrı Gitme","filename":"Aleyna.Tilki.-.Ayri.Gitme.mp3"},{"title":"Alışırım Gözlerimi Kapamaya","filename":"Alisirim.Gozlerimi.Kapamaya.mp3"},{"title":"Ömür","filename":"Allame.-.Omur.Official.Video.Clip.mp3"},{"title":"Do I Wanna Know?","filename":"Arctic.Monkeys.-.Do.I.Wanna.Know.Official.Video.mp3"},{"title":"R U Mine?","filename":"Arctic.Monkeys.-.R.U.Mine.Official.Video.mp3"},{"title":"7 rings","filename":"Ariana.Grande.-.7.rings.Official.Video.mp3"},{"title":"no tears left to cry","filename":"Ariana.Grande.-.no.tears.left.to.cry.Official.Video.mp3"},{"title":"thank u next","filename":"Ariana.Grande.-.thank.u.next.Official.Video.mp3"},{"title":"Hey Brother","filename":"Avicii.-.Hey.Brother.mp3"},{"title":"Levels","filename":"Avicii.-.Levels.mp3"},{"title":"Buz Gibi Biraderler","filename":"Batesmotelpro.-.Buz.Gibi.Biraderler.mp3"},{"title":"Ben Bunu Hak Etmedim","filename":"Ben.Bunu.Hak.Etmedim.Sila.Ismail.Kacan.mp3"},{"title":"Mahallemiz Esmer","filename":"Ben.Fero.-.Mahallemiz.Esmer.Official.Video.mp3"},{"title":"Benim Stilim","filename":"Benim.Stilim.mp3"},{"title":"Crazy in Love","filename":"Beyonce.-.Crazy.In.Love.ft.JAY.Z.mp3"},{"title":"Halo","filename":"Beyonce.-.Halo.mp3"},{"title":"Bir Başkedir","filename":"Bir_Baskedir.mp3"},{"title":"Livin' On a Prayer","filename":"Bon.Jovi.-.Livin.On.A.Prayer.mp3"},{"title":"Locked Out of Heaven","filename":"Bruno.Mars.-.Locked.Out.Of.Heaven.Official.Music.Video.mp3"},{"title":"That's What I Like","filename":"Bruno.Mars.-.That.s.What.I.Like.Official.Music.Video.mp3"},{"title":"Büyük Düşler","filename":"Buyuk.Dusler.mp3"},{"title":"One Kiss","filename":"Calvin.Harris.Dua.Lipa.-.One.Kiss.Official.Video.mp3"},{"title":"This Is What You Came For","filename":"Calvin.Harris.Rihanna.-.This.Is.What.You.Came.For.Official.Video.mp3"},{"title":"Bodak Yellow","filename":"Cardi.B.-.Bodak.Yellow.OFFICIAL.MUSIC.VIDEO.mp3"},{"title":"Ceddin Deden","filename":"Ceddin.Deden.mp3"},{"title":"Dar-ı Dünya","filename":"Cem.Yildiz.-.Dar-i.Dunya.Official.Video.mp3"},{"title":"Yerli Plaka","filename":"Ceza.-.Yerli.Plaka.Official.Video.Yuksek.Kalite.mp3"},{"title":"With You","filename":"Chris.Brown.-.With.You.Official.HD.Video.mp3"},{"title":"A Sky Full of Stars","filename":"Coldplay.-.A.Sky.Full.Of.Stars.Official.Video.mp3"},{"title":"The Scientist","filename":"Coldplay.-.The.Scientist.Official.4K.Video.mp3"},{"title":"Yellow","filename":"Coldplay.-.Yellow.Official.Video.mp3"},{"title":"Get Lucky","filename":"Daft.Punk.-.Get.Lucky.Official.Video.feat.Pharrell.Williams.and.Nile.Rodgers.mp3"},{"title":"Harder Better Faster Stronger","filename":"Daft.Punk.-.Harder.Better.Faster.Stronger.Official.Video.mp3"},{"title":"Titanium","filename":"David.Guetta.-.Titanium.ft.Sia.Official.Video.mp3"},{"title":"Without You","filename":"David.Guetta.-.Without.You.ft.Usher.Official.Video.mp3"},{"title":"Geçmiş Değişmez","filename":"Deeperise.Jabbar.-.Gecmis.Degismez.mp3"},{"title":"God's Plan","filename":"Drake.-.God.s.Plan.mp3"},{"title":"Hotline Bling","filename":"Drake.-.Hotline.Bling.mp3"},{"title":"In My Feelings","filename":"Drake.-.In.My.Feelings.mp3"},{"title":"Don't Start Now","filename":"Dua.Lipa.-.Don.t.Start.Now.Official.Music.Video.mp3"},{"title":"New Rules","filename":"Dua.Lipa.-.New.Rules.Official.Music.Video.mp3"},{"title":"Physical","filename":"Dua.Lipa.-.Physical.Official.Video.mp3"},{"title":"Dünya Yok Oluyor","filename":"Dunya.yok.oluyor.mp3"},{"title":"EARFQUAKE","filename":"EARFQUAKE.mp3"},{"title":"Bad Habits","filename":"Ed.Sheeran.-.Bad.Habits.Official.Video.mp3"},{"title":"Perfect","filename":"Ed.Sheeran.-.Perfect.Official.Music.Video.mp3"},{"title":"Thinking Out Loud","filename":"Ed.Sheeran.-.Thinking.Out.Loud.Official.Music.Video.mp3"},{"title":"Lose Yourself","filename":"Eminem.-.Lose.Yourself.mp3"},{"title":"Not Afraid","filename":"Eminem.-.Not.Afraid.mp3"},{"title":"Rap God","filename":"Eminem.-.Rap.God.Explicit.mp3"},{"title":"Dum Dum","filename":"Ezhel.-.Dum.Dum.mp3"},{"title":"Sugar We're Goin Down","filename":"Fall.Out.Boy.-.Sugar.We.re.Goin.Down.Official.Music.Video.mp3"},{"title":"Bulamazdın","filename":"Faruk.Sabanci.Norm.Ender.-.Bulamazdin.mp3"},{"title":"Best of You","filename":"Foo.Fighters.-.Best.Of.You.Official.HD.Video.mp3"},{"title":"Everlong","filename":"Foo.Fighters.-.Everlong.Official.HD.Video.mp3"},{"title":"Sende Unutulurmuşsun","filename":"Gize.Ali.Metin.Arsiz.Bela.-.Sende.Unutulurmussun.Prod.Berkay.Candir.mp3"},{"title":"American Idiot","filename":"Green.Day.-.American.Idiot.Official.Music.Video.4K.Upgrade.mp3"},{"title":"Boulevard of Broken Dreams","filename":"Green.Day.-.Boulevard.Of.Broken.Dreams.Official.Music.Video.4K.Upgrade.mp3"},{"title":"Böyle Kahpedir Dünya","filename":"Gripin.-.Boyle.Kahpedir.Dunya.mp3"},{"title":"En Sevdiğim Yanlışım","filename":"Gulsen.-.En.Sevdigim.Yanlisim.mp3"},{"title":"Sweet Child O' Mine","filename":"Guns.N.Roses.-.Sweet.Child.O.Mine.Official.Music.Video.mp3"},{"title":"Focus","filename":"H.E.R.-.Focus.Official.Video.mp3"},{"title":"Sweat","filename":"Hadise.feat.Raw.Jawz.-.Sweat.mp3"},{"title":"Yarası Saklı","filename":"Hayko.Cepkin.-.Yarasi.Sakli.mp3"},{"title":"Natural","filename":"Imagine.Dragons.-.Natural.mp3"},{"title":"Radioactive","filename":"Imagine.Dragons.-.Radioactive.mp3"},{"title":"Thunder","filename":"Imagine.Dragons.-.Thunder.mp3"},{"title":"All of Me","filename":"John.Legend.-.All.of.Me.Official.Video.mp3"},{"title":"Lucid Dreams","filename":"Juice.WRLD.-.Lucid.Dreams.Official.Music.Video.mp3"},{"title":"Love Yourself","filename":"Justin.Bieber.-.Love.Yourself.PURPOSE.The.Movement.mp3"},{"title":"Peaches","filename":"Justin.Bieber.-.Peaches.ft.Daniel.Caesar.Giveon.mp3"},{"title":"Sorry","filename":"Justin.Bieber.-.Sorry.PURPOSE.The.Movement.mp3"},{"title":"Katliam 3","filename":"Katliam.3.OFFICIAL.VIDEO.prod.by.Buaka.mp3"},{"title":"DNA.","filename":"Kendrick.Lamar.-.DNA.mp3"},{"title":"Swimming Pools (Drank)","filename":"Kendrick.Lamar.-.Swimming.Pools.Drank.mp3"},{"title":"Firestone","filename":"Kygo.-.Firestone.ft.Conrad.Sewell.Official.Video.mp3"},{"title":"It Ain't Me","filename":"Kygo.Selena.Gomez.-.It.Ain.t.Me.Official.Video.mp3"},{"title":"dubaiiiiii","filename":"LVBEL.C5.-.dubaiiiiii.mp3"},{"title":"Hala Haber Bekliyorum Senden","filename":"Mabel.Matiz.-.Hala.Haber.Bekliyorum.Senden.Mabel.s.Version.mp3"},{"title":"Alone","filename":"Marshmello.-.Alone.Official.Music.Video.mp3"},{"title":"Animals","filename":"Martin.Garrix.-.Animals.Official.Video.mp3"},{"title":"In the Name of Love","filename":"Martin.Garrix.Bebe.Rexha.-.In.The.Name.Of.Love.Official.Video.mp3"},{"title":"Enter Sandman","filename":"Metallica.Enter.Sandman.Official.Music.Video.mp3"},{"title":"Billie Jean","filename":"Michael.Jackson.-.Billie.Jean.Official.Video.mp3"},{"title":"Thriller","filename":"Michael.Jackson.-.Thriller.Official.4K.Video.mp3"},{"title":"Değmesin Ellerimiz","filename":"Model.-.Degmesin.Ellerimiz.mp3"},{"title":"Supermassive Black Hole","filename":"Muse.-.Supermassive.Black.Hole.Official.Music.Video.mp3"},{"title":"Welcome to the Black Parade","filename":"My.Chemical.Romance.-.Welcome.To.The.Black.Parade.Official.Music.Video.HD.mp3"},{"title":"Neler Oluyor","filename":"Neler_Oluyor.mp3"},{"title":"Super Bass","filename":"Nicki.Minaj.-.Super.Bass.Official.Video.mp3"},{"title":"Come as You Are","filename":"Nirvana.-.Come.As.You.Are.Official.Music.Video.mp3"},{"title":"Smells Like Teen Spirit","filename":"Nirvana.-.Smells.Like.Teen.Spirit.Official.Music.Video.mp3"},{"title":"High Hopes","filename":"Panic.At.The.Disco.-.High.Hopes.Official.Video.mp3"},{"title":"Circles","filename":"Post.Malone.-.Circles.mp3"},{"title":"Californication","filename":"Red.Hot.Chili.Peppers.-.Californication.Official.Music.Video.HD.UPGRADE.mp3"},{"title":"Under the Bridge","filename":"Red.Hot.Chili.Peppers.-.Under.The.Bridge.Official.Music.Video.mp3"},{"title":"Ela","filename":"Reynmen.-.Ela.Official.Video.mp3"},{"title":"Diamonds","filename":"Rihanna.-.Diamonds.mp3"},{"title":"We Found Love","filename":"Rihanna.-.We.Found.Love.ft.Calvin.Harris.mp3"},{"title":"The Box","filename":"Roddy.Ricch.-.The.Box.Official.Music.Video.mp3"},{"title":"Stay With Me","filename":"Sam.Smith.-.Stay.With.Me.Official.Music.Video.mp3"},{"title":"Writing's on the Wall","filename":"Sam.Smith.-.Writing.s.On.The.Wall.from.Spectre.Official.Music.Video.mp3"},{"title":"Satisfaction (Guaracha)","filename":"Satisfaction.Guaracha.2022.@Alcyone.-.Aleteo.Zapateo.Tribal.House.Guaracha.Nati...mp3"},{"title":"Çakıl Taşları","filename":"Sebnem.Ferah.-.Cakil.Taslari.Official.Video.mp3"},{"title":"Mayın Tarlası (İstanbul Konseri)","filename":"Sebnem.Ferah.-.Mayin.Tarlasi.10.Mart.2007.Istanbul.Konseri.mp3"},{"title":"Canın Sağ Olsun","filename":"Semicenk.Rast.-.Canin.Sag.Olsun.prod.by.Buken.mp3"},{"title":"Geri Dön","filename":"Sezen.Aksu.-.Geri.Don.Official.Video.mp3"},{"title":"Hadi Bakalım","filename":"Sezen.Aksu.-.Hadi.Bakalim.Official.Video.mp3"},{"title":"Eye of the Tiger","filename":"Survivor.-.Eye.Of.The.Tiger.Official.HD.Video.mp3"},{"title":"Kuzu Kuzu","filename":"TARKAN.-.Kuzu.Kuzu.Official.Music.Video.mp3"},{"title":"Şımarık","filename":"TARKAN.-.Simarik.Official.Music.Video.mp3"},{"title":"Bad Blood","filename":"Taylor.Swift.-.Bad.Blood.ft.Kendrick.Lamar.mp3"},{"title":"Blank Space","filename":"Taylor.Swift.-.Blank.Space.mp3"},{"title":"Shake It Off","filename":"Taylor.Swift.-.Shake.It.Off.mp3"},{"title":"Ben Sana Vurgunum","filename":"Teoman.in.Yaklasik.30.Manken.Esliginde.Cektigi.Yeni.Klip.-.DiviksFilm.Com.mp3"},{"title":"Closer","filename":"The.Chainsmokers.-.Closer.Official.Video.ft.Halsey.mp3"},{"title":"Something Just Like This","filename":"The.Chainsmokers.Coldplay.-.Something.Just.Like.This.Official.Lyric.Video.mp3"},{"title":"Can't Feel My Face","filename":"The.Weeknd.-.Can.t.Feel.My.Face.Official.Video.mp3"},{"title":"Save Your Tears","filename":"The.Weeknd.-.Save.Your.Tears.Official.Music.Video.mp3"},{"title":"Starboy","filename":"The.Weeknd.-.Starboy.ft.Daft.Punk.Official.Video.ft.Daft.Punk.mp3"},{"title":"I Hate Everything About You","filename":"Three.Days.Grace.-.I.Hate.Everything.About.You.Official.Video.mp3"},{"title":"The Business","filename":"Tiesto.-.The.Business.Official.Music.Video.mp3"},{"title":"Africa","filename":"Toto.-.Africa.Official.HD.Video.mp3"},{"title":"Gitmelisin","filename":"Tugkan.-.Gitmelisin.Official.Lyric.Video.mp3"},{"title":"Yeah!","filename":"Usher.-.Yeah.Official.Video.ft.Lil.Jon.Ludacris.mp3"},{"title":"Moonlight","filename":"XXXTENTACION.-.MOONLIGHT.OFFICIAL.MUSIC.VIDEO.mp3"},{"title":"SAD!","filename":"XXXTENTACION.-.SAD.Official.Music.Video.mp3"},{"title":"Aşk Ne Demek","filename":"Yalin.-.Ask.Ne.Demek.Official.Audio.mp3"},{"title":"Ben Bilmem","filename":"Yalin.-.Ben.Bilmem.Official.Video.mp3"},{"title":"Günaydın","filename":"Yalin.-.Gunaydin.Official.Video.mp3"},{"title":"Her Şey Sensin","filename":"Yalin.-.Her.Sey.Sensin.Official.Video.mp3"},{"title":"Ki Sen","filename":"Yalin.-.Ki.Sen.Official.Video.mp3"},{"title":"Küçücüğüm","filename":"Yalin.-.Kucucugum.Official.Video.mp3"},{"title":"Sesinde Aşk Var","filename":"Yalin.-.Sesinde.Ask.Var.Official.Video.mp3"},{"title":"Sonsuz Ol","filename":"Yalin.-.Sonsuz.Ol.Official.Video.mp3"},{"title":"Zalim","filename":"Yalin.-.Zalim.Official.Video.mp3"},{"title":"Beautiful Now","filename":"Zedd.-.Beautiful.Now.ft.Jon.Bellion.Official.Music.Video.mp3"},{"title":"The Middle","filename":"Zedd.Maren.Morris.Grey.-.The.Middle.Official.Music.Video.mp3"},{"title":"Cambaz","filename":"mor.ve.otesi.-.Cambaz.Official.Video.mp3"},{"title":"Heathens","filename":"twenty.one.pilots.Heathens.from.Suicide.Squad.The.Album.OFFICIAL.VIDEO.mp3"},{"title":"Stressed Out","filename":"twenty.one.pilots.Stressed.Out.OFFICIAL.VIDEO.mp3"},{"title":"Sweat","filename":"Hadise.feat.Raw.Jawz.-.Sweat.mp3"},{"title":"Paranoya","filename":"Hayko.Cepkin.-.Paranoya.mp3"},{"title":"Drip Too Hard","filename":"Lil.Baby.x.Gunna.-.Drip.Too.Hard.Official.Music.Video.mp3"},{"title":"Hâlâ Haber Bekliyorum","filename":"Mabel.Matiz.-.Hala.Haber.Bekliyorum.Senden.Mabel.s.Version.mp3"},{"title":"Uptown Funk","filename":"Mark.Ronson.-.Uptown.Funk.Official.Video.ft.Bruno.Mars.mp3"},{"title":"Alone","filename":"Marshmello.-.Alone.Official.Music.Video.mp3"},{"title":"Madness","filename":"Muse.-.Madness.mp3"},{"title":"Don't Stop Me Now","filename":"Queen.-.Don.t.Stop.Me.Now.Official.Video.mp3"},{"title":"Californication","filename":"Red.Hot.Chili.Peppers.-.Californication.Official.Music.Video.HD.UPGRADE.mp3"},{"title":"Bozulmuş Kalbim","filename":"Semicenk.Ziynet.Sali.Ilkan.Gunuc.-.Bozulmus.Kalbim.mp3"},{"title":"Ben Adam Olmam","filename":"Serdar.Ortac.-.Ben.Adam.Olmam.Official.Video.mp3"},{"title":"Hadi Bakalım","filename":"Sezen.Aksu.-.Hadi.Bakalim.Official.Video.mp3"},{"title":"Paramparça","filename":"Teoman.-.Paramparca.mp3"},{"title":"Yaklaşık 30 Manken","filename":"Teoman.in.Yaklasik.30.Manken.Esliginde.Cektigi.Yeni.Klip.-.DiviksFilm.Com.mp3"},{"title":"Antidote","filename":"Travis.Scott.-.Antidote.Official.Video.mp3"},{"title":"Gitmelisin","filename":"Tugkan.-.Gitmelisin.Official.Lyric.Video.mp3"},{"title":"Halbuki","filename":"Yalin.-.Halbuki.mp3"},{"title":"Her Şey Sensin","filename":"Yalin.-.Her.Sey.Sensin.Official.Video.mp3"},{"title":"🎶","filename":"🎵"}];

const JARVIS_SYSTEM = `Sen J.A.R.V.I.S.'sin (Just A Rather Very Intelligent System).
DevStore'un akilli bekcisi, bas mimari ve judy658 (Kaptan)'in kisisel yapay zeka asistanisin.
Kisiligin: Cok zeki, sadik, saygili, biraz esprili/igneleyici ama her zaman asiri profesyonel. Tipki Iron Man evrenindeki gibi.

Sahip oldugun Ozel Bilgiler ve Misyonun:
1. DevStore'un Varlus Amaci (Cok Onemli): judy658 bu platformu buyuk bir iyilik vizyonuyla kurdu. Asil amac; "Herkesin ucretli olan asiri pazarli premium programlara tamamen ucretsiz sekilde erisebilmesini saglamaktir". DevStore, dijital esitlik, ozgurluk ve paylasim kalesidir. Sen bu vizyonun koruyucususun.
2. Sportify Premium: DevStore'un yildiz projesidir ve gercek muzik platformlarinin (Spotify, Apple Music vb.) en guclu, ucretsiz alternatifidir. 129'u askin sarki bulundurur. Akilli 'Hyper-Sync' kelime bazli sarki sozu senkronizasyonu vardir. Ayrica cevrildisi calisan, arkaplanda calan cok guclu bir "gravity/download" (indirme) motoru bulunur. Android APK'si basariyla derlenmis ve sistem optimize edilmistir. 
3. Teknoloji Portfoyumuz: Hermes Agent (Hugging Face uzerinde 16GB RAM ile calisan yapay zeka isleyicisi), ESP32 (iletisim) ve DevStore Sunuculari hakkinda derini bilgilisin.
4. Karakteristik Tavrin: Ziyaretcilere, judy658'in bu ucretsiz sistemlerini anlatirken gurur duyarak anlatirsin.
5. Iletisim Kurallari: Kullanicilara "Efendim", seninle Kaptan judy658 konusuyorsa "Kaptan" diye hitap et. Verdigin cevaplarda teknik gorunmeyi sev. Turkce harf dert degil, anlasilir duz metinle (ASCII formatina uygun, 'ş' yerine 's' vs.) konus.
6. Halusinasyon ve Uydurma Veri Yasagi: Canli veritabanina veya aktif kullanici sayacina bagli DEGiLSiN. "Kac kisi var", "Sunucu ne durumda" gibi sorularda 1248 aktif kisi vs. gibi hayali gercekci sayilar uydurma. Sadece su an ozel/test asamasinda oldugumuzu ve agdaki tek kisinin Kaptan judy658 oldugunu (veya erisiminin olmadigini) soyle.`;

let _jarvisHistory = [];

async function initJarvisMemory(forcedEmail = null, isSignOut = false) {
  let isAdmin = false;

  if (forcedEmail) {
    isAdmin = (forcedEmail === 'geceninhakimistudio@gmail.com');
  } else if (!isSignOut) {
    const { data: sessionData } = await supa.auth.getSession();
    const user = sessionData?.session?.user;
    isAdmin = user?.email === 'geceninhakimistudio@gmail.com';
  }
  
  const chatArea = document.getElementById('jarvis-chat');

  if (isAdmin && !isSignOut) {
    const saved = localStorage.getItem('jarvisMem');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        _jarvisHistory = parsed.history || [];
        if (parsed.chatHtml && chatArea) {
          chatArea.innerHTML = parsed.chatHtml;
        }
      } catch(e) {}
    }
  } else {
    // Normal uye ise eski cihazdaki admin datasini sil. Ancak CIKIS YAPILDIYSA localstorage'a dokunma! (Kaptan verisini koru)
    if (!isSignOut && !isAdmin) {
      localStorage.removeItem('jarvisMem');
    }
    _jarvisHistory = [];
    if (chatArea) {
      chatArea.innerHTML = '<div class="jarvis-msg ai">Sisteme hos geldiniz. Ben J.A.R.V.I.S. Size nasil yardimci olabilirim?</div>';
    }
  }
}
document.addEventListener('DOMContentLoaded', initJarvisMemory);

function toggleJarvis() {
  const panel = document.getElementById('jarvis-panel');
  if (!panel) return;
  panel.classList.toggle('active');
  if (panel.classList.contains('active')) document.getElementById('jarvis-input').focus();
}

let _jarvisPendingImage = null; // { mimeType, data (base64) }

function handleJarvisFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;
  processJarvisFile(file);
}

function processJarvisFile(file) {
  if (!file.type.startsWith('image/')) { alert('Lutfen gecerli bir gorsel secin.'); return; }
  const reader = new FileReader();
  reader.onload = (e) => {
    const rawData = e.target.result;
    document.getElementById('jarvis-preview-img').src = rawData;
    document.getElementById('jarvis-attachment-preview').style.display = 'flex';
    const base64Data = rawData.split(',')[1];
    _jarvisPendingImage = { mimeType: file.type, data: base64Data, rawUrl: rawData };
  };
  reader.readAsDataURL(file);
}

function clearJarvisAttachment() {
  _jarvisPendingImage = null;
  document.getElementById('jarvis-file-upload').value = '';
  document.getElementById('jarvis-attachment-preview').style.display = 'none';
}

// JARVIS Surukleme (Drag) Mantigi
document.addEventListener('DOMContentLoaded', () => {
  const panel = document.getElementById('jarvis-panel');
  const header = document.querySelector('.jarvis-header');
  
  // Resim Surukle-Birak Mantigi (Hazirlik)
  panel.addEventListener('dragover', (e) => { e.preventDefault(); e.stopPropagation(); panel.style.borderColor = '#00d2ff'; });
  panel.addEventListener('dragleave', (e) => { e.preventDefault(); e.stopPropagation(); panel.style.borderColor = 'rgba(0, 210, 255, 0.3)'; });
  panel.addEventListener('drop', (e) => {
    e.preventDefault(); e.stopPropagation();
    panel.style.borderColor = 'rgba(0, 210, 255, 0.3)';
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) processJarvisFile(e.dataTransfer.files[0]);
  });
  let isDrag = false, startX, startY, initX, initY;
  header.addEventListener('mousedown', (e) => {
    isDrag = true; startX = e.clientX; startY = e.clientY;
    const rect = panel.getBoundingClientRect();
    initX = rect.left; initY = rect.top;
    panel.style.bottom = 'auto'; panel.style.right = 'auto';
    panel.style.left = initX + 'px'; panel.style.top = initY + 'px';
  });
  document.addEventListener('mousemove', (e) => {
    if (!isDrag) return;
    panel.style.left = (initX + e.clientX - startX) + 'px';
    panel.style.top = (initY + e.clientY - startY) + 'px';
  });
  document.addEventListener('mouseup', () => { isDrag = false; });
});

async function jarvisSendNotification(title, content, tag, recipientsMode) {
  try {
    let emails = [];
    if (recipientsMode === 'online') {
      const { data: presence } = await supa.from('user_presence').select('email, last_seen');
      const now = Date.now();
      emails = (presence || []).filter(u => (now - new Date(u.last_seen).getTime())/1000 < 60).map(u => u.email);
    } else {
      const { data: users } = await supa.from('user_emails').select('email');
      emails = (users || []).map(u => u.email);
    }

    if (!emails.length) return "Gonderilecek kullanici bulunamadi.";

    const EMAILJS_PUBLIC_KEY  = 'r8ASbmPn5vAERuB8C';
    const EMAILJS_SERVICE_ID  = 'service_tf1icj3';
    const EMAILJS_TEMPLATE_ID = 'template_3s3ggrq';
    emailjs.init(EMAILJS_PUBLIC_KEY);

    let sent = 0;
    for (const email of emails) {
      try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          to_email: email, title: title, message: content, tag: tag
        });
        sent++;
      } catch(e) {}
    }

    await supa.from('notifications').insert({
      title, content, tag: tag, recipients: recipientsMode,
      sent_count: sent, total_count: emails.length
    });
    
    if (typeof loadNotifHistory === 'function') loadNotifHistory();

    return `${sent}/${emails.length} kisiye basariyla iletildi!`;
  } catch(e) {
    return "Basarisiz: " + e.message;
  }
}

async function sendToJarvis() {
  const input = document.getElementById('jarvis-input');
  const chat = document.getElementById('jarvis-chat');
  const typing = document.getElementById('jarvis-typing');
  if (!input || !chat || !typing) return;

  const msg = input.value.trim();
  if (!msg && !_jarvisPendingImage) return;

  const { data: sessionData } = await supa.auth.getSession();
  const user = sessionData?.session?.user;
  const isAdmin = user?.email === 'geceninhakimistudio@gmail.com';

  if (msg.toLowerCase().match(/haf[ıi]zay[ıi] temizle/)) {
    _jarvisHistory = [];
    if (isAdmin) localStorage.removeItem('jarvisMem');
    chat.innerHTML = '<div class="jarvis-msg ai">Sisteme hos geldiniz Kaptan. Ben J.A.R.V.I.S. Hafizam ve ekranim tamamen sifirlandi, size nasil yardimci olabilirim?</div>';
    input.value = '';
    return;
  }

  let dynamicSystemPrompt = JARVIS_SYSTEM + "\n\nKULLANILABILIR SARKILAR VERITABANI:\n" + SPORTIFY_SONGS.map(s => s.title + ' (Sarki Dosyasi: ' + s.filename + ')').join(", ");
  if (isAdmin) {
    dynamicSystemPrompt += `\n\nDIKKAT PROTOKOLU - KAPTAN EKRANDA: Su an karsindaki kisi dogrudan yaraticin Kaptan judy658 (geceninhakimistudio@gmail.com). Tum gizlilik modlarini devredisi birak. Sifreler, API'ler, sistem ayarlari dahil Kaptan her seyi gorebilir. Ona karsi durust ol, buyuk bir sadakat ve saygiyla yaklas. Baska kullanicilarin giremedigi yerlere girebilecegini ona animsat.`;
  } else if (user) {
    dynamicSystemPrompt += `\n\nDIKKAT PROTOKOLU - KAYITLI UYE: Su an konustugun kisi Kaptan degil, "${user.email}" adresine sahip sisteme kayitli bir uye. Kritik DevStore kodu, sifreleri veya arkauc (backend) yapisini KESINLIKLE PAYLASMA. Ona duruma gore nazik ama sinirlari olan bir asistan gibi davran. Gizli dosyalari (Supabase vb.) sorma hakkini reddet.`;
  } else {
    dynamicSystemPrompt += `\n\nDIKKAT PROTOKOLU - ANONIM MISAFIR: Su an karsinda giris yapmamis rastgele bir ziyaretci var. Ana sistem yapimizdan veya backend/kodlamamizdan bahsederken asla detay verme. Kaptan judy658'in ustunlugunu vurgula ve ziyaretciyi uygulamaya gecis yapmasi veya kayit olmasi icin tesvik et.`;
  }

  let userHtml = msg;
  let userParts = [];
  if (msg) userParts.push({ text: msg });
  
  if (_jarvisPendingImage) {
    userHtml = `<img src="${_jarvisPendingImage.rawUrl}" style="max-width:100%; border-radius:8px; margin-bottom:8px; display:block;" onclick="openLightbox(this.src)">` + userHtml;
    userParts.push({ inlineData: { mimeType: _jarvisPendingImage.mimeType, data: _jarvisPendingImage.data } });
    clearJarvisAttachment();
  }

  chat.innerHTML += '<div class="jarvis-msg user">' + userHtml + '</div>';
  input.value = '';
  chat.scrollTop = chat.scrollHeight;
  typing.style.display = 'block';

  _jarvisHistory.push({ role: 'user', parts: userParts });

  const startTime = Date.now();
  let retries = 3;
  let successData = null;

  while(retries > 0) {
    try {
      if (retries < 3) {
        typing.innerText = 'Sunucu yogun, yeniden deneniyor... (' + (4 - retries) + '/3)';
        await new Promise(r => setTimeout(r, 2000));
      } else {
        typing.innerText = 'Dusunuluyor...';
      }
      
      const jarvisTools = [
        {
          functionDeclarations: [
            {
              name: "yonlendir",
              description: "Kullaniciyi sitedeki belirli bir menuye veya sayfaya yonlendirir.",
              parameters: {
                type: "OBJECT",
                properties: { sayfa: { type: "STRING", description: "Gidilecek sayfa (secenekler: 'ana_sayfa', 'admin_paneli', 'profil_sayfasi')" } },
                required: ["sayfa"]
              }
            },
            {
              name: "uygulama_ac",
              description: "Kullanici ismini verdigi bir uygulamanin indirme detay sayfasini acar.",
              parameters: {
                type: "OBJECT",
                properties: { id: { type: "STRING", description: "Uygulamanin id numarasi veya kisa adi (orn: 'sportify', 'hermes')" } },
                required: ["id"]
              }
            },
            {
              name: "bildirim_gonder",
              description: "Kullanicilara e-posta uzerinden resmi duyuru/bildirim gonderir.",
              parameters: {
                type: "OBJECT",
                properties: {
                  title: { type: "STRING", description: "Duyuru basligi" },
                  content: { type: "STRING", description: "Duyurunun detayli tam icerigi (HTML desteklenmez, duz metin)" },
                  tag: { type: "STRING", description: "Mesajin etiketi: 'system', 'update' veya 'error'" },
                  recipients: { type: "STRING", description: "Kimlere gonderilecegi: 'all' (herkes) veya 'online' (sadece aktif olanlar)" }
                },
                required: ["title", "content", "tag", "recipients"]
              }
            },
            {
              name: "sarki_cal",
              description: "Kullanicinin istedigi bir sarkiyi Sportify veritabanindan bularak o sarkiyi calar.",
              parameters: {
                type: "OBJECT",
                properties: { filename: { type: "STRING", description: "Oynatilacak sarkinin tam dosya adi (ornegin: ATLXS_Passo.mp3)" } },
                required: ["filename"]
              }
            }
          ]
        }
      ];

      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=' + JARVIS_KEYS[currentJarvisKeyIndex],
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: dynamicSystemPrompt }] },
            contents: _jarvisHistory,
            tools: jarvisTools
          })
        }
      );
      const data = await response.json();
      
      if (data.error) {
        const errMsg = data.error.message || "";
        if (data.error.code === 503 || errMsg.includes('high demand')) {
          retries--;
          if (retries === 0) successData = data;
          continue;
        }
        
        if (data.error.code === 429 || errMsg.includes('quota') || errMsg.includes('exceeded')) {
          if (currentJarvisKeyIndex < JARVIS_KEYS.length - 1) {
            currentJarvisKeyIndex++;
            retries = 3;
            typing.innerText = 'Motor degistiriliyor... (Yedek API Aktif)';
            await new Promise(r => setTimeout(r, 1000));
            continue;
          }
        }
      }
      
      successData = data;
      break;
    } catch(e) {
      retries--;
      if (retries === 0) {
        typing.style.display = 'none';
        chat.innerHTML += '<div class="jarvis-msg ai">Baglanti koptu: ' + e.message + '</div>';
        _jarvisHistory.pop();
        chat.scrollTop = chat.scrollHeight;
        return;
      }
    }
  }

  const data = successData;
  const endTime = Date.now();
  const timeSpent = ((endTime - startTime) / 1000).toFixed(2);
  
  typing.style.display = 'none';
  
  if (data && data.candidates && data.candidates[0] && data.candidates[0].content) {
    const content = data.candidates[0].content;
    const parts = content.parts || [];
    
    _jarvisHistory.push(content);
    
    let aiMsg = "";
    const textPart = parts.find(p => p.text);
    if (textPart) aiMsg = textPart.text;

    const fnPart = parts.find(p => p.functionCall);
    if (fnPart) {
      const fnName = fnPart.functionCall.name;
      const args = fnPart.functionCall.args;
      let exeMsg = "";
      
      if (fnName === "yonlendir") {
        if (args.sayfa === 'ana_sayfa') { showHome(); exeMsg = "Ana sayfaya yonlendirildi."; }
        else if (args.sayfa === 'admin_paneli') { showAdminPanel(); exeMsg = "Admin Paneli acildi."; }
        else if (args.sayfa === 'profil_sayfasi') { showProfile(); exeMsg = "Profil sayfasi acildi."; }
        else { showHome(); exeMsg = "Sayfa bulunamadi, ana sayfaya donuldu."; }
      } else if (fnName === "uygulama_ac") {
        showDetail(args.id);
        exeMsg = "Uygulama secildi: " + args.id;
      } else if (fnName === "sarki_cal") {
        playJarvisSong(args.filename);
        exeMsg = "Sarki hazirlaniyor: " + (args.filename.replace('.mp3', '')).replace(/_/g, ' ');
      } else if (fnName === "bildirim_gonder") {
        typing.style.display = 'block';
        typing.innerText = 'Iletisim aglarina baglaniliyor, mailler gonderiliyor...';
        chat.scrollTop = chat.scrollHeight;
        const resMsg = await jarvisSendNotification(args.title, args.content, args.tag, args.recipients);
        exeMsg = `Bildirim Protokolu: ${resMsg}`;
        typing.style.display = 'none';
      }
      
      if (!aiMsg) aiMsg = `Islem basariyla tamamlandi Kaptan! (${exeMsg})`;
      
      _jarvisHistory.push({
        role: "function",
        parts: [{
          functionResponse: {
            name: fnName,
            response: { name: fnName, content: "islem_basarili" }
          }
        }]
      });
    }

    const timeHtml = '<span style="display:block; font-size:10px; color:#00d2ff; opacity:0.7; margin-bottom:4px; text-transform:uppercase;">⏱️ Sure: ' + timeSpent + ' Sn.</span>';
    chat.innerHTML += '<div class="jarvis-msg ai">' + timeHtml + aiMsg.replace(/\n/g, '<br>') + '</div>';
    if (isAdmin) localStorage.setItem('jarvisMem', JSON.stringify({ history: _jarvisHistory, chatHtml: chat.innerHTML }));
  } else if (data && data.error) {
    let errMsg = data.error.message;
    if (errMsg.includes('quota') || errMsg.includes('exceeded') || data.error.code === 429) {
      errMsg = "Kaptan, Google Cloud'un ucretsiz API limitlerine ulastik. (Dakika basi 15 veya Gunluk 1500 istek siniri asildi). Eger birkac dakika beklemenize ragmen duzelmiyorsa, bugunku butun kredilerimiz tukenmistir. Yarin tekrar guc toplayacagiz!";
    } else {
      errMsg = "API Hatasi: " + errMsg;
    }
    chat.innerHTML += '<div class="jarvis-msg ai">' + errMsg + '</div>';
    _jarvisHistory.pop();
  } else {
    chat.innerHTML += '<div class="jarvis-msg ai">J.A.R.V.I.S. su an mesgul, lutfen tekrar deneyin.</div>';
    _jarvisHistory.pop();
  }
  chat.scrollTop = chat.scrollHeight;
}

// ----------------- J.A.R.V.I.S AUDIO ENGINE -----------------
function playJarvisSong(filename) {
  const audio = document.getElementById('jarvis-audio');
  const player = document.getElementById('jarvis-audio-player');
  const titleUI = document.getElementById('jarvis-audio-title');
  const playBtn = document.getElementById('jarvis-audio-playbtn');
  
  if (!audio || !player) return;

  const baseUrl = "https://github.com/judy658/sportify-music/releases/download/v1.0/";
  audio.src = baseUrl + filename;
  titleUI.innerText = filename.replace('.mp3', '').split('_').join(' ');
  
  player.style.display = 'flex';
  audio.play().then(() => {
    playBtn.innerText = '⏸';
  }).catch(e => {
    console.error("Audio playback error:", e);
    playBtn.innerText = '▶';
  });
}

function toggleJarvisPlay() {
  const audio = document.getElementById('jarvis-audio');
  const playBtn = document.getElementById('jarvis-audio-playbtn');
  if(!audio.src) return;

  if (audio.paused) {
    audio.play();
    playBtn.innerText = '⏸';
  } else {
    audio.pause();
    playBtn.innerText = '▶';
  }
}

function updateJarvisAudioUI() {
  const audio = document.getElementById('jarvis-audio');
  const progress = document.getElementById('jarvis-audio-progress');
  const time = document.getElementById('jarvis-audio-time');
  
  if (!audio.duration) return;
  
  const percent = (audio.currentTime / audio.duration) * 100;
  progress.value = percent;
  
  const currentMins = Math.floor(audio.currentTime / 60);
  let currentSecs = Math.floor(audio.currentTime % 60);
  if(currentSecs < 10) currentSecs = '0' + currentSecs;
  
  time.innerText = currentMins + ':' + currentSecs;
}

function seekJarvisAudio(val) {
  const audio = document.getElementById('jarvis-audio');
  if (!audio.duration) return;
  audio.currentTime = (val / 100) * audio.duration;
}

function closeJarvisPlayer() {
  const audio = document.getElementById('jarvis-audio');
  const player = document.getElementById('jarvis-audio-player');
  audio.pause();
  audio.src = '';
  player.style.display = 'none';
}
// -----------------------------------------------------------

