import React, { useState, useEffect } from 'react';
import api from '../../api/api';
import TaskShow from './TaskShow';
import TaskUpdate from './TaskUpdate';
import TaskCreate from './TaskCreate';
import '../../css/users/UserStats.css';
import '../../css/users/UserTitle.css';
import '../../css/users/UserSearch.css';
import '../../css/users/UserFilter.css';
import '../../css/users/UserSort.css';
import '../../css/users/UserTable.css';
import '../../css/users/UserPagination.css';
import AOS from 'aos';
import 'aos/dist/aos.css';

import { toast, ToastContainer } from 'react-toastify';
import { FiSearch, FiFilter, FiRefreshCw, FiMoreVertical, FiEdit2, FiEye, FiTrash2, FiCheck, FiClock, FiAlertTriangle } from 'react-icons/fi';

import ConfirmDialog from '../ReusableComponent/ConfirmDialog';
import Alert from '../ReusableComponent/Alert';

const EventTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewMode, setViewMode] = useState('table');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    assignedTo: '',
    event: ''
  });
  
  const [confirmAction, setConfirmAction] = useState({
    show: false,
    taskId: null,
    action: null,
    message: ''
  });
  
  const [showSort, setShowSort] = useState(false);
  const [sortOption, setSortOption] = useState({
    field: 'id',
    direction: 'asc'
  });
  
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 10,
    total: 0
  });
  
  const [alert, setAlert] = useState(null);
  const [events, setEvents] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  React.useEffect(() => {
    AOS.init({ duration: 800, easing: 'ease-in-out', once: true });
  }, []);

  // Alert helper function
  const showAlert = (message, type, duration = 5000) => {
    setAlert({ message, type, duration });
    setTimeout(() => setAlert(null), duration);
  };

  // Fetch events for filter dropdown
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await api.get('events');
        setEvents(response.data);
      } catch (err) {
        console.error('Failed to fetch events:', err);
      }
    };
    fetchEvents();
  }, []);

  // Fetch tasks
  useEffect(() => {
    fetchTasks();
  }, [pagination.currentPage]);

  // Filter tasks when dependencies change
  useEffect(() => {
    filterTasks();
  }, [tasks, searchTerm, filters, sortOption]);

  const fetchTasks = async () => {
    try {
      const response = await api.get('event-tasks', {
        params: {
          page: pagination.currentPage,
          per_page: pagination.perPage
        }
      });

      setTasks(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.data.meta?.total || response.data.length || 0
      }));
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      showAlert('Failed to load tasks', 'error');
    }
  };

  const filterTasks = () => {
    let result = [...tasks];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(task =>
        (task.task_name?.toLowerCase() || '').includes(term) ||
        (task.task_description?.toLowerCase() || '').includes(term)
      );
    }

    // Apply status filter
    if (filters.status) {
      result = result.filter(task => task.status === filters.status);
    }

    // Apply priority filter
    if (filters.priority) {
      result = result.filter(task => task.priority === filters.priority);
    }

    // Apply assignedTo filter
    if (filters.assignedTo) {
      result = result.filter(task => task.assigned_to === filters.assignedTo);
    }

    // Apply event filter
    if (filters.event) {
      result = result.filter(task => task.event_id == filters.event);
    }

    // Apply sorting after all filters
    result = sortTasks(result);

    setFilteredTasks(result);
  };

  const sortTasks = (tasks) => {
    return [...tasks].sort((a, b) => {
      let comparison = 0;

      if (sortOption.field === 'name') {
        comparison = (a.task_name || '').localeCompare(b.task_name || '');
      } else if (sortOption.field === 'due_date') {
        const dateA = a.due_date ? new Date(a.due_date) : new Date(0);
        const dateB = b.due_date ? new Date(b.due_date) : new Date(0);
        comparison = dateA - dateB;
      } else if (sortOption.field === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        comparison = (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
      } else {
        // Default sort by ID
        comparison = (a.id || 0) - (b.id || 0);
      }

      return sortOption.direction === 'asc' ? comparison : -comparison;
    });
  };

  const handleSort = (field) => {
    const direction = sortOption.field === field && sortOption.direction === 'asc' ? 'desc' : 'asc';
    setSortOption({ field, direction });
    setShowSort(false);
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const toggleDropdown = (taskId) => {
    setDropdownOpen(dropdownOpen === taskId ? null : taskId);
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`event-tasks/${taskId}`);
      showAlert('Task deleted successfully', 'success');
      fetchTasks();
    } catch (error) {
      showAlert(`Failed to delete task: ${error.message}`, 'error');
    }
  };

  const showConfirmDialog = (taskId, action) => {
    let message = '';
    switch (action) {
      case 'delete':
        message = 'Are you sure you want to delete this task?';
        break;
      default:
        return;
    }

    setConfirmAction({
      show: true,
      taskId,
      action,
      message
    });
  };

  const handleConfirmAction = async () => {
    const { taskId, action } = confirmAction;

    try {
      switch (action) {
        case 'delete':
          await handleDeleteTask(taskId);
          break;
        default:
          break;
      }
    } catch (error) {
      showAlert(`Action failed: ${error.message}`, 'error');
    } finally {
      setConfirmAction({ show: false, taskId: null, action: null, message: '' });
    }
  };

  const handleShowTask = (task) => {
    setSelectedTask(task);
    setViewMode('show');
  };

  const handleUpdateTask = (task) => {
    setSelectedTask(task);
    setViewMode('update');
  };

  const handleBackToList = (shouldRefresh = false) => {
    setViewMode('table');
    setSelectedTask(null);
    if (shouldRefresh) {
      fetchTasks();
    }
  };

  // Calculate summary stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const highPriorityTasks = tasks.filter(task => task.priority === 'high').length;

  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="task-list-container">
      {/* Summary Cards */}
      {viewMode === 'table' && (
        <>
          <div className="stats-grid">
            <div className="stat-card stat-card-total" data-aos="zoom-in">
              <div className="stat-content">
                <p className="stat-label">Total Tasks</p>
                <p className="stat-value">{totalTasks}</p>
              </div>
              <div className="stat-icon-container stat-icon-total">
                <FiCheck className="task-icon" />
              </div>
            </div>

            <div className="stat-card stat-card-active" data-aos="zoom-in">
              <div className="stat-content">
                <p className="stat-label">Completed</p>
                <p className="stat-value">{completedTasks}</p>
              </div>
              <div className="stat-icon-container stat-icon-active">
                <FiClock className="task-icon" />
              </div>
            </div>

            <div className="stat-card stat-card-new" data-aos="zoom-in">
              <div className="stat-content">
                <p className="stat-label">High Priority</p>
                <p className="stat-value">{highPriorityTasks}</p>
              </div>
              <div className="stat-icon-container stat-icon-new">
                <FiAlertTriangle className="task-icon" />
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="search-filter-container" data-aos="fade-up">
            <div className="search-filter-content">
              <p className='search-filter-content-title'>Task List</p>
              <button
                onClick={() => setViewMode('create')}
                className="create-task-button"
              >
                Create Task
              </button>
              {/* SEARCH */}
              <div className="search-input-container">
                <div className="search2-icon">
                  <FiSearch />
                </div>
                <input
                  type="text"
                  placeholder="Search tasks..."
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* FILTER AND SORT  */}
              <div className="filter-sort-container">
                <div className="filter-dropdown-container">
                  <button
                    onClick={() => {
                      setShowFilters(!showFilters);
                      setShowSort(false);
                    }}
                    className="filter-button"
                  >
                    <FiFilter className="filter-icon" />
                    Filters
                  </button>
                  {showFilters && (
                    <div className="filter-dropdown-menu">
                      <div className="filter-dropdown-item">
                        <label className="filter-dropdown-label">Status</label>
                        <select
                          className="filter-dropdown-select"
                          value={filters.status}
                          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        >
                          <option value="">All Statuses</option>
                          <option value="not_started">Not Started</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>

                      <div className="filter-dropdown-item">
                        <label className="filter-dropdown-label">Priority</label>
                        <select
                          className="filter-dropdown-select"
                          value={filters.priority}
                          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                        >
                          <option value="">All Priorities</option>
                          <option value="high">High</option>
                          <option value="medium">Medium</option>
                          <option value="low">Low</option>
                        </select>
                      </div>

                      <div className="filter-dropdown-item">
                        <label className="filter-dropdown-label">Assigned To</label>
                        <select
                          className="filter-dropdown-select"
                          value={filters.assignedTo}
                          onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
                        >
                          <option value="">All Assignments</option>
                          <option value="client">Client</option>
                          <option value="vendor">Vendor</option>
                          <option value="none">Unassigned</option>
                        </select>
                      </div>

                      <div className="filter-dropdown-item">
                        <label className="filter-dropdown-label">Event</label>
                        <select
                          className="filter-dropdown-select"
                          value={filters.event}
                          onChange={(e) => setFilters({ ...filters, event: e.target.value })}
                        >
                          <option value="">All Events</option>
                          {events.map(event => (
                            <option key={event.event_id} value={event.event_id}>
                              {event.event_name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={() => {
                          setFilters({
                            status: '',
                            priority: '',
                            assignedTo: '',
                            event: ''
                          });
                          setShowFilters(false);
                        }}
                        className="clear-filters-button"
                      >
                        Clear Filters
                      </button>
                    </div>
                  )}
                </div>

                <div className="sort-dropdown-container">
                  <button
                    onClick={() => {
                      setShowSort(!showSort);
                      setShowFilters(false);
                    }}
                    className="sort-button"
                  >
                    <span>Sort by</span>
                    <svg
                      className={`sort-icon ${showSort ? 'active' : ''}`}
                      viewBox="0 0 24 24"
                      width="16"
                      height="16"
                    >
                      <path
                        fill="currentColor"
                        d="M12 5.83L15.17 9l1.41-1.41L12 3 7.41 7.59 8.83 9 12 5.83zm0 12.34L8.83 15l-1.41 1.41L12 21l4.59-4.59L15.17 15 12 18.17z"
                      />
                    </svg>
                  </button>

                  {showSort && (
                    <div className="sort-dropdown-menu">
                      <button
                        onClick={() => handleSort('id')}
                        className={`sort-dropdown-item ${sortOption.field === 'id' ? 'active' : ''}`}
                      >
                        ID {sortOption.field === 'id' && (
                          <span>{sortOption.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                      <button
                        onClick={() => handleSort('name')}
                        className={`sort-dropdown-item ${sortOption.field === 'name' ? 'active' : ''}`}
                      >
                        Name {sortOption.field === 'name' && (
                          <span>{sortOption.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                      <button
                        onClick={() => handleSort('priority')}
                        className={`sort-dropdown-item ${sortOption.field === 'priority' ? 'active' : ''}`}
                      >
                        Priority {sortOption.field === 'priority' && (
                          <span>{sortOption.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                      <button
                        onClick={() => handleSort('due_date')}
                        className={`sort-dropdown-item ${sortOption.field === 'due_date' ? 'active' : ''}`}
                      >
                        Due Date {sortOption.field === 'due_date' && (
                          <span>{sortOption.direction === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Table */}
      <div className="tasks-table-container" data-aos="fade-up">
        {viewMode === 'table' ? (
          <>
            <div className="table-responsive">
              <table className="tasks-table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-id">ID</th>
                    <th className="table-header-name">Task Name</th>
                    <th className="table-header-event">Event</th>
                    <th className="table-header-assigned">Assigned To</th>
                    <th className="table-header-priority">Priority</th>
                    <th className="table-header-status">Status</th>
                    <th className="table-header-due">Due Date</th>
                    <th className="table-header-actions">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {filteredTasks.map((task) => (
                    <tr key={task.task_id} className="table-row">
                      <td className="table-cell-id">{task.task_id}</td>
                      <td className="table-cell-name">
                        <div className="user-name-container">
                          <div className="user-name-details">
                            <div className="user-title">{task.task_name}</div>
                            <div className="user-phone">
                              {task.task_description ? 
                                task.task_description.length > 50 ? 
                                  `${task.task_description.substring(0, 50)}...` : 
                                  task.task_description : 
                                'No description'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell-email">
                        {task.event ? task.event.event_name : 'No event'}
                      </td>
                      <td className="table-cell-role">
                        <span className="role-badge">
                          {task.assigned_to === 'client' ? 'Client' : 
                           task.assigned_to === 'vendor' ? 'Vendor' : 'Unassigned'}
                        </span>
                      </td>
                      <td className="table-cell-priority" data-label="Priority">
                        <span className={`priority-badge priority-${task.priority}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="table-cell-status" data-label="Status">
                        <span className={`status-badge status-${task.status}`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="table-cell-due"  data-label="Due Date">
                        {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}
                      </td>
                      <td className="table-cell-actions">
                        <div className="actions-dropdown-container">
                          <button
                            className="actions-dropdown-toggle"
                            onClick={() => toggleDropdown(task.id)}
                          >
                            <FiMoreVertical />
                          </button>

                          {dropdownOpen === task.id && (
                            <div className="actions-dropdown">
                              <button
                                onClick={() => {
                                  handleShowTask(task);
                                  setDropdownOpen(null);
                                }}
                                className="actions-dropdown-item"
                              >
                                <FiEye /> View
                              </button>

                              <button
                                onClick={() => {
                                  handleUpdateTask(task);
                                  setDropdownOpen(null);
                                }}
                                className="actions-dropdown-item"
                              >
                                <FiEdit2 /> Edit
                              </button>

                              <div className="actions-dropdown-divider" />

                              <button
                                onClick={() => {
                                  showConfirmDialog(task.id, 'delete');
                                  setDropdownOpen(null);
                                }}
                                className="actions-dropdown-item danger"
                              >
                                <FiTrash2 /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredTasks.length > 0 && (
              <div className="pagination-container">
                <div className="pagination">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    className="pagination-button pagination-button-prev"
                  >
                    &lt;
                  </button>

                  {pagination.currentPage > 1 && (
                    <button
                      onClick={() => handlePageChange(1)}
                      className="pagination-button"
                    >
                      1
                    </button>
                  )}

                  {pagination.currentPage > 3 && (
                    <span className="pagination-dots">...</span>
                  )}

                  {pagination.currentPage > 2 && (
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      className="pagination-button"
                    >
                      {pagination.currentPage - 1}
                    </button>
                  )}

                  <button
                    className="pagination-button active"
                  >
                    {pagination.currentPage}
                  </button>

                  {pagination.currentPage < Math.ceil(pagination.total / pagination.perPage) - 1 && (
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      className="pagination-button"
                    >
                      {pagination.currentPage + 1}
                    </button>
                  )}

                  {pagination.currentPage < Math.ceil(pagination.total / pagination.perPage) - 2 && (
                    <span className="pagination-dots">...</span>
                  )}

                  {pagination.currentPage < Math.ceil(pagination.total / pagination.perPage) && (
                    <button
                      onClick={() => handlePageChange(Math.ceil(pagination.total / pagination.perPage))}
                      className="pagination-button"
                    >
                      {Math.ceil(pagination.total / pagination.perPage)}
                    </button>
                  )}

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === Math.ceil(pagination.total / pagination.perPage)}
                    className="pagination-button pagination-button-next"
                  >
                    &gt;
                  </button>
                </div>
              </div>
            )}
          </>
        ) : viewMode === 'show' ? (
          <TaskShow task={selectedTask} onBack={handleBackToList} />
        ) :  viewMode === 'update' ?(
          <TaskUpdate task={selectedTask} onBack={handleBackToList} />
        ) : (
          <TaskCreate onBack={handleBackToList} events={events}/>
        )}
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        closeButton={false}
        draggablePercent={60}
      />

      <ConfirmDialog
        show={confirmAction.show}
        title="Confirm Action"
        message={confirmAction.message}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmAction({ show: false, taskId: null, action: null, message: '' })}
        confirmText="Delete"
        type="delete"
      />

      {alert && (
        <Alert
          message={alert.message}
          type={alert.type}
          duration={alert.duration}
          onClose={() => setAlert(null)}
        />
      )}
    </div>
  );
};

export default EventTasks;