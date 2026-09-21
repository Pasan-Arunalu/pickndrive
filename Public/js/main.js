// main.js - Main Application Logic

const SUPABASE_URL = 'https://mvxpkoauxpmkatxclffd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12eHBrb2F1eHBta2F0eGNsZmZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5NzkxOTgsImV4cCI6MjEwNTU1NTE5OH0.-IL7XTpbq_UIdTkSzwSyrxE3uneDyefRCC5gJhNwtd8';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
window.supabaseClient = supabaseClient;

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    populateBusinessData();
    fetchSiteContent();
    fetchVehiclesAndGallery();
    renderFaqs(faqsData);
    setupMobileNav();
}

async function fetchSiteContent() {
    const { data, error } = await supabaseClient.from('site_content').select('*');
    if (error || !data) return;
    
    data.forEach(item => {
        const titleEl = document.getElementById(`content-${item.section_key}-title`);
        const descEl = document.getElementById(`content-${item.section_key}-desc`);
        
        if (titleEl && item.title) {
            if (item.section_key === 'hero') {
                const words = item.title.trim().split(' ');
                if (words.length > 1) {
                    const lastWord = words.pop();
                    titleEl.innerHTML = `${words.join(' ')} <span style="color: var(--clr-blue)">${lastWord}</span>`;
                } else {
                    titleEl.innerHTML = item.title;
                }
            } else {
                titleEl.innerHTML = item.title;
            }
        }
        if (descEl && item.description) {
            descEl.innerHTML = item.description;
        }
    });
}

let allGalleryImages = [];

async function fetchVehiclesAndGallery() {
    const loadingEl = document.getElementById('vehicle-loading');
    const errorEl = document.getElementById('vehicle-error');
    const contentEl = document.getElementById('vehicle-content');
    
    try {
        // Fetch vehicles
        const { data: vData, error: vError } = await supabaseClient
            .from('vehicles')
            .select('*')
            .eq('is_active', true)
            .order('display_order');
            
        if (vError) throw vError;
        if (!vData || vData.length === 0) throw new Error("No vehicles found");

        // Fetch images
        const { data: iData, error: iError } = await supabaseClient
            .from('gallery_images')
            .select('*')
            .eq('is_active', true)
            .order('display_order');
            
        if (iError) throw iError;
        if (!iData) throw new Error("No images found");
        
        allGalleryImages = iData;
        
        // Hide loading, show content
        if (loadingEl) loadingEl.style.display = 'none';
        if (contentEl) contentEl.style.display = 'block';
        
        renderVehiclesCarousel(vData);
    } catch (err) {
        console.error("Error fetching vehicles:", err);
        if (loadingEl) loadingEl.style.display = 'none';
        if (errorEl) errorEl.style.display = 'block';
    }
}

function renderVehiclesCarousel(vehicles) {
    const tabsContainer = document.getElementById('vehicle-tabs');
    if (!tabsContainer || !vehicles || vehicles.length === 0) return;

    tabsContainer.innerHTML = '';

    vehicles.forEach((vehicle, index) => {
        const tabBtn = document.createElement('button');
        tabBtn.className = `vehicle-tab ${index === 0 ? 'active' : ''}`;
        tabBtn.textContent = `${vehicle.make} ${vehicle.model}`;
        
        tabBtn.addEventListener('click', () => {
            Array.from(tabsContainer.children).forEach(btn => btn.classList.remove('active'));
            tabBtn.classList.add('active');
            updateVehicleDetails(vehicle);
        });

        tabsContainer.appendChild(tabBtn);
    });

    updateVehicleDetails(vehicles[0]);
}

function updateVehicleDetails(vehicle) {
    const titleEl = document.getElementById('content-vehicle-title');
    const descEl = document.getElementById('content-vehicle-desc');
    
    if (titleEl) titleEl.innerHTML = `${vehicle.make} ${vehicle.model}`;
    if (descEl) descEl.innerHTML = vehicle.description;
    
    if (typeof renderGallery === 'function') {
        // Filter images belonging to this vehicle
        const vehicleImages = allGalleryImages.filter(img => img.vehicle_id === vehicle.id);
        renderGallery(vehicleImages);
    }
}

function populateBusinessData() {
    // Basic elements
    setText('nav-brand', businessData.name);
    setText('about-brand', businessData.name);
    setText('footer-brand-name', businessData.name);
    setText('footer-copyright-name', businessData.fullName);
    setText('current-year', new Date().getFullYear().toString());

    // Generate WhatsApp Message
    const defaultWaMessage = "Hi, I'm interested in renting a car. Could you please share the availability and rental details?";
    const encodedMessage = encodeURIComponent(defaultWaMessage);
    // Ensure the number format is suitable for wa.me (remove +, spaces, etc)
    const cleanWaNumber = businessData.whatsapp.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanWaNumber}?text=${encodedMessage}`;

    // Update all dynamic WhatsApp links
    const waLinks = document.querySelectorAll('.dynamic-whatsapp');
    waLinks.forEach(link => {
        link.href = waUrl;
    });

    // Update all dynamic Phone links
    const phoneLinks = document.querySelectorAll('.dynamic-phone');
    phoneLinks.forEach(link => {
        link.href = `tel:${businessData.phone}`;
    });

    // Update all dynamic Google Maps links
    const mapLinks = document.querySelectorAll('.dynamic-gmap');
    mapLinks.forEach(link => {
        if(businessData.googleMapsUrl) {
            link.href = businessData.googleMapsUrl;
        }
    });
}



function renderFaqs(faqs) {
    const faqContainer = document.getElementById('faq-container');
    if (!faqContainer) return;

    faqs.forEach(faq => {
        const details = document.createElement('details');
        
        const summary = document.createElement('summary');
        summary.textContent = faq.question;
        
        const p = document.createElement('p');
        p.textContent = faq.answer;
        
        details.appendChild(summary);
        details.appendChild(p);
        faqContainer.appendChild(details);
    });
}

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

    // Close nav on link click
    const navLinks = primaryNav.querySelectorAll('a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            primaryNav.setAttribute('data-visible', 'false');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

// Utility
function setText(elementId, text) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = text;
    }
}
