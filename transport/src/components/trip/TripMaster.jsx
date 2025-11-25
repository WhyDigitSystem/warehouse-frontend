import {
  Autocomplete,
  DirectionsRenderer,
  GoogleMap,
  LoadScript,
} from "@react-google-maps/api";
import { useRef, useState } from "react";
import InputField from "../UI/InputField";
import TabComponent from "../common/TabComponent";
import TripListView from "./TripListView";
import { ArrowLeft } from "lucide-react";

const MAPS_API_KEY = "AIzaSyDpZlwlIVN_z5uJwMey404fA19Qn3c8fyI"; // Replace with valid key

export default function TripMaster({ setIsListView }) {
  const [activeTab, setActiveTab] = useState(0);
  const [directions, setDirections] = useState(null);
  const [pitstops, setPitstops] = useState([]);

  const originRef = useRef(null);
  const destinationRef = useRef(null);

  const [listView, setListView] = useState(true)

  const [form, setForm] = useState({
    vendor: "",
    customer: "",
    lrNumber: "",
    vehicleNumber: "",
    route: "",
    roundTrip: false,
    addPitstops: false,
    origin: "",
    destination: "",
    driverNumber: "",
    driverName: "",
    tatDays: "",
    branch: "",
    status: "Driver Consent Pending",
    createdAt: new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    eta: "",

    materialType: "",
    vehicleType: "",
    vehicleTonnageCapacity: "0.000",
    vehicleSqftCapacity: "",
    materialSqft: "",
    weightTon: "",

  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const addPitstop = () => {
    setPitstops((prev) => [...prev, { id: Date.now(), name: "" }]);
  };

  const handlePitstopChange = (id, value) => {
    setPitstops((prev) =>
      prev.map((row) => (row.id === id ? { ...row, name: value } : row))
    );
  };

  const removePitstop = (id) => {
    setPitstops((prev) => prev.filter((row) => row.id !== id));
  };

  const calcRoute = async () => {
    if (!originRef.current?.value || !destinationRef.current?.value) {
      alert("Please enter both Origin and Destination!");
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();

    const waypoints =
      pitstops.length > 0
        ? pitstops.map((p) => ({
            location: p.name,
            stopover: true,
          }))
        : [];

    const result = await directionsService.route({
      origin: originRef.current.value,
      destination: destinationRef.current.value,
      waypoints,
      travelMode: window.google.maps.TravelMode.DRIVING,
    });

    setDirections(result);
  };

  const tabs = [
    { label: "Basic Details" },
    { label: "Extra Info" },
    { label: "Timeline" },
    { label: "Documents" },
    { label: "Verification" },
  ];

  return (
    <div className="max-w-6xl mx-auto mt-5 bg-white dark:bg-gray-900 shadow-xl rounded-xl border border-gray-200 dark:border-gray-700">
      {/* Header */}
 <div>

      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          New Trips{" "}
          <span className="text-sm text-orange-500 ml-1">• Not Saved</span>
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 rounded-lg"
          >
            Clear Form
          </button>
          <button className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Save
          </button>
            <button
          onClick={() => setIsListView(true)} // ✅ Switch to list view
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </button>
        </div>
      </div>

      {/* Tabs */}
      <TabComponent
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Basic Details */}
      {activeTab === 0 && (
        <div className="p-6 space-y-6">
          {/* Vendor and Customer */}
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
              Vendor and Customer
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField
                label="Vendor"
                name="vendor"
                value={form.vendor}
                onChange={handleChange}
                placeholder="Enter Vendor"
              />
              <InputField
                label="Customer"
                name="customer"
                value={form.customer}
                onChange={handleChange}
                placeholder="Enter Customer"
              />
              <InputField
                label="LR Number"
                name="lrNumber"
                value={form.lrNumber}
                onChange={handleChange}
                placeholder="Enter LR Number"
              />
              <InputField
                label="Vehicle Number"
                name="vehicleNumber"
                value={form.vehicleNumber}
                onChange={handleChange}
                placeholder="Enter Vehicle Number"
              />

                <InputField
                label="Route (Optional)"
                name="route"
                value={form.route}
                onChange={handleChange}
                placeholder="Enter Route Name"
              />
              <div className="flex items-center gap-6 mt-4">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    name="roundTrip"
                    checked={form.roundTrip}
                    onChange={handleChange}
                    className="h-4 w-4 accent-blue-600"
                  />
                  Round Trip
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    name="addPitstops"
                    checked={form.addPitstops}
                    onChange={handleChange}
                    className="h-4 w-4 accent-blue-600"
                  />
                  Add Pitstops
                </label>
              </div>
            </div>
          </div>

          {/* Pitstop Table */}
          {form.addPitstops && (
            <div className="mt-4 border rounded-lg p-4 border-gray-200 dark:border-gray-700">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                Pitstop Table
              </h3>

              {pitstops.length > 0 ? (
                <table className="w-full text-sm text-left border border-gray-200 dark:border-gray-700">
                  <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                    <tr>
                      <th className="px-3 py-2 border-r border-gray-200 dark:border-gray-700">
                        #
                      </th>
                      <th className="px-3 py-2 border-r border-gray-200 dark:border-gray-700">
                        Pitstop Location
                      </th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pitstops.map((stop, index) => (
                      <tr
                        key={stop.id}
                        className="border-t border-gray-200 dark:border-gray-700"
                      >
                        <td className="px-3 py-2">{index + 1}</td>
                        <td className="px-3 py-2">
                          <Autocomplete>
                            <input
                              type="text"
                              value={stop.name}
                              onChange={(e) =>
                                handlePitstopChange(stop.id, e.target.value)
                              }
                              placeholder="Enter Pitstop Location"
                              className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                            />
                          </Autocomplete>
                        </td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => removePitstop(stop.id)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-gray-500 text-sm">No pitstops added yet.</p>
              )}

              <button
                onClick={addPitstop}
                className="mt-3 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                Add Row
              </button>
            </div>
          )}

          {/* Map Section */}
          <LoadScript googleMapsApiKey={MAPS_API_KEY} libraries={["places"]}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300">
                  Origin *
                </label>
                <Autocomplete>
                  <input
                    ref={originRef}
                    type="text"
                    placeholder="Enter Origin"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </Autocomplete>

                <label className="block text-sm text-gray-700 dark:text-gray-300 mt-3">
                  Destination *
                </label>
                <Autocomplete>
                  <input
                    ref={destinationRef}
                    type="text"
                    placeholder="Enter Destination"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </Autocomplete>

                <button
                  onClick={calcRoute}
                  className="mt-3 px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
                >
                  Show Route
                </button>
              </div>

              <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 relative">
                {directions && (
                  <div className="absolute top-2 left-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg shadow text-xs text-gray-800 dark:text-gray-200 z-10">
                    <strong>
                      {directions.routes[0].legs[0].distance.text}
                    </strong>{" "}
                    • {directions.routes[0].legs[0].duration.text}
                  </div>
                )}
                <GoogleMap
                  mapContainerStyle={{ width: "100%", height: 320 }}
                  center={{ lat: 20.5937, lng: 78.9629 }}
                  zoom={5}
                >
                  {directions && <DirectionsRenderer directions={directions} />}
                </GoogleMap>
              </div>
            </div>
          </LoadScript>

          {/* Driver & Other Info */}
         

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
               <InputField
              label="Driver Number"
              name="driverNumber"
              value={form.driverNumber}
              onChange={handleChange}
              placeholder="Enter Driver Number"
              required
            />
            <InputField
              label="Driver Name"
              name="driverName"
              value={form.driverName}
              onChange={handleChange}
              placeholder="Enter Driver Name"
            />
            <InputField label="Created At" value={form.createdAt} disabled />
            <InputField
              label="ETA"
              name="eta"
              value={form.eta}
              onChange={handleChange}
              placeholder="Enter ETA"
            />
            <InputField
              label="TAT Days"
              name="tatDays"
              value={form.tatDays}
              onChange={handleChange}
              placeholder="Enter TAT Days"
            />
            <InputField
              label="Status"
              name="status"
              value={form.status}
              onChange={handleChange}
              placeholder="Enter Status"
            />
            <InputField
              label="Branch"
              name="branch"
              value={form.branch}
              onChange={handleChange}
              placeholder="Enter Branch"
            />
          </div>
        </div>
      )}

      {activeTab === 1 && (
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField label="Material Type" name="materialType" value={form.materialType} onChange={handleChange} placeholder="Enter Material Type" />
            <InputField label="Vehicle Type" name="vehicleType" value={form.vehicleType} onChange={handleChange} placeholder="Enter Vehicle Type" />
            <InputField label="Vehicle Tonnage Capacity" name="vehicleTonnageCapacity" value={form.vehicleTonnageCapacity} onChange={handleChange} placeholder="Enter Capacity" />
            <InputField label="Vehicle Sqft Capacity" name="vehicleSqftCapacity" value={form.vehicleSqftCapacity} onChange={handleChange} placeholder="Enter Sqft Capacity" />
            <InputField label="Material Sq.FT" name="materialSqft" value={form.materialSqft} onChange={handleChange} placeholder="Enter Sqft" />
            <InputField label="Weight (Ton)" name="weightTon" value={form.weightTon} onChange={handleChange} placeholder="Enter Weight in Ton" />
          </div>
        </div>
      )}
      </div>

     {/* {listView && <TripListView isListView={setListView} />} */}
    </div>
  );
}
