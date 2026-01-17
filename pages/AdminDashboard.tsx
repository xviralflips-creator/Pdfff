
import React from 'react';
import { Project } from '../types';
import { Users, CreditCard, Activity, ShieldAlert, CheckCircle, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface AdminDashboardProps {
  projects: Project[];
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ projects }) => {
  const data = [
    { name: 'Mon', usage: 400, cost: 24 },
    { name: 'Tue', usage: 300, cost: 13 },
    { name: 'Wed', usage: 200, cost: 9 },
    { name: 'Thu', usage: 278, cost: 19 },
    { name: 'Fri', usage: 189, cost: 12 },
    { name: 'Sat', usage: 239, cost: 15 },
    { name: 'Sun', usage: 349, cost: 21 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminStat icon={Users} label="Total Users" value="1,284" trend="+12% this week" color="blue" />
        <AdminStat icon={Activity} label="AI Requests" value="45.2k" trend="+5% this week" color="indigo" />
        <AdminStat icon={CreditCard} label="Revenue" value="$12,490" trend="+18% this week" color="emerald" />
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold mb-6">API Consumption (Monthly)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="usage" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold mb-6">Subscription Trends</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                <Line type="monotone" dataKey="cost" stroke="#8b5cf6" strokeWidth={3} dot={{r: 6, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff'}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-xl font-bold">Content Moderation Queue</h3>
          <div className="flex space-x-2">
            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">12 Pending</span>
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="px-8 py-4">User</th>
              <th className="px-8 py-4">Project</th>
              <th className="px-8 py-4">Status</th>
              <th className="px-8 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[
              { user: "alex_j@gmail.com", project: "The Haunted Woods", status: "Review" },
              { user: "sarah.k@tech.io", project: "Space Explorers", status: "Auto-Approved" },
              { user: "mike99@outlook.com", project: "Cat Kingdom", status: "Review" }
            ].map((item, i) => (
              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-4 font-medium">{item.user}</td>
                <td className="px-8 py-4 text-slate-500">{item.project}</td>
                <td className="px-8 py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${
                    item.status === 'Review' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {item.status === 'Review' ? <ShieldAlert size={12} className="mr-1" /> : <CheckCircle size={12} className="mr-1" />}
                    {item.status}
                  </span>
                </td>
                <td className="px-8 py-4">
                  <div className="flex items-center space-x-3">
                    <button className="text-emerald-600 hover:underline font-bold">Approve</button>
                    <button className="text-red-500 hover:underline font-bold">Reject</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AdminStat = ({ icon: Icon, label, value, trend, color }: any) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
    <div className={`w-14 h-14 rounded-2xl bg-${color}-50 flex items-center justify-center text-${color}-600 mb-6`}>
      <Icon size={28} />
    </div>
    <p className="text-slate-500 font-medium mb-1">{label}</p>
    <h4 className="text-3xl font-black text-slate-900 mb-2">{value}</h4>
    <p className="text-emerald-600 text-sm font-bold">{trend}</p>
  </div>
);

export default AdminDashboard;
