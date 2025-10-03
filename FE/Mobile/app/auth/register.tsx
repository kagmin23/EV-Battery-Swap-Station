import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Register() {
	const router = useRouter();
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Register Screen</Text>
			<Text style={styles.subtitle}>Implement form here.</Text>
			<TouchableOpacity onPress={() => router.back()} style={styles.button}>
				<Text style={styles.buttonText}>Back</Text>
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0a0520', padding: 24 },
	title: { fontSize: 28, color: 'white', fontWeight: 'bold', marginBottom: 12 },
	subtitle: { color: '#aaa', marginBottom: 24 },
	button: { backgroundColor: '#6d4aff', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 },
	buttonText: { color: 'white', fontWeight: '600' },
});
