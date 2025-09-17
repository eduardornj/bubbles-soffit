/**
 * Advanced Lazy Script Loader - 2025 SEO & Performance Optimization
 * Otimização de INP (Interaction to Next Paint) e Core Web Vitals
 * Carrega scripts não essenciais apenas quando necessário
 */

class LazyScriptLoader {
  constructor() {
    this.loadedScripts = new Set();
    this.pendingScripts = new Map();
    this.observers = new Map();
    this.performanceMetrics = {
      scriptLoadTimes: new Map(),
      interactionDelays: []
    };
    this.init();
  }

  init() {
    // Aguarda o DOM estar pronto
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupLazyLoading());
    } else {
      this.setupLazyLoading();
    }
  }

  setupLazyLoading() {
    // Carrega scripts críticos imediatamente
    this.loadCriticalScripts();
    
    // Configura carregamento sob demanda
    this.setupInteractionBasedLoading();
    this.setupVisibilityBasedLoading();
    this.setupIdleLoading();
  }

  loadCriticalScripts() {
    // Scripts essenciais para a primeira interação - removidos scripts inexistentes
    // Apenas carrega scripts que realmente existem no projeto
    console.log('Critical scripts loading skipped - no existing scripts found');
  }

  setupInteractionBasedLoading() {
    // Carrega scripts quando o usuário interage - otimizado para INP 2025
    const interactionEvents = ['click', 'touchstart', 'keydown', 'mouseover', 'pointerdown'];
    
    const loadInteractiveScripts = (event) => {
      // Mede o tempo de resposta para INP
      const startTime = performance.now();
      
      // Scripts de interação removidos - não existem no projeto
      console.log('Interactive scripts loading skipped - no existing scripts found');
      
      // Remove listeners após carregar
      interactionEvents.forEach(event => {
        document.removeEventListener(event, loadInteractiveScripts, { passive: true });
      });
    };

    interactionEvents.forEach(event => {
      document.addEventListener(event, loadInteractiveScripts, { passive: true, once: true });
    });
  }

  setupVisibilityBasedLoading() {
    // Carrega scripts quando elementos ficam visíveis
    const observerConfig = {
      rootMargin: '100px 0px',
      threshold: 0.1
    };

    // Gallery scripts
    const galleryElements = document.querySelectorAll('.gallery-container, .home-carousel');
    if (galleryElements.length > 0) {
      const galleryObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadScript('gallery-lazy-loading');
            this.loadScript('carousel-autoplay');
            galleryObserver.disconnect();
          }
        });
      }, observerConfig);

      galleryElements.forEach(el => galleryObserver.observe(el));
    }

    // Chat bot scripts
    const chatElements = document.querySelectorAll('.chat-widget, .featured-chat');
    if (chatElements.length > 0) {
      const chatObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadScript('chat-functionality');
            chatObserver.disconnect();
          }
        });
      }, observerConfig);

      chatElements.forEach(el => chatObserver.observe(el));
    }
  }

  setupIdleLoading() {
    // Carrega scripts não essenciais quando o browser está idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // Scripts removidos - não existem no projeto
        console.log('Idle scripts loading skipped - no existing scripts found');
      }, { timeout: 5000 });
    } else {
      // Fallback para browsers sem suporte
      setTimeout(() => {
        // Scripts removidos - não existem no projeto
        console.log('Idle scripts loading skipped - no existing scripts found');
      }, 3000);
    }
  }

  loadScript(scriptName, options = {}) {
    if (this.loadedScripts.has(scriptName)) {
      return Promise.resolve();
    }

    if (this.pendingScripts.has(scriptName)) {
      return this.pendingScripts.get(scriptName);
    }

    const promise = this.createScriptPromise(scriptName, options);
    this.pendingScripts.set(scriptName, promise);

    return promise;
  }

  createScriptPromise(scriptName, options) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      
      // Configurações baseadas no tipo de script
      const scriptConfig = this.getScriptConfig(scriptName);
      
      script.src = scriptConfig.src;
      script.async = true;
      script.defer = options.defer !== false;
      
      if (options.priority === 'high') {
        script.fetchPriority = 'high';
      }

      script.onload = () => {
        this.loadedScripts.add(scriptName);
        this.pendingScripts.delete(scriptName);
        
        // Executa callback se existir
        if (scriptConfig.callback) {
          scriptConfig.callback();
        }
        
        resolve();
      };

      script.onerror = () => {
        this.pendingScripts.delete(scriptName);
        console.warn(`Failed to load script: ${scriptName}`);
        reject(new Error(`Script load failed: ${scriptName}`));
      };

      document.head.appendChild(script);
    });
  }

  getScriptConfig(scriptName) {
    const configs = {
      'navigation': {
        src: '/scripts/navigation.js',
        callback: () => this.initNavigation()
      },
      'header-scroll': {
        src: '/scripts/header-scroll.js',
        callback: () => this.initHeaderScroll()
      },
      'gallery-interactions': {
        src: '/scripts/gallery-interactions.js',
        callback: () => this.initGalleryInteractions()
      },
      'carousel-controls': {
        src: '/scripts/carousel-controls.js',
        callback: () => this.initCarouselControls()
      },
      'modal-handlers': {
        src: '/scripts/modal-handlers.js',
        callback: () => this.initModalHandlers()
      },
      'gallery-lazy-loading': {
        src: '/scripts/gallery-lazy-loading.js',
        callback: () => this.initGalleryLazyLoading()
      },
      'carousel-autoplay': {
        src: '/scripts/carousel-autoplay.js',
        callback: () => this.initCarouselAutoplay()
      },
      'chat-functionality': {
        src: '/scripts/chat-functionality.js',
        callback: () => this.initChatFunctionality()
      },
      'analytics-enhanced': {
        src: '/scripts/analytics-enhanced.js'
      },
      'form-enhancements': {
        src: '/scripts/form-enhancements.js'
      },
      'admin-dashboard': {
        src: '/scripts/admin-dashboard.js'
      }
    };

    return configs[scriptName] || { src: `/scripts/${scriptName}.js` };
  }

  // Métodos de inicialização inline para scripts críticos
  initNavigation() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('nav a[href]');
    
    navLinks.forEach(link => {
      if (link.getAttribute('href') === currentPath) {
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  initHeaderScroll() {
    const header = document.querySelector('header');
    if (!header) return;

    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateHeader = () => {
      const scrollY = window.scrollY;
      
      if (scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      
      lastScrollY = scrollY;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
  }

  initGalleryInteractions() {
    // Placeholder - será implementado nos scripts separados
    console.log('Gallery interactions loaded');
  }

  initCarouselControls() {
    // Placeholder - será implementado nos scripts separados
    console.log('Carousel controls loaded');
  }

  initModalHandlers() {
    // Placeholder - será implementado nos scripts separados
    console.log('Modal handlers loaded');
  }

  initGalleryLazyLoading() {
    // Placeholder - será implementado nos scripts separados
    console.log('Gallery lazy loading loaded');
  }

  initCarouselAutoplay() {
    // Placeholder - será implementado nos scripts separados
    console.log('Carousel autoplay loaded');
  }

  initChatFunctionality() {
    // Placeholder - será implementado nos scripts separados
    console.log('Chat functionality loaded');
  }

  // Método público para carregar scripts sob demanda
  static load(scriptName, options = {}) {
    if (!window.lazyLoader) {
      window.lazyLoader = new LazyScriptLoader();
    }
    return window.lazyLoader.loadScript(scriptName, options);
  }
}

// Inicializa o lazy loader
if (!window.lazyLoader) {
  window.lazyLoader = new LazyScriptLoader();
}

// Exporta para uso global
window.LazyScriptLoader = LazyScriptLoader;

// Método de conveniência global
window.loadScript = (scriptName, options) => LazyScriptLoader.load(scriptName, options);