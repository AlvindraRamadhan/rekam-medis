# Smart Clinic — Rekam Medis Elektronik (RME)

> **Status: Masih dalam tahap pengembangan aktif** 🚧

Sistem Rekam Medis Elektronik (RME) untuk Smart Clinic. Proyek ini terdiri dari dua bagian utama: **frontend** dan **backend**.

---

## Struktur Proyek

```
rekam-medis/
├── frontend/       # Aplikasi web (Next.js)
└── backend/        # API Server (belum dikembangkan)
```

---

## Frontend

Dibangun menggunakan teknologi modern:

| Teknologi | Keterangan |
|-----------|------------|
| [Next.js 15](https://nextjs.org/) | Framework React (App Router) |
| [TypeScript](https://www.typescriptlang.org/) | Static typing |
| [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com/) + Base UI | Komponen UI |
| [TanStack Query v5](https://tanstack.com/query) | Data fetching & caching |
| [TanStack Table v8](https://tanstack.com/table) | Tabel data |
| [Zustand](https://zustand-demo.pmnd.rs/) | State management |
| [React Hook Form](https://react-hook-form.com/) + Zod | Form & validasi |
| [Axios](https://axios-http.com/) | HTTP client |

### Menjalankan Frontend

```bash
cd frontend
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## Backend

> Backend belum mulai dikembangkan. Akan diisi setelah frontend selesai.

---

## Roadmap

- [x] Setup project & konfigurasi (Phase 0)
- [x] Halaman autentikasi — Login, Register, Forgot Password (Phase 1)
- [ ] Dashboard & modul utama RME (Phase 2+)
- [ ] Pengembangan backend API
- [ ] Integrasi frontend–backend

---

## Pengembang

**Alvindra Ramadhan** — [alvindraramadhan1210@gmail.com](mailto:alvindraramadhan1210@gmail.com)
