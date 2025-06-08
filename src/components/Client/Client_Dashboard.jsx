import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../css/AdminDashboard.css';
import '../../css/users/personalUserDetails.css';
import '../../css/users/UpdatePassword.css';
import E from '../.././uploads/logo/E.png';
import Eventura from '../.././uploads/logo/Eventura.png';
import notification from '../.././uploads/icons/notification.png';
import api from '../../api/api';
import AOS from 'aos';
import 'aos/dist/aos.css';
import DashboardContent from './DashboardContent';
import EventContent from './EventContent';
import EventTasks from './EventTasks';
import GuestList from './GuestList';
import VendorsContent from './VendorsContent';
import BudgetPayement from './BudgetPayement';
import Communication from './Communication';
import EventDocument from './EventDocument';
import EventGallary from './EventGallary';
import UpdateProfile from '../Auth/UpdateProfile';
import UpdatePassword from '../Auth/UpdatePassword';
import { EventProvider } from '../../context/EventContext';
import {
    FiHome, FiUsers, FiCheckSquare, FiBriefcase, FiCalendar,
    FiSettings, FiLogOut, FiDollarSign, FiSearch,
    FiMessageCircle, FiFileText, FiImage,
    FiX, FiUser, FiMail, FiPhone, FiShield, FiEdit
} from 'react-icons/fi';

