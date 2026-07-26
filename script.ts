// Static script.ts for Ahmad Jabar's Portfolio Website
// Handles mobile navigation drawer, scroll states, and smooth scroll transitions

document.addEventListener("DOMContentLoaded", () => {
  const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
  const mobileDrawer = document.getElementById("mobile-drawer");
  const navLogo = document.getElementById("nav-logo");

  // Mobile menu toggle logic
  if (mobileMenuToggle && mobileDrawer) {
    mobileMenuToggle.addEventListener("click", () => {
      const isOpen = mobileDrawer.classList.contains("translate-x-0");
      if (isOpen) {
        mobileDrawer.classList.remove("translate-x-0");
        mobileDrawer.classList.add("translate-x-full");
      } else {
        mobileDrawer.classList.remove("translate-x-full");
        mobileDrawer.classList.add("translate-x-0");
      }
    });
  }

  // Smooth scroll logic for navigation buttons
  const scrollButtons = document.querySelectorAll("[data-scroll-to]");
  scrollButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-scroll-to");
      if (targetId) {
        // Close drawer if open on mobile
        if (mobileDrawer) {
          mobileDrawer.classList.remove("translate-x-0");
          mobileDrawer.classList.add("translate-x-full");
        }

        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          window.scrollTo({
            top: targetEl.offsetTop - 80,
            behavior: "smooth",
          });
        }
      }
    });
  });

  // Back to top click on logo
  if (navLogo) {
    navLogo.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Scroll Spy / Active link highlighting
  window.addEventListener("scroll", () => {
    const sections = ["about", "skills", "experience", "projects", "contact"];
    const scrollPosition = window.scrollY + 160;

    let activeSection = "";
    for (const section of sections) {
      const el = document.getElementById(section);
      if (el) {
        const top = el.offsetTop;
        const height = el.offsetHeight;
        if (scrollPosition >= top && scrollPosition < top + height) {
          activeSection = section;
          break;
        }
      }
    }

    // Highlight desktop links
    sections.forEach((section) => {
      const link = document.getElementById(`nav-link-${section}`);
      if (link) {
        if (section === activeSection) {
          link.classList.add("text-primary", "font-semibold");
          link.classList.remove("text-secondary-custom");
          // Ensure highlight bar matches
          let bar = link.querySelector(".active-bar");
          if (!bar) {
            bar = document.createElement("span");
            bar.className = "active-bar absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full";
            link.appendChild(bar);
          }
        } else {
          link.classList.remove("text-primary", "font-semibold");
          link.classList.add("text-secondary-custom");
          const bar = link.querySelector(".active-bar");
          if (bar) bar.remove();
        }
      }
    });
  });
});
