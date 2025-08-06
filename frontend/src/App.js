import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Wallet, TrendingUp, Truck, Package, Activity, AlertTriangle, ArrowLeft, Lightbulb, User, PlusCircle, Trash2, Edit, LogIn, LogOut } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const PIE_COLORS = ['#01569B', '#4C7D9B', '#D1C4E9', '#A1887F'];

// Main App Component with State-based Page Management
export default function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [backendStatus, setBackendStatus] = useState('Checking backend status...');
  const [projectsData, setProjectsData] = useState([]);
  const [financialsData, setFinancialsData] = useState({ quarterly_data: [], expenditure_breakdown: [] });
  const [suppliersData, setSuppliersData] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  const BACKEND_URL = '';

  useEffect(() => {
    fetch('/api/status')
      .then(response => response.json())
      .then(data => setBackendStatus(data.message))
      .catch(() => setBackendStatus('Failed to connect to the backend.'));

    if (currentUser) {
      fetch('/api/projects')
        .then(response => response.json())
        .then(data => {
          const projectsWithDetails = data.map(project => ({
              ...project,
              manager: `Manager ${project.project_id}`,
              timeline: `Timeline for ${project.project_name}`,
              details: `Details for ${project.project_name}. This is a long detailed description about the project's progress and risks.`,
              what_if_analysis: {
                original: { name: 'Original', date: '2025-12-31', cost: 5.5, risk: 8 },
                scenario1: { name: 'Add 1 more engineer', date: '2026-02-15', cost: 5.6, risk: 7 },
                scenario2: { name: 'Increase budget by 5%', date: '2025-11-20', cost: 5.75, risk: 5 }
              }
          }));
          setProjectsData(projectsWithDetails);
        })
        .catch(err => console.error("Could not fetch projects data", err));

      fetch('/api/financials')
        .then(response => response.json())
        .then(data => {
          const financialsWithDetails = data.quarterly_data.map(quarter => ({
              ...quarter,
              details: { labor: 3.8, materials: 3.2, overhead: 0.95 }
          }));
          setFinancialsData({ ...data, quarterly_data: financialsWithDetails });
        })
        .catch(err => console.error("Could not fetch financials data", err));

      fetch('/api/suppliers')
        .then(response => response.json())
        .then(data => {
          const suppliersWithScenario = data.map(supplier => ({
            ...supplier,
            ai_scenario: `AI has detected a 70% probability of a 30-day delay for deliveries from a key supplier in the next quarter due to geopolitical tensions.`,
            what_if_analysis: {
              original: { delay: 0, impact: 'Low' },
              scenario1: { name: '30-day delay', delay: 30, impact: 'High' },
              scenario2: { name: '10-day delay', delay: 10, impact: 'Medium' }
            }
          }));
          setSuppliersData(suppliersWithScenario);
        })
        .catch(err => console.error("Could not fetch suppliers data", err));

      if (currentUser?.role === 'Admin') {
        fetch('/api/users')
          .then(response => response.json())
          .then(data => setUsersData(data))
          .catch(err => console.error("Could not fetch user data", err));
      }
    }
  }, [currentUser]);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setCurrentPage('home');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('login');
  };

  const renderPage = () => {
    if (!currentUser) {
      return <LoginPage onLogin={handleLogin} backendStatus={backendStatus} />;
    }
    switch (currentPage) {
      case 'home':
        return <DashboardHome backendStatus={backendStatus} />;
      case 'projects':
        return <ProjectDashboard projects={projectsData} />;
      case 'financials':
        return <FinancialDashboard financials={financialsData} />;
      case 'supply-chain':
        return <SupplyChainDashboard suppliers={suppliersData} />;
      case 'what-if':
        return <WhatIfAnalysisPage projects={projectsData} />;
      case 'admin':
        return currentUser?.permissions.includes('admin') ? <AdminPage users={usersData} setUsers={setUsersData} /> : <p className="p-8 text-red-500">Access Denied. You do not have permission to view this page.</p>;
      default:
        return <DashboardHome backendStatus={backendStatus} />;
    }
  };

  const pages = [
    { id: 'home', text: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', text: 'Projects', icon: Package },
    { id: 'financials', text: 'Financials', icon: Wallet },
    { id: 'supply-chain', text: 'Supply Chain', icon: Truck },
    { id: 'what-if', text: 'What-If Analysis', icon: Lightbulb },
    { id: 'admin', text: 'Admin', icon: User }
  ];

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      {currentUser ? (
        <aside className="w-64 bg-slate-800 p-6 flex flex-col items-center shadow-2xl border-r border-slate-700">
          <h1 className="text-2xl font-bold mb-8 text-[#01569B]">GRSE Dashboard</h1>
          <nav className="space-y-4 w-full">
            {pages.filter(page => currentUser.permissions.includes(page.id)).map(page => (
              <NavItem key={page.id} icon={page.icon} text={page.text} page={page.id} currentPage={currentPage} onClick={setCurrentPage} />
            ))}
            <button onClick={handleLogout} className="flex items-center space-x-3 p-3 rounded-lg w-full transition-colors hover:bg-slate-700 mt-auto text-red-400">
              <LogOut size={20} />
              <span className="font-medium">Logout ({currentUser.username})</span>
            </button>
          </nav>
        </aside>
      ) : null}

      <main className="flex-1 p-8 overflow-y-auto">
        {renderPage()}
      </main>
    </div>
  );
}