const Client_Dashboard = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState('Events');
    const [isMobile, setIsMobile] = useState(false);
    const [mobileMenuActive, setMobileMenuActive] = useState(false);
    const [animating, setAnimating] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [showUserPanel, setShowUserPanel] = useState(false);
    const [showUpdateProfileModal, setShowUpdateProfileModal] = useState(false);
    const [showUpdatePasswordModal, setShowUpdatePasswordModal] = useState(false);
    const [updateSuccess, setUpdateSuccess] = useState(false);
    const [resendStatus, setResendStatus] = useState({ message: '', error: '' });

    useEffect(() => {
        AOS.init({
            duration: 1000,
            offset: 100,
        });
        AOS.refresh({
            duration: 1000,
            offset: 100,
        });
    }, []);

    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData) {
            navigate('/signin');
            return;
        }
        setUser(userData);

        const checkIfMobile = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            if (mobile) {
                setCollapsed(true);
            }
        };

        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);

        return () => window.removeEventListener('resize', checkIfMobile);
    }, [navigate]);

    const toggleSidebar = () => {
        if (!collapsed) {
            setAnimating(true);
            setTimeout(() => {
                setCollapsed(true);
                setAnimating(false);
            }, 300);
        } else {
            setCollapsed(false);
        }
    };

    const toggleMobileMenu = useCallback(() => {
        setMobileMenuActive(prev => {
            if (!prev) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
            return !prev;
        });
    }, []);

    const handleMenuClick = useCallback((menu) => {
        setSelectedMenu(menu);
        if (isMobile) {
            setMobileMenuActive(false);
        }
    }, [isMobile]);

    const handleEditProfileClick = useCallback(() => {
        setShowUserPanel(false);
        setShowUpdateProfileModal(true);
    }, []);

    const handleUpdateProfileClose = useCallback(() => {
        setShowUpdateProfileModal(false);
    }, []);

    const handleLogout = useCallback(async () => {
        try {
            await api.post('/auth/logout');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/signin');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }, [navigate]);

    const getInitials = useCallback((firstName, lastName) => {
        const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
        const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
        return `${firstInitial}${lastInitial}` || 'U';
    }, []);

    // Handle resending verification email
    const handleResendVerification = useCallback(async () => {
        try {
            await api.post('/auth/email/resend', { email: user?.email });
            setResendStatus({
                message: 'Verification email has been resent successfully!',
                error: ''
            });
        } catch (err) {
            setResendStatus({
                message: '',
                error: err.response?.data?.message || 'Failed to resend verification email'
            });
        }
    }, [user]);

    // Cache buster for profile images
    const getProfileImageUrl = useCallback((url) => {
        if (!url) return '';
        const timestamp = new Date().getTime();
        return `${url}?t=${timestamp}`;
    }, []);

    // Optimized success handler for profile update
    const handleProfileUpdateSuccess = useCallback(async () => {
        try {
            const response = await api.get('/auth/me');
            const userData = response.data;
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
            setUpdateSuccess(true);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }, []);

    useEffect(() => {
        if (updateSuccess) {
            const userData = JSON.parse(localStorage.getItem('user'));
            if (userData) {
                setUser(userData);
            }
            handleUpdateProfileClose();
            setUpdateSuccess(false);
        }
    }, [updateSuccess, handleUpdateProfileClose]);

    const handleUpdatePasswordClose = useCallback(() => {
        setShowUpdatePasswordModal(false);
    }, []);

    const menuItems = useMemo(() => [
        { icon: <FiHome />, text: 'Dashboard', key: 'dashboard' },
        { icon: <FiCalendar />, text: 'Events', key: 'Events' },
        { icon: <FiCheckSquare />, text: 'Tasks', key: 'Tasks' },
        { icon: <FiUsers />, text: 'Guest-list', key: 'Guest-list' },
        { icon: <FiBriefcase />, text: 'vendors', key: 'vendors' },
        { icon: <FiDollarSign />, text: 'Budget and payements', key: 'Budget and payements' },
        { icon: <FiMessageCircle />, text: 'communication', key: 'communication' },
        { icon: <FiFileText />, text: 'Documents', key: 'Documents' },
        { icon: <FiImage />, text: 'Gallary', key: 'Gallary' },
        { icon: <FiSettings />, text: 'System Settings', key: 'settings' }
    ], []);

    const renderContent = useCallback(() => {
        switch (selectedMenu) {
            case 'dashboard': return <DashboardContent onSelectMenu={handleMenuClick} />;
            case 'Events': return <EventContent />;
            case 'Tasks': return <EventTasks />;
            case 'Guest-list': return <GuestList />;
            case 'vendors': return <VendorsContent />;
            case 'Budget and payements': return <BudgetPayement />;
            case 'communication': return <Communication />;
            case 'Documents': return <EventDocument />;
            case 'Gallary': return <EventGallary />;
            default: return <DashboardContent onSelectMenu={handleMenuClick} />;
        }
    }, [selectedMenu, handleMenuClick]);

    if (!user) return <div className="loading-spinner">Loading...</div>;

    return (
        <EventProvider>
            <div className="admin-dashboard">
                {/* Mobile Header */}
                {isMobile && (
                    <div className="mobile-header">
                        <div className="mobile-header-content" data-aos="fade-down">
                            <button
                                className={`hamburger-menu ${mobileMenuActive ? 'active' : ''}`}
                                onClick={toggleMobileMenu}
                            >
                                <span></span>
                                <span></span>
                                <span></span>
                            </button>

                            <div className="mobile-search">
                                <FiSearch className="search-icon" />
                                <input type="text" placeholder="Search..." />
                            </div>

                            <div className="mobile-user-area" onClick={() => setShowUserPanel(true)}>
                                <div className="mobile-notification-bell">
                                    <img className="bell-icon" src={notification} alt="Notifications" />
                                </div>
                                {user.profile_picture ? (
                                    <img
                                        src={getProfileImageUrl(`http://127.0.0.1:8000/storage/${user.profile_picture}`)}
                                        alt="User"
                                        className="mobile-user-avatar"
                                    />
                                ) : (
                                    <div className="avatar-initials-small">
                                        {getInitials(user.first_name, user.last_name)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Sidebar */}
                <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileMenuActive ? 'mobile-active' : ''}`}>
                    {!isMobile && (
                        <div className="sidebar-header" data-aos="fade-right">
                            <div className="logo-icon">
                                <img className='e-icon' src={E} alt="Logo" />
                            </div>
                            {!collapsed && (
                                <span className="logo-text">
                                    <img className='Eventura-text' src={Eventura} alt="Eventura" />
                                </span>
                            )}
                        </div>
                    )}

                    <nav className="sidebar-nav" data-aos="fade-right">
                        <ul>
                            {menuItems.map((item) => (
                                <li
                                    key={item.key}
                                    className={selectedMenu === item.key ? 'active' : ''}
                                    onClick={() => handleMenuClick(item.key)}
                                >
                                    <span className="nav-icon">{item.icon}</span>
                                    <span className="nav-text">{item.text}</span>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="sidebar-footer">
                        <button className="logout-btn" onClick={() => setShowLogoutConfirm(true)}>
                            <span className="logout-icon"><FiLogOut /></span>
                            {(!collapsed && !isMobile) && <span>Logout</span>}
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="main">
                    <div className="main-content">
                        {/* Desktop Header */}
                        {!isMobile && (
                            <header className="top-header" data-aos="fade-down">
                                <button className="circle-toggle" onClick={toggleSidebar}>
                                    <div className={`circle-icon ${collapsed ? 'collapsed' : ''} ${animating ? (collapsed ? 'expanding' : 'collapsing') : ''}`}>
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </button>
                                <div className="header-content">
                                    <div className="page-title" data-aos="fade-up" data-aos-delay="200">
                                        <p className="page-title-spans">
                                            <span className="page-title-span">Dashboard</span>
                                            <span>/</span>
                                            <span className='slash-event'>{selectedMenu.charAt(0).toUpperCase() + selectedMenu.slice(1)}</span>
                                        </p>
                                        <h3 className='event-heading'>{selectedMenu.charAt(0).toUpperCase() + selectedMenu.slice(1)}</h3>
                                    </div>
                                    <div className="search-box" data-aos="fade-up" data-aos-delay="400">
                                        <button className="search-icon"><FiSearch /></button>
                                        <input type="text" placeholder={`Search ${selectedMenu}`} />
                                    </div>
                                    <div className="user-area" data-aos="fade-up" data-aos-delay="600">
                                        <div className="notification-bell">
                                            <img className="bell-icon" src={notification} alt="Notifications" />
                                        </div>
                                        <div className="user-profile" onClick={() => setShowUserPanel(true)}>
                                            {user.profile_picture ? (
                                                <img
                                                    src={getProfileImageUrl(`http://127.0.0.1:8000/storage/${user.profile_picture}`)}
                                                    alt="User"
                                                    className="user-avatar"
                                                />
                                            ) : (
                                                <div className="avatar-initials-small">
                                                    {getInitials(user.first_name, user.last_name)}
                                                </div>
                                            )}
                                            {!collapsed && (
                                                <div className="user-info">
                                                    <div className="user-name">
                                                        {user.first_name} {user.last_name}
                                                    </div>
                                                    <div className="user-role">
                                                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </header>
                        )}

                        <div className="content-wrapper" data-aos="fade-up" data-aos-duration="1200">
                            {renderContent()}
                        </div>
                    </div>
                </main>

                {/* User Profile Panel */}
                <div className={`user-panel-overlay ${showUserPanel ? 'active' : ''}`} onClick={() => setShowUserPanel(false)}>
                    <div className="user-panel" onClick={e => e.stopPropagation()}>
                        <div className="panel-header">
                            <button className="close-btn" onClick={() => setShowUserPanel(false)}>
                                <FiX />
                            </button>
                            <h3>My Profile</h3>
                        </div>

                        <div className="user-avatar-container">
                            {user.profile_picture ? (
                                <img
                                    src={getProfileImageUrl(`http://127.0.0.1:8000/storage/${user.profile_picture}`)}
                                    alt="Profile"
                                    className="panel-avatar"
                                />
                            ) : (
                                <div className="avatar-initials">
                                    {getInitials(user.first_name, user.last_name)}
                                </div>
                            )}
                            <h4>{user.first_name} {user.last_name}</h4>
                            <div className="user-role-badge">{user.role}</div>
                        </div>

                        <div className="user-details">
                            {/* Personal Information */}
                            <div className="details-section">
                                <h4 className="section-title">Personal Information</h4>
                                <div className="detail-item">
                                    <FiUser className="detail-icon" />
                                    <div>
                                        <span className="detail-label">Full Name</span>
                                        <span className="detail-value">
                                            {user.first_name} {user.last_name}
                                        </span>
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <FiMail className="detail-icon" />
                                    <div>
                                        <span className="detail-label">Email</span>
                                        <span className="detail-value">{user.email}</span>
                                        {user.email_verified_at ? (
                                            <span className="verified-badge">Verified</span>
                                        ) : (
                                            <div className="verification-action">
                                                <span className="unverified-badge">Not Verified</span>
                                                <button
                                                    className="resend-link"
                                                    onClick={handleResendVerification}
                                                >
                                                    Resend Verification
                                                </button>
                                                {resendStatus.message && (
                                                    <p className="resend-success">{resendStatus.message}</p>
                                                )}
                                                {resendStatus.error && (
                                                    <p className="resend-error">{resendStatus.error}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <FiPhone className="detail-icon" />
                                    <div>
                                        <span className="detail-label">Phone</span>
                                        <span className="detail-value">
                                            {user.phone || 'Not provided'}
                                        </span>
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <div className="detail-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M12 2a5 5 0 1 0 5 5 5 5 0 0 0-5-5zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3z" />
                                            <path d="M12 22a10 10 0 1 1 10-10 10 10 0 0 1-10 10zm0-18a8 8 0 1 0 8 8 8 8 0 0 0-8-8z" />
                                            <path d="M12 18a6 6 0 1 1 6-6 6 6 0 0 1-6 6zm0-10a4 4 0 1 0 4 4 4 4 0 0 0-4-4z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="detail-label">Gender</span>
                                        <span className="detail-value">
                                            {user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : 'Not specified'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="details-section">
                                <h4 className="section-title">Contact Information</h4>
                                <div className="detail-item">
                                    <div className="detail-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                            <circle cx="12" cy="10" r="3" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="detail-label">Address</span>
                                        <span className="detail-value">
                                            {user.address || 'Not provided'}
                                        </span>
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <div className="detail-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                            <line x1="16" y1="2" x2="16" y2="6" />
                                            <line x1="8" y1="2" x2="8" y2="6" />
                                            <line x1="3" y1="10" x2="21" y2="10" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="detail-label">City</span>
                                        <span className="detail-value">
                                            {user.city || 'Not provided'}
                                        </span>
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <div className="detail-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-9-9 9 9 0 0 1 9-9 9 9 0 0 1 9 9z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    </div>
                                    <div>
                                        <span className="detail-label">Country</span>
                                        <span className="detail-value">
                                            {user.country || 'Not provided'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Account Information */}
                            <div className="details-section">
                                <h4 className="section-title">Account Information</h4>
                                <div className="detail-item">
                                    <FiShield className="detail-icon" />
                                    <div>
                                        <span className="detail-label">Role</span>
                                        <span className="detail-value">
                                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                        </span>
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <FiCalendar className="detail-icon" />
                                    <div>
                                        <span className="detail-label">Last Login</span>
                                        <span className="detail-value">
                                            {user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never logged in'}
                                        </span>
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <FiCalendar className="detail-icon" />
                                    <div>
                                        <span className="detail-label">Account Created</span>
                                        <span className="detail-value">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                           {/* Social Media */}
                        {(user.facebook_url || user.instagram_url || user.tiktok_url) && (
                            <div className="details-section">
                                <h4 className="section-title">Social Media</h4>
                                {user.facebook_url && (
                                    <div className="detail-item">
                                        <div className="detail-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#3b5998">
                                                <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <span className="detail-label">Facebook</span>
                                            <a href={user.facebook_url} target="_blank" rel="noopener noreferrer" className="social-link">
                                                View Profile
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {user.instagram_url && (
                                    <div className="detail-item">
                                        <div className="detail-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#e1306c">
                                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <span className="detail-label">Instagram</span>
                                            <a href={user.instagram_url} target="_blank" rel="noopener noreferrer" className="social-link">
                                                View Profile
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {user.tiktok_url && (
                                    <div className="detail-item">
                                        <div className="detail-icon">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#000000">
                                                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <span className="detail-label">TikTok</span>
                                            <a href={user.tiktok_url} target="_blank" rel="noopener noreferrer" className="social-link">
                                                View Profile
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    

                        <div className="panel-actions">
                            <button
                                className="edit-profile-btn"
                                onClick={handleEditProfileClick}
                            >
                                <FiEdit /> Edit Profile
                            </button>

                            <button
                                className="change-password-btn"
                                onClick={() => {
                                    setShowUserPanel(false);
                                    setShowUpdatePasswordModal(true);
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                Change Password
                            </button>

                            <button
                                className="logout-btn"
                                onClick={() => {
                                    setShowUserPanel(false);
                                    setShowLogoutConfirm(true);
                                }}
                            >
                                <FiLogOut /> Logout
                            </button>
                        </div>
                    </div>
                </div>

                {/* Update Profile Modal */}
          {showUpdateProfileModal && (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Edit Profile</h3>
            <button 
              className="modal-close-btn" 
              onClick={handleUpdateProfileClose}
            >
              <FiX />
            </button>
          </div>
          <UpdateProfile 
            user={user} 
            onBack={handleUpdateProfileClose} 
            onSuccess={handleProfileUpdateSuccess}
          />
        </div>
      </div>
    )}

                {/* Update Password Modal */}
                   {showUpdatePasswordModal && (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3>Update Password</h3>
            <button 
              className="modal-close-btn" 
              onClick={handleUpdatePasswordClose}
            >
              <FiX />
            </button>
          </div>
          <UpdatePassword onBack={handleUpdatePasswordClose} />
        </div>
      </div>
    )}


                {/* Logout Confirmation */}
                {showLogoutConfirm && (
                    <div className="logout-confirmation-overlay">
                        <div className="logout-confirmation-dialog">
                            <div className="dialog-content">
                                <h3>Confirm Logout</h3>
                                <p>Are you sure you want to logout?</p>
                                <div className="dialog-buttons">
                                    <button
                                        className="confirm-btn"
                                        onClick={handleLogout}
                                    >
                                        Yes, Logout
                                    </button>
                                    <button
                                        className="cancel-btn"
                                        onClick={() => setShowLogoutConfirm(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </EventProvider>
    );
};

export default Client_Dashboard;