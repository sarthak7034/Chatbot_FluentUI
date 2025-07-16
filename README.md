# Fluent UI Chatbot

A modern, responsive chatbot built with React, Vite, Fluent UI, and Tailwind CSS. Features a clean interface with simulated WebSocket communication and intelligent mock responses.

## 🚀 Features

- **Modern UI/UX**: Built with Microsoft's Fluent UI design system
- **Responsive Design**: Tailwind CSS for mobile-first responsive layout
- **Real-time Chat Simulation**: Mock WebSocket implementation with typing indicators
- **Smart Responses**: Context-aware bot responses based on keyword matching
- **SCSS Styling**: Custom styles with CSS variables for easy theming
- **TypeScript**: Full type safety throughout the application
- **Fast Development**: Vite for lightning-fast hot module replacement

## 🛠️ Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | Frontend framework | ^18.2.0 |
| **TypeScript** | Type safety | ^5.2.2 |
| **Vite** | Build tool & dev server | ^5.0.8 |
| **Fluent UI** | Component library | ^9.47.0 |
| **Tailwind CSS** | Utility-first CSS | ^3.3.6 |
| **SCSS** | CSS preprocessor | ^1.69.5 |
| **Socket.IO Client** | WebSocket simulation | ^4.7.4 |

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Quick Start

```bash
# Clone the repository
git clone <your-repo-url>
cd fluent-chatbot

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── Chatbot.tsx      # Main chat interface
│   ├── Chatbot.scss     # Chat component styles
│   ├── MessageList.tsx  # Message rendering component
│   └── MessageList.scss # Message list styles
├── hooks/               # Custom React hooks
│   └── useSocket.ts     # WebSocket simulation hook
├── types/               # TypeScript type definitions
│   └── chat.ts          # Chat-related types
├── data/                # Mock data and configurations
│   └── mockData.ts      # Bot response templates
├── styles/              # Global styles
│   ├── index.scss       # Main stylesheet
│   ├── App.scss         # App component styles
│   └── variables.scss   # SCSS variables
├── App.tsx              # Root component
└── main.tsx             # Application entry point
```

## 🎨 Customization

### Theming

Modify colors and spacing in `src/styles/variables.scss`:

```scss
// Fluent UI Colors
$fluent-bg: #faf9f8;
$fluent-surface: #ffffff;
$fluent-primary: #0078d4;
$fluent-secondary: #605e5c;

// Chat specific colors
$user-message-bg: #0078d4;
$bot-message-bg: #f3f2f1;
$message-border-radius: 18px;
```

### Bot Responses

Add or modify bot responses in `src/data/mockData.ts`:

```typescript
export const mockResponses: Record<string, string[]> = {
  'greeting,hello,hi': [
    'Hello! How can I help you today?',
    'Hi there! What can I do for you?'
  ],
  'custom-keyword': [
    'Your custom response here'
  ]
}
```

### Styling with Tailwind

The project uses Tailwind CSS for utility classes. Customize the theme in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      'custom-primary': '#your-color',
      'custom-secondary': '#your-color'
    }
  }
}
```

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Adding New Features

1. **New Components**: Add to `src/components/`
2. **Custom Hooks**: Add to `src/hooks/`
3. **Types**: Define in `src/types/`
4. **Styles**: Add SCSS files alongside components

### WebSocket Integration

To replace mock data with real WebSocket:

1. Replace the mock implementation in `src/hooks/useSocket.ts`
2. Install socket.io-client (already included)
3. Connect to your WebSocket server:

```typescript
import io from 'socket.io-client'

const socket = io('your-websocket-url')

socket.on('message', (data) => {
  onMessage(data)
})
```

## 📱 Responsive Design

The chatbot is fully responsive with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 🎯 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🚀 Deployment

### Vercel
```bash
npm run build
# Deploy dist/ folder to Vercel
```

### Netlify
```bash
npm run build
# Deploy dist/ folder to Netlify
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for all new files
- Follow existing naming conventions
- Add proper type definitions
- Include SCSS files for component styles
- Write meaningful commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Troubleshooting

### Common Issues

**Build fails with SCSS errors:**
```bash
npm install sass --save-dev
```

**Tailwind styles not applying:**
- Check `tailwind.config.js` content paths
- Ensure `@import` statements are in correct order

**TypeScript errors:**
- Run `npm run lint` to check for issues
- Ensure all imports have proper type definitions

### Performance Tips

- Use React.memo() for expensive components
- Implement virtual scrolling for large message lists
- Optimize images and assets
- Use code splitting for larger applications

## 📞 Support

- Create an issue for bugs or feature requests
- Check existing issues before creating new ones
- Provide detailed reproduction steps

## 🙏 Acknowledgments

- [Fluent UI](https://react.fluentui.dev/) for the component library
- [Tailwind CSS](https://tailwindcss.com/) for utility classes
- [Vite](https://vitejs.dev/) for the build tool
- [React](https://reactjs.org/) for the framework

---

**Happy coding! 🎉**