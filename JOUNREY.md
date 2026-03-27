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
https://mermaid.js.org/intro/
https://www.npmjs.com/package/@lightenna/react-mermaid-diagram
# Now going to create session

 - Will use this later maybe : https://medium.com/@MatDrinksTea/rendering-markdown-and-latex-in-react-dec355e74119


 - pip install requests beautifulsoup4
- https://github.com/unclecode/crawl4ai



You are already inside psql:
mydatabase=#
Now do the following.
Step 1 — Enable the vector extension
Inside psql, run:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```
If successful, you should see:
```sql
CREATE EXTENSION
```
Step 2 — Verify it exists
Run:
```bash
\dx
```
You should see something like:
vector | x.x.x | public | vector data type and ivfflat index
If you see it listed, PostgreSQL now recognizes the vector type.
Step 3 — Exit psql
\q
Step 4 — Run Django migrations again
Back in your Django project:
```bash
python manage.py migrate
```
The error type "vector" does not exist should now disappear.