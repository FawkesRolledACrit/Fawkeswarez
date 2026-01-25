# 🎮 Y2K Game Dev Portfolio 🎮

An early 2000's styled interactive website showcasing game development progress with Google Drive integration and free hosting setup.

## ✨ Features

### 🎨 Y2K Aesthetic Design
- **Glitch text effects** with animated rainbow colors
- **Neon color scheme** (magenta, cyan, yellow, green)
- **Pixel fonts** (Press Start 2P, VT323)
- **Matrix-style animated backgrounds**
- **Blinking elements and marquee text**
- **Custom Y2K styled buttons and cards**
- **Retro progress bars and statistics**

### 🎮 Game Showcase
- **Interactive game cards** with hover effects
- **Detailed game information modals**
- **Development progress tracking**
- **Platform compatibility display**
- **Feature lists and release dates**
- **Development log with timestamps**

### 💾 Google Drive Integration
- **Multiple drive connection support**
- **Real file statistics and storage info**
- **OAuth 2.0 secure authentication**
- **Cross-account drive management**
- **Automatic token refresh**
- **Drive disconnection functionality**

### 🚀 Interactive Features
- **Keyboard navigation** (1-5 keys, arrow keys)
- **Mouse trail effects**
- **Hit counter animation**
- **Sound effect placeholders**
- **Notification system**
- **Konami code easter egg**
- **Local data persistence**
- **Responsive design**

## 🛠️ Setup Instructions

### Quick Start
1. Clone or download this repository
2. Open `index.html` in your browser
3. Enjoy the Y2K experience!

### Google Drive Setup
1. Open `google-drive-config.html` for detailed setup
2. Create Google Cloud Project
3. Enable Drive API and Picker API
4. Configure OAuth 2.0 credentials
5. Update configuration with your Client ID

### Free Hosting Setup

#### Option 1: GitHub Pages (Recommended)
1. Create a new GitHub repository
2. Upload all files to the repository
3. Go to Settings → Pages
4. Select "Deploy from a branch"
5. Choose main branch and save
6. Your site will be live at `https://username.github.io/repository-name`

#### Option 2: Netlify
1. Sign up for Netlify account
2. Drag and drop the project folder
3. Site will be automatically deployed
4. Get a free `netlify.app` domain

#### Option 3: Vercel
1. Sign up for Vercel account
2. Import project from GitHub
3. Automatic deployment on every push
4. Free `vercel.app` domain

#### Option 4: Firebase Hosting
1. Create Firebase project
2. Install Firebase CLI: `npm install -g firebase-tools`
3. Run: `firebase init hosting`
4. Deploy: `firebase deploy`

## 📁 File Structure

```
windsurf-project/
├── index.html              # Main portfolio page
├── style.css               # Y2K styling and animations
├── script.js               # Interactive features and logic
├── google-drive-config.html # Google Drive setup guide
├── README.md               # This file
└── config.js               # Google Drive configuration (to be created)
```

## 🔧 Configuration

### Google Drive API
Create `config.js` with your credentials:

```javascript
const GOOGLE_DRIVE_CONFIG = {
    clientId: 'YOUR_CLIENT_ID_HERE',
    clientSecret: 'YOUR_CLIENT_SECRET_HERE',
    scopes: [
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/drive.metadata.readonly'
    ],
    redirectUri: window.location.origin + '/auth/callback'
};
```

### Customization
- **Game data**: Edit `gameData` object in `script.js`
- **Colors**: Modify CSS variables in `style.css`
- **Text content**: Update HTML text content
- **Animations**: Adjust CSS keyframes

## 🎮 Keyboard Shortcuts

- **1-5**: Navigate to sections (Home, Games, Progress, Storage, About)
- **←/→ Arrow keys**: Navigate between sections
- **ESC**: Close modal dialogs
- **Konami Code**: ↑↑↓↓←→←→BA for rainbow mode

## 🌐 Browser Compatibility

- ✅ Chrome/Chromium (Recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ Internet Explorer (Limited support - as expected for Y2K theme!)

## 📱 Responsive Design

The website adapts to different screen sizes:
- **Desktop**: Full Y2K experience
- **Tablet**: Adjusted layout and navigation
- **Mobile**: Simplified interface with touch support

## 🔒 Security Notes

- **Never expose Client Secret in production**
- **Use backend server for token exchange**
- **Implement rate limiting**
- **Secure token storage**
- **HTTPS required for OAuth**

## 🎨 Design Elements

### Color Palette
- **Primary**: #FF00FF (Magenta)
- **Secondary**: #00FFFF (Cyan)
- **Accent**: #FFFF00 (Yellow)
- **Text**: #0F0 (Green)
- **Background**: #000 (Black)

### Typography
- **Headings**: Press Start 2P (Pixel font)
- **Body**: VT323 (Monospace)
- **Code**: Courier New

### Animations
- **Glitch effects** on main title
- **Matrix scrolling** background
- **Twinkling stars** overlay
- **Progress bar shine** effects
- **Card hover** animations
- **Button scale** effects

## 🚀 Performance

- **Optimized animations** using CSS transforms
- **Lazy loading** for images
- **Efficient JavaScript** with event delegation
- **Local storage** for data persistence
- **Minimal external dependencies**

## 🐛 Troubleshooting

### Common Issues
1. **Google Drive not connecting**: Check API credentials and redirect URI
2. **Animations not working**: Ensure CSS is loaded properly
3. **Local storage issues**: Check browser permissions
4. **Mobile layout broken**: Test with different viewport sizes

### Debug Mode
Open browser console to see:
- Initialization messages
- Error logs
- Debug information
- Performance metrics

## 🎯 Future Enhancements

- [ ] Add actual game demos
- [ ] Implement file upload to Drive
- [ ] Add more easter eggs
- [ ] Create admin panel
- [ ] Add multiplayer features
- [ ] Implement dark/light mode toggle
- [ ] Add sound effects library
- [ ] Create custom cursor themes

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📧 Contact

- **Portfolio**: Visit the live website
- **Issues**: Report bugs via GitHub Issues
- **Features**: Request new features via Discussions

---

**🎮 Made with passion for retro gaming and web development! 🎮**

*Best viewed in 1024x768 resolution with Internet Explorer 6+ (just kidding!)*
