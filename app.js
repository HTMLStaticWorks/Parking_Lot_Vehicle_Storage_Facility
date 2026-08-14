/* ==========================================================================
   GLOBAL APP JAVASCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initRtl();
  initBackToTop();
  initMobileMenu();
  initActiveLinks();
  initFontAwesome();
});

/**
 * Initialize Light/Dark Theme Toggle
 */
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;

  // Check saved theme or system preference
  const savedTheme = localStorage.getItem('theme') || 'dark'; // Dark is premium default
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(themeToggle, savedTheme);

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(themeToggle, newTheme);
    
    // Dispatch custom event for dashboard graphs if needed
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));
  });
}

function updateThemeIcon(btn, theme) {
  const icon = btn.querySelector('i');
  if (!icon) return;
  if (theme === 'light') {
    icon.className = 'fas fa-moon';
    btn.setAttribute('title', 'Switch to Dark Mode');
  } else {
    icon.className = 'fas fa-sun';
    btn.setAttribute('title', 'Switch to Light Mode');
  }
}

/**
 * Initialize RTL Toggle
 */
function initRtl() {
  const rtlToggle = document.getElementById('rtl-toggle');
  if (!rtlToggle) return;

  // Check saved direction
  const savedDir = localStorage.getItem('dir') || 'ltr';
  document.documentElement.setAttribute('dir', savedDir);
  updateRtlButtonText(rtlToggle, savedDir);

  rtlToggle.addEventListener('click', () => {
    const currentDir = document.documentElement.getAttribute('dir');
    const newDir = currentDir === 'rtl' ? 'ltr' : 'rtl';
    
    document.documentElement.setAttribute('dir', newDir);
    localStorage.setItem('dir', newDir);
    updateRtlButtonText(rtlToggle, newDir);
  });
}

function updateRtlButtonText(btn, dir) {
  const icon = btn.querySelector('span');
  if (icon) {
    icon.textContent = dir === 'rtl' ? 'LTR' : 'RTL';
  } else {
    btn.textContent = dir === 'rtl' ? 'LTR' : 'RTL';
  }
  btn.setAttribute('title', dir === 'rtl' ? 'Switch to Left-to-Right' : 'Switch to Right-to-Left');
}

/**
 * Initialize Back to Top Button
 */
function initBackToTop() {
  // Create back to top button dynamically if not exists
  let bttBtn = document.getElementById('back-to-top');
  if (!bttBtn) {
    bttBtn = document.createElement('button');
    bttBtn.id = 'back-to-top';
    bttBtn.className = 'back-to-top';
    bttBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
    bttBtn.setAttribute('aria-label', 'Back to top');
    document.body.appendChild(bttBtn);
  }

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      bttBtn.classList.add('visible');
    } else {
      bttBtn.classList.remove('visible');
    }
  });

  bttBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/**
 * Initialize Mobile Navigation Menu
 */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const navMenu = document.getElementById('nav-menu');
  
  if (!menuBtn || !navMenu) return;

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    menuBtn.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && e.target !== menuBtn) {
      menuBtn.classList.remove('active');
      navMenu.classList.remove('active');
    }
  });

  // Handle dropdown touch triggers for mobile layout
  const dropdownItems = document.querySelectorAll('.nav-item');
  dropdownItems.forEach(item => {
    const link = item.querySelector('.nav-link');
    const dropdown = item.querySelector('.dropdown-menu');
    
    if (link && dropdown) {
      link.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
          const isDropdownVisible = dropdown.style.maxHeight && dropdown.style.maxHeight !== '0px';
          
          // Collapse all dropdowns first
          document.querySelectorAll('.dropdown-menu').forEach(d => {
            d.style.maxHeight = '0px';
            d.style.paddingTop = '0px';
            d.style.paddingBottom = '0px';
          });

          if (!isDropdownVisible) {
            e.preventDefault();
            dropdown.style.maxHeight = '300px';
            dropdown.style.paddingTop = '0.5rem';
            dropdown.style.paddingBottom = '0.5rem';
          }
        }
      });
    }
  });
}

/**
 * Highlight Active Page Link in Navbars
 */
function initActiveLinks() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-menu .nav-item');
  
  navLinks.forEach(item => {
    // Check main links
    const link = item.querySelector('.nav-link');
    if (link) {
      const href = link.getAttribute('href');
      if (href === currentPath) {
        item.classList.add('active');
      }
    }
    
    // Check dropdown link children
    const dropdownLinks = item.querySelectorAll('.dropdown-menu a');
    dropdownLinks.forEach(subLink => {
      const href = subLink.getAttribute('href');
      if (href === currentPath) {
        item.classList.add('active');
        subLink.style.color = 'var(--color-accent)';
      }
    });
  });
}

/**
 * Dynamically inject FontAwesome icons kit for styling
 */
function initFontAwesome() {
  if (document.getElementById('font-awesome-kit')) return;
  const script = document.createElement('script');
  script.id = 'font-awesome-kit';
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/js/all.min.js';
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
}

// Password Visibility Toggle
document.addEventListener('DOMContentLoaded', () => {
  const togglePasswordBtns = document.querySelectorAll('.toggle-password');
  togglePasswordBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const input = this.previousElementSibling;
      const icon = this.querySelector('i');
      if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    });
  });
});

// Active Page Highlighter
document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link, .dropdown-item a');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === currentPath || href.startsWith(currentPath + '#'))) {
      link.classList.add('active');
    }
  });
});
