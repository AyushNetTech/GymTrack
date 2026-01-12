import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
  Dimensions,
  TextInput,
  StatusBar,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Ionicons } from "@expo/vector-icons";
import { supabase } from '../../lib/supabase';
import { markProfileCompleted } from "../../utils/profileState";
import ProfileSetupSuccessDialog from '../../components/ProfileSetupSuccessDialog';
import { RulerPicker } from 'react-native-ruler-picker';

const PRIMARY = '#f4ff47';
const BG = '#111';
const { width, height } = Dimensions.get('window');
const GAP = 20;
const BOX_SIZE = (width - GAP * 3) / 2;

type Gender = 'Male' | 'Female';
type Goal = 'Lose Weight' | 'Gain Weight' | 'Build Muscles' | 'Stay Fit';
const DEFAULT_HEIGHT = 170;
const DEFAULT_WEIGHT = 50;

const goals: { label: Goal; image: any }[] = [
  { label: 'Lose Weight', image: require('../../assets/waitloss.jpeg') },
  { label: 'Gain Weight', image: require('../../assets/bulk.jpeg') },
  { label: 'Build Muscles', image: require('../../assets/build.png') },
  { label: 'Stay Fit', image: require('../../assets/leanfit.png') },
];

const TOTAL_STEPS = 4;
const GENDER_CARD_WIDTH = (width - 40 - 14) / 2;

