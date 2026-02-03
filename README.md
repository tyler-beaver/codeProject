# codeProject

Creating simple project components to test skills
codeProject504$ database password

link job postings to account, host on github

## Hosting

1) Host the code on GitHub
- Initialize and push:
  ```
  git init
  git branch -M main
  git add .
  git commit -m "Initial commit"
  git remote add origin https://github.com/<username>/<repo>.git
  git push -u origin main
  ```

2) Environment variables (Supabase)
- Create `frontend/.env.local` (don’t commit):
  - Vite:
    ```
    VITE_SUPABASE_URL=your-url
    VITE_SUPABASE_ANON_KEY=your-anon-key
    ```
  - CRA:
    ```
    REACT_APP_SUPABASE_URL=your-url
    REACT_APP_SUPABASE_ANON_KEY=your-anon-key
    ```
- Add to `.gitignore`: `.env`, `.env.local`.

3) Deploy the frontend
- Vercel:
  - Import GitHub repo → Framework: React.
  - Build command: `npm run build`.
  - Output directory: `dist` (Vite) or `build` (CRA).
  - Add env vars → Deploy.
- Netlify:
  - New site from Git → pick repo.
  - Build: `npm run build`.
  - Publish dir: `dist` (Vite) or `build` (CRA).
  - Add env vars → Deploy.
- GitHub Pages (quick static hosting):
  - CRA: `npm i -D gh-pages`, add `"homepage"` and `"deploy"` scripts in `package.json`, then `npm run deploy`.
  - Vite: `npm i -D gh-pages`, add `"deploy": "npm run build && npx gh-pages -d dist"`, then `npm run deploy`.


