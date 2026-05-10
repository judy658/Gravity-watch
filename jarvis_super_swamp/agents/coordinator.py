from jarvis_super_swamp.agents.base_agent import BaseAgent
from jarvis_super_swamp.config import MODELS

class Coordinator(BaseAgent):
    """
    Jarvis-Core (Coordinator).
    The face of the system. Decides if a user prompt is a 'CHAT' or a 'TASK'.
    """
    
    def __init__(self):
        system_prompt = (
            "Sen Jarvis-Core (Koordinatör) birimisin. Kullanıcıyı sıcak bir şekilde karşıla. "
            "Kullanıcının isteğini analiz et: Eğer sadece sohbet ediyorsa 'CHAT' modunda kal. "
            "Eğer bir kodlama görevi, oyun yapımı veya teknik bir iş istiyorsa 'TASK' moduna geç. "
            "Yanıtlarını her zaman JSON formatında ver: {'mode': 'CHAT'/'TASK', 'response': 'mesajın', 'project_name': 'varsa projenin adı'}"
        )
        super().__init__("Jarvis-Core", MODELS["COORDINATOR"], system_prompt)

    def analyze_intent(self, user_input):
        response = self.ask(user_input)
        try:
            # Cleanup markdown
            clean_response = response.strip()
            if "```" in clean_response:
                import re
                match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", clean_response, re.DOTALL)
                if match:
                    clean_response = match.group(1)
                else:
                    clean_response = clean_response.split("```")[1]
                    if clean_response.startswith("json"):
                        clean_response = clean_response[4:]

            import json
            import ast
            
            # Clean common JSON/Python mismatches
            proc_response = clean_response.replace("null", "None").replace("true", "True").replace("false", "False")
            
            try:
                # Try standard JSON
                data = json.loads(clean_response)
                if isinstance(data, dict): return data
            except:
                pass
                
            try:
                # Try Python literal eval (handles single quotes and None)
                data = ast.literal_eval(proc_response)
                if isinstance(data, dict): return data
            except:
                pass

            # Regex Fallback: Try to find "response" and "project_name" even if JSON is broken
            import re
            resp_match = re.search(r'["\']response["\']\s*:\s*["\'](.*?)["\']', clean_response)
            mode_match = re.search(r'["\']mode["\']\s*:\s*["\'](.*?)["\']', clean_response)
            proj_match = re.search(r'["\']project_name["\']\s*:\s*["\'](.*?)["\']', clean_response)
            
            if resp_match:
                return {
                    "mode": mode_match.group(1) if mode_match else "CHAT",
                    "response": resp_match.group(1),
                    "project_name": proj_match.group(1) if proj_match else "DefaultProject"
                }
        except:
            pass
            
        # Final fallback: return the raw response as chat
        return {"mode": "CHAT", "response": response, "project_name": "DefaultProject"}
