import React, { useState, useEffect } from 'react';

const AdminDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState('pending'); // pending, all, verified, rejected
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, [filter]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');

      let url = `${import.meta.env.VITE_API_BASE}/api/documents/all`;
      if (filter === 'pending') {
        url = `${import.meta.env.VITE_API_BASE}/api/documents/pending`;
      } else if (filter !== 'all') {
        url += `?status=${filter}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const documentsData = await response.json();
        setDocuments(documentsData);
      } else {
        setError('Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Error fetching documents');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to verify this document?')) return;

    try {
      setActionLoading(true);
      setError('');
      setMessage('');

      const token = localStorage.getItem('adminToken');
  const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/documents/${documentId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ adminNotes: 'Document verified successfully' })
      });

      if (response.ok) {
        setMessage('Document verified successfully');
        fetchDocuments(); // Refresh the list
        setSelectedDocument(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to verify document');
      }
    } catch (error) {
      console.error('Error verifying document:', error);
      setError('Error verifying document');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectDocument = async (documentId, adminNotes) => {
    if (!adminNotes || adminNotes.trim().length === 0) {
      setError('Please provide a reason for rejection');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      setMessage('');

      const token = localStorage.getItem('adminToken');
  const response = await fetch(`${import.meta.env.VITE_API_BASE}/api/documents/${documentId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ adminNotes: adminNotes.trim() })
      });

      if (response.ok) {
        setMessage('Document rejected');
        fetchDocuments(); // Refresh the list
        setSelectedDocument(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to reject document');
      }
    } catch (error) {
      console.error('Error rejecting document:', error);
      setError('Error rejecting document');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      processing: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Processing' },
      verified: { bg: 'bg-green-100', text: 'text-green-800', label: 'Verified' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' }
    };

    const config = statusConfig[status] || statusConfig.processing;

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getDocumentTypeLabel = (type) => {
    return type === 'license' ? 'Driving License' : 'Aadhar Card';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Document Verification</h3>
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="pending">Pending Documents</option>
            <option value="all">All Documents</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
          <div className="text-sm text-gray-600">
            Total: {documents.length}
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {message}
        </div>
      )}

      {/* Documents List */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No documents found</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <div className="divide-y divide-gray-200">
              {documents.map((document) => (
                <div key={document._id} className="hover:bg-gray-50">
                  {/* Document Header */}
                  <div
                    className="px-6 py-4 cursor-pointer flex items-center justify-between"
                    onClick={() => setSelectedDocument(selectedDocument === document._id ? null : document._id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          document.documentType === 'license' ? 'bg-blue-300' : 'bg-green-300'
                        }`}>
                          <span className={`text-sm font-medium ${
                            document.documentType === 'license' ? 'text-blue-700' : 'text-green-700'
                          }`}>
                            {document.documentType === 'license' ? 'DL' : 'ID'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {getDocumentTypeLabel(document.documentType)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {document.customer?.name} - {document.customer?.email}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(document.status)}
                      <div className="text-xs text-gray-500">
                        {new Date(document.createdAt).toLocaleDateString()}
                      </div>
                      <svg
                        className={`w-5 h-5 text-gray-400 transform transition-transform ${
                          selectedDocument === document._id ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Expanded Document Details */}
                  {selectedDocument === document._id && (
                    <div className="px-6 pb-4 bg-gray-50">
                      <div className="space-y-4">
                        {/* Document Image */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Document Image
                          </label>
                          <div className="border border-gray-300 rounded-lg p-4 bg-white">
                            <img
                              src={document.documentImage}
                              alt={`${getDocumentTypeLabel(document.documentType)}`}
                              className="max-w-full h-auto max-h-64 object-contain"
                            />
                          </div>
                        </div>

                        {/* Document Details */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Customer:</strong> {document.customer?.name}
                          </div>
                          <div>
                            <strong>Email:</strong> {document.customer?.email}
                          </div>
                          <div>
                            <strong>Phone:</strong> {document.customer?.phone}
                          </div>
                          <div>
                            <strong>Document Type:</strong> {getDocumentTypeLabel(document.documentType)}
                          </div>
                          <div>
                            <strong>Document Number:</strong> {document.documentType === 'aadhar' ? document.aadharNumber : document.licenseNumber}
                          </div>
                          <div>
                            <strong>Status:</strong> {getStatusBadge(document.status)}
                          </div>
                          <div>
                            <strong>Submitted:</strong> {new Date(document.createdAt).toLocaleDateString()}
                          </div>
                          {document.verifiedAt && (
                            <div>
                              <strong>Verified At:</strong> {new Date(document.verifiedAt).toLocaleDateString()}
                            </div>
                          )}
                          {document.verifiedBy && (
                            <div>
                              <strong>Verified By:</strong> Admin
                            </div>
                          )}
                        </div>

                        {/* Admin Notes */}
                        {document.adminNotes && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Admin Notes
                            </label>
                            <div className="bg-white border border-gray-300 rounded-md p-3 text-sm">
                              {document.adminNotes}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        {document.status === 'processing' && (
                          <div className="flex space-x-2 pt-2">
                            <button
                              onClick={() => handleVerifyDocument(document._id)}
                              disabled={actionLoading}
                              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading ? 'Processing...' : 'Verify Document'}
                            </button>
                            <RejectDocumentModal
                              document={document}
                              onReject={handleRejectDocument}
                              loading={actionLoading}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Reject Document Modal Component
const RejectDocumentModal = ({ document, onReject, loading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onReject(document._id, adminNotes);
    setIsOpen(false);
    setAdminNotes('');
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={loading}
        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Reject Document
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Reject Document
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Rejection *
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    placeholder="Please provide a detailed reason for rejecting this document..."
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Rejecting...' : 'Reject Document'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDocuments;