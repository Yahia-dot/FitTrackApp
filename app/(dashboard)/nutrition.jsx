import React, { useState } from "react";
import { 
  StyleSheet, 
  View, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Dimensions 
} from "react-native";
import { useRouter } from "expo-router";
import { useNutritionPlan } from "../../hooks/useNutritionPlan";
import { useTheme } from "../../hooks/useTheme";
import ThemedView from "../../components/ThemedView";
import ThemedText from "../../components/ThemedText";
import ThemedLoader from "../../components/ThemedLoader";
import ThemedButton from "../../components/ThemedButton";
import Header from "../../components/Header";
import Spacer from "../../components/Spacer";
import { Colors } from "../../constants/Colors";
import { FontAwesome5 } from "@expo/vector-icons";

const { width } = Dimensions.get('window');

const Nutrition = () => {
  const { plan, loading, deletePlan } = useNutritionPlan();
  const { theme } = useTheme();
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const today = new Date();
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-US', options);

  const handleDelete = async () => {
    Alert.alert(
      "Delete Nutrition Plan", 
      "Are you sure you want to delete your nutrition plan? This action cannot be undone.", 
      [
        { 
          text: "Cancel", 
          style: "cancel",
          onPress: () => setShowDeleteConfirm(false)
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePlan();
              setShowDeleteConfirm(false);
            } catch (error) {
              Alert.alert("Error", "Failed to delete plan. Please try again.");
            }
          },
        },
      ]
    );
  };

  const getPlanStatusIcon = () => {
    if (!plan) return "plus-circle";
    return "check-circle";
  };

  const getPlanStatusColor = () => {
    if (!plan) return Colors.warning;
    return Colors.primary;
  };

  const getGoalIcon = (goal) => {
    switch (goal?.toLowerCase()) {
      case 'build muscle':
        return 'dumbbell';
      case 'lose fat':
        return 'fire';
      case 'maintain weight':
        return 'balance-scale';
      case 'improve performance':
        return 'bolt';
      default:
        return 'bullseye';
    }
  };

  const formatFoodsToAvoid = (foodsString) => {
    if (!foodsString || foodsString.trim() === '') return 'None';
    return foodsString.split(',').map(food => food.trim()).join(', ');
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView />
        <Header pageTitle="Nutrition" />
        <ThemedLoader text="Loading your nutrition plan..." />
      </ThemedView>
    );
  }

  const renderNoPlanView = () => (
    <View style={styles.centeredContent}>
      <View style={[styles.emptyStateContainer, { backgroundColor: theme.uiBackground }]}>
        <View style={[styles.emptyIconContainer, { backgroundColor: Colors.warning }]}>
          <FontAwesome5 name="apple-alt" size={32} color="#fff" />
        </View>
        
        <ThemedText variant="title" style={styles.emptyTitle}>
          No Nutrition Plan Yet
        </ThemedText>
        
        <ThemedText variant="body" style={styles.emptyDescription}>
          Create a personalized meal plan tailored to your fitness goals and dietary preferences.
        </ThemedText>

        <View style={styles.benefitsList}>
          <View style={styles.benefitItem}>
            <FontAwesome5 name="check-circle" size={16} color={Colors.primary} />
            <ThemedText variant="caption" style={styles.benefitText}>
              Personalized meal recommendations
            </ThemedText>
          </View>
          <View style={styles.benefitItem}>
            <FontAwesome5 name="check-circle" size={16} color={Colors.primary} />
            <ThemedText variant="caption" style={styles.benefitText}>
              Calorie and macro tracking
            </ThemedText>
          </View>
          <View style={styles.benefitItem}>
            <FontAwesome5 name="check-circle" size={16} color={Colors.primary} />
            <ThemedText variant="caption" style={styles.benefitText}>
              Weekly meal schedules
            </ThemedText>
          </View>
        </View>

        <ThemedButton
          title="Create Nutrition Plan"
          onPress={() => router.push("/nutrition/setup/start")}
          style={styles.createButton}
          size="large"
        />
      </View>
    </View>
  );

  const renderPlanView = () => (
    <ScrollView 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Plan Status Banner */}
      <View style={[styles.statusBanner, { backgroundColor: Colors.primary }]}>
        <View style={styles.statusLeft}>
          <View style={[styles.statusIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <FontAwesome5 name="check-circle" size={20} color="#fff" />
          </View>
          <View>
            <ThemedText variant="subtitle" style={styles.statusTitle}>
              Plan Active
            </ThemedText>
            <ThemedText variant="caption" style={styles.statusSubtitle}>
              Your nutrition plan is ready to go!
            </ThemedText>
          </View>
        </View>
        
      </View>

      <Spacer size="medium" />

      {/* Plan Details Card */}
      <View style={[styles.planCard, { backgroundColor: theme.uiBackground }]}>
        <View style={styles.cardHeader}>
          <ThemedText variant="subtitle" style={styles.cardTitle}>
            Plan Details
          </ThemedText>
          <FontAwesome5 name="info-circle" size={16} color={theme.iconColor} />
        </View>

        <View style={styles.planDetails}>
          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <FontAwesome5 name={getGoalIcon(plan.goal)} size={16} color={Colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <ThemedText variant="caption" style={styles.detailLabel}>
                Fitness Goal
              </ThemedText>
              <ThemedText variant="body" style={styles.detailValue}>
                {plan.goal}
              </ThemedText>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <FontAwesome5 name="utensils" size={16} color={Colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <ThemedText variant="caption" style={styles.detailLabel}>
                Daily Meals
              </ThemedText>
              <ThemedText variant="body" style={styles.detailValue}>
                {plan.mealsPerDay} meals per day
              </ThemedText>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIcon}>
              <FontAwesome5 name="ban" size={16} color={Colors.warning} />
            </View>
            <View style={styles.detailContent}>
              <ThemedText variant="caption" style={styles.detailLabel}>
                Foods to Avoid
              </ThemedText>
              <ThemedText variant="body" style={styles.detailValue}>
                {formatFoodsToAvoid(plan.foodsToAvoid)}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>

      <Spacer size="medium" />

      {/* Quick Actions */}
      <View style={[styles.actionsCard, { backgroundColor: theme.uiBackground }]}>
        <View style={styles.cardHeader}>
          <ThemedText variant="subtitle" style={styles.cardTitle}>
            Quick Actions
          </ThemedText>
          <FontAwesome5 name="bolt" size={16} color={theme.iconColor} />
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.background }]}
            onPress={() => router.push("/nutrition/schedule/0")}
          >
            <FontAwesome5 name="calendar-alt" size={18} color={Colors.primary} />
            <ThemedText variant="caption" style={styles.actionButtonText}>
              View Schedule
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.background }]}
            onPress={() => router.push("/nutrition/setup/start")}
          >
            <FontAwesome5 name="edit" size={18} color={Colors.warning} />
            <ThemedText variant="caption" style={styles.actionButtonText}>
              Modify Plan
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      <Spacer size="large" />

      {/* Danger Zone */}
      <View style={[styles.dangerCard, { backgroundColor: '#fef2f2' }]}>
        <View style={styles.cardHeader}>
          <ThemedText variant="subtitle" style={[styles.cardTitle, { color: '#dc2626' }]}>
            Danger Zone
          </ThemedText>
          <FontAwesome5 name="exclamation-triangle" size={16} color="#dc2626" />
        </View>
        
        <ThemedText variant="caption" style={[styles.dangerDescription, { color: '#7f1d1d' }]}>
          Deleting your plan will remove all meal schedules and cannot be undone.
        </ThemedText>

        <ThemedButton
          title="Delete Plan"
          onPress={handleDelete}
          variant="outline"
          style={[styles.deleteButton, { borderColor: '#dc2626' }]}
          leftIcon={<FontAwesome5 name="trash" size={14} color="#dc2626" />}
        />
      </View>

      <Spacer size="large" />
    </ScrollView>
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView />
      <Header pageTitle="Nutrition" date={formattedDate}/>
      
      {plan ? renderPlanView() : renderNoPlanView()}
    </ThemedView>
  );
};

export default Nutrition;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 0,
  },
  centeredContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateContainer: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 24,
    fontWeight: 'bold',
  },
  emptyDescription: {
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    opacity: 0.8,
  },
  benefitsList: {
    alignSelf: 'stretch',
    marginBottom: 32,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    marginLeft: 12,
    flex: 1,
  },
  createButton: {
    minWidth: 200,
  },
  statusBanner: {
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  statusSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginTop: 2,
  },
  viewScheduleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  viewScheduleText: {
    color: '#fff',
    fontWeight: '600',
    marginRight: 8,
  },
  planCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionsCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dangerCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  planDetails: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(88, 129, 87, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontWeight: '600',
    marginBottom: 2,
    opacity: 0.7,
  },
  detailValue: {
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  actionButtonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  dangerDescription: {
    marginBottom: 16,
    lineHeight: 18,
  },
  deleteButton: {
    alignSelf: 'flex-start',
  },
});