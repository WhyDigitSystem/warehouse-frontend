import { useState } from 'react';
import UnitMasterForm from './UnitMasterForm';
import UnitMasterList from './UnitMasterList';

const UnitMaster = () => {
  const [currentView, setCurrentView] = useState('list'); // 'list' or 'form'
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddNew = () => {
    setSelectedUnit(null);
    setCurrentView('form');
  };

  const handleEdit = (unit) => {
    setSelectedUnit(unit);
    setCurrentView('form');
  };

  const handleBack = () => {
    setCurrentView('list');
    setSelectedUnit(null);
  };

  const handleSaveSuccess = (action) => {
    // Trigger refresh of the list
    setRefreshTrigger(prev => prev + 1);
    console.log(`Unit ${action} successfully`);
  };

  return (
    <div>
      {currentView === 'list' ? (
        <UnitMasterList 
          onAddNew={handleAddNew}
          onEdit={handleEdit}
          refreshTrigger={refreshTrigger}
        />
      ) : (
        <UnitMasterForm 
          editData={selectedUnit}
          onBack={handleBack}
          onSaveSuccess={handleSaveSuccess}
        />
      )}
    </div>
  );
};

export default UnitMaster;