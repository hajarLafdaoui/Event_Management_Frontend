import React from 'react';
import '../../css/DashboardContentClient.css';
import { Plus, Upload } from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useEvents } from '../../context/EventContext';
import AOS from 'aos';
import 'aos/dist/aos.css';
function DashboardContent({ onSelectMenu}) {
const [hovered, setHovered] = React.useState(false);
  const { events, loading, error } = useEvents();
React.useEffect(() => {
  AOS.init({ duration: 800, easing: 'ease-in-out', once: true });
}, []);
// Calculate event statistics
const draftEvents = events.filter(ev => ev.status === 'draft').length;
const plannedEvents = events.filter(ev => ev.status === 'planned').length;
const inProgressEvents = events.filter(ev => ev.status === 'in_progress').length;
const completedEvents = events.filter(ev => ev.status === 'completed').length;
const cancelledEvents = events.filter(ev => ev.status === 'cancelled').length;

const progress = events.length ? Math.round((completedEvents / events.length) * 100) : 0;
const upcomingEvents = events
    .filter(ev => ev.status === 'planned' || ev.status === 'in_progress')
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
    .slice(0, 5);

  return (
    <div className="dashboard-container">
      <div className="header" >
        <h1 data-aos="fade-right" >Dashboard</h1>
        <div className="buttons" data-aos="fade-left">
          <button className="btn add"
            onClick={() => onSelectMenu('Events')}
          >
          <Plus size={16} /> Add Event</button>
          <button className="btn import"><Upload size={16} /> Import Data</button>
        </div>
      </div>

      {loading ? (
        <p>Loading events...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <>
         <div className="stats-grid">
            <div className="card" data-aos="zoom-in">
              <h3>Total Events</h3>
              <div className="number">{events.length}</div>
            </div>
            <div className="card" data-aos="zoom-in">
              <h3>Draft</h3>
              <div className="number">{draftEvents}</div>
            </div>
            <div className="card" data-aos="zoom-in">
              <h3>Planned</h3>
              <div className="number" >{plannedEvents}</div>
            </div>
            <div className="card" data-aos="zoom-in">
              <h3>In Progress</h3>
              <div className="number">{inProgressEvents}</div>
            </div>
            <div className="card" data-aos="zoom-in">
              <h3>Completed</h3>
              <div className="number">{completedEvents}</div>
            </div>
            <div className="card" data-aos="zoom-in">
              <h3>Cancelled</h3>
              <div className="number">{cancelledEvents}</div>
            </div>
          </div>


          <div className="lower-grid" >
            <div className="card analytics" data-aos="fade-right">Event Analytics (Graph Placeholder)</div>

            <div className="card reminder" data-aos="zoom-in">
              <h3>Reminders</h3>
              <p>Meeting with Arc Company</p>
              <span>Time: 02:00 pm - 04:00 pm</span>
              <button className="btn start-meeting">Start Meeting</button>
            </div>

            <div className="card project-list" data-aos="fade-left">
                <div className="card-header">
                    <h3>Events</h3>
                      <button onClick={() => onSelectMenu('Events')} className="goto-icon">
                        <Plus size={16} /> More
                      </button>
                </div>
               <ul>
                  {upcomingEvents.map(ev => (
                    <li key={ev.event_id}>
                      <strong>{ev.event_name}</strong><br />
                      <span>{new Date(ev.start_datetime).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>

            </div>

            <div className="card team" >
              <h3>Team Collaboration</h3>
              <ul>
                <li>Alexandra Deff - Registration Setup</li>
                <li>Edwin Adenike - Venue Booking</li>
                <li>Isaac Oluwatemilorun - Promotions</li>
                <li>David Oshodi - Guest List</li>
              </ul>
            </div>

            <div className="card progress" data-aos="zomm-left" onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
               >
              <h3>Overall Progress</h3>
              <CircularProgressbar
                value={progress}
                text={`${progress}%`}
                styles={buildStyles({
                  pathColor: hovered ? '#2A0637' : '#714897',
                  textColor: hovered ? '#ffffff' : '#5a3773',
                  trailColor: '#e0e0e0',
                })}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default DashboardContent;
