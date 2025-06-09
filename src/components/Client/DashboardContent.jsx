import React from 'react';
import '../../css/DashboardContentClient.css';
import '../../css/users/UserStats.css';
import { Plus, Upload } from 'lucide-react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { useEvents } from '../../context/EventContext';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { FiSearch, FiFilter, FiRefreshCw, FiMoreVertical, FiEdit2, FiEye, FiTrash2, FiCheck, FiClock, FiAlertTriangle } from 'react-icons/fi';
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
            <div className="stat-card stat-card-total" data-aos="zoom-in">
              <div className="stat-content" >
                <p className="stat-label">Total Events</p>
                <p className="stat-value">{events.length}</p>
              </div>
              <div className="stat-icon-container stat-icon-total">
                  <FiCheck className="task-icon" />
              </div>
            </div>
            <div className="stat-card stat-card-draft" data-aos="zoom-in">
              <div className="stat-content" >
                <p className="stat-label">Draft</p>
                <p className="stat-value">{draftEvents}</p>
              </div>
              <div className="stat-icon-container stat-icon-draft">
                <FiClock className="task-icon" />
              </div>
            </div>
            <div className="stat-card stat-card-planned" data-aos="zoom-in">
              <div className="stat-content" >
                <p className="stat-label">Planned</p>
                <p className="stat-value">{plannedEvents}</p>
              </div>
              <div className="stat-icon-container stat-icon-new">
                <FiAlertTriangle className="task-icon" />
              </div>
            </div>
            <div className="stat-card stat-card-in-progress" data-aos="zoom-in">
              <div className="stat-content" >
                <p className="stat-label">In Progress</p>
                <p className="stat-value">{inProgressEvents}</p>
              </div>
              <div className="stat-icon-container stat-icon-in-progress">
                <FiEdit2 className="task-icon" />
              </div>
            </div>
            <div className="stat-card stat-card-active"data-aos="zoom-in">
              <div className="stat-content" >
                <p className="stat-label">Completed</p>
                <p className="stat-value">{completedEvents}</p>
              </div>
              <div className="stat-icon-container stat-icon-active">
                <FiCheck className="task-icon" />
              </div>  
            </div>
            <div className="stat-card stat-card-cancelled"data-aos="zoom-in">
              <div className="stat-content" >
                <p className="stat-label">Cancelled</p>
                <p className="stat-value">{cancelledEvents}</p>
              </div>
              <div className="stat-icon-container stat-icon-cancelled">
                <FiTrash2 className="task-icon" />
              </div>
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

            <div className="card progress"  onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
               >
              <h3>Overall Progress</h3>
              <CircularProgressbar
                value={progress}
                text={`${progress}%`}
                styles={buildStyles({
                  pathColor:  '#714897',
                  textColor:  '#5a3773',
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
