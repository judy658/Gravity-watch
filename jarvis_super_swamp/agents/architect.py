from jarvis_super_swamp.agents.base_agent import BaseAgent
from jarvis_super_swamp.config import MODELS

class Architect(BaseAgent):
    """
    Jarvis-Architect (Mimar).
    The strategist. Plans the code structure based on Researcher data.
    """
    
    def __init__(self):
        system_prompt = (
            "Sen Jarvis-Architect (Mimar) birimisin. Görevin, Patron'un isteklerini 'PREMIUM' seviyesinde bir yazılıma dönüştürmek için kusursuz bir plan kurmaktır.\n\n"
            "İLKELERİN:\n"
            "1. TEK DOSYA KURALI: Tüm sınıfları, sabitleri ve mantığı SADECE TEK BİR DOSYA içine yazmalısın. (Asla 'import bird' veya 'import constants' gibi harici dosyalar planlama!).\n"
            "2. Minimalist Değil, Maksimalist Estetik: Görsel şölen ve modern renk paletleri (Gradients, Sleek Dark Mode) planla.\n"
            "3. Gerçekçi Fizik ve Akış: Oyun yapıyorsan yerçekimi, ivme ve akıcı animasyonları şart koş.\n"
            "4. Hata Payı Sıfır: İşçi'ye (Worker) değişken isimlendirmelerinden yapısal bütünlüğe kadar net direktifler ver.\n\n"
            "Çıktın her zaman net adımlardan oluşmalı ve İşçi'ye 'Şunları mutlaka yap' demelisin."
        )
        super().__init__("Jarvis-Architect", MODELS["ARCHITECT"], system_prompt)

    def create_plan(self, user_goal, research_data, last_code=None, error=None):
        prompt = f"HEDEF: {user_goal}\nARAŞTIRMA VERİSİ: {research_data}"
        if last_code:
            prompt += f"\n\nÖNCEKİ KODUN: \n{last_code}\n\nALDIĞIN HATA/ELEŞTİRİ: {error}\n\nLütfen bu hatayı düzeltecek ve kaliteyi artıracak YENİ bir plan hazırla."
        else:
            prompt += "\n\nLütfen detaylı bir plan hazırla."
        return self.ask(prompt)
