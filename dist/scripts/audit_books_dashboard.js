"use strict";
async function auditDashboard() {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2YWE3OTcyNzhkMzAxYjQ3MzVmMWQzMjQiLCJpZCI6IjZhYTc5NzI3OGQzMDFiNDczNWYxZDMyNCIsImVtYWlsIjoibml0ZXNodDIwNkBnbWFpbC5jb20iLCJyb2xlIjoiQWRtaW4iLCJvcmdJZCI6IjZhYTc5NzI3OGQzMDFiNDczNWYxZDMyMiIsImlhdCI6MTc5MjQwNjQ3OSwiZXhwIjoxNzkzMDExMjc5fQ.GRHk2jFHwiWrJsOBvJ80mIN7AH88E4dfNA6S0Hr6EXg';
    const headers = {
        'Authorization': `Bearer ${token}`,
        'x-org-id': '6aa797278d301b4735f1d322',
        'x-user-id': '6aa797278d301b4735f1d324'
    };
    console.log('Testing GET /api/v1/books/dashboard for Spinny...\n');
    const res = await fetch('http://localhost:5000/api/v1/books/dashboard', { headers });
    console.log('HTTP Status:', res.status);
    const json = await res.json();
    if (json.success && json.data) {
        const d = json.data;
        console.log('✅ Dashboard Data fetched successfully from MongoDB:');
        console.log('   - Total Receivables:', d.totalReceivables);
        console.log('   - Current Receivables:', d.currentReceivables);
        console.log('   - Overdue Receivables:', d.overdueReceivables);
        console.log('   - Total Payables:', d.totalPayables);
        console.log('   - Current Payables:', d.currentPayables);
        console.log('   - Overdue Payables:', d.overduePayables);
        console.log('   - Total Income:', d.totalIncome);
        console.log('   - Total Expense:', d.totalExpense);
        console.log('   - Net Profit:', d.netProfit);
        console.log('   - Cash Flow:', d.cashFlow);
        console.log('   - Bank Accounts Summary Count:', d.bankAccountsSummary?.length);
        console.log('   - Recent Activity Count:', d.recentActivity?.length);
        console.log('   - Setup Progress Steps Count:', d.setupProgress?.steps?.length);
        if (d.recentActivity?.length) {
            console.log('\n   Recent Activities:');
            d.recentActivity.slice(0, 3).forEach((a) => {
                console.log(`     * [${a.type}] ${a.title} - ${a.amount} (${a.status})`);
            });
        }
    }
    else {
        console.log('❌ Failed to fetch dashboard data:', json);
    }
}
auditDashboard().catch(console.error);
