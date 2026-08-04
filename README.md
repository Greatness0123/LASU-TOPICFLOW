# TopicFlow — Project Topic Allocation System

TopicFlow is a role-based project-topic allocation system for students, supervisors, and departmental administrators.

## Included features

- Secure login API with password hashing and sessions
- Role permissions for admin, supervisor, and student actions
- Topic catalogue, search-ready API, and similarity-based duplicate warning
- Student topic requests with supervisor/admin approval or rejection
- One-topic-per-student allocation, supervisor workload/capacity enforcement
- Dashboard statistics and a downloadable CSV allocation report
- Seeded demo records for immediate evaluation

## Run locally

Requires **Node.js** and **MySQL**. Copy `.env.example` to `.env` and update the database credentials if needed.

```powershell
npm install
node server.js
```

Open `http://localhost:8000/index.html` in your browser. This starts the full Node/Express backend.

If you open `index.html` directly from the file system or use a static-file server, the app will still run in a browser-only demo mode, but the backend API endpoints will be disabled.

The backend seeds 12 realistic topics and creates demo accounts. Every seed account uses password `Pius-1234`:

| Role | Email |
| --- | --- |
| Administrator | piusutana121@gmail.com |
| Supervisor | adaeze@topicflow.test |
| Student | chiamaka@topicflow.test |

## API

`POST /api?action=login`, `GET/POST ...?action=topics`, `GET/POST ...?action=requests`, `POST ...?action=review-request`, `POST ...?action=allocate`, `GET ...?action=dashboard`, and `GET ...?action=report`.

For additional deployment, keep the Node backend and MySQL configuration in `.env`.
