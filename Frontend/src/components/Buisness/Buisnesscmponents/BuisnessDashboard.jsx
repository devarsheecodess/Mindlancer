import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Briefcase, DollarSign, Clock } from 'lucide-react';
import axios from 'axios';

function BusinessDashboard() {
  const [hiringData, setHiringData] = useState([]);
  const [stats, setStats] = useState({
    activeFreelancers: 0,
    openPositions: 0,
    totalSpent: 0,
  });
  const [data, setData] = useState({
    name: localStorage.getItem('businessName'),
  });

  const fetchHiringData = async () => {
    try {
      const businessId = localStorage.getItem("businessId");
      const response = await axios.get(`http://localhost:3000/business/hiring-data?businessId=${businessId}`);

      if (response.status === 200) {
        setHiringData(response.data);
        console.log("Fetched hiring data:", response.data);
      } else {
        console.error("Failed to fetch hiring data");
      }
    } catch (error) {
      console.error("Error fetching hiring data:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:3000/business/stats')
      setStats(response.data)
    } catch (err) {
      console.log(err)
    }
  }

  const [applications, setApplications] = useState([]);

  const fetchApplications = async () => {
    try {
      const businessId = localStorage.getItem("businessId");

      if (!businessId) {
        console.error("No businessId found in localStorage");
        return;
      }

      console.log("Fetching applications for businessId:", businessId);

      const response = await axios.get(`http://localhost:3000/business/applications2`, {
        params: { businessId },
      });

      if (response.data.success) {
        setApplications(response.data.data);
        console.log("Applications:", response.data.data);
      } else {
        console.error("Unexpected response format:", response.data);
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
    }
  };


  useEffect(() => {
    fetchStats()
    fetchHiringData();
    fetchApplications();
  }, []);

  return (
    <div className="p-8 space-y-8">
      <div className=" flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Dashboard</h1>
          <p className="text-gray-500">{data.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-primary-50">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Freelancers</p>
              <p className="text-2xl font-semibold">{stats.activeFreelancers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-accent-50">
              <Briefcase className="w-6 h-6 text-accent-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Open Positions</p>
              <p className="text-2xl font-semibold">{stats.openPositions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-lg bg-green-50">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Spent</p>
              <p className="text-2xl font-semibold">$ {stats.totalSpent}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Hiring Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hiringData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#d946ef" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Recent Applications</h2>
          <div className="space-y-4">
            {applications.map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <img
                    src={`https://media.istockphoto.com/id/2151669184/vector/vector-flat-illustration-in-grayscale-avatar-user-profile-person-icon-gender-neutral.jpg?s=612x612&w=0&k=20&c=UEa7oHoOL30ynvmJzSCIPrwwopJdfqzBs0q69ezQoM8=`}
                    alt="Applicant"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-medium">{i.name}</h3>
                    <p className="text-sm text-gray-500">{i.position}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-primary-600 bg-primary-50 rounded hover:bg-primary-100">
                    View
                  </button>
                  <button className="px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700">
                    Hire
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;