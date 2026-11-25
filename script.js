"use strict";

/* =========================================
   SAVANNAH BUSINESS HUB — DEMO PROTOTYPE
   All records are illustrative and stored
   only in this browser.
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    const $ = (selector, parent = document) => parent.querySelector(selector);
    const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

    /* -------------------------------------
       1. TOAST NOTIFICATIONS
    ------------------------------------- */

    const toast = $("#toast");
    let toastTimer;

    function showToast(message) {
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add("show");

        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toast.classList.remove("show");
        }, 2800);
    }

    /* -------------------------------------
       2. PAGE NAVIGATION
    ------------------------------------- */

    const pages = $$(".page");
    const nav = $("#main-nav");
    const menuToggle = $("#menu-toggle");

    function showPage(pageName, updateHash = true) {
        const target = $("#" + pageName);

        if (!target || !target.classList.contains("page")) {
            pageName = "home";
        }

        pages.forEach(page => {
            page.classList.toggle("active", page.id === pageName);
        });

        $$("[data-page]").forEach(link => {
            const isActive = link.dataset.page === pageName;
            link.classList.toggle("active", isActive);

            if (isActive) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });

        if (updateHash) {
            history.replaceState(null, "", "#" + pageName);
        }

        nav?.classList.remove("open");

        if (menuToggle) {
            menuToggle.setAttribute("aria-expanded", "false");
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    document.addEventListener("click", event => {
        const pageLink = event.target.closest("[data-page], [data-go]");

        if (!pageLink) return;

        const pageName = pageLink.dataset.page || pageLink.dataset.go;

        if (pageName) {
            event.preventDefault();
            showPage(pageName);
        }
    });

    menuToggle?.addEventListener("click", () => {
        const isOpen = nav?.classList.toggle("open") ?? false;
        menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    const initialPage = window.location.hash.replace("#", "");
    showPage(
        pages.some(page => page.id === initialPage) ? initialPage : "home",
        false
    );

    window.addEventListener("hashchange", () => {
        const pageName = window.location.hash.replace("#", "");
        if (pages.some(page => page.id === pageName)) {
            showPage(pageName, false);
        }
    });

    /* -------------------------------------
       3. MARKETPLACE SEARCH AND FILTERS
    ------------------------------------- */

    const productSearch = $("#product-search");
    const productCards = $$(".product-card");
    const categoryButtons = $$(".category-button");
    const noProducts = $("#no-products");

    let selectedCategory = "all";

    function filterProducts() {
        const searchTerm = (productSearch?.value || "").trim().toLowerCase();
        let visibleCount = 0;

        productCards.forEach(card => {
            const category = (card.dataset.category || "").toLowerCase();
            const name = (card.dataset.name || card.textContent).toLowerCase();

            const categoryMatches =
                selectedCategory === "all" ||
                category === selectedCategory;

            const searchMatches = name.includes(searchTerm);
            const isVisible = categoryMatches && searchMatches;

            card.hidden = !isVisible;

            if (isVisible) visibleCount++;
        });

        if (noProducts) {
            noProducts.hidden = visibleCount !== 0;
        }
    }

    productSearch?.addEventListener("input", filterProducts);

    categoryButtons.forEach(button => {
        button.addEventListener("click", () => {
            selectedCategory = (button.dataset.category || "all").toLowerCase();

            categoryButtons.forEach(item => {
                item.classList.toggle("active", item === button);
            });

            filterProducts();
        });
    });

    /* -------------------------------------
       4. PRODUCT ENQUIRY LIST
    ------------------------------------- */

    const enquiryCount = $("#enquiry-count");
    const enquiryList = $("#enquiry-list");
    const clearEnquiry = $("#clear-enquiry");

    const enquiries = new Map();

    function renderEnquiries() {
        if (enquiryCount) {
            enquiryCount.textContent = String(enquiries.size);
        }

        if (!enquiryList) return;

        enquiryList.replaceChildren();

        if (enquiries.size === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.className = "empty-message";
            emptyMessage.textContent = "Your enquiry list is empty.";
            enquiryList.appendChild(emptyMessage);
            return;
        }

        enquiries.forEach(productName => {
            const item = document.createElement("div");
            item.className = "enquiry-item";

            const name = document.createElement("span");
            name.textContent = productName;

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.className = "remove-enquiry";
            removeButton.textContent = "Remove";
            removeButton.setAttribute("aria-label", "Remove " + productName);

            removeButton.addEventListener("click", () => {
                enquiries.delete(productName);
                renderEnquiries();
                showToast("Item removed from your enquiry list.");
            });

            item.append(name, removeButton);
            enquiryList.appendChild(item);
        });
    }

    $$(".add-enquiry").forEach(button => {
        button.addEventListener("click", () => {
            const productName = button.dataset.product?.trim();

            if (!productName) return;

            if (enquiries.has(productName)) {
                showToast("That item is already in your enquiry list.");
                return;
            }

            enquiries.set(productName, productName);
            renderEnquiries();
            showToast("Added to your enquiry list.");
        });
    });

    clearEnquiry?.addEventListener("click", () => {
        enquiries.clear();
        renderEnquiries();
        showToast("Your enquiry list has been cleared.");
    });

    renderEnquiries();

    /* -------------------------------------
       5. STARTER PACKAGE SELECTION
    ------------------------------------- */

    $$(".package-action").forEach(button => {
        button.addEventListener("click", () => {
            const packageName = button.dataset.package || "this package";
            showToast(`You selected: ${packageName}. This is a demo selection.`);
        });
    });

    /* -------------------------------------
       6. SALON APPOINTMENT DEMO
    ------------------------------------- */

    const appointmentForm = $("#appointment-form");
    const appointmentList = $("#appointment-list");
    const appointmentFilter = $("#appointment-filter");

    const totalAppointments = $("#total-appointments");
    const confirmedAppointments = $("#confirmed-appointments");
    const pendingAppointments = $("#pending-appointments");

    const customerName = $("#customer-name");
    const customerPhone = $("#customer-phone");
    const serviceInput = $("#service");
    const appointmentDate = $("#appointment-date");
    const appointmentTime = $("#appointment-time");

    const STORAGE_KEY = "savannahPrototypeSalonAppointments";

    function localDateString(date = new Date()) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    if (appointmentDate) {
        appointmentDate.min = localDateString();
    }

    function makeSampleDate(daysFromToday) {
        const date = new Date();
        date.setDate(date.getDate() + daysFromToday);
        return localDateString(date);
    }

    const sampleAppointments = [
        {
            id: "demo-appointment-1",
            name: "Amina N.",
            phone: "0700000001",
            service: "Hair styling",
            date: makeSampleDate(0),
            time: "10:00",
            status: "Confirmed",
            demo: true
        },
        {
            id: "demo-appointment-2",
            name: "Wanjiku M.",
            phone: "0700000002",
            service: "Manicure",
            date: makeSampleDate(1),
            time: "14:00",
            status: "Pending",
            demo: true
        }
    ];

    let appointments = [];
    let storageAvailable = true;

    try {
        const savedAppointments = localStorage.getItem(STORAGE_KEY);

        if (savedAppointments === null) {
            appointments = sampleAppointments;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
        } else {
            const parsed = JSON.parse(savedAppointments);
            appointments = Array.isArray(parsed) ? parsed : sampleAppointments;
        }
    } catch (error) {
        storageAvailable = false;
        appointments = sampleAppointments;
    }

    function saveAppointments() {
        if (!storageAvailable) return;

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
        } catch (error) {
            storageAvailable = false;
            showToast("Browser storage is unavailable. Changes will last only for this session.");
        }
    }

    function formatDate(dateString) {
        if (!dateString) return "";

        const date = new Date(dateString + "T00:00:00");

        return new Intl.DateTimeFormat("en-KE", {
            day: "numeric",
            month: "short",
            year: "numeric"
        }).format(date);
    }

    function updateAppointmentStats() {
        if (totalAppointments) {
            totalAppointments.textContent = String(appointments.length);
        }

        if (confirmedAppointments) {
            confirmedAppointments.textContent = String(
                appointments.filter(item => item.status === "Confirmed").length
            );
        }

        if (pendingAppointments) {
            pendingAppointments.textContent = String(
                appointments.filter(item => item.status === "Pending").length
            );
        }
    }

    function createAppointmentCard(appointment) {
        const card = document.createElement("article");
        card.className = "appointment-card";

        const details = document.createElement("div");
        details.className = "appointment-info";

        const name = document.createElement("h4");
        name.textContent = appointment.name;

        const service = document.createElement("p");
        service.textContent = appointment.service;

        const contact = document.createElement("p");
        contact.textContent = appointment.phone;

        const dateTime = document.createElement("p");
        dateTime.textContent =
            `${formatDate(appointment.date)} at ${appointment.time}`;

        details.append(name, service, contact, dateTime);

        const controls = document.createElement("div");
        controls.className = "appointment-controls";

        const statusSelect = document.createElement("select");
        statusSelect.className = "appointment-status";
        statusSelect.setAttribute("aria-label", "Appointment status");

        ["Pending", "Confirmed", "Completed"].forEach(status => {
            const option = document.createElement("option");
            option.value = status;
            option.textContent = status;
            option.selected = appointment.status === status;
            statusSelect.appendChild(option);
        });

        statusSelect.addEventListener("change", () => {
            const record = appointments.find(item => item.id === appointment.id);
            if (!record) return;

            record.status = statusSelect.value;
            saveAppointments();
            renderAppointments();
            showToast("Appointment status updated.");
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-appointment";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", () => {
            appointments = appointments.filter(
                item => item.id !== appointment.id
            );

            saveAppointments();
            renderAppointments();
            showToast("Appointment removed.");
        });

        controls.append(statusSelect, deleteButton);
        card.append(details, controls);

        return card;
    }

    function renderAppointments() {
        if (!appointmentList) return;

        appointmentList.replaceChildren();

        const filter = appointmentFilter?.value || "all";
        const today = localDateString();

        const filteredAppointments = appointments
            .filter(item => {
                if (filter === "today") return item.date === today;
                if (filter === "pending") return item.status === "Pending";
                if (filter === "confirmed") return item.status === "Confirmed";
                if (filter === "completed") return item.status === "Completed";
                return true;
            })
            .sort((a, b) => {
                const first = `${a.date}T${a.time}`;
                const second = `${b.date}T${b.time}`;
                return first.localeCompare(second);
            });

        if (filteredAppointments.length === 0) {
            const empty = document.createElement("p");
            empty.className = "empty-message";
            empty.textContent = "No appointments match this filter.";
            appointmentList.appendChild(empty);
        } else {
            filteredAppointments.forEach(appointment => {
                appointmentList.appendChild(
                    createAppointmentCard(appointment)
                );
            });
        }

        updateAppointmentStats();
    }

    appointmentFilter?.addEventListener("change", renderAppointments);

    appointmentForm?.addEventListener("submit", event => {
        event.preventDefault();

        const name = customerName?.value.trim() || "";
        const phone = customerPhone?.value.trim() || "";
        const service = serviceInput?.value.trim() || "";
        const date = appointmentDate?.value || "";
        const time = appointmentTime?.value || "";

        if (!name || !phone || !service || !date || !time) {
            showToast("Please complete all appointment fields.");
            return;
        }

        if (date < localDateString()) {
            showToast("Please choose today or a future date.");
            return;
        }

        const newAppointment = {
            id: (window.crypto?.randomUUID?.() || `appointment-${Date.now()}`),
            name,
            phone,
            service,
            date,
            time,
            status: "Pending",
            demo: true
        };

        appointments.push(newAppointment);
        saveAppointments();

        appointmentForm.reset();

        if (appointmentDate) {
            appointmentDate.min = localDateString();
        }

        if (appointmentFilter) {
            appointmentFilter.value = "all";
        }

        renderAppointments();
        showToast("Demo appointment added successfully.");
    });

    renderAppointments();

    /* -------------------------------------
       7. INITIALISE FILTERED PRODUCTS
    ------------------------------------- */

    filterProducts();

    console.info("Savannah Business Hub prototype loaded.");
});
