import React, { useState } from 'react';
import EventTemplateManager from './EventTemplateManager';
// import TaskTemplateManager from './TaskTemplateManager';
// import EmailTemplateManager from './EmailTemplateManager';
// import FAQManager from './FAQManager';
// import StaticPageManager from './StaticPageManager';

const ContentManagement = ({user}) => {
    const [activeTab, setActiveTab] = useState('event');

    return (
        <div className="content-management">
            <h2>Content Management</h2>
            <div className="tabs">
                <button onClick={() => setActiveTab('event')}>Event Templates</button>
                <button onClick={() => setActiveTab('task')}>Task Templates</button>
                <button onClick={() => setActiveTab('email')}>Email Templates</button>
                <button onClick={() => setActiveTab('faq')}>FAQs</button>
                <button onClick={() => setActiveTab('static')}>Static Pages</button>
            </div>
            <div className="tab-content">
                {activeTab === 'event' && <EventTemplateManager  user={user}/>}
                {/* {activeTab === 'task' && <TaskTemplateManager />}
                {activeTab === 'email' && <EmailTemplateManager />}
                {activeTab === 'faq' && <FAQManager />}
                {activeTab === 'static' && <StaticPageManager />} */}
            </div>
        </div>
    );
};

export default ContentManagement;
