import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import api from '../utils/api';
import {
  FaWallet,
  FaMoneyBillWave,
  FaCheckCircle,
  FaClock,
  FaChartLine,
  FaExclamationTriangle,
} from 'react-icons/fa';

const Dashboard = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      const endpoint = isAdmin ? '/dashboard/admin' : '/dashboard/user';
      const response = await api.get(endpoint);
      setDashboardData(response.data.dashboard || {});
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setDashboardData({});
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    // Only fetch dashboard data when auth is loaded and user exists
    if (!authLoading && user) {
      fetchDashboardData();
    }
  }, [user, isAdmin, authLoading, fetchDashboardData]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const StatCard = ({ icon: Icon, title, value, color, subtitle }) => (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className={`text-2xl font-bold mt-2 ${color}`}>{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${color.replace('text', 'bg').replace('600', '100')}`}>
          <Icon className={`text-xl ${color}`} />
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Welcome back, {user.name}! 👋
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {isAdmin ? 'Admin Dashboard Overview' : 'Your Wedding Expense Summary'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            icon={FaWallet}
            title="Total Budget"
            value={formatCurrency(dashboardData?.budget?.totalBudget || 0)}
            color="text-blue-600"
          />
          <StatCard
            icon={FaMoneyBillWave}
            title="Total Spent"
            value={formatCurrency(dashboardData?.budget?.amountSpent || 0)}
            color="text-green-600"
            subtitle={`${dashboardData?.budget?.percentageUsed || 0}% utilized`}
          />
          <StatCard
            icon={FaCheckCircle}
            title={isAdmin ? 'Approved Expenses' : 'Your Approved'}
            value={(dashboardData?.expenses?.approved || dashboardData?.myExpenses?.approved) || 0}
            color="text-green-600"
          />
          <StatCard
            icon={FaClock}
            title={isAdmin ? 'Pending Approvals' : 'Your Pending'}
            value={(dashboardData?.expenses?.pending || dashboardData?.myExpenses?.pending) || 0}
            color="text-yellow-600"
          />
        </div>

        {/* Budget Status */}
        {dashboardData?.budget && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Budget Status</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Budget Utilization</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(dashboardData.budget.amountSpent)} / {formatCurrency(dashboardData.budget.totalBudget)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      parseFloat(dashboardData.budget.percentageUsed || 0) > 90
                        ? 'bg-red-600'
                        : parseFloat(dashboardData.budget.percentageUsed || 0) > 75
                        ? 'bg-yellow-600'
                        : 'bg-green-600'
                    }`}
                    style={{ width: `${Math.min(parseFloat(dashboardData.budget.percentageUsed || 0), 100)}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-600">Remaining</span>
                <span className={`font-bold text-lg ${
                  dashboardData.budget.remaining < 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {formatCurrency(dashboardData.budget.remaining)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Expense Breakdown by Task */}
        {dashboardData?.tasks && dashboardData.tasks.length > 0 && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Expense Breakdown by Category</h2>
            <div className="space-y-3">
              {dashboardData.tasks.map((task) => (
                <div key={task.id} className="border-b border-gray-100 pb-3 last:border-0">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-900">{task.name}</span>
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(task.actualCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Estimated: {formatCurrency(task.estimatedCost)}</span>
                    <span className={task.actualCost > task.estimatedCost ? 'text-red-600' : 'text-green-600'}>
                      {task.actualCost > task.estimatedCost ? 'Over' : 'Under'} budget
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Over Budget Items */}
        {dashboardData?.alerts?.overBudgetTasks && dashboardData.alerts.overBudgetTasks.length > 0 && (
          <div className="card bg-red-50 border border-red-200">
            <div className="flex items-start space-x-3">
              <FaExclamationTriangle className="text-red-600 text-xl mt-1" />
              <div className="flex-1">
                <h3 className="font-bold text-red-900 mb-2">Over Budget Alert</h3>
                <ul className="space-y-1">
                  {dashboardData.alerts.overBudgetTasks.map((item, index) => (
                    <li key={index} className="text-red-800 text-sm">
                      {item.name}: {formatCurrency(item.difference)} over budget
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {((dashboardData?.recentActivities && dashboardData.recentActivities.length > 0) || 
          (dashboardData?.recentExpenses && dashboardData.recentExpenses.length > 0)) && (
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {(dashboardData.recentActivities || dashboardData.recentExpenses || []).map((expense) => (
                <div key={expense._id} className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{expense.description}</p>
                    <p className="text-sm text-gray-600">
                      {expense.task?.name || 'No category'} • {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(expense.amount)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      expense.status === 'approved' ? 'bg-green-100 text-green-700' :
                      expense.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {expense.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
