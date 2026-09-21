// Admin Panel Logic for New Schema (site_content & gallery_images)

const SUPABASE_URL = 'https://mvxpkoauxpmkatxclffd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12eHBrb2F1eHBta2F0eGNsZmZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NzkxOTgsImV4cCI6MjEwNTU1NTE5OH0.-IL7XTpbq_UIdTkSzwSyrxE3uneDyefRCC5gJhNwtd8';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Auth Elements
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const authError = document.getElementById('auth-error');
const logoutBtn = document.getElementById('logout-btn');

// Tabs
const tabContent = document.getElementById('tab-content');
const tabVehicles = document.getElementById('tab-vehicles');
const tabGallery = document.getElementById('tab-gallery');
const panelContent = document.getElementById('panel-content');
const panelVehicles = document.getElementById('panel-vehicles');
const panelGallery = document.getElementById('panel-gallery');

// Vehicles Modal
const vehicleModal = document.getElementById('vehicle-modal');
const vehicleForm = document.getElementById('vehicle-form');
const vehicleFormStatus = document.getElementById('vehicle-form-status');
const vehiclesTbody = document.getElementById('vehicles-tbody');
const addVehicleBtn = document.getElementById('add-vehicle-btn');
const vehicleCloseBtns = document.querySelectorAll('.vehicle-close');

// Content Modal
const contentModal = document.getElementById('content-modal');
const contentForm = document.getElementById('content-form');
const contentFormStatus = document.getElementById('content-form-status');
const contentTbody = document.getElementById('content-tbody');
const contentCloseBtns = document.querySelectorAll('.content-close');

// Gallery Modal
const galleryModal = document.getElementById('gallery-modal');
const galleryForm = document.getElementById('gallery-form');
const galleryFormStatus = document.getElementById('gallery-form-status');
const galleryTbody = document.getElementById('gallery-tbody');
const addImageBtn = document.getElementById('add-image-btn');
const galleryCloseBtns = document.querySelectorAll('.gallery-close');

let currentSession = null;

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    const { data, error } = await supabaseClient.auth.getSession();
    if (data.session) {
        currentSession = data.session;
        showDashboard();
    } else {
        showAuth();
    }

    supabaseClient.auth.onAuthStateChange((event, session) => {
        currentSession = session;
        if (session) {
            showDashboard();
        } else {
            showAuth();
        }
    });

    setupMobileNav();
});

function setupMobileNav() {
    const navToggle = document.querySelector('.mobile-nav-toggle');
    const primaryNav = document.getElementById('primary-navigation');

    if (!navToggle || !primaryNav) return;

    navToggle.addEventListener('click', () => {
        const visibility = primaryNav.getAttribute('data-visible');
        
        if (visibility === 'false' || !visibility) {
            primaryNav.setAttribute('data-visible', 'true');
            navToggle.setAttribute('aria-expanded', 'true');
            navToggle.classList.add('active');
        } else {
            primaryNav.setAttribute('data-visible', 'false');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.classList.remove('active');
        }
    });

    const navLinks = primaryNav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            primaryNav.setAttribute('data-visible', 'false');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.classList.remove('active');
        });
    });
}

// Auth
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    authError.style.display = 'none';
    const btn = document.getElementById('login-btn');
    btn.textContent = 'Logging in...';
    btn.disabled = true;

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
        authError.textContent = error.message;
        authError.style.display = 'block';
        btn.textContent = 'Log In';
        btn.disabled = false;
    }
});

logoutBtn.addEventListener('click', async () => { await supabaseClient.auth.signOut(); });

function showAuth() {
    authSection.style.display = 'flex';
    dashboardSection.style.display = 'none';
    document.body.classList.add('bg-light');
}

function showDashboard() {
    authSection.style.display = 'none';
    dashboardSection.style.display = 'block';
    document.body.classList.remove('bg-light');
    loadSiteContent();
    loadVehicles();
    loadGalleryImages();
}

// Tab Switching
function setActiveTab(activeTabEl, activePanelEl) {
    [tabContent, tabVehicles, tabGallery].forEach(t => {
        t.classList.remove('active-tab');
        t.style.fontWeight = 'normal';
    });
    [panelContent, panelVehicles, panelGallery].forEach(p => p.style.display = 'none');
    
    activeTabEl.classList.add('active-tab');
    activeTabEl.style.fontWeight = 'bold';
    activePanelEl.style.display = 'block';
}

