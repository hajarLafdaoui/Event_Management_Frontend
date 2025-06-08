import React from 'react';
import { useState } from 'react';
import '../../css/users/userDetails.css';
import '../../css/TaskShow.css';
import { FiArrowLeft, FiEdit, FiCalendar, FiFlag, FiUser, FiCheckCircle, FiClock, FiXCircle } from 'react-icons/fi';
import TaskUpdate from './TaskUpdate';

const TaskShow = ({ task, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdateClick = () => {
    setIsEditing(true);
  };

  const handleUpdateComplete = () => {
    setIsEditing(false);
  };

  if (isEditing) {
    return <TaskUpdate task={task} onBack={handleUpdateComplete} />;
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <FiFlag className="text-red-500" />;
      case 'medium':
        return <FiFlag className="text-yellow-500" />;
      case 'low':
        return <FiFlag className="text-green-500" />;
      default:
        return <FiFlag />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FiCheckCircle className="text-green-500" />;
      case 'in_progress':
        return <FiClock className="text-blue-500" />;
      case 'cancelled':
        return <FiXCircle className="text-gray-500" />;
      default:
        return <FiClock className="text-yellow-500" />;
    }
  };

  return (
    <div className="user-show-container">
      <div className="user-show-header">
        <div className="user-show-subheader">
          <p className="user-show-subtitle">View and manage task details</p>
          <div className="user-show-divider"></div>
        </div>
        <div className="event-content-header">
          <button 
            onClick={() => onBack(false)} 
            className="back-to-list-btn"
          >
            <FiArrowLeft className="back-icon" />
            <span className="back-text">Back to Tasks List</span>
          </button>
        </div>
      </div>

      <div className="user-show-content">
        {/* Left Column - Task Overview */}
        <div className="user-show-profile-col">
          <div className="task-show-title-container">
            <h2 className="task-show-title">{task.task_name}</h2>
            <button 
              className="task-show-action-btn task-show-action-update"
              onClick={handleUpdateClick}
            >
              <FiEdit className="mr-2" />
              Edit Task
            </button>
          </div>

          <div className="task-show-description">
            <p>{task.task_description || 'No description provided'}</p>
          </div>

          <div className="task-show-meta">
            <div className="task-show-meta-item">
              <FiCalendar className="task-show-meta-icon" />
              <span className="task-show-meta-label">Created:</span>
              <span className="task-show-meta-value">
                {task.created_at ? new Date(task.created_at).toLocaleDateString() : 'Unknown'}
              </span>
            </div>

            {task.due_date && (
              <div className="task-show-meta-item">
                <FiCalendar className="task-show-meta-icon" />
                <span className="task-show-meta-label">Due Date:</span>
                <span className="task-show-meta-value">
                  {new Date(task.due_date).toLocaleDateString()}
                </span>
              </div>
            )}

            {task.completed_at && (
              <div className="task-show-meta-item">
                <FiCheckCircle className="task-show-meta-icon" />
                <span className="task-show-meta-label">Completed:</span>
                <span className="task-show-meta-value">
                  {new Date(task.completed_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Task Details */}
        <div className="user-show-details-col">
          {/* Task Information Section */}
          <div className="user-show-section">
            <h3 className="user-show-section-title">Task Information</h3>
            <div className="user-show-section-content">
              <div className="user-show-details-grid">
                <div className="user-show-detail-item">
                  <span className="user-show-detail-label">Status</span>
                  <div className="user-show-detail-value">
                    {getStatusIcon(task.status)}
                    <span className="ml-2 capitalize">{task.status.replace('_', ' ')}</span>
                  </div>
                </div>

                <div className="user-show-detail-item">
                  <span className="user-show-detail-label">Priority</span>
                  <div className="user-show-detail-value">
                    {getPriorityIcon(task.priority)}
                    <span className="ml-2 capitalize">{task.priority}</span>
                  </div>
                </div>

                <div className="user-show-detail-item">
                  <span className="user-show-detail-label">Progress</span>
                  <div className="user-show-detail-value">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${task.progress_percentage || 0}%` }}
                      ></div>
                    </div>
                    <span className="ml-2">{task.progress_percentage || 0}%</span>
                  </div>
                </div>

                <div className="user-show-detail-item">
                  <span className="user-show-detail-label">Assigned To</span>
                  <span className="user-show-detail-value capitalize">
                    {task.assigned_to === 'client' ? 'Client' : 
                     task.assigned_to === 'vendor' ? 'Vendor' : 'Unassigned'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Event Information Section */}
          {task.event && (
            <div className="user-show-section">
              <h3 className="user-show-section-title">Event Information</h3>
              <div className="user-show-section-content">
                <div className="user-show-details-grid">
                  <div className="user-show-detail-item">
                    <span className="user-show-detail-label">Event Name</span>
                    <span className="user-show-detail-value">{task.event.event_name}</span>
                  </div>

                  <div className="user-show-detail-item">
                    <span className="user-show-detail-label">Event Date</span>
                    <span className="user-show-detail-value">
                      {task.event.event_date ? new Date(task.event.event_date).toLocaleDateString() : 'Not set'}
                    </span>
                  </div>

                  <div className="user-show-detail-item">
                    <span className="user-show-detail-label">Event Location</span>
                    <span className="user-show-detail-value">
                      {task.event.location || 'Not specified'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Template Information Section */}
          {task.template && (
            <div className="user-show-section">
              <h3 className="user-show-section-title">Template Information</h3>
              <div className="user-show-section-content">
                <div className="user-show-details-grid">
                  <div className="user-show-detail-item">
                    <span className="user-show-detail-label">Template Name</span>
                    <span className="user-show-detail-value">{task.template.task_name}</span>
                  </div>

                  <div className="user-show-detail-item">
                    <span className="user-show-detail-label">Default Priority</span>
                    <span className="user-show-detail-value capitalize">
                      {task.template.default_priority}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskShow;