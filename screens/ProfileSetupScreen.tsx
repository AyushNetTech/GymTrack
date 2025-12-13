import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ImageBackground,
  ActivityIndicator,
  ScrollView,
  Image,
  KeyboardTypeOptions,
} from 'react-native';
import { supabase } from '../lib/supabase';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Home: undefined;
  ProfileSetup: undefined;
};

type ProfileSetupScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ProfileSetup'>;
};

const goalsOptions = ['Lose Fat', 'Build Muscles', 'Fit Body', 'Calisthenics'] as const;

type Gender = 'Male' | 'Female' | '';
type Goal = typeof goalsOptions[number];

type InputFieldProps = {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

const InputField: React.FC<InputFieldProps> = ({
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
}) => (
  <TextInput
    style={styles.input}
    placeholder={placeholder}
    placeholderTextColor="#aaa"
    value={value}
    onChangeText={onChangeText}
    keyboardType={keyboardType}
    autoCapitalize={autoCapitalize}
  />
);

export default function ProfileSetupScreen({ navigation }: ProfileSetupScreenProps) {
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);

  const [gender, setGender] = useState<Gender>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [goal, setGoal] = useState<Goal | ''>('');
  const [birthdate, setBirthdate] = useState<Date>(new Date());
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  const canProceed =
    (step === 1) ||
    (step === 2 && gender) ||
    (step === 3 && firstName && lastName && username) ||
    (step === 4 && goal) ||
    step === 5;

  const handleNext = async () => {
    if (step < 5) {
      setStep(step + 1);
      return;
    }

    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();

    if (!userData?.user) {
      Alert.alert('Error', 'User not found');
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userData.user.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: username.trim(),
        phone: phone.trim(),
        gender,
        goal,
        birthdate: birthdate.toISOString().split('T')[0],
        height: Number(height),
        weight: Number(weight),
        email: userData.user.email,
      });

    setLoading(false);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    }
  };

  const Header: React.FC = () => (
    <View style={styles.header}>
      <Text style={styles.step}>STEP {step}/5</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(step / 5) * 100}%` }]} />
      </View>
    </View>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <Text style={styles.title}>Setup your profile</Text>
            <Text style={styles.subtitle}>
              This helps us personalize your fitness journey
            </Text>
          </>
        );
      case 2:
        return (
          <>
            <Text style={styles.title}>Select Gender</Text>
            <View style={styles.row}>
              {['Male', 'Female'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.imageCard, gender === g && styles.cardSelected]}
                  onPress={() => setGender(g as Gender)}
                >
                  <Image
                    source={require('../assets/workout1.jpg')}
                    style={styles.cardImage}
                  />
                  <Text style={styles.cardText}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        );
      case 3:
        return (
          <>
            <Text style={styles.title}>Personal Info</Text>
            <InputField placeholder="First Name" value={firstName} onChangeText={setFirstName} />
            <InputField placeholder="Last Name" value={lastName} onChangeText={setLastName} />
            <InputField placeholder="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
            <InputField placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          </>
        );
      case 4:
        return (
          <>
            <Text style={styles.title}>Your Goal</Text>
            <View style={styles.wrap}>
              {goalsOptions.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.goalCard, goal === g && styles.chipActive]}
                  onPress={() => setGoal(g)}
                >
                  <Image
                    source={require('../assets/workout1.jpg')}
                    style={styles.goalIcon}
                  />
                  <Text style={styles.chipText}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        );
      case 5:
        return (
          <>
            <Text style={styles.title}>Body Details</Text>

            <TouchableOpacity
              style={styles.dateCard}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateLabel}>Birthdate</Text>
              <Text style={styles.dateValue}>{birthdate.toDateString()}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={birthdate}
                mode="date"
                maximumDate={new Date()}
                display="spinner"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setBirthdate(selectedDate);
                }}
              />
            )}

            <InputField placeholder="Height (cm)" value={height} onChangeText={setHeight} keyboardType="numeric" />
            <InputField placeholder="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="numeric" />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <ImageBackground
      source={require('../assets/profilesetupimg2.jpg')}
      style={styles.bg}
      blurRadius={20}
    >
      <View style={styles.overlay} />
      <View style={styles.container}>
        <Header />
        <ScrollView contentContainerStyle={styles.card}>
          {renderStep()}
        </ScrollView>
        <TouchableOpacity
          style={[styles.button, !canProceed && styles.buttonDisabled]}
          onPress={handleNext}
          disabled={!canProceed || loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.buttonText}>{step === 5 ? 'Finish' : 'Continue'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)' },
  container: { flex: 1, padding: 20 },
  header: { marginBottom: 20 },
  step: { color: '#f4ff47', fontWeight: '700', marginBottom: 6 },
  progressBar: { height: 6, backgroundColor: '#222', borderRadius: 6 },
  progressFill: { height: 6, backgroundColor: '#f4ff47', borderRadius: 6 },
  card: { flexGrow: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 24, padding: 24 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', marginBottom: 10 },
  subtitle: { color: '#bbb', fontSize: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  cardSelected: { backgroundColor: '#f4ff47', borderColor: '#f4ff47' },
  cardText: { fontSize: 18, fontWeight: '700', color: '#fff' },
  input: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 16, color: '#fff', marginTop: 14 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  chipActive: { backgroundColor: '#f4ff47', borderColor: '#f4ff47' },
  chipText: { color: '#fff', fontWeight: '700' },
  button: { backgroundColor: '#f4ff47', paddingVertical: 18, borderRadius: 18, alignItems: 'center', marginTop: 14 },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { fontSize: 18, fontWeight: '800', color: '#000' },
  imageCard: { flex: 1, borderRadius: 22, padding: 16, marginHorizontal: 6, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center' },
  cardImage: { width: 80, height: 80, resizeMode: 'contain', marginBottom: 10 },
  dateCard: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, padding: 18, marginTop: 14 },
  dateLabel: { color: '#aaa', fontSize: 14 },
  dateValue: { color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 4 },
  goalCard: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 30, borderWidth: 1, borderColor: '#333', margin: 6 },
  goalIcon: { width: 22, height: 22, marginRight: 8 },
});
