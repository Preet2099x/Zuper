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
      processing: { bg: 'bg-yellow-300', label: '⏳ PROCESSING' },
      verified: { bg: 'bg-green-300', label: '✓ VERIFIED' },
      rejected: { bg: 'bg-red-300', label: '✕ REJECTED' }
    };

    const config = statusConfig[status] || statusConfig.processing;

    return (
      <span className={`px-3 py-1 text-xs font-black uppercase border-2 border-black ${config.bg}`}>
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
        <div className="text-6xl animate-spin">⏳</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-between items-center">
          <h3 className="text-2xl font-black uppercase">📋 DOCUMENT VERIFICATION</h3>
          <div className="flex items-center space-x-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border-3 border-black font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
            >
              <option value="pending">PENDING DOCUMENTS</option>
              <option value="all">ALL DOCUMENTS</option>
              <option value="verified">VERIFIED</option>
              <option value="rejected">REJECTED</option>
            </select>
            <div className="bg-purple-200 border-3 border-black px-4 py-2 font-black text-sm">
              TOTAL: {documents.length}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-300 border-3 border-black px-4 py-3 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          ⚠️ {error}
        </div>
      )}
      {message && (
        <div className="bg-green-300 border-3 border-black px-4 py-3 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          ✓ {message}
        </div>
      )}

      {/* Documents List */}
      <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 font-bold text-lg">📄 NO DOCUMENTS FOUND</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <div className="divide-y-4 divide-black">
              {documents.map((document) => (
                <div key={document._id} className="hover:bg-purple-50">
                  {/* Document Header */}
                  <div
                    className="px-6 py-4 cursor-pointer flex items-center justify-between"
                    onClick={() => setSelectedDocument(selectedDocument === document._id ? null : document._id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className={`h-10 w-10 border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center ${
                          document.documentType === 'license' ? 'bg-blue-300' : 'bg-green-300'
                        }`}>
                          <span className="text-sm font-black">
                            {document.documentType === 'license' ? 'DL' : 'ID'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="text-sm font-black uppercase text-gray-900">
                          {getDocumentTypeLabel(document.documentType)}
                        </div>
                        <div className="text-sm font-bold text-gray-600">
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
                    <div className="px-6 pb-4 bg-purple-50 border-t-3 border-black">
                      <div className="space-y-4">
                        {/* Document Image */}
                        <div>
                          <label className="block text-xs font-black uppercase text-gray-900 mb-2">
                            DOCUMENT IMAGE
                          </label>
                          <div className="border-3 border-black p-4 bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                            <img
                              src={document.documentImage}
                              alt={`${getDocumentTypeLabel(document.documentType)}`}
                              className="max-w-full h-auto max-h-64 object-contain"
                            />
                          </div>
                        </div>

                        {/* Document Details */}
                        <div className="grid grid-cols-2 gap-4 text-sm font-bold">
                          <div>
                            <span className="uppercase">Customer:</span> {document.customer?.name}
                          </div>
                          <div>
                            <span className="uppercase">Email:</span> {document.customer?.email}
                          </div>
                          <div>
                            <span className="uppercase">Phone:</span> {document.customer?.phone}
                          </div>
                          <div>
                            <span className="uppercase">Document Type:</span> {getDocumentTypeLabel(document.documentType)}
                          </div>
                          <div>
                            <span className="uppercase">Document Number:</span> {document.documentType === 'aadhar' ? document.aadharNumber : document.licenseNumber}
                          </div>
                          <div>
                            <span className="uppercase">Status:</span> {getStatusBadge(document.status)}
                          </div>
                          <div>
                            <span className="uppercase">Submitted:</span> {new Date(document.createdAt).toLocaleDateString()}
                          </div>
                          {document.verifiedAt && (
                            <div>
                              <span className="uppercase">Verified At:</span> {new Date(document.verifiedAt).toLocaleDateString()}
                            </div>
                          )}
                          {document.verifiedBy && (
                            <div>
                              <span className="uppercase">Verified By:</span> Admin
                            </div>
                          )}
                        </div>

                        {/* Admin Notes */}
                        {document.adminNotes && (
                          <div>
                            <label className="block text-xs font-black uppercase text-gray-900 mb-1">
                              ADMIN NOTES
                            </label>
                            <div className="bg-white border-3 border-black p-3 text-sm font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
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
                              className="px-4 py-2 bg-green-400 border-3 border-black font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actionLoading ? '⏳ PROCESSING...' : '✓ VERIFY DOCUMENT'}
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
        className="px-4 py-2 bg-red-400 border-3 border-black font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ✕ REJECT DOCUMENT
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border-4 border-black w-96 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-black uppercase text-gray-900 mb-4">
                ⚠️ REJECT DOCUMENT
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-xs font-black uppercase text-gray-900 mb-2">
                    REASON FOR REJECTION *
                  </label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    required
                    rows={4}
                    className="w-full px-3 py-2 border-3 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    placeholder="Please provide a detailed reason for rejecting this document..."
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-red-400 border-3 border-black font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? '⏳ REJECTING...' : '✕ REJECT DOCUMENT'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-gray-300 border-3 border-black font-black uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
                  >
                    CANCEL
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