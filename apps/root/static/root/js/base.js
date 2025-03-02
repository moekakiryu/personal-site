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
  },

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

  get isOpen() {
    return this.root.classList.contains(this.classes.openMenu)
  },

  get isMobile() {
    return window.innerWidth < BREAKPOINTS.md
  },

  srHide() {
    this.splash.style.display = 'none'
  },

  srShow() {
    this.splash.style.display = ''
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

  openMenu() {
    this.srShow()

    setTimeout(() => {
      this.openDrawer()
    }, 1) // 1ms to fire after srShow
  },

  closeMenu() {
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

  handleToggleClick() {
    if (this.isOpen) {
      this.closeMenu()
    } else {
      this.openMenu()
    }
  },

  handleWindowResize() {
    this.closeMenu()

    if (!this.isMobile) {
      this.srShow()
    }
  },

  bind() {
    document.addEventListener('DOMContentLoaded', () => {
      if (this.isMobile) {
        this.closeMenu()
      }

      bindEvents(this.splash, {
        click: () => this.closeMenu()
      })

      bindEvents(this.toggleButton, {
        click: () => this.handleToggleClick()
      })

      bindEvents(this.navLinks, {
        click: () => this.srHide()
      })

      bindEvents(window, {
        resize: () => this.handleWindowResize(),
      })
    })
  }
}

Navigation.bind()