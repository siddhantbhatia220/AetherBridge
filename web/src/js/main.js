import { bridge } from '../../../sdk/index.ts';

document.addEventListener('DOMContentLoaded', () => {
    console.log("%c AetherBridge Demo Initialized ", "background: #7c3aed; color: #fff; border-radius: 4px; padding: 2px 6px;");

    // --- Toast System ---
    const toastContainer = document.getElementById('toast-container');
    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `<span>${type === 'success' ? '⚡' : '❌'}</span> ${message}`;
        toastContainer.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
    }

    // --- Photo Extractor Logic ---
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const gallery = document.getElementById('gallery');
    const actionBar = document.getElementById('action-bar');
    const btnExtract = document.getElementById('btn-extract');
    const btnDownload = document.getElementById('btn-download');
    const resultsTable = document.getElementById('results-table');
    const resultsBody = document.getElementById('results-body');

    let selectedFiles = [];
    let extractedData = [];

    if (dropZone) {
        dropZone.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', (e) => {
            handleFiles(e.target.files);
        });

        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.style.borderColor = 'var(--primary)';
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.style.borderColor = 'var(--border)';
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
        });
    }

    function handleFiles(files) {
        selectedFiles = Array.from(files).slice(0, 50);
        gallery.innerHTML = '';
        
        selectedFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const item = document.createElement('div');
                item.className = 'gallery-item';
                item.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                gallery.appendChild(item);
            };
            reader.readAsDataURL(file);
        });

        if (selectedFiles.length > 0) {
            actionBar.style.display = 'flex';
            showToast(`${selectedFiles.length} images staged for extraction.`);
        }
    }

    if (btnExtract) {
        btnExtract.addEventListener('click', async () => {
            btnExtract.innerText = 'Extracting...';
            btnExtract.disabled = true;

            try {
                const base64Images = await Promise.all(selectedFiles.map(file => {
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (e) => resolve(e.target.result);
                        reader.readAsDataURL(file);
                    });
                }));

                showToast("Sending images to AetherAI Bridge...", "success");
                extractedData = await bridge.ai.extractDataFromImages({ images: base64Images });
                
                renderResults(extractedData);
                btnDownload.style.display = 'block';
                resultsTable.style.display = 'block';
                showToast("Extraction complete! Segregated name and phone numbers.", "success");
            } catch (e) {
                console.error("Extraction failed:", e);
                showToast("Extraction failed. Ensure the Shadow Kernel is running.", "error");
            } finally {
                btnExtract.innerText = 'Extract Data';
                btnExtract.disabled = false;
            }
        });
    }

    function renderResults(data) {
        resultsBody.innerHTML = '';
        data.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.name}</td>
                <td>${item.phone}</td>
                <td><span class="confidence-badge">High</span></td>
            `;
            resultsBody.appendChild(tr);
        });
    }

    if (btnDownload) {
        btnDownload.addEventListener('click', async () => {
            try {
                showToast("Generating Excel file via AetherData...", "success");
                const res = await fetch('http://localhost:3000/data/export-excel', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data: extractedData })
                });
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'extracted_data.xlsx';
                document.body.appendChild(a);
                a.click();
                a.remove();
                showToast("Download started!", "success");
            } catch (e) {
                console.error("Download failed:", e);
                showToast("Failed to generate Excel file.", "error");
            }
        });
    }

    // --- Hero Demo ---
    const heroBtn = document.querySelector('.btn-primary-lg');
    if (heroBtn) {
        heroBtn.addEventListener('click', async () => {
            showToast("Initializing Payment Bridge...", "success");
            try {
                const res = await bridge.pay.initializePayment({ amount: 99, currency: 'USD' });
                showToast(`Payment Intent created: ${res.id}`, "success");
            } catch (e) {
                showToast("Kernel not reachable.", "error");
            }
        });
    }

    // --- Custom Cursor Logic (Non-blocking) ---
    const cursor = document.getElementById('custom-cursor');
    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        // Add hover effect for interactive elements
        document.querySelectorAll('button, a, .upload-zone').forEach(el => {
            el.addEventListener('mouseenter', () => cursor.style.transform = 'scale(2)');
            el.addEventListener('mouseleave', () => cursor.style.transform = 'scale(1)');
        });
    }
});
