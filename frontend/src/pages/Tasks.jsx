import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import api from '../utils/api';
import { FaPlus, FaEdit, FaTrash, FaCheckCircle } from 'react-icons/fa';

const Tasks = () => {
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    estimatedCost: '',
    completed: false,
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks');
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, {
          ...formData,
          estimatedCost: parseFloat(formData.estimatedCost),
        });
      } else {
        await api.post('/tasks', {
          ...formData,
          estimatedCost: parseFloat(formData.estimatedCost),
        });
      }
      setShowModal(false);
      setEditingTask(null);
      setFormData({ name: '', estimatedCost: '', completed: false });
      fetchTasks();
    } catch (error) {
      console.error('Failed to save task:', error);
      alert(error.response?.data?.message || 'Failed to save task');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      name: task.name,
      estimatedCost: task.estimatedCost.toString(),
      completed: task.completed,
    });
    setShowModal(true);
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await api.delete(`/tasks/${taskId}`);
      fetchTasks();
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert(error.response?.data?.message || 'Failed to delete task');
    }
  };

  const toggleComplete = async (task) => {
    try {
      await api.put(`/tasks/${task._id}`, {
        completed: !task.completed,
      });
      fetchTasks();
    } catch (error) {
      console.error('Failed to update task:', error);
      alert(error.response?.data?.message || 'Failed to update task');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (task) => {
    const diff = task.actualCost - task.estimatedCost;
    if (diff > 0) return 'text-red-600';
    if (diff === 0) return 'text-green-600';
    return 'text-blue-600';
  };

  const getStatusText = (task) => {
    const diff = task.actualCost - task.estimatedCost;
    if (diff > 0) return `Over by ${formatCurrency(diff)}`;
    if (diff === 0) return 'On budget';
    return `Under by ${formatCurrency(Math.abs(diff))}`;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Wedding Categories</h1>
            <p className="text-gray-600 mt-1">Manage your wedding expense categories</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => {
                setEditingTask(null);
                setFormData({ name: '', estimatedCost: '', completed: false });
                setShowModal(true);
              }}
              className="btn-primary flex items-center space-x-2"
            >
              <FaPlus />
              <span>Add Category</span>
            </button>
          )}
        </div>

        {/* Tasks Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : !tasks || tasks.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500">No categories found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <div
                key={task._id}
                className={`card border-l-4 ${
                  task.completed
                    ? 'border-green-500'
                    : task.actualCost > task.estimatedCost
                    ? 'border-red-500'
                    : 'border-blue-500'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{task.name}</h3>
                  {isAdmin && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => toggleComplete(task)}
                        className={`${
                          task.completed ? 'text-green-600' : 'text-gray-400'
                        } hover:text-green-700`}
                        title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                      >
                        <FaCheckCircle />
                      </button>
                      <button
                        onClick={() => handleEdit(task)}
                        className="text-blue-600 hover:text-blue-700"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(task._id)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Estimated:</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(task.estimatedCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Actual:</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(task.actualCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-semibold ${getStatusColor(task)}`}>
                      {getStatusText(task)}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        task.actualCost > task.estimatedCost
                          ? 'bg-red-600'
                          : task.actualCost === task.estimatedCost
                          ? 'bg-green-600'
                          : 'bg-blue-600'
                      }`}
                      style={{
                        width: `${Math.min(
                          (task.actualCost / task.estimatedCost) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {task.completed && (
                  <div className="mt-3 px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full inline-block">
                    Completed
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingTask ? 'Edit Category' : 'Add New Category'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  required
                  placeholder="e.g., Venue, Catering, Photography"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Cost *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.estimatedCost}
                  onChange={(e) => setFormData({ ...formData, estimatedCost: e.target.value })}
                  className="input-field"
                  required
                  placeholder="Enter estimated cost"
                />
              </div>

              {editingTask && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="completed"
                    checked={formData.completed}
                    onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="completed" className="ml-2 text-sm text-gray-700">
                    Mark as completed
                  </label>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {editingTask ? 'Update' : 'Add'} Category
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingTask(null);
                    setFormData({ name: '', estimatedCost: '', completed: false });
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Tasks;
