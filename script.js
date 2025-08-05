document.addEventListener("DOMContentLoaded", () => {
    // --- ELEMENT SELECTIONS ---
    const calculatorView = document.getElementById("calculator-view");
    const resultsView = document.getElementById("results-view");
    const calculatorForm = document.getElementById("calculator-form");
    const contactForm = document.getElementById("contact-form");
    const contactSubmitButton = document.getElementById("contact-submit-button");
    const backButton = document.getElementById("back-to-calculator");
    const edvValueElement = document.getElementById("edv-value");
    const submitErrorAlert = document.getElementById("submit-error-alert");
    const submitErrorMessage = document.getElementById("submit-error-message");
    const thankYouFooter = document.getElementById("thank-you-footer");
    const contactFormSection = document.getElementById("contact-form-section");
    const resultsNote = document.getElementById("results-note");
    const currentDateEl = document.getElementById("currentDate");
    
    // Input fields
    const preAccidentValueInput = document.getElementById("preAccidentValue");
    const repairCostsInput = document.getElementById("repairCosts");
    const vehicleYearInput = document.getElementById("vehicleYear");
    const contactPhoneInput = document.getElementById("contact-phone");

    // --- STATE MANAGEMENT ---
    let edv = null;
    let calculationData = null;

    // --- INITIALIZATION ---
    if (currentDateEl) {
        const date = new Date();
        currentDateEl.textContent = `The data is current per ${date.toLocaleDateString("en-US", { month: "long", year: "numeric" })}.`;
    }

    // --- HELPER FUNCTIONS ---
    function formatPhoneNumber(value) {
        const phoneNumber = value.replace(/\D/g, "");
        if (phoneNumber.length <= 3) return phoneNumber;
        if (phoneNumber.length <= 6) return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
        return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }

    function formatCurrency(value) {
        const numericValue = value.replace(/[^0-9]/g, "");
        if (numericValue) {
            return Number.parseInt(numericValue, 10).toLocaleString("en-US");
        }
        return "";
    }

    function getNumericValue(value) {
        return Number(value.replace(/[^0-9]/g, "")) || 0;
    }

    function clearErrorMessages() {
        document.querySelectorAll('.form-message').forEach(el => el.textContent = '');
    }

    // --- CORE LOGIC ---
    function calculateDiminishedValue(data) {
        const { preAccidentValue, vehicleYear, repairCosts } = data;
        const repairPercentage = repairCosts / preAccidentValue;
        let damageMultiplier = 0.1;
        if (repairPercentage > 0.05) damageMultiplier = 0.2;
        if (repairPercentage > 0.1) damageMultiplier = 0.3;
        if (repairPercentage > 0.2) damageMultiplier = 0.4;
        if (repairPercentage > 0.3) damageMultiplier = 0.5;

        const currentYear = new Date().getFullYear();
        const vehicleAge = currentYear - vehicleYear;
        let ageMultiplier = 1.0;
        if (vehicleAge > 1) ageMultiplier = 0.9;
        if (vehicleAge > 3) ageMultiplier = 0.8;
        if (vehicleAge > 5) ageMultiplier = 0.7;
        if (vehicleAge > 7) ageMultiplier = 0.6;
        if (vehicleAge > 10) ageMultiplier = 0.4;

        const baseCalculatedEdv = preAccidentValue * damageMultiplier * ageMultiplier;
        const calculatedEdv = baseCalculatedEdv * 0.4;
        return Math.round(calculatedEdv);
    }
    
    function validateCalculatorForm(data) {
        clearErrorMessages();
        let isValid = true;
        const currentYear = new Date().getFullYear();

        if (!data.preAccidentValue || data.preAccidentValue <= 0) {
            document.getElementById('preAccidentValue-error').textContent = 'Value is required and must be positive.';
            isValid = false;
        }
        if (!data.repairCosts || data.repairCosts <= 0) {
            document.getElementById('repairCosts-error').textContent = 'Value is required and must be positive.';
            isValid = false;
        }
        if (data.vehicleYear < 1990 || data.vehicleYear > currentYear) {
            document.getElementById('vehicleYear-error').textContent = `Year must be between 1990 and ${currentYear}.`;
            isValid = false;
        }
        return isValid;
    }
    
    function validateContactForm(data) {
        clearErrorMessages();
        let isValid = true;
        
        if (data.firstName.length < 2) {
             document.getElementById('firstName-error').textContent = 'First name must be at least 2 characters.';
             isValid = false;
        }
        if (data.lastName.length < 2) {
             document.getElementById('lastName-error').textContent = 'Last name must be at least 2 characters.';
             isValid = false;
        }
        if (data.phone.replace(/\D/g, '').length < 10) {
             document.getElementById('phone-error').textContent = 'Please enter a valid 10-digit phone number.';
             isValid = false;
        }
        return isValid;
    }


    // --- EVENT HANDLERS ---
    calculatorForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const formData = new FormData(calculatorForm);
        const data = {
            preAccidentValue: getNumericValue(formData.get("preAccidentValue")),
            vehicleYear: Number(formData.get("vehicleYear")),
            repairCosts: getNumericValue(formData.get("repairCosts")),
        };

        if (!validateCalculatorForm(data)) return;

        calculationData = data;
        edv = calculateDiminishedValue(data);
        edvValueElement.textContent = `$${edv.toLocaleString()}`;

        // Switch views
        calculatorView.classList.add("hidden");
        resultsView.classList.remove("hidden");
        window.scrollTo(0, 0);
    });

    backButton.addEventListener("click", () => {
        resultsView.classList.add("hidden");
        calculatorView.classList.remove("hidden");
    });
    
    contactForm.addEventListener("submit", (e) => {
        e.preventDefault();
        
        // Toggle submitting state
        contactSubmitButton.disabled = true;
        contactSubmitButton.querySelector('span:first-child').classList.add('hidden');
        contactSubmitButton.querySelector('span:last-child').classList.remove('hidden');
        submitErrorAlert.classList.add('hidden');

        const contactData = {
            firstName: document.getElementById('contact-first-name').value,
            lastName: document.getElementById('contact-last-name').value,
            phone: document.getElementById('contact-phone').value,
            year: calculationData.vehicleYear
        };

        if (!validateContactForm(contactData)) {
            contactSubmitButton.disabled = false;
            contactSubmitButton.querySelector('span:first-child').classList.remove('hidden');
            contactSubmitButton.querySelector('span:last-child').classList.add('hidden');
            return;
        }

        // Use the traditional form submission logic
        const form = document.createElement("form");
        form.method = "POST";
        form.action = "https://lawyerup.leaddocket.com/opportunities/form/12";
        form.target = "_blank";

        const fields = {
            "First": contactData.firstName,
            "Last": contactData.lastName,
            "Phone": formatPhoneNumber(contactData.phone),
            "Year": contactData.year,
            "Pre-Accident Value": calculationData.preAccidentValue,
            "Approximate Repair Cost": calculationData.repairCosts,
            "Diminished Value": edv
        };
        
        for (const key in fields) {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = key;
            input.value = fields[key];
            form.appendChild(input);
        }

        document.body.appendChild(form);
        form.submit();
        
        // Update UI to show success
        contactFormSection.classList.add('hidden');
        resultsNote.classList.add('hidden');
        thankYouFooter.classList.remove('hidden');
        
        // Clean up the dynamically created form
        setTimeout(() => document.body.removeChild(form), 100);
    });

    // Auto-formatting input listeners
    [preAccidentValueInput, repairCostsInput].forEach(input => {
        input.addEventListener('input', (e) => {
            e.target.value = formatCurrency(e.target.value);
        });
    });

    contactPhoneInput.addEventListener('input', (e) => {
        e.target.value = formatPhoneNumber(e.target.value);
    });
});