const NavItem = ({ icon: Icon, text, page, currentPage, onClick }) => {
  const isActive = currentPage === page;
  return (
    <button
      className={`flex items-center space-x-3 p-3 rounded-lg w-full transition-colors ${isActive ? 'bg-[#01569B] text-white shadow-lg' : 'hover:bg-slate-700'}`}
      onClick={() => onClick(page)}
    >
      <Icon size={20} />
      <span className="font-medium">{text}</span>
    </button>
  );
};

const LoginPage = ({ onLogin, backendStatus }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const BACKEND_URL = '';
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const user = await response.json();
        onLogin(user);
      } else {
        const err = await response.json();
        setError(err.message || 'Invalid username or password.');
      }
    } catch (err) {
      setError('Could not connect to the server.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-[#01569B] text-center mb-6">GRSE Dashboard Login</h2>
        <form onSubmit={handleLoginSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-300 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:border-[#01569B]"
            />
          </div>
          <div>
            <label className="block text-slate-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:border-[#01569B]"
            />
          </div>
          {error && <p className="text-red-400 text-center">{error}</p>}
          <button
            type="submit"
            className="w-full bg-[#01569B] text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Log In
          </button>
        </form>
        <p className="mt-8 text-slate-400 text-sm text-center">
          Backend Status: <span className="font-bold text-green-500">{backendStatus}</span>
        </p>
      </div>
    </div>
  );
};

// Home Dashboard Page Component
const DashboardHome = ({ backendStatus }) => {
  return (
    <div>
      <h2 className="text-4xl font-extrabold text-white mb-6">Leadership Overview</h2>
      <p className="text-slate-400 mb-8">Quick snapshot of key operational metrics.</p>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <KPICard title="Total Projects" value="120" change="+5%" status="increase" />
        <KPICard title="Budget Utilization" value="78%" change="+2%" status="increase" />
        <KPICard title="Projects at Risk" value="15" change="Up 3" status="warning" />
        <KPICard title="AI Insights" value="23" change="New" status="info" />
      </div>

      {/* Status Bar for Backend Check */}
      <div className="bg-slate-800 p-4 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-2">System Health</h3>
        <div className="flex items-center space-x-3">
          <Activity size={20} className="text-green-500" />
          <p>{backendStatus}</p>
        </div>
      </div>
    </div>
  );
};

// Reusable KPI Card Component
const KPICard = ({ title, value, change, status }) => {
  let icon, color;
  switch (status) {
    case 'increase': icon = <TrendingUp size={20} />; color = 'text-green-400'; break;
    case 'warning': icon = <AlertTriangle size={20} />; color = 'text-yellow-400'; break;
    case 'info': icon = <AlertTriangle size={20} />; color = 'text-[#01569B]'; break;
    default: icon = <TrendingUp size={20} />; color = 'text-slate-400';
  }

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 hover:border-[#01569B] transition-colors">
      <h3 className="text-sm font-semibold text-slate-400 uppercase">{title}</h3>
      <div className="text-4xl font-bold mt-2">{value}</div>
      <div className={`flex items-center text-sm mt-2 ${color}`}>
        {icon}
        <span className="ml-1">{change}</span>
      </div>
    </div>
  );
};

// Projects Dashboard Page Component
const ProjectDashboard = ({ projects }) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const statusColors = {
    'On Track': '#10B981', // green
    'At Risk': '#F59E0B', // yellow
    'Delayed': '#EF4444', // red
  };
  const projectsByStatus = projects.reduce((acc, proj) => {
    acc[proj.status] = (acc[proj.status] || 0) + 1;
    return acc;
  }, {});

  const projectStatusData = Object.keys(projectsByStatus).map(status => ({
    name: status,
    value: projectsByStatus[status]
  }));

  const handleProjectClick = (project) => {
    setSelectedProject(project);
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
  };

  if (projects.length === 0) {
    return <p className="text-slate-400">Loading projects data...</p>;
  }

  return (
    <div className="relative">
      <h2 className="text-4xl font-extrabold text-white mb-6">Project Management Dashboard</h2>
      <p className="text-slate-400 mb-8">Detailed overview of all active projects. Click on a project name for more details.</p>
      
      {/* AI Scenario */}
      <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 mb-8">
        <h3 className="text-2xl font-bold text-[#01569B] mb-4">AI-Generated Project Scenario</h3>
        <p className="text-slate-300 italic">"Project Frigate Modernization is at high risk. AI projects that a 5% budget increase could bring the project back on track with a high degree of confidence."</p>
      </div>

      <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
        <h3 className="text-2xl font-bold mb-4">Project Status Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={projectStatusData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="name" stroke="#A0AEC0" />
            <YAxis stroke="#A0AEC0" />
            <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
            <Bar dataKey="value">
              {projectStatusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={statusColors[entry.name]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
        <h3 className="text-2xl font-bold mb-4">All Projects Overview</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-left whitespace-nowrap">
            <thead>
              <tr className="bg-slate-700 text-slate-300">
                <th className="px-4 py-3 font-semibold uppercase">Project Name</th>
                <th className="px-4 py-3 font-semibold uppercase">Status</th>
                <th className="px-4 py-3 font-semibold uppercase">Budget Spent (Cr)</th>
                <th className="px-4 py-3 font-semibold uppercase">Total Budget (Cr)</th>
                <th className="px-4 py-3 font-semibold uppercase">Risk Score</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project, index) => (
                <tr key={index} className="border-b border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer" onClick={() => handleProjectClick(project)}>
                  <td className="px-4 py-3 text-blue-400 font-semibold">{project.project_name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      project.status === 'On Track' ? 'bg-green-500 text-green-900' :
                      project.status === 'At Risk' ? 'bg-yellow-500 text-yellow-900' :
                      'bg-red-500 text-red-900'
                    }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">₹{project.budget_spent} Cr</td>
                  <td className="px-4 py-3">₹{project.total_budget} Cr</td>
                  <td className="px-4 py-3">{project.risk_score}/10</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedProject && <ProjectModal project={selectedProject} onClose={handleCloseModal} />}
    </div>
  );
};

// Drill-down Modal for a specific project
const ProjectModal = ({ project, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 text-slate-100 rounded-xl shadow-2xl w-full max-w-2xl p-8 transform scale-100 transition-all duration-300">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-3xl font-bold text-[#01569B]">{project.project_name} Details</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4 text-slate-300">
          <p><strong>Project Manager:</strong> {project.manager || 'N/A'}</p>
          <p><strong>Timeline:</strong> {project.timeline || 'N/A'}</p>
          <p><strong>Current Status:</strong> 
            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
              project.status === 'On Track' ? 'bg-green-500 text-green-900' :
              project.status === 'At Risk' ? 'bg-yellow-500 text-yellow-900' :
              'bg-red-500 text-red-900'
            }`}>
              {project.status}
            </span>
          </p>
          <p><strong>Risk Score:</strong> {project.risk_score}/10</p>
          <div className="mt-4">
            <p className="font-bold text-lg text-white">Latest Insights:</p>
            <p className="mt-2 p-4 bg-slate-700 rounded-lg">{project.details || 'No detailed insights available.'}</p>
          </div>
        </div>
        <button onClick={onClose} className="mt-8 bg-[#01569B] text-white font-bold py-3 px-6 rounded-lg w-full hover:bg-blue-700 transition-colors">
          Close Details
        </button>
      </div>
    </div>
  );
};

// Financials Dashboard Page Component
const FinancialDashboard = ({ financials }) => {
  const [selectedQuarter, setSelectedQuarter] = useState(null);
  const { quarterly_data, expenditure_breakdown } = financials;

  const handleQuarterClick = (quarter) => {
    setSelectedQuarter(quarter);
  };

  const handleGoBack = () => {
    setSelectedQuarter(null);
  };
  
  if (quarterly_data.length === 0) {
    return <p className="text-slate-400">Loading financial data...</p>;
  }

  // Drill-down view for a specific quarter
  if (selectedQuarter) {
    const quarterDetails = selectedQuarter.details || {}; // Use a default empty object to prevent errors
    const pieData = Object.keys(quarterDetails).map(key => ({ name: key, value: quarterDetails[key] }));
    const totalExpenditure = Object.values(quarterDetails).reduce((sum, val) => sum + val, 0);

    return (
      <div>
        <button onClick={handleGoBack} className="flex items-center text-[#01569B] mb-6 hover:text-blue-200 transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Back to Financials Overview
        </button>
        <h2 className="text-4xl font-extrabold text-white mb-6">Financials: {selectedQuarter.name}</h2>
        <p className="text-slate-400 mb-8">Detailed expenditure breakdown for this quarter.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
            <h3 className="text-2xl font-bold mb-4">Expenditure Breakdown (₹ Cr)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
            <h3 className="text-2xl font-bold mb-4">Quarterly Details</h3>
            <p className="text-lg mb-2"><strong>Total Revenue:</strong> ₹{selectedQuarter.revenue} Cr</p>
            <p className="text-lg mb-4"><strong>Total Expenditure:</strong> ₹{totalExpenditure} Cr</p>
            <ul className="space-y-2">
              {Object.keys(quarterDetails).map((key, index) => (
                <li key={index} className="flex justify-between items-center bg-slate-700 p-3 rounded-lg">
                  <span className="font-medium capitalize">{key}:</span>
                  <span className="font-bold">₹{quarterDetails[key]} Cr</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-4xl font-extrabold text-white mb-6">Financial Performance</h2>
      <p className="text-slate-400 mb-8">Quarterly financial summary and expenditure breakdown.</p>
      
      {/* Scenario */}
      <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 mb-8">
        <h3 className="text-2xl font-bold text-[#01569B] mb-4">AI-Generated Financial Scenario</h3>
        <p className="text-slate-300 italic">"AI predicts a potential 10% increase in raw material costs in Q1 2025 due to global market volatility. Proactive measures are recommended to secure a buffer stock."</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
          <h3 className="text-2xl font-bold mb-4">Revenue & Expenditure Trends (₹ Cr)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={quarterly_data}>
              <XAxis dataKey="name" stroke="#A0AEC0" />
              <YAxis stroke="#A0AEC0" />
              <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }} />
              <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} name="Revenue" />
              <Line type="monotone" dataKey="expenditure" stroke="#EF4444" strokeWidth={2} name="Expenditure" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
          <h3 className="text-2xl font-bold mb-4">Expenditure Breakdown (Q4 2024)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenditure_breakdown}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {expenditure_breakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="mt-8 bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
        <h3 className="text-2xl font-bold mb-4">Quarterly Report Details (Drill-Down)</h3>
        <table className="min-w-full table-auto text-left whitespace-nowrap">
          <thead>
            <tr className="bg-slate-700 text-slate-300">
              <th className="px-4 py-3 font-semibold uppercase">Quarter</th>
              <th className="px-4 py-3 font-semibold uppercase">Revenue (Cr)</th>
              <th className="px-4 py-3 font-semibold uppercase">Expenditure (Cr)</th>
              <th className="px-4 py-3 font-semibold uppercase">Variance (Cr)</th>
            </tr>
          </thead>
          <tbody>
            {quarterly_data.map((quarter, index) => (
              <tr key={index} className="border-b border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer" onClick={() => handleQuarterClick(quarter)}>
                <td className="px-4 py-3 text-[#01569B] font-semibold">{quarter.name}</td>
                <td className="px-4 py-3">₹{quarter.revenue} Cr</td>
                <td className="px-4 py-3">₹{quarter.expenditure} Cr</td>
                <td className={`px-4 py-3 font-semibold ${quarter.revenue - quarter.expenditure > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ₹{Math.abs(quarter.revenue - quarter.expenditure).toFixed(2)} Cr
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Supply Chain Dashboard Page Component
const SupplyChainDashboard = ({ suppliers }) => {
  if (suppliers.length === 0) {
    return <p className="text-slate-400">Loading suppliers data...</p>;
  }

  return (
    <div>
      <h2 className="text-4xl font-extrabold text-white mb-6">Supply Chain Health</h2>
      <p className="text-slate-400 mb-8">Performance metrics for key suppliers.</p>
      
      {/* AI Scenario */}
      <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 mb-8">
        <h3 className="text-2xl font-bold text-[#01569B] mb-4">AI-Generated Supply Chain Scenario</h3>
        <p className="text-slate-300 italic">"AI has detected a 70% probability of a 30-day delay for deliveries from a key supplier in the next quarter due to geopolitical tensions. This could impact the 'Frigate Modernization' project."</p>
      </div>

      <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
        <h3 className="text-2xl font-bold mb-4">Key Supplier Performance</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-left whitespace-nowrap">
            <thead>
              <tr className="bg-slate-700 text-slate-300">
                <th className="px-4 py-3 font-semibold uppercase">Supplier Name</th>
                <th className="px-4 py-3 font-semibold uppercase">Delivery Rate (%)</th>
                <th className="px-4 py-3 font-semibold uppercase">Quality Score (%)</th>
                <th className="px-4 py-3 font-semibold uppercase">Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier, index) => (
                <tr key={index} className="border-b border-slate-700 hover:bg-slate-700 transition-colors">
                  <td className="px-4 py-3">{supplier.name}</td>
                  <td className="px-4 py-3">{supplier.deliveries}%</td>
                  <td className="px-4 py-3">{supplier.quality}%</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      supplier.risk === 'Low' ? 'bg-green-500 text-green-900' :
                      supplier.risk === 'Medium' ? 'bg-yellow-500 text-yellow-900' :
                      'bg-red-500 text-red-900'
                    }`}>
                      {supplier.risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// What-If Analysis Page Component
const WhatIfAnalysisPage = ({ projects }) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [scenario, setScenario] = useState('original');
  const [project, setProject] = useState(null);

  useEffect(() => {
    if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0]);
      setProject(projects[0]);
    }
  }, [projects, selectedProject]);
  
  const handleProjectSelect = (e) => {
    const selected = projects.find(p => p.project_id === e.target.value);
    setSelectedProject(selected);
    setProject(selected);
    setScenario('original');
  };

  const handleScenarioChange = (e) => {
    setScenario(e.target.value);
    const selectedScenario = selectedProject?.what_if_analysis?.[e.target.value];
    if (selectedScenario) {
      setProject(selectedScenario);
    }
  };
  
  if (!project || !selectedProject) {
    return <p className="text-slate-400">Loading project data for analysis...</p>;
  }

  const riskColor = (risk) => {
    if (risk <= 4) return 'text-green-400';
    if (risk <= 7) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div>
      <h2 className="text-4xl font-extrabold text-white mb-6">What-If Analysis</h2>
      <p className="text-slate-400 mb-8">Simulate different scenarios to predict project outcomes.</p>

      <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
        <h3 className="text-2xl font-bold text-[#01569B] mb-4">Simulation Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-slate-300 mb-2">Select Project</label>
            <select 
              value={selectedProject?.project_id || ''}
              onChange={handleProjectSelect}
              className="bg-slate-700 text-white p-3 rounded-lg w-full"
            >
              {projects.map(p => (
                <option key={p.project_id} value={p.project_id}>{p.project_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-300 mb-2">Select Scenario</label>
            <select
              value={scenario}
              onChange={handleScenarioChange}
              className="bg-slate-700 text-white p-3 rounded-lg w-full"
            >
              <option value="original">Current Status (Original)</option>
              <option value="scenario1">Scenario 1: Add 1 Engineer</option>
              <option value="scenario2">Scenario 2: Increase Budget by 5%</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Analysis Results */}
      <div className="mt-8 bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
        <h3 className="text-2xl font-bold mb-4">Analysis Results: <span className="text-[#01569B]">{project?.name || selectedProject?.project_name}</span></h3>
        <p className="text-slate-400 italic mb-6">Comparing the selected scenario against the original plan.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPICard title="Predicted Completion" value={project?.date || 'N/A'} />
          <KPICard title="Projected Final Cost" value={`₹${project?.cost || 'N/A'} Cr`} />
          <KPICard title="Predicted Risk Score" value={`${project?.risk || 'N/A'}/10`} status="warning" />
        </div>
        
        {/* Simple visualization of the impact */}
        <div className="mt-8">
          <h4 className="text-lg font-bold text-white mb-2">Timeline Impact</h4>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart layout="vertical" data={[
              { name: 'Original', value: Date.parse(selectedProject?.what_if_analysis?.original?.date) },
              { name: project?.name || 'Scenario', value: Date.parse(project?.date) }
            ]} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" width={100} stroke="#A0AEC0" />
              <Tooltip formatter={(value) => new Date(value).toLocaleDateString()} />
              <Bar dataKey="value" barSize={30}>
                <Cell fill="#01569B" />
                <Cell fill="#4C7D9B" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

// Admin Page Component
const AdminPage = ({ users, setUsers }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', username: '', role: '', password: '', permissions: [] });
  const BACKEND_URL = '';
  const allPermissions = ['home', 'projects', 'financials', 'supply-chain', 'what-if', 'admin'];

  const fetchUsers = () => {
    fetch(`${BACKEND_URL}/api/users`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => setUsers(data))
      .catch(err => console.error("Could not fetch user data", err));
  };
  
  const handleAddUser = (user) => {
    fetch(`${BACKEND_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to add user');
      }
      return response.json();
    })
    .then(() => fetchUsers())
    .catch(err => console.error("Could not add user", err));
  };

  const handleUpdateUser = (updatedUser) => {
    fetch(`${BACKEND_URL}/api/users/${updatedUser.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedUser)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
      return response.json();
    })
    .then(() => fetchUsers())
    .catch(err => console.error("Could not update user", err));
  };

  const handleDeleteUser = (userId) => {
    fetch(`${BACKEND_URL}/api/users/${userId}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      return response.json();
    })
    .then(() => fetchUsers())
    .catch(err => console.error("Could not delete user", err));
  };

  const openModalForEdit = (user) => {
    setFormData({ ...user, password: '' });
    setIsModalOpen(true);
  };

  const openModalForAdd = () => {
    setFormData({ id: null, name: '', username: '', role: '', password: '', permissions: [] });
    setIsModalOpen(true);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handlePermissionChange = (e) => {
    const { value, checked } = e.target;
    let newPermissions = [...formData.permissions];
    if (checked) {
      newPermissions.push(value);
    } else {
      newPermissions = newPermissions.filter(p => p !== value);
    }
    setFormData({ ...formData, permissions: newPermissions });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const userDataToSend = { ...formData };
    if (!userDataToSend.password) {
      delete userDataToSend.password;
    }
    
    if (userDataToSend.id) {
      handleUpdateUser(userDataToSend);
    } else {
      handleAddUser(userDataToSend);
    }
    setIsModalOpen(false);
  };

  useEffect(() => {
    fetchUsers();
  }, [setUsers]);

  return (
    <div>
      <h2 className="text-4xl font-extrabold text-white mb-6">Admin Panel</h2>
      <p className="text-slate-400 mb-8">Manage users and assign roles for the dashboard.</p>
      
      <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold mb-4">User Management</h3>
          <button onClick={openModalForAdd} className="flex items-center space-x-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
            <PlusCircle size={20} />
            <span>Add User</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-left whitespace-nowrap">
            <thead>
              <tr className="bg-slate-700 text-slate-300">
                <th className="px-4 py-3 font-semibold uppercase">ID</th>
                <th className="px-4 py-3 font-semibold uppercase">Name</th>
                <th className="px-4 py-3 font-semibold uppercase">Username</th>
                <th className="px-4 py-3 font-semibold uppercase">Role</th>
                <th className="px-4 py-3 font-semibold uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-slate-400">Loading user data...</td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-slate-700 hover:bg-slate-700 transition-colors">
                    <td className="px-4 py-3">{user.id}</td>
                    <td className="px-4 py-3">{user.name}</td>
                    <td className="px-4 py-3">{user.username}</td>
                    <td className="px-4 py-3">{user.role}</td>
                    <td className="px-4 py-3 flex space-x-2">
                      <button onClick={() => openModalForEdit(user)} className="text-[#01569B] hover:text-blue-400 transition-colors">
                        <Edit size={20} />
                      </button>
                      <button onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:text-red-400 transition-colors">
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 text-slate-100 rounded-xl shadow-2xl w-full max-w-lg p-8 transform scale-100 transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-[#01569B]">{formData.id ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleFormChange} required className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:border-[#01569B]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Username</label>
                <input type="text" name="username" value={formData.username} onChange={handleFormChange} required className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:border-[#01569B]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                <select name="role" value={formData.role} onChange={handleFormChange} required className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:border-[#01569B]">
                  <option value="">Select a role</option>
                  <option value="Admin">Admin</option>
                  <option value="User">User</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleFormChange} required={!formData.id} className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:outline-none focus:border-[#01569B]" />
                {formData.id && <p className="text-xs text-slate-400 mt-1">Leave blank to keep current password.</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Dashboard Permissions</label>
                <div className="space-y-2 mt-2">
                  {allPermissions.map(permission => (
                    <div key={permission} className="flex items-center space-x-2">
                      <input 
                        type="checkbox"
                        value={permission}
                        checked={formData.permissions.includes(permission)}
                        onChange={handlePermissionChange}
                        className="form-checkbox text-[#01569B] h-5 w-5 rounded"
                      />
                      <span className="text-slate-300 capitalize">{permission.replace('-', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                  {formData.id ? 'Update User' : 'Add User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
