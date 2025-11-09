import { getAllBatteryByStationId, useBatteriesInStation } from '@/store/baterry';
import { arriveBooking, cancelBooking, getAllBookings, useBookings } from '@/store/booking';
import type { Feedback } from '@/store/feedback';
import { createFeedbackApi, getAllFeedbacks, getFeedbackByBookingApi } from '@/store/feedback';
import { getAllStationInMap, getNameStationById, useStationInMap } from '@/store/station';
import { createSupportRequest, getAllSupportRequests, useSupportRequests } from '@/store/support';
import { getAllVehicle, getNameVehicleById, useVehicles } from '@/store/vehicle';
import { extractDateAndTime } from '@/utils/dateTime';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, Keyboard, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const getStatusColor = (status: string) => {
    switch (status) {
        case 'booked': return '#4CAF50';
        case 'ready': return '#2196F3';
        case 'cancelled': return '#F44336';
        case 'completed': return '#6C63FF';
        default: return '#999';
    }
};

export default function BookingDetailsScreen() {
    const router = useRouter();
    const { bookingId } = useLocalSearchParams<{ bookingId: string }>();

    const mybookings = useBookings();
    const stationInMap = useStationInMap();
    const vehicles = useVehicles();
    const batteriesInStation = useBatteriesInStation();

    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [isSupportModalVisible, setIsSupportModalVisible] = useState<boolean>(false);
    const [supportTitle, setSupportTitle] = useState<string>('');
    const [supportDescription, setSupportDescription] = useState<string>('');
    const [isSupportSubmitting, setIsSupportSubmitting] = useState<boolean>(false);
    const [supportImages, setSupportImages] = useState<string[]>([]);
    // feedback modal state
    const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState<boolean>(false);
    const [feedbackRating, setFeedbackRating] = useState<number>(5);
    const [feedbackComment, setFeedbackComment] = useState<string>('');
    const [feedbackImages, setFeedbackImages] = useState<string[]>([]);
    const [bookingFeedback, setBookingFeedback] = useState<Feedback | null>(null);

    const handleOpenModal = () => setIsModalVisible(true);
    const handleCloseModal = () => setIsModalVisible(false);

    const handleConfirmBooking = async () => {
        if (!selectedBooking) return;
        try {
            const res = await arriveBooking(selectedBooking.bookingId);
            if (res?.success) {
                setIsModalVisible(false);
                showSuccessToast(res.message || 'Start to swap battery');
                await getAllBookings();
                setSelectedBooking((prev: any) => prev ? { ...prev, status: 'arrived' } : prev);

                // Navigate to battery swap simulation - pillarId is required
                if (selectedBooking.pillarId) {
                    const queryParams = new URLSearchParams({
                        pillarId: selectedBooking.pillarId,
                        vehicleId: selectedBooking.vehicleId,
                        bookingId: selectedBooking.bookingId,
                        ...(selectedBooking.id && { id: selectedBooking.id }) // MongoDB ObjectId (preferred)
                    }).toString();
                    console.log('Navigation to swap:', selectedBooking)
                    router.push(`/driver/battery-swap-simulation?${queryParams}`);
                } else {
                    showErrorToast('Pillar information is missing from this booking');
                }
            } else {
                showErrorToast(res?.message || 'Failed to action booking');
            }
        } catch (err: any) {
            showErrorToast(err?.message || 'Request failed');
        }
    };

    const handleCancelBooking = async () => {
        if (!selectedBooking) return;
        try {
            const res = await cancelBooking(selectedBooking.bookingId);
            if (res?.success) {
                setIsModalVisible(false);
                showSuccessToast(res.message || 'Booking cancelled');
                // Refresh bookings and update local selected booking status
                await getAllBookings();
                setSelectedBooking((prev: any) => prev ? { ...prev, status: 'cancelled' } : prev);
            } else {
                showErrorToast(res?.message || 'Failed to cancel booking');
            }
        } catch (err: any) {
            showErrorToast(err?.message || 'Request failed');
        }
    };

    useFocusEffect(
        useCallback(() => {
            getAllBookings();
            getAllStationInMap();
            getAllVehicle();
            // refresh support requests so we can determine if booking already has an active support
            getAllSupportRequests();
            // refresh feedbacks so we can determine if booking already has feedback
            getAllFeedbacks();
        }, [])
    );

    // Find the selected booking
    useEffect(() => {
        if (bookingId && mybookings.length > 0) {
            const booking = mybookings.find(b => b.bookingId === bookingId);
            setSelectedBooking(booking);
            console.log('booking select', booking)

            // Load battery info for the station
            if (booking?.stationId) {
                getAllBatteryByStationId(booking.stationId);
            }
            // fetch feedback specific to this booking
            (async () => {
                try {
                    const idToUse = booking?.bookingId || (booking as any)?._id;
                    if (idToUse) {
                        const res = await getFeedbackByBookingApi(String(idToUse));
                        if (res && res.data) setBookingFeedback(res.data as Feedback);
                        else setBookingFeedback(null);
                    } else {
                        setBookingFeedback(null);
                    }
                } catch {
                    setBookingFeedback(null);
                }
            })();
        }
    }, [bookingId, mybookings]);

    // Get battery info for the booking
    const getBatteryInfo = useCallback(() => {
        if (!selectedBooking || !batteriesInStation?.batteries) return null;

        // Find battery by ID (assuming booking has batteryId field)
        const battery = batteriesInStation.batteries.find((b: any) => b.id === selectedBooking.batteryId);
        return battery;
    }, [selectedBooking, batteriesInStation]);

    // support requests from store
    const supportRequests = useSupportRequests();

    const bookingHasInProgressSupport = React.useMemo(() => {
        if (!selectedBooking || !supportRequests || supportRequests.length === 0) return false;
        const selBookingId = String(selectedBooking.bookingId || selectedBooking._id || '').trim();
        return supportRequests.some((sr: any) => {
            const b = sr.booking || {};
            const srBookingId = String(b.bookingId || b._id || '').trim();
            const srStatus = String(sr.status || '').toLowerCase();
            // match by bookingId or by internal _id, and check status case-insensitively
            return (srBookingId && selBookingId && srBookingId === selBookingId) && srStatus === 'in-progress';
        });
    }, [selectedBooking, supportRequests]);

    const openSupportModal = () => {
        setSupportTitle('Support request for booking ' + (selectedBooking?.bookingId || ''));
        setSupportDescription('');
        setIsSupportModalVisible(true);
    };

    const openFeedbackModal = () => {
        setFeedbackRating(5);
        setFeedbackComment('');
        setFeedbackImages([]);
        setIsFeedbackModalVisible(true);
    };

    const closeFeedbackModal = () => setIsFeedbackModalVisible(false);

    const closeSupportModal = () => {
        setIsSupportModalVisible(false);
    };

    const handleSubmitSupport = async () => {
        if (!selectedBooking) return;
        if (!supportTitle.trim()) {
            showErrorToast('Please enter a title for the support request');
            return;
        }
        setIsSupportSubmitting(true);
        try {
            const res = await createSupportRequest({ bookingId: selectedBooking.bookingId, title: supportTitle.trim(), description: supportDescription.trim(), images: supportImages });
            if (res?.success) {
                showSuccessToast(res.message || 'Support request created');
                // refresh support requests
                await getAllSupportRequests();
                setIsSupportModalVisible(false);
                setSupportImages([]);
            } else {
                showErrorToast(res?.message || 'Failed to create support request');
            }
        } catch (err: any) {
            showErrorToast(err?.message || 'Request failed');
        } finally {
            setIsSupportSubmitting(false);
        }
    };

    const bookingHasFeedback = React.useMemo(() => {
        return bookingFeedback !== null;
    }, [bookingFeedback]);

    const handleSubmitFeedback = async () => {
        if (!selectedBooking) return;
        if (!feedbackRating || feedbackRating < 1 || feedbackRating > 5) {
            showErrorToast('Please select a rating between 1 and 5');
            return;
        }
        try {
            const bookingIdToSend = selectedBooking.bookingId || selectedBooking._id;
            const res = await createFeedbackApi({ bookingId: bookingIdToSend, rating: feedbackRating, comment: feedbackComment.trim(), images: feedbackImages });
            if (res && res.success) {
                showSuccessToast(res.message || 'Feedback submitted');
                // Refresh global feedback list first
                try {
                    await getAllFeedbacks();
                } catch {
                    // ignore global refresh errors
                }

                // Fetch booking-specific feedback so UI updates immediately and the Feedback button hides
                try {
                    const idToUse = String(bookingIdToSend);
                    const bookingRes = await getFeedbackByBookingApi(idToUse);
                    if (bookingRes && bookingRes.data) {
                        setBookingFeedback(bookingRes.data as Feedback);
                    } else if (res.data) {
                        // fallback to response data if booking-level fetch didn't return
                        setBookingFeedback(res.data as Feedback);
                    }
                } catch {
                    if (res.data) setBookingFeedback(res.data as Feedback);
                }

                setIsFeedbackModalVisible(false);
            } else {
                showErrorToast(res?.message || 'Failed to submit feedback');
            }
        } catch (err: any) {
            showErrorToast(err?.message || 'Request failed');
        }
    };

    if (!selectedBooking) {
        return (
            <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
                <View style={styles.headerRow}>
                    <TouchableOpacity style={styles.backRow} onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={22} color="#bfa8ff" />
                        <Text style={styles.backText}>Profile</Text>
                    </TouchableOpacity>
                    <Text style={styles.header}>Booking Details</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading booking details...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const station = getNameStationById(stationInMap, selectedBooking.stationId);
    const vehicle = getNameVehicleById(vehicles, selectedBooking.vehicleId);
    const battery = getBatteryInfo();
    const dateTime = extractDateAndTime(selectedBooking.scheduledTime);

    return (
        <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
            <View style={styles.headerRow}>
                <TouchableOpacity style={styles.backRow} onPress={() => router.push('/(tabs)/my_booking')}>
                    <Ionicons name="chevron-back" size={22} color="#bfa8ff" />
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
                <Text style={styles.header}>Booking Details</Text>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Station Information */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="business-outline" size={20} color="#6C63FF" />
                        <Text style={styles.cardTitle}>Station Information</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.labelWithIcon}>
                            <Ionicons name="storefront-outline" size={16} color="#9EA0A5" />
                            <Text style={styles.label}>Station Name:</Text>
                        </View>
                        <Text style={styles.value}>{station?.stationName || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.labelWithIcon}>
                            <Ionicons name="location-outline" size={16} color="#9EA0A5" />
                            <Text style={styles.label}>Address:</Text>
                        </View>
                        <Text style={styles.value}>{station?.address || 'N/A'}</Text>
                    </View>
                </View>

                {/* Vehicle Information */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="car-sport-outline" size={20} color="#6C63FF" />
                        <Text style={styles.cardTitle}>Vehicle Information</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.labelWithIcon}>
                            <Ionicons name="car-outline" size={16} color="#9EA0A5" />
                            <Text style={styles.label}>Car Name:</Text>
                        </View>
                        <Text style={styles.value}>{vehicle?.carName || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.labelWithIcon}>
                            <Ionicons name="card-outline" size={16} color="#9EA0A5" />
                            <Text style={styles.label}>License Plate:</Text>
                        </View>
                        <Text style={styles.value}>{vehicle?.licensePlate || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.labelWithIcon}>
                            <Ionicons name="diamond-outline" size={16} color="#9EA0A5" />
                            <Text style={styles.label}>Brand:</Text>
                        </View>
                        <Text style={styles.value}>{vehicle?.brand || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.labelWithIcon}>
                            <Ionicons name="battery-half-outline" size={16} color="#9EA0A5" />
                            <Text style={styles.label}>Battery Model:</Text>
                        </View>
                        <Text style={styles.value}>{vehicle?.batteryModel || 'N/A'}</Text>
                    </View>
                </View>

                {/* Battery Information */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="battery-charging-outline" size={20} color="#6C63FF" />
                        <Text style={styles.cardTitle}>Battery Information</Text>
                    </View>
                    {battery ? (
                        <>
                            <View style={styles.infoRow}>
                                <View style={styles.labelWithIcon}>
                                    <Ionicons name="finger-print-outline" size={16} color="#9EA0A5" />
                                    <Text style={styles.label}>Battery Serial:</Text>
                                </View>
                                <Text style={styles.value}>{battery.serial || 'N/A'}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <View style={styles.labelWithIcon}>
                                    <Ionicons name="cube-outline" size={16} color="#9EA0A5" />
                                    <Text style={styles.label}>Battery Model:</Text>
                                </View>
                                <Text style={styles.value}>{battery.model || 'N/A'}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <View style={styles.labelWithIcon}>
                                    <Ionicons name="business-outline" size={16} color="#9EA0A5" />
                                    <Text style={styles.label}>Manufacturer:</Text>
                                </View>
                                <Text style={styles.value}>{battery.manufacturer || 'N/A'}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <View style={styles.labelWithIcon}>
                                    <Ionicons name="flash-outline" size={16} color="#9EA0A5" />
                                    <Text style={styles.label}>Capacity:</Text>
                                </View>
                                <Text style={styles.value}>{battery.capacityKWh || 'N/A'} kWh</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <View style={styles.labelWithIcon}>
                                    <Ionicons name="thunderstorm-outline" size={16} color="#9EA0A5" />
                                    <Text style={styles.label}>Voltage:</Text>
                                </View>
                                <Text style={styles.value}>{battery.voltage || 'N/A'} V</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <View style={styles.labelWithIcon}>
                                    <Ionicons name="heart-outline" size={16} color="#9EA0A5" />
                                    <Text style={styles.label}>SOH (State of Health):</Text>
                                </View>
                                <Text style={styles.value}>{battery.soh || 'N/A'}%</Text>
                            </View>
                        </>
                    ) : (
                        <View style={styles.noDataContainer}>
                            <Ionicons name="battery-dead-outline" size={32} color="#9EA0A5" />
                            <Text style={styles.noDataText}>Battery information not available</Text>
                        </View>
                    )}
                </View>

                {/* Booking Information */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="receipt-outline" size={20} color="#6C63FF" />
                        <Text style={styles.cardTitle}>Booking Information</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.labelWithIcon}>
                            <Ionicons name="document-text-outline" size={16} color="#9EA0A5" />
                            <Text style={styles.label}>Booking ID:</Text>
                        </View>
                        <Text style={styles.value}>{selectedBooking.bookingId || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.labelWithIcon}>
                            <Ionicons name="calendar-outline" size={16} color="#9EA0A5" />
                            <Text style={styles.label}>Scheduled Date:</Text>
                        </View>
                        <Text style={styles.value}>{dateTime.date || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.labelWithIcon}>
                            <Ionicons name="time-outline" size={16} color="#9EA0A5" />
                            <Text style={styles.label}>Scheduled Time:</Text>
                        </View>
                        <Text style={styles.value}>{dateTime.time || 'N/A'}</Text>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.labelWithIcon}>
                            <Ionicons name="checkmark-circle-outline" size={16} color="#9EA0A5" />
                            <Text style={styles.label}>Status:</Text>
                        </View>
                        <View style={styles.statusContainer}>
                            <Text style={[styles.value, { color: getStatusColor(selectedBooking.status), flexDirection: 'row', alignItems: 'center', textAlign: 'right' }]}>
                                <Ionicons
                                    name={selectedBooking.status === 'arrived' ? 'checkmark-circle' :
                                        selectedBooking.status === 'booked' ? 'time' :
                                            selectedBooking.status === 'cancelled' ? 'close-circle' : 'checkmark-done-circle'}
                                    size={16}
                                    color={getStatusColor(selectedBooking.status)}
                                    style={{ marginRight: 4, marginLeft: 0, top: 1 }}
                                />
                                {selectedBooking.status?.charAt(0).toUpperCase() + selectedBooking.status?.slice(1) || 'N/A'}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.infoRow}>
                        <View style={styles.labelWithIcon}>
                            <Ionicons name="create-outline" size={16} color="#9EA0A5" />
                            <Text style={styles.label}>Created At:</Text>
                        </View>
                        <Text style={styles.value}>{extractDateAndTime(selectedBooking.createdAt).date} - {extractDateAndTime(selectedBooking.createdAt).time}</Text>
                    </View>
                </View>

                {/* Feedback for this booking (if any) */}
                {bookingFeedback && (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#6C63FF" />
                            <Text style={styles.cardTitle}>Feedback</Text>
                        </View>
                        <View style={styles.feedbackCard}>
                            <View style={styles.feedbackHeader}>
                                <Text style={styles.feedbackUser}>{bookingFeedback.user?.fullName || bookingFeedback.user?.email || 'User'}</Text>
                                <View style={styles.feedbackStars}>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Text key={i} style={{ color: i < bookingFeedback.rating ? '#FFD700' : '#9EA0A5', fontSize: 16 }}>{'★'}</Text>
                                    ))}
                                </View>
                            </View>
                            {bookingFeedback.comment ? (
                                <Text style={styles.feedbackComment}>{bookingFeedback.comment}</Text>
                            ) : null}
                            {bookingFeedback.images && bookingFeedback.images.length > 0 && (
                                <View style={styles.feedbackImages}>
                                    {bookingFeedback.images.map((uri, idx) => (
                                        <Image key={idx} source={{ uri }} style={styles.feedbackImage} />
                                    ))}
                                </View>
                            )}
                            <Text
                                style={[
                                    styles.feedbackMeta,
                                    (bookingFeedback.images && bookingFeedback.images.length > 0) ? { marginTop: 10 } : { marginTop: 4 }
                                ]}
                            >
                                {new Date(bookingFeedback.createdAt).toLocaleString()}
                            </Text>
                        </View>
                    </View>
                )}

            </ScrollView>

            {/* Modal for confirming booking */}
            <Modal
                visible={isModalVisible}
                transparent
                animationType="fade"
                onRequestClose={handleCloseModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>

                        {/* ✖️ Close button (newly added) */}
                        <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
                            <Ionicons name="close" size={22} color="#FFF" />
                        </TouchableOpacity>

                        <Text style={styles.modalConfirm}>Arrived Booking!</Text>
                        <Text style={styles.modalMessage}>Confirm you have arrived at the station!</Text>
                        <View style={styles.modalButtonsRow}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelModalButton]}
                                onPress={handleCancelBooking}
                            >
                                <Text style={[styles.modalButtonText, styles.cancelModalButtonText]}>
                                    Cancel Booking
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmModalButton]}
                                onPress={handleConfirmBooking}
                            >
                                <Text style={[styles.modalButtonText, styles.confirmModalButtonText]}>
                                    Confirm Arrival
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Support Request Modal */}
            <Modal
                visible={isSupportModalVisible}
                transparent
                animationType="fade"
                onRequestClose={closeSupportModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <TouchableOpacity style={styles.closeButton} onPress={closeSupportModal}>
                            <Ionicons name="close" size={22} color="#FFF" />
                        </TouchableOpacity>

                        <Text style={styles.modalConfirm}>Create Support Request</Text>

                        <Text style={[styles.label, { marginTop: 8 }]}>Title</Text>
                        <TextInput
                            value={supportTitle}
                            onChangeText={setSupportTitle}
                            placeholder="Short title"
                            placeholderTextColor="#9EA0A5"
                            style={styles.supportInput}
                        />

                        <Text style={[styles.label, { marginTop: 8 }]}>Description (optional)</Text>
                        <TextInput
                            value={supportDescription}
                            onChangeText={setSupportDescription}
                            placeholder="Describe the issue"
                            placeholderTextColor="#9EA0A5"
                            multiline
                            numberOfLines={4}
                            style={[styles.supportInput, { height: 100, textAlignVertical: 'top' }]}
                        />

                        <Text style={[styles.label, { marginTop: 8 }]}>Images (optional)</Text>
                        <View style={styles.supportImageContainer}>
                            {supportImages.map((uri, idx) => (
                                <View key={idx} style={{ position: 'relative' }}>
                                    <TouchableOpacity onPress={() => setSupportImages(prev => prev.filter((p, i) => i !== idx))}>
                                        <View style={styles.supportImage}>
                                            <Image source={{ uri }} style={{ width: '100%', height: '100%', borderRadius: 8 }} />
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            ))}
                            <TouchableOpacity style={styles.supportImageAdd} onPress={async () => {
                                try {
                                    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                                    if (!permission.granted) {
                                        showErrorToast('Permission to access media library denied');
                                        return;
                                    }
                                    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, quality: 0.7 });
                                    if (result.canceled) return;
                                    const uris = (result.assets ?? []).map((a: any) => a.uri).filter(Boolean);
                                    setSupportImages(prev => [...prev, ...uris]);
                                } catch (err: any) {
                                    showErrorToast(err?.message || 'Failed to pick image');
                                }
                            }}>
                                <Text style={styles.supportImageAddText}>+</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.supportImageAdd, { marginLeft: 8 }]} onPress={async () => {
                                try {
                                    const permission = await ImagePicker.requestCameraPermissionsAsync();
                                    if (!permission.granted) {
                                        showErrorToast('Permission to access camera denied');
                                        return;
                                    }
                                    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
                                    if (result.canceled) return;
                                    const uri = (result.assets ?? [])[0]?.uri ?? (result as any).uri;
                                    if (uri) setSupportImages(prev => [...prev, uri]);
                                } catch (err: any) {
                                    showErrorToast(err?.message || 'Failed to take photo');
                                }
                            }}>
                                <Text style={styles.supportImageAddText}>📷</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.modalButtonsRow}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelModalButton]}
                                onPress={closeSupportModal}
                            >
                                <Text style={[styles.modalButtonText, styles.cancelModalButtonText]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmModalButton]}
                                onPress={handleSubmitSupport}
                                disabled={isSupportSubmitting}
                            >
                                <Text style={[styles.modalButtonText, styles.confirmModalButtonText]}>
                                    {isSupportSubmitting ? 'Sending...' : 'Send Request'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Feedback Modal */}
            <Modal
                visible={isFeedbackModalVisible}
                transparent
                animationType="fade"
                onRequestClose={closeFeedbackModal}
            >
                <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                    <View style={styles.modalContainer}>
                        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ width: '100%' }}>
                            <View style={styles.modalContent}>
                                <TouchableOpacity style={styles.closeButton} onPress={closeFeedbackModal}>
                                    <Ionicons name="close" size={22} color="#FFF" />
                                </TouchableOpacity>

                                <Text style={styles.modalConfirm}>Create Feedback</Text>

                                <Text style={[styles.label, { marginTop: 8 }]}>Rating</Text>
                                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                                    {[1, 2, 3, 4, 5].map((n) => (
                                        <TouchableOpacity key={n} onPress={() => setFeedbackRating(n)} style={{ paddingHorizontal: 6 }}>
                                            <Text style={{ color: n <= feedbackRating ? '#FFD700' : '#9EA0A5', fontSize: 20 }}>{'★'}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={[styles.label, { marginTop: 12 }]}>Comment</Text>
                                <TextInput
                                    value={feedbackComment}
                                    onChangeText={setFeedbackComment}
                                    placeholder="Optional comment"
                                    placeholderTextColor="#9EA0A5"
                                    multiline
                                    numberOfLines={4}
                                    blurOnSubmit={true}
                                    returnKeyType="done"
                                    onSubmitEditing={() => Keyboard.dismiss()}
                                    style={[styles.supportInput, { height: 100, textAlignVertical: 'top' }]}
                                />

                                <Text style={[styles.label, { marginTop: 8 }]}>Images (optional)</Text>
                                <View style={styles.supportImageContainer}>
                                    {feedbackImages.map((uri, idx) => (
                                        <View key={idx} style={{ position: 'relative' }}>
                                            <TouchableOpacity onPress={() => setFeedbackImages(prev => prev.filter((p, i) => i !== idx))}>
                                                <View style={styles.supportImage}>
                                                    <Image source={{ uri }} style={{ width: '100%', height: '100%', borderRadius: 8 }} />
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                    <TouchableOpacity style={styles.supportImageAdd} onPress={async () => {
                                        try {
                                            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
                                            if (!permission.granted) {
                                                showErrorToast('Permission to access media library denied');
                                                return;
                                            }
                                            const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, quality: 0.7 });
                                            if (result.canceled) return;
                                            const uris = (result.assets ?? []).map((a: any) => a.uri).filter(Boolean);
                                            setFeedbackImages(prev => [...prev, ...uris]);
                                        } catch (err: any) {
                                            showErrorToast(err?.message || 'Failed to pick image');
                                        }
                                    }}>
                                        <Text style={styles.supportImageAddText}>+</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.supportImageAdd, { marginLeft: 8 }]} onPress={async () => {
                                        try {
                                            const permission = await ImagePicker.requestCameraPermissionsAsync();
                                            if (!permission.granted) {
                                                showErrorToast('Permission to access camera denied');
                                                return;
                                            }
                                            const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
                                            if (result.canceled) return;
                                            const uri = (result.assets ?? [])[0]?.uri ?? (result as any).uri;
                                            if (uri) setFeedbackImages(prev => [...prev, uri]);
                                        } catch (err: any) {
                                            showErrorToast(err?.message || 'Failed to take photo');
                                        }
                                    }}>
                                        <Text style={styles.supportImageAddText}>📷</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.modalButtonsRow}>
                                    <TouchableOpacity style={[styles.modalButton, styles.cancelModalButton]} onPress={closeFeedbackModal}>
                                        <Text style={[styles.modalButtonText, styles.cancelModalButtonText]}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={[styles.modalButton, styles.confirmModalButton]} onPress={() => { Keyboard.dismiss(); handleSubmitFeedback(); }}>
                                        <Text style={[styles.modalButtonText, styles.confirmModalButtonText]}>Send Feedback</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </KeyboardAvoidingView>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {selectedBooking && (
                <View style={styles.bottomBar}>
                    <View style={styles.bottomButtonsRow}>
                        {String(selectedBooking.status || '').toLowerCase() === 'completed' && !bookingHasFeedback && (
                            <TouchableOpacity
                                style={[styles.actionButton, styles.feedbackButton, (!bookingHasFeedback && bookingHasInProgressSupport === undefined) ? {} : {}]}
                                onPress={openFeedbackModal}
                            >
                                <Text style={styles.actionButtonText}>Feedback</Text>
                            </TouchableOpacity>
                        )}

                        {String(selectedBooking.status || '').toLowerCase() === 'completed' && !bookingHasInProgressSupport && (
                            <TouchableOpacity style={[styles.actionButton, styles.supportButton]} onPress={openSupportModal}>
                                <Text style={styles.actionButtonText}>Support Request</Text>
                            </TouchableOpacity>
                        )}

                        {String(selectedBooking.status || '').toLowerCase() === 'booked' && (
                            <TouchableOpacity style={[styles.actionButton, styles.confirmOnlyButton]} onPress={handleOpenModal}>
                                <Text style={styles.actionButtonText}>Arrived station</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0C0121', paddingBottom: 50 },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, paddingHorizontal: 16, paddingTop: 4 },
    backRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    backText: { color: '#bfa8ff', fontSize: 16, fontWeight: '600' },
    header: { fontSize: 22, fontWeight: '700', color: '#FFF', flex: 1, textAlign: 'center' },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 14, paddingVertical: 16, paddingBottom: 32 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#bfa8ff', fontSize: 16 },
    card: {
        backgroundColor: '#1E103E',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    /* Feedback-specific card styles (distinct from regular cards) */
    feedbackCard: {
        backgroundColor: '#251036',
        borderRadius: 12,
        padding: 12,
        marginTop: 6,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(108,99,255,0.12)',
    },
    feedbackHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    feedbackUser: { color: '#FFF', fontWeight: '700', fontSize: 15 },
    feedbackStars: { flexDirection: 'row', alignItems: 'center' },
    feedbackComment: { color: '#DDD', marginTop: 8, textAlign: 'left', fontSize: 14 },
    feedbackImages: { flexDirection: 'row', marginTop: 10, flexWrap: 'wrap' },
    feedbackImage: { width: 90, height: 90, borderRadius: 8, marginRight: 8 },
    feedbackMeta: { color: '#9EA0A5', fontSize: 12, alignSelf: 'flex-end', textAlign: 'right' },
    cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
    cardTitle: { color: '#FFF', fontWeight: '700', fontSize: 16 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    labelWithIcon: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
    label: { color: '#9EA0A5', fontSize: 14 },
    value: { color: '#FFF', fontSize: 14, fontWeight: '500', flex: 2, textAlign: 'right' },
    statusContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 2, justifyContent: 'flex-end' },
    noDataContainer: { alignItems: 'center', paddingVertical: 20, gap: 8 },
    noDataText: { color: '#9EA0A5', fontSize: 14, textAlign: 'center', fontStyle: 'italic' },
    bottomBar: {
        position: 'absolute',
        left: 14,
        right: 14,
        bottom: 25,
        alignItems: 'center',
    },
    confirmButton: {
        backgroundColor: '#6C63FF',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 6,
    },
    supportButton: {
        backgroundColor: '#FF6B6B',
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 20,
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmButtonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
    modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
    modalContent: { backgroundColor: '#1E103E', padding: 20, borderRadius: 12, width: '100%' },
    modalConfirm: { color: '#FFF', fontSize: 20, marginBottom: 16, textAlign: 'left' },
    modalMessage: { color: '#FFF', fontSize: 16, marginBottom: 16, textAlign: 'left' },
    modalButtonsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 20 },
    modalButton: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    modalButtonText: { fontSize: 15, fontWeight: '600' },
    confirmModalButton: { backgroundColor: '#4CAF50' },
    cancelModalButton: { backgroundColor: '#F44336' },
    confirmModalButtonText: { color: '#FFF' },
    cancelModalButtonText: { color: '#FFF' },
    supportInput: {
        backgroundColor: '#120722',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        color: '#FFF',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.04)',
        marginTop: 6,
    },
    supportImageContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, alignItems: 'center' },
    supportImage: { width: 80, height: 80, borderRadius: 8, marginRight: 10, borderWidth: 2, borderColor: '#6C63FF', overflow: 'hidden' },
    supportImageAdd: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: '#2a1f4e',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#6C63FF',
        borderStyle: 'dashed',
    },
    supportImageAddText: { fontSize: 28, color: '#6C63FF', fontWeight: 'bold' },
    bottomButtonsRow: { flexDirection: 'row', gap: 12, width: '100%', justifyContent: 'center' },
    actionButton: {
        flex: 1,
        backgroundColor: '#6C63FF',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    actionButtonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
    feedbackButton: { backgroundColor: '#4CAF50', marginRight: 6 },
    confirmOnlyButton: { backgroundColor: '#6C63FF' },
});
