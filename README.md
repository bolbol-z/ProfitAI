# Startup Profit Predictor

A machine learning model to predict startup profits based on R&D, administration, and marketing spending.

## Tech Stack
- **Backend**: FastAPI + scikit-learn
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **ML Model**: Linear Regression with ColumnTransformer
- **Data**: 50 Startups dataset

## Features
- 🤖 ML model trained on startup financial data
- 🚀 FastAPI backend with automatic API documentation
- ⚛️ React frontend with modern UI
- 📊 Real-time profit predictions
- 🔄 CORS enabled for seamless frontend-backend communication

## Quick Start

### Backend Setup
```bash
pip install -r requirements.txt
python app.py
```
Backend runs at `http://localhost:8000`

### Frontend Setup
```bash
cd clever-forecast-main
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`

## API Documentation
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Endpoints
- `GET /health` - Health check
- `POST /predict` - Get profit prediction
  ```json
  {
    "rd_spend": 165349.2,
    "administration": 136897.8,
    "marketing_spend": 471784.1,
    "state": "California"
  }
  ```

## Project Structure
```
├── app.py                 # FastAPI backend
├── 50_Startups.ipynb     # Model training notebook
├── 50_Startups.csv       # Training dataset
├── requirements.txt       # Python dependencies
├── startup_model.pkl     # Trained model
├── encoder.pkl           # Feature encoder
└── clever-forecast-main/ # React frontend
```

## License
MIT
