# 🔧 API Debug System - DarahConnect Frontend

Sistem debugging yang komprehensif untuk monitoring semua API calls dengan detail data yang dikirim dan diterima.

## ⚙️ Konfigurasi Debug

### Environment Variables
```bash
# .env
REACT_APP_DEBUG_API=true          # Enable/disable API debugging
REACT_APP_DEBUG_VERBOSE=true      # Enable detailed verbose logging
REACT_APP_API_BASE_URL=http://151.106.120.69:8081/api/v1
REACT_APP_API_TIMEOUT=10000
```

### Debug Levels
- **Basic Debug** (`REACT_APP_DEBUG_API=true`): Request/response logging
- **Verbose Debug** (`REACT_APP_DEBUG_VERBOSE=true`): Headers, detailed data structure, performance timing

## 📊 Debug Output Examples

### POST Request Debug
```javascript
// Ketika melakukan POST /create-blood-request
📤 [POST] /create-blood-request - Summary: {
  hasData: true,
  dataKeys: ["user_id", "hospital_id", "event_name", "event_date", "blood_type", "quantity", "urgency_level", "diagnosis"],
  dataSize: 245
}

🔧 [POST] /create-blood-request - Data yang dikirim:
  📦 Raw Data: {"user_id":12,"hospital_id":1,"event_name":"Donor Darah Darurat",...}
  📋 Parsed Data: {user_id: 12, hospital_id: 1, event_name: "Donor Darah Darurat", ...}
  🔍 Data Structure:
    • user_id: number 12
    • hospital_id: number 1
    • event_name: string Donor Darah Darurat
    • event_date: string 2024-05-20T09:00:00Z
    • blood_type: string A+
    • quantity: number 5
    • urgency_level: string High
    • diagnosis: string Pasien operasi jantung membutuhkan donor darah
  📏 Data Size: 245 bytes

📋 [POST] /create-blood-request - Headers:
  • content-type: application/json
  • authorization: [HIDDEN]
  • accept: application/json

📥 [POST] /create-blood-request - Response Detail:
  🔢 Status: 200 OK
  📋 Headers: {content-type: "application/json", server: "nginx/1.18.0", ...}
  📦 Content-Type: application/json
  📄 Response Data: {meta: {code: 200, message: "successfully created"}, data: {...}}
  🔍 Response Structure:
    • meta: object {code: 200, message: "successfully created"}
    • data: object {id: 123, user_id: 12, ...}
  📏 Response Size: 512 bytes

⚡ [POST] /create-blood-request - Duration: 156ms
✅ SUCCESS: Request berhasil
```

### PUT Request Debug
```javascript
// Ketika melakukan PUT /update-profile
🔄 [PUT] /update-profile - Summary: {
  hasData: true,
  dataKeys: ["name", "email", "phone", "address"],
  dataSize: 128
}

🔧 [PUT] /update-profile - Data yang dikirim:
  📦 Raw Data: {"name":"John Doe","email":"john@example.com",...}
  📋 Parsed Data: {name: "John Doe", email: "john@example.com", ...}
  🔍 Data Structure:
    • name: string John Doe
    • email: string john@example.com
    • phone: string 08123456789
    • address: string Jl. Sudirman No. 123
  📏 Data Size: 128 bytes

⚡ [PUT] /update-profile - Duration: 89ms
✅ SUCCESS: Update Berhasil - Data berhasil diproses
```

### DELETE Request Debug
```javascript
// Ketika melakukan DELETE /delete-request/123
🗑️ [DELETE] /delete-request/123 - Menghapus resource

// DELETE dengan data (jika ada)
🗑️ [DELETE] /delete-request/123 - Data yang dikirim:
  📦 Delete Data: {reason: "Sudah tidak diperlukan"}

🐌 [DELETE] /delete-request/123 - Duration: 234ms
✅ SUCCESS: Delete Berhasil - Data berhasil diproses
```

### Error Response Debug
```javascript
// Ketika terjadi error
❌ ERROR: Request gagal: POST /create-blood-request {
  status: 400,
  statusText: "Bad Request",
  data: {meta: {code: 400, message: "Hospital ID is required"}}
}

🐢 [POST] /create-blood-request - Duration: 892ms
❌ ERROR: Create Gagal - Hospital ID is required
```

