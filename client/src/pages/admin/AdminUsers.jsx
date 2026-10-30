import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../services/api';
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  UserCheck,
  Calendar,
  Home,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  X,
} from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeSearch, setActiveSearch] = useState('');

  // Debounce search input
  const searchTimeoutRef = useRef(null);
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setActiveSearch(val.trim());
      setPage(1); // reset to page 1 on new search
    }, 350);
  };

  const clearSearch = () => {
    setSearchInput('');
    setActiveSearch('');
    setPage(1);
  };

  const handleRoleChange = (newRole) => {
    setRoleFilter(newRole);
    setPage(1);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page,
        limit,
      };

      if (roleFilter) {
        params.role = roleFilter;
      }

      if (activeSearch) {
        params.search = activeSearch;
      }

      const res = await api.get('/admin/users', { params });
      if (res.data.success) {
        setUsers(res.data.users || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalUsers(res.data.total || 0);
      } else {
        setError(res.data.message || 'Failed to fetch user list');
      }
    } catch (err) {
      console.error('fetchUsers error:', err);
      setError(err.response?.data?.message || 'Server error occurred while loading users');
    } finally {
      setLoading(false);
    }
  }, [page, limit, roleFilter, activeSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Clean up debounce timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-white tracking-tight">User Management</h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
              {totalUsers} Registered
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Directory of registered apartment residents and administrators with verified credentials.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 hover:text-white transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-center gap-3 justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name or email address..."
            value={searchInput}
            onChange={handleSearchChange}
            className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
          />
          {searchInput && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Role Filter Pills */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium pl-1">
            <Filter className="w-3 h-3 text-teal-400" />
            <span>Role:</span>
          </span>
          <button
            onClick={() => handleRoleChange('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              roleFilter === ''
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-slate-950/70 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            All Roles
          </button>
          <button
            onClick={() => handleRoleChange('resident')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              roleFilter === 'resident'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-slate-950/70 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            Residents
          </button>
          <button
            onClick={() => handleRoleChange('admin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
              roleFilter === 'admin'
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-slate-950/70 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            Admins
          </button>
        </div>
      </div>

      {/* User Content Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">
          <LoadingSpinner message="Loading user directory..." />
        </div>
      ) : error ? (
        <div className="py-12 bg-slate-900/90 border border-slate-800 rounded-2xl text-center px-4">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-white mb-1">Failed to retrieve users</p>
          <p className="text-xs text-slate-400 mb-4">{error}</p>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-xs font-semibold text-white rounded-xl shadow-md transition-all"
          >
            Retry
          </button>
        </div>
      ) : users.length === 0 ? (
        <div className="py-16 bg-slate-900/90 border border-slate-800 rounded-2xl text-center px-4">
          <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white mb-1">No users matched your criteria</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
            {activeSearch || roleFilter
              ? 'Try modifying your search keywords or switching role filters.'
              : 'There are currently no users registered in the platform database.'}
          </p>
          {(activeSearch || roleFilter) && (
            <button
              onClick={() => {
                clearSearch();
                setRoleFilter('');
              }}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-xl transition-colors border border-slate-700"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Desktop Table View */}
          <div className="hidden md:block bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px] font-semibold">
                <tr>
                  <th className="py-3.5 px-5">Resident / User</th>
                  <th className="py-3.5 px-5">Flat Number</th>
                  <th className="py-3.5 px-5">System Role</th>
                  <th className="py-3.5 px-5">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => {
                  const isAdmin = u.role === 'admin';
                  return (
                    <tr key={u._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isAdmin
                                ? 'bg-teal-950/80 text-teal-300 border border-teal-800'
                                : 'bg-blue-950/80 text-blue-300 border border-blue-800'
                            }`}
                          >
                            {u.name ? u.name[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{u.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/60 border border-slate-800 text-slate-300 font-medium">
                          <Home className="w-3 h-3 text-slate-500" />
                          <span>{u.flatNumber || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isAdmin
                              ? 'bg-teal-950/80 text-teal-300 border border-teal-800'
                              : 'bg-slate-950 text-slate-300 border border-slate-800'
                          }`}
                        >
                          {isAdmin ? (
                            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                          )}
                          <span className="capitalize">{u.role}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-slate-400 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{formatDate(u.createdAt)}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-3">
            {users.map((u) => {
              const isAdmin = u.role === 'admin';
              return (
                <div
                  key={u._id}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          isAdmin
                            ? 'bg-teal-950/80 text-teal-300 border border-teal-800'
                            : 'bg-blue-950/80 text-blue-300 border border-blue-800'
                        }`}
                      >
                        {u.name ? u.name[0].toUpperCase() : 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-white text-sm">{u.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        isAdmin
                          ? 'bg-teal-950/80 text-teal-300 border border-teal-800'
                          : 'bg-slate-950 text-slate-300 border border-slate-800'
                      }`}
                    >
                      {isAdmin ? (
                        <ShieldCheck className="w-3 h-3 text-teal-400" />
                      ) : (
                        <UserCheck className="w-3 h-3 text-blue-400" />
                      )}
                      <span className="capitalize">{u.role}</span>
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Home className="w-3 h-3 text-slate-500" />
                      <span>Flat: {u.flatNumber || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>{formatDate(u.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-lg">
            <span className="text-xs text-slate-400 font-medium">
              Showing page <span className="font-bold text-white">{page}</span> of{' '}
              <span className="font-bold text-white">{totalPages}</span> ({totalUsers} total users)
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Previous</span>
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

