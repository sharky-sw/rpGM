
/* =========================================
   01. ELEMENTS
========================================= */

const body = document.body;

const hero = document.getElementById("hero");

const locationsPage = document.getElementById("locationsPage");

const exploreButton = document.getElementById("exploreButton");

const exitButton = document.getElementById("exitButton");

const backToTop = document.getElementById("backToTop");

const accordionItems = document.querySelectorAll(".location-item");

const locationHeaders = document.querySelectorAll(".location-header");


/* =========================================
   02. SETTINGS
========================================= */

const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
);

const TRANSITION_DELAY = prefersReducedMotion.matches ? 0 : 150;


/* =========================================
   03. SCROLL LOCK
========================================= */

let isScrollLocked = true;

let touchStartY = 0;


/*
    The page starts locked.

    User cannot manually scroll using:
    - Mouse wheel
    - Touch gestures
    - Keyboard
    - Spacebar
    - Page navigation keys

    Programmatic scrolling remains available.
*/

function lockScrolling() {
    isScrollLocked = true;

    body.classList.add("is-locked");
}


function unlockScrolling() {
    isScrollLocked = false;

    body.classList.remove("is-locked");
}


/* =========================================
   04. PREVENT MOUSE WHEEL SCROLLING
========================================= */

window.addEventListener(
    "wheel",
    function (event) {

        if (!isScrollLocked) {
            return;
        }

        event.preventDefault();

    },
    { passive: false }
);


/* =========================================
   05. PREVENT TOUCH SCROLLING
========================================= */

window.addEventListener(
    "touchstart",
    function (event) {

        if (!isScrollLocked) {
            return;
        }

        touchStartY = event.touches[0].clientY;

    },
    { passive: true }
);


window.addEventListener(
    "touchmove",
    function (event) {

        if (!isScrollLocked) {
            return;
        }

        const currentY = event.touches[0].clientY;

        const difference = currentY - touchStartY;

        if (Math.abs(difference) > 0) {
            event.preventDefault();
        }

    },
    { passive: false }
);


/* =========================================
   06. PREVENT KEYBOARD SCROLLING
========================================= */

window.addEventListener("keydown", function (event) {

    if (!isScrollLocked) {
        return;
    }

    const blockedKeys = [
        "ArrowDown",
        "ArrowUp",
        "PageDown",
        "PageUp",
        "Home",
        "End",
        " "
    ];

    if (blockedKeys.includes(event.key)) {
        event.preventDefault();
    }

});


/* =========================================
   07. SMOOTH SCROLL HELPER
========================================= */

function smoothScrollTo(element) {

    const behavior = prefersReducedMotion.matches
        ? "instant"
        : "smooth";

    element.scrollIntoView({
        behavior: behavior,
        block: "start"
    });

}


/* =========================================
   08. ENTER LOCATIONS PAGE
========================================= */

let navigationInProgress = false;


function enterLocations() {

    if (navigationInProgress) {
        return;
    }

    navigationInProgress = true;

    /*
        First unlock scrolling.
        This allows the browser to perform
        the smooth transition.
    */

    unlockScrolling();

    /*
        Small delay allows the click animation
        to begin before navigation.
    */

    window.setTimeout(function () {

        smoothScrollTo(locationsPage);

        window.setTimeout(function () {

            navigationInProgress = false;

        }, prefersReducedMotion.matches ? 50 : 1000);

    }, TRANSITION_DELAY);

}


exploreButton.addEventListener("click", enterLocations);


/* =========================================
   09. RETURN TO HERO
========================================= */

function returnToHero() {

    if (navigationInProgress) {
        return;
    }

    navigationInProgress = true;

    /*
        Lock manual interaction immediately.
        Programmatic scrolling is not blocked.
    */

    lockScrolling();

    /*
        Return smoothly to the hero.
    */

    smoothScrollTo(hero);

    /*
        Wait until the transition is complete.
    */

    window.setTimeout(function () {

        /*
            Ensure exact initial position.
        */

        window.scrollTo({
            top: 0,
            behavior: "instant"
        });

        navigationInProgress = false;

    }, prefersReducedMotion.matches ? 50 : 1000);

}


exitButton.addEventListener("click", returnToHero);


/* =========================================
   10. BACK TO TOP
========================================= */

