extends Control

# ─────────────────────────────────────────────────────────────
#  VERSİYON KONTROL
# ─────────────────────────────────────────────────────────────
const CURRENT_VERSION  := 18
const VERSION_URL      := "https://judy658.github.io/judy658-devstore/versions.json"
const APP_KEY          := "sportify"

var _version_http: HTTPRequest

func _check_version() -> void:
	_version_http = HTTPRequest.new()
	add_child(_version_http)
	_version_http.request_completed.connect(_on_version_checked)
	var err = _version_http.request(VERSION_URL)
	if err != OK:
		_start_app()  # İnternete bağlanamadı, devam et

func _on_version_checked(_result, code, _headers, body) -> void:
	_version_http.queue_free()
	if code != 200:
		_start_app()
		return
	var json = JSON.new()
	if json.parse(body.get_string_from_utf8()) != OK:
		_start_app()
		return
	var data = json.get_data()
	var app = data["apps"][APP_KEY]
	var min_ver: int = int(app["min_version"])
	var force: bool = app["force_update"]
	var dl_url: String = app["download_url"]
	if force and CURRENT_VERSION < min_ver:
		_show_force_update(dl_url)
	else:
		_start_app()

func _show_force_update(_dl_url: String) -> void:
	# Tüm ekranı kapla
	var overlay := ColorRect.new()
	overlay.color = Color(0.063, 0.063, 0.063, 1.0)
	overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	overlay.z_index = 9999
	add_child(overlay)

	# Ortalayıcı container
	var center := CenterContainer.new()
	center.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	overlay.add_child(center)

	var box := VBoxContainer.new()
	box.custom_minimum_size = Vector2(360, 0)
	box.alignment = BoxContainer.ALIGNMENT_CENTER
	center.add_child(box)

	var icon := Label.new()
	icon.text = "🎵"
	icon.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	icon.add_theme_font_size_override("font_size", 72)
	box.add_child(icon)

	var sp1 := Control.new(); sp1.custom_minimum_size = Vector2(0, 16); box.add_child(sp1)

	var title := Label.new()
	title.text = "Güncelleme Gerekli"
	title.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title.add_theme_font_size_override("font_size", 28)
	title.add_theme_color_override("font_color", Color(0.941, 0.929, 0.910))
	box.add_child(title)

	var sp2 := Control.new(); sp2.custom_minimum_size = Vector2(0, 12); box.add_child(sp2)

	var desc := Label.new()
	desc.text = "Sportify'ın yeni bir sürümü yayınlandı.\nDevam etmek için güncellemeniz gerekiyor."
	desc.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	desc.add_theme_color_override("font_color", Color(0.420, 0.408, 0.502))
	desc.add_theme_font_size_override("font_size", 15)
	desc.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	box.add_child(desc)

	var sp3 := Control.new(); sp3.custom_minimum_size = Vector2(0, 28); box.add_child(sp3)

	var btn := _make_btn()
	btn.text = "⬇  Yeni Sürümü İndir"
	btn.custom_minimum_size = Vector2(300, 56)
	btn.add_theme_font_size_override("font_size", 18)
	btn.pressed.connect(func(): OS.shell_open("https://judy658.github.io/judy658-devstore/"))
	box.add_child(btn)

func _start_app() -> void:
	# Kaydedilmiş oturum var mı?
	var saved := _load_auth()
	if saved.size() == 2:
		# Token doğrulaması yapma, direkt geç (offline mod desteği)
		authed_user  = saved[0]
		authed_token = saved[1]
		_build_ui()
		_setup_audio()
		_load_playlists()
		_load_favorites()
		_load_downloads()
		_render_songs()
		_start_presence()
	else:
		_show_login_screen()

# ─────────────────────────────────────────────────────────────
#  SABITLER
# ─────────────────────────────────────────────────────────────
const BASE_URL    := "https://github.com/judy658/sportify-music/releases/download/v1.0/"
const REPO_URLS: Dictionary = {
	"repo_1": "https://github.com/judy658/sportify-music/releases/download/v1.0/",
	"repo_2": "https://github.com/judy658/sportify-music2/releases/download/v1.0/",
}
const FORMSPREE_URL     := "https://formspree.io/f/xnjgjwqd"

# Supabase
const SUPABASE_URL      := "https://jnuckqaiutmkiquptvzu.supabase.co"
const SUPABASE_ANON_KEY := "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpudWNrcWFpdXRta2lxdXB0dnp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0MDgzMTAsImV4cCI6MjA4ODk4NDMxMH0.sP_FoTrYOFWiIS7PdaFYtR1JbP5vGf_KLgc_jh7zhZY"

const COLOR_BG      := Color(0.063, 0.063, 0.063, 1.0)
const COLOR_CARD    := Color(0.100, 0.100, 0.100, 1.0)
const COLOR_CARD_ON := Color(0.150, 0.150, 0.150, 1.0)
const COLOR_ACCENT  := Color(0.114, 0.725, 0.329, 1.0)
const COLOR_ACCENT2 := Color(0.114, 0.725, 0.329, 1.0)
const COLOR_ACCENT3 := Color(0.114, 0.725, 0.329, 1.0)
const COLOR_TEXT    := Color(1.000, 1.000, 1.000, 1.0)
const COLOR_MUTED   := Color(0.627, 0.627, 0.627, 1.0)
const COLOR_BORDER  := Color(1.000, 1.000, 1.000, 0.10)

