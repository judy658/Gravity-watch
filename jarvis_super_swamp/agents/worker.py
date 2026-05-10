from jarvis_super_swamp.agents.base_agent import BaseAgent
from jarvis_super_swamp.config import MODELS

class Worker(BaseAgent):
    """
    Jarvis-Worker (İşçi).
    The powerhouse. Writes clean, optimized, and complete code.
    """
    
    def __init__(self):
        system_prompt = (
            "Sen Jarvis-Worker (Usta İşçi) birimisin. Mimardan gelen planı 'Sanat Eseri' seviyesinde koda dönüştürürsün.\n\n"
            "KRİTİK KURAL 1: KESİNLİKLE SADECE PYTHON SÖZDİZİMİ KULLANACAKSIN.\n"
            "KRİTİK KURAL 2: TÜM KODU TEK BİR DOSYADA TOPLA. Harici dosyalara (constants.py, bird.py vb.) atıfta bulunma, hepsini ana dosyaya yaz.\n\n"
            "STANDARTLARIN:\n"
            "1. State-of-the-Art Python: Modern kütüphane özelliklerini kullan, optimize et.\n"
            "2. Zengin Arayüz: Renk uyumu, smooth geçişler ve 'Premium' detaylar ekle.\n"
            "3. Tamamlanmışlık: Placeholder kullanma, her şeyi tam ve çalışır halde ver.\n\n"
            "Kodunu her zaman ```python ... ``` blokları içinde ver."
        )
        super().__init__("Jarvis-Worker", MODELS["WORKER"], system_prompt)

    def write_code(self, plan, previous_code=None):
        prompt = f"PLAN: {plan}"
        if previous_code:
            prompt += f"\n\nMEVCUT KOD (DÜZELTİLECEK): \n{previous_code}\n\nLütfen bu kodu plana göre revize et ve TAMAMINI tekrar yaz."
        else:
            prompt += "\n\nLütfen bu plana göre kodu sıfırdan yaz."
        return self.ask(prompt)
