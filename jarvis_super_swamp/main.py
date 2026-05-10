import os
import sys

# Ensure the current directory is in the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from jarvis_super_swamp.agents.coordinator import Coordinator
from jarvis_super_swamp.agents.researcher import Researcher
from jarvis_super_swamp.agents.architect import Architect
from jarvis_super_swamp.agents.worker import Worker
from jarvis_super_swamp.agents.inspector import Inspector
from jarvis_super_swamp.utils.memory_manager import MemoryManager

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

def main():
    # Initialize Team
    print("--- [Jarvis Super Swamp 2.0 Başlatılıyor] ---")
    coordinator = Coordinator()
    researcher = Researcher()
    architect = Architect()
    worker = Worker()
    inspector = Inspector()
    memory = MemoryManager()
    
    clear_screen()
    print("==========================================")
    print("      JARVIS SUPER SWAMP 2.0 - ONLINE")
    print("==========================================")
    print("Patron, emirlerini bekliyorum. (Çıkış için 'exit')")

    while True:
        user_input = input("\nPatron > ")
        if user_input.lower() in ["exit", "quit", "çık"]:
            print("Görüşmek üzere patron!")
            break

        # Step 1: Coordination
        intent = coordinator.analyze_intent(user_input)
        
        if intent["mode"] == "CHAT":
            print(f"\nJarvis-Core > {intent['response']}")
            continue
        
        # Step 2: Task Execution
        project_name = intent.get("project_name", "default_project")
        print(f"\n[SİSTEM] '{project_name}' projesi için ekip toplanıyor...")
        
        current_error = None
        last_code = None
        attempts = 0
        max_attempts = 4

        while attempts < max_attempts:
            attempts += 1
            print(f"\n--- [DENEME {attempts}] ---")
            
            # A. Research
            res_data = researcher.research(project_name, user_input, error_msg=current_error)
            
            # B. Architect
            # Passing last_code and error if they exist to the architect
            arch_response = architect.create_plan(user_input, res_data, last_code=last_code, error=current_error)
            
            # Display Architect's Thought
            print(f"\n[Jarvis-Architect Düşüncesi]:\n{arch_response}")
            
            plan = arch_response # Using the full response as the plan
            print(f"[Jarvis-Architect] Plan {'revize edildi' if attempts > 1 else 'hazırlandı'}.")
            
            # C. Worker
            # Passing the previous code so the worker can fix it
            worker_response = worker.write_code(plan, previous_code=last_code)
            
            # Display Worker's Thought (text outside of code blocks)
            import re
            worker_thought = re.sub(r"```python\s*(.*?)\s*```", "[KOD BLOĞU]", worker_response, flags=re.DOTALL).strip()
            print(f"\n[Jarvis-Worker Düşüncesi]:\n{worker_thought}")
            
            print(f"[Jarvis-Worker] Kod {'güncellendi' if attempts > 1 else 'yazıldı'}.")
            
            # Extract ALL code content from all markdown blocks
            code_blocks = re.findall(r"```python\s*(.*?)\s*```", worker_response, re.DOTALL)
            if code_blocks:
                code_content = "\n".join(code_blocks).strip()
            else:
                code_content = worker_response.strip()
            
            last_code = code_content
            file_name = f"{project_name}_run.py"
            
            with open(file_name, "w", encoding="utf-8") as f:
                f.write(code_content)
            
            # D. Inspector
            success, report, error_output = inspector.inspect(file_name)
            
            # The 'report' itself is the inspector's thought/analysis
            print(f"\n[Jarvis-Inspector Analizi]:\n{report}")
            
            if success:
                # One last qualitative check: Does it meet the 'Premium' standard?
                print(f"[Jarvis-Inspector] Fonksiyonel test geçti. Estetik ve mantık kontrolü yapılıyor...")
                is_premium, crit = inspector.check_quality(code_content, user_input)
                
                if is_premium:
                    print(f"\n[BAŞARI] Patron, işlem tamam! '{file_name}' mükemmel durumda.")
                    if attempts > 1:
                        memory.save_error_log(project_name, current_error, code_content, plan)
                    break
                else:
                    current_error = f"KOD ÇALIŞIYOR AMA KALİTESİZ: {crit}"
                    print(f"\n[Jarvis-Inspector Eleştirisi]:\n{crit}")
                    continue
            else:
                current_error = error_output
                # report is already printed above
                
                if attempts == max_attempts:
                    print("\n[JARVIS] Patron, fabrikayı zorladık ama istediğimiz kaliteye ulaşamadık.")
                    break

if __name__ == "__main__":
    main()
