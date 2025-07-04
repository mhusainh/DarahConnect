# Hospital Detail Modal Setup Guide

## Overview
Fitur ini menambahkan modal detail rumah sakit dengan integrasi Google Maps untuk menampilkan lokasi rumah sakit secara visual.

## Features Added

### 1. HospitalDetailModal Component
- **Location**: `src/components/HospitalDetailModal.tsx`
- **Features**:
  - Menampilkan informasi lengkap rumah sakit
  - Integrasi Google Maps dengan marker
  - Tombol aksi cepat (Get Directions, Open in Google Maps)
  - Copy to clipboard untuk koordinat dan informasi
  - Responsive design

### 2. Button Integration
- **BloodRequestDetailPage**: Tombol "Lihat Detail Rumah Sakit" di sidebar
- **CampaignsPage**: Tombol "Rumah Sakit" di action buttons campaign card

### 3. Google Maps Integration
- **File**: `src/types/google-maps.d.ts` - TypeScript declarations
- **API**: Google Maps JavaScript API
- **Features**:
  - Interactive map with hospital marker
  - Info window with hospital details
  - Zoom control and map navigation

## Setup Instructions

### 1. Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable Google Maps JavaScript API
4. Create credentials (API Key)
5. Restrict API key to your domain for security

### 2. Environment Variables
Add to your `.env` file:
```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 3. API Key Security
- Restrict API key to specific domains in production
- Enable only required APIs (Maps JavaScript API)
- Monitor API usage in Google Cloud Console

## Usage

### From BloodRequestDetailPage
1. Users can click "Lihat Detail Rumah Sakit" button in sidebar
2. Modal opens showing hospital details and interactive map
3. Users can get directions or open in Google Maps

### From CampaignsPage
1. Users can click "Rumah Sakit" button on campaign cards
2. Same modal functionality as above

## Modal Features

### Information Display
- Hospital name and address
- City and province
- Coordinates (latitude/longitude)
- Copy to clipboard functionality

### Map Features
- Interactive Google Maps
- Hospital marker with custom icon
- Info window with hospital details
- Zoom and pan controls

### Quick Actions
- **Get Directions**: Opens Google Maps with directions
- **Open in Google Maps**: Opens hospital location in Google Maps
- **Copy Coordinates**: Copies lat,lng to clipboard

## Technical Details

### Data Structure
The modal expects a `Hospital` object with:
```typescript
interface Hospital {
  id: number;
  name: string;
  address: string;
  city: string;
  province: string;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
}
```

### Current Implementation
- Uses mock coordinates (-6.2088, 106.8456) for Jakarta
- Parses location string to extract city and province
- Creates hospital object from campaign data

### Future Improvements
1. **Real Hospital Data**: Connect to actual hospital API with real coordinates
2. **Geolocation**: Add user location and distance calculation
3. **Multiple Locations**: Support for hospitals with multiple branches
4. **Street View**: Add Google Street View integration
5. **Hospital Services**: Display available services and departments

## Troubleshooting

### Common Issues

1. **Map not loading**
   - Check Google Maps API key is set correctly
   - Verify API key has Maps JavaScript API enabled
   - Check browser console for API errors

2. **Coordinates not accurate**
   - Current implementation uses mock coordinates
   - Replace with real hospital coordinates from database

3. **Modal not opening**
   - Check if hospital data is available in campaign
   - Verify state management for modal visibility

### Error Handling
- Map loading states with spinner
- Fallback display when Google Maps fails
- Error boundaries for API failures

## Files Modified

### New Files
- `src/components/HospitalDetailModal.tsx`
- `src/types/google-maps.d.ts`
- `HOSPITAL_DETAIL_SETUP.md`

### Modified Files
- `src/pages/BloodRequestDetailPage.tsx`
- `src/pages/CampaignsPage.tsx`

## Dependencies
- Google Maps JavaScript API
- React hooks (useState, useEffect)
- Lucide React icons
- TypeScript support

## Security Considerations
- Restrict Google Maps API key to specific domains
- Monitor API usage to prevent abuse
- Consider rate limiting for API calls
- Validate coordinates data before displaying

---

**Note**: Remember to replace mock coordinates with real hospital data from your backend API for production use. 