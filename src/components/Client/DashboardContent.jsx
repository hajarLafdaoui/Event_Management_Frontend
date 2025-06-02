import React, { useState, useEffect } from 'react';
import  '../../css/DashboardContent.css';
import {
  Plus,
  Upload,
} from 'lucide-react';
import {
  CircularProgressbar,
  buildStyles
} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

function DashboardContent() {

  return (
    <div className="dashboard-container">
      <div className="header">
        <h1>Dashboard</h1>
        <p>Plan, prioritize, and accomplish your tasks with ease.</p>
        <div className="buttons">
          <button className="btn add"><Plus size={16} /> Add Project</button>
          <button className="btn import"><Upload size={16} /> Import Data</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="card total-projects">
          <h3>Total Projects</h3>
          <div className="number">24</div>
          <span className="growth">+5 Increased from last month</span>
        </div>
        <div className="card ended-projects">
          <h3>Ended Projects</h3>
          <div className="number">10</div>
          <span className="growth">+10 Increased from last month</span>
        </div>
        <div className="card running-projects">
          <h3>Running Projects</h3>
          <div className="number">12</div>
          <span className="growth">+2 Increased from last month</span>
        </div>
        <div className="card pending-projects">
          <h3>Pending Projects</h3>
          <div className="number">2</div>
          <span className="status">On Discuss</span>
        </div>
      </div>

      <div className="lower-grid">
        <div className="card analytics">Project Analytics (Graph Placeholder)</div>

        <div className="card reminder">
          <h3>Reminders</h3>
          <p>Meeting with Arc Company</p>
          <span>Time: 02:00 pm - 04:00 pm</span>
          <button className="btn start-meeting">Start Meeting</button>
        </div>

        <div className="card project-list">
          <h3>Projects</h3>
          <ul>
            <li>Develop API Endpoints</li>
            <li>Onboarding Flow</li>
            <li>Build Dashboard</li>
            <li>Optimize Page Load</li>
            <li>Cross-Browser Testing</li>
          </ul>
        </div>

        <div className="card team">
          <h3>Team Collaboration</h3>
          <ul>
            <li>Alexandra Deff - Github Repo (Completed)</li>
            <li>Edwin Adenike - Auth System (In Progress)</li>
            <li>Isaac Oluwatemilorun - Search & Filter (Pending)</li>
            <li>David Oshodi - Homepage Layout (In Progress)</li>
          </ul>
        </div>

        <div className="card progress">
          <h3>Project Progress</h3>
          <CircularProgressbar
            value={50}
            text={`50%`}
            styles={buildStyles({
              pathColor: `#714897`,
              textColor: '#5a3773',
              trailColor: '#e0e0e0'
            })}
          />
        </div>
      </div>
    </div>
  );
}

export default DashboardContent