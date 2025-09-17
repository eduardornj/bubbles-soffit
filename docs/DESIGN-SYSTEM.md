# 🎨 Design System - Bubbles Enterprise 2025

## 🎯 Visão Geral do Design

Este documento estabelece o **Design System completo** para o website da Bubbles Enterprise 2025, baseado na identidade visual atual (azul claro e branco) e otimizado para conversão de leads em soffit e fascia em Orlando, Florida.

---

## 🌈 Paleta de Cores

### Cores Primárias (Baseadas no Site Atual)
```css
:root {
  /* Azul Bubbles - Cor principal da marca */
  --bubble-blue: #4A90E2;        /* Azul claro principal */
  --bubble-blue-light: #6BA3E8;  /* Azul claro hover */
  --bubble-blue-dark: #357ABD;   /* Azul escuro para contraste */
  --bubble-blue-50: #F0F7FF;     /* Azul muito claro para backgrounds */
  --bubble-blue-100: #E1EFFF;    /* Azul claro para seções */
  
  /* Branco e Neutros */
  --white: #FFFFFF;               /* Branco puro */
  --gray-50: #F9FAFB;            /* Cinza muito claro */
  --gray-100: #F3F4F6;           /* Cinza claro */
  --gray-200: #E5E7EB;           /* Cinza médio claro */
  --gray-300: #D1D5DB;           /* Cinza médio */
  --gray-400: #9CA3AF;           /* Cinza */
  --gray-500: #6B7280;           /* Cinza escuro */
  --gray-600: #4B5563;           /* Cinza muito escuro */
  --gray-700: #374151;           /* Quase preto */
  --gray-800: #1F2937;           /* Preto suave */
  --gray-900: #111827;           /* Preto */
}
```

### Cores Secundárias (Complementares)
```css
:root {
  /* Verde para Sucesso */
  --success-green: #10B981;      /* Verde sucesso */
  --success-green-light: #34D399; /* Verde claro */
  --success-green-dark: #059669;  /* Verde escuro */
  
  /* Laranja para Atenção */
  --warning-orange: #F59E0B;     /* Laranja atenção */
  --warning-orange-light: #FBBF24; /* Laranja claro */
  --warning-orange-dark: #D97706;  /* Laranja escuro */
  
  /* Vermelho para Erro */
  --error-red: #EF4444;          /* Vermelho erro */
  --error-red-light: #F87171;    /* Vermelho claro */
  --error-red-dark: #DC2626;     /* Vermelho escuro */
  
  /* Azul Escuro para Confiança */
  --trust-navy: #1E3A8A;         /* Azul marinho */
  --trust-navy-light: #3B82F6;   /* Azul médio */
  --trust-navy-dark: #1E40AF;    /* Azul marinho escuro */
}
```

---

## 📝 Tipografia

### Fontes Principais
```css
/* Importar Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap');

:root {
  /* Fonte Principal - Inter (Moderna e Legível) */
  --font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  /* Fonte Secundária - Poppins (Títulos e Destaques) */
  --font-secondary: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  
  /* Fonte Monospace - Para código e dados técnicos */
  --font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
}
```

### Escala Tipográfica
```css
:root {
  /* Tamanhos de Fonte - Escala Modular 1.25 (Major Third) */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  --text-4xl: 2.25rem;    /* 36px */
  --text-5xl: 3rem;       /* 48px */
  --text-6xl: 3.75rem;    /* 60px */
  --text-7xl: 4.5rem;     /* 72px */
  
  /* Pesos de Fonte */
  --font-light: 300;
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  --font-extrabold: 800;
  
  /* Altura de Linha */
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
}
```

