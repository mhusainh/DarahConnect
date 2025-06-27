# API Usage Guide - DarahConnect

Panduan lengkap untuk menggunakan sistem API yang telah disetup di DarahConnect.

## 📋 Daftar Isi

1. [Setup Environment](#setup-environment)
2. [Konfigurasi](#konfigurasi)
3. [Service Functions](#service-functions)
4. [React Hooks](#react-hooks)
5. [React Components](#react-components)
6. [Debug & Logging](#debug--logging)
7. [Contoh Penggunaan](#contoh-penggunaan)
8. [Error Handling](#error-handling)

## 🔧 Setup Environment

### 1. Buat file `.env` di root project:

```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_API_TIMEOUT=10000

# Debug Configuration
REACT_APP_DEBUG_API=true
REACT_APP_DEBUG_VERBOSE=true

# Environment
REACT_APP_ENV=development
```

### 2. Import yang diperlukan:

```typescript
// Import service functions
import { getApi, postApi, putApi, patchApi, deleteApi } from './services/fetchApi';

// Import React hooks
import { useApi, useMultipleApi } from './hooks/useApi';

// Import React components
import AwaitFetchApi from './components/AwaitFetchApi';

// Import config & debug
import { API_CONFIG, debugConsole } from './config/api';
```

## ⚙️ Konfigurasi

File `src/config/api.ts` berisi semua konfigurasi API:

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',  // URL backend
  TIMEOUT: 10000,                         // Timeout request (ms)
  DEBUG: true,                            // Enable debug logs
  DEBUG_VERBOSE: true,                    // Enable verbose logs
  ENV: 'development',                     // Environment
  DEFAULT_HEADERS: {                      // Headers default
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};
```

## 🔌 Service Functions

### Fungsi-fungsi dasar untuk API calls:

```typescript
// GET request
const response = await getApi<UserType[]>('/users');

// POST request
const response = await postApi<UserType>('/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// PUT request
const response = await putApi<UserType>('/users/1', userData);

// PATCH request
const response = await patchApi<UserType>('/users/1', { name: 'Jane' });

// DELETE request
const response = await deleteApi('/users/1');
```

### Response format:

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  status?: number;
}
```

## 🎣 React Hooks

### `useApi` Hook

Hook untuk state management otomatis:

```typescript
const userApi = useApi<User[]>();

// GET request
await userApi.get('/users');

// POST request
await userApi.post('/users', userData);

// State yang tersedia
const { data, loading, error, success } = userApi;
```

### `useMultipleApi` Hook

Hook untuk multiple API calls:

```typescript
const multiApi = useMultipleApi();

const responses = await multiApi.executeMultiple([
  () => getApi('/users'),
  () => getApi('/campaigns'),
  () => getApi('/donations')
]);
```

## 🧩 React Components

### `AwaitFetchApi` Component

Component untuk auto-fetch data:

```typescript
<AwaitFetchApi<User[]>
  endpoint="/users"
  method="GET"
  onSuccess={(data) => console.log('Success:', data)}
  onError={(error) => console.error('Error:', error)}
>
  {({ data, loading, error, success, refetch }) => (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
      {success && data && (
        <div>
          <h3>Users ({data.length})</h3>
          <button onClick={refetch}>Refresh</button>
        </div>
      )}
    </div>
  )}
</AwaitFetchApi>
```

### Props `AwaitFetchApi`:

```typescript
interface AwaitFetchApiProps<T = any> {
  endpoint: string;                        // API endpoint
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: any;                             // Data untuk POST/PUT/PATCH
  options?: RequestOptions;                // Additional options
  autoFetch?: boolean;                    // Auto fetch on mount (default: true)
  onSuccess?: (data: T) => void;          // Success callback
  onError?: (error: string) => void;      // Error callback
  children: (state & { refetch }) => ReactNode;
}
```

## 🐛 Debug & Logging

### Debug Console Functions:

```typescript
// Log biasa
debugConsole.log('Message', data);

// Log error
debugConsole.error('Error message', error);

// Log success
debugConsole.success('Success message', data);

// Log request (otomatis jika DEBUG_VERBOSE=true)
debugConsole.request('GET', '/users', requestData);

// Log response (otomatis jika DEBUG_VERBOSE=true)
debugConsole.response('GET', '/users', responseData);
```

### Format Log Output:

```
🔧 [API DEBUG] Message
❌ [API ERROR] Error message
✅ [API SUCCESS] Success message
📤 [API REQUEST] GET /users
📥 [API RESPONSE] GET /users
```

## 📚 Contoh Penggunaan

### 1. Simple GET Request

```typescript
import { useApi } from './hooks/useApi';

const UsersList = () => {
  const userApi = useApi<User[]>();

  useEffect(() => {
    userApi.get('/users');
  }, []);

  if (userApi.loading) return <div>Loading...</div>;
  if (userApi.error) return <div>Error: {userApi.error}</div>;

  return (
    <div>
      {userApi.data?.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
};
```

### 2. Form Submission

```typescript
const CreateUserForm = () => {
  const userApi = useApi<User>();
  const [formData, setFormData] = useState({ name: '', email: '' });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const response = await userApi.post('/users', formData);
    
    if (response.success) {
      alert('User created successfully!');
      setFormData({ name: '', email: '' });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
        placeholder="Name"
      />
      <input 
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
        placeholder="Email"
      />
      <button type="submit" disabled={userApi.loading}>
        {userApi.loading ? 'Creating...' : 'Create User'}
      </button>
      {userApi.error && <div>Error: {userApi.error}</div>}
    </form>
  );
};
```

### 3. Auto-fetch dengan AwaitFetchApi

```typescript
const UsersPage = () => {
  return (
    <AwaitFetchApi<User[]>
      endpoint="/users"
      onSuccess={(data) => console.log(`Loaded ${data.length} users`)}
    >
      {({ data, loading, error, refetch }) => (
        <div>
          <h2>Users</h2>
          {loading && <div>Loading users...</div>}
          {error && <div>Error: {error}</div>}
          {data && (
            <div>
              <button onClick={refetch}>Refresh</button>
              {data.map(user => (
                <div key={user.id}>{user.name} - {user.email}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </AwaitFetchApi>
  );
};
```

### 4. Custom Headers & Authentication

```typescript
// Tambah Authorization header
const response = await getApi('/protected-route', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Dengan timeout custom
const response = await postApi('/users', userData, {
  timeout: 5000,
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## ⚠️ Error Handling

### Handling Errors:

```typescript
const handleApiCall = async () => {
  const response = await getApi<User[]>('/users');
  
  if (response.success) {
    // Handle success
    console.log('Data:', response.data);
  } else {
    // Handle error
    switch (response.status) {
      case 401:
        // Unauthorized - redirect to login
        window.location.href = '/login';
        break;
      case 404:
        // Not found
        alert('Data not found');
        break;
      case 500:
        // Server error
        alert('Server error occurred');
        break;
      default:
        alert(response.error || 'Unknown error');
    }
  }
};
```

### Network Error Handling:

```typescript
// Timeout errors
if (response.error === 'Request timeout') {
  alert('Request took too long. Please try again.');
}

// Network errors
if (response.status === 0) {
  alert('Network error. Please check your connection.');
}
```

## 🚀 Tips & Best Practices

1. **Gunakan TypeScript interfaces** untuk response data
2. **Set DEBUG=true** saat development untuk melihat request/response
3. **Gunakan useApi hook** untuk state management otomatis
4. **Gunakan AwaitFetchApi** untuk data yang perlu di-fetch saat component mount
5. **Handle errors** dengan proper status code checking
6. **Tambahkan loading states** untuk UX yang lebih baik
7. **Gunakan AbortController** untuk cancel requests jika diperlukan

## 🔒 Security Notes

- Jangan simpan API keys di environment variables yang ter-expose ke browser
- Gunakan HTTPS di production
- Validate semua input data sebelum kirim ke API
- Handle authentication tokens dengan secure

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Author:** DarahConnect Development Team 