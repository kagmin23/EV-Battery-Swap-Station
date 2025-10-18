import { SubscriptionService } from '../subscriptionService';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('SubscriptionService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllPlans', () => {
        it('should fetch all subscription plans successfully', async () => {
            const mockPlans = [
                {
                    _id: '1',
                    subcriptionName: 'Basic Plan',
                    price: 299000,
                    period: 'monthly',
                    benefits: ['10 swaps per month'],
                    status: 'active',
                    duration_months: 1,
                    createdAt: '2024-01-01T00:00:00.000Z',
                    updatedAt: '2024-01-01T00:00:00.000Z',
                    __v: 0
                }
            ];

            mockedAxios.create.mockReturnValue({
                get: jest.fn().mockResolvedValue({
                    data: { success: true, data: mockPlans }
                }),
                post: jest.fn(),
                put: jest.fn(),
                delete: jest.fn(),
                interceptors: {
                    request: { use: jest.fn() },
                    response: { use: jest.fn() }
                }
            } as any);

            const result = await SubscriptionService.getAllPlans();

            expect(result).toEqual(mockPlans);
        });

        it('should handle API errors correctly', async () => {
            mockedAxios.create.mockReturnValue({
                get: jest.fn().mockRejectedValue({
                    response: {
                        status: 500,
                        data: { message: 'Internal Server Error' }
                    }
                }),
                post: jest.fn(),
                put: jest.fn(),
                delete: jest.fn(),
                interceptors: {
                    request: { use: jest.fn() },
                    response: { use: jest.fn() }
                }
            } as any);

            await expect(SubscriptionService.getAllPlans()).rejects.toThrow('Internal Server Error: Please try again later');
        });
    });

    describe('createPlan', () => {
        it('should create a new subscription plan successfully', async () => {
            const mockPlan = {
                _id: '1',
                subcriptionName: 'Premium Plan',
                price: 899000,
                period: 'yearly',
                benefits: ['Unlimited swaps'],
                status: 'active',
                duration_months: 12,
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z',
                __v: 0
            };

            mockedAxios.create.mockReturnValue({
                get: jest.fn(),
                post: jest.fn().mockResolvedValue({
                    data: { success: true, data: mockPlan }
                }),
                put: jest.fn(),
                delete: jest.fn(),
                interceptors: {
                    request: { use: jest.fn() },
                    response: { use: jest.fn() }
                }
            } as any);

            const result = await SubscriptionService.createPlan({
                subcriptionName: 'Premium Plan',
                price: 899000,
                period: 'yearly',
                benefits: ['Unlimited swaps']
            });

            expect(result).toEqual(mockPlan);
        });
    });
});
