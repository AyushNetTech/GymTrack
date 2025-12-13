import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  Dimensions,
  TextInput,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { supabase } from "../../lib/supabase";
import DateTimePicker from '@react-native-community/datetimepicker';

const PRIMARY = '#f4ff47';
const BG = '#000';

const { width, height } = Dimensions.get('window');
const GAP = 14;
const BOX_SIZE = (width - GAP * 3) / 2;

type Gender = 'Male' | 'Female' | '';
type Goal = 'Lose Weight' | 'Build Muscles' | 'Home Workout' | 'Healthy Diet';

const goals: { label: Goal; image: any }[] = [
  { label: 'Lose Weight', image: require('../../assets/workout1.jpg') },
  { label: 'Build Muscles', image: require('../../assets/workout1.jpg') },
  { label: 'Home Workout', image: require('../../assets/workout1.jpg') },
  { label: 'Healthy Diet', image: require('../../assets/workout1.jpg') },
];

const TOTAL_STEPS = 4;

export default function ProfileSetupScreen({ navigation }: any) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [goal, setGoal] = useState<Goal | ''>('');
  const [gender, setGender] = useState<Gender>('');
  const [birthdate, setBirthdate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [heightVal, setHeightVal] = useState('');
  const [weightVal, setWeightVal] = useState('');

  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  const titles = [
    'Welcome',
    'Select Your Goal',
    'Personal Information',
    'Body Details',
  ];

  /* ---------- VALIDATION ---------- */
  const canProceed = (() => {
    switch (step) {
      case 1:
        return true;
      case 2:
        return !!goal;
      case 3:
        return (
          gender &&
          firstName.trim() &&
          lastName.trim() &&
          phone.trim() &&
          username.trim() &&
          usernameAvailable === true
        );
      case 4:
        return heightVal.trim() && weightVal.trim();
      default:
        return false;
    }
  })();

  /* ---------- USERNAME CHECK ---------- */
  const checkUsername = async () => {
    if (!username.trim()) return;

    setCheckingUsername(true);
    setUsernameAvailable(null);

    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username.trim())
      .maybeSingle();

    setCheckingUsername(false);
    setUsernameAvailable(!data);
  };

  /* ---------- NAVIGATION ---------- */
  const handleNext = async () => {
    if (!canProceed) return;

    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      return;
    }

    setLoading(true);
    const { data } = await supabase.auth.getUser();
    if (!data?.user) return;

    if (usernameAvailable !== true) {
      Alert.alert('Username unavailable');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('profiles').upsert({
      id: data.user.id,
      email: data.user.email,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      username: username.trim(),
      phone: phone.trim(),
      gender,
      goal,
      birthdate: birthdate.toISOString().split('T')[0],
      height: Number(heightVal),
      weight: Number(weightVal),
    });

    setLoading(false);
    if (error) Alert.alert('Error', error.message);
    else navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  /* ---------- HEADER ---------- */
  const Header = () => (
    <View style={styles.header}>
      <View style={styles.headerRow}>
        {step > 1 ? (
          <TouchableOpacity onPress={() => setStep(step - 1)}>
            <Text style={styles.back}>‹</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 30 }} />}
        <Text
          style={[
            styles.stepText,
            { textAlign: step === 1 ? 'right' : 'left', flex: 1 },
          ]}
        >
          STEP {step} OF {TOTAL_STEPS}
        </Text>
      </View>

      <Text style={styles.title}>{titles[step - 1]}</Text>

      <View style={styles.progress}>
        <View
          style={[
            styles.progressFill,
            { width: `${(step / TOTAL_STEPS) * 100}%` },
          ]}
        />
      </View>
    </View>
  );

  /* ---------- SCREENS ---------- */
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <ImageBackground
            source={require('../../assets/intro1.png')}
            style={styles.hero}
          >
            <Text style={styles.heroTitle}>Transform Your Body</Text>
            <Text style={styles.heroSub}>Personalized fitness journey</Text>
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
            <View style={styles.genderRow}>
              {(['Male', 'Female'] as Gender[]).map(g => (
                <TouchableOpacity
                  key={g}
                  style={[styles.genderCard, gender === g && styles.selected]}
                  onPress={() => setGender(g)}
                >
                  <Text style={styles.genderText}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input placeholder="First Name" value={firstName} onChangeText={setFirstName} />
            <Input placeholder="Last Name" value={lastName} onChangeText={setLastName} />

            <Input
              placeholder="Username"
              value={username}
              onChangeText={(t: React.SetStateAction<string>) => {
                setUsername(t);
                setUsernameAvailable(null);
              }}
              onBlur={checkUsername}
              style={[
                styles.input,
                usernameAvailable === false && { borderColor: '#ff4d4d', borderWidth: 1 },
              ]}
            />

            {checkingUsername && <Text style={styles.info}>Checking username…</Text>}
            {usernameAvailable === false && <Text style={styles.error}>Username already taken</Text>}
            {usernameAvailable === true && <Text style={styles.success}>Username available</Text>}

            <Input placeholder="Phone" value={phone} onChangeText={setPhone} />
          </>
        );

      case 4:
        return (
          <>
            <TouchableOpacity style={styles.dateCard} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateLabel}>Birthdate</Text>
              <Text style={styles.dateValue}>{birthdate.toDateString()}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={birthdate}
                mode="date"
                maximumDate={new Date()}
                onChange={(_, d) => {
                  setShowDatePicker(false);
                  if (d) setBirthdate(d);
                }}
              />
            )}

            <Input placeholder="Height (cm)" value={heightVal} onChangeText={setHeightVal} />
            <Input placeholder="Weight (kg)" value={weightVal} onChangeText={setWeightVal} />
          </>
        );
    }
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={BG} />
      <View style={styles.container}>
        <Header />
        <ScrollView>{renderStep()}</ScrollView>

        <TouchableOpacity
          style={[styles.button, !canProceed && styles.disabled]}
          disabled={!canProceed || loading}
          onPress={handleNext}
        >
          {loading ? <ActivityIndicator /> :
            <Text style={styles.buttonText}>{step === TOTAL_STEPS ? 'Finish' : 'Next'}</Text>}
        </TouchableOpacity>
      </View>
    </>
  );
}

