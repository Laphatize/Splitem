import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  darkBg,
  cardBg,
  accent,
  accentSoft,
  textPrimary,
  textSecondary,
  border,
  spacing,
  typography,
  shadows,
  success,
  warning
} from '../theme';

// Mock data - would be replaced with actual API calls
const mockTransactions = [
  { id: '1', merchant: 'Spotify', amount: 9.99, category: 'Entertainment', date: '2025-04-20' },
  { id: '2', merchant: 'Uber', amount: 24.50, category: 'Transportation', date: '2025-04-19' },
  { id: '3', merchant: 'Chipotle', amount: 12.75, category: 'Food', date: '2025-04-18' },
  { id: '4', merchant: 'Amazon', amount: 35.99, category: 'Shopping', date: '2025-04-17' },
  { id: '5', merchant: 'Starbucks', amount: 5.25, category: 'Food', date: '2025-04-16' },
  { id: '6', merchant: 'Netflix', amount: 14.99, category: 'Entertainment', date: '2025-04-15' },
  { id: '7', merchant: 'Target', amount: 42.30, category: 'Shopping', date: '2025-04-14' },
  { id: '8', merchant: 'Trader Joe\'s', amount: 65.43, category: 'Groceries', date: '2025-04-13' },
];

const mockInsights = [
  {
    id: '1',
    title: 'Subscription Alert',
    description: 'You spend $45 monthly on subscriptions. That\'s 15% of your entertainment budget.',
    action: 'Review subscriptions',
    icon: 'repeat',
    color: warning
  },
  {
    id: '2',
    title: 'Smart Saving',
    description: 'Based on your spending, you could save $120 more each month by reducing food delivery.',
    action: 'See how',
    icon: 'trending-up',
    color: success
  },
  {
    id: '3',
    title: 'Bill Split Reminder',
    description: 'Alice still owes you $24.50 from your last dinner. Want to send a reminder?',
    action: 'Send reminder',
    icon: 'people',
    color: accent
  }
];

const mockCategories = [
  { name: 'Food', percentage: 35, color: '#FF6B6B' },
  { name: 'Entertainment', percentage: 25, color: '#4ECDC4' },
  { name: 'Shopping', percentage: 20, color: '#FFD166' },
  { name: 'Transportation', percentage: 15, color: '#6A0572' },
  { name: 'Other', percentage: 5, color: '#1A535C' }
];

const screenWidth = Dimensions.get('window').width;

