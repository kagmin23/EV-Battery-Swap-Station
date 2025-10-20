import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const RequestSupportScreen = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [images, setImages] = useState<string[]>([]);
    const router = useRouter();

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.7,
        });

        if (!result.canceled) {
            const uris = result.assets.map((a) => a.uri);
            setImages((prev) => [...prev, ...uris]);
        }
    };

    const handleSubmit = () => {
        if (!title.trim()) {
            Alert.alert("Notification", "Please enter a support request title!");
            return;
        }

        // call API here
        Alert.alert("Success", "Your support request has been submitted!");
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerRow}>
                <TouchableOpacity style={[styles.backRow, { position: 'absolute', left: 10, top: 10 }]} onPress={() => router.push('/(tabs)/profile')}>
                    <Ionicons name="chevron-back" size={22} color="#bfa8ff" />
                    <Text style={styles.backText}>Profile</Text>
                </TouchableOpacity>
                <Text style={styles.header}>Request Support</Text>
            </View>
            <ScrollView contentContainerStyle={styles.scroll}>

                <View style={styles.card}>
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
                        placeholder="Please describe the issue you're experiencing in detail..."
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
                        onPress={handleSubmit}
                    >
                        <Text style={styles.submitText}>Submit Request</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default RequestSupportScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#120935",
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        paddingTop: 4,
        paddingHorizontal: 16,
    },
    backRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4
    },
    backText: {
        color: '#bfa8ff',
        fontSize: 16,
        fontWeight: '600'
    },
    header: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFF'
    },
    scroll: {
        padding: 16,
        paddingBottom: 100,
    },
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
    },
    label: {
        fontSize: 14,
        color: "#bfa8ff",
        marginBottom: 8,
        marginTop: 16,
        fontWeight: "600",
    },
    input: {
        backgroundColor: "#2a1f4e",
        borderRadius: 12,
        padding: 16,
        fontSize: 15,
        color: "white",
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
    },
    textArea: {
        height: 120,
        textAlignVertical: "top",
    },
    imageContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 12,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 12,
        marginRight: 10,
        marginBottom: 10,
        borderWidth: 2,
        borderColor: "#6d4aff",
    },
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
    imageAddText: {
        fontSize: 28,
        color: "#6d4aff",
        fontWeight: "bold",
    },
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
    submitText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    required: {
        color: "red",
        fontWeight: "bold",
    },
});