backToTop.addEventListener("click", function (event) {

    event.preventDefault();

    smoothScrollTo(locationsPage);

});


/* =========================================
   11. INDEPENDENT ACCORDION
========================================= */

/*
    Each location has its own independent state.

    Opening one location does not close
    any of the other locations.
*/


function toggleLocation(item) {

    const header = item.querySelector(".location-header");

    const panel = item.querySelector(".location-panel");

    const isCurrentlyOpen = item.classList.contains("is-open");

    /*
        Toggle only the clicked location.
    */

    if (isCurrentlyOpen) {

        item.classList.remove("is-open");

        header.setAttribute("aria-expanded", "false");

        panel.setAttribute("aria-hidden", "true");

    } else {

        item.classList.add("is-open");

        header.setAttribute("aria-expanded", "true");

        panel.setAttribute("aria-hidden", "false");

    }

}


/* =========================================
   12. ACCORDION EVENT LISTENERS
========================================= */

locationHeaders.forEach(function (header) {

    header.addEventListener("click", function () {

        const item = header.closest(".location-item");

        toggleLocation(item);

    });

});


/* =========================================
   13. INITIAL ACCORDION STATE
========================================= */

accordionItems.forEach(function (item) {

    const header = item.querySelector(".location-header");

    const panel = item.querySelector(".location-panel");

    item.classList.remove("is-open");

    header.setAttribute("aria-expanded", "false");

    panel.setAttribute("aria-hidden", "true");

});


/* =========================================
   14. GALLERY MOUSE DRAG
========================================= */

/*
    Allows desktop users to drag galleries
    horizontally with the mouse.

    Native trackpad scrolling remains available.
*/

const galleries = document.querySelectorAll(".gallery");


galleries.forEach(function (gallery) {

    let isDragging = false;

    let startX = 0;

    let scrollStart = 0;

    let hasMoved = false;


    gallery.addEventListener("mousedown", function (event) {

        if (event.button !== 0) {
            return;
        }

        isDragging = true;

        hasMoved = false;

        startX = event.pageX;

        scrollStart = gallery.scrollLeft;

        gallery.classList.add("is-dragging");

    });


    window.addEventListener("mousemove", function (event) {

        if (!isDragging) {
            return;
        }

        const distance = event.pageX - startX;

        if (Math.abs(distance) > 4) {
            hasMoved = true;
        }

        if (hasMoved) {
            gallery.scrollLeft = scrollStart - distance;
        }

    });


    function stopDragging() {

        isDragging = false;

        gallery.classList.remove("is-dragging");

    }


    window.addEventListener("mouseup", stopDragging);

    window.addEventListener("blur", stopDragging);


    /*
        Prevent image dragging from opening
        browser's native image drag behavior.
    */

    gallery.querySelectorAll("img").forEach(function (image) {

        image.addEventListener("dragstart", function (event) {

            event.preventDefault();

        });

    });

});


/* =========================================
   15. INITIAL PAGE STATE
========================================= */

function initializeWebsite() {

    /*
        Always begin at the top.
    */

    window.scrollTo({
        top: 0,
        behavior: "instant"
    });

    /*
        Lock the page until the visitor
        clicks the main button.
    */

    lockScrolling();

    /*
        Ensure all accordions are closed.
    */

    accordionItems.forEach(function (item) {

        item.classList.remove("is-open");

        const header = item.querySelector(".location-header");

        const panel = item.querySelector(".location-panel");

        header.setAttribute("aria-expanded", "false");

        panel.setAttribute("aria-hidden", "true");

    });

}


/* =========================================
   16. INITIALIZATION
========================================= */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeWebsite,
        { once: true }
    );

} else {

    initializeWebsite();

}


/* =========================================
   17. HANDLE PAGE VISIBILITY
========================================= */

document.addEventListener("visibilitychange", function () {

    /*
        If the visitor switches back to the page
        while still on the hero, preserve the
        initial locked state.
    */

    if (
        document.visibilityState === "visible" &&
        window.scrollY < 5 &&
        !navigationInProgress
    ) {

        /*
            Do not unexpectedly unlock the hero.
        */

        if (body.classList.contains("is-locked")) {
            isScrollLocked = true;
        }

    }

});
