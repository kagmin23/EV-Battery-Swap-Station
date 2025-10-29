import { getAllBookings } from "@/store/booking";
import { createSupportRequest, getAllSupportRequests, SupportRequest, useSupportRequests } from "@/store/support";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    Image,
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
    const router = useRouter();

    useEffect(() => {
        // ensure store is populated on mount
        getAllSupportRequests();
    }, []);

    useEffect(() => {
        if (showForm) fetchCompletedBookings();
    }, [showForm]);

    // fetchRequests removed: we use shared store via useSupportRequests()

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
                // ensure latest requests loaded (createSupportRequest also refreshes store on success)
                getAllSupportRequests();
            } else {
                Alert.alert("Error", response.message);
            }
        } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to submit request");
        }
    };

    const statusColors: Record<string, string> = {
        "in-progress": "#6d4aff",
        resolved: "#2ecc71",
        closed: "#7f8c8d",
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

    const renderRequest = ({ item }: { item: SupportRequest }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <View
                    style={[
                        styles.statusBadge,
                        { backgroundColor: statusColors[item.status] || "#6d4aff" },
                    ]}
                >
                    <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
            </View>
            <Text style={styles.cardDescription}>{item.description}</Text>
            <Text style={styles.cardInfo}>
                Scheduled: {new Date(item.booking.scheduledTime).toLocaleString()}
            </Text>
            {item.images.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                    {item.images.map((uri: string, idx: number) => (
                        <Image key={idx} source={{ uri }} style={styles.cardImage} />
                    ))}
                </ScrollView>
            )}
        </View>
    );

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
                keyExtractor={(item, index) => item._id ?? item.booking?.bookingId ?? String(index)}
                renderItem={renderRequest}
                ListHeaderComponent={showForm ? renderForm() : null}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
            />
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
    imageScroll: { marginTop: 8 },
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
});
