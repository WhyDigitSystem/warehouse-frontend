import { useState } from "react";
import { Check, X, MessageSquare } from "lucide-react";

const VendorResponse = () => {
  const [vendorResponse, setVendorResponse] = useState({
    status: "pending", // pending, accepted, rejected
    payableAmount: "",
    vendorRemark: ""
  });

  const handleAccept = () => {
    setVendorResponse(prev => ({
      ...prev,
      status: "accepted"
    }));
  };

  const handleReject = () => {
    setVendorResponse(prev => ({
      ...prev,
      status: "rejected"
    }));
  };

  const handleInputChange = (field, value) => {
    setVendorResponse(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="mt-6 space-y-6">
      {/* Vendor Response Section */}
      <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Vendor Response
        </h3>

        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleAccept}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition ${
                vendorResponse.status === "accepted"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50"
              }`}
            >
              <Check className="h-4 w-4" />
              Accept
            </button>
            
            <button
              onClick={handleReject}
              className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition ${
                vendorResponse.status === "rejected"
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50"
              }`}
            >
              <X className="h-4 w-4" />
              Reject
            </button>
          </div>

          {/* Payable Amount As Per Vendor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payable Amount As Per Vendor
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
                ₹
              </span>
              <input
                type="number"
                value={vendorResponse.payableAmount}
                onChange={(e) => handleInputChange("payableAmount", e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Vendor Remark */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Vendor Remark
            </label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <textarea
                value={vendorResponse.vendorRemark}
                onChange={(e) => handleInputChange("vendorRemark", e.target.value)}
                placeholder="Enter vendor remarks or comments..."
                rows={4}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status Display */}
          {vendorResponse.status !== "pending" && (
            <div className={`p-3 rounded-lg ${
              vendorResponse.status === "accepted" 
                ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
            }`}>
              <div className="flex items-center gap-2">
                {vendorResponse.status === "accepted" ? (
                  <>
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      Invoice Accepted by Vendor
                    </span>
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium text-red-700 dark:text-red-300">
                      Invoice Rejected by Vendor
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Information Section (Optional) */}
      <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Response Details
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600 dark:text-gray-400">Response Status:</span>
            <span className={`ml-2 font-medium ${
              vendorResponse.status === "accepted" 
                ? "text-green-600 dark:text-green-400"
                : vendorResponse.status === "rejected"
                ? "text-red-600 dark:text-red-400"
                : "text-yellow-600 dark:text-yellow-400"
            }`}>
              {vendorResponse.status === "accepted" 
                ? "Accepted" 
                : vendorResponse.status === "rejected" 
                ? "Rejected" 
                : "Pending Response"}
            </span>
          </div>
          
          <div>
            <span className="text-gray-600 dark:text-gray-400">Response Date:</span>
            <span className="ml-2 font-medium text-gray-900 dark:text-white">
              {vendorResponse.status !== "pending" 
                ? new Date().toLocaleDateString() 
                : "Not responded yet"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorResponse;