# TopicFlow — Project Topic Allocation System

TopicFlow is a modern, role-based project-topic allocation system for students, supervisors, and departmental administrators.

## ⚡ Serverless & High-Performance Architecture
TopicFlow has been migrated to a **100% client-side serverless architecture** utilizing a robust browser-based `localStorage` database layer.
- **Vercel Ready:** The entire app runs flawlessly as a static web application.
- **Zero-Config Database:** No MySQL database or standalone Node server is required to host or test the application. All CRUD operations (adding topics, student proposals, supervisor allocations, scoring, and registration) are fully persisted within the browser's local storage.
- **100% Uptime & No Database Overhead:** This makes hosting on platforms like Vercel **extremely efficient**, with zero server cost, zero database downtime, and no serverless cold starts.

---

## 🚀 Run Locally

### Option A: Open Directly in Your Browser (No Setup Required)
Simply double-click the `index.html` file or drag-and-drop it into any web browser. It will boot up immediately, pre-seed all demo accounts and topics, and run perfectly with full database persistence.

### Option B: Using a Simple Local Static Server
If you want to run it via a local URL:
```bash
# Run using npx
npx serve .
```
Then open `http://localhost:3000` in your web browser.

### Option C: Standalone Node/Express Server (Legacy Node/MySQL Support)
If you prefer running a backend server with MySQL, make sure MySQL is running, copy `.env.example` to `.env`, and execute:
```bash
npm install
node server.js
```
Then visit `http://localhost:8000/index.html`.

---

## ☁️ Deploying to Vercel (Highly Efficient)
Yes, you can **efficiently and beautifully host TopicFlow on Vercel**! Since the application is static, hosting is completely free, lightning-fast, and guarantees 100% uptime.

### How to Deploy to Vercel in 2 Minutes:
1. Push this codebase to your own GitHub repository.
2. Go to the [Vercel Dashboard](https://vercel.com/) and click **Add New > Project**.
3. Import your GitHub repository.
4. Keep all build and output settings as default (**no build step is needed**).
5. Click **Deploy**.

Vercel will build and distribute your static files across their global Edge network. Every visitor to your Vercel URL gets a highly responsive interface with their own persistent session.

---

## 🔑 Demo Accounts & Pre-Seeding
To facilitate immediate testing, TopicFlow **automatically pre-seeds** the database with 12 realistic topics and demo accounts on the first visit.

All pre-seeded demo accounts use the password **`Pius-1234`**:

| Role | Email | Name | Details / Area |
| --- | --- | --- | --- |
| **Administrator** | `piusutana121@gmail.com` | Pius Tana | Full admin portal, supervisor deletion & custom student allocation modal |
| **Supervisor** | `adaeze@topicflow.test` | Dr. Adaeze Okafor | Topic catalog, supervisor metrics, proposal reviews, and topic scoring |
| **Student** | `chiamaka@topicflow.test` | Chiamaka Bello | Proposal creation form (visible to students only) and draft saving |

---

## ✨ Features Included

- **Topic Catalog:** Full-text searching, category filter, and similarity-based duplicate warnings.
- **Student Topic Requests:** Role-restricted proposal creation form (pre-fills student details and saves drafts).
- **Custom Topic Allocation Modal:** Supervisors and administrators can click "Allocate", select an unallocated student from a dropdown, and confirm the allocation.
- **Supervisor Capacity Enforcement:** Real-time capacity bar (e.g., 6 student limit) and workload indicators.
- **Supervisor Deletion:** Admin can delete a supervisor; their topics are automatically unassigned and their allocations are cleared with persistent integrity.
- **Interactive Reports Dashboard:** Visual overview of allocation summary, topic availability, and supervisor workloads inside the application.
