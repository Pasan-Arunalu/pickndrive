// gallery.js - Dynamic Gallery Renderer

function renderGallery(images) {
    const galleryContainer = document.getElementById('vehicle-gallery-container');
    if (!galleryContainer || !images || images.length === 0) return;

    // Clear existing gallery content
    galleryContainer.innerHTML = '';

    // Create main image container
    const mainImgContainer = document.createElement('div');
    mainImgContainer.className = 'gallery-main';
    
    const getPublicUrl = (path) => {
        return window.supabaseClient.storage.from('vehicle-images').getPublicUrl(path).data.publicUrl;
    };

    const mainImg = document.createElement('img');
    mainImg.src = getPublicUrl(images[0].storage_path);
    mainImg.alt = images[0].alt_text || images[0].title || 'Vehicle Image';
    mainImg.id = 'gallery-main-img';
    
    mainImgContainer.appendChild(mainImg);

    // Create thumbnails container
    const thumbContainer = document.createElement('div');
    thumbContainer.className = 'gallery-thumbnails';

    images.forEach((image, index) => {
        const btn = document.createElement('button');
        btn.className = index === 0 ? 'active' : '';
        btn.setAttribute('aria-label', `View ${image.title || 'thumbnail'}`);
        
        const imgUrl = getPublicUrl(image.storage_path);

        const thumbImg = document.createElement('img');
        thumbImg.src = imgUrl;
        thumbImg.alt = `Thumbnail of ${image.alt_text || image.title || 'vehicle'}`;
        thumbImg.loading = "lazy";
        
        btn.appendChild(thumbImg);
        
        // Event listener for swapping images
        btn.addEventListener('click', () => {
            mainImg.src = imgUrl;
            mainImg.alt = image.alt_text || image.title || 'Vehicle Image';
            
            // Update active state
            Array.from(thumbContainer.children).forEach(child => child.classList.remove('active'));
            btn.classList.add('active');
        });
        
        thumbContainer.appendChild(btn);
    });

    // Append to DOM
    galleryContainer.appendChild(mainImgContainer);
    if(images.length > 1) {
        galleryContainer.appendChild(thumbContainer);
    }
}
