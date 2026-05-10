import ollama
import os

class VisionEngine:
    def __init__(self, model_name="moondream:latest"):
        self.model_name = model_name

    def analyze_image(self, image_path, prompt="This is a screenshot of a computer screen. Describe the UI, websites, windows, and main content visible on this screen in Turkish."):
        """
        Sends the image to Moondream via Ollama API and returns the description.
        """
        if not os.path.exists(image_path):
            return "Error: Screenshot not found."

        try:
            response = ollama.generate(
                model=self.model_name,
                prompt=prompt,
                images=[image_path]
            )
            return response['response']
        except Exception as e:
            return f"Ollama Error: {str(e)}"

    def find_element(self, image_path, element_name):
        """
        Asks Moondream to find the coordinates or location of a specific element.
        """
        prompt = f"Where is the '{element_name}' located on this screen? Provide a brief description of its position."
        return self.analyze_image(image_path, prompt)
