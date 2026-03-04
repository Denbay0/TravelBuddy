<!-- Anime-style GitHub header -->
<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=220&text=TravelBuddy&fontAlign=50&fontAlignY=38&desc=Our%20time%2C%20our%20days.&descAlign=50&descAlignY=58&animation=twinkling&color=gradient" />
</p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&pause=800&center=true&vCenter=true&width=650&lines=Route+planning+%2B+travel+social+feed;Create+routes+%E2%86%92+share+posts+%E2%86%92+discover+places;FastAPI+%C2%B7+React+%C2%B7+PostgreSQL+%C2%B7+PDF+reports" alt="Typing SVG" />
</p>

<p align="center">
  <img src="assets/lain.png" alt="Serial Experiments Lain" width="900"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/backend-FastAPI-009688" />
  <img src="https://img.shields.io/badge/frontend-React-61DAFB" />
  <img src="https://img.shields.io/badge/language-TypeScript-3178C6" />
  <img src="https://img.shields.io/badge/database-PostgreSQL-336791" />
  <img src="https://img.shields.io/badge/style-TailwindCSS-38BDF8" />
  <img src="https://img.shields.io/badge/maps-Leaflet-199900" />
  <img src="https://img.shields.io/badge/reports-PDF-111111" />
</p>

---

## About

**TravelBuddy** is a full-stack web app for travelers that combines **route planning** and a **social feed**.  
Create routes, write travel posts, save favorites, search across content, and export routes as **PDF**.

---

## Features

- **Routes**: create/edit routes, cities list, duration & transport, trending, favorites  
- **Posts**: publish stories, likes, saves, comments  
- **Profiles**: bio + avatar, personal posts, saved routes  
- **Search**: global search across routes / posts / users  
- **PDF Reports**: generate route PDFs for sharing or offline use  

---

## Tech Stack

**Backend**
- FastAPI, SQLAlchemy
- PostgreSQL
- JWT (cookie-based) + CSRF protection
- ReportLab (PDF)

**Frontend**
- React + TypeScript + Vite
- TailwindCSS
- React Router
- Framer Motion
- Leaflet / React-Leaflet

---

## Project Structure

```text
backend/
  app/
    models/
    routes/
    schemas/
    services/

frontend/
  src/
    components/
    pages/
    context/
    api/

assets/
  lain.png