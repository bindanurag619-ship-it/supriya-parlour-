document.addEventListener('DOMContentLoaded', () => {
  const loadingScreen = document.getElementById('loading-screen');
  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.querySelector('.site-nav');
  const cursor = document.querySelector('.cursor');
  const backToTop = document.getElementById('back-to-top');
  const progress = document.querySelector('.scroll-progress');
  const form = document.getElementById('booking-form');
  const formMessage = document.getElementById('form-message');
  const revealItems = document.querySelectorAll('.reveal');

  document.body.dataset.theme = 'dark';

  setTimeout(() => {
    loadingScreen.classList.add('hidden');
  }, 1200);

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  document.querySelectorAll('.service-card, .product-card, .testimonial-card').forEach((card) => {
    card.addEventListener('mouseenter', () => card.classList.add('hovered'));
    card.addEventListener('mouseleave', () => card.classList.remove('hovered'));
  });

  window.addEventListener('scroll', () => {
    const winScroll = window.scrollY;
    const height = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
    progress.style.transform = `scaleX(${scrolled / 100})`;
    backToTop.classList.toggle('visible', winScroll > 600);
  });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  navToggle.addEventListener('click', () => {
    siteNav.classList.toggle('open');
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
  });

  document.querySelectorAll('.site-nav a').forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  const pointerMove = (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
  };

  window.addEventListener('mousemove', pointerMove);
  document.querySelectorAll('a, button, input, select, textarea, .service-card, .product-card, .gallery-card, .testimonial-card').forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = data.get('name')?.toString().trim();
    if (!name) {
      formMessage.textContent = 'Please share your name before booking.';
      return;
    }
    formMessage.textContent = `Thank you, ${name}! We will contact you shortly.`;
    form.reset();
  });
});
