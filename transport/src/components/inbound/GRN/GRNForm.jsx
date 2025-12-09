import React, { useEffect, useState, useRef } from "react";
import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
  X,
  Search,
  Upload,
  Download,
  List,
  Grid,
  FileText,
} from "lucide-react";

import { grnAPI } from "../../../api/grnAPI";
import { warehouseAPI } from "../../../api/warehouseAPI";
import { gatePassInAPI } from "../../../api/gatepassAPI";

import CommonBulkUpload from "../../../utils/CommonBulkUpload";
import { useToast } from "../../Toast/ToastContext";
import sampleFile from "../../../assets/sample-files/Sample_Grn_Upload.xls";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8085";

const GrnForm = ({ editData, onBack, onSaveSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingEntry, setLoadingEntry] = useState(false);
  const [isLoadingGatePass, setIsLoadingGatePass] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  // Global parameters
  const globalParam = JSON.parse(localStorage.getItem("globalParams") || "{}");
  const loginBranchCode = globalParam?.branchcode || localStorage.getItem("branchcode") || "";
  const loginBranch = globalParam?.branch || localStorage.getItem("branch") || "";
  const loginWarehouse = globalParam?.warehouse || localStorage.getItem("warehouse") || "";
  const loginCustomer = globalParam?.customer || localStorage.getItem("customer") || "";
  const loginClient = globalParam?.client || localStorage.getItem("client") || "";
  const loginUserName = localStorage.getItem("userName") || "SYSTEM";
  const orgId = globalParam?.orgId || localStorage.getItem("orgId") || "1000000001";
  const loginFinYear = globalParam?.finYear || localStorage.getItem("finYear") || "2024-2025";

  const { addToast } = useToast();

  const [supplierList, setSupplierList] = useState([]);
  const [modeOfShipmentList, setModeOfShipmentList] = useState([]);
  const [carrierList, setCarrierList] = useState([]);
  const [gatePassIdList, setGatePassIdList] = useState([]);
  const [partNoList, setPartNoList] = useState([]);
  const [gatePassIdEdit, setGatePassIdEdit] = useState("");

  // Format date for input
  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    docId: "",
    docDate: formatDateForInput(new Date()),
    grnType: "GRN",
    entrySlNo: "",
    date: formatDateForInput(new Date()),
    gatePassId: "",
    gatePassDate: "",
    grnDate: formatDateForInput(new Date()),
    customerPo: "",
    vas: false,
    supplierShortName: "",
    supplier: "",
    billOfEntry: "",
    capacity: "",
    modeOfShipment: "",
    carrier: "",
    vesselNo: "",
    hsnNo: "",
    vehicleType: "",
    contact: "",
    sealNo: "",
    lrNo: "",
    driverName: "",
    securityName: "",
    containerNo: "",
    lrDate: formatDateForInput(new Date()),
    goodsDesc: "",
    vehicleNo: "",
    vesselDetails: "",
    lotNo: "",
    destinationFrom: "",
    destinationTo: "",
    noOfPallets: "",
    invoiceNo: "",
    noOfPacks: "",
    totAmt: "",
    totGrnQty: "",
    freeze: false,
    remarks: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [lrTableData, setLrTableData] = useState([]);
  const [lrTableErrors, setLrTableErrors] = useState([]);
  const [isPartNoLoaded, setIsPartNoLoaded] = useState(false);


  // Initialize data
  useEffect(() => {
    getNewGrnDocId();
    getAllGatePassId();
    getAllSuppliers();
    getAllModesOfShipment();
    getAllPartNo();

    if (editData) {
      getGrnById(editData);
    }
  }, [editData]);

  // API Functions
  const getNewGrnDocId = async () => {
    try {
      const params = {
        branchCode: loginBranchCode,
        client: loginClient,
        finYear: loginFinYear,
        orgId: orgId
      };

      const response = await grnAPI.getNewGrnDocId(params);
      
      if (response && response.paramObjectsMap) {
        setFormData(prev => ({
          ...prev,
          docId: response.paramObjectsMap.grnDocid || "",
        }));
      }
    } catch (error) {
      console.error("Error fetching GRN document ID:", error);
      addToast("Failed to fetch document ID", "error");
    }
  };

  const getAllGatePassId = async () => {
    try {
      const params = {
        branchCode: loginBranchCode,
        client: loginClient,
        finYear: loginFinYear,
        orgId: orgId
      };

      const response = await grnAPI.getGatePassIds(params);

      if (response && response.paramObjectsMap) {
        const gatePassList = response.paramObjectsMap.gatePassInVO || [];
        const validGatePassList = gatePassList.filter(gp => gp.id && gp.docId);
        setGatePassIdList(validGatePassList);

        if (validGatePassList.length === 0) {
          addToast("No pending gate passes found", "info");
        }
      }
    } catch (error) {
      console.error("Error fetching gate passes:", error);
      setGatePassIdList([]);
      addToast("Failed to fetch gate passes", "error");
    }
  };

  const getAllSuppliers = async () => {
    try {
      const response = await warehouseAPI.getSuppliers({
        cbranch: loginBranchCode,
        client: loginClient,
        orgid: orgId
      });

      if (response?.status) {
        const sortedSupplier = (response.paramObjectsMap.supplierVO || [])
          .filter(supplier => supplier && supplier.id && supplier.supplierShortName)
          .sort((a, b) => (b.id || 0) - (a.id || 0));
        setSupplierList(sortedSupplier);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      addToast("Failed to fetch suppliers", "error");
    }
  };

  const defaultModes = [
        { id: 1, shipmentMode: "AIR" },
        { id: 2, shipmentMode: "SEA" },
        { id: 3, shipmentMode: "ROAD" },
      ];

  const getAllModesOfShipment = async () => {
    try {
      const response = await gatePassInAPI.getModesOfShipment(orgId);
      
      const defaultModes = [
        { id: 1, shipmentMode: "AIR" },
        { id: 2, shipmentMode: "SEA" },
        { id: 3, shipmentMode: "ROAD" },
      ];
      
      const apiModes = response?.paramObjectsMap?.modOfShipments || [];
      const mergedModes = [...defaultModes];
      
      apiModes.forEach((apiMode) => {
        if (!mergedModes.some(defaultMode => 
          defaultMode.shipmentMode.toUpperCase() === apiMode.shipmentMode.toUpperCase()
        )) {
          mergedModes.push(apiMode);
        }
      });
      
      setModeOfShipmentList(mergedModes);
    } catch (error) {
      console.error("Error fetching modes of shipment:", error);
      setModeOfShipmentList(defaultModes);
    }
  };

  const getAllCarriers = async (selectedModeOfShipment) => {
    try {
      const response = await warehouseAPI.getCarriersByMode({
        cbranch: loginBranchCode,
        client: loginClient,
        orgid: orgId,
        shipmentMode: selectedModeOfShipment
      });

      setCarrierList(response?.paramObjectsMap?.CarrierVO || []);
    } catch (error) {
      console.error("Error fetching carriers:", error);
    }
  };

const getAllPartNo = async () => {
  try {
    console.log("Fetching part numbers with params:", {
      cbranch: loginBranchCode,
      client: loginClient,
      orgid: orgId
    });

    const response = await warehouseAPI.getMaterials({
      cbranch: loginBranchCode,
      client: loginClient,
      orgid: orgId
    });

    console.log("Part number API response type:", typeof response);
    console.log("Part number API response is array?", Array.isArray(response));
    console.log("Part number API response length:", response?.length);
    console.log("First few items:", response?.slice(0, 3));

    let partNos = [];

    setPartNoList(partNos);
    setIsPartNoLoaded(true); 

    // Handle both response formats
    if (Array.isArray(response)) {
      // Response is directly an array
      partNos = response
        .filter(item => item && item.partno && item.partno.trim() !== "")
        .map(item => ({
          id: item.id,
          partNo: item.partno,
          description: item.partDesc,
          sku: item.sku || item.partno,
          unit: item.purchaseUnit,
          barcode: item.barcode,
          ...item,
        }));
    } else if (response?.paramObjectsMap?.materialVO) {
      // Response has the nested structure
      partNos = response.paramObjectsMap.materialVO
        .filter(item => item && item.partno && item.partno.trim() !== "")
        .map(item => ({
          id: item.id,
          partNo: item.partno,
          description: item.partDesc,
          sku: item.sku || item.partno,
          unit: item.purchaseUnit,
          barcode: item.barcode,
          ...item,
        }));
    } else if (response?.status === true && response?.paramObjectsMap?.materialVO) {
      // Alternative nested structure
      partNos = response.paramObjectsMap.materialVO
        .filter(item => item && item.partno && item.partno.trim() !== "")
        .map(item => ({
          id: item.id,
          partNo: item.partno,
          description: item.partDesc,
          sku: item.sku || item.partno,
          unit: item.purchaseUnit,
          barcode: item.barcode,
          ...item,
        }));
    }

    console.log("Processed part numbers count:", partNos.length);
    console.log("Sample processed parts:", partNos.slice(0, 3));
    
    setPartNoList(partNos);
    
    if (partNos.length === 0) {
      console.warn("No part numbers found after processing");
      addToast("No part numbers found in the system", "warning");
    } else {
      console.log(`Successfully loaded ${partNos.length} part numbers`);
      addToast(`Loaded ${partNos.length} part numbers`, "success");
    }
  } catch (error) {
    console.error("Error fetching part numbers:", error);
    console.error("Error details:", error.response?.data || error.message);
    setPartNoList([]);
    addToast("Failed to fetch part numbers", "error");
  }
};

const getGrnById = async (item) => {
  try {
    const response = await grnAPI.getGrnById(item.id);
    
    if (response?.status === true) {
      const particularGrn = response.paramObjectsMap.Grn;
      setGatePassIdEdit(particularGrn.docId);

      const carrierValue = particularGrn.carrier ? particularGrn.carrier.toUpperCase() : "";

      const formattedData = {
        docId: particularGrn.docId,
        docDate: formatDateForInput(particularGrn.docdate),
        editDocDate: formatDateForInput(particularGrn.docdate),
        entrySlNo: particularGrn.entryNo,
        date: formatDateForInput(particularGrn.entryDate),
        gatePassId: particularGrn.docId,
        gatePassDate: formatDateForInput(particularGrn.gatePassDate),
        grnDate: formatDateForInput(particularGrn.grnDate),
        customerPo: particularGrn.customerPo,
        vas: particularGrn.vas === true,
        supplierShortName: particularGrn.supplierShortName,
        supplier: particularGrn.supplier,
        billOfEntry: particularGrn.billOfEnrtyNo,
        capacity: particularGrn.capacity,
        modeOfShipment: particularGrn.modeOfShipment,
        vesselNo: particularGrn.vesselNo,
        hsnNo: particularGrn.hsnNo,
        vehicleType: particularGrn.vehicleType,
        contact: particularGrn.contact,
        sealNo: particularGrn.sealNo,
        lrNo: particularGrn.lrNo,
        driverName: particularGrn.driverName,
        securityName: particularGrn.securityName,
        containerNo: particularGrn.containerNo,
        lrDate: formatDateForInput(particularGrn.lrDate),
        goodsDesc: particularGrn.goodsDescripition,
        vehicleNo: particularGrn.vehicleNo,
        vesselDetails: particularGrn.vesselDetails,
        lotNo: particularGrn.lotNo,
        destinationFrom: particularGrn.destinationFrom,
        destinationTo: particularGrn.destinationTo,
        noOfPallets: particularGrn.noOfBins,
        invoiceNo: particularGrn.invoiceNo,
        noOfPacks: particularGrn.noOfPacks,
        totAmt: particularGrn.totAmt,
        totGrnQty: particularGrn.totalGrnQty,
        freeze: particularGrn.freeze !== null ? particularGrn.freeze : false,
        remarks: particularGrn.remarks,
        carrier: carrierValue,
      };

      setFormData(formattedData);
      getAllCarriers(particularGrn.modeOfShipment);

      // Set table data - part numbers should be available now
      const tableData = particularGrn.grnDetailsVO.map((row) => {
        // Find matching part to ensure correct description and SKU
        const matchingPart = partNoList.find(part => part.partNo === row.partNo);
        
        return {
          id: row.id,
          qrCode: row.qrCode || "",
          lr_Hawb_Hbl_No: row.lrNoHawbNo || "",
          invNo: row.invoiceNo || "",
          shipmentNo: row.shipmentNo || "",
          invDate: formatDateForInput(row.invoiceDate),
          partNo: row.partNo || "",
          partDesc: matchingPart ? matchingPart.description : row.partDesc || "",
          sku: matchingPart ? (matchingPart.sku || matchingPart.partNo) : row.sku || "",
          invQty: row.invQty?.toString() || "0",
          recQty: row.recQty?.toString() || "0",
          damageQty: row.damageQty?.toString() || "0",
          grnQty: row.grnQty?.toString() || "0",
          subStockQty: row.subStockQty?.toString() || "0",
          batch_PalletNo: row.batchNo || "",
          batchDate: formatDateForInput(row.batchDate),
          expDate: formatDateForInput(row.expDate),
          shortQty: row.shortQty?.toString() || "0",
          palletQty: row.binQty?.toString() || "",
          noOfPallets: row.noOfBins?.toString() || "",
          pkgs: row.pkgs?.toString() || "",
          weight: row.weight?.toString() || "",
          mrp: row.mrp?.toString() || "",
          amt: row.amt?.toString() || "",
          batchQty: 0,
          rate: 0,
          binType: "abc",
          remarks: row.remarks || "",
        };
      });

      console.log("Setting GRN table data with parts:", tableData.length, "rows");
      setLrTableData(tableData);
    }
  } catch (error) {
    console.error("Error fetching GRN data:", error);
    addToast("Error fetching GRN data", "error");
  }
};

  const handleGatePassIdChange = async (gatePassId) => {
    if (!gatePassId) return;

    setIsLoadingGatePass(true);
    try {
      const selectedGatePass = gatePassIdList.find(gp => gp.docId === gatePassId);

      if (!selectedGatePass || !selectedGatePass.id) {
        addToast("Invalid gate pass selection", "error");
        return;
      }

      setFormData(prev => ({
        ...prev,
        gatePassId: gatePassId,
      }));

      const response = await gatePassInAPI.getGatePassById(selectedGatePass.id);

      if (response.data && response.data.status === true) {
        const gatePassData = response.data.paramObjectsMap.GatePassIn;
        const carrierValue = selectedGatePass.carrier ? selectedGatePass.carrier.toUpperCase() : "";

        setFormData(prev => ({
          ...prev,
          docId: gatePassData.docId || "",
          docDate: formatDateForInput(gatePassData.docdate),
          entrySlNo: gatePassData.entryNo || "",
          date: formatDateForInput(gatePassData.entryDate),
          gatePassDate: formatDateForInput(gatePassData.docdate),
          supplierShortName: gatePassData.supplierShortName || "",
          supplier: gatePassData.supplier || "",
          modeOfShipment: gatePassData.modeOfShipment || "",
          carrier: carrierValue,
          vehicleType: gatePassData.vehicleType || "",
          contact: gatePassData.contact || "",
          driverName: gatePassData.driverName || "",
          securityName: gatePassData.securityName || "",
          vehicleNo: gatePassData.vehicleNo || "",
          goodsDesc: gatePassData.goodsDescription || "",
          lotNo: gatePassData.lotNo || "",
          freeze: gatePassData.freeze || false,
        }));

        // Populate table data
        if (gatePassData.gatePassDetailsVO && gatePassData.gatePassDetailsVO.length > 0) {
          const tableData = gatePassData.gatePassDetailsVO.map((detail, index) => ({
            id: detail.id || Date.now() + index,
            qrCode: "",
            lr_Hawb_Hbl_No: detail.irNoHaw || "",
            invNo: detail.invoiceNo || "",
            invDate: formatDateForInput(detail.invoiceDate),
            partNo: detail.partNo || "",
            partDesc: detail.partDescription || "",
            sku: detail.sku || "",
            invQty: detail.invQty?.toString() || "0",
            recQty: detail.recQty?.toString() || "0",
            shortQty: detail.shortQty?.toString() || "0",
            damageQty: detail.damageQty?.toString() || "0",
            grnQty: detail.grnQty?.toString() || "0",
            batch_PalletNo: detail.batchNo || "",
            batchDate: formatDateForInput(detail.batchDate),
            expDate: formatDateForInput(detail.expDate),
            palletQty: "",
            noOfPallets: "",
            remarks: detail.remarks || "",
          }));
          setLrTableData(tableData);
        }

        if (gatePassData.modeOfShipment) {
          getAllCarriers(gatePassData.modeOfShipment);
        }

        addToast("Gate pass data loaded successfully", "success");
      }
    } catch (error) {
      console.error("Error fetching gate pass details:", error);
      addToast("Failed to load gate pass details", "error");
    } finally {
      setIsLoadingGatePass(false);
    }
  };

  const handleEntryNoChange = async (value) => {
    if (!value) return;

    try {
      setLoadingEntry(true);
      const entryParams = {
        branchCode: loginBranchCode,
        client: loginClient,
        entryNo: value,
        finYear: loginFinYear,
        orgId: orgId,
      };

      const entryResponse = await grnAPI.getEntryNoDetails(entryParams);

      if (entryResponse?.status && entryResponse.paramObjectsMap.entryNoDetails) {
        const entryDetails = entryResponse.paramObjectsMap.entryNoDetails[0];
        const matchingSupplier = supplierList.find(
          supplier => supplier?.supplierShortName?.toUpperCase() === (entryDetails.supplierShortName || "").toUpperCase()
        );

        setFormData(prev => ({
          ...prev,
          supplierShortName: matchingSupplier?.supplierShortName || entryDetails.supplierShortName || "",
          supplier: matchingSupplier?.supplier || entryDetails.supplier || "",
          modeOfShipment: entryDetails.modeOfShipment || "",
          carrier: entryDetails.carrierShortName || "",
        }));

        if (entryDetails.modeOfShipment) {
          getAllCarriers(entryDetails.modeOfShipment);
        }

        const fillResponse = await grnAPI.getEntryNoFillDetails(entryParams);

        if (fillResponse?.status && fillResponse.paramObjectsMap.entryNoFillDetails) {
          const fillDetails = fillResponse.paramObjectsMap.entryNoFillDetails;
          const tableData = fillDetails.map((detail, index) => ({
            id: index + 1,
            qrCode: "",
            lr_Hawb_Hbl_No: detail.irNoHaw || "",
            invNo: detail.invoiceNo || "",
            invDate: formatDateForInput(detail.invoiceDate),
            partNo: detail.partNo || "",
            partDesc: detail.partDesc || "",
            sku: detail.sku || "",
            invQty: detail.invQty?.toString() || "0",
            recQty: detail.recQty?.toString() || "0",
            shortQty: detail.shortQty?.toString() || "0",
            damageQty: detail.damageQty?.toString() || "0",
            grnQty: detail.grnQty?.toString() || "0",
            batch_PalletNo: detail.batchNo || "",
            batchDate: formatDateForInput(detail.batchDate),
            expDate: formatDateForInput(detail.expDate),
            remarks: "",
          }));

          setLrTableData(tableData);
        }
      }
    } catch (error) {
      console.error("Error fetching entry details:", error);
      addToast("Failed to fetch entry details", "error");
    } finally {
      setLoadingEntry(false);
    }
  };

  // Form Handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const updatedValue = type === 'checkbox' ? checked : value.toUpperCase();

    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: "" }));
    }

    setFormData(prev => ({
      ...prev,
      [name]: updatedValue,
    }));

    if (name === "grnType") {
      setFormData(prev => ({
        ...prev,
        gatePassId: "",
      }));
      if (updatedValue === "GATE PASS") {
        getAllGatePassId();
      } else {
        setGatePassIdList([]);
      }
    }
  };

  const handleSelectChange = (name, value) => {
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: "" }));
    }

    if (name === "modeOfShipment") {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        carrier: "",
      }));
      getAllCarriers(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDateChange = (field, date) => {
    const formattedDate = date ? formatDateForInput(date) : "";
    setFormData(prev => ({ ...prev, [field]: formattedDate }));
  };

  // Table Handlers
  const handleTableChange = (id, field, value) => {
    setLrTableData(prevData =>
      prevData.map(row => {
        if (row.id === id) {
          const updatedRow = { ...row, [field]: value };

          // Auto-calculate GRN Qty
          if (["recQty", "shortQty", "damageQty"].includes(field)) {
            const recQty = parseFloat(updatedRow.recQty) || 0;
            const shortQty = parseFloat(updatedRow.shortQty) || 0;
            const damageQty = parseFloat(updatedRow.damageQty) || 0;
            const grnQty = Math.max(0, recQty - (shortQty + damageQty));
            updatedRow.grnQty = grnQty.toString();
          }

          // Auto-calculate Short Qty
          if (["invQty", "recQty"].includes(field)) {
            const invQty = parseFloat(updatedRow.invQty) || 0;
            const recQty = parseFloat(updatedRow.recQty) || 0;
            const shortQty = Math.max(0, invQty - recQty);
            updatedRow.shortQty = shortQty.toString();
          }

          return updatedRow;
        }
        return row;
      })
    );
  };

const handlePartNoChange = (row, value) => {
  console.log("Part No changed:", value);
  const selectedPartNo = partNoList.find(p => p.partNo === value);
  console.log("Selected part:", selectedPartNo);
  
  setLrTableData(prev =>
    prev.map(r =>
      r.id === row.id
        ? {
            ...r,
            partNo: value,
            partDesc: selectedPartNo ? selectedPartNo.description : "",
            sku: selectedPartNo ? (selectedPartNo.sku || selectedPartNo.partNo) : "", // Fallback to partNo if sku is empty
          }
        : r
    )
  );
};

// Debug partNoList
useEffect(() => {
  console.log("partNoList updated:", partNoList);
  if (partNoList.length > 0) {
    console.log("First part in list:", partNoList[0]);
    console.log("Sample part structure:", {
      id: partNoList[0]?.id,
      partNo: partNoList[0]?.partNo,
      description: partNoList[0]?.description,
      sku: partNoList[0]?.sku
    });
  }
}, [partNoList]);

  const handleBinQtyChange = (e, row, index) => {
    const palletQty = e.target.value;
    const recQty = parseFloat(row.recQty) || 0;

    let noOfPallets = "";
    if (palletQty && recQty > 0) {
      noOfPallets = Math.ceil(recQty / palletQty).toString();
    }

    const updatedData = [...lrTableData];
    updatedData[index] = {
      ...updatedData[index],
      palletQty: palletQty,
      noOfPallets: noOfPallets,
    };

    setLrTableData(updatedData);
  };

  const handleAddRow = () => {
    const newRow = {
      id: Date.now(),
      qrCode: "",
      lr_Hawb_Hbl_No: "",
      invNo: "",
      shipmentNo: "",
      invDate: "",
      partNo: "",
      partDesc: "",
      sku: "",
      invQty: "",
      recQty: "",
      shortQty: "",
      damageQty: "",
      grnQty: "",
      subStockQty: "",
      batch_PalletNo: "",
      batchDate: "",
      expDate: "",
      palletQty: "",
      noOfPallets: "",
      pkgs: "",
      weight: "",
      mrp: "",
      amt: "",
      batchQty: 0,
      rate: 0,
      binType: "abc",
      remarks: "",
    };
    setLrTableData([...lrTableData, newRow]);
  };

  const handleDeleteRow = (id) => {
    setLrTableData(lrTableData.filter(row => row.id !== id));
  };

  const handleClear = () => {
    setFormData({
      docId: "",
      docDate: formatDateForInput(new Date()),
      grnType: "GRN",
      entrySlNo: "",
      date: formatDateForInput(new Date()),
      gatePassId: "",
      gatePassDate: "",
      grnDate: formatDateForInput(new Date()),
      customerPo: "",
      vas: false,
      supplierShortName: "",
      supplier: "",
      billOfEntry: "",
      capacity: "",
      modeOfShipment: "",
      carrier: "",
      vesselNo: "",
      hsnNo: "",
      vehicleType: "",
      contact: "",
      sealNo: "",
      lrNo: "",
      driverName: "",
      securityName: "",
      containerNo: "",
      lrDate: formatDateForInput(new Date()),
      goodsDesc: "",
      vehicleNo: "",
      vesselDetails: "",
      lotNo: "",
      destinationFrom: "",
      destinationTo: "",
      noOfPallets: "",
      invoiceNo: "",
      noOfPacks: "",
      totAmt: "",
      totGrnQty: "",
      freeze: false,
      remarks: "",
    });
    setFieldErrors({});
    setLrTableData([]);
    setLrTableErrors([]);
    getNewGrnDocId();
  };

  const convertToAPIDateFormat = (dateString) => {
    if (!dateString) return null;
    try {
      if (dateString.includes("-") && dateString.split("-")[0].length === 4) {
        const parts = dateString.split("-");
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      return dateString;
    } catch (error) {
      return dateString;
    }
  };

  const handleSave = async () => {
    const errors = {};
    if (!formData.grnDate) errors.grnDate = "GRN Date is required";
    if (!formData.billOfEntry) errors.billOfEntry = "E-way Bill is required";
    if (!formData.supplierShortName) errors.supplierShortName = "Supplier Short Name is required";
    if (!formData.modeOfShipment) errors.modeOfShipment = "Mode of Shipment is required";
    if (!formData.carrier) errors.carrier = "Carrier is required";

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const lrVo = lrTableData.map((row) => ({
        ...(editData && { id: row.id }),
        qrCode: row.qrCode || "",
        lrNoHawbNo: row.lr_Hawb_Hbl_No || "",
        invoiceNo: row.invNo || "",
        shipmentNo: row.shipmentNo || "",
        invoiceDate: row.invDate ? convertToAPIDateFormat(row.invDate) : null,
        partNo: row.partNo || "",
        partDesc: row.partDesc || "",
        sku: row.sku || "",
        invQty: parseInt(row.invQty) || 0,
        recQty: parseInt(row.recQty) || 0,
        damageQty: parseInt(row.damageQty) || 0,
        subStockQty: parseInt(row.subStockQty) || 0,
        batchNo: row.batch_PalletNo || "",
        batchDt: row.batchDate ? convertToAPIDateFormat(row.batchDate) : null,
        expdate: row.expDate ? convertToAPIDateFormat(row.expDate) : null,
        binQty: parseInt(row.palletQty) || 0,
        noOfBins: parseInt(row.noOfPallets) || 0,
        pkgs: parseInt(row.pkgs) || 0,
        weight: parseFloat(row.weight) || 0,
        mrp: parseFloat(row.mrp) || 0,
        amount: parseFloat(row.amt) || 0,
        batchQty: 0,
        rate: 0,
        binType: "RACK STORAGE",
        freeze: row.freeze || false,
      }));

      const saveFormData = {
        ...(editData && { id: editData.id }),
        entryNo: formData.entrySlNo || "",
        entryDate: formData.date ? convertToAPIDateFormat(formData.date) : null,
        gatePassId: editData ? gatePassIdEdit : formData.gatePassId || "",
        gatePassDate: formData.gatePassDate ? convertToAPIDateFormat(formData.gatePassDate) : null,
        grnDate: formData.grnDate ? convertToAPIDateFormat(formData.grnDate) : null,
        customerPo: formData.customerPo || "",
        vas: formData.vas || false,
        supplierShortName: formData.supplierShortName || "",
        supplier: formData.supplier || "",
        billOfEnrtyNo: formData.billOfEntry || "",
        modeOfShipment: formData.modeOfShipment || "",
        carrier: formData.carrier || "",
        vesselNo: formData.vesselNo || "",
        hsnNo: formData.hsnNo || "",
        vehicleType: formData.vehicleType || "",
        contact: formData.contact || "",
        sealNo: formData.sealNo || "",
        lrNo: formData.lrNo || "",
        driverName: formData.driverName || "",
        securityName: formData.securityName || "",
        containerNo: formData.containerNo || "",
        lrDate: formData.lrDate ? convertToAPIDateFormat(formData.lrDate) : null,
        goodsDescripition: formData.goodsDesc || "",
        vehicleNo: formData.vehicleNo || "",
        vesselDetails: formData.vesselDetails || "",
        lotNo: formData.lotNo || "",
        destinationFrom: formData.destinationFrom || "",
        destinationTo: formData.destinationTo || "",
        noOfBins: parseInt(formData.noOfPallets) || 0,
        invoiceNo: formData.invoiceNo || "",
        orgId: orgId,
        createdBy: loginUserName,
        grnDetailsDTO: lrVo,
        branch: loginBranch,
        branchCode: loginBranchCode,
        client: loginClient,
        customer: loginCustomer,
        finYear: loginFinYear,
        warehouse: loginWarehouse,
        fifoFlag: "abc",
        vehicleDetails: "abc",
        freeze: false,
      };

      const response = await grnAPI.saveGrn(saveFormData);

      if (response.data && response.data.status === true) {
        addToast(editData ? "GRN Updated Successfully" : "GRN created successfully", "success");
        handleClear();
        onSaveSuccess && onSaveSuccess();
        onBack();
      } else {
        const errorMessage = response.data?.paramObjectsMap?.errorMessage || response.data?.message || "GRN creation failed";
        addToast(errorMessage, "error");
      }
    } catch (error) {
      console.error("Error:", error);
      let errorMessage = "GRN creation failed";
      if (error.response) {
        errorMessage = error.response.data?.message || error.response.data?.paramObjectsMap?.errorMessage || `Server error: ${error.response.status}`;
      } else if (error.request) {
        errorMessage = "Network error - please check your connection";
      }
      addToast(errorMessage, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate total GRN quantity
  useEffect(() => {
    const totalQty = lrTableData.reduce((sum, row) => sum + (parseInt(row.grnQty, 10) || 0), 0);
    setFormData(prev => ({ ...prev, totGrnQty: totalQty }));
  }, [lrTableData]);

  // Custom Input Components
  const FloatingInput = ({ label, name, value, onChange, error, required = false, type = "text", ...props }) => (
    <div className="relative">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
          error ? "border-red-500" : "border-gray-200 dark:border-gray-600"
        }`}
        placeholder=" "
        {...props}
      />
      <label className={`absolute left-3 top-2 text-gray-500 dark:text-gray-400 transition-all duration-200 pointer-events-none peer-focus:top-[-10px] peer-focus:text-xs peer-focus:text-blue-600 peer-focus:dark:text-blue-400 peer-placeholder-shown:top-2 peer-placeholder-shown:text-sm ${
        value ? "top-[-10px] text-xs text-blue-600 dark:text-blue-400" : ""
      } bg-white dark:bg-gray-700 px-1`}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );

  const FloatingSelect = ({ label, name, value, onChange, options, error, required = false, ...props }) => (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className={`w-full px-3 py-2 text-sm border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none ${
          error ? "border-red-500" : "border-gray-200 dark:border-gray-600"
        }`}
        {...props}
      >
        <option value="">Select {label}</option>
        {options?.map((option) => (
          <option key={option.value || option} value={option.value || option}>
            {option.label || option}
          </option>
        ))}
      </select>
      <label className={`absolute left-3 top-2 text-gray-500 dark:text-gray-400 transition-all duration-200 pointer-events-none peer-focus:top-[-10px] peer-focus:text-xs peer-focus:text-blue-600 peer-focus:dark:text-blue-400 ${
        value ? "top-[-10px] text-xs text-blue-600 dark:text-blue-400" : ""
      } bg-white dark:bg-gray-700 px-1`}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );

  const FloatingCheckbox = ({ label, name, checked, onChange, ...props }) => (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
        {...props}
      />
      <label className="text-sm font-medium text-gray-900 dark:text-gray-300">
        {label}
      </label>
    </div>
  );

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {editData ? "Edit GRN" : "Create GRN"}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Create and manage Goods Receipt Notes
            </p>
          </div>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
        >
          <List className="h-4 w-4" />
          List View
        </button>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button 
          onClick={handleClear}
          className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs transition-colors"
        >
          <X className="h-3 w-3" />
          Clear
        </button>
        
        {!formData.freeze && (
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-3 w-3" />
            {isSubmitting ? "Saving..." : (editData ? "Update" : "Save")}
          </button>
        )}
        
        <button
          onClick={() => setUploadOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors"
        >
          <Upload className="h-3 w-3" />
          Upload
        </button>
        
        <button
          onClick={() => {
            const link = document.createElement("a");
            link.href = sampleFile;
            link.download = "sample_GRN.xls";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            addToast("Downloading sample file...", "info");
          }}
          className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
        >
          <Download className="h-3 w-3" />
          Download
        </button>
      </div>

      {/* MAIN CARD */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        {/* TABS NAVIGATION */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-2">
          {['Basic Information', 'Additional Information'].map((tab, index) => (
            <button
              key={tab}
              onClick={() => setActiveTab(index === 0 ? "basic" : "additional")}
              className={`px-3 py-2 rounded-t-md text-xs font-medium transition-colors whitespace-nowrap border-b-2 ${
                activeTab === (index === 0 ? "basic" : "additional")
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* BASIC INFORMATION TAB */}
        {activeTab === "basic" && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <FloatingInput
                label="Document No"
                name="docId"
                value={formData.docId}
                onChange={handleInputChange}
                disabled
              />
              
              <FloatingInput
                label="Document Date"
                name="docDate"
                value={formData.docDate}
                onChange={handleInputChange}
                type="date"
                disabled
              />

              {!editData && (
                <FloatingSelect
                  label="GRN Type"
                  name="grnType"
                  value={formData.grnType}
                  onChange={handleSelectChange}
                  options={[
                    { value: "GATE PASS", label: "GATE PASS" },
                    { value: "GRN", label: "GRN" },
                  ]}
                  disabled={formData.freeze}
                />
              )}

              <FloatingInput
                label="Entry No"
                name="entrySlNo"
                value={formData.entrySlNo}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  setFormData(prev => ({ ...prev, entrySlNo: value }));
                }}
                onBlur={(e) => handleEntryNoChange(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleEntryNoChange(e.target.value);
                  }
                }}
                disabled={formData.freeze}
                error={fieldErrors.entrySlNo}
              />

              <FloatingInput
                label="Entry Date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                type="date"
                disabled={formData.grnType === "GRN" || formData.freeze}
              />

              {editData ? (
                <FloatingInput
                  label="Gate Pass ID"
                  value={gatePassIdEdit}
                  disabled
                />
              ) : (
                <FloatingSelect
                  label="Gate Pass No"
                  name="gatePassId"
                  value={formData.gatePassId}
                  onChange={handleGatePassIdChange}
                  options={gatePassIdList.map(gp => ({ 
                    value: gp.docId, 
                    label: `${gp.docId} - ${gp.supplierShortName}` 
                  }))}
                  disabled={formData.freeze || formData.grnType !== "GATE PASS"}
                  loading={gatePassIdList.length === 0 || isLoadingGatePass}
                />
              )}

              <FloatingInput
                label="Gate Pass Date"
                name="gatePassDate"
                value={formData.gatePassDate}
                onChange={handleInputChange}
                type="date"
                disabled
              />

              <FloatingInput
                label="GRN Date *"
                name="grnDate"
                value={formData.grnDate}
                onChange={handleInputChange}
                type="date"
                error={fieldErrors.grnDate}
                required
              />

              <FloatingInput
                label="Customer PO"
                name="customerPo"
                value={formData.customerPo}
                onChange={handleInputChange}
                disabled={editData || formData.freeze}
              />

              <FloatingSelect
                label="Supplier Short Name *"
                name="supplierShortName"
                value={formData.supplierShortName}
                onChange={handleSelectChange}
                options={supplierList
                  .filter(supplier => supplier && supplier.supplierShortName)
                  .map(row => ({ 
                    value: row.supplierShortName.toUpperCase(), 
                    label: row.supplierShortName.toUpperCase() 
                  }))}
                disabled={editData || formData.freeze}
                error={fieldErrors.supplierShortName}
                required
              />

              <FloatingInput
                label="Supplier"
                name="supplier"
                value={formData.supplier}
                onChange={handleInputChange}
                disabled
              />

              <FloatingInput
                label="E-Way Bill *"
                name="billOfEntry"
                value={formData.billOfEntry}
                onChange={handleInputChange}
                disabled={formData.freeze}
                error={fieldErrors.billOfEntry}
                required
              />

              <FloatingSelect
                label="Mode Of Shipment *"
                name="modeOfShipment"
                value={formData.modeOfShipment}
                onChange={handleSelectChange}
                options={modeOfShipmentList.map(m => ({ 
                  value: m.shipmentMode.toUpperCase(), 
                  label: m.shipmentMode.toUpperCase() 
                }))}
                disabled={editData || formData.freeze}
                error={fieldErrors.modeOfShipment}
                required
              />

              <FloatingSelect
                label="Carrier *"
                name="carrier"
                value={formData.carrier}
                onChange={handleSelectChange}
                options={carrierList.map(c => ({ 
                  value: c.carrier.toUpperCase(), 
                  label: c.carrier.toUpperCase() 
                }))}
                disabled={editData || formData.freeze}
                error={fieldErrors.carrier}
                required
              />

              <FloatingInput
                label="Remarks"
                name="remarks"
                value={formData.remarks}
                onChange={handleInputChange}
                disabled={editData || formData.freeze}
              />
            </div>
          </div>
        )}

        {/* ADDITIONAL INFORMATION TAB */}
        {activeTab === "additional" && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <FloatingInput
                label="Vehicle No"
                name="vehicleNo"
                value={formData.vehicleNo}
                onChange={handleInputChange}
                disabled={formData.freeze}
              />

              <FloatingInput
                label="Contact No"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                type="tel"
                maxLength={10}
                disabled={formData.freeze}
              />

              <FloatingInput
                label="Invoice No"
                name="invoiceNo"
                value={formData.invoiceNo}
                onChange={handleInputChange}
                disabled={formData.freeze}
              />

              <FloatingInput
                label="Seal No"
                name="sealNo"
                value={formData.sealNo}
                onChange={handleInputChange}
                disabled={formData.freeze}
              />

              <FloatingInput
                label="LR No"
                name="lrNo"
                value={formData.lrNo}
                onChange={handleInputChange}
                disabled={formData.freeze}
              />

              <FloatingCheckbox
                label="VAS"
                name="vas"
                checked={formData.vas}
                onChange={handleInputChange}
                disabled={formData.freeze}
              />

              <FloatingInput
                label="Driver Name"
                name="driverName"
                value={formData.driverName}
                onChange={handleInputChange}
                disabled={formData.freeze}
              />

              <FloatingInput
                label="Security Name"
                name="securityName"
                value={formData.securityName}
                onChange={handleInputChange}
                disabled={formData.freeze}
              />

              <FloatingInput
                label="Container No"
                name="containerNo"
                value={formData.containerNo}
                onChange={handleInputChange}
                disabled={formData.freeze}
              />

              <FloatingInput
                label="LR Date"
                name="lrDate"
                value={formData.lrDate}
                onChange={handleInputChange}
                type="date"
                disabled={formData.freeze}
              />

              <FloatingInput
                label="Goods Desc"
                name="goodsDesc"
                value={formData.goodsDesc}
                onChange={handleInputChange}
                disabled={formData.freeze}
              />

              <FloatingInput
                label="Vehicle Type"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleInputChange}
                disabled={formData.freeze}
              />

              <FloatingInput
                label="Vessel Details"
                name="vesselDetails"
                value={formData.vesselDetails}
                onChange={handleInputChange}
                disabled={formData.freeze}
              />

              <FloatingInput
                label="Lot No"
                name="lotNo"
                value={formData.lotNo}
                onChange={handleInputChange}
                disabled={formData.freeze}
              />

              <FloatingInput
                label="Destination From"
                name="destinationFrom"
                value={formData.destinationFrom}
                onChange={handleInputChange}
                disabled={formData.freeze}
              />

              <FloatingInput
                label="Destination To"
                name="destinationTo"
                value={formData.destinationTo}
                onChange={handleInputChange}
                disabled={formData.freeze}
              />

              <FloatingInput
                label="HSN No"
                name="hsnNo"
                value={formData.hsnNo}
                onChange={handleInputChange}
                disabled={formData.freeze}
              />

              <FloatingInput
                label="Capacity"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                disabled={formData.freeze}
              />

              <FloatingInput
                label="Vessel No"
                name="vesselNo"
                value={formData.vesselNo}
                onChange={handleInputChange}
                disabled={formData.freeze}
              />

              <FloatingInput
                label="No of Pallets"
                name="noOfPallets"
                value={formData.noOfPallets}
                onChange={handleInputChange}
                disabled={formData.freeze}
              />
            </div>
          </div>
        )}

        {/* TABLE SECTION */}
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">GRN Details</h3>
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
                {lrTableData.length}
              </span>
            </div>
            
            <div className="flex gap-2">
              {!editData && (
                <>
                  <button
                    onClick={handleAddRow}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    Add Row
                  </button>
                  <button
                    onClick={() => {/* Fill Grid logic */}}
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors"
                  >
                    <Grid className="h-3 w-3" />
                    Fill Grid
                  </button>
                </>
              )}
              <button
                onClick={() => setLrTableData([])}
                className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                Clear Table
              </button>
            </div>
          </div>

            {/* Complete Table */}
  <div className="overflow-x-auto">
    <table className="w-full text-xs">
      <thead className="bg-gray-50 dark:bg-gray-700">
        <tr>
          <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">
            Action
          </th>
          <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-12">
            S.No
          </th>
          <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
            QR Code
          </th>
          <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[180px]">
            LR No/HAWB No/HBL No *
          </th>
          <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
            Inv No *
          </th>
          <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
            Shipment No
          </th>
          <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
            Inv Date
          </th>
          <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[150px]">
            Part No *
          </th>
          <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[200px]">
            Part Desc
          </th>
          <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
            SKU
          </th>
          <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
            Inv QTY *
          </th>
          <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
            Rec QTY
          </th>
          <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
            Short QTY
          </th>
          <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
            Damage QTY
          </th>
          <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
            GRN QTY
          </th>
          <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[150px]">
            Batch/Pallet No *
          </th>
          <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
            Batch Date
          </th>
          <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
            Exp Date
          </th>
          <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[100px]">
            Bin QTY *
          </th>
          <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[120px]">
            No of Bins *
          </th>
          <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[180px]">
            Damage Remarks
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
        {lrTableData.length === 0 ? (
          <tr>
            <td colSpan="21" className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
              No items added. Click "Add Row" to start.
            </td>
          </tr>
        ) : (
          lrTableData.map((row, index) => (
            <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              {/* Action */}
              <td className="px-3 py-2">
                <button
                  onClick={() => handleDeleteRow(row.id)}
                  className="p-1 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-800/60 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </td>

              {/* S.No */}
              <td className="px-3 py-2 font-medium text-gray-900 dark:text-white text-center">
                {index + 1}
              </td>

              {/* QR Code */}
              <td className="px-3 py-2">
                <input
                  type="text"
                  value={row.qrCode}
                  onChange={(e) => handleTableChange(row.id, "qrCode", e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </td>

              {/* LR No/HAWB No/HBL No */}
              <td className="px-3 py-2">
                <input
                  type="text"
                  value={row.lr_Hawb_Hbl_No}
                  onChange={(e) => handleTableChange(row.id, "lr_Hawb_Hbl_No", e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </td>

              {/* Inv No */}
              <td className="px-3 py-2">
                <input
                  type="text"
                  value={row.invNo}
                  onChange={(e) => handleTableChange(row.id, "invNo", e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </td>

              {/* Shipment No */}
              <td className="px-3 py-2">
                <input
                  type="text"
                  value={row.shipmentNo}
                  onChange={(e) => handleTableChange(row.id, "shipmentNo", e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </td>

              {/* Inv Date */}
              <td className="px-3 py-2">
                <input
                  type="date"
                  value={row.invDate || ''}
                  onChange={(e) => handleTableChange(row.id, "invDate", e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </td>

              {/* Part No */}
              <td className="px-3 py-2">
                <select
                  value={row.partNo}
                  onChange={(e) => handlePartNoChange(row, e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Part No</option>
                  {partNoList.map((part) => (
                    <option key={part.id} value={part.partNo}>
                      {part.partNo}
                    </option>
                  ))}
                </select>
              </td>

              {/* Part Desc */}
              <td className="px-3 py-2">
                <input
                  type="text"
                  value={row.partDesc}
                  readOnly
                  className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                />
              </td>

              {/* SKU */}
              <td className="px-3 py-2">
                <input
                  type="text"
                  value={row.sku}
                  readOnly
                  className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                />
              </td>

              {/* Inv QTY */}
              <td className="px-3 py-2">
                <input
                  type="number"
                  value={row.invQty}
                  onChange={(e) => handleTableChange(row.id, "invQty", e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </td>

              {/* Rec QTY */}
              <td className="px-3 py-2">
                <input
                  type="number"
                  value={row.recQty}
                  onChange={(e) => handleTableChange(row.id, "recQty", e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </td>

              {/* Short QTY */}
              <td className="px-3 py-2">
                <input
                  type="number"
                  value={row.shortQty}
                  readOnly
                  className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                />
              </td>

              {/* Damage QTY */}
              <td className="px-3 py-2">
                <input
                  type="number"
                  value={row.damageQty || ""}
                  onChange={(e) => handleTableChange(row.id, "damageQty", e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </td>

              {/* GRN QTY */}
              <td className="px-3 py-2">
                <input
                  type="number"
                  value={row.grnQty}
                  readOnly
                  className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                />
              </td>

              {/* Batch/Pallet No */}
              <td className="px-3 py-2">
                <input
                  type="text"
                  value={row.batch_PalletNo}
                  onChange={(e) => handleTableChange(row.id, "batch_PalletNo", e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </td>

              {/* Batch Date */}
              <td className="px-3 py-2">
                <input
                  type="date"
                  value={row.batchDate || ''}
                  onChange={(e) => handleTableChange(row.id, "batchDate", e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </td>

              {/* Exp Date */}
              <td className="px-3 py-2">
                <input
                  type="date"
                  value={row.expDate || ''}
                  onChange={(e) => handleTableChange(row.id, "expDate", e.target.value)}
                  className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </td>

              {/* Bin QTY */}
              <td className="px-3 py-2">
                <input
                  type="number"
                  value={row.palletQty}
                  onChange={(e) => handleBinQtyChange(e, row, index)}
                  className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </td>

              {/* No of Bins */}
              <td className="px-3 py-2">
                <input
                  type="number"
                  value={row.noOfPallets || ""}
                  readOnly
                  className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-gray-100 dark:bg-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                />
              </td>

              {/* Damage Remarks */}
              <td className="px-3 py-2">
                <select
                  value={row.remarks}
                  onChange={(e) => handleTableChange(row.id, "remarks", e.target.value)}
                  disabled={!row.damageQty || parseInt(row.damageQty) === 0}
                  className="w-full px-2 py-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:dark:bg-gray-600 disabled:cursor-not-allowed"
                >
                  <option value="">Select Option</option>
                  <option value="OPTION 1">OPTION 1</option>
                  <option value="OPTION 2">OPTION 2</option>
                  <option value="OPTION 3">OPTION 3</option>
                </select>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>

          {/* Total GRN Qty */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Total GRN Qty: {formData.totGrnQty}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Upload Dialog */}
      <CommonBulkUpload
        open={uploadOpen}
        handleClose={() => setUploadOpen(false)}
        title="Upload GRN Files"
        uploadText="Upload file"
        downloadText="Sample File"
        onSubmit={handleSave}
        sampleFileDownload={sampleFile}
        handleFileUpload={() => {}}
        apiUrl={`${API_URL}/api/grn/ExcelUploadForGrn?branch=${loginBranch}&branchCode=${loginBranchCode}&client=${loginClient}&createdBy=${loginUserName}&customer=${loginCustomer}&finYear=${loginFinYear}&orgId=${orgId}`}
        screen="GRN"
      />
    </div>
  );
};

export default GrnForm;