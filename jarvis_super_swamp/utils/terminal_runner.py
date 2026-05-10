import subprocess
import os
import sys

class TerminalRunner:
    """
    The 'Eyes' of the Jarvis-Inspector.
    Runs python code in a separate process and returns the results.
    """
    
    @staticmethod
    def run_code(file_path, timeout=30):
        """
        Executes a python file and returns (success, output, error).
        Supports a 'Liveness Test' for GUI apps (Pygame, Tkinter).
        """
        if not os.path.exists(file_path):
            return False, "", f"File not found: {file_path}"
        
        try:
            # GUI detection
            is_gui = False
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                    if "pygame" in content or "tkinter" in content:
                        is_gui = True
            except:
                pass

            if is_gui:
                # GUI Liveness Test: Run for 5 seconds, if no crash, it's a pass.
                process = subprocess.Popen(
                    [sys.executable, file_path],
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
                try:
                    # Wait 5 seconds for a crash
                    _, stderr = process.communicate(timeout=5)
                    # If it finished early, it might be a crash or a quick finish
                    return (process.returncode == 0), "GUI App finished early.", stderr
                except subprocess.TimeoutExpired:
                    # It's alive! Kill it and report success.
                    process.kill()
                    return True, "GUI App started successfully (5s liveness test passed).", ""

            # Standard CLI execution
            result = subprocess.run(
                [sys.executable, file_path],
                capture_output=True,
                text=True,
                timeout=timeout
            )
            
            success = (result.returncode == 0)
            return success, result.stdout, result.stderr
        except Exception as e:
            return False, "", str(e)

if __name__ == "__main__":
    # Test
    with open("test_temp.py", "w") as f:
        f.write("print('Hello from Sandbox!')\n")
        f.write("import sys\n")
        f.write("sys.exit(0)")
    
    runner = TerminalRunner()
    success, out, err = runner.run_code("test_temp.py")
    print(f"Success: {success}")
    print(f"Output: {out}")
    print(f"Error: {err}")
    os.remove("test_temp.py")
