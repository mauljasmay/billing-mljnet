// Global variable to hold voucher data for printing
window.vouchersToPrint = {};

// Template for Model 1 (Simple)
function getModel1VoucherHTML(voucher, price, companyHeader, adminKontak) {
    const colors = { '5000': '#1433FD', '10000': '#663399', '20000': '#0000FF', '50000': '#FF8C00' };
    const color = colors[price] || '#FF69B4';
    const formattedPrice = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);

    return `
        <div style="border: 1px solid ${color}; border-radius: 5px; margin: 4px; padding: 5px; width: 220px; text-align: center; font-family: 'Courier New', monospace; page-break-inside: avoid; background-color: #fff;">
            <div style="font-weight: bold; font-size: 14px;">${companyHeader}</div>
            <div style="font-size: 12px; margin: 5px 0;">Paket ${formattedPrice}</div>
            <div style="border: 1px solid ${color}; border-radius: 5px; padding: 8px; margin: 5px 0; font-weight: bold; font-size: 16px;">
                ${voucher.username}
            </div>
            <div style="font-size: 10px;">Login: ${voucher.username}</div>
            ${voucher.username !== voucher.password ? `<div style="font-size: 10px;">Pass: ${voucher.password}</div>` : ''}
            <div style="font-size: 10px; margin-top: 5px;">Kontak: ${adminKontak}</div>
        </div>
    `;
}

// Template for Model 2 (Standard)
function getModel2VoucherHTML(voucher, price, companyHeader, adminKontak) {
    const color = '#bf0000';
    const formattedPrice = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(price);
    return `
        <div style="border: 1px solid ${color}; border-radius: 4px; text-align: center; font-size: 12px; font-weight:bold; width: 245px; margin: 4px; page-break-inside: avoid; background-color: #f2f2f2;">
            <div style="background-color: #E6E6E6; border: 1px solid ${color}; border-radius: 4px; padding: 5px;">
                <div style="font-size: 16px; font-weight: bold;">${companyHeader}</div>
            </div>
            <div style="font-weight:bold; font-size:28px; color:#555; margin-top: 5px;">
                <small style="font-size:18px;">Rp</small>${formattedPrice}
            </div>
            <div style="font-weight:bold; color:#555; font-size:13px;">Kode Voucher</div>
            <div style="border: 1px solid #000; border-radius: 6px; font-weight:bold; font-size:22px; color: #FFF; background-color: ${color}; margin: 5px; padding: 5px;">
                ${voucher.username}
            </div>
            <div style="font-size: 10px;">Login dengan kode di atas</div>
             ${voucher.username !== voucher.password ? `<div style="font-size: 10px;">Password: ${voucher.password}</div>` : ''}
            <div style="font-size: 10px; margin-top: 5px;">${adminKontak}</div>
        </div>
    `;
}

// Template for Default Model
function getDefaultVoucherHTML(voucher, price, companyHeader, adminKontak) {
    const priceValue = typeof price === 'string' ? parseInt(price) || 0 : price || 0;
    const formattedPrice = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(priceValue);

    const header = companyHeader || 'Nama Hotspot';
    const contact = adminKontak || 'Kontak Admin';

    return `
        <div class="voucher-card">
            <div class="header">${header}</div>
            <div class="price">${formattedPrice}</div>
            <div class="login-info">
                <div>Login: @hotspot</div>
                <div class="credentials">
                    <div class="username">${voucher.username}</div>
                    ${voucher.username !== voucher.password ?
                        `<div class="password">Pass: ${voucher.password}</div>` : ''}
                </div>
            </div>
            <div class="footer">Hubungi: ${contact}</div>
        </div>
    `;
}

