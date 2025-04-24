import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getBills } from './api';
import { Ionicons } from '@expo/vector-icons';
import { 
  darkBg, cardBg, accent, accentSoft, textPrimary, textSecondary, border, 
  spacing, typography, shadows, success 
} from '../theme';

export default function DashboardScreen({ route, navigation }: any) {
  const { user, token } = route.params;
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    setLoading(true);
    try {
      const res = await getBills(user.id, token);
      setBills(res.data);
    } catch (e) {
      // handle error
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>{user.name}</Text>
        </View>
        <TouchableOpacity 
          style={styles.iconButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color={textPrimary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => navigation.navigate('BillSplitter', { user, token })}
        >
          <View style={styles.actionIconContainer}>
            <Ionicons name="calculator-outline" size={24} color={accent} />
          </View>
          <Text style={styles.actionText}>Split a Bill</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionCard}
          onPress={() => navigation.navigate('BankLink', { user, token })}
        >
          <View style={styles.actionIconContainer}>
            <Ionicons name="card-outline" size={24} color={accent} />
          </View>
          <Text style={styles.actionText}>Link Bank</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Bills</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      {loading && bills.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={accent} />
        </View>
      ) : (
        <FlatList
          data={bills}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.billCard}
              onPress={() => navigation.navigate('BillDetail', { bill: item, user, token })}
            >
              <View style={styles.billHeader}>
                <Text style={styles.billTitle}>{item.name}</Text>
                <View style={[styles.statusBadge, item.settled ? styles.settledBadge : {}]}>
                  <Text style={styles.statusText}>{item.settled ? 'Paid' : 'Pending'}</Text>
                </View>
              </View>
              <View style={styles.billDetails}>
                <Text style={styles.billAmount}>${item.total}</Text>
                <Text style={styles.billDate}>April 23, 2025</Text>
              </View>
              <View style={styles.billFooter}>
                <View style={styles.participantsContainer}>
                  {/* This would ideally show participant avatars */}
                  <View style={styles.participantAvatar}>
                    <Text style={styles.avatarText}>A</Text>
                  </View>
                  <View style={[styles.participantAvatar, { marginLeft: -spacing.sm }]}>
                    <Text style={styles.avatarText}>B</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={textSecondary} />
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-outline" size={48} color={textSecondary} />
              <Text style={styles.emptyText}>No bills yet</Text>
              <Text style={styles.emptySubtext}>Split your first bill to get started</Text>
            </View>
          }
          contentContainerStyle={bills.length === 0 ? { flex: 1 } : {}}
          refreshing={loading}
          onRefresh={loadBills}
        />
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
    marginBottom: spacing.lg
  },
  welcomeText: {
    ...typography.body,
    color: textSecondary
  },
  nameText: {
    ...typography.h2,
    color: textPrimary,
    marginTop: spacing.xs
  },
  iconButton: {
    backgroundColor: cardBg,
    padding: spacing.sm,
    borderRadius: 12,
    ...shadows.sm
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl
  },
  actionCard: {
    backgroundColor: cardBg,
    borderRadius: 16,
    padding: spacing.md,
    width: '48%',
    alignItems: 'center',
    ...shadows.sm
  },
  actionIconContainer: {
    backgroundColor: accentSoft,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm
  },
  actionText: {
    ...typography.body,
    color: textPrimary,
    marginTop: spacing.xs
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  sectionTitle: {
    ...typography.h3,
    color: textPrimary
  },
  seeAllText: {
    color: accent,
    ...typography.small
  },
  billCard: {
    backgroundColor: cardBg,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  billTitle: {
    ...typography.h3,
    color: textPrimary
  },
  statusBadge: {
    backgroundColor: accentSoft,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 8
  },
  settledBadge: {
    backgroundColor: success
  },
  statusText: {
    color: textPrimary,
    ...typography.small,
    fontWeight: '500' as const
  },
  billDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md
  },
  billAmount: {
    ...typography.h3,
    color: accent
  },
  billDate: {
    color: textSecondary,
    ...typography.small,
    alignSelf: 'flex-end'
  },
  billFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: border,
    paddingTop: spacing.sm
  },
  participantsContainer: {
    flexDirection: 'row'
  },
  participantAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: accentSoft,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarText: {
    color: textPrimary,
    ...typography.tiny,
    fontWeight: '600' as const
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    ...typography.h3,
    color: textPrimary,
    marginTop: spacing.md
  },
  emptySubtext: {
    color: textSecondary,
    ...typography.small,
    marginTop: spacing.xs
  }
});
