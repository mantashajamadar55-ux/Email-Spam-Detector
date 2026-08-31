# 📧 Email Spam Detector

An AI/ML-based web application that detects whether an email message is **Spam** or **Not Spam**.

The project combines a **Machine Learning model**, **Flask backend**, and **React frontend** to provide a simple interface for spam email detection.

## 🚀 Features

* 📩 Enter an email message
* 🤖 Predict whether the message is Spam or Not Spam
* 📊 Display prediction confidence
* ⚡ React-based user interface
* 🔗 Flask REST API for prediction
* 🧠 Multinomial Naive Bayes machine learning model
* 🔄 Frontend and backend communication using HTTP requests

## 🛠️ Technologies Used

### Machine Learning

* Python
* Pandas
* NumPy
* Scikit-learn
* Multinomial Naive Bayes
* Joblib

### Backend

* Flask
* Flask-CORS
* Python

### Frontend

* React
* Vite
* JavaScript
* CSS

### Development Tools

* Git
* GitHub
* Visual Studio Code

## 🧠 Machine Learning Model

The project uses a **Multinomial Naive Bayes** classifier for spam detection.

The model was trained using the email dataset and learns patterns from the words/features present in emails.

The trained model is saved as:

```text
spam_detection_model.pkl
```

## 📁 Project Structure

```text
Email-Spam-Detector/
│
├── backend/
│   ├── app.py
│   ├── emails.csv
│   ├── spam_detection_model.pkl
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── .gitignore
```

## ⚙️ How to Run the Project

### 1. Clone the Repository

```bash
git clone https://github.com/mantashajamadar55-ux/Email-Spam-Detector.git
```

Move into the project folder:

```bash
cd Email-Spam-Detector
```

---

## 🔧 Backend Setup

Open a terminal and navigate to the backend:

```bash
cd backend
```

Install the required Python packages:

```bash
python -m pip install -r requirements.txt
```

Start the Flask server:

```bash
python app.py
```

The backend will run at:

```text
http://127.0.0.1:5000
```

---

## 💻 Frontend Setup

Open another terminal.

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm run dev
```

The frontend will be available at:

```text
http://localhost:5173
```

## 🔄 How It Works

```text
User enters email
        ↓
React Frontend
        ↓
POST request to Flask API
        ↓
Machine Learning Model
        ↓
Spam / Not Spam prediction
        ↓
Confidence returned
        ↓
Result displayed to user
```

## 🔌 API Endpoint

### POST `/predict`

The frontend sends the email message to the Flask backend.

Example request:

```json
{
  "message": "Congratulations! You have won a free prize!"
}
```

Example response:

```json
{
  "prediction": "Spam",
  "confidence": 69.6,
  "message_received": "Congratulations! You have won a free prize!"
}
```

## 📸 Screenshots

Screenshots of the application can be added here.

Example:

```text
Frontend Interface
[Add screenshot here]
```

```text
Spam Detection Result
[Add screenshot here]
```

## 🔮 Future Improvements

* Improve model accuracy
* Add additional machine learning algorithms
* Improve UI/UX design
* Add email history
* Add model performance visualizations
* Deploy the application online
* Add user authentication
* Improve handling of different types of email text

## 👩‍💻 Author

**Mantasha Jamadar**

Engineering student specializing in Artificial Intelligence and Data Science.

GitHub:
https://github.com/mantashajamadar55-ux

## ⭐ Project

If you find this project useful, consider giving the repository a ⭐ on GitHub.
