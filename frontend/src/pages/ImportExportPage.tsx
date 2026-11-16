import React, { useState } from 'react';
import { 
  FileSpreadsheet, Upload, Download, FileText, CheckCircle2, 
  AlertCircle, ArrowRight, Eye, RefreshCw, Trash2 
} from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/common/Modal';

export const ImportExportPage: React.FC = () => {
  const { transactions, accounts, addTransaction } = useFamily();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');

  // Import workflow state
  const [importStep, setImportStep] = useState<number>(1);
  const [fileName, setFileName] = useState<string>('HDFC_Bank_Statement_Nov2026.csv');
  const [fileType, setFileType] = useState<string>('CSV Bank Statement');
  const [parsedRows, setParsedRows] = useState([
    { id: 'imp_1', date: '2026-11-11', merchant: 'BigBasket Fresh', amount: 2450, category: 'Groceries & Supplies', status: 'valid', duplicate: false },
    { id: 'imp_2', date: '2026-11-10', merchant: 'Uber Ride', amount: 480, category: 'Transportation & Fuel', status: 'valid', duplicate: false },
    { id: 'imp_3', date: '2026-11-08', merchant: 'Barbeque Nation', amount: 3450, category: 'Food & Dining Out', status: 'duplicate_warning', duplicate: true },
    { id: 'imp_4', date: '2026-11-05', merchant: 'HDFC Home Loan Auto-Debit', amount: 32000, category: 'EMI & Loans', status: 'duplicate_warning', duplicate: true },
  ]);

  const [isImportConfirmed, setIsImportConfirmed] = useState<boolean>(false);

  const handleSimulateUpload = () => {
    setImportStep(2); // Preview & Mapping
  };

  const handleConfirmImport = () => {
    const validNonDuplicates = parsedRows.filter(r => !r.duplicate);
    validNonDuplicates.forEach(row => {
      addTransaction({
        type: 'expense',
        amount: row.amount,
        merchant: row.merchant,
        category: row.category,
        date: new Date(row.date).toISOString(),
        accountId: accounts[0]?.id,
        isShared: true,
        source: 'imported',
        paymentMethod: 'Bank Statement Import',
      });
    });

    setIsImportConfirmed(true);
    setImportStep(3); // Result summary
  };

  const handleDownloadExport = (type: string, format: string) => {
    alert(`Exporting ${type} as ${format}. Generating report...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#142B45] dark:text-white flex items-center space-x-2">
            <span>Import & Export Center</span>
          </h2>
          <p className="text-xs text-[#738095] dark:text-gray-400 mt-1">
            Bulk ingest bank statements with duplicate protection and export clean financial tax reports
          </p>
        </div>

        {/* Tab selector */}
        <div className="flex p-1 bg-gray-100 dark:bg-[#1E3553] rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('import')}
            className={`px-4 py-1.5 rounded-lg transition ${
              activeTab === 'import' ? 'bg-[#142B45] dark:bg-[#16A36A] text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            Statement Import
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-1.5 rounded-lg transition ${
              activeTab === 'export' ? 'bg-[#142B45] dark:bg-[#16A36A] text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            Export Reports
          </button>
        </div>
      </div>

      {/* IMPORT TAB */}
      {activeTab === 'import' && (
        <div className="bg-white dark:bg-[#14253A] rounded-3xl p-6 border border-gray-100 dark:border-[#1E3553] shadow-sm space-y-6">
          {/* Step 1: File Upload */}
          {importStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-[#142B45] dark:text-white">
                  Step 1: Upload Bank Statement or History File
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Supported formats: CSV, Excel (.xlsx), and PDF bank e-statements (HDFC, SBI, ICICI, Axis)
                </p>
              </div>

              <div
                onClick={handleSimulateUpload}
                className="border-2 border-dashed border-gray-200 dark:border-[#1E3553] hover:border-[#16A36A] rounded-3xl p-10 text-center cursor-pointer transition bg-gray-50/50 dark:bg-[#0B1522]/50"
              >
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-[#142B45] dark:text-white">
                  Click to select file or drag & drop here
                </h4>
                <p className="text-xs text-gray-400 mt-1">
                  Ready with sample demo: <strong>{fileName}</strong>
                </p>
                <button
                  type="button"
                  className="mt-4 px-4 py-2 bg-[#16A36A] text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  Load Sample Statement
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Preview & Duplicate Detection */}
          {importStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#142B45] dark:text-white">
                    Step 2: Preview, Column Mapping & Duplicate Review
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Found <strong>{parsedRows.length} transactions</strong>. 2 matched potential duplicates and are highlighted.
                  </p>
                </div>

                <button
                  onClick={() => setImportStep(1)}
                  className="text-xs text-gray-500 hover:underline"
                >
                  Upload different file
                </button>
              </div>

              {/* Parsed Rows Table */}
              <div className="border border-gray-100 dark:border-[#1E3553] rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 dark:bg-[#0B1522] text-[11px] font-bold text-gray-400 uppercase">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Merchant / Payee</th>
                      <th className="p-3">Extracted Category</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3 text-center">Duplicate Check</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-[#1E3553]">
                    {parsedRows.map(row => (
                      <tr key={row.id} className={row.duplicate ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''}>
                        <td className="p-3 text-gray-500">{row.date}</td>
                        <td className="p-3 font-bold text-[#142B45] dark:text-white">{row.merchant}</td>
                        <td className="p-3 text-[#16A36A] font-semibold">{row.category}</td>
                        <td className="p-3 text-right font-bold font-numeric">₹{row.amount.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-center">
                          {row.duplicate ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                              Duplicate Detected (Already in system)
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300">
                              New & Verified
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => setParsedRows(parsedRows.filter(r => r.id !== row.id))}
                            className="text-gray-400 hover:text-rose-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-[#1E3553]">
                <span className="text-xs text-gray-400">
                  Only non-duplicate rows will be added to your ledger.
                </span>

                <button
                  onClick={handleConfirmImport}
                  className="px-6 py-2.5 bg-[#16A36A] hover:bg-[#138959] text-white rounded-xl text-xs font-bold transition shadow-md flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Import Records</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Success Results */}
          {importStep === 3 && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 dark:bg-emerald-900/40 text-[#16A36A] flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-[#142B45] dark:text-white">
                Import Successfully Reconciled!
              </h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                2 new transactions were added to your family ledger and account balances have been synchronized.
              </p>
              <button
                onClick={() => setImportStep(1)}
                className="px-5 py-2 rounded-xl bg-gray-100 dark:bg-[#1E3553] text-[#142B45] dark:text-white text-xs font-bold hover:bg-gray-200 transition"
              >
                Import Another Statement
              </button>
            </div>
          )}
        </div>
      )}

      {/* EXPORT TAB */}
      {activeTab === 'export' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Complete Transaction History', desc: 'All verified income, expenses and transfers with category tags', formats: ['CSV', 'Excel', 'PDF'] },
            { title: 'Monthly Family Budget Report', desc: 'Category-wise limits, actual expenditure and variance summary', formats: ['PDF', 'Excel'] },
            { title: 'Tax & Investment Ledger', desc: 'Mutual funds SIP, insurance premiums and eligible 80C deductions', formats: ['PDF', 'Excel'] },
            { title: 'Loan Repayment & Amortization', desc: 'Principal vs interest split for home and auto loans', formats: ['PDF', 'CSV'] },
            { title: 'Household Savings Goals Summary', desc: 'Family vacation & emergency safety vault progress', formats: ['PDF'] },
            { title: 'Audit Trail & Permissions Log', desc: 'Full security log of transactions and member changes', formats: ['CSV'] },
          ].map(report => (
            <div
              key={report.title}
              className="bg-white dark:bg-[#14253A] rounded-2xl p-5 border border-gray-100 dark:border-[#1E3553] shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-[#16A36A] flex items-center justify-center mb-3">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[#142B45] dark:text-white">
                  {report.title}
                </h4>
                <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                  {report.desc}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-gray-100 dark:border-[#1E3553] flex items-center space-x-2">
                {report.formats.map(fmt => (
                  <button
                    key={fmt}
                    onClick={() => handleDownloadExport(report.title, fmt)}
                    className="flex-1 py-1.5 rounded-lg border border-gray-200 dark:border-[#1E3553] hover:border-[#16A36A] text-[11px] font-bold text-gray-700 dark:text-gray-300 transition"
                  >
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

