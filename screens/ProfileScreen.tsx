import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Text, Button, ActivityIndicator } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { supabase } from "../lib/supabase";
import { emitter } from "../lib/emitter";
import LoadingScreen from "../components/LoadingScreen";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useToast } from "../components/ToastProvider";
import { navigationRef } from '../App'; // import your navigationRef


export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true); // full screen
  const [uploading, setUploading] = useState(false); // small overlay

  const { showToast } = useToast();


  const defaultAvatar = require("../assets/blankprofile.png");

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      Alert.alert("Error", "Unable to fetch user.");
      setLoading(false);
      return;
    }

    const { data: prof, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!error && prof) {
      setProfile({
        ...prof,
        avatar_url: prof.avatar_url?.trim() ? prof.avatar_url : null,
      });
    }

    setLoading(false);
  }

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

  async function uploadImage(uri: string, mimeType?: string) {
    try {
      setUploading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const ext = (mimeType || "image/jpeg").split("/")[1];
      const filePath = `avatars/${user.id}.${ext}`;

      const response = await fetch(uri);
      const buffer = await response.arrayBuffer();
      const uint8 = new Uint8Array(buffer);

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, uint8, {
          contentType: mimeType,
          upsert: true,
        });

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

      // Show success toast 🎉
      showToast("Image uploaded successfully 🎉");

    } catch (error) {
      console.log("Upload error:", error);
      Alert.alert("Upload failed", "Please try again.");
    } finally {
      setUploading(false);
    }
  }

  if (loading) return <LoadingScreen visible={true} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "black" }} edges={[]}>
    <View style={styles.container}>
      {/* SMALL UPLOADING SPINNER */}
      {uploading && (
        <View style={styles.uploadOverlay}>
          <ActivityIndicator size="small" color="white" />
          <Text style={{ color: "white", marginLeft: 8 }}>Uploading...</Text>
        </View>
      )}

      <View style={styles.photoContainer}>
        <Image
          source={
            profile?.avatar_url ? { uri: profile.avatar_url } : defaultAvatar
          }
          style={styles.avatar}
        />

        <TouchableOpacity style={styles.editIconP} onPress={pickImage}>
  <MaterialCommunityIcons name="pencil" size={18} color="#000000ff" />
</TouchableOpacity>

      </View>

      <Text style={styles.name}>
        {profile?.first_name} {profile?.last_name}
      </Text>

      <Button
  mode="contained"
  style={{ marginTop: 20 }}
  onPress={async () => {
    await supabase.auth.signOut();

    // Reset navigation to Intro or Auth
    if (navigationRef.isReady()) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: 'Intro' }], // or 'Auth' if you want
      });
    }
  }}
>
  Sign Out
</Button>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0d0f",
    alignItems: "center",
    paddingTop: 80,
  },

  photoContainer: { position: "relative", marginBottom: 10 },

  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#222",
  },

  editIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
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

  uploadOverlay: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    position: "absolute",
    top: 120,
    zIndex: 999,
  },
  editIconP: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: "#f4ff47",
  position: "absolute",
  bottom: 6,
  right: 6,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.2)",
  
},

snackbar: {
  backgroundColor: "rgba(29, 185, 84, 0.95)",
  borderRadius: 14,
  marginBottom: 80,  // pulls above bottom tab bar
  alignSelf: "center",
  width: "90%",
  shadowColor: "#000",
  shadowOpacity: 0.3,
  shadowOffset: { width: 0, height: 4 },
  shadowRadius: 10,
  elevation: 10,
},

});
