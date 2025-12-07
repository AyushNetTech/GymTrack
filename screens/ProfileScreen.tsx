import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Text, Button } from "react-native-paper";
import { supabase } from "../lib/supabase";
import { emitter } from "../lib/emitter";
import LoadingScreen from "../components/LoadingScreen"; // ✅ import the same LoadingScreen

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const defaultAvatar = require("../assets/blankprofile.png");

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      Alert.alert("Error", "Unable to fetch user.");
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error || !profileData) {
        console.log("Error fetching profile:", error);
        setProfile(null);
      } else {
        setProfile({
          ...profileData,
          avatar_url:
            profileData.avatar_url && profileData.avatar_url.trim() !== ""
              ? profileData.avatar_url
              : null,
        });
      }
    } catch (e) {
      console.log("Unexpected error fetching profile:", e);
      setProfile(null);
    } finally {
      setLoading(false); // ✅ hide loading after fetching
    }
  }

  // ---------------------------
  // PICKER OPTIONS
  // ---------------------------
  function pickImage() {
    openGallery();
  }

  async function openGallery() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      uploadImage(asset.uri, asset.mimeType);
    }
  }

  // ---------------------------
  // UPLOAD IMAGE
  // ---------------------------
  async function uploadImage(uri: string, mimeType?: string) {
    try {
      setUploading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const realMime = mimeType || "image/jpeg";
      const fileExt = realMime.split("/")[1] || "jpg";
      const filePath = `avatars/${user.id}.${fileExt}`;

      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, uint8Array, { contentType: realMime, upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);

      setProfile((prev: any) => ({ ...prev, avatar_url: publicUrl }));

      emitter.emit("profileUpdated", publicUrl);
    } catch (err) {
      console.log("UPLOAD ERROR:", err);
      Alert.alert("Error", "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* ---------------- Loading Overlay ---------------- */}
      <LoadingScreen visible={loading || uploading} />

      {/* ---------------- Profile Content ---------------- */}
      {!loading && (
        <>
          <View style={styles.photoContainer}>
            <Image
              source={
                profile?.avatar_url ? { uri: profile.avatar_url } : defaultAvatar
              }
              style={styles.avatar}
              onError={() =>
                setProfile((prev: any) => ({ ...prev, avatar_url: null }))
              }
            />

            <TouchableOpacity style={styles.editIcon} onPress={pickImage}>
              <Text style={{ color: "#fff", fontSize: 14 }}>✎</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.name}>
            {profile?.first_name || ""} {profile?.last_name || ""}
          </Text>

          <Button
            mode="contained"
            style={{ marginTop: 20 }}
            onPress={() => supabase.auth.signOut()}
          >
            Sign Out
          </Button>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0d0f",
    alignItems: "center",
    paddingTop: 70,
  },
  photoContainer: { position: "relative" },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#222",
  },
  editIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#333",
    position: "absolute",
    bottom: 6,
    right: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontSize: 22,
    color: "white",
    fontWeight: "700",
    marginTop: 12,
  },
});