tabContent.addEventListener('click', (e) => { e.preventDefault(); setActiveTab(tabContent, panelContent); });
tabVehicles.addEventListener('click', (e) => { e.preventDefault(); setActiveTab(tabVehicles, panelVehicles); });
tabGallery.addEventListener('click', (e) => { e.preventDefault(); setActiveTab(tabGallery, panelGallery); });

// --- SITE CONTENT LOGIC ---
async function loadSiteContent() {
    const { data, error } = await supabaseClient.from('site_content').select('*').order('section_key');
    if (error) return console.error('Error loading content:', error);

    contentTbody.innerHTML = '';
    data.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${item.section_key}</strong></td>
            <td>${item.title}</td>
            <td><small>${item.description}</small></td>
            <td><button class="btn btn-secondary action-btn edit-content-btn" data-key="${item.section_key}">Edit</button></td>
        `;
        contentTbody.appendChild(tr);
    });

    document.querySelectorAll('.edit-content-btn').forEach(btn => {
        btn.addEventListener('click', (e) => editContent(e.target.dataset.key));
    });
}

async function editContent(key) {
    const { data, error } = await supabaseClient.from('site_content').select('*').eq('section_key', key).single();
    if (error || !data) return;

    document.getElementById('content-section-key').value = data.section_key;
    document.getElementById('content-section-display').textContent = data.section_key;
    document.getElementById('content-title').value = data.title;
    document.getElementById('content-description').value = data.description;
    contentFormStatus.textContent = '';
    contentModal.style.display = 'flex';
}

contentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    contentFormStatus.textContent = 'Saving...';
    contentFormStatus.className = 'mt-2 text-navy';
    
    const key = document.getElementById('content-section-key').value;
    const title = document.getElementById('content-title').value;
    const description = document.getElementById('content-description').value;

    try {
        const { error } = await supabaseClient.from('site_content').update({ title, description, updated_at: new Date() }).eq('section_key', key);
        if (error) throw error;
        contentModal.style.display = 'none';
        loadSiteContent();
    } catch (err) {
        contentFormStatus.textContent = err.message;
        contentFormStatus.className = 'mt-2 text-danger';
    }
});

contentCloseBtns.forEach(btn => btn.addEventListener('click', () => contentModal.style.display = 'none'));

// --- VEHICLES LOGIC ---
let allVehicles = [];

async function loadVehicles() {
    const { data, error } = await supabaseClient.from('vehicles').select('*').order('display_order');
    if (error) return console.error('Error loading vehicles:', error);

    allVehicles = data || [];
    
    // Update the UI Table
    vehiclesTbody.innerHTML = '';
    allVehicles.forEach(v => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${v.display_order}</td>
            <td><strong>${v.make} ${v.model}</strong></td>
            <td>${v.is_active ? '<span style="color:green;">Active</span>' : '<span style="color:red;">Hidden</span>'}</td>
            <td>
                <button class="btn btn-secondary action-btn edit-vehicle-btn" data-id="${v.id}">Edit</button>
                <button class="btn btn-primary action-btn delete-vehicle-btn" data-id="${v.id}">Delete</button>
            </td>
        `;
        vehiclesTbody.appendChild(tr);
    });

    // Populate the dropdown in Gallery Modal
    const vehicleSelect = document.getElementById('gallery-vehicle');
    if (vehicleSelect) {
        vehicleSelect.innerHTML = '<option value="">-- Select a Vehicle --</option>';
        allVehicles.forEach(v => {
            vehicleSelect.innerHTML += `<option value="${v.id}">${v.make} ${v.model}</option>`;
        });
    }

    document.querySelectorAll('.edit-vehicle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => editVehicle(e.target.dataset.id));
    });
    document.querySelectorAll('.delete-vehicle-btn').forEach(btn => {
        btn.addEventListener('click', (e) => deleteVehicle(e.target.dataset.id));
    });
}

addVehicleBtn.addEventListener('click', () => {
    vehicleForm.reset();
    document.getElementById('vehicle-id').value = '';
    document.getElementById('vehicle-modal-title').textContent = 'Add Vehicle';
    vehicleFormStatus.textContent = '';
    vehicleModal.style.display = 'flex';
});

vehicleForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    vehicleFormStatus.textContent = 'Saving...';
    vehicleFormStatus.className = 'mt-2 text-navy';
    
    const id = document.getElementById('vehicle-id').value;
    const make = document.getElementById('vehicle-make').value;
    const model = document.getElementById('vehicle-model').value;
    const description = document.getElementById('vehicle-description').value;
    const display_order = parseInt(document.getElementById('vehicle-order').value) || 0;
    const is_active = document.getElementById('vehicle-active').checked;

    const vehicleData = { make, model, description, display_order, is_active };

    try {
        if (id) {
            const { error } = await supabaseClient.from('vehicles').update(vehicleData).eq('id', id);
            if (error) throw error;
        } else {
            const { error } = await supabaseClient.from('vehicles').insert([vehicleData]);
            if (error) throw error;
        }
        vehicleModal.style.display = 'none';
        loadVehicles();
        // Since vehicle names updated, maybe reload gallery images so table shows right names
        loadGalleryImages(); 
    } catch (err) {
        vehicleFormStatus.textContent = err.message;
        vehicleFormStatus.className = 'mt-2 text-danger';
    }
});

async function editVehicle(id) {
    const { data, error } = await supabaseClient.from('vehicles').select('*').eq('id', id).single();
    if (error || !data) return;

    document.getElementById('vehicle-id').value = data.id;
    document.getElementById('vehicle-make').value = data.make;
    document.getElementById('vehicle-model').value = data.model;
    document.getElementById('vehicle-description').value = data.description;
    document.getElementById('vehicle-order').value = data.display_order;
    document.getElementById('vehicle-active').checked = data.is_active;

    document.getElementById('vehicle-modal-title').textContent = 'Edit Vehicle';
    vehicleFormStatus.textContent = '';
    vehicleModal.style.display = 'flex';
}

async function deleteVehicle(id) {
    if (confirm('Are you sure you want to delete this vehicle?')) {
        const { data: images } = await supabaseClient.from('gallery_images').select('id, storage_path').eq('vehicle_id', id);
        
        let deleteImages = false;
        if (images && images.length > 0) {
            deleteImages = confirm(`This vehicle has ${images.length} associated image(s). Do you want to delete them as well? (If Cancel, they will become Unassigned)`);
        }
        
        try {
            if (deleteImages && images.length > 0) {
                // Optionally delete from storage as well
                for (const img of images) {
                    await supabaseClient.storage.from('vehicle-images').remove([img.storage_path]);
                }
                await supabaseClient.from('gallery_images').delete().eq('vehicle_id', id);
            } else if (images && images.length > 0) {
                await supabaseClient.from('gallery_images').update({ vehicle_id: null }).eq('vehicle_id', id);
            }

            const { error } = await supabaseClient.from('vehicles').delete().eq('id', id);
            if (error) throw error;
            
            loadVehicles();
            loadGalleryImages();
        } catch (err) {
            alert('Error deleting: ' + err.message);
        }
    }
}

vehicleCloseBtns.forEach(btn => btn.addEventListener('click', () => vehicleModal.style.display = 'none'));

// --- GALLERY IMAGES LOGIC ---
async function loadGalleryImages() {
    // Fetch images joined with vehicle data if possible, or just map locally since we loaded allVehicles
    const { data, error } = await supabaseClient.from('gallery_images').select('*').order('display_order');
    if (error) return console.error('Error loading gallery:', error);

    galleryTbody.innerHTML = '';
    data.forEach(img => {
        const tr = document.createElement('tr');
        
        let imgUrl = supabaseClient.storage.from('vehicle-images').getPublicUrl(img.storage_path).data.publicUrl;
        
        // Find vehicle name
        const v = allVehicles.find(veh => veh.id === img.vehicle_id);
        const vName = v ? `${v.make} ${v.model}` : 'Unassigned';

        tr.innerHTML = `
            <td><img src="${imgUrl}" alt="${img.alt_text}" width="80" height="50"></td>
            <td><small>${vName}</small></td>
            <td>${img.display_order}</td>
            <td><strong>${img.title}</strong></td>
            <td>${img.is_active ? '<span style="color:green;">Active</span>' : '<span style="color:red;">Hidden</span>'}</td>
            <td>
                <button class="btn btn-secondary action-btn edit-gallery-btn" data-id="${img.id}">Edit</button>
                <button class="btn btn-primary action-btn delete-gallery-btn" data-id="${img.id}">Delete</button>
            </td>
        `;
        galleryTbody.appendChild(tr);
    });

    document.querySelectorAll('.edit-gallery-btn').forEach(btn => {
        btn.addEventListener('click', (e) => editGalleryImage(e.target.dataset.id));
    });
    document.querySelectorAll('.delete-gallery-btn').forEach(btn => {
        btn.addEventListener('click', (e) => deleteGalleryImage(e.target.dataset.id));
    });
}