const RAW_SONGS: Array = [
	# [dosya, isim, sanatci]
	["ATLXS_Passo.mp3",                                     "Passo",                    "ATLXS"],
	["Aaron_Dancin.mp3",                                    "Aaron_Dancin",             "Aaron Smith"],
	["Abdurrahman_Kabe.mp3",                                "Kabede hacılara",          "Abdurrahman Önül"],
	["Affet.mp3",                                           "Affet",                    "Müslüm gürses"],
	["Alexander_Fairytale.mp3",                             "Fairytale",                "Alexander Rybak"],
	["Alla_Beni_Pulla_Beni.mp3",                            "Alla Beni Pulla Beni",     "Barıl manço"],
	["Altaylardan_Tunaya.mp3",                              "Altaylardan Tunaya",       "Ali aksoy"],
	["Anlamazdin.mp3",                                      "Anlamazdin",               "Ayla dikmen"],
	["Audiomachine_Guardians.mp3",                          "Guardians",                "Audiomachine"],
	["Baris_Derinden.mp3",                                  "Derinden",                 "Baris diri"],
	["Beggin_Slowed.mp3",                                   "Beggin (Slowed)",          "Maneskin"],
	["Boney_Rasputin.mp3",                                  "Rasputin",                 "Boney M"],
	["Bu_Havada.mp3",                                       "Bu Havada gidilmez",       "Mabuş baba"],
	["Cagatay_Bizim.mp3",                                   "Bizim hikaye",             "Cagatay Ulusoy"],
	["Cem_Ceviz.mp3",                                       "Ceviz Agaci",              "Cem Karaca"],
	["Cem_Tamirci.mp3",                                     "Tamirci cirağı",           "Cem Karaca"],
	["Dark_Night.mp3",                                      "Dark Night",               "Savlonic"],
	["David_Daylight.mp3",                                  "Daylight",                 "David Kushner"],
	["Dre_Episode.mp3",                                     "Episode",                  "Dr. Dre"],
	["Etxrnall_Love.mp3",                                   "extnall Love",             "Etxrnall"],
	["Evgeny_Valse.mp3",                                    "Valse",                    "Evgeny Grinko"],
	["Farazi_Dobro.mp3",                                    "Dobro",                    "Farazi"],
	["Fazil_Insan.mp3",                                     "Insan insan",              "Fazil Say"],
	["Funda_Caresizim.mp3",                                 "Caresizim",                "Funda Arar"],
	["Gala_Freed.mp3",                                      "Freed from Desire",        "Gala"],
	["Gangsta_Paradise.mp3",                                "Gangsta's Paradise",       "Coolio"],
	["Gangsta_Paradise2.mp3",                               "Gangsta's Paradise v2",    "Coolio"],
	["Grup_Bella.mp3",                                      "Grup Bella",               "Grup Bella"],
	["Guzin_Baha.mp3",                                      "Gençlik başımda duman",    "Guzin ile baha"],
	["Heart_Courage.mp3",                                   "Courage",                  "Superchick"],
	["Huznu_Hecem.mp3",                                     "Huznu Hecem",              "Yener çevik"],
	["Imagine_Believer.mp3",                                "Believer",                 "Imagine Dragons"],
	["Imanbek_Belly.mp3",                                   "Belly Dancer",             "Imanbek & BYOR"],
	["Indila_Danse.mp3",                                    "Danse",                    "Indila"],
	["Indila_Danse2.mp3",                                   "Danse v2",                 "Indila"],
	["Kardan_Aydinlik.mp3",                                 "Kardan Aydinlik",          "Teymullah"],
	["Khamzat_Chimaev.mp3",                                 "Khamzat Chimaev",          "bilinmiyor"],
	["Lady_Bloody.mp3",                                     "Bloody Mary",              "Lady Gaga"],
	["Maneskin_Beggin.mp3",                                 "Beggin",                   "Maneskin"],
	["Manga_Kadin.mp3",                                     "bir kadin çizeceksin",     "Manga"],
	["Manus_Baba.mp3",                                      "karanfil kokuyor cigaram", "Manus baba"],
	["Matushka_Ultrafunk.mp3",                              "MAtushka Ultrafunk",       "Matushka"],
	["Mesela_Yani.mp3",                                     "Mesela Yani",              "Kayra"],
	["Model_Pembe.mp3",                                     "Pembe mezarlık",           "Model"],
	["Modern_Cheri.mp3",                                    "Cheri Cheri Lady",         "Modern Talking"],
	["Mt_Bozkurt.mp3",                                      "Bozkurt ordusu",           "Mt"],
	["Nada_Nada.mp3",                                       "Nada Nada",                "Jmilton"],
	["Nilufer.mp3",                                         "Nilufer",                  "Müslüm gürses"],
	["Nilufer_Caddelerde.mp3",                              "Caddelerde rüzgar",        "dobadali"],
	["Oguzhan_Ayy.mp3",                                     "Ayy ben hala rüyada",      "Oguzhan Koc"],
	["Orange_Yasidi.mp3",                                   "Ya sidi",                  "orange Blossom"],
	["Plevne_Marsi.mp3",                                    "Plevne Marsi",             "Mehter Marsi"],
	["Rammstein_Sonne.mp3",                                 "Sonne_slowed",             "Rammstein"],
	["Savai_Dark.mp3",                                      "savai_Dark_life",          "Savai"],
	["Sebnem_Mayin.mp3",                                    "Mayin_tarlası",            "Sebnem Ferah"],
	["Selin_Bana.mp3",                                      "Birde bana sor",           "Selin"],
	["Star_Wars.mp3",                                       "Star Wars Theme",          "John Williams"],
	["Starset_Demons.mp3",                                  "My Demons",                "Starset"],
	["Sunstroke_Runaway.mp3",                               "Runaway",                  "Sunstroke Project"],
	["Warriyo_Mortals.mp3",                                 "Mortals",                  "Warriyo ft. Laura Brehm"],
	["Adele.-.Easy.On.Me.Official.Lyric.Video.mp3",                                                "Easy On Me",                       "Adele"],
	["Adele.-.Easy.On.Me.Official.Video.mp3",                                                       "Easy On Me (Video)",                "Adele"],
	["Alan.Walker.-.Faded.mp3",                                                                     "Faded",                             "Alan Walker"],
	["Aleyna.Tilki.-.Tanirim.Intihari.mp3",                                                         "Tanırım İntiharı",                  "Aleyna Tilki"],
	["Allame.-.Yemin.Et.feat.Joker.Official.Audio.mp3",                                             "Yemin Et",                          "Allame ft. Joker"],
	["Ask.Kitabi.mp3",                                                                              "Aşk Kitabı",                        "Athena"],
	["Athena.-.Ben.Boyleyim.mp3",                                                                   "Ben Böyleyim",                      "Athena"],
	["Avicii.-.Wake.Me.Up.Official.Video.mp3",                                                      "Wake Me Up",                        "Avicii"],
	["Ben.Fero.Anil.Piyanci.-.Siki.Dur.Official.Audio.mp3",                                        "Siki Dur",                          "Ben Fero & Anıl Piyancı"],
	["Billie.Eilish.-.bad.guy.mp3",                                                                 "bad guy",                           "Billie Eilish"],
	["Calvin.Harris.-.Summer.Official.Video.mp3",                                                   "Summer",                            "Calvin Harris"],
	["Cardi.B.-.WAP.feat.Megan.Thee.Stallion.Official.Music.Video.mp3",                            "WAP",                               "Cardi B ft. Megan Thee Stallion"],
	["Cem.Adrian.-.Cem.Adrian.-.Elbet.Bir.Gun.Bulusacagiz.Official.Lyric.Video.mp3",               "Elbet Bir Gün Buluşacağız",         "Cem Adrian"],
	["CEZA.-.Holocaust.Official.Audio.mp3",                                                         "Holocaust",                         "Ceza"],
	["CEZA.-.Med.Cezir.Official.Audio.mp3",                                                         "Med Cezir",                         "Ceza"],
	["Contra.-.Kibir.mp3",                                                                          "Kibir",                             "Contra"],
	["Drake.-.One.Dance.Lyrics.mp3",                                                                "One Dance",                         "Drake"],
	["Dua.Lipa.-.Levitating.Featuring.DaBaby.Official.Music.Video.mp3",                            "Levitating",                        "Dua Lipa ft. DaBaby"],
	["Duman.-.Seni.Kendime.Sakladim.mp3",                                                           "Seni Kendime Sakladım",             "Duman"],
	["Ebru.Yasar.Burak.Bulut.-.Affet.mp3",                                                          "Affet",                             "Ebru Yaşar & Burak Bulut"],
	["Ed.Sheeran.-.Shape.of.You.Official.Music.Video.mp3",                                          "Shape of You",                      "Ed Sheeran"],
	["Eminem.-.Without.Me.Official.Music.Video.mp3",                                                "Without Me",                        "Eminem"],
	["Ezhel.-.Geceler.mp3",                                                                         "Geceler",                           "Ezhel"],
	["Glass.Animals.-.Heat.Waves.mp3",                                                              "Heat Waves",                        "Glass Animals"],
	["Gripin.-.Yanimda.Kal.-.Alpay.a.Saygi.mp3",                                                    "Yanımda Kal",                       "Gripin"],
	["Hadise.-.Ask.Kac.Beden.Giyer.mp3",                                                            "Aşk Kaç Beden Giyer",               "Hadise"],
	["Harry.Styles.-.As.It.Was.Official.Video.mp3",                                                 "As It Was",                         "Harry Styles"],
	["Ibrahim.Tatlises.-.Etek.Sari.mp3",                                                            "Etek Sarı",                         "İbrahim Tatlıses"],
	["Imagine.Dragons.x.J.I.D.-.Enemy.from.the.series.Arcane.League.of.Legends.mp3",              "Enemy",                             "Imagine Dragons x J.I.D"],
	["Jabbar.YAK.mp3",                                                                              "YAK",                               "Jabbar"],
	["Kalan.Saglar.Senin.Olsun.mp3",                                                                "Senin Olsun",                       "Kalan Sağlar"],
	["Kendrick.Lamar.-.HUMBLE.mp3",                                                                 "HUMBLE",                            "Kendrick Lamar"],
	["Lil.Nas.X.-.MONTERO.Call.Me.By.Your.Name.Official.Video.mp3",                                "MONTERO",                           "Lil Nas X"],

	["maNga.-.Beni.Benimle.Birak.mp3",                                                              "Beni Benimle Bırak",                "maNga"],
	["maNga.-.We.Could.Be.The.Same.-.Turkey.-.Grand.Final.-.Eurovision.2010.mp3",                  "We Could Be The Same",              "maNga"],
	["Marshmello.ft.Bastille.-.Happier.Official.Music.Video.mp3",                                   "Happier",                           "Marshmello ft. Bastille"],
	["Miley.Cyrus.-.Flowers.Official.Video.mp3",                                                    "Flowers",                           "Miley Cyrus"],
	["mor.ve.otesi.-.Bir.Derdim.Var.Official.Video.mp3",                                            "Bir Derdim Var",                    "Mor ve Ötesi"],
	["Muslum.Gurses.-.Affet.mp3",                                                                   "Affet",                             "Müslüm Gürses"],

	["NewJeans.Super.Shy.Official.MV.mp3",                                                          "Super Shy",                         "NewJeans"],
	["Norm.Ender.-.Mekanin.Sahibi.mp3",                                                             "Mekanın Sahibi",                    "Norm Ender"],
	["Oguzhan.Koc.-.Hesabima.Yaziyor.Official.Video.mp3",                                           "Hesabıma Yazıyor",                  "Oğuzhan Koç"],
	["Olivia.Rodrigo.-.drivers.license.Official.Video.mp3",                                         "drivers license",                   "Olivia Rodrigo"],
	["Orhan.Gencebay-batsin.bu.dunya.mp3",                                                          "Batsın Bu Dünya",                   "Orhan Gencebay"],
	["Otonom.Piyade.-.Kapali.Kapilar.Video.mp3",                                                    "Kapalı Kapılar",                    "Otonom Piyade"],
	["Pavyon.-.Ezhel.DJ.Artz.Official.Video.mp3",                                                   "Pavyon",                            "Ezhel & DJ Artz"],
	["Pinhani.-.Ben.Nasil.Buyuk.Adam.Olucam.mp3",                                                   "Ben Nasıl Büyük Adam Olucam",       "Pinhani"],
	["Post.Malone.-.rockstar.Official.Music.Video.ft.21.Savage.mp3",                                "rockstar",                          "Post Malone ft. 21 Savage"],
	["Post.Malone.Swae.Lee.-.Sunflower.Spider-Man.Into.the.Spider-Verse.mp3",                       "Sunflower",                         "Post Malone & Swae Lee"],
	["Raks.Aga.-.Karabasan.mp3",                                                                    "Karabasan",                         "Raks Ağa"],
	["Reynmen.-.Derdim.Olsun.Official.Video.mp3",                                                   "Derdim Olsun",                      "Reynmen"],
	["Semicenk.-.Cikmaz.Bir.Sokakta.mp3",                                                           "Çıkmaz Bir Sokakta",                "Semicenk"],
	["Server.Uraz.-.Akbaba.Ziyafeti.Official.Video.mp3",                                            "Akbaba Ziyafeti",                   "Server Uraz"],
	["Seytan.Bunun.Neresinde.mp3",                                                                  "Şeytan Bunun Neresinde",            "bilinmiyor"],
	["Sezen.Aksu.-.Firuze.Official.Audio.-.Orijinal.Plak.Kayit.mp3",                                "Firuze",                            "Sezen Aksu"],
	["Stromae.-.Alors.on.danse.Official.Video.mp3",                                                 "Alors on danse",                    "Stromae"],
	["TARKAN.-.Adimi.Kalbine.Yaz.Official.Audio.mp3",                                               "Adımı Kalbine Yaz",                 "Tarkan"],
	["Taylor.Swift.-.Anti-Hero.Official.Music.Video.mp3",                                           "Anti-Hero",                         "Taylor Swift"],
	["The.Kid.LAROI.Justin.Bieber.-.STAY.Official.Video.mp3",                                       "STAY",                              "The Kid LAROI & Justin Bieber"],
	["The.Weeknd.-.Blinding.Lights.Official.Video.mp3",                                             "Blinding Lights",                   "The Weeknd"],
	["TONES.AND.I.-.DANCE.MONKEY.OFFICIAL.VIDEO.mp3",                                               "Dance Monkey",                      "Tones and I"],
	["Travis.Scott.-.SICKO.MODE.Official.Video.ft.Drake.mp3",                                       "SICKO MODE",                        "Travis Scott ft. Drake"],
	["Ufo361.-.ICH.BIN.EIN.BERLINER.mp3",                                                           "ICH BIN EIN BERLINER",              "Ufo361"],
	["What.is.a.data.center.mp3",                                                                   "What is a Data Center",             "bilinmiyor"],
	["HITLER.mp3",                                                                                  "Hitler",                            "Ado"],
	["HITLER_bass.mp3",                                                                             "Hitler (Bass Boosted)",             "Ado"],


	["ITU_Mehter_Ceddin_Deden.mp3",                                                                 "Ceddin Deden",                      "İTÜ Mehter Birimi"],
	["AKDO.Lvbel.C5.-.SUBMARINER.mp3",                                                              "SUBMARINER",                        "AKDO, Lvbel C5"],
	["Alay.Marsi.Turk.Asker.Marslari.-.Turkish.Army.Anthem.mp3",                                   "Alay Marşı",                        "Türk Asker Marşları"],
	["Amo988.-.Elini.Ver.mp3",                                                                      "Elini Ver",                         "Amo988"],
	["Atilla.Yilmaz.Gundogdu.Marsi.La.Galibe.Illallah.mp3",                                        "Gündoğdu Marşı (La Galibe İllallah)", "Atilla Yılmaz"],
	["Aykut.Closer.-MyNeck.MyBack.mp3",                                                             "My Neck My Back",                   "Aykut Closer"],
	["Limp.bizkit.-.Take.a.look.around.mp3",                                                        "Take a Look Around",                "Limp Bizkit"],
	["Enth.E.Nd.-.Linkin.Park.Reanimation.mp3",                                                     "Enth E Nd",                         "Linkin Park"],

	["CEZA.-.Fark.Var.Official.Audio.mp3",                                                          "Fark Var",                          "Ceza"],
	["Crawling.Official.HD.Music.Video.-.Linkin.Park.mp3",                                          "Crawling",                          "Linkin Park"],
	["Crazy.Robert.Cristian.Remix.mp3",                                                             "Crazy (Robert Cristian Remix)",      "Faydee"],
	["Cure.For.The.Itch.-.Linkin.Park.Hybrid.Theory.mp3",                                           "Cure for the Itch",                 "Linkin Park"],
	["CVRTOON.-.Operasyon.mp3",                                                                     "Operasyon",                         "CVRTOON"],
	["CVRTOON.-.VATAN.SAGOLSUN.mp3",                                                                "Vatan Sağolsun",                    "CVRTOON"],
	["Daniel.Pemberton.-.The.Prowler.From.Spider-Man.Into.the.Spider-Verse.Score.mp3",              "The Prowler",                       "Daniel Pemberton"],
	["Deftones.-.MX.-.Lyrics.mp3",                                                                  "MX",                                "Deftones"],
	["Deftones.-.My.Own.Summer.Official.Music.Video.HD.Remaster.mp3",                               "My Own Summer (Shove It)",          "Deftones"],
	["Destan.mp3",                                                                                  "Destan",                            ""],
	["DJ.Oliver.Mendes.-.Brutal.Infernal.Funk.Slowed.mp3",                                          "Brutal Infernal Funk (Slowed)",      "DJ Oliver Mendes"],
	["DJ.Snake.Lil.Jon.-.Turn.Down.for.What.mp3",                                                   "Turn Down for What",                "DJ Snake, Lil Jon"],
	["Don.Omar.-.Danza.Kuduro.ft.Lucenzo.mp3",                                                      "Danza Kuduro",                      "Don Omar ft. Lucenzo"],
	["Don.t.Stay.-.Linkin.Park.Meteora.mp3",                                                        "Don't Stay",                        "Linkin Park"],
	["Drowning.Pool.-.Bodies.Official.HD.Music.Video.mp3",                                          "Bodies",                            "Drowning Pool"],
	["Duman.-.Seviyorsan.Inaniyorsan.mp3",                                                          "Seviyorsan İnanıyorsan",            "Duman"],
	["Duman_Kufi.mp3",                                                                              "Duman Küfi",                        "Duman"],
	["Duncan.Laurence.-.Arcade.Lyric.Video.ft.FLETCHER.mp3",                                        "Arcade",                            "Duncan Laurence ft. FLETCHER"],
	["ElMusto.-.Dale.Don.Dale.Official.Music.Video.mp3",                                            "Dale Don Dale",                     "ElMusto"],
	["Kiss.-.I.Was.Made.For.Lovin.You.mp3",                                                         "I Was Made for Lovin' You",         "KISS"],
	["Era7capone.ft.Batuflex.-.CISTAK.Official.Video.mp3",                                          "CISTAK",                            "Era7capone ft. Batuflex"],
	["Faint.Official.Music.Video.4K.UPGRADE.Linkin.Park.mp3",                                       "Faint",                             "Linkin Park"],
	["Figure.09.-.Linkin.Park.Meteora.mp3",                                                         "Figure.09",                         "Linkin Park"],
	["FloyyMenor.Cris.MJ.-.Gata.Only.mp3",                                                          "Gata Only",                         "FloyyMenor, Cris MJ"],
	["Fonola.Band.-.Bella.Ciao.Audio.mp3",                                                          "Bella Ciao",                        "Fonola Band"],
	["Forgotten.-.Linkin.Park.Hybrid.Theory.mp3",                                                   "Forgotten",                         "Linkin Park"],
	["From.The.Inside.Official.Music.Video.4K.UPGRADE.Linkin.Park.mp3",                             "From the Inside",                   "Linkin Park"],
	["Gece.Golgenin.Rahatina.Bak.-.Cagatay.Akman.Official.Video.mp3",                               "Gece Gölgenin Rahatına Bak",        "Çağatay Akman"],
	["GIMS.-.NINAO.Clip.officiel.mp3",                                                              "NINAO",                             "GIMS"],
	["Grup.VOLKAN.-SAHLANIS.MARSI-.mp3",                                                            "Şahlanış Marşı",                    "Grup Volkan"],
	["H.Vltg3.-.Linkin.Park.Reanimation.mp3",                                                       "H! Vltg3",                          "Linkin Park"],
	["Hands.Held.High.-.Linkin.Park.Minutes.To.Midnight.mp3",                                       "Hands Held High",                   "Linkin Park"],
	["High.Voltage.-.Linkin.Park.mp3",                                                              "High Voltage",                      "Linkin Park"],
	["Hit.The.Floor.-.Linkin.Park.Meteora.mp3",                                                     "Hit the Floor",                     "Linkin Park"],
	["Home.Free.-.Sea.Shanty.Medley.mp3",                                                           "Sea Shanty Medley",                 "Home Free"],
	["Hot.Dog.mp3",                                                                                 "Hot Dog",                           "Limp Bizkit"],
	["In.The.End.Official.HD.Music.Video.-.Linkin.Park.mp3",                                        "In the End",                        "Linkin Park"],
	["INNA.-.Bad.Boys.Exclusive.Online.Video.mp3",                                                  "Bad Boys",                          "INNA"],
	["Kirac.-.Gundogdu.Marsi.mp3",                                                                  "Gündoğdu Marşı",                    "Kıraç"],
	["Linkin.Park.-.Given.Up.Live.In.Clarkston.HD.mp3",                                             "Given Up (Live)",                   "Linkin Park"],
	["Linkin.Park.-.A.Place.for.My.Head.Live.In.Texas.mp3",                                         "A Place for My Head (Live)",        "Linkin Park"],
	["Linkin.Park.-.Papercut.Live.In.Texas.mp3",                                                    "Papercut (Live)",                   "Linkin Park"],
	["Luis.Fonsi.-.Despacito.ft.Daddy.Yankee.mp3",                                                  "Despacito",                         "Luis Fonsi ft. Daddy Yankee"],
	["LVBEL.C5.-.nE.mp3",                                                                           "nE?",                               "Lvbel C5"],
	["LVBEL.C5.-.SEZEN.AKSU.mp3",                                                                   "SEZEN AKSU",                        "Lvbel C5"],
	["Lying.From.You.-.Linkin.Park.Meteora.mp3",                                                    "Lying From You",                    "Linkin Park"],
	["Mabel.Matiz.-.Ahu.mp3",                                                                       "Ahu",                               "Mabel Matiz"],
	["MALA.feat.Anuel.Aa.mp3",                                                                      "MALA",                              "6ix9ine ft. Anuel AA"],
	["Megadeth.-.Tipping.Point.Official.Music.Video.mp3",                                           "Tipping Point",                     "Megadeth"],
	["Mehter.Dunyanin.En.Eski.Askeri.Bandosu.-.Estergon.Kal.asi.mp3",                               "Estergon Kalesi",                   "Mehter"],
	["Lady.Gaga.Bruno.Mars.-.Die.With.A.Smile.Official.Music.Video.mp3",                            "Die With a Smile",                  "Lady Gaga, Bruno Mars"],
	["Limp.Bizkit.-.Boiler.Official.Music.Video.mp3",                                               "Boiler",                            "Limp Bizkit"],
	["Limp.Bizkit.-.Break.Stuff.Official.Music.Video.mp3",                                          "Break Stuff",                       "Limp Bizkit"],
	["Limp.Bizkit.-.Gold.Cobra.mp3",                                                                "Gold Cobra",                        "Limp Bizkit"],
	["Limp.Bizkit.-.Livin.It.Up.Party.Up.Live.at.Budapest.Hungary.2015.Official.Pro.Shot.mp3",      "Livin' It Up",                      "Limp Bizkit"],
	["Limp.Bizkit.-.My.Generation.mp3",                                                             "My Generation",                     "Limp Bizkit"],
	["Limp.Bizkit.-.My.Way.mp3",                                                                    "My Way",                            "Limp Bizkit"],
	["Limp.Bizkit.-.Nookie.Official.Music.Video.mp3",                                               "Nookie",                            "Limp Bizkit"],
	["Limp.Bizkit.-.Rollin.Air.Raid.Vehicle.mp3",                                                   "Rollin' (Air Raid Vehicle)",        "Limp Bizkit"],

	["Michel.Telo.-.Ai.Se.Eu.Te.Pego.-.Video.Oficial.Assim.voce.me.mata.mp3",                       "Ai Se Eu Te Pego",                  "Michel Teló"],
	["Muhabbet.Bagina.Girdim.Bu.Gece.Ararim.Sorarim.mp3",                                           "Muhabbet Bağına Girdim",            "Pamela"],
	["Murat.Gogebakan.-.Vurgunum.Official.Video.mp3",                                               "Vurgunum",                          "Murat Göğebakan"],
	["Muslum.Gurses.-.Sigara.mp3",                                                                  "Sigara",                            "Müslüm Gürses"],
	["Muslum.Gurses.-.Tutamiyorum.Zamani.mp3",                                                      "Tutamıyorum Zamanı",                "Müslüm Gürses"],
	["New.Divide.Official.Music.Video.4K.Upgrade.-.Linkin.Park.mp3",                                "New Divide",                        "Linkin Park"],
	["Nobody.s.Listening.-.Linkin.Park.Meteora.mp3",                                                "Nobody's Listening",                "Linkin Park"],
	["Numb.Encore.Live.Official.Music.Video.4K.Upgrade.-.Linkin.Park.JAY-Z.mp3",                    "Numb / Encore (Live)",              "Linkin Park & JAY-Z"],
	["Oguzhan.Koc.-.Hesabima.Yaziyor.Official.Video.mp3",                                           "Hesabıma Yazıyor",                  "Oğuzhan Koç"],
	["Papa.Roach.-.Between.Angels.And.Insects.mp3",                                                 "Between Angels and Insects",        "Papa Roach"],
	["Papercut.Official.HD.Music.Video.-.Linkin.Park.mp3",                                          "Papercut",                          "Linkin Park"],
	["Pirates.Of.The.Caribbean.-.Main.Theme.-.He.s.A.Pirate.mp3",                                  "He's a Pirate",                     "Pirates of the Caribbean"],
	["Points.Of.Authority.Official.HD.Music.Video.-.Linkin.Park.mp3",                               "Points of Authority",               "Linkin Park"],
	["PSY.-.GANGNAM.STYLE.M.V.mp3",                                                                 "Gangnam Style",                     "PSY"],
	["Pushing.Me.Away.-.Linkin.Park.Hybrid.Theory.mp3",                                             "Pushing Me Away",                   "Linkin Park"],
	["One.Step.Closer.Official.HD.Music.Video.-.Linkin.Park.mp3",                                   "One Step Closer",                   "Linkin Park"],
	["Raim.Artur.Adil.-.OFFICIAL.VIDEO.mp3",                                                        "Sımpa",                             "RaiM, Artur, Adil"],
	["Remember.The.Name.Official.Video.-.Fort.Minor.4K.mp3",                                        "Remember the Name",                 "Fort Minor"],
	["Reynmen.-.Renklensin.Official.Premiere.Video.mp3",                                            "Renklensin",                        "Reynmen"],
	["Runaway.-.Linkin.Park.Hybrid.Theory.mp3",                                                     "Runaway",                           "Linkin Park"],
	["Sefo.Capo.-.ISABELLE.Official.Video.mp3",                                                     "ISABELLE",                             "Sefo & Capo"],
	["Sen.Istanbul.sun.Official.Video.-.Gokhan.Turkmen.enbastan.mp3",                               "Sen İstanbul'sun",                     "Gökhan Türkmen"],
	["Serdar.Ortac.-.Poset.mp3",                                                                    "Poşet",                                "Serdar Ortaç"],
	["Serhat.Durmus.-.Turkum.mp3",                                                                  "Türküm",                               "Serhat Durmus"],
	["Set.Fire.to.the.Rain.mp3",                                                                    "Set Fire to the Rain",                 "Adele"],
	["Shakira.-.Waka.Waka.This.Time.For.Africa.Official.HD.Video.ft.Freshlyground.mp3",             "Waka Waka",                            "Shakira"],
	["SHX4.-.OI.OI.OI.BAKA.Brazilian.Funk.mp3",                                                    "OI OI OI BAKA",                        "RioX"],
	["Sila.-.Kafa.mp3",                                                                             "Kafa",                                 "Sıla Gençoğlu"],
	["SLANDER.-.Love.Is.Gone.ft.Dylan.Matthew.Acoustic.mp3",                                        "Love Is Gone (Acoustic)",              "SLANDER"],
	["Somewhere.I.Belong.Official.Music.Video.4K.UPGRADE.Linkin.Park.mp3",                          "Somewhere I Belong",                   "Linkin Park"],
	["Spice.Sean.Paul.Shaggy.-.Go.Down.Deh.Official.Music.Video.mp3",                               "Go Down Deh",                          "Spice, Sean Paul, Shaggy"],
	["Stained.Live.-.Linkin.Park.mp3",                                                              "Stained (Live)",                       "Linkin Park"],
	["System.Of.A.Down.-.Chop.Suey.Official.HD.Video.mp3",                                          "Chop Suey",                            "System Of A Down"],
	["The.Eastern.Man.-.Dive.Official.MV.mp3",                                                      "Dive",                                 "The Eastern Man"],
	["Tokyo.Drift.-.Teriyaki.Boyz.MUSIC.VIDEO.HD.mp3",                                              "Tokyo Drift",                          "Teriyaki Boyz"],
	["Two.Faced.Official.Music.Video.-.Linkin.Park.mp3",                                            "Two Faced",                            "Linkin Park"],
	["Ula.Hamsi.Tuttum.Seni.Hamsi.Stayla.mp3",                                                      "Ula Hamsi Tuttum Seni",                "Hüseyin Erbaş"],
	["When.They.Come.For.Me.-.Linkin.Park.A.Thousands.Suns.mp3",                                    "When They Come For Me",                "Linkin Park"],
	["Whisky.Cola.Tequila.-.Slowed.mp3",                                                            "Whisky Cola Tequila (Slowed)",          "Mapikkunn"],
	["Willy.William.-.Ego.Clip.Officiel.mp3",                                                       "Ego",                                  "Willy William"],
	["With.You.-.Linkin.Park.Hybrid.Theory.mp3",                                                    "With You",                             "Linkin Park"],
	["Wretches.And.Kings.-.Linkin.Park.A.Thousands.Suns.mp3",                                       "Wretches And Kings",                   "Linkin Park"],
	["X.Remix.-.Nicky.Jam.x.J.Balvin.x.Ozuna.x.Maluma.mp3",                                        "X (Remix)",                            "Nicky Jam, J Balvin, Ozuna, Maluma"],
	["X-Ecutioners.feat.Mike.Shinoda.Mr.Hahn.-.It.s.Goin.Down.Official.Music.Video.mp3",            "It's Goin' Down",                      "X-Ecutioners ft. Mike Shinoda & Mr. Hahn"],
	["15.Ceddin.Deden.ITTMT.Mehter.Birimi.Album.mp3",                                               "Ceddin Deden (ITTMT)",                  "Mehter Birimi"],
	["Ajda.Pekkan.-.Super.Star.4.-.87.Remastered.Full.Album.mp3",                                   "Super Star",                            "Ajda Pekkan"],
	["Alan.Walker.Sabrina.Carpenter.Farruko.-.On.My.Way.mp3",                                       "On My Way",                             "Alan Walker, Sabrina Carpenter, Farruko"],
	["Ankarali.Namik.-.Oglumun.Tabancasi.mp3",                                                      "Oğlumun Tabancası",                     "Ankara'lı Namık"],
	["BAD.NOVA.-.Hala.Madrid.2025.EDITION.Lyrics.Video.mp3",                                        "Hala Madrid 2025",                      "BAD NOVA"],
	["Besiktas.Taraftar.Korosu.-.Yagmurlu.Bir.Gunde.Official.Audio.mp3",                            "Yağmurlu Bir Günde",                    "Beşiktaş Taraftar Korosu"],
	["Blackout.-.Linkin.Park.A.Thousands.Suns.mp3",                                                 "Blackout",                              "Linkin Park"],
	["Bleed.It.Out.Official.Music.Video.4K.Upgrade.-.Linkin.Park.mp3",                              "Bleed It Out",                          "Linkin Park"],
	["Bloc.Party.feat.Mike.Shinoda.Tak.mp3",                                                        "Tak",                                   "Bloc Party ft. Mike Shinoda"],
	["BOUNTYHUNTER.-.WOOPS.TECHNO.mp3",                                                             "WOOPS TECHNO",                          "BOUNTYHUNTER"],
	["Breaking.the.Habit.Official.Music.Video.HD.UPGRADE.Linkin.Park.mp3",                          "Breaking the Habit",                    "Linkin Park"],
	["BURN.IT.DOWN.Official.Music.Video.4K.Upgrade.-.Linkin.Park.mp3",                              "Burn It Down",                          "Linkin Park"],
	["By.Myself.-.Linkin.Park.Hybrid.Theory.mp3",                                                   "By Myself",                             "Linkin Park"],
	["Glass.Animals.-.Heat.Waves.Official.Video.mp3",                                               "Heat Waves (Official Video)",           "Glass Animals"],
	["MX.mp3",                                                                                      "MX (Full)",                             "Deftones"],
	["Scriptonite_Polozhenie.mp3",                                                                  "Положение",                             "Scriptonite"],
	["Yandi.Gonlum.mp3",                                                                            "Yandı Gönlüm",                          "bilinmiyor"],

	# ── GitHub'dan eklenen yeni şarkılar ──
	["ABBA.-.Dancing.Queen.Official.Music.Video.mp3",                                            "Dancing Queen",                         "ABBA"],
	["AC.DC.-.Thunderstruck.Official.Video.mp3",                                                 "Thunderstruck",                         "AC/DC"],
	["Adele.-.Hello.Official.Music.Video.mp3",                                                   "Hello",                                 "Adele"],
	["Adele.-.Rolling.in.the.Deep.Official.Music.Video.mp3",                                     "Rolling in the Deep",                   "Adele"],
	["Adele.-.Someone.Like.You.Official.Music.Video.mp3",                                        "Someone Like You",                      "Adele"],
	["Alan.Walker.-.Alone.mp3",                                                                  "Alone",                                 "Alan Walker"],
	["Alan.Walker.-.Darkside.feat.Au.Ra.and.Tomine.Harket.mp3",                                  "Darkside",                              "Alan Walker ft. Au/Ra & Tomine Harket"],
	["Aleyna.Tilki.-.Ayri.Gitme.mp3",                                                            "Ayrı Gitme",                            "Aleyna Tilki"],
	["Alisirim.Gozlerimi.Kapamaya.mp3",                                                          "Alışırım Gözlerimi Kapamaya",           "Sezen Aksu"],
	["Allame.-.Omur.Official.Video.Clip.mp3",                                                    "Ömür",                                  "Allame"],
	["Arctic.Monkeys.-.Do.I.Wanna.Know.Official.Video.mp3",                                      "Do I Wanna Know?",                      "Arctic Monkeys"],
	["Arctic.Monkeys.-.R.U.Mine.Official.Video.mp3",                                             "R U Mine?",                             "Arctic Monkeys"],
	["Ariana.Grande.-.7.rings.Official.Video.mp3",                                               "7 rings",                               "Ariana Grande"],
	["Ariana.Grande.-.no.tears.left.to.cry.Official.Video.mp3",                                  "no tears left to cry",                  "Ariana Grande"],
	["Ariana.Grande.-.thank.u.next.Official.Video.mp3",                                          "thank u, next",                         "Ariana Grande"],
	["Avicii.-.Hey.Brother.mp3",                                                                 "Hey Brother",                           "Avicii"],
	["Avicii.-.Levels.mp3",                                                                      "Levels",                                "Avicii"],
	["Batesmotelpro.-.Buz.Gibi.Biraderler.mp3",                                                  "Buz Gibi Biraderler",                   "Batesmotelpro"],
	["Ben.Bunu.Hak.Etmedim.Sila.Ismail.Kacan.mp3",                                              "Ben Bunu Hak Etmedim",                  "Sıla & İsmail Kaçan"],
	["Ben.Fero.-.Mahallemiz.Esmer.Official.Video.mp3",                                           "Mahallemiz Esmer",                      "Ben Fero"],
	["Benim.Stilim.mp3",                                                                         "Benim Stilim",                          "Kolera"],
	["Beyonce.-.Crazy.In.Love.ft.JAY.Z.mp3",                                                     "Crazy in Love",                         "Beyoncé ft. JAY-Z"],
	["Beyonce.-.Halo.mp3",                                                                       "Halo",                                  "Beyoncé"],
	["Bir_Baskedir.mp3",                                                                         "Bir Başkedir",                          "Yıldız Tilbe"],
	["Bon.Jovi.-.Livin.On.A.Prayer.mp3",                                                         "Livin' On a Prayer",                    "Bon Jovi"],
	["Bruno.Mars.-.Locked.Out.Of.Heaven.Official.Music.Video.mp3",                               "Locked Out of Heaven",                  "Bruno Mars"],
	["Bruno.Mars.-.That.s.What.I.Like.Official.Music.Video.mp3",                                 "That's What I Like",                    "Bruno Mars"],
	["Buyuk.Dusler.mp3",                                                                         "Büyük Düşler",                          "Manuş Baba"],
	["Calvin.Harris.Dua.Lipa.-.One.Kiss.Official.Video.mp3",                                     "One Kiss",                              "Calvin Harris & Dua Lipa"],
	["Calvin.Harris.Rihanna.-.This.Is.What.You.Came.For.Official.Video.mp3",                     "This Is What You Came For",             "Calvin Harris ft. Rihanna"],
	["Cardi.B.-.Bodak.Yellow.OFFICIAL.MUSIC.VIDEO.mp3",                                          "Bodak Yellow",                          "Cardi B"],
	["Ceddin.Deden.mp3",                                                                         "Ceddin Deden",                          "Mehter Marşı"],
	["Cem.Yildiz.-.Dar-i.Dunya.Official.Video.mp3",                                              "Dar-ı Dünya",                           "Cem Yıldız"],
	["Ceza.-.Yerli.Plaka.Official.Video.Yuksek.Kalite.mp3",                                      "Yerli Plaka",                           "Ceza"],
	["Chris.Brown.-.With.You.Official.HD.Video.mp3",                                             "With You",                              "Chris Brown"],
	["Coldplay.-.A.Sky.Full.Of.Stars.Official.Video.mp3",                                        "A Sky Full of Stars",                   "Coldplay"],
	["Coldplay.-.The.Scientist.Official.4K.Video.mp3",                                           "The Scientist",                         "Coldplay"],
	["Coldplay.-.Yellow.Official.Video.mp3",                                                     "Yellow",                                "Coldplay"],
	["Daft.Punk.-.Get.Lucky.Official.Video.feat.Pharrell.Williams.and.Nile.Rodgers.mp3",         "Get Lucky",                             "Daft Punk ft. Pharrell Williams & Nile Rodgers"],
	["Daft.Punk.-.Harder.Better.Faster.Stronger.Official.Video.mp3",                             "Harder, Better, Faster, Stronger",      "Daft Punk"],
	["David.Guetta.-.Titanium.ft.Sia.Official.Video.mp3",                                        "Titanium",                              "David Guetta ft. Sia"],
	["David.Guetta.-.Without.You.ft.Usher.Official.Video.mp3",                                   "Without You",                           "David Guetta ft. Usher"],
	["Deeperise.Jabbar.-.Gecmis.Degismez.mp3",                                                   "Geçmiş Değişmez",                       "Deeperise & Jabbar"],
	["Drake.-.God.s.Plan.mp3",                                                                   "God's Plan",                            "Drake"],
	["Drake.-.Hotline.Bling.mp3",                                                                "Hotline Bling",                         "Drake"],
	["Drake.-.In.My.Feelings.mp3",                                                               "In My Feelings",                        "Drake"],
	["Dua.Lipa.-.Don.t.Start.Now.Official.Music.Video.mp3",                                      "Don't Start Now",                       "Dua Lipa"],
	["Dua.Lipa.-.New.Rules.Official.Music.Video.mp3",                                            "New Rules",                             "Dua Lipa"],
	["Dua.Lipa.-.Physical.Official.Video.mp3",                                                   "Physical",                              "Dua Lipa"],
	["Dunya.yok.oluyor.mp3",                                                                     "Dünya Yok Oluyor",                      "Sıla"],
	["EARFQUAKE.mp3",                                                                            "EARFQUAKE",                             "Tyler, the Creator"],
	["Ed.Sheeran.-.Bad.Habits.Official.Video.mp3",                                               "Bad Habits",                            "Ed Sheeran"],
	["Ed.Sheeran.-.Perfect.Official.Music.Video.mp3",                                            "Perfect",                               "Ed Sheeran"],
	["Ed.Sheeran.-.Thinking.Out.Loud.Official.Music.Video.mp3",                                  "Thinking Out Loud",                     "Ed Sheeran"],
	["Eminem.-.Lose.Yourself.mp3",                                                               "Lose Yourself",                         "Eminem"],
	["Eminem.-.Not.Afraid.mp3",                                                                  "Not Afraid",                            "Eminem"],
	["Eminem.-.Rap.God.Explicit.mp3",                                                            "Rap God",                               "Eminem"],
	["Ezhel.-.Dum.Dum.mp3",                                                                      "Dum Dum",                               "Ezhel"],
	["Fall.Out.Boy.-.Sugar.We.re.Goin.Down.Official.Music.Video.mp3",                            "Sugar, We're Goin Down",                "Fall Out Boy"],
	["Faruk.Sabanci.Norm.Ender.-.Bulamazdin.mp3",                                                "Bulamazdın",                            "Faruk Şabancı & Norm Ender"],
	["Foo.Fighters.-.Best.Of.You.Official.HD.Video.mp3",                                         "Best of You",                           "Foo Fighters"],
	["Foo.Fighters.-.Everlong.Official.HD.Video.mp3",                                            "Everlong",                              "Foo Fighters"],
	["Gize.Ali.Metin.Arsiz.Bela.-.Sende.Unutulurmussun.Prod.Berkay.Candir.mp3",                  "Sende Unutulurmuşsun",                  "Gize Ali Metin & Arsız Bela"],
	["Green.Day.-.American.Idiot.Official.Music.Video.4K.Upgrade.mp3",                           "American Idiot",                        "Green Day"],
	["Green.Day.-.Boulevard.Of.Broken.Dreams.Official.Music.Video.4K.Upgrade.mp3",               "Boulevard of Broken Dreams",            "Green Day"],
	["Gripin.-.Boyle.Kahpedir.Dunya.mp3",                                                        "Böyle Kahpedir Dünya",                  "Gripin"],
	["Gulsen.-.En.Sevdigim.Yanlisim.mp3",                                                        "En Sevdiğim Yanlışım",                  "Gülşen"],
	["Guns.N.Roses.-.Sweet.Child.O.Mine.Official.Music.Video.mp3",                               "Sweet Child O' Mine",                   "Guns N' Roses"],
	["H.E.R.-.Focus.Official.Video.mp3",                                                         "Focus",                                 "H.E.R."],
	["Hadise.feat.Raw.Jawz.-.Sweat.mp3",                                                         "Sweat",                                 "Hadise ft. Raw Jawz"],
	["Hayko.Cepkin.-.Yarasi.Sakli.mp3",                                                          "Yarası Saklı",                          "Hayko Cepkin"],
	["Imagine.Dragons.-.Natural.mp3",                                                             "Natural",                               "Imagine Dragons"],
	["Imagine.Dragons.-.Radioactive.mp3",                                                         "Radioactive",                           "Imagine Dragons"],
	["Imagine.Dragons.-.Thunder.mp3",                                                             "Thunder",                               "Imagine Dragons"],
	["John.Legend.-.All.of.Me.Official.Video.mp3",                                               "All of Me",                             "John Legend"],
	["Juice.WRLD.-.Lucid.Dreams.Official.Music.Video.mp3",                                       "Lucid Dreams",                          "Juice WRLD"],
	["Justin.Bieber.-.Love.Yourself.PURPOSE.The.Movement.mp3",                                   "Love Yourself",                         "Justin Bieber"],
	["Justin.Bieber.-.Peaches.ft.Daniel.Caesar.Giveon.mp3",                                      "Peaches",                               "Justin Bieber ft. Daniel Caesar & Giveon"],
	["Justin.Bieber.-.Sorry.PURPOSE.The.Movement.mp3",                                           "Sorry",                                 "Justin Bieber"],
	["Katliam.3.OFFICIAL.VIDEO.prod.by.Buaka.mp3",                                               "Katliam 3",                             "Murda & Ezhel"],
	["Kendrick.Lamar.-.DNA.mp3",                                                                 "DNA.",                                  "Kendrick Lamar"],
	["Kendrick.Lamar.-.Swimming.Pools.Drank.mp3",                                                "Swimming Pools (Drank)",                 "Kendrick Lamar"],
	["Kygo.-.Firestone.ft.Conrad.Sewell.Official.Video.mp3",                                     "Firestone",                             "Kygo ft. Conrad Sewell"],
	["Kygo.Selena.Gomez.-.It.Ain.t.Me.Official.Video.mp3",                                       "It Ain't Me",                           "Kygo & Selena Gomez"],
	["LVBEL.C5.-.dubaiiiiii.mp3",                                                                "dubaiiiiii",                            "Lvbel C5"],
	["Mabel.Matiz.-.Hala.Haber.Bekliyorum.Senden.Mabel.s.Version.mp3",                          "Hala Haber Bekliyorum Senden",          "Mabel Matiz"],
	["Marshmello.-.Alone.Official.Music.Video.mp3",                                              "Alone",                                 "Marshmello"],
	["Martin.Garrix.-.Animals.Official.Video.mp3",                                               "Animals",                               "Martin Garrix"],
	["Martin.Garrix.Bebe.Rexha.-.In.The.Name.Of.Love.Official.Video.mp3",                        "In the Name of Love",                   "Martin Garrix & Bebe Rexha"],
	["Metallica.Enter.Sandman.Official.Music.Video.mp3",                                         "Enter Sandman",                         "Metallica"],
	["Michael.Jackson.-.Billie.Jean.Official.Video.mp3",                                         "Billie Jean",                           "Michael Jackson"],
	["Michael.Jackson.-.Thriller.Official.4K.Video.mp3",                                         "Thriller",                              "Michael Jackson"],
	["Model.-.Degmesin.Ellerimiz.mp3",                                                           "Değmesin Ellerimiz",                    "Model"],
	["Muse.-.Supermassive.Black.Hole.Official.Music.Video.mp3",                                  "Supermassive Black Hole",               "Muse"],
	["My.Chemical.Romance.-.Welcome.To.The.Black.Parade.Official.Music.Video.HD.mp3",            "Welcome to the Black Parade",           "My Chemical Romance"],
	["Neler_Oluyor.mp3",                                                                         "Neler Oluyor",                          "Sıla"],
	["Nicki.Minaj.-.Super.Bass.Official.Video.mp3",                                              "Super Bass",                            "Nicki Minaj"],
	["Nirvana.-.Come.As.You.Are.Official.Music.Video.mp3",                                       "Come as You Are",                       "Nirvana"],
	["Nirvana.-.Smells.Like.Teen.Spirit.Official.Music.Video.mp3",                               "Smells Like Teen Spirit",               "Nirvana"],
	["Panic.At.The.Disco.-.High.Hopes.Official.Video.mp3",                                       "High Hopes",                            "Panic! At The Disco"],
	["Post.Malone.-.Circles.mp3",                                                                "Circles",                               "Post Malone"],
	["Red.Hot.Chili.Peppers.-.Californication.Official.Music.Video.HD.UPGRADE.mp3",              "Californication",                       "Red Hot Chili Peppers"],
	["Red.Hot.Chili.Peppers.-.Under.The.Bridge.Official.Music.Video.mp3",                        "Under the Bridge",                      "Red Hot Chili Peppers"],
	["Reynmen.-.Ela.Official.Video.mp3",                                                         "Ela",                                   "Reynmen"],
	["Rihanna.-.Diamonds.mp3",                                                                   "Diamonds",                              "Rihanna"],
	["Rihanna.-.We.Found.Love.ft.Calvin.Harris.mp3",                                             "We Found Love",                         "Rihanna ft. Calvin Harris"],
	["Roddy.Ricch.-.The.Box.Official.Music.Video.mp3",                                           "The Box",                               "Roddy Ricch"],
	["Sam.Smith.-.Stay.With.Me.Official.Music.Video.mp3",                                        "Stay With Me",                          "Sam Smith"],
	["Sam.Smith.-.Writing.s.On.The.Wall.from.Spectre.Official.Music.Video.mp3",                  "Writing's on the Wall",                 "Sam Smith"],
	["Satisfaction.Guaracha.2022.@Alcyone.-.Aleteo.Zapateo.Tribal.House.Guaracha.Nati...mp3",   "Satisfaction (Guaracha)",               "Alcyone"],
	["Sebnem.Ferah.-.Cakil.Taslari.Official.Video.mp3",                                          "Çakıl Taşları",                         "Şebnem Ferah"],
	["Sebnem.Ferah.-.Mayin.Tarlasi.10.Mart.2007.Istanbul.Konseri.mp3",                           "Mayın Tarlası (İstanbul Konseri)",       "Şebnem Ferah"],
	["Semicenk.Rast.-.Canin.Sag.Olsun.prod.by.Buken.mp3",                                       "Canın Sağ Olsun",                       "Semicenk & Rast"],
	["Sezen.Aksu.-.Geri.Don.Official.Video.mp3",                                                 "Geri Dön",                              "Sezen Aksu"],
	["Sezen.Aksu.-.Hadi.Bakalim.Official.Video.mp3",                                             "Hadi Bakalım",                          "Sezen Aksu"],
	["Survivor.-.Eye.Of.The.Tiger.Official.HD.Video.mp3",                                        "Eye of the Tiger",                      "Survivor"],
	["TARKAN.-.Kuzu.Kuzu.Official.Music.Video.mp3",                                              "Kuzu Kuzu",                             "Tarkan"],
	["TARKAN.-.Simarik.Official.Music.Video.mp3",                                                "Şımarık",                               "Tarkan"],
	["Taylor.Swift.-.Bad.Blood.ft.Kendrick.Lamar.mp3",                                           "Bad Blood",                             "Taylor Swift ft. Kendrick Lamar"],
	["Taylor.Swift.-.Blank.Space.mp3",                                                           "Blank Space",                           "Taylor Swift"],
	["Taylor.Swift.-.Shake.It.Off.mp3",                                                          "Shake It Off",                          "Taylor Swift"],
	["Teoman.in.Yaklasik.30.Manken.Esliginde.Cektigi.Yeni.Klip.-.DiviksFilm.Com.mp3",           "Ben Sana Vurgunum",                     "Teoman"],
	["The.Chainsmokers.-.Closer.Official.Video.ft.Halsey.mp3",                                   "Closer",                                "The Chainsmokers ft. Halsey"],
	["The.Chainsmokers.Coldplay.-.Something.Just.Like.This.Official.Lyric.Video.mp3",            "Something Just Like This",              "The Chainsmokers & Coldplay"],
	["The.Weeknd.-.Can.t.Feel.My.Face.Official.Video.mp3",                                       "Can't Feel My Face",                    "The Weeknd"],
	["The.Weeknd.-.Save.Your.Tears.Official.Music.Video.mp3",                                    "Save Your Tears",                       "The Weeknd"],
	["The.Weeknd.-.Starboy.ft.Daft.Punk.Official.Video.ft.Daft.Punk.mp3",                        "Starboy",                               "The Weeknd ft. Daft Punk"],
	["Three.Days.Grace.-.I.Hate.Everything.About.You.Official.Video.mp3",                        "I Hate Everything About You",           "Three Days Grace"],
	["Tiesto.-.The.Business.Official.Music.Video.mp3",                                           "The Business",                          "Tiësto"],
	["Toto.-.Africa.Official.HD.Video.mp3",                                                      "Africa",                                "Toto"],
	["Tugkan.-.Gitmelisin.Official.Lyric.Video.mp3",                                             "Gitmelisin",                            "Tuğkan"],
	["Usher.-.Yeah.Official.Video.ft.Lil.Jon.Ludacris.mp3",                                      "Yeah!",                                 "Usher ft. Lil Jon & Ludacris"],
	["XXXTENTACION.-.MOONLIGHT.OFFICIAL.MUSIC.VIDEO.mp3",                                        "Moonlight",                             "XXXTENTACION"],
	["XXXTENTACION.-.SAD.Official.Music.Video.mp3",                                              "SAD!",                                  "XXXTENTACION"],
	["Yalin.-.Ask.Ne.Demek.Official.Audio.mp3",                                                  "Aşk Ne Demek",                          "Yalın"],
	["Yalin.-.Ben.Bilmem.Official.Video.mp3",                                                    "Ben Bilmem",                            "Yalın"],
	["Yalin.-.Gunaydin.Official.Video.mp3",                                                      "Günaydın",                              "Yalın"],
	["Yalin.-.Her.Sey.Sensin.Official.Video.mp3",                                                "Her Şey Sensin",                        "Yalın"],
	["Yalin.-.Ki.Sen.Official.Video.mp3",                                                        "Ki Sen",                                "Yalın"],
	["Yalin.-.Kucucugum.Official.Video.mp3",                                                     "Küçücüğüm",                             "Yalın"],
	["Yalin.-.Sesinde.Ask.Var.Official.Video.mp3",                                               "Sesinde Aşk Var",                       "Yalın"],
	["Yalin.-.Sonsuz.Ol.Official.Video.mp3",                                                     "Sonsuz Ol",                             "Yalın"],
	["Yalin.-.Zalim.Official.Video.mp3",                                                         "Zalim",                                 "Yalın"],
	["Zedd.-.Beautiful.Now.ft.Jon.Bellion.Official.Music.Video.mp3",                             "Beautiful Now",                         "Zedd ft. Jon Bellion"],
	["Zedd.Maren.Morris.Grey.-.The.Middle.Official.Music.Video.mp3",                             "The Middle",                            "Zedd, Maren Morris, Grey"],
	["mor.ve.otesi.-.Cambaz.Official.Video.mp3",                                                 "Cambaz",                                "Mor ve Ötesi"],
	["twenty.one.pilots.Heathens.from.Suicide.Squad.The.Album.OFFICIAL.VIDEO.mp3",              "Heathens",                              "twenty one pilots"],
	["twenty.one.pilots.Stressed.Out.OFFICIAL.VIDEO.mp3",                                        "Stressed Out",                          "twenty one pilots"],

	# ── repo_2 şarkıları ──
	["Hadise.feat.Raw.Jawz.-.Sweat.mp3",                                                         "Sweat",                                 "Ayfer-5",               "repo_2"],
	["Hayko.Cepkin.-.Paranoya.mp3",                                                              "Paranoya",                              "Hayko Cepkin",          "repo_2"],
	["Lil.Baby.x.Gunna.-.Drip.Too.Hard.Official.Music.Video.mp3",                               "Drip Too Hard",                         "Lil Baby Official",     "repo_2"],
	["Mabel.Matiz.-.Hala.Haber.Bekliyorum.Senden.Mabel.s.Version.mp3",                         "Hâlâ Haber Bekliyorum",                 "mabelmatiz",            "repo_2"],
	["Mark.Ronson.-.Uptown.Funk.Official.Video.ft.Bruno.Mars.mp3",                              "Uptown Funk",                           "Mark Ronson",           "repo_2"],
	["Marshmello.-.Alone.Official.Music.Video.mp3",                                              "Alone",                                 "Marshmello",            "repo_2"],
	["Muse.-.Madness.mp3",                                                                       "Madness",                               "Muse",                  "repo_2"],
	["Queen.-.Don.t.Stop.Me.Now.Official.Video.mp3",                                             "Don't Stop Me Now",                     "Queen Official",        "repo_2"],
	["Red.Hot.Chili.Peppers.-.Californication.Official.Music.Video.HD.UPGRADE.mp3",             "Californication",                       "Red Hot Chili Peppers", "repo_2"],
	["Semicenk.Ziynet.Sali.Ilkan.Gunuc.-.Bozulmus.Kalbim.mp3",                                 "Bozulmuş Kalbim",                       "Eva Records",           "repo_2"],
	["Serdar.Ortac.-.Ben.Adam.Olmam.Official.Video.mp3",                                         "Ben Adam Olmam",                        "MuzikPlay",             "repo_2"],
	["Sezen.Aksu.-.Hadi.Bakalim.Official.Video.mp3",                                             "Hadi Bakalım",                          "Sezen Aksu",            "repo_2"],
	["Teoman.-.Paramparca.mp3",                                                                  "Paramparça",                            "TeomanVEVO",            "repo_2"],
	["Teoman.in.Yaklasik.30.Manken.Esliginde.Cektigi.Yeni.Klip.-.DiviksFilm.Com.mp3",          "Yaklaşık 30 Manken",                    "Diviks Robotu",         "repo_2"],
	["Travis.Scott.-.Antidote.Official.Video.mp3",                                               "Antidote",                              "Travis Scott",          "repo_2"],
	["Tugkan.-.Gitmelisin.Official.Lyric.Video.mp3",                                             "Gitmelisin",                            "Tuğkan",                "repo_2"],
	["Yalin.-.Halbuki.mp3",                                                                      "Halbuki",                               "YALIN",                 "repo_2"],
	["Yalin.-.Her.Sey.Sensin.Official.Video.mp3",                                                "Her Şey Sensin",                        "MuzikPlay",             "repo_2"],
]

