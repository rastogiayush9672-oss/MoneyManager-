import React, { useState, useContext } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
import Chatbot from './Chatbot';
import QuickAddModal from './QuickAddModal';
import {
  LayoutDashboard,
  Sparkles,
  TrendingUp,
  ArrowDownLeft,
  Briefcase,
  ArrowUpRight,
  Receipt,
  PieChart,
  Target,
  Repeat,
  Scale,
  Calculator,
  Bot,
  FileText,
  Settings,
  Bell,
  Sun,
  Moon,
  Laptop,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout, currencySymbol } = useContext(AuthContext);
  const { theme, toggleTheme, isDark } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navGroups = [
    {
      group: 'OVERVIEW',
      items: [
        { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { label: 'Financial Insights', path: '/insights', icon: Sparkles, badge: 'AI' },
        { label: 'Analytics', path: '/analytics', icon: TrendingUp }
      ]
    },
    {
      group: 'MONEY MANAGEMENT',
      items: [
        { label: 'Income', path: '/income', icon: ArrowDownLeft },
        { label: 'Salary', path: '/salary', icon: Briefcase },
        { label: 'Expenses', path: '/expenses', icon: ArrowUpRight },
        { label: 'Transactions', path: '/transactions', icon: Receipt },
        { label: 'Budgets', path: '/budgets', icon: PieChart }
      ]
    },
    {
      group: 'FINANCIAL PLANNING',
      items: [
        { label: 'Savings Goals', path: '/goals', icon: Target },
        { label: 'Subscriptions & Bills', path: '/subscriptions', icon: Repeat },
        { label: 'Net Worth & Assets', path: '/net-worth', icon: Scale },
        { label: 'Calculators', path: '/calculators', icon: Calculator }
      ]
    },
    {
      group: 'INTELLIGENCE',
      items: [
        { label: 'AI Finance Assistant', path: '/ai-assistant', icon: Bot, highlight: true },
        { label: 'Financial Reports', path: '/reports', icon: FileText }
      ]
    },
    {
      group: 'PREFERENCES',
      items: [
        { label: 'Settings & Profile', path: '/settings', icon: Settings }
      ]
    }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-app)' }}>
      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 1040
          }}
        />
      )}

      {/* SIDEBAR */}
      <aside
        style={{
          width: collapsed ? '80px' : '260px',
          backgroundColor: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 1050,
          transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s ease',
          transform: mobileOpen ? 'translateX(0)' : window.innerWidth <= 992 ? 'translateX(-100%)' : 'none'
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            height: '70px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            padding: '0 1.25rem',
            borderBottom: '1px solid var(--border-color)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: '1.1rem',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.35)'
              }}
            >
              ₹
            </div>
            {!collapsed && (
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em', color: 'var(--text-main)', lineHeight: 1.2 }}>
                  MoneyManager
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 600, letterSpacing: '0.04em' }}>
                  AI ENTERPRISE
                </div>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="btn btn-sm d-none d-lg-flex"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                padding: '4px'
              }}
              title="Collapse sidebar"
            >
              <ChevronLeft size={18} />
            </button>
          )}
        </div>

        {/* Collapsed Expand Trigger */}
        {collapsed && (
          <div className="d-none d-lg-flex justify-content-center py-2 border-bottom" style={{ borderColor: 'var(--border-color)' }}>
            <button
              onClick={() => setCollapsed(false)}
              className="btn btn-sm"
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
              title="Expand sidebar"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Navigation List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 0.65rem' }}>
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} style={{ marginBottom: '1.25rem' }}>
              {!collapsed && (
                <div
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    color: 'var(--text-dim)',
                    padding: '0 0.75rem 0.5rem',
                    textTransform: 'uppercase'
                  }}
                >
                  {group.group}
                </div>
              )}
              {group.items.map((item, iIdx) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={iIdx}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: collapsed ? 'center' : 'space-between',
                      padding: collapsed ? '0.65rem 0' : '0.6rem 0.85rem',
                      borderRadius: 'var(--radius-md)',
                      marginBottom: '0.2rem',
                      color: isActive ? '#fff' : 'var(--text-muted)',
                      backgroundColor: isActive
                        ? 'var(--color-primary)'
                        : item.highlight
                        ? 'rgba(139, 92, 246, 0.08)'
                        : 'transparent',
                      fontWeight: isActive ? 600 : 500,
                      fontSize: '0.875rem',
                      textDecoration: 'none',
                      transition: 'all 0.15s ease'
                    }}
                    title={collapsed ? item.label : ''}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <Icon
                        size={19}
                        style={{
                          color: isActive
                            ? '#fff'
                            : item.highlight
                            ? 'var(--color-accent)'
                            : 'currentColor',
                          flexShrink: 0
                        }}
                      />
                      {!collapsed && <span>{item.label}</span>}
                    </div>

                    {!collapsed && item.badge && (
                      <span
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '9999px',
                          backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'rgba(139, 92, 246, 0.15)',
                          color: isActive ? '#fff' : 'var(--color-accent)'
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Card Bottom */}
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-surface)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  color: '#fff',
                  fontSize: '0.9rem',
                  flexShrink: 0
                }}
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              {!collapsed && (
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {user?.name || 'User'}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                    {user?.email || 'user@example.com'}
                  </div>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                onClick={handleLogout}
                className="btn btn-sm btn-outline-custom"
                style={{ padding: '6px', borderRadius: '8px' }}
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          marginLeft: window.innerWidth <= 992 ? 0 : collapsed ? '80px' : '260px',
          transition: 'margin-left 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        {/* TOPBAR */}
        <header
          style={{
            height: '70px',
            backgroundColor: 'var(--bg-sidebar)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.5rem',
            position: 'sticky',
            top: 0,
            zIndex: 1020,
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Left: Mobile hamburger & breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => setMobileOpen(true)}
              className="btn btn-sm btn-outline-custom d-lg-none"
              style={{ padding: '6px 8px' }}
            >
              <Menu size={20} />
            </button>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Financial Suite / </span>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'capitalize' }}>
                {location.pathname.replace('/', '') || 'Dashboard'}
              </span>
            </div>
          </div>

          {/* Right: Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Quick Add Button */}
            <button
              onClick={() => setShowQuickAdd(true)}
              className="btn btn-primary"
              style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
            >
              <Plus size={16} />
              <span className="d-none d-sm-inline">Quick Add</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="btn btn-outline-custom"
              style={{ width: '38px', height: '38px', padding: 0 }}
              title={`Active: ${theme.toUpperCase()}. Click to switch.`}
            >
              {theme === 'dark' ? <Moon size={18} /> : theme === 'light' ? <Sun size={18} /> : <Laptop size={18} />}
            </button>

            {/* Notification Bell with Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="btn btn-outline-custom"
                style={{ width: '38px', height: '38px', padding: 0, position: 'relative' }}
                title="Notifications & Alerts"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      width: '8px',
                      height: '8px',
                      backgroundColor: 'var(--color-danger)',
                      borderRadius: '50%'
                    }}
                  />
                )}
              </button>

              {/* Notification Dropdown Menu */}
              {showNotifDropdown && (
                <div
                  className="card shadow-lg"
                  style={{
                    position: 'absolute',
                    top: '48px',
                    right: 0,
                    width: '340px',
                    zIndex: 1060,
                    padding: '0',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      padding: '0.85rem 1rem',
                      borderBottom: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Notifications ({unreadCount})</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-muted" style={{ fontSize: '0.85rem' }}>
                        No new notifications. All clear!
                      </div>
                    ) : (
                      notifications.slice(0, 8).map(n => (
                        <div
                          key={n._id}
                          onClick={() => {
                            markAsRead(n._id);
                            if (n.link) navigate(n.link);
                            setShowNotifDropdown(false);
                          }}
                          style={{
                            padding: '0.75rem 1rem',
                            borderBottom: '1px solid var(--border-color)',
                            backgroundColor: n.read ? 'transparent' : 'rgba(59, 130, 246, 0.06)',
                            cursor: 'pointer',
                            display: 'flex',
                            gap: '0.75rem',
                            alignItems: 'flex-start'
                          }}
                        >
                          <div style={{ marginTop: '2px' }}>
                            {n.type === 'bill' ? (
                              <Clock size={16} className="text-warning" />
                            ) : n.type === 'budget' ? (
                              <AlertTriangle size={16} className="text-danger" />
                            ) : (
                              <CheckCircle2 size={16} className="text-success" />
                            )}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text-main)' }}>{n.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{n.message}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  border: '2px solid var(--border-color)'
                }}
              >
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>

              {showUserDropdown && (
                <div
                  className="card shadow-lg"
                  style={{
                    position: 'absolute',
                    top: '48px',
                    right: 0,
                    width: '210px',
                    zIndex: 1060,
                    padding: '0.5rem'
                  }}
                >
                  <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{user?.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{user?.jobTitle || 'Member'}</div>
                  </div>
                  <button
                    onClick={() => { navigate('/settings'); setShowUserDropdown(false); }}
                    className="btn btn-sm w-100 text-start"
                    style={{ justifyContent: 'flex-start', background: 'transparent', border: 'none', color: 'var(--text-main)', padding: '0.5rem 0.75rem' }}
                  >
                    <Settings size={15} className="me-2" /> Settings
                  </button>
                  <button
                    onClick={() => { navigate('/reports'); setShowUserDropdown(false); }}
                    className="btn btn-sm w-100 text-start"
                    style={{ justifyContent: 'flex-start', background: 'transparent', border: 'none', color: 'var(--text-main)', padding: '0.5rem 0.75rem' }}
                  >
                    <FileText size={15} className="me-2" /> Financial Reports
                  </button>
                  <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.3rem 0' }} />
                  <button
                    onClick={handleLogout}
                    className="btn btn-sm w-100 text-start text-danger"
                    style={{ justifyContent: 'flex-start', background: 'transparent', border: 'none', padding: '0.5rem 0.75rem' }}
                  >
                    <LogOut size={15} className="me-2" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main style={{ flex: 1, padding: '1.75rem', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>

      {/* QUICK ADD MODAL */}
      {showQuickAdd && <QuickAddModal onClose={() => setShowQuickAdd(false)} />}

      {/* PERSISTENT FLOATING AI CHATBOT */}
      <Chatbot />
    </div>
  );
};

export default Layout;