### Classes Tipográficas
```css
/* Títulos Principais */
.heading-hero {
  font-family: var(--font-secondary);
  font-size: var(--text-6xl);
  font-weight: var(--font-extrabold);
  line-height: var(--leading-tight);
  color: var(--gray-900);
  letter-spacing: -0.025em;
}

.heading-1 {
  font-family: var(--font-secondary);
  font-size: var(--text-5xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  color: var(--gray-900);
}

.heading-2 {
  font-family: var(--font-secondary);
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-snug);
  color: var(--gray-800);
}

.heading-3 {
  font-family: var(--font-secondary);
  font-size: var(--text-3xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
  color: var(--gray-800);
}

/* Texto Corpo */
.body-large {
  font-family: var(--font-primary);
  font-size: var(--text-xl);
  font-weight: var(--font-normal);
  line-height: var(--leading-relaxed);
  color: var(--gray-700);
}

.body-normal {
  font-family: var(--font-primary);
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--gray-600);
}

.body-small {
  font-family: var(--font-primary);
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--gray-500);
}

/* Texto Especial */
.text-highlight {
  color: var(--bubble-blue);
  font-weight: var(--font-semibold);
}

.text-success {
  color: var(--success-green);
  font-weight: var(--font-medium);
}

.text-warning {
  color: var(--warning-orange);
  font-weight: var(--font-medium);
}

.text-error {
  color: var(--error-red);
  font-weight: var(--font-medium);
}
```

---

## 🔘 Componentes de Interface

### Botões
```css
/* Botão Primário - Azul Bubbles */
.btn-primary {
  background: linear-gradient(135deg, var(--bubble-blue) 0%, var(--bubble-blue-dark) 100%);
  color: var(--white);
  font-family: var(--font-primary);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 4px 6px -1px rgba(74, 144, 226, 0.2);
}

.btn-primary:hover {
  background: linear-gradient(135deg, var(--bubble-blue-light) 0%, var(--bubble-blue) 100%);
  transform: translateY(-1px);
  box-shadow: 0 8px 15px -3px rgba(74, 144, 226, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px -1px rgba(74, 144, 226, 0.2);
}

/* Botão Secundário - Outline */
.btn-secondary {
  background: transparent;
  color: var(--bubble-blue);
  font-family: var(--font-primary);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  padding: 0.75rem 1.5rem;
  border: 2px solid var(--bubble-blue);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.btn-secondary:hover {
  background: var(--bubble-blue);
  color: var(--white);
  transform: translateY(-1px);
}

/* Botão de Sucesso */
.btn-success {
  background: linear-gradient(135deg, var(--success-green) 0%, var(--success-green-dark) 100%);
  color: var(--white);
  font-family: var(--font-primary);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

/* Botão Grande - Call to Action */
.btn-cta {
  background: linear-gradient(135deg, var(--bubble-blue) 0%, var(--trust-navy) 100%);
  color: var(--white);
  font-family: var(--font-secondary);
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease-in-out;
  box-shadow: 0 8px 25px -5px rgba(74, 144, 226, 0.4);
}

.btn-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px -5px rgba(74, 144, 226, 0.5);
}
```

### Cards e Containers
```css
/* Card Base */
.card {
  background: var(--white);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Card de Serviço */
.service-card {
  background: var(--white);
  border-radius: 1rem;
  padding: 2rem;
  text-align: center;
  border: 2px solid var(--gray-100);
  transition: all 0.3s ease-in-out;
}

.service-card:hover {
  border-color: var(--bubble-blue);
  transform: translateY(-4px);
  box-shadow: 0 25px 50px -12px rgba(74, 144, 226, 0.25);
}

/* Card de Preço */
.pricing-card {
  background: linear-gradient(135deg, var(--white) 0%, var(--bubble-blue-50) 100%);
  border-radius: 1.5rem;
  padding: 2.5rem;
  text-align: center;
  border: 3px solid var(--bubble-blue-100);
  position: relative;
  overflow: hidden;
}

.pricing-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--bubble-blue) 0%, var(--trust-navy) 100%);
}

/* Container Principal */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .container {
    padding: 0 2rem;
  }
}

@media (min-width: 1024px) {
  .container {
    padding: 0 3rem;
  }
}
```

