FROM python:3.11

WORKDIR /app
COPY . /app
RUN pip install Flask PyJWT

EXPOSE 5000
ENV NAME World

CMD ["python", "user_service.py"]
