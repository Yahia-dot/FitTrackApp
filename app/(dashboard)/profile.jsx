import { StyleSheet, View, SafeAreaView, Image, ScrollView, TouchableOpacity, Dimensions, Animated } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import ThemedView from '../../components/ThemedView';
import { useProfile } from '../../hooks/useProfile';
import { useUser } from '../../hooks/useUser';
import { useTheme } from '../../hooks/useTheme';
import Spacer from '../../components/Spacer';
import ThemedText from '../../components/ThemedText';
import ThemedLogo from '../../components/ThemedLogo';
import ThemedButton from '../../components/ThemedButton';
import ThemedTextInput from '../../components/ThemedTextInput';
import ThemedLoader from '../../components/ThemedLoader';
import Header from '../../components/Header';
import { Colors } from '../../constants/Colors';
import { FontAwesome5 } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');
const fitnessLevels = ["Beginner", "Intermediate", "Advanced"];

const Profile = () => {
    const { theme } = useTheme();
    const { logout, user } = useUser();
    const { profile, loading, error, loadProfileData, updateProfile, createProfile, deleteProfile } = useProfile();
    
    const [editMode, setEditMode] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    
    const [formData, setFormData] = useState({
        name: '',
        age: '',
        weight: '',
        height: '',
        fitnessLevel: 'Beginner',
        calorieGoal: ''
    });

    // Format today's date for header
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });

    useEffect(() => {
        // Animation on component mount
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true
            })
        ]).start();
        
        if (profile) {
            setFormData({
                name: profile.name || '',
                age: profile.age ? profile.age.toString() : '',
                weight: profile.weight ? profile.weight.toString() : '',
                height: profile.height ? profile.height.toString() : '',
                fitnessLevel: profile.fitnessLevel || 'Beginner',
                calorieGoal: profile.calorieGoal ? profile.calorieGoal.toString() : ''
            });
        }
    }, [profile]);

    const handleInputChange = (field, value) => {
        setFormData({
            ...formData,
            [field]: value
        });
    };

    const handleUpdateProfile = async () => {
        const updates = {
            ...formData,
            age: parseInt(formData.age) || 0,
            weight: parseFloat(formData.weight) || 0,
            height: parseFloat(formData.height) || 0,
            calorieGoal: parseInt(formData.calorieGoal) || 2000
        };

        if (profile) {
            await updateProfile(updates);
        } else {
            await createProfile(updates);
        }

        setEditMode(false);
    };

    const handleDeleteProfile = async () => {
        setShowDeleteConfirm(false);
        await deleteProfile();
    };

    // Calculate BMI if height and weight are available
    const calculateBMI = () => {
        if (profile?.height && profile?.weight) {
            const heightInMeters = profile.height / 100;
            const bmi = (profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
            return bmi;
        }
        return null;
    };
    
    const bmi = calculateBMI();
    
    // Get BMI category
    const getBMICategory = (bmi) => {
        if (bmi < 18.5) return { category: "Underweight", color: Colors.warning };
        if (bmi < 25) return { category: "Normal", color: Colors.success };
        if (bmi < 30) return { category: "Overweight", color: Colors.warning };
        return { category: "Obese", color: Colors.danger };
    };
    
    const bmiInfo = bmi ? getBMICategory(bmi) : null;

    if (loading) {
        return (
            <ThemedView style={styles.container}>
                <Header date={formattedDate} />
                <View style={styles.loaderContainer}>
                    <ThemedLogo size={60} animated />
                    <Spacer size="large" />
                    <ThemedLoader size="large" text="Loading your profile..." />
                </View>
            </ThemedView>
        );
    }

    if (error) {
        return (
            <ThemedView style={styles.container}>
                <Header date={formattedDate} />
                <View style={styles.errorContainer}>
                    <FontAwesome5 name="exclamation-circle" size={50} color={Colors.danger} />
                    <Spacer size="large" />
                    <ThemedText variant="subtitle" style={styles.errorText}>
                        Error loading profile
                    </ThemedText>
                    <ThemedText style={styles.errorMessage}>
                        {error}
                    </ThemedText>
                    <Spacer size="large" />
                    <ThemedButton
                        title="Try Again"
                        onPress={loadProfileData}
                        leftIcon={<FontAwesome5 name="sync" size={16} color="#fff" />}
                        style={{ backgroundColor: Colors.primary }}
                    />
                </View>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <Header date={formattedDate} />
                <ScrollView 
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    <Animated.View style={[
                        styles.profileHeader,
                        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                    ]}>
                        {!editMode && profile ? (
                            <View style={styles.profileContainer}>
                                {/* Profile Header with Gradient */}
                                <LinearGradient
                                    colors={[Colors.primary, Colors.primaryDark || '#1a66ff']}
                                    style={styles.gradientHeader}
                                >
                                    <View style={styles.profileImageContainer}>
                                        {profile?.profileImage ? (
                                            <Image
                                                source={{ uri: profile.profileImage }}
                                                style={styles.profileImage}
                                            />
                                        ) : (
                                            <View style={[styles.profileImagePlaceholder, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                                                <FontAwesome5
                                                    name="user-alt"
                                                    size={40}
                                                    color="#fff"
                                                />
                                            </View>
                                        )}
                                    </View>
                                    
                                    <ThemedText variant="title" style={styles.profileName}>
                                        {profile.name || 'Anonymous Athlete'}
                                    </ThemedText>
                                    
                                    <ThemedText variant="caption" style={styles.memberSince}>
                                        Member since {new Date(profile.createdAt).toLocaleDateString()}
                                    </ThemedText>
                                </LinearGradient>
                                
                                {/* Profile Info Cards */}
                                <View style={styles.infoSection}>
                                    {/* Stats Card */}
                                    <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
                                        <View style={styles.cardHeader}>
                                            <FontAwesome5 name="chart-bar" size={18} color={Colors.primary} />
                                            <ThemedText variant="subtitle" style={styles.cardTitle}>
                                                Your Stats
                                            </ThemedText>
                                        </View>
                                        
                                        <View style={styles.statsGrid}>
                                            <View style={styles.statGridItem}>
                                                <FontAwesome5 name="calendar-alt" size={16} color={Colors.primary} />
                                                <ThemedText style={styles.statLabel}>Age</ThemedText>
                                                <ThemedText style={styles.statValue}>
                                                    {profile.age || '-'}
                                                </ThemedText>
                                                <ThemedText variant="caption">years</ThemedText>
                                            </View>
                                            
                                            <View style={styles.statGridItem}>
                                                <FontAwesome5 name="weight" size={16} color={Colors.primary} />
                                                <ThemedText style={styles.statLabel}>Weight</ThemedText>
                                                <ThemedText style={styles.statValue}>
                                                    {profile.weight || '-'}
                                                </ThemedText>
                                                <ThemedText variant="caption">kg</ThemedText>
                                            </View>
                                            
                                            <View style={styles.statGridItem}>
                                                <FontAwesome5 name="ruler-vertical" size={16} color={Colors.primary} />
                                                <ThemedText style={styles.statLabel}>Height</ThemedText>
                                                <ThemedText style={styles.statValue}>
                                                    {profile.height || '-'}
                                                </ThemedText>
                                                <ThemedText variant="caption">cm</ThemedText>
                                            </View>
                                            
                                            {bmi && (
                                                <View style={styles.statGridItem}>
                                                    <FontAwesome5 name="balance-scale" size={16} color={bmiInfo.color} />
                                                    <ThemedText style={styles.statLabel}>BMI</ThemedText>
                                                    <ThemedText style={[styles.statValue, { color: bmiInfo.color }]}>
                                                        {bmi}
                                                    </ThemedText>
                                                    <ThemedText variant="caption" style={{ color: bmiInfo.color }}>
                                                        {bmiInfo.category}
                                                    </ThemedText>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                    
                                    {/* Fitness Level Card */}
                                    <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
                                        <View style={styles.cardHeader}>
                                            <FontAwesome5 name="running" size={18} color={Colors.primary} />
                                            <ThemedText variant="subtitle" style={styles.cardTitle}>
                                                Fitness Level
                                            </ThemedText>
                                        </View>
                                        
                                        <View style={styles.levelIndicatorContainer}>
                                            <View style={styles.levelIndicator}>
                                                {fitnessLevels.map((level, index) => (
                                                    <View 
                                                        key={level}
                                                        style={[
                                                            styles.levelIndicatorSegment,
                                                            { 
                                                                backgroundColor: fitnessLevels.indexOf(profile.fitnessLevel || 'Beginner') >= index 
                                                                    ? Colors.primary 
                                                                    : 'rgba(0,0,0,0.1)' 
                                                            }
                                                        ]}
                                                    />
                                                ))}
                                            </View>
                                            <View style={styles.levelLabels}>
                                                {fitnessLevels.map((level, index) => (
                                                    <ThemedText 
                                                        key={level}
                                                        style={[
                                                            styles.levelLabel,
                                                            profile.fitnessLevel === level && styles.currentLevelLabel
                                                        ]}
                                                    >
                                                        {level}
                                                    </ThemedText>
                                                ))}
                                            </View>
                                        </View>
                                    </View>
                                    
                                    {/* Calorie Goal Card */}
                                    <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
                                        <View style={styles.cardHeader}>
                                            <FontAwesome5 name="fire" size={18} color={Colors.primary} />
                                            <ThemedText variant="subtitle" style={styles.cardTitle}>
                                                Daily Calorie Goal
                                            </ThemedText>
                                        </View>
                                        
                                        <View style={styles.calorieGoalContainer}>
                                            <View style={styles.calorieCircle}>
                                                <ThemedText style={styles.calorieValue}>
                                                    {profile.calorieGoal || '2000'}
                                                </ThemedText>
                                                <ThemedText variant="caption" style={styles.calorieLabel}>
                                                    calories/day
                                                </ThemedText>
                                            </View>
                                        </View>
                                    </View>
                                    
                                    {/* Action Buttons */}
                                    <View style={styles.buttonRow}>
                                        <ThemedButton
                                            title="Edit Profile"
                                            onPress={() => setEditMode(true)}
                                            leftIcon={<FontAwesome5 name="edit" size={16} color="#fff" />}
                                            style={styles.editButton}
                                        />
                                        <ThemedButton
                                            title="Logout"
                                            onPress={() => logout()}
                                            variant="outline"
                                            leftIcon={<FontAwesome5 name="sign-out-alt" size={16} color={Colors.primary} />}
                                            style={styles.logoutButton}
                                        />
                                    </View>
                                    
                                    <ThemedButton
                                        title="Delete Profile"
                                        onPress={() => setShowDeleteConfirm(true)}
                                        variant="text"
                                        style={styles.deleteButton}
                                        textStyle={{ color: Colors.danger }}
                                    />
                                </View>
                            </View>
                        ) : (
                            <View style={styles.formCard}>
                                <View style={styles.formHeader}>
                                    <ThemedText variant="title" style={styles.formTitle}>
                                        {profile ? 'Edit Profile' : 'Create Profile'}
                                    </ThemedText>
                                    {profile && (
                                        <TouchableOpacity 
                                            style={styles.closeButton}
                                            onPress={() => setEditMode(false)}
                                        >
                                            <FontAwesome5 name="times" size={18} color={theme.textColor} />
                                        </TouchableOpacity>
                                    )}
                                </View>

                                <ScrollView style={styles.formScrollView} showsVerticalScrollIndicator={false}>
                                    <View style={styles.formContent}>
                                        <ThemedTextInput
                                            label="Name"
                                            placeholder="Your name"
                                            value={formData.name}
                                            onChangeText={(value) => handleInputChange('name', value)}
                                            icon={<FontAwesome5 name="user" size={16} color={Colors.primary} />}
                                        />

                                        <ThemedTextInput
                                            label="Age"
                                            placeholder="Your age"
                                            value={formData.age}
                                            onChangeText={(value) => handleInputChange('age', value)}
                                            keyboardType="numeric"
                                            icon={<FontAwesome5 name="birthday-cake" size={16} color={Colors.primary} />}
                                        />

                                        <View style={styles.formRow}>
                                            <ThemedTextInput
                                                label="Weight (kg)"
                                                placeholder="Your weight"
                                                value={formData.weight}
                                                onChangeText={(value) => handleInputChange('weight', value)}
                                                style={styles.halfInput}
                                                keyboardType="numeric"
                                                icon={<FontAwesome5 name="weight" size={16} color={Colors.primary} />}
                                            />
                                            <Spacer horizontal size="small" />
                                            <ThemedTextInput
                                                label="Height (cm)"
                                                placeholder="Your height"
                                                value={formData.height}
                                                onChangeText={(value) => handleInputChange('height', value)}
                                                style={styles.halfInput}
                                                keyboardType="numeric"
                                                icon={<FontAwesome5 name="ruler-vertical" size={16} color={Colors.primary} />}
                                            />
                                        </View>

                                        <ThemedText style={styles.label}>Fitness Level</ThemedText>
                                        <View style={styles.fitnessLevelsContainer}>
                                            {fitnessLevels.map((level) => (
                                                <TouchableOpacity
                                                    key={level}
                                                    style={[
                                                        styles.levelOption,
                                                        formData.fitnessLevel === level && styles.selectedLevel,
                                                        { borderColor: theme.borderColor }
                                                    ]}
                                                    onPress={() => handleInputChange('fitnessLevel', level)}
                                                >
                                                    <ThemedText
                                                        style={[
                                                            styles.levelOptionText,
                                                            formData.fitnessLevel === level && { color: Colors.primary }
                                                        ]}
                                                    >
                                                        {level}
                                                    </ThemedText>
                                                </TouchableOpacity>
                                            ))}
                                        </View>

                                        <ThemedTextInput
                                            label="Daily Calorie Goal"
                                            placeholder="Your daily calorie goal"
                                            value={formData.calorieGoal}
                                            onChangeText={(value) => handleInputChange('calorieGoal', value)}
                                            keyboardType="numeric"
                                            icon={<FontAwesome5 name="fire" size={16} color={Colors.primary} />}
                                        />

                                        <Spacer size="large" />

                                        <ThemedButton
                                            title={profile ? "Update Profile" : "Create Profile"}
                                            onPress={handleUpdateProfile}
                                            leftIcon={<FontAwesome5 name="save" size={16} color="#fff" />}
                                            style={styles.saveButton}
                                        />
                                    </View>
                                </ScrollView>
                            </View>
                        )}

                        {!profile && !editMode && (
                            <View style={styles.welcomeCard}>
                                <LinearGradient
                                    colors={[Colors.primary, Colors.primaryDark || '#1a66ff']}
                                    style={styles.welcomeGradient}
                                >
                                    <ThemedLogo size={80} style={styles.welcomeLogo} />
                                    <ThemedText variant="title" style={styles.welcomeTitle}>
                                        Welcome to FitTrack!
                                    </ThemedText>
                                    <ThemedText style={styles.welcomeText}>
                                        Create a profile to start tracking your fitness journey
                                    </ThemedText>
                                    <Spacer size="large" />
                                    <ThemedButton
                                        title="Get Started"
                                        onPress={() => setEditMode(true)}
                                        size="large"
                                        style={styles.getStartedButton}
                                        leftIcon={<FontAwesome5 name="user-plus" size={16} color="#fff" />}
                                    />
                                </LinearGradient>
                            </View>
                        )}
                    </Animated.View>
                </ScrollView>
                
                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <View style={styles.modalOverlay}>
                        <BlurView intensity={90} style={StyleSheet.absoluteFill} />
                        <View style={[styles.modalContainer, { backgroundColor: theme.cardBackground }]}>
                            <FontAwesome5 name="exclamation-triangle" size={30} color={Colors.danger} />
                            <Spacer />
                            <ThemedText variant="subtitle" style={styles.modalTitle}>
                                Delete Profile?
                            </ThemedText>
                            <Spacer size="small" />
                            <ThemedText style={styles.modalText}>
                                This action cannot be undone. All your data will be permanently removed.
                            </ThemedText>
                            <Spacer size="large" />
                            <View style={styles.modalButtons}>
                                <ThemedButton
                                    title="Cancel"
                                    onPress={() => setShowDeleteConfirm(false)}
                                    variant="outline"
                                    style={styles.modalCancelButton}
                                />
                                <ThemedButton
                                    title="Delete"
                                    onPress={handleDeleteProfile}
                                    style={styles.modalDeleteButton}
                                    leftIcon={<FontAwesome5 name="trash-alt" size={16} color="#fff" />}
                                />
                            </View>
                        </View>
                    </View>
                )}
            </SafeAreaView>
        </ThemedView>
    );
};

export default Profile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        textAlign: 'center',
        fontSize: 18,
    },
    errorMessage: {
        textAlign: 'center',
        opacity: 0.7,
        marginTop: 8,
    },
    profileHeader: {
        flex: 1,
    },
    profileContainer: {
        flex: 1,
    },
    gradientHeader: {
        padding: 24,
        alignItems: 'center',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    profileImageContainer: {
        marginBottom: 16,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    profileImagePlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.5)',
    },
    profileName: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
    },
    memberSince: {
        color: 'rgba(255,255,255,0.8)',
        marginTop: 4,
    },
    infoSection: {
        padding: 16,
    },
    card: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        marginLeft: 8,
        fontWeight: '600',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statGridItem: {
        width: '48%',
        alignItems: 'center',
        marginBottom: 16,
        padding: 12,
        borderRadius: 10,
        backgroundColor: 'rgba(0,0,0,0.03)',
    },
    statLabel: {
        marginTop: 8,
        fontSize: 12,
        opacity: 0.7,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 2,
    },
    levelIndicatorContainer: {
        alignItems: 'center',
    },
    levelIndicator: {
        flexDirection: 'row',
        height: 8,
        width: '100%',
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 8,
    },
    levelIndicatorSegment: {
        flex: 1,
        marginHorizontal: 2,
        borderRadius: 4,
    },
    levelLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    levelLabel: {
        fontSize: 12,
        opacity: 0.7,
    },
    currentLevelLabel: {
        color: Colors.primary,
        fontWeight: 'bold',
        opacity: 1,
    },
    calorieGoalContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    calorieCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 8,
        borderColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    calorieValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    calorieLabel: {
        opacity: 0.7,
        marginTop: 4,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    editButton: {
        flex: 1,
        marginRight: 8,
    },
    logoutButton: {
        flex: 1,
        marginLeft: 8,
    },
    deleteButton: {
        marginTop: 8,
    },
    formCard: {
        flex: 1,
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        backgroundColor: 'white',
    },
    formHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    formTitle: {
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 8,
    },
    formScrollView: {
        maxHeight: 500,
    },
    formContent: {
        paddingBottom: 24,
    },
    formRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfInput: {
        flex: 1,
    },
    label: {
        marginBottom: 10,
        fontWeight: '600',
    },
    fitnessLevelsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    levelOption: {
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 12,
        flex: 1,
        marginHorizontal: 4,
        alignItems: 'center',
    },
    selectedLevel: {
        borderColor: Colors.primary,
        borderWidth: 2,
        backgroundColor: 'rgba(0, 122, 255, 0.05)',
    },
    levelOptionText: {
        fontWeight: '500',
    },
    saveButton: {
        marginTop: 8,
    },
    welcomeCard: {
        margin: 16,
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    welcomeGradient: {
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 400,
    },
    welcomeLogo: {
        marginBottom: 24,
    },
    welcomeTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    welcomeText: {
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        fontSize: 16,
    },
    getStartedButton: {
        backgroundColor: '#fff',
        width: '80%',
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: width * 0.85,
        padding: 24,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    modalTitle: {
        fontWeight: 'bold',
        textAlign: 'center',
    },
    modalText: {
        textAlign: 'center',
        opacity: 0.8,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalCancelButton: {
        flex: 1,
        marginRight: 8,
    },
    modalDeleteButton: {
        flex: 1,
        marginLeft: 8,
        backgroundColor: Colors.danger,
    }
});