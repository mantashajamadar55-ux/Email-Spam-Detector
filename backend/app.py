
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import re

app = Flask(__name__)
CORS(app)

# Load trained model
model = joblib.load("spam_detection_model.pkl")
print("Model loaded successfully!")

# Load original dataset to get the exact feature columns
initial_df = pd.read_csv("emails.csv")
FEATURE_COLUMNS = initial_df.drop(
    columns=["Email No.", "Prediction"]
).columns


def transform_email_to_features(email_text):
    """
    Convert an email message into the same word-count
    feature format used during model training.
    """

    email_word_counts = {col: 0 for col in FEATURE_COLUMNS}

    words = re.findall(r"\b\w+\b", email_text.lower())

    for word in words:
        if word in email_word_counts:
            email_word_counts[word] += 1

    return pd.DataFrame(
        [email_word_counts],
        columns=FEATURE_COLUMNS
    )


@app.route("/")
def home():
    return "Email Spam Detector Backend is Running!"


@app.route("/predict", methods=["POST"])
def predict():

    data = request.get_json()

    if not data or "message" not in data:
        return jsonify({
            "error": "No email message provided"
        }), 400

    message = data["message"]

    if not message.strip():
        return jsonify({
            "error": "Email message cannot be empty"
        }), 400

    # Convert email into model features
    email_features = transform_email_to_features(message)

    # Make prediction
    prediction = model.predict(email_features)[0]

    # Get prediction probability
    probability = model.predict_proba(email_features)[0]

    if prediction == 1:
        result = "Spam"
        confidence = probability[1] * 100
    else:
        result = "Not Spam"
        confidence = probability[0] * 100

    return jsonify({
        "prediction": result,
        "confidence": round(confidence, 2),
        "message_received": message
    })


if __name__ == "__main__":
    app.run(debug=True)

