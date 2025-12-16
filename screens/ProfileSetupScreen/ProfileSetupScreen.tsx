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
  SafeAreaView,
} from 'react-native';
import { supabase } from '../../lib/supabase';
import DateTimePickerModal from 'react-native-modal-datetime-picker';



const PRIMARY = '#f4ff47';
const BG = '#000';
const { width, height } = Dimensions.get('window');
const GAP = 20;
const BOX_SIZE = (width - GAP * 3) / 2;
const ITEM_HEIGHT = 50;
const DEFAULT_HEIGHT = 170;


type Gender = 'Male' | 'Female';
type Goal = 'Lose Weight' | 'Gain Weight' | 'Build Muscles' | 'Stay Fit';
const DEFAULT_WEIGHT = 70;
const goals: { label: Goal; image: any }[] = [
  { label: 'Lose Weight', image: require('../../assets/waitloss.jpeg') },
  { label: 'Gain Weight', image: require('../../assets/bulk.jpeg') },
  { label: 'Build Muscles', image: require('../../assets/build.png') },
  { label: 'Stay Fit', image: require('../../assets/leanfit.png') },
];

const TOTAL_STEPS = 4;
const GENDER_CARD_WIDTH = (width - 40 - 14) / 2;
export default function ProfileSetupScreen({ navigation }: any) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [goal, setGoal] = useState<Goal | ''>('');
  const [gender, setGender] = useState<Gender | ''>('');
  
  const [birthdate, setBirthdate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
const weightScrollRef = React.useRef<ScrollView>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
const [heightVal, setHeightVal] = useState(String(DEFAULT_HEIGHT));
const heightScrollRef = React.useRef<ScrollView>(null);

  const [weightVal, setWeightVal] = useState(String(DEFAULT_WEIGHT));

  const weights = Array.from({ length: 201 }, (_, i) => i + 30); // 30kg–230kg
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const heights = Array.from({ length: 121 }, (_, i) => i + 120); // 120cm–240cm

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
      case 3: return heightVal && weightVal;
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

  React.useEffect(() => {
  const index = heights.indexOf(DEFAULT_HEIGHT);
  if (index !== -1) {
    requestAnimationFrame(() => {
      heightScrollRef.current?.scrollTo({
        y: index * ITEM_HEIGHT,
        animated: false,
      });
    });
  }
}, []);

React.useEffect(() => {
  const index = weights.indexOf(DEFAULT_WEIGHT);
  if (index !== -1) {
    requestAnimationFrame(() => {
      weightScrollRef.current?.scrollTo({
        x: index * 70,
        animated: false,
      });
    });
  }
}, []);

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
        birthdate: birthdate.toISOString().split('T')[0],
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
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
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
            source={require('../../assets/setprofileintro.jpeg')}
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
    {/* BIRTHDATE PICKER */}
      <TouchableOpacity
        style={styles.dateCard}
        onPress={() => setShowDatePicker(true)}
      >
        <Text style={styles.dateLabel}>Select Birthdate</Text>
        <Text style={styles.dateValue}>{birthdate.toDateString()}</Text>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={showDatePicker}
        mode="date"
        maximumDate={new Date()}
        onConfirm={(date) => {
          setBirthdate(date);
          setShowDatePicker(false);
        }}
        onCancel={() => setShowDatePicker(false)}
      />
      {/* WEIGHT PICKER */}
      <View style={styles.weightContainer}>
        <Text style={styles.weightLabel}>Weight (kg)</Text>

        <View style={styles.weightScale}>
          <View style={styles.weightIndicator} />

          <ScrollView
            ref={weightScrollRef}
            horizontal
            nestedScrollEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={70}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: width / 2 - 35 }}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / 70);
              setWeightVal(String(weights[index]));
            }}
          >
            {weights.map((w) => (
              <View key={w} style={styles.weightItem}>
                <Text
                  style={[
                    styles.weightText,
                    weightVal === String(w) && styles.weightActive,
                  ]}
                >
                  {w}
                </Text>
                <View style={styles.tick} />
              </View>
            ))}
          </ScrollView>
        </View>

      </View>

      {/* HEIGHT PICKER */}
      <View style={styles.pickerCard}>
        <Text style={styles.pickerLabel}>Height (cm)</Text>

        <View style={styles.heightWheel}>
          <View style={styles.heightIndicator} />

          <ScrollView
            ref={heightScrollRef}
            nestedScrollEnabled
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            contentContainerStyle={{ paddingVertical: 75 }}
            onMomentumScrollEnd={(e) => {
              const index = Math.min(
                heights.length - 1,
                Math.max(
                  0,
                  Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT)
                )
              );
              setHeightVal(String(heights[index]));
            }}
          >
            {heights.map((h) => (
              <View key={h} style={styles.heightItem}>
                <Text
                  style={[
                    styles.heightText,
                    heightVal === String(h) && styles.heightActive,
                  ]}
                >
                  {h}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

    </>
  );

      case 4:
        return (
          <>
            <View style={styles.genderRow}>
              <View
                style={[
                  styles.genderBorderWrapper,
                  gender === 'Male' && styles.genderSelected,
                ]}
              >
                <TouchableOpacity
                  style={styles.genderImageCard}
                  onPress={() => setGender('Male')}
                  activeOpacity={0.9}
                >
                  <ImageBackground
                    source={require('../../assets/Male.jpg')}
                    style={styles.genderBg}
                  >
                    <View style={styles.genderOverlay} />
                    <Text style={styles.genderLabel}>MALE</Text>
                  </ImageBackground>
                </TouchableOpacity>
              </View>

              <View
                style={[
                  styles.genderBorderWrapper,
                  gender === 'Female' && styles.genderSelected,
                ]}
              >
                <TouchableOpacity
                  style={styles.genderImageCard}
                  onPress={() => setGender('Female')}
                  activeOpacity={0.9}
                >
                  <ImageBackground
                    source={require('../../assets/Female.jpg')}
                    style={styles.genderBg}
                  >
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
              onChangeText={(t: string) => {
                setUsername(t.toLowerCase());
                setUsernameError(null);
                setUsernameAvailable(null);
              }}
              style={(usernameAvailable === false || usernameError) && styles.inputError}
            />
            {usernameError && <Text style={styles.error}>{usernameError}</Text>}
            <Input placeholder="Phone" value={phone} onChangeText={setPhone} />
          </>
        );
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <Text style={styles.stepText}>STEP {step} OF {TOTAL_STEPS}</Text>
        <Text style={styles.title}>{titles[step - 1]}</Text>
       <ScrollView nestedScrollEnabled>
  {renderStep()}
</ScrollView>


        <View style={styles.buttonRow}>
          {step > 1 && (
            <TouchableOpacity
              style={[styles.button, styles.sideButton, styles.backButton]}
              disabled={loading}
              onPress={() => setStep(step - 1)}
            >
              <Text style={[styles.buttonText, { color: '#fff' }]}>Back</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.sideButton, !canProceed && styles.disabled]}
            disabled={!canProceed || loading}
            onPress={handleNext}
          >
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>{step === 4 ? 'Finish' : 'Next'}</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const Input = (props: any) => (
  <TextInput {...props} style={[styles.input, props.style]} placeholderTextColor="#888" />
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { flex: 1, padding: 20, paddingTop: 70 },
  stepText: { color: '#777', fontSize: 12 },
  title: { color: '#fff', fontSize: 30, fontWeight: '900', marginBottom: 10 },

  hero: { height: height * 0.7, paddingTop: 250 },
  heroTitle: { color: PRIMARY, fontSize: 36, fontWeight: '900', textAlign: 'center' },
  heroSub: { color: '#fff', fontSize: 20, fontWeight: '700', marginTop: 10, textAlign: 'center' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  goalBox: { width: BOX_SIZE, height: BOX_SIZE, borderRadius: 18, overflow: 'hidden', marginBottom: GAP },
  goalImg: { width: '100%', height: '100%'},
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)', borderRadius:18 },
  selectedRing: { ...StyleSheet.absoluteFillObject, borderWidth: 3, borderColor: PRIMARY, borderRadius:18 },
  goalText: { position: 'absolute', bottom: 12, color: '#fff', fontWeight: '800', alignSelf: 'center' },

  genderCard: { flex: 1, backgroundColor: '#111', padding: 20, borderRadius: 16, alignItems: 'center' },
  selected: { borderWidth: 2, borderColor: PRIMARY },
  genderText: { color: '#fff', fontSize: 18 },

  input: { backgroundColor: '#111', borderRadius: 16, padding: 18, color: '#fff', marginBottom: 10 },
  inputError: { borderColor: '#ff4d4d', borderWidth: 1 },
  error: { color: '#ff4d4d', marginBottom: 5 },

  dateCard: { backgroundColor: '#111', padding: 16, borderRadius: 16, marginBottom:0 },
  dateLabel: { color: '#fff', fontSize:18, fontWeight:700, marginBottom:10 },
  dateValue: { color: PRIMARY, fontWeight: '700', fontSize:12 },

  button: { backgroundColor: PRIMARY, padding: 18, borderRadius: 18, alignItems: 'center', marginBottom: 20 },
  disabled: { opacity: 0.4 },
  buttonText: { fontSize: 18, fontWeight: '900', color: '#000' },
  backButton: { backgroundColor: '#333' },

  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 20 },
  sideButton: { flex: 1 },
  weightContainer: {
  marginTop: 0,
},


weightText: {
  fontSize: 22,
  color: '#666',
  fontWeight: '600',
},

weightActive: {
  color: PRIMARY,
  fontSize: 25,
  fontWeight: '900',
},


pickerCard: {
  backgroundColor: '#111',
  borderRadius: 16,
  padding: 16,
  marginBottom: 0,
},

pickerLabel: {
  color: '#fff',
  marginBottom: 5,
  fontWeight: '700',
  fontSize:18
},

weightLabel: {
  color: '#fff',
  fontWeight: '700',
  fontSize:16,
  padding:16
},

picker: {
  color: '#fff',
},

pickerItem: {
  color: '#fff',
  fontSize: 20,
},
heightContainer: {
  alignItems: 'center',
},

heightWheel: {
  height: 200,
  width: '100%',
  backgroundColor: '#0f0f0f',
  borderRadius: 20,
  overflow: 'hidden',
},

heightItem: {
  height: 50,
  justifyContent: 'center',
  alignItems: 'center',
},

heightText: {
  fontSize: 20,
  color: '#666',
  fontWeight: '600',
},

heightActive: {
  color: PRIMARY,
  fontSize: 28,
  fontWeight: '900',
},

heightIndicator: {
  position: 'absolute',
  top: 75,
  left: 0,
  right: 0,
  height: 50,
  borderTopWidth: 1,
  borderBottomWidth: 1,
  borderColor: PRIMARY,
  zIndex: 10,
},

weightScale: {
  marginBottom:10,
  height: 100,
  backgroundColor: '#0f0f0f',
  borderRadius: 20,
  justifyContent: 'center',
},

weightItem: {
  width: 70,
  alignItems: 'center',
},

tick: {
  width: 2,
  height: 20,
  backgroundColor: '#444',
  marginTop: 6,
},

weightIndicator: {
  position: 'absolute',
  left: width / 2 - 1.5, // ⭐ exact center of screen
  top: 30,
  bottom: 10,
  width: 4,
  backgroundColor: PRIMARY,
  zIndex: 10,
},

genderRow: {
  flexDirection: 'row',
  gap: 14,
  marginBottom: 20,
},

genderImageCard: {
  width: '100%',
  height: 150,
  borderRadius: 22,
  backgroundColor: '#111',
  overflow: 'hidden',
},

genderBorderWrapper: {
  width: GENDER_CARD_WIDTH,
  borderRadius: 22,
},


genderBg: {
  flex: 1,
  justifyContent: 'flex-end',
},

genderOverlay: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(0, 0, 0, 0.2)',
},

genderLabel: {
  alignSelf: 'center',
  marginBottom: 14,
  color: '#fff',
  fontSize: 18,
  fontWeight: '900',
  letterSpacing: 1,
},

genderSelected: {
  borderWidth: 3,
  borderColor: PRIMARY,
  borderRadius:22
},

});
