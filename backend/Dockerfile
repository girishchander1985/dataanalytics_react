# Use an official Python image
FROM python:3.9-slim

# Set the working directory
WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY src/ /app/

# Expose the port the app will run on
EXPOSE 5000

# Command to run the application
CMD ["flask", "run", "--host=0.0.0.0"]