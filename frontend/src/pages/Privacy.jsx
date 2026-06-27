import React from 'react';
import { Shield, Eye, Lock, Mail } from 'lucide-react';

const Privacy = () => {
  return (
    <div className="max-w-4xl mx-auto my-12 px-4 sm:px-6 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="text-center mb-12 pb-8 border-b border-slate-200 dark:border-slate-800">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 mb-3">
          <Shield className="w-3.5 h-3.5" /> Data Protection
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Last revised: June 27, 2026
        </p>
      </div>

      {/* Content */}
      <div className="space-y-8 text-sm md:text-base leading-relaxed text-slate-600 dark:text-slate-400">
        <p>
          At **eCart**, we are committed to protecting your privacy and ensuring your personal information is handled in a secure and responsible manner. This Privacy Policy describes how we collect, process, and protect your details.
        </p>

        {/* Section 1 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            1. Information We Collect
          </h2>
          <p>
            To supply marketplace utilities, we collect specific parameters when you interact with our platform:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-500 dark:text-slate-400 text-sm">
            <li>**Account Credentials:** Name, email address, password hash (encrypted via bcryptjs), and store descriptions (for sellers).</li>
            <li>**Address Lists:** Billing and delivery addresses logged for shipping dispatch.</li>
            <li>**Transaction Details:** Order records, checkout invoice amounts, and digital wallet balances.</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            2. How We Secure Your Data
          </h2>
          <p>
            Your safety is our priority. We employ industry-standard engineering measures to secure account profiles:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-500 dark:text-slate-400 text-sm">
            <li>**Bcrypt Hashing:** Passwords are hashed on the database level using salted bcrypt algorithms.</li>
            <li>**Secure JWT:** Session management runs on signed JSON Web Tokens stored in httpOnly browser cookies to block cross-site scripting (XSS).</li>
            <li>**Proxy Email Deliverability:** Private addresses (e.g. SMTP credentials and developer emails) are kept isolated in private backend configuration variables (`.env`) to prevent exposure.</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            3. Sharing of Information
          </h2>
          <p>
            eCart does not lease or sell user profiles to advertising networks. Information is only exposed within our multi-vendor ledger framework:
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            For example, when a customer purchases products, the vendor receives the client's shipping address and contact numbers to complete delivery operations.
          </p>
        </section>

        {/* Section 4 */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            4. Privacy Inquiries
          </h2>
          <p>
            If you have questions about how your registration details are handled, or would like to request file deletion, you can submit a support ticket via our Support Helpdesk Contact Form.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
