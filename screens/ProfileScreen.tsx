import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ImageBackground,
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

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

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
          style={styles.header}
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
            <Text style={styles.subtitle}>Lose Fat Program</Text>

            {/* GLASS STATS */}
            <BlurView intensity={50} tint="dark" style={styles.statsCard}>
              <Stat label="Height" value="180cm" />
              <Stat label="Weight" value="70kg" />
              <Stat label="Age" value="20Y" />
              <Stat label="Challenge" value="6m" />
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
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    paddingTop: 70,
    paddingBottom: 32,
  },

  photoContainer: { position: "relative", marginBottom: 10 },

  avatar: { width: 120, height: 120, borderRadius: 60 },

  editIcon: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "#f4ff47",
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  name: { fontSize: 22, color: "white", fontWeight: "700" },
  subtitle: { color: "#aaa", marginTop: 4 },

  statsCard: {
    flexDirection: "row",
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 18,
    width: "92%",
    justifyContent: "space-around",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },

  statItem: { alignItems: "center" },
  statValue: { color: "white", fontWeight: "700" },
  statLabel: { color: "#bbb", fontSize: 14 },

  section: { marginTop: 25, paddingHorizontal: 20 },
  sectionTitle: { color: "#888", marginBottom: 10 },

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
    marginTop: 30,
    marginHorizontal: 20,
    backgroundColor: "#1f1f22",
  },

  uploadOverlay: {
    position: "absolute",
    top: 110,
    alignSelf: "center",
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 10,
    borderRadius: 20,
    zIndex: 999,
  },
});
