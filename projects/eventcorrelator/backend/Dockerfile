FROM python:3.12-slim

# Install SSH client for remote host monitoring
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssh-client \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY app/ ./app/

# Configure SSH for easy remote access
RUN mkdir -p /root/.ssh && \
    printf "Host *\n    StrictHostKeyChecking no\n    UserKnownHostsFile /dev/null\n    LogLevel ERROR\n" > /root/.ssh/config && \
    chmod 600 /root/.ssh/config

# Create keys directory
RUN mkdir -p /app/keys

# Expose port
EXPOSE 8000

# Run with uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
