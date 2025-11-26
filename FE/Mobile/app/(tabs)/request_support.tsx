import { getAllBookings } from "@/store/booking";
import { completeSupportRequest, createSupportRequest, getAllSupportRequests, SupportRequest, useSupportRequests } from "@/store/support";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RequestSupportScreen = () => {
    const requests = useSupportRequests();
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const [selectedBookingId, setSelectedBookingId] = useState<string>("");
    const [completedBookings, setCompletedBookings] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
    const [confirming, setConfirming] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // ensure store is populated on mount
        getAllSupportRequests();
    }, []);

    useEffect(() => {
        if (showForm) fetchCompletedBookings();
    }, [showForm]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.7,
        });

        if (!result.canceled) {
            const uris = result.assets.map((a: ImagePicker.ImagePickerAsset) => a.uri);
            setImages((prev) => [...prev, ...uris]);
        }
    };

    const fetchCompletedBookings = async () => {
        try {
            const bookings = await getAllBookings();
            const now = new Date();
            const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

            let filtered = (bookings || []).filter((b: any) => {
                if (!b || !b.scheduledTime) return false;
                const sched = new Date(b.scheduledTime);
                return (
                    (b.status === "completed" || String(b.status).toLowerCase() === "completed") &&
                    sched >= threeDaysAgo &&
                    sched <= now
                );
            });

            try {
                const supportReqs = await getAllSupportRequests();
                const inProgressSet = new Set<string>();
                (supportReqs || []).forEach((r: any) => {
                    if (r && r.status === "in-progress" && r.booking) {
                        if (r.booking.bookingId) inProgressSet.add(String(r.booking.bookingId));
                        if (r.booking._id) inProgressSet.add(String(r.booking._id));
                    }
                });

                if (inProgressSet.size > 0) {
                    filtered = filtered.filter((b: any) => {
                        const bid = b.bookingId ?? b._id ?? "";
                        return !inProgressSet.has(String(bid));
                    });
                }
            } catch {
            }

            setCompletedBookings(filtered);
        } catch (err) {
            console.warn("Failed to fetch bookings:", err);
            setCompletedBookings([]);
        }
    };

    const handleSubmit = async (bookingId: string) => {
        if (!title.trim()) {
            Alert.alert("Notification", "Please enter a support request title!");
            return;
        }

        try {
            const response = await createSupportRequest({
                bookingId,
                title,
                description,
                images,
            });

                if (response.success && response.data) {
                Alert.alert("Success", "Your support request has been submitted!");
                setShowForm(false);
                setTitle("");
                setDescription("");
                setImages([]);
                setSelectedBookingId("");
                getAllSupportRequests();
            } else {
                Alert.alert("Error", response.message);
            }
        } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to submit request");
        }
    };

    const statusColors: Record<string, string> = {
        "in-progress": "#6d4aff", // purple
        resolved: "#2ecc71", // green
        completed: "#00bcd4", // teal/blue
        closed: "#7f8c8d", // gray
    };

    const renderForm = () => {
        const completed = completedBookings || [];

        return (
            <View style={styles.card}>
                <Text style={styles.label}>Select Booking <Text style={styles.required}>*</Text></Text>
                {completed.length > 0 ? (
                    <View style={styles.selectBox}>
                        {completed.map((b: any) => {
                            const id = b.bookingId ?? b._id ?? JSON.stringify(b);
                            const stationName = b.stationName ?? b.station?.stationName ?? b.station?.name ?? "Unknown Station";
                            const stationAddress = b.stationAddress ?? b.station?.address ?? "-";
                            const sched = b.scheduledTime ? new Date(b.scheduledTime).toLocaleString() : "-";

                            const batterySource = b.batteryInfo ?? b.battery ?? {};
                            const model = batterySource.model ?? batterySource.Model ?? "Unknown Model";
                            const serial = batterySource.serial ?? batterySource.Serial ?? "";
                            const manufacturer = batterySource.manufacturer ?? batterySource.Manufacturer ?? "";
                            const soh = batterySource.soh ?? batterySource.SOH ?? null;
                            const capacity = batterySource.capacityKWh ?? batterySource.capacity_kWh ?? batterySource.capacity ?? null;
                            const voltage = batterySource.voltage ?? batterySource.Voltage ?? null;

                            const specs: string[] = [];
                            if (manufacturer) specs.push(manufacturer);
                            if (capacity !== null && capacity !== undefined) specs.push(`${capacity} kWh`);
                            if (voltage !== null && voltage !== undefined) specs.push(`${voltage}V`);
                            if (soh !== null && soh !== undefined) specs.push(`SOH ${soh}%`);

                            const batteryInfo = `${model}${serial ? ` (${serial})` : ""}${specs.length ? ` — ${specs.join(" • ")}` : ""}`;

                            return (
                                <TouchableOpacity
                                    key={id}
                                    style={[
                                        styles.selectOptionRow,
                                        selectedBookingId === id && styles.selectOptionActive,
                                    ]}
                                    onPress={() => setSelectedBookingId(id)}
                                >
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.selectStationName}>{stationName}</Text>
                                        <Text style={styles.selectStationAddress}>{stationAddress}</Text>
                                        <View style={{ flexDirection: "column", marginTop: 8, gap: 5 }}>
                                            <Text style={styles.selectSmallText}>Scheduled: {sched}</Text>
                                            <Text style={styles.selectSmallText}>Battery: {batteryInfo}</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ) : (
                    <Text style={{ color: "#fff", marginVertical: 8 }}>No completed bookings available</Text>
                )}

                <Text style={styles.label}>
                    Title <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter issue title..."
                    value={title}
                    onChangeText={setTitle}
                />

                <Text style={styles.label}>Detailed Description</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    multiline
                    numberOfLines={5}
                    placeholder="Please describe the issue..."
                    value={description}
                    onChangeText={setDescription}
                />

                <Text style={styles.label}>Supporting Images</Text>
                <View style={styles.imageContainer}>
                    {images.map((uri, index) => (
                        <Image key={index} source={{ uri }} style={styles.image} />
                    ))}
                    <TouchableOpacity style={styles.imageAdd} onPress={pickImage}>
                        <Text style={styles.imageAddText}>+</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={() => {
                        if (!selectedBookingId) {
                            Alert.alert("Notification", "Please select a booking!");
                            return;
                        }
                        handleSubmit(selectedBookingId);
                    }}
                >
                    <Text style={styles.submitText}>Submit Request</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderRequest = ({ item }: { item: SupportRequest }) => {
        const canView = ["resolved", "closed", "completed"].includes(item.status as string);
        return (
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <View
                        style={[
                            styles.statusBadge,
                            { backgroundColor: statusColors[item.status] || "#6d4aff" },
                        ]}
                    >
                        <Text style={styles.statusText}>{String(item.status).toUpperCase()}</Text>
                    </View>
                </View>
                <Text style={styles.cardDescription}>{item.description}</Text>
                {/* Booking / battery quick info */}
                {item.booking && (
                    <View style={{ marginTop: 8 }}>

                        {/* booking id */}
                        {item.booking?.scheduledTime && (
                            <Text style={styles.selectSmallText}>Booking time: {new Date(item.booking.scheduledTime).toLocaleString()}</Text>
                        )}

                        {/* station name/address if present on booking */}
                        { (((item.booking as any).stationName) || (item.booking as any).station?.stationName || (item.booking as any).station?.name) && (
                            <Text style={styles.selectSmallText}>
                                Station: {(item.booking as any).stationName ?? (item.booking as any).station?.stationName ?? (item.booking as any).station?.name}
                            </Text>
                        ) }

                        {/* battery info */}
                        {item.booking.battery && (
                            (() => {
                                const batterySource: any = item.booking.battery || {};
                                const model = batterySource.model ?? batterySource.Model ?? "Unknown Model";
                                const serial = batterySource.serial ?? batterySource.Serial ?? "";
                                const manufacturer = batterySource.manufacturer ?? batterySource.Manufacturer ?? "";
                                const soh = batterySource.soh ?? batterySource.SOH ?? null;
                                const capacity = batterySource.capacityKWh ?? batterySource.capacity_kWh ?? batterySource.capacity ?? null;
                                const voltage = batterySource.voltage ?? batterySource.Voltage ?? null;

                                const specs: string[] = [];
                                if (manufacturer) specs.push(manufacturer);
                                if (capacity !== null && capacity !== undefined) specs.push(`${capacity} kWh`);
                                if (voltage !== null && voltage !== undefined) specs.push(`${voltage}V`);
                                if (soh !== null && soh !== undefined) specs.push(`SOH ${soh}%`);

                                const batteryInfo = `${model}${serial ? ` (${serial})` : ""}${specs.length ? ` — ${specs.join(" • ")}` : ""}`;

                                return (
                                    <Text style={[styles.selectSmallText, { marginTop: 6 }]}>Battery: {batteryInfo}</Text>
                                );
                            })()
                        )}
                    </View>
                )}
                {item.images.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                        {item.images.map((uri: string, idx: number) => (
                            <Image key={idx} source={{ uri }} style={styles.cardImage} />
                        ))}
                    </ScrollView>
                )}

                {/* Created timestamp always visible; View button shown only for resolvable statuses */}
                <View style={{ marginTop: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View style={{ flex: 1 }}>
                        {item.createdAt ? (
                            <Text style={[styles.selectSmallText]}>Created: {new Date(item.createdAt).toLocaleString()}</Text>
                        ) : (
                            <Text style={[styles.selectSmallText, { opacity: 0.6 }]}>Created: -</Text>
                        )}
                    </View>

                    {canView ? (
                        <TouchableOpacity
                            style={styles.viewButton}
                            onPress={() => {
                                setSelectedRequest(item);
                                setModalVisible(true);
                            }}
                        >
                            <Text style={styles.viewButtonText}>View</Text>
                        </TouchableOpacity>
                    ) : null}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerRow}>
                <TouchableOpacity
                    style={[styles.backRow, { position: "absolute", left: 10, top: 10 }]}
                    onPress={() => router.push("/(tabs)/profile")}
                >
                    <Ionicons name="chevron-back" size={22} color="#bfa8ff" />
                    <Text style={styles.backText}>Profile</Text>
                </TouchableOpacity>
                <Text style={styles.header}>Request Support</Text>
                <TouchableOpacity
                    style={{ position: "absolute", right: 16, top: 10 }}
                    onPress={() => setShowForm((prev) => !prev)}
                >
                    <Ionicons name="add-circle-outline" size={28} color="#6d4aff" />
                </TouchableOpacity>
            </View>

            <FlatList
                data={requests}
                // ensure keys are unique even if server IDs collide by appending the index
                keyExtractor={(item, index) => `${item._id ?? item.booking?.bookingId ?? String(index)}-${index}`}
                renderItem={renderRequest}
                ListHeaderComponent={showForm ? renderForm() : null}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            />

            {/* Details modal for support request */}
            {selectedRequest && (
                <Modal
                    visible={modalVisible}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.modalTitle}>{selectedRequest.title}</Text>
                                    <Text style={styles.modalSubTitle}>{new Date(selectedRequest.createdAt).toLocaleString()}</Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.modalCloseButton}
                                    onPress={() => {
                                        setModalVisible(false);
                                        setSelectedRequest(null);
                                    }}
                                    accessibilityLabel="Close"
                                >
                                    <Ionicons name="close" size={22} color="#fff" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={{ marginTop: 8 }} contentContainerStyle={{ paddingBottom: 24 }}>
                                <View style={styles.sectionContainer}>
                                    <Text style={styles.sectionTitle}>Details</Text>
                                    <Text style={styles.sectionText}>{selectedRequest.description}</Text>
                                    <View style={styles.rowBetween}>
                                        <Text style={styles.metaLabel}>Status</Text>
                                        <Text style={styles.metaValue}>{selectedRequest.status}</Text>
                                    </View>
                                    <View style={styles.rowBetween}>
                                        <Text style={styles.metaLabel}>Scheduled</Text>
                                        <Text style={styles.metaValue}>{new Date(selectedRequest.booking.scheduledTime).toLocaleString()}</Text>
                                    </View>
                                </View>

                                {selectedRequest.images && selectedRequest.images.length > 0 && (
                                    <View style={styles.sectionContainer}>
                                        <Text style={styles.sectionTitle}>Images</Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                                            {selectedRequest.images.map((uri, i) => (
                                                <Image key={i} source={{ uri }} style={styles.cardImage} />
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}

                                {/* Resolved info */}
                                {(selectedRequest.resolvedAt || selectedRequest.resolveNote || selectedRequest.resolvedBy) && (
                                    <View style={styles.sectionContainer}>
                                        <Text style={styles.sectionTitle}>Resolved</Text>
                                        {selectedRequest.resolvedAt && <Text style={styles.sectionText}>At: {new Date(selectedRequest.resolvedAt).toLocaleString()}</Text>}
                                        {selectedRequest.resolvedBy && <Text style={styles.sectionText}>By: {selectedRequest.resolvedBy.fullName ?? selectedRequest.resolvedBy.email}</Text>}
                                        {selectedRequest.resolveNote && <Text style={styles.sectionText}>Note: {selectedRequest.resolveNote}</Text>}
                                    </View>
                                )}

                                {/* Completed info */}
                                {selectedRequest.completedAt && (
                                    <View style={styles.sectionContainer}>
                                        <Text style={styles.sectionTitle}>Completed</Text>
                                        <Text style={styles.sectionText}>At: {new Date(selectedRequest.completedAt).toLocaleString()}</Text>
                                    </View>
                                )}

                                {/* Closed info */}
                                {(selectedRequest.closedAt || selectedRequest.closeNote || selectedRequest.closedBy) && (
                                    <View style={styles.sectionContainer}>
                                        <Text style={styles.sectionTitle}>Closed</Text>
                                        {selectedRequest.closedAt && <Text style={styles.sectionText}>At: {new Date(selectedRequest.closedAt).toLocaleString()}</Text>}
                                        {selectedRequest.closedBy && <Text style={styles.sectionText}>By: {selectedRequest.closedBy.fullName ?? selectedRequest.closedBy.email}</Text>}
                                        {selectedRequest.closeNote && <Text style={styles.sectionText}>Note: {selectedRequest.closeNote}</Text>}
                                    </View>
                                )}
                            </ScrollView>

                            <View style={styles.modalFooter}>
                                {selectedRequest.status === "resolved" && (
                                <TouchableOpacity
                                    style={[styles.submitButton, { flex: 1 }]}
                                    onPress={async () => {
                                        if (!selectedRequest) return;

                                        const id =
                                            selectedRequest._id ??
                                            (selectedRequest as any).id ??
                                            selectedRequest.booking?._id ??
                                            selectedRequest.booking?.bookingId ??
                                            undefined;

                                        if (!id) {
                                            console.warn("Support request confirm attempted with missing id", selectedRequest);
                                            Alert.alert(
                                                "Error",
                                                "Support request id is missing. Please refresh the list and try again. If the problem persists, contact support."
                                            );
                                            return;
                                        }

                                        setConfirming(true);
                                        try {
                                            const res = await completeSupportRequest(String(id));
                                            if (res?.success) {
                                                Alert.alert("Success", "Support request marked as completed.");
                                                setModalVisible(false);
                                                setSelectedRequest(null);
                                                try {
                                                    await getAllSupportRequests();
                                                } catch (e) {
                                                    console.warn("Failed to refresh support requests after complete:", e);
                                                }
                                            } else {
                                                Alert.alert("Error", res?.message || "Failed to update request");
                                            }
                                        } catch (err: any) {
                                            console.warn("API Error completing support request:", err, "selectedRequest:", selectedRequest);
                                            Alert.alert("Error", err?.message || "Failed to complete request");
                                        } finally {
                                            setConfirming(false);
                                        }
                                    }}
                                    disabled={confirming}
                                >
                                    <Text style={styles.submitText}>{confirming ? "Confirming..." : "Confirm Completed"}</Text>
                                </TouchableOpacity>
                            )}
                            </View>
                        </View>
                    </View>
                </Modal>
            )}
        </SafeAreaView>
    );
};

export default RequestSupportScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#120935" },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
        paddingTop: 4,
        paddingHorizontal: 16,
    },
    backRow: { flexDirection: "row", alignItems: "center", gap: 4 },
    backText: { color: "#bfa8ff", fontSize: 16, fontWeight: "600" },
    header: { fontSize: 22, fontWeight: "700", color: "#FFF" },
    card: {
        backgroundColor: "#0b0624",
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
        shadowColor: "#6d4aff",
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#fff",
        flex: 1,
        marginRight: 8,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
    cardDescription: {
        color: "#e0d5ff",
        fontSize: 14,
        marginBottom: 6,
    },
    cardInfo: {
        color: "#bfa8ff",
        fontSize: 12,
        marginBottom: 6,
    },
    cardImage: {
        width: 100,
        height: 100,
        borderRadius: 12,
        marginRight: 10,
        borderWidth: 2,
        borderColor: "#6d4aff",
    },
    imageScroll: { marginTop: 20 },
    label: { fontSize: 14, color: "#bfa8ff", marginBottom: 8, fontWeight: "600" },
    input: {
        backgroundColor: "#2a1f4e",
        borderRadius: 12,
        padding: 16,
        fontSize: 15,
        color: "white",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    textArea: { height: 120, textAlignVertical: "top" },
    imageContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 12 },
    image: { width: 80, height: 80, borderRadius: 12, marginRight: 10, marginBottom: 10, borderWidth: 2, borderColor: "#6d4aff" },
    imageAdd: {
        width: 80,
        height: 80,
        borderRadius: 12,
        backgroundColor: "#2a1f4e",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: "#6d4aff",
        borderStyle: "dashed",
    },
    imageAddText: { fontSize: 28, color: "#6d4aff", fontWeight: "bold" },
    submitButton: {
        backgroundColor: "#6d4aff",
        borderRadius: 12,
        paddingVertical: 16,
        marginTop: 32,
        alignItems: "center",
        shadowColor: "#6d4aff",
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
    },
    submitText: { color: "white", fontSize: 16, fontWeight: "bold" },
    required: { color: "red", fontWeight: "bold" },
    selectBox: {
        backgroundColor: "#2a1f4e",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
        marginBottom: 16,
    },
    selectOption: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 255, 255, 0.1)",
    },
    selectOptionRow: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255, 255, 255, 0.08)",
        flexDirection: "row",
        alignItems: "center",
    },
    selectStationName: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 14,
    },
    selectStationAddress: {
        color: "#d6c7ff",
        fontSize: 12,
        marginTop: 4,
    },
    selectSmallText: {
        color: "#bfa8ff",
        fontSize: 12,
    },
    selectOptionActive: {
        backgroundColor: "#6d4aff",
    },
    selectText: {
        color: "#fff",
    },
    viewButton: {
        backgroundColor: "#6d4aff",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    viewButtonText: {
        color: "#fff",
        fontWeight: "700",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
    },
    modalContent: {
        width: "100%",
        backgroundColor: "#0b0624",
        borderRadius: 12,
        padding: 16,
        maxHeight: "85%",
    },
    modalTitle: { color: "#fff", fontSize: 18, fontWeight: "800", marginBottom: 8 },
    modalDescription: { color: "#e0d5ff", fontSize: 14, marginBottom: 8 },
    modalInfo: { color: "#bfa8ff", fontSize: 13, marginBottom: 4 },
    modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    modalSubTitle: { color: "#bfa8ff", fontSize: 12 },
    modalCloseButton: { padding: 8, marginLeft: 12 },
    sectionContainer: { backgroundColor: "#12062a", padding: 12, borderRadius: 10, marginTop: 12 },
    sectionTitle: { color: "#dcd6ff", fontWeight: "700", marginBottom: 6 },
    sectionText: { color: "#e6def8", fontSize: 13 },
    rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
    metaLabel: { color: "#bfa8ff", fontSize: 12 },
    metaValue: { color: "#fff", fontWeight: "700", fontSize: 12 },
    modalFooter: { marginTop: 12, flexDirection: "row", justifyContent: "flex-end" },
});
