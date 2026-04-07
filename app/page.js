'use client';

import { useState } from 'react';

const ADMIN_API = 'http://127.0.0.1:8000'; // Change this to your actual backend URL

export default function Home() {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [matches, setMatches] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [messageFilter, setMessageFilter] = useState('all');
  const [matchFilter, setMatchFilter] = useState('all');

  const login = async () => {
    try {
      const response = await fetch(`${ADMIN_API}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `username=${username}&password=${password}`
      });
      const data = await response.json();
      if (data.access_token) {
        setToken(data.access_token);
        setIsLoggedIn(true);
        setLoginError('');
        fetchData(data.access_token);
      } else {
        setLoginError('Invalid username or password');
      }
    } catch {
      setLoginError('Could not connect to server');
    }
  };

  const fetchData = async (accessToken) => {
    try {
      const headers = { Authorization: `Bearer ${accessToken}` };
      const [usersRes, messagesRes, matchesRes] = await Promise.all([
        fetch(`${ADMIN_API}/admin/users`, { headers }),
        fetch(`${ADMIN_API}/admin/messages`, { headers }),
        fetch(`${ADMIN_API}/admin/matches`, { headers }),
      ]);
      setUsers(await usersRes.json());
      setMessages(await messagesRes.json());
      setMatches(await matchesRes.json());
      setLoading(false);
      setRefreshing(false);
    } catch {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData(token);
  };

  // Filters
  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.phone_number?.includes(userSearch)
  );

  const filteredMessages = messageFilter === 'all'
    ? messages
    : messages.filter(m => m.direction === messageFilter);

  const filteredMatches = matchFilter === 'all'
    ? matches
    : matches.filter(m => m.status === matchFilter);

  const completedUsers = users.filter(u => u.registration_stage === 'complete');
  const acceptedMatches = matches.filter(m => m.status === 'accepted');
  const inboundMessages = messages.filter(m => m.direction === 'inbound');
  const outboundMessages = messages.filter(m => m.direction === 'outbound');

  // ── LIVELY LOGIN PAGE ──
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-white font-sans">
        {/* LEFT SIDE: Visual/Brand Side */}
        <div 
          className="hidden md:flex md:w-1/2 lg:w-2/3 bg-cover bg-center relative"
          style={{ 
            backgroundImage: `url('https://i.pinimg.com/1200x/e6/63/5a/e6635a81fdf44807c808e1e816f16408.jpg')` // <-- replace with your direct image URL
          }}
        >
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"></div>

          {/* Content on top of the overlay */}
          <div className="relative z-10 flex flex-col justify-between p-12 w-full text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-blue-700 text-2xl font-black">P</span>
              </div>
              <h1 className="text-3xl font-black tracking-tight">Penzi Admin</h1>
            </div>

            <div>
              <h2 className="text-5xl font-bold mb-4 leading-tight">Connect hearts, <br/>Manage love.</h2>
              <p className="text-blue-100 text-lg max-w-md leading-relaxed">
                The administrative heartbeat of Africa's premier dating experience. 
                Insights and moderation for a better community.
             </p>
           </div>

           <p className="text-blue-200/60 text-sm font-medium">© 2026 Penzi Dating Service.</p>
         </div>
        </div>
        

        {/* RIGHT SIDE: Login Form */}
        <div className="w-full md:w-1/2 lg:w-1/3 flex items-center justify-center p-8 bg-gray-50">
          <div className="w-full max-w-md">
            <div className="mb-10">
              <h2 className="text-3xl font-black text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-500 font-medium">Enter your credentials to access the dashboard</p>
            </div>

            {loginError && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-r-xl mb-6 text-sm flex items-center gap-3">
                <span className="text-lg">⚠️</span>
                {loginError}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="admin_username"
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:bg-white bg-white shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  onKeyDown={e => e.key === 'Enter' && login()}
                  className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl text-sm text-gray-700 focus:outline-none focus:border-blue-500 focus:bg-white bg-white shadow-sm"
                />
              </div>

              <button
                onClick={login}
                className="w-full py-4 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-2xl text-sm transition-all transform hover:-translate-y-1 shadow-xl shadow-blue-200 active:scale-[0.98]"
              >
                Sign In to Dashboard
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ── LOADING ──
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-semibold tracking-wide">Initializing Penzi Dashboard...</p>
        </div>
      </div>
    );
  }

  const navItems = [
    { key: 'dashboard', label: 'Overview', icon: '▣' },
    { key: 'users', label: 'Users', icon: '◉', count: users.length },
    { key: 'messages', label: 'Messages', icon: '✉', count: messages.length },
    { key: 'matches', label: 'Matches', icon: '♥', count: matches.length },
  ];

  // ── MAIN DASHBOARD ──
  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-800 min-h-screen flex flex-col shadow-2xl sticky top-0 h-screen">
        <div className="px-6 py-8 border-b border-blue-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow">
              <span className="text-blue-800 font-black text-lg">P</span>
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight">Penzi</p>
              <p className="text-blue-300 text-xs">Admin Central</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold transition-all ${
                activeTab === item.key
                  ? 'bg-white text-blue-900 shadow-xl scale-[1.02]'
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </span>
              {item.count !== undefined && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  activeTab === item.key ? 'bg-blue-100 text-blue-800' : 'bg-blue-800 text-blue-200'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-4 py-6 border-t border-blue-800 space-y-3">
          <button
            onClick={handleRefresh}
            className="w-full py-3 bg-blue-800 text-blue-100 rounded-xl text-xs font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            {refreshing ? 'Refreshing...' : '↻ Refresh Data'}
          </button>
          <button
            onClick={() => { setIsLoggedIn(false); setToken(''); }}
            className="w-full py-3 bg-red-500/10 text-white-400 border border-red-500/20 rounded-xl text-xs font-black hover:bg-red-500 hover:text-white transition-all"
          >
            Logout Session
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between shadow-sm sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-black text-gray-900 capitalize tracking-tight">
              {activeTab}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 font-medium tracking-wide">Live Statistics & Management</p>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-inner">
              <span className="text-white text-xs font-black">{username?.charAt(0).toUpperCase()}</span>
            </div>
            <span className="text-sm font-bold text-gray-700">{username}</span>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-8 bg-gray-100/50">

          {/* ── DASHBOARD TAB ── */}
          {activeTab === 'dashboard' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {[
                  { label: 'Total Users', value: users.length, color: 'text-blue-600', bg: 'bg-white', border: 'border-blue-100' },
                  { label: 'Total Messages', value: messages.length, color: 'text-green-600', bg: 'bg-white', border: 'border-green-100' },
                  { label: 'Total Matches', value: matches.length, color: 'text-purple-600', bg: 'bg-white', border: 'border-purple-100' },
                  { label: 'Accepted Matches', value: acceptedMatches.length, color: 'text-orange-600', bg: 'bg-white', border: 'border-orange-100' },
                ].map((stat, i) => (
                  <div key={i} className={`${stat.bg} border-b-4 ${stat.border} rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow`}>
                    <p className={`text-4xl font-black ${stat.color}`}>{stat.value}</p>
                    <p className="text-gray-400 mt-2 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                  <h3 className="font-black text-gray-800 mb-6 text-lg border-b pb-4">Registration Analytics</h3>
                  <div className="space-y-5">
                    {[
                      { label: 'Fully Registered', value: completedUsers.length, color: 'bg-green-500', percent: (completedUsers.length/users.length * 100).toFixed(0) },
                      { label: 'Incomplete Profiles', value: users.length - completedUsers.length, color: 'bg-yellow-400', percent: ((users.length - completedUsers.length)/users.length * 100).toFixed(0) },
                    ].map((item, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 font-bold">{item.label}</span>
                          <span className="text-sm font-black text-gray-900">{item.value}</span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div className={`${item.color} h-full transition-all duration-1000`} style={{width: `${item.percent}%`}}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                  <h3 className="font-black text-gray-800 mb-6 text-lg border-b pb-4">Traffic Insights</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-2xl">
                      <p className="text-2xl font-black text-blue-700">{inboundMessages.length}</p>
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">Inbound SMS</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-2xl">
                      <p className="text-2xl font-black text-green-700">{outboundMessages.length}</p>
                      <p className="text-[10px] font-bold text-green-400 uppercase tracking-tighter">Outbound SMS</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── USERS TAB ── */}
          {activeTab === 'users' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
                <p className="text-sm font-bold text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm">
                  Showing <span className="text-blue-600">{filteredUsers.length}</span> of {users.length} registered members
                </p>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                    <input
                        type="text"
                        value={userSearch}
                        onChange={e => setUserSearch(e.target.value)}
                        placeholder="Search name or phone..."
                        className="pl-12 pr-6 py-3 border-2 border-white rounded-2xl text-sm text-gray-900 focus:outline-none focus:border-blue-500 bg-white w-full md:w-80 shadow-sm"
                    />
                </div>
              </div>
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-400">
                        {['Name', 'Phone', 'Age', 'Gender', 'Location', 'Stage'].map(h => (
                          <th key={h} className="px-6 py-4 text-left font-black text-[10px] uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-20 text-center text-gray-400 font-bold">No member records match your search</td>
                        </tr>
                      ) : (
                        filteredUsers.map((user, index) => (
                          <tr key={user.id} className="hover:bg-blue-50/50 transition-colors group">
                            <td className="px-6 py-5 font-black text-gray-900">{user.name}</td>
                            <td className="px-6 py-5 font-bold text-gray-500 tracking-tight">{user.phone_number}</td>
                            <td className="px-6 py-5 font-bold text-gray-700">{user.age}</td>
                            <td className="px-6 py-5">
                                <span className="text-[10px] font-black uppercase bg-gray-100 px-2 py-1 rounded-md text-gray-500">{user.gender}</span>
                            </td>
                            <td className="px-6 py-5 font-medium text-gray-600 italic">{user.county}, {user.town}</td>
                            <td className="px-6 py-5">
                              <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm ${
                                user.registration_stage === 'complete'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {user.registration_stage}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── MESSAGES TAB ── */}
          {activeTab === 'messages' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-6">
                <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
                  {[
                    { key: 'all', label: `All` },
                    { key: 'inbound', label: `Inbound` },
                    { key: 'outbound', label: `Outbound` },
                  ].map(f => (
                    <button
                      key={f.key}
                      onClick={() => setMessageFilter(f.key)}
                      className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${
                        messageFilter === f.key
                          ? 'bg-blue-700 text-white shadow-lg'
                          : 'text-gray-400 hover:text-gray-700'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-gray-400">
                        {['From', 'To', 'Message', 'Time'].map(h => (
                          <th key={h} className="px-6 py-4 text-left font-black text-[10px] uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredMessages.map((msg) => (
                        <tr key={msg.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-6 py-5 font-black text-gray-900">{msg.sender}</td>
                          <td className="px-6 py-5 font-bold text-gray-500">{msg.receiver}</td>
                          <td className="px-6 py-5">
                              <div className={`p-3 rounded-2xl text-sm font-medium inline-block max-w-md ${
                                  msg.direction === 'inbound' ? 'bg-blue-50 text-blue-900 rounded-tl-none' : 'bg-green-50 text-green-900 rounded-tr-none'
                              }`}>
                                {msg.message}
                              </div>
                          </td>
                          <td className="px-6 py-5 text-gray-400 text-[10px] font-bold uppercase whitespace-nowrap">
                            {new Date(msg.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── MATCHES TAB ── */}
          {activeTab === 'matches' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 inline-flex mb-6">
                  {['all', 'pending', 'accepted'].map(f => (
                    <button
                      key={f}
                      onClick={() => setMatchFilter(f)}
                      className={`px-6 py-2 rounded-xl text-xs font-black transition-all capitalize ${
                        matchFilter === f
                          ? 'bg-purple-700 text-white shadow-lg'
                          : 'text-gray-400 hover:text-gray-700'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMatches.map((match) => (
                  <div key={match.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all">
                    <div className="flex items-center justify-between mb-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                            match.status === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>{match.status}</span>
                        <span className="text-[10px] text-gray-300 font-bold">{new Date(match.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center justify-center gap-4 py-4">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mb-2 mx-auto text-blue-600 font-black">?</div>
                            <p className="text-xs font-black text-gray-800">{match.requester_phone.slice(-4)}</p>
                        </div>
                        <div className="text-purple-300 text-xl animate-pulse">❤</div>
                        <div className="text-center">
                            <div className="w-12 h-12 bg-pink-100 rounded-2xl flex items-center justify-center mb-2 mx-auto text-pink-600 font-black">?</div>
                            <p className="text-xs font-black text-gray-800">{match.matched_phone.slice(-4)}</p>
                        </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
           {/*
           <footer className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 mt-16 pb-10">
           Penzi Secure Admin Infrastructure — 2026 Edition
          </footer>
            */}
        </div>
      </main>
    </div>
  );}
