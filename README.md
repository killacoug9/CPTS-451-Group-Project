# CPTS-451-Group-Project
## Setup
1. Clone the Repository
```
git clone <repo-url>
cd <project-folder>
```

2. Install PostgreSQL Client
```
sudo apt update
sudo apt install postgresql-client
```
Verify installation.
```
psql --version
```
*Needs to be version 16 or higher

3.  Create a .env file to store the database connection credentials. Open .env and add the following credentials which are from Render (Check discord for details)
```
DATABASE_URL=postgresql://lab_admin:yourpassword@dpg-xxxxxx.render.com:5432/lab_book_system
```
Note: Replace yourpassword and dpg-xxxxxx.render.com with the details in the discord. Don't commit this file to GitHub. It is already in .gitignore.

4. Apply the Database Schema
```
PGPASSWORD=x psql -h dpg-xx-a.oregon-postgres.render.com -U lab_admin lab_book_system -f database/schema.sql
```
Note: PGPASSWORD and dpg-xx details are in the discord

5. Verify if tables exist
```
PGPASSWORD=x psql -h dpg-xx-a.oregon-postgres.render.com -U lab_admin lab_book_system
lab_book_systems=> \dt
```
