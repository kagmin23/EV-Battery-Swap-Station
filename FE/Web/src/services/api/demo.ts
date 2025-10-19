// Demo file để test SubscriptionService
// Chạy file này trong browser console để test API

import { SubscriptionService } from './subscriptionService';

export const testSubscriptionAPI = async () => {
    console.log('🚀 Bắt đầu test Subscription API...');

    try {
        // Test 1: Lấy tất cả gói thuê
        console.log('📋 Test 1: Lấy tất cả gói thuê');
        const plans = await SubscriptionService.getAllPlans();
        console.log('✅ Kết quả:', plans);

        // Test 2: Tạo gói thuê mới
        console.log('➕ Test 2: Tạo gói thuê mới');
        const newPlan = await SubscriptionService.createPlan({
            subcriptionName: 'Gói Demo',
            price: 199000,
            period: 'monthly',
            benefits: ['5 lần đổi pin/tháng', 'Hỗ trợ 24/7'],
            status: 'active',
            duration_months: 1
        });
        console.log('✅ Gói mới được tạo:', newPlan);

        // Test 3: Cập nhật gói thuê
        console.log('✏️ Test 3: Cập nhật gói thuê');
        const updatedPlan = await SubscriptionService.updatePlan(newPlan._id, {
            price: 249000,
            benefits: ['10 lần đổi pin/tháng', 'Hỗ trợ 24/7', 'Ưu tiên cao']
        });
        console.log('✅ Gói đã được cập nhật:', updatedPlan);

        // Test 4: Lấy thống kê
        console.log('📊 Test 4: Lấy thống kê');
        const stats = await SubscriptionService.getPlanStats();
        console.log('✅ Thống kê:', stats);

        // Test 5: Toggle status
        console.log('🔄 Test 5: Toggle status');
        const toggledPlan = await SubscriptionService.togglePlanStatus(newPlan._id);
        console.log('✅ Status đã được thay đổi:', toggledPlan);

        // Test 6: Xóa gói thuê
        console.log('🗑️ Test 6: Xóa gói thuê');
        await SubscriptionService.deletePlan(newPlan._id);
        console.log('✅ Gói đã được xóa');

        console.log('🎉 Tất cả test đã hoàn thành thành công!');

    } catch (error) {
        console.error('❌ Lỗi trong quá trình test:', error);
    }
};

// Test error handling
export const testErrorHandling = async () => {
    console.log('🧪 Test error handling...');

    try {
        // Test với ID không tồn tại
        await SubscriptionService.getPlanById('invalid-id');
    } catch (error) {
        console.log('✅ Lỗi 404 được xử lý đúng:', error.message);
    }

    try {
        // Test với dữ liệu không hợp lệ
        await SubscriptionService.createPlan({
            subcriptionName: '', // Tên rỗng
            price: -100, // Giá âm
        } as any);
    } catch (error) {
        console.log('✅ Lỗi validation được xử lý đúng:', error.message);
    }
};

// Chạy test
// testSubscriptionAPI();
// testErrorHandling();