export default function InsightsScreen({ route }: any) {
  const { user, token } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('insights');
  const [timeRange, setTimeRange] = useState('month');
  
  // This would be replaced with actual API calls
  useEffect(() => {
    // Simulate loading data
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [timeRange]);

  const renderInsightCards = () => {
    return mockInsights.map(insight => (
      <TouchableOpacity key={insight.id} style={styles.insightCard}>
        <View style={[styles.insightIconContainer, { backgroundColor: insight.color }]}>
          <Ionicons name={insight.icon as any} size={24} color="#fff" />
        </View>
        <View style={styles.insightContent}>
          <Text style={styles.insightTitle}>{insight.title}</Text>
          <Text style={styles.insightDescription}>{insight.description}</Text>
          <TouchableOpacity style={styles.insightAction}>
            <Text style={styles.insightActionText}>{insight.action}</Text>
            <Ionicons name="chevron-forward" size={16} color={accent} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    ));
  };

  const renderSpendingChart = () => {
    const data = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr'],
      datasets: [
        {
          data: [350, 420, 380, 410],
          color: () => accent,
          strokeWidth: 2
        }
      ]
    };

    const chartConfig = {
      backgroundGradientFrom: cardBg,
      backgroundGradientTo: cardBg,
      decimalPlaces: 0,
      color: () => accent,
      labelColor: () => textSecondary,
      style: {
        borderRadius: 16
      },
      propsForDots: {
        r: '6',
        strokeWidth: '2',
        stroke: accent
      }
    };

    return (
      <LineChart
        data={data}
        width={screenWidth - spacing.lg * 2}
        height={220}
        chartConfig={chartConfig}
        bezier
        style={{
          marginVertical: spacing.md,
          borderRadius: 16
        }}
      />
    );
  };

  const renderCategoryBreakdown = () => {
    return (
      <View style={styles.categoryContainer}>
        {mockCategories.map((category, index) => (
          <View key={index} style={styles.categoryItem}>
            <View style={styles.categoryHeader}>
              <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryPercentage}>{category.percentage}%</Text>
            </View>
            <View style={styles.categoryBar}>
              <View 
                style={[styles.categoryFill, { 
                  width: `${category.percentage}%`, 
                  backgroundColor: category.color 
                }]} 
              />
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderAISuggestions = () => {
    return (
      <View style={styles.aiSuggestionsContainer}>
        <View style={styles.aiHeader}>
          <Ionicons name="sparkles" size={24} color={accent} />
          <Text style={styles.aiTitle}>AI Financial Assistant</Text>
        </View>
        <View style={styles.aiMessage}>
          <Text style={styles.aiMessageText}>
            "Based on your recent spending, I've noticed you're spending 30% more on food delivery than last month. 
            Would you like me to suggest some budget-friendly meal prep ideas that match your taste preferences?"
          </Text>
        </View>
        <View style={styles.aiActions}>
          <TouchableOpacity style={styles.aiActionButton}>
            <Text style={styles.aiActionText}>Yes, show me ideas</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.aiActionButton, styles.aiSecondaryButton]}>
            <Text style={styles.aiSecondaryActionText}>Not now</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSocialComparisons = () => {
    return (
      <View style={styles.socialContainer}>
        <Text style={styles.socialTitle}>How you compare to peers</Text>
        <Text style={styles.socialSubtitle}>Anonymous comparison with similar age group</Text>
        
        <View style={styles.comparisonItem}>
          <Text style={styles.comparisonLabel}>Coffee spending</Text>
          <View style={styles.comparisonBar}>
            <View style={[styles.comparisonFill, { width: '40%', backgroundColor: success }]} />
          </View>
          <Text style={styles.comparisonText}>You spend 20% less than peers</Text>
        </View>
        
        <View style={styles.comparisonItem}>
          <Text style={styles.comparisonLabel}>Entertainment</Text>
          <View style={styles.comparisonBar}>
            <View style={[styles.comparisonFill, { width: '75%', backgroundColor: warning }]} />
          </View>
          <Text style={styles.comparisonText}>You spend 15% more than peers</Text>
        </View>
        
        <View style={styles.comparisonItem}>
          <Text style={styles.comparisonLabel}>Savings rate</Text>
          <View style={styles.comparisonBar}>
            <View style={[styles.comparisonFill, { width: '60%', backgroundColor: accent }]} />
          </View>
          <Text style={styles.comparisonText}>You save about the same as peers</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Financial Insights</Text>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="options-outline" size={24} color={textPrimary} />
        </TouchableOpacity>
      </View>

      <View style={styles.timeSelector}>
        <TouchableOpacity 
          style={[styles.timeOption, timeRange === 'week' && styles.activeTimeOption]}
          onPress={() => setTimeRange('week')}
        >
          <Text style={[styles.timeText, timeRange === 'week' && styles.activeTimeText]}>Week</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.timeOption, timeRange === 'month' && styles.activeTimeOption]}
          onPress={() => setTimeRange('month')}
        >
          <Text style={[styles.timeText, timeRange === 'month' && styles.activeTimeText]}>Month</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.timeOption, timeRange === 'year' && styles.activeTimeOption]}
          onPress={() => setTimeRange('year')}
        >
          <Text style={[styles.timeText, timeRange === 'year' && styles.activeTimeText]}>Year</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'insights' && styles.activeTab]}
          onPress={() => setActiveTab('insights')}
        >
          <Text style={[styles.tabText, activeTab === 'insights' && styles.activeTabText]}>Insights</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'spending' && styles.activeTab]}
          onPress={() => setActiveTab('spending')}
        >
          <Text style={[styles.tabText, activeTab === 'spending' && styles.activeTabText]}>Spending</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'social' && styles.activeTab]}
          onPress={() => setActiveTab('social')}
        >
          <Text style={[styles.tabText, activeTab === 'social' && styles.activeTabText]}>Social</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accent} />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'insights' && (
            <>
              {renderAISuggestions()}
              <Text style={styles.sectionTitle}>Personalized Insights</Text>
              {renderInsightCards()}
            </>
          )}

          {activeTab === 'spending' && (
            <>
              <Text style={styles.sectionTitle}>Spending Overview</Text>
              {renderSpendingChart()}
              <Text style={styles.sectionTitle}>Category Breakdown</Text>
              {renderCategoryBreakdown()}
            </>
          )}

          {activeTab === 'social' && (
            <>
              {renderSocialComparisons()}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkBg,
    padding: spacing.lg
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  title: {
    ...typography.h2,
    color: textPrimary
  },
  iconButton: {
    backgroundColor: cardBg,
    padding: spacing.sm,
    borderRadius: 12,
    ...shadows.sm
  },
  timeSelector: {
    flexDirection: 'row',
    backgroundColor: cardBg,
    borderRadius: 12,
    marginBottom: spacing.lg,
    padding: 4
  },
  timeOption: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: 10
  },
  activeTimeOption: {
    backgroundColor: accentSoft
  },
  timeText: {
    color: textSecondary,
    ...typography.body
  },
  activeTimeText: {
    color: textPrimary,
    fontWeight: '600' as const
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: spacing.md
  },
  tab: {
    marginRight: spacing.md,
    paddingBottom: spacing.xs
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: accent
  },
  tabText: {
    color: textSecondary,
    ...typography.body
  },
  activeTabText: {
    color: accent,
    fontWeight: '600' as const
  },
  content: {
    flex: 1
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sectionTitle: {
    ...typography.h3,
    color: textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.md
  },
  insightCard: {
    backgroundColor: cardBg,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    ...shadows.sm
  },
  insightIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md
  },
  insightContent: {
    flex: 1
  },
  insightTitle: {
    ...typography.body,
    color: textPrimary,
    fontWeight: '600' as const,
    marginBottom: spacing.xs
  },
  insightDescription: {
    ...typography.small,
    color: textSecondary,
    marginBottom: spacing.sm
  },
  insightAction: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  insightActionText: {
    ...typography.small,
    color: accent,
    marginRight: spacing.xs
  },
  categoryContainer: {
    backgroundColor: cardBg,
    borderRadius: 16,
    padding: spacing.md,
    ...shadows.sm
  },
  categoryItem: {
    marginBottom: spacing.sm
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.xs
  },
  categoryName: {
    ...typography.small,
    color: textPrimary,
    flex: 1
  },
  categoryPercentage: {
    ...typography.small,
    color: textSecondary
  },
  categoryBar: {
    height: 8,
    backgroundColor: '#2A2F3F',
    borderRadius: 4,
    overflow: 'hidden'
  },
  categoryFill: {
    height: '100%',
    borderRadius: 4
  },
  aiSuggestionsContainer: {
    backgroundColor: cardBg,
    borderRadius: 16,
    padding: spacing.md,
    ...shadows.sm
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  aiTitle: {
    ...typography.h3,
    color: textPrimary,
    marginLeft: spacing.sm
  },
  aiMessage: {
    backgroundColor: accentSoft,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md
  },
  aiMessageText: {
    ...typography.body,
    color: textPrimary,
    lineHeight: 22
  },
  aiActions: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  aiActionButton: {
    backgroundColor: accent,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    flex: 1,
    marginRight: spacing.sm,
    alignItems: 'center'
  },
  aiSecondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: border,
    marginRight: 0
  },
  aiActionText: {
    color: '#fff',
    fontWeight: '500' as const
  },
  aiSecondaryActionText: {
    color: textSecondary
  },
  socialContainer: {
    backgroundColor: cardBg,
    borderRadius: 16,
    padding: spacing.md,
    ...shadows.sm
  },
  socialTitle: {
    ...typography.h3,
    color: textPrimary,
    marginBottom: spacing.xs
  },
  socialSubtitle: {
    ...typography.small,
    color: textSecondary,
    marginBottom: spacing.md
  },
  comparisonItem: {
    marginBottom: spacing.md
  },
  comparisonLabel: {
    ...typography.body,
    color: textPrimary,
    marginBottom: spacing.xs
  },
  comparisonBar: {
    height: 8,
    backgroundColor: '#2A2F3F',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: spacing.xs
  },
  comparisonFill: {
    height: '100%',
    borderRadius: 4
  },
  comparisonText: {
    ...typography.small,
    color: textSecondary
  }
});
