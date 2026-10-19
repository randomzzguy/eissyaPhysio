import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const Dashboard = () => {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabase.from('clients').select('*');
      if (!error) setClients(data);
    };
    fetchClients();
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Package</th>
            <th>Contact</th>
            <th>Schedule</th>
            <th>Sessions Left</th>
            <th>Payment Due</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id}>
              <td>{client.name}</td>
              <td>{client.package_name}</td>
              <td>{client.contact_details}</td>
              <td>{client.schedule}</td>
              <td>{client.sessions_left}</td>
              <td>{client.payment_due_date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;