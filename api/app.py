from flask import Flask, request, jsonify,send_from_directory
from flask_cors import CORS
import create
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes and origins

@app.route('/api/videos/<filename>')
def serve_video(filename):
    return send_from_directory('./videos', filename)

@app.route('/api/chat', methods=['POST'])
def chat():
    # Extract user message from the request
    data = request.json
    user_message = data.get('message', '')
    if not user_message:
        return jsonify({'error': 'Message content is empty'}), 400

    try:
        if "generate video" in user_message.lower():
            script=create.generate_video(user_message)
            # path="./videos/allah.mp4"
            # response = {'response': path,'script':"My name is miakumari i am going to kanyakumari na poren kudra savaari"}
            response = {'response': "final_video.mp4",'script':script}
        elif "generate timeline" in user_message.lower():
                html=create.generate_timeline(user_message)
                response = {'response': html}
        # else:
        #     script = generate_narration(user_message)
        #     print(script)
        #     response = {'response': script}

        print("Returned successfully")
        return jsonify(response), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/generate-quiz', methods=['POST'])
def generate_quiz_page():
    data = request.get_json()
    topic = data.get("topic", "").strip()
    if not topic:
        return jsonify({"error": "Topic is required"}), 400
    questions = create.generate_quiz(topic)
    return jsonify(questions)

@app.route('/generate-timeline', methods=['POST'])
def generate_timeline_page():
    data = request.json
    user_message = data.get('message', '')
    if not user_message:
        return jsonify({'error': 'Message content is empty'}), 400
    try:
        html=create.generate_timeline(user_message)
        response = {'response': html}
        print("Returned successfully")
        return jsonify(response), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)
