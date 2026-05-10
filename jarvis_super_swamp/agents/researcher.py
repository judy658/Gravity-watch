from jarvis_super_swamp.agents.base_agent import BaseAgent
from jarvis_super_swamp.config import MODELS
from jarvis_super_swamp.utils.memory_manager import MemoryManager

class Researcher(BaseAgent):
    """
    Jarvis-Research (Araştırmacı).
    Checks local memory first, then uses AI to gather info or solve errors.
    """
    
    def __init__(self):
        self.memory = MemoryManager()
        system_prompt = (
            "Sen Jarvis-Research (Araştırmacı) birimisin. Görevin teknik bilgi toplamak ve "
            "hata çözümleri bulmaktır. Mimar'ın veya Müfettiş'in sorularını en güncel ve "
            "en doğru şekilde yanıtlamalısın. Çıktıların her zaman teknik detay içermeli."
        )
        super().__init__("Jarvis-Research", MODELS["RESEARCHER"], system_prompt)

    def research(self, project_name, query, error_msg=None):
        """
        Main research logic: Check local memory first!
        """
        if error_msg:
            # Look up in history
            past_solution = self.memory.lookup_error(project_name, error_msg)
            if past_solution:
                print(f"[{self.name}] Buldum! Bu hatayı daha önce {project_name} klasöründe çözmüştük.")
                return f"HAFIZA KAYDI BULDUM:\nHata: {past_solution['error']}\nÇözüm: {past_solution['solution_code']}"

        # If not found or not an error, use the LLM to research
        print(f"[{self.name}] Yeni bir araştırma başlatıyorum...")
        return self.ask(f"Proje: {project_name}. Soru/Hata: {query or error_msg}")
