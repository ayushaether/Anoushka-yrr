# Shriya's Birthday 🎂

An interactive, cinematic birthday experience — 9 chapters of memories, puzzles, music, and love.  
Built with React 19 + Vite 6 + Framer Motion + Tailwind CSS v4.

---

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Deploy to GitHub Pages

### One-time setup

1. Push this project to a GitHub repository
2. Go to **Settings → Pages**
3. Under **Source**, choose **GitHub Actions**
4. Push a commit to `main` — the included workflow builds and deploys automatically

Your site will be live at `https://<your-username>.github.io/<repo-name>/`

### Manual build for any static host

```bash
# Root deployment (custom domain / Netlify / Vercel / Cloudflare Pages)
npm run build

# Sub-path deployment (GitHub Pages without custom domain)
VITE_BASE_PATH=/your-repo-name/ npm run build
```

Upload the `dist/` folder to any static host.

---

## Personalise

### Add your letter (Chapter 9 Scrapbook)

Open `src/components/chapters/Chapter9Epilogue.tsx` and find `LETTER_PARAGRAPHS` near the top.  
Replace the placeholder strings with your personal letter. Each string is a paragraph; an empty string `''` creates a blank line.

### Add photos (Chapter 9 Polaroids)

1. Put your images in `public/photos/` — name them `photo1.jpg`, `photo2.jpg`, `photo3.jpg`, `photo4.jpg`
2. In `Chapter9Epilogue.tsx` find the `ScrapbookPage` component and swap the placeholder `<div>` inside each Polaroid frame with:

```jsx
<img
  src={`${import.meta.env.BASE_URL}photos/photo${idx + 1}.jpg`}
  alt={`Memory ${idx + 1}`}
  className="w-full h-full object-cover rounded-sm"
/>
```

### Add the optional Chapter 9 piano track

Place your audio file at `public/audio/chapter9-piano.mp3`. The existing background
music will fade out automatically when Chapter 9 begins, and the piano track will
become the only music playing. The file is optional, so the site remains usable
until you add it.

### Customise the quiz / memories / apology text

All content strings live at the top of each chapter file in `src/components/chapters/`.  
No component logic needs changing — just edit the constant arrays.

---

## Tech stack

| Tool | Version |
|---|---|
| React | 19 |
| Vite | 6 |
| TypeScript | 5 |
| Framer Motion | 12 |
| Tailwind CSS | 4 |
| shadcn/ui (Radix) | various |
| Web Audio API | native |