addImageBtn.addEventListener('click', () => {
    galleryForm.reset();
    document.getElementById('gallery-id').value = '';
    document.getElementById('gallery-modal-title').textContent = 'Add Gallery Image';
    document.getElementById('gallery-preview-container').innerHTML = '';
    galleryFormStatus.textContent = '';
    galleryModal.style.display = 'flex';
});

galleryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    galleryFormStatus.textContent = 'Saving...';
    galleryFormStatus.className = 'mt-2 text-navy';
    
    const id = document.getElementById('gallery-id').value;
    const vehicle_id = document.getElementById('gallery-vehicle').value;
    const title = document.getElementById('gallery-title').value;
    const description = document.getElementById('gallery-description').value;
    const alt_text = document.getElementById('gallery-alt').value;
    const display_order = parseInt(document.getElementById('gallery-order').value) || 0;
    const is_active = document.getElementById('gallery-active').checked;
    const fileInput = document.getElementById('gallery-upload');

    try {
        let storage_path = null;
        
        // Upload new image if selected
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
            storage_path = `${fileName}`;

            galleryFormStatus.textContent = 'Uploading image...';
            const { error: uploadError } = await supabaseClient.storage.from('vehicle-images').upload(storage_path, file);
            if (uploadError) throw uploadError;
        } else if (!id) {
            throw new Error("Image is required for new gallery items.");
        }

        const galleryData = {
            vehicle_id: vehicle_id || null,
            title, description, alt_text, display_order, is_active, updated_at: new Date()
        };

        if (storage_path) galleryData.storage_path = storage_path;

        galleryFormStatus.textContent = 'Saving record...';
        
        if (id) {
            const { error } = await supabaseClient.from('gallery_images').update(galleryData).eq('id', id);
            if (error) throw error;
        } else {
            const { error } = await supabaseClient.from('gallery_images').insert([galleryData]);
            if (error) throw error;
        }

        galleryModal.style.display = 'none';
        loadGalleryImages();

    } catch (err) {
        galleryFormStatus.textContent = err.message;
        galleryFormStatus.className = 'mt-2 text-danger';
    }
});

async function editGalleryImage(id) {
    const { data, error } = await supabaseClient.from('gallery_images').select('*').eq('id', id).single();
    if (error || !data) return;

    document.getElementById('gallery-id').value = data.id;
    document.getElementById('gallery-vehicle').value = data.vehicle_id || '';
    document.getElementById('gallery-title').value = data.title;
    document.getElementById('gallery-description').value = data.description;
    document.getElementById('gallery-alt').value = data.alt_text;
    document.getElementById('gallery-order').value = data.display_order;
    document.getElementById('gallery-active').checked = data.is_active;

    document.getElementById('gallery-modal-title').textContent = 'Edit Gallery Image';
    
    let imgUrl = supabaseClient.storage.from('vehicle-images').getPublicUrl(data.storage_path).data.publicUrl;
    document.getElementById('gallery-preview-container').innerHTML = `<img src="${imgUrl}" style="max-width:200px; border-radius:4px;">`;
    
    galleryFormStatus.textContent = '';
    galleryModal.style.display = 'flex';
}

async function deleteGalleryImage(id) {
    if (confirm('Are you sure you want to delete this image?')) {
        const { error } = await supabaseClient.from('gallery_images').delete().eq('id', id);
        if (error) {
            alert('Error deleting: ' + error.message);
        } else {
            loadGalleryImages();
        }
    }
}

galleryCloseBtns.forEach(btn => btn.addEventListener('click', () => galleryModal.style.display = 'none'));

window.addEventListener('click', (e) => {
    if (e.target === contentModal) contentModal.style.display = 'none';
    if (e.target === vehicleModal) vehicleModal.style.display = 'none';
    if (e.target === galleryModal) galleryModal.style.display = 'none';
});
