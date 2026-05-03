import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(req: NextRequest) {
  try {
    const { type, data } = await req.json();

    let fileName = '';
    let worksheetName = '';
    let worksheetData: any[] = [];

    if (type === 'payments') {
      fileName = `payments_${new Date().toISOString().split('T')[0]}.xlsx`;
      worksheetName = 'Payments';
      worksheetData = data.map((p: any) => ({
        'Customer Name': p.customerName,
        'EKUB': p.ekubName,
        'Round': p.round,
        'Amount': p.amount,
        'Due Date': p.dueDate,
        'Paid Date': p.paidDate || '-',
        'Status': p.status,
      }));
    } else if (type === 'payouts') {
      fileName = `payouts_${new Date().toISOString().split('T')[0]}.xlsx`;
      worksheetName = 'Payouts';
      worksheetData = data.map((p: any) => ({
        'Customer Name': p.customerName,
        'EKUB': p.ekubName,
        'Round': p.round,
        'Amount': p.amount,
        'Payout Date': p.payoutDate || '-',
        'Status': p.status,
      }));
    } else if (type === 'customers') {
      fileName = `customers_${new Date().toISOString().split('T')[0]}.xlsx`;
      worksheetName = 'Customers';
      worksheetData = data.map((c: any) => ({
        'Name': c.fullName,
        'Phone': c.phone,
        'EKUB': c.ekubName,
        'Total Contributions': c.totalContributions,
        'Total Payouts': c.totalPayouts,
        'Participation Rounds': c.participationRounds,
        'Status': c.status,
      }));
    }

    // Create workbook
    const ws = XLSX.utils.json_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, worksheetName);

    // Write to buffer
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
