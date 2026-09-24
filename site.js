(() => {
  const root = document.documentElement;
  const button = document.getElementById('themeBtn');
  function setTheme(theme) {
    root.dataset.theme = theme;
    if (!button) return;
    button.textContent = theme === 'dark' ? '◑' : '◐';
    button.setAttribute('aria-pressed', String(theme === 'dark'));
    button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    button.title = theme === 'dark' ? 'Light theme' : 'Dark theme';
  }
  let theme = 'light';
  try { theme = localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'; } catch (_) {}
  setTheme(theme);
  button?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem('theme', next); } catch (_) {}
  });

  // Native disclosure keeps navigation usable even without JavaScript.
  const more = document.querySelector('.nav-more');
  if (more) {
    const summary = more.querySelector('summary');
    document.addEventListener('click', event => {
      if (!more.contains(event.target)) more.open = false;
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && more.open) {
        more.open = false;
        summary.focus();
        event.preventDefault();
      }
    });
    more.addEventListener('focusout', event => {
      if (event.relatedTarget && !more.contains(event.relatedTarget)) more.open = false;
    });
    more.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      more.open = false;
    }));
    window.addEventListener('pageshow', () => { more.open = false; });
  }

  const motto = document.getElementById('mottoText');
  const languages = document.querySelectorAll('.lang-btn');
  languages.forEach(button => button.addEventListener('click', () => {
    const lang = button.dataset.lang;
    if (!motto || !motto.dataset[lang]) return;
    motto.textContent = motto.dataset[lang];
    motto.lang = lang;
    languages.forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
  }));

  const videos = document.querySelectorAll('video[data-src]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function loadVideo(video) {
    if (video.dataset.src) {
      video.src = video.dataset.src;
      delete video.dataset.src;
      video.load();
    }
    if (!reducedMotion.matches && !document.hidden) video.play().catch(() => {});
  }
  videos.forEach(video => {
    video.controls = true;
    video.muted = true;
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(({ target, isIntersecting }) => {
        if (isIntersecting) loadVideo(target);
        else target.pause();
      });
    }, { threshold: 0.12 });
    videos.forEach(video => observer.observe(video));
  } else {
    videos.forEach(loadVideo);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) videos.forEach(video => video.pause());
  });

  const categoryLinks = document.querySelectorAll('.category-nav a');
  if (categoryLinks.length && 'IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        categoryLinks.forEach(link => {
          if (link.hash === '#' + entry.target.id) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-10% 0px -65% 0px' });
    document.querySelectorAll('.rec-sections section').forEach(section => sectionObserver.observe(section));
  }
})();