/* ---------- INPUT ---------- */
const Input = (props: any) => (
  <TextInput {...props} style={styles.input} placeholderTextColor="#888" />
);

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG, padding: 20 },
  header: { marginBottom: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  back: { color: '#fff', fontSize: 34 },
  stepText: { color: '#777', fontSize: 12 },
  title: { color: '#fff', fontSize: 30, fontWeight: '900', marginTop: 6 },
  progress: { height: 6, backgroundColor: '#222', borderRadius: 6, marginTop: 12 },
  progressFill: { height: 6, backgroundColor: PRIMARY },

  hero: { height: height * 0.7, justifyContent: 'flex-start', paddingTop: 80 },
  heroTitle: { color: '#fff', fontSize: 36, fontWeight: '900' },
  heroSub: { color: '#ccc', fontSize: 18, marginTop: 10 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  goalBox: { width: BOX_SIZE, height: BOX_SIZE, borderRadius: 18, overflow: 'hidden', marginBottom: GAP },
  goalImg: { width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  goalText: { position: 'absolute', bottom: 12, color: '#fff', fontWeight: '800', alignSelf: 'center' },
  selectedRing: { ...StyleSheet.absoluteFillObject, borderWidth: 3, borderColor: PRIMARY },

  genderRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  genderCard: { flex: 1, backgroundColor: '#111', padding: 20, borderRadius: 16, alignItems: 'center' },
  genderText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  selected: { borderWidth: 2, borderColor: PRIMARY },

  input: { backgroundColor: '#111', borderRadius: 16, padding: 18, color: '#fff', marginBottom: 10 },
  info: { color: '#aaa' },
  error: { color: '#ff4d4d' },
  success: { color: PRIMARY },

  dateCard: { backgroundColor: '#111', borderRadius: 16, padding: 18, marginBottom: 14 },
  dateLabel: { color: '#888' },
  dateValue: { color: '#fff', fontWeight: '700' },

  button: { backgroundColor: PRIMARY, paddingVertical: 18, borderRadius: 18, alignItems: 'center' },
  disabled: { opacity: 0.4 },
  buttonText: { color: '#000', fontSize: 18, fontWeight: '900' },
});
