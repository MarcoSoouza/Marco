/**
 * Main JavaScript for Portfolio Website
 * Handles: Mobile Menu, Scroll Effects, Form Validation, Animations
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all modules
    initNavbar();
    initMobileMenu();
    initScrollAnimations();
    initSmoothScroll();
    initFormValidation();
});

/**
 * Navbar - Scroll Effect
 */
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    
    if (!navbar) return;

    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

/**
 * Mobile Menu Toggle
 */
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (!menuToggle || !navLinks) return;

    menuToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        
        // Animate hamburger
        const spans = menuToggle.querySelectorAll('span');
        if (navLinks.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });

    // Close menu when clicking on a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('active');
            const spans = menuToggle.querySelectorAll('span');
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        });
    });
}

/**
 * Scroll Animations using Intersection Observer
 */
function initScrollAnimations() {
    const reveals = document.querySelectorAll('.reveal');
    
    if (reveals.length === 0) return;

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    reveals.forEach(element => {
        observer.observe(element);
    });
}

/**
 * Smooth Scroll for Anchor Links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#"
            if (href === '#') return;
            
            const target = document.querySelector(href);
            
            if (target) {
                e.preventDefault();
                
                const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Contact Form Validation
 */
function initFormValidation() {
    const form = document.querySelector('.contact-form form');
    
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = form.querySelector('input[type="text"]');
        const email = form.querySelector('input[type="email"]');
        const message = form.querySelector('textarea');
        
        let isValid = true;
        
        // Validate Name
        if (!name.value.trim()) {
            showError(name, 'Por favor, insira seu nome');
            isValid = false;
        } else {
            showSuccess(name);
        }
        
        // Validate Email
        if (!email.value.trim()) {
            showError(email, 'Por favor, insira seu email');
            isValid = false;
        } else if (!isValidEmail(email.value)) {
            showError(email, 'Por favor, insira um email válido');
            isValid = false;
        } else {
            showSuccess(email);
        }
        
        // Validate Message
        if (!message.value.trim()) {
            showError(message, 'Por favor, insira sua mensagem');
            isValid = false;
        } else {
            showSuccess(message);
        }
        
        // If valid, show success message
        if (isValid) {
            showFormSuccess(form);
        }
    });

    // Real-time validation
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim()) {
                if (this.type === 'email' && !isValidEmail(this.value)) {
                    showError(this, 'Email inválido');
                } else {
                    showSuccess(this);
                }
            } else {
                removeValidation(this);
            }
        });
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showError(input, message) {
    const formGroup = input.closest('.form-group');
    formGroup.classList.remove('success');
    formGroup.classList.add('error');
    
    let errorElement = formGroup.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        formGroup.appendChild(errorElement);
    }
    errorElement.textContent = message;
}

function showSuccess(input) {
    const formGroup = input.closest('.form-group');
    formGroup.classList.remove('error');
    formGroup.classList.add('success');
    
    const errorElement = formGroup.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
}

function removeValidation(input) {
    const formGroup = input.closest('.form-group');
    formGroup.classList.remove('error', 'success');
    
    const errorElement = formGroup.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
}

function showFormSuccess(form) {
    // Create success message
    const successMessage = document.createElement('div');
    successMessage.className = 'form-success';
    successMessage.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem;">✓</div>
            <h3 style="color: var(--accent-blue); margin-bottom: 0.5rem;">Mensagem Enviada!</h3>
            <p style="color: var(--text-muted);">Obrigado pelo contato. Retornarei em breve.</p>
        </div>
    `;
    
    // Hide form and show success
    form.style.display = 'none';
    form.parentNode.insertBefore(successMessage, form);
    
    // Reset form after 5 seconds
    setTimeout(() => {
        form.reset();
        form.style.display = 'block';
        successMessage.remove();
        
        // Remove validation classes
        form.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('success', 'error');
        });
    }, 5000);
}

/**
 * Skill Bars Animation (for Index page)
 */
function animateSkillBars() {
    const skillBars = document.querySelectorAll('.progress');
    
    skillBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0';
        
        setTimeout(() => {
            bar.style.width = width;
        }, 100);
    });
}

// Trigger skill bar animation when skills section is visible
const skillsSection = document.querySelector('#habilidades, .skills');
if (skillsSection) {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateSkillBars();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    observer.observe(skillsSection);
}
