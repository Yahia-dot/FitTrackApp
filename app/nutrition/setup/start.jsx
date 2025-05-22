import React, { useEffect, useState } from "react";
import {
    View,
    StyleSheet,
    Image,
    SafeAreaView,
    ScrollView,
    Animated,
    Dimensions
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../../hooks/useTheme";
import ThemedView from "../../../components/ThemedView";
import ThemedText from "../../../components/ThemedText";
import ThemedButton from "../../../components/ThemedButton";
import Header from "../../../components/Header";
import Spacer from "../../../components/Spacer";
import { Colors } from "../../../constants/Colors";
import { FontAwesome5 } from "@expo/vector-icons";

const { width, height } = Dimensions.get('window');

export default function Start() {
    const router = useRouter();
    const { theme } = useTheme();
    const [fadeAnim] = useState(new Animated.Value(0));
    const [slideAnim] = useState(new Animated.Value(50));
    const [scaleAnim] = useState(new Animated.Value(0.9));

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 100,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const features = [
        {
            icon: "bullseye",
            title: "Goal-Based Planning",
            description: "Meals tailored to your fitness objectives"
        },
        {
            icon: "clock",
            title: "Save Time",
            description: "No more wondering what to eat next"
        },
        {
            icon: "heart",
            title: "Dietary Preferences",
            description: "Avoid foods you dislike or can't eat"
        }
    ];

    return (
        <ThemedView style={styles.container}>
            <SafeAreaView />
            <Header />

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <Animated.View
                    style={[
                        styles.content,
                        {
                            opacity: fadeAnim,
                            transform: [
                                { scale: scaleAnim },
                                { translateY: slideAnim }
                            ]

                        }
                    ]}
                >
                    {/* Hero Section */}
                    <View style={styles.heroSection}>
                        <View style={[styles.imageContainer, { backgroundColor: theme.uiBackground }]}>
                            <Image
                                source={require("../../../assets/img/meal-setup.png")}
                                style={styles.heroImage}
                                resizeMode="contain"
                            />
                            <View style={[styles.imageOverlay, { backgroundColor: Colors.primary }]}>
                                <FontAwesome5 name="sparkles" size={24} color="#fff" />
                            </View>
                        </View>

                        <View style={styles.titleSection}>
                            <ThemedText variant="title" style={styles.mainTitle}>
                                Let's Fuel Your Fitness
                            </ThemedText>
                            <View style={styles.emojiContainer}>
                                <View style={[styles.emojiCircle, { backgroundColor: Colors.warning }]}>
                                    <ThemedText style={styles.emoji}>🔥</ThemedText>
                                </View>
                            </View>
                        </View>

                        <ThemedText variant="body" style={styles.description}>
                            We'll create a personalized weekly meal plan based on your goals and preferences.
                            It only takes a few minutes to set up!
                        </ThemedText>
                    </View>

                    <Spacer size="large" />

                    {/* Features Section */}
                    <View style={[styles.featuresContainer, { backgroundColor: theme.uiBackground }]}>
                        <View style={styles.featuresHeader}>
                            <ThemedText variant="subtitle" style={styles.featuresTitle}>
                                What You'll Get
                            </ThemedText>
                            <FontAwesome5 name="gift" size={16} color={Colors.primary} />
                        </View>

                        <View style={styles.featuresList}>
                            {features.map((feature, index) => (
                                <View key={index} style={styles.featureItem}>
                                    <View style={[styles.featureIcon, { backgroundColor: Colors.primary }]}>
                                        <FontAwesome5 name={feature.icon} size={16} color="#fff" />
                                    </View>
                                    <View style={styles.featureContent}>
                                        <ThemedText variant="body" style={styles.featureTitle}>
                                            {feature.title}
                                        </ThemedText>
                                        <ThemedText variant="caption" style={styles.featureDescription}>
                                            {feature.description}
                                        </ThemedText>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    <Spacer size="large" />

                    {/* Process Preview */}
                    <View style={[styles.processContainer, { backgroundColor: theme.background }]}>
                        <ThemedText variant="subtitle" style={styles.processTitle}>
                            Quick Setup Process
                        </ThemedText>

                        <View style={styles.processSteps}>
                            {[
                                { step: "1", text: "Choose your fitness goal", icon: "bullseye" },
                                { step: "2", text: "Set meal frequency", icon: "utensils" },
                                { step: "3", text: "List foods to avoid", icon: "ban" },
                                { step: "4", text: "Generate your plan", icon: "magic" }
                            ].map((item, index) => (
                                <View key={index} style={styles.processStep}>
                                    <View style={[styles.stepNumber, { backgroundColor: Colors.primary }]}>
                                        <ThemedText style={styles.stepText}>{item.step}</ThemedText>
                                    </View>
                                    <View style={styles.stepContent}>
                                        <FontAwesome5 name={item.icon} size={14} color={Colors.primary} />
                                        <ThemedText variant="caption" style={styles.stepDescription}>
                                            {item.text}
                                        </ThemedText>
                                    </View>
                                    {index < 3 && <View style={[styles.stepConnector, { backgroundColor: theme.iconColor }]} />}
                                </View>
                            ))}
                        </View>
                    </View>

                    <Spacer size="large" />

                    {/* Action Buttons */}
                    <View style={styles.buttonContainer}>
                        <ThemedButton
                            title="Let's Get Started"
                            onPress={() => router.push("/nutrition/setup/goal")}
                            size="large"
                            style={styles.primaryButton}
                            leftIcon={<FontAwesome5 name="rocket" size={16} color="#fff" />}
                        />

                        <Spacer size="small" />

                        <ThemedButton
                            title="Maybe Later"
                            onPress={() => router.replace("/(dashboard)/nutrition")}
                            variant="outline"
                            style={styles.secondaryButton}
                        />
                    </View>

                    {/* Trust Indicators */}
                    <View style={styles.trustSection}>
                        <View style={styles.trustItem}>
                            <FontAwesome5 name="shield-alt" size={16} color={Colors.primary} />
                            <ThemedText variant="caption" style={styles.trustText}>
                                Your data is secure
                            </ThemedText>
                        </View>
                        <View style={styles.trustItem}>
                            <FontAwesome5 name="clock" size={16} color={Colors.primary} />
                            <ThemedText variant="caption" style={styles.trustText}>
                                Setup takes 2-3 minutes
                            </ThemedText>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    content: {
        alignItems: 'center',
    },
    heroSection: {
        alignItems: 'center',
        marginTop: 20,
    },
    imageContainer: {
        width: 200,
        height: 200,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 8,
    },
    heroImage: {
        width: 160,
        height: 160,
    },
    imageOverlay: {
        position: 'absolute',
        top: 20,
        right: 20,
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    titleSection: {
        alignItems: 'center',
        marginTop: 32,
        marginBottom: 16,
    },
    mainTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    emojiContainer: {
        marginTop: 8,
    },
    emojiCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emoji: {
        fontSize: 20,
    },
    description: {
        textAlign: 'center',
        lineHeight: 24,
        opacity: 0.8,
        paddingHorizontal: 20,
    },
    featuresContainer: {
        width: '100%',
        borderRadius: 20,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    featuresHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    featuresTitle: {
        fontWeight: 'bold',
        fontSize: 18,
    },
    featuresList: {
        gap: 16,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    featureIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    featureContent: {
        flex: 1,
    },
    featureTitle: {
        fontWeight: '600',
        marginBottom: 4,
    },
    featureDescription: {
        opacity: 0.7,
        lineHeight: 18,
    },
    processContainer: {
        width: '100%',
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    processTitle: {
        textAlign: 'center',
        fontWeight: 'bold',
        marginBottom: 24,
        fontSize: 18,
    },
    processSteps: {
        gap: 16,
    },
    processStep: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    stepNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    stepText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    stepContent: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    stepDescription: {
        marginLeft: 8,
        fontWeight: '500',
    },
    stepConnector: {
        position: 'absolute',
        left: 15,
        top: 32,
        width: 2,
        height: 16,
        opacity: 0.3,
    },
    buttonContainer: {
        width: '100%',
        paddingHorizontal: 20,
    },
    primaryButton: {
        width: '100%',
    },
    secondaryButton: {
        width: '100%',
    },
    trustSection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 24,
        paddingHorizontal: 20,
    },
    trustItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    trustText: {
        marginLeft: 8,
        fontWeight: '500',
        opacity: 0.7,
    },
});