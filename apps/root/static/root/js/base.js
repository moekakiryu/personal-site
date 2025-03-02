const BREAKPOINTS = {
  sm: 480,
  md: 768,
}

/**
 * A many -> many event binder
 * 
 * Example usage:
 * 
 * const myElement = document.getElementById('example')
 * 
 * bindEvents(myElement, {
 *   click: () => {},
 *   mousein: () => {}
 * })
 * 
 * bindEvents(myElement, {
 *   ['click', 'mousein']: () => {}
 * })
 * 
 */
const bindEvents = (target, events) => {
  const elementBinder = (elements, eventName, handler) => {
    const isArrayLike = !!elements.length && !!elements.forEach
    
    if (isArrayLike) {
      elements.forEach((element) => {
        element.addEventListener(eventName, handler)
      })
      return
    }
    elements.addEventListener(eventName, handler)
  }

  Object.entries(events).forEach(([eventNames, handler]) => {
    if (Array.isArray(eventNames)) {
      eventNames.forEach(eventName => {
        elementBinder(target, eventName, handler)
      })
      return
    }
    elementBinder(target, eventNames, handler)    
  })
}

const Navigation = {
  selectors: {
    root: '.primary-nav',
    toggleButton: '.hamburger',
    splash: '.splash',
    drawer: '.splash ul',
    links: 'a'
  },

  classes: {
    openMenu: 'open',
    navigationInitiated: 'navigated',
  },

  // Elements
  get root() {
    return document.querySelector(this.selectors.root)
  },

  get toggleButton() {
    return this.root.querySelector(this.selectors.toggleButton)
  },

  get splash() {
    return this.root.querySelector(this.selectors.splash)
  },

  get drawer() {
    return this.root.querySelector(this.selectors.drawer)
  },

  get navLinks() {
    return this.root.querySelectorAll(this.selectors.links)
  },

  // State
  get isOpen() {
    return this.root.classList.contains(this.classes.openMenu)
  },

  get isMobile() {
    return window.innerWidth < BREAKPOINTS.md
  },

  // DOM Mutations
  srHide() {
    this.splash.style.visibility = 'hidden'
  },

  srShow() {
    this.splash.style.visibility = ''
  },

  openDrawer() {
    this.root.classList.add(this.classes.openMenu)
    this.toggleButton.setAttribute('aria-expanded', 'true')
    document.body.style.overflowY = 'hidden'
  },

  closeDrawer() {
    this.root.classList.remove(this.classes.openMenu)
    this.toggleButton.setAttribute('aria-expanded', 'false')    
    document.body.style.overflowY = ''
  },

  initiateNavigation() {
    this.root.classList.add(this.classes.navigationInitiated)
  },

  // Actions
  openMenu() {
    if (!this.isMobile) return

    this.srShow()
    this.openDrawer()
  },

  closeMenu() {
    if (!this.isMobile) return

    if (!this.isOpen) {
      this.srHide()
      return
    }

    const handleTransition = () => {
      if (!this.isOpen) {
        this.srHide()
      }
      this.drawer.removeEventListener('transitionend', handleTransition)
    }

    bindEvents(this.drawer, {
      transitionend: handleTransition
    })

    this.closeDrawer()
  },

  // Handlers
  handleSplashClick() {
    this.closeMenu()
  },

  handleToggleClick() {
    if (this.isOpen) {
      this.closeMenu()
    } else {
      this.openMenu()
    }
  },

  handleNavLinkClick() {
    if (!this.isMobile) {
      return
    }
    this.initiateNavigation()
  },

  handleWindowResize() {   
    if (!this.isMobile) {
      this.srShow()
      return
    }
    this.closeMenu()
  },

  // Module Entry
  init() {
    document.addEventListener('DOMContentLoaded', () => {
      if (this.isMobile) {
        this.closeMenu()
      }

      bindEvents(this.splash, {
        click: this.handleSplashClick.bind(this)
      })

      bindEvents(this.toggleButton, {
        click: this.handleToggleClick.bind(this)
      })

      bindEvents(this.navLinks, {
        click: this.handleNavLinkClick.bind(this)
      })

      bindEvents(window, {
        resize: this.handleWindowResize.bind(this),
      })
    })
  }
}

Navigation.init()