import React, { useState } from 'react';
import { supportAPI } from '../services/api';
import { Mail, User, Info, MessageSquare, CheckCircle, AlertTriangle } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const response = await supportAPI.submitContactForm(formData);
      setSuccessMsg(response.message || 'Your support ticket has been sent.');
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit contact form. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto my-16 px-4">
      {/* Form Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
          Support Helpdesk
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Have an issue with your order or a question? Send us a message and we'll route it directly to our support team.
        </p>
      </div>

      {/* Styled Centered Card Form (Borderless with Shadow) */}
      <div className="bg-white dark:bg-slate-900 shadow-xl dark:shadow-2xl dark:shadow-indigo-500/5 rounded-xl p-6 md:p-8">
        {successMsg && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 text-sm flex items-start gap-3 border border-emerald-200/50 dark:border-emerald-800/30">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-800 dark:text-emerald-300">Message Dispatched</p>
              <p className="mt-1 text-slate-600 dark:text-slate-355">{successMsg}</p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300 text-sm flex items-start gap-3 border border-red-200/50 dark:border-red-800/30">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-850 dark:text-red-300">Submission failed</p>
              <p className="mt-1 text-slate-600 dark:text-slate-355">{errorMsg}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                name="name"
                required
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 bg-transparent border-b border-t-0 border-l-0 border-r-0 border-slate-200 dark:border-slate-800 rounded-none text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-0 transition-colors"
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                name="email"
                required
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 bg-transparent border-b border-t-0 border-l-0 border-r-0 border-slate-200 dark:border-slate-800 rounded-none text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-0 transition-colors"
              />
            </div>
          </div>

          {/* Subject Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Subject Topic
            </label>
            <div className="relative">
              <Info className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                name="subject"
                required
                placeholder="Order shipping, billing details, error reports..."
                value={formData.subject}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 bg-transparent border-b border-t-0 border-l-0 border-r-0 border-slate-200 dark:border-slate-800 rounded-none text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-0 transition-colors"
              />
            </div>
          </div>

          {/* Message Field */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Message Description
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <textarea
                name="message"
                required
                rows="5"
                placeholder="Provide transaction IDs or error descriptions..."
                value={formData.message}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 bg-transparent border-b border-t-0 border-l-0 border-r-0 border-slate-200 dark:border-slate-800 rounded-none text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:border-indigo-500 focus:ring-0 transition-colors resize-none"
              ></textarea>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-sm rounded-lg shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? 'Sending Message...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
