import React, { useState, useEffect } from 'react';
import '../../css/AdminDashboard.css';
import E from '../.././uploads/logo/E.png';
import Eventura from '../.././uploads/logo/Eventura.png';
import notification from '../.././uploads/icons/notification.png';
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
import { EventProvider } from '../../context/EventContext';
import {
    FiHome,FiUsers,FiCheckSquare ,FiBriefcase ,FiCalendar,
    FiSettings,FiLogOut,FiDollarSign ,FiSearch,
    FiMessageCircle ,FiFileText,FiImage,
} from 'react-icons/fi';

const Client_Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState('Events');
    const [isMobile, setIsMobile] = useState(false);
    const [mobileMenuActive, setMobileMenuActive] = useState(false);
    const [animating, setAnimating] = useState(false);

    useEffect(()=>{
    AOS.init({
      duration: 1000,
      offset: 100,
    });
    AOS.refresh({
      duration: 1000,
      offset: 100,
    }); 
},[]);
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
                return <DashboardContent />;
            case 'Events':
                return  <EventContent />;
            case 'Tasks':
                 return <EventTasks />;
            case 'Guest-list':
                 return <GuestList/>;
            case 'vendors':
                return <VendorsContent/>;
            case 'Budget and payements':
                return <BudgetPayement/>;
            case 'communication':
                return <Communication/>;
            case 'Documents':
                return <EventDocument/>;
            case 'Gallary':
                return <EventGallary/>;
            case 'settings':
                // return <SystemSettings />;
            default:
                return <DashboardContent />;
        }
    };

    return (
        <EventProvider>
        <div className="admin-dashboard">
            {/* Mobile Header */}
            {isMobile && (
                <div className="mobile-header" >
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
            <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileMenuActive ? 'mobile-active' : ''}`}   >
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
                        {[
                            { icon: <FiHome />, text: 'Dashboard', key: 'dashboard' },
                            { icon: <FiCalendar />, text: 'Events', key: 'Events' },
                            { icon: <FiCheckSquare />, text: 'Tasks', key: 'Tasks' },
                            { icon: <FiUsers />, text: 'Guest-list', key: 'Guest-list' },
                            { icon: <FiBriefcase />, text: 'vendors', key: 'vendors' },
                            { icon:<FiDollarSign />, text: 'Budget and payements', key: 'Budget and payements' },
                            { icon: <FiMessageCircle />, text: 'communication', key: 'communication' },
                            { icon: <FiFileText />, text: 'Documents', key: 'Documents' },
                            { icon: <FiImage />, text: 'Gallary', key: 'Gallary' },
                            { icon: <FiSettings />, text: 'System Settings', key: 'settings' }
                        ].map((item) => (
                            <li
                                key={item.key}
                                className={selectedMenu === item.key ? 'active' : ''}
                                onClick={() => handleMenuClick(item.key)}
                                
                            >
                                <span className="nav-icon" >{item.icon}</span>
                                <span className="nav-text" >{item.text}</span>
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

                    <div className="content-wrapper" data-aos="fade-up" data-aos-duration="1200">
                        {renderContent()}
                    </div>
                </div>
            </main>
        </div>
    </EventProvider>
    );
}

export default Client_Dashboard
