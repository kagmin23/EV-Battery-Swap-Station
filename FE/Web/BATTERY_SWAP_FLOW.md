# Battery Swap Station - Complete Flow Guide

## 📋 Table of Contents

- [System Overview](#system-overview)
- [Roles & Permissions](#roles--permissions)
- [Complete Swap Flow](#complete-swap-flow)
- [API Endpoints by Role](#api-endpoints-by-role)
- [Data Models](#data-models)
- [Status Reference](#status-reference)

---

## 🎯 System Overview

Battery swap station system cho phép driver đến trạm để đổi pin nhanh chóng thông qua booking trước hoặc walk-in.

### Key Components:

- **Station**: Trạm đổi pin (có nhiều pillars)
- **Pillar**: Trụ chứa pin (mỗi pillar có nhiều slots)
- **Slot**: Vị trí chứa 1 battery (grid 2 rows x 5 columns)
- **Battery**: Pin có thể tháo rời
- **Booking**: Đặt chỗ trước của driver
- **SwapHistory**: Lịch sử giao dịch đổi pin

---

## 👥 Roles & Permissions

### 1. **DRIVER (User)**

- Xem danh sách stations
- Xem danh sách pillars và batteries available
- Tạo booking (chọn station, pillar, battery, thời gian)
- Check-in khi đến trạm
- Thực hiện swap (theo hướng dẫn)
- Xem lịch sử swap của mình

### 2. **STAFF (Nhân viên trạm)**

- Quản lý slot tại trạm được phân công
- Gán/Lấy battery vào/ra slot
- Hỗ trợ driver trong quá trình swap
- Xem trạng thái pillars và slots
- Xử lý old battery (charging, maintenance)

### 3. **ADMIN**

- Full access tất cả stations
- Tạo/Quản lý stations, pillars, slots
- Tạo/Quản lý batteries
- Phân công staff cho stations
- Xem toàn bộ thống kê và lịch sử

---

## 🔄 Complete Swap Flow

### **Phase 1: SETUP (Admin/Staff)**

#### Step 1.1: Admin tạo Station

```http
POST /api/stations
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "stationName": "EV Station District 7",
  "address": "123 Nguyen Van Linh",
  "city": "Ho Chi Minh",
  "district": "District 7",
  "latitude": 10.7404,
  "longitude": 106.7186
}
```

#### Step 1.2: Admin tạo Pillars cho Station

```http
POST /api/battery-swap/pillars
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "stationId": "68f04d1b34bc1cc9639b4445",
  "pillarName": "Pillar A",
  "pillarNumber": 1, // trụ số 1
  "totalSlots": 10 // trụ có 10 slot
}
```

**Note**: Tự động tạo 10 slots (2 rows x 5 columns)

#### Step 1.3: Admin tạo Batteries

```http
POST /api/batteries
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "serial": "BAT-001",
  "model": "LiFePO4-48V-100Ah",
  "soh": 98,
  "status": "full",
  "stationId": "68f04d1b34bc1cc9639b4445",
  "manufacturer": "BYD",
  "capacity_kWh": 4.8,
  "voltage": 48,
  "price": 80000
}
```

#### Step 1.4: Staff gán Battery vào Slot

```http
POST /api/battery-swap/slots/assign-battery
Content-Type: application/json
Authorization: Bearer <staff_token>

{
  "batteryId": "690cd91eaa17d0dddf9b04b1",
  "slotId": "690cd37ffc11f988150b30b7"
}
```

**Result:**

- Slot status: `empty` → `occupied`
- Battery status: `full` → `full` (vẫn full, sẵn sàng cho booking)

---

### **Phase 2: BOOKING (Driver)**

#### Step 2.1: Driver xem danh sách Stations

```http
GET /api/stations
Authorization: Bearer <driver_token>
```

#### Step 2.2: Driver xem Pillars và Batteries available

```http
GET /api/battery-swap/pillars/station/{stationId}
Authorization: Bearer <driver_token>
```

**hoặc xem grid layout:**

```http
GET /api/battery-swap/pillars/{pillarId}/grid?rows=2&columns=5
Authorization: Bearer <driver_token>
```

#### Step 2.3: Driver tạo Booking

```http
POST /api/booking/create
Content-Type: application/json
Authorization: Bearer <driver_token>

{
  "vehicle": "673b1234567890abcdef0002",
  "station": "68f04d1b34bc1cc9639b4445",
  "battery": "690cd91eaa17d0dddf9b04b1",
  "pillar": "690cd37ffc11f988150b30a5",
  "scheduled_time": "2025-11-10T14:00:00Z"
}
```

**Result:**

- Booking status: `confirmed`
- Battery status: `full` → `is-booking`
- Slot status: `occupied` → `reserved`
- Nếu có subscription: Tự động trừ 1 lần swap

---

### **Phase 3: CHECK-IN (Driver đến trạm)**

#### Step 3.1: Driver check-in khi đến trạm

```http
POST /api/booking/arrived
Content-Type: application/json
Authorization: Bearer <driver_token>

{
  "bookingId": "673b1234567890abcdef0004"
}
```

**Result:**

- Booking status: `confirmed` → `arrived`
- Battery status: `is-booking` (không đổi)
- Slot status: `reserved` (không đổi)

---

### **Phase 4: SWAP PROCESS (Driver + hệ thống)**

#### Step 4.1: Initiate Swap

```http
POST /api/battery-swap/swap/initiate
Content-Type: application/json
Authorization: Bearer <driver_token>

{
  "vehicleId": "673b1234567890abcdef0002",
  "bookingId": "673b1234567890abcdef0004"
}
```

**System Actions:**

1. Validate booking (pillar + battery vẫn hợp lệ)
2. Tìm empty slot trong cùng pillar (để bỏ pin cũ)
3. Reserve empty slot (15 phút)
4. Tạo SwapHistory với status: `initiated`

**Response:**

```json
{
  "message": "Swap transaction initiated successfully",
  "swapId": "SWAP-1730880000000-ABC123",
  "instructions": {
    "step1": "Go to pillar Pillar A",
    "step2": "Insert old battery into empty slot number 5",
    "step3": "Take booked battery (BAT-001) from slot number 2",
    "step4": "Confirm completion on app"
  },
  "emptySlot": { "slotNumber": 5 },
  "bookedBattery": { "serial": "BAT-001", "slotNumber": 2 }
}
```

**Status Changes:**

- SwapHistory: `initiated`
- Empty slot: `empty` → `reserved` (for old battery)

---

#### Step 4.2: Insert Old Battery

```http
POST /api/battery-swap/swap/insert-old-battery
Content-Type: application/json
Authorization: Bearer <driver_token>

{
  "swapId": "SWAP-1730880000000-ABC123",
  "oldBatterySerial": "BAT-OLD-USER-001",
  "slotId": "690cd37ffc11f988150b30b8",
  "model": "LiFePO4-48V-100Ah",
  "manufacturer": "BYD",
  "capacity_kWh": 4.8,
  "voltage": 48,
  "price": 80000
}
```

**System Actions:**

1. Tìm hoặc tạo mới old battery
2. Insert old battery vào slot
3. Update SwapHistory với oldBattery info
4. SwapHistory status: `initiated` → `in-progress`

**Status Changes:**

- Old Battery: tạo mới với status `idle`
- Slot (old battery): `reserved` → `occupied`
- SwapHistory: `in-progress`

---

#### Step 4.3: Complete Swap (Driver lấy pin mới)

```http
POST /api/battery-swap/swap/complete
Content-Type: application/json
Authorization: Bearer <driver_token>

{
  "swapId": "SWAP-1730880000000-ABC123"
}
```

**System Actions:**

1. Remove new battery from slot
2. Update old battery: status → `idle`
3. Update new battery: status → `in-use`
4. Update booking: status → `completed`
5. Update SwapHistory: status → `completed`
6. Calculate swap duration

**Status Changes:**

- New Battery: `is-booking` → `in-use` (driver took it)
- Old Battery: status = `idle` (ready for charging)
- Slot (new battery): `reserved` → `empty`
- Slot (old battery): `occupied` (với old battery)
- Booking: `arrived` → `completed`
- SwapHistory: `in-progress` → `completed`

**Response:**

```json
{
  "message": "Battery swap completed successfully!",
  "swapId": "SWAP-1730880000000-ABC123",
  "summary": {
    "oldBattery": "BAT-OLD-USER-001",
    "newBattery": "BAT-001",
    "newBatteryCharge": 100,
    "swapDuration": 180,
    "completedAt": "2025-11-10T14:05:00Z"
  }
}
```

---

### **Phase 5: POST-SWAP (Staff)**

#### Step 5.1: Staff charge old battery

```http
PUT /api/batteries/{batteryId}
Content-Type: application/json
Authorization: Bearer <staff_token>

{
  "status": "charging"
}
```

#### Step 5.2: Sau khi charge xong

```http
PUT /api/batteries/{batteryId}
Content-Type: application/json
Authorization: Bearer <staff_token>

{
  "status": "full",
  "soh": 95
}
```

**Result:**

- Battery ready cho booking tiếp theo

---
