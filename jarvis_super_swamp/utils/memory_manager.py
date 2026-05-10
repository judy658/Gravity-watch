import os
import json
from datetime import datetime

class MemoryManager:
    """
    Handles project-specific memory (The 'Hata Günlüğü').
    Allows Researcher to look up past solutions before searching online.
    """
    
    def __init__(self, base_dir="memory"):
        self.base_dir = base_dir
        if not os.path.exists(self.base_dir):
            os.makedirs(self.base_dir)

    def get_project_dir(self, project_name):
        # Sanitize project name
        safe_name = "".join([c if c.isalnum() else "_" for c in project_name]).lower()
        project_dir = os.path.join(self.base_dir, safe_name)
        if not os.path.exists(project_dir):
            os.makedirs(project_dir)
        return project_dir

    def save_error_log(self, project_name, error_msg, solution_code, plan):
        """
        Saves an error and its resolution for future reference.
        """
        project_dir = self.get_project_dir(project_name)
        log_path = os.path.join(project_dir, "history.json")
        
        entry = {
            "timestamp": datetime.now().isoformat(),
            "error": error_msg,
            "solution_code": solution_code,
            "plan": plan
        }
        
        history = []
        if os.path.exists(log_path):
            with open(log_path, "r", encoding="utf-8") as f:
                try:
                    history = json.load(f)
                except:
                    history = []
        
        history.append(entry)
        
        with open(log_path, "w", encoding="utf-8") as f:
            json.dump(history, f, indent=4, ensure_ascii=False)

    def lookup_error(self, project_name, error_msg):
        """
        Checks if a similar error has been solved before in this project.
        Returns the solution if found, otherwise None.
        """
        project_dir = self.get_project_dir(project_name)
        log_path = os.path.join(project_dir, "history.json")
        
        if not os.path.exists(log_path):
            return None
        
        with open(log_path, "r", encoding="utf-8") as f:
            try:
                history = json.load(f)
                # Simple keyword matching for now
                for entry in history:
                    if error_msg.lower() in entry["error"].lower() or entry["error"].lower() in error_msg.lower():
                        return entry
            except:
                return None
        return None
