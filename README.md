# hi-brain-viewer

[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new?repository-url=https://github.com/Kishore02005/hi-brain-viewer)

# HI-Labs 3D Brain Viewer — Segmented

This project attempts to include a segmented GLB representing HI Labs regions with Artistic Spiritual Aura styling.

## Quick start
1. Unzip the package
2. `cd hi-brain-viewer-segmented`
3. `npm install`
4. `npm run dev`

Open http://localhost:5173

The GLB should be at `public/models/brain_HILabs.glb` and ideally contains these named meshes:
[
  "Stillness_Prefrontal",
  "Stillness_Cingulate",
  "Echoes_Temporal",
  "Echoes_AuditoryCortex",
  "Motor_Primary",
  "Cerebellum",
  "Brainstem"
]

If automatic GLB creation failed in this environment, the `public/models/` folder will contain instructions instead.

## Deploy to GitHub & Vercel (quick)
1. Create a new repo on GitHub named `hi-brain-viewer` or use the commands below to create & push:
```bash
git init
git add .
git commit -m "Initial commit: HI Labs Brain Viewer"
git branch -M main
git remote add origin https://github.com/Kishore02005/hi-brain-viewer.git
git push -u origin main
```
2. Go to the Vercel Deploy button above, choose the GitHub repo, and deploy. Vercel will build from `package.json` and serve `dist/` as a static site.