const formatDate = (date: Date) => {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export default function ProfileSetupScreen({ onProfileCompleted }: any) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [goal, setGoal] = useState<Goal | ''>('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [birthdateError, setBirthdateError] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [heightVal, setHeightVal] = useState(String(DEFAULT_HEIGHT));
  const [weightVal, setWeightVal] = useState(String(DEFAULT_WEIGHT));
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  const weights = Array.from({ length: 201 }, (_, i) => i + 30); // 30–230 kg
  const heights = Array.from({ length: 121 }, (_, i) => i + 120); // 120–240 cm

  const titles = [
    'Set Your Profile First',
    'Select Your Goal',
    'Body Details',
    'Personal Information',
  ];

  const canProceed = (() => {
    switch (step) {
      case 1: return true;
      case 2: return !!goal;
      case 3: return heightVal && weightVal && birthdate;
      case 4:
        return (
          gender &&
          firstName.trim() &&
          lastName.trim() &&
          phone.trim() &&
          username.trim() &&
          !checkingUsername
        );
      default: return false;
    }
  })();

  const checkUsernameAvailability = async () => {
    if (!username.trim()) return false;

    setCheckingUsername(true);
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;

    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.toLowerCase())
      .neq('id', userId)
      .limit(1);

    setCheckingUsername(false);

    if (error) {
      console.log('Username check error:', error.message);
      return false;
    }

    const available = data?.length === 0;
    setUsernameAvailable(available);
    return available;
  };

  const handleNext = async () => {
    if (step === 3 && !birthdate) {
      setBirthdateError(true);
      return;
    }

    if (step === 4) {
      if (!username.trim()) return;
      const available = await checkUsernameAvailability();
      if (!available) {
        setUsernameError('Username already exists');
        setUsernameAvailable(false);
        return;
      }
    }

    if (!canProceed) return;

    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      return;
    }

    setLoading(true);
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData?.user?.id;
      const userEmail = authData?.user?.email;
      if (!userId || !userEmail) throw new Error('User not found');

      const { error } = await supabase.from('profiles').upsert({
        id: userId,
        email: userEmail,
        first_name: firstName,
        last_name: lastName,
        username,
        phone,
        gender,
        goal,
        birthdate: birthdate ? birthdate.toISOString().split("T")[0] : null,
        height: Number(heightVal),
        weight: Number(weightVal),
      });

      if (error) {
        if (error.message.includes('profiles_username_key')) {
          setUsernameError('Username already exists');
          setUsernameAvailable(false);
        } else {
          setUsernameError(error.message);
        }
      } else {
        await markProfileCompleted();
        Keyboard.dismiss(); 
        setTimeout(() => setShowSuccess(true), 150);
      }

    } catch (err: any) {
      setUsernameError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <ImageBackground
            source={require('../../assets/setprofileintro.png')}
            style={styles.hero}
          >
            <Text style={styles.heroTitle}>Transform Your Body</Text>
            <Text style={styles.heroSub}>Excuses don’t burn calories.</Text>
          </ImageBackground>
        );

      case 2:
        return (
          <View style={styles.grid}>
            {goals.map(g => (
              <TouchableOpacity
                key={g.label}
                style={styles.goalBox}
                onPress={() => setGoal(g.label)}
              >
                <Image source={g.image} style={styles.goalImg} />
                <View style={styles.overlay} />
                {goal === g.label && <View style={styles.selectedRing} />}
                <Text style={styles.goalText}>{g.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        );

      case 3:
        return (
          <>
            {/* BIRTHDATE INPUT */}
            <Text style={styles.weightLabel}>BirthDate</Text>
            <View style={[styles.dateInputContainer, birthdateError && styles.dateErrorBorder]}>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowDatePicker(true)} activeOpacity={0.8}>
                <Text style={[styles.datePlaceholder, birthdate && styles.dateSelected]}>
                  {birthdate ? formatDate(birthdate) : "DD / MM / YYYY"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <Ionicons name="calendar-outline" size={25} color={PRIMARY} />
              </TouchableOpacity>
            </View>
            {birthdateError && <Text style={styles.error}>Enter birthdate</Text>}

            <DateTimePickerModal
              isVisible={showDatePicker}
              mode="date"
              maximumDate={new Date()}
              onConfirm={(date) => {
                setBirthdate(date);
                setBirthdateError(false);
                setShowDatePicker(false);
              }}
              onCancel={() => setShowDatePicker(false)}
            />

            {/* WEIGHT PICKER */}
            <View style={styles.weightContainer}>
              <Text style={styles.weightLabel}>Weight (kg)</Text>
              <RulerPicker
                min={30}
                max={230}
                step={1}
                initialValue={Number(weightVal)}
                onValueChange={(v) => setWeightVal(String(v))}
                unit="kg"
                width={width - 40}
                height={120}
                orientation="horizontal"
                indicatorColor={PRIMARY}
                indicatorWidth={4}
                indicatorHeight={60}
                smoothScroll
                scrollAnimation
                valueTextStyle={{ color: PRIMARY, fontSize: 26, fontWeight: '900' }}
                unitTextStyle={{ color: '#aaa', fontSize: 14 }}
                tickColor="#555"
                majorTickColor={PRIMARY}
                majorTickHeight={30}
                minorTickHeight={15}
                backgroundColor="#0f0f0f"
              />
            </View>

            {/* HEIGHT PICKER */}
            <View style={styles.weightContainer}>
              <Text style={styles.weightLabel}>Height (cm)</Text>
              <RulerPicker
                min={120}
                max={240}
                step={1}
                initialValue={Number(heightVal)}
                onValueChange={(v) => setHeightVal(String(v))}
                unit="cm"
                width={width - 40}
                height={120}
                orientation="horizontal"
                indicatorColor={PRIMARY}
                indicatorWidth={4}
                indicatorHeight={60}
                smoothScroll
                scrollAnimation
                valueTextStyle={{ color: PRIMARY, fontSize: 26, fontWeight: '900' }}
                unitTextStyle={{ color: '#aaa', fontSize: 14 }}
                tickColor="#555"
                majorTickColor={PRIMARY}
                majorTickHeight={30}
                minorTickHeight={15}
                backgroundColor="#0f0f0f"
              />
            </View>
          </>
        );

      case 4:
        return (
          <>
            <View style={styles.genderRow}>
              <View style={[styles.genderBorderWrapper, gender === 'Male' && styles.genderSelected]}>
                <TouchableOpacity style={styles.genderImageCard} onPress={() => setGender('Male')} activeOpacity={0.9}>
                  <ImageBackground source={require('../../assets/Male.jpg')} style={styles.genderBg}>
                    <View style={styles.genderOverlay} />
                    <Text style={styles.genderLabel}>MALE</Text>
                  </ImageBackground>
                </TouchableOpacity>
              </View>

              <View style={[styles.genderBorderWrapper, gender === 'Female' && styles.genderSelected]}>
                <TouchableOpacity style={styles.genderImageCard} onPress={() => setGender('Female')} activeOpacity={0.9}>
                  <ImageBackground source={require('../../assets/Female.jpg')} style={styles.genderBg}>
                    <View style={styles.genderOverlay} />
                    <Text style={styles.genderLabel}>FEMALE</Text>
                  </ImageBackground>
                </TouchableOpacity>
              </View>
            </View>

            <Input placeholder="First Name" value={firstName} onChangeText={setFirstName} />
            <Input placeholder="Last Name" value={lastName} onChangeText={setLastName} />
            <Input
              placeholder="Username"
              value={username}
              autoCapitalize="none"
              onChangeText={(t) => {
                setUsername(t.toLowerCase());
                setUsernameError(null);
                setUsernameAvailable(null);
              }}
              style={(usernameAvailable === false || usernameError) && styles.inputError}
            />
            {usernameError && <Text style={styles.error}>{usernameError}</Text>}
            <Input
              placeholder="Phone"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              returnKeyType="done"
            />
          </>
        );
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}>
        <View style={styles.container}>
          <Text style={styles.stepText}>STEP {step} OF {TOTAL_STEPS}</Text>
          <Text style={styles.title}>{titles[step - 1]}</Text>

          <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 160 }}>
            {renderStep()}
          </ScrollView>

          <View style={styles.buttonRow}>
            {step > 1 && (
              <TouchableOpacity style={[styles.button, styles.sideButton, styles.backButton]} disabled={loading} onPress={() => setStep(step - 1)}>
                <Text style={[styles.buttonText, { color: "#fff" }]}>Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.button, styles.sideButton, !canProceed && styles.disabled]} disabled={!canProceed || loading || showSuccess} onPress={handleNext}>
              {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>{step === 4 ? "Finish" : "Next"}</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
      <ProfileSetupSuccessDialog
        visible={showSuccess}
        onAutoClose={() => {
          setShowSuccess(false);
          onProfileCompleted();
        }}
      />
    </SafeAreaView>
  );
}

