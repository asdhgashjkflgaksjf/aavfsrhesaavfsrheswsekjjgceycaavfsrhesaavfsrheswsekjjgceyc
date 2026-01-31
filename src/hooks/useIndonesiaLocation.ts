import { useState, useEffect } from "react";

interface LocationItem {
  id: string;
  name: string;
}

const BASE_URL = "https://www.emsifa.com/api-wilayah-indonesia/api";

export const useIndonesiaLocation = () => {
  const [provinces, setProvinces] = useState<LocationItem[]>([]);
  const [regencies, setRegencies] = useState<LocationItem[]>([]);
  const [districts, setDistricts] = useState<LocationItem[]>([]);
  const [villages, setVillages] = useState<LocationItem[]>([]);
  
  const [selectedProvince, setSelectedProvince] = useState<string>("");
  const [selectedRegency, setSelectedRegency] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedVillage, setSelectedVillage] = useState<string>("");
  
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingRegencies, setIsLoadingRegencies] = useState(false);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingVillages, setIsLoadingVillages] = useState(false);

  // Fetch provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      setIsLoadingProvinces(true);
      try {
        const response = await fetch(`${BASE_URL}/provinces.json`);
        const data = await response.json();
        setProvinces(data);
      } catch (error) {
        console.error("Failed to fetch provinces:", error);
      } finally {
        setIsLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, []);

  // Fetch regencies when province changes
  useEffect(() => {
    if (!selectedProvince) {
      setRegencies([]);
      setDistricts([]);
      setVillages([]);
      return;
    }

    const fetchRegencies = async () => {
      setIsLoadingRegencies(true);
      setSelectedRegency("");
      setSelectedDistrict("");
      setSelectedVillage("");
      setDistricts([]);
      setVillages([]);
      
      try {
        const response = await fetch(`${BASE_URL}/regencies/${selectedProvince}.json`);
        const data = await response.json();
        setRegencies(data);
      } catch (error) {
        console.error("Failed to fetch regencies:", error);
      } finally {
        setIsLoadingRegencies(false);
      }
    };
    fetchRegencies();
  }, [selectedProvince]);

  // Fetch districts when regency changes
  useEffect(() => {
    if (!selectedRegency) {
      setDistricts([]);
      setVillages([]);
      return;
    }

    const fetchDistricts = async () => {
      setIsLoadingDistricts(true);
      setSelectedDistrict("");
      setSelectedVillage("");
      setVillages([]);
      
      try {
        const response = await fetch(`${BASE_URL}/districts/${selectedRegency}.json`);
        const data = await response.json();
        setDistricts(data);
      } catch (error) {
        console.error("Failed to fetch districts:", error);
      } finally {
        setIsLoadingDistricts(false);
      }
    };
    fetchDistricts();
  }, [selectedRegency]);

  // Fetch villages when district changes
  useEffect(() => {
    if (!selectedDistrict) {
      setVillages([]);
      return;
    }

    const fetchVillages = async () => {
      setIsLoadingVillages(true);
      setSelectedVillage("");
      
      try {
        const response = await fetch(`${BASE_URL}/villages/${selectedDistrict}.json`);
        const data = await response.json();
        setVillages(data);
      } catch (error) {
        console.error("Failed to fetch villages:", error);
      } finally {
        setIsLoadingVillages(false);
      }
    };
    fetchVillages();
  }, [selectedDistrict]);

  const getLocationNames = () => {
    const provinceName = provinces.find(p => p.id === selectedProvince)?.name || "";
    const regencyName = regencies.find(r => r.id === selectedRegency)?.name || "";
    const districtName = districts.find(d => d.id === selectedDistrict)?.name || "";
    const villageName = villages.find(v => v.id === selectedVillage)?.name || "";
    
    return {
      provinceName,
      regencyName,
      districtName,
      villageName,
    };
  };

  const reset = () => {
    setSelectedProvince("");
    setSelectedRegency("");
    setSelectedDistrict("");
    setSelectedVillage("");
    setRegencies([]);
    setDistricts([]);
    setVillages([]);
  };

  return {
    provinces,
    regencies,
    districts,
    villages,
    selectedProvince,
    selectedRegency,
    selectedDistrict,
    selectedVillage,
    setSelectedProvince,
    setSelectedRegency,
    setSelectedDistrict,
    setSelectedVillage,
    isLoadingProvinces,
    isLoadingRegencies,
    isLoadingDistricts,
    isLoadingVillages,
    getLocationNames,
    reset,
  };
};
