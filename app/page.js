'use client';

import { useState } from 'react';

const ADMIN_API = 'http://127.0.0.1:8000';

const DATE_RANGES = [
  { key: '', label: 'All Time' },
  { key: 'today', label: 'Today' },
  { key: 'this_week', label: 'This Week' },
  { key: 'this_month', label: 'This Month' },
  { key: 'last_month', label: 'Last Month' },
];

export default function Home() {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [matches, setMatches] = useState([]);
  const [counties, setCounties] = useState([]);
  const [usersMeta, setUsersMeta] = useState({ total: 0, total_pages: 1 });
  const [messagesMeta, setMessagesMeta] = useState({ total: 0, total_pages: 1 });
  const [matchesMeta, setMatchesMeta] = useState({ total: 0, total_pages: 1 });
  const [usersPage, setUsersPage] = useState(1);
  const [messagesPage, setMessagesPage] = useState(1);
  const [matchesPage, setMatchesPage] = useState(1);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [stats, setStats] = useState({
    total_users: 0, total_messages: 0, total_matches: 0,
    total_admins: 0, completed_users: 0,
    inbound_messages: 0, outbound_messages: 0
  });

  // Filter states
  const [userSearch, setUserSearch] = useState('');
  const [userCounty, setUserCounty] = useState('');
  const [userGender, setUserGender] = useState('');
  const [userStage, setUserStage] = useState('');
  const [userDateRange, setUserDateRange] = useState('');
  const [messageSearch, setMessageSearch] = useState('');
  const [messageDirection, setMessageDirection] = useState('');
  const [messageDateRange, setMessageDateRange] = useState('');
  const [matchStatus, setMatchStatus] = useState('');
  const [matchDateRange, setMatchDateRange] = useState('');

  const login = async () => {
    try {
      const res = await fetch(`${ADMIN_API}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `username=${username}&password=${password}`
      });
      const data = await res.json();
      if (data.access_token) {
        setToken(data.access_token);
        setIsLoggedIn(true);
        setLoginError('');
        fetchAll(data.access_token, {});
      } else {
        setLoginError('Invalid username or password');
      }
    } catch {
      setLoginError('Could not connect to server');
    }
  };

  const fetchAll = async (tk, overrides = {}) => {
    try {
      const headers = { Authorization: `Bearer ${tk}` };
      const f = { ...getCurrentFilters(), ...overrides };

      const uParams = new URLSearchParams({
        page: f.uPage, page_size: 10,
        ...(f.uSearch && { search: f.uSearch }),
        ...(f.uCounty && { county: f.uCounty }),
        ...(f.uGender && { gender: f.uGender }),
        ...(f.uStage && { registration_stage: f.uStage }),
        ...(f.uDateRange && { date_range: f.uDateRange }),
      });

      const mParams = new URLSearchParams({
        page: f.mPage, page_size: 10,
        ...(f.mSearch && { search: f.mSearch }),
        ...(f.mDirection && { direction: f.mDirection }),
        ...(f.mDateRange && { date_range: f.mDateRange }),
      });

      const matchParams = new URLSearchParams({
        page: f.matchPage, page_size: 10,
        ...(f.matchStatus && { status: f.matchStatus }),
        ...(f.matchDateRange && { date_range: f.matchDateRange }),
      });

      const [uRes, mRes, matchRes, statsRes] = await Promise.all([
        fetch(`${ADMIN_API}/admin/users?${uParams}`, { headers }),
        fetch(`${ADMIN_API}/admin/messages?${mParams}`, { headers }),
        fetch(`${ADMIN_API}/admin/matches?${matchParams}`, { headers }),
        fetch(`${ADMIN_API}/admin/stats`, { headers }),
      ]);

      const uData = await uRes.json();
      const mData = await mRes.json();
      const matchData = await matchRes.json();
      const statsData = await statsRes.json();

      setUsers(uData.data || []);
      setUsersMeta({ total: uData.total, total_pages: uData.total_pages });
      setCounties(uData.counties || []);
      setMessages(mData.data || []);
      setMessagesMeta({ total: mData.total, total_pages: mData.total_pages });
      setMatches(matchData.data || []);
      setMatchesMeta({ total: matchData.total, total_pages: matchData.total_pages });
      setStats(statsData);
      setLoading(false);
      setRefreshing(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getCurrentFilters = () => ({
    uPage: usersPage, uSearch: userSearch, uCounty: userCounty,
    uGender: userGender, uStage: userStage, uDateRange: userDateRange,
    mPage: messagesPage, mSearch: messageSearch,
    mDirection: messageDirection, mDateRange: messageDateRange,
    matchPage: matchesPage, matchStatus, matchDateRange,
  });

  const applyUserFilter = (overrides) => {
    const newPage = 1;
    setUsersPage(newPage);
    fetchAll(token, { ...getCurrentFilters(), uPage: newPage, ...overrides });
  };

  const applyMessageFilter = (overrides) => {
    const newPage = 1;
    setMessagesPage(newPage);
    fetchAll(token, { ...getCurrentFilters(), mPage: newPage, ...overrides });
  };

  const applyMatchFilter = (overrides) => {
    const newPage = 1;
    setMatchesPage(newPage);
    fetchAll(token, { ...getCurrentFilters(), matchPage: newPage, ...overrides });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAll(token);
  };

  const Pagination = ({ page, totalPages, onPage }) => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        <p className="text-xs text-gray-400">Page {page} of {totalPages}</p>
        <div className="flex gap-1">
          <button onClick={() => onPage(page - 1)} disabled={page === 1}
            className="px-3 py-1 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
            Prev
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const pg = page <= 3 ? i + 1 : page - 2 + i;
            if (pg < 1 || pg > totalPages) return null;
            return (
              <button key={pg} onClick={() => onPage(pg)}
                className={`px-3 py-1 text-xs rounded-lg border ${pg === page ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {pg}
              </button>
            );
          })}
          <button onClick={() => onPage(page + 1)} disabled={page === totalPages}
            className="px-3 py-1 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
            Next
          </button>
        </div>
      </div>
    );
  };

  const FilterBar = ({ children }) => (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-5">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Filters</p>
      <div className="flex flex-wrap gap-3">{children}</div>
    </div>
  );

  const FilterSelect = ({ value, onChange, options, placeholder }) => (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="px-3 py-2 border-2 border-gray-100 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-blue-500 bg-gray-50 cursor-pointer">
      <option value="">{placeholder}</option>
      {options.map(opt => (
        <option key={opt.key ?? opt} value={opt.key ?? opt}>
          {opt.label ?? opt}
        </option>
      ))}
    </select>
  );

  const FilterInput = ({ value, onChange, placeholder }) => (
    <input type="text" value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="px-3 py-2 border-2 border-gray-100 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-blue-500 bg-gray-50 w-56" />
  );

  const ClearBtn = ({ onClick }) => (
    <button onClick={onClick}
      className="px-3 py-2 text-xs font-bold text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-all">
      Clear Filters
    </button>
  );

  // LOGIN PAGE
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
          <div className="bg-blue-700 px-8 py-10 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-blue-700 text-3xl font-black">P</span>
            </div>
            <h1 className="text-2xl font-black text-white">Penzi Admin</h1>
            <p className="text-blue-200 text-sm mt-1">Dating Service Dashboard</p>
          </div>
          <div className="px-8 py-8">
            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-5 text-sm font-medium">
                {loginError}
              </div>
            )}
            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-blue-500 bg-gray-50" />
            </div>
            <div className="mb-7">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password" onKeyDown={e => e.key === 'Enter' && login()}
                className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl text-sm text-gray-900 focus:outline-none focus:border-blue-500 bg-gray-50" />
            </div>
            <button onClick={login}
              className="w-full py-3.5 bg-blue-700 text-white font-bold rounded-xl text-sm hover:bg-blue-800 transition-all shadow-lg shadow-blue-200">
              Sign In to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // LOADING
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: '▣' },
    { key: 'users', label: 'Users', icon: '◉', count: stats.total_users },
    { key: 'messages', label: 'Messages', icon: '✉', count: stats.total_messages },
    { key: 'matches', label: 'Matches', icon: '♥', count: stats.total_matches },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">

      {/* SIDEBAR */}
      <aside className="w-64 bg-zinc-900 min-h-screen flex flex-col shadow-2xl">
        <div className="px-6 py-7 border-b border-indigo-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow">
              <span className="text-indigo-700 font-black text-lg">P</span>
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight">Penzi</p>
              <p className="text-blue-300 text-xs">Admin Panel</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map(item => (
            <button key={item.key} onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeTab === item.key ? 'bg-white text-blue-900 shadow-lg' : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`}>
              <span className="flex items-center gap-3">
                <span className="text-base">{item.icon}</span>
                {item.label}
              </span>
              {item.count !== undefined && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  activeTab === item.key ? 'bg-blue-100 text-blue-800' : 'bg-blue-800 text-blue-200'
                }`}>{item.count}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="px-4 py-5 border-t border-blue-800 space-y-2">
          <button onClick={handleRefresh}
            className="w-full py-2.5 bg-blue-800 text-blue-200 rounded-xl text-xs font-bold hover:bg-blue-700 hover:text-white transition-all">
            {refreshing ? '↻ Refreshing...' : '↻ Refresh Data'}
          </button>
          <button onClick={() => { setIsLoggedIn(false); setToken(''); setShowCard(false); }}
            className="w-full py-2.5 bg-transparent border border-red-500/208 text-red-400 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white hover:border-red-600 transition-all">
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-gray-900 capitalize">
              {activeTab === 'dashboard' ? 'Overview' : activeTab}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Penzi Dating Service — Admin Dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{username[0]?.toUpperCase()}</span>
            </div>
            <span className="text-sm font-semibold text-gray-700">{username}</span>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-8">

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {[
                  { label: 'Total Users', value: stats.total_users, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
                  { label: 'Total Messages', value: stats.total_messages, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
                  { label: 'Total Matches', value: stats.total_matches, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
                  { label: 'Completed Registrations', value: stats.completed_users, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
                ].map((stat, i) => (
                  <div key={i} className={`${stat.bg} border ${stat.border} rounded-2xl p-6 shadow-sm`}>
                    <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
                    <p className="text-gray-500 mt-2 text-sm font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-800 mb-5 text-base">Registration Summary</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Fully Registered', value: stats.completed_users, color: 'bg-green-500' },
                      { label: 'Partially Registered', value: stats.total_users - stats.completed_users, color: 'bg-yellow-400' },
                      { label: 'Total Admins', value: stats.total_admins, color: 'bg-blue-500' },
                      { label: 'Total Matches', value: stats.total_matches, color: 'bg-purple-500' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                          <span className="text-sm text-gray-600 font-medium">{item.label}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-bold text-gray-800 mb-5 text-base">Messages Summary</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Total Messages', value: stats.total_messages, color: 'bg-gray-400' },
                      { label: 'Inbound (User to System)', value: stats.inbound_messages, color: 'bg-blue-500' },
                      { label: 'Outbound (System to User)', value: stats.outbound_messages, color: 'bg-green-500' },
                      { label: 'Total Matches Found', value: stats.total_matches, color: 'bg-purple-500' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                          <span className="text-sm text-gray-600 font-medium">{item.label}</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div>
              <FilterBar>
                <FilterInput value={userSearch} placeholder="Search name or phone..."
                  onChange={val => { setUserSearch(val); applyUserFilter({ uSearch: val }); }} />
                <FilterSelect value={userCounty} placeholder="All Counties"
                  options={counties}
                  onChange={val => { setUserCounty(val); applyUserFilter({ uCounty: val }); }} />
                <FilterSelect value={userGender} placeholder="All Genders"
                  options={[{ key: 'Male', label: 'Male' }, { key: 'Female', label: 'Female' }]}
                  onChange={val => { setUserGender(val); applyUserFilter({ uGender: val }); }} />
                <FilterSelect value={userStage} placeholder="All Stages"
                  options={[{ key: 'complete', label: 'Fully Registered' }, { key: 'partial', label: 'Partially Registered' }]}
                  onChange={val => { setUserStage(val); applyUserFilter({ uStage: val }); }} />
                <FilterSelect value={userDateRange} placeholder="All Time"
                  options={DATE_RANGES.filter(d => d.key)}
                  onChange={val => { setUserDateRange(val); applyUserFilter({ uDateRange: val }); }} />
                {(userSearch || userCounty || userGender || userStage || userDateRange) && (
                  <ClearBtn onClick={() => {
                    setUserSearch(''); setUserCounty(''); setUserGender('');
                    setUserStage(''); setUserDateRange('');
                    applyUserFilter({ uSearch: '', uCounty: '', uGender: '', uStage: '', uDateRange: '' });
                  }} />
                )}
              </FilterBar>

              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500">{usersMeta.total} users found</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-blue-700 text-white">
                        {['Name', 'Phone', 'Age', 'Gender', 'County', 'Town', 'Education', 'Profession', 'Marital Status', 'Stage', 'Registered'].map(h => (
                          <th key={h} className="px-4 py-4 text-left font-semibold text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {users.length === 0 ? (
                        <tr><td colSpan="11" className="px-4 py-12 text-center text-gray-400 font-medium">No users found</td></tr>
                      ) : users.map((user, index) => (
                        <tr key={user.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                          <td className="px-4 py-4 font-bold text-gray-900 whitespace-nowrap">{user.name}</td>
                          <td className="px-4 py-4 font-semibold text-gray-700 whitespace-nowrap">{user.phone_number}</td>
                          <td className="px-4 py-4 font-semibold text-gray-700">{user.age}</td>
                          <td className="px-4 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.gender?.toLowerCase().includes('female') ? 'bg-pink-100 text-pink-800' : 'bg-blue-100 text-blue-800'}`}>
                              {user.gender}
                            </span>
                          </td>
                          <td className="px-4 py-4 font-semibold text-gray-700 whitespace-nowrap">{user.county}</td>
                          <td className="px-4 py-4 font-semibold text-gray-700 whitespace-nowrap">{user.town}</td>
                          <td className="px-4 py-4 font-semibold text-gray-700">{user.education || '—'}</td>
                          <td className="px-4 py-4 font-semibold text-gray-700">{user.profession || '—'}</td>
                          <td className="px-4 py-4 font-semibold text-gray-700 whitespace-nowrap">{user.marital_status || '—'}</td>
                          <td className="px-4 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                              user.registration_stage === 'complete' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>{user.registration_stage === 'complete' ? 'Complete' : 'Partial'}</span>
                          </td>
                          <td className="px-4 py-4 text-gray-400 text-xs whitespace-nowrap">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={usersPage} totalPages={usersMeta.total_pages}
                  onPage={pg => { setUsersPage(pg); fetchAll(token, { ...getCurrentFilters(), uPage: pg }); }} />
              </div>
            </div>
          )}

          {/* MESSAGES TAB */}
          {activeTab === 'messages' && (
            <div>
              <FilterBar>
                <FilterInput value={messageSearch} placeholder="Search sender, receiver or message..."
                  onChange={val => { setMessageSearch(val); applyMessageFilter({ mSearch: val }); }} />
                <FilterSelect value={messageDirection} placeholder="All Directions"
                  options={[{ key: 'inbound', label: 'Inbound' }, { key: 'outbound', label: 'Outbound' }]}
                  onChange={val => { setMessageDirection(val); applyMessageFilter({ mDirection: val }); }} />
                <FilterSelect value={messageDateRange} placeholder="All Time"
                  options={DATE_RANGES.filter(d => d.key)}
                  onChange={val => { setMessageDateRange(val); applyMessageFilter({ mDateRange: val }); }} />
                {(messageSearch || messageDirection || messageDateRange) && (
                  <ClearBtn onClick={() => {
                    setMessageSearch(''); setMessageDirection(''); setMessageDateRange('');
                    applyMessageFilter({ mSearch: '', mDirection: '', mDateRange: '' });
                  }} />
                )}
              </FilterBar>

              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500">{messagesMeta.total} messages found</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-green-700 text-white">
                        {['From', 'To', 'Message', 'Direction', 'Time'].map(h => (
                          <th key={h} className="px-4 py-4 text-left font-semibold text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {messages.length === 0 ? (
                        <tr><td colSpan="5" className="px-4 py-12 text-center text-gray-400 font-medium">No messages found</td></tr>
                      ) : messages.map((msg, index) => (
                        <tr key={msg.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-green-50 transition-colors`}>
                          <td className="px-4 py-4 font-bold text-gray-900 whitespace-nowrap">{msg.sender}</td>
                          <td className="px-4 py-4 font-semibold text-gray-700 whitespace-nowrap">{msg.receiver}</td>
                          <td className="px-4 py-4 font-semibold text-gray-700" style={{ maxWidth: '320px', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: '1.5' }}>{msg.message}</td>
                          <td className="px-4 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${msg.direction === 'inbound' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                              {msg.direction}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-gray-400 text-xs whitespace-nowrap">{new Date(msg.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={messagesPage} totalPages={messagesMeta.total_pages}
                  onPage={pg => { setMessagesPage(pg); fetchAll(token, { ...getCurrentFilters(), mPage: pg }); }} />
              </div>
            </div>
          )}

          {/* MATCHES TAB */}
          {activeTab === 'matches' && (
            <div>
              <FilterBar>
                <FilterSelect value={matchStatus} placeholder="All Statuses"
                  options={[{ key: 'pending', label: 'Pending' }, { key: 'accepted', label: 'Accepted' }]}
                  onChange={val => { setMatchStatus(val); applyMatchFilter({ matchStatus: val }); }} />
                <FilterSelect value={matchDateRange} placeholder="All Time"
                  options={DATE_RANGES.filter(d => d.key)}
                  onChange={val => { setMatchDateRange(val); applyMatchFilter({ matchDateRange: val }); }} />
                {(matchStatus || matchDateRange) && (
                  <ClearBtn onClick={() => {
                    setMatchStatus(''); setMatchDateRange('');
                    applyMatchFilter({ matchStatus: '', matchDateRange: '' });
                  }} />
                )}
              </FilterBar>

              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-gray-500">{matchesMeta.total} matches found</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-purple-700 text-white">
                        {['Requester', 'Phone', 'Age', 'Town', 'Matched With', 'Phone', 'Age', 'Town', 'Status', 'Date'].map(h => (
                          <th key={h} className="px-4 py-4 text-left font-semibold text-xs uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {matches.length === 0 ? (
                        <tr><td colSpan="10" className="px-4 py-12 text-center text-gray-400 font-medium">No matches found</td></tr>
                      ) : matches.map((match, index) => (
                        <tr key={match.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-purple-50 transition-colors`}>
                          <td className="px-4 py-4 font-bold text-gray-900 whitespace-nowrap">{match.requester_name}</td>
                          <td className="px-4 py-4 font-semibold text-gray-700 whitespace-nowrap">{match.requester_phone}</td>
                          <td className="px-4 py-4 font-semibold text-gray-700">{match.requester_age}</td>
                          <td className="px-4 py-4 font-semibold text-gray-700 whitespace-nowrap">{match.requester_town}</td>
                          <td className="px-4 py-4 font-bold text-gray-900 whitespace-nowrap">{match.matched_name}</td>
                          <td className="px-4 py-4 font-semibold text-gray-700 whitespace-nowrap">{match.matched_phone}</td>
                          <td className="px-4 py-4 font-semibold text-gray-700">{match.matched_age}</td>
                          <td className="px-4 py-4 font-semibold text-gray-700 whitespace-nowrap">{match.matched_town}</td>
                          <td className="px-4 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${match.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {match.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-gray-400 text-xs whitespace-nowrap">
                            {new Date(match.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination page={matchesPage} totalPages={matchesMeta.total_pages}
                  onPage={pg => { setMatchesPage(pg); fetchAll(token, { ...getCurrentFilters(), matchPage: pg }); }} />
              </div>
            </div>
          )}

          <p className="text-center text-xs text-gray-300 mt-8 pb-4">Penzi Dating Service © 2026 — Admin Dashboard</p>
        </div>
      </main>
    </div>
  );
}