### Formulários
```css
/* Input Base */
.input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--gray-200);
  border-radius: 0.5rem;
  font-family: var(--font-primary);
  font-size: var(--text-base);
  color: var(--gray-700);
  background: var(--white);
  transition: all 0.2s ease-in-out;
}

.input:focus {
  outline: none;
  border-color: var(--bubble-blue);
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

.input::placeholder {
  color: var(--gray-400);
}

/* Label */
.label {
  display: block;
  font-family: var(--font-primary);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--gray-700);
  margin-bottom: 0.5rem;
}

/* Select */
.select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--gray-200);
  border-radius: 0.5rem;
  font-family: var(--font-primary);
  font-size: var(--text-base);
  color: var(--gray-700);
  background: var(--white);
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.select:focus {
  outline: none;
  border-color: var(--bubble-blue);
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

/* Textarea */
.textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--gray-200);
  border-radius: 0.5rem;
  font-family: var(--font-primary);
  font-size: var(--text-base);
  color: var(--gray-700);
  background: var(--white);
  resize: vertical;
  min-height: 120px;
  transition: all 0.2s ease-in-out;
}

.textarea:focus {
  outline: none;
  border-color: var(--bubble-blue);
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}
```

---

## 📐 Espaçamento e Layout

### Sistema de Espaçamento
```css
:root {
  /* Escala de Espaçamento - Base 4px */
  --space-0: 0;
  --space-1: 0.25rem;    /* 4px */
  --space-2: 0.5rem;     /* 8px */
  --space-3: 0.75rem;    /* 12px */
  --space-4: 1rem;       /* 16px */
  --space-5: 1.25rem;    /* 20px */
  --space-6: 1.5rem;     /* 24px */
  --space-8: 2rem;       /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
  --space-20: 5rem;      /* 80px */
  --space-24: 6rem;      /* 96px */
  --space-32: 8rem;      /* 128px */
}
```

### Grid System
```css
/* Grid Container */
.grid {
  display: grid;
  gap: var(--space-6);
}

.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }

/* Flexbox Utilities */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.flex-row { flex-direction: row; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.items-end { align-items: flex-end; }
.justify-center { justify-content: center; }
.justify-between { justify-content: space-between; }
.justify-around { justify-content: space-around; }

/* Responsive Grid */
@media (min-width: 640px) {
  .sm\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .sm\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@media (min-width: 768px) {
  .md\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .md\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .md\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .lg\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
```

---

## 🎭 Animações e Transições

### Animações Base
```css
/* Fade In */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

/* Slide In Left */
@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-in-left {
  animation: slideInLeft 0.5s ease-out;
}

/* Slide In Right */
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.animate-slide-in-right {
  animation: slideInRight 0.5s ease-out;
}

/* Scale In */
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scaleIn 0.4s ease-out;
}

/* Bounce */
@keyframes bounce {
  0%, 20%, 53%, 80%, 100% {
    transform: translate3d(0, 0, 0);
  }
  40%, 43% {
    transform: translate3d(0, -8px, 0);
  }
  70% {
    transform: translate3d(0, -4px, 0);
  }
  90% {
    transform: translate3d(0, -2px, 0);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}

/* Pulse */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### Transições Suaves
```css
/* Transições Base */
.transition-all {
  transition: all 0.3s ease-in-out;
}

.transition-colors {
  transition: color 0.2s ease-in-out, background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
}

.transition-transform {
  transition: transform 0.3s ease-in-out;
}

.transition-opacity {
  transition: opacity 0.2s ease-in-out;
}

/* Hover Effects */
.hover-lift:hover {
  transform: translateY(-4px);
}

.hover-scale:hover {
  transform: scale(1.05);
}

.hover-glow:hover {
  box-shadow: 0 0 20px rgba(74, 144, 226, 0.4);
}
```

---

## 📱 Design Responsivo

### Breakpoints
```css
:root {
  /* Breakpoints */
  --breakpoint-sm: 640px;   /* Mobile large */
  --breakpoint-md: 768px;   /* Tablet */
  --breakpoint-lg: 1024px;  /* Desktop */
  --breakpoint-xl: 1280px;  /* Desktop large */
  --breakpoint-2xl: 1536px; /* Desktop extra large */
}

