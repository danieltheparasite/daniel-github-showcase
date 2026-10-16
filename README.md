# Daniel Inc. — low-poly 3D GitHub desk

A three.js desk scene: a closed ASUS ROG Zephyrus laptop, an RGB mouse (Kreo Hawk), Tangzu Waner Red Lion IEMs, a toy car (drag it), a wall pipe lamp covered in sticky notes, and one book per GitHub repository.
Drag to orbit. Click the laptop and two hands open it. Click a book to open it (description inside). If the repo has a deployed website (the "Website" field on GitHub), a sticky note with the link sits on the page: click it and the hands type the address into the laptop and the site loads on its screen. The big red button changes the theme. Esc goes back.
Everything loads live from the GitHub API, so new repositories appear when you refresh.

## Run it (Windows PowerShell)
Modules need a web server, so do not double-click index.html:
```
cd daniel-inc-site
python -m http.server 8000
```
Open http://localhost:8000 (needs internet, three.js loads from the jsDelivr CDN).

## Put it online
```
git init
git add .
git commit -m "Daniel Inc. 3D site"
git branch -M main
git remote add origin https://github.com/danieltheparasite/daniel-inc-site.git
git push -u origin main
```
Then import the repo in Vercel (Framework preset: Other, no build command).

## Notes
- To show a repo's site on the CRT, set its Website field on GitHub. Sites that forbid embedding (X-Frame-Options) show blank; use the "Open site in new tab" button.
- The big red button cycles five themes (room, desk, lamp light and sticky-note color).
- Different account? Change `const U` at the top of `js/app.js`.
