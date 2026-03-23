'use client';

import { useState, useEffect } from 'react';

const API = 'http://127.0.0.1:8000';

const td = {padding:'12px', fontWeight:'600', color:'#111827', fontSize:'14px'};
const tdStage = {padding:'12px'};

export default function Home() {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
    fetchMessages();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API}/users`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`${API}/messages`);
      const data = await response.json();
      setMessages(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
    }
  };

  const inboundMessages = messages.filter(m => m.direction === 'inbound');
  const completedUsers = users.filter(u => u.registration_stage === 'complete');
  const matchActivity = messages.filter(m => m.direction === 'outbound' && m.message.includes('interested'));

  if (loading) {
    return (
      <div style={{minHeight:'100vh', background:'#f3f4f6', display:'flex', alignItems:'center', justifyContent:'center'}}>
        <p style={{color:'#6b7280', fontSize:'18px'}}>Loading dashboard...</p>
      </div>
    );
  }

  return (

    <div style={{minHeight:'100vh', background:'#f3f4f6', fontFamily:'sans-serif'}}>

      <div style={{background:'#1d4ed8', color:'white', padding:'24px 32px'}}>
        <h1 style={{fontSize:'28px', fontWeight:'bold', margin:0}}>Penzi Dating Service</h1>
        <p style={{color:'#bfdbfe', margin:'4px 0 0 0'}}>Admin Dashboard</p>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'16px', padding:'24px 32px'}}>
        {[
          {label:'Total Users', value:users.length, color:'#2563eb'},
          {label:'Total Messages', value:messages.length, color:'#16a34a'},
          {label:'User Messages', value:inboundMessages.length, color:'#9333ea'},
          {label:'Fully Registered', value:completedUsers.length, color:'#ea580c'},
        ].map((stat, i) => (
          <div key={i} style={{background:'white', borderRadius:'8px', padding:'16px', textAlign:'center', boxShadow:'0 1px 3px rgba(0,0,0,0.1)'}}>
            <p style={{fontSize:'32px', fontWeight:'bold', color:stat.color, margin:0}}>{stat.value}</p>
            <p style={{color:'#6b7280', marginTop:'4px', fontSize:'14px'}}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div style={{padding:'0 32px'}}>
        <div style={{display:'flex', gap:'8px', marginBottom:'16px'}}>
          {[
            {key:'users', label:`Users (${users.length})`},
            {key:'messages', label:`Messages (${messages.length})`},
            {key:'activity', label:`Match Activity (${matchActivity.length})`},
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding:'8px 24px',
                borderRadius:'8px',
                border:'none',
                cursor:'pointer',
                fontWeight:'600',
                fontSize:'14px',
                background: activeTab === tab.key ? '#2563eb' : 'white',
                color: activeTab === tab.key ? 'white' : '#111827',
                boxShadow:'0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {activeTab === 'users' && (
          <div style={{background:'white', borderRadius:'8px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)', overflow:'hidden'}}>
            <table style={{width:'100%', borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'#1e40af', color:'white'}}>
                  {['Name','Phone','Age','Gender','County','Town','Education','Profession','Marital Status','Stage'].map(h => (
                    <th key={h} style={{padding:'12px', textAlign:'left', fontSize:'13px', fontWeight:'600'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id} style={{background: index % 2 === 0 ? 'white' : '#f9fafb', borderBottom:'1px solid #e5e7eb'}}>
                    <td style={td}>{user.name}</td>
                    <td style={td}>{user.phone_number}</td>
                    <td style={td}>{user.age}</td>
                    <td style={td}>{user.gender}</td>
                    <td style={td}>{user.county}</td>
                    <td style={td}>{user.town}</td>
                    <td style={td}>{user.education || 'N/A'}</td>
                    <td style={td}>{user.profession || 'N/A'}</td>
                    <td style={td}>{user.marital_status || 'N/A'}</td>
                    <td style={tdStage}>
                      <span style={{
                        padding:'3px 10px',
                        borderRadius:'9999px',
                        fontSize:'12px',
                        fontWeight:'600',
                        background: user.registration_stage === 'complete' ? '#dcfce7' : '#fef9c3',
                        color: user.registration_stage === 'complete' ? '#166534' : '#854d0e'
                      }}>
                        {user.registration_stage}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'messages' && (
          <div style={{background:'white', borderRadius:'8px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)', overflow:'hidden'}}>
            <table style={{width:'100%', borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'#166534', color:'white'}}>
                  {['From','To','Message','Direction','Time'].map(h => (
                    <th key={h} style={{padding:'12px', textAlign:'left', fontSize:'13px', fontWeight:'600'}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {messages.map((msg, index) => (
                  <tr key={msg.id} style={{background: index % 2 === 0 ? 'white' : '#f9fafb', borderBottom:'1px solid #e5e7eb'}}>
                    <td style={td}>{msg.sender}</td>
                    <td style={td}>{msg.receiver}</td>
                    <td style={{...td, maxWidth:'300px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{msg.message}</td>
                    <td style={tdStage}>
                      <span style={{
                        padding:'3px 10px',
                        borderRadius:'9999px',
                        fontSize:'12px',
                        fontWeight:'600',
                        background: msg.direction === 'inbound' ? '#dbeafe' : '#dcfce7',
                        color: msg.direction === 'inbound' ? '#1e40af' : '#166534'
                      }}>
                        {msg.direction}
                      </span>
                    </td>
                    <td style={{...td, color:'#6b7280', fontWeight:'400'}}>
                      {new Date(msg.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'activity' && (
          <div style={{background:'white', borderRadius:'8px', boxShadow:'0 1px 3px rgba(0,0,0,0.1)', padding:'24px'}}>
            <h2 style={{fontSize:'18px', fontWeight:'bold', color:'#111827', marginBottom:'16px'}}>Match Activity</h2>
            {matchActivity.length === 0 ? (
              <p style={{color:'#9ca3af'}}>No match activity yet.</p>
            ) : (
              matchActivity.map((msg, index) => (
                <div key={index} style={{borderLeft:'4px solid #3b82f6', paddingLeft:'16px', marginBottom:'16px', paddingTop:'8px', paddingBottom:'8px'}}>
                  <p style={{color:'#111827', fontWeight:'500', margin:0}}>{msg.message}</p>
                  </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  );
}