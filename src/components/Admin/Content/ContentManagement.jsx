import React, { useState } from 'react';
import EventTemplateManager from './EventTemplateManager';
import TaskTemplateManager from './TaskTemplateManager';
// import EmailTemplateManager from './EmailTemplateManager';
// import FAQManager from './FAQManager';
// import StaticPageManager from './StaticPageManager';
import { FiPlus } from 'react-icons/fi';

const ContentManagement = ({ user }) => {
    const [activeTab, setActiveTab] = useState('event');
    const tabs = [
        { id: 'event', label: 'Event Templates' },
        { id: 'task', label: 'Task Templates' },
        { id: 'email', label: 'Email Templates' },
        { id: 'faq', label: 'FAQs' },
        { id: 'static', label: 'Static Pages' }
    ];

    // Calculate indicator position
    const activeIndex = tabs.findIndex(tab => tab.id === activeTab);
    const tabWidth = 100 / tabs.length;
    const leftPosition = activeIndex * tabWidth;

    return (
        <div className="content-management">
            <div className="tabs-container">
                <div className="tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="tab-indicator-container">
                    <div
                        className="tab-indicator"
                        style={{
                            width: `${tabWidth}%`,
                            transform: `translateX(${activeIndex * 100}%)`,
                        }}
                    />
                </div>
            </div>


            <div className="tab-content">
                {activeTab === 'event' && <EventTemplateManager user={user} />}
                {activeTab === 'task' && <TaskTemplateManager user={user} />}
                {/* {activeTab === 'email' && <EmailTemplateManager />}
                {activeTab === 'faq' && <FAQManager />}
                {activeTab === 'static' && <StaticPageManager />} */}
            </div>
        </div>
    );
};

export default ContentManagement;