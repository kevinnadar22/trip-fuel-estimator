export const STATES = [
  'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Telangana', 'West Bengal',
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Kerala', 'Madhya Pradesh', 
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 
  'Rajasthan', 'Sikkim', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
  'Puducherry', 'Chandigarh', 'Ladakh', 'Jammu and Kashmir'
] as const;

export const PLATFORMS = ['Uber', 'Ola', 'Rapido', 'Namma Yatri', 'inDrive', 'Other'] as const;
export const VEHICLES = ['Hatchback', 'Sedan', 'SUV', 'Auto Rickshaw', 'Bike'] as const;
export const FUEL_TYPES = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'cng', label: 'CNG' }
] as const;