/* Media Queries */
@media (min-width: 640px) {
  /* Mobile Large */
  .container {
    max-width: 640px;
  }
}

@media (min-width: 768px) {
  /* Tablet */
  .container {
    max-width: 768px;
  }
  
  .heading-hero {
    font-size: var(--text-7xl);
  }
}

@media (min-width: 1024px) {
  /* Desktop */
  .container {
    max-width: 1024px;
  }
}

@media (min-width: 1280px) {
  /* Desktop Large */
  .container {
    max-width: 1280px;
  }
}
```

### Utilitários Responsivos
```css
/* Visibilidade Responsiva */
.hidden { display: none; }
.block { display: block; }
.inline { display: inline; }
.inline-block { display: inline-block; }
.flex { display: flex; }
.grid { display: grid; }

/* Mobile First - Mostrar apenas em mobile */
@media (min-width: 640px) {
  .sm\:hidden { display: none; }
  .sm\:block { display: block; }
  .sm\:flex { display: flex; }
}

/* Tablet */
@media (min-width: 768px) {
  .md\:hidden { display: none; }
  .md\:block { display: block; }
  .md\:flex { display: flex; }
}

/* Desktop */
@media (min-width: 1024px) {
  .lg\:hidden { display: none; }
  .lg\:block { display: block; }
  .lg\:flex { display: flex; }
}
```

---

## 🎨 Componentes Específicos da Bubbles Enterprise

### Header/Navigation
```css
.navbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--gray-200);
  position: sticky;
  top: 0;
  z-index: 50;
  transition: all 0.3s ease-in-out;
}

.navbar-scrolled {
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.nav-link {
  font-family: var(--font-primary);
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  color: var(--gray-700);
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  transition: all 0.2s ease-in-out;
}

.nav-link:hover {
  color: var(--bubble-blue);
  background: var(--bubble-blue-50);
}

.nav-link.active {
  color: var(--bubble-blue);
  background: var(--bubble-blue-100);
  font-weight: var(--font-semibold);
}
```

### Hero Section
```css
.hero {
  background: linear-gradient(135deg, var(--bubble-blue-50) 0%, var(--white) 50%, var(--bubble-blue-50) 100%);
  padding: var(--space-20) 0;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="%234A90E2" stroke-width="0.5" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>') repeat;
  opacity: 0.3;
}

.hero-content {
  position: relative;
  z-index: 1;
}
```

### Service Cards
```css
.service-icon {
  width: 4rem;
  height: 4rem;
  background: linear-gradient(135deg, var(--bubble-blue) 0%, var(--bubble-blue-dark) 100%);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-4);
  color: var(--white);
  font-size: 1.5rem;
}

.service-title {
  font-family: var(--font-secondary);
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--gray-800);
  margin-bottom: var(--space-3);
}

.service-description {
  font-family: var(--font-primary);
  font-size: var(--text-base);
  color: var(--gray-600);
  line-height: var(--leading-relaxed);
  margin-bottom: var(--space-6);
}
```

### Calculator Widget
```css
.calculator-widget {
  background: linear-gradient(135deg, var(--white) 0%, var(--bubble-blue-50) 100%);
  border-radius: 1.5rem;
  padding: var(--space-8);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 2px solid var(--bubble-blue-100);
}

.calculator-result {
  background: linear-gradient(135deg, var(--bubble-blue) 0%, var(--trust-navy) 100%);
  color: var(--white);
  padding: var(--space-6);
  border-radius: 1rem;
  text-align: center;
}

.price-display {
  font-family: var(--font-secondary);
  font-size: var(--text-4xl);
  font-weight: var(--font-extrabold);
  margin-bottom: var(--space-2);
}

.price-breakdown {
  font-size: var(--text-sm);
  opacity: 0.9;
  line-height: var(--leading-relaxed);
}
```

### Chatbot Interface
```css
.chatbot-container {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  z-index: 1000;
}

