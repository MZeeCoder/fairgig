FROM mcr.microsoft.com/playwright/python:v1.42.0-jammy

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

WORKDIR /code

# Install dependencies
COPY requirements.txt /code/
RUN pip install --no-cache-dir -r requirements.txt

# Ensure playwright browsers are installed and system dependencies are up to date
RUN playwright install chromium

# Copy the rest of the application
COPY . /code/

# Command to run the application
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT}