const EMOJIS: Array[String] = ["🎵","🎶","🎸","🎹","🥁","🎺","🎻","🎤","🎧","🎼","🪗","🪘","🎷","🪕"]

# ─────────────────────────────────────────────────────────────
#  SEEK BAR
# ─────────────────────────────────────────────────────────────
class SeekBar extends Control:
	var progress: float = 0.0
	var is_dragging: bool = false
	var on_seek: Callable

	func _ready() -> void:
		mouse_filter = Control.MOUSE_FILTER_STOP
		custom_minimum_size.y = 28

	func set_progress(v: float) -> void:
		if not is_dragging:
			progress = clampf(v, 0.0, 1.0)
			queue_redraw()

	func _draw() -> void:
		var w   := size.x
		var cy  := size.y * 0.5
		var fill := w * progress
		draw_rect(Rect2(0, cy - 3, w, 6), Color(0.149, 0.149, 0.212, 1.0), true)
		if fill > 0:
			draw_rect(Rect2(0, cy - 3, fill, 6), Color(0.784, 0.663, 0.431, 1.0), true)
		var tx := clampf(fill, 9.0, w - 9.0)
		if is_dragging:
			draw_circle(Vector2(tx, cy), 13.0, Color(0.784, 0.663, 0.431, 0.25))
		draw_circle(Vector2(tx, cy), 9.0, Color(0.910, 0.788, 0.557, 1.0))

	func _pct(pos: Vector2) -> float:
		return clampf(pos.x / size.x, 0.0, 1.0)

	func _gui_input(event: InputEvent) -> void:
		if event is InputEventMouseButton:
			var mb := event as InputEventMouseButton
			if mb.button_index == MOUSE_BUTTON_LEFT:
				is_dragging = mb.pressed
				if mb.pressed:
					progress = _pct(mb.position)
					queue_redraw()
					if on_seek.is_valid(): on_seek.call(progress)
				else:
					queue_redraw()
		elif event is InputEventMouseMotion and is_dragging:
			progress = _pct((event as InputEventMouseMotion).position)
			queue_redraw()
			if on_seek.is_valid(): on_seek.call(progress)
		elif event is InputEventScreenTouch:
			var st := event as InputEventScreenTouch
			is_dragging = st.pressed
			if st.pressed:
				progress = _pct(st.position); queue_redraw()
				if on_seek.is_valid(): on_seek.call(progress)
			else:
				queue_redraw()
		elif event is InputEventScreenDrag:
			progress = _pct((event as InputEventScreenDrag).position)
			queue_redraw()
			if on_seek.is_valid(): on_seek.call(progress)

# ─────────────────────────────────────────────────────────────
#  STATE
# ─────────────────────────────────────────────────────────────
var songs:          Array[Dictionary] = []
var current_index:  int  = -1
var is_playing:     bool = false

var http_audio:    HTTPRequest = null
var http_prefetch: HTTPRequest = null   # sonraki sarki on indir

# Cache: dosya_adi -> PackedByteArray
var cache: Dictionary = {}
const MAX_CACHE := 5   # max kac sarki bellekte tutulsun

# CDN URL önbelleği: redirect round-trip'i sadece 1 kez yap
var cdn_url_cache: Dictionary = {}   # file_key -> cdn_url (String)
var http_cdn_warmup: HTTPRequest = null

# Arama debounce
var _search_timer: Timer = null
var _pending_search: String = "" 

# Auth
var authed_user: String = ""    # giriş yapan kullanıcının e-postası
var authed_token: String = ""   # Supabase access token
var http_auth: HTTPRequest = null

# Çalma listeleri: isim -> Array[int] (song index listesi)
var playlists: Dictionary = {}

# ─────────────────────────────────────────────────────────────
#  UI REFS
# ─────────────────────────────────────────────────────────────
var song_list_vbox:      VBoxContainer
var song_scroll:         ScrollContainer
var song_row_refs:       Array = []   # her songs[i] için PanelContainer ref
var _prev_active_idx:    int = -1     # son aktif satır indeksi
var playlist_list_vbox:  VBoxContainer
var now_playing_label:   Label
var now_playing_artist:  Label
var now_cover_label:     Label
var _pulse_tween:        Tween
var play_btn:            Button
var add_to_playlist_btn: Button
var seek_bar:            SeekBar
var time_label:          Label
var duration_label:      Label
var status_label:        Label
var search_field:        LineEdit
var stream_player:       AudioStreamPlayer
var progress_timer:      Timer
var tab_all_btn:         Button
var tab_pl_btn:          Button
var tab_top_btn:         Button
var tab_fav_btn:         Button
var tab_dl_btn:          Button
var sidebar_panel:       Control
var sidebar_overlay:     ColorRect
var sidebar_open:        bool = false
var content_fav:         Control
var content_dl:          Control
var fav_list_vbox:       VBoxContainer
var dl_list_vbox:        VBoxContainer
var favorites:           Array = []   # song index listesi
var downloaded_songs:    Array = []   # indirilmiş şarkı file_key listesi
var http_dl:             HTTPRequest = null  # indirme isteği
var song_queue:          Array = []   # çalma sırası (song index listesi)
var content_all:         Control
var content_pl:          Control
var content_top:         Control
var top_list_vbox:       VBoxContainer
var active_tab:          String = "all"  # "all" | "playlists" | "top" | "favorites" | "downloads"

# Supabase çalınma sayıları: file_key -> int
var download_counts: Dictionary = {}
var http_api: HTTPRequest = null
var http_stats: HTTPRequest = null  # song_stats için ayrı istek

# Presence sistemi
var http_presence: HTTPRequest = null
var _presence_timer: Timer = null

# ─────────────────────────────────────────────────────────────
#  READY
# ─────────────────────────────────────────────────────────────
func _start_background_audio() -> void:
	if OS.get_name() == "Android":
		var jni = Engine.get_singleton("AndroidRuntime")
		if jni:
			var activity = jni.getActivity()
			var intent_class = JavaClassWrapper.wrap("android.content.Intent")
			if intent_class and activity:
				var intent = intent_class.new("com.sportify.music.SportifyService")
				activity.startService(intent)

func _stop_background_audio() -> void:
	if OS.get_name() == "Android":
		var jni = Engine.get_singleton("AndroidRuntime")
		if jni:
			var activity = jni.getActivity()
			var intent_class = JavaClassWrapper.wrap("android.content.Intent")
			if intent_class and activity:
				var intent = intent_class.new("com.sportify.music.SportifyService")
				activity.stopService(intent)

func _notification(what: int) -> void:
	match what:
		2006: # NOTIFICATION_APPLICATION_PAUSED
			if OS.get_name() == "Android":
				_start_background_audio()
			_set_presence(false)
		2007: # NOTIFICATION_APPLICATION_RESUMED
			if OS.get_name() == "Android":
				_stop_background_audio()
			_ping_presence()
		NOTIFICATION_WM_CLOSE_REQUEST:
			_set_presence(false)

func _ready() -> void:
	var bg := ColorRect.new()
	bg.color = COLOR_BG
	bg.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	add_child(bg); move_child(bg, 0)

	# Global focus çizgisini kaldır
	var theme := Theme.new()
	var empty := StyleBoxEmpty.new()
	theme.set_stylebox("focus", "Button", empty)
	theme.set_stylebox("focus", "LineEdit", empty)
	self.theme = theme

	_build_songs()
	# Önce versiyon kontrol et, sonra login
	_check_version()


# ─────────────────────────────────────────────────────────────
#  AUTH — GİRİŞ SİSTEMİ
# ─────────────────────────────────────────────────────────────
func _load_auth() -> Array:
	if FileAccess.file_exists("user://auth.dat"):
		var f := FileAccess.open("user://auth.dat", FileAccess.READ)
		if f:
			var d = f.get_var(); f.close()
			if d is Array and d.size() == 2: return d
	return []

func _save_auth(email: String, token: String) -> void:
	var f := FileAccess.open("user://auth.dat", FileAccess.WRITE)
	if f: f.store_var([email, token]); f.close()

func _clear_auth() -> void:
	if FileAccess.file_exists("user://auth.dat"):
		DirAccess.remove_absolute("user://auth.dat")

func _verify_supabase_token(email: String, token: String) -> void:
	# Yükleniyor ekranı göster
	var loading_screen := ColorRect.new()
	loading_screen.color = COLOR_BG
	loading_screen.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	loading_screen.name = "LoadingScreen"
	add_child(loading_screen)

	var center := CenterContainer.new()
	center.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	loading_screen.add_child(center)

	var vb := VBoxContainer.new()
	vb.add_theme_constant_override("separation", 16)
	center.add_child(vb)

	var logo := Label.new()
	logo.text = "Sportify"
	logo.add_theme_font_size_override("font_size", 32)
	logo.add_theme_color_override("font_color", COLOR_ACCENT)
	logo.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	vb.add_child(logo)

	var loading_lbl := Label.new()
	loading_lbl.text = "Oturum dogrulaniyor..."
	loading_lbl.add_theme_font_size_override("font_size", 14)
	loading_lbl.add_theme_color_override("font_color", COLOR_MUTED)
	loading_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	vb.add_child(loading_lbl)

	if is_instance_valid(http_auth):
		http_auth.cancel_request(); http_auth.queue_free()
	http_auth = HTTPRequest.new()
	http_auth.use_threads = false
	add_child(http_auth)
	http_auth.request_completed.connect(
		_on_token_verified.bind(email, token, loading_screen))
	http_auth.request(
		SUPABASE_URL + "/auth/v1/user",
		PackedStringArray([
			"Authorization: Bearer " + token,
			"apikey: " + SUPABASE_ANON_KEY
		])
	)

func _on_token_verified(_result: int, code: int,
		_headers: PackedStringArray, _body: PackedByteArray,
		email: String, token: String, loading_screen: Node) -> void:
	if is_instance_valid(http_auth):
		http_auth.queue_free(); http_auth = null

	if code == 200:
		authed_user  = email
		authed_token = token
		if is_instance_valid(loading_screen):
			loading_screen.queue_free()
		_build_ui()
		_setup_audio()
		_load_playlists()
		_load_favorites()
		_render_songs()
		_start_presence()
	else:
		# Token geçersiz — auth.dat'ı sil, login ekranını göster
		_clear_auth()
		if is_instance_valid(loading_screen):
			loading_screen.queue_free()
		_show_login_screen()


func _show_banned_screen(loading_screen: Node, message: String) -> void:
	# Yükleniyor yazısını temizle, yerine ban mesajı göster
	for ch in loading_screen.get_children(): ch.queue_free()

	var center := CenterContainer.new()
	center.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	loading_screen.add_child(center)

	var box := _panel_radius(Color(0.078, 0.047, 0.063, 1.0), 20)
	box.custom_minimum_size = Vector2(300, 0)
	center.add_child(box)

	var vb := VBoxContainer.new()
	vb.add_theme_constant_override("separation", 14)
	box.add_child(vb)

	var icon := Label.new()
	icon.text = "⛔"
	icon.add_theme_font_size_override("font_size", 42)
	icon.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	vb.add_child(icon)

	var msg := Label.new()
	msg.text = message
	msg.add_theme_font_size_override("font_size", 14)
	msg.add_theme_color_override("font_color", COLOR_TEXT)
	msg.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	msg.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	msg.custom_minimum_size = Vector2(260, 0)
	vb.add_child(msg)

	# Tekrar dene butonu (internet hatası için)
	var retry_btn := _make_btn()
	retry_btn.text = "Tekrar Dene"
	retry_btn.custom_minimum_size.y = 46
	retry_btn.add_theme_font_size_override("font_size", 14)
	retry_btn.add_theme_color_override("font_color", COLOR_BG)
	retry_btn.add_theme_stylebox_override("normal",  _stylebox(COLOR_ACCENT, 10))
	retry_btn.add_theme_stylebox_override("hover",   _stylebox(COLOR_ACCENT2, 10))
	retry_btn.add_theme_stylebox_override("focus",   StyleBoxEmpty.new())
	retry_btn.pressed.connect(func():
		loading_screen.queue_free()
		var saved := _load_auth()
		if saved.size() == 2:
			_verify_supabase_token(saved[0], saved[1])
		else:
			_show_login_screen()
	)
	vb.add_child(retry_btn)

	var pad := Control.new()
	pad.custom_minimum_size.y = 4
	vb.add_child(pad)

func _show_login_screen() -> void:
	var login_bg := ColorRect.new()
	login_bg.color = COLOR_BG
	login_bg.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	login_bg.name = "LoginScreen"
	add_child(login_bg)

	var center := CenterContainer.new()
	center.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	login_bg.add_child(center)

	var box := _panel_radius(Color(0.063, 0.051, 0.118, 1.0), 20)
	box.custom_minimum_size = Vector2(320, 0)
	center.add_child(box)

	var vb := VBoxContainer.new()
	vb.add_theme_constant_override("separation", 14)
	box.add_child(vb)

	# Logo
	var logo := Label.new()
	logo.text = "Sportify"
	logo.add_theme_font_size_override("font_size", 32)
	logo.add_theme_color_override("font_color", COLOR_ACCENT)
	logo.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	logo.custom_minimum_size.y = 52
	vb.add_child(logo)

	var sep := ColorRect.new()
	sep.color = COLOR_BORDER
	sep.custom_minimum_size = Vector2(0, 1)
	vb.add_child(sep)

	# E-posta
	var mail_lbl := Label.new()
	mail_lbl.text = "E-posta"
	mail_lbl.add_theme_font_size_override("font_size", 13)
	mail_lbl.add_theme_color_override("font_color", COLOR_MUTED)
	vb.add_child(mail_lbl)

	var mail_input := LineEdit.new()
	mail_input.placeholder_text = "ornek@gmail.com"
	mail_input.custom_minimum_size.y = 46
	mail_input.add_theme_font_size_override("font_size", 15)
	mail_input.add_theme_color_override("font_color", COLOR_TEXT)
	mail_input.add_theme_color_override("font_placeholder_color", COLOR_MUTED)
	mail_input.add_theme_stylebox_override("normal",
		_stylebox(Color(0.086, 0.071, 0.157, 1.0), 12, COLOR_BORDER, 1))
	mail_input.add_theme_stylebox_override("focus",
		_stylebox(Color(0.086, 0.071, 0.157, 1.0), 12, COLOR_ACCENT, 1))
	vb.add_child(mail_input)

	# Şifre
	var pass_lbl := Label.new()
	pass_lbl.text = "Sifre"
	pass_lbl.add_theme_font_size_override("font_size", 13)
	pass_lbl.add_theme_color_override("font_color", COLOR_MUTED)
	vb.add_child(pass_lbl)

	var pass_input := LineEdit.new()
	pass_input.placeholder_text = "Sifrenizi girin..."
	pass_input.secret = true
	pass_input.custom_minimum_size.y = 46
	pass_input.add_theme_font_size_override("font_size", 15)
	pass_input.add_theme_color_override("font_color", COLOR_TEXT)
	pass_input.add_theme_color_override("font_placeholder_color", COLOR_MUTED)
	pass_input.add_theme_stylebox_override("normal",
		_stylebox(Color(0.086, 0.071, 0.157, 1.0), 12, COLOR_BORDER, 1))
	pass_input.add_theme_stylebox_override("focus",
		_stylebox(Color(0.086, 0.071, 0.157, 1.0), 12, COLOR_ACCENT, 1))
	vb.add_child(pass_input)

	# Hata etiketi
	var err_lbl := Label.new()
	err_lbl.text = ""
	err_lbl.add_theme_font_size_override("font_size", 12)
	err_lbl.add_theme_color_override("font_color", Color(0.9, 0.3, 0.3))
	err_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	err_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	vb.add_child(err_lbl)

	# Giriş butonu
	var login_btn := _make_btn()
	login_btn.text = "Giris Yap"
	login_btn.custom_minimum_size.y = 50
	login_btn.add_theme_font_size_override("font_size", 16)
	login_btn.add_theme_color_override("font_color", COLOR_BG)
	login_btn.add_theme_stylebox_override("normal",  _stylebox(COLOR_ACCENT, 10))
	login_btn.add_theme_stylebox_override("hover",   _stylebox(COLOR_ACCENT.lightened(0.12), 10))
	login_btn.add_theme_stylebox_override("pressed", _stylebox(COLOR_ACCENT.darkened(0.12), 10))
	login_btn.add_theme_stylebox_override("focus",   StyleBoxEmpty.new())
	vb.add_child(login_btn)

	var pad := Control.new()
	pad.custom_minimum_size.y = 4
	vb.add_child(pad)

	# Buton aksiyonu
	var do_login := func():
		var email    := mail_input.text.strip_edges()
		var password := pass_input.text.strip_edges()
		if email.is_empty() or not "@" in email:
			err_lbl.text = "Gecerli bir e-posta girin!"; return
		if password.is_empty():
			err_lbl.text = "Sifre bos olamaz!"; return
		err_lbl.add_theme_color_override("font_color", COLOR_MUTED)
		err_lbl.text = "Giris yapiliyor..."
		login_btn.disabled = true
		_supabase_login(email, password, login_btn, err_lbl, login_bg)

	login_btn.pressed.connect(do_login)
	pass_input.text_submitted.connect(func(_t): do_login.call())

