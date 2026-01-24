import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ImageBackground,
  TextInput,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Ionicons } from "@expo/vector-icons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { RulerPicker } from "react-native-ruler-picker";
import { supabase } from "../lib/supabase";

const PRIMARY = "#f4ff47";
const BG = "#111";
const { width } = Dimensions.get("window");

type Gender = "Male" | "Female" | "";

const formatDate = (date: Date) => {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export default function EditProfileScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<Gender>("");
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [heightVal, setHeightVal] = useState("170");
  const [weightVal, setWeightVal] = useState("60");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth?.user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", auth.user.id)
      .single();

    if (data) {
      setFirstName(data.first_name || "");
      setLastName(data.last_name || "");
      setEmail(data.email || "");
      setPhone(data.phone || "");
      setGender(data.gender || "");
      setBirthdate(data.birthdate ? new Date(data.birthdate) : null);
      setHeightVal(String(data.height || 170));
      setWeightVal(String(data.weight || 60));
    }
    setLoading(false);
  }

  const validate = () => {
    if (!firstName.trim()) return "First name required";
    if (!lastName.trim()) return "Last name required";
    if (!gender) return "Select gender";
    if (!birthdate) return "Select birthdate";
    if (!phone.match(/^[0-9]{7,15}$/)) return "Enter valid phone number";
    return null;
  };

  async function saveProfile() {
    const errorMsg = validate();
    if (errorMsg) {
      Alert.alert("Validation Error", errorMsg);
      return;
    }

    try {
      setSaving(true);
      const { data: auth } = await supabase.auth.getUser();
      if (!auth?.user) return;

      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          phone,
          gender,
          birthdate: birthdate?.toISOString().split("T")[0],
          height: Number(heightVal),
          weight: Number(weightVal),
        })
        .eq("id", auth.user.id);

      if (error) throw error;

      Alert.alert("Saved", "Profile updated successfully ✅");
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return null;

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={saveProfile} disabled={saving}>
          <Text style={styles.saveText}>{saving ? "Saving..." : "Save"}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 150 }}>
        {/* INPUTS */}
        <Input label="First Name" value={firstName} onChangeText={setFirstName} />
        <Input label="Last Name" value={lastName} onChangeText={setLastName} />
        <Input label="Email" value={email} editable={false} />
        <Input
          label="Phone"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        {/* GENDER */}
        <View style={styles.genderRow}>
          {["Male", "Female"].map((g) => (
            <View
              key={g}
              style={[
                styles.genderBorder,
                gender === g && styles.genderSelected,
              ]}
            >
              <TouchableOpacity onPress={() => setGender(g as Gender)}>
                <ImageBackground
                  source={
                    g === "Male"
                      ? require("../assets/Male.jpg")
                      : require("../assets/Female.jpg")
                  }
                  style={styles.genderCard}
                >
                  <Text style={styles.genderLabel}>{g.toUpperCase()}</Text>
                </ImageBackground>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* BIRTHDATE */}
        <Text style={styles.label}>Birthdate</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={birthdate ? styles.dateSelected : styles.datePlaceholder}>
            {birthdate ? formatDate(birthdate) : "DD / MM / YYYY"}
          </Text>
          <Ionicons name="calendar-outline" size={22} color={PRIMARY} />
        </TouchableOpacity>

        <DateTimePickerModal
          isVisible={showDatePicker}
          mode="date"
          maximumDate={new Date()}
          onConfirm={(d) => {
            setBirthdate(d);
            setShowDatePicker(false);
          }}
          onCancel={() => setShowDatePicker(false)}
        />

        {/* WEIGHT */}
        <Text style={styles.label}>Weight (kg)</Text>
        <RulerPicker
          min={30}
          max={230}
          initialValue={Number(weightVal)}
          onValueChange={(v) => setWeightVal(String(v))}
          unit="kg"
          width={width - 40}
          height={120}
          indicatorColor={PRIMARY}
          valueTextStyle={{ color: PRIMARY, fontSize: 26, fontWeight: "900" }}
          unitTextStyle={{ color: "#aaa" }}
          backgroundColor="#0f0f0f"
        />

        {/* HEIGHT */}
        <Text style={styles.label}>Height (cm)</Text>
        <RulerPicker
          min={120}
          max={240}
          initialValue={Number(heightVal)}
          onValueChange={(v) => setHeightVal(String(v))}
          unit="cm"
          width={width - 40}
          height={120}
          indicatorColor={PRIMARY}
          valueTextStyle={{ color: PRIMARY, fontSize: 26, fontWeight: "900" }}
          unitTextStyle={{ color: "#aaa" }}
          backgroundColor="#0f0f0f"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- SMALL INPUT ---------- */
const Input = ({ label, ...props }: any) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      {...props}
      style={[styles.input, props.editable === false && { opacity: 0.6 }]}
      placeholderTextColor="#888"
    />
  </View>
);

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "900" },
  saveText: { color: PRIMARY, fontSize: 16, fontWeight: "900" },

  label: { color: "#aaa", marginLeft: 20, marginBottom: 6 },

  input: {
    marginHorizontal: 20,
    backgroundColor: "#000",
    borderRadius: 16,
    padding: 18,
    color: "#fff",
  },

  genderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  genderBorder: { width: "48%", borderRadius: 22 },
  genderSelected: { borderWidth: 3, borderColor: PRIMARY, borderRadius:22 },
  genderCard: {
    height: 150,
    justifyContent: "flex-end",
    borderRadius: 22,
    overflow: "hidden",
  },
  genderLabel: {
    textAlign: "center",
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 12,
  },

  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    backgroundColor: "#000",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  datePlaceholder: { color: "#888" },
  dateSelected: { color: PRIMARY, fontWeight: "700" },
});
