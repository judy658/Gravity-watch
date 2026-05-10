import os
from jarvis_super_swamp.agents.base_agent import BaseAgent
from jarvis_super_swamp.config import MODELS
from jarvis_super_swamp.utils.terminal_runner import TerminalRunner

class Inspector(BaseAgent):
    """
    Jarvis-Inspector (Müfettiş).
    The quality control. Runs the code and reports errors to the Architect.
    """
    
    def __init__(self):
        self.runner = TerminalRunner()
        system_prompt = (
            "Sen Jarvis-Inspector (Müfettiş) birimisin. Görevin kodu acımasızca incelemek ve 'Kusursuzluk' onayı vermektir.\n\n"
            "GÖREVİN:\n"
            "1. Terminal çıktılarını derinlemesine analiz et. Eğer bir oyun (Pygame vb.) ise, 'while True' döngüsünün zorunlu olduğunu ve sistemin bunu 5 saniyelik bir 'Yaşam Testi' (Liveness Test) ile onayladığını bil.\n"
            "2. Kodun akışını (UX/Logic) sorgula. Eğer kod çalışıyor ama 'kalitesiz' ise (örn: Flappy Bird'de yerçekimi yoksa), bunu bir hata olarak raporla.\n"
            "3. Çözüm odaklı ol: Mimar'a hatayı düzeltmesi için teknik ipuçları ver."
        )
        super().__init__("Jarvis-Inspector", MODELS["INSPECTOR"], system_prompt)

    def inspect(self, code_file_path):
        """
        Runs the code and analyzes the result.
        """
        print(f"[{self.name}] Kod terminalde test ediliyor...")
        success, output, error = self.runner.run_code(code_file_path)
        
        if success:
            print(f"[{self.name}] Kod başarıyla çalıştı!")
            return True, "Kod başarıyla çalıştı ve beklenen çıktıyı verdi.", output
        else:
            print(f"[{self.name}] Hata tespit edildi!")
            analysis = self.ask(f"KOD DOSYASI: {code_file_path}\nTERMINAL HATASI: {error}\n\nLütfen bu hatayı analiz et.")
            return False, analysis, error

    def check_quality(self, code, user_goal):
        """
        Relentless Logic & Entity Review.
        """
        prompt = (
            f"HEDEF: {user_goal}\n"
            f"YAZILAN KOD:\n{code}\n\n"
            "SEN ACIMASIZ BİR KALİTE DENETÇİSİSİN. Bu kodu 'Oyun Mantığı' ve 'Eksiksizlik' açısından denetle.\n\n"
            "ZORUNLU CHECKLIST:\n"
            "1. TEMEL VARLIKLAR: Flappy Bird ise; Borular, Kuş ve Arkaplan var mı? (TÜMÜ TEK DOSYADA OLMALI).\n"
            "2. HARİCİ DOSYA YASAĞI: Eğer kodda 'import bird' veya 'import constants' gibi projeye ait harici dosya importları varsa DİREKT REDDET.\n"
            "3. FİZİK: Yerçekimi ve Zıplama mantığı kodlanmış mı?\n"
            "4. ÇARPIŞMA: Borulara veya yere değince yanma çalışıyor mu?\n"
            "5. ESTETİK: Kod 'public float' gibi alakasız dillerden kalıntılar içeriyor mu?\n\n"
            "EĞER BU MADDELERDEN BİRİ BİLE EKSİKSE VEYA YANLIŞSA ONAY VERME! 'HATA: [Eksik olan]' şeklinde raporla.\n"
            "Sadece her şey tamsa ve oyun gerçekten oynanabilir durumdaysa 'ONAY' yaz."
        )
        response = self.ask(prompt)
        if "ONAY" in response.upper():
            return True, "Onaylandı."
        return False, response
