# import os
# from datetime import datetime
# import google.generativeai as genai
# from dotenv import load_dotenv

# # Load environment variables
# load_dotenv()

# # Configure Google Gemini API
# genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

# def generate_study_plan(topic, days, hours):
#     """Generate a study plan using Google Gemini AI"""
    
    # prompt = f"""
    # Create a detailed study plan for: {topic}
    # Duration: {days} days
    # Daily study time: {hours} hours

    # Please provide:
    # 1. Daily schedule breakdown (hour by hour)
    # 2. Topic-wise distribution for all {days} days
    # 3. Recommended study materials and resources
    # 4. Effective study techniques and tips
    # 5. Progress tracking methods
    # 6. Break schedule
    # 7. Practice problems and exercises

    # Format the response with clear sections, bullet points, and day-wise breakdown.
    # """

#     try:
#         model = genai.GenerativeModel("gemini-pro")
#         response = model.generate_content(prompt)
#         return response.text
#     except Exception as e:
#         return f"Error generating study plan: {str(e)}"

# def save_plan(plan, topic):
#     """Save the study plan to a file"""
#     filename = f"study_plan_{topic.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.txt"
#     try:
#         with open(filename, 'w', encoding='utf-8') as f:
#             f.write(plan)
#         return filename
#     except Exception as e:
#         print(f"Error saving file: {str(e)}")
#         return None

# def main():
#     print("\n=== AI Study Plan Generator ===\n")
    
#     topic = input("What subject or exam are you preparing for? ")
#     while True:
#         try:
#             days = int(input("How many days do you have to prepare? "))
#             if days > 0:
#                 break
#             print("Please enter a positive number of days.")
#         except ValueError:
#             print("Please enter a valid number.")

#     while True:
#         try:
#             hours = int(input("How many hours can you study each day? "))
#             if 0 < hours <= 24:
#                 break
#             print("Please enter a number between 1 and 24.")
#         except ValueError:
#             print("Please enter a valid number.")

#     print("\nGenerating your personalized study plan...")
    
#     study_plan = generate_study_plan(topic, days, hours)
    
#     print("\n=== Your Study Plan ===\n")
#     print(study_plan)
    
#     filename = save_plan(study_plan, topic)
#     if filename:
#         print(f"\nYour study plan has been saved to: {filename}")
    
#     print("\nGood luck with your studies!")

# if __name__ == "__main__":
#     main()
import sys
import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

def generate_study_plan(topic, days, hours):
    """Generate a study plan using Google Gemini AI"""
    
    prompt = f"""
    Create a detailed study plan for: {topic}
    Duration: {days} days
    Daily study time: {hours} hours

    Please provide:
    1. Daily schedule breakdown (hour by hour)
    2. Topic-wise distribution for all {days} days
    3. Recommended study materials and resources
    4. Effective study techniques and tips
    5. Progress tracking methods
    6. Break schedule
    7. Practice problems and exercises

    Format the whole thing in a neat structured way with lines if required.
    """


    try:
        model = genai.GenerativeModel("gemini-pro")
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception as e:
        return f"Error: {str(e)}"

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python study_plan.py <subject> <days> <hours>")
        sys.exit(1)

    subject = sys.argv[1]
    days = sys.argv[2]
    hours = sys.argv[3]

    print(generate_study_plan(subject, days, hours))