const Input = (props: any) => <TextInput {...props} style={[styles.input, props.style]} placeholderTextColor="#888" />;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { flex: 1, padding: 20, paddingTop: 50 },
  stepText: { color: '#777', fontSize: 12 },
  title: { color: '#fff', fontSize: 30, fontWeight: '900', marginBottom: 10 },

  hero: { height: height * 0.7, paddingTop: 250 },
  heroTitle: { color: PRIMARY, fontSize: 36, fontWeight: '900', textAlign: 'center' },
  heroSub: { color: '#fff', fontSize: 20, fontWeight: '700', marginTop: 10, textAlign: 'center' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  goalBox: { width: BOX_SIZE, height: BOX_SIZE, borderRadius: 18, overflow: 'hidden', marginBottom: GAP },
  goalImg: { width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 18 },
  selectedRing: { ...StyleSheet.absoluteFillObject, borderWidth: 3, borderColor: PRIMARY, borderRadius: 18 },
  goalText: { position: 'absolute', bottom: 12, color: '#fff', fontWeight: '800', alignSelf: 'center' },

  input: { backgroundColor: '#000', borderRadius: 16, padding: 18, color: '#fff', marginBottom: 10 },
  inputError: { borderColor: '#ff4d4d', borderWidth: 1 },
  error: { color: '#ff4d4d', marginBottom: 5 },

  button: { backgroundColor: PRIMARY, padding: 18, borderRadius: 18, alignItems: 'center', marginBottom: 20 },
  disabled: { opacity: 0.4 },
  buttonText: { fontSize: 18, fontWeight: '900', color: '#000' },
  backButton: { backgroundColor: '#333' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 20 },
  sideButton: { flex: 1 },

  weightContainer: { marginTop: 0 },

  weightLabel: { color: '#fff', fontWeight: '700', fontSize: 16, padding: 16 },

  genderRow: { flexDirection: 'row', gap: 14, marginBottom: 20 },
  genderImageCard: { width: '100%', height: 150, borderRadius: 22, backgroundColor: '#111', overflow: 'hidden' },
  genderBorderWrapper: { width: GENDER_CARD_WIDTH, borderRadius: 22 },
  genderBg: { flex: 1, justifyContent: 'flex-end' },
  genderOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.2)' },
  genderLabel: { alignSelf: 'center', marginBottom: 14, color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  genderSelected: { borderWidth: 3, borderColor: PRIMARY, borderRadius: 22 },

  dateInputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#000", borderRadius: 16, paddingHorizontal: 16, height: 56, marginBottom: 6 },
  datePlaceholder: { color: "#888", fontSize: 16 },
  dateSelected: { color: PRIMARY, fontWeight: "700" },
  dateErrorBorder: { borderWidth: 1, borderColor: "#ff4d4d" },
});
