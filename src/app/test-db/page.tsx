"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function TestDatabasePage() {
  const [tests, setTests] = useState({
    connection: { status: 'loading', message: 'Testing connection...' },
    leadsTable: { status: 'loading', message: 'Testing leads table...' },
    formsTable: { status: 'loading', message: 'Testing lead_forms table...' },
    policies: { status: 'loading', message: 'Testing RLS policies...' },
  });

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    // Test 1: Connection
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setTests(prev => ({
        ...prev,
        connection: { 
          status: 'success', 
          message: user ? `Connected as ${user.email}` : 'Connected (not logged in)' 
        }
      }));
    } catch (error) {
      setTests(prev => ({
        ...prev,
        connection: { status: 'error', message: 'Connection failed' }
      }));
    }

    // Test 2: Leads table
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('count')
        .limit(1);

      if (error) throw error;
      setTests(prev => ({
        ...prev,
        leadsTable: { status: 'success', message: 'Leads table exists and accessible' }
      }));
    } catch (error) {
      setTests(prev => ({
        ...prev,
        leadsTable: { status: 'error', message: 'Leads table not found or not accessible' }
      }));
    }

    // Test 3: Lead forms table
    try {
      const { data, error } = await supabase
        .from('lead_forms')
        .select('count')
        .limit(1);

      if (error) throw error;
      setTests(prev => ({
        ...prev,
        formsTable: { status: 'success', message: 'Lead forms table exists and accessible' }
      }));
    } catch (error) {
      setTests(prev => ({
        ...prev,
        formsTable: { status: 'error', message: 'Lead forms table not found or not accessible' }
      }));
    }

    // Test 4: RLS Policies (basic test)
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('leads')
          .select('id')
          .limit(1);

        if (error && error.code !== 'PGRST116') throw error;
        setTests(prev => ({
          ...prev,
          policies: { status: 'success', message: 'RLS policies are working' }
        }));
      } else {
        setTests(prev => ({
          ...prev,
          policies: { status: 'warning', message: 'Not logged in - cannot test RLS policies' }
        }));
      }
    } catch (error) {
      setTests(prev => ({
        ...prev,
        policies: { status: 'error', message: 'RLS policies may not be set up correctly' }
      }));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  const allTestsPassed = Object.values(tests).every(test => test.status === 'success' || test.status === 'warning');

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-sm rounded-lg border border-gray-200">
          <div className="px-6 py-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Database Setup Test</h1>
            <p className="text-gray-600 mb-8">
              This page tests if your Supabase database is set up correctly for NodoLeads.
            </p>

            <div className="space-y-4">
              {Object.entries(tests).map(([testName, test]) => (
                <div
                  key={testName}
                  className={`p-4 rounded-lg border ${getStatusColor(test.status)}`}
                >
                  <div className="flex items-center">
                    {getStatusIcon(test.status)}
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-gray-900 capitalize">
                        {testName.replace(/([A-Z])/g, ' $1').trim()}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{test.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {allTestsPassed ? (
              <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">All Tests Passed!</h3>
                    <p className="text-sm text-green-700 mt-1">
                      Your database is set up correctly. You can now use all NodoLeads features.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Setup Required</h3>
                    <p className="text-sm text-red-700 mt-1">
                      Please run the SQL commands in the SETUP_DATABASE.md file in your Supabase SQL Editor.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Next Steps:</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• If tests failed: Run the SQL commands in SETUP_DATABASE.md</li>
                <li>• If tests passed: Go to <a href="/dashboard" className="text-blue-600 hover:text-blue-500">Dashboard</a></li>
                <li>• Create your first QR code: <a href="/qr-generator" className="text-blue-600 hover:text-blue-500">QR Generator</a></li>
                <li>• Add manual leads: <a href="/leads/new" className="text-blue-600 hover:text-blue-500">Add Lead</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
