// Smooth scroll implementation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Enhanced cursor blink effect
function setupBlinkingCursors() {
    // Handle section header cursors
    const cursors = document.querySelectorAll('.accent');
    cursors.forEach(cursor => {
        if (!cursor.classList.contains('blink-cursor')) {
            cursor.style.animation = 'none';
            cursor.offsetHeight; // Trigger reflow
            cursor.style.animation = 'blink 1s step-end infinite';
        }
    });

    // Handle logo cursor specifically
    const logoCursor = document.querySelector('.blink-cursor');
    if (logoCursor) {
        logoCursor.style.animation = 'none';
        logoCursor.offsetHeight; // Trigger reflow
        logoCursor.style.animation = 'blink 1s step-end infinite';
    }
}

// Initialize blinking cursors
setupBlinkingCursors();

// Refresh blink effect when switching tabs/windows
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        setupBlinkingCursors();
    }
});

// Mobile menu toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    menuToggle.classList.toggle('active');
});

// Scroll animations
const fadeElements = document.querySelectorAll('section');
const appearOptions = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
};

const appearOnScroll = new IntersectionObserver((entries, appearOnScroll) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('fade-in', 'visible');
        appearOnScroll.unobserve(entry.target);
    });
}, appearOptions);

fadeElements.forEach(element => {
    element.classList.add('fade-in');
    appearOnScroll.observe(element);
});

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        navbar.classList.remove('scroll-up');
        return;
    }
    
    if (currentScroll > lastScroll && !navbar.classList.contains('scroll-down')) {
        navbar.classList.remove('scroll-up');
        navbar.classList.add('scroll-down');
    } else if (currentScroll < lastScroll && navbar.classList.contains('scroll-down')) {
        navbar.classList.remove('scroll-down');
        navbar.classList.add('scroll-up');
    }
    lastScroll = currentScroll;
});

// Form handling
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Add visual feedback
        const submitBtn = contactForm.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        
        // Simulate form submission (replace with actual form handling)
        setTimeout(() => {
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Sent!';
            contactForm.reset();
            
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
            }, 2000);
        }, 1500);
    });
}

// Terminal typing effect
const terminalContent = document.querySelector('.terminal-content');
if (terminalContent) {
    const lines = terminalContent.querySelectorAll('p');
    lines.forEach((line, index) => {
        line.style.opacity = '0';
        setTimeout(() => {
            line.style.opacity = '1';
            line.classList.add('typed');
        }, index * 500);
    });
}

// Project card hover effect
const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});

// Skill progress animation
const skillCategories = document.querySelectorAll('.skill-category');
skillCategories.forEach(category => {
    category.addEventListener('mouseenter', () => {
        category.classList.add('active');
    });
});
