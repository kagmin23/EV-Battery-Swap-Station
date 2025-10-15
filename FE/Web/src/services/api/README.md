# API Services

## Tổng quan
Thư mục này chứa các service API để giao tiếp với backend EV Battery Swap Station. Tất cả services đều sử dụng axios và có xử lý lỗi toàn diện.

## Services có sẵn

### 1. Staff Service (`staffService.ts`)
Quản lý nhân viên trong hệ thống.

**Endpoints:**
- `GET /api/admin/staff` - Lấy danh sách nhân viên
- `POST /api/admin/staff` - Tạo nhân viên mới
- `PUT /api/admin/staff/:id` - Cập nhật nhân viên
- `DELETE /api/admin/staff/:id` - Xóa nhân viên
- `PUT /api/admin/users/:id/status` - Thay đổi trạng thái nhân viên

### 2. Driver Service (`driverService.ts`)
Quản lý tài xế trong hệ thống.

**Endpoints:**
- `GET /api/admin/customers` - Lấy danh sách tài xế (customers với role 'driver')
- `GET /api/admin/customers/:id` - Lấy thông tin tài xế theo ID
- `PUT /api/admin/users/:id/status` - Thay đổi trạng thái tài xế
- `PUT /api/admin/users/:id/role` - Thay đổi vai trò tài xế
- `DELETE /api/admin/users/:id` - Xóa tài xế

## Cấu hình chung

### Base URL
Tất cả services sử dụng base URL: `http://localhost:8001/api`

### Authentication
- Tự động thêm Bearer token vào header từ localStorage
- Tự động redirect về login khi token hết hạn (401)

### Timeout
- Mỗi request có timeout 10 giây

## Xử lý lỗi

Tất cả services đều xử lý các loại lỗi sau:

### HTTP Status Codes
- **400 Bad Request**: Dữ liệu đầu vào không hợp lệ
- **401 Unauthorized**: Token hết hạn hoặc không hợp lệ - tự động redirect login
- **403 Forbidden**: Không có quyền truy cập
- **404 Not Found**: Không tìm thấy resource
- **409 Conflict**: Dữ liệu đã tồn tại (email, phone)
- **500 Server Error**: Lỗi server

### Network Errors
- **ECONNABORTED**: Request timeout
- **NETWORK_ERROR**: Lỗi kết nối mạng
- **No response**: Mất kết nối internet

### Error Messages
Tất cả lỗi đều được chuyển đổi thành message tiếng Việt thân thiện với người dùng.

## Sử dụng trong component

```typescript
import { DriverService } from '@/services/api/driverService';
import { StaffService } from '@/services/api/staffService';

// Trong component
const [data, setData] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

const loadData = async () => {
  try {
    setIsLoading(true);
    setError(null);
    const result = await DriverService.getAllDrivers();
    setData(result);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
  } finally {
    setIsLoading(false);
  }
};
```

## Types

Mỗi service export các types tương ứng:
- `Driver`, `CreateDriverRequest`, `UpdateDriverRequest`, `ChangeStatusRequest`
- `Staff`, `CreateStaffRequest`, `UpdateStaffRequest`, `ChangeStatusRequest`
- `ApiResponse<T>` - Generic response type

## Lưu ý quan trọng

1. **Authentication**: Services tự động xử lý token, không cần thêm thủ công
2. **Error Handling**: Luôn wrap API calls trong try-catch
3. **Loading States**: Luôn hiển thị loading state cho UX tốt hơn
4. **Type Safety**: Sử dụng TypeScript types để đảm bảo type safety
5. **User Feedback**: Hiển thị error messages cho người dùng
6. **Retry Logic**: Có thể implement retry cho network errors nếu cần

## Cấu trúc thư mục

```
src/services/api/
├── README.md           # Tài liệu này
├── staffService.ts     # Staff management service
└── driverService.ts    # Driver management service
```

## Mở rộng

Để thêm service mới:
1. Tạo file service mới theo pattern hiện tại
2. Sử dụng cùng axios instance và error handling
3. Export types tương ứng
4. Cập nhật README này
