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
  const uploadInput = document.getElementById('dulhan-upload-input');
  const uploadButton = document.getElementById('upload-gallery-btn');
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

  if (!isTouchDevice && cursor) {
    window.addEventListener('mousemove', pointerMove);
    document.querySelectorAll('a, button, input, select, textarea, .service-card, .product-card, .gallery-card, .testimonial-card').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
    });
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
      previewGrid.innerHTML = '<p class="empty-state">No photos uploaded yet. Select images to start your bridal gallery.</p>';
      return;
    }

    const fragment = document.createDocumentFragment();

    galleryImages.forEach((imageData, index) => {
      const card = document.createElement('article');
      card.className = 'upload-item';
      card.innerHTML = `
        <img src="${imageData}" alt="Uploaded bridal photo ${index + 1}" loading="lazy">
        <button class="remove-photo-btn" type="button" data-index="${index}" aria-label="Remove photo">×</button>
      `;
      fragment.appendChild(card);
    });

    previewGrid.appendChild(fragment);
  };

  const saveGalleryImages = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(galleryImages));
    } catch (error) {
      console.warn('Unable to save gallery images:', error);
      updateUploadStatus('Photos were added for this session, but this device could not save them permanently.');
    }
    renderUploadedImages();
  };

  const handleImageUpload = async () => {
    if (!uploadInput?.files?.length) {
      updateUploadStatus('Please choose at least one photo first.');
      return;
    }

    const files = Array.from(uploadInput.files);
    const imageResults = await Promise.all(
      files.map((file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      }))
    );

    galleryImages = [...galleryImages, ...imageResults];
    saveGalleryImages();
    uploadInput.value = '';
    updateUploadStatus(`${imageResults.length} photo${imageResults.length > 1 ? 's' : ''} added to your gallery.`);
  };

  openDulhanGalleryBtn?.addEventListener('click', () => {
    if (dulhanGalleryPanel) {
      dulhanGalleryPanel.hidden = !dulhanGalleryPanel.hidden;
      if (!dulhanGalleryPanel.hidden) {
        dulhanGalleryPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  });

  uploadButton?.addEventListener('click', handleImageUpload);

  previewGrid?.addEventListener('click', (event) => {
    const removeButton = event.target.closest('.remove-photo-btn');
    if (!removeButton) return;

    const index = Number(removeButton.dataset.index);
    if (Number.isNaN(index)) return;

    galleryImages.splice(index, 1);
    saveGalleryImages();
    updateUploadStatus('Photo removed.');
  });

  renderUploadedImages();

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