func _supabase_login(email: String, password: String,
		login_btn: Button, err_lbl: Label, login_screen: Node) -> void:
	if is_instance_valid(http_auth):
		http_auth.cancel_request(); http_auth.queue_free()
	http_auth = HTTPRequest.new()
	http_auth.use_threads = false
	add_child(http_auth)
	http_auth.request_completed.connect(
		_on_login_done.bind(email, login_btn, err_lbl, login_screen))
	var body := JSON.stringify({"email": email, "password": password})
	http_auth.request(
		SUPABASE_URL + "/auth/v1/token?grant_type=password",
		PackedStringArray([
			"Content-Type: application/json",
			"apikey: " + SUPABASE_ANON_KEY
		]),
		HTTPClient.METHOD_POST,
		body
	)

func _on_login_done(_result: int, code: int,
		_headers: PackedStringArray, body: PackedByteArray,
		email: String, login_btn: Button, err_lbl: Label, login_screen: Node) -> void:
	if is_instance_valid(http_auth):
		http_auth.queue_free(); http_auth = null

	var json := JSON.new()
	if json.parse(body.get_string_from_utf8()) != OK or code != 200:
		login_btn.disabled = false
		err_lbl.add_theme_color_override("font_color", Color(0.9, 0.3, 0.3))
		err_lbl.text = "E-posta veya sifre yanlis!" if code == 400 else \
			"Sunucuya ulasilamadi (hata %d)" % code
		return

	var data = json.get_data()
	var token: String = data.get("access_token", "")
	if token.is_empty():
		login_btn.disabled = false
		err_lbl.add_theme_color_override("font_color", Color(0.9, 0.3, 0.3))
		err_lbl.text = "Token alinamadi, tekrar dene."
		return

	authed_user  = email
	authed_token = token
	_save_auth(email, token)
	if is_instance_valid(login_screen):
		login_screen.queue_free()
	_build_ui()
	_setup_audio()
	_load_playlists()
	_load_favorites()
	_load_downloads()
	_render_songs()
	_start_presence()

# ─────────────────────────────────────────────────────────────
#  PRESENCE SİSTEMİ
# ─────────────────────────────────────────────────────────────
func _start_presence() -> void:
	if authed_user.is_empty(): return
	_ping_presence()
	if is_instance_valid(_presence_timer):
		_presence_timer.stop(); _presence_timer.queue_free()
	_presence_timer = Timer.new()
	_presence_timer.wait_time = 30.0
	_presence_timer.autostart = false
	_presence_timer.timeout.connect(_ping_presence)
	add_child(_presence_timer)
	_presence_timer.start()

func _stop_presence() -> void:
	if is_instance_valid(_presence_timer):
		_presence_timer.stop(); _presence_timer.queue_free()
		_presence_timer = null
	_set_presence(false)

func _ping_presence() -> void:
	if authed_user.is_empty() or authed_token.is_empty(): return
	if is_instance_valid(http_presence):
		http_presence.cancel_request(); http_presence.queue_free()
	http_presence = HTTPRequest.new()
	http_presence.use_threads = false
	add_child(http_presence)
	http_presence.request_completed.connect(func(_r,_c,_h,_b):
		if is_instance_valid(http_presence): http_presence.queue_free(); http_presence = null)
	var body := JSON.stringify({
		"user_id": authed_user,
		"email": authed_user,
		"last_seen": Time.get_datetime_string_from_system(true) + "Z",
		"is_online": true,
		"current_app": "sportify"
	})
	http_presence.request(
		SUPABASE_URL + "/rest/v1/user_presence?on_conflict=email",
		PackedStringArray([
			"apikey: " + SUPABASE_ANON_KEY,
			"Authorization: Bearer " + authed_token,
			"Content-Type: application/json",
			"Prefer: resolution=merge-duplicates"
		]),
		HTTPClient.METHOD_POST,
		body
	)

func _set_presence(online: bool) -> void:
	if authed_user.is_empty() or authed_token.is_empty(): return
	var http := HTTPRequest.new()
	http.use_threads = false
	add_child(http)
	http.request_completed.connect(func(_r,_c,_h,_b): http.queue_free())
	var body := JSON.stringify({
		"is_online": online,
		"last_seen": Time.get_datetime_string_from_system(true) + "Z"
	})
	http.request(
		SUPABASE_URL + "/rest/v1/user_presence?email=eq." + authed_user.uri_encode(),
		PackedStringArray([
			"apikey: " + SUPABASE_ANON_KEY,
			"Authorization: Bearer " + authed_token,
			"Content-Type: application/json",
			"Prefer: return=minimal"
		]),
		HTTPClient.METHOD_PATCH,
		body
	)

func _build_songs() -> void:
	var seen_files: Dictionary = {}   # dosya adı tekrar kontrolü
	for i in RAW_SONGS.size():
		var e: Array = RAW_SONGS[i]
		var file_key: String = e[0]
		if seen_files.has(file_key):
			continue   # aynı dosya zaten eklendi, atla
		seen_files[file_key] = true
		var repo: String = e[3] if e.size() > 3 else "repo_1"
		var base: String = REPO_URLS.get(repo, BASE_URL)
		var real_idx: int = songs.size()   # songs dizisindeki gerçek pozisyon
		songs.append({
			"file":    e[0],
			"name":    e[1],
			"artist":  e[2] if e.size() > 2 else "",
			"repo":    repo,
			"url":     base + e[0],
			"emoji":   EMOJIS[i % EMOJIS.size()],
			"index":   real_idx,
		})

func _setup_audio() -> void:
	stream_player = AudioStreamPlayer.new()
	add_child(stream_player)
	stream_player.finished.connect(_on_song_finished)

	progress_timer = Timer.new()
	progress_timer.wait_time = 0.1
	progress_timer.timeout.connect(_update_progress)
	add_child(progress_timer)
	progress_timer.start()

# ─────────────────────────────────────────────────────────────
#  UI BUILD
# ─────────────────────────────────────────────────────────────
func _build_ui() -> void:
	set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)

	var root_vbox := VBoxContainer.new()
	root_vbox.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	root_vbox.add_theme_constant_override("separation", 0)
	add_child(root_vbox)

	# HEADER
	var header := _panel(Color(0.043, 0.043, 0.043, 1.0))
	header.custom_minimum_size = Vector2(0, 150)
	root_vbox.add_child(header)

	# Gradient şerit — üst renk çizgisi
	var hdr_stripe := ColorRect.new()
	hdr_stripe.color = Color(COLOR_ACCENT.r, COLOR_ACCENT.g, COLOR_ACCENT.b, 0.06)
	hdr_stripe.custom_minimum_size = Vector2(0, 3)
	hdr_stripe.set_anchors_and_offsets_preset(Control.PRESET_TOP_WIDE)
	header.add_child(hdr_stripe)

	var hdr_vbox := VBoxContainer.new()
	hdr_vbox.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	hdr_vbox.add_theme_constant_override("separation", 10)
	hdr_vbox.offset_left = 18; hdr_vbox.offset_right  = -18
	hdr_vbox.offset_top  = 16; hdr_vbox.offset_bottom = -10
	header.add_child(hdr_vbox)

	var logo_row := HBoxContainer.new()
	logo_row.add_theme_constant_override("separation", 8)
	hdr_vbox.add_child(logo_row)

	# Hamburger menü butonu
	var hamburger_btn := _make_btn()
	hamburger_btn.text = "☰"
	hamburger_btn.add_theme_font_size_override("font_size", 36)
	hamburger_btn.add_theme_color_override("font_color", COLOR_TEXT)
	hamburger_btn.custom_minimum_size = Vector2(64, 64)
	hamburger_btn.add_theme_stylebox_override("normal",  StyleBoxEmpty.new())
	hamburger_btn.add_theme_stylebox_override("hover",   _stylebox(Color(1,1,1,0.08), 10))
	hamburger_btn.add_theme_stylebox_override("pressed", _stylebox(Color(1,1,1,0.14), 10))
	hamburger_btn.add_theme_stylebox_override("focus",   StyleBoxEmpty.new())
	hamburger_btn.pressed.connect(_toggle_sidebar)
	logo_row.add_child(hamburger_btn)

	# Logo ikon kutusu
	var logo_icon_panel := _panel_radius(Color(COLOR_ACCENT.r, COLOR_ACCENT.g, COLOR_ACCENT.b, 0.18), 10)
	logo_icon_panel.custom_minimum_size = Vector2(56, 56)
	logo_row.add_child(logo_icon_panel)
	var logo_icon := Label.new()
	logo_icon.text = "♪"
	logo_icon.add_theme_font_size_override("font_size", 28)
	logo_icon.add_theme_color_override("font_color", COLOR_ACCENT)
	logo_icon.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
	logo_icon_panel.add_child(logo_icon)

	var logo := Label.new()
	logo.text = "Sportify"
	logo.add_theme_color_override("font_color", COLOR_TEXT)
	logo.add_theme_font_size_override("font_size", 32)
	logo.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	logo.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	logo_row.add_child(logo)

	status_label = Label.new()
	status_label.text = "%d sarki" % songs.size()
	status_label.add_theme_color_override("font_color", COLOR_MUTED)
	status_label.add_theme_font_size_override("font_size", 13)
	status_label.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	logo_row.add_child(status_label)

	search_field = LineEdit.new()
	search_field.placeholder_text = "♫  Sarki ara..."
	search_field.custom_minimum_size.y = 54
	search_field.add_theme_color_override("font_color", COLOR_TEXT)
	search_field.add_theme_color_override("font_placeholder_color", COLOR_MUTED)
	search_field.add_theme_font_size_override("font_size", 16)
	search_field.add_theme_stylebox_override("normal",
		_stylebox(Color(0.078, 0.067, 0.137, 1.0), 14, COLOR_BORDER, 1))
	search_field.add_theme_stylebox_override("focus",
		_stylebox(Color(0.078, 0.067, 0.137, 1.0), 14,
		Color(COLOR_ACCENT.r, COLOR_ACCENT.g, COLOR_ACCENT.b, 0.7), 1))
	search_field.text_changed.connect(_on_search_changed)
	hdr_vbox.add_child(search_field)

	# İÇERİK ALANI (tab'a göre değişir)
	var content_wrap := Control.new()
	content_wrap.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	content_wrap.size_flags_vertical   = Control.SIZE_EXPAND_FILL
	root_vbox.add_child(content_wrap)

	# ── TAB: TÜM ŞARKILAR ──
	content_all = HBoxContainer.new()
	content_all.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	content_all.add_theme_constant_override("separation", 0)
	content_wrap.add_child(content_all)

	var scroll := ScrollContainer.new()
	scroll.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	scroll.size_flags_vertical   = Control.SIZE_EXPAND_FILL
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	scroll.vertical_scroll_mode   = ScrollContainer.SCROLL_MODE_SHOW_NEVER
	content_all.add_child(scroll)
	song_scroll = scroll

	var scroll_strip := Control.new()
	scroll_strip.custom_minimum_size = Vector2(80, 0)
	scroll_strip.size_flags_vertical = Control.SIZE_EXPAND_FILL
	scroll_strip.mouse_filter = Control.MOUSE_FILTER_PASS
	content_all.add_child(scroll_strip)

	scroll_strip.gui_input.connect(func(ev: InputEvent):
		if ev is InputEventScreenDrag or ev is InputEventMouseMotion:
			var dy: float = 0.0
			if ev is InputEventScreenDrag:
				dy = -(ev as InputEventScreenDrag).relative.y
			elif ev is InputEventMouseMotion and (ev as InputEventMouseMotion).button_mask != 0:
				dy = -(ev as InputEventMouseMotion).relative.y
			if dy != 0.0:
				scroll.scroll_vertical += int(dy)
	)

	var list_margin := MarginContainer.new()
	list_margin.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	list_margin.add_theme_constant_override("margin_left",   12)
	list_margin.add_theme_constant_override("margin_right",  12)
	list_margin.add_theme_constant_override("margin_top",    10)
	list_margin.add_theme_constant_override("margin_bottom", 10)
	scroll.add_child(list_margin)

	song_list_vbox = VBoxContainer.new()
	song_list_vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	song_list_vbox.add_theme_constant_override("separation", 2)
	list_margin.add_child(song_list_vbox)



	# ── TAB: EN ÇOK DİNLENENLER ──
	content_top = VBoxContainer.new()
	content_top.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	content_top.add_theme_constant_override("separation", 0)
	content_top.visible = false
	content_wrap.add_child(content_top)

	# Yenile butonu satırı
	var top_bar := MarginContainer.new()
	top_bar.add_theme_constant_override("margin_left",  12)
	top_bar.add_theme_constant_override("margin_right", 12)
	top_bar.add_theme_constant_override("margin_top",    8)
	top_bar.add_theme_constant_override("margin_bottom", 4)
	content_top.add_child(top_bar)

	var refresh_btn := _make_btn()
	refresh_btn.text = "↻  Yenile"
	refresh_btn.custom_minimum_size.y = 38
	refresh_btn.add_theme_font_size_override("font_size", 13)
	refresh_btn.add_theme_color_override("font_color", COLOR_ACCENT)
	refresh_btn.add_theme_stylebox_override("normal",
		_stylebox(Color(COLOR_ACCENT.r, COLOR_ACCENT.g, COLOR_ACCENT.b, 0.10), 8, COLOR_BORDER, 1))
	refresh_btn.add_theme_stylebox_override("hover",
		_stylebox(Color(COLOR_ACCENT.r, COLOR_ACCENT.g, COLOR_ACCENT.b, 0.22), 8))
	refresh_btn.add_theme_stylebox_override("pressed",
		_stylebox(Color(COLOR_ACCENT.r, COLOR_ACCENT.g, COLOR_ACCENT.b, 0.06), 8))
	refresh_btn.add_theme_stylebox_override("focus", StyleBoxEmpty.new())
	refresh_btn.pressed.connect(func():
		download_counts.clear()
		_fetch_top_songs()
	)
	top_bar.add_child(refresh_btn)

	# Liste + scroll şeridi
	var top_hbox := HBoxContainer.new()
	top_hbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	top_hbox.size_flags_vertical   = Control.SIZE_EXPAND_FILL
	top_hbox.add_theme_constant_override("separation", 0)
	content_top.add_child(top_hbox)

	var top_scroll := ScrollContainer.new()
	top_scroll.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	top_scroll.size_flags_vertical   = Control.SIZE_EXPAND_FILL
	top_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	top_scroll.vertical_scroll_mode   = ScrollContainer.SCROLL_MODE_SHOW_NEVER
	top_hbox.add_child(top_scroll)

	var top_scroll_strip := Control.new()
	top_scroll_strip.custom_minimum_size = Vector2(80, 0)
	top_scroll_strip.size_flags_vertical = Control.SIZE_EXPAND_FILL
	top_scroll_strip.mouse_filter = Control.MOUSE_FILTER_PASS
	top_hbox.add_child(top_scroll_strip)

	top_scroll_strip.gui_input.connect(func(ev: InputEvent):
		if ev is InputEventScreenDrag or ev is InputEventMouseMotion:
			var dy: float = 0.0
			if ev is InputEventScreenDrag:
				dy = -(ev as InputEventScreenDrag).relative.y
			elif ev is InputEventMouseMotion and (ev as InputEventMouseMotion).button_mask != 0:
				dy = -(ev as InputEventMouseMotion).relative.y
			if dy != 0.0:
				top_scroll.scroll_vertical += int(dy)
	)

	var top_margin := MarginContainer.new()
	top_margin.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	top_margin.add_theme_constant_override("margin_left",  12)
	top_margin.add_theme_constant_override("margin_right", 12)
	top_margin.add_theme_constant_override("margin_top",    6)
	top_margin.add_theme_constant_override("margin_bottom",10)
	top_scroll.add_child(top_margin)

	top_list_vbox = VBoxContainer.new()
	top_list_vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	top_list_vbox.add_theme_constant_override("separation", 5)
	top_margin.add_child(top_list_vbox)

	# ── TAB: ÇALMA LİSTELERİ ──
	content_pl = VBoxContainer.new()
	content_pl.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	content_pl.add_theme_constant_override("separation", 0)
	content_pl.visible = false
	content_wrap.add_child(content_pl)

	# Yeni liste oluştur butonu
	var new_pl_margin := MarginContainer.new()
	new_pl_margin.add_theme_constant_override("margin_left", 12)
	new_pl_margin.add_theme_constant_override("margin_right", 12)
	new_pl_margin.add_theme_constant_override("margin_top", 10)
	new_pl_margin.add_theme_constant_override("margin_bottom", 6)
	content_pl.add_child(new_pl_margin)

	var new_pl_btn := _make_btn()
	new_pl_btn.text = "+ Yeni Calma Listesi"
	new_pl_btn.custom_minimum_size.y = 48
	new_pl_btn.add_theme_font_size_override("font_size", 15)
	new_pl_btn.add_theme_color_override("font_color", COLOR_BG)
	new_pl_btn.add_theme_stylebox_override("normal",  _stylebox(COLOR_ACCENT, 10))
	new_pl_btn.add_theme_stylebox_override("hover",   _stylebox(COLOR_ACCENT2, 10))
	new_pl_btn.add_theme_stylebox_override("pressed", _stylebox(COLOR_ACCENT.darkened(0.15), 10))
	new_pl_btn.add_theme_stylebox_override("focus",   StyleBoxEmpty.new())
	new_pl_btn.pressed.connect(_on_new_playlist)
	new_pl_margin.add_child(new_pl_btn)

	# Çalma listesi içerik scroll
	var pl_scroll := ScrollContainer.new()
	pl_scroll.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	pl_scroll.size_flags_vertical   = Control.SIZE_EXPAND_FILL
	pl_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	content_pl.add_child(pl_scroll)

	var pl_margin2 := MarginContainer.new()
	pl_margin2.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	pl_margin2.add_theme_constant_override("margin_left",  12)
	pl_margin2.add_theme_constant_override("margin_right", 12)
	pl_margin2.add_theme_constant_override("margin_top",    6)
	pl_margin2.add_theme_constant_override("margin_bottom", 10)
	pl_scroll.add_child(pl_margin2)

	playlist_list_vbox = VBoxContainer.new()
	playlist_list_vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	playlist_list_vbox.add_theme_constant_override("separation", 8)
	pl_margin2.add_child(playlist_list_vbox)

	# ── TAB: FAVORİLER ──
	content_fav = VBoxContainer.new()
	content_fav.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	content_fav.add_theme_constant_override("separation", 0)
	content_fav.visible = false
	content_wrap.add_child(content_fav)

	var fav_hbox := HBoxContainer.new()
	fav_hbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	fav_hbox.size_flags_vertical   = Control.SIZE_EXPAND_FILL
	fav_hbox.add_theme_constant_override("separation", 0)
	content_fav.add_child(fav_hbox)

	var fav_scroll := ScrollContainer.new()
	fav_scroll.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	fav_scroll.size_flags_vertical   = Control.SIZE_EXPAND_FILL
	fav_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	fav_scroll.vertical_scroll_mode   = ScrollContainer.SCROLL_MODE_SHOW_NEVER
	fav_hbox.add_child(fav_scroll)

	var fav_strip := Control.new()
	fav_strip.custom_minimum_size = Vector2(80, 0)
	fav_strip.size_flags_vertical = Control.SIZE_EXPAND_FILL
	fav_strip.mouse_filter = Control.MOUSE_FILTER_PASS
	fav_hbox.add_child(fav_strip)
	fav_strip.gui_input.connect(func(ev: InputEvent):
		if ev is InputEventScreenDrag or ev is InputEventMouseMotion:
			var dy: float = 0.0
			if ev is InputEventScreenDrag:
				dy = -(ev as InputEventScreenDrag).relative.y
			elif ev is InputEventMouseMotion and (ev as InputEventMouseMotion).button_mask != 0:
				dy = -(ev as InputEventMouseMotion).relative.y
			if dy != 0.0:
				fav_scroll.scroll_vertical += int(dy)
	)

	var fav_margin := MarginContainer.new()
	fav_margin.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	fav_margin.add_theme_constant_override("margin_left",  12)
	fav_margin.add_theme_constant_override("margin_right", 12)
	fav_margin.add_theme_constant_override("margin_top",    6)
	fav_margin.add_theme_constant_override("margin_bottom", 10)
	fav_scroll.add_child(fav_margin)

	fav_list_vbox = VBoxContainer.new()
	fav_list_vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	fav_list_vbox.add_theme_constant_override("separation", 2)
	fav_margin.add_child(fav_list_vbox)

	# ── TAB: İNDİRİLENLER ──
	content_dl = VBoxContainer.new()
	content_dl.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	content_dl.add_theme_constant_override("separation", 0)
	content_dl.visible = false
	content_wrap.add_child(content_dl)

	var dl_scroll := ScrollContainer.new()
	dl_scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	dl_scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	content_dl.add_child(dl_scroll)

	var dl_margin := MarginContainer.new()
	dl_margin.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	dl_margin.add_theme_constant_override("margin_left",  12)
	dl_margin.add_theme_constant_override("margin_right", 12)
	dl_margin.add_theme_constant_override("margin_top",    6)
	dl_margin.add_theme_constant_override("margin_bottom", 10)
	dl_scroll.add_child(dl_margin)

	dl_list_vbox = VBoxContainer.new()
	dl_list_vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	dl_list_vbox.add_theme_constant_override("separation", 5)
	dl_margin.add_child(dl_list_vbox)

	# ── SİDEBAR OVERLAY (karartma) ──
	sidebar_overlay = ColorRect.new()
	sidebar_overlay.color = Color(0, 0, 0, 0)
	sidebar_overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	sidebar_overlay.z_index = 50
	sidebar_overlay.mouse_filter = Control.MOUSE_FILTER_IGNORE
	add_child(sidebar_overlay)
	sidebar_overlay.gui_input.connect(func(ev):
		if ev is InputEventMouseButton and (ev as InputEventMouseButton).pressed:
			_close_sidebar()
	)

	# ── SİDEBAR PANELİ ──
	sidebar_panel = PanelContainer.new()
	sidebar_panel.add_theme_stylebox_override("panel", _stylebox(Color(0.059, 0.059, 0.059, 1.0), 0))
	sidebar_panel.set_anchors_and_offsets_preset(Control.PRESET_LEFT_WIDE)
	sidebar_panel.offset_right = 260
	sidebar_panel.offset_left  = -260
	sidebar_panel.z_index = 51
	add_child(sidebar_panel)

	var sb_vbox := VBoxContainer.new()
	sb_vbox.add_theme_constant_override("separation", 4)
	sb_vbox.offset_left = 0; sb_vbox.offset_right = 0
	sb_vbox.offset_top = 0; sb_vbox.offset_bottom = 0
	sb_vbox.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	sb_vbox.add_theme_constant_override("margin_left", 12)
	sidebar_panel.add_child(sb_vbox)

	# Sidebar üst kısım — logo + kapat butonu
	var sb_top := HBoxContainer.new()
	sb_top.add_theme_constant_override("separation", 8)
	sb_top.custom_minimum_size.y = 56
	sb_vbox.add_child(sb_top)

	var sb_logo_panel := _panel_radius(Color(COLOR_ACCENT.r, COLOR_ACCENT.g, COLOR_ACCENT.b, 0.18), 10)
	sb_logo_panel.custom_minimum_size = Vector2(36, 36)
	sb_top.add_child(sb_logo_panel)
	var sb_logo_icon := Label.new()
	sb_logo_icon.text = "♪"
	sb_logo_icon.add_theme_font_size_override("font_size", 18)
	sb_logo_icon.add_theme_color_override("font_color", COLOR_ACCENT)
	sb_logo_icon.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
	sb_logo_panel.add_child(sb_logo_icon)

	var sb_title := Label.new()
	sb_title.text = "Sportify"
	sb_title.add_theme_color_override("font_color", COLOR_TEXT)
	sb_title.add_theme_font_size_override("font_size", 22)
	sb_title.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	sb_title.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	sb_top.add_child(sb_title)

	var sb_close := _make_btn()
	sb_close.text = "✕"
	sb_close.add_theme_font_size_override("font_size", 18)
	sb_close.add_theme_color_override("font_color", COLOR_MUTED)
	sb_close.custom_minimum_size = Vector2(40, 40)
	sb_close.add_theme_stylebox_override("normal",  StyleBoxEmpty.new())
	sb_close.add_theme_stylebox_override("hover",   _stylebox(Color(1,1,1,0.08), 8))
	sb_close.add_theme_stylebox_override("focus",   StyleBoxEmpty.new())
	sb_close.pressed.connect(_close_sidebar)
	sb_top.add_child(sb_close)

	# Ayırıcı çizgi
	var sb_sep := ColorRect.new()
	sb_sep.color = COLOR_BORDER
	sb_sep.custom_minimum_size.y = 1
	sb_vbox.add_child(sb_sep)

	var sb_margin := MarginContainer.new()
	sb_margin.add_theme_constant_override("margin_left", 8)
	sb_margin.add_theme_constant_override("margin_right", 8)
	sb_margin.add_theme_constant_override("margin_top", 8)
	sb_vbox.add_child(sb_margin)

	var sb_items := VBoxContainer.new()
	sb_items.add_theme_constant_override("separation", 4)
	sb_margin.add_child(sb_items)

	# Sidebar menü öğeleri
	var menu_items := [
		["🎵", "Tüm Şarkılar",        "all"],
		["📋", "Çalma Listeleri",      "playlists"],
		["🔥", "En Çok Dinlenenler",   "top"],
		["♥",  "Favoriler",           "favorites"],
		["⬇",  "İndirilenler",        "downloads"],
	]
	tab_all_btn = null
	tab_pl_btn  = null
	tab_top_btn = null
	tab_fav_btn = null
	tab_dl_btn  = null

	for item in menu_items:
		var sb_btn := _make_btn()
		sb_btn.text = item[0] + "  " + item[1]
		sb_btn.alignment = HORIZONTAL_ALIGNMENT_LEFT
		sb_btn.custom_minimum_size.y = 50
		sb_btn.add_theme_font_size_override("font_size", 15)
		var tab_key: String = item[2]
		var is_active: bool = tab_key == "all"
		if is_active:
			sb_btn.add_theme_color_override("font_color", COLOR_TEXT)
			sb_btn.add_theme_stylebox_override("normal", _stylebox(Color(COLOR_ACCENT.r, COLOR_ACCENT.g, COLOR_ACCENT.b, 0.18), 12, COLOR_BORDER, 1))
		else:
			sb_btn.add_theme_color_override("font_color", COLOR_MUTED)
			sb_btn.add_theme_stylebox_override("normal", StyleBoxEmpty.new())
		sb_btn.add_theme_stylebox_override("hover",   _stylebox(Color(1,1,1,0.07), 12))
		sb_btn.add_theme_stylebox_override("pressed", _stylebox(Color(COLOR_ACCENT.r, COLOR_ACCENT.g, COLOR_ACCENT.b, 0.22), 12))
		sb_btn.add_theme_stylebox_override("focus",   StyleBoxEmpty.new())
		sb_btn.pressed.connect(func():
			_switch_tab(tab_key)
			_close_sidebar()
		)
		sb_items.add_child(sb_btn)
		match tab_key:
			"all":       tab_all_btn = sb_btn
			"playlists": tab_pl_btn  = sb_btn
			"top":       tab_top_btn = sb_btn
			"favorites": tab_fav_btn = sb_btn
			"downloads": tab_dl_btn  = sb_btn

	# PLAYER BARI
	var player_panel := _panel(Color(0.067, 0.067, 0.067, 1.0))
	player_panel.custom_minimum_size = Vector2(0, 162)
	root_vbox.add_child(player_panel)

	# Üst ince ayırıcı çizgi (Spotify gibi çok ince gri)
	var top_line := ColorRect.new()
	top_line.color = Color(1, 1, 1, 0.10)
	top_line.custom_minimum_size = Vector2(0, 1)
	top_line.set_anchors_and_offsets_preset(Control.PRESET_TOP_WIDE)
	player_panel.add_child(top_line)

	var pl_margin := MarginContainer.new()
	pl_margin.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	pl_margin.add_theme_constant_override("margin_left",   16)
	pl_margin.add_theme_constant_override("margin_right",  16)
	pl_margin.add_theme_constant_override("margin_top",    10)
	pl_margin.add_theme_constant_override("margin_bottom", 10)
	player_panel.add_child(pl_margin)

	var pl_vbox := VBoxContainer.new()
	pl_vbox.add_theme_constant_override("separation", 2)
	pl_margin.add_child(pl_vbox)

	# Seek bar
	seek_bar = SeekBar.new()
	seek_bar.custom_minimum_size.y = 28
	seek_bar.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	seek_bar.on_seek = func(pct: float): _seek_to(pct)
	pl_vbox.add_child(seek_bar)

	# Süre satırı
	var time_row := HBoxContainer.new()
	time_row.add_theme_constant_override("separation", 0)
	pl_vbox.add_child(time_row)

	time_label = Label.new()
	time_label.text = "0:00"
	time_label.add_theme_color_override("font_color", COLOR_MUTED)
	time_label.add_theme_font_size_override("font_size", 11)
	time_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	time_row.add_child(time_label)

	duration_label = Label.new()
	duration_label.text = "0:00"
	duration_label.add_theme_color_override("font_color", COLOR_MUTED)
	duration_label.add_theme_font_size_override("font_size", 11)
	time_row.add_child(duration_label)

	# Şimdi çalan
	var now_row := HBoxContainer.new()
	now_row.add_theme_constant_override("separation", 12)
	now_row.custom_minimum_size.y = 68
	pl_vbox.add_child(now_row)

	var cover_panel := _panel_radius(Color(COLOR_ACCENT.r * 0.6, COLOR_ACCENT.g * 0.3, COLOR_ACCENT.b * 0.9, 1.0), 14)
	cover_panel.custom_minimum_size = Vector2(56, 56)
	now_row.add_child(cover_panel)

	now_cover_label = Label.new()
	now_cover_label.text = "🎵"
	now_cover_label.add_theme_font_size_override("font_size", 30)
	now_cover_label.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
	cover_panel.add_child(now_cover_label)

	var info_vbox := VBoxContainer.new()
	info_vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	info_vbox.add_theme_constant_override("separation", 2)
	now_row.add_child(info_vbox)

	now_playing_label = Label.new()
	now_playing_label.text = "Bir sarki sec..."
	now_playing_label.add_theme_color_override("font_color", COLOR_TEXT)
	now_playing_label.add_theme_font_size_override("font_size", 15)
	now_playing_label.clip_text = true
	info_vbox.add_child(now_playing_label)

	var artist_lbl := Label.new()
	artist_lbl.text = "Sportify Music"
	artist_lbl.add_theme_color_override("font_color", COLOR_ACCENT)
	artist_lbl.add_theme_font_size_override("font_size", 12)
	info_vbox.add_child(artist_lbl)
	now_playing_artist = artist_lbl

	var right_col := VBoxContainer.new()
	right_col.add_theme_constant_override("separation", 4)
	now_row.add_child(right_col)

	var controls := HBoxContainer.new()
	controls.add_theme_constant_override("separation", 6)
	right_col.add_child(controls)

	var prev_btn := _ctrl_btn("⏮", false)
	prev_btn.pressed.connect(_on_prev)
	controls.add_child(prev_btn)

	play_btn = _ctrl_btn("▶", true)
	play_btn.pressed.connect(_on_play_pause)
	controls.add_child(play_btn)

	var next_btn := _ctrl_btn("⏭", false)
	next_btn.pressed.connect(_on_next)
	controls.add_child(next_btn)



