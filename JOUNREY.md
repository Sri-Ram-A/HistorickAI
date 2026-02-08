{
  "username": "SriRam.A",
  "password": "SriRam.A@369"
}
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzcwMTI0OTA1LCJpYXQiOjE3NzAxMjEzMDUsImp0aSI6ImZjZGM5N2U1OWNlNjQ3Y2RhZmI1M2ExNzJiMWQyYjI5IiwidXNlcl9pZCI6IjEifQ.WH22ZvJmeChGJHRNJDyCcgdvXnu8zty3yvKjwUFfKTo
[$ docker run --name historickAI-postgres -e POSTGRES_PASSWORD=SriRam.A@369 -d postgres](https://medium.com/@adarsh.ajay/setting-up-postgresql-with-pgvector-in-docker-a-step-by-step-guide-d4203f6456bd)

docker pull ankane/pgvector

docker run -e POSTGRES_USER=Sriram.A \
           -e POSTGRES_PASSWORD=Sriram.A@369 \
           -e POSTGRES_DB=mydatabase \
           --name vector_postgres \
           -p 5432:5432 \
           -d ankane/pgvector

docker run -e POSTGRES_USER=Sriram.A -e POSTGRES_PASSWORD=Sriram.A@369 -e POSTGRES_DB=mydatabase --name vector_postgres -p 5432:5432 -d ankane/pgvector

- Connect with Django
https://testdriven.io/blog/dockerizing-django-with-postgres-gunicorn-and-nginx/

- test if connection to docker container
```bash
docker exec -it vector_postgres psql -h localhost -U Sriram.A -d mydatabase
```
```java
psql (15.4 (Debian 15.4-2.pgdg120+1))
Type "help" for help.
mydatabase=#
```
python manage.py makemigrations [app_name] --name [migration_name] --empty
python manage.py makemigrations folders --name IntroTovectorDb --empty

https://medium.com/@simeon.emanuilov/integrating-a-vector-database-into-django-using-pgvector-72322b9debbe
https://pypi.org/project/pgvector/
CREATE EXTENSION vector;
You should see:
    CREATE EXTENSION

- https://tldraw.dev/releases/v2.0.0