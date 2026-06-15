document.addEventListener('DOMContentLoaded', () => {
    // 1. Data Setup for Dynamic Table Generation
    const masalah = [
        "1. Tidak ada sistem monitoring & pengendalian PBJ berbasis data (dikonfirmasi 3 LHP BPKP 2025)",
        "2. Kepatuhan dokumentasi & input SPSE rendah",
        "3. Integritas proses & disiplin belanja lemah",
        "4. Kapasitas SDM PBJ belum memadai"
    ];

    const dimensi = [
        { kode: "U", nama: "Urgency", tanya: "Seberapa mendesak masalah ini harus segera ditangani?" },
        { kode: "S", nama: "Seriousness", tanya: "Seberapa serius dampak yang ditimbulkan jika masalah ini dibiarkan?" },
        { kode: "G", nama: "Growth", tanya: "Seberapa besar kemungkinan masalah ini berkembang jika tidak ditangani?" }
    ];

    const container = document.getElementById('penilaianContainer');
    let htmlContent = '';

    dimensi.forEach((d, dIdx) => {
        // Add animation delay based on index for staggered entrance
        htmlContent += `<div class="table-container" style="animation-delay: ${dIdx * 0.2}s">`;
        htmlContent += `
            <div class="table-header">
                <h4>${d.kode} — ${d.nama}</h4>
                <p>${d.tanya}</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th style="width: 45%; text-align: left;">Pernyataan / Indikator</th>
                        <th>1</th>
                        <th>2</th>
                        <th>3</th>
                        <th>4</th>
                        <th>5</th>
                    </tr>
                </thead>
                <tbody>
        `;

        masalah.forEach((m, idx) => {
            htmlContent += `<tr>
                <td class="text-left">${m}</td>`;
            for (let i = 1; i <= 5; i++) {
                htmlContent += `
                    <td data-label="${i}">
                        <div class="radio-group">
                            <input type="radio" name="${d.kode}_Q${idx + 1}" value="${i}" required aria-label="Nilai ${i} untuk ${m}">
                        </div>
                    </td>`;
            }
            htmlContent += `</tr>`;
        });

        htmlContent += `</tbody></table></div>`;
    });

    container.innerHTML = htmlContent;

    // 2. Set auto date to today
    const dateInput = document.getElementById('tanggal');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }

    // 3. Toggle 'Jabatan Lainnya' field
    const jabatanSelect = document.getElementById('jabatan');
    const jabatanLainnyaGroup = document.getElementById('jabatanLainnyaGroup');
    const jabatanLainnyaInput = document.getElementById('jabatanLainnya');

    if (jabatanSelect) {
        jabatanSelect.addEventListener('change', function () {
            if (this.value === 'Lainnya') {
                jabatanLainnyaGroup.style.display = 'block';
                // Trigger reflow to restart animation
                jabatanLainnyaGroup.style.animation = 'none';
                jabatanLainnyaGroup.offsetHeight;
                jabatanLainnyaGroup.style.animation = 'fadeInUp 0.4s ease forwards';
                jabatanLainnyaInput.required = true;
            } else {
                jabatanLainnyaGroup.style.display = 'none';
                jabatanLainnyaInput.required = false;
                jabatanLainnyaInput.value = '';
            }
        });
    }

    // 4. Intersection Observer for Scroll Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                // Optional: unobserve if you only want animation to happen once
                // observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-section').forEach(section => {
        sectionObserver.observe(section);
    });

    // 5. Form Submission Handling
    const surveiForm = document.getElementById('surveiForm');
    const submitBtn = document.querySelector('.btn-submit');
    const modal = document.getElementById('successModal');
    const closeModal = document.getElementById('closeModal');

    if (surveiForm) {
        surveiForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Add loading state
            submitBtn.classList.add('loading');

            // Siapkan data dari form
            const formData = new FormData(surveiForm);
            // Konversi FormData ke URLSearchParams agar mudah dibaca oleh Google Apps Script (e.parameter)
            const urlEncodedData = new URLSearchParams(formData);

            // GANTI URL DI BAWAH INI DENGAN URL WEB APP GOOGLE APPS SCRIPT ANDA
            const googleScriptURL = 'https://script.google.com/macros/s/AKfycbzB371AZ1M6dOlBvWGmzf-yMQGtnStCJGRYZ5xuhiozAvoI_z2PIWtyFhom9zin9fIG1A/exec';

            if (!googleScriptURL || googleScriptURL === 'https://script.google.com/macros/s/AKfycbzB371AZ1M6dOlBvWGmzf-yMQGtnStCJGRYZ5xuhiozAvoI_z2PIWtyFhom9zin9fIG1A/exec') {
                // Fallback untuk demo jika URL belum diganti
                setTimeout(() => {
                    handleSuccess(surveiForm);
                }, 1500);
            } else {
                // Kirim data ke Google Sheets
                // Gunakan mode no-cors untuk menghindari pemblokiran CORS dari browser saat redirect
                fetch(googleScriptURL, {
                    method: 'POST',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: urlEncodedData
                })
                    .then(() => {
                        // Dalam mode no-cors, kita tidak bisa membaca response.ok, tapi jika promise resolve berarti request terkirim
                        handleSuccess(surveiForm);
                    })
                    .catch(error => {
                        console.error('Error!', error.message);
                        alert('Terjadi kesalahan saat mengirim data. Silakan cek koneksi Anda dan coba lagi.');
                        submitBtn.classList.remove('loading');
                    });
            }
        });
    }

    function handleSuccess(formElement) {
        submitBtn.classList.remove('loading');

        // Show modal
        modal.classList.add('show');

        // Reset form
        formElement.reset();

        // Restore default states
        dateInput.valueAsDate = new Date();
        jabatanLainnyaGroup.style.display = 'none';
        jabatanLainnyaInput.required = false;

        // Reset scroll to top smoothly
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Close Modal Events
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            modal.classList.remove('show');
        });
    }

    // Close modal if clicking outside content
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
});
