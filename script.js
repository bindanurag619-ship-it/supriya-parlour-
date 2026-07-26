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
  const openDulhanGalleryBtn = document.getElementById('open-dulhan-gallery-btn');
  const dulhanGalleryPanel = document.getElementById('dulhan-gallery-panel');
  const previewGrid = document.getElementById('dulhan-preview-grid');
  const uploadStatus = document.getElementById('upload-status');
  const storageKey = 'supriya-dulhan-gallery';

  const isTouchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  let galleryImages = [];

  try {
    const storedImages = localStorage.getItem(storageKey);
    galleryImages = storedImages ? JSON.parse(storedImages) : [];
    if (!Array.isArray(galleryImages)) {
      galleryImages = [];
    }
  } catch (error) {
    console.warn('Gallery storage is unavailable on this device:', error);
    galleryImages = [];
  }

  // If no uploaded images exist, populate with 27 default Dulhan photos
  if (!galleryImages || galleryImages.length === 0) {
    galleryImages = Array.from({ length: 27 }, (_, i) => `image/dulhan${i + 1}.jpg`);
  }

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

  // Throttle scroll updates via requestAnimationFrame and guard elements
  (function() {
    let lastKnownScrollY = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      lastKnownScrollY = window.scrollY;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          const winScroll = lastKnownScrollY;
          const height = document.documentElement.scrollHeight - window.innerHeight;
          const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
          if (progress) progress.style.transform = `scaleX(${scrolled / 100})`;
          if (backToTop) backToTop.classList.toggle('visible', winScroll > 600);
          ticking = false;
        });
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    if (backToTop) {
      backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  })();

  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      siteNav.classList.toggle('open');
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
    });
  }

  document.querySelectorAll('.site-nav a').forEach((link) => {
    link.addEventListener('click', () => {
      if (siteNav) siteNav.classList.remove('open');
      if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  // Throttle pointer updates with requestAnimationFrame and reduce listeners
  if (!isTouchDevice && cursor) {
    let mouseX = 0;
    let mouseY = 0;
    let pointerTicking = false;

    const onPointerMove = (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      if (!pointerTicking) {
        pointerTicking = true;
        requestAnimationFrame(() => {
          if (cursor) {
            cursor.style.left = `${mouseX}px`;
            cursor.style.top = `${mouseY}px`;
          }
          pointerTicking = false;
        });
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    // Use delegation for hover state to reduce many listeners
    const hoverSelector = 'a, button, input, select, textarea, .service-card, .product-card, .gallery-card, .testimonial-card';
    document.addEventListener('pointerover', (e) => {
      const target = e.target;
      if (target && target.closest && target.closest(hoverSelector)) cursor.classList.add('hovered');
    }, true);
    document.addEventListener('pointerout', (e) => {
      const target = e.target;
      if (target && target.closest && target.closest(hoverSelector)) cursor.classList.remove('hovered');
    }, true);
  }

  const updateUploadStatus = (message) => {
    if (uploadStatus) {
      uploadStatus.textContent = message;
    }
  };

  const renderUploadedImages = () => {
    if (!previewGrid) return;

    previewGrid.innerHTML = '';

    if (!galleryImages.length) {
      previewGrid.innerHTML = '<p class="empty-state">No bridal photos have been added yet.</p>';
      updateUploadStatus('No bridal photos have been added yet.');
      return;
    }

    const fragment = document.createDocumentFragment();

    galleryImages.forEach((imageData, index) => {
      const card = document.createElement('article');
      card.className = 'upload-item';
      card.innerHTML = `
        <img class="dulhan-thumb" data-index="${index}" src="${imageData}" alt="Bridal photo ${index + 1}" loading="lazy">
      `;
      fragment.appendChild(card);
    });

    previewGrid.appendChild(fragment);
    updateUploadStatus('These bridal photos are displayed for visitors to view.');
  };

  openDulhanGalleryBtn?.addEventListener('click', () => {
    if (dulhanGalleryPanel) {
      dulhanGalleryPanel.hidden = !dulhanGalleryPanel.hidden;
      if (!dulhanGalleryPanel.hidden) {
        dulhanGalleryPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });

  renderUploadedImages();

  // Lightbox behavior for full-screen viewing
  const lightbox = document.getElementById('dulhan-lightbox');
  const lightboxImg = document.getElementById('dulhan-lightbox-img');
  const lightboxClose = document.getElementById('dulhan-close');
  const lightboxPrev = document.getElementById('dulhan-prev');
  const lightboxNext = document.getElementById('dulhan-next');
  let currentLightboxIndex = 0;

  const openLightbox = (index) => {
    if (!galleryImages || !galleryImages.length) return;
    currentLightboxIndex = (index + galleryImages.length) % galleryImages.length;
    lightboxImg.src = galleryImages[currentLightboxIndex];
    lightbox.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.setAttribute('hidden', '');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  };

  const showPrev = () => openLightbox(currentLightboxIndex - 1);
  const showNext = () => openLightbox(currentLightboxIndex + 1);

  // Delegate clicks from the preview grid to thumbs
  previewGrid?.addEventListener('click', (e) => {
    const img = e.target.closest('img.dulhan-thumb');
    if (img) {
      const idx = Number(img.dataset.index);
      openLightbox(idx);
    }
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxPrev?.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
  lightboxNext?.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });

  // Close when clicking outside the image
  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (lightbox && !lightbox.hasAttribute('hidden')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    }
  });

  form?.addEventListener('submit', (event) => {
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
