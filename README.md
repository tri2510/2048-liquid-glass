# 2048 Liquid Glass

A modern implementation of the classic 2048 game with a stunning liquid glass morphism design.

## Features

- Beautiful glass morphism UI with animated liquid effects
- Smooth tile animations
- Touch/swipe support for mobile devices
- Score tracking with local storage
- Fully responsive design

## Demo

Play the game by opening `index.html` in your web browser.

## Local Development

### Option 1: Using Node.js
```bash
npm install
npm start
```
Then open http://localhost:3000 in your browser.

### Option 2: Using Python
```bash
npm run dev
```
Then open http://localhost:8000 in your browser.

### Option 3: Using npx serve
```bash
npx serve .
```

## Deployment

### Deploy to Netlify

1. **Via Drag & Drop:**
   - Visit [Netlify Drop](https://app.netlify.com/drop)
   - Drag the project folder into the browser window
   - Your site will be live instantly!

2. **Via Git:**
   - Push your code to GitHub
   - Connect your GitHub repo to Netlify
   - Netlify will automatically deploy your site

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

### Deploy to GitHub Pages

1. Create a new repository on GitHub
2. Push your code to the repository
3. Go to Settings > Pages
4. Select "Deploy from a branch"
5. Choose main branch and / (root) folder
6. Your site will be available at `https://[username].github.io/[repository-name]`

### Deploy to Surge.sh

1. Install Surge:
```bash
npm install -g surge
```

2. Deploy:
```bash
surge
```

### Deploy to Firebase Hosting

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Initialize and deploy:
```bash
firebase init hosting
firebase deploy
```

## Game Controls

- **Desktop:** Use arrow keys (↑, ↓, ←, →) to move tiles
- **Mobile:** Swipe in any direction to move tiles
- **New Game:** Click the "New Game" button to start over

## How to Play

1. Use arrow keys or swipe to move tiles
2. When two tiles with the same number touch, they merge into one
3. Try to create a tile with the number 2048
4. The game ends when you can't make any more moves

## Technologies Used

- HTML5
- CSS3 (with Glass Morphism effects)
- Vanilla JavaScript
- Local Storage for score persistence

## License

MIT License