# ─────────────────────────────────────────────────────────────
#  RENDER
# ─────────────────────────────────────────────────────────────
func _refresh_song_highlights() -> void:
	# Sadece ESKİ aktif satır ve YENİ aktif satır güncellenir — tüm liste değil!
	var new_active_idx: int = current_index if current_index >= 0 else -1

	# Sadece 2 satırı güncelle
	if _prev_active_idx != new_active_idx:
		_update_row_style(_prev_active_idx, false)
		_update_row_style(new_active_idx, true)
		_prev_active_idx = new_active_idx

func _update_row_style(idx: int, is_cur: bool) -> void:
	if idx < 0 or idx >= song_row_refs.size(): return
	var row = song_row_refs[idx]
	if not is_instance_valid(row): return

	# Aktif: hafif yeşil highlight, pasif: tamamen şeffaf
	if is_cur:
		row.add_theme_stylebox_override("panel",
			_stylebox(Color(COLOR_ACCENT.r, COLOR_ACCENT.g, COLOR_ACCENT.b, 0.10), 8,
			Color(COLOR_ACCENT.r, COLOR_ACCENT.g, COLOR_ACCENT.b, 0.4), 1))
	else:
		row.add_theme_stylebox_override("panel",
			_stylebox(Color(0, 0, 0, 0), 0))

	if row.get_child_count() == 0: return
	var btn: Node = row.get_child(0)
	if btn == null: return
	if btn.get_child_count() == 0: return
	var hbox: Node = btn.get_child(0)
	if hbox == null: return

	if hbox.get_child_count() > 2:
		var iv = hbox.get_child(2)
		if iv is VBoxContainer and iv.get_child_count() > 0:
			var tl = iv.get_child(0)
			if tl is Label:
				tl.add_theme_color_override("font_color", COLOR_ACCENT if is_cur else COLOR_TEXT)
			if iv.get_child_count() > 1:
				var sl = iv.get_child(1)
				if sl is Label:
					sl.add_theme_color_override("font_color", COLOR_MUTED)


func _render_songs() -> void:
	for ch in song_list_vbox.get_children(): ch.queue_free()
	song_row_refs.clear()
	_prev_active_idx = -1
	if is_instance_valid(song_scroll):
		song_scroll.scroll_vertical = 0
	for i in songs.size():
		var song: Dictionary = songs[i]
		var is_cur: bool = (current_index >= 0 and i == current_index)
		var row := _song_row(i + 1, song, is_cur)
		song_list_vbox.add_child(row)
		song_row_refs.append(row)
		if is_cur: _prev_active_idx = i

func _on_toggle_favorite(fav_btn: Button) -> void:
	if current_index < 0 or current_index >= songs.size(): return
	var idx := current_index
	if idx in favorites:
		favorites.erase(idx)
		fav_btn.add_theme_color_override("font_color", COLOR_MUTED)
		fav_btn.add_theme_stylebox_override("normal", _stylebox(Color(0.12, 0.10, 0.10, 1.0), 8, COLOR_BORDER, 1))
		_show_toast("Favorilerden cikarildi")
	else:
		favorites.append(idx)
		fav_btn.add_theme_color_override("font_color", Color(0.95, 0.25, 0.35))
		fav_btn.add_theme_stylebox_override("normal", _stylebox(Color(0.22, 0.08, 0.10, 1.0), 8, Color(0.95, 0.25, 0.35, 0.5), 1))
		_show_toast("Favorilere eklendi ♥")
	_save_favorites()

func _update_fav_btn() -> void:
	# Player bar'daki ♥ butonunu şarkıya göre güncelle
	var fav_btn := get_node_or_null("FavBtn")
	# Butonu root altında değil right_col altında ara
	for ch in get_children():
		if ch.name == "FavBtn":
			fav_btn = ch; break
	if not is_instance_valid(fav_btn): return
	if current_index in favorites:
		fav_btn.add_theme_color_override("font_color", Color(0.95, 0.25, 0.35))
		fav_btn.add_theme_stylebox_override("normal", _stylebox(Color(0.22, 0.08, 0.10, 1.0), 8, Color(0.95, 0.25, 0.35, 0.5), 1))
	else:
		fav_btn.add_theme_color_override("font_color", COLOR_MUTED)
		fav_btn.add_theme_stylebox_override("normal", _stylebox(Color(0.12, 0.10, 0.10, 1.0), 8, COLOR_BORDER, 1))

func _render_favorites() -> void:
	for ch in fav_list_vbox.get_children(): ch.queue_free()
	if favorites.is_empty():
		var empty_lbl := Label.new()
		empty_lbl.text = "Henuz favori eklemediniz.\n♥ butonu ile sarki ekleyin."
		empty_lbl.add_theme_color_override("font_color", COLOR_MUTED)
		empty_lbl.add_theme_font_size_override("font_size", 14)
		empty_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		empty_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		empty_lbl.custom_minimum_size = Vector2(0, 100)
		fav_list_vbox.add_child(empty_lbl)
		return
	for i in favorites.size():
		var song_idx: int = favorites[i]
		if song_idx >= songs.size(): continue
		var song: Dictionary = songs[song_idx]
		var is_cur := song_idx == current_index
		var row := _song_row(i + 1, song, is_cur)
		fav_list_vbox.add_child(row)

func _render_downloads() -> void:
	for ch in dl_list_vbox.get_children(): ch.queue_free()
	if downloaded_songs.is_empty():
		var empty_lbl := Label.new()
		empty_lbl.text = "Henuz indirilen sarki yok.\n⬇ butonu ile sarki indir."
		empty_lbl.add_theme_color_override("font_color", COLOR_MUTED)
		empty_lbl.add_theme_font_size_override("font_size", 14)
		empty_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		empty_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		empty_lbl.custom_minimum_size = Vector2(0, 100)
		dl_list_vbox.add_child(empty_lbl)
		return
	for i in downloaded_songs.size():
		var file_key: String = downloaded_songs[i]
		var song_idx: int = -1
		for j in songs.size():
			if songs[j]["file"] == file_key:
				song_idx = j; break
		if song_idx < 0: continue
		var song: Dictionary = songs[song_idx]
		var is_cur := song_idx == current_index

		var outer := MarginContainer.new()
		outer.add_theme_constant_override("margin_bottom", 0)
		dl_list_vbox.add_child(outer)

		var panel := PanelContainer.new()
		var bdr := Color(COLOR_ACCENT.r, COLOR_ACCENT.g, COLOR_ACCENT.b, 0.4) if is_cur else COLOR_BORDER
		panel.add_theme_stylebox_override("panel",
			_stylebox(COLOR_CARD_ON if is_cur else COLOR_CARD, 12, bdr, 1))
		outer.add_child(panel)

		var hbox := HBoxContainer.new()
		hbox.add_theme_constant_override("separation", 0)
		panel.add_child(hbox)

		var song_btn := _make_btn()
		song_btn.flat = true
		song_btn.custom_minimum_size.y = 62
		song_btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		song_btn.alignment = HORIZONTAL_ALIGNMENT_LEFT
		song_btn.add_theme_stylebox_override("normal",  StyleBoxEmpty.new())
		song_btn.add_theme_stylebox_override("hover",   _stylebox(Color(COLOR_ACCENT.r, COLOR_ACCENT.g, COLOR_ACCENT.b, 0.07), 10))
		song_btn.add_theme_stylebox_override("pressed", _stylebox(Color(COLOR_ACCENT.r, COLOR_ACCENT.g, COLOR_ACCENT.b, 0.13), 10))
		song_btn.add_theme_stylebox_override("focus",   StyleBoxEmpty.new())
		song_btn.pressed.connect(_on_song_pressed.bind(song_idx))
		hbox.add_child(song_btn)

		var inner := HBoxContainer.new()
		inner.add_theme_constant_override("separation", 12)
		inner.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		inner.offset_left = 10; inner.offset_right = -8
		song_btn.add_child(inner)

		var num_lbl := Label.new()
		num_lbl.text = str(i + 1)
		num_lbl.add_theme_font_size_override("font_size", 12)
		num_lbl.add_theme_color_override("font_color", COLOR_ACCENT if is_cur else COLOR_MUTED)
		num_lbl.custom_minimum_size.x = 26
		num_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		num_lbl.vertical_alignment   = VERTICAL_ALIGNMENT_CENTER
		inner.add_child(num_lbl)

		var ep := _panel(Color(COLOR_ACCENT.r, COLOR_ACCENT.g, COLOR_ACCENT.b, 0.13) if is_cur else Color(0.098, 0.098, 0.153, 1.0))
		ep.custom_minimum_size = Vector2(52, 52)
		inner.add_child(ep)
		var el := Label.new()
		el.text = song["emoji"]
		el.add_theme_font_size_override("font_size", 26)
		el.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
		ep.add_child(el)

		var iv := VBoxContainer.new()
		iv.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		iv.size_flags_vertical   = Control.SIZE_SHRINK_CENTER
		iv.add_theme_constant_override("separation", 2)
		inner.add_child(iv)

		var tl := Label.new()
		tl.text = song["name"]
		tl.add_theme_font_size_override("font_size", 14)
		tl.add_theme_color_override("font_color", COLOR_ACCENT2 if is_cur else COLOR_TEXT)
		tl.clip_text = true
		iv.add_child(tl)

		var sl := Label.new()
		sl.text = _artist_label(song)
		sl.add_theme_font_size_override("font_size", 11)
		sl.add_theme_color_override("font_color", Color(COLOR_MUTED.r, COLOR_MUTED.g, COLOR_MUTED.b, 0.7))
		sl.clip_text = true
		iv.add_child(sl)

		# ✕ sil butonu
		var remove_btn := _make_btn()
		remove_btn.text = "✕"
		remove_btn.custom_minimum_size = Vector2(44, 62)
		remove_btn.add_theme_font_size_override("font_size", 14)
		remove_btn.add_theme_color_override("font_color", COLOR_MUTED)
		remove_btn.add_theme_stylebox_override("normal",  StyleBoxEmpty.new())
		remove_btn.add_theme_stylebox_override("hover",   _stylebox(Color(0.8, 0.2, 0.2, 0.15), 8))
		remove_btn.add_theme_stylebox_override("focus",   StyleBoxEmpty.new())
		remove_btn.pressed.connect(func():
			downloaded_songs.erase(file_key)
			_save_downloads()
			cache.erase(file_key)
			DirAccess.remove_absolute("user://downloads/" + file_key)
			_render_downloads()
			_show_toast("Indirilenden kaldirildi")
		)
		hbox.add_child(remove_btn)

func _download_song(song_idx: int) -> void:
	var song := songs[song_idx]
	var file_key: String = song["file"]
	if cdn_url_cache.has(file_key):
		_do_download(song_idx, cdn_url_cache[file_key])
	else:
		_show_toast("Baglaniyor...")
		var http_redir := HTTPRequest.new()
		http_redir.max_redirects = 0
		http_redir.use_threads = false
		add_child(http_redir)
		http_redir.request_completed.connect(func(_r, code, headers, _b):
			http_redir.queue_free()
			var url: String = song["url"]
			if code == 301 or code == 302:
				for h in headers:
					if (h as String).to_lower().begins_with("location:"):
						url = (h as String).substr(9).strip_edges()
						break
				cdn_url_cache[file_key] = url
			_do_download(song_idx, url)
		)
		http_redir.request(song["url"], PackedStringArray([
			"User-Agent: GodotEngine/4.3 (compatible; Sportify/1.0)"
		]))

func _do_download(song_idx: int, url: String) -> void:
	var song := songs[song_idx]
	var file_key: String = song["file"]
	_show_toast("Indiriliyor: " + song["name"])
	if is_instance_valid(http_dl):
		http_dl.cancel_request(); http_dl.queue_free()
	http_dl = HTTPRequest.new()
	http_dl.max_redirects = 5
	http_dl.use_threads = true
	add_child(http_dl)
	http_dl.request_completed.connect(_on_dl_done.bind(song_idx, file_key))
	http_dl.request(url, PackedStringArray([
		"User-Agent: GodotEngine/4.3 (compatible; Sportify/1.0)"
	]))

func _on_dl_done(result: int, code: int,
		_headers: PackedStringArray, body: PackedByteArray,
		song_idx: int, file_key: String) -> void:
	if is_instance_valid(http_dl): http_dl.queue_free(); http_dl = null
	if result != HTTPRequest.RESULT_SUCCESS or code != 200 or body.size() < 512:
		_show_toast("Indirme basarisiz!"); return
	var dir := DirAccess.open("user://")
	if not dir.dir_exists("downloads"):
		dir.make_dir("downloads")
	var path := "user://downloads/" + file_key
	var f := FileAccess.open(path, FileAccess.WRITE)
	if f:
		f.store_buffer(body); f.close()
		cache[file_key] = body
		if cache.size() > MAX_CACHE: cache.erase(cache.keys()[0])
		if file_key not in downloaded_songs:
			downloaded_songs.append(file_key)
			_save_downloads()
		_show_toast("İndirildi: " + songs[song_idx]["name"] + " ✓")
		if active_tab == "downloads": _render_downloads()
	else:
		_show_toast("Dosya kaydedilemedi!")

func _save_downloads() -> void:
	var f := FileAccess.open("user://downloads.dat", FileAccess.WRITE)
	if f: f.store_var(downloaded_songs); f.close()

func _load_downloads() -> void:
	if FileAccess.file_exists("user://downloads.dat"):
		var f := FileAccess.open("user://downloads.dat", FileAccess.READ)
		if f:
			var d = f.get_var(); f.close()
			if d is Array: downloaded_songs = d
	for file_key in downloaded_songs:
		var path: String = "user://downloads/" + file_key
		if FileAccess.file_exists(path) and not cache.has(file_key):
			var f2 := FileAccess.open(path, FileAccess.READ)
			if f2:
				cache[file_key] = f2.get_buffer(f2.get_length())
				f2.close()


func _save_favorites() -> void:
	var f := FileAccess.open("user://favorites.dat", FileAccess.WRITE)
	if f: f.store_var(favorites); f.close()

func _load_favorites() -> void:
	if FileAccess.file_exists("user://favorites.dat"):
		var f := FileAccess.open("user://favorites.dat", FileAccess.READ)
		if f:
			var d = f.get_var(); f.close()
			if d is Array: favorites = d

func _render_playlists() -> void:
	for child in playlist_list_vbox.get_children():
		child.queue_free()

	if playlists.is_empty():
		var empty := Label.new()
		empty.text = "Henuz calma listesi yok.\n+ butonu ile yeni liste olustur!"
		empty.add_theme_color_override("font_color", COLOR_MUTED)
		empty.add_theme_font_size_override("font_size", 14)
		empty.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		empty.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		empty.custom_minimum_size = Vector2(0, 100)
		playlist_list_vbox.add_child(empty)
		return

	# Rengarenk gradient renkler
	var gradients: Array = [
		[Color(0.486, 0.149, 0.780), Color(0.800, 0.200, 0.600)],
		[Color(0.200, 0.400, 0.900), Color(0.400, 0.100, 0.800)],
		[Color(0.900, 0.300, 0.100), Color(0.900, 0.600, 0.100)],
		[Color(0.100, 0.600, 0.400), Color(0.100, 0.400, 0.800)],
		[Color(0.700, 0.100, 0.300), Color(0.900, 0.400, 0.100)],
		[Color(0.100, 0.500, 0.700), Color(0.300, 0.100, 0.700)],
	]

	var i := 0
	for pl_name in playlists.keys():
		var indices: Array = playlists[pl_name]
		var grad = gradients[i % gradients.size()]
		var col1: Color = grad[0]
		var col2: Color = grad[1]

		# Ana kart
		var card := PanelContainer.new()
		var card_sb := StyleBoxFlat.new()
		card_sb.bg_color = col1
		card_sb.set_corner_radius_all(14)
		card.add_theme_stylebox_override("panel", card_sb)
		card.custom_minimum_size.y = 90
		playlist_list_vbox.add_child(card)

		var hbox := HBoxContainer.new()
		hbox.add_theme_constant_override("separation", 14)
		hbox.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		hbox.offset_left = 14; hbox.offset_right = -14
		card.add_child(hbox)

		# Sol: müzik ikonu kutusu
		var icon_box := PanelContainer.new()
		icon_box.custom_minimum_size = Vector2(60, 60)
		icon_box.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		var icon_sb := StyleBoxFlat.new()
		icon_sb.bg_color = Color(col2.r, col2.g, col2.b, 0.5)
		icon_sb.set_corner_radius_all(10)
		icon_box.add_theme_stylebox_override("panel", icon_sb)
		hbox.add_child(icon_box)

		var icon_lbl := Label.new()
		icon_lbl.text = "♪"
		icon_lbl.add_theme_font_size_override("font_size", 28)
		icon_lbl.add_theme_color_override("font_color", Color(1, 1, 1, 0.9))
		icon_lbl.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
		icon_box.add_child(icon_lbl)

		# Orta: isim + şarkı sayısı
		var info := VBoxContainer.new()
		info.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		info.size_flags_vertical   = Control.SIZE_SHRINK_CENTER
		info.add_theme_constant_override("separation", 4)
		hbox.add_child(info)

		var name_lbl := Label.new()
		name_lbl.text = pl_name
		name_lbl.add_theme_font_size_override("font_size", 17)
		name_lbl.add_theme_color_override("font_color", Color(1, 1, 1, 1))
		name_lbl.clip_text = true
		info.add_child(name_lbl)

		var count_lbl := Label.new()
		count_lbl.text = "%d sarki" % indices.size()
		count_lbl.add_theme_font_size_override("font_size", 13)
		count_lbl.add_theme_color_override("font_color", Color(1, 1, 1, 0.75))
		info.add_child(count_lbl)

		# Sağ: ▶ oynat butonu
		var play_btn2 := _make_btn()
		play_btn2.text = "▶"
		play_btn2.custom_minimum_size = Vector2(50, 50)
		play_btn2.size_flags_vertical = Control.SIZE_SHRINK_CENTER
		play_btn2.add_theme_font_size_override("font_size", 18)
		play_btn2.add_theme_color_override("font_color",         col1)
		play_btn2.add_theme_color_override("font_hover_color",   col1)
		play_btn2.add_theme_color_override("font_pressed_color", col1)
		var play_sb := StyleBoxFlat.new()
		play_sb.bg_color = Color(1, 1, 1, 1)
		play_sb.set_corner_radius_all(25)
		play_btn2.add_theme_stylebox_override("normal",  play_sb)
		var play_sb_h := StyleBoxFlat.new()
		play_sb_h.bg_color = Color(0.9, 0.9, 0.9, 1)
		play_sb_h.set_corner_radius_all(25)
		play_btn2.add_theme_stylebox_override("hover",   play_sb_h)
		play_btn2.add_theme_stylebox_override("pressed", play_sb_h)
		play_btn2.add_theme_stylebox_override("focus",   StyleBoxEmpty.new())
		# Oynat: listedeki ilk şarkıyı çal
		var captured_indices := indices.duplicate()
		play_btn2.pressed.connect(func():
			if not captured_indices.is_empty():
				_on_song_pressed(captured_indices[0])
		)
		hbox.add_child(play_btn2)

		# Kartın tamamı tıklanabilir - şarkı listesi açılır
		var card_btn := _make_btn()
		card_btn.flat = true
		card_btn.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		card_btn.add_theme_stylebox_override("normal",  StyleBoxEmpty.new())
		card_btn.add_theme_stylebox_override("hover",   _stylebox(Color(1,1,1,0.10), 14))
		card_btn.add_theme_stylebox_override("pressed", _stylebox(Color(1,1,1,0.18), 14))
		var captured_name: String = pl_name
		var captured_col: Color = col1
		card_btn.pressed.connect(func():
			_open_playlist_detail(captured_name, captured_col)
		)
		card.add_child(card_btn)

		i += 1


func _song_row_simple(num: int, song: Dictionary, is_cur: bool) -> Button:
	var btn := _make_btn()
	btn.flat = true
	btn.custom_minimum_size.y = 64
	btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	btn.alignment = HORIZONTAL_ALIGNMENT_LEFT
	btn.add_theme_font_size_override("font_size", 14)

	# Arka plan rengi
	var bg := COLOR_CARD_ON if is_cur else COLOR_CARD
	var bdr := Color(COLOR_ACCENT.r, COLOR_ACCENT.g, COLOR_ACCENT.b, 0.4) if is_cur else COLOR_BORDER
	btn.add_theme_stylebox_override("normal",  _stylebox(bg, 12, bdr, 1))
	btn.add_theme_stylebox_override("hover",   _stylebox(bg.lightened(0.07), 12, bdr, 1))
	btn.add_theme_stylebox_override("pressed", _stylebox(bg.lightened(0.12), 12))
	btn.add_theme_stylebox_override("focus",   StyleBoxEmpty.new())

	# İçerik metni — emoji + numara + isim tek satırda
	var in_q: bool = song["index"] in song_queue
	var q_icon := " ✓" if in_q else ""
	var play_icon := "  ▐▐" if (is_cur and is_playing) else "  ▶"
	var color := COLOR_ACCENT2 if is_cur else COLOR_TEXT
	btn.text = song["emoji"] + "  " + str(num) + ".  " + song["name"] + q_icon + play_icon
	btn.add_theme_color_override("font_color", color)

	btn.pressed.connect(_on_song_pressed.bind(song["index"]))
	return btn

