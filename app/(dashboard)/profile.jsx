import { StyleSheet, View, SafeAreaView, ImageBackground, Image, ScrollView, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
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

const fitnessLevels = ["Beginner", "Intermediate", "Advanced"];

const Profile = () => {
    const { theme } = useTheme();
    const { logout, user } = useUser()
    const { profile, loading, error, loadProfileData, updateProfile, createProfile, deleteProfile } = useProfile();

    const [editMode, setEditMode] = useState(false);
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
            age: parseInt(formData.age),
            weight: parseFloat(formData.weight),
            height: parseFloat(formData.height),
            calorieGoal: parseInt(formData.calorieGoal)
        };

        if (profile) {
            await updateProfile(updates);
        } else {
            await createProfile(updates);
        }

        setEditMode(false);
    };

    const handleDeleteProfile = async () => {
        await deleteProfile();
    };

    if (loading) {
        return (
            <ThemedView style={styles.container}>
                <Header date={formattedDate} />
                <View style={styles.loaderContainer}>
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
                    <ThemedText variant="subtitle" style={styles.errorText}>
                        Error loading profile
                    </ThemedText>
                    <ThemedText style={styles.errorMessage}>
                        {error}
                    </ThemedText>
                    <Spacer />
                    <ThemedButton
                        title="Try Again"
                        onPress={loadProfileData}
                        leftIcon={<FontAwesome5 name="sync" size={16} color="#fff" />}
                    />
                </View>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <Header date={formattedDate} />
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.profileHeader}>
                        <View style={styles.profileImageContainer}>
                            {profile?.profileImage ? (
                                <Image
                                    source={{ uri: profile.profileImage }}
                                    style={styles.profileImage}
                                />
                            ) : (
                                <View style={[styles.profileImagePlaceholder, { backgroundColor: theme.uiBackground }]}>
                                    <FontAwesome5
                                        name="user-alt"
                                        size={40}
                                        color={theme.iconColor}
                                    />
                                </View>
                            )}
                        </View>

                        <Spacer />

                        {!editMode && profile ? (
                            <View style={styles.profileInfo}>
                                <ThemedText variant="title" style={styles.name}>
                                    {profile.name || 'Anonymous Athlete'}
                                </ThemedText>
                                <ThemedText variant="caption" style={styles.createdAt}>
                                    Member since {new Date(profile.createdAt).toLocaleDateString()}
                                </ThemedText>

                                <Spacer size="small" />

                                <View style={styles.statsContainer}>
                                    <View style={styles.statItem}>
                                        <FontAwesome5
                                            name="calendar-alt"
                                            size={16}
                                            color={Colors.primary}
                                        />
                                        <ThemedText style={styles.statText}>
                                            {profile.age || '-'} years
                                        </ThemedText>
                                    </View>

                                    <View style={styles.statItem}>
                                        <FontAwesome5
                                            name="weight"
                                            size={16}
                                            color={Colors.primary}
                                        />
                                        <ThemedText style={styles.statText}>
                                            {profile.weight || '-'} kg
                                        </ThemedText>
                                    </View>

                                    <View style={styles.statItem}>
                                        <FontAwesome5
                                            name="ruler-vertical"
                                            size={16}
                                            color={Colors.primary}
                                        />
                                        <ThemedText style={styles.statText}>
                                            {profile.height || '-'} cm
                                        </ThemedText>
                                    </View>
                                </View>

                                <Spacer />

                                <View style={styles.fitnessLevelContainer}>
                                    <ThemedText variant="subtitle">
                                        Fitness Level
                                    </ThemedText>
                                    <View style={styles.levelBadge}>
                                        <ThemedText style={styles.levelText}>
                                            {profile.fitnessLevel || 'Beginner'}
                                        </ThemedText>
                                    </View>
                                </View>

                                <Spacer />

                                <View style={styles.goalContainer}>
                                    <View style={styles.goalHeader}>
                                        <FontAwesome5
                                            name="fire"
                                            size={18}
                                            color={Colors.primary}
                                        />
                                        <ThemedText variant="subtitle" style={styles.goalTitle}>
                                            Daily Calorie Goal
                                        </ThemedText>
                                    </View>
                                    <ThemedText style={styles.goalValue}>
                                        {profile.calorieGoal || '2000'} calories
                                    </ThemedText>
                                </View>

                                <Spacer size="large" />

                                <View style={styles.buttonContainer}>
                                    <ThemedButton
                                        title="Edit Profile"
                                        onPress={() => setEditMode(true)}
                                        leftIcon={<FontAwesome5 name="edit" size={16} color="#fff" />}
                                        style={styles.editButton}
                                    />
                                    <ThemedButton
                                        title="Delete Profile"
                                        onPress={handleDeleteProfile}
                                        variant="outline"
                                        leftIcon={<FontAwesome5 name="trash-alt" size={16} color={Colors.primary} />}
                                        style={styles.deleteButton}
                                    />

                                </View>
                                <Spacer size="large" />

                                <ThemedButton
                                    title="Logout"
                                    onPress={() => logout()}
                                    style={styles.logoutButton}
                                />

                            </View>
                        ) : (
                            <View style={styles.formContainer}>
                                <ThemedText variant="title" style={styles.formTitle}>
                                    {profile ? 'Edit Profile' : 'Create Profile'}
                                </ThemedText>

                                <Spacer />

                                <ThemedTextInput
                                    label="Name"
                                    placeholder="Your name"
                                    value={formData.name}
                                    onChangeText={(value) => handleInputChange('name', value)}
                                />

                                <ThemedTextInput
                                    label="Age"
                                    placeholder="Your age"
                                    value={formData.age}
                                    onChangeText={(value) => handleInputChange('age', value)}
                                />

                                <View style={styles.formRow}>
                                    <ThemedTextInput
                                        label="Weight (kg)"
                                        placeholder="Your weight"
                                        value={formData.weight}
                                        onChangeText={(value) => handleInputChange('weight', value)}
                                        style={styles.halfInput}
                                    />
                                    <Spacer horizontal size="small" />
                                    <ThemedTextInput
                                        label="Height (cm)"
                                        placeholder="Your height"
                                        value={formData.height}
                                        onChangeText={(value) => handleInputChange('height', value)}
                                        style={styles.halfInput}
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
                                                { borderColor: theme.iconColor }
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
                                />

                                <Spacer size="large" />

                                <View style={styles.buttonContainer}>
                                    <ThemedButton
                                        title={profile ? "Update Profile" : "Create Profile"}
                                        onPress={handleUpdateProfile}
                                        leftIcon={<FontAwesome5 name="save" size={16} color="#fff" />}
                                        style={styles.saveButton}
                                    />
                                    <ThemedButton
                                        title="Cancel"
                                        onPress={() => setEditMode(false)}
                                        variant="outline"
                                        style={styles.cancelButton}
                                    />
                                </View>
                            </View>
                        )}

                        {!profile && !editMode && (
                            <View style={styles.noProfileContainer}>
                                <ThemedLogo size={60} />
                                <Spacer />
                                <ThemedText variant="subtitle" style={styles.welcomeText}>
                                    Welcome to FitTrack!
                                </ThemedText>
                                <Spacer size="small" />
                                <ThemedText style={styles.createProfileText}>
                                    Create a profile to start tracking your fitness journey
                                </ThemedText>
                                <Spacer size="large" />
                                <ThemedButton
                                    title="Create Profile"
                                    onPress={() => setEditMode(true)}
                                    size="large"
                                    leftIcon={<FontAwesome5 name="user-plus" size={16} color="#fff" />}
                                />
                            </View>
                        )}
                    </View>
                </ScrollView>
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
    },
    errorMessage: {
        textAlign: 'center',
        opacity: 0.7,
        marginTop: 8,
    },
    profileHeader: {
        padding: 16,
    },
    profileImageContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    profileImagePlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    profileInfo: {
        alignItems: 'center',
    },
    name: {
        textAlign: 'center',
    },
    createdAt: {
        textAlign: 'center',
        marginTop: 4,
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 16,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
    },
    statText: {
        marginLeft: 8,
    },
    fitnessLevelContainer: {
        alignItems: 'center',
    },
    levelBadge: {
        backgroundColor: Colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 8,
    },
    levelText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    goalContainer: {
        width: '100%',
        alignItems: 'center',
    },
    goalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    goalTitle: {
        marginLeft: 8,
    },
    goalValue: {
        marginTop: 8,
        fontWeight: 'bold',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    editButton: {
        flex: 1,
        marginRight: 8,
    },
    logoutButton: {
        flex: 1,
        marginRight: 8,
        backgroundColor: Colors.warning,
    },
    deleteButton: {
        flex: 1,
        marginLeft: 8,
    },
    saveButton: {
        flex: 1,
        marginRight: 8,
    },
    cancelButton: {
        flex: 1,
        marginLeft: 8,
    },
    formContainer: {
        width: '100%',
    },
    formTitle: {
        textAlign: 'center',
    },
    formRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfInput: {
        flex: 1,
    },
    label: {
        marginBottom: 6,
        fontWeight: '600',
    },
    fitnessLevelsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    levelOption: {
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginBottom: 8,
        width: '48%',
        alignItems: 'center',
    },
    selectedLevel: {
        borderColor: Colors.primary,
        borderWidth: 2,
    },
    levelOptionText: {
        fontWeight: '500',
    },
    noProfileContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    welcomeText: {
        textAlign: 'center',
    },
    createProfileText: {
        textAlign: 'center',
        opacity: 0.8,
    },
});