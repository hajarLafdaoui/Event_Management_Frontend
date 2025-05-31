import React, { useState, useEffect } from 'react';
import '../../css/AdminDashboard.css';
import E from '../.././uploads/logo/E.png';
import Eventura from '../.././uploads/logo/Eventura.png';
import notification from '../.././uploads/icons/notification.png';

// Import your components for each section
// import DashboardContent from './DashboardContent';
// import UsersManagement from './UsersManagement';
// import VendorsApprovals from './VendorsApprovals';
// import ContentModeration from './ContentModeration';
// import EventsOversight from './EventsOversight';
// import SystemSettings from './SystemSettings';

import {
    FiHome,
    FiUsers,
    FiUserCheck,
    FiFlag,
    FiCalendar,
    FiSettings,
    FiLogOut,
    FiBell,
    FiSearch,
    FiX
} from 'react-icons/fi';
import UserList from './Users/UserList';
import Dashboard_content from './Dashboard_content';

const Admin_Dashboard = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState('dashboard');
    const [isMobile, setIsMobile] = useState(false);
    const [mobileMenuActive, setMobileMenuActive] = useState(false);
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
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
    }, []);

    const toggleSidebar = () => {
        if (!collapsed) {
            setAnimating(true);
            setTimeout(() => {
                setCollapsed(true);
                setAnimating(false);
            }, 600);
        } else {
            setCollapsed(false);
        }
    };

    const toggleMobileMenu = () => {
        setMobileMenuActive(!mobileMenuActive);
        if (!mobileMenuActive) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    };

    useEffect(() => {
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    const handleMenuClick = (menu) => {
        setSelectedMenu(menu);
        if (isMobile) {
            setMobileMenuActive(false);
        }
    };

    // Mock user data
    const user = {
        name: 'Admin User',
        role: 'Super Admin',
        avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
        notifications: 3
    };

    const renderContent = () => {
        switch (selectedMenu) {
            case 'dashboard':
                return <Dashboard_content />;
            case 'users':
                return <UserList />;
            case 'vendors':
                // return <VendorsApprovals />;
            case 'content':
                // return <ContentModeration />;
            case 'events':
                // return <EventsOversight />;
            case 'settings':
                // return <SystemSettings />;
            default:
                // return <DashboardContent />;
        }
    };

    return (
        <div className="admin-dashboard">
            {/* Mobile Header */}
            {isMobile && (
                <div className="mobile-header">
                    <div className="mobile-header-content">
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
                        
                        <div className="mobile-user-area">
                            <div className="mobile-notification-bell">
                                <img className="bell-icon" src={notification} alt="Notifications" />
                            </div>
                            <img 
                                src={user.avatar} 
                                alt="User" 
                                className="mobile-user-avatar" 
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileMenuActive ? 'mobile-active' : ''}`}>
                {!isMobile && (
                    <div className="sidebar-header">
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

                <nav className="sidebar-nav">
                    <ul>
                        {[
                            { icon: <FiHome />, text: 'Dashboard', key: 'dashboard' },
                            { icon: <FiUsers />, text: 'User Management', key: 'users' },
                            { icon: <FiUserCheck />, text: 'Vendor Approvals', key: 'vendors' },
                            { icon: <FiFlag />, text: 'Content Moderation', key: 'content' },
                            { icon: <FiCalendar />, text: 'Events Oversight', key: 'events' },
                            { icon: <FiSettings />, text: 'System Settings', key: 'settings' }
                        ].map((item) => (
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
                    <button className="logout-btn">
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
                        <header className="top-header">
                            <button className="circle-toggle" onClick={toggleSidebar}>
                                <div className={`circle-icon ${collapsed ? 'collapsed' : ''} ${animating ? (collapsed ? 'expanding' : 'collapsing') : ''}`}>
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </button>
                            <div className="header-content">
                                <div className="page-title">
                                    <p className="page-title-spans">
                                        <span className="page-title-span">Dashboard</span>
                                        <span>/</span>
                                        <span className='slash-event'>{selectedMenu.charAt(0).toUpperCase() + selectedMenu.slice(1)}</span>
                                    </p>
                                    <h3 className='event-heading'>{selectedMenu.charAt(0).toUpperCase() + selectedMenu.slice(1)}</h3>
                                </div>
                                <div className="search-box">
                                    <button className="search-icon"><FiSearch /></button>
                                    <input type="text" placeholder={`Search ${selectedMenu}`} />
                                </div>
                                <div className="user-area">
                                    <div className="notification-bell">
                                        <img className="bell-icon" src={notification} alt="Notifications"/>
                                    </div>
                                    <div className="user-profile">
                                        <img src={user.avatar} alt="User" className="user-avatar" />
                                        {!collapsed && (
                                            <div className="user-info">
                                                <div className="user-name">{user.name}</div>
                                                <div className="user-role">{user.role}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </header>
                    )}

                    <div className="content-wrapper">
                        {renderContent()}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Admin_Dashboard;