function printVouchers() {
    if (!window.vouchersToPrint || !window.vouchersToPrint.vouchers || window.vouchersToPrint.vouchers.length === 0) {
        alert('Tidak ada data voucher untuk dicetak.');
        return;
    }

    const { vouchers, price, model } = window.vouchersToPrint;
    const companyHeader = document.body.getAttribute('data-company-header') || 'Nama Hotspot';
    const adminKontak = document.body.getAttribute('data-admin-kontak') || 'Kontak Admin';

    let content = '<div class="voucher-container">';
    vouchers.forEach((voucher, index) => {
        let voucherHTML = '';
        switch (model) {
            case 'model1':
                voucherHTML = getModel1VoucherHTML(voucher, price, companyHeader, adminKontak);
                break;
            case 'model2':
                voucherHTML = getModel2VoucherHTML(voucher, price, companyHeader, adminKontak);
                break;
            default:
                voucherHTML = getDefaultVoucherHTML(voucher, price, companyHeader, adminKontak);
        }
        if (index > 0 && index % 8 === 0) {
            content += '<div class="page-break"></div>';
        }
        content += voucherHTML;
    });
    content += '</div>';

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Cetak Voucher</title>
            <meta charset="UTF-8">
            <style>
                @page { size: A4; margin: 0.5cm; }
                @media print {
                    body {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        margin: 0; padding: 0;
                    }
                    .voucher-container { page-break-after: always; page-break-inside: avoid; }
                    .page-break { page-break-after: always; break-after: page; }
                }
                body {
                    font-family: Arial, sans-serif;
                    margin: 0; padding: 0.5cm;
                    width: 21cm; min-height: 29.7cm;
                    box-sizing: border-box;
                }
                .voucher-container {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 0.5cm; width: 100%;
                }
                .voucher-card {
                    width: 100%; border: 1px solid #ccc;
                    border-radius: 10px; padding: 10px;
                    box-sizing: border-box; break-inside: avoid;
                    page-break-inside: avoid; background-color: #fff;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                .header {
                    font-weight: bold; font-size: 0.9em; color: #fff;
                    background-color: #007bff; padding: 8px;
                    border-radius: 5px 5px 0 0;
                    margin: -10px -10px 10px -10px;
                }
                .price {
                    font-size: 1em; font-weight: bold; margin: 5px 0; color: #333;
                }
                .login-info { margin: 8px 0; font-size: 0.8em; }
                .credentials {
                    border: 1px dashed #666; padding: 5px; margin: 8px 0;
                    background-color: #f9f9f9; border-radius: 4px;
                }
                .username { font-size: 1.1em; font-weight: bold; word-break: break-all; }
                .password { font-size: 0.9em; color: #555; word-break: break-all; }
                .footer {
                    font-size: 0.8em; margin-top: 8px; color: #666;
                    border-top: 1px solid #eee; padding-top: 5px;
                }
            </style>
        </head>
        <body onload="window.print();">${content}</body>
        </html>
    `);
    printWindow.document.close();
}

document.addEventListener('DOMContentLoaded', function () {
    // Fungsi untuk memuat data user hotspot aktif dengan optimasi
    function loadActiveUsers() {
        if (isLoading) {
            console.log('Sedang loading, skip request...');
            return;
        }

        isLoading = true;
        console.log('Memulai fetch data active users...');

        // Tambahkan timeout untuk request
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 detik timeout

        fetch('/admin/hotspot/active-users', {
            signal: controller.signal
        })
            .then(response => {
                clearTimeout(timeoutId);
                console.log('Response status:', response.status);
                return response.json();
            })
            .then(data => {
                isLoading = false;
                console.log('Data yang diterima:', data);
                const tableBody = document.getElementById('activeUsersTableBody');
                const activeUserCountInfo = document.getElementById('activeUserCountInfo');

                // Check if elements exist before proceeding
                if (!tableBody) {
                    console.warn('activeUsersTableBody element not found');
                    return;
                }
                let activeUsers = [];
                if (data.success && data.activeUsersList && Array.isArray(data.activeUsersList)) {
                    activeUsers = data.activeUsersList;
                } else if (data.success && data.data && Array.isArray(data.data)) {
                    activeUsers = data.data;
                }
                if (activeUsers.length > 0) {
                    // Limit data yang ditampilkan untuk performa (max 50 users)
                    const maxDisplayUsers = 50;
                    const limitedUsers = activeUsers.slice(0, maxDisplayUsers);

                    // Sorting dengan optimasi
                    const sortedUsers = limitedUsers.sort((a, b) => {
                        const getSeconds = (uptimeStr) => {
                            if (!uptimeStr) return 0;
                            // Simplified parsing untuk performa
                            const match = uptimeStr.match(/(\d+)([dhms])/g);
                            if (!match) return 0;
                            let total = 0;
                            match.forEach(part => {
                                const num = parseInt(part);
                                const unit = part.slice(-1);
                                switch(unit) {
                                    case 'd': total += num * 86400; break;
                                    case 'h': total += num * 3600; break;
                                    case 'm': total += num * 60; break;
                                    case 's': total += num; break;
                                }
                            });
                            return total;
                        };
                        return getSeconds(b.uptime) - getSeconds(a.uptime);
                    });

                    // Batch processing untuk UI yang tidak blocking
                    function renderUsersBatch(users, startIndex = 0, batchSize = 10) {
                        const endIndex = Math.min(startIndex + batchSize, users.length);
                        let html = '';

                        for (let i = startIndex; i < endIndex; i++) {
                            const user = users[i];
                            const formattedUptime = formatUptime(user.uptime);
                            let badgeClass = 'bg-success';
                            if (user.uptime && user.uptime.includes('d')) {
                                badgeClass = 'bg-primary';
                            } else if (user.uptime && user.uptime.includes('h')) {
                                const hours = parseInt(user.uptime.match(/(\d+)h/)?.[1] || 0);
                                if (hours > 5) badgeClass = 'bg-info';
                            }

                            html += `
                                <tr class="align-middle">
                                    <td class="fw-bold">${user.user || user.name}</td>
                                    <td>
                                        <div class="d-flex align-items-center">
                                            <i class="bi bi-hdd-network-fill text-secondary me-2"></i>
                                            <code class="bg-light px-2 py-1 rounded">${user.address || '-'}</code>
                                        </div>
                                    </td>
                                    <td class="text-center">
                                        <span class="badge ${badgeClass}">
                                            <i class="bi bi-clock me-1"></i> ${formattedUptime}
                                        </span>
                                    </td>
                                    <td class="text-center">
                                        <button class="btn btn-sm btn-outline-danger disconnect-user" data-username="${user.user || user.name}" title="Putus koneksi user">
                                            <i class="bi bi-power"></i> Putus
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }

                        if (startIndex === 0) {
                            tableBody.innerHTML = html;
                        } else {
                            tableBody.innerHTML += html;
                        }

                        // Render batch berikutnya secara asinkron
                        if (endIndex < users.length) {
                            setTimeout(() => renderUsersBatch(users, endIndex, batchSize), 10);
                        } else {
                            // Selesai render, tambahkan event listeners
                            document.querySelectorAll('.disconnect-user').forEach(btn => {
                                btn.addEventListener('click', disconnectUser);
                            });
                        }
                    }

                    // Mulai rendering dengan batch
                    renderUsersBatch(sortedUsers);

                    // Tampilkan info jika data dipotong
                    if (activeUsers.length > maxDisplayUsers) {
                        console.log(`Menampilkan ${maxDisplayUsers} dari ${activeUsers.length} user aktif untuk performa`);
                    }
                    // Destroy & re-init DataTables hanya jika tabel ada di DOM dan data valid
                    if (document.getElementById('activeUsersTable') && $.fn.DataTable.isDataTable('#activeUsersTable')) {
                        $('#activeUsersTable').DataTable().destroy();
                    }
                    if (document.getElementById('activeUsersTable')) {
                        $('#activeUsersTable').DataTable({
                            pageLength: 10,
                            lengthMenu: [10, 25, 50, 100],
                            responsive: true,
                            dom: '<"d-flex justify-content-between align-items-center mb-3"<"d-flex align-items-center"l><"d-flex"f>>rtip',
                            language: {
                                paginate: {
                                    previous: '<i class="bi bi-chevron-left"></i>',
                                    next: '<i class="bi bi-chevron-right"></i>'
                                },
                                info: 'Menampilkan _START_ sampai _END_ dari _TOTAL_ user',
                                lengthMenu: 'Tampilkan _MENU_ user',
                                search: 'Cari:',
                                zeroRecords: 'Tidak ada user aktif ditemukan',
                                infoEmpty: 'Menampilkan 0 sampai 0 dari 0 user',
                                infoFiltered: '(difilter dari _MAX_ total user)'
                            },
                            columnDefs: [
                                { targets: -1, orderable: false, width: '80px', className: 'text-center' },
                                { targets: 0, width: '25%' },
                                { targets: 1, width: '25%' },
                                { targets: 2, width: '25%', className: 'text-center' }
                            ]
                        });
                    }
                    // Update counter di card statistik dengan animasi
                    const activeUserCount = document.getElementById('activeUserCount');
                    if (activeUserCount) {
                        activeUserCount.textContent = activeUsers.length;
                        activeUserCount.classList.add('animate__animated', 'animate__heartBeat');
                        setTimeout(() => {
                            activeUserCount.classList.remove('animate__animated', 'animate__heartBeat');
                        }, 1000);
                    }
                    // Update info di footer tabel
                    if (activeUserCountInfo) {
                        const displayCount = Math.min(activeUsers.length, maxDisplayUsers);
                        activeUserCountInfo.innerHTML = `
                            <i class="bi bi-info-circle me-1"></i>
                            Menampilkan ${displayCount} dari ${activeUsers.length} user aktif | Terakhir diperbarui:
                            <span class="fw-bold">${new Date().toLocaleTimeString('id-ID')}</span>
                        `;
                    }
                } else {
                    tableBody.innerHTML = `
                        <tr>
                            <td colspan="4" class="text-center py-5 animate__animated animate__fadeIn">
                                <i class="bi bi-wifi-off text-secondary me-2" style="font-size: 2rem;"></i>
                                <p class="mb-0 mt-2">Tidak ada user hotspot aktif</p>
                                <p class="text-muted small">Semua user hotspot sedang tidak terhubung</p>
                            </td>
                        </tr>
                    `;
                    const activeUserCount = document.getElementById('activeUserCount');
                    if (activeUserCount) activeUserCount.textContent = '0';
                    if (activeUserCountInfo) {
                        activeUserCountInfo.innerHTML = `
                            <i class="bi bi-info-circle me-1"></i>
                            Tidak ada user aktif | Terakhir diperbarui:
                            <span class="fw-bold">${new Date().toLocaleTimeString('id-ID')}</span>
                        `;
                    }
                }
            })
            .catch(error => {
                isLoading = false;
                clearTimeout(timeoutId);

                // Handle different error types
                if (error.name === 'AbortError') {
                    console.error('Request timeout: Active users fetch aborted');
                } else {
                    console.error('Error fetching active users:', error);
                }

                const tableBody = document.getElementById('activeUsersTableBody');
                if (tableBody) {
                    const errorMessage = error.name === 'AbortError' ?
                        'Request timeout - terlalu banyak data untuk diproses' :
                        error.message;
                    tableBody.innerHTML = `
                    <tr>
                        <td colspan="4" class="text-center py-5 animate__animated animate__fadeIn">
                            <i class="bi bi-exclamation-triangle-fill text-danger me-2" style="font-size: 2rem;"></i>
                            <p class="mb-0 mt-2 text-danger">Gagal memuat data</p>
                            <p class="text-danger small">${errorMessage}</p>
                        </td>
                    </tr>
                `;
                }
                const activeUserCountInfo = document.getElementById('activeUserCountInfo');
                if (activeUserCountInfo) {
                    activeUserCountInfo.innerHTML = `
                        <i class="bi bi-exclamation-triangle-fill me-1"></i>
                        <span class="text-danger">Gagal memuat data</span>
                    `;
                }
            });
    }

    // Fungsi untuk memutus koneksi user hotspot aktif
    function disconnectUser(event) {
        const username = event.currentTarget.getAttribute('data-username');
        const userRow = event.currentTarget.closest('tr');
        document.getElementById('disconnectUsername').textContent = username;

        // Highlight baris user yang akan diputus
        userRow.classList.add('table-danger', 'animate__animated', 'animate__pulse');

        // Tampilkan modal konfirmasi dengan animasi
        const disconnectModal = new bootstrap.Modal(document.getElementById('disconnectUserModal'));
        disconnectModal.show();

        // Hapus highlight setelah modal ditutup
        document.getElementById('disconnectUserModal').addEventListener('hidden.bs.modal', function() {
            userRow.classList.remove('table-danger', 'animate__animated', 'animate__pulse');
        }, { once: true });

        // Event listener untuk tombol konfirmasi di modal
        document.getElementById('confirmDisconnect').onclick = function() {
            // Tampilkan loading state pada tombol
            this.disabled = true;
            this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Memutus...';

            // Tambahkan efek visual pada baris yang akan diputus
            userRow.classList.add('animate__animated', 'animate__fadeOut');

            fetch('/admin/hotspot/disconnect-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: username }),
            })
            .then(response => response.json())
            .then(data => {
                // Sembunyikan modal
                disconnectModal.hide();

                // Reset tombol konfirmasi
                document.getElementById('confirmDisconnect').disabled = false;
                document.getElementById('confirmDisconnect').innerHTML = '<i class="bi bi-power me-1"></i>Putus Koneksi';

                // Tampilkan toast notification dengan animasi
                const toastEl = document.getElementById('notificationToast');
                const toastTitle = document.getElementById('toastTitle');
                const toastMessage = document.getElementById('toastMessage');
                const toastHeader = document.getElementById('toastHeader');
                const toastIcon = document.getElementById('toastIcon');
                const toastTime = document.getElementById('toastTime');

                // Set waktu notifikasi
                toastTime.textContent = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

                if (data.success) {
                    // Styling untuk notifikasi sukses
                    toastTitle.textContent = 'Berhasil';
                    toastMessage.innerHTML = `User <strong>${username}</strong> berhasil diputus dari hotspot.`;
                    toastHeader.className = 'toast-header bg-success text-white';
                    toastIcon.className = 'bi bi-check-circle-fill me-2';

                    // Tambahkan animasi pada toast
                    toastEl.classList.add('animate__animated', 'animate__fadeInUp');
                } else {
                    // Styling untuk notifikasi gagal
                    toastTitle.textContent = 'Gagal';
                    toastMessage.innerHTML = `<strong>Error:</strong> ${data.message || 'Gagal memutus koneksi user.'}`;
                    toastHeader.className = 'toast-header bg-danger text-white';
                    toastIcon.className = 'bi bi-exclamation-circle-fill me-2';

                    // Tambahkan animasi pada toast
                    toastEl.classList.add('animate__animated', 'animate__shakeX');
                }

                const toastInstance = new bootstrap.Toast(toastEl);
                toastInstance.show();

                // Refresh data user aktif dengan efek loading
                const refreshBtn = document.getElementById('refreshActiveUsers');
                refreshBtn.click(); // Trigger refresh button click untuk menampilkan loading state

                // Hapus animasi dari toast setelah ditampilkan
                setTimeout(() => {
                    toastEl.classList.remove('animate__animated', 'animate__fadeInUp', 'animate__shakeX');
                }, 1000);
            })
            .catch(error => {
                console.error('Error disconnecting user:', error);

                // Sembunyikan modal
                disconnectModal.hide();

                btn.disabled = false;
                btn.innerHTML = '<i class="bi bi-power"></i> Putus';
            });
        };

        confirmModal.show();
    }

    // Load active users saat halaman dimuat dengan debounce
    let isLoading = false;
    let loadTimeout = null;

    function debouncedLoadActiveUsers() {
        if (isLoading) return;

        clearTimeout(loadTimeout);
        loadTimeout = setTimeout(() => {
            if (!isLoading) {
                loadActiveUsers();
                updateLastUpdatedTime();
            }
        }, 1000);
    }

    // Load initial data
    debouncedLoadActiveUsers();

    // Set interval untuk refresh data setiap 60 detik (diperlambat untuk mengurangi beban)
    setInterval(() => {
        debouncedLoadActiveUsers();
    }, 60000);

    // Fungsi untuk memperbarui waktu terakhir diperbarui
    function updateLastUpdatedTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const element = document.getElementById('lastUpdatedTimeValue');
        if (element) {
            element.textContent = timeString;
        }
    }

    // Event listener untuk tombol refresh (jika ada)
    const refreshBtn = document.getElementById('refreshActiveUsers');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
        this.disabled = true;
        const icon = this.querySelector('i');
        icon.classList.add('rotate-refresh');
        this.querySelector('i').classList.add('rotate-refresh');
        this.innerHTML = '<i class="bi bi-arrow-clockwise rotate-refresh"></i> Memperbarui...';

        // Tambahkan efek loading pada tabel
        const tableBody = document.getElementById('activeUsersTableBody');
        if (tableBody) {
            tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="mt-2 mb-0">Memuat data user aktif...</p>
                </td>
            </tr>
        `;
        }

        loadActiveUsers();
        updateLastUpdatedTime();

        setTimeout(() => {
            this.disabled = false;
            this.innerHTML = '<i class="bi bi-arrow-clockwise"></i> Refresh';
        }, 1000);
        });
    }

    const generateVoucherForm = document.getElementById('generateVoucherForm');
    const voucherResultDiv = document.getElementById('voucherResult');

    if (generateVoucherForm) {
        generateVoucherForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const btn = this.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Generating...';

        const formData = new FormData(generateVoucherForm);
        const data = Object.fromEntries(formData.entries());

        if (!data.price) {
            alert('Harga tidak boleh kosong.');
            btn.disabled = false;
            btn.innerHTML = 'Generate';
            return;
        }

        try {
            const response = await fetch('/admin/hotspot/generate-vouchers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const result = await response.json();

                            if (result.success) {
                    window.vouchersToPrint = {
                        vouchers: result.vouchers,
                        price: data.price,
                        model: data.voucherModel
                    };

                    let resultHTML = `
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Voucher Berhasil Dibuat (${result.vouchers.length})</h5>
                                <button class="btn btn-success mb-3" onclick="printVouchers()"><i class="bi bi-printer"></i> Print / Preview</button>
                                <div class="table-responsive">
                                    <table class="table table-bordered">
                                        <thead><tr><th>Username</th><th>Password</th><th>Profile</th></tr></thead>
                                        <tbody>
                                            ${result.vouchers.map(v => `<tr><td>${v.username}</td><td>${v.password}</td><td>${v.profile}</td></tr>`).join('')}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>`;
                    if (voucherResultDiv) {
                        voucherResultDiv.innerHTML = resultHTML;
                    }

                // Update voucher count in statistics
                const currentCount = parseInt($('#voucherCount').text()) || 0;
                $('#voucherCount').text(currentCount + result.vouchers.length);

                bootstrap.Modal.getInstance(document.getElementById('generateVoucherModal')).hide();

            } else {
                alert('Gagal membuat voucher: ' + result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat menghubungi server.');
        } finally {
            btn.disabled = false;
            btn.innerHTML = 'Generate';
        }
        });
    }

    // Search functionality
    function filterUsers() {
        const searchTerm = document.getElementById('searchUserInput').value.toLowerCase();
        const rows = document.querySelectorAll('.user-row');
        let visibleCount = 0;

        rows.forEach(row => {
            const username = row.querySelector('.username').textContent.toLowerCase();
            if (username.includes(searchTerm)) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });

        document.getElementById('showingCount').textContent = visibleCount;
    }

    const searchInput = document.getElementById('searchUserInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');

    if (searchInput) {
        searchInput.addEventListener('input', filterUsers);
    }

    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', function() {
            if (searchInput) {
                searchInput.value = '';
                filterUsers();
            }
        });
    }

    // Auto-hide notifications
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            const fadeEffect = setInterval(() => {
                if (!alert.style.opacity) {
                    alert.style.opacity = 1;
                }
                if (alert.style.opacity > 0) {
                    alert.style.opacity -= 0.1;
                } else {
                    clearInterval(fadeEffect);
                    alert.remove();
                }
            }, 100);
        }, 5000);
    });
});
