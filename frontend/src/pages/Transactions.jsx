// pages/Transactions.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getTransactions,
  bulkUploadTransactions,
  deleteTransaction,
} from "../redux/slices/transactionSlice";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import {
  FiUpload,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiDownload,
  FiPlus,
} from "react-icons/fi";
import { format } from "date-fns";

const Transactions = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const dispatch = useDispatch();

    const { transactions, isLoading, pagination } = useSelector(
    (state) => state.transactions
  );

  useEffect(() => {
    dispatch(
      getTransactions({
        page: currentPage,
        limit: 20,
        search: searchTerm,
        startDate,
        endDate,
        minAmount,
        maxAmount,
      })
    );
  }, [
    dispatch,
    currentPage,
    searchTerm,
    startDate,
    endDate,
    minAmount,
    maxAmount,
  ]);




  // Fetch with page + search
  useEffect(() => {
    dispatch(
      getTransactions({
        page: currentPage,
        limit: 20,
        search: searchTerm,
      })
    );
  }, [dispatch, currentPage, searchTerm]);

  // Local filtering (uses schema fields: transactionId, shopperId)
  const filteredTransactions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return transactions;
    return transactions.filter((t) => {
      return (
        t.transactionId?.toLowerCase().includes(term) ||
        t.shopperId?.toLowerCase().includes(term)
      );
    });
  }, [transactions, searchTerm]);

  // ---------------- BULK UPLOAD ----------------
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);

        // Normalize to array of transaction objects
        let txns;
        if (Array.isArray(parsed)) {
          txns = parsed;
        } else if (Array.isArray(parsed.transactions)) {
          txns = parsed.transactions;
        } else {
          txns = [parsed];
        }

        if (!txns.length) {
          toast.error("No transactions found in JSON");
          e.target.value = "";
          return;
        }

        await dispatch(bulkUploadTransactions(txns)).unwrap();
        toast.success("Transactions uploaded successfully");

        setShowUploadModal(false);
        setCurrentPage(1);
        setSearchTerm("");
        dispatch(getTransactions({ page: 1, limit: 20, search: "" }));
      } catch (err) {
        toast.error("Invalid JSON file");
      } finally {
        e.target.value = "";
      }
    };
    reader.readAsText(file);
  };

  // ---------------- DELETE ----------------
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await dispatch(deleteTransaction(id)).unwrap();
        toast.success("Transaction deleted successfully");
      } catch (error) {
        toast.error("Error deleting transaction");
      }
    }
  };

  // ---------------- EXPORT CURRENT VIEW ----------------
  const handleExport = () => {
    if (!filteredTransactions.length) {
      toast.info("No transactions to export");
      return;
    }

    const dataStr = JSON.stringify(filteredTransactions, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    link.download = `transactions-export-${ts}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">
              Transactions
            </h1>
            <p className="text-gray-600">
              Manage and analyze your transaction data
            </p>
          </div>

          <div className="flex space-x-3 mt-4 md:mt-0">
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-secondary btn-sm flex items-center"
            >
              <FiUpload className="mr-2" />
              Upload Data
            </button>
            <button
              disabled
              className="btn-primary btn-sm flex items-center opacity-60 cursor-not-allowed"
            >
              <FiPlus className="mr-2" />
              Add Transaction
            </button>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-4 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Transaction ID or Shopper ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            {showFilters && (
  <div className="card p-4 mt-4 animate-fade-in">
    <div className="grid md:grid-cols-4 gap-4">

      {/* Start Date */}
      <div>
        <label className="text-sm font-medium text-gray-600">
          Start Date
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="input-field"
        />
      </div>

      {/* End Date */}
      <div>
        <label className="text-sm font-medium text-gray-600">
          End Date
        </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="input-field"
        />
      </div>

      {/* Min Amount */}
      <div>
        <label className="text-sm font-medium text-gray-600">
          Min Amount
        </label>
        <input
          type="number"
          placeholder="0"
          value={minAmount}
          onChange={(e) => setMinAmount(e.target.value)}
          className="input-field"
        />
      </div>

      {/* Max Amount */}
      <div>
        <label className="text-sm font-medium text-gray-600">
          Max Amount
        </label>
        <input
          type="number"
          placeholder="10000"
          value={maxAmount}
          onChange={(e) => setMaxAmount(e.target.value)}
          className="input-field"
        />
      </div>

    </div>

    {/* Clear Button */}
      {/* Actions: Apply + Clear */}
<div className="flex justify-end mt-4 space-x-3">
  <button
    onClick={() => {
      // Filters are already bound to state,
      // so just close the section
      setShowFilters(false);
      setCurrentPage(1); // optional: reset to first page
    }}
    className="btn-primary btn-sm"
  >
    Apply Filters
  </button>

  <button
    onClick={() => {
      setStartDate("");
      setEndDate("");
      setMinAmount("");
      setMaxAmount("");
      setSearchTerm("");
      setCurrentPage(1); 
      setShowFilters(false);// optional: reset page
    }}
    className="btn-secondary btn-sm"
  >
    Clear Filters
  </button>
</div>

  </div>
)}
            {/* <button
              onClick={() =>
                toast.info("Advanced filters can be added here later")
              }
              className="btn-secondary btn-sm flex items-center justify-center"
            >
              <FiFilter className="mr-2" />
              Filters
            </button> */}
            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className="btn-secondary btn-sm flex items-center justify-center"
            >
              <FiFilter className="mr-2" />
              Filters
            </button>
            <button
              onClick={handleExport}
              className="btn-secondary btn-sm flex items-center justify-center"
            >
              <FiDownload className="mr-2" />
              Export
            </button>
          </div>
        </motion.div>

        {/* Transactions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card overflow-hidden"
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="spinner" />
              <span className="ml-3 text-gray-600">
                Loading transactions...
              </span>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No transactions found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-th">Transaction ID</th>
                      <th className="table-th">Shopper ID</th>
                      <th className="table-th">Items</th>
                      <th className="table-th">Total Amount</th>
                      <th className="table-th">Date</th>
                      <th className="table-th">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTransactions.map((transaction, index) => (
                      <motion.tr
                        key={transaction._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="table-row"
                      >
                        <td className="table-td font-medium text-primary-600">
                          {transaction.transactionId}
                        </td>
                        <td className="table-td">
                          {transaction.shopperId}
                        </td>
                        <td className="table-td">
                          <div className="flex flex-wrap gap-1">
                            {transaction.items.slice(0, 3).map((item, idx) => (
                              <span
                                key={idx}
                                className="badge badge-info text-xs"
                              >
                                {item.productId}
                              </span>
                            ))}
                            {transaction.items.length > 3 && (
                              <span className="badge badge-info text-xs">
                                +{transaction.items.length - 3}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="table-td font-semibold text-green-600">
                          ${Number(transaction.totalAmount || 0).toFixed(2)}
                        </td>
                        <td className="table-td text-gray-600">
                          {transaction.timestamp
                            ? format(
                                new Date(transaction.timestamp),
                                "MMM dd, yyyy"
                              )
                            : "-"}
                        </td>
                        <td className="table-td">
                          <button
                            onClick={() => handleDelete(transaction._id)}
                            className="text-red-600 hover:text-red-800 transition-colors duration-200"
                          >
                            <FiTrash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {filteredTransactions.length} of{" "}
                    {pagination.total} transactions
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="btn-secondary btn-sm"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-gray-700">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === pagination.pages}
                      className="btn-secondary btn-sm"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="card p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-xl font-semibold mb-4">
                Upload Transaction Data
              </h3>
              <p className="text-gray-600 mb-4">
                Upload a JSON file containing your transaction data
              </p>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="input-field mb-4"
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="btn-secondary btn-sm"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
