# BlueShield Backend - Important Commands

This file contains important commands for running, testing, and managing the BlueShield backend project.

## 🚀 **Application Commands**

### Start the Development Server
```bash
# Start with auto-reload
uvicorn app.main:app --reload

# Start on specific host and port
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Start in production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Start with Environment Variables
```bash
# Load from .env file
uvicorn app.main:app --reload --env-file .env
```

## 🗄️ **Database Commands**

### MongoDB Operations
```bash
# Start MongoDB service
mongod

# Connect to MongoDB shell
mongosh

# Connect to specific database
mongosh blueshield

# List all databases
show dbs

# Use specific database
use blueshield

# List collections
show collections

# View documents in a collection
db.users.find()
db.predictions.find()
```

### Database Seeding
```bash
# Run seed data script
python scripts/seed_data.py

# Run with specific Python path
python -m scripts.seed_data
```

## 🧪 **Testing Commands**

### Run Tests
```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run specific test file
pytest tests/test_models.py

# Run tests with coverage
pytest --cov=app

# Run tests in parallel
pytest -n auto
```

### Test Database Connection
```bash
# Test database connectivity
python test_db_connection.py
```

## 🔧 **Development Commands**

### Code Formatting
```bash
# Format code with Black
black .

# Check formatting without changes
black --check .

# Format specific file
black app/models/user.py

# Sort imports with isort
isort .

# Check import sorting
isort --check-only .
```

### Linting
```bash
# Run flake8 linter
flake8 .

# Run pylint
pylint app/

# Run mypy for type checking
mypy app/
```

## 📦 **Dependency Management**

### Virtual Environment
```bash
# Create virtual environment
python -m venv myenv

# Activate virtual environment (Windows)
myenv\Scripts\activate

# Activate virtual environment (Linux/Mac)
source myenv/bin/activate

# Deactivate virtual environment
deactivate
```

### Package Management
```bash
# Install dependencies
pip install -r requirements.txt

# Install development dependencies
pip install -r requirements-dev.txt

# Update requirements.txt
pip freeze > requirements.txt

# Install specific package
pip install fastapi

# Install package in development mode
pip install -e .
```

## 🐳 **Docker Commands** (if using Docker)

### Build and Run
```bash
# Build Docker image
docker build -t blueshield-backend .

# Run container
docker run -p 8000:8000 blueshield-backend

# Run with environment file
docker run --env-file .env -p 8000:8000 blueshield-backend

# Run in background
docker run -d -p 8000:8000 --name blueshield-api blueshield-backend
```

### Docker Compose
```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

## 🔍 **Debugging Commands**

### Logging and Monitoring
```bash
# Run with debug logging
uvicorn app.main:app --reload --log-level debug

# Check running processes
ps aux | grep uvicorn

# Check port usage
netstat -tulpn | grep :8000

# Monitor logs
tail -f logs/app.log
```

### Database Debugging
```bash
# Check MongoDB status
systemctl status mongod

# View MongoDB logs
tail -f /var/log/mongodb/mongod.log

# Connect and debug
mongosh --eval "db.runCommand({connectionStatus: 1})"
```

## 🚀 **Deployment Commands**

### Production Setup
```bash
# Install production dependencies
pip install gunicorn

# Run with Gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker

# Run with specific configuration
gunicorn app.main:app -c gunicorn.conf.py
```

### Environment Management
```bash
# Set environment variables
export MONGODB_URL="mongodb://localhost:27017"
export DATABASE_NAME="blueshield"
export SECRET_KEY="your-secret-key"

# Load from .env file
source .env
```

## 📊 **API Testing Commands**

### Using curl
```bash
# Health check
curl http://localhost:8000/health

# Get API documentation
curl http://localhost:8000/docs

# Test user registration
curl -X POST "http://localhost:8000/api/v1/auth/register" \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "username": "testuser", "password": "testpass123"}'

# Test user login
curl -X POST "http://localhost:8000/api/v1/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"username": "testuser", "password": "testpass123"}'
```

### Using httpie (if installed)
```bash
# Install httpie
pip install httpie

# Health check
http GET localhost:8000/health

# User registration
http POST localhost:8000/api/v1/auth/register email=test@example.com username=testuser password=testpass123

# User login
http POST localhost:8000/api/v1/auth/login username=testuser password=testpass123
```

## 🔄 **Git Commands**

### Basic Git Operations
```bash
# Check status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to remote
git push origin main

# Pull latest changes
git pull origin main

# Create new branch
git checkout -b feature/new-feature

# Switch branches
git checkout main
```

## 📝 **Documentation Commands**

### Generate Documentation
```bash
# Generate API docs (automatic with FastAPI)
# Visit http://localhost:8000/docs

# Generate code documentation with Sphinx (if configured)
sphinx-build -b html docs/ docs/_build/html
```

## 🧹 **Cleanup Commands**

### Clean Python Cache
```bash
# Remove __pycache__ directories
find . -type d -name "__pycache__" -exec rm -r {} +

# Remove .pyc files
find . -name "*.pyc" -delete

# Clean pip cache
pip cache purge
```

### Clean Database
```bash
# Drop all collections (MongoDB)
mongosh blueshield --eval "db.dropDatabase()"

# Remove specific collection
mongosh blueshield --eval "db.predictions.drop()"
```

---

## 📋 **Quick Reference**

| Task | Command |
|------|---------|
| Start dev server | `uvicorn app.main:app --reload` |
| Run tests | `pytest` |
| Format code | `black .` |
| Seed database | `python scripts/seed_data.py` |
| Check health | `curl http://localhost:8000/health` |
| View API docs | Open `http://localhost:8000/docs` |

---

*Last updated: $(date)*