func _song_row(num: int, song: Dictionary, is_cur: bool) -> PanelContainer:
	var panel := PanelContainer.new()
	panel.add_theme_stylebox_override("panel", _stylebox(Color(0, 0, 0, 0), 0))

	var btn := _make_btn()
	btn.flat = true
	btn.custom_minimum_size.y = 97
	btn.alignment = HORIZONTAL_ALIGNMENT_LEFT
	btn.add_theme_stylebox_override("normal",  StyleBoxEmpty.new())
	btn.add_theme_stylebox_override("hover",   _stylebox(Color(1, 1, 1, 0.08), 8))
	btn.add_theme_stylebox_override("pressed", _stylebox(Color(1, 1, 1, 0.08), 8))
	btn.add_theme_stylebox_override("focus",   StyleBoxEmpty.new())
	# Yazı rengini buton state'inden bağımsız yap
	btn.add_theme_color_override("font_color",         COLOR_TEXT)
	btn.add_theme_color_override("font_hover_color",   COLOR_TEXT)
	btn.add_theme_color_override("font_pressed_color", COLOR_TEXT)
	btn.add_theme_color_override("font_focus_color",   COLOR_TEXT)
	btn.pressed.connect(_on_song_pressed.bind(song["index"]))
	panel.add_child(btn)

	var hbox := HBoxContainer.new()
	hbox.add_theme_constant_override("separation", 12)
	hbox.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	hbox.offset_left = 8; hbox.offset_right = -8
	btn.add_child(hbox)

	# ── Sol: Yeşil müzik ikonu kutusu (tam Spotify tarzı) ──
	var ep := PanelContainer.new()
	ep.custom_minimum_size = Vector2(44, 44)
	ep.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	var ep_sb := StyleBoxFlat.new()
	ep_sb.bg_color = Color(0.071, 0.451, 0.204, 1.0)  # Spotify koyu yeşil
	ep_sb.set_corner_radius_all(6)
	ep.add_theme_stylebox_override("panel", ep_sb)
	hbox.add_child(ep)

	if is_cur:
		# Animasyonlu eq bar çubukları
		var bar_hbox := HBoxContainer.new()
		bar_hbox.add_theme_constant_override("separation", 3)
		bar_hbox.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
		ep.add_child(bar_hbox)
		for b in 4:
			var bar := ColorRect.new()
			bar.custom_minimum_size = Vector2(3, 5)
			bar.size_flags_vertical = Control.SIZE_SHRINK_END
			bar.color = Color(1, 1, 1, 1.0)
			bar_hbox.add_child(bar)
			var tw := bar.create_tween()
			tw.set_loops()
			tw.tween_property(bar, "custom_minimum_size:y", 20.0, 0.25 + b * 0.08).set_ease(Tween.EASE_IN_OUT)
			tw.tween_property(bar, "custom_minimum_size:y", 5.0,  0.25 + b * 0.08).set_ease(Tween.EASE_IN_OUT)
	else:
		# Müzik nota ikonu (♪)
		var icon_lbl := Label.new()
		icon_lbl.text = "♪"
		icon_lbl.add_theme_font_size_override("font_size", 20)
		icon_lbl.add_theme_color_override("font_color", Color(1, 1, 1, 0.9))
		icon_lbl.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
		ep.add_child(icon_lbl)

	# ── Orta: İsim + Sanatçı ──
	var iv := VBoxContainer.new()
	iv.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	iv.size_flags_vertical   = Control.SIZE_SHRINK_CENTER
	iv.add_theme_constant_override("separation", 4)
	hbox.add_child(iv)

	var tl := Label.new()
	tl.text = song["name"]
	tl.add_theme_font_size_override("font_size", 15)
	tl.add_theme_color_override("font_color", COLOR_ACCENT if is_cur else COLOR_TEXT)
	tl.clip_text = true
	iv.add_child(tl)

	var sl := Label.new()
	sl.text = _artist_label(song)
	sl.add_theme_font_size_override("font_size", 12)
	sl.add_theme_color_override("font_color", COLOR_MUTED)
	sl.clip_text = true
	iv.add_child(sl)

	# ── Sağ: ⋮ menü butonu ──
	var m_btn := _make_btn()
	m_btn.text = "⋮"
	m_btn.custom_minimum_size = Vector2(36, 97)
	m_btn.add_theme_font_size_override("font_size", 20)
	m_btn.add_theme_color_override("font_color",         COLOR_MUTED)
	m_btn.add_theme_color_override("font_hover_color",   COLOR_TEXT)
	m_btn.add_theme_color_override("font_pressed_color", COLOR_TEXT)
	m_btn.add_theme_stylebox_override("normal",  StyleBoxEmpty.new())
	m_btn.add_theme_stylebox_override("hover",   _stylebox(Color(1, 1, 1, 0.07), 8))
	m_btn.add_theme_stylebox_override("focus",   StyleBoxEmpty.new())
	m_btn.pressed.connect(_show_song_menu.bind(song["index"]))
	hbox.add_child(m_btn)

	return panel

# ─────────────────────────────────────────────────────────────
#  TAB VE ÇALMA LİSTESİ
# ─────────────────────────────────────────────────────────────
# ─────────────────────────────────────────────────────────────
#  ŞARKI MENÜSÜ (⋮)
# ─────────────────────────────────────────────────────────────
func _song_row_playlist_detail(num: int, song: Dictionary, is_cur: bool, pl_name: String) -> PanelContainer:
	var panel := PanelContainer.new()
	var card_col := Color(COLOR_ACCENT.r, COLOR_ACCENT.g, COLOR_ACCENT.b, 0.10) if is_cur else Color(0, 0, 0, 0)
	panel.add_theme_stylebox_override("panel", _stylebox(card_col, 8))

	var btn := _make_btn()
	btn.flat = true
	btn.custom_minimum_size.y = 97
	btn.alignment = HORIZONTAL_ALIGNMENT_LEFT
	btn.add_theme_stylebox_override("normal",  StyleBoxEmpty.new())
	btn.add_theme_stylebox_override("hover",   _stylebox(Color(1, 1, 1, 0.08), 8))
	btn.add_theme_stylebox_override("pressed", _stylebox(Color(1, 1, 1, 0.08), 8))
	btn.add_theme_color_override("font_color",         COLOR_TEXT)
	btn.add_theme_color_override("font_hover_color",   COLOR_TEXT)
	btn.add_theme_color_override("font_pressed_color", COLOR_TEXT)
	btn.pressed.connect(_on_song_pressed.bind(song["index"]))
	panel.add_child(btn)

	var hbox := HBoxContainer.new()
	hbox.add_theme_constant_override("separation", 12)
	hbox.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	hbox.offset_left = 8; hbox.offset_right = -8
	btn.add_child(hbox)

	var ep := PanelContainer.new()
	ep.custom_minimum_size = Vector2(44, 44)
	ep.size_flags_vertical = Control.SIZE_SHRINK_CENTER
	var ep_sb := StyleBoxFlat.new()
	ep_sb.bg_color = Color(0.071, 0.451, 0.204, 1.0)
	ep_sb.set_corner_radius_all(6)
	ep.add_theme_stylebox_override("panel", ep_sb)
	hbox.add_child(ep)

	if is_cur:
		var bar_hbox := HBoxContainer.new()
		bar_hbox.add_theme_constant_override("separation", 3)
		bar_hbox.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
		ep.add_child(bar_hbox)
		for b in 4:
			var bar := ColorRect.new()
			bar.custom_minimum_size = Vector2(3, 5)
			bar.size_flags_vertical = Control.SIZE_SHRINK_END
			bar.color = Color(1, 1, 1, 1.0)
			bar_hbox.add_child(bar)
			var tw := bar.create_tween()
			tw.set_loops()
			tw.tween_property(bar, "custom_minimum_size:y", 20.0, 0.25 + b * 0.08).set_ease(Tween.EASE_IN_OUT)
			tw.tween_property(bar, "custom_minimum_size:y", 5.0,  0.25 + b * 0.08).set_ease(Tween.EASE_IN_OUT)
	else:
		var icon_lbl := Label.new()
		icon_lbl.text = "♪"
		icon_lbl.add_theme_font_size_override("font_size", 20)
		icon_lbl.add_theme_color_override("font_color", Color(1, 1, 1, 0.9))
		icon_lbl.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
		ep.add_child(icon_lbl)

	var iv := VBoxContainer.new()
	iv.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	iv.size_flags_vertical   = Control.SIZE_SHRINK_CENTER
	iv.add_theme_constant_override("separation", 4)
	hbox.add_child(iv)

	var tl := Label.new()
	tl.text = song["name"]
	tl.add_theme_font_size_override("font_size", 15)
	tl.add_theme_color_override("font_color", COLOR_ACCENT if is_cur else COLOR_TEXT)
	tl.clip_text = true
	iv.add_child(tl)

	var sl := Label.new()
	sl.text = _artist_label(song)
	sl.add_theme_font_size_override("font_size", 12)
	sl.add_theme_color_override("font_color", COLOR_MUTED)
	sl.clip_text = true
	iv.add_child(sl)

	var m_btn := _make_btn()
	m_btn.text = "⋮"
	m_btn.custom_minimum_size = Vector2(36, 97)
	m_btn.add_theme_font_size_override("font_size", 20)
	m_btn.add_theme_color_override("font_color",         COLOR_MUTED)
	m_btn.add_theme_color_override("font_hover_color",   COLOR_TEXT)
	m_btn.add_theme_color_override("font_pressed_color", COLOR_TEXT)
	m_btn.add_theme_stylebox_override("normal",  StyleBoxEmpty.new())
	m_btn.add_theme_stylebox_override("hover",   _stylebox(Color(1, 1, 1, 0.07), 8))
	m_btn.pressed.connect(_show_song_menu_in_playlist.bind(song["index"], pl_name))
	hbox.add_child(m_btn)

	return panel

func _show_song_menu_in_playlist(song_idx: int, pl_name: String) -> void:
	var song := songs[song_idx]

	var overlay := ColorRect.new()
	overlay.color = Color(0, 0, 0, 0.6)
	overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	overlay.z_index = 200
	get_tree().current_scene.add_child(overlay)
	overlay.gui_input.connect(func(ev):
		if ev is InputEventMouseButton and (ev as InputEventMouseButton).pressed:
			overlay.queue_free()
	)

	var panel := PanelContainer.new()
	panel.add_theme_stylebox_override("panel", _stylebox(Color(0.078, 0.063, 0.149, 1.0), 22, COLOR_ACCENT, 1))
	panel.anchor_top    = 1.0; panel.anchor_bottom = 1.0
	panel.anchor_left   = 0.0; panel.anchor_right  = 1.0
	panel.offset_top    = -360; panel.offset_bottom = 0
	panel.offset_left   = 12;  panel.offset_right  = -12
	panel.z_index = 201
	overlay.add_child(panel)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 6)
	panel.add_child(vbox)

	var title_lbl := Label.new()
	title_lbl.text = "♪  " + song["name"]
	title_lbl.add_theme_font_size_override("font_size", 17)
	title_lbl.add_theme_color_override("font_color", COLOR_TEXT)
	title_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	vbox.add_child(title_lbl)

	var sep := HSeparator.new()
	sep.add_theme_color_override("color", COLOR_BORDER)
	vbox.add_child(sep)

	var btn_style_n := _stylebox(Color(0.118, 0.090, 0.208, 1.0), 12)
	var btn_style_h := _stylebox(Color(0.196, 0.145, 0.318, 1.0), 12)

	# ♥ Favorilere ekle/çıkar
	var is_fav: bool = song_idx in favorites
	var fav_btn := _make_btn()
	fav_btn.text = "♥  Favorilerden Çıkar" if is_fav else "♡  Favorilere Ekle"
	fav_btn.flat = true
	fav_btn.custom_minimum_size.y = 54
	fav_btn.add_theme_font_size_override("font_size", 15)
	fav_btn.add_theme_color_override("font_color", Color(0.95, 0.25, 0.35) if is_fav else COLOR_TEXT)
	fav_btn.add_theme_stylebox_override("normal", btn_style_n)
	fav_btn.add_theme_stylebox_override("hover",  btn_style_h)
	fav_btn.pressed.connect(func():
		if song_idx in favorites: favorites.erase(song_idx)
		else: favorites.append(song_idx)
		_save_favorites(); _update_fav_btn()
		_show_toast("Favoriler güncellendi ♥")
		overlay.queue_free()
	)
	vbox.add_child(fav_btn)

	# 🗑 Listeden kaldır
	var rm_btn := _make_btn()
	rm_btn.text = "🗑  Listeden Kaldır"
	rm_btn.flat = true
	rm_btn.custom_minimum_size.y = 54
	rm_btn.add_theme_font_size_override("font_size", 15)
	rm_btn.add_theme_color_override("font_color", Color(0.95, 0.3, 0.3))
	rm_btn.add_theme_stylebox_override("normal", btn_style_n)
	rm_btn.add_theme_stylebox_override("hover",  btn_style_h)
	rm_btn.pressed.connect(func():
		_on_remove_from_playlist(pl_name, song_idx)
		overlay.queue_free()
		_show_toast("Listeden kaldırıldı")
	)
	vbox.add_child(rm_btn)

	# ▷ Çalma sırasına ekle/çıkar
	var in_q: bool = song_idx in song_queue
	var q_btn := _make_btn()
	q_btn.text = "✓  Çalma Sırasından Çıkar" if in_q else "▷  Çalma Sırasına Ekle"
	q_btn.flat = true
	q_btn.custom_minimum_size.y = 54
	q_btn.add_theme_font_size_override("font_size", 15)
	q_btn.add_theme_color_override("font_color", COLOR_ACCENT if in_q else COLOR_TEXT)
	q_btn.add_theme_stylebox_override("normal", btn_style_n)
	q_btn.add_theme_stylebox_override("hover",  btn_style_h)
	q_btn.pressed.connect(func():
		if song_idx in song_queue: song_queue.erase(song_idx)
		else: song_queue.append(song_idx)
		_show_toast("Çalma sırası güncellendi")
		overlay.queue_free()
	)
	vbox.add_child(q_btn)

	# ☰ Çalma sırası
	var q_count := song_queue.size()
	var queue_btn := _make_btn()
	queue_btn.text = "☰  Çalma Sırası" + ("  (%d)" % q_count if q_count > 0 else "  (Boş)")
	queue_btn.flat = true
	queue_btn.custom_minimum_size.y = 54
	queue_btn.add_theme_font_size_override("font_size", 15)
	queue_btn.add_theme_color_override("font_color", COLOR_ACCENT if q_count > 0 else COLOR_MUTED)
	queue_btn.add_theme_stylebox_override("normal", btn_style_n)
	queue_btn.add_theme_stylebox_override("hover",  btn_style_h)
	queue_btn.pressed.connect(func():
		overlay.queue_free()
		_show_queue_panel()
	)
	vbox.add_child(queue_btn)

	# ⬇ Şarkıyı indir
	var is_dl: bool = songs[song_idx]["file"] in downloaded_songs
	var dl_btn := _make_btn()
	dl_btn.text = "✓  İndirildi" if is_dl else "⬇  Şarkıyı İndir"
	dl_btn.flat = true
	dl_btn.custom_minimum_size.y = 54
	dl_btn.add_theme_font_size_override("font_size", 15)
	dl_btn.add_theme_color_override("font_color", COLOR_ACCENT if is_dl else COLOR_TEXT)
	dl_btn.add_theme_stylebox_override("normal", btn_style_n)
	dl_btn.add_theme_stylebox_override("hover",  btn_style_h)
	dl_btn.pressed.connect(func():
		overlay.queue_free()
		if not is_dl: _download_song(song_idx)
		else: _show_toast("Bu sarki zaten indirildi!")
	)
	vbox.add_child(dl_btn)

	# ✕ Kapat
	var close_btn := _make_btn()
	close_btn.text = "✕  Kapat"
	close_btn.flat = true
	close_btn.custom_minimum_size.y = 44
	close_btn.add_theme_font_size_override("font_size", 14)
	close_btn.add_theme_color_override("font_color", COLOR_MUTED)
	close_btn.add_theme_stylebox_override("normal", StyleBoxEmpty.new())
	close_btn.pressed.connect(func(): overlay.queue_free())
	vbox.add_child(close_btn)

func _show_song_menu(song_idx: int) -> void:
	var song := songs[song_idx]

	# Arka plan karartma
	var overlay := ColorRect.new()
	overlay.color = Color(0, 0, 0, 0.6)
	overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	overlay.z_index = 100
	get_tree().current_scene.add_child(overlay)

	# Kapat — karartmaya tıklayınca
	overlay.gui_input.connect(func(ev):
		if ev is InputEventMouseButton and (ev as InputEventMouseButton).pressed:
			overlay.queue_free()
	)

	# Panel
	var panel := PanelContainer.new()
	panel.add_theme_stylebox_override("panel", _stylebox(Color(0.078, 0.063, 0.149, 1.0), 22, COLOR_ACCENT, 1))
	panel.set_anchors_preset(Control.PRESET_CENTER_BOTTOM)
	panel.anchor_top    = 1.0
	panel.anchor_bottom = 1.0
	panel.anchor_left   = 0.0
	panel.anchor_right  = 1.0
	panel.offset_top    = -400
	panel.offset_bottom = 0
	panel.offset_left   = 12
	panel.offset_right  = -12
	panel.z_index = 101
	overlay.add_child(panel)

	var vbox := VBoxContainer.new()
	vbox.add_theme_constant_override("separation", 6)
	panel.add_child(vbox)

	# Başlık
	var title_lbl := Label.new()
	title_lbl.text = song["emoji"] + "  " + song["name"]
	title_lbl.add_theme_font_size_override("font_size", 17)
	title_lbl.add_theme_color_override("font_color", COLOR_TEXT)
	title_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	vbox.add_child(title_lbl)

	var sep := HSeparator.new()
	sep.add_theme_color_override("color", COLOR_BORDER)
	vbox.add_child(sep)

	# ♥ Favorilere ekle/çıkar
	var is_fav: bool = song_idx in favorites
	var fav_btn := _make_btn()
	fav_btn.text = ("♥  Favorilerden Çıkar" if is_fav else "♡  Favorilere Ekle")
	fav_btn.flat = true
	fav_btn.custom_minimum_size.y = 54
	fav_btn.add_theme_font_size_override("font_size", 15)
	fav_btn.add_theme_color_override("font_color", Color(0.95, 0.25, 0.35) if is_fav else COLOR_TEXT)
	fav_btn.add_theme_stylebox_override("normal",  _stylebox(Color(0.118, 0.090, 0.208, 1.0), 12))
	fav_btn.add_theme_stylebox_override("hover",   _stylebox(Color(0.196, 0.145, 0.318, 1.0), 12))
	fav_btn.add_theme_stylebox_override("focus",   StyleBoxEmpty.new())
	fav_btn.pressed.connect(func():
		if song_idx in favorites:
			favorites.erase(song_idx)
			_show_toast("Favorilerden çıkarıldı")
		else:
			favorites.append(song_idx)
			_show_toast("Favorilere eklendi ♥")
		_save_favorites()
		_update_fav_btn()
		overlay.queue_free()
	)
	vbox.add_child(fav_btn)

	# ≡ Çalma listesine ekle
	var pl_btn := _make_btn()
	pl_btn.text = "≡  Çalma Listesine Ekle"
	pl_btn.flat = true
	pl_btn.custom_minimum_size.y = 54
	pl_btn.add_theme_font_size_override("font_size", 15)
	pl_btn.add_theme_color_override("font_color", COLOR_TEXT)
	pl_btn.add_theme_stylebox_override("normal",  _stylebox(Color(0.118, 0.090, 0.208, 1.0), 12))
	pl_btn.add_theme_stylebox_override("hover",   _stylebox(Color(0.196, 0.145, 0.318, 1.0), 12))
	pl_btn.add_theme_stylebox_override("focus",   StyleBoxEmpty.new())
	pl_btn.pressed.connect(func():
		overlay.queue_free()
		_show_playlist_picker(song_idx)
	)
	vbox.add_child(pl_btn)

	# ▷ Çalma sırasına ekle/çıkar
	var in_q: bool = song_idx in song_queue
	var q_btn := _make_btn()
	q_btn.text = ("✓  Çalma Sırasından Çıkar" if in_q else "▷  Çalma Sırasına Ekle")
	q_btn.flat = true
	q_btn.custom_minimum_size.y = 54
	q_btn.add_theme_font_size_override("font_size", 15)
	q_btn.add_theme_color_override("font_color", COLOR_ACCENT if in_q else COLOR_TEXT)
	q_btn.add_theme_stylebox_override("normal",  _stylebox(Color(0.118, 0.090, 0.208, 1.0), 12))
	q_btn.add_theme_stylebox_override("hover",   _stylebox(Color(0.196, 0.145, 0.318, 1.0), 12))
	q_btn.add_theme_stylebox_override("focus",   StyleBoxEmpty.new())
	q_btn.pressed.connect(func():
		if song_idx in song_queue:
			song_queue.erase(song_idx)
			_show_toast("Kuyruktan çıkarıldı")
		else:
			song_queue.append(song_idx)
			_show_toast("Çalma sırasına eklendi ▷")
		overlay.queue_free()
	)
	vbox.add_child(q_btn)

	# ☰ Çalma sırası butonu
	var queue_view_btn := _make_btn()
	var q_count := song_queue.size()
	queue_view_btn.text = "☰  Çalma Sırası" + ("  (%d)" % q_count if q_count > 0 else "  (Boş)")
	queue_view_btn.flat = true
	queue_view_btn.custom_minimum_size.y = 54
	queue_view_btn.add_theme_font_size_override("font_size", 15)
	queue_view_btn.add_theme_color_override("font_color", COLOR_ACCENT if q_count > 0 else COLOR_MUTED)
	queue_view_btn.add_theme_stylebox_override("normal",  _stylebox(Color(0.118, 0.090, 0.208, 1.0), 12))
	queue_view_btn.add_theme_stylebox_override("hover",   _stylebox(Color(0.196, 0.145, 0.318, 1.0), 12))
	queue_view_btn.add_theme_stylebox_override("focus",   StyleBoxEmpty.new())
	queue_view_btn.pressed.connect(func():
		overlay.queue_free()
		_show_queue_panel()
	)
	vbox.add_child(queue_view_btn)

	# ⬇ Şarkıyı indir
	var is_dl: bool = songs[song_idx]["file"] in downloaded_songs
	var dl_btn := _make_btn()
	dl_btn.text = ("✓  İndirildi" if is_dl else "⬇  Şarkıyı İndir")
	dl_btn.flat = true
	dl_btn.custom_minimum_size.y = 54
	dl_btn.add_theme_font_size_override("font_size", 15)
	dl_btn.add_theme_color_override("font_color", COLOR_ACCENT if is_dl else COLOR_TEXT)
	dl_btn.add_theme_stylebox_override("normal",  _stylebox(Color(0.118, 0.090, 0.208, 1.0), 12))
	dl_btn.add_theme_stylebox_override("hover",   _stylebox(Color(0.196, 0.145, 0.318, 1.0), 12))
	dl_btn.add_theme_stylebox_override("focus",   StyleBoxEmpty.new())
	dl_btn.pressed.connect(func():
		overlay.queue_free()
		if not is_dl:
			_download_song(song_idx)
		else:
			_show_toast("Bu sarki zaten indirildi!")
	)
	vbox.add_child(dl_btn)

	# ✕ Kapat butonu
	var close_btn := _make_btn()
	close_btn.text = "✕  Kapat"
	close_btn.flat = true
	close_btn.custom_minimum_size.y = 44
	close_btn.add_theme_font_size_override("font_size", 14)
	close_btn.add_theme_color_override("font_color", COLOR_MUTED)
	close_btn.add_theme_stylebox_override("normal",  StyleBoxEmpty.new())
	close_btn.add_theme_stylebox_override("focus",   StyleBoxEmpty.new())
	close_btn.pressed.connect(func(): overlay.queue_free())
	vbox.add_child(close_btn)

