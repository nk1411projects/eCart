import React from 'react';
import { Scale, ShieldCheck, HelpCircle, FileText } from 'lucide-react';

const Terms = () => {
  return (
    <div className="max-w-4xl mx-auto my-12 px-4 sm:px-6 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="text-center mb-12 pb-8 border-b border-slate-200 dark:border-slate-800">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 mb-3">
          <Scale className="w-3.5 h-3.5" /> Legal Framework
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Last revised: June 27, 2026
        </p>
      </div>

      {/* Content */}
      <div className="space-y-8 text-sm md:text-base leading-relaxed text-slate-600 dark:text-slate-400">
        <p>
          Welcome to **eCart**. These Terms of Service ("Terms") govern your access to and use of the eCart multi-vendor marketplace website, services, and applications. Please read these terms carefully before creating an account or making any transactions.
        </p>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            1. Acceptance of Terms
          </h2>
          <p>
            By registering an account, browsing our catalog, or initiating a purchase, you agree to comply with and be bound by these Terms and our Privacy Policy. If you do not agree to these terms, you must refrain from using the marketplace.
          </p>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            2. User Registration & Account Security
          </h2>
          <p>
            To buy or sell on eCart, you must register for an account. You agree to provide accurate, current, and complete registration credentials. You are solely responsible for safeguarding your password and session keys. Under our role-based authorization parameters, you agree not to impersonate other merchants or customers.
          </p>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Scale className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            3. Marketplace Transactions & Wallet Escrow
          </h2>
          <p>
            eCart facilitates transaction settlement through a digital wallet ledger simulation or secure simulated payment processing. When purchasing items, funds are transferred under transaction agreements.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-500 dark:text-slate-400 text-sm">
            <li>**Wallet Balance:** Credits deposited to the eCart digital wallet are non-refundable simulations and cannot be exchanged for fiat currency.</li>
            <li>**Shipping Agreements:** Sellers are responsible for shipping orders and maintaining valid delivery status tracking.</li>
            <li>**Tax Charges:** Transactions are subject to a simulated 5% GST/VAT handling fee as visible in checkout invoice reviews.</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            4. Seller Obligations & Policies
          </h2>
          <p>
            Merchants registering on eCart must provide accurate product details, stock specifications, and attributes (color, size variants). Sellers are strictly prohibited from listing duplicate, fraudulent, or counterfeit goods. Violations can lead to account suspension by the Super Admin.
          </p>
        </section>

        {/* Section 5 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            5. Limitation of Liability
          </h2>
          <p>
            eCart and its developers provide this platform "as-is". We do not guarantee uninterrupted server uptime, correct SMTP dispatch configurations under custom credentials, or specific inventory levels. We are not liable for transaction disputes between independent merchants and customers.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Terms;