## 📋 Debug Features

### 1. **Request Data Logging**
- ✅ Raw data (JSON string)
- ✅ Parsed data (JavaScript object)
- ✅ Data structure breakdown (key: type value)
- ✅ Data size in bytes
- ✅ Method-specific summary

### 2. **Headers Debugging**
- ✅ All request headers
- ✅ Sensitive headers hidden ([HIDDEN])
- ✅ Response headers
- ✅ Content-Type detection

### 3. **Performance Monitoring**
- ✅ Request duration timing
- ✅ Performance emojis:
  - ⚡ Fast (< 100ms)
  - 🐌 Medium (100-500ms)  
  - 🐢 Slow (> 500ms)

### 4. **Response Analysis**
- ✅ Status code and message
- ✅ Response headers
- ✅ Response data structure
- ✅ Response size
- ✅ Content-Type parsing

### 5. **Error Handling**
- ✅ Network errors
- ✅ HTTP error codes
- ✅ Backend error messages
- ✅ Timeout errors

## 🎛️ Debug Controls

### Mengaktifkan Debug
```javascript
// Dalam .env
REACT_APP_DEBUG_API=true

// Atau secara programmatic
localStorage.setItem('debug_api', 'true');
```

### Debug Console Groups
Semua debug output menggunakan `console.group()` untuk organizational yang better:

```javascript
▼ 🔧 [POST] /create-blood-request - Data yang dikirim:
  📦 Raw Data: {...}
  📋 Parsed Data: {...}
  🔍 Data Structure:
    • user_id: number 12
    • hospital_id: number 1
  📏 Data Size: 245 bytes

▼ 📋 [POST] /create-blood-request - Headers:
  • content-type: application/json
  • authorization: [HIDDEN]

▼ 📥 [POST] /create-blood-request - Response Detail:
  🔢 Status: 200 OK
  📄 Response Data: {...}
```

## 🛠️ Method-Specific Debugging

### POST/PUT/PATCH Methods
- **Summary**: Data overview dengan keys dan size
- **Raw Data**: JSON string yang dikirim
- **Parsed Data**: JavaScript object
- **Data Structure**: Breakdown setiap field
- **Performance**: Duration timing

### GET Methods  
- **URL parameters** logging
- **Query string** analysis
- **Cache headers** monitoring

### DELETE Methods
- **Resource identification**
- **Additional data** (jika ada)
- **Confirmation** logging

## 🎯 Use Cases

### 1. **Development Debugging**
```javascript
// Debug blood request creation
await createRequestApi.post('/create-blood-request', {
  user_id: 12,
  hospital_id: 1,
  event_name: "Donor Darah Darurat",
  // ... data lainnya
});

// Console output:
// 📤 [POST] /create-blood-request - Summary: {...}
// 🔧 [POST] /create-blood-request - Data yang dikirim: {...}
// 📥 [POST] /create-blood-request - Response Detail: {...}
// ⚡ [POST] /create-blood-request - Duration: 156ms
```

### 2. **API Monitoring**
```javascript
// Monitor semua API calls dengan performance tracking
// Semua request otomatis ter-log dengan detail:
// - Data yang dikirim
// - Headers (sensitive info hidden)  
// - Response structure
// - Performance timing
// - Error handling
```

### 3. **Production Troubleshooting**
```javascript
// Disable debug untuk production
REACT_APP_DEBUG_API=false

// Enable hanya untuk specific issues
REACT_APP_DEBUG_API=true
REACT_APP_DEBUG_VERBOSE=true
```

## 🔒 Security Features

### Sensitive Data Protection
```javascript
// Headers yang di-hide otomatis:
const sensitiveHeaders = ['authorization', 'auth', 'token', 'password'];

// Output:
📋 Headers:
  • content-type: application/json
  • authorization: [HIDDEN]  // ✅ Aman
  • user-agent: Mozilla/5.0...
```

### Data Filtering
```javascript
// Bisa ditambahkan sensitive field filtering:
const sensitiveFields = ['password', 'token', 'secret'];
// Field ini akan di-hide di debug output
```

## 📈 Performance Impact

