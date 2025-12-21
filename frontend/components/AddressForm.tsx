import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Loader } from 'lucide-react';

interface AddressFormProps {
  value: string;
  onChange: (address: string) => void;
  onAddressDetailsChange?: (details: AddressDetails) => void;
  googleMapsApiKey?: string;
}

export interface AddressDetails {
  streetNumber?: string;
  street?: string;
  ward?: string;
  district?: string;
  city?: string;
  fullAddress: string;
  lat?: number;
  lng?: number;
}

declare global {
  interface Window {
    google: any;
    initGoogleMaps: () => void;
  }
}

const AddressForm: React.FC<AddressFormProps> = ({
  value,
  onChange,
  onAddressDetailsChange,
  googleMapsApiKey
}) => {
  const autocompleteInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [addressDetails, setAddressDetails] = useState<AddressDetails>({
    streetNumber: '',
    street: '',
    ward: '',
    district: '',
    city: '',
    fullAddress: value || ''
  });
  const [isLoadingScript, setIsLoadingScript] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showDetailedForm, setShowDetailedForm] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Load Google Maps API script
  useEffect(() => {
    if (!googleMapsApiKey || window.google) {
      setIsLoadingScript(false);
      return;
    }

    const scriptId = 'google-maps-script';
    if (document.getElementById(scriptId)) {
      setIsLoadingScript(false);
      return;
    }

    setIsLoadingScript(true);
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places&language=vi&region=VN`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setIsLoadingScript(false);
      initializeAutocomplete();
    };
    script.onerror = () => {
      setIsLoadingScript(false);
      console.error('Failed to load Google Maps API');
    };
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [googleMapsApiKey]);

  // Initialize autocomplete when Google Maps is loaded (only once)
  useEffect(() => {
    if (window.google && autocompleteInputRef.current && !autocompleteRef.current) {
      initializeAutocomplete();
    }
    // Note: window.google?.maps is stable once loaded, so this effect won't re-run unnecessarily
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [window.google?.maps]);

  const initializeAutocomplete = () => {
    // Prevent duplicate initialization
    if (!window.google || !autocompleteInputRef.current || autocompleteRef.current) return;

    const autocomplete = new window.google.maps.places.Autocomplete(
      autocompleteInputRef.current,
      {
        componentRestrictions: { country: 'vn' },
        fields: ['address_components', 'formatted_address', 'geometry'],
        types: ['address']
      }
    );

    // Add listener only once (listener persists even if component re-renders)
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      
      if (!place.geometry || !place.geometry.location) {
        console.error('No details available for the selected place');
        return;
      }

      const details = parseAddressComponents(place.address_components);
      details.fullAddress = place.formatted_address;
      details.lat = place.geometry.location.lat();
      details.lng = place.geometry.location.lng();

      setAddressDetails(details);
      onChange(place.formatted_address);
      
      if (onAddressDetailsChange) {
        onAddressDetailsChange(details);
      }

      // Update map if shown
      if (showMap && mapRef.current) {
        updateMap(place.geometry.location.lat(), place.geometry.location.lng());
      }
    });

    autocompleteRef.current = autocomplete;
  };

  const parseAddressComponents = (components: any[]): AddressDetails => {
    const details: AddressDetails = {
      streetNumber: '',
      street: '',
      ward: '',
      district: '',
      city: '',
      fullAddress: value || ''
    };

    components.forEach((component) => {
      const type = component.types[0];

      switch (type) {
        case 'street_number':
          details.streetNumber = component.long_name;
          break;
        case 'route':
          details.street = component.long_name;
          break;
        case 'administrative_area_level_3': // Phường/Xã
        case 'sublocality':
          details.ward = component.long_name;
          break;
        case 'administrative_area_level_2': // Quận/Huyện
          details.district = component.long_name;
          break;
        case 'administrative_area_level_1': // Tỉnh/Thành phố
          details.city = component.long_name;
          break;
      }
    });

    return details;
  };

  const updateMap = (lat: number, lng: number) => {
    if (!window.google || !mapRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      });
    } else {
      mapInstanceRef.current.setCenter({ lat, lng });
    }

    if (markerRef.current) {
      markerRef.current.setPosition({ lat, lng });
    } else {
      markerRef.current = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        draggable: true,
        title: 'Địa chỉ giao hàng'
      });

      markerRef.current.addListener('dragend', (e: any) => {
        const newLat = e.latLng.lat();
        const newLng = e.latLng.lng();
        reverseGeocode(newLat, newLng);
      });
    }
  };

  const reverseGeocode = (lat: number, lng: number) => {
    if (!window.google) return;

    const geocoder = new window.google.maps.Geocoder();
    // This API call only happens when user drags marker (user action, not auto/polling)
    geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
      if (status === 'OK' && results[0]) {
        const place = results[0];
        const details = parseAddressComponents(place.address_components);
        details.fullAddress = place.formatted_address;
        details.lat = lat;
        details.lng = lng;

        setAddressDetails(details);
        onChange(place.formatted_address);
        
        if (onAddressDetailsChange) {
          onAddressDetailsChange(details);
        }
      }
    });
  };

  const handleManualInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setAddressDetails(prev => ({ ...prev, fullAddress: newValue }));
  };

  const handleDetailFieldChange = (field: keyof AddressDetails, newValue: string) => {
    setAddressDetails(prev => {
      const updated = { ...prev, [field]: newValue };
      // Reconstruct full address from details
      const parts = [];
      if (updated.streetNumber) parts.push(updated.streetNumber);
      if (updated.street) parts.push(updated.street);
      if (updated.ward) parts.push(updated.ward);
      if (updated.district) parts.push(updated.district);
      if (updated.city) parts.push(updated.city);
      updated.fullAddress = parts.join(', ');
      onChange(updated.fullAddress);
      return updated;
    });
  };

  const toggleMap = () => {
    setShowMap(!showMap);
    if (!showMap && addressDetails.lat && addressDetails.lng) {
      setTimeout(() => {
        updateMap(addressDetails.lat!, addressDetails.lng!);
      }, 100);
    }
  };

  return (
    <div className="space-y-4">
      {/* Main Address Input with Autocomplete */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
          <MapPin className="h-4 w-4 text-brand-cyan" />
          Shipping address <span className="text-red-500">*</span>
        </label>
        
        {isLoadingScript && (
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <Loader className="h-3 w-3 animate-spin" />
            Đang tải bản đồ...
          </div>
        )}

        <input
          ref={autocompleteInputRef}
          type="text"
          className="w-full border rounded-md p-3 text-sm focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none"
          placeholder="Enter address or select from suggestions..."
          value={value}
          onChange={handleManualInputChange}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          {window.google 
            ? '💡 Enter address to see suggestions, or click "Enter detailed address" below to enter each field' 
            : 'Enter detailed address (Street number, Street, Ward, District, City)'}
        </p>
      </div>

      {/* Toggle between simple and detailed form */}
      <button
        type="button"
        onClick={() => setShowDetailedForm(!showDetailedForm)}
        className="text-xs text-brand-cyan hover:text-brand-ocean flex items-center gap-1"
      >
        {showDetailedForm ? '📝 Hide detailed form' : '✏️ Enter detailed address (Street number, Street, Ward, District, City)'}
      </button>

      {/* Detailed Address Form */}
      {showDetailedForm && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200">
          <p className="text-xs font-semibold text-gray-700 mb-3">Nhập địa chỉ chi tiết:</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Số nhà <span className="text-gray-400">(tùy chọn)</span>
              </label>
              <input
                type="text"
                className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none"
                placeholder="VD: 123"
                value={addressDetails.streetNumber || ''}
                onChange={(e) => handleDetailFieldChange('streetNumber', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Đường/Phố <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none"
                placeholder="VD: Trần Đại Nghĩa"
                value={addressDetails.street || ''}
                onChange={(e) => handleDetailFieldChange('street', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Phường/Xã <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none"
                placeholder="VD: Hoà Hải"
                value={addressDetails.ward || ''}
                onChange={(e) => handleDetailFieldChange('ward', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Quận/Huyện <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none"
                placeholder="VD: Ngũ Hành Sơn"
                value={addressDetails.district || ''}
                onChange={(e) => handleDetailFieldChange('district', e.target.value)}
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Tỉnh/Thành phố <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="w-full border rounded-md p-2 text-sm focus:ring-2 focus:ring-brand-cyan focus:border-brand-cyan outline-none"
                placeholder="VD: Đà Nẵng"
                value={addressDetails.city || ''}
                onChange={(e) => handleDetailFieldChange('city', e.target.value)}
                required
              />
            </div>
          </div>
          {addressDetails.fullAddress && (
            <div className="mt-3 p-2 bg-white rounded border border-gray-300">
              <p className="text-xs text-gray-600 mb-1">Địa chỉ đầy đủ:</p>
              <p className="text-sm font-medium text-gray-900">{addressDetails.fullAddress}</p>
            </div>
          )}
        </div>
      )}

      {/* Read-only detailed fields (shown when autocomplete fills them, but detailed form is hidden) */}
      {!showDetailedForm && (addressDetails.street || addressDetails.district || addressDetails.city) && (
        <div className="bg-blue-50 rounded-lg p-4 space-y-3 border border-blue-200">
          <p className="text-xs font-semibold text-blue-800 mb-2">✅ Địa chỉ đã được điền tự động:</p>
          <div className="grid grid-cols-2 gap-3">
            {addressDetails.streetNumber && (
              <div>
                <label className="block text-xs text-blue-700 mb-1">Số nhà</label>
                <input
                  type="text"
                  className="w-full border border-blue-300 rounded-md p-2 text-sm bg-white"
                  value={addressDetails.streetNumber}
                  readOnly
                />
              </div>
            )}
            {addressDetails.street && (
              <div>
                <label className="block text-xs text-blue-700 mb-1">Đường/Phố</label>
                <input
                  type="text"
                  className="w-full border border-blue-300 rounded-md p-2 text-sm bg-white"
                  value={addressDetails.street}
                  readOnly
                />
              </div>
            )}
            {addressDetails.ward && (
              <div>
                <label className="block text-xs text-blue-700 mb-1">Phường/Xã</label>
                <input
                  type="text"
                  className="w-full border border-blue-300 rounded-md p-2 text-sm bg-white"
                  value={addressDetails.ward}
                  readOnly
                />
              </div>
            )}
            {addressDetails.district && (
              <div>
                <label className="block text-xs text-blue-700 mb-1">Quận/Huyện</label>
                <input
                  type="text"
                  className="w-full border border-blue-300 rounded-md p-2 text-sm bg-white"
                  value={addressDetails.district}
                  readOnly
                />
              </div>
            )}
            {addressDetails.city && (
              <div className="col-span-2">
                <label className="block text-xs text-blue-700 mb-1">Tỉnh/Thành phố</label>
                <input
                  type="text"
                  className="w-full border border-blue-300 rounded-md p-2 text-sm bg-white"
                  value={addressDetails.city}
                  readOnly
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map Toggle Button */}
      {window.google && value && (
        <button
          type="button"
          onClick={toggleMap}
          className="text-xs text-brand-cyan hover:text-brand-ocean flex items-center gap-1"
        >
          <MapPin className="h-3 w-3" />
          {showMap ? 'Ẩn bản đồ' : 'Hiển thị bản đồ và chọn vị trí'}
        </button>
      )}

      {/* Map Display */}
      {showMap && (
        <div className="border rounded-lg overflow-hidden">
          <div ref={mapRef} className="w-full h-64 bg-gray-100" />
          <p className="text-xs text-gray-500 p-2 bg-gray-50">
            💡 Kéo marker trên bản đồ để chọn vị trí chính xác
          </p>
        </div>
      )}
    </div>
  );
};

export default AddressForm;

