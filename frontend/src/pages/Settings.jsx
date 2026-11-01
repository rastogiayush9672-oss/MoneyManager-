import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import {
  Settings as SettingsIcon,
  User,
  Lock,
  Bell,
  Globe,
  Sun,
  Moon,
  Laptop,
  Download,
  Shield,
  Save,
  CheckCircle2
} from 'lucide-react';

const Settings = () => {
  const { user, updateProfile, changePassword, exportAllData, currencySymbol } = useContext(AuthContext);
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [jobTitle, setJobTitle] = useState(user?.jobTitle || '');
  const [currency, setCurrency] = useState(user?.currency || 'INR');
  const [dateFormat, setDateFormat] = useState(user?.dateFormat || 'DD/MM/YYYY');

  // Notifications
  const [notifUpcomingBills, setNotifUpcomingBills] = useState(user?.notificationPreferences?.upcomingBills ?? true);
  const [notifBudgetAlerts, setNotifBudgetAlerts] = useState(user?.notificationPreferences?.budgetAlerts ?? true);
  const [notifSalaryAlerts, setNotifSalaryAlerts] = useState(user?.notificationPreferences?.salaryAlerts ?? true);

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      await updateProfile({
        name,
        jobTitle,
        currency,
        theme,
        dateFormat,
        notificationPreferences: {
          upcomingBills: notifUpcomingBills,
          budgetAlerts: notifBudgetAlerts,
          salaryAlerts: notifSalaryAlerts
        }
      });
      toast.success('Profile & preferences successfully updated!');
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) return toast.error('New password must be at least 6 characters');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');

    try {
      setPwLoading(true);
      await changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Financial_Backup_${user?.name?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Complete personal data backup downloaded!');
    } catch (err) {
      toast.error('Data backup failed');
    }
  };

  return (
    <div style={{ paddingBottom: '60px' }}>
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1">Account & Preferences</h2>
        <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
          Personalize currency, theme tokens, security credentials, and export your financial records.
        </p>
      </div>

      <div className="row g-4">
        {/* Left Column: Profile & Preferences */}
        <div className="col-lg-7">
          {/* Profile Card */}
          <div className="card p-4 mb-4 shadow-sm">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <User size={18} className="text-primary" /> Personal Information
            </h5>

            <form onSubmit={handleProfileSave}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Professional Role</label>
                  <input
                    type="text"
                    className="form-control"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Lead Engineer, Product Designer"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  value={user?.email || ''}
                  disabled
                  style={{ opacity: 0.7 }}
                />
                <small className="text-muted">Primary account email used for authentication.</small>
              </div>

              {/* Preferences */}
              <h6 className="fw-bold mt-4 mb-3 border-top pt-3 d-flex align-items-center gap-2">
                <Globe size={16} className="text-primary" /> Regional & Display Preferences
              </h6>

              <div className="row g-3 mb-4">
                <div className="col-md-4">
                  <label className="form-label">Currency</label>
                  <select
                    className="form-select"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="INR">INR (₹ Indian Rupee)</option>
                    <option value="USD">USD ($ US Dollar)</option>
                    <option value="EUR">EUR (€ Euro)</option>
                    <option value="GBP">GBP (£ British Pound)</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Theme Mode</label>
                  <select
                    className="form-select"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                  >
                    <option value="dark">Dark Theme (Navy)</option>
                    <option value="light">Light Theme (Fintech)</option>
                    <option value="system">System Default</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Date Format</label>
                  <select
                    className="form-select"
                    value={dateFormat}
                    onChange={(e) => setDateFormat(e.target.value)}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>

              {/* Notification Toggles */}
              <h6 className="fw-bold mt-4 mb-3 border-top pt-3 d-flex align-items-center gap-2">
                <Bell size={16} className="text-primary" /> Automated Alert Preferences
              </h6>

              <div className="d-flex flex-column gap-2 mb-4">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="billsToggle"
                    checked={notifUpcomingBills}
                    onChange={(e) => setNotifUpcomingBills(e.target.checked)}
                  />
                  <label className="form-check-label small" htmlFor="billsToggle">
                    Upcoming subscription and bill renewal alerts (3-7 days prior)
                  </label>
                </div>

                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="budgetToggle"
                    checked={notifBudgetAlerts}
                    onChange={(e) => setNotifBudgetAlerts(e.target.checked)}
                  />
                  <label className="form-check-label small" htmlFor="budgetToggle">
                    Budget utilization warnings when spending exceeds 80% of limit
                  </label>
                </div>

                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="salaryToggle"
                    checked={notifSalaryAlerts}
                    onChange={(e) => setNotifSalaryAlerts(e.target.checked)}
                  />
                  <label className="form-check-label small" htmlFor="salaryToggle">
                    Monthly salary receipt and goal milestone celebration notifications
                  </label>
                </div>
              </div>

              <button type="submit" disabled={profileLoading} className="btn btn-primary">
                <Save size={16} /> {profileLoading ? 'Saving...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Security & Data Backup */}
        <div className="col-lg-5">
          {/* Security Card */}
          <div className="card p-4 mb-4 shadow-sm">
            <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
              <Lock size={18} className="text-primary" /> Security & Password
            </h5>

            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-3">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Minimum 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" disabled={pwLoading} className="btn btn-outline-custom w-100">
                <Shield size={16} /> {pwLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Data Portability / Export */}
          <div className="card p-4 shadow-sm">
            <h5 className="fw-bold mb-2 d-flex align-items-center gap-2">
              <Download size={18} className="text-success" /> Data Privacy & Portability
            </h5>
            <p className="text-muted small mb-3">
              Export all your personal transactions, salary statements, category budgets, savings goals, and net worth records as a structured JSON file.
            </p>
            <button onClick={handleExportData} className="btn btn-outline-custom w-100">
              <Download size={16} /> Download Full Financial Archive
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