func _show_queue_panel() -> void:
	# Arka plan karartma
	var overlay := ColorRect.new()
	overlay.color = Color(0, 0, 0, 0.6)
	overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	overlay.z_index = 100
	get_tree().current_scene.add_child(overlay)
	overlay.gui_input.connect(func(ev):
		if ev is InputEventMouseButton and (ev as InputEventMouseButton).pressed:
			overlay.queue_free()
	)

	# Panel
	var panel := PanelContainer.new()
	panel.add_theme_stylebox_override("panel", _stylebox(Color(0.13, 0.11, 0.18, 1.0), 18, COLOR_BORDER, 1))
	panel.set_anchors_preset(Control.PRESET_CENTER_BOTTOM)
	panel.anchor_top    = 0.1
	panel.anchor_bottom = 1.0
	panel.anchor_left   = 0.0
	panel.anchor_right  = 1.0
	panel.offset_top    = 0
	panel.offset_bottom = -8
	panel.offset_left   = 16
	panel.offset_right  = -16
	panel.z_index = 101
	overlay.add_child(panel)

	var outer := VBoxContainer.new()
	outer.add_theme_constant_override("separation", 8)
	panel.add_child(outer)

	# Başlık satırı
	var title_row := HBoxContainer.new()
	outer.add_child(title_row)

	var title_lbl := Label.new()
	title_lbl.text = "☰  Çalma Sırası"
	title_lbl.add_theme_font_size_override("font_size", 16)
	title_lbl.add_theme_color_override("font_color", COLOR_ACCENT2)
	title_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	title_row.add_child(title_lbl)

	# Tümünü temizle butonu
	var clear_btn := _make_btn()
	clear_btn.text = "Temizle"
	clear_btn.flat = true
	clear_btn.add_theme_font_size_override("font_size", 13)
	clear_btn.add_theme_color_override("font_color", Color(0.95, 0.35, 0.35))
	clear_btn.add_theme_stylebox_override("normal", StyleBoxEmpty.new())
	clear_btn.add_theme_stylebox_override("focus",  StyleBoxEmpty.new())
	clear_btn.pressed.connect(func():
		song_queue.clear()
		overlay.queue_free()
		_show_toast("Çalma sırası temizlendi")
	)
	title_row.add_child(clear_btn)

	var sep := HSeparator.new()
	sep.add_theme_color_override("color", COLOR_BORDER)
	outer.add_child(sep)

	# Sıra listesi — ScrollContainer içinde
	var scroll := ScrollContainer.new()
	scroll.size_flags_vertical = Control.SIZE_EXPAND_FILL
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	outer.add_child(scroll)

	var list := VBoxContainer.new()
	list.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	list.add_theme_constant_override("separation", 6)
	scroll.add_child(list)

	if song_queue.is_empty():
		var empty_lbl := Label.new()
		empty_lbl.text = "Sıra boş — şarkı menüsünden ekleyebilirsin"
		empty_lbl.add_theme_font_size_override("font_size", 13)
		empty_lbl.add_theme_color_override("font_color", COLOR_MUTED)
		empty_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		empty_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD
		list.add_child(empty_lbl)
	else:
		for qi in song_queue.size():
			var sidx: int = song_queue[qi]
			var s: Dictionary = songs[sidx]

			var row := PanelContainer.new()
			row.add_theme_stylebox_override("panel", _stylebox(Color(0.18, 0.14, 0.22, 1.0), 10, COLOR_BORDER, 1))
			list.add_child(row)

			var hbox := HBoxContainer.new()
			hbox.add_theme_constant_override("separation", 10)
			row.add_child(hbox)

			# Sıra numarası
			var num_lbl := Label.new()
			num_lbl.text = str(qi + 1) + "."
			num_lbl.add_theme_font_size_override("font_size", 13)
			num_lbl.add_theme_color_override("font_color", COLOR_MUTED)
			num_lbl.custom_minimum_size.x = 28
			num_lbl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
			hbox.add_child(num_lbl)

			# Emoji
			var emoji_lbl := Label.new()
			emoji_lbl.text = s["emoji"]
			emoji_lbl.add_theme_font_size_override("font_size", 18)
			emoji_lbl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
			hbox.add_child(emoji_lbl)

			# Şarkı adı
			var name_lbl := Label.new()
			name_lbl.text = s["name"]
			name_lbl.add_theme_font_size_override("font_size", 14)
			name_lbl.add_theme_color_override("font_color", COLOR_TEXT)
			name_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
			name_lbl.clip_text = true
			name_lbl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
			hbox.add_child(name_lbl)

			# ✕ Sıradan çıkar
			var rm_btn := _make_btn()
			rm_btn.text = "✕"
			rm_btn.flat = true
			rm_btn.custom_minimum_size = Vector2(36, 36)
			rm_btn.add_theme_font_size_override("font_size", 14)
			rm_btn.add_theme_color_override("font_color", Color(0.95, 0.35, 0.35))
			rm_btn.add_theme_stylebox_override("normal", StyleBoxEmpty.new())
			rm_btn.add_theme_stylebox_override("focus",  StyleBoxEmpty.new())
			rm_btn.pressed.connect(func():
				song_queue.erase(sidx)
				overlay.queue_free()
				_show_toast(s["name"] + " sıradan çıkarıldı")
			)
			hbox.add_child(rm_btn)

	# Kapat butonu
	var close_btn := _make_btn()
	close_btn.text = "✕  Kapat"
	close_btn.flat = true
	close_btn.custom_minimum_size.y = 44
	close_btn.add_theme_font_size_override("font_size", 14)
	close_btn.add_theme_color_override("font_color", COLOR_MUTED)
	close_btn.add_theme_stylebox_override("normal", StyleBoxEmpty.new())
	close_btn.add_theme_stylebox_override("focus",  StyleBoxEmpty.new())
	close_btn.pressed.connect(func(): overlay.queue_free())
	outer.add_child(close_btn)

func _toggle_sidebar() -> void:
	if sidebar_open:
		_close_sidebar()
	else:
		_open_sidebar()

func _open_sidebar() -> void:
	sidebar_open = true
	sidebar_overlay.mouse_filter = Control.MOUSE_FILTER_STOP
	var tw := create_tween()
	tw.set_parallel(true)
	tw.tween_property(sidebar_panel, "offset_left",  0.0,   0.25).set_ease(Tween.EASE_OUT).set_trans(Tween.TRANS_CUBIC)
	tw.tween_property(sidebar_panel, "offset_right", 260.0, 0.25).set_ease(Tween.EASE_OUT).set_trans(Tween.TRANS_CUBIC)
	tw.tween_property(sidebar_overlay, "color", Color(0, 0, 0, 0.55), 0.25)

func _close_sidebar() -> void:
	sidebar_open = false
	var tw := create_tween()
	tw.set_parallel(true)
	tw.tween_property(sidebar_panel, "offset_left",  -260.0, 0.22).set_ease(Tween.EASE_IN).set_trans(Tween.TRANS_CUBIC)
	tw.tween_property(sidebar_panel, "offset_right",    0.0, 0.22).set_ease(Tween.EASE_IN).set_trans(Tween.TRANS_CUBIC)
	tw.tween_property(sidebar_overlay, "color", Color(0, 0, 0, 0), 0.22)
	tw.chain().tween_callback(func(): sidebar_overlay.mouse_filter = Control.MOUSE_FILTER_IGNORE)

func _switch_tab(tab: String) -> void:
	active_tab = tab
	content_all.visible = tab == "all"
	content_pl.visible  = tab == "playlists"
	content_top.visible = tab == "top"
	content_fav.visible = tab == "favorites"
	content_dl.visible  = tab == "downloads"
	# Sidebar buton görünümleri
	var on_bg  := _stylebox(Color(COLOR_ACCENT.r, COLOR_ACCENT.g, COLOR_ACCENT.b, 0.18), 12, COLOR_BORDER, 1)
	var off_bg := StyleBoxEmpty.new()
	for pair in [[tab_all_btn,"all"],[tab_pl_btn,"playlists"],[tab_top_btn,"top"],[tab_fav_btn,"favorites"],[tab_dl_btn,"downloads"]]:
		var btn: Button = pair[0]
		var name: String = pair[1]
		if not is_instance_valid(btn): continue
		if tab == name:
			btn.add_theme_stylebox_override("normal", on_bg)
			btn.add_theme_color_override("font_color", COLOR_TEXT)
		else:
			btn.add_theme_stylebox_override("normal", off_bg)
			btn.add_theme_color_override("font_color", COLOR_MUTED)
	if tab == "playlists":
		_render_playlists()
	elif tab == "top":
		_fetch_top_songs()
	elif tab == "favorites":
		_render_favorites()
	elif tab == "downloads":
		_render_downloads()

func _fetch_top_songs() -> void:
	# Eger onceden cekilmisse bekleme yapmadan direkt goster
	if not download_counts.is_empty():
		_render_top_songs()
		return

	for ch in top_list_vbox.get_children(): ch.queue_free()
	var loading := Label.new()
	loading.text = "Yukleniyor..."
	loading.add_theme_color_override("font_color", COLOR_MUTED)
	loading.add_theme_font_size_override("font_size", 14)
	loading.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	loading.custom_minimum_size.y = 80
	top_list_vbox.add_child(loading)

	if is_instance_valid(http_api):
		http_api.cancel_request()
		http_api.queue_free()
	http_api = HTTPRequest.new()
	http_api.use_threads = false
	add_child(http_api)
	http_api.request_completed.connect(_on_api_done)
	http_api.request(
		SUPABASE_URL + "/rest/v1/song_stats?select=song_file,play_count&order=play_count.desc&limit=50",
		PackedStringArray([
			"apikey: " + SUPABASE_ANON_KEY,
			"Authorization: Bearer " + SUPABASE_ANON_KEY
		])
	)

func _on_api_done(_result: int, code: int,
		_headers: PackedStringArray, body: PackedByteArray) -> void:
	if is_instance_valid(http_api):
		http_api.queue_free()
		http_api = null

	if code != 200:
		_show_top_error("Veri alinamadi (hata %d)" % code); return

	var json := JSON.new()
	if json.parse(body.get_string_from_utf8()) != OK:
		_show_top_error("JSON parse hatasi"); return

	var data = json.get_data()
	if not data is Array:
		_show_top_error("Veri formati hatali"); return

	download_counts.clear()
	for entry in data:
		if entry is Dictionary:
			var file: String = entry.get("song_file", "")
			var count: int   = int(entry.get("play_count", 0))
			if not file.is_empty():
				download_counts[file] = count

	if download_counts.is_empty():
		_show_top_error("Henuz hic sarki calinmadi!\nDinlemeye basla ve buraya geri don.")
		return

	_render_top_songs()

func _render_top_songs() -> void:
	for ch in top_list_vbox.get_children(): ch.queue_free()

	# Şarkıları indirme sayısına göre sırala
	var ranked: Array = []
	for song in songs:
		var count: int = download_counts.get(song["file"], 0)
		ranked.append({"song": song, "count": count})
	ranked.sort_custom(func(a, b): return a["count"] > b["count"])

	# Sadece ilk 50 göster
	var show_count := mini(50, ranked.size())

	for i in show_count:
		var entry = ranked[i]
		var song: Dictionary = entry["song"]
		var count: int = entry["count"]
		var is_cur: bool = current_index == song["index"]

		var panel := PanelContainer.new()
		panel.add_theme_stylebox_override("panel",
			_stylebox(COLOR_CARD_ON if is_cur else COLOR_CARD, 12,
			Color(COLOR_ACCENT.r,COLOR_ACCENT.g,COLOR_ACCENT.b,0.4) if is_cur else COLOR_BORDER, 1))
		top_list_vbox.add_child(panel)

		var btn := _make_btn()
		btn.flat = true
		btn.custom_minimum_size.y = 66
		btn.alignment = HORIZONTAL_ALIGNMENT_LEFT
		btn.add_theme_stylebox_override("normal",  StyleBoxEmpty.new())
		btn.add_theme_stylebox_override("hover",   _stylebox(Color(COLOR_ACCENT.r,COLOR_ACCENT.g,COLOR_ACCENT.b,0.07),10))
		btn.add_theme_stylebox_override("pressed", _stylebox(Color(COLOR_ACCENT.r,COLOR_ACCENT.g,COLOR_ACCENT.b,0.13),10))
		btn.add_theme_stylebox_override("focus",   StyleBoxEmpty.new())
		btn.pressed.connect(_on_song_pressed.bind(song["index"]))
		panel.add_child(btn)

		var hbox := HBoxContainer.new()
		hbox.add_theme_constant_override("separation", 10)
		hbox.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
		hbox.offset_left = 10; hbox.offset_right = -10
		btn.add_child(hbox)

		# Sıra numarası (1-3 arası taç/madalya)
		var rank_lbl := Label.new()
		match i:
			0: rank_lbl.text = "🥇"
			1: rank_lbl.text = "🥈"
			2: rank_lbl.text = "🥉"
			_: rank_lbl.text = str(i + 1)
		rank_lbl.add_theme_font_size_override("font_size", 16)
		rank_lbl.add_theme_color_override("font_color", COLOR_ACCENT if is_cur else COLOR_MUTED)
		rank_lbl.custom_minimum_size.x = 30
		rank_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		rank_lbl.vertical_alignment   = VERTICAL_ALIGNMENT_CENTER
		hbox.add_child(rank_lbl)

		# Emoji
		var ep := _panel(Color(COLOR_ACCENT.r,COLOR_ACCENT.g,COLOR_ACCENT.b,0.13) if is_cur else Color(0.098,0.098,0.153,1.0))
		ep.custom_minimum_size = Vector2(52, 52)
		hbox.add_child(ep)
		var el := Label.new()
		el.text = song["emoji"]
		el.add_theme_font_size_override("font_size", 26)
		el.set_anchors_and_offsets_preset(Control.PRESET_CENTER)
		ep.add_child(el)

		# İsim + sayaç
		var info := VBoxContainer.new()
		info.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		info.size_flags_vertical   = Control.SIZE_SHRINK_CENTER
		info.add_theme_constant_override("separation", 2)
		hbox.add_child(info)

		var name_lbl := Label.new()
		name_lbl.text = song["name"]
		name_lbl.add_theme_font_size_override("font_size", 14)
		name_lbl.add_theme_color_override("font_color", COLOR_ACCENT2 if is_cur else COLOR_TEXT)
		name_lbl.clip_text = true
		info.add_child(name_lbl)

		var cnt_lbl := Label.new()
		if count > 0:
			cnt_lbl.text = "%d dinlenme" % count
			cnt_lbl.add_theme_color_override("font_color", COLOR_ACCENT if is_cur else COLOR_MUTED)
		else:
			cnt_lbl.text = "veri yok"
			cnt_lbl.add_theme_color_override("font_color", COLOR_MUTED)
		cnt_lbl.add_theme_font_size_override("font_size", 11)
		info.add_child(cnt_lbl)

		# ⋮ menü butonu
		var m_btn := _make_btn()
		m_btn.text = "⋮"
		m_btn.custom_minimum_size = Vector2(50, 90)
		m_btn.add_theme_font_size_override("font_size", 22)
		m_btn.add_theme_color_override("font_color", COLOR_MUTED)
		m_btn.add_theme_stylebox_override("normal",  StyleBoxEmpty.new())
		m_btn.add_theme_stylebox_override("hover",   _stylebox(Color(COLOR_ACCENT.r, COLOR_ACCENT.g, COLOR_ACCENT.b, 0.10), 8))
		m_btn.add_theme_stylebox_override("focus",   StyleBoxEmpty.new())
		m_btn.pressed.connect(_show_song_menu.bind(song["index"]))
		hbox.add_child(m_btn)

func _show_top_error(msg: String) -> void:
	for ch in top_list_vbox.get_children(): ch.queue_free()
	var lbl := Label.new()
	lbl.text = msg
	lbl.add_theme_color_override("font_color", COLOR_MUTED)
	lbl.add_theme_font_size_override("font_size", 13)
	lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
	lbl.custom_minimum_size.y = 80
	top_list_vbox.add_child(lbl)

func _on_add_to_playlist() -> void:
	if current_index < 0:
		_show_toast("Once bir sarki sec!")
		return
	if playlists.is_empty():
		_show_toast("Once calma listesi olustur!")
		return
	_show_playlist_picker()

func _show_playlist_picker(song_idx: int = -1) -> void:
	# song_idx verilmezse current_index kullan
	var target_idx := song_idx if song_idx >= 0 else current_index
	# Arka plan overlay
	var overlay := ColorRect.new()
	overlay.color = Color(0, 0, 0, 0.65)
	overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	overlay.z_index = 10
	add_child(overlay)

	var center := CenterContainer.new()
	center.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	overlay.add_child(center)

	var box := _panel(Color(0.08, 0.08, 0.12, 1.0))
	box.custom_minimum_size = Vector2(300, 0)
	center.add_child(box)

	var vb := VBoxContainer.new()
	vb.add_theme_constant_override("separation", 6)
	box.add_child(vb)

	var title_lbl := Label.new()
	title_lbl.text = "Hangi listeye eklensin?"
	title_lbl.add_theme_font_size_override("font_size", 15)
	title_lbl.add_theme_color_override("font_color", COLOR_TEXT)
	title_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title_lbl.custom_minimum_size.y = 42
	vb.add_child(title_lbl)

	var sep := ColorRect.new()
	sep.color = COLOR_BORDER
	sep.custom_minimum_size = Vector2(0, 1)
	vb.add_child(sep)

	for pl_name in playlists.keys():
		var pb := _make_btn()
		pb.text = "♫  " + pl_name
		pb.custom_minimum_size.y = 48
		pb.alignment = HORIZONTAL_ALIGNMENT_LEFT
		pb.add_theme_font_size_override("font_size", 14)
		pb.add_theme_color_override("font_color", COLOR_TEXT)
		pb.add_theme_stylebox_override("normal",  StyleBoxEmpty.new())
		pb.add_theme_stylebox_override("hover",   _stylebox(Color(COLOR_ACCENT.r, COLOR_ACCENT.g, COLOR_ACCENT.b, 0.15), 0))
		pb.add_theme_stylebox_override("focus",   StyleBoxEmpty.new())
		pb.pressed.connect(func():
			overlay.queue_free()
			_add_song_to_playlist(pl_name, target_idx)
		)
		vb.add_child(pb)

	var cancel_btn := _make_btn()
	cancel_btn.text = "Iptal"
	cancel_btn.custom_minimum_size.y = 44
	cancel_btn.add_theme_font_size_override("font_size", 13)
	cancel_btn.add_theme_color_override("font_color", COLOR_MUTED)
	cancel_btn.add_theme_stylebox_override("normal",  _stylebox(Color(0.15, 0.15, 0.2, 1.0), 8))
	cancel_btn.add_theme_stylebox_override("focus",   StyleBoxEmpty.new())
	cancel_btn.pressed.connect(func(): overlay.queue_free())
	vb.add_child(cancel_btn)

func _add_song_to_playlist(pl_name: String, song_idx: int) -> void:
	if not playlists.has(pl_name): return
	if song_idx in playlists[pl_name]:
		_show_toast("Bu sarki zaten listede!")
		return
	playlists[pl_name].append(song_idx)
	_save_playlists()
	_show_toast("Eklendi: " + pl_name)
	if active_tab == "playlists": _render_playlists()

func _open_playlist_detail(pl_name: String, accent_col: Color) -> void:
	var overlay := ColorRect.new()
	overlay.color = Color(0.043, 0.043, 0.043, 1.0)
	overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	overlay.z_index = 60
	add_child(overlay)

	var vbox := VBoxContainer.new()
	vbox.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	vbox.add_theme_constant_override("separation", 0)
	overlay.add_child(vbox)

	var top_bar := PanelContainer.new()
	top_bar.custom_minimum_size.y = 70
	var top_sb := StyleBoxFlat.new()
	top_sb.bg_color = accent_col
	top_bar.add_theme_stylebox_override("panel", top_sb)
	vbox.add_child(top_bar)

	var top_hbox := HBoxContainer.new()
	top_hbox.add_theme_constant_override("separation", 12)
	top_hbox.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	top_hbox.offset_left = 12; top_hbox.offset_right = -12
	top_bar.add_child(top_hbox)

	var back_btn := _make_btn()
	back_btn.text = "←"
	back_btn.add_theme_font_size_override("font_size", 26)
	back_btn.add_theme_color_override("font_color",       Color(1,1,1,1))
	back_btn.add_theme_color_override("font_hover_color", Color(1,1,1,0.7))
	back_btn.custom_minimum_size = Vector2(44, 44)
	back_btn.add_theme_stylebox_override("normal",  StyleBoxEmpty.new())
	back_btn.add_theme_stylebox_override("hover",   _stylebox(Color(1,1,1,0.15), 8))
	back_btn.add_theme_stylebox_override("pressed", StyleBoxEmpty.new())
	back_btn.pressed.connect(func(): overlay.queue_free())
	top_hbox.add_child(back_btn)

	var title_lbl := Label.new()
	title_lbl.text = pl_name
	title_lbl.add_theme_font_size_override("font_size", 20)
	title_lbl.add_theme_color_override("font_color", Color(1,1,1,1))
	title_lbl.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	title_lbl.vertical_alignment = VERTICAL_ALIGNMENT_CENTER
	top_hbox.add_child(title_lbl)

	var del_btn2 := _make_btn()
	del_btn2.text = "🗑"
	del_btn2.add_theme_font_size_override("font_size", 18)
	del_btn2.add_theme_color_override("font_color", Color(1,1,1,0.8))
	del_btn2.custom_minimum_size = Vector2(44, 44)
	del_btn2.add_theme_stylebox_override("normal",  StyleBoxEmpty.new())
	del_btn2.add_theme_stylebox_override("hover",   _stylebox(Color(1,1,1,0.15), 8))
	del_btn2.add_theme_stylebox_override("pressed", StyleBoxEmpty.new())
	del_btn2.pressed.connect(func():
		_on_delete_playlist(pl_name)
		overlay.queue_free()
	)
	top_hbox.add_child(del_btn2)

	# Scroll + kaydırma şeridi (tüm şarkılar tabındaki gibi)
	var content_hbox := HBoxContainer.new()
	content_hbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	content_hbox.size_flags_vertical   = Control.SIZE_EXPAND_FILL
	content_hbox.add_theme_constant_override("separation", 0)
	vbox.add_child(content_hbox)

	var scroll := ScrollContainer.new()
	scroll.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	scroll.size_flags_vertical   = Control.SIZE_EXPAND_FILL
	scroll.horizontal_scroll_mode = ScrollContainer.SCROLL_MODE_DISABLED
	scroll.vertical_scroll_mode   = ScrollContainer.SCROLL_MODE_SHOW_NEVER
	content_hbox.add_child(scroll)

	# Sağ kenar dokunmatik kaydırma şeridi
	var scroll_strip := Control.new()
	scroll_strip.custom_minimum_size = Vector2(60, 0)
	scroll_strip.size_flags_vertical = Control.SIZE_EXPAND_FILL
	scroll_strip.mouse_filter = Control.MOUSE_FILTER_PASS
	content_hbox.add_child(scroll_strip)
	scroll_strip.gui_input.connect(func(ev: InputEvent):
		if ev is InputEventScreenDrag or ev is InputEventMouseMotion:
			var dy: float = 0.0
			if ev is InputEventScreenDrag:
				dy = -(ev as InputEventScreenDrag).relative.y
			elif ev is InputEventMouseMotion and (ev as InputEventMouseMotion).button_mask != 0:
				dy = -(ev as InputEventMouseMotion).relative.y
			if dy != 0.0:
				scroll.scroll_vertical += int(dy)
	)

	var margin := MarginContainer.new()
	margin.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	margin.add_theme_constant_override("margin_left",   12)
	margin.add_theme_constant_override("margin_right",  12)
	margin.add_theme_constant_override("margin_top",    10)
	margin.add_theme_constant_override("margin_bottom", 10)
	scroll.add_child(margin)

	var song_vbox := VBoxContainer.new()
	song_vbox.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	song_vbox.add_theme_constant_override("separation", 2)
	margin.add_child(song_vbox)

	var indices: Array = playlists.get(pl_name, [])
	if indices.is_empty():
		var empty_lbl := Label.new()
		empty_lbl.text = "Bu liste bos.\nŞarki menüsünden ekleyebilirsin."
		empty_lbl.add_theme_color_override("font_color", COLOR_MUTED)
		empty_lbl.add_theme_font_size_override("font_size", 14)
		empty_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
		empty_lbl.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
		empty_lbl.custom_minimum_size.y = 120
		song_vbox.add_child(empty_lbl)
	else:
		for n in indices.size():
			var idx: int = indices[n]
			if idx >= songs.size(): continue
			var s := songs[idx]
			var is_cur := idx == current_index
			var row := _song_row_playlist_detail(n + 1, s, is_cur, pl_name)
			song_vbox.add_child(row)


func _on_new_playlist() -> void:
	_show_name_dialog("Yeni Calma Listesi", func(name: String):
		if name.strip_edges().is_empty(): return
		if playlists.has(name):
			_show_toast("Bu isim zaten var!"); return
		playlists[name] = []
		_save_playlists()
		_render_playlists()
		_show_toast("Olusturuldu: " + name)
	)

func _on_delete_playlist(pl_name: String) -> void:
	playlists.erase(pl_name)
	_save_playlists()
	_render_playlists()
	_show_toast("Silindi: " + pl_name)

func _on_remove_from_playlist(pl_name: String, song_idx: int) -> void:
	if playlists.has(pl_name):
		playlists[pl_name].erase(song_idx)
		_save_playlists()
		_render_playlists()

func _show_name_dialog(title: String, on_confirm: Callable) -> void:
	var overlay := ColorRect.new()
	overlay.color = Color(0, 0, 0, 0.65)
	overlay.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	overlay.z_index = 10
	add_child(overlay)

	var center := CenterContainer.new()
	center.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
	overlay.add_child(center)

	var box := _panel(Color(0.08, 0.08, 0.12, 1.0))
	box.custom_minimum_size = Vector2(300, 0)
	center.add_child(box)

	var vb := VBoxContainer.new()
	vb.add_theme_constant_override("separation", 10)
	box.add_child(vb)

	var title_lbl := Label.new()
	title_lbl.text = title
	title_lbl.add_theme_font_size_override("font_size", 15)
	title_lbl.add_theme_color_override("font_color", COLOR_TEXT)
	title_lbl.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	title_lbl.custom_minimum_size.y = 42
	vb.add_child(title_lbl)

	var input := LineEdit.new()
	input.placeholder_text = "Liste adi..."
	input.custom_minimum_size.y = 44
	input.add_theme_font_size_override("font_size", 14)
	input.add_theme_color_override("font_color", COLOR_TEXT)
	input.add_theme_stylebox_override("normal",
		_stylebox(Color(0.12, 0.12, 0.18, 1.0), 8, COLOR_BORDER, 1))
	input.add_theme_stylebox_override("focus",
		_stylebox(Color(0.12, 0.12, 0.18, 1.0), 8, COLOR_ACCENT, 1))
	vb.add_child(input)

	var btn_row := HBoxContainer.new()
	btn_row.add_theme_constant_override("separation", 8)
	vb.add_child(btn_row)

	var cancel_btn := _make_btn()
	cancel_btn.text = "Iptal"
	cancel_btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	cancel_btn.custom_minimum_size.y = 44
	cancel_btn.add_theme_stylebox_override("normal", _stylebox(Color(0.15, 0.15, 0.2, 1.0), 8))
	cancel_btn.add_theme_stylebox_override("focus",  StyleBoxEmpty.new())
	cancel_btn.add_theme_color_override("font_color", COLOR_MUTED)
	cancel_btn.pressed.connect(func(): overlay.queue_free())
	btn_row.add_child(cancel_btn)

	var ok_btn := _make_btn()
	ok_btn.text = "Olustur"
	ok_btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	ok_btn.custom_minimum_size.y = 44
	ok_btn.add_theme_stylebox_override("normal", _stylebox(COLOR_ACCENT, 8))
	ok_btn.add_theme_stylebox_override("focus",  StyleBoxEmpty.new())
	ok_btn.add_theme_color_override("font_color", COLOR_BG)
	ok_btn.pressed.connect(func():
		var name := input.text.strip_edges()
		overlay.queue_free()
		on_confirm.call(name)
	)
	input.text_submitted.connect(func(_t):
		var name := input.text.strip_edges()
		overlay.queue_free()
		on_confirm.call(name)
	)
	btn_row.add_child(ok_btn)
	input.grab_focus()

