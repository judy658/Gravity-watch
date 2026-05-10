import ollama

class BrainEngine:
    def __init__(self, model="llama3:latest"):
        self.model = model

    def analyze_autonomous(self, screen_description):
        # Otonom mod için daha basit bir analiz
        prompt = f"Sen J.A.R.V.I.S. sistemisin. Şu ekranı incele ve önemli bir durum/hata varsa Kaptan'a bildir. Yoksa [STABLE] yaz.\nEKRAN: {screen_description}"
        try:
            response = ollama.generate(model=self.model, prompt=prompt)
            return response['response']
        except:
            return "[STABLE]"

    def decide_action(self, user_prompt, screen_description, previous_action=""):
        system_rules = """Sen J.A.R.V.I.S. emir modülüsün.
        GÖREVİN: Kaptan'a SADECE tek bir emir cümlesi kurmak.
        
        ÖRNEK:
        HEDEF: Chrome aç
        CEVAP: Google Chrome tarayıcısını aç.
        
        KURALLAR:
        - Giriş cümlesi kurma (Kaptan, Adım vb. deme).
        - Kuralları tekrarlama.
        - SADECE yapılacak işi yaz.
        - SADECE TÜRKÇE."""
        
        user_input = f"HEDEF: {user_prompt}\nEKRAN: {screen_description}"
        
        try:
            print(f"[DEBUG] Llama3 8B ile analiz başlatılıyor...")
            response = ollama.generate(
                model=self.model, 
                system=system_rules,
                prompt=user_input
            )
            return response['response']
        except Exception as e:
            return f"Beyin Modülü Hatası: {str(e)}"
