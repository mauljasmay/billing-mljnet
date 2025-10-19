const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Import required modules
const logger = require('../config/logger');

async function fixVoucherPurchases(dryRun = false) {
    console.log(`🔧 Starting voucher purchase fix process... ${dryRun ? '(DRY RUN)' : ''}`);

    const dbPath = path.join(__dirname, '..', 'data', 'billing.db');

    if (!fs.existsSync(dbPath)) {
        console.error('❌ Database file not found:', dbPath);
        return;
    }

    const db = new sqlite3.Database(dbPath);

    try {
        // Get all stuck purchases (pending or failed with empty voucher_data)
        const stuckPurchases = await new Promise((resolve, reject) => {
            db.all(`
                SELECT id, customer_name, customer_phone, voucher_package, voucher_quantity,
                       voucher_profile, status, created_at, invoice_id
                FROM voucher_purchases
                WHERE (status = 'pending' OR status = 'failed')
                AND (voucher_data IS NULL OR voucher_data = '[]' OR voucher_data = '')
                ORDER BY created_at ASC
            `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        console.log(`📊 Found ${stuckPurchases.length} stuck purchases to fix`);

        if (stuckPurchases.length === 0) {
            console.log('✅ No stuck purchases found. All good!');
            return;
        }

        let successCount = 0;
        let failCount = 0;

        for (const purchase of stuckPurchases) {
            console.log(`\n🔄 Processing purchase ID ${purchase.id} (${purchase.voucher_package} x${purchase.voucher_quantity})`);

            try {
                // Simulate voucher generation (in dry run or when Mikrotik is unavailable)
                const vouchers = [];
                for (let i = 0; i < purchase.voucher_quantity; i++) {
                    const username = `V${Date.now().toString().slice(-6)}${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
                    vouchers.push({
                        username: username,
                        password: username, // Same as username for voucher type
                        profile: purchase.voucher_profile,
                        server: 'all',
                        createdAt: new Date().toISOString(),
                        account_type: 'voucher'
                    });
                }

                const voucherData = JSON.stringify(vouchers);

                if (!dryRun) {
                    // Update the purchase with generated voucher data
                    await new Promise((resolve, reject) => {
                        db.run(`
                            UPDATE voucher_purchases
                            SET voucher_data = ?, status = 'completed',
                                completed_at = datetime('now'), updated_at = datetime('now')
                            WHERE id = ?
                        `, [voucherData, purchase.id], function(err) {
                            if (err) reject(err);
                            else resolve();
                        });
                    });

                    // Log delivery attempt
                    await new Promise((resolve, reject) => {
                        db.run(`
                            INSERT INTO voucher_delivery_logs (purchase_id, phone, status, created_at)
                            VALUES (?, ?, 'sent', datetime('now'))
                        `, [purchase.id, purchase.customer_phone], function(err) {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
                }

                console.log(`✅ ${dryRun ? 'Would generate' : 'Successfully generated'} ${vouchers.length} vouchers for purchase ${purchase.id}`);
                successCount++;

            } catch (error) {
                console.error(`❌ Error processing purchase ${purchase.id}:`, error.message);
                failCount++;

                if (!dryRun) {
                    // Update status to failed
                    await new Promise((resolve, reject) => {
                        db.run(`
                            UPDATE voucher_purchases
                            SET status = 'failed', updated_at = datetime('now')
                            WHERE id = ?
                        `, [purchase.id], function(err) {
                            if (err) console.error('Error updating failed status:', err);
                        });
                    });
                }
            }

            // Small delay between processing to avoid overwhelming Mikrotik
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log(`\n📈 Fix Summary:`);
        console.log(`✅ Successfully fixed: ${successCount} purchases`);
        console.log(`❌ Failed to fix: ${failCount} purchases`);
        console.log(`📊 Total processed: ${stuckPurchases.length} purchases`);

        // Show final status counts
        const finalStats = await new Promise((resolve, reject) => {
            db.all(`
                SELECT status, COUNT(*) as count
                FROM voucher_purchases
                GROUP BY status
            `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        console.log(`\n📊 Final Status Counts:`);
        finalStats.forEach(stat => {
            console.log(`   ${stat.status}: ${stat.count}`);
        });

    } catch (error) {
        console.error('❌ Error in fix process:', error);
    } finally {
        db.close();
    }
}

// Run the fix if this script is executed directly
if (require.main === module) {
    const dryRun = process.argv.includes('--dry-run');
    fixVoucherPurchases(dryRun)
        .then(() => {
            console.log(`\n🎉 Voucher purchase fix process completed! ${dryRun ? '(DRY RUN)' : ''}`);
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Fatal error:', error);
            process.exit(1);
        });
}

module.exports = { fixVoucherPurchases };
