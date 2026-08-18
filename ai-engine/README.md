# ActiveVista AI Engine

The ActiveVista AI Engine is a high-performance Python microservice built with FastAPI, Pydantic, and mathematical physiological models to deliver real-time recovery analytics, telemetry analysis, and dynamic 30-day periodized training plan generation.

---

## Technical Stack

* **Framework**: FastAPI (Asynchronous REST API)
* **Server**: Uvicorn
* **Data Contracts**: Pydantic v2
* **Computation Engine**: Python 3.10+ / NumPy

---

## Endpoints Specification

### 1. Health Probe
* `GET /health` — Check microservice status and runtime environment.

### 2. Physiological Analytics
* `POST /api/v1/analytics/recovery` — Calculate BMR, TDEE, neuromuscular fatigue index, hydration targets, and recommended rest hours.
* `POST /api/v1/analytics/telemetry` — Calculate power-to-weight ratio, total volume load (kg), and burnout risk.

### 3. Tactical Plan Generator
* `POST /api/v1/planner/generate` — Generate periodized 30-day tactical training schedule tailored to athlete goal and volume availability.

---

## Local Setup & Execution

### 1. Virtual Environment & Dependencies
```bash
# Create virtual environment
python -m venv venv

# Activate on Windows
venv\Scripts\activate

# Activate on macOS/Linux
source venv/bin/activate

# Install requirements
pip install -r requirements.txt
```

### 2. Launch Service
```bash
python run.py
```
* **Service URL**: `http://localhost:8000`
* **Interactive Swagger UI**: `http://localhost:8000/docs`
* **Alternative ReDoc**: `http://localhost:8000/redoc`

---

## Docker Deployment

```bash
# Build Docker image
docker build -t activevista-ai-engine .

# Run container
docker run -p 8000:8000 activevista-ai-engine
```

---

## License

Maintained by **UniCord** under the MIT License.