### Debug Mode Off
- **Impact**: 0% - Tidak ada overhead
- **Production**: Recommended setting

### Debug Mode On
- **Impact**: < 1% - Minimal overhead
- **Development**: Sangat berguna untuk debugging

### Verbose Mode On
- **Impact**: < 3% - Sedikit overhead karena detailed analysis
- **Development**: Untuk deep debugging

## 🎨 Visual Indicators

### Emojis untuk Method Types
- 📤 **POST**: Mengirim data baru
- 🔄 **PUT**: Update data lengkap
- 🔧 **PATCH**: Update data partial
- 🗑️ **DELETE**: Hapus data
- 📥 **Response**: Data yang diterima

### Performance Indicators
- ⚡ **Fast**: < 100ms (Excellent)
- 🐌 **Medium**: 100-500ms (Good)
- 🐢 **Slow**: > 500ms (Needs attention)

### Status Indicators
- ✅ **SUCCESS**: Request berhasil
- ❌ **ERROR**: Request gagal
- ⚠️ **WARNING**: Partial success

## 🔧 Customization

### Custom Debug Levels
```javascript
// Tambah custom debug level
if (API_CONFIG.DEBUG_LEVEL === 'detailed') {
  // Extra detailed logging
}
```

### Custom Formatters
```javascript
// Custom data formatter
const formatSensitiveData = (data) => {
  // Custom formatting logic
};
```

## 📝 Best Practices

### 1. **Development**
- ✅ Enable debug mode
- ✅ Use verbose untuk troubleshooting
- ✅ Monitor performance timings
- ✅ Check data structure validation

### 2. **Production**  
- ✅ Disable debug mode
- ✅ Enable error-only logging
- ✅ Monitor critical endpoints only
- ✅ Use performance monitoring tools

### 3. **Security**
- ✅ Never log sensitive data
- ✅ Hide authentication headers
- ✅ Mask personal information
- ✅ Use secure debug channels

## 🎯 Summary

Sistem debug ini memberikan **visibility penuh** terhadap semua API interactions dengan detail:

1. **📊 Data Analysis**: Structure, size, dan content
2. **🔍 Request Monitoring**: Headers, timing, performance  
3. **📥 Response Tracking**: Status, data, struktur
4. **⚡ Performance Metrics**: Duration dan bottleneck identification
5. **🔒 Security**: Sensitive data protection
6. **🎨 Visual**: Clear emoji indicators dan grouping

**Perfect untuk debugging, monitoring, dan troubleshooting API issues!** 🚀

## 🔐 Automatic Bearer Token Authentication

### Setup Otomatis
Sistem otomatis menambahkan Bearer token ke semua API calls kecuali endpoint public.

### Public Endpoints (Tidak Memerlukan Token)
```javascript
const publicEndpoints = [
  '/register',
  '/login', 
  '/verify-email',
  '/forgot-password',
  '/reset-password'
];
```

### Authentication Debug Output
```javascript
// Endpoint yang memerlukan token
🔐 [POST] /create-blood-request - Auth Token: Bearer [eyJhbGciOiJIUzI1NiIsIn...]

// Public endpoint
🌐 [POST] /register - Public endpoint (tidak memerlukan token)

// Warning jika token tidak ada
⚠️ [GET] /profile - Endpoint memerlukan authentication tapi token tidak ditemukan
```

### Headers Debug Output
```javascript
📋 [POST] /create-blood-request - Headers:
  • content-type: application/json
  • accept: application/json
  • authorization: [HIDDEN]  // ✅ Bearer token otomatis ter-add
```

### Testing Authentication
```javascript
// Set token untuk testing
localStorage.setItem('token', 'your-jwt-token-here');

// Test authenticated endpoint
await postApi('/create-blood-request', bloodRequestData);
// Output: 🔐 [POST] /create-blood-request - Auth Token: Bearer [eyJhbGciOiJIUzI1...]

// Test public endpoint  
await postApi('/login', loginData);
// Output: 🌐 [POST] /login - Public endpoint (tidak memerlukan token)
```

### Token Management
```javascript
// Get current token
const token = localStorage.getItem('token');

// Remove token (logout)
localStorage.removeItem('token');

// Set new token (after login)
localStorage.setItem('token', newToken);
``` 