# caption_backend/Dockerfile
FROM python:3.11-slim

# set working directory
WORKDIR /app

# copy only requirements, then install
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# copy the rest of the backend code
COPY . /app/

# expose Django port
EXPOSE 8000

# run Django on 0.0.0.0 so it's accessible outside the container
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
