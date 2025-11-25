import { useState } from "react";
import IndentMaster from "../components/Indent/IndentMaster";
import IndentListView from "../components/Indent/IndentListView";


const Indent = () => {
  const [isListView, setIsListView] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-all">
      {isListView ? (
        <IndentListView setIsListView={setIsListView} />
      ) : (
        <IndentMaster setIsListView={setIsListView} />
      )}
    </div>
  );
};

export default Indent;
