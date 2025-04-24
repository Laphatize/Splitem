import React, { useState, useRef } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, 
  StyleSheet, Modal, Pressable, ScrollView, ActivityIndicator 
} from 'react-native';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import TextRecognition from 'react-native-text-recognition';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { 
  darkBg, cardBg, accent, accentSoft, textPrimary, textSecondary, border, inputBg,
  spacing, typography, shadows 
} from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BillSplitterScreen({ route }: any) {
  const { user, token } = route.params || {};
  const navigation = useNavigation();
  const [items, setItems] = useState<{ name: string; amount: string; sharedBy: string[] }[]>([]);
  const [people, setPeople] = useState<string[]>(['Alice', 'Bob']);
  const [newPerson, setNewPerson] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemAmount, setItemAmount] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPeople, setSelectedPeople] = useState<string[]>(people);
  const [cameraVisible, setCameraVisible] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [addItemStep, setAddItemStep] = useState(1); // 1: name, 2: amount, 3: people

  const addPerson = () => {
    if (!newPerson) return;
    setPeople([...people, newPerson]);
    setNewPerson('');
  };

  const addItem = () => {
    if (!itemName || !itemAmount || selectedPeople.length === 0) return;
    setItems([...items, { name: itemName, amount: itemAmount, sharedBy: selectedPeople }]);
    setItemName('');
    setItemAmount('');
    setSelectedPeople([]);
    setModalVisible(false);
  };

  const addItemDirectly = () => {
    if (!itemName || !itemAmount || selectedPeople.length === 0) return;
    setItems([...items, { name: itemName, amount: itemAmount, sharedBy: selectedPeople }]);
    setItemName('');
    setItemAmount('');
    setSelectedPeople([]);
  };

  // Calculate split
  const calculateSplit = () => {
    const split: Record<string, number> = {};
    people.forEach(p => (split[p] = 0));
    items.forEach(item => {
      const amt = parseFloat(item.amount) || 0;
      const share = amt / item.sharedBy.length;
      item.sharedBy.forEach(p => {
        split[p] += share;
      });
    });
    (navigation as any).navigate('BillSplitResults', { split });
  };

  const handleTakePicture = async () => {
    if (!cameraRef.current) return;
    setScanning(true);
    try {
      const photo = await cameraRef.current.takePictureAsync();
      const result = await TextRecognition.recognize(photo.uri);
      // Process OCR results - this is simplified
      const amountMatch = result.find(text => /\$?\d+\.?\d*/.test(text));
      if (amountMatch) {
        const amount = amountMatch.match(/\$?(\d+\.?\d*)/)?.[1] || '';
        setItemAmount(amount);
      }
      setCameraVisible(false);
    } catch (e) {
      console.error('Error taking picture', e);
    }
    setScanning(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.title}>Bill Splitter</Text>
            <Text style={styles.subtitle}>
              Total: <Text style={styles.totalAmount}>${items.reduce((sum, i) => sum + parseFloat(i.amount || '0'), 0).toFixed(2)}</Text>
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton} onPress={() => setCameraVisible(true)}>
              <Ionicons name="camera-outline" size={22} color={textPrimary} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => setCameraVisible(true)}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="camera-outline" size={24} color={accent} />
            </View>
            <Text style={styles.actionText}>Scan Receipt</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionCard}
            onPress={() => setItemModalVisible(true)}
          >
            <View style={styles.actionIconContainer}>
              <Ionicons name="add-outline" size={24} color={accent} />
            </View>
            <Text style={styles.actionText}>Add Item</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Items</Text>
            <Text style={styles.itemsCount}>{items.length} item{items.length !== 1 ? 's' : ''}</Text>
          </View>

          <TouchableOpacity 
            style={styles.addItemCard}
            onPress={() => setItemModalVisible(true)}
          >
            <View style={styles.addItemIconContainer}>
              <Ionicons name="add-circle" size={32} color={accent} />
            </View>
            <Text style={styles.addItemText}>Add New Item</Text>
          </TouchableOpacity>

          {items.length > 0 ? (
            <View style={styles.itemsContainer}>
              {items.map((item, index) => (
                <View key={index} style={styles.itemCard}>
                  <View style={styles.itemInfo}>
                    <View style={styles.itemIconContainer}>
                      <Ionicons name="receipt-outline" size={20} color={textPrimary} />
                    </View>
                    <View style={styles.itemDetails}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemSharedBy}>
                        Shared by {item.sharedBy.length} {item.sharedBy.length === 1 ? 'person' : 'people'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.itemActions}>
                    <Text style={styles.itemAmount}>${item.amount}</Text>
                    <TouchableOpacity 
                      style={styles.removeItemButton}
                      onPress={() => setItems(items.filter((_, i) => i !== index))}
                    >
                      <Ionicons name="trash-outline" size={20} color={textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyItemsContainer}>
              <Ionicons name="receipt-outline" size={48} color={textSecondary} />
              <Text style={styles.emptyItemsText}>No items added yet</Text>
              <Text style={styles.emptyItemsSubtext}>Add items to split the bill</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>People</Text>
            <Text style={styles.peopleCount}>{people.length} participant{people.length !== 1 ? 's' : ''}</Text>
          </View>

          <View style={styles.peopleInputContainer}>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={textSecondary} style={styles.inputIcon} />
              <TextInput 
                placeholder="Add person" 
                placeholderTextColor={textSecondary}
                value={newPerson} 
                onChangeText={setNewPerson} 
                style={styles.input} 
              />
            </View>
            <TouchableOpacity 
              style={[styles.addPersonButton, !newPerson.trim() ? styles.disabledButton : {}]}
              onPress={addPerson}
              disabled={!newPerson.trim()}
            >
              <Ionicons name="person-add-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.peopleList}>
            {people.map((person, index) => (
              <View key={index} style={styles.personCard}>
                <View style={styles.personInfo}>
                  <View style={styles.personAvatar}>
                    <Text style={styles.personInitial}>{person[0]}</Text>
                  </View>
                  <Text style={styles.personName}>{person}</Text>
                </View>
                <View style={styles.personAmountContainer}>
                  <Text style={styles.personAmount}>
                    ${items.reduce((sum, i) => sum + (i.sharedBy.includes(person) ? parseFloat(i.amount || '0') / i.sharedBy.length : 0), 0).toFixed(2)}
                  </Text>
                  <TouchableOpacity 
                    style={styles.removePersonButton}
                    onPress={() => {
                      // Remove person functionality
                      setPeople(people.filter(p => p !== person));
                      // Also remove this person from all items' sharedBy arrays
                      setItems(items.map(item => ({
                        ...item,
                        sharedBy: item.sharedBy.filter(p => p !== person)
                      })));
                    }}
                  >
                    <Ionicons name="close-circle-outline" size={20} color={textSecondary} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.calculateContainer}>
          <TouchableOpacity 
            style={[styles.calculateButton, items.length === 0 ? styles.disabledButton : {}]}
            onPress={calculateSplit}
            disabled={items.length === 0}
          >
            <Ionicons name="calculator-outline" size={20} color="#fff" style={{marginRight: spacing.xs}} />
            <Text style={styles.calculateButtonText}>Calculate Split</Text>
          </TouchableOpacity>
        </View>

        {/* Modal for sharing selection */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Who's sharing this item?</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={24} color={textSecondary} />
                </TouchableOpacity>
              </View>
              
              {people.length > 0 ? (
                <ScrollView style={styles.modalScrollView}>
                  {people.map(p => (
                    <TouchableOpacity
                      key={p}
                      style={styles.personCheckRow}
                      onPress={() => setSelectedPeople(selectedPeople.includes(p) ? selectedPeople.filter(x => x !== p) : [...selectedPeople, p])}
                    >
                      <View style={styles.checkboxContainer}>
                        <Ionicons 
                          name={selectedPeople.includes(p) ? "checkbox" : "square-outline"} 
                          size={22} 
                          color={accent} 
                          style={{ marginRight: spacing.sm }} 
                        />
                      </View>
                      <View style={styles.personCheckInfo}>
                        <View style={styles.personCheckAvatar}>
                          <Text style={styles.personCheckInitial}>{p[0]}</Text>
                        </View>
                        <Text style={styles.personCheckText}>{p}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.emptyPeopleContainer}>
                  <Ionicons name="people-outline" size={48} color={textSecondary} />
                  <Text style={styles.emptyPeopleText}>No people added yet</Text>
                  <Text style={styles.emptyPeopleSubtext}>Add people to split your bill with</Text>
                </View>
              )}
              
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalPrimaryButton, selectedPeople.length === 0 ? styles.disabledButton : {}]} 
                  onPress={addItem}
                  disabled={selectedPeople.length === 0 || !itemName || !itemAmount}
                >
                  <Text style={styles.modalPrimaryButtonText}>Add Item</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* New Item Modal - Drawer Style */}
        <Modal
          visible={itemModalVisible}
          transparent
          animationType="slide"
        >
          <View style={styles.drawerModalContainer}>
            <View style={styles.drawerModalContent}>
              <View style={styles.drawerHandle} />
              
              <View style={styles.drawerHeader}>
                <Text style={styles.drawerTitle}>Add New Item</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => {
                    setItemModalVisible(false);
                    setItemName('');
                    setItemAmount('');
                    setSelectedPeople([]);
                  }}
                >
                  <Ionicons name="close" size={24} color={textSecondary} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.drawerScrollView}>
                <View style={styles.drawerSection}>
                  <Text style={styles.drawerSectionLabel}>Item Name</Text>
                  <View style={styles.drawerInputContainer}>
                    <TextInput
                      placeholder="What did you buy?"
                      placeholderTextColor={textSecondary}
                      value={itemName}
                      onChangeText={setItemName}
                      style={styles.drawerInput}
                    />
                  </View>
                </View>
                
                <View style={styles.drawerSection}>
                  <Text style={styles.drawerSectionLabel}>Amount</Text>
                  <View style={styles.drawerInputContainer}>
                    <Text style={styles.currencySymbol}>$</Text>
                    <TextInput
                      placeholder="0.00"
                      placeholderTextColor={textSecondary}
                      value={itemAmount}
                      onChangeText={setItemAmount}
                      keyboardType="decimal-pad"
                      style={styles.drawerInput}
                    />
                  </View>
                </View>
                
                <View style={styles.drawerSection}>
                  <Text style={styles.drawerSectionLabel}>Who's sharing this item?</Text>
                  {people.length > 0 ? (
                    <View style={styles.peopleSelectionContainer}>
                      {people.map(person => (
                        <TouchableOpacity
                          key={person}
                          style={[styles.personSelectCard, selectedPeople.includes(person) && styles.personSelectCardActive]}
                          onPress={() => {
                            if (selectedPeople.includes(person)) {
                              setSelectedPeople(selectedPeople.filter(p => p !== person));
                            } else {
                              setSelectedPeople([...selectedPeople, person]);
                            }
                          }}
                        >
                          <View style={[styles.personSelectAvatar, {backgroundColor: person === 'Alice' ? '#3B82F6' : '#6366F1'}]}>
                            <Text style={styles.personSelectInitial}>{person[0]}</Text>
                          </View>
                          <Text style={styles.personSelectName}>{person}</Text>
                          {selectedPeople.includes(person) && (
                            <View style={styles.personSelectCheckmark}>
                              <Ionicons name="checkmark-circle" size={24} color="#4F46E5" />
                            </View>
                          )}
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <View style={styles.emptyPeopleContainer}>
                      <Ionicons name="people-outline" size={48} color={textSecondary} />
                      <Text style={styles.emptyPeopleText}>No people added yet</Text>
                      <Text style={styles.emptyPeopleSubtext}>Add people to split your bill with</Text>
                    </View>
                  )}
                </View>
              </ScrollView>
              
              <View style={styles.drawerFooter}>
                <TouchableOpacity 
                  style={[styles.addItemButtonLarge, (!itemName.trim() || !itemAmount.trim() || selectedPeople.length === 0) ? styles.disabledButton : {}]}
                  onPress={() => {
                    addItemDirectly();
                    setItemModalVisible(false);
                  }}
                  disabled={!itemName.trim() || !itemAmount.trim() || selectedPeople.length === 0}
                >
                  <Text style={styles.addItemButtonLargeText}>Add Item</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Camera for OCR */}
        <Modal visible={cameraVisible} animationType="slide">
          <View style={styles.cameraContainer}>
            {permission?.granted ? (
              <>
                <CameraView ref={cameraRef} style={styles.camera} facing={facing} />
                <View style={styles.cameraControls}>
                  <TouchableOpacity 
                    style={styles.cameraButton} 
                    onPress={handleTakePicture} 
                    disabled={scanning}
                  >
                    {scanning ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.cameraButtonText}>Scan Receipt</Text>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.cameraFlipButton} 
                    onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
                  >
                    <Ionicons name="camera-reverse-outline" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.permissionContainer}>
                <Ionicons name="camera-outline" size={48} color={accent} />
                <Text style={styles.permissionText}>We need camera access to scan receipts</Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                  <Text style={styles.permissionButtonText}>Grant Permission</Text>
                </TouchableOpacity>
              </View>
            )}
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setCameraVisible(false)}
            >
              <Ionicons name="close" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: darkBg,
    padding: spacing.lg
  },
  scrollContainer: {
    flex: 1
  },
  contentContainer: {
    paddingVertical: spacing.lg
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg
  },
  headerContent: {
    flex: 1
  },
  title: {
    ...typography.h2,
    color: textPrimary,
    textAlign: 'left'
  },
  subtitle: {
    ...typography.body,
    color: textSecondary,
    textAlign: 'left',
    marginTop: spacing.xs
  },
  totalAmount: {
    color: accent,
    fontWeight: '600' as const
  },
  headerActions: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  iconButton: {
    backgroundColor: cardBg,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center'
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg
  },
  actionCard: {
    backgroundColor: cardBg,
    borderRadius: 12,
    padding: spacing.md,
    width: '45%',
    ...shadows.sm
  },
  actionIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  actionText: {
    ...typography.body,
    color: textPrimary,
    textAlign: 'center'
  },
  section: {
    marginBottom: spacing.lg
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  sectionTitle: {
    ...typography.h3,
    color: textPrimary,
    marginBottom: spacing.sm
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: inputBg,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm
  },
  inputIcon: {
    marginRight: spacing.xs
  },
  input: {
    flex: 1,
    color: textPrimary,
    fontSize: 16
  },
  addItemCard: {
    backgroundColor: cardBg,
    borderRadius: 12,
    padding: spacing.md,
    ...shadows.sm,
    justifyContent: 'center',
    alignItems: 'center',
    height: 120
  },
  addItemIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  addItemText: {
    ...typography.body,
    color: textPrimary,
    textAlign: 'center'
  },
  itemCount: {
    ...typography.body,
    color: textSecondary
  },
  itemsContainer: {
    maxHeight: 250
  },
  itemCard: {
    backgroundColor: cardBg,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  itemIconContainer: {
    marginRight: spacing.sm
  },
  itemDetails: {
    flex: 1
  },
  itemName: {
    ...typography.body,
    color: textPrimary,
    fontWeight: '500' as const
  },
  itemSharedBy: {
    ...typography.small,
    color: textSecondary
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  itemAmount: {
    ...typography.body,
    color: accent,
    fontWeight: '600' as const
  },
  removeItemButton: {
    marginLeft: spacing.sm
  },
  emptyItemsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg
  },
  emptyItemsText: {
    ...typography.body,
    color: textSecondary,
    textAlign: 'center',
    marginTop: spacing.md
  },
  emptyItemsSubtext: {
    ...typography.small,
    color: textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm
  },
  peopleInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm
  },
  peopleList: {
    maxHeight: 180
  },
  personCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: border
  },
  personInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  personAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm
  },
  personInitial: {
    color: textPrimary,
    fontWeight: '600' as const
  },
  personName: {
    ...typography.body,
    color: textPrimary
  },
  personAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  personAmount: {
    ...typography.body,
    color: accent,
    fontWeight: '600' as const
  },
  removePersonButton: {
    marginLeft: spacing.sm
  },
  calculateContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md
  },
  calculateButton: {
    backgroundColor: accent,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    ...shadows.sm
  },
  calculateButtonText: {
    ...typography.body,
    color: '#fff',
    fontWeight: '600' as const
  },
  disabledButton: {
    opacity: 0.5
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#1E2430',
    borderRadius: 16,
    padding: spacing.md,
    width: '90%',
    maxHeight: '70%',
    ...shadows.lg
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  modalTitle: {
    ...typography.h3,
    color: textPrimary,
    textAlign: 'left'
  },
  modalScrollView: {
    maxHeight: 250
  },
  checkboxContainer: {
    marginRight: spacing.sm
  },
  personCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs
  },
  personCheckInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  personCheckAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm
  },
  personCheckInitial: {
    color: textPrimary,
    fontWeight: '600' as const
  },
  personCheckText: {
    ...typography.body,
    color: textPrimary
  },
  emptyPeopleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg
  },
  emptyPeopleText: {
    ...typography.body,
    color: textSecondary,
    textAlign: 'center',
    marginTop: spacing.md
  },
  emptyPeopleSubtext: {
    ...typography.small,
    color: textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: spacing.lg
  },
  modalPrimaryButton: {
    backgroundColor: accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8
  },
  modalPrimaryButtonText: {
    ...typography.body,
    color: '#fff',
    fontWeight: '500' as const
  },
  addItemButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    alignSelf: 'flex-end'
  },
  addItemButtonText: {
    ...typography.body,
    color: '#fff',
    fontWeight: '500' as const
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: darkBg
  },
  camera: {
    flex: 1
  },
  cameraControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cameraButton: {
    backgroundColor: accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    ...shadows.md
  },
  cameraButtonText: {
    ...typography.body,
    color: '#fff',
    fontWeight: '600' as const
  },
  cameraFlipButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.md
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center'
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl
  },
  permissionText: {
    ...typography.body,
    color: textPrimary,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg
  },
  permissionButton: {
    backgroundColor: accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12
  },
  permissionButtonText: {
    ...typography.body,
    color: '#fff',
    fontWeight: '500' as const
  },
  peopleCount: {
    ...typography.body,
    color: textSecondary
  },
  addPersonButton: {
    backgroundColor: accent,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm
  },
  itemInputSection: {
    padding: spacing.md
  },
  sharingLabel: {
    ...typography.body,
    color: textPrimary,
    marginBottom: spacing.sm
  },
  itemsCount: {
    ...typography.body,
    color: textSecondary
  },
  peopleCheckList: {
    maxHeight: 200
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: accent,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  checkboxSelected: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5'
  },
  paginationButton: {
    backgroundColor: accent,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  paginationButtonText: {
    ...typography.body,
    color: '#fff',
    fontWeight: '500' as const
  },
  backButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm
  },
  paginationRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: spacing.md
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  stepItemName: {
    ...typography.body,
    color: textPrimary,
    marginRight: spacing.sm
  },
  stepItemAmount: {
    ...typography.body,
    color: accent,
    fontWeight: '600' as const
  },
  drawerModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  drawerModalContent: {
    backgroundColor: '#1E2430',
    borderRadius: 16,
    padding: spacing.md,
    width: '100%',
    maxHeight: '80%',
    ...shadows.lg
  },
  drawerHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#333',
    marginBottom: spacing.md
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md
  },
  drawerTitle: {
    ...typography.h3,
    color: textPrimary,
    textAlign: 'left'
  },
  drawerScrollView: {
    maxHeight: '70%'
  },
  drawerSection: {
    marginBottom: spacing.md
  },
  drawerSectionLabel: {
    ...typography.body,
    color: textPrimary,
    marginBottom: spacing.sm
  },
  drawerInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: inputBg,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  drawerInput: {
    flex: 1,
    color: textPrimary,
    fontSize: 16
  },
  currencySymbol: {
    ...typography.body,
    color: textPrimary,
    marginRight: spacing.xs
  },
  peopleSelectionContainer: {
    maxHeight: 200
  },
  personSelectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
    backgroundColor: cardBg,
    borderRadius: 12,
    ...shadows.sm
  },
  personSelectCardActive: {
    backgroundColor: accentSoft
  },
  personSelectAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm
  },
  personSelectInitial: {
    color: textPrimary,
    fontWeight: '600' as const
  },
  personSelectName: {
    ...typography.body,
    color: textPrimary
  },
  personSelectCheckmark: {
    position: 'absolute',
    right: 16,
    top: 16
  },
  drawerFooter: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md
  },
  addItemButtonLarge: {
    backgroundColor: accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    ...shadows.md
  },
  addItemButtonLargeText: {
    ...typography.body,
    color: '#fff',
    fontWeight: '600' as const
  }
});