.chatbot-trigger {
  width: 4rem;
  height: 4rem;
  background: linear-gradient(135deg, var(--bubble-blue) 0%, var(--bubble-blue-dark) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 8px 25px -5px rgba(74, 144, 226, 0.4);
  transition: all 0.3s ease-in-out;
}

.chatbot-trigger:hover {
  transform: scale(1.1);
  box-shadow: 0 15px 35px -5px rgba(74, 144, 226, 0.5);
}

.chatbot-window {
  width: 24rem;
  height: 32rem;
  background: var(--white);
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid var(--gray-200);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.chatbot-header {
  background: linear-gradient(135deg, var(--bubble-blue) 0%, var(--bubble-blue-dark) 100%);
  color: var(--white);
  padding: var(--space-4);
  font-weight: var(--font-semibold);
}

.chatbot-messages {
  flex: 1;
  padding: var(--space-4);
  overflow-y: auto;
  background: var(--gray-50);
}

.message {
  margin-bottom: var(--space-3);
  display: flex;
}

.message.user {
  justify-content: flex-end;
}

.message.assistant {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 80%;
  padding: var(--space-3) var(--space-4);
  border-radius: 1rem;
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
}

.message.user .message-bubble {
  background: var(--bubble-blue);
  color: var(--white);
  border-bottom-right-radius: 0.25rem;
}

.message.assistant .message-bubble {
  background: var(--white);
  color: var(--gray-700);
  border: 1px solid var(--gray-200);
  border-bottom-left-radius: 0.25rem;
}
```

---

## 🎯 Guia de Uso

### Hierarquia Visual
1. **Azul Bubbles** - Elementos principais, CTAs, links importantes
2. **Branco** - Backgrounds, espaços negativos
3. **Cinzas** - Textos, elementos secundários
4. **Verde** - Sucessos, confirmações
5. **Laranja** - Avisos, atenção
6. **Vermelho** - Erros, alertas

### Princípios de Design
- **Clareza:** Informações claras e diretas sobre soffit e fascia
- **Confiança:** Design profissional que transmite credibilidade
- **Conversão:** Elementos visuais que guiam para ação (orçamentos, contato)
- **Acessibilidade:** Contraste adequado, fontes legíveis
- **Performance:** CSS otimizado, animações suaves

### Checklist de Implementação
- [ ] ✅ Paleta de cores aplicada consistentemente
- [ ] 📝 Tipografia hierárquica implementada
- [ ] 🔘 Componentes de interface padronizados
- [ ] 📱 Design responsivo em todos os breakpoints
- [ ] 🎭 Animações suaves e performáticas
- [ ] 🎨 Identidade visual da Bubbles Enterprise mantida
- [ ] 🎯 Foco em conversão de leads
- [ ] ♿ Acessibilidade garantida (WCAG 2.1)

---

## 📊 Métricas de Design

### Performance Visual
- 🎨 **Consistência:** 100% dos componentes seguem o design system
- 📱 **Responsividade:** Funciona perfeitamente em todos os dispositivos
- ⚡ **Performance:** CSS otimizado < 50KB
- 🎭 **Animações:** 60fps em todas as transições
- ♿ **Acessibilidade:** Contraste mínimo 4.5:1

### Conversão
- 👁️ **Atenção Visual:** CTAs destacados com azul Bubbles
- 🎯 **Hierarquia Clara:** Informações importantes em destaque
- 📞 **Call-to-Actions:** Botões de contato visíveis em todas as páginas
- 🧮 **Calculadora:** Widget atrativo e fácil de usar
- 🤖 **Chatbot:** Interface amigável e acessível

---

> 🎨 **Resultado Esperado:** Um design system coeso, moderno e otimizado para conversão que mantém a identidade visual da Bubbles Enterprise enquanto oferece a melhor experiência do usuário em Orlando, Florida.

**🔗 Recursos de Design:**
- [Figma Design System](https://www.figma.com/)
- [Adobe Color](https://color.adobe.com/)
- [Google Fonts](https://fonts.google.com/)
- [CSS Grid Generator](https://cssgrid-generator.netlify.app/)