func _show_toast(msg: String) -> void:
	var toast := Label.new()
	toast.text = msg
	toast.add_theme_font_size_override("font_size", 13)
	toast.add_theme_color_override("font_color", COLOR_BG)
	toast.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	toast.z_index = 20
	toast.set_anchors_and_offsets_preset(Control.PRESET_CENTER_BOTTOM)
	toast.offset_bottom = -80
	toast.offset_top    = -116
	toast.offset_left   = -150
	toast.offset_right  =  150
	var sb := _stylebox(COLOR_ACCENT, 10)
	sb.content_margin_left  = 16
	sb.content_margin_right = 16
	sb.content_margin_top   = 8
	sb.content_margin_bottom= 8
	toast.add_theme_stylebox_override("normal", sb)
	add_child(toast)
	var t := get_tree().create_timer(2.0)
	t.timeout.connect(func(): if is_instance_valid(toast): toast.queue_free())

func _save_playlists() -> void:
	var file := FileAccess.open("user://playlists.dat", FileAccess.WRITE)
	if file:
		file.store_var(playlists)
		file.close()

func _load_playlists() -> void:
	if FileAccess.file_exists("user://playlists.dat"):
		var file := FileAccess.open("user://playlists.dat", FileAccess.READ)
		if file:
			var data = file.get_var()
			if data is Dictionary: playlists = data
			file.close()
	_warmup_playlist_cdns()

func _warmup_playlist_cdns() -> void:
	# Sadece playlist'teki şarkıların CDN URL'lerini öğren
	var indices: Array = []
	for pl_name in playlists.keys():
		for idx in playlists[pl_name]:
			if idx < songs.size() and not idx in indices:
				indices.append(idx)
	if indices.is_empty(): return
	_pl_warmup_queue = indices.filter(
		func(i): return not cdn_url_cache.has(songs[i]["file"])
	)
	_pl_warmup_next()

var _pl_warmup_queue: Array = []
var _http_pl_warmup: HTTPRequest = null

func _pl_warmup_next() -> void:
	while not _pl_warmup_queue.is_empty():
		var idx: int = _pl_warmup_queue[0]
		_pl_warmup_queue.remove_at(0)
		if idx >= songs.size(): continue
		if cdn_url_cache.has(songs[idx]["file"]): continue
		var song: Dictionary = songs[idx]
		if is_instance_valid(_http_pl_warmup):
			_http_pl_warmup.cancel_request()
			_http_pl_warmup.queue_free()
		_http_pl_warmup = HTTPRequest.new()
		_http_pl_warmup.max_redirects = 0
		_http_pl_warmup.use_threads = false
		add_child(_http_pl_warmup)
		_http_pl_warmup.request_completed.connect(_on_pl_warmup_done.bind(song["file"]))
		_http_pl_warmup.request(song["url"], PackedStringArray([
			"User-Agent: GodotEngine/4.3 (compatible; Sportify/1.0)"
		]))
		return
	# Kuyruk bitti

func _on_pl_warmup_done(_result: int, code: int,
		headers: PackedStringArray, _body: PackedByteArray,
		file_key: String) -> void:
	if is_instance_valid(_http_pl_warmup):
		_http_pl_warmup.queue_free()
		_http_pl_warmup = null
	if code == 301 or code == 302:
		for header in headers:
			if (header as String).to_lower().begins_with("location:"):
				cdn_url_cache[file_key] = (header as String).substr(9).strip_edges()
				break
	await get_tree().create_timer(0.25).timeout
	_pl_warmup_next()

func _tab_btn(label: String, is_active: bool) -> Button:
	var btn := _make_btn()
	btn.text = label
	btn.custom_minimum_size.y = 34
	btn.size_flags_horizontal = Control.SIZE_SHRINK_CENTER
	btn.add_theme_font_size_override("font_size", 12)
	if is_active:
		btn.add_theme_stylebox_override("normal", _stylebox(COLOR_TEXT, 20))
		btn.add_theme_color_override("font_color", COLOR_BG)
	else:
		btn.add_theme_stylebox_override("normal",
			_stylebox(Color(COLOR_ACCENT.r, COLOR_ACCENT.g, COLOR_ACCENT.b, 0.08), 20, COLOR_BORDER, 1))
		btn.add_theme_color_override("font_color", COLOR_TEXT)
	btn.add_theme_stylebox_override("hover",
		_stylebox(Color(1, 1, 1, 0.15), 20))
	btn.add_theme_stylebox_override("pressed",
		_stylebox(COLOR_TEXT, 20))
	btn.add_theme_stylebox_override("focus", StyleBoxEmpty.new())
	return btn

# ─────────────────────────────────────────────────────────────
#  PLAYBACK
#  - Cache varsa anında çal
#  - Yoksa: redirect al → tam dosyayı indir
#  - get_downloaded_bytes() ile buffer bar gerçek zamanlı güncelle
# ─────────────────────────────────────────────────────────────

var _active_file:  String = ""
var _total_bytes:  int    = 0
var _buf_timer:    Timer  = null

func _on_song_pressed(song_index: int) -> void:
	if current_index == song_index:
		_on_play_pause(); return
	current_index = song_index
	_load_and_play(songs[song_index])
	_update_fav_btn()
	# Çalınma sayısını Supabase'e kaydet
	_increment_play_count(songs[song_index]["file"])

func _increment_play_count(song_file: String) -> void:
	# Önce kaydı var mı kontrol et
	if is_instance_valid(http_stats):
		http_stats.cancel_request(); http_stats.queue_free()
	http_stats = HTTPRequest.new()
	http_stats.use_threads = false
	add_child(http_stats)
	http_stats.request_completed.connect(
		_on_stats_read.bind(song_file))
	http_stats.request(
		SUPABASE_URL + "/rest/v1/song_stats?song_file=eq." + song_file.uri_encode() + "&select=id,play_count",
		PackedStringArray([
			"apikey: " + SUPABASE_ANON_KEY,
			"Authorization: Bearer " + SUPABASE_ANON_KEY
		])
	)

func _on_stats_read(_result: int, code: int,
		_headers: PackedStringArray, body: PackedByteArray,
		song_file: String) -> void:
	if is_instance_valid(http_stats):
		http_stats.queue_free(); http_stats = null

	if code != 200: return

	var json := JSON.new()
	if json.parse(body.get_string_from_utf8()) != OK: return
	var data = json.get_data()

	if is_instance_valid(http_stats):
		http_stats.cancel_request(); http_stats.queue_free()
	http_stats = HTTPRequest.new()
	http_stats.use_threads = false
	add_child(http_stats)

	if data is Array and data.size() > 0:
		# Kayıt var, play_count artır
		var current_count: int = int(data[0].get("play_count", 0))
		var patch_body := JSON.stringify({"play_count": current_count + 1})
		http_stats.request_completed.connect(func(_r,_c,_h,_b): 
			if is_instance_valid(http_stats): http_stats.queue_free(); http_stats = null)
		http_stats.request(
			SUPABASE_URL + "/rest/v1/song_stats?song_file=eq." + song_file.uri_encode(),
			PackedStringArray([
				"apikey: " + SUPABASE_ANON_KEY,
				"Authorization: Bearer " + SUPABASE_ANON_KEY,
				"Content-Type: application/json",
				"Prefer: return=minimal"
			]),
			HTTPClient.METHOD_PATCH,
			patch_body
		)
	else:
		# Kayıt yok, yeni oluştur
		var insert_body := JSON.stringify({"song_file": song_file, "play_count": 1})
		http_stats.request_completed.connect(func(_r,_c,_h,_b):
			if is_instance_valid(http_stats): http_stats.queue_free(); http_stats = null)
		http_stats.request(
			SUPABASE_URL + "/rest/v1/song_stats",
			PackedStringArray([
				"apikey: " + SUPABASE_ANON_KEY,
				"Authorization: Bearer " + SUPABASE_ANON_KEY,
				"Content-Type: application/json",
				"Prefer: return=minimal"
			]),
			HTTPClient.METHOD_POST,
			insert_body
		)

func _load_and_play(song: Dictionary) -> void:
	_active_file = song["file"]
	_total_bytes = 0
	now_playing_label.text  = song["name"]
	now_playing_artist.text = _artist_label(song)
	now_cover_label.text    = song["emoji"]
	is_playing = false
	_update_pulse_anim()
	seek_bar.set_progress(0.0)
	time_label.text     = "0:00"
	duration_label.text = "0:00"

	_free_http(http_audio);    http_audio    = null
	_free_http(http_rest);     http_rest     = null
	_free_http(http_prefetch); http_prefetch = null
	_stop_buf_timer()
	_chunk1_buf = PackedByteArray()
	_cdn_url    = ""
	# Stream'i durdur ki pozisyon 0'a dönsün
	if stream_player != null:
		stream_player.stop()

	if cache.has(song["file"]):
		status_label.text = "%d sarki" % songs.size()
		_play_bytes(cache[song["file"]])
		_refresh_song_highlights()
		_start_prefetch()
		return

	# CDN URL zaten önbellekte varsa redirect adımını atla (~1-2sn kazanç)
	if cdn_url_cache.has(song["file"]):
		status_label.text = "Yukleniyor..."
		_refresh_song_highlights()
		_cdn_url = cdn_url_cache[song["file"]]
		_fetch_chunk1(song["file"])
		return

	status_label.text = "Baglaniyor..."
	_refresh_song_highlights()

	# Redirect URL al
	http_audio = HTTPRequest.new()
	http_audio.max_redirects = 0
	http_audio.use_threads   = false
	add_child(http_audio)
	http_audio.request_completed.connect(_on_got_redirect.bind(song))
	http_audio.request(song["url"], PackedStringArray([
		"User-Agent: GodotEngine/4.3 (compatible; Sportify/1.0)"
	]))

const CHUNK1_MIN :=  32_000
const CHUNK1_MAX := 400_000

var chunk1_size:      int = 100_000
var _chunk1_start_ms: int = 0
var _cdn_url:         String          = ""
var _chunk1_buf:      PackedByteArray = PackedByteArray()
var http_rest:        HTTPRequest     = null

func _on_got_redirect(_result: int, code: int,
		headers: PackedStringArray, _body: PackedByteArray,
		song: Dictionary) -> void:
	_free_http(http_audio); http_audio = null

	_cdn_url = song["url"]
	if code == 301 or code == 302:
		for h in headers:
			if (h as String).to_lower().begins_with("location:"):
				_cdn_url = (h as String).substr(9).strip_edges()
				break

	# CDN URL'yi önbelleğe kaydet (sonraki tıklamada redirect olmaz)
	cdn_url_cache[song["file"]] = _cdn_url

	status_label.text = "Yukleniyor..."
	_fetch_chunk1(song["file"])

func _fetch_chunk1(file_key: String) -> void:
	http_audio = HTTPRequest.new()
	http_audio.max_redirects = 5
	http_audio.use_threads   = false
	add_child(http_audio)
	http_audio.request_completed.connect(_on_chunk1.bind(file_key))
	http_audio.request(_cdn_url, PackedStringArray([
		"User-Agent: GodotEngine/4.3 (compatible; Sportify/1.0)",
		"Range: bytes=0-%d" % (chunk1_size - 1)
	]))
	_chunk1_start_ms = Time.get_ticks_msec()
	_start_buf_timer()

func _on_chunk1(result: int, resp_code: int,
		_headers: PackedStringArray, body: PackedByteArray,
		file_key: String) -> void:
	_stop_buf_timer()
	_free_http(http_audio); http_audio = null

	if result != HTTPRequest.RESULT_SUCCESS or (resp_code != 200 and resp_code != 206):
		status_label.text = "Hata (%d)" % resp_code; return
	if body.size() < 512:
		status_label.text = "Bos veri"; return

	if file_key != _active_file:
		return

	# Bağlantı hızını ölç → sonraki chunk boyutunu ayarla
	var elapsed_ms := Time.get_ticks_msec() - _chunk1_start_ms
	if elapsed_ms > 0:
		# KB/sn cinsinden hız
		var speed_bps: float = float(body.size()) / (float(elapsed_ms) / 1000.0)
		# Hedef: 3 saniyede inecek kadar veri
		var target: int = int(speed_bps * 3.0)
		chunk1_size = clampi(target, CHUNK1_MIN, CHUNK1_MAX)

	_chunk1_buf = body
	_play_bytes(body.duplicate())
	status_label.text = "%d sarki" % songs.size()
	_refresh_song_highlights()

	# Adim 3: Kalan kısmı arka planda indir (Range desteklendiyse)
	if resp_code == 206:
		http_rest = HTTPRequest.new()
		http_rest.max_redirects = 5
		http_rest.use_threads   = true
		add_child(http_rest)
		http_rest.request_completed.connect(_on_rest.bind(file_key))
		http_rest.request(_cdn_url, PackedStringArray([
			"User-Agent: GodotEngine/4.3 (compatible; Sportify/1.0)",
			"Range: bytes=%d-" % chunk1_size
		]))
		_start_buf_timer()
	else:
		# Range desteklenmedi, tam dosya zaten geldi
		cache[file_key] = body
		if cache.size() > MAX_CACHE: cache.erase(cache.keys()[0])
		_start_prefetch()

func _on_rest(result: int, resp_code: int,
		_headers: PackedStringArray, body: PackedByteArray,
		file_key: String) -> void:
	_stop_buf_timer()
	_free_http(http_rest); http_rest = null

	if result == HTTPRequest.RESULT_SUCCESS and (resp_code == 200 or resp_code == 206) and body.size() > 0:
		var full := PackedByteArray()
		full.append_array(_chunk1_buf if file_key == _active_file else PackedByteArray())
		full.append_array(body)
		cache[file_key] = full
		if cache.size() > MAX_CACHE: cache.erase(cache.keys()[0])

		if file_key == _active_file:
			_chunk1_buf = PackedByteArray()
			status_label.text = "%d sarki" % songs.size()
			# Konumu koru, stream'i tam dosyayla sessizce güncelle
			if stream_player != null:
				var pos := stream_player.get_playback_position()
				var was_playing := is_playing
				var full_stream := AudioStreamMP3.new()
				full_stream.data = full
				# Önce dur, sonra yeni stream'i ata, sonra devam et
				stream_player.stop()
				stream_player.stream = full_stream
				if was_playing:
					stream_player.play(pos)
				else:
					stream_player.play(pos)
					stream_player.stream_paused = true

	_start_prefetch()

func _on_downloaded(result: int, code: int,
		_headers: PackedStringArray, body: PackedByteArray,
		file_key: String) -> void:
	_stop_buf_timer()
	_free_http(http_audio); http_audio = null
	if result != HTTPRequest.RESULT_SUCCESS or code != 200: return
	if body.size() < 512: return
	cache[file_key] = body
	if cache.size() > MAX_CACHE: cache.erase(cache.keys()[0])
	if file_key == _active_file and not is_playing:
		_play_bytes(body); _refresh_song_highlights(); _start_prefetch()

func _start_buf_timer() -> void:
	_stop_buf_timer()
	_buf_timer = Timer.new()
	_buf_timer.wait_time = 0.2
	_buf_timer.one_shot  = false
	add_child(_buf_timer)
	_buf_timer.timeout.connect(_tick_buf)
	_buf_timer.start()

func _tick_buf() -> void:
	var got := 0
	if is_instance_valid(http_audio):
		got = http_audio.get_downloaded_bytes()
	elif is_instance_valid(http_rest):
		got = chunk1_size + http_rest.get_downloaded_bytes()
	else:
		_stop_buf_timer(); return
	if got > 0:
		status_label.text = "%dKB indiriliyor..." % (got >> 10)

func _stop_buf_timer() -> void:
	if is_instance_valid(_buf_timer):
		_buf_timer.stop(); _buf_timer.queue_free(); _buf_timer = null

func _play_bytes(body: PackedByteArray) -> void:
	var stream := AudioStreamMP3.new()
	stream.data = body
	if stream.get_length() <= 0.0:
		status_label.text = "MP3 decode hatasi (s:%d)" % body.size()
		return
	stream_player.stop()
	stream_player.stream = stream
	stream_player.play()
	is_playing = true
	play_btn.text = "⏸"
	_refresh_song_highlights()
	_update_pulse_anim()

func _start_prefetch() -> void:
	if songs.is_empty() or current_index < 0: return
	var next_idx: int = (current_index + 1) % songs.size()
	var next_song: Dictionary = songs[next_idx]
	if cache.has(next_song["file"]): return
	if is_instance_valid(http_prefetch): return

	http_prefetch = HTTPRequest.new()
	http_prefetch.max_redirects = 10
	http_prefetch.use_threads   = false
	add_child(http_prefetch)
	http_prefetch.request_completed.connect(
		_on_prefetch_done.bind(next_song["file"]))
	http_prefetch.request(next_song["url"], PackedStringArray([
		"User-Agent: GodotEngine/4.3 (compatible; Sportify/1.0)"
	]))

func _on_prefetch_done(result: int, code: int,
		_headers: PackedStringArray, body: PackedByteArray,
		file_key: String) -> void:
	_free_http(http_prefetch); http_prefetch = null
	if result == HTTPRequest.RESULT_SUCCESS and code == 200 and body.size() > 512:
		cache[file_key] = body
		if cache.size() > MAX_CACHE: cache.erase(cache.keys()[0])

func _free_http(node: HTTPRequest) -> void:
	if is_instance_valid(node):
		node.cancel_request()
		node.queue_free()

func _seek_to(pct: float) -> void:
	if stream_player == null or stream_player.stream == null: return
	var dur: float = stream_player.stream.get_length()
	if dur > 0.0:
		stream_player.seek(pct * dur)
		time_label.text = _fmt(pct * dur)

func _on_play_pause() -> void:
	if current_index < 0:
		if not songs.is_empty(): _on_song_pressed(0)
		return
	if is_playing:
		stream_player.stream_paused = true
		is_playing = false; play_btn.text = "▶"
	else:
		stream_player.stream_paused = false
		is_playing = true;  play_btn.text = "⏸"
	_refresh_song_highlights()
	_update_pulse_anim()

func _update_pulse_anim() -> void:
	if not is_instance_valid(now_cover_label): return
	if is_instance_valid(_pulse_tween):
		_pulse_tween.kill()
		_pulse_tween = null
	
	now_cover_label.pivot_offset = now_cover_label.size / 2.0

	if is_playing:
		_pulse_tween = now_cover_label.create_tween().set_loops()
		_pulse_tween.tween_property(now_cover_label, "scale", Vector2(1.2, 1.2), 0.6).set_ease(Tween.EASE_IN_OUT).set_trans(Tween.TRANS_SINE)
		_pulse_tween.tween_property(now_cover_label, "scale", Vector2(1.0, 1.0), 0.6).set_ease(Tween.EASE_IN_OUT).set_trans(Tween.TRANS_SINE)
	else:
		var tw := now_cover_label.create_tween()
		tw.tween_property(now_cover_label, "scale", Vector2(1.0, 1.0), 0.2).set_ease(Tween.EASE_OUT)

func _on_prev() -> void:
	if songs.is_empty(): return
	current_index = (current_index - 1 + songs.size()) % songs.size()
	_load_and_play(songs[current_index])

func _on_toggle_queue(song_idx: int, q_btn: Button) -> void:
	if song_idx in song_queue:
		song_queue.erase(song_idx)
		q_btn.text = "+"
		q_btn.add_theme_color_override("font_color", COLOR_MUTED)
		_show_toast("Siradan cikarildi")
	else:
		song_queue.append(song_idx)
		q_btn.text = "✓"
		q_btn.add_theme_color_override("font_color", COLOR_ACCENT)
		_show_toast("Siraya eklendi")

func _on_next() -> void:
	if songs.is_empty(): return
	# Kuyrukta şarkı varsa önce onları çal
	if not song_queue.is_empty():
		var next_idx: int = song_queue.pop_front()
		current_index = next_idx
		_load_and_play(songs[current_index])
		_update_fav_btn()
		_refresh_song_highlights()
		return
	current_index = (current_index + 1) % songs.size()
	_load_and_play(songs[current_index])
	_update_fav_btn()

func _on_song_finished() -> void:
	# Kalan kısım hâlâ iniyorsa bekle - rest bitince seamless devam eder
	if is_instance_valid(http_rest):
		return
	# Cache'te tam dosya var mı kontrol et
	if cache.has(_active_file):
		var full: PackedByteArray = cache[_active_file]
		# Şu an çalınan stream'den daha uzunsa → tam dosyayla devam et
		if stream_player.stream != null:
			var cur_dur: float = stream_player.stream.get_length()
			var full_stream := AudioStreamMP3.new()
			full_stream.data = full
			var full_dur: float = full_stream.get_length()
			if full_dur > cur_dur + 1.0:
				# Tam dosya daha uzun, seamless geç
				var pos := cur_dur - 0.5  # chunk'ın sonundan biraz önce
				stream_player.stream = full_stream
				stream_player.play(maxf(pos, 0.0))
				return
	_on_next()

func _update_progress() -> void:
	if stream_player == null or not is_playing: return
	if stream_player.stream == null: return
	var pos: float = stream_player.get_playback_position()
	var dur: float = stream_player.stream.get_length()
	if dur > 0.0:
		seek_bar.set_progress(pos / dur)
		time_label.text     = _fmt(pos)
		duration_label.text = _fmt(dur)
	# Buffer: ilk chunk inince dur genellikle belli olur

func _on_search_changed(text: String) -> void:
	_pending_search = text
	if _search_timer == null:
		_search_timer = Timer.new()
		_search_timer.one_shot = true
		_search_timer.wait_time = 0.3
		_search_timer.timeout.connect(_apply_search)
		add_child(_search_timer)
	_search_timer.stop()
	_search_timer.start()

func _apply_search() -> void:
	var q := _pending_search.to_lower()
	var q_empty := q.is_empty()
	for i in songs.size():
		var song: Dictionary = songs[i]
		var is_match: bool = q_empty or (song["name"] as String).to_lower().contains(q) or (song["artist"] as String).to_lower().contains(q)
		if i < song_row_refs.size() and is_instance_valid(song_row_refs[i]):
			song_row_refs[i].visible = is_match

	if is_instance_valid(song_scroll):
		song_scroll.scroll_vertical = 0

func _artist_label(song: Dictionary) -> String:
	var artist: String = song["artist"] if song["artist"] != "" else "Sportify Music"
	var repo: String = song.get("repo", "repo_1")
	return artist + " • " + repo

# ─────────────────────────────────────────────────────────────
#  YARDIMCILAR
# ─────────────────────────────────────────────────────────────
func _fmt(t: float) -> String:
	var ti := int(t)
	return "%d:%02d" % [ti / 60, ti % 60]

# ─────────────────────────────────────────────────────────────
#  MERKEZI BUTON FABRIKASI
#  Tüm butonlar buradan geçer. Focus davranışını değiştirmek
#  istersen sadece bu fonksiyonu düzenle.
# ─────────────────────────────────────────────────────────────
func _make_btn() -> Button:
	var btn := Button.new()
	btn.focus_mode = Control.FOCUS_NONE
	btn.add_theme_stylebox_override("focus", StyleBoxEmpty.new())

	# Mobil dostu tıklama (bump) animasyonu
	btn.button_down.connect(func():
		var tw := btn.create_tween()
		btn.pivot_offset = btn.size / 2.0
		tw.tween_property(btn, "scale", Vector2(0.95, 0.95), 0.08).set_ease(Tween.EASE_OUT).set_trans(Tween.TRANS_QUAD)
	)
	btn.button_up.connect(func():
		var tw := btn.create_tween()
		btn.pivot_offset = btn.size / 2.0
		tw.tween_property(btn, "scale", Vector2(1.0, 1.0), 0.15).set_ease(Tween.EASE_OUT).set_trans(Tween.TRANS_BACK)
	)

	return btn

func _stylebox(bg: Color, radius: int = 0,
		border: Color = Color.TRANSPARENT, border_w: int = 0) -> StyleBoxFlat:
	var sb := StyleBoxFlat.new()
	sb.bg_color = bg
	sb.set_corner_radius_all(radius)
	if border_w > 0:
		sb.border_color = border
		sb.set_border_width_all(border_w)
	return sb

func _panel(color: Color) -> PanelContainer:
	var p := PanelContainer.new()
	p.add_theme_stylebox_override("panel", _stylebox(color, 12))
	return p

func _panel_radius(color: Color, radius: int) -> PanelContainer:
	var p := PanelContainer.new()
	p.add_theme_stylebox_override("panel", _stylebox(color, radius))
	return p

func _ctrl_btn(label_text: String, is_main: bool) -> Button:
	var btn := _make_btn()
	btn.text = label_text
	var sz := 52 if is_main else 40
	btn.custom_minimum_size = Vector2(sz, sz)
	btn.add_theme_font_size_override("font_size", 20 if is_main else 16)
	var half: int = sz / 2
	if is_main:
		btn.add_theme_stylebox_override("normal",  _stylebox(COLOR_ACCENT, half))
		btn.add_theme_stylebox_override("hover",   _stylebox(COLOR_ACCENT.lightened(0.15), half))
		btn.add_theme_stylebox_override("pressed", _stylebox(COLOR_ACCENT.darkened(0.10), half))
		btn.add_theme_stylebox_override("focus",   StyleBoxEmpty.new())
		btn.add_theme_color_override("font_color",         Color(1, 1, 1, 1))
		btn.add_theme_color_override("font_pressed_color", Color(1, 1, 1, 1))
		btn.add_theme_color_override("font_hover_color",   Color(1, 1, 1, 1))
	else:
		var base := Color(COLOR_ACCENT.r, COLOR_ACCENT.g, COLOR_ACCENT.b, 0.14)
		btn.add_theme_stylebox_override("normal",  _stylebox(base, half, COLOR_BORDER, 1))
		btn.add_theme_stylebox_override("hover",   _stylebox(Color(COLOR_ACCENT.r, COLOR_ACCENT.g, COLOR_ACCENT.b, 0.28), half))
		btn.add_theme_stylebox_override("pressed", _stylebox(Color(COLOR_ACCENT.r, COLOR_ACCENT.g, COLOR_ACCENT.b, 0.38), half))
		btn.add_theme_stylebox_override("focus",   StyleBoxEmpty.new())
		btn.add_theme_color_override("font_color",       COLOR_TEXT)
		btn.add_theme_color_override("font_hover_color", COLOR_ACCENT)
	return btn
