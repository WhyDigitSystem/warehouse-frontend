import { useState } from 'react';
import CarrierMasterForm from './CarrierMasterForm';
import CarrierMasterList from './CarrierMasterList';

const CarrierMaster = () => {
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'form'
  const [selectedCarrier, setSelectedCarrier] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setSelectedCarrier(null);
    setCurrentView('form');
  };

  const handleEdit = (carrier) => {
    setSelectedCarrier(carrier);
    setCurrentView('form');
  };

  const handleBack = () => {
    setCurrentView('list');
    setSelectedCarrier(null);
  };

  const handleSaveSuccess = (action) => {
    // Trigger refresh of the list
    setRefreshTrigger(prev => prev + 1);
    console.log(`Carrier ${action} successfully`);
  };

  return (
    <div>
      {currentView === 'list' ? (
        <CarrierMasterList 
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          refreshTrigger={refreshTrigger}
        />
      ) : (
        <CarrierMasterForm 
          editData={selectedCarrier}
          onBack={handleBack}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </div>
  );
};

export default CarrierMaster;