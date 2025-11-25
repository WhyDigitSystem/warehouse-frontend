import { useState } from 'react';
import SupplierMasterForm from './SupplierMasterForm';
import SupplierMasterList from './SupplierMasterList';

const SupplierMaster = () => {
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'form'
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setSelectedSupplier(null);
    setCurrentView('form');
  };

  const handleEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setCurrentView('form');
  };

  const handleBack = () => {
    setCurrentView('list');
    setSelectedSupplier(null);
  };

  const handleSaveSuccess = (action) => {
    // Trigger refresh of the list
    setRefreshTrigger(prev => prev + 1);
    console.log(`Supplier ${action} successfully`);
  };

  return (
    <div>
      {currentView === 'list' ? (
        <SupplierMasterList 
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          refreshTrigger={refreshTrigger}
        />
      ) : (
        <SupplierMasterForm 
          editData={selectedSupplier}
          onBack={handleBack}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </div>
  );
};

export default SupplierMaster;