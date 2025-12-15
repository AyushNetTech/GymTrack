import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ImageBackground,
  useWindowDimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Text, Button, ActivityIndicator } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";

import { supabase } from "../lib/supabase";
import { emitter } from "../lib/emitter";
import LoadingScreen from "../components/LoadingScreen";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useToast } from "../components/ToastProvider";
import { navigationRef } from "../App";

function calculateAge(birthdate?: string | null) {
  if (!birthdate) return "--";

  const today = new Date();
  const birth = new Date(birthdate + "T00:00:00"); // force local time

  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age > 0 ? age : "--";
}



export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { height: screenHeight } = useWindowDimensions();
  const HEADER_HEIGHT = Math.min(
  Math.max(screenHeight * 0.42, 280), // min height
  360                               // max height
);

  const { showToast } = useToast();
  const defaultAvatar = require("../assets/blankprofile.png");

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setProfile({
      ...data,
      avatar_url: data?.avatar_url?.trim() ? data.avatar_url : null,
    });

    setLoading(false);
  }

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri, result.assets[0].mimeType);
    }
  }

  async function uploadImage(uri: string, mimeType?: string) {
    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const ext = (mimeType || "image/jpeg").split("/")[1];
      const filePath = `avatars/${user.id}.${ext}`;

      const buffer = await (await fetch(uri)).arrayBuffer();

      await supabase.storage.from("avatars").upload(
        filePath,
        new Uint8Array(buffer),
        { contentType: mimeType, upsert: true }
      );

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const publicUrl = `${data.publicUrl}?t=${Date.now()}`;

      await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);
      setProfile((p: any) => ({ ...p, avatar_url: publicUrl }));
      emitter.emit("profileUpdated", publicUrl);

      showToast("Profile image updated 🎉");
    } catch {
      Alert.alert("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <LoadingScreen visible />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0d0d0f" }} edges={[]}>
      <View style={styles.container}>

        {uploading && (
          <View style={styles.uploadOverlay}>
            <ActivityIndicator size="small" color="white" />
            <Text style={{ color: "white", marginLeft: 8 }}>Uploading...</Text>
          </View>
        )}

        {/* HEADER WITH BACKGROUND */}
        <ImageBackground
          source={require("../assets/gym1.jpg")}
          style={[styles.header, { height: HEADER_HEIGHT }]}
          imageStyle={{ opacity: 0.95 }}
        >

          <View style={styles.headerOverlay}>

            <View style={styles.photoContainer}>
              <Image
                source={profile?.avatar_url ? { uri: profile.avatar_url } : defaultAvatar}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.editIcon} onPress={pickImage}>
                <MaterialCommunityIcons name="pencil" size={18} color="#000" />
              </TouchableOpacity>
            </View>

            <Text style={styles.name}>
              {profile?.first_name} {profile?.last_name}
            </Text>
            <Text style={styles.subtitle}>
              @{profile?.username ?? "user"}
            </Text>

            {/* GLASS STATS */}
            <BlurView intensity={50} tint="dark" style={styles.statsCard}>
              <Stat
                label="Height"
                value={profile?.height ? `${profile.height} cm` : "--"}
              />

              <Stat
                label="Weight"
                value={profile?.weight ? `${profile.weight} kg` : "--"}
              />

              <Stat
                label="Age"
                value={`${calculateAge(profile?.birthdate)} Y`}
              />

              <Stat
                label="Goal"
                value={profile?.goal ?? "--"}
              />

            </BlurView>

          </View>
        </ImageBackground>

        {/* ACCOUNT */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <ProfileItem title="My Profile" icon="account-outline" />
          <ProfileItem title="Achievement" icon="trophy-outline" />
          <ProfileItem title="Activity History" icon="history" />
          <ProfileItem title="Workout Progress" icon="chart-line" />
        </View>

        <Button
          mode="contained"
          style={styles.signOut}
          onPress={async () => {
            await supabase.auth.signOut();
            navigationRef.reset({ index: 0, routes: [{ name: "Intro" }] });
          }}
        >
          Sign Out
        </Button>
      </View>
    </SafeAreaView>
  );
}

/* ---------------- COMPONENTS ---------------- */

const Stat = ({ label, value }: any) => (
  <View style={styles.statItem}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ProfileItem = ({ title, icon }: any) => (
  <TouchableOpacity style={styles.itemRow}>
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <MaterialCommunityIcons name={icon} size={22} color="#aaa" />
      <Text style={styles.itemText}>{title}</Text>
    </View>
    <MaterialCommunityIcons name="chevron-right" size={22} color="#666" />
  </TouchableOpacity>
);

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({

  container: { flex: 1 },
header: {
  borderBottomLeftRadius: 28,
  borderBottomRightRadius: 28,
  overflow: "hidden",
},



headerOverlay: {
  flex: 1, // 🔥 makes overlay fill header height
  backgroundColor: "rgba(0,0,0,0.55)",
  alignItems: "center",
  justifyContent: "center",
  paddingTop: 20,
  paddingBottom: 20,
},


  photoContainer: { position: "relative", marginBottom: 10 },
avatar: {
  marginTop:60,
  width: 110,
  height: 110,
  borderRadius: 55,
},

  editIcon: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: "#f4ff47",
    width: 32,
    height: 32,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  name: { fontSize: 22, color: "white", fontWeight: "700" },
  subtitle: { color: "#f4ff47", marginTop: 4, fontWeight:"bold", fontSize:16 },

  statsCard: {
    flexDirection: "row",
    marginTop: 14,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 18,
    width: "92%",
    justifyContent: "space-around",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.7)",
  },

  statItem: { alignItems: "center", borderRadius:18 },
  statValue: { color: "white", fontWeight: "700", borderRadius:18 },
  statLabel: { color: "#bbb", fontSize: 14, borderRadius:18 },

  section: { marginTop: 20, paddingHorizontal: 20 },
  sectionTitle: { color: "#b4b4b4ff", marginBottom: 10 },

  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1f1f22",
  },

  itemText: { color: "white", marginLeft: 14 },

  signOut: {
    marginTop: 10,
    marginHorizontal: 20,
    backgroundColor: "#ff7351ff",
    color:"#fff",
    fontWeight:"bold",
    fontSize:16
  },

  uploadOverlay: {
    position: "absolute",
    top: 100,
    alignSelf: "center",
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 10,
    borderRadius: 20,
    zIndex: 999,
  },
});
