# API Services

## SubscriptionService

Service để quản lý các gói thuê pin (subscription plans) với đầy đủ error handling và TypeScript support.

### Các tính năng chính:

- ✅ **CRUD Operations**: Tạo, đọc, cập nhật, xóa gói thuê
- ✅ **Error Handling**: Xử lý tất cả các loại lỗi có thể xảy ra
- ✅ **TypeScript Support**: Type safety đầy đủ
- ✅ **Loading States**: Hỗ trợ loading states cho UI
- ✅ **Toast Notifications**: Thông báo thành công/lỗi
- ✅ **Authentication**: Tự động thêm JWT token
- ✅ **Network Error Handling**: Xử lý lỗi mạng và timeout

### Cách sử dụng:

```typescript
import { SubscriptionService } from '@/services/api/subscriptionService';

// Lấy tất cả gói thuê
const plans = await SubscriptionService.getAllPlans();

// Tạo gói thuê mới
const newPlan = await SubscriptionService.createPlan({
  subcriptionName: 'Gói Premium',
  price: 899000,
  period: 'yearly',
  benefits: ['Không giới hạn đổi pin'],
  status: 'active'
});

// Cập nhật gói thuê
const updatedPlan = await SubscriptionService.updatePlan('planId', {
  price: 999000
});

// Xóa gói thuê
await SubscriptionService.deletePlan('planId');
```

### Error Handling:

Service tự động xử lý các loại lỗi sau:

- **400 Bad Request**: Dữ liệu không hợp lệ
- **401 Unauthorized**: Token hết hạn, tự động redirect về login
- **403 Forbidden**: Không có quyền truy cập
- **404 Not Found**: Không tìm thấy resource
- **409 Conflict**: Xung đột dữ liệu
- **422 Validation Error**: Lỗi validation
- **500 Internal Server Error**: Lỗi server
- **Network Error**: Lỗi mạng, timeout

### API Endpoints:

- `GET /api/admin/subscriptions/plans` - Lấy danh sách gói thuê
- `POST /api/admin/subscriptions/plans` - Tạo gói thuê mới
- `PUT /api/admin/subscriptions/plans/:id` - Cập nhật gói thuê
- `DELETE /api/admin/subscriptions/plans/:id` - Xóa gói thuê

### Types:

```typescript
interface SubscriptionPlan {
  _id: string;
  subcriptionName: string;
  price: number;
  period: 'monthly' | 'yearly';
  benefits: string[];
  status: 'active' | 'expired';
  duration_months: number;
  start_date?: string;
  end_date?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
```

### Testing:

Service đã được test với Jest và có thể mock axios để test các trường hợp lỗi.

```bash
npm test subscriptionService.test.ts
```
