import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import api from '../utils/api';
import { FaWallet, FaEdit } from 'react-icons/fa';

const Budget = () => {
  const { isAdmin } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [totalAmount, setTotalAmount] = useState('');

  useEffect(() => {
    fetchBudgetData();
  }, []);

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      const summaryRes = await api.get('/budget/summary');
      setSummary(summaryRes.data.summary || null);
      if (summaryRes.data.summary) {
        setTotalAmount(summaryRes.data.summary.totalBudget.toString());
      }
    } catch (error) {
      console.error('Failed to fetch budget data:', error);
      // If no budget exists (404), set to null to show "create budget" message
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBudget = async (e) => {
    e.preventDefault();
    try {
      await api.post('/budget', { totalBudget: parseFloat(totalAmount) });
      setShowEditModal(false);
      fetchBudgetData();
    } catch (error) {
      console.error('Failed to update budget:', error);
      alert(error.response?.data?.error || error.response?.data?.message || 'Failed to update budget');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Budget Management</h1>
            <p className="text-gray-600 mt-1">Track and manage your wedding budget</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowEditModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <FaEdit />
              <span>{summary ? 'Edit Budget' : 'Create Budget'}</span>
            </button>
          )}
        </div>

        {/* No Budget Message */}
        {!summary ? (
          <div className="card text-center py-12">
            <FaWallet className="text-gray-400 text-5xl mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Budget Found</h2>
            <p className="text-gray-600 mb-6">
              {isAdmin 
                ? 'Create a budget to start tracking your wedding expenses.'
                : 'Please wait for an admin to create a budget.'}
            </p>
            {isAdmin && (
              <button
                onClick={() => setShowEditModal(true)}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <FaEdit />
                <span>Create Budget</span>
              </button>
            )}
          </div>
        ) : (
          <>
        {/* Budget Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Budget</p>
                <p className="text-3xl font-bold mt-2">
                  {formatCurrency(summary?.totalBudget || 0)}
                </p>
              </div>
              <div className="p-3 bg-white bg-opacity-20 rounded-full">
                <FaWallet className="text-2xl" />
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Spent</p>
              <p className="text-3xl font-bold mt-2">
                {formatCurrency(summary?.amountSpent || 0)}
              </p>
              <p className="text-green-100 text-sm mt-2">
                {parseFloat(summary?.percentageUsed || 0).toFixed(1)}% utilized
              </p>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div>
              <p className="text-purple-100 text-sm font-medium">Remaining</p>
              <p className="text-3xl font-bold mt-2">
                {formatCurrency(summary?.remaining || 0)}
              </p>
              <p className={`text-sm mt-2 ${
                (summary?.remaining || 0) < 0 ? 'text-red-200' : 'text-purple-100'
              }`}>
                {(summary?.remaining || 0) < 0 ? 'Over budget!' : 'Within budget'}
              </p>
            </div>
          </div>
        </div>

        {/* Budget Progress */}
        <div className="card">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Budget Utilization</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Overall Progress</span>
                <span className="font-semibold text-gray-900">
                  {parseFloat(summary?.percentageUsed || 0).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full transition-all ${
                    parseFloat(summary?.percentageUsed || 0) > 90
                      ? 'bg-red-600'
                      : parseFloat(summary?.percentageUsed || 0) > 75
                      ? 'bg-yellow-600'
                      : 'bg-green-600'
                  }`}
                  style={{ width: `${Math.min(parseFloat(summary?.percentageUsed || 0), 100)}%` }}
                ></div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Approved Expenses</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {summary?.approvedExpenses || 0}
                </p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {summary?.pendingExpenses || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Budget Breakdown */}
        {summary?.taskBreakdown && summary.taskBreakdown.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Budget Breakdown by Category</h2>
            <div className="space-y-4">
              {summary.taskBreakdown.map((task) => (
                <div key={task._id} className="border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{task.name}</h3>
                      <p className="text-sm text-gray-600">
                        Estimated: {formatCurrency(task.estimatedCost)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(task.actualCost)}
                      </p>
                      <p className={`text-sm ${
                        task.actualCost > task.estimatedCost
                          ? 'text-red-600'
                          : 'text-green-600'
                      }`}>
                        {task.actualCost > task.estimatedCost ? 'Over' : 'Under'} by{' '}
                        {formatCurrency(Math.abs(task.actualCost - task.estimatedCost))}
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        task.actualCost > task.estimatedCost
                          ? 'bg-red-600'
                          : 'bg-green-600'
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
              ))}
            </div>
          </div>
        )}
        </>
        )}
      </div>

      {/* Edit Budget Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {summary ? 'Update Total Budget' : 'Create Total Budget'}
            </h2>
            <form onSubmit={handleUpdateBudget} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Budget Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="input-field"
                  required
                  placeholder="Enter total budget amount"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button type="submit" className="btn-primary flex-1">
                  {summary ? 'Update' : 'Create'} Budget
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
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

export default Budget;
